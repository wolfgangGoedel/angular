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
var core_1 = require('angular2/core');
var router_1 = require('../router');
var constants_1 = require('../constants');
var lang_1 = require('angular2/src/facade/lang');
var RouterOutlet = (function () {
    function RouterOutlet(parentOutletMap, _location, name) {
        this._location = _location;
        parentOutletMap.registerOutlet(lang_1.isBlank(name) ? constants_1.DEFAULT_OUTLET_NAME : name, this);
    }
    RouterOutlet.prototype.unload = function () {
        this._loaded.destroy();
        this._loaded = null;
    };
    RouterOutlet.prototype.load = function (factory, providers, outletMap) {
        if (lang_1.isPresent(this._loaded)) {
            this.unload();
        }
        this.outletMap = outletMap;
        var inj = core_1.ReflectiveInjector.fromResolvedProviders(providers, this._location.parentInjector);
        this._loaded = this._location.createComponent(factory, this._location.length, inj, []);
        return this._loaded;
    };
    RouterOutlet = __decorate([
        core_1.Directive({ selector: 'router-outlet' }),
        __param(2, core_1.Attribute('name')), 
        __metadata('design:paramtypes', [router_1.RouterOutletMap, core_1.ViewContainerRef, String])
    ], RouterOutlet);
    return RouterOutlet;
}());
exports.RouterOutlet = RouterOutlet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtVzVWZ0tuQkYudG1wL2FuZ3VsYXIyL3NyYy9hbHRfcm91dGVyL2RpcmVjdGl2ZXMvcm91dGVyX291dGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEscUJBVU8sZUFBZSxDQUFDLENBQUE7QUFDdkIsdUJBQThCLFdBQVcsQ0FBQyxDQUFBO0FBQzFDLDBCQUFrQyxjQUFjLENBQUMsQ0FBQTtBQUNqRCxxQkFBaUMsMEJBQTBCLENBQUMsQ0FBQTtBQUc1RDtJQUlFLHNCQUFZLGVBQWdDLEVBQVUsU0FBMkIsRUFDbEQsSUFBWTtRQURXLGNBQVMsR0FBVCxTQUFTLENBQWtCO1FBRS9FLGVBQWUsQ0FBQyxjQUFjLENBQUMsY0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLCtCQUFtQixHQUFHLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNuRixDQUFDO0lBRUQsNkJBQU0sR0FBTjtRQUNFLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7SUFDdEIsQ0FBQztJQUVELDJCQUFJLEdBQUosVUFBSyxPQUF5QixFQUFFLFNBQXVDLEVBQ2xFLFNBQTBCO1FBQzdCLEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDaEIsQ0FBQztRQUNELElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksR0FBRyxHQUFHLHlCQUFrQixDQUFDLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzdGLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN2RixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN0QixDQUFDO0lBeEJIO1FBQUMsZ0JBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUMsQ0FBQzttQkFNeEIsZ0JBQVMsQ0FBQyxNQUFNLENBQUM7O29CQU5PO0lBeUJ2QyxtQkFBQztBQUFELENBQUMsQUF4QkQsSUF3QkM7QUF4Qlksb0JBQVksZUF3QnhCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBSZXNvbHZlZFJlZmxlY3RpdmVQcm92aWRlcixcbiAgRGlyZWN0aXZlLFxuICBEeW5hbWljQ29tcG9uZW50TG9hZGVyLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBBdHRyaWJ1dGUsXG4gIENvbXBvbmVudFJlZixcbiAgQ29tcG9uZW50RmFjdG9yeSxcbiAgUmVmbGVjdGl2ZUluamVjdG9yLFxuICBPbkluaXRcbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge1JvdXRlck91dGxldE1hcH0gZnJvbSAnLi4vcm91dGVyJztcbmltcG9ydCB7REVGQVVMVF9PVVRMRVRfTkFNRX0gZnJvbSAnLi4vY29uc3RhbnRzJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ3JvdXRlci1vdXRsZXQnfSlcbmV4cG9ydCBjbGFzcyBSb3V0ZXJPdXRsZXQge1xuICBwcml2YXRlIF9sb2FkZWQ6IENvbXBvbmVudFJlZjtcbiAgcHVibGljIG91dGxldE1hcDogUm91dGVyT3V0bGV0TWFwO1xuXG4gIGNvbnN0cnVjdG9yKHBhcmVudE91dGxldE1hcDogUm91dGVyT3V0bGV0TWFwLCBwcml2YXRlIF9sb2NhdGlvbjogVmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgICAgICAgQEF0dHJpYnV0ZSgnbmFtZScpIG5hbWU6IHN0cmluZykge1xuICAgIHBhcmVudE91dGxldE1hcC5yZWdpc3Rlck91dGxldChpc0JsYW5rKG5hbWUpID8gREVGQVVMVF9PVVRMRVRfTkFNRSA6IG5hbWUsIHRoaXMpO1xuICB9XG5cbiAgdW5sb2FkKCk6IHZvaWQge1xuICAgIHRoaXMuX2xvYWRlZC5kZXN0cm95KCk7XG4gICAgdGhpcy5fbG9hZGVkID0gbnVsbDtcbiAgfVxuXG4gIGxvYWQoZmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeSwgcHJvdmlkZXJzOiBSZXNvbHZlZFJlZmxlY3RpdmVQcm92aWRlcltdLFxuICAgICAgIG91dGxldE1hcDogUm91dGVyT3V0bGV0TWFwKTogQ29tcG9uZW50UmVmIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2xvYWRlZCkpIHtcbiAgICAgIHRoaXMudW5sb2FkKCk7XG4gICAgfVxuICAgIHRoaXMub3V0bGV0TWFwID0gb3V0bGV0TWFwO1xuICAgIGxldCBpbmogPSBSZWZsZWN0aXZlSW5qZWN0b3IuZnJvbVJlc29sdmVkUHJvdmlkZXJzKHByb3ZpZGVycywgdGhpcy5fbG9jYXRpb24ucGFyZW50SW5qZWN0b3IpO1xuICAgIHRoaXMuX2xvYWRlZCA9IHRoaXMuX2xvY2F0aW9uLmNyZWF0ZUNvbXBvbmVudChmYWN0b3J5LCB0aGlzLl9sb2NhdGlvbi5sZW5ndGgsIGluaiwgW10pO1xuICAgIHJldHVybiB0aGlzLl9sb2FkZWQ7XG4gIH1cbn0iXX0=