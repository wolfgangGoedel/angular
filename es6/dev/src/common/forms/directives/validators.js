var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { forwardRef, Provider, Attribute, Directive } from 'angular2/core';
import { CONST_EXPR, NumberWrapper } from 'angular2/src/facade/lang';
import { Validators, NG_VALIDATORS } from '../validators';
const REQUIRED = Validators.required;
export const REQUIRED_VALIDATOR = CONST_EXPR(new Provider(NG_VALIDATORS, { useValue: REQUIRED, multi: true }));
/**
 * A Directive that adds the `required` validator to any controls marked with the
 * `required` attribute, via the {@link NG_VALIDATORS} binding.
 *
 * ### Example
 *
 * ```
 * <input ngControl="fullName" required>
 * ```
 */
export let RequiredValidator = class RequiredValidator {
};
RequiredValidator = __decorate([
    Directive({
        selector: '[required][ngControl],[required][ngFormControl],[required][ngModel]',
        providers: [REQUIRED_VALIDATOR]
    }), 
    __metadata('design:paramtypes', [])
], RequiredValidator);
/**
 * Provivder which adds {@link MinLengthValidator} to {@link NG_VALIDATORS}.
 *
 * ## Example:
 *
 * {@example common/forms/ts/validators/validators.ts region='min'}
 */
export const MIN_LENGTH_VALIDATOR = CONST_EXPR(new Provider(NG_VALIDATORS, { useExisting: forwardRef(() => MinLengthValidator), multi: true }));
/**
 * A directive which installs the {@link MinLengthValidator} for any `ngControl`,
 * `ngFormControl`, or control with `ngModel` that also has a `minlength` attribute.
 */
export let MinLengthValidator = class MinLengthValidator {
    constructor(minLength) {
        this._validator = Validators.minLength(NumberWrapper.parseInt(minLength, 10));
    }
    validate(c) { return this._validator(c); }
};
MinLengthValidator = __decorate([
    Directive({
        selector: '[minlength][ngControl],[minlength][ngFormControl],[minlength][ngModel]',
        providers: [MIN_LENGTH_VALIDATOR]
    }),
    __param(0, Attribute("minlength")), 
    __metadata('design:paramtypes', [String])
], MinLengthValidator);
/**
 * Provider which adds {@link MaxLengthValidator} to {@link NG_VALIDATORS}.
 *
 * ## Example:
 *
 * {@example common/forms/ts/validators/validators.ts region='max'}
 */
export const MAX_LENGTH_VALIDATOR = CONST_EXPR(new Provider(NG_VALIDATORS, { useExisting: forwardRef(() => MaxLengthValidator), multi: true }));
/**
 * A directive which installs the {@link MaxLengthValidator} for any `ngControl, `ngFormControl`,
 * or control with `ngModel` that also has a `maxlength` attribute.
 */
export let MaxLengthValidator = class MaxLengthValidator {
    constructor(maxLength) {
        this._validator = Validators.maxLength(NumberWrapper.parseInt(maxLength, 10));
    }
    validate(c) { return this._validator(c); }
};
MaxLengthValidator = __decorate([
    Directive({
        selector: '[maxlength][ngControl],[maxlength][ngFormControl],[maxlength][ngModel]',
        providers: [MAX_LENGTH_VALIDATOR]
    }),
    __param(0, Attribute("maxlength")), 
    __metadata('design:paramtypes', [String])
], MaxLengthValidator);
/**
 * A Directive that adds the `pattern` validator to any controls marked with the
 * `pattern` attribute, via the {@link NG_VALIDATORS} binding. Uses attribute value
 * as the regex to validate Control value against.  Follows pattern attribute
 * semantics; i.e. regex must match entire Control value.
 *
 * ### Example
 *
 * ```
 * <input [ngControl]="fullName" pattern="[a-zA-Z ]*">
 * ```
 */
