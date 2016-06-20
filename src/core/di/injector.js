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
var _EmptyInjectorFactory = (function () {
    function _EmptyInjectorFactory() {
    }
    _EmptyInjectorFactory.prototype.create = function (parent, context) {
        if (parent === void 0) { parent = null; }
        if (context === void 0) { context = null; }
        return lang_1.isBlank(parent) ? Injector.NULL : parent;
    };
    return _EmptyInjectorFactory;
}());
/**
 * A factory for an injector.
 */
var InjectorFactory = (function () {
    function InjectorFactory() {
    }
    // An InjectorFactory that will always delegate to the parent.
    InjectorFactory.EMPTY = new _EmptyInjectorFactory();
    return InjectorFactory;
}());
exports.InjectorFactory = InjectorFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLUJIc2JSSmQyLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9kaS9pbmplY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEscUJBQTZDLDBCQUEwQixDQUFDLENBQUE7QUFDeEUsMkJBQTJDLGdDQUFnQyxDQUFDLENBQUE7QUFFNUUsSUFBTSxtQkFBbUIsR0FBRyxpQkFBVSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztBQUN4QywwQkFBa0IsR0FBRyxpQkFBVSxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFFbEU7SUFBQTtJQU9BLENBQUM7SUFOQywyQkFBRyxHQUFILFVBQUksS0FBVSxFQUFFLGFBQXdDO1FBQXhDLDZCQUF3QyxHQUF4QyxtQ0FBd0M7UUFDdEQsRUFBRSxDQUFDLENBQUMsYUFBYSxLQUFLLG1CQUFtQixDQUFDLENBQUMsQ0FBQztZQUMxQyxNQUFNLElBQUksMEJBQWEsQ0FBQyxxQkFBbUIsZ0JBQVMsQ0FBQyxLQUFLLENBQUMsTUFBRyxDQUFDLENBQUM7UUFDbEUsQ0FBQztRQUNELE1BQU0sQ0FBQyxhQUFhLENBQUM7SUFDdkIsQ0FBQztJQUNILG9CQUFDO0FBQUQsQ0FBQyxBQVBELElBT0M7QUFFRDs7O0dBR0c7QUFDSDtJQUFBO0lBNkJBLENBQUM7SUF6QkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BdUJHO0lBQ0gsc0JBQUcsR0FBSCxVQUFJLEtBQVUsRUFBRSxhQUFtQixJQUFTLE1BQU0sQ0FBQywwQkFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBM0I5RCwyQkFBa0IsR0FBRyxtQkFBbUIsQ0FBQztJQUN6QyxhQUFJLEdBQWEsSUFBSSxhQUFhLEVBQUUsQ0FBQztJQTJCOUMsZUFBQztBQUFELENBQUMsQUE3QkQsSUE2QkM7QUE3QnFCLGdCQUFRLFdBNkI3QixDQUFBO0FBRUQ7SUFBQTtJQUlBLENBQUM7SUFIQyxzQ0FBTSxHQUFOLFVBQU8sTUFBdUIsRUFBRSxPQUFtQjtRQUE1QyxzQkFBdUIsR0FBdkIsYUFBdUI7UUFBRSx1QkFBbUIsR0FBbkIsY0FBbUI7UUFDakQsTUFBTSxDQUFDLGNBQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQztJQUNsRCxDQUFDO0lBQ0gsNEJBQUM7QUFBRCxDQUFDLEFBSkQsSUFJQztBQUVEOztHQUVHO0FBQ0g7SUFBQTtJQUtBLENBQUM7SUFKQyw4REFBOEQ7SUFDdkQscUJBQUssR0FBeUIsSUFBSSxxQkFBcUIsRUFBRSxDQUFDO0lBR25FLHNCQUFDO0FBQUQsQ0FBQyxBQUxELElBS0M7QUFMcUIsdUJBQWUsa0JBS3BDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNUX0VYUFIsIHN0cmluZ2lmeSwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7dW5pbXBsZW1lbnRlZCwgQmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcblxuY29uc3QgX1RIUk9XX0lGX05PVF9GT1VORCA9IENPTlNUX0VYUFIobmV3IE9iamVjdCgpKTtcbmV4cG9ydCBjb25zdCBUSFJPV19JRl9OT1RfRk9VTkQgPSBDT05TVF9FWFBSKF9USFJPV19JRl9OT1RfRk9VTkQpO1xuXG5jbGFzcyBfTnVsbEluamVjdG9yIGltcGxlbWVudHMgSW5qZWN0b3Ige1xuICBnZXQodG9rZW46IGFueSwgbm90Rm91bmRWYWx1ZTogYW55ID0gX1RIUk9XX0lGX05PVF9GT1VORCk6IGFueSB7XG4gICAgaWYgKG5vdEZvdW5kVmFsdWUgPT09IF9USFJPV19JRl9OT1RfRk9VTkQpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBObyBwcm92aWRlciBmb3IgJHtzdHJpbmdpZnkodG9rZW4pfSFgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5vdEZvdW5kVmFsdWU7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgSW5qZWN0b3IgaW50ZXJmYWNlLiBUaGlzIGNsYXNzIGNhbiBhbHNvIGJlIHVzZWRcbiAqIHRvIGdldCBob2xkIG9mIGFuIEluamVjdG9yLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSW5qZWN0b3Ige1xuICBzdGF0aWMgVEhST1dfSUZfTk9UX0ZPVU5EID0gX1RIUk9XX0lGX05PVF9GT1VORDtcbiAgc3RhdGljIE5VTEw6IEluamVjdG9yID0gbmV3IF9OdWxsSW5qZWN0b3IoKTtcblxuICAvKipcbiAgICogUmV0cmlldmVzIGFuIGluc3RhbmNlIGZyb20gdGhlIGluamVjdG9yIGJhc2VkIG9uIHRoZSBwcm92aWRlZCB0b2tlbi5cbiAgICogSWYgbm90IGZvdW5kOlxuICAgKiAtIFRocm93cyB7QGxpbmsgTm9Qcm92aWRlckVycm9yfSBpZiBubyBgbm90Rm91bmRWYWx1ZWAgdGhhdCBpcyBub3QgZXF1YWwgdG9cbiAgICogSW5qZWN0b3IuVEhST1dfSUZfTk9UX0ZPVU5EIGlzIGdpdmVuXG4gICAqIC0gUmV0dXJucyB0aGUgYG5vdEZvdW5kVmFsdWVgIG90aGVyd2lzZVxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvSGVYU0hnP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gUmVmbGVjdGl2ZUluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIHByb3ZpZGUoXCJ2YWxpZFRva2VuXCIsIHt1c2VWYWx1ZTogXCJWYWx1ZVwifSlcbiAgICogXSk7XG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoXCJ2YWxpZFRva2VuXCIpKS50b0VxdWFsKFwiVmFsdWVcIik7XG4gICAqIGV4cGVjdCgoKSA9PiBpbmplY3Rvci5nZXQoXCJpbnZhbGlkVG9rZW5cIikpLnRvVGhyb3dFcnJvcigpO1xuICAgKiBgYGBcbiAgICpcbiAgICogYEluamVjdG9yYCByZXR1cm5zIGl0c2VsZiB3aGVuIGdpdmVuIGBJbmplY3RvcmAgYXMgYSB0b2tlbi5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBSZWZsZWN0aXZlSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXSk7XG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoSW5qZWN0b3IpKS50b0JlKGluamVjdG9yKTtcbiAgICogYGBgXG4gICAqL1xuICBnZXQodG9rZW46IGFueSwgbm90Rm91bmRWYWx1ZT86IGFueSk6IGFueSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cbn1cblxuY2xhc3MgX0VtcHR5SW5qZWN0b3JGYWN0b3J5IGltcGxlbWVudHMgSW5qZWN0b3JGYWN0b3J5PGFueT4ge1xuICBjcmVhdGUocGFyZW50OiBJbmplY3RvciA9IG51bGwsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBJbmplY3RvciB7XG4gICAgcmV0dXJuIGlzQmxhbmsocGFyZW50KSA/IEluamVjdG9yLk5VTEwgOiBwYXJlbnQ7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGZhY3RvcnkgZm9yIGFuIGluamVjdG9yLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSW5qZWN0b3JGYWN0b3J5PENPTlRFWFQ+IHtcbiAgLy8gQW4gSW5qZWN0b3JGYWN0b3J5IHRoYXQgd2lsbCBhbHdheXMgZGVsZWdhdGUgdG8gdGhlIHBhcmVudC5cbiAgc3RhdGljIEVNUFRZOiBJbmplY3RvckZhY3Rvcnk8YW55PiA9IG5ldyBfRW1wdHlJbmplY3RvckZhY3RvcnkoKTtcblxuICBhYnN0cmFjdCBjcmVhdGUocGFyZW50PzogSW5qZWN0b3IsIGNvbnRleHQ/OiBDT05URVhUKTogSW5qZWN0b3I7XG59XG4iXX0=