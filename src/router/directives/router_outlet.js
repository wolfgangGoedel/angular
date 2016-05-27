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
    function RouterOutlet(_elementRef, _loader, _parentRouter, nameAttr) {
        this._elementRef = _elementRef;
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
            this._loader.loadNextToLocation(componentType, this._elementRef, providers);
        return this._componentRef.then(function (componentRef) {
            _this.activateEvents.emit(componentRef.instance);
            if (route_lifecycle_reflector_1.hasLifecycleHook(hookMod.routerOnActivate, componentType)) {
                return _this._componentRef.then(function (ref) {
                    return ref.instance.routerOnActivate(nextInstruction, previousInstruction);
                });
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
                var onDispose = _this._componentRef.then(function (ref) { return ref.dispose(); });
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
        __metadata('design:paramtypes', [core_1.ElementRef, core_1.DynamicComponentLoader, routerMod.Router, String])
    ], RouterOutlet);
    return RouterOutlet;
}());
exports.RouterOutlet = RouterOutlet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtdHVWVDN5Z2MudG1wL2FuZ3VsYXIyL3NyYy9yb3V0ZXIvZGlyZWN0aXZlcy9yb3V0ZXJfb3V0bGV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSxzQkFBMkMsMkJBQTJCLENBQUMsQ0FBQTtBQUN2RSwyQkFBK0IsZ0NBQWdDLENBQUMsQ0FBQTtBQUNoRSxxQkFBaUMsMEJBQTBCLENBQUMsQ0FBQTtBQUU1RCxxQkFXTyxlQUFlLENBQUMsQ0FBQTtBQUV2QixJQUFZLFNBQVMsV0FBTSxXQUFXLENBQUMsQ0FBQTtBQUN2Qyw0QkFBMkQsZ0JBQWdCLENBQUMsQ0FBQTtBQUM1RSxJQUFZLE9BQU8sV0FBTSxvQ0FBb0MsQ0FBQyxDQUFBO0FBQzlELDBDQUErQix3Q0FBd0MsQ0FBQyxDQUFBO0FBR3hFLElBQUksY0FBYyxHQUFHLHNCQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRWxEOzs7Ozs7OztHQVFHO0FBRUg7SUFPRSxzQkFBb0IsV0FBdUIsRUFBVSxPQUErQixFQUNoRSxhQUErQixFQUFxQixRQUFnQjtRQURwRSxnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQUFVLFlBQU8sR0FBUCxPQUFPLENBQXdCO1FBQ2hFLGtCQUFhLEdBQWIsYUFBYSxDQUFrQjtRQVBuRCxTQUFJLEdBQVcsSUFBSSxDQUFDO1FBQ1osa0JBQWEsR0FBMEIsSUFBSSxDQUFDO1FBQzVDLHdCQUFtQixHQUF5QixJQUFJLENBQUM7UUFFOUIsbUJBQWMsR0FBRyxJQUFJLG9CQUFZLEVBQU8sQ0FBQztRQUlsRSxFQUFFLENBQUMsQ0FBQyxnQkFBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztZQUNyQixJQUFJLENBQUMsYUFBYSxD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QUFtQjtnQkFDM0MsQ0FBQyxnQkFBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsSUFBSSxnQkFBUyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUM7b0JBQy9FLDZCQUFnQixDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzlGLENBQUM7UUFDRCxNQUFNLENBQW1CLHNCQUFjLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRCxrQ0FBVyxHQUFYLGNBQXNCLElBQUksQ0FBQyxhQUFhLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBekl6RTtRQUFDLGFBQU0sQ0FBQyxVQUFVLENBQUM7O3dEQUFBO0lBTnJCO1FBQUMsZ0JBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUMsQ0FBQzttQkFTaUIsZ0JBQVMsQ0FBQyxNQUFNLENBQUM7cUdBQTFCLE1BQU07b0JBVGQ7SUFnSnZDLG1CQUFDO0FBQUQsQ0FBQyxBQS9JRCxJQStJQztBQS9JWSxvQkFBWSxlQStJeEIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UHJvbWlzZVdyYXBwZXIsIEV2ZW50RW1pdHRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2lzQmxhbmssIGlzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBBdHRyaWJ1dGUsXG4gIER5bmFtaWNDb21wb25lbnRMb2FkZXIsXG4gIENvbXBvbmVudFJlZixcbiAgRWxlbWVudFJlZixcbiAgSW5qZWN0b3IsXG4gIHByb3ZpZGUsXG4gIERlcGVuZGVuY3ksXG4gIE9uRGVzdHJveSxcbiAgT3V0cHV0XG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5pbXBvcnQgKiBhcyByb3V0ZXJNb2QgZnJvbSAnLi4vcm91dGVyJztcbmltcG9ydCB7Q29tcG9uZW50SW5zdHJ1Y3Rpb24sIFJvdXRlUGFyYW1zLCBSb3V0ZURhdGF9IGZyb20gJy4uL2luc3RydWN0aW9uJztcbmltcG9ydCAqIGFzIGhvb2tNb2QgZnJvbSAnLi4vbGlmZWN5Y2xlL2xpZmVjeWNsZV9hbm5vdGF0aW9ucyc7XG5pbXBvcnQge2hhc0xpZmVjeWNsZUhvb2t9IGZyb20gJy4uL2xpZmVjeWNsZS9yb3V0ZV9saWZlY3ljbGVfcmVmbGVjdG9yJztcbmltcG9ydCB7T25BY3RpdmF0ZSwgQ2FuUmV1c2UsIE9uUmV1c2UsIE9uRGVhY3RpdmF0ZSwgQ2FuRGVhY3RpdmF0ZX0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5cbmxldCBfcmVzb2x2ZVRvVHJ1ZSA9IFByb21pc2VXcmFwcGVyLnJlc29sdmUodHJ1ZSk7XG5cbi8qKlxuICogQSByb3V0ZXIgb3V0bGV0IGlzIGEgcGxhY2Vob2xkZXIgdGhhdCBBbmd1bGFyIGR5bmFtaWNhbGx5IGZpbGxzIGJhc2VkIG9uIHRoZSBhcHBsaWNhdGlvbidzIHJvdXRlLlxuICpcbiAqICMjIFVzZVxuICpcbiAqIGBgYFxuICogPHJvdXRlci1vdXRsZXQ+PC9yb3V0ZXItb3V0bGV0PlxuICogYGBgXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAncm91dGVyLW91dGxldCd9KVxuZXhwb3J0IGNsYXNzIFJvdXRlck91dGxldCBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIG5hbWU6IHN0cmluZyA9IG51bGw7XG4gIHByaXZhdGUgX2NvbXBvbmVudFJlZjogUHJvbWlzZTxDb21wb25lbnRSZWY+ID0gbnVsbDtcbiAgcHJpdmF0ZSBfY3VycmVudEluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbiA9IG51bGw7XG5cbiAgQE91dHB1dCgnYWN0aXZhdGUnKSBwdWJsaWMgYWN0aXZhdGVFdmVudHMgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmLCBwcml2YXRlIF9sb2FkZXI6IER5bmFtaWNDb21wb25lbnRMb2FkZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgX3BhcmVudFJvdXRlcjogcm91dGVyTW9kLlJvdXRlciwgQEF0dHJpYnV0ZSgnbmFtZScpIG5hbWVBdHRyOiBzdHJpbmcpIHtcbiAgICBpZiAoaXNQcmVzZW50KG5hbWVBdHRyKSkge1xuICAgICAgdGhpcy5uYW1lID0gbmFtZUF0dHI7XG4gICAgICB0aGlzLl9wYXJlbnRSb3V0ZXIucmVnaXN0ZXJBdXhPdXRsZXQodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3BhcmVudFJvdXRlci5yZWdpc3RlclByaW1hcnlPdXRsZXQodGhpcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBieSB0aGUgUm91dGVyIHRvIGluc3RhbnRpYXRlIGEgbmV3IGNvbXBvbmVudCBkdXJpbmcgdGhlIGNvbW1pdCBwaGFzZSBvZiBhIG5hdmlnYXRpb24uXG4gICAqIFRoaXMgbWV0aG9kIGluIHR1cm4gaXMgcmVzcG9uc2libGUgZm9yIGNhbGxpbmcgdGhlIGByb3V0ZXJPbkFjdGl2YXRlYCBob29rIG9mIGl0cyBjaGlsZC5cbiAgICovXG4gIGFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGFueT4ge1xuICAgIHZhciBwcmV2aW91c0luc3RydWN0aW9uID0gdGhpcy5fY3VycmVudEluc3RydWN0aW9uO1xuICAgIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbiA9IG5leHRJbnN0cnVjdGlvbjtcbiAgICB2YXIgY29tcG9uZW50VHlwZSA9IG5leHRJbnN0cnVjdGlvbi5jb21wb25lbnRUeXBlO1xuICAgIHZhciBjaGlsZFJvdXRlciA9IHRoaXMuX3BhcmVudFJvdXRlci5jaGlsZFJvdXRlcihjb21wb25lbnRUeXBlKTtcblxuICAgIHZhciBwcm92aWRlcnMgPSBJbmplY3Rvci5yZXNvbHZlKFtcbiAgICAgIHByb3ZpZGUoUm91dGVEYXRhLCB7dXNlVmFsdWU6IG5leHRJbnN0cnVjdGlvbi5yb3V0ZURhdGF9KSxcbiAgICAgIHByb3ZpZGUoUm91dGVQYXJhbXMsIHt1c2VWYWx1ZTogbmV3IFJvdXRlUGFyYW1zKG5leHRJbnN0cnVjdGlvbi5wYXJhbXMpfSksXG4gICAgICBwcm92aWRlKHJvdXRlck1vZC5Sb3V0ZXIsIHt1c2VWYWx1ZTogY2hpbGRSb3V0ZXJ9KVxuICAgIF0pO1xuICAgIHRoaXMuX2NvbXBvbmVudFJlZiA9XG4gICAgICAgIHRoaXMuX2xvYWRlci5sb2FkTmV4dFRvTG9jYXRpb24oY29tcG9uZW50VHlwZSwgdGhpcy5fZWxlbWVudFJlZiwgcHJvdmlkZXJzKTtcbiAgICByZXR1cm4gdGhpcy5fY29tcG9uZW50UmVmLnRoZW4oKGNvbXBvbmVudFJlZikgPT4ge1xuICAgICAgdGhpcy5hY3RpdmF0ZUV2ZW50cy5lbWl0KGNvbXBvbmVudFJlZi5pbnN0YW5jZSk7XG4gICAgICBpZiAoaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLnJvdXRlck9uQWN0aXZhdGUsIGNvbXBvbmVudFR5cGUpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb21wb25lbnRSZWYudGhlbihcbiAgICAgICAgICAgIChyZWY6IENvbXBvbmVudFJlZikgPT5cbiAgICAgICAgICAgICAgICAoPE9uQWN0aXZhdGU+cmVmLmluc3RhbmNlKS5yb3V0ZXJPbkFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbiwgcHJldmlvdXNJbnN0cnVjdGlvbikpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudFJlZjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgdGhlIHtAbGluayBSb3V0ZXJ9IGR1cmluZyB0aGUgY29tbWl0IHBoYXNlIG9mIGEgbmF2aWdhdGlvbiB3aGVuIGFuIG91dGxldFxuICAgKiByZXVzZXMgYSBjb21wb25lbnQgYmV0d2VlbiBkaWZmZXJlbnQgcm91dGVzLlxuICAgKiBUaGlzIG1ldGhvZCBpbiB0dXJuIGlzIHJlc3BvbnNpYmxlIGZvciBjYWxsaW5nIHRoZSBgcm91dGVyT25SZXVzZWAgaG9vayBvZiBpdHMgY2hpbGQuXG4gICAqL1xuICByZXVzZShuZXh0SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICB2YXIgcHJldmlvdXNJbnN0cnVjdGlvbiA9IHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbjtcbiAgICB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24gPSBuZXh0SW5zdHJ1Y3Rpb247XG5cbiAgICAvLyBpdCdzIHBvc3NpYmxlIHRoZSBjb21wb25lbnQgaXMgcmVtb3ZlZCBiZWZvcmUgaXQgY2FuIGJlIHJlYWN0aXZhdGVkIChpZiBuZXN0ZWQgd2l0aGluZ1xuICAgIC8vIGFub3RoZXIgZHluYW1pY2FsbHkgbG9hZGVkIGNvbXBvbmVudCwgZm9yIGluc3RhbmNlKS4gSW4gdGhhdCBjYXNlLCB3ZSBzaW1wbHkgYWN0aXZhdGVcbiAgICAvLyBhIG5ldyBvbmUuXG4gICAgaWYgKGlzQmxhbmsodGhpcy5fY29tcG9uZW50UmVmKSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWN0aXZhdGUobmV4dEluc3RydWN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlc29sdmUoXG4gICAgICAgICAgaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLnJvdXRlck9uUmV1c2UsIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnRUeXBlKSA/XG4gICAgICAgICAgICAgIHRoaXMuX2NvbXBvbmVudFJlZi50aGVuKFxuICAgICAgICAgICAgICAgICAgKHJlZjogQ29tcG9uZW50UmVmKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICg8T25SZXVzZT5yZWYuaW5zdGFuY2UpLnJvdXRlck9uUmV1c2UobmV4dEluc3RydWN0aW9uLCBwcmV2aW91c0luc3RydWN0aW9uKSkgOlxuICAgICAgICAgICAgICB0cnVlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGJ5IHRoZSB7QGxpbmsgUm91dGVyfSB3aGVuIGFuIG91dGxldCBkaXNwb3NlcyBvZiBhIGNvbXBvbmVudCdzIGNvbnRlbnRzLlxuICAgKiBUaGlzIG1ldGhvZCBpbiB0dXJuIGlzIHJlc3BvbnNpYmxlIGZvciBjYWxsaW5nIHRoZSBgcm91dGVyT25EZWFjdGl2YXRlYCBob29rIG9mIGl0cyBjaGlsZC5cbiAgICovXG4gIGRlYWN0aXZhdGUobmV4dEluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbik6IFByb21pc2U8YW55PiB7XG4gICAgdmFyIG5leHQgPSBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2NvbXBvbmVudFJlZikgJiYgaXNQcmVzZW50KHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbikgJiZcbiAgICAgICAgaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLnJvdXRlck9uRGVhY3RpdmF0ZSwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGUpKSB7XG4gICAgICBuZXh0ID0gdGhpcy5fY29tcG9uZW50UmVmLnRoZW4oXG4gICAgICAgICAgKHJlZjogQ29tcG9uZW50UmVmKSA9PlxuICAgICAgICAgICAgICAoPE9uRGVhY3RpdmF0ZT5yZWYuaW5zdGFuY2UpXG4gICAgICAgICAgICAgICAgICAucm91dGVyT25EZWFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbiwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXh0LnRoZW4oKF8pID0+IHtcbiAgICAgIGlmIChpc1ByZXNlbnQodGhpcy5fY29tcG9uZW50UmVmKSkge1xuICAgICAgICB2YXIgb25EaXNwb3NlID0gdGhpcy5fY29tcG9uZW50UmVmLnRoZW4oKHJlZjogQ29tcG9uZW50UmVmKSA9PiByZWYuZGlzcG9zZSgpKTtcbiAgICAgICAgdGhpcy5fY29tcG9uZW50UmVmID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIG9uRGlzcG9zZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgdGhlIHtAbGluayBSb3V0ZXJ9IGR1cmluZyByZWNvZ25pdGlvbiBwaGFzZSBvZiBhIG5hdmlnYXRpb24uXG4gICAqXG4gICAqIElmIHRoaXMgcmVzb2x2ZXMgdG8gYGZhbHNlYCwgdGhlIGdpdmVuIG5hdmlnYXRpb24gaXMgY2FuY2VsbGVkLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBkZWxlZ2F0ZXMgdG8gdGhlIGNoaWxkIGNvbXBvbmVudCdzIGByb3V0ZXJDYW5EZWFjdGl2YXRlYCBob29rIGlmIGl0IGV4aXN0cyxcbiAgICogYW5kIG90aGVyd2lzZSByZXNvbHZlcyB0byB0cnVlLlxuICAgKi9cbiAgcm91dGVyQ2FuRGVhY3RpdmF0ZShuZXh0SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5fY3VycmVudEluc3RydWN0aW9uKSkge1xuICAgICAgcmV0dXJuIF9yZXNvbHZlVG9UcnVlO1xuICAgIH1cbiAgICBpZiAoaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLnJvdXRlckNhbkRlYWN0aXZhdGUsIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnRUeXBlKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NvbXBvbmVudFJlZi50aGVuKFxuICAgICAgICAgIChyZWY6IENvbXBvbmVudFJlZikgPT5cbiAgICAgICAgICAgICAgKDxDYW5EZWFjdGl2YXRlPnJlZi5pbnN0YW5jZSlcbiAgICAgICAgICAgICAgICAgIC5yb3V0ZXJDYW5EZWFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbiwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGJ5IHRoZSB7QGxpbmsgUm91dGVyfSBkdXJpbmcgcmVjb2duaXRpb24gcGhhc2Ugb2YgYSBuYXZpZ2F0aW9uLlxuICAgKlxuICAgKiBJZiB0aGUgbmV3IGNoaWxkIGNvbXBvbmVudCBoYXMgYSBkaWZmZXJlbnQgVHlwZSB0aGFuIHRoZSBleGlzdGluZyBjaGlsZCBjb21wb25lbnQsXG4gICAqIHRoaXMgd2lsbCByZXNvbHZlIHRvIGBmYWxzZWAuIFlvdSBjYW4ndCByZXVzZSBhbiBvbGQgY29tcG9uZW50IHdoZW4gdGhlIG5ldyBjb21wb25lbnRcbiAgICogaXMgb2YgYSBkaWZmZXJlbnQgVHlwZS5cbiAgICpcbiAgICogT3RoZXJ3aXNlLCB0aGlzIG1ldGhvZCBkZWxlZ2F0ZXMgdG8gdGhlIGNoaWxkIGNvbXBvbmVudCdzIGByb3V0ZXJDYW5SZXVzZWAgaG9vayBpZiBpdCBleGlzdHMsXG4gICAqIG9yIHJlc29sdmVzIHRvIHRydWUgaWYgdGhlIGhvb2sgaXMgbm90IHByZXNlbnQuXG4gICAqL1xuICByb3V0ZXJDYW5SZXVzZShuZXh0SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdmFyIHJlc3VsdDtcblxuICAgIGlmIChpc0JsYW5rKHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbikgfHxcbiAgICAgICAgdGhpcy5fY3VycmVudEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGUgIT0gbmV4dEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGUpIHtcbiAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLnJvdXRlckNhblJldXNlLCB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50VHlwZSkpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX2NvbXBvbmVudFJlZi50aGVuKFxuICAgICAgICAgIChyZWY6IENvbXBvbmVudFJlZikgPT5cbiAgICAgICAgICAgICAgKDxDYW5SZXVzZT5yZWYuaW5zdGFuY2UpLnJvdXRlckNhblJldXNlKG5leHRJbnN0cnVjdGlvbiwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IG5leHRJbnN0cnVjdGlvbiA9PSB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24gfHxcbiAgICAgICAgICAgICAgIChpc1ByZXNlbnQobmV4dEluc3RydWN0aW9uLnBhcmFtcykgJiYgaXNQcmVzZW50KHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbi5wYXJhbXMpICYmXG4gICAgICAgICAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5lcXVhbHMobmV4dEluc3RydWN0aW9uLnBhcmFtcywgdGhpcy5fY3VycmVudEluc3RydWN0aW9uLnBhcmFtcykpO1xuICAgIH1cbiAgICByZXR1cm4gPFByb21pc2U8Ym9vbGVhbj4+UHJvbWlzZVdyYXBwZXIucmVzb2x2ZShyZXN1bHQpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7IHRoaXMuX3BhcmVudFJvdXRlci51bnJlZ2lzdGVyUHJpbWFyeU91dGxldCh0aGlzKTsgfVxufSJdfQ==