export const PATTERN_VALIDATOR = CONST_EXPR(new Provider(NG_VALIDATORS, { useExisting: forwardRef(() => PatternValidator), multi: true }));
export let PatternValidator = class PatternValidator {
    constructor(pattern) {
        this._validator = Validators.pattern(pattern);
    }
    validate(c) { return this._validator(c); }
};
PatternValidator = __decorate([
    Directive({
        selector: '[pattern][ngControl],[pattern][ngFormControl],[pattern][ngModel]',
        providers: [PATTERN_VALIDATOR]
    }),
    __param(0, Attribute("pattern")), 
    __metadata('design:paramtypes', [String])
], PatternValidator);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtSzJwNlRDSEMudG1wL2FuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy92YWxpZGF0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztPQUFPLEVBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFDLE1BQU0sZUFBZTtPQUNqRSxFQUFDLFVBQVUsRUFBRSxhQUFhLEVBQUMsTUFBTSwwQkFBMEI7T0FDM0QsRUFBQyxVQUFVLEVBQUUsYUFBYSxFQUFDLE1BQU0sZUFBZTtBQXlCdkQsTUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztBQUVyQyxPQUFPLE1BQU0sa0JBQWtCLEdBQzNCLFVBQVUsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxhQUFhLEVBQUUsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFFL0U7Ozs7Ozs7OztHQVNHO0FBS0g7QUFDQSxDQUFDO0FBTEQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUscUVBQXFFO1FBQy9FLFNBQVMsRUFBRSxDQUFDLGtCQUFrQixDQUFDO0tBQ2hDLENBQUM7O3FCQUFBO0FBU0Y7Ozs7OztHQU1HO0FBQ0gsT0FBTyxNQUFNLG9CQUFvQixHQUFHLFVBQVUsQ0FDMUMsSUFBSSxRQUFRLENBQUMsYUFBYSxFQUFFLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxNQUFNLGtCQUFrQixDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQztBQUVuRzs7O0dBR0c7QUFLSDtJQUdFLFlBQW9DLFNBQWlCO1FBQ25ELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFFRCxRQUFRLENBQUMsQ0FBa0IsSUFBMEIsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25GLENBQUM7QUFaRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSx3RUFBd0U7UUFDbEYsU0FBUyxFQUFFLENBQUMsb0JBQW9CLENBQUM7S0FDbEMsQ0FBQztlQUlhLFNBQVMsQ0FBQyxXQUFXLENBQUM7O3NCQUpuQztBQVdGOzs7Ozs7R0FNRztBQUNILE9BQU8sTUFBTSxvQkFBb0IsR0FBRyxVQUFVLENBQzFDLElBQUksUUFBUSxDQUFDLGFBQWEsRUFBRSxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsTUFBTSxrQkFBa0IsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFFbkc7OztHQUdHO0FBS0g7SUFHRSxZQUFvQyxTQUFpQjtRQUNuRCxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNoRixDQUFDO0lBRUQsUUFBUSxDQUFDLENBQWtCLElBQTBCLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuRixDQUFDO0FBWkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsd0VBQXdFO1FBQ2xGLFNBQVMsRUFBRSxDQUFDLG9CQUFvQixDQUFDO0tBQ2xDLENBQUM7ZUFJYSxTQUFTLENBQUMsV0FBVyxDQUFDOztzQkFKbkM7QUFZRjs7Ozs7Ozs7Ozs7R0FXRztBQUNILE9BQU8sTUFBTSxpQkFBaUIsR0FBRyxVQUFVLENBQ3ZDLElBQUksUUFBUSxDQUFDLGFBQWEsRUFBRSxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsTUFBTSxnQkFBZ0IsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFLakc7SUFHRSxZQUFrQyxPQUFlO1FBQy9DLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQsUUFBUSxDQUFDLENBQWtCLElBQTBCLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuRixDQUFDO0FBWkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsa0VBQWtFO1FBQzVFLFNBQVMsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0tBQy9CLENBQUM7ZUFJYSxTQUFTLENBQUMsU0FBUyxDQUFDOztvQkFKakM7QUFTRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Zm9yd2FyZFJlZiwgUHJvdmlkZXIsIEF0dHJpYnV0ZSwgRGlyZWN0aXZlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7Q09OU1RfRVhQUiwgTnVtYmVyV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7VmFsaWRhdG9ycywgTkdfVkFMSURBVE9SU30gZnJvbSAnLi4vdmFsaWRhdG9ycyc7XG5pbXBvcnQge0Fic3RyYWN0Q29udHJvbH0gZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0ICogYXMgbW9kZWxNb2R1bGUgZnJvbSAnLi4vbW9kZWwnO1xuXG5cblxuLyoqXG4gKiBBbiBpbnRlcmZhY2UgdGhhdCBjYW4gYmUgaW1wbGVtZW50ZWQgYnkgY2xhc3NlcyB0aGF0IGNhbiBhY3QgYXMgdmFsaWRhdG9ycy5cbiAqXG4gKiAjIyBVc2FnZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ1tjdXN0b20tdmFsaWRhdG9yXScsXG4gKiAgIHByb3ZpZGVyczogW3Byb3ZpZGUoTkdfVkFMSURBVE9SUywge3VzZUV4aXN0aW5nOiBDdXN0b21WYWxpZGF0b3JEaXJlY3RpdmUsIG11bHRpOiB0cnVlfSldXG4gKiB9KVxuICogY2xhc3MgQ3VzdG9tVmFsaWRhdG9yRGlyZWN0aXZlIGltcGxlbWVudHMgVmFsaWRhdG9yIHtcbiAqICAgdmFsaWRhdGUoYzogQ29udHJvbCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAqICAgICByZXR1cm4ge1wiY3VzdG9tXCI6IHRydWV9O1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0b3IgeyB2YWxpZGF0ZShjOiBtb2RlbE1vZHVsZS5BYnN0cmFjdENvbnRyb2wpOiB7W2tleTogc3RyaW5nXTogYW55fTsgfVxuXG5jb25zdCBSRVFVSVJFRCA9IFZhbGlkYXRvcnMucmVxdWlyZWQ7XG5cbmV4cG9ydCBjb25zdCBSRVFVSVJFRF9WQUxJREFUT1IgPVxuICAgIENPTlNUX0VYUFIobmV3IFByb3ZpZGVyKE5HX1ZBTElEQVRPUlMsIHt1c2VWYWx1ZTogUkVRVUlSRUQsIG11bHRpOiB0cnVlfSkpO1xuXG4vKipcbiAqIEEgRGlyZWN0aXZlIHRoYXQgYWRkcyB0aGUgYHJlcXVpcmVkYCB2YWxpZGF0b3IgdG8gYW55IGNvbnRyb2xzIG1hcmtlZCB3aXRoIHRoZVxuICogYHJlcXVpcmVkYCBhdHRyaWJ1dGUsIHZpYSB0aGUge0BsaW5rIE5HX1ZBTElEQVRPUlN9IGJpbmRpbmcuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIDxpbnB1dCBuZ0NvbnRyb2w9XCJmdWxsTmFtZVwiIHJlcXVpcmVkPlxuICogYGBgXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tyZXF1aXJlZF1bbmdDb250cm9sXSxbcmVxdWlyZWRdW25nRm9ybUNvbnRyb2xdLFtyZXF1aXJlZF1bbmdNb2RlbF0nLFxuICBwcm92aWRlcnM6IFtSRVFVSVJFRF9WQUxJREFUT1JdXG59KVxuZXhwb3J0IGNsYXNzIFJlcXVpcmVkVmFsaWRhdG9yIHtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0b3JGbiB7IChjOiBBYnN0cmFjdENvbnRyb2wpOiB7W2tleTogc3RyaW5nXTogYW55fTsgfVxuZXhwb3J0IGludGVyZmFjZSBBc3luY1ZhbGlkYXRvckZuIHtcbiAgKGM6IEFic3RyYWN0Q29udHJvbCk6IGFueSAvKlByb21pc2U8e1trZXk6IHN0cmluZ106IGFueX0+fE9ic2VydmFibGU8e1trZXk6IHN0cmluZ106IGFueX0+Ki87XG59XG5cbi8qKlxuICogUHJvdml2ZGVyIHdoaWNoIGFkZHMge0BsaW5rIE1pbkxlbmd0aFZhbGlkYXRvcn0gdG8ge0BsaW5rIE5HX1ZBTElEQVRPUlN9LlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9mb3Jtcy90cy92YWxpZGF0b3JzL3ZhbGlkYXRvcnMudHMgcmVnaW9uPSdtaW4nfVxuICovXG5leHBvcnQgY29uc3QgTUlOX0xFTkdUSF9WQUxJREFUT1IgPSBDT05TVF9FWFBSKFxuICAgIG5ldyBQcm92aWRlcihOR19WQUxJREFUT1JTLCB7dXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTWluTGVuZ3RoVmFsaWRhdG9yKSwgbXVsdGk6IHRydWV9KSk7XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgd2hpY2ggaW5zdGFsbHMgdGhlIHtAbGluayBNaW5MZW5ndGhWYWxpZGF0b3J9IGZvciBhbnkgYG5nQ29udHJvbGAsXG4gKiBgbmdGb3JtQ29udHJvbGAsIG9yIGNvbnRyb2wgd2l0aCBgbmdNb2RlbGAgdGhhdCBhbHNvIGhhcyBhIGBtaW5sZW5ndGhgIGF0dHJpYnV0ZS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW21pbmxlbmd0aF1bbmdDb250cm9sXSxbbWlubGVuZ3RoXVtuZ0Zvcm1Db250cm9sXSxbbWlubGVuZ3RoXVtuZ01vZGVsXScsXG4gIHByb3ZpZGVyczogW01JTl9MRU5HVEhfVkFMSURBVE9SXVxufSlcbmV4cG9ydCBjbGFzcyBNaW5MZW5ndGhWYWxpZGF0b3IgaW1wbGVtZW50cyBWYWxpZGF0b3Ige1xuICBwcml2YXRlIF92YWxpZGF0b3I6IFZhbGlkYXRvckZuO1xuXG4gIGNvbnN0cnVjdG9yKEBBdHRyaWJ1dGUoXCJtaW5sZW5ndGhcIikgbWluTGVuZ3RoOiBzdHJpbmcpIHtcbiAgICB0aGlzLl92YWxpZGF0b3IgPSBWYWxpZGF0b3JzLm1pbkxlbmd0aChOdW1iZXJXcmFwcGVyLnBhcnNlSW50KG1pbkxlbmd0aCwgMTApKTtcbiAgfVxuXG4gIHZhbGlkYXRlKGM6IEFic3RyYWN0Q29udHJvbCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHsgcmV0dXJuIHRoaXMuX3ZhbGlkYXRvcihjKTsgfVxufVxuXG4vKipcbiAqIFByb3ZpZGVyIHdoaWNoIGFkZHMge0BsaW5rIE1heExlbmd0aFZhbGlkYXRvcn0gdG8ge0BsaW5rIE5HX1ZBTElEQVRPUlN9LlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9mb3Jtcy90cy92YWxpZGF0b3JzL3ZhbGlkYXRvcnMudHMgcmVnaW9uPSdtYXgnfVxuICovXG5leHBvcnQgY29uc3QgTUFYX0xFTkdUSF9WQUxJREFUT1IgPSBDT05TVF9FWFBSKFxuICAgIG5ldyBQcm92aWRlcihOR19WQUxJREFUT1JTLCB7dXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTWF4TGVuZ3RoVmFsaWRhdG9yKSwgbXVsdGk6IHRydWV9KSk7XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgd2hpY2ggaW5zdGFsbHMgdGhlIHtAbGluayBNYXhMZW5ndGhWYWxpZGF0b3J9IGZvciBhbnkgYG5nQ29udHJvbCwgYG5nRm9ybUNvbnRyb2xgLFxuICogb3IgY29udHJvbCB3aXRoIGBuZ01vZGVsYCB0aGF0IGFsc28gaGFzIGEgYG1heGxlbmd0aGAgYXR0cmlidXRlLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbWF4bGVuZ3RoXVtuZ0NvbnRyb2xdLFttYXhsZW5ndGhdW25nRm9ybUNvbnRyb2xdLFttYXhsZW5ndGhdW25nTW9kZWxdJyxcbiAgcHJvdmlkZXJzOiBbTUFYX0xFTkdUSF9WQUxJREFUT1JdXG59KVxuZXhwb3J0IGNsYXNzIE1heExlbmd0aFZhbGlkYXRvciBpbXBsZW1lbnRzIFZhbGlkYXRvciB7XG4gIHByaXZhdGUgX3ZhbGlkYXRvcjogVmFsaWRhdG9yRm47XG5cbiAgY29uc3RydWN0b3IoQEF0dHJpYnV0ZShcIm1heGxlbmd0aFwiKSBtYXhMZW5ndGg6IHN0cmluZykge1xuICAgIHRoaXMuX3ZhbGlkYXRvciA9IFZhbGlkYXRvcnMubWF4TGVuZ3RoKE51bWJlcldyYXBwZXIucGFyc2VJbnQobWF4TGVuZ3RoLCAxMCkpO1xuICB9XG5cbiAgdmFsaWRhdGUoYzogQWJzdHJhY3RDb250cm9sKToge1trZXk6IHN0cmluZ106IGFueX0geyByZXR1cm4gdGhpcy5fdmFsaWRhdG9yKGMpOyB9XG59XG5cblxuLyoqXG4gKiBBIERpcmVjdGl2ZSB0aGF0IGFkZHMgdGhlIGBwYXR0ZXJuYCB2YWxpZGF0b3IgdG8gYW55IGNvbnRyb2xzIG1hcmtlZCB3aXRoIHRoZVxuICogYHBhdHRlcm5gIGF0dHJpYnV0ZSwgdmlhIHRoZSB7QGxpbmsgTkdfVkFMSURBVE9SU30gYmluZGluZy4gVXNlcyBhdHRyaWJ1dGUgdmFsdWVcbiAqIGFzIHRoZSByZWdleCB0byB2YWxpZGF0ZSBDb250cm9sIHZhbHVlIGFnYWluc3QuICBGb2xsb3dzIHBhdHRlcm4gYXR0cmlidXRlXG4gKiBzZW1hbnRpY3M7IGkuZS4gcmVnZXggbXVzdCBtYXRjaCBlbnRpcmUgQ29udHJvbCB2YWx1ZS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogPGlucHV0IFtuZ0NvbnRyb2xdPVwiZnVsbE5hbWVcIiBwYXR0ZXJuPVwiW2EtekEtWiBdKlwiPlxuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBQQVRURVJOX1ZBTElEQVRPUiA9IENPTlNUX0VYUFIoXG4gICAgbmV3IFByb3ZpZGVyKE5HX1ZBTElEQVRPUlMsIHt1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBQYXR0ZXJuVmFsaWRhdG9yKSwgbXVsdGk6IHRydWV9KSk7XG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbcGF0dGVybl1bbmdDb250cm9sXSxbcGF0dGVybl1bbmdGb3JtQ29udHJvbF0sW3BhdHRlcm5dW25nTW9kZWxdJyxcbiAgcHJvdmlkZXJzOiBbUEFUVEVSTl9WQUxJREFUT1JdXG59KVxuZXhwb3J0IGNsYXNzIFBhdHRlcm5WYWxpZGF0b3IgaW1wbGVtZW50cyBWYWxpZGF0b3Ige1xuICBwcml2YXRlIF92YWxpZGF0b3I6IFZhbGlkYXRvckZuO1xuXG4gIGNvbnN0cnVjdG9yKEBBdHRyaWJ1dGUoXCJwYXR0ZXJuXCIpIHBhdHRlcm46IHN0cmluZykge1xuICAgIHRoaXMuX3ZhbGlkYXRvciA9IFZhbGlkYXRvcnMucGF0dGVybihwYXR0ZXJuKTtcbiAgfVxuXG4gIHZhbGlkYXRlKGM6IEFic3RyYWN0Q29udHJvbCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHsgcmV0dXJuIHRoaXMuX3ZhbGlkYXRvcihjKTsgfVxufVxuIl19