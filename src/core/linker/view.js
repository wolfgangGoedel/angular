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
var _scope_check = profile_1.wtfCreateScope("AppView#check(ascii id)");
/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
var AppView = (function () {
    function AppView(clazz, componentType, type, viewUtils, parentInjector, declarationAppElement, cdMode) {
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
        this.cdState = change_detection_1.ChangeDetectorState.NeverChecked;
        this.destroyed = false;
        this.ref = new view_ref_1.ViewRef_(this);
        if (type === view_type_1.ViewType.COMPONENT || type === view_type_1.ViewType.HOST) {
            this.renderer = viewUtils.renderComponent(componentType);
        }
        else {
            this.renderer = declarationAppElement.parentView.renderer;
        }
    }
    AppView.prototype.create = function (context, givenProjectableNodes, rootSelectorOrNode) {
        this.context = context;
        var projectableNodes;
        switch (this.type) {
            case view_type_1.ViewType.COMPONENT:
                projectableNodes = view_utils_1.ensureSlotCount(givenProjectableNodes, this.componentType.slotCount);
                break;
            case view_type_1.ViewType.EMBEDDED:
                projectableNodes = this.declarationAppElement.parentView.projectableNodes;
                break;
            case view_type_1.ViewType.HOST:
                // Note: Don't ensure the slot count for the projectableNodes as we store
                // them only for the contained component view (which will later check the slot count...)
                projectableNodes = givenProjectableNodes;
                break;
        }
        this._hasExternalHostElement = lang_1.isPresent(rootSelectorOrNode);
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
            this.renderParent = this.declarationAppElement.parentView;
            this.dirtyParentQueriesInternal();
        }
    };
    AppView.prototype.selectOrCreateHostElement = function (elementName, rootSelectorOrNode, debugInfo) {
        var hostElement;
        if (lang_1.isPresent(rootSelectorOrNode)) {
            hostElement = this.renderer.selectRootElement(rootSelectorOrNode, debugInfo);
        }
        else {
            hostElement = this.renderer.createElement(null, elementName, debugInfo);
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
        if (this._hasExternalHostElement) {
            this.renderer.detachView(this.flatRootNodes);
        }
        else if (lang_1.isPresent(this.viewContainerElement)) {
            this.viewContainerElement.detachView(this.viewContainerElement.nestedViews.indexOf(this));
        }
        else {
            this.dirtyParentQueriesInternal();
        }
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
    /**
     * Overwritten by implementations
     */
    AppView.prototype.dirtyParentQueriesInternal = function () { };
    AppView.prototype.addRenderContentChild = function (view) {
        this.contentChildren.push(view);
        view.renderParent = this;
        view.dirtyParentQueriesInternal();
    };
    AppView.prototype.removeContentChild = function (view) {
        collection_1.ListWrapper.remove(this.contentChildren, view);
        view.dirtyParentQueriesInternal();
        view.renderParent = null;
    };
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
            c = c.renderParent;
        }
    };
    AppView.prototype.eventHandler = function (cb) { return cb; };
    AppView.prototype.throwDestroyedError = function (details) { throw new exceptions_1.ViewDestroyedException(details); };
    return AppView;
}());
exports.AppView = AppView;
var DebugAppView = (function (_super) {
    __extends(DebugAppView, _super);
    function DebugAppView(clazz, componentType, type, viewUtils, parentInjector, declarationAppElement, cdMode, staticNodeDebugInfos) {
        _super.call(this, clazz, componentType, type, viewUtils, parentInjector, declarationAppElement, cdMode);
        this.staticNodeDebugInfos = staticNodeDebugInfos;
        this._currentDebugContext = null;
    }
    DebugAppView.prototype.create = function (context, givenProjectableNodes, rootSelectorOrNode) {
        this._resetDebug();
        try {
            return _super.prototype.create.call(this, context, givenProjectableNodes, rootSelectorOrNode);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtUlB5bjFZVVcudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDJCQU9PLGdDQUFnQyxDQUFDLENBQUE7QUFHeEMsd0JBQXlCLFdBQVcsQ0FBQyxDQUFBO0FBQ3JDLHFCQVVPLDBCQUEwQixDQUFDLENBQUE7QUFFbEMsc0JBQWdDLDJCQUEyQixDQUFDLENBQUE7QUFPNUQseUJBQXVCLFlBQVksQ0FBQyxDQUFBO0FBRXBDLDBCQUF1QixhQUFhLENBQUMsQ0FBQTtBQUNyQywyQkFNTyxjQUFjLENBQUMsQ0FBQTtBQUN0QixpQ0FNTyxxREFBcUQsQ0FBQyxDQUFBO0FBQzdELHdCQUFtRCxvQkFBb0IsQ0FBQyxDQUFBO0FBQ3hFLDJCQUlPLGNBQWMsQ0FBQyxDQUFBO0FBQ3RCLDhCQUFnRCxpQkFBaUIsQ0FBQyxDQUFBO0FBQ2xFLGlDQUE4QixvQkFBb0IsQ0FBQyxDQUFBO0FBRW5ELElBQUksWUFBWSxHQUFlLHdCQUFjLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUV6RTs7O0dBR0c7QUFDSDtJQXlCRSxpQkFBbUIsS0FBVSxFQUFTLGFBQWtDLEVBQVMsSUFBYyxFQUM1RSxTQUFvQixFQUFTLGNBQXdCLEVBQ3JELHFCQUFpQyxFQUFTLE1BQStCO1FBRnpFLFVBQUssR0FBTCxLQUFLLENBQUs7UUFBUyxrQkFBYSxHQUFiLGFBQWEsQ0FBcUI7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFVO1FBQzVFLGNBQVMsR0FBVCxTQUFTLENBQVc7UUFBUyxtQkFBYyxHQUFkLGNBQWMsQ0FBVTtRQUNyRCwwQkFBcUIsR0FBckIscUJBQXFCLENBQVk7UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUF5QjtRQXJCNUYsb0JBQWUsR0FBbUIsRUFBRSxDQUFDO1FBQ3JDLGlCQUFZLEdBQW1C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Q0FBQyxDQUFDO0lBQ0osQ0FBQztJQUNILG1CQUFDO0FBQUQsQ0FBQyxBQS9FRCxDQUFxQyxPQUFPLEdBK0UzQztBQS9FWSxvQkFBWSxlQStFeEIsQ0FBQTtBQUVELDZCQUE2QixJQUFTO0lBQ3BDLElBQUksUUFBUSxDQUFDO0lBQ2IsRUFBRSxDQUFDLENBQUMsSUFBSSxZQUFZLG9CQUFVLENBQUMsQ0FBQyxDQUFDO1FBQy9CLElBQUksS0FBSyxHQUFlLElBQUksQ0FBQztRQUM3QixRQUFRLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQztRQUMvQixFQUFFLENBQUMsQ0FBQyxnQkFBUyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakMsK0NBQStDO1lBQy9DLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3ZELElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDakQsUUFBUSxHQUFHLG1CQUFtQixDQUMxQixVQUFVLENBQUMsc0JBQXNCLENBQUMsVUFBVSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2RixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQ2xCLENBQUM7SUFDRCxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2xCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBMaXN0V3JhcHBlcixcbiAgTWFwV3JhcHBlcixcbiAgTWFwLFxuICBTdHJpbmdNYXBXcmFwcGVyLFxuICBpc0xpc3RMaWtlSXRlcmFibGUsXG4gIGFyZUl0ZXJhYmxlc0VxdWFsXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7QXBwRWxlbWVudH0gZnJvbSAnLi9lbGVtZW50JztcbmltcG9ydCB7XG4gIGFzc2VydGlvbnNFbmFibGVkLFxuICBpc1ByZXNlbnQsXG4gIGlzQmxhbmssXG4gIFR5cGUsXG4gIGlzQXJyYXksXG4gIGlzTnVtYmVyLFxuICBzdHJpbmdpZnksXG4gIGlzUHJpbWl0aXZlLFxuICBpc1N0cmluZ1xufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge09ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7XG4gIFJlbmRlcmVyLFxuICBSb290UmVuZGVyZXIsXG4gIFJlbmRlckNvbXBvbmVudFR5cGUsXG4gIFJlbmRlckRlYnVnSW5mb1xufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZW5kZXIvYXBpJztcbmltcG9ydCB7Vmlld1JlZl99IGZyb20gJy4vdmlld19yZWYnO1xuXG5pbXBvcnQge1ZpZXdUeXBlfSBmcm9tICcuL3ZpZXdfdHlwZSc7XG5pbXBvcnQge1xuICBWaWV3VXRpbHMsXG4gIGZsYXR0ZW5OZXN0ZWRWaWV3UmVuZGVyTm9kZXMsXG4gIGVuc3VyZVNsb3RDb3VudCxcbiAgYXJyYXlMb29zZUlkZW50aWNhbCxcbiAgbWFwTG9vc2VJZGVudGljYWxcbn0gZnJvbSAnLi92aWV3X3V0aWxzJztcbmltcG9ydCB7XG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JTdGF0ZSxcbiAgaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIGRldk1vZGVFcXVhbFxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rpb24nO1xuaW1wb3J0IHt3dGZDcmVhdGVTY29wZSwgd3RmTGVhdmUsIFd0ZlNjb3BlRm59IGZyb20gJy4uL3Byb2ZpbGUvcHJvZmlsZSc7XG5pbXBvcnQge1xuICBFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEV4Y2VwdGlvbixcbiAgVmlld0Rlc3Ryb3llZEV4Y2VwdGlvbixcbiAgVmlld1dyYXBwZWRFeGNlcHRpb25cbn0gZnJvbSAnLi9leGNlcHRpb25zJztcbmltcG9ydCB7U3RhdGljTm9kZURlYnVnSW5mbywgRGVidWdDb250ZXh0fSBmcm9tICcuL2RlYnVnX2NvbnRleHQnO1xuaW1wb3J0IHtFbGVtZW50SW5qZWN0b3J9IGZyb20gJy4vZWxlbWVudF9pbmplY3Rvcic7XG5cbnZhciBfc2NvcGVfY2hlY2s6IFd0ZlNjb3BlRm4gPSB3dGZDcmVhdGVTY29wZShgQXBwVmlldyNjaGVjayhhc2NpaSBpZClgKTtcblxuLyoqXG4gKiBDb3N0IG9mIG1ha2luZyBvYmplY3RzOiBodHRwOi8vanNwZXJmLmNvbS9pbnN0YW50aWF0ZS1zaXplLW9mLW9iamVjdFxuICpcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFwcFZpZXc8VD4ge1xuICByZWY6IFZpZXdSZWZfPFQ+O1xuICByb290Tm9kZXNPckFwcEVsZW1lbnRzOiBhbnlbXTtcbiAgYWxsTm9kZXM6IGFueVtdO1xuICBkaXNwb3NhYmxlczogRnVuY3Rpb25bXTtcbiAgc3Vic2NyaXB0aW9uczogYW55W107XG4gIGNvbnRlbnRDaGlsZHJlbjogQXBwVmlldzxhbnk+W10gPSBbXTtcbiAgdmlld0NoaWxkcmVuOiBBcHBWaWV3PGFueT5bXSA9IFtdO1xuICByZW5kZXJQYXJlbnQ6IEFwcFZpZXc8YW55PjtcbiAgdmlld0NvbnRhaW5lckVsZW1lbnQ6IEFwcEVsZW1lbnQgPSBudWxsO1xuXG4gIC8vIFRoZSBuYW1lcyBvZiB0aGUgYmVsb3cgZmllbGRzIG11c3QgYmUga2VwdCBpbiBzeW5jIHdpdGggY29kZWdlbl9uYW1lX3V0aWwudHMgb3JcbiAgLy8gY2hhbmdlIGRldGVjdGlvbiB3aWxsIGZhaWwuXG4gIGNkU3RhdGU6IENoYW5nZURldGVjdG9yU3RhdGUgPSBDaGFuZ2VEZXRlY3RvclN0YXRlLk5ldmVyQ2hlY2tlZDtcblxuICBwcm9qZWN0YWJsZU5vZGVzOiBBcnJheTxhbnkgfCBhbnlbXT47XG5cbiAgZGVzdHJveWVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgcmVuZGVyZXI6IFJlbmRlcmVyO1xuXG4gIHByaXZhdGUgX2hhc0V4dGVybmFsSG9zdEVsZW1lbnQ6IGJvb2xlYW47XG5cbiAgcHVibGljIGNvbnRleHQ6IFQ7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGNsYXp6OiBhbnksIHB1YmxpYyBjb21wb25lbnRUeXBlOiBSZW5kZXJDb21wb25lbnRUeXBlLCBwdWJsaWMgdHlwZTogVmlld1R5cGUsXG4gICAgICAgICAgICAgIHB1YmxpYyB2aWV3VXRpbHM6IFZpZXdVdGlscywgcHVibGljIHBhcmVudEluamVjdG9yOiBJbmplY3RvcixcbiAgICAgICAgICAgICAgcHVibGljIGRlY2xhcmF0aW9uQXBwRWxlbWVudDogQXBwRWxlbWVudCwgcHVibGljIGNkTW9kZTogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kpIHtcbiAgICB0aGlzLnJlZiA9IG5ldyBWaWV3UmVmXyh0aGlzKTtcbiAgICBpZiAodHlwZSA9PT0gVmlld1R5cGUuQ09NUE9ORU5UIHx8IHR5cGUgPT09IFZpZXdUeXBlLkhPU1QpIHtcbiAgICAgIHRoaXMucmVuZGVyZXIgPSB2aWV3VXRpbHMucmVuZGVyQ29tcG9uZW50KGNvbXBvbmVudFR5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlbmRlcmVyID0gZGVjbGFyYXRpb25BcHBFbGVtZW50LnBhcmVudFZpZXcucmVuZGVyZXI7XG4gICAgfVxuICB9XG5cbiAgY3JlYXRlKGNvbnRleHQ6IFQsIGdpdmVuUHJvamVjdGFibGVOb2RlczogQXJyYXk8YW55IHwgYW55W10+LFxuICAgICAgICAgcm9vdFNlbGVjdG9yT3JOb2RlOiBzdHJpbmcgfCBhbnkpOiBBcHBFbGVtZW50IHtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICAgIHZhciBwcm9qZWN0YWJsZU5vZGVzO1xuICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICBjYXNlIFZpZXdUeXBlLkNPTVBPTkVOVDpcbiAgICAgICAgcHJvamVjdGFibGVOb2RlcyA9IGVuc3VyZVNsb3RDb3VudChnaXZlblByb2plY3RhYmxlTm9kZXMsIHRoaXMuY29tcG9uZW50VHlwZS5zbG90Q291bnQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVmlld1R5cGUuRU1CRURERUQ6XG4gICAgICAgIHByb2plY3RhYmxlTm9kZXMgPSB0aGlzLmRlY2xhcmF0aW9uQXBwRWxlbWVudC5wYXJlbnRWaWV3LnByb2plY3RhYmxlTm9kZXM7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBWaWV3VHlwZS5IT1NUOlxuICAgICAgICAvLyBOb3RlOiBEb24ndCBlbnN1cmUgdGhlIHNsb3QgY291bnQgZm9yIHRoZSBwcm9qZWN0YWJsZU5vZGVzIGFzIHdlIHN0b3JlXG4gICAgICAgIC8vIHRoZW0gb25seSBmb3IgdGhlIGNvbnRhaW5lZCBjb21wb25lbnQgdmlldyAod2hpY2ggd2lsbCBsYXRlciBjaGVjayB0aGUgc2xvdCBjb3VudC4uLilcbiAgICAgICAgcHJvamVjdGFibGVOb2RlcyA9IGdpdmVuUHJvamVjdGFibGVOb2RlcztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHRoaXMuX2hhc0V4dGVybmFsSG9zdEVsZW1lbnQgPSBpc1ByZXNlbnQocm9vdFNlbGVjdG9yT3JOb2RlKTtcbiAgICB0aGlzLnByb2plY3RhYmxlTm9kZXMgPSBwcm9qZWN0YWJsZU5vZGVzO1xuICAgIHJldHVybiB0aGlzLmNyZWF0ZUludGVybmFsKHJvb3RTZWxlY3Rvck9yTm9kZSk7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcndyaXR0ZW4gYnkgaW1wbGVtZW50YXRpb25zLlxuICAgKiBSZXR1cm5zIHRoZSBBcHBFbGVtZW50IGZvciB0aGUgaG9zdCBlbGVtZW50IGZvciBWaWV3VHlwZS5IT1NULlxuICAgKi9cbiAgY3JlYXRlSW50ZXJuYWwocm9vdFNlbGVjdG9yT3JOb2RlOiBzdHJpbmcgfCBhbnkpOiBBcHBFbGVtZW50IHsgcmV0dXJuIG51bGw7IH1cblxuICBpbml0KHJvb3ROb2Rlc09yQXBwRWxlbWVudHM6IGFueVtdLCBhbGxOb2RlczogYW55W10sIGRpc3Bvc2FibGVzOiBGdW5jdGlvbltdLFxuICAgICAgIHN1YnNjcmlwdGlvbnM6IGFueVtdKSB7XG4gICAgdGhpcy5yb290Tm9kZXNPckFwcEVsZW1lbnRzID0gcm9vdE5vZGVzT3JBcHBFbGVtZW50cztcbiAgICB0aGlzLmFsbE5vZGVzID0gYWxsTm9kZXM7XG4gICAgdGhpcy5kaXNwb3NhYmxlcyA9IGRpc3Bvc2FibGVzO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IHN1YnNjcmlwdGlvbnM7XG4gICAgaWYgKHRoaXMudHlwZSA9PT0gVmlld1R5cGUuQ09NUE9ORU5UKSB7XG4gICAgICAvLyBOb3RlOiB0aGUgcmVuZGVyIG5vZGVzIGhhdmUgYmVlbiBhdHRhY2hlZCB0byB0aGVpciBob3N0IGVsZW1lbnRcbiAgICAgIC8vIGluIHRoZSBWaWV3RmFjdG9yeSBhbHJlYWR5LlxuICAgICAgdGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQucGFyZW50Vmlldy52aWV3Q2hpbGRyZW4ucHVzaCh0aGlzKTtcbiAgICAgIHRoaXMucmVuZGVyUGFyZW50ID0gdGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQucGFyZW50VmlldztcbiAgICAgIHRoaXMuZGlydHlQYXJlbnRRdWVyaWVzSW50ZXJuYWwoKTtcbiAgICB9XG4gIH1cblxuICBzZWxlY3RPckNyZWF0ZUhvc3RFbGVtZW50KGVsZW1lbnROYW1lOiBzdHJpbmcsIHJvb3RTZWxlY3Rvck9yTm9kZTogc3RyaW5nIHwgYW55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnSW5mbzogUmVuZGVyRGVidWdJbmZvKTogYW55IHtcbiAgICB2YXIgaG9zdEVsZW1lbnQ7XG4gICAgaWYgKGlzUHJlc2VudChyb290U2VsZWN0b3JPck5vZGUpKSB7XG4gICAgICBob3N0RWxlbWVudCA9IHRoaXMucmVuZGVyZXIuc2VsZWN0Um9vdEVsZW1lbnQocm9vdFNlbGVjdG9yT3JOb2RlLCBkZWJ1Z0luZm8pO1xuICAgIH0gZWxzZSB7XG4gICAgICBob3N0RWxlbWVudCA9IHRoaXMucmVuZGVyZXIuY3JlYXRlRWxlbWVudChudWxsLCBlbGVtZW50TmFtZSwgZGVidWdJbmZvKTtcbiAgICB9XG4gICAgcmV0dXJuIGhvc3RFbGVtZW50O1xuICB9XG5cbiAgaW5qZWN0b3JHZXQodG9rZW46IGFueSwgbm9kZUluZGV4OiBudW1iZXIsIG5vdEZvdW5kUmVzdWx0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmluamVjdG9yR2V0SW50ZXJuYWwodG9rZW4sIG5vZGVJbmRleCwgbm90Rm91bmRSZXN1bHQpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJ3cml0dGVuIGJ5IGltcGxlbWVudGF0aW9uc1xuICAgKi9cbiAgaW5qZWN0b3JHZXRJbnRlcm5hbCh0b2tlbjogYW55LCBub2RlSW5kZXg6IG51bWJlciwgbm90Rm91bmRSZXN1bHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIG5vdEZvdW5kUmVzdWx0O1xuICB9XG5cbiAgaW5qZWN0b3Iobm9kZUluZGV4OiBudW1iZXIpOiBJbmplY3RvciB7XG4gICAgaWYgKGlzUHJlc2VudChub2RlSW5kZXgpKSB7XG4gICAgICByZXR1cm4gbmV3IEVsZW1lbnRJbmplY3Rvcih0aGlzLCBub2RlSW5kZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJlbnRJbmplY3RvcjtcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLl9oYXNFeHRlcm5hbEhvc3RFbGVtZW50KSB7XG4gICAgICB0aGlzLnJlbmRlcmVyLmRldGFjaFZpZXcodGhpcy5mbGF0Um9vdE5vZGVzKTtcbiAgICB9IGVsc2UgaWYgKGlzUHJlc2VudCh0aGlzLnZpZXdDb250YWluZXJFbGVtZW50KSkge1xuICAgICAgdGhpcy52aWV3Q29udGFpbmVyRWxlbWVudC5kZXRhY2hWaWV3KHRoaXMudmlld0NvbnRhaW5lckVsZW1lbnQubmVzdGVkVmlld3MuaW5kZXhPZih0aGlzKSk7XG4gICAgfVxuICAgIHRoaXMuX2Rlc3Ryb3lSZWN1cnNlKCk7XG4gIH1cblxuICBwcml2YXRlIF9kZXN0cm95UmVjdXJzZSgpIHtcbiAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGNoaWxkcmVuID0gdGhpcy5jb250ZW50Q2hpbGRyZW47XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY2hpbGRyZW5baV0uX2Rlc3Ryb3lSZWN1cnNlKCk7XG4gICAgfVxuICAgIGNoaWxkcmVuID0gdGhpcy52aWV3Q2hpbGRyZW47XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY2hpbGRyZW5baV0uX2Rlc3Ryb3lSZWN1cnNlKCk7XG4gICAgfVxuICAgIHRoaXMuZGVzdHJveUxvY2FsKCk7XG5cbiAgICB0aGlzLmRlc3Ryb3llZCA9IHRydWU7XG4gIH1cblxuICBkZXN0cm95TG9jYWwoKSB7XG4gICAgdmFyIGhvc3RFbGVtZW50ID1cbiAgICAgICAgdGhpcy50eXBlID09PSBWaWV3VHlwZS5DT01QT05FTlQgPyB0aGlzLmRlY2xhcmF0aW9uQXBwRWxlbWVudC5uYXRpdmVFbGVtZW50IDogbnVsbDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZGlzcG9zYWJsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXNbaV0oKTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnN1YnNjcmlwdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIE9ic2VydmFibGVXcmFwcGVyLmRpc3Bvc2UodGhpcy5zdWJzY3JpcHRpb25zW2ldKTtcbiAgICB9XG4gICAgdGhpcy5kZXN0cm95SW50ZXJuYWwoKTtcbiAgICBpZiAodGhpcy5faGFzRXh0ZXJuYWxIb3N0RWxlbWVudCkge1xuICAgICAgdGhpcy5yZW5kZXJlci5kZXRhY2hWaWV3KHRoaXMuZmxhdFJvb3ROb2Rlcyk7XG4gICAgfSBlbHNlIGlmIChpc1ByZXNlbnQodGhpcy52aWV3Q29udGFpbmVyRWxlbWVudCkpIHtcbiAgICAgIHRoaXMudmlld0NvbnRhaW5lckVsZW1lbnQuZGV0YWNoVmlldyh0aGlzLnZpZXdDb250YWluZXJFbGVtZW50Lm5lc3RlZFZpZXdzLmluZGV4T2YodGhpcykpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRpcnR5UGFyZW50UXVlcmllc0ludGVybmFsKCk7XG4gICAgfVxuICAgIHRoaXMucmVuZGVyZXIuZGVzdHJveVZpZXcoaG9zdEVsZW1lbnQsIHRoaXMuYWxsTm9kZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJ3cml0dGVuIGJ5IGltcGxlbWVudGF0aW9uc1xuICAgKi9cbiAgZGVzdHJveUludGVybmFsKCk6IHZvaWQge31cblxuICBnZXQgY2hhbmdlRGV0ZWN0b3JSZWYoKTogQ2hhbmdlRGV0ZWN0b3JSZWYgeyByZXR1cm4gdGhpcy5yZWY7IH1cblxuICBnZXQgcGFyZW50KCk6IEFwcFZpZXc8YW55PiB7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLmRlY2xhcmF0aW9uQXBwRWxlbWVudCkgPyB0aGlzLmRlY2xhcmF0aW9uQXBwRWxlbWVudC5wYXJlbnRWaWV3IDogbnVsbDtcbiAgfVxuXG4gIGdldCBmbGF0Um9vdE5vZGVzKCk6IGFueVtdIHsgcmV0dXJuIGZsYXR0ZW5OZXN0ZWRWaWV3UmVuZGVyTm9kZXModGhpcy5yb290Tm9kZXNPckFwcEVsZW1lbnRzKTsgfVxuXG4gIGdldCBsYXN0Um9vdE5vZGUoKTogYW55IHtcbiAgICB2YXIgbGFzdE5vZGUgPSB0aGlzLnJvb3ROb2Rlc09yQXBwRWxlbWVudHMubGVuZ3RoID4gMCA/XG4gICAgICAgICAgICAgICAgICAgICAgIHRoaXMucm9vdE5vZGVzT3JBcHBFbGVtZW50c1t0aGlzLnJvb3ROb2Rlc09yQXBwRWxlbWVudHMubGVuZ3RoIC0gMV0gOlxuICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xuICAgIHJldHVybiBfZmluZExhc3RSZW5kZXJOb2RlKGxhc3ROb2RlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVyd3JpdHRlbiBieSBpbXBsZW1lbnRhdGlvbnNcbiAgICovXG4gIGRpcnR5UGFyZW50UXVlcmllc0ludGVybmFsKCk6IHZvaWQge31cblxuICBhZGRSZW5kZXJDb250ZW50Q2hpbGQodmlldzogQXBwVmlldzxhbnk+KTogdm9pZCB7XG4gICAgdGhpcy5jb250ZW50Q2hpbGRyZW4ucHVzaCh2aWV3KTtcbiAgICB2aWV3LnJlbmRlclBhcmVudCA9IHRoaXM7XG4gICAgdmlldy5kaXJ0eVBhcmVudFF1ZXJpZXNJbnRlcm5hbCgpO1xuICB9XG5cbiAgcmVtb3ZlQ29udGVudENoaWxkKHZpZXc6IEFwcFZpZXc8YW55Pik6IHZvaWQge1xuICAgIExpc3RXcmFwcGVyLnJlbW92ZSh0aGlzLmNvbnRlbnRDaGlsZHJlbiwgdmlldyk7XG4gICAgdmlldy5kaXJ0eVBhcmVudFF1ZXJpZXNJbnRlcm5hbCgpO1xuICAgIHZpZXcucmVuZGVyUGFyZW50ID0gbnVsbDtcbiAgfVxuXG4gIGRldGVjdENoYW5nZXModGhyb3dPbkNoYW5nZTogYm9vbGVhbik6IHZvaWQge1xuICAgIHZhciBzID0gX3Njb3BlX2NoZWNrKHRoaXMuY2xhenopO1xuICAgIGlmICh0aGlzLmNkTW9kZSA9PT0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGV0YWNoZWQgfHxcbiAgICAgICAgdGhpcy5jZE1vZGUgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrZWQgfHxcbiAgICAgICAgdGhpcy5jZFN0YXRlID09PSBDaGFuZ2VEZXRlY3RvclN0YXRlLkVycm9yZWQpXG4gICAgICByZXR1cm47XG4gICAgaWYgKHRoaXMuZGVzdHJveWVkKSB7XG4gICAgICB0aGlzLnRocm93RGVzdHJveWVkRXJyb3IoJ2RldGVjdENoYW5nZXMnKTtcbiAgICB9XG4gICAgdGhpcy5kZXRlY3RDaGFuZ2VzSW50ZXJuYWwodGhyb3dPbkNoYW5nZSk7XG4gICAgaWYgKHRoaXMuY2RNb2RlID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja09uY2UpXG4gICAgICB0aGlzLmNkTW9kZSA9IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrZWQ7XG5cbiAgICB0aGlzLmNkU3RhdGUgPSBDaGFuZ2VEZXRlY3RvclN0YXRlLkNoZWNrZWRCZWZvcmU7XG4gICAgd3RmTGVhdmUocyk7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcndyaXR0ZW4gYnkgaW1wbGVtZW50YXRpb25zXG4gICAqL1xuICBkZXRlY3RDaGFuZ2VzSW50ZXJuYWwodGhyb3dPbkNoYW5nZTogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuZGV0ZWN0Q29udGVudENoaWxkcmVuQ2hhbmdlcyh0aHJvd09uQ2hhbmdlKTtcbiAgICB0aGlzLmRldGVjdFZpZXdDaGlsZHJlbkNoYW5nZXModGhyb3dPbkNoYW5nZSk7XG4gIH1cblxuICBkZXRlY3RDb250ZW50Q2hpbGRyZW5DaGFuZ2VzKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29udGVudENoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICB0aGlzLmNvbnRlbnRDaGlsZHJlbltpXS5kZXRlY3RDaGFuZ2VzKHRocm93T25DaGFuZ2UpO1xuICAgIH1cbiAgfVxuXG4gIGRldGVjdFZpZXdDaGlsZHJlbkNoYW5nZXModGhyb3dPbkNoYW5nZTogYm9vbGVhbikge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy52aWV3Q2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgIHRoaXMudmlld0NoaWxkcmVuW2ldLmRldGVjdENoYW5nZXModGhyb3dPbkNoYW5nZSk7XG4gICAgfVxuICB9XG5cbiAgYWRkVG9Db250ZW50Q2hpbGRyZW4ocmVuZGVyQXBwRWxlbWVudDogQXBwRWxlbWVudCk6IHZvaWQge1xuICAgIHJlbmRlckFwcEVsZW1lbnQucGFyZW50Vmlldy5jb250ZW50Q2hpbGRyZW4ucHVzaCh0aGlzKTtcbiAgICB0aGlzLnZpZXdDb250YWluZXJFbGVtZW50ID0gcmVuZGVyQXBwRWxlbWVudDtcbiAgICB0aGlzLmRpcnR5UGFyZW50UXVlcmllc0ludGVybmFsKCk7XG4gIH1cblxuICByZW1vdmVGcm9tQ29udGVudENoaWxkcmVuKHJlbmRlckFwcEVsZW1lbnQ6IEFwcEVsZW1lbnQpOiB2b2lkIHtcbiAgICBMaXN0V3JhcHBlci5yZW1vdmUocmVuZGVyQXBwRWxlbWVudC5wYXJlbnRWaWV3LmNvbnRlbnRDaGlsZHJlbiwgdGhpcyk7XG4gICAgdGhpcy5kaXJ0eVBhcmVudFF1ZXJpZXNJbnRlcm5hbCgpO1xuICAgIHRoaXMudmlld0NvbnRhaW5lckVsZW1lbnQgPSBudWxsO1xuICB9XG5cbiAgbWFya0FzQ2hlY2tPbmNlKCk6IHZvaWQgeyB0aGlzLmNkTW9kZSA9IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrT25jZTsgfVxuXG4gIG1hcmtQYXRoVG9Sb290QXNDaGVja09uY2UoKTogdm9pZCB7XG4gICAgdmFyIGM6IEFwcFZpZXc8YW55PiA9IHRoaXM7XG4gICAgd2hpbGUgKGlzUHJlc2VudChjKSAmJiBjLmNkTW9kZSAhPT0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGV0YWNoZWQpIHtcbiAgICAgIGlmIChjLmNkTW9kZSA9PT0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tlZCkge1xuICAgICAgICBjLmNkTW9kZSA9IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrT25jZTtcbiAgICAgIH1cbiAgICAgIGMgPSBjLnJlbmRlclBhcmVudDtcbiAgICB9XG4gIH1cblxuICBldmVudEhhbmRsZXIoY2I6IEZ1bmN0aW9uKTogRnVuY3Rpb24geyByZXR1cm4gY2I7IH1cblxuICB0aHJvd0Rlc3Ryb3llZEVycm9yKGRldGFpbHM6IHN0cmluZyk6IHZvaWQgeyB0aHJvdyBuZXcgVmlld0Rlc3Ryb3llZEV4Y2VwdGlvbihkZXRhaWxzKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVidWdBcHBWaWV3PFQ+IGV4dGVuZHMgQXBwVmlldzxUPiB7XG4gIHByaXZhdGUgX2N1cnJlbnREZWJ1Z0NvbnRleHQ6IERlYnVnQ29udGV4dCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoY2xheno6IGFueSwgY29tcG9uZW50VHlwZTogUmVuZGVyQ29tcG9uZW50VHlwZSwgdHlwZTogVmlld1R5cGUsIHZpZXdVdGlsczogVmlld1V0aWxzLFxuICAgICAgICAgICAgICBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IsIGRlY2xhcmF0aW9uQXBwRWxlbWVudDogQXBwRWxlbWVudCxcbiAgICAgICAgICAgICAgY2RNb2RlOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgcHVibGljIHN0YXRpY05vZGVEZWJ1Z0luZm9zOiBTdGF0aWNOb2RlRGVidWdJbmZvW10pIHtcbiAgICBzdXBlcihjbGF6eiwgY29tcG9uZW50VHlwZSwgdHlwZSwgdmlld1V0aWxzLCBwYXJlbnRJbmplY3RvciwgZGVjbGFyYXRpb25BcHBFbGVtZW50LCBjZE1vZGUpO1xuICB9XG5cbiAgY3JlYXRlKGNvbnRleHQ6IFQsIGdpdmVuUHJvamVjdGFibGVOb2RlczogQXJyYXk8YW55IHwgYW55W10+LFxuICAgICAgICAgcm9vdFNlbGVjdG9yT3JOb2RlOiBzdHJpbmcgfCBhbnkpOiBBcHBFbGVtZW50IHtcbiAgICB0aGlzLl9yZXNldERlYnVnKCk7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBzdXBlci5jcmVhdGUoY29udGV4dCwgZ2l2ZW5Qcm9qZWN0YWJsZU5vZGVzLCByb290U2VsZWN0b3JPck5vZGUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX3JldGhyb3dXaXRoQ29udGV4dChlLCBlLnN0YWNrKTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgaW5qZWN0b3JHZXQodG9rZW46IGFueSwgbm9kZUluZGV4OiBudW1iZXIsIG5vdEZvdW5kUmVzdWx0OiBhbnkpOiBhbnkge1xuICAgIHRoaXMuX3Jlc2V0RGVidWcoKTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHN1cGVyLmluamVjdG9yR2V0KHRva2VuLCBub2RlSW5kZXgsIG5vdEZvdW5kUmVzdWx0KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl9yZXRocm93V2l0aENvbnRleHQoZSwgZS5zdGFjayk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3lMb2NhbCgpIHtcbiAgICB0aGlzLl9yZXNldERlYnVnKCk7XG4gICAgdHJ5IHtcbiAgICAgIHN1cGVyLmRlc3Ryb3lMb2NhbCgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX3JldGhyb3dXaXRoQ29udGV4dChlLCBlLnN0YWNrKTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgZGV0ZWN0Q2hhbmdlcyh0aHJvd09uQ2hhbmdlOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fcmVzZXREZWJ1ZygpO1xuICAgIHRyeSB7XG4gICAgICBzdXBlci5kZXRlY3RDaGFuZ2VzKHRocm93T25DaGFuZ2UpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX3JldGhyb3dXaXRoQ29udGV4dChlLCBlLnN0YWNrKTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcmVzZXREZWJ1ZygpIHsgdGhpcy5fY3VycmVudERlYnVnQ29udGV4dCA9IG51bGw7IH1cblxuICBkZWJ1Zyhub2RlSW5kZXg6IG51bWJlciwgcm93TnVtOiBudW1iZXIsIGNvbE51bTogbnVtYmVyKTogRGVidWdDb250ZXh0IHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudERlYnVnQ29udGV4dCA9IG5ldyBEZWJ1Z0NvbnRleHQodGhpcywgbm9kZUluZGV4LCByb3dOdW0sIGNvbE51bSk7XG4gIH1cblxuICBwcml2YXRlIF9yZXRocm93V2l0aENvbnRleHQoZTogYW55LCBzdGFjazogYW55KSB7XG4gICAgaWYgKCEoZSBpbnN0YW5jZW9mIFZpZXdXcmFwcGVkRXhjZXB0aW9uKSkge1xuICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEV4cHJlc3Npb25DaGFuZ2VkQWZ0ZXJJdEhhc0JlZW5DaGVja2VkRXhjZXB0aW9uKSkge1xuICAgICAgICB0aGlzLmNkU3RhdGUgPSBDaGFuZ2VEZXRlY3RvclN0YXRlLkVycm9yZWQ7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2N1cnJlbnREZWJ1Z0NvbnRleHQpKSB7XG4gICAgICAgIHRocm93IG5ldyBWaWV3V3JhcHBlZEV4Y2VwdGlvbihlLCBzdGFjaywgdGhpcy5fY3VycmVudERlYnVnQ29udGV4dCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZXZlbnRIYW5kbGVyKGNiOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICB2YXIgc3VwZXJIYW5kbGVyID0gc3VwZXIuZXZlbnRIYW5kbGVyKGNiKTtcbiAgICByZXR1cm4gKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLl9yZXNldERlYnVnKCk7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gc3VwZXJIYW5kbGVyKGV2ZW50KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5fcmV0aHJvd1dpdGhDb250ZXh0KGUsIGUuc3RhY2spO1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn1cblxuZnVuY3Rpb24gX2ZpbmRMYXN0UmVuZGVyTm9kZShub2RlOiBhbnkpOiBhbnkge1xuICB2YXIgbGFzdE5vZGU7XG4gIGlmIChub2RlIGluc3RhbmNlb2YgQXBwRWxlbWVudCkge1xuICAgIHZhciBhcHBFbCA9IDxBcHBFbGVtZW50Pm5vZGU7XG4gICAgbGFzdE5vZGUgPSBhcHBFbC5uYXRpdmVFbGVtZW50O1xuICAgIGlmIChpc1ByZXNlbnQoYXBwRWwubmVzdGVkVmlld3MpKSB7XG4gICAgICAvLyBOb3RlOiBWaWV3cyBtaWdodCBoYXZlIG5vIHJvb3Qgbm9kZXMgYXQgYWxsIVxuICAgICAgZm9yICh2YXIgaSA9IGFwcEVsLm5lc3RlZFZpZXdzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIHZhciBuZXN0ZWRWaWV3ID0gYXBwRWwubmVzdGVkVmlld3NbaV07XG4gICAgICAgIGlmIChuZXN0ZWRWaWV3LnJvb3ROb2Rlc09yQXBwRWxlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGxhc3ROb2RlID0gX2ZpbmRMYXN0UmVuZGVyTm9kZShcbiAgICAgICAgICAgICAgbmVzdGVkVmlldy5yb290Tm9kZXNPckFwcEVsZW1lbnRzW25lc3RlZFZpZXcucm9vdE5vZGVzT3JBcHBFbGVtZW50cy5sZW5ndGggLSAxXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbGFzdE5vZGUgPSBub2RlO1xuICB9XG4gIHJldHVybiBsYXN0Tm9kZTtcbn1cbiJdfQ==