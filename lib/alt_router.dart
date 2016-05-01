/**
 * 
 * 
 * Alternative implementation of the router. Experimental.
 */
library angular2.alt_router;

export "src/alt_router/router.dart" show Router, RouterOutletMap;
export "src/alt_router/segments.dart"
    show RouteSegment, UrlSegment, Tree, UrlTree, RouteTree;
export "src/alt_router/metadata/decorators.dart" show Routes;
export "src/alt_router/metadata/metadata.dart" show Route;
export "src/alt_router/router_url_serializer.dart"
    show RouterUrlSerializer, DefaultRouterUrlSerializer;
export "src/alt_router/interfaces.dart" show OnActivate, CanDeactivate;
export "src/alt_router/router_providers.dart" show ROUTER_PROVIDERS;
import "src/alt_router/directives/router_outlet.dart" show RouterOutlet;
import "src/alt_router/directives/router_link.dart" show RouterLink;

const List<dynamic> ROUTER_DIRECTIVES = const [RouterOutlet, RouterLink];
