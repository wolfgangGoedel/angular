'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var _THROW_IF_NOT_FOUND = lang_1.CONST_EXPR(new Object());
exports.THROW_IF_NOT_FOUND = lang_1.CONST_EXPR(_THROW_IF_NOT_FOUND);
var _NullInjector = (function () {
    function _NullInjector() {
    }
    _NullInjector.prototype.get = function (token, notFoundValue) {
        if (notFoundValue === void 0) { notFoundValue = _THROW_IF_NOT_FOUND; }
        if (notFoundValue === _THROW_IF_NOT_FOUND) {
            throw new exceptions_1.BaseException("No provider for " + lang_1.stringify(token) + "!");
        }
        return notFoundValue;
    };
    return _NullInjector;
}());
/**
 * The Injector interface. This class can also be used
 * to get hold of an Injector.
 */
var Injector = (function () {
    function Injector() {
    }
    /**
     * Retrieves an instance from the injector based on the provided token.
     * If not found:
     * - Throws {@link NoProviderError} if no `notFoundValue` that is not equal to
     * Injector.THROW_IF_NOT_FOUND is given
     * - Returns the `notFoundValue` otherwise
     *
     * ### Example ([live demo](http://plnkr.co/edit/HeXSHg?p=preview))
     *
     * ```typescript
     * var injector = ReflectiveInjector.resolveAndCreate([
     *   provide("validToken", {useValue: "Value"})
     * ]);
     * expect(injector.get("validToken")).toEqual("Value");
     * expect(() => injector.get("invalidToken")).toThrowError();
     * ```
     *
     * `Injector` returns itself when given `Injector` as a token.
     *
     * ```typescript
     * var injector = ReflectiveInjector.resolveAndCreate([]);
     * expect(injector.get(Injector)).toBe(injector);
     * ```
     */
    Injector.prototype.get = function (token, notFoundValue) { return exceptions_1.unimplemented(); };
    Injector.THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;
    Injector.NULL = new _NullInjector();
    return Injector;
}());
exports.Injector = Injector;
/**
 * An simple injector based on a Map of values.
 */
