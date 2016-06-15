import { RouteData } from '../../instruction';
export interface RouteHandler {
    componentType: any;
    resolveComponentType(): Promise<any>;
    data: RouteData;
}
