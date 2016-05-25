'use strict';"use strict";
var core_1 = require('angular2/core');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var TestInjector = (function () {
    function TestInjector() {
        this._instantiated = false;
        this._injector = null;
        this._providers = [];
        this.platformProviders = [];
        this.applicationProviders = [];
    }
    TestInjector.prototype.reset = function () {
        this._injector = null;
        this._providers = [];
        this._instantiated = false;
    };
    TestInjector.prototype.addProviders = function (providers) {
        if (this._instantiated) {
            throw new exceptions_1.BaseException('Cannot add providers after test injector is instantiated');
        }
        this._providers = collection_1.ListWrapper.concat(this._providers, providers);
    };
    TestInjector.prototype.createInjector = function () {
        var rootInjector = core_1.Injector.resolveAndCreate(this.platformProviders);
        this._injector = rootInjector.resolveAndCreateChild(collection_1.ListWrapper.concat(this.applicationProviders, this._providers));
        this._instantiated = true;
        return this._injector;
    };
    TestInjector.prototype.execute = function (fn) {
        var additionalProviders = fn.additionalProviders();
        if (additionalProviders.length > 0) {
            this.addProviders(additionalProviders);
        }
        if (!this._instantiated) {
            this.createInjector();
        }
        return fn.execute(this._injector);
    };
    return TestInjector;
}());
exports.TestInjector = TestInjector;
var _testInjector = null;
function getTestInjector() {
    if (_testInjector == null) {
        _testInjector = new TestInjector();
    }
    return _testInjector;
}
exports.getTestInjector = getTestInjector;
/**
 * Set the providers that the test injector should use. These should be providers
 * common to every test in the suite.
 *
 * This may only be called once, to set up the common providers for the current test
 * suite on teh current platform. If you absolutely need to change the providers,
 * first use `resetBaseTestProviders`.
 *
 * Test Providers for individual platforms are available from
 * 'angular2/platform/testing/<platform_name>'.
 */
function setBaseTestProviders(platformProviders, applicationProviders) {
    var testInjector = getTestInjector();
    if (testInjector.platformProviders.length > 0 || testInjector.applicationProviders.length > 0) {
        throw new exceptions_1.BaseException('Cannot set base providers because it has already been called');
    }
    testInjector.platformProviders = platformProviders;
    testInjector.applicationProviders = applicationProviders;
    var injector = testInjector.createInjector();
    var inits = injector.getOptional(core_1.PLATFORM_INITIALIZER);
    if (lang_1.isPresent(inits)) {
        inits.forEach(function (init) { return init(); });
    }
    testInjector.reset();
}
exports.setBaseTestProviders = setBaseTestProviders;
/**
 * Reset the providers for the test injector.
 */
function resetBaseTestProviders() {
    var testInjector = getTestInjector();
    testInjector.platformProviders = [];
    testInjector.applicationProviders = [];
    testInjector.reset();
}
exports.resetBaseTestProviders = resetBaseTestProviders;
/**
 * Allows injecting dependencies in `beforeEach()` and `it()`.
 *
 * Example:
 *
 * ```
 * beforeEach(inject([Dependency, AClass], (dep, object) => {
 *   // some code that uses `dep` and `object`
 *   // ...
 * }));
 *
 * it('...', inject([AClass], (object) => {
 *   object.doSomething();
 *   expect(...);
 * })
 * ```
 *
 * Notes:
 * - inject is currently a function because of some Traceur limitation the syntax should
 * eventually
 *   becomes `it('...', @Inject (object: AClass, async: AsyncTestCompleter) => { ... });`
 *
 * @param {Array} tokens
 * @param {Function} fn
 * @return {FunctionWithParamTokens}
 */
