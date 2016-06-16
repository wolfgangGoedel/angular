library angular2.test.platform.browser.bootstrap_spec;

import "dart:async";
import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        afterEach,
        ddescribe,
        describe,
        expect,
        iit,
        inject,
        it,
        xdescribe,
        Log,
        xit;
import "package:angular2/src/facade/lang.dart"
    show IS_DART, isPresent, stringify;
import "package:angular2/platform/browser.dart"
    show bootstrap, BROWSER_PROVIDERS, BROWSER_APP_PROVIDERS;
import "package:angular2/src/core/application_ref.dart"
    show ApplicationRef, PlatformRef;
import "package:angular2/src/core/console.dart" show Console;
import "package:angular2/core.dart" show Component, Directive, OnDestroy;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
import "package:angular2/src/platform/dom/dom_tokens.dart" show DOCUMENT;
import "package:angular2/src/facade/async.dart"
    show PromiseWrapper, TimerWrapper;
import "package:angular2/core.dart"
    show
        provide,
        Inject,
        Injector,
        PLATFORM_INITIALIZER,
        APP_INITIALIZER,
        coreLoadAndBootstrap,
        createPlatform,
        ReflectiveInjector;
import "package:angular2/src/core/application_ref.dart" show disposePlatform;
import "package:angular2/src/facade/exceptions.dart"
    show ExceptionHandler, BaseException;
import "package:angular2/src/core/testability/testability.dart"
    show Testability, TestabilityRegistry;
import "package:angular2/src/core/linker/component_factory.dart"
    show ComponentRef;

@Component(selector: "hello-app", template: "{{greeting}} world!")
class HelloRootCmp {
  String greeting;
  HelloRootCmp() {
    this.greeting = "hello";
  }
}

@Component(
    selector: "hello-app",
    template: "before: <ng-content></ng-content> after: done")
class HelloRootCmpContent {
  HelloRootCmpContent() {}
}

@Component(selector: "hello-app-2", template: "{{greeting}} world, again!")
class HelloRootCmp2 {
  String greeting;
  HelloRootCmp2() {
    this.greeting = "hello";
  }
}

@Component(selector: "hello-app", template: "")
class HelloRootCmp3 {
  var appBinding;
  HelloRootCmp3(@Inject("appBinding") appBinding) {
    this.appBinding = appBinding;
  }
}

@Component(selector: "hello-app", template: "")
class HelloRootCmp4 {
  var appRef;
  HelloRootCmp4(@Inject(ApplicationRef) appRef) {
    this.appRef = appRef;
  }
}

@Component(selector: "hello-app")
class HelloRootMissingTemplate {}

@Directive(selector: "hello-app")
class HelloRootDirectiveIsNotCmp {}

@Component(selector: "hello-app", template: "")
class HelloOnDestroyTickCmp implements OnDestroy {
  ApplicationRef appRef;
  HelloOnDestroyTickCmp(@Inject(ApplicationRef) appRef) {
    this.appRef = appRef;
  }
  void ngOnDestroy() {
    this.appRef.tick();
  }
}

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

class DummyConsole implements Console {
  log(message) {}
}

