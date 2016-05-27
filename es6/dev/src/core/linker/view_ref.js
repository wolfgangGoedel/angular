import { unimplemented } from 'angular2/src/facade/exceptions';
import { ChangeDetectionStrategy } from 'angular2/src/core/change_detection/constants';
export class ViewRef {
    get destroyed() { return unimplemented(); }
}
/**
 * Represents a View containing a single Element that is the Host Element of a {@link Component}
 * instance.
 *
 * A Host View is created for every dynamically created Component that was compiled on its own (as
 * opposed to as a part of another Component's Template) via {@link Compiler#compileInHost} or one
 * of the higher-level APIs: {@link AppViewManager#createRootHostView},
 * {@link AppViewManager#createHostViewInContainer}, {@link ViewContainerRef#createHostView}.
 */
export class HostViewRef extends ViewRef {
    get rootNodes() { return unimplemented(); }
    ;
    get changeDetectorRef() { return unimplemented(); }
}
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
export class EmbeddedViewRef extends ViewRef {
    get rootNodes() { return unimplemented(); }
    ;
}
export class ViewRef_ {
    constructor(_view) {
        this._view = _view;
        this._view = _view;
    }
    get internalView() { return this._view; }
    get rootNodes() { return this._view.flatRootNodes; }
    get changeDetectorRef() { return this; }
    setLocal(variableName, value) { this._view.setLocal(variableName, value); }
    hasLocal(variableName) { return this._view.hasLocal(variableName); }
    get destroyed() { return this._view.destroyed; }
    markForCheck() { this._view.markPathToRootAsCheckOnce(); }
    detach() { this._view.cdMode = ChangeDetectionStrategy.Detached; }
    detectChanges() { this._view.detectChanges(false); }
    checkNoChanges() { this._view.detectChanges(true); }
    reattach() {
        this._view.cdMode = ChangeDetectionStrategy.CheckAlways;
        this.markForCheck();
    }
}
export class HostViewFactoryRef {
}
export class HostViewFactoryRef_ {
    constructor(_hostViewFactory) {
        this._hostViewFactory = _hostViewFactory;
    }
    get internalHostViewFactory() { return this._hostViewFactory; }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXNtNDZsRTR0LnRtcC9hbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld19yZWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7T0FHckQsRUFBQyx1QkFBdUIsRUFBQyxNQUFNLDhDQUE4QztBQUVwRjtJQUNFLElBQUksU0FBUyxLQUFjLE1BQU0sQ0FBVSxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDL0QsQ0FBQztBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsaUNBQTBDLE9BQU87SUFDL0MsSUFBSSxTQUFTLEtBQVksTUFBTSxDQUFRLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7SUFDekQsSUFBSSxpQkFBaUIsS0FBd0IsTUFBTSxDQUFvQixhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0YsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0RHO0FBQ0gscUNBQThDLE9BQU87SUFXbkQsSUFBSSxTQUFTLEtBQVksTUFBTSxDQUFRLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFDM0QsQ0FBQztBQUVEO0lBQ0UsWUFBb0IsS0FBbUI7UUFBbkIsVUFBSyxHQUFMLEtBQUssQ0FBYztRQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQUMsQ0FBQztJQUVoRSxJQUFJLFlBQVksS0FBbUIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBRXZELElBQUksU0FBUyxLQUFZLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7SUFFM0QsSUFBSSxpQkFBaUIsS0FBd0IsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFFM0QsUUFBUSxDQUFDLFlBQW9CLEVBQUUsS0FBVSxJQUFVLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFOUYsUUFBUSxDQUFDLFlBQW9CLElBQWEsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVyRixJQUFJLFNBQVMsS0FBYyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBRXpELFlBQVksS0FBVyxJQUFJLENBQUMsS0FBSyxDQUFDLHlCQUF5QixFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLE1BQU0sS0FBVyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3hFLGFBQWEsS0FBVyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUQsY0FBYyxLQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRCxRQUFRO1FBQ04sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsdUJBQXVCLENBQUMsV0FBVyxDQUFDO1FBQ3hELElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN0QixDQUFDO0FBQ0gsQ0FBQztBQUVEO0FBQTBDLENBQUM7QUFFM0M7SUFDRSxZQUFvQixnQkFBaUM7UUFBakMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFpQjtJQUFHLENBQUM7SUFFekQsSUFBSSx1QkFBdUIsS0FBc0IsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7QUFDbEYsQ0FBQztBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHt1bmltcGxlbWVudGVkfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3RvclJlZn0gZnJvbSAnLi4vY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0b3JfcmVmJztcbmltcG9ydCB7QXBwVmlldywgSG9zdFZpZXdGYWN0b3J5fSBmcm9tICcuL3ZpZXcnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jb25zdGFudHMnO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVmlld1JlZiB7XG4gIGdldCBkZXN0cm95ZWQoKTogYm9vbGVhbiB7IHJldHVybiA8Ym9vbGVhbj51bmltcGxlbWVudGVkKCk7IH1cbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgVmlldyBjb250YWluaW5nIGEgc2luZ2xlIEVsZW1lbnQgdGhhdCBpcyB0aGUgSG9zdCBFbGVtZW50IG9mIGEge0BsaW5rIENvbXBvbmVudH1cbiAqIGluc3RhbmNlLlxuICpcbiAqIEEgSG9zdCBWaWV3IGlzIGNyZWF0ZWQgZm9yIGV2ZXJ5IGR5bmFtaWNhbGx5IGNyZWF0ZWQgQ29tcG9uZW50IHRoYXQgd2FzIGNvbXBpbGVkIG9uIGl0cyBvd24gKGFzXG4gKiBvcHBvc2VkIHRvIGFzIGEgcGFydCBvZiBhbm90aGVyIENvbXBvbmVudCdzIFRlbXBsYXRlKSB2aWEge0BsaW5rIENvbXBpbGVyI2NvbXBpbGVJbkhvc3R9IG9yIG9uZVxuICogb2YgdGhlIGhpZ2hlci1sZXZlbCBBUElzOiB7QGxpbmsgQXBwVmlld01hbmFnZXIjY3JlYXRlUm9vdEhvc3RWaWV3fSxcbiAqIHtAbGluayBBcHBWaWV3TWFuYWdlciNjcmVhdGVIb3N0Vmlld0luQ29udGFpbmVyfSwge0BsaW5rIFZpZXdDb250YWluZXJSZWYjY3JlYXRlSG9zdFZpZXd9LlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSG9zdFZpZXdSZWYgZXh0ZW5kcyBWaWV3UmVmIHtcbiAgZ2V0IHJvb3ROb2RlcygpOiBhbnlbXSB7IHJldHVybiA8YW55W10+dW5pbXBsZW1lbnRlZCgpOyB9O1xuICBnZXQgY2hhbmdlRGV0ZWN0b3JSZWYoKTogQ2hhbmdlRGV0ZWN0b3JSZWYgeyByZXR1cm4gPENoYW5nZURldGVjdG9yUmVmPnVuaW1wbGVtZW50ZWQoKTsgfVxufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gQW5ndWxhciBWaWV3LlxuICpcbiAqIDwhLS0gVE9ETzogbW92ZSB0aGUgbmV4dCB0d28gcGFyYWdyYXBocyB0byB0aGUgZGV2IGd1aWRlIC0tPlxuICogQSBWaWV3IGlzIGEgZnVuZGFtZW50YWwgYnVpbGRpbmcgYmxvY2sgb2YgdGhlIGFwcGxpY2F0aW9uIFVJLiBJdCBpcyB0aGUgc21hbGxlc3QgZ3JvdXBpbmcgb2ZcbiAqIEVsZW1lbnRzIHdoaWNoIGFyZSBjcmVhdGVkIGFuZCBkZXN0cm95ZWQgdG9nZXRoZXIuXG4gKlxuICogUHJvcGVydGllcyBvZiBlbGVtZW50cyBpbiBhIFZpZXcgY2FuIGNoYW5nZSwgYnV0IHRoZSBzdHJ1Y3R1cmUgKG51bWJlciBhbmQgb3JkZXIpIG9mIGVsZW1lbnRzIGluXG4gKiBhIFZpZXcgY2Fubm90LiBDaGFuZ2luZyB0aGUgc3RydWN0dXJlIG9mIEVsZW1lbnRzIGNhbiBvbmx5IGJlIGRvbmUgYnkgaW5zZXJ0aW5nLCBtb3Zpbmcgb3JcbiAqIHJlbW92aW5nIG5lc3RlZCBWaWV3cyB2aWEgYSB7QGxpbmsgVmlld0NvbnRhaW5lclJlZn0uIEVhY2ggVmlldyBjYW4gY29udGFpbiBtYW55IFZpZXcgQ29udGFpbmVycy5cbiAqIDwhLS0gL1RPRE8gLS0+XG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBHaXZlbiB0aGlzIHRlbXBsYXRlLi4uXG4gKlxuICogYGBgXG4gKiBDb3VudDoge3tpdGVtcy5sZW5ndGh9fVxuICogPHVsPlxuICogICA8bGkgKm5nRm9yPVwidmFyIGl0ZW0gb2YgaXRlbXNcIj57e2l0ZW19fTwvbGk+XG4gKiA8L3VsPlxuICogYGBgXG4gKlxuICogLi4uIHdlIGhhdmUgdHdvIHtAbGluayBQcm90b1ZpZXdSZWZ9czpcbiAqXG4gKiBPdXRlciB7QGxpbmsgUHJvdG9WaWV3UmVmfTpcbiAqIGBgYFxuICogQ291bnQ6IHt7aXRlbXMubGVuZ3RofX1cbiAqIDx1bD5cbiAqICAgPHRlbXBsYXRlIG5nRm9yIHZhci1pdGVtIFtuZ0Zvck9mXT1cIml0ZW1zXCI+PC90ZW1wbGF0ZT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBJbm5lciB7QGxpbmsgUHJvdG9WaWV3UmVmfTpcbiAqIGBgYFxuICogICA8bGk+e3tpdGVtfX08L2xpPlxuICogYGBgXG4gKlxuICogTm90aWNlIHRoYXQgdGhlIG9yaWdpbmFsIHRlbXBsYXRlIGlzIGJyb2tlbiBkb3duIGludG8gdHdvIHNlcGFyYXRlIHtAbGluayBQcm90b1ZpZXdSZWZ9cy5cbiAqXG4gKiBUaGUgb3V0ZXIvaW5uZXIge0BsaW5rIFByb3RvVmlld1JlZn1zIGFyZSB0aGVuIGFzc2VtYmxlZCBpbnRvIHZpZXdzIGxpa2Ugc286XG4gKlxuICogYGBgXG4gKiA8IS0tIFZpZXdSZWY6IG91dGVyLTAgLS0+XG4gKiBDb3VudDogMlxuICogPHVsPlxuICogICA8dGVtcGxhdGUgdmlldy1jb250YWluZXItcmVmPjwvdGVtcGxhdGU+XG4gKiAgIDwhLS0gVmlld1JlZjogaW5uZXItMSAtLT48bGk+Zmlyc3Q8L2xpPjwhLS0gL1ZpZXdSZWY6IGlubmVyLTEgLS0+XG4gKiAgIDwhLS0gVmlld1JlZjogaW5uZXItMiAtLT48bGk+c2Vjb25kPC9saT48IS0tIC9WaWV3UmVmOiBpbm5lci0yIC0tPlxuICogPC91bD5cbiAqIDwhLS0gL1ZpZXdSZWY6IG91dGVyLTAgLS0+XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEVtYmVkZGVkVmlld1JlZiBleHRlbmRzIFZpZXdSZWYge1xuICAvKipcbiAgICogU2V0cyBgdmFsdWVgIG9mIGxvY2FsIHZhcmlhYmxlIGNhbGxlZCBgdmFyaWFibGVOYW1lYCBpbiB0aGlzIFZpZXcuXG4gICAqL1xuICBhYnN0cmFjdCBzZXRMb2NhbCh2YXJpYWJsZU5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIENoZWNrcyB3aGV0aGVyIHRoaXMgdmlldyBoYXMgYSBsb2NhbCB2YXJpYWJsZSBjYWxsZWQgYHZhcmlhYmxlTmFtZWAuXG4gICAqL1xuICBhYnN0cmFjdCBoYXNMb2NhbCh2YXJpYWJsZU5hbWU6IHN0cmluZyk6IGJvb2xlYW47XG5cbiAgZ2V0IHJvb3ROb2RlcygpOiBhbnlbXSB7IHJldHVybiA8YW55W10+dW5pbXBsZW1lbnRlZCgpOyB9O1xufVxuXG5leHBvcnQgY2xhc3MgVmlld1JlZl8gaW1wbGVtZW50cyBFbWJlZGRlZFZpZXdSZWYsIEhvc3RWaWV3UmVmLCBDaGFuZ2VEZXRlY3RvclJlZiB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3ZpZXc6IEFwcFZpZXc8YW55PikgeyB0aGlzLl92aWV3ID0gX3ZpZXc7IH1cblxuICBnZXQgaW50ZXJuYWxWaWV3KCk6IEFwcFZpZXc8YW55PiB7IHJldHVybiB0aGlzLl92aWV3OyB9XG5cbiAgZ2V0IHJvb3ROb2RlcygpOiBhbnlbXSB7IHJldHVybiB0aGlzLl92aWV3LmZsYXRSb290Tm9kZXM7IH1cblxuICBnZXQgY2hhbmdlRGV0ZWN0b3JSZWYoKTogQ2hhbmdlRGV0ZWN0b3JSZWYgeyByZXR1cm4gdGhpczsgfVxuXG4gIHNldExvY2FsKHZhcmlhYmxlTmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7IHRoaXMuX3ZpZXcuc2V0TG9jYWwodmFyaWFibGVOYW1lLCB2YWx1ZSk7IH1cblxuICBoYXNMb2NhbCh2YXJpYWJsZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fdmlldy5oYXNMb2NhbCh2YXJpYWJsZU5hbWUpOyB9XG5cbiAgZ2V0IGRlc3Ryb3llZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3ZpZXcuZGVzdHJveWVkOyB9XG5cbiAgbWFya0ZvckNoZWNrKCk6IHZvaWQgeyB0aGlzLl92aWV3Lm1hcmtQYXRoVG9Sb290QXNDaGVja09uY2UoKTsgfVxuICBkZXRhY2goKTogdm9pZCB7IHRoaXMuX3ZpZXcuY2RNb2RlID0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGV0YWNoZWQ7IH1cbiAgZGV0ZWN0Q2hhbmdlcygpOiB2b2lkIHsgdGhpcy5fdmlldy5kZXRlY3RDaGFuZ2VzKGZhbHNlKTsgfVxuICBjaGVja05vQ2hhbmdlcygpOiB2b2lkIHsgdGhpcy5fdmlldy5kZXRlY3RDaGFuZ2VzKHRydWUpOyB9XG4gIHJlYXR0YWNoKCk6IHZvaWQge1xuICAgIHRoaXMuX3ZpZXcuY2RNb2RlID0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tBbHdheXM7XG4gICAgdGhpcy5tYXJrRm9yQ2hlY2soKTtcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSG9zdFZpZXdGYWN0b3J5UmVmIHt9XG5cbmV4cG9ydCBjbGFzcyBIb3N0Vmlld0ZhY3RvcnlSZWZfIGltcGxlbWVudHMgSG9zdFZpZXdGYWN0b3J5UmVmIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfaG9zdFZpZXdGYWN0b3J5OiBIb3N0Vmlld0ZhY3RvcnkpIHt9XG5cbiAgZ2V0IGludGVybmFsSG9zdFZpZXdGYWN0b3J5KCk6IEhvc3RWaWV3RmFjdG9yeSB7IHJldHVybiB0aGlzLl9ob3N0Vmlld0ZhY3Rvcnk7IH1cbn1cbiJdfQ==