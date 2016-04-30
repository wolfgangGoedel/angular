/* @ts2dart_const */
library angular2.src.router.lifecycle.lifecycle_annotations_impl;

class RouteLifecycleHook {
  final String name;
  const RouteLifecycleHook(this.name);
}

/* @ts2dart_const */
class CanActivate {
  final Function fn;
  const CanActivate(this.fn);
}

const RouteLifecycleHook routerCanReuse =
    /*@ts2dart_const*/ const RouteLifecycleHook("routerCanReuse");
const RouteLifecycleHook routerCanDeactivate =
    /*@ts2dart_const*/ const RouteLifecycleHook("routerCanDeactivate");
const RouteLifecycleHook routerOnActivate =
    /*@ts2dart_const*/ const RouteLifecycleHook("routerOnActivate");
const RouteLifecycleHook routerOnReuse =
    /*@ts2dart_const*/ const RouteLifecycleHook("routerOnReuse");
const RouteLifecycleHook routerOnDeactivate =
    /*@ts2dart_const*/ const RouteLifecycleHook("routerOnDeactivate");
