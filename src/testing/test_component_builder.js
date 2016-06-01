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
var core_1 = require('angular2/core');
var compiler_1 = require('angular2/compiler');
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var utils_1 = require('./utils');
var dom_tokens_1 = require('angular2/src/platform/dom/dom_tokens');
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
var debug_node_1 = require('angular2/src/core/debug/debug_node');
var fake_async_1 = require('./fake_async');
/**
 * Fixture for debugging and testing a component.
 */
var ComponentFixture = (function () {
    function ComponentFixture() {
    }
    return ComponentFixture;
}());
exports.ComponentFixture = ComponentFixture;
var ComponentFixture_ = (function (_super) {
    __extends(ComponentFixture_, _super);
    function ComponentFixture_(componentRef) {
        _super.call(this);
        this._componentParentView = componentRef.hostView.internalView;
        var hostAppElement = this._componentParentView.getHostViewElement();
        this.elementRef = hostAppElement.ref;
        this.debugElement = debug_node_1.getDebugNode(hostAppElement.nativeElement);
        this.componentInstance = hostAppElement.component;
        this.nativeElement = hostAppElement.nativeElement;
        this._componentRef = componentRef;
    }
    ComponentFixture_.prototype.detectChanges = function (checkNoChanges) {
        if (checkNoChanges === void 0) { checkNoChanges = true; }
        this._componentParentView.detectChanges(false);
        if (checkNoChanges) {
            this.checkNoChanges();
        }
    };
    ComponentFixture_.prototype.checkNoChanges = function () { this._componentParentView.detectChanges(true); };
    ComponentFixture_.prototype.destroy = function () { this._componentRef.dispose(); };
    return ComponentFixture_;
}(ComponentFixture));
exports.ComponentFixture_ = ComponentFixture_;
var _nextRootElementId = 0;
/**
 * Builds a ComponentFixture for use in component level tests.
 */
