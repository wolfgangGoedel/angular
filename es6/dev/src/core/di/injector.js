var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { CONST_EXPR, CONST, stringify, isBlank } from 'angular2/src/facade/lang';
import { unimplemented, BaseException } from 'angular2/src/facade/exceptions';
const _THROW_IF_NOT_FOUND = CONST_EXPR(new Object());
export const THROW_IF_NOT_FOUND = CONST_EXPR(_THROW_IF_NOT_FOUND);
class _NullInjector {
    get(token, notFoundValue = _THROW_IF_NOT_FOUND) {
        if (notFoundValue === _THROW_IF_NOT_FOUND) {
            throw new BaseException(`No provider for ${stringify(token)}!`);
        }
        return notFoundValue;
    }
}
/**
 * The Injector interface. This class can also be used
 * to get hold of an Injector.
 */
export class Injector {
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
    get(token, notFoundValue) { return unimplemented(); }
}
Injector.THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;
Injector.NULL = new _NullInjector();
let _EmptyInjectorFactory = class _EmptyInjectorFactory {
    create(parent = null, context = null) {
        return isBlank(parent) ? Injector.NULL : parent;
    }
};
_EmptyInjectorFactory = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [])
], _EmptyInjectorFactory);
/**
 * A factory for an injector.
 */
