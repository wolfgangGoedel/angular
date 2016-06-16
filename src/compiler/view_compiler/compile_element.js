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
    function CompileElement(parent, view, nodeIndex, renderNode, sourceAst, component, _directives, _resolvedProvidersArray, hasViewContainer, hasEmbeddedView, variableTokens) {
        _super.call(this, parent, view, nodeIndex, renderNode, sourceAst);
        this.component = component;
        this._directives = _directives;
        this._resolvedProvidersArray = _resolvedProvidersArray;
        this.hasViewContainer = hasViewContainer;
        this.hasEmbeddedView = hasEmbeddedView;
        this.variableTokens = variableTokens;
        this._compViewExpr = null;
        this._instances = new compile_metadata_1.CompileTokenMap();
        this._queryCount = 0;
        this._queries = new compile_metadata_1.CompileTokenMap();
        this._componentConstructorViewQueryLists = [];
        this.contentNodesByNgContentIndex = null;
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
        return new CompileElement(null, null, null, null, null, null, [], [], false, false, {});
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
        collection_1.StringMapWrapper.forEach(this.variableTokens, function (_, varName) {
            var token = _this.variableTokens[varName];
            var varValue;
            if (lang_1.isPresent(token)) {
                varValue = _this._instances.get(token);
            }
            else {
                varValue = _this.renderNode;
            }
            _this.view.variables.set(varName, varValue);
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
                // query for a variable
                var token = _this.variableTokens[queryWithRead.read.value];
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
    CompileElement.prototype.getDeclaredVariablesNames = function () {
        var res = [];
        collection_1.StringMapWrapper.forEach(this.variableTokens, function (_, key) { res.push(key); });
        return res;
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
var _QueryWithRead = (function () {
    function _QueryWithRead(query, match) {
        this.query = query;
        this.read = lang_1.isPresent(query.meta.read) ? query.meta.read : match;
    }
    return _QueryWithRead;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZV9lbGVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1hN1cxU1RkcC50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3ZpZXdfY29tcGlsZXIvY29tcGlsZV9lbGVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQVksQ0FBQyxXQUFNLHNCQUFzQixDQUFDLENBQUE7QUFDMUMsNEJBQTJDLGdCQUFnQixDQUFDLENBQUE7QUFDNUQsMEJBQStCLGFBQWEsQ0FBQyxDQUFBO0FBRTdDLHFCQUFpQywwQkFBMEIsQ0FBQyxDQUFBO0FBQzVELDJCQUE0QyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdFLDZCQUF3RCxpQkFBaUIsQ0FBQyxDQUFBO0FBQzFFLGlDQVNPLHFCQUFxQixDQUFDLENBQUE7QUFDN0IscUJBS08sUUFBUSxDQUFDLENBQUE7QUFDaEIsOEJBQWdFLGlCQUFpQixDQUFDLENBQUE7QUFDbEYsK0JBQTRCLGtCQUFrQixDQUFDLENBQUE7QUFFL0M7SUFDRSxxQkFBbUIsTUFBc0IsRUFBUyxJQUFpQixFQUFTLFNBQWlCLEVBQzFFLFVBQXdCLEVBQVMsU0FBc0I7UUFEdkQsV0FBTSxHQUFOLE1BQU0sQ0FBZ0I7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFhO1FBQVMsY0FBUyxHQUFULFNBQVMsQ0FBUTtRQUMxRSxlQUFVLEdBQVYsVUFBVSxDQUFjO1FBQVMsY0FBUyxHQUFULFNBQVMsQ0FBYTtJQUFHLENBQUM7SUFFOUUsNEJBQU0sR0FBTixjQUFvQixNQUFNLENBQUMsY0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFdEQsbUNBQWEsR0FBYixjQUEyQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEUsa0JBQUM7QUFBRCxD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Q0FBQztJQUNILHFCQUFDO0FBQUQsQ0FBQyxBQUxELElBS0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBvIGZyb20gJy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7SWRlbnRpZmllcnMsIGlkZW50aWZpZXJUb2tlbn0gZnJvbSAnLi4vaWRlbnRpZmllcnMnO1xuaW1wb3J0IHtJbmplY3RNZXRob2RWYXJzfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge0NvbXBpbGVWaWV3fSBmcm9tICcuL2NvbXBpbGVfdmlldyc7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1RlbXBsYXRlQXN0LCBQcm92aWRlckFzdCwgUHJvdmlkZXJBc3RUeXBlfSBmcm9tICcuLi90ZW1wbGF0ZV9hc3QnO1xuaW1wb3J0IHtcbiAgQ29tcGlsZVRva2VuTWFwLFxuICBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsXG4gIENvbXBpbGVUb2tlbk1ldGFkYXRhLFxuICBDb21waWxlUXVlcnlNZXRhZGF0YSxcbiAgQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEsXG4gIENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSxcbiAgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSxcbiAgQ29tcGlsZVR5cGVNZXRhZGF0YVxufSBmcm9tICcuLi9jb21waWxlX21ldGFkYXRhJztcbmltcG9ydCB7XG4gIGdldFByb3BlcnR5SW5WaWV3LFxuICBjcmVhdGVEaVRva2VuRXhwcmVzc2lvbixcbiAgaW5qZWN0RnJvbVZpZXdQYXJlbnRJbmplY3RvcixcbiAgY29udmVydFZhbHVlVG9PdXRwdXRBc3Rcbn0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7Q29tcGlsZVF1ZXJ5LCBjcmVhdGVRdWVyeUxpc3QsIGFkZFF1ZXJ5VG9Ub2tlbk1hcH0gZnJvbSAnLi9jb21waWxlX3F1ZXJ5JztcbmltcG9ydCB7Q29tcGlsZU1ldGhvZH0gZnJvbSAnLi9jb21waWxlX21ldGhvZCc7XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlTm9kZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwYXJlbnQ6IENvbXBpbGVFbGVtZW50LCBwdWJsaWMgdmlldzogQ29tcGlsZVZpZXcsIHB1YmxpYyBub2RlSW5kZXg6IG51bWJlcixcbiAgICAgICAgICAgICAgcHVibGljIHJlbmRlck5vZGU6IG8uRXhwcmVzc2lvbiwgcHVibGljIHNvdXJjZUFzdDogVGVtcGxhdGVBc3QpIHt9XG5cbiAgaXNOdWxsKCk6IGJvb2xlYW4geyByZXR1cm4gaXNCbGFuayh0aGlzLnJlbmRlck5vZGUpOyB9XG5cbiAgaXNSb290RWxlbWVudCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMudmlldyAhPSB0aGlzLnBhcmVudC52aWV3OyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlRWxlbWVudCBleHRlbmRzIENvbXBpbGVOb2RlIHtcbiAgc3RhdGljIGNyZWF0ZU51bGwoKTogQ29tcGlsZUVsZW1lbnQge1xuICAgIHJldHVybiBuZXcgQ29tcGlsZUVsZW1lbnQobnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgW10sIFtdLCBmYWxzZSwgZmFsc2UsIHt9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbXBWaWV3RXhwcjogby5FeHByZXNzaW9uID0gbnVsbDtcbiAgcHVibGljIGFwcEVsZW1lbnQ6IG8uUmVhZFByb3BFeHByO1xuICBwdWJsaWMgZWxlbWVudFJlZjogby5FeHByZXNzaW9uO1xuICBwdWJsaWMgaW5qZWN0b3I6IG8uRXhwcmVzc2lvbjtcbiAgcHJpdmF0ZSBfaW5zdGFuY2VzID0gbmV3IENvbXBpbGVUb2tlbk1hcDxvLkV4cHJlc3Npb24+KCk7XG4gIHByaXZhdGUgX3Jlc29sdmVkUHJvdmlkZXJzOiBDb21waWxlVG9rZW5NYXA8UHJvdmlkZXJBc3Q+O1xuXG4gIHByaXZhdGUgX3F1ZXJ5Q291bnQgPSAwO1xuICBwcml2YXRlIF9xdWVyaWVzID0gbmV3IENvbXBpbGVUb2tlbk1hcDxDb21waWxlUXVlcnlbXT4oKTtcbiAgcHJpdmF0ZSBfY29tcG9uZW50Q29uc3RydWN0b3JWaWV3UXVlcnlMaXN0czogby5FeHByZXNzaW9uW10gPSBbXTtcblxuICBwdWJsaWMgY29udGVudE5vZGVzQnlOZ0NvbnRlbnRJbmRleDogQXJyYXk8by5FeHByZXNzaW9uPltdID0gbnVsbDtcbiAgcHVibGljIGVtYmVkZGVkVmlldzogQ29tcGlsZVZpZXc7XG4gIHB1YmxpYyBkaXJlY3RpdmVJbnN0YW5jZXM6IG8uRXhwcmVzc2lvbltdO1xuXG4gIGNvbnN0cnVjdG9yKHBhcmVudDogQ29tcGlsZUVsZW1lbnQsIHZpZXc6IENvbXBpbGVWaWV3LCBub2RlSW5kZXg6IG51bWJlcixcbiAgICAgICAgICAgICAgcmVuZGVyTm9kZTogby5FeHByZXNzaW9uLCBzb3VyY2VBc3Q6IFRlbXBsYXRlQXN0LFxuICAgICAgICAgICAgICBwdWJsaWMgY29tcG9uZW50OiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsXG4gICAgICAgICAgICAgIHByaXZhdGUgX2RpcmVjdGl2ZXM6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YVtdLFxuICAgICAgICAgICAgICBwcml2YXRlIF9yZXNvbHZlZFByb3ZpZGVyc0FycmF5OiBQcm92aWRlckFzdFtdLCBwdWJsaWMgaGFzVmlld0NvbnRhaW5lcjogYm9vbGVhbixcbiAgICAgICAgICAgICAgcHVibGljIGhhc0VtYmVkZGVkVmlldzogYm9vbGVhbixcbiAgICAgICAgICAgICAgcHVibGljIHZhcmlhYmxlVG9rZW5zOiB7W2tleTogc3RyaW5nXTogQ29tcGlsZVRva2VuTWV0YWRhdGF9KSB7XG4gICAgc3VwZXIocGFyZW50LCB2aWV3LCBub2RlSW5kZXgsIHJlbmRlck5vZGUsIHNvdXJjZUFzdCk7XG4gICAgdGhpcy5lbGVtZW50UmVmID0gby5pbXBvcnRFeHByKElkZW50aWZpZXJzLkVsZW1lbnRSZWYpLmluc3RhbnRpYXRlKFt0aGlzLnJlbmRlck5vZGVdKTtcbiAgICB0aGlzLl9pbnN0YW5jZXMuYWRkKGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5FbGVtZW50UmVmKSwgdGhpcy5lbGVtZW50UmVmKTtcbiAgICB0aGlzLmluamVjdG9yID0gby5USElTX0VYUFIuY2FsbE1ldGhvZCgnaW5qZWN0b3InLCBbby5saXRlcmFsKHRoaXMubm9kZUluZGV4KV0pO1xuICAgIHRoaXMuX2luc3RhbmNlcy5hZGQoaWRlbnRpZmllclRva2VuKElkZW50aWZpZXJzLkluamVjdG9yKSwgdGhpcy5pbmplY3Rvcik7XG4gICAgdGhpcy5faW5zdGFuY2VzLmFkZChpZGVudGlmaWVyVG9rZW4oSWRlbnRpZmllcnMuUmVuZGVyZXIpLCBvLlRISVNfRVhQUi5wcm9wKCdyZW5kZXJlcicpKTtcbiAgICBpZiAodGhpcy5oYXNWaWV3Q29udGFpbmVyIHx8IHRoaXMuaGFzRW1iZWRkZWRWaWV3IHx8IGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkpIHtcbiAgICAgIHRoaXMuX2NyZWF0ZUFwcEVsZW1lbnQoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVBcHBFbGVtZW50KCkge1xuICAgIHZhciBmaWVsZE5hbWUgPSBgX2FwcEVsXyR7dGhpcy5ub2RlSW5kZXh9YDtcbiAgICB2YXIgcGFyZW50Tm9kZUluZGV4ID0gdGhpcy5pc1Jvb3RFbGVtZW50KCkgPyBudWxsIDogdGhpcy5wYXJlbnQubm9kZUluZGV4O1xuICAgIHRoaXMudmlldy5maWVsZHMucHVzaChuZXcgby5DbGFzc0ZpZWxkKGZpZWxkTmFtZSwgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLkFwcEVsZW1lbnQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtvLlN0bXRNb2RpZmllci5Qcml2YXRlXSkpO1xuICAgIHZhciBzdGF0ZW1lbnQgPSBvLlRISVNfRVhQUi5wcm9wKGZpZWxkTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZXQoby5pbXBvcnRFeHByKElkZW50aWZpZXJzLkFwcEVsZW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaW5zdGFudGlhdGUoW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWwodGhpcy5ub2RlSW5kZXgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWwocGFyZW50Tm9kZUluZGV4KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5USElTX0VYUFIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyTm9kZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAudG9TdG10KCk7XG4gICAgdGhpcy52aWV3LmNyZWF0ZU1ldGhvZC5hZGRTdG10KHN0YXRlbWVudCk7XG4gICAgdGhpcy5hcHBFbGVtZW50ID0gby5USElTX0VYUFIucHJvcChmaWVsZE5hbWUpO1xuICAgIHRoaXMuX2luc3RhbmNlcy5hZGQoaWRlbnRpZmllclRva2VuKElkZW50aWZpZXJzLkFwcEVsZW1lbnQpLCB0aGlzLmFwcEVsZW1lbnQpO1xuICB9XG5cbiAgc2V0Q29tcG9uZW50Vmlldyhjb21wVmlld0V4cHI6IG8uRXhwcmVzc2lvbikge1xuICAgIHRoaXMuX2NvbXBWaWV3RXhwciA9IGNvbXBWaWV3RXhwcjtcbiAgICB0aGlzLmNvbnRlbnROb2Rlc0J5TmdDb250ZW50SW5kZXggPVxuICAgICAgICBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUodGhpcy5jb21wb25lbnQudGVtcGxhdGUubmdDb250ZW50U2VsZWN0b3JzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRlbnROb2Rlc0J5TmdDb250ZW50SW5kZXgubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuY29udGVudE5vZGVzQnlOZ0NvbnRlbnRJbmRleFtpXSA9IFtdO1xuICAgIH1cbiAgfVxuXG4gIHNldEVtYmVkZGVkVmlldyhlbWJlZGRlZFZpZXc6IENvbXBpbGVWaWV3KSB7XG4gICAgdGhpcy5lbWJlZGRlZFZpZXcgPSBlbWJlZGRlZFZpZXc7XG4gICAgaWYgKGlzUHJlc2VudChlbWJlZGRlZFZpZXcpKSB7XG4gICAgICB2YXIgY3JlYXRlVGVtcGxhdGVSZWZFeHByID1cbiAgICAgICAgICBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuVGVtcGxhdGVSZWZfKVxuICAgICAgICAgICAgICAuaW5zdGFudGlhdGUoW3RoaXMuYXBwRWxlbWVudCwgdGhpcy5lbWJlZGRlZFZpZXcudmlld0ZhY3RvcnldKTtcbiAgICAgIHZhciBwcm92aWRlciA9IG5ldyBDb21waWxlUHJvdmlkZXJNZXRhZGF0YShcbiAgICAgICAgICB7dG9rZW46IGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5UZW1wbGF0ZVJlZiksIHVzZVZhbHVlOiBjcmVhdGVUZW1wbGF0ZVJlZkV4cHJ9KTtcbiAgICAgIC8vIEFkZCBUZW1wbGF0ZVJlZiBhcyBmaXJzdCBwcm92aWRlciBhcyBpdCBkb2VzIG5vdCBoYXZlIGRlcHMgb24gb3RoZXIgcHJvdmlkZXJzXG4gICAgICB0aGlzLl9yZXNvbHZlZFByb3ZpZGVyc0FycmF5LnVuc2hpZnQobmV3IFByb3ZpZGVyQXN0KHByb3ZpZGVyLnRva2VuLCBmYWxzZSwgdHJ1ZSwgW3Byb3ZpZGVyXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUHJvdmlkZXJBc3RUeXBlLkJ1aWx0aW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc291cmNlQXN0LnNvdXJjZVNwYW4pKTtcbiAgICB9XG4gIH1cblxuICBiZWZvcmVDaGlsZHJlbigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYXNWaWV3Q29udGFpbmVyKSB7XG4gICAgICB0aGlzLl9pbnN0YW5jZXMuYWRkKGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5WaWV3Q29udGFpbmVyUmVmKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LnByb3AoJ3ZjUmVmJykpO1xuICAgIH1cblxuICAgIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzID0gbmV3IENvbXBpbGVUb2tlbk1hcDxQcm92aWRlckFzdD4oKTtcbiAgICB0aGlzLl9yZXNvbHZlZFByb3ZpZGVyc0FycmF5LmZvckVhY2gocHJvdmlkZXIgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzLmFkZChwcm92aWRlci50b2tlbiwgcHJvdmlkZXIpKTtcblxuICAgIC8vIGNyZWF0ZSBhbGwgdGhlIHByb3ZpZGVyIGluc3RhbmNlcywgc29tZSBpbiB0aGUgdmlldyBjb25zdHJ1Y3RvcixcbiAgICAvLyBzb21lIGFzIGdldHRlcnMuIFdlIHJlbHkgb24gdGhlIGZhY3QgdGhhdCB0aGV5IGFyZSBhbHJlYWR5IHNvcnRlZCB0b3BvbG9naWNhbGx5LlxuICAgIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzLnZhbHVlcygpLmZvckVhY2goKHJlc29sdmVkUHJvdmlkZXIpID0+IHtcbiAgICAgIHZhciBwcm92aWRlclZhbHVlRXhwcmVzc2lvbnMgPSByZXNvbHZlZFByb3ZpZGVyLnByb3ZpZGVycy5tYXAoKHByb3ZpZGVyKSA9PiB7XG4gICAgICAgIHZhciBwcm92aWRlclZhbHVlOiBvLkV4cHJlc3Npb247XG4gICAgICAgIGlmIChpc1ByZXNlbnQocHJvdmlkZXIudXNlRXhpc3RpbmcpKSB7XG4gICAgICAgICAgcHJvdmlkZXJWYWx1ZSA9XG4gICAgICAgICAgICAgIHRoaXMuX2dldERlcGVuZGVuY3kocmVzb2x2ZWRQcm92aWRlci5wcm92aWRlclR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSh7dG9rZW46IHByb3ZpZGVyLnVzZUV4aXN0aW5nfSkpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VGYWN0b3J5KSkge1xuICAgICAgICAgIHZhciBkZXBzID0gaXNQcmVzZW50KHByb3ZpZGVyLmRlcHMpID8gcHJvdmlkZXIuZGVwcyA6IHByb3ZpZGVyLnVzZUZhY3RvcnkuZGlEZXBzO1xuICAgICAgICAgIHZhciBkZXBzRXhwciA9IGRlcHMubWFwKChkZXApID0+IHRoaXMuX2dldERlcGVuZGVuY3kocmVzb2x2ZWRQcm92aWRlci5wcm92aWRlclR5cGUsIGRlcCkpO1xuICAgICAgICAgIHByb3ZpZGVyVmFsdWUgPSBvLmltcG9ydEV4cHIocHJvdmlkZXIudXNlRmFjdG9yeSkuY2FsbEZuKGRlcHNFeHByKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQocHJvdmlkZXIudXNlQ2xhc3MpKSB7XG4gICAgICAgICAgdmFyIGRlcHMgPSBpc1ByZXNlbnQocHJvdmlkZXIuZGVwcykgPyBwcm92aWRlci5kZXBzIDogcHJvdmlkZXIudXNlQ2xhc3MuZGlEZXBzO1xuICAgICAgICAgIHZhciBkZXBzRXhwciA9IGRlcHMubWFwKChkZXApID0+IHRoaXMuX2dldERlcGVuZGVuY3kocmVzb2x2ZWRQcm92aWRlci5wcm92aWRlclR5cGUsIGRlcCkpO1xuICAgICAgICAgIHByb3ZpZGVyVmFsdWUgPSBvLmltcG9ydEV4cHIocHJvdmlkZXIudXNlQ2xhc3MpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaW5zdGFudGlhdGUoZGVwc0V4cHIsIG8uaW1wb3J0VHlwZShwcm92aWRlci51c2VDbGFzcykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByb3ZpZGVyVmFsdWUgPSBjb252ZXJ0VmFsdWVUb091dHB1dEFzdChwcm92aWRlci51c2VWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VQcm9wZXJ0eSkpIHtcbiAgICAgICAgICBwcm92aWRlclZhbHVlID0gcHJvdmlkZXJWYWx1ZS5wcm9wKHByb3ZpZGVyLnVzZVByb3BlcnR5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvdmlkZXJWYWx1ZTtcbiAgICAgIH0pO1xuICAgICAgdmFyIHByb3BOYW1lID0gYF8ke3Jlc29sdmVkUHJvdmlkZXIudG9rZW4ubmFtZX1fJHt0aGlzLm5vZGVJbmRleH1fJHt0aGlzLl9pbnN0YW5jZXMuc2l6ZX1gO1xuICAgICAgdmFyIGluc3RhbmNlID1cbiAgICAgICAgICBjcmVhdGVQcm92aWRlclByb3BlcnR5KHByb3BOYW1lLCByZXNvbHZlZFByb3ZpZGVyLCBwcm92aWRlclZhbHVlRXhwcmVzc2lvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlZFByb3ZpZGVyLm11bHRpUHJvdmlkZXIsIHJlc29sdmVkUHJvdmlkZXIuZWFnZXIsIHRoaXMpO1xuICAgICAgdGhpcy5faW5zdGFuY2VzLmFkZChyZXNvbHZlZFByb3ZpZGVyLnRva2VuLCBpbnN0YW5jZSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmRpcmVjdGl2ZUluc3RhbmNlcyA9XG4gICAgICAgIHRoaXMuX2RpcmVjdGl2ZXMubWFwKChkaXJlY3RpdmUpID0+IHRoaXMuX2luc3RhbmNlcy5nZXQoaWRlbnRpZmllclRva2VuKGRpcmVjdGl2ZS50eXBlKSkpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kaXJlY3RpdmVJbnN0YW5jZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkaXJlY3RpdmVJbnN0YW5jZSA9IHRoaXMuZGlyZWN0aXZlSW5zdGFuY2VzW2ldO1xuICAgICAgdmFyIGRpcmVjdGl2ZSA9IHRoaXMuX2RpcmVjdGl2ZXNbaV07XG4gICAgICBkaXJlY3RpdmUucXVlcmllcy5mb3JFYWNoKChxdWVyeU1ldGEpID0+IHsgdGhpcy5fYWRkUXVlcnkocXVlcnlNZXRhLCBkaXJlY3RpdmVJbnN0YW5jZSk7IH0pO1xuICAgIH1cbiAgICB2YXIgcXVlcmllc1dpdGhSZWFkczogX1F1ZXJ5V2l0aFJlYWRbXSA9IFtdO1xuICAgIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzLnZhbHVlcygpLmZvckVhY2goKHJlc29sdmVkUHJvdmlkZXIpID0+IHtcbiAgICAgIHZhciBxdWVyaWVzRm9yUHJvdmlkZXIgPSB0aGlzLl9nZXRRdWVyaWVzRm9yKHJlc29sdmVkUHJvdmlkZXIudG9rZW4pO1xuICAgICAgTGlzdFdyYXBwZXIuYWRkQWxsKFxuICAgICAgICAgIHF1ZXJpZXNXaXRoUmVhZHMsXG4gICAgICAgICAgcXVlcmllc0ZvclByb3ZpZGVyLm1hcChxdWVyeSA9PiBuZXcgX1F1ZXJ5V2l0aFJlYWQocXVlcnksIHJlc29sdmVkUHJvdmlkZXIudG9rZW4pKSk7XG4gICAgfSk7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKHRoaXMudmFyaWFibGVUb2tlbnMsIChfLCB2YXJOYW1lKSA9PiB7XG4gICAgICB2YXIgdG9rZW4gPSB0aGlzLnZhcmlhYmxlVG9rZW5zW3Zhck5hbWVdO1xuICAgICAgdmFyIHZhclZhbHVlO1xuICAgICAgaWYgKGlzUHJlc2VudCh0b2tlbikpIHtcbiAgICAgICAgdmFyVmFsdWUgPSB0aGlzLl9pbnN0YW5jZXMuZ2V0KHRva2VuKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhclZhbHVlID0gdGhpcy5yZW5kZXJOb2RlO1xuICAgICAgfVxuICAgICAgdGhpcy52aWV3LnZhcmlhYmxlcy5zZXQodmFyTmFtZSwgdmFyVmFsdWUpO1xuICAgICAgdmFyIHZhclRva2VuID0gbmV3IENvbXBpbGVUb2tlbk1ldGFkYXRhKHt2YWx1ZTogdmFyTmFtZX0pO1xuICAgICAgTGlzdFdyYXBwZXIuYWRkQWxsKHF1ZXJpZXNXaXRoUmVhZHMsIHRoaXMuX2dldFF1ZXJpZXNGb3IodmFyVG9rZW4pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAocXVlcnkgPT4gbmV3IF9RdWVyeVdpdGhSZWFkKHF1ZXJ5LCB2YXJUb2tlbikpKTtcbiAgICB9KTtcbiAgICBxdWVyaWVzV2l0aFJlYWRzLmZvckVhY2goKHF1ZXJ5V2l0aFJlYWQpID0+IHtcbiAgICAgIHZhciB2YWx1ZTogby5FeHByZXNzaW9uO1xuICAgICAgaWYgKGlzUHJlc2VudChxdWVyeVdpdGhSZWFkLnJlYWQuaWRlbnRpZmllcikpIHtcbiAgICAgICAgLy8gcXVlcnkgZm9yIGFuIGlkZW50aWZpZXJcbiAgICAgICAgdmFsdWUgPSB0aGlzLl9pbnN0YW5jZXMuZ2V0KHF1ZXJ5V2l0aFJlYWQucmVhZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBxdWVyeSBmb3IgYSB2YXJpYWJsZVxuICAgICAgICB2YXIgdG9rZW4gPSB0aGlzLnZhcmlhYmxlVG9rZW5zW3F1ZXJ5V2l0aFJlYWQucmVhZC52YWx1ZV07XG4gICAgICAgIGlmIChpc1ByZXNlbnQodG9rZW4pKSB7XG4gICAgICAgICAgdmFsdWUgPSB0aGlzLl9pbnN0YW5jZXMuZ2V0KHRva2VuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWx1ZSA9IHRoaXMuZWxlbWVudFJlZjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudCh2YWx1ZSkpIHtcbiAgICAgICAgcXVlcnlXaXRoUmVhZC5xdWVyeS5hZGRWYWx1ZSh2YWx1ZSwgdGhpcy52aWV3KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpKSB7XG4gICAgICB2YXIgY29tcG9uZW50Q29uc3RydWN0b3JWaWV3UXVlcnlMaXN0ID1cbiAgICAgICAgICBpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpID8gby5saXRlcmFsQXJyKHRoaXMuX2NvbXBvbmVudENvbnN0cnVjdG9yVmlld1F1ZXJ5TGlzdHMpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5OVUxMX0VYUFI7XG4gICAgICB2YXIgY29tcEV4cHIgPSBpc1ByZXNlbnQodGhpcy5nZXRDb21wb25lbnQoKSkgPyB0aGlzLmdldENvbXBvbmVudCgpIDogby5OVUxMX0VYUFI7XG4gICAgICB0aGlzLnZpZXcuY3JlYXRlTWV0aG9kLmFkZFN0bXQoXG4gICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmNhbGxNZXRob2QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpbml0Q29tcG9uZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2NvbXBFeHByLCBjb21wb25lbnRDb25zdHJ1Y3RvclZpZXdRdWVyeUxpc3QsIHRoaXMuX2NvbXBWaWV3RXhwcl0pXG4gICAgICAgICAgICAgIC50b1N0bXQoKSk7XG4gICAgfVxuICB9XG5cbiAgYWZ0ZXJDaGlsZHJlbihjaGlsZE5vZGVDb3VudDogbnVtYmVyKSB7XG4gICAgdGhpcy5fcmVzb2x2ZWRQcm92aWRlcnMudmFsdWVzKCkuZm9yRWFjaCgocmVzb2x2ZWRQcm92aWRlcikgPT4ge1xuICAgICAgLy8gTm90ZTogYWZ0ZXJDaGlsZHJlbiBpcyBjYWxsZWQgYWZ0ZXIgcmVjdXJzaW5nIGludG8gY2hpbGRyZW4uXG4gICAgICAvLyBUaGlzIGlzIGdvb2Qgc28gdGhhdCBhbiBpbmplY3RvciBtYXRjaCBpbiBhbiBlbGVtZW50IHRoYXQgaXMgY2xvc2VyIHRvIGEgcmVxdWVzdGluZyBlbGVtZW50XG4gICAgICAvLyBtYXRjaGVzIGZpcnN0LlxuICAgICAgdmFyIHByb3ZpZGVyRXhwciA9IHRoaXMuX2luc3RhbmNlcy5nZXQocmVzb2x2ZWRQcm92aWRlci50b2tlbik7XG4gICAgICAvLyBOb3RlOiB2aWV3IHByb3ZpZGVycyBhcmUgb25seSB2aXNpYmxlIG9uIHRoZSBpbmplY3RvciBvZiB0aGF0IGVsZW1lbnQuXG4gICAgICAvLyBUaGlzIGlzIG5vdCBmdWxseSBjb3JyZWN0IGFzIHRoZSBydWxlcyBkdXJpbmcgY29kZWdlbiBkb24ndCBhbGxvdyBhIGRpcmVjdGl2ZVxuICAgICAgLy8gdG8gZ2V0IGhvbGQgb2YgYSB2aWV3IHByb3ZkaWVyIG9uIHRoZSBzYW1lIGVsZW1lbnQuIFdlIHN0aWxsIGRvIHRoaXMgc2VtYW50aWNcbiAgICAgIC8vIGFzIGl0IHNpbXBsaWZpZXMgb3VyIG1vZGVsIHRvIGhhdmluZyBvbmx5IG9uZSBydW50aW1lIGluamVjdG9yIHBlciBlbGVtZW50LlxuICAgICAgdmFyIHByb3ZpZGVyQ2hpbGROb2RlQ291bnQgPVxuICAgICAgICAgIHJlc29sdmVkUHJvdmlkZXIucHJvdmlkZXJUeXBlID09PSBQcm92aWRlckFzdFR5cGUuUHJpdmF0ZVNlcnZpY2UgPyAwIDogY2hpbGROb2RlQ291bnQ7XG4gICAgICB0aGlzLnZpZXcuaW5qZWN0b3JHZXRNZXRob2QuYWRkU3RtdChjcmVhdGVJbmplY3RJbnRlcm5hbENvbmRpdGlvbihcbiAgICAgICAgICB0aGlzLm5vZGVJbmRleCwgcHJvdmlkZXJDaGlsZE5vZGVDb3VudCwgcmVzb2x2ZWRQcm92aWRlciwgcHJvdmlkZXJFeHByKSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9xdWVyaWVzLnZhbHVlcygpLmZvckVhY2goXG4gICAgICAgIChxdWVyaWVzKSA9PlxuICAgICAgICAgICAgcXVlcmllcy5mb3JFYWNoKChxdWVyeSkgPT4gcXVlcnkuYWZ0ZXJDaGlsZHJlbih0aGlzLnZpZXcuY3JlYXRlTWV0aG9kLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXcudXBkYXRlQ29udGVudFF1ZXJpZXNNZXRob2QpKSk7XG4gIH1cblxuICBhZGRDb250ZW50Tm9kZShuZ0NvbnRlbnRJbmRleDogbnVtYmVyLCBub2RlRXhwcjogby5FeHByZXNzaW9uKSB7XG4gICAgdGhpcy5jb250ZW50Tm9kZXNCeU5nQ29udGVudEluZGV4W25nQ29udGVudEluZGV4XS5wdXNoKG5vZGVFeHByKTtcbiAgfVxuXG4gIGdldENvbXBvbmVudCgpOiBvLkV4cHJlc3Npb24ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpID8gdGhpcy5faW5zdGFuY2VzLmdldChpZGVudGlmaWVyVG9rZW4odGhpcy5jb21wb25lbnQudHlwZSkpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGw7XG4gIH1cblxuICBnZXRQcm92aWRlclRva2VucygpOiBvLkV4cHJlc3Npb25bXSB7XG4gICAgcmV0dXJuIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzLnZhbHVlcygpLm1hcChcbiAgICAgICAgKHJlc29sdmVkUHJvdmlkZXIpID0+IGNyZWF0ZURpVG9rZW5FeHByZXNzaW9uKHJlc29sdmVkUHJvdmlkZXIudG9rZW4pKTtcbiAgfVxuXG4gIGdldERlY2xhcmVkVmFyaWFibGVzTmFtZXMoKTogc3RyaW5nW10ge1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2godGhpcy52YXJpYWJsZVRva2VucywgKF8sIGtleSkgPT4geyByZXMucHVzaChrZXkpOyB9KTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UXVlcmllc0Zvcih0b2tlbjogQ29tcGlsZVRva2VuTWV0YWRhdGEpOiBDb21waWxlUXVlcnlbXSB7XG4gICAgdmFyIHJlc3VsdDogQ29tcGlsZVF1ZXJ5W10gPSBbXTtcbiAgICB2YXIgY3VycmVudEVsOiBDb21waWxlRWxlbWVudCA9IHRoaXM7XG4gICAgdmFyIGRpc3RhbmNlID0gMDtcbiAgICB2YXIgcXVlcmllczogQ29tcGlsZVF1ZXJ5W107XG4gICAgd2hpbGUgKCFjdXJyZW50RWwuaXNOdWxsKCkpIHtcbiAgICAgIHF1ZXJpZXMgPSBjdXJyZW50RWwuX3F1ZXJpZXMuZ2V0KHRva2VuKTtcbiAgICAgIGlmIChpc1ByZXNlbnQocXVlcmllcykpIHtcbiAgICAgICAgTGlzdFdyYXBwZXIuYWRkQWxsKHJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJpZXMuZmlsdGVyKChxdWVyeSkgPT4gcXVlcnkubWV0YS5kZXNjZW5kYW50cyB8fCBkaXN0YW5jZSA8PSAxKSk7XG4gICAgICB9XG4gICAgICBpZiAoY3VycmVudEVsLl9kaXJlY3RpdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZGlzdGFuY2UrKztcbiAgICAgIH1cbiAgICAgIGN1cnJlbnRFbCA9IGN1cnJlbnRFbC5wYXJlbnQ7XG4gICAgfVxuICAgIHF1ZXJpZXMgPSB0aGlzLnZpZXcuY29tcG9uZW50Vmlldy52aWV3UXVlcmllcy5nZXQodG9rZW4pO1xuICAgIGlmIChpc1ByZXNlbnQocXVlcmllcykpIHtcbiAgICAgIExpc3RXcmFwcGVyLmFkZEFsbChyZXN1bHQsIHF1ZXJpZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBfYWRkUXVlcnkocXVlcnlNZXRhOiBDb21waWxlUXVlcnlNZXRhZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlSW5zdGFuY2U6IG8uRXhwcmVzc2lvbik6IENvbXBpbGVRdWVyeSB7XG4gICAgdmFyIHByb3BOYW1lID0gYF9xdWVyeV8ke3F1ZXJ5TWV0YS5zZWxlY3RvcnNbMF0ubmFtZX1fJHt0aGlzLm5vZGVJbmRleH1fJHt0aGlzLl9xdWVyeUNvdW50Kyt9YDtcbiAgICB2YXIgcXVlcnlMaXN0ID0gY3JlYXRlUXVlcnlMaXN0KHF1ZXJ5TWV0YSwgZGlyZWN0aXZlSW5zdGFuY2UsIHByb3BOYW1lLCB0aGlzLnZpZXcpO1xuICAgIHZhciBxdWVyeSA9IG5ldyBDb21waWxlUXVlcnkocXVlcnlNZXRhLCBxdWVyeUxpc3QsIGRpcmVjdGl2ZUluc3RhbmNlLCB0aGlzLnZpZXcpO1xuICAgIGFkZFF1ZXJ5VG9Ub2tlbk1hcCh0aGlzLl9xdWVyaWVzLCBxdWVyeSk7XG4gICAgcmV0dXJuIHF1ZXJ5O1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0TG9jYWxEZXBlbmRlbmN5KHJlcXVlc3RpbmdQcm92aWRlclR5cGU6IFByb3ZpZGVyQXN0VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcDogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhKTogby5FeHByZXNzaW9uIHtcbiAgICB2YXIgcmVzdWx0ID0gbnVsbDtcbiAgICAvLyBjb25zdHJ1Y3RvciBjb250ZW50IHF1ZXJ5XG4gICAgaWYgKGlzQmxhbmsocmVzdWx0KSAmJiBpc1ByZXNlbnQoZGVwLnF1ZXJ5KSkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5fYWRkUXVlcnkoZGVwLnF1ZXJ5LCBudWxsKS5xdWVyeUxpc3Q7XG4gICAgfVxuXG4gICAgLy8gY29uc3RydWN0b3IgdmlldyBxdWVyeVxuICAgIGlmIChpc0JsYW5rKHJlc3VsdCkgJiYgaXNQcmVzZW50KGRlcC52aWV3UXVlcnkpKSB7XG4gICAgICByZXN1bHQgPSBjcmVhdGVRdWVyeUxpc3QoXG4gICAgICAgICAgZGVwLnZpZXdRdWVyeSwgbnVsbCxcbiAgICAgICAgICBgX3ZpZXdRdWVyeV8ke2RlcC52aWV3UXVlcnkuc2VsZWN0b3JzWzBdLm5hbWV9XyR7dGhpcy5ub2RlSW5kZXh9XyR7dGhpcy5fY29tcG9uZW50Q29uc3RydWN0b3JWaWV3UXVlcnlMaXN0cy5sZW5ndGh9YCxcbiAgICAgICAgICB0aGlzLnZpZXcpO1xuICAgICAgdGhpcy5fY29tcG9uZW50Q29uc3RydWN0b3JWaWV3UXVlcnlMaXN0cy5wdXNoKHJlc3VsdCk7XG4gICAgfVxuXG4gICAgaWYgKGlzUHJlc2VudChkZXAudG9rZW4pKSB7XG4gICAgICAvLyBhY2Nlc3MgYnVpbHRpbnMgd2l0aCBzcGVjaWFsIHZpc2liaWxpdHlcbiAgICAgIGlmIChpc0JsYW5rKHJlc3VsdCkpIHtcbiAgICAgICAgaWYgKGRlcC50b2tlbi5lcXVhbHNUbyhpZGVudGlmaWVyVG9rZW4oSWRlbnRpZmllcnMuQ2hhbmdlRGV0ZWN0b3JSZWYpKSkge1xuICAgICAgICAgIGlmIChyZXF1ZXN0aW5nUHJvdmlkZXJUeXBlID09PSBQcm92aWRlckFzdFR5cGUuQ29tcG9uZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29tcFZpZXdFeHByLnByb3AoJ3JlZicpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gby5USElTX0VYUFIucHJvcCgncmVmJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBhY2Nlc3MgcmVndWxhciBwcm92aWRlcnMgb24gdGhlIGVsZW1lbnRcbiAgICAgIGlmIChpc0JsYW5rKHJlc3VsdCkpIHtcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5faW5zdGFuY2VzLmdldChkZXAudG9rZW4pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0RGVwZW5kZW5jeShyZXF1ZXN0aW5nUHJvdmlkZXJUeXBlOiBQcm92aWRlckFzdFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgZGVwOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEpOiBvLkV4cHJlc3Npb24ge1xuICAgIHZhciBjdXJyRWxlbWVudDogQ29tcGlsZUVsZW1lbnQgPSB0aGlzO1xuICAgIHZhciBjdXJyVmlldyA9IGN1cnJFbGVtZW50LnZpZXc7XG4gICAgdmFyIHJlc3VsdCA9IG51bGw7XG4gICAgaWYgKGRlcC5pc1ZhbHVlKSB7XG4gICAgICByZXN1bHQgPSBvLmxpdGVyYWwoZGVwLnZhbHVlKTtcbiAgICB9XG4gICAgaWYgKGlzQmxhbmsocmVzdWx0KSAmJiAhZGVwLmlzU2tpcFNlbGYpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX2dldExvY2FsRGVwZW5kZW5jeShyZXF1ZXN0aW5nUHJvdmlkZXJUeXBlLCBkZXApO1xuICAgIH1cbiAgICB2YXIgcmVzdWx0Vmlld1BhdGggPSBbXTtcbiAgICAvLyBjaGVjayBwYXJlbnQgZWxlbWVudHNcbiAgICB3aGlsZSAoaXNCbGFuayhyZXN1bHQpICYmICFjdXJyRWxlbWVudC5wYXJlbnQuaXNOdWxsKCkpIHtcbiAgICAgIGN1cnJFbGVtZW50ID0gY3VyckVsZW1lbnQucGFyZW50O1xuICAgICAgd2hpbGUgKGN1cnJFbGVtZW50LnZpZXcgIT09IGN1cnJWaWV3ICYmIGN1cnJWaWV3ICE9IG51bGwpIHtcbiAgICAgICAgY3VyclZpZXcgPSBjdXJyVmlldy5kZWNsYXJhdGlvbkVsZW1lbnQudmlldztcbiAgICAgICAgcmVzdWx0Vmlld1BhdGgucHVzaChjdXJyVmlldyk7XG4gICAgICB9XG4gICAgICByZXN1bHQgPSBjdXJyRWxlbWVudC5fZ2V0TG9jYWxEZXBlbmRlbmN5KFByb3ZpZGVyQXN0VHlwZS5QdWJsaWNTZXJ2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhKHt0b2tlbjogZGVwLnRva2VufSkpO1xuICAgIH1cblxuICAgIGlmIChpc0JsYW5rKHJlc3VsdCkpIHtcbiAgICAgIHJlc3VsdCA9IGluamVjdEZyb21WaWV3UGFyZW50SW5qZWN0b3IoZGVwLnRva2VuLCBkZXAuaXNPcHRpb25hbCk7XG4gICAgfVxuICAgIGlmIChpc0JsYW5rKHJlc3VsdCkpIHtcbiAgICAgIHJlc3VsdCA9IG8uTlVMTF9FWFBSO1xuICAgIH1cbiAgICByZXR1cm4gZ2V0UHJvcGVydHlJblZpZXcocmVzdWx0LCByZXN1bHRWaWV3UGF0aCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlSW5qZWN0SW50ZXJuYWxDb25kaXRpb24obm9kZUluZGV4OiBudW1iZXIsIGNoaWxkTm9kZUNvdW50OiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcjogUHJvdmlkZXJBc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlckV4cHI6IG8uRXhwcmVzc2lvbik6IG8uU3RhdGVtZW50IHtcbiAgdmFyIGluZGV4Q29uZGl0aW9uO1xuICBpZiAoY2hpbGROb2RlQ291bnQgPiAwKSB7XG4gICAgaW5kZXhDb25kaXRpb24gPSBvLmxpdGVyYWwobm9kZUluZGV4KVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5sb3dlckVxdWFscyhJbmplY3RNZXRob2RWYXJzLnJlcXVlc3ROb2RlSW5kZXgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmFuZChJbmplY3RNZXRob2RWYXJzLnJlcXVlc3ROb2RlSW5kZXgubG93ZXJFcXVhbHMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbChub2RlSW5kZXggKyBjaGlsZE5vZGVDb3VudCkpKTtcbiAgfSBlbHNlIHtcbiAgICBpbmRleENvbmRpdGlvbiA9IG8ubGl0ZXJhbChub2RlSW5kZXgpLmlkZW50aWNhbChJbmplY3RNZXRob2RWYXJzLnJlcXVlc3ROb2RlSW5kZXgpO1xuICB9XG4gIHJldHVybiBuZXcgby5JZlN0bXQoXG4gICAgICBJbmplY3RNZXRob2RWYXJzLnRva2VuLmlkZW50aWNhbChjcmVhdGVEaVRva2VuRXhwcmVzc2lvbihwcm92aWRlci50b2tlbikpLmFuZChpbmRleENvbmRpdGlvbiksXG4gICAgICBbbmV3IG8uUmV0dXJuU3RhdGVtZW50KHByb3ZpZGVyRXhwcildKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUHJvdmlkZXJQcm9wZXJ0eShwcm9wTmFtZTogc3RyaW5nLCBwcm92aWRlcjogUHJvdmlkZXJBc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyVmFsdWVFeHByZXNzaW9uczogby5FeHByZXNzaW9uW10sIGlzTXVsdGk6IGJvb2xlYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRWFnZXI6IGJvb2xlYW4sIGNvbXBpbGVFbGVtZW50OiBDb21waWxlRWxlbWVudCk6IG8uRXhwcmVzc2lvbiB7XG4gIHZhciB2aWV3ID0gY29tcGlsZUVsZW1lbnQudmlldztcbiAgdmFyIHJlc29sdmVkUHJvdmlkZXJWYWx1ZUV4cHI7XG4gIHZhciB0eXBlO1xuICBpZiAoaXNNdWx0aSkge1xuICAgIHJlc29sdmVkUHJvdmlkZXJWYWx1ZUV4cHIgPSBvLmxpdGVyYWxBcnIocHJvdmlkZXJWYWx1ZUV4cHJlc3Npb25zKTtcbiAgICB0eXBlID0gbmV3IG8uQXJyYXlUeXBlKG8uRFlOQU1JQ19UWVBFKTtcbiAgfSBlbHNlIHtcbiAgICByZXNvbHZlZFByb3ZpZGVyVmFsdWVFeHByID0gcHJvdmlkZXJWYWx1ZUV4cHJlc3Npb25zWzBdO1xuICAgIHR5cGUgPSBwcm92aWRlclZhbHVlRXhwcmVzc2lvbnNbMF0udHlwZTtcbiAgfVxuICBpZiAoaXNCbGFuayh0eXBlKSkge1xuICAgIHR5cGUgPSBvLkRZTkFNSUNfVFlQRTtcbiAgfVxuICBpZiAoaXNFYWdlcikge1xuICAgIHZpZXcuZmllbGRzLnB1c2gobmV3IG8uQ2xhc3NGaWVsZChwcm9wTmFtZSwgdHlwZSwgW28uU3RtdE1vZGlmaWVyLlByaXZhdGVdKSk7XG4gICAgdmlldy5jcmVhdGVNZXRob2QuYWRkU3RtdChvLlRISVNfRVhQUi5wcm9wKHByb3BOYW1lKS5zZXQocmVzb2x2ZWRQcm92aWRlclZhbHVlRXhwcikudG9TdG10KCkpO1xuICB9IGVsc2Uge1xuICAgIHZhciBpbnRlcm5hbEZpZWxkID0gYF8ke3Byb3BOYW1lfWA7XG4gICAgdmlldy5maWVsZHMucHVzaChuZXcgby5DbGFzc0ZpZWxkKGludGVybmFsRmllbGQsIHR5cGUsIFtvLlN0bXRNb2RpZmllci5Qcml2YXRlXSkpO1xuICAgIHZhciBnZXR0ZXIgPSBuZXcgQ29tcGlsZU1ldGhvZCh2aWV3KTtcbiAgICBnZXR0ZXIucmVzZXREZWJ1Z0luZm8oY29tcGlsZUVsZW1lbnQubm9kZUluZGV4LCBjb21waWxlRWxlbWVudC5zb3VyY2VBc3QpO1xuICAgIC8vIE5vdGU6IEVxdWFscyBpcyBpbXBvcnRhbnQgZm9yIEpTIHNvIHRoYXQgaXQgYWxzbyBjaGVja3MgdGhlIHVuZGVmaW5lZCBjYXNlIVxuICAgIGdldHRlci5hZGRTdG10KFxuICAgICAgICBuZXcgby5JZlN0bXQoby5USElTX0VYUFIucHJvcChpbnRlcm5hbEZpZWxkKS5pc0JsYW5rKCksXG4gICAgICAgICAgICAgICAgICAgICBbby5USElTX0VYUFIucHJvcChpbnRlcm5hbEZpZWxkKS5zZXQocmVzb2x2ZWRQcm92aWRlclZhbHVlRXhwcikudG9TdG10KCldKSk7XG4gICAgZ2V0dGVyLmFkZFN0bXQobmV3IG8uUmV0dXJuU3RhdGVtZW50KG8uVEhJU19FWFBSLnByb3AoaW50ZXJuYWxGaWVsZCkpKTtcbiAgICB2aWV3LmdldHRlcnMucHVzaChuZXcgby5DbGFzc0dldHRlcihwcm9wTmFtZSwgZ2V0dGVyLmZpbmlzaCgpLCB0eXBlKSk7XG4gIH1cbiAgcmV0dXJuIG8uVEhJU19FWFBSLnByb3AocHJvcE5hbWUpO1xufVxuXG5jbGFzcyBfUXVlcnlXaXRoUmVhZCB7XG4gIHB1YmxpYyByZWFkOiBDb21waWxlVG9rZW5NZXRhZGF0YTtcbiAgY29uc3RydWN0b3IocHVibGljIHF1ZXJ5OiBDb21waWxlUXVlcnksIG1hdGNoOiBDb21waWxlVG9rZW5NZXRhZGF0YSkge1xuICAgIHRoaXMucmVhZCA9IGlzUHJlc2VudChxdWVyeS5tZXRhLnJlYWQpID8gcXVlcnkubWV0YS5yZWFkIDogbWF0Y2g7XG4gIH1cbn1cbiJdfQ==