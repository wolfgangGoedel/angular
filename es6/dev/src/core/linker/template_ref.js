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
export class TemplateRef {
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
    get elementRef() { return null; }
}
export class TemplateRef_ extends TemplateRef {
    constructor(_appElement, _viewFactory) {
        super();
        this._appElement = _appElement;
        this._viewFactory = _viewFactory;
    }
    createEmbeddedView() {
        var view = this._viewFactory(this._appElement.parentView.viewManager, this._appElement.parentInjector, this._appElement);
        view.create(null, null);
        return view;
    }
    get elementRef() { return this._appElement.ref; }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1zbTQ2bEU0dC50bXAvYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3RlbXBsYXRlX3JlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQTs7Ozs7Ozs7Ozs7R0FXRztBQUNIO0lBQ0U7Ozs7Ozs7Ozs7T0FVRztJQUNILHdDQUF3QztJQUN4QyxJQUFJLFVBQVUsS0FBaUIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDL0MsQ0FBQztBQUVELGtDQUFrQyxXQUFXO0lBQzNDLFlBQW9CLFdBQXVCLEVBQVUsWUFBc0I7UUFBSSxPQUFPLENBQUM7UUFBbkUsZ0JBQVcsR0FBWCxXQUFXLENBQVk7UUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBVTtJQUFhLENBQUM7SUFFekYsa0JBQWtCO1FBQ2hCLElBQUksSUFBSSxHQUFpQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFDdkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzlGLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3hCLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsSUFBSSxVQUFVLEtBQWlCLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDL0QsQ0FBQztBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbGVtZW50UmVmLCBFbGVtZW50UmVmX30gZnJvbSAnLi9lbGVtZW50X3JlZic7XG5pbXBvcnQge0FwcEVsZW1lbnR9IGZyb20gJy4vZWxlbWVudCc7XG5pbXBvcnQge0FwcFZpZXd9IGZyb20gJy4vdmlldyc7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBFbWJlZGRlZCBUZW1wbGF0ZSB0aGF0IGNhbiBiZSB1c2VkIHRvIGluc3RhbnRpYXRlIEVtYmVkZGVkIFZpZXdzLlxuICpcbiAqIFlvdSBjYW4gYWNjZXNzIGEgYFRlbXBsYXRlUmVmYCwgaW4gdHdvIHdheXMuIFZpYSBhIGRpcmVjdGl2ZSBwbGFjZWQgb24gYSBgPHRlbXBsYXRlPmAgZWxlbWVudCAob3JcbiAqIGRpcmVjdGl2ZSBwcmVmaXhlZCB3aXRoIGAqYCkgYW5kIGhhdmUgdGhlIGBUZW1wbGF0ZVJlZmAgZm9yIHRoaXMgRW1iZWRkZWQgVmlldyBpbmplY3RlZCBpbnRvIHRoZVxuICogY29uc3RydWN0b3Igb2YgdGhlIGRpcmVjdGl2ZSB1c2luZyB0aGUgYFRlbXBsYXRlUmVmYCBUb2tlbi4gQWx0ZXJuYXRpdmVseSB5b3UgY2FuIHF1ZXJ5IGZvciB0aGVcbiAqIGBUZW1wbGF0ZVJlZmAgZnJvbSBhIENvbXBvbmVudCBvciBhIERpcmVjdGl2ZSB2aWEge0BsaW5rIFF1ZXJ5fS5cbiAqXG4gKiBUbyBpbnN0YW50aWF0ZSBFbWJlZGRlZCBWaWV3cyBiYXNlZCBvbiBhIFRlbXBsYXRlLCB1c2VcbiAqIHtAbGluayBWaWV3Q29udGFpbmVyUmVmI2NyZWF0ZUVtYmVkZGVkVmlld30sIHdoaWNoIHdpbGwgY3JlYXRlIHRoZSBWaWV3IGFuZCBhdHRhY2ggaXQgdG8gdGhlXG4gKiBWaWV3IENvbnRhaW5lci5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFRlbXBsYXRlUmVmIHtcbiAgLyoqXG4gICAqIFRoZSBsb2NhdGlvbiBpbiB0aGUgVmlldyB3aGVyZSB0aGUgRW1iZWRkZWQgVmlldyBsb2dpY2FsbHkgYmVsb25ncyB0by5cbiAgICpcbiAgICogVGhlIGRhdGEtYmluZGluZyBhbmQgaW5qZWN0aW9uIGNvbnRleHRzIG9mIEVtYmVkZGVkIFZpZXdzIGNyZWF0ZWQgZnJvbSB0aGlzIGBUZW1wbGF0ZVJlZmBcbiAgICogaW5oZXJpdCBmcm9tIHRoZSBjb250ZXh0cyBvZiB0aGlzIGxvY2F0aW9uLlxuICAgKlxuICAgKiBUeXBpY2FsbHkgbmV3IEVtYmVkZGVkIFZpZXdzIGFyZSBhdHRhY2hlZCB0byB0aGUgVmlldyBDb250YWluZXIgb2YgdGhpcyBsb2NhdGlvbiwgYnV0IGluXG4gICAqIGFkdmFuY2VkIHVzZS1jYXNlcywgdGhlIFZpZXcgY2FuIGJlIGF0dGFjaGVkIHRvIGEgZGlmZmVyZW50IGNvbnRhaW5lciB3aGlsZSBrZWVwaW5nIHRoZVxuICAgKiBkYXRhLWJpbmRpbmcgYW5kIGluamVjdGlvbiBjb250ZXh0IGZyb20gdGhlIG9yaWdpbmFsIGxvY2F0aW9uLlxuICAgKlxuICAgKi9cbiAgLy8gVE9ETyhpKTogcmVuYW1lIHRvIGFuY2hvciBvciBsb2NhdGlvblxuICBnZXQgZWxlbWVudFJlZigpOiBFbGVtZW50UmVmIHsgcmV0dXJuIG51bGw7IH1cbn1cblxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlUmVmXyBleHRlbmRzIFRlbXBsYXRlUmVmIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfYXBwRWxlbWVudDogQXBwRWxlbWVudCwgcHJpdmF0ZSBfdmlld0ZhY3Rvcnk6IEZ1bmN0aW9uKSB7IHN1cGVyKCk7IH1cblxuICBjcmVhdGVFbWJlZGRlZFZpZXcoKTogQXBwVmlldzxhbnk+IHtcbiAgICB2YXIgdmlldzogQXBwVmlldzxhbnk+ID0gdGhpcy5fdmlld0ZhY3RvcnkodGhpcy5fYXBwRWxlbWVudC5wYXJlbnRWaWV3LnZpZXdNYW5hZ2VyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9hcHBFbGVtZW50LnBhcmVudEluamVjdG9yLCB0aGlzLl9hcHBFbGVtZW50KTtcbiAgICB2aWV3LmNyZWF0ZShudWxsLCBudWxsKTtcbiAgICByZXR1cm4gdmlldztcbiAgfVxuXG4gIGdldCBlbGVtZW50UmVmKCk6IEVsZW1lbnRSZWYgeyByZXR1cm4gdGhpcy5fYXBwRWxlbWVudC5yZWY7IH1cbn1cbiJdfQ==