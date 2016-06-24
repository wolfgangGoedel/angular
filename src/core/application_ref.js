'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ng_zone_1 = require('angular2/src/core/zone/ng_zone');
var lang_1 = require('angular2/src/facade/lang');
var di_1 = require('angular2/src/core/di');
var application_tokens_1 = require('./application_tokens');
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var testability_1 = require('angular2/src/core/testability/testability');
var component_resolver_1 = require('angular2/src/core/linker/component_resolver');
var exceptions_1 = require('angular2/src/facade/exceptions');
var console_1 = require('angular2/src/core/console');
var profile_1 = require('./profile/profile');
/**
 * Create an Angular zone.
 */
function createNgZone() {
    return new ng_zone_1.NgZone({ enableLongStackTrace: lang_1.assertionsEnabled() });
}
exports.createNgZone = createNgZone;
var _platform;
var _inPlatformCreate = false;
/**
 * Creates a platform.
 * Platforms have to be eagerly created via this function.
 */
function createPlatform(injector) {
    if (_inPlatformCreate) {
        throw new exceptions_1.BaseException('Already creating a platform...');
    }
    if (lang_1.isPresent(_platform) && !_platform.disposed) {
        throw new exceptions_1.BaseException("There can be only one platform. Destroy the previous one to create a new one.");
    }
    lang_1.lockMode();
    _inPlatformCreate = true;
    try {
        _platform = injector.get(PlatformRef);
        _platform.init(injector);
    }
    finally {
        _inPlatformCreate = false;
    }
    return _platform;
}
exports.createPlatform = createPlatform;
/**
 * Checks that there currently is a platform
 * which contains the given token as a provider.
 */
function assertPlatform(requiredToken) {
    var platform = getPlatform();
    if (lang_1.isBlank(platform)) {
        throw new exceptions_1.BaseException('Not platform exists!');
    }
    if (lang_1.isPresent(platform) && lang_1.isBlank(platform.injector.get(requiredToken, null))) {
        throw new exceptions_1.BaseException('A platform with a different configuration has been created. Please destroy it first.');
    }
    return platform;
}
exports.assertPlatform = assertPlatform;
/**
 * Dispose the existing platform.
 */
function disposePlatform() {
    if (lang_1.isPresent(_platform) && !_platform.disposed) {
        _platform.dispose();
    }
}
exports.disposePlatform = disposePlatform;
/**
 * Returns the current platform.
 */
function getPlatform() {
    return lang_1.isPresent(_platform) && !_platform.disposed ? _platform : null;
}
exports.getPlatform = getPlatform;
/**
 * Shortcut for ApplicationRef.bootstrap.
 * Requires a platform the be created first.
 */
function coreBootstrap(injector, componentFactory) {
    var appRef = injector.get(ApplicationRef);
    return appRef.bootstrap(componentFactory);
}
exports.coreBootstrap = coreBootstrap;
/**
 * Resolves the componentFactory for the given component,
 * waits for asynchronous initializers and bootstraps the component.
 * Requires a platform the be created first.
 */
