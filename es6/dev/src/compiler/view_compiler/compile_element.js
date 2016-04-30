import * as o from '../output/output_ast';
import { Identifiers, identifierToken } from '../identifiers';
import { InjectMethodVars } from './constants';
import { isPresent, isBlank } from 'angular2/src/facade/lang';
import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { ProviderAst, ProviderAstType } from '../template_ast';
import { CompileTokenMap, CompileTokenMetadata, CompileProviderMetadata, CompileDiDependencyMetadata, CompileIdentifierMetadata } from '../compile_metadata';
import { getPropertyInView, createDiTokenExpression, injectFromViewParentInjector } from './util';
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
                if (isPresent(provider.useExisting)) {
                    return this._getDependency(resolvedProvider.providerType, new CompileDiDependencyMetadata({ token: provider.useExisting }));
                }
                else if (isPresent(provider.useFactory)) {
                    var deps = isPresent(provider.deps) ? provider.deps : provider.useFactory.diDeps;
                    var depsExpr = deps.map((dep) => this._getDependency(resolvedProvider.providerType, dep));
                    return o.importExpr(provider.useFactory).callFn(depsExpr);
                }
                else if (isPresent(provider.useClass)) {
                    var deps = isPresent(provider.deps) ? provider.deps : provider.useClass.diDeps;
                    var depsExpr = deps.map((dep) => this._getDependency(resolvedProvider.providerType, dep));
                    return o.importExpr(provider.useClass)
                        .instantiate(depsExpr, o.importType(provider.useClass));
                }
                else {
                    if (provider.useValue instanceof CompileIdentifierMetadata) {
                        return o.importExpr(provider.useValue);
                    }
                    else if (provider.useValue instanceof o.Expression) {
                        return provider.useValue;
                    }
                    else {
                        return o.literal(provider.useValue);
                    }
                }
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
        this._queries.values().forEach((queries) => queries.forEach((query) => query.afterChildren(this.view.updateContentQueriesMethod)));
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
                        return getPropertyInView(o.THIS_EXPR.prop('ref'), this.view, this.view.componentView);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZV9lbGVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1OeVRHZEZjQi50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3ZpZXdfY29tcGlsZXIvY29tcGlsZV9lbGVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEtBQUssQ0FBQyxNQUFNLHNCQUFzQjtPQUNsQyxFQUFDLFdBQVcsRUFBRSxlQUFlLEVBQUMsTUFBTSxnQkFBZ0I7T0FDcEQsRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGFBQWE7T0FFckMsRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFDLE1BQU0sMEJBQTBCO09BQ3BELEVBQUMsV0FBVyxFQUFFLGdCQUFnQixFQUFDLE1BQU0sZ0NBQWdDO09BQ3JFLEVBQWMsV0FBVyxFQUFFLGVBQWUsRUFBZSxNQUFNLGlCQUFpQjtPQUNoRixFQUNMLGVBQWUsRUFFZixvQkFBb0IsRUFFcEIsdUJBQXVCLEVBQ3ZCLDJCQUEyQixFQUMzQix5QkFBeUIsRUFFMUIsTUFBTSxxQkFBcUI7T0FDckIsRUFBQyxpQkFBaUIsRUFBRSx1QkFBdUIsRUFBRSw0QkFBNEIsRUFBQyxNQUFNLFFBQVE7T0FDeEYsRUFBQyxZQUFZLEVBQUUsZUFBZSxFQUFFLGtCQUFrQixFQUFDLE1BQU0saUJBQWlCO09BQzFFLEVBQUMsYUFBYSxFQUFDLE1BQU0sa0JBQWtCO0FBRTlDO0lBQ0UsWUFBbUIsTUFBc0IsRUFBUyxJQUFpQixFQUFTLFNBQWlCLEVBQzFFLFVBQXdCLEVBQVMsU0FBc0I7UUFEdkQsV0FBTSxHQUFOLE1BQU0sQ0FBZ0I7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFhO1FBQVMsY0FBUyxHQUFULFNBQVMsQ0FBUTtRQUMxRSxlQUFVLEdBQVYsVUFBVSxDQUFjO1FBQVMsY0FBUyxHQUFULFNBQVMsQ0FBYTtJQUFHLENBQUM7SUFFOUUsTUFBTSxLQUFjLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV0RCxhQUFhLEtBQWMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3BFLENBQUM7QUFFRCxvQ0FBb0MsV0FBVztJQXFCN0MsWUFBWSxNQUFzQixFQUFFLElBQWlCLEVBQUUsU0FBaUIsRUFDNUQsVUFBd0IsRUFBRSxTQUFzQixFQUN6QyxTQUFtQyxFQUNsQyxXQUF1QyxFQUN2Qyx1QkFBc0MsRUFBUyxnQkFBeUIsRUFDekUsZUFBd0IsRUFBRSxVQUEwQjtRQUNyRSxNQUFNLE1BQU0sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUpyQyxjQUFTLEdBQVQsU0FBUyxDQUEwQjtRQUNsQyxnQkFBVyxHQUFYLFdBQVcsQ0FBNEI7UUFDdkMsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUFlO1FBQVMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFTO1FBQ3pFLG9CQUFlLEdBQWYsZUFBZSxDQUFTO1FBckJuQyxrQkFBYSxHQUFpQixJQUFJLENBQUM7UUFJbkMsZUFBVSxHQUFHLElBQUksZUFBZSxFQUFnQixDQUFDO1FBR2pELGdCQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLGFBQVEsR0FBRyxJQUFJLGVBQWUsRUFBa0IsQ0FBQztRQUNqRCx3Q0FBbUMsR0FBbUIsRUFBRSxDQUFDO1FBRTFELGlDQUE0QixHQUEwQixJQUFJLENBQUM7UUFZaEUsSUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7UUFDMUIsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXRFLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDdEYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDOUUsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDMUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3pGLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsZUFBZSxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9FLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzNCLENBQUM7SUFDSCxDQUFDO0lBdENELE9BQU8sVUFBVTtRQUNmLE1BQU0sQ0FBQyxJQUFJLGNBQWMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQXNDTyxpQkFBaUI7UUFDdkIsSUFBSSxTQUFTLEdBQUcsVUFBVSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDM0MsSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUMxRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFDL0MsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRSxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7YUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQzthQUMvQixXQUFXLENBQUM7WUFDWCxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDekIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUM7WUFDMUIsQ0FBQyxDQUFDLFNBQVM7WUFDWCxJQUFJLENBQUMsVUFBVTtTQUNoQixDQUFDLENBQUM7YUFDWCxNQUFNLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNoRixDQUFDO0lBRUQsZ0JBQWdCLENBQUMsWUFBMEI7UUFDekMsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7UUFDbEMsSUFBSSxDQUFDLDRCQUE0QjtZQUM3QixXQUFXLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ25GLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2xFLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUMsQ0FBQztJQUNILENBQUM7SUFFRCxlQUFlLENBQUMsWUFBeUI7UUFDdkMsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7UUFDakMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixJQUFJLHFCQUFxQixHQUNyQixDQUFDLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUM7aUJBQ2pDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLElBQUksUUFBUSxHQUFHLElBQUksdUJBQXVCLENBQ3RDLEVBQUMsS0FBSyxFQUFFLGVBQWUsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLEVBQUUsUUFBUSxFQUFFLHFCQUFxQixFQUFDLENBQUMsQ0FBQztZQUN4RixnRkFBZ0Y7WUFDaEYsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFDdkMsZUFBZSxDQUFDLE9BQU8sRUFDdkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ25GLENBQUM7SUFDSCxDQUFDO0lBRUQsY0FBYztRQUNaLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUM3QyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFFRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxlQUFlLEVBQWUsQ0FBQztRQUM3RCxJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFDSixJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUVoRyxtRUFBbUU7UUFDbkUsbUZBQW1GO1FBQ25GLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxnQkFBZ0I7WUFDeEQsSUFBSSx3QkFBd0IsR0FBRyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUTtnQkFDckUsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUN0QixnQkFBZ0IsQ0FBQyxZQUFZLEVBQzdCLElBQUksMkJBQTJCLENBQUMsRUFBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLFdBQVcsRUFBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEUsQ0FBQztnQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzFDLElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQztvQkFDakYsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUMxRixNQUFNLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM1RCxDQUFDO2dCQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDeEMsSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO29CQUMvRSxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQzFGLE1BQU0sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7eUJBQ2pDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDOUQsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDTixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxZQUFZLHlCQUF5QixDQUFDLENBQUMsQ0FBQzt3QkFDM0QsTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUN6QyxDQUFDO29CQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxZQUFZLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO3dCQUNyRCxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQztvQkFDM0IsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDTixNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3RDLENBQUM7Z0JBQ0gsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxRQUFRLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUMzRixJQUFJLFFBQVEsR0FDUixzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsd0JBQXdCLEVBQ3BELGdCQUFnQixDQUFDLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDekYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3hELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGtCQUFrQjtZQUNuQixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsS0FBSyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5RixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN4RCxJQUFJLGlCQUFpQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5RixDQUFDO1FBQ0QsSUFBSSxnQkFBZ0IsR0FBcUIsRUFBRSxDQUFDO1FBQzVDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxnQkFBZ0I7WUFDeEQsSUFBSSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JFLFdBQVcsQ0FBQyxNQUFNLENBQ2QsZ0JBQWdCLEVBQ2hCLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksSUFBSSxjQUFjLENBQUMsS0FBSyxFQUFFLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRixDQUFDLENBQUMsQ0FBQztRQUNILGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU87WUFDeEQsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMxQyxJQUFJLFFBQVEsQ0FBQztZQUNiLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4QyxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDN0IsQ0FBQztZQUNELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDeEMsSUFBSSxRQUFRLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxFQUFDLEtBQUssRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDO1lBQzFELFdBQVcsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUM7aUJBQ3hCLEdBQUcsQ0FBQyxLQUFLLElBQUksSUFBSSxjQUFjLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvRixDQUFDLENBQUMsQ0FBQztRQUNILGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLGFBQWE7WUFDckMsSUFBSSxLQUFtQixDQUFDO1lBQ3hCLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0MsMEJBQTBCO2dCQUMxQixLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xELENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTix3QkFBd0I7Z0JBQ3hCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDM0QsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDckIsS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNyQyxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO2dCQUMxQixDQUFDO1lBQ0gsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLGFBQWEsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakQsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsSUFBSSxpQ0FBaUMsR0FDakMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQztnQkFDdEQsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUM1QyxJQUFJLFFBQVEsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDbEYsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUMxQixJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FDUCxlQUFlLEVBQ2YsQ0FBQyxRQUFRLEVBQUUsaUNBQWlDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2lCQUNoRixNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3JCLENBQUM7SUFDSCxDQUFDO0lBRUQsYUFBYSxDQUFDLGNBQXNCO1FBQ2xDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxnQkFBZ0I7WUFDeEQsK0RBQStEO1lBQy9ELDhGQUE4RjtZQUM5RixpQkFBaUI7WUFDakIsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDL0QseUVBQXlFO1lBQ3pFLGdGQUFnRjtZQUNoRixnRkFBZ0Y7WUFDaEYsOEVBQThFO1lBQzlFLElBQUksc0JBQXNCLEdBQ3RCLGdCQUFnQixDQUFDLFlBQVksS0FBSyxlQUFlLENBQUMsY0FBYyxHQUFHLENBQUMsR0FBRyxjQUFjLENBQUM7WUFDMUYsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsNkJBQTZCLENBQzdELElBQUksQ0FBQyxTQUFTLEVBQUUsc0JBQXNCLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUMvRSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxDQUMxQixDQUFDLE9BQU8sS0FDSixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBRUQsY0FBYyxDQUFDLGNBQXNCLEVBQUUsUUFBc0I7UUFDM0QsSUFBSSxDQUFDLDRCQUE0QixDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRUQsWUFBWTtRQUNWLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pELElBQUksQ0FBQztJQUMxQyxDQUFDO0lBRUQsaUJBQWlCO1FBQ2YsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQ3ZDLENBQUMsZ0JBQWdCLEtBQUssdUJBQXVCLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBRU8sY0FBYyxDQUFDLEtBQTJCO1FBQ2hELElBQUksTUFBTSxHQUFtQixFQUFFLENBQUM7UUFDaEMsSUFBSSxTQUFTLEdBQW1CLElBQUksQ0FBQztRQUNyQyxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDakIsSUFBSSxPQUF1QixDQUFDO1FBQzVCLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztZQUMzQixPQUFPLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDeEMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkIsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQ04sT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RixDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckMsUUFBUSxFQUFFLENBQUM7WUFDYixDQUFDO1lBQ0QsU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDL0IsQ0FBQztRQUNELE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVPLFNBQVMsQ0FBQyxTQUErQixFQUMvQixpQkFBK0I7UUFDL0MsSUFBSSxRQUFRLEdBQUcsVUFBVSxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDO1FBQy9GLElBQUksU0FBUyxHQUFHLGVBQWUsQ0FBQyxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRixJQUFJLEtBQUssR0FBRyxJQUFJLFlBQVksQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRU8sbUJBQW1CLENBQUMsc0JBQXVDLEVBQ3ZDLEdBQWdDO1FBQzFELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQztRQUNsQiw0QkFBNEI7UUFDNUIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ3JELENBQUM7UUFFRCx5QkFBeUI7UUFDekIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hELE1BQU0sR0FBRyxlQUFlLENBQ3BCLEdBQUcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUNuQixjQUFjLEdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxNQUFNLEVBQUUsRUFDcEgsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2YsSUFBSSxDQUFDLG1DQUFtQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsMENBQTBDO1lBQzFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdkUsRUFBRSxDQUFDLENBQUMsc0JBQXNCLEtBQUssZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBQ3pELE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDeEMsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDTixNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUN4RixDQUFDO2dCQUNILENBQUM7WUFDSCxDQUFDO1lBQ0QsMENBQTBDO1lBQzFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDMUMsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFTyxjQUFjLENBQUMsc0JBQXVDLEVBQ3ZDLEdBQWdDO1FBQ3JELElBQUksV0FBVyxHQUFtQixJQUFJLENBQUM7UUFDdkMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLE1BQU0sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDdkMsTUFBTSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBQ0Qsd0JBQXdCO1FBQ3hCLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO1lBQ3ZELFdBQVcsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO1lBQ2pDLE1BQU0sR0FBRyxXQUFXLENBQUMsbUJBQW1CLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFDN0IsSUFBSSwyQkFBMkIsQ0FBQyxFQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hHLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLE1BQU0sR0FBRyw0QkFBNEIsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNuRSxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixNQUFNLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUN2QixDQUFDO1FBQ0QsTUFBTSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoRSxDQUFDO0FBQ0gsQ0FBQztBQUVELHVDQUF1QyxTQUFpQixFQUFFLGNBQXNCLEVBQ3pDLFFBQXFCLEVBQ3JCLFlBQTBCO0lBQy9ELElBQUksY0FBYyxDQUFDO0lBQ25CLEVBQUUsQ0FBQyxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLGNBQWMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQzthQUNmLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQzthQUM5QyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUM5QyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ04sY0FBYyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDckYsQ0FBQztJQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQ2YsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEVBQzdGLENBQUMsSUFBSSxDQUFDLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QyxDQUFDO0FBRUQsZ0NBQWdDLFFBQWdCLEVBQUUsUUFBcUIsRUFDdkMsd0JBQXdDLEVBQUUsT0FBZ0IsRUFDMUQsT0FBZ0IsRUFBRSxjQUE4QjtJQUM5RSxJQUFJLElBQUksR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDO0lBQy9CLElBQUkseUJBQXlCLENBQUM7SUFDOUIsSUFBSSxJQUFJLENBQUM7SUFDVCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ1oseUJBQXlCLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ25FLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLHlCQUF5QixHQUFHLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hELElBQUksR0FBRyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDMUMsQ0FBQztJQUNELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEIsSUFBSSxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUM7SUFDeEIsQ0FBQztJQUNELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDWixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdFLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDaEcsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ04sSUFBSSxhQUFhLEdBQUcsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUNuQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xGLElBQUksTUFBTSxHQUFHLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDMUUsOEVBQThFO1FBQzlFLE1BQU0sQ0FBQyxPQUFPLENBQ1YsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUN6QyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdGLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2RSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFDRCxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDcEMsQ0FBQztBQUVEO0lBRUUsWUFBbUIsS0FBbUIsRUFBRSxLQUEyQjtRQUFoRCxVQUFLLEdBQUwsS0FBSyxDQUFjO1FBQ3BDLElBQUksQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0lBQ25FLENBQUM7QUFDSCxDQUFDO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBvIGZyb20gJy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7SWRlbnRpZmllcnMsIGlkZW50aWZpZXJUb2tlbn0gZnJvbSAnLi4vaWRlbnRpZmllcnMnO1xuaW1wb3J0IHtJbmplY3RNZXRob2RWYXJzfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge0NvbXBpbGVWaWV3fSBmcm9tICcuL2NvbXBpbGVfdmlldyc7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1RlbXBsYXRlQXN0LCBQcm92aWRlckFzdCwgUHJvdmlkZXJBc3RUeXBlLCBSZWZlcmVuY2VBc3R9IGZyb20gJy4uL3RlbXBsYXRlX2FzdCc7XG5pbXBvcnQge1xuICBDb21waWxlVG9rZW5NYXAsXG4gIENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSxcbiAgQ29tcGlsZVRva2VuTWV0YWRhdGEsXG4gIENvbXBpbGVRdWVyeU1ldGFkYXRhLFxuICBDb21waWxlUHJvdmlkZXJNZXRhZGF0YSxcbiAgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhLFxuICBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLFxuICBDb21waWxlVHlwZU1ldGFkYXRhLFxufSBmcm9tICcuLi9jb21waWxlX21ldGFkYXRhJztcbmltcG9ydCB7Z2V0UHJvcGVydHlJblZpZXcsIGNyZWF0ZURpVG9rZW5FeHByZXNzaW9uLCBpbmplY3RGcm9tVmlld1BhcmVudEluamVjdG9yfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtDb21waWxlUXVlcnksIGNyZWF0ZVF1ZXJ5TGlzdCwgYWRkUXVlcnlUb1Rva2VuTWFwfSBmcm9tICcuL2NvbXBpbGVfcXVlcnknO1xuaW1wb3J0IHtDb21waWxlTWV0aG9kfSBmcm9tICcuL2NvbXBpbGVfbWV0aG9kJztcblxuZXhwb3J0IGNsYXNzIENvbXBpbGVOb2RlIHtcbiAgY29uc3RydWN0b3IocHVibGljIHBhcmVudDogQ29tcGlsZUVsZW1lbnQsIHB1YmxpYyB2aWV3OiBDb21waWxlVmlldywgcHVibGljIG5vZGVJbmRleDogbnVtYmVyLFxuICAgICAgICAgICAgICBwdWJsaWMgcmVuZGVyTm9kZTogby5FeHByZXNzaW9uLCBwdWJsaWMgc291cmNlQXN0OiBUZW1wbGF0ZUFzdCkge31cblxuICBpc051bGwoKTogYm9vbGVhbiB7IHJldHVybiBpc0JsYW5rKHRoaXMucmVuZGVyTm9kZSk7IH1cblxuICBpc1Jvb3RFbGVtZW50KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy52aWV3ICE9IHRoaXMucGFyZW50LnZpZXc7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVFbGVtZW50IGV4dGVuZHMgQ29tcGlsZU5vZGUge1xuICBzdGF0aWMgY3JlYXRlTnVsbCgpOiBDb21waWxlRWxlbWVudCB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlRWxlbWVudChudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBbXSwgW10sIGZhbHNlLCBmYWxzZSwgW10pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tcFZpZXdFeHByOiBvLkV4cHJlc3Npb24gPSBudWxsO1xuICBwdWJsaWMgYXBwRWxlbWVudDogby5SZWFkUHJvcEV4cHI7XG4gIHB1YmxpYyBlbGVtZW50UmVmOiBvLkV4cHJlc3Npb247XG4gIHB1YmxpYyBpbmplY3Rvcjogby5FeHByZXNzaW9uO1xuICBwcml2YXRlIF9pbnN0YW5jZXMgPSBuZXcgQ29tcGlsZVRva2VuTWFwPG8uRXhwcmVzc2lvbj4oKTtcbiAgcHJpdmF0ZSBfcmVzb2x2ZWRQcm92aWRlcnM6IENvbXBpbGVUb2tlbk1hcDxQcm92aWRlckFzdD47XG5cbiAgcHJpdmF0ZSBfcXVlcnlDb3VudCA9IDA7XG4gIHByaXZhdGUgX3F1ZXJpZXMgPSBuZXcgQ29tcGlsZVRva2VuTWFwPENvbXBpbGVRdWVyeVtdPigpO1xuICBwcml2YXRlIF9jb21wb25lbnRDb25zdHJ1Y3RvclZpZXdRdWVyeUxpc3RzOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuXG4gIHB1YmxpYyBjb250ZW50Tm9kZXNCeU5nQ29udGVudEluZGV4OiBBcnJheTxvLkV4cHJlc3Npb24+W10gPSBudWxsO1xuICBwdWJsaWMgZW1iZWRkZWRWaWV3OiBDb21waWxlVmlldztcbiAgcHVibGljIGRpcmVjdGl2ZUluc3RhbmNlczogby5FeHByZXNzaW9uW107XG4gIHB1YmxpYyByZWZlcmVuY2VUb2tlbnM6IHtba2V5OiBzdHJpbmddOiBDb21waWxlVG9rZW5NZXRhZGF0YX07XG5cbiAgY29uc3RydWN0b3IocGFyZW50OiBDb21waWxlRWxlbWVudCwgdmlldzogQ29tcGlsZVZpZXcsIG5vZGVJbmRleDogbnVtYmVyLFxuICAgICAgICAgICAgICByZW5kZXJOb2RlOiBvLkV4cHJlc3Npb24sIHNvdXJjZUFzdDogVGVtcGxhdGVBc3QsXG4gICAgICAgICAgICAgIHB1YmxpYyBjb21wb25lbnQ6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10sXG4gICAgICAgICAgICAgIHByaXZhdGUgX3Jlc29sdmVkUHJvdmlkZXJzQXJyYXk6IFByb3ZpZGVyQXN0W10sIHB1YmxpYyBoYXNWaWV3Q29udGFpbmVyOiBib29sZWFuLFxuICAgICAgICAgICAgICBwdWJsaWMgaGFzRW1iZWRkZWRWaWV3OiBib29sZWFuLCByZWZlcmVuY2VzOiBSZWZlcmVuY2VBc3RbXSkge1xuICAgIHN1cGVyKHBhcmVudCwgdmlldywgbm9kZUluZGV4LCByZW5kZXJOb2RlLCBzb3VyY2VBc3QpO1xuICAgIHRoaXMucmVmZXJlbmNlVG9rZW5zID0ge307XG4gICAgcmVmZXJlbmNlcy5mb3JFYWNoKHJlZiA9PiB0aGlzLnJlZmVyZW5jZVRva2Vuc1tyZWYubmFtZV0gPSByZWYudmFsdWUpO1xuXG4gICAgdGhpcy5lbGVtZW50UmVmID0gby5pbXBvcnRFeHByKElkZW50aWZpZXJzLkVsZW1lbnRSZWYpLmluc3RhbnRpYXRlKFt0aGlzLnJlbmRlck5vZGVdKTtcbiAgICB0aGlzLl9pbnN0YW5jZXMuYWRkKGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5FbGVtZW50UmVmKSwgdGhpcy5lbGVtZW50UmVmKTtcbiAgICB0aGlzLmluamVjdG9yID0gby5USElTX0VYUFIuY2FsbE1ldGhvZCgnaW5qZWN0b3InLCBbby5saXRlcmFsKHRoaXMubm9kZUluZGV4KV0pO1xuICAgIHRoaXMuX2luc3RhbmNlcy5hZGQoaWRlbnRpZmllclRva2VuKElkZW50aWZpZXJzLkluamVjdG9yKSwgdGhpcy5pbmplY3Rvcik7XG4gICAgdGhpcy5faW5zdGFuY2VzLmFkZChpZGVudGlmaWVyVG9rZW4oSWRlbnRpZmllcnMuUmVuZGVyZXIpLCBvLlRISVNfRVhQUi5wcm9wKCdyZW5kZXJlcicpKTtcbiAgICBpZiAodGhpcy5oYXNWaWV3Q29udGFpbmVyIHx8IHRoaXMuaGFzRW1iZWRkZWRWaWV3IHx8IGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkpIHtcbiAgICAgIHRoaXMuX2NyZWF0ZUFwcEVsZW1lbnQoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVBcHBFbGVtZW50KCkge1xuICAgIHZhciBmaWVsZE5hbWUgPSBgX2FwcEVsXyR7dGhpcy5ub2RlSW5kZXh9YDtcbiAgICB2YXIgcGFyZW50Tm9kZUluZGV4ID0gdGhpcy5pc1Jvb3RFbGVtZW50KCkgPyBudWxsIDogdGhpcy5wYXJlbnQubm9kZUluZGV4O1xuICAgIHRoaXMudmlldy5maWVsZHMucHVzaChuZXcgby5DbGFzc0ZpZWxkKGZpZWxkTmFtZSwgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLkFwcEVsZW1lbnQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtvLlN0bXRNb2RpZmllci5Qcml2YXRlXSkpO1xuICAgIHZhciBzdGF0ZW1lbnQgPSBvLlRISVNfRVhQUi5wcm9wKGZpZWxkTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZXQoby5pbXBvcnRFeHByKElkZW50aWZpZXJzLkFwcEVsZW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaW5zdGFudGlhdGUoW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWwodGhpcy5ub2RlSW5kZXgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWwocGFyZW50Tm9kZUluZGV4KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5USElTX0VYUFIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyTm9kZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAudG9TdG10KCk7XG4gICAgdGhpcy52aWV3LmNyZWF0ZU1ldGhvZC5hZGRTdG10KHN0YXRlbWVudCk7XG4gICAgdGhpcy5hcHBFbGVtZW50ID0gby5USElTX0VYUFIucHJvcChmaWVsZE5hbWUpO1xuICAgIHRoaXMuX2luc3RhbmNlcy5hZGQoaWRlbnRpZmllclRva2VuKElkZW50aWZpZXJzLkFwcEVsZW1lbnQpLCB0aGlzLmFwcEVsZW1lbnQpO1xuICB9XG5cbiAgc2V0Q29tcG9uZW50Vmlldyhjb21wVmlld0V4cHI6IG8uRXhwcmVzc2lvbikge1xuICAgIHRoaXMuX2NvbXBWaWV3RXhwciA9IGNvbXBWaWV3RXhwcjtcbiAgICB0aGlzLmNvbnRlbnROb2Rlc0J5TmdDb250ZW50SW5kZXggPVxuICAgICAgICBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUodGhpcy5jb21wb25lbnQudGVtcGxhdGUubmdDb250ZW50U2VsZWN0b3JzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRlbnROb2Rlc0J5TmdDb250ZW50SW5kZXgubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuY29udGVudE5vZGVzQnlOZ0NvbnRlbnRJbmRleFtpXSA9IFtdO1xuICAgIH1cbiAgfVxuXG4gIHNldEVtYmVkZGVkVmlldyhlbWJlZGRlZFZpZXc6IENvbXBpbGVWaWV3KSB7XG4gICAgdGhpcy5lbWJlZGRlZFZpZXcgPSBlbWJlZGRlZFZpZXc7XG4gICAgaWYgKGlzUHJlc2VudChlbWJlZGRlZFZpZXcpKSB7XG4gICAgICB2YXIgY3JlYXRlVGVtcGxhdGVSZWZFeHByID1cbiAgICAgICAgICBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuVGVtcGxhdGVSZWZfKVxuICAgICAgICAgICAgICAuaW5zdGFudGlhdGUoW3RoaXMuYXBwRWxlbWVudCwgdGhpcy5lbWJlZGRlZFZpZXcudmlld0ZhY3RvcnldKTtcbiAgICAgIHZhciBwcm92aWRlciA9IG5ldyBDb21waWxlUHJvdmlkZXJNZXRhZGF0YShcbiAgICAgICAgICB7dG9rZW46IGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5UZW1wbGF0ZVJlZiksIHVzZVZhbHVlOiBjcmVhdGVUZW1wbGF0ZVJlZkV4cHJ9KTtcbiAgICAgIC8vIEFkZCBUZW1wbGF0ZVJlZiBhcyBmaXJzdCBwcm92aWRlciBhcyBpdCBkb2VzIG5vdCBoYXZlIGRlcHMgb24gb3RoZXIgcHJvdmlkZXJzXG4gICAgICB0aGlzLl9yZXNvbHZlZFByb3ZpZGVyc0FycmF5LnVuc2hpZnQobmV3IFByb3ZpZGVyQXN0KHByb3ZpZGVyLnRva2VuLCBmYWxzZSwgdHJ1ZSwgW3Byb3ZpZGVyXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUHJvdmlkZXJBc3RUeXBlLkJ1aWx0aW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc291cmNlQXN0LnNvdXJjZVNwYW4pKTtcbiAgICB9XG4gIH1cblxuICBiZWZvcmVDaGlsZHJlbigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYXNWaWV3Q29udGFpbmVyKSB7XG4gICAgICB0aGlzLl9pbnN0YW5jZXMuYWRkKGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5WaWV3Q29udGFpbmVyUmVmKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LnByb3AoJ3ZjUmVmJykpO1xuICAgIH1cblxuICAgIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzID0gbmV3IENvbXBpbGVUb2tlbk1hcDxQcm92aWRlckFzdD4oKTtcbiAgICB0aGlzLl9yZXNvbHZlZFByb3ZpZGVyc0FycmF5LmZvckVhY2gocHJvdmlkZXIgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzLmFkZChwcm92aWRlci50b2tlbiwgcHJvdmlkZXIpKTtcblxuICAgIC8vIGNyZWF0ZSBhbGwgdGhlIHByb3ZpZGVyIGluc3RhbmNlcywgc29tZSBpbiB0aGUgdmlldyBjb25zdHJ1Y3RvcixcbiAgICAvLyBzb21lIGFzIGdldHRlcnMuIFdlIHJlbHkgb24gdGhlIGZhY3QgdGhhdCB0aGV5IGFyZSBhbHJlYWR5IHNvcnRlZCB0b3BvbG9naWNhbGx5LlxuICAgIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzLnZhbHVlcygpLmZvckVhY2goKHJlc29sdmVkUHJvdmlkZXIpID0+IHtcbiAgICAgIHZhciBwcm92aWRlclZhbHVlRXhwcmVzc2lvbnMgPSByZXNvbHZlZFByb3ZpZGVyLnByb3ZpZGVycy5tYXAoKHByb3ZpZGVyKSA9PiB7XG4gICAgICAgIGlmIChpc1ByZXNlbnQocHJvdmlkZXIudXNlRXhpc3RpbmcpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2dldERlcGVuZGVuY3koXG4gICAgICAgICAgICAgIHJlc29sdmVkUHJvdmlkZXIucHJvdmlkZXJUeXBlLFxuICAgICAgICAgICAgICBuZXcgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhKHt0b2tlbjogcHJvdmlkZXIudXNlRXhpc3Rpbmd9KSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KHByb3ZpZGVyLnVzZUZhY3RvcnkpKSB7XG4gICAgICAgICAgdmFyIGRlcHMgPSBpc1ByZXNlbnQocHJvdmlkZXIuZGVwcykgPyBwcm92aWRlci5kZXBzIDogcHJvdmlkZXIudXNlRmFjdG9yeS5kaURlcHM7XG4gICAgICAgICAgdmFyIGRlcHNFeHByID0gZGVwcy5tYXAoKGRlcCkgPT4gdGhpcy5fZ2V0RGVwZW5kZW5jeShyZXNvbHZlZFByb3ZpZGVyLnByb3ZpZGVyVHlwZSwgZGVwKSk7XG4gICAgICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihwcm92aWRlci51c2VGYWN0b3J5KS5jYWxsRm4oZGVwc0V4cHIpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VDbGFzcykpIHtcbiAgICAgICAgICB2YXIgZGVwcyA9IGlzUHJlc2VudChwcm92aWRlci5kZXBzKSA/IHByb3ZpZGVyLmRlcHMgOiBwcm92aWRlci51c2VDbGFzcy5kaURlcHM7XG4gICAgICAgICAgdmFyIGRlcHNFeHByID0gZGVwcy5tYXAoKGRlcCkgPT4gdGhpcy5fZ2V0RGVwZW5kZW5jeShyZXNvbHZlZFByb3ZpZGVyLnByb3ZpZGVyVHlwZSwgZGVwKSk7XG4gICAgICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihwcm92aWRlci51c2VDbGFzcylcbiAgICAgICAgICAgICAgLmluc3RhbnRpYXRlKGRlcHNFeHByLCBvLmltcG9ydFR5cGUocHJvdmlkZXIudXNlQ2xhc3MpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAocHJvdmlkZXIudXNlVmFsdWUgaW5zdGFuY2VvZiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gby5pbXBvcnRFeHByKHByb3ZpZGVyLnVzZVZhbHVlKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHByb3ZpZGVyLnVzZVZhbHVlIGluc3RhbmNlb2Ygby5FeHByZXNzaW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvdmlkZXIudXNlVmFsdWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBvLmxpdGVyYWwocHJvdmlkZXIudXNlVmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB2YXIgcHJvcE5hbWUgPSBgXyR7cmVzb2x2ZWRQcm92aWRlci50b2tlbi5uYW1lfV8ke3RoaXMubm9kZUluZGV4fV8ke3RoaXMuX2luc3RhbmNlcy5zaXplfWA7XG4gICAgICB2YXIgaW5zdGFuY2UgPVxuICAgICAgICAgIGNyZWF0ZVByb3ZpZGVyUHJvcGVydHkocHJvcE5hbWUsIHJlc29sdmVkUHJvdmlkZXIsIHByb3ZpZGVyVmFsdWVFeHByZXNzaW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmVkUHJvdmlkZXIubXVsdGlQcm92aWRlciwgcmVzb2x2ZWRQcm92aWRlci5lYWdlciwgdGhpcyk7XG4gICAgICB0aGlzLl9pbnN0YW5jZXMuYWRkKHJlc29sdmVkUHJvdmlkZXIudG9rZW4sIGluc3RhbmNlKTtcbiAgICB9KTtcblxuICAgIHRoaXMuZGlyZWN0aXZlSW5zdGFuY2VzID1cbiAgICAgICAgdGhpcy5fZGlyZWN0aXZlcy5tYXAoKGRpcmVjdGl2ZSkgPT4gdGhpcy5faW5zdGFuY2VzLmdldChpZGVudGlmaWVyVG9rZW4oZGlyZWN0aXZlLnR5cGUpKSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRpcmVjdGl2ZUluc3RhbmNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRpcmVjdGl2ZUluc3RhbmNlID0gdGhpcy5kaXJlY3RpdmVJbnN0YW5jZXNbaV07XG4gICAgICB2YXIgZGlyZWN0aXZlID0gdGhpcy5fZGlyZWN0aXZlc1tpXTtcbiAgICAgIGRpcmVjdGl2ZS5xdWVyaWVzLmZvckVhY2goKHF1ZXJ5TWV0YSkgPT4geyB0aGlzLl9hZGRRdWVyeShxdWVyeU1ldGEsIGRpcmVjdGl2ZUluc3RhbmNlKTsgfSk7XG4gICAgfVxuICAgIHZhciBxdWVyaWVzV2l0aFJlYWRzOiBfUXVlcnlXaXRoUmVhZFtdID0gW107XG4gICAgdGhpcy5fcmVzb2x2ZWRQcm92aWRlcnMudmFsdWVzKCkuZm9yRWFjaCgocmVzb2x2ZWRQcm92aWRlcikgPT4ge1xuICAgICAgdmFyIHF1ZXJpZXNGb3JQcm92aWRlciA9IHRoaXMuX2dldFF1ZXJpZXNGb3IocmVzb2x2ZWRQcm92aWRlci50b2tlbik7XG4gICAgICBMaXN0V3JhcHBlci5hZGRBbGwoXG4gICAgICAgICAgcXVlcmllc1dpdGhSZWFkcyxcbiAgICAgICAgICBxdWVyaWVzRm9yUHJvdmlkZXIubWFwKHF1ZXJ5ID0+IG5ldyBfUXVlcnlXaXRoUmVhZChxdWVyeSwgcmVzb2x2ZWRQcm92aWRlci50b2tlbikpKTtcbiAgICB9KTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2godGhpcy5yZWZlcmVuY2VUb2tlbnMsIChfLCB2YXJOYW1lKSA9PiB7XG4gICAgICB2YXIgdG9rZW4gPSB0aGlzLnJlZmVyZW5jZVRva2Vuc1t2YXJOYW1lXTtcbiAgICAgIHZhciB2YXJWYWx1ZTtcbiAgICAgIGlmIChpc1ByZXNlbnQodG9rZW4pKSB7XG4gICAgICAgIHZhclZhbHVlID0gdGhpcy5faW5zdGFuY2VzLmdldCh0b2tlbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXJWYWx1ZSA9IHRoaXMucmVuZGVyTm9kZTtcbiAgICAgIH1cbiAgICAgIHRoaXMudmlldy5sb2NhbHMuc2V0KHZhck5hbWUsIHZhclZhbHVlKTtcbiAgICAgIHZhciB2YXJUb2tlbiA9IG5ldyBDb21waWxlVG9rZW5NZXRhZGF0YSh7dmFsdWU6IHZhck5hbWV9KTtcbiAgICAgIExpc3RXcmFwcGVyLmFkZEFsbChxdWVyaWVzV2l0aFJlYWRzLCB0aGlzLl9nZXRRdWVyaWVzRm9yKHZhclRva2VuKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKHF1ZXJ5ID0+IG5ldyBfUXVlcnlXaXRoUmVhZChxdWVyeSwgdmFyVG9rZW4pKSk7XG4gICAgfSk7XG4gICAgcXVlcmllc1dpdGhSZWFkcy5mb3JFYWNoKChxdWVyeVdpdGhSZWFkKSA9PiB7XG4gICAgICB2YXIgdmFsdWU6IG8uRXhwcmVzc2lvbjtcbiAgICAgIGlmIChpc1ByZXNlbnQocXVlcnlXaXRoUmVhZC5yZWFkLmlkZW50aWZpZXIpKSB7XG4gICAgICAgIC8vIHF1ZXJ5IGZvciBhbiBpZGVudGlmaWVyXG4gICAgICAgIHZhbHVlID0gdGhpcy5faW5zdGFuY2VzLmdldChxdWVyeVdpdGhSZWFkLnJlYWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcXVlcnkgZm9yIGEgcmVmZXJlbmNlXG4gICAgICAgIHZhciB0b2tlbiA9IHRoaXMucmVmZXJlbmNlVG9rZW5zW3F1ZXJ5V2l0aFJlYWQucmVhZC52YWx1ZV07XG4gICAgICAgIGlmIChpc1ByZXNlbnQodG9rZW4pKSB7XG4gICAgICAgICAgdmFsdWUgPSB0aGlzLl9pbnN0YW5jZXMuZ2V0KHRva2VuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWx1ZSA9IHRoaXMuZWxlbWVudFJlZjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudCh2YWx1ZSkpIHtcbiAgICAgICAgcXVlcnlXaXRoUmVhZC5xdWVyeS5hZGRWYWx1ZSh2YWx1ZSwgdGhpcy52aWV3KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpKSB7XG4gICAgICB2YXIgY29tcG9uZW50Q29uc3RydWN0b3JWaWV3UXVlcnlMaXN0ID1cbiAgICAgICAgICBpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpID8gby5saXRlcmFsQXJyKHRoaXMuX2NvbXBvbmVudENvbnN0cnVjdG9yVmlld1F1ZXJ5TGlzdHMpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5OVUxMX0VYUFI7XG4gICAgICB2YXIgY29tcEV4cHIgPSBpc1ByZXNlbnQodGhpcy5nZXRDb21wb25lbnQoKSkgPyB0aGlzLmdldENvbXBvbmVudCgpIDogby5OVUxMX0VYUFI7XG4gICAgICB0aGlzLnZpZXcuY3JlYXRlTWV0aG9kLmFkZFN0bXQoXG4gICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmNhbGxNZXRob2QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpbml0Q29tcG9uZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2NvbXBFeHByLCBjb21wb25lbnRDb25zdHJ1Y3RvclZpZXdRdWVyeUxpc3QsIHRoaXMuX2NvbXBWaWV3RXhwcl0pXG4gICAgICAgICAgICAgIC50b1N0bXQoKSk7XG4gICAgfVxuICB9XG5cbiAgYWZ0ZXJDaGlsZHJlbihjaGlsZE5vZGVDb3VudDogbnVtYmVyKSB7XG4gICAgdGhpcy5fcmVzb2x2ZWRQcm92aWRlcnMudmFsdWVzKCkuZm9yRWFjaCgocmVzb2x2ZWRQcm92aWRlcikgPT4ge1xuICAgICAgLy8gTm90ZTogYWZ0ZXJDaGlsZHJlbiBpcyBjYWxsZWQgYWZ0ZXIgcmVjdXJzaW5nIGludG8gY2hpbGRyZW4uXG4gICAgICAvLyBUaGlzIGlzIGdvb2Qgc28gdGhhdCBhbiBpbmplY3RvciBtYXRjaCBpbiBhbiBlbGVtZW50IHRoYXQgaXMgY2xvc2VyIHRvIGEgcmVxdWVzdGluZyBlbGVtZW50XG4gICAgICAvLyBtYXRjaGVzIGZpcnN0LlxuICAgICAgdmFyIHByb3ZpZGVyRXhwciA9IHRoaXMuX2luc3RhbmNlcy5nZXQocmVzb2x2ZWRQcm92aWRlci50b2tlbik7XG4gICAgICAvLyBOb3RlOiB2aWV3IHByb3ZpZGVycyBhcmUgb25seSB2aXNpYmxlIG9uIHRoZSBpbmplY3RvciBvZiB0aGF0IGVsZW1lbnQuXG4gICAgICAvLyBUaGlzIGlzIG5vdCBmdWxseSBjb3JyZWN0IGFzIHRoZSBydWxlcyBkdXJpbmcgY29kZWdlbiBkb24ndCBhbGxvdyBhIGRpcmVjdGl2ZVxuICAgICAgLy8gdG8gZ2V0IGhvbGQgb2YgYSB2aWV3IHByb3ZkaWVyIG9uIHRoZSBzYW1lIGVsZW1lbnQuIFdlIHN0aWxsIGRvIHRoaXMgc2VtYW50aWNcbiAgICAgIC8vIGFzIGl0IHNpbXBsaWZpZXMgb3VyIG1vZGVsIHRvIGhhdmluZyBvbmx5IG9uZSBydW50aW1lIGluamVjdG9yIHBlciBlbGVtZW50LlxuICAgICAgdmFyIHByb3ZpZGVyQ2hpbGROb2RlQ291bnQgPVxuICAgICAgICAgIHJlc29sdmVkUHJvdmlkZXIucHJvdmlkZXJUeXBlID09PSBQcm92aWRlckFzdFR5cGUuUHJpdmF0ZVNlcnZpY2UgPyAwIDogY2hpbGROb2RlQ291bnQ7XG4gICAgICB0aGlzLnZpZXcuaW5qZWN0b3JHZXRNZXRob2QuYWRkU3RtdChjcmVhdGVJbmplY3RJbnRlcm5hbENvbmRpdGlvbihcbiAgICAgICAgICB0aGlzLm5vZGVJbmRleCwgcHJvdmlkZXJDaGlsZE5vZGVDb3VudCwgcmVzb2x2ZWRQcm92aWRlciwgcHJvdmlkZXJFeHByKSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9xdWVyaWVzLnZhbHVlcygpLmZvckVhY2goXG4gICAgICAgIChxdWVyaWVzKSA9PlxuICAgICAgICAgICAgcXVlcmllcy5mb3JFYWNoKChxdWVyeSkgPT4gcXVlcnkuYWZ0ZXJDaGlsZHJlbih0aGlzLnZpZXcudXBkYXRlQ29udGVudFF1ZXJpZXNNZXRob2QpKSk7XG4gIH1cblxuICBhZGRDb250ZW50Tm9kZShuZ0NvbnRlbnRJbmRleDogbnVtYmVyLCBub2RlRXhwcjogby5FeHByZXNzaW9uKSB7XG4gICAgdGhpcy5jb250ZW50Tm9kZXNCeU5nQ29udGVudEluZGV4W25nQ29udGVudEluZGV4XS5wdXNoKG5vZGVFeHByKTtcbiAgfVxuXG4gIGdldENvbXBvbmVudCgpOiBvLkV4cHJlc3Npb24ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpID8gdGhpcy5faW5zdGFuY2VzLmdldChpZGVudGlmaWVyVG9rZW4odGhpcy5jb21wb25lbnQudHlwZSkpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGw7XG4gIH1cblxuICBnZXRQcm92aWRlclRva2VucygpOiBvLkV4cHJlc3Npb25bXSB7XG4gICAgcmV0dXJuIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzLnZhbHVlcygpLm1hcChcbiAgICAgICAgKHJlc29sdmVkUHJvdmlkZXIpID0+IGNyZWF0ZURpVG9rZW5FeHByZXNzaW9uKHJlc29sdmVkUHJvdmlkZXIudG9rZW4pKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFF1ZXJpZXNGb3IodG9rZW46IENvbXBpbGVUb2tlbk1ldGFkYXRhKTogQ29tcGlsZVF1ZXJ5W10ge1xuICAgIHZhciByZXN1bHQ6IENvbXBpbGVRdWVyeVtdID0gW107XG4gICAgdmFyIGN1cnJlbnRFbDogQ29tcGlsZUVsZW1lbnQgPSB0aGlzO1xuICAgIHZhciBkaXN0YW5jZSA9IDA7XG4gICAgdmFyIHF1ZXJpZXM6IENvbXBpbGVRdWVyeVtdO1xuICAgIHdoaWxlICghY3VycmVudEVsLmlzTnVsbCgpKSB7XG4gICAgICBxdWVyaWVzID0gY3VycmVudEVsLl9xdWVyaWVzLmdldCh0b2tlbik7XG4gICAgICBpZiAoaXNQcmVzZW50KHF1ZXJpZXMpKSB7XG4gICAgICAgIExpc3RXcmFwcGVyLmFkZEFsbChyZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVyaWVzLmZpbHRlcigocXVlcnkpID0+IHF1ZXJ5Lm1ldGEuZGVzY2VuZGFudHMgfHwgZGlzdGFuY2UgPD0gMSkpO1xuICAgICAgfVxuICAgICAgaWYgKGN1cnJlbnRFbC5fZGlyZWN0aXZlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGRpc3RhbmNlKys7XG4gICAgICB9XG4gICAgICBjdXJyZW50RWwgPSBjdXJyZW50RWwucGFyZW50O1xuICAgIH1cbiAgICBxdWVyaWVzID0gdGhpcy52aWV3LmNvbXBvbmVudFZpZXcudmlld1F1ZXJpZXMuZ2V0KHRva2VuKTtcbiAgICBpZiAoaXNQcmVzZW50KHF1ZXJpZXMpKSB7XG4gICAgICBMaXN0V3JhcHBlci5hZGRBbGwocmVzdWx0LCBxdWVyaWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgX2FkZFF1ZXJ5KHF1ZXJ5TWV0YTogQ29tcGlsZVF1ZXJ5TWV0YWRhdGEsXG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdGl2ZUluc3RhbmNlOiBvLkV4cHJlc3Npb24pOiBDb21waWxlUXVlcnkge1xuICAgIHZhciBwcm9wTmFtZSA9IGBfcXVlcnlfJHtxdWVyeU1ldGEuc2VsZWN0b3JzWzBdLm5hbWV9XyR7dGhpcy5ub2RlSW5kZXh9XyR7dGhpcy5fcXVlcnlDb3VudCsrfWA7XG4gICAgdmFyIHF1ZXJ5TGlzdCA9IGNyZWF0ZVF1ZXJ5TGlzdChxdWVyeU1ldGEsIGRpcmVjdGl2ZUluc3RhbmNlLCBwcm9wTmFtZSwgdGhpcy52aWV3KTtcbiAgICB2YXIgcXVlcnkgPSBuZXcgQ29tcGlsZVF1ZXJ5KHF1ZXJ5TWV0YSwgcXVlcnlMaXN0LCBkaXJlY3RpdmVJbnN0YW5jZSwgdGhpcy52aWV3KTtcbiAgICBhZGRRdWVyeVRvVG9rZW5NYXAodGhpcy5fcXVlcmllcywgcXVlcnkpO1xuICAgIHJldHVybiBxdWVyeTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldExvY2FsRGVwZW5kZW5jeShyZXF1ZXN0aW5nUHJvdmlkZXJUeXBlOiBQcm92aWRlckFzdFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXA6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSk6IG8uRXhwcmVzc2lvbiB7XG4gICAgdmFyIHJlc3VsdCA9IG51bGw7XG4gICAgLy8gY29uc3RydWN0b3IgY29udGVudCBxdWVyeVxuICAgIGlmIChpc0JsYW5rKHJlc3VsdCkgJiYgaXNQcmVzZW50KGRlcC5xdWVyeSkpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX2FkZFF1ZXJ5KGRlcC5xdWVyeSwgbnVsbCkucXVlcnlMaXN0O1xuICAgIH1cblxuICAgIC8vIGNvbnN0cnVjdG9yIHZpZXcgcXVlcnlcbiAgICBpZiAoaXNCbGFuayhyZXN1bHQpICYmIGlzUHJlc2VudChkZXAudmlld1F1ZXJ5KSkge1xuICAgICAgcmVzdWx0ID0gY3JlYXRlUXVlcnlMaXN0KFxuICAgICAgICAgIGRlcC52aWV3UXVlcnksIG51bGwsXG4gICAgICAgICAgYF92aWV3UXVlcnlfJHtkZXAudmlld1F1ZXJ5LnNlbGVjdG9yc1swXS5uYW1lfV8ke3RoaXMubm9kZUluZGV4fV8ke3RoaXMuX2NvbXBvbmVudENvbnN0cnVjdG9yVmlld1F1ZXJ5TGlzdHMubGVuZ3RofWAsXG4gICAgICAgICAgdGhpcy52aWV3KTtcbiAgICAgIHRoaXMuX2NvbXBvbmVudENvbnN0cnVjdG9yVmlld1F1ZXJ5TGlzdHMucHVzaChyZXN1bHQpO1xuICAgIH1cblxuICAgIGlmIChpc1ByZXNlbnQoZGVwLnRva2VuKSkge1xuICAgICAgLy8gYWNjZXNzIGJ1aWx0aW5zIHdpdGggc3BlY2lhbCB2aXNpYmlsaXR5XG4gICAgICBpZiAoaXNCbGFuayhyZXN1bHQpKSB7XG4gICAgICAgIGlmIChkZXAudG9rZW4uZXF1YWxzVG8oaWRlbnRpZmllclRva2VuKElkZW50aWZpZXJzLkNoYW5nZURldGVjdG9yUmVmKSkpIHtcbiAgICAgICAgICBpZiAocmVxdWVzdGluZ1Byb3ZpZGVyVHlwZSA9PT0gUHJvdmlkZXJBc3RUeXBlLkNvbXBvbmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbXBWaWV3RXhwci5wcm9wKCdyZWYnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGdldFByb3BlcnR5SW5WaWV3KG8uVEhJU19FWFBSLnByb3AoJ3JlZicpLCB0aGlzLnZpZXcsIHRoaXMudmlldy5jb21wb25lbnRWaWV3KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGFjY2VzcyByZWd1bGFyIHByb3ZpZGVycyBvbiB0aGUgZWxlbWVudFxuICAgICAgaWYgKGlzQmxhbmsocmVzdWx0KSkge1xuICAgICAgICByZXN1bHQgPSB0aGlzLl9pbnN0YW5jZXMuZ2V0KGRlcC50b2tlbik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIF9nZXREZXBlbmRlbmN5KHJlcXVlc3RpbmdQcm92aWRlclR5cGU6IFByb3ZpZGVyQXN0VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICBkZXA6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSk6IG8uRXhwcmVzc2lvbiB7XG4gICAgdmFyIGN1cnJFbGVtZW50OiBDb21waWxlRWxlbWVudCA9IHRoaXM7XG4gICAgdmFyIHJlc3VsdCA9IG51bGw7XG4gICAgaWYgKGRlcC5pc1ZhbHVlKSB7XG4gICAgICByZXN1bHQgPSBvLmxpdGVyYWwoZGVwLnZhbHVlKTtcbiAgICB9XG4gICAgaWYgKGlzQmxhbmsocmVzdWx0KSAmJiAhZGVwLmlzU2tpcFNlbGYpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX2dldExvY2FsRGVwZW5kZW5jeShyZXF1ZXN0aW5nUHJvdmlkZXJUeXBlLCBkZXApO1xuICAgIH1cbiAgICAvLyBjaGVjayBwYXJlbnQgZWxlbWVudHNcbiAgICB3aGlsZSAoaXNCbGFuayhyZXN1bHQpICYmICFjdXJyRWxlbWVudC5wYXJlbnQuaXNOdWxsKCkpIHtcbiAgICAgIGN1cnJFbGVtZW50ID0gY3VyckVsZW1lbnQucGFyZW50O1xuICAgICAgcmVzdWx0ID0gY3VyckVsZW1lbnQuX2dldExvY2FsRGVwZW5kZW5jeShQcm92aWRlckFzdFR5cGUuUHVibGljU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSh7dG9rZW46IGRlcC50b2tlbn0pKTtcbiAgICB9XG5cbiAgICBpZiAoaXNCbGFuayhyZXN1bHQpKSB7XG4gICAgICByZXN1bHQgPSBpbmplY3RGcm9tVmlld1BhcmVudEluamVjdG9yKGRlcC50b2tlbiwgZGVwLmlzT3B0aW9uYWwpO1xuICAgIH1cbiAgICBpZiAoaXNCbGFuayhyZXN1bHQpKSB7XG4gICAgICByZXN1bHQgPSBvLk5VTExfRVhQUjtcbiAgICB9XG4gICAgcmV0dXJuIGdldFByb3BlcnR5SW5WaWV3KHJlc3VsdCwgdGhpcy52aWV3LCBjdXJyRWxlbWVudC52aWV3KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVJbmplY3RJbnRlcm5hbENvbmRpdGlvbihub2RlSW5kZXg6IG51bWJlciwgY2hpbGROb2RlQ291bnQ6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyOiBQcm92aWRlckFzdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyRXhwcjogby5FeHByZXNzaW9uKTogby5TdGF0ZW1lbnQge1xuICB2YXIgaW5kZXhDb25kaXRpb247XG4gIGlmIChjaGlsZE5vZGVDb3VudCA+IDApIHtcbiAgICBpbmRleENvbmRpdGlvbiA9IG8ubGl0ZXJhbChub2RlSW5kZXgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmxvd2VyRXF1YWxzKEluamVjdE1ldGhvZFZhcnMucmVxdWVzdE5vZGVJbmRleClcbiAgICAgICAgICAgICAgICAgICAgICAgICAuYW5kKEluamVjdE1ldGhvZFZhcnMucmVxdWVzdE5vZGVJbmRleC5sb3dlckVxdWFscyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5saXRlcmFsKG5vZGVJbmRleCArIGNoaWxkTm9kZUNvdW50KSkpO1xuICB9IGVsc2Uge1xuICAgIGluZGV4Q29uZGl0aW9uID0gby5saXRlcmFsKG5vZGVJbmRleCkuaWRlbnRpY2FsKEluamVjdE1ldGhvZFZhcnMucmVxdWVzdE5vZGVJbmRleCk7XG4gIH1cbiAgcmV0dXJuIG5ldyBvLklmU3RtdChcbiAgICAgIEluamVjdE1ldGhvZFZhcnMudG9rZW4uaWRlbnRpY2FsKGNyZWF0ZURpVG9rZW5FeHByZXNzaW9uKHByb3ZpZGVyLnRva2VuKSkuYW5kKGluZGV4Q29uZGl0aW9uKSxcbiAgICAgIFtuZXcgby5SZXR1cm5TdGF0ZW1lbnQocHJvdmlkZXJFeHByKV0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVQcm92aWRlclByb3BlcnR5KHByb3BOYW1lOiBzdHJpbmcsIHByb3ZpZGVyOiBQcm92aWRlckFzdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJWYWx1ZUV4cHJlc3Npb25zOiBvLkV4cHJlc3Npb25bXSwgaXNNdWx0aTogYm9vbGVhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNFYWdlcjogYm9vbGVhbiwgY29tcGlsZUVsZW1lbnQ6IENvbXBpbGVFbGVtZW50KTogby5FeHByZXNzaW9uIHtcbiAgdmFyIHZpZXcgPSBjb21waWxlRWxlbWVudC52aWV3O1xuICB2YXIgcmVzb2x2ZWRQcm92aWRlclZhbHVlRXhwcjtcbiAgdmFyIHR5cGU7XG4gIGlmIChpc011bHRpKSB7XG4gICAgcmVzb2x2ZWRQcm92aWRlclZhbHVlRXhwciA9IG8ubGl0ZXJhbEFycihwcm92aWRlclZhbHVlRXhwcmVzc2lvbnMpO1xuICAgIHR5cGUgPSBuZXcgby5BcnJheVR5cGUoby5EWU5BTUlDX1RZUEUpO1xuICB9IGVsc2Uge1xuICAgIHJlc29sdmVkUHJvdmlkZXJWYWx1ZUV4cHIgPSBwcm92aWRlclZhbHVlRXhwcmVzc2lvbnNbMF07XG4gICAgdHlwZSA9IHByb3ZpZGVyVmFsdWVFeHByZXNzaW9uc1swXS50eXBlO1xuICB9XG4gIGlmIChpc0JsYW5rKHR5cGUpKSB7XG4gICAgdHlwZSA9IG8uRFlOQU1JQ19UWVBFO1xuICB9XG4gIGlmIChpc0VhZ2VyKSB7XG4gICAgdmlldy5maWVsZHMucHVzaChuZXcgby5DbGFzc0ZpZWxkKHByb3BOYW1lLCB0eXBlLCBbby5TdG10TW9kaWZpZXIuUHJpdmF0ZV0pKTtcbiAgICB2aWV3LmNyZWF0ZU1ldGhvZC5hZGRTdG10KG8uVEhJU19FWFBSLnByb3AocHJvcE5hbWUpLnNldChyZXNvbHZlZFByb3ZpZGVyVmFsdWVFeHByKS50b1N0bXQoKSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGludGVybmFsRmllbGQgPSBgXyR7cHJvcE5hbWV9YDtcbiAgICB2aWV3LmZpZWxkcy5wdXNoKG5ldyBvLkNsYXNzRmllbGQoaW50ZXJuYWxGaWVsZCwgdHlwZSwgW28uU3RtdE1vZGlmaWVyLlByaXZhdGVdKSk7XG4gICAgdmFyIGdldHRlciA9IG5ldyBDb21waWxlTWV0aG9kKHZpZXcpO1xuICAgIGdldHRlci5yZXNldERlYnVnSW5mbyhjb21waWxlRWxlbWVudC5ub2RlSW5kZXgsIGNvbXBpbGVFbGVtZW50LnNvdXJjZUFzdCk7XG4gICAgLy8gTm90ZTogRXF1YWxzIGlzIGltcG9ydGFudCBmb3IgSlMgc28gdGhhdCBpdCBhbHNvIGNoZWNrcyB0aGUgdW5kZWZpbmVkIGNhc2UhXG4gICAgZ2V0dGVyLmFkZFN0bXQoXG4gICAgICAgIG5ldyBvLklmU3RtdChvLlRISVNfRVhQUi5wcm9wKGludGVybmFsRmllbGQpLmlzQmxhbmsoKSxcbiAgICAgICAgICAgICAgICAgICAgIFtvLlRISVNfRVhQUi5wcm9wKGludGVybmFsRmllbGQpLnNldChyZXNvbHZlZFByb3ZpZGVyVmFsdWVFeHByKS50b1N0bXQoKV0pKTtcbiAgICBnZXR0ZXIuYWRkU3RtdChuZXcgby5SZXR1cm5TdGF0ZW1lbnQoby5USElTX0VYUFIucHJvcChpbnRlcm5hbEZpZWxkKSkpO1xuICAgIHZpZXcuZ2V0dGVycy5wdXNoKG5ldyBvLkNsYXNzR2V0dGVyKHByb3BOYW1lLCBnZXR0ZXIuZmluaXNoKCksIHR5cGUpKTtcbiAgfVxuICByZXR1cm4gby5USElTX0VYUFIucHJvcChwcm9wTmFtZSk7XG59XG5cbmNsYXNzIF9RdWVyeVdpdGhSZWFkIHtcbiAgcHVibGljIHJlYWQ6IENvbXBpbGVUb2tlbk1ldGFkYXRhO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcXVlcnk6IENvbXBpbGVRdWVyeSwgbWF0Y2g6IENvbXBpbGVUb2tlbk1ldGFkYXRhKSB7XG4gICAgdGhpcy5yZWFkID0gaXNQcmVzZW50KHF1ZXJ5Lm1ldGEucmVhZCkgPyBxdWVyeS5tZXRhLnJlYWQgOiBtYXRjaDtcbiAgfVxufVxuIl19