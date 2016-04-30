library angular2.src.alt_router.directives.router_outlet;

import "package:angular2/core.dart"
    show
        ResolvedReflectiveProvider,
        Directive,
        DynamicComponentLoader,
        ViewContainerRef,
        Attribute,
        ComponentRef,
        ComponentFactory,
        ReflectiveInjector,
        OnInit;
import "../router.dart" show RouterOutletMap;
import "../constants.dart" show DEFAULT_OUTLET_NAME;
import "package:angular2/src/facade/lang.dart" show isPresent, isBlank;

@Directive(selector: "router-outlet")
class RouterOutlet {
  ViewContainerRef _location;
  ComponentRef<dynamic> _loaded;
  RouterOutletMap outletMap;
  RouterOutlet(RouterOutletMap parentOutletMap, this._location,
      @Attribute("name") String name) {
    parentOutletMap.registerOutlet(
        isBlank(name) ? DEFAULT_OUTLET_NAME : name, this);
  }
  void unload() {
    this._loaded.destroy();
    this._loaded = null;
  }

  Object get loadedComponent {
    return isPresent(this._loaded) ? this._loaded.instance : null;
  }

  bool get isLoaded {
    return isPresent(this._loaded);
  }

  ComponentRef<dynamic> load(ComponentFactory<dynamic> factory,
      List<ResolvedReflectiveProvider> providers, RouterOutletMap outletMap) {
    this.outletMap = outletMap;
    var inj = ReflectiveInjector.fromResolvedProviders(
        providers, this._location.parentInjector);
    this._loaded =
        this._location.createComponent(factory, this._location.length, inj, []);
    return this._loaded;
  }
}
