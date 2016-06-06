'use strict';"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var core_1 = require('angular2/core');
var routerMod = require('../router');
var instruction_1 = require('../instruction');
var hookMod = require('../lifecycle/lifecycle_annotations');
var route_lifecycle_reflector_1 = require('../lifecycle/route_lifecycle_reflector');
var _resolveToTrue = async_1.PromiseWrapper.resolve(true);
/**
 * A router outlet is a placeholder that Angular dynamically fills based on the application's route.
 *
 * ## Use
 *
 * ```
 * <router-outlet></router-outlet>
 * ```
 */
var RouterOutlet = (function () {
    function RouterOutlet(_viewContainerRef, _loader, _parentRouter, nameAttr) {
        this._viewContainerRef = _viewContainerRef;
        this._loader = _loader;
        this._parentRouter = _parentRouter;
        this.name = null;
        this._componentRef = null;
        this._currentInstruction = null;
        this.activateEvents = new async_1.EventEmitter();
        if (lang_1.isPresent(nameAttr)) {
            this.name = nameAttr;
            this._parentRouter.registerAuxOutlet(this);
        }
        else {
            this._parentRouter.registerPrimaryOutlet(this);
        }
    }
    /**
     * Called by the Router to instantiate a new component during the commit phase of a navigation.
     * This method in turn is responsible for calling the `routerOnActivate` hook of its child.
     */
    RouterOutlet.prototype.activate = function (nextInstruction) {
        var _this = this;
        var previousInstruction = this._currentInstruction;
        this._currentInstruction = nextInstruction;
        var componentType = nextInstruction.componentType;
        var childRouter = this._parentRouter.childRouter(componentType);
        var providers = core_1.Injector.resolve([
            core_1.provide(instruction_1.RouteData, { useValue: nextInstruction.routeData }),
            core_1.provide(instruction_1.RouteParams, { useValue: new instruction_1.RouteParams(nextInstruction.params) }),
            core_1.provide(routerMod.Router, { useValue: childRouter })
        ]);
        this._componentRef =
            this._loader.loadNextToLocation(componentType, this._viewContainerRef, providers);
        return this._componentRef.then(function (componentRef) {
            _this.activateEvents.emit(componentRef.instance);
            if (route_lifecycle_reflector_1.hasLifecycleHook(hookMod.routerOnActivate, componentType)) {
                return componentRef.instance
                    .routerOnActivate(nextInstruction, previousInstruction);
            }
            else {
                return componentRef;
            }
        });
    };
    /**
     * Called by the {@link Router} during the commit phase of a navigation when an outlet
     * reuses a component between different routes.
     * This method in turn is responsible for calling the `routerOnReuse` hook of its child.
     */
    RouterOutlet.prototype.reuse = function (nextInstruction) {
        var previousInstruction = this._currentInstruction;
        this._currentInstruction = nextInstruction;
        // it's possible the component is removed before it can be reactivated (if nested withing
        // another dynamically loaded component, for instance). In that case, we simply activate
        // a new one.
        if (lang_1.isBlank(this._componentRef)) {
            return this.activate(nextInstruction);
        }
        else {
            return async_1.PromiseWrapper.resolve(route_lifecycle_reflector_1.hasLifecycleHook(hookMod.routerOnReuse, this._currentInstruction.componentType) ?
                this._componentRef.then(function (ref) {
                    return ref.instance.routerOnReuse(nextInstruction, previousInstruction);
                }) :
                true);
        }
    };
    /**
     * Called by the {@link Router} when an outlet disposes of a component's contents.
     * This method in turn is responsible for calling the `routerOnDeactivate` hook of its child.
     */
    RouterOutlet.prototype.deactivate = function (nextInstruction) {
        var _this = this;
        var next = _resolveToTrue;
        if (lang_1.isPresent(this._componentRef) && lang_1.isPresent(this._currentInstruction) &&
            route_lifecycle_reflector_1.hasLifecycleHook(hookMod.routerOnDeactivate, this._currentInstruction.componentType)) {
            next = this._componentRef.then(function (ref) {
                return ref.instance
                    .routerOnDeactivate(nextInstruction, _this._currentInstruction);
            });
        }
        return next.then(function (_) {
            if (lang_1.isPresent(_this._componentRef)) {
                var onDispose = _this._componentRef.then(function (ref) { return ref.destroy(); });
                _this._componentRef = null;
                return onDispose;
            }
        });
    };
    /**
     * Called by the {@link Router} during recognition phase of a navigation.
     *
     * If this resolves to `false`, the given navigation is cancelled.
     *
     * This method delegates to the child component's `routerCanDeactivate` hook if it exists,
     * and otherwise resolves to true.
     */
    RouterOutlet.prototype.routerCanDeactivate = function (nextInstruction) {
        var _this = this;
        if (lang_1.isBlank(this._currentInstruction)) {
            return _resolveToTrue;
        }
        if (route_lifecycle_reflector_1.hasLifecycleHook(hookMod.routerCanDeactivate, this._currentInstruction.componentType)) {
            return this._componentRef.then(function (ref) {
                return ref.instance
                    .routerCanDeactivate(nextInstruction, _this._currentInstruction);
            });
        }
        else {
            return _resolveToTrue;
        }
    };
    /**
     * Called by the {@link Router} during recognition phase of a navigation.
     *
     * If the new child component has a different Type than the existing child component,
     * this will resolve to `false`. You can't reuse an old component when the new component
     * is of a different Type.
     *
     * Otherwise, this method delegates to the child component's `routerCanReuse` hook if it exists,
     * or resolves to true if the hook is not present.
     */
    RouterOutlet.prototype.routerCanReuse = function (nextInstruction) {
        var _this = this;
        var result;
        if (lang_1.isBlank(this._currentInstruction) ||
            this._currentInstruction.componentType != nextInstruction.componentType) {
            result = false;
        }
        else if (route_lifecycle_reflector_1.hasLifecycleHook(hookMod.routerCanReuse, this._currentInstruction.componentType)) {
            result = this._componentRef.then(function (ref) {
                return ref.instance.routerCanReuse(nextInstruction, _this._currentInstruction);
            });
        }
        else {
            result = nextInstruction == this._currentInstruction ||
                (lang_1.isPresent(nextInstruction.params) && lang_1.isPresent(this._currentInstruction.params) &&
                    collection_1.StringMapWrapper.equals(nextInstruction.params, this._currentInstruction.params));
        }
        return async_1.PromiseWrapper.resolve(result);
    };
    RouterOutlet.prototype.ngOnDestroy = function () { this._parentRouter.unregisterPrimaryOutlet(this); };
    __decorate([
        core_1.Output('activate'), 
        __metadata('design:type', Object)
    ], RouterOutlet.prototype, "activateEvents", void 0);
    RouterOutlet = __decorate([
        core_1.Directive({ selector: 'router-outlet' }),
        __param(3, core_1.Attribute('name')), 
        __metadata('design:paramtypes', [core_1.ViewContainerRef, core_1.DynamicComponentLoader, routerMod.Router, String])
    ], RouterOutlet);
    return RouterOutlet;
}());
exports.RouterOutlet = RouterOutlet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtSzlLQTNhblQudG1wL2FuZ3VsYXIyL3NyYy9yb3V0ZXIvZGlyZWN0aXZlcy9yb3V0ZXJfb3V0bGV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSxzQkFBMkMsMkJBQTJCLENBQUMsQ0FBQTtBQUN2RSwyQkFBK0IsZ0NBQWdDLENBQUMsQ0FBQTtBQUNoRSxxQkFBaUMsMEJBQTBCLENBQUMsQ0FBQTtBQUU1RCxxQkFXTyxlQUFlLENBQUMsQ0FBQTtBQUV2QixJQUFZLFNBQVMsV0FBTSxXQUFXLENBQUMsQ0FBQTtBQUN2Qyw0QkFBMkQsZ0JBQWdCLENBQUMsQ0FBQTtBQUM1RSxJQUFZLE9BQU8sV0FBTSxvQ0FBb0MsQ0FBQyxDQUFBO0FBQzlELDBDQUErQix3Q0FBd0MsQ0FBQyxDQUFBO0FBR3hFLElBQUksY0FBYyxHQUFHLHNCQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRWxEOzs7Ozs7OztHQVFHO0FBRUg7SUFPRSxzQkFBb0IsaUJBQW1DLEVBQVUsT0FBK0IsRUFDNUUsYUFBK0IsRUFBcUIsUUFBZ0I7UUFEcEUsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtRQUFVLFlBQU8sR0FBUCxPQUFPLENBQXdCO1FBQzVFLGtCQUFhLEdBQWIsYUFBYSxDQUFrQjtRQVBuRCxTQUFJLEdBQVcsSUFBSSxDQUFDO1FBQ1osa0JBQWEsR0FBMEIsSUFBSSxDQUFDO1FBQzVDLHdCQUFtQixHQUF5QixJQUFJLENBQUM7UUFFOUIsbUJBQWMsR0FBRyxJQUFJLG9CQUFZLEVBQU8sQ0FBQztRQUlsRSxFQUFFLENBQUMsQ0FBQyxnQkFBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztZQUNyQixJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLElBQUksQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakQsQ0FBQztJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSCwrQkFBUSxHQUFSLFVBQVMsZUFBcUM7UUFBOUMsaUJBc0JDO1FBckJDLElBQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDO1FBQ25ELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxlQUFlLENBQUM7UUFDM0MsSUFBSSxhQUFhLEdBQUcsZUFBZSxDQUFDLGFBQWEsQ0FBQztRQUNsRCxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUVoRSxJQUFJLFNBQVMsR0FBRyxlQUFRLENBQUMsT0FBTyxDQUFDO1lBQy9CLGNBQU8sQ0FBQyx1QkFBUyxFQUFFLEVBQUMsUUFBUSxFQUFFLGVBQWUsQ0FBQyxTQUFTLEVBQUMsQ0FBQztZQUN6RCxjQUFPLENBQUMseUJBQVcsRUFBRSxFQUFDLFFBQVEsRUFBRSxJQUFJLHlCQUFXLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxFQUFDLENBQUM7WUFDekUsY0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBQyxRQUFRLEVBQUUsV0FBVyxFQUFDLENBQUM7U0FDbkQsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLGFBQWE7WUFDZCxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdEYsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQUMsWUFBWTtZQUMxQyxLQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEQsRUFBRSxDQUFDLENBQUMsNENBQWdCLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDOUQsTUFBTSxDQUFjLFlBQVksQ0FBQyxRQUFTO3FCQUNyQyxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztZQUM5RCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sTUFBTSxDQUFDLFlBQVksQ0FBQztZQUN0QixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILDRCQUFLLEdBQUwsVUFBTSxlQUFxQztRQUN6QyxJQUFJLG1CQUFtQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztRQUNuRCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsZUFBZSxDQUFDO1FBRTNDLHlGQUF5RjtRQUN6Rix3RkFBd0Y7UUFDeEYsYUFBYTtRQUNiLEVBQUUsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxzQkFBYyxDQUFDLE9BQU8sQ0FDekIsNENBQWdCLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsYUFBYSxDQUFDO2dCQUMzRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FDbkIsVUFBQyxHQUFpQjtvQkFDZCxPQUFVLEdBQUcsQ0FBQyxRQUFTLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxtQkFBbUIsQ0FBQztnQkFBM0UsQ0FBMkUsQ0FBQztnQkFDcEYsSUFBSSxDQUFDLENBQUM7UUFDaEIsQ0FBQztJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSCxpQ0FBVSxHQUFWLFVBQVcsZUFBcUM7UUFBaEQsaUJBZ0JDO1FBZkMsSUFBSSxJQUFJLEdBQUcsY0FBYyxDQUFDO1FBQzFCLEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLGdCQUFTLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDO1lBQ3BFLDRDQUFnQixDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pGLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FDMUIsVUFBQyxHQUFpQjtnQkFDZCxPQUFlLEdBQUcsQ0FBQyxRQUFTO3FCQUN2QixrQkFBa0IsQ0FBQyxlQUFlLEVBQUUsS0FBSSxDQUFDLG1CQUFtQixDQUFDO1lBRGxFLENBQ2tFLENBQUMsQ0FBQztRQUM5RSxDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDO1lBQ2pCLEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsS0FBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEMsSUFBSSxTQUFTLEdBQUcsS0FBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBQyxHQUFpQixJQUFLLE9BQUEsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFiLENBQWEsQ0FBQyxDQUFDO2dCQUM5RSxLQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztnQkFDMUIsTUFBTSxDQUFDLFNBQVMsQ0FBQztZQUNuQixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILDBDQUFtQixHQUFuQixVQUFvQixlQUFxQztRQUF6RCxpQkFZQztRQVhDLEVBQUUsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEMsTUFBTSxDQUFDLGNBQWMsQ0FBQztRQUN4QixDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsNENBQWdCLENBQUMsT0FBTyxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUYsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUMxQixVQUFDLEdBQWlCO2dCQUNkLE9BQWdCLEdBQUcsQ0FBQyxRQUFTO3FCQUN4QixtQkFBbUIsQ0FBQyxlQUFlLEVBQUUsS0FBSSxDQUFDLG1CQUFtQixDQUFDO1lBRG5FLENBQ21FLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixNQUFNLENBQUMsY0FBYyxDQUFDO1FBQ3hCLENBQUM7SUFDSCxDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0gscUNBQWMsR0FBZCxVQUFlLGVBQXFDO1FBQXBELGlCQWdCQztRQWZDLElBQUksTUFBTSxDQUFDO1FBRVgsRUFBRSxDQUFDLENBQUMsY0FBTyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztZQUNqQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsYUFBYSxJQUFJLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQzVFLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyw0Q0FBZ0IsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUYsTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUM1QixVQUFDLEdBQWlCO2dCQUNkLE9BQVcsR0FBRyxDQUFDLFFBQVMsQ0FBQyxjQUFjLENBQUMsZUFBZSxFQUFFLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQztZQUFsRixDQUFrRixDQUFDLENBQUM7UUFDOUYsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxHQUFHLGVBQWUsSUFBSSxJQUFJLENBQUMsbUJBQW1CO2dCQUMzQyxDQUFDLGdCQUFTLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxJQUFJLGdCQUFTLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQztvQkFDL0UsNkJBQWdCLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDOUYsQ0FBQztRQUNELE1BQU0sQ0FBbUIsc0JBQWMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVELGtDQUFXLEdBQVgsY0FBc0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUF4SXpFO1FBQUMsYUFBTSxDQUFDLFVBQVUsQ0FBQzs7d0RBQUE7SUFOckI7UUFBQyxnQkFBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLGVBQWUsRUFBQyxDQUFDO21CQVNpQixnQkFBUyxDQUFDLE1BQU0sQ0FBQzsyR0FBMUIsTUFBTTtvQkFUZDtJQStJdkMsbUJBQUM7QUFBRCxDQUFDLEFBOUlELElBOElDO0FBOUlZLG9CQUFZLGVBOEl4QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQcm9taXNlV3JhcHBlciwgRXZlbnRFbWl0dGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7aXNCbGFuaywgaXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIEF0dHJpYnV0ZSxcbiAgRHluYW1pY0NvbXBvbmVudExvYWRlcixcbiAgQ29tcG9uZW50UmVmLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBJbmplY3RvcixcbiAgcHJvdmlkZSxcbiAgRGVwZW5kZW5jeSxcbiAgT25EZXN0cm95LFxuICBPdXRwdXRcbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbmltcG9ydCAqIGFzIHJvdXRlck1vZCBmcm9tICcuLi9yb3V0ZXInO1xuaW1wb3J0IHtDb21wb25lbnRJbnN0cnVjdGlvbiwgUm91dGVQYXJhbXMsIFJvdXRlRGF0YX0gZnJvbSAnLi4vaW5zdHJ1Y3Rpb24nO1xuaW1wb3J0ICogYXMgaG9va01vZCBmcm9tICcuLi9saWZlY3ljbGUvbGlmZWN5Y2xlX2Fubm90YXRpb25zJztcbmltcG9ydCB7aGFzTGlmZWN5Y2xlSG9va30gZnJvbSAnLi4vbGlmZWN5Y2xlL3JvdXRlX2xpZmVjeWNsZV9yZWZsZWN0b3InO1xuaW1wb3J0IHtPbkFjdGl2YXRlLCBDYW5SZXVzZSwgT25SZXVzZSwgT25EZWFjdGl2YXRlLCBDYW5EZWFjdGl2YXRlfSBmcm9tICcuLi9pbnRlcmZhY2VzJztcblxubGV0IF9yZXNvbHZlVG9UcnVlID0gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZSh0cnVlKTtcblxuLyoqXG4gKiBBIHJvdXRlciBvdXRsZXQgaXMgYSBwbGFjZWhvbGRlciB0aGF0IEFuZ3VsYXIgZHluYW1pY2FsbHkgZmlsbHMgYmFzZWQgb24gdGhlIGFwcGxpY2F0aW9uJ3Mgcm91dGUuXG4gKlxuICogIyMgVXNlXG4gKlxuICogYGBgXG4gKiA8cm91dGVyLW91dGxldD48L3JvdXRlci1vdXRsZXQ+XG4gKiBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdyb3V0ZXItb3V0bGV0J30pXG5leHBvcnQgY2xhc3MgUm91dGVyT3V0bGV0IGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgbmFtZTogc3RyaW5nID0gbnVsbDtcbiAgcHJpdmF0ZSBfY29tcG9uZW50UmVmOiBQcm9taXNlPENvbXBvbmVudFJlZj4gPSBudWxsO1xuICBwcml2YXRlIF9jdXJyZW50SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uID0gbnVsbDtcblxuICBAT3V0cHV0KCdhY3RpdmF0ZScpIHB1YmxpYyBhY3RpdmF0ZUV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsIHByaXZhdGUgX2xvYWRlcjogRHluYW1pY0NvbXBvbmVudExvYWRlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfcGFyZW50Um91dGVyOiByb3V0ZXJNb2QuUm91dGVyLCBAQXR0cmlidXRlKCduYW1lJykgbmFtZUF0dHI6IHN0cmluZykge1xuICAgIGlmIChpc1ByZXNlbnQobmFtZUF0dHIpKSB7XG4gICAgICB0aGlzLm5hbWUgPSBuYW1lQXR0cjtcbiAgICAgIHRoaXMuX3BhcmVudFJvdXRlci5yZWdpc3RlckF1eE91dGxldCh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcGFyZW50Um91dGVyLnJlZ2lzdGVyUHJpbWFyeU91dGxldCh0aGlzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGJ5IHRoZSBSb3V0ZXIgdG8gaW5zdGFudGlhdGUgYSBuZXcgY29tcG9uZW50IGR1cmluZyB0aGUgY29tbWl0IHBoYXNlIG9mIGEgbmF2aWdhdGlvbi5cbiAgICogVGhpcyBtZXRob2QgaW4gdHVybiBpcyByZXNwb25zaWJsZSBmb3IgY2FsbGluZyB0aGUgYHJvdXRlck9uQWN0aXZhdGVgIGhvb2sgb2YgaXRzIGNoaWxkLlxuICAgKi9cbiAgYWN0aXZhdGUobmV4dEluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbik6IFByb21pc2U8YW55PiB7XG4gICAgdmFyIHByZXZpb3VzSW5zdHJ1Y3Rpb24gPSB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb247XG4gICAgdGhpcy5fY3VycmVudEluc3RydWN0aW9uID0gbmV4dEluc3RydWN0aW9uO1xuICAgIHZhciBjb21wb25lbnRUeXBlID0gbmV4dEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGU7XG4gICAgdmFyIGNoaWxkUm91dGVyID0gdGhpcy5fcGFyZW50Um91dGVyLmNoaWxkUm91dGVyKGNvbXBvbmVudFR5cGUpO1xuXG4gICAgdmFyIHByb3ZpZGVycyA9IEluamVjdG9yLnJlc29sdmUoW1xuICAgICAgcHJvdmlkZShSb3V0ZURhdGEsIHt1c2VWYWx1ZTogbmV4dEluc3RydWN0aW9uLnJvdXRlRGF0YX0pLFxuICAgICAgcHJvdmlkZShSb3V0ZVBhcmFtcywge3VzZVZhbHVlOiBuZXcgUm91dGVQYXJhbXMobmV4dEluc3RydWN0aW9uLnBhcmFtcyl9KSxcbiAgICAgIHByb3ZpZGUocm91dGVyTW9kLlJvdXRlciwge3VzZVZhbHVlOiBjaGlsZFJvdXRlcn0pXG4gICAgXSk7XG4gICAgdGhpcy5fY29tcG9uZW50UmVmID1cbiAgICAgICAgdGhpcy5fbG9hZGVyLmxvYWROZXh0VG9Mb2NhdGlvbihjb21wb25lbnRUeXBlLCB0aGlzLl92aWV3Q29udGFpbmVyUmVmLCBwcm92aWRlcnMpO1xuICAgIHJldHVybiB0aGlzLl9jb21wb25lbnRSZWYudGhlbigoY29tcG9uZW50UmVmKSA9PiB7XG4gICAgICB0aGlzLmFjdGl2YXRlRXZlbnRzLmVtaXQoY29tcG9uZW50UmVmLmluc3RhbmNlKTtcbiAgICAgIGlmIChoYXNMaWZlY3ljbGVIb29rKGhvb2tNb2Qucm91dGVyT25BY3RpdmF0ZSwgY29tcG9uZW50VHlwZSkpIHtcbiAgICAgICAgcmV0dXJuICg8T25BY3RpdmF0ZT5jb21wb25lbnRSZWYuaW5zdGFuY2UpXG4gICAgICAgICAgICAucm91dGVyT25BY3RpdmF0ZShuZXh0SW5zdHJ1Y3Rpb24sIHByZXZpb3VzSW5zdHJ1Y3Rpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudFJlZjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgdGhlIHtAbGluayBSb3V0ZXJ9IGR1cmluZyB0aGUgY29tbWl0IHBoYXNlIG9mIGEgbmF2aWdhdGlvbiB3aGVuIGFuIG91dGxldFxuICAgKiByZXVzZXMgYSBjb21wb25lbnQgYmV0d2VlbiBkaWZmZXJlbnQgcm91dGVzLlxuICAgKiBUaGlzIG1ldGhvZCBpbiB0dXJuIGlzIHJlc3BvbnNpYmxlIGZvciBjYWxsaW5nIHRoZSBgcm91dGVyT25SZXVzZWAgaG9vayBvZiBpdHMgY2hpbGQuXG4gICAqL1xuICByZXVzZShuZXh0SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICB2YXIgcHJldmlvdXNJbnN0cnVjdGlvbiA9IHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbjtcbiAgICB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24gPSBuZXh0SW5zdHJ1Y3Rpb247XG5cbiAgICAvLyBpdCdzIHBvc3NpYmxlIHRoZSBjb21wb25lbnQgaXMgcmVtb3ZlZCBiZWZvcmUgaXQgY2FuIGJlIHJlYWN0aXZhdGVkIChpZiBuZXN0ZWQgd2l0aGluZ1xuICAgIC8vIGFub3RoZXIgZHluYW1pY2FsbHkgbG9hZGVkIGNvbXBvbmVudCwgZm9yIGluc3RhbmNlKS4gSW4gdGhhdCBjYXNlLCB3ZSBzaW1wbHkgYWN0aXZhdGVcbiAgICAvLyBhIG5ldyBvbmUuXG4gICAgaWYgKGlzQmxhbmsodGhpcy5fY29tcG9uZW50UmVmKSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWN0aXZhdGUobmV4dEluc3RydWN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlc29sdmUoXG4gICAgICAgICAgaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLnJvdXRlck9uUmV1c2UsIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnRUeXBlKSA/XG4gICAgICAgICAgICAgIHRoaXMuX2NvbXBvbmVudFJlZi50aGVuKFxuICAgICAgICAgICAgICAgICAgKHJlZjogQ29tcG9uZW50UmVmKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICg8T25SZXVzZT5yZWYuaW5zdGFuY2UpLnJvdXRlck9uUmV1c2UobmV4dEluc3RydWN0aW9uLCBwcmV2aW91c0luc3RydWN0aW9uKSkgOlxuICAgICAgICAgICAgICB0cnVlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGJ5IHRoZSB7QGxpbmsgUm91dGVyfSB3aGVuIGFuIG91dGxldCBkaXNwb3NlcyBvZiBhIGNvbXBvbmVudCdzIGNvbnRlbnRzLlxuICAgKiBUaGlzIG1ldGhvZCBpbiB0dXJuIGlzIHJlc3BvbnNpYmxlIGZvciBjYWxsaW5nIHRoZSBgcm91dGVyT25EZWFjdGl2YXRlYCBob29rIG9mIGl0cyBjaGlsZC5cbiAgICovXG4gIGRlYWN0aXZhdGUobmV4dEluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbik6IFByb21pc2U8YW55PiB7XG4gICAgdmFyIG5leHQgPSBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2NvbXBvbmVudFJlZikgJiYgaXNQcmVzZW50KHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbikgJiZcbiAgICAgICAgaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLnJvdXRlck9uRGVhY3RpdmF0ZSwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGUpKSB7XG4gICAgICBuZXh0ID0gdGhpcy5fY29tcG9uZW50UmVmLnRoZW4oXG4gICAgICAgICAgKHJlZjogQ29tcG9uZW50UmVmKSA9PlxuICAgICAgICAgICAgICAoPE9uRGVhY3RpdmF0ZT5yZWYuaW5zdGFuY2UpXG4gICAgICAgICAgICAgICAgICAucm91dGVyT25EZWFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbiwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXh0LnRoZW4oKF8pID0+IHtcbiAgICAgIGlmIChpc1ByZXNlbnQodGhpcy5fY29tcG9uZW50UmVmKSkge1xuICAgICAgICB2YXIgb25EaXNwb3NlID0gdGhpcy5fY29tcG9uZW50UmVmLnRoZW4oKHJlZjogQ29tcG9uZW50UmVmKSA9PiByZWYuZGVzdHJveSgpKTtcbiAgICAgICAgdGhpcy5fY29tcG9uZW50UmVmID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIG9uRGlzcG9zZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgdGhlIHtAbGluayBSb3V0ZXJ9IGR1cmluZyByZWNvZ25pdGlvbiBwaGFzZSBvZiBhIG5hdmlnYXRpb24uXG4gICAqXG4gICAqIElmIHRoaXMgcmVzb2x2ZXMgdG8gYGZhbHNlYCwgdGhlIGdpdmVuIG5hdmlnYXRpb24gaXMgY2FuY2VsbGVkLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBkZWxlZ2F0ZXMgdG8gdGhlIGNoaWxkIGNvbXBvbmVudCdzIGByb3V0ZXJDYW5EZWFjdGl2YXRlYCBob29rIGlmIGl0IGV4aXN0cyxcbiAgICogYW5kIG90aGVyd2lzZSByZXNvbHZlcyB0byB0cnVlLlxuICAgKi9cbiAgcm91dGVyQ2FuRGVhY3RpdmF0ZShuZXh0SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5fY3VycmVudEluc3RydWN0aW9uKSkge1xuICAgICAgcmV0dXJuIF9yZXNvbHZlVG9UcnVlO1xuICAgIH1cbiAgICBpZiAoaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLnJvdXRlckNhbkRlYWN0aXZhdGUsIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnRUeXBlKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NvbXBvbmVudFJlZi50aGVuKFxuICAgICAgICAgIChyZWY6IENvbXBvbmVudFJlZikgPT5cbiAgICAgICAgICAgICAgKDxDYW5EZWFjdGl2YXRlPnJlZi5pbnN0YW5jZSlcbiAgICAgICAgICAgICAgICAgIC5yb3V0ZXJDYW5EZWFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbiwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGJ5IHRoZSB7QGxpbmsgUm91dGVyfSBkdXJpbmcgcmVjb2duaXRpb24gcGhhc2Ugb2YgYSBuYXZpZ2F0aW9uLlxuICAgKlxuICAgKiBJZiB0aGUgbmV3IGNoaWxkIGNvbXBvbmVudCBoYXMgYSBkaWZmZXJlbnQgVHlwZSB0aGFuIHRoZSBleGlzdGluZyBjaGlsZCBjb21wb25lbnQsXG4gICAqIHRoaXMgd2lsbCByZXNvbHZlIHRvIGBmYWxzZWAuIFlvdSBjYW4ndCByZXVzZSBhbiBvbGQgY29tcG9uZW50IHdoZW4gdGhlIG5ldyBjb21wb25lbnRcbiAgICogaXMgb2YgYSBkaWZmZXJlbnQgVHlwZS5cbiAgICpcbiAgICogT3RoZXJ3aXNlLCB0aGlzIG1ldGhvZCBkZWxlZ2F0ZXMgdG8gdGhlIGNoaWxkIGNvbXBvbmVudCdzIGByb3V0ZXJDYW5SZXVzZWAgaG9vayBpZiBpdCBleGlzdHMsXG4gICAqIG9yIHJlc29sdmVzIHRvIHRydWUgaWYgdGhlIGhvb2sgaXMgbm90IHByZXNlbnQuXG4gICAqL1xuICByb3V0ZXJDYW5SZXVzZShuZXh0SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdmFyIHJlc3VsdDtcblxuICAgIGlmIChpc0JsYW5rKHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbikgfHxcbiAgICAgICAgdGhpcy5fY3VycmVudEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGUgIT0gbmV4dEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGUpIHtcbiAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLnJvdXRlckNhblJldXNlLCB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50VHlwZSkpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX2NvbXBvbmVudFJlZi50aGVuKFxuICAgICAgICAgIChyZWY6IENvbXBvbmVudFJlZikgPT5cbiAgICAgICAgICAgICAgKDxDYW5SZXVzZT5yZWYuaW5zdGFuY2UpLnJvdXRlckNhblJldXNlKG5leHRJbnN0cnVjdGlvbiwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IG5leHRJbnN0cnVjdGlvbiA9PSB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24gfHxcbiAgICAgICAgICAgICAgIChpc1ByZXNlbnQobmV4dEluc3RydWN0aW9uLnBhcmFtcykgJiYgaXNQcmVzZW50KHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbi5wYXJhbXMpICYmXG4gICAgICAgICAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5lcXVhbHMobmV4dEluc3RydWN0aW9uLnBhcmFtcywgdGhpcy5fY3VycmVudEluc3RydWN0aW9uLnBhcmFtcykpO1xuICAgIH1cbiAgICByZXR1cm4gPFByb21pc2U8Ym9vbGVhbj4+UHJvbWlzZVdyYXBwZXIucmVzb2x2ZShyZXN1bHQpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7IHRoaXMuX3BhcmVudFJvdXRlci51bnJlZ2lzdGVyUHJpbWFyeU91dGxldCh0aGlzKTsgfVxufVxuIl19