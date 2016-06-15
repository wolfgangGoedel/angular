import { Injector, UNDEFINED } from 'angular2/src/core/di/injector';
export class ElementInjector extends Injector {
    constructor(_view, _nodeIndex) {
        super();
        this._view = _view;
        this._nodeIndex = _nodeIndex;
    }
    get(token) {
        var result = this._view.injectorGet(token, this._nodeIndex, UNDEFINED);
        if (result === UNDEFINED) {
            result = this._view.parentInjector.get(token);
        }
        return result;
    }
    getOptional(token) {
        var result = this._view.injectorGet(token, this._nodeIndex, UNDEFINED);
        if (result === UNDEFINED) {
            result = this._view.parentInjector.getOptional(token);
        }
        return result;
    }
}
