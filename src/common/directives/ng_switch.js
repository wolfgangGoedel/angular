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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var _WHEN_DEFAULT = lang_1.CONST_EXPR(new Object());
var SwitchView = (function () {
    function SwitchView(_viewContainerRef, _templateRef) {
        this._viewContainerRef = _viewContainerRef;
        this._templateRef = _templateRef;
    }
    SwitchView.prototype.create = function () { this._viewContainerRef.createEmbeddedView(this._templateRef); };
    SwitchView.prototype.destroy = function () { this._viewContainerRef.clear(); };
    return SwitchView;
}());
exports.SwitchView = SwitchView;
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
var NgSwitch = (function () {
    function NgSwitch() {
        this._useDefault = false;
        this._valueViews = new collection_1.Map();
        this._activeViews = [];
    }
    Object.defineProperty(NgSwitch.prototype, "ngSwitch", {
        set: function (value) {
            // Empty the currently active ViewContainers
            this._emptyAllActiveViews();
            // Add the ViewContainers matching the value (with a fallback to default)
            this._useDefault = false;
            var views = this._valueViews.get(value);
            if (lang_1.isBlank(views)) {
                this._useDefault = true;
                views = lang_1.normalizeBlank(this._valueViews.get(_WHEN_DEFAULT));
            }
            this._activateViews(views);
            this._switchValue = value;
        },
        enumerable: true,
        configurable: true
    });
    /** @internal */
    NgSwitch.prototype._onWhenValueChanged = function (oldWhen, newWhen, view) {
        this._deregisterView(oldWhen, view);
        this._registerView(newWhen, view);
        if (oldWhen === this._switchValue) {
            view.destroy();
            collection_1.ListWrapper.remove(this._activeViews, view);
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
    };
    /** @internal */
    NgSwitch.prototype._emptyAllActiveViews = function () {
        var activeContainers = this._activeViews;
        for (var i = 0; i < activeContainers.length; i++) {
            activeContainers[i].destroy();
        }
        this._activeViews = [];
    };
    /** @internal */
    NgSwitch.prototype._activateViews = function (views) {
        // TODO(vicb): assert(this._activeViews.length === 0);
        if (lang_1.isPresent(views)) {
            for (var i = 0; i < views.length; i++) {
                views[i].create();
            }
            this._activeViews = views;
        }
    };
    /** @internal */
    NgSwitch.prototype._registerView = function (value, view) {
        var views = this._valueViews.get(value);
        if (lang_1.isBlank(views)) {
            views = [];
            this._valueViews.set(value, views);
        }
        views.push(view);
    };
    /** @internal */
    NgSwitch.prototype._deregisterView = function (value, view) {
        // `_WHEN_DEFAULT` is used a marker for non-registered whens
        if (value === _WHEN_DEFAULT)
            return;
        var views = this._valueViews.get(value);
        if (views.length == 1) {
            this._valueViews.delete(value);
        }
        else {
            collection_1.ListWrapper.remove(views, view);
        }
    };
    NgSwitch = __decorate([
        core_1.Directive({ selector: '[ngSwitch]', inputs: ['ngSwitch'] }), 
        __metadata('design:paramtypes', [])
    ], NgSwitch);
    return NgSwitch;
}());
exports.NgSwitch = NgSwitch;
/**
 * Insert the sub-tree when the `ngSwitchWhen` expression evaluates to the same value as the
 * enclosing switch expression.
 *
 * If multiple match expression match the switch expression value, all of them are displayed.
 *
 * See {@link NgSwitch} for more details and example.
 */
var NgSwitchWhen = (function () {
    function NgSwitchWhen(viewContainer, templateRef, ngSwitch) {
        // `_WHEN_DEFAULT` is used as a marker for a not yet initialized value
        /** @internal */
        this._value = _WHEN_DEFAULT;
        this._switch = ngSwitch;
        this._view = new SwitchView(viewContainer, templateRef);
    }
    Object.defineProperty(NgSwitchWhen.prototype, "ngSwitchWhen", {
        set: function (value) {
            this._switch._onWhenValueChanged(this._value, value, this._view);
            this._value = value;
        },
        enumerable: true,
        configurable: true
    });
    NgSwitchWhen = __decorate([
        core_1.Directive({ selector: '[ngSwitchWhen]', inputs: ['ngSwitchWhen'] }),
        __param(2, core_1.Host()), 
        __metadata('design:paramtypes', [core_1.ViewContainerRef, core_1.TemplateRef, NgSwitch])
    ], NgSwitchWhen);
    return NgSwitchWhen;
}());
exports.NgSwitchWhen = NgSwitchWhen;
/**
 * Default case statements are displayed when no match expression matches the switch expression
 * value.
 *
 * See {@link NgSwitch} for more details and example.
 */
var NgSwitchDefault = (function () {
    function NgSwitchDefault(viewContainer, templateRef, sswitch) {
        sswitch._registerView(_WHEN_DEFAULT, new SwitchView(viewContainer, templateRef));
    }
    NgSwitchDefault = __decorate([
        core_1.Directive({ selector: '[ngSwitchDefault]' }),
        __param(2, core_1.Host()), 
        __metadata('design:paramtypes', [core_1.ViewContainerRef, core_1.TemplateRef, NgSwitch])
    ], NgSwitchDefault);
    return NgSwitchDefault;
}());
exports.NgSwitchDefault = NgSwitchDefault;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3dpdGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC16dlp2SnZGRi50bXAvYW5ndWxhcjIvc3JjL2NvbW1vbi9kaXJlY3RpdmVzL25nX3N3aXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEscUJBQTZELGVBQWUsQ0FBQyxDQUFBO0FBQzdFLHFCQUE2RCwwQkFBMEIsQ0FBQyxDQUFBO0FBQ3hGLDJCQUErQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRWhFLElBQU0sYUFBYSxHQUFHLGlCQUFVLENBQUMsSUFBSSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBRS9DO0lBQ0Usb0JBQW9CLGlCQUFtQyxFQUNuQyxZQUFpQztRQURqQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWtCO1FBQ25DLGlCQUFZLEdBQVosWUFBWSxDQUFxQjtJQUFHLENBQUM7SUFFekQsMkJBQU0sR0FBTixjQUFpQixJQUFJLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVoRiw0QkFBTyxHQUFQLGNBQWtCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDckQsaUJBQUM7QUFBRCxDQUFDLEFBUEQsSUFPQztBQVBZLGtCQUFVLGFBT3RCLENBQUE7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVERztBQUVIO0lBQUE7UUFFVSxnQkFBVyxHQUFZLEtBQUssQ0FBQztRQUM3QixnQkFBVyxHQUFHLElBQUksZ0JBQUcsRUFBcUIsQ0FBQztRQUMzQyxpQkFBWSxHQUFpQixFQUFFLENBQUM7SUFtRjFDLENBQUM7SUFqRkMsc0JBQUksOEJBQVE7YUFBWixVQUFhLEtBQVU7WUFDckIsNENBQTRDO1lBQzVDLElBQUksQ0FB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b3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RpcmVjdGl2ZSwgSG9zdCwgVmlld0NvbnRhaW5lclJlZiwgVGVtcGxhdGVSZWZ9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmssIG5vcm1hbGl6ZUJsYW5rLCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgTWFwfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5jb25zdCBfV0hFTl9ERUZBVUxUID0gQ09OU1RfRVhQUihuZXcgT2JqZWN0KCkpO1xuXG5leHBvcnQgY2xhc3MgU3dpdGNoVmlldyB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgICAgICAgICAgIHByaXZhdGUgX3RlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxPYmplY3Q+KSB7fVxuXG4gIGNyZWF0ZSgpOiB2b2lkIHsgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jcmVhdGVFbWJlZGRlZFZpZXcodGhpcy5fdGVtcGxhdGVSZWYpOyB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHsgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jbGVhcigpOyB9XG59XG5cbi8qKlxuICogQWRkcyBvciByZW1vdmVzIERPTSBzdWItdHJlZXMgd2hlbiB0aGVpciBtYXRjaCBleHByZXNzaW9ucyBtYXRjaCB0aGUgc3dpdGNoIGV4cHJlc3Npb24uXG4gKlxuICogRWxlbWVudHMgd2l0aGluIGBOZ1N3aXRjaGAgYnV0IHdpdGhvdXQgYE5nU3dpdGNoV2hlbmAgb3IgYE5nU3dpdGNoRGVmYXVsdGAgZGlyZWN0aXZlcyB3aWxsIGJlXG4gKiBwcmVzZXJ2ZWQgYXQgdGhlIGxvY2F0aW9uIGFzIHNwZWNpZmllZCBpbiB0aGUgdGVtcGxhdGUuXG4gKlxuICogYE5nU3dpdGNoYCBzaW1wbHkgaW5zZXJ0cyBuZXN0ZWQgZWxlbWVudHMgYmFzZWQgb24gd2hpY2ggbWF0Y2ggZXhwcmVzc2lvbiBtYXRjaGVzIHRoZSB2YWx1ZVxuICogb2J0YWluZWQgZnJvbSB0aGUgZXZhbHVhdGVkIHN3aXRjaCBleHByZXNzaW9uLiBJbiBvdGhlciB3b3JkcywgeW91IGRlZmluZSBhIGNvbnRhaW5lciBlbGVtZW50XG4gKiAod2hlcmUgeW91IHBsYWNlIHRoZSBkaXJlY3RpdmUgd2l0aCBhIHN3aXRjaCBleHByZXNzaW9uIG9uIHRoZVxuICogYFtuZ1N3aXRjaF09XCIuLi5cImAgYXR0cmlidXRlKSwgZGVmaW5lIGFueSBpbm5lciBlbGVtZW50cyBpbnNpZGUgb2YgdGhlIGRpcmVjdGl2ZSBhbmRcbiAqIHBsYWNlIGEgYFtuZ1N3aXRjaFdoZW5dYCBhdHRyaWJ1dGUgcGVyIGVsZW1lbnQuXG4gKlxuICogVGhlIGBuZ1N3aXRjaFdoZW5gIHByb3BlcnR5IGlzIHVzZWQgdG8gaW5mb3JtIGBOZ1N3aXRjaGAgd2hpY2ggZWxlbWVudCB0byBkaXNwbGF5IHdoZW4gdGhlXG4gKiBleHByZXNzaW9uIGlzIGV2YWx1YXRlZC4gSWYgYSBtYXRjaGluZyBleHByZXNzaW9uIGlzIG5vdCBmb3VuZCB2aWEgYSBgbmdTd2l0Y2hXaGVuYCBwcm9wZXJ0eVxuICogdGhlbiBhbiBlbGVtZW50IHdpdGggdGhlIGBuZ1N3aXRjaERlZmF1bHRgIGF0dHJpYnV0ZSBpcyBkaXNwbGF5ZWQuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0RRTVRJSTk1Q2J1cVdybDNsWUFzP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8cD5WYWx1ZSA9IHt7dmFsdWV9fTwvcD5cbiAqICAgICA8YnV0dG9uIChjbGljayk9XCJpbmMoKVwiPkluY3JlbWVudDwvYnV0dG9uPlxuICpcbiAqICAgICA8ZGl2IFtuZ1N3aXRjaF09XCJ2YWx1ZVwiPlxuICogICAgICAgPHAgKm5nU3dpdGNoV2hlbj1cIidpbml0J1wiPmluY3JlbWVudCB0byBzdGFydDwvcD5cbiAqICAgICAgIDxwICpuZ1N3aXRjaFdoZW49XCIwXCI+MCwgaW5jcmVtZW50IGFnYWluPC9wPlxuICogICAgICAgPHAgKm5nU3dpdGNoV2hlbj1cIjFcIj4xLCBpbmNyZW1lbnQgYWdhaW48L3A+XG4gKiAgICAgICA8cCAqbmdTd2l0Y2hXaGVuPVwiMlwiPjIsIHN0b3AgaW5jcmVtZW50aW5nPC9wPlxuICogICAgICAgPHAgKm5nU3dpdGNoRGVmYXVsdD4mZ3Q7IDIsIFNUT1AhPC9wPlxuICogICAgIDwvZGl2PlxuICpcbiAqICAgICA8IS0tIGFsdGVybmF0ZSBzeW50YXggLS0+XG4gKlxuICogICAgIDxwIFtuZ1N3aXRjaF09XCJ2YWx1ZVwiPlxuICogICAgICAgPHRlbXBsYXRlIG5nU3dpdGNoV2hlbj1cImluaXRcIj5pbmNyZW1lbnQgdG8gc3RhcnQ8L3RlbXBsYXRlPlxuICogICAgICAgPHRlbXBsYXRlIFtuZ1N3aXRjaFdoZW5dPVwiMFwiPjAsIGluY3JlbWVudCBhZ2FpbjwvdGVtcGxhdGU+XG4gKiAgICAgICA8dGVtcGxhdGUgW25nU3dpdGNoV2hlbl09XCIxXCI+MSwgaW5jcmVtZW50IGFnYWluPC90ZW1wbGF0ZT5cbiAqICAgICAgIDx0ZW1wbGF0ZSBbbmdTd2l0Y2hXaGVuXT1cIjJcIj4yLCBzdG9wIGluY3JlbWVudGluZzwvdGVtcGxhdGU+XG4gKiAgICAgICA8dGVtcGxhdGUgbmdTd2l0Y2hEZWZhdWx0PiZndDsgMiwgU1RPUCE8L3RlbXBsYXRlPlxuICogICAgIDwvcD5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW05nU3dpdGNoLCBOZ1N3aXRjaFdoZW4sIE5nU3dpdGNoRGVmYXVsdF1cbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgQXBwIHtcbiAqICAgdmFsdWUgPSAnaW5pdCc7XG4gKlxuICogICBpbmMoKSB7XG4gKiAgICAgdGhpcy52YWx1ZSA9IHRoaXMudmFsdWUgPT09ICdpbml0JyA/IDAgOiB0aGlzLnZhbHVlICsgMTtcbiAqICAgfVxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHApLmNhdGNoKGVyciA9PiBjb25zb2xlLmVycm9yKGVycikpO1xuICogYGBgXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nU3dpdGNoXScsIGlucHV0czogWyduZ1N3aXRjaCddfSlcbmV4cG9ydCBjbGFzcyBOZ1N3aXRjaCB7XG4gIHByaXZhdGUgX3N3aXRjaFZhbHVlOiBhbnk7XG4gIHByaXZhdGUgX3VzZURlZmF1bHQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfdmFsdWVWaWV3cyA9IG5ldyBNYXA8YW55LCBTd2l0Y2hWaWV3W10+KCk7XG4gIHByaXZhdGUgX2FjdGl2ZVZpZXdzOiBTd2l0Y2hWaWV3W10gPSBbXTtcblxuICBzZXQgbmdTd2l0Y2godmFsdWU6IGFueSkge1xuICAgIC8vIEVtcHR5IHRoZSBjdXJyZW50bHkgYWN0aXZlIFZpZXdDb250YWluZXJzXG4gICAgdGhpcy5fZW1wdHlBbGxBY3RpdmVWaWV3cygpO1xuXG4gICAgLy8gQWRkIHRoZSBWaWV3Q29udGFpbmVycyBtYXRjaGluZyB0aGUgdmFsdWUgKHdpdGggYSBmYWxsYmFjayB0byBkZWZhdWx0KVxuICAgIHRoaXMuX3VzZURlZmF1bHQgPSBmYWxzZTtcbiAgICB2YXIgdmlld3MgPSB0aGlzLl92YWx1ZVZpZXdzLmdldCh2YWx1ZSk7XG4gICAgaWYgKGlzQmxhbmsodmlld3MpKSB7XG4gICAgICB0aGlzLl91c2VEZWZhdWx0ID0gdHJ1ZTtcbiAgICAgIHZpZXdzID0gbm9ybWFsaXplQmxhbmsodGhpcy5fdmFsdWVWaWV3cy5nZXQoX1dIRU5fREVGQVVMVCkpO1xuICAgIH1cbiAgICB0aGlzLl9hY3RpdmF0ZVZpZXdzKHZpZXdzKTtcblxuICAgIHRoaXMuX3N3aXRjaFZhbHVlID0gdmFsdWU7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9vbldoZW5WYWx1ZUNoYW5nZWQob2xkV2hlbjogYW55LCBuZXdXaGVuOiBhbnksIHZpZXc6IFN3aXRjaFZpZXcpOiB2b2lkIHtcbiAgICB0aGlzLl9kZXJlZ2lzdGVyVmlldyhvbGRXaGVuLCB2aWV3KTtcbiAgICB0aGlzLl9yZWdpc3RlclZpZXcobmV3V2hlbiwgdmlldyk7XG5cbiAgICBpZiAob2xkV2hlbiA9PT0gdGhpcy5fc3dpdGNoVmFsdWUpIHtcbiAgICAgIHZpZXcuZGVzdHJveSgpO1xuICAgICAgTGlzdFdyYXBwZXIucmVtb3ZlKHRoaXMuX2FjdGl2ZVZpZXdzLCB2aWV3KTtcbiAgICB9IGVsc2UgaWYgKG5ld1doZW4gPT09IHRoaXMuX3N3aXRjaFZhbHVlKSB7XG4gICAgICBpZiAodGhpcy5fdXNlRGVmYXVsdCkge1xuICAgICAgICB0aGlzLl91c2VEZWZhdWx0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2VtcHR5QWxsQWN0aXZlVmlld3MoKTtcbiAgICAgIH1cbiAgICAgIHZpZXcuY3JlYXRlKCk7XG4gICAgICB0aGlzLl9hY3RpdmVWaWV3cy5wdXNoKHZpZXcpO1xuICAgIH1cblxuICAgIC8vIFN3aXRjaCB0byBkZWZhdWx0IHdoZW4gdGhlcmUgaXMgbm8gbW9yZSBhY3RpdmUgVmlld0NvbnRhaW5lcnNcbiAgICBpZiAodGhpcy5fYWN0aXZlVmlld3MubGVuZ3RoID09PSAwICYmICF0aGlzLl91c2VEZWZhdWx0KSB7XG4gICAgICB0aGlzLl91c2VEZWZhdWx0ID0gdHJ1ZTtcbiAgICAgIHRoaXMuX2FjdGl2YXRlVmlld3ModGhpcy5fdmFsdWVWaWV3cy5nZXQoX1dIRU5fREVGQVVMVCkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2VtcHR5QWxsQWN0aXZlVmlld3MoKTogdm9pZCB7XG4gICAgdmFyIGFjdGl2ZUNvbnRhaW5lcnMgPSB0aGlzLl9hY3RpdmVWaWV3cztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFjdGl2ZUNvbnRhaW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFjdGl2ZUNvbnRhaW5lcnNbaV0uZGVzdHJveSgpO1xuICAgIH1cbiAgICB0aGlzLl9hY3RpdmVWaWV3cyA9IFtdO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYWN0aXZhdGVWaWV3cyh2aWV3czogU3dpdGNoVmlld1tdKTogdm9pZCB7XG4gICAgLy8gVE9ETyh2aWNiKTogYXNzZXJ0KHRoaXMuX2FjdGl2ZVZpZXdzLmxlbmd0aCA9PT0gMCk7XG4gICAgaWYgKGlzUHJlc2VudCh2aWV3cykpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmlld3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmlld3NbaV0uY3JlYXRlKCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9hY3RpdmVWaWV3cyA9IHZpZXdzO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3JlZ2lzdGVyVmlldyh2YWx1ZTogYW55LCB2aWV3OiBTd2l0Y2hWaWV3KTogdm9pZCB7XG4gICAgdmFyIHZpZXdzID0gdGhpcy5fdmFsdWVWaWV3cy5nZXQodmFsdWUpO1xuICAgIGlmIChpc0JsYW5rKHZpZXdzKSkge1xuICAgICAgdmlld3MgPSBbXTtcbiAgICAgIHRoaXMuX3ZhbHVlVmlld3Muc2V0KHZhbHVlLCB2aWV3cyk7XG4gICAgfVxuICAgIHZpZXdzLnB1c2godmlldyk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9kZXJlZ2lzdGVyVmlldyh2YWx1ZTogYW55LCB2aWV3OiBTd2l0Y2hWaWV3KTogdm9pZCB7XG4gICAgLy8gYF9XSEVOX0RFRkFVTFRgIGlzIHVzZWQgYSBtYXJrZXIgZm9yIG5vbi1yZWdpc3RlcmVkIHdoZW5zXG4gICAgaWYgKHZhbHVlID09PSBfV0hFTl9ERUZBVUxUKSByZXR1cm47XG4gICAgdmFyIHZpZXdzID0gdGhpcy5fdmFsdWVWaWV3cy5nZXQodmFsdWUpO1xuICAgIGlmICh2aWV3cy5sZW5ndGggPT0gMSkge1xuICAgICAgdGhpcy5fdmFsdWVWaWV3cy5kZWxldGUodmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBMaXN0V3JhcHBlci5yZW1vdmUodmlld3MsIHZpZXcpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEluc2VydCB0aGUgc3ViLXRyZWUgd2hlbiB0aGUgYG5nU3dpdGNoV2hlbmAgZXhwcmVzc2lvbiBldmFsdWF0ZXMgdG8gdGhlIHNhbWUgdmFsdWUgYXMgdGhlXG4gKiBlbmNsb3Npbmcgc3dpdGNoIGV4cHJlc3Npb24uXG4gKlxuICogSWYgbXVsdGlwbGUgbWF0Y2ggZXhwcmVzc2lvbiBtYXRjaCB0aGUgc3dpdGNoIGV4cHJlc3Npb24gdmFsdWUsIGFsbCBvZiB0aGVtIGFyZSBkaXNwbGF5ZWQuXG4gKlxuICogU2VlIHtAbGluayBOZ1N3aXRjaH0gZm9yIG1vcmUgZGV0YWlscyBhbmQgZXhhbXBsZS5cbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdTd2l0Y2hXaGVuXScsIGlucHV0czogWyduZ1N3aXRjaFdoZW4nXX0pXG5leHBvcnQgY2xhc3MgTmdTd2l0Y2hXaGVuIHtcbiAgLy8gYF9XSEVOX0RFRkFVTFRgIGlzIHVzZWQgYXMgYSBtYXJrZXIgZm9yIGEgbm90IHlldCBpbml0aWFsaXplZCB2YWx1ZVxuICAvKiogQGludGVybmFsICovXG4gIF92YWx1ZTogYW55ID0gX1dIRU5fREVGQVVMVDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdmlldzogU3dpdGNoVmlldztcbiAgcHJpdmF0ZSBfc3dpdGNoOiBOZ1N3aXRjaDtcblxuICBjb25zdHJ1Y3Rvcih2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8T2JqZWN0PixcbiAgICAgICAgICAgICAgQEhvc3QoKSBuZ1N3aXRjaDogTmdTd2l0Y2gpIHtcbiAgICB0aGlzLl9zd2l0Y2ggPSBuZ1N3aXRjaDtcbiAgICB0aGlzLl92aWV3ID0gbmV3IFN3aXRjaFZpZXcodmlld0NvbnRhaW5lciwgdGVtcGxhdGVSZWYpO1xuICB9XG5cbiAgc2V0IG5nU3dpdGNoV2hlbih2YWx1ZTogYW55KSB7XG4gICAgdGhpcy5fc3dpdGNoLl9vbldoZW5WYWx1ZUNoYW5nZWQodGhpcy5fdmFsdWUsIHZhbHVlLCB0aGlzLl92aWV3KTtcbiAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICB9XG59XG5cbi8qKlxuICogRGVmYXVsdCBjYXNlIHN0YXRlbWVudHMgYXJlIGRpc3BsYXllZCB3aGVuIG5vIG1hdGNoIGV4cHJlc3Npb24gbWF0Y2hlcyB0aGUgc3dpdGNoIGV4cHJlc3Npb25cbiAqIHZhbHVlLlxuICpcbiAqIFNlZSB7QGxpbmsgTmdTd2l0Y2h9IGZvciBtb3JlIGRldGFpbHMgYW5kIGV4YW1wbGUuXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nU3dpdGNoRGVmYXVsdF0nfSlcbmV4cG9ydCBjbGFzcyBOZ1N3aXRjaERlZmF1bHQge1xuICBjb25zdHJ1Y3Rvcih2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8T2JqZWN0PixcbiAgICAgICAgICAgICAgQEhvc3QoKSBzc3dpdGNoOiBOZ1N3aXRjaCkge1xuICAgIHNzd2l0Y2guX3JlZ2lzdGVyVmlldyhfV0hFTl9ERUZBVUxULCBuZXcgU3dpdGNoVmlldyh2aWV3Q29udGFpbmVyLCB0ZW1wbGF0ZVJlZikpO1xuICB9XG59XG4iXX0=