function inject(tokens, fn) {
    return new FunctionWithParamTokens(tokens, fn, false);
}
exports.inject = inject;
var InjectSetupWrapper = (function () {
    function InjectSetupWrapper(_providers) {
        this._providers = _providers;
    }
    InjectSetupWrapper.prototype.inject = function (tokens, fn) {
        return new FunctionWithParamTokens(tokens, fn, false, this._providers);
    };
    /** @Deprecated {use async(withProviders().inject())} */
    InjectSetupWrapper.prototype.injectAsync = function (tokens, fn) {
        return new FunctionWithParamTokens(tokens, fn, true, this._providers);
    };
    return InjectSetupWrapper;
}());
exports.InjectSetupWrapper = InjectSetupWrapper;
function withProviders(providers) {
    return new InjectSetupWrapper(providers);
}
exports.withProviders = withProviders;
/**
 * @Deprecated {use async(inject())}
 *
 * Allows injecting dependencies in `beforeEach()` and `it()`. The test must return
 * a promise which will resolve when all asynchronous activity is complete.
 *
 * Example:
 *
 * ```
 * it('...', injectAsync([AClass], (object) => {
 *   return object.doSomething().then(() => {
 *     expect(...);
 *   });
 * })
 * ```
 *
 * @param {Array} tokens
 * @param {Function} fn
 * @return {FunctionWithParamTokens}
 */
function injectAsync(tokens, fn) {
    return new FunctionWithParamTokens(tokens, fn, true);
}
exports.injectAsync = injectAsync;
/**
 * Wraps a test function in an asynchronous test zone. The test will automatically
 * complete when all asynchronous calls within this zone are done. Can be used
 * to wrap an {@link inject} call.
 *
 * Example:
 *
 * ```
 * it('...', async(inject([AClass], (object) => {
 *   object.doSomething.then(() => {
 *     expect(...);
 *   })
 * });
 * ```
 */
