var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { OpaqueToken, DynamicComponentLoader, Injector, Injectable, NgZone } from 'angular2/core';
import { DirectiveResolver, ViewResolver } from 'angular2/compiler';
import { BaseException } from 'angular2/src/facade/exceptions';
import { isPresent, IS_DART } from 'angular2/src/facade/lang';
import { PromiseWrapper, ObservableWrapper, PromiseCompleter } from 'angular2/src/facade/async';
import { MapWrapper } from 'angular2/src/facade/collection';
import { el } from './utils';
import { DOCUMENT } from 'angular2/src/platform/dom/dom_tokens';
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
import { getDebugNode } from 'angular2/src/core/debug/debug_node';
import { tick } from './fake_async';
export var ComponentFixtureAutoDetect = new OpaqueToken("ComponentFixtureAutoDetect");
export var ComponentFixtureNoNgZone = new OpaqueToken("ComponentFixtureNoNgZone");
/**
 * Fixture for debugging and testing a component.
 */
export class ComponentFixture {
    constructor(componentRef, ngZone, autoDetect) {
        this._isStable = true;
        this._completer = null;
        this._onUnstableSubscription = null;
        this._onStableSubscription = null;
        this._onMicrotaskEmptySubscription = null;
        this._onErrorSubscription = null;
        this.changeDetectorRef = componentRef.changeDetectorRef;
        this.elementRef = componentRef.location;
        this.debugElement = getDebugNode(this.elementRef.nativeElement);
        this.componentInstance = componentRef.instance;
        this.nativeElement = this.elementRef.nativeElement;
        this.componentRef = componentRef;
        this.ngZone = ngZone;
        this._autoDetect = autoDetect;
        if (ngZone != null) {
            this._onUnstableSubscription =
                ObservableWrapper.subscribe(ngZone.onUnstable, (_) => { this._isStable = false; });
            this._onMicrotaskEmptySubscription =
                ObservableWrapper.subscribe(ngZone.onMicrotaskEmpty, (_) => {
                    if (this._autoDetect) {
                        // Do a change detection run with checkNoChanges set to true to check
                        // there are no changes on the second run.
                        this.detectChanges(true);
                    }
                });
            this._onStableSubscription = ObservableWrapper.subscribe(ngZone.onStable, (_) => {
                this._isStable = true;
                if (this._completer != null) {
                    this._completer.resolve(true);
                    this._completer = null;
                }
            });
            this._onErrorSubscription = ObservableWrapper.subscribe(ngZone.onError, (error) => { throw error.error; });
        }
    }
    _tick(checkNoChanges) {
        this.changeDetectorRef.detectChanges();
        if (checkNoChanges) {
            this.checkNoChanges();
        }
    }
    /**
     * Trigger a change detection cycle for the component.
     */
    detectChanges(checkNoChanges = true) {
        if (this.ngZone != null) {
            // Run the change detection inside the NgZone so that any async tasks as part of the change
            // detection are captured by the zone and can be waited for in isStable.
            this.ngZone.run(() => { this._tick(checkNoChanges); });
        }
        else {
            // Running without zone. Just do the change detection.
            this._tick(checkNoChanges);
        }
    }
    /**
     * Do a change detection run to make sure there were no changes.
     */
    checkNoChanges() { this.changeDetectorRef.checkNoChanges(); }
    /**
     * Set whether the fixture should autodetect changes.
     *
     * Also runs detectChanges once so that any existing change is detected.
     */
    autoDetectChanges(autoDetect = true) {
        if (this.ngZone == null) {
            throw new BaseException('Cannot call autoDetectChanges when ComponentFixtureNoNgZone is set');
        }
        this._autoDetect = autoDetect;
        this.detectChanges();
    }
    /**
     * Return whether the fixture is currently stable or has async tasks that have not been completed
     * yet.
     */
    isStable() { return this._isStable; }
    /**
     * Get a promise that resolves when the fixture is stable.
     *
     * This can be used to resume testing after events have triggered asynchronous activity or
     * asynchronous change detection.
     */
    whenStable() {
        if (this._isStable) {
            return PromiseWrapper.resolve(false);
        }
        else {
            this._completer = new PromiseCompleter();
            return this._completer.promise;
        }
    }
    /**
     * Trigger component destruction.
     */
    destroy() {
        this.componentRef.destroy();
        if (this._onUnstableSubscription != null) {
            ObservableWrapper.dispose(this._onUnstableSubscription);
            this._onUnstableSubscription = null;
        }
        if (this._onStableSubscription != null) {
            ObservableWrapper.dispose(this._onStableSubscription);
            this._onStableSubscription = null;
        }
        if (this._onMicrotaskEmptySubscription != null) {
            ObservableWrapper.dispose(this._onMicrotaskEmptySubscription);
            this._onMicrotaskEmptySubscription = null;
        }
        if (this._onErrorSubscription != null) {
            ObservableWrapper.dispose(this._onErrorSubscription);
            this._onErrorSubscription = null;
        }
    }
}
var _nextRootElementId = 0;
/**
 * Builds a ComponentFixture for use in component level tests.
 */
