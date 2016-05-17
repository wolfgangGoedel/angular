var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive, ChangeDetectorRef, IterableDiffers, ViewContainerRef, TemplateRef } from 'angular2/core';
import { isPresent, isBlank, getTypeNameForDebugging } from 'angular2/src/facade/lang';
import { BaseException } from "../../facade/exceptions";
/**
 * The `NgFor` directive instantiates a template once per item from an iterable. The context for
 * each instantiated template inherits from the outer context with the given loop variable set
 * to the current item from the iterable.
 *
 * ### Local Variables
 *
 * `NgFor` provides several exported values that can be aliased to local variables:
 *
 * * `index` will be set to the current loop iteration for each template context.
 * * `first` will be set to a boolean value indicating whether the item is the first one in the
 *   iteration.
 * * `last` will be set to a boolean value indicating whether the item is the last one in the
 *   iteration.
 * * `even` will be set to a boolean value indicating whether this item has an even index.
 * * `odd` will be set to a boolean value indicating whether this item has an odd index.
 *
 * ### Change Propagation
 *
 * When the contents of the iterator changes, `NgFor` makes the corresponding changes to the DOM:
 *
 * * When an item is added, a new instance of the template is added to the DOM.
 * * When an item is removed, its template instance is removed from the DOM.
 * * When items are reordered, their respective templates are reordered in the DOM.
 * * Otherwise, the DOM element for that item will remain the same.
 *
 * Angular uses object identity to track insertions and deletions within the iterator and reproduce
 * those changes in the DOM. This has important implications for animations and any stateful
 * controls
 * (such as `<input>` elements which accept user input) that are present. Inserted rows can be
 * animated in, deleted rows can be animated out, and unchanged rows retain any unsaved state such
 * as user input.
 *
 * It is possible for the identities of elements in the iterator to change while the data does not.
 * This can happen, for example, if the iterator produced from an RPC to the server, and that
 * RPC is re-run. Even if the data hasn't changed, the second response will produce objects with
 * different identities, and Angular will tear down the entire DOM and rebuild it (as if all old
 * elements were deleted and all new elements inserted). This is an expensive operation and should
 * be avoided if possible.
 *
 * ### Syntax
 *
 * - `<li *ngFor="#item of items; #i = index">...</li>`
 * - `<li template="ngFor #item of items; #i = index">...</li>`
 * - `<template ngFor #item [ngForOf]="items" #i="index"><li>...</li></template>`
 *
 * ### Example
 *
 * See a [live demo](http://plnkr.co/edit/KVuXxDp0qinGDyo307QW?p=preview) for a more detailed
 * example.
 */
