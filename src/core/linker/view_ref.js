'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var exceptions_1 = require('angular2/src/facade/exceptions');
var constants_1 = require('angular2/src/core/change_detection/constants');
var ViewRef = (function () {
    function ViewRef() {
    }
    Object.defineProperty(ViewRef.prototype, "destroyed", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    return ViewRef;
}());
exports.ViewRef = ViewRef;
/**
 * Represents a View containing a single Element that is the Host Element of a {@link Component}
 * instance.
 *
 * A Host View is created for every dynamically created Component that was compiled on its own (as
 * opposed to as a part of another Component's Template) via {@link Compiler#compileInHost} or one
 * of the higher-level APIs: {@link AppViewManager#createRootHostView},
 * {@link AppViewManager#createHostViewInContainer}, {@link ViewContainerRef#createHostView}.
 */
var HostViewRef = (function (_super) {
    __extends(HostViewRef, _super);
    function HostViewRef() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(HostViewRef.prototype, "rootNodes", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(HostViewRef.prototype, "changeDetectorRef", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    return HostViewRef;
}(ViewRef));
exports.HostViewRef = HostViewRef;
/**
 * Represents an Angular View.
 *
 * <!-- TODO: move the next two paragraphs to the dev guide -->
 * A View is a fundamental building block of the application UI. It is the smallest grouping of
 * Elements which are created and destroyed together.
 *
 * Properties of elements in a View can change, but the structure (number and order) of elements in
 * a View cannot. Changing the structure of Elements can only be done by inserting, moving or
 * removing nested Views via a {@link ViewContainerRef}. Each View can contain many View Containers.
 * <!-- /TODO -->
 *
 * ### Example
 *
 * Given this template...
 *
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <li *ngFor="var item of items">{{item}}</li>
 * </ul>
 * ```
 *
 * ... we have two {@link ProtoViewRef}s:
 *
 * Outer {@link ProtoViewRef}:
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <template ngFor var-item [ngForOf]="items"></template>
 * </ul>
 * ```
 *
 * Inner {@link ProtoViewRef}:
 * ```
 *   <li>{{item}}</li>
 * ```
 *
 * Notice that the original template is broken down into two separate {@link ProtoViewRef}s.
 *
 * The outer/inner {@link ProtoViewRef}s are then assembled into views like so:
 *
 * ```
 * <!-- ViewRef: outer-0 -->
 * Count: 2
 * <ul>
 *   <template view-container-ref></template>
 *   <!-- ViewRef: inner-1 --><li>first</li><!-- /ViewRef: inner-1 -->
 *   <!-- ViewRef: inner-2 --><li>second</li><!-- /ViewRef: inner-2 -->
 * </ul>
 * <!-- /ViewRef: outer-0 -->
 * ```
 */
var EmbeddedViewRef = (function (_super) {
    __extends(EmbeddedViewRef, _super);
    function EmbeddedViewRef() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(EmbeddedViewRef.prototype, "rootNodes", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    return EmbeddedViewRef;
}(ViewRef));
exports.EmbeddedViewRef = EmbeddedViewRef;
var ViewRef_ = (function () {
    function ViewRef_(_view) {
        this._view = _view;
        this._view = _view;
    }
    Object.defineProperty(ViewRef_.prototype, "internalView", {
        get: function () { return this._view; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewRef_.prototype, "rootNodes", {
        get: function () { return this._view.flatRootNodes; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewRef_.prototype, "changeDetectorRef", {
        get: function () { return this; },
        enumerable: true,
        configurable: true
    });
    ViewRef_.prototype.setLocal = function (variableName, value) { this._view.setLocal(variableName, value); };
    ViewRef_.prototype.hasLocal = function (variableName) { return this._view.hasLocal(variableName); };
    Object.defineProperty(ViewRef_.prototype, "destroyed", {
        get: function () { return this._view.destroyed; },
        enumerable: true,
        configurable: true
    });
    ViewRef_.prototype.markForCheck = function () { this._view.markPathToRootAsCheckOnce(); };
    ViewRef_.prototype.detach = function () { this._view.cdMode = constants_1.ChangeDetectionStrategy.Detached; };
    ViewRef_.prototype.detectChanges = function () { this._view.detectChanges(false); };
    ViewRef_.prototype.checkNoChanges = function () { this._view.detectChanges(true); };
    ViewRef_.prototype.reattach = function () {
        this._view.cdMode = constants_1.ChangeDetectionStrategy.CheckAlways;
        this.markForCheck();
    };
    return ViewRef_;
}());
exports.ViewRef_ = ViewRef_;
var HostViewFactoryRef = (function () {
    function HostViewFactoryRef() {
    }
    return HostViewFactoryRef;
}());
exports.HostViewFactoryRef = HostViewFactoryRef;
var HostViewFactoryRef_ = (function () {
    function HostViewFactoryRef_(_hostViewFactory) {
        this._hostViewFactory = _hostViewFactory;
    }
    Object.defineProperty(HostViewFactoryRef_.prototype, "internalHostViewFactory", {
        get: function () { return this._hostViewFactory; },
        enumerable: true,
        configurable: true
    });
    return HostViewFactoryRef_;
}());
exports.HostViewFactoryRef_ = HostViewFactoryRef_;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLW5GSVNqbWhwLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld19yZWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFHN0QsMEJBQXNDLDhDQUE4QyxDQUFDLENBQUE7QUFFckY7SUFBQTtJQUVBLENBQUM7SUFEQyxzQkFBSSw4QkFBUzthQUFiLGNBQTJCLE1BQU0sQ0FBVSwwQkFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUMvRCxjQUFDO0FBQUQsQ0FBQyxBQUZELElBRUM7QUFGcUIsZUFBTyxVQUU1QixDQUFBO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSDtJQUEwQywrQkFBTztJQUFqRDtRQUEwQyw4QkFBTztJQUdqRCxDQUFDO0lBRkMsc0JBQUksa0NBQVM7YUFBYixjQUF5QixNQUFNLENBQVEsMEJBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7O0lBQ3pELHNCQUFJLDBDQUFpQjthQUFyQixjQUE2QyxNQUFNLENBQW9CLDBCQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBQzNGLGtCQUFDO0FBQUQsQ0FBQyxBQUhELENBQTBDLE9BQU8sR0FHaEQ7QUFIcUIsbUJBQVcsY0FHaEMsQ0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0RHO0FBQ0g7SUFBOEMsbUNBQU87SUFBckQ7UUFBOEMsOEJBQU87SUFZckQsQ0FBQztJQURDLHNCQUFJLHNDQUFTO2FBQWIsY0FBeUIsTUFBTSxDQUFRLDBCQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztPQUFBOztJQUMzRCxzQkFBQztBQUFELENBQUMsQUFaRCxDQUE4QyxPQUFPLEdBWXBEO0FBWnFCLHVCQUFlLGtCQVlwQyxDQUFBO0FBRUQ7SUFDRSxrQkFBb0IsS0FBbUI7UUFBbkIsVUFBSyxHQUFMLEtBQUssQ0FBYztRQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQUMsQ0FBQztJQUVoRSxzQkFBSSxrQ0FBWTthQUFoQixjQUFtQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBRXZELHNCQUFJLCtCQUFTO2FBQWIsY0FBeUIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFFM0Qsc0JBQUksdUNBQWlCO2FBQXJCLGNBQTZDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUUzRCwyQkFBUSxHQUFSLFVBQVMsWUFBb0IsRUFBRSxLQUFVLElBQVUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUU5RiwyQkFBUSxHQUFSLFVBQVMsWUFBb0IsSUFBYSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXJGLHNCQUFJLCtCQUFTO2FBQWIsY0FBMkIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFFekQsK0JBQVksR0FBWixjQUF1QixJQUFJLENBQUMsS0FBSyxDQUFDLHlCQUF5QixFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLHlCQUFNLEdBQU4sY0FBaUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsbUNBQXVCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUN4RSxnQ0FBYSxHQUFiLGNBQXdCLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRCxpQ0FBYyxHQUFkLGNBQXlCLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRCwyQkFBUSxHQUFSO1FBQ0UsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsbUNBQXVCLENBQUMsV0FBVyxDQUFDO1FBQ3hELElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBQ0gsZUFBQztBQUFELENBQUMsQUF2QkQsSUF1QkM7QUF2QlksZ0JBQVEsV0F1QnBCLENBQUE7QUFFRDtJQUFBO0lBQTBDLENBQUM7SUFBRCx5QkFBQztBQUFELENBQUMsQUFBM0MsSUFBMkM7QUFBckIsMEJBQWtCLHFCQUFHLENBQUE7QUFFM0M7SUFDRSw2QkFBb0IsZ0JBQWlDO1FBQWpDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBaUI7SUFBRyxDQUFDO0lBRXpELHNCQUFJLHdEQUF1QjthQUEzQixjQUFpRCxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFDbEYsMEJBQUM7QUFBRCxDQUFDLEFBSkQsSUFJQztBQUpZLDJCQUFtQixzQkFJL0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7dW5pbXBsZW1lbnRlZH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7Q2hhbmdlRGV0ZWN0b3JSZWZ9IGZyb20gJy4uL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdG9yX3JlZic7XG5pbXBvcnQge0FwcFZpZXcsIEhvc3RWaWV3RmFjdG9yeX0gZnJvbSAnLi92aWV3JztcbmltcG9ydCB7Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3l9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vY29uc3RhbnRzJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFZpZXdSZWYge1xuICBnZXQgZGVzdHJveWVkKCk6IGJvb2xlYW4geyByZXR1cm4gPGJvb2xlYW4+dW5pbXBsZW1lbnRlZCgpOyB9XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIFZpZXcgY29udGFpbmluZyBhIHNpbmdsZSBFbGVtZW50IHRoYXQgaXMgdGhlIEhvc3QgRWxlbWVudCBvZiBhIHtAbGluayBDb21wb25lbnR9XG4gKiBpbnN0YW5jZS5cbiAqXG4gKiBBIEhvc3QgVmlldyBpcyBjcmVhdGVkIGZvciBldmVyeSBkeW5hbWljYWxseSBjcmVhdGVkIENvbXBvbmVudCB0aGF0IHdhcyBjb21waWxlZCBvbiBpdHMgb3duIChhc1xuICogb3Bwb3NlZCB0byBhcyBhIHBhcnQgb2YgYW5vdGhlciBDb21wb25lbnQncyBUZW1wbGF0ZSkgdmlhIHtAbGluayBDb21waWxlciNjb21waWxlSW5Ib3N0fSBvciBvbmVcbiAqIG9mIHRoZSBoaWdoZXItbGV2ZWwgQVBJczoge0BsaW5rIEFwcFZpZXdNYW5hZ2VyI2NyZWF0ZVJvb3RIb3N0Vmlld30sXG4gKiB7QGxpbmsgQXBwVmlld01hbmFnZXIjY3JlYXRlSG9zdFZpZXdJbkNvbnRhaW5lcn0sIHtAbGluayBWaWV3Q29udGFpbmVyUmVmI2NyZWF0ZUhvc3RWaWV3fS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEhvc3RWaWV3UmVmIGV4dGVuZHMgVmlld1JlZiB7XG4gIGdldCByb290Tm9kZXMoKTogYW55W10geyByZXR1cm4gPGFueVtdPnVuaW1wbGVtZW50ZWQoKTsgfTtcbiAgZ2V0IGNoYW5nZURldGVjdG9yUmVmKCk6IENoYW5nZURldGVjdG9yUmVmIHsgcmV0dXJuIDxDaGFuZ2VEZXRlY3RvclJlZj51bmltcGxlbWVudGVkKCk7IH1cbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGFuIEFuZ3VsYXIgVmlldy5cbiAqXG4gKiA8IS0tIFRPRE86IG1vdmUgdGhlIG5leHQgdHdvIHBhcmFncmFwaHMgdG8gdGhlIGRldiBndWlkZSAtLT5cbiAqIEEgVmlldyBpcyBhIGZ1bmRhbWVudGFsIGJ1aWxkaW5nIGJsb2NrIG9mIHRoZSBhcHBsaWNhdGlvbiBVSS4gSXQgaXMgdGhlIHNtYWxsZXN0IGdyb3VwaW5nIG9mXG4gKiBFbGVtZW50cyB3aGljaCBhcmUgY3JlYXRlZCBhbmQgZGVzdHJveWVkIHRvZ2V0aGVyLlxuICpcbiAqIFByb3BlcnRpZXMgb2YgZWxlbWVudHMgaW4gYSBWaWV3IGNhbiBjaGFuZ2UsIGJ1dCB0aGUgc3RydWN0dXJlIChudW1iZXIgYW5kIG9yZGVyKSBvZiBlbGVtZW50cyBpblxuICogYSBWaWV3IGNhbm5vdC4gQ2hhbmdpbmcgdGhlIHN0cnVjdHVyZSBvZiBFbGVtZW50cyBjYW4gb25seSBiZSBkb25lIGJ5IGluc2VydGluZywgbW92aW5nIG9yXG4gKiByZW1vdmluZyBuZXN0ZWQgVmlld3MgdmlhIGEge0BsaW5rIFZpZXdDb250YWluZXJSZWZ9LiBFYWNoIFZpZXcgY2FuIGNvbnRhaW4gbWFueSBWaWV3IENvbnRhaW5lcnMuXG4gKiA8IS0tIC9UT0RPIC0tPlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogR2l2ZW4gdGhpcyB0ZW1wbGF0ZS4uLlxuICpcbiAqIGBgYFxuICogQ291bnQ6IHt7aXRlbXMubGVuZ3RofX1cbiAqIDx1bD5cbiAqICAgPGxpICpuZ0Zvcj1cInZhciBpdGVtIG9mIGl0ZW1zXCI+e3tpdGVtfX08L2xpPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIC4uLiB3ZSBoYXZlIHR3byB7QGxpbmsgUHJvdG9WaWV3UmVmfXM6XG4gKlxuICogT3V0ZXIge0BsaW5rIFByb3RvVmlld1JlZn06XG4gKiBgYGBcbiAqIENvdW50OiB7e2l0ZW1zLmxlbmd0aH19XG4gKiA8dWw+XG4gKiAgIDx0ZW1wbGF0ZSBuZ0ZvciB2YXItaXRlbSBbbmdGb3JPZl09XCJpdGVtc1wiPjwvdGVtcGxhdGU+XG4gKiA8L3VsPlxuICogYGBgXG4gKlxuICogSW5uZXIge0BsaW5rIFByb3RvVmlld1JlZn06XG4gKiBgYGBcbiAqICAgPGxpPnt7aXRlbX19PC9saT5cbiAqIGBgYFxuICpcbiAqIE5vdGljZSB0aGF0IHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZSBpcyBicm9rZW4gZG93biBpbnRvIHR3byBzZXBhcmF0ZSB7QGxpbmsgUHJvdG9WaWV3UmVmfXMuXG4gKlxuICogVGhlIG91dGVyL2lubmVyIHtAbGluayBQcm90b1ZpZXdSZWZ9cyBhcmUgdGhlbiBhc3NlbWJsZWQgaW50byB2aWV3cyBsaWtlIHNvOlxuICpcbiAqIGBgYFxuICogPCEtLSBWaWV3UmVmOiBvdXRlci0wIC0tPlxuICogQ291bnQ6IDJcbiAqIDx1bD5cbiAqICAgPHRlbXBsYXRlIHZpZXctY29udGFpbmVyLXJlZj48L3RlbXBsYXRlPlxuICogICA8IS0tIFZpZXdSZWY6IGlubmVyLTEgLS0+PGxpPmZpcnN0PC9saT48IS0tIC9WaWV3UmVmOiBpbm5lci0xIC0tPlxuICogICA8IS0tIFZpZXdSZWY6IGlubmVyLTIgLS0+PGxpPnNlY29uZDwvbGk+PCEtLSAvVmlld1JlZjogaW5uZXItMiAtLT5cbiAqIDwvdWw+XG4gKiA8IS0tIC9WaWV3UmVmOiBvdXRlci0wIC0tPlxuICogYGBgXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBFbWJlZGRlZFZpZXdSZWYgZXh0ZW5kcyBWaWV3UmVmIHtcbiAgLyoqXG4gICAqIFNldHMgYHZhbHVlYCBvZiBsb2NhbCB2YXJpYWJsZSBjYWxsZWQgYHZhcmlhYmxlTmFtZWAgaW4gdGhpcyBWaWV3LlxuICAgKi9cbiAgYWJzdHJhY3Qgc2V0TG9jYWwodmFyaWFibGVOYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciB0aGlzIHZpZXcgaGFzIGEgbG9jYWwgdmFyaWFibGUgY2FsbGVkIGB2YXJpYWJsZU5hbWVgLlxuICAgKi9cbiAgYWJzdHJhY3QgaGFzTG9jYWwodmFyaWFibGVOYW1lOiBzdHJpbmcpOiBib29sZWFuO1xuXG4gIGdldCByb290Tm9kZXMoKTogYW55W10geyByZXR1cm4gPGFueVtdPnVuaW1wbGVtZW50ZWQoKTsgfTtcbn1cblxuZXhwb3J0IGNsYXNzIFZpZXdSZWZfIGltcGxlbWVudHMgRW1iZWRkZWRWaWV3UmVmLCBIb3N0Vmlld1JlZiwgQ2hhbmdlRGV0ZWN0b3JSZWYge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF92aWV3OiBBcHBWaWV3PGFueT4pIHsgdGhpcy5fdmlldyA9IF92aWV3OyB9XG5cbiAgZ2V0IGludGVybmFsVmlldygpOiBBcHBWaWV3PGFueT4geyByZXR1cm4gdGhpcy5fdmlldzsgfVxuXG4gIGdldCByb290Tm9kZXMoKTogYW55W10geyByZXR1cm4gdGhpcy5fdmlldy5mbGF0Um9vdE5vZGVzOyB9XG5cbiAgZ2V0IGNoYW5nZURldGVjdG9yUmVmKCk6IENoYW5nZURldGVjdG9yUmVmIHsgcmV0dXJuIHRoaXM7IH1cblxuICBzZXRMb2NhbCh2YXJpYWJsZU5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQgeyB0aGlzLl92aWV3LnNldExvY2FsKHZhcmlhYmxlTmFtZSwgdmFsdWUpOyB9XG5cbiAgaGFzTG9jYWwodmFyaWFibGVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3ZpZXcuaGFzTG9jYWwodmFyaWFibGVOYW1lKTsgfVxuXG4gIGdldCBkZXN0cm95ZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl92aWV3LmRlc3Ryb3llZDsgfVxuXG4gIG1hcmtGb3JDaGVjaygpOiB2b2lkIHsgdGhpcy5fdmlldy5tYXJrUGF0aFRvUm9vdEFzQ2hlY2tPbmNlKCk7IH1cbiAgZGV0YWNoKCk6IHZvaWQgeyB0aGlzLl92aWV3LmNkTW9kZSA9IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRldGFjaGVkOyB9XG4gIGRldGVjdENoYW5nZXMoKTogdm9pZCB7IHRoaXMuX3ZpZXcuZGV0ZWN0Q2hhbmdlcyhmYWxzZSk7IH1cbiAgY2hlY2tOb0NoYW5nZXMoKTogdm9pZCB7IHRoaXMuX3ZpZXcuZGV0ZWN0Q2hhbmdlcyh0cnVlKTsgfVxuICByZWF0dGFjaCgpOiB2b2lkIHtcbiAgICB0aGlzLl92aWV3LmNkTW9kZSA9IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrQWx3YXlzO1xuICAgIHRoaXMubWFya0ZvckNoZWNrKCk7XG4gIH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEhvc3RWaWV3RmFjdG9yeVJlZiB7fVxuXG5leHBvcnQgY2xhc3MgSG9zdFZpZXdGYWN0b3J5UmVmXyBpbXBsZW1lbnRzIEhvc3RWaWV3RmFjdG9yeVJlZiB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2hvc3RWaWV3RmFjdG9yeTogSG9zdFZpZXdGYWN0b3J5KSB7fVxuXG4gIGdldCBpbnRlcm5hbEhvc3RWaWV3RmFjdG9yeSgpOiBIb3N0Vmlld0ZhY3RvcnkgeyByZXR1cm4gdGhpcy5faG9zdFZpZXdGYWN0b3J5OyB9XG59XG4iXX0=