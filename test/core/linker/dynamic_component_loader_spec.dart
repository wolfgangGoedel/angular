library angular2.test.core.linker.dynamic_component_loader_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        ddescribe,
        xdescribe,
        describe,
        el,
        dispatchEvent,
        expect,
        iit,
        inject,
        beforeEachProviders,
        it,
        xit,
        TestComponentBuilder,
        ComponentFixture;
import "package:angular2/src/facade/collection.dart" show Predicate;
import "package:angular2/core.dart"
    show Injector, OnDestroy, DebugElement, Type, ViewContainerRef, ViewChild;
import "package:angular2/src/core/metadata.dart" show Component, ViewMetadata;
import "package:angular2/src/core/linker/dynamic_component_loader.dart"
    show DynamicComponentLoader;
import "package:angular2/src/core/linker/element_ref.dart" show ElementRef;
import "package:angular2/src/platform/dom/dom_tokens.dart" show DOCUMENT;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/facade/promise.dart" show PromiseWrapper;

main() {
  describe("DynamicComponentLoader", () {
    describe("loading next to a location", () {
      it(
          "should work",
          inject([
            DynamicComponentLoader,
            TestComponentBuilder,
            AsyncTestCompleter
          ], (DynamicComponentLoader loader, TestComponentBuilder tcb, async) {
            tcb.createAsync(MyComp).then((tc) {
              tc.detectChanges();
              loader
                  .loadNextToLocation(
                      DynamicallyLoaded, tc.componentInstance.viewContainerRef)
                  .then((ref) {
                expect(tc.debugElement.nativeElement)
                    .toHaveText("DynamicallyLoaded;");
                async.done();
              });
            });
          }));
      it(
          "should return a disposable component ref",
          inject([
            DynamicComponentLoader,
            TestComponentBuilder,
            AsyncTestCompleter
          ], (DynamicComponentLoader loader, TestComponentBuilder tcb, async) {
            tcb.createAsync(MyComp).then((tc) {
              tc.detectChanges();
              loader
                  .loadNextToLocation(
                      DynamicallyLoaded, tc.componentInstance.viewContainerRef)
                  .then((ref) {
                loader
                    .loadNextToLocation(DynamicallyLoaded2,
                        tc.componentInstance.viewContainerRef)
                    .then((ref2) {
                  expect(tc.debugElement.nativeElement)
                      .toHaveText("DynamicallyLoaded;DynamicallyLoaded2;");
                  ref2.destroy();
                  expect(tc.debugElement.nativeElement)
                      .toHaveText("DynamicallyLoaded;");
                  async.done();
                });
              });
            });
          }));
      it(
          "should update host properties",
          inject([
            DynamicComponentLoader,
            TestComponentBuilder,
            AsyncTestCompleter
          ], (DynamicComponentLoader loader, TestComponentBuilder tcb, async) {
            tcb.createAsync(MyComp).then((tc) {
              tc.detectChanges();
              loader
                  .loadNextToLocation(DynamicallyLoadedWithHostProps,
                      tc.componentInstance.viewContainerRef)
                  .then((ref) {
                ref.instance.id = "new value";
                tc.detectChanges();
                var newlyInsertedElement =
                    tc.debugElement.childNodes[1].nativeNode;
                expect(((newlyInsertedElement as dynamic)).id)
                    .toEqual("new value");
                async.done();
              });
            });
          }));
      it(
          "should leave the view tree in a consistent state if hydration fails",
          inject([
            DynamicComponentLoader,
            TestComponentBuilder,
            AsyncTestCompleter
          ], (DynamicComponentLoader loader, TestComponentBuilder tcb, async) {
            tcb.createAsync(MyComp).then((ComponentFixture tc) {
              tc.detectChanges();
              PromiseWrapper.catchError(
                  loader.loadNextToLocation(DynamicallyLoadedThrows,
                      tc.componentInstance.viewContainerRef), (error) {
                expect(error.message).toContain("ThrownInConstructor");
                expect(() => tc.detectChanges()).not.toThrow();
                async.done();
                return null;
              });
            });
          }));
      it(
          "should allow to pass projectable nodes",
          inject([
            DynamicComponentLoader,
            TestComponentBuilder,
            AsyncTestCompleter
          ], (DynamicComponentLoader loader, TestComponentBuilder tcb, async) {
            tcb.createAsync(MyComp).then((tc) {
              tc.detectChanges();
              loader.loadNextToLocation(DynamicallyLoadedWithNgContent,
                  tc.componentInstance.viewContainerRef, null, [
                [DOM.createTextNode("hello")]
              ]).then((ref) {
                tc.detectChanges();
                var newlyInsertedElement =
                    tc.debugElement.childNodes[1].nativeNode;
                expect(newlyInsertedElement).toHaveText("dynamic(hello)");
                async.done();
              });
            });
          }));
      it(
          "should not throw if not enough projectable nodes are passed in",
          inject([
            DynamicComponentLoader,
            TestComponentBuilder,
            AsyncTestCompleter
          ], (DynamicComponentLoader loader, TestComponentBuilder tcb, async) {
            tcb.createAsync(MyComp).then((tc) {
              tc.detectChanges();
              loader.loadNextToLocation(DynamicallyLoadedWithNgContent,
                  tc.componentInstance.viewContainerRef, null, []).then((_) {
                async.done();
              });
            });
          }));
    });
    describe("loadAsRoot", () {
      it(
          "should allow to create, update and destroy components",
          inject(
              [AsyncTestCompleter, DynamicComponentLoader, DOCUMENT, Injector],
              (async, DynamicComponentLoader loader, doc, Injector injector) {
            var rootEl = createRootElement(doc, "child-cmp");
            DOM.appendChild(doc.body, rootEl);
            loader.loadAsRoot(ChildComp, null, injector).then((componentRef) {
              var el = new ComponentFixture(componentRef);
              expect(rootEl.parentNode).toBe(doc.body);
              el.detectChanges();
              expect(rootEl).toHaveText("hello");
              componentRef.instance.ctxProp = "new";
              el.detectChanges();
              expect(rootEl).toHaveText("new");
              componentRef.destroy();
              expect(rootEl.parentNode).toBeFalsy();
              async.done();
            });
          }));
      it(
          "should allow to pass projectable nodes",
          inject(
              [AsyncTestCompleter, DynamicComponentLoader, DOCUMENT, Injector],
              (async, DynamicComponentLoader loader, doc, Injector injector) {
            var rootEl = createRootElement(doc, "dummy");
            DOM.appendChild(doc.body, rootEl);
            loader.loadAsRoot(
                DynamicallyLoadedWithNgContent, null, injector, null, [
              [DOM.createTextNode("hello")]
            ]).then((_) {
              expect(rootEl).toHaveText("dynamic(hello)");
              async.done();
            });
          }));
    });
  });
}

