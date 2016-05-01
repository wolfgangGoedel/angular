library angular2.test.alt_router.recognize_spec;

import "package:angular2/testing_internal.dart"
    show
        ComponentFixture,
        AsyncTestCompleter,
        TestComponentBuilder,
        beforeEach,
        ddescribe,
        xdescribe,
        describe,
        el,
        expect,
        iit,
        inject,
        beforeEachProviders,
        it,
        xit;
import "package:angular2/src/alt_router/recognize.dart" show recognize;
import "package:angular2/alt_router.dart" show Routes, Route;
import "package:angular2/core.dart" show provide, Component, ComponentResolver;
import "package:angular2/src/alt_router/segments.dart"
    show UrlSegment, RouteTree, UrlTree;
import "package:angular2/src/alt_router/router_url_serializer.dart"
    show DefaultRouterUrlSerializer;
import "package:angular2/src/alt_router/constants.dart"
    show DEFAULT_OUTLET_NAME;

main() {
  describe("recognize", () {
    it(
        "should handle position args",
        inject([AsyncTestCompleter, ComponentResolver], (async, resolver) {
          recognize(resolver, ComponentA, tree("b/paramB/c/paramC/d"))
              .then((r) {
            var a = r.root;
            expect(stringifyUrl(a.urlSegments)).toEqual([""]);
            expect(a.type).toBe(ComponentA);
            var b = r.firstChild(r.root);
            expect(stringifyUrl(b.urlSegments)).toEqual(["b", "paramB"]);
            expect(b.type).toBe(ComponentB);
            var c = r.firstChild(r.firstChild(r.root));
            expect(stringifyUrl(c.urlSegments)).toEqual(["c", "paramC"]);
            expect(c.type).toBe(ComponentC);
            var d = r.firstChild(r.firstChild(r.firstChild(r.root)));
            expect(stringifyUrl(d.urlSegments)).toEqual(["d"]);
            expect(d.type).toBe(ComponentD);
            async.done();
          });
        }));
    it(
        "should support empty routes",
        inject([AsyncTestCompleter, ComponentResolver], (async, resolver) {
          recognize(resolver, ComponentA, tree("f")).then((r) {
            var a = r.root;
            expect(stringifyUrl(a.urlSegments)).toEqual([""]);
            expect(a.type).toBe(ComponentA);
            var f = r.firstChild(r.root);
            expect(stringifyUrl(f.urlSegments)).toEqual(["f"]);
            expect(f.type).toBe(ComponentF);
            var d = r.firstChild(r.firstChild(r.root));
            expect(stringifyUrl(d.urlSegments)).toEqual([]);
            expect(d.type).toBe(ComponentD);
            async.done();
          });
        }));
    it(
        "should handle aux routes",
        inject([AsyncTestCompleter, ComponentResolver], (async, resolver) {
          recognize(resolver, ComponentA, tree("b/paramB(/d//right:d)"))
              .then((r) {
            var c = r.children(r.root);
            expect(stringifyUrl(c[0].urlSegments)).toEqual(["b", "paramB"]);
            expect(c[0].outlet).toEqual(DEFAULT_OUTLET_NAME);
            expect(c[0].type).toBe(ComponentB);
            expect(stringifyUrl(c[1].urlSegments)).toEqual(["d"]);
            expect(c[1].outlet).toEqual("aux");
            expect(c[1].type).toBe(ComponentD);
            expect(stringifyUrl(c[2].urlSegments)).toEqual(["d"]);
            expect(c[2].outlet).toEqual("right");
            expect(c[2].type).toBe(ComponentD);
            async.done();
          });
        }));
    it(
        "should error when two segments with the same outlet name",
        inject([AsyncTestCompleter, ComponentResolver], (async, resolver) {
          recognize(resolver, ComponentA, tree("b/paramB(right:d//right:e)"))
              .catchError((e) {
            expect(e.message).toEqual(
                "Two segments cannot have the same outlet name: 'right:d' and 'right:e'.");
            async.done();
          });
        }));
    it(
        "should handle nested aux routes",
        inject([AsyncTestCompleter, ComponentResolver], (async, resolver) {
          recognize(resolver, ComponentA, tree("b/paramB(/d(right:e))"))
              .then((r) {
            var c = r.children(r.root);
            expect(stringifyUrl(c[0].urlSegments)).toEqual(["b", "paramB"]);
            expect(c[0].outlet).toEqual(DEFAULT_OUTLET_NAME);
            expect(c[0].type).toBe(ComponentB);
            expect(stringifyUrl(c[1].urlSegments)).toEqual(["d"]);
            expect(c[1].outlet).toEqual("aux");
            expect(c[1].type).toBe(ComponentD);
            expect(stringifyUrl(c[2].urlSegments)).toEqual(["e"]);
            expect(c[2].outlet).toEqual("right");
            expect(c[2].type).toBe(ComponentE);
            async.done();
          });
        }));
    it(
        "should handle non top-level aux routes",
        inject([AsyncTestCompleter, ComponentResolver], (async, resolver) {
          recognize(resolver, ComponentA, tree("b/paramB/d(e)")).then((r) {
            var c = r.children(r.firstChild(r.root));
            expect(stringifyUrl(c[0].urlSegments)).toEqual(["d"]);
            expect(c[0].outlet).toEqual(DEFAULT_OUTLET_NAME);
            expect(c[0].type).toBe(ComponentD);
            expect(stringifyUrl(c[1].urlSegments)).toEqual(["e"]);
            expect(c[1].outlet).toEqual("aux");
            expect(c[1].type).toBe(ComponentE);
            async.done();
          });
        }));
    it(
        "should handle matrix parameters",
        inject([AsyncTestCompleter, ComponentResolver], (async, resolver) {
          recognize(resolver, ComponentA,
              tree("b/paramB;b1=1;b2=2(/d;d1=1;d2=2)")).then((r) {
            var c = r.children(r.root);
            expect(c[0].parameters)
                .toEqual({"b": "paramB", "b1": "1", "b2": "2"});
            expect(c[1].parameters).toEqual({"d1": "1", "d2": "2"});
            async.done();
          });
        }));
    it(
        "should match a wildcard",
        inject([AsyncTestCompleter, ComponentResolver], (async, resolver) {
          recognize(resolver, ComponentG, tree("a;aa=1/b;bb=2")).then((r) {
            var c = r.children(r.root);
            expect(c.length).toEqual(1);
            expect(stringifyUrl(c[0].urlSegments)).toEqual([]);
            expect(c[0].parameters).toEqual(null);
            async.done();
          });
        }));
    it(
        "should error when no matching routes",
        inject([AsyncTestCompleter, ComponentResolver], (async, resolver) {
          recognize(resolver, ComponentA, tree("invalid")).catchError((e) {
            expect(e.message).toContain("Cannot match any routes");
            async.done();
          });
        }));
    it(
        "should handle no matching routes (too short)",
        inject([AsyncTestCompleter, ComponentResolver], (async, resolver) {
          recognize(resolver, ComponentA, tree("b")).catchError((e) {
            expect(e.message).toContain("Cannot match any routes");
            async.done();
          });
        }));
    it(
        "should error when a component doesn't have @Routes",
        inject([AsyncTestCompleter, ComponentResolver], (async, resolver) {
          recognize(resolver, ComponentA, tree("d/invalid")).catchError((e) {
            expect(e.message).toEqual(
                "Component 'ComponentD' does not have route configuration");
            async.done();
          });
        }));
  });
}

