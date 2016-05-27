library angular2.src.core.linker.view_manager;

import "package:angular2/src/core/di.dart"
    show Injector, Inject, Provider, Injectable, ResolvedProvider;
import "package:angular2/src/facade/lang.dart"
    show isPresent, isBlank, isArray, Type;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "element_ref.dart" show ElementRef, ElementRef_;
import "view_ref.dart"
    show
        HostViewFactoryRef,
        HostViewFactoryRef_,
        EmbeddedViewRef,
        HostViewRef,
        ViewRef,
        ViewRef_;
import "view_container_ref.dart" show ViewContainerRef, ViewContainerRef_;
import "package:angular2/src/core/render/api.dart"
    show RootRenderer, RenderComponentType, Renderer;
import "../profile/profile.dart" show wtfCreateScope, wtfLeave, WtfScopeFn;
import "package:angular2/src/core/application_tokens.dart" show APP_ID;
import "package:angular2/src/core/metadata/view.dart" show ViewEncapsulation;
import "view_type.dart" show ViewType;

/**
 * Service exposing low level API for creating, moving and destroying Views.
 *
 * Most applications should use higher-level abstractions like [DynamicComponentLoader] and
 * [ViewContainerRef] instead.
 */
abstract class AppViewManager {
  /**
   * Returns a [ViewContainerRef] of the View Container at the specified location.
   */
  ViewContainerRef getViewContainer(ElementRef location);
  /**
   * Returns the [ElementRef] that makes up the specified Host View.
   */
  ElementRef getHostElement(HostViewRef hostViewRef);
  /**
   * Searches the Component View of the Component specified via `hostLocation` and returns the
   * [ElementRef] for the Element identified via a Variable Name `variableName`.
   *
   * Throws an exception if the specified `hostLocation` is not a Host Element of a Component, or if
   * variable `variableName` couldn't be found in the Component View of this Component.
   */
  ElementRef getNamedElementInComponentView(
      ElementRef hostLocation, String variableName);
  /**
   * Returns the component instance for the provided Host Element.
   */
  dynamic getComponent(ElementRef hostLocation);
  /**
   * Creates an instance of a Component and attaches it to the first element in the global View
   * (usually DOM Document) that matches the component's selector or `overrideSelector`.
   *
   * This as a low-level way to bootstrap an application and upgrade an existing Element to a
   * Host Element. Most applications should use [DynamicComponentLoader#loadAsRoot] instead.
   *
   * The Component and its View are created based on the `hostProtoComponentRef` which can be
   * obtained
   * by compiling the component with [Compiler#compileInHost].
   *
   * Use [AppViewManager#destroyRootHostView] to destroy the created Component and it's Host
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
  HostViewRef createRootHostView(HostViewFactoryRef hostViewFactoryRef,
      String overrideSelector, Injector injector,
      [List<List<dynamic>> projectableNodes]);
  /**
   * Destroys the Host View created via [AppViewManager#createRootHostView].
   *
   * Along with the Host View, the Component Instance as well as all nested View and Components are
   * destroyed as well.
   */
  destroyRootHostView(HostViewRef hostViewRef);
}

@Injectable()
class AppViewManager_ extends AppViewManager {
  RootRenderer _renderer;
  String _appId;
  num _nextCompTypeId = 0;
  AppViewManager_(this._renderer, @Inject(APP_ID) this._appId) : super() {
    /* super call moved to initializer */;
  }
  ViewContainerRef getViewContainer(ElementRef location) {
    return ((location as ElementRef_)).internalElement.vcRef;
  }

  ElementRef getHostElement(ViewRef hostViewRef) {
    var hostView = ((hostViewRef as ViewRef_)).internalView;
    if (!identical(hostView.type, ViewType.HOST)) {
      throw new BaseException("This operation is only allowed on host views");
    }
    return hostView.getHostViewElement().ref;
  }

  ElementRef getNamedElementInComponentView(
      ElementRef hostLocation, String variableName) {
    var appEl = ((hostLocation as ElementRef_)).internalElement;
    var componentView = appEl.componentView;
    if (isBlank(componentView)) {
      throw new BaseException(
          '''There is no component directive at element ${ hostLocation}''');
    }
    var el = componentView.namedAppElements[variableName];
    if (isPresent(el)) {
      return el.ref;
    }
    throw new BaseException('''Could not find variable ${ variableName}''');
  }

  dynamic getComponent(ElementRef hostLocation) {
    return ((hostLocation as ElementRef_)).internalElement.component;
  }

  /** @internal */
  WtfScopeFn _createRootHostViewScope =
      wtfCreateScope("AppViewManager#createRootHostView()");
  HostViewRef createRootHostView(HostViewFactoryRef hostViewFactoryRef,
      String overrideSelector, Injector injector,
      [List<List<dynamic>> projectableNodes = null]) {
    var s = this._createRootHostViewScope();
    var hostViewFactory =
        ((hostViewFactoryRef as HostViewFactoryRef_)).internalHostViewFactory;
    var selector = isPresent(overrideSelector)
        ? overrideSelector
        : hostViewFactory.selector;
    var view = hostViewFactory.viewFactory(this, injector, null);
    view.create(projectableNodes, selector);
    return wtfLeave(s, view.ref);
  }

  /** @internal */
  WtfScopeFn _destroyRootHostViewScope =
      wtfCreateScope("AppViewManager#destroyRootHostView()");
  destroyRootHostView(ViewRef hostViewRef) {
    var s = this._destroyRootHostViewScope();
    var hostView = ((hostViewRef as ViewRef_)).internalView;
    hostView.renderer.detachView(hostView.flatRootNodes);
    hostView.destroy();
    wtfLeave(s);
  }

  /**
   * Used by the generated code
   */
  RenderComponentType createRenderComponentType(
      String templateUrl,
      num slotCount,
      ViewEncapsulation encapsulation,
      List<dynamic /* String | List < dynamic > */ > styles) {
    return new RenderComponentType(
        '''${ this . _appId}-${ this . _nextCompTypeId ++}''',
        templateUrl,
        slotCount,
        encapsulation,
        styles);
  }

  /** @internal */
  Renderer renderComponent(RenderComponentType renderComponentType) {
    return this._renderer.renderComponent(renderComponentType);
  }
}
