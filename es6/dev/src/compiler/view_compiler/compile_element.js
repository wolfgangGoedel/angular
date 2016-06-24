import * as o from '../output/output_ast';
import { Identifiers, identifierToken } from '../identifiers';
import { InjectMethodVars } from './constants';
import { isPresent, isBlank } from 'angular2/src/facade/lang';
import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { ProviderAst, ProviderAstType } from '../template_ast';
import { CompileTokenMap, CompileTokenMetadata, CompileProviderMetadata, CompileDiDependencyMetadata } from '../compile_metadata';
import { getPropertyInView, createDiTokenExpression, injectFromViewParentInjector, convertValueToOutputAst } from './util';
import { CompileQuery, createQueryList, addQueryToTokenMap } from './compile_query';
import { CompileMethod } from './compile_method';
export class CompileNode {
    constructor(parent, view, nodeIndex, renderNode, sourceAst) {
        this.parent = parent;
        this.view = view;
        this.nodeIndex = nodeIndex;
        this.renderNode = renderNode;
        this.sourceAst = sourceAst;
    }
    isNull() { return isBlank(this.renderNode); }
    isRootElement() { return this.view != this.parent.view; }
}
export class CompileElement extends CompileNode {
    constructor(parent, view, nodeIndex, renderNode, sourceAst, component, _directives, _resolvedProvidersArray, hasViewContainer, hasEmbeddedView, references) {
        super(parent, view, nodeIndex, renderNode, sourceAst);
        this.component = component;
        this._directives = _directives;
        this._resolvedProvidersArray = _resolvedProvidersArray;
        this.hasViewContainer = hasViewContainer;
        this.hasEmbeddedView = hasEmbeddedView;
        this._compViewExpr = null;
        this._instances = new CompileTokenMap();
        this._queryCount = 0;
        this._queries = new CompileTokenMap();
        this._componentConstructorViewQueryLists = [];
        this.contentNodesByNgContentIndex = null;
        this.referenceTokens = {};
        references.forEach(ref => this.referenceTokens[ref.name] = ref.value);
        this.elementRef = o.importExpr(Identifiers.ElementRef).instantiate([this.renderNode]);
        this._instances.add(identifierToken(Identifiers.ElementRef), this.elementRef);
        this.injector = o.THIS_EXPR.callMethod('injector', [o.literal(this.nodeIndex)]);
        this._instances.add(identifierToken(Identifiers.Injector), this.injector);
        this._instances.add(identifierToken(Identifiers.Renderer), o.THIS_EXPR.prop('renderer'));
        if (this.hasViewContainer || this.hasEmbeddedView || isPresent(this.component)) {
            this._createAppElement();
        }
    }
    static createNull() {
        return new CompileElement(null, null, null, null, null, null, [], [], false, false, []);
    }
    _createAppElement() {
        var fieldName = `_appEl_${this.nodeIndex}`;
        var parentNodeIndex = this.isRootElement() ? null : this.parent.nodeIndex;
        this.view.fields.push(new o.ClassField(fieldName, o.importType(Identifiers.AppElement), [o.StmtModifier.Private]));
        var statement = o.THIS_EXPR.prop(fieldName)
            .set(o.importExpr(Identifiers.AppElement)
            .instantiate([
            o.literal(this.nodeIndex),
            o.literal(parentNodeIndex),
            o.THIS_EXPR,
            this.renderNode
        ]))
            .toStmt();
        this.view.createMethod.addStmt(statement);
        this.appElement = o.THIS_EXPR.prop(fieldName);
        this._instances.add(identifierToken(Identifiers.AppElement), this.appElement);
    }
    setComponentView(compViewExpr) {
        this._compViewExpr = compViewExpr;
        this.contentNodesByNgContentIndex =
            ListWrapper.createFixedSize(this.component.template.ngContentSelectors.length);
        for (var i = 0; i < this.contentNodesByNgContentIndex.length; i++) {
            this.contentNodesByNgContentIndex[i] = [];
        }
    }
    setEmbeddedView(embeddedView) {
        this.embeddedView = embeddedView;
        if (isPresent(embeddedView)) {
            var createTemplateRefExpr = o.importExpr(Identifiers.TemplateRef_)
                .instantiate([this.appElement, this.embeddedView.viewFactory]);
            var provider = new CompileProviderMetadata({ token: identifierToken(Identifiers.TemplateRef), useValue: createTemplateRefExpr });
            // Add TemplateRef as first provider as it does not have deps on other providers
            this._resolvedProvidersArray.unshift(new ProviderAst(provider.token, false, true, [provider], ProviderAstType.Builtin, this.sourceAst.sourceSpan));
        }
    }
    beforeChildren() {
        if (this.hasViewContainer) {
            this._instances.add(identifierToken(Identifiers.ViewContainerRef), this.appElement.prop('vcRef'));
        }
        this._resolvedProviders = new CompileTokenMap();
        this._resolvedProvidersArray.forEach(provider => this._resolvedProviders.add(provider.token, provider));
        // create all the provider instances, some in the view constructor,
        // some as getters. We rely on the fact that they are already sorted topologically.
        this._resolvedProviders.values().forEach((resolvedProvider) => {
            var providerValueExpressions = resolvedProvider.providers.map((provider) => {
                var providerValue;
                if (isPresent(provider.useExisting)) {
                    providerValue =
                        this._getDependency(resolvedProvider.providerType, new CompileDiDependencyMetadata({ token: provider.useExisting }));
                }
                else if (isPresent(provider.useFactory)) {
                    var deps = isPresent(provider.deps) ? provider.deps : provider.useFactory.diDeps;
                    var depsExpr = deps.map((dep) => this._getDependency(resolvedProvider.providerType, dep));
                    providerValue = o.importExpr(provider.useFactory).callFn(depsExpr);
                }
                else if (isPresent(provider.useClass)) {
                    var deps = isPresent(provider.deps) ? provider.deps : provider.useClass.diDeps;
                    var depsExpr = deps.map((dep) => this._getDependency(resolvedProvider.providerType, dep));
                    providerValue = o.importExpr(provider.useClass)
                        .instantiate(depsExpr, o.importType(provider.useClass));
                }
                else {
                    providerValue = convertValueToOutputAst(provider.useValue);
                }
                if (isPresent(provider.useProperty)) {
                    providerValue = providerValue.prop(provider.useProperty);
                }
                return providerValue;
            });
            var propName = `_${resolvedProvider.token.name}_${this.nodeIndex}_${this._instances.size}`;
            var instance = createProviderProperty(propName, resolvedProvider, providerValueExpressions, resolvedProvider.multiProvider, resolvedProvider.eager, this);
            this._instances.add(resolvedProvider.token, instance);
        });
        this.directiveInstances =
            this._directives.map((directive) => this._instances.get(identifierToken(directive.type)));
        for (var i = 0; i < this.directiveInstances.length; i++) {
            var directiveInstance = this.directiveInstances[i];
            var directive = this._directives[i];
            directive.queries.forEach((queryMeta) => { this._addQuery(queryMeta, directiveInstance); });
        }
        var queriesWithReads = [];
        this._resolvedProviders.values().forEach((resolvedProvider) => {
            var queriesForProvider = this._getQueriesFor(resolvedProvider.token);
            ListWrapper.addAll(queriesWithReads, queriesForProvider.map(query => new _QueryWithRead(query, resolvedProvider.token)));
        });
        StringMapWrapper.forEach(this.referenceTokens, (_, varName) => {
            var token = this.referenceTokens[varName];
            var varValue;
            if (isPresent(token)) {
                varValue = this._instances.get(token);
            }
            else {
                varValue = this.renderNode;
            }
            this.view.locals.set(varName, varValue);
            var varToken = new CompileTokenMetadata({ value: varName });
            ListWrapper.addAll(queriesWithReads, this._getQueriesFor(varToken)
                .map(query => new _QueryWithRead(query, varToken)));
        });
        queriesWithReads.forEach((queryWithRead) => {
            var value;
            if (isPresent(queryWithRead.read.identifier)) {
                // query for an identifier
                value = this._instances.get(queryWithRead.read);
            }
            else {
                // query for a reference
                var token = this.referenceTokens[queryWithRead.read.value];
                if (isPresent(token)) {
                    value = this._instances.get(token);
                }
                else {
                    value = this.elementRef;
                }
            }
            if (isPresent(value)) {
                queryWithRead.query.addValue(value, this.view);
            }
        });
        if (isPresent(this.component)) {
            var componentConstructorViewQueryList = isPresent(this.component) ? o.literalArr(this._componentConstructorViewQueryLists) :
                o.NULL_EXPR;
            var compExpr = isPresent(this.getComponent()) ? this.getComponent() : o.NULL_EXPR;
            this.view.createMethod.addStmt(this.appElement.callMethod('initComponent', [compExpr, componentConstructorViewQueryList, this._compViewExpr])
                .toStmt());
        }
    }
    afterChildren(childNodeCount) {
        this._resolvedProviders.values().forEach((resolvedProvider) => {
            // Note: afterChildren is called after recursing into children.
            // This is good so that an injector match in an element that is closer to a requesting element
            // matches first.
            var providerExpr = this._instances.get(resolvedProvider.token);
            // Note: view providers are only visible on the injector of that element.
            // This is not fully correct as the rules during codegen don't allow a directive
            // to get hold of a view provdier on the same element. We still do this semantic
            // as it simplifies our model to having only one runtime injector per element.
            var providerChildNodeCount = resolvedProvider.providerType === ProviderAstType.PrivateService ? 0 : childNodeCount;
            this.view.injectorGetMethod.addStmt(createInjectInternalCondition(this.nodeIndex, providerChildNodeCount, resolvedProvider, providerExpr));
        });
        this._queries.values().forEach((queries) => queries.forEach((query) => query.afterChildren(this.view.createMethod, this.view.updateContentQueriesMethod)));
    }
    addContentNode(ngContentIndex, nodeExpr) {
        this.contentNodesByNgContentIndex[ngContentIndex].push(nodeExpr);
    }
    getComponent() {
        return isPresent(this.component) ? this._instances.get(identifierToken(this.component.type)) :
            null;
    }
    getProviderTokens() {
        return this._resolvedProviders.values().map((resolvedProvider) => createDiTokenExpression(resolvedProvider.token));
    }
    _getQueriesFor(token) {
        var result = [];
        var currentEl = this;
        var distance = 0;
        var queries;
        while (!currentEl.isNull()) {
            queries = currentEl._queries.get(token);
            if (isPresent(queries)) {
                ListWrapper.addAll(result, queries.filter((query) => query.meta.descendants || distance <= 1));
            }
            if (currentEl._directives.length > 0) {
                distance++;
            }
            currentEl = currentEl.parent;
        }
        queries = this.view.componentView.viewQueries.get(token);
        if (isPresent(queries)) {
            ListWrapper.addAll(result, queries);
        }
        return result;
    }
    _addQuery(queryMeta, directiveInstance) {
        var propName = `_query_${queryMeta.selectors[0].name}_${this.nodeIndex}_${this._queryCount++}`;
        var queryList = createQueryList(queryMeta, directiveInstance, propName, this.view);
        var query = new CompileQuery(queryMeta, queryList, directiveInstance, this.view);
        addQueryToTokenMap(this._queries, query);
        return query;
    }
    _getLocalDependency(requestingProviderType, dep) {
        var result = null;
        // constructor content query
        if (isBlank(result) && isPresent(dep.query)) {
            result = this._addQuery(dep.query, null).queryList;
        }
        // constructor view query
        if (isBlank(result) && isPresent(dep.viewQuery)) {
            result = createQueryList(dep.viewQuery, null, `_viewQuery_${dep.viewQuery.selectors[0].name}_${this.nodeIndex}_${this._componentConstructorViewQueryLists.length}`, this.view);
            this._componentConstructorViewQueryLists.push(result);
        }
        if (isPresent(dep.token)) {
            // access builtins with special visibility
            if (isBlank(result)) {
                if (dep.token.equalsTo(identifierToken(Identifiers.ChangeDetectorRef))) {
                    if (requestingProviderType === ProviderAstType.Component) {
                        return this._compViewExpr.prop('ref');
                    }
                    else {
                        return o.THIS_EXPR.prop('ref');
                    }
                }
            }
            // access regular providers on the element
            if (isBlank(result)) {
                result = this._instances.get(dep.token);
            }
        }
        return result;
    }
    _getDependency(requestingProviderType, dep) {
        var currElement = this;
        var result = null;
        if (dep.isValue) {
            result = o.literal(dep.value);
        }
        if (isBlank(result) && !dep.isSkipSelf) {
            result = this._getLocalDependency(requestingProviderType, dep);
        }
        // check parent elements
        while (isBlank(result) && !currElement.parent.isNull()) {
            currElement = currElement.parent;
            result = currElement._getLocalDependency(ProviderAstType.PublicService, new CompileDiDependencyMetadata({ token: dep.token }));
        }
        if (isBlank(result)) {
            result = injectFromViewParentInjector(dep.token, dep.isOptional);
        }
        if (isBlank(result)) {
            result = o.NULL_EXPR;
        }
        return getPropertyInView(result, this.view, currElement.view);
    }
}
function createInjectInternalCondition(nodeIndex, childNodeCount, provider, providerExpr) {
    var indexCondition;
    if (childNodeCount > 0) {
        indexCondition = o.literal(nodeIndex)
            .lowerEquals(InjectMethodVars.requestNodeIndex)
            .and(InjectMethodVars.requestNodeIndex.lowerEquals(o.literal(nodeIndex + childNodeCount)));
    }
    else {
        indexCondition = o.literal(nodeIndex).identical(InjectMethodVars.requestNodeIndex);
    }
    return new o.IfStmt(InjectMethodVars.token.identical(createDiTokenExpression(provider.token)).and(indexCondition), [new o.ReturnStatement(providerExpr)]);
}
function createProviderProperty(propName, provider, providerValueExpressions, isMulti, isEager, compileElement) {
    var view = compileElement.view;
    var resolvedProviderValueExpr;
    var type;
    if (isMulti) {
        resolvedProviderValueExpr = o.literalArr(providerValueExpressions);
        type = new o.ArrayType(o.DYNAMIC_TYPE);
    }
    else {
        resolvedProviderValueExpr = providerValueExpressions[0];
        type = providerValueExpressions[0].type;
    }
    if (isBlank(type)) {
        type = o.DYNAMIC_TYPE;
    }
    if (isEager) {
        view.fields.push(new o.ClassField(propName, type, [o.StmtModifier.Private]));
        view.createMethod.addStmt(o.THIS_EXPR.prop(propName).set(resolvedProviderValueExpr).toStmt());
    }
    else {
        var internalField = `_${propName}`;
        view.fields.push(new o.ClassField(internalField, type, [o.StmtModifier.Private]));
        var getter = new CompileMethod(view);
        getter.resetDebugInfo(compileElement.nodeIndex, compileElement.sourceAst);
        // Note: Equals is important for JS so that it also checks the undefined case!
        getter.addStmt(new o.IfStmt(o.THIS_EXPR.prop(internalField).isBlank(), [o.THIS_EXPR.prop(internalField).set(resolvedProviderValueExpr).toStmt()]));
        getter.addStmt(new o.ReturnStatement(o.THIS_EXPR.prop(internalField)));
        view.getters.push(new o.ClassGetter(propName, getter.finish(), type));
    }
    return o.THIS_EXPR.prop(propName);
}
class _QueryWithRead {
    constructor(query, match) {
        this.query = query;
        this.read = isPresent(query.meta.read) ? query.meta.read : match;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZV9lbGVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1YNWhldlBwNC50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3ZpZXdfY29tcGlsZXIvY29tcGlsZV9lbGVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEtBQUssQ0FBQyxNQUFNLHNCQUFzQjtPQUNsQyxFQUFDLFdBQVcsRUFBRSxlQUFlLEVBQUMsTUFBTSxnQkFBZ0I7T0FDcEQsRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGFBQWE7T0FFckMsRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFDLE1BQU0sMEJBQTBCO09BQ3BELEVBQUMsV0FBVyxFQUFFLGdCQUFnQixFQUFDLE1BQU0sZ0NBQWdDO09BQ3JFLEVBQWMsV0FBVyxFQUFFLGVBQWUsRUFBZSxNQUFNLGlCQUFpQjtPQUNoRixFQUNMLGVBQWUsRUFFZixvQkFBb0IsRUFFcEIsdUJBQXVCLEVBQ3ZCLDJCQUEyQixFQUc1QixNQUFNLHFCQUFxQjtPQUNyQixFQUNMLGlCQUFpQixFQUNqQix1QkFBdUIsRUFDdkIsNEJBQTRCLEVBQzVCLHVCQUF1QixFQUN4QixNQUFNLFFBQVE7T0FDUixFQUFDLFlBQVksRUFBRSxlQUFlLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSxpQkFBaUI7T0FDMUUsRUFBQyxhQUFhLEVBQUMsTUFBTSxrQkFBa0I7QUFFOUM7SUFDRSxZQUFtQixNQUFzQixFQUFTLElBQWlCLEVBQVMsU0FBaUIsRUFDMUUsVUFBd0IsRUFBUyxTQUFzQjtRQUR2RCxXQUFNLEdBQU4sTUFBTSxDQUFnQjtRQUFTLFNBQUksR0FBSixJQUFJLENBQWE7UUFBUyxjQUFTLEdBQVQsU0FBUyxDQUFRO1FBQzFFLGVBQVUsR0FBVixVQUFVLENBQWM7UUFBUyxjQUFTLEdBQVQsU0FBUyxDQUFhO0lBQUcsQ0FBQztJQUU5RSxNQUFNLEtBQWMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXRELGFBQWEsS0FBYyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDcEUsQ0FBQztBQUVELG9DQUFvQyxXQUFXO0lBcUI3QyxZQUFZLE1BQXNCLEVBQUUsSUFBaUIsRUFBRSxTQUFpQixFQUM1RCxVQUF3QixFQUFFLFNBQXNCLEVBQ3pDLFNBQW1DLEVBQ2xDLFdBQXVDLEVBQ3ZDLHVCQUFzQyxFQUFTLGdCQUF5QixFQUN6RSxlQUF3QixFQUFFLFVBQTBCO1FBQ3JFLE1BQU0sTUFBTSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBSnJDLGNBQVMsR0FBVCxTQUFTLENBQTBCO1FBQ2xDLGdCQUFXLEdBQVgsV0FBVyxDQUE0QjtRQUN2Qyw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQWU7UUFBUyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQVM7UUFDekUsb0JBQWUsR0FBZixlQUFlLENBQVM7UUFyQm5DLGtCQUFhLEdBQWlCLElBQUksQ0FBQztRQUluQyxlQUFVLEdBQUcsSUFBSSxlQUFlLEVBQWdCLENBQUM7UUFHakQsZ0JBQVcsR0FBRyxDQUFDLENBQUM7UUFDaEIsYUFBUSxHQUFHLElBQUksZUFBZSxFQUFrQixDQUFDO1FBQ2pELHdDQUFtQyxHQUFtQixFQUFFLENBQUM7UUFFMUQsaUNBQTRCLEdBQTBCLElBQUksQ0FBQztRQVloRSxJQUFJLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQztRQUMxQixVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFdEUsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUN0RixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5RSxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoRixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxRSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDekYsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixJQUFJLElBQUksQ0FBQyxlQUFlLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0UsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDM0IsQ0FBQztJQUNILENBQUM7SUF0Q0QsT0FBTyxVQUFVO1FBQ2YsTUFBTSxDQUFDLElBQUksY0FBYyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMxRixDQUFDO0lBc0NPLGlCQUFpQjtRQUN2QixJQUFJLFNBQVMsR0FBRyxVQUFVLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMzQyxJQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQzFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxFQUMvQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xFLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQzthQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDO2FBQy9CLFdBQVcsQ0FBQztZQUNYLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUN6QixDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQztZQUMxQixDQUFDLENBQUMsU0FBUztZQUNYLElBQUksQ0FBQyxVQUFVO1NBQ2hCLENBQUMsQ0FBQzthQUNYLE1BQU0sRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxZQUEwQjtRQUN6QyxJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztRQUNsQyxJQUFJLENBQUMsNEJBQTRCO1lBQzdCLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkYsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDbEUsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QyxDQUFDO0lBQ0gsQ0FBQztJQUVELGVBQWUsQ0FBQyxZQUF5QjtRQUN2QyxJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUNqQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLElBQUkscUJBQXFCLEdBQ3JCLENBQUMsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQztpQkFDakMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDdkUsSUFBSSxRQUFRLEdBQUcsSUFBSSx1QkFBdUIsQ0FDdEMsRUFBQyxLQUFLLEVBQUUsZUFBZSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsRUFBRSxRQUFRLEVBQUUscUJBQXFCLEVBQUMsQ0FBQyxDQUFDO1lBQ3hGLGdGQUFnRjtZQUNoRixJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUN2QyxlQUFlLENBQUMsT0FBTyxFQUN2QixJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDbkYsQ0FBQztJQUNILENBQUM7SUFFRCxjQUFjO1FBQ1osRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLEVBQzdDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLGVBQWUsRUFBZSxDQUFDO1FBQzdELElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsUUFBUSxJQUNKLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBRWhHLG1FQUFtRTtRQUNuRSxtRkFBbUY7UUFDbkYsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLGdCQUFnQjtZQUN4RCxJQUFJLHdCQUF3QixHQUFHLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRO2dCQUNyRSxJQUFJLGFBQTJCLENBQUM7Z0JBQ2hDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNwQyxhQUFhO3dCQUNULElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUM3QixJQUFJLDJCQUEyQixDQUFDLEVBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFGLENBQUM7Z0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMxQyxJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7b0JBQ2pGLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDMUYsYUFBYSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDckUsQ0FBQztnQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3hDLElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztvQkFDL0UsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUMxRixhQUFhLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO3lCQUMxQixXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzlFLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ04sYUFBYSxHQUFHLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDN0QsQ0FBQztnQkFDRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDcEMsYUFBYSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUMzRCxDQUFDO2dCQUNELE1BQU0sQ0FBQyxhQUFhLENBQUM7WUFDdkIsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLFFBQVEsR0FBRyxJQUFJLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzNGLElBQUksUUFBUSxHQUNSLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSx3QkFBd0IsRUFDcEQsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLGdCQUFnQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN6RixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsa0JBQWtCO1lBQ25CLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlGLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3hELElBQUksaUJBQWlCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25ELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlGLENBQUM7UUFDRCxJQUFJLGdCQUFnQixHQUFxQixFQUFFLENBQUM7UUFDNUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLGdCQUFnQjtZQUN4RCxJQUFJLGtCQUFrQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckUsV0FBVyxDQUFDLE1BQU0sQ0FDZCxnQkFBZ0IsRUFDaEIsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxJQUFJLGNBQWMsQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFGLENBQUMsQ0FBQyxDQUFDO1FBQ0gsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTztZQUN4RCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzFDLElBQUksUUFBUSxDQUFDO1lBQ2IsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckIsUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hDLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUM3QixDQUFDO1lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN4QyxJQUFJLFFBQVEsR0FBRyxJQUFJLG9CQUFvQixDQUFDLEVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBQyxDQUFDLENBQUM7WUFDMUQsV0FBVyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQztpQkFDeEIsR0FBRyxDQUFDLEtBQUssSUFBSSxJQUFJLGNBQWMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9GLENBQUMsQ0FBQyxDQUFDO1FBQ0gsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsYUFBYTtZQUNyQyxJQUFJLEtBQW1CLENBQUM7WUFDeEIsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3QywwQkFBMEI7Z0JBQzFCLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEQsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLHdCQUF3QjtnQkFDeEIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMzRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNyQixLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3JDLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ04sS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBQzFCLENBQUM7WUFDSCxDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckIsYUFBYSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqRCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixJQUFJLGlDQUFpQyxHQUNqQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxDQUFDO2dCQUN0RCxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQzVDLElBQUksUUFBUSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUNsRixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQzFCLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUNQLGVBQWUsRUFDZixDQUFDLFFBQVEsRUFBRSxpQ0FBaUMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7aUJBQ2hGLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDckIsQ0FBQztJQUNILENBQUM7SUFFRCxhQUFhLENBQUMsY0FBc0I7UUFDbEMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLGdCQUFnQjtZQUN4RCwrREFBK0Q7WUFDL0QsOEZBQThGO1lBQzlGLGlCQUFpQjtZQUNqQixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvRCx5RUFBeUU7WUFDekUsZ0ZBQWdGO1lBQ2hGLGdGQUFnRjtZQUNoRiw4RUFBOEU7WUFDOUUsSUFBSSxzQkFBc0IsR0FDdEIsZ0JBQWdCLENBQUMsWUFBWSxLQUFLLGVBQWUsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxHQUFHLGNBQWMsQ0FBQztZQUMxRixJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FDN0QsSUFBSSxDQUFDLFNBQVMsRUFBRSxzQkFBc0IsRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQy9FLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLENBQzFCLENBQUMsT0FBTyxLQUNKLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBRUQsY0FBYyxDQUFDLGNBQXNCLEVBQUUsUUFBc0I7UUFDM0QsSUFBSSxDQUFDLDRCQUE0QixDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRUQsWUFBWTtRQUNWLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pELElBQUksQ0FBQztJQUMxQyxDQUFDO0lBRUQsaUJBQWlCO1FBQ2YsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQ3ZDLENBQUMsZ0JBQWdCLEtBQUssdUJBQXVCLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBRU8sY0FBYyxDQUFDLEtBQTJCO1FBQ2hELElBQUksTUFBTSxHQUFtQixFQUFFLENBQUM7UUFDaEMsSUFBSSxTQUFTLEdBQW1CLElBQUksQ0FBQztRQUNyQyxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDakIsSUFBSSxPQUF1QixDQUFDO1FBQzVCLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztZQUMzQixPQUFPLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDeEMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkIsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQ04sT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RixDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckMsUUFBUSxFQUFFLENBQUM7WUFDYixDQUFDO1lBQ0QsU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDL0IsQ0FBQztRQUNELE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVPLFNBQVMsQ0FBQyxTQUErQixFQUMvQixpQkFBK0I7UUFDL0MsSUFBSSxRQUFRLEdBQUcsVUFBVSxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDO1FBQy9GLElBQUksU0FBUyxHQUFHLGVBQWUsQ0FBQyxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRixJQUFJLEtBQUssR0FBRyxJQUFJLFlBQVksQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRU8sbUJBQW1CLENBQUMsc0JBQXVDLEVBQ3ZDLEdBQWdDO1FBQzFELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQztRQUNsQiw0QkFBNEI7UUFDNUIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ3JELENBQUM7UUFFRCx5QkFBeUI7UUFDekIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hELE1BQU0sR0FBRyxlQUFlLENBQ3BCLEdBQUcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUNuQixjQUFjLEdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxNQUFNLEVBQUUsRUFDcEgsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2YsSUFBSSxDQUFDLG1DQUFtQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsMENBQTBDO1lBQzFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdkUsRUFBRSxDQUFDLENBQUMsc0JBQXNCLEtBQUssZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBQ3pELE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDeEMsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDTixNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ2pDLENBQUM7Z0JBQ0gsQ0FBQztZQUNILENBQUM7WUFDRCwwQ0FBMEM7WUFDMUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEIsTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMxQyxDQUFDO1FBQ0gsQ0FBQztRQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVPLGNBQWMsQ0FBQyxzQkFBdUMsRUFDdkMsR0FBZ0M7UUFDckQsSUFBSSxXQUFXLEdBQW1CLElBQUksQ0FBQztRQUN2QyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDbEIsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDaEIsTUFBTSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUN2QyxNQUFNLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLHNCQUFzQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2pFLENBQUM7UUFDRCx3QkFBd0I7UUFDeEIsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7WUFDdkQsV0FBVyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUM7WUFDakMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQUMsYUFBYSxFQUM3QixJQUFJLDJCQUEyQixDQUFDLEVBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEcsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsTUFBTSxHQUFHLDRCQUE0QixDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLE1BQU0sR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ3ZCLENBQUM7UUFDRCxNQUFNLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hFLENBQUM7QUFDSCxDQUFDO0FBRUQsdUNBQXVDLFNBQWlCLEVBQUUsY0FBc0IsRUFDekMsUUFBcUIsRUFDckIsWUFBMEI7SUFDL0QsSUFBSSxjQUFjLENBQUM7SUFDbkIsRUFBRSxDQUFDLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsY0FBYyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO2FBQ2YsV0FBVyxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDO2FBQzlDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQzlDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixjQUFjLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FDZixnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFDN0YsQ0FBQyxJQUFJLENBQUMsQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdDLENBQUM7QUFFRCxnQ0FBZ0MsUUFBZ0IsRUFBRSxRQUFxQixFQUN2Qyx3QkFBd0MsRUFBRSxPQUFnQixFQUMxRCxPQUFnQixFQUFFLGNBQThCO0lBQzlFLElBQUksSUFBSSxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUM7SUFDL0IsSUFBSSx5QkFBeUIsQ0FBQztJQUM5QixJQUFJLElBQUksQ0FBQztJQUNULEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDWix5QkFBeUIsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDbkUsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ04seUJBQXlCLEdBQUcsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEQsSUFBSSxHQUFHLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUMxQyxDQUFDO0lBQ0QsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQixJQUFJLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQztJQUN4QixDQUFDO0lBQ0QsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNaLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0UsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUNoRyxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixJQUFJLGFBQWEsR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDO1FBQ25DLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEYsSUFBSSxNQUFNLEdBQUcsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMxRSw4RUFBOEU7UUFDOUUsTUFBTSxDQUFDLE9BQU8sQ0FDVixJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQ3pDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0YsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUNELE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBRUQ7SUFFRSxZQUFtQixLQUFtQixFQUFFLEtBQTJCO1FBQWhELFVBQUssR0FBTCxLQUFLLENBQWM7UUFDcEMsSUFBSSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7SUFDbkUsQ0FBQztBQUNILENBQUM7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIG8gZnJvbSAnLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtJZGVudGlmaWVycywgaWRlbnRpZmllclRva2VufSBmcm9tICcuLi9pZGVudGlmaWVycyc7XG5pbXBvcnQge0luamVjdE1ldGhvZFZhcnN9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Q29tcGlsZVZpZXd9IGZyb20gJy4vY29tcGlsZV92aWV3JztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7VGVtcGxhdGVBc3QsIFByb3ZpZGVyQXN0LCBQcm92aWRlckFzdFR5cGUsIFJlZmVyZW5jZUFzdH0gZnJvbSAnLi4vdGVtcGxhdGVfYXN0JztcbmltcG9ydCB7XG4gIENvbXBpbGVUb2tlbk1hcCxcbiAgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICBDb21waWxlVG9rZW5NZXRhZGF0YSxcbiAgQ29tcGlsZVF1ZXJ5TWV0YWRhdGEsXG4gIENvbXBpbGVQcm92aWRlck1ldGFkYXRhLFxuICBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEsXG4gIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEsXG4gIENvbXBpbGVUeXBlTWV0YWRhdGEsXG59IGZyb20gJy4uL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0IHtcbiAgZ2V0UHJvcGVydHlJblZpZXcsXG4gIGNyZWF0ZURpVG9rZW5FeHByZXNzaW9uLFxuICBpbmplY3RGcm9tVmlld1BhcmVudEluamVjdG9yLFxuICBjb252ZXJ0VmFsdWVUb091dHB1dEFzdFxufSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtDb21waWxlUXVlcnksIGNyZWF0ZVF1ZXJ5TGlzdCwgYWRkUXVlcnlUb1Rva2VuTWFwfSBmcm9tICcuL2NvbXBpbGVfcXVlcnknO1xuaW1wb3J0IHtDb21waWxlTWV0aG9kfSBmcm9tICcuL2NvbXBpbGVfbWV0aG9kJztcblxuZXhwb3J0IGNsYXNzIENvbXBpbGVOb2RlIHtcbiAgY29uc3RydWN0b3IocHVibGljIHBhcmVudDogQ29tcGlsZUVsZW1lbnQsIHB1YmxpYyB2aWV3OiBDb21waWxlVmlldywgcHVibGljIG5vZGVJbmRleDogbnVtYmVyLFxuICAgICAgICAgICAgICBwdWJsaWMgcmVuZGVyTm9kZTogby5FeHByZXNzaW9uLCBwdWJsaWMgc291cmNlQXN0OiBUZW1wbGF0ZUFzdCkge31cblxuICBpc051bGwoKTogYm9vbGVhbiB7IHJldHVybiBpc0JsYW5rKHRoaXMucmVuZGVyTm9kZSk7IH1cblxuICBpc1Jvb3RFbGVtZW50KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy52aWV3ICE9IHRoaXMucGFyZW50LnZpZXc7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVFbGVtZW50IGV4dGVuZHMgQ29tcGlsZU5vZGUge1xuICBzdGF0aWMgY3JlYXRlTnVsbCgpOiBDb21waWxlRWxlbWVudCB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlRWxlbWVudChudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBbXSwgW10sIGZhbHNlLCBmYWxzZSwgW10pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tcFZpZXdFeHByOiBvLkV4cHJlc3Npb24gPSBudWxsO1xuICBwdWJsaWMgYXBwRWxlbWVudDogby5SZWFkUHJvcEV4cHI7XG4gIHB1YmxpYyBlbGVtZW50UmVmOiBvLkV4cHJlc3Npb247XG4gIHB1YmxpYyBpbmplY3Rvcjogby5FeHByZXNzaW9uO1xuICBwcml2YXRlIF9pbnN0YW5jZXMgPSBuZXcgQ29tcGlsZVRva2VuTWFwPG8uRXhwcmVzc2lvbj4oKTtcbiAgcHJpdmF0ZSBfcmVzb2x2ZWRQcm92aWRlcnM6IENvbXBpbGVUb2tlbk1hcDxQcm92aWRlckFzdD47XG5cbiAgcHJpdmF0ZSBfcXVlcnlDb3VudCA9IDA7XG4gIHByaXZhdGUgX3F1ZXJpZXMgPSBuZXcgQ29tcGlsZVRva2VuTWFwPENvbXBpbGVRdWVyeVtdPigpO1xuICBwcml2YXRlIF9jb21wb25lbnRDb25zdHJ1Y3RvclZpZXdRdWVyeUxpc3RzOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuXG4gIHB1YmxpYyBjb250ZW50Tm9kZXNCeU5nQ29udGVudEluZGV4OiBBcnJheTxvLkV4cHJlc3Npb24+W10gPSBudWxsO1xuICBwdWJsaWMgZW1iZWRkZWRWaWV3OiBDb21waWxlVmlldztcbiAgcHVibGljIGRpcmVjdGl2ZUluc3RhbmNlczogby5FeHByZXNzaW9uW107XG4gIHB1YmxpYyByZWZlcmVuY2VUb2tlbnM6IHtba2V5OiBzdHJpbmddOiBDb21waWxlVG9rZW5NZXRhZGF0YX07XG5cbiAgY29uc3RydWN0b3IocGFyZW50OiBDb21waWxlRWxlbWVudCwgdmlldzogQ29tcGlsZVZpZXcsIG5vZGVJbmRleDogbnVtYmVyLFxuICAgICAgICAgICAgICByZW5kZXJOb2RlOiBvLkV4cHJlc3Npb24sIHNvdXJjZUFzdDogVGVtcGxhdGVBc3QsXG4gICAgICAgICAgICAgIHB1YmxpYyBjb21wb25lbnQ6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10sXG4gICAgICAgICAgICAgIHByaXZhdGUgX3Jlc29sdmVkUHJvdmlkZXJzQXJyYXk6IFByb3ZpZGVyQXN0W10sIHB1YmxpYyBoYXNWaWV3Q29udGFpbmVyOiBib29sZWFuLFxuICAgICAgICAgICAgICBwdWJsaWMgaGFzRW1iZWRkZWRWaWV3OiBib29sZWFuLCByZWZlcmVuY2VzOiBSZWZlcmVuY2VBc3RbXSkge1xuICAgIHN1cGVyKHBhcmVudCwgdmlldywgbm9kZUluZGV4LCByZW5kZXJOb2RlLCBzb3VyY2VBc3QpO1xuICAgIHRoaXMucmVmZXJlbmNlVG9rZW5zID0ge307XG4gICAgcmVmZXJlbmNlcy5mb3JFYWNoKHJlZiA9PiB0aGlzLnJlZmVyZW5jZVRva2Vuc1tyZWYubmFtZV0gPSByZWYudmFsdWUpO1xuXG4gICAgdGhpcy5lbGVtZW50UmVmID0gby5pbXBvcnRFeHByKElkZW50aWZpZXJzLkVsZW1lbnRSZWYpLmluc3RhbnRpYXRlKFt0aGlzLnJlbmRlck5vZGVdKTtcbiAgICB0aGlzLl9pbnN0YW5jZXMuYWRkKGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5FbGVtZW50UmVmKSwgdGhpcy5lbGVtZW50UmVmKTtcbiAgICB0aGlzLmluamVjdG9yID0gby5USElTX0VYUFIuY2FsbE1ldGhvZCgnaW5qZWN0b3InLCBbby5saXRlcmFsKHRoaXMubm9kZUluZGV4KV0pO1xuICAgIHRoaXMuX2luc3RhbmNlcy5hZGQoaWRlbnRpZmllclRva2VuKElkZW50aWZpZXJzLkluamVjdG9yKSwgdGhpcy5pbmplY3Rvcik7XG4gICAgdGhpcy5faW5zdGFuY2VzLmFkZChpZGVudGlmaWVyVG9rZW4oSWRlbnRpZmllcnMuUmVuZGVyZXIpLCBvLlRISVNfRVhQUi5wcm9wKCdyZW5kZXJlcicpKTtcbiAgICBpZiAodGhpcy5oYXNWaWV3Q29udGFpbmVyIHx8IHRoaXMuaGFzRW1iZWRkZWRWaWV3IHx8IGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkpIHtcbiAgICAgIHRoaXMuX2NyZWF0ZUFwcEVsZW1lbnQoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVBcHBFbGVtZW50KCkge1xuICAgIHZhciBmaWVsZE5hbWUgPSBgX2FwcEVsXyR7dGhpcy5ub2RlSW5kZXh9YDtcbiAgICB2YXIgcGFyZW50Tm9kZUluZGV4ID0gdGhpcy5pc1Jvb3RFbGVtZW50KCkgPyBudWxsIDogdGhpcy5wYXJlbnQubm9kZUluZGV4O1xuICAgIHRoaXMudmlldy5maWVsZHMucHVzaChuZXcgby5DbGFzc0ZpZWxkKGZpZWxkTmFtZSwgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLkFwcEVsZW1lbnQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtvLlN0bXRNb2RpZmllci5Qcml2YXRlXSkpO1xuICAgIHZhciBzdGF0ZW1lbnQgPSBvLlRISVNfRVhQUi5wcm9wKGZpZWxkTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZXQoby5pbXBvcnRFeHByKElkZW50aWZpZXJzLkFwcEVsZW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaW5zdGFudGlhdGUoW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWwodGhpcy5ub2RlSW5kZXgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWwocGFyZW50Tm9kZUluZGV4KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5USElTX0VYUFIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyTm9kZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAudG9TdG10KCk7XG4gICAgdGhpcy52aWV3LmNyZWF0ZU1ldGhvZC5hZGRTdG10KHN0YXRlbWVudCk7XG4gICAgdGhpcy5hcHBFbGVtZW50ID0gby5USElTX0VYUFIucHJvcChmaWVsZE5hbWUpO1xuICAgIHRoaXMuX2luc3RhbmNlcy5hZGQoaWRlbnRpZmllclRva2VuKElkZW50aWZpZXJzLkFwcEVsZW1lbnQpLCB0aGlzLmFwcEVsZW1lbnQpO1xuICB9XG5cbiAgc2V0Q29tcG9uZW50Vmlldyhjb21wVmlld0V4cHI6IG8uRXhwcmVzc2lvbikge1xuICAgIHRoaXMuX2NvbXBWaWV3RXhwciA9IGNvbXBWaWV3RXhwcjtcbiAgICB0aGlzLmNvbnRlbnROb2Rlc0J5TmdDb250ZW50SW5kZXggPVxuICAgICAgICBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUodGhpcy5jb21wb25lbnQudGVtcGxhdGUubmdDb250ZW50U2VsZWN0b3JzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRlbnROb2Rlc0J5TmdDb250ZW50SW5kZXgubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuY29udGVudE5vZGVzQnlOZ0NvbnRlbnRJbmRleFtpXSA9IFtdO1xuICAgIH1cbiAgfVxuXG4gIHNldEVtYmVkZGVkVmlldyhlbWJlZGRlZFZpZXc6IENvbXBpbGVWaWV3KSB7XG4gICAgdGhpcy5lbWJlZGRlZFZpZXcgPSBlbWJlZGRlZFZpZXc7XG4gICAgaWYgKGlzUHJlc2VudChlbWJlZGRlZFZpZXcpKSB7XG4gICAgICB2YXIgY3JlYXRlVGVtcGxhdGVSZWZFeHByID1cbiAgICAgICAgICBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuVGVtcGxhdGVSZWZfKVxuICAgICAgICAgICAgICAuaW5zdGFudGlhdGUoW3RoaXMuYXBwRWxlbWVudCwgdGhpcy5lbWJlZGRlZFZpZXcudmlld0ZhY3RvcnldKTtcbiAgICAgIHZhciBwcm92aWRlciA9IG5ldyBDb21waWxlUHJvdmlkZXJNZXRhZGF0YShcbiAgICAgICAgICB7dG9rZW46IGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5UZW1wbGF0ZVJlZiksIHVzZVZhbHVlOiBjcmVhdGVUZW1wbGF0ZVJlZkV4cHJ9KTtcbiAgICAgIC8vIEFkZCBUZW1wbGF0ZVJlZiBhcyBmaXJzdCBwcm92aWRlciBhcyBpdCBkb2VzIG5vdCBoYXZlIGRlcHMgb24gb3RoZXIgcHJvdmlkZXJzXG4gICAgICB0aGlzLl9yZXNvbHZlZFByb3ZpZGVyc0FycmF5LnVuc2hpZnQobmV3IFByb3ZpZGVyQXN0KHByb3ZpZGVyLnRva2VuLCBmYWxzZSwgdHJ1ZSwgW3Byb3ZpZGVyXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUHJvdmlkZXJBc3RUeXBlLkJ1aWx0aW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc291cmNlQXN0LnNvdXJjZVNwYW4pKTtcbiAgICB9XG4gIH1cblxuICBiZWZvcmVDaGlsZHJlbigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYXNWaWV3Q29udGFpbmVyKSB7XG4gICAgICB0aGlzLl9pbnN0YW5jZXMuYWRkKGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5WaWV3Q29udGFpbmVyUmVmKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LnByb3AoJ3ZjUmVmJykpO1xuICAgIH1cblxuICAgIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzID0gbmV3IENvbXBpbGVUb2tlbk1hcDxQcm92aWRlckFzdD4oKTtcbiAgICB0aGlzLl9yZXNvbHZlZFByb3ZpZGVyc0FycmF5LmZvckVhY2gocHJvdmlkZXIgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzLmFkZChwcm92aWRlci50b2tlbiwgcHJvdmlkZXIpKTtcblxuICAgIC8vIGNyZWF0ZSBhbGwgdGhlIHByb3ZpZGVyIGluc3RhbmNlcywgc29tZSBpbiB0aGUgdmlldyBjb25zdHJ1Y3RvcixcbiAgICAvLyBzb21lIGFzIGdldHRlcnMuIFdlIHJlbHkgb24gdGhlIGZhY3QgdGhhdCB0aGV5IGFyZSBhbHJlYWR5IHNvcnRlZCB0b3BvbG9naWNhbGx5LlxuICAgIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzLnZhbHVlcygpLmZvckVhY2goKHJlc29sdmVkUHJvdmlkZXIpID0+IHtcbiAgICAgIHZhciBwcm92aWRlclZhbHVlRXhwcmVzc2lvbnMgPSByZXNvbHZlZFByb3ZpZGVyLnByb3ZpZGVycy5tYXAoKHByb3ZpZGVyKSA9PiB7XG4gICAgICAgIHZhciBwcm92aWRlclZhbHVlOiBvLkV4cHJlc3Npb247XG4gICAgICAgIGlmIChpc1ByZXNlbnQocHJvdmlkZXIudXNlRXhpc3RpbmcpKSB7XG4gICAgICAgICAgcHJvdmlkZXJWYWx1ZSA9XG4gICAgICAgICAgICAgIHRoaXMuX2dldERlcGVuZGVuY3kocmVzb2x2ZWRQcm92aWRlci5wcm92aWRlclR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSh7dG9rZW46IHByb3ZpZGVyLnVzZUV4aXN0aW5nfSkpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VGYWN0b3J5KSkge1xuICAgICAgICAgIHZhciBkZXBzID0gaXNQcmVzZW50KHByb3ZpZGVyLmRlcHMpID8gcHJvdmlkZXIuZGVwcyA6IHByb3ZpZGVyLnVzZUZhY3RvcnkuZGlEZXBzO1xuICAgICAgICAgIHZhciBkZXBzRXhwciA9IGRlcHMubWFwKChkZXApID0+IHRoaXMuX2dldERlcGVuZGVuY3kocmVzb2x2ZWRQcm92aWRlci5wcm92aWRlclR5cGUsIGRlcCkpO1xuICAgICAgICAgIHByb3ZpZGVyVmFsdWUgPSBvLmltcG9ydEV4cHIocHJvdmlkZXIudXNlRmFjdG9yeSkuY2FsbEZuKGRlcHNFeHByKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQocHJvdmlkZXIudXNlQ2xhc3MpKSB7XG4gICAgICAgICAgdmFyIGRlcHMgPSBpc1ByZXNlbnQocHJvdmlkZXIuZGVwcykgPyBwcm92aWRlci5kZXBzIDogcHJvdmlkZXIudXNlQ2xhc3MuZGlEZXBzO1xuICAgICAgICAgIHZhciBkZXBzRXhwciA9IGRlcHMubWFwKChkZXApID0+IHRoaXMuX2dldERlcGVuZGVuY3kocmVzb2x2ZWRQcm92aWRlci5wcm92aWRlclR5cGUsIGRlcCkpO1xuICAgICAgICAgIHByb3ZpZGVyVmFsdWUgPSBvLmltcG9ydEV4cHIocHJvdmlkZXIudXNlQ2xhc3MpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaW5zdGFudGlhdGUoZGVwc0V4cHIsIG8uaW1wb3J0VHlwZShwcm92aWRlci51c2VDbGFzcykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByb3ZpZGVyVmFsdWUgPSBjb252ZXJ0VmFsdWVUb091dHB1dEFzdChwcm92aWRlci51c2VWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VQcm9wZXJ0eSkpIHtcbiAgICAgICAgICBwcm92aWRlclZhbHVlID0gcHJvdmlkZXJWYWx1ZS5wcm9wKHByb3ZpZGVyLnVzZVByb3BlcnR5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvdmlkZXJWYWx1ZTtcbiAgICAgIH0pO1xuICAgICAgdmFyIHByb3BOYW1lID0gYF8ke3Jlc29sdmVkUHJvdmlkZXIudG9rZW4ubmFtZX1fJHt0aGlzLm5vZGVJbmRleH1fJHt0aGlzLl9pbnN0YW5jZXMuc2l6ZX1gO1xuICAgICAgdmFyIGluc3RhbmNlID1cbiAgICAgICAgICBjcmVhdGVQcm92aWRlclByb3BlcnR5KHByb3BOYW1lLCByZXNvbHZlZFByb3ZpZGVyLCBwcm92aWRlclZhbHVlRXhwcmVzc2lvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlZFByb3ZpZGVyLm11bHRpUHJvdmlkZXIsIHJlc29sdmVkUHJvdmlkZXIuZWFnZXIsIHRoaXMpO1xuICAgICAgdGhpcy5faW5zdGFuY2VzLmFkZChyZXNvbHZlZFByb3ZpZGVyLnRva2VuLCBpbnN0YW5jZSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmRpcmVjdGl2ZUluc3RhbmNlcyA9XG4gICAgICAgIHRoaXMuX2RpcmVjdGl2ZXMubWFwKChkaXJlY3RpdmUpID0+IHRoaXMuX2luc3RhbmNlcy5nZXQoaWRlbnRpZmllclRva2VuKGRpcmVjdGl2ZS50eXBlKSkpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kaXJlY3RpdmVJbnN0YW5jZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkaXJlY3RpdmVJbnN0YW5jZSA9IHRoaXMuZGlyZWN0aXZlSW5zdGFuY2VzW2ldO1xuICAgICAgdmFyIGRpcmVjdGl2ZSA9IHRoaXMuX2RpcmVjdGl2ZXNbaV07XG4gICAgICBkaXJlY3RpdmUucXVlcmllcy5mb3JFYWNoKChxdWVyeU1ldGEpID0+IHsgdGhpcy5fYWRkUXVlcnkocXVlcnlNZXRhLCBkaXJlY3RpdmVJbnN0YW5jZSk7IH0pO1xuICAgIH1cbiAgICB2YXIgcXVlcmllc1dpdGhSZWFkczogX1F1ZXJ5V2l0aFJlYWRbXSA9IFtdO1xuICAgIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzLnZhbHVlcygpLmZvckVhY2goKHJlc29sdmVkUHJvdmlkZXIpID0+IHtcbiAgICAgIHZhciBxdWVyaWVzRm9yUHJvdmlkZXIgPSB0aGlzLl9nZXRRdWVyaWVzRm9yKHJlc29sdmVkUHJvdmlkZXIudG9rZW4pO1xuICAgICAgTGlzdFdyYXBwZXIuYWRkQWxsKFxuICAgICAgICAgIHF1ZXJpZXNXaXRoUmVhZHMsXG4gICAgICAgICAgcXVlcmllc0ZvclByb3ZpZGVyLm1hcChxdWVyeSA9PiBuZXcgX1F1ZXJ5V2l0aFJlYWQocXVlcnksIHJlc29sdmVkUHJvdmlkZXIudG9rZW4pKSk7XG4gICAgfSk7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKHRoaXMucmVmZXJlbmNlVG9rZW5zLCAoXywgdmFyTmFtZSkgPT4ge1xuICAgICAgdmFyIHRva2VuID0gdGhpcy5yZWZlcmVuY2VUb2tlbnNbdmFyTmFtZV07XG4gICAgICB2YXIgdmFyVmFsdWU7XG4gICAgICBpZiAoaXNQcmVzZW50KHRva2VuKSkge1xuICAgICAgICB2YXJWYWx1ZSA9IHRoaXMuX2luc3RhbmNlcy5nZXQodG9rZW4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyVmFsdWUgPSB0aGlzLnJlbmRlck5vZGU7XG4gICAgICB9XG4gICAgICB0aGlzLnZpZXcubG9jYWxzLnNldCh2YXJOYW1lLCB2YXJWYWx1ZSk7XG4gICAgICB2YXIgdmFyVG9rZW4gPSBuZXcgQ29tcGlsZVRva2VuTWV0YWRhdGEoe3ZhbHVlOiB2YXJOYW1lfSk7XG4gICAgICBMaXN0V3JhcHBlci5hZGRBbGwocXVlcmllc1dpdGhSZWFkcywgdGhpcy5fZ2V0UXVlcmllc0Zvcih2YXJUb2tlbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChxdWVyeSA9PiBuZXcgX1F1ZXJ5V2l0aFJlYWQocXVlcnksIHZhclRva2VuKSkpO1xuICAgIH0pO1xuICAgIHF1ZXJpZXNXaXRoUmVhZHMuZm9yRWFjaCgocXVlcnlXaXRoUmVhZCkgPT4ge1xuICAgICAgdmFyIHZhbHVlOiBvLkV4cHJlc3Npb247XG4gICAgICBpZiAoaXNQcmVzZW50KHF1ZXJ5V2l0aFJlYWQucmVhZC5pZGVudGlmaWVyKSkge1xuICAgICAgICAvLyBxdWVyeSBmb3IgYW4gaWRlbnRpZmllclxuICAgICAgICB2YWx1ZSA9IHRoaXMuX2luc3RhbmNlcy5nZXQocXVlcnlXaXRoUmVhZC5yZWFkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHF1ZXJ5IGZvciBhIHJlZmVyZW5jZVxuICAgICAgICB2YXIgdG9rZW4gPSB0aGlzLnJlZmVyZW5jZVRva2Vuc1txdWVyeVdpdGhSZWFkLnJlYWQudmFsdWVdO1xuICAgICAgICBpZiAoaXNQcmVzZW50KHRva2VuKSkge1xuICAgICAgICAgIHZhbHVlID0gdGhpcy5faW5zdGFuY2VzLmdldCh0b2tlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWUgPSB0aGlzLmVsZW1lbnRSZWY7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpc1ByZXNlbnQodmFsdWUpKSB7XG4gICAgICAgIHF1ZXJ5V2l0aFJlYWQucXVlcnkuYWRkVmFsdWUodmFsdWUsIHRoaXMudmlldyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuY29tcG9uZW50KSkge1xuICAgICAgdmFyIGNvbXBvbmVudENvbnN0cnVjdG9yVmlld1F1ZXJ5TGlzdCA9XG4gICAgICAgICAgaXNQcmVzZW50KHRoaXMuY29tcG9uZW50KSA/IG8ubGl0ZXJhbEFycih0aGlzLl9jb21wb25lbnRDb25zdHJ1Y3RvclZpZXdRdWVyeUxpc3RzKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8uTlVMTF9FWFBSO1xuICAgICAgdmFyIGNvbXBFeHByID0gaXNQcmVzZW50KHRoaXMuZ2V0Q29tcG9uZW50KCkpID8gdGhpcy5nZXRDb21wb25lbnQoKSA6IG8uTlVMTF9FWFBSO1xuICAgICAgdGhpcy52aWV3LmNyZWF0ZU1ldGhvZC5hZGRTdG10KFxuICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5jYWxsTWV0aG9kKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaW5pdENvbXBvbmVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtjb21wRXhwciwgY29tcG9uZW50Q29uc3RydWN0b3JWaWV3UXVlcnlMaXN0LCB0aGlzLl9jb21wVmlld0V4cHJdKVxuICAgICAgICAgICAgICAudG9TdG10KCkpO1xuICAgIH1cbiAgfVxuXG4gIGFmdGVyQ2hpbGRyZW4oY2hpbGROb2RlQ291bnQ6IG51bWJlcikge1xuICAgIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzLnZhbHVlcygpLmZvckVhY2goKHJlc29sdmVkUHJvdmlkZXIpID0+IHtcbiAgICAgIC8vIE5vdGU6IGFmdGVyQ2hpbGRyZW4gaXMgY2FsbGVkIGFmdGVyIHJlY3Vyc2luZyBpbnRvIGNoaWxkcmVuLlxuICAgICAgLy8gVGhpcyBpcyBnb29kIHNvIHRoYXQgYW4gaW5qZWN0b3IgbWF0Y2ggaW4gYW4gZWxlbWVudCB0aGF0IGlzIGNsb3NlciB0byBhIHJlcXVlc3RpbmcgZWxlbWVudFxuICAgICAgLy8gbWF0Y2hlcyBmaXJzdC5cbiAgICAgIHZhciBwcm92aWRlckV4cHIgPSB0aGlzLl9pbnN0YW5jZXMuZ2V0KHJlc29sdmVkUHJvdmlkZXIudG9rZW4pO1xuICAgICAgLy8gTm90ZTogdmlldyBwcm92aWRlcnMgYXJlIG9ubHkgdmlzaWJsZSBvbiB0aGUgaW5qZWN0b3Igb2YgdGhhdCBlbGVtZW50LlxuICAgICAgLy8gVGhpcyBpcyBub3QgZnVsbHkgY29ycmVjdCBhcyB0aGUgcnVsZXMgZHVyaW5nIGNvZGVnZW4gZG9uJ3QgYWxsb3cgYSBkaXJlY3RpdmVcbiAgICAgIC8vIHRvIGdldCBob2xkIG9mIGEgdmlldyBwcm92ZGllciBvbiB0aGUgc2FtZSBlbGVtZW50LiBXZSBzdGlsbCBkbyB0aGlzIHNlbWFudGljXG4gICAgICAvLyBhcyBpdCBzaW1wbGlmaWVzIG91ciBtb2RlbCB0byBoYXZpbmcgb25seSBvbmUgcnVudGltZSBpbmplY3RvciBwZXIgZWxlbWVudC5cbiAgICAgIHZhciBwcm92aWRlckNoaWxkTm9kZUNvdW50ID1cbiAgICAgICAgICByZXNvbHZlZFByb3ZpZGVyLnByb3ZpZGVyVHlwZSA9PT0gUHJvdmlkZXJBc3RUeXBlLlByaXZhdGVTZXJ2aWNlID8gMCA6IGNoaWxkTm9kZUNvdW50O1xuICAgICAgdGhpcy52aWV3LmluamVjdG9yR2V0TWV0aG9kLmFkZFN0bXQoY3JlYXRlSW5qZWN0SW50ZXJuYWxDb25kaXRpb24oXG4gICAgICAgICAgdGhpcy5ub2RlSW5kZXgsIHByb3ZpZGVyQ2hpbGROb2RlQ291bnQsIHJlc29sdmVkUHJvdmlkZXIsIHByb3ZpZGVyRXhwcikpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fcXVlcmllcy52YWx1ZXMoKS5mb3JFYWNoKFxuICAgICAgICAocXVlcmllcykgPT5cbiAgICAgICAgICAgIHF1ZXJpZXMuZm9yRWFjaCgocXVlcnkpID0+IHF1ZXJ5LmFmdGVyQ2hpbGRyZW4odGhpcy52aWV3LmNyZWF0ZU1ldGhvZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3LnVwZGF0ZUNvbnRlbnRRdWVyaWVzTWV0aG9kKSkpO1xuICB9XG5cbiAgYWRkQ29udGVudE5vZGUobmdDb250ZW50SW5kZXg6IG51bWJlciwgbm9kZUV4cHI6IG8uRXhwcmVzc2lvbikge1xuICAgIHRoaXMuY29udGVudE5vZGVzQnlOZ0NvbnRlbnRJbmRleFtuZ0NvbnRlbnRJbmRleF0ucHVzaChub2RlRXhwcik7XG4gIH1cblxuICBnZXRDb21wb25lbnQoKTogby5FeHByZXNzaW9uIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuY29tcG9uZW50KSA/IHRoaXMuX2luc3RhbmNlcy5nZXQoaWRlbnRpZmllclRva2VuKHRoaXMuY29tcG9uZW50LnR5cGUpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xuICB9XG5cbiAgZ2V0UHJvdmlkZXJUb2tlbnMoKTogby5FeHByZXNzaW9uW10ge1xuICAgIHJldHVybiB0aGlzLl9yZXNvbHZlZFByb3ZpZGVycy52YWx1ZXMoKS5tYXAoXG4gICAgICAgIChyZXNvbHZlZFByb3ZpZGVyKSA9PiBjcmVhdGVEaVRva2VuRXhwcmVzc2lvbihyZXNvbHZlZFByb3ZpZGVyLnRva2VuKSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRRdWVyaWVzRm9yKHRva2VuOiBDb21waWxlVG9rZW5NZXRhZGF0YSk6IENvbXBpbGVRdWVyeVtdIHtcbiAgICB2YXIgcmVzdWx0OiBDb21waWxlUXVlcnlbXSA9IFtdO1xuICAgIHZhciBjdXJyZW50RWw6IENvbXBpbGVFbGVtZW50ID0gdGhpcztcbiAgICB2YXIgZGlzdGFuY2UgPSAwO1xuICAgIHZhciBxdWVyaWVzOiBDb21waWxlUXVlcnlbXTtcbiAgICB3aGlsZSAoIWN1cnJlbnRFbC5pc051bGwoKSkge1xuICAgICAgcXVlcmllcyA9IGN1cnJlbnRFbC5fcXVlcmllcy5nZXQodG9rZW4pO1xuICAgICAgaWYgKGlzUHJlc2VudChxdWVyaWVzKSkge1xuICAgICAgICBMaXN0V3JhcHBlci5hZGRBbGwocmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlcmllcy5maWx0ZXIoKHF1ZXJ5KSA9PiBxdWVyeS5tZXRhLmRlc2NlbmRhbnRzIHx8IGRpc3RhbmNlIDw9IDEpKTtcbiAgICAgIH1cbiAgICAgIGlmIChjdXJyZW50RWwuX2RpcmVjdGl2ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBkaXN0YW5jZSsrO1xuICAgICAgfVxuICAgICAgY3VycmVudEVsID0gY3VycmVudEVsLnBhcmVudDtcbiAgICB9XG4gICAgcXVlcmllcyA9IHRoaXMudmlldy5jb21wb25lbnRWaWV3LnZpZXdRdWVyaWVzLmdldCh0b2tlbik7XG4gICAgaWYgKGlzUHJlc2VudChxdWVyaWVzKSkge1xuICAgICAgTGlzdFdyYXBwZXIuYWRkQWxsKHJlc3VsdCwgcXVlcmllcyk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIF9hZGRRdWVyeShxdWVyeU1ldGE6IENvbXBpbGVRdWVyeU1ldGFkYXRhLFxuICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmVJbnN0YW5jZTogby5FeHByZXNzaW9uKTogQ29tcGlsZVF1ZXJ5IHtcbiAgICB2YXIgcHJvcE5hbWUgPSBgX3F1ZXJ5XyR7cXVlcnlNZXRhLnNlbGVjdG9yc1swXS5uYW1lfV8ke3RoaXMubm9kZUluZGV4fV8ke3RoaXMuX3F1ZXJ5Q291bnQrK31gO1xuICAgIHZhciBxdWVyeUxpc3QgPSBjcmVhdGVRdWVyeUxpc3QocXVlcnlNZXRhLCBkaXJlY3RpdmVJbnN0YW5jZSwgcHJvcE5hbWUsIHRoaXMudmlldyk7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IENvbXBpbGVRdWVyeShxdWVyeU1ldGEsIHF1ZXJ5TGlzdCwgZGlyZWN0aXZlSW5zdGFuY2UsIHRoaXMudmlldyk7XG4gICAgYWRkUXVlcnlUb1Rva2VuTWFwKHRoaXMuX3F1ZXJpZXMsIHF1ZXJ5KTtcbiAgICByZXR1cm4gcXVlcnk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRMb2NhbERlcGVuZGVuY3kocmVxdWVzdGluZ1Byb3ZpZGVyVHlwZTogUHJvdmlkZXJBc3RUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEpOiBvLkV4cHJlc3Npb24ge1xuICAgIHZhciByZXN1bHQgPSBudWxsO1xuICAgIC8vIGNvbnN0cnVjdG9yIGNvbnRlbnQgcXVlcnlcbiAgICBpZiAoaXNCbGFuayhyZXN1bHQpICYmIGlzUHJlc2VudChkZXAucXVlcnkpKSB7XG4gICAgICByZXN1bHQgPSB0aGlzLl9hZGRRdWVyeShkZXAucXVlcnksIG51bGwpLnF1ZXJ5TGlzdDtcbiAgICB9XG5cbiAgICAvLyBjb25zdHJ1Y3RvciB2aWV3IHF1ZXJ5XG4gICAgaWYgKGlzQmxhbmsocmVzdWx0KSAmJiBpc1ByZXNlbnQoZGVwLnZpZXdRdWVyeSkpIHtcbiAgICAgIHJlc3VsdCA9IGNyZWF0ZVF1ZXJ5TGlzdChcbiAgICAgICAgICBkZXAudmlld1F1ZXJ5LCBudWxsLFxuICAgICAgICAgIGBfdmlld1F1ZXJ5XyR7ZGVwLnZpZXdRdWVyeS5zZWxlY3RvcnNbMF0ubmFtZX1fJHt0aGlzLm5vZGVJbmRleH1fJHt0aGlzLl9jb21wb25lbnRDb25zdHJ1Y3RvclZpZXdRdWVyeUxpc3RzLmxlbmd0aH1gLFxuICAgICAgICAgIHRoaXMudmlldyk7XG4gICAgICB0aGlzLl9jb21wb25lbnRDb25zdHJ1Y3RvclZpZXdRdWVyeUxpc3RzLnB1c2gocmVzdWx0KTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcmVzZW50KGRlcC50b2tlbikpIHtcbiAgICAgIC8vIGFjY2VzcyBidWlsdGlucyB3aXRoIHNwZWNpYWwgdmlzaWJpbGl0eVxuICAgICAgaWYgKGlzQmxhbmsocmVzdWx0KSkge1xuICAgICAgICBpZiAoZGVwLnRva2VuLmVxdWFsc1RvKGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5DaGFuZ2VEZXRlY3RvclJlZikpKSB7XG4gICAgICAgICAgaWYgKHJlcXVlc3RpbmdQcm92aWRlclR5cGUgPT09IFByb3ZpZGVyQXN0VHlwZS5Db21wb25lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb21wVmlld0V4cHIucHJvcCgncmVmJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBvLlRISVNfRVhQUi5wcm9wKCdyZWYnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGFjY2VzcyByZWd1bGFyIHByb3ZpZGVycyBvbiB0aGUgZWxlbWVudFxuICAgICAgaWYgKGlzQmxhbmsocmVzdWx0KSkge1xuICAgICAgICByZXN1bHQgPSB0aGlzLl9pbnN0YW5jZXMuZ2V0KGRlcC50b2tlbik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIF9nZXREZXBlbmRlbmN5KHJlcXVlc3RpbmdQcm92aWRlclR5cGU6IFByb3ZpZGVyQXN0VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICBkZXA6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSk6IG8uRXhwcmVzc2lvbiB7XG4gICAgdmFyIGN1cnJFbGVtZW50OiBDb21waWxlRWxlbWVudCA9IHRoaXM7XG4gICAgdmFyIHJlc3VsdCA9IG51bGw7XG4gICAgaWYgKGRlcC5pc1ZhbHVlKSB7XG4gICAgICByZXN1bHQgPSBvLmxpdGVyYWwoZGVwLnZhbHVlKTtcbiAgICB9XG4gICAgaWYgKGlzQmxhbmsocmVzdWx0KSAmJiAhZGVwLmlzU2tpcFNlbGYpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX2dldExvY2FsRGVwZW5kZW5jeShyZXF1ZXN0aW5nUHJvdmlkZXJUeXBlLCBkZXApO1xuICAgIH1cbiAgICAvLyBjaGVjayBwYXJlbnQgZWxlbWVudHNcbiAgICB3aGlsZSAoaXNCbGFuayhyZXN1bHQpICYmICFjdXJyRWxlbWVudC5wYXJlbnQuaXNOdWxsKCkpIHtcbiAgICAgIGN1cnJFbGVtZW50ID0gY3VyckVsZW1lbnQucGFyZW50O1xuICAgICAgcmVzdWx0ID0gY3VyckVsZW1lbnQuX2dldExvY2FsRGVwZW5kZW5jeShQcm92aWRlckFzdFR5cGUuUHVibGljU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSh7dG9rZW46IGRlcC50b2tlbn0pKTtcbiAgICB9XG5cbiAgICBpZiAoaXNCbGFuayhyZXN1bHQpKSB7XG4gICAgICByZXN1bHQgPSBpbmplY3RGcm9tVmlld1BhcmVudEluamVjdG9yKGRlcC50b2tlbiwgZGVwLmlzT3B0aW9uYWwpO1xuICAgIH1cbiAgICBpZiAoaXNCbGFuayhyZXN1bHQpKSB7XG4gICAgICByZXN1bHQgPSBvLk5VTExfRVhQUjtcbiAgICB9XG4gICAgcmV0dXJuIGdldFByb3BlcnR5SW5WaWV3KHJlc3VsdCwgdGhpcy52aWV3LCBjdXJyRWxlbWVudC52aWV3KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVJbmplY3RJbnRlcm5hbENvbmRpdGlvbihub2RlSW5kZXg6IG51bWJlciwgY2hpbGROb2RlQ291bnQ6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyOiBQcm92aWRlckFzdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyRXhwcjogby5FeHByZXNzaW9uKTogby5TdGF0ZW1lbnQge1xuICB2YXIgaW5kZXhDb25kaXRpb247XG4gIGlmIChjaGlsZE5vZGVDb3VudCA+IDApIHtcbiAgICBpbmRleENvbmRpdGlvbiA9IG8ubGl0ZXJhbChub2RlSW5kZXgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmxvd2VyRXF1YWxzKEluamVjdE1ldGhvZFZhcnMucmVxdWVzdE5vZGVJbmRleClcbiAgICAgICAgICAgICAgICAgICAgICAgICAuYW5kKEluamVjdE1ldGhvZFZhcnMucmVxdWVzdE5vZGVJbmRleC5sb3dlckVxdWFscyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5saXRlcmFsKG5vZGVJbmRleCArIGNoaWxkTm9kZUNvdW50KSkpO1xuICB9IGVsc2Uge1xuICAgIGluZGV4Q29uZGl0aW9uID0gby5saXRlcmFsKG5vZGVJbmRleCkuaWRlbnRpY2FsKEluamVjdE1ldGhvZFZhcnMucmVxdWVzdE5vZGVJbmRleCk7XG4gIH1cbiAgcmV0dXJuIG5ldyBvLklmU3RtdChcbiAgICAgIEluamVjdE1ldGhvZFZhcnMudG9rZW4uaWRlbnRpY2FsKGNyZWF0ZURpVG9rZW5FeHByZXNzaW9uKHByb3ZpZGVyLnRva2VuKSkuYW5kKGluZGV4Q29uZGl0aW9uKSxcbiAgICAgIFtuZXcgby5SZXR1cm5TdGF0ZW1lbnQocHJvdmlkZXJFeHByKV0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVQcm92aWRlclByb3BlcnR5KHByb3BOYW1lOiBzdHJpbmcsIHByb3ZpZGVyOiBQcm92aWRlckFzdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJWYWx1ZUV4cHJlc3Npb25zOiBvLkV4cHJlc3Npb25bXSwgaXNNdWx0aTogYm9vbGVhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNFYWdlcjogYm9vbGVhbiwgY29tcGlsZUVsZW1lbnQ6IENvbXBpbGVFbGVtZW50KTogby5FeHByZXNzaW9uIHtcbiAgdmFyIHZpZXcgPSBjb21waWxlRWxlbWVudC52aWV3O1xuICB2YXIgcmVzb2x2ZWRQcm92aWRlclZhbHVlRXhwcjtcbiAgdmFyIHR5cGU7XG4gIGlmIChpc011bHRpKSB7XG4gICAgcmVzb2x2ZWRQcm92aWRlclZhbHVlRXhwciA9IG8ubGl0ZXJhbEFycihwcm92aWRlclZhbHVlRXhwcmVzc2lvbnMpO1xuICAgIHR5cGUgPSBuZXcgby5BcnJheVR5cGUoby5EWU5BTUlDX1RZUEUpO1xuICB9IGVsc2Uge1xuICAgIHJlc29sdmVkUHJvdmlkZXJWYWx1ZUV4cHIgPSBwcm92aWRlclZhbHVlRXhwcmVzc2lvbnNbMF07XG4gICAgdHlwZSA9IHByb3ZpZGVyVmFsdWVFeHByZXNzaW9uc1swXS50eXBlO1xuICB9XG4gIGlmIChpc0JsYW5rKHR5cGUpKSB7XG4gICAgdHlwZSA9IG8uRFlOQU1JQ19UWVBFO1xuICB9XG4gIGlmIChpc0VhZ2VyKSB7XG4gICAgdmlldy5maWVsZHMucHVzaChuZXcgby5DbGFzc0ZpZWxkKHByb3BOYW1lLCB0eXBlLCBbby5TdG10TW9kaWZpZXIuUHJpdmF0ZV0pKTtcbiAgICB2aWV3LmNyZWF0ZU1ldGhvZC5hZGRTdG10KG8uVEhJU19FWFBSLnByb3AocHJvcE5hbWUpLnNldChyZXNvbHZlZFByb3ZpZGVyVmFsdWVFeHByKS50b1N0bXQoKSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGludGVybmFsRmllbGQgPSBgXyR7cHJvcE5hbWV9YDtcbiAgICB2aWV3LmZpZWxkcy5wdXNoKG5ldyBvLkNsYXNzRmllbGQoaW50ZXJuYWxGaWVsZCwgdHlwZSwgW28uU3RtdE1vZGlmaWVyLlByaXZhdGVdKSk7XG4gICAgdmFyIGdldHRlciA9IG5ldyBDb21waWxlTWV0aG9kKHZpZXcpO1xuICAgIGdldHRlci5yZXNldERlYnVnSW5mbyhjb21waWxlRWxlbWVudC5ub2RlSW5kZXgsIGNvbXBpbGVFbGVtZW50LnNvdXJjZUFzdCk7XG4gICAgLy8gTm90ZTogRXF1YWxzIGlzIGltcG9ydGFudCBmb3IgSlMgc28gdGhhdCBpdCBhbHNvIGNoZWNrcyB0aGUgdW5kZWZpbmVkIGNhc2UhXG4gICAgZ2V0dGVyLmFkZFN0bXQoXG4gICAgICAgIG5ldyBvLklmU3RtdChvLlRISVNfRVhQUi5wcm9wKGludGVybmFsRmllbGQpLmlzQmxhbmsoKSxcbiAgICAgICAgICAgICAgICAgICAgIFtvLlRISVNfRVhQUi5wcm9wKGludGVybmFsRmllbGQpLnNldChyZXNvbHZlZFByb3ZpZGVyVmFsdWVFeHByKS50b1N0bXQoKV0pKTtcbiAgICBnZXR0ZXIuYWRkU3RtdChuZXcgby5SZXR1cm5TdGF0ZW1lbnQoby5USElTX0VYUFIucHJvcChpbnRlcm5hbEZpZWxkKSkpO1xuICAgIHZpZXcuZ2V0dGVycy5wdXNoKG5ldyBvLkNsYXNzR2V0dGVyKHByb3BOYW1lLCBnZXR0ZXIuZmluaXNoKCksIHR5cGUpKTtcbiAgfVxuICByZXR1cm4gby5USElTX0VYUFIucHJvcChwcm9wTmFtZSk7XG59XG5cbmNsYXNzIF9RdWVyeVdpdGhSZWFkIHtcbiAgcHVibGljIHJlYWQ6IENvbXBpbGVUb2tlbk1ldGFkYXRhO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcXVlcnk6IENvbXBpbGVRdWVyeSwgbWF0Y2g6IENvbXBpbGVUb2tlbk1ldGFkYXRhKSB7XG4gICAgdGhpcy5yZWFkID0gaXNQcmVzZW50KHF1ZXJ5Lm1ldGEucmVhZCkgPyBxdWVyeS5tZXRhLnJlYWQgOiBtYXRjaDtcbiAgfVxufVxuIl19