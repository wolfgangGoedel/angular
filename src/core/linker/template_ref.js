'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var EMPTY_CONTEXT = lang_1.CONST_EXPR(new Object());
/**
 * Represents an Embedded Template that can be used to instantiate Embedded Views.
 *
 * You can access a `TemplateRef`, in two ways. Via a directive placed on a `<template>` element (or
 * directive prefixed with `*`) and have the `TemplateRef` for this Embedded View injected into the
 * constructor of the directive using the `TemplateRef` Token. Alternatively you can query for the
 * `TemplateRef` from a Component or a Directive via {@link Query}.
 *
 * To instantiate Embedded Views based on a Template, use
 * {@link ViewContainerRef#createEmbeddedView}, which will create the View and attach it to the
 * View Container.
 */
var TemplateRef = (function () {
    function TemplateRef() {
    }
    Object.defineProperty(TemplateRef.prototype, "elementRef", {
        /**
         * The location in the View where the Embedded View logically belongs to.
         *
         * The data-binding and injection contexts of Embedded Views created from this `TemplateRef`
         * inherit from the contexts of this location.
         *
         * Typically new Embedded Views are attached to the View Container of this location, but in
         * advanced use-cases, the View can be attached to a different container while keeping the
         * data-binding and injection context from the original location.
         *
         */
        // TODO(i): rename to anchor or location
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    return TemplateRef;
}());
exports.TemplateRef = TemplateRef;
var TemplateRef_ = (function (_super) {
    __extends(TemplateRef_, _super);
    function TemplateRef_(_appElement, _viewFactory) {
        _super.call(this);
        this._appElement = _appElement;
        this._viewFactory = _viewFactory;
    }
    TemplateRef_.prototype.createEmbeddedView = function (context) {
        var view = this._viewFactory(this._appElement.parentView.viewUtils, this._appElement.parentInjector, this._appElement);
        if (lang_1.isBlank(context)) {
            context = EMPTY_CONTEXT;
        }
        view.create(context, null, null);
        return view.ref;
    };
    Object.defineProperty(TemplateRef_.prototype, "elementRef", {
        get: function () { return this._appElement.elementRef; },
        enumerable: true,
        configurable: true
    });
    return TemplateRef_;
}(TemplateRef));
exports.TemplateRef_ = TemplateRef_;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1XNVZnS25CRi50bXAvYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3RlbXBsYXRlX3JlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxxQkFBa0MsMEJBQTBCLENBQUMsQ0FBQTtBQU03RCxJQUFNLGFBQWEsR0FBRyxpQkFBVSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztBQUUvQzs7Ozs7Ozs7Ozs7R0FXRztBQUNIO0lBQUE7SUFnQkEsQ0FBQztJQUhDLHNCQUFJLG1DQUFVO1FBWmQ7Ozs7Ozs7Ozs7V0FVRztRQUNILHdDQUF3QzthQUN4QyxjQUErQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFHL0Msa0JBQUM7QUFBRCxDQUFDLEFBaEJELElBZ0JDO0FBaEJxQixtQkFBVyxjQWdCaEMsQ0FBQTtBQUVEO0lBQXFDLGdDQUFjO0lBQ2pELHNCQUFvQixXQUF1QixFQUFVLFlBQXNCO1FBQUksaUJBQU8sQ0FBQztRQUFuRSxnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFVO0lBQWEsQ0FBQztJQUV6Rix5Q0FBa0IsR0FBbEIsVUFBbUIsT0FBVTtRQUMzQixJQUFJLElBQUksR0FBZSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFDckMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzVGLEVBQUUsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsT0FBTyxHQUFRLGFBQWEsQ0FBQztRQUMvQixDQUFDO1FBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ2xCLENBQUM7SUFFRCxzQkFBSSxvQ0FBVTthQUFkLGNBQStCLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBQ3RFLG1CQUFDO0FBQUQsQ0FBQyxBQWRELENBQXFDLFdBQVcsR0FjL0M7QUFkWSxvQkFBWSxlQWN4QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVF9FWFBSLCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtFbGVtZW50UmVmfSBmcm9tICcuL2VsZW1lbnRfcmVmJztcbmltcG9ydCB7QXBwRWxlbWVudH0gZnJvbSAnLi9lbGVtZW50JztcbmltcG9ydCB7QXBwVmlld30gZnJvbSAnLi92aWV3JztcbmltcG9ydCB7RW1iZWRkZWRWaWV3UmVmfSBmcm9tICcuL3ZpZXdfcmVmJztcblxuY29uc3QgRU1QVFlfQ09OVEVYVCA9IENPTlNUX0VYUFIobmV3IE9iamVjdCgpKTtcblxuLyoqXG4gKiBSZXByZXNlbnRzIGFuIEVtYmVkZGVkIFRlbXBsYXRlIHRoYXQgY2FuIGJlIHVzZWQgdG8gaW5zdGFudGlhdGUgRW1iZWRkZWQgVmlld3MuXG4gKlxuICogWW91IGNhbiBhY2Nlc3MgYSBgVGVtcGxhdGVSZWZgLCBpbiB0d28gd2F5cy4gVmlhIGEgZGlyZWN0aXZlIHBsYWNlZCBvbiBhIGA8dGVtcGxhdGU+YCBlbGVtZW50IChvclxuICogZGlyZWN0aXZlIHByZWZpeGVkIHdpdGggYCpgKSBhbmQgaGF2ZSB0aGUgYFRlbXBsYXRlUmVmYCBmb3IgdGhpcyBFbWJlZGRlZCBWaWV3IGluamVjdGVkIGludG8gdGhlXG4gKiBjb25zdHJ1Y3RvciBvZiB0aGUgZGlyZWN0aXZlIHVzaW5nIHRoZSBgVGVtcGxhdGVSZWZgIFRva2VuLiBBbHRlcm5hdGl2ZWx5IHlvdSBjYW4gcXVlcnkgZm9yIHRoZVxuICogYFRlbXBsYXRlUmVmYCBmcm9tIGEgQ29tcG9uZW50IG9yIGEgRGlyZWN0aXZlIHZpYSB7QGxpbmsgUXVlcnl9LlxuICpcbiAqIFRvIGluc3RhbnRpYXRlIEVtYmVkZGVkIFZpZXdzIGJhc2VkIG9uIGEgVGVtcGxhdGUsIHVzZVxuICoge0BsaW5rIFZpZXdDb250YWluZXJSZWYjY3JlYXRlRW1iZWRkZWRWaWV3fSwgd2hpY2ggd2lsbCBjcmVhdGUgdGhlIFZpZXcgYW5kIGF0dGFjaCBpdCB0byB0aGVcbiAqIFZpZXcgQ29udGFpbmVyLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVGVtcGxhdGVSZWY8Qz4ge1xuICAvKipcbiAgICogVGhlIGxvY2F0aW9uIGluIHRoZSBWaWV3IHdoZXJlIHRoZSBFbWJlZGRlZCBWaWV3IGxvZ2ljYWxseSBiZWxvbmdzIHRvLlxuICAgKlxuICAgKiBUaGUgZGF0YS1iaW5kaW5nIGFuZCBpbmplY3Rpb24gY29udGV4dHMgb2YgRW1iZWRkZWQgVmlld3MgY3JlYXRlZCBmcm9tIHRoaXMgYFRlbXBsYXRlUmVmYFxuICAgKiBpbmhlcml0IGZyb20gdGhlIGNvbnRleHRzIG9mIHRoaXMgbG9jYXRpb24uXG4gICAqXG4gICAqIFR5cGljYWxseSBuZXcgRW1iZWRkZWQgVmlld3MgYXJlIGF0dGFjaGVkIHRvIHRoZSBWaWV3IENvbnRhaW5lciBvZiB0aGlzIGxvY2F0aW9uLCBidXQgaW5cbiAgICogYWR2YW5jZWQgdXNlLWNhc2VzLCB0aGUgVmlldyBjYW4gYmUgYXR0YWNoZWQgdG8gYSBkaWZmZXJlbnQgY29udGFpbmVyIHdoaWxlIGtlZXBpbmcgdGhlXG4gICAqIGRhdGEtYmluZGluZyBhbmQgaW5qZWN0aW9uIGNvbnRleHQgZnJvbSB0aGUgb3JpZ2luYWwgbG9jYXRpb24uXG4gICAqXG4gICAqL1xuICAvLyBUT0RPKGkpOiByZW5hbWUgdG8gYW5jaG9yIG9yIGxvY2F0aW9uXG4gIGdldCBlbGVtZW50UmVmKCk6IEVsZW1lbnRSZWYgeyByZXR1cm4gbnVsbDsgfVxuXG4gIGFic3RyYWN0IGNyZWF0ZUVtYmVkZGVkVmlldyhjb250ZXh0OiBDKTogRW1iZWRkZWRWaWV3UmVmPEM+O1xufVxuXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVSZWZfPEM+IGV4dGVuZHMgVGVtcGxhdGVSZWY8Qz4ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9hcHBFbGVtZW50OiBBcHBFbGVtZW50LCBwcml2YXRlIF92aWV3RmFjdG9yeTogRnVuY3Rpb24pIHsgc3VwZXIoKTsgfVxuXG4gIGNyZWF0ZUVtYmVkZGVkVmlldyhjb250ZXh0OiBDKTogRW1iZWRkZWRWaWV3UmVmPEM+IHtcbiAgICB2YXIgdmlldzogQXBwVmlldzxDPiA9IHRoaXMuX3ZpZXdGYWN0b3J5KHRoaXMuX2FwcEVsZW1lbnQucGFyZW50Vmlldy52aWV3VXRpbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9hcHBFbGVtZW50LnBhcmVudEluamVjdG9yLCB0aGlzLl9hcHBFbGVtZW50KTtcbiAgICBpZiAoaXNCbGFuayhjb250ZXh0KSkge1xuICAgICAgY29udGV4dCA9IDxhbnk+RU1QVFlfQ09OVEVYVDtcbiAgICB9XG4gICAgdmlldy5jcmVhdGUoY29udGV4dCwgbnVsbCwgbnVsbCk7XG4gICAgcmV0dXJuIHZpZXcucmVmO1xuICB9XG5cbiAgZ2V0IGVsZW1lbnRSZWYoKTogRWxlbWVudFJlZiB7IHJldHVybiB0aGlzLl9hcHBFbGVtZW50LmVsZW1lbnRSZWY7IH1cbn1cbiJdfQ==