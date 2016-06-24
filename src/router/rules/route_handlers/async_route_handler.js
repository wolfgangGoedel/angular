'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var instruction_1 = require('../../instruction');
var AsyncRouteHandler = (function () {
    function AsyncRouteHandler(_loader, data) {
        if (data === void 0) { data = null; }
        this._loader = _loader;
        /** @internal */
        this._resolvedComponent = null;
        this.data = lang_1.isPresent(data) ? new instruction_1.RouteData(data) : instruction_1.BLANK_ROUTE_DATA;
    }
    AsyncRouteHandler.prototype.resolveComponentType = function () {
        var _this = this;
        if (lang_1.isPresent(this._resolvedComponent)) {
            return this._resolvedComponent;
        }
        return this._resolvedComponent = this._loader().then(function (componentType) {
            _this.componentType = componentType;
            return componentType;
        });
    };
    return AsyncRouteHandler;
}());
exports.AsyncRouteHandler = AsyncRouteHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfcm91dGVfaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtQU9hY21ZOFQudG1wL2FuZ3VsYXIyL3NyYy9yb3V0ZXIvcnVsZXMvcm91dGVfaGFuZGxlcnMvYXN5bmNfcm91dGVfaGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEscUJBQXdCLDBCQUEwQixDQUFDLENBQUE7QUFHbkQsNEJBQTBDLG1CQUFtQixDQUFDLENBQUE7QUFFOUQ7SUFNRSwyQkFBb0IsT0FBdUQsRUFDL0QsSUFBaUM7UUFBakMsb0JBQWlDLEdBQWpDLFdBQWlDO1FBRHpCLFlBQU8sR0FBUCxPQUFPLENBQWdEO1FBTDNFLGdCQUFnQjtRQUNoQix1QkFBa0IsR0FBNkMsSUFBSSxDQUFDO1FBTWxFLElBQUksQ0FBQyxJQUFJLEdBQUcsZ0JBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLHVCQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsOEJBQWdCLENBQUM7SUFDdkUsQ0FBQztJQUVELGdEQUFvQixHQUFwQjtRQUFBLGlCQVNDO1FBUkMsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUNqQyxDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQUMsYUFBYTtZQUNqRSxLQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztZQUNuQyxNQUFNLENBQUMsYUFBYSxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNILHdCQUFDO0FBQUQsQ0FBQyxBQXJCRCxJQXFCQztBQXJCWSx5QkFBaUIsb0JBcUI3QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmltcG9ydCB7Um91dGVIYW5kbGVyfSBmcm9tICcuL3JvdXRlX2hhbmRsZXInO1xuaW1wb3J0IHtSb3V0ZURhdGEsIEJMQU5LX1JPVVRFX0RBVEF9IGZyb20gJy4uLy4uL2luc3RydWN0aW9uJztcblxuZXhwb3J0IGNsYXNzIEFzeW5jUm91dGVIYW5kbGVyIGltcGxlbWVudHMgUm91dGVIYW5kbGVyIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVzb2x2ZWRDb21wb25lbnQ6IFByb21pc2U8YW55IC8qVHlwZSB8IENvbXBvbmVudEZhY3RvcnkqLz4gPSBudWxsO1xuICBjb21wb25lbnRUeXBlOiBhbnkgLypUeXBlIHwgQ29tcG9uZW50RmFjdG9yeSovO1xuICBwdWJsaWMgZGF0YTogUm91dGVEYXRhO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2xvYWRlcjogKCkgPT4gUHJvbWlzZTxhbnkgLypUeXBlIHwgQ29tcG9uZW50RmFjdG9yeSovPixcbiAgICAgICAgICAgICAgZGF0YToge1trZXk6IHN0cmluZ106IGFueX0gPSBudWxsKSB7XG4gICAgdGhpcy5kYXRhID0gaXNQcmVzZW50KGRhdGEpID8gbmV3IFJvdXRlRGF0YShkYXRhKSA6IEJMQU5LX1JPVVRFX0RBVEE7XG4gIH1cblxuICByZXNvbHZlQ29tcG9uZW50VHlwZSgpOiBQcm9taXNlPGFueSAvKlR5cGUgfCBDb21wb25lbnRGYWN0b3J5Ki8+IHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3Jlc29sdmVkQ29tcG9uZW50KSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3Jlc29sdmVkQ29tcG9uZW50O1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9yZXNvbHZlZENvbXBvbmVudCA9IHRoaXMuX2xvYWRlcigpLnRoZW4oKGNvbXBvbmVudFR5cGUpID0+IHtcbiAgICAgIHRoaXMuY29tcG9uZW50VHlwZSA9IGNvbXBvbmVudFR5cGU7XG4gICAgICByZXR1cm4gY29tcG9uZW50VHlwZTtcbiAgICB9KTtcbiAgfVxufVxuIl19