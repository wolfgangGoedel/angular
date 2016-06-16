import { RouteDefinition } from './route_config_decorator';
import { Type } from 'angular2/src/facade/lang';
import { RouteRegistry } from '../route_registry';
import { ComponentFactory } from 'angular2/core';
/**
 * Given a JS Object that represents a route config, returns a corresponding Route, AsyncRoute,
 * AuxRoute or Redirect object.
 *
 * Also wraps an AsyncRoute's loader function to add the loaded component's route config to the
 * `RouteRegistry`.
 */
export declare function normalizeRouteConfig(config: RouteDefinition, registry: RouteRegistry): RouteDefinition;
export declare function assertComponentExists(component: Type | ComponentFactory, path: string): void;