var MapInjector = (function () {
    function MapInjector(_parent, _values) {
        this._parent = _parent;
        this._values = _values;
        if (lang_1.isBlank(this._parent)) {
            this._parent = Injector.NULL;
        }
    }
    MapInjector.prototype.get = function (token, notFoundValue) {
        if (notFoundValue === void 0) { notFoundValue = _THROW_IF_NOT_FOUND; }
        if (token === Injector) {
            return this;
        }
        return this._values.has(token) ? this._values.get(token) :
            this._parent.get(token, notFoundValue);
    };
    return MapInjector;
}());
exports.MapInjector = MapInjector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWVnOXFsVndYLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9kaS9pbmplY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEscUJBQTZDLDBCQUEwQixDQUFDLENBQUE7QUFDeEUsMkJBQTJDLGdDQUFnQyxDQUFDLENBQUE7QUFFNUUsSUFBTSxtQkFBbUIsR0FBRyxpQkFBVSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztBQUN4QywwQkFBa0IsR0FBRyxpQkFBVSxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFFbEU7SUFBQTtJQU9BLENBQUM7SUFOQywyQkFBRyxHQUFILFVBQUksS0FBVSxFQUFFLGFBQXdDO1FBQXhDLDZCQUF3QyxHQUF4QyxtQ0FBd0M7UUFDdEQsRUFBRSxDQUFDLENBQUMsYUFBYSxLQUFLLG1CQUFtQixDQUFDLENBQUMsQ0FBQztZQUMxQyxNQUFNLElBQUksMEJBQWEsQ0FBQyxxQkFBbUIsZ0JBQVMsQ0FBQyxLQUFLLENBQUMsTUFBRyxDQUFDLENBQUM7UUFDbEUsQ0FBQztRQUNELE1BQU0sQ0FBQyxhQUFhLENBQUM7SUFDdkIsQ0FBQztJQUNILG9CQUFDO0FBQUQsQ0FBQyxBQVBELElBT0M7QUFFRDs7O0dBR0c7QUFDSDtJQUFBO0lBNkJBLENBQUM7SUF6QkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BdUJHO0lBQ0gsc0JBQUcsR0FBSCxVQUFJLEtBQVUsRUFBRSxhQUFtQixJQUFTLE1BQU0sQ0FBQywwQkFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBM0I5RCwyQkFBa0IsR0FBRyxtQkFBbUIsQ0FBQztJQUN6QyxhQUFJLEdBQWEsSUFBSSxhQUFhLEVBQUUsQ0FBQztJQTJCOUMsZUFBQztBQUFELENBQUMsQUE3QkQsSUE2QkM7QUE3QnFCLGdCQUFRLFdBNkI3QixDQUFBO0FBRUQ7O0dBRUc7QUFDSDtJQUNFLHFCQUFvQixPQUFpQixFQUFVLE9BQXNCO1FBQWpELFlBQU8sR0FBUCxPQUFPLENBQVU7UUFBVSxZQUFPLEdBQVAsT0FBTyxDQUFlO1FBQ25FLEVBQUUsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztRQUMvQixDQUFDO0lBQ0gsQ0FBQztJQUNELHlCQUFHLEdBQUgsVUFBSSxLQUFVLEVBQUUsYUFBd0M7UUFBeEMsNkJBQXdDLEdBQXhDLG1DQUF3QztRQUN0RCxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztZQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7WUFDdkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFDSCxrQkFBQztBQUFELENBQUMsQUFiRCxJQWFDO0FBYlksbUJBQVcsY0FhdkIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q09OU1RfRVhQUiwgc3RyaW5naWZ5LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHt1bmltcGxlbWVudGVkLCBCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuXG5jb25zdCBfVEhST1dfSUZfTk9UX0ZPVU5EID0gQ09OU1RfRVhQUihuZXcgT2JqZWN0KCkpO1xuZXhwb3J0IGNvbnN0IFRIUk9XX0lGX05PVF9GT1VORCA9IENPTlNUX0VYUFIoX1RIUk9XX0lGX05PVF9GT1VORCk7XG5cbmNsYXNzIF9OdWxsSW5qZWN0b3IgaW1wbGVtZW50cyBJbmplY3RvciB7XG4gIGdldCh0b2tlbjogYW55LCBub3RGb3VuZFZhbHVlOiBhbnkgPSBfVEhST1dfSUZfTk9UX0ZPVU5EKTogYW55IHtcbiAgICBpZiAobm90Rm91bmRWYWx1ZSA9PT0gX1RIUk9XX0lGX05PVF9GT1VORCkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYE5vIHByb3ZpZGVyIGZvciAke3N0cmluZ2lmeSh0b2tlbil9IWApO1xuICAgIH1cbiAgICByZXR1cm4gbm90Rm91bmRWYWx1ZTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBJbmplY3RvciBpbnRlcmZhY2UuIFRoaXMgY2xhc3MgY2FuIGFsc28gYmUgdXNlZFxuICogdG8gZ2V0IGhvbGQgb2YgYW4gSW5qZWN0b3IuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBJbmplY3RvciB7XG4gIHN0YXRpYyBUSFJPV19JRl9OT1RfRk9VTkQgPSBfVEhST1dfSUZfTk9UX0ZPVU5EO1xuICBzdGF0aWMgTlVMTDogSW5qZWN0b3IgPSBuZXcgX051bGxJbmplY3RvcigpO1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgYW4gaW5zdGFuY2UgZnJvbSB0aGUgaW5qZWN0b3IgYmFzZWQgb24gdGhlIHByb3ZpZGVkIHRva2VuLlxuICAgKiBJZiBub3QgZm91bmQ6XG4gICAqIC0gVGhyb3dzIHtAbGluayBOb1Byb3ZpZGVyRXJyb3J9IGlmIG5vIGBub3RGb3VuZFZhbHVlYCB0aGF0IGlzIG5vdCBlcXVhbCB0b1xuICAgKiBJbmplY3Rvci5USFJPV19JRl9OT1RfRk9VTkQgaXMgZ2l2ZW5cbiAgICogLSBSZXR1cm5zIHRoZSBgbm90Rm91bmRWYWx1ZWAgb3RoZXJ3aXNlXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9IZVhTSGc/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBSZWZsZWN0aXZlSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgcHJvdmlkZShcInZhbGlkVG9rZW5cIiwge3VzZVZhbHVlOiBcIlZhbHVlXCJ9KVxuICAgKiBdKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChcInZhbGlkVG9rZW5cIikpLnRvRXF1YWwoXCJWYWx1ZVwiKTtcbiAgICogZXhwZWN0KCgpID0+IGluamVjdG9yLmdldChcImludmFsaWRUb2tlblwiKSkudG9UaHJvd0Vycm9yKCk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBgSW5qZWN0b3JgIHJldHVybnMgaXRzZWxmIHdoZW4gZ2l2ZW4gYEluamVjdG9yYCBhcyBhIHRva2VuLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IFJlZmxlY3RpdmVJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtdKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChJbmplY3RvcikpLnRvQmUoaW5qZWN0b3IpO1xuICAgKiBgYGBcbiAgICovXG4gIGdldCh0b2tlbjogYW55LCBub3RGb3VuZFZhbHVlPzogYW55KTogYW55IHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfVxufVxuXG4vKipcbiAqIEFuIHNpbXBsZSBpbmplY3RvciBiYXNlZCBvbiBhIE1hcCBvZiB2YWx1ZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBNYXBJbmplY3RvciBpbXBsZW1lbnRzIEluamVjdG9yIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcGFyZW50OiBJbmplY3RvciwgcHJpdmF0ZSBfdmFsdWVzOiBNYXA8YW55LCBhbnk+KSB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5fcGFyZW50KSkge1xuICAgICAgdGhpcy5fcGFyZW50ID0gSW5qZWN0b3IuTlVMTDtcbiAgICB9XG4gIH1cbiAgZ2V0KHRva2VuOiBhbnksIG5vdEZvdW5kVmFsdWU6IGFueSA9IF9USFJPV19JRl9OT1RfRk9VTkQpOiBhbnkge1xuICAgIGlmICh0b2tlbiA9PT0gSW5qZWN0b3IpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fdmFsdWVzLmhhcyh0b2tlbikgPyB0aGlzLl92YWx1ZXMuZ2V0KHRva2VuKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGFyZW50LmdldCh0b2tlbiwgbm90Rm91bmRWYWx1ZSk7XG4gIH1cbn1cbiJdfQ==