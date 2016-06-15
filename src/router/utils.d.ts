import { Type } from 'angular2/src/facade/lang';
import { ComponentFactory } from 'angular2/core';
export declare class TouchMap {
    map: {
        [key: string]: string;
    };
    keys: {
        [key: string]: boolean;
    };
    constructor(map: {
        [key: string]: any;
    });
    get(key: string): string;
    getUnused(): {
        [key: string]: any;
    };
}
export declare function normalizeString(obj: any): string;
export declare function getComponentAnnotations(comp: Type | ComponentFactory): any[];
export declare function getComponentType(comp: Type | ComponentFactory): Type;
export declare function getCanActivateHook(component: any): Function;
