'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var application_ref_1 = require('angular2/src/core/application_ref');
var di_1 = require('angular2/src/core/di');
/**
 * A no-op implementation of {@link ApplicationRef}, useful for testing.
 */
var MockApplicationRef = (function (_super) {
    __extends(MockApplicationRef, _super);
    function MockApplicationRef() {
        _super.apply(this, arguments);
    }
    MockApplicationRef.prototype.registerBootstrapListener = function (listener) { };
    MockApplicationRef.prototype.registerDisposeListener = function (dispose) { };
    MockApplicationRef.prototype.bootstrap = function (componentType, bindings) {
        return null;
    };
    Object.defineProperty(MockApplicationRef.prototype, "injector", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(MockApplicationRef.prototype, "zone", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    ;
    MockApplicationRef.prototype.dispose = function () { };
    MockApplicationRef.prototype.tick = function () { };
    Object.defineProperty(MockApplicationRef.prototype, "componentTypes", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    ;
    MockApplicationRef = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MockApplicationRef);
    return MockApplicationRef;
}(application_ref_1.ApplicationRef));
exports.MockApplicationRef = MockApplicationRef;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19hcHBsaWNhdGlvbl9yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLUs5S0EzYW5ULnRtcC9hbmd1bGFyMi9zcmMvbW9jay9tb2NrX2FwcGxpY2F0aW9uX3JlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxnQ0FBNkIsbUNBQW1DLENBQUMsQ0FBQTtBQUNqRSxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQU1oRDs7R0FFRztBQUVIO0lBQXdDLHNDQUFjO0lBQXREO1FBQXdDLDhCQUFjO0lBa0J0RCxDQUFDO0lBakJDLHNEQUF5QixHQUF6QixVQUEwQixRQUFxQyxJQUFTLENBQUM7SUFFekUsb0RBQXVCLEdBQXZCLFVBQXdCLE9BQW1CLElBQVMsQ0FBQztJQUVyRCxzQ0FBUyxHQUFULFVBQVUsYUFBbUIsRUFBRSxRQUF5QztRQUN0RSxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELHNCQUFJLHdDQUFRO2FBQVosY0FBMkIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7OztPQUFBOztJQUV6QyxzQkFBSSxvQ0FBSTthQUFSLGNBQXFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTs7SUFFbkMsb0NBQU8sR0FBUCxjQUFpQixDQUFDO0lBRWxCLGlDQUFJLEdBQUosY0FBYyxDQUFDO0lBRWYsc0JBQUksOENBQWM7YUFBbEIsY0FBK0IsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7OztPQUFBOztJQWxCL0M7UUFBQyxlQUFVLEVBQUU7OzBCQUFBO0lBbUJiLHlCQUFDO0FBQUQsQ0FBQyxBQWxCRCxDQUF3QyxnQ0FBYyxHQWtCckQ7QUFsQlksMEJBQWtCLHFCQWtCOUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXBwbGljYXRpb25SZWZ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2FwcGxpY2F0aW9uX3JlZic7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7VHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7Q29tcG9uZW50UmVmfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcG9uZW50X2ZhY3RvcnknO1xuaW1wb3J0IHtQcm92aWRlciwgSW5qZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7Tmdab25lfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS96b25lL25nX3pvbmUnO1xuXG4vKipcbiAqIEEgbm8tb3AgaW1wbGVtZW50YXRpb24gb2Yge0BsaW5rIEFwcGxpY2F0aW9uUmVmfSwgdXNlZnVsIGZvciB0ZXN0aW5nLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTW9ja0FwcGxpY2F0aW9uUmVmIGV4dGVuZHMgQXBwbGljYXRpb25SZWYge1xuICByZWdpc3RlckJvb3RzdHJhcExpc3RlbmVyKGxpc3RlbmVyOiAocmVmOiBDb21wb25lbnRSZWYpID0+IHZvaWQpOiB2b2lkIHt9XG5cbiAgcmVnaXN0ZXJEaXNwb3NlTGlzdGVuZXIoZGlzcG9zZTogKCkgPT4gdm9pZCk6IHZvaWQge31cblxuICBib290c3RyYXAoY29tcG9uZW50VHlwZTogVHlwZSwgYmluZGluZ3M/OiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBQcm9taXNlPENvbXBvbmVudFJlZj4ge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIG51bGw7IH07XG5cbiAgZ2V0IHpvbmUoKTogTmdab25lIHsgcmV0dXJuIG51bGw7IH07XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHt9XG5cbiAgdGljaygpOiB2b2lkIHt9XG5cbiAgZ2V0IGNvbXBvbmVudFR5cGVzKCk6IFR5cGVbXSB7IHJldHVybiBudWxsOyB9O1xufVxuIl19