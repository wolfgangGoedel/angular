library angular2.src.alt_router.router;

import "dart:async";
import "package:angular2/core.dart"
    show OnInit, provide, ReflectiveInjector, ComponentResolver;
import "directives/router_outlet.dart" show RouterOutlet;
import "package:angular2/src/facade/lang.dart" show Type, isBlank, isPresent;
import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "package:angular2/src/facade/async.dart"
    show EventEmitter, Stream, PromiseWrapper;
import "package:angular2/src/facade/collection.dart" show StringMapWrapper;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "router_url_serializer.dart" show RouterUrlSerializer;
import "interfaces.dart" show CanDeactivate;
import "recognize.dart" show recognize;
import "package:angular2/platform/common.dart" show Location;
import "link.dart" show link;
import "segments.dart"
    show
        equalSegments,
        routeSegmentComponentFactory,
        RouteSegment,
        Tree,
        rootNode,
        TreeNode,
        UrlSegment,
        serializeRouteSegmentTree;
import "lifecycle_reflector.dart" show hasLifecycleHook;
import "constants.dart" show DEFAULT_OUTLET_NAME;

class RouterOutletMap {
  /** @internal */
  Map<String, RouterOutlet> _outlets = {};
  void registerOutlet(String name, RouterOutlet outlet) {
    this._outlets[name] = outlet;
  }
}

class Router {
  Object _rootComponent;
  Type _rootComponentType;
  ComponentResolver _componentResolver;
  RouterUrlSerializer _urlSerializer;
  RouterOutletMap _routerOutletMap;
  Location _location;
  Tree<RouteSegment> _prevTree;
  Tree<UrlSegment> _urlTree;
  EventEmitter _changes = new EventEmitter();
  Router(this._rootComponent, this._rootComponentType, this._componentResolver,
      this._urlSerializer, this._routerOutletMap, this._location) {
    this.navigateByUrl(this._location.path());
  }
  Tree<UrlSegment> get urlTree {
    return this._urlTree;
  }

  Future navigateByUrl(String url) {
    return this._navigate(this._urlSerializer.parse(url));
  }

  Future navigate(List<dynamic> changes, [RouteSegment segment]) {
    return this._navigate(this.createUrlTree(changes, segment));
  }

  Future _navigate(Tree<UrlSegment> url) {
    this._urlTree = url;
    return recognize(this._componentResolver, this._rootComponentType, url)
        .then((currTree) {
      return new _LoadSegments(currTree, this._prevTree)
          .load(this._routerOutletMap, this._rootComponent)
          .then((_) {
        this._prevTree = currTree;
        this._location.go(this._urlSerializer.serialize(this._urlTree));
        this._changes.emit(null);
      });
    });
  }

  Tree<UrlSegment> createUrlTree(List<dynamic> changes,
      [RouteSegment segment]) {
    if (isPresent(this._prevTree)) {
      var s = isPresent(segment) ? segment : this._prevTree.root;
      return link(s, this._prevTree, this.urlTree, changes);
    } else {
      return null;
    }
  }

  String serializeUrl(Tree<UrlSegment> url) {
    return this._urlSerializer.serialize(url);
  }

  Stream get changes {
    return this._changes;
  }

  Tree<RouteSegment> get routeTree {
    return this._prevTree;
  }
}

class _LoadSegments {
  Tree<RouteSegment> currTree;
  Tree<RouteSegment> prevTree;
  List<List<Object>> deactivations = [];
  bool performMutation = true;
  _LoadSegments(this.currTree, this.prevTree) {}
  Future load(RouterOutletMap parentOutletMap, Object rootComponent) {
    var prevRoot = isPresent(this.prevTree) ? rootNode(this.prevTree) : null;
    var currRoot = rootNode(this.currTree);
    return this
        .canDeactivate(currRoot, prevRoot, parentOutletMap, rootComponent)
        .then((res) {
      this.performMutation = true;
      if (res) {
        this.loadChildSegments(
            currRoot, prevRoot, parentOutletMap, [rootComponent]);
      }
    });
  }

