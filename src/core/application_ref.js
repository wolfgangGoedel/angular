'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ng_zone_1 = require('angular2/src/core/zone/ng_zone');
var lang_1 = require('angular2/src/facade/lang');
var di_1 = require('angular2/src/core/di');
var application_tokens_1 = require('./application_tokens');
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var testability_1 = require('angular2/src/core/testability/testability');
var dynamic_component_loader_1 = require('angular2/src/core/linker/dynamic_component_loader');
var exceptions_1 = require('angular2/src/facade/exceptions');
var console_1 = require('angular2/src/core/console');
var profile_1 = require('./profile/profile');
var lang_2 = require('angular2/src/facade/lang');
/**
 * Construct providers specific to an individual root component.
 */
function _componentProviders(appComponentType) {
    return [di_1.provide(application_tokens_1.APP_COMPONENT, { useValue: appComponentType }),
        di_1.provide(application_tokens_1.APP_COMPONENT_REF_PROMISE, {
            useFactory: function (dynamicComponentLoader, appRef, injector) {
                // Save the ComponentRef for disposal later.
                var ref;
                // TODO(rado): investigate whether to support providers on root
                // component.
                return dynamicComponentLoader.loadAsRoot(appComponentType, null, injector, function () {
                    appRef._unloadComponent(ref);
                })
                    .then(function (componentRef) {
                    ref = componentRef;
                    var testability = injector.getOptional(testability_1.Testability);
                    if (lang_1.isPresent(testability)) {
                        injector.get(testability_1.TestabilityRegistry)
                            .registerApplication(componentRef.location.nativeElement, testability);
                    }
                    return componentRef;
                });
            },
            deps: [dynamic_component_loader_1.DynamicComponentLoader, ApplicationRef, di_1.Injector]
        }),
        di_1.provide(appComponentType, {
            useFactory: function (p) { return p.then(function (ref) { return ref.instance; }); },
            deps: [application_tokens_1.APP_COMPONENT_REF_PROMISE]
        }),
    ];
}
/**
 * Create an Angular zone.
 */
function createNgZone() {
    return new ng_zone_1.NgZone({ enableLongStackTrace: lang_1.assertionsEnabled() });
}
exports.createNgZone = createNgZone;
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
function platform(providers) {
    lang_2.lockMode();
    if (lang_1.isPresent(_platform)) {
        if (collection_1.ListWrapper.equals(_platformProviders, providers)) {
            return _platform;
        }
        else {
            throw new exceptions_1.BaseException("platform cannot be initialized with different sets of providers.");
        }
    }
    else {
        return _createPlatform(providers);
    }
}
exports.platform = platform;
/**
 * Dispose the existing platform.
 */
function disposePlatform() {
    if (lang_1.isPresent(_platform)) {
        _platform.dispose();
        _platform = null;
    }
}
exports.disposePlatform = disposePlatform;
function _createPlatform(providers) {
    _platformProviders = providers;
    var injector = di_1.Injector.resolveAndCreate(providers);
    _platform = new PlatformRef_(injector, function () {
        _platform = null;
        _platformProviders = null;
    });
    _runPlatformInitializers(injector);
    return _platform;
}
function _runPlatformInitializers(injector) {
    var inits = injector.getOptional(application_tokens_1.PLATFORM_INITIALIZER);
    if (lang_1.isPresent(inits))
        inits.forEach(function (init) { return init(); });
}
/**
 * The Angular platform is the entry point for Angular on a web page. Each page
 * has exactly one platform, and services (such as reflection) which are common
 * to every Angular application running on the page are bound in its scope.
 *
 * A page's platform is initialized implicitly when {@link bootstrap}() is called, or
 * explicitly by calling {@link platform}().
 */
