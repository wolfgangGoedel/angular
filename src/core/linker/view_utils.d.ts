export declare function flattenNestedViewRenderNodes(nodes: any[]): any[];
export declare function ensureSlotCount(projectableNodes: any[][], expectedSlotCount: number): any[][];
export declare const MAX_INTERPOLATION_VALUES: number;
export declare function interpolate(valueCount: number, c0: string, a1: any, c1: string, a2?: any, c2?: string, a3?: any, c3?: string, a4?: any, c4?: string, a5?: any, c5?: string, a6?: any, c6?: string, a7?: any, c7?: string, a8?: any, c8?: string, a9?: any, c9?: string): string;
export declare function checkBinding(throwOnChange: boolean, oldValue: any, newValue: any): boolean;
export declare function arrayLooseIdentical(a: any[], b: any[]): boolean;
export declare function mapLooseIdentical<V>(m1: {
    [key: string]: V;
}, m2: {
    [key: string]: V;
}): boolean;