UrlTree tree(String url) {
  return new DefaultRouterUrlSerializer().parse(url);
}

List<String> stringifyUrl(List<UrlSegment> segments) {
  return segments.map((s) => s.segment).toList();
}

@Component(selector: "d", template: "t")
class ComponentD {}

@Component(selector: "e", template: "t")
class ComponentE {}

@Component(selector: "f", template: "t")
@Routes(const [const Route(path: "/", component: ComponentD)])
class ComponentF {}

@Component(selector: "c", template: "t")
@Routes(const [const Route(path: "d", component: ComponentD)])
class ComponentC {}

@Component(selector: "b", template: "t")
@Routes(const [
  const Route(path: "d", component: ComponentD),
  const Route(path: "e", component: ComponentE),
  const Route(path: "c/:c", component: ComponentC)
])
class ComponentB {}

@Component(selector: "g", template: "t")
@Routes(const [
  const Route(path: "d", component: ComponentD),
  const Route(path: "*", component: ComponentE)
])
class ComponentG {}

@Component(selector: "a", template: "t")
@Routes(const [
  const Route(path: "b/:b", component: ComponentB),
  const Route(path: "d", component: ComponentD),
  const Route(path: "e", component: ComponentE),
  const Route(path: "f", component: ComponentF)
])
class ComponentA {}
