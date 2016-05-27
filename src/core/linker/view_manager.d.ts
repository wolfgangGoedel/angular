import { Injector } from 'angular2/src/core/di';
import { ElementRef } from './element_ref';
import { HostViewFactoryRef, HostViewRef, ViewRef } from './view_ref';
import { ViewContainerRef } from './view_container_ref';
import { RootRenderer, RenderComponentType } from 'angular2/src/core/render/api';
import { ViewEncapsulation } from 'angular2/src/core/metadata/view';
/**
 * Service exposing low level API for creating, moving and destroying Views.
 *
 * Most applications should use higher-level abstractions like {@link DynamicComponentLoader} and
 * {@link ViewContainerRef} instead.
 */
export declare abstract class AppViewManager {
    /**
     * Returns a {@link ViewContainerRef} of the View Container at the specified location.
     */
    abstract getViewContainer(location: ElementRef): ViewContainerRef;
    /**
     * Returns the {@link ElementRef} that makes up the specified Host View.
     */
    abstract getHostElement(hostViewRef: HostViewRef): ElementRef;
    /**
     * Searches the Component View of the Component specified via `hostLocation` and returns the
     * {@link ElementRef} for the Element identified via a Variable Name `variableName`.
     *
     * Throws an exception if the specified `hostLocation` is not a Host Element of a Component, or if
     * variable `variableName` couldn't be found in the Component View of this Component.
     */
    abstract getNamedElementInComponentView(hostLocation: ElementRef, variableName: string): ElementRef;
    /**
     * Returns the component instance for the provided Host Element.
     */
    abstract getComponent(hostLocation: ElementRef): any;
    /**
     * Creates an instance of a Component and attaches it to the first element in the global View
     * (usually DOM Document) that matches the component's selector or `overrideSelector`.
     *
     * This as a low-level way to bootstrap an application and upgrade an existing Element to a
     * Host Element. Most applications should use {@link DynamicComponentLoader#loadAsRoot} instead.
     *
     * The Component and its View are created based on the `hostProtoComponentRef` which can be
     * obtained
     * by compiling the component with {@link Compiler#compileInHost}.
     *
     * Use {@link AppViewManager#destroyRootHostView} to destroy the created Component and it's Host
     * View.
     *
     * ### Example
     *
     * ```
     * @ng.Component({
     *   selector: 'child-component'
     * })
     * @ng.View({
     *   template: 'Child'
     * })
     * class ChildComponent {
     *
     * }
     *
     * @ng.Component({
     *   selector: 'my-app'
     * })
     * @ng.View({
     *   template: `
     *     Parent (<some-component></some-component>)
     *   `
     * })
     * class MyApp implements OnDestroy {
     *   viewRef: ng.ViewRef;
     *
     *   constructor(public appViewManager: ng.AppViewManager, compiler: ng.Compiler) {
     *     compiler.compileInHost(ChildComponent).then((protoView: ng.ProtoComponentRef) => {
     *       this.viewRef = appViewManager.createRootHostView(protoView, 'some-component', null);
     *     })
     *   }
     *
     *   ngOnDestroy() {
     *     this.appViewManager.destroyRootHostView(this.viewRef);
     *     this.viewRef = null;
     *   }
     * }
     *
     * ng.bootstrap(MyApp);
     * ```
     */
    abstract createRootHostView(hostViewFactoryRef: HostViewFactoryRef, overrideSelector: string, injector: Injector, projectableNodes?: any[][]): HostViewRef;
    /**
     * Destroys the Host View created via {@link AppViewManager#createRootHostView}.
     *
     * Along with the Host View, the Component Instance as well as all nested View and Components are
     * destroyed as well.
     */
    abstract destroyRootHostView(hostViewRef: HostViewRef): any;
}
export declare class AppViewManager_ extends AppViewManager {
    private _renderer;
    private _appId;
    private _nextCompTypeId;
    constructor(_renderer: RootRenderer, _appId: string);
    getViewContainer(location: ElementRef): ViewContainerRef;
    getHostElement(hostViewRef: ViewRef): ElementRef;
    getNamedElementInComponentView(hostLocation: ElementRef, variableName: string): ElementRef;
    getComponent(hostLocation: ElementRef): any;
    createRootHostView(hostViewFactoryRef: HostViewFactoryRef, overrideSelector: string, injector: Injector, projectableNodes?: any[][]): HostViewRef;
    destroyRootHostView(hostViewRef: ViewRef): void;
    /**
     * Used by the generated code
     */
    createRenderComponentType(templateUrl: string, slotCount: number, encapsulation: ViewEncapsulation, styles: Array<string | any[]>): RenderComponentType;
}