dynamic createRootElement(dynamic doc, String name) {
  var nodes = DOM.querySelectorAll(doc, name);
  for (var i = 0; i < nodes.length; i++) {
    DOM.remove(nodes[i]);
  }
  var rootEl = el('''<${ name}></${ name}>''');
  DOM.appendChild(doc.body, rootEl);
  return rootEl;
}

Predicate<DebugElement> filterByDirective(Type type) {
  return (debugElement) {
    return !identical(debugElement.providerTokens.indexOf(type), -1);
  };
}

@Component(selector: "child-cmp", template: "{{ctxProp}}")
class ChildComp {
  ElementRef elementRef;
  String ctxProp;
  ChildComp(this.elementRef) {
    this.ctxProp = "hello";
  }
}

@Component(selector: "dummy", template: "DynamicallyLoaded;")
class DynamicallyLoaded {}

@Component(selector: "dummy", template: "DynamicallyLoaded;")
class DynamicallyLoadedThrows {
  DynamicallyLoadedThrows() {
    throw new BaseException("ThrownInConstructor");
  }
}

@Component(selector: "dummy", template: "DynamicallyLoaded2;")
class DynamicallyLoaded2 {}

@Component(
    selector: "dummy",
    host: const {"[id]": "id"},
    template: "DynamicallyLoadedWithHostProps;")
class DynamicallyLoadedWithHostProps {
  String id;
  DynamicallyLoadedWithHostProps() {
    this.id = "default";
  }
}

@Component(selector: "dummy", template: "dynamic(<ng-content></ng-content>)")
class DynamicallyLoadedWithNgContent {
  String id;
  DynamicallyLoadedWithNgContent() {
    this.id = "default";
  }
}

@Component(
    selector: "my-comp", directives: const [], template: "<div #loc></div>")
class MyComp {
  bool ctxBoolProp;
  @ViewChild("loc", read: ViewContainerRef)
  ViewContainerRef viewContainerRef;
  MyComp() {
    this.ctxBoolProp = false;
  }
}
