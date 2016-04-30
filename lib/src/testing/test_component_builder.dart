library angular2.src.testing.test_component_builder;

import "dart:async";
import "package:angular2/core.dart"
    show
        OpaqueToken,
        ComponentRef,
        ComponentFactory,
        ComponentResolver,
        Injector,
        Injectable,
        ViewMetadata,
        ElementRef,
        EmbeddedViewRef,
        ChangeDetectorRef,
        provide,
        NgZone,
        NgZoneError;
import "package:angular2/compiler.dart" show DirectiveResolver, ViewResolver;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/facade/lang.dart"
    show Type, isPresent, isBlank, IS_DART;
import "package:angular2/src/facade/async.dart"
    show PromiseWrapper, ObservableWrapper, PromiseCompleter;
import "package:angular2/src/facade/collection.dart"
    show ListWrapper, MapWrapper;
import "utils.dart" show el;
import "package:angular2/src/platform/dom/dom_tokens.dart" show DOCUMENT;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
import "package:angular2/src/core/debug/debug_node.dart"
    show DebugNode, DebugElement, getDebugNode;
import "fake_async.dart" show tick;

var ComponentFixtureAutoDetect = new OpaqueToken("ComponentFixtureAutoDetect");
var ComponentFixtureNoNgZone = new OpaqueToken("ComponentFixtureNoNgZone");

/**
 * Fixture for debugging and testing a component.
 */
class ComponentFixture<T> {
  /**
   * The DebugElement associated with the root element of this component.
   */
  DebugElement debugElement;
  /**
   * The instance of the root component class.
   */
  dynamic componentInstance;
  /**
   * The native element at the root of the component.
   */
  dynamic nativeElement;
  /**
   * The ElementRef for the element at the root of the component.
   */
  ElementRef elementRef;
  /**
   * The ComponentRef for the component
   */
  ComponentRef<T> componentRef;
  /**
   * The ChangeDetectorRef for the component
   */
  ChangeDetectorRef changeDetectorRef;
  /**
   * The NgZone in which this component was instantiated.
   */
  NgZone ngZone;
  bool _autoDetect;
  bool _isStable = true;
  PromiseCompleter<dynamic> _completer = null;
  var _onUnstableSubscription = null;
  var _onStableSubscription = null;
  var _onMicrotaskEmptySubscription = null;
  var _onErrorSubscription = null;
  ComponentFixture(
      ComponentRef<T> componentRef, NgZone ngZone, bool autoDetect) {
    this.changeDetectorRef = componentRef.changeDetectorRef;
    this.elementRef = componentRef.location;
    this.debugElement =
        (getDebugNode(this.elementRef.nativeElement) as DebugElement);
    this.componentInstance = componentRef.instance;
    this.nativeElement = this.elementRef.nativeElement;
    this.componentRef = componentRef;
    this.ngZone = ngZone;
    this._autoDetect = autoDetect;
    if (ngZone != null) {
      this._onUnstableSubscription =
          ObservableWrapper.subscribe(ngZone.onUnstable, (_) {
        this._isStable = false;
      });
      this._onMicrotaskEmptySubscription =
          ObservableWrapper.subscribe(ngZone.onMicrotaskEmpty, (_) {
        if (this._autoDetect) {
          // Do a change detection run with checkNoChanges set to true to check

          // there are no changes on the second run.
          this.detectChanges(true);
        }
      });
      this._onStableSubscription =
          ObservableWrapper.subscribe(ngZone.onStable, (_) {
        this._isStable = true;
        if (this._completer != null) {
          this._completer.resolve(true);
          this._completer = null;
        }
      });
      this._onErrorSubscription =
          ObservableWrapper.subscribe(ngZone.onError, (NgZoneError error) {
        throw error.error;
      });
    }
  }
  _tick(bool checkNoChanges) {
    this.changeDetectorRef.detectChanges();
    if (checkNoChanges) {
      this.checkNoChanges();
    }
  }

  /**
   * Trigger a change detection cycle for the component.
   */
  void detectChanges([bool checkNoChanges = true]) {
    if (this.ngZone != null) {
      // Run the change detection inside the NgZone so that any async tasks as part of the change

      // detection are captured by the zone and can be waited for in isStable.
      this.ngZone.run(() {
        this._tick(checkNoChanges);
      });
    } else {
      // Running without zone. Just do the change detection.
      this._tick(checkNoChanges);
    }
  }

