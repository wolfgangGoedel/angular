library angular2.src.alt_router.router_providers_common;

import "package:angular2/core.dart" show Provider;
import "package:angular2/core.dart" show OpaqueToken, ComponentResolver;
import "package:angular2/platform/common.dart"
    show LocationStrategy, PathLocationStrategy, Location;
import "router.dart" show Router, RouterOutletMap;
import "router_url_serializer.dart"
    show RouterUrlSerializer, DefaultRouterUrlSerializer;
import "package:angular2/core.dart" show ApplicationRef;
import "package:angular2/src/facade/exceptions.dart" show BaseException;

const List<dynamic> ROUTER_PROVIDERS_COMMON = const [
  RouterOutletMap,
  /*@ts2dart_Provider*/ const Provider(RouterUrlSerializer,
      useClass: DefaultRouterUrlSerializer),
  /*@ts2dart_Provider*/ const Provider(LocationStrategy,
      useClass: PathLocationStrategy),
  Location,
  /*@ts2dart_Provider*/ const Provider(Router,
      useFactory: routerFactory,
      deps: const [
        ApplicationRef,
        ComponentResolver,
        RouterUrlSerializer,
        RouterOutletMap,
        Location
      ])
];
Router routerFactory(
    ApplicationRef app,
    ComponentResolver componentResolver,
    RouterUrlSerializer urlSerializer,
    RouterOutletMap routerOutletMap,
    Location location) {
  if (app.componentTypes.length == 0) {
    throw new BaseException(
        "Bootstrap at least one component before injecting Router.");
  }
  // TODO: vsavkin this should not be null
  var router = new Router(null, app.componentTypes[0], componentResolver,
      urlSerializer, routerOutletMap, location);
  app.registerDisposeListener(() => router.dispose());
  return router;
}
