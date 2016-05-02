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
var segments_1 = require('../segments');
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var RouterLink = (function () {
    function RouterLink(_routeSegment, _router) {
        var _this = this;
        this._routeSegment = _routeSegment;
        this._router = _router;
        this._changes = [];
        this.isActive = false;
        this._subscription =
            async_1.ObservableWrapper.subscribe(_router.changes, function (_) { _this._updateTargetUrlAndHref(); });
    }
    RouterLink.prototype.ngOnDestroy = function () { async_1.ObservableWrapper.dispose(this._subscription); };
    Object.defineProperty(RouterLink.prototype, "routerLink", {
        set: function (data) {
            this._changes = data;
            this._updateTargetUrlAndHref();
        },
        enumerable: true,
        configurable: true
    });
    RouterLink.prototype.onClick = function () {
        if (!lang_1.isString(this.target) || this.target == '_self') {
            this._router.navigate(this._changes, this._routeSegment);
            return false;
        }
        return true;
    };
    RouterLink.prototype._updateTargetUrlAndHref = function () {
        var tree = this._router.createUrlTree(this._changes, this._routeSegment);
        if (lang_1.isPresent(tree)) {
            this.href = this._router.serializeUrl(tree);
            this.isActive = this._router.urlTree.contains(tree);
        }
        else {
            this.isActive = false;
        }
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], RouterLink.prototype, "target", void 0);
    __decorate([
        core_1.HostBinding(), 
        __metadata('design:type', String)
    ], RouterLink.prototype, "href", void 0);
    __decorate([
        core_1.HostBinding('class.router-link-active'), 
        __metadata('design:type', Boolean)
    ], RouterLink.prototype, "isActive", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Array), 
        __metadata('design:paramtypes', [Array])
    ], RouterLink.prototype, "routerLink", null);
    __decorate([
        core_1.HostListener("click"), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', Boolean)
    ], RouterLink.prototype, "onClick", null);
    RouterLink = __decorate([
        core_1.Directive({ selector: '[routerLink]' }),
        __param(0, core_1.Optional()), 
        __metadata('design:paramtypes', [segments_1.RouteSegment, router_1.Router])
    ], RouterLink);
    return RouterLink;
}());
exports.RouterLink = RouterLink;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLTEyR1QzUEp2LnRtcC9hbmd1bGFyMi9zcmMvYWx0X3JvdXRlci9kaXJlY3RpdmVzL3JvdXRlcl9saW5rLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQkFlTyxlQUFlLENBQUMsQ0FBQTtBQUN2Qix1QkFBc0MsV0FBVyxDQUFDLENBQUE7QUFDbEQseUJBQTZDLGFBQWEsQ0FBQyxDQUFBO0FBQzNELHFCQUFrQywwQkFBMEIsQ0FBQyxDQUFBO0FBQzdELHNCQUFnQywyQkFBMkIsQ0FBQyxDQUFBO0FBRzVEO0lBUUUsb0JBQWdDLGFBQTJCLEVBQVUsT0FBZTtRQVJ0RixpQkF1Q0M7UUEvQmlDLGtCQUFhLEdBQWIsYUFBYSxDQUFjO1FBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQU41RSxhQUFRLEdBQVUsRUFBRSxDQUFDO1FBSW9CLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFHekUsSUFBSSxDQUFDLGFBQWE7WUFDZCx5QkFBaUIsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxVQUFDLENBQUMsSUFBTyxLQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9GLENBQUM7SUFFRCxnQ0FBVyxHQUFYLGNBQWdCLHlCQUFpQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBR2hFLHNCQUFJLGtDQUFVO2FBQWQsVUFBZSxJQUFXO1lBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1lBQ3JCLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1FBQ2pDLENBQUM7OztPQUFBO0lBR0QsNEJBQU8sR0FBUDtRQUNFLEVBQUUsQ0FBQyxDQUFDLENBQUMsZUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDekQsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNmLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVPLDRDQUF1QixHQUEvQjtRQUNFLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3pFLEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDeEIsQ0FBQztJQUNILENBQUM7SUFyQ0Q7UUFBQyxZQUFLLEVBQUU7OzhDQUFBO0lBSVI7UUFBQyxrQkFBVyxFQUFFOzs0Q0FBQTtJQUNkO1FBQUMsa0JBQVcsQ0FBQywwQkFBMEIsQ0FBQzs7Z0RBQUE7SUFTeEM7UUFBQyxZQUFLLEVBQUU7OztnREFBQTtJQU1SO1FBQUMsbUJBQVksQ0FBQyxPQUFPLENBQUM7Ozs7NkNBQUE7SUF0QnhCO1FBQUMsZ0JBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUMsQ0FBQzttQkFTdkIsZUFBUSxFQUFFOztrQkFUYTtJQXdDdEMsaUJBQUM7QUFBRCxDQUFDLEFBdkNELElBdUNDO0FBdkNZLGtCQUFVLGFBdUN0QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgUmVzb2x2ZWRSZWZsZWN0aXZlUHJvdmlkZXIsXG4gIERpcmVjdGl2ZSxcbiAgRHluYW1pY0NvbXBvbmVudExvYWRlcixcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgQXR0cmlidXRlLFxuICBDb21wb25lbnRSZWYsXG4gIENvbXBvbmVudEZhY3RvcnksXG4gIFJlZmxlY3RpdmVJbmplY3RvcixcbiAgT25Jbml0LFxuICBIb3N0TGlzdGVuZXIsXG4gIEhvc3RCaW5kaW5nLFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbFxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7Um91dGVyT3V0bGV0TWFwLCBSb3V0ZXJ9IGZyb20gJy4uL3JvdXRlcic7XG5pbXBvcnQge1JvdXRlU2VnbWVudCwgVXJsU2VnbWVudCwgVHJlZX0gZnJvbSAnLi4vc2VnbWVudHMnO1xuaW1wb3J0IHtpc1N0cmluZywgaXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW3JvdXRlckxpbmtdJ30pXG5leHBvcnQgY2xhc3MgUm91dGVyTGluayBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIHRhcmdldDogc3RyaW5nO1xuICBwcml2YXRlIF9jaGFuZ2VzOiBhbnlbXSA9IFtdO1xuICBwcml2YXRlIF9zdWJzY3JpcHRpb246IGFueTtcblxuICBASG9zdEJpbmRpbmcoKSBwcml2YXRlIGhyZWY6IHN0cmluZztcbiAgQEhvc3RCaW5kaW5nKCdjbGFzcy5yb3V0ZXItbGluay1hY3RpdmUnKSBwcml2YXRlIGlzQWN0aXZlOiBib29sZWFuID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgcHJpdmF0ZSBfcm91dGVTZWdtZW50OiBSb3V0ZVNlZ21lbnQsIHByaXZhdGUgX3JvdXRlcjogUm91dGVyKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uID1cbiAgICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKF9yb3V0ZXIuY2hhbmdlcywgKF8pID0+IHsgdGhpcy5fdXBkYXRlVGFyZ2V0VXJsQW5kSHJlZigpOyB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkgeyBPYnNlcnZhYmxlV3JhcHBlci5kaXNwb3NlKHRoaXMuX3N1YnNjcmlwdGlvbik7IH1cblxuICBASW5wdXQoKVxuICBzZXQgcm91dGVyTGluayhkYXRhOiBhbnlbXSkge1xuICAgIHRoaXMuX2NoYW5nZXMgPSBkYXRhO1xuICAgIHRoaXMuX3VwZGF0ZVRhcmdldFVybEFuZEhyZWYoKTtcbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoXCJjbGlja1wiKVxuICBvbkNsaWNrKCk6IGJvb2xlYW4ge1xuICAgIGlmICghaXNTdHJpbmcodGhpcy50YXJnZXQpIHx8IHRoaXMudGFyZ2V0ID09ICdfc2VsZicpIHtcbiAgICAgIHRoaXMuX3JvdXRlci5uYXZpZ2F0ZSh0aGlzLl9jaGFuZ2VzLCB0aGlzLl9yb3V0ZVNlZ21lbnQpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVRhcmdldFVybEFuZEhyZWYoKTogdm9pZCB7XG4gICAgbGV0IHRyZWUgPSB0aGlzLl9yb3V0ZXIuY3JlYXRlVXJsVHJlZSh0aGlzLl9jaGFuZ2VzLCB0aGlzLl9yb3V0ZVNlZ21lbnQpO1xuICAgIGlmIChpc1ByZXNlbnQodHJlZSkpIHtcbiAgICAgIHRoaXMuaHJlZiA9IHRoaXMuX3JvdXRlci5zZXJpYWxpemVVcmwodHJlZSk7XG4gICAgICB0aGlzLmlzQWN0aXZlID0gdGhpcy5fcm91dGVyLnVybFRyZWUuY29udGFpbnModHJlZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaXNBY3RpdmUgPSBmYWxzZTtcbiAgICB9XG4gIH1cbn0iXX0=