library angular2.test.router.integration.comp_factory_router_spec;

import "dart:async";
import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        beforeEachProviders,
        expect,
        iit,
        flushMicrotasks,
        inject,
        it,
        TestComponentBuilder,
        ComponentFixture,
        xit,
        describe,
        ddescribe;
import "package:angular2/src/facade/async.dart" show PromiseWrapper;
import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "package:angular2/core.dart"
    show ComponentResolver, ComponentFactory, Component;
import "package:angular2/router.dart"
    show
        Router,
        Route,
        RouterOutlet,
        RouteConfig,
        OnActivate,
        ComponentInstruction;
import "util.dart" show TEST_ROUTER_PROVIDERS, compile;
import "package:angular2/src/router/route_config/route_config_impl.dart"
    as route_config_impl;

main() {
  describe("Router with ComponentFactories", () {
    ComponentFixture fixture;
    TestComponentBuilder tcb;
    Router rtr;
    ComponentResolver cr;
    beforeEachProviders(() => TEST_ROUTER_PROVIDERS);
    beforeEach(inject([TestComponentBuilder, Router, ComponentResolver],
        (tcBuilder, router, componentResolver) {
      tcb = tcBuilder;
      rtr = router;
      cr = componentResolver;
      log = [];
    }));
    ComponentFactory resolveCompFactoryRecursive(
        dynamic cmp, Map<dynamic, ComponentFactory> cmpFactories) {
      var cmpFactory = cmpFactories[cmp];
      var newMeta = cmpFactory.metadata.map((meta) {
        if (meta is route_config_impl.RouteConfig) {
          List<dynamic> configs = meta.configs;
          meta = new route_config_impl.RouteConfig(configs
              .map((route) => new Route(
                  path: route.path,
                  component: resolveCompFactoryRecursive(
                      route.component, cmpFactories)))
              .toList());
        }
        return meta;
      }).toList();
      return ComponentFactory.cloneWithMetadata(cmpFactory, newMeta);
    }
    Future<ComponentFactory> init(dynamic mainComp) {
      return PromiseWrapper
          .all(ALL_COMPONENTS.map((cmp) => cr.resolveComponent(cmp)).toList())
          .then((cmpFactories) {
        var cmpFactoriesMap = new Map<dynamic, ComponentFactory>();
        ListWrapper.forEachWithIndex(ALL_COMPONENTS, (cmp, index) {
          cmpFactoriesMap[cmp] = cmpFactories[index];
        });
        return resolveCompFactoryRecursive(mainComp, cmpFactoriesMap);
      });
    }
    it(
        "should support routing to a ComponentFactory",
        inject([AsyncTestCompleter], (async) {
          compile(tcb)
              .then((rtc) {
                fixture = rtc;
                return init(MainCmp);
              })
              .then((mainCmpFactory) => rtr
                  .config([new Route(path: "/...", component: mainCmpFactory)]))
              .then((_) => rtr.navigateByUrl("/hello"))
              .then((_) {
                fixture.detectChanges();
                expect(fixture.debugElement.nativeElement).toHaveText("hello");
                async.done();
              });
        }));
    it(
        "should call the routerOnActivate hook",
        inject([AsyncTestCompleter], (async) {
          compile(tcb)
              .then((rtc) {
                fixture = rtc;
                return init(MainCmp);
              })
              .then((mainCmpFactory) => rtr
                  .config([new Route(path: "/...", component: mainCmpFactory)]))
              .then((_) => rtr.navigateByUrl("/on-activate"))
              .then((_) {
                fixture.detectChanges();
                expect(fixture.debugElement.nativeElement)
                    .toHaveText("activate cmp");
                expect(log.length).toBe(1);
                expect(log[0][0]).toEqual("activate");
                expect(log[0][1].componentType)
                    .toBeAnInstanceOf(ComponentFactory);
                expect(log[0][1].componentType.componentType).toBe(ActivateCmp);
                async.done();
              });
        }));
  });
}

List<dynamic> log;

@Component(selector: "activate-cmp", template: "activate cmp")
class ActivateCmp implements OnActivate {
  routerOnActivate(ComponentInstruction next, ComponentInstruction prev) {
    log.add(["activate", next, prev]);
  }
}

@Component(selector: "hello-cmp", template: "hello")
class HelloCmp {}

@Component(
    selector: "lifecycle-cmp",
    template: '''<router-outlet></router-outlet>''',
    directives: const [RouterOutlet])
@RouteConfig(const [
  const Route(path: "/hello", component: HelloCmp),
  const Route(path: "/on-activate", component: ActivateCmp)
])
class MainCmp {}

var ALL_COMPONENTS = [MainCmp, ActivateCmp, HelloCmp];
