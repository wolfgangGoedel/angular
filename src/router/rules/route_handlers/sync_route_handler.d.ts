import { RouteHandler } from './route_handler';
import { RouteData } from '../../instruction';
export declare class SyncRouteHandler implements RouteHandler {
    componentType: any;
    data: RouteData;
    constructor(componentType: any, data?: {
        [key: string]: any;
    });
    resolveComponentType(): Promise<any>;
}
