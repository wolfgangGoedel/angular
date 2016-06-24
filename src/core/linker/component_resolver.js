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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X3Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1BT2FjbVk4VC50bXAvYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2NvbXBvbmVudF9yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUNoRCxxQkFBaUQsMEJBQTBCLENBQUMsQ0FBQTtBQUM1RSwyQkFBMkMsZ0NBQWdDLENBQUMsQ0FBQTtBQUM1RSxzQkFBNkIsMkJBQTJCLENBQUMsQ0FBQTtBQUN6RCwyQkFBd0IseUNBQXlDLENBQUMsQ0FBQTtBQUNsRSxrQ0FBK0IscUJBQXFCLENBQUMsQ0FBQTtBQUdyRDs7O0dBR0c7QUFDSDtJQUFBO0lBS0EsQ0FBQztJQUFELHdCQUFDO0FBQUQsQ0FBQyxBQUxELElBS0M7QUFMcUIseUJBQWlCLG9CQUt0QyxDQUFBO0FBRUQsNkJBQTZCLElBQVM7SUFDcEMsTUFBTSxDQUFDLElBQUksWUFBWSxvQ0FBZ0IsQ0FBQztBQUMxQyxDQUFDO0FBR0Q7SUFBZ0QsOENBQWlCO0lBQWpFO1FBQWdELDhCQUFpQjtJQWdCakUsQ0FBQztJQWZDLHFEQUFnQixHQUFoQixVQUFpQixhQUFtQjtRQUNsQyxJQUFJLFNBQVMsR0FBRyxzQkFBUyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNyRCxJQUFJLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUUzRCxFQUFFLENBQUMsQ0FBQyxjQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsTUFBTSxJQUFJLDBCQUFhLENBQUMsOEJBQTRCLGdCQUFTLENBQUMsYUFBYSxDQUFDLFdBQVEsQ0FBQyxDQUFDO1FBQ3hGLENBQUM7UUFDRCxNQUFNLENBQUMsc0JBQWMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQsMERBQXFCLEdBQXJCLFVBQXNCLGNBQW9CLEVBQUUsY0FBc0I7UUFDaEUsTUFBTSxDQUFDLDBCQUFhLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRUQsK0NBQVUsR0FBVixjQUFjLENBQUM7SUFoQmpCO1FBQUMsZUFBVSxFQUFFOztrQ0FBQTtJQWlCYixpQ0FBQztBQUFELENBQUMsQUFoQkQsQ0FBZ0QsaUJBQWlCLEdBZ0JoRTtBQWhCWSxrQ0FBMEIsNkJBZ0J0QyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1R5cGUsIGlzQmxhbmssIGlzU3RyaW5nLCBzdHJpbmdpZnl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIHVuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1Byb21pc2VXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtDb21wb25lbnRGYWN0b3J5fSBmcm9tICcuL2NvbXBvbmVudF9mYWN0b3J5JztcbmltcG9ydCB7Q29kZWdlbkluamVjdG9yRmFjdG9yeX0gZnJvbSAnLi9pbmplY3Rvcl9mYWN0b3J5JztcblxuLyoqXG4gKiBMb3ctbGV2ZWwgc2VydmljZSBmb3IgbG9hZGluZyB7QGxpbmsgQ29tcG9uZW50RmFjdG9yeX1zLCB3aGljaFxuICogY2FuIGxhdGVyIGJlIHVzZWQgdG8gY3JlYXRlIGFuZCByZW5kZXIgYSBDb21wb25lbnQgaW5zdGFuY2UuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21wb25lbnRSZXNvbHZlciB7XG4gIGFic3RyYWN0IHJlc29sdmVDb21wb25lbnQoY29tcG9uZW50VHlwZTogVHlwZSk6IFByb21pc2U8Q29tcG9uZW50RmFjdG9yeT47XG4gIGFic3RyYWN0IGNyZWF0ZUluamVjdG9yRmFjdG9yeShpbmplY3Rvck1vZHVsZTogVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dHJhUHJvdmlkZXJzPzogYW55W10pOiBDb2RlZ2VuSW5qZWN0b3JGYWN0b3J5PGFueT47XG4gIGFic3RyYWN0IGNsZWFyQ2FjaGUoKTtcbn1cblxuZnVuY3Rpb24gX2lzQ29tcG9uZW50RmFjdG9yeSh0eXBlOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGUgaW5zdGFuY2VvZiBDb21wb25lbnRGYWN0b3J5O1xufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUmVmbGVjdG9yQ29tcG9uZW50UmVzb2x2ZXIgZXh0ZW5kcyBDb21wb25lbnRSZXNvbHZlciB7XG4gIHJlc29sdmVDb21wb25lbnQoY29tcG9uZW50VHlwZTogVHlwZSk6IFByb21pc2U8Q29tcG9uZW50RmFjdG9yeT4ge1xuICAgIHZhciBtZXRhZGF0YXMgPSByZWZsZWN0b3IuYW5ub3RhdGlvbnMoY29tcG9uZW50VHlwZSk7XG4gICAgdmFyIGNvbXBvbmVudEZhY3RvcnkgPSBtZXRhZGF0YXMuZmluZChfaXNDb21wb25lbnRGYWN0b3J5KTtcblxuICAgIGlmIChpc0JsYW5rKGNvbXBvbmVudEZhY3RvcnkpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgTm8gcHJlY29tcGlsZWQgY29tcG9uZW50ICR7c3RyaW5naWZ5KGNvbXBvbmVudFR5cGUpfSBmb3VuZGApO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZShjb21wb25lbnRGYWN0b3J5KTtcbiAgfVxuXG4gIGNyZWF0ZUluamVjdG9yRmFjdG9yeShpbmplY3Rvck1vZHVsZTogVHlwZSwgZXh0cmFQcm92aWRlcnM/OiBhbnlbXSk6IENvZGVnZW5JbmplY3RvckZhY3Rvcnk8YW55PiB7XG4gICAgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTtcbiAgfVxuXG4gIGNsZWFyQ2FjaGUoKSB7fVxufVxuIl19