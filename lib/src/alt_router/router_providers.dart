library angular2.src.alt_router.router_providers;

import "package:angular2/core.dart" show Provider;
import "router_providers_common.dart" show ROUTER_PROVIDERS_COMMON;
import "package:angular2/src/platform/browser/location/browser_platform_location.dart"
    show BrowserPlatformLocation;
import "package:angular2/platform/common.dart" show PlatformLocation;

const List<dynamic> ROUTER_PROVIDERS = const [
  ROUTER_PROVIDERS_COMMON,
  /*@ts2dart_Provider*/ const Provider(PlatformLocation,
      useClass: BrowserPlatformLocation)
];
