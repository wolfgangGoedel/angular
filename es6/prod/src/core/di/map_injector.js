import { isBlank } from 'angular2/src/facade/lang';
import { Injector, THROW_IF_NOT_FOUND } from './injector';
/**
 * An simple injector based on a Map of values.
 */
export class MapInjector {
    constructor(_parent = null, values = null) {
        this._parent = _parent;
        if (isBlank(values)) {
            values = new Map();
        }
        this._values = values;
        if (isBlank(this._parent)) {
            this._parent = Injector.NULL;
        }
    }
    static createFactory(values) {
        return new MapInjectorFactory(values);
    }
    get(token, notFoundValue = THROW_IF_NOT_FOUND) {
        if (token === Injector) {
            return this;
        }
        if (this._values.has(token)) {
            return this._values.get(token);
        }
        return this._parent.get(token, notFoundValue);
    }
}
/**
 * InjectorFactory for MapInjector.
 */
export class MapInjectorFactory {
    constructor(_values = null) {
        this._values = _values;
    }
    create(parent = null, context = null) {
        return new MapInjector(parent, this._values);
    }
}
