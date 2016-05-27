import { AttrAst, DirectiveAst, ProviderAst } from './template_ast';
import { CompileDirectiveMetadata } from './compile_metadata';
import { ParseSourceSpan, ParseError } from './parse_util';
export declare class ProviderError extends ParseError {
    constructor(message: string, span: ParseSourceSpan);
}
export declare class ProviderViewContext {
    component: CompileDirectiveMetadata;
    sourceSpan: ParseSourceSpan;
    errors: ProviderError[];
    constructor(component: CompileDirectiveMetadata, sourceSpan: ParseSourceSpan);
}
export declare class ProviderElementContext {
    private _viewContext;
    private _parent;
    private _isViewRoot;
    private _directiveAsts;
    private _sourceSpan;
    private _contentQueries;
    private _transformedProviders;
    private _seenProviders;
    private _allProviders;
    private _attrs;
    constructor(_viewContext: ProviderViewContext, _parent: ProviderElementContext, _isViewRoot: boolean, _directiveAsts: DirectiveAst[], attrs: AttrAst[], _sourceSpan: ParseSourceSpan);
    afterElement(): void;
    transformProviders: ProviderAst[];
    transformedDirectiveAsts: DirectiveAst[];
    private isQueried(token);
    private _getLocalProvider(requestingProviderType, token, eager);
    private _getLocalDependency(requestingProviderType, dep, eager?);
    private _getDependency(requestingProviderType, dep, eager?);
}
