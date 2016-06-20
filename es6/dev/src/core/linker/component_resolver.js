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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X3Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ZODdXMzRUdC50bXAvYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2NvbXBvbmVudF9yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtPQUN4QyxFQUFPLE9BQU8sRUFBWSxTQUFTLEVBQUMsTUFBTSwwQkFBMEI7T0FDcEUsRUFBQyxhQUFhLEVBQUUsYUFBYSxFQUFDLE1BQU0sZ0NBQWdDO09BQ3BFLEVBQUMsY0FBYyxFQUFDLE1BQU0sMkJBQTJCO09BQ2pELEVBQUMsU0FBUyxFQUFDLE1BQU0seUNBQXlDO09BQzFELEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUI7QUFHcEQ7OztHQUdHO0FBQ0g7QUFLQSxDQUFDO0FBRUQsNkJBQTZCLElBQVM7SUFDcEMsTUFBTSxDQUFDLElBQUksWUFBWSxnQkFBZ0IsQ0FBQztBQUMxQyxDQUFDO0FBR0QsaUZBQWdELGlCQUFpQjtJQUMvRCxnQkFBZ0IsQ0FBQyxhQUFtQjtRQUNsQyxJQUFJLFNBQVMsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3JELElBQUksZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBRTNELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixNQUFNLElBQUksYUFBYSxDQUFDLDRCQUE0QixTQUFTLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3hGLENBQUM7UUFDRCxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxxQkFBcUIsQ0FBQyxjQUFvQixFQUFFLGNBQXNCO1FBQ2hFLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRUQsVUFBVSxLQUFJLENBQUM7QUFDakIsQ0FBQztBQWpCRDtJQUFDLFVBQVUsRUFBRTs7OEJBQUE7QUFpQloiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7VHlwZSwgaXNCbGFuaywgaXNTdHJpbmcsIHN0cmluZ2lmeX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgdW5pbXBsZW1lbnRlZH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7UHJvbWlzZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5pbXBvcnQge0NvbXBvbmVudEZhY3Rvcnl9IGZyb20gJy4vY29tcG9uZW50X2ZhY3RvcnknO1xuaW1wb3J0IHtDb2RlZ2VuSW5qZWN0b3JGYWN0b3J5fSBmcm9tICcuL2luamVjdG9yX2ZhY3RvcnknO1xuXG4vKipcbiAqIExvdy1sZXZlbCBzZXJ2aWNlIGZvciBsb2FkaW5nIHtAbGluayBDb21wb25lbnRGYWN0b3J5fXMsIHdoaWNoXG4gKiBjYW4gbGF0ZXIgYmUgdXNlZCB0byBjcmVhdGUgYW5kIHJlbmRlciBhIENvbXBvbmVudCBpbnN0YW5jZS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbXBvbmVudFJlc29sdmVyIHtcbiAgYWJzdHJhY3QgcmVzb2x2ZUNvbXBvbmVudChjb21wb25lbnRUeXBlOiBUeXBlKTogUHJvbWlzZTxDb21wb25lbnRGYWN0b3J5PjtcbiAgYWJzdHJhY3QgY3JlYXRlSW5qZWN0b3JGYWN0b3J5KGluamVjdG9yTW9kdWxlOiBUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0cmFQcm92aWRlcnM/OiBhbnlbXSk6IENvZGVnZW5JbmplY3RvckZhY3Rvcnk8YW55PjtcbiAgYWJzdHJhY3QgY2xlYXJDYWNoZSgpO1xufVxuXG5mdW5jdGlvbiBfaXNDb21wb25lbnRGYWN0b3J5KHR5cGU6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gdHlwZSBpbnN0YW5jZW9mIENvbXBvbmVudEZhY3Rvcnk7XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSZWZsZWN0b3JDb21wb25lbnRSZXNvbHZlciBleHRlbmRzIENvbXBvbmVudFJlc29sdmVyIHtcbiAgcmVzb2x2ZUNvbXBvbmVudChjb21wb25lbnRUeXBlOiBUeXBlKTogUHJvbWlzZTxDb21wb25lbnRGYWN0b3J5PiB7XG4gICAgdmFyIG1ldGFkYXRhcyA9IHJlZmxlY3Rvci5hbm5vdGF0aW9ucyhjb21wb25lbnRUeXBlKTtcbiAgICB2YXIgY29tcG9uZW50RmFjdG9yeSA9IG1ldGFkYXRhcy5maW5kKF9pc0NvbXBvbmVudEZhY3RvcnkpO1xuXG4gICAgaWYgKGlzQmxhbmsoY29tcG9uZW50RmFjdG9yeSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBObyBwcmVjb21waWxlZCBjb21wb25lbnQgJHtzdHJpbmdpZnkoY29tcG9uZW50VHlwZSl9IGZvdW5kYCk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5yZXNvbHZlKGNvbXBvbmVudEZhY3RvcnkpO1xuICB9XG5cbiAgY3JlYXRlSW5qZWN0b3JGYWN0b3J5KGluamVjdG9yTW9kdWxlOiBUeXBlLCBleHRyYVByb3ZpZGVycz86IGFueVtdKTogQ29kZWdlbkluamVjdG9yRmFjdG9yeTxhbnk+IHtcbiAgICByZXR1cm4gdW5pbXBsZW1lbnRlZCgpO1xuICB9XG5cbiAgY2xlYXJDYWNoZSgpIHt9XG59XG4iXX0=