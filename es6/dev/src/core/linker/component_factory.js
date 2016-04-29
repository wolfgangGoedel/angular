var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Type, CONST, CONST_EXPR, isBlank } from 'angular2/src/facade/lang';
import { unimplemented } from 'angular2/src/facade/exceptions';
import { ViewUtils } from './view_utils';
/**
 * Represents an instance of a Component created via a {@link ComponentFactory}.
 *
 * `ComponentRef` provides access to the Component Instance as well other objects related to this
 * Component Instance and allows you to destroy the Component Instance via the {@link #destroy}
 * method.
 */
export class ComponentRef {
    /**
     * Location of the Host Element of this Component Instance.
     */
    get location() { return unimplemented(); }
    /**
     * The injector on which the component instance exists.
     */
    get injector() { return unimplemented(); }
    /**
     * The instance of the Component.
     */
    get instance() { return unimplemented(); }
    ;
    /**
     * The {@link ViewRef} of the Host View of this Component instance.
     */
    get hostView() { return unimplemented(); }
    ;
    /**
     * The {@link ChangeDetectorRef} of the Component instance.
     */
    get changeDetectorRef() { return unimplemented(); }
    /**
     * The component type.
     */
    get componentType() { return unimplemented(); }
}
export class ComponentRef_ extends ComponentRef {
    constructor(_hostElement, _componentType) {
        super();
        this._hostElement = _hostElement;
        this._componentType = _componentType;
    }
    get location() { return this._hostElement.elementRef; }
    get injector() { return this._hostElement.injector; }
    get instance() { return this._hostElement.component; }
    ;
    get hostView() { return this._hostElement.parentView.ref; }
    ;
    get changeDetectorRef() { return this.hostView; }
    ;
    get componentType() { return this._componentType; }
    destroy() { this._hostElement.parentView.destroy(); }
    onDestroy(callback) { this.hostView.onDestroy(callback); }
}
const EMPTY_CONTEXT = CONST_EXPR(new Object());
export let ComponentFactory = class ComponentFactory {
    constructor(selector, _viewFactory, _componentType) {
        this.selector = selector;
        this._viewFactory = _viewFactory;
        this._componentType = _componentType;
    }
    get componentType() { return this._componentType; }
    /**
     * Creates a new component.
     */
    create(injector, projectableNodes = null, rootSelectorOrNode = null) {
        var vu = injector.get(ViewUtils);
        if (isBlank(projectableNodes)) {
            projectableNodes = [];
        }
        // Note: Host views don't need a declarationAppElement!
        var hostView = this._viewFactory(vu, injector, null);
        var hostElement = hostView.create(EMPTY_CONTEXT, projectableNodes, rootSelectorOrNode);
        return new ComponentRef_(hostElement, this._componentType);
    }
};
ComponentFactory = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [String, Function, Type])
], ComponentFactory);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X2ZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLUsycDZUQ0hDLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcG9uZW50X2ZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQ08sRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBYSxPQUFPLEVBQUMsTUFBTSwwQkFBMEI7T0FDN0UsRUFBQyxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7T0FJckQsRUFBQyxTQUFTLEVBQUMsTUFBTSxjQUFjO0FBR3RDOzs7Ozs7R0FNRztBQUNIO0lBQ0U7O09BRUc7SUFDSCxJQUFJLFFBQVEsS0FBaUIsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUV0RDs7T0FFRztJQUNILElBQUksUUFBUSxLQUFlLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFcEQ7O09BRUc7SUFDSCxJQUFJLFFBQVEsS0FBVSxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDOztJQUUvQzs7T0FFRztJQUNILElBQUksUUFBUSxLQUFjLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0lBRW5EOztPQUVHO0lBQ0gsSUFBSSxpQkFBaUIsS0FBd0IsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUV0RTs7T0FFRztJQUNILElBQUksYUFBYSxLQUFXLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFXdkQsQ0FBQztBQUVELG1DQUFtQyxZQUFZO0lBQzdDLFlBQW9CLFlBQXdCLEVBQVUsY0FBb0I7UUFBSSxPQUFPLENBQUM7UUFBbEUsaUJBQVksR0FBWixZQUFZLENBQVk7UUFBVSxtQkFBYyxHQUFkLGNBQWMsQ0FBTTtJQUFhLENBQUM7SUFDeEYsSUFBSSxRQUFRLEtBQWlCLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDbkUsSUFBSSxRQUFRLEtBQWUsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUMvRCxJQUFJLFFBQVEsS0FBVSxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDOztJQUMzRCxJQUFJLFFBQVEsS0FBYyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7SUFDcEUsSUFBSSxpQkFBaUIsS0FBd0IsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDOztJQUNwRSxJQUFJLGFBQWEsS0FBVyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7SUFFekQsT0FBTyxLQUFXLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMzRCxTQUFTLENBQUMsUUFBa0IsSUFBVSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUUsQ0FBQztBQUVELE1BQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQyxJQUFJLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFHL0M7SUFDRSxZQUFtQixRQUFnQixFQUFVLFlBQXNCLEVBQy9DLGNBQW9CO1FBRHJCLGFBQVEsR0FBUixRQUFRLENBQVE7UUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBVTtRQUMvQyxtQkFBYyxHQUFkLGNBQWMsQ0FBTTtJQUFHLENBQUM7SUFFNUMsSUFBSSxhQUFhLEtBQVcsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO0lBRXpEOztPQUVHO0lBQ0gsTUFBTSxDQUFDLFFBQWtCLEVBQUUsZ0JBQWdCLEdBQVksSUFBSSxFQUNwRCxrQkFBa0IsR0FBaUIsSUFBSTtRQUM1QyxJQUFJLEVBQUUsR0FBYyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzVDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixnQkFBZ0IsR0FBRyxFQUFFLENBQUM7UUFDeEIsQ0FBQztRQUNELHVEQUF1RDtRQUN2RCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDckQsSUFBSSxXQUFXLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUN2RixNQUFNLENBQUMsSUFBSSxhQUFhLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUM3RCxDQUFDO0FBQ0gsQ0FBQztBQXJCRDtJQUFDLEtBQUssRUFBRTs7b0JBQUE7QUFxQlAiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1R5cGUsIENPTlNULCBDT05TVF9FWFBSLCBpc1ByZXNlbnQsIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge3VuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0VsZW1lbnRSZWZ9IGZyb20gJy4vZWxlbWVudF9yZWYnO1xuaW1wb3J0IHtWaWV3UmVmLCBWaWV3UmVmX30gZnJvbSAnLi92aWV3X3JlZic7XG5pbXBvcnQge0FwcEVsZW1lbnR9IGZyb20gJy4vZWxlbWVudCc7XG5pbXBvcnQge1ZpZXdVdGlsc30gZnJvbSAnLi92aWV3X3V0aWxzJztcbmltcG9ydCB7Q2hhbmdlRGV0ZWN0b3JSZWZ9IGZyb20gJy4uL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbic7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBpbnN0YW5jZSBvZiBhIENvbXBvbmVudCBjcmVhdGVkIHZpYSBhIHtAbGluayBDb21wb25lbnRGYWN0b3J5fS5cbiAqXG4gKiBgQ29tcG9uZW50UmVmYCBwcm92aWRlcyBhY2Nlc3MgdG8gdGhlIENvbXBvbmVudCBJbnN0YW5jZSBhcyB3ZWxsIG90aGVyIG9iamVjdHMgcmVsYXRlZCB0byB0aGlzXG4gKiBDb21wb25lbnQgSW5zdGFuY2UgYW5kIGFsbG93cyB5b3UgdG8gZGVzdHJveSB0aGUgQ29tcG9uZW50IEluc3RhbmNlIHZpYSB0aGUge0BsaW5rICNkZXN0cm95fVxuICogbWV0aG9kLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcG9uZW50UmVmIHtcbiAgLyoqXG4gICAqIExvY2F0aW9uIG9mIHRoZSBIb3N0IEVsZW1lbnQgb2YgdGhpcyBDb21wb25lbnQgSW5zdGFuY2UuXG4gICAqL1xuICBnZXQgbG9jYXRpb24oKTogRWxlbWVudFJlZiB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cblxuICAvKipcbiAgICogVGhlIGluamVjdG9yIG9uIHdoaWNoIHRoZSBjb21wb25lbnQgaW5zdGFuY2UgZXhpc3RzLlxuICAgKi9cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfVxuXG4gIC8qKlxuICAgKiBUaGUgaW5zdGFuY2Ugb2YgdGhlIENvbXBvbmVudC5cbiAgICovXG4gIGdldCBpbnN0YW5jZSgpOiBhbnkgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBUaGUge0BsaW5rIFZpZXdSZWZ9IG9mIHRoZSBIb3N0IFZpZXcgb2YgdGhpcyBDb21wb25lbnQgaW5zdGFuY2UuXG4gICAqL1xuICBnZXQgaG9zdFZpZXcoKTogVmlld1JlZiB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH07XG5cbiAgLyoqXG4gICAqIFRoZSB7QGxpbmsgQ2hhbmdlRGV0ZWN0b3JSZWZ9IG9mIHRoZSBDb21wb25lbnQgaW5zdGFuY2UuXG4gICAqL1xuICBnZXQgY2hhbmdlRGV0ZWN0b3JSZWYoKTogQ2hhbmdlRGV0ZWN0b3JSZWYgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9XG5cbiAgLyoqXG4gICAqIFRoZSBjb21wb25lbnQgdHlwZS5cbiAgICovXG4gIGdldCBjb21wb25lbnRUeXBlKCk6IFR5cGUgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoZSBjb21wb25lbnQgaW5zdGFuY2UgYW5kIGFsbCBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmVzIGFzc29jaWF0ZWQgd2l0aCBpdC5cbiAgICovXG4gIGFic3RyYWN0IGRlc3Ryb3koKTogdm9pZDtcblxuICAvKipcbiAgICogQWxsb3dzIHRvIHJlZ2lzdGVyIGEgY2FsbGJhY2sgdGhhdCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZSBjb21wb25lbnQgaXMgZGVzdHJveWVkLlxuICAgKi9cbiAgYWJzdHJhY3Qgb25EZXN0cm95KGNhbGxiYWNrOiBGdW5jdGlvbik6IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRSZWZfIGV4dGVuZHMgQ29tcG9uZW50UmVmIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfaG9zdEVsZW1lbnQ6IEFwcEVsZW1lbnQsIHByaXZhdGUgX2NvbXBvbmVudFR5cGU6IFR5cGUpIHsgc3VwZXIoKTsgfVxuICBnZXQgbG9jYXRpb24oKTogRWxlbWVudFJlZiB7IHJldHVybiB0aGlzLl9ob3N0RWxlbWVudC5lbGVtZW50UmVmOyB9XG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLl9ob3N0RWxlbWVudC5pbmplY3RvcjsgfVxuICBnZXQgaW5zdGFuY2UoKTogYW55IHsgcmV0dXJuIHRoaXMuX2hvc3RFbGVtZW50LmNvbXBvbmVudDsgfTtcbiAgZ2V0IGhvc3RWaWV3KCk6IFZpZXdSZWYgeyByZXR1cm4gdGhpcy5faG9zdEVsZW1lbnQucGFyZW50Vmlldy5yZWY7IH07XG4gIGdldCBjaGFuZ2VEZXRlY3RvclJlZigpOiBDaGFuZ2VEZXRlY3RvclJlZiB7IHJldHVybiB0aGlzLmhvc3RWaWV3OyB9O1xuICBnZXQgY29tcG9uZW50VHlwZSgpOiBUeXBlIHsgcmV0dXJuIHRoaXMuX2NvbXBvbmVudFR5cGU7IH1cblxuICBkZXN0cm95KCk6IHZvaWQgeyB0aGlzLl9ob3N0RWxlbWVudC5wYXJlbnRWaWV3LmRlc3Ryb3koKTsgfVxuICBvbkRlc3Ryb3koY2FsbGJhY2s6IEZ1bmN0aW9uKTogdm9pZCB7IHRoaXMuaG9zdFZpZXcub25EZXN0cm95KGNhbGxiYWNrKTsgfVxufVxuXG5jb25zdCBFTVBUWV9DT05URVhUID0gQ09OU1RfRVhQUihuZXcgT2JqZWN0KCkpO1xuXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIENvbXBvbmVudEZhY3Rvcnkge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgc2VsZWN0b3I6IHN0cmluZywgcHJpdmF0ZSBfdmlld0ZhY3Rvcnk6IEZ1bmN0aW9uLFxuICAgICAgICAgICAgICBwcml2YXRlIF9jb21wb25lbnRUeXBlOiBUeXBlKSB7fVxuXG4gIGdldCBjb21wb25lbnRUeXBlKCk6IFR5cGUgeyByZXR1cm4gdGhpcy5fY29tcG9uZW50VHlwZTsgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGNvbXBvbmVudC5cbiAgICovXG4gIGNyZWF0ZShpbmplY3RvcjogSW5qZWN0b3IsIHByb2plY3RhYmxlTm9kZXM6IGFueVtdW10gPSBudWxsLFxuICAgICAgICAgcm9vdFNlbGVjdG9yT3JOb2RlOiBzdHJpbmcgfCBhbnkgPSBudWxsKTogQ29tcG9uZW50UmVmIHtcbiAgICB2YXIgdnU6IFZpZXdVdGlscyA9IGluamVjdG9yLmdldChWaWV3VXRpbHMpO1xuICAgIGlmIChpc0JsYW5rKHByb2plY3RhYmxlTm9kZXMpKSB7XG4gICAgICBwcm9qZWN0YWJsZU5vZGVzID0gW107XG4gICAgfVxuICAgIC8vIE5vdGU6IEhvc3Qgdmlld3MgZG9uJ3QgbmVlZCBhIGRlY2xhcmF0aW9uQXBwRWxlbWVudCFcbiAgICB2YXIgaG9zdFZpZXcgPSB0aGlzLl92aWV3RmFjdG9yeSh2dSwgaW5qZWN0b3IsIG51bGwpO1xuICAgIHZhciBob3N0RWxlbWVudCA9IGhvc3RWaWV3LmNyZWF0ZShFTVBUWV9DT05URVhULCBwcm9qZWN0YWJsZU5vZGVzLCByb290U2VsZWN0b3JPck5vZGUpO1xuICAgIHJldHVybiBuZXcgQ29tcG9uZW50UmVmXyhob3N0RWxlbWVudCwgdGhpcy5fY29tcG9uZW50VHlwZSk7XG4gIH1cbn1cbiJdfQ==