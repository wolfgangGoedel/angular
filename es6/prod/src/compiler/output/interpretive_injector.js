import { CodegenInjector } from 'angular2/src/core/linker/injector_factory';
import { BaseException } from 'angular2/src/facade/exceptions';
export class InterpretiveInjectorInstanceFactory {
    createInstance(superClass, clazz, args, props, getters, methods) {
        if (superClass === CodegenInjector) {
            return new _InterpretiveInjector(args, clazz, props, getters, methods);
        }
        throw new BaseException(`Can't instantiate class ${superClass} in interpretative mode`);
    }
}
class _InterpretiveInjector extends CodegenInjector {
    constructor(args, clazz, props, getters, methods) {
        super(args[0], args[1], args[2]);
        this.clazz = clazz;
        this.props = props;
        this.getters = getters;
        this.methods = methods;
    }
    getInternal(token, notFoundResult) {
        var m = this.methods.get('getInternal');
        return m(token, notFoundResult);
    }
}
