'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var async_1 = require('angular2/src/facade/async');
var compile_metadata_1 = require('./compile_metadata');
var di_1 = require('angular2/src/core/di');
var style_compiler_1 = require('./style_compiler');
var view_compiler_1 = require('./view_compiler/view_compiler');
var template_parser_1 = require('./template_parser');
var directive_normalizer_1 = require('./directive_normalizer');
var runtime_metadata_1 = require('./runtime_metadata');
var view_1 = require('angular2/src/core/linker/view');
var view_ref_1 = require('angular2/src/core/linker/view_ref');
var compiler_1 = require('angular2/src/core/linker/compiler');
var config_1 = require('./config');
var ir = require('./output/output_ast');
var output_jit_1 = require('./output/output_jit');
var output_interpreter_1 = require('./output/output_interpreter');
var interpretive_view_1 = require('./output/interpretive_view');
var xhr_1 = require('angular2/src/compiler/xhr');
/**
 * An internal module of the Angular compiler that begins with component types,
 * extracts templates, and eventually produces a compiled version of the component
 * ready for linking into an application.
 */
var RuntimeCompiler = (function (_super) {
    __extends(RuntimeCompiler, _super);
    function RuntimeCompiler(_runtimeMetadataResolver, _templateNormalizer, _templateParser, _styleCompiler, _viewCompiler, _xhr, _genConfig) {
        _super.call(this);
        this._runtimeMetadataResolver = _runtimeMetadataResolver;
        this._templateNormalizer = _templateNormalizer;
        this._templateParser = _templateParser;
        this._styleCompiler = _styleCompiler;
        this._viewCompiler = _viewCompiler;
        this._xhr = _xhr;
        this._genConfig = _genConfig;
        this._styleCache = new Map();
        this._hostCacheKeys = new Map();
        this._compiledTemplateCache = new Map();
        this._compiledTemplateDone = new Map();
    }
    RuntimeCompiler.prototype.compileInHost = function (componentType) {
        var compMeta = this._runtimeMetadataResolver.getDirectiveMetadata(componentType);
        var hostCacheKey = this._hostCacheKeys.get(componentType);
        if (lang_1.isBlank(hostCacheKey)) {
            hostCacheKey = new Object();
            this._hostCacheKeys.set(componentType, hostCacheKey);
            assertComponent(compMeta);
            var hostMeta = compile_metadata_1.createHostComponentMeta(compMeta.type, compMeta.selector);
            this._loadAndCompileComponent(hostCacheKey, hostMeta, [compMeta], [], []);
        }
        return this._compiledTemplateDone.get(hostCacheKey)
            .then(function (compiledTemplate) { return new view_ref_1.HostViewFactoryRef_(new view_1.HostViewFactory(compMeta.selector, compiledTemplate.viewFactory)); });
    };
    RuntimeCompiler.prototype.clearCache = function () {
        this._styleCache.clear();
        this._compiledTemplateCache.clear();
        this._compiledTemplateDone.clear();
        this._hostCacheKeys.clear();
    };
    RuntimeCompiler.prototype._loadAndCompileComponent = function (cacheKey, compMeta, viewDirectives, pipes, compilingComponentsPath) {
        var _this = this;
        var compiledTemplate = this._compiledTemplateCache.get(cacheKey);
        var done = this._compiledTemplateDone.get(cacheKey);
        if (lang_1.isBlank(compiledTemplate)) {
            compiledTemplate = new CompiledTemplate();
            this._compiledTemplateCache.set(cacheKey, compiledTemplate);
            done =
                async_1.PromiseWrapper.all([this._compileComponentStyles(compMeta)].concat(viewDirectives.map(function (dirMeta) { return _this._templateNormalizer.normalizeDirective(dirMeta); })))
                    .then(function (stylesAndNormalizedViewDirMetas) {
                    var normalizedViewDirMetas = stylesAndNormalizedViewDirMetas.slice(1);
                    var styles = stylesAndNormalizedViewDirMetas[0];
                    var parsedTemplate = _this._templateParser.parse(compMeta, compMeta.template.template, normalizedViewDirMetas, pipes, compMeta.type.name);
                    var childPromises = [];
                    compiledTemplate.init(_this._compileComponent(compMeta, parsedTemplate, styles, pipes, compilingComponentsPath, childPromises));
                    return async_1.PromiseWrapper.all(childPromises).then(function (_) { return compiledTemplate; });
                });
            this._compiledTemplateDone.set(cacheKey, done);
        }
        return compiledTemplate;
    };
    RuntimeCompiler.prototype._compileComponent = function (compMeta, parsedTemplate, styles, pipes, compilingComponentsPath, childPromises) {
        var _this = this;
        var compileResult = this._viewCompiler.compileComponent(compMeta, parsedTemplate, new ir.ExternalExpr(new compile_metadata_1.CompileIdentifierMetadata({ runtime: styles })), pipes);
        compileResult.dependencies.forEach(function (dep) {
            var childCompilingComponentsPath = collection_1.ListWrapper.clone(compilingComponentsPath);
            var childCacheKey = dep.comp.type.runtime;
            var childViewDirectives = _this._runtimeMetadataResolver.getViewDirectivesMetadata(dep.comp.type.runtime);
            var childViewPipes = _this._runtimeMetadataResolver.getViewPipesMetadata(dep.comp.type.runtime);
            var childIsRecursive = collection_1.ListWrapper.contains(childCompilingComponentsPath, childCacheKey);
            childCompilingComponentsPath.push(childCacheKey);
            var childComp = _this._loadAndCompileComponent(dep.comp.type.runtime, dep.comp, childViewDirectives, childViewPipes, childCompilingComponentsPath);
            dep.factoryPlaceholder.runtime = childComp.proxyViewFactory;
            dep.factoryPlaceholder.name = "viewFactory_" + dep.comp.type.name;
            if (!childIsRecursive) {
                // Only wait for a child if it is not a cycle
                childPromises.push(_this._compiledTemplateDone.get(childCacheKey));
            }
        });
        var factory;
        if (lang_1.IS_DART || !this._genConfig.useJit) {
            factory = output_interpreter_1.interpretStatements(compileResult.statements, compileResult.viewFactoryVar, new interpretive_view_1.InterpretiveAppViewInstanceFactory());
        }
        else {
            factory = output_jit_1.jitStatements(compMeta.type.name + ".template.js", compileResult.statements, compileResult.viewFactoryVar);
        }
        return factory;
    };
    RuntimeCompiler.prototype._compileComponentStyles = function (compMeta) {
        var compileResult = this._styleCompiler.compileComponent(compMeta);
        return this._resolveStylesCompileResult(compMeta.type.name, compileResult);
    };
    RuntimeCompiler.prototype._resolveStylesCompileResult = function (sourceUrl, result) {
        var _this = this;
        var promises = result.dependencies.map(function (dep) { return _this._loadStylesheetDep(dep); });
        return async_1.PromiseWrapper.all(promises)
            .then(function (cssTexts) {
            var nestedCompileResultPromises = [];
            for (var i = 0; i < result.dependencies.length; i++) {
                var dep = result.dependencies[i];
                var cssText = cssTexts[i];
                var nestedCompileResult = _this._styleCompiler.compileStylesheet(dep.sourceUrl, cssText, dep.isShimmed);
                nestedCompileResultPromises.push(_this._resolveStylesCompileResult(dep.sourceUrl, nestedCompileResult));
            }
            return async_1.PromiseWrapper.all(nestedCompileResultPromises);
        })
            .then(function (nestedStylesArr) {
            for (var i = 0; i < result.dependencies.length; i++) {
                var dep = result.dependencies[i];
                dep.valuePlaceholder.runtime = nestedStylesArr[i];
                dep.valuePlaceholder.name = "importedStyles" + i;
            }
            if (lang_1.IS_DART || !_this._genConfig.useJit) {
                return output_interpreter_1.interpretStatements(result.statements, result.stylesVar, new interpretive_view_1.InterpretiveAppViewInstanceFactory());
            }
            else {
                return output_jit_1.jitStatements(sourceUrl + ".css.js", result.statements, result.stylesVar);
            }
        });
    };
    RuntimeCompiler.prototype._loadStylesheetDep = function (dep) {
        var cacheKey = "" + dep.sourceUrl + (dep.isShimmed ? '.shim' : '');
        var cssTextPromise = this._styleCache.get(cacheKey);
        if (lang_1.isBlank(cssTextPromise)) {
            cssTextPromise = this._xhr.get(dep.sourceUrl);
            this._styleCache.set(cacheKey, cssTextPromise);
        }
        return cssTextPromise;
    };
    RuntimeCompiler = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [runtime_metadata_1.RuntimeMetadataResolver, directive_normalizer_1.DirectiveNormalizer, template_parser_1.TemplateParser, style_compiler_1.StyleCompiler, view_compiler_1.ViewCompiler, xhr_1.XHR, config_1.CompilerConfig])
    ], RuntimeCompiler);
    return RuntimeCompiler;
}(compiler_1.Compiler_));
exports.RuntimeCompiler = RuntimeCompiler;
var CompiledTemplate = (function () {
    function CompiledTemplate() {
        var _this = this;
        this.viewFactory = null;
        this.proxyViewFactory = function (viewManager, childInjector, contextEl) {
            return _this.viewFactory(viewManager, childInjector, contextEl);
        };
    }
    CompiledTemplate.prototype.init = function (viewFactory) { this.viewFactory = viewFactory; };
    return CompiledTemplate;
}());
function assertComponent(meta) {
    if (!meta.isComponent) {
        throw new exceptions_1.BaseException("Could not compile '" + meta.type.name + "' because it is not a component.");
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZV9jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtMUViclNPNEIudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9ydW50aW1lX2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHFCQVFPLDBCQUEwQixDQUFDLENBQUE7QUFDbEMsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFDN0QsMkJBS08sZ0NBQWdDLENBQUMsQ0FBQTtBQUN4QyxzQkFBNkIsMkJBQTJCLENBQUMsQ0FBQTtBQUN6RCxpQ0FRTyxvQkFBb0IsQ0FBQyxDQUFBO0FBaUI1QixtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUNoRCwrQkFBMEUsa0JBQWtCLENBQUMsQ0FBQTtBQUM3Riw4QkFBMkIsK0JBQStCLENBQUMsQ0FBQTtBQUMzRCxnQ0FBNkIsbUJBQW1CLENBQUMsQ0FBQTtBQUNqRCxxQ0FBa0Msd0JBQXdCLENBQUMsQ0FBQTtBQUMzRCxpQ0FBc0Msb0JBQW9CLENBQUMsQ0FBQTtBQUMzRCxxQkFBOEIsK0JBQStCLENBQUMsQ0FBQTtBQUM5RCx5QkFBc0QsbUNBQW1DLENBQUMsQ0FBQTtBQUMxRix5QkFBa0MsbUNBQW1DLENBQUMsQ0FBQTtBQUV0RSx1QkFBNkIsVUFBVSxDQUFDLENBQUE7QUFDeEMsSUFBWSxFQUFFLFdBQU0scUJBQXFCLENBQUMsQ0FBQTtBQUMxQywyQkFBNEIscUJBQXFCLENBQUMsQ0FBQTtBQUNsRCxtQ0FBa0MsNkJBQTZCLENBQUMsQ0FBQTtBQUNoRSxrQ0FBaUQsNEJBQTRCLENBQUMsQ0FBQTtBQUU5RSxvQkFBa0IsMkJBQTJCLENBQUMsQ0FBQTtBQUU5Qzs7OztHQUlHO0FBRUg7SUFBcUMsbUNBQVM7SUFNNUMseUJBQW9CLHdCQUFpRCxFQUNqRCxtQkFBd0MsRUFDeEMsZUFBK0IsRUFBVSxjQUE2QixFQUN0RSxhQUEy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QTRKYixzQkFBQztBQUFELENBQUMsQUEzSkQsQ0FBcUMsb0JBQVMsR0EySjdDO0FBM0pZLHVCQUFlLGtCQTJKM0IsQ0FBQTtBQUVEO0lBR0U7UUFIRixpQkFTQztRQVJDLGdCQUFXLEdBQWEsSUFBSSxDQUFDO1FBRzNCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxVQUFDLFdBQVcsRUFBRSxhQUFhLEVBQUUsU0FBUztZQUMxRCxPQUFBLEtBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLGFBQWEsRUFBRSxTQUFTLENBQUM7UUFBdkQsQ0FBdUQsQ0FBQztJQUM5RCxDQUFDO0lBRUQsK0JBQUksR0FBSixVQUFLLFdBQXFCLElBQUksSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQ2pFLHVCQUFDO0FBQUQsQ0FBQyxBQVRELElBU0M7QUFFRCx5QkFBeUIsSUFBOEI7SUFDckQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUN0QixNQUFNLElBQUksMEJBQWEsQ0FBQyx3QkFBc0IsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLHFDQUFrQyxDQUFDLENBQUM7SUFDbEcsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBJU19EQVJULFxuICBUeXBlLFxuICBKc29uLFxuICBpc0JsYW5rLFxuICBpc1ByZXNlbnQsXG4gIHN0cmluZ2lmeSxcbiAgZXZhbEV4cHJlc3Npb25cbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7XG4gIExpc3RXcmFwcGVyLFxuICBTZXRXcmFwcGVyLFxuICBNYXBXcmFwcGVyLFxuICBTdHJpbmdNYXBXcmFwcGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1Byb21pc2VXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7XG4gIGNyZWF0ZUhvc3RDb21wb25lbnRNZXRhLFxuICBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsXG4gIENvbXBpbGVUeXBlTWV0YWRhdGEsXG4gIENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhLFxuICBDb21waWxlUGlwZU1ldGFkYXRhLFxuICBDb21waWxlTWV0YWRhdGFXaXRoVHlwZSxcbiAgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVxufSBmcm9tICcuL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0IHtcbiAgVGVtcGxhdGVBc3QsXG4gIFRlbXBsYXRlQXN0VmlzaXRvcixcbiAgTmdDb250ZW50QXN0LFxuICBFbWJlZGRlZFRlbXBsYXRlQXN0LFxuICBFbGVtZW50QXN0LFxuICBWYXJpYWJsZUFzdCxcbiAgQm91bmRFdmVudEFzdCxcbiAgQm91bmRFbGVtZW50UHJvcGVydHlBc3QsXG4gIEF0dHJBc3QsXG4gIEJvdW5kVGV4dEFzdCxcbiAgVGV4dEFzdCxcbiAgRGlyZWN0aXZlQXN0LFxuICBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0LFxuICB0ZW1wbGF0ZVZpc2l0QWxsXG59IGZyb20gJy4vdGVtcGxhdGVfYXN0JztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtTdHlsZUNvbXBpbGVyLCBTdHlsZXNDb21waWxlRGVwZW5kZW5jeSwgU3R5bGVzQ29tcGlsZVJlc3VsdH0gZnJvbSAnLi9zdHlsZV9jb21waWxlcic7XG5pbXBvcnQge1ZpZXdDb21waWxlcn0gZnJvbSAnLi92aWV3X2NvbXBpbGVyL3ZpZXdfY29tcGlsZXInO1xuaW1wb3J0IHtUZW1wbGF0ZVBhcnNlcn0gZnJvbSAnLi90ZW1wbGF0ZV9wYXJzZXInO1xuaW1wb3J0IHtEaXJlY3RpdmVOb3JtYWxpemVyfSBmcm9tICcuL2RpcmVjdGl2ZV9ub3JtYWxpemVyJztcbmltcG9ydCB7UnVudGltZU1ldGFkYXRhUmVzb2x2ZXJ9IGZyb20gJy4vcnVudGltZV9tZXRhZGF0YSc7XG5pbXBvcnQge0hvc3RWaWV3RmFjdG9yeX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXcnO1xuaW1wb3J0IHtIb3N0Vmlld0ZhY3RvcnlSZWYsIEhvc3RWaWV3RmFjdG9yeVJlZl99IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X3JlZic7XG5pbXBvcnQge0NvbXBpbGVyLCBDb21waWxlcl99IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9jb21waWxlcic7XG5cbmltcG9ydCB7Q29tcGlsZXJDb25maWd9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtqaXRTdGF0ZW1lbnRzfSBmcm9tICcuL291dHB1dC9vdXRwdXRfaml0JztcbmltcG9ydCB7aW50ZXJwcmV0U3RhdGVtZW50c30gZnJvbSAnLi9vdXRwdXQvb3V0cHV0X2ludGVycHJldGVyJztcbmltcG9ydCB7SW50ZXJwcmV0aXZlQXBwVmlld0luc3RhbmNlRmFjdG9yeX0gZnJvbSAnLi9vdXRwdXQvaW50ZXJwcmV0aXZlX3ZpZXcnO1xuXG5pbXBvcnQge1hIUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3hocic7XG5cbi8qKlxuICogQW4gaW50ZXJuYWwgbW9kdWxlIG9mIHRoZSBBbmd1bGFyIGNvbXBpbGVyIHRoYXQgYmVnaW5zIHdpdGggY29tcG9uZW50IHR5cGVzLFxuICogZXh0cmFjdHMgdGVtcGxhdGVzLCBhbmQgZXZlbnR1YWxseSBwcm9kdWNlcyBhIGNvbXBpbGVkIHZlcnNpb24gb2YgdGhlIGNvbXBvbmVudFxuICogcmVhZHkgZm9yIGxpbmtpbmcgaW50byBhbiBhcHBsaWNhdGlvbi5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJ1bnRpbWVDb21waWxlciBleHRlbmRzIENvbXBpbGVyXyB7XG4gIHByaXZhdGUgX3N0eWxlQ2FjaGU6IE1hcDxzdHJpbmcsIFByb21pc2U8c3RyaW5nPj4gPSBuZXcgTWFwPHN0cmluZywgUHJvbWlzZTxzdHJpbmc+PigpO1xuICBwcml2YXRlIF9ob3N0Q2FjaGVLZXlzID0gbmV3IE1hcDxUeXBlLCBhbnk+KCk7XG4gIHByaXZhdGUgX2NvbXBpbGVkVGVtcGxhdGVDYWNoZSA9IG5ldyBNYXA8YW55LCBDb21waWxlZFRlbXBsYXRlPigpO1xuICBwcml2YXRlIF9jb21waWxlZFRlbXBsYXRlRG9uZSA9IG5ldyBNYXA8YW55LCBQcm9taXNlPENvbXBpbGVkVGVtcGxhdGU+PigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3J1bnRpbWVNZXRhZGF0YVJlc29sdmVyOiBSdW50aW1lTWV0YWRhdGFSZXNvbHZlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfdGVtcGxhdGVOb3JtYWxpemVyOiBEaXJlY3RpdmVOb3JtYWxpemVyLFxuICAgICAgICAgICAgICBwcml2YXRlIF90ZW1wbGF0ZVBhcnNlcjogVGVtcGxhdGVQYXJzZXIsIHByaXZhdGUgX3N0eWxlQ29tcGlsZXI6IFN0eWxlQ29tcGlsZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgX3ZpZXdDb21waWxlcjogVmlld0NvbXBpbGVyLCBwcml2YXRlIF94aHI6IFhIUixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfZ2VuQ29uZmlnOiBDb21waWxlckNvbmZpZykge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBjb21waWxlSW5Ib3N0KGNvbXBvbmVudFR5cGU6IFR5cGUpOiBQcm9taXNlPEhvc3RWaWV3RmFjdG9yeVJlZl8+IHtcbiAgICB2YXIgY29tcE1ldGE6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSA9XG4gICAgICAgIHRoaXMuX3J1bnRpbWVNZXRhZGF0YVJlc29sdmVyLmdldERpcmVjdGl2ZU1ldGFkYXRhKGNvbXBvbmVudFR5cGUpO1xuICAgIHZhciBob3N0Q2FjaGVLZXkgPSB0aGlzLl9ob3N0Q2FjaGVLZXlzLmdldChjb21wb25lbnRUeXBlKTtcbiAgICBpZiAoaXNCbGFuayhob3N0Q2FjaGVLZXkpKSB7XG4gICAgICBob3N0Q2FjaGVLZXkgPSBuZXcgT2JqZWN0KCk7XG4gICAgICB0aGlzLl9ob3N0Q2FjaGVLZXlzLnNldChjb21wb25lbnRUeXBlLCBob3N0Q2FjaGVLZXkpO1xuICAgICAgYXNzZXJ0Q29tcG9uZW50KGNvbXBNZXRhKTtcbiAgICAgIHZhciBob3N0TWV0YTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhID1cbiAgICAgICAgICBjcmVhdGVIb3N0Q29tcG9uZW50TWV0YShjb21wTWV0YS50eXBlLCBjb21wTWV0YS5zZWxlY3Rvcik7XG5cbiAgICAgIHRoaXMuX2xvYWRBbmRDb21waWxlQ29tcG9uZW50KGhvc3RDYWNoZUtleSwgaG9zdE1ldGEsIFtjb21wTWV0YV0sIFtdLCBbXSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jb21waWxlZFRlbXBsYXRlRG9uZS5nZXQoaG9zdENhY2hlS2V5KVxuICAgICAgICAudGhlbigoY29tcGlsZWRUZW1wbGF0ZTogQ29tcGlsZWRUZW1wbGF0ZSkgPT4gbmV3IEhvc3RWaWV3RmFjdG9yeVJlZl8oXG4gICAgICAgICAgICAgICAgICBuZXcgSG9zdFZpZXdGYWN0b3J5KGNvbXBNZXRhLnNlbGVjdG9yLCBjb21waWxlZFRlbXBsYXRlLnZpZXdGYWN0b3J5KSkpO1xuICB9XG5cbiAgY2xlYXJDYWNoZSgpIHtcbiAgICB0aGlzLl9zdHlsZUNhY2hlLmNsZWFyKCk7XG4gICAgdGhpcy5fY29tcGlsZWRUZW1wbGF0ZUNhY2hlLmNsZWFyKCk7XG4gICAgdGhpcy5fY29tcGlsZWRUZW1wbGF0ZURvbmUuY2xlYXIoKTtcbiAgICB0aGlzLl9ob3N0Q2FjaGVLZXlzLmNsZWFyKCk7XG4gIH1cblxuXG4gIHByaXZhdGUgX2xvYWRBbmRDb21waWxlQ29tcG9uZW50KGNhY2hlS2V5OiBhbnksIGNvbXBNZXRhOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdEaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGlwZXM6IENvbXBpbGVQaXBlTWV0YWRhdGFbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsaW5nQ29tcG9uZW50c1BhdGg6IGFueVtdKTogQ29tcGlsZWRUZW1wbGF0ZSB7XG4gICAgdmFyIGNvbXBpbGVkVGVtcGxhdGUgPSB0aGlzLl9jb21waWxlZFRlbXBsYXRlQ2FjaGUuZ2V0KGNhY2hlS2V5KTtcbiAgICB2YXIgZG9uZSA9IHRoaXMuX2NvbXBpbGVkVGVtcGxhdGVEb25lLmdldChjYWNoZUtleSk7XG4gICAgaWYgKGlzQmxhbmsoY29tcGlsZWRUZW1wbGF0ZSkpIHtcbiAgICAgIGNvbXBpbGVkVGVtcGxhdGUgPSBuZXcgQ29tcGlsZWRUZW1wbGF0ZSgpO1xuICAgICAgdGhpcy5fY29tcGlsZWRUZW1wbGF0ZUNhY2hlLnNldChjYWNoZUtleSwgY29tcGlsZWRUZW1wbGF0ZSk7XG4gICAgICBkb25lID1cbiAgICAgICAgICBQcm9taXNlV3JhcHBlci5hbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgWzxhbnk+dGhpcy5fY29tcGlsZUNvbXBvbmVudFN0eWxlcyhjb21wTWV0YSldLmNvbmNhdCh2aWV3RGlyZWN0aXZlcy5tYXAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpck1ldGEgPT4gdGhpcy5fdGVtcGxhdGVOb3JtYWxpemVyLm5vcm1hbGl6ZURpcmVjdGl2ZShkaXJNZXRhKSkpKVxuICAgICAgICAgICAgICAudGhlbigoc3R5bGVzQW5kTm9ybWFsaXplZFZpZXdEaXJNZXRhczogYW55W10pID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgbm9ybWFsaXplZFZpZXdEaXJNZXRhcyA9IHN0eWxlc0FuZE5vcm1hbGl6ZWRWaWV3RGlyTWV0YXMuc2xpY2UoMSk7XG4gICAgICAgICAgICAgICAgdmFyIHN0eWxlcyA9IHN0eWxlc0FuZE5vcm1hbGl6ZWRWaWV3RGlyTWV0YXNbMF07XG4gICAgICAgICAgICAgICAgdmFyIHBhcnNlZFRlbXBsYXRlID1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdGVtcGxhdGVQYXJzZXIucGFyc2UoY29tcE1ldGEsIGNvbXBNZXRhLnRlbXBsYXRlLnRlbXBsYXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3JtYWxpemVkVmlld0Rpck1ldGFzLCBwaXBlcywgY29tcE1ldGEudHlwZS5uYW1lKTtcblxuICAgICAgICAgICAgICAgIHZhciBjaGlsZFByb21pc2VzID0gW107XG4gICAgICAgICAgICAgICAgY29tcGlsZWRUZW1wbGF0ZS5pbml0KHRoaXMuX2NvbXBpbGVDb21wb25lbnQoY29tcE1ldGEsIHBhcnNlZFRlbXBsYXRlLCBzdHlsZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGlwZXMsIGNvbXBpbGluZ0NvbXBvbmVudHNQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkUHJvbWlzZXMpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIuYWxsKGNoaWxkUHJvbWlzZXMpLnRoZW4oKF8pID0+IHsgcmV0dXJuIGNvbXBpbGVkVGVtcGxhdGU7IH0pO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgIHRoaXMuX2NvbXBpbGVkVGVtcGxhdGVEb25lLnNldChjYWNoZUtleSwgZG9uZSk7XG4gICAgfVxuICAgIHJldHVybiBjb21waWxlZFRlbXBsYXRlO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tcGlsZUNvbXBvbmVudChjb21wTWV0YTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCBwYXJzZWRUZW1wbGF0ZTogVGVtcGxhdGVBc3RbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZXM6IHN0cmluZ1tdLCBwaXBlczogQ29tcGlsZVBpcGVNZXRhZGF0YVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGluZ0NvbXBvbmVudHNQYXRoOiBhbnlbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZFByb21pc2VzOiBQcm9taXNlPGFueT5bXSk6IEZ1bmN0aW9uIHtcbiAgICB2YXIgY29tcGlsZVJlc3VsdCA9IHRoaXMuX3ZpZXdDb21waWxlci5jb21waWxlQ29tcG9uZW50KFxuICAgICAgICBjb21wTWV0YSwgcGFyc2VkVGVtcGxhdGUsXG4gICAgICAgIG5ldyBpci5FeHRlcm5hbEV4cHIobmV3IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoe3J1bnRpbWU6IHN0eWxlc30pKSwgcGlwZXMpO1xuICAgIGNvbXBpbGVSZXN1bHQuZGVwZW5kZW5jaWVzLmZvckVhY2goKGRlcCkgPT4ge1xuICAgICAgdmFyIGNoaWxkQ29tcGlsaW5nQ29tcG9uZW50c1BhdGggPSBMaXN0V3JhcHBlci5jbG9uZShjb21waWxpbmdDb21wb25lbnRzUGF0aCk7XG5cbiAgICAgIHZhciBjaGlsZENhY2hlS2V5ID0gZGVwLmNvbXAudHlwZS5ydW50aW1lO1xuICAgICAgdmFyIGNoaWxkVmlld0RpcmVjdGl2ZXM6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YVtdID1cbiAgICAgICAgICB0aGlzLl9ydW50aW1lTWV0YWRhdGFSZXNvbHZlci5nZXRWaWV3RGlyZWN0aXZlc01ldGFkYXRhKGRlcC5jb21wLnR5cGUucnVudGltZSk7XG4gICAgICB2YXIgY2hpbGRWaWV3UGlwZXM6IENvbXBpbGVQaXBlTWV0YWRhdGFbXSA9XG4gICAgICAgICAgdGhpcy5fcnVudGltZU1ldGFkYXRhUmVzb2x2ZXIuZ2V0Vmlld1BpcGVzTWV0YWRhdGEoZGVwLmNvbXAudHlwZS5ydW50aW1lKTtcbiAgICAgIHZhciBjaGlsZElzUmVjdXJzaXZlID0gTGlzdFdyYXBwZXIuY29udGFpbnMoY2hpbGRDb21waWxpbmdDb21wb25lbnRzUGF0aCwgY2hpbGRDYWNoZUtleSk7XG4gICAgICBjaGlsZENvbXBpbGluZ0NvbXBvbmVudHNQYXRoLnB1c2goY2hpbGRDYWNoZUtleSk7XG5cbiAgICAgIHZhciBjaGlsZENvbXAgPVxuICAgICAgICAgIHRoaXMuX2xvYWRBbmRDb21waWxlQ29tcG9uZW50KGRlcC5jb21wLnR5cGUucnVudGltZSwgZGVwLmNvbXAsIGNoaWxkVmlld0RpcmVjdGl2ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRWaWV3UGlwZXMsIGNoaWxkQ29tcGlsaW5nQ29tcG9uZW50c1BhdGgpO1xuICAgICAgZGVwLmZhY3RvcnlQbGFjZWhvbGRlci5ydW50aW1lID0gY2hpbGRDb21wLnByb3h5Vmlld0ZhY3Rvcnk7XG4gICAgICBkZXAuZmFjdG9yeVBsYWNlaG9sZGVyLm5hbWUgPSBgdmlld0ZhY3RvcnlfJHtkZXAuY29tcC50eXBlLm5hbWV9YDtcbiAgICAgIGlmICghY2hpbGRJc1JlY3Vyc2l2ZSkge1xuICAgICAgICAvLyBPbmx5IHdhaXQgZm9yIGEgY2hpbGQgaWYgaXQgaXMgbm90IGEgY3ljbGVcbiAgICAgICAgY2hpbGRQcm9taXNlcy5wdXNoKHRoaXMuX2NvbXBpbGVkVGVtcGxhdGVEb25lLmdldChjaGlsZENhY2hlS2V5KSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdmFyIGZhY3Rvcnk7XG4gICAgaWYgKElTX0RBUlQgfHwgIXRoaXMuX2dlbkNvbmZpZy51c2VKaXQpIHtcbiAgICAgIGZhY3RvcnkgPSBpbnRlcnByZXRTdGF0ZW1lbnRzKGNvbXBpbGVSZXN1bHQuc3RhdGVtZW50cywgY29tcGlsZVJlc3VsdC52aWV3RmFjdG9yeVZhcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBJbnRlcnByZXRpdmVBcHBWaWV3SW5zdGFuY2VGYWN0b3J5KCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmYWN0b3J5ID0gaml0U3RhdGVtZW50cyhgJHtjb21wTWV0YS50eXBlLm5hbWV9LnRlbXBsYXRlLmpzYCwgY29tcGlsZVJlc3VsdC5zdGF0ZW1lbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZVJlc3VsdC52aWV3RmFjdG9yeVZhcik7XG4gICAgfVxuICAgIHJldHVybiBmYWN0b3J5O1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tcGlsZUNvbXBvbmVudFN0eWxlcyhjb21wTWV0YTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIHZhciBjb21waWxlUmVzdWx0ID0gdGhpcy5fc3R5bGVDb21waWxlci5jb21waWxlQ29tcG9uZW50KGNvbXBNZXRhKTtcbiAgICByZXR1cm4gdGhpcy5fcmVzb2x2ZVN0eWxlc0NvbXBpbGVSZXN1bHQoY29tcE1ldGEudHlwZS5uYW1lLCBjb21waWxlUmVzdWx0KTtcbiAgfVxuXG4gIHByaXZhdGUgX3Jlc29sdmVTdHlsZXNDb21waWxlUmVzdWx0KHNvdXJjZVVybDogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQ6IFN0eWxlc0NvbXBpbGVSZXN1bHQpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgdmFyIHByb21pc2VzID0gcmVzdWx0LmRlcGVuZGVuY2llcy5tYXAoKGRlcCkgPT4gdGhpcy5fbG9hZFN0eWxlc2hlZXREZXAoZGVwKSk7XG4gICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLmFsbChwcm9taXNlcylcbiAgICAgICAgLnRoZW4oKGNzc1RleHRzKSA9PiB7XG4gICAgICAgICAgdmFyIG5lc3RlZENvbXBpbGVSZXN1bHRQcm9taXNlcyA9IFtdO1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzdWx0LmRlcGVuZGVuY2llcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGRlcCA9IHJlc3VsdC5kZXBlbmRlbmNpZXNbaV07XG4gICAgICAgICAgICB2YXIgY3NzVGV4dCA9IGNzc1RleHRzW2ldO1xuICAgICAgICAgICAgdmFyIG5lc3RlZENvbXBpbGVSZXN1bHQgPVxuICAgICAgICAgICAgICAgIHRoaXMuX3N0eWxlQ29tcGlsZXIuY29tcGlsZVN0eWxlc2hlZXQoZGVwLnNvdXJjZVVybCwgY3NzVGV4dCwgZGVwLmlzU2hpbW1lZCk7XG4gICAgICAgICAgICBuZXN0ZWRDb21waWxlUmVzdWx0UHJvbWlzZXMucHVzaChcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXNvbHZlU3R5bGVzQ29tcGlsZVJlc3VsdChkZXAuc291cmNlVXJsLCBuZXN0ZWRDb21waWxlUmVzdWx0KSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5hbGwobmVzdGVkQ29tcGlsZVJlc3VsdFByb21pc2VzKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKG5lc3RlZFN0eWxlc0FycikgPT4ge1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzdWx0LmRlcGVuZGVuY2llcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGRlcCA9IHJlc3VsdC5kZXBlbmRlbmNpZXNbaV07XG4gICAgICAgICAgICBkZXAudmFsdWVQbGFjZWhvbGRlci5ydW50aW1lID0gbmVzdGVkU3R5bGVzQXJyW2ldO1xuICAgICAgICAgICAgZGVwLnZhbHVlUGxhY2Vob2xkZXIubmFtZSA9IGBpbXBvcnRlZFN0eWxlcyR7aX1gO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoSVNfREFSVCB8fCAhdGhpcy5fZ2VuQ29uZmlnLnVzZUppdCkge1xuICAgICAgICAgICAgcmV0dXJuIGludGVycHJldFN0YXRlbWVudHMocmVzdWx0LnN0YXRlbWVudHMsIHJlc3VsdC5zdHlsZXNWYXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgSW50ZXJwcmV0aXZlQXBwVmlld0luc3RhbmNlRmFjdG9yeSgpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGppdFN0YXRlbWVudHMoYCR7c291cmNlVXJsfS5jc3MuanNgLCByZXN1bHQuc3RhdGVtZW50cywgcmVzdWx0LnN0eWxlc1Zhcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2xvYWRTdHlsZXNoZWV0RGVwKGRlcDogU3R5bGVzQ29tcGlsZURlcGVuZGVuY3kpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHZhciBjYWNoZUtleSA9IGAke2RlcC5zb3VyY2VVcmx9JHtkZXAuaXNTaGltbWVkID8gJy5zaGltJyA6ICcnfWA7XG4gICAgdmFyIGNzc1RleHRQcm9taXNlID0gdGhpcy5fc3R5bGVDYWNoZS5nZXQoY2FjaGVLZXkpO1xuICAgIGlmIChpc0JsYW5rKGNzc1RleHRQcm9taXNlKSkge1xuICAgICAgY3NzVGV4dFByb21pc2UgPSB0aGlzLl94aHIuZ2V0KGRlcC5zb3VyY2VVcmwpO1xuICAgICAgdGhpcy5fc3R5bGVDYWNoZS5zZXQoY2FjaGVLZXksIGNzc1RleHRQcm9taXNlKTtcbiAgICB9XG4gICAgcmV0dXJuIGNzc1RleHRQcm9taXNlO1xuICB9XG59XG5cbmNsYXNzIENvbXBpbGVkVGVtcGxhdGUge1xuICB2aWV3RmFjdG9yeTogRnVuY3Rpb24gPSBudWxsO1xuICBwcm94eVZpZXdGYWN0b3J5OiBGdW5jdGlvbjtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5wcm94eVZpZXdGYWN0b3J5ID0gKHZpZXdNYW5hZ2VyLCBjaGlsZEluamVjdG9yLCBjb250ZXh0RWwpID0+XG4gICAgICAgIHRoaXMudmlld0ZhY3Rvcnkodmlld01hbmFnZXIsIGNoaWxkSW5qZWN0b3IsIGNvbnRleHRFbCk7XG4gIH1cblxuICBpbml0KHZpZXdGYWN0b3J5OiBGdW5jdGlvbikgeyB0aGlzLnZpZXdGYWN0b3J5ID0gdmlld0ZhY3Rvcnk7IH1cbn1cblxuZnVuY3Rpb24gYXNzZXJ0Q29tcG9uZW50KG1ldGE6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSkge1xuICBpZiAoIW1ldGEuaXNDb21wb25lbnQpIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgQ291bGQgbm90IGNvbXBpbGUgJyR7bWV0YS50eXBlLm5hbWV9JyBiZWNhdXNlIGl0IGlzIG5vdCBhIGNvbXBvbmVudC5gKTtcbiAgfVxufVxuIl19