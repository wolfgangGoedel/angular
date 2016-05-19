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
        var appChangeDetector = componentRef.location.internalElement.parentView.changeDetector;
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
        this.unregisterChangeDetector(componentRef.location.internalElement.parentView.changeDetector.ref);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb25fcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC05ZEhhSmdLOS50bXAvYW5ndWxhcjIvc3JjL2NvcmUvYXBwbGljYXRpb25fcmVmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHdCQUFrQyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ25FLHFCQU9PLDBCQUEwQixDQUFDLENBQUE7QUFDbEMsbUJBQXVELHNCQUFzQixDQUFDLENBQUE7QUFDOUUsbUNBTU8sc0JBQXNCLENBQUMsQ0FBQTtBQUM5QixzQkFBa0UsMkJBQTJCLENBQUMsQ0FBQTtBQUM5RiwyQkFBMEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUMzRCw0QkFBK0MsMkNBQTJDLENBQUMsQ0FBQTtBQUMzRix5Q0FHTyxtREFBbUQsQ0FBQyxDQUFBO0FBQzNELDJCQUtPLGdDQUFnQyxDQUFDLENBQUE7QUFDeEMsd0JBQXNCLDJCQUEyQixDQUFDLENBQUE7QUFDbEQsd0JBQW1ELG1CQUFtQixDQUFDLENBQUE7QUFFdkUscUJBQXVCLDBCQUEwQixDQUFDLENBQUE7QUFHbEQ7O0dBRUc7QUFDSCw2QkFBNkIsZ0JBQXNCO0lBQ2pELE1BQU0sQ0FBUSxDQUFDLFlBQU8sQ0FBQyxrQ0FBYSxFQUFFLEVBQUMsUUFBUSxFQUFFLGdCQUFnQixFQUFDLENBQUM7UUFDcEQsWUFBTyxDQUFDLDhDQUF5QixFQUN6QjtZQUNFLFVBQVUsRUFBRSxVQUFDLHNCQUE4QyxFQUM5QyxNQUF1QixFQUFFLFFBQWtCO2dCQUN0RCw0Q0FBNEM7Z0JBQzVDLElBQUksR0FBaUIsQ0FBQztnQkFDdEIsK0RBQStEO2dCQUMvRCxhQUFhO2dCQUNiLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLENBQ1AsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFDaEM7b0JBQ0UsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFD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RUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVEsSUFBSyxPQUFBLFFBQVEsQ0FBQyxjQUFjLEVBQUUsRUFBekIsQ0FBeUIsQ0FBQyxDQUFDO1lBQzVFLENBQUM7UUFDSCxDQUFDO2dCQUFTLENBQUM7WUFDVCxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztZQUMxQixrQkFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2QsQ0FBQztJQUNILENBQUM7SUFFRCxpQ0FBTyxHQUFQO1FBQ0UsdUNBQXVDO1FBQ3ZDLHdCQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQyxHQUFHLElBQUssT0FBQSxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQWIsQ0FBYSxDQUFDLENBQUM7UUFDeEUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxVQUFDLE9BQU8sSUFBSyxPQUFBLE9BQU8sRUFBRSxFQUFULENBQVMsQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELHNCQUFJLDJDQUFjO2FBQWxCLGNBQStCLE1BQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQWpJakUsZ0JBQWdCO0lBQ1QsMEJBQVUsR0FBZSx3QkFBYyxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFpSTFFLHNCQUFDO0FBQUQsQ0FBQyxBQW5JRCxDQUFxQyxjQUFjLEdBbUlsRDtBQW5JWSx1QkFBZSxrQkFtSTNCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge05nWm9uZSwgTmdab25lRXJyb3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3pvbmUvbmdfem9uZSc7XG5pbXBvcnQge1xuICBUeXBlLFxuICBpc0JsYW5rLFxuICBpc1ByZXNlbnQsXG4gIGFzc2VydGlvbnNFbmFibGVkLFxuICBwcmludCxcbiAgSVNfREFSVFxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtwcm92aWRlLCBQcm92aWRlciwgSW5qZWN0b3IsIE9wYXF1ZVRva2VufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1xuICBBUFBfQ09NUE9ORU5UX1JFRl9QUk9NSVNFLFxuICBBUFBfQ09NUE9ORU5ULFxuICBBUFBfSURfUkFORE9NX1BST1ZJREVSLFxuICBQTEFURk9STV9JTklUSUFMSVpFUixcbiAgQVBQX0lOSVRJQUxJWkVSXG59IGZyb20gJy4vYXBwbGljYXRpb25fdG9rZW5zJztcbmltcG9ydCB7UHJvbWlzZVdyYXBwZXIsIFByb21pc2VDb21wbGV0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1Rlc3RhYmlsaXR5UmVnaXN0cnksIFRlc3RhYmlsaXR5fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS90ZXN0YWJpbGl0eS90ZXN0YWJpbGl0eSc7XG5pbXBvcnQge1xuICBDb21wb25lbnRSZWYsXG4gIER5bmFtaWNDb21wb25lbnRMb2FkZXJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2R5bmFtaWNfY29tcG9uZW50X2xvYWRlcic7XG5pbXBvcnQge1xuICBCYXNlRXhjZXB0aW9uLFxuICBXcmFwcGVkRXhjZXB0aW9uLFxuICBFeGNlcHRpb25IYW5kbGVyLFxuICB1bmltcGxlbWVudGVkXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0NvbnNvbGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NvbnNvbGUnO1xuaW1wb3J0IHt3dGZMZWF2ZSwgd3RmQ3JlYXRlU2NvcGUsIFd0ZlNjb3BlRm59IGZyb20gJy4vcHJvZmlsZS9wcm9maWxlJztcbmltcG9ydCB7Q2hhbmdlRGV0ZWN0b3JSZWZ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdG9yX3JlZic7XG5pbXBvcnQge2xvY2tNb2RlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtFbGVtZW50UmVmX30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2VsZW1lbnRfcmVmJztcblxuLyoqXG4gKiBDb25zdHJ1Y3QgcHJvdmlkZXJzIHNwZWNpZmljIHRvIGFuIGluZGl2aWR1YWwgcm9vdCBjb21wb25lbnQuXG4gKi9cbmZ1bmN0aW9uIF9jb21wb25lbnRQcm92aWRlcnMoYXBwQ29tcG9uZW50VHlwZTogVHlwZSk6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPiB7XG4gIHJldHVybiA8YW55W10+W3Byb3ZpZGUoQVBQX0NPTVBPTkVOVCwge3VzZVZhbHVlOiBhcHBDb21wb25lbnRUeXBlfSksXG4gICAgICAgICAgICAgICAgIHByb3ZpZGUoQVBQX0NPTVBPTkVOVF9SRUZfUFJPTUlTRSxcbiAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VGYWN0b3J5OiAoZHluYW1pY0NvbXBvbmVudExvYWRlcjogRHluYW1pY0NvbXBvbmVudExvYWRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBSZWY6IEFwcGxpY2F0aW9uUmVmXywgaW5qZWN0b3I6IEluamVjdG9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNhdmUgdGhlIENvbXBvbmVudFJlZiBmb3IgZGlzcG9zYWwgbGF0ZXIuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZWY6IENvbXBvbmVudFJlZjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyhyYWRvKTogaW52ZXN0aWdhdGUgd2hldGhlciB0byBzdXBwb3J0IHByb3ZpZGVycyBvbiByb290XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbXBvbmVudC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGR5bmFtaWNDb21wb25lbnRMb2FkZXIubG9hZEFzUm9vdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwQ29tcG9uZW50VHlwZSwgbnVsbCwgaW5qZWN0b3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBSZWYuX3VubG9hZENvbXBvbmVudChyZWYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGNvbXBvbmVudFJlZikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWYgPSBjb21wb25lbnRSZWY7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0ZXN0YWJpbGl0eSA9IGluamVjdG9yLmdldE9wdGlvbmFsKFRlc3RhYmlsaXR5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzUHJlc2VudCh0ZXN0YWJpbGl0eSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmplY3Rvci5nZXQoVGVzdGFiaWxpdHlSZWdpc3RyeSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlZ2lzdGVyQXBwbGljYXRpb24oY29tcG9uZW50UmVmLmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RhYmlsaXR5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29tcG9uZW50UmVmO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwczogW0R5bmFtaWNDb21wb25lbnRMb2FkZXIsIEFwcGxpY2F0aW9uUmVmLCBJbmplY3Rvcl1cbiAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgcHJvdmlkZShhcHBDb21wb25lbnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZUZhY3Rvcnk6IChwOiBQcm9taXNlPGFueT4pID0+IHAudGhlbihyZWYgPT4gcmVmLmluc3RhbmNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHM6IFtBUFBfQ09NUE9ORU5UX1JFRl9QUk9NSVNFXVxuICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICBdO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhbiBBbmd1bGFyIHpvbmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVOZ1pvbmUoKTogTmdab25lIHtcbiAgcmV0dXJuIG5ldyBOZ1pvbmUoe2VuYWJsZUxvbmdTdGFja1RyYWNlOiBhc3NlcnRpb25zRW5hYmxlZCgpfSk7XG59XG5cbnZhciBfcGxhdGZvcm06IFBsYXRmb3JtUmVmO1xudmFyIF9wbGF0Zm9ybVByb3ZpZGVyczogYW55W107XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgQW5ndWxhciAncGxhdGZvcm0nIG9uIHRoZSBwYWdlLlxuICpcbiAqIFNlZSB7QGxpbmsgUGxhdGZvcm1SZWZ9IGZvciBkZXRhaWxzIG9uIHRoZSBBbmd1bGFyIHBsYXRmb3JtLlxuICpcbiAqIEl0IGlzIGFsc28gcG9zc2libGUgdG8gc3BlY2lmeSBwcm92aWRlcnMgdG8gYmUgbWFkZSBpbiB0aGUgbmV3IHBsYXRmb3JtLiBUaGVzZSBwcm92aWRlcnNcbiAqIHdpbGwgYmUgc2hhcmVkIGJldHdlZW4gYWxsIGFwcGxpY2F0aW9ucyBvbiB0aGUgcGFnZS4gRm9yIGV4YW1wbGUsIGFuIGFic3RyYWN0aW9uIGZvclxuICogdGhlIGJyb3dzZXIgY29va2llIGphciBzaG91bGQgYmUgYm91bmQgYXQgdGhlIHBsYXRmb3JtIGxldmVsLCBiZWNhdXNlIHRoZXJlIGlzIG9ubHkgb25lXG4gKiBjb29raWUgamFyIHJlZ2FyZGxlc3Mgb2YgaG93IG1hbnkgYXBwbGljYXRpb25zIG9uIHRoZSBwYWdlIHdpbGwgYmUgYWNjZXNzaW5nIGl0LlxuICpcbiAqIFRoZSBwbGF0Zm9ybSBmdW5jdGlvbiBjYW4gYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzIGFzIGxvbmcgYXMgdGhlIHNhbWUgbGlzdCBvZiBwcm92aWRlcnNcbiAqIGlzIHBhc3NlZCBpbnRvIGVhY2ggY2FsbC4gSWYgdGhlIHBsYXRmb3JtIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIGEgZGlmZmVyZW50IHNldCBvZlxuICogcHJvdmlkZXMsIEFuZ3VsYXIgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwbGF0Zm9ybShwcm92aWRlcnM/OiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBQbGF0Zm9ybVJlZiB7XG4gIGxvY2tNb2RlKCk7XG4gIGlmIChpc1ByZXNlbnQoX3BsYXRmb3JtKSkge1xuICAgIGlmIChMaXN0V3JhcHBlci5lcXVhbHMoX3BsYXRmb3JtUHJvdmlkZXJzLCBwcm92aWRlcnMpKSB7XG4gICAgICByZXR1cm4gX3BsYXRmb3JtO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcInBsYXRmb3JtIGNhbm5vdCBiZSBpbml0aWFsaXplZCB3aXRoIGRpZmZlcmVudCBzZXRzIG9mIHByb3ZpZGVycy5cIik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBfY3JlYXRlUGxhdGZvcm0ocHJvdmlkZXJzKTtcbiAgfVxufVxuXG4vKipcbiAqIERpc3Bvc2UgdGhlIGV4aXN0aW5nIHBsYXRmb3JtLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzcG9zZVBsYXRmb3JtKCk6IHZvaWQge1xuICBpZiAoaXNQcmVzZW50KF9wbGF0Zm9ybSkpIHtcbiAgICBfcGxhdGZvcm0uZGlzcG9zZSgpO1xuICAgIF9wbGF0Zm9ybSA9IG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2NyZWF0ZVBsYXRmb3JtKHByb3ZpZGVycz86IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPik6IFBsYXRmb3JtUmVmIHtcbiAgX3BsYXRmb3JtUHJvdmlkZXJzID0gcHJvdmlkZXJzO1xuICBsZXQgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKHByb3ZpZGVycyk7XG4gIF9wbGF0Zm9ybSA9IG5ldyBQbGF0Zm9ybVJlZl8oaW5qZWN0b3IsICgpID0+IHtcbiAgICBfcGxhdGZvcm0gPSBudWxsO1xuICAgIF9wbGF0Zm9ybVByb3ZpZGVycyA9IG51bGw7XG4gIH0pO1xuICBfcnVuUGxhdGZvcm1Jbml0aWFsaXplcnMoaW5qZWN0b3IpO1xuICByZXR1cm4gX3BsYXRmb3JtO1xufVxuXG5mdW5jdGlvbiBfcnVuUGxhdGZvcm1Jbml0aWFsaXplcnMoaW5qZWN0b3I6IEluamVjdG9yKTogdm9pZCB7XG4gIGxldCBpbml0czogRnVuY3Rpb25bXSA9IDxGdW5jdGlvbltdPmluamVjdG9yLmdldE9wdGlvbmFsKFBMQVRGT1JNX0lOSVRJQUxJWkVSKTtcbiAgaWYgKGlzUHJlc2VudChpbml0cykpIGluaXRzLmZvckVhY2goaW5pdCA9PiBpbml0KCkpO1xufVxuXG4vKipcbiAqIFRoZSBBbmd1bGFyIHBsYXRmb3JtIGlzIHRoZSBlbnRyeSBwb2ludCBmb3IgQW5ndWxhciBvbiBhIHdlYiBwYWdlLiBFYWNoIHBhZ2VcbiAqIGhhcyBleGFjdGx5IG9uZSBwbGF0Zm9ybSwgYW5kIHNlcnZpY2VzIChzdWNoIGFzIHJlZmxlY3Rpb24pIHdoaWNoIGFyZSBjb21tb25cbiAqIHRvIGV2ZXJ5IEFuZ3VsYXIgYXBwbGljYXRpb24gcnVubmluZyBvbiB0aGUgcGFnZSBhcmUgYm91bmQgaW4gaXRzIHNjb3BlLlxuICpcbiAqIEEgcGFnZSdzIHBsYXRmb3JtIGlzIGluaXRpYWxpemVkIGltcGxpY2l0bHkgd2hlbiB7QGxpbmsgYm9vdHN0cmFwfSgpIGlzIGNhbGxlZCwgb3JcbiAqIGV4cGxpY2l0bHkgYnkgY2FsbGluZyB7QGxpbmsgcGxhdGZvcm19KCkuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBQbGF0Zm9ybVJlZiB7XG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGxpc3RlbmVyIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBwbGF0Zm9ybSBpcyBkaXNwb3NlZC5cbiAgICovXG4gIGFic3RyYWN0IHJlZ2lzdGVyRGlzcG9zZUxpc3RlbmVyKGRpc3Bvc2U6ICgpID0+IHZvaWQpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB0aGUgcGxhdGZvcm0ge0BsaW5rIEluamVjdG9yfSwgd2hpY2ggaXMgdGhlIHBhcmVudCBpbmplY3RvciBmb3JcbiAgICogZXZlcnkgQW5ndWxhciBhcHBsaWNhdGlvbiBvbiB0aGUgcGFnZSBhbmQgcHJvdmlkZXMgc2luZ2xldG9uIHByb3ZpZGVycy5cbiAgICovXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHRocm93IHVuaW1wbGVtZW50ZWQoKTsgfTtcblxuICAvKipcbiAgICogSW5zdGFudGlhdGUgYSBuZXcgQW5ndWxhciBhcHBsaWNhdGlvbiBvbiB0aGUgcGFnZS5cbiAgICpcbiAgICogIyMjIFdoYXQgaXMgYW4gYXBwbGljYXRpb24/XG4gICAqXG4gICAqIEVhY2ggQW5ndWxhciBhcHBsaWNhdGlvbiBoYXMgaXRzIG93biB6b25lLCBjaGFuZ2UgZGV0ZWN0aW9uLCBjb21waWxlcixcbiAgICogcmVuZGVyZXIsIGFuZCBvdGhlciBmcmFtZXdvcmsgY29tcG9uZW50cy4gQW4gYXBwbGljYXRpb24gaG9zdHMgb25lIG9yIG1vcmVcbiAgICogcm9vdCBjb21wb25lbnRzLCB3aGljaCBjYW4gYmUgaW5pdGlhbGl6ZWQgdmlhIGBBcHBsaWNhdGlvblJlZi5ib290c3RyYXAoKWAuXG4gICAqXG4gICAqICMjIyBBcHBsaWNhdGlvbiBQcm92aWRlcnNcbiAgICpcbiAgICogQW5ndWxhciBhcHBsaWNhdGlvbnMgcmVxdWlyZSBudW1lcm91cyBwcm92aWRlcnMgdG8gYmUgcHJvcGVybHkgaW5zdGFudGlhdGVkLlxuICAgKiBXaGVuIHVzaW5nIGBhcHBsaWNhdGlvbigpYCB0byBjcmVhdGUgYSBuZXcgYXBwIG9uIHRoZSBwYWdlLCB0aGVzZSBwcm92aWRlcnNcbiAgICogbXVzdCBiZSBwcm92aWRlZC4gRm9ydHVuYXRlbHksIHRoZXJlIGFyZSBoZWxwZXIgZnVuY3Rpb25zIHRvIGNvbmZpZ3VyZVxuICAgKiB0eXBpY2FsIHByb3ZpZGVycywgYXMgc2hvd24gaW4gdGhlIGV4YW1wbGUgYmVsb3cuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIHtAZXhhbXBsZSBjb3JlL3RzL3BsYXRmb3JtL3BsYXRmb3JtLnRzIHJlZ2lvbj0nbG9uZ2Zvcm0nfVxuICAgKiAjIyMgU2VlIEFsc29cbiAgICpcbiAgICogU2VlIHRoZSB7QGxpbmsgYm9vdHN0cmFwfSBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGRldGFpbHMuXG4gICAqL1xuICBhYnN0cmFjdCBhcHBsaWNhdGlvbihwcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPik6IEFwcGxpY2F0aW9uUmVmO1xuXG4gIC8qKlxuICAgKiBJbnN0YW50aWF0ZSBhIG5ldyBBbmd1bGFyIGFwcGxpY2F0aW9uIG9uIHRoZSBwYWdlLCB1c2luZyBwcm92aWRlcnMgd2hpY2hcbiAgICogYXJlIG9ubHkgYXZhaWxhYmxlIGFzeW5jaHJvbm91c2x5LiBPbmUgc3VjaCB1c2UgY2FzZSBpcyB0byBpbml0aWFsaXplIGFuXG4gICAqIGFwcGxpY2F0aW9uIHJ1bm5pbmcgaW4gYSB3ZWIgd29ya2VyLlxuICAgKlxuICAgKiAjIyMgVXNhZ2VcbiAgICpcbiAgICogYGJpbmRpbmdGbmAgaXMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgY2FsbGVkIGluIHRoZSBuZXcgYXBwbGljYXRpb24ncyB6b25lLlxuICAgKiBJdCBzaG91bGQgcmV0dXJuIGEgYFByb21pc2VgIHRvIGEgbGlzdCBvZiBwcm92aWRlcnMgdG8gYmUgdXNlZCBmb3IgdGhlXG4gICAqIG5ldyBhcHBsaWNhdGlvbi4gT25jZSB0aGlzIHByb21pc2UgcmVzb2x2ZXMsIHRoZSBhcHBsaWNhdGlvbiB3aWxsIGJlXG4gICAqIGNvbnN0cnVjdGVkIGluIHRoZSBzYW1lIG1hbm5lciBhcyBhIG5vcm1hbCBgYXBwbGljYXRpb24oKWAuXG4gICAqL1xuICBhYnN0cmFjdCBhc3luY0FwcGxpY2F0aW9uKGJpbmRpbmdGbjogKHpvbmU6IE5nWm9uZSkgPT4gUHJvbWlzZTxBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVycz86IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPik6IFByb21pc2U8QXBwbGljYXRpb25SZWY+O1xuXG4gIC8qKlxuICAgKiBEZXN0cm95IHRoZSBBbmd1bGFyIHBsYXRmb3JtIGFuZCBhbGwgQW5ndWxhciBhcHBsaWNhdGlvbnMgb24gdGhlIHBhZ2UuXG4gICAqL1xuICBhYnN0cmFjdCBkaXNwb3NlKCk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBQbGF0Zm9ybVJlZl8gZXh0ZW5kcyBQbGF0Zm9ybVJlZiB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FwcGxpY2F0aW9uczogQXBwbGljYXRpb25SZWZbXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIF9kaXNwb3NlTGlzdGVuZXJzOiBGdW5jdGlvbltdID0gW107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfaW5qZWN0b3I6IEluamVjdG9yLCBwcml2YXRlIF9kaXNwb3NlOiAoKSA9PiB2b2lkKSB7IHN1cGVyKCk7IH1cblxuICByZWdpc3RlckRpc3Bvc2VMaXN0ZW5lcihkaXNwb3NlOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX2Rpc3Bvc2VMaXN0ZW5lcnMucHVzaChkaXNwb3NlKTsgfVxuXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLl9pbmplY3RvcjsgfVxuXG4gIGFwcGxpY2F0aW9uKHByb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogQXBwbGljYXRpb25SZWYge1xuICAgIHZhciBhcHAgPSB0aGlzLl9pbml0QXBwKGNyZWF0ZU5nWm9uZSgpLCBwcm92aWRlcnMpO1xuICAgIGlmIChQcm9taXNlV3JhcHBlci5pc1Byb21pc2UoYXBwKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgXCJDYW5ub3QgdXNlIGFzeW5jcm9ub3VzIGFwcCBpbml0aWFsaXplcnMgd2l0aCBhcHBsaWNhdGlvbi4gVXNlIGFzeW5jQXBwbGljYXRpb24gaW5zdGVhZC5cIik7XG4gICAgfVxuICAgIHJldHVybiA8QXBwbGljYXRpb25SZWY+YXBwO1xuICB9XG5cbiAgYXN5bmNBcHBsaWNhdGlvbihiaW5kaW5nRm46ICh6b25lOiBOZ1pvbmUpID0+IFByb21pc2U8QXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+PixcbiAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUHJvdmlkZXJzPzogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogUHJvbWlzZTxBcHBsaWNhdGlvblJlZj4ge1xuICAgIHZhciB6b25lID0gY3JlYXRlTmdab25lKCk7XG4gICAgdmFyIGNvbXBsZXRlciA9IFByb21pc2VXcmFwcGVyLmNvbXBsZXRlcjxBcHBsaWNhdGlvblJlZj4oKTtcbiAgICBpZiAoYmluZGluZ0ZuID09PSBudWxsKSB7XG4gICAgICBjb21wbGV0ZXIucmVzb2x2ZSh0aGlzLl9pbml0QXBwKHpvbmUsIGFkZGl0aW9uYWxQcm92aWRlcnMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgem9uZS5ydW4oKCkgPT4ge1xuICAgICAgICBQcm9taXNlV3JhcHBlci50aGVuKGJpbmRpbmdGbih6b25lKSwgKHByb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KSA9PiB7XG4gICAgICAgICAgaWYgKGlzUHJlc2VudChhZGRpdGlvbmFsUHJvdmlkZXJzKSkge1xuICAgICAgICAgICAgcHJvdmlkZXJzID0gTGlzdFdyYXBwZXIuY29uY2F0KHByb3ZpZGVycywgYWRkaXRpb25hbFByb3ZpZGVycyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBwcm9taXNlID0gdGhpcy5faW5pdEFwcCh6b25lLCBwcm92aWRlcnMpO1xuICAgICAgICAgIGNvbXBsZXRlci5yZXNvbHZlKHByb21pc2UpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gY29tcGxldGVyLnByb21pc2U7XG4gIH1cblxuICBwcml2YXRlIF9pbml0QXBwKHpvbmU6IE5nWm9uZSxcbiAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPik6IFByb21pc2U8QXBwbGljYXRpb25SZWY+fFxuICAgICAgQXBwbGljYXRpb25SZWYge1xuICAgIHZhciBpbmplY3RvcjogSW5qZWN0b3I7XG4gICAgdmFyIGFwcDogQXBwbGljYXRpb25SZWY7XG4gICAgem9uZS5ydW4oKCkgPT4ge1xuICAgICAgcHJvdmlkZXJzID0gTGlzdFdyYXBwZXIuY29uY2F0KHByb3ZpZGVycywgW1xuICAgICAgICBwcm92aWRlKE5nWm9uZSwge3VzZVZhbHVlOiB6b25lfSksXG4gICAgICAgIHByb3ZpZGUoQXBwbGljYXRpb25SZWYsIHt1c2VGYWN0b3J5OiAoKTogQXBwbGljYXRpb25SZWYgPT4gYXBwLCBkZXBzOiBbXX0pXG4gICAgICBdKTtcblxuICAgICAgdmFyIGV4Y2VwdGlvbkhhbmRsZXI6IEV4Y2VwdGlvbkhhbmRsZXI7XG4gICAgICB0cnkge1xuICAgICAgICBpbmplY3RvciA9IHRoaXMuaW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZUNoaWxkKHByb3ZpZGVycyk7XG4gICAgICAgIGV4Y2VwdGlvbkhhbmRsZXIgPSBpbmplY3Rvci5nZXQoRXhjZXB0aW9uSGFuZGxlcik7XG4gICAgICAgIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZSh6b25lLm9uRXJyb3IsIChlcnJvcjogTmdab25lRXJyb3IpID0+IHtcbiAgICAgICAgICBleGNlcHRpb25IYW5kbGVyLmNhbGwoZXJyb3IuZXJyb3IsIGVycm9yLnN0YWNrVHJhY2UpO1xuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKGlzUHJlc2VudChleGNlcHRpb25IYW5kbGVyKSkge1xuICAgICAgICAgIGV4Y2VwdGlvbkhhbmRsZXIuY2FsbChlLCBlLnN0YWNrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwcmludChlLnRvU3RyaW5nKCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgYXBwID0gbmV3IEFwcGxpY2F0aW9uUmVmXyh0aGlzLCB6b25lLCBpbmplY3Rvcik7XG4gICAgdGhpcy5fYXBwbGljYXRpb25zLnB1c2goYXBwKTtcbiAgICB2YXIgcHJvbWlzZSA9IF9ydW5BcHBJbml0aWFsaXplcnMoaW5qZWN0b3IpO1xuICAgIGlmIChwcm9taXNlICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIudGhlbihwcm9taXNlLCAoXykgPT4gYXBwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGFwcDtcbiAgICB9XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIExpc3RXcmFwcGVyLmNsb25lKHRoaXMuX2FwcGxpY2F0aW9ucykuZm9yRWFjaCgoYXBwKSA9PiBhcHAuZGlzcG9zZSgpKTtcbiAgICB0aGlzLl9kaXNwb3NlTGlzdGVuZXJzLmZvckVhY2goKGRpc3Bvc2UpID0+IGRpc3Bvc2UoKSk7XG4gICAgdGhpcy5fZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYXBwbGljYXRpb25EaXNwb3NlZChhcHA6IEFwcGxpY2F0aW9uUmVmKTogdm9pZCB7IExpc3RXcmFwcGVyLnJlbW92ZSh0aGlzLl9hcHBsaWNhdGlvbnMsIGFwcCk7IH1cbn1cblxuZnVuY3Rpb24gX3J1bkFwcEluaXRpYWxpemVycyhpbmplY3RvcjogSW5qZWN0b3IpOiBQcm9taXNlPGFueT4ge1xuICBsZXQgaW5pdHM6IEZ1bmN0aW9uW10gPSBpbmplY3Rvci5nZXRPcHRpb25hbChBUFBfSU5JVElBTElaRVIpO1xuICBsZXQgcHJvbWlzZXM6IFByb21pc2U8YW55PltdID0gW107XG4gIGlmIChpc1ByZXNlbnQoaW5pdHMpKSB7XG4gICAgaW5pdHMuZm9yRWFjaChpbml0ID0+IHtcbiAgICAgIHZhciByZXRWYWwgPSBpbml0KCk7XG4gICAgICBpZiAoUHJvbWlzZVdyYXBwZXIuaXNQcm9taXNlKHJldFZhbCkpIHtcbiAgICAgICAgcHJvbWlzZXMucHVzaChyZXRWYWwpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGlmIChwcm9taXNlcy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLmFsbChwcm9taXNlcyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBBIHJlZmVyZW5jZSB0byBhbiBBbmd1bGFyIGFwcGxpY2F0aW9uIHJ1bm5pbmcgb24gYSBwYWdlLlxuICpcbiAqIEZvciBtb3JlIGFib3V0IEFuZ3VsYXIgYXBwbGljYXRpb25zLCBzZWUgdGhlIGRvY3VtZW50YXRpb24gZm9yIHtAbGluayBib290c3RyYXB9LlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQXBwbGljYXRpb25SZWYge1xuICAvKipcbiAgICogUmVnaXN0ZXIgYSBsaXN0ZW5lciB0byBiZSBjYWxsZWQgZWFjaCB0aW1lIGBib290c3RyYXAoKWAgaXMgY2FsbGVkIHRvIGJvb3RzdHJhcFxuICAgKiBhIG5ldyByb290IGNvbXBvbmVudC5cbiAgICovXG4gIGFic3RyYWN0IHJlZ2lzdGVyQm9vdHN0cmFwTGlzdGVuZXIobGlzdGVuZXI6IChyZWY6IENvbXBvbmVudFJlZikgPT4gdm9pZCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgbGlzdGVuZXIgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGFwcGxpY2F0aW9uIGlzIGRpc3Bvc2VkLlxuICAgKi9cbiAgYWJzdHJhY3QgcmVnaXN0ZXJEaXNwb3NlTGlzdGVuZXIoZGlzcG9zZTogKCkgPT4gdm9pZCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEJvb3RzdHJhcCBhIG5ldyBjb21wb25lbnQgYXQgdGhlIHJvb3QgbGV2ZWwgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICAgKlxuICAgKiAjIyMgQm9vdHN0cmFwIHByb2Nlc3NcbiAgICpcbiAgICogV2hlbiBib290c3RyYXBwaW5nIGEgbmV3IHJvb3QgY29tcG9uZW50IGludG8gYW4gYXBwbGljYXRpb24sIEFuZ3VsYXIgbW91bnRzIHRoZVxuICAgKiBzcGVjaWZpZWQgYXBwbGljYXRpb24gY29tcG9uZW50IG9udG8gRE9NIGVsZW1lbnRzIGlkZW50aWZpZWQgYnkgdGhlIFtjb21wb25lbnRUeXBlXSdzXG4gICAqIHNlbGVjdG9yIGFuZCBraWNrcyBvZmYgYXV0b21hdGljIGNoYW5nZSBkZXRlY3Rpb24gdG8gZmluaXNoIGluaXRpYWxpemluZyB0aGUgY29tcG9uZW50LlxuICAgKlxuICAgKiAjIyMgT3B0aW9uYWwgUHJvdmlkZXJzXG4gICAqXG4gICAqIFByb3ZpZGVycyBmb3IgdGhlIGdpdmVuIGNvbXBvbmVudCBjYW4gb3B0aW9uYWxseSBiZSBvdmVycmlkZGVuIHZpYSB0aGUgYHByb3ZpZGVyc2BcbiAgICogcGFyYW1ldGVyLiBUaGVzZSBwcm92aWRlcnMgd2lsbCBvbmx5IGFwcGx5IGZvciB0aGUgcm9vdCBjb21wb25lbnQgYmVpbmcgYWRkZWQgYW5kIGFueVxuICAgKiBjaGlsZCBjb21wb25lbnRzIHVuZGVyIGl0LlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKiB7QGV4YW1wbGUgY29yZS90cy9wbGF0Zm9ybS9wbGF0Zm9ybS50cyByZWdpb249J2xvbmdmb3JtJ31cbiAgICovXG4gIGFic3RyYWN0IGJvb3RzdHJhcChjb21wb25lbnRUeXBlOiBUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJzPzogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogUHJvbWlzZTxDb21wb25lbnRSZWY+O1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB0aGUgYXBwbGljYXRpb24ge0BsaW5rIEluamVjdG9yfS5cbiAgICovXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiA8SW5qZWN0b3I+dW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB0aGUgYXBwbGljYXRpb24ge0BsaW5rIE5nWm9uZX0uXG4gICAqL1xuICBnZXQgem9uZSgpOiBOZ1pvbmUgeyByZXR1cm4gPE5nWm9uZT51bmltcGxlbWVudGVkKCk7IH07XG5cbiAgLyoqXG4gICAqIERpc3Bvc2Ugb2YgdGhpcyBhcHBsaWNhdGlvbiBhbmQgYWxsIG9mIGl0cyBjb21wb25lbnRzLlxuICAgKi9cbiAgYWJzdHJhY3QgZGlzcG9zZSgpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBJbnZva2UgdGhpcyBtZXRob2QgdG8gZXhwbGljaXRseSBwcm9jZXNzIGNoYW5nZSBkZXRlY3Rpb24gYW5kIGl0cyBzaWRlLWVmZmVjdHMuXG4gICAqXG4gICAqIEluIGRldmVsb3BtZW50IG1vZGUsIGB0aWNrKClgIGFsc28gcGVyZm9ybXMgYSBzZWNvbmQgY2hhbmdlIGRldGVjdGlvbiBjeWNsZSB0byBlbnN1cmUgdGhhdCBub1xuICAgKiBmdXJ0aGVyIGNoYW5nZXMgYXJlIGRldGVjdGVkLiBJZiBhZGRpdGlvbmFsIGNoYW5nZXMgYXJlIHBpY2tlZCB1cCBkdXJpbmcgdGhpcyBzZWNvbmQgY3ljbGUsXG4gICAqIGJpbmRpbmdzIGluIHRoZSBhcHAgaGF2ZSBzaWRlLWVmZmVjdHMgdGhhdCBjYW5ub3QgYmUgcmVzb2x2ZWQgaW4gYSBzaW5nbGUgY2hhbmdlIGRldGVjdGlvblxuICAgKiBwYXNzLlxuICAgKiBJbiB0aGlzIGNhc2UsIEFuZ3VsYXIgdGhyb3dzIGFuIGVycm9yLCBzaW5jZSBhbiBBbmd1bGFyIGFwcGxpY2F0aW9uIGNhbiBvbmx5IGhhdmUgb25lIGNoYW5nZVxuICAgKiBkZXRlY3Rpb24gcGFzcyBkdXJpbmcgd2hpY2ggYWxsIGNoYW5nZSBkZXRlY3Rpb24gbXVzdCBjb21wbGV0ZS5cbiAgICovXG4gIGFic3RyYWN0IHRpY2soKTogdm9pZDtcblxuICAvKipcbiAgICogR2V0IGEgbGlzdCBvZiBjb21wb25lbnQgdHlwZXMgcmVnaXN0ZXJlZCB0byB0aGlzIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgZ2V0IGNvbXBvbmVudFR5cGVzKCk6IFR5cGVbXSB7IHJldHVybiA8VHlwZVtdPnVuaW1wbGVtZW50ZWQoKTsgfTtcbn1cblxuZXhwb3J0IGNsYXNzIEFwcGxpY2F0aW9uUmVmXyBleHRlbmRzIEFwcGxpY2F0aW9uUmVmIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBzdGF0aWMgX3RpY2tTY29wZTogV3RmU2NvcGVGbiA9IHd0ZkNyZWF0ZVNjb3BlKCdBcHBsaWNhdGlvblJlZiN0aWNrKCknKTtcblxuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX2Jvb3RzdHJhcExpc3RlbmVyczogRnVuY3Rpb25bXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX2Rpc3Bvc2VMaXN0ZW5lcnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9yb290Q29tcG9uZW50czogQ29tcG9uZW50UmVmW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9yb290Q29tcG9uZW50VHlwZXM6IFR5cGVbXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmczogQ2hhbmdlRGV0ZWN0b3JSZWZbXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX3J1bm5pbmdUaWNrOiBib29sZWFuID0gZmFsc2U7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfZW5mb3JjZU5vTmV3Q2hhbmdlczogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3BsYXRmb3JtOiBQbGF0Zm9ybVJlZl8sIHByaXZhdGUgX3pvbmU6IE5nWm9uZSwgcHJpdmF0ZSBfaW5qZWN0b3I6IEluamVjdG9yKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3pvbmUpKSB7XG4gICAgICBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUodGhpcy5fem9uZS5vbk1pY3JvdGFza0VtcHR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChfKSA9PiB7IHRoaXMuX3pvbmUucnVuKCgpID0+IHsgdGhpcy50aWNrKCk7IH0pOyB9KTtcbiAgICB9XG4gICAgdGhpcy5fZW5mb3JjZU5vTmV3Q2hhbmdlcyA9IGFzc2VydGlvbnNFbmFibGVkKCk7XG4gIH1cblxuICByZWdpc3RlckJvb3RzdHJhcExpc3RlbmVyKGxpc3RlbmVyOiAocmVmOiBDb21wb25lbnRSZWYpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9ib290c3RyYXBMaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gIH1cblxuICByZWdpc3RlckRpc3Bvc2VMaXN0ZW5lcihkaXNwb3NlOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX2Rpc3Bvc2VMaXN0ZW5lcnMucHVzaChkaXNwb3NlKTsgfVxuXG4gIHJlZ2lzdGVyQ2hhbmdlRGV0ZWN0b3IoY2hhbmdlRGV0ZWN0b3I6IENoYW5nZURldGVjdG9yUmVmKTogdm9pZCB7XG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWZzLnB1c2goY2hhbmdlRGV0ZWN0b3IpO1xuICB9XG5cbiAgdW5yZWdpc3RlckNoYW5nZURldGVjdG9yKGNoYW5nZURldGVjdG9yOiBDaGFuZ2VEZXRlY3RvclJlZik6IHZvaWQge1xuICAgIExpc3RXcmFwcGVyLnJlbW92ZSh0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZnMsIGNoYW5nZURldGVjdG9yKTtcbiAgfVxuXG4gIGJvb3RzdHJhcChjb21wb25lbnRUeXBlOiBUeXBlLFxuICAgICAgICAgICAgcHJvdmlkZXJzPzogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogUHJvbWlzZTxDb21wb25lbnRSZWY+IHtcbiAgICB2YXIgY29tcGxldGVyID0gUHJvbWlzZVdyYXBwZXIuY29tcGxldGVyKCk7XG4gICAgdGhpcy5fem9uZS5ydW4oKCkgPT4ge1xuICAgICAgdmFyIGNvbXBvbmVudFByb3ZpZGVycyA9IF9jb21wb25lbnRQcm92aWRlcnMoY29tcG9uZW50VHlwZSk7XG4gICAgICBpZiAoaXNQcmVzZW50KHByb3ZpZGVycykpIHtcbiAgICAgICAgY29tcG9uZW50UHJvdmlkZXJzLnB1c2gocHJvdmlkZXJzKTtcbiAgICAgIH1cbiAgICAgIHZhciBleGNlcHRpb25IYW5kbGVyID0gdGhpcy5faW5qZWN0b3IuZ2V0KEV4Y2VwdGlvbkhhbmRsZXIpO1xuICAgICAgdGhpcy5fcm9vdENvbXBvbmVudFR5cGVzLnB1c2goY29tcG9uZW50VHlwZSk7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgaW5qZWN0b3I6IEluamVjdG9yID0gdGhpcy5faW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZUNoaWxkKGNvbXBvbmVudFByb3ZpZGVycyk7XG4gICAgICAgIHZhciBjb21wUmVmVG9rZW46IFByb21pc2U8Q29tcG9uZW50UmVmPiA9IGluamVjdG9yLmdldChBUFBfQ09NUE9ORU5UX1JFRl9QUk9NSVNFKTtcbiAgICAgICAgdmFyIHRpY2sgPSAoY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWYpID0+IHtcbiAgICAgICAgICB0aGlzLl9sb2FkQ29tcG9uZW50KGNvbXBvbmVudFJlZik7XG4gICAgICAgICAgY29tcGxldGVyLnJlc29sdmUoY29tcG9uZW50UmVmKTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgdGlja1Jlc3VsdCA9IFByb21pc2VXcmFwcGVyLnRoZW4oY29tcFJlZlRva2VuLCB0aWNrKTtcblxuICAgICAgICBQcm9taXNlV3JhcHBlci50aGVuKHRpY2tSZXN1bHQsIG51bGwsIChlcnIsIHN0YWNrVHJhY2UpID0+IHtcbiAgICAgICAgICBjb21wbGV0ZXIucmVqZWN0KGVyciwgc3RhY2tUcmFjZSk7XG4gICAgICAgICAgZXhjZXB0aW9uSGFuZGxlci5jYWxsKGVyciwgc3RhY2tUcmFjZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBleGNlcHRpb25IYW5kbGVyLmNhbGwoZSwgZS5zdGFjayk7XG4gICAgICAgIGNvbXBsZXRlci5yZWplY3QoZSwgZS5zdGFjayk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvbXBsZXRlci5wcm9taXNlLnRoZW48Q29tcG9uZW50UmVmPigocmVmOiBDb21wb25lbnRSZWYpID0+IHtcbiAgICAgIGxldCBjOiBDb25zb2xlID0gdGhpcy5faW5qZWN0b3IuZ2V0KENvbnNvbGUpO1xuICAgICAgaWYgKGFzc2VydGlvbnNFbmFibGVkKCkpIHtcbiAgICAgICAgYy5sb2coXG4gICAgICAgICAgICBcIkFuZ3VsYXIgMiBpcyBydW5uaW5nIGluIHRoZSBkZXZlbG9wbWVudCBtb2RlLiBDYWxsIGVuYWJsZVByb2RNb2RlKCkgdG8gZW5hYmxlIHRoZSBwcm9kdWN0aW9uIG1vZGUuXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlZjtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2xvYWRDb21wb25lbnQoY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWYpOiB2b2lkIHtcbiAgICB2YXIgYXBwQ2hhbmdlRGV0ZWN0b3IgPVxuICAgICAgICAoPEVsZW1lbnRSZWZfPmNvbXBvbmVudFJlZi5sb2NhdGlvbikuaW50ZXJuYWxFbGVtZW50LnBhcmVudFZpZXcuY2hhbmdlRGV0ZWN0b3I7XG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWZzLnB1c2goYXBwQ2hhbmdlRGV0ZWN0b3IucmVmKTtcbiAgICB0aGlzLnRpY2soKTtcbiAgICB0aGlzLl9yb290Q29tcG9uZW50cy5wdXNoKGNvbXBvbmVudFJlZik7XG4gICAgdGhpcy5fYm9vdHN0cmFwTGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiBsaXN0ZW5lcihjb21wb25lbnRSZWYpKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3VubG9hZENvbXBvbmVudChjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZik6IHZvaWQge1xuICAgIGlmICghTGlzdFdyYXBwZXIuY29udGFpbnModGhpcy5fcm9vdENvbXBvbmVudHMsIGNvbXBvbmVudFJlZikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy51bnJlZ2lzdGVyQ2hhbmdlRGV0ZWN0b3IoXG4gICAgICAgICg8RWxlbWVudFJlZl8+Y29tcG9uZW50UmVmLmxvY2F0aW9uKS5pbnRlcm5hbEVsZW1lbnQucGFyZW50Vmlldy5jaGFuZ2VEZXRlY3Rvci5yZWYpO1xuICAgIExpc3RXcmFwcGVyLnJlbW92ZSh0aGlzLl9yb290Q29tcG9uZW50cywgY29tcG9uZW50UmVmKTtcbiAgfVxuXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLl9pbmplY3RvcjsgfVxuXG4gIGdldCB6b25lKCk6IE5nWm9uZSB7IHJldHVybiB0aGlzLl96b25lOyB9XG5cbiAgdGljaygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcnVubmluZ1RpY2spIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFwiQXBwbGljYXRpb25SZWYudGljayBpcyBjYWxsZWQgcmVjdXJzaXZlbHlcIik7XG4gICAgfVxuXG4gICAgdmFyIHMgPSBBcHBsaWNhdGlvblJlZl8uX3RpY2tTY29wZSgpO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLl9ydW5uaW5nVGljayA9IHRydWU7XG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZnMuZm9yRWFjaCgoZGV0ZWN0b3IpID0+IGRldGVjdG9yLmRldGVjdENoYW5nZXMoKSk7XG4gICAgICBpZiAodGhpcy5fZW5mb3JjZU5vTmV3Q2hhbmdlcykge1xuICAgICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZnMuZm9yRWFjaCgoZGV0ZWN0b3IpID0+IGRldGVjdG9yLmNoZWNrTm9DaGFuZ2VzKCkpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLl9ydW5uaW5nVGljayA9IGZhbHNlO1xuICAgICAgd3RmTGVhdmUocyk7XG4gICAgfVxuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICAvLyBUT0RPKGFseGh1Yik6IERpc3Bvc2Ugb2YgdGhlIE5nWm9uZS5cbiAgICBMaXN0V3JhcHBlci5jbG9uZSh0aGlzLl9yb290Q29tcG9uZW50cykuZm9yRWFjaCgocmVmKSA9PiByZWYuZGlzcG9zZSgpKTtcbiAgICB0aGlzLl9kaXNwb3NlTGlzdGVuZXJzLmZvckVhY2goKGRpc3Bvc2UpID0+IGRpc3Bvc2UoKSk7XG4gICAgdGhpcy5fcGxhdGZvcm0uX2FwcGxpY2F0aW9uRGlzcG9zZWQodGhpcyk7XG4gIH1cblxuICBnZXQgY29tcG9uZW50VHlwZXMoKTogVHlwZVtdIHsgcmV0dXJuIHRoaXMuX3Jvb3RDb21wb25lbnRUeXBlczsgfVxufVxuIl19