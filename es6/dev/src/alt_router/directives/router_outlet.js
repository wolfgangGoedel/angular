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
    load(factory, providers, outletMap) {
        if (isPresent(this._loaded)) {
            this.unload();
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtSmVUOHV6bzgudG1wL2FuZ3VsYXIyL3NyYy9hbHRfcm91dGVyL2RpcmVjdGl2ZXMvcm91dGVyX291dGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7T0FBTyxFQUVMLFNBQVMsRUFFVCxnQkFBZ0IsRUFDaEIsU0FBUyxFQUdULGtCQUFrQixFQUVuQixNQUFNLGVBQWU7T0FDZixFQUFDLGVBQWUsRUFBQyxNQUFNLFdBQVc7T0FDbEMsRUFBQyxtQkFBbUIsRUFBQyxNQUFNLGNBQWM7T0FDekMsRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFDLE1BQU0sMEJBQTBCO0FBRzNEO0lBSUUsWUFBWSxlQUFnQyxFQUFVLFNBQTJCLEVBQ2xELElBQVk7UUFEVyxjQUFTLEdBQVQsU0FBUyxDQUFrQjtRQUUvRSxlQUFlLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxtQkFBbUIsR0FBRyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUVELE1BQU07UUFDSixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLENBQUM7SUFFRCxJQUFJLENBQUMsT0FBeUIsRUFBRSxTQUF1QyxFQUNsRSxTQUEwQjtRQUM3QixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDaEIsQ0FBQztRQUNELElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksR0FBRyxHQUFHLGtCQUFrQixDQUFDLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzdGLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN2RixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN0QixDQUFDO0FBQ0gsQ0FBQztBQXpCRDtJQUFDLFNBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUMsQ0FBQztlQU14QixTQUFTLENBQUMsTUFBTSxDQUFDOztnQkFOTztBQXlCdEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBSZXNvbHZlZFJlZmxlY3RpdmVQcm92aWRlcixcbiAgRGlyZWN0aXZlLFxuICBEeW5hbWljQ29tcG9uZW50TG9hZGVyLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBBdHRyaWJ1dGUsXG4gIENvbXBvbmVudFJlZixcbiAgQ29tcG9uZW50RmFjdG9yeSxcbiAgUmVmbGVjdGl2ZUluamVjdG9yLFxuICBPbkluaXRcbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge1JvdXRlck91dGxldE1hcH0gZnJvbSAnLi4vcm91dGVyJztcbmltcG9ydCB7REVGQVVMVF9PVVRMRVRfTkFNRX0gZnJvbSAnLi4vY29uc3RhbnRzJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ3JvdXRlci1vdXRsZXQnfSlcbmV4cG9ydCBjbGFzcyBSb3V0ZXJPdXRsZXQge1xuICBwcml2YXRlIF9sb2FkZWQ6IENvbXBvbmVudFJlZjtcbiAgcHVibGljIG91dGxldE1hcDogUm91dGVyT3V0bGV0TWFwO1xuXG4gIGNvbnN0cnVjdG9yKHBhcmVudE91dGxldE1hcDogUm91dGVyT3V0bGV0TWFwLCBwcml2YXRlIF9sb2NhdGlvbjogVmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgICAgICAgQEF0dHJpYnV0ZSgnbmFtZScpIG5hbWU6IHN0cmluZykge1xuICAgIHBhcmVudE91dGxldE1hcC5yZWdpc3Rlck91dGxldChpc0JsYW5rKG5hbWUpID8gREVGQVVMVF9PVVRMRVRfTkFNRSA6IG5hbWUsIHRoaXMpO1xuICB9XG5cbiAgdW5sb2FkKCk6IHZvaWQge1xuICAgIHRoaXMuX2xvYWRlZC5kZXN0cm95KCk7XG4gICAgdGhpcy5fbG9hZGVkID0gbnVsbDtcbiAgfVxuXG4gIGxvYWQoZmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeSwgcHJvdmlkZXJzOiBSZXNvbHZlZFJlZmxlY3RpdmVQcm92aWRlcltdLFxuICAgICAgIG91dGxldE1hcDogUm91dGVyT3V0bGV0TWFwKTogQ29tcG9uZW50UmVmIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2xvYWRlZCkpIHtcbiAgICAgIHRoaXMudW5sb2FkKCk7XG4gICAgfVxuICAgIHRoaXMub3V0bGV0TWFwID0gb3V0bGV0TWFwO1xuICAgIGxldCBpbmogPSBSZWZsZWN0aXZlSW5qZWN0b3IuZnJvbVJlc29sdmVkUHJvdmlkZXJzKHByb3ZpZGVycywgdGhpcy5fbG9jYXRpb24ucGFyZW50SW5qZWN0b3IpO1xuICAgIHRoaXMuX2xvYWRlZCA9IHRoaXMuX2xvY2F0aW9uLmNyZWF0ZUNvbXBvbmVudChmYWN0b3J5LCB0aGlzLl9sb2NhdGlvbi5sZW5ndGgsIGluaiwgW10pO1xuICAgIHJldHVybiB0aGlzLl9sb2FkZWQ7XG4gIH1cbn0iXX0=