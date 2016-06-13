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
        get: function () { return this._hostElement.parentView.ref; },
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
        var hostElement = hostView.create(projectableNodes, rootSelectorOrNode);
        return new ComponentRef_(hostElement, this._componentType);
    };
    ComponentFactory = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [String, Function, lang_1.Type])
    ], ComponentFactory);
    return ComponentFactory;
}());
exports.ComponentFactory = ComponentFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X2ZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLUY2NEJjUzgyLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcG9uZW50X2ZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EscUJBQThDLDBCQUEwQixDQUFDLENBQUE7QUFDekUsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFJN0QsMkJBQXdCLGNBQWMsQ0FBQyxDQUFBO0FBR3ZDOzs7Ozs7R0FNRztBQUNIO0lBQUE7SUF3Q0EsQ0FBQztJQXBDQyxzQkFBSSxrQ0FBUTtRQUhaOztXQUVHO2FBQ0gsY0FBNkIsTUFBTSxDQUFDLDBCQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBS3RELHNCQUFJLGtDQUFRO1FBSFo7O1dBRUc7YUFDSCxjQUEyQixNQUFNLENBQUMsMEJBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFLcEQsc0JBQUksa0NBQVE7UUFIWjs7V0FFRzthQUNILGNBQXNCLE1BQU0sQ0FBQywwQkFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTs7SUFLL0Msc0JBQUksa0NBQVE7UUFIWjs7V0FFRzthQUNILGNBQTBCLE1BQU0sQ0FBQywwQkFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTs7SUFLbkQsc0JBQUksMkNBQWlCO1FBSHJCOztXQUVHO2FBQ0gsY0FBNkMsTUFBTSxDQUFDLDBCQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBS3RFLHNCQUFJLHVDQUFhO1FBSGpCOztXQUVHO2FBQ0gsY0FBNEIsTUFBTSxDQUFDLDBCQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBV3ZELG1CQUFDO0FBQUQsQ0FBQyxBQXhDRCxJQXdDQztBQXhDcUIsb0JBQVksZUF3Q2pDLENBQUE7QUFFRDtJQUFtQyxpQ0FBWTtJQUM3Qyx1QkFBb0IsWUFBd0IsRUFBVSxjQUFvQjtRQUFJLGlCQUFPLENBQUM7UUFBbEUsaUJBQVksR0FBWixZQUFZLENBQVk7UUFBVSxtQkFBYyxHQUFkLGNBQWMsQ0FBTTtJQUFhLENBQUM7SUFDeEYsc0JBQUksbUNBQVE7YUFBWixjQUE2QixNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUNuRSxzQkFBSSxtQ0FBUTthQUFaLGNBQTJCLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBQy9ELHNCQUFJLG1DQUFRO2FBQVosY0FBc0IsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7O0lBQzNELHNCQUFJLG1DQUFRO2FBQVosY0FBMEIsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7OztPQUFBOztJQUNwRSxzQkFBSSw0Q0FBaUI7YUFBckIsY0FBNkMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7OztPQUFBOztJQUN2RixzQkFBSSx3Q0FBYTthQUFqQixjQUE0QixNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBRXpELCtCQUFPLEdBQVAsY0FBa0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzNELGlDQUFTLEdBQVQsVUFBVSxRQUFrQixJQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1RSxvQkFBQztBQUFELENBQUMsQUFYRCxDQUFtQyxZQUFZLEdBVzlDO0FBWFkscUJBQWEsZ0JBV3pCLENBQUE7QUFHRDtJQUNFLDBCQUFtQixRQUFnQixFQUFVLFlBQXNCLEVBQy9DLGNBQW9CO1FBRHJCLGFBQVEsR0FBUixRQUFRLENBQVE7UUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBVTtRQUMvQyxtQkFBYyxHQUFkLGNBQWMsQ0FBTTtJQUFHLENBQUM7SUFFNUMsc0JBQUksMkNBQWE7YUFBakIsY0FBNEIsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUV6RDs7T0FFRztJQUNILGlDQUFNLEdBQU4sVUFBTyxRQUFrQixFQUFFLGdCQUFnQyxFQUNwRCxrQkFBdUM7UUFEbkIsZ0NBQWdDLEdBQWhDLHVCQUFnQztRQUNwRCxrQ0FBdUMsR0FBdkMseUJBQXVDO1FBQzVDLElBQUksRUFBRSxHQUFjLFFBQVEsQ0FBQyxHQUFHLENBQUMsc0JBQVMsQ0FBQyxDQUFDO1FBQzVDLEVBQUUsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixnQkFBZ0IsR0FBRyxFQUFFLENBQUM7UUFDeEIsQ0FBQztRQUNELHVEQUF1RDtRQUN2RCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDckQsSUFBSSxXQUFXLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3hFLE1BQU0sQ0FBQyxJQUFJLGFBQWEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFwQkg7UUFBQyxZQUFLLEVBQUU7O3dCQUFBO0lBcUJSLHVCQUFDO0FBQUQsQ0FBQyxBQXBCRCxJQW9CQztBQXBCWSx3QkFBZ0IsbUJBb0I1QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtUeXBlLCBDT05TVCwgaXNQcmVzZW50LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHt1bmltcGxlbWVudGVkfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtFbGVtZW50UmVmfSBmcm9tICcuL2VsZW1lbnRfcmVmJztcbmltcG9ydCB7Vmlld1JlZiwgVmlld1JlZl99IGZyb20gJy4vdmlld19yZWYnO1xuaW1wb3J0IHtBcHBFbGVtZW50fSBmcm9tICcuL2VsZW1lbnQnO1xuaW1wb3J0IHtWaWV3VXRpbHN9IGZyb20gJy4vdmlld191dGlscyc7XG5pbXBvcnQge0NoYW5nZURldGVjdG9yUmVmfSBmcm9tICcuLi9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rpb24nO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gaW5zdGFuY2Ugb2YgYSBDb21wb25lbnQgY3JlYXRlZCB2aWEgYSB7QGxpbmsgQ29tcG9uZW50RmFjdG9yeX0uXG4gKlxuICogYENvbXBvbmVudFJlZmAgcHJvdmlkZXMgYWNjZXNzIHRvIHRoZSBDb21wb25lbnQgSW5zdGFuY2UgYXMgd2VsbCBvdGhlciBvYmplY3RzIHJlbGF0ZWQgdG8gdGhpc1xuICogQ29tcG9uZW50IEluc3RhbmNlIGFuZCBhbGxvd3MgeW91IHRvIGRlc3Ryb3kgdGhlIENvbXBvbmVudCBJbnN0YW5jZSB2aWEgdGhlIHtAbGluayAjZGVzdHJveX1cbiAqIG1ldGhvZC5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbXBvbmVudFJlZiB7XG4gIC8qKlxuICAgKiBMb2NhdGlvbiBvZiB0aGUgSG9zdCBFbGVtZW50IG9mIHRoaXMgQ29tcG9uZW50IEluc3RhbmNlLlxuICAgKi9cbiAgZ2V0IGxvY2F0aW9uKCk6IEVsZW1lbnRSZWYgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9XG5cbiAgLyoqXG4gICAqIFRoZSBpbmplY3RvciBvbiB3aGljaCB0aGUgY29tcG9uZW50IGluc3RhbmNlIGV4aXN0cy5cbiAgICovXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cblxuICAvKipcbiAgICogVGhlIGluc3RhbmNlIG9mIHRoZSBDb21wb25lbnQuXG4gICAqL1xuICBnZXQgaW5zdGFuY2UoKTogYW55IHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfTtcblxuICAvKipcbiAgICogVGhlIHtAbGluayBWaWV3UmVmfSBvZiB0aGUgSG9zdCBWaWV3IG9mIHRoaXMgQ29tcG9uZW50IGluc3RhbmNlLlxuICAgKi9cbiAgZ2V0IGhvc3RWaWV3KCk6IFZpZXdSZWYgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBUaGUge0BsaW5rIENoYW5nZURldGVjdG9yUmVmfSBvZiB0aGUgQ29tcG9uZW50IGluc3RhbmNlLlxuICAgKi9cbiAgZ2V0IGNoYW5nZURldGVjdG9yUmVmKCk6IENoYW5nZURldGVjdG9yUmVmIHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfVxuXG4gIC8qKlxuICAgKiBUaGUgY29tcG9uZW50IHR5cGUuXG4gICAqL1xuICBnZXQgY29tcG9uZW50VHlwZSgpOiBUeXBlIHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgY29tcG9uZW50IGluc3RhbmNlIGFuZCBhbGwgb2YgdGhlIGRhdGEgc3RydWN0dXJlcyBhc3NvY2lhdGVkIHdpdGggaXQuXG4gICAqL1xuICBhYnN0cmFjdCBkZXN0cm95KCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEFsbG93cyB0byByZWdpc3RlciBhIGNhbGxiYWNrIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgY29tcG9uZW50IGlzIGRlc3Ryb3llZC5cbiAgICovXG4gIGFic3RyYWN0IG9uRGVzdHJveShjYWxsYmFjazogRnVuY3Rpb24pOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50UmVmXyBleHRlbmRzIENvbXBvbmVudFJlZiB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2hvc3RFbGVtZW50OiBBcHBFbGVtZW50LCBwcml2YXRlIF9jb21wb25lbnRUeXBlOiBUeXBlKSB7IHN1cGVyKCk7IH1cbiAgZ2V0IGxvY2F0aW9uKCk6IEVsZW1lbnRSZWYgeyByZXR1cm4gdGhpcy5faG9zdEVsZW1lbnQuZWxlbWVudFJlZjsgfVxuICBnZXQgaW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gdGhpcy5faG9zdEVsZW1lbnQuaW5qZWN0b3I7IH1cbiAgZ2V0IGluc3RhbmNlKCk6IGFueSB7IHJldHVybiB0aGlzLl9ob3N0RWxlbWVudC5jb21wb25lbnQ7IH07XG4gIGdldCBob3N0VmlldygpOiBWaWV3UmVmIHsgcmV0dXJuIHRoaXMuX2hvc3RFbGVtZW50LnBhcmVudFZpZXcucmVmOyB9O1xuICBnZXQgY2hhbmdlRGV0ZWN0b3JSZWYoKTogQ2hhbmdlRGV0ZWN0b3JSZWYgeyByZXR1cm4gdGhpcy5faG9zdEVsZW1lbnQucGFyZW50Vmlldy5yZWY7IH07XG4gIGdldCBjb21wb25lbnRUeXBlKCk6IFR5cGUgeyByZXR1cm4gdGhpcy5fY29tcG9uZW50VHlwZTsgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7IHRoaXMuX2hvc3RFbGVtZW50LnBhcmVudFZpZXcuZGVzdHJveSgpOyB9XG4gIG9uRGVzdHJveShjYWxsYmFjazogRnVuY3Rpb24pOiB2b2lkIHsgdGhpcy5ob3N0Vmlldy5vbkRlc3Ryb3koY2FsbGJhY2spOyB9XG59XG5cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50RmFjdG9yeSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzZWxlY3Rvcjogc3RyaW5nLCBwcml2YXRlIF92aWV3RmFjdG9yeTogRnVuY3Rpb24sXG4gICAgICAgICAgICAgIHByaXZhdGUgX2NvbXBvbmVudFR5cGU6IFR5cGUpIHt9XG5cbiAgZ2V0IGNvbXBvbmVudFR5cGUoKTogVHlwZSB7IHJldHVybiB0aGlzLl9jb21wb25lbnRUeXBlOyB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgY29tcG9uZW50LlxuICAgKi9cbiAgY3JlYXRlKGluamVjdG9yOiBJbmplY3RvciwgcHJvamVjdGFibGVOb2RlczogYW55W11bXSA9IG51bGwsXG4gICAgICAgICByb290U2VsZWN0b3JPck5vZGU6IHN0cmluZyB8IGFueSA9IG51bGwpOiBDb21wb25lbnRSZWYge1xuICAgIHZhciB2dTogVmlld1V0aWxzID0gaW5qZWN0b3IuZ2V0KFZpZXdVdGlscyk7XG4gICAgaWYgKGlzQmxhbmsocHJvamVjdGFibGVOb2RlcykpIHtcbiAgICAgIHByb2plY3RhYmxlTm9kZXMgPSBbXTtcbiAgICB9XG4gICAgLy8gTm90ZTogSG9zdCB2aWV3cyBkb24ndCBuZWVkIGEgZGVjbGFyYXRpb25BcHBFbGVtZW50IVxuICAgIHZhciBob3N0VmlldyA9IHRoaXMuX3ZpZXdGYWN0b3J5KHZ1LCBpbmplY3RvciwgbnVsbCk7XG4gICAgdmFyIGhvc3RFbGVtZW50ID0gaG9zdFZpZXcuY3JlYXRlKHByb2plY3RhYmxlTm9kZXMsIHJvb3RTZWxlY3Rvck9yTm9kZSk7XG4gICAgcmV0dXJuIG5ldyBDb21wb25lbnRSZWZfKGhvc3RFbGVtZW50LCB0aGlzLl9jb21wb25lbnRUeXBlKTtcbiAgfVxufVxuIl19