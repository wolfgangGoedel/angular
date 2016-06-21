'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var injector_1 = require('./injector');
/**
 * An simple injector based on a Map of values.
 */
var MapInjector = (function () {
    function MapInjector(_parent, values) {
        if (_parent === void 0) { _parent = null; }
        if (values === void 0) { values = null; }
        this._parent = _parent;
        if (lang_1.isBlank(values)) {
            values = new Map();
        }
        this._values = values;
        if (lang_1.isBlank(this._parent)) {
            this._parent = injector_1.Injector.NULL;
        }
    }
    MapInjector.createFactory = function (values) {
        return new MapInjectorFactory(values);
    };
    MapInjector.prototype.get = function (token, notFoundValue) {
        if (notFoundValue === void 0) { notFoundValue = injector_1.THROW_IF_NOT_FOUND; }
        if (token === injector_1.Injector) {
            return this;
        }
        if (this._values.has(token)) {
            return this._values.get(token);
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
    function MapInjectorFactory(_values) {
        if (_values === void 0) { _values = null; }
        this._values = _values;
    }
    MapInjectorFactory.prototype.create = function (parent, context) {
        if (parent === void 0) { parent = null; }
        if (context === void 0) { context = null; }
        return new MapInjector(parent, this._values);
    };
    return MapInjectorFactory;
}());
exports.MapInjectorFactory = MapInjectorFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwX2luamVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1sYjdmZUJyei50bXAvYW5ndWxhcjIvc3JjL2NvcmUvZGkvbWFwX2luamVjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxxQkFBc0IsMEJBQTBCLENBQUMsQ0FBQTtBQUNqRCx5QkFBNEQsWUFBWSxDQUFDLENBQUE7QUFFekU7O0dBRUc7QUFDSDtJQU9FLHFCQUFvQixPQUF3QixFQUFFLE1BQTRCO1FBQTlELHVCQUFnQyxHQUFoQyxjQUFnQztRQUFFLHNCQUE0QixHQUE1QixhQUE0QjtRQUF0RCxZQUFPLEdBQVAsT0FBTyxDQUFpQjtRQUMxQyxFQUFFLENBQUMsQ0FBQyxjQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBWSxDQUFDO1FBQy9CLENBQUM7UUFDRCxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN0QixFQUFFLENBQUMsQ0FBQyxjQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFRLENBQUMsSUFBSSxDQUFDO1FBQy9CLENBQUM7SUFDSCxDQUFDO0lBZE0seUJBQWEsR0FBcEIsVUFBcUIsTUFBc0I7UUFDekMsTUFBTSxDQUFDLElBQUksa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQWFELHlCQUFHLEdBQUgsVUFBSSxLQUFVLEVBQUUsYUFBdUM7UUFBdkMsNkJBQXVDLEdBQXZDLDZDQUF1QztRQUNyRCxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssbUJBQVEsQ0FBQyxDQUFDLENBQUM7WUFDdkIsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFDSCxrQkFBQztBQUFELENBQUMsQUF6QkQsSUF5QkM7QUF6QlksbUJBQVcsY0F5QnZCLENBQUE7QUFFRDs7R0FFRztBQUNIO0lBQ0UsNEJBQW9CLE9BQTZCO1FBQXJDLHVCQUFxQyxHQUFyQyxjQUFxQztRQUE3QixZQUFPLEdBQVAsT0FBTyxDQUFzQjtJQUFHLENBQUM7SUFFckQsbUNBQU0sR0FBTixVQUFPLE1BQXVCLEVBQUUsT0FBbUI7UUFBNUMsc0JBQXVCLEdBQXZCLGFBQXVCO1FBQUUsdUJBQW1CLEdBQW5CLGNBQW1CO1FBQ2pELE1BQU0sQ0FBQyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFDSCx5QkFBQztBQUFELENBQUMsQUFORCxJQU1DO0FBTlksMEJBQWtCLHFCQU05QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtJbmplY3RvciwgSW5qZWN0b3JGYWN0b3J5LCBUSFJPV19JRl9OT1RfRk9VTkR9IGZyb20gJy4vaW5qZWN0b3InO1xuXG4vKipcbiAqIEFuIHNpbXBsZSBpbmplY3RvciBiYXNlZCBvbiBhIE1hcCBvZiB2YWx1ZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBNYXBJbmplY3RvciBpbXBsZW1lbnRzIEluamVjdG9yIHtcbiAgc3RhdGljIGNyZWF0ZUZhY3RvcnkodmFsdWVzPzogTWFwPGFueSwgYW55Pik6IEluamVjdG9yRmFjdG9yeTxhbnk+IHtcbiAgICByZXR1cm4gbmV3IE1hcEluamVjdG9yRmFjdG9yeSh2YWx1ZXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdmFsdWVzOiBNYXA8YW55LCBhbnk+O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3BhcmVudDogSW5qZWN0b3IgPSBudWxsLCB2YWx1ZXM6IE1hcDxhbnksIGFueT4gPSBudWxsKSB7XG4gICAgaWYgKGlzQmxhbmsodmFsdWVzKSkge1xuICAgICAgdmFsdWVzID0gbmV3IE1hcDxhbnksIGFueT4oKTtcbiAgICB9XG4gICAgdGhpcy5fdmFsdWVzID0gdmFsdWVzO1xuICAgIGlmIChpc0JsYW5rKHRoaXMuX3BhcmVudCkpIHtcbiAgICAgIHRoaXMuX3BhcmVudCA9IEluamVjdG9yLk5VTEw7XG4gICAgfVxuICB9XG4gIGdldCh0b2tlbjogYW55LCBub3RGb3VuZFZhbHVlOiBhbnkgPSBUSFJPV19JRl9OT1RfRk9VTkQpOiBhbnkge1xuICAgIGlmICh0b2tlbiA9PT0gSW5qZWN0b3IpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBpZiAodGhpcy5fdmFsdWVzLmhhcyh0b2tlbikpIHtcbiAgICAgIHJldHVybiB0aGlzLl92YWx1ZXMuZ2V0KHRva2VuKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3BhcmVudC5nZXQodG9rZW4sIG5vdEZvdW5kVmFsdWUpO1xuICB9XG59XG5cbi8qKlxuICogSW5qZWN0b3JGYWN0b3J5IGZvciBNYXBJbmplY3Rvci5cbiAqL1xuZXhwb3J0IGNsYXNzIE1hcEluamVjdG9yRmFjdG9yeSBpbXBsZW1lbnRzIEluamVjdG9yRmFjdG9yeTxhbnk+IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmFsdWVzOiBNYXA8YW55LCBhbnk+ID0gbnVsbCkge31cblxuICBjcmVhdGUocGFyZW50OiBJbmplY3RvciA9IG51bGwsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBJbmplY3RvciB7XG4gICAgcmV0dXJuIG5ldyBNYXBJbmplY3RvcihwYXJlbnQsIHRoaXMuX3ZhbHVlcyk7XG4gIH1cbn1cbiJdfQ==