var PlatformRef = (function () {
    function PlatformRef() {
    }
    Object.defineProperty(PlatformRef.prototype, "injector", {
        /**
         * Retrieve the platform {@link Injector}, which is the parent injector for
         * every Angular application on the page and provides singleton providers.
         */
        get: function () { throw exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    return PlatformRef;
}());
exports.PlatformRef = PlatformRef;
var PlatformRef_ = (function (_super) {
    __extends(PlatformRef_, _super);
    function PlatformRef_(_injector, _dispose) {
        _super.call(this);
        this._injector = _injector;
        this._dispose = _dispose;
        /** @internal */
        this._applications = [];
        /** @internal */
        this._disposeListeners = [];
    }
    PlatformRef_.prototype.registerDisposeListener = function (dispose) { this._disposeListeners.push(dispose); };
    Object.defineProperty(PlatformRef_.prototype, "injector", {
        get: function () { return this._injector; },
        enumerable: true,
        configurable: true
    });
    PlatformRef_.prototype.application = function (providers) {
        var app = this._initApp(createNgZone(), providers);
        if (async_1.PromiseWrapper.isPromise(app)) {
            throw new exceptions_1.BaseException("Cannot use asyncronous app initializers with application. Use asyncApplication instead.");
        }
        return app;
    };
    PlatformRef_.prototype.asyncApplication = function (bindingFn, additionalProviders) {
        var _this = this;
        var zone = createNgZone();
        var completer = async_1.PromiseWrapper.completer();
        if (bindingFn === null) {
            completer.resolve(this._initApp(zone, additionalProviders));
        }
        else {
            zone.run(function () {
                async_1.PromiseWrapper.then(bindingFn(zone), function (providers) {
                    if (lang_1.isPresent(additionalProviders)) {
                        providers = collection_1.ListWrapper.concat(providers, additionalProviders);
                    }
                    var promise = _this._initApp(zone, providers);
                    completer.resolve(promise);
                });
            });
        }
        return completer.promise;
    };
    PlatformRef_.prototype._initApp = function (zone, providers) {
        var _this = this;
        var injector;
        var app;
        zone.run(function () {
            providers = collection_1.ListWrapper.concat(providers, [
                di_1.provide(ng_zone_1.NgZone, { useValue: zone }),
                di_1.provide(ApplicationRef, { useFactory: function () { return app; }, deps: [] })
            ]);
            var exceptionHandler;
            try {
                injector = _this.injector.resolveAndCreateChild(providers);
                exceptionHandler = injector.get(exceptions_1.ExceptionHandler);
                async_1.ObservableWrapper.subscribe(zone.onError, function (error) {
                    exceptionHandler.call(error.error, error.stackTrace);
                });
            }
            catch (e) {
                if (lang_1.isPresent(exceptionHandler)) {
                    exceptionHandler.call(e, e.stack);
                }
                else {
                    lang_1.print(e.toString());
                }
            }
        });
        app = new ApplicationRef_(this, zone, injector);
        this._applications.push(app);
        var promise = _runAppInitializers(injector);
        if (promise !== null) {
            return async_1.PromiseWrapper.then(promise, function (_) { return app; });
        }
        else {
            return app;
        }
    };
    PlatformRef_.prototype.dispose = function () {
        collection_1.ListWrapper.clone(this._applications).forEach(function (app) { return app.dispose(); });
        this._disposeListeners.forEach(function (dispose) { return dispose(); });
        this._dispose();
    };
    /** @internal */
    PlatformRef_.prototype._applicationDisposed = function (app) { collection_1.ListWrapper.remove(this._applications, app); };
    return PlatformRef_;
}(PlatformRef));
exports.PlatformRef_ = PlatformRef_;
function _runAppInitializers(injector) {
    var inits = injector.getOptional(application_tokens_1.APP_INITIALIZER);
    var promises = [];
    if (lang_1.isPresent(inits)) {
        inits.forEach(function (init) {
            var retVal = init();
            if (async_1.PromiseWrapper.isPromise(retVal)) {
                promises.push(retVal);
            }
        });
    }
    if (promises.length > 0) {
        return async_1.PromiseWrapper.all(promises);
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
var ApplicationRef = (function () {
    function ApplicationRef() {
    }
    Object.defineProperty(ApplicationRef.prototype, "injector", {
        /**
         * Retrieve the application {@link Injector}.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ApplicationRef.prototype, "zone", {
        /**
         * Retrieve the application {@link NgZone}.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ApplicationRef.prototype, "componentTypes", {
        /**
         * Get a list of component types registered to this application.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    return ApplicationRef;
}());
exports.ApplicationRef = ApplicationRef;
var ApplicationRef_ = (function (_super) {
    __extends(ApplicationRef_, _super);
    function ApplicationRef_(_platform, _zone, _injector) {
        var _this = this;
        _super.call(this);
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
        if (lang_1.isPresent(this._zone)) {
            async_1.ObservableWrapper.subscribe(this._zone.onMicrotaskEmpty, function (_) { _this._zone.run(function () { _this.tick(); }); });
        }
        this._enforceNoNewChanges = lang_1.assertionsEnabled();
    }
    ApplicationRef_.prototype.registerBootstrapListener = function (listener) {
        this._bootstrapListeners.push(listener);
    };
    ApplicationRef_.prototype.registerDisposeListener = function (dispose) { this._disposeListeners.push(dispose); };
    ApplicationRef_.prototype.registerChangeDetector = function (changeDetector) {
        this._changeDetectorRefs.push(changeDetector);
    };
    ApplicationRef_.prototype.unregisterChangeDetector = function (changeDetector) {
        collection_1.ListWrapper.remove(this._changeDetectorRefs, changeDetector);
    };
    ApplicationRef_.prototype.bootstrap = function (componentType, providers) {
        var _this = this;
        var completer = async_1.PromiseWrapper.completer();
        this._zone.run(function () {
            var componentProviders = _componentProviders(componentType);
            if (lang_1.isPresent(providers)) {
                componentProviders.push(providers);
            }
            var exceptionHandler = _this._injector.get(exceptions_1.ExceptionHandler);
            _this._rootComponentTypes.push(componentType);
            try {
                var injector = _this._injector.resolveAndCreateChild(componentProviders);
                var compRefToken = injector.get(application_tokens_1.APP_COMPONENT_REF_PROMISE);
                var tick = function (componentRef) {
                    _this._loadComponent(componentRef);
                    completer.resolve(componentRef);
                };
                var tickResult = async_1.PromiseWrapper.then(compRefToken, tick);
                async_1.PromiseWrapper.then(tickResult, null, function (err, stackTrace) {
                    completer.reject(err, stackTrace);
                    exceptionHandler.call(err, stackTrace);
                });
            }
            catch (e) {
                exceptionHandler.call(e, e.stack);
                completer.reject(e, e.stack);
            }
        });
        return completer.promise.then(function (ref) {
            var c = _this._injector.get(console_1.Console);
            if (lang_1.assertionsEnabled()) {
                c.log("Angular 2 is running in the development mode. Call enableProdMode() to enable the production mode.");
            }
            return ref;
        });
    };
    /** @internal */
    ApplicationRef_.prototype._loadComponent = function (componentRef) {
        var appChangeDetector = componentRef.location.internalElement.parentView;
        this._changeDetectorRefs.push(appChangeDetector.ref);
        this.tick();
        this._rootComponents.push(componentRef);
        this._bootstrapListeners.forEach(function (listener) { return listener(componentRef); });
    };
    /** @internal */
    ApplicationRef_.prototype._unloadComponent = function (componentRef) {
        if (!collection_1.ListWrapper.contains(this._rootComponents, componentRef)) {
            return;
        }
        this.unregisterChangeDetector(componentRef.location.internalElement.parentView.ref);
        collection_1.ListWrapper.remove(this._rootComponents, componentRef);
    };
    Object.defineProperty(ApplicationRef_.prototype, "injector", {
        get: function () { return this._injector; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ApplicationRef_.prototype, "zone", {
        get: function () { return this._zone; },
        enumerable: true,
        configurable: true
    });
    ApplicationRef_.prototype.tick = function () {
        if (this._runningTick) {
            throw new exceptions_1.BaseException("ApplicationRef.tick is called recursively");
        }
        var s = ApplicationRef_._tickScope();
        try {
            this._runningTick = true;
            this._changeDetectorRefs.forEach(function (detector) { return detector.detectChanges(); });
            if (this._enforceNoNewChanges) {
                this._changeDetectorRefs.forEach(function (detector) { return detector.checkNoChanges(); });
            }
        }
        finally {
            this._runningTick = false;
            profile_1.wtfLeave(s);
        }
    };
    ApplicationRef_.prototype.dispose = function () {
        // TODO(alxhub): Dispose of the NgZone.
        collection_1.ListWrapper.clone(this._rootComponents).forEach(function (ref) { return ref.dispose(); });
        this._disposeListeners.forEach(function (dispose) { return dispose(); });
        this._platform._applicationDisposed(this);
    };
    Object.defineProperty(ApplicationRef_.prototype, "componentTypes", {
        get: function () { return this._rootComponentTypes; },
        enumerable: true,
        configurable: true
    });
    /** @internal */
    ApplicationRef_._tickScope = profile_1.wtfCreateScope('ApplicationRef#tick()');
    return ApplicationRef_;
}(ApplicationRef));
exports.ApplicationRef_ = ApplicationRef_;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb25fcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC0xRWJyU080Qi50bXAvYW5ndWxhcjIvc3JjL2NvcmUvYXBwbGljYXRpb25fcmVmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHdCQUFrQyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ25FLHFCQU9PLDBCQUEwQixDQUFDLENBQUE7QUFDbEMsbUJBQXVELHNCQUFzQixDQUFDLENBQUE7QUFDOUUsbUNBTU8sc0JBQXNCLENBQUMsQ0FBQTtBQUM5QixzQkFBa0UsMkJBQTJCLENBQUMsQ0FBQTtBQUM5RiwyQkFBMEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUMzRCw0QkFBK0MsMkNBQTJDLENBQUMsQ0FBQTtBQUMzRix5Q0FHTyxtREFBbUQsQ0FBQyxDQUFBO0FBQzNELDJCQUtPLGdDQUFnQyxDQUFDLENBQUE7QUFDeEMsd0JBQXNCLDJCQUEyQixDQUFDLENBQUE7QUFDbEQsd0JBQW1ELG1CQUFtQixDQUFDLENBQUE7QUFFdkUscUJBQXVCLDBCQUEwQixDQUFDLENBQUE7QUFHbEQ7O0dBRUc7QUFDSCw2QkFBNkIsZ0JBQXNCO0lBQ2pELE1BQU0sQ0FBUSxDQUFDLFlBQU8sQ0FBQyxrQ0FBYSxFQUFFLEVBQUMsUUFBUSxFQUFFLGdCQUFnQixFQUFDLENBQUM7UUFDcEQsWUFBTyxDQUFDLDhDQUF5QixFQUN6QjtZQUNFLFVBQVUsRUFBRSxVQUFDLHNCQUE4QyxFQUM5QyxNQUF1QixFQUFFLFFBQWtCO2dCQUN0RCw0Q0FBNEM7Z0JBQzVDLElBQUksR0FBaUIsQ0FBQztnQkFDdEIsK0RBQStEO2dCQUMvRCxhQUFhO2dCQUNiLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLENBQ1AsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFDaEM7b0JBQ0UsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFD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LENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLFVBQUMsUUFBUSxJQUFLLE9BQUEsUUFBUSxDQUFDLGNBQWMsRUFBRSxFQUF6QixDQUF5QixDQUFDLENBQUM7WUFDNUUsQ0FBQztRQUNILENBQUM7Z0JBQVMsQ0FBQztZQUNULElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBQzFCLGtCQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZCxDQUFDO0lBQ0gsQ0FBQztJQUVELGlDQUFPLEdBQVA7UUFDRSx1Q0FBdUM7UUFDdkMsd0JBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEdBQUcsSUFBSyxPQUFBLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBYixDQUFhLENBQUMsQ0FBQztRQUN4RSxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFVBQUMsT0FBTyxJQUFLLE9BQUEsT0FBTyxFQUFFLEVBQVQsQ0FBUyxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQsc0JBQUksMkNBQWM7YUFBbEIsY0FBK0IsTUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBaElqRSxnQkFBZ0I7SUFDVCwwQkFBVSxHQUFlLHdCQUFjLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQWdJMUUsc0JBQUM7QUFBRCxDQUFDLEFBbElELENBQXFDLGNBQWMsR0FrSWxEO0FBbElZLHVCQUFlLGtCQWtJM0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Tmdab25lLCBOZ1pvbmVFcnJvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvem9uZS9uZ196b25lJztcbmltcG9ydCB7XG4gIFR5cGUsXG4gIGlzQmxhbmssXG4gIGlzUHJlc2VudCxcbiAgYXNzZXJ0aW9uc0VuYWJsZWQsXG4gIHByaW50LFxuICBJU19EQVJUXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge3Byb3ZpZGUsIFByb3ZpZGVyLCBJbmplY3RvciwgT3BhcXVlVG9rZW59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7XG4gIEFQUF9DT01QT05FTlRfUkVGX1BST01JU0UsXG4gIEFQUF9DT01QT05FTlQsXG4gIEFQUF9JRF9SQU5ET01fUFJPVklERVIsXG4gIFBMQVRGT1JNX0lOSVRJQUxJWkVSLFxuICBBUFBfSU5JVElBTElaRVJcbn0gZnJvbSAnLi9hcHBsaWNhdGlvbl90b2tlbnMnO1xuaW1wb3J0IHtQcm9taXNlV3JhcHBlciwgUHJvbWlzZUNvbXBsZXRlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7VGVzdGFiaWxpdHlSZWdpc3RyeSwgVGVzdGFiaWxpdHl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3Rlc3RhYmlsaXR5L3Rlc3RhYmlsaXR5JztcbmltcG9ydCB7XG4gIENvbXBvbmVudFJlZixcbiAgRHluYW1pY0NvbXBvbmVudExvYWRlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvZHluYW1pY19jb21wb25lbnRfbG9hZGVyJztcbmltcG9ydCB7XG4gIEJhc2VFeGNlcHRpb24sXG4gIFdyYXBwZWRFeGNlcHRpb24sXG4gIEV4Y2VwdGlvbkhhbmRsZXIsXG4gIHVuaW1wbGVtZW50ZWRcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7Q29uc29sZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY29uc29sZSc7XG5pbXBvcnQge3d0ZkxlYXZlLCB3dGZDcmVhdGVTY29wZSwgV3RmU2NvcGVGbn0gZnJvbSAnLi9wcm9maWxlL3Byb2ZpbGUnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3RvclJlZn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0b3JfcmVmJztcbmltcG9ydCB7bG9ja01vZGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0VsZW1lbnRSZWZffSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvZWxlbWVudF9yZWYnO1xuXG4vKipcbiAqIENvbnN0cnVjdCBwcm92aWRlcnMgc3BlY2lmaWMgdG8gYW4gaW5kaXZpZHVhbCByb290IGNvbXBvbmVudC5cbiAqL1xuZnVuY3Rpb24gX2NvbXBvbmVudFByb3ZpZGVycyhhcHBDb21wb25lbnRUeXBlOiBUeXBlKTogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+IHtcbiAgcmV0dXJuIDxhbnlbXT5bcHJvdmlkZShBUFBfQ09NUE9ORU5ULCB7dXNlVmFsdWU6IGFwcENvbXBvbmVudFR5cGV9KSxcbiAgICAgICAgICAgICAgICAgcHJvdmlkZShBUFBfQ09NUE9ORU5UX1JFRl9QUk9NSVNFLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZUZhY3Rvcnk6IChkeW5hbWljQ29tcG9uZW50TG9hZGVyOiBEeW5hbWljQ29tcG9uZW50TG9hZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcFJlZjogQXBwbGljYXRpb25SZWZfLCBpbmplY3RvcjogSW5qZWN0b3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2F2ZSB0aGUgQ29tcG9uZW50UmVmIGZvciBkaXNwb3NhbCBsYXRlci5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlZjogQ29tcG9uZW50UmVmO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPKHJhZG8pOiBpbnZlc3RpZ2F0ZSB3aGV0aGVyIHRvIHN1cHBvcnQgcHJvdmlkZXJzIG9uIHJvb3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29tcG9uZW50LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZHluYW1pY0NvbXBvbmVudExvYWRlci5sb2FkQXNSb290KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBDb21wb25lbnRUeXBlLCBudWxsLCBpbmplY3RvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcFJlZi5fdW5sb2FkQ29tcG9uZW50KHJlZik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoY29tcG9uZW50UmVmKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZiA9IGNvbXBvbmVudFJlZjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRlc3RhYmlsaXR5ID0gaW5qZWN0b3IuZ2V0T3B0aW9uYWwoVGVzdGFiaWxpdHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNQcmVzZW50KHRlc3RhYmlsaXR5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdG9yLmdldChUZXN0YWJpbGl0eVJlZ2lzdHJ5KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVnaXN0ZXJBcHBsaWNhdGlvbihjb21wb25lbnRSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdGFiaWxpdHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21wb25lbnRSZWY7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBzOiBbRHluYW1pY0NvbXBvbmVudExvYWRlciwgQXBwbGljYXRpb25SZWYsIEluamVjdG9yXVxuICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICBwcm92aWRlKGFwcENvbXBvbmVudFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlRmFjdG9yeTogKHA6IFByb21pc2U8YW55PikgPT4gcC50aGVuKHJlZiA9PiByZWYuaW5zdGFuY2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwczogW0FQUF9DT01QT05FTlRfUkVGX1BST01JU0VdXG4gICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gIF07XG59XG5cbi8qKlxuICogQ3JlYXRlIGFuIEFuZ3VsYXIgem9uZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU5nWm9uZSgpOiBOZ1pvbmUge1xuICByZXR1cm4gbmV3IE5nWm9uZSh7ZW5hYmxlTG9uZ1N0YWNrVHJhY2U6IGFzc2VydGlvbnNFbmFibGVkKCl9KTtcbn1cblxudmFyIF9wbGF0Zm9ybTogUGxhdGZvcm1SZWY7XG52YXIgX3BsYXRmb3JtUHJvdmlkZXJzOiBhbnlbXTtcblxuLyoqXG4gKiBJbml0aWFsaXplIHRoZSBBbmd1bGFyICdwbGF0Zm9ybScgb24gdGhlIHBhZ2UuXG4gKlxuICogU2VlIHtAbGluayBQbGF0Zm9ybVJlZn0gZm9yIGRldGFpbHMgb24gdGhlIEFuZ3VsYXIgcGxhdGZvcm0uXG4gKlxuICogSXQgaXMgYWxzbyBwb3NzaWJsZSB0byBzcGVjaWZ5IHByb3ZpZGVycyB0byBiZSBtYWRlIGluIHRoZSBuZXcgcGxhdGZvcm0uIFRoZXNlIHByb3ZpZGVyc1xuICogd2lsbCBiZSBzaGFyZWQgYmV0d2VlbiBhbGwgYXBwbGljYXRpb25zIG9uIHRoZSBwYWdlLiBGb3IgZXhhbXBsZSwgYW4gYWJzdHJhY3Rpb24gZm9yXG4gKiB0aGUgYnJvd3NlciBjb29raWUgamFyIHNob3VsZCBiZSBib3VuZCBhdCB0aGUgcGxhdGZvcm0gbGV2ZWwsIGJlY2F1c2UgdGhlcmUgaXMgb25seSBvbmVcbiAqIGNvb2tpZSBqYXIgcmVnYXJkbGVzcyBvZiBob3cgbWFueSBhcHBsaWNhdGlvbnMgb24gdGhlIHBhZ2Ugd2lsbCBiZSBhY2Nlc3NpbmcgaXQuXG4gKlxuICogVGhlIHBsYXRmb3JtIGZ1bmN0aW9uIGNhbiBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgYXMgbG9uZyBhcyB0aGUgc2FtZSBsaXN0IG9mIHByb3ZpZGVyc1xuICogaXMgcGFzc2VkIGludG8gZWFjaCBjYWxsLiBJZiB0aGUgcGxhdGZvcm0gZnVuY3Rpb24gaXMgY2FsbGVkIHdpdGggYSBkaWZmZXJlbnQgc2V0IG9mXG4gKiBwcm92aWRlcywgQW5ndWxhciB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBsYXRmb3JtKHByb3ZpZGVycz86IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPik6IFBsYXRmb3JtUmVmIHtcbiAgbG9ja01vZGUoKTtcbiAgaWYgKGlzUHJlc2VudChfcGxhdGZvcm0pKSB7XG4gICAgaWYgKExpc3RXcmFwcGVyLmVxdWFscyhfcGxhdGZvcm1Qcm92aWRlcnMsIHByb3ZpZGVycykpIHtcbiAgICAgIHJldHVybiBfcGxhdGZvcm07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFwicGxhdGZvcm0gY2Fubm90IGJlIGluaXRpYWxpemVkIHdpdGggZGlmZmVyZW50IHNldHMgb2YgcHJvdmlkZXJzLlwiKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIF9jcmVhdGVQbGF0Zm9ybShwcm92aWRlcnMpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcG9zZSB0aGUgZXhpc3RpbmcgcGxhdGZvcm0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXNwb3NlUGxhdGZvcm0oKTogdm9pZCB7XG4gIGlmIChpc1ByZXNlbnQoX3BsYXRmb3JtKSkge1xuICAgIF9wbGF0Zm9ybS5kaXNwb3NlKCk7XG4gICAgX3BsYXRmb3JtID0gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBfY3JlYXRlUGxhdGZvcm0ocHJvdmlkZXJzPzogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogUGxhdGZvcm1SZWYge1xuICBfcGxhdGZvcm1Qcm92aWRlcnMgPSBwcm92aWRlcnM7XG4gIGxldCBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUocHJvdmlkZXJzKTtcbiAgX3BsYXRmb3JtID0gbmV3IFBsYXRmb3JtUmVmXyhpbmplY3RvciwgKCkgPT4ge1xuICAgIF9wbGF0Zm9ybSA9IG51bGw7XG4gICAgX3BsYXRmb3JtUHJvdmlkZXJzID0gbnVsbDtcbiAgfSk7XG4gIF9ydW5QbGF0Zm9ybUluaXRpYWxpemVycyhpbmplY3Rvcik7XG4gIHJldHVybiBfcGxhdGZvcm07XG59XG5cbmZ1bmN0aW9uIF9ydW5QbGF0Zm9ybUluaXRpYWxpemVycyhpbmplY3RvcjogSW5qZWN0b3IpOiB2b2lkIHtcbiAgbGV0IGluaXRzOiBGdW5jdGlvbltdID0gPEZ1bmN0aW9uW10+aW5qZWN0b3IuZ2V0T3B0aW9uYWwoUExBVEZPUk1fSU5JVElBTElaRVIpO1xuICBpZiAoaXNQcmVzZW50KGluaXRzKSkgaW5pdHMuZm9yRWFjaChpbml0ID0+IGluaXQoKSk7XG59XG5cbi8qKlxuICogVGhlIEFuZ3VsYXIgcGxhdGZvcm0gaXMgdGhlIGVudHJ5IHBvaW50IGZvciBBbmd1bGFyIG9uIGEgd2ViIHBhZ2UuIEVhY2ggcGFnZVxuICogaGFzIGV4YWN0bHkgb25lIHBsYXRmb3JtLCBhbmQgc2VydmljZXMgKHN1Y2ggYXMgcmVmbGVjdGlvbikgd2hpY2ggYXJlIGNvbW1vblxuICogdG8gZXZlcnkgQW5ndWxhciBhcHBsaWNhdGlvbiBydW5uaW5nIG9uIHRoZSBwYWdlIGFyZSBib3VuZCBpbiBpdHMgc2NvcGUuXG4gKlxuICogQSBwYWdlJ3MgcGxhdGZvcm0gaXMgaW5pdGlhbGl6ZWQgaW1wbGljaXRseSB3aGVuIHtAbGluayBib290c3RyYXB9KCkgaXMgY2FsbGVkLCBvclxuICogZXhwbGljaXRseSBieSBjYWxsaW5nIHtAbGluayBwbGF0Zm9ybX0oKS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFBsYXRmb3JtUmVmIHtcbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgbGlzdGVuZXIgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHBsYXRmb3JtIGlzIGRpc3Bvc2VkLlxuICAgKi9cbiAgYWJzdHJhY3QgcmVnaXN0ZXJEaXNwb3NlTGlzdGVuZXIoZGlzcG9zZTogKCkgPT4gdm9pZCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHRoZSBwbGF0Zm9ybSB7QGxpbmsgSW5qZWN0b3J9LCB3aGljaCBpcyB0aGUgcGFyZW50IGluamVjdG9yIGZvclxuICAgKiBldmVyeSBBbmd1bGFyIGFwcGxpY2F0aW9uIG9uIHRoZSBwYWdlIGFuZCBwcm92aWRlcyBzaW5nbGV0b24gcHJvdmlkZXJzLlxuICAgKi9cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHsgdGhyb3cgdW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBJbnN0YW50aWF0ZSBhIG5ldyBBbmd1bGFyIGFwcGxpY2F0aW9uIG9uIHRoZSBwYWdlLlxuICAgKlxuICAgKiAjIyMgV2hhdCBpcyBhbiBhcHBsaWNhdGlvbj9cbiAgICpcbiAgICogRWFjaCBBbmd1bGFyIGFwcGxpY2F0aW9uIGhhcyBpdHMgb3duIHpvbmUsIGNoYW5nZSBkZXRlY3Rpb24sIGNvbXBpbGVyLFxuICAgKiByZW5kZXJlciwgYW5kIG90aGVyIGZyYW1ld29yayBjb21wb25lbnRzLiBBbiBhcHBsaWNhdGlvbiBob3N0cyBvbmUgb3IgbW9yZVxuICAgKiByb290IGNvbXBvbmVudHMsIHdoaWNoIGNhbiBiZSBpbml0aWFsaXplZCB2aWEgYEFwcGxpY2F0aW9uUmVmLmJvb3RzdHJhcCgpYC5cbiAgICpcbiAgICogIyMjIEFwcGxpY2F0aW9uIFByb3ZpZGVyc1xuICAgKlxuICAgKiBBbmd1bGFyIGFwcGxpY2F0aW9ucyByZXF1aXJlIG51bWVyb3VzIHByb3ZpZGVycyB0byBiZSBwcm9wZXJseSBpbnN0YW50aWF0ZWQuXG4gICAqIFdoZW4gdXNpbmcgYGFwcGxpY2F0aW9uKClgIHRvIGNyZWF0ZSBhIG5ldyBhcHAgb24gdGhlIHBhZ2UsIHRoZXNlIHByb3ZpZGVyc1xuICAgKiBtdXN0IGJlIHByb3ZpZGVkLiBGb3J0dW5hdGVseSwgdGhlcmUgYXJlIGhlbHBlciBmdW5jdGlvbnMgdG8gY29uZmlndXJlXG4gICAqIHR5cGljYWwgcHJvdmlkZXJzLCBhcyBzaG93biBpbiB0aGUgZXhhbXBsZSBiZWxvdy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICoge0BleGFtcGxlIGNvcmUvdHMvcGxhdGZvcm0vcGxhdGZvcm0udHMgcmVnaW9uPSdsb25nZm9ybSd9XG4gICAqICMjIyBTZWUgQWxzb1xuICAgKlxuICAgKiBTZWUgdGhlIHtAbGluayBib290c3RyYXB9IGRvY3VtZW50YXRpb24gZm9yIG1vcmUgZGV0YWlscy5cbiAgICovXG4gIGFic3RyYWN0IGFwcGxpY2F0aW9uKHByb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogQXBwbGljYXRpb25SZWY7XG5cbiAgLyoqXG4gICAqIEluc3RhbnRpYXRlIGEgbmV3IEFuZ3VsYXIgYXBwbGljYXRpb24gb24gdGhlIHBhZ2UsIHVzaW5nIHByb3ZpZGVycyB3aGljaFxuICAgKiBhcmUgb25seSBhdmFpbGFibGUgYXN5bmNocm9ub3VzbHkuIE9uZSBzdWNoIHVzZSBjYXNlIGlzIHRvIGluaXRpYWxpemUgYW5cbiAgICogYXBwbGljYXRpb24gcnVubmluZyBpbiBhIHdlYiB3b3JrZXIuXG4gICAqXG4gICAqICMjIyBVc2FnZVxuICAgKlxuICAgKiBgYmluZGluZ0ZuYCBpcyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBjYWxsZWQgaW4gdGhlIG5ldyBhcHBsaWNhdGlvbidzIHpvbmUuXG4gICAqIEl0IHNob3VsZCByZXR1cm4gYSBgUHJvbWlzZWAgdG8gYSBsaXN0IG9mIHByb3ZpZGVycyB0byBiZSB1c2VkIGZvciB0aGVcbiAgICogbmV3IGFwcGxpY2F0aW9uLiBPbmNlIHRoaXMgcHJvbWlzZSByZXNvbHZlcywgdGhlIGFwcGxpY2F0aW9uIHdpbGwgYmVcbiAgICogY29uc3RydWN0ZWQgaW4gdGhlIHNhbWUgbWFubmVyIGFzIGEgbm9ybWFsIGBhcHBsaWNhdGlvbigpYC5cbiAgICovXG4gIGFic3RyYWN0IGFzeW5jQXBwbGljYXRpb24oYmluZGluZ0ZuOiAoem9uZTogTmdab25lKSA9PiBQcm9taXNlPEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPj4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJzPzogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogUHJvbWlzZTxBcHBsaWNhdGlvblJlZj47XG5cbiAgLyoqXG4gICAqIERlc3Ryb3kgdGhlIEFuZ3VsYXIgcGxhdGZvcm0gYW5kIGFsbCBBbmd1bGFyIGFwcGxpY2F0aW9ucyBvbiB0aGUgcGFnZS5cbiAgICovXG4gIGFic3RyYWN0IGRpc3Bvc2UoKTogdm9pZDtcbn1cblxuZXhwb3J0IGNsYXNzIFBsYXRmb3JtUmVmXyBleHRlbmRzIFBsYXRmb3JtUmVmIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYXBwbGljYXRpb25zOiBBcHBsaWNhdGlvblJlZltdID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Rpc3Bvc2VMaXN0ZW5lcnM6IEZ1bmN0aW9uW10gPSBbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3IsIHByaXZhdGUgX2Rpc3Bvc2U6ICgpID0+IHZvaWQpIHsgc3VwZXIoKTsgfVxuXG4gIHJlZ2lzdGVyRGlzcG9zZUxpc3RlbmVyKGRpc3Bvc2U6ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fZGlzcG9zZUxpc3RlbmVycy5wdXNoKGRpc3Bvc2UpOyB9XG5cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIHRoaXMuX2luamVjdG9yOyB9XG5cbiAgYXBwbGljYXRpb24ocHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBBcHBsaWNhdGlvblJlZiB7XG4gICAgdmFyIGFwcCA9IHRoaXMuX2luaXRBcHAoY3JlYXRlTmdab25lKCksIHByb3ZpZGVycyk7XG4gICAgaWYgKFByb21pc2VXcmFwcGVyLmlzUHJvbWlzZShhcHApKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICBcIkNhbm5vdCB1c2UgYXN5bmNyb25vdXMgYXBwIGluaXRpYWxpemVycyB3aXRoIGFwcGxpY2F0aW9uLiBVc2UgYXN5bmNBcHBsaWNhdGlvbiBpbnN0ZWFkLlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIDxBcHBsaWNhdGlvblJlZj5hcHA7XG4gIH1cblxuICBhc3luY0FwcGxpY2F0aW9uKGJpbmRpbmdGbjogKHpvbmU6IE5nWm9uZSkgPT4gUHJvbWlzZTxBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4+LFxuICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxQcm92aWRlcnM/OiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBQcm9taXNlPEFwcGxpY2F0aW9uUmVmPiB7XG4gICAgdmFyIHpvbmUgPSBjcmVhdGVOZ1pvbmUoKTtcbiAgICB2YXIgY29tcGxldGVyID0gUHJvbWlzZVdyYXBwZXIuY29tcGxldGVyPEFwcGxpY2F0aW9uUmVmPigpO1xuICAgIGlmIChiaW5kaW5nRm4gPT09IG51bGwpIHtcbiAgICAgIGNvbXBsZXRlci5yZXNvbHZlKHRoaXMuX2luaXRBcHAoem9uZSwgYWRkaXRpb25hbFByb3ZpZGVycykpO1xuICAgIH0gZWxzZSB7XG4gICAgICB6b25lLnJ1bigoKSA9PiB7XG4gICAgICAgIFByb21pc2VXcmFwcGVyLnRoZW4oYmluZGluZ0ZuKHpvbmUpLCAocHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pID0+IHtcbiAgICAgICAgICBpZiAoaXNQcmVzZW50KGFkZGl0aW9uYWxQcm92aWRlcnMpKSB7XG4gICAgICAgICAgICBwcm92aWRlcnMgPSBMaXN0V3JhcHBlci5jb25jYXQocHJvdmlkZXJzLCBhZGRpdGlvbmFsUHJvdmlkZXJzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IHByb21pc2UgPSB0aGlzLl9pbml0QXBwKHpvbmUsIHByb3ZpZGVycyk7XG4gICAgICAgICAgY29tcGxldGVyLnJlc29sdmUocHJvbWlzZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBjb21wbGV0ZXIucHJvbWlzZTtcbiAgfVxuXG4gIHByaXZhdGUgX2luaXRBcHAoem9uZTogTmdab25lLFxuICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogUHJvbWlzZTxBcHBsaWNhdGlvblJlZj58XG4gICAgICBBcHBsaWNhdGlvblJlZiB7XG4gICAgdmFyIGluamVjdG9yOiBJbmplY3RvcjtcbiAgICB2YXIgYXBwOiBBcHBsaWNhdGlvblJlZjtcbiAgICB6b25lLnJ1bigoKSA9PiB7XG4gICAgICBwcm92aWRlcnMgPSBMaXN0V3JhcHBlci5jb25jYXQocHJvdmlkZXJzLCBbXG4gICAgICAgIHByb3ZpZGUoTmdab25lLCB7dXNlVmFsdWU6IHpvbmV9KSxcbiAgICAgICAgcHJvdmlkZShBcHBsaWNhdGlvblJlZiwge3VzZUZhY3Rvcnk6ICgpOiBBcHBsaWNhdGlvblJlZiA9PiBhcHAsIGRlcHM6IFtdfSlcbiAgICAgIF0pO1xuXG4gICAgICB2YXIgZXhjZXB0aW9uSGFuZGxlcjogRXhjZXB0aW9uSGFuZGxlcjtcbiAgICAgIHRyeSB7XG4gICAgICAgIGluamVjdG9yID0gdGhpcy5pbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlQ2hpbGQocHJvdmlkZXJzKTtcbiAgICAgICAgZXhjZXB0aW9uSGFuZGxlciA9IGluamVjdG9yLmdldChFeGNlcHRpb25IYW5kbGVyKTtcbiAgICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHpvbmUub25FcnJvciwgKGVycm9yOiBOZ1pvbmVFcnJvcikgPT4ge1xuICAgICAgICAgIGV4Y2VwdGlvbkhhbmRsZXIuY2FsbChlcnJvci5lcnJvciwgZXJyb3Iuc3RhY2tUcmFjZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoaXNQcmVzZW50KGV4Y2VwdGlvbkhhbmRsZXIpKSB7XG4gICAgICAgICAgZXhjZXB0aW9uSGFuZGxlci5jYWxsKGUsIGUuc3RhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByaW50KGUudG9TdHJpbmcoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICBhcHAgPSBuZXcgQXBwbGljYXRpb25SZWZfKHRoaXMsIHpvbmUsIGluamVjdG9yKTtcbiAgICB0aGlzLl9hcHBsaWNhdGlvbnMucHVzaChhcHApO1xuICAgIHZhciBwcm9taXNlID0gX3J1bkFwcEluaXRpYWxpemVycyhpbmplY3Rvcik7XG4gICAgaWYgKHByb21pc2UgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiBQcm9taXNlV3JhcHBlci50aGVuKHByb21pc2UsIChfKSA9PiBhcHApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYXBwO1xuICAgIH1cbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgTGlzdFdyYXBwZXIuY2xvbmUodGhpcy5fYXBwbGljYXRpb25zKS5mb3JFYWNoKChhcHApID0+IGFwcC5kaXNwb3NlKCkpO1xuICAgIHRoaXMuX2Rpc3Bvc2VMaXN0ZW5lcnMuZm9yRWFjaCgoZGlzcG9zZSkgPT4gZGlzcG9zZSgpKTtcbiAgICB0aGlzLl9kaXNwb3NlKCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hcHBsaWNhdGlvbkRpc3Bvc2VkKGFwcDogQXBwbGljYXRpb25SZWYpOiB2b2lkIHsgTGlzdFdyYXBwZXIucmVtb3ZlKHRoaXMuX2FwcGxpY2F0aW9ucywgYXBwKTsgfVxufVxuXG5mdW5jdGlvbiBfcnVuQXBwSW5pdGlhbGl6ZXJzKGluamVjdG9yOiBJbmplY3Rvcik6IFByb21pc2U8YW55PiB7XG4gIGxldCBpbml0czogRnVuY3Rpb25bXSA9IGluamVjdG9yLmdldE9wdGlvbmFsKEFQUF9JTklUSUFMSVpFUik7XG4gIGxldCBwcm9taXNlczogUHJvbWlzZTxhbnk+W10gPSBbXTtcbiAgaWYgKGlzUHJlc2VudChpbml0cykpIHtcbiAgICBpbml0cy5mb3JFYWNoKGluaXQgPT4ge1xuICAgICAgdmFyIHJldFZhbCA9IGluaXQoKTtcbiAgICAgIGlmIChQcm9taXNlV3JhcHBlci5pc1Byb21pc2UocmV0VmFsKSkge1xuICAgICAgICBwcm9taXNlcy5wdXNoKHJldFZhbCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgaWYgKHByb21pc2VzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIuYWxsKHByb21pc2VzKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIEEgcmVmZXJlbmNlIHRvIGFuIEFuZ3VsYXIgYXBwbGljYXRpb24gcnVubmluZyBvbiBhIHBhZ2UuXG4gKlxuICogRm9yIG1vcmUgYWJvdXQgQW5ndWxhciBhcHBsaWNhdGlvbnMsIHNlZSB0aGUgZG9jdW1lbnRhdGlvbiBmb3Ige0BsaW5rIGJvb3RzdHJhcH0uXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBcHBsaWNhdGlvblJlZiB7XG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGxpc3RlbmVyIHRvIGJlIGNhbGxlZCBlYWNoIHRpbWUgYGJvb3RzdHJhcCgpYCBpcyBjYWxsZWQgdG8gYm9vdHN0cmFwXG4gICAqIGEgbmV3IHJvb3QgY29tcG9uZW50LlxuICAgKi9cbiAgYWJzdHJhY3QgcmVnaXN0ZXJCb290c3RyYXBMaXN0ZW5lcihsaXN0ZW5lcjogKHJlZjogQ29tcG9uZW50UmVmKSA9PiB2b2lkKTogdm9pZDtcblxuICAvKipcbiAgICogUmVnaXN0ZXIgYSBsaXN0ZW5lciB0byBiZSBjYWxsZWQgd2hlbiB0aGUgYXBwbGljYXRpb24gaXMgZGlzcG9zZWQuXG4gICAqL1xuICBhYnN0cmFjdCByZWdpc3RlckRpc3Bvc2VMaXN0ZW5lcihkaXNwb3NlOiAoKSA9PiB2b2lkKTogdm9pZDtcblxuICAvKipcbiAgICogQm9vdHN0cmFwIGEgbmV3IGNvbXBvbmVudCBhdCB0aGUgcm9vdCBsZXZlbCBvZiB0aGUgYXBwbGljYXRpb24uXG4gICAqXG4gICAqICMjIyBCb290c3RyYXAgcHJvY2Vzc1xuICAgKlxuICAgKiBXaGVuIGJvb3RzdHJhcHBpbmcgYSBuZXcgcm9vdCBjb21wb25lbnQgaW50byBhbiBhcHBsaWNhdGlvbiwgQW5ndWxhciBtb3VudHMgdGhlXG4gICAqIHNwZWNpZmllZCBhcHBsaWNhdGlvbiBjb21wb25lbnQgb250byBET00gZWxlbWVudHMgaWRlbnRpZmllZCBieSB0aGUgW2NvbXBvbmVudFR5cGVdJ3NcbiAgICogc2VsZWN0b3IgYW5kIGtpY2tzIG9mZiBhdXRvbWF0aWMgY2hhbmdlIGRldGVjdGlvbiB0byBmaW5pc2ggaW5pdGlhbGl6aW5nIHRoZSBjb21wb25lbnQuXG4gICAqXG4gICAqICMjIyBPcHRpb25hbCBQcm92aWRlcnNcbiAgICpcbiAgICogUHJvdmlkZXJzIGZvciB0aGUgZ2l2ZW4gY29tcG9uZW50IGNhbiBvcHRpb25hbGx5IGJlIG92ZXJyaWRkZW4gdmlhIHRoZSBgcHJvdmlkZXJzYFxuICAgKiBwYXJhbWV0ZXIuIFRoZXNlIHByb3ZpZGVycyB3aWxsIG9ubHkgYXBwbHkgZm9yIHRoZSByb290IGNvbXBvbmVudCBiZWluZyBhZGRlZCBhbmQgYW55XG4gICAqIGNoaWxkIGNvbXBvbmVudHMgdW5kZXIgaXQuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqIHtAZXhhbXBsZSBjb3JlL3RzL3BsYXRmb3JtL3BsYXRmb3JtLnRzIHJlZ2lvbj0nbG9uZ2Zvcm0nfVxuICAgKi9cbiAgYWJzdHJhY3QgYm9vdHN0cmFwKGNvbXBvbmVudFR5cGU6IFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM/OiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBQcm9taXNlPENvbXBvbmVudFJlZj47XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHRoZSBhcHBsaWNhdGlvbiB7QGxpbmsgSW5qZWN0b3J9LlxuICAgKi9cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIDxJbmplY3Rvcj51bmltcGxlbWVudGVkKCk7IH07XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHRoZSBhcHBsaWNhdGlvbiB7QGxpbmsgTmdab25lfS5cbiAgICovXG4gIGdldCB6b25lKCk6IE5nWm9uZSB7IHJldHVybiA8Tmdab25lPnVuaW1wbGVtZW50ZWQoKTsgfTtcblxuICAvKipcbiAgICogRGlzcG9zZSBvZiB0aGlzIGFwcGxpY2F0aW9uIGFuZCBhbGwgb2YgaXRzIGNvbXBvbmVudHMuXG4gICAqL1xuICBhYnN0cmFjdCBkaXNwb3NlKCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEludm9rZSB0aGlzIG1ldGhvZCB0byBleHBsaWNpdGx5IHByb2Nlc3MgY2hhbmdlIGRldGVjdGlvbiBhbmQgaXRzIHNpZGUtZWZmZWN0cy5cbiAgICpcbiAgICogSW4gZGV2ZWxvcG1lbnQgbW9kZSwgYHRpY2soKWAgYWxzbyBwZXJmb3JtcyBhIHNlY29uZCBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlIHRvIGVuc3VyZSB0aGF0IG5vXG4gICAqIGZ1cnRoZXIgY2hhbmdlcyBhcmUgZGV0ZWN0ZWQuIElmIGFkZGl0aW9uYWwgY2hhbmdlcyBhcmUgcGlja2VkIHVwIGR1cmluZyB0aGlzIHNlY29uZCBjeWNsZSxcbiAgICogYmluZGluZ3MgaW4gdGhlIGFwcCBoYXZlIHNpZGUtZWZmZWN0cyB0aGF0IGNhbm5vdCBiZSByZXNvbHZlZCBpbiBhIHNpbmdsZSBjaGFuZ2UgZGV0ZWN0aW9uXG4gICAqIHBhc3MuXG4gICAqIEluIHRoaXMgY2FzZSwgQW5ndWxhciB0aHJvd3MgYW4gZXJyb3IsIHNpbmNlIGFuIEFuZ3VsYXIgYXBwbGljYXRpb24gY2FuIG9ubHkgaGF2ZSBvbmUgY2hhbmdlXG4gICAqIGRldGVjdGlvbiBwYXNzIGR1cmluZyB3aGljaCBhbGwgY2hhbmdlIGRldGVjdGlvbiBtdXN0IGNvbXBsZXRlLlxuICAgKi9cbiAgYWJzdHJhY3QgdGljaygpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBHZXQgYSBsaXN0IG9mIGNvbXBvbmVudCB0eXBlcyByZWdpc3RlcmVkIHRvIHRoaXMgYXBwbGljYXRpb24uXG4gICAqL1xuICBnZXQgY29tcG9uZW50VHlwZXMoKTogVHlwZVtdIHsgcmV0dXJuIDxUeXBlW10+dW5pbXBsZW1lbnRlZCgpOyB9O1xufVxuXG5leHBvcnQgY2xhc3MgQXBwbGljYXRpb25SZWZfIGV4dGVuZHMgQXBwbGljYXRpb25SZWYge1xuICAvKiogQGludGVybmFsICovXG4gIHN0YXRpYyBfdGlja1Njb3BlOiBXdGZTY29wZUZuID0gd3RmQ3JlYXRlU2NvcGUoJ0FwcGxpY2F0aW9uUmVmI3RpY2soKScpO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfYm9vdHN0cmFwTGlzdGVuZXJzOiBGdW5jdGlvbltdID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfZGlzcG9zZUxpc3RlbmVyczogRnVuY3Rpb25bXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX3Jvb3RDb21wb25lbnRzOiBDb21wb25lbnRSZWZbXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX3Jvb3RDb21wb25lbnRUeXBlczogVHlwZVtdID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWZzOiBDaGFuZ2VEZXRlY3RvclJlZltdID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfcnVubmluZ1RpY2s6IGJvb2xlYW4gPSBmYWxzZTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9lbmZvcmNlTm9OZXdDaGFuZ2VzOiBib29sZWFuID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcGxhdGZvcm06IFBsYXRmb3JtUmVmXywgcHJpdmF0ZSBfem9uZTogTmdab25lLCBwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgICBzdXBlcigpO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fem9uZSkpIHtcbiAgICAgIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZSh0aGlzLl96b25lLm9uTWljcm90YXNrRW1wdHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKF8pID0+IHsgdGhpcy5fem9uZS5ydW4oKCkgPT4geyB0aGlzLnRpY2soKTsgfSk7IH0pO1xuICAgIH1cbiAgICB0aGlzLl9lbmZvcmNlTm9OZXdDaGFuZ2VzID0gYXNzZXJ0aW9uc0VuYWJsZWQoKTtcbiAgfVxuXG4gIHJlZ2lzdGVyQm9vdHN0cmFwTGlzdGVuZXIobGlzdGVuZXI6IChyZWY6IENvbXBvbmVudFJlZikgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX2Jvb3RzdHJhcExpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJlZ2lzdGVyRGlzcG9zZUxpc3RlbmVyKGRpc3Bvc2U6ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fZGlzcG9zZUxpc3RlbmVycy5wdXNoKGRpc3Bvc2UpOyB9XG5cbiAgcmVnaXN0ZXJDaGFuZ2VEZXRlY3RvcihjaGFuZ2VEZXRlY3RvcjogQ2hhbmdlRGV0ZWN0b3JSZWYpOiB2b2lkIHtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZnMucHVzaChjaGFuZ2VEZXRlY3Rvcik7XG4gIH1cblxuICB1bnJlZ2lzdGVyQ2hhbmdlRGV0ZWN0b3IoY2hhbmdlRGV0ZWN0b3I6IENoYW5nZURldGVjdG9yUmVmKTogdm9pZCB7XG4gICAgTGlzdFdyYXBwZXIucmVtb3ZlKHRoaXMuX2NoYW5nZURldGVjdG9yUmVmcywgY2hhbmdlRGV0ZWN0b3IpO1xuICB9XG5cbiAgYm9vdHN0cmFwKGNvbXBvbmVudFR5cGU6IFR5cGUsXG4gICAgICAgICAgICBwcm92aWRlcnM/OiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBQcm9taXNlPENvbXBvbmVudFJlZj4ge1xuICAgIHZhciBjb21wbGV0ZXIgPSBQcm9taXNlV3JhcHBlci5jb21wbGV0ZXIoKTtcbiAgICB0aGlzLl96b25lLnJ1bigoKSA9PiB7XG4gICAgICB2YXIgY29tcG9uZW50UHJvdmlkZXJzID0gX2NvbXBvbmVudFByb3ZpZGVycyhjb21wb25lbnRUeXBlKTtcbiAgICAgIGlmIChpc1ByZXNlbnQocHJvdmlkZXJzKSkge1xuICAgICAgICBjb21wb25lbnRQcm92aWRlcnMucHVzaChwcm92aWRlcnMpO1xuICAgICAgfVxuICAgICAgdmFyIGV4Y2VwdGlvbkhhbmRsZXIgPSB0aGlzLl9pbmplY3Rvci5nZXQoRXhjZXB0aW9uSGFuZGxlcik7XG4gICAgICB0aGlzLl9yb290Q29tcG9uZW50VHlwZXMucHVzaChjb21wb25lbnRUeXBlKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciBpbmplY3RvcjogSW5qZWN0b3IgPSB0aGlzLl9pbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlQ2hpbGQoY29tcG9uZW50UHJvdmlkZXJzKTtcbiAgICAgICAgdmFyIGNvbXBSZWZUb2tlbjogUHJvbWlzZTxDb21wb25lbnRSZWY+ID0gaW5qZWN0b3IuZ2V0KEFQUF9DT01QT05FTlRfUkVGX1BST01JU0UpO1xuICAgICAgICB2YXIgdGljayA9IChjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZikgPT4ge1xuICAgICAgICAgIHRoaXMuX2xvYWRDb21wb25lbnQoY29tcG9uZW50UmVmKTtcbiAgICAgICAgICBjb21wbGV0ZXIucmVzb2x2ZShjb21wb25lbnRSZWYpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciB0aWNrUmVzdWx0ID0gUHJvbWlzZVdyYXBwZXIudGhlbihjb21wUmVmVG9rZW4sIHRpY2spO1xuXG4gICAgICAgIFByb21pc2VXcmFwcGVyLnRoZW4odGlja1Jlc3VsdCwgbnVsbCwgKGVyciwgc3RhY2tUcmFjZSkgPT4ge1xuICAgICAgICAgIGNvbXBsZXRlci5yZWplY3QoZXJyLCBzdGFja1RyYWNlKTtcbiAgICAgICAgICBleGNlcHRpb25IYW5kbGVyLmNhbGwoZXJyLCBzdGFja1RyYWNlKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGV4Y2VwdGlvbkhhbmRsZXIuY2FsbChlLCBlLnN0YWNrKTtcbiAgICAgICAgY29tcGxldGVyLnJlamVjdChlLCBlLnN0YWNrKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gY29tcGxldGVyLnByb21pc2UudGhlbjxDb21wb25lbnRSZWY+KChyZWY6IENvbXBvbmVudFJlZikgPT4ge1xuICAgICAgbGV0IGM6IENvbnNvbGUgPSB0aGlzLl9pbmplY3Rvci5nZXQoQ29uc29sZSk7XG4gICAgICBpZiAoYXNzZXJ0aW9uc0VuYWJsZWQoKSkge1xuICAgICAgICBjLmxvZyhcbiAgICAgICAgICAgIFwiQW5ndWxhciAyIGlzIHJ1bm5pbmcgaW4gdGhlIGRldmVsb3BtZW50IG1vZGUuIENhbGwgZW5hYmxlUHJvZE1vZGUoKSB0byBlbmFibGUgdGhlIHByb2R1Y3Rpb24gbW9kZS5cIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVmO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbG9hZENvbXBvbmVudChjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZik6IHZvaWQge1xuICAgIHZhciBhcHBDaGFuZ2VEZXRlY3RvciA9ICg8RWxlbWVudFJlZl8+Y29tcG9uZW50UmVmLmxvY2F0aW9uKS5pbnRlcm5hbEVsZW1lbnQucGFyZW50VmlldztcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZnMucHVzaChhcHBDaGFuZ2VEZXRlY3Rvci5yZWYpO1xuICAgIHRoaXMudGljaygpO1xuICAgIHRoaXMuX3Jvb3RDb21wb25lbnRzLnB1c2goY29tcG9uZW50UmVmKTtcbiAgICB0aGlzLl9ib290c3RyYXBMaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IGxpc3RlbmVyKGNvbXBvbmVudFJlZikpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdW5sb2FkQ29tcG9uZW50KGNvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmKTogdm9pZCB7XG4gICAgaWYgKCFMaXN0V3JhcHBlci5jb250YWlucyh0aGlzLl9yb290Q29tcG9uZW50cywgY29tcG9uZW50UmVmKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnVucmVnaXN0ZXJDaGFuZ2VEZXRlY3RvcihcbiAgICAgICAgKDxFbGVtZW50UmVmXz5jb21wb25lbnRSZWYubG9jYXRpb24pLmludGVybmFsRWxlbWVudC5wYXJlbnRWaWV3LnJlZik7XG4gICAgTGlzdFdyYXBwZXIucmVtb3ZlKHRoaXMuX3Jvb3RDb21wb25lbnRzLCBjb21wb25lbnRSZWYpO1xuICB9XG5cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIHRoaXMuX2luamVjdG9yOyB9XG5cbiAgZ2V0IHpvbmUoKTogTmdab25lIHsgcmV0dXJuIHRoaXMuX3pvbmU7IH1cblxuICB0aWNrKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9ydW5uaW5nVGljaykge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXCJBcHBsaWNhdGlvblJlZi50aWNrIGlzIGNhbGxlZCByZWN1cnNpdmVseVwiKTtcbiAgICB9XG5cbiAgICB2YXIgcyA9IEFwcGxpY2F0aW9uUmVmXy5fdGlja1Njb3BlKCk7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX3J1bm5pbmdUaWNrID0gdHJ1ZTtcbiAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmcy5mb3JFYWNoKChkZXRlY3RvcikgPT4gZGV0ZWN0b3IuZGV0ZWN0Q2hhbmdlcygpKTtcbiAgICAgIGlmICh0aGlzLl9lbmZvcmNlTm9OZXdDaGFuZ2VzKSB7XG4gICAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmcy5mb3JFYWNoKChkZXRlY3RvcikgPT4gZGV0ZWN0b3IuY2hlY2tOb0NoYW5nZXMoKSk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuX3J1bm5pbmdUaWNrID0gZmFsc2U7XG4gICAgICB3dGZMZWF2ZShzKTtcbiAgICB9XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIC8vIFRPRE8oYWx4aHViKTogRGlzcG9zZSBvZiB0aGUgTmdab25lLlxuICAgIExpc3RXcmFwcGVyLmNsb25lKHRoaXMuX3Jvb3RDb21wb25lbnRzKS5mb3JFYWNoKChyZWYpID0+IHJlZi5kaXNwb3NlKCkpO1xuICAgIHRoaXMuX2Rpc3Bvc2VMaXN0ZW5lcnMuZm9yRWFjaCgoZGlzcG9zZSkgPT4gZGlzcG9zZSgpKTtcbiAgICB0aGlzLl9wbGF0Zm9ybS5fYXBwbGljYXRpb25EaXNwb3NlZCh0aGlzKTtcbiAgfVxuXG4gIGdldCBjb21wb25lbnRUeXBlcygpOiBUeXBlW10geyByZXR1cm4gdGhpcy5fcm9vdENvbXBvbmVudFR5cGVzOyB9XG59XG4iXX0=