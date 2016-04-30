library angular2.src.testing.test_injector;

import "package:angular2/core.dart"
    show ReflectiveInjector, Provider, PLATFORM_INITIALIZER;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, ExceptionHandler;
import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "package:angular2/src/facade/lang.dart"
    show FunctionWrapper, isPresent, Type;
import "async.dart" show async;
import "async_test_completer.dart" show AsyncTestCompleter;
export "async.dart" show async;

class TestInjector {
  bool _instantiated = false;
  ReflectiveInjector _injector = null;
  List<dynamic /* Type | Provider | List < dynamic > */ > _providers = [];
  reset() {
    this._injector = null;
    this._providers = [];
    this._instantiated = false;
  }

  List<dynamic /* Type | Provider | List < dynamic > */ > platformProviders =
      [];
  List<dynamic /* Type | Provider | List < dynamic > */ > applicationProviders =
      [];
  addProviders(
      List<dynamic /* Type | Provider | List < dynamic > */ > providers) {
    if (this._instantiated) {
      throw new BaseException(
          "Cannot add providers after test injector is instantiated");
    }
    this._providers = ListWrapper.concat(this._providers, providers);
  }

  createInjector() {
    var rootInjector =
        ReflectiveInjector.resolveAndCreate(this.platformProviders);
    this._injector = rootInjector.resolveAndCreateChild(
        ListWrapper.concat(this.applicationProviders, this._providers));
    this._instantiated = true;
    return this._injector;
  }

  get(dynamic token) {
    if (!this._instantiated) {
      this.createInjector();
    }
    return this._injector.get(token);
  }

  dynamic execute(List<dynamic> tokens, Function fn) {
    if (!this._instantiated) {
      this.createInjector();
    }
    var params = tokens.map((t) => this._injector.get(t)).toList();
    return FunctionWrapper.apply(fn, params);
  }
}

TestInjector _testInjector = null;
getTestInjector() {
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
setBaseTestProviders(
    List<dynamic /* Type | Provider | List < dynamic > */ > platformProviders,
    List<
        dynamic /* Type | Provider | List < dynamic > */ > applicationProviders) {
  var testInjector = getTestInjector();
  if (testInjector.platformProviders.length > 0 ||
      testInjector.applicationProviders.length > 0) {
    throw new BaseException(
        "Cannot set base providers because it has already been called");
  }
  testInjector.platformProviders = platformProviders;
  testInjector.applicationProviders = applicationProviders;
  var injector = testInjector.createInjector();
  List<Function> inits = injector.get(PLATFORM_INITIALIZER, null);
  if (isPresent(inits)) {
    inits.forEach((init) => init());
  }
  testInjector.reset();
}

/**
 * Reset the providers for the test injector.
 */
resetBaseTestProviders() {
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
 * 
 * 
 * 
 */
Function inject(List<dynamic> tokens, Function fn) {
  var testInjector = getTestInjector();
  if (tokens.indexOf(AsyncTestCompleter) >= 0) {
    // Return an async test method that returns a Promise if AsyncTestCompleter is one of the

    // injected tokens.
    return () {
      AsyncTestCompleter completer = testInjector.get(AsyncTestCompleter);
      testInjector.execute(tokens, fn);
      return completer.promise;
    };
  } else {
    // Return a synchronous test method with the injected tokens.
    return () {
      return getTestInjector().execute(tokens, fn);
    };
  }
}

class InjectSetupWrapper {
  dynamic /* () => any */ _providers;
  InjectSetupWrapper(this._providers) {}
  _addProviders() {
    var additionalProviders = this._providers();
    if (additionalProviders.length > 0) {
      getTestInjector().addProviders(additionalProviders);
    }
  }

  Function inject(List<dynamic> tokens, Function fn) {
    return () {
      this._addProviders();
      return inject_impl(tokens, fn)();
    };
  }

  /** @Deprecated {use async(withProviders().inject())} */
  Function injectAsync(List<dynamic> tokens, Function fn) {
    return () {
      this._addProviders();
      return injectAsync_impl(tokens, fn)();
    };
  }
}

withProviders(dynamic providers()) {
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
 * 
 * 
 * 
 */
Function injectAsync(List<dynamic> tokens, Function fn) {
  return async(inject(tokens, fn));
}
// This is to ensure inject(Async) within InjectSetupWrapper doesn't call itself

// when transpiled to Dart.
var inject_impl = inject;
var injectAsync_impl = injectAsync;
