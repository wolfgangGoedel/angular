var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injector, THROW_IF_NOT_FOUND } from '../di/injector';
import { BaseException } from 'angular2/src/facade/exceptions';
import { isBlank, CONST_EXPR, CONST } from 'angular2/src/facade/lang';
const _UNDEFINED = CONST_EXPR(new Object());
export class CodegenInjector {
    constructor(parent, _needsMainModule, mainModule) {
        this.parent = parent;
        this.mainModule = mainModule;
        if (_needsMainModule && isBlank(mainModule)) {
            throw new BaseException('This injector needs a main module instance!');
        }
    }
    get(token, notFoundValue = THROW_IF_NOT_FOUND) {
        var result = this.getInternal(token, _UNDEFINED);
        return result === _UNDEFINED ? this.parent.get(token, notFoundValue) : result;
    }
}
export let CodegenInjectorFactory = class CodegenInjectorFactory {
    constructor(_injectorFactory) {
        this._injectorFactory = _injectorFactory;
    }
    create(parent = null, mainModule = null) {
        if (isBlank(parent)) {
            parent = Injector.NULL;
        }
        return this._injectorFactory(parent, mainModule);
    }
};
CodegenInjectorFactory = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Function])
], CodegenInjectorFactory);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0b3JfZmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtWTg3VzM0VHQudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9pbmplY3Rvcl9mYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsUUFBUSxFQUFFLGtCQUFrQixFQUFDLE1BQU0sZ0JBQWdCO09BQ3BELEVBQUMsYUFBYSxFQUFDLE1BQU0sZ0NBQWdDO09BQ3JELEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUMsTUFBTSwwQkFBMEI7QUFFbkUsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztBQUU1QztJQUNFLFlBQW1CLE1BQWdCLEVBQUUsZ0JBQWdCLEVBQVMsVUFBa0I7UUFBN0QsV0FBTSxHQUFOLE1BQU0sQ0FBVTtRQUEyQixlQUFVLEdBQVYsVUFBVSxDQUFRO1FBQzlFLEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUMsTUFBTSxJQUFJLGFBQWEsQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7SUFDSCxDQUFDO0lBRUQsR0FBRyxDQUFDLEtBQVUsRUFBRSxhQUFhLEdBQVEsa0JBQWtCO1FBQ3JELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sQ0FBQyxNQUFNLEtBQUssVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxhQUFhLENBQUMsR0FBRyxNQUFNLENBQUM7SUFDaEYsQ0FBQztBQUdILENBQUM7QUFHRDtJQUNFLFlBQW9CLGdCQUFvRTtRQUFwRSxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW9EO0lBQUcsQ0FBQztJQUU1RixNQUFNLENBQUMsTUFBTSxHQUFhLElBQUksRUFBRSxVQUFVLEdBQVcsSUFBSTtRQUN2RCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLE1BQU0sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ3pCLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNuRCxDQUFDO0FBQ0gsQ0FBQztBQVZEO0lBQUMsS0FBSyxFQUFFOzswQkFBQTtBQVVQIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RvciwgVEhST1dfSUZfTk9UX0ZPVU5EfSBmcm9tICcuLi9kaS9pbmplY3Rvcic7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge2lzQmxhbmssIENPTlNUX0VYUFIsIENPTlNUfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5jb25zdCBfVU5ERUZJTkVEID0gQ09OU1RfRVhQUihuZXcgT2JqZWN0KCkpO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29kZWdlbkluamVjdG9yPE1PRFVMRT4gaW1wbGVtZW50cyBJbmplY3RvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwYXJlbnQ6IEluamVjdG9yLCBfbmVlZHNNYWluTW9kdWxlLCBwdWJsaWMgbWFpbk1vZHVsZTogTU9EVUxFKSB7XG4gICAgaWYgKF9uZWVkc01haW5Nb2R1bGUgJiYgaXNCbGFuayhtYWluTW9kdWxlKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ1RoaXMgaW5qZWN0b3IgbmVlZHMgYSBtYWluIG1vZHVsZSBpbnN0YW5jZSEnKTtcbiAgICB9XG4gIH1cblxuICBnZXQodG9rZW46IGFueSwgbm90Rm91bmRWYWx1ZTogYW55ID0gVEhST1dfSUZfTk9UX0ZPVU5EKTogYW55IHtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5nZXRJbnRlcm5hbCh0b2tlbiwgX1VOREVGSU5FRCk7XG4gICAgcmV0dXJuIHJlc3VsdCA9PT0gX1VOREVGSU5FRCA/IHRoaXMucGFyZW50LmdldCh0b2tlbiwgbm90Rm91bmRWYWx1ZSkgOiByZXN1bHQ7XG4gIH1cblxuICBhYnN0cmFjdCBnZXRJbnRlcm5hbCh0b2tlbjogYW55LCBub3RGb3VuZFZhbHVlOiBhbnkpOiBhbnk7XG59XG5cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQ29kZWdlbkluamVjdG9yRmFjdG9yeTxNT0RVTEU+IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfaW5qZWN0b3JGYWN0b3J5OiAocGFyZW50OiBJbmplY3RvciwgbWFpbk1vZHVsZTogTU9EVUxFKSA9PiBJbmplY3Rvcikge31cblxuICBjcmVhdGUocGFyZW50OiBJbmplY3RvciA9IG51bGwsIG1haW5Nb2R1bGU6IE1PRFVMRSA9IG51bGwpOiBJbmplY3RvciB7XG4gICAgaWYgKGlzQmxhbmsocGFyZW50KSkge1xuICAgICAgcGFyZW50ID0gSW5qZWN0b3IuTlVMTDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2luamVjdG9yRmFjdG9yeShwYXJlbnQsIG1haW5Nb2R1bGUpO1xuICB9XG59XG4iXX0=