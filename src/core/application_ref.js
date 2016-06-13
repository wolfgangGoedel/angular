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
    function PlatformRef_(_injector) {
        _super.call(this);
        this._injector = _injector;
        /** @internal */
        this._applications = [];
        /** @internal */
        this._disposeListeners = [];
        this._disposed = false;
        if (!_inPlatformCreate) {
            throw new exceptions_1.BaseException('Platforms have to be created via `createPlatform`!');
        }
        var inits = _injector.get(application_tokens_1.PLATFORM_INITIALIZER, null);
        if (lang_1.isPresent(inits))
            inits.forEach(function (init) { return init(); });
    }
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
        __metadata('design:paramtypes', [di_1.Injector])
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
            _this._rootComponentTypes.push(componentFactory.componentType);
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
        get: function () { return this._rootComponentTypes; },
        enumerable: true,
        configurable: true
    });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb25fcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1GNjRCY1M4Mi50bXAvYW5ndWxhcjIvc3JjL2NvcmUvYXBwbGljYXRpb25fcmVmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHdCQUFrQyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ25FLHFCQVVPLDBCQUEwQixDQUFDLENBQUE7QUFDbEMsbUJBQXNELHNCQUFzQixDQUFDLENBQUE7QUFDN0UsbUNBQTRFLHNCQUFzQixDQUFDLENBQUE7QUFDbkcsc0JBQWtFLDJCQUEyQixDQUFDLENBQUE7QUFDOUYsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFDM0QsNEJBQStDLDJDQUEyQyxDQUFDLENBQUE7QUFDM0YsbUNBQWdDLDZDQUE2QyxDQUFDLENBQUE7QUFFOUUsMkJBS08sZ0NBQWdDLENBQUMsQ0FBQTtBQUN4Qyx3QkFBc0IsMkJBQTJCLENBQUMsQ0FBQTtBQUNsRCx3QkFBbUQsbUJBQW1CLENBQUMsQ0FBQTtBQUt2RTs7R0FFRztBQUNIO0lBQ0UsTUFBTSxDQUFDLElBQUksZ0JBQU0sQ0FBQyxFQUFDLG9CQUFvQixFQUFFLHdCQUFpQixFQUFFLEVBQUMsQ0FBQyxDQUFDO0FBQ2pFLENBQUM7QUFGZSxvQkFBWSxlQUUzQixDQUFBO0FBRUQsSUFBSSxTQUFzQixDQUFDO0FBQzNCLElBQUksaUJBQWlCLEdBQVksS0FBSyxDQUFDO0FBRXZDOzs7R0FHRztBQUNILHdCQUErQixRQUFrQjtJQUMvQyxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7UUFDdEIsTUFBTSxJQUFJLDBCQUFhLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBQ0QsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMs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QUMsZ0JBQU0sRUFBRSxFQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLGlCQUFVLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQ2xGLGVBQWU7SUFDZixpQkFBVSxDQUFDLElBQUksYUFBUSxDQUFDLGNBQWMsRUFBRSxFQUFDLFdBQVcsRUFBRSxlQUFlLEVBQUMsQ0FBQyxDQUFDO0NBQ3pFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Tmdab25lLCBOZ1pvbmVFcnJvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvem9uZS9uZ196b25lJztcbmltcG9ydCB7XG4gIFR5cGUsXG4gIGlzQmxhbmssXG4gIGlzUHJlc2VudCxcbiAgYXNzZXJ0aW9uc0VuYWJsZWQsXG4gIHByaW50LFxuICBJU19EQVJULFxuICBDT05TVF9FWFBSLFxuICBsb2NrTW9kZSxcbiAgaXNQcm9taXNlXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge3Byb3ZpZGUsIFByb3ZpZGVyLCBJbmplY3RvciwgSW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtBUFBfSURfUkFORE9NX1BST1ZJREVSLCBQTEFURk9STV9JTklUSUFMSVpFUiwgQVBQX0lOSVRJQUxJWkVSfSBmcm9tICcuL2FwcGxpY2F0aW9uX3Rva2Vucyc7XG5pbXBvcnQge1Byb21pc2VXcmFwcGVyLCBQcm9taXNlQ29tcGxldGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtUZXN0YWJpbGl0eVJlZ2lzdHJ5LCBUZXN0YWJpbGl0eX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvdGVzdGFiaWxpdHkvdGVzdGFiaWxpdHknO1xuaW1wb3J0IHtDb21wb25lbnRSZXNvbHZlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2NvbXBvbmVudF9yZXNvbHZlcic7XG5pbXBvcnQge0NvbXBvbmVudFJlZn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2NvbXBvbmVudF9mYWN0b3J5JztcbmltcG9ydCB7XG4gIEJhc2VFeGNlcHRpb24sXG4gIFdyYXBwZWRFeGNlcHRpb24sXG4gIEV4Y2VwdGlvbkhhbmRsZXIsXG4gIHVuaW1wbGVtZW50ZWRcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7Q29uc29sZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY29uc29sZSc7XG5pbXBvcnQge3d0ZkxlYXZlLCB3dGZDcmVhdGVTY29wZSwgV3RmU2NvcGVGbn0gZnJvbSAnLi9wcm9maWxlL3Byb2ZpbGUnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3RvclJlZn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0b3JfcmVmJztcblxuaW1wb3J0IHtDb21wb25lbnRGYWN0b3J5fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcG9uZW50X2ZhY3RvcnknO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBBbmd1bGFyIHpvbmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVOZ1pvbmUoKTogTmdab25lIHtcbiAgcmV0dXJuIG5ldyBOZ1pvbmUoe2VuYWJsZUxvbmdTdGFja1RyYWNlOiBhc3NlcnRpb25zRW5hYmxlZCgpfSk7XG59XG5cbnZhciBfcGxhdGZvcm06IFBsYXRmb3JtUmVmO1xudmFyIF9pblBsYXRmb3JtQ3JlYXRlOiBib29sZWFuID0gZmFsc2U7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHBsYXRmb3JtLlxuICogUGxhdGZvcm1zIGhhdmUgdG8gYmUgZWFnZXJseSBjcmVhdGVkIHZpYSB0aGlzIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUGxhdGZvcm0oaW5qZWN0b3I6IEluamVjdG9yKTogUGxhdGZvcm1SZWYge1xuICBpZiAoX2luUGxhdGZvcm1DcmVhdGUpIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignQWxyZWFkeSBjcmVhdGluZyBhIHBsYXRmb3JtLi4uJyk7XG4gIH1cbiAgaWYgKGlzUHJlc2VudChfcGxhdGZvcm0pICYmICFfcGxhdGZvcm0uZGlzcG9zZWQpIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgXCJUaGVyZSBjYW4gYmUgb25seSBvbmUgcGxhdGZvcm0uIERlc3Ryb3kgdGhlIHByZXZpb3VzIG9uZSB0byBjcmVhdGUgYSBuZXcgb25lLlwiKTtcbiAgfVxuICBsb2NrTW9kZSgpO1xuICBfaW5QbGF0Zm9ybUNyZWF0ZSA9IHRydWU7XG4gIHRyeSB7XG4gICAgX3BsYXRmb3JtID0gaW5qZWN0b3IuZ2V0KFBsYXRmb3JtUmVmKTtcbiAgfSBmaW5hbGx5IHtcbiAgICBfaW5QbGF0Zm9ybUNyZWF0ZSA9IGZhbHNlO1xuICB9XG4gIHJldHVybiBfcGxhdGZvcm07XG59XG5cbi8qKlxuICogQ2hlY2tzIHRoYXQgdGhlcmUgY3VycmVudGx5IGlzIGEgcGxhdGZvcm1cbiAqIHdoaWNoIGNvbnRhaW5zIHRoZSBnaXZlbiB0b2tlbiBhcyBhIHByb3ZpZGVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0UGxhdGZvcm0ocmVxdWlyZWRUb2tlbjogYW55KTogUGxhdGZvcm1SZWYge1xuICB2YXIgcGxhdGZvcm0gPSBnZXRQbGF0Zm9ybSgpO1xuICBpZiAoaXNCbGFuayhwbGF0Zm9ybSkpIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignTm90IHBsYXRmb3JtIGV4aXN0cyEnKTtcbiAgfVxuICBpZiAoaXNQcmVzZW50KHBsYXRmb3JtKSAmJiBpc0JsYW5rKHBsYXRmb3JtLmluamVjdG9yLmdldChyZXF1aXJlZFRva2VuLCBudWxsKSkpIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgJ0EgcGxhdGZvcm0gd2l0aCBhIGRpZmZlcmVudCBjb25maWd1cmF0aW9uIGhhcyBiZWVuIGNyZWF0ZWQuIFBsZWFzZSBkZXN0cm95IGl0IGZpcnN0LicpO1xuICB9XG4gIHJldHVybiBwbGF0Zm9ybTtcbn1cblxuLyoqXG4gKiBEaXNwb3NlIHRoZSBleGlzdGluZyBwbGF0Zm9ybS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3Bvc2VQbGF0Zm9ybSgpOiB2b2lkIHtcbiAgaWYgKGlzUHJlc2VudChfcGxhdGZvcm0pICYmICFfcGxhdGZvcm0uZGlzcG9zZWQpIHtcbiAgICBfcGxhdGZvcm0uZGlzcG9zZSgpO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY3VycmVudCBwbGF0Zm9ybS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFBsYXRmb3JtKCk6IFBsYXRmb3JtUmVmIHtcbiAgcmV0dXJuIGlzUHJlc2VudChfcGxhdGZvcm0pICYmICFfcGxhdGZvcm0uZGlzcG9zZWQgPyBfcGxhdGZvcm0gOiBudWxsO1xufVxuXG4vKipcbiAqIFNob3J0Y3V0IGZvciBBcHBsaWNhdGlvblJlZi5ib290c3RyYXAuXG4gKiBSZXF1aXJlcyBhIHBsYXRmb3JtIHRoZSBiZSBjcmVhdGVkIGZpcnN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29yZUJvb3RzdHJhcChpbmplY3RvcjogSW5qZWN0b3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5KTogQ29tcG9uZW50UmVmIHtcbiAgdmFyIGFwcFJlZjogQXBwbGljYXRpb25SZWYgPSBpbmplY3Rvci5nZXQoQXBwbGljYXRpb25SZWYpO1xuICByZXR1cm4gYXBwUmVmLmJvb3RzdHJhcChjb21wb25lbnRGYWN0b3J5KTtcbn1cblxuLyoqXG4gKiBSZXNvbHZlcyB0aGUgY29tcG9uZW50RmFjdG9yeSBmb3IgdGhlIGdpdmVuIGNvbXBvbmVudCxcbiAqIHdhaXRzIGZvciBhc3luY2hyb25vdXMgaW5pdGlhbGl6ZXJzIGFuZCBib290c3RyYXBzIHRoZSBjb21wb25lbnQuXG4gKiBSZXF1aXJlcyBhIHBsYXRmb3JtIHRoZSBiZSBjcmVhdGVkIGZpcnN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29yZUxvYWRBbmRCb290c3RyYXAoaW5qZWN0b3I6IEluamVjdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFR5cGU6IFR5cGUpOiBQcm9taXNlPENvbXBvbmVudFJlZj4ge1xuICB2YXIgYXBwUmVmOiBBcHBsaWNhdGlvblJlZiA9IGluamVjdG9yLmdldChBcHBsaWNhdGlvblJlZik7XG4gIHJldHVybiBhcHBSZWYucnVuKCgpID0+IHtcbiAgICB2YXIgY29tcG9uZW50UmVzb2x2ZXI6IENvbXBvbmVudFJlc29sdmVyID0gaW5qZWN0b3IuZ2V0KENvbXBvbmVudFJlc29sdmVyKTtcbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXJcbiAgICAgICAgLmFsbChbY29tcG9uZW50UmVzb2x2ZXIucmVzb2x2ZUNvbXBvbmVudChjb21wb25lbnRUeXBlKSwgYXBwUmVmLndhaXRGb3JBc3luY0luaXRpYWxpemVycygpXSlcbiAgICAgICAgLnRoZW4oKGFycikgPT4gYXBwUmVmLmJvb3RzdHJhcChhcnJbMF0pKTtcbiAgfSk7XG59XG5cbi8qKlxuICogVGhlIEFuZ3VsYXIgcGxhdGZvcm0gaXMgdGhlIGVudHJ5IHBvaW50IGZvciBBbmd1bGFyIG9uIGEgd2ViIHBhZ2UuIEVhY2ggcGFnZVxuICogaGFzIGV4YWN0bHkgb25lIHBsYXRmb3JtLCBhbmQgc2VydmljZXMgKHN1Y2ggYXMgcmVmbGVjdGlvbikgd2hpY2ggYXJlIGNvbW1vblxuICogdG8gZXZlcnkgQW5ndWxhciBhcHBsaWNhdGlvbiBydW5uaW5nIG9uIHRoZSBwYWdlIGFyZSBib3VuZCBpbiBpdHMgc2NvcGUuXG4gKlxuICogQSBwYWdlJ3MgcGxhdGZvcm0gaXMgaW5pdGlhbGl6ZWQgaW1wbGljaXRseSB3aGVuIHtAbGluayBib290c3RyYXB9KCkgaXMgY2FsbGVkLCBvclxuICogZXhwbGljaXRseSBieSBjYWxsaW5nIHtAbGluayBjcmVhdGVQbGF0Zm9ybX0oKS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFBsYXRmb3JtUmVmIHtcbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgbGlzdGVuZXIgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHBsYXRmb3JtIGlzIGRpc3Bvc2VkLlxuICAgKi9cbiAgYWJzdHJhY3QgcmVnaXN0ZXJEaXNwb3NlTGlzdGVuZXIoZGlzcG9zZTogKCkgPT4gdm9pZCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHRoZSBwbGF0Zm9ybSB7QGxpbmsgSW5qZWN0b3J9LCB3aGljaCBpcyB0aGUgcGFyZW50IGluamVjdG9yIGZvclxuICAgKiBldmVyeSBBbmd1bGFyIGFwcGxpY2F0aW9uIG9uIHRoZSBwYWdlIGFuZCBwcm92aWRlcyBzaW5nbGV0b24gcHJvdmlkZXJzLlxuICAgKi9cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHsgdGhyb3cgdW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBEZXN0cm95IHRoZSBBbmd1bGFyIHBsYXRmb3JtIGFuZCBhbGwgQW5ndWxhciBhcHBsaWNhdGlvbnMgb24gdGhlIHBhZ2UuXG4gICAqL1xuICBhYnN0cmFjdCBkaXNwb3NlKCk6IHZvaWQ7XG5cbiAgZ2V0IGRpc3Bvc2VkKCk6IGJvb2xlYW4geyB0aHJvdyB1bmltcGxlbWVudGVkKCk7IH1cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFBsYXRmb3JtUmVmXyBleHRlbmRzIFBsYXRmb3JtUmVmIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYXBwbGljYXRpb25zOiBBcHBsaWNhdGlvblJlZltdID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Rpc3Bvc2VMaXN0ZW5lcnM6IEZ1bmN0aW9uW10gPSBbXTtcblxuICBwcml2YXRlIF9kaXNwb3NlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2luamVjdG9yOiBJbmplY3Rvcikge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKCFfaW5QbGF0Zm9ybUNyZWF0ZSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ1BsYXRmb3JtcyBoYXZlIHRvIGJlIGNyZWF0ZWQgdmlhIGBjcmVhdGVQbGF0Zm9ybWAhJyk7XG4gICAgfVxuICAgIGxldCBpbml0czogRnVuY3Rpb25bXSA9IDxGdW5jdGlvbltdPl9pbmplY3Rvci5nZXQoUExBVEZPUk1fSU5JVElBTElaRVIsIG51bGwpO1xuICAgIGlmIChpc1ByZXNlbnQoaW5pdHMpKSBpbml0cy5mb3JFYWNoKGluaXQgPT4gaW5pdCgpKTtcbiAgfVxuXG4gIHJlZ2lzdGVyRGlzcG9zZUxpc3RlbmVyKGRpc3Bvc2U6ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fZGlzcG9zZUxpc3RlbmVycy5wdXNoKGRpc3Bvc2UpOyB9XG5cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIHRoaXMuX2luamVjdG9yOyB9XG5cbiAgZ2V0IGRpc3Bvc2VkKCkgeyByZXR1cm4gdGhpcy5fZGlzcG9zZWQ7IH1cblxuICBhZGRBcHBsaWNhdGlvbihhcHBSZWY6IEFwcGxpY2F0aW9uUmVmKSB7IHRoaXMuX2FwcGxpY2F0aW9ucy5wdXNoKGFwcFJlZik7IH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIExpc3RXcmFwcGVyLmNsb25lKHRoaXMuX2FwcGxpY2F0aW9ucykuZm9yRWFjaCgoYXBwKSA9PiBhcHAuZGlzcG9zZSgpKTtcbiAgICB0aGlzLl9kaXNwb3NlTGlzdGVuZXJzLmZvckVhY2goKGRpc3Bvc2UpID0+IGRpc3Bvc2UoKSk7XG4gICAgdGhpcy5fZGlzcG9zZWQgPSB0cnVlO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYXBwbGljYXRpb25EaXNwb3NlZChhcHA6IEFwcGxpY2F0aW9uUmVmKTogdm9pZCB7IExpc3RXcmFwcGVyLnJlbW92ZSh0aGlzLl9hcHBsaWNhdGlvbnMsIGFwcCk7IH1cbn1cblxuLyoqXG4gKiBBIHJlZmVyZW5jZSB0byBhbiBBbmd1bGFyIGFwcGxpY2F0aW9uIHJ1bm5pbmcgb24gYSBwYWdlLlxuICpcbiAqIEZvciBtb3JlIGFib3V0IEFuZ3VsYXIgYXBwbGljYXRpb25zLCBzZWUgdGhlIGRvY3VtZW50YXRpb24gZm9yIHtAbGluayBib290c3RyYXB9LlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQXBwbGljYXRpb25SZWYge1xuICAvKipcbiAgICogUmVnaXN0ZXIgYSBsaXN0ZW5lciB0byBiZSBjYWxsZWQgZWFjaCB0aW1lIGBib290c3RyYXAoKWAgaXMgY2FsbGVkIHRvIGJvb3RzdHJhcFxuICAgKiBhIG5ldyByb290IGNvbXBvbmVudC5cbiAgICovXG4gIGFic3RyYWN0IHJlZ2lzdGVyQm9vdHN0cmFwTGlzdGVuZXIobGlzdGVuZXI6IChyZWY6IENvbXBvbmVudFJlZikgPT4gdm9pZCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgbGlzdGVuZXIgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGFwcGxpY2F0aW9uIGlzIGRpc3Bvc2VkLlxuICAgKi9cbiAgYWJzdHJhY3QgcmVnaXN0ZXJEaXNwb3NlTGlzdGVuZXIoZGlzcG9zZTogKCkgPT4gdm9pZCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBhbGwgYXN5bmNocm9ub3VzIGFwcGxpY2F0aW9uIGluaXRpYWxpemVyc1xuICAgKiBhcmUgZG9uZS5cbiAgICovXG4gIGFic3RyYWN0IHdhaXRGb3JBc3luY0luaXRpYWxpemVycygpOiBQcm9taXNlPGFueT47XG5cbiAgLyoqXG4gICAqIFJ1bnMgdGhlIGdpdmVuIGNhbGxiYWNrIGluIHRoZSB6b25lIGFuZCByZXR1cm5zIHRoZSByZXN1bHQgb2YgdGhlIGNhbGxiYWNrLlxuICAgKiBFeGNlcHRpb25zIHdpbGwgYmUgZm9yd2FyZGVkIHRvIHRoZSBFeGNlcHRpb25IYW5kbGVyIGFuZCByZXRocm93bi5cbiAgICovXG4gIGFic3RyYWN0IHJ1bihjYWxsYmFjazogRnVuY3Rpb24pOiBhbnk7XG5cbiAgLyoqXG4gICAqIEJvb3RzdHJhcCBhIG5ldyBjb21wb25lbnQgYXQgdGhlIHJvb3QgbGV2ZWwgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICAgKlxuICAgKiAjIyMgQm9vdHN0cmFwIHByb2Nlc3NcbiAgICpcbiAgICogV2hlbiBib290c3RyYXBwaW5nIGEgbmV3IHJvb3QgY29tcG9uZW50IGludG8gYW4gYXBwbGljYXRpb24sIEFuZ3VsYXIgbW91bnRzIHRoZVxuICAgKiBzcGVjaWZpZWQgYXBwbGljYXRpb24gY29tcG9uZW50IG9udG8gRE9NIGVsZW1lbnRzIGlkZW50aWZpZWQgYnkgdGhlIFtjb21wb25lbnRUeXBlXSdzXG4gICAqIHNlbGVjdG9yIGFuZCBraWNrcyBvZmYgYXV0b21hdGljIGNoYW5nZSBkZXRlY3Rpb24gdG8gZmluaXNoIGluaXRpYWxpemluZyB0aGUgY29tcG9uZW50LlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKiB7QGV4YW1wbGUgY29yZS90cy9wbGF0Zm9ybS9wbGF0Zm9ybS50cyByZWdpb249J2xvbmdmb3JtJ31cbiAgICovXG4gIGFic3RyYWN0IGJvb3RzdHJhcChjb21wb25lbnRGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5KTogQ29tcG9uZW50UmVmO1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB0aGUgYXBwbGljYXRpb24ge0BsaW5rIEluamVjdG9yfS5cbiAgICovXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiA8SW5qZWN0b3I+dW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB0aGUgYXBwbGljYXRpb24ge0BsaW5rIE5nWm9uZX0uXG4gICAqL1xuICBnZXQgem9uZSgpOiBOZ1pvbmUgeyByZXR1cm4gPE5nWm9uZT51bmltcGxlbWVudGVkKCk7IH07XG5cbiAgLyoqXG4gICAqIERpc3Bvc2Ugb2YgdGhpcyBhcHBsaWNhdGlvbiBhbmQgYWxsIG9mIGl0cyBjb21wb25lbnRzLlxuICAgKi9cbiAgYWJzdHJhY3QgZGlzcG9zZSgpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBJbnZva2UgdGhpcyBtZXRob2QgdG8gZXhwbGljaXRseSBwcm9jZXNzIGNoYW5nZSBkZXRlY3Rpb24gYW5kIGl0cyBzaWRlLWVmZmVjdHMuXG4gICAqXG4gICAqIEluIGRldmVsb3BtZW50IG1vZGUsIGB0aWNrKClgIGFsc28gcGVyZm9ybXMgYSBzZWNvbmQgY2hhbmdlIGRldGVjdGlvbiBjeWNsZSB0byBlbnN1cmUgdGhhdCBub1xuICAgKiBmdXJ0aGVyIGNoYW5nZXMgYXJlIGRldGVjdGVkLiBJZiBhZGRpdGlvbmFsIGNoYW5nZXMgYXJlIHBpY2tlZCB1cCBkdXJpbmcgdGhpcyBzZWNvbmQgY3ljbGUsXG4gICAqIGJpbmRpbmdzIGluIHRoZSBhcHAgaGF2ZSBzaWRlLWVmZmVjdHMgdGhhdCBjYW5ub3QgYmUgcmVzb2x2ZWQgaW4gYSBzaW5nbGUgY2hhbmdlIGRldGVjdGlvblxuICAgKiBwYXNzLlxuICAgKiBJbiB0aGlzIGNhc2UsIEFuZ3VsYXIgdGhyb3dzIGFuIGVycm9yLCBzaW5jZSBhbiBBbmd1bGFyIGFwcGxpY2F0aW9uIGNhbiBvbmx5IGhhdmUgb25lIGNoYW5nZVxuICAgKiBkZXRlY3Rpb24gcGFzcyBkdXJpbmcgd2hpY2ggYWxsIGNoYW5nZSBkZXRlY3Rpb24gbXVzdCBjb21wbGV0ZS5cbiAgICovXG4gIGFic3RyYWN0IHRpY2soKTogdm9pZDtcblxuICAvKipcbiAgICogR2V0IGEgbGlzdCBvZiBjb21wb25lbnQgdHlwZXMgcmVnaXN0ZXJlZCB0byB0aGlzIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgZ2V0IGNvbXBvbmVudFR5cGVzKCk6IFR5cGVbXSB7IHJldHVybiA8VHlwZVtdPnVuaW1wbGVtZW50ZWQoKTsgfTtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFwcGxpY2F0aW9uUmVmXyBleHRlbmRzIEFwcGxpY2F0aW9uUmVmIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBzdGF0aWMgX3RpY2tTY29wZTogV3RmU2NvcGVGbiA9IHd0ZkNyZWF0ZVNjb3BlKCdBcHBsaWNhdGlvblJlZiN0aWNrKCknKTtcblxuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX2Jvb3RzdHJhcExpc3RlbmVyczogRnVuY3Rpb25bXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX2Rpc3Bvc2VMaXN0ZW5lcnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9yb290Q29tcG9uZW50czogQ29tcG9uZW50UmVmW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9yb290Q29tcG9uZW50VHlwZXM6IFR5cGVbXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmczogQ2hhbmdlRGV0ZWN0b3JSZWZbXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX3J1bm5pbmdUaWNrOiBib29sZWFuID0gZmFsc2U7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfZW5mb3JjZU5vTmV3Q2hhbmdlczogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHByaXZhdGUgX2V4Y2VwdGlvbkhhbmRsZXI6IEV4Y2VwdGlvbkhhbmRsZXI7XG5cbiAgcHJpdmF0ZSBfYXN5bmNJbml0RG9uZVByb21pc2U6IFByb21pc2U8YW55PjtcbiAgcHJpdmF0ZSBfYXN5bmNJbml0RG9uZTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9wbGF0Zm9ybTogUGxhdGZvcm1SZWZfLCBwcml2YXRlIF96b25lOiBOZ1pvbmUsIHByaXZhdGUgX2luamVjdG9yOiBJbmplY3Rvcikge1xuICAgIHN1cGVyKCk7XG4gICAgdmFyIHpvbmU6IE5nWm9uZSA9IF9pbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICB0aGlzLl9lbmZvcmNlTm9OZXdDaGFuZ2VzID0gYXNzZXJ0aW9uc0VuYWJsZWQoKTtcbiAgICB6b25lLnJ1bigoKSA9PiB7IHRoaXMuX2V4Y2VwdGlvbkhhbmRsZXIgPSBfaW5qZWN0b3IuZ2V0KEV4Y2VwdGlvbkhhbmRsZXIpOyB9KTtcbiAgICB0aGlzLl9hc3luY0luaXREb25lUHJvbWlzZSA9IHRoaXMucnVuKCgpID0+IHtcbiAgICAgIGxldCBpbml0czogRnVuY3Rpb25bXSA9IF9pbmplY3Rvci5nZXQoQVBQX0lOSVRJQUxJWkVSLCBudWxsKTtcbiAgICAgIHZhciBhc3luY0luaXRSZXN1bHRzID0gW107XG4gICAgICB2YXIgYXN5bmNJbml0RG9uZVByb21pc2U7XG4gICAgICBpZiAoaXNQcmVzZW50KGluaXRzKSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluaXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIGluaXRSZXN1bHQgPSBpbml0c1tpXSgpO1xuICAgICAgICAgIGlmIChpc1Byb21pc2UoaW5pdFJlc3VsdCkpIHtcbiAgICAgICAgICAgIGFzeW5jSW5pdFJlc3VsdHMucHVzaChpbml0UmVzdWx0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChhc3luY0luaXRSZXN1bHRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgYXN5bmNJbml0RG9uZVByb21pc2UgPVxuICAgICAgICAgICAgUHJvbWlzZVdyYXBwZXIuYWxsKGFzeW5jSW5pdFJlc3VsdHMpLnRoZW4oKF8pID0+IHRoaXMuX2FzeW5jSW5pdERvbmUgPSB0cnVlKTtcbiAgICAgICAgdGhpcy5fYXN5bmNJbml0RG9uZSA9IGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fYXN5bmNJbml0RG9uZSA9IHRydWU7XG4gICAgICAgIGFzeW5jSW5pdERvbmVQcm9taXNlID0gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZSh0cnVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhc3luY0luaXREb25lUHJvbWlzZTtcbiAgICB9KTtcbiAgICBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUoem9uZS5vbkVycm9yLCAoZXJyb3I6IE5nWm9uZUVycm9yKSA9PiB7XG4gICAgICB0aGlzLl9leGNlcHRpb25IYW5kbGVyLmNhbGwoZXJyb3IuZXJyb3IsIGVycm9yLnN0YWNrVHJhY2UpO1xuICAgIH0pO1xuICAgIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZSh0aGlzLl96b25lLm9uTWljcm90YXNrRW1wdHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChfKSA9PiB7IHRoaXMuX3pvbmUucnVuKCgpID0+IHsgdGhpcy50aWNrKCk7IH0pOyB9KTtcbiAgfVxuXG4gIHJlZ2lzdGVyQm9vdHN0cmFwTGlzdGVuZXIobGlzdGVuZXI6IChyZWY6IENvbXBvbmVudFJlZikgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX2Jvb3RzdHJhcExpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJlZ2lzdGVyRGlzcG9zZUxpc3RlbmVyKGRpc3Bvc2U6ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fZGlzcG9zZUxpc3RlbmVycy5wdXNoKGRpc3Bvc2UpOyB9XG5cbiAgcmVnaXN0ZXJDaGFuZ2VEZXRlY3RvcihjaGFuZ2VEZXRlY3RvcjogQ2hhbmdlRGV0ZWN0b3JSZWYpOiB2b2lkIHtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZnMucHVzaChjaGFuZ2VEZXRlY3Rvcik7XG4gIH1cblxuICB1bnJlZ2lzdGVyQ2hhbmdlRGV0ZWN0b3IoY2hhbmdlRGV0ZWN0b3I6IENoYW5nZURldGVjdG9yUmVmKTogdm9pZCB7XG4gICAgTGlzdFdyYXBwZXIucmVtb3ZlKHRoaXMuX2NoYW5nZURldGVjdG9yUmVmcywgY2hhbmdlRGV0ZWN0b3IpO1xuICB9XG5cbiAgd2FpdEZvckFzeW5jSW5pdGlhbGl6ZXJzKCk6IFByb21pc2U8YW55PiB7IHJldHVybiB0aGlzLl9hc3luY0luaXREb25lUHJvbWlzZTsgfVxuXG4gIHJ1bihjYWxsYmFjazogRnVuY3Rpb24pOiBhbnkge1xuICAgIHZhciB6b25lID0gdGhpcy5pbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICB2YXIgcmVzdWx0O1xuICAgIC8vIE5vdGU6IERvbid0IHVzZSB6b25lLnJ1bkd1YXJkZWQgYXMgd2Ugd2FudCB0byBrbm93IGFib3V0XG4gICAgLy8gdGhlIHRocm93biBleGNlcHRpb24hXG4gICAgLy8gTm90ZTogdGhlIGNvbXBsZXRlciBuZWVkcyB0byBiZSBjcmVhdGVkIG91dHNpZGVcbiAgICAvLyBvZiBgem9uZS5ydW5gIGFzIERhcnQgc3dhbGxvd3MgcmVqZWN0ZWQgcHJvbWlzZXNcbiAgICAvLyB2aWEgdGhlIG9uRXJyb3IgY2FsbGJhY2sgb2YgdGhlIHByb21pc2UuXG4gICAgdmFyIGNvbXBsZXRlciA9IFByb21pc2VXcmFwcGVyLmNvbXBsZXRlcigpO1xuICAgIHpvbmUucnVuKCgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlc3VsdCA9IGNhbGxiYWNrKCk7XG4gICAgICAgIGlmIChpc1Byb21pc2UocmVzdWx0KSkge1xuICAgICAgICAgIFByb21pc2VXcmFwcGVyLnRoZW4ocmVzdWx0LCAocmVmKSA9PiB7IGNvbXBsZXRlci5yZXNvbHZlKHJlZik7IH0sIChlcnIsIHN0YWNrVHJhY2UpID0+IHtcbiAgICAgICAgICAgIGNvbXBsZXRlci5yZWplY3QoZXJyLCBzdGFja1RyYWNlKTtcbiAgICAgICAgICAgIHRoaXMuX2V4Y2VwdGlvbkhhbmRsZXIuY2FsbChlcnIsIHN0YWNrVHJhY2UpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuX2V4Y2VwdGlvbkhhbmRsZXIuY2FsbChlLCBlLnN0YWNrKTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gaXNQcm9taXNlKHJlc3VsdCkgPyBjb21wbGV0ZXIucHJvbWlzZSA6IHJlc3VsdDtcbiAgfVxuXG4gIGJvb3RzdHJhcChjb21wb25lbnRGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5KTogQ29tcG9uZW50UmVmIHtcbiAgICBpZiAoIXRoaXMuX2FzeW5jSW5pdERvbmUpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICdDYW5ub3QgYm9vdHN0cmFwIGFzIHRoZXJlIGFyZSBzdGlsbCBhc3luY2hyb25vdXMgaW5pdGlhbGl6ZXJzIHJ1bm5pbmcuIFdhaXQgZm9yIHRoZW0gdXNpbmcgd2FpdEZvckFzeW5jSW5pdGlhbGl6ZXJzKCkuJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJ1bigoKSA9PiB7XG4gICAgICB0aGlzLl9yb290Q29tcG9uZW50VHlwZXMucHVzaChjb21wb25lbnRGYWN0b3J5LmNvbXBvbmVudFR5cGUpO1xuICAgICAgdmFyIGNvbXBSZWYgPSBjb21wb25lbnRGYWN0b3J5LmNyZWF0ZSh0aGlzLl9pbmplY3RvciwgW10sIGNvbXBvbmVudEZhY3Rvcnkuc2VsZWN0b3IpO1xuICAgICAgY29tcFJlZi5vbkRlc3Ryb3koKCkgPT4geyB0aGlzLl91bmxvYWRDb21wb25lbnQoY29tcFJlZik7IH0pO1xuICAgICAgdmFyIHRlc3RhYmlsaXR5ID0gY29tcFJlZi5pbmplY3Rvci5nZXQoVGVzdGFiaWxpdHksIG51bGwpO1xuICAgICAgaWYgKGlzUHJlc2VudCh0ZXN0YWJpbGl0eSkpIHtcbiAgICAgICAgY29tcFJlZi5pbmplY3Rvci5nZXQoVGVzdGFiaWxpdHlSZWdpc3RyeSlcbiAgICAgICAgICAgIC5yZWdpc3RlckFwcGxpY2F0aW9uKGNvbXBSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudCwgdGVzdGFiaWxpdHkpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9sb2FkQ29tcG9uZW50KGNvbXBSZWYpO1xuICAgICAgbGV0IGMgPSA8Q29uc29sZT50aGlzLl9pbmplY3Rvci5nZXQoQ29uc29sZSk7XG4gICAgICBpZiAoYXNzZXJ0aW9uc0VuYWJsZWQoKSkge1xuICAgICAgICBjLmxvZyhcbiAgICAgICAgICAgIFwiQW5ndWxhciAyIGlzIHJ1bm5pbmcgaW4gdGhlIGRldmVsb3BtZW50IG1vZGUuIENhbGwgZW5hYmxlUHJvZE1vZGUoKSB0byBlbmFibGUgdGhlIHByb2R1Y3Rpb24gbW9kZS5cIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29tcFJlZjtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2xvYWRDb21wb25lbnQoY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWYpOiB2b2lkIHtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZnMucHVzaChjb21wb25lbnRSZWYuY2hhbmdlRGV0ZWN0b3JSZWYpO1xuICAgIHRoaXMudGljaygpO1xuICAgIHRoaXMuX3Jvb3RDb21wb25lbnRzLnB1c2goY29tcG9uZW50UmVmKTtcbiAgICB0aGlzLl9ib290c3RyYXBMaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IGxpc3RlbmVyKGNvbXBvbmVudFJlZikpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdW5sb2FkQ29tcG9uZW50KGNvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmKTogdm9pZCB7XG4gICAgaWYgKCFMaXN0V3JhcHBlci5jb250YWlucyh0aGlzLl9yb290Q29tcG9uZW50cywgY29tcG9uZW50UmVmKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnVucmVnaXN0ZXJDaGFuZ2VEZXRlY3Rvcihjb21wb25lbnRSZWYuY2hhbmdlRGV0ZWN0b3JSZWYpO1xuICAgIExpc3RXcmFwcGVyLnJlbW92ZSh0aGlzLl9yb290Q29tcG9uZW50cywgY29tcG9uZW50UmVmKTtcbiAgfVxuXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLl9pbmplY3RvcjsgfVxuXG4gIGdldCB6b25lKCk6IE5nWm9uZSB7IHJldHVybiB0aGlzLl96b25lOyB9XG5cbiAgdGljaygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcnVubmluZ1RpY2spIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFwiQXBwbGljYXRpb25SZWYudGljayBpcyBjYWxsZWQgcmVjdXJzaXZlbHlcIik7XG4gICAgfVxuXG4gICAgdmFyIHMgPSBBcHBsaWNhdGlvblJlZl8uX3RpY2tTY29wZSgpO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLl9ydW5uaW5nVGljayA9IHRydWU7XG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZnMuZm9yRWFjaCgoZGV0ZWN0b3IpID0+IGRldGVjdG9yLmRldGVjdENoYW5nZXMoKSk7XG4gICAgICBpZiAodGhpcy5fZW5mb3JjZU5vTmV3Q2hhbmdlcykge1xuICAgICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZnMuZm9yRWFjaCgoZGV0ZWN0b3IpID0+IGRldGVjdG9yLmNoZWNrTm9DaGFuZ2VzKCkpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLl9ydW5uaW5nVGljayA9IGZhbHNlO1xuICAgICAgd3RmTGVhdmUocyk7XG4gICAgfVxuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICAvLyBUT0RPKGFseGh1Yik6IERpc3Bvc2Ugb2YgdGhlIE5nWm9uZS5cbiAgICBMaXN0V3JhcHBlci5jbG9uZSh0aGlzLl9yb290Q29tcG9uZW50cykuZm9yRWFjaCgocmVmKSA9PiByZWYuZGVzdHJveSgpKTtcbiAgICB0aGlzLl9kaXNwb3NlTGlzdGVuZXJzLmZvckVhY2goKGRpc3Bvc2UpID0+IGRpc3Bvc2UoKSk7XG4gICAgdGhpcy5fcGxhdGZvcm0uX2FwcGxpY2F0aW9uRGlzcG9zZWQodGhpcyk7XG4gIH1cblxuICBnZXQgY29tcG9uZW50VHlwZXMoKTogVHlwZVtdIHsgcmV0dXJuIHRoaXMuX3Jvb3RDb21wb25lbnRUeXBlczsgfVxufVxuXG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5leHBvcnQgY29uc3QgUExBVEZPUk1fQ09SRV9QUk9WSURFUlMgPVxuICAgIENPTlNUX0VYUFIoW1BsYXRmb3JtUmVmXywgQ09OU1RfRVhQUihuZXcgUHJvdmlkZXIoUGxhdGZvcm1SZWYsIHt1c2VFeGlzdGluZzogUGxhdGZvcm1SZWZffSkpXSk7XG5cbi8qKlxuICogQGludGVybmFsXG4gKi9cbmV4cG9ydCBjb25zdCBBUFBMSUNBVElPTl9DT1JFX1BST1ZJREVSUyA9IENPTlNUX0VYUFIoW1xuICBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihOZ1pvbmUsIHt1c2VGYWN0b3J5OiBjcmVhdGVOZ1pvbmUsIGRlcHM6IENPTlNUX0VYUFIoW10pfSkpLFxuICBBcHBsaWNhdGlvblJlZl8sXG4gIENPTlNUX0VYUFIobmV3IFByb3ZpZGVyKEFwcGxpY2F0aW9uUmVmLCB7dXNlRXhpc3Rpbmc6IEFwcGxpY2F0aW9uUmVmX30pKVxuXSk7XG4iXX0=