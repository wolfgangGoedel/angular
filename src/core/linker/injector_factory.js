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
var InjectorFactory = (function () {
    function InjectorFactory(_injectorFactory) {
        this._injectorFactory = _injectorFactory;
    }
    InjectorFactory.prototype.create = function (parent, mainModule) {
        if (parent === void 0) { parent = null; }
        if (mainModule === void 0) { mainModule = null; }
        if (lang_1.isBlank(parent)) {
            parent = injector_1.Injector.NULL;
        }
        return this._injectorFactory(parent, mainModule);
    };
    InjectorFactory = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Function])
    ], InjectorFactory);
    return InjectorFactory;
}());
exports.InjectorFactory = InjectorFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0b3JfZmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtaWdBMnNjbWEudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9pbmplY3Rvcl9mYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSx5QkFBMkMsZ0JBQWdCLENBQUMsQ0FBQTtBQUM1RCwyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RCxxQkFBeUMsMEJBQTBCLENBQUMsQ0FBQTtBQUVwRSxJQUFNLFVBQVUsR0FBRyxpQkFBVSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztBQUU1QztJQUNFLHlCQUFtQixNQUFnQixFQUFFLGdCQUFnQixFQUFTLFVBQWtCO1FBQTdELFdBQU0sR0FBTixNQUFNLENBQVU7UUFBMkIsZUFBVSxHQUFWLFVBQVUsQ0FBUTtRQUM5RSxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsSUFBSSxjQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVDLE1BQU0sSUFBSSwwQkFBYSxDQUFDLDZDQUE2QyxDQUFDLENBQUM7UUFDekUsQ0FBQztJQUNILENBQUM7SUFFRCw2QkFBRyxHQUFILFVBQUksS0FBVSxFQUFFLGFBQXVDO1FBQXZDLDZCQUF1QyxHQUF2Qyw2Q0FBdUM7UUFDckQsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDakQsTUFBTSxDQUFDLE1BQU0sS0FBSyxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxHQUFHLE1BQU0sQ0FBQztJQUNoRixDQUFDO0lBR0gsc0JBQUM7QUFBRCxDQUFDLEFBYkQsSUFhQztBQWJxQix1QkFBZSxrQkFhcEMsQ0FBQTtBQUdEO0lBQ0UseUJBQW9CLGdCQUFvRTtRQUFwRSxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW9EO0lBQUcsQ0FBQztJQUU1RixnQ0FBTSxHQUFOLFVBQU8sTUFBdUIsRUFBRSxVQUF5QjtRQUFsRCxzQkFBdUIsR0FBdkIsYUFBdUI7UUFBRSwwQkFBeUIsR0FBekIsaUJBQXlCO1FBQ3ZELEVBQUUsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsTUFBTSxHQUFHLG1CQUFRLENBQUMsSUFBSSxDQUFDO1FBQ3pCLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBVEg7UUFBQyxZQUFLLEVBQUU7O3VCQUFBO0lBVVIsc0JBQUM7QUFBRCxDQUFDLEFBVEQsSUFTQztBQVRZLHVCQUFlLGtCQVMzQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RvciwgVEhST1dfSUZfTk9UX0ZPVU5EfSBmcm9tICcuLi9kaS9pbmplY3Rvcic7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge2lzQmxhbmssIENPTlNUX0VYUFIsIENPTlNUfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5jb25zdCBfVU5ERUZJTkVEID0gQ09OU1RfRVhQUihuZXcgT2JqZWN0KCkpO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29kZWdlbkluamVjdG9yPE1PRFVMRT4gaW1wbGVtZW50cyBJbmplY3RvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwYXJlbnQ6IEluamVjdG9yLCBfbmVlZHNNYWluTW9kdWxlLCBwdWJsaWMgbWFpbk1vZHVsZTogTU9EVUxFKSB7XG4gICAgaWYgKF9uZWVkc01haW5Nb2R1bGUgJiYgaXNCbGFuayhtYWluTW9kdWxlKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ1RoaXMgaW5qZWN0b3IgbmVlZHMgYSBtYWluIG1vZHVsZSBpbnN0YW5jZSEnKTtcbiAgICB9XG4gIH1cblxuICBnZXQodG9rZW46IGFueSwgbm90Rm91bmRWYWx1ZTogYW55ID0gVEhST1dfSUZfTk9UX0ZPVU5EKTogYW55IHtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5nZXRJbnRlcm5hbCh0b2tlbiwgX1VOREVGSU5FRCk7XG4gICAgcmV0dXJuIHJlc3VsdCA9PT0gX1VOREVGSU5FRCA/IHRoaXMucGFyZW50LmdldCh0b2tlbiwgbm90Rm91bmRWYWx1ZSkgOiByZXN1bHQ7XG4gIH1cblxuICBhYnN0cmFjdCBnZXRJbnRlcm5hbCh0b2tlbjogYW55LCBub3RGb3VuZFZhbHVlOiBhbnkpOiBhbnk7XG59XG5cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgSW5qZWN0b3JGYWN0b3J5PE1PRFVMRT4ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9pbmplY3RvckZhY3Rvcnk6IChwYXJlbnQ6IEluamVjdG9yLCBtYWluTW9kdWxlOiBNT0RVTEUpID0+IEluamVjdG9yKSB7fVxuXG4gIGNyZWF0ZShwYXJlbnQ6IEluamVjdG9yID0gbnVsbCwgbWFpbk1vZHVsZTogTU9EVUxFID0gbnVsbCk6IEluamVjdG9yIHtcbiAgICBpZiAoaXNCbGFuayhwYXJlbnQpKSB7XG4gICAgICBwYXJlbnQgPSBJbmplY3Rvci5OVUxMO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5faW5qZWN0b3JGYWN0b3J5KHBhcmVudCwgbWFpbk1vZHVsZSk7XG4gIH1cbn1cbiJdfQ==