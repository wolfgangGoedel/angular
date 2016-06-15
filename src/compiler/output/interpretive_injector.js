'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var injector_factory_1 = require('angular2/src/core/linker/injector_factory');
var exceptions_1 = require('angular2/src/facade/exceptions');
var InterpretiveInjectorInstanceFactory = (function () {
    function InterpretiveInjectorInstanceFactory() {
    }
    InterpretiveInjectorInstanceFactory.prototype.createInstance = function (superClass, clazz, args, props, getters, methods) {
        if (superClass === injector_factory_1.CodegenInjector) {
            return new _InterpretiveInjector(args, clazz, props, getters, methods);
        }
        throw new exceptions_1.BaseException("Can't instantiate class " + superClass + " in interpretative mode");
    };
    return InterpretiveInjectorInstanceFactory;
}());
exports.InterpretiveInjectorInstanceFactory = InterpretiveInjectorInstanceFactory;
var _InterpretiveInjector = (function (_super) {
    __extends(_InterpretiveInjector, _super);
    function _InterpretiveInjector(args, clazz, props, getters, methods) {
        _super.call(this, args[0], args[1], args[2]);
        this.clazz = clazz;
        this.props = props;
        this.getters = getters;
        this.methods = methods;
    }
    _InterpretiveInjector.prototype.getInternal = function (token, notFoundResult) {
        var m = this.methods.get('getInternal');
        return m(token, notFoundResult);
    };
    return _InterpretiveInjector;
}(injector_factory_1.CodegenInjector));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJwcmV0aXZlX2luamVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1lZzlxbFZ3WC50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL291dHB1dC9pbnRlcnByZXRpdmVfaW5qZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsaUNBQThCLDJDQUEyQyxDQUFDLENBQUE7QUFDMUUsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFJN0Q7SUFBQTtJQVFBLENBQUM7SUFQQyw0REFBYyxHQUFkLFVBQWUsVUFBZSxFQUFFLEtBQVUsRUFBRSxJQUFXLEVBQUUsS0FBdUIsRUFDakUsT0FBOEIsRUFBRSxPQUE4QjtRQUMzRSxFQUFFLENBQUMsQ0FBQyxVQUFVLEtBQUssa0NBQWUsQ0FBQyxDQUFDLENBQUM7WUFDbkMsTUFBTSxDQUFDLElBQUkscUJBQXFCLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFDRCxNQUFNLElBQUksMEJBQWEsQ0FBQyw2QkFBMkIsVUFBVSw0QkFBeUIsQ0FBQyxDQUFDO0lBQzFGLENBQUM7SUFDSCwwQ0FBQztBQUFELENBQUMsQUFSRCxJQVFDO0FBUlksMkNBQW1DLHNDQVEvQyxDQUFBO0FBRUQ7SUFBb0MseUNBQW9CO0lBQ3RELCtCQUFZLElBQVcsRUFBUyxLQUFVLEVBQVMsS0FBdUIsRUFDdkQsT0FBOEIsRUFBUyxPQUE4QjtRQUN0RixrQkFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRkgsVUFBSyxHQUFMLEtBQUssQ0FBSztRQUFTLFVBQUssR0FBTCxLQUFLLENBQWtCO1FBQ3ZELFlBQU8sR0FBUCxPQUFPLENBQXVCO1FBQVMsWUFBTyxHQUFQLE9BQU8sQ0FBdUI7SUFFeEYsQ0FBQztJQUNELDJDQUFXLEdBQVgsVUFBWSxLQUFVLEVBQUUsY0FBbUI7UUFDekMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDeEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUNILDRCQUFDO0FBQUQsQ0FBQyxBQVRELENBQW9DLGtDQUFlLEdBU2xEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb2RlZ2VuSW5qZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9pbmplY3Rvcl9mYWN0b3J5JztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcblxuaW1wb3J0IHtJbnN0YW5jZUZhY3RvcnksIER5bmFtaWNJbnN0YW5jZX0gZnJvbSAnLi9vdXRwdXRfaW50ZXJwcmV0ZXInO1xuXG5leHBvcnQgY2xhc3MgSW50ZXJwcmV0aXZlSW5qZWN0b3JJbnN0YW5jZUZhY3RvcnkgaW1wbGVtZW50cyBJbnN0YW5jZUZhY3Rvcnkge1xuICBjcmVhdGVJbnN0YW5jZShzdXBlckNsYXNzOiBhbnksIGNsYXp6OiBhbnksIGFyZ3M6IGFueVtdLCBwcm9wczogTWFwPHN0cmluZywgYW55PixcbiAgICAgICAgICAgICAgICAgZ2V0dGVyczogTWFwPHN0cmluZywgRnVuY3Rpb24+LCBtZXRob2RzOiBNYXA8c3RyaW5nLCBGdW5jdGlvbj4pOiBhbnkge1xuICAgIGlmIChzdXBlckNsYXNzID09PSBDb2RlZ2VuSW5qZWN0b3IpIHtcbiAgICAgIHJldHVybiBuZXcgX0ludGVycHJldGl2ZUluamVjdG9yKGFyZ3MsIGNsYXp6LCBwcm9wcywgZ2V0dGVycywgbWV0aG9kcyk7XG4gICAgfVxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDYW4ndCBpbnN0YW50aWF0ZSBjbGFzcyAke3N1cGVyQ2xhc3N9IGluIGludGVycHJldGF0aXZlIG1vZGVgKTtcbiAgfVxufVxuXG5jbGFzcyBfSW50ZXJwcmV0aXZlSW5qZWN0b3IgZXh0ZW5kcyBDb2RlZ2VuSW5qZWN0b3I8YW55PiBpbXBsZW1lbnRzIER5bmFtaWNJbnN0YW5jZSB7XG4gIGNvbnN0cnVjdG9yKGFyZ3M6IGFueVtdLCBwdWJsaWMgY2xheno6IGFueSwgcHVibGljIHByb3BzOiBNYXA8c3RyaW5nLCBhbnk+LFxuICAgICAgICAgICAgICBwdWJsaWMgZ2V0dGVyczogTWFwPHN0cmluZywgRnVuY3Rpb24+LCBwdWJsaWMgbWV0aG9kczogTWFwPHN0cmluZywgRnVuY3Rpb24+KSB7XG4gICAgc3VwZXIoYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSk7XG4gIH1cbiAgZ2V0SW50ZXJuYWwodG9rZW46IGFueSwgbm90Rm91bmRSZXN1bHQ6IGFueSk6IGFueSB7XG4gICAgdmFyIG0gPSB0aGlzLm1ldGhvZHMuZ2V0KCdnZXRJbnRlcm5hbCcpO1xuICAgIHJldHVybiBtKHRva2VuLCBub3RGb3VuZFJlc3VsdCk7XG4gIH1cbn1cbiJdfQ==