var TestComponentBuilder = (function () {
    function TestComponentBuilder(_injector) {
        this._injector = _injector;
        /** @internal */
        this._bindingsOverrides = new Map();
        /** @internal */
        this._directiveOverrides = new Map();
        /** @internal */
        this._templateOverrides = new Map();
        /** @internal */
        this._viewBindingsOverrides = new Map();
        /** @internal */
        this._viewOverrides = new Map();
    }
    /** @internal */
    TestComponentBuilder.prototype._clone = function () {
        var clone = new TestComponentBuilder(this._injector);
        clone._viewOverrides = collection_1.MapWrapper.clone(this._viewOverrides);
        clone._directiveOverrides = collection_1.MapWrapper.clone(this._directiveOverrides);
        clone._templateOverrides = collection_1.MapWrapper.clone(this._templateOverrides);
        clone._bindingsOverrides = collection_1.MapWrapper.clone(this._bindingsOverrides);
        clone._viewBindingsOverrides = collection_1.MapWrapper.clone(this._viewBindingsOverrides);
        return clone;
    };
    /**
     * Overrides only the html of a {@link ComponentMetadata}.
     * All the other properties of the component's {@link ViewMetadata} are preserved.
     *
     * @param {Type} component
     * @param {string} html
     *
     * @return {TestComponentBuilder}
     */
    TestComponentBuilder.prototype.overrideTemplate = function (componentType, template) {
        var clone = this._clone();
        clone._templateOverrides.set(componentType, template);
        return clone;
    };
    /**
     * Overrides a component's {@link ViewMetadata}.
     *
     * @param {Type} component
     * @param {view} View
     *
     * @return {TestComponentBuilder}
     */
    TestComponentBuilder.prototype.overrideView = function (componentType, view) {
        var clone = this._clone();
        clone._viewOverrides.set(componentType, view);
        return clone;
    };
    /**
     * Overrides the directives from the component {@link ViewMetadata}.
     *
     * @param {Type} component
     * @param {Type} from
     * @param {Type} to
     *
     * @return {TestComponentBuilder}
     */
    TestComponentBuilder.prototype.overrideDirective = function (componentType, from, to) {
        var clone = this._clone();
        var overridesForComponent = clone._directiveOverrides.get(componentType);
        if (!lang_1.isPresent(overridesForComponent)) {
            clone._directiveOverrides.set(componentType, new Map());
            overridesForComponent = clone._directiveOverrides.get(componentType);
        }
        overridesForComponent.set(from, to);
        return clone;
    };
    /**
     * Overrides one or more injectables configured via `providers` metadata property of a directive
     * or
     * component.
     * Very useful when certain providers need to be mocked out.
     *
     * The providers specified via this method are appended to the existing `providers` causing the
     * duplicated providers to
     * be overridden.
     *
     * @param {Type} component
     * @param {any[]} providers
     *
     * @return {TestComponentBuilder}
     */
    TestComponentBuilder.prototype.overrideProviders = function (type, providers) {
        var clone = this._clone();
        clone._bindingsOverrides.set(type, providers);
        return clone;
    };
    /**
     * @deprecated
     */
    TestComponentBuilder.prototype.overrideBindings = function (type, providers) {
        return this.overrideProviders(type, providers);
    };
    /**
     * Overrides one or more injectables configured via `providers` metadata property of a directive
     * or
     * component.
     * Very useful when certain providers need to be mocked out.
     *
     * The providers specified via this method are appended to the existing `providers` causing the
     * duplicated providers to
     * be overridden.
     *
     * @param {Type} component
     * @param {any[]} providers
     *
     * @return {TestComponentBuilder}
     */
    TestComponentBuilder.prototype.overrideViewProviders = function (type, providers) {
        var clone = this._clone();
        clone._viewBindingsOverrides.set(type, providers);
        return clone;
    };
    /**
     * @deprecated
     */
    TestComponentBuilder.prototype.overrideViewBindings = function (type, providers) {
        return this.overrideViewProviders(type, providers);
    };
    /**
     * Builds and returns a ComponentFixture.
     *
     * @return {Promise<ComponentFixture>}
     */
    TestComponentBuilder.prototype.createAsync = function (rootComponentType) {
        var mockDirectiveResolver = this._injector.get(compiler_1.DirectiveResolver);
        var mockViewResolver = this._injector.get(compiler_1.ViewResolver);
        this._viewOverrides.forEach(function (view, type) { return mockViewResolver.setView(type, view); });
        this._templateOverrides.forEach(function (template, type) {
            return mockViewResolver.setInlineTemplate(type, template);
        });
        this._directiveOverrides.forEach(function (overrides, component) {
            overrides.forEach(function (to, from) { mockViewResolver.overrideViewDirective(component, from, to); });
        });
        this._bindingsOverrides.forEach(function (bindings, type) {
            return mockDirectiveResolver.setBindingsOverride(type, bindings);
        });
        this._viewBindingsOverrides.forEach(function (bindings, type) { return mockDirectiveResolver.setViewBindingsOverride(type, bindings); });
        var rootElId = "root" + _nextRootElementId++;
        var rootEl = utils_1.el("<div id=\"" + rootElId + "\"></div>");
        var doc = this._injector.get(dom_tokens_1.DOCUMENT);
        // TODO(juliemr): can/should this be optional?
        var oldRoots = dom_adapter_1.DOM.querySelectorAll(doc, '[id^=root]');
        for (var i = 0; i < oldRoots.length; i++) {
            dom_adapter_1.DOM.remove(oldRoots[i]);
        }
        dom_adapter_1.DOM.appendChild(doc.body, rootEl);
        var promise = this._injector.get(core_1.DynamicComponentLoader)
            .loadAsRoot(rootComponentType, "#" + rootElId, this._injector);
        return promise.then(function (componentRef) { return new ComponentFixture_(componentRef); });
    };
    TestComponentBuilder.prototype.createFakeAsync = function (rootComponentType) {
        var result;
        var error;
        async_1.PromiseWrapper.then(this.createAsync(rootComponentType), function (_result) { result = _result; }, function (_error) { error = _error; });
        fake_async_1.tick();
        if (lang_1.isPresent(error)) {
            throw error;
        }
        return result;
    };
    TestComponentBuilder = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [core_1.Injector])
    ], TestComponentBuilder);
    return TestComponentBuilder;
}());
exports.TestComponentBuilder = TestComponentBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9jb21wb25lbnRfYnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtWDRaNmpLMTAudG1wL2FuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RfY29tcG9uZW50X2J1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUJBU08sZUFBZSxDQUFDLENBQUE7QUFDdkIseUJBQThDLG1CQUFtQixDQUFDLENBQUE7QUFFbEUscUJBQXVDLDBCQUEwQixDQUFDLENBQUE7QUFDbEUsc0JBQTZCLDJCQUEyQixDQUFDLENBQUE7QUFDekQsMkJBQXNDLGdDQUFnQyxDQUFDLENBQUE7QUFLdkUsc0JBQWlCLFNBQVMsQ0FBQyxDQUFBO0FBRTNCLDJCQUF1QixzQ0FBc0MsQ0FBQyxDQUFBO0FBQzlELDRCQUFrQix1Q0FBdUMsQ0FBQyxDQUFBO0FBRTFELDJCQUFvRCxvQ0FBb0MsQ0FBQyxDQUFBO0FBRXpGLDJCQUFtQixjQUFjLENBQUMsQ0FBQTtBQUVsQzs7R0FFRztBQUNIO0lBQUE7SUFnQ0EsQ0FBQztJQUFELHVCQUFDO0FBQUQsQ0FBQyxBQWhDRCxJQWdDQztBQWhDcUIsd0JBQWdCLG1CQWdDckMsQ0FBQTtBQUdEO0lBQXVDLHFDQUFnQjtJQU1yRCwyQkFBWSxZQUEwQjtRQUNwQyxpQkFBTyxDQUFDO1FBQ1IsSUFBSSxDQUFDLG9CQUFvQixHQUFjLFlBQVksQ0FBQyxRQUFTLENBQUMsWUFBWSxDQUFDO1FBQzNFLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ3BFLElBQUksQ0FBQyxVQUFVLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQztRQUNyQyxJQUFJLENBQUMsWUFBWSxHQUFpQix5QkFBWSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsaUJBQWlCLEdB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LElBQUksQ0FBQyxVQUFDLFlBQVksSUFBTyxNQUFNLENBQUMsSUFBSSxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pGLENBQUM7SUFFRCw4Q0FBZSxHQUFmLFVBQWdCLGlCQUF1QjtRQUNyQyxJQUFJLE1BQU0sQ0FBQztRQUNYLElBQUksS0FBSyxDQUFDO1FBQ1Ysc0JBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLFVBQUMsT0FBTyxJQUFPLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQ3ZFLFVBQUMsTUFBTSxJQUFPLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRCxpQkFBSSxFQUFFLENBQUM7UUFDUCxFQUFFLENBQUMsQ0FBQyxnQkFBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixNQUFNLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFwTEg7UUFBQyxpQkFBVSxFQUFFOzs0QkFBQTtJQXFMYiwyQkFBQztBQUFELENBQUMsQUFwTEQsSUFvTEM7QUFwTFksNEJBQW9CLHVCQW9MaEMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBvbmVudFJlZixcbiAgRHluYW1pY0NvbXBvbmVudExvYWRlcixcbiAgSW5qZWN0b3IsXG4gIEluamVjdGFibGUsXG4gIFZpZXdNZXRhZGF0YSxcbiAgRWxlbWVudFJlZixcbiAgRW1iZWRkZWRWaWV3UmVmLFxuICBwcm92aWRlXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtEaXJlY3RpdmVSZXNvbHZlciwgVmlld1Jlc29sdmVyfSBmcm9tICdhbmd1bGFyMi9jb21waWxlcic7XG5cbmltcG9ydCB7VHlwZSwgaXNQcmVzZW50LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5pbXBvcnQge1ZpZXdSZWZffSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld19yZWYnO1xuaW1wb3J0IHtBcHBWaWV3fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlldyc7XG5cbmltcG9ydCB7ZWx9IGZyb20gJy4vdXRpbHMnO1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV90b2tlbnMnO1xuaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuXG5pbXBvcnQge0RlYnVnTm9kZSwgRGVidWdFbGVtZW50LCBnZXREZWJ1Z05vZGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RlYnVnL2RlYnVnX25vZGUnO1xuXG5pbXBvcnQge3RpY2t9IGZyb20gJy4vZmFrZV9hc3luYyc7XG5cbi8qKlxuICogRml4dHVyZSBmb3IgZGVidWdnaW5nIGFuZCB0ZXN0aW5nIGEgY29tcG9uZW50LlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcG9uZW50Rml4dHVyZSB7XG4gIC8qKlxuICAgKiBUaGUgRGVidWdFbGVtZW50IGFzc29jaWF0ZWQgd2l0aCB0aGUgcm9vdCBlbGVtZW50IG9mIHRoaXMgY29tcG9uZW50LlxuICAgKi9cbiAgZGVidWdFbGVtZW50OiBEZWJ1Z0VsZW1lbnQ7XG5cbiAgLyoqXG4gICAqIFRoZSBpbnN0YW5jZSBvZiB0aGUgcm9vdCBjb21wb25lbnQgY2xhc3MuXG4gICAqL1xuICBjb21wb25lbnRJbnN0YW5jZTogYW55O1xuXG4gIC8qKlxuICAgKiBUaGUgbmF0aXZlIGVsZW1lbnQgYXQgdGhlIHJvb3Qgb2YgdGhlIGNvbXBvbmVudC5cbiAgICovXG4gIG5hdGl2ZUVsZW1lbnQ6IGFueTtcblxuICAvKipcbiAgICogVGhlIEVsZW1lbnRSZWYgZm9yIHRoZSBlbGVtZW50IGF0IHRoZSByb290IG9mIHRoZSBjb21wb25lbnQuXG4gICAqL1xuICBlbGVtZW50UmVmOiBFbGVtZW50UmVmO1xuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIGEgY2hhbmdlIGRldGVjdGlvbiBjeWNsZSBmb3IgdGhlIGNvbXBvbmVudC5cbiAgICovXG4gIGFic3RyYWN0IGRldGVjdENoYW5nZXMoY2hlY2tOb0NoYW5nZXM/OiBib29sZWFuKTogdm9pZDtcblxuICBhYnN0cmFjdCBjaGVja05vQ2hhbmdlcygpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIGNvbXBvbmVudCBkZXN0cnVjdGlvbi5cbiAgICovXG4gIGFic3RyYWN0IGRlc3Ryb3koKTogdm9pZDtcbn1cblxuXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50Rml4dHVyZV8gZXh0ZW5kcyBDb21wb25lbnRGaXh0dXJlIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NvbXBvbmVudFBhcmVudFZpZXc6IEFwcFZpZXc8YW55PjtcblxuICBjb25zdHJ1Y3Rvcihjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fY29tcG9uZW50UGFyZW50VmlldyA9ICg8Vmlld1JlZl8+Y29tcG9uZW50UmVmLmhvc3RWaWV3KS5pbnRlcm5hbFZpZXc7XG4gICAgdmFyIGhvc3RBcHBFbGVtZW50ID0gdGhpcy5fY29tcG9uZW50UGFyZW50Vmlldy5nZXRIb3N0Vmlld0VsZW1lbnQoKTtcbiAgICB0aGlzLmVsZW1lbnRSZWYgPSBob3N0QXBwRWxlbWVudC5yZWY7XG4gICAgdGhpcy5kZWJ1Z0VsZW1lbnQgPSA8RGVidWdFbGVtZW50PmdldERlYnVnTm9kZShob3N0QXBwRWxlbWVudC5uYXRpdmVFbGVtZW50KTtcbiAgICB0aGlzLmNvbXBvbmVudEluc3RhbmNlID0gaG9zdEFwcEVsZW1lbnQuY29tcG9uZW50O1xuICAgIHRoaXMubmF0aXZlRWxlbWVudCA9IGhvc3RBcHBFbGVtZW50Lm5hdGl2ZUVsZW1lbnQ7XG4gICAgdGhpcy5fY29tcG9uZW50UmVmID0gY29tcG9uZW50UmVmO1xuICB9XG5cbiAgZGV0ZWN0Q2hhbmdlcyhjaGVja05vQ2hhbmdlczogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcbiAgICB0aGlzLl9jb21wb25lbnRQYXJlbnRWaWV3LmRldGVjdENoYW5nZXMoZmFsc2UpO1xuICAgIGlmIChjaGVja05vQ2hhbmdlcykge1xuICAgICAgdGhpcy5jaGVja05vQ2hhbmdlcygpO1xuICAgIH1cbiAgfVxuXG4gIGNoZWNrTm9DaGFuZ2VzKCk6IHZvaWQgeyB0aGlzLl9jb21wb25lbnRQYXJlbnRWaWV3LmRldGVjdENoYW5nZXModHJ1ZSk7IH1cblxuICBkZXN0cm95KCk6IHZvaWQgeyB0aGlzLl9jb21wb25lbnRSZWYuZGlzcG9zZSgpOyB9XG59XG5cbnZhciBfbmV4dFJvb3RFbGVtZW50SWQgPSAwO1xuXG4vKipcbiAqIEJ1aWxkcyBhIENvbXBvbmVudEZpeHR1cmUgZm9yIHVzZSBpbiBjb21wb25lbnQgbGV2ZWwgdGVzdHMuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2JpbmRpbmdzT3ZlcnJpZGVzID0gbmV3IE1hcDxUeXBlLCBhbnlbXT4oKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZGlyZWN0aXZlT3ZlcnJpZGVzID0gbmV3IE1hcDxUeXBlLCBNYXA8VHlwZSwgVHlwZT4+KCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3RlbXBsYXRlT3ZlcnJpZGVzID0gbmV3IE1hcDxUeXBlLCBzdHJpbmc+KCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ZpZXdCaW5kaW5nc092ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgYW55W10+KCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ZpZXdPdmVycmlkZXMgPSBuZXcgTWFwPFR5cGUsIFZpZXdNZXRhZGF0YT4oKTtcblxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2luamVjdG9yOiBJbmplY3Rvcikge31cblxuICAvKiogQGludGVybmFsICovXG4gIF9jbG9uZSgpOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgdmFyIGNsb25lID0gbmV3IFRlc3RDb21wb25lbnRCdWlsZGVyKHRoaXMuX2luamVjdG9yKTtcbiAgICBjbG9uZS5fdmlld092ZXJyaWRlcyA9IE1hcFdyYXBwZXIuY2xvbmUodGhpcy5fdmlld092ZXJyaWRlcyk7XG4gICAgY2xvbmUuX2RpcmVjdGl2ZU92ZXJyaWRlcyA9IE1hcFdyYXBwZXIuY2xvbmUodGhpcy5fZGlyZWN0aXZlT3ZlcnJpZGVzKTtcbiAgICBjbG9uZS5fdGVtcGxhdGVPdmVycmlkZXMgPSBNYXBXcmFwcGVyLmNsb25lKHRoaXMuX3RlbXBsYXRlT3ZlcnJpZGVzKTtcbiAgICBjbG9uZS5fYmluZGluZ3NPdmVycmlkZXMgPSBNYXBXcmFwcGVyLmNsb25lKHRoaXMuX2JpbmRpbmdzT3ZlcnJpZGVzKTtcbiAgICBjbG9uZS5fdmlld0JpbmRpbmdzT3ZlcnJpZGVzID0gTWFwV3JhcHBlci5jbG9uZSh0aGlzLl92aWV3QmluZGluZ3NPdmVycmlkZXMpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgb25seSB0aGUgaHRtbCBvZiBhIHtAbGluayBDb21wb25lbnRNZXRhZGF0YX0uXG4gICAqIEFsbCB0aGUgb3RoZXIgcHJvcGVydGllcyBvZiB0aGUgY29tcG9uZW50J3Mge0BsaW5rIFZpZXdNZXRhZGF0YX0gYXJlIHByZXNlcnZlZC5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGh0bWxcbiAgICpcbiAgICogQHJldHVybiB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9XG4gICAqL1xuICBvdmVycmlkZVRlbXBsYXRlKGNvbXBvbmVudFR5cGU6IFR5cGUsIHRlbXBsYXRlOiBzdHJpbmcpOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgdmFyIGNsb25lID0gdGhpcy5fY2xvbmUoKTtcbiAgICBjbG9uZS5fdGVtcGxhdGVPdmVycmlkZXMuc2V0KGNvbXBvbmVudFR5cGUsIHRlbXBsYXRlKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIGEgY29tcG9uZW50J3Mge0BsaW5rIFZpZXdNZXRhZGF0YX0uXG4gICAqXG4gICAqIEBwYXJhbSB7VHlwZX0gY29tcG9uZW50XG4gICAqIEBwYXJhbSB7dmlld30gVmlld1xuICAgKlxuICAgKiBAcmV0dXJuIHtUZXN0Q29tcG9uZW50QnVpbGRlcn1cbiAgICovXG4gIG92ZXJyaWRlVmlldyhjb21wb25lbnRUeXBlOiBUeXBlLCB2aWV3OiBWaWV3TWV0YWRhdGEpOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgdmFyIGNsb25lID0gdGhpcy5fY2xvbmUoKTtcbiAgICBjbG9uZS5fdmlld092ZXJyaWRlcy5zZXQoY29tcG9uZW50VHlwZSwgdmlldyk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyB0aGUgZGlyZWN0aXZlcyBmcm9tIHRoZSBjb21wb25lbnQge0BsaW5rIFZpZXdNZXRhZGF0YX0uXG4gICAqXG4gICAqIEBwYXJhbSB7VHlwZX0gY29tcG9uZW50XG4gICAqIEBwYXJhbSB7VHlwZX0gZnJvbVxuICAgKiBAcGFyYW0ge1R5cGV9IHRvXG4gICAqXG4gICAqIEByZXR1cm4ge1Rlc3RDb21wb25lbnRCdWlsZGVyfVxuICAgKi9cbiAgb3ZlcnJpZGVEaXJlY3RpdmUoY29tcG9uZW50VHlwZTogVHlwZSwgZnJvbTogVHlwZSwgdG86IFR5cGUpOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgdmFyIGNsb25lID0gdGhpcy5fY2xvbmUoKTtcbiAgICB2YXIgb3ZlcnJpZGVzRm9yQ29tcG9uZW50ID0gY2xvbmUuX2RpcmVjdGl2ZU92ZXJyaWRlcy5nZXQoY29tcG9uZW50VHlwZSk7XG4gICAgaWYgKCFpc1ByZXNlbnQob3ZlcnJpZGVzRm9yQ29tcG9uZW50KSkge1xuICAgICAgY2xvbmUuX2RpcmVjdGl2ZU92ZXJyaWRlcy5zZXQoY29tcG9uZW50VHlwZSwgbmV3IE1hcDxUeXBlLCBUeXBlPigpKTtcbiAgICAgIG92ZXJyaWRlc0ZvckNvbXBvbmVudCA9IGNsb25lLl9kaXJlY3RpdmVPdmVycmlkZXMuZ2V0KGNvbXBvbmVudFR5cGUpO1xuICAgIH1cbiAgICBvdmVycmlkZXNGb3JDb21wb25lbnQuc2V0KGZyb20sIHRvKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIG9uZSBvciBtb3JlIGluamVjdGFibGVzIGNvbmZpZ3VyZWQgdmlhIGBwcm92aWRlcnNgIG1ldGFkYXRhIHByb3BlcnR5IG9mIGEgZGlyZWN0aXZlXG4gICAqIG9yXG4gICAqIGNvbXBvbmVudC5cbiAgICogVmVyeSB1c2VmdWwgd2hlbiBjZXJ0YWluIHByb3ZpZGVycyBuZWVkIHRvIGJlIG1vY2tlZCBvdXQuXG4gICAqXG4gICAqIFRoZSBwcm92aWRlcnMgc3BlY2lmaWVkIHZpYSB0aGlzIG1ldGhvZCBhcmUgYXBwZW5kZWQgdG8gdGhlIGV4aXN0aW5nIGBwcm92aWRlcnNgIGNhdXNpbmcgdGhlXG4gICAqIGR1cGxpY2F0ZWQgcHJvdmlkZXJzIHRvXG4gICAqIGJlIG92ZXJyaWRkZW4uXG4gICAqXG4gICAqIEBwYXJhbSB7VHlwZX0gY29tcG9uZW50XG4gICAqIEBwYXJhbSB7YW55W119IHByb3ZpZGVyc1xuICAgKlxuICAgKiBAcmV0dXJuIHtUZXN0Q29tcG9uZW50QnVpbGRlcn1cbiAgICovXG4gIG92ZXJyaWRlUHJvdmlkZXJzKHR5cGU6IFR5cGUsIHByb3ZpZGVyczogYW55W10pOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgdmFyIGNsb25lID0gdGhpcy5fY2xvbmUoKTtcbiAgICBjbG9uZS5fYmluZGluZ3NPdmVycmlkZXMuc2V0KHR5cGUsIHByb3ZpZGVycyk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBvdmVycmlkZUJpbmRpbmdzKHR5cGU6IFR5cGUsIHByb3ZpZGVyczogYW55W10pOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgcmV0dXJuIHRoaXMub3ZlcnJpZGVQcm92aWRlcnModHlwZSwgcHJvdmlkZXJzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgb25lIG9yIG1vcmUgaW5qZWN0YWJsZXMgY29uZmlndXJlZCB2aWEgYHByb3ZpZGVyc2AgbWV0YWRhdGEgcHJvcGVydHkgb2YgYSBkaXJlY3RpdmVcbiAgICogb3JcbiAgICogY29tcG9uZW50LlxuICAgKiBWZXJ5IHVzZWZ1bCB3aGVuIGNlcnRhaW4gcHJvdmlkZXJzIG5lZWQgdG8gYmUgbW9ja2VkIG91dC5cbiAgICpcbiAgICogVGhlIHByb3ZpZGVycyBzcGVjaWZpZWQgdmlhIHRoaXMgbWV0aG9kIGFyZSBhcHBlbmRlZCB0byB0aGUgZXhpc3RpbmcgYHByb3ZpZGVyc2AgY2F1c2luZyB0aGVcbiAgICogZHVwbGljYXRlZCBwcm92aWRlcnMgdG9cbiAgICogYmUgb3ZlcnJpZGRlbi5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHthbnlbXX0gcHJvdmlkZXJzXG4gICAqXG4gICAqIEByZXR1cm4ge1Rlc3RDb21wb25lbnRCdWlsZGVyfVxuICAgKi9cbiAgb3ZlcnJpZGVWaWV3UHJvdmlkZXJzKHR5cGU6IFR5cGUsIHByb3ZpZGVyczogYW55W10pOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgdmFyIGNsb25lID0gdGhpcy5fY2xvbmUoKTtcbiAgICBjbG9uZS5fdmlld0JpbmRpbmdzT3ZlcnJpZGVzLnNldCh0eXBlLCBwcm92aWRlcnMpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgb3ZlcnJpZGVWaWV3QmluZGluZ3ModHlwZTogVHlwZSwgcHJvdmlkZXJzOiBhbnlbXSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICByZXR1cm4gdGhpcy5vdmVycmlkZVZpZXdQcm92aWRlcnModHlwZSwgcHJvdmlkZXJzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgYW5kIHJldHVybnMgYSBDb21wb25lbnRGaXh0dXJlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtQcm9taXNlPENvbXBvbmVudEZpeHR1cmU+fVxuICAgKi9cbiAgY3JlYXRlQXN5bmMocm9vdENvbXBvbmVudFR5cGU6IFR5cGUpOiBQcm9taXNlPENvbXBvbmVudEZpeHR1cmU+IHtcbiAgICB2YXIgbW9ja0RpcmVjdGl2ZVJlc29sdmVyID0gdGhpcy5faW5qZWN0b3IuZ2V0KERpcmVjdGl2ZVJlc29sdmVyKTtcbiAgICB2YXIgbW9ja1ZpZXdSZXNvbHZlciA9IHRoaXMuX2luamVjdG9yLmdldChWaWV3UmVzb2x2ZXIpO1xuICAgIHRoaXMuX3ZpZXdPdmVycmlkZXMuZm9yRWFjaCgodmlldywgdHlwZSkgPT4gbW9ja1ZpZXdSZXNvbHZlci5zZXRWaWV3KHR5cGUsIHZpZXcpKTtcbiAgICB0aGlzLl90ZW1wbGF0ZU92ZXJyaWRlcy5mb3JFYWNoKCh0ZW1wbGF0ZSwgdHlwZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2NrVmlld1Jlc29sdmVyLnNldElubGluZVRlbXBsYXRlKHR5cGUsIHRlbXBsYXRlKSk7XG4gICAgdGhpcy5fZGlyZWN0aXZlT3ZlcnJpZGVzLmZvckVhY2goKG92ZXJyaWRlcywgY29tcG9uZW50KSA9PiB7XG4gICAgICBvdmVycmlkZXMuZm9yRWFjaChcbiAgICAgICAgICAodG8sIGZyb20pID0+IHsgbW9ja1ZpZXdSZXNvbHZlci5vdmVycmlkZVZpZXdEaXJlY3RpdmUoY29tcG9uZW50LCBmcm9tLCB0byk7IH0pO1xuICAgIH0pO1xuICAgIHRoaXMuX2JpbmRpbmdzT3ZlcnJpZGVzLmZvckVhY2goKGJpbmRpbmdzLCB0eXBlKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vY2tEaXJlY3RpdmVSZXNvbHZlci5zZXRCaW5kaW5nc092ZXJyaWRlKHR5cGUsIGJpbmRpbmdzKSk7XG4gICAgdGhpcy5fdmlld0JpbmRpbmdzT3ZlcnJpZGVzLmZvckVhY2goXG4gICAgICAgIChiaW5kaW5ncywgdHlwZSkgPT4gbW9ja0RpcmVjdGl2ZVJlc29sdmVyLnNldFZpZXdCaW5kaW5nc092ZXJyaWRlKHR5cGUsIGJpbmRpbmdzKSk7XG5cbiAgICB2YXIgcm9vdEVsSWQgPSBgcm9vdCR7X25leHRSb290RWxlbWVudElkKyt9YDtcbiAgICB2YXIgcm9vdEVsID0gZWwoYDxkaXYgaWQ9XCIke3Jvb3RFbElkfVwiPjwvZGl2PmApO1xuICAgIHZhciBkb2MgPSB0aGlzLl9pbmplY3Rvci5nZXQoRE9DVU1FTlQpO1xuXG4gICAgLy8gVE9ETyhqdWxpZW1yKTogY2FuL3Nob3VsZCB0aGlzIGJlIG9wdGlvbmFsP1xuICAgIHZhciBvbGRSb290cyA9IERPTS5xdWVyeVNlbGVjdG9yQWxsKGRvYywgJ1tpZF49cm9vdF0nKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9sZFJvb3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBET00ucmVtb3ZlKG9sZFJvb3RzW2ldKTtcbiAgICB9XG4gICAgRE9NLmFwcGVuZENoaWxkKGRvYy5ib2R5LCByb290RWwpO1xuXG5cbiAgICB2YXIgcHJvbWlzZTogUHJvbWlzZTxDb21wb25lbnRSZWY+ID1cbiAgICAgICAgdGhpcy5faW5qZWN0b3IuZ2V0KER5bmFtaWNDb21wb25lbnRMb2FkZXIpXG4gICAgICAgICAgICAubG9hZEFzUm9vdChyb290Q29tcG9uZW50VHlwZSwgYCMke3Jvb3RFbElkfWAsIHRoaXMuX2luamVjdG9yKTtcbiAgICByZXR1cm4gcHJvbWlzZS50aGVuKChjb21wb25lbnRSZWYpID0+IHsgcmV0dXJuIG5ldyBDb21wb25lbnRGaXh0dXJlXyhjb21wb25lbnRSZWYpOyB9KTtcbiAgfVxuXG4gIGNyZWF0ZUZha2VBc3luYyhyb290Q29tcG9uZW50VHlwZTogVHlwZSk6IENvbXBvbmVudEZpeHR1cmUge1xuICAgIHZhciByZXN1bHQ7XG4gICAgdmFyIGVycm9yO1xuICAgIFByb21pc2VXcmFwcGVyLnRoZW4odGhpcy5jcmVhdGVBc3luYyhyb290Q29tcG9uZW50VHlwZSksIChfcmVzdWx0KSA9PiB7IHJlc3VsdCA9IF9yZXN1bHQ7IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAoX2Vycm9yKSA9PiB7IGVycm9yID0gX2Vycm9yOyB9KTtcbiAgICB0aWNrKCk7XG4gICAgaWYgKGlzUHJlc2VudChlcnJvcikpIHtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59XG4iXX0=