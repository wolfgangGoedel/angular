var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive, HostListener, HostBinding, Input } from 'angular2/core';
import { Router } from '../router';
import { link } from '../link';
import { isString } from 'angular2/src/facade/lang';
import { ObservableWrapper } from 'angular2/src/facade/async';
export let RouterLink = class RouterLink {
    constructor(_router) {
        this._router = _router;
        this._changes = [];
        this._subscription = ObservableWrapper.subscribe(_router.changes, (_) => {
            this._targetUrl = _router.urlTree;
            this._updateTargetUrlAndHref();
        });
    }
    ngOnDestroy() { ObservableWrapper.dispose(this._subscription); }
    set routerLink(data) {
        this._changes = data;
        this._updateTargetUrlAndHref();
    }
    onClick() {
        if (!isString(this.target) || this.target == '_self') {
            this._router.navigate(this._targetUrl);
            return false;
        }
        return true;
    }
    _updateTargetUrlAndHref() {
        this._targetUrl = link(null, this._router.urlTree, this._changes);
        this.href = this._router.serializeUrl(this._targetUrl);
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
    __metadata('design:paramtypes', [Router])
], RouterLink);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLTU5Q2hmaG1ELnRtcC9hbmd1bGFyMi9zcmMvYWx0X3JvdXRlci9kaXJlY3RpdmVzL3JvdXRlcl9saW5rLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBRUwsU0FBUyxFQVFULFlBQVksRUFDWixXQUFXLEVBQ1gsS0FBSyxFQUVOLE1BQU0sZUFBZTtPQUNmLEVBQWtCLE1BQU0sRUFBQyxNQUFNLFdBQVc7T0FFMUMsRUFBQyxJQUFJLEVBQUMsTUFBTSxTQUFTO09BQ3JCLEVBQUMsUUFBUSxFQUFDLE1BQU0sMEJBQTBCO09BQzFDLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSwyQkFBMkI7QUFHM0Q7SUFRRSxZQUFvQixPQUFlO1FBQWYsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQU4zQixhQUFRLEdBQVUsRUFBRSxDQUFDO1FBTzNCLElBQUksQ0FBQyxhQUFhLEdBQUcsaUJBQWlCLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ2xFLElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztZQUNsQyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxXQUFXLEtBQUssaUJBQWlCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFHaEUsSUFBSSxVQUFVLENBQUMsSUFBVztRQUN4QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBR0QsT0FBTztRQUNMLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDZixDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFFTyx1QkFBdUI7UUFDN0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN6RCxDQUFDO0FBQ0gsQ0FBQztBQW5DQztJQUFDLEtBQUssRUFBRTs7MENBQUE7QUFLUjtJQUFDLFdBQVcsRUFBRTs7d0NBQUE7QUFXZDtJQUFDLEtBQUssRUFBRTs7OzRDQUFBO0FBTVI7SUFBQyxZQUFZLENBQUMsT0FBTyxDQUFDOzs7O3lDQUFBO0FBeEJ4QjtJQUFDLFNBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUMsQ0FBQzs7Y0FBQTtBQXFDckMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBSZXNvbHZlZFJlZmxlY3RpdmVQcm92aWRlcixcbiAgRGlyZWN0aXZlLFxuICBEeW5hbWljQ29tcG9uZW50TG9hZGVyLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBBdHRyaWJ1dGUsXG4gIENvbXBvbmVudFJlZixcbiAgQ29tcG9uZW50RmFjdG9yeSxcbiAgUmVmbGVjdGl2ZUluamVjdG9yLFxuICBPbkluaXQsXG4gIEhvc3RMaXN0ZW5lcixcbiAgSG9zdEJpbmRpbmcsXG4gIElucHV0LFxuICBPbkRlc3Ryb3lcbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge1JvdXRlck91dGxldE1hcCwgUm91dGVyfSBmcm9tICcuLi9yb3V0ZXInO1xuaW1wb3J0IHtSb3V0ZVNlZ21lbnQsIFVybFNlZ21lbnQsIFRyZWV9IGZyb20gJy4uL3NlZ21lbnRzJztcbmltcG9ydCB7bGlua30gZnJvbSAnLi4vbGluayc7XG5pbXBvcnQge2lzU3RyaW5nfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW3JvdXRlckxpbmtdJ30pXG5leHBvcnQgY2xhc3MgUm91dGVyTGluayBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIHRhcmdldDogc3RyaW5nO1xuICBwcml2YXRlIF9jaGFuZ2VzOiBhbnlbXSA9IFtdO1xuICBwcml2YXRlIF90YXJnZXRVcmw6IFRyZWU8VXJsU2VnbWVudD47XG4gIHByaXZhdGUgX3N1YnNjcmlwdGlvbjogYW55O1xuXG4gIEBIb3N0QmluZGluZygpIHByaXZhdGUgaHJlZjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3JvdXRlcjogUm91dGVyKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uID0gT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKF9yb3V0ZXIuY2hhbmdlcywgKF8pID0+IHtcbiAgICAgIHRoaXMuX3RhcmdldFVybCA9IF9yb3V0ZXIudXJsVHJlZTtcbiAgICAgIHRoaXMuX3VwZGF0ZVRhcmdldFVybEFuZEhyZWYoKTtcbiAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkgeyBPYnNlcnZhYmxlV3JhcHBlci5kaXNwb3NlKHRoaXMuX3N1YnNjcmlwdGlvbik7IH1cblxuICBASW5wdXQoKVxuICBzZXQgcm91dGVyTGluayhkYXRhOiBhbnlbXSkge1xuICAgIHRoaXMuX2NoYW5nZXMgPSBkYXRhO1xuICAgIHRoaXMuX3VwZGF0ZVRhcmdldFVybEFuZEhyZWYoKTtcbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoXCJjbGlja1wiKVxuICBvbkNsaWNrKCk6IGJvb2xlYW4ge1xuICAgIGlmICghaXNTdHJpbmcodGhpcy50YXJnZXQpIHx8IHRoaXMudGFyZ2V0ID09ICdfc2VsZicpIHtcbiAgICAgIHRoaXMuX3JvdXRlci5uYXZpZ2F0ZSh0aGlzLl90YXJnZXRVcmwpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVRhcmdldFVybEFuZEhyZWYoKTogdm9pZCB7XG4gICAgdGhpcy5fdGFyZ2V0VXJsID0gbGluayhudWxsLCB0aGlzLl9yb3V0ZXIudXJsVHJlZSwgdGhpcy5fY2hhbmdlcyk7XG4gICAgdGhpcy5ocmVmID0gdGhpcy5fcm91dGVyLnNlcmlhbGl6ZVVybCh0aGlzLl90YXJnZXRVcmwpO1xuICB9XG59Il19