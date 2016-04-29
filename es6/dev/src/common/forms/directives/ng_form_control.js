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
import { CONST_EXPR } from 'angular2/src/facade/lang';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { EventEmitter, ObservableWrapper } from 'angular2/src/facade/async';
import { Directive, forwardRef, Provider, Inject, Optional, Self } from 'angular2/core';
import { NgControl } from './ng_control';
import { NG_VALIDATORS, NG_ASYNC_VALIDATORS } from '../validators';
import { NG_VALUE_ACCESSOR } from './control_value_accessor';
import { setUpControl, composeValidators, composeAsyncValidators, isPropertyUpdated, selectValueAccessor } from './shared';
export const formControlBinding = CONST_EXPR(new Provider(NgControl, { useExisting: forwardRef(() => NgFormControl) }));
/**
 * Binds an existing {@link Control} to a DOM element.
 *
 * ### Example ([live demo](http://plnkr.co/edit/jcQlZ2tTh22BZZ2ucNAT?p=preview))
 *
 * In this example, we bind the control to an input element. When the value of the input element
 * changes, the value of the control will reflect that change. Likewise, if the value of the
 * control changes, the input element reflects that change.
 *
 *  ```typescript
 * @Component({
 *   selector: 'my-app',
 *   template: `
 *     <div>
 *       <h2>NgFormControl Example</h2>
 *       <form>
 *         <p>Element with existing control: <input type="text"
 * [ngFormControl]="loginControl"></p>
 *         <p>Value of existing control: {{loginControl.value}}</p>
 *       </form>
 *     </div>
 *   `,
 *   directives: [CORE_DIRECTIVES, FORM_DIRECTIVES]
 * })
 * export class App {
 *   loginControl: Control = new Control('');
 * }
 *  ```
 *
 * ### ngModel
 *
 * We can also use `ngModel` to bind a domain model to the form.
 *
 * ### Example ([live demo](http://plnkr.co/edit/yHMLuHO7DNgT8XvtjTDH?p=preview))
 *
 *  ```typescript
 * @Component({
 *      selector: "login-comp",
 *      directives: [FORM_DIRECTIVES],
 *      template: "<input type='text' [ngFormControl]='loginControl' [(ngModel)]='login'>"
 *      })
 * class LoginComp {
 *  loginControl: Control = new Control('');
 *  login:string;
 * }
 *  ```
 */
