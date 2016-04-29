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
import { Directive, Host, ViewContainerRef, TemplateRef } from 'angular2/core';
import { isPresent, isBlank, normalizeBlank, CONST_EXPR } from 'angular2/src/facade/lang';
import { ListWrapper, Map } from 'angular2/src/facade/collection';
const _WHEN_DEFAULT = CONST_EXPR(new Object());
export class SwitchView {
    constructor(_viewContainerRef, _templateRef) {
        this._viewContainerRef = _viewContainerRef;
        this._templateRef = _templateRef;
    }
    create() { this._viewContainerRef.createEmbeddedView(this._templateRef); }
    destroy() { this._viewContainerRef.clear(); }
}
/**
 * Adds or removes DOM sub-trees when their match expressions match the switch expression.
 *
 * Elements within `NgSwitch` but without `NgSwitchWhen` or `NgSwitchDefault` directives will be
 * preserved at the location as specified in the template.
 *
 * `NgSwitch` simply inserts nested elements based on which match expression matches the value
 * obtained from the evaluated switch expression. In other words, you define a container element
 * (where you place the directive with a switch expression on the
 * `[ngSwitch]="..."` attribute), define any inner elements inside of the directive and
 * place a `[ngSwitchWhen]` attribute per element.
 *
 * The `ngSwitchWhen` property is used to inform `NgSwitch` which element to display when the
 * expression is evaluated. If a matching expression is not found via a `ngSwitchWhen` property
 * then an element with the `ngSwitchDefault` attribute is displayed.
 *
 * ### Example ([live demo](http://plnkr.co/edit/DQMTII95CbuqWrl3lYAs?p=preview))
 *
 * ```typescript
 * @Component({
 *   selector: 'app',
 *   template: `
 *     <p>Value = {{value}}</p>
 *     <button (click)="inc()">Increment</button>
 *
 *     <div [ngSwitch]="value">
 *       <p *ngSwitchWhen="'init'">increment to start</p>
 *       <p *ngSwitchWhen="0">0, increment again</p>
 *       <p *ngSwitchWhen="1">1, increment again</p>
 *       <p *ngSwitchWhen="2">2, stop incrementing</p>
 *       <p *ngSwitchDefault>&gt; 2, STOP!</p>
 *     </div>
 *
 *     <!-- alternate syntax -->
 *
 *     <p [ngSwitch]="value">
 *       <template ngSwitchWhen="init">increment to start</template>
 *       <template [ngSwitchWhen]="0">0, increment again</template>
 *       <template [ngSwitchWhen]="1">1, increment again</template>
 *       <template [ngSwitchWhen]="2">2, stop incrementing</template>
 *       <template ngSwitchDefault>&gt; 2, STOP!</template>
 *     </p>
 *   `,
 *   directives: [NgSwitch, NgSwitchWhen, NgSwitchDefault]
 * })
 * export class App {
 *   value = 'init';
 *
 *   inc() {
 *     this.value = this.value === 'init' ? 0 : this.value + 1;
 *   }
 * }
 *
 * bootstrap(App).catch(err => console.error(err));
 * ```
 */
