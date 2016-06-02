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
 * {@link Component} via {@link #createHostView}, and Embedded Views, created by instantiating an
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
 * with `ViewContainerRef` on the Element, or you obtain it via
 * {@link AppViewManager#getViewContainer}.
 *
 * <!-- TODO(i): we are also considering ElementRef#viewContainer api -->
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
        this._createEmbeddedViewInContainerScope = profile_1.wtfCreateScope('ViewContainerRef#createEmbeddedView()');
        /** @internal */
        this._createHostViewInContainerScope = profile_1.wtfCreateScope('ViewContainerRef#createHostView()');
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
        get: function () { return this._element.ref; },
        enumerable: true,
        configurable: true
    });
    // TODO(rado): profile and decide whether bounds checks should be added
    // to the methods below.
    ViewContainerRef_.prototype.createEmbeddedView = function (templateRef, index) {
        if (index === void 0) { index = -1; }
        var s = this._createEmbeddedViewInContainerScope();
        if (index == -1)
            index = this.length;
        var templateRef_ = templateRef;
        var view = templateRef_.createEmbeddedView();
        this._element.attachView(view, index);
        return profile_1.wtfLeave(s, view.ref);
    };
    ViewContainerRef_.prototype.createHostView = function (hostViewFactoryRef, index, dynamicallyCreatedProviders, projectableNodes) {
        if (index === void 0) { index = -1; }
        if (dynamicallyCreatedProviders === void 0) { dynamicallyCreatedProviders = null; }
        if (projectableNodes === void 0) { projectableNodes = null; }
        var s = this._createHostViewInContainerScope();
        if (index == -1)
            index = this.length;
        var contextEl = this._element;
        var contextInjector = this._element.parentInjector;
        var hostViewFactory = hostViewFactoryRef.internalHostViewFactory;
        var childInjector = lang_1.isPresent(dynamicallyCreatedProviders) && dynamicallyCreatedProviders.length > 0 ?
            new injector_1.Injector_(injector_1.ProtoInjector.fromResolvedProviders(dynamicallyCreatedProviders), contextInjector) :
            contextInjector;
        var view = hostViewFactory.viewFactory(contextEl.parentView.viewManager, childInjector, contextEl);
        view.create(projectableNodes, null);
        this._element.attachView(view, index);
        return profile_1.wtfLeave(s, view.ref);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19jb250YWluZXJfcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1uRklTam1ocC50bXAvYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfY29udGFpbmVyX3JlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFDM0QsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFDN0QseUJBQWlELCtCQUErQixDQUFDLENBQUE7QUFFakYscUJBQWlDLDBCQUEwQixDQUFDLENBQUE7QUFDNUQsd0JBQW1ELG9CQUFvQixDQUFDLENBQUE7QUFnQnhFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUJHO0FBQ0g7SUFBQTtJQThFQSxDQUFDO0lBekVDLHNCQUFJLHFDQUFPO1FBSlg7OztXQUdHO2FBQ0gsY0FBNEIsTUFBTSxDQUFhLDBCQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBZWpFLHNCQUFJLG9DQUFNO1FBSFY7O1dBRUc7YUFDSCxjQUF1QixNQUFNLENBQVMsMEJBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7O0lBMEQxRCx1QkFBQztBQUFELENBQUMsQUE5RUQsSUE4RUM7QUE5RXFCLHdCQUFnQixtQkE4RXJDLENBQUE7QUFFRDtJQUNFLDJCQUFvQixRQUFvQjtRQUFwQixhQUFRLEdBQVIsUUFBUSxDQUFZO1FBVXhDLGdCQUFnQjtRQUNoQix3Q0FBbUMsR0FDL0Isd0JBQWMsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1FBYTVELGdCQUFnQjtRQUNoQixvQ0FBK0IsR0FBZSx3QkFBYyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7UUF5QmxHLGdCQUFnQjtRQUNoQixpQkFBWSxHQUFHLHdCQUFjLENBQUMsMkJBQTJCLENBQUMsQ0FBQztRQWUzRCxnQkFBZ0I7UUFDaEIsaUJBQVksR0FBRyx3QkFBYyxDQUFDLDJCQUEyQixD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WUFBWSxFQUFFLENBQUM7UUFDNUIsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ3pDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzNDLE1BQU0sQ0FBQyxrQkFBUSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVELGlDQUFLLEdBQUw7UUFDRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDMUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQixDQUFDO0lBQ0gsQ0FBQztJQUNILHdCQUFDO0FBQUQsQ0FBQyxBQWpHRCxJQWlHQztBQWpHWSx5QkFBaUIsb0JBaUc3QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7dW5pbXBsZW1lbnRlZH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7SW5qZWN0b3IsIEluamVjdG9yXywgUHJvdG9JbmplY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvaW5qZWN0b3InO1xuaW1wb3J0IHtSZXNvbHZlZFByb3ZpZGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9wcm92aWRlcic7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7d3RmQ3JlYXRlU2NvcGUsIHd0ZkxlYXZlLCBXdGZTY29wZUZufSBmcm9tICcuLi9wcm9maWxlL3Byb2ZpbGUnO1xuXG5pbXBvcnQge0FwcEVsZW1lbnR9IGZyb20gJy4vZWxlbWVudCc7XG5cbmltcG9ydCB7RWxlbWVudFJlZiwgRWxlbWVudFJlZl99IGZyb20gJy4vZWxlbWVudF9yZWYnO1xuaW1wb3J0IHtUZW1wbGF0ZVJlZiwgVGVtcGxhdGVSZWZffSBmcm9tICcuL3RlbXBsYXRlX3JlZic7XG5pbXBvcnQge1xuICBFbWJlZGRlZFZpZXdSZWYsXG4gIEhvc3RWaWV3UmVmLFxuICBIb3N0Vmlld0ZhY3RvcnlSZWYsXG4gIEhvc3RWaWV3RmFjdG9yeVJlZl8sXG4gIFZpZXdSZWYsXG4gIFZpZXdSZWZfXG59IGZyb20gJy4vdmlld19yZWYnO1xuaW1wb3J0IHtBcHBWaWV3fSBmcm9tICcuL3ZpZXcnO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBjb250YWluZXIgd2hlcmUgb25lIG9yIG1vcmUgVmlld3MgY2FuIGJlIGF0dGFjaGVkLlxuICpcbiAqIFRoZSBjb250YWluZXIgY2FuIGNvbnRhaW4gdHdvIGtpbmRzIG9mIFZpZXdzLiBIb3N0IFZpZXdzLCBjcmVhdGVkIGJ5IGluc3RhbnRpYXRpbmcgYVxuICoge0BsaW5rIENvbXBvbmVudH0gdmlhIHtAbGluayAjY3JlYXRlSG9zdFZpZXd9LCBhbmQgRW1iZWRkZWQgVmlld3MsIGNyZWF0ZWQgYnkgaW5zdGFudGlhdGluZyBhblxuICoge0BsaW5rIFRlbXBsYXRlUmVmIEVtYmVkZGVkIFRlbXBsYXRlfSB2aWEge0BsaW5rICNjcmVhdGVFbWJlZGRlZFZpZXd9LlxuICpcbiAqIFRoZSBsb2NhdGlvbiBvZiB0aGUgVmlldyBDb250YWluZXIgd2l0aGluIHRoZSBjb250YWluaW5nIFZpZXcgaXMgc3BlY2lmaWVkIGJ5IHRoZSBBbmNob3JcbiAqIGBlbGVtZW50YC4gRWFjaCBWaWV3IENvbnRhaW5lciBjYW4gaGF2ZSBvbmx5IG9uZSBBbmNob3IgRWxlbWVudCBhbmQgZWFjaCBBbmNob3IgRWxlbWVudCBjYW4gb25seVxuICogaGF2ZSBhIHNpbmdsZSBWaWV3IENvbnRhaW5lci5cbiAqXG4gKiBSb290IGVsZW1lbnRzIG9mIFZpZXdzIGF0dGFjaGVkIHRvIHRoaXMgY29udGFpbmVyIGJlY29tZSBzaWJsaW5ncyBvZiB0aGUgQW5jaG9yIEVsZW1lbnQgaW5cbiAqIHRoZSBSZW5kZXJlZCBWaWV3LlxuICpcbiAqIFRvIGFjY2VzcyBhIGBWaWV3Q29udGFpbmVyUmVmYCBvZiBhbiBFbGVtZW50LCB5b3UgY2FuIGVpdGhlciBwbGFjZSBhIHtAbGluayBEaXJlY3RpdmV9IGluamVjdGVkXG4gKiB3aXRoIGBWaWV3Q29udGFpbmVyUmVmYCBvbiB0aGUgRWxlbWVudCwgb3IgeW91IG9idGFpbiBpdCB2aWFcbiAqIHtAbGluayBBcHBWaWV3TWFuYWdlciNnZXRWaWV3Q29udGFpbmVyfS5cbiAqXG4gKiA8IS0tIFRPRE8oaSk6IHdlIGFyZSBhbHNvIGNvbnNpZGVyaW5nIEVsZW1lbnRSZWYjdmlld0NvbnRhaW5lciBhcGkgLS0+XG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBWaWV3Q29udGFpbmVyUmVmIHtcbiAgLyoqXG4gICAqIEFuY2hvciBlbGVtZW50IHRoYXQgc3BlY2lmaWVzIHRoZSBsb2NhdGlvbiBvZiB0aGlzIGNvbnRhaW5lciBpbiB0aGUgY29udGFpbmluZyBWaWV3LlxuICAgKiA8IS0tIFRPRE86IHJlbmFtZSB0byBhbmNob3JFbGVtZW50IC0tPlxuICAgKi9cbiAgZ2V0IGVsZW1lbnQoKTogRWxlbWVudFJlZiB7IHJldHVybiA8RWxlbWVudFJlZj51bmltcGxlbWVudGVkKCk7IH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYWxsIFZpZXdzIGluIHRoaXMgY29udGFpbmVyLlxuICAgKi9cbiAgYWJzdHJhY3QgY2xlYXIoKTogdm9pZDtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUge0BsaW5rIFZpZXdSZWZ9IGZvciB0aGUgVmlldyBsb2NhdGVkIGluIHRoaXMgY29udGFpbmVyIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXguXG4gICAqL1xuICBhYnN0cmFjdCBnZXQoaW5kZXg6IG51bWJlcik6IFZpZXdSZWY7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBWaWV3cyBjdXJyZW50bHkgYXR0YWNoZWQgdG8gdGhpcyBjb250YWluZXIuXG4gICAqL1xuICBnZXQgbGVuZ3RoKCk6IG51bWJlciB7IHJldHVybiA8bnVtYmVyPnVuaW1wbGVtZW50ZWQoKTsgfTtcblxuICAvKipcbiAgICogSW5zdGFudGlhdGVzIGFuIEVtYmVkZGVkIFZpZXcgYmFzZWQgb24gdGhlIHtAbGluayBUZW1wbGF0ZVJlZiBgdGVtcGxhdGVSZWZgfSBhbmQgaW5zZXJ0cyBpdFxuICAgKiBpbnRvIHRoaXMgY29udGFpbmVyIGF0IHRoZSBzcGVjaWZpZWQgYGluZGV4YC5cbiAgICpcbiAgICogSWYgYGluZGV4YCBpcyBub3Qgc3BlY2lmaWVkLCB0aGUgbmV3IFZpZXcgd2lsbCBiZSBpbnNlcnRlZCBhcyB0aGUgbGFzdCBWaWV3IGluIHRoZSBjb250YWluZXIuXG4gICAqXG4gICAqIFJldHVybnMgdGhlIHtAbGluayBWaWV3UmVmfSBmb3IgdGhlIG5ld2x5IGNyZWF0ZWQgVmlldy5cbiAgICovXG4gIGFic3RyYWN0IGNyZWF0ZUVtYmVkZGVkVmlldyh0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWYsIGluZGV4PzogbnVtYmVyKTogRW1iZWRkZWRWaWV3UmVmO1xuXG4gIC8qKlxuICAgKiBJbnN0YW50aWF0ZXMgYSBzaW5nbGUge0BsaW5rIENvbXBvbmVudH0gYW5kIGluc2VydHMgaXRzIEhvc3QgVmlldyBpbnRvIHRoaXMgY29udGFpbmVyIGF0IHRoZVxuICAgKiBzcGVjaWZpZWQgYGluZGV4YC5cbiAgICpcbiAgICogVGhlIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQgdXNpbmcgaXRzIHtAbGluayBQcm90b1ZpZXdSZWYgYHByb3RvVmlld2B9IHdoaWNoIGNhbiBiZVxuICAgKiBvYnRhaW5lZCB2aWEge0BsaW5rIENvbXBpbGVyI2NvbXBpbGVJbkhvc3R9LlxuICAgKlxuICAgKiBJZiBgaW5kZXhgIGlzIG5vdCBzcGVjaWZpZWQsIHRoZSBuZXcgVmlldyB3aWxsIGJlIGluc2VydGVkIGFzIHRoZSBsYXN0IFZpZXcgaW4gdGhlIGNvbnRhaW5lci5cbiAgICpcbiAgICogWW91IGNhbiBvcHRpb25hbGx5IHNwZWNpZnkgYGR5bmFtaWNhbGx5Q3JlYXRlZFByb3ZpZGVyc2AsIHdoaWNoIGNvbmZpZ3VyZSB0aGUge0BsaW5rIEluamVjdG9yfVxuICAgKiB0aGF0IHdpbGwgYmUgY3JlYXRlZCBmb3IgdGhlIEhvc3QgVmlldy5cbiAgICpcbiAgICogUmV0dXJucyB0aGUge0BsaW5rIEhvc3RWaWV3UmVmfSBvZiB0aGUgSG9zdCBWaWV3IGNyZWF0ZWQgZm9yIHRoZSBuZXdseSBpbnN0YW50aWF0ZWQgQ29tcG9uZW50LlxuICAgKi9cbiAgYWJzdHJhY3QgY3JlYXRlSG9zdFZpZXcoaG9zdFZpZXdGYWN0b3J5UmVmOiBIb3N0Vmlld0ZhY3RvcnlSZWYsIGluZGV4PzogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkeW5hbWljYWxseUNyZWF0ZWRQcm92aWRlcnM/OiBSZXNvbHZlZFByb3ZpZGVyW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RhYmxlTm9kZXM/OiBhbnlbXVtdKTogSG9zdFZpZXdSZWY7XG5cbiAgLyoqXG4gICAqIEluc2VydHMgYSBWaWV3IGlkZW50aWZpZWQgYnkgYSB7QGxpbmsgVmlld1JlZn0gaW50byB0aGUgY29udGFpbmVyIGF0IHRoZSBzcGVjaWZpZWQgYGluZGV4YC5cbiAgICpcbiAgICogSWYgYGluZGV4YCBpcyBub3Qgc3BlY2lmaWVkLCB0aGUgbmV3IFZpZXcgd2lsbCBiZSBpbnNlcnRlZCBhcyB0aGUgbGFzdCBWaWV3IGluIHRoZSBjb250YWluZXIuXG4gICAqXG4gICAqIFJldHVybnMgdGhlIGluc2VydGVkIHtAbGluayBWaWV3UmVmfS5cbiAgICovXG4gIGFic3RyYWN0IGluc2VydCh2aWV3UmVmOiBWaWV3UmVmLCBpbmRleD86IG51bWJlcik6IFZpZXdSZWY7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBWaWV3LCBzcGVjaWZpZWQgdmlhIHtAbGluayBWaWV3UmVmfSwgd2l0aGluIHRoZSBjdXJyZW50IGNvbnRhaW5lciBvclxuICAgKiBgLTFgIGlmIHRoaXMgY29udGFpbmVyIGRvZXNuJ3QgY29udGFpbiB0aGUgVmlldy5cbiAgICovXG4gIGFic3RyYWN0IGluZGV4T2Yodmlld1JlZjogVmlld1JlZik6IG51bWJlcjtcblxuICAvKipcbiAgICogRGVzdHJveXMgYSBWaWV3IGF0dGFjaGVkIHRvIHRoaXMgY29udGFpbmVyIGF0IHRoZSBzcGVjaWZpZWQgYGluZGV4YC5cbiAgICpcbiAgICogSWYgYGluZGV4YCBpcyBub3Qgc3BlY2lmaWVkLCB0aGUgbGFzdCBWaWV3IGluIHRoZSBjb250YWluZXIgd2lsbCBiZSByZW1vdmVkLlxuICAgKi9cbiAgYWJzdHJhY3QgcmVtb3ZlKGluZGV4PzogbnVtYmVyKTogdm9pZDtcblxuICAvKipcbiAgICogVXNlIGFsb25nIHdpdGgge0BsaW5rICNpbnNlcnR9IHRvIG1vdmUgYSBWaWV3IHdpdGhpbiB0aGUgY3VycmVudCBjb250YWluZXIuXG4gICAqXG4gICAqIElmIHRoZSBgaW5kZXhgIHBhcmFtIGlzIG9taXR0ZWQsIHRoZSBsYXN0IHtAbGluayBWaWV3UmVmfSBpcyBkZXRhY2hlZC5cbiAgICovXG4gIGFic3RyYWN0IGRldGFjaChpbmRleD86IG51bWJlcik6IFZpZXdSZWY7XG59XG5cbmV4cG9ydCBjbGFzcyBWaWV3Q29udGFpbmVyUmVmXyBpbXBsZW1lbnRzIFZpZXdDb250YWluZXJSZWYge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9lbGVtZW50OiBBcHBFbGVtZW50KSB7fVxuXG4gIGdldChpbmRleDogbnVtYmVyKTogRW1iZWRkZWRWaWV3UmVmIHsgcmV0dXJuIHRoaXMuX2VsZW1lbnQubmVzdGVkVmlld3NbaW5kZXhdLnJlZjsgfVxuICBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgdmFyIHZpZXdzID0gdGhpcy5fZWxlbWVudC5uZXN0ZWRWaWV3cztcbiAgICByZXR1cm4gaXNQcmVzZW50KHZpZXdzKSA/IHZpZXdzLmxlbmd0aCA6IDA7XG4gIH1cblxuICBnZXQgZWxlbWVudCgpOiBFbGVtZW50UmVmIHsgcmV0dXJuIHRoaXMuX2VsZW1lbnQucmVmOyB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY3JlYXRlRW1iZWRkZWRWaWV3SW5Db250YWluZXJTY29wZTogV3RmU2NvcGVGbiA9XG4gICAgICB3dGZDcmVhdGVTY29wZSgnVmlld0NvbnRhaW5lclJlZiNjcmVhdGVFbWJlZGRlZFZpZXcoKScpO1xuXG4gIC8vIFRPRE8ocmFkbyk6IHByb2ZpbGUgYW5kIGRlY2lkZSB3aGV0aGVyIGJvdW5kcyBjaGVja3Mgc2hvdWxkIGJlIGFkZGVkXG4gIC8vIHRvIHRoZSBtZXRob2RzIGJlbG93LlxuICBjcmVhdGVFbWJlZGRlZFZpZXcodGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmLCBpbmRleDogbnVtYmVyID0gLTEpOiBFbWJlZGRlZFZpZXdSZWYge1xuICAgIHZhciBzID0gdGhpcy5fY3JlYXRlRW1iZWRkZWRWaWV3SW5Db250YWluZXJTY29wZSgpO1xuICAgIGlmIChpbmRleCA9PSAtMSkgaW5kZXggPSB0aGlzLmxlbmd0aDtcbiAgICB2YXIgdGVtcGxhdGVSZWZfID0gKDxUZW1wbGF0ZVJlZl8+dGVtcGxhdGVSZWYpO1xuICAgIHZhciB2aWV3OiBBcHBWaWV3PGFueT4gPSB0ZW1wbGF0ZVJlZl8uY3JlYXRlRW1iZWRkZWRWaWV3KCk7XG4gICAgdGhpcy5fZWxlbWVudC5hdHRhY2hWaWV3KHZpZXcsIGluZGV4KTtcbiAgICByZXR1cm4gd3RmTGVhdmUocywgdmlldy5yZWYpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY3JlYXRlSG9zdFZpZXdJbkNvbnRhaW5lclNjb3BlOiBXdGZTY29wZUZuID0gd3RmQ3JlYXRlU2NvcGUoJ1ZpZXdDb250YWluZXJSZWYjY3JlYXRlSG9zdFZpZXcoKScpO1xuXG4gIGNyZWF0ZUhvc3RWaWV3KGhvc3RWaWV3RmFjdG9yeVJlZjogSG9zdFZpZXdGYWN0b3J5UmVmLCBpbmRleDogbnVtYmVyID0gLTEsXG4gICAgICAgICAgICAgICAgIGR5bmFtaWNhbGx5Q3JlYXRlZFByb3ZpZGVyczogUmVzb2x2ZWRQcm92aWRlcltdID0gbnVsbCxcbiAgICAgICAgICAgICAgICAgcHJvamVjdGFibGVOb2RlczogYW55W11bXSA9IG51bGwpOiBIb3N0Vmlld1JlZiB7XG4gICAgdmFyIHMgPSB0aGlzLl9jcmVhdGVIb3N0Vmlld0luQ29udGFpbmVyU2NvcGUoKTtcbiAgICBpZiAoaW5kZXggPT0gLTEpIGluZGV4ID0gdGhpcy5sZW5ndGg7XG4gICAgdmFyIGNvbnRleHRFbCA9IHRoaXMuX2VsZW1lbnQ7XG4gICAgdmFyIGNvbnRleHRJbmplY3RvciA9IHRoaXMuX2VsZW1lbnQucGFyZW50SW5qZWN0b3I7XG5cbiAgICB2YXIgaG9zdFZpZXdGYWN0b3J5ID0gKDxIb3N0Vmlld0ZhY3RvcnlSZWZfPmhvc3RWaWV3RmFjdG9yeVJlZikuaW50ZXJuYWxIb3N0Vmlld0ZhY3Rvcnk7XG5cbiAgICB2YXIgY2hpbGRJbmplY3RvciA9XG4gICAgICAgIGlzUHJlc2VudChkeW5hbWljYWxseUNyZWF0ZWRQcm92aWRlcnMpICYmIGR5bmFtaWNhbGx5Q3JlYXRlZFByb3ZpZGVycy5sZW5ndGggPiAwID9cbiAgICAgICAgICAgIG5ldyBJbmplY3Rvcl8oUHJvdG9JbmplY3Rvci5mcm9tUmVzb2x2ZWRQcm92aWRlcnMoZHluYW1pY2FsbHlDcmVhdGVkUHJvdmlkZXJzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dEluamVjdG9yKSA6XG4gICAgICAgICAgICBjb250ZXh0SW5qZWN0b3I7XG5cbiAgICB2YXIgdmlldyA9XG4gICAgICAgIGhvc3RWaWV3RmFjdG9yeS52aWV3RmFjdG9yeShjb250ZXh0RWwucGFyZW50Vmlldy52aWV3TWFuYWdlciwgY2hpbGRJbmplY3RvciwgY29udGV4dEVsKTtcbiAgICB2aWV3LmNyZWF0ZShwcm9qZWN0YWJsZU5vZGVzLCBudWxsKTtcbiAgICB0aGlzLl9lbGVtZW50LmF0dGFjaFZpZXcodmlldywgaW5kZXgpO1xuICAgIHJldHVybiB3dGZMZWF2ZShzLCB2aWV3LnJlZik7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9pbnNlcnRTY29wZSA9IHd0ZkNyZWF0ZVNjb3BlKCdWaWV3Q29udGFpbmVyUmVmI2luc2VydCgpJyk7XG5cbiAgLy8gVE9ETyhpKTogcmVmYWN0b3IgaW5zZXJ0K3JlbW92ZSBpbnRvIG1vdmVcbiAgaW5zZXJ0KHZpZXdSZWY6IFZpZXdSZWYsIGluZGV4OiBudW1iZXIgPSAtMSk6IFZpZXdSZWYge1xuICAgIHZhciBzID0gdGhpcy5faW5zZXJ0U2NvcGUoKTtcbiAgICBpZiAoaW5kZXggPT0gLTEpIGluZGV4ID0gdGhpcy5sZW5ndGg7XG4gICAgdmFyIHZpZXdSZWZfID0gPFZpZXdSZWZfPnZpZXdSZWY7XG4gICAgdGhpcy5fZWxlbWVudC5hdHRhY2hWaWV3KHZpZXdSZWZfLmludGVybmFsVmlldywgaW5kZXgpO1xuICAgIHJldHVybiB3dGZMZWF2ZShzLCB2aWV3UmVmXyk7XG4gIH1cblxuICBpbmRleE9mKHZpZXdSZWY6IFZpZXdSZWYpOiBudW1iZXIge1xuICAgIHJldHVybiBMaXN0V3JhcHBlci5pbmRleE9mKHRoaXMuX2VsZW1lbnQubmVzdGVkVmlld3MsICg8Vmlld1JlZl8+dmlld1JlZikuaW50ZXJuYWxWaWV3KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3JlbW92ZVNjb3BlID0gd3RmQ3JlYXRlU2NvcGUoJ1ZpZXdDb250YWluZXJSZWYjcmVtb3ZlKCknKTtcblxuICAvLyBUT0RPKGkpOiByZW5hbWUgdG8gZGVzdHJveVxuICByZW1vdmUoaW5kZXg6IG51bWJlciA9IC0xKTogdm9pZCB7XG4gICAgdmFyIHMgPSB0aGlzLl9yZW1vdmVTY29wZSgpO1xuICAgIGlmIChpbmRleCA9PSAtMSkgaW5kZXggPSB0aGlzLmxlbmd0aCAtIDE7XG4gICAgdmFyIHZpZXcgPSB0aGlzLl9lbGVtZW50LmRldGFjaFZpZXcoaW5kZXgpO1xuICAgIHZpZXcuZGVzdHJveSgpO1xuICAgIC8vIHZpZXcgaXMgaW50ZW50aW9uYWxseSBub3QgcmV0dXJuZWQgdG8gdGhlIGNsaWVudC5cbiAgICB3dGZMZWF2ZShzKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2RldGFjaFNjb3BlID0gd3RmQ3JlYXRlU2NvcGUoJ1ZpZXdDb250YWluZXJSZWYjZGV0YWNoKCknKTtcblxuICAvLyBUT0RPKGkpOiByZWZhY3RvciBpbnNlcnQrcmVtb3ZlIGludG8gbW92ZVxuICBkZXRhY2goaW5kZXg6IG51bWJlciA9IC0xKTogVmlld1JlZiB7XG4gICAgdmFyIHMgPSB0aGlzLl9kZXRhY2hTY29wZSgpO1xuICAgIGlmIChpbmRleCA9PSAtMSkgaW5kZXggPSB0aGlzLmxlbmd0aCAtIDE7XG4gICAgdmFyIHZpZXcgPSB0aGlzLl9lbGVtZW50LmRldGFjaFZpZXcoaW5kZXgpO1xuICAgIHJldHVybiB3dGZMZWF2ZShzLCB2aWV3LnJlZik7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICBmb3IgKHZhciBpID0gdGhpcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgdGhpcy5yZW1vdmUoaSk7XG4gICAgfVxuICB9XG59XG4iXX0=