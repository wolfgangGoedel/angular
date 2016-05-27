'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
exports.HOST_VIEW_ELEMENT_NAME = '$hostViewEl';
var EMPTY_CONTEXT = lang_1.CONST_EXPR(new Object());
var _scope_check = profile_1.wtfCreateScope("AppView#check(ascii id)");
/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
var AppView = (function () {
    function AppView(clazz, componentType, type, locals, viewManager, parentInjector, declarationAppElement, cdMode, literalArrayCacheSize, literalMapCacheSize) {
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
        this.cdState = change_detection_1.ChangeDetectorState.NeverChecked;
        /**
         * The context against which data-binding expressions in this view are evaluated against.
         * This is always a component instance.
         */
        this.context = null;
        this.destroyed = false;
        this.ref = new view_ref_1.ViewRef_(this);
        if (type === view_type_1.ViewType.COMPONENT || type === view_type_1.ViewType.HOST) {
            this.renderer = viewManager.renderComponent(componentType);
        }
        else {
            this.renderer = declarationAppElement.parentView.renderer;
        }
        this._literalArrayCache = collection_1.ListWrapper.createFixedSize(literalArrayCacheSize);
        this._literalMapCache = collection_1.ListWrapper.createFixedSize(literalMapCacheSize);
    }
    AppView.prototype.create = function (givenProjectableNodes, rootSelector) {
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
        this.context = context;
        this.projectableNodes = projectableNodes;
        this.createInternal(rootSelector);
    };
    /**
     * Overwritten by implementations
     */
    AppView.prototype.createInternal = function (rootSelector) { };
    AppView.prototype.init = function (rootNodesOrAppElements, allNodes, appElements, disposables, subscriptions) {
        this.rootNodesOrAppElements = rootNodesOrAppElements;
        this.allNodes = allNodes;
        this.namedAppElements = appElements;
        this.disposables = disposables;
        this.subscriptions = subscriptions;
        if (this.type === view_type_1.ViewType.COMPONENT) {
            // Note: the render nodes have been attached to their host element
            // in the ViewFactory already.
            this.declarationAppElement.parentView.viewChildren.push(this);
            this.dirtyParentQueriesInternal();
        }
    };
    AppView.prototype.getHostViewElement = function () { return this.namedAppElements[exports.HOST_VIEW_ELEMENT_NAME]; };
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
    };
    AppView.prototype.destroyLocal = function () {
        var hostElement = this.type === view_type_1.ViewType.COMPONENT ? this.declarationAppElement.nativeElement : null;
        this.renderer.destroyView(hostElement, this.allNodes);
        for (var i = 0; i < this.disposables.length; i++) {
            this.disposables[i]();
        }
        for (var i = 0; i < this.subscriptions.length; i++) {
            async_1.ObservableWrapper.dispose(this.subscriptions[i]);
        }
        this.destroyInternal();
        this.dirtyParentQueriesInternal();
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
    AppView.prototype.literalArray = function (id, value) {
        var prevValue = this._literalArrayCache[id];
        if (lang_1.isBlank(value)) {
            return value;
        }
        if (lang_1.isBlank(prevValue) || !view_utils_1.arrayLooseIdentical(prevValue, value)) {
            prevValue = this._literalArrayCache[id] = value;
        }
        return prevValue;
    };
    AppView.prototype.literalMap = function (id, value) {
        var prevValue = this._literalMapCache[id];
        if (lang_1.isBlank(value)) {
            return value;
        }
        if (lang_1.isBlank(prevValue) || !view_utils_1.mapLooseIdentical(prevValue, value)) {
            prevValue = this._literalMapCache[id] = value;
        }
        return prevValue;
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
    function DebugAppView(clazz, componentType, type, locals, viewManager, parentInjector, declarationAppElement, cdMode, literalArrayCacheSize, literalMapCacheSize, staticNodeDebugInfos) {
        _super.call(this, clazz, componentType, type, locals, viewManager, parentInjector, declarationAppElement, cdMode, literalArrayCacheSize, literalMapCacheSize);
        this.staticNodeDebugInfos = staticNodeDebugInfos;
        this._currentDebugContext = null;
    }
    DebugAppView.prototype.create = function (givenProjectableNodes, rootSelector) {
        this._resetDebug();
        try {
            _super.prototype.create.call(this, givenProjectableNodes, rootSelector);
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
var HostViewFactory = (function () {
    function HostViewFactory(selector, viewFactory) {
        this.selector = selector;
        this.viewFactory = viewFactory;
    }
    HostViewFactory = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [String, Function])
    ], HostViewFactory);
    return HostViewFactory;
}());
exports.HostViewFactory = HostViewFactory;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtdHVWVDN5Z2MudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJCQU9PLGdDQUFnQyxDQUFDLENBQUE7QUFHeEMsd0JBQXlCLFdBQVcsQ0FBQyxDQUFBO0FBQ3JDLHFCQVdPLDBCQUEwQixDQUFDLENBQUE7QUFFbEMsc0JBQWdDLDJCQUEyQixDQUFDLENBQUE7QUFFNUQseUJBQTJDLFlBQVksQ0FBQyxDQUFBO0FBR3hELDBCQUF1QixhQUFhLENBQUMsQ0FBQTtBQUNyQywyQkFLTyxjQUFjLENBQUMsQ0FBQTtBQUN0QixpQ0FNTyxxREFBcUQsQ0FBQyxDQUFBO0FBQzdELHdCQUFtRCxvQkFBb0IsQ0FBQyxDQUFBO0FBQ3hFLDJCQUlPLGNBQWMsQ0FBQyxDQUFBO0FBQ3RCLDhCQUFnRCxpQkFBaUIsQ0FBQyxDQUFBO0FBQ2xFLGlDQUE4QixvQkFBb0IsQ0FBQyxDQUFBO0FBRXRDLDhCQUFzQixHQUFHLGFBQWEsQ0FBQztBQUVwRCxJQUFNLGFBQWEsR0FBRyxpQkFBVSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztBQUUvQyxJQUFJLFlBQVksR0FBZSx3QkFBYyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFFekU7OztHQUdHO0FBQ0g7SUE4QkUsaUJBQW1CLEtBQVUsRUFBUyxhQUFrQyxFQUFTLElBQWMsRUFDNUUsTUFBNEIsRUFBUyxXQUE0QixFQUNqRSxjQUF3QixFQUFTLHFCQUFpQyxFQUNsRSxNQUErQixFQUFFLHFCQUE2QixFQUNyRSxtQkFBMkI7UUFKcEIsVUFBSyxHQUFMLEtBQUssQ0FBSztRQUFTLGtCQUFhLEdBQWIsYUFBYSxDQUFxQjtRQUFTLFNBQUksR0FBSixJQUFJLENBQVU7UUFDNUUsV0FBTSxHQUFOLE1BQU0sQ0FB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QUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZGLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLFFBQVEsR0FBRyxJQUFJLENBQUM7SUFDbEIsQ0FBQztJQUNELE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDbEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIExpc3RXcmFwcGVyLFxuICBNYXBXcmFwcGVyLFxuICBNYXAsXG4gIFN0cmluZ01hcFdyYXBwZXIsXG4gIGlzTGlzdExpa2VJdGVyYWJsZSxcbiAgYXJlSXRlcmFibGVzRXF1YWxcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtBcHBFbGVtZW50fSBmcm9tICcuL2VsZW1lbnQnO1xuaW1wb3J0IHtcbiAgYXNzZXJ0aW9uc0VuYWJsZWQsXG4gIGlzUHJlc2VudCxcbiAgaXNCbGFuayxcbiAgVHlwZSxcbiAgaXNBcnJheSxcbiAgaXNOdW1iZXIsXG4gIENPTlNULFxuICBDT05TVF9FWFBSLFxuICBzdHJpbmdpZnksXG4gIGlzUHJpbWl0aXZlXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmltcG9ydCB7T2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtSZW5kZXJlciwgUm9vdFJlbmRlcmVyLCBSZW5kZXJDb21wb25lbnRUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZW5kZXIvYXBpJztcbmltcG9ydCB7Vmlld1JlZl8sIEhvc3RWaWV3RmFjdG9yeVJlZn0gZnJvbSAnLi92aWV3X3JlZic7XG5cbmltcG9ydCB7QXBwVmlld01hbmFnZXJfLCBBcHBWaWV3TWFuYWdlcn0gZnJvbSAnLi92aWV3X21hbmFnZXInO1xuaW1wb3J0IHtWaWV3VHlwZX0gZnJvbSAnLi92aWV3X3R5cGUnO1xuaW1wb3J0IHtcbiAgZmxhdHRlbk5lc3RlZFZpZXdSZW5kZXJOb2RlcyxcbiAgZW5zdXJlU2xvdENvdW50LFxuICBhcnJheUxvb3NlSWRlbnRpY2FsLFxuICBtYXBMb29zZUlkZW50aWNhbFxufSBmcm9tICcuL3ZpZXdfdXRpbHMnO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclN0YXRlLFxuICBpc0RlZmF1bHRDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgZGV2TW9kZUVxdWFsXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbic7XG5pbXBvcnQge3d0ZkNyZWF0ZVNjb3BlLCB3dGZMZWF2ZSwgV3RmU2NvcGVGbn0gZnJvbSAnLi4vcHJvZmlsZS9wcm9maWxlJztcbmltcG9ydCB7XG4gIEV4cHJlc3Npb25DaGFuZ2VkQWZ0ZXJJdEhhc0JlZW5DaGVja2VkRXhjZXB0aW9uLFxuICBWaWV3RGVzdHJveWVkRXhjZXB0aW9uLFxuICBWaWV3V3JhcHBlZEV4Y2VwdGlvblxufSBmcm9tICcuL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtTdGF0aWNOb2RlRGVidWdJbmZvLCBEZWJ1Z0NvbnRleHR9IGZyb20gJy4vZGVidWdfY29udGV4dCc7XG5pbXBvcnQge0VsZW1lbnRJbmplY3Rvcn0gZnJvbSAnLi9lbGVtZW50X2luamVjdG9yJztcblxuZXhwb3J0IGNvbnN0IEhPU1RfVklFV19FTEVNRU5UX05BTUUgPSAnJGhvc3RWaWV3RWwnO1xuXG5jb25zdCBFTVBUWV9DT05URVhUID0gQ09OU1RfRVhQUihuZXcgT2JqZWN0KCkpO1xuXG52YXIgX3Njb3BlX2NoZWNrOiBXdGZTY29wZUZuID0gd3RmQ3JlYXRlU2NvcGUoYEFwcFZpZXcjY2hlY2soYXNjaWkgaWQpYCk7XG5cbi8qKlxuICogQ29zdCBvZiBtYWtpbmcgb2JqZWN0czogaHR0cDovL2pzcGVyZi5jb20vaW5zdGFudGlhdGUtc2l6ZS1vZi1vYmplY3RcbiAqXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBcHBWaWV3PFQ+IHtcbiAgcmVmOiBWaWV3UmVmXztcbiAgcm9vdE5vZGVzT3JBcHBFbGVtZW50czogYW55W107XG4gIGFsbE5vZGVzOiBhbnlbXTtcbiAgZGlzcG9zYWJsZXM6IEZ1bmN0aW9uW107XG4gIHN1YnNjcmlwdGlvbnM6IGFueVtdO1xuICBuYW1lZEFwcEVsZW1lbnRzOiB7W2tleTogc3RyaW5nXTogQXBwRWxlbWVudH07XG4gIGNvbnRlbnRDaGlsZHJlbjogQXBwVmlldzxhbnk+W10gPSBbXTtcbiAgdmlld0NoaWxkcmVuOiBBcHBWaWV3PGFueT5bXSA9IFtdO1xuXG4gIHByaXZhdGUgX2xpdGVyYWxBcnJheUNhY2hlOiBhbnlbXVtdO1xuICBwcml2YXRlIF9saXRlcmFsTWFwQ2FjaGU6IEFycmF5PHtba2V5OiBzdHJpbmddOiBhbnl9PjtcbiAgdmlld0NvbnRhaW5lckVsZW1lbnQ6IEFwcEVsZW1lbnQgPSBudWxsO1xuXG4gIC8vIFRoZSBuYW1lcyBvZiB0aGUgYmVsb3cgZmllbGRzIG11c3QgYmUga2VwdCBpbiBzeW5jIHdpdGggY29kZWdlbl9uYW1lX3V0aWwudHMgb3JcbiAgLy8gY2hhbmdlIGRldGVjdGlvbiB3aWxsIGZhaWwuXG4gIGNkU3RhdGU6IENoYW5nZURldGVjdG9yU3RhdGUgPSBDaGFuZ2VEZXRlY3RvclN0YXRlLk5ldmVyQ2hlY2tlZDtcblxuICAvKipcbiAgICogVGhlIGNvbnRleHQgYWdhaW5zdCB3aGljaCBkYXRhLWJpbmRpbmcgZXhwcmVzc2lvbnMgaW4gdGhpcyB2aWV3IGFyZSBldmFsdWF0ZWQgYWdhaW5zdC5cbiAgICogVGhpcyBpcyBhbHdheXMgYSBjb21wb25lbnQgaW5zdGFuY2UuXG4gICAqL1xuICBjb250ZXh0OiBUID0gbnVsbDtcblxuICBwcm9qZWN0YWJsZU5vZGVzOiBBcnJheTxhbnkgfCBhbnlbXT47XG5cbiAgZGVzdHJveWVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgcmVuZGVyZXI6IFJlbmRlcmVyO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjbGF6ejogYW55LCBwdWJsaWMgY29tcG9uZW50VHlwZTogUmVuZGVyQ29tcG9uZW50VHlwZSwgcHVibGljIHR5cGU6IFZpZXdUeXBlLFxuICAgICAgICAgICAgICBwdWJsaWMgbG9jYWxzOiB7W2tleTogc3RyaW5nXTogYW55fSwgcHVibGljIHZpZXdNYW5hZ2VyOiBBcHBWaWV3TWFuYWdlcl8sXG4gICAgICAgICAgICAgIHB1YmxpYyBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IsIHB1YmxpYyBkZWNsYXJhdGlvbkFwcEVsZW1lbnQ6IEFwcEVsZW1lbnQsXG4gICAgICAgICAgICAgIHB1YmxpYyBjZE1vZGU6IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBsaXRlcmFsQXJyYXlDYWNoZVNpemU6IG51bWJlcixcbiAgICAgICAgICAgICAgbGl0ZXJhbE1hcENhY2hlU2l6ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5yZWYgPSBuZXcgVmlld1JlZl8odGhpcyk7XG4gICAgaWYgKHR5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCB8fCB0eXBlID09PSBWaWV3VHlwZS5IT1NUKSB7XG4gICAgICB0aGlzLnJlbmRlcmVyID0gdmlld01hbmFnZXIucmVuZGVyQ29tcG9uZW50KGNvbXBvbmVudFR5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlbmRlcmVyID0gZGVjbGFyYXRpb25BcHBFbGVtZW50LnBhcmVudFZpZXcucmVuZGVyZXI7XG4gICAgfVxuICAgIHRoaXMuX2xpdGVyYWxBcnJheUNhY2hlID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKGxpdGVyYWxBcnJheUNhY2hlU2l6ZSk7XG4gICAgdGhpcy5fbGl0ZXJhbE1hcENhY2hlID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKGxpdGVyYWxNYXBDYWNoZVNpemUpO1xuICB9XG5cbiAgY3JlYXRlKGdpdmVuUHJvamVjdGFibGVOb2RlczogQXJyYXk8YW55IHwgYW55W10+LCByb290U2VsZWN0b3I6IHN0cmluZyk6IHZvaWQge1xuICAgIHZhciBjb250ZXh0O1xuICAgIHZhciBwcm9qZWN0YWJsZU5vZGVzO1xuICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICBjYXNlIFZpZXdUeXBlLkNPTVBPTkVOVDpcbiAgICAgICAgY29udGV4dCA9IHRoaXMuZGVjbGFyYXRpb25BcHBFbGVtZW50LmNvbXBvbmVudDtcbiAgICAgICAgcHJvamVjdGFibGVOb2RlcyA9IGVuc3VyZVNsb3RDb3VudChnaXZlblByb2plY3RhYmxlTm9kZXMsIHRoaXMuY29tcG9uZW50VHlwZS5zbG90Q291bnQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVmlld1R5cGUuRU1CRURERUQ6XG4gICAgICAgIGNvbnRleHQgPSB0aGlzLmRlY2xhcmF0aW9uQXBwRWxlbWVudC5wYXJlbnRWaWV3LmNvbnRleHQ7XG4gICAgICAgIHByb2plY3RhYmxlTm9kZXMgPSB0aGlzLmRlY2xhcmF0aW9uQXBwRWxlbWVudC5wYXJlbnRWaWV3LnByb2plY3RhYmxlTm9kZXM7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBWaWV3VHlwZS5IT1NUOlxuICAgICAgICBjb250ZXh0ID0gRU1QVFlfQ09OVEVYVDtcbiAgICAgICAgLy8gTm90ZTogRG9uJ3QgZW5zdXJlIHRoZSBzbG90IGNvdW50IGZvciB0aGUgcHJvamVjdGFibGVOb2RlcyBhcyB3ZSBzdG9yZVxuICAgICAgICAvLyB0aGVtIG9ubHkgZm9yIHRoZSBjb250YWluZWQgY29tcG9uZW50IHZpZXcgKHdoaWNoIHdpbGwgbGF0ZXIgY2hlY2sgdGhlIHNsb3QgY291bnQuLi4pXG4gICAgICAgIHByb2plY3RhYmxlTm9kZXMgPSBnaXZlblByb2plY3RhYmxlTm9kZXM7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICAgIHRoaXMucHJvamVjdGFibGVOb2RlcyA9IHByb2plY3RhYmxlTm9kZXM7XG4gICAgdGhpcy5jcmVhdGVJbnRlcm5hbChyb290U2VsZWN0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJ3cml0dGVuIGJ5IGltcGxlbWVudGF0aW9uc1xuICAgKi9cbiAgY3JlYXRlSW50ZXJuYWwocm9vdFNlbGVjdG9yOiBzdHJpbmcpOiB2b2lkIHt9XG5cbiAgaW5pdChyb290Tm9kZXNPckFwcEVsZW1lbnRzOiBhbnlbXSwgYWxsTm9kZXM6IGFueVtdLCBhcHBFbGVtZW50czoge1trZXk6IHN0cmluZ106IEFwcEVsZW1lbnR9LFxuICAgICAgIGRpc3Bvc2FibGVzOiBGdW5jdGlvbltdLCBzdWJzY3JpcHRpb25zOiBhbnlbXSkge1xuICAgIHRoaXMucm9vdE5vZGVzT3JBcHBFbGVtZW50cyA9IHJvb3ROb2Rlc09yQXBwRWxlbWVudHM7XG4gICAgdGhpcy5hbGxOb2RlcyA9IGFsbE5vZGVzO1xuICAgIHRoaXMubmFtZWRBcHBFbGVtZW50cyA9IGFwcEVsZW1lbnRzO1xuICAgIHRoaXMuZGlzcG9zYWJsZXMgPSBkaXNwb3NhYmxlcztcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBzdWJzY3JpcHRpb25zO1xuICAgIGlmICh0aGlzLnR5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCkge1xuICAgICAgLy8gTm90ZTogdGhlIHJlbmRlciBub2RlcyBoYXZlIGJlZW4gYXR0YWNoZWQgdG8gdGhlaXIgaG9zdCBlbGVtZW50XG4gICAgICAvLyBpbiB0aGUgVmlld0ZhY3RvcnkgYWxyZWFkeS5cbiAgICAgIHRoaXMuZGVjbGFyYXRpb25BcHBFbGVtZW50LnBhcmVudFZpZXcudmlld0NoaWxkcmVuLnB1c2godGhpcyk7XG4gICAgICB0aGlzLmRpcnR5UGFyZW50UXVlcmllc0ludGVybmFsKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0SG9zdFZpZXdFbGVtZW50KCk6IEFwcEVsZW1lbnQgeyByZXR1cm4gdGhpcy5uYW1lZEFwcEVsZW1lbnRzW0hPU1RfVklFV19FTEVNRU5UX05BTUVdOyB9XG5cbiAgaW5qZWN0b3JHZXQodG9rZW46IGFueSwgbm9kZUluZGV4OiBudW1iZXIsIG5vdEZvdW5kUmVzdWx0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmluamVjdG9yR2V0SW50ZXJuYWwodG9rZW4sIG5vZGVJbmRleCwgbm90Rm91bmRSZXN1bHQpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJ3cml0dGVuIGJ5IGltcGxlbWVudGF0aW9uc1xuICAgKi9cbiAgaW5qZWN0b3JHZXRJbnRlcm5hbCh0b2tlbjogYW55LCBub2RlSW5kZXg6IG51bWJlciwgbm90Rm91bmRSZXN1bHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIG5vdEZvdW5kUmVzdWx0O1xuICB9XG5cbiAgaW5qZWN0b3Iobm9kZUluZGV4OiBudW1iZXIpOiBJbmplY3RvciB7XG4gICAgaWYgKGlzUHJlc2VudChub2RlSW5kZXgpKSB7XG4gICAgICByZXR1cm4gbmV3IEVsZW1lbnRJbmplY3Rvcih0aGlzLCBub2RlSW5kZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJlbnRJbmplY3RvcjtcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLmRlc3Ryb3llZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLmNvbnRlbnRDaGlsZHJlbjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjaGlsZHJlbltpXS5kZXN0cm95KCk7XG4gICAgfVxuICAgIGNoaWxkcmVuID0gdGhpcy52aWV3Q2hpbGRyZW47XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY2hpbGRyZW5baV0uZGVzdHJveSgpO1xuICAgIH1cbiAgICB0aGlzLmRlc3Ryb3lMb2NhbCgpO1xuXG4gICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xuICB9XG5cbiAgZGVzdHJveUxvY2FsKCkge1xuICAgIHZhciBob3N0RWxlbWVudCA9XG4gICAgICAgIHRoaXMudHlwZSA9PT0gVmlld1R5cGUuQ09NUE9ORU5UID8gdGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQubmF0aXZlRWxlbWVudCA6IG51bGw7XG4gICAgdGhpcy5yZW5kZXJlci5kZXN0cm95Vmlldyhob3N0RWxlbWVudCwgdGhpcy5hbGxOb2Rlcyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRpc3Bvc2FibGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLmRpc3Bvc2FibGVzW2ldKCk7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdWJzY3JpcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBPYnNlcnZhYmxlV3JhcHBlci5kaXNwb3NlKHRoaXMuc3Vic2NyaXB0aW9uc1tpXSk7XG4gICAgfVxuICAgIHRoaXMuZGVzdHJveUludGVybmFsKCk7XG5cbiAgICB0aGlzLmRpcnR5UGFyZW50UXVlcmllc0ludGVybmFsKCk7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcndyaXR0ZW4gYnkgaW1wbGVtZW50YXRpb25zXG4gICAqL1xuICBkZXN0cm95SW50ZXJuYWwoKTogdm9pZCB7fVxuXG4gIGdldCBjaGFuZ2VEZXRlY3RvclJlZigpOiBDaGFuZ2VEZXRlY3RvclJlZiB7IHJldHVybiB0aGlzLnJlZjsgfVxuXG4gIGdldCBmbGF0Um9vdE5vZGVzKCk6IGFueVtdIHsgcmV0dXJuIGZsYXR0ZW5OZXN0ZWRWaWV3UmVuZGVyTm9kZXModGhpcy5yb290Tm9kZXNPckFwcEVsZW1lbnRzKTsgfVxuXG4gIGdldCBsYXN0Um9vdE5vZGUoKTogYW55IHtcbiAgICB2YXIgbGFzdE5vZGUgPSB0aGlzLnJvb3ROb2Rlc09yQXBwRWxlbWVudHMubGVuZ3RoID4gMCA/XG4gICAgICAgICAgICAgICAgICAgICAgIHRoaXMucm9vdE5vZGVzT3JBcHBFbGVtZW50c1t0aGlzLnJvb3ROb2Rlc09yQXBwRWxlbWVudHMubGVuZ3RoIC0gMV0gOlxuICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xuICAgIHJldHVybiBfZmluZExhc3RSZW5kZXJOb2RlKGxhc3ROb2RlKTtcbiAgfVxuXG4gIGhhc0xvY2FsKGNvbnRleHROYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gU3RyaW5nTWFwV3JhcHBlci5jb250YWlucyh0aGlzLmxvY2FscywgY29udGV4dE5hbWUpO1xuICB9XG5cbiAgc2V0TG9jYWwoY29udGV4dE5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQgeyB0aGlzLmxvY2Fsc1tjb250ZXh0TmFtZV0gPSB2YWx1ZTsgfVxuXG4gIC8qKlxuICAgKiBPdmVyd3JpdHRlbiBieSBpbXBsZW1lbnRhdGlvbnNcbiAgICovXG4gIGRpcnR5UGFyZW50UXVlcmllc0ludGVybmFsKCk6IHZvaWQge31cblxuICBkZXRlY3RDaGFuZ2VzKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB2YXIgcyA9IF9zY29wZV9jaGVjayh0aGlzLmNsYXp6KTtcbiAgICBpZiAodGhpcy5jZE1vZGUgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRldGFjaGVkIHx8XG4gICAgICAgIHRoaXMuY2RNb2RlID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja2VkIHx8XG4gICAgICAgIHRoaXMuY2RTdGF0ZSA9PT0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5FcnJvcmVkKVxuICAgICAgcmV0dXJuO1xuICAgIGlmICh0aGlzLmRlc3Ryb3llZCkge1xuICAgICAgdGhpcy50aHJvd0Rlc3Ryb3llZEVycm9yKCdkZXRlY3RDaGFuZ2VzJyk7XG4gICAgfVxuICAgIHRoaXMuZGV0ZWN0Q2hhbmdlc0ludGVybmFsKHRocm93T25DaGFuZ2UpO1xuICAgIGlmICh0aGlzLmNkTW9kZSA9PT0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tPbmNlKVxuICAgICAgdGhpcy5jZE1vZGUgPSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja2VkO1xuXG4gICAgdGhpcy5jZFN0YXRlID0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5DaGVja2VkQmVmb3JlO1xuICAgIHd0ZkxlYXZlKHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJ3cml0dGVuIGJ5IGltcGxlbWVudGF0aW9uc1xuICAgKi9cbiAgZGV0ZWN0Q2hhbmdlc0ludGVybmFsKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmRldGVjdENvbnRlbnRDaGlsZHJlbkNoYW5nZXModGhyb3dPbkNoYW5nZSk7XG4gICAgdGhpcy5kZXRlY3RWaWV3Q2hpbGRyZW5DaGFuZ2VzKHRocm93T25DaGFuZ2UpO1xuICB9XG5cbiAgZGV0ZWN0Q29udGVudENoaWxkcmVuQ2hhbmdlcyh0aHJvd09uQ2hhbmdlOiBib29sZWFuKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRlbnRDaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgdGhpcy5jb250ZW50Q2hpbGRyZW5baV0uZGV0ZWN0Q2hhbmdlcyh0aHJvd09uQ2hhbmdlKTtcbiAgICB9XG4gIH1cblxuICBkZXRlY3RWaWV3Q2hpbGRyZW5DaGFuZ2VzKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudmlld0NoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICB0aGlzLnZpZXdDaGlsZHJlbltpXS5kZXRlY3RDaGFuZ2VzKHRocm93T25DaGFuZ2UpO1xuICAgIH1cbiAgfVxuXG4gIGFkZFRvQ29udGVudENoaWxkcmVuKHJlbmRlckFwcEVsZW1lbnQ6IEFwcEVsZW1lbnQpOiB2b2lkIHtcbiAgICByZW5kZXJBcHBFbGVtZW50LnBhcmVudFZpZXcuY29udGVudENoaWxkcmVuLnB1c2godGhpcyk7XG4gICAgdGhpcy52aWV3Q29udGFpbmVyRWxlbWVudCA9IHJlbmRlckFwcEVsZW1lbnQ7XG4gICAgdGhpcy5kaXJ0eVBhcmVudFF1ZXJpZXNJbnRlcm5hbCgpO1xuICB9XG5cbiAgcmVtb3ZlRnJvbUNvbnRlbnRDaGlsZHJlbihyZW5kZXJBcHBFbGVtZW50OiBBcHBFbGVtZW50KTogdm9pZCB7XG4gICAgTGlzdFdyYXBwZXIucmVtb3ZlKHJlbmRlckFwcEVsZW1lbnQucGFyZW50Vmlldy5jb250ZW50Q2hpbGRyZW4sIHRoaXMpO1xuICAgIHRoaXMuZGlydHlQYXJlbnRRdWVyaWVzSW50ZXJuYWwoKTtcbiAgICB0aGlzLnZpZXdDb250YWluZXJFbGVtZW50ID0gbnVsbDtcbiAgfVxuXG4gIGxpdGVyYWxBcnJheShpZDogbnVtYmVyLCB2YWx1ZTogYW55W10pOiBhbnlbXSB7XG4gICAgdmFyIHByZXZWYWx1ZSA9IHRoaXMuX2xpdGVyYWxBcnJheUNhY2hlW2lkXTtcbiAgICBpZiAoaXNCbGFuayh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgaWYgKGlzQmxhbmsocHJldlZhbHVlKSB8fCAhYXJyYXlMb29zZUlkZW50aWNhbChwcmV2VmFsdWUsIHZhbHVlKSkge1xuICAgICAgcHJldlZhbHVlID0gdGhpcy5fbGl0ZXJhbEFycmF5Q2FjaGVbaWRdID0gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiBwcmV2VmFsdWU7XG4gIH1cblxuICBsaXRlcmFsTWFwKGlkOiBudW1iZXIsIHZhbHVlOiB7W2tleTogc3RyaW5nXTogYW55fSk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICB2YXIgcHJldlZhbHVlID0gdGhpcy5fbGl0ZXJhbE1hcENhY2hlW2lkXTtcbiAgICBpZiAoaXNCbGFuayh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgaWYgKGlzQmxhbmsocHJldlZhbHVlKSB8fCAhbWFwTG9vc2VJZGVudGljYWwocHJldlZhbHVlLCB2YWx1ZSkpIHtcbiAgICAgIHByZXZWYWx1ZSA9IHRoaXMuX2xpdGVyYWxNYXBDYWNoZVtpZF0gPSB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHByZXZWYWx1ZTtcbiAgfVxuXG4gIG1hcmtBc0NoZWNrT25jZSgpOiB2b2lkIHsgdGhpcy5jZE1vZGUgPSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja09uY2U7IH1cblxuICBtYXJrUGF0aFRvUm9vdEFzQ2hlY2tPbmNlKCk6IHZvaWQge1xuICAgIGxldCBjOiBBcHBWaWV3PGFueT4gPSB0aGlzO1xuICAgIHdoaWxlIChpc1ByZXNlbnQoYykgJiYgYy5jZE1vZGUgIT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRldGFjaGVkKSB7XG4gICAgICBpZiAoYy5jZE1vZGUgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrZWQpIHtcbiAgICAgICAgYy5jZE1vZGUgPSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja09uY2U7XG4gICAgICB9XG4gICAgICBsZXQgcGFyZW50RWwgPVxuICAgICAgICAgIGMudHlwZSA9PT0gVmlld1R5cGUuQ09NUE9ORU5UID8gYy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQgOiBjLnZpZXdDb250YWluZXJFbGVtZW50O1xuICAgICAgYyA9IGlzUHJlc2VudChwYXJlbnRFbCkgPyBwYXJlbnRFbC5wYXJlbnRWaWV3IDogbnVsbDtcbiAgICB9XG4gIH1cblxuICBldmVudEhhbmRsZXIoY2I6IEZ1bmN0aW9uKTogRnVuY3Rpb24geyByZXR1cm4gY2I7IH1cblxuICB0aHJvd0Rlc3Ryb3llZEVycm9yKGRldGFpbHM6IHN0cmluZyk6IHZvaWQgeyB0aHJvdyBuZXcgVmlld0Rlc3Ryb3llZEV4Y2VwdGlvbihkZXRhaWxzKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVidWdBcHBWaWV3PFQ+IGV4dGVuZHMgQXBwVmlldzxUPiB7XG4gIHByaXZhdGUgX2N1cnJlbnREZWJ1Z0NvbnRleHQ6IERlYnVnQ29udGV4dCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoY2xheno6IGFueSwgY29tcG9uZW50VHlwZTogUmVuZGVyQ29tcG9uZW50VHlwZSwgdHlwZTogVmlld1R5cGUsXG4gICAgICAgICAgICAgIGxvY2Fsczoge1trZXk6IHN0cmluZ106IGFueX0sIHZpZXdNYW5hZ2VyOiBBcHBWaWV3TWFuYWdlcl8sIHBhcmVudEluamVjdG9yOiBJbmplY3RvcixcbiAgICAgICAgICAgICAgZGVjbGFyYXRpb25BcHBFbGVtZW50OiBBcHBFbGVtZW50LCBjZE1vZGU6IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICAgICAgICAgICAgICBsaXRlcmFsQXJyYXlDYWNoZVNpemU6IG51bWJlciwgbGl0ZXJhbE1hcENhY2hlU2l6ZTogbnVtYmVyLFxuICAgICAgICAgICAgICBwdWJsaWMgc3RhdGljTm9kZURlYnVnSW5mb3M6IFN0YXRpY05vZGVEZWJ1Z0luZm9bXSkge1xuICAgIHN1cGVyKGNsYXp6LCBjb21wb25lbnRUeXBlLCB0eXBlLCBsb2NhbHMsIHZpZXdNYW5hZ2VyLCBwYXJlbnRJbmplY3RvciwgZGVjbGFyYXRpb25BcHBFbGVtZW50LFxuICAgICAgICAgIGNkTW9kZSwgbGl0ZXJhbEFycmF5Q2FjaGVTaXplLCBsaXRlcmFsTWFwQ2FjaGVTaXplKTtcbiAgfVxuXG4gIGNyZWF0ZShnaXZlblByb2plY3RhYmxlTm9kZXM6IEFycmF5PGFueSB8IGFueVtdPiwgcm9vdFNlbGVjdG9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9yZXNldERlYnVnKCk7XG4gICAgdHJ5IHtcbiAgICAgIHN1cGVyLmNyZWF0ZShnaXZlblByb2plY3RhYmxlTm9kZXMsIHJvb3RTZWxlY3Rvcik7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fcmV0aHJvd1dpdGhDb250ZXh0KGUsIGUuc3RhY2spO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICBpbmplY3RvckdldCh0b2tlbjogYW55LCBub2RlSW5kZXg6IG51bWJlciwgbm90Rm91bmRSZXN1bHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy5fcmVzZXREZWJ1ZygpO1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gc3VwZXIuaW5qZWN0b3JHZXQodG9rZW4sIG5vZGVJbmRleCwgbm90Rm91bmRSZXN1bHQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX3JldGhyb3dXaXRoQ29udGV4dChlLCBlLnN0YWNrKTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveUxvY2FsKCkge1xuICAgIHRoaXMuX3Jlc2V0RGVidWcoKTtcbiAgICB0cnkge1xuICAgICAgc3VwZXIuZGVzdHJveUxvY2FsKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fcmV0aHJvd1dpdGhDb250ZXh0KGUsIGUuc3RhY2spO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICBkZXRlY3RDaGFuZ2VzKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9yZXNldERlYnVnKCk7XG4gICAgdHJ5IHtcbiAgICAgIHN1cGVyLmRldGVjdENoYW5nZXModGhyb3dPbkNoYW5nZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fcmV0aHJvd1dpdGhDb250ZXh0KGUsIGUuc3RhY2spO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9yZXNldERlYnVnKCkgeyB0aGlzLl9jdXJyZW50RGVidWdDb250ZXh0ID0gbnVsbDsgfVxuXG4gIGRlYnVnKG5vZGVJbmRleDogbnVtYmVyLCByb3dOdW06IG51bWJlciwgY29sTnVtOiBudW1iZXIpOiBEZWJ1Z0NvbnRleHQge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50RGVidWdDb250ZXh0ID0gbmV3IERlYnVnQ29udGV4dCh0aGlzLCBub2RlSW5kZXgsIHJvd051bSwgY29sTnVtKTtcbiAgfVxuXG4gIHByaXZhdGUgX3JldGhyb3dXaXRoQ29udGV4dChlOiBhbnksIHN0YWNrOiBhbnkpIHtcbiAgICBpZiAoIShlIGluc3RhbmNlb2YgVmlld1dyYXBwZWRFeGNlcHRpb24pKSB7XG4gICAgICBpZiAoIShlIGluc3RhbmNlb2YgRXhwcmVzc2lvbkNoYW5nZWRBZnRlckl0SGFzQmVlbkNoZWNrZWRFeGNlcHRpb24pKSB7XG4gICAgICAgIHRoaXMuY2RTdGF0ZSA9IENoYW5nZURldGVjdG9yU3RhdGUuRXJyb3JlZDtcbiAgICAgIH1cbiAgICAgIGlmIChpc1ByZXNlbnQodGhpcy5fY3VycmVudERlYnVnQ29udGV4dCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFZpZXdXcmFwcGVkRXhjZXB0aW9uKGUsIHN0YWNrLCB0aGlzLl9jdXJyZW50RGVidWdDb250ZXh0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBldmVudEhhbmRsZXIoY2I6IEZ1bmN0aW9uKTogRnVuY3Rpb24ge1xuICAgIHZhciBzdXBlckhhbmRsZXIgPSBzdXBlci5ldmVudEhhbmRsZXIoY2IpO1xuICAgIHJldHVybiAoZXZlbnQpID0+IHtcbiAgICAgIHRoaXMuX3Jlc2V0RGVidWcoKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBzdXBlckhhbmRsZXIoZXZlbnQpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLl9yZXRocm93V2l0aENvbnRleHQoZSwgZS5zdGFjayk7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufVxuXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEhvc3RWaWV3RmFjdG9yeSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzZWxlY3Rvcjogc3RyaW5nLCBwdWJsaWMgdmlld0ZhY3Rvcnk6IEZ1bmN0aW9uKSB7fVxufVxuXG5mdW5jdGlvbiBfZmluZExhc3RSZW5kZXJOb2RlKG5vZGU6IGFueSk6IGFueSB7XG4gIHZhciBsYXN0Tm9kZTtcbiAgaWYgKG5vZGUgaW5zdGFuY2VvZiBBcHBFbGVtZW50KSB7XG4gICAgdmFyIGFwcEVsID0gPEFwcEVsZW1lbnQ+bm9kZTtcbiAgICBsYXN0Tm9kZSA9IGFwcEVsLm5hdGl2ZUVsZW1lbnQ7XG4gICAgaWYgKGlzUHJlc2VudChhcHBFbC5uZXN0ZWRWaWV3cykpIHtcbiAgICAgIC8vIE5vdGU6IFZpZXdzIG1pZ2h0IGhhdmUgbm8gcm9vdCBub2RlcyBhdCBhbGwhXG4gICAgICBmb3IgKHZhciBpID0gYXBwRWwubmVzdGVkVmlld3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgdmFyIG5lc3RlZFZpZXcgPSBhcHBFbC5uZXN0ZWRWaWV3c1tpXTtcbiAgICAgICAgaWYgKG5lc3RlZFZpZXcucm9vdE5vZGVzT3JBcHBFbGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgbGFzdE5vZGUgPSBfZmluZExhc3RSZW5kZXJOb2RlKFxuICAgICAgICAgICAgICBuZXN0ZWRWaWV3LnJvb3ROb2Rlc09yQXBwRWxlbWVudHNbbmVzdGVkVmlldy5yb290Tm9kZXNPckFwcEVsZW1lbnRzLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsYXN0Tm9kZSA9IG5vZGU7XG4gIH1cbiAgcmV0dXJuIGxhc3ROb2RlO1xufVxuIl19