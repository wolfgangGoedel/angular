export declare const THROW_IF_NOT_FOUND: Object;
/**
 * The Injector interface. This class can also be used
 * to get hold of an Injector.
 */
export declare abstract class Injector {
    static THROW_IF_NOT_FOUND: Object;
    static NULL: Injector;
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
    get(token: any, notFoundValue?: any): any;
}
/**
 * An simple injector based on a Map of values.
 */
export declare class MapInjector implements Injector {
    private _parent;
    private _values;
    constructor(_parent: Injector, _values: Map<any, any>);
    get(token: any, notFoundValue?: any): any;
}
