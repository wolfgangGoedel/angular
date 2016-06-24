'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var o = require('../output/output_ast');
var identifiers_1 = require('../identifiers');
var constants_1 = require('./constants');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var template_ast_1 = require('../template_ast');
var compile_metadata_1 = require('../compile_metadata');
var util_1 = require('./util');
var compile_query_1 = require('./compile_query');
var compile_method_1 = require('./compile_method');
var CompileNode = (function () {
    function CompileNode(parent, view, nodeIndex, renderNode, sourceAst) {
        this.parent = parent;
        this.view = view;
        this.nodeIndex = nodeIndex;
        this.renderNode = renderNode;
        this.sourceAst = sourceAst;
    }
    CompileNode.prototype.isNull = function () { return lang_1.isBlank(this.renderNode); };
    CompileNode.prototype.isRootElement = function () { return this.view != this.parent.view; };
    return CompileNode;
}());
exports.CompileNode = CompileNode;
var CompileElement = (function (_super) {
    __extends(CompileElement, _super);
    function CompileElement(parent, view, nodeIndex, renderNode, sourceAst, component, _directives, _resolvedProvidersArray, hasViewContainer, hasEmbeddedView, references) {
        var _this = this;
        _super.call(this, parent, view, nodeIndex, renderNode, sourceAst);
        this.component = component;
        this._directives = _directives;
        this._resolvedProvidersArray = _resolvedProvidersArray;
        this.hasViewContainer = hasViewContainer;
        this.hasEmbeddedView = hasEmbeddedView;
        this._compViewExpr = null;
        this._instances = new compile_metadata_1.CompileTokenMap();
        this._queryCount = 0;
        this._queries = new compile_metadata_1.CompileTokenMap();
        this._componentConstructorViewQueryLists = [];
        this.contentNodesByNgContentIndex = null;
        this.referenceTokens = {};
        references.forEach(function (ref) { return _this.referenceTokens[ref.name] = ref.value; });
        this.elementRef = o.importExpr(identifiers_1.Identifiers.ElementRef).instantiate([this.renderNode]);
        this._instances.add(identifiers_1.identifierToken(identifiers_1.Identifiers.ElementRef), this.elementRef);
        this.injector = o.THIS_EXPR.callMethod('injector', [o.literal(this.nodeIndex)]);
        this._instances.add(identifiers_1.identifierToken(identifiers_1.Identifiers.Injector), this.injector);
        this._instances.add(identifiers_1.identifierToken(identifiers_1.Identifiers.Renderer), o.THIS_EXPR.prop('renderer'));
        if (this.hasViewContainer || this.hasEmbeddedView || lang_1.isPresent(this.component)) {
            this._createAppElement();
        }
    }
    CompileElement.createNull = function () {
        return new CompileElement(null, null, null, null, null, null, [], [], false, false, []);
    };
    CompileElement.prototype._createAppElement = function () {
        var fieldName = "_appEl_" + this.nodeIndex;
        var parentNodeIndex = this.isRootElement() ? null : this.parent.nodeIndex;
        this.view.fields.push(new o.ClassField(fieldName, o.importType(identifiers_1.Identifiers.AppElement), [o.StmtModifier.Private]));
        var statement = o.THIS_EXPR.prop(fieldName)
            .set(o.importExpr(identifiers_1.Identifiers.AppElement)
            .instantiate([
            o.literal(this.nodeIndex),
            o.literal(parentNodeIndex),
            o.THIS_EXPR,
            this.renderNode
        ]))
            .toStmt();
        this.view.createMethod.addStmt(statement);
        this.appElement = o.THIS_EXPR.prop(fieldName);
        this._instances.add(identifiers_1.identifierToken(identifiers_1.Identifiers.AppElement), this.appElement);
    };
    CompileElement.prototype.setComponentView = function (compViewExpr) {
        this._compViewExpr = compViewExpr;
        this.contentNodesByNgContentIndex =
            collection_1.ListWrapper.createFixedSize(this.component.template.ngContentSelectors.length);
        for (var i = 0; i < this.contentNodesByNgContentIndex.length; i++) {
            this.contentNodesByNgContentIndex[i] = [];
        }
    };
    CompileElement.prototype.setEmbeddedView = function (embeddedView) {
        this.embeddedView = embeddedView;
        if (lang_1.isPresent(embeddedView)) {
            var createTemplateRefExpr = o.importExpr(identifiers_1.Identifiers.TemplateRef_)
                .instantiate([this.appElement, this.embeddedView.viewFactory]);
            var provider = new compile_metadata_1.CompileProviderMetadata({ token: identifiers_1.identifierToken(identifiers_1.Identifiers.TemplateRef), useValue: createTemplateRefExpr });
            // Add TemplateRef as first provider as it does not have deps on other providers
            this._resolvedProvidersArray.unshift(new template_ast_1.ProviderAst(provider.token, false, true, [provider], template_ast_1.ProviderAstType.Builtin, this.sourceAst.sourceSpan));
        }
    };
    CompileElement.prototype.beforeChildren = function () {
        var _this = this;
        if (this.hasViewContainer) {
            this._instances.add(identifiers_1.identifierToken(identifiers_1.Identifiers.ViewContainerRef), this.appElement.prop('vcRef'));
        }
        this._resolvedProviders = new compile_metadata_1.CompileTokenMap();
        this._resolvedProvidersArray.forEach(function (provider) {
            return _this._resolvedProviders.add(provider.token, provider);
        });
        // create all the provider instances, some in the view constructor,
        // some as getters. We rely on the fact that they are already sorted topologically.
        this._resolvedProviders.values().forEach(function (resolvedProvider) {
            var providerValueExpressions = resolvedProvider.providers.map(function (provider) {
                var providerValue;
                if (lang_1.isPresent(provider.useExisting)) {
                    providerValue =
                        _this._getDependency(resolvedProvider.providerType, new compile_metadata_1.CompileDiDependencyMetadata({ token: provider.useExisting }));
                }
                else if (lang_1.isPresent(provider.useFactory)) {
                    var deps = lang_1.isPresent(provider.deps) ? provider.deps : provider.useFactory.diDeps;
                    var depsExpr = deps.map(function (dep) { return _this._getDependency(resolvedProvider.providerType, dep); });
                    providerValue = o.importExpr(provider.useFactory).callFn(depsExpr);
                }
                else if (lang_1.isPresent(provider.useClass)) {
                    var deps = lang_1.isPresent(provider.deps) ? provider.deps : provider.useClass.diDeps;
                    var depsExpr = deps.map(function (dep) { return _this._getDependency(resolvedProvider.providerType, dep); });
                    providerValue = o.importExpr(provider.useClass)
                        .instantiate(depsExpr, o.importType(provider.useClass));
                }
                else {
                    providerValue = util_1.convertValueToOutputAst(provider.useValue);
                }
                if (lang_1.isPresent(provider.useProperty)) {
                    providerValue = providerValue.prop(provider.useProperty);
                }
                return providerValue;
            });
            var propName = "_" + resolvedProvider.token.name + "_" + _this.nodeIndex + "_" + _this._instances.size;
            var instance = createProviderProperty(propName, resolvedProvider, providerValueExpressions, resolvedProvider.multiProvider, resolvedProvider.eager, _this);
            _this._instances.add(resolvedProvider.token, instance);
        });
        this.directiveInstances =
            this._directives.map(function (directive) { return _this._instances.get(identifiers_1.identifierToken(directive.type)); });
        for (var i = 0; i < this.directiveInstances.length; i++) {
            var directiveInstance = this.directiveInstances[i];
            var directive = this._directives[i];
            directive.queries.forEach(function (queryMeta) { _this._addQuery(queryMeta, directiveInstance); });
        }
        var queriesWithReads = [];
        this._resolvedProviders.values().forEach(function (resolvedProvider) {
            var queriesForProvider = _this._getQueriesFor(resolvedProvider.token);
            collection_1.ListWrapper.addAll(queriesWithReads, queriesForProvider.map(function (query) { return new _QueryWithRead(query, resolvedProvider.token); }));
        });
        collection_1.StringMapWrapper.forEach(this.referenceTokens, function (_, varName) {
            var token = _this.referenceTokens[varName];
            var varValue;
            if (lang_1.isPresent(token)) {
                varValue = _this._instances.get(token);
            }
            else {
                varValue = _this.renderNode;
            }
            _this.view.locals.set(varName, varValue);
            var varToken = new compile_metadata_1.CompileTokenMetadata({ value: varName });
            collection_1.ListWrapper.addAll(queriesWithReads, _this._getQueriesFor(varToken)
                .map(function (query) { return new _QueryWithRead(query, varToken); }));
        });
        queriesWithReads.forEach(function (queryWithRead) {
            var value;
            if (lang_1.isPresent(queryWithRead.read.identifier)) {
                // query for an identifier
                value = _this._instances.get(queryWithRead.read);
            }
            else {
                // query for a reference
                var token = _this.referenceTokens[queryWithRead.read.value];
                if (lang_1.isPresent(token)) {
                    value = _this._instances.get(token);
                }
                else {
                    value = _this.elementRef;
                }
            }
            if (lang_1.isPresent(value)) {
                queryWithRead.query.addValue(value, _this.view);
            }
        });
        if (lang_1.isPresent(this.component)) {
            var componentConstructorViewQueryList = lang_1.isPresent(this.component) ? o.literalArr(this._componentConstructorViewQueryLists) :
                o.NULL_EXPR;
            var compExpr = lang_1.isPresent(this.getComponent()) ? this.getComponent() : o.NULL_EXPR;
            this.view.createMethod.addStmt(this.appElement.callMethod('initComponent', [compExpr, componentConstructorViewQueryList, this._compViewExpr])
                .toStmt());
        }
    };
    CompileElement.prototype.afterChildren = function (childNodeCount) {
        var _this = this;
        this._resolvedProviders.values().forEach(function (resolvedProvider) {
            // Note: afterChildren is called after recursing into children.
            // This is good so that an injector match in an element that is closer to a requesting element
            // matches first.
            var providerExpr = _this._instances.get(resolvedProvider.token);
            // Note: view providers are only visible on the injector of that element.
            // This is not fully correct as the rules during codegen don't allow a directive
            // to get hold of a view provdier on the same element. We still do this semantic
            // as it simplifies our model to having only one runtime injector per element.
            var providerChildNodeCount = resolvedProvider.providerType === template_ast_1.ProviderAstType.PrivateService ? 0 : childNodeCount;
            _this.view.injectorGetMethod.addStmt(createInjectInternalCondition(_this.nodeIndex, providerChildNodeCount, resolvedProvider, providerExpr));
        });
        this._queries.values().forEach(function (queries) {
            return queries.forEach(function (query) { return query.afterChildren(_this.view.createMethod, _this.view.updateContentQueriesMethod); });
        });
    };
    CompileElement.prototype.addContentNode = function (ngContentIndex, nodeExpr) {
        this.contentNodesByNgContentIndex[ngContentIndex].push(nodeExpr);
    };
    CompileElement.prototype.getComponent = function () {
        return lang_1.isPresent(this.component) ? this._instances.get(identifiers_1.identifierToken(this.component.type)) :
            null;
    };
    CompileElement.prototype.getProviderTokens = function () {
        return this._resolvedProviders.values().map(function (resolvedProvider) { return util_1.createDiTokenExpression(resolvedProvider.token); });
    };
    CompileElement.prototype._getQueriesFor = function (token) {
        var result = [];
        var currentEl = this;
        var distance = 0;
        var queries;
        while (!currentEl.isNull()) {
            queries = currentEl._queries.get(token);
            if (lang_1.isPresent(queries)) {
                collection_1.ListWrapper.addAll(result, queries.filter(function (query) { return query.meta.descendants || distance <= 1; }));
            }
            if (currentEl._directives.length > 0) {
                distance++;
            }
            currentEl = currentEl.parent;
        }
        queries = this.view.componentView.viewQueries.get(token);
        if (lang_1.isPresent(queries)) {
            collection_1.ListWrapper.addAll(result, queries);
        }
        return result;
    };
    CompileElement.prototype._addQuery = function (queryMeta, directiveInstance) {
        var propName = "_query_" + queryMeta.selectors[0].name + "_" + this.nodeIndex + "_" + this._queryCount++;
        var queryList = compile_query_1.createQueryList(queryMeta, directiveInstance, propName, this.view);
        var query = new compile_query_1.CompileQuery(queryMeta, queryList, directiveInstance, this.view);
        compile_query_1.addQueryToTokenMap(this._queries, query);
        return query;
    };
    CompileElement.prototype._getLocalDependency = function (requestingProviderType, dep) {
        var result = null;
        // constructor content query
        if (lang_1.isBlank(result) && lang_1.isPresent(dep.query)) {
            result = this._addQuery(dep.query, null).queryList;
        }
        // constructor view query
        if (lang_1.isBlank(result) && lang_1.isPresent(dep.viewQuery)) {
            result = compile_query_1.createQueryList(dep.viewQuery, null, "_viewQuery_" + dep.viewQuery.selectors[0].name + "_" + this.nodeIndex + "_" + this._componentConstructorViewQueryLists.length, this.view);
            this._componentConstructorViewQueryLists.push(result);
        }
        if (lang_1.isPresent(dep.token)) {
            // access builtins with special visibility
            if (lang_1.isBlank(result)) {
                if (dep.token.equalsTo(identifiers_1.identifierToken(identifiers_1.Identifiers.ChangeDetectorRef))) {
                    if (requestingProviderType === template_ast_1.ProviderAstType.Component) {
                        return this._compViewExpr.prop('ref');
                    }
                    else {
                        return o.THIS_EXPR.prop('ref');
                    }
                }
            }
            // access regular providers on the element
            if (lang_1.isBlank(result)) {
                result = this._instances.get(dep.token);
            }
        }
        return result;
    };
    CompileElement.prototype._getDependency = function (requestingProviderType, dep) {
        var currElement = this;
        var result = null;
        if (dep.isValue) {
            result = o.literal(dep.value);
        }
        if (lang_1.isBlank(result) && !dep.isSkipSelf) {
            result = this._getLocalDependency(requestingProviderType, dep);
        }
        // check parent elements
        while (lang_1.isBlank(result) && !currElement.parent.isNull()) {
            currElement = currElement.parent;
            result = currElement._getLocalDependency(template_ast_1.ProviderAstType.PublicService, new compile_metadata_1.CompileDiDependencyMetadata({ token: dep.token }));
        }
        if (lang_1.isBlank(result)) {
            result = util_1.injectFromViewParentInjector(dep.token, dep.isOptional);
        }
        if (lang_1.isBlank(result)) {
            result = o.NULL_EXPR;
        }
        return util_1.getPropertyInView(result, this.view, currElement.view);
    };
    return CompileElement;
}(CompileNode));
exports.CompileElement = CompileElement;
function createInjectInternalCondition(nodeIndex, childNodeCount, provider, providerExpr) {
    var indexCondition;
    if (childNodeCount > 0) {
        indexCondition = o.literal(nodeIndex)
            .lowerEquals(constants_1.InjectMethodVars.requestNodeIndex)
            .and(constants_1.InjectMethodVars.requestNodeIndex.lowerEquals(o.literal(nodeIndex + childNodeCount)));
    }
    else {
        indexCondition = o.literal(nodeIndex).identical(constants_1.InjectMethodVars.requestNodeIndex);
    }
    return new o.IfStmt(constants_1.InjectMethodVars.token.identical(util_1.createDiTokenExpression(provider.token)).and(indexCondition), [new o.ReturnStatement(providerExpr)]);
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
    if (lang_1.isBlank(type)) {
        type = o.DYNAMIC_TYPE;
    }
    if (isEager) {
        view.fields.push(new o.ClassField(propName, type, [o.StmtModifier.Private]));
        view.createMethod.addStmt(o.THIS_EXPR.prop(propName).set(resolvedProviderValueExpr).toStmt());
    }
    else {
        var internalField = "_" + propName;
        view.fields.push(new o.ClassField(internalField, type, [o.StmtModifier.Private]));
        var getter = new compile_method_1.CompileMethod(view);
        getter.resetDebugInfo(compileElement.nodeIndex, compileElement.sourceAst);
        // Note: Equals is important for JS so that it also checks the undefined case!
        getter.addStmt(new o.IfStmt(o.THIS_EXPR.prop(internalField).isBlank(), [o.THIS_EXPR.prop(internalField).set(resolvedProviderValueExpr).toStmt()]));
        getter.addStmt(new o.ReturnStatement(o.THIS_EXPR.prop(internalField)));
        view.getters.push(new o.ClassGetter(propName, getter.finish(), type));
    }
    return o.THIS_EXPR.prop(propName);
}
var _QueryWithRead = (function () {
    function _QueryWithRead(query, match) {
        this.query = query;
        this.read = lang_1.isPresent(query.meta.read) ? query.meta.read : match;
    }
    return _QueryWithRead;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZV9lbGVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1sTGJmejI5My50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3ZpZXdfY29tcGlsZXIvY29tcGlsZV9lbGVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQVksQ0FBQyxXQUFNLHNCQUFzQixDQUFDLENBQUE7QUFDMUMsNEJBQTJDLGdCQUFnQixDQUFDLENBQUE7QUFDNUQsMEJBQStCLGFBQWEsQ0FBQyxDQUFBO0FBRTdDLHFCQUFpQywwQkFBMEIsQ0FBQyxDQUFBO0FBQzVELDJCQUE0QyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdFLDZCQUFzRSxpQkFBaUIsQ0FBQyxDQUFBO0FBQ3hGLGlDQVNPLHFCQUFxQixDQUFDLENBQUE7QUFDN0IscUJBS08sUUFBUSxDQUFDLENBQUE7QUFDaEIsOEJBQWdFLGlCQUFpQixDQUFDLENBQUE7QUFDbEYsK0JBQTRCLGtCQUFrQixDQUFDLENBQUE7QUFFL0M7SUFDRSxxQkFBbUIsTUFBc0IsRUFBUyxJQUFpQixFQUFTLFNBQWlCLEVBQzFFLFVBQXdCLEVBQVMsU0FBc0I7UUFEdkQsV0FBTSxHQUFOLE1BQU0sQ0FBZ0I7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFhO1FBQVMsY0FBUyxHQUFULFNBQVMsQ0FBUTtRQUMxRSxlQUFVLEdBQVYsVUFBVSxDQUFjO1FBQVMsY0FBUyxHQUFULFNBQVMsQ0FBYTtJQUFHLENBQUM7SUFFOUUsNEJBQU0sR0FBTixjQUFvQixNQUFNLENBQUMsY0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFdEQsbUNBQWEsR0FBYixjQUEyQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEUsa0JBQUM7QUFBRCxD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QUFJLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQ3pDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0YsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUNELE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBRUQ7SUFFRSx3QkFBbUIsS0FBbUIsRUFBRSxLQUEyQjtRQUFoRCxVQUFLLEdBQUwsS0FBSyxDQUFjO1FBQ3BDLElBQUksQ0FBQyxJQUFJLEdBQUcsZ0JBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztJQUNuRSxDQUFDO0lBQ0gscUJBQUM7QUFBRCxDQUFDLEFBTEQsSUFLQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIG8gZnJvbSAnLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtJZGVudGlmaWVycywgaWRlbnRpZmllclRva2VufSBmcm9tICcuLi9pZGVudGlmaWVycyc7XG5pbXBvcnQge0luamVjdE1ldGhvZFZhcnN9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Q29tcGlsZVZpZXd9IGZyb20gJy4vY29tcGlsZV92aWV3JztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7VGVtcGxhdGVBc3QsIFByb3ZpZGVyQXN0LCBQcm92aWRlckFzdFR5cGUsIFJlZmVyZW5jZUFzdH0gZnJvbSAnLi4vdGVtcGxhdGVfYXN0JztcbmltcG9ydCB7XG4gIENvbXBpbGVUb2tlbk1hcCxcbiAgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICBDb21waWxlVG9rZW5NZXRhZGF0YSxcbiAgQ29tcGlsZVF1ZXJ5TWV0YWRhdGEsXG4gIENvbXBpbGVQcm92aWRlck1ldGFkYXRhLFxuICBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEsXG4gIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEsXG4gIENvbXBpbGVUeXBlTWV0YWRhdGEsXG59IGZyb20gJy4uL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0IHtcbiAgZ2V0UHJvcGVydHlJblZpZXcsXG4gIGNyZWF0ZURpVG9rZW5FeHByZXNzaW9uLFxuICBpbmplY3RGcm9tVmlld1BhcmVudEluamVjdG9yLFxuICBjb252ZXJ0VmFsdWVUb091dHB1dEFzdFxufSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtDb21waWxlUXVlcnksIGNyZWF0ZVF1ZXJ5TGlzdCwgYWRkUXVlcnlUb1Rva2VuTWFwfSBmcm9tICcuL2NvbXBpbGVfcXVlcnknO1xuaW1wb3J0IHtDb21waWxlTWV0aG9kfSBmcm9tICcuL2NvbXBpbGVfbWV0aG9kJztcblxuZXhwb3J0IGNsYXNzIENvbXBpbGVOb2RlIHtcbiAgY29uc3RydWN0b3IocHVibGljIHBhcmVudDogQ29tcGlsZUVsZW1lbnQsIHB1YmxpYyB2aWV3OiBDb21waWxlVmlldywgcHVibGljIG5vZGVJbmRleDogbnVtYmVyLFxuICAgICAgICAgICAgICBwdWJsaWMgcmVuZGVyTm9kZTogby5FeHByZXNzaW9uLCBwdWJsaWMgc291cmNlQXN0OiBUZW1wbGF0ZUFzdCkge31cblxuICBpc051bGwoKTogYm9vbGVhbiB7IHJldHVybiBpc0JsYW5rKHRoaXMucmVuZGVyTm9kZSk7IH1cblxuICBpc1Jvb3RFbGVtZW50KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy52aWV3ICE9IHRoaXMucGFyZW50LnZpZXc7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVFbGVtZW50IGV4dGVuZHMgQ29tcGlsZU5vZGUge1xuICBzdGF0aWMgY3JlYXRlTnVsbCgpOiBDb21waWxlRWxlbWVudCB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlRWxlbWVudChudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBbXSwgW10sIGZhbHNlLCBmYWxzZSwgW10pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tcFZpZXdFeHByOiBvLkV4cHJlc3Npb24gPSBudWxsO1xuICBwdWJsaWMgYXBwRWxlbWVudDogby5SZWFkUHJvcEV4cHI7XG4gIHB1YmxpYyBlbGVtZW50UmVmOiBvLkV4cHJlc3Npb247XG4gIHB1YmxpYyBpbmplY3Rvcjogby5FeHByZXNzaW9uO1xuICBwcml2YXRlIF9pbnN0YW5jZXMgPSBuZXcgQ29tcGlsZVRva2VuTWFwPG8uRXhwcmVzc2lvbj4oKTtcbiAgcHJpdmF0ZSBfcmVzb2x2ZWRQcm92aWRlcnM6IENvbXBpbGVUb2tlbk1hcDxQcm92aWRlckFzdD47XG5cbiAgcHJpdmF0ZSBfcXVlcnlDb3VudCA9IDA7XG4gIHByaXZhdGUgX3F1ZXJpZXMgPSBuZXcgQ29tcGlsZVRva2VuTWFwPENvbXBpbGVRdWVyeVtdPigpO1xuICBwcml2YXRlIF9jb21wb25lbnRDb25zdHJ1Y3RvclZpZXdRdWVyeUxpc3RzOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuXG4gIHB1YmxpYyBjb250ZW50Tm9kZXNCeU5nQ29udGVudEluZGV4OiBBcnJheTxvLkV4cHJlc3Npb24+W10gPSBudWxsO1xuICBwdWJsaWMgZW1iZWRkZWRWaWV3OiBDb21waWxlVmlldztcbiAgcHVibGljIGRpcmVjdGl2ZUluc3RhbmNlczogby5FeHByZXNzaW9uW107XG4gIHB1YmxpYyByZWZlcmVuY2VUb2tlbnM6IHtba2V5OiBzdHJpbmddOiBDb21waWxlVG9rZW5NZXRhZGF0YX07XG5cbiAgY29uc3RydWN0b3IocGFyZW50OiBDb21waWxlRWxlbWVudCwgdmlldzogQ29tcGlsZVZpZXcsIG5vZGVJbmRleDogbnVtYmVyLFxuICAgICAgICAgICAgICByZW5kZXJOb2RlOiBvLkV4cHJlc3Npb24sIHNvdXJjZUFzdDogVGVtcGxhdGVBc3QsXG4gICAgICAgICAgICAgIHB1YmxpYyBjb21wb25lbnQ6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10sXG4gICAgICAgICAgICAgIHByaXZhdGUgX3Jlc29sdmVkUHJvdmlkZXJzQXJyYXk6IFByb3ZpZGVyQXN0W10sIHB1YmxpYyBoYXNWaWV3Q29udGFpbmVyOiBib29sZWFuLFxuICAgICAgICAgICAgICBwdWJsaWMgaGFzRW1iZWRkZWRWaWV3OiBib29sZWFuLCByZWZlcmVuY2VzOiBSZWZlcmVuY2VBc3RbXSkge1xuICAgIHN1cGVyKHBhcmVudCwgdmlldywgbm9kZUluZGV4LCByZW5kZXJOb2RlLCBzb3VyY2VBc3QpO1xuICAgIHRoaXMucmVmZXJlbmNlVG9rZW5zID0ge307XG4gICAgcmVmZXJlbmNlcy5mb3JFYWNoKHJlZiA9PiB0aGlzLnJlZmVyZW5jZVRva2Vuc1tyZWYubmFtZV0gPSByZWYudmFsdWUpO1xuXG4gICAgdGhpcy5lbGVtZW50UmVmID0gby5pbXBvcnRFeHByKElkZW50aWZpZXJzLkVsZW1lbnRSZWYpLmluc3RhbnRpYXRlKFt0aGlzLnJlbmRlck5vZGVdKTtcbiAgICB0aGlzLl9pbnN0YW5jZXMuYWRkKGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5FbGVtZW50UmVmKSwgdGhpcy5lbGVtZW50UmVmKTtcbiAgICB0aGlzLmluamVjdG9yID0gby5USElTX0VYUFIuY2FsbE1ldGhvZCgnaW5qZWN0b3InLCBbby5saXRlcmFsKHRoaXMubm9kZUluZGV4KV0pO1xuICAgIHRoaXMuX2luc3RhbmNlcy5hZGQoaWRlbnRpZmllclRva2VuKElkZW50aWZpZXJzLkluamVjdG9yKSwgdGhpcy5pbmplY3Rvcik7XG4gICAgdGhpcy5faW5zdGFuY2VzLmFkZChpZGVudGlmaWVyVG9rZW4oSWRlbnRpZmllcnMuUmVuZGVyZXIpLCBvLlRISVNfRVhQUi5wcm9wKCdyZW5kZXJlcicpKTtcbiAgICBpZiAodGhpcy5oYXNWaWV3Q29udGFpbmVyIHx8IHRoaXMuaGFzRW1iZWRkZWRWaWV3IHx8IGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkpIHtcbiAgICAgIHRoaXMuX2NyZWF0ZUFwcEVsZW1lbnQoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVBcHBFbGVtZW50KCkge1xuICAgIHZhciBmaWVsZE5hbWUgPSBgX2FwcEVsXyR7dGhpcy5ub2RlSW5kZXh9YDtcbiAgICB2YXIgcGFyZW50Tm9kZUluZGV4ID0gdGhpcy5pc1Jvb3RFbGVtZW50KCkgPyBudWxsIDogdGhpcy5wYXJlbnQubm9kZUluZGV4O1xuICAgIHRoaXMudmlldy5maWVsZHMucHVzaChuZXcgby5DbGFzc0ZpZWxkKGZpZWxkTmFtZSwgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLkFwcEVsZW1lbnQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtvLlN0bXRNb2RpZmllci5Qcml2YXRlXSkpO1xuICAgIHZhciBzdGF0ZW1lbnQgPSBvLlRISVNfRVhQUi5wcm9wKGZpZWxkTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZXQoby5pbXBvcnRFeHByKElkZW50aWZpZXJzLkFwcEVsZW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaW5zdGFudGlhdGUoW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWwodGhpcy5ub2RlSW5kZXgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWwocGFyZW50Tm9kZUluZGV4KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5USElTX0VYUFIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyTm9kZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAudG9TdG10KCk7XG4gICAgdGhpcy52aWV3LmNyZWF0ZU1ldGhvZC5hZGRTdG10KHN0YXRlbWVudCk7XG4gICAgdGhpcy5hcHBFbGVtZW50ID0gby5USElTX0VYUFIucHJvcChmaWVsZE5hbWUpO1xuICAgIHRoaXMuX2luc3RhbmNlcy5hZGQoaWRlbnRpZmllclRva2VuKElkZW50aWZpZXJzLkFwcEVsZW1lbnQpLCB0aGlzLmFwcEVsZW1lbnQpO1xuICB9XG5cbiAgc2V0Q29tcG9uZW50Vmlldyhjb21wVmlld0V4cHI6IG8uRXhwcmVzc2lvbikge1xuICAgIHRoaXMuX2NvbXBWaWV3RXhwciA9IGNvbXBWaWV3RXhwcjtcbiAgICB0aGlzLmNvbnRlbnROb2Rlc0J5TmdDb250ZW50SW5kZXggPVxuICAgICAgICBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUodGhpcy5jb21wb25lbnQudGVtcGxhdGUubmdDb250ZW50U2VsZWN0b3JzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRlbnROb2Rlc0J5TmdDb250ZW50SW5kZXgubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuY29udGVudE5vZGVzQnlOZ0NvbnRlbnRJbmRleFtpXSA9IFtdO1xuICAgIH1cbiAgfVxuXG4gIHNldEVtYmVkZGVkVmlldyhlbWJlZGRlZFZpZXc6IENvbXBpbGVWaWV3KSB7XG4gICAgdGhpcy5lbWJlZGRlZFZpZXcgPSBlbWJlZGRlZFZpZXc7XG4gICAgaWYgKGlzUHJlc2VudChlbWJlZGRlZFZpZXcpKSB7XG4gICAgICB2YXIgY3JlYXRlVGVtcGxhdGVSZWZFeHByID1cbiAgICAgICAgICBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuVGVtcGxhdGVSZWZfKVxuICAgICAgICAgICAgICAuaW5zdGFudGlhdGUoW3RoaXMuYXBwRWxlbWVudCwgdGhpcy5lbWJlZGRlZFZpZXcudmlld0ZhY3RvcnldKTtcbiAgICAgIHZhciBwcm92aWRlciA9IG5ldyBDb21waWxlUHJvdmlkZXJNZXRhZGF0YShcbiAgICAgICAgICB7dG9rZW46IGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5UZW1wbGF0ZVJlZiksIHVzZVZhbHVlOiBjcmVhdGVUZW1wbGF0ZVJlZkV4cHJ9KTtcbiAgICAgIC8vIEFkZCBUZW1wbGF0ZVJlZiBhcyBmaXJzdCBwcm92aWRlciBhcyBpdCBkb2VzIG5vdCBoYXZlIGRlcHMgb24gb3RoZXIgcHJvdmlkZXJzXG4gICAgICB0aGlzLl9yZXNvbHZlZFByb3ZpZGVyc0FycmF5LnVuc2hpZnQobmV3IFByb3ZpZGVyQXN0KHByb3ZpZGVyLnRva2VuLCBmYWxzZSwgdHJ1ZSwgW3Byb3ZpZGVyXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUHJvdmlkZXJBc3RUeXBlLkJ1aWx0aW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc291cmNlQXN0LnNvdXJjZVNwYW4pKTtcbiAgICB9XG4gIH1cblxuICBiZWZvcmVDaGlsZHJlbigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYXNWaWV3Q29udGFpbmVyKSB7XG4gICAgICB0aGlzLl9pbnN0YW5jZXMuYWRkKGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5WaWV3Q29udGFpbmVyUmVmKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LnByb3AoJ3ZjUmVmJykpO1xuICAgIH1cblxuICAgIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzID0gbmV3IENvbXBpbGVUb2tlbk1hcDxQcm92aWRlckFzdD4oKTtcbiAgICB0aGlzLl9yZXNvbHZlZFByb3ZpZGVyc0FycmF5LmZvckVhY2gocHJvdmlkZXIgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzLmFkZChwcm92aWRlci50b2tlbiwgcHJvdmlkZXIpKTtcblxuICAgIC8vIGNyZWF0ZSBhbGwgdGhlIHByb3ZpZGVyIGluc3RhbmNlcywgc29tZSBpbiB0aGUgdmlldyBjb25zdHJ1Y3RvcixcbiAgICAvLyBzb21lIGFzIGdldHRlcnMuIFdlIHJlbHkgb24gdGhlIGZhY3QgdGhhdCB0aGV5IGFyZSBhbHJlYWR5IHNvcnRlZCB0b3BvbG9naWNhbGx5LlxuICAgIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzLnZhbHVlcygpLmZvckVhY2goKHJlc29sdmVkUHJvdmlkZXIpID0+IHtcbiAgICAgIHZhciBwcm92aWRlclZhbHVlRXhwcmVzc2lvbnMgPSByZXNvbHZlZFByb3ZpZGVyLnByb3ZpZGVycy5tYXAoKHByb3ZpZGVyKSA9PiB7XG4gICAgICAgIHZhciBwcm92aWRlclZhbHVlOiBvLkV4cHJlc3Npb247XG4gICAgICAgIGlmIChpc1ByZXNlbnQocHJvdmlkZXIudXNlRXhpc3RpbmcpKSB7XG4gICAgICAgICAgcHJvdmlkZXJWYWx1ZSA9XG4gICAgICAgICAgICAgIHRoaXMuX2dldERlcGVuZGVuY3kocmVzb2x2ZWRQcm92aWRlci5wcm92aWRlclR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSh7dG9rZW46IHByb3ZpZGVyLnVzZUV4aXN0aW5nfSkpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VGYWN0b3J5KSkge1xuICAgICAgICAgIHZhciBkZXBzID0gaXNQcmVzZW50KHByb3ZpZGVyLmRlcHMpID8gcHJvdmlkZXIuZGVwcyA6IHByb3ZpZGVyLnVzZUZhY3RvcnkuZGlEZXBzO1xuICAgICAgICAgIHZhciBkZXBzRXhwciA9IGRlcHMubWFwKChkZXApID0+IHRoaXMuX2dldERlcGVuZGVuY3kocmVzb2x2ZWRQcm92aWRlci5wcm92aWRlclR5cGUsIGRlcCkpO1xuICAgICAgICAgIHByb3ZpZGVyVmFsdWUgPSBvLmltcG9ydEV4cHIocHJvdmlkZXIudXNlRmFjdG9yeSkuY2FsbEZuKGRlcHNFeHByKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQocHJvdmlkZXIudXNlQ2xhc3MpKSB7XG4gICAgICAgICAgdmFyIGRlcHMgPSBpc1ByZXNlbnQocHJvdmlkZXIuZGVwcykgPyBwcm92aWRlci5kZXBzIDogcHJvdmlkZXIudXNlQ2xhc3MuZGlEZXBzO1xuICAgICAgICAgIHZhciBkZXBzRXhwciA9IGRlcHMubWFwKChkZXApID0+IHRoaXMuX2dldERlcGVuZGVuY3kocmVzb2x2ZWRQcm92aWRlci5wcm92aWRlclR5cGUsIGRlcCkpO1xuICAgICAgICAgIHByb3ZpZGVyVmFsdWUgPSBvLmltcG9ydEV4cHIocHJvdmlkZXIudXNlQ2xhc3MpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaW5zdGFudGlhdGUoZGVwc0V4cHIsIG8uaW1wb3J0VHlwZShwcm92aWRlci51c2VDbGFzcykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByb3ZpZGVyVmFsdWUgPSBjb252ZXJ0VmFsdWVUb091dHB1dEFzdChwcm92aWRlci51c2VWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VQcm9wZXJ0eSkpIHtcbiAgICAgICAgICBwcm92aWRlclZhbHVlID0gcHJvdmlkZXJWYWx1ZS5wcm9wKHByb3ZpZGVyLnVzZVByb3BlcnR5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvdmlkZXJWYWx1ZTtcbiAgICAgIH0pO1xuICAgICAgdmFyIHByb3BOYW1lID0gYF8ke3Jlc29sdmVkUHJvdmlkZXIudG9rZW4ubmFtZX1fJHt0aGlzLm5vZGVJbmRleH1fJHt0aGlzLl9pbnN0YW5jZXMuc2l6ZX1gO1xuICAgICAgdmFyIGluc3RhbmNlID1cbiAgICAgICAgICBjcmVhdGVQcm92aWRlclByb3BlcnR5KHByb3BOYW1lLCByZXNvbHZlZFByb3ZpZGVyLCBwcm92aWRlclZhbHVlRXhwcmVzc2lvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlZFByb3ZpZGVyLm11bHRpUHJvdmlkZXIsIHJlc29sdmVkUHJvdmlkZXIuZWFnZXIsIHRoaXMpO1xuICAgICAgdGhpcy5faW5zdGFuY2VzLmFkZChyZXNvbHZlZFByb3ZpZGVyLnRva2VuLCBpbnN0YW5jZSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmRpcmVjdGl2ZUluc3RhbmNlcyA9XG4gICAgICAgIHRoaXMuX2RpcmVjdGl2ZXMubWFwKChkaXJlY3RpdmUpID0+IHRoaXMuX2luc3RhbmNlcy5nZXQoaWRlbnRpZmllclRva2VuKGRpcmVjdGl2ZS50eXBlKSkpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kaXJlY3RpdmVJbnN0YW5jZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkaXJlY3RpdmVJbnN0YW5jZSA9IHRoaXMuZGlyZWN0aXZlSW5zdGFuY2VzW2ldO1xuICAgICAgdmFyIGRpcmVjdGl2ZSA9IHRoaXMuX2RpcmVjdGl2ZXNbaV07XG4gICAgICBkaXJlY3RpdmUucXVlcmllcy5mb3JFYWNoKChxdWVyeU1ldGEpID0+IHsgdGhpcy5fYWRkUXVlcnkocXVlcnlNZXRhLCBkaXJlY3RpdmVJbnN0YW5jZSk7IH0pO1xuICAgIH1cbiAgICB2YXIgcXVlcmllc1dpdGhSZWFkczogX1F1ZXJ5V2l0aFJlYWRbXSA9IFtdO1xuICAgIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzLnZhbHVlcygpLmZvckVhY2goKHJlc29sdmVkUHJvdmlkZXIpID0+IHtcbiAgICAgIHZhciBxdWVyaWVzRm9yUHJvdmlkZXIgPSB0aGlzLl9nZXRRdWVyaWVzRm9yKHJlc29sdmVkUHJvdmlkZXIudG9rZW4pO1xuICAgICAgTGlzdFdyYXBwZXIuYWRkQWxsKFxuICAgICAgICAgIHF1ZXJpZXNXaXRoUmVhZHMsXG4gICAgICAgICAgcXVlcmllc0ZvclByb3ZpZGVyLm1hcChxdWVyeSA9PiBuZXcgX1F1ZXJ5V2l0aFJlYWQocXVlcnksIHJlc29sdmVkUHJvdmlkZXIudG9rZW4pKSk7XG4gICAgfSk7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKHRoaXMucmVmZXJlbmNlVG9rZW5zLCAoXywgdmFyTmFtZSkgPT4ge1xuICAgICAgdmFyIHRva2VuID0gdGhpcy5yZWZlcmVuY2VUb2tlbnNbdmFyTmFtZV07XG4gICAgICB2YXIgdmFyVmFsdWU7XG4gICAgICBpZiAoaXNQcmVzZW50KHRva2VuKSkge1xuICAgICAgICB2YXJWYWx1ZSA9IHRoaXMuX2luc3RhbmNlcy5nZXQodG9rZW4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyVmFsdWUgPSB0aGlzLnJlbmRlck5vZGU7XG4gICAgICB9XG4gICAgICB0aGlzLnZpZXcubG9jYWxzLnNldCh2YXJOYW1lLCB2YXJWYWx1ZSk7XG4gICAgICB2YXIgdmFyVG9rZW4gPSBuZXcgQ29tcGlsZVRva2VuTWV0YWRhdGEoe3ZhbHVlOiB2YXJOYW1lfSk7XG4gICAgICBMaXN0V3JhcHBlci5hZGRBbGwocXVlcmllc1dpdGhSZWFkcywgdGhpcy5fZ2V0UXVlcmllc0Zvcih2YXJUb2tlbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChxdWVyeSA9PiBuZXcgX1F1ZXJ5V2l0aFJlYWQocXVlcnksIHZhclRva2VuKSkpO1xuICAgIH0pO1xuICAgIHF1ZXJpZXNXaXRoUmVhZHMuZm9yRWFjaCgocXVlcnlXaXRoUmVhZCkgPT4ge1xuICAgICAgdmFyIHZhbHVlOiBvLkV4cHJlc3Npb247XG4gICAgICBpZiAoaXNQcmVzZW50KHF1ZXJ5V2l0aFJlYWQucmVhZC5pZGVudGlmaWVyKSkge1xuICAgICAgICAvLyBxdWVyeSBmb3IgYW4gaWRlbnRpZmllclxuICAgICAgICB2YWx1ZSA9IHRoaXMuX2luc3RhbmNlcy5nZXQocXVlcnlXaXRoUmVhZC5yZWFkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHF1ZXJ5IGZvciBhIHJlZmVyZW5jZVxuICAgICAgICB2YXIgdG9rZW4gPSB0aGlzLnJlZmVyZW5jZVRva2Vuc1txdWVyeVdpdGhSZWFkLnJlYWQudmFsdWVdO1xuICAgICAgICBpZiAoaXNQcmVzZW50KHRva2VuKSkge1xuICAgICAgICAgIHZhbHVlID0gdGhpcy5faW5zdGFuY2VzLmdldCh0b2tlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWUgPSB0aGlzLmVsZW1lbnRSZWY7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpc1ByZXNlbnQodmFsdWUpKSB7XG4gICAgICAgIHF1ZXJ5V2l0aFJlYWQucXVlcnkuYWRkVmFsdWUodmFsdWUsIHRoaXMudmlldyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuY29tcG9uZW50KSkge1xuICAgICAgdmFyIGNvbXBvbmVudENvbnN0cnVjdG9yVmlld1F1ZXJ5TGlzdCA9XG4gICAgICAgICAgaXNQcmVzZW50KHRoaXMuY29tcG9uZW50KSA/IG8ubGl0ZXJhbEFycih0aGlzLl9jb21wb25lbnRDb25zdHJ1Y3RvclZpZXdRdWVyeUxpc3RzKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8uTlVMTF9FWFBSO1xuICAgICAgdmFyIGNvbXBFeHByID0gaXNQcmVzZW50KHRoaXMuZ2V0Q29tcG9uZW50KCkpID8gdGhpcy5nZXRDb21wb25lbnQoKSA6IG8uTlVMTF9FWFBSO1xuICAgICAgdGhpcy52aWV3LmNyZWF0ZU1ldGhvZC5hZGRTdG10KFxuICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5jYWxsTWV0aG9kKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaW5pdENvbXBvbmVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtjb21wRXhwciwgY29tcG9uZW50Q29uc3RydWN0b3JWaWV3UXVlcnlMaXN0LCB0aGlzLl9jb21wVmlld0V4cHJdKVxuICAgICAgICAgICAgICAudG9TdG10KCkpO1xuICAgIH1cbiAgfVxuXG4gIGFmdGVyQ2hpbGRyZW4oY2hpbGROb2RlQ291bnQ6IG51bWJlcikge1xuICAgIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzLnZhbHVlcygpLmZvckVhY2goKHJlc29sdmVkUHJvdmlkZXIpID0+IHtcbiAgICAgIC8vIE5vdGU6IGFmdGVyQ2hpbGRyZW4gaXMgY2FsbGVkIGFmdGVyIHJlY3Vyc2luZyBpbnRvIGNoaWxkcmVuLlxuICAgICAgLy8gVGhpcyBpcyBnb29kIHNvIHRoYXQgYW4gaW5qZWN0b3IgbWF0Y2ggaW4gYW4gZWxlbWVudCB0aGF0IGlzIGNsb3NlciB0byBhIHJlcXVlc3RpbmcgZWxlbWVudFxuICAgICAgLy8gbWF0Y2hlcyBmaXJzdC5cbiAgICAgIHZhciBwcm92aWRlckV4cHIgPSB0aGlzLl9pbnN0YW5jZXMuZ2V0KHJlc29sdmVkUHJvdmlkZXIudG9rZW4pO1xuICAgICAgLy8gTm90ZTogdmlldyBwcm92aWRlcnMgYXJlIG9ubHkgdmlzaWJsZSBvbiB0aGUgaW5qZWN0b3Igb2YgdGhhdCBlbGVtZW50LlxuICAgICAgLy8gVGhpcyBpcyBub3QgZnVsbHkgY29ycmVjdCBhcyB0aGUgcnVsZXMgZHVyaW5nIGNvZGVnZW4gZG9uJ3QgYWxsb3cgYSBkaXJlY3RpdmVcbiAgICAgIC8vIHRvIGdldCBob2xkIG9mIGEgdmlldyBwcm92ZGllciBvbiB0aGUgc2FtZSBlbGVtZW50LiBXZSBzdGlsbCBkbyB0aGlzIHNlbWFudGljXG4gICAgICAvLyBhcyBpdCBzaW1wbGlmaWVzIG91ciBtb2RlbCB0byBoYXZpbmcgb25seSBvbmUgcnVudGltZSBpbmplY3RvciBwZXIgZWxlbWVudC5cbiAgICAgIHZhciBwcm92aWRlckNoaWxkTm9kZUNvdW50ID1cbiAgICAgICAgICByZXNvbHZlZFByb3ZpZGVyLnByb3ZpZGVyVHlwZSA9PT0gUHJvdmlkZXJBc3RUeXBlLlByaXZhdGVTZXJ2aWNlID8gMCA6IGNoaWxkTm9kZUNvdW50O1xuICAgICAgdGhpcy52aWV3LmluamVjdG9yR2V0TWV0aG9kLmFkZFN0bXQoY3JlYXRlSW5qZWN0SW50ZXJuYWxDb25kaXRpb24oXG4gICAgICAgICAgdGhpcy5ub2RlSW5kZXgsIHByb3ZpZGVyQ2hpbGROb2RlQ291bnQsIHJlc29sdmVkUHJvdmlkZXIsIHByb3ZpZGVyRXhwcikpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fcXVlcmllcy52YWx1ZXMoKS5mb3JFYWNoKFxuICAgICAgICAocXVlcmllcykgPT5cbiAgICAgICAgICAgIHF1ZXJpZXMuZm9yRWFjaCgocXVlcnkpID0+IHF1ZXJ5LmFmdGVyQ2hpbGRyZW4odGhpcy52aWV3LmNyZWF0ZU1ldGhvZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3LnVwZGF0ZUNvbnRlbnRRdWVyaWVzTWV0aG9kKSkpO1xuICB9XG5cbiAgYWRkQ29udGVudE5vZGUobmdDb250ZW50SW5kZXg6IG51bWJlciwgbm9kZUV4cHI6IG8uRXhwcmVzc2lvbikge1xuICAgIHRoaXMuY29udGVudE5vZGVzQnlOZ0NvbnRlbnRJbmRleFtuZ0NvbnRlbnRJbmRleF0ucHVzaChub2RlRXhwcik7XG4gIH1cblxuICBnZXRDb21wb25lbnQoKTogby5FeHByZXNzaW9uIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuY29tcG9uZW50KSA/IHRoaXMuX2luc3RhbmNlcy5nZXQoaWRlbnRpZmllclRva2VuKHRoaXMuY29tcG9uZW50LnR5cGUpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xuICB9XG5cbiAgZ2V0UHJvdmlkZXJUb2tlbnMoKTogby5FeHByZXNzaW9uW10ge1xuICAgIHJldHVybiB0aGlzLl9yZXNvbHZlZFByb3ZpZGVycy52YWx1ZXMoKS5tYXAoXG4gICAgICAgIChyZXNvbHZlZFByb3ZpZGVyKSA9PiBjcmVhdGVEaVRva2VuRXhwcmVzc2lvbihyZXNvbHZlZFByb3ZpZGVyLnRva2VuKSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRRdWVyaWVzRm9yKHRva2VuOiBDb21waWxlVG9rZW5NZXRhZGF0YSk6IENvbXBpbGVRdWVyeVtdIHtcbiAgICB2YXIgcmVzdWx0OiBDb21waWxlUXVlcnlbXSA9IFtdO1xuICAgIHZhciBjdXJyZW50RWw6IENvbXBpbGVFbGVtZW50ID0gdGhpcztcbiAgICB2YXIgZGlzdGFuY2UgPSAwO1xuICAgIHZhciBxdWVyaWVzOiBDb21waWxlUXVlcnlbXTtcbiAgICB3aGlsZSAoIWN1cnJlbnRFbC5pc051bGwoKSkge1xuICAgICAgcXVlcmllcyA9IGN1cnJlbnRFbC5fcXVlcmllcy5nZXQodG9rZW4pO1xuICAgICAgaWYgKGlzUHJlc2VudChxdWVyaWVzKSkge1xuICAgICAgICBMaXN0V3JhcHBlci5hZGRBbGwocmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlcmllcy5maWx0ZXIoKHF1ZXJ5KSA9PiBxdWVyeS5tZXRhLmRlc2NlbmRhbnRzIHx8IGRpc3RhbmNlIDw9IDEpKTtcbiAgICAgIH1cbiAgICAgIGlmIChjdXJyZW50RWwuX2RpcmVjdGl2ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBkaXN0YW5jZSsrO1xuICAgICAgfVxuICAgICAgY3VycmVudEVsID0gY3VycmVudEVsLnBhcmVudDtcbiAgICB9XG4gICAgcXVlcmllcyA9IHRoaXMudmlldy5jb21wb25lbnRWaWV3LnZpZXdRdWVyaWVzLmdldCh0b2tlbik7XG4gICAgaWYgKGlzUHJlc2VudChxdWVyaWVzKSkge1xuICAgICAgTGlzdFdyYXBwZXIuYWRkQWxsKHJlc3VsdCwgcXVlcmllcyk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIF9hZGRRdWVyeShxdWVyeU1ldGE6IENvbXBpbGVRdWVyeU1ldGFkYXRhLFxuICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmVJbnN0YW5jZTogby5FeHByZXNzaW9uKTogQ29tcGlsZVF1ZXJ5IHtcbiAgICB2YXIgcHJvcE5hbWUgPSBgX3F1ZXJ5XyR7cXVlcnlNZXRhLnNlbGVjdG9yc1swXS5uYW1lfV8ke3RoaXMubm9kZUluZGV4fV8ke3RoaXMuX3F1ZXJ5Q291bnQrK31gO1xuICAgIHZhciBxdWVyeUxpc3QgPSBjcmVhdGVRdWVyeUxpc3QocXVlcnlNZXRhLCBkaXJlY3RpdmVJbnN0YW5jZSwgcHJvcE5hbWUsIHRoaXMudmlldyk7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IENvbXBpbGVRdWVyeShxdWVyeU1ldGEsIHF1ZXJ5TGlzdCwgZGlyZWN0aXZlSW5zdGFuY2UsIHRoaXMudmlldyk7XG4gICAgYWRkUXVlcnlUb1Rva2VuTWFwKHRoaXMuX3F1ZXJpZXMsIHF1ZXJ5KTtcbiAgICByZXR1cm4gcXVlcnk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRMb2NhbERlcGVuZGVuY3kocmVxdWVzdGluZ1Byb3ZpZGVyVHlwZTogUHJvdmlkZXJBc3RUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEpOiBvLkV4cHJlc3Npb24ge1xuICAgIHZhciByZXN1bHQgPSBudWxsO1xuICAgIC8vIGNvbnN0cnVjdG9yIGNvbnRlbnQgcXVlcnlcbiAgICBpZiAoaXNCbGFuayhyZXN1bHQpICYmIGlzUHJlc2VudChkZXAucXVlcnkpKSB7XG4gICAgICByZXN1bHQgPSB0aGlzLl9hZGRRdWVyeShkZXAucXVlcnksIG51bGwpLnF1ZXJ5TGlzdDtcbiAgICB9XG5cbiAgICAvLyBjb25zdHJ1Y3RvciB2aWV3IHF1ZXJ5XG4gICAgaWYgKGlzQmxhbmsocmVzdWx0KSAmJiBpc1ByZXNlbnQoZGVwLnZpZXdRdWVyeSkpIHtcbiAgICAgIHJlc3VsdCA9IGNyZWF0ZVF1ZXJ5TGlzdChcbiAgICAgICAgICBkZXAudmlld1F1ZXJ5LCBudWxsLFxuICAgICAgICAgIGBfdmlld1F1ZXJ5XyR7ZGVwLnZpZXdRdWVyeS5zZWxlY3RvcnNbMF0ubmFtZX1fJHt0aGlzLm5vZGVJbmRleH1fJHt0aGlzLl9jb21wb25lbnRDb25zdHJ1Y3RvclZpZXdRdWVyeUxpc3RzLmxlbmd0aH1gLFxuICAgICAgICAgIHRoaXMudmlldyk7XG4gICAgICB0aGlzLl9jb21wb25lbnRDb25zdHJ1Y3RvclZpZXdRdWVyeUxpc3RzLnB1c2gocmVzdWx0KTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcmVzZW50KGRlcC50b2tlbikpIHtcbiAgICAgIC8vIGFjY2VzcyBidWlsdGlucyB3aXRoIHNwZWNpYWwgdmlzaWJpbGl0eVxuICAgICAgaWYgKGlzQmxhbmsocmVzdWx0KSkge1xuICAgICAgICBpZiAoZGVwLnRva2VuLmVxdWFsc1RvKGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5DaGFuZ2VEZXRlY3RvclJlZikpKSB7XG4gICAgICAgICAgaWYgKHJlcXVlc3RpbmdQcm92aWRlclR5cGUgPT09IFByb3ZpZGVyQXN0VHlwZS5Db21wb25lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb21wVmlld0V4cHIucHJvcCgncmVmJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBvLlRISVNfRVhQUi5wcm9wKCdyZWYnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGFjY2VzcyByZWd1bGFyIHByb3ZpZGVycyBvbiB0aGUgZWxlbWVudFxuICAgICAgaWYgKGlzQmxhbmsocmVzdWx0KSkge1xuICAgICAgICByZXN1bHQgPSB0aGlzLl9pbnN0YW5jZXMuZ2V0KGRlcC50b2tlbik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIF9nZXREZXBlbmRlbmN5KHJlcXVlc3RpbmdQcm92aWRlclR5cGU6IFByb3ZpZGVyQXN0VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICBkZXA6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSk6IG8uRXhwcmVzc2lvbiB7XG4gICAgdmFyIGN1cnJFbGVtZW50OiBDb21waWxlRWxlbWVudCA9IHRoaXM7XG4gICAgdmFyIHJlc3VsdCA9IG51bGw7XG4gICAgaWYgKGRlcC5pc1ZhbHVlKSB7XG4gICAgICByZXN1bHQgPSBvLmxpdGVyYWwoZGVwLnZhbHVlKTtcbiAgICB9XG4gICAgaWYgKGlzQmxhbmsocmVzdWx0KSAmJiAhZGVwLmlzU2tpcFNlbGYpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX2dldExvY2FsRGVwZW5kZW5jeShyZXF1ZXN0aW5nUHJvdmlkZXJUeXBlLCBkZXApO1xuICAgIH1cbiAgICAvLyBjaGVjayBwYXJlbnQgZWxlbWVudHNcbiAgICB3aGlsZSAoaXNCbGFuayhyZXN1bHQpICYmICFjdXJyRWxlbWVudC5wYXJlbnQuaXNOdWxsKCkpIHtcbiAgICAgIGN1cnJFbGVtZW50ID0gY3VyckVsZW1lbnQucGFyZW50O1xuICAgICAgcmVzdWx0ID0gY3VyckVsZW1lbnQuX2dldExvY2FsRGVwZW5kZW5jeShQcm92aWRlckFzdFR5cGUuUHVibGljU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSh7dG9rZW46IGRlcC50b2tlbn0pKTtcbiAgICB9XG5cbiAgICBpZiAoaXNCbGFuayhyZXN1bHQpKSB7XG4gICAgICByZXN1bHQgPSBpbmplY3RGcm9tVmlld1BhcmVudEluamVjdG9yKGRlcC50b2tlbiwgZGVwLmlzT3B0aW9uYWwpO1xuICAgIH1cbiAgICBpZiAoaXNCbGFuayhyZXN1bHQpKSB7XG4gICAgICByZXN1bHQgPSBvLk5VTExfRVhQUjtcbiAgICB9XG4gICAgcmV0dXJuIGdldFByb3BlcnR5SW5WaWV3KHJlc3VsdCwgdGhpcy52aWV3LCBjdXJyRWxlbWVudC52aWV3KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVJbmplY3RJbnRlcm5hbENvbmRpdGlvbihub2RlSW5kZXg6IG51bWJlciwgY2hpbGROb2RlQ291bnQ6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyOiBQcm92aWRlckFzdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyRXhwcjogby5FeHByZXNzaW9uKTogby5TdGF0ZW1lbnQge1xuICB2YXIgaW5kZXhDb25kaXRpb247XG4gIGlmIChjaGlsZE5vZGVDb3VudCA+IDApIHtcbiAgICBpbmRleENvbmRpdGlvbiA9IG8ubGl0ZXJhbChub2RlSW5kZXgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmxvd2VyRXF1YWxzKEluamVjdE1ldGhvZFZhcnMucmVxdWVzdE5vZGVJbmRleClcbiAgICAgICAgICAgICAgICAgICAgICAgICAuYW5kKEluamVjdE1ldGhvZFZhcnMucmVxdWVzdE5vZGVJbmRleC5sb3dlckVxdWFscyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5saXRlcmFsKG5vZGVJbmRleCArIGNoaWxkTm9kZUNvdW50KSkpO1xuICB9IGVsc2Uge1xuICAgIGluZGV4Q29uZGl0aW9uID0gby5saXRlcmFsKG5vZGVJbmRleCkuaWRlbnRpY2FsKEluamVjdE1ldGhvZFZhcnMucmVxdWVzdE5vZGVJbmRleCk7XG4gIH1cbiAgcmV0dXJuIG5ldyBvLklmU3RtdChcbiAgICAgIEluamVjdE1ldGhvZFZhcnMudG9rZW4uaWRlbnRpY2FsKGNyZWF0ZURpVG9rZW5FeHByZXNzaW9uKHByb3ZpZGVyLnRva2VuKSkuYW5kKGluZGV4Q29uZGl0aW9uKSxcbiAgICAgIFtuZXcgby5SZXR1cm5TdGF0ZW1lbnQocHJvdmlkZXJFeHByKV0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVQcm92aWRlclByb3BlcnR5KHByb3BOYW1lOiBzdHJpbmcsIHByb3ZpZGVyOiBQcm92aWRlckFzdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJWYWx1ZUV4cHJlc3Npb25zOiBvLkV4cHJlc3Npb25bXSwgaXNNdWx0aTogYm9vbGVhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNFYWdlcjogYm9vbGVhbiwgY29tcGlsZUVsZW1lbnQ6IENvbXBpbGVFbGVtZW50KTogby5FeHByZXNzaW9uIHtcbiAgdmFyIHZpZXcgPSBjb21waWxlRWxlbWVudC52aWV3O1xuICB2YXIgcmVzb2x2ZWRQcm92aWRlclZhbHVlRXhwcjtcbiAgdmFyIHR5cGU7XG4gIGlmIChpc011bHRpKSB7XG4gICAgcmVzb2x2ZWRQcm92aWRlclZhbHVlRXhwciA9IG8ubGl0ZXJhbEFycihwcm92aWRlclZhbHVlRXhwcmVzc2lvbnMpO1xuICAgIHR5cGUgPSBuZXcgby5BcnJheVR5cGUoby5EWU5BTUlDX1RZUEUpO1xuICB9IGVsc2Uge1xuICAgIHJlc29sdmVkUHJvdmlkZXJWYWx1ZUV4cHIgPSBwcm92aWRlclZhbHVlRXhwcmVzc2lvbnNbMF07XG4gICAgdHlwZSA9IHByb3ZpZGVyVmFsdWVFeHByZXNzaW9uc1swXS50eXBlO1xuICB9XG4gIGlmIChpc0JsYW5rKHR5cGUpKSB7XG4gICAgdHlwZSA9IG8uRFlOQU1JQ19UWVBFO1xuICB9XG4gIGlmIChpc0VhZ2VyKSB7XG4gICAgdmlldy5maWVsZHMucHVzaChuZXcgby5DbGFzc0ZpZWxkKHByb3BOYW1lLCB0eXBlLCBbby5TdG10TW9kaWZpZXIuUHJpdmF0ZV0pKTtcbiAgICB2aWV3LmNyZWF0ZU1ldGhvZC5hZGRTdG10KG8uVEhJU19FWFBSLnByb3AocHJvcE5hbWUpLnNldChyZXNvbHZlZFByb3ZpZGVyVmFsdWVFeHByKS50b1N0bXQoKSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGludGVybmFsRmllbGQgPSBgXyR7cHJvcE5hbWV9YDtcbiAgICB2aWV3LmZpZWxkcy5wdXNoKG5ldyBvLkNsYXNzRmllbGQoaW50ZXJuYWxGaWVsZCwgdHlwZSwgW28uU3RtdE1vZGlmaWVyLlByaXZhdGVdKSk7XG4gICAgdmFyIGdldHRlciA9IG5ldyBDb21waWxlTWV0aG9kKHZpZXcpO1xuICAgIGdldHRlci5yZXNldERlYnVnSW5mbyhjb21waWxlRWxlbWVudC5ub2RlSW5kZXgsIGNvbXBpbGVFbGVtZW50LnNvdXJjZUFzdCk7XG4gICAgLy8gTm90ZTogRXF1YWxzIGlzIGltcG9ydGFudCBmb3IgSlMgc28gdGhhdCBpdCBhbHNvIGNoZWNrcyB0aGUgdW5kZWZpbmVkIGNhc2UhXG4gICAgZ2V0dGVyLmFkZFN0bXQoXG4gICAgICAgIG5ldyBvLklmU3RtdChvLlRISVNfRVhQUi5wcm9wKGludGVybmFsRmllbGQpLmlzQmxhbmsoKSxcbiAgICAgICAgICAgICAgICAgICAgIFtvLlRISVNfRVhQUi5wcm9wKGludGVybmFsRmllbGQpLnNldChyZXNvbHZlZFByb3ZpZGVyVmFsdWVFeHByKS50b1N0bXQoKV0pKTtcbiAgICBnZXR0ZXIuYWRkU3RtdChuZXcgby5SZXR1cm5TdGF0ZW1lbnQoby5USElTX0VYUFIucHJvcChpbnRlcm5hbEZpZWxkKSkpO1xuICAgIHZpZXcuZ2V0dGVycy5wdXNoKG5ldyBvLkNsYXNzR2V0dGVyKHByb3BOYW1lLCBnZXR0ZXIuZmluaXNoKCksIHR5cGUpKTtcbiAgfVxuICByZXR1cm4gby5USElTX0VYUFIucHJvcChwcm9wTmFtZSk7XG59XG5cbmNsYXNzIF9RdWVyeVdpdGhSZWFkIHtcbiAgcHVibGljIHJlYWQ6IENvbXBpbGVUb2tlbk1ldGFkYXRhO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcXVlcnk6IENvbXBpbGVRdWVyeSwgbWF0Y2g6IENvbXBpbGVUb2tlbk1ldGFkYXRhKSB7XG4gICAgdGhpcy5yZWFkID0gaXNQcmVzZW50KHF1ZXJ5Lm1ldGEucmVhZCkgPyBxdWVyeS5tZXRhLnJlYWQgOiBtYXRjaDtcbiAgfVxufVxuIl19