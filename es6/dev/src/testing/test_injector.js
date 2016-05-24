import { Injector, PLATFORM_INITIALIZER } from 'angular2/core';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ListWrapper } from 'angular2/src/facade/collection';
import { FunctionWrapper, isPresent } from 'angular2/src/facade/lang';
export class TestInjector {
    constructor() {
        this._instantiated = false;
        this._injector = null;
        this._providers = [];
        this.platformProviders = [];
        this.applicationProviders = [];
    }
    reset() {
        this._injector = null;
        this._providers = [];
        this._instantiated = false;
    }
    addProviders(providers) {
        if (this._instantiated) {
            throw new BaseException('Cannot add providers after test injector is instantiated');
        }
        this._providers = ListWrapper.concat(this._providers, providers);
    }
    createInjector() {
        var rootInjector = Injector.resolveAndCreate(this.platformProviders);
        this._injector = rootInjector.resolveAndCreateChild(ListWrapper.concat(this.applicationProviders, this._providers));
        this._instantiated = true;
        return this._injector;
    }
    execute(fn) {
        var additionalProviders = fn.additionalProviders();
        if (additionalProviders.length > 0) {
            this.addProviders(additionalProviders);
        }
        if (!this._instantiated) {
            this.createInjector();
        }
        return fn.execute(this._injector);
    }
}
var _testInjector = null;
export function getTestInjector() {
    if (_testInjector == null) {
        _testInjector = new TestInjector();
    }
    return _testInjector;
}
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
export function setBaseTestProviders(platformProviders, applicationProviders) {
    var testInjector = getTestInjector();
    if (testInjector.platformProviders.length > 0 || testInjector.applicationProviders.length > 0) {
        throw new BaseException('Cannot set base providers because it has already been called');
    }
    testInjector.platformProviders = platformProviders;
    testInjector.applicationProviders = applicationProviders;
    var injector = testInjector.createInjector();
    let inits = injector.getOptional(PLATFORM_INITIALIZER);
    if (isPresent(inits)) {
        inits.forEach(init => init());
    }
    testInjector.reset();
}
/**
 * Reset the providers for the test injector.
 */
