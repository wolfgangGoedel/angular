library angular2.src.alt_router.interfaces;

import "dart:async";
import "segments.dart" show RouteSegment, Tree;

abstract class OnActivate {
  void routerOnActivate(RouteSegment curr,
      [RouteSegment prev,
      Tree<RouteSegment> currTree,
      Tree<RouteSegment> prevTree]);
}

abstract class CanDeactivate {
  Future<bool> routerCanDeactivate(
      [Tree<RouteSegment> currTree, Tree<RouteSegment> futureTree]);
}