  /**
   * Do a change detection run to make sure there were no changes.
   */
  void checkNoChanges() {
    this.changeDetectorRef.checkNoChanges();
  }

  /**
   * Set whether the fixture should autodetect changes.
   *
   * Also runs detectChanges once so that any existing change is detected.
   */
  autoDetectChanges([bool autoDetect = true]) {
    if (this.ngZone == null) {
      throw new BaseException(
          "Cannot call autoDetectChanges when ComponentFixtureNoNgZone is set");
    }
    this._autoDetect = autoDetect;
    this.detectChanges();
  }

  /**
   * Return whether the fixture is currently stable or has async tasks that have not been completed
   * yet.
   */
  bool isStable() {
    return this._isStable;
  }

  /**
   * Get a promise that resolves when the fixture is stable.
   *
   * This can be used to resume testing after events have triggered asynchronous activity or
   * asynchronous change detection.
   */
  Future<dynamic> whenStable() {
    if (this._isStable) {
      return PromiseWrapper.resolve(false);
    } else {
      this._completer = new PromiseCompleter<dynamic>();
      return this._completer.promise;
    }
  }

  /**
   * Trigger component destruction.
   */
  void destroy() {
    this.componentRef.destroy();
    if (this._onUnstableSubscription != null) {
      ObservableWrapper.dispose(this._onUnstableSubscription);
      this._onUnstableSubscription = null;
    }
    if (this._onStableSubscription != null) {
      ObservableWrapper.dispose(this._onStableSubscription);
      this._onStableSubscription = null;
    }
    if (this._onMicrotaskEmptySubscription != null) {
      ObservableWrapper.dispose(this._onMicrotaskEmptySubscription);
      this._onMicrotaskEmptySubscription = null;
    }
    if (this._onErrorSubscription != null) {
      ObservableWrapper.dispose(this._onErrorSubscription);
      this._onErrorSubscription = null;
    }
  }
}

var _nextRootElementId = 0;

/**
 * Builds a ComponentFixture for use in component level tests.
 */
@Injectable()
class TestComponentBuilder {
  Injector _injector;
  /** @internal */
  var _bindingsOverrides = new Map<Type, List<dynamic>>();
  /** @internal */
  var _directiveOverrides = new Map<Type, Map<Type, Type>>();
  /** @internal */
  var _templateOverrides = new Map<Type, String>();
  /** @internal */
  var _viewBindingsOverrides = new Map<Type, List<dynamic>>();
  /** @internal */
  var _viewOverrides = new Map<Type, ViewMetadata>();
  TestComponentBuilder(this._injector) {}
  /** @internal */
  TestComponentBuilder _clone() {
    var clone = new TestComponentBuilder(this._injector);
    clone._viewOverrides = MapWrapper.clone(this._viewOverrides);
    clone._directiveOverrides = MapWrapper.clone(this._directiveOverrides);
    clone._templateOverrides = MapWrapper.clone(this._templateOverrides);
    clone._bindingsOverrides = MapWrapper.clone(this._bindingsOverrides);
    clone._viewBindingsOverrides =
        MapWrapper.clone(this._viewBindingsOverrides);
    return clone;
  }

  /**
   * Overrides only the html of a [ComponentMetadata].
   * All the other properties of the component's [ViewMetadata] are preserved.
   *
   * 
   * 
   *
   * 
   */
  TestComponentBuilder overrideTemplate(Type componentType, String template) {
    var clone = this._clone();
    clone._templateOverrides[componentType] = template;
    return clone;
  }

  /**
   * Overrides a component's [ViewMetadata].
   *
   * 
   * 
   *
   * 
   */
  TestComponentBuilder overrideView(Type componentType, ViewMetadata view) {
    var clone = this._clone();
    clone._viewOverrides[componentType] = view;
    return clone;
  }

  /**
   * Overrides the directives from the component [ViewMetadata].
   *
   * 
   * 
   * 
   *
   * 
   */
  TestComponentBuilder overrideDirective(
      Type componentType, Type from, Type to) {
    var clone = this._clone();
    var overridesForComponent = clone._directiveOverrides[componentType];
    if (!isPresent(overridesForComponent)) {
      clone._directiveOverrides[componentType] = new Map<Type, Type>();
      overridesForComponent = clone._directiveOverrides[componentType];
    }
    overridesForComponent[from] = to;
    return clone;
  }

