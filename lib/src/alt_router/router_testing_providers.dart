library angular2.src.alt_router.router_testing_providers;

import "package:angular2/core.dart" show Provider;
import "package:angular2/src/mock/location_mock.dart" show SpyLocation;
import "package:angular2/platform/common.dart" show Location;
import "router.dart" show Router, RouterOutletMap;
import "router_url_serializer.dart"
    show RouterUrlSerializer, DefaultRouterUrlSerializer;
import "package:angular2/core.dart" show Component, ComponentResolver;

@Component(selector: "fake-app-root-comp", template: '''<span></span>''')
class FakeAppRootCmp {}

Router routerFactory(
    ComponentResolver componentResolver,
    RouterUrlSerializer urlSerializer,
    RouterOutletMap routerOutletMap,
    Location location) {
  return new Router(null, FakeAppRootCmp, componentResolver, urlSerializer,
      routerOutletMap, location);
}

const List<dynamic> ROUTER_FAKE_PROVIDERS = const [
  RouterOutletMap,
  /* @ts2dart_Provider */ const Provider(Location, useClass: SpyLocation),
  /* @ts2dart_Provider */ const Provider(RouterUrlSerializer,
      useClass: DefaultRouterUrlSerializer),
  /* @ts2dart_Provider */ const Provider(Router,
      useFactory: routerFactory,
      deps: const [
        ComponentResolver,
        RouterUrlSerializer,
        RouterOutletMap,
        Location
      ])
];
