import { NgZone } from 'angular2/src/core/zone/ng_zone';
import { isPresent, assertionsEnabled, print } from 'angular2/src/facade/lang';
import { provide, Injector } from 'angular2/src/core/di';
import { APP_COMPONENT_REF_PROMISE, APP_COMPONENT, PLATFORM_INITIALIZER, APP_INITIALIZER } from './application_tokens';
import { PromiseWrapper, ObservableWrapper } from 'angular2/src/facade/async';
import { ListWrapper } from 'angular2/src/facade/collection';
import { TestabilityRegistry, Testability } from 'angular2/src/core/testability/testability';
import { DynamicComponentLoader } from 'angular2/src/core/linker/dynamic_component_loader';
import { BaseException, ExceptionHandler, unimplemented } from 'angular2/src/facade/exceptions';
import { Console } from 'angular2/src/core/console';
import { wtfLeave, wtfCreateScope } from './profile/profile';
import { lockMode } from 'angular2/src/facade/lang';
/**
 * Construct providers specific to an individual root component.
 */
function _componentProviders(appComponentType) {
    return [provide(APP_COMPONENT, { useValue: appComponentType }),
        provide(APP_COMPONENT_REF_PROMISE, {
            useFactory: (dynamicComponentLoader, appRef, injector) => {
                // Save the ComponentRef for disposal later.
                var ref;
                // TODO(rado): investigate whether to support providers on root
                // component.
                return dynamicComponentLoader.loadAsRoot(appComponentType, null, injector, () => {
                    appRef._unloadComponent(ref);
                })
                    .then((componentRef) => {
                    ref = componentRef;
                    var testability = injector.getOptional(Testability);
                    if (isPresent(testability)) {
                        injector.get(TestabilityRegistry)
                            .registerApplication(componentRef.location.nativeElement, testability);
                    }
                    return componentRef;
                });
            },
            deps: [DynamicComponentLoader, ApplicationRef, Injector]
        }),
        provide(appComponentType, {
            useFactory: (p) => p.then(ref => ref.instance),
            deps: [APP_COMPONENT_REF_PROMISE]
        }),
    ];
}
/**
 * Create an Angular zone.
 */
export function createNgZone() {
    return new NgZone({ enableLongStackTrace: assertionsEnabled() });
}
var _platform;
var _platformProviders;
/**
 * Initialize the Angular 'platform' on the page.
 *
 * See {@link PlatformRef} for details on the Angular platform.
 *
 * It is also possible to specify providers to be made in the new platform. These providers
 * will be shared between all applications on the page. For example, an abstraction for
 * the browser cookie jar should be bound at the platform level, because there is only one
 * cookie jar regardless of how many applications on the page will be accessing it.
 *
 * The platform function can be called multiple times as long as the same list of providers
 * is passed into each call. If the platform function is called with a different set of
 * provides, Angular will throw an exception.
 */
export function platform(providers) {
    lockMode();
    if (isPresent(_platform)) {
        if (ListWrapper.equals(_platformProviders, providers)) {
            return _platform;
        }
        else {
            throw new BaseException("platform cannot be initialized with different sets of providers.");
        }
    }
    else {
        return _createPlatform(providers);
    }
}
/**
 * Dispose the existing platform.
 */
export function disposePlatform() {
    if (isPresent(_platform)) {
        _platform.dispose();
        _platform = null;
    }
}
function _createPlatform(providers) {
    _platformProviders = providers;
    let injector = Injector.resolveAndCreate(providers);
    _platform = new PlatformRef_(injector, () => {
        _platform = null;
        _platformProviders = null;
    });
    _runPlatformInitializers(injector);
    return _platform;
}
function _runPlatformInitializers(injector) {
    let inits = injector.getOptional(PLATFORM_INITIALIZER);
    if (isPresent(inits))
        inits.forEach(init => init());
}
/**
 * The Angular platform is the entry point for Angular on a web page. Each page
 * has exactly one platform, and services (such as reflection) which are common
 * to every Angular application running on the page are bound in its scope.
 *
 * A page's platform is initialized implicitly when {@link bootstrap}() is called, or
 * explicitly by calling {@link platform}().
 */
export class PlatformRef {
    /**
     * Retrieve the platform {@link Injector}, which is the parent injector for
     * every Angular application on the page and provides singleton providers.
     */
    get injector() { throw unimplemented(); }
    ;
}
export class PlatformRef_ extends PlatformRef {
    constructor(_injector, _dispose) {
        super();
        this._injector = _injector;
        this._dispose = _dispose;
        /** @internal */
        this._applications = [];
        /** @internal */
        this._disposeListeners = [];
    }
    registerDisposeListener(dispose) { this._disposeListeners.push(dispose); }
    get injector() { return this._injector; }
    application(providers) {
        var app = this._initApp(createNgZone(), providers);
        if (PromiseWrapper.isPromise(app)) {
            throw new BaseException("Cannot use asyncronous app initializers with application. Use asyncApplication instead.");
        }
        return app;
    }
    asyncApplication(bindingFn, additionalProviders) {
        var zone = createNgZone();
        var completer = PromiseWrapper.completer();
        if (bindingFn === null) {
            completer.resolve(this._initApp(zone, additionalProviders));
        }
        else {
            zone.run(() => {
                PromiseWrapper.then(bindingFn(zone), (providers) => {
                    if (isPresent(additionalProviders)) {
                        providers = ListWrapper.concat(providers, additionalProviders);
                    }
                    let promise = this._initApp(zone, providers);
                    completer.resolve(promise);
                });
            });
        }
        return completer.promise;
    }
    _initApp(zone, providers) {
        var injector;
        var app;
        zone.run(() => {
            providers = ListWrapper.concat(providers, [
                provide(NgZone, { useValue: zone }),
                provide(ApplicationRef, { useFactory: () => app, deps: [] })
            ]);
            var exceptionHandler;
            try {
                injector = this.injector.resolveAndCreateChild(providers);
                exceptionHandler = injector.get(ExceptionHandler);
                ObservableWrapper.subscribe(zone.onError, (error) => {
                    exceptionHandler.call(error.error, error.stackTrace);
                });
            }
            catch (e) {
                if (isPresent(exceptionHandler)) {
                    exceptionHandler.call(e, e.stack);
                }
                else {
                    print(e.toString());
                }
            }
        });
        app = new ApplicationRef_(this, zone, injector);
        this._applications.push(app);
        var promise = _runAppInitializers(injector);
        if (promise !== null) {
            return PromiseWrapper.then(promise, (_) => app);
        }
        else {
            return app;
        }
    }
    dispose() {
        ListWrapper.clone(this._applications).forEach((app) => app.dispose());
        this._disposeListeners.forEach((dispose) => dispose());
        this._dispose();
    }
    /** @internal */
    _applicationDisposed(app) { ListWrapper.remove(this._applications, app); }
}
function _runAppInitializers(injector) {
    let inits = injector.getOptional(APP_INITIALIZER);
    let promises = [];
    if (isPresent(inits)) {
        inits.forEach(init => {
            var retVal = init();
            if (PromiseWrapper.isPromise(retVal)) {
                promises.push(retVal);
            }
        });
    }
    if (promises.length > 0) {
        return PromiseWrapper.all(promises);
    }
    else {
        return null;
    }
}
/**
 * A reference to an Angular application running on a page.
 *
 * For more about Angular applications, see the documentation for {@link bootstrap}.
 */
