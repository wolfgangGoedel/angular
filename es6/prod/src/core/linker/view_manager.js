var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Inject, Injectable } from 'angular2/src/core/di';
import { isPresent, isBlank } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { RootRenderer, RenderComponentType } from 'angular2/src/core/render/api';
import { wtfCreateScope, wtfLeave } from '../profile/profile';
import { APP_ID } from 'angular2/src/core/application_tokens';
import { ViewType } from './view_type';
/**
 * Service exposing low level API for creating, moving and destroying Views.
 *
 * Most applications should use higher-level abstractions like {@link DynamicComponentLoader} and
 * {@link ViewContainerRef} instead.
 */
export class AppViewManager {
}
export let AppViewManager_ = class AppViewManager_ extends AppViewManager {
    constructor(_renderer, _appId) {
        super();
        this._renderer = _renderer;
        this._appId = _appId;
        this._nextCompTypeId = 0;
        /** @internal */
        this._createRootHostViewScope = wtfCreateScope('AppViewManager#createRootHostView()');
        /** @internal */
        this._destroyRootHostViewScope = wtfCreateScope('AppViewManager#destroyRootHostView()');
    }
    getViewContainer(location) {
        return location.internalElement.vcRef;
    }
    getHostElement(hostViewRef) {
        var hostView = hostViewRef.internalView;
        if (hostView.type !== ViewType.HOST) {
            throw new BaseException('This operation is only allowed on host views');
        }
        return hostView.getHostViewElement().ref;
    }
    getNamedElementInComponentView(hostLocation, variableName) {
        var appEl = hostLocation.internalElement;
        var componentView = appEl.componentView;
        if (isBlank(componentView)) {
            throw new BaseException(`There is no component directive at element ${hostLocation}`);
        }
        var el = componentView.namedAppElements[variableName];
        if (isPresent(el)) {
            return el.ref;
        }
        throw new BaseException(`Could not find variable ${variableName}`);
    }
    getComponent(hostLocation) {
        return hostLocation.internalElement.component;
    }
    createRootHostView(hostViewFactoryRef, overrideSelector, injector, projectableNodes = null) {
        var s = this._createRootHostViewScope();
        var hostViewFactory = hostViewFactoryRef.internalHostViewFactory;
        var selector = isPresent(overrideSelector) ? overrideSelector : hostViewFactory.selector;
        var view = hostViewFactory.viewFactory(this, injector, null);
        view.create(projectableNodes, selector);
        return wtfLeave(s, view.ref);
    }
    destroyRootHostView(hostViewRef) {
        var s = this._destroyRootHostViewScope();
        var hostView = hostViewRef.internalView;
        hostView.renderer.detachView(hostView.flatRootNodes);
        hostView.destroy();
        wtfLeave(s);
    }
    /**
     * Used by the generated code
     */
    createRenderComponentType(templateUrl, slotCount, encapsulation, styles) {
        return new RenderComponentType(`${this._appId}-${this._nextCompTypeId++}`, templateUrl, slotCount, encapsulation, styles);
    }
    /** @internal */
    renderComponent(renderComponentType) {
        return this._renderer.renderComponent(renderComponentType);
    }
};
AppViewManager_ = __decorate([
    Injectable(),
    __param(1, Inject(APP_ID)), 
    __metadata('design:paramtypes', [RootRenderer, String])
], AppViewManager_);
