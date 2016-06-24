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
var reflection_1 = require('angular2/src/core/reflection/reflection');
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
    function ComponentRef_(_hostElement, _componentType, _metadata) {
        _super.call(this);
        this._hostElement = _hostElement;
        this._componentType = _componentType;
        this._metadata = _metadata;
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
    Object.defineProperty(ComponentRef_.prototype, "metadata", {
        get: function () { return this._metadata; },
        enumerable: true,
        configurable: true
    });
    ComponentRef_.prototype.destroy = function () { this._hostElement.parentView.destroy(); };
    ComponentRef_.prototype.onDestroy = function (callback) { this.hostView.onDestroy(callback); };
    return ComponentRef_;
}(ComponentRef));
exports.ComponentRef_ = ComponentRef_;
var ComponentFactory = (function () {
    // Note: can't use a Map for the metadata due to
    // https://github.com/dart-lang/sdk/issues/21553
    function ComponentFactory(selector, _viewFactory, _componentType, _metadataPairs) {
        if (_metadataPairs === void 0) { _metadataPairs = null; }
        this.selector = selector;
        this._viewFactory = _viewFactory;
        this._componentType = _componentType;
        this._metadataPairs = _metadataPairs;
    }
    ComponentFactory.cloneWithMetadata = function (original, metadata) {
        return new ComponentFactory(original.selector, original._viewFactory, original._componentType, [original.componentType, metadata]);
    };
    Object.defineProperty(ComponentFactory.prototype, "componentType", {
        get: function () { return this._componentType; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComponentFactory.prototype, "metadata", {
        get: function () {
            if (lang_1.isPresent(this._metadataPairs)) {
                for (var i = 0; i < this._metadataPairs.length; i += 2) {
                    if (this._metadataPairs[i] === this._componentType) {
                        return this._metadataPairs[i + 1];
                    }
                }
                return [];
            }
            else {
                return reflection_1.reflector.annotations(this._componentType);
            }
        },
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
        return new ComponentRef_(hostElement, this.componentType, this.metadata);
    };
    ComponentFactory = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [String, Function, lang_1.Type, Array])
    ], ComponentFactory);
    return ComponentFactory;
}());
exports.ComponentFactory = ComponentFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X2ZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWxMYmZ6MjkzLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcG9uZW50X2ZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EscUJBQThDLDBCQUEwQixDQUFDLENBQUE7QUFDekUsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFJN0QsMkJBQXdCLGNBQWMsQ0FBQyxDQUFBO0FBRXZDLDJCQUF3Qix5Q0FBeUMsQ0FBQyxDQUFBO0FBRWxFOzs7Ozs7R0FNRztBQUNIO0lBQUE7SUF3Q0EsQ0FBQztJQXBDQyxzQkFBSSxrQ0FBUTtRQUhaOztXQUVHO2FBQ0gsY0FBNkIsTUFBTSxDQUFDLDBCQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBS3RELHNCQUFJLGtDQUFRO1FBSFo7O1dBRUc7YUFDSCxjQUEyQixNQUFNLENBQUMsMEJBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFLcEQsc0JBQUksa0NBQVE7UUFIWjs7V0FFRzthQUNILGNBQXNCLE1BQU0sQ0FBQywwQkFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTs7SUFLL0Msc0JBQUksa0NBQVE7UUFIWjs7V0FFRzthQUNILGNBQTBCLE1BQU0sQ0FBQywwQkFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTs7SUFLbkQsc0JBQUksMkNBQWlCO1FBSHJCOztXQUVHO2FBQ0gsY0FBNkMsTUFBTSxDQUFDLDBCQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBS3RFLHNCQUFJLHVDQUFhO1FBSGpCOztXQUVHO2FBQ0gsY0FBNEIsTUFBTSxDQUFDLDBCQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBV3ZELG1CQUFDO0FBQUQsQ0FBQyxBQXhDRCxJQXdDQztBQXhD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Mi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1R5cGUsIENPTlNULCBpc1ByZXNlbnQsIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge3VuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0VsZW1lbnRSZWZ9IGZyb20gJy4vZWxlbWVudF9yZWYnO1xuaW1wb3J0IHtWaWV3UmVmLCBWaWV3UmVmX30gZnJvbSAnLi92aWV3X3JlZic7XG5pbXBvcnQge0FwcEVsZW1lbnR9IGZyb20gJy4vZWxlbWVudCc7XG5pbXBvcnQge1ZpZXdVdGlsc30gZnJvbSAnLi92aWV3X3V0aWxzJztcbmltcG9ydCB7Q2hhbmdlRGV0ZWN0b3JSZWZ9IGZyb20gJy4uL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbic7XG5pbXBvcnQge3JlZmxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi9yZWZsZWN0aW9uJztcblxuLyoqXG4gKiBSZXByZXNlbnRzIGFuIGluc3RhbmNlIG9mIGEgQ29tcG9uZW50IGNyZWF0ZWQgdmlhIGEge0BsaW5rIENvbXBvbmVudEZhY3Rvcnl9LlxuICpcbiAqIGBDb21wb25lbnRSZWZgIHByb3ZpZGVzIGFjY2VzcyB0byB0aGUgQ29tcG9uZW50IEluc3RhbmNlIGFzIHdlbGwgb3RoZXIgb2JqZWN0cyByZWxhdGVkIHRvIHRoaXNcbiAqIENvbXBvbmVudCBJbnN0YW5jZSBhbmQgYWxsb3dzIHlvdSB0byBkZXN0cm95IHRoZSBDb21wb25lbnQgSW5zdGFuY2UgdmlhIHRoZSB7QGxpbmsgI2Rlc3Ryb3l9XG4gKiBtZXRob2QuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21wb25lbnRSZWYge1xuICAvKipcbiAgICogTG9jYXRpb24gb2YgdGhlIEhvc3QgRWxlbWVudCBvZiB0aGlzIENvbXBvbmVudCBJbnN0YW5jZS5cbiAgICovXG4gIGdldCBsb2NhdGlvbigpOiBFbGVtZW50UmVmIHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfVxuXG4gIC8qKlxuICAgKiBUaGUgaW5qZWN0b3Igb24gd2hpY2ggdGhlIGNvbXBvbmVudCBpbnN0YW5jZSBleGlzdHMuXG4gICAqL1xuICBnZXQgaW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9XG5cbiAgLyoqXG4gICAqIFRoZSBpbnN0YW5jZSBvZiB0aGUgQ29tcG9uZW50LlxuICAgKi9cbiAgZ2V0IGluc3RhbmNlKCk6IGFueSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH07XG5cbiAgLyoqXG4gICAqIFRoZSB7QGxpbmsgVmlld1JlZn0gb2YgdGhlIEhvc3QgVmlldyBvZiB0aGlzIENvbXBvbmVudCBpbnN0YW5jZS5cbiAgICovXG4gIGdldCBob3N0VmlldygpOiBWaWV3UmVmIHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfTtcblxuICAvKipcbiAgICogVGhlIHtAbGluayBDaGFuZ2VEZXRlY3RvclJlZn0gb2YgdGhlIENvbXBvbmVudCBpbnN0YW5jZS5cbiAgICovXG4gIGdldCBjaGFuZ2VEZXRlY3RvclJlZigpOiBDaGFuZ2VEZXRlY3RvclJlZiB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cblxuICAvKipcbiAgICogVGhlIGNvbXBvbmVudCB0eXBlLlxuICAgKi9cbiAgZ2V0IGNvbXBvbmVudFR5cGUoKTogVHlwZSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIGNvbXBvbmVudCBpbnN0YW5jZSBhbmQgYWxsIG9mIHRoZSBkYXRhIHN0cnVjdHVyZXMgYXNzb2NpYXRlZCB3aXRoIGl0LlxuICAgKi9cbiAgYWJzdHJhY3QgZGVzdHJveSgpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBBbGxvd3MgdG8gcmVnaXN0ZXIgYSBjYWxsYmFjayB0aGF0IHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlIGNvbXBvbmVudCBpcyBkZXN0cm95ZWQuXG4gICAqL1xuICBhYnN0cmFjdCBvbkRlc3Ryb3koY2FsbGJhY2s6IEZ1bmN0aW9uKTogdm9pZDtcbn1cblxuZXhwb3J0IGNsYXNzIENvbXBvbmVudFJlZl8gZXh0ZW5kcyBDb21wb25lbnRSZWYge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9ob3N0RWxlbWVudDogQXBwRWxlbWVudCwgcHJpdmF0ZSBfY29tcG9uZW50VHlwZTogVHlwZSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfbWV0YWRhdGE6IGFueVtdKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuICBnZXQgbG9jYXRpb24oKTogRWxlbWVudFJlZiB7IHJldHVybiB0aGlzLl9ob3N0RWxlbWVudC5lbGVtZW50UmVmOyB9XG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLl9ob3N0RWxlbWVudC5pbmplY3RvcjsgfVxuICBnZXQgaW5zdGFuY2UoKTogYW55IHsgcmV0dXJuIHRoaXMuX2hvc3RFbGVtZW50LmNvbXBvbmVudDsgfTtcbiAgZ2V0IGhvc3RWaWV3KCk6IFZpZXdSZWYgeyByZXR1cm4gdGhpcy5faG9zdEVsZW1lbnQucGFyZW50Vmlldy5yZWY7IH07XG4gIGdldCBjaGFuZ2VEZXRlY3RvclJlZigpOiBDaGFuZ2VEZXRlY3RvclJlZiB7IHJldHVybiB0aGlzLl9ob3N0RWxlbWVudC5wYXJlbnRWaWV3LnJlZjsgfTtcbiAgZ2V0IGNvbXBvbmVudFR5cGUoKTogVHlwZSB7IHJldHVybiB0aGlzLl9jb21wb25lbnRUeXBlOyB9XG4gIGdldCBtZXRhZGF0YSgpOiBhbnlbXSB7IHJldHVybiB0aGlzLl9tZXRhZGF0YTsgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7IHRoaXMuX2hvc3RFbGVtZW50LnBhcmVudFZpZXcuZGVzdHJveSgpOyB9XG4gIG9uRGVzdHJveShjYWxsYmFjazogRnVuY3Rpb24pOiB2b2lkIHsgdGhpcy5ob3N0Vmlldy5vbkRlc3Ryb3koY2FsbGJhY2spOyB9XG59XG5cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50RmFjdG9yeSB7XG4gIHN0YXRpYyBjbG9uZVdpdGhNZXRhZGF0YShvcmlnaW5hbDogQ29tcG9uZW50RmFjdG9yeSwgbWV0YWRhdGE6IGFueVtdKTogQ29tcG9uZW50RmFjdG9yeSB7XG4gICAgcmV0dXJuIG5ldyBDb21wb25lbnRGYWN0b3J5KG9yaWdpbmFsLnNlbGVjdG9yLCBvcmlnaW5hbC5fdmlld0ZhY3RvcnksIG9yaWdpbmFsLl9jb21wb25lbnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbb3JpZ2luYWwuY29tcG9uZW50VHlwZSwgbWV0YWRhdGFdKTtcbiAgfVxuXG4gIC8vIE5vdGU6IGNhbid0IHVzZSBhIE1hcCBmb3IgdGhlIG1ldGFkYXRhIGR1ZSB0b1xuICAvLyBodHRwczovL2dpdGh1Yi5jb20vZGFydC1sYW5nL3Nkay9pc3N1ZXMvMjE1NTNcbiAgY29uc3RydWN0b3IocHVibGljIHNlbGVjdG9yOiBzdHJpbmcsIHByaXZhdGUgX3ZpZXdGYWN0b3J5OiBGdW5jdGlvbiwgcHJpdmF0ZSBfY29tcG9uZW50VHlwZTogVHlwZSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfbWV0YWRhdGFQYWlyczogQXJyYXk8VHlwZSB8IGFueVtdPiA9IG51bGwpIHt9XG5cbiAgZ2V0IGNvbXBvbmVudFR5cGUoKTogVHlwZSB7IHJldHVybiB0aGlzLl9jb21wb25lbnRUeXBlOyB9XG4gIGdldCBtZXRhZGF0YSgpOiBhbnlbXSB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9tZXRhZGF0YVBhaXJzKSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9tZXRhZGF0YVBhaXJzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgIGlmICh0aGlzLl9tZXRhZGF0YVBhaXJzW2ldID09PSB0aGlzLl9jb21wb25lbnRUeXBlKSB7XG4gICAgICAgICAgcmV0dXJuIDxhbnlbXT50aGlzLl9tZXRhZGF0YVBhaXJzW2kgKyAxXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIFtdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcmVmbGVjdG9yLmFubm90YXRpb25zKHRoaXMuX2NvbXBvbmVudFR5cGUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGNvbXBvbmVudC5cbiAgICovXG4gIGNyZWF0ZShpbmplY3RvcjogSW5qZWN0b3IsIHByb2plY3RhYmxlTm9kZXM6IGFueVtdW10gPSBudWxsLFxuICAgICAgICAgcm9vdFNlbGVjdG9yT3JOb2RlOiBzdHJpbmcgfCBhbnkgPSBudWxsKTogQ29tcG9uZW50UmVmIHtcbiAgICB2YXIgdnU6IFZpZXdVdGlscyA9IGluamVjdG9yLmdldChWaWV3VXRpbHMpO1xuICAgIGlmIChpc0JsYW5rKHByb2plY3RhYmxlTm9kZXMpKSB7XG4gICAgICBwcm9qZWN0YWJsZU5vZGVzID0gW107XG4gICAgfVxuICAgIC8vIE5vdGU6IEhvc3Qgdmlld3MgZG9uJ3QgbmVlZCBhIGRlY2xhcmF0aW9uQXBwRWxlbWVudCFcbiAgICB2YXIgaG9zdFZpZXcgPSB0aGlzLl92aWV3RmFjdG9yeSh2dSwgaW5qZWN0b3IsIG51bGwpO1xuICAgIHZhciBob3N0RWxlbWVudCA9IGhvc3RWaWV3LmNyZWF0ZShwcm9qZWN0YWJsZU5vZGVzLCByb290U2VsZWN0b3JPck5vZGUpO1xuICAgIHJldHVybiBuZXcgQ29tcG9uZW50UmVmXyhob3N0RWxlbWVudCwgdGhpcy5jb21wb25lbnRUeXBlLCB0aGlzLm1ldGFkYXRhKTtcbiAgfVxufVxuIl19