export let NgFormControl = class NgFormControl extends NgControl {
    constructor(_validators, _asyncValidators, valueAccessors) {
        super();
        this._validators = _validators;
        this._asyncValidators = _asyncValidators;
        this.update = new EventEmitter();
        this.valueAccessor = selectValueAccessor(this, valueAccessors);
    }
    ngOnChanges(changes) {
        if (this._isControlChanged(changes)) {
            setUpControl(this.form, this);
            this.form.updateValueAndValidity({ emitEvent: false });
        }
        if (isPropertyUpdated(changes, this.viewModel)) {
            this.form.updateValue(this.model);
            this.viewModel = this.model;
        }
    }
    get path() { return []; }
    get validator() { return composeValidators(this._validators); }
    get asyncValidator() { return composeAsyncValidators(this._asyncValidators); }
    get control() { return this.form; }
    viewToModelUpdate(newValue) {
        this.viewModel = newValue;
        ObservableWrapper.callEmit(this.update, newValue);
    }
    _isControlChanged(changes) {
        return StringMapWrapper.contains(changes, "form");
    }
};
NgFormControl = __decorate([
    Directive({
        selector: '[ngFormControl]',
        bindings: [formControlBinding],
        inputs: ['form: ngFormControl', 'model: ngModel'],
        outputs: ['update: ngModelChange'],
        exportAs: 'ngForm'
    }),
    __param(0, Optional()),
    __param(0, Self()),
    __param(0, Inject(NG_VALIDATORS)),
    __param(1, Optional()),
    __param(1, Self()),
    __param(1, Inject(NG_ASYNC_VALIDATORS)),
    __param(2, Optional()),
    __param(2, Self()),
    __param(2, Inject(NG_VALUE_ACCESSOR)), 
    __metadata('design:paramtypes', [Array, Array, Array])
], NgFormControl);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9ybV9jb250cm9sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1LMnA2VENIQy50bXAvYW5ndWxhcjIvc3JjL2NvbW1vbi9mb3Jtcy9kaXJlY3RpdmVzL25nX2Zvcm1fY29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtPQUM1QyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sZ0NBQWdDO09BQ3hELEVBQUMsWUFBWSxFQUFFLGlCQUFpQixFQUFDLE1BQU0sMkJBQTJCO09BQ2xFLEVBSUwsU0FBUyxFQUNULFVBQVUsRUFDVixRQUFRLEVBQ1IsTUFBTSxFQUNOLFFBQVEsRUFDUixJQUFJLEVBQ0wsTUFBTSxlQUFlO09BQ2YsRUFBQyxTQUFTLEVBQUMsTUFBTSxjQUFjO09BRS9CLEVBQWEsYUFBYSxFQUFFLG1CQUFtQixFQUFDLE1BQU0sZUFBZTtPQUNyRSxFQUF1QixpQkFBaUIsRUFBQyxNQUFNLDBCQUEwQjtPQUN6RSxFQUNMLFlBQVksRUFDWixpQkFBaUIsRUFDakIsc0JBQXNCLEVBQ3RCLGlCQUFpQixFQUNqQixtQkFBbUIsRUFDcEIsTUFBTSxVQUFVO0FBR2pCLE9BQU8sTUFBTSxrQkFBa0IsR0FDM0IsVUFBVSxDQUFDLElBQUksUUFBUSxDQUFDLFNBQVMsRUFBRSxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsTUFBTSxhQUFhLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztBQUV4Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQThDRztBQVFILHVEQUFtQyxTQUFTO0lBTTFDLFlBQStELFdBQ1YsRUFDZ0IsZ0JBQ2hCLEVBRXpDLGNBQXNDO1FBQ2hELE9BQU8sQ0FBQztRQU5xRCxnQkFBVyxHQUFYLFdBQVcsQ0FDckI7UUFDZ0IscUJBQWdCLEdBQWhCLGdCQUFnQixDQUNoQztRQVByRCxXQUFNLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQVcxQixJQUFJLENBQUMsYUFBYSxHQUFHLG1CQUFtQixDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQsV0FBVyxDQUFDLE9BQXNDO1FBQ2hELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxFQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQzlCLENBQUM7SUFDSCxDQUFDO0lBRUQsSUFBSSxJQUFJLEtBQWUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFbkMsSUFBSSxTQUFTLEtBQWtCLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTVFLElBQUksY0FBYyxLQUF1QixNQUFNLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRWhHLElBQUksT0FBTyxLQUFjLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUU1QyxpQkFBaUIsQ0FBQyxRQUFhO1FBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFTyxpQkFBaUIsQ0FBQyxPQUE2QjtRQUNyRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNwRCxDQUFDO0FBQ0gsQ0FBQztBQWxERDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxpQkFBaUI7UUFDM0IsUUFBUSxFQUFFLENBQUMsa0JBQWtCLENBQUM7UUFDOUIsTUFBTSxFQUFFLENBQUMscUJBQXFCLEVBQUUsZ0JBQWdCLENBQUM7UUFDakQsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUM7UUFDbEMsUUFBUSxFQUFFLFFBQVE7S0FDbkIsQ0FBQztlQU9hLFFBQVEsRUFBRTtlQUFFLElBQUksRUFBRTtlQUFFLE1BQU0sQ0FBQyxhQUFhLENBQUM7ZUFFekMsUUFBUSxFQUFFO2VBQUUsSUFBSSxFQUFFO2VBQUUsTUFBTSxDQUFDLG1CQUFtQixDQUFDO2VBRS9DLFFBQVEsRUFBRTtlQUFFLElBQUksRUFBRTtlQUFFLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQzs7aUJBWDFEO0FBNENEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7XG4gIE9uQ2hhbmdlcyxcbiAgU2ltcGxlQ2hhbmdlLFxuICBRdWVyeSxcbiAgRGlyZWN0aXZlLFxuICBmb3J3YXJkUmVmLFxuICBQcm92aWRlcixcbiAgSW5qZWN0LFxuICBPcHRpb25hbCxcbiAgU2VsZlxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7TmdDb250cm9sfSBmcm9tICcuL25nX2NvbnRyb2wnO1xuaW1wb3J0IHtDb250cm9sfSBmcm9tICcuLi9tb2RlbCc7XG5pbXBvcnQge1ZhbGlkYXRvcnMsIE5HX1ZBTElEQVRPUlMsIE5HX0FTWU5DX1ZBTElEQVRPUlN9IGZyb20gJy4uL3ZhbGlkYXRvcnMnO1xuaW1wb3J0IHtDb250cm9sVmFsdWVBY2Nlc3NvciwgTkdfVkFMVUVfQUNDRVNTT1J9IGZyb20gJy4vY29udHJvbF92YWx1ZV9hY2Nlc3Nvcic7XG5pbXBvcnQge1xuICBzZXRVcENvbnRyb2wsXG4gIGNvbXBvc2VWYWxpZGF0b3JzLFxuICBjb21wb3NlQXN5bmNWYWxpZGF0b3JzLFxuICBpc1Byb3BlcnR5VXBkYXRlZCxcbiAgc2VsZWN0VmFsdWVBY2Nlc3NvclxufSBmcm9tICcuL3NoYXJlZCc7XG5pbXBvcnQge1ZhbGlkYXRvckZuLCBBc3luY1ZhbGlkYXRvckZufSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuXG5leHBvcnQgY29uc3QgZm9ybUNvbnRyb2xCaW5kaW5nID1cbiAgICBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihOZ0NvbnRyb2wsIHt1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBOZ0Zvcm1Db250cm9sKX0pKTtcblxuLyoqXG4gKiBCaW5kcyBhbiBleGlzdGluZyB7QGxpbmsgQ29udHJvbH0gdG8gYSBET00gZWxlbWVudC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvamNRbFoydFRoMjJCWloydWNOQVQ/cD1wcmV2aWV3KSlcbiAqXG4gKiBJbiB0aGlzIGV4YW1wbGUsIHdlIGJpbmQgdGhlIGNvbnRyb2wgdG8gYW4gaW5wdXQgZWxlbWVudC4gV2hlbiB0aGUgdmFsdWUgb2YgdGhlIGlucHV0IGVsZW1lbnRcbiAqIGNoYW5nZXMsIHRoZSB2YWx1ZSBvZiB0aGUgY29udHJvbCB3aWxsIHJlZmxlY3QgdGhhdCBjaGFuZ2UuIExpa2V3aXNlLCBpZiB0aGUgdmFsdWUgb2YgdGhlXG4gKiBjb250cm9sIGNoYW5nZXMsIHRoZSBpbnB1dCBlbGVtZW50IHJlZmxlY3RzIHRoYXQgY2hhbmdlLlxuICpcbiAqICBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1hcHAnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxkaXY+XG4gKiAgICAgICA8aDI+TmdGb3JtQ29udHJvbCBFeGFtcGxlPC9oMj5cbiAqICAgICAgIDxmb3JtPlxuICogICAgICAgICA8cD5FbGVtZW50IHdpdGggZXhpc3RpbmcgY29udHJvbDogPGlucHV0IHR5cGU9XCJ0ZXh0XCJcbiAqIFtuZ0Zvcm1Db250cm9sXT1cImxvZ2luQ29udHJvbFwiPjwvcD5cbiAqICAgICAgICAgPHA+VmFsdWUgb2YgZXhpc3RpbmcgY29udHJvbDoge3tsb2dpbkNvbnRyb2wudmFsdWV9fTwvcD5cbiAqICAgICAgIDwvZm9ybT5cbiAqICAgICA8L2Rpdj5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW0NPUkVfRElSRUNUSVZFUywgRk9STV9ESVJFQ1RJVkVTXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBBcHAge1xuICogICBsb2dpbkNvbnRyb2w6IENvbnRyb2wgPSBuZXcgQ29udHJvbCgnJyk7XG4gKiB9XG4gKiAgYGBgXG4gKlxuICogIyMjIG5nTW9kZWxcbiAqXG4gKiBXZSBjYW4gYWxzbyB1c2UgYG5nTW9kZWxgIHRvIGJpbmQgYSBkb21haW4gbW9kZWwgdG8gdGhlIGZvcm0uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L3lITUx1SE83RE5nVDhYdnRqVERIP3A9cHJldmlldykpXG4gKlxuICogIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICAgICBzZWxlY3RvcjogXCJsb2dpbi1jb21wXCIsXG4gKiAgICAgIGRpcmVjdGl2ZXM6IFtGT1JNX0RJUkVDVElWRVNdLFxuICogICAgICB0ZW1wbGF0ZTogXCI8aW5wdXQgdHlwZT0ndGV4dCcgW25nRm9ybUNvbnRyb2xdPSdsb2dpbkNvbnRyb2wnIFsobmdNb2RlbCldPSdsb2dpbic+XCJcbiAqICAgICAgfSlcbiAqIGNsYXNzIExvZ2luQ29tcCB7XG4gKiAgbG9naW5Db250cm9sOiBDb250cm9sID0gbmV3IENvbnRyb2woJycpO1xuICogIGxvZ2luOnN0cmluZztcbiAqIH1cbiAqICBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW25nRm9ybUNvbnRyb2xdJyxcbiAgYmluZGluZ3M6IFtmb3JtQ29udHJvbEJpbmRpbmddLFxuICBpbnB1dHM6IFsnZm9ybTogbmdGb3JtQ29udHJvbCcsICdtb2RlbDogbmdNb2RlbCddLFxuICBvdXRwdXRzOiBbJ3VwZGF0ZTogbmdNb2RlbENoYW5nZSddLFxuICBleHBvcnRBczogJ25nRm9ybSdcbn0pXG5leHBvcnQgY2xhc3MgTmdGb3JtQ29udHJvbCBleHRlbmRzIE5nQ29udHJvbCBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG4gIGZvcm06IENvbnRyb2w7XG4gIHVwZGF0ZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgbW9kZWw6IGFueTtcbiAgdmlld01vZGVsOiBhbnk7XG5cbiAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX1ZBTElEQVRPUlMpIHByaXZhdGUgX3ZhbGlkYXRvcnM6XG4gICAgICAgICAgICAgICAgICAvKiBBcnJheTxWYWxpZGF0b3J8RnVuY3Rpb24+ICovIGFueVtdLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfQVNZTkNfVkFMSURBVE9SUykgcHJpdmF0ZSBfYXN5bmNWYWxpZGF0b3JzOlxuICAgICAgICAgICAgICAgICAgLyogQXJyYXk8VmFsaWRhdG9yfEZ1bmN0aW9uPiAqLyBhbnlbXSxcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX1ZBTFVFX0FDQ0VTU09SKVxuICAgICAgICAgICAgICB2YWx1ZUFjY2Vzc29yczogQ29udHJvbFZhbHVlQWNjZXNzb3JbXSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy52YWx1ZUFjY2Vzc29yID0gc2VsZWN0VmFsdWVBY2Nlc3Nvcih0aGlzLCB2YWx1ZUFjY2Vzc29ycyk7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiB7W2tleTogc3RyaW5nXTogU2ltcGxlQ2hhbmdlfSk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9pc0NvbnRyb2xDaGFuZ2VkKGNoYW5nZXMpKSB7XG4gICAgICBzZXRVcENvbnRyb2wodGhpcy5mb3JtLCB0aGlzKTtcbiAgICAgIHRoaXMuZm9ybS51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gICAgfVxuICAgIGlmIChpc1Byb3BlcnR5VXBkYXRlZChjaGFuZ2VzLCB0aGlzLnZpZXdNb2RlbCkpIHtcbiAgICAgIHRoaXMuZm9ybS51cGRhdGVWYWx1ZSh0aGlzLm1vZGVsKTtcbiAgICAgIHRoaXMudmlld01vZGVsID0gdGhpcy5tb2RlbDtcbiAgICB9XG4gIH1cblxuICBnZXQgcGF0aCgpOiBzdHJpbmdbXSB7IHJldHVybiBbXTsgfVxuXG4gIGdldCB2YWxpZGF0b3IoKTogVmFsaWRhdG9yRm4geyByZXR1cm4gY29tcG9zZVZhbGlkYXRvcnModGhpcy5fdmFsaWRhdG9ycyk7IH1cblxuICBnZXQgYXN5bmNWYWxpZGF0b3IoKTogQXN5bmNWYWxpZGF0b3JGbiB7IHJldHVybiBjb21wb3NlQXN5bmNWYWxpZGF0b3JzKHRoaXMuX2FzeW5jVmFsaWRhdG9ycyk7IH1cblxuICBnZXQgY29udHJvbCgpOiBDb250cm9sIHsgcmV0dXJuIHRoaXMuZm9ybTsgfVxuXG4gIHZpZXdUb01vZGVsVXBkYXRlKG5ld1ZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnZpZXdNb2RlbCA9IG5ld1ZhbHVlO1xuICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMudXBkYXRlLCBuZXdWYWx1ZSk7XG4gIH1cblxuICBwcml2YXRlIF9pc0NvbnRyb2xDaGFuZ2VkKGNoYW5nZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIFN0cmluZ01hcFdyYXBwZXIuY29udGFpbnMoY2hhbmdlcywgXCJmb3JtXCIpO1xuICB9XG59XG4iXX0=