main() {
  var fakeDoc, el, el2, testProviders, lightDom;
  describe("bootstrap factory method", () {
    beforeEach(() {
      disposePlatform();
      fakeDoc = DOM.createHtmlDocument();
      el = DOM.createElement("hello-app", fakeDoc);
      el2 = DOM.createElement("hello-app-2", fakeDoc);
      lightDom = DOM.createElement("light-dom-el", fakeDoc);
      DOM.appendChild(fakeDoc.body, el);
      DOM.appendChild(fakeDoc.body, el2);
      DOM.appendChild(el, lightDom);
      DOM.setText(lightDom, "loading");
      testProviders = [
        provide(DOCUMENT, useValue: fakeDoc),
        provide(Console, useClass: DummyConsole)
      ];
    });
    afterEach(disposePlatform);
    it("should throw if bootstrapped Directive is not a Component", () {
      var logger = new _ArrayLogger();
      var exceptionHandler = new ExceptionHandler(logger, false);
      expect(
          () =>
              bootstrap(
                  HelloRootDirectiveIsNotCmp, [
                testProviders,
                provide(ExceptionHandler, useValue: exceptionHandler)
              ])).toThrowError(
          '''Could not compile \'${ stringify ( HelloRootDirectiveIsNotCmp )}\' because it is not a component.''');
      expect(logger.res.join("")).toContain("Could not compile");
    });
    it(
        "should throw if no element is found",
        inject([AsyncTestCompleter], (async) {
          var logger = new _ArrayLogger();
          var exceptionHandler = new ExceptionHandler(logger, false);
          var refPromise = bootstrap(HelloRootCmp,
              [provide(ExceptionHandler, useValue: exceptionHandler)]);
          PromiseWrapper.then(refPromise, null, (reason) {
            expect(reason.message).toContain(
                "The selector \"hello-app\" did not match any elements");
            async.done();
            return null;
          });
        }));
    if (DOM.supportsDOMEvents()) {
      it(
          "should forward the error to promise when bootstrap fails",
          inject([AsyncTestCompleter], (async) {
            // Skip for dart since it causes a confusing error message in console when test passes.
            var logger = new _ArrayLogger();
            var exceptionHandler = new ExceptionHandler(logger, false);
            var refPromise = bootstrap(HelloRootCmp,
                [provide(ExceptionHandler, useValue: exceptionHandler)]);
            PromiseWrapper.then(refPromise, null, (dynamic reason) {
              expect(reason.message).toContain(
                  "The selector \"hello-app\" did not match any elements");
              async.done();
            });
          }));
      it(
          "should invoke the default exception handler when bootstrap fails",
          inject([AsyncTestCompleter], (async) {
            var logger = new _ArrayLogger();
            var exceptionHandler = new ExceptionHandler(logger, false);
            var refPromise = bootstrap(HelloRootCmp,
                [provide(ExceptionHandler, useValue: exceptionHandler)]);
            PromiseWrapper.then(refPromise, null, (reason) {
              expect(logger.res.join("")).toContain(
                  "The selector \"hello-app\" did not match any elements");
              async.done();
              return null;
            });
          }));
    }
    it("should create an injector promise", () {
      var refPromise = bootstrap(HelloRootCmp, testProviders);
      expect(refPromise).not.toBe(null);
    });
    it(
        "should display hello world",
        inject([AsyncTestCompleter], (async) {
          var refPromise = bootstrap(HelloRootCmp, testProviders);
          refPromise.then((ref) {
            expect(el).toHaveText("hello world!");
            async.done();
          });
        }));
    it(
        "should support multiple calls to bootstrap",
        inject([AsyncTestCompleter], (async) {
          var refPromise1 = bootstrap(HelloRootCmp, testProviders);
          var refPromise2 = bootstrap(HelloRootCmp2, testProviders);
          PromiseWrapper.all([refPromise1, refPromise2]).then((refs) {
            expect(el).toHaveText("hello world!");
            expect(el2).toHaveText("hello world, again!");
            async.done();
          });
        }));
    it(
        "should not crash if change detection is invoked when the root component is disposed",
        inject([AsyncTestCompleter], (async) {
          bootstrap(HelloOnDestroyTickCmp, testProviders).then((ref) {
            expect(() => ref.destroy()).not.toThrow();
            async.done();
          });
        }));
    it(
        "should unregister change detectors when components are disposed",
        inject([AsyncTestCompleter], (async) {
          var platform = createPlatform(
              ReflectiveInjector.resolveAndCreate(BROWSER_PROVIDERS));
          var app = ReflectiveInjector.resolveAndCreate(
              [BROWSER_APP_PROVIDERS, testProviders],
              platform.injector).get(ApplicationRef);
          coreLoadAndBootstrap(app.injector, HelloRootCmp).then((ref) {
            ref.destroy();
            expect(() => app.tick()).not.toThrow();
            async.done();
          });
        }));
    it(
        "should make the provided bindings available to the application component",
        inject([AsyncTestCompleter], (async) {
          var refPromise = bootstrap(HelloRootCmp3,
              [testProviders, provide("appBinding", useValue: "BoundValue")]);
          refPromise.then((ref) {
            expect(ref.instance.appBinding).toEqual("BoundValue");
            async.done();
          });
        }));
    it(
        "should avoid cyclic dependencies when root component requires Lifecycle through DI",
        inject([AsyncTestCompleter], (async) {
          var refPromise = bootstrap(HelloRootCmp4, testProviders);
          refPromise.then((ref) {
            expect(ref.instance.appRef).toBe(ref.injector.get(ApplicationRef));
            async.done();
          });
        }));
    it(
        "should run platform initializers",
        inject([Log], (Log log) {
          var p = createPlatform(ReflectiveInjector.resolveAndCreate([
            BROWSER_PROVIDERS,
            provide(PLATFORM_INITIALIZER,
                useValue: log.fn("platform_init1"), multi: true),
            provide(PLATFORM_INITIALIZER,
                useValue: log.fn("platform_init2"), multi: true)
          ]));
          expect(log.result()).toEqual("platform_init1; platform_init2");
          log.clear();
          var a = ReflectiveInjector.resolveAndCreate([
            BROWSER_APP_PROVIDERS,
            provide(APP_INITIALIZER,
                useValue: log.fn("app_init1"), multi: true),
            provide(APP_INITIALIZER, useValue: log.fn("app_init2"), multi: true)
          ], p.injector);
          a.get(ApplicationRef);
          expect(log.result()).toEqual("app_init1; app_init2");
        }));
    it(
        "should register each application with the testability registry",
        inject([AsyncTestCompleter], (async) {
          Future<ComponentRef> refPromise1 =
              bootstrap(HelloRootCmp, testProviders);
          Future<ComponentRef> refPromise2 =
              bootstrap(HelloRootCmp2, testProviders);
          PromiseWrapper
              .all([refPromise1, refPromise2]).then((List<ComponentRef> refs) {
            var registry = refs[0].injector.get(TestabilityRegistry);
            var testabilities = [
              refs[0].injector.get(Testability),
              refs[1].injector.get(Testability)
            ];
            PromiseWrapper
                .all(testabilities)
                .then((List<Testability> testabilities) {
              expect(registry.findTestabilityInTree(el))
                  .toEqual(testabilities[0]);
              expect(registry.findTestabilityInTree(el2))
                  .toEqual(testabilities[1]);
              async.done();
            });
          });
        }));
  });
}
