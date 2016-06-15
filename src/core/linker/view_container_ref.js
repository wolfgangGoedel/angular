'use strict';"use strict";
var collection_1 = require('angular2/src/facade/collection');
var exceptions_1 = require('angular2/src/facade/exceptions');
var injector_1 = require('angular2/src/core/di/injector');
var lang_1 = require('angular2/src/facade/lang');
var profile_1 = require('../profile/profile');
/**
 * Represents a container where one or more Views can be attached.
 *
 * The container can contain two kinds of Views. Host Views, created by instantiating a
 * {@link Component} via {@link #createComponent}, and Embedded Views, created by instantiating an
 * {@link TemplateRef Embedded Template} via {@link #createEmbeddedView}.
 *
 * The location of the View Container within the containing View is specified by the Anchor
 * `element`. Each View Container can have only one Anchor Element and each Anchor Element can only
 * have a single View Container.
 *
 * Root elements of Views attached to this container become siblings of the Anchor Element in
 * the Rendered View.
 *
 * To access a `ViewContainerRef` of an Element, you can either place a {@link Directive} injected
 * with `ViewContainerRef` on the Element, or you obtain it via a {@link ViewChild} query.
 */
var ViewContainerRef = (function () {
    function ViewContainerRef() {
    }
    Object.defineProperty(ViewContainerRef.prototype, "element", {
        /**
         * Anchor element that specifies the location of this container in the containing View.
         * <!-- TODO: rename to anchorElement -->
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewContainerRef.prototype, "length", {
        /**
         * Returns the number of Views currently attached to this container.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    return ViewContainerRef;
}());
exports.ViewContainerRef = ViewContainerRef;
var ViewContainerRef_ = (function () {
    function ViewContainerRef_(_element) {
        this._element = _element;
        /** @internal */
        this._createComponentInContainerScope = profile_1.wtfCreateScope('ViewContainerRef#createComponent()');
        /** @internal */
        this._insertScope = profile_1.wtfCreateScope('ViewContainerRef#insert()');
        /** @internal */
        this._removeScope = profile_1.wtfCreateScope('ViewContainerRef#remove()');
        /** @internal */
        this._detachScope = profile_1.wtfCreateScope('ViewContainerRef#detach()');
    }
    ViewContainerRef_.prototype.get = function (index) { return this._element.nestedViews[index].ref; };
    Object.defineProperty(ViewContainerRef_.prototype, "length", {
        get: function () {
            var views = this._element.nestedViews;
            return lang_1.isPresent(views) ? views.length : 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewContainerRef_.prototype, "element", {
        get: function () { return this._element.elementRef; },
        enumerable: true,
        configurable: true
    });
    // TODO(rado): profile and decide whether bounds checks should be added
    // to the methods below.
    ViewContainerRef_.prototype.createEmbeddedView = function (templateRef, index) {
        if (index === void 0) { index = -1; }
        var viewRef = templateRef.createEmbeddedView();
        this.insert(viewRef, index);
        return viewRef;
    };
    ViewContainerRef_.prototype.createComponent = function (componentFactory, index, dynamicallyCreatedProviders, projectableNodes) {
        if (index === void 0) { index = -1; }
        if (dynamicallyCreatedProviders === void 0) { dynamicallyCreatedProviders = null; }
        if (projectableNodes === void 0) { projectableNodes = null; }
        var s = this._createComponentInContainerScope();
        var contextInjector = this._element.parentInjector;
        var childInjector = lang_1.isPresent(dynamicallyCreatedProviders) && dynamicallyCreatedProviders.length > 0 ?
            new injector_1.Injector_(injector_1.ProtoInjector.fromResolvedProviders(dynamicallyCreatedProviders), contextInjector) :
            contextInjector;
        var componentRef = componentFactory.create(childInjector, projectableNodes);
        this.insert(componentRef.hostView, index);
        return profile_1.wtfLeave(s, componentRef);
    };
    // TODO(i): refactor insert+remove into move
    ViewContainerRef_.prototype.insert = function (viewRef, index) {
        if (index === void 0) { index = -1; }
        var s = this._insertScope();
        if (index == -1)
            index = this.length;
        var viewRef_ = viewRef;
        this._element.attachView(viewRef_.internalView, index);
        return profile_1.wtfLeave(s, viewRef_);
    };
    ViewContainerRef_.prototype.indexOf = function (viewRef) {
        return collection_1.ListWrapper.indexOf(this._element.nestedViews, viewRef.internalView);
    };
    // TODO(i): rename to destroy
    ViewContainerRef_.prototype.remove = function (index) {
        if (index === void 0) { index = -1; }
        var s = this._removeScope();
        if (index == -1)
            index = this.length - 1;
        var view = this._element.detachView(index);
        view.destroy();
        // view is intentionally not returned to the client.
        profile_1.wtfLeave(s);
    };
    // TODO(i): refactor insert+remove into move
    ViewContainerRef_.prototype.detach = function (index) {
        if (index === void 0) { index = -1; }
        var s = this._detachScope();
        if (index == -1)
            index = this.length - 1;
        var view = this._element.detachView(index);
        return profile_1.wtfLeave(s, view.ref);
    };
    ViewContainerRef_.prototype.clear = function () {
        for (var i = this.length - 1; i >= 0; i--) {
            this.remove(i);
        }
    };
    return ViewContainerRef_;
}());
exports.ViewContainerRef_ = ViewContainerRef_;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19jb250YWluZXJfcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC05V25DcTBvMS50bXAvYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfY29udGFpbmVyX3JlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFDM0QsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFDN0QseUJBQWlELCtCQUErQixDQUFDLENBQUE7QUFFakYscUJBQWlDLDBCQUEwQixDQUFDLENBQUE7QUFDNUQsd0JBQW1ELG9CQUFvQixDQUFDLENBQUE7QUFTeEU7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7QUFDSDtJQUFBO0lBOEVBLENBQUM7SUF6RUMsc0JBQUkscUNBQU87UUFKWDs7O1dBR0c7YUFDSCxjQUE0QixNQUFNLENBQWEsMEJBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFlakUsc0JBQUksb0NBQU07UUFIVjs7V0FFRzthQUNILGNBQXVCLE1BQU0sQ0FBUywwQkFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTs7SUEwRDFELHVCQUFDO0FBQUQsQ0FBQyxBQTlFRCxJQThFQztBQTlFcUIsd0JBQWdCLG1CQThFckMsQ0FBQTtBQUVEO0lBQ0UsMkJBQW9CLFFBQW9CO1FBQXBCLGFBQVEsR0FBUixRQUFRLENBQVk7UUFrQnhDLGdCQUFnQjtRQUNoQixxQ0FBZ0MsR0FDNUIsd0JBQWMsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1FBa0J6RCxnQkFBZ0I7UUFDaEIsaUJBQVksR0FBRyx3QkFBYyxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFlM0QsZ0JBQWdCO1FBQ2hCLGlCQUFZLEdBQUcsd0JBQWMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBWTNELGdCQUFnQjtRQUNoQixpQkFBWSxHQUFHLHdCQUFjLENBQUMsMkJBQTJCLENBQUMs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cn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7dW5pbXBsZW1lbnRlZH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7SW5qZWN0b3IsIEluamVjdG9yXywgUHJvdG9JbmplY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvaW5qZWN0b3InO1xuaW1wb3J0IHtSZXNvbHZlZFByb3ZpZGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9wcm92aWRlcic7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7d3RmQ3JlYXRlU2NvcGUsIHd0ZkxlYXZlLCBXdGZTY29wZUZufSBmcm9tICcuLi9wcm9maWxlL3Byb2ZpbGUnO1xuXG5pbXBvcnQge0FwcEVsZW1lbnR9IGZyb20gJy4vZWxlbWVudCc7XG5cbmltcG9ydCB7RWxlbWVudFJlZn0gZnJvbSAnLi9lbGVtZW50X3JlZic7XG5pbXBvcnQge1RlbXBsYXRlUmVmLCBUZW1wbGF0ZVJlZl99IGZyb20gJy4vdGVtcGxhdGVfcmVmJztcbmltcG9ydCB7RW1iZWRkZWRWaWV3UmVmLCBWaWV3UmVmLCBWaWV3UmVmX30gZnJvbSAnLi92aWV3X3JlZic7XG5pbXBvcnQge0NvbXBvbmVudEZhY3RvcnksIENvbXBvbmVudFJlZn0gZnJvbSAnLi9jb21wb25lbnRfZmFjdG9yeSc7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIGNvbnRhaW5lciB3aGVyZSBvbmUgb3IgbW9yZSBWaWV3cyBjYW4gYmUgYXR0YWNoZWQuXG4gKlxuICogVGhlIGNvbnRhaW5lciBjYW4gY29udGFpbiB0d28ga2luZHMgb2YgVmlld3MuIEhvc3QgVmlld3MsIGNyZWF0ZWQgYnkgaW5zdGFudGlhdGluZyBhXG4gKiB7QGxpbmsgQ29tcG9uZW50fSB2aWEge0BsaW5rICNjcmVhdGVDb21wb25lbnR9LCBhbmQgRW1iZWRkZWQgVmlld3MsIGNyZWF0ZWQgYnkgaW5zdGFudGlhdGluZyBhblxuICoge0BsaW5rIFRlbXBsYXRlUmVmIEVtYmVkZGVkIFRlbXBsYXRlfSB2aWEge0BsaW5rICNjcmVhdGVFbWJlZGRlZFZpZXd9LlxuICpcbiAqIFRoZSBsb2NhdGlvbiBvZiB0aGUgVmlldyBDb250YWluZXIgd2l0aGluIHRoZSBjb250YWluaW5nIFZpZXcgaXMgc3BlY2lmaWVkIGJ5IHRoZSBBbmNob3JcbiAqIGBlbGVtZW50YC4gRWFjaCBWaWV3IENvbnRhaW5lciBjYW4gaGF2ZSBvbmx5IG9uZSBBbmNob3IgRWxlbWVudCBhbmQgZWFjaCBBbmNob3IgRWxlbWVudCBjYW4gb25seVxuICogaGF2ZSBhIHNpbmdsZSBWaWV3IENvbnRhaW5lci5cbiAqXG4gKiBSb290IGVsZW1lbnRzIG9mIFZpZXdzIGF0dGFjaGVkIHRvIHRoaXMgY29udGFpbmVyIGJlY29tZSBzaWJsaW5ncyBvZiB0aGUgQW5jaG9yIEVsZW1lbnQgaW5cbiAqIHRoZSBSZW5kZXJlZCBWaWV3LlxuICpcbiAqIFRvIGFjY2VzcyBhIGBWaWV3Q29udGFpbmVyUmVmYCBvZiBhbiBFbGVtZW50LCB5b3UgY2FuIGVpdGhlciBwbGFjZSBhIHtAbGluayBEaXJlY3RpdmV9IGluamVjdGVkXG4gKiB3aXRoIGBWaWV3Q29udGFpbmVyUmVmYCBvbiB0aGUgRWxlbWVudCwgb3IgeW91IG9idGFpbiBpdCB2aWEgYSB7QGxpbmsgVmlld0NoaWxkfSBxdWVyeS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFZpZXdDb250YWluZXJSZWYge1xuICAvKipcbiAgICogQW5jaG9yIGVsZW1lbnQgdGhhdCBzcGVjaWZpZXMgdGhlIGxvY2F0aW9uIG9mIHRoaXMgY29udGFpbmVyIGluIHRoZSBjb250YWluaW5nIFZpZXcuXG4gICAqIDwhLS0gVE9ETzogcmVuYW1lIHRvIGFuY2hvckVsZW1lbnQgLS0+XG4gICAqL1xuICBnZXQgZWxlbWVudCgpOiBFbGVtZW50UmVmIHsgcmV0dXJuIDxFbGVtZW50UmVmPnVuaW1wbGVtZW50ZWQoKTsgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyBhbGwgVmlld3MgaW4gdGhpcyBjb250YWluZXIuXG4gICAqL1xuICBhYnN0cmFjdCBjbGVhcigpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB7QGxpbmsgVmlld1JlZn0gZm9yIHRoZSBWaWV3IGxvY2F0ZWQgaW4gdGhpcyBjb250YWluZXIgYXQgdGhlIHNwZWNpZmllZCBpbmRleC5cbiAgICovXG4gIGFic3RyYWN0IGdldChpbmRleDogbnVtYmVyKTogVmlld1JlZjtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIFZpZXdzIGN1cnJlbnRseSBhdHRhY2hlZCB0byB0aGlzIGNvbnRhaW5lci5cbiAgICovXG4gIGdldCBsZW5ndGgoKTogbnVtYmVyIHsgcmV0dXJuIDxudW1iZXI+dW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBJbnN0YW50aWF0ZXMgYW4gRW1iZWRkZWQgVmlldyBiYXNlZCBvbiB0aGUge0BsaW5rIFRlbXBsYXRlUmVmIGB0ZW1wbGF0ZVJlZmB9IGFuZCBpbnNlcnRzIGl0XG4gICAqIGludG8gdGhpcyBjb250YWluZXIgYXQgdGhlIHNwZWNpZmllZCBgaW5kZXhgLlxuICAgKlxuICAgKiBJZiBgaW5kZXhgIGlzIG5vdCBzcGVjaWZpZWQsIHRoZSBuZXcgVmlldyB3aWxsIGJlIGluc2VydGVkIGFzIHRoZSBsYXN0IFZpZXcgaW4gdGhlIGNvbnRhaW5lci5cbiAgICpcbiAgICogUmV0dXJucyB0aGUge0BsaW5rIFZpZXdSZWZ9IGZvciB0aGUgbmV3bHkgY3JlYXRlZCBWaWV3LlxuICAgKi9cbiAgYWJzdHJhY3QgY3JlYXRlRW1iZWRkZWRWaWV3KHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZiwgaW5kZXg/OiBudW1iZXIpOiBFbWJlZGRlZFZpZXdSZWY7XG5cbiAgLyoqXG4gICAqIEluc3RhbnRpYXRlcyBhIHNpbmdsZSB7QGxpbmsgQ29tcG9uZW50fSBhbmQgaW5zZXJ0cyBpdHMgSG9zdCBWaWV3IGludG8gdGhpcyBjb250YWluZXIgYXQgdGhlXG4gICAqIHNwZWNpZmllZCBgaW5kZXhgLlxuICAgKlxuICAgKiBUaGUgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCB1c2luZyBpdHMge0BsaW5rIFByb3RvVmlld1JlZiBgcHJvdG9WaWV3YH0gd2hpY2ggY2FuIGJlXG4gICAqIG9idGFpbmVkIHZpYSB7QGxpbmsgQ29tcGlsZXIjY29tcGlsZUluSG9zdH0uXG4gICAqXG4gICAqIElmIGBpbmRleGAgaXMgbm90IHNwZWNpZmllZCwgdGhlIG5ldyBWaWV3IHdpbGwgYmUgaW5zZXJ0ZWQgYXMgdGhlIGxhc3QgVmlldyBpbiB0aGUgY29udGFpbmVyLlxuICAgKlxuICAgKiBZb3UgY2FuIG9wdGlvbmFsbHkgc3BlY2lmeSBgZHluYW1pY2FsbHlDcmVhdGVkUHJvdmlkZXJzYCwgd2hpY2ggY29uZmlndXJlIHRoZSB7QGxpbmsgSW5qZWN0b3J9XG4gICAqIHRoYXQgd2lsbCBiZSBjcmVhdGVkIGZvciB0aGUgSG9zdCBWaWV3LlxuICAgKlxuICAgKiBSZXR1cm5zIHRoZSB7QGxpbmsgQ29tcG9uZW50UmVmfSBvZiB0aGUgSG9zdCBWaWV3IGNyZWF0ZWQgZm9yIHRoZSBuZXdseSBpbnN0YW50aWF0ZWQgQ29tcG9uZW50LlxuICAgKi9cbiAgYWJzdHJhY3QgY3JlYXRlQ29tcG9uZW50KGNvbXBvbmVudEZhY3Rvcnk6IENvbXBvbmVudEZhY3RvcnksIGluZGV4PzogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgZHluYW1pY2FsbHlDcmVhdGVkUHJvdmlkZXJzPzogUmVzb2x2ZWRQcm92aWRlcltdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdGFibGVOb2Rlcz86IGFueVtdW10pOiBDb21wb25lbnRSZWY7XG5cbiAgLyoqXG4gICAqIEluc2VydHMgYSBWaWV3IGlkZW50aWZpZWQgYnkgYSB7QGxpbmsgVmlld1JlZn0gaW50byB0aGUgY29udGFpbmVyIGF0IHRoZSBzcGVjaWZpZWQgYGluZGV4YC5cbiAgICpcbiAgICogSWYgYGluZGV4YCBpcyBub3Qgc3BlY2lmaWVkLCB0aGUgbmV3IFZpZXcgd2lsbCBiZSBpbnNlcnRlZCBhcyB0aGUgbGFzdCBWaWV3IGluIHRoZSBjb250YWluZXIuXG4gICAqXG4gICAqIFJldHVybnMgdGhlIGluc2VydGVkIHtAbGluayBWaWV3UmVmfS5cbiAgICovXG4gIGFic3RyYWN0IGluc2VydCh2aWV3UmVmOiBWaWV3UmVmLCBpbmRleD86IG51bWJlcik6IFZpZXdSZWY7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBWaWV3LCBzcGVjaWZpZWQgdmlhIHtAbGluayBWaWV3UmVmfSwgd2l0aGluIHRoZSBjdXJyZW50IGNvbnRhaW5lciBvclxuICAgKiBgLTFgIGlmIHRoaXMgY29udGFpbmVyIGRvZXNuJ3QgY29udGFpbiB0aGUgVmlldy5cbiAgICovXG4gIGFic3RyYWN0IGluZGV4T2Yodmlld1JlZjogVmlld1JlZik6IG51bWJlcjtcblxuICAvKipcbiAgICogRGVzdHJveXMgYSBWaWV3IGF0dGFjaGVkIHRvIHRoaXMgY29udGFpbmVyIGF0IHRoZSBzcGVjaWZpZWQgYGluZGV4YC5cbiAgICpcbiAgICogSWYgYGluZGV4YCBpcyBub3Qgc3BlY2lmaWVkLCB0aGUgbGFzdCBWaWV3IGluIHRoZSBjb250YWluZXIgd2lsbCBiZSByZW1vdmVkLlxuICAgKi9cbiAgYWJzdHJhY3QgcmVtb3ZlKGluZGV4PzogbnVtYmVyKTogdm9pZDtcblxuICAvKipcbiAgICogVXNlIGFsb25nIHdpdGgge0BsaW5rICNpbnNlcnR9IHRvIG1vdmUgYSBWaWV3IHdpdGhpbiB0aGUgY3VycmVudCBjb250YWluZXIuXG4gICAqXG4gICAqIElmIHRoZSBgaW5kZXhgIHBhcmFtIGlzIG9taXR0ZWQsIHRoZSBsYXN0IHtAbGluayBWaWV3UmVmfSBpcyBkZXRhY2hlZC5cbiAgICovXG4gIGFic3RyYWN0IGRldGFjaChpbmRleD86IG51bWJlcik6IFZpZXdSZWY7XG59XG5cbmV4cG9ydCBjbGFzcyBWaWV3Q29udGFpbmVyUmVmXyBpbXBsZW1lbnRzIFZpZXdDb250YWluZXJSZWYge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9lbGVtZW50OiBBcHBFbGVtZW50KSB7fVxuXG4gIGdldChpbmRleDogbnVtYmVyKTogRW1iZWRkZWRWaWV3UmVmIHsgcmV0dXJuIHRoaXMuX2VsZW1lbnQubmVzdGVkVmlld3NbaW5kZXhdLnJlZjsgfVxuICBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgdmFyIHZpZXdzID0gdGhpcy5fZWxlbWVudC5uZXN0ZWRWaWV3cztcbiAgICByZXR1cm4gaXNQcmVzZW50KHZpZXdzKSA/IHZpZXdzLmxlbmd0aCA6IDA7XG4gIH1cblxuICBnZXQgZWxlbWVudCgpOiBFbGVtZW50UmVmIHsgcmV0dXJuIHRoaXMuX2VsZW1lbnQuZWxlbWVudFJlZjsgfVxuXG4gIC8vIFRPRE8ocmFkbyk6IHByb2ZpbGUgYW5kIGRlY2lkZSB3aGV0aGVyIGJvdW5kcyBjaGVja3Mgc2hvdWxkIGJlIGFkZGVkXG4gIC8vIHRvIHRoZSBtZXRob2RzIGJlbG93LlxuICBjcmVhdGVFbWJlZGRlZFZpZXcodGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmLCBpbmRleDogbnVtYmVyID0gLTEpOiBFbWJlZGRlZFZpZXdSZWYge1xuICAgIHZhciB2aWV3UmVmOiBFbWJlZGRlZFZpZXdSZWYgPSB0ZW1wbGF0ZVJlZi5jcmVhdGVFbWJlZGRlZFZpZXcoKTtcbiAgICB0aGlzLmluc2VydCh2aWV3UmVmLCBpbmRleCk7XG4gICAgcmV0dXJuIHZpZXdSZWY7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9jcmVhdGVDb21wb25lbnRJbkNvbnRhaW5lclNjb3BlOiBXdGZTY29wZUZuID1cbiAgICAgIHd0ZkNyZWF0ZVNjb3BlKCdWaWV3Q29udGFpbmVyUmVmI2NyZWF0ZUNvbXBvbmVudCgpJyk7XG5cbiAgY3JlYXRlQ29tcG9uZW50KGNvbXBvbmVudEZhY3Rvcnk6IENvbXBvbmVudEZhY3RvcnksIGluZGV4OiBudW1iZXIgPSAtMSxcbiAgICAgICAgICAgICAgICAgIGR5bmFtaWNhbGx5Q3JlYXRlZFByb3ZpZGVyczogUmVzb2x2ZWRQcm92aWRlcltdID0gbnVsbCxcbiAgICAgICAgICAgICAgICAgIHByb2plY3RhYmxlTm9kZXM6IGFueVtdW10gPSBudWxsKTogQ29tcG9uZW50UmVmIHtcbiAgICB2YXIgcyA9IHRoaXMuX2NyZWF0ZUNvbXBvbmVudEluQ29udGFpbmVyU2NvcGUoKTtcbiAgICB2YXIgY29udGV4dEluamVjdG9yID0gdGhpcy5fZWxlbWVudC5wYXJlbnRJbmplY3RvcjtcblxuICAgIHZhciBjaGlsZEluamVjdG9yID1cbiAgICAgICAgaXNQcmVzZW50KGR5bmFtaWNhbGx5Q3JlYXRlZFByb3ZpZGVycykgJiYgZHluYW1pY2FsbHlDcmVhdGVkUHJvdmlkZXJzLmxlbmd0aCA+IDAgP1xuICAgICAgICAgICAgbmV3IEluamVjdG9yXyhQcm90b0luamVjdG9yLmZyb21SZXNvbHZlZFByb3ZpZGVycyhkeW5hbWljYWxseUNyZWF0ZWRQcm92aWRlcnMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0SW5qZWN0b3IpIDpcbiAgICAgICAgICAgIGNvbnRleHRJbmplY3RvcjtcbiAgICB2YXIgY29tcG9uZW50UmVmID0gY29tcG9uZW50RmFjdG9yeS5jcmVhdGUoY2hpbGRJbmplY3RvciwgcHJvamVjdGFibGVOb2Rlcyk7XG4gICAgdGhpcy5pbnNlcnQoY29tcG9uZW50UmVmLmhvc3RWaWV3LCBpbmRleCk7XG4gICAgcmV0dXJuIHd0ZkxlYXZlKHMsIGNvbXBvbmVudFJlZik7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9pbnNlcnRTY29wZSA9IHd0ZkNyZWF0ZVNjb3BlKCdWaWV3Q29udGFpbmVyUmVmI2luc2VydCgpJyk7XG5cbiAgLy8gVE9ETyhpKTogcmVmYWN0b3IgaW5zZXJ0K3JlbW92ZSBpbnRvIG1vdmVcbiAgaW5zZXJ0KHZpZXdSZWY6IFZpZXdSZWYsIGluZGV4OiBudW1iZXIgPSAtMSk6IFZpZXdSZWYge1xuICAgIHZhciBzID0gdGhpcy5faW5zZXJ0U2NvcGUoKTtcbiAgICBpZiAoaW5kZXggPT0gLTEpIGluZGV4ID0gdGhpcy5sZW5ndGg7XG4gICAgdmFyIHZpZXdSZWZfID0gPFZpZXdSZWZfPnZpZXdSZWY7XG4gICAgdGhpcy5fZWxlbWVudC5hdHRhY2hWaWV3KHZpZXdSZWZfLmludGVybmFsVmlldywgaW5kZXgpO1xuICAgIHJldHVybiB3dGZMZWF2ZShzLCB2aWV3UmVmXyk7XG4gIH1cblxuICBpbmRleE9mKHZpZXdSZWY6IFZpZXdSZWYpOiBudW1iZXIge1xuICAgIHJldHVybiBMaXN0V3JhcHBlci5pbmRleE9mKHRoaXMuX2VsZW1lbnQubmVzdGVkVmlld3MsICg8Vmlld1JlZl8+dmlld1JlZikuaW50ZXJuYWxWaWV3KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3JlbW92ZVNjb3BlID0gd3RmQ3JlYXRlU2NvcGUoJ1ZpZXdDb250YWluZXJSZWYjcmVtb3ZlKCknKTtcblxuICAvLyBUT0RPKGkpOiByZW5hbWUgdG8gZGVzdHJveVxuICByZW1vdmUoaW5kZXg6IG51bWJlciA9IC0xKTogdm9pZCB7XG4gICAgdmFyIHMgPSB0aGlzLl9yZW1vdmVTY29wZSgpO1xuICAgIGlmIChpbmRleCA9PSAtMSkgaW5kZXggPSB0aGlzLmxlbmd0aCAtIDE7XG4gICAgdmFyIHZpZXcgPSB0aGlzLl9lbGVtZW50LmRldGFjaFZpZXcoaW5kZXgpO1xuICAgIHZpZXcuZGVzdHJveSgpO1xuICAgIC8vIHZpZXcgaXMgaW50ZW50aW9uYWxseSBub3QgcmV0dXJuZWQgdG8gdGhlIGNsaWVudC5cbiAgICB3dGZMZWF2ZShzKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2RldGFjaFNjb3BlID0gd3RmQ3JlYXRlU2NvcGUoJ1ZpZXdDb250YWluZXJSZWYjZGV0YWNoKCknKTtcblxuICAvLyBUT0RPKGkpOiByZWZhY3RvciBpbnNlcnQrcmVtb3ZlIGludG8gbW92ZVxuICBkZXRhY2goaW5kZXg6IG51bWJlciA9IC0xKTogVmlld1JlZiB7XG4gICAgdmFyIHMgPSB0aGlzLl9kZXRhY2hTY29wZSgpO1xuICAgIGlmIChpbmRleCA9PSAtMSkgaW5kZXggPSB0aGlzLmxlbmd0aCAtIDE7XG4gICAgdmFyIHZpZXcgPSB0aGlzLl9lbGVtZW50LmRldGFjaFZpZXcoaW5kZXgpO1xuICAgIHJldHVybiB3dGZMZWF2ZShzLCB2aWV3LnJlZik7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICBmb3IgKHZhciBpID0gdGhpcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgdGhpcy5yZW1vdmUoaSk7XG4gICAgfVxuICB9XG59XG4iXX0=