let TestComponentBuilder_1;
export let TestComponentBuilder = TestComponentBuilder_1 = class TestComponentBuilder {
    constructor(_injector) {
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
    _clone() {
        let clone = new TestComponentBuilder_1(this._injector);
        clone._viewOverrides = MapWrapper.clone(this._viewOverrides);
        clone._directiveOverrides = MapWrapper.clone(this._directiveOverrides);
        clone._templateOverrides = MapWrapper.clone(this._templateOverrides);
        clone._bindingsOverrides = MapWrapper.clone(this._bindingsOverrides);
        clone._viewBindingsOverrides = MapWrapper.clone(this._viewBindingsOverrides);
        return clone;
    }
    /**
     * Overrides only the html of a {@link ComponentMetadata}.
     * All the other properties of the component's {@link ViewMetadata} are preserved.
     *
     * @param {Type} component
     * @param {string} html
     *
     * @return {TestComponentBuilder}
     */
    overrideTemplate(componentType, template) {
        let clone = this._clone();
        clone._templateOverrides.set(componentType, template);
        return clone;
    }
    /**
     * Overrides a component's {@link ViewMetadata}.
     *
     * @param {Type} component
     * @param {view} View
     *
     * @return {TestComponentBuilder}
     */
    overrideView(componentType, view) {
        let clone = this._clone();
        clone._viewOverrides.set(componentType, view);
        return clone;
    }
    /**
     * Overrides the directives from the component {@link ViewMetadata}.
     *
     * @param {Type} component
     * @param {Type} from
     * @param {Type} to
     *
     * @return {TestComponentBuilder}
     */
    overrideDirective(componentType, from, to) {
        let clone = this._clone();
        let overridesForComponent = clone._directiveOverrides.get(componentType);
        if (!isPresent(overridesForComponent)) {
            clone._directiveOverrides.set(componentType, new Map());
            overridesForComponent = clone._directiveOverrides.get(componentType);
        }
        overridesForComponent.set(from, to);
        return clone;
    }
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
    overrideProviders(type, providers) {
        let clone = this._clone();
        clone._bindingsOverrides.set(type, providers);
        return clone;
    }
    /**
     * @deprecated
     */
    overrideBindings(type, providers) {
        return this.overrideProviders(type, providers);
    }
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
    overrideViewProviders(type, providers) {
        let clone = this._clone();
        clone._viewBindingsOverrides.set(type, providers);
        return clone;
    }
    /**
     * @deprecated
     */
    overrideViewBindings(type, providers) {
        return this.overrideViewProviders(type, providers);
    }
    /**
     * Builds and returns a ComponentFixture.
     *
     * @return {Promise<ComponentFixture>}
     */
    createAsync(rootComponentType) {
        let noNgZone = IS_DART || this._injector.get(ComponentFixtureNoNgZone, false);
        let ngZone = noNgZone ? null : this._injector.get(NgZone, null);
        let autoDetect = this._injector.get(ComponentFixtureAutoDetect, false);
        let initComponent = () => {
            let mockDirectiveResolver = this._injector.get(DirectiveResolver);
            let mockViewResolver = this._injector.get(ViewResolver);
            this._viewOverrides.forEach((view, type) => mockViewResolver.setView(type, view));
            this._templateOverrides.forEach((template, type) => mockViewResolver.setInlineTemplate(type, template));
            this._directiveOverrides.forEach((overrides, component) => {
                overrides.forEach((to, from) => { mockViewResolver.overrideViewDirective(component, from, to); });
            });
            this._bindingsOverrides.forEach((bindings, type) => mockDirectiveResolver.setBindingsOverride(type, bindings));
            this._viewBindingsOverrides.forEach((bindings, type) => mockDirectiveResolver.setViewBindingsOverride(type, bindings));
            let rootElId = `root${_nextRootElementId++}`;
            let rootEl = el(`<div id="${rootElId}"></div>`);
            let doc = this._injector.get(DOCUMENT);
            // TODO(juliemr): can/should this be optional?
            let oldRoots = DOM.querySelectorAll(doc, '[id^=root]');
            for (let i = 0; i < oldRoots.length; i++) {
                DOM.remove(oldRoots[i]);
            }
            DOM.appendChild(doc.body, rootEl);
            let promise = this._injector.get(DynamicComponentLoader)
                .loadAsRoot(rootComponentType, `#${rootElId}`, this._injector);
            return promise.then((componentRef) => { return new ComponentFixture(componentRef, ngZone, autoDetect); });
        };
        return ngZone == null ? initComponent() : ngZone.run(initComponent);
    }
    createFakeAsync(rootComponentType) {
        let result;
        let error;
        PromiseWrapper.then(this.createAsync(rootComponentType), (_result) => { result = _result; }, (_error) => { error = _error; });
        tick();
        if (isPresent(error)) {
            throw error;
        }
        return result;
    }
};
TestComponentBuilder = TestComponentBuilder_1 = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [Injector])
], TestComponentBuilder);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9jb21wb25lbnRfYnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtVUt2R1FtNDAudG1wL2FuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RfY29tcG9uZW50X2J1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFDTCxXQUFXLEVBRVgsc0JBQXNCLEVBQ3RCLFFBQVEsRUFDUixVQUFVLEVBTVYsTUFBTSxFQUVQLE1BQU0sZUFBZTtPQUNmLEVBQUMsaUJBQWlCLEVBQUUsWUFBWSxFQUFDLE1BQU0sbUJBQW1CO09BRTFELEVBQUMsYUFBYSxFQUFDLE1BQU0sZ0NBQWdDO09BQ3JELEVBQU8sU0FBUyxFQUFXLE9BQU8sRUFBQyxNQUFNLDBCQUEwQjtPQUNuRSxFQUFDLGNBQWMsRUFBRSxpQkFBaUIsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLDJCQUEyQjtPQUN0RixFQUFjLFVBQVUsRUFBQyxNQUFNLGdDQUFnQztPQUUvRCxFQUFDLEVBQUUsRUFBQyxNQUFNLFNBQVM7T0FFbkIsRUFBQyxRQUFRLEVBQUMsTUFBTSxzQ0FBc0M7T0FDdEQsRUFBQyxHQUFHLEVBQUMsTUFBTSx1Q0FBdUM7T0FFbEQsRUFBMEIsWUFBWSxFQUFDLE1BQU0sb0NBQW9DO09BRWpGLEVBQUMsSUFBSSxFQUFDLE1BQU0sY0FBYztBQUVqQyxPQUFPLElBQUksMEJBQTBCLEdBQUcsSUFBSSxXQUFXLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUN0RixPQUFPLElBQUksd0JBQXdCLEdBQUcsSUFBSSxXQUFXLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUVsRjs7R0FFRztBQUNIO0lBNkNFLFlBQVksWUFBMEIsRUFBRSxNQUFjLEVBQUUsVUFBbUI7UUFQbkUsY0FBUyxHQUFZLElBQUksQ0FBQztRQUMxQixlQUFVLEdBQTBCLElBQUksQ0FBQztRQUN6Qyw0QkFBdUIsR0FBRyxJQUFJ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T0FBTyxHQUNQLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDO2lCQUNyQyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdkUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQ2YsQ0FBQyxZQUFZLE9BQU8sTUFBTSxDQUFDLElBQUksZ0JBQWdCLENBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVGLENBQUMsQ0FBQztRQUVGLE1BQU0sQ0FBQyxNQUFNLElBQUksSUFBSSxHQUFHLGFBQWEsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUVELGVBQWUsQ0FBQyxpQkFBdUI7UUFDckMsSUFBSSxNQUFNLENBQUM7UUFDWCxJQUFJLEtBQUssQ0FBQztRQUNWLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsT0FBTyxPQUFPLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQ3ZFLENBQUMsTUFBTSxPQUFPLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRCxJQUFJLEVBQUUsQ0FBQztRQUNQLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsTUFBTSxLQUFLLENBQUM7UUFDZCxDQUFDO1FBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNoQixDQUFDO0FBQ0gsQ0FBQztBQTdMRDtJQUFDLFVBQVUsRUFBRTs7d0JBQUE7QUE2TFoiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBPcGFxdWVUb2tlbixcbiAgQ29tcG9uZW50UmVmLFxuICBEeW5hbWljQ29tcG9uZW50TG9hZGVyLFxuICBJbmplY3RvcixcbiAgSW5qZWN0YWJsZSxcbiAgVmlld01ldGFkYXRhLFxuICBFbGVtZW50UmVmLFxuICBFbWJlZGRlZFZpZXdSZWYsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBwcm92aWRlLFxuICBOZ1pvbmUsXG4gIE5nWm9uZUVycm9yXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtEaXJlY3RpdmVSZXNvbHZlciwgVmlld1Jlc29sdmVyfSBmcm9tICdhbmd1bGFyMi9jb21waWxlcic7XG5cbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7VHlwZSwgaXNQcmVzZW50LCBpc0JsYW5rLCBJU19EQVJUfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtQcm9taXNlV3JhcHBlciwgT2JzZXJ2YWJsZVdyYXBwZXIsIFByb21pc2VDb21wbGV0ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuaW1wb3J0IHtlbH0gZnJvbSAnLi91dGlscyc7XG5cbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX3Rva2Vucyc7XG5pbXBvcnQge0RPTX0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5cbmltcG9ydCB7RGVidWdOb2RlLCBEZWJ1Z0VsZW1lbnQsIGdldERlYnVnTm9kZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGVidWcvZGVidWdfbm9kZSc7XG5cbmltcG9ydCB7dGlja30gZnJvbSAnLi9mYWtlX2FzeW5jJztcblxuZXhwb3J0IHZhciBDb21wb25lbnRGaXh0dXJlQXV0b0RldGVjdCA9IG5ldyBPcGFxdWVUb2tlbihcIkNvbXBvbmVudEZpeHR1cmVBdXRvRGV0ZWN0XCIpO1xuZXhwb3J0IHZhciBDb21wb25lbnRGaXh0dXJlTm9OZ1pvbmUgPSBuZXcgT3BhcXVlVG9rZW4oXCJDb21wb25lbnRGaXh0dXJlTm9OZ1pvbmVcIik7XG5cbi8qKlxuICogRml4dHVyZSBmb3IgZGVidWdnaW5nIGFuZCB0ZXN0aW5nIGEgY29tcG9uZW50LlxuICovXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50Rml4dHVyZSB7XG4gIC8qKlxuICAgKiBUaGUgRGVidWdFbGVtZW50IGFzc29jaWF0ZWQgd2l0aCB0aGUgcm9vdCBlbGVtZW50IG9mIHRoaXMgY29tcG9uZW50LlxuICAgKi9cbiAgZGVidWdFbGVtZW50OiBEZWJ1Z0VsZW1lbnQ7XG5cbiAgLyoqXG4gICAqIFRoZSBpbnN0YW5jZSBvZiB0aGUgcm9vdCBjb21wb25lbnQgY2xhc3MuXG4gICAqL1xuICBjb21wb25lbnRJbnN0YW5jZTogYW55O1xuXG4gIC8qKlxuICAgKiBUaGUgbmF0aXZlIGVsZW1lbnQgYXQgdGhlIHJvb3Qgb2YgdGhlIGNvbXBvbmVudC5cbiAgICovXG4gIG5hdGl2ZUVsZW1lbnQ6IGFueTtcblxuICAvKipcbiAgICogVGhlIEVsZW1lbnRSZWYgZm9yIHRoZSBlbGVtZW50IGF0IHRoZSByb290IG9mIHRoZSBjb21wb25lbnQuXG4gICAqL1xuICBlbGVtZW50UmVmOiBFbGVtZW50UmVmO1xuXG4gIC8qKlxuICAgKiBUaGUgQ29tcG9uZW50UmVmIGZvciB0aGUgY29tcG9uZW50XG4gICAqL1xuICBjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjtcblxuICAvKipcbiAgICogVGhlIENoYW5nZURldGVjdG9yUmVmIGZvciB0aGUgY29tcG9uZW50XG4gICAqL1xuICBjaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWY7XG5cbiAgLyoqXG4gICAqIFRoZSBOZ1pvbmUgaW4gd2hpY2ggdGhpcyBjb21wb25lbnQgd2FzIGluc3RhbnRpYXRlZC5cbiAgICovXG4gIG5nWm9uZTogTmdab25lO1xuXG4gIHByaXZhdGUgX2F1dG9EZXRlY3Q6IGJvb2xlYW47XG5cbiAgcHJpdmF0ZSBfaXNTdGFibGU6IGJvb2xlYW4gPSB0cnVlO1xuICBwcml2YXRlIF9jb21wbGV0ZXI6IFByb21pc2VDb21wbGV0ZXI8YW55PiA9IG51bGw7XG4gIHByaXZhdGUgX29uVW5zdGFibGVTdWJzY3JpcHRpb24gPSBudWxsO1xuICBwcml2YXRlIF9vblN0YWJsZVN1YnNjcmlwdGlvbiA9IG51bGw7XG4gIHByaXZhdGUgX29uTWljcm90YXNrRW1wdHlTdWJzY3JpcHRpb24gPSBudWxsO1xuICBwcml2YXRlIF9vbkVycm9yU3Vic2NyaXB0aW9uID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZiwgbmdab25lOiBOZ1pvbmUsIGF1dG9EZXRlY3Q6IGJvb2xlYW4pIHtcbiAgICB0aGlzLmNoYW5nZURldGVjdG9yUmVmID0gY29tcG9uZW50UmVmLmNoYW5nZURldGVjdG9yUmVmO1xuICAgIHRoaXMuZWxlbWVudFJlZiA9IGNvbXBvbmVudFJlZi5sb2NhdGlvbjtcbiAgICB0aGlzLmRlYnVnRWxlbWVudCA9IDxEZWJ1Z0VsZW1lbnQ+Z2V0RGVidWdOb2RlKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KTtcbiAgICB0aGlzLmNvbXBvbmVudEluc3RhbmNlID0gY29tcG9uZW50UmVmLmluc3RhbmNlO1xuICAgIHRoaXMubmF0aXZlRWxlbWVudCA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgIHRoaXMuY29tcG9uZW50UmVmID0gY29tcG9uZW50UmVmO1xuICAgIHRoaXMubmdab25lID0gbmdab25lO1xuICAgIHRoaXMuX2F1dG9EZXRlY3QgPSBhdXRvRGV0ZWN0O1xuXG4gICAgaWYgKG5nWm9uZSAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9vblVuc3RhYmxlU3Vic2NyaXB0aW9uID1cbiAgICAgICAgICBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUobmdab25lLm9uVW5zdGFibGUsIChfKSA9PiB7IHRoaXMuX2lzU3RhYmxlID0gZmFsc2U7IH0pO1xuICAgICAgdGhpcy5fb25NaWNyb3Rhc2tFbXB0eVN1YnNjcmlwdGlvbiA9XG4gICAgICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKG5nWm9uZS5vbk1pY3JvdGFza0VtcHR5LCAoXykgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2F1dG9EZXRlY3QpIHtcbiAgICAgICAgICAgICAgLy8gRG8gYSBjaGFuZ2UgZGV0ZWN0aW9uIHJ1biB3aXRoIGNoZWNrTm9DaGFuZ2VzIHNldCB0byB0cnVlIHRvIGNoZWNrXG4gICAgICAgICAgICAgIC8vIHRoZXJlIGFyZSBubyBjaGFuZ2VzIG9uIHRoZSBzZWNvbmQgcnVuLlxuICAgICAgICAgICAgICB0aGlzLmRldGVjdENoYW5nZXModHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICB0aGlzLl9vblN0YWJsZVN1YnNjcmlwdGlvbiA9IE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZShuZ1pvbmUub25TdGFibGUsIChfKSA9PiB7XG4gICAgICAgIHRoaXMuX2lzU3RhYmxlID0gdHJ1ZTtcbiAgICAgICAgaWYgKHRoaXMuX2NvbXBsZXRlciAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5fY29tcGxldGVyLnJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgdGhpcy5fY29tcGxldGVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX29uRXJyb3JTdWJzY3JpcHRpb24gPSBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUoXG4gICAgICAgICAgbmdab25lLm9uRXJyb3IsIChlcnJvcjogTmdab25lRXJyb3IpID0+IHsgdGhyb3cgZXJyb3IuZXJyb3I7IH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3RpY2soY2hlY2tOb0NoYW5nZXM6IGJvb2xlYW4pIHtcbiAgICB0aGlzLmNoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICBpZiAoY2hlY2tOb0NoYW5nZXMpIHtcbiAgICAgIHRoaXMuY2hlY2tOb0NoYW5nZXMoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlciBhIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGUgZm9yIHRoZSBjb21wb25lbnQuXG4gICAqL1xuICBkZXRlY3RDaGFuZ2VzKGNoZWNrTm9DaGFuZ2VzOiBib29sZWFuID0gdHJ1ZSk6IHZvaWQge1xuICAgIGlmICh0aGlzLm5nWm9uZSAhPSBudWxsKSB7XG4gICAgICAvLyBSdW4gdGhlIGNoYW5nZSBkZXRlY3Rpb24gaW5zaWRlIHRoZSBOZ1pvbmUgc28gdGhhdCBhbnkgYXN5bmMgdGFza3MgYXMgcGFydCBvZiB0aGUgY2hhbmdlXG4gICAgICAvLyBkZXRlY3Rpb24gYXJlIGNhcHR1cmVkIGJ5IHRoZSB6b25lIGFuZCBjYW4gYmUgd2FpdGVkIGZvciBpbiBpc1N0YWJsZS5cbiAgICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7IHRoaXMuX3RpY2soY2hlY2tOb0NoYW5nZXMpOyB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUnVubmluZyB3aXRob3V0IHpvbmUuIEp1c3QgZG8gdGhlIGNoYW5nZSBkZXRlY3Rpb24uXG4gICAgICB0aGlzLl90aWNrKGNoZWNrTm9DaGFuZ2VzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRG8gYSBjaGFuZ2UgZGV0ZWN0aW9uIHJ1biB0byBtYWtlIHN1cmUgdGhlcmUgd2VyZSBubyBjaGFuZ2VzLlxuICAgKi9cbiAgY2hlY2tOb0NoYW5nZXMoKTogdm9pZCB7IHRoaXMuY2hhbmdlRGV0ZWN0b3JSZWYuY2hlY2tOb0NoYW5nZXMoKTsgfVxuXG4gIC8qKlxuICAgKiBTZXQgd2hldGhlciB0aGUgZml4dHVyZSBzaG91bGQgYXV0b2RldGVjdCBjaGFuZ2VzLlxuICAgKlxuICAgKiBBbHNvIHJ1bnMgZGV0ZWN0Q2hhbmdlcyBvbmNlIHNvIHRoYXQgYW55IGV4aXN0aW5nIGNoYW5nZSBpcyBkZXRlY3RlZC5cbiAgICovXG4gIGF1dG9EZXRlY3RDaGFuZ2VzKGF1dG9EZXRlY3Q6IGJvb2xlYW4gPSB0cnVlKSB7XG4gICAgaWYgKHRoaXMubmdab25lID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdDYW5ub3QgY2FsbCBhdXRvRGV0ZWN0Q2hhbmdlcyB3aGVuIENvbXBvbmVudEZpeHR1cmVOb05nWm9uZSBpcyBzZXQnKTtcbiAgICB9XG4gICAgdGhpcy5fYXV0b0RldGVjdCA9IGF1dG9EZXRlY3Q7XG4gICAgdGhpcy5kZXRlY3RDaGFuZ2VzKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHdoZXRoZXIgdGhlIGZpeHR1cmUgaXMgY3VycmVudGx5IHN0YWJsZSBvciBoYXMgYXN5bmMgdGFza3MgdGhhdCBoYXZlIG5vdCBiZWVuIGNvbXBsZXRlZFxuICAgKiB5ZXQuXG4gICAqL1xuICBpc1N0YWJsZSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX2lzU3RhYmxlOyB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBmaXh0dXJlIGlzIHN0YWJsZS5cbiAgICpcbiAgICogVGhpcyBjYW4gYmUgdXNlZCB0byByZXN1bWUgdGVzdGluZyBhZnRlciBldmVudHMgaGF2ZSB0cmlnZ2VyZWQgYXN5bmNocm9ub3VzIGFjdGl2aXR5IG9yXG4gICAqIGFzeW5jaHJvbm91cyBjaGFuZ2UgZGV0ZWN0aW9uLlxuICAgKi9cbiAgd2hlblN0YWJsZSgpOiBQcm9taXNlPGFueT4ge1xuICAgIGlmICh0aGlzLl9pc1N0YWJsZSkge1xuICAgICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlc29sdmUoZmFsc2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9jb21wbGV0ZXIgPSBuZXcgUHJvbWlzZUNvbXBsZXRlcjxhbnk+KCk7XG4gICAgICByZXR1cm4gdGhpcy5fY29tcGxldGVyLnByb21pc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgY29tcG9uZW50IGRlc3RydWN0aW9uLlxuICAgKi9cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmNvbXBvbmVudFJlZi5kZXN0cm95KCk7XG4gICAgaWYgKHRoaXMuX29uVW5zdGFibGVTdWJzY3JpcHRpb24gIT0gbnVsbCkge1xuICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuZGlzcG9zZSh0aGlzLl9vblVuc3RhYmxlU3Vic2NyaXB0aW9uKTtcbiAgICAgIHRoaXMuX29uVW5zdGFibGVTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5fb25TdGFibGVTdWJzY3JpcHRpb24gIT0gbnVsbCkge1xuICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuZGlzcG9zZSh0aGlzLl9vblN0YWJsZVN1YnNjcmlwdGlvbik7XG4gICAgICB0aGlzLl9vblN0YWJsZVN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl9vbk1pY3JvdGFza0VtcHR5U3Vic2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgIE9ic2VydmFibGVXcmFwcGVyLmRpc3Bvc2UodGhpcy5fb25NaWNyb3Rhc2tFbXB0eVN1YnNjcmlwdGlvbik7XG4gICAgICB0aGlzLl9vbk1pY3JvdGFza0VtcHR5U3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX29uRXJyb3JTdWJzY3JpcHRpb24gIT0gbnVsbCkge1xuICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuZGlzcG9zZSh0aGlzLl9vbkVycm9yU3Vic2NyaXB0aW9uKTtcbiAgICAgIHRoaXMuX29uRXJyb3JTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIH1cbiAgfVxufVxuXG52YXIgX25leHRSb290RWxlbWVudElkID0gMDtcblxuLyoqXG4gKiBCdWlsZHMgYSBDb21wb25lbnRGaXh0dXJlIGZvciB1c2UgaW4gY29tcG9uZW50IGxldmVsIHRlc3RzLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAvKiogQGludGVybmFsICovXG4gIF9iaW5kaW5nc092ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgYW55W10+KCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2RpcmVjdGl2ZU92ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgTWFwPFR5cGUsIFR5cGU+PigpO1xuICAvKiogQGludGVybmFsICovXG4gIF90ZW1wbGF0ZU92ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgc3RyaW5nPigpO1xuICAvKiogQGludGVybmFsICovXG4gIF92aWV3QmluZGluZ3NPdmVycmlkZXMgPSBuZXcgTWFwPFR5cGUsIGFueVtdPigpO1xuICAvKiogQGludGVybmFsICovXG4gIF92aWV3T3ZlcnJpZGVzID0gbmV3IE1hcDxUeXBlLCBWaWV3TWV0YWRhdGE+KCk7XG5cblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3IpIHt9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY2xvbmUoKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIGxldCBjbG9uZSA9IG5ldyBUZXN0Q29tcG9uZW50QnVpbGRlcih0aGlzLl9pbmplY3Rvcik7XG4gICAgY2xvbmUuX3ZpZXdPdmVycmlkZXMgPSBNYXBXcmFwcGVyLmNsb25lKHRoaXMuX3ZpZXdPdmVycmlkZXMpO1xuICAgIGNsb25lLl9kaXJlY3RpdmVPdmVycmlkZXMgPSBNYXBXcmFwcGVyLmNsb25lKHRoaXMuX2RpcmVjdGl2ZU92ZXJyaWRlcyk7XG4gICAgY2xvbmUuX3RlbXBsYXRlT3ZlcnJpZGVzID0gTWFwV3JhcHBlci5jbG9uZSh0aGlzLl90ZW1wbGF0ZU92ZXJyaWRlcyk7XG4gICAgY2xvbmUuX2JpbmRpbmdzT3ZlcnJpZGVzID0gTWFwV3JhcHBlci5jbG9uZSh0aGlzLl9iaW5kaW5nc092ZXJyaWRlcyk7XG4gICAgY2xvbmUuX3ZpZXdCaW5kaW5nc092ZXJyaWRlcyA9IE1hcFdyYXBwZXIuY2xvbmUodGhpcy5fdmlld0JpbmRpbmdzT3ZlcnJpZGVzKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIG9ubHkgdGhlIGh0bWwgb2YgYSB7QGxpbmsgQ29tcG9uZW50TWV0YWRhdGF9LlxuICAgKiBBbGwgdGhlIG90aGVyIHByb3BlcnRpZXMgb2YgdGhlIGNvbXBvbmVudCdzIHtAbGluayBWaWV3TWV0YWRhdGF9IGFyZSBwcmVzZXJ2ZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7VHlwZX0gY29tcG9uZW50XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBodG1sXG4gICAqXG4gICAqIEByZXR1cm4ge1Rlc3RDb21wb25lbnRCdWlsZGVyfVxuICAgKi9cbiAgb3ZlcnJpZGVUZW1wbGF0ZShjb21wb25lbnRUeXBlOiBUeXBlLCB0ZW1wbGF0ZTogc3RyaW5nKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIGxldCBjbG9uZSA9IHRoaXMuX2Nsb25lKCk7XG4gICAgY2xvbmUuX3RlbXBsYXRlT3ZlcnJpZGVzLnNldChjb21wb25lbnRUeXBlLCB0ZW1wbGF0ZSk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyBhIGNvbXBvbmVudCdzIHtAbGluayBWaWV3TWV0YWRhdGF9LlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge3ZpZXd9IFZpZXdcbiAgICpcbiAgICogQHJldHVybiB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9XG4gICAqL1xuICBvdmVycmlkZVZpZXcoY29tcG9uZW50VHlwZTogVHlwZSwgdmlldzogVmlld01ldGFkYXRhKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIGxldCBjbG9uZSA9IHRoaXMuX2Nsb25lKCk7XG4gICAgY2xvbmUuX3ZpZXdPdmVycmlkZXMuc2V0KGNvbXBvbmVudFR5cGUsIHZpZXcpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgdGhlIGRpcmVjdGl2ZXMgZnJvbSB0aGUgY29tcG9uZW50IHtAbGluayBWaWV3TWV0YWRhdGF9LlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge1R5cGV9IGZyb21cbiAgICogQHBhcmFtIHtUeXBlfSB0b1xuICAgKlxuICAgKiBAcmV0dXJuIHtUZXN0Q29tcG9uZW50QnVpbGRlcn1cbiAgICovXG4gIG92ZXJyaWRlRGlyZWN0aXZlKGNvbXBvbmVudFR5cGU6IFR5cGUsIGZyb206IFR5cGUsIHRvOiBUeXBlKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIGxldCBjbG9uZSA9IHRoaXMuX2Nsb25lKCk7XG4gICAgbGV0IG92ZXJyaWRlc0ZvckNvbXBvbmVudCA9IGNsb25lLl9kaXJlY3RpdmVPdmVycmlkZXMuZ2V0KGNvbXBvbmVudFR5cGUpO1xuICAgIGlmICghaXNQcmVzZW50KG92ZXJyaWRlc0ZvckNvbXBvbmVudCkpIHtcbiAgICAgIGNsb25lLl9kaXJlY3RpdmVPdmVycmlkZXMuc2V0KGNvbXBvbmVudFR5cGUsIG5ldyBNYXA8VHlwZSwgVHlwZT4oKSk7XG4gICAgICBvdmVycmlkZXNGb3JDb21wb25lbnQgPSBjbG9uZS5fZGlyZWN0aXZlT3ZlcnJpZGVzLmdldChjb21wb25lbnRUeXBlKTtcbiAgICB9XG4gICAgb3ZlcnJpZGVzRm9yQ29tcG9uZW50LnNldChmcm9tLCB0byk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyBvbmUgb3IgbW9yZSBpbmplY3RhYmxlcyBjb25maWd1cmVkIHZpYSBgcHJvdmlkZXJzYCBtZXRhZGF0YSBwcm9wZXJ0eSBvZiBhIGRpcmVjdGl2ZVxuICAgKiBvclxuICAgKiBjb21wb25lbnQuXG4gICAqIFZlcnkgdXNlZnVsIHdoZW4gY2VydGFpbiBwcm92aWRlcnMgbmVlZCB0byBiZSBtb2NrZWQgb3V0LlxuICAgKlxuICAgKiBUaGUgcHJvdmlkZXJzIHNwZWNpZmllZCB2aWEgdGhpcyBtZXRob2QgYXJlIGFwcGVuZGVkIHRvIHRoZSBleGlzdGluZyBgcHJvdmlkZXJzYCBjYXVzaW5nIHRoZVxuICAgKiBkdXBsaWNhdGVkIHByb3ZpZGVycyB0b1xuICAgKiBiZSBvdmVycmlkZGVuLlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge2FueVtdfSBwcm92aWRlcnNcbiAgICpcbiAgICogQHJldHVybiB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9XG4gICAqL1xuICBvdmVycmlkZVByb3ZpZGVycyh0eXBlOiBUeXBlLCBwcm92aWRlcnM6IGFueVtdKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIGxldCBjbG9uZSA9IHRoaXMuX2Nsb25lKCk7XG4gICAgY2xvbmUuX2JpbmRpbmdzT3ZlcnJpZGVzLnNldCh0eXBlLCBwcm92aWRlcnMpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgb3ZlcnJpZGVCaW5kaW5ncyh0eXBlOiBUeXBlLCBwcm92aWRlcnM6IGFueVtdKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHJldHVybiB0aGlzLm92ZXJyaWRlUHJvdmlkZXJzKHR5cGUsIHByb3ZpZGVycyk7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIG9uZSBvciBtb3JlIGluamVjdGFibGVzIGNvbmZpZ3VyZWQgdmlhIGBwcm92aWRlcnNgIG1ldGFkYXRhIHByb3BlcnR5IG9mIGEgZGlyZWN0aXZlXG4gICAqIG9yXG4gICAqIGNvbXBvbmVudC5cbiAgICogVmVyeSB1c2VmdWwgd2hlbiBjZXJ0YWluIHByb3ZpZGVycyBuZWVkIHRvIGJlIG1vY2tlZCBvdXQuXG4gICAqXG4gICAqIFRoZSBwcm92aWRlcnMgc3BlY2lmaWVkIHZpYSB0aGlzIG1ldGhvZCBhcmUgYXBwZW5kZWQgdG8gdGhlIGV4aXN0aW5nIGBwcm92aWRlcnNgIGNhdXNpbmcgdGhlXG4gICAqIGR1cGxpY2F0ZWQgcHJvdmlkZXJzIHRvXG4gICAqIGJlIG92ZXJyaWRkZW4uXG4gICAqXG4gICAqIEBwYXJhbSB7VHlwZX0gY29tcG9uZW50XG4gICAqIEBwYXJhbSB7YW55W119IHByb3ZpZGVyc1xuICAgKlxuICAgKiBAcmV0dXJuIHtUZXN0Q29tcG9uZW50QnVpbGRlcn1cbiAgICovXG4gIG92ZXJyaWRlVmlld1Byb3ZpZGVycyh0eXBlOiBUeXBlLCBwcm92aWRlcnM6IGFueVtdKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIGxldCBjbG9uZSA9IHRoaXMuX2Nsb25lKCk7XG4gICAgY2xvbmUuX3ZpZXdCaW5kaW5nc092ZXJyaWRlcy5zZXQodHlwZSwgcHJvdmlkZXJzKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIG92ZXJyaWRlVmlld0JpbmRpbmdzKHR5cGU6IFR5cGUsIHByb3ZpZGVyczogYW55W10pOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgcmV0dXJuIHRoaXMub3ZlcnJpZGVWaWV3UHJvdmlkZXJzKHR5cGUsIHByb3ZpZGVycyk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGFuZCByZXR1cm5zIGEgQ29tcG9uZW50Rml4dHVyZS5cbiAgICpcbiAgICogQHJldHVybiB7UHJvbWlzZTxDb21wb25lbnRGaXh0dXJlPn1cbiAgICovXG4gIGNyZWF0ZUFzeW5jKHJvb3RDb21wb25lbnRUeXBlOiBUeXBlKTogUHJvbWlzZTxDb21wb25lbnRGaXh0dXJlPiB7XG4gICAgbGV0IG5vTmdab25lID0gSVNfREFSVCB8fCB0aGlzLl9pbmplY3Rvci5nZXQoQ29tcG9uZW50Rml4dHVyZU5vTmdab25lLCBmYWxzZSk7XG4gICAgbGV0IG5nWm9uZTogTmdab25lID0gbm9OZ1pvbmUgPyBudWxsIDogdGhpcy5faW5qZWN0b3IuZ2V0KE5nWm9uZSwgbnVsbCk7XG4gICAgbGV0IGF1dG9EZXRlY3Q6IGJvb2xlYW4gPSB0aGlzLl9pbmplY3Rvci5nZXQoQ29tcG9uZW50Rml4dHVyZUF1dG9EZXRlY3QsIGZhbHNlKTtcblxuICAgIGxldCBpbml0Q29tcG9uZW50ID0gKCkgPT4ge1xuICAgICAgbGV0IG1vY2tEaXJlY3RpdmVSZXNvbHZlciA9IHRoaXMuX2luamVjdG9yLmdldChEaXJlY3RpdmVSZXNvbHZlcik7XG4gICAgICBsZXQgbW9ja1ZpZXdSZXNvbHZlciA9IHRoaXMuX2luamVjdG9yLmdldChWaWV3UmVzb2x2ZXIpO1xuICAgICAgdGhpcy5fdmlld092ZXJyaWRlcy5mb3JFYWNoKCh2aWV3LCB0eXBlKSA9PiBtb2NrVmlld1Jlc29sdmVyLnNldFZpZXcodHlwZSwgdmlldykpO1xuICAgICAgdGhpcy5fdGVtcGxhdGVPdmVycmlkZXMuZm9yRWFjaCgodGVtcGxhdGUsIHR5cGUpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2NrVmlld1Jlc29sdmVyLnNldElubGluZVRlbXBsYXRlKHR5cGUsIHRlbXBsYXRlKSk7XG4gICAgICB0aGlzLl9kaXJlY3RpdmVPdmVycmlkZXMuZm9yRWFjaCgob3ZlcnJpZGVzLCBjb21wb25lbnQpID0+IHtcbiAgICAgICAgb3ZlcnJpZGVzLmZvckVhY2goXG4gICAgICAgICAgICAodG8sIGZyb20pID0+IHsgbW9ja1ZpZXdSZXNvbHZlci5vdmVycmlkZVZpZXdEaXJlY3RpdmUoY29tcG9uZW50LCBmcm9tLCB0byk7IH0pO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9iaW5kaW5nc092ZXJyaWRlcy5mb3JFYWNoKFxuICAgICAgICAgIChiaW5kaW5ncywgdHlwZSkgPT4gbW9ja0RpcmVjdGl2ZVJlc29sdmVyLnNldEJpbmRpbmdzT3ZlcnJpZGUodHlwZSwgYmluZGluZ3MpKTtcbiAgICAgIHRoaXMuX3ZpZXdCaW5kaW5nc092ZXJyaWRlcy5mb3JFYWNoKFxuICAgICAgICAgIChiaW5kaW5ncywgdHlwZSkgPT4gbW9ja0RpcmVjdGl2ZVJlc29sdmVyLnNldFZpZXdCaW5kaW5nc092ZXJyaWRlKHR5cGUsIGJpbmRpbmdzKSk7XG5cbiAgICAgIGxldCByb290RWxJZCA9IGByb290JHtfbmV4dFJvb3RFbGVtZW50SWQrK31gO1xuICAgICAgbGV0IHJvb3RFbCA9IGVsKGA8ZGl2IGlkPVwiJHtyb290RWxJZH1cIj48L2Rpdj5gKTtcbiAgICAgIGxldCBkb2MgPSB0aGlzLl9pbmplY3Rvci5nZXQoRE9DVU1FTlQpO1xuXG4gICAgICAvLyBUT0RPKGp1bGllbXIpOiBjYW4vc2hvdWxkIHRoaXMgYmUgb3B0aW9uYWw/XG4gICAgICBsZXQgb2xkUm9vdHMgPSBET00ucXVlcnlTZWxlY3RvckFsbChkb2MsICdbaWRePXJvb3RdJyk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9sZFJvb3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIERPTS5yZW1vdmUob2xkUm9vdHNbaV0pO1xuICAgICAgfVxuICAgICAgRE9NLmFwcGVuZENoaWxkKGRvYy5ib2R5LCByb290RWwpO1xuXG4gICAgICBsZXQgcHJvbWlzZTogUHJvbWlzZTxDb21wb25lbnRSZWY+ID1cbiAgICAgICAgICB0aGlzLl9pbmplY3Rvci5nZXQoRHluYW1pY0NvbXBvbmVudExvYWRlcilcbiAgICAgICAgICAgICAgLmxvYWRBc1Jvb3Qocm9vdENvbXBvbmVudFR5cGUsIGAjJHtyb290RWxJZH1gLCB0aGlzLl9pbmplY3Rvcik7XG4gICAgICByZXR1cm4gcHJvbWlzZS50aGVuKFxuICAgICAgICAgIChjb21wb25lbnRSZWYpID0+IHsgcmV0dXJuIG5ldyBDb21wb25lbnRGaXh0dXJlKGNvbXBvbmVudFJlZiwgbmdab25lLCBhdXRvRGV0ZWN0KTsgfSk7XG4gICAgfTtcblxuICAgIHJldHVybiBuZ1pvbmUgPT0gbnVsbCA/IGluaXRDb21wb25lbnQoKSA6IG5nWm9uZS5ydW4oaW5pdENvbXBvbmVudCk7XG4gIH1cblxuICBjcmVhdGVGYWtlQXN5bmMocm9vdENvbXBvbmVudFR5cGU6IFR5cGUpOiBDb21wb25lbnRGaXh0dXJlIHtcbiAgICBsZXQgcmVzdWx0O1xuICAgIGxldCBlcnJvcjtcbiAgICBQcm9taXNlV3JhcHBlci50aGVuKHRoaXMuY3JlYXRlQXN5bmMocm9vdENvbXBvbmVudFR5cGUpLCAoX3Jlc3VsdCkgPT4geyByZXN1bHQgPSBfcmVzdWx0OyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgKF9lcnJvcikgPT4geyBlcnJvciA9IF9lcnJvcjsgfSk7XG4gICAgdGljaygpO1xuICAgIGlmIChpc1ByZXNlbnQoZXJyb3IpKSB7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufVxuIl19