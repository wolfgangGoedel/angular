import { CompileDirectiveMetadata, CompilePipeMetadata, CompileInjectorModuleMetadata } from './compile_metadata';
import { StyleCompiler } from './style_compiler';
import { ViewCompiler } from './view_compiler/view_compiler';
import { InjectorCompiler } from './view_compiler/injector_compiler';
import { TemplateParser } from './template_parser';
import { DirectiveNormalizer } from './directive_normalizer';
import { OutputEmitter } from './output/abstract_emitter';
export declare class SourceModule {
    moduleUrl: string;
    source: string;
    constructor(moduleUrl: string, source: string);
}
export declare class NormalizedComponentWithViewDirectives {
    component: CompileDirectiveMetadata;
    directives: CompileDirectiveMetadata[];
    pipes: CompilePipeMetadata[];
    constructor(component: CompileDirectiveMetadata, directives: CompileDirectiveMetadata[], pipes: CompilePipeMetadata[]);
}
export declare class OfflineCompiler {
    private _directiveNormalizer;
    private _templateParser;
    private _styleCompiler;
    private _viewCompiler;
    private _injectorCompiler;
    private _outputEmitter;
    constructor(_directiveNormalizer: DirectiveNormalizer, _templateParser: TemplateParser, _styleCompiler: StyleCompiler, _viewCompiler: ViewCompiler, _injectorCompiler: InjectorCompiler, _outputEmitter: OutputEmitter);
    normalizeDirectiveMetadata(directive: CompileDirectiveMetadata): Promise<CompileDirectiveMetadata>;
    compile(components: NormalizedComponentWithViewDirectives[], injectorModules: CompileInjectorModuleMetadata[]): SourceModule;
    compileStylesheet(stylesheetUrl: string, cssText: string): SourceModule[];
    private _compileComponent(compMeta, directives, pipes, targetStatements);
    private _codegenSourceModule(moduleUrl, statements, exportedVars);
}
