'use strict';"use strict";
var collection_1 = require('angular2/src/facade/collection');
var exceptions_1 = require('angular2/src/facade/exceptions');
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
    Object.defineProperty(ViewContainerRef.prototype, "injector", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewContainerRef.prototype, "parentInjector", {
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
    Object.defineProperty(ViewContainerRef_.prototype, "injector", {
        get: function () { return this._element.injector; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewContainerRef_.prototype, "parentInjector", {
        get: function () { return this._element.parentInjector; },
        enumerable: true,
        configurable: true
    });
    // TODO(rado): profile and decide whether bounds checks should be added
    // to the methods below.
    // TODO(tbosch): use a generic C once ts2dart supports it.
    ViewContainerRef_.prototype.createEmbeddedView = function (templateRef, context, index) {
        if (context === void 0) { context = null; }
        if (index === void 0) { index = -1; }
        var viewRef = templateRef.createEmbeddedView(context);
        this.insert(viewRef, index);
        return viewRef;
    };
    ViewContainerRef_.prototype.createComponent = function (componentFactory, index, injector, projectableNodes) {
        if (index === void 0) { index = -1; }
        if (injector === void 0) { injector = null; }
        if (projectableNodes === void 0) { projectableNodes = null; }
        var s = this._createComponentInContainerScope();
        var contextInjector = lang_1.isPresent(injector) ? injector : this._element.parentInjector;
        var componentRef = componentFactory.create(contextInjector, projectableNodes);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19jb250YWluZXJfcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1XNVZnS25CRi50bXAvYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfY29udGFpbmVyX3JlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFDM0QsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFFN0QscUJBQWlDLDBCQUEwQixDQUFDLENBQUE7QUFDNUQsd0JBQW1ELG9CQUFvQixDQUFDLENBQUE7QUFTeEU7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7QUFDSDtJQUFBO0lBa0ZBLENBQUM7SUE3RUMsc0JBQUkscUNBQU87UUFKWDs7O1dBR0c7YUFDSCxjQUE0QixNQUFNLENBQWEsMEJBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFFakUsc0JBQUksc0NBQVE7YUFBWixjQUEyQixNQUFNLENBQVcsMEJBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFFOUQsc0JBQUksNENBQWM7YUFBbEIsY0FBaUMsTUFBTSxDQUFXLDBCQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBZXBFLHNCQUFJLG9DQUFNO1FBSFY7O1dBRUc7YUFDSCxjQUF1QixNQUFNLENBQVMsMEJBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7O0lBMEQxRCx1QkFBQztBQUFELENBQUMsQUFsRkQsSUFrRkM7QUFsRnFCLHdCQUFnQixtQkFrRnJDLENBQUE7QUFFRDtJQUNFLDJCQUFvQixRQUFvQjtRQUFwQixhQUFRLEdBQVIsUUFBUSxDQUFZO1FBd0J4QyxnQkFBZ0I7UUFDaEIscUNBQWdDLEdBQzVCLHdCQUFjLENBQUMsb0NBQW9DLENBQUMsQ0FBQztRQVd6RCxnQkFBZ0I7UUFDaEIsaUJBQVksR0FBRyx3QkFBYyxDQUFDLDJCQUEyQixDQUFDLENB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R0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakIsQ0FBQztJQUNILENBQUM7SUFDSCx3QkFBQztBQUFELENBQUMsQUFuRkQsSUFtRkM7QUFuRlkseUJBQWlCLG9CQW1GN0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge3VuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0luamVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9pbmplY3Rvcic7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7d3RmQ3JlYXRlU2NvcGUsIHd0ZkxlYXZlLCBXdGZTY29wZUZufSBmcm9tICcuLi9wcm9maWxlL3Byb2ZpbGUnO1xuXG5pbXBvcnQge0FwcEVsZW1lbnR9IGZyb20gJy4vZWxlbWVudCc7XG5cbmltcG9ydCB7RWxlbWVudFJlZn0gZnJvbSAnLi9lbGVtZW50X3JlZic7XG5pbXBvcnQge1RlbXBsYXRlUmVmLCBUZW1wbGF0ZVJlZl99IGZyb20gJy4vdGVtcGxhdGVfcmVmJztcbmltcG9ydCB7RW1iZWRkZWRWaWV3UmVmLCBWaWV3UmVmLCBWaWV3UmVmX30gZnJvbSAnLi92aWV3X3JlZic7XG5pbXBvcnQge0NvbXBvbmVudEZhY3RvcnksIENvbXBvbmVudFJlZn0gZnJvbSAnLi9jb21wb25lbnRfZmFjdG9yeSc7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIGNvbnRhaW5lciB3aGVyZSBvbmUgb3IgbW9yZSBWaWV3cyBjYW4gYmUgYXR0YWNoZWQuXG4gKlxuICogVGhlIGNvbnRhaW5lciBjYW4gY29udGFpbiB0d28ga2luZHMgb2YgVmlld3MuIEhvc3QgVmlld3MsIGNyZWF0ZWQgYnkgaW5zdGFudGlhdGluZyBhXG4gKiB7QGxpbmsgQ29tcG9uZW50fSB2aWEge0BsaW5rICNjcmVhdGVDb21wb25lbnR9LCBhbmQgRW1iZWRkZWQgVmlld3MsIGNyZWF0ZWQgYnkgaW5zdGFudGlhdGluZyBhblxuICoge0BsaW5rIFRlbXBsYXRlUmVmIEVtYmVkZGVkIFRlbXBsYXRlfSB2aWEge0BsaW5rICNjcmVhdGVFbWJlZGRlZFZpZXd9LlxuICpcbiAqIFRoZSBsb2NhdGlvbiBvZiB0aGUgVmlldyBDb250YWluZXIgd2l0aGluIHRoZSBjb250YWluaW5nIFZpZXcgaXMgc3BlY2lmaWVkIGJ5IHRoZSBBbmNob3JcbiAqIGBlbGVtZW50YC4gRWFjaCBWaWV3IENvbnRhaW5lciBjYW4gaGF2ZSBvbmx5IG9uZSBBbmNob3IgRWxlbWVudCBhbmQgZWFjaCBBbmNob3IgRWxlbWVudCBjYW4gb25seVxuICogaGF2ZSBhIHNpbmdsZSBWaWV3IENvbnRhaW5lci5cbiAqXG4gKiBSb290IGVsZW1lbnRzIG9mIFZpZXdzIGF0dGFjaGVkIHRvIHRoaXMgY29udGFpbmVyIGJlY29tZSBzaWJsaW5ncyBvZiB0aGUgQW5jaG9yIEVsZW1lbnQgaW5cbiAqIHRoZSBSZW5kZXJlZCBWaWV3LlxuICpcbiAqIFRvIGFjY2VzcyBhIGBWaWV3Q29udGFpbmVyUmVmYCBvZiBhbiBFbGVtZW50LCB5b3UgY2FuIGVpdGhlciBwbGFjZSBhIHtAbGluayBEaXJlY3RpdmV9IGluamVjdGVkXG4gKiB3aXRoIGBWaWV3Q29udGFpbmVyUmVmYCBvbiB0aGUgRWxlbWVudCwgb3IgeW91IG9idGFpbiBpdCB2aWEgYSB7QGxpbmsgVmlld0NoaWxkfSBxdWVyeS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFZpZXdDb250YWluZXJSZWYge1xuICAvKipcbiAgICogQW5jaG9yIGVsZW1lbnQgdGhhdCBzcGVjaWZpZXMgdGhlIGxvY2F0aW9uIG9mIHRoaXMgY29udGFpbmVyIGluIHRoZSBjb250YWluaW5nIFZpZXcuXG4gICAqIDwhLS0gVE9ETzogcmVuYW1lIHRvIGFuY2hvckVsZW1lbnQgLS0+XG4gICAqL1xuICBnZXQgZWxlbWVudCgpOiBFbGVtZW50UmVmIHsgcmV0dXJuIDxFbGVtZW50UmVmPnVuaW1wbGVtZW50ZWQoKTsgfVxuXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiA8SW5qZWN0b3I+dW5pbXBsZW1lbnRlZCgpOyB9XG5cbiAgZ2V0IHBhcmVudEluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIDxJbmplY3Rvcj51bmltcGxlbWVudGVkKCk7IH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYWxsIFZpZXdzIGluIHRoaXMgY29udGFpbmVyLlxuICAgKi9cbiAgYWJzdHJhY3QgY2xlYXIoKTogdm9pZDtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUge0BsaW5rIFZpZXdSZWZ9IGZvciB0aGUgVmlldyBsb2NhdGVkIGluIHRoaXMgY29udGFpbmVyIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXguXG4gICAqL1xuICBhYnN0cmFjdCBnZXQoaW5kZXg6IG51bWJlcik6IFZpZXdSZWY7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBWaWV3cyBjdXJyZW50bHkgYXR0YWNoZWQgdG8gdGhpcyBjb250YWluZXIuXG4gICAqL1xuICBnZXQgbGVuZ3RoKCk6IG51bWJlciB7IHJldHVybiA8bnVtYmVyPnVuaW1wbGVtZW50ZWQoKTsgfTtcblxuICAvKipcbiAgICogSW5zdGFudGlhdGVzIGFuIEVtYmVkZGVkIFZpZXcgYmFzZWQgb24gdGhlIHtAbGluayBUZW1wbGF0ZVJlZiBgdGVtcGxhdGVSZWZgfSBhbmQgaW5zZXJ0cyBpdFxuICAgKiBpbnRvIHRoaXMgY29udGFpbmVyIGF0IHRoZSBzcGVjaWZpZWQgYGluZGV4YC5cbiAgICpcbiAgICogSWYgYGluZGV4YCBpcyBub3Qgc3BlY2lmaWVkLCB0aGUgbmV3IFZpZXcgd2lsbCBiZSBpbnNlcnRlZCBhcyB0aGUgbGFzdCBWaWV3IGluIHRoZSBjb250YWluZXIuXG4gICAqXG4gICAqIFJldHVybnMgdGhlIHtAbGluayBWaWV3UmVmfSBmb3IgdGhlIG5ld2x5IGNyZWF0ZWQgVmlldy5cbiAgICovXG4gIC8vIFRPRE8odGJvc2NoKTogVXNlIGEgZ2VuZXJpYyBvbmNlIHRzMmRhcnQgc3VwcG9ydHMgaXQuXG4gIGFic3RyYWN0IGNyZWF0ZUVtYmVkZGVkVmlldyh0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8YW55PiwgY29udGV4dD86IGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4PzogbnVtYmVyKTogRW1iZWRkZWRWaWV3UmVmPGFueT47XG5cbiAgLyoqXG4gICAqIEluc3RhbnRpYXRlcyBhIHNpbmdsZSB7QGxpbmsgQ29tcG9uZW50fSBhbmQgaW5zZXJ0cyBpdHMgSG9zdCBWaWV3IGludG8gdGhpcyBjb250YWluZXIgYXQgdGhlXG4gICAqIHNwZWNpZmllZCBgaW5kZXhgLlxuICAgKlxuICAgKiBUaGUgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCB1c2luZyBpdHMge0BsaW5rIENvbXBvbmVudEZhY3Rvcnl9IHdoaWNoIGNhbiBiZVxuICAgKiBvYnRhaW5lZCB2aWEge0BsaW5rIENvbXBvbmVudFJlc29sdmVyI3Jlc29sdmVDb21wb25lbnR9LlxuICAgKlxuICAgKiBJZiBgaW5kZXhgIGlzIG5vdCBzcGVjaWZpZWQsIHRoZSBuZXcgVmlldyB3aWxsIGJlIGluc2VydGVkIGFzIHRoZSBsYXN0IFZpZXcgaW4gdGhlIGNvbnRhaW5lci5cbiAgICpcbiAgICogWW91IGNhbiBvcHRpb25hbGx5IHNwZWNpZnkgdGhlIHtAbGluayBJbmplY3Rvcn0gdGhhdCB3aWxsIGJlIHVzZWQgYXMgcGFyZW50IGZvciB0aGUgQ29tcG9uZW50LlxuICAgKlxuICAgKiBSZXR1cm5zIHRoZSB7QGxpbmsgQ29tcG9uZW50UmVmfSBvZiB0aGUgSG9zdCBWaWV3IGNyZWF0ZWQgZm9yIHRoZSBuZXdseSBpbnN0YW50aWF0ZWQgQ29tcG9uZW50LlxuICAgKi9cbiAgYWJzdHJhY3QgY3JlYXRlQ29tcG9uZW50KGNvbXBvbmVudEZhY3Rvcnk6IENvbXBvbmVudEZhY3RvcnksIGluZGV4PzogbnVtYmVyLCBpbmplY3Rvcj86IEluamVjdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdGFibGVOb2Rlcz86IGFueVtdW10pOiBDb21wb25lbnRSZWY7XG5cbiAgLyoqXG4gICAqIEluc2VydHMgYSBWaWV3IGlkZW50aWZpZWQgYnkgYSB7QGxpbmsgVmlld1JlZn0gaW50byB0aGUgY29udGFpbmVyIGF0IHRoZSBzcGVjaWZpZWQgYGluZGV4YC5cbiAgICpcbiAgICogSWYgYGluZGV4YCBpcyBub3Qgc3BlY2lmaWVkLCB0aGUgbmV3IFZpZXcgd2lsbCBiZSBpbnNlcnRlZCBhcyB0aGUgbGFzdCBWaWV3IGluIHRoZSBjb250YWluZXIuXG4gICAqXG4gICAqIFJldHVybnMgdGhlIGluc2VydGVkIHtAbGluayBWaWV3UmVmfS5cbiAgICovXG4gIGFic3RyYWN0IGluc2VydCh2aWV3UmVmOiBWaWV3UmVmLCBpbmRleD86IG51bWJlcik6IFZpZXdSZWY7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBWaWV3LCBzcGVjaWZpZWQgdmlhIHtAbGluayBWaWV3UmVmfSwgd2l0aGluIHRoZSBjdXJyZW50IGNvbnRhaW5lciBvclxuICAgKiBgLTFgIGlmIHRoaXMgY29udGFpbmVyIGRvZXNuJ3QgY29udGFpbiB0aGUgVmlldy5cbiAgICovXG4gIGFic3RyYWN0IGluZGV4T2Yodmlld1JlZjogVmlld1JlZik6IG51bWJlcjtcblxuICAvKipcbiAgICogRGVzdHJveXMgYSBWaWV3IGF0dGFjaGVkIHRvIHRoaXMgY29udGFpbmVyIGF0IHRoZSBzcGVjaWZpZWQgYGluZGV4YC5cbiAgICpcbiAgICogSWYgYGluZGV4YCBpcyBub3Qgc3BlY2lmaWVkLCB0aGUgbGFzdCBWaWV3IGluIHRoZSBjb250YWluZXIgd2lsbCBiZSByZW1vdmVkLlxuICAgKi9cbiAgYWJzdHJhY3QgcmVtb3ZlKGluZGV4PzogbnVtYmVyKTogdm9pZDtcblxuICAvKipcbiAgICogVXNlIGFsb25nIHdpdGgge0BsaW5rICNpbnNlcnR9IHRvIG1vdmUgYSBWaWV3IHdpdGhpbiB0aGUgY3VycmVudCBjb250YWluZXIuXG4gICAqXG4gICAqIElmIHRoZSBgaW5kZXhgIHBhcmFtIGlzIG9taXR0ZWQsIHRoZSBsYXN0IHtAbGluayBWaWV3UmVmfSBpcyBkZXRhY2hlZC5cbiAgICovXG4gIGFic3RyYWN0IGRldGFjaChpbmRleD86IG51bWJlcik6IFZpZXdSZWY7XG59XG5cbmV4cG9ydCBjbGFzcyBWaWV3Q29udGFpbmVyUmVmXyBpbXBsZW1lbnRzIFZpZXdDb250YWluZXJSZWYge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9lbGVtZW50OiBBcHBFbGVtZW50KSB7fVxuXG4gIGdldChpbmRleDogbnVtYmVyKTogVmlld1JlZiB7IHJldHVybiB0aGlzLl9lbGVtZW50Lm5lc3RlZFZpZXdzW2luZGV4XS5yZWY7IH1cbiAgZ2V0IGxlbmd0aCgpOiBudW1iZXIge1xuICAgIHZhciB2aWV3cyA9IHRoaXMuX2VsZW1lbnQubmVzdGVkVmlld3M7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh2aWV3cykgPyB2aWV3cy5sZW5ndGggOiAwO1xuICB9XG5cbiAgZ2V0IGVsZW1lbnQoKTogRWxlbWVudFJlZiB7IHJldHVybiB0aGlzLl9lbGVtZW50LmVsZW1lbnRSZWY7IH1cblxuICBnZXQgaW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gdGhpcy5fZWxlbWVudC5pbmplY3RvcjsgfVxuXG4gIGdldCBwYXJlbnRJbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLl9lbGVtZW50LnBhcmVudEluamVjdG9yOyB9XG5cbiAgLy8gVE9ETyhyYWRvKTogcHJvZmlsZSBhbmQgZGVjaWRlIHdoZXRoZXIgYm91bmRzIGNoZWNrcyBzaG91bGQgYmUgYWRkZWRcbiAgLy8gdG8gdGhlIG1ldGhvZHMgYmVsb3cuXG4gIC8vIFRPRE8odGJvc2NoKTogdXNlIGEgZ2VuZXJpYyBDIG9uY2UgdHMyZGFydCBzdXBwb3J0cyBpdC5cbiAgY3JlYXRlRW1iZWRkZWRWaWV3KHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxhbnk+LCBjb250ZXh0OiBhbnkgPSBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgaW5kZXg6IG51bWJlciA9IC0xKTogRW1iZWRkZWRWaWV3UmVmPGFueT4ge1xuICAgIHZhciB2aWV3UmVmOiBFbWJlZGRlZFZpZXdSZWY8YW55PiA9IHRlbXBsYXRlUmVmLmNyZWF0ZUVtYmVkZGVkVmlldyhjb250ZXh0KTtcbiAgICB0aGlzLmluc2VydCh2aWV3UmVmLCBpbmRleCk7XG4gICAgcmV0dXJuIHZpZXdSZWY7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9jcmVhdGVDb21wb25lbnRJbkNvbnRhaW5lclNjb3BlOiBXdGZTY29wZUZuID1cbiAgICAgIHd0ZkNyZWF0ZVNjb3BlKCdWaWV3Q29udGFpbmVyUmVmI2NyZWF0ZUNvbXBvbmVudCgpJyk7XG5cbiAgY3JlYXRlQ29tcG9uZW50KGNvbXBvbmVudEZhY3Rvcnk6IENvbXBvbmVudEZhY3RvcnksIGluZGV4OiBudW1iZXIgPSAtMSwgaW5qZWN0b3I6IEluamVjdG9yID0gbnVsbCxcbiAgICAgICAgICAgICAgICAgIHByb2plY3RhYmxlTm9kZXM6IGFueVtdW10gPSBudWxsKTogQ29tcG9uZW50UmVmIHtcbiAgICB2YXIgcyA9IHRoaXMuX2NyZWF0ZUNvbXBvbmVudEluQ29udGFpbmVyU2NvcGUoKTtcbiAgICB2YXIgY29udGV4dEluamVjdG9yID0gaXNQcmVzZW50KGluamVjdG9yKSA/IGluamVjdG9yIDogdGhpcy5fZWxlbWVudC5wYXJlbnRJbmplY3RvcjtcbiAgICB2YXIgY29tcG9uZW50UmVmID0gY29tcG9uZW50RmFjdG9yeS5jcmVhdGUoY29udGV4dEluamVjdG9yLCBwcm9qZWN0YWJsZU5vZGVzKTtcbiAgICB0aGlzLmluc2VydChjb21wb25lbnRSZWYuaG9zdFZpZXcsIGluZGV4KTtcbiAgICByZXR1cm4gd3RmTGVhdmUocywgY29tcG9uZW50UmVmKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2luc2VydFNjb3BlID0gd3RmQ3JlYXRlU2NvcGUoJ1ZpZXdDb250YWluZXJSZWYjaW5zZXJ0KCknKTtcblxuICAvLyBUT0RPKGkpOiByZWZhY3RvciBpbnNlcnQrcmVtb3ZlIGludG8gbW92ZVxuICBpbnNlcnQodmlld1JlZjogVmlld1JlZiwgaW5kZXg6IG51bWJlciA9IC0xKTogVmlld1JlZiB7XG4gICAgdmFyIHMgPSB0aGlzLl9pbnNlcnRTY29wZSgpO1xuICAgIGlmIChpbmRleCA9PSAtMSkgaW5kZXggPSB0aGlzLmxlbmd0aDtcbiAgICB2YXIgdmlld1JlZl8gPSA8Vmlld1JlZl88YW55Pj52aWV3UmVmO1xuICAgIHRoaXMuX2VsZW1lbnQuYXR0YWNoVmlldyh2aWV3UmVmXy5pbnRlcm5hbFZpZXcsIGluZGV4KTtcbiAgICByZXR1cm4gd3RmTGVhdmUocywgdmlld1JlZl8pO1xuICB9XG5cbiAgaW5kZXhPZih2aWV3UmVmOiBWaWV3UmVmKTogbnVtYmVyIHtcbiAgICByZXR1cm4gTGlzdFdyYXBwZXIuaW5kZXhPZih0aGlzLl9lbGVtZW50Lm5lc3RlZFZpZXdzLCAoPFZpZXdSZWZfPGFueT4+dmlld1JlZikuaW50ZXJuYWxWaWV3KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3JlbW92ZVNjb3BlID0gd3RmQ3JlYXRlU2NvcGUoJ1ZpZXdDb250YWluZXJSZWYjcmVtb3ZlKCknKTtcblxuICAvLyBUT0RPKGkpOiByZW5hbWUgdG8gZGVzdHJveVxuICByZW1vdmUoaW5kZXg6IG51bWJlciA9IC0xKTogdm9pZCB7XG4gICAgdmFyIHMgPSB0aGlzLl9yZW1vdmVTY29wZSgpO1xuICAgIGlmIChpbmRleCA9PSAtMSkgaW5kZXggPSB0aGlzLmxlbmd0aCAtIDE7XG4gICAgdmFyIHZpZXcgPSB0aGlzLl9lbGVtZW50LmRldGFjaFZpZXcoaW5kZXgpO1xuICAgIHZpZXcuZGVzdHJveSgpO1xuICAgIC8vIHZpZXcgaXMgaW50ZW50aW9uYWxseSBub3QgcmV0dXJuZWQgdG8gdGhlIGNsaWVudC5cbiAgICB3dGZMZWF2ZShzKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2RldGFjaFNjb3BlID0gd3RmQ3JlYXRlU2NvcGUoJ1ZpZXdDb250YWluZXJSZWYjZGV0YWNoKCknKTtcblxuICAvLyBUT0RPKGkpOiByZWZhY3RvciBpbnNlcnQrcmVtb3ZlIGludG8gbW92ZVxuICBkZXRhY2goaW5kZXg6IG51bWJlciA9IC0xKTogVmlld1JlZiB7XG4gICAgdmFyIHMgPSB0aGlzLl9kZXRhY2hTY29wZSgpO1xuICAgIGlmIChpbmRleCA9PSAtMSkgaW5kZXggPSB0aGlzLmxlbmd0aCAtIDE7XG4gICAgdmFyIHZpZXcgPSB0aGlzLl9lbGVtZW50LmRldGFjaFZpZXcoaW5kZXgpO1xuICAgIHJldHVybiB3dGZMZWF2ZShzLCB2aWV3LnJlZik7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICBmb3IgKHZhciBpID0gdGhpcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgdGhpcy5yZW1vdmUoaSk7XG4gICAgfVxuICB9XG59XG4iXX0=