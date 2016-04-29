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
var compiler_1 = require('angular2/compiler');
var exceptions_1 = require('angular2/src/facade/exceptions');
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var utils_1 = require('./utils');
var dom_tokens_1 = require('angular2/src/platform/dom/dom_tokens');
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
var debug_node_1 = require('angular2/src/core/debug/debug_node');
var fake_async_1 = require('./fake_async');
exports.ComponentFixtureAutoDetect = new core_1.OpaqueToken("ComponentFixtureAutoDetect");
exports.ComponentFixtureNoNgZone = new core_1.OpaqueToken("ComponentFixtureNoNgZone");
/**
 * Fixture for debugging and testing a component.
 */
var ComponentFixture = (function () {
    function ComponentFixture(componentRef, ngZone, autoDetect) {
        var _this = this;
        this._isStable = true;
        this._completer = null;
        this._onUnstableSubscription = null;
        this._onStableSubscription = null;
        this._onMicrotaskEmptySubscription = null;
        this._onErrorSubscription = null;
        this.changeDetectorRef = componentRef.changeDetectorRef;
        this.elementRef = componentRef.location;
        this.debugElement = debug_node_1.getDebugNode(this.elementRef.nativeElement);
        this.componentInstance = componentRef.instance;
        this.nativeElement = this.elementRef.nativeElement;
        this.componentRef = componentRef;
        this.ngZone = ngZone;
        this._autoDetect = autoDetect;
        if (ngZone != null) {
            this._onUnstableSubscription =
                async_1.ObservableWrapper.subscribe(ngZone.onUnstable, function (_) { _this._isStable = false; });
            this._onMicrotaskEmptySubscription =
                async_1.ObservableWrapper.subscribe(ngZone.onMicrotaskEmpty, function (_) {
                    if (_this._autoDetect) {
                        // Do a change detection run with checkNoChanges set to true to check
                        // there are no changes on the second run.
                        _this.detectChanges(true);
                    }
                });
            this._onStableSubscription = async_1.ObservableWrapper.subscribe(ngZone.onStable, function (_) {
                _this._isStable = true;
                if (_this._completer != null) {
                    _this._completer.resolve(true);
                    _this._completer = null;
                }
            });
            this._onErrorSubscription = async_1.ObservableWrapper.subscribe(ngZone.onError, function (error) { throw error.error; });
        }
    }
    ComponentFixture.prototype._tick = function (checkNoChanges) {
        this.changeDetectorRef.detectChanges();
        if (checkNoChanges) {
            this.checkNoChanges();
        }
    };
    /**
     * Trigger a change detection cycle for the component.
     */
    ComponentFixture.prototype.detectChanges = function (checkNoChanges) {
        var _this = this;
        if (checkNoChanges === void 0) { checkNoChanges = true; }
        if (this.ngZone != null) {
            // Run the change detection inside the NgZone so that any async tasks as part of the change
            // detection are captured by the zone and can be waited for in isStable.
            this.ngZone.run(function () { _this._tick(checkNoChanges); });
        }
        else {
            // Running without zone. Just do the change detection.
            this._tick(checkNoChanges);
        }
    };
    /**
     * Do a change detection run to make sure there were no changes.
     */
    ComponentFixture.prototype.checkNoChanges = function () { this.changeDetectorRef.checkNoChanges(); };
    /**
     * Set whether the fixture should autodetect changes.
     *
     * Also runs detectChanges once so that any existing change is detected.
     */
    ComponentFixture.prototype.autoDetectChanges = function (autoDetect) {
        if (autoDetect === void 0) { autoDetect = true; }
        if (this.ngZone == null) {
            throw new exceptions_1.BaseException('Cannot call autoDetectChanges when ComponentFixtureNoNgZone is set');
        }
        this._autoDetect = autoDetect;
        this.detectChanges();
    };
    /**
     * Return whether the fixture is currently stable or has async tasks that have not been completed
     * yet.
     */
    ComponentFixture.prototype.isStable = function () { return this._isStable; };
    /**
     * Get a promise that resolves when the fixture is stable.
     *
     * This can be used to resume testing after events have triggered asynchronous activity or
     * asynchronous change detection.
     */
    ComponentFixture.prototype.whenStable = function () {
        if (this._isStable) {
            return async_1.PromiseWrapper.resolve(false);
        }
        else {
            this._completer = new async_1.PromiseCompleter();
            return this._completer.promise;
        }
    };
    /**
     * Trigger component destruction.
     */
    ComponentFixture.prototype.destroy = function () {
        this.componentRef.destroy();
        if (this._onUnstableSubscription != null) {
            async_1.ObservableWrapper.dispose(this._onUnstableSubscription);
            this._onUnstableSubscription = null;
        }
        if (this._onStableSubscription != null) {
            async_1.ObservableWrapper.dispose(this._onStableSubscription);
            this._onStableSubscription = null;
        }
        if (this._onMicrotaskEmptySubscription != null) {
            async_1.ObservableWrapper.dispose(this._onMicrotaskEmptySubscription);
            this._onMicrotaskEmptySubscription = null;
        }
        if (this._onErrorSubscription != null) {
            async_1.ObservableWrapper.dispose(this._onErrorSubscription);
            this._onErrorSubscription = null;
        }
    };
    return ComponentFixture;
}());
exports.ComponentFixture = ComponentFixture;
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
        var _this = this;
        var noNgZone = lang_1.IS_DART || this._injector.get(exports.ComponentFixtureNoNgZone, false);
        var ngZone = noNgZone ? null : this._injector.get(core_1.NgZone, null);
        var autoDetect = this._injector.get(exports.ComponentFixtureAutoDetect, false);
        var initComponent = function () {
            var mockDirectiveResolver = _this._injector.get(compiler_1.DirectiveResolver);
            var mockViewResolver = _this._injector.get(compiler_1.ViewResolver);
            _this._viewOverrides.forEach(function (view, type) { return mockViewResolver.setView(type, view); });
            _this._templateOverrides.forEach(function (template, type) {
                return mockViewResolver.setInlineTemplate(type, template);
            });
            _this._directiveOverrides.forEach(function (overrides, component) {
                overrides.forEach(function (to, from) { mockViewResolver.overrideViewDirective(component, from, to); });
            });
            _this._bindingsOverrides.forEach(function (bindings, type) { return mockDirectiveResolver.setBindingsOverride(type, bindings); });
            _this._viewBindingsOverrides.forEach(function (bindings, type) { return mockDirectiveResolver.setViewBindingsOverride(type, bindings); });
            var rootElId = "root" + _nextRootElementId++;
            var rootEl = utils_1.el("<div id=\"" + rootElId + "\"></div>");
            var doc = _this._injector.get(dom_tokens_1.DOCUMENT);
            // TODO(juliemr): can/should this be optional?
            var oldRoots = dom_adapter_1.DOM.querySelectorAll(doc, '[id^=root]');
            for (var i = 0; i < oldRoots.length; i++) {
                dom_adapter_1.DOM.remove(oldRoots[i]);
            }
            dom_adapter_1.DOM.appendChild(doc.body, rootEl);
            var promise = _this._injector.get(core_1.DynamicComponentLoader)
                .loadAsRoot(rootComponentType, "#" + rootElId, _this._injector);
            return promise.then(function (componentRef) { return new ComponentFixture(componentRef, ngZone, autoDetect); });
        };
        return ngZone == null ? initComponent() : ngZone.run(initComponent);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9jb21wb25lbnRfYnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtUktRUWo4VWQudG1wL2FuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RfY29tcG9uZW50X2J1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHFCQWFPLGVBQWUsQ0FBQyxDQUFBO0FBQ3ZCLHlCQUE4QyxtQkFBbUIsQ0FBQyxDQUFBO0FBRWxFLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELHFCQUFnRCwwQkFBMEIsQ0FBQyxDQUFBO0FBQzNFLHNCQUFrRSwyQkFBMkIsQ0FBQyxDQUFBO0FBQzlGLDJCQUFzQyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBRXZFLHNCQUFpQixTQUFTLENBQUMsQ0FBQTtBQUUzQiwyQkFBdUIsc0NBQXNDLENBQUMsQ0FBQTtBQUM5RCw0QkFBa0IsdUNBQXVDLENBQUMsQ0FBQTtBQUUxRCwyQkFBb0Qsb0NBQW9DLENBQUMsQ0FBQTtBQUV6RiwyQkFBbUIsY0FBYyxDQUFDLENBQUE7QUFFdkIsa0NBQTBCLEdBQUcsSUFBSSxrQkFBVyxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFDM0UsZ0NBQXdCLEdBQUcsSUFBSSxrQkFBVyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFFbEY7O0dBRUc7QUFDSDtJQTZDRSwwQkFBWSxZQUEwQixFQUFFLE1BQWMsRUFBRSxVQUFtQjtRQTdDN0UsaUJBaUtDO1FBM0hTLGNBQVMsR0FBWSxJQUFJLENBQUM7UUFDMUIsZUFBVSxHQUEwQixJQUFJLENBQUM7UUFDekMsNEJBQXVCLEdBQUcsSUFBSSxDQUFDO1FBQy9CLDBCQUFxQixHQUFHLElBQUksQ0FBQztRQUM3QixrQ0FBNkIsR0FBRyxJQUFJLENBQUM7UUFDckMseUJBQW9CLEdBQUcsSUFBSSxDQUFDO1FBR2xDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxZQUFZLENB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QUFDO0lBQ2hCLENBQUM7SUE1TEg7UUFBQyxpQkFBVSxFQUFFOzs0QkFBQTtJQTZMYiwyQkFBQztBQUFELENBQUMsQUE1TEQsSUE0TEM7QUE1TFksNEJBQW9CLHVCQTRMaEMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIE9wYXF1ZVRva2VuLFxuICBDb21wb25lbnRSZWYsXG4gIER5bmFtaWNDb21wb25lbnRMb2FkZXIsXG4gIEluamVjdG9yLFxuICBJbmplY3RhYmxlLFxuICBWaWV3TWV0YWRhdGEsXG4gIEVsZW1lbnRSZWYsXG4gIEVtYmVkZGVkVmlld1JlZixcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIHByb3ZpZGUsXG4gIE5nWm9uZSxcbiAgTmdab25lRXJyb3Jcbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0RpcmVjdGl2ZVJlc29sdmVyLCBWaWV3UmVzb2x2ZXJ9IGZyb20gJ2FuZ3VsYXIyL2NvbXBpbGVyJztcblxuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtUeXBlLCBpc1ByZXNlbnQsIGlzQmxhbmssIElTX0RBUlR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1Byb21pc2VXcmFwcGVyLCBPYnNlcnZhYmxlV3JhcHBlciwgUHJvbWlzZUNvbXBsZXRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5pbXBvcnQge2VsfSBmcm9tICcuL3V0aWxzJztcblxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fdG9rZW5zJztcbmltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcblxuaW1wb3J0IHtEZWJ1Z05vZGUsIERlYnVnRWxlbWVudCwgZ2V0RGVidWdOb2RlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kZWJ1Zy9kZWJ1Z19ub2RlJztcblxuaW1wb3J0IHt0aWNrfSBmcm9tICcuL2Zha2VfYXN5bmMnO1xuXG5leHBvcnQgdmFyIENvbXBvbmVudEZpeHR1cmVBdXRvRGV0ZWN0ID0gbmV3IE9wYXF1ZVRva2VuKFwiQ29tcG9uZW50Rml4dHVyZUF1dG9EZXRlY3RcIik7XG5leHBvcnQgdmFyIENvbXBvbmVudEZpeHR1cmVOb05nWm9uZSA9IG5ldyBPcGFxdWVUb2tlbihcIkNvbXBvbmVudEZpeHR1cmVOb05nWm9uZVwiKTtcblxuLyoqXG4gKiBGaXh0dXJlIGZvciBkZWJ1Z2dpbmcgYW5kIHRlc3RpbmcgYSBjb21wb25lbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRGaXh0dXJlIHtcbiAgLyoqXG4gICAqIFRoZSBEZWJ1Z0VsZW1lbnQgYXNzb2NpYXRlZCB3aXRoIHRoZSByb290IGVsZW1lbnQgb2YgdGhpcyBjb21wb25lbnQuXG4gICAqL1xuICBkZWJ1Z0VsZW1lbnQ6IERlYnVnRWxlbWVudDtcblxuICAvKipcbiAgICogVGhlIGluc3RhbmNlIG9mIHRoZSByb290IGNvbXBvbmVudCBjbGFzcy5cbiAgICovXG4gIGNvbXBvbmVudEluc3RhbmNlOiBhbnk7XG5cbiAgLyoqXG4gICAqIFRoZSBuYXRpdmUgZWxlbWVudCBhdCB0aGUgcm9vdCBvZiB0aGUgY29tcG9uZW50LlxuICAgKi9cbiAgbmF0aXZlRWxlbWVudDogYW55O1xuXG4gIC8qKlxuICAgKiBUaGUgRWxlbWVudFJlZiBmb3IgdGhlIGVsZW1lbnQgYXQgdGhlIHJvb3Qgb2YgdGhlIGNvbXBvbmVudC5cbiAgICovXG4gIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY7XG5cbiAgLyoqXG4gICAqIFRoZSBDb21wb25lbnRSZWYgZm9yIHRoZSBjb21wb25lbnRcbiAgICovXG4gIGNvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmO1xuXG4gIC8qKlxuICAgKiBUaGUgQ2hhbmdlRGV0ZWN0b3JSZWYgZm9yIHRoZSBjb21wb25lbnRcbiAgICovXG4gIGNoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZjtcblxuICAvKipcbiAgICogVGhlIE5nWm9uZSBpbiB3aGljaCB0aGlzIGNvbXBvbmVudCB3YXMgaW5zdGFudGlhdGVkLlxuICAgKi9cbiAgbmdab25lOiBOZ1pvbmU7XG5cbiAgcHJpdmF0ZSBfYXV0b0RldGVjdDogYm9vbGVhbjtcblxuICBwcml2YXRlIF9pc1N0YWJsZTogYm9vbGVhbiA9IHRydWU7XG4gIHByaXZhdGUgX2NvbXBsZXRlcjogUHJvbWlzZUNvbXBsZXRlcjxhbnk+ID0gbnVsbDtcbiAgcHJpdmF0ZSBfb25VbnN0YWJsZVN1YnNjcmlwdGlvbiA9IG51bGw7XG4gIHByaXZhdGUgX29uU3RhYmxlU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgcHJpdmF0ZSBfb25NaWNyb3Rhc2tFbXB0eVN1YnNjcmlwdGlvbiA9IG51bGw7XG4gIHByaXZhdGUgX29uRXJyb3JTdWJzY3JpcHRpb24gPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKGNvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmLCBuZ1pvbmU6IE5nWm9uZSwgYXV0b0RldGVjdDogYm9vbGVhbikge1xuICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3JSZWYgPSBjb21wb25lbnRSZWYuY2hhbmdlRGV0ZWN0b3JSZWY7XG4gICAgdGhpcy5lbGVtZW50UmVmID0gY29tcG9uZW50UmVmLmxvY2F0aW9uO1xuICAgIHRoaXMuZGVidWdFbGVtZW50ID0gPERlYnVnRWxlbWVudD5nZXREZWJ1Z05vZGUodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpO1xuICAgIHRoaXMuY29tcG9uZW50SW5zdGFuY2UgPSBjb21wb25lbnRSZWYuaW5zdGFuY2U7XG4gICAgdGhpcy5uYXRpdmVFbGVtZW50ID0gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgdGhpcy5jb21wb25lbnRSZWYgPSBjb21wb25lbnRSZWY7XG4gICAgdGhpcy5uZ1pvbmUgPSBuZ1pvbmU7XG4gICAgdGhpcy5fYXV0b0RldGVjdCA9IGF1dG9EZXRlY3Q7XG5cbiAgICBpZiAobmdab25lICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX29uVW5zdGFibGVTdWJzY3JpcHRpb24gPVxuICAgICAgICAgIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZShuZ1pvbmUub25VbnN0YWJsZSwgKF8pID0+IHsgdGhpcy5faXNTdGFibGUgPSBmYWxzZTsgfSk7XG4gICAgICB0aGlzLl9vbk1pY3JvdGFza0VtcHR5U3Vic2NyaXB0aW9uID1cbiAgICAgICAgICBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUobmdab25lLm9uTWljcm90YXNrRW1wdHksIChfKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5fYXV0b0RldGVjdCkge1xuICAgICAgICAgICAgICAvLyBEbyBhIGNoYW5nZSBkZXRlY3Rpb24gcnVuIHdpdGggY2hlY2tOb0NoYW5nZXMgc2V0IHRvIHRydWUgdG8gY2hlY2tcbiAgICAgICAgICAgICAgLy8gdGhlcmUgYXJlIG5vIGNoYW5nZXMgb24gdGhlIHNlY29uZCBydW4uXG4gICAgICAgICAgICAgIHRoaXMuZGV0ZWN0Q2hhbmdlcyh0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgIHRoaXMuX29uU3RhYmxlU3Vic2NyaXB0aW9uID0gT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKG5nWm9uZS5vblN0YWJsZSwgKF8pID0+IHtcbiAgICAgICAgdGhpcy5faXNTdGFibGUgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5fY29tcGxldGVyICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl9jb21wbGV0ZXIucmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICB0aGlzLl9jb21wbGV0ZXIgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5fb25FcnJvclN1YnNjcmlwdGlvbiA9IE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZShcbiAgICAgICAgICBuZ1pvbmUub25FcnJvciwgKGVycm9yOiBOZ1pvbmVFcnJvcikgPT4geyB0aHJvdyBlcnJvci5lcnJvcjsgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdGljayhjaGVja05vQ2hhbmdlczogYm9vbGVhbikge1xuICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3JSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgIGlmIChjaGVja05vQ2hhbmdlcykge1xuICAgICAgdGhpcy5jaGVja05vQ2hhbmdlcygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIGEgY2hhbmdlIGRldGVjdGlvbiBjeWNsZSBmb3IgdGhlIGNvbXBvbmVudC5cbiAgICovXG4gIGRldGVjdENoYW5nZXMoY2hlY2tOb0NoYW5nZXM6IGJvb2xlYW4gPSB0cnVlKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubmdab25lICE9IG51bGwpIHtcbiAgICAgIC8vIFJ1biB0aGUgY2hhbmdlIGRldGVjdGlvbiBpbnNpZGUgdGhlIE5nWm9uZSBzbyB0aGF0IGFueSBhc3luYyB0YXNrcyBhcyBwYXJ0IG9mIHRoZSBjaGFuZ2VcbiAgICAgIC8vIGRldGVjdGlvbiBhcmUgY2FwdHVyZWQgYnkgdGhlIHpvbmUgYW5kIGNhbiBiZSB3YWl0ZWQgZm9yIGluIGlzU3RhYmxlLlxuICAgICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IHsgdGhpcy5fdGljayhjaGVja05vQ2hhbmdlcyk7IH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSdW5uaW5nIHdpdGhvdXQgem9uZS4gSnVzdCBkbyB0aGUgY2hhbmdlIGRldGVjdGlvbi5cbiAgICAgIHRoaXMuX3RpY2soY2hlY2tOb0NoYW5nZXMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEbyBhIGNoYW5nZSBkZXRlY3Rpb24gcnVuIHRvIG1ha2Ugc3VyZSB0aGVyZSB3ZXJlIG5vIGNoYW5nZXMuXG4gICAqL1xuICBjaGVja05vQ2hhbmdlcygpOiB2b2lkIHsgdGhpcy5jaGFuZ2VEZXRlY3RvclJlZi5jaGVja05vQ2hhbmdlcygpOyB9XG5cbiAgLyoqXG4gICAqIFNldCB3aGV0aGVyIHRoZSBmaXh0dXJlIHNob3VsZCBhdXRvZGV0ZWN0IGNoYW5nZXMuXG4gICAqXG4gICAqIEFsc28gcnVucyBkZXRlY3RDaGFuZ2VzIG9uY2Ugc28gdGhhdCBhbnkgZXhpc3RpbmcgY2hhbmdlIGlzIGRldGVjdGVkLlxuICAgKi9cbiAgYXV0b0RldGVjdENoYW5nZXMoYXV0b0RldGVjdDogYm9vbGVhbiA9IHRydWUpIHtcbiAgICBpZiAodGhpcy5uZ1pvbmUgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ0Nhbm5vdCBjYWxsIGF1dG9EZXRlY3RDaGFuZ2VzIHdoZW4gQ29tcG9uZW50Rml4dHVyZU5vTmdab25lIGlzIHNldCcpO1xuICAgIH1cbiAgICB0aGlzLl9hdXRvRGV0ZWN0ID0gYXV0b0RldGVjdDtcbiAgICB0aGlzLmRldGVjdENoYW5nZXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gd2hldGhlciB0aGUgZml4dHVyZSBpcyBjdXJyZW50bHkgc3RhYmxlIG9yIGhhcyBhc3luYyB0YXNrcyB0aGF0IGhhdmUgbm90IGJlZW4gY29tcGxldGVkXG4gICAqIHlldC5cbiAgICovXG4gIGlzU3RhYmxlKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5faXNTdGFibGU7IH1cblxuICAvKipcbiAgICogR2V0IGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIGZpeHR1cmUgaXMgc3RhYmxlLlxuICAgKlxuICAgKiBUaGlzIGNhbiBiZSB1c2VkIHRvIHJlc3VtZSB0ZXN0aW5nIGFmdGVyIGV2ZW50cyBoYXZlIHRyaWdnZXJlZCBhc3luY2hyb25vdXMgYWN0aXZpdHkgb3JcbiAgICogYXN5bmNocm9ub3VzIGNoYW5nZSBkZXRlY3Rpb24uXG4gICAqL1xuICB3aGVuU3RhYmxlKCk6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKHRoaXMuX2lzU3RhYmxlKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZShmYWxzZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2NvbXBsZXRlciA9IG5ldyBQcm9taXNlQ29tcGxldGVyPGFueT4oKTtcbiAgICAgIHJldHVybiB0aGlzLl9jb21wbGV0ZXIucHJvbWlzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlciBjb21wb25lbnQgZGVzdHJ1Y3Rpb24uXG4gICAqL1xuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuY29tcG9uZW50UmVmLmRlc3Ryb3koKTtcbiAgICBpZiAodGhpcy5fb25VbnN0YWJsZVN1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICBPYnNlcnZhYmxlV3JhcHBlci5kaXNwb3NlKHRoaXMuX29uVW5zdGFibGVTdWJzY3JpcHRpb24pO1xuICAgICAgdGhpcy5fb25VbnN0YWJsZVN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl9vblN0YWJsZVN1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICBPYnNlcnZhYmxlV3JhcHBlci5kaXNwb3NlKHRoaXMuX29uU3RhYmxlU3Vic2NyaXB0aW9uKTtcbiAgICAgIHRoaXMuX29uU3RhYmxlU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX29uTWljcm90YXNrRW1wdHlTdWJzY3JpcHRpb24gIT0gbnVsbCkge1xuICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuZGlzcG9zZSh0aGlzLl9vbk1pY3JvdGFza0VtcHR5U3Vic2NyaXB0aW9uKTtcbiAgICAgIHRoaXMuX29uTWljcm90YXNrRW1wdHlTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5fb25FcnJvclN1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICBPYnNlcnZhYmxlV3JhcHBlci5kaXNwb3NlKHRoaXMuX29uRXJyb3JTdWJzY3JpcHRpb24pO1xuICAgICAgdGhpcy5fb25FcnJvclN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfVxuICB9XG59XG5cbnZhciBfbmV4dFJvb3RFbGVtZW50SWQgPSAwO1xuXG4vKipcbiAqIEJ1aWxkcyBhIENvbXBvbmVudEZpeHR1cmUgZm9yIHVzZSBpbiBjb21wb25lbnQgbGV2ZWwgdGVzdHMuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2JpbmRpbmdzT3ZlcnJpZGVzID0gbmV3IE1hcDxUeXBlLCBhbnlbXT4oKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZGlyZWN0aXZlT3ZlcnJpZGVzID0gbmV3IE1hcDxUeXBlLCBNYXA8VHlwZSwgVHlwZT4+KCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3RlbXBsYXRlT3ZlcnJpZGVzID0gbmV3IE1hcDxUeXBlLCBzdHJpbmc+KCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ZpZXdCaW5kaW5nc092ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgYW55W10+KCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ZpZXdPdmVycmlkZXMgPSBuZXcgTWFwPFR5cGUsIFZpZXdNZXRhZGF0YT4oKTtcblxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2luamVjdG9yOiBJbmplY3Rvcikge31cblxuICAvKiogQGludGVybmFsICovXG4gIF9jbG9uZSgpOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgbGV0IGNsb25lID0gbmV3IFRlc3RDb21wb25lbnRCdWlsZGVyKHRoaXMuX2luamVjdG9yKTtcbiAgICBjbG9uZS5fdmlld092ZXJyaWRlcyA9IE1hcFdyYXBwZXIuY2xvbmUodGhpcy5fdmlld092ZXJyaWRlcyk7XG4gICAgY2xvbmUuX2RpcmVjdGl2ZU92ZXJyaWRlcyA9IE1hcFdyYXBwZXIuY2xvbmUodGhpcy5fZGlyZWN0aXZlT3ZlcnJpZGVzKTtcbiAgICBjbG9uZS5fdGVtcGxhdGVPdmVycmlkZXMgPSBNYXBXcmFwcGVyLmNsb25lKHRoaXMuX3RlbXBsYXRlT3ZlcnJpZGVzKTtcbiAgICBjbG9uZS5fYmluZGluZ3NPdmVycmlkZXMgPSBNYXBXcmFwcGVyLmNsb25lKHRoaXMuX2JpbmRpbmdzT3ZlcnJpZGVzKTtcbiAgICBjbG9uZS5fdmlld0JpbmRpbmdzT3ZlcnJpZGVzID0gTWFwV3JhcHBlci5jbG9uZSh0aGlzLl92aWV3QmluZGluZ3NPdmVycmlkZXMpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgb25seSB0aGUgaHRtbCBvZiBhIHtAbGluayBDb21wb25lbnRNZXRhZGF0YX0uXG4gICAqIEFsbCB0aGUgb3RoZXIgcHJvcGVydGllcyBvZiB0aGUgY29tcG9uZW50J3Mge0BsaW5rIFZpZXdNZXRhZGF0YX0gYXJlIHByZXNlcnZlZC5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGh0bWxcbiAgICpcbiAgICogQHJldHVybiB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9XG4gICAqL1xuICBvdmVycmlkZVRlbXBsYXRlKGNvbXBvbmVudFR5cGU6IFR5cGUsIHRlbXBsYXRlOiBzdHJpbmcpOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgbGV0IGNsb25lID0gdGhpcy5fY2xvbmUoKTtcbiAgICBjbG9uZS5fdGVtcGxhdGVPdmVycmlkZXMuc2V0KGNvbXBvbmVudFR5cGUsIHRlbXBsYXRlKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIGEgY29tcG9uZW50J3Mge0BsaW5rIFZpZXdNZXRhZGF0YX0uXG4gICAqXG4gICAqIEBwYXJhbSB7VHlwZX0gY29tcG9uZW50XG4gICAqIEBwYXJhbSB7dmlld30gVmlld1xuICAgKlxuICAgKiBAcmV0dXJuIHtUZXN0Q29tcG9uZW50QnVpbGRlcn1cbiAgICovXG4gIG92ZXJyaWRlVmlldyhjb21wb25lbnRUeXBlOiBUeXBlLCB2aWV3OiBWaWV3TWV0YWRhdGEpOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgbGV0IGNsb25lID0gdGhpcy5fY2xvbmUoKTtcbiAgICBjbG9uZS5fdmlld092ZXJyaWRlcy5zZXQoY29tcG9uZW50VHlwZSwgdmlldyk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyB0aGUgZGlyZWN0aXZlcyBmcm9tIHRoZSBjb21wb25lbnQge0BsaW5rIFZpZXdNZXRhZGF0YX0uXG4gICAqXG4gICAqIEBwYXJhbSB7VHlwZX0gY29tcG9uZW50XG4gICAqIEBwYXJhbSB7VHlwZX0gZnJvbVxuICAgKiBAcGFyYW0ge1R5cGV9IHRvXG4gICAqXG4gICAqIEByZXR1cm4ge1Rlc3RDb21wb25lbnRCdWlsZGVyfVxuICAgKi9cbiAgb3ZlcnJpZGVEaXJlY3RpdmUoY29tcG9uZW50VHlwZTogVHlwZSwgZnJvbTogVHlwZSwgdG86IFR5cGUpOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgbGV0IGNsb25lID0gdGhpcy5fY2xvbmUoKTtcbiAgICBsZXQgb3ZlcnJpZGVzRm9yQ29tcG9uZW50ID0gY2xvbmUuX2RpcmVjdGl2ZU92ZXJyaWRlcy5nZXQoY29tcG9uZW50VHlwZSk7XG4gICAgaWYgKCFpc1ByZXNlbnQob3ZlcnJpZGVzRm9yQ29tcG9uZW50KSkge1xuICAgICAgY2xvbmUuX2RpcmVjdGl2ZU92ZXJyaWRlcy5zZXQoY29tcG9uZW50VHlwZSwgbmV3IE1hcDxUeXBlLCBUeXBlPigpKTtcbiAgICAgIG92ZXJyaWRlc0ZvckNvbXBvbmVudCA9IGNsb25lLl9kaXJlY3RpdmVPdmVycmlkZXMuZ2V0KGNvbXBvbmVudFR5cGUpO1xuICAgIH1cbiAgICBvdmVycmlkZXNGb3JDb21wb25lbnQuc2V0KGZyb20sIHRvKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIG9uZSBvciBtb3JlIGluamVjdGFibGVzIGNvbmZpZ3VyZWQgdmlhIGBwcm92aWRlcnNgIG1ldGFkYXRhIHByb3BlcnR5IG9mIGEgZGlyZWN0aXZlXG4gICAqIG9yXG4gICAqIGNvbXBvbmVudC5cbiAgICogVmVyeSB1c2VmdWwgd2hlbiBjZXJ0YWluIHByb3ZpZGVycyBuZWVkIHRvIGJlIG1vY2tlZCBvdXQuXG4gICAqXG4gICAqIFRoZSBwcm92aWRlcnMgc3BlY2lmaWVkIHZpYSB0aGlzIG1ldGhvZCBhcmUgYXBwZW5kZWQgdG8gdGhlIGV4aXN0aW5nIGBwcm92aWRlcnNgIGNhdXNpbmcgdGhlXG4gICAqIGR1cGxpY2F0ZWQgcHJvdmlkZXJzIHRvXG4gICAqIGJlIG92ZXJyaWRkZW4uXG4gICAqXG4gICAqIEBwYXJhbSB7VHlwZX0gY29tcG9uZW50XG4gICAqIEBwYXJhbSB7YW55W119IHByb3ZpZGVyc1xuICAgKlxuICAgKiBAcmV0dXJuIHtUZXN0Q29tcG9uZW50QnVpbGRlcn1cbiAgICovXG4gIG92ZXJyaWRlUHJvdmlkZXJzKHR5cGU6IFR5cGUsIHByb3ZpZGVyczogYW55W10pOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgbGV0IGNsb25lID0gdGhpcy5fY2xvbmUoKTtcbiAgICBjbG9uZS5fYmluZGluZ3NPdmVycmlkZXMuc2V0KHR5cGUsIHByb3ZpZGVycyk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBvdmVycmlkZUJpbmRpbmdzKHR5cGU6IFR5cGUsIHByb3ZpZGVyczogYW55W10pOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgcmV0dXJuIHRoaXMub3ZlcnJpZGVQcm92aWRlcnModHlwZSwgcHJvdmlkZXJzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgb25lIG9yIG1vcmUgaW5qZWN0YWJsZXMgY29uZmlndXJlZCB2aWEgYHByb3ZpZGVyc2AgbWV0YWRhdGEgcHJvcGVydHkgb2YgYSBkaXJlY3RpdmVcbiAgICogb3JcbiAgICogY29tcG9uZW50LlxuICAgKiBWZXJ5IHVzZWZ1bCB3aGVuIGNlcnRhaW4gcHJvdmlkZXJzIG5lZWQgdG8gYmUgbW9ja2VkIG91dC5cbiAgICpcbiAgICogVGhlIHByb3ZpZGVycyBzcGVjaWZpZWQgdmlhIHRoaXMgbWV0aG9kIGFyZSBhcHBlbmRlZCB0byB0aGUgZXhpc3RpbmcgYHByb3ZpZGVyc2AgY2F1c2luZyB0aGVcbiAgICogZHVwbGljYXRlZCBwcm92aWRlcnMgdG9cbiAgICogYmUgb3ZlcnJpZGRlbi5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHthbnlbXX0gcHJvdmlkZXJzXG4gICAqXG4gICAqIEByZXR1cm4ge1Rlc3RDb21wb25lbnRCdWlsZGVyfVxuICAgKi9cbiAgb3ZlcnJpZGVWaWV3UHJvdmlkZXJzKHR5cGU6IFR5cGUsIHByb3ZpZGVyczogYW55W10pOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgbGV0IGNsb25lID0gdGhpcy5fY2xvbmUoKTtcbiAgICBjbG9uZS5fdmlld0JpbmRpbmdzT3ZlcnJpZGVzLnNldCh0eXBlLCBwcm92aWRlcnMpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgb3ZlcnJpZGVWaWV3QmluZGluZ3ModHlwZTogVHlwZSwgcHJvdmlkZXJzOiBhbnlbXSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICByZXR1cm4gdGhpcy5vdmVycmlkZVZpZXdQcm92aWRlcnModHlwZSwgcHJvdmlkZXJzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgYW5kIHJldHVybnMgYSBDb21wb25lbnRGaXh0dXJlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtQcm9taXNlPENvbXBvbmVudEZpeHR1cmU+fVxuICAgKi9cbiAgY3JlYXRlQXN5bmMocm9vdENvbXBvbmVudFR5cGU6IFR5cGUpOiBQcm9taXNlPENvbXBvbmVudEZpeHR1cmU+IHtcbiAgICBsZXQgbm9OZ1pvbmUgPSBJU19EQVJUIHx8IHRoaXMuX2luamVjdG9yLmdldChDb21wb25lbnRGaXh0dXJlTm9OZ1pvbmUsIGZhbHNlKTtcbiAgICBsZXQgbmdab25lOiBOZ1pvbmUgPSBub05nWm9uZSA/IG51bGwgOiB0aGlzLl9pbmplY3Rvci5nZXQoTmdab25lLCBudWxsKTtcbiAgICBsZXQgYXV0b0RldGVjdDogYm9vbGVhbiA9IHRoaXMuX2luamVjdG9yLmdldChDb21wb25lbnRGaXh0dXJlQXV0b0RldGVjdCwgZmFsc2UpO1xuXG4gICAgbGV0IGluaXRDb21wb25lbnQgPSAoKSA9PiB7XG4gICAgICBsZXQgbW9ja0RpcmVjdGl2ZVJlc29sdmVyID0gdGhpcy5faW5qZWN0b3IuZ2V0KERpcmVjdGl2ZVJlc29sdmVyKTtcbiAgICAgIGxldCBtb2NrVmlld1Jlc29sdmVyID0gdGhpcy5faW5qZWN0b3IuZ2V0KFZpZXdSZXNvbHZlcik7XG4gICAgICB0aGlzLl92aWV3T3ZlcnJpZGVzLmZvckVhY2goKHZpZXcsIHR5cGUpID0+IG1vY2tWaWV3UmVzb2x2ZXIuc2V0Vmlldyh0eXBlLCB2aWV3KSk7XG4gICAgICB0aGlzLl90ZW1wbGF0ZU92ZXJyaWRlcy5mb3JFYWNoKCh0ZW1wbGF0ZSwgdHlwZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vY2tWaWV3UmVzb2x2ZXIuc2V0SW5saW5lVGVtcGxhdGUodHlwZSwgdGVtcGxhdGUpKTtcbiAgICAgIHRoaXMuX2RpcmVjdGl2ZU92ZXJyaWRlcy5mb3JFYWNoKChvdmVycmlkZXMsIGNvbXBvbmVudCkgPT4ge1xuICAgICAgICBvdmVycmlkZXMuZm9yRWFjaChcbiAgICAgICAgICAgICh0bywgZnJvbSkgPT4geyBtb2NrVmlld1Jlc29sdmVyLm92ZXJyaWRlVmlld0RpcmVjdGl2ZShjb21wb25lbnQsIGZyb20sIHRvKTsgfSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2JpbmRpbmdzT3ZlcnJpZGVzLmZvckVhY2goXG4gICAgICAgICAgKGJpbmRpbmdzLCB0eXBlKSA9PiBtb2NrRGlyZWN0aXZlUmVzb2x2ZXIuc2V0QmluZGluZ3NPdmVycmlkZSh0eXBlLCBiaW5kaW5ncykpO1xuICAgICAgdGhpcy5fdmlld0JpbmRpbmdzT3ZlcnJpZGVzLmZvckVhY2goXG4gICAgICAgICAgKGJpbmRpbmdzLCB0eXBlKSA9PiBtb2NrRGlyZWN0aXZlUmVzb2x2ZXIuc2V0Vmlld0JpbmRpbmdzT3ZlcnJpZGUodHlwZSwgYmluZGluZ3MpKTtcblxuICAgICAgbGV0IHJvb3RFbElkID0gYHJvb3Qke19uZXh0Um9vdEVsZW1lbnRJZCsrfWA7XG4gICAgICBsZXQgcm9vdEVsID0gZWwoYDxkaXYgaWQ9XCIke3Jvb3RFbElkfVwiPjwvZGl2PmApO1xuICAgICAgbGV0IGRvYyA9IHRoaXMuX2luamVjdG9yLmdldChET0NVTUVOVCk7XG5cbiAgICAgIC8vIFRPRE8oanVsaWVtcik6IGNhbi9zaG91bGQgdGhpcyBiZSBvcHRpb25hbD9cbiAgICAgIGxldCBvbGRSb290cyA9IERPTS5xdWVyeVNlbGVjdG9yQWxsKGRvYywgJ1tpZF49cm9vdF0nKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb2xkUm9vdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgRE9NLnJlbW92ZShvbGRSb290c1tpXSk7XG4gICAgICB9XG4gICAgICBET00uYXBwZW5kQ2hpbGQoZG9jLmJvZHksIHJvb3RFbCk7XG5cbiAgICAgIGxldCBwcm9taXNlOiBQcm9taXNlPENvbXBvbmVudFJlZj4gPVxuICAgICAgICAgIHRoaXMuX2luamVjdG9yLmdldChEeW5hbWljQ29tcG9uZW50TG9hZGVyKVxuICAgICAgICAgICAgICAubG9hZEFzUm9vdChyb290Q29tcG9uZW50VHlwZSwgYCMke3Jvb3RFbElkfWAsIHRoaXMuX2luamVjdG9yKTtcbiAgICAgIHJldHVybiBwcm9taXNlLnRoZW4oXG4gICAgICAgICAgKGNvbXBvbmVudFJlZikgPT4geyByZXR1cm4gbmV3IENvbXBvbmVudEZpeHR1cmUoY29tcG9uZW50UmVmLCBuZ1pvbmUsIGF1dG9EZXRlY3QpOyB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5nWm9uZSA9PSBudWxsID8gaW5pdENvbXBvbmVudCgpIDogbmdab25lLnJ1bihpbml0Q29tcG9uZW50KTtcbiAgfVxuXG4gIGNyZWF0ZUZha2VBc3luYyhyb290Q29tcG9uZW50VHlwZTogVHlwZSk6IENvbXBvbmVudEZpeHR1cmUge1xuICAgIGxldCByZXN1bHQ7XG4gICAgbGV0IGVycm9yO1xuICAgIFByb21pc2VXcmFwcGVyLnRoZW4odGhpcy5jcmVhdGVBc3luYyhyb290Q29tcG9uZW50VHlwZSksIChfcmVzdWx0KSA9PiB7IHJlc3VsdCA9IF9yZXN1bHQ7IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAoX2Vycm9yKSA9PiB7IGVycm9yID0gX2Vycm9yOyB9KTtcbiAgICB0aWNrKCk7XG4gICAgaWYgKGlzUHJlc2VudChlcnJvcikpIHtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59XG4iXX0=