export class ApplicationRef {
    /**
     * Retrieve the application {@link Injector}.
     */
    get injector() { return unimplemented(); }
    ;
    /**
     * Retrieve the application {@link NgZone}.
     */
    get zone() { return unimplemented(); }
    ;
    /**
     * Get a list of component types registered to this application.
     */
    get componentTypes() { return unimplemented(); }
    ;
}
export class ApplicationRef_ extends ApplicationRef {
    constructor(_platform, _zone, _injector) {
        super();
        this._platform = _platform;
        this._zone = _zone;
        this._injector = _injector;
        /** @internal */
        this._bootstrapListeners = [];
        /** @internal */
        this._disposeListeners = [];
        /** @internal */
        this._rootComponents = [];
        /** @internal */
        this._rootComponentTypes = [];
        /** @internal */
        this._changeDetectorRefs = [];
        /** @internal */
        this._runningTick = false;
        /** @internal */
        this._enforceNoNewChanges = false;
        if (isPresent(this._zone)) {
            ObservableWrapper.subscribe(this._zone.onMicrotaskEmpty, (_) => { this._zone.run(() => { this.tick(); }); });
        }
        this._enforceNoNewChanges = assertionsEnabled();
    }
    registerBootstrapListener(listener) {
        this._bootstrapListeners.push(listener);
    }
    registerDisposeListener(dispose) { this._disposeListeners.push(dispose); }
    registerChangeDetector(changeDetector) {
        this._changeDetectorRefs.push(changeDetector);
    }
    unregisterChangeDetector(changeDetector) {
        ListWrapper.remove(this._changeDetectorRefs, changeDetector);
    }
    bootstrap(componentType, providers) {
        var completer = PromiseWrapper.completer();
        this._zone.run(() => {
            var componentProviders = _componentProviders(componentType);
            if (isPresent(providers)) {
                componentProviders.push(providers);
            }
            var exceptionHandler = this._injector.get(ExceptionHandler);
            this._rootComponentTypes.push(componentType);
            try {
                var injector = this._injector.resolveAndCreateChild(componentProviders);
                var compRefToken = injector.get(APP_COMPONENT_REF_PROMISE);
                var tick = (componentRef) => {
                    this._loadComponent(componentRef);
                    completer.resolve(componentRef);
                };
                var tickResult = PromiseWrapper.then(compRefToken, tick);
                PromiseWrapper.then(tickResult, null, (err, stackTrace) => {
                    completer.reject(err, stackTrace);
                    exceptionHandler.call(err, stackTrace);
                });
            }
            catch (e) {
                exceptionHandler.call(e, e.stack);
                completer.reject(e, e.stack);
            }
        });
        return completer.promise.then((ref) => {
            let c = this._injector.get(Console);
            if (assertionsEnabled()) {
                c.log("Angular 2 is running in the development mode. Call enableProdMode() to enable the production mode.");
            }
            return ref;
        });
    }
    /** @internal */
    _loadComponent(componentRef) {
        var appChangeDetector = componentRef.location.internalElement.parentView;
        this._changeDetectorRefs.push(appChangeDetector.ref);
        this.tick();
        this._rootComponents.push(componentRef);
        this._bootstrapListeners.forEach((listener) => listener(componentRef));
    }
    /** @internal */
    _unloadComponent(componentRef) {
        if (!ListWrapper.contains(this._rootComponents, componentRef)) {
            return;
        }
        this.unregisterChangeDetector(componentRef.location.internalElement.parentView.ref);
        ListWrapper.remove(this._rootComponents, componentRef);
    }
    get injector() { return this._injector; }
    get zone() { return this._zone; }
    tick() {
        if (this._runningTick) {
            throw new BaseException("ApplicationRef.tick is called recursively");
        }
        var s = ApplicationRef_._tickScope();
        try {
            this._runningTick = true;
            this._changeDetectorRefs.forEach((detector) => detector.detectChanges());
            if (this._enforceNoNewChanges) {
                this._changeDetectorRefs.forEach((detector) => detector.checkNoChanges());
            }
        }
        finally {
            this._runningTick = false;
            wtfLeave(s);
        }
    }
    dispose() {
        // TODO(alxhub): Dispose of the NgZone.
        ListWrapper.clone(this._rootComponents).forEach((ref) => ref.dispose());
        this._disposeListeners.forEach((dispose) => dispose());
        this._platform._applicationDisposed(this);
    }
    get componentTypes() { return this._rootComponentTypes; }
}
/** @internal */
ApplicationRef_._tickScope = wtfCreateScope('ApplicationRef#tick()');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb25fcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yREMzdTVScC50bXAvYW5ndWxhcjIvc3JjL2NvcmUvYXBwbGljYXRpb25fcmVmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEVBQUMsTUFBTSxFQUFjLE1BQU0sZ0NBQWdDO09BQzNELEVBR0wsU0FBUyxFQUNULGlCQUFpQixFQUNqQixLQUFLLEVBRU4sTUFBTSwwQkFBMEI7T0FDMUIsRUFBQyxPQUFPLEVBQVksUUFBUSxFQUFjLE1BQU0sc0JBQXNCO09BQ3RFLEVBQ0wseUJBQXlCLEVBQ3pCLGFBQWEsRUFFYixvQkFBb0IsRUFDcEIsZUFBZSxFQUNoQixNQUFNLHNCQUFzQjtPQUN0QixFQUFDLGNBQWMsRUFBb0IsaUJBQWlCLEVBQUMsTUFBTSwyQkFBMkI7T0FDdEYsRUFBQyxXQUFXLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDbkQsRUFBQyxtQkFBbUIsRUFBRSxXQUFXLEVBQUMsTUFBTSwyQ0FBMkM7T0FDbkYsRUFFTCxzQkFBc0IsRUFDdkIsTUFBTSxtREFBbUQ7T0FDbkQsRUFDTCxhQUFhLEVBRWIsZ0JBQWdCLEVBQ2hCLGFBQWEsRUFDZCxNQUFNLGdDQUFnQztPQUNoQyxFQUFDLE9BQU8sRUFBQyxNQUFNLDJCQUEyQjtPQUMxQyxFQUFDLFFBQVEsRUFBRSxjQUFjLEVBQWEsTUFBTSxtQkFBbUI7T0FFL0QsRUFBQyxRQUFRLEVBQUMsTUFBTSwwQkFBMEI7QUFHakQ7O0dBRUc7QUFDSCw2QkFBNkIsZ0JBQXNCO0lBQ2pELE1BQU0sQ0FBUSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsRUFBQyxRQUFRLEVBQUUsZ0JBQWdCLEVBQUMsQ0FBQztRQUNwRCxPQUFPLENBQUMseUJBQXlCLEVBQ3pCO1lBQ0UsVUFBVSxFQUFFLENBQUMsc0JBQThDLEVBQzlDLE1BQXVCLEVBQUUsUUFBa0I7Z0JBQ3RELDRDQUE0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QUFDLENBQUMsQ0FBQztBQUNuRSxDQUFDO0FBaklDLGdCQUFnQjtBQUNULDBCQUFVLEdBQWUsY0FBYyxDQUFDLHVCQUF1QixDQUFDLENBZ0l4RSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Tmdab25lLCBOZ1pvbmVFcnJvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvem9uZS9uZ196b25lJztcbmltcG9ydCB7XG4gIFR5cGUsXG4gIGlzQmxhbmssXG4gIGlzUHJlc2VudCxcbiAgYXNzZXJ0aW9uc0VuYWJsZWQsXG4gIHByaW50LFxuICBJU19EQVJUXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge3Byb3ZpZGUsIFByb3ZpZGVyLCBJbmplY3RvciwgT3BhcXVlVG9rZW59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7XG4gIEFQUF9DT01QT05FTlRfUkVGX1BST01JU0UsXG4gIEFQUF9DT01QT05FTlQsXG4gIEFQUF9JRF9SQU5ET01fUFJPVklERVIsXG4gIFBMQVRGT1JNX0lOSVRJQUxJWkVSLFxuICBBUFBfSU5JVElBTElaRVJcbn0gZnJvbSAnLi9hcHBsaWNhdGlvbl90b2tlbnMnO1xuaW1wb3J0IHtQcm9taXNlV3JhcHBlciwgUHJvbWlzZUNvbXBsZXRlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7VGVzdGFiaWxpdHlSZWdpc3RyeSwgVGVzdGFiaWxpdHl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3Rlc3RhYmlsaXR5L3Rlc3RhYmlsaXR5JztcbmltcG9ydCB7XG4gIENvbXBvbmVudFJlZixcbiAgRHluYW1pY0NvbXBvbmVudExvYWRlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvZHluYW1pY19jb21wb25lbnRfbG9hZGVyJztcbmltcG9ydCB7XG4gIEJhc2VFeGNlcHRpb24sXG4gIFdyYXBwZWRFeGNlcHRpb24sXG4gIEV4Y2VwdGlvbkhhbmRsZXIsXG4gIHVuaW1wbGVtZW50ZWRcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7Q29uc29sZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY29uc29sZSc7XG5pbXBvcnQge3d0ZkxlYXZlLCB3dGZDcmVhdGVTY29wZSwgV3RmU2NvcGVGbn0gZnJvbSAnLi9wcm9maWxlL3Byb2ZpbGUnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3RvclJlZn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0b3JfcmVmJztcbmltcG9ydCB7bG9ja01vZGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0VsZW1lbnRSZWZffSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvZWxlbWVudF9yZWYnO1xuXG4vKipcbiAqIENvbnN0cnVjdCBwcm92aWRlcnMgc3BlY2lmaWMgdG8gYW4gaW5kaXZpZHVhbCByb290IGNvbXBvbmVudC5cbiAqL1xuZnVuY3Rpb24gX2NvbXBvbmVudFByb3ZpZGVycyhhcHBDb21wb25lbnRUeXBlOiBUeXBlKTogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+IHtcbiAgcmV0dXJuIDxhbnlbXT5bcHJvdmlkZShBUFBfQ09NUE9ORU5ULCB7dXNlVmFsdWU6IGFwcENvbXBvbmVudFR5cGV9KSxcbiAgICAgICAgICAgICAgICAgcHJvdmlkZShBUFBfQ09NUE9ORU5UX1JFRl9QUk9NSVNFLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZUZhY3Rvcnk6IChkeW5hbWljQ29tcG9uZW50TG9hZGVyOiBEeW5hbWljQ29tcG9uZW50TG9hZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcFJlZjogQXBwbGljYXRpb25SZWZfLCBpbmplY3RvcjogSW5qZWN0b3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2F2ZSB0aGUgQ29tcG9uZW50UmVmIGZvciBkaXNwb3NhbCBsYXRlci5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlZjogQ29tcG9uZW50UmVmO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPKHJhZG8pOiBpbnZlc3RpZ2F0ZSB3aGV0aGVyIHRvIHN1cHBvcnQgcHJvdmlkZXJzIG9uIHJvb3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29tcG9uZW50LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZHluYW1pY0NvbXBvbmVudExvYWRlci5sb2FkQXNSb290KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBDb21wb25lbnRUeXBlLCBudWxsLCBpbmplY3RvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcFJlZi5fdW5sb2FkQ29tcG9uZW50KHJlZik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoY29tcG9uZW50UmVmKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZiA9IGNvbXBvbmVudFJlZjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRlc3RhYmlsaXR5ID0gaW5qZWN0b3IuZ2V0T3B0aW9uYWwoVGVzdGFiaWxpdHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNQcmVzZW50KHRlc3RhYmlsaXR5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdG9yLmdldChUZXN0YWJpbGl0eVJlZ2lzdHJ5KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVnaXN0ZXJBcHBsaWNhdGlvbihjb21wb25lbnRSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdGFiaWxpdHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21wb25lbnRSZWY7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBzOiBbRHluYW1pY0NvbXBvbmVudExvYWRlciwgQXBwbGljYXRpb25SZWYsIEluamVjdG9yXVxuICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICBwcm92aWRlKGFwcENvbXBvbmVudFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlRmFjdG9yeTogKHA6IFByb21pc2U8YW55PikgPT4gcC50aGVuKHJlZiA9PiByZWYuaW5zdGFuY2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwczogW0FQUF9DT01QT05FTlRfUkVGX1BST01JU0VdXG4gICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gIF07XG59XG5cbi8qKlxuICogQ3JlYXRlIGFuIEFuZ3VsYXIgem9uZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU5nWm9uZSgpOiBOZ1pvbmUge1xuICByZXR1cm4gbmV3IE5nWm9uZSh7ZW5hYmxlTG9uZ1N0YWNrVHJhY2U6IGFzc2VydGlvbnNFbmFibGVkKCl9KTtcbn1cblxudmFyIF9wbGF0Zm9ybTogUGxhdGZvcm1SZWY7XG52YXIgX3BsYXRmb3JtUHJvdmlkZXJzOiBhbnlbXTtcblxuLyoqXG4gKiBJbml0aWFsaXplIHRoZSBBbmd1bGFyICdwbGF0Zm9ybScgb24gdGhlIHBhZ2UuXG4gKlxuICogU2VlIHtAbGluayBQbGF0Zm9ybVJlZn0gZm9yIGRldGFpbHMgb24gdGhlIEFuZ3VsYXIgcGxhdGZvcm0uXG4gKlxuICogSXQgaXMgYWxzbyBwb3NzaWJsZSB0byBzcGVjaWZ5IHByb3ZpZGVycyB0byBiZSBtYWRlIGluIHRoZSBuZXcgcGxhdGZvcm0uIFRoZXNlIHByb3ZpZGVyc1xuICogd2lsbCBiZSBzaGFyZWQgYmV0d2VlbiBhbGwgYXBwbGljYXRpb25zIG9uIHRoZSBwYWdlLiBGb3IgZXhhbXBsZSwgYW4gYWJzdHJhY3Rpb24gZm9yXG4gKiB0aGUgYnJvd3NlciBjb29raWUgamFyIHNob3VsZCBiZSBib3VuZCBhdCB0aGUgcGxhdGZvcm0gbGV2ZWwsIGJlY2F1c2UgdGhlcmUgaXMgb25seSBvbmVcbiAqIGNvb2tpZSBqYXIgcmVnYXJkbGVzcyBvZiBob3cgbWFueSBhcHBsaWNhdGlvbnMgb24gdGhlIHBhZ2Ugd2lsbCBiZSBhY2Nlc3NpbmcgaXQuXG4gKlxuICogVGhlIHBsYXRmb3JtIGZ1bmN0aW9uIGNhbiBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgYXMgbG9uZyBhcyB0aGUgc2FtZSBsaXN0IG9mIHByb3ZpZGVyc1xuICogaXMgcGFzc2VkIGludG8gZWFjaCBjYWxsLiBJZiB0aGUgcGxhdGZvcm0gZnVuY3Rpb24gaXMgY2FsbGVkIHdpdGggYSBkaWZmZXJlbnQgc2V0IG9mXG4gKiBwcm92aWRlcywgQW5ndWxhciB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBsYXRmb3JtKHByb3ZpZGVycz86IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPik6IFBsYXRmb3JtUmVmIHtcbiAgbG9ja01vZGUoKTtcbiAgaWYgKGlzUHJlc2VudChfcGxhdGZvcm0pKSB7XG4gICAgaWYgKExpc3RXcmFwcGVyLmVxdWFscyhfcGxhdGZvcm1Qcm92aWRlcnMsIHByb3ZpZGVycykpIHtcbiAgICAgIHJldHVybiBfcGxhdGZvcm07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFwicGxhdGZvcm0gY2Fubm90IGJlIGluaXRpYWxpemVkIHdpdGggZGlmZmVyZW50IHNldHMgb2YgcHJvdmlkZXJzLlwiKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIF9jcmVhdGVQbGF0Zm9ybShwcm92aWRlcnMpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcG9zZSB0aGUgZXhpc3RpbmcgcGxhdGZvcm0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXNwb3NlUGxhdGZvcm0oKTogdm9pZCB7XG4gIGlmIChpc1ByZXNlbnQoX3BsYXRmb3JtKSkge1xuICAgIF9wbGF0Zm9ybS5kaXNwb3NlKCk7XG4gICAgX3BsYXRmb3JtID0gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBfY3JlYXRlUGxhdGZvcm0ocHJvdmlkZXJzPzogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogUGxhdGZvcm1SZWYge1xuICBfcGxhdGZvcm1Qcm92aWRlcnMgPSBwcm92aWRlcnM7XG4gIGxldCBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUocHJvdmlkZXJzKTtcbiAgX3BsYXRmb3JtID0gbmV3IFBsYXRmb3JtUmVmXyhpbmplY3RvciwgKCkgPT4ge1xuICAgIF9wbGF0Zm9ybSA9IG51bGw7XG4gICAgX3BsYXRmb3JtUHJvdmlkZXJzID0gbnVsbDtcbiAgfSk7XG4gIF9ydW5QbGF0Zm9ybUluaXRpYWxpemVycyhpbmplY3Rvcik7XG4gIHJldHVybiBfcGxhdGZvcm07XG59XG5cbmZ1bmN0aW9uIF9ydW5QbGF0Zm9ybUluaXRpYWxpemVycyhpbmplY3RvcjogSW5qZWN0b3IpOiB2b2lkIHtcbiAgbGV0IGluaXRzOiBGdW5jdGlvbltdID0gPEZ1bmN0aW9uW10+aW5qZWN0b3IuZ2V0T3B0aW9uYWwoUExBVEZPUk1fSU5JVElBTElaRVIpO1xuICBpZiAoaXNQcmVzZW50KGluaXRzKSkgaW5pdHMuZm9yRWFjaChpbml0ID0+IGluaXQoKSk7XG59XG5cbi8qKlxuICogVGhlIEFuZ3VsYXIgcGxhdGZvcm0gaXMgdGhlIGVudHJ5IHBvaW50IGZvciBBbmd1bGFyIG9uIGEgd2ViIHBhZ2UuIEVhY2ggcGFnZVxuICogaGFzIGV4YWN0bHkgb25lIHBsYXRmb3JtLCBhbmQgc2VydmljZXMgKHN1Y2ggYXMgcmVmbGVjdGlvbikgd2hpY2ggYXJlIGNvbW1vblxuICogdG8gZXZlcnkgQW5ndWxhciBhcHBsaWNhdGlvbiBydW5uaW5nIG9uIHRoZSBwYWdlIGFyZSBib3VuZCBpbiBpdHMgc2NvcGUuXG4gKlxuICogQSBwYWdlJ3MgcGxhdGZvcm0gaXMgaW5pdGlhbGl6ZWQgaW1wbGljaXRseSB3aGVuIHtAbGluayBib290c3RyYXB9KCkgaXMgY2FsbGVkLCBvclxuICogZXhwbGljaXRseSBieSBjYWxsaW5nIHtAbGluayBwbGF0Zm9ybX0oKS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFBsYXRmb3JtUmVmIHtcbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgbGlzdGVuZXIgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHBsYXRmb3JtIGlzIGRpc3Bvc2VkLlxuICAgKi9cbiAgYWJzdHJhY3QgcmVnaXN0ZXJEaXNwb3NlTGlzdGVuZXIoZGlzcG9zZTogKCkgPT4gdm9pZCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHRoZSBwbGF0Zm9ybSB7QGxpbmsgSW5qZWN0b3J9LCB3aGljaCBpcyB0aGUgcGFyZW50IGluamVjdG9yIGZvclxuICAgKiBldmVyeSBBbmd1bGFyIGFwcGxpY2F0aW9uIG9uIHRoZSBwYWdlIGFuZCBwcm92aWRlcyBzaW5nbGV0b24gcHJvdmlkZXJzLlxuICAgKi9cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHsgdGhyb3cgdW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBJbnN0YW50aWF0ZSBhIG5ldyBBbmd1bGFyIGFwcGxpY2F0aW9uIG9uIHRoZSBwYWdlLlxuICAgKlxuICAgKiAjIyMgV2hhdCBpcyBhbiBhcHBsaWNhdGlvbj9cbiAgICpcbiAgICogRWFjaCBBbmd1bGFyIGFwcGxpY2F0aW9uIGhhcyBpdHMgb3duIHpvbmUsIGNoYW5nZSBkZXRlY3Rpb24sIGNvbXBpbGVyLFxuICAgKiByZW5kZXJlciwgYW5kIG90aGVyIGZyYW1ld29yayBjb21wb25lbnRzLiBBbiBhcHBsaWNhdGlvbiBob3N0cyBvbmUgb3IgbW9yZVxuICAgKiByb290IGNvbXBvbmVudHMsIHdoaWNoIGNhbiBiZSBpbml0aWFsaXplZCB2aWEgYEFwcGxpY2F0aW9uUmVmLmJvb3RzdHJhcCgpYC5cbiAgICpcbiAgICogIyMjIEFwcGxpY2F0aW9uIFByb3ZpZGVyc1xuICAgKlxuICAgKiBBbmd1bGFyIGFwcGxpY2F0aW9ucyByZXF1aXJlIG51bWVyb3VzIHByb3ZpZGVycyB0byBiZSBwcm9wZXJseSBpbnN0YW50aWF0ZWQuXG4gICAqIFdoZW4gdXNpbmcgYGFwcGxpY2F0aW9uKClgIHRvIGNyZWF0ZSBhIG5ldyBhcHAgb24gdGhlIHBhZ2UsIHRoZXNlIHByb3ZpZGVyc1xuICAgKiBtdXN0IGJlIHByb3ZpZGVkLiBGb3J0dW5hdGVseSwgdGhlcmUgYXJlIGhlbHBlciBmdW5jdGlvbnMgdG8gY29uZmlndXJlXG4gICAqIHR5cGljYWwgcHJvdmlkZXJzLCBhcyBzaG93biBpbiB0aGUgZXhhbXBsZSBiZWxvdy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICoge0BleGFtcGxlIGNvcmUvdHMvcGxhdGZvcm0vcGxhdGZvcm0udHMgcmVnaW9uPSdsb25nZm9ybSd9XG4gICAqICMjIyBTZWUgQWxzb1xuICAgKlxuICAgKiBTZWUgdGhlIHtAbGluayBib290c3RyYXB9IGRvY3VtZW50YXRpb24gZm9yIG1vcmUgZGV0YWlscy5cbiAgICovXG4gIGFic3RyYWN0IGFwcGxpY2F0aW9uKHByb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogQXBwbGljYXRpb25SZWY7XG5cbiAgLyoqXG4gICAqIEluc3RhbnRpYXRlIGEgbmV3IEFuZ3VsYXIgYXBwbGljYXRpb24gb24gdGhlIHBhZ2UsIHVzaW5nIHByb3ZpZGVycyB3aGljaFxuICAgKiBhcmUgb25seSBhdmFpbGFibGUgYXN5bmNocm9ub3VzbHkuIE9uZSBzdWNoIHVzZSBjYXNlIGlzIHRvIGluaXRpYWxpemUgYW5cbiAgICogYXBwbGljYXRpb24gcnVubmluZyBpbiBhIHdlYiB3b3JrZXIuXG4gICAqXG4gICAqICMjIyBVc2FnZVxuICAgKlxuICAgKiBgYmluZGluZ0ZuYCBpcyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBjYWxsZWQgaW4gdGhlIG5ldyBhcHBsaWNhdGlvbidzIHpvbmUuXG4gICAqIEl0IHNob3VsZCByZXR1cm4gYSBgUHJvbWlzZWAgdG8gYSBsaXN0IG9mIHByb3ZpZGVycyB0byBiZSB1c2VkIGZvciB0aGVcbiAgICogbmV3IGFwcGxpY2F0aW9uLiBPbmNlIHRoaXMgcHJvbWlzZSByZXNvbHZlcywgdGhlIGFwcGxpY2F0aW9uIHdpbGwgYmVcbiAgICogY29uc3RydWN0ZWQgaW4gdGhlIHNhbWUgbWFubmVyIGFzIGEgbm9ybWFsIGBhcHBsaWNhdGlvbigpYC5cbiAgICovXG4gIGFic3RyYWN0IGFzeW5jQXBwbGljYXRpb24oYmluZGluZ0ZuOiAoem9uZTogTmdab25lKSA9PiBQcm9taXNlPEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPj4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJzPzogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogUHJvbWlzZTxBcHBsaWNhdGlvblJlZj47XG5cbiAgLyoqXG4gICAqIERlc3Ryb3kgdGhlIEFuZ3VsYXIgcGxhdGZvcm0gYW5kIGFsbCBBbmd1bGFyIGFwcGxpY2F0aW9ucyBvbiB0aGUgcGFnZS5cbiAgICovXG4gIGFic3RyYWN0IGRpc3Bvc2UoKTogdm9pZDtcbn1cblxuZXhwb3J0IGNsYXNzIFBsYXRmb3JtUmVmXyBleHRlbmRzIFBsYXRmb3JtUmVmIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYXBwbGljYXRpb25zOiBBcHBsaWNhdGlvblJlZltdID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Rpc3Bvc2VMaXN0ZW5lcnM6IEZ1bmN0aW9uW10gPSBbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3IsIHByaXZhdGUgX2Rpc3Bvc2U6ICgpID0+IHZvaWQpIHsgc3VwZXIoKTsgfVxuXG4gIHJlZ2lzdGVyRGlzcG9zZUxpc3RlbmVyKGRpc3Bvc2U6ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fZGlzcG9zZUxpc3RlbmVycy5wdXNoKGRpc3Bvc2UpOyB9XG5cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIHRoaXMuX2luamVjdG9yOyB9XG5cbiAgYXBwbGljYXRpb24ocHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBBcHBsaWNhdGlvblJlZiB7XG4gICAgdmFyIGFwcCA9IHRoaXMuX2luaXRBcHAoY3JlYXRlTmdab25lKCksIHByb3ZpZGVycyk7XG4gICAgaWYgKFByb21pc2VXcmFwcGVyLmlzUHJvbWlzZShhcHApKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICBcIkNhbm5vdCB1c2UgYXN5bmNyb25vdXMgYXBwIGluaXRpYWxpemVycyB3aXRoIGFwcGxpY2F0aW9uLiBVc2UgYXN5bmNBcHBsaWNhdGlvbiBpbnN0ZWFkLlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIDxBcHBsaWNhdGlvblJlZj5hcHA7XG4gIH1cblxuICBhc3luY0FwcGxpY2F0aW9uKGJpbmRpbmdGbjogKHpvbmU6IE5nWm9uZSkgPT4gUHJvbWlzZTxBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4+LFxuICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxQcm92aWRlcnM/OiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBQcm9taXNlPEFwcGxpY2F0aW9uUmVmPiB7XG4gICAgdmFyIHpvbmUgPSBjcmVhdGVOZ1pvbmUoKTtcbiAgICB2YXIgY29tcGxldGVyID0gUHJvbWlzZVdyYXBwZXIuY29tcGxldGVyPEFwcGxpY2F0aW9uUmVmPigpO1xuICAgIGlmIChiaW5kaW5nRm4gPT09IG51bGwpIHtcbiAgICAgIGNvbXBsZXRlci5yZXNvbHZlKHRoaXMuX2luaXRBcHAoem9uZSwgYWRkaXRpb25hbFByb3ZpZGVycykpO1xuICAgIH0gZWxzZSB7XG4gICAgICB6b25lLnJ1bigoKSA9PiB7XG4gICAgICAgIFByb21pc2VXcmFwcGVyLnRoZW4oYmluZGluZ0ZuKHpvbmUpLCAocHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pID0+IHtcbiAgICAgICAgICBpZiAoaXNQcmVzZW50KGFkZGl0aW9uYWxQcm92aWRlcnMpKSB7XG4gICAgICAgICAgICBwcm92aWRlcnMgPSBMaXN0V3JhcHBlci5jb25jYXQocHJvdmlkZXJzLCBhZGRpdGlvbmFsUHJvdmlkZXJzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IHByb21pc2UgPSB0aGlzLl9pbml0QXBwKHpvbmUsIHByb3ZpZGVycyk7XG4gICAgICAgICAgY29tcGxldGVyLnJlc29sdmUocHJvbWlzZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBjb21wbGV0ZXIucHJvbWlzZTtcbiAgfVxuXG4gIHByaXZhdGUgX2luaXRBcHAoem9uZTogTmdab25lLFxuICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogUHJvbWlzZTxBcHBsaWNhdGlvblJlZj58XG4gICAgICBBcHBsaWNhdGlvblJlZiB7XG4gICAgdmFyIGluamVjdG9yOiBJbmplY3RvcjtcbiAgICB2YXIgYXBwOiBBcHBsaWNhdGlvblJlZjtcbiAgICB6b25lLnJ1bigoKSA9PiB7XG4gICAgICBwcm92aWRlcnMgPSBMaXN0V3JhcHBlci5jb25jYXQocHJvdmlkZXJzLCBbXG4gICAgICAgIHByb3ZpZGUoTmdab25lLCB7dXNlVmFsdWU6IHpvbmV9KSxcbiAgICAgICAgcHJvdmlkZShBcHBsaWNhdGlvblJlZiwge3VzZUZhY3Rvcnk6ICgpOiBBcHBsaWNhdGlvblJlZiA9PiBhcHAsIGRlcHM6IFtdfSlcbiAgICAgIF0pO1xuXG4gICAgICB2YXIgZXhjZXB0aW9uSGFuZGxlcjogRXhjZXB0aW9uSGFuZGxlcjtcbiAgICAgIHRyeSB7XG4gICAgICAgIGluamVjdG9yID0gdGhpcy5pbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlQ2hpbGQocHJvdmlkZXJzKTtcbiAgICAgICAgZXhjZXB0aW9uSGFuZGxlciA9IGluamVjdG9yLmdldChFeGNlcHRpb25IYW5kbGVyKTtcbiAgICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHpvbmUub25FcnJvciwgKGVycm9yOiBOZ1pvbmVFcnJvcikgPT4ge1xuICAgICAgICAgIGV4Y2VwdGlvbkhhbmRsZXIuY2FsbChlcnJvci5lcnJvciwgZXJyb3Iuc3RhY2tUcmFjZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoaXNQcmVzZW50KGV4Y2VwdGlvbkhhbmRsZXIpKSB7XG4gICAgICAgICAgZXhjZXB0aW9uSGFuZGxlci5jYWxsKGUsIGUuc3RhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByaW50KGUudG9TdHJpbmcoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICBhcHAgPSBuZXcgQXBwbGljYXRpb25SZWZfKHRoaXMsIHpvbmUsIGluamVjdG9yKTtcbiAgICB0aGlzLl9hcHBsaWNhdGlvbnMucHVzaChhcHApO1xuICAgIHZhciBwcm9taXNlID0gX3J1bkFwcEluaXRpYWxpemVycyhpbmplY3Rvcik7XG4gICAgaWYgKHByb21pc2UgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiBQcm9taXNlV3JhcHBlci50aGVuKHByb21pc2UsIChfKSA9PiBhcHApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYXBwO1xuICAgIH1cbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgTGlzdFdyYXBwZXIuY2xvbmUodGhpcy5fYXBwbGljYXRpb25zKS5mb3JFYWNoKChhcHApID0+IGFwcC5kaXNwb3NlKCkpO1xuICAgIHRoaXMuX2Rpc3Bvc2VMaXN0ZW5lcnMuZm9yRWFjaCgoZGlzcG9zZSkgPT4gZGlzcG9zZSgpKTtcbiAgICB0aGlzLl9kaXNwb3NlKCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hcHBsaWNhdGlvbkRpc3Bvc2VkKGFwcDogQXBwbGljYXRpb25SZWYpOiB2b2lkIHsgTGlzdFdyYXBwZXIucmVtb3ZlKHRoaXMuX2FwcGxpY2F0aW9ucywgYXBwKTsgfVxufVxuXG5mdW5jdGlvbiBfcnVuQXBwSW5pdGlhbGl6ZXJzKGluamVjdG9yOiBJbmplY3Rvcik6IFByb21pc2U8YW55PiB7XG4gIGxldCBpbml0czogRnVuY3Rpb25bXSA9IGluamVjdG9yLmdldE9wdGlvbmFsKEFQUF9JTklUSUFMSVpFUik7XG4gIGxldCBwcm9taXNlczogUHJvbWlzZTxhbnk+W10gPSBbXTtcbiAgaWYgKGlzUHJlc2VudChpbml0cykpIHtcbiAgICBpbml0cy5mb3JFYWNoKGluaXQgPT4ge1xuICAgICAgdmFyIHJldFZhbCA9IGluaXQoKTtcbiAgICAgIGlmIChQcm9taXNlV3JhcHBlci5pc1Byb21pc2UocmV0VmFsKSkge1xuICAgICAgICBwcm9taXNlcy5wdXNoKHJldFZhbCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgaWYgKHByb21pc2VzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIuYWxsKHByb21pc2VzKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIEEgcmVmZXJlbmNlIHRvIGFuIEFuZ3VsYXIgYXBwbGljYXRpb24gcnVubmluZyBvbiBhIHBhZ2UuXG4gKlxuICogRm9yIG1vcmUgYWJvdXQgQW5ndWxhciBhcHBsaWNhdGlvbnMsIHNlZSB0aGUgZG9jdW1lbnRhdGlvbiBmb3Ige0BsaW5rIGJvb3RzdHJhcH0uXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBcHBsaWNhdGlvblJlZiB7XG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGxpc3RlbmVyIHRvIGJlIGNhbGxlZCBlYWNoIHRpbWUgYGJvb3RzdHJhcCgpYCBpcyBjYWxsZWQgdG8gYm9vdHN0cmFwXG4gICAqIGEgbmV3IHJvb3QgY29tcG9uZW50LlxuICAgKi9cbiAgYWJzdHJhY3QgcmVnaXN0ZXJCb290c3RyYXBMaXN0ZW5lcihsaXN0ZW5lcjogKHJlZjogQ29tcG9uZW50UmVmKSA9PiB2b2lkKTogdm9pZDtcblxuICAvKipcbiAgICogUmVnaXN0ZXIgYSBsaXN0ZW5lciB0byBiZSBjYWxsZWQgd2hlbiB0aGUgYXBwbGljYXRpb24gaXMgZGlzcG9zZWQuXG4gICAqL1xuICBhYnN0cmFjdCByZWdpc3RlckRpc3Bvc2VMaXN0ZW5lcihkaXNwb3NlOiAoKSA9PiB2b2lkKTogdm9pZDtcblxuICAvKipcbiAgICogQm9vdHN0cmFwIGEgbmV3IGNvbXBvbmVudCBhdCB0aGUgcm9vdCBsZXZlbCBvZiB0aGUgYXBwbGljYXRpb24uXG4gICAqXG4gICAqICMjIyBCb290c3RyYXAgcHJvY2Vzc1xuICAgKlxuICAgKiBXaGVuIGJvb3RzdHJhcHBpbmcgYSBuZXcgcm9vdCBjb21wb25lbnQgaW50byBhbiBhcHBsaWNhdGlvbiwgQW5ndWxhciBtb3VudHMgdGhlXG4gICAqIHNwZWNpZmllZCBhcHBsaWNhdGlvbiBjb21wb25lbnQgb250byBET00gZWxlbWVudHMgaWRlbnRpZmllZCBieSB0aGUgW2NvbXBvbmVudFR5cGVdJ3NcbiAgICogc2VsZWN0b3IgYW5kIGtpY2tzIG9mZiBhdXRvbWF0aWMgY2hhbmdlIGRldGVjdGlvbiB0byBmaW5pc2ggaW5pdGlhbGl6aW5nIHRoZSBjb21wb25lbnQuXG4gICAqXG4gICAqICMjIyBPcHRpb25hbCBQcm92aWRlcnNcbiAgICpcbiAgICogUHJvdmlkZXJzIGZvciB0aGUgZ2l2ZW4gY29tcG9uZW50IGNhbiBvcHRpb25hbGx5IGJlIG92ZXJyaWRkZW4gdmlhIHRoZSBgcHJvdmlkZXJzYFxuICAgKiBwYXJhbWV0ZXIuIFRoZXNlIHByb3ZpZGVycyB3aWxsIG9ubHkgYXBwbHkgZm9yIHRoZSByb290IGNvbXBvbmVudCBiZWluZyBhZGRlZCBhbmQgYW55XG4gICAqIGNoaWxkIGNvbXBvbmVudHMgdW5kZXIgaXQuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqIHtAZXhhbXBsZSBjb3JlL3RzL3BsYXRmb3JtL3BsYXRmb3JtLnRzIHJlZ2lvbj0nbG9uZ2Zvcm0nfVxuICAgKi9cbiAgYWJzdHJhY3QgYm9vdHN0cmFwKGNvbXBvbmVudFR5cGU6IFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM/OiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBQcm9taXNlPENvbXBvbmVudFJlZj47XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHRoZSBhcHBsaWNhdGlvbiB7QGxpbmsgSW5qZWN0b3J9LlxuICAgKi9cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIDxJbmplY3Rvcj51bmltcGxlbWVudGVkKCk7IH07XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHRoZSBhcHBsaWNhdGlvbiB7QGxpbmsgTmdab25lfS5cbiAgICovXG4gIGdldCB6b25lKCk6IE5nWm9uZSB7IHJldHVybiA8Tmdab25lPnVuaW1wbGVtZW50ZWQoKTsgfTtcblxuICAvKipcbiAgICogRGlzcG9zZSBvZiB0aGlzIGFwcGxpY2F0aW9uIGFuZCBhbGwgb2YgaXRzIGNvbXBvbmVudHMuXG4gICAqL1xuICBhYnN0cmFjdCBkaXNwb3NlKCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEludm9rZSB0aGlzIG1ldGhvZCB0byBleHBsaWNpdGx5IHByb2Nlc3MgY2hhbmdlIGRldGVjdGlvbiBhbmQgaXRzIHNpZGUtZWZmZWN0cy5cbiAgICpcbiAgICogSW4gZGV2ZWxvcG1lbnQgbW9kZSwgYHRpY2soKWAgYWxzbyBwZXJmb3JtcyBhIHNlY29uZCBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlIHRvIGVuc3VyZSB0aGF0IG5vXG4gICAqIGZ1cnRoZXIgY2hhbmdlcyBhcmUgZGV0ZWN0ZWQuIElmIGFkZGl0aW9uYWwgY2hhbmdlcyBhcmUgcGlja2VkIHVwIGR1cmluZyB0aGlzIHNlY29uZCBjeWNsZSxcbiAgICogYmluZGluZ3MgaW4gdGhlIGFwcCBoYXZlIHNpZGUtZWZmZWN0cyB0aGF0IGNhbm5vdCBiZSByZXNvbHZlZCBpbiBhIHNpbmdsZSBjaGFuZ2UgZGV0ZWN0aW9uXG4gICAqIHBhc3MuXG4gICAqIEluIHRoaXMgY2FzZSwgQW5ndWxhciB0aHJvd3MgYW4gZXJyb3IsIHNpbmNlIGFuIEFuZ3VsYXIgYXBwbGljYXRpb24gY2FuIG9ubHkgaGF2ZSBvbmUgY2hhbmdlXG4gICAqIGRldGVjdGlvbiBwYXNzIGR1cmluZyB3aGljaCBhbGwgY2hhbmdlIGRldGVjdGlvbiBtdXN0IGNvbXBsZXRlLlxuICAgKi9cbiAgYWJzdHJhY3QgdGljaygpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBHZXQgYSBsaXN0IG9mIGNvbXBvbmVudCB0eXBlcyByZWdpc3RlcmVkIHRvIHRoaXMgYXBwbGljYXRpb24uXG4gICAqL1xuICBnZXQgY29tcG9uZW50VHlwZXMoKTogVHlwZVtdIHsgcmV0dXJuIDxUeXBlW10+dW5pbXBsZW1lbnRlZCgpOyB9O1xufVxuXG5leHBvcnQgY2xhc3MgQXBwbGljYXRpb25SZWZfIGV4dGVuZHMgQXBwbGljYXRpb25SZWYge1xuICAvKiogQGludGVybmFsICovXG4gIHN0YXRpYyBfdGlja1Njb3BlOiBXdGZTY29wZUZuID0gd3RmQ3JlYXRlU2NvcGUoJ0FwcGxpY2F0aW9uUmVmI3RpY2soKScpO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfYm9vdHN0cmFwTGlzdGVuZXJzOiBGdW5jdGlvbltdID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfZGlzcG9zZUxpc3RlbmVyczogRnVuY3Rpb25bXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX3Jvb3RDb21wb25lbnRzOiBDb21wb25lbnRSZWZbXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX3Jvb3RDb21wb25lbnRUeXBlczogVHlwZVtdID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWZzOiBDaGFuZ2VEZXRlY3RvclJlZltdID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfcnVubmluZ1RpY2s6IGJvb2xlYW4gPSBmYWxzZTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9lbmZvcmNlTm9OZXdDaGFuZ2VzOiBib29sZWFuID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcGxhdGZvcm06IFBsYXRmb3JtUmVmXywgcHJpdmF0ZSBfem9uZTogTmdab25lLCBwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgICBzdXBlcigpO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fem9uZSkpIHtcbiAgICAgIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZSh0aGlzLl96b25lLm9uTWljcm90YXNrRW1wdHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKF8pID0+IHsgdGhpcy5fem9uZS5ydW4oKCkgPT4geyB0aGlzLnRpY2soKTsgfSk7IH0pO1xuICAgIH1cbiAgICB0aGlzLl9lbmZvcmNlTm9OZXdDaGFuZ2VzID0gYXNzZXJ0aW9uc0VuYWJsZWQoKTtcbiAgfVxuXG4gIHJlZ2lzdGVyQm9vdHN0cmFwTGlzdGVuZXIobGlzdGVuZXI6IChyZWY6IENvbXBvbmVudFJlZikgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX2Jvb3RzdHJhcExpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJlZ2lzdGVyRGlzcG9zZUxpc3RlbmVyKGRpc3Bvc2U6ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fZGlzcG9zZUxpc3RlbmVycy5wdXNoKGRpc3Bvc2UpOyB9XG5cbiAgcmVnaXN0ZXJDaGFuZ2VEZXRlY3RvcihjaGFuZ2VEZXRlY3RvcjogQ2hhbmdlRGV0ZWN0b3JSZWYpOiB2b2lkIHtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZnMucHVzaChjaGFuZ2VEZXRlY3Rvcik7XG4gIH1cblxuICB1bnJlZ2lzdGVyQ2hhbmdlRGV0ZWN0b3IoY2hhbmdlRGV0ZWN0b3I6IENoYW5nZURldGVjdG9yUmVmKTogdm9pZCB7XG4gICAgTGlzdFdyYXBwZXIucmVtb3ZlKHRoaXMuX2NoYW5nZURldGVjdG9yUmVmcywgY2hhbmdlRGV0ZWN0b3IpO1xuICB9XG5cbiAgYm9vdHN0cmFwKGNvbXBvbmVudFR5cGU6IFR5cGUsXG4gICAgICAgICAgICBwcm92aWRlcnM/OiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBQcm9taXNlPENvbXBvbmVudFJlZj4ge1xuICAgIHZhciBjb21wbGV0ZXIgPSBQcm9taXNlV3JhcHBlci5jb21wbGV0ZXIoKTtcbiAgICB0aGlzLl96b25lLnJ1bigoKSA9PiB7XG4gICAgICB2YXIgY29tcG9uZW50UHJvdmlkZXJzID0gX2NvbXBvbmVudFByb3ZpZGVycyhjb21wb25lbnRUeXBlKTtcbiAgICAgIGlmIChpc1ByZXNlbnQocHJvdmlkZXJzKSkge1xuICAgICAgICBjb21wb25lbnRQcm92aWRlcnMucHVzaChwcm92aWRlcnMpO1xuICAgICAgfVxuICAgICAgdmFyIGV4Y2VwdGlvbkhhbmRsZXIgPSB0aGlzLl9pbmplY3Rvci5nZXQoRXhjZXB0aW9uSGFuZGxlcik7XG4gICAgICB0aGlzLl9yb290Q29tcG9uZW50VHlwZXMucHVzaChjb21wb25lbnRUeXBlKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciBpbmplY3RvcjogSW5qZWN0b3IgPSB0aGlzLl9pbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlQ2hpbGQoY29tcG9uZW50UHJvdmlkZXJzKTtcbiAgICAgICAgdmFyIGNvbXBSZWZUb2tlbjogUHJvbWlzZTxDb21wb25lbnRSZWY+ID0gaW5qZWN0b3IuZ2V0KEFQUF9DT01QT05FTlRfUkVGX1BST01JU0UpO1xuICAgICAgICB2YXIgdGljayA9IChjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZikgPT4ge1xuICAgICAgICAgIHRoaXMuX2xvYWRDb21wb25lbnQoY29tcG9uZW50UmVmKTtcbiAgICAgICAgICBjb21wbGV0ZXIucmVzb2x2ZShjb21wb25lbnRSZWYpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciB0aWNrUmVzdWx0ID0gUHJvbWlzZVdyYXBwZXIudGhlbihjb21wUmVmVG9rZW4sIHRpY2spO1xuXG4gICAgICAgIFByb21pc2VXcmFwcGVyLnRoZW4odGlja1Jlc3VsdCwgbnVsbCwgKGVyciwgc3RhY2tUcmFjZSkgPT4ge1xuICAgICAgICAgIGNvbXBsZXRlci5yZWplY3QoZXJyLCBzdGFja1RyYWNlKTtcbiAgICAgICAgICBleGNlcHRpb25IYW5kbGVyLmNhbGwoZXJyLCBzdGFja1RyYWNlKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGV4Y2VwdGlvbkhhbmRsZXIuY2FsbChlLCBlLnN0YWNrKTtcbiAgICAgICAgY29tcGxldGVyLnJlamVjdChlLCBlLnN0YWNrKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gY29tcGxldGVyLnByb21pc2UudGhlbjxDb21wb25lbnRSZWY+KChyZWY6IENvbXBvbmVudFJlZikgPT4ge1xuICAgICAgbGV0IGM6IENvbnNvbGUgPSB0aGlzLl9pbmplY3Rvci5nZXQoQ29uc29sZSk7XG4gICAgICBpZiAoYXNzZXJ0aW9uc0VuYWJsZWQoKSkge1xuICAgICAgICBjLmxvZyhcbiAgICAgICAgICAgIFwiQW5ndWxhciAyIGlzIHJ1bm5pbmcgaW4gdGhlIGRldmVsb3BtZW50IG1vZGUuIENhbGwgZW5hYmxlUHJvZE1vZGUoKSB0byBlbmFibGUgdGhlIHByb2R1Y3Rpb24gbW9kZS5cIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVmO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbG9hZENvbXBvbmVudChjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZik6IHZvaWQge1xuICAgIHZhciBhcHBDaGFuZ2VEZXRlY3RvciA9ICg8RWxlbWVudFJlZl8+Y29tcG9uZW50UmVmLmxvY2F0aW9uKS5pbnRlcm5hbEVsZW1lbnQucGFyZW50VmlldztcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZnMucHVzaChhcHBDaGFuZ2VEZXRlY3Rvci5yZWYpO1xuICAgIHRoaXMudGljaygpO1xuICAgIHRoaXMuX3Jvb3RDb21wb25lbnRzLnB1c2goY29tcG9uZW50UmVmKTtcbiAgICB0aGlzLl9ib290c3RyYXBMaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IGxpc3RlbmVyKGNvbXBvbmVudFJlZikpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdW5sb2FkQ29tcG9uZW50KGNvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmKTogdm9pZCB7XG4gICAgaWYgKCFMaXN0V3JhcHBlci5jb250YWlucyh0aGlzLl9yb290Q29tcG9uZW50cywgY29tcG9uZW50UmVmKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnVucmVnaXN0ZXJDaGFuZ2VEZXRlY3RvcihcbiAgICAgICAgKDxFbGVtZW50UmVmXz5jb21wb25lbnRSZWYubG9jYXRpb24pLmludGVybmFsRWxlbWVudC5wYXJlbnRWaWV3LnJlZik7XG4gICAgTGlzdFdyYXBwZXIucmVtb3ZlKHRoaXMuX3Jvb3RDb21wb25lbnRzLCBjb21wb25lbnRSZWYpO1xuICB9XG5cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIHRoaXMuX2luamVjdG9yOyB9XG5cbiAgZ2V0IHpvbmUoKTogTmdab25lIHsgcmV0dXJuIHRoaXMuX3pvbmU7IH1cblxuICB0aWNrKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9ydW5uaW5nVGljaykge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXCJBcHBsaWNhdGlvblJlZi50aWNrIGlzIGNhbGxlZCByZWN1cnNpdmVseVwiKTtcbiAgICB9XG5cbiAgICB2YXIgcyA9IEFwcGxpY2F0aW9uUmVmXy5fdGlja1Njb3BlKCk7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX3J1bm5pbmdUaWNrID0gdHJ1ZTtcbiAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmcy5mb3JFYWNoKChkZXRlY3RvcikgPT4gZGV0ZWN0b3IuZGV0ZWN0Q2hhbmdlcygpKTtcbiAgICAgIGlmICh0aGlzLl9lbmZvcmNlTm9OZXdDaGFuZ2VzKSB7XG4gICAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmcy5mb3JFYWNoKChkZXRlY3RvcikgPT4gZGV0ZWN0b3IuY2hlY2tOb0NoYW5nZXMoKSk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuX3J1bm5pbmdUaWNrID0gZmFsc2U7XG4gICAgICB3dGZMZWF2ZShzKTtcbiAgICB9XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIC8vIFRPRE8oYWx4aHViKTogRGlzcG9zZSBvZiB0aGUgTmdab25lLlxuICAgIExpc3RXcmFwcGVyLmNsb25lKHRoaXMuX3Jvb3RDb21wb25lbnRzKS5mb3JFYWNoKChyZWYpID0+IHJlZi5kaXNwb3NlKCkpO1xuICAgIHRoaXMuX2Rpc3Bvc2VMaXN0ZW5lcnMuZm9yRWFjaCgoZGlzcG9zZSkgPT4gZGlzcG9zZSgpKTtcbiAgICB0aGlzLl9wbGF0Zm9ybS5fYXBwbGljYXRpb25EaXNwb3NlZCh0aGlzKTtcbiAgfVxuXG4gIGdldCBjb21wb25lbnRUeXBlcygpOiBUeXBlW10geyByZXR1cm4gdGhpcy5fcm9vdENvbXBvbmVudFR5cGVzOyB9XG59XG4iXX0=