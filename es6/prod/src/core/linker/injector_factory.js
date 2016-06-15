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
export let InjectorFactory = class InjectorFactory {
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
InjectorFactory = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Function])
], InjectorFactory);
