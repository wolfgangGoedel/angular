import { ListWrapper } from 'angular2/src/facade/collection';
import { unimplemented } from 'angular2/src/facade/exceptions';
import { Injector_, ProtoInjector } from 'angular2/src/core/di/injector';
import { isPresent } from 'angular2/src/facade/lang';
import { wtfCreateScope, wtfLeave } from '../profile/profile';
/**
 * Represents a container where one or more Views can be attached.
 *
 * The container can contain two kinds of Views. Host Views, created by instantiating a
 * {@link Component} via {@link #createHostView}, and Embedded Views, created by instantiating an
 * {@link TemplateRef Embedded Template} via {@link #createEmbeddedView}.
 *
 * The location of the View Container within the containing View is specified by the Anchor
 * `element`. Each View Container can have only one Anchor Element and each Anchor Element can only
 * have a single View Container.
 *
 * Root elements of Views attached to this container become siblings of the Anchor Element in
 * the Rendered View.
 *
 * To access a `ViewContainerRef` of an Element, you can either place a {@link Directive} injected
 * with `ViewContainerRef` on the Element, or you obtain it via
 * {@link AppViewManager#getViewContainer}.
 *
 * <!-- TODO(i): we are also considering ElementRef#viewContainer api -->
 */
export class ViewContainerRef {
    /**
     * Anchor element that specifies the location of this container in the containing View.
     * <!-- TODO: rename to anchorElement -->
     */
    get element() { return unimplemented(); }
    /**
     * Returns the number of Views currently attached to this container.
     */
    get length() { return unimplemented(); }
    ;
}
export class ViewContainerRef_ {
    constructor(_element) {
        this._element = _element;
        /** @internal */
        this._createEmbeddedViewInContainerScope = wtfCreateScope('ViewContainerRef#createEmbeddedView()');
        /** @internal */
        this._createHostViewInContainerScope = wtfCreateScope('ViewContainerRef#createHostView()');
        /** @internal */
        this._insertScope = wtfCreateScope('ViewContainerRef#insert()');
        /** @internal */
        this._removeScope = wtfCreateScope('ViewContainerRef#remove()');
        /** @internal */
        this._detachScope = wtfCreateScope('ViewContainerRef#detach()');
    }
    get(index) { return this._element.nestedViews[index].ref; }
    get length() {
        var views = this._element.nestedViews;
        return isPresent(views) ? views.length : 0;
    }
    get element() { return this._element.ref; }
    // TODO(rado): profile and decide whether bounds checks should be added
    // to the methods below.
    createEmbeddedView(templateRef, index = -1) {
        var s = this._createEmbeddedViewInContainerScope();
        if (index == -1)
            index = this.length;
        var templateRef_ = templateRef;
        var view = templateRef_.createEmbeddedView();
        this._element.attachView(view, index);
        return wtfLeave(s, view.ref);
    }
    createHostView(hostViewFactoryRef, index = -1, dynamicallyCreatedProviders = null, projectableNodes = null) {
        var s = this._createHostViewInContainerScope();
        if (index == -1)
            index = this.length;
        var contextEl = this._element;
        var contextInjector = this._element.parentInjector;
        var hostViewFactory = hostViewFactoryRef.internalHostViewFactory;
        var childInjector = isPresent(dynamicallyCreatedProviders) && dynamicallyCreatedProviders.length > 0 ?
            new Injector_(ProtoInjector.fromResolvedProviders(dynamicallyCreatedProviders), contextInjector) :
            contextInjector;
        var view = hostViewFactory.viewFactory(contextEl.parentView.viewManager, childInjector, contextEl);
        view.create(projectableNodes, null);
        this._element.attachView(view, index);
        return wtfLeave(s, view.ref);
    }
    // TODO(i): refactor insert+remove into move
    insert(viewRef, index = -1) {
        var s = this._insertScope();
        if (index == -1)
            index = this.length;
        var viewRef_ = viewRef;
        this._element.attachView(viewRef_.internalView, index);
        return wtfLeave(s, viewRef_);
    }
    indexOf(viewRef) {
        return ListWrapper.indexOf(this._element.nestedViews, viewRef.internalView);
    }
    // TODO(i): rename to destroy
    remove(index = -1) {
        var s = this._removeScope();
        if (index == -1)
            index = this.length - 1;
        var view = this._element.detachView(index);
        view.destroy();
        // view is intentionally not returned to the client.
        wtfLeave(s);
    }
    // TODO(i): refactor insert+remove into move
    detach(index = -1) {
        var s = this._detachScope();
        if (index == -1)
            index = this.length - 1;
        var view = this._element.detachView(index);
        return wtfLeave(s, view.ref);
    }
    clear() {
        for (var i = this.length - 1; i >= 0; i--) {
            this.remove(i);
        }
    }
}
