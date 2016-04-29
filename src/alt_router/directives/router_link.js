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
var core_1 = require('angular2/core');
var router_1 = require('../router');
var link_1 = require('../link');
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var RouterLink = (function () {
    function RouterLink(_router) {
        var _this = this;
        this._router = _router;
        this._changes = [];
        this._subscription = async_1.ObservableWrapper.subscribe(_router.changes, function (_) {
            _this._targetUrl = _router.urlTree;
            _this._updateTargetUrlAndHref();
        });
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
            this._router.navigate(this._targetUrl);
            return false;
        }
        return true;
    };
    RouterLink.prototype._updateTargetUrlAndHref = function () {
        this._targetUrl = link_1.link(null, this._router.urlTree, this._changes);
        this.href = this._router.serializeUrl(this._targetUrl);
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
        __metadata('design:paramtypes', [router_1.Router])
    ], RouterLink);
    return RouterLink;
}());
exports.RouterLink = RouterLink;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVc1VmdLbkJGLnRtcC9hbmd1bGFyMi9zcmMvYWx0X3JvdXRlci9kaXJlY3RpdmVzL3JvdXRlcl9saW5rLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxxQkFjTyxlQUFlLENBQUMsQ0FBQTtBQUN2Qix1QkFBc0MsV0FBVyxDQUFDLENBQUE7QUFFbEQscUJBQW1CLFNBQVMsQ0FBQyxDQUFBO0FBQzdCLHFCQUF1QiwwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xELHNCQUFnQywyQkFBMkIsQ0FBQyxDQUFBO0FBRzVEO0lBUUUsb0JBQW9CLE9BQWU7UUFSckMsaUJBb0NDO1FBNUJxQixZQUFPLEdBQVAsT0FBTyxDQUFRO1FBTjNCLGFBQVEsR0FBVSxFQUFFLENBQUM7UUFPM0IsSUFBSSxDQUFDLGFBQWEsR0FBRyx5QkFBaUIsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxVQUFDLENBQUM7WUFDbEUsS0FBSSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO1lBQ2xDLEtBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1FBQ2pDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELGdDQUFXLEdBQVgsY0FBZ0IseUJBQWlCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFHaEUsc0JBQUksa0NBQVU7YUFBZCxVQUFlLElBQVc7WUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDckIsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFDakMsQ0FBQzs7O09BQUE7SUFHRCw0QkFBTyxHQUFQO1FBQ0UsRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdkMsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNmLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVPLDRDQUF1QixHQUEvQjtRQUNFLElBQUksQ0FBQyxVQUFVLEdBQUcsV0FBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQWxDRDtRQUFDLFlBQUssRUFBRTs7OENBQUE7SUFLUjtRQUFDLGtCQUFXLEVBQUU7OzRDQUFBO0lBV2Q7UUFBQyxZQUFLLEVBQUU7OztnREFBQTtJQU1SO1FBQUMsbUJBQVksQ0FBQyxPQUFPLENBQUM7Ozs7NkNBQUE7SUF4QnhCO1FBQUMsZ0JBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUMsQ0FBQzs7a0JBQUE7SUFxQ3RDLGlCQUFDO0FBQUQsQ0FBQyxBQXBDRCxJQW9DQztBQXBDWSxrQkFBVSxhQW9DdEIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIFJlc29sdmVkUmVmbGVjdGl2ZVByb3ZpZGVyLFxuICBEaXJlY3RpdmUsXG4gIER5bmFtaWNDb21wb25lbnRMb2FkZXIsXG4gIFZpZXdDb250YWluZXJSZWYsXG4gIEF0dHJpYnV0ZSxcbiAgQ29tcG9uZW50UmVmLFxuICBDb21wb25lbnRGYWN0b3J5LFxuICBSZWZsZWN0aXZlSW5qZWN0b3IsXG4gIE9uSW5pdCxcbiAgSG9zdExpc3RlbmVyLFxuICBIb3N0QmluZGluZyxcbiAgSW5wdXQsXG4gIE9uRGVzdHJveVxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7Um91dGVyT3V0bGV0TWFwLCBSb3V0ZXJ9IGZyb20gJy4uL3JvdXRlcic7XG5pbXBvcnQge1JvdXRlU2VnbWVudCwgVXJsU2VnbWVudCwgVHJlZX0gZnJvbSAnLi4vc2VnbWVudHMnO1xuaW1wb3J0IHtsaW5rfSBmcm9tICcuLi9saW5rJztcbmltcG9ydCB7aXNTdHJpbmd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge09ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbcm91dGVyTGlua10nfSlcbmV4cG9ydCBjbGFzcyBSb3V0ZXJMaW5rIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgQElucHV0KCkgdGFyZ2V0OiBzdHJpbmc7XG4gIHByaXZhdGUgX2NoYW5nZXM6IGFueVtdID0gW107XG4gIHByaXZhdGUgX3RhcmdldFVybDogVHJlZTxVcmxTZWdtZW50PjtcbiAgcHJpdmF0ZSBfc3Vic2NyaXB0aW9uOiBhbnk7XG5cbiAgQEhvc3RCaW5kaW5nKCkgcHJpdmF0ZSBocmVmOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcm91dGVyOiBSb3V0ZXIpIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUoX3JvdXRlci5jaGFuZ2VzLCAoXykgPT4ge1xuICAgICAgdGhpcy5fdGFyZ2V0VXJsID0gX3JvdXRlci51cmxUcmVlO1xuICAgICAgdGhpcy5fdXBkYXRlVGFyZ2V0VXJsQW5kSHJlZigpO1xuICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7IE9ic2VydmFibGVXcmFwcGVyLmRpc3Bvc2UodGhpcy5fc3Vic2NyaXB0aW9uKTsgfVxuXG4gIEBJbnB1dCgpXG4gIHNldCByb3V0ZXJMaW5rKGRhdGE6IGFueVtdKSB7XG4gICAgdGhpcy5fY2hhbmdlcyA9IGRhdGE7XG4gICAgdGhpcy5fdXBkYXRlVGFyZ2V0VXJsQW5kSHJlZigpO1xuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcihcImNsaWNrXCIpXG4gIG9uQ2xpY2soKTogYm9vbGVhbiB7XG4gICAgaWYgKCFpc1N0cmluZyh0aGlzLnRhcmdldCkgfHwgdGhpcy50YXJnZXQgPT0gJ19zZWxmJykge1xuICAgICAgdGhpcy5fcm91dGVyLm5hdmlnYXRlKHRoaXMuX3RhcmdldFVybCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlVGFyZ2V0VXJsQW5kSHJlZigpOiB2b2lkIHtcbiAgICB0aGlzLl90YXJnZXRVcmwgPSBsaW5rKG51bGwsIHRoaXMuX3JvdXRlci51cmxUcmVlLCB0aGlzLl9jaGFuZ2VzKTtcbiAgICB0aGlzLmhyZWYgPSB0aGlzLl9yb3V0ZXIuc2VyaWFsaXplVXJsKHRoaXMuX3RhcmdldFVybCk7XG4gIH1cbn0iXX0=