import { isBlank } from 'angular2/src/facade/lang';
import { Injector, THROW_IF_NOT_FOUND } from './injector';
/**
 * An simple injector based on a Map of values.
 */
export class MapInjector {
    constructor(_parent = null, values = null, factories = null) {
        this._parent = _parent;
        this._instances = new Map();
        if (isBlank(values)) {
            values = new Map();
        }
        this._values = values;
        if (isBlank(factories)) {
            factories = new Map();
        }
        this._factories = factories;
        if (isBlank(this._parent)) {
            this._parent = Injector.NULL;
        }
    }
    static createFactory(values, factories) {
        return new MapInjectorFactory(values, factories);
    }
    get(token, notFoundValue = THROW_IF_NOT_FOUND) {
        if (token === Injector) {
            return this;
        }
        if (this._values.has(token)) {
            return this._values.get(token);
        }
        if (this._instances.has(token)) {
            return this._instances.get(token);
        }
        if (this._factories.has(token)) {
            var instance = this._factories.get(token)(this);
            this._instances.set(token, instance);
            return instance;
        }
        return this._parent.get(token, notFoundValue);
    }
}
/**
 * InjectorFactory for MapInjector.
 */
export class MapInjectorFactory {
    constructor(_values = null, _factories = null) {
        this._values = _values;
        this._factories = _factories;
    }
    create(parent = null, context = null) {
        return new MapInjector(parent, this._values, this._factories);
    }
}
