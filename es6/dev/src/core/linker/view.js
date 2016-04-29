import { ListWrapper } from 'angular2/src/facade/collection';
import { AppElement } from './element';
import { isPresent } from 'angular2/src/facade/lang';
import { ObservableWrapper } from 'angular2/src/facade/async';
import { ViewRef_ } from './view_ref';
import { ViewType } from './view_type';
import { flattenNestedViewRenderNodes, ensureSlotCount } from './view_utils';
import { ChangeDetectionStrategy, ChangeDetectorState } from 'angular2/src/core/change_detection/change_detection';
import { wtfCreateScope, wtfLeave } from '../profile/profile';
import { ExpressionChangedAfterItHasBeenCheckedException, ViewDestroyedException, ViewWrappedException } from './exceptions';
import { DebugContext } from './debug_context';
import { ElementInjector } from './element_injector';
var _scope_check = wtfCreateScope(`AppView#check(ascii id)`);
/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
export class AppView {
    constructor(clazz, componentType, type, viewUtils, parentInjector, declarationAppElement, cdMode) {
        this.clazz = clazz;
        this.componentType = componentType;
        this.type = type;
        this.viewUtils = viewUtils;
        this.parentInjector = parentInjector;
        this.declarationAppElement = declarationAppElement;
        this.cdMode = cdMode;
        this.contentChildren = [];
        this.viewChildren = [];
        this.viewContainerElement = null;
        // The names of the below fields must be kept in sync with codegen_name_util.ts or
        // change detection will fail.
        this.cdState = ChangeDetectorState.NeverChecked;
        this.destroyed = false;
        this.ref = new ViewRef_(this);
        if (type === ViewType.COMPONENT || type === ViewType.HOST) {
            this.renderer = viewUtils.renderComponent(componentType);
        }
        else {
            this.renderer = declarationAppElement.parentView.renderer;
        }
    }
    create(context, givenProjectableNodes, rootSelectorOrNode) {
        this.context = context;
        var projectableNodes;
        switch (this.type) {
            case ViewType.COMPONENT:
                projectableNodes = ensureSlotCount(givenProjectableNodes, this.componentType.slotCount);
                break;
            case ViewType.EMBEDDED:
                projectableNodes = this.declarationAppElement.parentView.projectableNodes;
                break;
            case ViewType.HOST:
                // Note: Don't ensure the slot count for the projectableNodes as we store
                // them only for the contained component view (which will later check the slot count...)
                projectableNodes = givenProjectableNodes;
                break;
        }
        this._hasExternalHostElement = isPresent(rootSelectorOrNode);
        this.projectableNodes = projectableNodes;
        return this.createInternal(rootSelectorOrNode);
    }
    /**
     * Overwritten by implementations.
     * Returns the AppElement for the host element for ViewType.HOST.
     */
    createInternal(rootSelectorOrNode) { return null; }
    init(rootNodesOrAppElements, allNodes, disposables, subscriptions) {
        this.rootNodesOrAppElements = rootNodesOrAppElements;
        this.allNodes = allNodes;
        this.disposables = disposables;
        this.subscriptions = subscriptions;
        if (this.type === ViewType.COMPONENT) {
            // Note: the render nodes have been attached to their host element
            // in the ViewFactory already.
            this.declarationAppElement.parentView.viewChildren.push(this);
            this.renderParent = this.declarationAppElement.parentView;
            this.dirtyParentQueriesInternal();
        }
    }
    selectOrCreateHostElement(elementName, rootSelectorOrNode, debugInfo) {
        var hostElement;
        if (isPresent(rootSelectorOrNode)) {
            hostElement = this.renderer.selectRootElement(rootSelectorOrNode, debugInfo);
        }
        else {
            hostElement = this.renderer.createElement(null, elementName, debugInfo);
        }
        return hostElement;
    }
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
        if (this._hasExternalHostElement) {
            this.renderer.detachView(this.flatRootNodes);
        }
        else if (isPresent(this.viewContainerElement)) {
            this.viewContainerElement.detachView(this.viewContainerElement.nestedViews.indexOf(this));
        }
        this._destroyRecurse();
    }
    _destroyRecurse() {
        if (this.destroyed) {
            return;
        }
        var children = this.contentChildren;
        for (var i = 0; i < children.length; i++) {
            children[i]._destroyRecurse();
        }
        children = this.viewChildren;
        for (var i = 0; i < children.length; i++) {
            children[i]._destroyRecurse();
        }
        this.destroyLocal();
        this.destroyed = true;
    }
    destroyLocal() {
        var hostElement = this.type === ViewType.COMPONENT ? this.declarationAppElement.nativeElement : null;
        for (var i = 0; i < this.disposables.length; i++) {
            this.disposables[i]();
        }
        for (var i = 0; i < this.subscriptions.length; i++) {
            ObservableWrapper.dispose(this.subscriptions[i]);
        }
        this.destroyInternal();
        if (this._hasExternalHostElement) {
            this.renderer.detachView(this.flatRootNodes);
        }
        else if (isPresent(this.viewContainerElement)) {
            this.viewContainerElement.detachView(this.viewContainerElement.nestedViews.indexOf(this));
        }
        else {
            this.dirtyParentQueriesInternal();
        }
        this.renderer.destroyView(hostElement, this.allNodes);
    }
    /**
     * Overwritten by implementations
     */
    destroyInternal() { }
    get changeDetectorRef() { return this.ref; }
    get parent() {
        return isPresent(this.declarationAppElement) ? this.declarationAppElement.parentView : null;
    }
    get flatRootNodes() { return flattenNestedViewRenderNodes(this.rootNodesOrAppElements); }
    get lastRootNode() {
        var lastNode = this.rootNodesOrAppElements.length > 0 ?
            this.rootNodesOrAppElements[this.rootNodesOrAppElements.length - 1] :
            null;
        return _findLastRenderNode(lastNode);
    }
    /**
     * Overwritten by implementations
     */
    dirtyParentQueriesInternal() { }
    addRenderContentChild(view) {
        this.contentChildren.push(view);
        view.renderParent = this;
        view.dirtyParentQueriesInternal();
    }
    removeContentChild(view) {
        ListWrapper.remove(this.contentChildren, view);
        view.dirtyParentQueriesInternal();
        view.renderParent = null;
    }
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
    markAsCheckOnce() { this.cdMode = ChangeDetectionStrategy.CheckOnce; }
    markPathToRootAsCheckOnce() {
        var c = this;
        while (isPresent(c) && c.cdMode !== ChangeDetectionStrategy.Detached) {
            if (c.cdMode === ChangeDetectionStrategy.Checked) {
                c.cdMode = ChangeDetectionStrategy.CheckOnce;
            }
            c = c.renderParent;
        }
    }
    eventHandler(cb) { return cb; }
    throwDestroyedError(details) { throw new ViewDestroyedException(details); }
}
export class DebugAppView extends AppView {
    constructor(clazz, componentType, type, viewUtils, parentInjector, declarationAppElement, cdMode, staticNodeDebugInfos) {
        super(clazz, componentType, type, viewUtils, parentInjector, declarationAppElement, cdMode);
        this.staticNodeDebugInfos = staticNodeDebugInfos;
        this._currentDebugContext = null;
    }
    create(context, givenProjectableNodes, rootSelectorOrNode) {
        this._resetDebug();
        try {
            return super.create(context, givenProjectableNodes, rootSelectorOrNode);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtSzJwNlRDSEMudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEVBQ0wsV0FBVyxFQU1aLE1BQU0sZ0NBQWdDO09BR2hDLEVBQUMsVUFBVSxFQUFDLE1BQU0sV0FBVztPQUM3QixFQUVMLFNBQVMsRUFVVixNQUFNLDBCQUEwQjtPQUUxQixFQUFDLGlCQUFpQixFQUFDLE1BQU0sMkJBQTJCO09BT3BELEVBQUMsUUFBUSxFQUFDLE1BQU0sWUFBWTtPQUU1QixFQUFDLFFBQVEsRUFBQyxNQUFNLGFBQWE7T0FDN0IsRUFFTCw0QkFBNEIsRUFDNUIsZUFBZSxFQUdoQixNQUFNLGNBQWM7T0FDZCxFQUVMLHVCQUF1QixFQUN2QixtQkFBbUIsRUFHcEIsTUFBTSxxREFBcUQ7T0FDckQsRUFBQyxjQUFjLEVBQUUsUUFBUSxFQUFhLE1BQU0sb0JBQW9CO09BQ2hFLEVBQ0wsK0NBQStDLEVBQy9DLHNCQUFzQixFQUN0QixvQkFBb0IsRUFDckIsTUFBTSxjQUFjO09BQ2QsRUFBc0IsWUFBWSxFQUFDLE1BQU0saUJBQWlCO09BQzFELEVBQUMsZUFBZSxFQUFDLE1BQU0sb0JBQW9CO0FBRWxELElBQUksWUFBWSxHQUFlLGNBQWMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBRXpFOzs7R0FHRztBQUNIO0lBeUJFLFlBQW1CLEtBQVUsRUFBUyxhQUFrQyxFQUFTLElBQWMsRUFDNUUsU0FBb0IsRUFBUyxjQUF3QixFQUNyRCxxQkFBaUMsRUFBUyxNQUErQjtRQUZ6RSxVQUFLLEdBQUwsS0FBSyxDQUFLO1FBQVMsa0JBQWEsR0FBYixhQUFhLENBQXFCO1FBQVMsU0FBSSxHQUFKLElBQUksQ0FBVTtRQUM1RSxjQUFTLEdBQVQsU0FBUyxDQUFXO1FBQVMsbUJBQWMsR0FBZCxjQUFjLENBQVU7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WUFDakMsK0NBQStDO1lBQy9DLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3ZELElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDakQsUUFBUSxHQUFHLG1CQUFtQixDQUMxQixVQUFVLENBQUMsc0JBQXNCLENBQUMsVUFBVSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2RixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQ2xCLENBQUM7SUFDRCxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2xCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBMaXN0V3JhcHBlcixcbiAgTWFwV3JhcHBlcixcbiAgTWFwLFxuICBTdHJpbmdNYXBXcmFwcGVyLFxuICBpc0xpc3RMaWtlSXRlcmFibGUsXG4gIGFyZUl0ZXJhYmxlc0VxdWFsXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7QXBwRWxlbWVudH0gZnJvbSAnLi9lbGVtZW50JztcbmltcG9ydCB7XG4gIGFzc2VydGlvbnNFbmFibGVkLFxuICBpc1ByZXNlbnQsXG4gIGlzQmxhbmssXG4gIFR5cGUsXG4gIGlzQXJyYXksXG4gIGlzTnVtYmVyLFxuICBDT05TVCxcbiAgQ09OU1RfRVhQUixcbiAgc3RyaW5naWZ5LFxuICBpc1ByaW1pdGl2ZSxcbiAgaXNTdHJpbmdcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuaW1wb3J0IHtPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1xuICBSZW5kZXJlcixcbiAgUm9vdFJlbmRlcmVyLFxuICBSZW5kZXJDb21wb25lbnRUeXBlLFxuICBSZW5kZXJEZWJ1Z0luZm9cbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVuZGVyL2FwaSc7XG5pbXBvcnQge1ZpZXdSZWZffSBmcm9tICcuL3ZpZXdfcmVmJztcblxuaW1wb3J0IHtWaWV3VHlwZX0gZnJvbSAnLi92aWV3X3R5cGUnO1xuaW1wb3J0IHtcbiAgVmlld1V0aWxzLFxuICBmbGF0dGVuTmVzdGVkVmlld1JlbmRlck5vZGVzLFxuICBlbnN1cmVTbG90Q291bnQsXG4gIGFycmF5TG9vc2VJZGVudGljYWwsXG4gIG1hcExvb3NlSWRlbnRpY2FsXG59IGZyb20gJy4vdmlld191dGlscyc7XG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yU3RhdGUsXG4gIGlzRGVmYXVsdENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBkZXZNb2RlRXF1YWxcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcbmltcG9ydCB7d3RmQ3JlYXRlU2NvcGUsIHd0ZkxlYXZlLCBXdGZTY29wZUZufSBmcm9tICcuLi9wcm9maWxlL3Byb2ZpbGUnO1xuaW1wb3J0IHtcbiAgRXhwcmVzc2lvbkNoYW5nZWRBZnRlckl0SGFzQmVlbkNoZWNrZWRFeGNlcHRpb24sXG4gIFZpZXdEZXN0cm95ZWRFeGNlcHRpb24sXG4gIFZpZXdXcmFwcGVkRXhjZXB0aW9uXG59IGZyb20gJy4vZXhjZXB0aW9ucyc7XG5pbXBvcnQge1N0YXRpY05vZGVEZWJ1Z0luZm8sIERlYnVnQ29udGV4dH0gZnJvbSAnLi9kZWJ1Z19jb250ZXh0JztcbmltcG9ydCB7RWxlbWVudEluamVjdG9yfSBmcm9tICcuL2VsZW1lbnRfaW5qZWN0b3InO1xuXG52YXIgX3Njb3BlX2NoZWNrOiBXdGZTY29wZUZuID0gd3RmQ3JlYXRlU2NvcGUoYEFwcFZpZXcjY2hlY2soYXNjaWkgaWQpYCk7XG5cbi8qKlxuICogQ29zdCBvZiBtYWtpbmcgb2JqZWN0czogaHR0cDovL2pzcGVyZi5jb20vaW5zdGFudGlhdGUtc2l6ZS1vZi1vYmplY3RcbiAqXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBcHBWaWV3PFQ+IHtcbiAgcmVmOiBWaWV3UmVmXzxUPjtcbiAgcm9vdE5vZGVzT3JBcHBFbGVtZW50czogYW55W107XG4gIGFsbE5vZGVzOiBhbnlbXTtcbiAgZGlzcG9zYWJsZXM6IEZ1bmN0aW9uW107XG4gIHN1YnNjcmlwdGlvbnM6IGFueVtdO1xuICBjb250ZW50Q2hpbGRyZW46IEFwcFZpZXc8YW55PltdID0gW107XG4gIHZpZXdDaGlsZHJlbjogQXBwVmlldzxhbnk+W10gPSBbXTtcbiAgcmVuZGVyUGFyZW50OiBBcHBWaWV3PGFueT47XG4gIHZpZXdDb250YWluZXJFbGVtZW50OiBBcHBFbGVtZW50ID0gbnVsbDtcblxuICAvLyBUaGUgbmFtZXMgb2YgdGhlIGJlbG93IGZpZWxkcyBtdXN0IGJlIGtlcHQgaW4gc3luYyB3aXRoIGNvZGVnZW5fbmFtZV91dGlsLnRzIG9yXG4gIC8vIGNoYW5nZSBkZXRlY3Rpb24gd2lsbCBmYWlsLlxuICBjZFN0YXRlOiBDaGFuZ2VEZXRlY3RvclN0YXRlID0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5OZXZlckNoZWNrZWQ7XG5cbiAgcHJvamVjdGFibGVOb2RlczogQXJyYXk8YW55IHwgYW55W10+O1xuXG4gIGRlc3Ryb3llZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHJlbmRlcmVyOiBSZW5kZXJlcjtcblxuICBwcml2YXRlIF9oYXNFeHRlcm5hbEhvc3RFbGVtZW50OiBib29sZWFuO1xuXG4gIHB1YmxpYyBjb250ZXh0OiBUO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjbGF6ejogYW55LCBwdWJsaWMgY29tcG9uZW50VHlwZTogUmVuZGVyQ29tcG9uZW50VHlwZSwgcHVibGljIHR5cGU6IFZpZXdUeXBlLFxuICAgICAgICAgICAgICBwdWJsaWMgdmlld1V0aWxzOiBWaWV3VXRpbHMsIHB1YmxpYyBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IsXG4gICAgICAgICAgICAgIHB1YmxpYyBkZWNsYXJhdGlvbkFwcEVsZW1lbnQ6IEFwcEVsZW1lbnQsIHB1YmxpYyBjZE1vZGU6IENoYW5nZURldGVjdGlvblN0cmF0ZWd5KSB7XG4gICAgdGhpcy5yZWYgPSBuZXcgVmlld1JlZl8odGhpcyk7XG4gICAgaWYgKHR5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCB8fCB0eXBlID09PSBWaWV3VHlwZS5IT1NUKSB7XG4gICAgICB0aGlzLnJlbmRlcmVyID0gdmlld1V0aWxzLnJlbmRlckNvbXBvbmVudChjb21wb25lbnRUeXBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZW5kZXJlciA9IGRlY2xhcmF0aW9uQXBwRWxlbWVudC5wYXJlbnRWaWV3LnJlbmRlcmVyO1xuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZShjb250ZXh0OiBULCBnaXZlblByb2plY3RhYmxlTm9kZXM6IEFycmF5PGFueSB8IGFueVtdPixcbiAgICAgICAgIHJvb3RTZWxlY3Rvck9yTm9kZTogc3RyaW5nIHwgYW55KTogQXBwRWxlbWVudCB7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgICB2YXIgcHJvamVjdGFibGVOb2RlcztcbiAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgY2FzZSBWaWV3VHlwZS5DT01QT05FTlQ6XG4gICAgICAgIHByb2plY3RhYmxlTm9kZXMgPSBlbnN1cmVTbG90Q291bnQoZ2l2ZW5Qcm9qZWN0YWJsZU5vZGVzLCB0aGlzLmNvbXBvbmVudFR5cGUuc2xvdENvdW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFZpZXdUeXBlLkVNQkVEREVEOlxuICAgICAgICBwcm9qZWN0YWJsZU5vZGVzID0gdGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQucGFyZW50Vmlldy5wcm9qZWN0YWJsZU5vZGVzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVmlld1R5cGUuSE9TVDpcbiAgICAgICAgLy8gTm90ZTogRG9uJ3QgZW5zdXJlIHRoZSBzbG90IGNvdW50IGZvciB0aGUgcHJvamVjdGFibGVOb2RlcyBhcyB3ZSBzdG9yZVxuICAgICAgICAvLyB0aGVtIG9ubHkgZm9yIHRoZSBjb250YWluZWQgY29tcG9uZW50IHZpZXcgKHdoaWNoIHdpbGwgbGF0ZXIgY2hlY2sgdGhlIHNsb3QgY291bnQuLi4pXG4gICAgICAgIHByb2plY3RhYmxlTm9kZXMgPSBnaXZlblByb2plY3RhYmxlTm9kZXM7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICB0aGlzLl9oYXNFeHRlcm5hbEhvc3RFbGVtZW50ID0gaXNQcmVzZW50KHJvb3RTZWxlY3Rvck9yTm9kZSk7XG4gICAgdGhpcy5wcm9qZWN0YWJsZU5vZGVzID0gcHJvamVjdGFibGVOb2RlcztcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVJbnRlcm5hbChyb290U2VsZWN0b3JPck5vZGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJ3cml0dGVuIGJ5IGltcGxlbWVudGF0aW9ucy5cbiAgICogUmV0dXJucyB0aGUgQXBwRWxlbWVudCBmb3IgdGhlIGhvc3QgZWxlbWVudCBmb3IgVmlld1R5cGUuSE9TVC5cbiAgICovXG4gIGNyZWF0ZUludGVybmFsKHJvb3RTZWxlY3Rvck9yTm9kZTogc3RyaW5nIHwgYW55KTogQXBwRWxlbWVudCB7IHJldHVybiBudWxsOyB9XG5cbiAgaW5pdChyb290Tm9kZXNPckFwcEVsZW1lbnRzOiBhbnlbXSwgYWxsTm9kZXM6IGFueVtdLCBkaXNwb3NhYmxlczogRnVuY3Rpb25bXSxcbiAgICAgICBzdWJzY3JpcHRpb25zOiBhbnlbXSkge1xuICAgIHRoaXMucm9vdE5vZGVzT3JBcHBFbGVtZW50cyA9IHJvb3ROb2Rlc09yQXBwRWxlbWVudHM7XG4gICAgdGhpcy5hbGxOb2RlcyA9IGFsbE5vZGVzO1xuICAgIHRoaXMuZGlzcG9zYWJsZXMgPSBkaXNwb3NhYmxlcztcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBzdWJzY3JpcHRpb25zO1xuICAgIGlmICh0aGlzLnR5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCkge1xuICAgICAgLy8gTm90ZTogdGhlIHJlbmRlciBub2RlcyBoYXZlIGJlZW4gYXR0YWNoZWQgdG8gdGhlaXIgaG9zdCBlbGVtZW50XG4gICAgICAvLyBpbiB0aGUgVmlld0ZhY3RvcnkgYWxyZWFkeS5cbiAgICAgIHRoaXMuZGVjbGFyYXRpb25BcHBFbGVtZW50LnBhcmVudFZpZXcudmlld0NoaWxkcmVuLnB1c2godGhpcyk7XG4gICAgICB0aGlzLnJlbmRlclBhcmVudCA9IHRoaXMuZGVjbGFyYXRpb25BcHBFbGVtZW50LnBhcmVudFZpZXc7XG4gICAgICB0aGlzLmRpcnR5UGFyZW50UXVlcmllc0ludGVybmFsKCk7XG4gICAgfVxuICB9XG5cbiAgc2VsZWN0T3JDcmVhdGVIb3N0RWxlbWVudChlbGVtZW50TmFtZTogc3RyaW5nLCByb290U2VsZWN0b3JPck5vZGU6IHN0cmluZyB8IGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1Z0luZm86IFJlbmRlckRlYnVnSW5mbyk6IGFueSB7XG4gICAgdmFyIGhvc3RFbGVtZW50O1xuICAgIGlmIChpc1ByZXNlbnQocm9vdFNlbGVjdG9yT3JOb2RlKSkge1xuICAgICAgaG9zdEVsZW1lbnQgPSB0aGlzLnJlbmRlcmVyLnNlbGVjdFJvb3RFbGVtZW50KHJvb3RTZWxlY3Rvck9yTm9kZSwgZGVidWdJbmZvKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaG9zdEVsZW1lbnQgPSB0aGlzLnJlbmRlcmVyLmNyZWF0ZUVsZW1lbnQobnVsbCwgZWxlbWVudE5hbWUsIGRlYnVnSW5mbyk7XG4gICAgfVxuICAgIHJldHVybiBob3N0RWxlbWVudDtcbiAgfVxuXG4gIGluamVjdG9yR2V0KHRva2VuOiBhbnksIG5vZGVJbmRleDogbnVtYmVyLCBub3RGb3VuZFJlc3VsdDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5pbmplY3RvckdldEludGVybmFsKHRva2VuLCBub2RlSW5kZXgsIG5vdEZvdW5kUmVzdWx0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVyd3JpdHRlbiBieSBpbXBsZW1lbnRhdGlvbnNcbiAgICovXG4gIGluamVjdG9yR2V0SW50ZXJuYWwodG9rZW46IGFueSwgbm9kZUluZGV4OiBudW1iZXIsIG5vdEZvdW5kUmVzdWx0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBub3RGb3VuZFJlc3VsdDtcbiAgfVxuXG4gIGluamVjdG9yKG5vZGVJbmRleDogbnVtYmVyKTogSW5qZWN0b3Ige1xuICAgIGlmIChpc1ByZXNlbnQobm9kZUluZGV4KSkge1xuICAgICAgcmV0dXJuIG5ldyBFbGVtZW50SW5qZWN0b3IodGhpcywgbm9kZUluZGV4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucGFyZW50SW5qZWN0b3I7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5faGFzRXh0ZXJuYWxIb3N0RWxlbWVudCkge1xuICAgICAgdGhpcy5yZW5kZXJlci5kZXRhY2hWaWV3KHRoaXMuZmxhdFJvb3ROb2Rlcyk7XG4gICAgfSBlbHNlIGlmIChpc1ByZXNlbnQodGhpcy52aWV3Q29udGFpbmVyRWxlbWVudCkpIHtcbiAgICAgIHRoaXMudmlld0NvbnRhaW5lckVsZW1lbnQuZGV0YWNoVmlldyh0aGlzLnZpZXdDb250YWluZXJFbGVtZW50Lm5lc3RlZFZpZXdzLmluZGV4T2YodGhpcykpO1xuICAgIH1cbiAgICB0aGlzLl9kZXN0cm95UmVjdXJzZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZGVzdHJveVJlY3Vyc2UoKSB7XG4gICAgaWYgKHRoaXMuZGVzdHJveWVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBjaGlsZHJlbiA9IHRoaXMuY29udGVudENoaWxkcmVuO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNoaWxkcmVuW2ldLl9kZXN0cm95UmVjdXJzZSgpO1xuICAgIH1cbiAgICBjaGlsZHJlbiA9IHRoaXMudmlld0NoaWxkcmVuO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNoaWxkcmVuW2ldLl9kZXN0cm95UmVjdXJzZSgpO1xuICAgIH1cbiAgICB0aGlzLmRlc3Ryb3lMb2NhbCgpO1xuXG4gICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xuICB9XG5cbiAgZGVzdHJveUxvY2FsKCkge1xuICAgIHZhciBob3N0RWxlbWVudCA9XG4gICAgICAgIHRoaXMudHlwZSA9PT0gVmlld1R5cGUuQ09NUE9ORU5UID8gdGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQubmF0aXZlRWxlbWVudCA6IG51bGw7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRpc3Bvc2FibGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLmRpc3Bvc2FibGVzW2ldKCk7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdWJzY3JpcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBPYnNlcnZhYmxlV3JhcHBlci5kaXNwb3NlKHRoaXMuc3Vic2NyaXB0aW9uc1tpXSk7XG4gICAgfVxuICAgIHRoaXMuZGVzdHJveUludGVybmFsKCk7XG4gICAgaWYgKHRoaXMuX2hhc0V4dGVybmFsSG9zdEVsZW1lbnQpIHtcbiAgICAgIHRoaXMucmVuZGVyZXIuZGV0YWNoVmlldyh0aGlzLmZsYXRSb290Tm9kZXMpO1xuICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KHRoaXMudmlld0NvbnRhaW5lckVsZW1lbnQpKSB7XG4gICAgICB0aGlzLnZpZXdDb250YWluZXJFbGVtZW50LmRldGFjaFZpZXcodGhpcy52aWV3Q29udGFpbmVyRWxlbWVudC5uZXN0ZWRWaWV3cy5pbmRleE9mKHRoaXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kaXJ0eVBhcmVudFF1ZXJpZXNJbnRlcm5hbCgpO1xuICAgIH1cbiAgICB0aGlzLnJlbmRlcmVyLmRlc3Ryb3lWaWV3KGhvc3RFbGVtZW50LCB0aGlzLmFsbE5vZGVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVyd3JpdHRlbiBieSBpbXBsZW1lbnRhdGlvbnNcbiAgICovXG4gIGRlc3Ryb3lJbnRlcm5hbCgpOiB2b2lkIHt9XG5cbiAgZ2V0IGNoYW5nZURldGVjdG9yUmVmKCk6IENoYW5nZURldGVjdG9yUmVmIHsgcmV0dXJuIHRoaXMucmVmOyB9XG5cbiAgZ2V0IHBhcmVudCgpOiBBcHBWaWV3PGFueT4ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQpID8gdGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQucGFyZW50VmlldyA6IG51bGw7XG4gIH1cblxuICBnZXQgZmxhdFJvb3ROb2RlcygpOiBhbnlbXSB7IHJldHVybiBmbGF0dGVuTmVzdGVkVmlld1JlbmRlck5vZGVzKHRoaXMucm9vdE5vZGVzT3JBcHBFbGVtZW50cyk7IH1cblxuICBnZXQgbGFzdFJvb3ROb2RlKCk6IGFueSB7XG4gICAgdmFyIGxhc3ROb2RlID0gdGhpcy5yb290Tm9kZXNPckFwcEVsZW1lbnRzLmxlbmd0aCA+IDAgP1xuICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJvb3ROb2Rlc09yQXBwRWxlbWVudHNbdGhpcy5yb290Tm9kZXNPckFwcEVsZW1lbnRzLmxlbmd0aCAtIDFdIDpcbiAgICAgICAgICAgICAgICAgICAgICAgbnVsbDtcbiAgICByZXR1cm4gX2ZpbmRMYXN0UmVuZGVyTm9kZShsYXN0Tm9kZSk7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcndyaXR0ZW4gYnkgaW1wbGVtZW50YXRpb25zXG4gICAqL1xuICBkaXJ0eVBhcmVudFF1ZXJpZXNJbnRlcm5hbCgpOiB2b2lkIHt9XG5cbiAgYWRkUmVuZGVyQ29udGVudENoaWxkKHZpZXc6IEFwcFZpZXc8YW55Pik6IHZvaWQge1xuICAgIHRoaXMuY29udGVudENoaWxkcmVuLnB1c2godmlldyk7XG4gICAgdmlldy5yZW5kZXJQYXJlbnQgPSB0aGlzO1xuICAgIHZpZXcuZGlydHlQYXJlbnRRdWVyaWVzSW50ZXJuYWwoKTtcbiAgfVxuXG4gIHJlbW92ZUNvbnRlbnRDaGlsZCh2aWV3OiBBcHBWaWV3PGFueT4pOiB2b2lkIHtcbiAgICBMaXN0V3JhcHBlci5yZW1vdmUodGhpcy5jb250ZW50Q2hpbGRyZW4sIHZpZXcpO1xuICAgIHZpZXcuZGlydHlQYXJlbnRRdWVyaWVzSW50ZXJuYWwoKTtcbiAgICB2aWV3LnJlbmRlclBhcmVudCA9IG51bGw7XG4gIH1cblxuICBkZXRlY3RDaGFuZ2VzKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB2YXIgcyA9IF9zY29wZV9jaGVjayh0aGlzLmNsYXp6KTtcbiAgICBpZiAodGhpcy5jZE1vZGUgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRldGFjaGVkIHx8XG4gICAgICAgIHRoaXMuY2RNb2RlID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja2VkIHx8XG4gICAgICAgIHRoaXMuY2RTdGF0ZSA9PT0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5FcnJvcmVkKVxuICAgICAgcmV0dXJuO1xuICAgIGlmICh0aGlzLmRlc3Ryb3llZCkge1xuICAgICAgdGhpcy50aHJvd0Rlc3Ryb3llZEVycm9yKCdkZXRlY3RDaGFuZ2VzJyk7XG4gICAgfVxuICAgIHRoaXMuZGV0ZWN0Q2hhbmdlc0ludGVybmFsKHRocm93T25DaGFuZ2UpO1xuICAgIGlmICh0aGlzLmNkTW9kZSA9PT0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tPbmNlKVxuICAgICAgdGhpcy5jZE1vZGUgPSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja2VkO1xuXG4gICAgdGhpcy5jZFN0YXRlID0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5DaGVja2VkQmVmb3JlO1xuICAgIHd0ZkxlYXZlKHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJ3cml0dGVuIGJ5IGltcGxlbWVudGF0aW9uc1xuICAgKi9cbiAgZGV0ZWN0Q2hhbmdlc0ludGVybmFsKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmRldGVjdENvbnRlbnRDaGlsZHJlbkNoYW5nZXModGhyb3dPbkNoYW5nZSk7XG4gICAgdGhpcy5kZXRlY3RWaWV3Q2hpbGRyZW5DaGFuZ2VzKHRocm93T25DaGFuZ2UpO1xuICB9XG5cbiAgZGV0ZWN0Q29udGVudENoaWxkcmVuQ2hhbmdlcyh0aHJvd09uQ2hhbmdlOiBib29sZWFuKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRlbnRDaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgdGhpcy5jb250ZW50Q2hpbGRyZW5baV0uZGV0ZWN0Q2hhbmdlcyh0aHJvd09uQ2hhbmdlKTtcbiAgICB9XG4gIH1cblxuICBkZXRlY3RWaWV3Q2hpbGRyZW5DaGFuZ2VzKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudmlld0NoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICB0aGlzLnZpZXdDaGlsZHJlbltpXS5kZXRlY3RDaGFuZ2VzKHRocm93T25DaGFuZ2UpO1xuICAgIH1cbiAgfVxuXG4gIGFkZFRvQ29udGVudENoaWxkcmVuKHJlbmRlckFwcEVsZW1lbnQ6IEFwcEVsZW1lbnQpOiB2b2lkIHtcbiAgICByZW5kZXJBcHBFbGVtZW50LnBhcmVudFZpZXcuY29udGVudENoaWxkcmVuLnB1c2godGhpcyk7XG4gICAgdGhpcy52aWV3Q29udGFpbmVyRWxlbWVudCA9IHJlbmRlckFwcEVsZW1lbnQ7XG4gICAgdGhpcy5kaXJ0eVBhcmVudFF1ZXJpZXNJbnRlcm5hbCgpO1xuICB9XG5cbiAgcmVtb3ZlRnJvbUNvbnRlbnRDaGlsZHJlbihyZW5kZXJBcHBFbGVtZW50OiBBcHBFbGVtZW50KTogdm9pZCB7XG4gICAgTGlzdFdyYXBwZXIucmVtb3ZlKHJlbmRlckFwcEVsZW1lbnQucGFyZW50Vmlldy5jb250ZW50Q2hpbGRyZW4sIHRoaXMpO1xuICAgIHRoaXMuZGlydHlQYXJlbnRRdWVyaWVzSW50ZXJuYWwoKTtcbiAgICB0aGlzLnZpZXdDb250YWluZXJFbGVtZW50ID0gbnVsbDtcbiAgfVxuXG4gIG1hcmtBc0NoZWNrT25jZSgpOiB2b2lkIHsgdGhpcy5jZE1vZGUgPSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja09uY2U7IH1cblxuICBtYXJrUGF0aFRvUm9vdEFzQ2hlY2tPbmNlKCk6IHZvaWQge1xuICAgIHZhciBjOiBBcHBWaWV3PGFueT4gPSB0aGlzO1xuICAgIHdoaWxlIChpc1ByZXNlbnQoYykgJiYgYy5jZE1vZGUgIT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRldGFjaGVkKSB7XG4gICAgICBpZiAoYy5jZE1vZGUgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrZWQpIHtcbiAgICAgICAgYy5jZE1vZGUgPSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja09uY2U7XG4gICAgICB9XG4gICAgICBjID0gYy5yZW5kZXJQYXJlbnQ7XG4gICAgfVxuICB9XG5cbiAgZXZlbnRIYW5kbGVyKGNiOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHsgcmV0dXJuIGNiOyB9XG5cbiAgdGhyb3dEZXN0cm95ZWRFcnJvcihkZXRhaWxzOiBzdHJpbmcpOiB2b2lkIHsgdGhyb3cgbmV3IFZpZXdEZXN0cm95ZWRFeGNlcHRpb24oZGV0YWlscyk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIERlYnVnQXBwVmlldzxUPiBleHRlbmRzIEFwcFZpZXc8VD4ge1xuICBwcml2YXRlIF9jdXJyZW50RGVidWdDb250ZXh0OiBEZWJ1Z0NvbnRleHQgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKGNsYXp6OiBhbnksIGNvbXBvbmVudFR5cGU6IFJlbmRlckNvbXBvbmVudFR5cGUsIHR5cGU6IFZpZXdUeXBlLCB2aWV3VXRpbHM6IFZpZXdVdGlscyxcbiAgICAgICAgICAgICAgcGFyZW50SW5qZWN0b3I6IEluamVjdG9yLCBkZWNsYXJhdGlvbkFwcEVsZW1lbnQ6IEFwcEVsZW1lbnQsXG4gICAgICAgICAgICAgIGNkTW9kZTogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIHB1YmxpYyBzdGF0aWNOb2RlRGVidWdJbmZvczogU3RhdGljTm9kZURlYnVnSW5mb1tdKSB7XG4gICAgc3VwZXIoY2xhenosIGNvbXBvbmVudFR5cGUsIHR5cGUsIHZpZXdVdGlscywgcGFyZW50SW5qZWN0b3IsIGRlY2xhcmF0aW9uQXBwRWxlbWVudCwgY2RNb2RlKTtcbiAgfVxuXG4gIGNyZWF0ZShjb250ZXh0OiBULCBnaXZlblByb2plY3RhYmxlTm9kZXM6IEFycmF5PGFueSB8IGFueVtdPixcbiAgICAgICAgIHJvb3RTZWxlY3Rvck9yTm9kZTogc3RyaW5nIHwgYW55KTogQXBwRWxlbWVudCB7XG4gICAgdGhpcy5fcmVzZXREZWJ1ZygpO1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gc3VwZXIuY3JlYXRlKGNvbnRleHQsIGdpdmVuUHJvamVjdGFibGVOb2Rlcywgcm9vdFNlbGVjdG9yT3JOb2RlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl9yZXRocm93V2l0aENvbnRleHQoZSwgZS5zdGFjayk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIGluamVjdG9yR2V0KHRva2VuOiBhbnksIG5vZGVJbmRleDogbnVtYmVyLCBub3RGb3VuZFJlc3VsdDogYW55KTogYW55IHtcbiAgICB0aGlzLl9yZXNldERlYnVnKCk7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBzdXBlci5pbmplY3RvckdldCh0b2tlbiwgbm9kZUluZGV4LCBub3RGb3VuZFJlc3VsdCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fcmV0aHJvd1dpdGhDb250ZXh0KGUsIGUuc3RhY2spO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICBkZXN0cm95TG9jYWwoKSB7XG4gICAgdGhpcy5fcmVzZXREZWJ1ZygpO1xuICAgIHRyeSB7XG4gICAgICBzdXBlci5kZXN0cm95TG9jYWwoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl9yZXRocm93V2l0aENvbnRleHQoZSwgZS5zdGFjayk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIGRldGVjdENoYW5nZXModGhyb3dPbkNoYW5nZTogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX3Jlc2V0RGVidWcoKTtcbiAgICB0cnkge1xuICAgICAgc3VwZXIuZGV0ZWN0Q2hhbmdlcyh0aHJvd09uQ2hhbmdlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl9yZXRocm93V2l0aENvbnRleHQoZSwgZS5zdGFjayk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3Jlc2V0RGVidWcoKSB7IHRoaXMuX2N1cnJlbnREZWJ1Z0NvbnRleHQgPSBudWxsOyB9XG5cbiAgZGVidWcobm9kZUluZGV4OiBudW1iZXIsIHJvd051bTogbnVtYmVyLCBjb2xOdW06IG51bWJlcik6IERlYnVnQ29udGV4dCB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnREZWJ1Z0NvbnRleHQgPSBuZXcgRGVidWdDb250ZXh0KHRoaXMsIG5vZGVJbmRleCwgcm93TnVtLCBjb2xOdW0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmV0aHJvd1dpdGhDb250ZXh0KGU6IGFueSwgc3RhY2s6IGFueSkge1xuICAgIGlmICghKGUgaW5zdGFuY2VvZiBWaWV3V3JhcHBlZEV4Y2VwdGlvbikpIHtcbiAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEV4Y2VwdGlvbikpIHtcbiAgICAgICAgdGhpcy5jZFN0YXRlID0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5FcnJvcmVkO1xuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudCh0aGlzLl9jdXJyZW50RGVidWdDb250ZXh0KSkge1xuICAgICAgICB0aHJvdyBuZXcgVmlld1dyYXBwZWRFeGNlcHRpb24oZSwgc3RhY2ssIHRoaXMuX2N1cnJlbnREZWJ1Z0NvbnRleHQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGV2ZW50SGFuZGxlcihjYjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgdmFyIHN1cGVySGFuZGxlciA9IHN1cGVyLmV2ZW50SGFuZGxlcihjYik7XG4gICAgcmV0dXJuIChldmVudCkgPT4ge1xuICAgICAgdGhpcy5fcmVzZXREZWJ1ZygpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHN1cGVySGFuZGxlcihldmVudCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuX3JldGhyb3dXaXRoQ29udGV4dChlLCBlLnN0YWNrKTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59XG5cbmZ1bmN0aW9uIF9maW5kTGFzdFJlbmRlck5vZGUobm9kZTogYW55KTogYW55IHtcbiAgdmFyIGxhc3ROb2RlO1xuICBpZiAobm9kZSBpbnN0YW5jZW9mIEFwcEVsZW1lbnQpIHtcbiAgICB2YXIgYXBwRWwgPSA8QXBwRWxlbWVudD5ub2RlO1xuICAgIGxhc3ROb2RlID0gYXBwRWwubmF0aXZlRWxlbWVudDtcbiAgICBpZiAoaXNQcmVzZW50KGFwcEVsLm5lc3RlZFZpZXdzKSkge1xuICAgICAgLy8gTm90ZTogVmlld3MgbWlnaHQgaGF2ZSBubyByb290IG5vZGVzIGF0IGFsbCFcbiAgICAgIGZvciAodmFyIGkgPSBhcHBFbC5uZXN0ZWRWaWV3cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICB2YXIgbmVzdGVkVmlldyA9IGFwcEVsLm5lc3RlZFZpZXdzW2ldO1xuICAgICAgICBpZiAobmVzdGVkVmlldy5yb290Tm9kZXNPckFwcEVsZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsYXN0Tm9kZSA9IF9maW5kTGFzdFJlbmRlck5vZGUoXG4gICAgICAgICAgICAgIG5lc3RlZFZpZXcucm9vdE5vZGVzT3JBcHBFbGVtZW50c1tuZXN0ZWRWaWV3LnJvb3ROb2Rlc09yQXBwRWxlbWVudHMubGVuZ3RoIC0gMV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGxhc3ROb2RlID0gbm9kZTtcbiAgfVxuICByZXR1cm4gbGFzdE5vZGU7XG59XG4iXX0=