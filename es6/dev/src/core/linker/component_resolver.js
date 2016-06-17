var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
import { isBlank, stringify } from 'angular2/src/facade/lang';
import { BaseException, unimplemented } from 'angular2/src/facade/exceptions';
import { PromiseWrapper } from 'angular2/src/facade/async';
import { reflector } from 'angular2/src/core/reflection/reflection';
import { ComponentFactory } from './component_factory';
/**
 * Low-level service for loading {@link ComponentFactory}s, which
 * can later be used to create and render a Component instance.
 */
export class ComponentResolver {
}
function _isComponentFactory(type) {
    return type instanceof ComponentFactory;
}
export let ReflectorComponentResolver = class ReflectorComponentResolver extends ComponentResolver {
    resolveComponent(componentType) {
        var metadatas = reflector.annotations(componentType);
        var componentFactory = metadatas.find(_isComponentFactory);
        if (isBlank(componentFactory)) {
            throw new BaseException(`No precompiled component ${stringify(componentType)} found`);
        }
        return PromiseWrapper.resolve(componentFactory);
    }
    createInjectorFactory(injectorModule, extraProviders) {
        return unimplemented();
    }
    clearCache() { }
};
ReflectorComponentResolver = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], ReflectorComponentResolver);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X3Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1odEZ0S1pIai50bXAvYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2NvbXBvbmVudF9yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtPQUN4QyxFQUFPLE9BQU8sRUFBWSxTQUFTLEVBQUMsTUFBTSwwQkFBMEI7T0FDcEUsRUFBQyxhQUFhLEVBQUUsYUFBYSxFQUFDLE1BQU0sZ0NBQWdDO09BQ3BFLEVBQUMsY0FBYyxFQUFDLE1BQU0sMkJBQTJCO09BQ2pELEVBQUMsU0FBUyxFQUFDLE1BQU0seUNBQXlDO09BQzFELEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUI7QUFHcEQ7OztHQUdHO0FBQ0g7QUFLQSxDQUFDO0FBRUQsNkJBQTZCLElBQVM7SUFDcEMsTUFBTSxDQUFDLElBQUksWUFBWSxnQkFBZ0IsQ0FBQztBQUMxQyxDQUFDO0FBR0QsaUZBQWdELGlCQUFpQjtJQUMvRCxnQkFBZ0IsQ0FBQyxhQUFtQjtRQUNsQyxJQUFJLFNBQVMsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3JELElBQUksZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBRTNELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixNQUFNLElBQUksYUFBYSxDQUFDLDRCQUE0QixTQUFTLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3hGLENBQUM7UUFDRCxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxxQkFBcUIsQ0FBQyxjQUFvQixFQUFFLGNBQXNCO1FBQ2hFLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRUQsVUFBVSxLQUFJLENBQUM7QUFDakIsQ0FBQztBQWpCRDtJQUFDLFVBQVUsRUFBRTs7OEJBQUE7QUFpQloiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7VHlwZSwgaXNCbGFuaywgaXNTdHJpbmcsIHN0cmluZ2lmeX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgdW5pbXBsZW1lbnRlZH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7UHJvbWlzZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5pbXBvcnQge0NvbXBvbmVudEZhY3Rvcnl9IGZyb20gJy4vY29tcG9uZW50X2ZhY3RvcnknO1xuaW1wb3J0IHtJbmplY3RvckZhY3Rvcnl9IGZyb20gJy4vaW5qZWN0b3JfZmFjdG9yeSc7XG5cbi8qKlxuICogTG93LWxldmVsIHNlcnZpY2UgZm9yIGxvYWRpbmcge0BsaW5rIENvbXBvbmVudEZhY3Rvcnl9cywgd2hpY2hcbiAqIGNhbiBsYXRlciBiZSB1c2VkIHRvIGNyZWF0ZSBhbmQgcmVuZGVyIGEgQ29tcG9uZW50IGluc3RhbmNlLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcG9uZW50UmVzb2x2ZXIge1xuICBhYnN0cmFjdCByZXNvbHZlQ29tcG9uZW50KGNvbXBvbmVudFR5cGU6IFR5cGUpOiBQcm9taXNlPENvbXBvbmVudEZhY3Rvcnk+O1xuICBhYnN0cmFjdCBjcmVhdGVJbmplY3RvckZhY3RvcnkoaW5qZWN0b3JNb2R1bGU6IFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRyYVByb3ZpZGVycz86IGFueVtdKTogSW5qZWN0b3JGYWN0b3J5PGFueT47XG4gIGFic3RyYWN0IGNsZWFyQ2FjaGUoKTtcbn1cblxuZnVuY3Rpb24gX2lzQ29tcG9uZW50RmFjdG9yeSh0eXBlOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGUgaW5zdGFuY2VvZiBDb21wb25lbnRGYWN0b3J5O1xufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUmVmbGVjdG9yQ29tcG9uZW50UmVzb2x2ZXIgZXh0ZW5kcyBDb21wb25lbnRSZXNvbHZlciB7XG4gIHJlc29sdmVDb21wb25lbnQoY29tcG9uZW50VHlwZTogVHlwZSk6IFByb21pc2U8Q29tcG9uZW50RmFjdG9yeT4ge1xuICAgIHZhciBtZXRhZGF0YXMgPSByZWZsZWN0b3IuYW5ub3RhdGlvbnMoY29tcG9uZW50VHlwZSk7XG4gICAgdmFyIGNvbXBvbmVudEZhY3RvcnkgPSBtZXRhZGF0YXMuZmluZChfaXNDb21wb25lbnRGYWN0b3J5KTtcblxuICAgIGlmIChpc0JsYW5rKGNvbXBvbmVudEZhY3RvcnkpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgTm8gcHJlY29tcGlsZWQgY29tcG9uZW50ICR7c3RyaW5naWZ5KGNvbXBvbmVudFR5cGUpfSBmb3VuZGApO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZShjb21wb25lbnRGYWN0b3J5KTtcbiAgfVxuXG4gIGNyZWF0ZUluamVjdG9yRmFjdG9yeShpbmplY3Rvck1vZHVsZTogVHlwZSwgZXh0cmFQcm92aWRlcnM/OiBhbnlbXSk6IEluamVjdG9yRmFjdG9yeTxhbnk+IHtcbiAgICByZXR1cm4gdW5pbXBsZW1lbnRlZCgpO1xuICB9XG5cbiAgY2xlYXJDYWNoZSgpIHt9XG59XG4iXX0=