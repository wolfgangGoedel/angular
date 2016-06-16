import { Injector } from '../di/injector';
export declare abstract class CodegenInjector<MODULE> implements Injector {
    parent: Injector;
    mainModule: MODULE;
    constructor(parent: Injector, _needsMainModule: any, mainModule: MODULE);
    get(token: any, notFoundValue?: any): any;
    abstract getInternal(token: any, notFoundValue: any): any;
}
export declare class InjectorFactory<MODULE> {
    private _injectorFactory;
    constructor(_injectorFactory: (parent: Injector, mainModule: MODULE) => Injector);
    create(parent?: Injector, mainModule?: MODULE): Injector;
}
