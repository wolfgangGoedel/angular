library angular2.src.alt_router.link;

import "segments.dart"
    show Tree, TreeNode, UrlSegment, RouteSegment, rootNode, UrlTree, RouteTree;
import "package:angular2/src/facade/lang.dart"
    show isBlank, isPresent, isString, isStringMap;
import "package:angular2/src/facade/collection.dart" show ListWrapper;

UrlTree link(RouteSegment segment, RouteTree routeTree, UrlTree urlTree,
    List<dynamic> change) {
  if (identical(change.length, 0)) return urlTree;
  var startingNode;
  var normalizedChange;
  if (isString(change[0]) && change[0].startsWith("./")) {
    normalizedChange = (new List.from(["/", change[0].substring(2)])
      ..addAll(ListWrapper.slice(change, 1)));
    startingNode = _findStartingNode(
        _findUrlSegment(segment, routeTree), rootNode(urlTree));
  } else if (isString(change[0]) &&
      identical(change.length, 1) &&
      change[0] == "/") {
    normalizedChange = change;
    startingNode = rootNode(urlTree);
  } else if (isString(change[0]) && !change[0].startsWith("/")) {
    normalizedChange = (new List.from(["/"])..addAll(change));
    startingNode = _findStartingNode(
        _findUrlSegment(segment, routeTree), rootNode(urlTree));
  } else {
    normalizedChange = (new List.from(["/"])..addAll(change));
    startingNode = rootNode(urlTree);
  }
  var updated = _update(startingNode, normalizedChange);
  var newRoot = _constructNewTree(rootNode(urlTree), startingNode, updated);
  return new UrlTree(newRoot);
}

UrlSegment _findUrlSegment(RouteSegment segment, RouteTree routeTree) {
  var s = segment;
  var res = null;
  while (isBlank(res)) {
    res = ListWrapper.last(s.urlSegments);
    s = routeTree.parent(s);
  }
  return res;
}

TreeNode<UrlSegment> _findStartingNode(
    UrlSegment segment, TreeNode<UrlSegment> node) {
  if (identical(node.value, segment)) return node;
  for (var c in node.children) {
    var r = _findStartingNode(segment, c);
    if (isPresent(r)) return r;
  }
  return null;
}

TreeNode<UrlSegment> _constructNewTree(TreeNode<UrlSegment> node,
    TreeNode<UrlSegment> original, TreeNode<UrlSegment> updated) {
  if (identical(node, original)) {
    return new TreeNode<UrlSegment>(node.value, updated.children);
  } else {
    return new TreeNode<UrlSegment>(
        node.value,
        node.children
            .map((c) => _constructNewTree(c, original, updated))
            .toList());
  }
}

TreeNode<UrlSegment> _update(TreeNode<UrlSegment> node, List<dynamic> changes) {
  var rest = ListWrapper.slice(changes, 1);
  var outlet = _outlet(changes);
  var segment = _segment(changes);
  if (isString(segment) && segment[0] == "/") segment = segment.substring(1);
  // reach the end of the tree => create new tree nodes.
  if (isBlank(node)) {
    var urlSegment = new UrlSegment(segment, null, outlet);
    var children = identical(rest.length, 0) ? [] : [_update(null, rest)];
    return new TreeNode<UrlSegment>(urlSegment, children);
  } else if (outlet != node.value.outlet) {
    return node;
  } else {
    var urlSegment = isStringMap(segment)
        ? new UrlSegment(null, segment, null)
        : new UrlSegment(segment, null, outlet);
    if (identical(rest.length, 0)) {
      return new TreeNode<UrlSegment>(urlSegment, []);
    }
    return new TreeNode<UrlSegment>(
        urlSegment, _updateMany(ListWrapper.clone(node.children), rest));
  }
}

List<TreeNode<UrlSegment>> _updateMany(
    List<TreeNode<UrlSegment>> nodes, List<dynamic> changes) {
  var outlet = _outlet(changes);
  var nodesInRightOutlet =
      nodes.where((c) => c.value.outlet == outlet).toList();
  if (nodesInRightOutlet.length > 0) {
    var nodeRightOutlet = nodesInRightOutlet[0];
    nodes[nodes.indexOf(nodeRightOutlet)] = _update(nodeRightOutlet, changes);
  } else {
    nodes.add(_update(null, changes));
  }
  return nodes;
}

dynamic _segment(List<dynamic> changes) {
  if (!isString(changes[0])) return changes[0];
  var parts = changes[0].toString().split(":");
  return parts.length > 1 ? parts[1] : changes[0];
}

String _outlet(List<dynamic> changes) {
  if (!isString(changes[0])) return null;
  var parts = changes[0].toString().split(":");
  return parts.length > 1 ? parts[0] : null;
}
