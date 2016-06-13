'use strict';"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var exceptions_1 = require('angular2/src/facade/exceptions');
var reflective_exceptions_1 = require('angular2/src/core/di/reflective_exceptions');
var cpl = require('./compile_metadata');
var md = require('angular2/src/core/metadata/directives');
var dimd = require('angular2/src/core/metadata/di');
var directive_resolver_1 = require('./directive_resolver');
var pipe_resolver_1 = require('./pipe_resolver');
var view_resolver_1 = require('./view_resolver');
var directive_lifecycle_reflector_1 = require('./directive_lifecycle_reflector');
var lifecycle_hooks_1 = require('angular2/src/core/metadata/lifecycle_hooks');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var di_2 = require('angular2/src/core/di');
var platform_directives_and_pipes_1 = require('angular2/src/core/platform_directives_and_pipes');
var util_1 = require('./util');
var assertions_1 = require('./assertions');
var url_resolver_1 = require('angular2/src/compiler/url_resolver');
var provider_1 = require('angular2/src/core/di/provider');
var reflective_provider_1 = require('angular2/src/core/di/reflective_provider');
var metadata_1 = require('angular2/src/core/di/metadata');
var di_3 = require('angular2/src/core/metadata/di');
var RuntimeMetadataResolver = (function () {
    function RuntimeMetadataResolver(_directiveResolver, _pipeResolver, _viewResolver, _platformDirectives, _platformPipes) {
        this._directiveResolver = _directiveResolver;
        this._pipeResolver = _pipeResolver;
        this._viewResolver = _viewResolver;
        this._platformDirectives = _platformDirectives;
        this._platformPipes = _platformPipes;
        this._directiveCache = new Map();
        this._pipeCache = new Map();
        this._anonymousTypes = new Map();
        this._anonymousTypeIndex = 0;
    }
    RuntimeMetadataResolver.prototype.sanitizeTokenName = function (token) {
        var identifier = lang_1.stringify(token);
        if (identifier.indexOf('(') >= 0) {
            // case: anonymous functions!
            var found = this._anonymousTypes.get(token);
            if (lang_1.isBlank(found)) {
                this._anonymousTypes.set(token, this._anonymousTypeIndex++);
                found = this._anonymousTypes.get(token);
            }
            identifier = "anonymous_token_" + found + "_";
        }
        return util_1.sanitizeIdentifier(identifier);
    };
    RuntimeMetadataResolver.prototype.getDirectiveMetadata = function (directiveType) {
        var meta = this._directiveCache.get(directiveType);
        if (lang_1.isBlank(meta)) {
            var dirMeta = this._directiveResolver.resolve(directiveType);
            var moduleUrl = null;
            var templateMeta = null;
            var changeDetectionStrategy = null;
            var viewProviders = [];
            if (dirMeta instanceof md.ComponentMetadata) {
                assertions_1.assertArrayOfStrings('styles', dirMeta.styles);
                var cmpMeta = dirMeta;
                moduleUrl = calcModuleUrl(directiveType, cmpMeta);
                var viewMeta = this._viewResolver.resolve(directiveType);
                assertions_1.assertArrayOfStrings('styles', viewMeta.styles);
                templateMeta = new cpl.CompileTemplateMetadata({
                    encapsulation: viewMeta.encapsulation,
                    template: viewMeta.template,
                    templateUrl: viewMeta.templateUrl,
                    styles: viewMeta.styles,
                    styleUrls: viewMeta.styleUrls
                });
                changeDetectionStrategy = cmpMeta.changeDetection;
                if (lang_1.isPresent(dirMeta.viewProviders)) {
                    viewProviders = this.getProvidersMetadata(dirMeta.viewProviders);
                }
            }
            var providers = [];
            if (lang_1.isPresent(dirMeta.providers)) {
                providers = this.getProvidersMetadata(dirMeta.providers);
            }
            var queries = [];
            var viewQueries = [];
            if (lang_1.isPresent(dirMeta.queries)) {
                queries = this.getQueriesMetadata(dirMeta.queries, false);
                viewQueries = this.getQueriesMetadata(dirMeta.queries, true);
            }
            meta = cpl.CompileDirectiveMetadata.create({
                selector: dirMeta.selector,
                exportAs: dirMeta.exportAs,
                isComponent: lang_1.isPresent(templateMeta),
                type: this.getTypeMetadata(directiveType, moduleUrl),
                template: templateMeta,
                changeDetection: changeDetectionStrategy,
                inputs: dirMeta.inputs,
                outputs: dirMeta.outputs,
                host: dirMeta.host,
                lifecycleHooks: lifecycle_hooks_1.LIFECYCLE_HOOKS_VALUES.filter(function (hook) { return directive_lifecycle_reflector_1.hasLifecycleHook(hook, directiveType); }),
                providers: providers,
                viewProviders: viewProviders,
                queries: queries,
                viewQueries: viewQueries
            });
            this._directiveCache.set(directiveType, meta);
        }
        return meta;
    };
    RuntimeMetadataResolver.prototype.getTypeMetadata = function (type, moduleUrl) {
        return new cpl.CompileTypeMetadata({
            name: this.sanitizeTokenName(type),
            moduleUrl: moduleUrl,
            runtime: type,
            diDeps: this.getDependenciesMetadata(type, null)
        });
    };
    RuntimeMetadataResolver.prototype.getFactoryMetadata = function (factory, moduleUrl) {
        return new cpl.CompileFactoryMetadata({
            name: this.sanitizeTokenName(factory),
            moduleUrl: moduleUrl,
            runtime: factory,
            diDeps: this.getDependenciesMetadata(factory, null)
        });
    };
    RuntimeMetadataResolver.prototype.getPipeMetadata = function (pipeType) {
        var meta = this._pipeCache.get(pipeType);
        if (lang_1.isBlank(meta)) {
            var pipeMeta = this._pipeResolver.resolve(pipeType);
            var moduleUrl = reflection_1.reflector.importUri(pipeType);
            meta = new cpl.CompilePipeMetadata({
                type: this.getTypeMetadata(pipeType, moduleUrl),
                name: pipeMeta.name,
                pure: pipeMeta.pure,
                lifecycleHooks: lifecycle_hooks_1.LIFECYCLE_HOOKS_VALUES.filter(function (hook) { return directive_lifecycle_reflector_1.hasLifecycleHook(hook, pipeType); }),
            });
            this._pipeCache.set(pipeType, meta);
        }
        return meta;
    };
    RuntimeMetadataResolver.prototype.getViewDirectivesMetadata = function (component) {
        var _this = this;
        var view = this._viewResolver.resolve(component);
        var directives = flattenDirectives(view, this._platformDirectives);
        for (var i = 0; i < directives.length; i++) {
            if (!isValidType(directives[i])) {
                throw new exceptions_1.BaseException("Unexpected directive value '" + lang_1.stringify(directives[i]) + "' on the View of component '" + lang_1.stringify(component) + "'");
            }
        }
        return directives.map(function (type) { return _this.getDirectiveMetadata(type); });
    };
    RuntimeMetadataResolver.prototype.getViewPipesMetadata = function (component) {
        var _this = this;
        var view = this._viewResolver.resolve(component);
        var pipes = flattenPipes(view, this._platformPipes);
        for (var i = 0; i < pipes.length; i++) {
            if (!isValidType(pipes[i])) {
                throw new exceptions_1.BaseException("Unexpected piped value '" + lang_1.stringify(pipes[i]) + "' on the View of component '" + lang_1.stringify(component) + "'");
            }
        }
        return pipes.map(function (type) { return _this.getPipeMetadata(type); });
    };
    RuntimeMetadataResolver.prototype.getDependenciesMetadata = function (typeOrFunc, dependencies) {
        var _this = this;
        var deps;
        try {
            deps = reflective_provider_1.constructDependencies(typeOrFunc, dependencies);
        }
        catch (e) {
            if (e instanceof reflective_exceptions_1.NoAnnotationError) {
                deps = [];
            }
            else {
                throw e;
            }
        }
        return deps.map(function (dep) {
            var compileToken;
            var p = dep.properties.find(function (p) { return p instanceof di_3.AttributeMetadata; });
            var isAttribute = false;
            if (lang_1.isPresent(p)) {
                compileToken = _this.getTokenMetadata(p.attributeName);
                isAttribute = true;
            }
            else {
                compileToken = _this.getTokenMetadata(dep.key.token);
            }
            var compileQuery = null;
            var q = dep.properties.find(function (p) { return p instanceof dimd.QueryMetadata; });
            if (lang_1.isPresent(q)) {
                compileQuery = _this.getQueryMetadata(q, null);
            }
            return new cpl.CompileDiDependencyMetadata({
                isAttribute: isAttribute,
                isHost: dep.upperBoundVisibility instanceof metadata_1.HostMetadata,
                isSelf: dep.upperBoundVisibility instanceof metadata_1.SelfMetadata,
                isSkipSelf: dep.lowerBoundVisibility instanceof metadata_1.SkipSelfMetadata,
                isOptional: dep.optional,
                query: lang_1.isPresent(q) && !q.isViewQuery ? compileQuery : null,
                viewQuery: lang_1.isPresent(q) && q.isViewQuery ? compileQuery : null,
                token: compileToken
            });
        });
    };
    RuntimeMetadataResolver.prototype.getTokenMetadata = function (token) {
        token = di_1.resolveForwardRef(token);
        var compileToken;
        if (lang_1.isString(token)) {
            compileToken = new cpl.CompileTokenMetadata({ value: token });
        }
        else {
            compileToken = new cpl.CompileTokenMetadata({
                identifier: new cpl.CompileIdentifierMetadata({ runtime: token, name: this.sanitizeTokenName(token) })
            });
        }
        return compileToken;
    };
    RuntimeMetadataResolver.prototype.getProvidersMetadata = function (providers) {
        var _this = this;
        return providers.map(function (provider) {
            provider = di_1.resolveForwardRef(provider);
            if (lang_1.isArray(provider)) {
                return _this.getProvidersMetadata(provider);
            }
            else if (provider instanceof provider_1.Provider) {
                return _this.getProviderMetadata(provider);
            }
            else {
                return _this.getTypeMetadata(provider, null);
            }
        });
    };
    RuntimeMetadataResolver.prototype.getProviderMetadata = function (provider) {
        var compileDeps;
        if (lang_1.isPresent(provider.useClass)) {
            compileDeps = this.getDependenciesMetadata(provider.useClass, provider.dependencies);
        }
        else if (lang_1.isPresent(provider.useFactory)) {
            compileDeps = this.getDependenciesMetadata(provider.useFactory, provider.dependencies);
        }
        return new cpl.CompileProviderMetadata({
            token: this.getTokenMetadata(provider.token),
            useClass: lang_1.isPresent(provider.useClass) ? this.getTypeMetadata(provider.useClass, null) : null,
            useValue: lang_1.isPresent(provider.useValue) ?
                new cpl.CompileIdentifierMetadata({ runtime: provider.useValue }) :
                null,
            useFactory: lang_1.isPresent(provider.useFactory) ?
                this.getFactoryMetadata(provider.useFactory, null) :
                null,
            useExisting: lang_1.isPresent(provider.useExisting) ? this.getTokenMetadata(provider.useExisting) :
                null,
            deps: compileDeps,
            multi: provider.multi
        });
    };
    RuntimeMetadataResolver.prototype.getQueriesMetadata = function (queries, isViewQuery) {
        var _this = this;
        var compileQueries = [];
        collection_1.StringMapWrapper.forEach(queries, function (query, propertyName) {
            if (query.isViewQuery === isViewQuery) {
                compileQueries.push(_this.getQueryMetadata(query, propertyName));
            }
        });
        return compileQueries;
    };
    RuntimeMetadataResolver.prototype.getQueryMetadata = function (q, propertyName) {
        var _this = this;
        var selectors;
        if (q.isVarBindingQuery) {
            selectors = q.varBindings.map(function (varName) { return _this.getTokenMetadata(varName); });
        }
        else {
            selectors = [this.getTokenMetadata(q.selector)];
        }
        return new cpl.CompileQueryMetadata({
            selectors: selectors,
            first: q.first,
            descendants: q.descendants,
            propertyName: propertyName,
            read: lang_1.isPresent(q.read) ? this.getTokenMetadata(q.read) : null
        });
    };
    RuntimeMetadataResolver = __decorate([
        di_2.Injectable(),
        __param(3, di_2.Optional()),
        __param(3, di_2.Inject(platform_directives_and_pipes_1.PLATFORM_DIRECTIVES)),
        __param(4, di_2.Optional()),
        __param(4, di_2.Inject(platform_directives_and_pipes_1.PLATFORM_PIPES)), 
        __metadata('design:paramtypes', [directive_resolver_1.DirectiveResolver, pipe_resolver_1.PipeResolver, view_resolver_1.ViewResolver, Array, Array])
    ], RuntimeMetadataResolver);
    return RuntimeMetadataResolver;
}());
exports.RuntimeMetadataResolver = RuntimeMetadataResolver;
function flattenDirectives(view, platformDirectives) {
    var directives = [];
    if (lang_1.isPresent(platformDirectives)) {
        flattenArray(platformDirectives, directives);
    }
    if (lang_1.isPresent(view.directives)) {
        flattenArray(view.directives, directives);
    }
    return directives;
}
function flattenPipes(view, platformPipes) {
    var pipes = [];
    if (lang_1.isPresent(platformPipes)) {
        flattenArray(platformPipes, pipes);
    }
    if (lang_1.isPresent(view.pipes)) {
        flattenArray(view.pipes, pipes);
    }
    return pipes;
}
function flattenArray(tree, out) {
    for (var i = 0; i < tree.length; i++) {
        var item = di_1.resolveForwardRef(tree[i]);
        if (lang_1.isArray(item)) {
            flattenArray(item, out);
        }
        else {
            out.push(item);
        }
    }
}
function isValidType(value) {
    return lang_1.isPresent(value) && (value instanceof lang_1.Type);
}
function calcModuleUrl(type, cmpMetadata) {
    var moduleId = cmpMetadata.moduleId;
    if (lang_1.isPresent(moduleId)) {
        var scheme = url_resolver_1.getUrlScheme(moduleId);
        return lang_1.isPresent(scheme) && scheme.length > 0 ? moduleId :
            "package:" + moduleId + util_1.MODULE_SUFFIX;
    }
    else {
        return reflection_1.reflector.importUri(type);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZV9tZXRhZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtRjY0QmNTODIudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9ydW50aW1lX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQkFBZ0Msc0JBQXNCLENBQUMsQ0FBQTtBQUN2RCxxQkFTTywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xDLDJCQUErQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ2hFLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELHNDQUFnQyw0Q0FBNEMsQ0FBQyxDQUFBO0FBQzdFLElBQVksR0FBRyxXQUFNLG9CQUFvQixDQUFDLENBQUE7QUFDMUMsSUFBWSxFQUFFLFdBQU0sdUNBQXVDLENBQUMsQ0FBQTtBQUM1RCxJQUFZLElBQUksV0FBTSwrQkFBK0IsQ0FBQyxDQUFBO0FBQ3RELG1DQUFnQyxzQkFBc0IsQ0FBQyxDQUFBO0FBQ3ZELDhCQUEyQixpQkFBaUIsQ0FBQyxDQUFBO0FBQzdDLDhCQUEyQixpQkFBaUIsQ0FBQyxDQUFBO0FBRTdDLDhDQUErQixpQ0FBaUMsQ0FBQyxDQUFBO0FBQ2pFLGdDQUFxRCw0Q0FBNEMsQ0FBQyxDQUFBO0FBQ2xHLDJCQUF3Qix5Q0FBeUMsQ0FBQyxDQUFBO0FBQ2xFLG1CQUEyQyxzQkFBc0IsQ0FBQyxDQUFBO0FBQ2xFLDhDQUFrRCxpREFBaUQsQ0FBQyxDQUFBO0FBQ3BHLHFCQUFnRCxRQUFRLENBQUMsQ0FBQTtBQUN6RCwyQkFBbUMsY0FBYyxDQUFDLENBQUE7QUFDbEQsNkJBQTJCLG9DQUFvQyxDQUFDLENBQUE7QUFDaEUseUJBQXVCLCtCQUErQixDQUFDLENBQUE7QUFDdkQsb0NBR08sMENBQTBDLENBQUMsQ0FBQTtBQUNsRCx5QkFLTywrQkFBK0IsQ0FBQyxDQUFBO0FBQ3ZDLG1CQUFnQywrQkFBK0IsQ0FBQyxD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LE1BQU0sQ0FBQyxzQkFBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuQyxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7cmVzb2x2ZUZvcndhcmRSZWZ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7XG4gIFR5cGUsXG4gIGlzQmxhbmssXG4gIGlzUHJlc2VudCxcbiAgaXNBcnJheSxcbiAgc3RyaW5naWZ5LFxuICBpc1N0cmluZyxcbiAgUmVnRXhwV3JhcHBlcixcbiAgU3RyaW5nV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtOb0Fubm90YXRpb25FcnJvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvcmVmbGVjdGl2ZV9leGNlcHRpb25zJztcbmltcG9ydCAqIGFzIGNwbCBmcm9tICcuL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0ICogYXMgbWQgZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvZGlyZWN0aXZlcyc7XG5pbXBvcnQgKiBhcyBkaW1kIGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL2RpJztcbmltcG9ydCB7RGlyZWN0aXZlUmVzb2x2ZXJ9IGZyb20gJy4vZGlyZWN0aXZlX3Jlc29sdmVyJztcbmltcG9ydCB7UGlwZVJlc29sdmVyfSBmcm9tICcuL3BpcGVfcmVzb2x2ZXInO1xuaW1wb3J0IHtWaWV3UmVzb2x2ZXJ9IGZyb20gJy4vdmlld19yZXNvbHZlcic7XG5pbXBvcnQge1ZpZXdNZXRhZGF0YX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvdmlldyc7XG5pbXBvcnQge2hhc0xpZmVjeWNsZUhvb2t9IGZyb20gJy4vZGlyZWN0aXZlX2xpZmVjeWNsZV9yZWZsZWN0b3InO1xuaW1wb3J0IHtMaWZlY3ljbGVIb29rcywgTElGRUNZQ0xFX0hPT0tTX1ZBTFVFU30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvbGlmZWN5Y2xlX2hvb2tzJztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBJbmplY3QsIE9wdGlvbmFsfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1BMQVRGT1JNX0RJUkVDVElWRVMsIFBMQVRGT1JNX1BJUEVTfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9wbGF0Zm9ybV9kaXJlY3RpdmVzX2FuZF9waXBlcyc7XG5pbXBvcnQge01PRFVMRV9TVUZGSVgsIHNhbml0aXplSWRlbnRpZmllcn0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7YXNzZXJ0QXJyYXlPZlN0cmluZ3N9IGZyb20gJy4vYXNzZXJ0aW9ucyc7XG5pbXBvcnQge2dldFVybFNjaGVtZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3VybF9yZXNvbHZlcic7XG5pbXBvcnQge1Byb3ZpZGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9wcm92aWRlcic7XG5pbXBvcnQge1xuICBjb25zdHJ1Y3REZXBlbmRlbmNpZXMsXG4gIFJlZmxlY3RpdmVEZXBlbmRlbmN5XG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpL3JlZmxlY3RpdmVfcHJvdmlkZXInO1xuaW1wb3J0IHtcbiAgT3B0aW9uYWxNZXRhZGF0YSxcbiAgU2VsZk1ldGFkYXRhLFxuICBIb3N0TWV0YWRhdGEsXG4gIFNraXBTZWxmTWV0YWRhdGFcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvbWV0YWRhdGEnO1xuaW1wb3J0IHtBdHRyaWJ1dGVNZXRhZGF0YX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvZGknO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUnVudGltZU1ldGFkYXRhUmVzb2x2ZXIge1xuICBwcml2YXRlIF9kaXJlY3RpdmVDYWNoZSA9IG5ldyBNYXA8VHlwZSwgY3BsLkNvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YT4oKTtcbiAgcHJpdmF0ZSBfcGlwZUNhY2hlID0gbmV3IE1hcDxUeXBlLCBjcGwuQ29tcGlsZVBpcGVNZXRhZGF0YT4oKTtcbiAgcHJpdmF0ZSBfYW5vbnltb3VzVHlwZXMgPSBuZXcgTWFwPE9iamVjdCwgbnVtYmVyPigpO1xuICBwcml2YXRlIF9hbm9ueW1vdXNUeXBlSW5kZXggPSAwO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2RpcmVjdGl2ZVJlc29sdmVyOiBEaXJlY3RpdmVSZXNvbHZlciwgcHJpdmF0ZSBfcGlwZVJlc29sdmVyOiBQaXBlUmVzb2x2ZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgX3ZpZXdSZXNvbHZlcjogVmlld1Jlc29sdmVyLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFBMQVRGT1JNX0RJUkVDVElWRVMpIHByaXZhdGUgX3BsYXRmb3JtRGlyZWN0aXZlczogVHlwZVtdLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFBMQVRGT1JNX1BJUEVTKSBwcml2YXRlIF9wbGF0Zm9ybVBpcGVzOiBUeXBlW10pIHt9XG5cbiAgcHJpdmF0ZSBzYW5pdGl6ZVRva2VuTmFtZSh0b2tlbjogYW55KTogc3RyaW5nIHtcbiAgICBsZXQgaWRlbnRpZmllciA9IHN0cmluZ2lmeSh0b2tlbik7XG4gICAgaWYgKGlkZW50aWZpZXIuaW5kZXhPZignKCcpID49IDApIHtcbiAgICAgIC8vIGNhc2U6IGFub255bW91cyBmdW5jdGlvbnMhXG4gICAgICBsZXQgZm91bmQgPSB0aGlzLl9hbm9ueW1vdXNUeXBlcy5nZXQodG9rZW4pO1xuICAgICAgaWYgKGlzQmxhbmsoZm91bmQpKSB7XG4gICAgICAgIHRoaXMuX2Fub255bW91c1R5cGVzLnNldCh0b2tlbiwgdGhpcy5fYW5vbnltb3VzVHlwZUluZGV4KyspO1xuICAgICAgICBmb3VuZCA9IHRoaXMuX2Fub255bW91c1R5cGVzLmdldCh0b2tlbik7XG4gICAgICB9XG4gICAgICBpZGVudGlmaWVyID0gYGFub255bW91c190b2tlbl8ke2ZvdW5kfV9gO1xuICAgIH1cbiAgICByZXR1cm4gc2FuaXRpemVJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICB9XG5cbiAgZ2V0RGlyZWN0aXZlTWV0YWRhdGEoZGlyZWN0aXZlVHlwZTogVHlwZSk6IGNwbC5Db21waWxlRGlyZWN0aXZlTWV0YWRhdGEge1xuICAgIHZhciBtZXRhID0gdGhpcy5fZGlyZWN0aXZlQ2FjaGUuZ2V0KGRpcmVjdGl2ZVR5cGUpO1xuICAgIGlmIChpc0JsYW5rKG1ldGEpKSB7XG4gICAgICB2YXIgZGlyTWV0YSA9IHRoaXMuX2RpcmVjdGl2ZVJlc29sdmVyLnJlc29sdmUoZGlyZWN0aXZlVHlwZSk7XG4gICAgICB2YXIgbW9kdWxlVXJsID0gbnVsbDtcbiAgICAgIHZhciB0ZW1wbGF0ZU1ldGEgPSBudWxsO1xuICAgICAgdmFyIGNoYW5nZURldGVjdGlvblN0cmF0ZWd5ID0gbnVsbDtcbiAgICAgIHZhciB2aWV3UHJvdmlkZXJzID0gW107XG5cbiAgICAgIGlmIChkaXJNZXRhIGluc3RhbmNlb2YgbWQuQ29tcG9uZW50TWV0YWRhdGEpIHtcbiAgICAgICAgYXNzZXJ0QXJyYXlPZlN0cmluZ3MoJ3N0eWxlcycsIGRpck1ldGEuc3R5bGVzKTtcbiAgICAgICAgdmFyIGNtcE1ldGEgPSA8bWQuQ29tcG9uZW50TWV0YWRhdGE+ZGlyTWV0YTtcbiAgICAgICAgbW9kdWxlVXJsID0gY2FsY01vZHVsZVVybChkaXJlY3RpdmVUeXBlLCBjbXBNZXRhKTtcbiAgICAgICAgdmFyIHZpZXdNZXRhID0gdGhpcy5fdmlld1Jlc29sdmVyLnJlc29sdmUoZGlyZWN0aXZlVHlwZSk7XG4gICAgICAgIGFzc2VydEFycmF5T2ZTdHJpbmdzKCdzdHlsZXMnLCB2aWV3TWV0YS5zdHlsZXMpO1xuICAgICAgICB0ZW1wbGF0ZU1ldGEgPSBuZXcgY3BsLkNvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhKHtcbiAgICAgICAgICBlbmNhcHN1bGF0aW9uOiB2aWV3TWV0YS5lbmNhcHN1bGF0aW9uLFxuICAgICAgICAgIHRlbXBsYXRlOiB2aWV3TWV0YS50ZW1wbGF0ZSxcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogdmlld01ldGEudGVtcGxhdGVVcmwsXG4gICAgICAgICAgc3R5bGVzOiB2aWV3TWV0YS5zdHlsZXMsXG4gICAgICAgICAgc3R5bGVVcmxzOiB2aWV3TWV0YS5zdHlsZVVybHNcbiAgICAgICAgfSk7XG4gICAgICAgIGNoYW5nZURldGVjdGlvblN0cmF0ZWd5ID0gY21wTWV0YS5jaGFuZ2VEZXRlY3Rpb247XG4gICAgICAgIGlmIChpc1ByZXNlbnQoZGlyTWV0YS52aWV3UHJvdmlkZXJzKSkge1xuICAgICAgICAgIHZpZXdQcm92aWRlcnMgPSB0aGlzLmdldFByb3ZpZGVyc01ldGFkYXRhKGRpck1ldGEudmlld1Byb3ZpZGVycyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIHByb3ZpZGVycyA9IFtdO1xuICAgICAgaWYgKGlzUHJlc2VudChkaXJNZXRhLnByb3ZpZGVycykpIHtcbiAgICAgICAgcHJvdmlkZXJzID0gdGhpcy5nZXRQcm92aWRlcnNNZXRhZGF0YShkaXJNZXRhLnByb3ZpZGVycyk7XG4gICAgICB9XG4gICAgICB2YXIgcXVlcmllcyA9IFtdO1xuICAgICAgdmFyIHZpZXdRdWVyaWVzID0gW107XG4gICAgICBpZiAoaXNQcmVzZW50KGRpck1ldGEucXVlcmllcykpIHtcbiAgICAgICAgcXVlcmllcyA9IHRoaXMuZ2V0UXVlcmllc01ldGFkYXRhKGRpck1ldGEucXVlcmllcywgZmFsc2UpO1xuICAgICAgICB2aWV3UXVlcmllcyA9IHRoaXMuZ2V0UXVlcmllc01ldGFkYXRhKGRpck1ldGEucXVlcmllcywgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBtZXRhID0gY3BsLkNvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YS5jcmVhdGUoe1xuICAgICAgICBzZWxlY3RvcjogZGlyTWV0YS5zZWxlY3RvcixcbiAgICAgICAgZXhwb3J0QXM6IGRpck1ldGEuZXhwb3J0QXMsXG4gICAgICAgIGlzQ29tcG9uZW50OiBpc1ByZXNlbnQodGVtcGxhdGVNZXRhKSxcbiAgICAgICAgdHlwZTogdGhpcy5nZXRUeXBlTWV0YWRhdGEoZGlyZWN0aXZlVHlwZSwgbW9kdWxlVXJsKSxcbiAgICAgICAgdGVtcGxhdGU6IHRlbXBsYXRlTWV0YSxcbiAgICAgICAgY2hhbmdlRGV0ZWN0aW9uOiBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgICAgICAgaW5wdXRzOiBkaXJNZXRhLmlucHV0cyxcbiAgICAgICAgb3V0cHV0czogZGlyTWV0YS5vdXRwdXRzLFxuICAgICAgICBob3N0OiBkaXJNZXRhLmhvc3QsXG4gICAgICAgIGxpZmVjeWNsZUhvb2tzOlxuICAgICAgICAgICAgTElGRUNZQ0xFX0hPT0tTX1ZBTFVFUy5maWx0ZXIoaG9vayA9PiBoYXNMaWZlY3ljbGVIb29rKGhvb2ssIGRpcmVjdGl2ZVR5cGUpKSxcbiAgICAgICAgcHJvdmlkZXJzOiBwcm92aWRlcnMsXG4gICAgICAgIHZpZXdQcm92aWRlcnM6IHZpZXdQcm92aWRlcnMsXG4gICAgICAgIHF1ZXJpZXM6IHF1ZXJpZXMsXG4gICAgICAgIHZpZXdRdWVyaWVzOiB2aWV3UXVlcmllc1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9kaXJlY3RpdmVDYWNoZS5zZXQoZGlyZWN0aXZlVHlwZSwgbWV0YSk7XG4gICAgfVxuICAgIHJldHVybiBtZXRhO1xuICB9XG5cbiAgZ2V0VHlwZU1ldGFkYXRhKHR5cGU6IFR5cGUsIG1vZHVsZVVybDogc3RyaW5nKTogY3BsLkNvbXBpbGVUeXBlTWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgY3BsLkNvbXBpbGVUeXBlTWV0YWRhdGEoe1xuICAgICAgbmFtZTogdGhpcy5zYW5pdGl6ZVRva2VuTmFtZSh0eXBlKSxcbiAgICAgIG1vZHVsZVVybDogbW9kdWxlVXJsLFxuICAgICAgcnVudGltZTogdHlwZSxcbiAgICAgIGRpRGVwczogdGhpcy5nZXREZXBlbmRlbmNpZXNNZXRhZGF0YSh0eXBlLCBudWxsKVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0RmFjdG9yeU1ldGFkYXRhKGZhY3Rvcnk6IEZ1bmN0aW9uLCBtb2R1bGVVcmw6IHN0cmluZyk6IGNwbC5Db21waWxlRmFjdG9yeU1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IGNwbC5Db21waWxlRmFjdG9yeU1ldGFkYXRhKHtcbiAgICAgIG5hbWU6IHRoaXMuc2FuaXRpemVUb2tlbk5hbWUoZmFjdG9yeSksXG4gICAgICBtb2R1bGVVcmw6IG1vZHVsZVVybCxcbiAgICAgIHJ1bnRpbWU6IGZhY3RvcnksXG4gICAgICBkaURlcHM6IHRoaXMuZ2V0RGVwZW5kZW5jaWVzTWV0YWRhdGEoZmFjdG9yeSwgbnVsbClcbiAgICB9KTtcbiAgfVxuXG4gIGdldFBpcGVNZXRhZGF0YShwaXBlVHlwZTogVHlwZSk6IGNwbC5Db21waWxlUGlwZU1ldGFkYXRhIHtcbiAgICB2YXIgbWV0YSA9IHRoaXMuX3BpcGVDYWNoZS5nZXQocGlwZVR5cGUpO1xuICAgIGlmIChpc0JsYW5rKG1ldGEpKSB7XG4gICAgICB2YXIgcGlwZU1ldGEgPSB0aGlzLl9waXBlUmVzb2x2ZXIucmVzb2x2ZShwaXBlVHlwZSk7XG4gICAgICB2YXIgbW9kdWxlVXJsID0gcmVmbGVjdG9yLmltcG9ydFVyaShwaXBlVHlwZSk7XG4gICAgICBtZXRhID0gbmV3IGNwbC5Db21waWxlUGlwZU1ldGFkYXRhKHtcbiAgICAgICAgdHlwZTogdGhpcy5nZXRUeXBlTWV0YWRhdGEocGlwZVR5cGUsIG1vZHVsZVVybCksXG4gICAgICAgIG5hbWU6IHBpcGVNZXRhLm5hbWUsXG4gICAgICAgIHB1cmU6IHBpcGVNZXRhLnB1cmUsXG4gICAgICAgIGxpZmVjeWNsZUhvb2tzOiBMSUZFQ1lDTEVfSE9PS1NfVkFMVUVTLmZpbHRlcihob29rID0+IGhhc0xpZmVjeWNsZUhvb2soaG9vaywgcGlwZVR5cGUpKSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fcGlwZUNhY2hlLnNldChwaXBlVHlwZSwgbWV0YSk7XG4gICAgfVxuICAgIHJldHVybiBtZXRhO1xuICB9XG5cbiAgZ2V0Vmlld0RpcmVjdGl2ZXNNZXRhZGF0YShjb21wb25lbnQ6IFR5cGUpOiBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10ge1xuICAgIHZhciB2aWV3ID0gdGhpcy5fdmlld1Jlc29sdmVyLnJlc29sdmUoY29tcG9uZW50KTtcbiAgICB2YXIgZGlyZWN0aXZlcyA9IGZsYXR0ZW5EaXJlY3RpdmVzKHZpZXcsIHRoaXMuX3BsYXRmb3JtRGlyZWN0aXZlcyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkaXJlY3RpdmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIWlzVmFsaWRUeXBlKGRpcmVjdGl2ZXNbaV0pKSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICAgYFVuZXhwZWN0ZWQgZGlyZWN0aXZlIHZhbHVlICcke3N0cmluZ2lmeShkaXJlY3RpdmVzW2ldKX0nIG9uIHRoZSBWaWV3IG9mIGNvbXBvbmVudCAnJHtzdHJpbmdpZnkoY29tcG9uZW50KX0nYCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRpcmVjdGl2ZXMubWFwKHR5cGUgPT4gdGhpcy5nZXREaXJlY3RpdmVNZXRhZGF0YSh0eXBlKSk7XG4gIH1cblxuICBnZXRWaWV3UGlwZXNNZXRhZGF0YShjb21wb25lbnQ6IFR5cGUpOiBjcGwuQ29tcGlsZVBpcGVNZXRhZGF0YVtdIHtcbiAgICB2YXIgdmlldyA9IHRoaXMuX3ZpZXdSZXNvbHZlci5yZXNvbHZlKGNvbXBvbmVudCk7XG4gICAgdmFyIHBpcGVzID0gZmxhdHRlblBpcGVzKHZpZXcsIHRoaXMuX3BsYXRmb3JtUGlwZXMpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGlwZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICghaXNWYWxpZFR5cGUocGlwZXNbaV0pKSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICAgYFVuZXhwZWN0ZWQgcGlwZWQgdmFsdWUgJyR7c3RyaW5naWZ5KHBpcGVzW2ldKX0nIG9uIHRoZSBWaWV3IG9mIGNvbXBvbmVudCAnJHtzdHJpbmdpZnkoY29tcG9uZW50KX0nYCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwaXBlcy5tYXAodHlwZSA9PiB0aGlzLmdldFBpcGVNZXRhZGF0YSh0eXBlKSk7XG4gIH1cblxuICBnZXREZXBlbmRlbmNpZXNNZXRhZGF0YSh0eXBlT3JGdW5jOiBUeXBlIHwgRnVuY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGVuZGVuY2llczogYW55W10pOiBjcGwuQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW10ge1xuICAgIHZhciBkZXBzOiBSZWZsZWN0aXZlRGVwZW5kZW5jeVtdO1xuICAgIHRyeSB7XG4gICAgICBkZXBzID0gY29uc3RydWN0RGVwZW5kZW5jaWVzKHR5cGVPckZ1bmMsIGRlcGVuZGVuY2llcyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBOb0Fubm90YXRpb25FcnJvcikge1xuICAgICAgICBkZXBzID0gW107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVwcy5tYXAoKGRlcCkgPT4ge1xuICAgICAgdmFyIGNvbXBpbGVUb2tlbjtcbiAgICAgIHZhciBwID0gPEF0dHJpYnV0ZU1ldGFkYXRhPmRlcC5wcm9wZXJ0aWVzLmZpbmQocCA9PiBwIGluc3RhbmNlb2YgQXR0cmlidXRlTWV0YWRhdGEpO1xuICAgICAgdmFyIGlzQXR0cmlidXRlID0gZmFsc2U7XG4gICAgICBpZiAoaXNQcmVzZW50KHApKSB7XG4gICAgICAgIGNvbXBpbGVUb2tlbiA9IHRoaXMuZ2V0VG9rZW5NZXRhZGF0YShwLmF0dHJpYnV0ZU5hbWUpO1xuICAgICAgICBpc0F0dHJpYnV0ZSA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb21waWxlVG9rZW4gPSB0aGlzLmdldFRva2VuTWV0YWRhdGEoZGVwLmtleS50b2tlbik7XG4gICAgICB9XG4gICAgICB2YXIgY29tcGlsZVF1ZXJ5ID0gbnVsbDtcbiAgICAgIHZhciBxID0gPGRpbWQuUXVlcnlNZXRhZGF0YT5kZXAucHJvcGVydGllcy5maW5kKHAgPT4gcCBpbnN0YW5jZW9mIGRpbWQuUXVlcnlNZXRhZGF0YSk7XG4gICAgICBpZiAoaXNQcmVzZW50KHEpKSB7XG4gICAgICAgIGNvbXBpbGVRdWVyeSA9IHRoaXMuZ2V0UXVlcnlNZXRhZGF0YShxLCBudWxsKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgY3BsLkNvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSh7XG4gICAgICAgIGlzQXR0cmlidXRlOiBpc0F0dHJpYnV0ZSxcbiAgICAgICAgaXNIb3N0OiBkZXAudXBwZXJCb3VuZFZpc2liaWxpdHkgaW5zdGFuY2VvZiBIb3N0TWV0YWRhdGEsXG4gICAgICAgIGlzU2VsZjogZGVwLnVwcGVyQm91bmRWaXNpYmlsaXR5IGluc3RhbmNlb2YgU2VsZk1ldGFkYXRhLFxuICAgICAgICBpc1NraXBTZWxmOiBkZXAubG93ZXJCb3VuZFZpc2liaWxpdHkgaW5zdGFuY2VvZiBTa2lwU2VsZk1ldGFkYXRhLFxuICAgICAgICBpc09wdGlvbmFsOiBkZXAub3B0aW9uYWwsXG4gICAgICAgIHF1ZXJ5OiBpc1ByZXNlbnQocSkgJiYgIXEuaXNWaWV3UXVlcnkgPyBjb21waWxlUXVlcnkgOiBudWxsLFxuICAgICAgICB2aWV3UXVlcnk6IGlzUHJlc2VudChxKSAmJiBxLmlzVmlld1F1ZXJ5ID8gY29tcGlsZVF1ZXJ5IDogbnVsbCxcbiAgICAgICAgdG9rZW46IGNvbXBpbGVUb2tlblxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRUb2tlbk1ldGFkYXRhKHRva2VuOiBhbnkpOiBjcGwuQ29tcGlsZVRva2VuTWV0YWRhdGEge1xuICAgIHRva2VuID0gcmVzb2x2ZUZvcndhcmRSZWYodG9rZW4pO1xuICAgIHZhciBjb21waWxlVG9rZW47XG4gICAgaWYgKGlzU3RyaW5nKHRva2VuKSkge1xuICAgICAgY29tcGlsZVRva2VuID0gbmV3IGNwbC5Db21waWxlVG9rZW5NZXRhZGF0YSh7dmFsdWU6IHRva2VufSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbXBpbGVUb2tlbiA9IG5ldyBjcGwuQ29tcGlsZVRva2VuTWV0YWRhdGEoe1xuICAgICAgICBpZGVudGlmaWVyOiBuZXcgY3BsLkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoXG4gICAgICAgICAgICB7cnVudGltZTogdG9rZW4sIG5hbWU6IHRoaXMuc2FuaXRpemVUb2tlbk5hbWUodG9rZW4pfSlcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gY29tcGlsZVRva2VuO1xuICB9XG5cbiAgZ2V0UHJvdmlkZXJzTWV0YWRhdGEocHJvdmlkZXJzOiBhbnlbXSk6XG4gICAgICBBcnJheTxjcGwuQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEgfCBjcGwuQ29tcGlsZVR5cGVNZXRhZGF0YSB8IGFueVtdPiB7XG4gICAgcmV0dXJuIHByb3ZpZGVycy5tYXAoKHByb3ZpZGVyKSA9PiB7XG4gICAgICBwcm92aWRlciA9IHJlc29sdmVGb3J3YXJkUmVmKHByb3ZpZGVyKTtcbiAgICAgIGlmIChpc0FycmF5KHByb3ZpZGVyKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRQcm92aWRlcnNNZXRhZGF0YShwcm92aWRlcik7XG4gICAgICB9IGVsc2UgaWYgKHByb3ZpZGVyIGluc3RhbmNlb2YgUHJvdmlkZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UHJvdmlkZXJNZXRhZGF0YShwcm92aWRlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRUeXBlTWV0YWRhdGEocHJvdmlkZXIsIG51bGwpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0UHJvdmlkZXJNZXRhZGF0YShwcm92aWRlcjogUHJvdmlkZXIpOiBjcGwuQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEge1xuICAgIHZhciBjb21waWxlRGVwcztcbiAgICBpZiAoaXNQcmVzZW50KHByb3ZpZGVyLnVzZUNsYXNzKSkge1xuICAgICAgY29tcGlsZURlcHMgPSB0aGlzLmdldERlcGVuZGVuY2llc01ldGFkYXRhKHByb3ZpZGVyLnVzZUNsYXNzLCBwcm92aWRlci5kZXBlbmRlbmNpZXMpO1xuICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KHByb3ZpZGVyLnVzZUZhY3RvcnkpKSB7XG4gICAgICBjb21waWxlRGVwcyA9IHRoaXMuZ2V0RGVwZW5kZW5jaWVzTWV0YWRhdGEocHJvdmlkZXIudXNlRmFjdG9yeSwgcHJvdmlkZXIuZGVwZW5kZW5jaWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBjcGwuQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEoe1xuICAgICAgdG9rZW46IHRoaXMuZ2V0VG9rZW5NZXRhZGF0YShwcm92aWRlci50b2tlbiksXG4gICAgICB1c2VDbGFzczogaXNQcmVzZW50KHByb3ZpZGVyLnVzZUNsYXNzKSA/IHRoaXMuZ2V0VHlwZU1ldGFkYXRhKHByb3ZpZGVyLnVzZUNsYXNzLCBudWxsKSA6IG51bGwsXG4gICAgICB1c2VWYWx1ZTogaXNQcmVzZW50KHByb3ZpZGVyLnVzZVZhbHVlKSA/XG4gICAgICAgICAgICAgICAgICAgIG5ldyBjcGwuQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSh7cnVudGltZTogcHJvdmlkZXIudXNlVmFsdWV9KSA6XG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICB1c2VGYWN0b3J5OiBpc1ByZXNlbnQocHJvdmlkZXIudXNlRmFjdG9yeSkgP1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0RmFjdG9yeU1ldGFkYXRhKHByb3ZpZGVyLnVzZUZhY3RvcnksIG51bGwpIDpcbiAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgdXNlRXhpc3Rpbmc6IGlzUHJlc2VudChwcm92aWRlci51c2VFeGlzdGluZykgPyB0aGlzLmdldFRva2VuTWV0YWRhdGEocHJvdmlkZXIudXNlRXhpc3RpbmcpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgIGRlcHM6IGNvbXBpbGVEZXBzLFxuICAgICAgbXVsdGk6IHByb3ZpZGVyLm11bHRpXG4gICAgfSk7XG4gIH1cblxuICBnZXRRdWVyaWVzTWV0YWRhdGEocXVlcmllczoge1trZXk6IHN0cmluZ106IGRpbWQuUXVlcnlNZXRhZGF0YX0sXG4gICAgICAgICAgICAgICAgICAgICBpc1ZpZXdRdWVyeTogYm9vbGVhbik6IGNwbC5Db21waWxlUXVlcnlNZXRhZGF0YVtdIHtcbiAgICB2YXIgY29tcGlsZVF1ZXJpZXMgPSBbXTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2gocXVlcmllcywgKHF1ZXJ5LCBwcm9wZXJ0eU5hbWUpID0+IHtcbiAgICAgIGlmIChxdWVyeS5pc1ZpZXdRdWVyeSA9PT0gaXNWaWV3UXVlcnkpIHtcbiAgICAgICAgY29tcGlsZVF1ZXJpZXMucHVzaCh0aGlzLmdldFF1ZXJ5TWV0YWRhdGEocXVlcnksIHByb3BlcnR5TmFtZSkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjb21waWxlUXVlcmllcztcbiAgfVxuXG4gIGdldFF1ZXJ5TWV0YWRhdGEocTogZGltZC5RdWVyeU1ldGFkYXRhLCBwcm9wZXJ0eU5hbWU6IHN0cmluZyk6IGNwbC5Db21waWxlUXVlcnlNZXRhZGF0YSB7XG4gICAgdmFyIHNlbGVjdG9ycztcbiAgICBpZiAocS5pc1ZhckJpbmRpbmdRdWVyeSkge1xuICAgICAgc2VsZWN0b3JzID0gcS52YXJCaW5kaW5ncy5tYXAodmFyTmFtZSA9PiB0aGlzLmdldFRva2VuTWV0YWRhdGEodmFyTmFtZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxlY3RvcnMgPSBbdGhpcy5nZXRUb2tlbk1ldGFkYXRhKHEuc2VsZWN0b3IpXTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBjcGwuQ29tcGlsZVF1ZXJ5TWV0YWRhdGEoe1xuICAgICAgc2VsZWN0b3JzOiBzZWxlY3RvcnMsXG4gICAgICBmaXJzdDogcS5maXJzdCxcbiAgICAgIGRlc2NlbmRhbnRzOiBxLmRlc2NlbmRhbnRzLFxuICAgICAgcHJvcGVydHlOYW1lOiBwcm9wZXJ0eU5hbWUsXG4gICAgICByZWFkOiBpc1ByZXNlbnQocS5yZWFkKSA/IHRoaXMuZ2V0VG9rZW5NZXRhZGF0YShxLnJlYWQpIDogbnVsbFxuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW5EaXJlY3RpdmVzKHZpZXc6IFZpZXdNZXRhZGF0YSwgcGxhdGZvcm1EaXJlY3RpdmVzOiBhbnlbXSk6IFR5cGVbXSB7XG4gIGxldCBkaXJlY3RpdmVzID0gW107XG4gIGlmIChpc1ByZXNlbnQocGxhdGZvcm1EaXJlY3RpdmVzKSkge1xuICAgIGZsYXR0ZW5BcnJheShwbGF0Zm9ybURpcmVjdGl2ZXMsIGRpcmVjdGl2ZXMpO1xuICB9XG4gIGlmIChpc1ByZXNlbnQodmlldy5kaXJlY3RpdmVzKSkge1xuICAgIGZsYXR0ZW5BcnJheSh2aWV3LmRpcmVjdGl2ZXMsIGRpcmVjdGl2ZXMpO1xuICB9XG4gIHJldHVybiBkaXJlY3RpdmVzO1xufVxuXG5mdW5jdGlvbiBmbGF0dGVuUGlwZXModmlldzogVmlld01ldGFkYXRhLCBwbGF0Zm9ybVBpcGVzOiBhbnlbXSk6IFR5cGVbXSB7XG4gIGxldCBwaXBlcyA9IFtdO1xuICBpZiAoaXNQcmVzZW50KHBsYXRmb3JtUGlwZXMpKSB7XG4gICAgZmxhdHRlbkFycmF5KHBsYXRmb3JtUGlwZXMsIHBpcGVzKTtcbiAgfVxuICBpZiAoaXNQcmVzZW50KHZpZXcucGlwZXMpKSB7XG4gICAgZmxhdHRlbkFycmF5KHZpZXcucGlwZXMsIHBpcGVzKTtcbiAgfVxuICByZXR1cm4gcGlwZXM7XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW5BcnJheSh0cmVlOiBhbnlbXSwgb3V0OiBBcnJheTxUeXBlIHwgYW55W10+KTogdm9pZCB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdHJlZS5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gcmVzb2x2ZUZvcndhcmRSZWYodHJlZVtpXSk7XG4gICAgaWYgKGlzQXJyYXkoaXRlbSkpIHtcbiAgICAgIGZsYXR0ZW5BcnJheShpdGVtLCBvdXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQucHVzaChpdGVtKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNWYWxpZFR5cGUodmFsdWU6IFR5cGUpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzUHJlc2VudCh2YWx1ZSkgJiYgKHZhbHVlIGluc3RhbmNlb2YgVHlwZSk7XG59XG5cbmZ1bmN0aW9uIGNhbGNNb2R1bGVVcmwodHlwZTogVHlwZSwgY21wTWV0YWRhdGE6IG1kLkNvbXBvbmVudE1ldGFkYXRhKTogc3RyaW5nIHtcbiAgdmFyIG1vZHVsZUlkID0gY21wTWV0YWRhdGEubW9kdWxlSWQ7XG4gIGlmIChpc1ByZXNlbnQobW9kdWxlSWQpKSB7XG4gICAgdmFyIHNjaGVtZSA9IGdldFVybFNjaGVtZShtb2R1bGVJZCk7XG4gICAgcmV0dXJuIGlzUHJlc2VudChzY2hlbWUpICYmIHNjaGVtZS5sZW5ndGggPiAwID8gbW9kdWxlSWQgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBwYWNrYWdlOiR7bW9kdWxlSWR9JHtNT0RVTEVfU1VGRklYfWA7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHJlZmxlY3Rvci5pbXBvcnRVcmkodHlwZSk7XG4gIH1cbn1cbiJdfQ==