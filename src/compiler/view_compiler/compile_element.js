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
    function CompileElement(parent, view, nodeIndex, renderNode, sourceAst, _directives, _resolvedProvidersArray, variableTokens) {
        _super.call(this, parent, view, nodeIndex, renderNode, sourceAst);
        this._directives = _directives;
        this._resolvedProvidersArray = _resolvedProvidersArray;
        this.variableTokens = variableTokens;
        this._compViewExpr = null;
        this.component = null;
        this._instances = new compile_metadata_1.CompileTokenMap();
        this._queryCount = 0;
        this._queries = new compile_metadata_1.CompileTokenMap();
        this._componentConstructorViewQueryLists = [];
        this.contentNodesByNgContentIndex = null;
    }
    CompileElement.createNull = function () {
        return new CompileElement(null, null, null, null, null, [], [], {});
    };
    CompileElement.prototype.setComponent = function (component, compViewExpr) {
        this.component = component;
        this._compViewExpr = compViewExpr;
        this.contentNodesByNgContentIndex =
            collection_1.ListWrapper.createFixedSize(component.template.ngContentSelectors.length);
        for (var i = 0; i < this.contentNodesByNgContentIndex.length; i++) {
            this.contentNodesByNgContentIndex[i] = [];
        }
    };
    CompileElement.prototype.setEmbeddedView = function (embeddedView) {
        this.embeddedView = embeddedView;
        if (lang_1.isPresent(embeddedView)) {
            var createTemplateRefExpr = o.importExpr(identifiers_1.Identifiers.TemplateRef_)
                .instantiate([this.getOrCreateAppElement(), this.embeddedView.viewFactory]);
            var provider = new compile_metadata_1.CompileProviderMetadata({ token: identifiers_1.identifierToken(identifiers_1.Identifiers.TemplateRef), useValue: createTemplateRefExpr });
            // Add TemplateRef as first provider as it does not have deps on other providers
            this._resolvedProvidersArray.unshift(new template_ast_1.ProviderAst(provider.token, false, true, [provider], template_ast_1.ProviderAstType.Builtin, this.sourceAst.sourceSpan));
        }
    };
    CompileElement.prototype.beforeChildren = function () {
        var _this = this;
        this._resolvedProviders = new compile_metadata_1.CompileTokenMap();
        this._resolvedProvidersArray.forEach(function (provider) {
            return _this._resolvedProviders.add(provider.token, provider);
        });
        // create all the provider instances, some in the view constructor,
        // some as getters. We rely on the fact that they are already sorted topologically.
        this._resolvedProviders.values().forEach(function (resolvedProvider) {
            var providerValueExpressions = resolvedProvider.providers.map(function (provider) {
                if (lang_1.isPresent(provider.useExisting)) {
                    return _this._getDependency(resolvedProvider.providerType, new compile_metadata_1.CompileDiDependencyMetadata({ token: provider.useExisting }));
                }
                else if (lang_1.isPresent(provider.useFactory)) {
                    var deps = lang_1.isPresent(provider.deps) ? provider.deps : provider.useFactory.diDeps;
                    var depsExpr = deps.map(function (dep) { return _this._getDependency(resolvedProvider.providerType, dep); });
                    return o.importExpr(provider.useFactory).callFn(depsExpr);
                }
                else if (lang_1.isPresent(provider.useClass)) {
                    var deps = lang_1.isPresent(provider.deps) ? provider.deps : provider.useClass.diDeps;
                    var depsExpr = deps.map(function (dep) { return _this._getDependency(resolvedProvider.providerType, dep); });
                    return o.importExpr(provider.useClass)
                        .instantiate(depsExpr, o.importType(provider.useClass));
                }
                else {
                    if (provider.useValue instanceof compile_metadata_1.CompileIdentifierMetadata) {
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
        this._resolvedProviders.values().forEach(function (resolvedProvider) {
            var queriesForProvider = _this._getQueriesFor(resolvedProvider.token);
            var providerExpr = _this._instances.get(resolvedProvider.token);
            queriesForProvider.forEach(function (query) { query.addValue(providerExpr, _this.view); });
        });
        collection_1.StringMapWrapper.forEach(this.variableTokens, function (_, varName) {
            var token = _this.variableTokens[varName];
            var varValue;
            var varValueForQuery;
            if (lang_1.isPresent(token)) {
                varValue = varValueForQuery = _this._instances.get(token);
            }
            else {
                varValueForQuery = _this.getOrCreateAppElement().prop('ref');
                varValue = _this.renderNode;
            }
            _this.view.variables.set(varName, varValue);
            _this.view.namedAppElements.push([varName, _this.getOrCreateAppElement()]);
            var queriesForProvider = _this._getQueriesFor(new compile_metadata_1.CompileTokenMetadata({ value: varName }));
            queriesForProvider.forEach(function (query) { query.addValue(varValueForQuery, _this.view); });
        });
        if (lang_1.isPresent(this.component)) {
            var componentConstructorViewQueryList = lang_1.isPresent(this.component) ? o.literalArr(this._componentConstructorViewQueryLists) :
                o.NULL_EXPR;
            var compExpr = lang_1.isPresent(this.getComponent()) ? this.getComponent() : o.NULL_EXPR;
            this.view.createMethod.addStmt(this.getOrCreateAppElement()
                .callMethod('initComponent', [compExpr, componentConstructorViewQueryList, this._compViewExpr])
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
            return queries.forEach(function (query) { return query.afterChildren(_this.view.updateContentQueriesMethod); });
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
    CompileElement.prototype.getDeclaredVariablesNames = function () {
        var res = [];
        collection_1.StringMapWrapper.forEach(this.variableTokens, function (_, key) { res.push(key); });
        return res;
    };
    CompileElement.prototype.getOptionalAppElement = function () { return this._appElement; };
    CompileElement.prototype.getOrCreateAppElement = function () {
        if (lang_1.isBlank(this._appElement)) {
            var parentNodeIndex = this.isRootElement() ? null : this.parent.nodeIndex;
            var fieldName = "_appEl_" + this.nodeIndex;
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
            this._appElement = o.THIS_EXPR.prop(fieldName);
        }
        return this._appElement;
    };
    CompileElement.prototype.getOrCreateInjector = function () {
        if (lang_1.isBlank(this._defaultInjector)) {
            var fieldName = "_inj_" + this.nodeIndex;
            this.view.fields.push(new o.ClassField(fieldName, o.importType(identifiers_1.Identifiers.Injector), [o.StmtModifier.Private]));
            var statement = o.THIS_EXPR.prop(fieldName)
                .set(o.THIS_EXPR.callMethod('injector', [o.literal(this.nodeIndex)]))
                .toStmt();
            this.view.createMethod.addStmt(statement);
            this._defaultInjector = o.THIS_EXPR.prop(fieldName);
        }
        return this._defaultInjector;
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
            // access builtins
            if (lang_1.isBlank(result)) {
                if (dep.token.equalsTo(identifiers_1.identifierToken(identifiers_1.Identifiers.Renderer))) {
                    result = o.THIS_EXPR.prop('renderer');
                }
                else if (dep.token.equalsTo(identifiers_1.identifierToken(identifiers_1.Identifiers.ElementRef))) {
                    result = this.getOrCreateAppElement().prop('ref');
                }
                else if (dep.token.equalsTo(identifiers_1.identifierToken(identifiers_1.Identifiers.ChangeDetectorRef))) {
                    if (requestingProviderType === template_ast_1.ProviderAstType.Component) {
                        return this._compViewExpr.prop('ref');
                    }
                    else {
                        return o.THIS_EXPR.prop('ref');
                    }
                }
                else if (dep.token.equalsTo(identifiers_1.identifierToken(identifiers_1.Identifiers.ViewContainerRef))) {
                    result = this.getOrCreateAppElement().prop('vcRef');
                }
            }
            // access providers
            if (lang_1.isBlank(result)) {
                result = this._instances.get(dep.token);
            }
            // access the injector
            if (lang_1.isBlank(result) && dep.token.equalsTo(identifiers_1.identifierToken(identifiers_1.Identifiers.Injector))) {
                result = this.getOrCreateInjector();
            }
        }
        return result;
    };
    CompileElement.prototype._getDependency = function (requestingProviderType, dep) {
        var currElement = this;
        var currView = currElement.view;
        var result = null;
        if (dep.isValue) {
            result = o.literal(dep.value);
        }
        if (lang_1.isBlank(result) && !dep.isSkipSelf) {
            result = this._getLocalDependency(requestingProviderType, dep);
        }
        var resultViewPath = [];
        // check parent elements
        while (lang_1.isBlank(result) && !currElement.parent.isNull()) {
            currElement = currElement.parent;
            while (currElement.view !== currView && currView != null) {
                currView = currView.declarationElement.view;
                resultViewPath.push(currView);
            }
            result = currElement._getLocalDependency(template_ast_1.ProviderAstType.PublicService, new compile_metadata_1.CompileDiDependencyMetadata({ token: dep.token }));
        }
        if (lang_1.isBlank(result)) {
            result = util_1.injectFromViewParentInjector(dep.token, dep.isOptional);
        }
        if (lang_1.isBlank(result)) {
            result = o.NULL_EXPR;
        }
        return util_1.getPropertyInView(result, resultViewPath);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZV9lbGVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC10dVZUM3lnYy50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3ZpZXdfY29tcGlsZXIvY29tcGlsZV9lbGVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQVksQ0FBQyxXQUFNLHNCQUFzQixDQUFDLENBQUE7QUFDMUMsNEJBQTJDLGdCQUFnQixDQUFDLENBQUE7QUFDNUQsMEJBQStCLGFBQWEsQ0FBQyxDQUFBO0FBRTdDLHFCQUFpQywwQkFBMEIsQ0FBQyxDQUFBO0FBQzVELDJCQUE0QyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdFLDZCQUF3RCxpQkFBaUIsQ0FBQyxDQUFBO0FBQzFFLGlDQVNPLHFCQUFxQixDQUFDLENBQUE7QUFDN0IscUJBQXVGLFFBQVEsQ0FBQyxDQUFBO0FBQ2hHLDhCQUFnRSxpQkFBaUIsQ0FBQyxDQUFBO0FBQ2xGLCtCQUE0QixrQkFBa0IsQ0FBQyxDQUFBO0FBRS9DO0lBQ0UscUJBQW1CLE1BQXNCLEVBQVMsSUFBaUIsRUFBUyxTQUFpQixFQUMxRSxVQUF3QixFQUFTLFNBQXNCO1FBRHZELFdBQU0sR0FBTixNQUFNLENBQWdCO1FBQVMsU0FBSSxHQUFKLElBQUksQ0FBYTtRQUFTLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFDMUUsZUFBVSxHQUFWLFVBQVUsQ0FBYztRQUFTLGNBQVMsR0FBVCxTQUFTLENBQWE7SUFBRyxDQUFDO0lBRTlFLDRCQUFNLEdBQU4sY0FBb0IsTUFBTSxDQUFDLGNBQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXRELG1DQUFhLEdBQWIsY0FBMkIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLGtCQUFDO0FBQUQs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cyBvIGZyb20gJy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7SWRlbnRpZmllcnMsIGlkZW50aWZpZXJUb2tlbn0gZnJvbSAnLi4vaWRlbnRpZmllcnMnO1xuaW1wb3J0IHtJbmplY3RNZXRob2RWYXJzfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge0NvbXBpbGVWaWV3fSBmcm9tICcuL2NvbXBpbGVfdmlldyc7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1RlbXBsYXRlQXN0LCBQcm92aWRlckFzdCwgUHJvdmlkZXJBc3RUeXBlfSBmcm9tICcuLi90ZW1wbGF0ZV9hc3QnO1xuaW1wb3J0IHtcbiAgQ29tcGlsZVRva2VuTWFwLFxuICBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsXG4gIENvbXBpbGVUb2tlbk1ldGFkYXRhLFxuICBDb21waWxlUXVlcnlNZXRhZGF0YSxcbiAgQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEsXG4gIENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSxcbiAgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSxcbiAgQ29tcGlsZVR5cGVNZXRhZGF0YVxufSBmcm9tICcuLi9jb21waWxlX21ldGFkYXRhJztcbmltcG9ydCB7Z2V0UHJvcGVydHlJblZpZXcsIGNyZWF0ZURpVG9rZW5FeHByZXNzaW9uLCBpbmplY3RGcm9tVmlld1BhcmVudEluamVjdG9yfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtDb21waWxlUXVlcnksIGNyZWF0ZVF1ZXJ5TGlzdCwgYWRkUXVlcnlUb1Rva2VuTWFwfSBmcm9tICcuL2NvbXBpbGVfcXVlcnknO1xuaW1wb3J0IHtDb21waWxlTWV0aG9kfSBmcm9tICcuL2NvbXBpbGVfbWV0aG9kJztcblxuZXhwb3J0IGNsYXNzIENvbXBpbGVOb2RlIHtcbiAgY29uc3RydWN0b3IocHVibGljIHBhcmVudDogQ29tcGlsZUVsZW1lbnQsIHB1YmxpYyB2aWV3OiBDb21waWxlVmlldywgcHVibGljIG5vZGVJbmRleDogbnVtYmVyLFxuICAgICAgICAgICAgICBwdWJsaWMgcmVuZGVyTm9kZTogby5FeHByZXNzaW9uLCBwdWJsaWMgc291cmNlQXN0OiBUZW1wbGF0ZUFzdCkge31cblxuICBpc051bGwoKTogYm9vbGVhbiB7IHJldHVybiBpc0JsYW5rKHRoaXMucmVuZGVyTm9kZSk7IH1cblxuICBpc1Jvb3RFbGVtZW50KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy52aWV3ICE9IHRoaXMucGFyZW50LnZpZXc7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVFbGVtZW50IGV4dGVuZHMgQ29tcGlsZU5vZGUge1xuICBzdGF0aWMgY3JlYXRlTnVsbCgpOiBDb21waWxlRWxlbWVudCB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlRWxlbWVudChudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBbXSwgW10sIHt9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbXBWaWV3RXhwcjogby5FeHByZXNzaW9uID0gbnVsbDtcbiAgcHVibGljIGNvbXBvbmVudDogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhID0gbnVsbDtcbiAgcHJpdmF0ZSBfYXBwRWxlbWVudDogby5FeHByZXNzaW9uO1xuICBwcml2YXRlIF9kZWZhdWx0SW5qZWN0b3I6IG8uRXhwcmVzc2lvbjtcbiAgcHJpdmF0ZSBfaW5zdGFuY2VzID0gbmV3IENvbXBpbGVUb2tlbk1hcDxvLkV4cHJlc3Npb24+KCk7XG4gIHByaXZhdGUgX3Jlc29sdmVkUHJvdmlkZXJzOiBDb21waWxlVG9rZW5NYXA8UHJvdmlkZXJBc3Q+O1xuXG4gIHByaXZhdGUgX3F1ZXJ5Q291bnQgPSAwO1xuICBwcml2YXRlIF9xdWVyaWVzID0gbmV3IENvbXBpbGVUb2tlbk1hcDxDb21waWxlUXVlcnlbXT4oKTtcbiAgcHJpdmF0ZSBfY29tcG9uZW50Q29uc3RydWN0b3JWaWV3UXVlcnlMaXN0czogby5FeHByZXNzaW9uW10gPSBbXTtcblxuICBwdWJsaWMgY29udGVudE5vZGVzQnlOZ0NvbnRlbnRJbmRleDogQXJyYXk8by5FeHByZXNzaW9uPltdID0gbnVsbDtcbiAgcHVibGljIGVtYmVkZGVkVmlldzogQ29tcGlsZVZpZXc7XG4gIHB1YmxpYyBkaXJlY3RpdmVJbnN0YW5jZXM6IG8uRXhwcmVzc2lvbltdO1xuXG4gIGNvbnN0cnVjdG9yKHBhcmVudDogQ29tcGlsZUVsZW1lbnQsIHZpZXc6IENvbXBpbGVWaWV3LCBub2RlSW5kZXg6IG51bWJlcixcbiAgICAgICAgICAgICAgcmVuZGVyTm9kZTogby5FeHByZXNzaW9uLCBzb3VyY2VBc3Q6IFRlbXBsYXRlQXN0LFxuICAgICAgICAgICAgICBwcml2YXRlIF9kaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfcmVzb2x2ZWRQcm92aWRlcnNBcnJheTogUHJvdmlkZXJBc3RbXSxcbiAgICAgICAgICAgICAgcHVibGljIHZhcmlhYmxlVG9rZW5zOiB7W2tleTogc3RyaW5nXTogQ29tcGlsZVRva2VuTWV0YWRhdGF9KSB7XG4gICAgc3VwZXIocGFyZW50LCB2aWV3LCBub2RlSW5kZXgsIHJlbmRlck5vZGUsIHNvdXJjZUFzdCk7XG4gIH1cblxuICBzZXRDb21wb25lbnQoY29tcG9uZW50OiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsIGNvbXBWaWV3RXhwcjogby5FeHByZXNzaW9uKSB7XG4gICAgdGhpcy5jb21wb25lbnQgPSBjb21wb25lbnQ7XG4gICAgdGhpcy5fY29tcFZpZXdFeHByID0gY29tcFZpZXdFeHByO1xuICAgIHRoaXMuY29udGVudE5vZGVzQnlOZ0NvbnRlbnRJbmRleCA9XG4gICAgICAgIExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShjb21wb25lbnQudGVtcGxhdGUubmdDb250ZW50U2VsZWN0b3JzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRlbnROb2Rlc0J5TmdDb250ZW50SW5kZXgubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuY29udGVudE5vZGVzQnlOZ0NvbnRlbnRJbmRleFtpXSA9IFtdO1xuICAgIH1cbiAgfVxuXG4gIHNldEVtYmVkZGVkVmlldyhlbWJlZGRlZFZpZXc6IENvbXBpbGVWaWV3KSB7XG4gICAgdGhpcy5lbWJlZGRlZFZpZXcgPSBlbWJlZGRlZFZpZXc7XG4gICAgaWYgKGlzUHJlc2VudChlbWJlZGRlZFZpZXcpKSB7XG4gICAgICB2YXIgY3JlYXRlVGVtcGxhdGVSZWZFeHByID1cbiAgICAgICAgICBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuVGVtcGxhdGVSZWZfKVxuICAgICAgICAgICAgICAuaW5zdGFudGlhdGUoW3RoaXMuZ2V0T3JDcmVhdGVBcHBFbGVtZW50KCksIHRoaXMuZW1iZWRkZWRWaWV3LnZpZXdGYWN0b3J5XSk7XG4gICAgICB2YXIgcHJvdmlkZXIgPSBuZXcgQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEoXG4gICAgICAgICAge3Rva2VuOiBpZGVudGlmaWVyVG9rZW4oSWRlbnRpZmllcnMuVGVtcGxhdGVSZWYpLCB1c2VWYWx1ZTogY3JlYXRlVGVtcGxhdGVSZWZFeHByfSk7XG4gICAgICAvLyBBZGQgVGVtcGxhdGVSZWYgYXMgZmlyc3QgcHJvdmlkZXIgYXMgaXQgZG9lcyBub3QgaGF2ZSBkZXBzIG9uIG90aGVyIHByb3ZpZGVyc1xuICAgICAgdGhpcy5fcmVzb2x2ZWRQcm92aWRlcnNBcnJheS51bnNoaWZ0KG5ldyBQcm92aWRlckFzdChwcm92aWRlci50b2tlbiwgZmFsc2UsIHRydWUsIFtwcm92aWRlcl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFByb3ZpZGVyQXN0VHlwZS5CdWlsdGluLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNvdXJjZUFzdC5zb3VyY2VTcGFuKSk7XG4gICAgfVxuICB9XG5cbiAgYmVmb3JlQ2hpbGRyZW4oKTogdm9pZCB7XG4gICAgdGhpcy5fcmVzb2x2ZWRQcm92aWRlcnMgPSBuZXcgQ29tcGlsZVRva2VuTWFwPFByb3ZpZGVyQXN0PigpO1xuICAgIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzQXJyYXkuZm9yRWFjaChwcm92aWRlciA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVzb2x2ZWRQcm92aWRlcnMuYWRkKHByb3ZpZGVyLnRva2VuLCBwcm92aWRlcikpO1xuXG4gICAgLy8gY3JlYXRlIGFsbCB0aGUgcHJvdmlkZXIgaW5zdGFuY2VzLCBzb21lIGluIHRoZSB2aWV3IGNvbnN0cnVjdG9yLFxuICAgIC8vIHNvbWUgYXMgZ2V0dGVycy4gV2UgcmVseSBvbiB0aGUgZmFjdCB0aGF0IHRoZXkgYXJlIGFscmVhZHkgc29ydGVkIHRvcG9sb2dpY2FsbHkuXG4gICAgdGhpcy5fcmVzb2x2ZWRQcm92aWRlcnMudmFsdWVzKCkuZm9yRWFjaCgocmVzb2x2ZWRQcm92aWRlcikgPT4ge1xuICAgICAgdmFyIHByb3ZpZGVyVmFsdWVFeHByZXNzaW9ucyA9IHJlc29sdmVkUHJvdmlkZXIucHJvdmlkZXJzLm1hcCgocHJvdmlkZXIpID0+IHtcbiAgICAgICAgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VFeGlzdGluZykpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0RGVwZW5kZW5jeShcbiAgICAgICAgICAgICAgcmVzb2x2ZWRQcm92aWRlci5wcm92aWRlclR5cGUsXG4gICAgICAgICAgICAgIG5ldyBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEoe3Rva2VuOiBwcm92aWRlci51c2VFeGlzdGluZ30pKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQocHJvdmlkZXIudXNlRmFjdG9yeSkpIHtcbiAgICAgICAgICB2YXIgZGVwcyA9IGlzUHJlc2VudChwcm92aWRlci5kZXBzKSA/IHByb3ZpZGVyLmRlcHMgOiBwcm92aWRlci51c2VGYWN0b3J5LmRpRGVwcztcbiAgICAgICAgICB2YXIgZGVwc0V4cHIgPSBkZXBzLm1hcCgoZGVwKSA9PiB0aGlzLl9nZXREZXBlbmRlbmN5KHJlc29sdmVkUHJvdmlkZXIucHJvdmlkZXJUeXBlLCBkZXApKTtcbiAgICAgICAgICByZXR1cm4gby5pbXBvcnRFeHByKHByb3ZpZGVyLnVzZUZhY3RvcnkpLmNhbGxGbihkZXBzRXhwcik7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KHByb3ZpZGVyLnVzZUNsYXNzKSkge1xuICAgICAgICAgIHZhciBkZXBzID0gaXNQcmVzZW50KHByb3ZpZGVyLmRlcHMpID8gcHJvdmlkZXIuZGVwcyA6IHByb3ZpZGVyLnVzZUNsYXNzLmRpRGVwcztcbiAgICAgICAgICB2YXIgZGVwc0V4cHIgPSBkZXBzLm1hcCgoZGVwKSA9PiB0aGlzLl9nZXREZXBlbmRlbmN5KHJlc29sdmVkUHJvdmlkZXIucHJvdmlkZXJUeXBlLCBkZXApKTtcbiAgICAgICAgICByZXR1cm4gby5pbXBvcnRFeHByKHByb3ZpZGVyLnVzZUNsYXNzKVxuICAgICAgICAgICAgICAuaW5zdGFudGlhdGUoZGVwc0V4cHIsIG8uaW1wb3J0VHlwZShwcm92aWRlci51c2VDbGFzcykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChwcm92aWRlci51c2VWYWx1ZSBpbnN0YW5jZW9mIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBvLmltcG9ydEV4cHIocHJvdmlkZXIudXNlVmFsdWUpO1xuICAgICAgICAgIH0gZWxzZSBpZiAocHJvdmlkZXIudXNlVmFsdWUgaW5zdGFuY2VvZiBvLkV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgIHJldHVybiBwcm92aWRlci51c2VWYWx1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG8ubGl0ZXJhbChwcm92aWRlci51c2VWYWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHZhciBwcm9wTmFtZSA9IGBfJHtyZXNvbHZlZFByb3ZpZGVyLnRva2VuLm5hbWV9XyR7dGhpcy5ub2RlSW5kZXh9XyR7dGhpcy5faW5zdGFuY2VzLnNpemV9YDtcbiAgICAgIHZhciBpbnN0YW5jZSA9XG4gICAgICAgICAgY3JlYXRlUHJvdmlkZXJQcm9wZXJ0eShwcm9wTmFtZSwgcmVzb2x2ZWRQcm92aWRlciwgcHJvdmlkZXJWYWx1ZUV4cHJlc3Npb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZWRQcm92aWRlci5tdWx0aVByb3ZpZGVyLCByZXNvbHZlZFByb3ZpZGVyLmVhZ2VyLCB0aGlzKTtcbiAgICAgIHRoaXMuX2luc3RhbmNlcy5hZGQocmVzb2x2ZWRQcm92aWRlci50b2tlbiwgaW5zdGFuY2UpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5kaXJlY3RpdmVJbnN0YW5jZXMgPVxuICAgICAgICB0aGlzLl9kaXJlY3RpdmVzLm1hcCgoZGlyZWN0aXZlKSA9PiB0aGlzLl9pbnN0YW5jZXMuZ2V0KGlkZW50aWZpZXJUb2tlbihkaXJlY3RpdmUudHlwZSkpKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZGlyZWN0aXZlSW5zdGFuY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZGlyZWN0aXZlSW5zdGFuY2UgPSB0aGlzLmRpcmVjdGl2ZUluc3RhbmNlc1tpXTtcbiAgICAgIHZhciBkaXJlY3RpdmUgPSB0aGlzLl9kaXJlY3RpdmVzW2ldO1xuICAgICAgZGlyZWN0aXZlLnF1ZXJpZXMuZm9yRWFjaCgocXVlcnlNZXRhKSA9PiB7IHRoaXMuX2FkZFF1ZXJ5KHF1ZXJ5TWV0YSwgZGlyZWN0aXZlSW5zdGFuY2UpOyB9KTtcbiAgICB9XG4gICAgdGhpcy5fcmVzb2x2ZWRQcm92aWRlcnMudmFsdWVzKCkuZm9yRWFjaCgocmVzb2x2ZWRQcm92aWRlcikgPT4ge1xuICAgICAgdmFyIHF1ZXJpZXNGb3JQcm92aWRlciA9IHRoaXMuX2dldFF1ZXJpZXNGb3IocmVzb2x2ZWRQcm92aWRlci50b2tlbik7XG4gICAgICB2YXIgcHJvdmlkZXJFeHByID0gdGhpcy5faW5zdGFuY2VzLmdldChyZXNvbHZlZFByb3ZpZGVyLnRva2VuKTtcbiAgICAgIHF1ZXJpZXNGb3JQcm92aWRlci5mb3JFYWNoKChxdWVyeSkgPT4geyBxdWVyeS5hZGRWYWx1ZShwcm92aWRlckV4cHIsIHRoaXMudmlldyk7IH0pO1xuICAgIH0pO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaCh0aGlzLnZhcmlhYmxlVG9rZW5zLCAoXywgdmFyTmFtZSkgPT4ge1xuICAgICAgdmFyIHRva2VuID0gdGhpcy52YXJpYWJsZVRva2Vuc1t2YXJOYW1lXTtcbiAgICAgIHZhciB2YXJWYWx1ZTtcbiAgICAgIHZhciB2YXJWYWx1ZUZvclF1ZXJ5O1xuICAgICAgaWYgKGlzUHJlc2VudCh0b2tlbikpIHtcbiAgICAgICAgdmFyVmFsdWUgPSB2YXJWYWx1ZUZvclF1ZXJ5ID0gdGhpcy5faW5zdGFuY2VzLmdldCh0b2tlbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXJWYWx1ZUZvclF1ZXJ5ID0gdGhpcy5nZXRPckNyZWF0ZUFwcEVsZW1lbnQoKS5wcm9wKCdyZWYnKTtcbiAgICAgICAgdmFyVmFsdWUgPSB0aGlzLnJlbmRlck5vZGU7XG4gICAgICB9XG4gICAgICB0aGlzLnZpZXcudmFyaWFibGVzLnNldCh2YXJOYW1lLCB2YXJWYWx1ZSk7XG4gICAgICB0aGlzLnZpZXcubmFtZWRBcHBFbGVtZW50cy5wdXNoKFt2YXJOYW1lLCB0aGlzLmdldE9yQ3JlYXRlQXBwRWxlbWVudCgpXSk7XG5cbiAgICAgIHZhciBxdWVyaWVzRm9yUHJvdmlkZXIgPSB0aGlzLl9nZXRRdWVyaWVzRm9yKG5ldyBDb21waWxlVG9rZW5NZXRhZGF0YSh7dmFsdWU6IHZhck5hbWV9KSk7XG4gICAgICBxdWVyaWVzRm9yUHJvdmlkZXIuZm9yRWFjaCgocXVlcnkpID0+IHsgcXVlcnkuYWRkVmFsdWUodmFyVmFsdWVGb3JRdWVyeSwgdGhpcy52aWV3KTsgfSk7XG4gICAgfSk7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkpIHtcbiAgICAgIHZhciBjb21wb25lbnRDb25zdHJ1Y3RvclZpZXdRdWVyeUxpc3QgPVxuICAgICAgICAgIGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkgPyBvLmxpdGVyYWxBcnIodGhpcy5fY29tcG9uZW50Q29uc3RydWN0b3JWaWV3UXVlcnlMaXN0cykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLk5VTExfRVhQUjtcbiAgICAgIHZhciBjb21wRXhwciA9IGlzUHJlc2VudCh0aGlzLmdldENvbXBvbmVudCgpKSA/IHRoaXMuZ2V0Q29tcG9uZW50KCkgOiBvLk5VTExfRVhQUjtcbiAgICAgIHRoaXMudmlldy5jcmVhdGVNZXRob2QuYWRkU3RtdChcbiAgICAgICAgICB0aGlzLmdldE9yQ3JlYXRlQXBwRWxlbWVudCgpXG4gICAgICAgICAgICAgIC5jYWxsTWV0aG9kKCdpbml0Q29tcG9uZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgW2NvbXBFeHByLCBjb21wb25lbnRDb25zdHJ1Y3RvclZpZXdRdWVyeUxpc3QsIHRoaXMuX2NvbXBWaWV3RXhwcl0pXG4gICAgICAgICAgICAgIC50b1N0bXQoKSk7XG4gICAgfVxuICB9XG5cbiAgYWZ0ZXJDaGlsZHJlbihjaGlsZE5vZGVDb3VudDogbnVtYmVyKSB7XG4gICAgdGhpcy5fcmVzb2x2ZWRQcm92aWRlcnMudmFsdWVzKCkuZm9yRWFjaCgocmVzb2x2ZWRQcm92aWRlcikgPT4ge1xuICAgICAgLy8gTm90ZTogYWZ0ZXJDaGlsZHJlbiBpcyBjYWxsZWQgYWZ0ZXIgcmVjdXJzaW5nIGludG8gY2hpbGRyZW4uXG4gICAgICAvLyBUaGlzIGlzIGdvb2Qgc28gdGhhdCBhbiBpbmplY3RvciBtYXRjaCBpbiBhbiBlbGVtZW50IHRoYXQgaXMgY2xvc2VyIHRvIGEgcmVxdWVzdGluZyBlbGVtZW50XG4gICAgICAvLyBtYXRjaGVzIGZpcnN0LlxuICAgICAgdmFyIHByb3ZpZGVyRXhwciA9IHRoaXMuX2luc3RhbmNlcy5nZXQocmVzb2x2ZWRQcm92aWRlci50b2tlbik7XG4gICAgICAvLyBOb3RlOiB2aWV3IHByb3ZpZGVycyBhcmUgb25seSB2aXNpYmxlIG9uIHRoZSBpbmplY3RvciBvZiB0aGF0IGVsZW1lbnQuXG4gICAgICAvLyBUaGlzIGlzIG5vdCBmdWxseSBjb3JyZWN0IGFzIHRoZSBydWxlcyBkdXJpbmcgY29kZWdlbiBkb24ndCBhbGxvdyBhIGRpcmVjdGl2ZVxuICAgICAgLy8gdG8gZ2V0IGhvbGQgb2YgYSB2aWV3IHByb3ZkaWVyIG9uIHRoZSBzYW1lIGVsZW1lbnQuIFdlIHN0aWxsIGRvIHRoaXMgc2VtYW50aWNcbiAgICAgIC8vIGFzIGl0IHNpbXBsaWZpZXMgb3VyIG1vZGVsIHRvIGhhdmluZyBvbmx5IG9uZSBydW50aW1lIGluamVjdG9yIHBlciBlbGVtZW50LlxuICAgICAgdmFyIHByb3ZpZGVyQ2hpbGROb2RlQ291bnQgPVxuICAgICAgICAgIHJlc29sdmVkUHJvdmlkZXIucHJvdmlkZXJUeXBlID09PSBQcm92aWRlckFzdFR5cGUuUHJpdmF0ZVNlcnZpY2UgPyAwIDogY2hpbGROb2RlQ291bnQ7XG4gICAgICB0aGlzLnZpZXcuaW5qZWN0b3JHZXRNZXRob2QuYWRkU3RtdChjcmVhdGVJbmplY3RJbnRlcm5hbENvbmRpdGlvbihcbiAgICAgICAgICB0aGlzLm5vZGVJbmRleCwgcHJvdmlkZXJDaGlsZE5vZGVDb3VudCwgcmVzb2x2ZWRQcm92aWRlciwgcHJvdmlkZXJFeHByKSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9xdWVyaWVzLnZhbHVlcygpLmZvckVhY2goXG4gICAgICAgIChxdWVyaWVzKSA9PlxuICAgICAgICAgICAgcXVlcmllcy5mb3JFYWNoKChxdWVyeSkgPT4gcXVlcnkuYWZ0ZXJDaGlsZHJlbih0aGlzLnZpZXcudXBkYXRlQ29udGVudFF1ZXJpZXNNZXRob2QpKSk7XG4gIH1cblxuICBhZGRDb250ZW50Tm9kZShuZ0NvbnRlbnRJbmRleDogbnVtYmVyLCBub2RlRXhwcjogby5FeHByZXNzaW9uKSB7XG4gICAgdGhpcy5jb250ZW50Tm9kZXNCeU5nQ29udGVudEluZGV4W25nQ29udGVudEluZGV4XS5wdXNoKG5vZGVFeHByKTtcbiAgfVxuXG4gIGdldENvbXBvbmVudCgpOiBvLkV4cHJlc3Npb24ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpID8gdGhpcy5faW5zdGFuY2VzLmdldChpZGVudGlmaWVyVG9rZW4odGhpcy5jb21wb25lbnQudHlwZSkpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGw7XG4gIH1cblxuICBnZXRQcm92aWRlclRva2VucygpOiBvLkV4cHJlc3Npb25bXSB7XG4gICAgcmV0dXJuIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzLnZhbHVlcygpLm1hcChcbiAgICAgICAgKHJlc29sdmVkUHJvdmlkZXIpID0+IGNyZWF0ZURpVG9rZW5FeHByZXNzaW9uKHJlc29sdmVkUHJvdmlkZXIudG9rZW4pKTtcbiAgfVxuXG4gIGdldERlY2xhcmVkVmFyaWFibGVzTmFtZXMoKTogc3RyaW5nW10ge1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2godGhpcy52YXJpYWJsZVRva2VucywgKF8sIGtleSkgPT4geyByZXMucHVzaChrZXkpOyB9KTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgZ2V0T3B0aW9uYWxBcHBFbGVtZW50KCk6IG8uRXhwcmVzc2lvbiB7IHJldHVybiB0aGlzLl9hcHBFbGVtZW50OyB9XG5cbiAgZ2V0T3JDcmVhdGVBcHBFbGVtZW50KCk6IG8uRXhwcmVzc2lvbiB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5fYXBwRWxlbWVudCkpIHtcbiAgICAgIHZhciBwYXJlbnROb2RlSW5kZXggPSB0aGlzLmlzUm9vdEVsZW1lbnQoKSA/IG51bGwgOiB0aGlzLnBhcmVudC5ub2RlSW5kZXg7XG4gICAgICB2YXIgZmllbGROYW1lID0gYF9hcHBFbF8ke3RoaXMubm9kZUluZGV4fWA7XG4gICAgICB0aGlzLnZpZXcuZmllbGRzLnB1c2gobmV3IG8uQ2xhc3NGaWVsZChmaWVsZE5hbWUsIG8uaW1wb3J0VHlwZShJZGVudGlmaWVycy5BcHBFbGVtZW50KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtvLlN0bXRNb2RpZmllci5Qcml2YXRlXSkpO1xuICAgICAgdmFyIHN0YXRlbWVudCA9IG8uVEhJU19FWFBSLnByb3AoZmllbGROYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAuc2V0KG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5BcHBFbGVtZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaW5zdGFudGlhdGUoW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbCh0aGlzLm5vZGVJbmRleCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5saXRlcmFsKHBhcmVudE5vZGVJbmRleCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5USElTX0VYUFIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJOb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAudG9TdG10KCk7XG4gICAgICB0aGlzLnZpZXcuY3JlYXRlTWV0aG9kLmFkZFN0bXQoc3RhdGVtZW50KTtcbiAgICAgIHRoaXMuX2FwcEVsZW1lbnQgPSBvLlRISVNfRVhQUi5wcm9wKGZpZWxkTmFtZSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9hcHBFbGVtZW50O1xuICB9XG5cbiAgZ2V0T3JDcmVhdGVJbmplY3RvcigpOiBvLkV4cHJlc3Npb24ge1xuICAgIGlmIChpc0JsYW5rKHRoaXMuX2RlZmF1bHRJbmplY3RvcikpIHtcbiAgICAgIHZhciBmaWVsZE5hbWUgPSBgX2lual8ke3RoaXMubm9kZUluZGV4fWA7XG4gICAgICB0aGlzLnZpZXcuZmllbGRzLnB1c2gobmV3IG8uQ2xhc3NGaWVsZChmaWVsZE5hbWUsIG8uaW1wb3J0VHlwZShJZGVudGlmaWVycy5JbmplY3RvciksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbby5TdG10TW9kaWZpZXIuUHJpdmF0ZV0pKTtcbiAgICAgIHZhciBzdGF0ZW1lbnQgPSBvLlRISVNfRVhQUi5wcm9wKGZpZWxkTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLnNldChvLlRISVNfRVhQUi5jYWxsTWV0aG9kKCdpbmplY3RvcicsIFtvLmxpdGVyYWwodGhpcy5ub2RlSW5kZXgpXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC50b1N0bXQoKTtcbiAgICAgIHRoaXMudmlldy5jcmVhdGVNZXRob2QuYWRkU3RtdChzdGF0ZW1lbnQpO1xuICAgICAgdGhpcy5fZGVmYXVsdEluamVjdG9yID0gby5USElTX0VYUFIucHJvcChmaWVsZE5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZGVmYXVsdEluamVjdG9yO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UXVlcmllc0Zvcih0b2tlbjogQ29tcGlsZVRva2VuTWV0YWRhdGEpOiBDb21waWxlUXVlcnlbXSB7XG4gICAgdmFyIHJlc3VsdDogQ29tcGlsZVF1ZXJ5W10gPSBbXTtcbiAgICB2YXIgY3VycmVudEVsOiBDb21waWxlRWxlbWVudCA9IHRoaXM7XG4gICAgdmFyIGRpc3RhbmNlID0gMDtcbiAgICB2YXIgcXVlcmllczogQ29tcGlsZVF1ZXJ5W107XG4gICAgd2hpbGUgKCFjdXJyZW50RWwuaXNOdWxsKCkpIHtcbiAgICAgIHF1ZXJpZXMgPSBjdXJyZW50RWwuX3F1ZXJpZXMuZ2V0KHRva2VuKTtcbiAgICAgIGlmIChpc1ByZXNlbnQocXVlcmllcykpIHtcbiAgICAgICAgTGlzdFdyYXBwZXIuYWRkQWxsKHJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJpZXMuZmlsdGVyKChxdWVyeSkgPT4gcXVlcnkubWV0YS5kZXNjZW5kYW50cyB8fCBkaXN0YW5jZSA8PSAxKSk7XG4gICAgICB9XG4gICAgICBpZiAoY3VycmVudEVsLl9kaXJlY3RpdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZGlzdGFuY2UrKztcbiAgICAgIH1cbiAgICAgIGN1cnJlbnRFbCA9IGN1cnJlbnRFbC5wYXJlbnQ7XG4gICAgfVxuICAgIHF1ZXJpZXMgPSB0aGlzLnZpZXcuY29tcG9uZW50Vmlldy52aWV3UXVlcmllcy5nZXQodG9rZW4pO1xuICAgIGlmIChpc1ByZXNlbnQocXVlcmllcykpIHtcbiAgICAgIExpc3RXcmFwcGVyLmFkZEFsbChyZXN1bHQsIHF1ZXJpZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBfYWRkUXVlcnkocXVlcnlNZXRhOiBDb21waWxlUXVlcnlNZXRhZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlSW5zdGFuY2U6IG8uRXhwcmVzc2lvbik6IENvbXBpbGVRdWVyeSB7XG4gICAgdmFyIHByb3BOYW1lID0gYF9xdWVyeV8ke3F1ZXJ5TWV0YS5zZWxlY3RvcnNbMF0ubmFtZX1fJHt0aGlzLm5vZGVJbmRleH1fJHt0aGlzLl9xdWVyeUNvdW50Kyt9YDtcbiAgICB2YXIgcXVlcnlMaXN0ID0gY3JlYXRlUXVlcnlMaXN0KHF1ZXJ5TWV0YSwgZGlyZWN0aXZlSW5zdGFuY2UsIHByb3BOYW1lLCB0aGlzLnZpZXcpO1xuICAgIHZhciBxdWVyeSA9IG5ldyBDb21waWxlUXVlcnkocXVlcnlNZXRhLCBxdWVyeUxpc3QsIGRpcmVjdGl2ZUluc3RhbmNlLCB0aGlzLnZpZXcpO1xuICAgIGFkZFF1ZXJ5VG9Ub2tlbk1hcCh0aGlzLl9xdWVyaWVzLCBxdWVyeSk7XG4gICAgcmV0dXJuIHF1ZXJ5O1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0TG9jYWxEZXBlbmRlbmN5KHJlcXVlc3RpbmdQcm92aWRlclR5cGU6IFByb3ZpZGVyQXN0VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcDogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhKTogby5FeHByZXNzaW9uIHtcbiAgICB2YXIgcmVzdWx0ID0gbnVsbDtcbiAgICAvLyBjb25zdHJ1Y3RvciBjb250ZW50IHF1ZXJ5XG4gICAgaWYgKGlzQmxhbmsocmVzdWx0KSAmJiBpc1ByZXNlbnQoZGVwLnF1ZXJ5KSkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5fYWRkUXVlcnkoZGVwLnF1ZXJ5LCBudWxsKS5xdWVyeUxpc3Q7XG4gICAgfVxuXG4gICAgLy8gY29uc3RydWN0b3IgdmlldyBxdWVyeVxuICAgIGlmIChpc0JsYW5rKHJlc3VsdCkgJiYgaXNQcmVzZW50KGRlcC52aWV3UXVlcnkpKSB7XG4gICAgICByZXN1bHQgPSBjcmVhdGVRdWVyeUxpc3QoXG4gICAgICAgICAgZGVwLnZpZXdRdWVyeSwgbnVsbCxcbiAgICAgICAgICBgX3ZpZXdRdWVyeV8ke2RlcC52aWV3UXVlcnkuc2VsZWN0b3JzWzBdLm5hbWV9XyR7dGhpcy5ub2RlSW5kZXh9XyR7dGhpcy5fY29tcG9uZW50Q29uc3RydWN0b3JWaWV3UXVlcnlMaXN0cy5sZW5ndGh9YCxcbiAgICAgICAgICB0aGlzLnZpZXcpO1xuICAgICAgdGhpcy5fY29tcG9uZW50Q29uc3RydWN0b3JWaWV3UXVlcnlMaXN0cy5wdXNoKHJlc3VsdCk7XG4gICAgfVxuXG4gICAgaWYgKGlzUHJlc2VudChkZXAudG9rZW4pKSB7XG4gICAgICAvLyBhY2Nlc3MgYnVpbHRpbnNcbiAgICAgIGlmIChpc0JsYW5rKHJlc3VsdCkpIHtcbiAgICAgICAgaWYgKGRlcC50b2tlbi5lcXVhbHNUbyhpZGVudGlmaWVyVG9rZW4oSWRlbnRpZmllcnMuUmVuZGVyZXIpKSkge1xuICAgICAgICAgIHJlc3VsdCA9IG8uVEhJU19FWFBSLnByb3AoJ3JlbmRlcmVyJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGVwLnRva2VuLmVxdWFsc1RvKGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5FbGVtZW50UmVmKSkpIHtcbiAgICAgICAgICByZXN1bHQgPSB0aGlzLmdldE9yQ3JlYXRlQXBwRWxlbWVudCgpLnByb3AoJ3JlZicpO1xuICAgICAgICB9IGVsc2UgaWYgKGRlcC50b2tlbi5lcXVhbHNUbyhpZGVudGlmaWVyVG9rZW4oSWRlbnRpZmllcnMuQ2hhbmdlRGV0ZWN0b3JSZWYpKSkge1xuICAgICAgICAgIGlmIChyZXF1ZXN0aW5nUHJvdmlkZXJUeXBlID09PSBQcm92aWRlckFzdFR5cGUuQ29tcG9uZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29tcFZpZXdFeHByLnByb3AoJ3JlZicpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gby5USElTX0VYUFIucHJvcCgncmVmJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGRlcC50b2tlbi5lcXVhbHNUbyhpZGVudGlmaWVyVG9rZW4oSWRlbnRpZmllcnMuVmlld0NvbnRhaW5lclJlZikpKSB7XG4gICAgICAgICAgcmVzdWx0ID0gdGhpcy5nZXRPckNyZWF0ZUFwcEVsZW1lbnQoKS5wcm9wKCd2Y1JlZicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBhY2Nlc3MgcHJvdmlkZXJzXG4gICAgICBpZiAoaXNCbGFuayhyZXN1bHQpKSB7XG4gICAgICAgIHJlc3VsdCA9IHRoaXMuX2luc3RhbmNlcy5nZXQoZGVwLnRva2VuKTtcbiAgICAgIH1cbiAgICAgIC8vIGFjY2VzcyB0aGUgaW5qZWN0b3JcbiAgICAgIGlmIChpc0JsYW5rKHJlc3VsdCkgJiYgZGVwLnRva2VuLmVxdWFsc1RvKGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5JbmplY3RvcikpKSB7XG4gICAgICAgIHJlc3VsdCA9IHRoaXMuZ2V0T3JDcmVhdGVJbmplY3RvcigpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0RGVwZW5kZW5jeShyZXF1ZXN0aW5nUHJvdmlkZXJUeXBlOiBQcm92aWRlckFzdFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgZGVwOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEpOiBvLkV4cHJlc3Npb24ge1xuICAgIHZhciBjdXJyRWxlbWVudDogQ29tcGlsZUVsZW1lbnQgPSB0aGlzO1xuICAgIHZhciBjdXJyVmlldyA9IGN1cnJFbGVtZW50LnZpZXc7XG4gICAgdmFyIHJlc3VsdCA9IG51bGw7XG4gICAgaWYgKGRlcC5pc1ZhbHVlKSB7XG4gICAgICByZXN1bHQgPSBvLmxpdGVyYWwoZGVwLnZhbHVlKTtcbiAgICB9XG4gICAgaWYgKGlzQmxhbmsocmVzdWx0KSAmJiAhZGVwLmlzU2tpcFNlbGYpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX2dldExvY2FsRGVwZW5kZW5jeShyZXF1ZXN0aW5nUHJvdmlkZXJUeXBlLCBkZXApO1xuICAgIH1cbiAgICB2YXIgcmVzdWx0Vmlld1BhdGggPSBbXTtcbiAgICAvLyBjaGVjayBwYXJlbnQgZWxlbWVudHNcbiAgICB3aGlsZSAoaXNCbGFuayhyZXN1bHQpICYmICFjdXJyRWxlbWVudC5wYXJlbnQuaXNOdWxsKCkpIHtcbiAgICAgIGN1cnJFbGVtZW50ID0gY3VyckVsZW1lbnQucGFyZW50O1xuICAgICAgd2hpbGUgKGN1cnJFbGVtZW50LnZpZXcgIT09IGN1cnJWaWV3ICYmIGN1cnJWaWV3ICE9IG51bGwpIHtcbiAgICAgICAgY3VyclZpZXcgPSBjdXJyVmlldy5kZWNsYXJhdGlvbkVsZW1lbnQudmlldztcbiAgICAgICAgcmVzdWx0Vmlld1BhdGgucHVzaChjdXJyVmlldyk7XG4gICAgICB9XG4gICAgICByZXN1bHQgPSBjdXJyRWxlbWVudC5fZ2V0TG9jYWxEZXBlbmRlbmN5KFByb3ZpZGVyQXN0VHlwZS5QdWJsaWNTZXJ2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhKHt0b2tlbjogZGVwLnRva2VufSkpO1xuICAgIH1cblxuICAgIGlmIChpc0JsYW5rKHJlc3VsdCkpIHtcbiAgICAgIHJlc3VsdCA9IGluamVjdEZyb21WaWV3UGFyZW50SW5qZWN0b3IoZGVwLnRva2VuLCBkZXAuaXNPcHRpb25hbCk7XG4gICAgfVxuICAgIGlmIChpc0JsYW5rKHJlc3VsdCkpIHtcbiAgICAgIHJlc3VsdCA9IG8uTlVMTF9FWFBSO1xuICAgIH1cbiAgICByZXR1cm4gZ2V0UHJvcGVydHlJblZpZXcocmVzdWx0LCByZXN1bHRWaWV3UGF0aCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlSW5qZWN0SW50ZXJuYWxDb25kaXRpb24obm9kZUluZGV4OiBudW1iZXIsIGNoaWxkTm9kZUNvdW50OiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcjogUHJvdmlkZXJBc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlckV4cHI6IG8uRXhwcmVzc2lvbik6IG8uU3RhdGVtZW50IHtcbiAgdmFyIGluZGV4Q29uZGl0aW9uO1xuICBpZiAoY2hpbGROb2RlQ291bnQgPiAwKSB7XG4gICAgaW5kZXhDb25kaXRpb24gPSBvLmxpdGVyYWwobm9kZUluZGV4KVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5sb3dlckVxdWFscyhJbmplY3RNZXRob2RWYXJzLnJlcXVlc3ROb2RlSW5kZXgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmFuZChJbmplY3RNZXRob2RWYXJzLnJlcXVlc3ROb2RlSW5kZXgubG93ZXJFcXVhbHMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbChub2RlSW5kZXggKyBjaGlsZE5vZGVDb3VudCkpKTtcbiAgfSBlbHNlIHtcbiAgICBpbmRleENvbmRpdGlvbiA9IG8ubGl0ZXJhbChub2RlSW5kZXgpLmlkZW50aWNhbChJbmplY3RNZXRob2RWYXJzLnJlcXVlc3ROb2RlSW5kZXgpO1xuICB9XG4gIHJldHVybiBuZXcgby5JZlN0bXQoXG4gICAgICBJbmplY3RNZXRob2RWYXJzLnRva2VuLmlkZW50aWNhbChjcmVhdGVEaVRva2VuRXhwcmVzc2lvbihwcm92aWRlci50b2tlbikpLmFuZChpbmRleENvbmRpdGlvbiksXG4gICAgICBbbmV3IG8uUmV0dXJuU3RhdGVtZW50KHByb3ZpZGVyRXhwcildKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUHJvdmlkZXJQcm9wZXJ0eShwcm9wTmFtZTogc3RyaW5nLCBwcm92aWRlcjogUHJvdmlkZXJBc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyVmFsdWVFeHByZXNzaW9uczogby5FeHByZXNzaW9uW10sIGlzTXVsdGk6IGJvb2xlYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRWFnZXI6IGJvb2xlYW4sIGNvbXBpbGVFbGVtZW50OiBDb21waWxlRWxlbWVudCk6IG8uRXhwcmVzc2lvbiB7XG4gIHZhciB2aWV3ID0gY29tcGlsZUVsZW1lbnQudmlldztcbiAgdmFyIHJlc29sdmVkUHJvdmlkZXJWYWx1ZUV4cHI7XG4gIHZhciB0eXBlO1xuICBpZiAoaXNNdWx0aSkge1xuICAgIHJlc29sdmVkUHJvdmlkZXJWYWx1ZUV4cHIgPSBvLmxpdGVyYWxBcnIocHJvdmlkZXJWYWx1ZUV4cHJlc3Npb25zKTtcbiAgICB0eXBlID0gbmV3IG8uQXJyYXlUeXBlKG8uRFlOQU1JQ19UWVBFKTtcbiAgfSBlbHNlIHtcbiAgICByZXNvbHZlZFByb3ZpZGVyVmFsdWVFeHByID0gcHJvdmlkZXJWYWx1ZUV4cHJlc3Npb25zWzBdO1xuICAgIHR5cGUgPSBwcm92aWRlclZhbHVlRXhwcmVzc2lvbnNbMF0udHlwZTtcbiAgfVxuICBpZiAoaXNCbGFuayh0eXBlKSkge1xuICAgIHR5cGUgPSBvLkRZTkFNSUNfVFlQRTtcbiAgfVxuICBpZiAoaXNFYWdlcikge1xuICAgIHZpZXcuZmllbGRzLnB1c2gobmV3IG8uQ2xhc3NGaWVsZChwcm9wTmFtZSwgdHlwZSwgW28uU3RtdE1vZGlmaWVyLlByaXZhdGVdKSk7XG4gICAgdmlldy5jcmVhdGVNZXRob2QuYWRkU3RtdChvLlRISVNfRVhQUi5wcm9wKHByb3BOYW1lKS5zZXQocmVzb2x2ZWRQcm92aWRlclZhbHVlRXhwcikudG9TdG10KCkpO1xuICB9IGVsc2Uge1xuICAgIHZhciBpbnRlcm5hbEZpZWxkID0gYF8ke3Byb3BOYW1lfWA7XG4gICAgdmlldy5maWVsZHMucHVzaChuZXcgby5DbGFzc0ZpZWxkKGludGVybmFsRmllbGQsIHR5cGUsIFtvLlN0bXRNb2RpZmllci5Qcml2YXRlXSkpO1xuICAgIHZhciBnZXR0ZXIgPSBuZXcgQ29tcGlsZU1ldGhvZCh2aWV3KTtcbiAgICBnZXR0ZXIucmVzZXREZWJ1Z0luZm8oY29tcGlsZUVsZW1lbnQubm9kZUluZGV4LCBjb21waWxlRWxlbWVudC5zb3VyY2VBc3QpO1xuICAgIC8vIE5vdGU6IEVxdWFscyBpcyBpbXBvcnRhbnQgZm9yIEpTIHNvIHRoYXQgaXQgYWxzbyBjaGVja3MgdGhlIHVuZGVmaW5lZCBjYXNlIVxuICAgIGdldHRlci5hZGRTdG10KFxuICAgICAgICBuZXcgby5JZlN0bXQoby5USElTX0VYUFIucHJvcChpbnRlcm5hbEZpZWxkKS5pc0JsYW5rKCksXG4gICAgICAgICAgICAgICAgICAgICBbby5USElTX0VYUFIucHJvcChpbnRlcm5hbEZpZWxkKS5zZXQocmVzb2x2ZWRQcm92aWRlclZhbHVlRXhwcikudG9TdG10KCldKSk7XG4gICAgZ2V0dGVyLmFkZFN0bXQobmV3IG8uUmV0dXJuU3RhdGVtZW50KG8uVEhJU19FWFBSLnByb3AoaW50ZXJuYWxGaWVsZCkpKTtcbiAgICB2aWV3LmdldHRlcnMucHVzaChuZXcgby5DbGFzc0dldHRlcihwcm9wTmFtZSwgZ2V0dGVyLmZpbmlzaCgpLCB0eXBlKSk7XG4gIH1cbiAgcmV0dXJuIG8uVEhJU19FWFBSLnByb3AocHJvcE5hbWUpO1xufVxuIl19