import { TestabilityRegistry, Testability, GetTestability } from 'angular2/core';
export declare class BrowserGetTestability implements GetTestability {
    addToWindow(registry: TestabilityRegistry): void;
    findTestabilityInTree(registry: TestabilityRegistry, elem: any, findInAncestors: boolean): Testability;
}
