library angular2.test.core.application_ref_spec;

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
import "spies.dart" show SpyChangeDetector;
import "package:angular2/src/core/application_ref.dart"
    show ApplicationRef_, ApplicationRef, PlatformRef_;
import "package:angular2/core.dart" show Injector, Provider, APP_INITIALIZER;
import "package:angular2/src/core/change_detection/change_detector_ref.dart"
    show ChangeDetectorRef_;
import "package:angular2/src/facade/async.dart"
    show PromiseWrapper, PromiseCompleter, TimerWrapper;
import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "package:angular2/src/facade/exception_handler.dart"
    show ExceptionHandler;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;

main() {
  describe("ApplicationRef", () {
    it("should throw when reentering tick", () {
      var cd = (new SpyChangeDetector() as dynamic);
      var ref = new ApplicationRef_(null, null, null);
      ref.registerChangeDetector(new ChangeDetectorRef_(cd));
      cd.spy("detectChanges").andCallFake(() => ref.tick());
      expect(() => ref.tick())
          .toThrowError("ApplicationRef.tick is called recursively");
    });
  });
  describe("PlatformRef", () {
    var exceptionHandler = new Provider(ExceptionHandler,
        useValue: new ExceptionHandler(DOM, true));
    describe("asyncApplication", () {
      void expectProviders(Injector injector, List<dynamic> providers) {
        for (var i = 0; i < providers.length; i++) {
          var provider = providers[i];
          expect(injector.get(provider.token)).toBe(provider.useValue);
        }
      }
      it(
          "should merge syncronous and asyncronous providers",
          inject([AsyncTestCompleter, Injector], (async, injector) {
            var ref = new PlatformRef_(injector, null);
            var ASYNC_PROVIDERS = [
              new Provider(Foo, useValue: new Foo()),
              exceptionHandler
            ];
            var SYNC_PROVIDERS = [new Provider(Bar, useValue: new Bar())];
            ref
                .asyncApplication(
                    (zone) => PromiseWrapper.resolve(ASYNC_PROVIDERS),
                    SYNC_PROVIDERS)
                .then((appRef) {
              var providers =
                  ListWrapper.concat(ASYNC_PROVIDERS, SYNC_PROVIDERS);
              expectProviders(appRef.injector, providers);
              async.done();
            });
          }));
      it(
          "should allow function to be null",
          inject([AsyncTestCompleter, Injector], (async, injector) {
            var ref = new PlatformRef_(injector, null);
            var SYNC_PROVIDERS = [
              new Provider(Bar, useValue: new Bar()),
              exceptionHandler
            ];
            ref.asyncApplication(null, SYNC_PROVIDERS).then((appRef) {
              expectProviders(appRef.injector, SYNC_PROVIDERS);
              async.done();
            });
          }));
      mockAsyncAppInitializer(PromiseCompleter<dynamic> completer,
          [List<dynamic> providers = null, Injector injector]) {
        return () {
          if (providers != null) {
            expectProviders(injector, providers);
          }
          TimerWrapper.setTimeout(() => completer.resolve(true), 1);
          return completer.promise;
        };
      }
      it(
          "should wait for asyncronous app initializers",
          inject([AsyncTestCompleter, Injector], (async, injector) {
            var ref = new PlatformRef_(injector, null);
            PromiseCompleter<dynamic> completer = PromiseWrapper.completer();
            var SYNC_PROVIDERS = [
              new Provider(Bar, useValue: new Bar()),
              new Provider(APP_INITIALIZER,
                  useValue: mockAsyncAppInitializer(completer), multi: true)
            ];
            ref.asyncApplication(null, [SYNC_PROVIDERS, exceptionHandler]).then(
                (appRef) {
              expectProviders(
                  appRef.injector,
                  ListWrapper.slice(
                      SYNC_PROVIDERS, 0, SYNC_PROVIDERS.length - 1));
              completer.promise.then((_) => async.done());
            });
          }));
      it(
          "should wait for async providers and then async app initializers",
          inject([AsyncTestCompleter, Injector], (async, injector) {
            var ref = new PlatformRef_(injector, null);
            var ASYNC_PROVIDERS = [new Provider(Foo, useValue: new Foo())];
            PromiseCompleter<dynamic> completer = PromiseWrapper.completer();
            var SYNC_PROVIDERS = [
              new Provider(Bar, useValue: new Bar()),
              new Provider(APP_INITIALIZER,
                  useFactory: (injector) => mockAsyncAppInitializer(
                      (completer as dynamic), ASYNC_PROVIDERS, injector),
                  multi: true,
                  deps: [Injector])
            ];
            ref.asyncApplication(
                (zone) => PromiseWrapper.resolve(ASYNC_PROVIDERS),
                [SYNC_PROVIDERS, exceptionHandler]).then((appRef) {
              expectProviders(
                  appRef.injector,
                  ListWrapper.slice(
                      SYNC_PROVIDERS, 0, SYNC_PROVIDERS.length - 1));
              completer.promise.then((_) => async.done());
            });
          }));
    });
    describe("application", () {
      it(
          "should throw if an APP_INITIIALIZER returns a promise",
          inject([Injector], (injector) {
            var ref = new PlatformRef_(injector, null);
            var appInitializer = new Provider(APP_INITIALIZER,
                useValue: () => PromiseWrapper.resolve([]), multi: true);
            expect(() => ref
                .application(
                    [appInitializer, exceptionHandler])).toThrowError(
                "Cannot use asyncronous app initializers with application. Use asyncApplication instead.");
          }));
    });
  });
}

class Foo {
  Foo() {}
}

class Bar {
  Bar() {}
}
