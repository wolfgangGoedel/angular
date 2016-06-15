import { CompileInjectorModuleMetadata } from '../compile_metadata';
import * as o from '../output/output_ast';
export declare class InjectorCompileResult {
    statements: o.Statement[];
    injectorFactoryVar: string;
    constructor(statements: o.Statement[], injectorFactoryVar: string);
}
export declare class InjectorCompiler {
    compileInjector(injectorModuleMeta: CompileInjectorModuleMetadata): InjectorCompileResult;
}