  Future<bool> canDeactivate(
      TreeNode<RouteSegment> currRoot,
      TreeNode<RouteSegment> prevRoot,
      RouterOutletMap outletMap,
      Object rootComponent) {
    this.performMutation = false;
    this.loadChildSegments(currRoot, prevRoot, outletMap, [rootComponent]);
    var allPaths = PromiseWrapper.all(
        this.deactivations.map((r) => this.checkCanDeactivatePath(r)).toList());
    return allPaths.then((List<bool> values) =>
        identical(values.where((v) => v).toList().length, values.length));
  }

  Future<bool> checkCanDeactivatePath(List<Object> path) {
    var curr = PromiseWrapper.resolve(true);
    for (var p in ListWrapper.reversed(path)) {
      curr = curr.then((_) {
        if (hasLifecycleHook("routerCanDeactivate", p)) {
          return ((p as CanDeactivate))
              .routerCanDeactivate(this.prevTree, this.currTree);
        } else {
          return _;
        }
      });
    }
    return curr;
  }

  void loadChildSegments(
      TreeNode<RouteSegment> currNode,
      TreeNode<RouteSegment> prevNode,
      RouterOutletMap outletMap,
      List<Object> components) {
    var prevChildren = isPresent(prevNode)
        ? prevNode.children.fold({}, (m, c) {
            m[c.value.outlet] = c;
            return m;
          })
        : {};
    currNode.children.forEach((c) {
      this.loadSegments(c, prevChildren[c.value.outlet], outletMap, components);
      StringMapWrapper.delete(prevChildren, c.value.outlet);
    });
    StringMapWrapper.forEach(prevChildren,
        (v, k) => this.unloadOutlet(outletMap._outlets[k], components));
  }

  void loadSegments(
      TreeNode<RouteSegment> currNode,
      TreeNode<RouteSegment> prevNode,
      RouterOutletMap parentOutletMap,
      List<Object> components) {
    var curr = currNode.value;
    var prev = isPresent(prevNode) ? prevNode.value : null;
    var outlet = this.getOutlet(parentOutletMap, currNode.value);
    if (equalSegments(curr, prev)) {
      this.loadChildSegments(currNode, prevNode, outlet.outletMap,
          (new List.from(components)..addAll([outlet.loadedComponent])));
    } else {
      this.unloadOutlet(outlet, components);
      if (this.performMutation) {
        var outletMap = new RouterOutletMap();
        var loadedComponent =
            this.loadNewSegment(outletMap, curr, prev, outlet);
        this.loadChildSegments(currNode, prevNode, outletMap,
            (new List.from(components)..addAll([loadedComponent])));
      }
    }
  }

  Object loadNewSegment(RouterOutletMap outletMap, RouteSegment curr,
      RouteSegment prev, RouterOutlet outlet) {
    var resolved = ReflectiveInjector.resolve([
      provide(RouterOutletMap, useValue: outletMap),
      provide(RouteSegment, useValue: curr)
    ]);
    var ref =
        outlet.load(routeSegmentComponentFactory(curr), resolved, outletMap);
    if (hasLifecycleHook("routerOnActivate", ref.instance)) {
      ref.instance.routerOnActivate(curr, prev, this.currTree, this.prevTree);
    }
    return ref.instance;
  }

  RouterOutlet getOutlet(RouterOutletMap outletMap, RouteSegment segment) {
    var outlet = outletMap._outlets[segment.outlet];
    if (isBlank(outlet)) {
      if (segment.outlet == DEFAULT_OUTLET_NAME) {
        throw new BaseException('''Cannot find default outlet''');
      } else {
        throw new BaseException(
            '''Cannot find the outlet ${ segment . outlet}''');
      }
    }
    return outlet;
  }

  void unloadOutlet(RouterOutlet outlet, List<Object> components) {
    if (outlet.isLoaded) {
      StringMapWrapper.forEach(outlet.outletMap._outlets,
          (v, k) => this.unloadOutlet(v, components));
      if (this.performMutation) {
        outlet.unload();
      } else {
        this
            .deactivations
            .add((new List.from(components)..addAll([outlet.loadedComponent])));
      }
    }
  }
}
