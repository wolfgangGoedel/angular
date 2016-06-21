'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var exceptions_1 = require('angular2/src/facade/exceptions');
var template_ast_1 = require('./template_ast');
var compile_metadata_1 = require('./compile_metadata');
var identifiers_1 = require('./identifiers');
var parse_util_1 = require('./parse_util');
var ProviderError = (function (_super) {
    __extends(ProviderError, _super);
    function ProviderError(message, span) {
        _super.call(this, span, message);
    }
    return ProviderError;
}(parse_util_1.ParseError));
exports.ProviderError = ProviderError;
var ProviderViewContext = (function () {
    function ProviderViewContext(component, sourceSpan) {
        var _this = this;
        this.component = component;
        this.sourceSpan = sourceSpan;
        this.errors = [];
        this.viewQueries = _getViewQueries(component);
        this.viewProviders = new compile_metadata_1.CompileTokenMap();
        _normalizeProviders(component.viewProviders, sourceSpan, this.errors)
            .forEach(function (provider) {
            if (lang_1.isBlank(_this.viewProviders.get(provider.token))) {
                _this.viewProviders.add(provider.token, true);
            }
        });
    }
    return ProviderViewContext;
}());
exports.ProviderViewContext = ProviderViewContext;
var ProviderElementContext = (function () {
    function ProviderElementContext(_viewContext, _parent, _isViewRoot, _directiveAsts, attrs, vars, _sourceSpan) {
        var _this = this;
        this._viewContext = _viewContext;
        this._parent = _parent;
        this._isViewRoot = _isViewRoot;
        this._directiveAsts = _directiveAsts;
        this._sourceSpan = _sourceSpan;
        this._transformedProviders = new compile_metadata_1.CompileTokenMap();
        this._seenProviders = new compile_metadata_1.CompileTokenMap();
        this._hasViewContainer = false;
        this._attrs = {};
        attrs.forEach(function (attrAst) { return _this._attrs[attrAst.name] = attrAst.value; });
        var directivesMeta = _directiveAsts.map(function (directiveAst) { return directiveAst.directive; });
        this._allProviders =
            _resolveProvidersFromDirectives(directivesMeta, _sourceSpan, _viewContext.errors);
        this._contentQueries = _getContentQueries(directivesMeta);
        var queriedTokens = new compile_metadata_1.CompileTokenMap();
        this._allProviders.values().forEach(function (provider) { _this._addQueryReadsTo(provider.token, queriedTokens); });
        vars.forEach(function (varAst) {
            var varToken = new compile_metadata_1.CompileTokenMetadata({ value: varAst.name });
            _this._addQueryReadsTo(varToken, queriedTokens);
        });
        if (lang_1.isPresent(queriedTokens.get(identifiers_1.identifierToken(identifiers_1.Identifiers.ViewContainerRef)))) {
            this._hasViewContainer = true;
        }
        // create the providers that we know are eager first
        this._allProviders.values().forEach(function (provider) {
            var eager = provider.eager || lang_1.isPresent(queriedTokens.get(provider.token));
            if (eager) {
                _this._getOrCreateLocalProvider(provider.providerType, provider.token, true);
            }
        });
    }
    ProviderElementContext.prototype.afterElement = function () {
        var _this = this;
        // collect lazy providers
        this._allProviders.values().forEach(function (provider) {
            _this._getOrCreateLocalProvider(provider.providerType, provider.token, false);
        });
    };
    Object.defineProperty(ProviderElementContext.prototype, "transformProviders", {
        get: function () { return this._transformedProviders.values(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProviderElementContext.prototype, "transformedDirectiveAsts", {
        get: function () {
            var sortedProviderTypes = this._transformedProviders.values().map(function (provider) { return provider.token.identifier; });
            var sortedDirectives = collection_1.ListWrapper.clone(this._directiveAsts);
            collection_1.ListWrapper.sort(sortedDirectives, function (dir1, dir2) { return sortedProviderTypes.indexOf(dir1.directive.type) -
                sortedProviderTypes.indexOf(dir2.directive.type); });
            return sortedDirectives;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProviderElementContext.prototype, "transformedHasViewContainer", {
        get: function () { return this._hasViewContainer; },
        enumerable: true,
        configurable: true
    });
    ProviderElementContext.prototype._addQueryReadsTo = function (token, queryReadTokens) {
        this._getQueriesFor(token).forEach(function (query) {
            var queryReadToken = lang_1.isPresent(query.read) ? query.read : token;
            if (lang_1.isBlank(queryReadTokens.get(queryReadToken))) {
                queryReadTokens.add(queryReadToken, true);
            }
        });
    };
    ProviderElementContext.prototype._getQueriesFor = function (token) {
        var result = [];
        var currentEl = this;
        var distance = 0;
        var queries;
        while (currentEl !== null) {
            queries = currentEl._contentQueries.get(token);
            if (lang_1.isPresent(queries)) {
                collection_1.ListWrapper.addAll(result, queries.filter(function (query) { return query.descendants || distance <= 1; }));
            }
            if (currentEl._directiveAsts.length > 0) {
                distance++;
            }
            currentEl = currentEl._parent;
        }
        queries = this._viewContext.viewQueries.get(token);
        if (lang_1.isPresent(queries)) {
            collection_1.ListWrapper.addAll(result, queries);
        }
        return result;
    };
    ProviderElementContext.prototype._getOrCreateLocalProvider = function (requestingProviderType, token, eager) {
        var _this = this;
        var resolvedProvider = this._allProviders.get(token);
        if (lang_1.isBlank(resolvedProvider) ||
            ((requestingProviderType === template_ast_1.ProviderAstType.Directive ||
                requestingProviderType === template_ast_1.ProviderAstType.PublicService) &&
                resolvedProvider.providerType === template_ast_1.ProviderAstType.PrivateService) ||
            ((requestingProviderType === template_ast_1.ProviderAstType.PrivateService ||
                requestingProviderType === template_ast_1.ProviderAstType.PublicService) &&
                resolvedProvider.providerType === template_ast_1.ProviderAstType.Builtin)) {
            return null;
        }
        var transformedProviderAst = this._transformedProviders.get(token);
        if (lang_1.isPresent(transformedProviderAst)) {
            return transformedProviderAst;
        }
        if (lang_1.isPresent(this._seenProviders.get(token))) {
            this._viewContext.errors.push(new ProviderError("Cannot instantiate cyclic dependency! " + token.name, this._sourceSpan));
            return null;
        }
        this._seenProviders.add(token, true);
        var transformedProviders = resolvedProvider.providers.map(function (provider) {
            var transformedUseValue = provider.useValue;
            var transformedUseExisting = provider.useExisting;
            var transformedDeps;
            if (lang_1.isPresent(provider.useExisting)) {
                var existingDiDep = _this._getDependency(resolvedProvider.providerType, new compile_metadata_1.CompileDiDependencyMetadata({ token: provider.useExisting }), eager);
                if (lang_1.isPresent(existingDiDep.token)) {
                    transformedUseExisting = existingDiDep.token;
                }
                else {
                    transformedUseExisting = null;
                    transformedUseValue = existingDiDep.value;
                }
            }
            else if (lang_1.isPresent(provider.useFactory)) {
                var deps = lang_1.isPresent(provider.deps) ? provider.deps : provider.useFactory.diDeps;
                transformedDeps =
                    deps.map(function (dep) { return _this._getDependency(resolvedProvider.providerType, dep, eager); });
            }
            else if (lang_1.isPresent(provider.useClass)) {
                var deps = lang_1.isPresent(provider.deps) ? provider.deps : provider.useClass.diDeps;
                transformedDeps =
                    deps.map(function (dep) { return _this._getDependency(resolvedProvider.providerType, dep, eager); });
            }
            return _transformProvider(provider, {
                useExisting: transformedUseExisting,
                useValue: transformedUseValue,
                deps: transformedDeps
            });
        });
        transformedProviderAst =
            _transformProviderAst(resolvedProvider, { eager: eager, providers: transformedProviders });
        this._transformedProviders.add(token, transformedProviderAst);
        return transformedProviderAst;
    };
    ProviderElementContext.prototype._getLocalDependency = function (requestingProviderType, dep, eager) {
        if (eager === void 0) { eager = null; }
        if (dep.isAttribute) {
            var attrValue = this._attrs[dep.token.value];
            return new compile_metadata_1.CompileDiDependencyMetadata({ isValue: true, value: lang_1.normalizeBlank(attrValue) });
        }
        if (lang_1.isPresent(dep.query) || lang_1.isPresent(dep.viewQuery)) {
            return dep;
        }
        if (lang_1.isPresent(dep.token)) {
            // access builtints
            if ((requestingProviderType === template_ast_1.ProviderAstType.Directive ||
                requestingProviderType === template_ast_1.ProviderAstType.Component)) {
                if (dep.token.equalsTo(identifiers_1.identifierToken(identifiers_1.Identifiers.Renderer)) ||
                    dep.token.equalsTo(identifiers_1.identifierToken(identifiers_1.Identifiers.ElementRef)) ||
                    dep.token.equalsTo(identifiers_1.identifierToken(identifiers_1.Identifiers.ChangeDetectorRef)) ||
                    dep.token.equalsTo(identifiers_1.identifierToken(identifiers_1.Identifiers.TemplateRef))) {
                    return dep;
                }
                if (dep.token.equalsTo(identifiers_1.identifierToken(identifiers_1.Identifiers.ViewContainerRef))) {
                    this._hasViewContainer = true;
                }
            }
            // access the injector
            if (dep.token.equalsTo(identifiers_1.identifierToken(identifiers_1.Identifiers.Injector))) {
                return dep;
            }
            // access providers
            if (lang_1.isPresent(this._getOrCreateLocalProvider(requestingProviderType, dep.token, eager))) {
                return dep;
            }
        }
        return null;
    };
    ProviderElementContext.prototype._getDependency = function (requestingProviderType, dep, eager) {
        if (eager === void 0) { eager = null; }
        var currElement = this;
        var currEager = eager;
        var result = null;
        if (!dep.isSkipSelf) {
            result = this._getLocalDependency(requestingProviderType, dep, eager);
        }
        if (dep.isSelf) {
            if (lang_1.isBlank(result) && dep.isOptional) {
                result = new compile_metadata_1.CompileDiDependencyMetadata({ isValue: true, value: null });
            }
        }
        else {
            // check parent elements
            while (lang_1.isBlank(result) && lang_1.isPresent(currElement._parent)) {
                var prevElement = currElement;
                currElement = currElement._parent;
                if (prevElement._isViewRoot) {
                    currEager = false;
                }
                result = currElement._getLocalDependency(template_ast_1.ProviderAstType.PublicService, dep, currEager);
            }
            // check @Host restriction
            if (lang_1.isBlank(result)) {
                if (!dep.isHost || this._viewContext.component.type.isHost ||
                    identifiers_1.identifierToken(this._viewContext.component.type).equalsTo(dep.token) ||
                    lang_1.isPresent(this._viewContext.viewProviders.get(dep.token))) {
                    result = dep;
                }
                else {
                    result = dep.isOptional ?
                        result = new compile_metadata_1.CompileDiDependencyMetadata({ isValue: true, value: null }) :
                        null;
                }
            }
        }
        if (lang_1.isBlank(result)) {
            this._viewContext.errors.push(new ProviderError("No provider for " + dep.token.name, this._sourceSpan));
        }
        return result;
    };
    return ProviderElementContext;
}());
exports.ProviderElementContext = ProviderElementContext;
var AppProviderParser = (function () {
    function AppProviderParser(_sourceSpan, providers) {
        this._sourceSpan = _sourceSpan;
        this._transformedProviders = new compile_metadata_1.CompileTokenMap();
        this._seenProviders = new compile_metadata_1.CompileTokenMap();
        this._errors = [];
        this._allProviders = new compile_metadata_1.CompileTokenMap();
        _resolveProviders(_normalizeProviders(providers, this._sourceSpan, this._errors), template_ast_1.ProviderAstType.PublicService, false, this._sourceSpan, this._errors, this._allProviders);
    }
    AppProviderParser.prototype.parse = function () {
        var _this = this;
        this._allProviders.values().forEach(function (provider) { _this._getOrCreateLocalProvider(provider.token, provider.eager); });
        if (this._errors.length > 0) {
            var errorString = this._errors.join('\n');
            throw new exceptions_1.BaseException("Provider parse errors:\n" + errorString);
        }
        return this._transformedProviders.values();
    };
    AppProviderParser.prototype._getOrCreateLocalProvider = function (token, eager) {
        var _this = this;
        var resolvedProvider = this._allProviders.get(token);
        if (lang_1.isBlank(resolvedProvider)) {
            return null;
        }
        var transformedProviderAst = this._transformedProviders.get(token);
        if (lang_1.isPresent(transformedProviderAst)) {
            return transformedProviderAst;
        }
        if (lang_1.isPresent(this._seenProviders.get(token))) {
            this._errors.push(new ProviderError("Cannot instantiate cyclic dependency! " + token.name, this._sourceSpan));
            return null;
        }
        this._seenProviders.add(token, true);
        var transformedProviders = resolvedProvider.providers.map(function (provider) {
            var transformedUseValue = provider.useValue;
            var transformedUseExisting = provider.useExisting;
            var transformedDeps;
            if (lang_1.isPresent(provider.useExisting)) {
                var existingDiDep = _this._getDependency(new compile_metadata_1.CompileDiDependencyMetadata({ token: provider.useExisting }), eager);
                if (lang_1.isPresent(existingDiDep.token)) {
                    transformedUseExisting = existingDiDep.token;
                }
                else {
                    transformedUseExisting = null;
                    transformedUseValue = existingDiDep.value;
                }
            }
            else if (lang_1.isPresent(provider.useFactory)) {
                var deps = lang_1.isPresent(provider.deps) ? provider.deps : provider.useFactory.diDeps;
                transformedDeps = deps.map(function (dep) { return _this._getDependency(dep, eager); });
            }
            else if (lang_1.isPresent(provider.useClass)) {
                var deps = lang_1.isPresent(provider.deps) ? provider.deps : provider.useClass.diDeps;
                transformedDeps = deps.map(function (dep) { return _this._getDependency(dep, eager); });
            }
            return _transformProvider(provider, {
                useExisting: transformedUseExisting,
                useValue: transformedUseValue,
                deps: transformedDeps
            });
        });
        transformedProviderAst =
            _transformProviderAst(resolvedProvider, { eager: eager, providers: transformedProviders });
        this._transformedProviders.add(token, transformedProviderAst);
        return transformedProviderAst;
    };
    AppProviderParser.prototype._getDependency = function (dep, eager) {
        if (eager === void 0) { eager = null; }
        var foundLocal = false;
        if (!dep.isSkipSelf && lang_1.isPresent(dep.token)) {
            // access the injector
            if (dep.token.equalsTo(identifiers_1.identifierToken(identifiers_1.Identifiers.Injector))) {
                foundLocal = true;
            }
            else if (lang_1.isPresent(this._getOrCreateLocalProvider(dep.token, eager))) {
                foundLocal = true;
            }
        }
        var result = dep;
        if (dep.isSelf && !foundLocal) {
            if (dep.isOptional) {
                result = new compile_metadata_1.CompileDiDependencyMetadata({ isValue: true, value: null });
            }
            else {
                this._errors.push(new ProviderError("No provider for " + dep.token.name, this._sourceSpan));
            }
        }
        return result;
    };
    return AppProviderParser;
}());
exports.AppProviderParser = AppProviderParser;
function _transformProvider(provider, _a) {
    var useExisting = _a.useExisting, useValue = _a.useValue, deps = _a.deps;
    return new compile_metadata_1.CompileProviderMetadata({
        token: provider.token,
        useClass: provider.useClass,
        useExisting: useExisting,
        useFactory: provider.useFactory,
        useValue: useValue,
        useProperty: provider.useProperty,
        deps: deps,
        multi: provider.multi
    });
}
function _transformProviderAst(provider, _a) {
    var eager = _a.eager, providers = _a.providers;
    return new template_ast_1.ProviderAst(provider.token, provider.multiProvider, provider.eager || eager, providers, provider.providerType, provider.sourceSpan);
}
function _normalizeProviders(providers, sourceSpan, targetErrors, targetProviders) {
    if (targetProviders === void 0) { targetProviders = null; }
    if (lang_1.isBlank(targetProviders)) {
        targetProviders = [];
    }
    if (lang_1.isPresent(providers)) {
        providers.forEach(function (provider) {
            if (lang_1.isArray(provider)) {
                _normalizeProviders(provider, sourceSpan, targetErrors, targetProviders);
            }
            else {
                var normalizeProvider;
                if (provider instanceof compile_metadata_1.CompileProviderMetadata) {
                    normalizeProvider = provider;
                }
                else if (provider instanceof compile_metadata_1.CompileTypeMetadata) {
                    normalizeProvider = new compile_metadata_1.CompileProviderMetadata({ token: new compile_metadata_1.CompileTokenMetadata({ identifier: provider }), useClass: provider });
                }
                else {
                    targetErrors.push(new ProviderError("Unknown provider type " + provider, sourceSpan));
                }
                if (lang_1.isPresent(normalizeProvider)) {
                    targetProviders.push(normalizeProvider);
                }
            }
        });
    }
    return targetProviders;
}
function _resolveProvidersFromDirectives(directives, sourceSpan, targetErrors) {
    var providersByToken = new compile_metadata_1.CompileTokenMap();
    directives.forEach(function (directive) {
        var dirProvider = new compile_metadata_1.CompileProviderMetadata({ token: new compile_metadata_1.CompileTokenMetadata({ identifier: directive.type }), useClass: directive.type });
        _resolveProviders([dirProvider], directive.isComponent ? template_ast_1.ProviderAstType.Component : template_ast_1.ProviderAstType.Directive, true, sourceSpan, targetErrors, providersByToken);
    });
    // Note: directives need to be able to overwrite providers of a component!
    var directivesWithComponentFirst = directives.filter(function (dir) { return dir.isComponent; }).concat(directives.filter(function (dir) { return !dir.isComponent; }));
    directivesWithComponentFirst.forEach(function (directive) {
        _resolveProviders(_normalizeProviders(directive.providers, sourceSpan, targetErrors), template_ast_1.ProviderAstType.PublicService, false, sourceSpan, targetErrors, providersByToken);
        _resolveProviders(_normalizeProviders(directive.viewProviders, sourceSpan, targetErrors), template_ast_1.ProviderAstType.PrivateService, false, sourceSpan, targetErrors, providersByToken);
    });
    return providersByToken;
}
function _resolveProviders(providers, providerType, eager, sourceSpan, targetErrors, targetProvidersByToken) {
    providers.forEach(function (provider) {
        var resolvedProvider = targetProvidersByToken.get(provider.token);
        if (lang_1.isPresent(resolvedProvider) && resolvedProvider.multiProvider !== provider.multi) {
            targetErrors.push(new ProviderError("Mixing multi and non multi provider is not possible for token " + resolvedProvider.token.name, sourceSpan));
        }
        if (lang_1.isBlank(resolvedProvider)) {
            resolvedProvider = new template_ast_1.ProviderAst(provider.token, provider.multi, eager, [provider], providerType, sourceSpan);
            targetProvidersByToken.add(provider.token, resolvedProvider);
        }
        else {
            if (!provider.multi) {
                collection_1.ListWrapper.clear(resolvedProvider.providers);
            }
            resolvedProvider.providers.push(provider);
        }
    });
}
function _getViewQueries(component) {
    var viewQueries = new compile_metadata_1.CompileTokenMap();
    if (lang_1.isPresent(component.viewQueries)) {
        component.viewQueries.forEach(function (query) { return _addQueryToTokenMap(viewQueries, query); });
    }
    component.type.diDeps.forEach(function (dep) {
        if (lang_1.isPresent(dep.viewQuery)) {
            _addQueryToTokenMap(viewQueries, dep.viewQuery);
        }
    });
    return viewQueries;
}
function _getContentQueries(directives) {
    var contentQueries = new compile_metadata_1.CompileTokenMap();
    directives.forEach(function (directive) {
        if (lang_1.isPresent(directive.queries)) {
            directive.queries.forEach(function (query) { return _addQueryToTokenMap(contentQueries, query); });
        }
        directive.type.diDeps.forEach(function (dep) {
            if (lang_1.isPresent(dep.query)) {
                _addQueryToTokenMap(contentQueries, dep.query);
            }
        });
    });
    return contentQueries;
}
function _addQueryToTokenMap(map, query) {
    query.selectors.forEach(function (token) {
        var entry = map.get(token);
        if (lang_1.isBlank(entry)) {
            entry = [];
            map.add(token, entry);
        }
        entry.push(query);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXJfcGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1sYjdmZUJyei50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3Byb3ZpZGVyX3BhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxxQkFBMEQsMEJBQTBCLENBQUMsQ0FBQTtBQUNyRiwyQkFBMEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUMzRCwyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RCw2QkFrQk8sZ0JBQWdCLENBQUMsQ0FBQTtBQUN4QixpQ0FTTyxvQkFBb0IsQ0FBQyxDQUFBO0FBQzVCLDRCQUEyQyxlQUFlLENBQUMsQ0FBQTtBQUMzRCwyQkFBeUQsY0FBYyxDQUFDLENBQUE7QUFFeEU7SUFBbUMsaUNBQVU7SUFDM0MsdUJBQVksT0FBZSxFQUFFLElBQXFCO1FBQUksa0JBQU0sSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQUMsQ0FBQztJQUMvRSxvQkFBQztBQUFELENBQUMsQUFGRCxDQUFtQyx1QkFBVSxHQUU1QztBQUZZLHFCQUFhLGdCQUV6QixDQUFBO0FBRUQ7SUFXRSw2QkFBbUIsU0FBbUMsRUFBUyxVQUEyQjtRQVg1RixpQkFxQkM7UUFWb0IsY0FBUyxHQUFULFNBQVMsQ0FBMEI7UUFBUyxlQUFVLEdBQVYsVUFBVSxDQUFpQjtRQUYxRixXQUFNLEdBQW9CLEVBQUUsQ0FBQztRQUczQixJQUFJLENBQUMsV0FBVyxHQUFHLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksa0NBQWUsRUFBVyxDQUFDO1FBQ3BELG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUM7YUFDaEUsT0FBTyxDQUFDLFVBQUMsUUFBUTtZQUNoQixFQUFFLENBQUMsQ0FBQyxjQUFPLENB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aywgaXNBcnJheSwgbm9ybWFsaXplQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtcbiAgVGVtcGxhdGVBc3QsXG4gIFRlbXBsYXRlQXN0VmlzaXRvcixcbiAgTmdDb250ZW50QXN0LFxuICBFbWJlZGRlZFRlbXBsYXRlQXN0LFxuICBFbGVtZW50QXN0LFxuICBWYXJpYWJsZUFzdCxcbiAgQm91bmRFdmVudEFzdCxcbiAgQm91bmRFbGVtZW50UHJvcGVydHlBc3QsXG4gIEF0dHJBc3QsXG4gIEJvdW5kVGV4dEFzdCxcbiAgVGV4dEFzdCxcbiAgRGlyZWN0aXZlQXN0LFxuICBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0LFxuICB0ZW1wbGF0ZVZpc2l0QWxsLFxuICBQcm9wZXJ0eUJpbmRpbmdUeXBlLFxuICBQcm92aWRlckFzdCxcbiAgUHJvdmlkZXJBc3RUeXBlXG59IGZyb20gJy4vdGVtcGxhdGVfYXN0JztcbmltcG9ydCB7XG4gIENvbXBpbGVUeXBlTWV0YWRhdGEsXG4gIENvbXBpbGVJbmplY3Rvck1vZHVsZU1ldGFkYXRhLFxuICBDb21waWxlVG9rZW5NYXAsXG4gIENvbXBpbGVRdWVyeU1ldGFkYXRhLFxuICBDb21waWxlVG9rZW5NZXRhZGF0YSxcbiAgQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEsXG4gIENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSxcbiAgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhXG59IGZyb20gJy4vY29tcGlsZV9tZXRhZGF0YSc7XG5pbXBvcnQge0lkZW50aWZpZXJzLCBpZGVudGlmaWVyVG9rZW59IGZyb20gJy4vaWRlbnRpZmllcnMnO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW4sIFBhcnNlRXJyb3IsIFBhcnNlTG9jYXRpb259IGZyb20gJy4vcGFyc2VfdXRpbCc7XG5cbmV4cG9ydCBjbGFzcyBQcm92aWRlckVycm9yIGV4dGVuZHMgUGFyc2VFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgc3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7IHN1cGVyKHNwYW4sIG1lc3NhZ2UpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBQcm92aWRlclZpZXdDb250ZXh0IHtcbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgdmlld1F1ZXJpZXM6IENvbXBpbGVUb2tlbk1hcDxDb21waWxlUXVlcnlNZXRhZGF0YVtdPjtcbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgdmlld1Byb3ZpZGVyczogQ29tcGlsZVRva2VuTWFwPGJvb2xlYW4+O1xuICBlcnJvcnM6IFByb3ZpZGVyRXJyb3JbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjb21wb25lbnQ6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge1xuICAgIHRoaXMudmlld1F1ZXJpZXMgPSBfZ2V0Vmlld1F1ZXJpZXMoY29tcG9uZW50KTtcbiAgICB0aGlzLnZpZXdQcm92aWRlcnMgPSBuZXcgQ29tcGlsZVRva2VuTWFwPGJvb2xlYW4+KCk7XG4gICAgX25vcm1hbGl6ZVByb3ZpZGVycyhjb21wb25lbnQudmlld1Byb3ZpZGVycywgc291cmNlU3BhbiwgdGhpcy5lcnJvcnMpXG4gICAgICAgIC5mb3JFYWNoKChwcm92aWRlcikgPT4ge1xuICAgICAgICAgIGlmIChpc0JsYW5rKHRoaXMudmlld1Byb3ZpZGVycy5nZXQocHJvdmlkZXIudG9rZW4pKSkge1xuICAgICAgICAgICAgdGhpcy52aWV3UHJvdmlkZXJzLmFkZChwcm92aWRlci50b2tlbiwgdHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUHJvdmlkZXJFbGVtZW50Q29udGV4dCB7XG4gIHByaXZhdGUgX2NvbnRlbnRRdWVyaWVzOiBDb21waWxlVG9rZW5NYXA8Q29tcGlsZVF1ZXJ5TWV0YWRhdGFbXT47XG5cbiAgcHJpdmF0ZSBfdHJhbnNmb3JtZWRQcm92aWRlcnMgPSBuZXcgQ29tcGlsZVRva2VuTWFwPFByb3ZpZGVyQXN0PigpO1xuICBwcml2YXRlIF9zZWVuUHJvdmlkZXJzID0gbmV3IENvbXBpbGVUb2tlbk1hcDxib29sZWFuPigpO1xuICBwcml2YXRlIF9hbGxQcm92aWRlcnM6IENvbXBpbGVUb2tlbk1hcDxQcm92aWRlckFzdD47XG4gIHByaXZhdGUgX2F0dHJzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgcHJpdmF0ZSBfaGFzVmlld0NvbnRhaW5lcjogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3ZpZXdDb250ZXh0OiBQcm92aWRlclZpZXdDb250ZXh0LCBwcml2YXRlIF9wYXJlbnQ6IFByb3ZpZGVyRWxlbWVudENvbnRleHQsXG4gICAgICAgICAgICAgIHByaXZhdGUgX2lzVmlld1Jvb3Q6IGJvb2xlYW4sIHByaXZhdGUgX2RpcmVjdGl2ZUFzdHM6IERpcmVjdGl2ZUFzdFtdLFxuICAgICAgICAgICAgICBhdHRyczogQXR0ckFzdFtdLCB2YXJzOiBWYXJpYWJsZUFzdFtdLCBwcml2YXRlIF9zb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHtcbiAgICB0aGlzLl9hdHRycyA9IHt9O1xuICAgIGF0dHJzLmZvckVhY2goKGF0dHJBc3QpID0+IHRoaXMuX2F0dHJzW2F0dHJBc3QubmFtZV0gPSBhdHRyQXN0LnZhbHVlKTtcbiAgICB2YXIgZGlyZWN0aXZlc01ldGEgPSBfZGlyZWN0aXZlQXN0cy5tYXAoZGlyZWN0aXZlQXN0ID0+IGRpcmVjdGl2ZUFzdC5kaXJlY3RpdmUpO1xuICAgIHRoaXMuX2FsbFByb3ZpZGVycyA9XG4gICAgICAgIF9yZXNvbHZlUHJvdmlkZXJzRnJvbURpcmVjdGl2ZXMoZGlyZWN0aXZlc01ldGEsIF9zb3VyY2VTcGFuLCBfdmlld0NvbnRleHQuZXJyb3JzKTtcbiAgICB0aGlzLl9jb250ZW50UXVlcmllcyA9IF9nZXRDb250ZW50UXVlcmllcyhkaXJlY3RpdmVzTWV0YSk7XG4gICAgdmFyIHF1ZXJpZWRUb2tlbnMgPSBuZXcgQ29tcGlsZVRva2VuTWFwPGJvb2xlYW4+KCk7XG4gICAgdGhpcy5fYWxsUHJvdmlkZXJzLnZhbHVlcygpLmZvckVhY2goXG4gICAgICAgIChwcm92aWRlcikgPT4geyB0aGlzLl9hZGRRdWVyeVJlYWRzVG8ocHJvdmlkZXIudG9rZW4sIHF1ZXJpZWRUb2tlbnMpOyB9KTtcbiAgICB2YXJzLmZvckVhY2goKHZhckFzdCkgPT4ge1xuICAgICAgdmFyIHZhclRva2VuID0gbmV3IENvbXBpbGVUb2tlbk1ldGFkYXRhKHt2YWx1ZTogdmFyQXN0Lm5hbWV9KTtcbiAgICAgIHRoaXMuX2FkZFF1ZXJ5UmVhZHNUbyh2YXJUb2tlbiwgcXVlcmllZFRva2Vucyk7XG4gICAgfSk7XG4gICAgaWYgKGlzUHJlc2VudChxdWVyaWVkVG9rZW5zLmdldChpZGVudGlmaWVyVG9rZW4oSWRlbnRpZmllcnMuVmlld0NvbnRhaW5lclJlZikpKSkge1xuICAgICAgdGhpcy5faGFzVmlld0NvbnRhaW5lciA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gY3JlYXRlIHRoZSBwcm92aWRlcnMgdGhhdCB3ZSBrbm93IGFyZSBlYWdlciBmaXJzdFxuICAgIHRoaXMuX2FsbFByb3ZpZGVycy52YWx1ZXMoKS5mb3JFYWNoKChwcm92aWRlcikgPT4ge1xuICAgICAgdmFyIGVhZ2VyID0gcHJvdmlkZXIuZWFnZXIgfHwgaXNQcmVzZW50KHF1ZXJpZWRUb2tlbnMuZ2V0KHByb3ZpZGVyLnRva2VuKSk7XG4gICAgICBpZiAoZWFnZXIpIHtcbiAgICAgICAgdGhpcy5fZ2V0T3JDcmVhdGVMb2NhbFByb3ZpZGVyKHByb3ZpZGVyLnByb3ZpZGVyVHlwZSwgcHJvdmlkZXIudG9rZW4sIHRydWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgYWZ0ZXJFbGVtZW50KCkge1xuICAgIC8vIGNvbGxlY3QgbGF6eSBwcm92aWRlcnNcbiAgICB0aGlzLl9hbGxQcm92aWRlcnMudmFsdWVzKCkuZm9yRWFjaCgocHJvdmlkZXIpID0+IHtcbiAgICAgIHRoaXMuX2dldE9yQ3JlYXRlTG9jYWxQcm92aWRlcihwcm92aWRlci5wcm92aWRlclR5cGUsIHByb3ZpZGVyLnRva2VuLCBmYWxzZSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXQgdHJhbnNmb3JtUHJvdmlkZXJzKCk6IFByb3ZpZGVyQXN0W10geyByZXR1cm4gdGhpcy5fdHJhbnNmb3JtZWRQcm92aWRlcnMudmFsdWVzKCk7IH1cblxuICBnZXQgdHJhbnNmb3JtZWREaXJlY3RpdmVBc3RzKCk6IERpcmVjdGl2ZUFzdFtdIHtcbiAgICB2YXIgc29ydGVkUHJvdmlkZXJUeXBlcyA9XG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybWVkUHJvdmlkZXJzLnZhbHVlcygpLm1hcChwcm92aWRlciA9PiBwcm92aWRlci50b2tlbi5pZGVudGlmaWVyKTtcbiAgICB2YXIgc29ydGVkRGlyZWN0aXZlcyA9IExpc3RXcmFwcGVyLmNsb25lKHRoaXMuX2RpcmVjdGl2ZUFzdHMpO1xuICAgIExpc3RXcmFwcGVyLnNvcnQoc29ydGVkRGlyZWN0aXZlcyxcbiAgICAgICAgICAgICAgICAgICAgIChkaXIxLCBkaXIyKSA9PiBzb3J0ZWRQcm92aWRlclR5cGVzLmluZGV4T2YoZGlyMS5kaXJlY3RpdmUudHlwZSkgLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRlZFByb3ZpZGVyVHlwZXMuaW5kZXhPZihkaXIyLmRpcmVjdGl2ZS50eXBlKSk7XG4gICAgcmV0dXJuIHNvcnRlZERpcmVjdGl2ZXM7XG4gIH1cblxuICBnZXQgdHJhbnNmb3JtZWRIYXNWaWV3Q29udGFpbmVyKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5faGFzVmlld0NvbnRhaW5lcjsgfVxuXG4gIHByaXZhdGUgX2FkZFF1ZXJ5UmVhZHNUbyh0b2tlbjogQ29tcGlsZVRva2VuTWV0YWRhdGEsIHF1ZXJ5UmVhZFRva2VuczogQ29tcGlsZVRva2VuTWFwPGJvb2xlYW4+KSB7XG4gICAgdGhpcy5fZ2V0UXVlcmllc0Zvcih0b2tlbikuZm9yRWFjaCgocXVlcnkpID0+IHtcbiAgICAgIHZhciBxdWVyeVJlYWRUb2tlbiA9IGlzUHJlc2VudChxdWVyeS5yZWFkKSA/IHF1ZXJ5LnJlYWQgOiB0b2tlbjtcbiAgICAgIGlmIChpc0JsYW5rKHF1ZXJ5UmVhZFRva2Vucy5nZXQocXVlcnlSZWFkVG9rZW4pKSkge1xuICAgICAgICBxdWVyeVJlYWRUb2tlbnMuYWRkKHF1ZXJ5UmVhZFRva2VuLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFF1ZXJpZXNGb3IodG9rZW46IENvbXBpbGVUb2tlbk1ldGFkYXRhKTogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSB7XG4gICAgdmFyIHJlc3VsdDogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSA9IFtdO1xuICAgIHZhciBjdXJyZW50RWw6IFByb3ZpZGVyRWxlbWVudENvbnRleHQgPSB0aGlzO1xuICAgIHZhciBkaXN0YW5jZSA9IDA7XG4gICAgdmFyIHF1ZXJpZXM6IENvbXBpbGVRdWVyeU1ldGFkYXRhW107XG4gICAgd2hpbGUgKGN1cnJlbnRFbCAhPT0gbnVsbCkge1xuICAgICAgcXVlcmllcyA9IGN1cnJlbnRFbC5fY29udGVudFF1ZXJpZXMuZ2V0KHRva2VuKTtcbiAgICAgIGlmIChpc1ByZXNlbnQocXVlcmllcykpIHtcbiAgICAgICAgTGlzdFdyYXBwZXIuYWRkQWxsKHJlc3VsdCwgcXVlcmllcy5maWx0ZXIoKHF1ZXJ5KSA9PiBxdWVyeS5kZXNjZW5kYW50cyB8fCBkaXN0YW5jZSA8PSAxKSk7XG4gICAgICB9XG4gICAgICBpZiAoY3VycmVudEVsLl9kaXJlY3RpdmVBc3RzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZGlzdGFuY2UrKztcbiAgICAgIH1cbiAgICAgIGN1cnJlbnRFbCA9IGN1cnJlbnRFbC5fcGFyZW50O1xuICAgIH1cbiAgICBxdWVyaWVzID0gdGhpcy5fdmlld0NvbnRleHQudmlld1F1ZXJpZXMuZ2V0KHRva2VuKTtcbiAgICBpZiAoaXNQcmVzZW50KHF1ZXJpZXMpKSB7XG4gICAgICBMaXN0V3JhcHBlci5hZGRBbGwocmVzdWx0LCBxdWVyaWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfZ2V0T3JDcmVhdGVMb2NhbFByb3ZpZGVyKHJlcXVlc3RpbmdQcm92aWRlclR5cGU6IFByb3ZpZGVyQXN0VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuOiBDb21waWxlVG9rZW5NZXRhZGF0YSwgZWFnZXI6IGJvb2xlYW4pOiBQcm92aWRlckFzdCB7XG4gICAgdmFyIHJlc29sdmVkUHJvdmlkZXIgPSB0aGlzLl9hbGxQcm92aWRlcnMuZ2V0KHRva2VuKTtcbiAgICBpZiAoaXNCbGFuayhyZXNvbHZlZFByb3ZpZGVyKSB8fFxuICAgICAgICAoKHJlcXVlc3RpbmdQcm92aWRlclR5cGUgPT09IFByb3ZpZGVyQXN0VHlwZS5EaXJlY3RpdmUgfHxcbiAgICAgICAgICByZXF1ZXN0aW5nUHJvdmlkZXJUeXBlID09PSBQcm92aWRlckFzdFR5cGUuUHVibGljU2VydmljZSkgJiZcbiAgICAgICAgIHJlc29sdmVkUHJvdmlkZXIucHJvdmlkZXJUeXBlID09PSBQcm92aWRlckFzdFR5cGUuUHJpdmF0ZVNlcnZpY2UpIHx8XG4gICAgICAgICgocmVxdWVzdGluZ1Byb3ZpZGVyVHlwZSA9PT0gUHJvdmlkZXJBc3RUeXBlLlByaXZhdGVTZXJ2aWNlIHx8XG4gICAgICAgICAgcmVxdWVzdGluZ1Byb3ZpZGVyVHlwZSA9PT0gUHJvdmlkZXJBc3RUeXBlLlB1YmxpY1NlcnZpY2UpICYmXG4gICAgICAgICByZXNvbHZlZFByb3ZpZGVyLnByb3ZpZGVyVHlwZSA9PT0gUHJvdmlkZXJBc3RUeXBlLkJ1aWx0aW4pKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdmFyIHRyYW5zZm9ybWVkUHJvdmlkZXJBc3QgPSB0aGlzLl90cmFuc2Zvcm1lZFByb3ZpZGVycy5nZXQodG9rZW4pO1xuICAgIGlmIChpc1ByZXNlbnQodHJhbnNmb3JtZWRQcm92aWRlckFzdCkpIHtcbiAgICAgIHJldHVybiB0cmFuc2Zvcm1lZFByb3ZpZGVyQXN0O1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3NlZW5Qcm92aWRlcnMuZ2V0KHRva2VuKSkpIHtcbiAgICAgIHRoaXMuX3ZpZXdDb250ZXh0LmVycm9ycy5wdXNoKG5ldyBQcm92aWRlckVycm9yKFxuICAgICAgICAgIGBDYW5ub3QgaW5zdGFudGlhdGUgY3ljbGljIGRlcGVuZGVuY3khICR7dG9rZW4ubmFtZX1gLCB0aGlzLl9zb3VyY2VTcGFuKSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5fc2VlblByb3ZpZGVycy5hZGQodG9rZW4sIHRydWUpO1xuICAgIHZhciB0cmFuc2Zvcm1lZFByb3ZpZGVycyA9IHJlc29sdmVkUHJvdmlkZXIucHJvdmlkZXJzLm1hcCgocHJvdmlkZXIpID0+IHtcbiAgICAgIHZhciB0cmFuc2Zvcm1lZFVzZVZhbHVlID0gcHJvdmlkZXIudXNlVmFsdWU7XG4gICAgICB2YXIgdHJhbnNmb3JtZWRVc2VFeGlzdGluZyA9IHByb3ZpZGVyLnVzZUV4aXN0aW5nO1xuICAgICAgdmFyIHRyYW5zZm9ybWVkRGVwcztcbiAgICAgIGlmIChpc1ByZXNlbnQocHJvdmlkZXIudXNlRXhpc3RpbmcpKSB7XG4gICAgICAgIHZhciBleGlzdGluZ0RpRGVwID0gdGhpcy5fZ2V0RGVwZW5kZW5jeShcbiAgICAgICAgICAgIHJlc29sdmVkUHJvdmlkZXIucHJvdmlkZXJUeXBlLFxuICAgICAgICAgICAgbmV3IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSh7dG9rZW46IHByb3ZpZGVyLnVzZUV4aXN0aW5nfSksIGVhZ2VyKTtcbiAgICAgICAgaWYgKGlzUHJlc2VudChleGlzdGluZ0RpRGVwLnRva2VuKSkge1xuICAgICAgICAgIHRyYW5zZm9ybWVkVXNlRXhpc3RpbmcgPSBleGlzdGluZ0RpRGVwLnRva2VuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRyYW5zZm9ybWVkVXNlRXhpc3RpbmcgPSBudWxsO1xuICAgICAgICAgIHRyYW5zZm9ybWVkVXNlVmFsdWUgPSBleGlzdGluZ0RpRGVwLnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VGYWN0b3J5KSkge1xuICAgICAgICB2YXIgZGVwcyA9IGlzUHJlc2VudChwcm92aWRlci5kZXBzKSA/IHByb3ZpZGVyLmRlcHMgOiBwcm92aWRlci51c2VGYWN0b3J5LmRpRGVwcztcbiAgICAgICAgdHJhbnNmb3JtZWREZXBzID1cbiAgICAgICAgICAgIGRlcHMubWFwKChkZXApID0+IHRoaXMuX2dldERlcGVuZGVuY3kocmVzb2x2ZWRQcm92aWRlci5wcm92aWRlclR5cGUsIGRlcCwgZWFnZXIpKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KHByb3ZpZGVyLnVzZUNsYXNzKSkge1xuICAgICAgICB2YXIgZGVwcyA9IGlzUHJlc2VudChwcm92aWRlci5kZXBzKSA/IHByb3ZpZGVyLmRlcHMgOiBwcm92aWRlci51c2VDbGFzcy5kaURlcHM7XG4gICAgICAgIHRyYW5zZm9ybWVkRGVwcyA9XG4gICAgICAgICAgICBkZXBzLm1hcCgoZGVwKSA9PiB0aGlzLl9nZXREZXBlbmRlbmN5KHJlc29sdmVkUHJvdmlkZXIucHJvdmlkZXJUeXBlLCBkZXAsIGVhZ2VyKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3RyYW5zZm9ybVByb3ZpZGVyKHByb3ZpZGVyLCB7XG4gICAgICAgIHVzZUV4aXN0aW5nOiB0cmFuc2Zvcm1lZFVzZUV4aXN0aW5nLFxuICAgICAgICB1c2VWYWx1ZTogdHJhbnNmb3JtZWRVc2VWYWx1ZSxcbiAgICAgICAgZGVwczogdHJhbnNmb3JtZWREZXBzXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0cmFuc2Zvcm1lZFByb3ZpZGVyQXN0ID1cbiAgICAgICAgX3RyYW5zZm9ybVByb3ZpZGVyQXN0KHJlc29sdmVkUHJvdmlkZXIsIHtlYWdlcjogZWFnZXIsIHByb3ZpZGVyczogdHJhbnNmb3JtZWRQcm92aWRlcnN9KTtcbiAgICB0aGlzLl90cmFuc2Zvcm1lZFByb3ZpZGVycy5hZGQodG9rZW4sIHRyYW5zZm9ybWVkUHJvdmlkZXJBc3QpO1xuICAgIHJldHVybiB0cmFuc2Zvcm1lZFByb3ZpZGVyQXN0O1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0TG9jYWxEZXBlbmRlbmN5KHJlcXVlc3RpbmdQcm92aWRlclR5cGU6IFByb3ZpZGVyQXN0VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcDogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFnZXI6IGJvb2xlYW4gPSBudWxsKTogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgICBpZiAoZGVwLmlzQXR0cmlidXRlKSB7XG4gICAgICB2YXIgYXR0clZhbHVlID0gdGhpcy5fYXR0cnNbZGVwLnRva2VuLnZhbHVlXTtcbiAgICAgIHJldHVybiBuZXcgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhKHtpc1ZhbHVlOiB0cnVlLCB2YWx1ZTogbm9ybWFsaXplQmxhbmsoYXR0clZhbHVlKX0pO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KGRlcC5xdWVyeSkgfHwgaXNQcmVzZW50KGRlcC52aWV3UXVlcnkpKSB7XG4gICAgICByZXR1cm4gZGVwO1xuICAgIH1cblxuICAgIGlmIChpc1ByZXNlbnQoZGVwLnRva2VuKSkge1xuICAgICAgLy8gYWNjZXNzIGJ1aWx0aW50c1xuICAgICAgaWYgKChyZXF1ZXN0aW5nUHJvdmlkZXJUeXBlID09PSBQcm92aWRlckFzdFR5cGUuRGlyZWN0aXZlIHx8XG4gICAgICAgICAgIHJlcXVlc3RpbmdQcm92aWRlclR5cGUgPT09IFByb3ZpZGVyQXN0VHlwZS5Db21wb25lbnQpKSB7XG4gICAgICAgIGlmIChkZXAudG9rZW4uZXF1YWxzVG8oaWRlbnRpZmllclRva2VuKElkZW50aWZpZXJzLlJlbmRlcmVyKSkgfHxcbiAgICAgICAgICAgIGRlcC50b2tlbi5lcXVhbHNUbyhpZGVudGlmaWVyVG9rZW4oSWRlbnRpZmllcnMuRWxlbWVudFJlZikpIHx8XG4gICAgICAgICAgICBkZXAudG9rZW4uZXF1YWxzVG8oaWRlbnRpZmllclRva2VuKElkZW50aWZpZXJzLkNoYW5nZURldGVjdG9yUmVmKSkgfHxcbiAgICAgICAgICAgIGRlcC50b2tlbi5lcXVhbHNUbyhpZGVudGlmaWVyVG9rZW4oSWRlbnRpZmllcnMuVGVtcGxhdGVSZWYpKSkge1xuICAgICAgICAgIHJldHVybiBkZXA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlcC50b2tlbi5lcXVhbHNUbyhpZGVudGlmaWVyVG9rZW4oSWRlbnRpZmllcnMuVmlld0NvbnRhaW5lclJlZikpKSB7XG4gICAgICAgICAgdGhpcy5faGFzVmlld0NvbnRhaW5lciA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGFjY2VzcyB0aGUgaW5qZWN0b3JcbiAgICAgIGlmIChkZXAudG9rZW4uZXF1YWxzVG8oaWRlbnRpZmllclRva2VuKElkZW50aWZpZXJzLkluamVjdG9yKSkpIHtcbiAgICAgICAgcmV0dXJuIGRlcDtcbiAgICAgIH1cbiAgICAgIC8vIGFjY2VzcyBwcm92aWRlcnNcbiAgICAgIGlmIChpc1ByZXNlbnQodGhpcy5fZ2V0T3JDcmVhdGVMb2NhbFByb3ZpZGVyKHJlcXVlc3RpbmdQcm92aWRlclR5cGUsIGRlcC50b2tlbiwgZWFnZXIpKSkge1xuICAgICAgICByZXR1cm4gZGVwO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgX2dldERlcGVuZGVuY3kocmVxdWVzdGluZ1Byb3ZpZGVyVHlwZTogUHJvdmlkZXJBc3RUeXBlLCBkZXA6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICBlYWdlcjogYm9vbGVhbiA9IG51bGwpOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEge1xuICAgIHZhciBjdXJyRWxlbWVudDogUHJvdmlkZXJFbGVtZW50Q29udGV4dCA9IHRoaXM7XG4gICAgdmFyIGN1cnJFYWdlcjogYm9vbGVhbiA9IGVhZ2VyO1xuICAgIHZhciByZXN1bHQ6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSA9IG51bGw7XG4gICAgaWYgKCFkZXAuaXNTa2lwU2VsZikge1xuICAgICAgcmVzdWx0ID0gdGhpcy5fZ2V0TG9jYWxEZXBlbmRlbmN5KHJlcXVlc3RpbmdQcm92aWRlclR5cGUsIGRlcCwgZWFnZXIpO1xuICAgIH1cbiAgICBpZiAoZGVwLmlzU2VsZikge1xuICAgICAgaWYgKGlzQmxhbmsocmVzdWx0KSAmJiBkZXAuaXNPcHRpb25hbCkge1xuICAgICAgICByZXN1bHQgPSBuZXcgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhKHtpc1ZhbHVlOiB0cnVlLCB2YWx1ZTogbnVsbH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjaGVjayBwYXJlbnQgZWxlbWVudHNcbiAgICAgIHdoaWxlIChpc0JsYW5rKHJlc3VsdCkgJiYgaXNQcmVzZW50KGN1cnJFbGVtZW50Ll9wYXJlbnQpKSB7XG4gICAgICAgIHZhciBwcmV2RWxlbWVudCA9IGN1cnJFbGVtZW50O1xuICAgICAgICBjdXJyRWxlbWVudCA9IGN1cnJFbGVtZW50Ll9wYXJlbnQ7XG4gICAgICAgIGlmIChwcmV2RWxlbWVudC5faXNWaWV3Um9vdCkge1xuICAgICAgICAgIGN1cnJFYWdlciA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9IGN1cnJFbGVtZW50Ll9nZXRMb2NhbERlcGVuZGVuY3koUHJvdmlkZXJBc3RUeXBlLlB1YmxpY1NlcnZpY2UsIGRlcCwgY3VyckVhZ2VyKTtcbiAgICAgIH1cbiAgICAgIC8vIGNoZWNrIEBIb3N0IHJlc3RyaWN0aW9uXG4gICAgICBpZiAoaXNCbGFuayhyZXN1bHQpKSB7XG4gICAgICAgIGlmICghZGVwLmlzSG9zdCB8fCB0aGlzLl92aWV3Q29udGV4dC5jb21wb25lbnQudHlwZS5pc0hvc3QgfHxcbiAgICAgICAgICAgIGlkZW50aWZpZXJUb2tlbih0aGlzLl92aWV3Q29udGV4dC5jb21wb25lbnQudHlwZSkuZXF1YWxzVG8oZGVwLnRva2VuKSB8fFxuICAgICAgICAgICAgaXNQcmVzZW50KHRoaXMuX3ZpZXdDb250ZXh0LnZpZXdQcm92aWRlcnMuZ2V0KGRlcC50b2tlbikpKSB7XG4gICAgICAgICAgcmVzdWx0ID0gZGVwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdCA9IGRlcC5pc09wdGlvbmFsID9cbiAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSh7aXNWYWx1ZTogdHJ1ZSwgdmFsdWU6IG51bGx9KSA6XG4gICAgICAgICAgICAgICAgICAgICAgIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGlzQmxhbmsocmVzdWx0KSkge1xuICAgICAgdGhpcy5fdmlld0NvbnRleHQuZXJyb3JzLnB1c2goXG4gICAgICAgICAgbmV3IFByb3ZpZGVyRXJyb3IoYE5vIHByb3ZpZGVyIGZvciAke2RlcC50b2tlbi5uYW1lfWAsIHRoaXMuX3NvdXJjZVNwYW4pKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBBcHBQcm92aWRlclBhcnNlciB7XG4gIHByaXZhdGUgX3RyYW5zZm9ybWVkUHJvdmlkZXJzID0gbmV3IENvbXBpbGVUb2tlbk1hcDxQcm92aWRlckFzdD4oKTtcbiAgcHJpdmF0ZSBfc2VlblByb3ZpZGVycyA9IG5ldyBDb21waWxlVG9rZW5NYXA8Ym9vbGVhbj4oKTtcbiAgcHJpdmF0ZSBfYWxsUHJvdmlkZXJzOiBDb21waWxlVG9rZW5NYXA8UHJvdmlkZXJBc3Q+O1xuICBwcml2YXRlIF9lcnJvcnM6IFByb3ZpZGVyRXJyb3JbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3NvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiwgcHJvdmlkZXJzOiBhbnlbXSkge1xuICAgIHRoaXMuX2FsbFByb3ZpZGVycyA9IG5ldyBDb21waWxlVG9rZW5NYXA8UHJvdmlkZXJBc3Q+KCk7XG4gICAgX3Jlc29sdmVQcm92aWRlcnMoX25vcm1hbGl6ZVByb3ZpZGVycyhwcm92aWRlcnMsIHRoaXMuX3NvdXJjZVNwYW4sIHRoaXMuX2Vycm9ycyksXG4gICAgICAgICAgICAgICAgICAgICAgUHJvdmlkZXJBc3RUeXBlLlB1YmxpY1NlcnZpY2UsIGZhbHNlLCB0aGlzLl9zb3VyY2VTcGFuLCB0aGlzLl9lcnJvcnMsXG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWxsUHJvdmlkZXJzKTtcbiAgfVxuXG4gIHBhcnNlKCk6IFByb3ZpZGVyQXN0W10ge1xuICAgIHRoaXMuX2FsbFByb3ZpZGVycy52YWx1ZXMoKS5mb3JFYWNoKFxuICAgICAgICAocHJvdmlkZXIpID0+IHsgdGhpcy5fZ2V0T3JDcmVhdGVMb2NhbFByb3ZpZGVyKHByb3ZpZGVyLnRva2VuLCBwcm92aWRlci5lYWdlcik7IH0pO1xuICAgIGlmICh0aGlzLl9lcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIGVycm9yU3RyaW5nID0gdGhpcy5fZXJyb3JzLmpvaW4oJ1xcbicpO1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYFByb3ZpZGVyIHBhcnNlIGVycm9yczpcXG4ke2Vycm9yU3RyaW5nfWApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtZWRQcm92aWRlcnMudmFsdWVzKCk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRPckNyZWF0ZUxvY2FsUHJvdmlkZXIodG9rZW46IENvbXBpbGVUb2tlbk1ldGFkYXRhLCBlYWdlcjogYm9vbGVhbik6IFByb3ZpZGVyQXN0IHtcbiAgICB2YXIgcmVzb2x2ZWRQcm92aWRlciA9IHRoaXMuX2FsbFByb3ZpZGVycy5nZXQodG9rZW4pO1xuICAgIGlmIChpc0JsYW5rKHJlc29sdmVkUHJvdmlkZXIpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdmFyIHRyYW5zZm9ybWVkUHJvdmlkZXJBc3QgPSB0aGlzLl90cmFuc2Zvcm1lZFByb3ZpZGVycy5nZXQodG9rZW4pO1xuICAgIGlmIChpc1ByZXNlbnQodHJhbnNmb3JtZWRQcm92aWRlckFzdCkpIHtcbiAgICAgIHJldHVybiB0cmFuc2Zvcm1lZFByb3ZpZGVyQXN0O1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3NlZW5Qcm92aWRlcnMuZ2V0KHRva2VuKSkpIHtcbiAgICAgIHRoaXMuX2Vycm9ycy5wdXNoKG5ldyBQcm92aWRlckVycm9yKGBDYW5ub3QgaW5zdGFudGlhdGUgY3ljbGljIGRlcGVuZGVuY3khICR7dG9rZW4ubmFtZX1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc291cmNlU3BhbikpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRoaXMuX3NlZW5Qcm92aWRlcnMuYWRkKHRva2VuLCB0cnVlKTtcbiAgICB2YXIgdHJhbnNmb3JtZWRQcm92aWRlcnMgPSByZXNvbHZlZFByb3ZpZGVyLnByb3ZpZGVycy5tYXAoKHByb3ZpZGVyKSA9PiB7XG4gICAgICB2YXIgdHJhbnNmb3JtZWRVc2VWYWx1ZSA9IHByb3ZpZGVyLnVzZVZhbHVlO1xuICAgICAgdmFyIHRyYW5zZm9ybWVkVXNlRXhpc3RpbmcgPSBwcm92aWRlci51c2VFeGlzdGluZztcbiAgICAgIHZhciB0cmFuc2Zvcm1lZERlcHM7XG4gICAgICBpZiAoaXNQcmVzZW50KHByb3ZpZGVyLnVzZUV4aXN0aW5nKSkge1xuICAgICAgICB2YXIgZXhpc3RpbmdEaURlcCA9IHRoaXMuX2dldERlcGVuZGVuY3koXG4gICAgICAgICAgICBuZXcgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhKHt0b2tlbjogcHJvdmlkZXIudXNlRXhpc3Rpbmd9KSwgZWFnZXIpO1xuICAgICAgICBpZiAoaXNQcmVzZW50KGV4aXN0aW5nRGlEZXAudG9rZW4pKSB7XG4gICAgICAgICAgdHJhbnNmb3JtZWRVc2VFeGlzdGluZyA9IGV4aXN0aW5nRGlEZXAudG9rZW47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdHJhbnNmb3JtZWRVc2VFeGlzdGluZyA9IG51bGw7XG4gICAgICAgICAgdHJhbnNmb3JtZWRVc2VWYWx1ZSA9IGV4aXN0aW5nRGlEZXAudmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KHByb3ZpZGVyLnVzZUZhY3RvcnkpKSB7XG4gICAgICAgIHZhciBkZXBzID0gaXNQcmVzZW50KHByb3ZpZGVyLmRlcHMpID8gcHJvdmlkZXIuZGVwcyA6IHByb3ZpZGVyLnVzZUZhY3RvcnkuZGlEZXBzO1xuICAgICAgICB0cmFuc2Zvcm1lZERlcHMgPSBkZXBzLm1hcCgoZGVwKSA9PiB0aGlzLl9nZXREZXBlbmRlbmN5KGRlcCwgZWFnZXIpKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KHByb3ZpZGVyLnVzZUNsYXNzKSkge1xuICAgICAgICB2YXIgZGVwcyA9IGlzUHJlc2VudChwcm92aWRlci5kZXBzKSA/IHByb3ZpZGVyLmRlcHMgOiBwcm92aWRlci51c2VDbGFzcy5kaURlcHM7XG4gICAgICAgIHRyYW5zZm9ybWVkRGVwcyA9IGRlcHMubWFwKChkZXApID0+IHRoaXMuX2dldERlcGVuZGVuY3koZGVwLCBlYWdlcikpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF90cmFuc2Zvcm1Qcm92aWRlcihwcm92aWRlciwge1xuICAgICAgICB1c2VFeGlzdGluZzogdHJhbnNmb3JtZWRVc2VFeGlzdGluZyxcbiAgICAgICAgdXNlVmFsdWU6IHRyYW5zZm9ybWVkVXNlVmFsdWUsXG4gICAgICAgIGRlcHM6IHRyYW5zZm9ybWVkRGVwc1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdHJhbnNmb3JtZWRQcm92aWRlckFzdCA9XG4gICAgICAgIF90cmFuc2Zvcm1Qcm92aWRlckFzdChyZXNvbHZlZFByb3ZpZGVyLCB7ZWFnZXI6IGVhZ2VyLCBwcm92aWRlcnM6IHRyYW5zZm9ybWVkUHJvdmlkZXJzfSk7XG4gICAgdGhpcy5fdHJhbnNmb3JtZWRQcm92aWRlcnMuYWRkKHRva2VuLCB0cmFuc2Zvcm1lZFByb3ZpZGVyQXN0KTtcbiAgICByZXR1cm4gdHJhbnNmb3JtZWRQcm92aWRlckFzdDtcbiAgfVxuXG4gIHByaXZhdGUgX2dldERlcGVuZGVuY3koZGVwOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgZWFnZXI6IGJvb2xlYW4gPSBudWxsKTogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgICB2YXIgZm91bmRMb2NhbCA9IGZhbHNlO1xuICAgIGlmICghZGVwLmlzU2tpcFNlbGYgJiYgaXNQcmVzZW50KGRlcC50b2tlbikpIHtcbiAgICAgIC8vIGFjY2VzcyB0aGUgaW5qZWN0b3JcbiAgICAgIGlmIChkZXAudG9rZW4uZXF1YWxzVG8oaWRlbnRpZmllclRva2VuKElkZW50aWZpZXJzLkluamVjdG9yKSkpIHtcbiAgICAgICAgZm91bmRMb2NhbCA9IHRydWU7XG4gICAgICAgIC8vIGFjY2VzcyBwcm92aWRlcnNcbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KHRoaXMuX2dldE9yQ3JlYXRlTG9jYWxQcm92aWRlcihkZXAudG9rZW4sIGVhZ2VyKSkpIHtcbiAgICAgICAgZm91bmRMb2NhbCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciByZXN1bHQ6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSA9IGRlcDtcbiAgICBpZiAoZGVwLmlzU2VsZiAmJiAhZm91bmRMb2NhbCkge1xuICAgICAgaWYgKGRlcC5pc09wdGlvbmFsKSB7XG4gICAgICAgIHJlc3VsdCA9IG5ldyBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEoe2lzVmFsdWU6IHRydWUsIHZhbHVlOiBudWxsfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9lcnJvcnMucHVzaChuZXcgUHJvdmlkZXJFcnJvcihgTm8gcHJvdmlkZXIgZm9yICR7ZGVwLnRva2VuLm5hbWV9YCwgdGhpcy5fc291cmNlU3BhbikpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59XG5cblxuZnVuY3Rpb24gX3RyYW5zZm9ybVByb3ZpZGVyKFxuICAgIHByb3ZpZGVyOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YSxcbiAgICB7dXNlRXhpc3RpbmcsIHVzZVZhbHVlLCBkZXBzfTpcbiAgICAgICAge3VzZUV4aXN0aW5nOiBDb21waWxlVG9rZW5NZXRhZGF0YSwgdXNlVmFsdWU6IGFueSwgZGVwczogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW119KSB7XG4gIHJldHVybiBuZXcgQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEoe1xuICAgIHRva2VuOiBwcm92aWRlci50b2tlbixcbiAgICB1c2VDbGFzczogcHJvdmlkZXIudXNlQ2xhc3MsXG4gICAgdXNlRXhpc3Rpbmc6IHVzZUV4aXN0aW5nLFxuICAgIHVzZUZhY3Rvcnk6IHByb3ZpZGVyLnVzZUZhY3RvcnksXG4gICAgdXNlVmFsdWU6IHVzZVZhbHVlLFxuICAgIHVzZVByb3BlcnR5OiBwcm92aWRlci51c2VQcm9wZXJ0eSxcbiAgICBkZXBzOiBkZXBzLFxuICAgIG11bHRpOiBwcm92aWRlci5tdWx0aVxuICB9KTtcbn1cblxuZnVuY3Rpb24gX3RyYW5zZm9ybVByb3ZpZGVyQXN0KFxuICAgIHByb3ZpZGVyOiBQcm92aWRlckFzdCxcbiAgICB7ZWFnZXIsIHByb3ZpZGVyc306IHtlYWdlcjogYm9vbGVhbiwgcHJvdmlkZXJzOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YVtdfSk6IFByb3ZpZGVyQXN0IHtcbiAgcmV0dXJuIG5ldyBQcm92aWRlckFzdChwcm92aWRlci50b2tlbiwgcHJvdmlkZXIubXVsdGlQcm92aWRlciwgcHJvdmlkZXIuZWFnZXIgfHwgZWFnZXIsIHByb3ZpZGVycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlci5wcm92aWRlclR5cGUsIHByb3ZpZGVyLnNvdXJjZVNwYW4pO1xufVxuXG5mdW5jdGlvbiBfbm9ybWFsaXplUHJvdmlkZXJzKFxuICAgIHByb3ZpZGVyczogQXJyYXk8Q29tcGlsZVByb3ZpZGVyTWV0YWRhdGEgfCBDb21waWxlVHlwZU1ldGFkYXRhIHwgYW55W10+LFxuICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiwgdGFyZ2V0RXJyb3JzOiBQYXJzZUVycm9yW10sXG4gICAgdGFyZ2V0UHJvdmlkZXJzOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YVtdID0gbnVsbCk6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhW10ge1xuICBpZiAoaXNCbGFuayh0YXJnZXRQcm92aWRlcnMpKSB7XG4gICAgdGFyZ2V0UHJvdmlkZXJzID0gW107XG4gIH1cbiAgaWYgKGlzUHJlc2VudChwcm92aWRlcnMpKSB7XG4gICAgcHJvdmlkZXJzLmZvckVhY2goKHByb3ZpZGVyKSA9PiB7XG4gICAgICBpZiAoaXNBcnJheShwcm92aWRlcikpIHtcbiAgICAgICAgX25vcm1hbGl6ZVByb3ZpZGVycyg8YW55W10+cHJvdmlkZXIsIHNvdXJjZVNwYW4sIHRhcmdldEVycm9ycywgdGFyZ2V0UHJvdmlkZXJzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBub3JtYWxpemVQcm92aWRlcjogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGE7XG4gICAgICAgIGlmIChwcm92aWRlciBpbnN0YW5jZW9mIENvbXBpbGVQcm92aWRlck1ldGFkYXRhKSB7XG4gICAgICAgICAgbm9ybWFsaXplUHJvdmlkZXIgPSBwcm92aWRlcjtcbiAgICAgICAgfSBlbHNlIGlmIChwcm92aWRlciBpbnN0YW5jZW9mIENvbXBpbGVUeXBlTWV0YWRhdGEpIHtcbiAgICAgICAgICBub3JtYWxpemVQcm92aWRlciA9IG5ldyBDb21waWxlUHJvdmlkZXJNZXRhZGF0YShcbiAgICAgICAgICAgICAge3Rva2VuOiBuZXcgQ29tcGlsZVRva2VuTWV0YWRhdGEoe2lkZW50aWZpZXI6IHByb3ZpZGVyfSksIHVzZUNsYXNzOiBwcm92aWRlcn0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRhcmdldEVycm9ycy5wdXNoKG5ldyBQcm92aWRlckVycm9yKGBVbmtub3duIHByb3ZpZGVyIHR5cGUgJHtwcm92aWRlcn1gLCBzb3VyY2VTcGFuKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzUHJlc2VudChub3JtYWxpemVQcm92aWRlcikpIHtcbiAgICAgICAgICB0YXJnZXRQcm92aWRlcnMucHVzaChub3JtYWxpemVQcm92aWRlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICByZXR1cm4gdGFyZ2V0UHJvdmlkZXJzO1xufVxuXG5cbmZ1bmN0aW9uIF9yZXNvbHZlUHJvdmlkZXJzRnJvbURpcmVjdGl2ZXMoZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0RXJyb3JzOiBQYXJzZUVycm9yW10pOiBDb21waWxlVG9rZW5NYXA8UHJvdmlkZXJBc3Q+IHtcbiAgdmFyIHByb3ZpZGVyc0J5VG9rZW4gPSBuZXcgQ29tcGlsZVRva2VuTWFwPFByb3ZpZGVyQXN0PigpO1xuICBkaXJlY3RpdmVzLmZvckVhY2goKGRpcmVjdGl2ZSkgPT4ge1xuICAgIHZhciBkaXJQcm92aWRlciA9IG5ldyBDb21waWxlUHJvdmlkZXJNZXRhZGF0YShcbiAgICAgICAge3Rva2VuOiBuZXcgQ29tcGlsZVRva2VuTWV0YWRhdGEoe2lkZW50aWZpZXI6IGRpcmVjdGl2ZS50eXBlfSksIHVzZUNsYXNzOiBkaXJlY3RpdmUudHlwZX0pO1xuICAgIF9yZXNvbHZlUHJvdmlkZXJzKFtkaXJQcm92aWRlcl0sXG4gICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlLmlzQ29tcG9uZW50ID8gUHJvdmlkZXJBc3RUeXBlLkNvbXBvbmVudCA6IFByb3ZpZGVyQXN0VHlwZS5EaXJlY3RpdmUsXG4gICAgICAgICAgICAgICAgICAgICAgdHJ1ZSwgc291cmNlU3BhbiwgdGFyZ2V0RXJyb3JzLCBwcm92aWRlcnNCeVRva2VuKTtcbiAgfSk7XG5cbiAgLy8gTm90ZTogZGlyZWN0aXZlcyBuZWVkIHRvIGJlIGFibGUgdG8gb3ZlcndyaXRlIHByb3ZpZGVycyBvZiBhIGNvbXBvbmVudCFcbiAgdmFyIGRpcmVjdGl2ZXNXaXRoQ29tcG9uZW50Rmlyc3QgPVxuICAgICAgZGlyZWN0aXZlcy5maWx0ZXIoZGlyID0+IGRpci5pc0NvbXBvbmVudCkuY29uY2F0KGRpcmVjdGl2ZXMuZmlsdGVyKGRpciA9PiAhZGlyLmlzQ29tcG9uZW50KSk7XG4gIGRpcmVjdGl2ZXNXaXRoQ29tcG9uZW50Rmlyc3QuZm9yRWFjaCgoZGlyZWN0aXZlKSA9PiB7XG4gICAgX3Jlc29sdmVQcm92aWRlcnMoX25vcm1hbGl6ZVByb3ZpZGVycyhkaXJlY3RpdmUucHJvdmlkZXJzLCBzb3VyY2VTcGFuLCB0YXJnZXRFcnJvcnMpLFxuICAgICAgICAgICAgICAgICAgICAgIFByb3ZpZGVyQXN0VHlwZS5QdWJsaWNTZXJ2aWNlLCBmYWxzZSwgc291cmNlU3BhbiwgdGFyZ2V0RXJyb3JzLFxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyc0J5VG9rZW4pO1xuICAgIF9yZXNvbHZlUHJvdmlkZXJzKF9ub3JtYWxpemVQcm92aWRlcnMoZGlyZWN0aXZlLnZpZXdQcm92aWRlcnMsIHNvdXJjZVNwYW4sIHRhcmdldEVycm9ycyksXG4gICAgICAgICAgICAgICAgICAgICAgUHJvdmlkZXJBc3RUeXBlLlByaXZhdGVTZXJ2aWNlLCBmYWxzZSwgc291cmNlU3BhbiwgdGFyZ2V0RXJyb3JzLFxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyc0J5VG9rZW4pO1xuICB9KTtcbiAgcmV0dXJuIHByb3ZpZGVyc0J5VG9rZW47XG59XG5cbmZ1bmN0aW9uIF9yZXNvbHZlUHJvdmlkZXJzKHByb3ZpZGVyczogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXSwgcHJvdmlkZXJUeXBlOiBQcm92aWRlckFzdFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBlYWdlcjogYm9vbGVhbiwgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLCB0YXJnZXRFcnJvcnM6IFBhcnNlRXJyb3JbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3ZpZGVyc0J5VG9rZW46IENvbXBpbGVUb2tlbk1hcDxQcm92aWRlckFzdD4pIHtcbiAgcHJvdmlkZXJzLmZvckVhY2goKHByb3ZpZGVyKSA9PiB7XG4gICAgdmFyIHJlc29sdmVkUHJvdmlkZXIgPSB0YXJnZXRQcm92aWRlcnNCeVRva2VuLmdldChwcm92aWRlci50b2tlbik7XG4gICAgaWYgKGlzUHJlc2VudChyZXNvbHZlZFByb3ZpZGVyKSAmJiByZXNvbHZlZFByb3ZpZGVyLm11bHRpUHJvdmlkZXIgIT09IHByb3ZpZGVyLm11bHRpKSB7XG4gICAgICB0YXJnZXRFcnJvcnMucHVzaChuZXcgUHJvdmlkZXJFcnJvcihcbiAgICAgICAgICBgTWl4aW5nIG11bHRpIGFuZCBub24gbXVsdGkgcHJvdmlkZXIgaXMgbm90IHBvc3NpYmxlIGZvciB0b2tlbiAke3Jlc29sdmVkUHJvdmlkZXIudG9rZW4ubmFtZX1gLFxuICAgICAgICAgIHNvdXJjZVNwYW4pKTtcbiAgICB9XG4gICAgaWYgKGlzQmxhbmsocmVzb2x2ZWRQcm92aWRlcikpIHtcbiAgICAgIHJlc29sdmVkUHJvdmlkZXIgPSBuZXcgUHJvdmlkZXJBc3QocHJvdmlkZXIudG9rZW4sIHByb3ZpZGVyLm11bHRpLCBlYWdlciwgW3Byb3ZpZGVyXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJUeXBlLCBzb3VyY2VTcGFuKTtcbiAgICAgIHRhcmdldFByb3ZpZGVyc0J5VG9rZW4uYWRkKHByb3ZpZGVyLnRva2VuLCByZXNvbHZlZFByb3ZpZGVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFwcm92aWRlci5tdWx0aSkge1xuICAgICAgICBMaXN0V3JhcHBlci5jbGVhcihyZXNvbHZlZFByb3ZpZGVyLnByb3ZpZGVycyk7XG4gICAgICB9XG4gICAgICByZXNvbHZlZFByb3ZpZGVyLnByb3ZpZGVycy5wdXNoKHByb3ZpZGVyKTtcbiAgICB9XG4gIH0pO1xufVxuXG5cbmZ1bmN0aW9uIF9nZXRWaWV3UXVlcmllcyhcbiAgICBjb21wb25lbnQ6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSk6IENvbXBpbGVUb2tlbk1hcDxDb21waWxlUXVlcnlNZXRhZGF0YVtdPiB7XG4gIHZhciB2aWV3UXVlcmllcyA9IG5ldyBDb21waWxlVG9rZW5NYXA8Q29tcGlsZVF1ZXJ5TWV0YWRhdGFbXT4oKTtcbiAgaWYgKGlzUHJlc2VudChjb21wb25lbnQudmlld1F1ZXJpZXMpKSB7XG4gICAgY29tcG9uZW50LnZpZXdRdWVyaWVzLmZvckVhY2goKHF1ZXJ5KSA9PiBfYWRkUXVlcnlUb1Rva2VuTWFwKHZpZXdRdWVyaWVzLCBxdWVyeSkpO1xuICB9XG4gIGNvbXBvbmVudC50eXBlLmRpRGVwcy5mb3JFYWNoKChkZXApID0+IHtcbiAgICBpZiAoaXNQcmVzZW50KGRlcC52aWV3UXVlcnkpKSB7XG4gICAgICBfYWRkUXVlcnlUb1Rva2VuTWFwKHZpZXdRdWVyaWVzLCBkZXAudmlld1F1ZXJ5KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gdmlld1F1ZXJpZXM7XG59XG5cbmZ1bmN0aW9uIF9nZXRDb250ZW50UXVlcmllcyhcbiAgICBkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSk6IENvbXBpbGVUb2tlbk1hcDxDb21waWxlUXVlcnlNZXRhZGF0YVtdPiB7XG4gIHZhciBjb250ZW50UXVlcmllcyA9IG5ldyBDb21waWxlVG9rZW5NYXA8Q29tcGlsZVF1ZXJ5TWV0YWRhdGFbXT4oKTtcbiAgZGlyZWN0aXZlcy5mb3JFYWNoKGRpcmVjdGl2ZSA9PiB7XG4gICAgaWYgKGlzUHJlc2VudChkaXJlY3RpdmUucXVlcmllcykpIHtcbiAgICAgIGRpcmVjdGl2ZS5xdWVyaWVzLmZvckVhY2goKHF1ZXJ5KSA9PiBfYWRkUXVlcnlUb1Rva2VuTWFwKGNvbnRlbnRRdWVyaWVzLCBxdWVyeSkpO1xuICAgIH1cbiAgICBkaXJlY3RpdmUudHlwZS5kaURlcHMuZm9yRWFjaCgoZGVwKSA9PiB7XG4gICAgICBpZiAoaXNQcmVzZW50KGRlcC5xdWVyeSkpIHtcbiAgICAgICAgX2FkZFF1ZXJ5VG9Ub2tlbk1hcChjb250ZW50UXVlcmllcywgZGVwLnF1ZXJ5KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBjb250ZW50UXVlcmllcztcbn1cblxuZnVuY3Rpb24gX2FkZFF1ZXJ5VG9Ub2tlbk1hcChtYXA6IENvbXBpbGVUb2tlbk1hcDxDb21waWxlUXVlcnlNZXRhZGF0YVtdPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnk6IENvbXBpbGVRdWVyeU1ldGFkYXRhKSB7XG4gIHF1ZXJ5LnNlbGVjdG9ycy5mb3JFYWNoKCh0b2tlbjogQ29tcGlsZVRva2VuTWV0YWRhdGEpID0+IHtcbiAgICB2YXIgZW50cnkgPSBtYXAuZ2V0KHRva2VuKTtcbiAgICBpZiAoaXNCbGFuayhlbnRyeSkpIHtcbiAgICAgIGVudHJ5ID0gW107XG4gICAgICBtYXAuYWRkKHRva2VuLCBlbnRyeSk7XG4gICAgfVxuICAgIGVudHJ5LnB1c2gocXVlcnkpO1xuICB9KTtcbn1cbiJdfQ==