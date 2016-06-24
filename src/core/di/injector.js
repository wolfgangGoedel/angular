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
var _EmptyInjectorFactory = (function () {
    function _EmptyInjectorFactory() {
    }
    _EmptyInjectorFactory.prototype.create = function (parent, context) {
        if (parent === void 0) { parent = null; }
        if (context === void 0) { context = null; }
        return lang_1.isBlank(parent) ? Injector.NULL : parent;
    };
    _EmptyInjectorFactory = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], _EmptyInjectorFactory);
    return _EmptyInjectorFactory;
}());
/**
 * A factory for an injector.
 */
var InjectorFactory = (function () {
    function InjectorFactory() {
    }
    /**
     * Binds an InjectorFactory to a fixed context
     */
    InjectorFactory.bind = function (factory, context) {
        return new _BoundInjectorFactory(factory, context);
    };
    // An InjectorFactory that will always delegate to the parent.
    InjectorFactory.EMPTY = lang_1.CONST_EXPR(new _EmptyInjectorFactory());
    return InjectorFactory;
}());
exports.InjectorFactory = InjectorFactory;
var _BoundInjectorFactory = (function () {
    function _BoundInjectorFactory(_delegate, _context) {
        this._delegate = _delegate;
        this._context = _context;
    }
    _BoundInjectorFactory.prototype.create = function (parent, context) {
        if (parent === void 0) { parent = null; }
        if (context === void 0) { context = null; }
        return this._delegate.create(parent, this._context);
    };
    return _BoundInjectorFactory;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLUFPYWNtWThULnRtcC9hbmd1bGFyMi9zcmMvY29yZS9kaS9pbmplY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEscUJBQW9ELDBCQUEwQixDQUFDLENBQUE7QUFDL0UsMkJBQTJDLGdDQUFnQyxDQUFDLENBQUE7QUFFNUUsSUFBTSxtQkFBbUIsR0FBRyxpQkFBVSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztBQUN4QywwQkFBa0IsR0FBRyxpQkFBVSxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFFbEU7SUFBQTtJQU9BLENBQUM7SUFOQywyQkFBRyxHQUFILFVBQUksS0FBVSxFQUFFLGFBQXdDO1FBQXhDLDZCQUF3QyxHQUF4QyxtQ0FBd0M7UUFDdEQsRUFBRSxDQUFDLENBQUMsYUFBYSxLQUFLLG1CQUFtQixDQUFDLENBQUMsQ0FBQztZQUMxQyxNQUFNLElBQUksMEJBQWEsQ0FBQyxxQkFBbUIsZ0JBQVMsQ0FBQyxLQUFLLENBQUMsTUFBRyxDQUFDLENBQUM7UUFDbEUsQ0FBQztRQUNELE1BQU0sQ0FBQyxhQUFhLENBQUM7SUFDdkIsQ0FBQztJQUNILG9CQUFDO0FBQUQsQ0FBQyxBQVBELElBT0M7QUFFRDs7O0dBR0c7QUFDSDtJQUFBO0lBNkJBLENBQUM7SUF6QkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BdUJHO0lBQ0gsc0JBQUcsR0FBSCxVQUFJLEtBQVUsRUFBRSxhQUFtQixJQUFTLE1BQU0sQ0FBQywwQkFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBM0I5RCwyQkFBa0IsR0FBRyxtQkFBbUIsQ0FBQztJQUN6QyxhQUFJLEdBQWEsSUFBSSxhQUFhLEVBQUUsQ0FBQztJQTJCOUMsZUFBQztBQUFELENBQUMsQUE3QkQsSUE2QkM7QUE3QnFCLGdCQUFRLFdBNkI3QixDQUFBO0FBR0Q7SUFBQTtJQUlBLENBQUM7SUFIQyxzQ0FBTSxHQUFOLFVBQU8sTUFBdUIsRUFBRSxPQUFtQjtRQUE1QyxzQkFBdUIsR0FBdkIsYUFBdUI7UUFBRSx1QkFBbUIsR0FBbkIsY0FBbUI7UUFDakQsTUFBTSxDQUFDLGNBQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQztJQUNsRCxDQUFDO0lBSkg7UUFBQyxZQUFLLEVBQUU7OzZCQUFBO0lBS1IsNEJBQUM7QUFBRCxDQUFDLEFBSkQsSUFJQztBQUVEOztHQUVHO0FBQ0g7SUFBQTtJQVlBLENBQUM7SUFSQzs7T0FFRztJQUNJLG9CQUFJLEdBQVgsVUFBWSxPQUE2QixFQUFFLE9BQVk7UUFDckQsTUFBTSxDQUFDLElBQUkscUJBQXFCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFSRCw4REFBOEQ7SUFDdkQscUJBQUssR0FBeUIsaUJBQVUsQ0FBQyxJQUFJLHFCQUFxQixFQUFFLENBQUMsQ0FBQztJQVUvRSxzQkFBQztBQUFELENBQUMsQUFaRCxJQVlDO0FBWnFCLHVCQUFlLGtCQVlwQyxDQUFBO0FBRUQ7SUFDRSwrQkFBb0IsU0FBK0IsRUFBVSxRQUFhO1FBQXRELGNBQVMsR0FBVCxTQUFTLENBQXNCO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBSztJQUFHLENBQUM7SUFDOUUsc0NBQU0sR0FBTixVQUFPLE1BQXVCLEVBQUUsT0FBbUI7UUFBNUMsc0JBQXVCLEdBQXZCLGFBQXVCO1FBQUUsdUJBQW1CLEdBQW5CLGNBQW1CO1FBQ2pELE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFDSCw0QkFBQztBQUFELENBQUMsQUFMRCxJQUtDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVF9FWFBSLCBDT05TVCwgc3RyaW5naWZ5LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHt1bmltcGxlbWVudGVkLCBCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuXG5jb25zdCBfVEhST1dfSUZfTk9UX0ZPVU5EID0gQ09OU1RfRVhQUihuZXcgT2JqZWN0KCkpO1xuZXhwb3J0IGNvbnN0IFRIUk9XX0lGX05PVF9GT1VORCA9IENPTlNUX0VYUFIoX1RIUk9XX0lGX05PVF9GT1VORCk7XG5cbmNsYXNzIF9OdWxsSW5qZWN0b3IgaW1wbGVtZW50cyBJbmplY3RvciB7XG4gIGdldCh0b2tlbjogYW55LCBub3RGb3VuZFZhbHVlOiBhbnkgPSBfVEhST1dfSUZfTk9UX0ZPVU5EKTogYW55IHtcbiAgICBpZiAobm90Rm91bmRWYWx1ZSA9PT0gX1RIUk9XX0lGX05PVF9GT1VORCkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYE5vIHByb3ZpZGVyIGZvciAke3N0cmluZ2lmeSh0b2tlbil9IWApO1xuICAgIH1cbiAgICByZXR1cm4gbm90Rm91bmRWYWx1ZTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBJbmplY3RvciBpbnRlcmZhY2UuIFRoaXMgY2xhc3MgY2FuIGFsc28gYmUgdXNlZFxuICogdG8gZ2V0IGhvbGQgb2YgYW4gSW5qZWN0b3IuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBJbmplY3RvciB7XG4gIHN0YXRpYyBUSFJPV19JRl9OT1RfRk9VTkQgPSBfVEhST1dfSUZfTk9UX0ZPVU5EO1xuICBzdGF0aWMgTlVMTDogSW5qZWN0b3IgPSBuZXcgX051bGxJbmplY3RvcigpO1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgYW4gaW5zdGFuY2UgZnJvbSB0aGUgaW5qZWN0b3IgYmFzZWQgb24gdGhlIHByb3ZpZGVkIHRva2VuLlxuICAgKiBJZiBub3QgZm91bmQ6XG4gICAqIC0gVGhyb3dzIHtAbGluayBOb1Byb3ZpZGVyRXJyb3J9IGlmIG5vIGBub3RGb3VuZFZhbHVlYCB0aGF0IGlzIG5vdCBlcXVhbCB0b1xuICAgKiBJbmplY3Rvci5USFJPV19JRl9OT1RfRk9VTkQgaXMgZ2l2ZW5cbiAgICogLSBSZXR1cm5zIHRoZSBgbm90Rm91bmRWYWx1ZWAgb3RoZXJ3aXNlXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9IZVhTSGc/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBSZWZsZWN0aXZlSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgcHJvdmlkZShcInZhbGlkVG9rZW5cIiwge3VzZVZhbHVlOiBcIlZhbHVlXCJ9KVxuICAgKiBdKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChcInZhbGlkVG9rZW5cIikpLnRvRXF1YWwoXCJWYWx1ZVwiKTtcbiAgICogZXhwZWN0KCgpID0+IGluamVjdG9yLmdldChcImludmFsaWRUb2tlblwiKSkudG9UaHJvd0Vycm9yKCk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBgSW5qZWN0b3JgIHJldHVybnMgaXRzZWxmIHdoZW4gZ2l2ZW4gYEluamVjdG9yYCBhcyBhIHRva2VuLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IFJlZmxlY3RpdmVJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtdKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChJbmplY3RvcikpLnRvQmUoaW5qZWN0b3IpO1xuICAgKiBgYGBcbiAgICovXG4gIGdldCh0b2tlbjogYW55LCBub3RGb3VuZFZhbHVlPzogYW55KTogYW55IHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfVxufVxuXG5AQ09OU1QoKVxuY2xhc3MgX0VtcHR5SW5qZWN0b3JGYWN0b3J5IGltcGxlbWVudHMgSW5qZWN0b3JGYWN0b3J5PGFueT4ge1xuICBjcmVhdGUocGFyZW50OiBJbmplY3RvciA9IG51bGwsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBJbmplY3RvciB7XG4gICAgcmV0dXJuIGlzQmxhbmsocGFyZW50KSA/IEluamVjdG9yLk5VTEwgOiBwYXJlbnQ7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGZhY3RvcnkgZm9yIGFuIGluamVjdG9yLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSW5qZWN0b3JGYWN0b3J5PENPTlRFWFQ+IHtcbiAgLy8gQW4gSW5qZWN0b3JGYWN0b3J5IHRoYXQgd2lsbCBhbHdheXMgZGVsZWdhdGUgdG8gdGhlIHBhcmVudC5cbiAgc3RhdGljIEVNUFRZOiBJbmplY3RvckZhY3Rvcnk8YW55PiA9IENPTlNUX0VYUFIobmV3IF9FbXB0eUluamVjdG9yRmFjdG9yeSgpKTtcblxuICAvKipcbiAgICogQmluZHMgYW4gSW5qZWN0b3JGYWN0b3J5IHRvIGEgZml4ZWQgY29udGV4dFxuICAgKi9cbiAgc3RhdGljIGJpbmQoZmFjdG9yeTogSW5qZWN0b3JGYWN0b3J5PGFueT4sIGNvbnRleHQ6IGFueSk6IEluamVjdG9yRmFjdG9yeTxhbnk+IHtcbiAgICByZXR1cm4gbmV3IF9Cb3VuZEluamVjdG9yRmFjdG9yeShmYWN0b3J5LCBjb250ZXh0KTtcbiAgfVxuXG4gIGFic3RyYWN0IGNyZWF0ZShwYXJlbnQ/OiBJbmplY3RvciwgY29udGV4dD86IENPTlRFWFQpOiBJbmplY3Rvcjtcbn1cblxuY2xhc3MgX0JvdW5kSW5qZWN0b3JGYWN0b3J5IGltcGxlbWVudHMgSW5qZWN0b3JGYWN0b3J5PGFueT4ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9kZWxlZ2F0ZTogSW5qZWN0b3JGYWN0b3J5PGFueT4sIHByaXZhdGUgX2NvbnRleHQ6IGFueSkge31cbiAgY3JlYXRlKHBhcmVudDogSW5qZWN0b3IgPSBudWxsLCBjb250ZXh0OiBhbnkgPSBudWxsKTogSW5qZWN0b3Ige1xuICAgIHJldHVybiB0aGlzLl9kZWxlZ2F0ZS5jcmVhdGUocGFyZW50LCB0aGlzLl9jb250ZXh0KTtcbiAgfVxufVxuIl19