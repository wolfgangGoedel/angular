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
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var view_utils_1 = require('./view_utils');
/**
 * Represents an instance of a Component created via a {@link ComponentFactory}.
 *
 * `ComponentRef` provides access to the Component Instance as well other objects related to this
 * Component Instance and allows you to destroy the Component Instance via the {@link #destroy}
 * method.
 */
var ComponentRef = (function () {
    function ComponentRef() {
    }
    Object.defineProperty(ComponentRef.prototype, "location", {
        /**
         * Location of the Host Element of this Component Instance.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComponentRef.prototype, "injector", {
        /**
         * The injector on which the component instance exists.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComponentRef.prototype, "instance", {
        /**
         * The instance of the Component.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ComponentRef.prototype, "hostView", {
        /**
         * The {@link ViewRef} of the Host View of this Component instance.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ComponentRef.prototype, "changeDetectorRef", {
        /**
         * The {@link ChangeDetectorRef} of the Component instance.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComponentRef.prototype, "componentType", {
        /**
         * The component type.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    return ComponentRef;
}());
exports.ComponentRef = ComponentRef;
var ComponentRef_ = (function (_super) {
    __extends(ComponentRef_, _super);
    function ComponentRef_(_hostElement, _componentType) {
        _super.call(this);
        this._hostElement = _hostElement;
        this._componentType = _componentType;
    }
    Object.defineProperty(ComponentRef_.prototype, "location", {
        get: function () { return this._hostElement.elementRef; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComponentRef_.prototype, "injector", {
        get: function () { return this._hostElement.injector; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComponentRef_.prototype, "instance", {
        get: function () { return this._hostElement.component; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ComponentRef_.prototype, "hostView", {
        get: function () { return this._hostElement.parentView.ref; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ComponentRef_.prototype, "changeDetectorRef", {
        get: function () { return this.hostView; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ComponentRef_.prototype, "componentType", {
        get: function () { return this._componentType; },
        enumerable: true,
        configurable: true
    });
    ComponentRef_.prototype.destroy = function () { this._hostElement.parentView.destroy(); };
    ComponentRef_.prototype.onDestroy = function (callback) { this.hostView.onDestroy(callback); };
    return ComponentRef_;
}(ComponentRef));
exports.ComponentRef_ = ComponentRef_;
var EMPTY_CONTEXT = lang_1.CONST_EXPR(new Object());
var ComponentFactory = (function () {
    function ComponentFactory(selector, _viewFactory, _componentType) {
        this.selector = selector;
        this._viewFactory = _viewFactory;
        this._componentType = _componentType;
    }
    Object.defineProperty(ComponentFactory.prototype, "componentType", {
        get: function () { return this._componentType; },
        enumerable: true,
        configurable: true
    });
    /**
     * Creates a new component.
     */
    ComponentFactory.prototype.create = function (injector, projectableNodes, rootSelectorOrNode) {
        if (projectableNodes === void 0) { projectableNodes = null; }
        if (rootSelectorOrNode === void 0) { rootSelectorOrNode = null; }
        var vu = injector.get(view_utils_1.ViewUtils);
        if (lang_1.isBlank(projectableNodes)) {
            projectableNodes = [];
        }
        // Note: Host views don't need a declarationAppElement!
        var hostView = this._viewFactory(vu, injector, null);
        var hostElement = hostView.create(EMPTY_CONTEXT, projectableNodes, rootSelectorOrNode);
        return new ComponentRef_(hostElement, this._componentType);
    };
    ComponentFactory = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [String, Function, lang_1.Type])
    ], ComponentFactory);
    return ComponentFactory;
}());
exports.ComponentFactory = ComponentFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X2ZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXp2WnZKdkZGLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcG9uZW50X2ZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EscUJBQTBELDBCQUEwQixDQUFDLENBQUE7QUFDckYsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFJN0QsMkJBQXdCLGNBQWMsQ0FBQyxDQUFBO0FBR3ZDOzs7Ozs7R0FNRztBQUNIO0lBQUE7SUF3Q0EsQ0FBQztJQXBDQyxzQkFBSSxrQ0FBUTtRQUhaOztXQUVHO2FBQ0gsY0FBNkIsTUFBTSxDQUFDLDBCQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBS3RELHNCQUFJLGtDQUFRO1FBSFo7O1dBRUc7YUFDSCxjQUEyQixNQUFNLENBQUMsMEJBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFLcEQsc0JBQUksa0NBQVE7UUFIWjs7V0FFRzthQUNILGNBQXNCLE1BQU0sQ0FBQywwQkFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTs7SUFLL0Msc0JBQUksa0NBQVE7UUFIWjs7V0FFRzthQUNILGNBQTBCLE1BQU0sQ0FBQywwQkFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTs7SUFLbkQsc0JBQUksMkNBQWlCO1FBSHJCOztXQUVHO2FBQ0gsY0FBNkMsTUFBTSxDQUFDLDBCQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBS3RFLHNCQUFJLHVDQUFhO1FBSGpCOztXQUVHO2FBQ0gsY0FBNEIsTUFBTSxDQUFDLDBCQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBV3ZELG1CQUFDO0FBQUQsQ0FBQyxBQXhDRCxJQXdDQztBQXhDcUIsb0JBQVksZUF3Q2pDLENBQUE7QUFFRDtJQUFt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XG5pbXBvcnQge1R5cGUsIENPTlNULCBDT05TVF9FWFBSLCBpc1ByZXNlbnQsIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge3VuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0VsZW1lbnRSZWZ9IGZyb20gJy4vZWxlbWVudF9yZWYnO1xuaW1wb3J0IHtWaWV3UmVmLCBWaWV3UmVmX30gZnJvbSAnLi92aWV3X3JlZic7XG5pbXBvcnQge0FwcEVsZW1lbnR9IGZyb20gJy4vZWxlbWVudCc7XG5pbXBvcnQge1ZpZXdVdGlsc30gZnJvbSAnLi92aWV3X3V0aWxzJztcbmltcG9ydCB7Q2hhbmdlRGV0ZWN0b3JSZWZ9IGZyb20gJy4uL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbic7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBpbnN0YW5jZSBvZiBhIENvbXBvbmVudCBjcmVhdGVkIHZpYSBhIHtAbGluayBDb21wb25lbnRGYWN0b3J5fS5cbiAqXG4gKiBgQ29tcG9uZW50UmVmYCBwcm92aWRlcyBhY2Nlc3MgdG8gdGhlIENvbXBvbmVudCBJbnN0YW5jZSBhcyB3ZWxsIG90aGVyIG9iamVjdHMgcmVsYXRlZCB0byB0aGlzXG4gKiBDb21wb25lbnQgSW5zdGFuY2UgYW5kIGFsbG93cyB5b3UgdG8gZGVzdHJveSB0aGUgQ29tcG9uZW50IEluc3RhbmNlIHZpYSB0aGUge0BsaW5rICNkZXN0cm95fVxuICogbWV0aG9kLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcG9uZW50UmVmIHtcbiAgLyoqXG4gICAqIExvY2F0aW9uIG9mIHRoZSBIb3N0IEVsZW1lbnQgb2YgdGhpcyBDb21wb25lbnQgSW5zdGFuY2UuXG4gICAqL1xuICBnZXQgbG9jYXRpb24oKTogRWxlbWVudFJlZiB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cblxuICAvKipcbiAgICogVGhlIGluamVjdG9yIG9uIHdoaWNoIHRoZSBjb21wb25lbnQgaW5zdGFuY2UgZXhpc3RzLlxuICAgKi9cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfVxuXG4gIC8qKlxuICAgKiBUaGUgaW5zdGFuY2Ugb2YgdGhlIENvbXBvbmVudC5cbiAgICovXG4gIGdldCBpbnN0YW5jZSgpOiBhbnkgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBUaGUge0BsaW5rIFZpZXdSZWZ9IG9mIHRoZSBIb3N0IFZpZXcgb2YgdGhpcyBDb21wb25lbnQgaW5zdGFuY2UuXG4gICAqL1xuICBnZXQgaG9zdFZpZXcoKTogVmlld1JlZiB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH07XG5cbiAgLyoqXG4gICAqIFRoZSB7QGxpbmsgQ2hhbmdlRGV0ZWN0b3JSZWZ9IG9mIHRoZSBDb21wb25lbnQgaW5zdGFuY2UuXG4gICAqL1xuICBnZXQgY2hhbmdlRGV0ZWN0b3JSZWYoKTogQ2hhbmdlRGV0ZWN0b3JSZWYgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9XG5cbiAgLyoqXG4gICAqIFRoZSBjb21wb25lbnQgdHlwZS5cbiAgICovXG4gIGdldCBjb21wb25lbnRUeXBlKCk6IFR5cGUgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoZSBjb21wb25lbnQgaW5zdGFuY2UgYW5kIGFsbCBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmVzIGFzc29jaWF0ZWQgd2l0aCBpdC5cbiAgICovXG4gIGFic3RyYWN0IGRlc3Ryb3koKTogdm9pZDtcblxuICAvKipcbiAgICogQWxsb3dzIHRvIHJlZ2lzdGVyIGEgY2FsbGJhY2sgdGhhdCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZSBjb21wb25lbnQgaXMgZGVzdHJveWVkLlxuICAgKi9cbiAgYWJzdHJhY3Qgb25EZXN0cm95KGNhbGxiYWNrOiBGdW5jdGlvbik6IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRSZWZfIGV4dGVuZHMgQ29tcG9uZW50UmVmIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfaG9zdEVsZW1lbnQ6IEFwcEVsZW1lbnQsIHByaXZhdGUgX2NvbXBvbmVudFR5cGU6IFR5cGUpIHsgc3VwZXIoKTsgfVxuICBnZXQgbG9jYXRpb24oKTogRWxlbWVudFJlZiB7IHJldHVybiB0aGlzLl9ob3N0RWxlbWVudC5lbGVtZW50UmVmOyB9XG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLl9ob3N0RWxlbWVudC5pbmplY3RvcjsgfVxuICBnZXQgaW5zdGFuY2UoKTogYW55IHsgcmV0dXJuIHRoaXMuX2hvc3RFbGVtZW50LmNvbXBvbmVudDsgfTtcbiAgZ2V0IGhvc3RWaWV3KCk6IFZpZXdSZWYgeyByZXR1cm4gdGhpcy5faG9zdEVsZW1lbnQucGFyZW50Vmlldy5yZWY7IH07XG4gIGdldCBjaGFuZ2VEZXRlY3RvclJlZigpOiBDaGFuZ2VEZXRlY3RvclJlZiB7IHJldHVybiB0aGlzLmhvc3RWaWV3OyB9O1xuICBnZXQgY29tcG9uZW50VHlwZSgpOiBUeXBlIHsgcmV0dXJuIHRoaXMuX2NvbXBvbmVudFR5cGU7IH1cblxuICBkZXN0cm95KCk6IHZvaWQgeyB0aGlzLl9ob3N0RWxlbWVudC5wYXJlbnRWaWV3LmRlc3Ryb3koKTsgfVxuICBvbkRlc3Ryb3koY2FsbGJhY2s6IEZ1bmN0aW9uKTogdm9pZCB7IHRoaXMuaG9zdFZpZXcub25EZXN0cm95KGNhbGxiYWNrKTsgfVxufVxuXG5jb25zdCBFTVBUWV9DT05URVhUID0gQ09OU1RfRVhQUihuZXcgT2JqZWN0KCkpO1xuXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIENvbXBvbmVudEZhY3Rvcnkge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgc2VsZWN0b3I6IHN0cmluZywgcHJpdmF0ZSBfdmlld0ZhY3Rvcnk6IEZ1bmN0aW9uLFxuICAgICAgICAgICAgICBwcml2YXRlIF9jb21wb25lbnRUeXBlOiBUeXBlKSB7fVxuXG4gIGdldCBjb21wb25lbnRUeXBlKCk6IFR5cGUgeyByZXR1cm4gdGhpcy5fY29tcG9uZW50VHlwZTsgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGNvbXBvbmVudC5cbiAgICovXG4gIGNyZWF0ZShpbmplY3RvcjogSW5qZWN0b3IsIHByb2plY3RhYmxlTm9kZXM6IGFueVtdW10gPSBudWxsLFxuICAgICAgICAgcm9vdFNlbGVjdG9yT3JOb2RlOiBzdHJpbmcgfCBhbnkgPSBudWxsKTogQ29tcG9uZW50UmVmIHtcbiAgICB2YXIgdnU6IFZpZXdVdGlscyA9IGluamVjdG9yLmdldChWaWV3VXRpbHMpO1xuICAgIGlmIChpc0JsYW5rKHByb2plY3RhYmxlTm9kZXMpKSB7XG4gICAgICBwcm9qZWN0YWJsZU5vZGVzID0gW107XG4gICAgfVxuICAgIC8vIE5vdGU6IEhvc3Qgdmlld3MgZG9uJ3QgbmVlZCBhIGRlY2xhcmF0aW9uQXBwRWxlbWVudCFcbiAgICB2YXIgaG9zdFZpZXcgPSB0aGlzLl92aWV3RmFjdG9yeSh2dSwgaW5qZWN0b3IsIG51bGwpO1xuICAgIHZhciBob3N0RWxlbWVudCA9IGhvc3RWaWV3LmNyZWF0ZShFTVBUWV9DT05URVhULCBwcm9qZWN0YWJsZU5vZGVzLCByb290U2VsZWN0b3JPck5vZGUpO1xuICAgIHJldHVybiBuZXcgQ29tcG9uZW50UmVmXyhob3N0RWxlbWVudCwgdGhpcy5fY29tcG9uZW50VHlwZSk7XG4gIH1cbn1cbiJdfQ==