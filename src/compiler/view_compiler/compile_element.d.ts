import * as o from '../output/output_ast';
import { CompileView } from './compile_view';
import { TemplateAst, ProviderAst } from '../template_ast';
import { CompileDirectiveMetadata, CompileTokenMetadata } from '../compile_metadata';
export declare class CompileNode {
    parent: CompileElement;
    view: CompileView;
    nodeIndex: number;
    renderNode: o.Expression;
    sourceAst: TemplateAst;
    constructor(parent: CompileElement, view: CompileView, nodeIndex: number, renderNode: o.Expression, sourceAst: TemplateAst);
    isNull(): boolean;
    isRootElement(): boolean;
}
export declare class CompileElement extends CompileNode {
    private _directives;
    private _resolvedProvidersArray;
    variableTokens: {
        [key: string]: CompileTokenMetadata;
    };
    static createNull(): CompileElement;
    private _compViewExpr;
    component: CompileDirectiveMetadata;
    private _appElement;
    private _defaultInjector;
    private _instances;
    private _resolvedProviders;
    private _queryCount;
    private _queries;
    private _componentConstructorViewQueryLists;
    contentNodesByNgContentIndex: Array<o.Expression>[];
    embeddedView: CompileView;
    directiveInstances: o.Expression[];
    constructor(parent: CompileElement, view: CompileView, nodeIndex: number, renderNode: o.Expression, sourceAst: TemplateAst, _directives: CompileDirectiveMetadata[], _resolvedProvidersArray: ProviderAst[], variableTokens: {
        [key: string]: CompileTokenMetadata;
    });
    setComponent(component: CompileDirectiveMetadata, compViewExpr: o.Expression): void;
    setEmbeddedView(embeddedView: CompileView): void;
    beforeChildren(): void;
    afterChildren(childNodeCount: number): void;
    addContentNode(ngContentIndex: number, nodeExpr: o.Expression): void;
    getComponent(): o.Expression;
    getProviderTokens(): o.Expression[];
    getDeclaredVariablesNames(): string[];
    getOptionalAppElement(): o.Expression;
    getOrCreateAppElement(): o.Expression;
    getOrCreateInjector(): o.Expression;
    private _getQueriesFor(token);
    private _addQuery(queryMeta, directiveInstance);
    private _getLocalDependency(requestingProviderType, dep);
    private _getDependency(requestingProviderType, dep);
}