export function resetBaseTestProviders() {
    var testInjector = getTestInjector();
    testInjector.platformProviders = [];
    testInjector.applicationProviders = [];
    testInjector.reset();
}
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
export function inject(tokens, fn) {
    return new FunctionWithParamTokens(tokens, fn, false);
}
export class InjectSetupWrapper {
    constructor(_providers) {
        this._providers = _providers;
    }
    inject(tokens, fn) {
        return new FunctionWithParamTokens(tokens, fn, false, this._providers);
    }
    /** @Deprecated {use async(withProviders().inject())} */
    injectAsync(tokens, fn) {
        return new FunctionWithParamTokens(tokens, fn, true, this._providers);
    }
}
export function withProviders(providers) {
    return new InjectSetupWrapper(providers);
}
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
export function injectAsync(tokens, fn) {
    return new FunctionWithParamTokens(tokens, fn, true);
}
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
export function async(fn) {
    if (fn instanceof FunctionWithParamTokens) {
        fn.isAsync = true;
        return fn;
    }
    else if (fn instanceof Function) {
        return new FunctionWithParamTokens([], fn, true);
    }
    else {
        throw new BaseException('argument to async must be a function or inject(<Function>)');
    }
}
function emptyArray() {
    return [];
}
export class FunctionWithParamTokens {
    constructor(_tokens, fn, isAsync, additionalProviders = emptyArray) {
        this._tokens = _tokens;
        this.fn = fn;
        this.isAsync = isAsync;
        this.additionalProviders = additionalProviders;
    }
    /**
     * Returns the value of the executed function.
     */
    execute(injector) {
        var params = this._tokens.map(t => injector.get(t));
        return FunctionWrapper.apply(this.fn, params);
    }
    hasToken(token) { return this._tokens.indexOf(token) > -1; }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9pbmplY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtaFRkMlIxOHoudG1wL2FuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RfaW5qZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBQyxRQUFRLEVBQVksb0JBQW9CLEVBQUMsTUFBTSxlQUFlO09BQy9ELEVBQUMsYUFBYSxFQUFtQixNQUFNLGdDQUFnQztPQUN2RSxFQUFDLFdBQVcsRUFBQyxNQUFNLGdDQUFnQztPQUNuRCxFQUFDLGVBQWUsRUFBRSxTQUFTLEVBQU8sTUFBTSwwQkFBMEI7QUFFekU7SUFBQTtRQUNVLGtCQUFhLEdBQVksS0FBSyxDQUFDO1FBRS9CLGNBQVMsR0FBYSxJQUFJLENBQUM7UUFFM0IsZUFBVSxHQUFtQyxFQUFFLENBQUM7UUFReEQsc0JBQWlCLEdBQW1DLEVBQUUsQ0FBQztRQUV2RCx5QkFBb0IsR0FBbUMsRUFBRSxDQUFDO0lBMkI1RCxDQUFDO0lBbkNDLEtBQUs7UUFDSCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUN0QixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztJQUM3QixDQUFDO0lBTUQsWUFBWSxDQUFDLFNBQXlDO1FBQ3BELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sSUFBSSxhQUFhLENBQUMsMERBQTBELENBQUMsQ0FBQztRQUN0RixDQUFDO1FBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVELGNBQWM7UUFDWixJQUFJLFlBQVksR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGlC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bUIsR0FBYyxVQUFVO1FBRDFDLFlBQU8sR0FBUCxPQUFPLENBQU87UUFBUyxPQUFFLEdBQUYsRUFBRSxDQUFVO1FBQVMsWUFBTyxHQUFQLE9BQU8sQ0FBUztRQUM3RCx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXdCO0lBQUcsQ0FBQztJQUVsRTs7T0FFRztJQUNILE9BQU8sQ0FBQyxRQUFrQjtRQUN4QixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVELFFBQVEsQ0FBQyxLQUFVLElBQWEsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1RSxDQUFDO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdG9yLCBQcm92aWRlciwgUExBVEZPUk1fSU5JVElBTElaRVJ9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBFeGNlcHRpb25IYW5kbGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7RnVuY3Rpb25XcmFwcGVyLCBpc1ByZXNlbnQsIFR5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmV4cG9ydCBjbGFzcyBUZXN0SW5qZWN0b3Ige1xuICBwcml2YXRlIF9pbnN0YW50aWF0ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3IgPSBudWxsO1xuXG4gIHByaXZhdGUgX3Byb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+ID0gW107XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5faW5qZWN0b3IgPSBudWxsO1xuICAgIHRoaXMuX3Byb3ZpZGVycyA9IFtdO1xuICAgIHRoaXMuX2luc3RhbnRpYXRlZCA9IGZhbHNlO1xuICB9XG5cbiAgcGxhdGZvcm1Qcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPiA9IFtdO1xuXG4gIGFwcGxpY2F0aW9uUHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4gPSBbXTtcblxuICBhZGRQcm92aWRlcnMocHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pIHtcbiAgICBpZiAodGhpcy5faW5zdGFudGlhdGVkKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignQ2Fubm90IGFkZCBwcm92aWRlcnMgYWZ0ZXIgdGVzdCBpbmplY3RvciBpcyBpbnN0YW50aWF0ZWQnKTtcbiAgICB9XG4gICAgdGhpcy5fcHJvdmlkZXJzID0gTGlzdFdyYXBwZXIuY29uY2F0KHRoaXMuX3Byb3ZpZGVycywgcHJvdmlkZXJzKTtcbiAgfVxuXG4gIGNyZWF0ZUluamVjdG9yKCkge1xuICAgIHZhciByb290SW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKHRoaXMucGxhdGZvcm1Qcm92aWRlcnMpO1xuICAgIHRoaXMuX2luamVjdG9yID0gcm9vdEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGVDaGlsZChcbiAgICAgICAgTGlzdFdyYXBwZXIuY29uY2F0KHRoaXMuYXBwbGljYXRpb25Qcm92aWRlcnMsIHRoaXMuX3Byb3ZpZGVycykpO1xuICAgIHRoaXMuX2luc3RhbnRpYXRlZCA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuX2luamVjdG9yO1xuICB9XG5cbiAgZXhlY3V0ZShmbjogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMpOiBhbnkge1xuICAgIHZhciBhZGRpdGlvbmFsUHJvdmlkZXJzID0gZm4uYWRkaXRpb25hbFByb3ZpZGVycygpO1xuICAgIGlmIChhZGRpdGlvbmFsUHJvdmlkZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuYWRkUHJvdmlkZXJzKGFkZGl0aW9uYWxQcm92aWRlcnMpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuX2luc3RhbnRpYXRlZCkge1xuICAgICAgdGhpcy5jcmVhdGVJbmplY3RvcigpO1xuICAgIH1cbiAgICByZXR1cm4gZm4uZXhlY3V0ZSh0aGlzLl9pbmplY3Rvcik7XG4gIH1cbn1cblxudmFyIF90ZXN0SW5qZWN0b3I6IFRlc3RJbmplY3RvciA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUZXN0SW5qZWN0b3IoKSB7XG4gIGlmIChfdGVzdEluamVjdG9yID09IG51bGwpIHtcbiAgICBfdGVzdEluamVjdG9yID0gbmV3IFRlc3RJbmplY3RvcigpO1xuICB9XG4gIHJldHVybiBfdGVzdEluamVjdG9yO1xufVxuXG4vKipcbiAqIFNldCB0aGUgcHJvdmlkZXJzIHRoYXQgdGhlIHRlc3QgaW5qZWN0b3Igc2hvdWxkIHVzZS4gVGhlc2Ugc2hvdWxkIGJlIHByb3ZpZGVyc1xuICogY29tbW9uIHRvIGV2ZXJ5IHRlc3QgaW4gdGhlIHN1aXRlLlxuICpcbiAqIFRoaXMgbWF5IG9ubHkgYmUgY2FsbGVkIG9uY2UsIHRvIHNldCB1cCB0aGUgY29tbW9uIHByb3ZpZGVycyBmb3IgdGhlIGN1cnJlbnQgdGVzdFxuICogc3VpdGUgb24gdGVoIGN1cnJlbnQgcGxhdGZvcm0uIElmIHlvdSBhYnNvbHV0ZWx5IG5lZWQgdG8gY2hhbmdlIHRoZSBwcm92aWRlcnMsXG4gKiBmaXJzdCB1c2UgYHJlc2V0QmFzZVRlc3RQcm92aWRlcnNgLlxuICpcbiAqIFRlc3QgUHJvdmlkZXJzIGZvciBpbmRpdmlkdWFsIHBsYXRmb3JtcyBhcmUgYXZhaWxhYmxlIGZyb21cbiAqICdhbmd1bGFyMi9wbGF0Zm9ybS90ZXN0aW5nLzxwbGF0Zm9ybV9uYW1lPicuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRCYXNlVGVzdFByb3ZpZGVycyhwbGF0Zm9ybVByb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uUHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pIHtcbiAgdmFyIHRlc3RJbmplY3RvciA9IGdldFRlc3RJbmplY3RvcigpO1xuICBpZiAodGVzdEluamVjdG9yLnBsYXRmb3JtUHJvdmlkZXJzLmxlbmd0aCA+IDAgfHwgdGVzdEluamVjdG9yLmFwcGxpY2F0aW9uUHJvdmlkZXJzLmxlbmd0aCA+IDApIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignQ2Fubm90IHNldCBiYXNlIHByb3ZpZGVycyBiZWNhdXNlIGl0IGhhcyBhbHJlYWR5IGJlZW4gY2FsbGVkJyk7XG4gIH1cbiAgdGVzdEluamVjdG9yLnBsYXRmb3JtUHJvdmlkZXJzID0gcGxhdGZvcm1Qcm92aWRlcnM7XG4gIHRlc3RJbmplY3Rvci5hcHBsaWNhdGlvblByb3ZpZGVycyA9IGFwcGxpY2F0aW9uUHJvdmlkZXJzO1xuICB2YXIgaW5qZWN0b3IgPSB0ZXN0SW5qZWN0b3IuY3JlYXRlSW5qZWN0b3IoKTtcbiAgbGV0IGluaXRzOiBGdW5jdGlvbltdID0gaW5qZWN0b3IuZ2V0T3B0aW9uYWwoUExBVEZPUk1fSU5JVElBTElaRVIpO1xuICBpZiAoaXNQcmVzZW50KGluaXRzKSkge1xuICAgIGluaXRzLmZvckVhY2goaW5pdCA9PiBpbml0KCkpO1xuICB9XG4gIHRlc3RJbmplY3Rvci5yZXNldCgpO1xufVxuXG4vKipcbiAqIFJlc2V0IHRoZSBwcm92aWRlcnMgZm9yIHRoZSB0ZXN0IGluamVjdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRCYXNlVGVzdFByb3ZpZGVycygpIHtcbiAgdmFyIHRlc3RJbmplY3RvciA9IGdldFRlc3RJbmplY3RvcigpO1xuICB0ZXN0SW5qZWN0b3IucGxhdGZvcm1Qcm92aWRlcnMgPSBbXTtcbiAgdGVzdEluamVjdG9yLmFwcGxpY2F0aW9uUHJvdmlkZXJzID0gW107XG4gIHRlc3RJbmplY3Rvci5yZXNldCgpO1xufVxuXG4vKipcbiAqIEFsbG93cyBpbmplY3RpbmcgZGVwZW5kZW5jaWVzIGluIGBiZWZvcmVFYWNoKClgIGFuZCBgaXQoKWAuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBcbiAqIGJlZm9yZUVhY2goaW5qZWN0KFtEZXBlbmRlbmN5LCBBQ2xhc3NdLCAoZGVwLCBvYmplY3QpID0+IHtcbiAqICAgLy8gc29tZSBjb2RlIHRoYXQgdXNlcyBgZGVwYCBhbmQgYG9iamVjdGBcbiAqICAgLy8gLi4uXG4gKiB9KSk7XG4gKlxuICogaXQoJy4uLicsIGluamVjdChbQUNsYXNzXSwgKG9iamVjdCkgPT4ge1xuICogICBvYmplY3QuZG9Tb21ldGhpbmcoKTtcbiAqICAgZXhwZWN0KC4uLik7XG4gKiB9KVxuICogYGBgXG4gKlxuICogTm90ZXM6XG4gKiAtIGluamVjdCBpcyBjdXJyZW50bHkgYSBmdW5jdGlvbiBiZWNhdXNlIG9mIHNvbWUgVHJhY2V1ciBsaW1pdGF0aW9uIHRoZSBzeW50YXggc2hvdWxkXG4gKiBldmVudHVhbGx5XG4gKiAgIGJlY29tZXMgYGl0KCcuLi4nLCBASW5qZWN0IChvYmplY3Q6IEFDbGFzcywgYXN5bmM6IEFzeW5jVGVzdENvbXBsZXRlcikgPT4geyAuLi4gfSk7YFxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHRva2Vuc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0Z1bmN0aW9uV2l0aFBhcmFtVG9rZW5zfVxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0KHRva2VuczogYW55W10sIGZuOiBGdW5jdGlvbik6IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHtcbiAgcmV0dXJuIG5ldyBGdW5jdGlvbldpdGhQYXJhbVRva2Vucyh0b2tlbnMsIGZuLCBmYWxzZSk7XG59XG5cbmV4cG9ydCBjbGFzcyBJbmplY3RTZXR1cFdyYXBwZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9wcm92aWRlcnM6ICgpID0+IGFueSkge31cblxuICBpbmplY3QodG9rZW5zOiBhbnlbXSwgZm46IEZ1bmN0aW9uKTogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMge1xuICAgIHJldHVybiBuZXcgRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnModG9rZW5zLCBmbiwgZmFsc2UsIHRoaXMuX3Byb3ZpZGVycyk7XG4gIH1cblxuICAvKiogQERlcHJlY2F0ZWQge3VzZSBhc3luYyh3aXRoUHJvdmlkZXJzKCkuaW5qZWN0KCkpfSAqL1xuICBpbmplY3RBc3luYyh0b2tlbnM6IGFueVtdLCBmbjogRnVuY3Rpb24pOiBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB7XG4gICAgcmV0dXJuIG5ldyBGdW5jdGlvbldpdGhQYXJhbVRva2Vucyh0b2tlbnMsIGZuLCB0cnVlLCB0aGlzLl9wcm92aWRlcnMpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aXRoUHJvdmlkZXJzKHByb3ZpZGVyczogKCkgPT4gYW55KSB7XG4gIHJldHVybiBuZXcgSW5qZWN0U2V0dXBXcmFwcGVyKHByb3ZpZGVycyk7XG59XG5cbi8qKlxuICogQERlcHJlY2F0ZWQge3VzZSBhc3luYyhpbmplY3QoKSl9XG4gKlxuICogQWxsb3dzIGluamVjdGluZyBkZXBlbmRlbmNpZXMgaW4gYGJlZm9yZUVhY2goKWAgYW5kIGBpdCgpYC4gVGhlIHRlc3QgbXVzdCByZXR1cm5cbiAqIGEgcHJvbWlzZSB3aGljaCB3aWxsIHJlc29sdmUgd2hlbiBhbGwgYXN5bmNocm9ub3VzIGFjdGl2aXR5IGlzIGNvbXBsZXRlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBgXG4gKiBpdCgnLi4uJywgaW5qZWN0QXN5bmMoW0FDbGFzc10sIChvYmplY3QpID0+IHtcbiAqICAgcmV0dXJuIG9iamVjdC5kb1NvbWV0aGluZygpLnRoZW4oKCkgPT4ge1xuICogICAgIGV4cGVjdCguLi4pO1xuICogICB9KTtcbiAqIH0pXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSB0b2tlbnNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtGdW5jdGlvbldpdGhQYXJhbVRva2Vuc31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluamVjdEFzeW5jKHRva2VuczogYW55W10sIGZuOiBGdW5jdGlvbik6IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHtcbiAgcmV0dXJuIG5ldyBGdW5jdGlvbldpdGhQYXJhbVRva2Vucyh0b2tlbnMsIGZuLCB0cnVlKTtcbn1cblxuLyoqXG4gKiBXcmFwcyBhIHRlc3QgZnVuY3Rpb24gaW4gYW4gYXN5bmNocm9ub3VzIHRlc3Qgem9uZS4gVGhlIHRlc3Qgd2lsbCBhdXRvbWF0aWNhbGx5XG4gKiBjb21wbGV0ZSB3aGVuIGFsbCBhc3luY2hyb25vdXMgY2FsbHMgd2l0aGluIHRoaXMgem9uZSBhcmUgZG9uZS4gQ2FuIGJlIHVzZWRcbiAqIHRvIHdyYXAgYW4ge0BsaW5rIGluamVjdH0gY2FsbC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYFxuICogaXQoJy4uLicsIGFzeW5jKGluamVjdChbQUNsYXNzXSwgKG9iamVjdCkgPT4ge1xuICogICBvYmplY3QuZG9Tb21ldGhpbmcudGhlbigoKSA9PiB7XG4gKiAgICAgZXhwZWN0KC4uLik7XG4gKiAgIH0pXG4gKiB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gYXN5bmMoZm46IEZ1bmN0aW9uIHwgRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMpOiBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB7XG4gIGlmIChmbiBpbnN0YW5jZW9mIEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zKSB7XG4gICAgZm4uaXNBc3luYyA9IHRydWU7XG4gICAgcmV0dXJuIGZuO1xuICB9IGVsc2UgaWYgKGZuIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICByZXR1cm4gbmV3IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zKFtdLCBmbiwgdHJ1ZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ2FyZ3VtZW50IHRvIGFzeW5jIG11c3QgYmUgYSBmdW5jdGlvbiBvciBpbmplY3QoPEZ1bmN0aW9uPiknKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlbXB0eUFycmF5KCk6IEFycmF5PGFueT4ge1xuICByZXR1cm4gW107XG59XG5cbmV4cG9ydCBjbGFzcyBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3Rva2VuczogYW55W10sIHB1YmxpYyBmbjogRnVuY3Rpb24sIHB1YmxpYyBpc0FzeW5jOiBib29sZWFuLFxuICAgICAgICAgICAgICBwdWJsaWMgYWRkaXRpb25hbFByb3ZpZGVyczogKCkgPT4gYW55ID0gZW1wdHlBcnJheSkge31cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdmFsdWUgb2YgdGhlIGV4ZWN1dGVkIGZ1bmN0aW9uLlxuICAgKi9cbiAgZXhlY3V0ZShpbmplY3RvcjogSW5qZWN0b3IpOiBhbnkge1xuICAgIHZhciBwYXJhbXMgPSB0aGlzLl90b2tlbnMubWFwKHQgPT4gaW5qZWN0b3IuZ2V0KHQpKTtcbiAgICByZXR1cm4gRnVuY3Rpb25XcmFwcGVyLmFwcGx5KHRoaXMuZm4sIHBhcmFtcyk7XG4gIH1cblxuICBoYXNUb2tlbih0b2tlbjogYW55KTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl90b2tlbnMuaW5kZXhPZih0b2tlbikgPiAtMTsgfVxufVxuIl19