library angular2.test.testing.test_component_builder_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        ddescribe,
        xdescribe,
        describe,
        dispatchEvent,
        expect,
        iit,
        inject,
        beforeEachProviders,
        withProviders,
        it,
        xit,
        TestComponentBuilder,
        ComponentFixtureAutoDetect,
        ComponentFixtureNoNgZone;
import "package:angular2/core.dart" show Injectable, provide, ComponentResolver;
import "package:angular2/common.dart" show NgIf;
import "package:angular2/src/core/metadata.dart"
    show Directive, Component, ViewMetadata, Input;
import "package:angular2/src/facade/lang.dart" show IS_DART;
import "package:angular2/src/facade/promise.dart" show PromiseWrapper;

@Component(
    selector: "child-comp",
    template: '''<span>Original {{childBinding}}</span>''',
    directives: const [])
@Injectable()
class ChildComp {
  String childBinding;
  ChildComp() {
    this.childBinding = "Child";
  }
}

@Component(selector: "child-comp", template: '''<span>Mock</span>''')
@Injectable()
class MockChildComp {}

@Component(
    selector: "parent-comp",
    template: '''Parent(<child-comp></child-comp>)''',
    directives: const [ChildComp])
@Injectable()
class ParentComp {}

@Component(
    selector: "my-if-comp",
    template: '''MyIf(<span *ngIf="showMore">More</span>)''',
    directives: const [NgIf])
@Injectable()
class MyIfComp {
  bool showMore = false;
}

@Component(
    selector: "child-child-comp", template: '''<span>ChildChild</span>''')
@Injectable()
class ChildChildComp {}

@Component(
    selector: "child-comp",
    template:
        '''<span>Original {{childBinding}}(<child-child-comp></child-child-comp>)</span>''',
    directives: const [ChildChildComp])
@Injectable()
class ChildWithChildComp {
  String childBinding;
  ChildWithChildComp() {
    this.childBinding = "Child";
  }
}

@Component(
    selector: "child-child-comp", template: '''<span>ChildChild Mock</span>''')
@Injectable()
class MockChildChildComp {}

@Component(
    selector: "autodetect-comp",
    template: '''<span (click)=\'click()\'>{{text}}</span>''')
class AutoDetectComp {
  String text = "1";
  click() {
    this.text += "1";
  }
}

@Component(
    selector: "async-comp",
    template: '''<span (click)=\'click()\'>{{text}}</span>''')
class AsyncComp {
  String text = "1";
  click() {
    PromiseWrapper.resolve(null).then((_) {
      this.text += "1";
    });
  }
}

@Component(selector: "async-child-comp", template: "<span>{{localText}}</span>")
class AsyncChildComp {
  String localText = "";
  @Input()
  set text(String value) {
    PromiseWrapper.resolve(null).then((_) {
      this.localText = value;
    });
  }
}

@Component(
    selector: "async-change-comp",
    template:
        '''<async-child-comp (click)=\'click()\' [text]="text"></async-child-comp>''',
    directives: const [AsyncChildComp])
class AsyncChangeComp {
  String text = "1";
  click() {
    this.text += "1";
  }
}

class FancyService {
  String value = "real value";
}

class MockFancyService extends FancyService {
  String value = "mocked out value";
}

@Component(
    selector: "my-service-comp",
    bindings: const [FancyService],
    template: '''injected value: {{fancyService.value}}''')
class TestBindingsComp {
  FancyService fancyService;
  TestBindingsComp(this.fancyService) {}
}

@Component(
    selector: "my-service-comp",
    viewProviders: const [FancyService],
    template: '''injected value: {{fancyService.value}}''')
class TestViewBindingsComp {
  FancyService fancyService;
  TestViewBindingsComp(this.fancyService) {}
}

@Component(selector: "li1", template: '''<span>One</span>''')
class ListDir1 {}

@Component(selector: "li1", template: '''<span>Alternate One</span>''')
class ListDir1Alt {}

@Component(selector: "li2", template: '''<span>Two</span>''')
class ListDir2 {}

const LIST_CHILDREN = const [ListDir1, ListDir2];

@Component(
    selector: "directive-list-comp",
    template: '''(<li1></li1>)(<li2></li2>)''',
    directives: const [LIST_CHILDREN])
class DirectiveListComp {}

