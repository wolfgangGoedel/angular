library angular2.test.alt_router.tree_spec;

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
import "package:angular2/src/alt_router/segments.dart" show Tree, TreeNode;

main() {
  describe("tree", () {
    it("should return the root of the tree", () {
      var t = new Tree<dynamic>(new TreeNode<num>(1, []));
      expect(t.root).toEqual(1);
    });
    it("should return the parent of a node", () {
      var t =
          new Tree<dynamic>(new TreeNode<num>(1, [new TreeNode<num>(2, [])]));
      expect(t.parent(1)).toEqual(null);
      expect(t.parent(2)).toEqual(1);
    });
    it("should return the children of a node", () {
      var t =
          new Tree<dynamic>(new TreeNode<num>(1, [new TreeNode<num>(2, [])]));
      expect(t.children(1)).toEqual([2]);
      expect(t.children(2)).toEqual([]);
    });
    it("should return the first child of a node", () {
      var t =
          new Tree<dynamic>(new TreeNode<num>(1, [new TreeNode<num>(2, [])]));
      expect(t.firstChild(1)).toEqual(2);
      expect(t.firstChild(2)).toEqual(null);
    });
    it("should return the path to the root", () {
      var t =
          new Tree<dynamic>(new TreeNode<num>(1, [new TreeNode<num>(2, [])]));
      expect(t.pathFromRoot(2)).toEqual([1, 2]);
    });
  });
}
