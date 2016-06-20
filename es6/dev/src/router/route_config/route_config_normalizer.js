import { AsyncRoute, AuxRoute, Route, Redirect } from './route_config_decorator';
import { isType } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ComponentFactory } from 'angular2/core';
/**
 * Given a JS Object that represents a route config, returns a corresponding Route, AsyncRoute,
 * AuxRoute or Redirect object.
 *
 * Also wraps an AsyncRoute's loader function to add the loaded component's route config to the
 * `RouteRegistry`.
 */
export function normalizeRouteConfig(config, registry) {
    if (config instanceof AsyncRoute) {
        var wrappedLoader = wrapLoaderToReconfigureRegistry(config.loader, registry);
        return new AsyncRoute({
            path: config.path,
            loader: wrappedLoader,
            name: config.name,
            data: config.data,
            useAsDefault: config.useAsDefault
        });
    }
    if (config instanceof Route || config instanceof Redirect || config instanceof AuxRoute) {
        return config;
    }
    if ((+!!config.component) + (+!!config.redirectTo) + (+!!config.loader) != 1) {
        throw new BaseException(`Route config should contain exactly one "component", "loader", or "redirectTo" property.`);
    }
    if (config.as && config.name) {
        throw new BaseException(`Route config should contain exactly one "as" or "name" property.`);
    }
    if (config.as) {
        config.name = config.as;
    }
    if (config.loader) {
        var wrappedLoader = wrapLoaderToReconfigureRegistry(config.loader, registry);
        return new AsyncRoute({
            path: config.path,
            loader: wrappedLoader,
            name: config.name,
            data: config.data,
            useAsDefault: config.useAsDefault
        });
    }
    if (config.aux) {
        return new AuxRoute({ path: config.aux, component: config.component, name: config.name });
    }
    if (config.component) {
        if (typeof config.component == 'object') {
            let componentDefinitionObject = config.component;
            if (componentDefinitionObject.type == 'constructor') {
                return new Route({
                    path: config.path,
                    component: componentDefinitionObject.constructor,
                    name: config.name,
                    data: config.data,
                    useAsDefault: config.useAsDefault
                });
            }
            else if (componentDefinitionObject.type == 'loader') {
                return new AsyncRoute({
                    path: config.path,
                    loader: componentDefinitionObject.loader,
                    name: config.name,
                    data: config.data,
                    useAsDefault: config.useAsDefault
                });
            }
            else {
                throw new BaseException(`Invalid component type "${componentDefinitionObject.type}". Valid types are "constructor" and "loader".`);
            }
        }
        return new Route(config);
    }
    if (config.redirectTo) {
        return new Redirect({ path: config.path, redirectTo: config.redirectTo });
    }
    return config;
}
function wrapLoaderToReconfigureRegistry(loader, registry) {
    return () => {
        return loader().then((componentType) => {
            registry.configFromComponent(componentType);
            return componentType;
        });
    };
}
export function assertComponentExists(component, path) {
    if (!isType(component) && !(component instanceof ComponentFactory)) {
        throw new BaseException(`Component for route "${path}" is not defined, or is not a class.`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVfY29uZmlnX25vcm1hbGl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVk4N1czNFR0LnRtcC9hbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlX2NvbmZpZy9yb3V0ZV9jb25maWdfbm9ybWFsaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBa0IsTUFBTSwwQkFBMEI7T0FFeEYsRUFBQyxNQUFNLEVBQU8sTUFBTSwwQkFBMEI7T0FDOUMsRUFBQyxhQUFhLEVBQW1CLE1BQU0sZ0NBQWdDO09BRXZFLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxlQUFlO0FBRTlDOzs7Ozs7R0FNRztBQUNILHFDQUFxQyxNQUF1QixFQUN2QixRQUF1QjtJQUMxRCxFQUFFLENBQUMsQ0FBQyxNQUFNLFlBQVksVUFBVSxDQUFDLENBQUMsQ0FBQztRQUNqQyxJQUFJLGFBQWEsR0FBRywrQkFBK0IsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzdFLE1BQU0sQ0FBQyxJQUFJLFVBQVUsQ0FBQztZQUNwQixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7WUFDakIsTUFBTSxFQUFFLGFBQWE7WUFDckIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO1lBQ2pCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtZQUNqQixZQUFZLEVBQUUsTUFBTSxDQUFDLFlBQVk7U0FDbEMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNELEVBQUUsQ0FBQyxDQUFDLE1BQU0sWUFBWSxLQUFLLElBQUksTUFBTSxZQUFZLFFBQVEsSUFBSSxNQUFNLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN4RixNQUFNLENBQWtCLE1BQU0sQ0FBQztJQUNqQyxDQUFDO0lBRUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENB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QUFDLElBQUksS0FBSyxDQU1kLE1BQU0sQ0FBQyxDQUFDO0lBQ1osQ0FBQztJQUVELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxFQUFDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBR0QseUNBQXlDLE1BQWdCLEVBQUUsUUFBdUI7SUFFaEYsTUFBTSxDQUFDO1FBQ0wsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLGFBQWE7WUFDakMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzVDLE1BQU0sQ0FBQyxhQUFhLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsc0NBQXNDLFNBQWtDLEVBQUUsSUFBWTtJQUNwRixFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxZQUFZLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25FLE1BQU0sSUFBSSxhQUFhLENBQUMsd0JBQXdCLElBQUksc0NBQXNDLENBQUMsQ0FBQztJQUM5RixDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXN5bmNSb3V0ZSwgQXV4Um91dGUsIFJvdXRlLCBSZWRpcmVjdCwgUm91dGVEZWZpbml0aW9ufSBmcm9tICcuL3JvdXRlX2NvbmZpZ19kZWNvcmF0b3InO1xuaW1wb3J0IHtDb21wb25lbnREZWZpbml0aW9ufSBmcm9tICcuLi9yb3V0ZV9kZWZpbml0aW9uJztcbmltcG9ydCB7aXNUeXBlLCBUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtSb3V0ZVJlZ2lzdHJ5fSBmcm9tICcuLi9yb3V0ZV9yZWdpc3RyeSc7XG5pbXBvcnQge0NvbXBvbmVudEZhY3Rvcnl9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG4vKipcbiAqIEdpdmVuIGEgSlMgT2JqZWN0IHRoYXQgcmVwcmVzZW50cyBhIHJvdXRlIGNvbmZpZywgcmV0dXJucyBhIGNvcnJlc3BvbmRpbmcgUm91dGUsIEFzeW5jUm91dGUsXG4gKiBBdXhSb3V0ZSBvciBSZWRpcmVjdCBvYmplY3QuXG4gKlxuICogQWxzbyB3cmFwcyBhbiBBc3luY1JvdXRlJ3MgbG9hZGVyIGZ1bmN0aW9uIHRvIGFkZCB0aGUgbG9hZGVkIGNvbXBvbmVudCdzIHJvdXRlIGNvbmZpZyB0byB0aGVcbiAqIGBSb3V0ZVJlZ2lzdHJ5YC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVJvdXRlQ29uZmlnKGNvbmZpZzogUm91dGVEZWZpbml0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJ5OiBSb3V0ZVJlZ2lzdHJ5KTogUm91dGVEZWZpbml0aW9uIHtcbiAgaWYgKGNvbmZpZyBpbnN0YW5jZW9mIEFzeW5jUm91dGUpIHtcbiAgICB2YXIgd3JhcHBlZExvYWRlciA9IHdyYXBMb2FkZXJUb1JlY29uZmlndXJlUmVnaXN0cnkoY29uZmlnLmxvYWRlciwgcmVnaXN0cnkpO1xuICAgIHJldHVybiBuZXcgQXN5bmNSb3V0ZSh7XG4gICAgICBwYXRoOiBjb25maWcucGF0aCxcbiAgICAgIGxvYWRlcjogd3JhcHBlZExvYWRlcixcbiAgICAgIG5hbWU6IGNvbmZpZy5uYW1lLFxuICAgICAgZGF0YTogY29uZmlnLmRhdGEsXG4gICAgICB1c2VBc0RlZmF1bHQ6IGNvbmZpZy51c2VBc0RlZmF1bHRcbiAgICB9KTtcbiAgfVxuICBpZiAoY29uZmlnIGluc3RhbmNlb2YgUm91dGUgfHwgY29uZmlnIGluc3RhbmNlb2YgUmVkaXJlY3QgfHwgY29uZmlnIGluc3RhbmNlb2YgQXV4Um91dGUpIHtcbiAgICByZXR1cm4gPFJvdXRlRGVmaW5pdGlvbj5jb25maWc7XG4gIH1cblxuICBpZiAoKCshIWNvbmZpZy5jb21wb25lbnQpICsgKCshIWNvbmZpZy5yZWRpcmVjdFRvKSArICgrISFjb25maWcubG9hZGVyKSAhPSAxKSB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgIGBSb3V0ZSBjb25maWcgc2hvdWxkIGNvbnRhaW4gZXhhY3RseSBvbmUgXCJjb21wb25lbnRcIiwgXCJsb2FkZXJcIiwgb3IgXCJyZWRpcmVjdFRvXCIgcHJvcGVydHkuYCk7XG4gIH1cbiAgaWYgKGNvbmZpZy5hcyAmJiBjb25maWcubmFtZSkge1xuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBSb3V0ZSBjb25maWcgc2hvdWxkIGNvbnRhaW4gZXhhY3RseSBvbmUgXCJhc1wiIG9yIFwibmFtZVwiIHByb3BlcnR5LmApO1xuICB9XG4gIGlmIChjb25maWcuYXMpIHtcbiAgICBjb25maWcubmFtZSA9IGNvbmZpZy5hcztcbiAgfVxuICBpZiAoY29uZmlnLmxvYWRlcikge1xuICAgIHZhciB3cmFwcGVkTG9hZGVyID0gd3JhcExvYWRlclRvUmVjb25maWd1cmVSZWdpc3RyeShjb25maWcubG9hZGVyLCByZWdpc3RyeSk7XG4gICAgcmV0dXJuIG5ldyBBc3luY1JvdXRlKHtcbiAgICAgIHBhdGg6IGNvbmZpZy5wYXRoLFxuICAgICAgbG9hZGVyOiB3cmFwcGVkTG9hZGVyLFxuICAgICAgbmFtZTogY29uZmlnLm5hbWUsXG4gICAgICBkYXRhOiBjb25maWcuZGF0YSxcbiAgICAgIHVzZUFzRGVmYXVsdDogY29uZmlnLnVzZUFzRGVmYXVsdFxuICAgIH0pO1xuICB9XG4gIGlmIChjb25maWcuYXV4KSB7XG4gICAgcmV0dXJuIG5ldyBBdXhSb3V0ZSh7cGF0aDogY29uZmlnLmF1eCwgY29tcG9uZW50OjxUeXBlPmNvbmZpZy5jb21wb25lbnQsIG5hbWU6IGNvbmZpZy5uYW1lfSk7XG4gIH1cbiAgaWYgKGNvbmZpZy5jb21wb25lbnQpIHtcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5jb21wb25lbnQgPT0gJ29iamVjdCcpIHtcbiAgICAgIGxldCBjb21wb25lbnREZWZpbml0aW9uT2JqZWN0ID0gPENvbXBvbmVudERlZmluaXRpb24+Y29uZmlnLmNvbXBvbmVudDtcbiAgICAgIGlmIChjb21wb25lbnREZWZpbml0aW9uT2JqZWN0LnR5cGUgPT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgICByZXR1cm4gbmV3IFJvdXRlKHtcbiAgICAgICAgICBwYXRoOiBjb25maWcucGF0aCxcbiAgICAgICAgICBjb21wb25lbnQ6PFR5cGU+Y29tcG9uZW50RGVmaW5pdGlvbk9iamVjdC5jb25zdHJ1Y3RvcixcbiAgICAgICAgICBuYW1lOiBjb25maWcubmFtZSxcbiAgICAgICAgICBkYXRhOiBjb25maWcuZGF0YSxcbiAgICAgICAgICB1c2VBc0RlZmF1bHQ6IGNvbmZpZy51c2VBc0RlZmF1bHRcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKGNvbXBvbmVudERlZmluaXRpb25PYmplY3QudHlwZSA9PSAnbG9hZGVyJykge1xuICAgICAgICByZXR1cm4gbmV3IEFzeW5jUm91dGUoe1xuICAgICAgICAgIHBhdGg6IGNvbmZpZy5wYXRoLFxuICAgICAgICAgIGxvYWRlcjogY29tcG9uZW50RGVmaW5pdGlvbk9iamVjdC5sb2FkZXIsXG4gICAgICAgICAgbmFtZTogY29uZmlnLm5hbWUsXG4gICAgICAgICAgZGF0YTogY29uZmlnLmRhdGEsXG4gICAgICAgICAgdXNlQXNEZWZhdWx0OiBjb25maWcudXNlQXNEZWZhdWx0XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgICBgSW52YWxpZCBjb21wb25lbnQgdHlwZSBcIiR7Y29tcG9uZW50RGVmaW5pdGlvbk9iamVjdC50eXBlfVwiLiBWYWxpZCB0eXBlcyBhcmUgXCJjb25zdHJ1Y3RvclwiIGFuZCBcImxvYWRlclwiLmApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFJvdXRlKDx7XG4gICAgICBwYXRoOiBzdHJpbmc7XG4gICAgICBjb21wb25lbnQ6IFR5cGUgfCBDb21wb25lbnRGYWN0b3J5O1xuICAgICAgbmFtZT86IHN0cmluZztcbiAgICAgIGRhdGE/OiB7W2tleTogc3RyaW5nXTogYW55fTtcbiAgICAgIHVzZUFzRGVmYXVsdD86IGJvb2xlYW47XG4gICAgfT5jb25maWcpO1xuICB9XG5cbiAgaWYgKGNvbmZpZy5yZWRpcmVjdFRvKSB7XG4gICAgcmV0dXJuIG5ldyBSZWRpcmVjdCh7cGF0aDogY29uZmlnLnBhdGgsIHJlZGlyZWN0VG86IGNvbmZpZy5yZWRpcmVjdFRvfSk7XG4gIH1cblxuICByZXR1cm4gY29uZmlnO1xufVxuXG5cbmZ1bmN0aW9uIHdyYXBMb2FkZXJUb1JlY29uZmlndXJlUmVnaXN0cnkobG9hZGVyOiBGdW5jdGlvbiwgcmVnaXN0cnk6IFJvdXRlUmVnaXN0cnkpOiAoKSA9PlxuICAgIFByb21pc2U8VHlwZT4ge1xuICByZXR1cm4gKCkgPT4ge1xuICAgIHJldHVybiBsb2FkZXIoKS50aGVuKChjb21wb25lbnRUeXBlKSA9PiB7XG4gICAgICByZWdpc3RyeS5jb25maWdGcm9tQ29tcG9uZW50KGNvbXBvbmVudFR5cGUpO1xuICAgICAgcmV0dXJuIGNvbXBvbmVudFR5cGU7XG4gICAgfSk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRDb21wb25lbnRFeGlzdHMoY29tcG9uZW50OiBUeXBlIHwgQ29tcG9uZW50RmFjdG9yeSwgcGF0aDogc3RyaW5nKTogdm9pZCB7XG4gIGlmICghaXNUeXBlKGNvbXBvbmVudCkgJiYgIShjb21wb25lbnQgaW5zdGFuY2VvZiBDb21wb25lbnRGYWN0b3J5KSkge1xuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDb21wb25lbnQgZm9yIHJvdXRlIFwiJHtwYXRofVwiIGlzIG5vdCBkZWZpbmVkLCBvciBpcyBub3QgYSBjbGFzcy5gKTtcbiAgfVxufVxuIl19