export let NgSwitch = class NgSwitch {
    constructor() {
        this._useDefault = false;
        this._valueViews = new Map();
        this._activeViews = [];
    }
    set ngSwitch(value) {
        // Empty the currently active ViewContainers
        this._emptyAllActiveViews();
        // Add the ViewContainers matching the value (with a fallback to default)
        this._useDefault = false;
        var views = this._valueViews.get(value);
        if (isBlank(views)) {
            this._useDefault = true;
            views = normalizeBlank(this._valueViews.get(_WHEN_DEFAULT));
        }
        this._activateViews(views);
        this._switchValue = value;
    }
    /** @internal */
    _onWhenValueChanged(oldWhen, newWhen, view) {
        this._deregisterView(oldWhen, view);
        this._registerView(newWhen, view);
        if (oldWhen === this._switchValue) {
            view.destroy();
            ListWrapper.remove(this._activeViews, view);
        }
        else if (newWhen === this._switchValue) {
            if (this._useDefault) {
                this._useDefault = false;
                this._emptyAllActiveViews();
            }
            view.create();
            this._activeViews.push(view);
        }
        // Switch to default when there is no more active ViewContainers
        if (this._activeViews.length === 0 && !this._useDefault) {
            this._useDefault = true;
            this._activateViews(this._valueViews.get(_WHEN_DEFAULT));
        }
    }
    /** @internal */
    _emptyAllActiveViews() {
        var activeContainers = this._activeViews;
        for (var i = 0; i < activeContainers.length; i++) {
            activeContainers[i].destroy();
        }
        this._activeViews = [];
    }
    /** @internal */
    _activateViews(views) {
        // TODO(vicb): assert(this._activeViews.length === 0);
        if (isPresent(views)) {
            for (var i = 0; i < views.length; i++) {
                views[i].create();
            }
            this._activeViews = views;
        }
    }
    /** @internal */
    _registerView(value, view) {
        var views = this._valueViews.get(value);
        if (isBlank(views)) {
            views = [];
            this._valueViews.set(value, views);
        }
        views.push(view);
    }
    /** @internal */
    _deregisterView(value, view) {
        // `_WHEN_DEFAULT` is used a marker for non-registered whens
        if (value === _WHEN_DEFAULT)
            return;
        var views = this._valueViews.get(value);
        if (views.length == 1) {
            this._valueViews.delete(value);
        }
        else {
            ListWrapper.remove(views, view);
        }
    }
};
NgSwitch = __decorate([
    Directive({ selector: '[ngSwitch]', inputs: ['ngSwitch'] }), 
    __metadata('design:paramtypes', [])
], NgSwitch);
/**
 * Insert the sub-tree when the `ngSwitchWhen` expression evaluates to the same value as the
 * enclosing switch expression.
 *
 * If multiple match expression match the switch expression value, all of them are displayed.
 *
 * See {@link NgSwitch} for more details and example.
 */
export let NgSwitchWhen = class NgSwitchWhen {
    constructor(viewContainer, templateRef, ngSwitch) {
        // `_WHEN_DEFAULT` is used as a marker for a not yet initialized value
        /** @internal */
        this._value = _WHEN_DEFAULT;
        this._switch = ngSwitch;
        this._view = new SwitchView(viewContainer, templateRef);
    }
    set ngSwitchWhen(value) {
        this._switch._onWhenValueChanged(this._value, value, this._view);
        this._value = value;
    }
};
NgSwitchWhen = __decorate([
    Directive({ selector: '[ngSwitchWhen]', inputs: ['ngSwitchWhen'] }),
    __param(2, Host()), 
    __metadata('design:paramtypes', [ViewContainerRef, TemplateRef, NgSwitch])
], NgSwitchWhen);
/**
 * Default case statements are displayed when no match expression matches the switch expression
 * value.
 *
 * See {@link NgSwitch} for more details and example.
 */
