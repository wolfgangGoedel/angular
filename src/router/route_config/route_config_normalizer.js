'use strict';"use strict";
var route_config_decorator_1 = require('./route_config_decorator');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var core_1 = require('angular2/core');
/**
 * Given a JS Object that represents a route config, returns a corresponding Route, AsyncRoute,
 * AuxRoute or Redirect object.
 *
 * Also wraps an AsyncRoute's loader function to add the loaded component's route config to the
 * `RouteRegistry`.
 */
function normalizeRouteConfig(config, registry) {
    if (config instanceof route_config_decorator_1.AsyncRoute) {
        var wrappedLoader = wrapLoaderToReconfigureRegistry(config.loader, registry);
        return new route_config_decorator_1.AsyncRoute({
            path: config.path,
            loader: wrappedLoader,
            name: config.name,
            data: config.data,
            useAsDefault: config.useAsDefault
        });
    }
    if (config instanceof route_config_decorator_1.Route || config instanceof route_config_decorator_1.Redirect || config instanceof route_config_decorator_1.AuxRoute) {
        return config;
    }
    if ((+!!config.component) + (+!!config.redirectTo) + (+!!config.loader) != 1) {
        throw new exceptions_1.BaseException("Route config should contain exactly one \"component\", \"loader\", or \"redirectTo\" property.");
    }
    if (config.as && config.name) {
        throw new exceptions_1.BaseException("Route config should contain exactly one \"as\" or \"name\" property.");
    }
    if (config.as) {
        config.name = config.as;
    }
    if (config.loader) {
        var wrappedLoader = wrapLoaderToReconfigureRegistry(config.loader, registry);
        return new route_config_decorator_1.AsyncRoute({
            path: config.path,
            loader: wrappedLoader,
            name: config.name,
            data: config.data,
            useAsDefault: config.useAsDefault
        });
    }
    if (config.aux) {
        return new route_config_decorator_1.AuxRoute({ path: config.aux, component: config.component, name: config.name });
    }
    if (config.component) {
        if (typeof config.component == 'object') {
            var componentDefinitionObject = config.component;
            if (componentDefinitionObject.type == 'constructor') {
                return new route_config_decorator_1.Route({
                    path: config.path,
                    component: componentDefinitionObject.constructor,
                    name: config.name,
                    data: config.data,
                    useAsDefault: config.useAsDefault
                });
            }
            else if (componentDefinitionObject.type == 'loader') {
                return new route_config_decorator_1.AsyncRoute({
                    path: config.path,
                    loader: componentDefinitionObject.loader,
                    name: config.name,
                    data: config.data,
                    useAsDefault: config.useAsDefault
                });
            }
            else {
                throw new exceptions_1.BaseException("Invalid component type \"" + componentDefinitionObject.type + "\". Valid types are \"constructor\" and \"loader\".");
            }
        }
        return new route_config_decorator_1.Route(config);
    }
    if (config.redirectTo) {
        return new route_config_decorator_1.Redirect({ path: config.path, redirectTo: config.redirectTo });
    }
    return config;
}
exports.normalizeRouteConfig = normalizeRouteConfig;
function wrapLoaderToReconfigureRegistry(loader, registry) {
    return function () {
        return loader().then(function (componentType) {
            registry.configFromComponent(componentType);
            return componentType;
        });
    };
}
function assertComponentExists(component, path) {
    if (!lang_1.isType(component) && !(component instanceof core_1.ComponentFactory)) {
        throw new exceptions_1.BaseException("Component for route \"" + path + "\" is not defined, or is not a class.");
    }
}
exports.assertComponentExists = assertComponentExists;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVfY29uZmlnX25vcm1hbGl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWxiN2ZlQnJ6LnRtcC9hbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlX2NvbmZpZy9yb3V0ZV9jb25maWdfbm9ybWFsaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsdUNBQXFFLDBCQUEwQixDQUFDLENBQUE7QUFFaEcscUJBQTJCLDBCQUEwQixDQUFDLENBQUE7QUFDdEQsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFFL0UscUJBQStCLGVBQWUsQ0FBQyxDQUFBO0FBRS9DOzs7Ozs7R0FNRztBQUNILDhCQUFxQyxNQUF1QixFQUN2QixRQUF1QjtJQUMxRCxFQUFFLENBQUMsQ0FBQyxNQUFNLFlBQVksbUNBQVUsQ0FBQyxDQUFDLENBQUM7UUFDakMsSUFBSSxhQUFhLEdBQUcsK0JBQStCLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM3RSxNQUFNLENBQUMsSUFBSSxtQ0FBVSxDQUFDO1lBQ3BCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtZQUNqQixNQUFNLEVBQUUsYUFBYTtZQUNyQixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7WUFDakIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO1lBQ2pCLFlBQVksRUFBRSxNQUFNLENBQUMsWUFBWTtTQUNsQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0QsRUFBRSxDQUFDLENBQUMsTUFBTSxZQUFZLDhCQUFLLElBQUksTUFBTSxZQUFZLGlDQUFRLElBQUksTUFBTSxZQUFZLGlDQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3hGLE1BQU0sQ0FBa0IsTUFBTSxDQUFDO0lBQ2pDLENBQUM7SUFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENB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QztJQUNaLENBQUM7SUFFRCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUN0QixNQUFNLENBQUMsSUFBSSxpQ0FBUSxDQUFDLEVBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUE3RWUsNEJBQW9CLHVCQTZFbkMsQ0FBQTtBQUdELHlDQUF5QyxNQUFnQixFQUFFLFFBQXVCO0lBRWhGLE1BQU0sQ0FBQztRQUNMLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQyxhQUFhO1lBQ2pDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUM1QyxNQUFNLENBQUMsYUFBYSxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVELCtCQUFzQyxTQUFrQyxFQUFFLElBQVk7SUFDcEYsRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsWUFBWSx1QkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRSxNQUFNLElBQUksMEJBQWEsQ0FBQywyQkFBd0IsSUFBSSwwQ0FBc0MsQ0FBQyxDQUFDO0lBQzlGLENBQUM7QUFDSCxDQUFDO0FBSmUsNkJBQXFCLHdCQUlwQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBc3luY1JvdXRlLCBBdXhSb3V0ZSwgUm91dGUsIFJlZGlyZWN0LCBSb3V0ZURlZmluaXRpb259IGZyb20gJy4vcm91dGVfY29uZmlnX2RlY29yYXRvcic7XG5pbXBvcnQge0NvbXBvbmVudERlZmluaXRpb259IGZyb20gJy4uL3JvdXRlX2RlZmluaXRpb24nO1xuaW1wb3J0IHtpc1R5cGUsIFR5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1JvdXRlUmVnaXN0cnl9IGZyb20gJy4uL3JvdXRlX3JlZ2lzdHJ5JztcbmltcG9ydCB7Q29tcG9uZW50RmFjdG9yeX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbi8qKlxuICogR2l2ZW4gYSBKUyBPYmplY3QgdGhhdCByZXByZXNlbnRzIGEgcm91dGUgY29uZmlnLCByZXR1cm5zIGEgY29ycmVzcG9uZGluZyBSb3V0ZSwgQXN5bmNSb3V0ZSxcbiAqIEF1eFJvdXRlIG9yIFJlZGlyZWN0IG9iamVjdC5cbiAqXG4gKiBBbHNvIHdyYXBzIGFuIEFzeW5jUm91dGUncyBsb2FkZXIgZnVuY3Rpb24gdG8gYWRkIHRoZSBsb2FkZWQgY29tcG9uZW50J3Mgcm91dGUgY29uZmlnIHRvIHRoZVxuICogYFJvdXRlUmVnaXN0cnlgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplUm91dGVDb25maWcoY29uZmlnOiBSb3V0ZURlZmluaXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaXN0cnk6IFJvdXRlUmVnaXN0cnkpOiBSb3V0ZURlZmluaXRpb24ge1xuICBpZiAoY29uZmlnIGluc3RhbmNlb2YgQXN5bmNSb3V0ZSkge1xuICAgIHZhciB3cmFwcGVkTG9hZGVyID0gd3JhcExvYWRlclRvUmVjb25maWd1cmVSZWdpc3RyeShjb25maWcubG9hZGVyLCByZWdpc3RyeSk7XG4gICAgcmV0dXJuIG5ldyBBc3luY1JvdXRlKHtcbiAgICAgIHBhdGg6IGNvbmZpZy5wYXRoLFxuICAgICAgbG9hZGVyOiB3cmFwcGVkTG9hZGVyLFxuICAgICAgbmFtZTogY29uZmlnLm5hbWUsXG4gICAgICBkYXRhOiBjb25maWcuZGF0YSxcbiAgICAgIHVzZUFzRGVmYXVsdDogY29uZmlnLnVzZUFzRGVmYXVsdFxuICAgIH0pO1xuICB9XG4gIGlmIChjb25maWcgaW5zdGFuY2VvZiBSb3V0ZSB8fCBjb25maWcgaW5zdGFuY2VvZiBSZWRpcmVjdCB8fCBjb25maWcgaW5zdGFuY2VvZiBBdXhSb3V0ZSkge1xuICAgIHJldHVybiA8Um91dGVEZWZpbml0aW9uPmNvbmZpZztcbiAgfVxuXG4gIGlmICgoKyEhY29uZmlnLmNvbXBvbmVudCkgKyAoKyEhY29uZmlnLnJlZGlyZWN0VG8pICsgKCshIWNvbmZpZy5sb2FkZXIpICE9IDEpIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgYFJvdXRlIGNvbmZpZyBzaG91bGQgY29udGFpbiBleGFjdGx5IG9uZSBcImNvbXBvbmVudFwiLCBcImxvYWRlclwiLCBvciBcInJlZGlyZWN0VG9cIiBwcm9wZXJ0eS5gKTtcbiAgfVxuICBpZiAoY29uZmlnLmFzICYmIGNvbmZpZy5uYW1lKSB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYFJvdXRlIGNvbmZpZyBzaG91bGQgY29udGFpbiBleGFjdGx5IG9uZSBcImFzXCIgb3IgXCJuYW1lXCIgcHJvcGVydHkuYCk7XG4gIH1cbiAgaWYgKGNvbmZpZy5hcykge1xuICAgIGNvbmZpZy5uYW1lID0gY29uZmlnLmFzO1xuICB9XG4gIGlmIChjb25maWcubG9hZGVyKSB7XG4gICAgdmFyIHdyYXBwZWRMb2FkZXIgPSB3cmFwTG9hZGVyVG9SZWNvbmZpZ3VyZVJlZ2lzdHJ5KGNvbmZpZy5sb2FkZXIsIHJlZ2lzdHJ5KTtcbiAgICByZXR1cm4gbmV3IEFzeW5jUm91dGUoe1xuICAgICAgcGF0aDogY29uZmlnLnBhdGgsXG4gICAgICBsb2FkZXI6IHdyYXBwZWRMb2FkZXIsXG4gICAgICBuYW1lOiBjb25maWcubmFtZSxcbiAgICAgIGRhdGE6IGNvbmZpZy5kYXRhLFxuICAgICAgdXNlQXNEZWZhdWx0OiBjb25maWcudXNlQXNEZWZhdWx0XG4gICAgfSk7XG4gIH1cbiAgaWYgKGNvbmZpZy5hdXgpIHtcbiAgICByZXR1cm4gbmV3IEF1eFJvdXRlKHtwYXRoOiBjb25maWcuYXV4LCBjb21wb25lbnQ6PFR5cGU+Y29uZmlnLmNvbXBvbmVudCwgbmFtZTogY29uZmlnLm5hbWV9KTtcbiAgfVxuICBpZiAoY29uZmlnLmNvbXBvbmVudCkge1xuICAgIGlmICh0eXBlb2YgY29uZmlnLmNvbXBvbmVudCA9PSAnb2JqZWN0Jykge1xuICAgICAgbGV0IGNvbXBvbmVudERlZmluaXRpb25PYmplY3QgPSA8Q29tcG9uZW50RGVmaW5pdGlvbj5jb25maWcuY29tcG9uZW50O1xuICAgICAgaWYgKGNvbXBvbmVudERlZmluaXRpb25PYmplY3QudHlwZSA9PSAnY29uc3RydWN0b3InKSB7XG4gICAgICAgIHJldHVybiBuZXcgUm91dGUoe1xuICAgICAgICAgIHBhdGg6IGNvbmZpZy5wYXRoLFxuICAgICAgICAgIGNvbXBvbmVudDo8VHlwZT5jb21wb25lbnREZWZpbml0aW9uT2JqZWN0LmNvbnN0cnVjdG9yLFxuICAgICAgICAgIG5hbWU6IGNvbmZpZy5uYW1lLFxuICAgICAgICAgIGRhdGE6IGNvbmZpZy5kYXRhLFxuICAgICAgICAgIHVzZUFzRGVmYXVsdDogY29uZmlnLnVzZUFzRGVmYXVsdFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAoY29tcG9uZW50RGVmaW5pdGlvbk9iamVjdC50eXBlID09ICdsb2FkZXInKSB7XG4gICAgICAgIHJldHVybiBuZXcgQXN5bmNSb3V0ZSh7XG4gICAgICAgICAgcGF0aDogY29uZmlnLnBhdGgsXG4gICAgICAgICAgbG9hZGVyOiBjb21wb25lbnREZWZpbml0aW9uT2JqZWN0LmxvYWRlcixcbiAgICAgICAgICBuYW1lOiBjb25maWcubmFtZSxcbiAgICAgICAgICBkYXRhOiBjb25maWcuZGF0YSxcbiAgICAgICAgICB1c2VBc0RlZmF1bHQ6IGNvbmZpZy51c2VBc0RlZmF1bHRcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgIGBJbnZhbGlkIGNvbXBvbmVudCB0eXBlIFwiJHtjb21wb25lbnREZWZpbml0aW9uT2JqZWN0LnR5cGV9XCIuIFZhbGlkIHR5cGVzIGFyZSBcImNvbnN0cnVjdG9yXCIgYW5kIFwibG9hZGVyXCIuYCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgUm91dGUoPHtcbiAgICAgIHBhdGg6IHN0cmluZztcbiAgICAgIGNvbXBvbmVudDogVHlwZSB8IENvbXBvbmVudEZhY3Rvcnk7XG4gICAgICBuYW1lPzogc3RyaW5nO1xuICAgICAgZGF0YT86IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuICAgICAgdXNlQXNEZWZhdWx0PzogYm9vbGVhbjtcbiAgICB9PmNvbmZpZyk7XG4gIH1cblxuICBpZiAoY29uZmlnLnJlZGlyZWN0VG8pIHtcbiAgICByZXR1cm4gbmV3IFJlZGlyZWN0KHtwYXRoOiBjb25maWcucGF0aCwgcmVkaXJlY3RUbzogY29uZmlnLnJlZGlyZWN0VG99KTtcbiAgfVxuXG4gIHJldHVybiBjb25maWc7XG59XG5cblxuZnVuY3Rpb24gd3JhcExvYWRlclRvUmVjb25maWd1cmVSZWdpc3RyeShsb2FkZXI6IEZ1bmN0aW9uLCByZWdpc3RyeTogUm91dGVSZWdpc3RyeSk6ICgpID0+XG4gICAgUHJvbWlzZTxUeXBlPiB7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgcmV0dXJuIGxvYWRlcigpLnRoZW4oKGNvbXBvbmVudFR5cGUpID0+IHtcbiAgICAgIHJlZ2lzdHJ5LmNvbmZpZ0Zyb21Db21wb25lbnQoY29tcG9uZW50VHlwZSk7XG4gICAgICByZXR1cm4gY29tcG9uZW50VHlwZTtcbiAgICB9KTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydENvbXBvbmVudEV4aXN0cyhjb21wb25lbnQ6IFR5cGUgfCBDb21wb25lbnRGYWN0b3J5LCBwYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgaWYgKCFpc1R5cGUoY29tcG9uZW50KSAmJiAhKGNvbXBvbmVudCBpbnN0YW5jZW9mIENvbXBvbmVudEZhY3RvcnkpKSB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENvbXBvbmVudCBmb3Igcm91dGUgXCIke3BhdGh9XCIgaXMgbm90IGRlZmluZWQsIG9yIGlzIG5vdCBhIGNsYXNzLmApO1xuICB9XG59XG4iXX0=