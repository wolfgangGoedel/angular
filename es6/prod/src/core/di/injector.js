import { CONST_EXPR, stringify, isBlank } from 'angular2/src/facade/lang';
import { unimplemented, BaseException } from 'angular2/src/facade/exceptions';
const _THROW_IF_NOT_FOUND = CONST_EXPR(new Object());
export const THROW_IF_NOT_FOUND = CONST_EXPR(_THROW_IF_NOT_FOUND);
class _NullInjector {
    get(token, notFoundValue = _THROW_IF_NOT_FOUND) {
        if (notFoundValue === _THROW_IF_NOT_FOUND) {
            throw new BaseException(`No provider for ${stringify(token)}!`);
        }
        return notFoundValue;
    }
}
/**
 * The Injector interface. This class can also be used
 * to get hold of an Injector.
 */
export class Injector {
    /**
     * Retrieves an instance from the injector based on the provided token.
     * If not found:
     * - Throws {@link NoProviderError} if no `notFoundValue` that is not equal to
     * Injector.THROW_IF_NOT_FOUND is given
     * - Returns the `notFoundValue` otherwise
     *
     * ### Example ([live demo](http://plnkr.co/edit/HeXSHg?p=preview))
     *
     * ```typescript
     * var injector = ReflectiveInjector.resolveAndCreate([
     *   provide("validToken", {useValue: "Value"})
     * ]);
     * expect(injector.get("validToken")).toEqual("Value");
     * expect(() => injector.get("invalidToken")).toThrowError();
     * ```
     *
     * `Injector` returns itself when given `Injector` as a token.
     *
     * ```typescript
     * var injector = ReflectiveInjector.resolveAndCreate([]);
     * expect(injector.get(Injector)).toBe(injector);
     * ```
     */
    get(token, notFoundValue) { return unimplemented(); }
}
Injector.THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;
Injector.NULL = new _NullInjector();
/**
 * An simple injector based on a Map of values.
 */
export class MapInjector {
    constructor(_parent, _values) {
        this._parent = _parent;
        this._values = _values;
        if (isBlank(this._parent)) {
            this._parent = Injector.NULL;
        }
    }
    get(token, notFoundValue = _THROW_IF_NOT_FOUND) {
        if (token === Injector) {
            return this;
        }
        return this._values.has(token) ? this._values.get(token) :
            this._parent.get(token, notFoundValue);
    }
}
