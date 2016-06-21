'use strict';"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var injector_1 = require('../di/injector');
var exceptions_1 = require('angular2/src/facade/exceptions');
var lang_1 = require('angular2/src/facade/lang');
var _UNDEFINED = lang_1.CONST_EXPR(new Object());
var CodegenInjector = (function () {
    function CodegenInjector(parent, _needsMainModule, mainModule) {
        this.parent = parent;
        this.mainModule = mainModule;
        if (_needsMainModule && lang_1.isBlank(mainModule)) {
            throw new exceptions_1.BaseException('This injector needs a main module instance!');
        }
    }
    CodegenInjector.prototype.get = function (token, notFoundValue) {
        if (notFoundValue === void 0) { notFoundValue = injector_1.THROW_IF_NOT_FOUND; }
        var result = this.getInternal(token, _UNDEFINED);
        return result === _UNDEFINED ? this.parent.get(token, notFoundValue) : result;
    };
    return CodegenInjector;
}());
exports.CodegenInjector = CodegenInjector;
var CodegenInjectorFactory = (function () {
    function CodegenInjectorFactory(_injectorFactory) {
        this._injectorFactory = _injectorFactory;
    }
    CodegenInjectorFactory.prototype.create = function (parent, mainModule) {
        if (parent === void 0) { parent = null; }
        if (mainModule === void 0) { mainModule = null; }
        if (lang_1.isBlank(parent)) {
            parent = injector_1.Injector.NULL;
        }
        return this._injectorFactory(parent, mainModule);
    };
    CodegenInjectorFactory = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Function])
    ], CodegenInjectorFactory);
    return CodegenInjectorFactory;
}());
exports.CodegenInjectorFactory = CodegenInjectorFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0b3JfZmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtbGI3ZmVCcnoudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9pbmplY3Rvcl9mYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSx5QkFBMkMsZ0JBQWdCLENBQUMsQ0FBQTtBQUM1RCwyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RCxxQkFBeUMsMEJBQTBCLENBQUMsQ0FBQTtBQUVwRSxJQUFNLFVBQVUsR0FBRyxpQkFBVSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztBQUU1QztJQUNFLHlCQUFtQixNQUFnQixFQUFFLGdCQUFnQixFQUFTLFVBQWtCO1FBQTdELFdBQU0sR0FBTixNQUFNLENBQVU7UUFBMkIsZUFBVSxHQUFWLFVBQVUsQ0FBUTtRQUM5RSxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsSUFBSSxjQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVDLE1BQU0sSUFBSSwwQkFBYSxDQUFDLDZDQUE2QyxDQUFDLENBQUM7UUFDekUsQ0FBQztJQUNILENBQUM7SUFFRCw2QkFBRyxHQUFILFVBQUksS0FBVSxFQUFFLGFBQXVDO1FBQXZDLDZCQUF1QyxHQUF2Qyw2Q0FBdUM7UUFDckQsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDakQsTUFBTSxDQUFDLE1BQU0sS0FBSyxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxHQUFHLE1BQU0sQ0FBQztJQUNoRixDQUFDO0lBR0gsc0JBQUM7QUFBRCxDQUFDLEFBYkQsSUFhQztBQWJxQix1QkFBZSxrQkFhcEMsQ0FBQTtBQUdEO0lBQ0UsZ0NBQW9CLGdCQUFvRTtRQUFwRSxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW9EO0lBQUcsQ0FBQztJQUU1Rix1Q0FBTSxHQUFOLFVBQU8sTUFBdUIsRUFBRSxVQUF5QjtRQUFsRCxzQkFBdUIsR0FBdkIsYUFBdUI7UUFBRSwwQkFBeUIsR0FBekIsaUJBQXlCO1FBQ3ZELEVBQUUsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsTUFBTSxHQUFHLG1CQUFRLENBQUMsSUFBSSxDQUFDO1FBQ3pCLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBVEg7UUFBQyxZQUFLLEVBQUU7OzhCQUFBO0lBVVIsNkJBQUM7QUFBRCxDQUFDLEFBVEQsSUFTQztBQVRZLDhCQUFzQix5QkFTbEMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0b3IsIFRIUk9XX0lGX05PVF9GT1VORH0gZnJvbSAnLi4vZGkvaW5qZWN0b3InO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtpc0JsYW5rLCBDT05TVF9FWFBSLCBDT05TVH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuY29uc3QgX1VOREVGSU5FRCA9IENPTlNUX0VYUFIobmV3IE9iamVjdCgpKTtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvZGVnZW5JbmplY3RvcjxNT0RVTEU+IGltcGxlbWVudHMgSW5qZWN0b3Ige1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcGFyZW50OiBJbmplY3RvciwgX25lZWRzTWFpbk1vZHVsZSwgcHVibGljIG1haW5Nb2R1bGU6IE1PRFVMRSkge1xuICAgIGlmIChfbmVlZHNNYWluTW9kdWxlICYmIGlzQmxhbmsobWFpbk1vZHVsZSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdUaGlzIGluamVjdG9yIG5lZWRzIGEgbWFpbiBtb2R1bGUgaW5zdGFuY2UhJyk7XG4gICAgfVxuICB9XG5cbiAgZ2V0KHRva2VuOiBhbnksIG5vdEZvdW5kVmFsdWU6IGFueSA9IFRIUk9XX0lGX05PVF9GT1VORCk6IGFueSB7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMuZ2V0SW50ZXJuYWwodG9rZW4sIF9VTkRFRklORUQpO1xuICAgIHJldHVybiByZXN1bHQgPT09IF9VTkRFRklORUQgPyB0aGlzLnBhcmVudC5nZXQodG9rZW4sIG5vdEZvdW5kVmFsdWUpIDogcmVzdWx0O1xuICB9XG5cbiAgYWJzdHJhY3QgZ2V0SW50ZXJuYWwodG9rZW46IGFueSwgbm90Rm91bmRWYWx1ZTogYW55KTogYW55O1xufVxuXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIENvZGVnZW5JbmplY3RvckZhY3Rvcnk8TU9EVUxFPiB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2luamVjdG9yRmFjdG9yeTogKHBhcmVudDogSW5qZWN0b3IsIG1haW5Nb2R1bGU6IE1PRFVMRSkgPT4gSW5qZWN0b3IpIHt9XG5cbiAgY3JlYXRlKHBhcmVudDogSW5qZWN0b3IgPSBudWxsLCBtYWluTW9kdWxlOiBNT0RVTEUgPSBudWxsKTogSW5qZWN0b3Ige1xuICAgIGlmIChpc0JsYW5rKHBhcmVudCkpIHtcbiAgICAgIHBhcmVudCA9IEluamVjdG9yLk5VTEw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9pbmplY3RvckZhY3RvcnkocGFyZW50LCBtYWluTW9kdWxlKTtcbiAgfVxufVxuIl19