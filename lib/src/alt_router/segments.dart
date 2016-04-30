library angular2.src.alt_router.segments;

import "package:angular2/core.dart" show ComponentFactory;
import "package:angular2/src/facade/collection.dart"
    show StringMapWrapper, ListWrapper;
import "package:angular2/src/facade/lang.dart"
    show Type, isBlank, isPresent, stringify;

class Tree<T> {
  /** @internal */
  TreeNode<T> _root;
  Tree(TreeNode<T> root) {
    this._root = root;
  }
  T get root {
    return this._root.value;
  }

  T parent(T t) {
    var p = this.pathFromRoot(t);
    return p.length > 1 ? p[p.length - 2] : null;
  }

  List<T> children(T t) {
    var n = _findNode(t, this._root);
    return isPresent(n) ? n.children.map((t) => t.value).toList() : null;
  }

  T firstChild(T t) {
    var n = _findNode(t, this._root);
    return isPresent(n) && n.children.length > 0 ? n.children[0].value : null;
  }

  List<T> pathFromRoot(T t) {
    return _findPath(t, this._root, []).map((s) => s.value).toList();
  }
}

TreeNode<dynamic/*= T */ > rootNode/*< T >*/(Tree<dynamic/*= T */ > tree) {
  return tree._root;
}

TreeNode<dynamic/*= T */ > _findNode/*< T >*/(
    dynamic/*= T */ expected, TreeNode<dynamic/*= T */ > c) {
  // TODO: vsavkin remove it once recognize is fixed
  if (expected is RouteSegment &&
      equalSegments((expected as dynamic), (c.value as dynamic))) return c;
  if (identical(expected, c.value)) return c;
  for (var cc in c.children) {
    var r = _findNode(expected, cc);
    if (isPresent(r)) return r;
  }
  return null;
}

List<TreeNode<dynamic/*= T */ >> _findPath/*< T >*/(dynamic/*= T */ expected,
    TreeNode<dynamic/*= T */ > c, List<TreeNode<dynamic/*= T */ >> collected) {
  collected.add(c);
  // TODO: vsavkin remove it once recognize is fixed
  if (expected is RouteSegment &&
      equalSegments((expected as dynamic), (c.value as dynamic)))
    return collected;
  if (identical(expected, c.value)) return collected;
  for (var cc in c.children) {
    var r = _findPath(expected, cc, ListWrapper.clone(collected));
    if (isPresent(r)) return r;
  }
  return null;
}

class TreeNode<T> {
  T value;
  List<TreeNode<T>> children;
  TreeNode(this.value, this.children) {}
}

class UrlSegment {
  dynamic segment;
  Map<String, String> parameters;
  String outlet;
  UrlSegment(this.segment, this.parameters, this.outlet) {}
  String toString() {
    var outletPrefix = isBlank(this.outlet) ? "" : '''${ this . outlet}:''';
    var segmentPrefix = isBlank(this.segment) ? "" : this.segment;
    return '''${ outletPrefix}${ segmentPrefix}${ _serializeParams ( this . parameters )}''';
  }
}

String _serializeParams(Map<String, String> params) {
  var res = "";
  if (isPresent(params)) {
    StringMapWrapper.forEach(params, (v, k) => res += ''';${ k}=${ v}''');
  }
  return res;
}

class RouteSegment {
  List<UrlSegment> urlSegments;
  Map<String, String> parameters;
  String outlet;
  /** @internal */
  Type _type;
  /** @internal */
  ComponentFactory<dynamic> _componentFactory;
  RouteSegment(this.urlSegments, this.parameters, this.outlet, Type type,
      ComponentFactory<dynamic> componentFactory) {
    this._type = type;
    this._componentFactory = componentFactory;
  }
  String getParam(String param) {
    return isPresent(this.parameters) ? this.parameters[param] : null;
  }

  Type get type {
    return this._type;
  }

  String get stringifiedUrlSegments {
    return this.urlSegments.map((s) => s.toString()).toList().join("/");
  }
}

String serializeRouteSegmentTree(Tree<RouteSegment> tree) {
  return _serializeRouteSegmentTree(tree._root);
}

String _serializeRouteSegmentTree(TreeNode<RouteSegment> node) {
  var v = node.value;
  var children = node.children
      .map((c) => _serializeRouteSegmentTree(c))
      .toList()
      .join(", ");
  return '''${ v . outlet}:${ v . stringifiedUrlSegments}(${ stringify ( v . type )}) [${ children}]''';
}

bool equalSegments(RouteSegment a, RouteSegment b) {
  if (isBlank(a) && !isBlank(b)) return false;
  if (!isBlank(a) && isBlank(b)) return false;
  if (!identical(a._type, b._type)) return false;
  if (isBlank(a.parameters) && !isBlank(b.parameters)) return false;
  if (!isBlank(a.parameters) && isBlank(b.parameters)) return false;
  if (isBlank(a.parameters) && isBlank(b.parameters)) return true;
  return StringMapWrapper.equals(a.parameters, b.parameters);
}

ComponentFactory<dynamic> routeSegmentComponentFactory(RouteSegment a) {
  return a._componentFactory;
}