export class InjectorFactory {
    /**
     * Binds an InjectorFactory to a fixed context
     */
    static bind(factory, context) {
        return new _BoundInjectorFactory(factory, context);
    }
}
// An InjectorFactory that will always delegate to the parent.
InjectorFactory.EMPTY = CONST_EXPR(new _EmptyInjectorFactory());
class _BoundInjectorFactory {
    constructor(_delegate, _context) {
        this._delegate = _delegate;
        this._context = _context;
    }
    create(parent = null, context = null) {
        return this._delegate.create(parent, this._context);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVg1aGV2UHA0LnRtcC9hbmd1bGFyMi9zcmMvY29yZS9kaS9pbmplY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBQyxNQUFNLDBCQUEwQjtPQUN2RSxFQUFDLGFBQWEsRUFBRSxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7QUFFM0UsTUFBTSxtQkFBbUIsR0FBRyxVQUFVLENBQUMsSUFBSSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBQ3JELE9BQU8sTUFBTSxrQkFBa0IsR0FBRyxVQUFVLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUVsRTtJQUNFLEdBQUcsQ0FBQyxLQUFVLEVBQUUsYUFBYSxHQUFRLG1CQUFtQjtRQUN0RCxFQUFFLENBQUMsQ0FBQyxhQUFhLEtBQUssbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sSUFBSSxhQUFhLENBQUMsbUJBQW1CLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbEUsQ0FBQztRQUNELE1BQU0sQ0FBQyxhQUFhLENBQUM7SUFDdkIsQ0FBQztBQUNILENBQUM7QUFFRDs7O0dBR0c7QUFDSDtJQUlFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQXVCRztJQUNILEdBQUcsQ0FBQyxLQUFVLEVBQUUsYUFBbUIsSUFBUyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3ZFLENBQUM7QUE1QlEsMkJBQWtCLEdBQUcsbUJBQW1CLENBQUM7QUFDekMsYUFBSSxHQUFhLElBQUksYUFBYSxFQUFFLENBMkI1QztBQUdEO0lBQ0UsTUFBTSxDQUFDLE1BQU0sR0FBYSxJQUFJLEVBQUUsT0FBTyxHQUFRLElBQUk7UUFDakQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQztJQUNsRCxDQUFDO0FBQ0gsQ0FBQztBQUxEO0lBQUMsS0FBSyxFQUFFOzt5QkFBQTtBQU9SOztHQUVHO0FBQ0g7SUFJRTs7T0FFRztJQUNILE9BQU8sSUFBSSxDQUFDLE9BQTZCLEVBQUUsT0FBWTtRQUNyRCxNQUFNLENBQUMsSUFBSSxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDckQsQ0FBQztBQUdILENBQUM7QUFYQyw4REFBOEQ7QUFDdkQscUJBQUssR0FBeUIsVUFBVSxDQUFDLElBQUkscUJBQXFCLEVBQUUsQ0FBQyxDQVU3RTtBQUVEO0lBQ0UsWUFBb0IsU0FBK0IsRUFBVSxRQUFhO1FBQXRELGNBQVMsR0FBVCxTQUFTLENBQXNCO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBSztJQUFHLENBQUM7SUFDOUUsTUFBTSxDQUFDLE1BQU0sR0FBYSxJQUFJLEVBQUUsT0FBTyxHQUFRLElBQUk7UUFDakQsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdEQsQ0FBQztBQUNILENBQUM7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q09OU1RfRVhQUiwgQ09OU1QsIHN0cmluZ2lmeSwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7dW5pbXBsZW1lbnRlZCwgQmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcblxuY29uc3QgX1RIUk9XX0lGX05PVF9GT1VORCA9IENPTlNUX0VYUFIobmV3IE9iamVjdCgpKTtcbmV4cG9ydCBjb25zdCBUSFJPV19JRl9OT1RfRk9VTkQgPSBDT05TVF9FWFBSKF9USFJPV19JRl9OT1RfRk9VTkQpO1xuXG5jbGFzcyBfTnVsbEluamVjdG9yIGltcGxlbWVudHMgSW5qZWN0b3Ige1xuICBnZXQodG9rZW46IGFueSwgbm90Rm91bmRWYWx1ZTogYW55ID0gX1RIUk9XX0lGX05PVF9GT1VORCk6IGFueSB7XG4gICAgaWYgKG5vdEZvdW5kVmFsdWUgPT09IF9USFJPV19JRl9OT1RfRk9VTkQpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBObyBwcm92aWRlciBmb3IgJHtzdHJpbmdpZnkodG9rZW4pfSFgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5vdEZvdW5kVmFsdWU7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgSW5qZWN0b3IgaW50ZXJmYWNlLiBUaGlzIGNsYXNzIGNhbiBhbHNvIGJlIHVzZWRcbiAqIHRvIGdldCBob2xkIG9mIGFuIEluamVjdG9yLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSW5qZWN0b3Ige1xuICBzdGF0aWMgVEhST1dfSUZfTk9UX0ZPVU5EID0gX1RIUk9XX0lGX05PVF9GT1VORDtcbiAgc3RhdGljIE5VTEw6IEluamVjdG9yID0gbmV3IF9OdWxsSW5qZWN0b3IoKTtcblxuICAvKipcbiAgICogUmV0cmlldmVzIGFuIGluc3RhbmNlIGZyb20gdGhlIGluamVjdG9yIGJhc2VkIG9uIHRoZSBwcm92aWRlZCB0b2tlbi5cbiAgICogSWYgbm90IGZvdW5kOlxuICAgKiAtIFRocm93cyB7QGxpbmsgTm9Qcm92aWRlckVycm9yfSBpZiBubyBgbm90Rm91bmRWYWx1ZWAgdGhhdCBpcyBub3QgZXF1YWwgdG9cbiAgICogSW5qZWN0b3IuVEhST1dfSUZfTk9UX0ZPVU5EIGlzIGdpdmVuXG4gICAqIC0gUmV0dXJucyB0aGUgYG5vdEZvdW5kVmFsdWVgIG90aGVyd2lzZVxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvSGVYU0hnP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gUmVmbGVjdGl2ZUluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIHByb3ZpZGUoXCJ2YWxpZFRva2VuXCIsIHt1c2VWYWx1ZTogXCJWYWx1ZVwifSlcbiAgICogXSk7XG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoXCJ2YWxpZFRva2VuXCIpKS50b0VxdWFsKFwiVmFsdWVcIik7XG4gICAqIGV4cGVjdCgoKSA9PiBpbmplY3Rvci5nZXQoXCJpbnZhbGlkVG9rZW5cIikpLnRvVGhyb3dFcnJvcigpO1xuICAgKiBgYGBcbiAgICpcbiAgICogYEluamVjdG9yYCByZXR1cm5zIGl0c2VsZiB3aGVuIGdpdmVuIGBJbmplY3RvcmAgYXMgYSB0b2tlbi5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBSZWZsZWN0aXZlSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXSk7XG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoSW5qZWN0b3IpKS50b0JlKGluamVjdG9yKTtcbiAgICogYGBgXG4gICAqL1xuICBnZXQodG9rZW46IGFueSwgbm90Rm91bmRWYWx1ZT86IGFueSk6IGFueSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cbn1cblxuQENPTlNUKClcbmNsYXNzIF9FbXB0eUluamVjdG9yRmFjdG9yeSBpbXBsZW1lbnRzIEluamVjdG9yRmFjdG9yeTxhbnk+IHtcbiAgY3JlYXRlKHBhcmVudDogSW5qZWN0b3IgPSBudWxsLCBjb250ZXh0OiBhbnkgPSBudWxsKTogSW5qZWN0b3Ige1xuICAgIHJldHVybiBpc0JsYW5rKHBhcmVudCkgPyBJbmplY3Rvci5OVUxMIDogcGFyZW50O1xuICB9XG59XG5cbi8qKlxuICogQSBmYWN0b3J5IGZvciBhbiBpbmplY3Rvci5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEluamVjdG9yRmFjdG9yeTxDT05URVhUPiB7XG4gIC8vIEFuIEluamVjdG9yRmFjdG9yeSB0aGF0IHdpbGwgYWx3YXlzIGRlbGVnYXRlIHRvIHRoZSBwYXJlbnQuXG4gIHN0YXRpYyBFTVBUWTogSW5qZWN0b3JGYWN0b3J5PGFueT4gPSBDT05TVF9FWFBSKG5ldyBfRW1wdHlJbmplY3RvckZhY3RvcnkoKSk7XG5cbiAgLyoqXG4gICAqIEJpbmRzIGFuIEluamVjdG9yRmFjdG9yeSB0byBhIGZpeGVkIGNvbnRleHRcbiAgICovXG4gIHN0YXRpYyBiaW5kKGZhY3Rvcnk6IEluamVjdG9yRmFjdG9yeTxhbnk+LCBjb250ZXh0OiBhbnkpOiBJbmplY3RvckZhY3Rvcnk8YW55PiB7XG4gICAgcmV0dXJuIG5ldyBfQm91bmRJbmplY3RvckZhY3RvcnkoZmFjdG9yeSwgY29udGV4dCk7XG4gIH1cblxuICBhYnN0cmFjdCBjcmVhdGUocGFyZW50PzogSW5qZWN0b3IsIGNvbnRleHQ/OiBDT05URVhUKTogSW5qZWN0b3I7XG59XG5cbmNsYXNzIF9Cb3VuZEluamVjdG9yRmFjdG9yeSBpbXBsZW1lbnRzIEluamVjdG9yRmFjdG9yeTxhbnk+IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZGVsZWdhdGU6IEluamVjdG9yRmFjdG9yeTxhbnk+LCBwcml2YXRlIF9jb250ZXh0OiBhbnkpIHt9XG4gIGNyZWF0ZShwYXJlbnQ6IEluamVjdG9yID0gbnVsbCwgY29udGV4dDogYW55ID0gbnVsbCk6IEluamVjdG9yIHtcbiAgICByZXR1cm4gdGhpcy5fZGVsZWdhdGUuY3JlYXRlKHBhcmVudCwgdGhpcy5fY29udGV4dCk7XG4gIH1cbn1cbiJdfQ==