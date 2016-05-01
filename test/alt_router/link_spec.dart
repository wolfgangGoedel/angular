library angular2.test.alt_router.link_spec;

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
import "package:angular2/src/alt_router/segments.dart"
    show RouteSegment, UrlSegment, UrlTree, TreeNode, RouteTree;
import "package:angular2/src/alt_router/link.dart" show link;
import "package:angular2/src/alt_router/router_url_serializer.dart"
    show DefaultRouterUrlSerializer;

main() {
  describe("link", () {
    var parser = new DefaultRouterUrlSerializer();
    it("should return the original tree when given an empty array", () {
      var p = parser.parse("/");
      var tree = s(p.root);
      var t = link(tree.root, tree, p, []);
      expect(t).toBe(p);
    });
    it("should support going to root", () {
      var p = parser.parse("/");
      var tree = s(p.root);
      var t = link(tree.root, tree, p, ["/"]);
      expect(parser.serialize(t)).toEqual("");
    });
    it("should support positional params", () {
      var p = parser.parse("/a/b");
      var tree = s(p.firstChild(p.root));
      var t = link(tree.root, tree, p, ["/one", 11, "two", 22]);
      expect(parser.serialize(t)).toEqual("/one/11/two/22");
    });
    it("should preserve route siblings when changing the main route", () {
      var p = parser.parse("/a/11/b(c)");
      var tree = s(p.root);
      var t = link(tree.root, tree, p, ["/a", 11, "d"]);
      expect(parser.serialize(t)).toEqual("/a/11/d(aux:c)");
    });
    it("should preserve route siblings when changing a aux route", () {
      var p = parser.parse("/a/11/b(c)");
      var tree = s(p.root);
      var t = link(tree.root, tree, p, ["/a", 11, "aux:d"]);
      expect(parser.serialize(t)).toEqual("/a/11/b(aux:d)");
    });
    it("should update parameters", () {
      var p = parser.parse("/a;aa=11");
      var tree = s(p.root);
      var t = link(tree.root, tree, p, [
        "/a",
        {"aa": 22, "bb": 33}
      ]);
      expect(parser.serialize(t)).toEqual("/a;aa=22;bb=33");
    });
    it("should update relative subtree (when starts with ./)", () {
      var p = parser.parse("/a(ap)/c(cp)");
      var c = p.firstChild(p.root);
      var tree = s(c);
      var t = link(tree.root, tree, p, ["./c2"]);
      expect(parser.serialize(t)).toEqual("/a(aux:ap)/c2(aux:cp)");
    });
    it("should update relative subtree (when does not start with ./)", () {
      var p = parser.parse("/a(ap)/c(cp)");
      var c = p.firstChild(p.root);
      var tree = s(c);
      var t = link(tree.root, tree, p, ["c2"]);
      expect(parser.serialize(t)).toEqual("/a(aux:ap)/c2(aux:cp)");
    });
    it("should update relative subtree when the provided segment doesn't have url segments",
        () {
      var p = parser.parse("/a(ap)/c(cp)");
      var c = p.firstChild(p.root);
      var child = new RouteSegment([], null, null, null, null);
      var root = new TreeNode<RouteSegment>(
          new RouteSegment([c], {}, null, null, null),
          [new TreeNode<RouteSegment>(child, [])]);
      var tree = new RouteTree(root);
      var t = link(child, tree, p, ["./c2"]);
      expect(parser.serialize(t)).toEqual("/a(aux:ap)/c2(aux:cp)");
    });
  });
}

RouteTree s(UrlSegment u) {
  var root = new TreeNode<RouteSegment>(
      new RouteSegment([u], {}, null, null, null), []);
  return new RouteTree(root);
}
