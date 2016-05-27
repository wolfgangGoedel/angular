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