  /**
   * Overrides one or more injectables configured via `providers` metadata property of a directive
   * or
   * component.
   * Very useful when certain providers need to be mocked out.
   *
   * The providers specified via this method are appended to the existing `providers` causing the
   * duplicated providers to
   * be overridden.
   *
   * 
   * 
   *
   * 
   */
  TestComponentBuilder overrideProviders(Type type, List<dynamic> providers) {
    var clone = this._clone();
    clone._bindingsOverrides[type] = providers;
    return clone;
  }

  /**
   * 
   */
  TestComponentBuilder overrideBindings(Type type, List<dynamic> providers) {
    return this.overrideProviders(type, providers);
  }

  /**
   * Overrides one or more injectables configured via `providers` metadata property of a directive
   * or
   * component.
   * Very useful when certain providers need to be mocked out.
   *
   * The providers specified via this method are appended to the existing `providers` causing the
   * duplicated providers to
   * be overridden.
   *
   * 
   * 
   *
   * 
   */
  TestComponentBuilder overrideViewProviders(
      Type type, List<dynamic> providers) {
    var clone = this._clone();
    clone._viewBindingsOverrides[type] = providers;
    return clone;
  }

  /**
   * 
   */
  TestComponentBuilder overrideViewBindings(
      Type type, List<dynamic> providers) {
    return this.overrideViewProviders(type, providers);
  }

  ComponentFixture<dynamic/*= C */ > _create/*< C >*/(
      NgZone ngZone, ComponentFactory<dynamic/*= C */ > componentFactory) {
    var rootElId = '''root${ _nextRootElementId ++}''';
    var rootEl = el('''<div id="${ rootElId}"></div>''');
    var doc = this._injector.get(DOCUMENT);
    // TODO(juliemr): can/should this be optional?
    var oldRoots = DOM.querySelectorAll(doc, "[id^=root]");
    for (var i = 0; i < oldRoots.length; i++) {
      DOM.remove(oldRoots[i]);
    }
    DOM.appendChild(doc.body, rootEl);
    var componentRef =
        componentFactory.create(this._injector, [], '''#${ rootElId}''');
    bool autoDetect = this._injector.get(ComponentFixtureAutoDetect, false);
    return new ComponentFixture<dynamic>(componentRef, ngZone, autoDetect);
  }

  /**
   * Builds and returns a ComponentFixture.
   *
   * 
   */
  Future<ComponentFixture<dynamic>> createAsync(Type rootComponentType) {
    var noNgZone =
        IS_DART || this._injector.get(ComponentFixtureNoNgZone, false);
    NgZone ngZone = noNgZone ? null : this._injector.get(NgZone, null);
    var initComponent = () {
      var mockDirectiveResolver = this._injector.get(DirectiveResolver);
      var mockViewResolver = this._injector.get(ViewResolver);
      this
          ._viewOverrides
          .forEach((type, view) => mockViewResolver.setView(type, view));
      this._templateOverrides.forEach((type, template) =>
          mockViewResolver.setInlineTemplate(type, template));
      this._directiveOverrides.forEach((component, overrides) {
        overrides.forEach((from, to) {
          mockViewResolver.overrideViewDirective(component, from, to);
        });
      });
      this._bindingsOverrides.forEach((type, bindings) =>
          mockDirectiveResolver.setBindingsOverride(type, bindings));
      this._viewBindingsOverrides.forEach((type, bindings) =>
          mockDirectiveResolver.setViewBindingsOverride(type, bindings));
      Future<ComponentFactory<dynamic>> promise = this
          ._injector
          .get(ComponentResolver)
          .resolveComponent(rootComponentType);
      return promise
          .then((componentFactory) => this._create(ngZone, componentFactory));
    };
    return ngZone == null ? initComponent() : ngZone.run(initComponent);
  }

  ComponentFixture<dynamic> createFakeAsync(Type rootComponentType) {
    var result;
    var error;
    PromiseWrapper.then(this.createAsync(rootComponentType), (_result) {
      result = _result;
    }, (_error) {
      error = _error;
    });
    tick();
    if (isPresent(error)) {
      throw error;
    }
    return result;
  }

  ComponentFixture<dynamic/*= C */ > createSync/*< C >*/(
      ComponentFactory<dynamic/*= C */ > componentFactory) {
    var noNgZone =
        IS_DART || this._injector.get(ComponentFixtureNoNgZone, false);
    NgZone ngZone = noNgZone ? null : this._injector.get(NgZone, null);
    var initComponent = () => this._create(ngZone, componentFactory);
    return ngZone == null ? initComponent() : ngZone.run(initComponent);
  }
}
