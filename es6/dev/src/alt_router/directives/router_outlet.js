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
import { Directive, ViewContainerRef, Attribute, ReflectiveInjector } from 'angular2/core';
import { RouterOutletMap } from '../router';
import { DEFAULT_OUTLET_NAME } from '../constants';
import { isPresent, isBlank } from 'angular2/src/facade/lang';
export let RouterOutlet = class RouterOutlet {
    constructor(parentOutletMap, _location, name) {
        this._location = _location;
        parentOutletMap.registerOutlet(isBlank(name) ? DEFAULT_OUTLET_NAME : name, this);
    }
    unload() {
        this._loaded.destroy();
        this._loaded = null;
    }
    get loadedComponent() { return isPresent(this._loaded) ? this._loaded.instance : null; }
    get isLoaded() { return isPresent(this._loaded); }
    load(factory, providers, outletMap) {
        this.outletMap = outletMap;
        let inj = ReflectiveInjector.fromResolvedProviders(providers, this._location.parentInjector);
        this._loaded = this._location.createComponent(factory, this._location.length, inj, []);
        return this._loaded;
    }
};
RouterOutlet = __decorate([
    Directive({ selector: 'router-outlet' }),
    __param(2, Attribute('name')), 
    __metadata('design:paramtypes', [RouterOutletMap, ViewContainerRef, String])
], RouterOutlet);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcG45aHMwWmUudG1wL2FuZ3VsYXIyL3NyYy9hbHRfcm91dGVyL2RpcmVjdGl2ZXMvcm91dGVyX291dGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7T0FBTyxFQUVMLFNBQVMsRUFFVCxnQkFBZ0IsRUFDaEIsU0FBUyxFQUdULGtCQUFrQixFQUVuQixNQUFNLGVBQWU7T0FDZixFQUFDLGVBQWUsRUFBQyxNQUFNLFdBQVc7T0FDbEMsRUFBQyxtQkFBbUIsRUFBQyxNQUFNLGNBQWM7T0FDekMsRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFDLE1BQU0sMEJBQTBCO0FBRzNEO0lBSUUsWUFBWSxlQUFnQyxFQUFVLFNBQTJCLEVBQ2xELElBQVk7UUFEVyxjQUFTLEdBQVQsU0FBUyxDQUFrQjtRQUUvRSxlQUFlLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxtQkFBbUIsR0FBRyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUVELE1BQU07UUFDSixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLENBQUM7SUFFRCxJQUFJLGVBQWUsS0FBYSxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBRWhHLElBQUksUUFBUSxLQUFjLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUUzRCxJQUFJLENBQUMsT0FBeUIsRUFBRSxTQUF1QyxFQUNsRSxTQUEwQjtRQUM3QixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLEdBQUcsR0FBRyxrQkFBa0IsQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM3RixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDdkYsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDdEIsQ0FBQztBQUNILENBQUM7QUExQkQ7SUFBQyxTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsZUFBZSxFQUFDLENBQUM7ZUFNeEIsU0FBUyxDQUFDLE1BQU0sQ0FBQzs7Z0JBTk87QUEwQnRDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgUmVzb2x2ZWRSZWZsZWN0aXZlUHJvdmlkZXIsXG4gIERpcmVjdGl2ZSxcbiAgRHluYW1pY0NvbXBvbmVudExvYWRlcixcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgQXR0cmlidXRlLFxuICBDb21wb25lbnRSZWYsXG4gIENvbXBvbmVudEZhY3RvcnksXG4gIFJlZmxlY3RpdmVJbmplY3RvcixcbiAgT25Jbml0XG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtSb3V0ZXJPdXRsZXRNYXB9IGZyb20gJy4uL3JvdXRlcic7XG5pbXBvcnQge0RFRkFVTFRfT1VUTEVUX05BTUV9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdyb3V0ZXItb3V0bGV0J30pXG5leHBvcnQgY2xhc3MgUm91dGVyT3V0bGV0IHtcbiAgcHJpdmF0ZSBfbG9hZGVkOiBDb21wb25lbnRSZWY7XG4gIHB1YmxpYyBvdXRsZXRNYXA6IFJvdXRlck91dGxldE1hcDtcblxuICBjb25zdHJ1Y3RvcihwYXJlbnRPdXRsZXRNYXA6IFJvdXRlck91dGxldE1hcCwgcHJpdmF0ZSBfbG9jYXRpb246IFZpZXdDb250YWluZXJSZWYsXG4gICAgICAgICAgICAgIEBBdHRyaWJ1dGUoJ25hbWUnKSBuYW1lOiBzdHJpbmcpIHtcbiAgICBwYXJlbnRPdXRsZXRNYXAucmVnaXN0ZXJPdXRsZXQoaXNCbGFuayhuYW1lKSA/IERFRkFVTFRfT1VUTEVUX05BTUUgOiBuYW1lLCB0aGlzKTtcbiAgfVxuXG4gIHVubG9hZCgpOiB2b2lkIHtcbiAgICB0aGlzLl9sb2FkZWQuZGVzdHJveSgpO1xuICAgIHRoaXMuX2xvYWRlZCA9IG51bGw7XG4gIH1cblxuICBnZXQgbG9hZGVkQ29tcG9uZW50KCk6IE9iamVjdCB7IHJldHVybiBpc1ByZXNlbnQodGhpcy5fbG9hZGVkKSA/IHRoaXMuX2xvYWRlZC5pbnN0YW5jZSA6IG51bGw7IH1cblxuICBnZXQgaXNMb2FkZWQoKTogYm9vbGVhbiB7IHJldHVybiBpc1ByZXNlbnQodGhpcy5fbG9hZGVkKTsgfVxuXG4gIGxvYWQoZmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeSwgcHJvdmlkZXJzOiBSZXNvbHZlZFJlZmxlY3RpdmVQcm92aWRlcltdLFxuICAgICAgIG91dGxldE1hcDogUm91dGVyT3V0bGV0TWFwKTogQ29tcG9uZW50UmVmIHtcbiAgICB0aGlzLm91dGxldE1hcCA9IG91dGxldE1hcDtcbiAgICBsZXQgaW5qID0gUmVmbGVjdGl2ZUluamVjdG9yLmZyb21SZXNvbHZlZFByb3ZpZGVycyhwcm92aWRlcnMsIHRoaXMuX2xvY2F0aW9uLnBhcmVudEluamVjdG9yKTtcbiAgICB0aGlzLl9sb2FkZWQgPSB0aGlzLl9sb2NhdGlvbi5jcmVhdGVDb21wb25lbnQoZmFjdG9yeSwgdGhpcy5fbG9jYXRpb24ubGVuZ3RoLCBpbmosIFtdKTtcbiAgICByZXR1cm4gdGhpcy5fbG9hZGVkO1xuICB9XG59Il19