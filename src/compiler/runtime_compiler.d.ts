import { Type } from 'angular2/src/facade/lang';
import { StyleCompiler } from './style_compiler';
import { ViewCompiler } from './view_compiler/view_compiler';
import { InjectorCompiler } from './view_compiler/injector_compiler';
import { TemplateParser } from './template_parser';
import { DirectiveNormalizer } from './directive_normalizer';
import { RuntimeMetadataResolver } from './runtime_metadata';
import { ComponentFactory } from 'angular2/src/core/linker/component_factory';
import { CodegenInjectorFactory } from 'angular2/src/core/linker/injector_factory';
import { ComponentResolver } from 'angular2/src/core/linker/component_resolver';
import { CompilerConfig } from './config';
import { XHR } from './xhr';
/**
 * An internal module of the Angular compiler that begins with component types,
 * extracts templates, and eventually produces a compiled version of the component
 * ready for linking into an application.
 */
export declare class RuntimeCompiler implements ComponentResolver {
    private _runtimeMetadataResolver;
    private _templateNormalizer;
    private _templateParser;
    private _styleCompiler;
    private _viewCompiler;
    private _xhr;
    private _injectorCompiler;
    private _genConfig;
    private _styleCache;
    private _hostCacheKeys;
    private _compiledTemplateCache;
    private _compiledTemplateDone;
    constructor(_runtimeMetadataResolver: RuntimeMetadataResolver, _templateNormalizer: DirectiveNormalizer, _templateParser: TemplateParser, _styleCompiler: StyleCompiler, _viewCompiler: ViewCompiler, _xhr: XHR, _injectorCompiler: InjectorCompiler, _genConfig: CompilerConfig);
    createInjectorFactory(moduleClass: Type, extraProviders?: any[]): CodegenInjectorFactory<any>;
    resolveComponent(componentType: Type): Promise<ComponentFactory>;
    clearCache(): void;
    private _loadAndCompileComponent(cacheKey, compMeta, viewDirectives, pipes, compilingComponentsPath);
    private _compileComponent(compMeta, parsedTemplate, styles, pipes, compilingComponentsPath, childPromises);
    private _compileComponentStyles(compMeta);
    private _resolveStylesCompileResult(sourceUrl, result);
    private _loadStylesheetDep(dep);
}