function async(fn) {
    if (fn instanceof FunctionWithParamTokens) {
        fn.isAsync = true;
        return fn;
    }
    else if (fn instanceof Function) {
        return new FunctionWithParamTokens([], fn, true);
    }
    else {
        throw new exceptions_1.BaseException('argument to async must be a function or inject(<Function>)');
    }
}
exports.async = async;
function emptyArray() {
    return [];
}
var FunctionWithParamTokens = (function () {
    function FunctionWithParamTokens(_tokens, fn, isAsync, additionalProviders) {
        if (additionalProviders === void 0) { additionalProviders = emptyArray; }
        this._tokens = _tokens;
        this.fn = fn;
        this.isAsync = isAsync;
        this.additionalProviders = additionalProviders;
    }
    /**
     * Returns the value of the executed function.
     */
    FunctionWithParamTokens.prototype.execute = function (injector) {
        var params = this._tokens.map(function (t) { return injector.get(t); });
        return lang_1.FunctionWrapper.apply(this.fn, params);
    };
    FunctionWithParamTokens.prototype.hasToken = function (token) { return this._tokens.indexOf(token) > -1; };
    return FunctionWithParamTokens;
}());
exports.FunctionWithParamTokens = FunctionWithParamTokens;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9pbmplY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtNXBNa0R1aXQudG1wL2FuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RfaW5qZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHFCQUF1RCxlQUFlLENBQUMsQ0FBQTtBQUN2RSwyQkFBOEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUMvRSwyQkFBMEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUMzRCxxQkFBK0MsMEJBQTBCLENBQUMsQ0FBQTtBQUUxRTtJQUFBO1FBQ1Usa0JBQWEsR0FBWSxLQUFLLENBQUM7UUFFL0IsY0FBUyxHQUFhLElBQUksQ0FBQztRQUUzQixlQUFVLEdBQW1DLEVBQUUsQ0FBQztRQVF4RCxzQkFBaUIsR0FBbUMsRUFBRSxDQUFDO1FBRXZELHlCQUFvQixHQUFtQyxFQUFFLENBQUM7SUEyQjVELENBQUM7SUFuQ0MsNEJBQUssR0FBTDtRQUNFLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO0lBQzdCLENBQUM7SUFNRCxtQ0FBWSxHQUFaLFVBQWEsU0FBeUM7UUFDcEQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDdkIsTUFBTSxJQUFJLDBCQUFhLENBQUMsMERBQTBELENBQUMsQ0FBQztRQUN0RixDQUFDO1FBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyx3QkFBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFFRCxxQ0FBYyxHQUFkO1FBQ0UsSUFBSSxZQUFZLEdBQUcsZUFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFD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SVpFUn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIEV4Y2VwdGlvbkhhbmRsZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtGdW5jdGlvbldyYXBwZXIsIGlzUHJlc2VudCwgVHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuZXhwb3J0IGNsYXNzIFRlc3RJbmplY3RvciB7XG4gIHByaXZhdGUgX2luc3RhbnRpYXRlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHByaXZhdGUgX2luamVjdG9yOiBJbmplY3RvciA9IG51bGw7XG5cbiAgcHJpdmF0ZSBfcHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4gPSBbXTtcblxuICByZXNldCgpIHtcbiAgICB0aGlzLl9pbmplY3RvciA9IG51bGw7XG4gICAgdGhpcy5fcHJvdmlkZXJzID0gW107XG4gICAgdGhpcy5faW5zdGFudGlhdGVkID0gZmFsc2U7XG4gIH1cblxuICBwbGF0Zm9ybVByb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+ID0gW107XG5cbiAgYXBwbGljYXRpb25Qcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPiA9IFtdO1xuXG4gIGFkZFByb3ZpZGVycyhwcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPikge1xuICAgIGlmICh0aGlzLl9pbnN0YW50aWF0ZWQpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdDYW5ub3QgYWRkIHByb3ZpZGVycyBhZnRlciB0ZXN0IGluamVjdG9yIGlzIGluc3RhbnRpYXRlZCcpO1xuICAgIH1cbiAgICB0aGlzLl9wcm92aWRlcnMgPSBMaXN0V3JhcHBlci5jb25jYXQodGhpcy5fcHJvdmlkZXJzLCBwcm92aWRlcnMpO1xuICB9XG5cbiAgY3JlYXRlSW5qZWN0b3IoKSB7XG4gICAgdmFyIHJvb3RJbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUodGhpcy5wbGF0Zm9ybVByb3ZpZGVycyk7XG4gICAgdGhpcy5faW5qZWN0b3IgPSByb290SW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZUNoaWxkKFxuICAgICAgICBMaXN0V3JhcHBlci5jb25jYXQodGhpcy5hcHBsaWNhdGlvblByb3ZpZGVycywgdGhpcy5fcHJvdmlkZXJzKSk7XG4gICAgdGhpcy5faW5zdGFudGlhdGVkID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5faW5qZWN0b3I7XG4gIH1cblxuICBleGVjdXRlKGZuOiBGdW5jdGlvbldpdGhQYXJhbVRva2Vucyk6IGFueSB7XG4gICAgdmFyIGFkZGl0aW9uYWxQcm92aWRlcnMgPSBmbi5hZGRpdGlvbmFsUHJvdmlkZXJzKCk7XG4gICAgaWYgKGFkZGl0aW9uYWxQcm92aWRlcnMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5hZGRQcm92aWRlcnMoYWRkaXRpb25hbFByb3ZpZGVycyk7XG4gICAgfVxuICAgIGlmICghdGhpcy5faW5zdGFudGlhdGVkKSB7XG4gICAgICB0aGlzLmNyZWF0ZUluamVjdG9yKCk7XG4gICAgfVxuICAgIHJldHVybiBmbi5leGVjdXRlKHRoaXMuX2luamVjdG9yKTtcbiAgfVxufVxuXG52YXIgX3Rlc3RJbmplY3RvcjogVGVzdEluamVjdG9yID0gbnVsbDtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRlc3RJbmplY3RvcigpIHtcbiAgaWYgKF90ZXN0SW5qZWN0b3IgPT0gbnVsbCkge1xuICAgIF90ZXN0SW5qZWN0b3IgPSBuZXcgVGVzdEluamVjdG9yKCk7XG4gIH1cbiAgcmV0dXJuIF90ZXN0SW5qZWN0b3I7XG59XG5cbi8qKlxuICogU2V0IHRoZSBwcm92aWRlcnMgdGhhdCB0aGUgdGVzdCBpbmplY3RvciBzaG91bGQgdXNlLiBUaGVzZSBzaG91bGQgYmUgcHJvdmlkZXJzXG4gKiBjb21tb24gdG8gZXZlcnkgdGVzdCBpbiB0aGUgc3VpdGUuXG4gKlxuICogVGhpcyBtYXkgb25seSBiZSBjYWxsZWQgb25jZSwgdG8gc2V0IHVwIHRoZSBjb21tb24gcHJvdmlkZXJzIGZvciB0aGUgY3VycmVudCB0ZXN0XG4gKiBzdWl0ZSBvbiB0ZWggY3VycmVudCBwbGF0Zm9ybS4gSWYgeW91IGFic29sdXRlbHkgbmVlZCB0byBjaGFuZ2UgdGhlIHByb3ZpZGVycyxcbiAqIGZpcnN0IHVzZSBgcmVzZXRCYXNlVGVzdFByb3ZpZGVyc2AuXG4gKlxuICogVGVzdCBQcm92aWRlcnMgZm9yIGluZGl2aWR1YWwgcGxhdGZvcm1zIGFyZSBhdmFpbGFibGUgZnJvbVxuICogJ2FuZ3VsYXIyL3BsYXRmb3JtL3Rlc3RpbmcvPHBsYXRmb3JtX25hbWU+Jy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEJhc2VUZXN0UHJvdmlkZXJzKHBsYXRmb3JtUHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb25Qcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPikge1xuICB2YXIgdGVzdEluamVjdG9yID0gZ2V0VGVzdEluamVjdG9yKCk7XG4gIGlmICh0ZXN0SW5qZWN0b3IucGxhdGZvcm1Qcm92aWRlcnMubGVuZ3RoID4gMCB8fCB0ZXN0SW5qZWN0b3IuYXBwbGljYXRpb25Qcm92aWRlcnMubGVuZ3RoID4gMCkge1xuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdDYW5ub3Qgc2V0IGJhc2UgcHJvdmlkZXJzIGJlY2F1c2UgaXQgaGFzIGFscmVhZHkgYmVlbiBjYWxsZWQnKTtcbiAgfVxuICB0ZXN0SW5qZWN0b3IucGxhdGZvcm1Qcm92aWRlcnMgPSBwbGF0Zm9ybVByb3ZpZGVycztcbiAgdGVzdEluamVjdG9yLmFwcGxpY2F0aW9uUHJvdmlkZXJzID0gYXBwbGljYXRpb25Qcm92aWRlcnM7XG4gIHZhciBpbmplY3RvciA9IHRlc3RJbmplY3Rvci5jcmVhdGVJbmplY3RvcigpO1xuICBsZXQgaW5pdHM6IEZ1bmN0aW9uW10gPSBpbmplY3Rvci5nZXRPcHRpb25hbChQTEFURk9STV9JTklUSUFMSVpFUik7XG4gIGlmIChpc1ByZXNlbnQoaW5pdHMpKSB7XG4gICAgaW5pdHMuZm9yRWFjaChpbml0ID0+IGluaXQoKSk7XG4gIH1cbiAgdGVzdEluamVjdG9yLnJlc2V0KCk7XG59XG5cbi8qKlxuICogUmVzZXQgdGhlIHByb3ZpZGVycyBmb3IgdGhlIHRlc3QgaW5qZWN0b3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldEJhc2VUZXN0UHJvdmlkZXJzKCkge1xuICB2YXIgdGVzdEluamVjdG9yID0gZ2V0VGVzdEluamVjdG9yKCk7XG4gIHRlc3RJbmplY3Rvci5wbGF0Zm9ybVByb3ZpZGVycyA9IFtdO1xuICB0ZXN0SW5qZWN0b3IuYXBwbGljYXRpb25Qcm92aWRlcnMgPSBbXTtcbiAgdGVzdEluamVjdG9yLnJlc2V0KCk7XG59XG5cbi8qKlxuICogQWxsb3dzIGluamVjdGluZyBkZXBlbmRlbmNpZXMgaW4gYGJlZm9yZUVhY2goKWAgYW5kIGBpdCgpYC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYFxuICogYmVmb3JlRWFjaChpbmplY3QoW0RlcGVuZGVuY3ksIEFDbGFzc10sIChkZXAsIG9iamVjdCkgPT4ge1xuICogICAvLyBzb21lIGNvZGUgdGhhdCB1c2VzIGBkZXBgIGFuZCBgb2JqZWN0YFxuICogICAvLyAuLi5cbiAqIH0pKTtcbiAqXG4gKiBpdCgnLi4uJywgaW5qZWN0KFtBQ2xhc3NdLCAob2JqZWN0KSA9PiB7XG4gKiAgIG9iamVjdC5kb1NvbWV0aGluZygpO1xuICogICBleHBlY3QoLi4uKTtcbiAqIH0pXG4gKiBgYGBcbiAqXG4gKiBOb3RlczpcbiAqIC0gaW5qZWN0IGlzIGN1cnJlbnRseSBhIGZ1bmN0aW9uIGJlY2F1c2Ugb2Ygc29tZSBUcmFjZXVyIGxpbWl0YXRpb24gdGhlIHN5bnRheCBzaG91bGRcbiAqIGV2ZW50dWFsbHlcbiAqICAgYmVjb21lcyBgaXQoJy4uLicsIEBJbmplY3QgKG9iamVjdDogQUNsYXNzLCBhc3luYzogQXN5bmNUZXN0Q29tcGxldGVyKSA9PiB7IC4uLiB9KTtgXG4gKlxuICogQHBhcmFtIHtBcnJheX0gdG9rZW5zXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnN9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmplY3QodG9rZW5zOiBhbnlbXSwgZm46IEZ1bmN0aW9uKTogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMge1xuICByZXR1cm4gbmV3IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zKHRva2VucywgZm4sIGZhbHNlKTtcbn1cblxuZXhwb3J0IGNsYXNzIEluamVjdFNldHVwV3JhcHBlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3Byb3ZpZGVyczogKCkgPT4gYW55KSB7fVxuXG4gIGluamVjdCh0b2tlbnM6IGFueVtdLCBmbjogRnVuY3Rpb24pOiBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB7XG4gICAgcmV0dXJuIG5ldyBGdW5jdGlvbldpdGhQYXJhbVRva2Vucyh0b2tlbnMsIGZuLCBmYWxzZSwgdGhpcy5fcHJvdmlkZXJzKTtcbiAgfVxuXG4gIC8qKiBARGVwcmVjYXRlZCB7dXNlIGFzeW5jKHdpdGhQcm92aWRlcnMoKS5pbmplY3QoKSl9ICovXG4gIGluamVjdEFzeW5jKHRva2VuczogYW55W10sIGZuOiBGdW5jdGlvbik6IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHtcbiAgICByZXR1cm4gbmV3IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zKHRva2VucywgZm4sIHRydWUsIHRoaXMuX3Byb3ZpZGVycyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhQcm92aWRlcnMocHJvdmlkZXJzOiAoKSA9PiBhbnkpIHtcbiAgcmV0dXJuIG5ldyBJbmplY3RTZXR1cFdyYXBwZXIocHJvdmlkZXJzKTtcbn1cblxuLyoqXG4gKiBARGVwcmVjYXRlZCB7dXNlIGFzeW5jKGluamVjdCgpKX1cbiAqXG4gKiBBbGxvd3MgaW5qZWN0aW5nIGRlcGVuZGVuY2llcyBpbiBgYmVmb3JlRWFjaCgpYCBhbmQgYGl0KClgLiBUaGUgdGVzdCBtdXN0IHJldHVyblxuICogYSBwcm9taXNlIHdoaWNoIHdpbGwgcmVzb2x2ZSB3aGVuIGFsbCBhc3luY2hyb25vdXMgYWN0aXZpdHkgaXMgY29tcGxldGUuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBcbiAqIGl0KCcuLi4nLCBpbmplY3RBc3luYyhbQUNsYXNzXSwgKG9iamVjdCkgPT4ge1xuICogICByZXR1cm4gb2JqZWN0LmRvU29tZXRoaW5nKCkudGhlbigoKSA9PiB7XG4gKiAgICAgZXhwZWN0KC4uLik7XG4gKiAgIH0pO1xuICogfSlcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHRva2Vuc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0Z1bmN0aW9uV2l0aFBhcmFtVG9rZW5zfVxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0QXN5bmModG9rZW5zOiBhbnlbXSwgZm46IEZ1bmN0aW9uKTogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMge1xuICByZXR1cm4gbmV3IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zKHRva2VucywgZm4sIHRydWUpO1xufVxuXG4vKipcbiAqIFdyYXBzIGEgdGVzdCBmdW5jdGlvbiBpbiBhbiBhc3luY2hyb25vdXMgdGVzdCB6b25lLiBUaGUgdGVzdCB3aWxsIGF1dG9tYXRpY2FsbHlcbiAqIGNvbXBsZXRlIHdoZW4gYWxsIGFzeW5jaHJvbm91cyBjYWxscyB3aXRoaW4gdGhpcyB6b25lIGFyZSBkb25lLiBDYW4gYmUgdXNlZFxuICogdG8gd3JhcCBhbiB7QGxpbmsgaW5qZWN0fSBjYWxsLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBgXG4gKiBpdCgnLi4uJywgYXN5bmMoaW5qZWN0KFtBQ2xhc3NdLCAob2JqZWN0KSA9PiB7XG4gKiAgIG9iamVjdC5kb1NvbWV0aGluZy50aGVuKCgpID0+IHtcbiAqICAgICBleHBlY3QoLi4uKTtcbiAqICAgfSlcbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3luYyhmbjogRnVuY3Rpb24gfCBGdW5jdGlvbldpdGhQYXJhbVRva2Vucyk6IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHtcbiAgaWYgKGZuIGluc3RhbmNlb2YgRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMpIHtcbiAgICBmbi5pc0FzeW5jID0gdHJ1ZTtcbiAgICByZXR1cm4gZm47XG4gIH0gZWxzZSBpZiAoZm4gaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgIHJldHVybiBuZXcgRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMoW10sIGZuLCB0cnVlKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignYXJndW1lbnQgdG8gYXN5bmMgbXVzdCBiZSBhIGZ1bmN0aW9uIG9yIGluamVjdCg8RnVuY3Rpb24+KScpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVtcHR5QXJyYXkoKTogQXJyYXk8YW55PiB7XG4gIHJldHVybiBbXTtcbn1cblxuZXhwb3J0IGNsYXNzIEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdG9rZW5zOiBhbnlbXSwgcHVibGljIGZuOiBGdW5jdGlvbiwgcHVibGljIGlzQXN5bmM6IGJvb2xlYW4sXG4gICAgICAgICAgICAgIHB1YmxpYyBhZGRpdGlvbmFsUHJvdmlkZXJzOiAoKSA9PiBhbnkgPSBlbXB0eUFycmF5KSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUgZXhlY3V0ZWQgZnVuY3Rpb24uXG4gICAqL1xuICBleGVjdXRlKGluamVjdG9yOiBJbmplY3Rvcik6IGFueSB7XG4gICAgdmFyIHBhcmFtcyA9IHRoaXMuX3Rva2Vucy5tYXAodCA9PiBpbmplY3Rvci5nZXQodCkpO1xuICAgIHJldHVybiBGdW5jdGlvbldyYXBwZXIuYXBwbHkodGhpcy5mbiwgcGFyYW1zKTtcbiAgfVxuXG4gIGhhc1Rva2VuKHRva2VuOiBhbnkpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3Rva2Vucy5pbmRleE9mKHRva2VuKSA+IC0xOyB9XG59XG4iXX0=