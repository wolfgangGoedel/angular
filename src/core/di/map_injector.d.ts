import { Injector, InjectorFactory } from './injector';
/**
 * An simple injector based on a Map of values.
 */
export declare class MapInjector implements Injector {
    private _parent;
    static createFactory(values?: Map<any, any>, factories?: Map<any, (injector: Injector) => any>): InjectorFactory<any>;
    private _instances;
    private _factories;
    private _values;
    constructor(_parent?: Injector, values?: Map<any, any>, factories?: Map<any, (injector: Injector) => any>);
    get(token: any, notFoundValue?: any): any;
}
/**
 * InjectorFactory for MapInjector.
 */
export declare class MapInjectorFactory implements InjectorFactory<any> {
    private _values;
    private _factories;
    constructor(_values?: Map<any, any>, _factories?: Map<any, (injector: Injector) => any>);
    create(parent?: Injector, context?: any): Injector;
}