export let NgFor = class NgFor {
    constructor(_viewContainer, _templateRef, _iterableDiffers, _cdr) {
        this._viewContainer = _viewContainer;
        this._templateRef = _templateRef;
        this._iterableDiffers = _iterableDiffers;
        this._cdr = _cdr;
    }
    set ngForOf(value) {
        this._ngForOf = value;
        if (isBlank(this._differ) && isPresent(value)) {
            try {
                this._differ = this._iterableDiffers.find(value).create(this._cdr, this._ngForTrackBy);
            }
            catch (e) {
                throw new BaseException(`Cannot find a differ supporting object '${value}' of type '${getTypeNameForDebugging(value)}'. NgFor only supports binding to Iterables such as Arrays.`);
            }
        }
    }
    set ngForTemplate(value) {
        if (isPresent(value)) {
            this._templateRef = value;
        }
    }
    set ngForTrackBy(value) { this._ngForTrackBy = value; }
    ngDoCheck() {
        if (isPresent(this._differ)) {
            var changes = this._differ.diff(this._ngForOf);
            if (isPresent(changes))
                this._applyChanges(changes);
        }
    }
    _applyChanges(changes) {
        // TODO(rado): check if change detection can produce a change record that is
        // easier to consume than current.
        var recordViewTuples = [];
        changes.forEachRemovedItem((removedRecord) => recordViewTuples.push(new RecordViewTuple(removedRecord, null)));
        changes.forEachMovedItem((movedRecord) => recordViewTuples.push(new RecordViewTuple(movedRecord, null)));
        var insertTuples = this._bulkRemove(recordViewTuples);
        changes.forEachAddedItem((addedRecord) => insertTuples.push(new RecordViewTuple(addedRecord, null)));
        this._bulkInsert(insertTuples);
        for (var i = 0; i < insertTuples.length; i++) {
            this._perViewChange(insertTuples[i].view, insertTuples[i].record);
        }
        for (var i = 0, ilen = this._viewContainer.length; i < ilen; i++) {
            var viewRef = this._viewContainer.get(i);
            viewRef.setLocal('first', i === 0);
            viewRef.setLocal('last', i === ilen - 1);
        }
        changes.forEachIdentityChange((record) => {
            var viewRef = this._viewContainer.get(record.currentIndex);
            viewRef.setLocal('\$implicit', record.item);
        });
    }
    _perViewChange(view, record) {
        view.setLocal('\$implicit', record.item);
        view.setLocal('index', record.currentIndex);
        view.setLocal('even', (record.currentIndex % 2 == 0));
        view.setLocal('odd', (record.currentIndex % 2 == 1));
    }
    _bulkRemove(tuples) {
        tuples.sort((a, b) => a.record.previousIndex - b.record.previousIndex);
        var movedTuples = [];
        for (var i = tuples.length - 1; i >= 0; i--) {
            var tuple = tuples[i];
            // separate moved views from removed views.
            if (isPresent(tuple.record.currentIndex)) {
                tuple.view = this._viewContainer.detach(tuple.record.previousIndex);
                movedTuples.push(tuple);
            }
            else {
                this._viewContainer.remove(tuple.record.previousIndex);
            }
        }
        return movedTuples;
    }
    _bulkInsert(tuples) {
        tuples.sort((a, b) => a.record.currentIndex - b.record.currentIndex);
        for (var i = 0; i < tuples.length; i++) {
            var tuple = tuples[i];
            if (isPresent(tuple.view)) {
                this._viewContainer.insert(tuple.view, tuple.record.currentIndex);
            }
            else {
                tuple.view =
                    this._viewContainer.createEmbeddedView(this._templateRef, tuple.record.currentIndex);
            }
        }
        return tuples;
    }
};
NgFor = __decorate([
    Directive({ selector: '[ngFor][ngForOf]', inputs: ['ngForTrackBy', 'ngForOf', 'ngForTemplate'] }), 
    __metadata('design:paramtypes', [ViewContainerRef, TemplateRef, IterableDiffers, ChangeDetectorRef])
], NgFor);
class RecordViewTuple {
    constructor(record, view) {
        this.record = record;
        this.view = view;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1OTldaWXdmRC50bXAvYW5ndWxhcjIvc3JjL2NvbW1vbi9kaXJlY3RpdmVzL25nX2Zvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUVMLFNBQVMsRUFDVCxpQkFBaUIsRUFFakIsZUFBZSxFQUNmLGdCQUFnQixFQUNoQixXQUFXLEVBR1osTUFBTSxlQUFlO09BQ2YsRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFhLHVCQUF1QixFQUFDLE1BQU0sMEJBQTBCO09BS3hGLEVBQUMsYUFBYSxFQUFDLE1BQU0seUJBQXlCO0FBRXJEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtERztBQUVIO0lBT0UsWUFBb0IsY0FBZ0MsRUFBVSxZQUF5QixFQUNuRSxnQkFBaUMsRUFBVSxJQUF1QjtRQURsRSxtQkFBYyxHQUFkLGNBQWMsQ0FBa0I7UUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBYTtRQUNuRSxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWlCO1FBQVUsU0FBSSxHQUFKLElBQUksQ0FBbUI7SUFBRyxDQUFDO0lBRTFGLElBQUksT0FBTyxDQUFDLEtBQVU7UUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDdEIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQztnQkFDSCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3pGLENBQUU7WUFBQSxL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NUdEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLGtCQUFrQixFQUFFLE1BQU0sRUFBRSxDQUFDLGNBQWMsRUFBRSxTQUFTLEVBQUUsZUFBZSxDQUFDLEVBQUMsQ0FBQzs7U0FBQTtBQThHaEc7SUFHRSxZQUFZLE1BQVcsRUFBRSxJQUFxQjtRQUM1QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNuQixDQUFDO0FBQ0gsQ0FBQztBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgRG9DaGVjayxcbiAgRGlyZWN0aXZlLFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgSXRlcmFibGVEaWZmZXIsXG4gIEl0ZXJhYmxlRGlmZmVycyxcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgVGVtcGxhdGVSZWYsXG4gIEVtYmVkZGVkVmlld1JlZixcbiAgVHJhY2tCeUZuXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmssIHN0cmluZ2lmeSwgZ2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1xuICBEZWZhdWx0SXRlcmFibGVEaWZmZXIsXG4gIENvbGxlY3Rpb25DaGFuZ2VSZWNvcmRcbn0gZnJvbSBcIi4uLy4uL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9kaWZmZXJzL2RlZmF1bHRfaXRlcmFibGVfZGlmZmVyXCI7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gXCIuLi8uLi9mYWNhZGUvZXhjZXB0aW9uc1wiO1xuXG4vKipcbiAqIFRoZSBgTmdGb3JgIGRpcmVjdGl2ZSBpbnN0YW50aWF0ZXMgYSB0ZW1wbGF0ZSBvbmNlIHBlciBpdGVtIGZyb20gYW4gaXRlcmFibGUuIFRoZSBjb250ZXh0IGZvclxuICogZWFjaCBpbnN0YW50aWF0ZWQgdGVtcGxhdGUgaW5oZXJpdHMgZnJvbSB0aGUgb3V0ZXIgY29udGV4dCB3aXRoIHRoZSBnaXZlbiBsb29wIHZhcmlhYmxlIHNldFxuICogdG8gdGhlIGN1cnJlbnQgaXRlbSBmcm9tIHRoZSBpdGVyYWJsZS5cbiAqXG4gKiAjIyMgTG9jYWwgVmFyaWFibGVzXG4gKlxuICogYE5nRm9yYCBwcm92aWRlcyBzZXZlcmFsIGV4cG9ydGVkIHZhbHVlcyB0aGF0IGNhbiBiZSBhbGlhc2VkIHRvIGxvY2FsIHZhcmlhYmxlczpcbiAqXG4gKiAqIGBpbmRleGAgd2lsbCBiZSBzZXQgdG8gdGhlIGN1cnJlbnQgbG9vcCBpdGVyYXRpb24gZm9yIGVhY2ggdGVtcGxhdGUgY29udGV4dC5cbiAqICogYGZpcnN0YCB3aWxsIGJlIHNldCB0byBhIGJvb2xlYW4gdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBpdGVtIGlzIHRoZSBmaXJzdCBvbmUgaW4gdGhlXG4gKiAgIGl0ZXJhdGlvbi5cbiAqICogYGxhc3RgIHdpbGwgYmUgc2V0IHRvIGEgYm9vbGVhbiB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIGl0ZW0gaXMgdGhlIGxhc3Qgb25lIGluIHRoZVxuICogICBpdGVyYXRpb24uXG4gKiAqIGBldmVuYCB3aWxsIGJlIHNldCB0byBhIGJvb2xlYW4gdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHRoaXMgaXRlbSBoYXMgYW4gZXZlbiBpbmRleC5cbiAqICogYG9kZGAgd2lsbCBiZSBzZXQgdG8gYSBib29sZWFuIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciB0aGlzIGl0ZW0gaGFzIGFuIG9kZCBpbmRleC5cbiAqXG4gKiAjIyMgQ2hhbmdlIFByb3BhZ2F0aW9uXG4gKlxuICogV2hlbiB0aGUgY29udGVudHMgb2YgdGhlIGl0ZXJhdG9yIGNoYW5nZXMsIGBOZ0ZvcmAgbWFrZXMgdGhlIGNvcnJlc3BvbmRpbmcgY2hhbmdlcyB0byB0aGUgRE9NOlxuICpcbiAqICogV2hlbiBhbiBpdGVtIGlzIGFkZGVkLCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgdGVtcGxhdGUgaXMgYWRkZWQgdG8gdGhlIERPTS5cbiAqICogV2hlbiBhbiBpdGVtIGlzIHJlbW92ZWQsIGl0cyB0ZW1wbGF0ZSBpbnN0YW5jZSBpcyByZW1vdmVkIGZyb20gdGhlIERPTS5cbiAqICogV2hlbiBpdGVtcyBhcmUgcmVvcmRlcmVkLCB0aGVpciByZXNwZWN0aXZlIHRlbXBsYXRlcyBhcmUgcmVvcmRlcmVkIGluIHRoZSBET00uXG4gKiAqIE90aGVyd2lzZSwgdGhlIERPTSBlbGVtZW50IGZvciB0aGF0IGl0ZW0gd2lsbCByZW1haW4gdGhlIHNhbWUuXG4gKlxuICogQW5ndWxhciB1c2VzIG9iamVjdCBpZGVudGl0eSB0byB0cmFjayBpbnNlcnRpb25zIGFuZCBkZWxldGlvbnMgd2l0aGluIHRoZSBpdGVyYXRvciBhbmQgcmVwcm9kdWNlXG4gKiB0aG9zZSBjaGFuZ2VzIGluIHRoZSBET00uIFRoaXMgaGFzIGltcG9ydGFudCBpbXBsaWNhdGlvbnMgZm9yIGFuaW1hdGlvbnMgYW5kIGFueSBzdGF0ZWZ1bFxuICogY29udHJvbHNcbiAqIChzdWNoIGFzIGA8aW5wdXQ+YCBlbGVtZW50cyB3aGljaCBhY2NlcHQgdXNlciBpbnB1dCkgdGhhdCBhcmUgcHJlc2VudC4gSW5zZXJ0ZWQgcm93cyBjYW4gYmVcbiAqIGFuaW1hdGVkIGluLCBkZWxldGVkIHJvd3MgY2FuIGJlIGFuaW1hdGVkIG91dCwgYW5kIHVuY2hhbmdlZCByb3dzIHJldGFpbiBhbnkgdW5zYXZlZCBzdGF0ZSBzdWNoXG4gKiBhcyB1c2VyIGlucHV0LlxuICpcbiAqIEl0IGlzIHBvc3NpYmxlIGZvciB0aGUgaWRlbnRpdGllcyBvZiBlbGVtZW50cyBpbiB0aGUgaXRlcmF0b3IgdG8gY2hhbmdlIHdoaWxlIHRoZSBkYXRhIGRvZXMgbm90LlxuICogVGhpcyBjYW4gaGFwcGVuLCBmb3IgZXhhbXBsZSwgaWYgdGhlIGl0ZXJhdG9yIHByb2R1Y2VkIGZyb20gYW4gUlBDIHRvIHRoZSBzZXJ2ZXIsIGFuZCB0aGF0XG4gKiBSUEMgaXMgcmUtcnVuLiBFdmVuIGlmIHRoZSBkYXRhIGhhc24ndCBjaGFuZ2VkLCB0aGUgc2Vjb25kIHJlc3BvbnNlIHdpbGwgcHJvZHVjZSBvYmplY3RzIHdpdGhcbiAqIGRpZmZlcmVudCBpZGVudGl0aWVzLCBhbmQgQW5ndWxhciB3aWxsIHRlYXIgZG93biB0aGUgZW50aXJlIERPTSBhbmQgcmVidWlsZCBpdCAoYXMgaWYgYWxsIG9sZFxuICogZWxlbWVudHMgd2VyZSBkZWxldGVkIGFuZCBhbGwgbmV3IGVsZW1lbnRzIGluc2VydGVkKS4gVGhpcyBpcyBhbiBleHBlbnNpdmUgb3BlcmF0aW9uIGFuZCBzaG91bGRcbiAqIGJlIGF2b2lkZWQgaWYgcG9zc2libGUuXG4gKlxuICogIyMjIFN5bnRheFxuICpcbiAqIC0gYDxsaSAqbmdGb3I9XCIjaXRlbSBvZiBpdGVtczsgI2kgPSBpbmRleFwiPi4uLjwvbGk+YFxuICogLSBgPGxpIHRlbXBsYXRlPVwibmdGb3IgI2l0ZW0gb2YgaXRlbXM7ICNpID0gaW5kZXhcIj4uLi48L2xpPmBcbiAqIC0gYDx0ZW1wbGF0ZSBuZ0ZvciAjaXRlbSBbbmdGb3JPZl09XCJpdGVtc1wiICNpPVwiaW5kZXhcIj48bGk+Li4uPC9saT48L3RlbXBsYXRlPmBcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFNlZSBhIFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0tWdVh4RHAwcWluR0R5bzMwN1FXP3A9cHJldmlldykgZm9yIGEgbW9yZSBkZXRhaWxlZFxuICogZXhhbXBsZS5cbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdGb3JdW25nRm9yT2ZdJywgaW5wdXRzOiBbJ25nRm9yVHJhY2tCeScsICduZ0Zvck9mJywgJ25nRm9yVGVtcGxhdGUnXX0pXG5leHBvcnQgY2xhc3MgTmdGb3IgaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbmdGb3JPZjogYW55O1xuICAvKiogQGludGVybmFsICovXG4gIF9uZ0ZvclRyYWNrQnk6IFRyYWNrQnlGbjtcbiAgcHJpdmF0ZSBfZGlmZmVyOiBJdGVyYWJsZURpZmZlcjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF92aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCBwcml2YXRlIF90ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWYsXG4gICAgICAgICAgICAgIHByaXZhdGUgX2l0ZXJhYmxlRGlmZmVyczogSXRlcmFibGVEaWZmZXJzLCBwcml2YXRlIF9jZHI6IENoYW5nZURldGVjdG9yUmVmKSB7fVxuXG4gIHNldCBuZ0Zvck9mKHZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLl9uZ0Zvck9mID0gdmFsdWU7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5fZGlmZmVyKSAmJiBpc1ByZXNlbnQodmFsdWUpKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLl9kaWZmZXIgPSB0aGlzLl9pdGVyYWJsZURpZmZlcnMuZmluZCh2YWx1ZSkuY3JlYXRlKHRoaXMuX2NkciwgdGhpcy5fbmdGb3JUcmFja0J5KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgICBgQ2Fubm90IGZpbmQgYSBkaWZmZXIgc3VwcG9ydGluZyBvYmplY3QgJyR7dmFsdWV9JyBvZiB0eXBlICcke2dldFR5cGVOYW1lRm9yRGVidWdnaW5nKHZhbHVlKX0nLiBOZ0ZvciBvbmx5IHN1cHBvcnRzIGJpbmRpbmcgdG8gSXRlcmFibGVzIHN1Y2ggYXMgQXJyYXlzLmApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldCBuZ0ZvclRlbXBsYXRlKHZhbHVlOiBUZW1wbGF0ZVJlZikge1xuICAgIGlmIChpc1ByZXNlbnQodmFsdWUpKSB7XG4gICAgICB0aGlzLl90ZW1wbGF0ZVJlZiA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHNldCBuZ0ZvclRyYWNrQnkodmFsdWU6IFRyYWNrQnlGbikgeyB0aGlzLl9uZ0ZvclRyYWNrQnkgPSB2YWx1ZTsgfVxuXG4gIG5nRG9DaGVjaygpIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2RpZmZlcikpIHtcbiAgICAgIHZhciBjaGFuZ2VzID0gdGhpcy5fZGlmZmVyLmRpZmYodGhpcy5fbmdGb3JPZik7XG4gICAgICBpZiAoaXNQcmVzZW50KGNoYW5nZXMpKSB0aGlzLl9hcHBseUNoYW5nZXMoY2hhbmdlcyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlDaGFuZ2VzKGNoYW5nZXM6IERlZmF1bHRJdGVyYWJsZURpZmZlcikge1xuICAgIC8vIFRPRE8ocmFkbyk6IGNoZWNrIGlmIGNoYW5nZSBkZXRlY3Rpb24gY2FuIHByb2R1Y2UgYSBjaGFuZ2UgcmVjb3JkIHRoYXQgaXNcbiAgICAvLyBlYXNpZXIgdG8gY29uc3VtZSB0aGFuIGN1cnJlbnQuXG4gICAgdmFyIHJlY29yZFZpZXdUdXBsZXM6IFJlY29yZFZpZXdUdXBsZVtdID0gW107XG4gICAgY2hhbmdlcy5mb3JFYWNoUmVtb3ZlZEl0ZW0oKHJlbW92ZWRSZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY29yZFZpZXdUdXBsZXMucHVzaChuZXcgUmVjb3JkVmlld1R1cGxlKHJlbW92ZWRSZWNvcmQsIG51bGwpKSk7XG5cbiAgICBjaGFuZ2VzLmZvckVhY2hNb3ZlZEl0ZW0oKG1vdmVkUmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjb3JkVmlld1R1cGxlcy5wdXNoKG5ldyBSZWNvcmRWaWV3VHVwbGUobW92ZWRSZWNvcmQsIG51bGwpKSk7XG5cbiAgICB2YXIgaW5zZXJ0VHVwbGVzID0gdGhpcy5fYnVsa1JlbW92ZShyZWNvcmRWaWV3VHVwbGVzKTtcblxuICAgIGNoYW5nZXMuZm9yRWFjaEFkZGVkSXRlbSgoYWRkZWRSZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnRUdXBsZXMucHVzaChuZXcgUmVjb3JkVmlld1R1cGxlKGFkZGVkUmVjb3JkLCBudWxsKSkpO1xuXG4gICAgdGhpcy5fYnVsa0luc2VydChpbnNlcnRUdXBsZXMpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbnNlcnRUdXBsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuX3BlclZpZXdDaGFuZ2UoaW5zZXJ0VHVwbGVzW2ldLnZpZXcsIGluc2VydFR1cGxlc1tpXS5yZWNvcmQpO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwLCBpbGVuID0gdGhpcy5fdmlld0NvbnRhaW5lci5sZW5ndGg7IGkgPCBpbGVuOyBpKyspIHtcbiAgICAgIHZhciB2aWV3UmVmID0gPEVtYmVkZGVkVmlld1JlZj50aGlzLl92aWV3Q29udGFpbmVyLmdldChpKTtcbiAgICAgIHZpZXdSZWYuc2V0TG9jYWwoJ2ZpcnN0JywgaSA9PT0gMCk7XG4gICAgICB2aWV3UmVmLnNldExvY2FsKCdsYXN0JywgaSA9PT0gaWxlbiAtIDEpO1xuICAgIH1cblxuICAgIGNoYW5nZXMuZm9yRWFjaElkZW50aXR5Q2hhbmdlKChyZWNvcmQpID0+IHtcbiAgICAgIHZhciB2aWV3UmVmID0gPEVtYmVkZGVkVmlld1JlZj50aGlzLl92aWV3Q29udGFpbmVyLmdldChyZWNvcmQuY3VycmVudEluZGV4KTtcbiAgICAgIHZpZXdSZWYuc2V0TG9jYWwoJ1xcJGltcGxpY2l0JywgcmVjb3JkLml0ZW0pO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGVyVmlld0NoYW5nZSh2aWV3OiBFbWJlZGRlZFZpZXdSZWYsIHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCkge1xuICAgIHZpZXcuc2V0TG9jYWwoJ1xcJGltcGxpY2l0JywgcmVjb3JkLml0ZW0pO1xuICAgIHZpZXcuc2V0TG9jYWwoJ2luZGV4JywgcmVjb3JkLmN1cnJlbnRJbmRleCk7XG4gICAgdmlldy5zZXRMb2NhbCgnZXZlbicsIChyZWNvcmQuY3VycmVudEluZGV4ICUgMiA9PSAwKSk7XG4gICAgdmlldy5zZXRMb2NhbCgnb2RkJywgKHJlY29yZC5jdXJyZW50SW5kZXggJSAyID09IDEpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2J1bGtSZW1vdmUodHVwbGVzOiBSZWNvcmRWaWV3VHVwbGVbXSk6IFJlY29yZFZpZXdUdXBsZVtdIHtcbiAgICB0dXBsZXMuc29ydCgoYTogUmVjb3JkVmlld1R1cGxlLCBiOiBSZWNvcmRWaWV3VHVwbGUpID0+XG4gICAgICAgICAgICAgICAgICAgIGEucmVjb3JkLnByZXZpb3VzSW5kZXggLSBiLnJlY29yZC5wcmV2aW91c0luZGV4KTtcbiAgICB2YXIgbW92ZWRUdXBsZXM6IFJlY29yZFZpZXdUdXBsZVtdID0gW107XG4gICAgZm9yICh2YXIgaSA9IHR1cGxlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIHR1cGxlID0gdHVwbGVzW2ldO1xuICAgICAgLy8gc2VwYXJhdGUgbW92ZWQgdmlld3MgZnJvbSByZW1vdmVkIHZpZXdzLlxuICAgICAgaWYgKGlzUHJlc2VudCh0dXBsZS5yZWNvcmQuY3VycmVudEluZGV4KSkge1xuICAgICAgICB0dXBsZS52aWV3ID0gdGhpcy5fdmlld0NvbnRhaW5lci5kZXRhY2godHVwbGUucmVjb3JkLnByZXZpb3VzSW5kZXgpO1xuICAgICAgICBtb3ZlZFR1cGxlcy5wdXNoKHR1cGxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXIucmVtb3ZlKHR1cGxlLnJlY29yZC5wcmV2aW91c0luZGV4KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1vdmVkVHVwbGVzO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVsa0luc2VydCh0dXBsZXM6IFJlY29yZFZpZXdUdXBsZVtdKTogUmVjb3JkVmlld1R1cGxlW10ge1xuICAgIHR1cGxlcy5zb3J0KChhLCBiKSA9PiBhLnJlY29yZC5jdXJyZW50SW5kZXggLSBiLnJlY29yZC5jdXJyZW50SW5kZXgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHVwbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdHVwbGUgPSB0dXBsZXNbaV07XG4gICAgICBpZiAoaXNQcmVzZW50KHR1cGxlLnZpZXcpKSB7XG4gICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXIuaW5zZXJ0KHR1cGxlLnZpZXcsIHR1cGxlLnJlY29yZC5jdXJyZW50SW5kZXgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHVwbGUudmlldyA9XG4gICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLl90ZW1wbGF0ZVJlZiwgdHVwbGUucmVjb3JkLmN1cnJlbnRJbmRleCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0dXBsZXM7XG4gIH1cbn1cblxuY2xhc3MgUmVjb3JkVmlld1R1cGxlIHtcbiAgdmlldzogRW1iZWRkZWRWaWV3UmVmO1xuICByZWNvcmQ6IGFueTtcbiAgY29uc3RydWN0b3IocmVjb3JkOiBhbnksIHZpZXc6IEVtYmVkZGVkVmlld1JlZikge1xuICAgIHRoaXMucmVjb3JkID0gcmVjb3JkO1xuICAgIHRoaXMudmlldyA9IHZpZXc7XG4gIH1cbn1cbiJdfQ==