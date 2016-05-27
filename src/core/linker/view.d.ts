import { Injector } from 'angular2/src/core/di';
import { AppElement } from './element';
import { Renderer, RenderComponentType } from 'angular2/src/core/render/api';
import { ViewRef_ } from './view_ref';
import { AppViewManager_ } from './view_manager';
import { ViewType } from './view_type';
import { ChangeDetectorRef, ChangeDetectionStrategy, ChangeDetectorState } from 'angular2/src/core/change_detection/change_detection';
import { StaticNodeDebugInfo, DebugContext } from './debug_context';
export declare const HOST_VIEW_ELEMENT_NAME: string;
/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
export declare abstract class AppView<T> {
    clazz: any;
    componentType: RenderComponentType;
    type: ViewType;
    locals: {
        [key: string]: any;
    };
    viewManager: AppViewManager_;
    parentInjector: Injector;
    declarationAppElement: AppElement;
    cdMode: ChangeDetectionStrategy;
    ref: ViewRef_;
    rootNodesOrAppElements: any[];
    allNodes: any[];
    disposables: Function[];
    subscriptions: any[];
    namedAppElements: {
        [key: string]: AppElement;
    };
    contentChildren: AppView<any>[];
    viewChildren: AppView<any>[];
    private _literalArrayCache;
    private _literalMapCache;
    viewContainerElement: AppElement;
    cdState: ChangeDetectorState;
    /**
     * The context against which data-binding expressions in this view are evaluated against.
     * This is always a component instance.
     */
    context: T;
    projectableNodes: Array<any | any[]>;
    destroyed: boolean;
    renderer: Renderer;
    constructor(clazz: any, componentType: RenderComponentType, type: ViewType, locals: {
        [key: string]: any;
    }, viewManager: AppViewManager_, parentInjector: Injector, declarationAppElement: AppElement, cdMode: ChangeDetectionStrategy, literalArrayCacheSize: number, literalMapCacheSize: number);
    create(givenProjectableNodes: Array<any | any[]>, rootSelector: string): void;
    /**
     * Overwritten by implementations
     */
    createInternal(rootSelector: string): void;
    init(rootNodesOrAppElements: any[], allNodes: any[], appElements: {
        [key: string]: AppElement;
    }, disposables: Function[], subscriptions: any[]): void;
    getHostViewElement(): AppElement;
    injectorGet(token: any, nodeIndex: number, notFoundResult: any): any;
    /**
     * Overwritten by implementations
     */
    injectorGetInternal(token: any, nodeIndex: number, notFoundResult: any): any;
    injector(nodeIndex: number): Injector;
    destroy(): void;
    destroyLocal(): void;
    /**
     * Overwritten by implementations
     */
    destroyInternal(): void;
    changeDetectorRef: ChangeDetectorRef;
    flatRootNodes: any[];
    lastRootNode: any;
    hasLocal(contextName: string): boolean;
    setLocal(contextName: string, value: any): void;
    /**
     * Overwritten by implementations
     */
    dirtyParentQueriesInternal(): void;
    detectChanges(throwOnChange: boolean): void;
    /**
     * Overwritten by implementations
     */
    detectChangesInternal(throwOnChange: boolean): void;
    detectContentChildrenChanges(throwOnChange: boolean): void;
    detectViewChildrenChanges(throwOnChange: boolean): void;
    addToContentChildren(renderAppElement: AppElement): void;
    removeFromContentChildren(renderAppElement: AppElement): void;
    literalArray(id: number, value: any[]): any[];
    literalMap(id: number, value: {
        [key: string]: any;
    }): {
        [key: string]: any;
    };
    markAsCheckOnce(): void;
    markPathToRootAsCheckOnce(): void;
    eventHandler(cb: Function): Function;
    throwDestroyedError(details: string): void;
}
export declare class DebugAppView<T> extends AppView<T> {
    staticNodeDebugInfos: StaticNodeDebugInfo[];
    private _currentDebugContext;
    constructor(clazz: any, componentType: RenderComponentType, type: ViewType, locals: {
        [key: string]: any;
    }, viewManager: AppViewManager_, parentInjector: Injector, declarationAppElement: AppElement, cdMode: ChangeDetectionStrategy, literalArrayCacheSize: number, literalMapCacheSize: number, staticNodeDebugInfos: StaticNodeDebugInfo[]);
    create(givenProjectableNodes: Array<any | any[]>, rootSelector: string): void;
    injectorGet(token: any, nodeIndex: number, notFoundResult: any): any;
    destroyLocal(): void;
    detectChanges(throwOnChange: boolean): void;
    private _resetDebug();
    debug(nodeIndex: number, rowNum: number, colNum: number): DebugContext;
    private _rethrowWithContext(e, stack);
    eventHandler(cb: Function): Function;
}
export declare class HostViewFactory {
    selector: string;
    viewFactory: Function;
    constructor(selector: string, viewFactory: Function);
}
