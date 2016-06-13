'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var _THROW_IF_NOT_FOUND = lang_1.CONST_EXPR(new Object());
exports.THROW_IF_NOT_FOUND = lang_1.CONST_EXPR(_THROW_IF_NOT_FOUND);
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
    return Injector;
}());
exports.Injector = Injector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLUY2NEJjUzgyLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9kaS9pbmplY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEscUJBQXlCLDBCQUEwQixDQUFDLENBQUE7QUFDcEQsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFFN0QsSUFBTSxtQkFBbUIsR0FBRyxpQkFBVSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztBQUN4QywwQkFBa0IsR0FBRyxpQkFBVSxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFFbEU7SUFBQTtJQTRCQSxDQUFDO0lBekJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQXVCRztJQUNILHNCQUFHLEdBQUgsVUFBSSxLQUFVLEVBQUUsYUFBbUIsSUFBUyxNQUFNLENBQUMsMEJBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQTFCOUQsMkJBQWtCLEdBQUcsbUJBQW1CLENBQUM7SUEyQmxELGVBQUM7QUFBRCxDQUFDLEFBNUJELElBNEJDO0FBNUJxQixnQkFBUSxXQTRCN0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7dW5pbXBsZW1lbnRlZH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcblxuY29uc3QgX1RIUk9XX0lGX05PVF9GT1VORCA9IENPTlNUX0VYUFIobmV3IE9iamVjdCgpKTtcbmV4cG9ydCBjb25zdCBUSFJPV19JRl9OT1RfRk9VTkQgPSBDT05TVF9FWFBSKF9USFJPV19JRl9OT1RfRk9VTkQpO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSW5qZWN0b3Ige1xuICBzdGF0aWMgVEhST1dfSUZfTk9UX0ZPVU5EID0gX1RIUk9XX0lGX05PVF9GT1VORDtcblxuICAvKipcbiAgICogUmV0cmlldmVzIGFuIGluc3RhbmNlIGZyb20gdGhlIGluamVjdG9yIGJhc2VkIG9uIHRoZSBwcm92aWRlZCB0b2tlbi5cbiAgICogSWYgbm90IGZvdW5kOlxuICAgKiAtIFRocm93cyB7QGxpbmsgTm9Qcm92aWRlckVycm9yfSBpZiBubyBgbm90Rm91bmRWYWx1ZWAgdGhhdCBpcyBub3QgZXF1YWwgdG9cbiAgICogSW5qZWN0b3IuVEhST1dfSUZfTk9UX0ZPVU5EIGlzIGdpdmVuXG4gICAqIC0gUmV0dXJucyB0aGUgYG5vdEZvdW5kVmFsdWVgIG90aGVyd2lzZVxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvSGVYU0hnP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gUmVmbGVjdGl2ZUluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIHByb3ZpZGUoXCJ2YWxpZFRva2VuXCIsIHt1c2VWYWx1ZTogXCJWYWx1ZVwifSlcbiAgICogXSk7XG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoXCJ2YWxpZFRva2VuXCIpKS50b0VxdWFsKFwiVmFsdWVcIik7XG4gICAqIGV4cGVjdCgoKSA9PiBpbmplY3Rvci5nZXQoXCJpbnZhbGlkVG9rZW5cIikpLnRvVGhyb3dFcnJvcigpO1xuICAgKiBgYGBcbiAgICpcbiAgICogYEluamVjdG9yYCByZXR1cm5zIGl0c2VsZiB3aGVuIGdpdmVuIGBJbmplY3RvcmAgYXMgYSB0b2tlbi5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBSZWZsZWN0aXZlSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXSk7XG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoSW5qZWN0b3IpKS50b0JlKGluamVjdG9yKTtcbiAgICogYGBgXG4gICAqL1xuICBnZXQodG9rZW46IGFueSwgbm90Rm91bmRWYWx1ZT86IGFueSk6IGFueSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cbn1cbiJdfQ==