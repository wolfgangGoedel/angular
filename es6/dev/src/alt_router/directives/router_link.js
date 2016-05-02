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
import { Directive, HostListener, HostBinding, Input, Optional } from 'angular2/core';
import { Router } from '../router';
import { RouteSegment } from '../segments';
import { isString, isPresent } from 'angular2/src/facade/lang';
import { ObservableWrapper } from 'angular2/src/facade/async';
export let RouterLink = class RouterLink {
    constructor(_routeSegment, _router) {
        this._routeSegment = _routeSegment;
        this._router = _router;
        this._changes = [];
        this.isActive = false;
        this._subscription =
            ObservableWrapper.subscribe(_router.changes, (_) => { this._updateTargetUrlAndHref(); });
    }
    ngOnDestroy() { ObservableWrapper.dispose(this._subscription); }
    set routerLink(data) {
        this._changes = data;
        this._updateTargetUrlAndHref();
    }
    onClick() {
        if (!isString(this.target) || this.target == '_self') {
            this._router.navigate(this._changes, this._routeSegment);
            return false;
        }
        return true;
    }
    _updateTargetUrlAndHref() {
        let tree = this._router.createUrlTree(this._changes, this._routeSegment);
        if (isPresent(tree)) {
            this.href = this._router.serializeUrl(tree);
            this.isActive = this._router.urlTree.contains(tree);
        }
        else {
            this.isActive = false;
        }
    }
};
__decorate([
    Input(), 
    __metadata('design:type', String)
], RouterLink.prototype, "target", void 0);
__decorate([
    HostBinding(), 
    __metadata('design:type', String)
], RouterLink.prototype, "href", void 0);
__decorate([
    HostBinding('class.router-link-active'), 
    __metadata('design:type', Boolean)
], RouterLink.prototype, "isActive", void 0);
__decorate([
    Input(), 
    __metadata('design:type', Array), 
    __metadata('design:paramtypes', [Array])
], RouterLink.prototype, "routerLink", null);
__decorate([
    HostListener("click"), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', []), 
    __metadata('design:returntype', Boolean)
], RouterLink.prototype, "onClick", null);
RouterLink = __decorate([
    Directive({ selector: '[routerLink]' }),
    __param(0, Optional()), 
    __metadata('design:paramtypes', [RouteSegment, Router])
], RouterLink);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVY3N2thRXBHLnRtcC9hbmd1bGFyMi9zcmMvYWx0X3JvdXRlci9kaXJlY3RpdmVzL3JvdXRlcl9saW5rLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztPQUFPLEVBRUwsU0FBUyxFQVFULFlBQVksRUFDWixXQUFXLEVBQ1gsS0FBSyxFQUVMLFFBQVEsRUFDVCxNQUFNLGVBQWU7T0FDZixFQUFrQixNQUFNLEVBQUMsTUFBTSxXQUFXO09BQzFDLEVBQUMsWUFBWSxFQUFtQixNQUFNLGFBQWE7T0FDbkQsRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFDLE1BQU0sMEJBQTBCO09BQ3JELEVBQUMsaUJBQWlCLEVBQUMsTUFBTSwyQkFBMkI7QUFHM0Q7SUFRRSxZQUFnQyxhQUEyQixFQUFVLE9BQWU7UUFBcEQsa0JBQWEsR0FBYixhQUFhLENBQWM7UUFBVSxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBTjVFLGFBQVEsR0FBVSxFQUFFLENBQUM7UUFJb0IsYUFBUSxHQUFZLEtBQUssQ0FBQztRQUd6RSxJQUFJLENBQUMsYUFBYTtZQUNkLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0YsQ0FBQztJQUVELFdBQVcsS0FBSyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUdoRSxJQUFJLFVBQVUsQ0FBQyxJQUFXO1FBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFHRCxPQUFPO1FBQ0wsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN6RCxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRU8sdUJBQXVCO1FBQzdCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3pFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUN4QixDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUM7QUF0Q0M7SUFBQyxLQUFLLEVBQUU7OzBDQUFBO0FBSVI7SUFBQyxXQUFXLEVBQUU7O3dDQUFBO0FBQ2Q7SUFBQyxXQUFXLENBQUMsMEJBQTBCLENBQUM7OzRDQUFBO0FBU3hDO0lBQUMsS0FBSyxFQUFFOzs7NENBQUE7QUFNUjtJQUFDLFlBQVksQ0FBQyxPQUFPLENBQUM7Ozs7eUNBQUE7QUF0QnhCO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLGNBQWMsRUFBQyxDQUFDO2VBU3ZCLFFBQVEsRUFBRTs7Y0FUYTtBQXdDckMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBSZXNvbHZlZFJlZmxlY3RpdmVQcm92aWRlcixcbiAgRGlyZWN0aXZlLFxuICBEeW5hbWljQ29tcG9uZW50TG9hZGVyLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBBdHRyaWJ1dGUsXG4gIENvbXBvbmVudFJlZixcbiAgQ29tcG9uZW50RmFjdG9yeSxcbiAgUmVmbGVjdGl2ZUluamVjdG9yLFxuICBPbkluaXQsXG4gIEhvc3RMaXN0ZW5lcixcbiAgSG9zdEJpbmRpbmcsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtSb3V0ZXJPdXRsZXRNYXAsIFJvdXRlcn0gZnJvbSAnLi4vcm91dGVyJztcbmltcG9ydCB7Um91dGVTZWdtZW50LCBVcmxTZWdtZW50LCBUcmVlfSBmcm9tICcuLi9zZWdtZW50cyc7XG5pbXBvcnQge2lzU3RyaW5nLCBpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge09ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbcm91dGVyTGlua10nfSlcbmV4cG9ydCBjbGFzcyBSb3V0ZXJMaW5rIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgQElucHV0KCkgdGFyZ2V0OiBzdHJpbmc7XG4gIHByaXZhdGUgX2NoYW5nZXM6IGFueVtdID0gW107XG4gIHByaXZhdGUgX3N1YnNjcmlwdGlvbjogYW55O1xuXG4gIEBIb3N0QmluZGluZygpIHByaXZhdGUgaHJlZjogc3RyaW5nO1xuICBASG9zdEJpbmRpbmcoJ2NsYXNzLnJvdXRlci1saW5rLWFjdGl2ZScpIHByaXZhdGUgaXNBY3RpdmU6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihAT3B0aW9uYWwoKSBwcml2YXRlIF9yb3V0ZVNlZ21lbnQ6IFJvdXRlU2VnbWVudCwgcHJpdmF0ZSBfcm91dGVyOiBSb3V0ZXIpIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPVxuICAgICAgICBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUoX3JvdXRlci5jaGFuZ2VzLCAoXykgPT4geyB0aGlzLl91cGRhdGVUYXJnZXRVcmxBbmRIcmVmKCk7IH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7IE9ic2VydmFibGVXcmFwcGVyLmRpc3Bvc2UodGhpcy5fc3Vic2NyaXB0aW9uKTsgfVxuXG4gIEBJbnB1dCgpXG4gIHNldCByb3V0ZXJMaW5rKGRhdGE6IGFueVtdKSB7XG4gICAgdGhpcy5fY2hhbmdlcyA9IGRhdGE7XG4gICAgdGhpcy5fdXBkYXRlVGFyZ2V0VXJsQW5kSHJlZigpO1xuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcihcImNsaWNrXCIpXG4gIG9uQ2xpY2soKTogYm9vbGVhbiB7XG4gICAgaWYgKCFpc1N0cmluZyh0aGlzLnRhcmdldCkgfHwgdGhpcy50YXJnZXQgPT0gJ19zZWxmJykge1xuICAgICAgdGhpcy5fcm91dGVyLm5hdmlnYXRlKHRoaXMuX2NoYW5nZXMsIHRoaXMuX3JvdXRlU2VnbWVudCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlVGFyZ2V0VXJsQW5kSHJlZigpOiB2b2lkIHtcbiAgICBsZXQgdHJlZSA9IHRoaXMuX3JvdXRlci5jcmVhdGVVcmxUcmVlKHRoaXMuX2NoYW5nZXMsIHRoaXMuX3JvdXRlU2VnbWVudCk7XG4gICAgaWYgKGlzUHJlc2VudCh0cmVlKSkge1xuICAgICAgdGhpcy5ocmVmID0gdGhpcy5fcm91dGVyLnNlcmlhbGl6ZVVybCh0cmVlKTtcbiAgICAgIHRoaXMuaXNBY3RpdmUgPSB0aGlzLl9yb3V0ZXIudXJsVHJlZS5jb250YWlucyh0cmVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgIH1cbiAgfVxufSJdfQ==