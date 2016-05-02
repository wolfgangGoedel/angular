library angular2.src.alt_router.directives.router_link;

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
        OnInit,
        HostListener,
        HostBinding,
        Input,
        OnDestroy,
        Optional;
import "../router.dart" show RouterOutletMap, Router;
import "../segments.dart" show RouteSegment, UrlSegment, Tree;
import "package:angular2/src/facade/lang.dart" show isString, isPresent;
import "package:angular2/src/facade/async.dart" show ObservableWrapper;

@Directive(selector: "[routerLink]")
class RouterLink implements OnDestroy {
  RouteSegment _routeSegment;
  Router _router;
  @Input()
  String target;
  List<dynamic> _changes = [];
  dynamic _subscription;
  @HostBinding()
  String href;
  @HostBinding("class.router-link-active")
  bool isActive = false;
  RouterLink(@Optional() this._routeSegment, this._router) {
    this._subscription = ObservableWrapper.subscribe(_router.changes, (_) {
      this._updateTargetUrlAndHref();
    });
  }
  ngOnDestroy() {
    ObservableWrapper.dispose(this._subscription);
  }

  @Input()
  set routerLink(List<dynamic> data) {
    this._changes = data;
    this._updateTargetUrlAndHref();
  }

  @HostListener("click")
  bool onClick() {
    if (!isString(this.target) || this.target == "_self") {
      this._router.navigate(this._changes, this._routeSegment);
      return false;
    }
    return true;
  }

  void _updateTargetUrlAndHref() {
    var tree = this._router.createUrlTree(this._changes, this._routeSegment);
    if (isPresent(tree)) {
      this.href = this._router.serializeUrl(tree);
      this.isActive = this._router.urlTree.contains(tree);
    } else {
      this.isActive = false;
    }
  }
}