main() {
  describe("test component builder", () {
    it(
        "should instantiate a component with valid DOM",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.createAsync(ChildComp).then((componentFixture) {
            componentFixture.detectChanges();
            expect(componentFixture.nativeElement).toHaveText("Original Child");
            async.done();
          });
        }));
    it(
        "should allow changing members of the component",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.createAsync(MyIfComp).then((componentFixture) {
            componentFixture.detectChanges();
            expect(componentFixture.nativeElement).toHaveText("MyIf()");
            componentFixture.componentInstance.showMore = true;
            componentFixture.detectChanges();
            expect(componentFixture.nativeElement).toHaveText("MyIf(More)");
            async.done();
          });
        }));
    it(
        "should override a template",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb
              .overrideTemplate(MockChildComp, "<span>Mock</span>")
              .createAsync(MockChildComp)
              .then((componentFixture) {
            componentFixture.detectChanges();
            expect(componentFixture.nativeElement).toHaveText("Mock");
            async.done();
          });
        }));
    it(
        "should override a view",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb
              .overrideView(
                  ChildComp,
                  new ViewMetadata(
                      template: "<span>Modified {{childBinding}}</span>"))
              .createAsync(ChildComp)
              .then((componentFixture) {
            componentFixture.detectChanges();
            expect(componentFixture.nativeElement).toHaveText("Modified Child");
            async.done();
          });
        }));
    it(
        "should override component dependencies",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb
              .overrideDirective(ParentComp, ChildComp, MockChildComp)
              .createAsync(ParentComp)
              .then((componentFixture) {
            componentFixture.detectChanges();
            expect(componentFixture.nativeElement).toHaveText("Parent(Mock)");
            async.done();
          });
        }));
    it(
        "should override items from a list",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb
              .overrideDirective(DirectiveListComp, ListDir1, ListDir1Alt)
              .createAsync(DirectiveListComp)
              .then((componentFixture) {
            componentFixture.detectChanges();
            expect(componentFixture.nativeElement)
                .toHaveText("(Alternate One)(Two)");
            async.done();
          });
        }));
    it(
        "should override child component's dependencies",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb
              .overrideDirective(ParentComp, ChildComp, ChildWithChildComp)
              .overrideDirective(
                  ChildWithChildComp, ChildChildComp, MockChildChildComp)
              .createAsync(ParentComp)
              .then((componentFixture) {
            componentFixture.detectChanges();
            expect(componentFixture.nativeElement)
                .toHaveText("Parent(Original Child(ChildChild Mock))");
            async.done();
          });
        }));
    it(
        "should override a provider",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb
              .overrideProviders(TestBindingsComp,
                  [provide(FancyService, useClass: MockFancyService)])
              .createAsync(TestBindingsComp)
              .then((componentFixture) {
                componentFixture.detectChanges();
                expect(componentFixture.nativeElement)
                    .toHaveText("injected value: mocked out value");
                async.done();
              });
        }));
    it(
        "should override a viewBinding",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb
              .overrideViewProviders(TestViewBindingsComp,
                  [provide(FancyService, useClass: MockFancyService)])
              .createAsync(TestViewBindingsComp)
              .then((componentFixture) {
                componentFixture.detectChanges();
                expect(componentFixture.nativeElement)
                    .toHaveText("injected value: mocked out value");
                async.done();
              });
        }));
    if (!IS_DART) {
      describe("ComponentFixture", () {
        it(
            "should auto detect changes if autoDetectChanges is called",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              tcb.createAsync(AutoDetectComp).then((componentFixture) {
                expect(componentFixture.ngZone).not.toBeNull();
                componentFixture.autoDetectChanges();
                expect(componentFixture.nativeElement).toHaveText("1");
                var element = componentFixture.debugElement.children[0];
                dispatchEvent(element.nativeElement, "click");
                expect(componentFixture.isStable()).toBe(true);
                expect(componentFixture.nativeElement).toHaveText("11");
                async.done();
              });
            }));
        it(
            "should auto detect changes if ComponentFixtureAutoDetect is provided as true",
            withProviders(
                    () => [provide(ComponentFixtureAutoDetect, useValue: true)])
                .inject([TestComponentBuilder, AsyncTestCompleter],
                    (TestComponentBuilder tcb, async) {
              tcb.createAsync(AutoDetectComp).then((componentFixture) {
                expect(componentFixture.nativeElement).toHaveText("1");
                var element = componentFixture.debugElement.children[0];
                dispatchEvent(element.nativeElement, "click");
                expect(componentFixture.nativeElement).toHaveText("11");
                async.done();
              });
            }));
        it(
            "should signal through whenStable when the fixture is stable (autoDetectChanges)",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              tcb.createAsync(AsyncComp).then((componentFixture) {
                componentFixture.autoDetectChanges();
                expect(componentFixture.nativeElement).toHaveText("1");
                var element = componentFixture.debugElement.children[0];
                dispatchEvent(element.nativeElement, "click");
                expect(componentFixture.nativeElement).toHaveText("1");
                // Component is updated asynchronously. Wait for the fixture to become stable

                // before checking for new value.
                expect(componentFixture.isStable()).toBe(false);
                componentFixture.whenStable().then((waited) {
                  expect(waited).toBe(true);
                  expect(componentFixture.nativeElement).toHaveText("11");
                  async.done();
                });
              });
            }));
        it(
            "should signal through isStable when the fixture is stable (no autoDetectChanges)",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              tcb.createAsync(AsyncComp).then((componentFixture) {
                componentFixture.detectChanges();
                expect(componentFixture.nativeElement).toHaveText("1");
                var element = componentFixture.debugElement.children[0];
                dispatchEvent(element.nativeElement, "click");
                expect(componentFixture.nativeElement).toHaveText("1");
                // Component is updated asynchronously. Wait for the fixture to become stable

                // before checking.
                componentFixture.whenStable().then((waited) {
                  expect(waited).toBe(true);
                  componentFixture.detectChanges();
                  expect(componentFixture.nativeElement).toHaveText("11");
                  async.done();
                });
              });
            }));
        it(
            "should stabilize after async task in change detection (autoDetectChanges)",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              tcb.createAsync(AsyncChangeComp).then((componentFixture) {
                componentFixture.autoDetectChanges();
                componentFixture.whenStable().then((_) {
                  expect(componentFixture.nativeElement).toHaveText("1");
                  var element = componentFixture.debugElement.children[0];
                  dispatchEvent(element.nativeElement, "click");
                  componentFixture.whenStable().then((_) {
                    expect(componentFixture.nativeElement).toHaveText("11");
                    async.done();
                  });
                });
              });
            }));
        it(
            "should stabilize after async task in change detection(no autoDetectChanges)",
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              tcb.createAsync(AsyncChangeComp).then((componentFixture) {
                componentFixture.detectChanges();
                componentFixture.whenStable().then((_) {
                  // Run detectChanges again so that stabilized value is reflected in the

                  // DOM.
                  componentFixture.detectChanges();
                  expect(componentFixture.nativeElement).toHaveText("1");
                  var element = componentFixture.debugElement.children[0];
                  dispatchEvent(element.nativeElement, "click");
                  componentFixture.detectChanges();
                  componentFixture.whenStable().then((_) {
                    // Run detectChanges again so that stabilized value is reflected in

                    // the DOM.
                    componentFixture.detectChanges();
                    expect(componentFixture.nativeElement).toHaveText("11");
                    async.done();
                  });
                });
              });
            }));
        describe("No NgZone", () {
          beforeEachProviders(
              () => [provide(ComponentFixtureNoNgZone, useValue: true)]);
          it("calling autoDetectChanges raises an error", () {
            inject([TestComponentBuilder, AsyncTestCompleter],
                (TestComponentBuilder tcb, async) {
              tcb.createAsync(ChildComp).then((componentFixture) {
                expect(() {
                  componentFixture.autoDetectChanges();
                }).toThrow(
                    "Cannot call autoDetectChanges when ComponentFixtureNoNgZone is set!!");
                async.done();
              });
            });
          });
          it(
              "should instantiate a component with valid DOM",
              inject([TestComponentBuilder, AsyncTestCompleter],
                  (TestComponentBuilder tcb, async) {
                tcb.createAsync(ChildComp).then((componentFixture) {
                  expect(componentFixture.ngZone).toBeNull();
                  componentFixture.detectChanges();
                  expect(componentFixture.nativeElement)
                      .toHaveText("Original Child");
                  async.done();
                });
              }));
          it(
              "should allow changing members of the component",
              inject([TestComponentBuilder, AsyncTestCompleter],
                  (TestComponentBuilder tcb, async) {
                tcb.createAsync(MyIfComp).then((componentFixture) {
                  componentFixture.detectChanges();
                  expect(componentFixture.nativeElement).toHaveText("MyIf()");
                  componentFixture.componentInstance.showMore = true;
                  componentFixture.detectChanges();
                  expect(componentFixture.nativeElement)
                      .toHaveText("MyIf(More)");
                  async.done();
                });
              }));
        });
        describe("createSync", () {
          it(
              "should create components",
              inject(
                  [ComponentResolver, TestComponentBuilder, AsyncTestCompleter],
                  (ComponentResolver cr, TestComponentBuilder tcb, async) {
                cr.resolveComponent(MyIfComp).then((cmpFactory) {
                  var componentFixture = tcb.createSync(cmpFactory);
                  componentFixture.detectChanges();
                  expect(componentFixture.nativeElement).toHaveText("MyIf()");
                  componentFixture.componentInstance.showMore = true;
                  componentFixture.detectChanges();
                  expect(componentFixture.nativeElement)
                      .toHaveText("MyIf(More)");
                  async.done();
                });
              }));
        });
      });
    }
  });
}
