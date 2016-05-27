var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { AppElement } from './element';
import { isPresent, isBlank, CONST, CONST_EXPR } from 'angular2/src/facade/lang';
import { ObservableWrapper } from 'angular2/src/facade/async';
import { ViewRef_ } from './view_ref';
import { ViewType } from './view_type';
import { flattenNestedViewRenderNodes, ensureSlotCount, arrayLooseIdentical, mapLooseIdentical } from './view_utils';
import { ChangeDetectionStrategy, ChangeDetectorState } from 'angular2/src/core/change_detection/change_detection';
import { wtfCreateScope, wtfLeave } from '../profile/profile';
import { ExpressionChangedAfterItHasBeenCheckedException, ViewDestroyedException, ViewWrappedException } from './exceptions';
import { DebugContext } from './debug_context';
import { ElementInjector } from './element_injector';
export const HOST_VIEW_ELEMENT_NAME = '$hostViewEl';
const EMPTY_CONTEXT = CONST_EXPR(new Object());
var _scope_check = wtfCreateScope(`AppView#check(ascii id)`);
/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
export class AppView {
    constructor(clazz, componentType, type, locals, viewManager, parentInjector, declarationAppElement, cdMode, literalArrayCacheSize, literalMapCacheSize) {
        this.clazz = clazz;
        this.componentType = componentType;
        this.type = type;
        this.locals = locals;
        this.viewManager = viewManager;
        this.parentInjector = parentInjector;
        this.declarationAppElement = declarationAppElement;
        this.cdMode = cdMode;
        this.contentChildren = [];
        this.viewChildren = [];
        this.viewContainerElement = null;
        // The names of the below fields must be kept in sync with codegen_name_util.ts or
        // change detection will fail.
        this.cdState = ChangeDetectorState.NeverChecked;
        /**
         * The context against which data-binding expressions in this view are evaluated against.
         * This is always a component instance.
         */
        this.context = null;
        this.destroyed = false;
        this.ref = new ViewRef_(this);
        if (type === ViewType.COMPONENT || type === ViewType.HOST) {
            this.renderer = viewManager.renderComponent(componentType);
        }
        else {
            this.renderer = declarationAppElement.parentView.renderer;
        }
        this._literalArrayCache = ListWrapper.createFixedSize(literalArrayCacheSize);
        this._literalMapCache = ListWrapper.createFixedSize(literalMapCacheSize);
    }
    create(givenProjectableNodes, rootSelector) {
        var context;
        var projectableNodes;
        switch (this.type) {
            case ViewType.COMPONENT:
                context = this.declarationAppElement.component;
                projectableNodes = ensureSlotCount(givenProjectableNodes, this.componentType.slotCount);
                break;
            case ViewType.EMBEDDED:
                context = this.declarationAppElement.parentView.context;
                projectableNodes = this.declarationAppElement.parentView.projectableNodes;
                break;
            case ViewType.HOST:
                context = EMPTY_CONTEXT;
                // Note: Don't ensure the slot count for the projectableNodes as we store
                // them only for the contained component view (which will later check the slot count...)
                projectableNodes = givenProjectableNodes;
                break;
        }
        this.context = context;
        this.projectableNodes = projectableNodes;
        this.createInternal(rootSelector);
    }
    /**
     * Overwritten by implementations
     */
    createInternal(rootSelector) { }
    init(rootNodesOrAppElements, allNodes, appElements, disposables, subscriptions) {
        this.rootNodesOrAppElements = rootNodesOrAppElements;
        this.allNodes = allNodes;
        this.namedAppElements = appElements;
        this.disposables = disposables;
        this.subscriptions = subscriptions;
        if (this.type === ViewType.COMPONENT) {
            // Note: the render nodes have been attached to their host element
            // in the ViewFactory already.
            this.declarationAppElement.parentView.viewChildren.push(this);
            this.dirtyParentQueriesInternal();
        }
    }
    getHostViewElement() { return this.namedAppElements[HOST_VIEW_ELEMENT_NAME]; }
    injectorGet(token, nodeIndex, notFoundResult) {
        return this.injectorGetInternal(token, nodeIndex, notFoundResult);
    }
    /**
     * Overwritten by implementations
     */
    injectorGetInternal(token, nodeIndex, notFoundResult) {
        return notFoundResult;
    }
    injector(nodeIndex) {
        if (isPresent(nodeIndex)) {
            return new ElementInjector(this, nodeIndex);
        }
        else {
            return this.parentInjector;
        }
    }
    destroy() {
        if (this.destroyed) {
            return;
        }
        var children = this.contentChildren;
        for (var i = 0; i < children.length; i++) {
            children[i].destroy();
        }
        children = this.viewChildren;
        for (var i = 0; i < children.length; i++) {
            children[i].destroy();
        }
        this.destroyLocal();
        this.destroyed = true;
    }
    destroyLocal() {
        var hostElement = this.type === ViewType.COMPONENT ? this.declarationAppElement.nativeElement : null;
        this.renderer.destroyView(hostElement, this.allNodes);
        for (var i = 0; i < this.disposables.length; i++) {
            this.disposables[i]();
        }
        for (var i = 0; i < this.subscriptions.length; i++) {
            ObservableWrapper.dispose(this.subscriptions[i]);
        }
        this.destroyInternal();
        this.dirtyParentQueriesInternal();
    }
    /**
     * Overwritten by implementations
     */
    destroyInternal() { }
    get changeDetectorRef() { return this.ref; }
    get flatRootNodes() { return flattenNestedViewRenderNodes(this.rootNodesOrAppElements); }
    get lastRootNode() {
        var lastNode = this.rootNodesOrAppElements.length > 0 ?
            this.rootNodesOrAppElements[this.rootNodesOrAppElements.length - 1] :
            null;
        return _findLastRenderNode(lastNode);
    }
    hasLocal(contextName) {
        return StringMapWrapper.contains(this.locals, contextName);
    }
    setLocal(contextName, value) { this.locals[contextName] = value; }
    /**
     * Overwritten by implementations
     */
    dirtyParentQueriesInternal() { }
    detectChanges(throwOnChange) {
        var s = _scope_check(this.clazz);
        if (this.cdMode === ChangeDetectionStrategy.Detached ||
            this.cdMode === ChangeDetectionStrategy.Checked ||
            this.cdState === ChangeDetectorState.Errored)
            return;
        if (this.destroyed) {
            this.throwDestroyedError('detectChanges');
        }
        this.detectChangesInternal(throwOnChange);
        if (this.cdMode === ChangeDetectionStrategy.CheckOnce)
            this.cdMode = ChangeDetectionStrategy.Checked;
        this.cdState = ChangeDetectorState.CheckedBefore;
        wtfLeave(s);
    }
    /**
     * Overwritten by implementations
     */
    detectChangesInternal(throwOnChange) {
        this.detectContentChildrenChanges(throwOnChange);
        this.detectViewChildrenChanges(throwOnChange);
    }
    detectContentChildrenChanges(throwOnChange) {
        for (var i = 0; i < this.contentChildren.length; ++i) {
            this.contentChildren[i].detectChanges(throwOnChange);
        }
    }
    detectViewChildrenChanges(throwOnChange) {
        for (var i = 0; i < this.viewChildren.length; ++i) {
            this.viewChildren[i].detectChanges(throwOnChange);
        }
    }
    addToContentChildren(renderAppElement) {
        renderAppElement.parentView.contentChildren.push(this);
        this.viewContainerElement = renderAppElement;
        this.dirtyParentQueriesInternal();
    }
    removeFromContentChildren(renderAppElement) {
        ListWrapper.remove(renderAppElement.parentView.contentChildren, this);
        this.dirtyParentQueriesInternal();
        this.viewContainerElement = null;
    }
    literalArray(id, value) {
        var prevValue = this._literalArrayCache[id];
        if (isBlank(value)) {
            return value;
        }
        if (isBlank(prevValue) || !arrayLooseIdentical(prevValue, value)) {
            prevValue = this._literalArrayCache[id] = value;
        }
        return prevValue;
    }
    literalMap(id, value) {
        var prevValue = this._literalMapCache[id];
        if (isBlank(value)) {
            return value;
        }
        if (isBlank(prevValue) || !mapLooseIdentical(prevValue, value)) {
            prevValue = this._literalMapCache[id] = value;
        }
        return prevValue;
    }
    markAsCheckOnce() { this.cdMode = ChangeDetectionStrategy.CheckOnce; }
    markPathToRootAsCheckOnce() {
        let c = this;
        while (isPresent(c) && c.cdMode !== ChangeDetectionStrategy.Detached) {
            if (c.cdMode === ChangeDetectionStrategy.Checked) {
                c.cdMode = ChangeDetectionStrategy.CheckOnce;
            }
            let parentEl = c.type === ViewType.COMPONENT ? c.declarationAppElement : c.viewContainerElement;
            c = isPresent(parentEl) ? parentEl.parentView : null;
        }
    }
    eventHandler(cb) { return cb; }
    throwDestroyedError(details) { throw new ViewDestroyedException(details); }
}
export class DebugAppView extends AppView {
    constructor(clazz, componentType, type, locals, viewManager, parentInjector, declarationAppElement, cdMode, literalArrayCacheSize, literalMapCacheSize, staticNodeDebugInfos) {
        super(clazz, componentType, type, locals, viewManager, parentInjector, declarationAppElement, cdMode, literalArrayCacheSize, literalMapCacheSize);
        this.staticNodeDebugInfos = staticNodeDebugInfos;
        this._currentDebugContext = null;
    }
    create(givenProjectableNodes, rootSelector) {
        this._resetDebug();
        try {
            super.create(givenProjectableNodes, rootSelector);
        }
        catch (e) {
            this._rethrowWithContext(e, e.stack);
            throw e;
        }
    }
    injectorGet(token, nodeIndex, notFoundResult) {
        this._resetDebug();
        try {
            return super.injectorGet(token, nodeIndex, notFoundResult);
        }
        catch (e) {
            this._rethrowWithContext(e, e.stack);
            throw e;
        }
    }
    destroyLocal() {
        this._resetDebug();
        try {
            super.destroyLocal();
        }
        catch (e) {
            this._rethrowWithContext(e, e.stack);
            throw e;
        }
    }
    detectChanges(throwOnChange) {
        this._resetDebug();
        try {
            super.detectChanges(throwOnChange);
        }
        catch (e) {
            this._rethrowWithContext(e, e.stack);
            throw e;
        }
    }
    _resetDebug() { this._currentDebugContext = null; }
    debug(nodeIndex, rowNum, colNum) {
        return this._currentDebugContext = new DebugContext(this, nodeIndex, rowNum, colNum);
    }
    _rethrowWithContext(e, stack) {
        if (!(e instanceof ViewWrappedException)) {
            if (!(e instanceof ExpressionChangedAfterItHasBeenCheckedException)) {
                this.cdState = ChangeDetectorState.Errored;
            }
            if (isPresent(this._currentDebugContext)) {
                throw new ViewWrappedException(e, stack, this._currentDebugContext);
            }
        }
    }
    eventHandler(cb) {
        var superHandler = super.eventHandler(cb);
        return (event) => {
            this._resetDebug();
            try {
                return superHandler(event);
            }
            catch (e) {
                this._rethrowWithContext(e, e.stack);
                throw e;
            }
        };
    }
}
export let HostViewFactory = class HostViewFactory {
    constructor(selector, viewFactory) {
        this.selector = selector;
        this.viewFactory = viewFactory;
    }
};
HostViewFactory = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [String, Function])
], HostViewFactory);
function _findLastRenderNode(node) {
    var lastNode;
    if (node instanceof AppElement) {
        var appEl = node;
        lastNode = appEl.nativeElement;
        if (isPresent(appEl.nestedViews)) {
            // Note: Views might have no root nodes at all!
            for (var i = appEl.nestedViews.length - 1; i >= 0; i--) {
                var nestedView = appEl.nestedViews[i];
                if (nestedView.rootNodesOrAppElements.length > 0) {
                    lastNode = _findLastRenderNode(nestedView.rootNodesOrAppElements[nestedView.rootNodesOrAppElements.length - 1]);
                }
            }
        }
    }
    else {
        lastNode = node;
    }
    return lastNode;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtc200NmxFNHQudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQ0wsV0FBVyxFQUdYLGdCQUFnQixFQUdqQixNQUFNLGdDQUFnQztPQUdoQyxFQUFDLFVBQVUsRUFBQyxNQUFNLFdBQVc7T0FDN0IsRUFFTCxTQUFTLEVBQ1QsT0FBTyxFQUlQLEtBQUssRUFDTCxVQUFVLEVBR1gsTUFBTSwwQkFBMEI7T0FFMUIsRUFBQyxpQkFBaUIsRUFBQyxNQUFNLDJCQUEyQjtPQUVwRCxFQUFDLFFBQVEsRUFBcUIsTUFBTSxZQUFZO09BR2hELEVBQUMsUUFBUSxFQUFDLE1BQU0sYUFBYTtPQUM3QixFQUNMLDRCQUE0QixFQUM1QixlQUFlLEVBQ2YsbUJBQW1CLEVBQ25CLGlCQUFpQixFQUNsQixNQUFNLGNBQWM7T0FDZCxFQUVMLHVCQUF1QixFQUN2QixtQkFBbUIsRUFHcEIsTUFBTSxxREFBcUQ7T0FDckQsRUFBQyxjQUFjLEVBQUUsUUFBUSxFQUFhLE1BQU0sb0JBQW9CO09BQ2hFLEVBQ0wsK0NBQStDLEVBQy9DLHNCQUFzQixFQUN0QixvQkFBb0IsRUFDckIsTUFBTSxjQUFjO09BQ2QsRUFBc0IsWUFBWSxFQUFDLE1BQU0saUJBQWlCO09BQzFELEVBQUMsZUFBZSxFQUFDLE1BQU0sb0JBQW9CO0FBRWxELE9BQU8sTUFBTSxzQkFBc0IsR0FBRyxhQUFhLENBQUM7QUFFcEQsTUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztBQUUvQyxJQUFJLFlBQVksR0FBZSxjQUFjLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUV6RTs7O0dBR0c7QUFDSDtJQThCRSxZQUFtQixLQUFVLEVBQVMsYUFBa0MsRUFBUyxJQUFjLEVBQzVF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QVEsQ0FBUTtRQUFTLGdCQUFXLEdBQVgsV0FBVyxDQUFVO0lBQUcsQ0FBQztBQUN2RSxDQUFDO0FBSEQ7SUFBQyxLQUFLLEVBQUU7O21CQUFBO0FBS1IsNkJBQTZCLElBQVM7SUFDcEMsSUFBSSxRQUFRLENBQUM7SUFDYixFQUFFLENBQUMsQ0FBQyxJQUFJLFlBQVksVUFBVSxDQUFDLENBQUMsQ0FBQztRQUMvQixJQUFJLEtBQUssR0FBZSxJQUFJLENBQUM7UUFDN0IsUUFBUSxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUM7UUFDL0IsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakMsK0NBQStDO1lBQy9DLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3ZELElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDakQsUUFBUSxHQUFHLG1CQUFtQixDQUMxQixVQUFVLENBQUMsc0JBQXNCLENBQUMsVUFBVSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2RixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQ2xCLENBQUM7SUFDRCxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2xCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBMaXN0V3JhcHBlcixcbiAgTWFwV3JhcHBlcixcbiAgTWFwLFxuICBTdHJpbmdNYXBXcmFwcGVyLFxuICBpc0xpc3RMaWtlSXRlcmFibGUsXG4gIGFyZUl0ZXJhYmxlc0VxdWFsXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7QXBwRWxlbWVudH0gZnJvbSAnLi9lbGVtZW50JztcbmltcG9ydCB7XG4gIGFzc2VydGlvbnNFbmFibGVkLFxuICBpc1ByZXNlbnQsXG4gIGlzQmxhbmssXG4gIFR5cGUsXG4gIGlzQXJyYXksXG4gIGlzTnVtYmVyLFxuICBDT05TVCxcbiAgQ09OU1RfRVhQUixcbiAgc3RyaW5naWZ5LFxuICBpc1ByaW1pdGl2ZVxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge09ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7UmVuZGVyZXIsIFJvb3RSZW5kZXJlciwgUmVuZGVyQ29tcG9uZW50VHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVuZGVyL2FwaSc7XG5pbXBvcnQge1ZpZXdSZWZfLCBIb3N0Vmlld0ZhY3RvcnlSZWZ9IGZyb20gJy4vdmlld19yZWYnO1xuXG5pbXBvcnQge0FwcFZpZXdNYW5hZ2VyXywgQXBwVmlld01hbmFnZXJ9IGZyb20gJy4vdmlld19tYW5hZ2VyJztcbmltcG9ydCB7Vmlld1R5cGV9IGZyb20gJy4vdmlld190eXBlJztcbmltcG9ydCB7XG4gIGZsYXR0ZW5OZXN0ZWRWaWV3UmVuZGVyTm9kZXMsXG4gIGVuc3VyZVNsb3RDb3VudCxcbiAgYXJyYXlMb29zZUlkZW50aWNhbCxcbiAgbWFwTG9vc2VJZGVudGljYWxcbn0gZnJvbSAnLi92aWV3X3V0aWxzJztcbmltcG9ydCB7XG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JTdGF0ZSxcbiAgaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIGRldk1vZGVFcXVhbFxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rpb24nO1xuaW1wb3J0IHt3dGZDcmVhdGVTY29wZSwgd3RmTGVhdmUsIFd0ZlNjb3BlRm59IGZyb20gJy4uL3Byb2ZpbGUvcHJvZmlsZSc7XG5pbXBvcnQge1xuICBFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEV4Y2VwdGlvbixcbiAgVmlld0Rlc3Ryb3llZEV4Y2VwdGlvbixcbiAgVmlld1dyYXBwZWRFeGNlcHRpb25cbn0gZnJvbSAnLi9leGNlcHRpb25zJztcbmltcG9ydCB7U3RhdGljTm9kZURlYnVnSW5mbywgRGVidWdDb250ZXh0fSBmcm9tICcuL2RlYnVnX2NvbnRleHQnO1xuaW1wb3J0IHtFbGVtZW50SW5qZWN0b3J9IGZyb20gJy4vZWxlbWVudF9pbmplY3Rvcic7XG5cbmV4cG9ydCBjb25zdCBIT1NUX1ZJRVdfRUxFTUVOVF9OQU1FID0gJyRob3N0Vmlld0VsJztcblxuY29uc3QgRU1QVFlfQ09OVEVYVCA9IENPTlNUX0VYUFIobmV3IE9iamVjdCgpKTtcblxudmFyIF9zY29wZV9jaGVjazogV3RmU2NvcGVGbiA9IHd0ZkNyZWF0ZVNjb3BlKGBBcHBWaWV3I2NoZWNrKGFzY2lpIGlkKWApO1xuXG4vKipcbiAqIENvc3Qgb2YgbWFraW5nIG9iamVjdHM6IGh0dHA6Ly9qc3BlcmYuY29tL2luc3RhbnRpYXRlLXNpemUtb2Ytb2JqZWN0XG4gKlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQXBwVmlldzxUPiB7XG4gIHJlZjogVmlld1JlZl87XG4gIHJvb3ROb2Rlc09yQXBwRWxlbWVudHM6IGFueVtdO1xuICBhbGxOb2RlczogYW55W107XG4gIGRpc3Bvc2FibGVzOiBGdW5jdGlvbltdO1xuICBzdWJzY3JpcHRpb25zOiBhbnlbXTtcbiAgbmFtZWRBcHBFbGVtZW50czoge1trZXk6IHN0cmluZ106IEFwcEVsZW1lbnR9O1xuICBjb250ZW50Q2hpbGRyZW46IEFwcFZpZXc8YW55PltdID0gW107XG4gIHZpZXdDaGlsZHJlbjogQXBwVmlldzxhbnk+W10gPSBbXTtcblxuICBwcml2YXRlIF9saXRlcmFsQXJyYXlDYWNoZTogYW55W11bXTtcbiAgcHJpdmF0ZSBfbGl0ZXJhbE1hcENhY2hlOiBBcnJheTx7W2tleTogc3RyaW5nXTogYW55fT47XG4gIHZpZXdDb250YWluZXJFbGVtZW50OiBBcHBFbGVtZW50ID0gbnVsbDtcblxuICAvLyBUaGUgbmFtZXMgb2YgdGhlIGJlbG93IGZpZWxkcyBtdXN0IGJlIGtlcHQgaW4gc3luYyB3aXRoIGNvZGVnZW5fbmFtZV91dGlsLnRzIG9yXG4gIC8vIGNoYW5nZSBkZXRlY3Rpb24gd2lsbCBmYWlsLlxuICBjZFN0YXRlOiBDaGFuZ2VEZXRlY3RvclN0YXRlID0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5OZXZlckNoZWNrZWQ7XG5cbiAgLyoqXG4gICAqIFRoZSBjb250ZXh0IGFnYWluc3Qgd2hpY2ggZGF0YS1iaW5kaW5nIGV4cHJlc3Npb25zIGluIHRoaXMgdmlldyBhcmUgZXZhbHVhdGVkIGFnYWluc3QuXG4gICAqIFRoaXMgaXMgYWx3YXlzIGEgY29tcG9uZW50IGluc3RhbmNlLlxuICAgKi9cbiAgY29udGV4dDogVCA9IG51bGw7XG5cbiAgcHJvamVjdGFibGVOb2RlczogQXJyYXk8YW55IHwgYW55W10+O1xuXG4gIGRlc3Ryb3llZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHJlbmRlcmVyOiBSZW5kZXJlcjtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgY2xheno6IGFueSwgcHVibGljIGNvbXBvbmVudFR5cGU6IFJlbmRlckNvbXBvbmVudFR5cGUsIHB1YmxpYyB0eXBlOiBWaWV3VHlwZSxcbiAgICAgICAgICAgICAgcHVibGljIGxvY2Fsczoge1trZXk6IHN0cmluZ106IGFueX0sIHB1YmxpYyB2aWV3TWFuYWdlcjogQXBwVmlld01hbmFnZXJfLFxuICAgICAgICAgICAgICBwdWJsaWMgcGFyZW50SW5qZWN0b3I6IEluamVjdG9yLCBwdWJsaWMgZGVjbGFyYXRpb25BcHBFbGVtZW50OiBBcHBFbGVtZW50LFxuICAgICAgICAgICAgICBwdWJsaWMgY2RNb2RlOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgbGl0ZXJhbEFycmF5Q2FjaGVTaXplOiBudW1iZXIsXG4gICAgICAgICAgICAgIGxpdGVyYWxNYXBDYWNoZVNpemU6IG51bWJlcikge1xuICAgIHRoaXMucmVmID0gbmV3IFZpZXdSZWZfKHRoaXMpO1xuICAgIGlmICh0eXBlID09PSBWaWV3VHlwZS5DT01QT05FTlQgfHwgdHlwZSA9PT0gVmlld1R5cGUuSE9TVCkge1xuICAgICAgdGhpcy5yZW5kZXJlciA9IHZpZXdNYW5hZ2VyLnJlbmRlckNvbXBvbmVudChjb21wb25lbnRUeXBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZW5kZXJlciA9IGRlY2xhcmF0aW9uQXBwRWxlbWVudC5wYXJlbnRWaWV3LnJlbmRlcmVyO1xuICAgIH1cbiAgICB0aGlzLl9saXRlcmFsQXJyYXlDYWNoZSA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShsaXRlcmFsQXJyYXlDYWNoZVNpemUpO1xuICAgIHRoaXMuX2xpdGVyYWxNYXBDYWNoZSA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShsaXRlcmFsTWFwQ2FjaGVTaXplKTtcbiAgfVxuXG4gIGNyZWF0ZShnaXZlblByb2plY3RhYmxlTm9kZXM6IEFycmF5PGFueSB8IGFueVtdPiwgcm9vdFNlbGVjdG9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB2YXIgY29udGV4dDtcbiAgICB2YXIgcHJvamVjdGFibGVOb2RlcztcbiAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgY2FzZSBWaWV3VHlwZS5DT01QT05FTlQ6XG4gICAgICAgIGNvbnRleHQgPSB0aGlzLmRlY2xhcmF0aW9uQXBwRWxlbWVudC5jb21wb25lbnQ7XG4gICAgICAgIHByb2plY3RhYmxlTm9kZXMgPSBlbnN1cmVTbG90Q291bnQoZ2l2ZW5Qcm9qZWN0YWJsZU5vZGVzLCB0aGlzLmNvbXBvbmVudFR5cGUuc2xvdENvdW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFZpZXdUeXBlLkVNQkVEREVEOlxuICAgICAgICBjb250ZXh0ID0gdGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQucGFyZW50Vmlldy5jb250ZXh0O1xuICAgICAgICBwcm9qZWN0YWJsZU5vZGVzID0gdGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQucGFyZW50Vmlldy5wcm9qZWN0YWJsZU5vZGVzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVmlld1R5cGUuSE9TVDpcbiAgICAgICAgY29udGV4dCA9IEVNUFRZX0NPTlRFWFQ7XG4gICAgICAgIC8vIE5vdGU6IERvbid0IGVuc3VyZSB0aGUgc2xvdCBjb3VudCBmb3IgdGhlIHByb2plY3RhYmxlTm9kZXMgYXMgd2Ugc3RvcmVcbiAgICAgICAgLy8gdGhlbSBvbmx5IGZvciB0aGUgY29udGFpbmVkIGNvbXBvbmVudCB2aWV3ICh3aGljaCB3aWxsIGxhdGVyIGNoZWNrIHRoZSBzbG90IGNvdW50Li4uKVxuICAgICAgICBwcm9qZWN0YWJsZU5vZGVzID0gZ2l2ZW5Qcm9qZWN0YWJsZU5vZGVzO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgICB0aGlzLnByb2plY3RhYmxlTm9kZXMgPSBwcm9qZWN0YWJsZU5vZGVzO1xuICAgIHRoaXMuY3JlYXRlSW50ZXJuYWwocm9vdFNlbGVjdG9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVyd3JpdHRlbiBieSBpbXBsZW1lbnRhdGlvbnNcbiAgICovXG4gIGNyZWF0ZUludGVybmFsKHJvb3RTZWxlY3Rvcjogc3RyaW5nKTogdm9pZCB7fVxuXG4gIGluaXQocm9vdE5vZGVzT3JBcHBFbGVtZW50czogYW55W10sIGFsbE5vZGVzOiBhbnlbXSwgYXBwRWxlbWVudHM6IHtba2V5OiBzdHJpbmddOiBBcHBFbGVtZW50fSxcbiAgICAgICBkaXNwb3NhYmxlczogRnVuY3Rpb25bXSwgc3Vic2NyaXB0aW9uczogYW55W10pIHtcbiAgICB0aGlzLnJvb3ROb2Rlc09yQXBwRWxlbWVudHMgPSByb290Tm9kZXNPckFwcEVsZW1lbnRzO1xuICAgIHRoaXMuYWxsTm9kZXMgPSBhbGxOb2RlcztcbiAgICB0aGlzLm5hbWVkQXBwRWxlbWVudHMgPSBhcHBFbGVtZW50cztcbiAgICB0aGlzLmRpc3Bvc2FibGVzID0gZGlzcG9zYWJsZXM7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gc3Vic2NyaXB0aW9ucztcbiAgICBpZiAodGhpcy50eXBlID09PSBWaWV3VHlwZS5DT01QT05FTlQpIHtcbiAgICAgIC8vIE5vdGU6IHRoZSByZW5kZXIgbm9kZXMgaGF2ZSBiZWVuIGF0dGFjaGVkIHRvIHRoZWlyIGhvc3QgZWxlbWVudFxuICAgICAgLy8gaW4gdGhlIFZpZXdGYWN0b3J5IGFscmVhZHkuXG4gICAgICB0aGlzLmRlY2xhcmF0aW9uQXBwRWxlbWVudC5wYXJlbnRWaWV3LnZpZXdDaGlsZHJlbi5wdXNoKHRoaXMpO1xuICAgICAgdGhpcy5kaXJ0eVBhcmVudFF1ZXJpZXNJbnRlcm5hbCgpO1xuICAgIH1cbiAgfVxuXG4gIGdldEhvc3RWaWV3RWxlbWVudCgpOiBBcHBFbGVtZW50IHsgcmV0dXJuIHRoaXMubmFtZWRBcHBFbGVtZW50c1tIT1NUX1ZJRVdfRUxFTUVOVF9OQU1FXTsgfVxuXG4gIGluamVjdG9yR2V0KHRva2VuOiBhbnksIG5vZGVJbmRleDogbnVtYmVyLCBub3RGb3VuZFJlc3VsdDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5pbmplY3RvckdldEludGVybmFsKHRva2VuLCBub2RlSW5kZXgsIG5vdEZvdW5kUmVzdWx0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVyd3JpdHRlbiBieSBpbXBsZW1lbnRhdGlvbnNcbiAgICovXG4gIGluamVjdG9yR2V0SW50ZXJuYWwodG9rZW46IGFueSwgbm9kZUluZGV4OiBudW1iZXIsIG5vdEZvdW5kUmVzdWx0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBub3RGb3VuZFJlc3VsdDtcbiAgfVxuXG4gIGluamVjdG9yKG5vZGVJbmRleDogbnVtYmVyKTogSW5qZWN0b3Ige1xuICAgIGlmIChpc1ByZXNlbnQobm9kZUluZGV4KSkge1xuICAgICAgcmV0dXJuIG5ldyBFbGVtZW50SW5qZWN0b3IodGhpcywgbm9kZUluZGV4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucGFyZW50SW5qZWN0b3I7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGNoaWxkcmVuID0gdGhpcy5jb250ZW50Q2hpbGRyZW47XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY2hpbGRyZW5baV0uZGVzdHJveSgpO1xuICAgIH1cbiAgICBjaGlsZHJlbiA9IHRoaXMudmlld0NoaWxkcmVuO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNoaWxkcmVuW2ldLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgdGhpcy5kZXN0cm95TG9jYWwoKTtcblxuICAgIHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcbiAgfVxuXG4gIGRlc3Ryb3lMb2NhbCgpIHtcbiAgICB2YXIgaG9zdEVsZW1lbnQgPVxuICAgICAgICB0aGlzLnR5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCA/IHRoaXMuZGVjbGFyYXRpb25BcHBFbGVtZW50Lm5hdGl2ZUVsZW1lbnQgOiBudWxsO1xuICAgIHRoaXMucmVuZGVyZXIuZGVzdHJveVZpZXcoaG9zdEVsZW1lbnQsIHRoaXMuYWxsTm9kZXMpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kaXNwb3NhYmxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5kaXNwb3NhYmxlc1tpXSgpO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc3Vic2NyaXB0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuZGlzcG9zZSh0aGlzLnN1YnNjcmlwdGlvbnNbaV0pO1xuICAgIH1cbiAgICB0aGlzLmRlc3Ryb3lJbnRlcm5hbCgpO1xuXG4gICAgdGhpcy5kaXJ0eVBhcmVudFF1ZXJpZXNJbnRlcm5hbCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJ3cml0dGVuIGJ5IGltcGxlbWVudGF0aW9uc1xuICAgKi9cbiAgZGVzdHJveUludGVybmFsKCk6IHZvaWQge31cblxuICBnZXQgY2hhbmdlRGV0ZWN0b3JSZWYoKTogQ2hhbmdlRGV0ZWN0b3JSZWYgeyByZXR1cm4gdGhpcy5yZWY7IH1cblxuICBnZXQgZmxhdFJvb3ROb2RlcygpOiBhbnlbXSB7IHJldHVybiBmbGF0dGVuTmVzdGVkVmlld1JlbmRlck5vZGVzKHRoaXMucm9vdE5vZGVzT3JBcHBFbGVtZW50cyk7IH1cblxuICBnZXQgbGFzdFJvb3ROb2RlKCk6IGFueSB7XG4gICAgdmFyIGxhc3ROb2RlID0gdGhpcy5yb290Tm9kZXNPckFwcEVsZW1lbnRzLmxlbmd0aCA+IDAgP1xuICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJvb3ROb2Rlc09yQXBwRWxlbWVudHNbdGhpcy5yb290Tm9kZXNPckFwcEVsZW1lbnRzLmxlbmd0aCAtIDFdIDpcbiAgICAgICAgICAgICAgICAgICAgICAgbnVsbDtcbiAgICByZXR1cm4gX2ZpbmRMYXN0UmVuZGVyTm9kZShsYXN0Tm9kZSk7XG4gIH1cblxuICBoYXNMb2NhbChjb250ZXh0TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIFN0cmluZ01hcFdyYXBwZXIuY29udGFpbnModGhpcy5sb2NhbHMsIGNvbnRleHROYW1lKTtcbiAgfVxuXG4gIHNldExvY2FsKGNvbnRleHROYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHsgdGhpcy5sb2NhbHNbY29udGV4dE5hbWVdID0gdmFsdWU7IH1cblxuICAvKipcbiAgICogT3ZlcndyaXR0ZW4gYnkgaW1wbGVtZW50YXRpb25zXG4gICAqL1xuICBkaXJ0eVBhcmVudFF1ZXJpZXNJbnRlcm5hbCgpOiB2b2lkIHt9XG5cbiAgZGV0ZWN0Q2hhbmdlcyh0aHJvd09uQ2hhbmdlOiBib29sZWFuKTogdm9pZCB7XG4gICAgdmFyIHMgPSBfc2NvcGVfY2hlY2sodGhpcy5jbGF6eik7XG4gICAgaWYgKHRoaXMuY2RNb2RlID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZXRhY2hlZCB8fFxuICAgICAgICB0aGlzLmNkTW9kZSA9PT0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tlZCB8fFxuICAgICAgICB0aGlzLmNkU3RhdGUgPT09IENoYW5nZURldGVjdG9yU3RhdGUuRXJyb3JlZClcbiAgICAgIHJldHVybjtcbiAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHtcbiAgICAgIHRoaXMudGhyb3dEZXN0cm95ZWRFcnJvcignZGV0ZWN0Q2hhbmdlcycpO1xuICAgIH1cbiAgICB0aGlzLmRldGVjdENoYW5nZXNJbnRlcm5hbCh0aHJvd09uQ2hhbmdlKTtcbiAgICBpZiAodGhpcy5jZE1vZGUgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrT25jZSlcbiAgICAgIHRoaXMuY2RNb2RlID0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tlZDtcblxuICAgIHRoaXMuY2RTdGF0ZSA9IENoYW5nZURldGVjdG9yU3RhdGUuQ2hlY2tlZEJlZm9yZTtcbiAgICB3dGZMZWF2ZShzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVyd3JpdHRlbiBieSBpbXBsZW1lbnRhdGlvbnNcbiAgICovXG4gIGRldGVjdENoYW5nZXNJbnRlcm5hbCh0aHJvd09uQ2hhbmdlOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5kZXRlY3RDb250ZW50Q2hpbGRyZW5DaGFuZ2VzKHRocm93T25DaGFuZ2UpO1xuICAgIHRoaXMuZGV0ZWN0Vmlld0NoaWxkcmVuQ2hhbmdlcyh0aHJvd09uQ2hhbmdlKTtcbiAgfVxuXG4gIGRldGVjdENvbnRlbnRDaGlsZHJlbkNoYW5nZXModGhyb3dPbkNoYW5nZTogYm9vbGVhbikge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250ZW50Q2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgIHRoaXMuY29udGVudENoaWxkcmVuW2ldLmRldGVjdENoYW5nZXModGhyb3dPbkNoYW5nZSk7XG4gICAgfVxuICB9XG5cbiAgZGV0ZWN0Vmlld0NoaWxkcmVuQ2hhbmdlcyh0aHJvd09uQ2hhbmdlOiBib29sZWFuKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnZpZXdDaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgdGhpcy52aWV3Q2hpbGRyZW5baV0uZGV0ZWN0Q2hhbmdlcyh0aHJvd09uQ2hhbmdlKTtcbiAgICB9XG4gIH1cblxuICBhZGRUb0NvbnRlbnRDaGlsZHJlbihyZW5kZXJBcHBFbGVtZW50OiBBcHBFbGVtZW50KTogdm9pZCB7XG4gICAgcmVuZGVyQXBwRWxlbWVudC5wYXJlbnRWaWV3LmNvbnRlbnRDaGlsZHJlbi5wdXNoKHRoaXMpO1xuICAgIHRoaXMudmlld0NvbnRhaW5lckVsZW1lbnQgPSByZW5kZXJBcHBFbGVtZW50O1xuICAgIHRoaXMuZGlydHlQYXJlbnRRdWVyaWVzSW50ZXJuYWwoKTtcbiAgfVxuXG4gIHJlbW92ZUZyb21Db250ZW50Q2hpbGRyZW4ocmVuZGVyQXBwRWxlbWVudDogQXBwRWxlbWVudCk6IHZvaWQge1xuICAgIExpc3RXcmFwcGVyLnJlbW92ZShyZW5kZXJBcHBFbGVtZW50LnBhcmVudFZpZXcuY29udGVudENoaWxkcmVuLCB0aGlzKTtcbiAgICB0aGlzLmRpcnR5UGFyZW50UXVlcmllc0ludGVybmFsKCk7XG4gICAgdGhpcy52aWV3Q29udGFpbmVyRWxlbWVudCA9IG51bGw7XG4gIH1cblxuICBsaXRlcmFsQXJyYXkoaWQ6IG51bWJlciwgdmFsdWU6IGFueVtdKTogYW55W10ge1xuICAgIHZhciBwcmV2VmFsdWUgPSB0aGlzLl9saXRlcmFsQXJyYXlDYWNoZVtpZF07XG4gICAgaWYgKGlzQmxhbmsodmFsdWUpKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIGlmIChpc0JsYW5rKHByZXZWYWx1ZSkgfHwgIWFycmF5TG9vc2VJZGVudGljYWwocHJldlZhbHVlLCB2YWx1ZSkpIHtcbiAgICAgIHByZXZWYWx1ZSA9IHRoaXMuX2xpdGVyYWxBcnJheUNhY2hlW2lkXSA9IHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gcHJldlZhbHVlO1xuICB9XG5cbiAgbGl0ZXJhbE1hcChpZDogbnVtYmVyLCB2YWx1ZToge1trZXk6IHN0cmluZ106IGFueX0pOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgdmFyIHByZXZWYWx1ZSA9IHRoaXMuX2xpdGVyYWxNYXBDYWNoZVtpZF07XG4gICAgaWYgKGlzQmxhbmsodmFsdWUpKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIGlmIChpc0JsYW5rKHByZXZWYWx1ZSkgfHwgIW1hcExvb3NlSWRlbnRpY2FsKHByZXZWYWx1ZSwgdmFsdWUpKSB7XG4gICAgICBwcmV2VmFsdWUgPSB0aGlzLl9saXRlcmFsTWFwQ2FjaGVbaWRdID0gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiBwcmV2VmFsdWU7XG4gIH1cblxuICBtYXJrQXNDaGVja09uY2UoKTogdm9pZCB7IHRoaXMuY2RNb2RlID0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tPbmNlOyB9XG5cbiAgbWFya1BhdGhUb1Jvb3RBc0NoZWNrT25jZSgpOiB2b2lkIHtcbiAgICBsZXQgYzogQXBwVmlldzxhbnk+ID0gdGhpcztcbiAgICB3aGlsZSAoaXNQcmVzZW50KGMpICYmIGMuY2RNb2RlICE9PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZXRhY2hlZCkge1xuICAgICAgaWYgKGMuY2RNb2RlID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja2VkKSB7XG4gICAgICAgIGMuY2RNb2RlID0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tPbmNlO1xuICAgICAgfVxuICAgICAgbGV0IHBhcmVudEVsID1cbiAgICAgICAgICBjLnR5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCA/IGMuZGVjbGFyYXRpb25BcHBFbGVtZW50IDogYy52aWV3Q29udGFpbmVyRWxlbWVudDtcbiAgICAgIGMgPSBpc1ByZXNlbnQocGFyZW50RWwpID8gcGFyZW50RWwucGFyZW50VmlldyA6IG51bGw7XG4gICAgfVxuICB9XG5cbiAgZXZlbnRIYW5kbGVyKGNiOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHsgcmV0dXJuIGNiOyB9XG5cbiAgdGhyb3dEZXN0cm95ZWRFcnJvcihkZXRhaWxzOiBzdHJpbmcpOiB2b2lkIHsgdGhyb3cgbmV3IFZpZXdEZXN0cm95ZWRFeGNlcHRpb24oZGV0YWlscyk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIERlYnVnQXBwVmlldzxUPiBleHRlbmRzIEFwcFZpZXc8VD4ge1xuICBwcml2YXRlIF9jdXJyZW50RGVidWdDb250ZXh0OiBEZWJ1Z0NvbnRleHQgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKGNsYXp6OiBhbnksIGNvbXBvbmVudFR5cGU6IFJlbmRlckNvbXBvbmVudFR5cGUsIHR5cGU6IFZpZXdUeXBlLFxuICAgICAgICAgICAgICBsb2NhbHM6IHtba2V5OiBzdHJpbmddOiBhbnl9LCB2aWV3TWFuYWdlcjogQXBwVmlld01hbmFnZXJfLCBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IsXG4gICAgICAgICAgICAgIGRlY2xhcmF0aW9uQXBwRWxlbWVudDogQXBwRWxlbWVudCwgY2RNb2RlOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgICAgICAgICAgICAgbGl0ZXJhbEFycmF5Q2FjaGVTaXplOiBudW1iZXIsIGxpdGVyYWxNYXBDYWNoZVNpemU6IG51bWJlcixcbiAgICAgICAgICAgICAgcHVibGljIHN0YXRpY05vZGVEZWJ1Z0luZm9zOiBTdGF0aWNOb2RlRGVidWdJbmZvW10pIHtcbiAgICBzdXBlcihjbGF6eiwgY29tcG9uZW50VHlwZSwgdHlwZSwgbG9jYWxzLCB2aWV3TWFuYWdlciwgcGFyZW50SW5qZWN0b3IsIGRlY2xhcmF0aW9uQXBwRWxlbWVudCxcbiAgICAgICAgICBjZE1vZGUsIGxpdGVyYWxBcnJheUNhY2hlU2l6ZSwgbGl0ZXJhbE1hcENhY2hlU2l6ZSk7XG4gIH1cblxuICBjcmVhdGUoZ2l2ZW5Qcm9qZWN0YWJsZU5vZGVzOiBBcnJheTxhbnkgfCBhbnlbXT4sIHJvb3RTZWxlY3Rvcjogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fcmVzZXREZWJ1ZygpO1xuICAgIHRyeSB7XG4gICAgICBzdXBlci5jcmVhdGUoZ2l2ZW5Qcm9qZWN0YWJsZU5vZGVzLCByb290U2VsZWN0b3IpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX3JldGhyb3dXaXRoQ29udGV4dChlLCBlLnN0YWNrKTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgaW5qZWN0b3JHZXQodG9rZW46IGFueSwgbm9kZUluZGV4OiBudW1iZXIsIG5vdEZvdW5kUmVzdWx0OiBhbnkpOiBhbnkge1xuICAgIHRoaXMuX3Jlc2V0RGVidWcoKTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHN1cGVyLmluamVjdG9yR2V0KHRva2VuLCBub2RlSW5kZXgsIG5vdEZvdW5kUmVzdWx0KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl9yZXRocm93V2l0aENvbnRleHQoZSwgZS5zdGFjayk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3lMb2NhbCgpIHtcbiAgICB0aGlzLl9yZXNldERlYnVnKCk7XG4gICAgdHJ5IHtcbiAgICAgIHN1cGVyLmRlc3Ryb3lMb2NhbCgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX3JldGhyb3dXaXRoQ29udGV4dChlLCBlLnN0YWNrKTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgZGV0ZWN0Q2hhbmdlcyh0aHJvd09uQ2hhbmdlOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fcmVzZXREZWJ1ZygpO1xuICAgIHRyeSB7XG4gICAgICBzdXBlci5kZXRlY3RDaGFuZ2VzKHRocm93T25DaGFuZ2UpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX3JldGhyb3dXaXRoQ29udGV4dChlLCBlLnN0YWNrKTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcmVzZXREZWJ1ZygpIHsgdGhpcy5fY3VycmVudERlYnVnQ29udGV4dCA9IG51bGw7IH1cblxuICBkZWJ1Zyhub2RlSW5kZXg6IG51bWJlciwgcm93TnVtOiBudW1iZXIsIGNvbE51bTogbnVtYmVyKTogRGVidWdDb250ZXh0IHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudERlYnVnQ29udGV4dCA9IG5ldyBEZWJ1Z0NvbnRleHQodGhpcywgbm9kZUluZGV4LCByb3dOdW0sIGNvbE51bSk7XG4gIH1cblxuICBwcml2YXRlIF9yZXRocm93V2l0aENvbnRleHQoZTogYW55LCBzdGFjazogYW55KSB7XG4gICAgaWYgKCEoZSBpbnN0YW5jZW9mIFZpZXdXcmFwcGVkRXhjZXB0aW9uKSkge1xuICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEV4cHJlc3Npb25DaGFuZ2VkQWZ0ZXJJdEhhc0JlZW5DaGVja2VkRXhjZXB0aW9uKSkge1xuICAgICAgICB0aGlzLmNkU3RhdGUgPSBDaGFuZ2VEZXRlY3RvclN0YXRlLkVycm9yZWQ7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2N1cnJlbnREZWJ1Z0NvbnRleHQpKSB7XG4gICAgICAgIHRocm93IG5ldyBWaWV3V3JhcHBlZEV4Y2VwdGlvbihlLCBzdGFjaywgdGhpcy5fY3VycmVudERlYnVnQ29udGV4dCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZXZlbnRIYW5kbGVyKGNiOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICB2YXIgc3VwZXJIYW5kbGVyID0gc3VwZXIuZXZlbnRIYW5kbGVyKGNiKTtcbiAgICByZXR1cm4gKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLl9yZXNldERlYnVnKCk7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gc3VwZXJIYW5kbGVyKGV2ZW50KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5fcmV0aHJvd1dpdGhDb250ZXh0KGUsIGUuc3RhY2spO1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn1cblxuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBIb3N0Vmlld0ZhY3Rvcnkge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgc2VsZWN0b3I6IHN0cmluZywgcHVibGljIHZpZXdGYWN0b3J5OiBGdW5jdGlvbikge31cbn1cblxuZnVuY3Rpb24gX2ZpbmRMYXN0UmVuZGVyTm9kZShub2RlOiBhbnkpOiBhbnkge1xuICB2YXIgbGFzdE5vZGU7XG4gIGlmIChub2RlIGluc3RhbmNlb2YgQXBwRWxlbWVudCkge1xuICAgIHZhciBhcHBFbCA9IDxBcHBFbGVtZW50Pm5vZGU7XG4gICAgbGFzdE5vZGUgPSBhcHBFbC5uYXRpdmVFbGVtZW50O1xuICAgIGlmIChpc1ByZXNlbnQoYXBwRWwubmVzdGVkVmlld3MpKSB7XG4gICAgICAvLyBOb3RlOiBWaWV3cyBtaWdodCBoYXZlIG5vIHJvb3Qgbm9kZXMgYXQgYWxsIVxuICAgICAgZm9yICh2YXIgaSA9IGFwcEVsLm5lc3RlZFZpZXdzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIHZhciBuZXN0ZWRWaWV3ID0gYXBwRWwubmVzdGVkVmlld3NbaV07XG4gICAgICAgIGlmIChuZXN0ZWRWaWV3LnJvb3ROb2Rlc09yQXBwRWxlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGxhc3ROb2RlID0gX2ZpbmRMYXN0UmVuZGVyTm9kZShcbiAgICAgICAgICAgICAgbmVzdGVkVmlldy5yb290Tm9kZXNPckFwcEVsZW1lbnRzW25lc3RlZFZpZXcucm9vdE5vZGVzT3JBcHBFbGVtZW50cy5sZW5ndGggLSAxXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbGFzdE5vZGUgPSBub2RlO1xuICB9XG4gIHJldHVybiBsYXN0Tm9kZTtcbn1cbiJdfQ==