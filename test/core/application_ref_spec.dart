library angular2.test.core.application_ref_spec;

import "dart:async";
import "package:angular2/testing_internal.dart"
    show
        ddescribe,
        describe,
        it,
        iit,
        xit,
        expect,
        beforeEach,
        afterEach,
        el,
        AsyncTestCompleter,
        fakeAsync,
        tick,
        inject,
        SpyObject;
import "package:angular2/src/facade/lang.dart" show Type;
import "spies.dart" show SpyChangeDetectorRef;
import "package:angular2/src/core/application_ref.dart"
    show
        ApplicationRef_,
        ApplicationRef,
        PLATFORM_CORE_PROVIDERS,
        APPLICATION_CORE_PROVIDERS;
import "package:angular2/core.dart"
    show
        Injector,
        Provider,
        APP_INITIALIZER,
        Component,
        ReflectiveInjector,
        coreLoadAndBootstrap,
        coreBootstrap,
        PlatformRef,
        createPlatform,
        disposePlatform,
        ComponentResolver,
        ChangeDetectorRef;
import "package:angular2/src/core/console.dart" show Console;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/facade/async.dart"
    show PromiseWrapper, PromiseCompleter, TimerWrapper;
import "package:angular2/src/core/linker/component_factory.dart"
    show ComponentFactory, ComponentRef_, ComponentRef;
import "package:angular2/src/facade/exception_handler.dart"
    show ExceptionHandler;

main() {
  describe("bootstrap", () {
    PlatformRef platform;
    _ArrayLogger errorLogger;
    ComponentFactory someCompFactory;
    beforeEach(() {
      errorLogger = new _ArrayLogger();
      disposePlatform();
      platform = createPlatform(
          ReflectiveInjector.resolveAndCreate(PLATFORM_CORE_PROVIDERS));
      someCompFactory = new _MockComponentFactory(
          new _MockComponentRef(ReflectiveInjector.resolveAndCreate([])));
    });
    afterEach(() {
      disposePlatform();
    });
    ApplicationRef_ createApplication(List<dynamic> providers) {
      var appInjector = ReflectiveInjector.resolveAndCreate([
        APPLICATION_CORE_PROVIDERS,
        new Provider(Console, useValue: new _MockConsole()),
        new Provider(ExceptionHandler,
            useValue: new ExceptionHandler(errorLogger, false)),
        new Provider(ComponentResolver,
            useValue: new _MockComponentResolver(someCompFactory)),
        providers
      ], platform.injector);
      return appInjector.get(ApplicationRef);
    }
    describe("ApplicationRef", () {
      it("should throw when reentering tick", () {
        var cdRef = (new SpyChangeDetectorRef() as dynamic);
        var ref = createApplication([]);
        try {
          ref.registerChangeDetector(cdRef);
          cdRef.spy("detectChanges").andCallFake(() => ref.tick());
          expect(() => ref.tick())
              .toThrowError("ApplicationRef.tick is called recursively");
        } finally {
          ref.unregisterChangeDetector(cdRef);
        }
      });
      describe("run", () {
        it("should rethrow errors even if the exceptionHandler is not rethrowing",
            () {
          var ref = createApplication([]);
          expect(() => ref.run(() {
                throw new BaseException("Test");
              })).toThrowError("Test");
        });
        it(
            "should return a promise with rejected errors even if the exceptionHandler is not rethrowing",
            inject([AsyncTestCompleter, Injector], (async, injector) {
              var ref = createApplication([]);
              var promise = ref.run(() => PromiseWrapper.reject("Test", null));
              PromiseWrapper.catchError(promise, (e) {
                expect(e).toEqual("Test");
                async.done();
              });
            }));
      });
    });
    describe("coreLoadAndBootstrap", () {
      it(
          "should wait for asynchronous app initializers",
          inject([AsyncTestCompleter, Injector], (async, injector) {
            PromiseCompleter<dynamic> completer = PromiseWrapper.completer();
            var initializerDone = false;
            TimerWrapper.setTimeout(() {
              completer.resolve(true);
              initializerDone = true;
            }, 1);
            var app = createApplication([
              new Provider(APP_INITIALIZER,
                  useValue: () => completer.promise, multi: true)
            ]);
            coreLoadAndBootstrap(app.injector, MyComp).then((compRef) {
              expect(initializerDone).toBe(true);
              async.done();
            });
          }));
    });
    describe("coreBootstrap", () {
      it(
          "should throw if an APP_INITIIALIZER is not yet resolved",
          inject([Injector], (injector) {
            var app = createApplication([
              new Provider(APP_INITIALIZER,
                  useValue: () => PromiseWrapper.completer().promise,
                  multi: true)
            ]);
            expect(() => app.bootstrap(someCompFactory)).toThrowError(
                "Cannot bootstrap as there are still asynchronous initializers running. Wait for them using waitForAsyncInitializers().");
          }));
    });
  });
}

@Component(selector: "my-comp", template: "")
class MyComp {}

class _ArrayLogger {
  List<dynamic> res = [];
  void log(dynamic s) {
    this.res.add(s);
  }

  void logError(dynamic s) {
    this.res.add(s);
  }

  void logGroup(dynamic s) {
    this.res.add(s);
  }

  logGroupEnd() {}
}

class _MockComponentFactory extends ComponentFactory {
  ComponentRef _compRef;
  _MockComponentFactory(this._compRef) : super(null, null, null) {
    /* super call moved to initializer */;
  }
  ComponentRef create(Injector injector,
      [List<List<dynamic>> projectableNodes = null,
      dynamic /* String | dynamic */ rootSelectorOrNode = null]) {
    return this._compRef;
  }
}

class _MockComponentResolver implements ComponentResolver {
  ComponentFactory _compFactory;
  _MockComponentResolver(this._compFactory) {}
  Future<ComponentFactory> resolveComponent(Type type) {
    return PromiseWrapper.resolve(this._compFactory);
  }

  clearCache() {}
}

class _MockComponentRef extends ComponentRef_ {
  Injector _injector;
  _MockComponentRef(this._injector) : super(null, null) {
    /* super call moved to initializer */;
  }
  Injector get injector {
    return this._injector;
  }

  ChangeDetectorRef get changeDetectorRef {
    return (new SpyChangeDetectorRef() as dynamic);
  }

  onDestroy(Function cb) {}
}

class _MockConsole implements Console {
  log(message) {}
  warn(message) {}
}
