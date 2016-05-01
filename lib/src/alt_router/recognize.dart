library angular2.src.alt_router.recognize;

import "dart:async";
import "segments.dart"
    show RouteSegment, UrlSegment, Tree, TreeNode, rootNode, UrlTree, RouteTree;
import "metadata/metadata.dart" show RoutesMetadata, RouteMetadata;
import "package:angular2/src/facade/lang.dart"
    show Type, isBlank, isPresent, stringify;
import "package:angular2/src/facade/collection.dart"
    show ListWrapper, StringMapWrapper;
import "package:angular2/src/facade/promise.dart" show PromiseWrapper;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/core.dart" show ComponentResolver;
import "constants.dart" show DEFAULT_OUTLET_NAME;
import "package:angular2/src/core/reflection/reflection.dart" show reflector;

// TODO: vsavkin: recognize should take the old tree and merge it
Future<RouteTree> recognize(
    ComponentResolver componentResolver, Type type, UrlTree url) {
  var matched =
      new _MatchResult(type, [url.root], null, rootNode(url).children, []);
  return _constructSegment(componentResolver, matched)
      .then((roots) => new RouteTree(roots[0]));
}

Future<List<TreeNode<RouteSegment>>> _recognize(
    ComponentResolver componentResolver,
    Type parentType,
    TreeNode<UrlSegment> url) {
  var metadata = _readMetadata(parentType);
  if (isBlank(metadata)) {
    throw new BaseException(
        '''Component \'${ stringify ( parentType )}\' does not have route configuration''');
  }
  var match;
  try {
    match = _match(metadata, url);
  } catch (e, e_stack) {
    return PromiseWrapper.reject(e, null);
  }
  var main = _constructSegment(componentResolver, match);
  var aux = _recognizeMany(componentResolver, parentType, match.aux)
      .then(_checkOutletNameUniqueness);
  return PromiseWrapper.all([main, aux]).then(ListWrapper.flatten);
}

Future<List<TreeNode<RouteSegment>>> _recognizeMany(
    ComponentResolver componentResolver,
    Type parentType,
    List<TreeNode<UrlSegment>> urls) {
  var recognized =
      urls.map((u) => _recognize(componentResolver, parentType, u)).toList();
  return PromiseWrapper.all(recognized).then(ListWrapper.flatten);
}

Future<List<TreeNode<RouteSegment>>> _constructSegment(
    ComponentResolver componentResolver, _MatchResult matched) {
  return componentResolver.resolveComponent(matched.component).then((factory) {
    var urlOutlet = identical(matched.consumedUrlSegments.length, 0) ||
            isBlank(matched.consumedUrlSegments[0].outlet)
        ? DEFAULT_OUTLET_NAME
        : matched.consumedUrlSegments[0].outlet;
    var segment = new RouteSegment(matched.consumedUrlSegments,
        matched.parameters, urlOutlet, matched.component, factory);
    if (matched.leftOverUrl.length > 0) {
      return _recognizeMany(
              componentResolver, matched.component, matched.leftOverUrl)
          .then((children) => [new TreeNode<RouteSegment>(segment, children)]);
    } else {
      return _recognizeLeftOvers(componentResolver, matched.component)
          .then((children) => [new TreeNode<RouteSegment>(segment, children)]);
    }
  });
}

Future<List<TreeNode<RouteSegment>>> _recognizeLeftOvers(
    ComponentResolver componentResolver, Type parentType) {
  return componentResolver.resolveComponent(parentType).then((factory) {
    var metadata = _readMetadata(parentType);
    if (isBlank(metadata)) {
      return [];
    }
    var r = ((metadata.routes as List<dynamic>))
        .where((r) => r.path == "" || r.path == "/")
        .toList();
    if (identical(r.length, 0)) {
      return PromiseWrapper.resolve([]);
    } else {
      return _recognizeLeftOvers(componentResolver, r[0].component)
          .then((children) {
        return componentResolver
            .resolveComponent(r[0].component)
            .then((factory) {
          var segment = new RouteSegment(
              [], null, DEFAULT_OUTLET_NAME, r[0].component, factory);
          return [new TreeNode<RouteSegment>(segment, children)];
        });
      });
    }
  });
}

_MatchResult _match(RoutesMetadata metadata, TreeNode<UrlSegment> url) {
  for (var r in metadata.routes) {
    var matchingResult = _matchWithParts(r, url);
    if (isPresent(matchingResult)) {
      return matchingResult;
    }
  }
  var availableRoutes =
      metadata.routes.map((r) => '''\'${ r . path}\'''').toList().join(", ");
  throw new BaseException(
      '''Cannot match any routes. Current segment: \'${ url . value}\'. Available routes: [${ availableRoutes}].''');
}

_MatchResult _matchWithParts(RouteMetadata route, TreeNode<UrlSegment> url) {
  var path = route.path.startsWith("/") ? route.path.substring(1) : route.path;
  if (path == "*") {
    return new _MatchResult(route.component, [], null, [], []);
  }
  var parts = path.split("/");
  var positionalParams = {};
  var consumedUrlSegments = [];
  TreeNode<UrlSegment> lastParent = null;
  TreeNode<UrlSegment> lastSegment = null;
  var current = url;
  for (var i = 0; i < parts.length; ++i) {
    if (isBlank(current)) return null;
    var p = parts[i];
    var isLastSegment = identical(i, parts.length - 1);
    var isLastParent = identical(i, parts.length - 2);
    var isPosParam = p.startsWith(":");
    if (!isPosParam && p != current.value.segment) return null;
    if (isLastSegment) {
      lastSegment = current;
    }
    if (isLastParent) {
      lastParent = current;
    }
    if (isPosParam) {
      positionalParams[p.substring(1)] = current.value.segment;
    }
    consumedUrlSegments.add(current.value);
    current = ListWrapper.first(current.children);
  }
  if (isPresent(current) && isBlank(current.value.segment)) {
    lastParent = lastSegment;
    lastSegment = current;
  }
  var p = lastSegment.value.parameters;
  var parameters = (StringMapWrapper.merge(
      isBlank(p) ? {} : p, positionalParams) as Map<String, String>);
  var axuUrlSubtrees =
      isPresent(lastParent) ? ListWrapper.slice(lastParent.children, 1) : [];
  return new _MatchResult(route.component, consumedUrlSegments, parameters,
      lastSegment.children, axuUrlSubtrees);
}

List<TreeNode<RouteSegment>> _checkOutletNameUniqueness(
    List<TreeNode<RouteSegment>> nodes) {
  var names = {};
  nodes.forEach((n) {
    var segmentWithSameOutletName = names[n.value.outlet];
    if (isPresent(segmentWithSameOutletName)) {
      var p = segmentWithSameOutletName.stringifiedUrlSegments;
      var c = n.value.stringifiedUrlSegments;
      throw new BaseException(
          '''Two segments cannot have the same outlet name: \'${ p}\' and \'${ c}\'.''');
    }
    names[n.value.outlet] = n.value;
  });
  return nodes;
}

class _MatchResult {
  Type component;
  List<UrlSegment> consumedUrlSegments;
  Map<String, String> parameters;
  List<TreeNode<UrlSegment>> leftOverUrl;
  List<TreeNode<UrlSegment>> aux;
  _MatchResult(this.component, this.consumedUrlSegments, this.parameters,
      this.leftOverUrl, this.aux) {}
}

_readMetadata(Type componentType) {
  var metadata = reflector
      .annotations(componentType)
      .where((f) => f is RoutesMetadata)
      .toList();
  return ListWrapper.first(metadata);
}
