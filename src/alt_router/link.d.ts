import { Tree, UrlSegment, RouteSegment } from './segments';
export declare function link(segment: RouteSegment, routeTree: Tree<RouteSegment>, urlTree: Tree<UrlSegment>, change: any[]): Tree<UrlSegment>;
