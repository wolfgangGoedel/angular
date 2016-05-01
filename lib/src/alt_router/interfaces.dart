library angular2.src.alt_router.interfaces;

import "dart:async";
import "segments.dart" show RouteSegment, Tree, RouteTree;

abstract class OnActivate {
  void routerOnActivate(RouteSegment curr,
      [RouteSegment prev, RouteTree currTree, RouteTree prevTree]);
}

abstract class CanDeactivate {
  Future<bool> routerCanDeactivate([RouteTree currTree, RouteTree futureTree]);
}
