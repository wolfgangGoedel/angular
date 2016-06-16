var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Type, CONST, isPresent, isBlank } from 'angular2/src/facade/lang';
import { unimplemented } from 'angular2/src/facade/exceptions';
import { ViewUtils } from './view_utils';
import { reflector } from 'angular2/src/core/reflection/reflection';
/**
 * Represents an instance of a Component created via a {@link ComponentFactory}.
 *
 * `ComponentRef` provides access to the Component Instance as well other objects related to this
 * Component Instance and allows you to destroy the Component Instance via the {@link #destroy}
 * method.
 */
export class ComponentRef {
    /**
     * Location of the Host Element of this Component Instance.
     */
    get location() { return unimplemented(); }
    /**
     * The injector on which the component instance exists.
     */
    get injector() { return unimplemented(); }
    /**
     * The instance of the Component.
     */
    get instance() { return unimplemented(); }
    ;
    /**
     * The {@link ViewRef} of the Host View of this Component instance.
     */
    get hostView() { return unimplemented(); }
    ;
    /**
     * The {@link ChangeDetectorRef} of the Component instance.
     */
    get changeDetectorRef() { return unimplemented(); }
    /**
     * The component type.
     */
    get componentType() { return unimplemented(); }
}
export class ComponentRef_ extends ComponentRef {
    constructor(_hostElement, _componentType, _metadata) {
        super();
        this._hostElement = _hostElement;
        this._componentType = _componentType;
        this._metadata = _metadata;
    }
    get location() { return this._hostElement.elementRef; }
    get injector() { return this._hostElement.injector; }
    get instance() { return this._hostElement.component; }
    ;
    get hostView() { return this._hostElement.parentView.ref; }
    ;
    get changeDetectorRef() { return this._hostElement.parentView.ref; }
    ;
    get componentType() { return this._componentType; }
    get metadata() { return this._metadata; }
    destroy() { this._hostElement.parentView.destroy(); }
    onDestroy(callback) { this.hostView.onDestroy(callback); }
}
let ComponentFactory_1;
export let ComponentFactory = ComponentFactory_1 = class ComponentFactory {
    // Note: can't use a Map for the metadata due to
    // https://github.com/dart-lang/sdk/issues/21553
    constructor(selector, _viewFactory, _componentType, _metadataPairs = null) {
        this.selector = selector;
        this._viewFactory = _viewFactory;
        this._componentType = _componentType;
        this._metadataPairs = _metadataPairs;
    }
    static cloneWithMetadata(original, metadata) {
        return new ComponentFactory_1(original.selector, original._viewFactory, original._componentType, [original.componentType, metadata]);
    }
    get componentType() { return this._componentType; }
    get metadata() {
        if (isPresent(this._metadataPairs)) {
            for (var i = 0; i < this._metadataPairs.length; i += 2) {
                if (this._metadataPairs[i] === this._componentType) {
                    return this._metadataPairs[i + 1];
                }
            }
            return [];
        }
        else {
            return reflector.annotations(this._componentType);
        }
    }
    /**
     * Creates a new component.
     */
    create(injector, projectableNodes = null, rootSelectorOrNode = null) {
        var vu = injector.get(ViewUtils);
        if (isBlank(projectableNodes)) {
            projectableNodes = [];
        }
        // Note: Host views don't need a declarationAppElement!
        var hostView = this._viewFactory(vu, injector, null);
        var hostElement = hostView.create(projectableNodes, rootSelectorOrNode);
        return new ComponentRef_(hostElement, this.componentType, this.metadata);
    }
};
ComponentFactory = ComponentFactory_1 = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [String, Function, Type, Array])
], ComponentFactory);
