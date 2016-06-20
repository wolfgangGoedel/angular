'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var injector_1 = require('./injector');
/**
 * An simple injector based on a Map of values.
 */
var MapInjector = (function () {
    function MapInjector(_parent, values, factories) {
        if (_parent === void 0) { _parent = null; }
        if (values === void 0) { values = null; }
        if (factories === void 0) { factories = null; }
        this._parent = _parent;
        this._instances = new Map();
        if (lang_1.isBlank(values)) {
            values = new Map();
        }
        this._values = values;
        if (lang_1.isBlank(factories)) {
            factories = new Map();
        }
        this._factories = factories;
        if (lang_1.isBlank(this._parent)) {
            this._parent = injector_1.Injector.NULL;
        }
    }
    MapInjector.createFactory = function (values, factories) {
        return new MapInjectorFactory(values, factories);
    };
    MapInjector.prototype.get = function (token, notFoundValue) {
        if (notFoundValue === void 0) { notFoundValue = injector_1.THROW_IF_NOT_FOUND; }
        if (token === injector_1.Injector) {
            return this;
        }
        if (this._values.has(token)) {
            return this._values.get(token);
        }
        if (this._instances.has(token)) {
            return this._instances.get(token);
        }
        if (this._factories.has(token)) {
            var instance = this._factories.get(token)(this);
            this._instances.set(token, instance);
            return instance;
        }
        return this._parent.get(token, notFoundValue);
    };
    return MapInjector;
}());
exports.MapInjector = MapInjector;
/**
 * InjectorFactory for MapInjector.
 */