function coreLoadAndBootstrap(injector, componentType) {
    var appRef = injector.get(ApplicationRef);
    return appRef.run(function () {
        var componentResolver = injector.get(component_resolver_1.ComponentResolver);
        return async_1.PromiseWrapper
            .all([componentResolver.resolveComponent(componentType), appRef.waitForAsyncInitializers()])
            .then(function (arr) { return appRef.bootstrap(arr[0]); });
    });
}
exports.coreLoadAndBootstrap = coreLoadAndBootstrap;
/**
 * The Angular platform is the entry point for Angular on a web page. Each page
 * has exactly one platform, and services (such as reflection) which are common
 * to every Angular application running on the page are bound in its scope.
 *
 * A page's platform is initialized implicitly when {@link bootstrap}() is called, or
 * explicitly by calling {@link createPlatform}().
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
    Object.defineProperty(PlatformRef.prototype, "disposed", {
        get: function () { throw exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    return PlatformRef;
}());
exports.PlatformRef = PlatformRef;
var PlatformRef_ = (function (_super) {
    __extends(PlatformRef_, _super);
    function PlatformRef_() {
        _super.apply(this, arguments);
        /** @internal */
        this._applications = [];
        /** @internal */
        this._disposeListeners = [];
        this._disposed = false;
    }
    PlatformRef_.prototype.init = function (injector) {
        if (!_inPlatformCreate) {
            throw new exceptions_1.BaseException('Platforms have to be initialized via `createPlatform`!');
        }
        this._injector = injector;
        var inits = injector.get(application_tokens_1.PLATFORM_INITIALIZER, null);
        if (lang_1.isPresent(inits))
            inits.forEach(function (init) { return init(); });
    };
    PlatformRef_.prototype.registerDisposeListener = function (dispose) { this._disposeListeners.push(dispose); };
    Object.defineProperty(PlatformRef_.prototype, "injector", {
        get: function () { return this._injector; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlatformRef_.prototype, "disposed", {
        get: function () { return this._disposed; },
        enumerable: true,
        configurable: true
    });
    PlatformRef_.prototype.addApplication = function (appRef) { this._applications.push(appRef); };
    PlatformRef_.prototype.dispose = function () {
        collection_1.ListWrapper.clone(this._applications).forEach(function (app) { return app.dispose(); });
        this._disposeListeners.forEach(function (dispose) { return dispose(); });
        this._disposed = true;
    };
    /** @internal */
    PlatformRef_.prototype._applicationDisposed = function (app) { collection_1.ListWrapper.remove(this._applications, app); };
    PlatformRef_ = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], PlatformRef_);
    return PlatformRef_;
}(PlatformRef));
exports.PlatformRef_ = PlatformRef_;
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
    Object.defineProperty(ApplicationRef.prototype, "componentFactories", {
        /**
         * Get a list of component factories registered to this application.
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
        this._rootComponentFactories = [];
        /** @internal */
        this._changeDetectorRefs = [];
        /** @internal */
        this._runningTick = false;
        /** @internal */
        this._enforceNoNewChanges = false;
        var zone = _injector.get(ng_zone_1.NgZone);
        this._enforceNoNewChanges = lang_1.assertionsEnabled();
        zone.run(function () { _this._exceptionHandler = _injector.get(exceptions_1.ExceptionHandler); });
        this._asyncInitDonePromise = this.run(function () {
            var inits = _injector.get(application_tokens_1.APP_INITIALIZER, null);
            var asyncInitResults = [];
            var asyncInitDonePromise;
            if (lang_1.isPresent(inits)) {
                for (var i = 0; i < inits.length; i++) {
                    var initResult = inits[i]();
                    if (lang_1.isPromise(initResult)) {
                        asyncInitResults.push(initResult);
                    }
                }
            }
            if (asyncInitResults.length > 0) {
                asyncInitDonePromise =
                    async_1.PromiseWrapper.all(asyncInitResults).then(function (_) { return _this._asyncInitDone = true; });
                _this._asyncInitDone = false;
            }
            else {
                _this._asyncInitDone = true;
                asyncInitDonePromise = async_1.PromiseWrapper.resolve(true);
            }
            return asyncInitDonePromise;
        });
        async_1.ObservableWrapper.subscribe(zone.onError, function (error) {
            _this._exceptionHandler.call(error.error, error.stackTrace);
        });
        async_1.ObservableWrapper.subscribe(this._zone.onMicrotaskEmpty, function (_) { _this._zone.run(function () { _this.tick(); }); });
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
    ApplicationRef_.prototype.waitForAsyncInitializers = function () { return this._asyncInitDonePromise; };
    ApplicationRef_.prototype.run = function (callback) {
        var _this = this;
        var zone = this.injector.get(ng_zone_1.NgZone);
        var result;
        // Note: Don't use zone.runGuarded as we want to know about
        // the thrown exception!
        // Note: the completer needs to be created outside
        // of `zone.run` as Dart swallows rejected promises
        // via the onError callback of the promise.
        var completer = async_1.PromiseWrapper.completer();
        zone.run(function () {
            try {
                result = callback();
                if (lang_1.isPromise(result)) {
                    async_1.PromiseWrapper.then(result, function (ref) { completer.resolve(ref); }, function (err, stackTrace) {
                        completer.reject(err, stackTrace);
                        _this._exceptionHandler.call(err, stackTrace);
                    });
                }
            }
            catch (e) {
                _this._exceptionHandler.call(e, e.stack);
                throw e;
            }
        });
        return lang_1.isPromise(result) ? completer.promise : result;
    };
    ApplicationRef_.prototype.bootstrap = function (componentFactory) {
        var _this = this;
        if (!this._asyncInitDone) {
            throw new exceptions_1.BaseException('Cannot bootstrap as there are still asynchronous initializers running. Wait for them using waitForAsyncInitializers().');
        }
        return this.run(function () {
            _this._rootComponentFactories.push(componentFactory);
            var compRef = componentFactory.create(_this._injector, [], componentFactory.selector);
            compRef.onDestroy(function () { _this._unloadComponent(compRef); });
            var testability = compRef.injector.get(testability_1.Testability, null);
            if (lang_1.isPresent(testability)) {
                compRef.injector.get(testability_1.TestabilityRegistry)
                    .registerApplication(compRef.location.nativeElement, testability);
            }
            _this._loadComponent(compRef);
            var c = _this._injector.get(console_1.Console);
            if (lang_1.assertionsEnabled()) {
                c.log("Angular 2 is running in the development mode. Call enableProdMode() to enable the production mode.");
            }
            return compRef;
        });
    };
    /** @internal */
    ApplicationRef_.prototype._loadComponent = function (componentRef) {
        this._changeDetectorRefs.push(componentRef.changeDetectorRef);
        this.tick();
        this._rootComponents.push(componentRef);
        this._bootstrapListeners.forEach(function (listener) { return listener(componentRef); });
    };
    /** @internal */
    ApplicationRef_.prototype._unloadComponent = function (componentRef) {
        if (!collection_1.ListWrapper.contains(this._rootComponents, componentRef)) {
            return;
        }
        this.unregisterChangeDetector(componentRef.changeDetectorRef);
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
        collection_1.ListWrapper.clone(this._rootComponents).forEach(function (ref) { return ref.destroy(); });
        this._disposeListeners.forEach(function (dispose) { return dispose(); });
        this._platform._applicationDisposed(this);
    };
    Object.defineProperty(ApplicationRef_.prototype, "componentTypes", {
        get: function () {
            return this._rootComponentFactories.map(function (factory) { return factory.componentType; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ApplicationRef_.prototype, "componentFactories", {
        get: function () { return this._rootComponentFactories; },
        enumerable: true,
        configurable: true
    });
    ;
    /** @internal */
    ApplicationRef_._tickScope = profile_1.wtfCreateScope('ApplicationRef#tick()');
    ApplicationRef_ = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [PlatformRef_, ng_zone_1.NgZone, di_1.Injector])
    ], ApplicationRef_);
    return ApplicationRef_;
}(ApplicationRef));
exports.ApplicationRef_ = ApplicationRef_;
/**
 * @internal
 */
exports.PLATFORM_CORE_PROVIDERS = lang_1.CONST_EXPR([PlatformRef_, lang_1.CONST_EXPR(new di_1.Provider(PlatformRef, { useExisting: PlatformRef_ }))]);
/**
 * @internal
 */
exports.APPLICATION_CORE_PROVIDERS = lang_1.CONST_EXPR([
    lang_1.CONST_EXPR(new di_1.Provider(ng_zone_1.NgZone, { useFactory: createNgZone, deps: lang_1.CONST_EXPR([]) })),
    ApplicationRef_,
    lang_1.CONST_EXPR(new di_1.Provider(ApplicationRef, { useExisting: ApplicationRef_ }))
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb25fcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1BT2FjbVk4VC50bXAvYW5ndWxhcjIvc3JjL2NvcmUvYXBwbGljYXRpb25fcmVmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHdCQUFrQyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ25FLHFCQVVPLDBCQUEwQixDQUFDLENBQUE7QUFDbEMsbUJBQXNELHNCQUFzQixDQUFDLENBQUE7QUFDN0UsbUNBQTRFLHNCQUFzQixDQUFDLENBQUE7QUFDbkcsc0JBQWtFLDJCQUEyQixDQUFDLENBQUE7QUFDOUYsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFDM0QsNEJBQStDLDJDQUEyQyxDQUFDLENBQUE7QUFDM0YsbUNBQWdDLDZDQUE2QyxDQUFDLENBQUE7QUFFOUUsMkJBS08sZ0NBQWdDLENBQUMsQ0FBQTtBQUN4Qyx3QkFBc0IsMkJBQTJCLENBQUMsQ0FBQTtBQUNsRCx3QkFBbUQsbUJBQW1CLENBQUMsQ0FBQTtBQUt2RTs7R0FFRztBQUNIO0lBQ0UsTUFBTSxDQUFDLElBQUksZ0JBQU0sQ0FBQyxFQUFDLG9CQUFvQixFQUFFLHdCQUFpQixFQUFFLEVBQUMsQ0FBQyxDQUFDO0FBQ2pFLENBQUM7QUFGZSxvQkFBWSxlQUUzQixDQUFBO0FBRUQsSUFBSSxTQUF1QixDQUFDO0FBQzVCLElBQUksaUJBQWlCLEdBQVksS0FBSyxDQUFDO0FBRXZDOzs7R0FHRztBQUNILHdCQUErQixRQUFrQjtJQUMvQyxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7UUFDdEIsTUFBTSxJQUFJLDBCQUFhLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBQ0QsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMs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LGVBQVUsRUFBRTs7dUJBQUE7SUFpTGIsc0JBQUM7QUFBRCxDQUFDLEFBaExELENBQXFDLGNBQWMsR0FnTGxEO0FBaExZLHVCQUFlLGtCQWdMM0IsQ0FBQTtBQUVEOztHQUVHO0FBQ1UsK0JBQXVCLEdBQ2hDLGlCQUFVLENBQUMsQ0FBQyxZQUFZLEVBQUUsaUJBQVUsQ0FBQyxJQUFJLGFBQVEsQ0FBQyxXQUFXLEVBQUUsRUFBQyxXQUFXLEVBQUUsWUFBWSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUVuRzs7R0FFRztBQUNVLGtDQUEwQixHQUFHLGlCQUFVLENBQUM7SUFDbkQsaUJBQVUsQ0FBQyxJQUFJLGFBQVEsQ0FBQyxnQkFBTSxFQUFFLEVBQUMsVUFBVSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsaUJBQVUsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUM7SUFDbEYsZUFBZTtJQUNmLGlCQUFVLENBQUMsSUFBSSxhQUFRLENBQUMsY0FBYyxFQUFFLEVBQUMsV0FBVyxFQUFFLGVBQWUsRUFBQyxDQUFDLENBQUM7Q0FDekUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtOZ1pvbmUsIE5nWm9uZUVycm9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS96b25lL25nX3pvbmUnO1xuaW1wb3J0IHtcbiAgVHlwZSxcbiAgaXNCbGFuayxcbiAgaXNQcmVzZW50LFxuICBhc3NlcnRpb25zRW5hYmxlZCxcbiAgcHJpbnQsXG4gIElTX0RBUlQsXG4gIENPTlNUX0VYUFIsXG4gIGxvY2tNb2RlLFxuICBpc1Byb21pc2Vcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7cHJvdmlkZSwgUHJvdmlkZXIsIEluamVjdG9yLCBJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge0FQUF9JRF9SQU5ET01fUFJPVklERVIsIFBMQVRGT1JNX0lOSVRJQUxJWkVSLCBBUFBfSU5JVElBTElaRVJ9IGZyb20gJy4vYXBwbGljYXRpb25fdG9rZW5zJztcbmltcG9ydCB7UHJvbWlzZVdyYXBwZXIsIFByb21pc2VDb21wbGV0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1Rlc3RhYmlsaXR5UmVnaXN0cnksIFRlc3RhYmlsaXR5fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS90ZXN0YWJpbGl0eS90ZXN0YWJpbGl0eSc7XG5pbXBvcnQge0NvbXBvbmVudFJlc29sdmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcG9uZW50X3Jlc29sdmVyJztcbmltcG9ydCB7Q29tcG9uZW50UmVmfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcG9uZW50X2ZhY3RvcnknO1xuaW1wb3J0IHtcbiAgQmFzZUV4Y2VwdGlvbixcbiAgV3JhcHBlZEV4Y2VwdGlvbixcbiAgRXhjZXB0aW9uSGFuZGxlcixcbiAgdW5pbXBsZW1lbnRlZFxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtDb25zb2xlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9jb25zb2xlJztcbmltcG9ydCB7d3RmTGVhdmUsIHd0ZkNyZWF0ZVNjb3BlLCBXdGZTY29wZUZufSBmcm9tICcuL3Byb2ZpbGUvcHJvZmlsZSc7XG5pbXBvcnQge0NoYW5nZURldGVjdG9yUmVmfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rvcl9yZWYnO1xuXG5pbXBvcnQge0NvbXBvbmVudEZhY3Rvcnl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9jb21wb25lbnRfZmFjdG9yeSc7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEFuZ3VsYXIgem9uZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU5nWm9uZSgpOiBOZ1pvbmUge1xuICByZXR1cm4gbmV3IE5nWm9uZSh7ZW5hYmxlTG9uZ1N0YWNrVHJhY2U6IGFzc2VydGlvbnNFbmFibGVkKCl9KTtcbn1cblxudmFyIF9wbGF0Zm9ybTogUGxhdGZvcm1SZWZfO1xudmFyIF9pblBsYXRmb3JtQ3JlYXRlOiBib29sZWFuID0gZmFsc2U7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHBsYXRmb3JtLlxuICogUGxhdGZvcm1zIGhhdmUgdG8gYmUgZWFnZXJseSBjcmVhdGVkIHZpYSB0aGlzIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUGxhdGZvcm0oaW5qZWN0b3I6IEluamVjdG9yKTogUGxhdGZvcm1SZWYge1xuICBpZiAoX2luUGxhdGZvcm1DcmVhdGUpIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignQWxyZWFkeSBjcmVhdGluZyBhIHBsYXRmb3JtLi4uJyk7XG4gIH1cbiAgaWYgKGlzUHJlc2VudChfcGxhdGZvcm0pICYmICFfcGxhdGZvcm0uZGlzcG9zZWQpIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgXCJUaGVyZSBjYW4gYmUgb25seSBvbmUgcGxhdGZvcm0uIERlc3Ryb3kgdGhlIHByZXZpb3VzIG9uZSB0byBjcmVhdGUgYSBuZXcgb25lLlwiKTtcbiAgfVxuICBsb2NrTW9kZSgpO1xuICBfaW5QbGF0Zm9ybUNyZWF0ZSA9IHRydWU7XG4gIHRyeSB7XG4gICAgX3BsYXRmb3JtID0gaW5qZWN0b3IuZ2V0KFBsYXRmb3JtUmVmKTtcbiAgICBfcGxhdGZvcm0uaW5pdChpbmplY3Rvcik7XG4gIH0gZmluYWxseSB7XG4gICAgX2luUGxhdGZvcm1DcmVhdGUgPSBmYWxzZTtcbiAgfVxuICByZXR1cm4gX3BsYXRmb3JtO1xufVxuXG4vKipcbiAqIENoZWNrcyB0aGF0IHRoZXJlIGN1cnJlbnRseSBpcyBhIHBsYXRmb3JtXG4gKiB3aGljaCBjb250YWlucyB0aGUgZ2l2ZW4gdG9rZW4gYXMgYSBwcm92aWRlci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydFBsYXRmb3JtKHJlcXVpcmVkVG9rZW46IGFueSk6IFBsYXRmb3JtUmVmIHtcbiAgdmFyIHBsYXRmb3JtID0gZ2V0UGxhdGZvcm0oKTtcbiAgaWYgKGlzQmxhbmsocGxhdGZvcm0pKSB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ05vdCBwbGF0Zm9ybSBleGlzdHMhJyk7XG4gIH1cbiAgaWYgKGlzUHJlc2VudChwbGF0Zm9ybSkgJiYgaXNCbGFuayhwbGF0Zm9ybS5pbmplY3Rvci5nZXQocmVxdWlyZWRUb2tlbiwgbnVsbCkpKSB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICdBIHBsYXRmb3JtIHdpdGggYSBkaWZmZXJlbnQgY29uZmlndXJhdGlvbiBoYXMgYmVlbiBjcmVhdGVkLiBQbGVhc2UgZGVzdHJveSBpdCBmaXJzdC4nKTtcbiAgfVxuICByZXR1cm4gcGxhdGZvcm07XG59XG5cbi8qKlxuICogRGlzcG9zZSB0aGUgZXhpc3RpbmcgcGxhdGZvcm0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXNwb3NlUGxhdGZvcm0oKTogdm9pZCB7XG4gIGlmIChpc1ByZXNlbnQoX3BsYXRmb3JtKSAmJiAhX3BsYXRmb3JtLmRpc3Bvc2VkKSB7XG4gICAgX3BsYXRmb3JtLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGN1cnJlbnQgcGxhdGZvcm0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQbGF0Zm9ybSgpOiBQbGF0Zm9ybVJlZiB7XG4gIHJldHVybiBpc1ByZXNlbnQoX3BsYXRmb3JtKSAmJiAhX3BsYXRmb3JtLmRpc3Bvc2VkID8gX3BsYXRmb3JtIDogbnVsbDtcbn1cblxuLyoqXG4gKiBTaG9ydGN1dCBmb3IgQXBwbGljYXRpb25SZWYuYm9vdHN0cmFwLlxuICogUmVxdWlyZXMgYSBwbGF0Zm9ybSB0aGUgYmUgY3JlYXRlZCBmaXJzdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvcmVCb290c3RyYXAoaW5qZWN0b3I6IEluamVjdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeSk6IENvbXBvbmVudFJlZiB7XG4gIHZhciBhcHBSZWY6IEFwcGxpY2F0aW9uUmVmID0gaW5qZWN0b3IuZ2V0KEFwcGxpY2F0aW9uUmVmKTtcbiAgcmV0dXJuIGFwcFJlZi5ib290c3RyYXAoY29tcG9uZW50RmFjdG9yeSk7XG59XG5cbi8qKlxuICogUmVzb2x2ZXMgdGhlIGNvbXBvbmVudEZhY3RvcnkgZm9yIHRoZSBnaXZlbiBjb21wb25lbnQsXG4gKiB3YWl0cyBmb3IgYXN5bmNocm9ub3VzIGluaXRpYWxpemVycyBhbmQgYm9vdHN0cmFwcyB0aGUgY29tcG9uZW50LlxuICogUmVxdWlyZXMgYSBwbGF0Zm9ybSB0aGUgYmUgY3JlYXRlZCBmaXJzdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvcmVMb2FkQW5kQm9vdHN0cmFwKGluamVjdG9yOiBJbmplY3RvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRUeXBlOiBUeXBlKTogUHJvbWlzZTxDb21wb25lbnRSZWY+IHtcbiAgdmFyIGFwcFJlZjogQXBwbGljYXRpb25SZWYgPSBpbmplY3Rvci5nZXQoQXBwbGljYXRpb25SZWYpO1xuICByZXR1cm4gYXBwUmVmLnJ1bigoKSA9PiB7XG4gICAgdmFyIGNvbXBvbmVudFJlc29sdmVyOiBDb21wb25lbnRSZXNvbHZlciA9IGluamVjdG9yLmdldChDb21wb25lbnRSZXNvbHZlcik7XG4gICAgcmV0dXJuIFByb21pc2VXcmFwcGVyXG4gICAgICAgIC5hbGwoW2NvbXBvbmVudFJlc29sdmVyLnJlc29sdmVDb21wb25lbnQoY29tcG9uZW50VHlwZSksIGFwcFJlZi53YWl0Rm9yQXN5bmNJbml0aWFsaXplcnMoKV0pXG4gICAgICAgIC50aGVuKChhcnIpID0+IGFwcFJlZi5ib290c3RyYXAoYXJyWzBdKSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRoZSBBbmd1bGFyIHBsYXRmb3JtIGlzIHRoZSBlbnRyeSBwb2ludCBmb3IgQW5ndWxhciBvbiBhIHdlYiBwYWdlLiBFYWNoIHBhZ2VcbiAqIGhhcyBleGFjdGx5IG9uZSBwbGF0Zm9ybSwgYW5kIHNlcnZpY2VzIChzdWNoIGFzIHJlZmxlY3Rpb24pIHdoaWNoIGFyZSBjb21tb25cbiAqIHRvIGV2ZXJ5IEFuZ3VsYXIgYXBwbGljYXRpb24gcnVubmluZyBvbiB0aGUgcGFnZSBhcmUgYm91bmQgaW4gaXRzIHNjb3BlLlxuICpcbiAqIEEgcGFnZSdzIHBsYXRmb3JtIGlzIGluaXRpYWxpemVkIGltcGxpY2l0bHkgd2hlbiB7QGxpbmsgYm9vdHN0cmFwfSgpIGlzIGNhbGxlZCwgb3JcbiAqIGV4cGxpY2l0bHkgYnkgY2FsbGluZyB7QGxpbmsgY3JlYXRlUGxhdGZvcm19KCkuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBQbGF0Zm9ybVJlZiB7XG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGxpc3RlbmVyIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBwbGF0Zm9ybSBpcyBkaXNwb3NlZC5cbiAgICovXG4gIGFic3RyYWN0IHJlZ2lzdGVyRGlzcG9zZUxpc3RlbmVyKGRpc3Bvc2U6ICgpID0+IHZvaWQpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB0aGUgcGxhdGZvcm0ge0BsaW5rIEluamVjdG9yfSwgd2hpY2ggaXMgdGhlIHBhcmVudCBpbmplY3RvciBmb3JcbiAgICogZXZlcnkgQW5ndWxhciBhcHBsaWNhdGlvbiBvbiB0aGUgcGFnZSBhbmQgcHJvdmlkZXMgc2luZ2xldG9uIHByb3ZpZGVycy5cbiAgICovXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHRocm93IHVuaW1wbGVtZW50ZWQoKTsgfTtcblxuICAvKipcbiAgICogRGVzdHJveSB0aGUgQW5ndWxhciBwbGF0Zm9ybSBhbmQgYWxsIEFuZ3VsYXIgYXBwbGljYXRpb25zIG9uIHRoZSBwYWdlLlxuICAgKi9cbiAgYWJzdHJhY3QgZGlzcG9zZSgpOiB2b2lkO1xuXG4gIGdldCBkaXNwb3NlZCgpOiBib29sZWFuIHsgdGhyb3cgdW5pbXBsZW1lbnRlZCgpOyB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBQbGF0Zm9ybVJlZl8gZXh0ZW5kcyBQbGF0Zm9ybVJlZiB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FwcGxpY2F0aW9uczogQXBwbGljYXRpb25SZWZbXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIF9kaXNwb3NlTGlzdGVuZXJzOiBGdW5jdGlvbltdID0gW107XG5cbiAgcHJpdmF0ZSBfZGlzcG9zZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3I7XG5cbiAgaW5pdChpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgICBpZiAoIV9pblBsYXRmb3JtQ3JlYXRlKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignUGxhdGZvcm1zIGhhdmUgdG8gYmUgaW5pdGlhbGl6ZWQgdmlhIGBjcmVhdGVQbGF0Zm9ybWAhJyk7XG4gICAgfVxuICAgIHRoaXMuX2luamVjdG9yID0gaW5qZWN0b3I7XG4gICAgbGV0IGluaXRzOiBGdW5jdGlvbltdID0gPEZ1bmN0aW9uW10+aW5qZWN0b3IuZ2V0KFBMQVRGT1JNX0lOSVRJQUxJWkVSLCBudWxsKTtcbiAgICBpZiAoaXNQcmVzZW50KGluaXRzKSkgaW5pdHMuZm9yRWFjaChpbml0ID0+IGluaXQoKSk7XG4gIH1cblxuICByZWdpc3RlckRpc3Bvc2VMaXN0ZW5lcihkaXNwb3NlOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX2Rpc3Bvc2VMaXN0ZW5lcnMucHVzaChkaXNwb3NlKTsgfVxuXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLl9pbmplY3RvcjsgfVxuXG4gIGdldCBkaXNwb3NlZCgpIHsgcmV0dXJuIHRoaXMuX2Rpc3Bvc2VkOyB9XG5cbiAgYWRkQXBwbGljYXRpb24oYXBwUmVmOiBBcHBsaWNhdGlvblJlZikgeyB0aGlzLl9hcHBsaWNhdGlvbnMucHVzaChhcHBSZWYpOyB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBMaXN0V3JhcHBlci5jbG9uZSh0aGlzLl9hcHBsaWNhdGlvbnMpLmZvckVhY2goKGFwcCkgPT4gYXBwLmRpc3Bvc2UoKSk7XG4gICAgdGhpcy5fZGlzcG9zZUxpc3RlbmVycy5mb3JFYWNoKChkaXNwb3NlKSA9PiBkaXNwb3NlKCkpO1xuICAgIHRoaXMuX2Rpc3Bvc2VkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FwcGxpY2F0aW9uRGlzcG9zZWQoYXBwOiBBcHBsaWNhdGlvblJlZik6IHZvaWQgeyBMaXN0V3JhcHBlci5yZW1vdmUodGhpcy5fYXBwbGljYXRpb25zLCBhcHApOyB9XG59XG5cbi8qKlxuICogQSByZWZlcmVuY2UgdG8gYW4gQW5ndWxhciBhcHBsaWNhdGlvbiBydW5uaW5nIG9uIGEgcGFnZS5cbiAqXG4gKiBGb3IgbW9yZSBhYm91dCBBbmd1bGFyIGFwcGxpY2F0aW9ucywgc2VlIHRoZSBkb2N1bWVudGF0aW9uIGZvciB7QGxpbmsgYm9vdHN0cmFwfS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFwcGxpY2F0aW9uUmVmIHtcbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgbGlzdGVuZXIgdG8gYmUgY2FsbGVkIGVhY2ggdGltZSBgYm9vdHN0cmFwKClgIGlzIGNhbGxlZCB0byBib290c3RyYXBcbiAgICogYSBuZXcgcm9vdCBjb21wb25lbnQuXG4gICAqL1xuICBhYnN0cmFjdCByZWdpc3RlckJvb3RzdHJhcExpc3RlbmVyKGxpc3RlbmVyOiAocmVmOiBDb21wb25lbnRSZWYpID0+IHZvaWQpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGxpc3RlbmVyIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBhcHBsaWNhdGlvbiBpcyBkaXNwb3NlZC5cbiAgICovXG4gIGFic3RyYWN0IHJlZ2lzdGVyRGlzcG9zZUxpc3RlbmVyKGRpc3Bvc2U6ICgpID0+IHZvaWQpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gYWxsIGFzeW5jaHJvbm91cyBhcHBsaWNhdGlvbiBpbml0aWFsaXplcnNcbiAgICogYXJlIGRvbmUuXG4gICAqL1xuICBhYnN0cmFjdCB3YWl0Rm9yQXN5bmNJbml0aWFsaXplcnMoKTogUHJvbWlzZTxhbnk+O1xuXG4gIC8qKlxuICAgKiBSdW5zIHRoZSBnaXZlbiBjYWxsYmFjayBpbiB0aGUgem9uZSBhbmQgcmV0dXJucyB0aGUgcmVzdWx0IG9mIHRoZSBjYWxsYmFjay5cbiAgICogRXhjZXB0aW9ucyB3aWxsIGJlIGZvcndhcmRlZCB0byB0aGUgRXhjZXB0aW9uSGFuZGxlciBhbmQgcmV0aHJvd24uXG4gICAqL1xuICBhYnN0cmFjdCBydW4oY2FsbGJhY2s6IEZ1bmN0aW9uKTogYW55O1xuXG4gIC8qKlxuICAgKiBCb290c3RyYXAgYSBuZXcgY29tcG9uZW50IGF0IHRoZSByb290IGxldmVsIG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAgICpcbiAgICogIyMjIEJvb3RzdHJhcCBwcm9jZXNzXG4gICAqXG4gICAqIFdoZW4gYm9vdHN0cmFwcGluZyBhIG5ldyByb290IGNvbXBvbmVudCBpbnRvIGFuIGFwcGxpY2F0aW9uLCBBbmd1bGFyIG1vdW50cyB0aGVcbiAgICogc3BlY2lmaWVkIGFwcGxpY2F0aW9uIGNvbXBvbmVudCBvbnRvIERPTSBlbGVtZW50cyBpZGVudGlmaWVkIGJ5IHRoZSBbY29tcG9uZW50VHlwZV0nc1xuICAgKiBzZWxlY3RvciBhbmQga2lja3Mgb2ZmIGF1dG9tYXRpYyBjaGFuZ2UgZGV0ZWN0aW9uIHRvIGZpbmlzaCBpbml0aWFsaXppbmcgdGhlIGNvbXBvbmVudC5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICoge0BleGFtcGxlIGNvcmUvdHMvcGxhdGZvcm0vcGxhdGZvcm0udHMgcmVnaW9uPSdsb25nZm9ybSd9XG4gICAqL1xuICBhYnN0cmFjdCBib290c3RyYXAoY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeSk6IENvbXBvbmVudFJlZjtcblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIGFwcGxpY2F0aW9uIHtAbGluayBJbmplY3Rvcn0uXG4gICAqL1xuICBnZXQgaW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gPEluamVjdG9yPnVuaW1wbGVtZW50ZWQoKTsgfTtcblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIGFwcGxpY2F0aW9uIHtAbGluayBOZ1pvbmV9LlxuICAgKi9cbiAgZ2V0IHpvbmUoKTogTmdab25lIHsgcmV0dXJuIDxOZ1pvbmU+dW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBEaXNwb3NlIG9mIHRoaXMgYXBwbGljYXRpb24gYW5kIGFsbCBvZiBpdHMgY29tcG9uZW50cy5cbiAgICovXG4gIGFic3RyYWN0IGRpc3Bvc2UoKTogdm9pZDtcblxuICAvKipcbiAgICogSW52b2tlIHRoaXMgbWV0aG9kIHRvIGV4cGxpY2l0bHkgcHJvY2VzcyBjaGFuZ2UgZGV0ZWN0aW9uIGFuZCBpdHMgc2lkZS1lZmZlY3RzLlxuICAgKlxuICAgKiBJbiBkZXZlbG9wbWVudCBtb2RlLCBgdGljaygpYCBhbHNvIHBlcmZvcm1zIGEgc2Vjb25kIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGUgdG8gZW5zdXJlIHRoYXQgbm9cbiAgICogZnVydGhlciBjaGFuZ2VzIGFyZSBkZXRlY3RlZC4gSWYgYWRkaXRpb25hbCBjaGFuZ2VzIGFyZSBwaWNrZWQgdXAgZHVyaW5nIHRoaXMgc2Vjb25kIGN5Y2xlLFxuICAgKiBiaW5kaW5ncyBpbiB0aGUgYXBwIGhhdmUgc2lkZS1lZmZlY3RzIHRoYXQgY2Fubm90IGJlIHJlc29sdmVkIGluIGEgc2luZ2xlIGNoYW5nZSBkZXRlY3Rpb25cbiAgICogcGFzcy5cbiAgICogSW4gdGhpcyBjYXNlLCBBbmd1bGFyIHRocm93cyBhbiBlcnJvciwgc2luY2UgYW4gQW5ndWxhciBhcHBsaWNhdGlvbiBjYW4gb25seSBoYXZlIG9uZSBjaGFuZ2VcbiAgICogZGV0ZWN0aW9uIHBhc3MgZHVyaW5nIHdoaWNoIGFsbCBjaGFuZ2UgZGV0ZWN0aW9uIG11c3QgY29tcGxldGUuXG4gICAqL1xuICBhYnN0cmFjdCB0aWNrKCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEdldCBhIGxpc3Qgb2YgY29tcG9uZW50IHR5cGVzIHJlZ2lzdGVyZWQgdG8gdGhpcyBhcHBsaWNhdGlvbi5cbiAgICovXG4gIGdldCBjb21wb25lbnRUeXBlcygpOiBUeXBlW10geyByZXR1cm4gPFR5cGVbXT51bmltcGxlbWVudGVkKCk7IH07XG5cbiAgLyoqXG4gICAqIEdldCBhIGxpc3Qgb2YgY29tcG9uZW50IGZhY3RvcmllcyByZWdpc3RlcmVkIHRvIHRoaXMgYXBwbGljYXRpb24uXG4gICAqL1xuICBnZXQgY29tcG9uZW50RmFjdG9yaWVzKCk6IENvbXBvbmVudEZhY3RvcnlbXSB7IHJldHVybiA8Q29tcG9uZW50RmFjdG9yeVtdPnVuaW1wbGVtZW50ZWQoKTsgfTtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFwcGxpY2F0aW9uUmVmXyBleHRlbmRzIEFwcGxpY2F0aW9uUmVmIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBzdGF0aWMgX3RpY2tTY29wZTogV3RmU2NvcGVGbiA9IHd0ZkNyZWF0ZVNjb3BlKCdBcHBsaWNhdGlvblJlZiN0aWNrKCknKTtcblxuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX2Jvb3RzdHJhcExpc3RlbmVyczogRnVuY3Rpb25bXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX2Rpc3Bvc2VMaXN0ZW5lcnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9yb290Q29tcG9uZW50czogQ29tcG9uZW50UmVmW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9yb290Q29tcG9uZW50RmFjdG9yaWVzOiBDb21wb25lbnRGYWN0b3J5W10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZnM6IENoYW5nZURldGVjdG9yUmVmW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9ydW5uaW5nVGljazogYm9vbGVhbiA9IGZhbHNlO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX2VuZm9yY2VOb05ld0NoYW5nZXM6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBwcml2YXRlIF9leGNlcHRpb25IYW5kbGVyOiBFeGNlcHRpb25IYW5kbGVyO1xuXG4gIHByaXZhdGUgX2FzeW5jSW5pdERvbmVQcm9taXNlOiBQcm9taXNlPGFueT47XG4gIHByaXZhdGUgX2FzeW5jSW5pdERvbmU6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcGxhdGZvcm06IFBsYXRmb3JtUmVmXywgcHJpdmF0ZSBfem9uZTogTmdab25lLCBwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgICBzdXBlcigpO1xuICAgIHZhciB6b25lOiBOZ1pvbmUgPSBfaW5qZWN0b3IuZ2V0KE5nWm9uZSk7XG4gICAgdGhpcy5fZW5mb3JjZU5vTmV3Q2hhbmdlcyA9IGFzc2VydGlvbnNFbmFibGVkKCk7XG4gICAgem9uZS5ydW4oKCkgPT4geyB0aGlzLl9leGNlcHRpb25IYW5kbGVyID0gX2luamVjdG9yLmdldChFeGNlcHRpb25IYW5kbGVyKTsgfSk7XG4gICAgdGhpcy5fYXN5bmNJbml0RG9uZVByb21pc2UgPSB0aGlzLnJ1bigoKSA9PiB7XG4gICAgICBsZXQgaW5pdHM6IEZ1bmN0aW9uW10gPSBfaW5qZWN0b3IuZ2V0KEFQUF9JTklUSUFMSVpFUiwgbnVsbCk7XG4gICAgICB2YXIgYXN5bmNJbml0UmVzdWx0cyA9IFtdO1xuICAgICAgdmFyIGFzeW5jSW5pdERvbmVQcm9taXNlO1xuICAgICAgaWYgKGlzUHJlc2VudChpbml0cykpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbml0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBpbml0UmVzdWx0ID0gaW5pdHNbaV0oKTtcbiAgICAgICAgICBpZiAoaXNQcm9taXNlKGluaXRSZXN1bHQpKSB7XG4gICAgICAgICAgICBhc3luY0luaXRSZXN1bHRzLnB1c2goaW5pdFJlc3VsdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoYXN5bmNJbml0UmVzdWx0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGFzeW5jSW5pdERvbmVQcm9taXNlID1cbiAgICAgICAgICAgIFByb21pc2VXcmFwcGVyLmFsbChhc3luY0luaXRSZXN1bHRzKS50aGVuKChfKSA9PiB0aGlzLl9hc3luY0luaXREb25lID0gdHJ1ZSk7XG4gICAgICAgIHRoaXMuX2FzeW5jSW5pdERvbmUgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2FzeW5jSW5pdERvbmUgPSB0cnVlO1xuICAgICAgICBhc3luY0luaXREb25lUHJvbWlzZSA9IFByb21pc2VXcmFwcGVyLnJlc29sdmUodHJ1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYXN5bmNJbml0RG9uZVByb21pc2U7XG4gICAgfSk7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHpvbmUub25FcnJvciwgKGVycm9yOiBOZ1pvbmVFcnJvcikgPT4ge1xuICAgICAgdGhpcy5fZXhjZXB0aW9uSGFuZGxlci5jYWxsKGVycm9yLmVycm9yLCBlcnJvci5zdGFja1RyYWNlKTtcbiAgICB9KTtcbiAgICBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUodGhpcy5fem9uZS5vbk1pY3JvdGFza0VtcHR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoXykgPT4geyB0aGlzLl96b25lLnJ1bigoKSA9PiB7IHRoaXMudGljaygpOyB9KTsgfSk7XG4gIH1cblxuICByZWdpc3RlckJvb3RzdHJhcExpc3RlbmVyKGxpc3RlbmVyOiAocmVmOiBDb21wb25lbnRSZWYpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9ib290c3RyYXBMaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gIH1cblxuICByZWdpc3RlckRpc3Bvc2VMaXN0ZW5lcihkaXNwb3NlOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX2Rpc3Bvc2VMaXN0ZW5lcnMucHVzaChkaXNwb3NlKTsgfVxuXG4gIHJlZ2lzdGVyQ2hhbmdlRGV0ZWN0b3IoY2hhbmdlRGV0ZWN0b3I6IENoYW5nZURldGVjdG9yUmVmKTogdm9pZCB7XG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWZzLnB1c2goY2hhbmdlRGV0ZWN0b3IpO1xuICB9XG5cbiAgdW5yZWdpc3RlckNoYW5nZURldGVjdG9yKGNoYW5nZURldGVjdG9yOiBDaGFuZ2VEZXRlY3RvclJlZik6IHZvaWQge1xuICAgIExpc3RXcmFwcGVyLnJlbW92ZSh0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZnMsIGNoYW5nZURldGVjdG9yKTtcbiAgfVxuXG4gIHdhaXRGb3JBc3luY0luaXRpYWxpemVycygpOiBQcm9taXNlPGFueT4geyByZXR1cm4gdGhpcy5fYXN5bmNJbml0RG9uZVByb21pc2U7IH1cblxuICBydW4oY2FsbGJhY2s6IEZ1bmN0aW9uKTogYW55IHtcbiAgICB2YXIgem9uZSA9IHRoaXMuaW5qZWN0b3IuZ2V0KE5nWm9uZSk7XG4gICAgdmFyIHJlc3VsdDtcbiAgICAvLyBOb3RlOiBEb24ndCB1c2Ugem9uZS5ydW5HdWFyZGVkIGFzIHdlIHdhbnQgdG8ga25vdyBhYm91dFxuICAgIC8vIHRoZSB0aHJvd24gZXhjZXB0aW9uIVxuICAgIC8vIE5vdGU6IHRoZSBjb21wbGV0ZXIgbmVlZHMgdG8gYmUgY3JlYXRlZCBvdXRzaWRlXG4gICAgLy8gb2YgYHpvbmUucnVuYCBhcyBEYXJ0IHN3YWxsb3dzIHJlamVjdGVkIHByb21pc2VzXG4gICAgLy8gdmlhIHRoZSBvbkVycm9yIGNhbGxiYWNrIG9mIHRoZSBwcm9taXNlLlxuICAgIHZhciBjb21wbGV0ZXIgPSBQcm9taXNlV3JhcHBlci5jb21wbGV0ZXIoKTtcbiAgICB6b25lLnJ1bigoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICByZXN1bHQgPSBjYWxsYmFjaygpO1xuICAgICAgICBpZiAoaXNQcm9taXNlKHJlc3VsdCkpIHtcbiAgICAgICAgICBQcm9taXNlV3JhcHBlci50aGVuKHJlc3VsdCwgKHJlZikgPT4geyBjb21wbGV0ZXIucmVzb2x2ZShyZWYpOyB9LCAoZXJyLCBzdGFja1RyYWNlKSA9PiB7XG4gICAgICAgICAgICBjb21wbGV0ZXIucmVqZWN0KGVyciwgc3RhY2tUcmFjZSk7XG4gICAgICAgICAgICB0aGlzLl9leGNlcHRpb25IYW5kbGVyLmNhbGwoZXJyLCBzdGFja1RyYWNlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLl9leGNlcHRpb25IYW5kbGVyLmNhbGwoZSwgZS5zdGFjayk7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGlzUHJvbWlzZShyZXN1bHQpID8gY29tcGxldGVyLnByb21pc2UgOiByZXN1bHQ7XG4gIH1cblxuICBib290c3RyYXAoY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeSk6IENvbXBvbmVudFJlZiB7XG4gICAgaWYgKCF0aGlzLl9hc3luY0luaXREb25lKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAnQ2Fubm90IGJvb3RzdHJhcCBhcyB0aGVyZSBhcmUgc3RpbGwgYXN5bmNocm9ub3VzIGluaXRpYWxpemVycyBydW5uaW5nLiBXYWl0IGZvciB0aGVtIHVzaW5nIHdhaXRGb3JBc3luY0luaXRpYWxpemVycygpLicpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5ydW4oKCkgPT4ge1xuICAgICAgdGhpcy5fcm9vdENvbXBvbmVudEZhY3Rvcmllcy5wdXNoKGNvbXBvbmVudEZhY3RvcnkpO1xuICAgICAgdmFyIGNvbXBSZWYgPSBjb21wb25lbnRGYWN0b3J5LmNyZWF0ZSh0aGlzLl9pbmplY3RvciwgW10sIGNvbXBvbmVudEZhY3Rvcnkuc2VsZWN0b3IpO1xuICAgICAgY29tcFJlZi5vbkRlc3Ryb3koKCkgPT4geyB0aGlzLl91bmxvYWRDb21wb25lbnQoY29tcFJlZik7IH0pO1xuICAgICAgdmFyIHRlc3RhYmlsaXR5ID0gY29tcFJlZi5pbmplY3Rvci5nZXQoVGVzdGFiaWxpdHksIG51bGwpO1xuICAgICAgaWYgKGlzUHJlc2VudCh0ZXN0YWJpbGl0eSkpIHtcbiAgICAgICAgY29tcFJlZi5pbmplY3Rvci5nZXQoVGVzdGFiaWxpdHlSZWdpc3RyeSlcbiAgICAgICAgICAgIC5yZWdpc3RlckFwcGxpY2F0aW9uKGNvbXBSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudCwgdGVzdGFiaWxpdHkpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9sb2FkQ29tcG9uZW50KGNvbXBSZWYpO1xuICAgICAgbGV0IGMgPSA8Q29uc29sZT50aGlzLl9pbmplY3Rvci5nZXQoQ29uc29sZSk7XG4gICAgICBpZiAoYXNzZXJ0aW9uc0VuYWJsZWQoKSkge1xuICAgICAgICBjLmxvZyhcbiAgICAgICAgICAgIFwiQW5ndWxhciAyIGlzIHJ1bm5pbmcgaW4gdGhlIGRldmVsb3BtZW50IG1vZGUuIENhbGwgZW5hYmxlUHJvZE1vZGUoKSB0byBlbmFibGUgdGhlIHByb2R1Y3Rpb24gbW9kZS5cIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29tcFJlZjtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2xvYWRDb21wb25lbnQoY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWYpOiB2b2lkIHtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZnMucHVzaChjb21wb25lbnRSZWYuY2hhbmdlRGV0ZWN0b3JSZWYpO1xuICAgIHRoaXMudGljaygpO1xuICAgIHRoaXMuX3Jvb3RDb21wb25lbnRzLnB1c2goY29tcG9uZW50UmVmKTtcbiAgICB0aGlzLl9ib290c3RyYXBMaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IGxpc3RlbmVyKGNvbXBvbmVudFJlZikpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdW5sb2FkQ29tcG9uZW50KGNvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmKTogdm9pZCB7XG4gICAgaWYgKCFMaXN0V3JhcHBlci5jb250YWlucyh0aGlzLl9yb290Q29tcG9uZW50cywgY29tcG9uZW50UmVmKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnVucmVnaXN0ZXJDaGFuZ2VEZXRlY3Rvcihjb21wb25lbnRSZWYuY2hhbmdlRGV0ZWN0b3JSZWYpO1xuICAgIExpc3RXcmFwcGVyLnJlbW92ZSh0aGlzLl9yb290Q29tcG9uZW50cywgY29tcG9uZW50UmVmKTtcbiAgfVxuXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLl9pbmplY3RvcjsgfVxuXG4gIGdldCB6b25lKCk6IE5nWm9uZSB7IHJldHVybiB0aGlzLl96b25lOyB9XG5cbiAgdGljaygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcnVubmluZ1RpY2spIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFwiQXBwbGljYXRpb25SZWYudGljayBpcyBjYWxsZWQgcmVjdXJzaXZlbHlcIik7XG4gICAgfVxuXG4gICAgdmFyIHMgPSBBcHBsaWNhdGlvblJlZl8uX3RpY2tTY29wZSgpO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLl9ydW5uaW5nVGljayA9IHRydWU7XG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZnMuZm9yRWFjaCgoZGV0ZWN0b3IpID0+IGRldGVjdG9yLmRldGVjdENoYW5nZXMoKSk7XG4gICAgICBpZiAodGhpcy5fZW5mb3JjZU5vTmV3Q2hhbmdlcykge1xuICAgICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZnMuZm9yRWFjaCgoZGV0ZWN0b3IpID0+IGRldGVjdG9yLmNoZWNrTm9DaGFuZ2VzKCkpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLl9ydW5uaW5nVGljayA9IGZhbHNlO1xuICAgICAgd3RmTGVhdmUocyk7XG4gICAgfVxuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICAvLyBUT0RPKGFseGh1Yik6IERpc3Bvc2Ugb2YgdGhlIE5nWm9uZS5cbiAgICBMaXN0V3JhcHBlci5jbG9uZSh0aGlzLl9yb290Q29tcG9uZW50cykuZm9yRWFjaCgocmVmKSA9PiByZWYuZGVzdHJveSgpKTtcbiAgICB0aGlzLl9kaXNwb3NlTGlzdGVuZXJzLmZvckVhY2goKGRpc3Bvc2UpID0+IGRpc3Bvc2UoKSk7XG4gICAgdGhpcy5fcGxhdGZvcm0uX2FwcGxpY2F0aW9uRGlzcG9zZWQodGhpcyk7XG4gIH1cblxuICBnZXQgY29tcG9uZW50VHlwZXMoKTogVHlwZVtdIHtcbiAgICByZXR1cm4gdGhpcy5fcm9vdENvbXBvbmVudEZhY3Rvcmllcy5tYXAoZmFjdG9yeSA9PiBmYWN0b3J5LmNvbXBvbmVudFR5cGUpO1xuICB9XG5cbiAgZ2V0IGNvbXBvbmVudEZhY3RvcmllcygpOiBDb21wb25lbnRGYWN0b3J5W10geyByZXR1cm4gdGhpcy5fcm9vdENvbXBvbmVudEZhY3RvcmllczsgfTtcbn1cblxuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xuZXhwb3J0IGNvbnN0IFBMQVRGT1JNX0NPUkVfUFJPVklERVJTID1cbiAgICBDT05TVF9FWFBSKFtQbGF0Zm9ybVJlZl8sIENPTlNUX0VYUFIobmV3IFByb3ZpZGVyKFBsYXRmb3JtUmVmLCB7dXNlRXhpc3Rpbmc6IFBsYXRmb3JtUmVmX30pKV0pO1xuXG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5leHBvcnQgY29uc3QgQVBQTElDQVRJT05fQ09SRV9QUk9WSURFUlMgPSBDT05TVF9FWFBSKFtcbiAgQ09OU1RfRVhQUihuZXcgUHJvdmlkZXIoTmdab25lLCB7dXNlRmFjdG9yeTogY3JlYXRlTmdab25lLCBkZXBzOiBDT05TVF9FWFBSKFtdKX0pKSxcbiAgQXBwbGljYXRpb25SZWZfLFxuICBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihBcHBsaWNhdGlvblJlZiwge3VzZUV4aXN0aW5nOiBBcHBsaWNhdGlvblJlZl99KSlcbl0pO1xuIl19