export let NgSwitchDefault = class NgSwitchDefault {
    constructor(viewContainer, templateRef, sswitch) {
        sswitch._registerView(_WHEN_DEFAULT, new SwitchView(viewContainer, templateRef));
    }
};
NgSwitchDefault = __decorate([
    Directive({ selector: '[ngSwitchDefault]' }),
    __param(2, Host()), 
    __metadata('design:paramtypes', [ViewContainerRef, TemplateRef, NgSwitch])
], NgSwitchDefault);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3dpdGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC01OUNoZmhtRC50bXAvYW5ndWxhcjIvc3JjL2NvbW1vbi9kaXJlY3RpdmVzL25nX3N3aXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsV0FBVyxFQUFDLE1BQU0sZUFBZTtPQUNyRSxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtPQUNoRixFQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUMsTUFBTSxnQ0FBZ0M7QUFFL0QsTUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztBQUUvQztJQUNFLFlBQW9CLGlCQUFtQyxFQUNuQyxZQUFpQztRQURqQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWtCO1FBQ25DLGlCQUFZLEdBQVosWUFBWSxDQUFxQjtJQUFHLENBQUM7SUFFekQsTUFBTSxLQUFXLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRWhGLE9BQU8sS0FBVyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3JELENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVERztBQUVIO0lBQUE7UUFFVSxnQkFBVyxHQUFZLEtBQUssQ0FBQztRQUM3QixnQkFBVyxHQUFHLElBQUksR0FBRyxFQUFxQixDQUFDO1FBQzNDLGlCQUFZLEdBQWlCLEVBQUUsQ0FBQztJQW1GMUMsQ0FBQztJQWpGQyxJQUFJLFFBQVEsQ0FBQyxLQUFVO1FBQ3JCLDRDQUE0QztR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LFdBQWdDLEVBQ3pELFFBQWtCO1FBUnRDLHNFQUFzRTtRQUN0RSxnQkFBZ0I7UUFDaEIsV0FBTSxHQUFRLGFBQWEsQ0FBQztRQU8xQixJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQztRQUN4QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksVUFBVSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRUQsSUFBSSxZQUFZLENBQUMsS0FBVTtRQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUN0QixDQUFDO0FBQ0gsQ0FBQztBQW5CRDtJQUFDLFNBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLEVBQUUsQ0FBQyxjQUFjLENBQUMsRUFBQyxDQUFDO2VBVW5ELElBQUksRUFBRTs7Z0JBVjZDO0FBcUJsRTs7Ozs7R0FLRztBQUVIO0lBQ0UsWUFBWSxhQUErQixFQUFFLFdBQWdDLEVBQ3pELE9BQWlCO1FBQ25DLE9BQU8sQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLElBQUksVUFBVSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQ25GLENBQUM7QUFDSCxDQUFDO0FBTkQ7SUFBQyxTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsbUJBQW1CLEVBQUMsQ0FBQztlQUc1QixJQUFJLEVBQUU7O21CQUhzQjtBQU0xQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0aXZlLCBIb3N0LCBWaWV3Q29udGFpbmVyUmVmLCBUZW1wbGF0ZVJlZn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgbm9ybWFsaXplQmxhbmssIENPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBNYXB9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmNvbnN0IF9XSEVOX0RFRkFVTFQgPSBDT05TVF9FWFBSKG5ldyBPYmplY3QoKSk7XG5cbmV4cG9ydCBjbGFzcyBTd2l0Y2hWaWV3IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPE9iamVjdD4pIHt9XG5cbiAgY3JlYXRlKCk6IHZvaWQgeyB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLl90ZW1wbGF0ZVJlZik7IH1cblxuICBkZXN0cm95KCk6IHZvaWQgeyB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmNsZWFyKCk7IH1cbn1cblxuLyoqXG4gKiBBZGRzIG9yIHJlbW92ZXMgRE9NIHN1Yi10cmVlcyB3aGVuIHRoZWlyIG1hdGNoIGV4cHJlc3Npb25zIG1hdGNoIHRoZSBzd2l0Y2ggZXhwcmVzc2lvbi5cbiAqXG4gKiBFbGVtZW50cyB3aXRoaW4gYE5nU3dpdGNoYCBidXQgd2l0aG91dCBgTmdTd2l0Y2hXaGVuYCBvciBgTmdTd2l0Y2hEZWZhdWx0YCBkaXJlY3RpdmVzIHdpbGwgYmVcbiAqIHByZXNlcnZlZCBhdCB0aGUgbG9jYXRpb24gYXMgc3BlY2lmaWVkIGluIHRoZSB0ZW1wbGF0ZS5cbiAqXG4gKiBgTmdTd2l0Y2hgIHNpbXBseSBpbnNlcnRzIG5lc3RlZCBlbGVtZW50cyBiYXNlZCBvbiB3aGljaCBtYXRjaCBleHByZXNzaW9uIG1hdGNoZXMgdGhlIHZhbHVlXG4gKiBvYnRhaW5lZCBmcm9tIHRoZSBldmFsdWF0ZWQgc3dpdGNoIGV4cHJlc3Npb24uIEluIG90aGVyIHdvcmRzLCB5b3UgZGVmaW5lIGEgY29udGFpbmVyIGVsZW1lbnRcbiAqICh3aGVyZSB5b3UgcGxhY2UgdGhlIGRpcmVjdGl2ZSB3aXRoIGEgc3dpdGNoIGV4cHJlc3Npb24gb24gdGhlXG4gKiBgW25nU3dpdGNoXT1cIi4uLlwiYCBhdHRyaWJ1dGUpLCBkZWZpbmUgYW55IGlubmVyIGVsZW1lbnRzIGluc2lkZSBvZiB0aGUgZGlyZWN0aXZlIGFuZFxuICogcGxhY2UgYSBgW25nU3dpdGNoV2hlbl1gIGF0dHJpYnV0ZSBwZXIgZWxlbWVudC5cbiAqXG4gKiBUaGUgYG5nU3dpdGNoV2hlbmAgcHJvcGVydHkgaXMgdXNlZCB0byBpbmZvcm0gYE5nU3dpdGNoYCB3aGljaCBlbGVtZW50IHRvIGRpc3BsYXkgd2hlbiB0aGVcbiAqIGV4cHJlc3Npb24gaXMgZXZhbHVhdGVkLiBJZiBhIG1hdGNoaW5nIGV4cHJlc3Npb24gaXMgbm90IGZvdW5kIHZpYSBhIGBuZ1N3aXRjaFdoZW5gIHByb3BlcnR5XG4gKiB0aGVuIGFuIGVsZW1lbnQgd2l0aCB0aGUgYG5nU3dpdGNoRGVmYXVsdGAgYXR0cmlidXRlIGlzIGRpc3BsYXllZC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvRFFNVElJOTVDYnVxV3JsM2xZQXM/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxwPlZhbHVlID0ge3t2YWx1ZX19PC9wPlxuICogICAgIDxidXR0b24gKGNsaWNrKT1cImluYygpXCI+SW5jcmVtZW50PC9idXR0b24+XG4gKlxuICogICAgIDxkaXYgW25nU3dpdGNoXT1cInZhbHVlXCI+XG4gKiAgICAgICA8cCAqbmdTd2l0Y2hXaGVuPVwiJ2luaXQnXCI+aW5jcmVtZW50IHRvIHN0YXJ0PC9wPlxuICogICAgICAgPHAgKm5nU3dpdGNoV2hlbj1cIjBcIj4wLCBpbmNyZW1lbnQgYWdhaW48L3A+XG4gKiAgICAgICA8cCAqbmdTd2l0Y2hXaGVuPVwiMVwiPjEsIGluY3JlbWVudCBhZ2FpbjwvcD5cbiAqICAgICAgIDxwICpuZ1N3aXRjaFdoZW49XCIyXCI+Miwgc3RvcCBpbmNyZW1lbnRpbmc8L3A+XG4gKiAgICAgICA8cCAqbmdTd2l0Y2hEZWZhdWx0PiZndDsgMiwgU1RPUCE8L3A+XG4gKiAgICAgPC9kaXY+XG4gKlxuICogICAgIDwhLS0gYWx0ZXJuYXRlIHN5bnRheCAtLT5cbiAqXG4gKiAgICAgPHAgW25nU3dpdGNoXT1cInZhbHVlXCI+XG4gKiAgICAgICA8dGVtcGxhdGUgbmdTd2l0Y2hXaGVuPVwiaW5pdFwiPmluY3JlbWVudCB0byBzdGFydDwvdGVtcGxhdGU+XG4gKiAgICAgICA8dGVtcGxhdGUgW25nU3dpdGNoV2hlbl09XCIwXCI+MCwgaW5jcmVtZW50IGFnYWluPC90ZW1wbGF0ZT5cbiAqICAgICAgIDx0ZW1wbGF0ZSBbbmdTd2l0Y2hXaGVuXT1cIjFcIj4xLCBpbmNyZW1lbnQgYWdhaW48L3RlbXBsYXRlPlxuICogICAgICAgPHRlbXBsYXRlIFtuZ1N3aXRjaFdoZW5dPVwiMlwiPjIsIHN0b3AgaW5jcmVtZW50aW5nPC90ZW1wbGF0ZT5cbiAqICAgICAgIDx0ZW1wbGF0ZSBuZ1N3aXRjaERlZmF1bHQ+Jmd0OyAyLCBTVE9QITwvdGVtcGxhdGU+XG4gKiAgICAgPC9wPlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbTmdTd2l0Y2gsIE5nU3dpdGNoV2hlbiwgTmdTd2l0Y2hEZWZhdWx0XVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBBcHAge1xuICogICB2YWx1ZSA9ICdpbml0JztcbiAqXG4gKiAgIGluYygpIHtcbiAqICAgICB0aGlzLnZhbHVlID0gdGhpcy52YWx1ZSA9PT0gJ2luaXQnID8gMCA6IHRoaXMudmFsdWUgKyAxO1xuICogICB9XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcCkuY2F0Y2goZXJyID0+IGNvbnNvbGUuZXJyb3IoZXJyKSk7XG4gKiBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdTd2l0Y2hdJywgaW5wdXRzOiBbJ25nU3dpdGNoJ119KVxuZXhwb3J0IGNsYXNzIE5nU3dpdGNoIHtcbiAgcHJpdmF0ZSBfc3dpdGNoVmFsdWU6IGFueTtcbiAgcHJpdmF0ZSBfdXNlRGVmYXVsdDogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF92YWx1ZVZpZXdzID0gbmV3IE1hcDxhbnksIFN3aXRjaFZpZXdbXT4oKTtcbiAgcHJpdmF0ZSBfYWN0aXZlVmlld3M6IFN3aXRjaFZpZXdbXSA9IFtdO1xuXG4gIHNldCBuZ1N3aXRjaCh2YWx1ZTogYW55KSB7XG4gICAgLy8gRW1wdHkgdGhlIGN1cnJlbnRseSBhY3RpdmUgVmlld0NvbnRhaW5lcnNcbiAgICB0aGlzLl9lbXB0eUFsbEFjdGl2ZVZpZXdzKCk7XG5cbiAgICAvLyBBZGQgdGhlIFZpZXdDb250YWluZXJzIG1hdGNoaW5nIHRoZSB2YWx1ZSAod2l0aCBhIGZhbGxiYWNrIHRvIGRlZmF1bHQpXG4gICAgdGhpcy5fdXNlRGVmYXVsdCA9IGZhbHNlO1xuICAgIHZhciB2aWV3cyA9IHRoaXMuX3ZhbHVlVmlld3MuZ2V0KHZhbHVlKTtcbiAgICBpZiAoaXNCbGFuayh2aWV3cykpIHtcbiAgICAgIHRoaXMuX3VzZURlZmF1bHQgPSB0cnVlO1xuICAgICAgdmlld3MgPSBub3JtYWxpemVCbGFuayh0aGlzLl92YWx1ZVZpZXdzLmdldChfV0hFTl9ERUZBVUxUKSk7XG4gICAgfVxuICAgIHRoaXMuX2FjdGl2YXRlVmlld3Modmlld3MpO1xuXG4gICAgdGhpcy5fc3dpdGNoVmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX29uV2hlblZhbHVlQ2hhbmdlZChvbGRXaGVuOiBhbnksIG5ld1doZW46IGFueSwgdmlldzogU3dpdGNoVmlldyk6IHZvaWQge1xuICAgIHRoaXMuX2RlcmVnaXN0ZXJWaWV3KG9sZFdoZW4sIHZpZXcpO1xuICAgIHRoaXMuX3JlZ2lzdGVyVmlldyhuZXdXaGVuLCB2aWV3KTtcblxuICAgIGlmIChvbGRXaGVuID09PSB0aGlzLl9zd2l0Y2hWYWx1ZSkge1xuICAgICAgdmlldy5kZXN0cm95KCk7XG4gICAgICBMaXN0V3JhcHBlci5yZW1vdmUodGhpcy5fYWN0aXZlVmlld3MsIHZpZXcpO1xuICAgIH0gZWxzZSBpZiAobmV3V2hlbiA9PT0gdGhpcy5fc3dpdGNoVmFsdWUpIHtcbiAgICAgIGlmICh0aGlzLl91c2VEZWZhdWx0KSB7XG4gICAgICAgIHRoaXMuX3VzZURlZmF1bHQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fZW1wdHlBbGxBY3RpdmVWaWV3cygpO1xuICAgICAgfVxuICAgICAgdmlldy5jcmVhdGUoKTtcbiAgICAgIHRoaXMuX2FjdGl2ZVZpZXdzLnB1c2godmlldyk7XG4gICAgfVxuXG4gICAgLy8gU3dpdGNoIHRvIGRlZmF1bHQgd2hlbiB0aGVyZSBpcyBubyBtb3JlIGFjdGl2ZSBWaWV3Q29udGFpbmVyc1xuICAgIGlmICh0aGlzLl9hY3RpdmVWaWV3cy5sZW5ndGggPT09IDAgJiYgIXRoaXMuX3VzZURlZmF1bHQpIHtcbiAgICAgIHRoaXMuX3VzZURlZmF1bHQgPSB0cnVlO1xuICAgICAgdGhpcy5fYWN0aXZhdGVWaWV3cyh0aGlzLl92YWx1ZVZpZXdzLmdldChfV0hFTl9ERUZBVUxUKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZW1wdHlBbGxBY3RpdmVWaWV3cygpOiB2b2lkIHtcbiAgICB2YXIgYWN0aXZlQ29udGFpbmVycyA9IHRoaXMuX2FjdGl2ZVZpZXdzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWN0aXZlQ29udGFpbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgYWN0aXZlQ29udGFpbmVyc1tpXS5kZXN0cm95KCk7XG4gICAgfVxuICAgIHRoaXMuX2FjdGl2ZVZpZXdzID0gW107XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hY3RpdmF0ZVZpZXdzKHZpZXdzOiBTd2l0Y2hWaWV3W10pOiB2b2lkIHtcbiAgICAvLyBUT0RPKHZpY2IpOiBhc3NlcnQodGhpcy5fYWN0aXZlVmlld3MubGVuZ3RoID09PSAwKTtcbiAgICBpZiAoaXNQcmVzZW50KHZpZXdzKSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2aWV3cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2aWV3c1tpXS5jcmVhdGUoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2FjdGl2ZVZpZXdzID0gdmlld3M7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVnaXN0ZXJWaWV3KHZhbHVlOiBhbnksIHZpZXc6IFN3aXRjaFZpZXcpOiB2b2lkIHtcbiAgICB2YXIgdmlld3MgPSB0aGlzLl92YWx1ZVZpZXdzLmdldCh2YWx1ZSk7XG4gICAgaWYgKGlzQmxhbmsodmlld3MpKSB7XG4gICAgICB2aWV3cyA9IFtdO1xuICAgICAgdGhpcy5fdmFsdWVWaWV3cy5zZXQodmFsdWUsIHZpZXdzKTtcbiAgICB9XG4gICAgdmlld3MucHVzaCh2aWV3KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2RlcmVnaXN0ZXJWaWV3KHZhbHVlOiBhbnksIHZpZXc6IFN3aXRjaFZpZXcpOiB2b2lkIHtcbiAgICAvLyBgX1dIRU5fREVGQVVMVGAgaXMgdXNlZCBhIG1hcmtlciBmb3Igbm9uLXJlZ2lzdGVyZWQgd2hlbnNcbiAgICBpZiAodmFsdWUgPT09IF9XSEVOX0RFRkFVTFQpIHJldHVybjtcbiAgICB2YXIgdmlld3MgPSB0aGlzLl92YWx1ZVZpZXdzLmdldCh2YWx1ZSk7XG4gICAgaWYgKHZpZXdzLmxlbmd0aCA9PSAxKSB7XG4gICAgICB0aGlzLl92YWx1ZVZpZXdzLmRlbGV0ZSh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIExpc3RXcmFwcGVyLnJlbW92ZSh2aWV3cywgdmlldyk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogSW5zZXJ0IHRoZSBzdWItdHJlZSB3aGVuIHRoZSBgbmdTd2l0Y2hXaGVuYCBleHByZXNzaW9uIGV2YWx1YXRlcyB0byB0aGUgc2FtZSB2YWx1ZSBhcyB0aGVcbiAqIGVuY2xvc2luZyBzd2l0Y2ggZXhwcmVzc2lvbi5cbiAqXG4gKiBJZiBtdWx0aXBsZSBtYXRjaCBleHByZXNzaW9uIG1hdGNoIHRoZSBzd2l0Y2ggZXhwcmVzc2lvbiB2YWx1ZSwgYWxsIG9mIHRoZW0gYXJlIGRpc3BsYXllZC5cbiAqXG4gKiBTZWUge0BsaW5rIE5nU3dpdGNofSBmb3IgbW9yZSBkZXRhaWxzIGFuZCBleGFtcGxlLlxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1N3aXRjaFdoZW5dJywgaW5wdXRzOiBbJ25nU3dpdGNoV2hlbiddfSlcbmV4cG9ydCBjbGFzcyBOZ1N3aXRjaFdoZW4ge1xuICAvLyBgX1dIRU5fREVGQVVMVGAgaXMgdXNlZCBhcyBhIG1hcmtlciBmb3IgYSBub3QgeWV0IGluaXRpYWxpemVkIHZhbHVlXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ZhbHVlOiBhbnkgPSBfV0hFTl9ERUZBVUxUO1xuICAvKiogQGludGVybmFsICovXG4gIF92aWV3OiBTd2l0Y2hWaWV3O1xuICBwcml2YXRlIF9zd2l0Y2g6IE5nU3dpdGNoO1xuXG4gIGNvbnN0cnVjdG9yKHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxPYmplY3Q+LFxuICAgICAgICAgICAgICBASG9zdCgpIG5nU3dpdGNoOiBOZ1N3aXRjaCkge1xuICAgIHRoaXMuX3N3aXRjaCA9IG5nU3dpdGNoO1xuICAgIHRoaXMuX3ZpZXcgPSBuZXcgU3dpdGNoVmlldyh2aWV3Q29udGFpbmVyLCB0ZW1wbGF0ZVJlZik7XG4gIH1cblxuICBzZXQgbmdTd2l0Y2hXaGVuKHZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLl9zd2l0Y2guX29uV2hlblZhbHVlQ2hhbmdlZCh0aGlzLl92YWx1ZSwgdmFsdWUsIHRoaXMuX3ZpZXcpO1xuICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IGNhc2Ugc3RhdGVtZW50cyBhcmUgZGlzcGxheWVkIHdoZW4gbm8gbWF0Y2ggZXhwcmVzc2lvbiBtYXRjaGVzIHRoZSBzd2l0Y2ggZXhwcmVzc2lvblxuICogdmFsdWUuXG4gKlxuICogU2VlIHtAbGluayBOZ1N3aXRjaH0gZm9yIG1vcmUgZGV0YWlscyBhbmQgZXhhbXBsZS5cbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdTd2l0Y2hEZWZhdWx0XSd9KVxuZXhwb3J0IGNsYXNzIE5nU3dpdGNoRGVmYXVsdCB7XG4gIGNvbnN0cnVjdG9yKHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxPYmplY3Q+LFxuICAgICAgICAgICAgICBASG9zdCgpIHNzd2l0Y2g6IE5nU3dpdGNoKSB7XG4gICAgc3N3aXRjaC5fcmVnaXN0ZXJWaWV3KF9XSEVOX0RFRkFVTFQsIG5ldyBTd2l0Y2hWaWV3KHZpZXdDb250YWluZXIsIHRlbXBsYXRlUmVmKSk7XG4gIH1cbn1cbiJdfQ==