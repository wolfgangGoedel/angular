'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collection_1 = require('angular2/src/facade/collection');
var element_1 = require('./element');
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var view_ref_1 = require('./view_ref');
var view_type_1 = require('./view_type');
var view_utils_1 = require('./view_utils');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var profile_1 = require('../profile/profile');
var exceptions_1 = require('./exceptions');
var debug_context_1 = require('./debug_context');
var element_injector_1 = require('./element_injector');
var EMPTY_CONTEXT = lang_1.CONST_EXPR(new Object());
var _scope_check = profile_1.wtfCreateScope("AppView#check(ascii id)");
/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
var AppView = (function () {
    function AppView(clazz, componentType, type, locals, viewUtils, parentInjector, declarationAppElement, cdMode) {
        this.clazz = clazz;
        this.componentType = componentType;
        this.type = type;
        this.locals = locals;
        this.viewUtils = viewUtils;
        this.parentInjector = parentInjector;
        this.declarationAppElement = declarationAppElement;
        this.cdMode = cdMode;
        this.contentChildren = [];
        this.viewChildren = [];
        this.viewContainerElement = null;
        // The names of the below fields must be kept in sync with codegen_name_util.ts or
        // change detection will fail.
        this.cdState = change_detection_1.ChangeDetectorState.NeverChecked;
        /**
         * The context against which data-binding expressions in this view are evaluated against.
         * This is always a component instance.
         */
        this.context = null;
        this.destroyed = false;
        this.ref = new view_ref_1.ViewRef_(this);
        if (type === view_type_1.ViewType.COMPONENT || type === view_type_1.ViewType.HOST) {
            this.renderer = viewUtils.renderComponent(componentType);
        }
        else {
            this.renderer = declarationAppElement.parentView.renderer;
        }
    }
    AppView.prototype.create = function (givenProjectableNodes, rootSelectorOrNode) {
        var context;
        var projectableNodes;
        switch (this.type) {
            case view_type_1.ViewType.COMPONENT:
                context = this.declarationAppElement.component;
                projectableNodes = view_utils_1.ensureSlotCount(givenProjectableNodes, this.componentType.slotCount);
                break;
            case view_type_1.ViewType.EMBEDDED:
                context = this.declarationAppElement.parentView.context;
                projectableNodes = this.declarationAppElement.parentView.projectableNodes;
                break;
            case view_type_1.ViewType.HOST:
                context = EMPTY_CONTEXT;
                // Note: Don't ensure the slot count for the projectableNodes as we store
                // them only for the contained component view (which will later check the slot count...)
                projectableNodes = givenProjectableNodes;
                break;
        }
        this._hasExternalHostElement = lang_1.isPresent(rootSelectorOrNode);
        this.context = context;
        this.projectableNodes = projectableNodes;
        return this.createInternal(rootSelectorOrNode);
    };
    /**
     * Overwritten by implementations.
     * Returns the AppElement for the host element for ViewType.HOST.
     */
    AppView.prototype.createInternal = function (rootSelectorOrNode) { return null; };
    AppView.prototype.init = function (rootNodesOrAppElements, allNodes, disposables, subscriptions) {
        this.rootNodesOrAppElements = rootNodesOrAppElements;
        this.allNodes = allNodes;
        this.disposables = disposables;
        this.subscriptions = subscriptions;
        if (this.type === view_type_1.ViewType.COMPONENT) {
            // Note: the render nodes have been attached to their host element
            // in the ViewFactory already.
            this.declarationAppElement.parentView.viewChildren.push(this);
            this.dirtyParentQueriesInternal();
        }
    };
    AppView.prototype.selectOrCreateHostElement = function (elementName, rootSelectorOrNode, debugCtx) {
        var hostElement;
        if (lang_1.isPresent(rootSelectorOrNode)) {
            hostElement = this.renderer.selectRootElement(rootSelectorOrNode, debugCtx);
        }
        else {
            hostElement = this.renderer.createElement(null, elementName, debugCtx);
        }
        return hostElement;
    };
    AppView.prototype.injectorGet = function (token, nodeIndex, notFoundResult) {
        return this.injectorGetInternal(token, nodeIndex, notFoundResult);
    };
    /**
     * Overwritten by implementations
     */
    AppView.prototype.injectorGetInternal = function (token, nodeIndex, notFoundResult) {
        return notFoundResult;
    };
    AppView.prototype.injector = function (nodeIndex) {
        if (lang_1.isPresent(nodeIndex)) {
            return new element_injector_1.ElementInjector(this, nodeIndex);
        }
        else {
            return this.parentInjector;
        }
    };
    AppView.prototype.destroy = function () {
        if (this._hasExternalHostElement) {
            this.renderer.detachView(this.flatRootNodes);
        }
        else if (lang_1.isPresent(this.viewContainerElement)) {
            this.viewContainerElement.detachView(this.viewContainerElement.nestedViews.indexOf(this));
        }
        this._destroyRecurse();
    };
    AppView.prototype._destroyRecurse = function () {
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
    };
    AppView.prototype.destroyLocal = function () {
        var hostElement = this.type === view_type_1.ViewType.COMPONENT ? this.declarationAppElement.nativeElement : null;
        for (var i = 0; i < this.disposables.length; i++) {
            this.disposables[i]();
        }
        for (var i = 0; i < this.subscriptions.length; i++) {
            async_1.ObservableWrapper.dispose(this.subscriptions[i]);
        }
        this.destroyInternal();
        this.dirtyParentQueriesInternal();
        this.renderer.destroyView(hostElement, this.allNodes);
    };
    /**
     * Overwritten by implementations
     */
    AppView.prototype.destroyInternal = function () { };
    Object.defineProperty(AppView.prototype, "changeDetectorRef", {
        get: function () { return this.ref; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppView.prototype, "parent", {
        get: function () {
            return lang_1.isPresent(this.declarationAppElement) ? this.declarationAppElement.parentView : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppView.prototype, "flatRootNodes", {
        get: function () { return view_utils_1.flattenNestedViewRenderNodes(this.rootNodesOrAppElements); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppView.prototype, "lastRootNode", {
        get: function () {
            var lastNode = this.rootNodesOrAppElements.length > 0 ?
                this.rootNodesOrAppElements[this.rootNodesOrAppElements.length - 1] :
                null;
            return _findLastRenderNode(lastNode);
        },
        enumerable: true,
        configurable: true
    });
    AppView.prototype.hasLocal = function (contextName) {
        return collection_1.StringMapWrapper.contains(this.locals, contextName);
    };
    AppView.prototype.setLocal = function (contextName, value) { this.locals[contextName] = value; };
    /**
     * Overwritten by implementations
     */
    AppView.prototype.dirtyParentQueriesInternal = function () { };
    AppView.prototype.detectChanges = function (throwOnChange) {
        var s = _scope_check(this.clazz);
        if (this.cdMode === change_detection_1.ChangeDetectionStrategy.Detached ||
            this.cdMode === change_detection_1.ChangeDetectionStrategy.Checked ||
            this.cdState === change_detection_1.ChangeDetectorState.Errored)
            return;
        if (this.destroyed) {
            this.throwDestroyedError('detectChanges');
        }
        this.detectChangesInternal(throwOnChange);
        if (this.cdMode === change_detection_1.ChangeDetectionStrategy.CheckOnce)
            this.cdMode = change_detection_1.ChangeDetectionStrategy.Checked;
        this.cdState = change_detection_1.ChangeDetectorState.CheckedBefore;
        profile_1.wtfLeave(s);
    };
    /**
     * Overwritten by implementations
     */
    AppView.prototype.detectChangesInternal = function (throwOnChange) {
        this.detectContentChildrenChanges(throwOnChange);
        this.detectViewChildrenChanges(throwOnChange);
    };
    AppView.prototype.detectContentChildrenChanges = function (throwOnChange) {
        for (var i = 0; i < this.contentChildren.length; ++i) {
            this.contentChildren[i].detectChanges(throwOnChange);
        }
    };
    AppView.prototype.detectViewChildrenChanges = function (throwOnChange) {
        for (var i = 0; i < this.viewChildren.length; ++i) {
            this.viewChildren[i].detectChanges(throwOnChange);
        }
    };
    AppView.prototype.addToContentChildren = function (renderAppElement) {
        renderAppElement.parentView.contentChildren.push(this);
        this.viewContainerElement = renderAppElement;
        this.dirtyParentQueriesInternal();
    };
    AppView.prototype.removeFromContentChildren = function (renderAppElement) {
        collection_1.ListWrapper.remove(renderAppElement.parentView.contentChildren, this);
        this.dirtyParentQueriesInternal();
        this.viewContainerElement = null;
    };
    AppView.prototype.markAsCheckOnce = function () { this.cdMode = change_detection_1.ChangeDetectionStrategy.CheckOnce; };
    AppView.prototype.markPathToRootAsCheckOnce = function () {
        var c = this;
        while (lang_1.isPresent(c) && c.cdMode !== change_detection_1.ChangeDetectionStrategy.Detached) {
            if (c.cdMode === change_detection_1.ChangeDetectionStrategy.Checked) {
                c.cdMode = change_detection_1.ChangeDetectionStrategy.CheckOnce;
            }
            var parentEl = c.type === view_type_1.ViewType.COMPONENT ? c.declarationAppElement : c.viewContainerElement;
            c = lang_1.isPresent(parentEl) ? parentEl.parentView : null;
        }
    };
    AppView.prototype.eventHandler = function (cb) { return cb; };
    AppView.prototype.throwDestroyedError = function (details) { throw new exceptions_1.ViewDestroyedException(details); };
    return AppView;
}());
exports.AppView = AppView;
var DebugAppView = (function (_super) {
    __extends(DebugAppView, _super);
    function DebugAppView(clazz, componentType, type, locals, viewUtils, parentInjector, declarationAppElement, cdMode, staticNodeDebugInfos) {
        _super.call(this, clazz, componentType, type, locals, viewUtils, parentInjector, declarationAppElement, cdMode);
        this.staticNodeDebugInfos = staticNodeDebugInfos;
        this._currentDebugContext = null;
    }
    DebugAppView.prototype.create = function (givenProjectableNodes, rootSelector) {
        this._resetDebug();
        try {
            return _super.prototype.create.call(this, givenProjectableNodes, rootSelector);
        }
        catch (e) {
            this._rethrowWithContext(e, e.stack);
            throw e;
        }
    };
    DebugAppView.prototype.injectorGet = function (token, nodeIndex, notFoundResult) {
        this._resetDebug();
        try {
            return _super.prototype.injectorGet.call(this, token, nodeIndex, notFoundResult);
        }
        catch (e) {
            this._rethrowWithContext(e, e.stack);
            throw e;
        }
    };
    DebugAppView.prototype.destroyLocal = function () {
        this._resetDebug();
        try {
            _super.prototype.destroyLocal.call(this);
        }
        catch (e) {
            this._rethrowWithContext(e, e.stack);
            throw e;
        }
    };
    DebugAppView.prototype.detectChanges = function (throwOnChange) {
        this._resetDebug();
        try {
            _super.prototype.detectChanges.call(this, throwOnChange);
        }
        catch (e) {
            this._rethrowWithContext(e, e.stack);
            throw e;
        }
    };
    DebugAppView.prototype._resetDebug = function () { this._currentDebugContext = null; };
    DebugAppView.prototype.debug = function (nodeIndex, rowNum, colNum) {
        return this._currentDebugContext = new debug_context_1.DebugContext(this, nodeIndex, rowNum, colNum);
    };
    DebugAppView.prototype._rethrowWithContext = function (e, stack) {
        if (!(e instanceof exceptions_1.ViewWrappedException)) {
            if (!(e instanceof exceptions_1.ExpressionChangedAfterItHasBeenCheckedException)) {
                this.cdState = change_detection_1.ChangeDetectorState.Errored;
            }
            if (lang_1.isPresent(this._currentDebugContext)) {
                throw new exceptions_1.ViewWrappedException(e, stack, this._currentDebugContext);
            }
        }
    };
    DebugAppView.prototype.eventHandler = function (cb) {
        var _this = this;
        var superHandler = _super.prototype.eventHandler.call(this, cb);
        return function (event) {
            _this._resetDebug();
            try {
                return superHandler(event);
            }
            catch (e) {
                _this._rethrowWithContext(e, e.stack);
                throw e;
            }
        };
    };
    return DebugAppView;
}(AppView));
exports.DebugAppView = DebugAppView;
function _findLastRenderNode(node) {
    var lastNode;
    if (node instanceof element_1.AppElement) {
        var appEl = node;
        lastNode = appEl.nativeElement;
        if (lang_1.isPresent(appEl.nestedViews)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtRjY0QmNTODIudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDJCQU9PLGdDQUFnQyxDQUFDLENBQUE7QUFHeEMsd0JBQXlCLFdBQVcsQ0FBQyxDQUFBO0FBQ3JDLHFCQVlPLDBCQUEwQixDQUFDLENBQUE7QUFFbEMsc0JBQWdDLDJCQUEyQixDQUFDLENBQUE7QUFFNUQseUJBQXVCLFlBQVksQ0FBQyxDQUFBO0FBRXBDLDBCQUF1QixhQUFhLENBQUMsQ0FBQTtBQUNyQywyQkFNTyxjQUFjLENBQUMsQ0FBQTtBQUN0QixpQ0FNTyxxREFBcUQsQ0FBQyxDQUFBO0FBQzdELHdCQUFtRCxvQkFBb0IsQ0FBQyxDQUFBO0FBQ3hFLDJCQUlPLGNBQWMsQ0FBQyxDQUFBO0FBQ3RCLDhCQUFnRCxpQkFBaUIsQ0FBQyxDQUFBO0FBQ2xFLGlDQUE4QixvQkFBb0IsQ0FBQyxDQUFBO0FBRW5ELElBQU0sYUFBYSxHQUFHLGlCQUFVLENBQUMsSUFBSSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBRS9DLElBQUksWUFBWSxHQUFlLHdCQUFjLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUV6RTs7O0dBR0c7QUFDSDtJQTZCRSxpQkFBbUIsS0FBVSxFQUFTLGFBQWtDLEVBQVMsSUFBYyxFQUM1RSxNQUE0QixFQUFTLFNBQW9CLEVBQ3pELGNBQXdCLEVBQVMscUJBQWlDLEVBQ2xFLE1BQStCO1FBSC9CLFVBQUssR0FBTCxLQUFLLENBQUs7UUFBUyxrQkFBYSxHQUFiLGFBQWEsQ0FBcUI7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFVO1FBQzVFLFdBQU0sR0FBTixNQUFNLENBQXNCO1FBQVMsY0FBUyxHQUFULFNBQVMsQ0FBVztRQUN6RCxtQkFBYyxHQUFkLGNBQWMsQ0FBVTtRQUFTLDBC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QUNwQyxJQUFJLFFBQVEsQ0FBQztJQUNiLEVBQUUsQ0FBQyxDQUFDLElBQUksWUFBWSxvQkFBVSxDQUFDLENBQUMsQ0FBQztRQUMvQixJQUFJLEtBQUssR0FBZSxJQUFJLENBQUM7UUFDN0IsUUFBUSxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUM7UUFDL0IsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLCtDQUErQztZQUMvQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUN2RCxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2pELFFBQVEsR0FBRyxtQkFBbUIsQ0FDMUIsVUFBVSxDQUFDLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkYsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ04sUUFBUSxHQUFHLElBQUksQ0FBQztJQUNsQixDQUFDO0lBQ0QsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNsQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgTGlzdFdyYXBwZXIsXG4gIE1hcFdyYXBwZXIsXG4gIE1hcCxcbiAgU3RyaW5nTWFwV3JhcHBlcixcbiAgaXNMaXN0TGlrZUl0ZXJhYmxlLFxuICBhcmVJdGVyYWJsZXNFcXVhbFxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5pbXBvcnQge0luamVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge0FwcEVsZW1lbnR9IGZyb20gJy4vZWxlbWVudCc7XG5pbXBvcnQge1xuICBhc3NlcnRpb25zRW5hYmxlZCxcbiAgaXNQcmVzZW50LFxuICBpc0JsYW5rLFxuICBUeXBlLFxuICBpc0FycmF5LFxuICBpc051bWJlcixcbiAgQ09OU1QsXG4gIENPTlNUX0VYUFIsXG4gIHN0cmluZ2lmeSxcbiAgaXNQcmltaXRpdmUsXG4gIGlzU3RyaW5nXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmltcG9ydCB7T2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtSZW5kZXJlciwgUm9vdFJlbmRlcmVyLCBSZW5kZXJDb21wb25lbnRUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZW5kZXIvYXBpJztcbmltcG9ydCB7Vmlld1JlZl99IGZyb20gJy4vdmlld19yZWYnO1xuXG5pbXBvcnQge1ZpZXdUeXBlfSBmcm9tICcuL3ZpZXdfdHlwZSc7XG5pbXBvcnQge1xuICBWaWV3VXRpbHMsXG4gIGZsYXR0ZW5OZXN0ZWRWaWV3UmVuZGVyTm9kZXMsXG4gIGVuc3VyZVNsb3RDb3VudCxcbiAgYXJyYXlMb29zZUlkZW50aWNhbCxcbiAgbWFwTG9vc2VJZGVudGljYWxcbn0gZnJvbSAnLi92aWV3X3V0aWxzJztcbmltcG9ydCB7XG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JTdGF0ZSxcbiAgaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIGRldk1vZGVFcXVhbFxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rpb24nO1xuaW1wb3J0IHt3dGZDcmVhdGVTY29wZSwgd3RmTGVhdmUsIFd0ZlNjb3BlRm59IGZyb20gJy4uL3Byb2ZpbGUvcHJvZmlsZSc7XG5pbXBvcnQge1xuICBFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEV4Y2VwdGlvbixcbiAgVmlld0Rlc3Ryb3llZEV4Y2VwdGlvbixcbiAgVmlld1dyYXBwZWRFeGNlcHRpb25cbn0gZnJvbSAnLi9leGNlcHRpb25zJztcbmltcG9ydCB7U3RhdGljTm9kZURlYnVnSW5mbywgRGVidWdDb250ZXh0fSBmcm9tICcuL2RlYnVnX2NvbnRleHQnO1xuaW1wb3J0IHtFbGVtZW50SW5qZWN0b3J9IGZyb20gJy4vZWxlbWVudF9pbmplY3Rvcic7XG5cbmNvbnN0IEVNUFRZX0NPTlRFWFQgPSBDT05TVF9FWFBSKG5ldyBPYmplY3QoKSk7XG5cbnZhciBfc2NvcGVfY2hlY2s6IFd0ZlNjb3BlRm4gPSB3dGZDcmVhdGVTY29wZShgQXBwVmlldyNjaGVjayhhc2NpaSBpZClgKTtcblxuLyoqXG4gKiBDb3N0IG9mIG1ha2luZyBvYmplY3RzOiBodHRwOi8vanNwZXJmLmNvbS9pbnN0YW50aWF0ZS1zaXplLW9mLW9iamVjdFxuICpcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFwcFZpZXc8VD4ge1xuICByZWY6IFZpZXdSZWZfO1xuICByb290Tm9kZXNPckFwcEVsZW1lbnRzOiBhbnlbXTtcbiAgYWxsTm9kZXM6IGFueVtdO1xuICBkaXNwb3NhYmxlczogRnVuY3Rpb25bXTtcbiAgc3Vic2NyaXB0aW9uczogYW55W107XG4gIGNvbnRlbnRDaGlsZHJlbjogQXBwVmlldzxhbnk+W10gPSBbXTtcbiAgdmlld0NoaWxkcmVuOiBBcHBWaWV3PGFueT5bXSA9IFtdO1xuICByZW5kZXJQYXJlbnQ6IEFwcFZpZXc8YW55PjtcbiAgdmlld0NvbnRhaW5lckVsZW1lbnQ6IEFwcEVsZW1lbnQgPSBudWxsO1xuXG4gIC8vIFRoZSBuYW1lcyBvZiB0aGUgYmVsb3cgZmllbGRzIG11c3QgYmUga2VwdCBpbiBzeW5jIHdpdGggY29kZWdlbl9uYW1lX3V0aWwudHMgb3JcbiAgLy8gY2hhbmdlIGRldGVjdGlvbiB3aWxsIGZhaWwuXG4gIGNkU3RhdGU6IENoYW5nZURldGVjdG9yU3RhdGUgPSBDaGFuZ2VEZXRlY3RvclN0YXRlLk5ldmVyQ2hlY2tlZDtcblxuICAvKipcbiAgICogVGhlIGNvbnRleHQgYWdhaW5zdCB3aGljaCBkYXRhLWJpbmRpbmcgZXhwcmVzc2lvbnMgaW4gdGhpcyB2aWV3IGFyZSBldmFsdWF0ZWQgYWdhaW5zdC5cbiAgICogVGhpcyBpcyBhbHdheXMgYSBjb21wb25lbnQgaW5zdGFuY2UuXG4gICAqL1xuICBjb250ZXh0OiBUID0gbnVsbDtcblxuICBwcm9qZWN0YWJsZU5vZGVzOiBBcnJheTxhbnkgfCBhbnlbXT47XG5cbiAgZGVzdHJveWVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgcmVuZGVyZXI6IFJlbmRlcmVyO1xuXG4gIHByaXZhdGUgX2hhc0V4dGVybmFsSG9zdEVsZW1lbnQ6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocHVibGljIGNsYXp6OiBhbnksIHB1YmxpYyBjb21wb25lbnRUeXBlOiBSZW5kZXJDb21wb25lbnRUeXBlLCBwdWJsaWMgdHlwZTogVmlld1R5cGUsXG4gICAgICAgICAgICAgIHB1YmxpYyBsb2NhbHM6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBwdWJsaWMgdmlld1V0aWxzOiBWaWV3VXRpbHMsXG4gICAgICAgICAgICAgIHB1YmxpYyBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IsIHB1YmxpYyBkZWNsYXJhdGlvbkFwcEVsZW1lbnQ6IEFwcEVsZW1lbnQsXG4gICAgICAgICAgICAgIHB1YmxpYyBjZE1vZGU6IENoYW5nZURldGVjdGlvblN0cmF0ZWd5KSB7XG4gICAgdGhpcy5yZWYgPSBuZXcgVmlld1JlZl8odGhpcyk7XG4gICAgaWYgKHR5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCB8fCB0eXBlID09PSBWaWV3VHlwZS5IT1NUKSB7XG4gICAgICB0aGlzLnJlbmRlcmVyID0gdmlld1V0aWxzLnJlbmRlckNvbXBvbmVudChjb21wb25lbnRUeXBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZW5kZXJlciA9IGRlY2xhcmF0aW9uQXBwRWxlbWVudC5wYXJlbnRWaWV3LnJlbmRlcmVyO1xuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZShnaXZlblByb2plY3RhYmxlTm9kZXM6IEFycmF5PGFueSB8IGFueVtdPiwgcm9vdFNlbGVjdG9yT3JOb2RlOiBzdHJpbmcgfCBhbnkpOiBBcHBFbGVtZW50IHtcbiAgICB2YXIgY29udGV4dDtcbiAgICB2YXIgcHJvamVjdGFibGVOb2RlcztcbiAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgY2FzZSBWaWV3VHlwZS5DT01QT05FTlQ6XG4gICAgICAgIGNvbnRleHQgPSB0aGlzLmRlY2xhcmF0aW9uQXBwRWxlbWVudC5jb21wb25lbnQ7XG4gICAgICAgIHByb2plY3RhYmxlTm9kZXMgPSBlbnN1cmVTbG90Q291bnQoZ2l2ZW5Qcm9qZWN0YWJsZU5vZGVzLCB0aGlzLmNvbXBvbmVudFR5cGUuc2xvdENvdW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFZpZXdUeXBlLkVNQkVEREVEOlxuICAgICAgICBjb250ZXh0ID0gdGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQucGFyZW50Vmlldy5jb250ZXh0O1xuICAgICAgICBwcm9qZWN0YWJsZU5vZGVzID0gdGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQucGFyZW50Vmlldy5wcm9qZWN0YWJsZU5vZGVzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVmlld1R5cGUuSE9TVDpcbiAgICAgICAgY29udGV4dCA9IEVNUFRZX0NPTlRFWFQ7XG4gICAgICAgIC8vIE5vdGU6IERvbid0IGVuc3VyZSB0aGUgc2xvdCBjb3VudCBmb3IgdGhlIHByb2plY3RhYmxlTm9kZXMgYXMgd2Ugc3RvcmVcbiAgICAgICAgLy8gdGhlbSBvbmx5IGZvciB0aGUgY29udGFpbmVkIGNvbXBvbmVudCB2aWV3ICh3aGljaCB3aWxsIGxhdGVyIGNoZWNrIHRoZSBzbG90IGNvdW50Li4uKVxuICAgICAgICBwcm9qZWN0YWJsZU5vZGVzID0gZ2l2ZW5Qcm9qZWN0YWJsZU5vZGVzO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgdGhpcy5faGFzRXh0ZXJuYWxIb3N0RWxlbWVudCA9IGlzUHJlc2VudChyb290U2VsZWN0b3JPck5vZGUpO1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgdGhpcy5wcm9qZWN0YWJsZU5vZGVzID0gcHJvamVjdGFibGVOb2RlcztcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVJbnRlcm5hbChyb290U2VsZWN0b3JPck5vZGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJ3cml0dGVuIGJ5IGltcGxlbWVudGF0aW9ucy5cbiAgICogUmV0dXJucyB0aGUgQXBwRWxlbWVudCBmb3IgdGhlIGhvc3QgZWxlbWVudCBmb3IgVmlld1R5cGUuSE9TVC5cbiAgICovXG4gIGNyZWF0ZUludGVybmFsKHJvb3RTZWxlY3Rvck9yTm9kZTogc3RyaW5nIHwgYW55KTogQXBwRWxlbWVudCB7IHJldHVybiBudWxsOyB9XG5cbiAgaW5pdChyb290Tm9kZXNPckFwcEVsZW1lbnRzOiBhbnlbXSwgYWxsTm9kZXM6IGFueVtdLCBkaXNwb3NhYmxlczogRnVuY3Rpb25bXSxcbiAgICAgICBzdWJzY3JpcHRpb25zOiBhbnlbXSkge1xuICAgIHRoaXMucm9vdE5vZGVzT3JBcHBFbGVtZW50cyA9IHJvb3ROb2Rlc09yQXBwRWxlbWVudHM7XG4gICAgdGhpcy5hbGxOb2RlcyA9IGFsbE5vZGVzO1xuICAgIHRoaXMuZGlzcG9zYWJsZXMgPSBkaXNwb3NhYmxlcztcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBzdWJzY3JpcHRpb25zO1xuICAgIGlmICh0aGlzLnR5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCkge1xuICAgICAgLy8gTm90ZTogdGhlIHJlbmRlciBub2RlcyBoYXZlIGJlZW4gYXR0YWNoZWQgdG8gdGhlaXIgaG9zdCBlbGVtZW50XG4gICAgICAvLyBpbiB0aGUgVmlld0ZhY3RvcnkgYWxyZWFkeS5cbiAgICAgIHRoaXMuZGVjbGFyYXRpb25BcHBFbGVtZW50LnBhcmVudFZpZXcudmlld0NoaWxkcmVuLnB1c2godGhpcyk7XG4gICAgICB0aGlzLmRpcnR5UGFyZW50UXVlcmllc0ludGVybmFsKCk7XG4gICAgfVxuICB9XG5cbiAgc2VsZWN0T3JDcmVhdGVIb3N0RWxlbWVudChlbGVtZW50TmFtZTogc3RyaW5nLCByb290U2VsZWN0b3JPck5vZGU6IHN0cmluZyB8IGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1Z0N0eDogRGVidWdDb250ZXh0KTogYW55IHtcbiAgICB2YXIgaG9zdEVsZW1lbnQ7XG4gICAgaWYgKGlzUHJlc2VudChyb290U2VsZWN0b3JPck5vZGUpKSB7XG4gICAgICBob3N0RWxlbWVudCA9IHRoaXMucmVuZGVyZXIuc2VsZWN0Um9vdEVsZW1lbnQocm9vdFNlbGVjdG9yT3JOb2RlLCBkZWJ1Z0N0eCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhvc3RFbGVtZW50ID0gdGhpcy5yZW5kZXJlci5jcmVhdGVFbGVtZW50KG51bGwsIGVsZW1lbnROYW1lLCBkZWJ1Z0N0eCk7XG4gICAgfVxuICAgIHJldHVybiBob3N0RWxlbWVudDtcbiAgfVxuXG4gIGluamVjdG9yR2V0KHRva2VuOiBhbnksIG5vZGVJbmRleDogbnVtYmVyLCBub3RGb3VuZFJlc3VsdDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5pbmplY3RvckdldEludGVybmFsKHRva2VuLCBub2RlSW5kZXgsIG5vdEZvdW5kUmVzdWx0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVyd3JpdHRlbiBieSBpbXBsZW1lbnRhdGlvbnNcbiAgICovXG4gIGluamVjdG9yR2V0SW50ZXJuYWwodG9rZW46IGFueSwgbm9kZUluZGV4OiBudW1iZXIsIG5vdEZvdW5kUmVzdWx0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBub3RGb3VuZFJlc3VsdDtcbiAgfVxuXG4gIGluamVjdG9yKG5vZGVJbmRleDogbnVtYmVyKTogSW5qZWN0b3Ige1xuICAgIGlmIChpc1ByZXNlbnQobm9kZUluZGV4KSkge1xuICAgICAgcmV0dXJuIG5ldyBFbGVtZW50SW5qZWN0b3IodGhpcywgbm9kZUluZGV4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucGFyZW50SW5qZWN0b3I7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5faGFzRXh0ZXJuYWxIb3N0RWxlbWVudCkge1xuICAgICAgdGhpcy5yZW5kZXJlci5kZXRhY2hWaWV3KHRoaXMuZmxhdFJvb3ROb2Rlcyk7XG4gICAgfSBlbHNlIGlmIChpc1ByZXNlbnQodGhpcy52aWV3Q29udGFpbmVyRWxlbWVudCkpIHtcbiAgICAgIHRoaXMudmlld0NvbnRhaW5lckVsZW1lbnQuZGV0YWNoVmlldyh0aGlzLnZpZXdDb250YWluZXJFbGVtZW50Lm5lc3RlZFZpZXdzLmluZGV4T2YodGhpcykpO1xuICAgIH1cbiAgICB0aGlzLl9kZXN0cm95UmVjdXJzZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZGVzdHJveVJlY3Vyc2UoKSB7XG4gICAgaWYgKHRoaXMuZGVzdHJveWVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBjaGlsZHJlbiA9IHRoaXMuY29udGVudENoaWxkcmVuO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNoaWxkcmVuW2ldLl9kZXN0cm95UmVjdXJzZSgpO1xuICAgIH1cbiAgICBjaGlsZHJlbiA9IHRoaXMudmlld0NoaWxkcmVuO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNoaWxkcmVuW2ldLl9kZXN0cm95UmVjdXJzZSgpO1xuICAgIH1cbiAgICB0aGlzLmRlc3Ryb3lMb2NhbCgpO1xuXG4gICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xuICB9XG5cbiAgZGVzdHJveUxvY2FsKCkge1xuICAgIHZhciBob3N0RWxlbWVudCA9XG4gICAgICAgIHRoaXMudHlwZSA9PT0gVmlld1R5cGUuQ09NUE9ORU5UID8gdGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQubmF0aXZlRWxlbWVudCA6IG51bGw7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRpc3Bvc2FibGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLmRpc3Bvc2FibGVzW2ldKCk7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdWJzY3JpcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBPYnNlcnZhYmxlV3JhcHBlci5kaXNwb3NlKHRoaXMuc3Vic2NyaXB0aW9uc1tpXSk7XG4gICAgfVxuICAgIHRoaXMuZGVzdHJveUludGVybmFsKCk7XG4gICAgdGhpcy5kaXJ0eVBhcmVudFF1ZXJpZXNJbnRlcm5hbCgpO1xuICAgIHRoaXMucmVuZGVyZXIuZGVzdHJveVZpZXcoaG9zdEVsZW1lbnQsIHRoaXMuYWxsTm9kZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJ3cml0dGVuIGJ5IGltcGxlbWVudGF0aW9uc1xuICAgKi9cbiAgZGVzdHJveUludGVybmFsKCk6IHZvaWQge31cblxuICBnZXQgY2hhbmdlRGV0ZWN0b3JSZWYoKTogQ2hhbmdlRGV0ZWN0b3JSZWYgeyByZXR1cm4gdGhpcy5yZWY7IH1cblxuICBnZXQgcGFyZW50KCk6IEFwcFZpZXc8YW55PiB7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLmRlY2xhcmF0aW9uQXBwRWxlbWVudCkgPyB0aGlzLmRlY2xhcmF0aW9uQXBwRWxlbWVudC5wYXJlbnRWaWV3IDogbnVsbDtcbiAgfVxuXG4gIGdldCBmbGF0Um9vdE5vZGVzKCk6IGFueVtdIHsgcmV0dXJuIGZsYXR0ZW5OZXN0ZWRWaWV3UmVuZGVyTm9kZXModGhpcy5yb290Tm9kZXNPckFwcEVsZW1lbnRzKTsgfVxuXG4gIGdldCBsYXN0Um9vdE5vZGUoKTogYW55IHtcbiAgICB2YXIgbGFzdE5vZGUgPSB0aGlzLnJvb3ROb2Rlc09yQXBwRWxlbWVudHMubGVuZ3RoID4gMCA/XG4gICAgICAgICAgICAgICAgICAgICAgIHRoaXMucm9vdE5vZGVzT3JBcHBFbGVtZW50c1t0aGlzLnJvb3ROb2Rlc09yQXBwRWxlbWVudHMubGVuZ3RoIC0gMV0gOlxuICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xuICAgIHJldHVybiBfZmluZExhc3RSZW5kZXJOb2RlKGxhc3ROb2RlKTtcbiAgfVxuXG4gIGhhc0xvY2FsKGNvbnRleHROYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gU3RyaW5nTWFwV3JhcHBlci5jb250YWlucyh0aGlzLmxvY2FscywgY29udGV4dE5hbWUpO1xuICB9XG5cbiAgc2V0TG9jYWwoY29udGV4dE5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQgeyB0aGlzLmxvY2Fsc1tjb250ZXh0TmFtZV0gPSB2YWx1ZTsgfVxuXG4gIC8qKlxuICAgKiBPdmVyd3JpdHRlbiBieSBpbXBsZW1lbnRhdGlvbnNcbiAgICovXG4gIGRpcnR5UGFyZW50UXVlcmllc0ludGVybmFsKCk6IHZvaWQge31cblxuICBkZXRlY3RDaGFuZ2VzKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB2YXIgcyA9IF9zY29wZV9jaGVjayh0aGlzLmNsYXp6KTtcbiAgICBpZiAodGhpcy5jZE1vZGUgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRldGFjaGVkIHx8XG4gICAgICAgIHRoaXMuY2RNb2RlID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja2VkIHx8XG4gICAgICAgIHRoaXMuY2RTdGF0ZSA9PT0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5FcnJvcmVkKVxuICAgICAgcmV0dXJuO1xuICAgIGlmICh0aGlzLmRlc3Ryb3llZCkge1xuICAgICAgdGhpcy50aHJvd0Rlc3Ryb3llZEVycm9yKCdkZXRlY3RDaGFuZ2VzJyk7XG4gICAgfVxuICAgIHRoaXMuZGV0ZWN0Q2hhbmdlc0ludGVybmFsKHRocm93T25DaGFuZ2UpO1xuICAgIGlmICh0aGlzLmNkTW9kZSA9PT0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tPbmNlKVxuICAgICAgdGhpcy5jZE1vZGUgPSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja2VkO1xuXG4gICAgdGhpcy5jZFN0YXRlID0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5DaGVja2VkQmVmb3JlO1xuICAgIHd0ZkxlYXZlKHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJ3cml0dGVuIGJ5IGltcGxlbWVudGF0aW9uc1xuICAgKi9cbiAgZGV0ZWN0Q2hhbmdlc0ludGVybmFsKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmRldGVjdENvbnRlbnRDaGlsZHJlbkNoYW5nZXModGhyb3dPbkNoYW5nZSk7XG4gICAgdGhpcy5kZXRlY3RWaWV3Q2hpbGRyZW5DaGFuZ2VzKHRocm93T25DaGFuZ2UpO1xuICB9XG5cbiAgZGV0ZWN0Q29udGVudENoaWxkcmVuQ2hhbmdlcyh0aHJvd09uQ2hhbmdlOiBib29sZWFuKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRlbnRDaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgdGhpcy5jb250ZW50Q2hpbGRyZW5baV0uZGV0ZWN0Q2hhbmdlcyh0aHJvd09uQ2hhbmdlKTtcbiAgICB9XG4gIH1cblxuICBkZXRlY3RWaWV3Q2hpbGRyZW5DaGFuZ2VzKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudmlld0NoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICB0aGlzLnZpZXdDaGlsZHJlbltpXS5kZXRlY3RDaGFuZ2VzKHRocm93T25DaGFuZ2UpO1xuICAgIH1cbiAgfVxuXG4gIGFkZFRvQ29udGVudENoaWxkcmVuKHJlbmRlckFwcEVsZW1lbnQ6IEFwcEVsZW1lbnQpOiB2b2lkIHtcbiAgICByZW5kZXJBcHBFbGVtZW50LnBhcmVudFZpZXcuY29udGVudENoaWxkcmVuLnB1c2godGhpcyk7XG4gICAgdGhpcy52aWV3Q29udGFpbmVyRWxlbWVudCA9IHJlbmRlckFwcEVsZW1lbnQ7XG4gICAgdGhpcy5kaXJ0eVBhcmVudFF1ZXJpZXNJbnRlcm5hbCgpO1xuICB9XG5cbiAgcmVtb3ZlRnJvbUNvbnRlbnRDaGlsZHJlbihyZW5kZXJBcHBFbGVtZW50OiBBcHBFbGVtZW50KTogdm9pZCB7XG4gICAgTGlzdFdyYXBwZXIucmVtb3ZlKHJlbmRlckFwcEVsZW1lbnQucGFyZW50Vmlldy5jb250ZW50Q2hpbGRyZW4sIHRoaXMpO1xuICAgIHRoaXMuZGlydHlQYXJlbnRRdWVyaWVzSW50ZXJuYWwoKTtcbiAgICB0aGlzLnZpZXdDb250YWluZXJFbGVtZW50ID0gbnVsbDtcbiAgfVxuXG4gIG1hcmtBc0NoZWNrT25jZSgpOiB2b2lkIHsgdGhpcy5jZE1vZGUgPSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja09uY2U7IH1cblxuICBtYXJrUGF0aFRvUm9vdEFzQ2hlY2tPbmNlKCk6IHZvaWQge1xuICAgIGxldCBjOiBBcHBWaWV3PGFueT4gPSB0aGlzO1xuICAgIHdoaWxlIChpc1ByZXNlbnQoYykgJiYgYy5jZE1vZGUgIT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRldGFjaGVkKSB7XG4gICAgICBpZiAoYy5jZE1vZGUgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrZWQpIHtcbiAgICAgICAgYy5jZE1vZGUgPSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja09uY2U7XG4gICAgICB9XG4gICAgICBsZXQgcGFyZW50RWwgPVxuICAgICAgICAgIGMudHlwZSA9PT0gVmlld1R5cGUuQ09NUE9ORU5UID8gYy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQgOiBjLnZpZXdDb250YWluZXJFbGVtZW50O1xuICAgICAgYyA9IGlzUHJlc2VudChwYXJlbnRFbCkgPyBwYXJlbnRFbC5wYXJlbnRWaWV3IDogbnVsbDtcbiAgICB9XG4gIH1cblxuICBldmVudEhhbmRsZXIoY2I6IEZ1bmN0aW9uKTogRnVuY3Rpb24geyByZXR1cm4gY2I7IH1cblxuICB0aHJvd0Rlc3Ryb3llZEVycm9yKGRldGFpbHM6IHN0cmluZyk6IHZvaWQgeyB0aHJvdyBuZXcgVmlld0Rlc3Ryb3llZEV4Y2VwdGlvbihkZXRhaWxzKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVidWdBcHBWaWV3PFQ+IGV4dGVuZHMgQXBwVmlldzxUPiB7XG4gIHByaXZhdGUgX2N1cnJlbnREZWJ1Z0NvbnRleHQ6IERlYnVnQ29udGV4dCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoY2xheno6IGFueSwgY29tcG9uZW50VHlwZTogUmVuZGVyQ29tcG9uZW50VHlwZSwgdHlwZTogVmlld1R5cGUsXG4gICAgICAgICAgICAgIGxvY2Fsczoge1trZXk6IHN0cmluZ106IGFueX0sIHZpZXdVdGlsczogVmlld1V0aWxzLCBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IsXG4gICAgICAgICAgICAgIGRlY2xhcmF0aW9uQXBwRWxlbWVudDogQXBwRWxlbWVudCwgY2RNb2RlOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgICAgICAgICAgICAgcHVibGljIHN0YXRpY05vZGVEZWJ1Z0luZm9zOiBTdGF0aWNOb2RlRGVidWdJbmZvW10pIHtcbiAgICBzdXBlcihjbGF6eiwgY29tcG9uZW50VHlwZSwgdHlwZSwgbG9jYWxzLCB2aWV3VXRpbHMsIHBhcmVudEluamVjdG9yLCBkZWNsYXJhdGlvbkFwcEVsZW1lbnQsXG4gICAgICAgICAgY2RNb2RlKTtcbiAgfVxuXG4gIGNyZWF0ZShnaXZlblByb2plY3RhYmxlTm9kZXM6IEFycmF5PGFueSB8IGFueVtdPiwgcm9vdFNlbGVjdG9yOiBzdHJpbmcpOiBBcHBFbGVtZW50IHtcbiAgICB0aGlzLl9yZXNldERlYnVnKCk7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBzdXBlci5jcmVhdGUoZ2l2ZW5Qcm9qZWN0YWJsZU5vZGVzLCByb290U2VsZWN0b3IpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX3JldGhyb3dXaXRoQ29udGV4dChlLCBlLnN0YWNrKTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgaW5qZWN0b3JHZXQodG9rZW46IGFueSwgbm9kZUluZGV4OiBudW1iZXIsIG5vdEZvdW5kUmVzdWx0OiBhbnkpOiBhbnkge1xuICAgIHRoaXMuX3Jlc2V0RGVidWcoKTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHN1cGVyLmluamVjdG9yR2V0KHRva2VuLCBub2RlSW5kZXgsIG5vdEZvdW5kUmVzdWx0KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl9yZXRocm93V2l0aENvbnRleHQoZSwgZS5zdGFjayk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3lMb2NhbCgpIHtcbiAgICB0aGlzLl9yZXNldERlYnVnKCk7XG4gICAgdHJ5IHtcbiAgICAgIHN1cGVyLmRlc3Ryb3lMb2NhbCgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX3JldGhyb3dXaXRoQ29udGV4dChlLCBlLnN0YWNrKTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgZGV0ZWN0Q2hhbmdlcyh0aHJvd09uQ2hhbmdlOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fcmVzZXREZWJ1ZygpO1xuICAgIHRyeSB7XG4gICAgICBzdXBlci5kZXRlY3RDaGFuZ2VzKHRocm93T25DaGFuZ2UpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX3JldGhyb3dXaXRoQ29udGV4dChlLCBlLnN0YWNrKTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcmVzZXREZWJ1ZygpIHsgdGhpcy5fY3VycmVudERlYnVnQ29udGV4dCA9IG51bGw7IH1cblxuICBkZWJ1Zyhub2RlSW5kZXg6IG51bWJlciwgcm93TnVtOiBudW1iZXIsIGNvbE51bTogbnVtYmVyKTogRGVidWdDb250ZXh0IHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudERlYnVnQ29udGV4dCA9IG5ldyBEZWJ1Z0NvbnRleHQodGhpcywgbm9kZUluZGV4LCByb3dOdW0sIGNvbE51bSk7XG4gIH1cblxuICBwcml2YXRlIF9yZXRocm93V2l0aENvbnRleHQoZTogYW55LCBzdGFjazogYW55KSB7XG4gICAgaWYgKCEoZSBpbnN0YW5jZW9mIFZpZXdXcmFwcGVkRXhjZXB0aW9uKSkge1xuICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEV4cHJlc3Npb25DaGFuZ2VkQWZ0ZXJJdEhhc0JlZW5DaGVja2VkRXhjZXB0aW9uKSkge1xuICAgICAgICB0aGlzLmNkU3RhdGUgPSBDaGFuZ2VEZXRlY3RvclN0YXRlLkVycm9yZWQ7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2N1cnJlbnREZWJ1Z0NvbnRleHQpKSB7XG4gICAgICAgIHRocm93IG5ldyBWaWV3V3JhcHBlZEV4Y2VwdGlvbihlLCBzdGFjaywgdGhpcy5fY3VycmVudERlYnVnQ29udGV4dCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZXZlbnRIYW5kbGVyKGNiOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICB2YXIgc3VwZXJIYW5kbGVyID0gc3VwZXIuZXZlbnRIYW5kbGVyKGNiKTtcbiAgICByZXR1cm4gKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLl9yZXNldERlYnVnKCk7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gc3VwZXJIYW5kbGVyKGV2ZW50KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5fcmV0aHJvd1dpdGhDb250ZXh0KGUsIGUuc3RhY2spO1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn1cblxuZnVuY3Rpb24gX2ZpbmRMYXN0UmVuZGVyTm9kZShub2RlOiBhbnkpOiBhbnkge1xuICB2YXIgbGFzdE5vZGU7XG4gIGlmIChub2RlIGluc3RhbmNlb2YgQXBwRWxlbWVudCkge1xuICAgIHZhciBhcHBFbCA9IDxBcHBFbGVtZW50Pm5vZGU7XG4gICAgbGFzdE5vZGUgPSBhcHBFbC5uYXRpdmVFbGVtZW50O1xuICAgIGlmIChpc1ByZXNlbnQoYXBwRWwubmVzdGVkVmlld3MpKSB7XG4gICAgICAvLyBOb3RlOiBWaWV3cyBtaWdodCBoYXZlIG5vIHJvb3Qgbm9kZXMgYXQgYWxsIVxuICAgICAgZm9yICh2YXIgaSA9IGFwcEVsLm5lc3RlZFZpZXdzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIHZhciBuZXN0ZWRWaWV3ID0gYXBwRWwubmVzdGVkVmlld3NbaV07XG4gICAgICAgIGlmIChuZXN0ZWRWaWV3LnJvb3ROb2Rlc09yQXBwRWxlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGxhc3ROb2RlID0gX2ZpbmRMYXN0UmVuZGVyTm9kZShcbiAgICAgICAgICAgICAgbmVzdGVkVmlldy5yb290Tm9kZXNPckFwcEVsZW1lbnRzW25lc3RlZFZpZXcucm9vdE5vZGVzT3JBcHBFbGVtZW50cy5sZW5ndGggLSAxXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbGFzdE5vZGUgPSBub2RlO1xuICB9XG4gIHJldHVybiBsYXN0Tm9kZTtcbn1cbiJdfQ==