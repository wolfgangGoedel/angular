'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var async_1 = require('angular2/src/facade/async');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var component_factory_1 = require('./component_factory');
/**
 * Low-level service for loading {@link ComponentFactory}s, which
 * can later be used to create and render a Component instance.
 */
var ComponentResolver = (function () {
    function ComponentResolver() {
    }
    return ComponentResolver;
}());
exports.ComponentResolver = ComponentResolver;
function _isComponentFactory(type) {
    return type instanceof component_factory_1.ComponentFactory;
}
var ReflectorComponentResolver = (function (_super) {
    __extends(ReflectorComponentResolver, _super);
    function ReflectorComponentResolver() {
        _super.apply(this, arguments);
    }
    ReflectorComponentResolver.prototype.resolveComponent = function (componentType) {
        var metadatas = reflection_1.reflector.annotations(componentType);
        var componentFactory = metadatas.find(_isComponentFactory);
        if (lang_1.isBlank(componentFactory)) {
            throw new exceptions_1.BaseException("No precompiled component " + lang_1.stringify(componentType) + " found");
        }
        return async_1.PromiseWrapper.resolve(componentFactory);
    };
    ReflectorComponentResolver.prototype.createInjectorFactory = function (injectorModule, extraProviders) {
        return exceptions_1.unimplemented();
    };
    ReflectorComponentResolver.prototype.clearCache = function () { };
    ReflectorComponentResolver = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ReflectorComponentResolver);
    return ReflectorComponentResolver;
}(ComponentResolver));
exports.ReflectorComponentResolver = ReflectorComponentResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X3Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1pZ0Eyc2NtYS50bXAvYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2NvbXBvbmVudF9yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUNoRCxxQkFBaUQsMEJBQTBCLENBQUMsQ0FBQTtBQUM1RSwyQkFBMkMsZ0NBQWdDLENBQUMsQ0FBQTtBQUM1RSxzQkFBNkIsMkJBQTJCLENBQUMsQ0FBQTtBQUN6RCwyQkFBd0IseUNBQXlDLENBQUMsQ0FBQTtBQUNsRSxrQ0FBK0IscUJBQXFCLENBQUMsQ0FBQTtBQUdyRDs7O0dBR0c7QUFDSDtJQUFBO0lBS0EsQ0FBQztJQUFELHdCQUFDO0FBQUQsQ0FBQyxBQUxELElBS0M7QUFMcUIseUJBQWlCLG9CQUt0QyxDQUFBO0FBRUQsNkJBQTZCLElBQVM7SUFDcEMsTUFBTSxDQUFDLElBQUksWUFBWSxvQ0FBZ0IsQ0FBQztBQUMxQyxDQUFDO0FBR0Q7SUFBZ0QsOENBQWlCO0lBQWpFO1FBQWdELDhCQUFpQjtJQWdCakUsQ0FBQztJQWZDLHFEQUFnQixHQUFoQixVQUFpQixhQUFtQjtRQUNsQyxJQUFJLFNBQVMsR0FBRyxzQkFBUyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNyRCxJQUFJLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUUzRCxFQUFFLENBQUMsQ0FBQyxjQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsTUFBTSxJQUFJLDBCQUFhLENBQUMsOEJBQTRCLGdCQUFTLENBQUMsYUFBYSxDQUFDLFdBQVEsQ0FBQyxDQUFDO1FBQ3hGLENBQUM7UUFDRCxNQUFNLENBQUMsc0JBQWMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQsMERBQXFCLEdBQXJCLFVBQXNCLGNBQW9CLEVBQUUsY0FBc0I7UUFDaEUsTUFBTSxDQUFDLDBCQUFhLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRUQsK0NBQVUsR0FBVixjQUFjLENBQUM7SUFoQmpCO1FBQUMsZUFBVSxFQUFFOztrQ0FBQTtJQWlCYixpQ0FBQztBQUFELENBQUMsQUFoQkQsQ0FBZ0QsaUJBQWlCLEdBZ0JoRTtBQWhCWSxrQ0FBMEIsNkJBZ0J0QyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1R5cGUsIGlzQmxhbmssIGlzU3RyaW5nLCBzdHJpbmdpZnl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIHVuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1Byb21pc2VXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtDb21wb25lbnRGYWN0b3J5fSBmcm9tICcuL2NvbXBvbmVudF9mYWN0b3J5JztcbmltcG9ydCB7SW5qZWN0b3JGYWN0b3J5fSBmcm9tICcuL2luamVjdG9yX2ZhY3RvcnknO1xuXG4vKipcbiAqIExvdy1sZXZlbCBzZXJ2aWNlIGZvciBsb2FkaW5nIHtAbGluayBDb21wb25lbnRGYWN0b3J5fXMsIHdoaWNoXG4gKiBjYW4gbGF0ZXIgYmUgdXNlZCB0byBjcmVhdGUgYW5kIHJlbmRlciBhIENvbXBvbmVudCBpbnN0YW5jZS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbXBvbmVudFJlc29sdmVyIHtcbiAgYWJzdHJhY3QgcmVzb2x2ZUNvbXBvbmVudChjb21wb25lbnRUeXBlOiBUeXBlKTogUHJvbWlzZTxDb21wb25lbnRGYWN0b3J5PjtcbiAgYWJzdHJhY3QgY3JlYXRlSW5qZWN0b3JGYWN0b3J5KGluamVjdG9yTW9kdWxlOiBUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0cmFQcm92aWRlcnM/OiBhbnlbXSk6IEluamVjdG9yRmFjdG9yeTxhbnk+O1xuICBhYnN0cmFjdCBjbGVhckNhY2hlKCk7XG59XG5cbmZ1bmN0aW9uIF9pc0NvbXBvbmVudEZhY3RvcnkodHlwZTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiB0eXBlIGluc3RhbmNlb2YgQ29tcG9uZW50RmFjdG9yeTtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJlZmxlY3RvckNvbXBvbmVudFJlc29sdmVyIGV4dGVuZHMgQ29tcG9uZW50UmVzb2x2ZXIge1xuICByZXNvbHZlQ29tcG9uZW50KGNvbXBvbmVudFR5cGU6IFR5cGUpOiBQcm9taXNlPENvbXBvbmVudEZhY3Rvcnk+IHtcbiAgICB2YXIgbWV0YWRhdGFzID0gcmVmbGVjdG9yLmFubm90YXRpb25zKGNvbXBvbmVudFR5cGUpO1xuICAgIHZhciBjb21wb25lbnRGYWN0b3J5ID0gbWV0YWRhdGFzLmZpbmQoX2lzQ29tcG9uZW50RmFjdG9yeSk7XG5cbiAgICBpZiAoaXNCbGFuayhjb21wb25lbnRGYWN0b3J5KSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYE5vIHByZWNvbXBpbGVkIGNvbXBvbmVudCAke3N0cmluZ2lmeShjb21wb25lbnRUeXBlKX0gZm91bmRgKTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlc29sdmUoY29tcG9uZW50RmFjdG9yeSk7XG4gIH1cblxuICBjcmVhdGVJbmplY3RvckZhY3RvcnkoaW5qZWN0b3JNb2R1bGU6IFR5cGUsIGV4dHJhUHJvdmlkZXJzPzogYW55W10pOiBJbmplY3RvckZhY3Rvcnk8YW55PiB7XG4gICAgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTtcbiAgfVxuXG4gIGNsZWFyQ2FjaGUoKSB7fVxufVxuIl19