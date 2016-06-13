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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZV9lbGVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1GNjRCY1M4Mi50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3ZpZXdfY29tcGlsZXIvY29tcGlsZV9lbGVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQVksQ0FBQyxXQUFNLHNCQUFzQixDQUFDLENBQUE7QUFDMUMsNEJBQTJDLGdCQUFnQixDQUFDLENBQUE7QUFDNUQsMEJBQStCLGFBQWEsQ0FBQyxDQUFBO0FBRTdDLHFCQUFpQywwQkFBMEIsQ0FBQyxDQUFBO0FBQzVELDJCQUE0QyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdFLDZCQUFzRSxpQkFBaUIsQ0FBQyxDQUFBO0FBQ3hGLGlDQVNPLHFCQUFxQixDQUFDLENBQUE7QUFDN0IscUJBQXVGLFFBQVEsQ0FBQyxDQUFBO0FBQ2hHLDhCQUFnRSxpQkFBaUIsQ0FBQyxDQUFBO0FBQ2xGLCtCQUE0QixrQkFBa0IsQ0FBQyxDQUFBO0FBRS9DO0lBQ0UscUJBQW1CLE1BQXNCLEVBQVMsSUFBaUIsRUFBUyxTQUFpQixFQUMxRSxVQUF3QixFQUFTLFNBQXNCO1FBRHZELFdBQU0sR0FBTixNQUFNLENBQWdCO1FBQVMsU0FBSSxHQUFKLElBQUksQ0FBYTtRQUFTLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFDMUUsZUFBVSxHQUFWLFVBQVUsQ0FBYztRQUFTLGNBQVMsR0FBVCxTQUFTLENBQWE7SUFBRyxDQUFDO0lBRTlFLDRCQUFNLEdBQU4sY0FBb0IsTUFBTSxDQUFDLGNBQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXRELG1DQUFhLEdBQWIsY0FBMkIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLGtCQUFDO0FBQUQs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UyxFQUFFLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMxRSw4RUFBOEU7UUFDOUUsTUFBTSxDQUFDLE9BQU8sQ0FDVixJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQ3pDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0YsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUNELE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBRUQ7SUFFRSx3QkFBbUIsS0FBbUIsRUFBRSxLQUEyQjtRQUFoRCxVQUFLLEdBQUwsS0FBSyxDQUFjO1FBQ3BDLElBQUksQ0FBQyxJQUFJLEdBQUcsZ0JBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztJQUNuRSxDQUFDO0lBQ0gscUJBQUM7QUFBRCxDQUFDLEFBTEQsSUFLQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIG8gZnJvbSAnLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtJZGVudGlmaWVycywgaWRlbnRpZmllclRva2VufSBmcm9tICcuLi9pZGVudGlmaWVycyc7XG5pbXBvcnQge0luamVjdE1ldGhvZFZhcnN9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Q29tcGlsZVZpZXd9IGZyb20gJy4vY29tcGlsZV92aWV3JztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7VGVtcGxhdGVBc3QsIFByb3ZpZGVyQXN0LCBQcm92aWRlckFzdFR5cGUsIFJlZmVyZW5jZUFzdH0gZnJvbSAnLi4vdGVtcGxhdGVfYXN0JztcbmltcG9ydCB7XG4gIENvbXBpbGVUb2tlbk1hcCxcbiAgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICBDb21waWxlVG9rZW5NZXRhZGF0YSxcbiAgQ29tcGlsZVF1ZXJ5TWV0YWRhdGEsXG4gIENvbXBpbGVQcm92aWRlck1ldGFkYXRhLFxuICBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEsXG4gIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEsXG4gIENvbXBpbGVUeXBlTWV0YWRhdGEsXG59IGZyb20gJy4uL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0IHtnZXRQcm9wZXJ0eUluVmlldywgY3JlYXRlRGlUb2tlbkV4cHJlc3Npb24sIGluamVjdEZyb21WaWV3UGFyZW50SW5qZWN0b3J9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQge0NvbXBpbGVRdWVyeSwgY3JlYXRlUXVlcnlMaXN0LCBhZGRRdWVyeVRvVG9rZW5NYXB9IGZyb20gJy4vY29tcGlsZV9xdWVyeSc7XG5pbXBvcnQge0NvbXBpbGVNZXRob2R9IGZyb20gJy4vY29tcGlsZV9tZXRob2QnO1xuXG5leHBvcnQgY2xhc3MgQ29tcGlsZU5vZGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcGFyZW50OiBDb21waWxlRWxlbWVudCwgcHVibGljIHZpZXc6IENvbXBpbGVWaWV3LCBwdWJsaWMgbm9kZUluZGV4OiBudW1iZXIsXG4gICAgICAgICAgICAgIHB1YmxpYyByZW5kZXJOb2RlOiBvLkV4cHJlc3Npb24sIHB1YmxpYyBzb3VyY2VBc3Q6IFRlbXBsYXRlQXN0KSB7fVxuXG4gIGlzTnVsbCgpOiBib29sZWFuIHsgcmV0dXJuIGlzQmxhbmsodGhpcy5yZW5kZXJOb2RlKTsgfVxuXG4gIGlzUm9vdEVsZW1lbnQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLnZpZXcgIT0gdGhpcy5wYXJlbnQudmlldzsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZUVsZW1lbnQgZXh0ZW5kcyBDb21waWxlTm9kZSB7XG4gIHN0YXRpYyBjcmVhdGVOdWxsKCk6IENvbXBpbGVFbGVtZW50IHtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVFbGVtZW50KG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIFtdLCBbXSwgZmFsc2UsIGZhbHNlLCBbXSk7XG4gIH1cblxuICBwcml2YXRlIF9jb21wVmlld0V4cHI6IG8uRXhwcmVzc2lvbiA9IG51bGw7XG4gIHB1YmxpYyBhcHBFbGVtZW50OiBvLlJlYWRQcm9wRXhwcjtcbiAgcHVibGljIGVsZW1lbnRSZWY6IG8uRXhwcmVzc2lvbjtcbiAgcHVibGljIGluamVjdG9yOiBvLkV4cHJlc3Npb247XG4gIHByaXZhdGUgX2luc3RhbmNlcyA9IG5ldyBDb21waWxlVG9rZW5NYXA8by5FeHByZXNzaW9uPigpO1xuICBwcml2YXRlIF9yZXNvbHZlZFByb3ZpZGVyczogQ29tcGlsZVRva2VuTWFwPFByb3ZpZGVyQXN0PjtcblxuICBwcml2YXRlIF9xdWVyeUNvdW50ID0gMDtcbiAgcHJpdmF0ZSBfcXVlcmllcyA9IG5ldyBDb21waWxlVG9rZW5NYXA8Q29tcGlsZVF1ZXJ5W10+KCk7XG4gIHByaXZhdGUgX2NvbXBvbmVudENvbnN0cnVjdG9yVmlld1F1ZXJ5TGlzdHM6IG8uRXhwcmVzc2lvbltdID0gW107XG5cbiAgcHVibGljIGNvbnRlbnROb2Rlc0J5TmdDb250ZW50SW5kZXg6IEFycmF5PG8uRXhwcmVzc2lvbj5bXSA9IG51bGw7XG4gIHB1YmxpYyBlbWJlZGRlZFZpZXc6IENvbXBpbGVWaWV3O1xuICBwdWJsaWMgZGlyZWN0aXZlSW5zdGFuY2VzOiBvLkV4cHJlc3Npb25bXTtcbiAgcHVibGljIHJlZmVyZW5jZVRva2Vuczoge1trZXk6IHN0cmluZ106IENvbXBpbGVUb2tlbk1ldGFkYXRhfTtcblxuICBjb25zdHJ1Y3RvcihwYXJlbnQ6IENvbXBpbGVFbGVtZW50LCB2aWV3OiBDb21waWxlVmlldywgbm9kZUluZGV4OiBudW1iZXIsXG4gICAgICAgICAgICAgIHJlbmRlck5vZGU6IG8uRXhwcmVzc2lvbiwgc291cmNlQXN0OiBUZW1wbGF0ZUFzdCxcbiAgICAgICAgICAgICAgcHVibGljIGNvbXBvbmVudDogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICAgICAgICAgICAgICBwcml2YXRlIF9kaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfcmVzb2x2ZWRQcm92aWRlcnNBcnJheTogUHJvdmlkZXJBc3RbXSwgcHVibGljIGhhc1ZpZXdDb250YWluZXI6IGJvb2xlYW4sXG4gICAgICAgICAgICAgIHB1YmxpYyBoYXNFbWJlZGRlZFZpZXc6IGJvb2xlYW4sIHJlZmVyZW5jZXM6IFJlZmVyZW5jZUFzdFtdKSB7XG4gICAgc3VwZXIocGFyZW50LCB2aWV3LCBub2RlSW5kZXgsIHJlbmRlck5vZGUsIHNvdXJjZUFzdCk7XG4gICAgdGhpcy5yZWZlcmVuY2VUb2tlbnMgPSB7fTtcbiAgICByZWZlcmVuY2VzLmZvckVhY2gocmVmID0+IHRoaXMucmVmZXJlbmNlVG9rZW5zW3JlZi5uYW1lXSA9IHJlZi52YWx1ZSk7XG5cbiAgICB0aGlzLmVsZW1lbnRSZWYgPSBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuRWxlbWVudFJlZikuaW5zdGFudGlhdGUoW3RoaXMucmVuZGVyTm9kZV0pO1xuICAgIHRoaXMuX2luc3RhbmNlcy5hZGQoaWRlbnRpZmllclRva2VuKElkZW50aWZpZXJzLkVsZW1lbnRSZWYpLCB0aGlzLmVsZW1lbnRSZWYpO1xuICAgIHRoaXMuaW5qZWN0b3IgPSBvLlRISVNfRVhQUi5jYWxsTWV0aG9kKCdpbmplY3RvcicsIFtvLmxpdGVyYWwodGhpcy5ub2RlSW5kZXgpXSk7XG4gICAgdGhpcy5faW5zdGFuY2VzLmFkZChpZGVudGlmaWVyVG9rZW4oSWRlbnRpZmllcnMuSW5qZWN0b3IpLCB0aGlzLmluamVjdG9yKTtcbiAgICB0aGlzLl9pbnN0YW5jZXMuYWRkKGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5SZW5kZXJlciksIG8uVEhJU19FWFBSLnByb3AoJ3JlbmRlcmVyJykpO1xuICAgIGlmICh0aGlzLmhhc1ZpZXdDb250YWluZXIgfHwgdGhpcy5oYXNFbWJlZGRlZFZpZXcgfHwgaXNQcmVzZW50KHRoaXMuY29tcG9uZW50KSkge1xuICAgICAgdGhpcy5fY3JlYXRlQXBwRWxlbWVudCgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZUFwcEVsZW1lbnQoKSB7XG4gICAgdmFyIGZpZWxkTmFtZSA9IGBfYXBwRWxfJHt0aGlzLm5vZGVJbmRleH1gO1xuICAgIHZhciBwYXJlbnROb2RlSW5kZXggPSB0aGlzLmlzUm9vdEVsZW1lbnQoKSA/IG51bGwgOiB0aGlzLnBhcmVudC5ub2RlSW5kZXg7XG4gICAgdGhpcy52aWV3LmZpZWxkcy5wdXNoKG5ldyBvLkNsYXNzRmllbGQoZmllbGROYW1lLCBvLmltcG9ydFR5cGUoSWRlbnRpZmllcnMuQXBwRWxlbWVudCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW28uU3RtdE1vZGlmaWVyLlByaXZhdGVdKSk7XG4gICAgdmFyIHN0YXRlbWVudCA9IG8uVEhJU19FWFBSLnByb3AoZmllbGROYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnNldChvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuQXBwRWxlbWVudClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5pbnN0YW50aWF0ZShbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbCh0aGlzLm5vZGVJbmRleCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbChwYXJlbnROb2RlSW5kZXgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLlRISVNfRVhQUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJOb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50b1N0bXQoKTtcbiAgICB0aGlzLnZpZXcuY3JlYXRlTWV0aG9kLmFkZFN0bXQoc3RhdGVtZW50KTtcbiAgICB0aGlzLmFwcEVsZW1lbnQgPSBvLlRISVNfRVhQUi5wcm9wKGZpZWxkTmFtZSk7XG4gICAgdGhpcy5faW5zdGFuY2VzLmFkZChpZGVudGlmaWVyVG9rZW4oSWRlbnRpZmllcnMuQXBwRWxlbWVudCksIHRoaXMuYXBwRWxlbWVudCk7XG4gIH1cblxuICBzZXRDb21wb25lbnRWaWV3KGNvbXBWaWV3RXhwcjogby5FeHByZXNzaW9uKSB7XG4gICAgdGhpcy5fY29tcFZpZXdFeHByID0gY29tcFZpZXdFeHByO1xuICAgIHRoaXMuY29udGVudE5vZGVzQnlOZ0NvbnRlbnRJbmRleCA9XG4gICAgICAgIExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZSh0aGlzLmNvbXBvbmVudC50ZW1wbGF0ZS5uZ0NvbnRlbnRTZWxlY3RvcnMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29udGVudE5vZGVzQnlOZ0NvbnRlbnRJbmRleC5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5jb250ZW50Tm9kZXNCeU5nQ29udGVudEluZGV4W2ldID0gW107XG4gICAgfVxuICB9XG5cbiAgc2V0RW1iZWRkZWRWaWV3KGVtYmVkZGVkVmlldzogQ29tcGlsZVZpZXcpIHtcbiAgICB0aGlzLmVtYmVkZGVkVmlldyA9IGVtYmVkZGVkVmlldztcbiAgICBpZiAoaXNQcmVzZW50KGVtYmVkZGVkVmlldykpIHtcbiAgICAgIHZhciBjcmVhdGVUZW1wbGF0ZVJlZkV4cHIgPVxuICAgICAgICAgIG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5UZW1wbGF0ZVJlZl8pXG4gICAgICAgICAgICAgIC5pbnN0YW50aWF0ZShbdGhpcy5hcHBFbGVtZW50LCB0aGlzLmVtYmVkZGVkVmlldy52aWV3RmFjdG9yeV0pO1xuICAgICAgdmFyIHByb3ZpZGVyID0gbmV3IENvbXBpbGVQcm92aWRlck1ldGFkYXRhKFxuICAgICAgICAgIHt0b2tlbjogaWRlbnRpZmllclRva2VuKElkZW50aWZpZXJzLlRlbXBsYXRlUmVmKSwgdXNlVmFsdWU6IGNyZWF0ZVRlbXBsYXRlUmVmRXhwcn0pO1xuICAgICAgLy8gQWRkIFRlbXBsYXRlUmVmIGFzIGZpcnN0IHByb3ZpZGVyIGFzIGl0IGRvZXMgbm90IGhhdmUgZGVwcyBvbiBvdGhlciBwcm92aWRlcnNcbiAgICAgIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzQXJyYXkudW5zaGlmdChuZXcgUHJvdmlkZXJBc3QocHJvdmlkZXIudG9rZW4sIGZhbHNlLCB0cnVlLCBbcHJvdmlkZXJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBQcm92aWRlckFzdFR5cGUuQnVpbHRpbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zb3VyY2VBc3Quc291cmNlU3BhbikpO1xuICAgIH1cbiAgfVxuXG4gIGJlZm9yZUNoaWxkcmVuKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmhhc1ZpZXdDb250YWluZXIpIHtcbiAgICAgIHRoaXMuX2luc3RhbmNlcy5hZGQoaWRlbnRpZmllclRva2VuKElkZW50aWZpZXJzLlZpZXdDb250YWluZXJSZWYpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFwcEVsZW1lbnQucHJvcCgndmNSZWYnKSk7XG4gICAgfVxuXG4gICAgdGhpcy5fcmVzb2x2ZWRQcm92aWRlcnMgPSBuZXcgQ29tcGlsZVRva2VuTWFwPFByb3ZpZGVyQXN0PigpO1xuICAgIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzQXJyYXkuZm9yRWFjaChwcm92aWRlciA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVzb2x2ZWRQcm92aWRlcnMuYWRkKHByb3ZpZGVyLnRva2VuLCBwcm92aWRlcikpO1xuXG4gICAgLy8gY3JlYXRlIGFsbCB0aGUgcHJvdmlkZXIgaW5zdGFuY2VzLCBzb21lIGluIHRoZSB2aWV3IGNvbnN0cnVjdG9yLFxuICAgIC8vIHNvbWUgYXMgZ2V0dGVycy4gV2UgcmVseSBvbiB0aGUgZmFjdCB0aGF0IHRoZXkgYXJlIGFscmVhZHkgc29ydGVkIHRvcG9sb2dpY2FsbHkuXG4gICAgdGhpcy5fcmVzb2x2ZWRQcm92aWRlcnMudmFsdWVzKCkuZm9yRWFjaCgocmVzb2x2ZWRQcm92aWRlcikgPT4ge1xuICAgICAgdmFyIHByb3ZpZGVyVmFsdWVFeHByZXNzaW9ucyA9IHJlc29sdmVkUHJvdmlkZXIucHJvdmlkZXJzLm1hcCgocHJvdmlkZXIpID0+IHtcbiAgICAgICAgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VFeGlzdGluZykpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0RGVwZW5kZW5jeShcbiAgICAgICAgICAgICAgcmVzb2x2ZWRQcm92aWRlci5wcm92aWRlclR5cGUsXG4gICAgICAgICAgICAgIG5ldyBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEoe3Rva2VuOiBwcm92aWRlci51c2VFeGlzdGluZ30pKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQocHJvdmlkZXIudXNlRmFjdG9yeSkpIHtcbiAgICAgICAgICB2YXIgZGVwcyA9IGlzUHJlc2VudChwcm92aWRlci5kZXBzKSA/IHByb3ZpZGVyLmRlcHMgOiBwcm92aWRlci51c2VGYWN0b3J5LmRpRGVwcztcbiAgICAgICAgICB2YXIgZGVwc0V4cHIgPSBkZXBzLm1hcCgoZGVwKSA9PiB0aGlzLl9nZXREZXBlbmRlbmN5KHJlc29sdmVkUHJvdmlkZXIucHJvdmlkZXJUeXBlLCBkZXApKTtcbiAgICAgICAgICByZXR1cm4gby5pbXBvcnRFeHByKHByb3ZpZGVyLnVzZUZhY3RvcnkpLmNhbGxGbihkZXBzRXhwcik7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KHByb3ZpZGVyLnVzZUNsYXNzKSkge1xuICAgICAgICAgIHZhciBkZXBzID0gaXNQcmVzZW50KHByb3ZpZGVyLmRlcHMpID8gcHJvdmlkZXIuZGVwcyA6IHByb3ZpZGVyLnVzZUNsYXNzLmRpRGVwcztcbiAgICAgICAgICB2YXIgZGVwc0V4cHIgPSBkZXBzLm1hcCgoZGVwKSA9PiB0aGlzLl9nZXREZXBlbmRlbmN5KHJlc29sdmVkUHJvdmlkZXIucHJvdmlkZXJUeXBlLCBkZXApKTtcbiAgICAgICAgICByZXR1cm4gby5pbXBvcnRFeHByKHByb3ZpZGVyLnVzZUNsYXNzKVxuICAgICAgICAgICAgICAuaW5zdGFudGlhdGUoZGVwc0V4cHIsIG8uaW1wb3J0VHlwZShwcm92aWRlci51c2VDbGFzcykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChwcm92aWRlci51c2VWYWx1ZSBpbnN0YW5jZW9mIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBvLmltcG9ydEV4cHIocHJvdmlkZXIudXNlVmFsdWUpO1xuICAgICAgICAgIH0gZWxzZSBpZiAocHJvdmlkZXIudXNlVmFsdWUgaW5zdGFuY2VvZiBvLkV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgIHJldHVybiBwcm92aWRlci51c2VWYWx1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG8ubGl0ZXJhbChwcm92aWRlci51c2VWYWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHZhciBwcm9wTmFtZSA9IGBfJHtyZXNvbHZlZFByb3ZpZGVyLnRva2VuLm5hbWV9XyR7dGhpcy5ub2RlSW5kZXh9XyR7dGhpcy5faW5zdGFuY2VzLnNpemV9YDtcbiAgICAgIHZhciBpbnN0YW5jZSA9XG4gICAgICAgICAgY3JlYXRlUHJvdmlkZXJQcm9wZXJ0eShwcm9wTmFtZSwgcmVzb2x2ZWRQcm92aWRlciwgcHJvdmlkZXJWYWx1ZUV4cHJlc3Npb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZWRQcm92aWRlci5tdWx0aVByb3ZpZGVyLCByZXNvbHZlZFByb3ZpZGVyLmVhZ2VyLCB0aGlzKTtcbiAgICAgIHRoaXMuX2luc3RhbmNlcy5hZGQocmVzb2x2ZWRQcm92aWRlci50b2tlbiwgaW5zdGFuY2UpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5kaXJlY3RpdmVJbnN0YW5jZXMgPVxuICAgICAgICB0aGlzLl9kaXJlY3RpdmVzLm1hcCgoZGlyZWN0aXZlKSA9PiB0aGlzLl9pbnN0YW5jZXMuZ2V0KGlkZW50aWZpZXJUb2tlbihkaXJlY3RpdmUudHlwZSkpKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZGlyZWN0aXZlSW5zdGFuY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZGlyZWN0aXZlSW5zdGFuY2UgPSB0aGlzLmRpcmVjdGl2ZUluc3RhbmNlc1tpXTtcbiAgICAgIHZhciBkaXJlY3RpdmUgPSB0aGlzLl9kaXJlY3RpdmVzW2ldO1xuICAgICAgZGlyZWN0aXZlLnF1ZXJpZXMuZm9yRWFjaCgocXVlcnlNZXRhKSA9PiB7IHRoaXMuX2FkZFF1ZXJ5KHF1ZXJ5TWV0YSwgZGlyZWN0aXZlSW5zdGFuY2UpOyB9KTtcbiAgICB9XG4gICAgdmFyIHF1ZXJpZXNXaXRoUmVhZHM6IF9RdWVyeVdpdGhSZWFkW10gPSBbXTtcbiAgICB0aGlzLl9yZXNvbHZlZFByb3ZpZGVycy52YWx1ZXMoKS5mb3JFYWNoKChyZXNvbHZlZFByb3ZpZGVyKSA9PiB7XG4gICAgICB2YXIgcXVlcmllc0ZvclByb3ZpZGVyID0gdGhpcy5fZ2V0UXVlcmllc0ZvcihyZXNvbHZlZFByb3ZpZGVyLnRva2VuKTtcbiAgICAgIExpc3RXcmFwcGVyLmFkZEFsbChcbiAgICAgICAgICBxdWVyaWVzV2l0aFJlYWRzLFxuICAgICAgICAgIHF1ZXJpZXNGb3JQcm92aWRlci5tYXAocXVlcnkgPT4gbmV3IF9RdWVyeVdpdGhSZWFkKHF1ZXJ5LCByZXNvbHZlZFByb3ZpZGVyLnRva2VuKSkpO1xuICAgIH0pO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaCh0aGlzLnJlZmVyZW5jZVRva2VucywgKF8sIHZhck5hbWUpID0+IHtcbiAgICAgIHZhciB0b2tlbiA9IHRoaXMucmVmZXJlbmNlVG9rZW5zW3Zhck5hbWVdO1xuICAgICAgdmFyIHZhclZhbHVlO1xuICAgICAgaWYgKGlzUHJlc2VudCh0b2tlbikpIHtcbiAgICAgICAgdmFyVmFsdWUgPSB0aGlzLl9pbnN0YW5jZXMuZ2V0KHRva2VuKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhclZhbHVlID0gdGhpcy5yZW5kZXJOb2RlO1xuICAgICAgfVxuICAgICAgdGhpcy52aWV3LmxvY2Fscy5zZXQodmFyTmFtZSwgdmFyVmFsdWUpO1xuICAgICAgdmFyIHZhclRva2VuID0gbmV3IENvbXBpbGVUb2tlbk1ldGFkYXRhKHt2YWx1ZTogdmFyTmFtZX0pO1xuICAgICAgTGlzdFdyYXBwZXIuYWRkQWxsKHF1ZXJpZXNXaXRoUmVhZHMsIHRoaXMuX2dldFF1ZXJpZXNGb3IodmFyVG9rZW4pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAocXVlcnkgPT4gbmV3IF9RdWVyeVdpdGhSZWFkKHF1ZXJ5LCB2YXJUb2tlbikpKTtcbiAgICB9KTtcbiAgICBxdWVyaWVzV2l0aFJlYWRzLmZvckVhY2goKHF1ZXJ5V2l0aFJlYWQpID0+IHtcbiAgICAgIHZhciB2YWx1ZTogby5FeHByZXNzaW9uO1xuICAgICAgaWYgKGlzUHJlc2VudChxdWVyeVdpdGhSZWFkLnJlYWQuaWRlbnRpZmllcikpIHtcbiAgICAgICAgLy8gcXVlcnkgZm9yIGFuIGlkZW50aWZpZXJcbiAgICAgICAgdmFsdWUgPSB0aGlzLl9pbnN0YW5jZXMuZ2V0KHF1ZXJ5V2l0aFJlYWQucmVhZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBxdWVyeSBmb3IgYSByZWZlcmVuY2VcbiAgICAgICAgdmFyIHRva2VuID0gdGhpcy5yZWZlcmVuY2VUb2tlbnNbcXVlcnlXaXRoUmVhZC5yZWFkLnZhbHVlXTtcbiAgICAgICAgaWYgKGlzUHJlc2VudCh0b2tlbikpIHtcbiAgICAgICAgICB2YWx1ZSA9IHRoaXMuX2luc3RhbmNlcy5nZXQodG9rZW4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHVlID0gdGhpcy5lbGVtZW50UmVmO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KHZhbHVlKSkge1xuICAgICAgICBxdWVyeVdpdGhSZWFkLnF1ZXJ5LmFkZFZhbHVlKHZhbHVlLCB0aGlzLnZpZXcpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkpIHtcbiAgICAgIHZhciBjb21wb25lbnRDb25zdHJ1Y3RvclZpZXdRdWVyeUxpc3QgPVxuICAgICAgICAgIGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkgPyBvLmxpdGVyYWxBcnIodGhpcy5fY29tcG9uZW50Q29uc3RydWN0b3JWaWV3UXVlcnlMaXN0cykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLk5VTExfRVhQUjtcbiAgICAgIHZhciBjb21wRXhwciA9IGlzUHJlc2VudCh0aGlzLmdldENvbXBvbmVudCgpKSA/IHRoaXMuZ2V0Q29tcG9uZW50KCkgOiBvLk5VTExfRVhQUjtcbiAgICAgIHRoaXMudmlldy5jcmVhdGVNZXRob2QuYWRkU3RtdChcbiAgICAgICAgICB0aGlzLmFwcEVsZW1lbnQuY2FsbE1ldGhvZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2luaXRDb21wb25lbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbY29tcEV4cHIsIGNvbXBvbmVudENvbnN0cnVjdG9yVmlld1F1ZXJ5TGlzdCwgdGhpcy5fY29tcFZpZXdFeHByXSlcbiAgICAgICAgICAgICAgLnRvU3RtdCgpKTtcbiAgICB9XG4gIH1cblxuICBhZnRlckNoaWxkcmVuKGNoaWxkTm9kZUNvdW50OiBudW1iZXIpIHtcbiAgICB0aGlzLl9yZXNvbHZlZFByb3ZpZGVycy52YWx1ZXMoKS5mb3JFYWNoKChyZXNvbHZlZFByb3ZpZGVyKSA9PiB7XG4gICAgICAvLyBOb3RlOiBhZnRlckNoaWxkcmVuIGlzIGNhbGxlZCBhZnRlciByZWN1cnNpbmcgaW50byBjaGlsZHJlbi5cbiAgICAgIC8vIFRoaXMgaXMgZ29vZCBzbyB0aGF0IGFuIGluamVjdG9yIG1hdGNoIGluIGFuIGVsZW1lbnQgdGhhdCBpcyBjbG9zZXIgdG8gYSByZXF1ZXN0aW5nIGVsZW1lbnRcbiAgICAgIC8vIG1hdGNoZXMgZmlyc3QuXG4gICAgICB2YXIgcHJvdmlkZXJFeHByID0gdGhpcy5faW5zdGFuY2VzLmdldChyZXNvbHZlZFByb3ZpZGVyLnRva2VuKTtcbiAgICAgIC8vIE5vdGU6IHZpZXcgcHJvdmlkZXJzIGFyZSBvbmx5IHZpc2libGUgb24gdGhlIGluamVjdG9yIG9mIHRoYXQgZWxlbWVudC5cbiAgICAgIC8vIFRoaXMgaXMgbm90IGZ1bGx5IGNvcnJlY3QgYXMgdGhlIHJ1bGVzIGR1cmluZyBjb2RlZ2VuIGRvbid0IGFsbG93IGEgZGlyZWN0aXZlXG4gICAgICAvLyB0byBnZXQgaG9sZCBvZiBhIHZpZXcgcHJvdmRpZXIgb24gdGhlIHNhbWUgZWxlbWVudC4gV2Ugc3RpbGwgZG8gdGhpcyBzZW1hbnRpY1xuICAgICAgLy8gYXMgaXQgc2ltcGxpZmllcyBvdXIgbW9kZWwgdG8gaGF2aW5nIG9ubHkgb25lIHJ1bnRpbWUgaW5qZWN0b3IgcGVyIGVsZW1lbnQuXG4gICAgICB2YXIgcHJvdmlkZXJDaGlsZE5vZGVDb3VudCA9XG4gICAgICAgICAgcmVzb2x2ZWRQcm92aWRlci5wcm92aWRlclR5cGUgPT09IFByb3ZpZGVyQXN0VHlwZS5Qcml2YXRlU2VydmljZSA/IDAgOiBjaGlsZE5vZGVDb3VudDtcbiAgICAgIHRoaXMudmlldy5pbmplY3RvckdldE1ldGhvZC5hZGRTdG10KGNyZWF0ZUluamVjdEludGVybmFsQ29uZGl0aW9uKFxuICAgICAgICAgIHRoaXMubm9kZUluZGV4LCBwcm92aWRlckNoaWxkTm9kZUNvdW50LCByZXNvbHZlZFByb3ZpZGVyLCBwcm92aWRlckV4cHIpKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX3F1ZXJpZXMudmFsdWVzKCkuZm9yRWFjaChcbiAgICAgICAgKHF1ZXJpZXMpID0+XG4gICAgICAgICAgICBxdWVyaWVzLmZvckVhY2goKHF1ZXJ5KSA9PiBxdWVyeS5hZnRlckNoaWxkcmVuKHRoaXMudmlldy5jcmVhdGVNZXRob2QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmlldy51cGRhdGVDb250ZW50UXVlcmllc01ldGhvZCkpKTtcbiAgfVxuXG4gIGFkZENvbnRlbnROb2RlKG5nQ29udGVudEluZGV4OiBudW1iZXIsIG5vZGVFeHByOiBvLkV4cHJlc3Npb24pIHtcbiAgICB0aGlzLmNvbnRlbnROb2Rlc0J5TmdDb250ZW50SW5kZXhbbmdDb250ZW50SW5kZXhdLnB1c2gobm9kZUV4cHIpO1xuICB9XG5cbiAgZ2V0Q29tcG9uZW50KCk6IG8uRXhwcmVzc2lvbiB7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkgPyB0aGlzLl9pbnN0YW5jZXMuZ2V0KGlkZW50aWZpZXJUb2tlbih0aGlzLmNvbXBvbmVudC50eXBlKSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbDtcbiAgfVxuXG4gIGdldFByb3ZpZGVyVG9rZW5zKCk6IG8uRXhwcmVzc2lvbltdIHtcbiAgICByZXR1cm4gdGhpcy5fcmVzb2x2ZWRQcm92aWRlcnMudmFsdWVzKCkubWFwKFxuICAgICAgICAocmVzb2x2ZWRQcm92aWRlcikgPT4gY3JlYXRlRGlUb2tlbkV4cHJlc3Npb24ocmVzb2x2ZWRQcm92aWRlci50b2tlbikpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UXVlcmllc0Zvcih0b2tlbjogQ29tcGlsZVRva2VuTWV0YWRhdGEpOiBDb21waWxlUXVlcnlbXSB7XG4gICAgdmFyIHJlc3VsdDogQ29tcGlsZVF1ZXJ5W10gPSBbXTtcbiAgICB2YXIgY3VycmVudEVsOiBDb21waWxlRWxlbWVudCA9IHRoaXM7XG4gICAgdmFyIGRpc3RhbmNlID0gMDtcbiAgICB2YXIgcXVlcmllczogQ29tcGlsZVF1ZXJ5W107XG4gICAgd2hpbGUgKCFjdXJyZW50RWwuaXNOdWxsKCkpIHtcbiAgICAgIHF1ZXJpZXMgPSBjdXJyZW50RWwuX3F1ZXJpZXMuZ2V0KHRva2VuKTtcbiAgICAgIGlmIChpc1ByZXNlbnQocXVlcmllcykpIHtcbiAgICAgICAgTGlzdFdyYXBwZXIuYWRkQWxsKHJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJpZXMuZmlsdGVyKChxdWVyeSkgPT4gcXVlcnkubWV0YS5kZXNjZW5kYW50cyB8fCBkaXN0YW5jZSA8PSAxKSk7XG4gICAgICB9XG4gICAgICBpZiAoY3VycmVudEVsLl9kaXJlY3RpdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZGlzdGFuY2UrKztcbiAgICAgIH1cbiAgICAgIGN1cnJlbnRFbCA9IGN1cnJlbnRFbC5wYXJlbnQ7XG4gICAgfVxuICAgIHF1ZXJpZXMgPSB0aGlzLnZpZXcuY29tcG9uZW50Vmlldy52aWV3UXVlcmllcy5nZXQodG9rZW4pO1xuICAgIGlmIChpc1ByZXNlbnQocXVlcmllcykpIHtcbiAgICAgIExpc3RXcmFwcGVyLmFkZEFsbChyZXN1bHQsIHF1ZXJpZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBfYWRkUXVlcnkocXVlcnlNZXRhOiBDb21waWxlUXVlcnlNZXRhZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlSW5zdGFuY2U6IG8uRXhwcmVzc2lvbik6IENvbXBpbGVRdWVyeSB7XG4gICAgdmFyIHByb3BOYW1lID0gYF9xdWVyeV8ke3F1ZXJ5TWV0YS5zZWxlY3RvcnNbMF0ubmFtZX1fJHt0aGlzLm5vZGVJbmRleH1fJHt0aGlzLl9xdWVyeUNvdW50Kyt9YDtcbiAgICB2YXIgcXVlcnlMaXN0ID0gY3JlYXRlUXVlcnlMaXN0KHF1ZXJ5TWV0YSwgZGlyZWN0aXZlSW5zdGFuY2UsIHByb3BOYW1lLCB0aGlzLnZpZXcpO1xuICAgIHZhciBxdWVyeSA9IG5ldyBDb21waWxlUXVlcnkocXVlcnlNZXRhLCBxdWVyeUxpc3QsIGRpcmVjdGl2ZUluc3RhbmNlLCB0aGlzLnZpZXcpO1xuICAgIGFkZFF1ZXJ5VG9Ub2tlbk1hcCh0aGlzLl9xdWVyaWVzLCBxdWVyeSk7XG4gICAgcmV0dXJuIHF1ZXJ5O1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0TG9jYWxEZXBlbmRlbmN5KHJlcXVlc3RpbmdQcm92aWRlclR5cGU6IFByb3ZpZGVyQXN0VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcDogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhKTogby5FeHByZXNzaW9uIHtcbiAgICB2YXIgcmVzdWx0ID0gbnVsbDtcbiAgICAvLyBjb25zdHJ1Y3RvciBjb250ZW50IHF1ZXJ5XG4gICAgaWYgKGlzQmxhbmsocmVzdWx0KSAmJiBpc1ByZXNlbnQoZGVwLnF1ZXJ5KSkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5fYWRkUXVlcnkoZGVwLnF1ZXJ5LCBudWxsKS5xdWVyeUxpc3Q7XG4gICAgfVxuXG4gICAgLy8gY29uc3RydWN0b3IgdmlldyBxdWVyeVxuICAgIGlmIChpc0JsYW5rKHJlc3VsdCkgJiYgaXNQcmVzZW50KGRlcC52aWV3UXVlcnkpKSB7XG4gICAgICByZXN1bHQgPSBjcmVhdGVRdWVyeUxpc3QoXG4gICAgICAgICAgZGVwLnZpZXdRdWVyeSwgbnVsbCxcbiAgICAgICAgICBgX3ZpZXdRdWVyeV8ke2RlcC52aWV3UXVlcnkuc2VsZWN0b3JzWzBdLm5hbWV9XyR7dGhpcy5ub2RlSW5kZXh9XyR7dGhpcy5fY29tcG9uZW50Q29uc3RydWN0b3JWaWV3UXVlcnlMaXN0cy5sZW5ndGh9YCxcbiAgICAgICAgICB0aGlzLnZpZXcpO1xuICAgICAgdGhpcy5fY29tcG9uZW50Q29uc3RydWN0b3JWaWV3UXVlcnlMaXN0cy5wdXNoKHJlc3VsdCk7XG4gICAgfVxuXG4gICAgaWYgKGlzUHJlc2VudChkZXAudG9rZW4pKSB7XG4gICAgICAvLyBhY2Nlc3MgYnVpbHRpbnMgd2l0aCBzcGVjaWFsIHZpc2liaWxpdHlcbiAgICAgIGlmIChpc0JsYW5rKHJlc3VsdCkpIHtcbiAgICAgICAgaWYgKGRlcC50b2tlbi5lcXVhbHNUbyhpZGVudGlmaWVyVG9rZW4oSWRlbnRpZmllcnMuQ2hhbmdlRGV0ZWN0b3JSZWYpKSkge1xuICAgICAgICAgIGlmIChyZXF1ZXN0aW5nUHJvdmlkZXJUeXBlID09PSBQcm92aWRlckFzdFR5cGUuQ29tcG9uZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29tcFZpZXdFeHByLnByb3AoJ3JlZicpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gby5USElTX0VYUFIucHJvcCgncmVmJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBhY2Nlc3MgcmVndWxhciBwcm92aWRlcnMgb24gdGhlIGVsZW1lbnRcbiAgICAgIGlmIChpc0JsYW5rKHJlc3VsdCkpIHtcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5faW5zdGFuY2VzLmdldChkZXAudG9rZW4pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0RGVwZW5kZW5jeShyZXF1ZXN0aW5nUHJvdmlkZXJUeXBlOiBQcm92aWRlckFzdFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgZGVwOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEpOiBvLkV4cHJlc3Npb24ge1xuICAgIHZhciBjdXJyRWxlbWVudDogQ29tcGlsZUVsZW1lbnQgPSB0aGlzO1xuICAgIHZhciByZXN1bHQgPSBudWxsO1xuICAgIGlmIChkZXAuaXNWYWx1ZSkge1xuICAgICAgcmVzdWx0ID0gby5saXRlcmFsKGRlcC52YWx1ZSk7XG4gICAgfVxuICAgIGlmIChpc0JsYW5rKHJlc3VsdCkgJiYgIWRlcC5pc1NraXBTZWxmKSB7XG4gICAgICByZXN1bHQgPSB0aGlzLl9nZXRMb2NhbERlcGVuZGVuY3kocmVxdWVzdGluZ1Byb3ZpZGVyVHlwZSwgZGVwKTtcbiAgICB9XG4gICAgLy8gY2hlY2sgcGFyZW50IGVsZW1lbnRzXG4gICAgd2hpbGUgKGlzQmxhbmsocmVzdWx0KSAmJiAhY3VyckVsZW1lbnQucGFyZW50LmlzTnVsbCgpKSB7XG4gICAgICBjdXJyRWxlbWVudCA9IGN1cnJFbGVtZW50LnBhcmVudDtcbiAgICAgIHJlc3VsdCA9IGN1cnJFbGVtZW50Ll9nZXRMb2NhbERlcGVuZGVuY3koUHJvdmlkZXJBc3RUeXBlLlB1YmxpY1NlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEoe3Rva2VuOiBkZXAudG9rZW59KSk7XG4gICAgfVxuXG4gICAgaWYgKGlzQmxhbmsocmVzdWx0KSkge1xuICAgICAgcmVzdWx0ID0gaW5qZWN0RnJvbVZpZXdQYXJlbnRJbmplY3RvcihkZXAudG9rZW4sIGRlcC5pc09wdGlvbmFsKTtcbiAgICB9XG4gICAgaWYgKGlzQmxhbmsocmVzdWx0KSkge1xuICAgICAgcmVzdWx0ID0gby5OVUxMX0VYUFI7XG4gICAgfVxuICAgIHJldHVybiBnZXRQcm9wZXJ0eUluVmlldyhyZXN1bHQsIHRoaXMudmlldywgY3VyckVsZW1lbnQudmlldyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlSW5qZWN0SW50ZXJuYWxDb25kaXRpb24obm9kZUluZGV4OiBudW1iZXIsIGNoaWxkTm9kZUNvdW50OiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcjogUHJvdmlkZXJBc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlckV4cHI6IG8uRXhwcmVzc2lvbik6IG8uU3RhdGVtZW50IHtcbiAgdmFyIGluZGV4Q29uZGl0aW9uO1xuICBpZiAoY2hpbGROb2RlQ291bnQgPiAwKSB7XG4gICAgaW5kZXhDb25kaXRpb24gPSBvLmxpdGVyYWwobm9kZUluZGV4KVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5sb3dlckVxdWFscyhJbmplY3RNZXRob2RWYXJzLnJlcXVlc3ROb2RlSW5kZXgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmFuZChJbmplY3RNZXRob2RWYXJzLnJlcXVlc3ROb2RlSW5kZXgubG93ZXJFcXVhbHMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbChub2RlSW5kZXggKyBjaGlsZE5vZGVDb3VudCkpKTtcbiAgfSBlbHNlIHtcbiAgICBpbmRleENvbmRpdGlvbiA9IG8ubGl0ZXJhbChub2RlSW5kZXgpLmlkZW50aWNhbChJbmplY3RNZXRob2RWYXJzLnJlcXVlc3ROb2RlSW5kZXgpO1xuICB9XG4gIHJldHVybiBuZXcgby5JZlN0bXQoXG4gICAgICBJbmplY3RNZXRob2RWYXJzLnRva2VuLmlkZW50aWNhbChjcmVhdGVEaVRva2VuRXhwcmVzc2lvbihwcm92aWRlci50b2tlbikpLmFuZChpbmRleENvbmRpdGlvbiksXG4gICAgICBbbmV3IG8uUmV0dXJuU3RhdGVtZW50KHByb3ZpZGVyRXhwcildKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUHJvdmlkZXJQcm9wZXJ0eShwcm9wTmFtZTogc3RyaW5nLCBwcm92aWRlcjogUHJvdmlkZXJBc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyVmFsdWVFeHByZXNzaW9uczogby5FeHByZXNzaW9uW10sIGlzTXVsdGk6IGJvb2xlYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRWFnZXI6IGJvb2xlYW4sIGNvbXBpbGVFbGVtZW50OiBDb21waWxlRWxlbWVudCk6IG8uRXhwcmVzc2lvbiB7XG4gIHZhciB2aWV3ID0gY29tcGlsZUVsZW1lbnQudmlldztcbiAgdmFyIHJlc29sdmVkUHJvdmlkZXJWYWx1ZUV4cHI7XG4gIHZhciB0eXBlO1xuICBpZiAoaXNNdWx0aSkge1xuICAgIHJlc29sdmVkUHJvdmlkZXJWYWx1ZUV4cHIgPSBvLmxpdGVyYWxBcnIocHJvdmlkZXJWYWx1ZUV4cHJlc3Npb25zKTtcbiAgICB0eXBlID0gbmV3IG8uQXJyYXlUeXBlKG8uRFlOQU1JQ19UWVBFKTtcbiAgfSBlbHNlIHtcbiAgICByZXNvbHZlZFByb3ZpZGVyVmFsdWVFeHByID0gcHJvdmlkZXJWYWx1ZUV4cHJlc3Npb25zWzBdO1xuICAgIHR5cGUgPSBwcm92aWRlclZhbHVlRXhwcmVzc2lvbnNbMF0udHlwZTtcbiAgfVxuICBpZiAoaXNCbGFuayh0eXBlKSkge1xuICAgIHR5cGUgPSBvLkRZTkFNSUNfVFlQRTtcbiAgfVxuICBpZiAoaXNFYWdlcikge1xuICAgIHZpZXcuZmllbGRzLnB1c2gobmV3IG8uQ2xhc3NGaWVsZChwcm9wTmFtZSwgdHlwZSwgW28uU3RtdE1vZGlmaWVyLlByaXZhdGVdKSk7XG4gICAgdmlldy5jcmVhdGVNZXRob2QuYWRkU3RtdChvLlRISVNfRVhQUi5wcm9wKHByb3BOYW1lKS5zZXQocmVzb2x2ZWRQcm92aWRlclZhbHVlRXhwcikudG9TdG10KCkpO1xuICB9IGVsc2Uge1xuICAgIHZhciBpbnRlcm5hbEZpZWxkID0gYF8ke3Byb3BOYW1lfWA7XG4gICAgdmlldy5maWVsZHMucHVzaChuZXcgby5DbGFzc0ZpZWxkKGludGVybmFsRmllbGQsIHR5cGUsIFtvLlN0bXRNb2RpZmllci5Qcml2YXRlXSkpO1xuICAgIHZhciBnZXR0ZXIgPSBuZXcgQ29tcGlsZU1ldGhvZCh2aWV3KTtcbiAgICBnZXR0ZXIucmVzZXREZWJ1Z0luZm8oY29tcGlsZUVsZW1lbnQubm9kZUluZGV4LCBjb21waWxlRWxlbWVudC5zb3VyY2VBc3QpO1xuICAgIC8vIE5vdGU6IEVxdWFscyBpcyBpbXBvcnRhbnQgZm9yIEpTIHNvIHRoYXQgaXQgYWxzbyBjaGVja3MgdGhlIHVuZGVmaW5lZCBjYXNlIVxuICAgIGdldHRlci5hZGRTdG10KFxuICAgICAgICBuZXcgby5JZlN0bXQoby5USElTX0VYUFIucHJvcChpbnRlcm5hbEZpZWxkKS5pc0JsYW5rKCksXG4gICAgICAgICAgICAgICAgICAgICBbby5USElTX0VYUFIucHJvcChpbnRlcm5hbEZpZWxkKS5zZXQocmVzb2x2ZWRQcm92aWRlclZhbHVlRXhwcikudG9TdG10KCldKSk7XG4gICAgZ2V0dGVyLmFkZFN0bXQobmV3IG8uUmV0dXJuU3RhdGVtZW50KG8uVEhJU19FWFBSLnByb3AoaW50ZXJuYWxGaWVsZCkpKTtcbiAgICB2aWV3LmdldHRlcnMucHVzaChuZXcgby5DbGFzc0dldHRlcihwcm9wTmFtZSwgZ2V0dGVyLmZpbmlzaCgpLCB0eXBlKSk7XG4gIH1cbiAgcmV0dXJuIG8uVEhJU19FWFBSLnByb3AocHJvcE5hbWUpO1xufVxuXG5jbGFzcyBfUXVlcnlXaXRoUmVhZCB7XG4gIHB1YmxpYyByZWFkOiBDb21waWxlVG9rZW5NZXRhZGF0YTtcbiAgY29uc3RydWN0b3IocHVibGljIHF1ZXJ5OiBDb21waWxlUXVlcnksIG1hdGNoOiBDb21waWxlVG9rZW5NZXRhZGF0YSkge1xuICAgIHRoaXMucmVhZCA9IGlzUHJlc2VudChxdWVyeS5tZXRhLnJlYWQpID8gcXVlcnkubWV0YS5yZWFkIDogbWF0Y2g7XG4gIH1cbn1cbiJdfQ==