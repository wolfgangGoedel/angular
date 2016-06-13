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
import { PromiseWrapper, EventEmitter } from 'angular2/src/facade/async';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { isBlank, isPresent } from 'angular2/src/facade/lang';
import { Directive, Attribute, DynamicComponentLoader, ViewContainerRef, provide, ReflectiveInjector, Output } from 'angular2/core';
import * as routerMod from '../router';
import { RouteParams, RouteData } from '../instruction';
import * as hookMod from '../lifecycle/lifecycle_annotations';
import { hasLifecycleHook } from '../lifecycle/route_lifecycle_reflector';
let _resolveToTrue = PromiseWrapper.resolve(true);
/**
 * A router outlet is a placeholder that Angular dynamically fills based on the application's route.
 *
 * ## Use
 *
 * ```
 * <router-outlet></router-outlet>
 * ```
 */
export let RouterOutlet = class RouterOutlet {
    constructor(_viewContainerRef, _loader, _parentRouter, nameAttr) {
        this._viewContainerRef = _viewContainerRef;
        this._loader = _loader;
        this._parentRouter = _parentRouter;
        this.name = null;
        this._componentRef = null;
        this._currentInstruction = null;
        this.activateEvents = new EventEmitter();
        if (isPresent(nameAttr)) {
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
    activate(nextInstruction) {
        var previousInstruction = this._currentInstruction;
        this._currentInstruction = nextInstruction;
        var componentType = nextInstruction.componentType;
        var childRouter = this._parentRouter.childRouter(componentType);
        var providers = ReflectiveInjector.resolve([
            provide(RouteData, { useValue: nextInstruction.routeData }),
            provide(RouteParams, { useValue: new RouteParams(nextInstruction.params) }),
            provide(routerMod.Router, { useValue: childRouter })
        ]);
        this._componentRef =
            this._loader.loadNextToLocation(componentType, this._viewContainerRef, providers);
        return this._componentRef.then((componentRef) => {
            this.activateEvents.emit(componentRef.instance);
            if (hasLifecycleHook(hookMod.routerOnActivate, componentType)) {
                return componentRef.instance
                    .routerOnActivate(nextInstruction, previousInstruction);
            }
            else {
                return componentRef;
            }
        });
    }
    /**
     * Called by the {@link Router} during the commit phase of a navigation when an outlet
     * reuses a component between different routes.
     * This method in turn is responsible for calling the `routerOnReuse` hook of its child.
     */
    reuse(nextInstruction) {
        var previousInstruction = this._currentInstruction;
        this._currentInstruction = nextInstruction;
        // it's possible the component is removed before it can be reactivated (if nested withing
        // another dynamically loaded component, for instance). In that case, we simply activate
        // a new one.
        if (isBlank(this._componentRef)) {
            return this.activate(nextInstruction);
        }
        else {
            return PromiseWrapper.resolve(hasLifecycleHook(hookMod.routerOnReuse, this._currentInstruction.componentType) ?
                this._componentRef.then((ref) => ref.instance.routerOnReuse(nextInstruction, previousInstruction)) :
                true);
        }
    }
    /**
     * Called by the {@link Router} when an outlet disposes of a component's contents.
     * This method in turn is responsible for calling the `routerOnDeactivate` hook of its child.
     */
    deactivate(nextInstruction) {
        var next = _resolveToTrue;
        if (isPresent(this._componentRef) && isPresent(this._currentInstruction) &&
            hasLifecycleHook(hookMod.routerOnDeactivate, this._currentInstruction.componentType)) {
            next = this._componentRef.then((ref) => ref.instance
                .routerOnDeactivate(nextInstruction, this._currentInstruction));
        }
        return next.then((_) => {
            if (isPresent(this._componentRef)) {
                var onDispose = this._componentRef.then((ref) => ref.destroy());
                this._componentRef = null;
                return onDispose;
            }
        });
    }
    /**
     * Called by the {@link Router} during recognition phase of a navigation.
     *
     * If this resolves to `false`, the given navigation is cancelled.
     *
     * This method delegates to the child component's `routerCanDeactivate` hook if it exists,
     * and otherwise resolves to true.
     */
    routerCanDeactivate(nextInstruction) {
        if (isBlank(this._currentInstruction)) {
            return _resolveToTrue;
        }
        if (hasLifecycleHook(hookMod.routerCanDeactivate, this._currentInstruction.componentType)) {
            return this._componentRef.then((ref) => ref.instance
                .routerCanDeactivate(nextInstruction, this._currentInstruction));
        }
        else {
            return _resolveToTrue;
        }
    }
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
    routerCanReuse(nextInstruction) {
        var result;
        if (isBlank(this._currentInstruction) ||
            this._currentInstruction.componentType != nextInstruction.componentType) {
            result = false;
        }
        else if (hasLifecycleHook(hookMod.routerCanReuse, this._currentInstruction.componentType)) {
            result = this._componentRef.then((ref) => ref.instance.routerCanReuse(nextInstruction, this._currentInstruction));
        }
        else {
            result = nextInstruction == this._currentInstruction ||
                (isPresent(nextInstruction.params) && isPresent(this._currentInstruction.params) &&
                    StringMapWrapper.equals(nextInstruction.params, this._currentInstruction.params));
        }
        return PromiseWrapper.resolve(result);
    }
    ngOnDestroy() { this._parentRouter.unregisterPrimaryOutlet(this); }
};
__decorate([
    Output('activate'), 
    __metadata('design:type', Object)
], RouterOutlet.prototype, "activateEvents", void 0);
RouterOutlet = __decorate([
    Directive({ selector: 'router-outlet' }),
    __param(3, Attribute('name')), 
    __metadata('design:paramtypes', [ViewContainerRef, DynamicComponentLoader, routerMod.Router, String])
], RouterOutlet);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtVmZRUVdDSWsudG1wL2FuZ3VsYXIyL3NyYy9yb3V0ZXIvZGlyZWN0aXZlcy9yb3V0ZXJfb3V0bGV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztPQUFPLEVBQUMsY0FBYyxFQUFFLFlBQVksRUFBQyxNQUFNLDJCQUEyQjtPQUMvRCxFQUFDLGdCQUFnQixFQUFDLE1BQU0sZ0NBQWdDO09BQ3hELEVBQUMsT0FBTyxFQUFFLFNBQVMsRUFBQyxNQUFNLDBCQUEwQjtPQUVwRCxFQUNMLFNBQVMsRUFDVCxTQUFTLEVBQ1Qsc0JBQXNCLEVBRXRCLGdCQUFnQixFQUNoQixPQUFPLEVBQ1Asa0JBQWtCLEVBRWxCLE1BQU0sRUFDUCxNQUFNLGVBQWU7T0FFZixLQUFLLFNBQVMsTUFBTSxXQUFXO09BQy9CLEVBQXVCLFdBQVcsRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0I7T0FDcEUsS0FBSyxPQUFPLE1BQU0sb0NBQW9DO09BQ3RELEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSx3Q0FBd0M7QUFHdkUsSUFBSSxjQUFjLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUVsRDs7Ozs7Ozs7R0FRRztBQUVIO0lBT0UsWUFBb0IsaUJBQW1DLEVBQVUsT0FBK0IsRUFDNUUsYUFBK0IsRUFBcUIsUUFBZ0I7UUFEcEUsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtRQUFVLFlBQU8sR0FBUCxPQUFPLENBQXdCO1FBQzVFLGtCQUFhLEdBQWIsYUFBYSxDQUFrQjtRQVBuRCxTQUFJLEdBQVcsSUFBSSxDQUFDO1FBQ1osa0JBQWEsR0FBMEIsSUFBSSxDQUFDO1FBQzVDLHdCQUFtQixHQUF5QixJQUFJLENBQUM7UUFFOUIsbUJBQWMsR0FBRyxJQUFJLFlBQVksRUFBTyxDQUFDO1FBSWxFLEVBQUUs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LEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDOUYsQ0FBQztRQUNELE1BQU0sQ0FBbUIsY0FBYyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRUQsV0FBVyxLQUFXLElBQUksQ0FBQyxhQUFhLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNFLENBQUM7QUF6SUM7SUFBQyxNQUFNLENBQUMsVUFBVSxDQUFDOztvREFBQTtBQU5yQjtJQUFDLFNBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUMsQ0FBQztlQVNpQixTQUFTLENBQUMsTUFBTSxDQUFDO3lGQUExQixNQUFNO2dCQVRkO0FBK0l0QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UHJvbWlzZVdyYXBwZXIsIEV2ZW50RW1pdHRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2lzQmxhbmssIGlzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBBdHRyaWJ1dGUsXG4gIER5bmFtaWNDb21wb25lbnRMb2FkZXIsXG4gIENvbXBvbmVudFJlZixcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgcHJvdmlkZSxcbiAgUmVmbGVjdGl2ZUluamVjdG9yLFxuICBPbkRlc3Ryb3ksXG4gIE91dHB1dFxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuaW1wb3J0ICogYXMgcm91dGVyTW9kIGZyb20gJy4uL3JvdXRlcic7XG5pbXBvcnQge0NvbXBvbmVudEluc3RydWN0aW9uLCBSb3V0ZVBhcmFtcywgUm91dGVEYXRhfSBmcm9tICcuLi9pbnN0cnVjdGlvbic7XG5pbXBvcnQgKiBhcyBob29rTW9kIGZyb20gJy4uL2xpZmVjeWNsZS9saWZlY3ljbGVfYW5ub3RhdGlvbnMnO1xuaW1wb3J0IHtoYXNMaWZlY3ljbGVIb29rfSBmcm9tICcuLi9saWZlY3ljbGUvcm91dGVfbGlmZWN5Y2xlX3JlZmxlY3Rvcic7XG5pbXBvcnQge09uQWN0aXZhdGUsIENhblJldXNlLCBPblJldXNlLCBPbkRlYWN0aXZhdGUsIENhbkRlYWN0aXZhdGV9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuXG5sZXQgX3Jlc29sdmVUb1RydWUgPSBQcm9taXNlV3JhcHBlci5yZXNvbHZlKHRydWUpO1xuXG4vKipcbiAqIEEgcm91dGVyIG91dGxldCBpcyBhIHBsYWNlaG9sZGVyIHRoYXQgQW5ndWxhciBkeW5hbWljYWxseSBmaWxscyBiYXNlZCBvbiB0aGUgYXBwbGljYXRpb24ncyByb3V0ZS5cbiAqXG4gKiAjIyBVc2VcbiAqXG4gKiBgYGBcbiAqIDxyb3V0ZXItb3V0bGV0Pjwvcm91dGVyLW91dGxldD5cbiAqIGBgYFxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ3JvdXRlci1vdXRsZXQnfSlcbmV4cG9ydCBjbGFzcyBSb3V0ZXJPdXRsZXQgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBuYW1lOiBzdHJpbmcgPSBudWxsO1xuICBwcml2YXRlIF9jb21wb25lbnRSZWY6IFByb21pc2U8Q29tcG9uZW50UmVmPiA9IG51bGw7XG4gIHByaXZhdGUgX2N1cnJlbnRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBudWxsO1xuXG4gIEBPdXRwdXQoJ2FjdGl2YXRlJykgcHVibGljIGFjdGl2YXRlRXZlbnRzID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZiwgcHJpdmF0ZSBfbG9hZGVyOiBEeW5hbWljQ29tcG9uZW50TG9hZGVyLFxuICAgICAgICAgICAgICBwcml2YXRlIF9wYXJlbnRSb3V0ZXI6IHJvdXRlck1vZC5Sb3V0ZXIsIEBBdHRyaWJ1dGUoJ25hbWUnKSBuYW1lQXR0cjogc3RyaW5nKSB7XG4gICAgaWYgKGlzUHJlc2VudChuYW1lQXR0cikpIHtcbiAgICAgIHRoaXMubmFtZSA9IG5hbWVBdHRyO1xuICAgICAgdGhpcy5fcGFyZW50Um91dGVyLnJlZ2lzdGVyQXV4T3V0bGV0KHRoaXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9wYXJlbnRSb3V0ZXIucmVnaXN0ZXJQcmltYXJ5T3V0bGV0KHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgdGhlIFJvdXRlciB0byBpbnN0YW50aWF0ZSBhIG5ldyBjb21wb25lbnQgZHVyaW5nIHRoZSBjb21taXQgcGhhc2Ugb2YgYSBuYXZpZ2F0aW9uLlxuICAgKiBUaGlzIG1ldGhvZCBpbiB0dXJuIGlzIHJlc3BvbnNpYmxlIGZvciBjYWxsaW5nIHRoZSBgcm91dGVyT25BY3RpdmF0ZWAgaG9vayBvZiBpdHMgY2hpbGQuXG4gICAqL1xuICBhY3RpdmF0ZShuZXh0SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICB2YXIgcHJldmlvdXNJbnN0cnVjdGlvbiA9IHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbjtcbiAgICB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24gPSBuZXh0SW5zdHJ1Y3Rpb247XG4gICAgdmFyIGNvbXBvbmVudFR5cGUgPSBuZXh0SW5zdHJ1Y3Rpb24uY29tcG9uZW50VHlwZTtcbiAgICB2YXIgY2hpbGRSb3V0ZXIgPSB0aGlzLl9wYXJlbnRSb3V0ZXIuY2hpbGRSb3V0ZXIoY29tcG9uZW50VHlwZSk7XG5cbiAgICB2YXIgcHJvdmlkZXJzID0gUmVmbGVjdGl2ZUluamVjdG9yLnJlc29sdmUoW1xuICAgICAgcHJvdmlkZShSb3V0ZURhdGEsIHt1c2VWYWx1ZTogbmV4dEluc3RydWN0aW9uLnJvdXRlRGF0YX0pLFxuICAgICAgcHJvdmlkZShSb3V0ZVBhcmFtcywge3VzZVZhbHVlOiBuZXcgUm91dGVQYXJhbXMobmV4dEluc3RydWN0aW9uLnBhcmFtcyl9KSxcbiAgICAgIHByb3ZpZGUocm91dGVyTW9kLlJvdXRlciwge3VzZVZhbHVlOiBjaGlsZFJvdXRlcn0pXG4gICAgXSk7XG4gICAgdGhpcy5fY29tcG9uZW50UmVmID1cbiAgICAgICAgdGhpcy5fbG9hZGVyLmxvYWROZXh0VG9Mb2NhdGlvbihjb21wb25lbnRUeXBlLCB0aGlzLl92aWV3Q29udGFpbmVyUmVmLCBwcm92aWRlcnMpO1xuICAgIHJldHVybiB0aGlzLl9jb21wb25lbnRSZWYudGhlbigoY29tcG9uZW50UmVmKSA9PiB7XG4gICAgICB0aGlzLmFjdGl2YXRlRXZlbnRzLmVtaXQoY29tcG9uZW50UmVmLmluc3RhbmNlKTtcbiAgICAgIGlmIChoYXNMaWZlY3ljbGVIb29rKGhvb2tNb2Qucm91dGVyT25BY3RpdmF0ZSwgY29tcG9uZW50VHlwZSkpIHtcbiAgICAgICAgcmV0dXJuICg8T25BY3RpdmF0ZT5jb21wb25lbnRSZWYuaW5zdGFuY2UpXG4gICAgICAgICAgICAucm91dGVyT25BY3RpdmF0ZShuZXh0SW5zdHJ1Y3Rpb24sIHByZXZpb3VzSW5zdHJ1Y3Rpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudFJlZjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgdGhlIHtAbGluayBSb3V0ZXJ9IGR1cmluZyB0aGUgY29tbWl0IHBoYXNlIG9mIGEgbmF2aWdhdGlvbiB3aGVuIGFuIG91dGxldFxuICAgKiByZXVzZXMgYSBjb21wb25lbnQgYmV0d2VlbiBkaWZmZXJlbnQgcm91dGVzLlxuICAgKiBUaGlzIG1ldGhvZCBpbiB0dXJuIGlzIHJlc3BvbnNpYmxlIGZvciBjYWxsaW5nIHRoZSBgcm91dGVyT25SZXVzZWAgaG9vayBvZiBpdHMgY2hpbGQuXG4gICAqL1xuICByZXVzZShuZXh0SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICB2YXIgcHJldmlvdXNJbnN0cnVjdGlvbiA9IHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbjtcbiAgICB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24gPSBuZXh0SW5zdHJ1Y3Rpb247XG5cbiAgICAvLyBpdCdzIHBvc3NpYmxlIHRoZSBjb21wb25lbnQgaXMgcmVtb3ZlZCBiZWZvcmUgaXQgY2FuIGJlIHJlYWN0aXZhdGVkIChpZiBuZXN0ZWQgd2l0aGluZ1xuICAgIC8vIGFub3RoZXIgZHluYW1pY2FsbHkgbG9hZGVkIGNvbXBvbmVudCwgZm9yIGluc3RhbmNlKS4gSW4gdGhhdCBjYXNlLCB3ZSBzaW1wbHkgYWN0aXZhdGVcbiAgICAvLyBhIG5ldyBvbmUuXG4gICAgaWYgKGlzQmxhbmsodGhpcy5fY29tcG9uZW50UmVmKSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWN0aXZhdGUobmV4dEluc3RydWN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlc29sdmUoXG4gICAgICAgICAgaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLnJvdXRlck9uUmV1c2UsIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnRUeXBlKSA/XG4gICAgICAgICAgICAgIHRoaXMuX2NvbXBvbmVudFJlZi50aGVuKFxuICAgICAgICAgICAgICAgICAgKHJlZjogQ29tcG9uZW50UmVmKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICg8T25SZXVzZT5yZWYuaW5zdGFuY2UpLnJvdXRlck9uUmV1c2UobmV4dEluc3RydWN0aW9uLCBwcmV2aW91c0luc3RydWN0aW9uKSkgOlxuICAgICAgICAgICAgICB0cnVlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGJ5IHRoZSB7QGxpbmsgUm91dGVyfSB3aGVuIGFuIG91dGxldCBkaXNwb3NlcyBvZiBhIGNvbXBvbmVudCdzIGNvbnRlbnRzLlxuICAgKiBUaGlzIG1ldGhvZCBpbiB0dXJuIGlzIHJlc3BvbnNpYmxlIGZvciBjYWxsaW5nIHRoZSBgcm91dGVyT25EZWFjdGl2YXRlYCBob29rIG9mIGl0cyBjaGlsZC5cbiAgICovXG4gIGRlYWN0aXZhdGUobmV4dEluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbik6IFByb21pc2U8YW55PiB7XG4gICAgdmFyIG5leHQgPSBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2NvbXBvbmVudFJlZikgJiYgaXNQcmVzZW50KHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbikgJiZcbiAgICAgICAgaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLnJvdXRlck9uRGVhY3RpdmF0ZSwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGUpKSB7XG4gICAgICBuZXh0ID0gdGhpcy5fY29tcG9uZW50UmVmLnRoZW4oXG4gICAgICAgICAgKHJlZjogQ29tcG9uZW50UmVmKSA9PlxuICAgICAgICAgICAgICAoPE9uRGVhY3RpdmF0ZT5yZWYuaW5zdGFuY2UpXG4gICAgICAgICAgICAgICAgICAucm91dGVyT25EZWFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbiwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXh0LnRoZW4oKF8pID0+IHtcbiAgICAgIGlmIChpc1ByZXNlbnQodGhpcy5fY29tcG9uZW50UmVmKSkge1xuICAgICAgICB2YXIgb25EaXNwb3NlID0gdGhpcy5fY29tcG9uZW50UmVmLnRoZW4oKHJlZjogQ29tcG9uZW50UmVmKSA9PiByZWYuZGVzdHJveSgpKTtcbiAgICAgICAgdGhpcy5fY29tcG9uZW50UmVmID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIG9uRGlzcG9zZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgdGhlIHtAbGluayBSb3V0ZXJ9IGR1cmluZyByZWNvZ25pdGlvbiBwaGFzZSBvZiBhIG5hdmlnYXRpb24uXG4gICAqXG4gICAqIElmIHRoaXMgcmVzb2x2ZXMgdG8gYGZhbHNlYCwgdGhlIGdpdmVuIG5hdmlnYXRpb24gaXMgY2FuY2VsbGVkLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBkZWxlZ2F0ZXMgdG8gdGhlIGNoaWxkIGNvbXBvbmVudCdzIGByb3V0ZXJDYW5EZWFjdGl2YXRlYCBob29rIGlmIGl0IGV4aXN0cyxcbiAgICogYW5kIG90aGVyd2lzZSByZXNvbHZlcyB0byB0cnVlLlxuICAgKi9cbiAgcm91dGVyQ2FuRGVhY3RpdmF0ZShuZXh0SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5fY3VycmVudEluc3RydWN0aW9uKSkge1xuICAgICAgcmV0dXJuIF9yZXNvbHZlVG9UcnVlO1xuICAgIH1cbiAgICBpZiAoaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLnJvdXRlckNhbkRlYWN0aXZhdGUsIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnRUeXBlKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NvbXBvbmVudFJlZi50aGVuKFxuICAgICAgICAgIChyZWY6IENvbXBvbmVudFJlZikgPT5cbiAgICAgICAgICAgICAgKDxDYW5EZWFjdGl2YXRlPnJlZi5pbnN0YW5jZSlcbiAgICAgICAgICAgICAgICAgIC5yb3V0ZXJDYW5EZWFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbiwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGJ5IHRoZSB7QGxpbmsgUm91dGVyfSBkdXJpbmcgcmVjb2duaXRpb24gcGhhc2Ugb2YgYSBuYXZpZ2F0aW9uLlxuICAgKlxuICAgKiBJZiB0aGUgbmV3IGNoaWxkIGNvbXBvbmVudCBoYXMgYSBkaWZmZXJlbnQgVHlwZSB0aGFuIHRoZSBleGlzdGluZyBjaGlsZCBjb21wb25lbnQsXG4gICAqIHRoaXMgd2lsbCByZXNvbHZlIHRvIGBmYWxzZWAuIFlvdSBjYW4ndCByZXVzZSBhbiBvbGQgY29tcG9uZW50IHdoZW4gdGhlIG5ldyBjb21wb25lbnRcbiAgICogaXMgb2YgYSBkaWZmZXJlbnQgVHlwZS5cbiAgICpcbiAgICogT3RoZXJ3aXNlLCB0aGlzIG1ldGhvZCBkZWxlZ2F0ZXMgdG8gdGhlIGNoaWxkIGNvbXBvbmVudCdzIGByb3V0ZXJDYW5SZXVzZWAgaG9vayBpZiBpdCBleGlzdHMsXG4gICAqIG9yIHJlc29sdmVzIHRvIHRydWUgaWYgdGhlIGhvb2sgaXMgbm90IHByZXNlbnQuXG4gICAqL1xuICByb3V0ZXJDYW5SZXVzZShuZXh0SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdmFyIHJlc3VsdDtcblxuICAgIGlmIChpc0JsYW5rKHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbikgfHxcbiAgICAgICAgdGhpcy5fY3VycmVudEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGUgIT0gbmV4dEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGUpIHtcbiAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLnJvdXRlckNhblJldXNlLCB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50VHlwZSkpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX2NvbXBvbmVudFJlZi50aGVuKFxuICAgICAgICAgIChyZWY6IENvbXBvbmVudFJlZikgPT5cbiAgICAgICAgICAgICAgKDxDYW5SZXVzZT5yZWYuaW5zdGFuY2UpLnJvdXRlckNhblJldXNlKG5leHRJbnN0cnVjdGlvbiwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IG5leHRJbnN0cnVjdGlvbiA9PSB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24gfHxcbiAgICAgICAgICAgICAgIChpc1ByZXNlbnQobmV4dEluc3RydWN0aW9uLnBhcmFtcykgJiYgaXNQcmVzZW50KHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbi5wYXJhbXMpICYmXG4gICAgICAgICAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5lcXVhbHMobmV4dEluc3RydWN0aW9uLnBhcmFtcywgdGhpcy5fY3VycmVudEluc3RydWN0aW9uLnBhcmFtcykpO1xuICAgIH1cbiAgICByZXR1cm4gPFByb21pc2U8Ym9vbGVhbj4+UHJvbWlzZVdyYXBwZXIucmVzb2x2ZShyZXN1bHQpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7IHRoaXMuX3BhcmVudFJvdXRlci51bnJlZ2lzdGVyUHJpbWFyeU91dGxldCh0aGlzKTsgfVxufVxuIl19