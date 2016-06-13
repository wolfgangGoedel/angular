var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Type, CONST, isBlank } from 'angular2/src/facade/lang';
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
    get changeDetectorRef() { return this._hostElement.parentView.ref; }
    ;
    get componentType() { return this._componentType; }
    destroy() { this._hostElement.parentView.destroy(); }
    onDestroy(callback) { this.hostView.onDestroy(callback); }
}
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
        var hostElement = hostView.create(projectableNodes, rootSelectorOrNode);
        return new ComponentRef_(hostElement, this._componentType);
    }
};
ComponentFactory = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [String, Function, Type])
], ComponentFactory);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X2ZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVZmUVFXQ0lrLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcG9uZW50X2ZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQ08sRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFhLE9BQU8sRUFBQyxNQUFNLDBCQUEwQjtPQUNqRSxFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUlyRCxFQUFDLFNBQVMsRUFBQyxNQUFNLGNBQWM7QUFHdEM7Ozs7OztHQU1HO0FBQ0g7SUFDRTs7T0FFRztJQUNILElBQUksUUFBUSxLQUFpQixNQUFNLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXREOztPQUVHO0lBQ0gsSUFBSSxRQUFRLEtBQWUsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUVwRDs7T0FFRztJQUNILElBQUksUUFBUSxLQUFVLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0lBRS9DOztPQUVHO0lBQ0gsSUFBSSxRQUFRLEtBQWMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7SUFFbkQ7O09BRUc7SUFDSCxJQUFJLGlCQUFpQixLQUF3QixNQUFNLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXRFOztPQUVHO0lBQ0gsSUFBSSxhQUFhLEtBQVcsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQztBQVd2RCxDQUFDO0FBRUQsbUNBQW1DLFlBQVk7SUFDN0MsWUFBb0IsWUFBd0IsRUFBVSxjQUFvQjtRQUFJLE9BQU8sQ0FBQztRQUFsRSxpQkFBWSxHQUFaLFlBQVksQ0FBWTtRQUFVLG1CQUFjLEdBQWQsY0FBYyxDQUFNO0lBQWEsQ0FBQztJQUN4RixJQUFJLFFBQVEsS0FBaUIsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUNuRSxJQUFJLFFBQVEsS0FBZSxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQy9ELElBQUksUUFBUSxLQUFVLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7O0lBQzNELElBQUksUUFBUSxLQUFjLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDOztJQUNwRSxJQUFJLGlCQUFpQixLQUF3QixNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7SUFDdkYsSUFBSSxhQUFhLEtBQVcsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO0lBRXpELE9BQU8sS0FBVyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDM0QsU0FBUyxDQUFDLFFBQWtCLElBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVFLENBQUM7QUFHRDtJQUNFLFlBQW1CLFFBQWdCLEVBQVUsWUFBc0IsRUFDL0MsY0FBb0I7UUFEckIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFVO1FBQy9DLG1CQUFjLEdBQWQsY0FBYyxDQUFNO0lBQUcsQ0FBQztJQUU1QyxJQUFJLGFBQWEsS0FBVyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7SUFFekQ7O09BRUc7SUFDSCxNQUFNLENBQUMsUUFBa0IsRUFBRSxnQkFBZ0IsR0FBWSxJQUFJLEVBQ3BELGtCQUFrQixHQUFpQixJQUFJO1FBQzVDLElBQUksRUFBRSxHQUFjLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDNUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztRQUN4QixDQUFDO1FBQ0QsdURBQXVEO1FBQ3ZELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyRCxJQUFJLFdBQVcsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDeEUsTUFBTSxDQUFDLElBQUksYUFBYSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDN0QsQ0FBQztBQUNILENBQUM7QUFyQkQ7SUFBQyxLQUFLLEVBQUU7O29CQUFBO0FBcUJQIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtUeXBlLCBDT05TVCwgaXNQcmVzZW50LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHt1bmltcGxlbWVudGVkfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtFbGVtZW50UmVmfSBmcm9tICcuL2VsZW1lbnRfcmVmJztcbmltcG9ydCB7Vmlld1JlZiwgVmlld1JlZl99IGZyb20gJy4vdmlld19yZWYnO1xuaW1wb3J0IHtBcHBFbGVtZW50fSBmcm9tICcuL2VsZW1lbnQnO1xuaW1wb3J0IHtWaWV3VXRpbHN9IGZyb20gJy4vdmlld191dGlscyc7XG5pbXBvcnQge0NoYW5nZURldGVjdG9yUmVmfSBmcm9tICcuLi9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rpb24nO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gaW5zdGFuY2Ugb2YgYSBDb21wb25lbnQgY3JlYXRlZCB2aWEgYSB7QGxpbmsgQ29tcG9uZW50RmFjdG9yeX0uXG4gKlxuICogYENvbXBvbmVudFJlZmAgcHJvdmlkZXMgYWNjZXNzIHRvIHRoZSBDb21wb25lbnQgSW5zdGFuY2UgYXMgd2VsbCBvdGhlciBvYmplY3RzIHJlbGF0ZWQgdG8gdGhpc1xuICogQ29tcG9uZW50IEluc3RhbmNlIGFuZCBhbGxvd3MgeW91IHRvIGRlc3Ryb3kgdGhlIENvbXBvbmVudCBJbnN0YW5jZSB2aWEgdGhlIHtAbGluayAjZGVzdHJveX1cbiAqIG1ldGhvZC5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbXBvbmVudFJlZiB7XG4gIC8qKlxuICAgKiBMb2NhdGlvbiBvZiB0aGUgSG9zdCBFbGVtZW50IG9mIHRoaXMgQ29tcG9uZW50IEluc3RhbmNlLlxuICAgKi9cbiAgZ2V0IGxvY2F0aW9uKCk6IEVsZW1lbnRSZWYgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9XG5cbiAgLyoqXG4gICAqIFRoZSBpbmplY3RvciBvbiB3aGljaCB0aGUgY29tcG9uZW50IGluc3RhbmNlIGV4aXN0cy5cbiAgICovXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cblxuICAvKipcbiAgICogVGhlIGluc3RhbmNlIG9mIHRoZSBDb21wb25lbnQuXG4gICAqL1xuICBnZXQgaW5zdGFuY2UoKTogYW55IHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfTtcblxuICAvKipcbiAgICogVGhlIHtAbGluayBWaWV3UmVmfSBvZiB0aGUgSG9zdCBWaWV3IG9mIHRoaXMgQ29tcG9uZW50IGluc3RhbmNlLlxuICAgKi9cbiAgZ2V0IGhvc3RWaWV3KCk6IFZpZXdSZWYgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBUaGUge0BsaW5rIENoYW5nZURldGVjdG9yUmVmfSBvZiB0aGUgQ29tcG9uZW50IGluc3RhbmNlLlxuICAgKi9cbiAgZ2V0IGNoYW5nZURldGVjdG9yUmVmKCk6IENoYW5nZURldGVjdG9yUmVmIHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfVxuXG4gIC8qKlxuICAgKiBUaGUgY29tcG9uZW50IHR5cGUuXG4gICAqL1xuICBnZXQgY29tcG9uZW50VHlwZSgpOiBUeXBlIHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgY29tcG9uZW50IGluc3RhbmNlIGFuZCBhbGwgb2YgdGhlIGRhdGEgc3RydWN0dXJlcyBhc3NvY2lhdGVkIHdpdGggaXQuXG4gICAqL1xuICBhYnN0cmFjdCBkZXN0cm95KCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEFsbG93cyB0byByZWdpc3RlciBhIGNhbGxiYWNrIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgY29tcG9uZW50IGlzIGRlc3Ryb3llZC5cbiAgICovXG4gIGFic3RyYWN0IG9uRGVzdHJveShjYWxsYmFjazogRnVuY3Rpb24pOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50UmVmXyBleHRlbmRzIENvbXBvbmVudFJlZiB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2hvc3RFbGVtZW50OiBBcHBFbGVtZW50LCBwcml2YXRlIF9jb21wb25lbnRUeXBlOiBUeXBlKSB7IHN1cGVyKCk7IH1cbiAgZ2V0IGxvY2F0aW9uKCk6IEVsZW1lbnRSZWYgeyByZXR1cm4gdGhpcy5faG9zdEVsZW1lbnQuZWxlbWVudFJlZjsgfVxuICBnZXQgaW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gdGhpcy5faG9zdEVsZW1lbnQuaW5qZWN0b3I7IH1cbiAgZ2V0IGluc3RhbmNlKCk6IGFueSB7IHJldHVybiB0aGlzLl9ob3N0RWxlbWVudC5jb21wb25lbnQ7IH07XG4gIGdldCBob3N0VmlldygpOiBWaWV3UmVmIHsgcmV0dXJuIHRoaXMuX2hvc3RFbGVtZW50LnBhcmVudFZpZXcucmVmOyB9O1xuICBnZXQgY2hhbmdlRGV0ZWN0b3JSZWYoKTogQ2hhbmdlRGV0ZWN0b3JSZWYgeyByZXR1cm4gdGhpcy5faG9zdEVsZW1lbnQucGFyZW50Vmlldy5yZWY7IH07XG4gIGdldCBjb21wb25lbnRUeXBlKCk6IFR5cGUgeyByZXR1cm4gdGhpcy5fY29tcG9uZW50VHlwZTsgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7IHRoaXMuX2hvc3RFbGVtZW50LnBhcmVudFZpZXcuZGVzdHJveSgpOyB9XG4gIG9uRGVzdHJveShjYWxsYmFjazogRnVuY3Rpb24pOiB2b2lkIHsgdGhpcy5ob3N0Vmlldy5vbkRlc3Ryb3koY2FsbGJhY2spOyB9XG59XG5cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50RmFjdG9yeSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzZWxlY3Rvcjogc3RyaW5nLCBwcml2YXRlIF92aWV3RmFjdG9yeTogRnVuY3Rpb24sXG4gICAgICAgICAgICAgIHByaXZhdGUgX2NvbXBvbmVudFR5cGU6IFR5cGUpIHt9XG5cbiAgZ2V0IGNvbXBvbmVudFR5cGUoKTogVHlwZSB7IHJldHVybiB0aGlzLl9jb21wb25lbnRUeXBlOyB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgY29tcG9uZW50LlxuICAgKi9cbiAgY3JlYXRlKGluamVjdG9yOiBJbmplY3RvciwgcHJvamVjdGFibGVOb2RlczogYW55W11bXSA9IG51bGwsXG4gICAgICAgICByb290U2VsZWN0b3JPck5vZGU6IHN0cmluZyB8IGFueSA9IG51bGwpOiBDb21wb25lbnRSZWYge1xuICAgIHZhciB2dTogVmlld1V0aWxzID0gaW5qZWN0b3IuZ2V0KFZpZXdVdGlscyk7XG4gICAgaWYgKGlzQmxhbmsocHJvamVjdGFibGVOb2RlcykpIHtcbiAgICAgIHByb2plY3RhYmxlTm9kZXMgPSBbXTtcbiAgICB9XG4gICAgLy8gTm90ZTogSG9zdCB2aWV3cyBkb24ndCBuZWVkIGEgZGVjbGFyYXRpb25BcHBFbGVtZW50IVxuICAgIHZhciBob3N0VmlldyA9IHRoaXMuX3ZpZXdGYWN0b3J5KHZ1LCBpbmplY3RvciwgbnVsbCk7XG4gICAgdmFyIGhvc3RFbGVtZW50ID0gaG9zdFZpZXcuY3JlYXRlKHByb2plY3RhYmxlTm9kZXMsIHJvb3RTZWxlY3Rvck9yTm9kZSk7XG4gICAgcmV0dXJuIG5ldyBDb21wb25lbnRSZWZfKGhvc3RFbGVtZW50LCB0aGlzLl9jb21wb25lbnRUeXBlKTtcbiAgfVxufVxuIl19