var MapInjectorFactory = (function () {
    function MapInjectorFactory(_values, _factories) {
        if (_values === void 0) { _values = null; }
        if (_factories === void 0) { _factories = null; }
        this._values = _values;
        this._factories = _factories;
    }
    MapInjectorFactory.prototype.create = function (parent, context) {
        if (parent === void 0) { parent = null; }
        if (context === void 0) { context = null; }
        return new MapInjector(parent, this._values, this._factories);
    };
    return MapInjectorFactory;
}());
exports.MapInjectorFactory = MapInjectorFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwX2luamVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1CSHNiUkpkMi50bXAvYW5ndWxhcjIvc3JjL2NvcmUvZGkvbWFwX2luamVjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxxQkFBc0IsMEJBQTBCLENBQUMsQ0FBQTtBQUNqRCx5QkFBNEQsWUFBWSxDQUFDLENBQUE7QUFFekU7O0dBRUc7QUFDSDtJQVVFLHFCQUFvQixPQUF3QixFQUFFLE1BQTRCLEVBQzlELFNBQXVEO1FBRHZELHVCQUFnQyxHQUFoQyxjQUFnQztRQUFFLHNCQUE0QixHQUE1QixhQUE0QjtRQUM5RCx5QkFBdUQsR0FBdkQsZ0JBQXVEO1FBRC9DLFlBQU8sR0FBUCxPQUFPLENBQWlCO1FBSnBDLGVBQVUsR0FBa0IsSUFBSSxHQUFHLEVBQVksQ0FBQztRQU10RCxFQUFFLENBQUMsQ0FBQyxjQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBWSxDQUFDO1FBQy9CLENBQUM7UUFDRCxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN0QixFQUFFLENBQUMsQ0FBQyxjQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBWSxDQUFDO1FBQ2xDLENBQUM7UUFDRCxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztRQUM1QixFQUFFLENBQUMsQ0FBQyxjQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFRLENBQUMsSUFBSSxDQUFDO1FBQy9CLENBQUM7SUFDSCxDQUFDO0lBdEJNLHlCQUFhLEdBQXBCLFVBQXFCLE1BQXNCLEVBQ3RCLFNBQWlEO1FBQ3BFLE1BQU0sQ0FBQyxJQUFJLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBb0JELHlCQUFHLEdBQUgsVUFBSSxLQUFVLEVBQUUsYUFBdUM7UUFBdkMsNkJBQXVDLEdBQXZDLDZDQUF1QztRQUNyRCxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssbUJBQVEsQ0FBQyxDQUFDLENBQUM7WUFDdkIsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxRQUFRLENBQUM7UUFDbEIsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUNILGtCQUFDO0FBQUQsQ0FBQyxBQXpDRCxJQXlDQztBQXpDWSxtQkFBVyxjQXlDdkIsQ0FBQTtBQUVEOztHQUVHO0FBQ0g7SUFDRSw0QkFBb0IsT0FBNkIsRUFDN0IsVUFBd0Q7UUFEaEUsdUJBQXFDLEdBQXJDLGNBQXFDO1FBQ3JDLDBCQUFnRSxHQUFoRSxpQkFBZ0U7UUFEeEQsWUFBTyxHQUFQLE9BQU8sQ0FBc0I7UUFDN0IsZUFBVSxHQUFWLFVBQVUsQ0FBOEM7SUFBRyxDQUFDO0lBRWhGLG1DQUFNLEdBQU4sVUFBTyxNQUF1QixFQUFFLE9BQW1CO1FBQTVDLHNCQUF1QixHQUF2QixhQUF1QjtRQUFFLHVCQUFtQixHQUFuQixjQUFtQjtRQUNqRCxNQUFNLENBQUMsSUFBSSxXQUFXLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFDSCx5QkFBQztBQUFELENBQUMsQUFQRCxJQU9DO0FBUFksMEJBQWtCLHFCQU85QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtJbmplY3RvciwgSW5qZWN0b3JGYWN0b3J5LCBUSFJPV19JRl9OT1RfRk9VTkR9IGZyb20gJy4vaW5qZWN0b3InO1xuXG4vKipcbiAqIEFuIHNpbXBsZSBpbmplY3RvciBiYXNlZCBvbiBhIE1hcCBvZiB2YWx1ZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBNYXBJbmplY3RvciBpbXBsZW1lbnRzIEluamVjdG9yIHtcbiAgc3RhdGljIGNyZWF0ZUZhY3RvcnkodmFsdWVzPzogTWFwPGFueSwgYW55PixcbiAgICAgICAgICAgICAgICAgICAgICAgZmFjdG9yaWVzPzogTWFwPGFueSwgKGluamVjdG9yOiBJbmplY3RvcikgPT4gYW55Pik6IEluamVjdG9yRmFjdG9yeTxhbnk+IHtcbiAgICByZXR1cm4gbmV3IE1hcEluamVjdG9yRmFjdG9yeSh2YWx1ZXMsIGZhY3Rvcmllcyk7XG4gIH1cblxuICBwcml2YXRlIF9pbnN0YW5jZXM6IE1hcDxhbnksIGFueT4gPSBuZXcgTWFwPGFueSwgYW55PigpO1xuICBwcml2YXRlIF9mYWN0b3JpZXM6IE1hcDxhbnksIChpbmplY3RvcjogSW5qZWN0b3IpID0+IGFueT47XG4gIHByaXZhdGUgX3ZhbHVlczogTWFwPGFueSwgYW55PjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9wYXJlbnQ6IEluamVjdG9yID0gbnVsbCwgdmFsdWVzOiBNYXA8YW55LCBhbnk+ID0gbnVsbCxcbiAgICAgICAgICAgICAgZmFjdG9yaWVzOiBNYXA8YW55LCAoaW5qZWN0b3I6IEluamVjdG9yKSA9PiBhbnk+ID0gbnVsbCkge1xuICAgIGlmIChpc0JsYW5rKHZhbHVlcykpIHtcbiAgICAgIHZhbHVlcyA9IG5ldyBNYXA8YW55LCBhbnk+KCk7XG4gICAgfVxuICAgIHRoaXMuX3ZhbHVlcyA9IHZhbHVlcztcbiAgICBpZiAoaXNCbGFuayhmYWN0b3JpZXMpKSB7XG4gICAgICBmYWN0b3JpZXMgPSBuZXcgTWFwPGFueSwgYW55PigpO1xuICAgIH1cbiAgICB0aGlzLl9mYWN0b3JpZXMgPSBmYWN0b3JpZXM7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5fcGFyZW50KSkge1xuICAgICAgdGhpcy5fcGFyZW50ID0gSW5qZWN0b3IuTlVMTDtcbiAgICB9XG4gIH1cbiAgZ2V0KHRva2VuOiBhbnksIG5vdEZvdW5kVmFsdWU6IGFueSA9IFRIUk9XX0lGX05PVF9GT1VORCk6IGFueSB7XG4gICAgaWYgKHRva2VuID09PSBJbmplY3Rvcikge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGlmICh0aGlzLl92YWx1ZXMuaGFzKHRva2VuKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlcy5nZXQodG9rZW4pO1xuICAgIH1cbiAgICBpZiAodGhpcy5faW5zdGFuY2VzLmhhcyh0b2tlbikpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pbnN0YW5jZXMuZ2V0KHRva2VuKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2ZhY3Rvcmllcy5oYXModG9rZW4pKSB7XG4gICAgICB2YXIgaW5zdGFuY2UgPSB0aGlzLl9mYWN0b3JpZXMuZ2V0KHRva2VuKSh0aGlzKTtcbiAgICAgIHRoaXMuX2luc3RhbmNlcy5zZXQodG9rZW4sIGluc3RhbmNlKTtcbiAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3BhcmVudC5nZXQodG9rZW4sIG5vdEZvdW5kVmFsdWUpO1xuICB9XG59XG5cbi8qKlxuICogSW5qZWN0b3JGYWN0b3J5IGZvciBNYXBJbmplY3Rvci5cbiAqL1xuZXhwb3J0IGNsYXNzIE1hcEluamVjdG9yRmFjdG9yeSBpbXBsZW1lbnRzIEluamVjdG9yRmFjdG9yeTxhbnk+IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmFsdWVzOiBNYXA8YW55LCBhbnk+ID0gbnVsbCxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfZmFjdG9yaWVzOiBNYXA8YW55LCAoaW5qZWN0b3I6IEluamVjdG9yKSA9PiBhbnk+ID0gbnVsbCkge31cblxuICBjcmVhdGUocGFyZW50OiBJbmplY3RvciA9IG51bGwsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBJbmplY3RvciB7XG4gICAgcmV0dXJuIG5ldyBNYXBJbmplY3RvcihwYXJlbnQsIHRoaXMuX3ZhbHVlcywgdGhpcy5fZmFjdG9yaWVzKTtcbiAgfVxufVxuIl19