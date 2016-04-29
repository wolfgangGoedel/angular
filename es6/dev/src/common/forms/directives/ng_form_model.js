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
import { CONST_EXPR, isBlank } from 'angular2/src/facade/lang';
import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ObservableWrapper, EventEmitter } from 'angular2/src/facade/async';
import { Directive, forwardRef, Provider, Inject, Optional, Self } from 'angular2/core';
import { ControlContainer } from './control_container';
import { setUpControl, setUpControlGroup, composeValidators, composeAsyncValidators } from './shared';
import { Validators, NG_VALIDATORS, NG_ASYNC_VALIDATORS } from '../validators';
export const formDirectiveProvider = CONST_EXPR(new Provider(ControlContainer, { useExisting: forwardRef(() => NgFormModel) }));
/**
 * Binds an existing control group to a DOM element.
 *
 * ### Example ([live demo](http://plnkr.co/edit/jqrVirudY8anJxTMUjTP?p=preview))
 *
 * In this example, we bind the control group to the form element, and we bind the login and
 * password controls to the login and password elements.
 *
 *  ```typescript
 * @Component({
 *   selector: 'my-app',
 *   template: `
 *     <div>
 *       <h2>NgFormModel Example</h2>
 *       <form [ngFormModel]="loginForm">
 *         <p>Login: <input type="text" ngControl="login"></p>
 *         <p>Password: <input type="password" ngControl="password"></p>
 *       </form>
 *       <p>Value:</p>
 *       <pre>{{value}}</pre>
 *     </div>
 *   `,
 *   directives: [FORM_DIRECTIVES]
 * })
 * export class App {
 *   loginForm: ControlGroup;
 *
 *   constructor() {
 *     this.loginForm = new ControlGroup({
 *       login: new Control(""),
 *       password: new Control("")
 *     });
 *   }
 *
 *   get value(): string {
 *     return JSON.stringify(this.loginForm.value, null, 2);
 *   }
 * }
 *  ```
 *
 * We can also use ngModel to bind a domain model to the form.
 *
 *  ```typescript
 * @Component({
 *      selector: "login-comp",
 *      directives: [FORM_DIRECTIVES],
 *      template: `
 *        <form [ngFormModel]='loginForm'>
 *          Login <input type='text' ngControl='login' [(ngModel)]='credentials.login'>
 *          Password <input type='password' ngControl='password'
 *                          [(ngModel)]='credentials.password'>
 *          <button (click)="onLogin()">Login</button>
 *        </form>`
 *      })
 * class LoginComp {
 *  credentials: {login: string, password: string};
 *  loginForm: ControlGroup;
 *
 *  constructor() {
 *    this.loginForm = new ControlGroup({
 *      login: new Control(""),
 *      password: new Control("")
 *    });
 *  }
 *
 *  onLogin(): void {
 *    // this.credentials.login === 'some login'
 *    // this.credentials.password === 'some password'
 *  }
 * }
 *  ```
 */
export let NgFormModel = class NgFormModel extends ControlContainer {
    constructor(_validators, _asyncValidators) {
        super();
        this._validators = _validators;
        this._asyncValidators = _asyncValidators;
        this.form = null;
        this.directives = [];
        this.ngSubmit = new EventEmitter();
    }
    ngOnChanges(changes) {
        this._checkFormPresent();
        if (StringMapWrapper.contains(changes, "form")) {
            var sync = composeValidators(this._validators);
            this.form.validator = Validators.compose([this.form.validator, sync]);
            var async = composeAsyncValidators(this._asyncValidators);
            this.form.asyncValidator = Validators.composeAsync([this.form.asyncValidator, async]);
            this.form.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        }
        this._updateDomValue();
    }
    get formDirective() { return this; }
    get control() { return this.form; }
    get path() { return []; }
    addControl(dir) {
        var ctrl = this.form.find(dir.path);
        setUpControl(ctrl, dir);
        ctrl.updateValueAndValidity({ emitEvent: false });
        this.directives.push(dir);
    }
    getControl(dir) { return this.form.find(dir.path); }
    removeControl(dir) { ListWrapper.remove(this.directives, dir); }
    addControlGroup(dir) {
        var ctrl = this.form.find(dir.path);
        setUpControlGroup(ctrl, dir);
        ctrl.updateValueAndValidity({ emitEvent: false });
    }
    removeControlGroup(dir) { }
    getControlGroup(dir) {
        return this.form.find(dir.path);
    }
    updateModel(dir, value) {
        var ctrl = this.form.find(dir.path);
        ctrl.updateValue(value);
    }
    onSubmit() {
        ObservableWrapper.callEmit(this.ngSubmit, null);
        return false;
    }
    /** @internal */
    _updateDomValue() {
        this.directives.forEach(dir => {
            var ctrl = this.form.find(dir.path);
            dir.valueAccessor.writeValue(ctrl.value);
        });
    }
    _checkFormPresent() {
        if (isBlank(this.form)) {
            throw new BaseException(`ngFormModel expects a form. Please pass one in. Example: <form [ngFormModel]="myCoolForm">`);
        }
    }
};
NgFormModel = __decorate([
    Directive({
        selector: '[ngFormModel]',
        bindings: [formDirectiveProvider],
        inputs: ['form: ngFormModel'],
        host: { '(submit)': 'onSubmit()' },
        outputs: ['ngSubmit'],
        exportAs: 'ngForm'
    }),
    __param(0, Optional()),
    __param(0, Self()),
    __param(0, Inject(NG_VALIDATORS)),
    __param(1, Optional()),
    __param(1, Self()),
    __param(1, Inject(NG_ASYNC_VALIDATORS)), 
    __metadata('design:paramtypes', [Array, Array])
], NgFormModel);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9ybV9tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtSzJwNlRDSEMudG1wL2FuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9uZ19mb3JtX21vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztPQUFPLEVBQUMsVUFBVSxFQUFFLE9BQU8sRUFBQyxNQUFNLDBCQUEwQjtPQUNyRCxFQUFDLFdBQVcsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGdDQUFnQztPQUNyRSxFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNyRCxFQUFDLGlCQUFpQixFQUFFLFlBQVksRUFBQyxNQUFNLDJCQUEyQjtPQUNsRSxFQUdMLFNBQVMsRUFDVCxVQUFVLEVBQ1YsUUFBUSxFQUNSLE1BQU0sRUFDTixRQUFRLEVBQ1IsSUFBSSxFQUNMLE1BQU0sZUFBZTtPQUdmLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUI7T0FHN0MsRUFBQyxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsc0JBQXNCLEVBQUMsTUFBTSxVQUFVO09BQzVGLEVBQUMsVUFBVSxFQUFFLGFBQWEsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLGVBQWU7QUFFNUUsT0FBTyxNQUFNLHFCQUFxQixHQUM5QixVQUFVLENBQUMsSUFBSSxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLE1BQU0sV0FBVyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFFN0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUVHO0FBU0gsbURBQWlDLGdCQUFnQjtJQU0vQyxZQUErRCxXQUFrQixFQUNaLGdCQUF1QjtRQUMxRixPQUFPLENBQUM7UUFGcUQsZ0JBQVcsR0FBWCxXQUFX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UjVEO0FBZ0ZEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVF9FWFBSLCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7T2JzZXJ2YWJsZVdyYXBwZXIsIEV2ZW50RW1pdHRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1xuICBTaW1wbGVDaGFuZ2UsXG4gIE9uQ2hhbmdlcyxcbiAgRGlyZWN0aXZlLFxuICBmb3J3YXJkUmVmLFxuICBQcm92aWRlcixcbiAgSW5qZWN0LFxuICBPcHRpb25hbCxcbiAgU2VsZlxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7TmdDb250cm9sfSBmcm9tICcuL25nX2NvbnRyb2wnO1xuaW1wb3J0IHtOZ0NvbnRyb2xHcm91cH0gZnJvbSAnLi9uZ19jb250cm9sX2dyb3VwJztcbmltcG9ydCB7Q29udHJvbENvbnRhaW5lcn0gZnJvbSAnLi9jb250cm9sX2NvbnRhaW5lcic7XG5pbXBvcnQge0Zvcm19IGZyb20gJy4vZm9ybV9pbnRlcmZhY2UnO1xuaW1wb3J0IHtDb250cm9sLCBDb250cm9sR3JvdXB9IGZyb20gJy4uL21vZGVsJztcbmltcG9ydCB7c2V0VXBDb250cm9sLCBzZXRVcENvbnRyb2xHcm91cCwgY29tcG9zZVZhbGlkYXRvcnMsIGNvbXBvc2VBc3luY1ZhbGlkYXRvcnN9IGZyb20gJy4vc2hhcmVkJztcbmltcG9ydCB7VmFsaWRhdG9ycywgTkdfVkFMSURBVE9SUywgTkdfQVNZTkNfVkFMSURBVE9SU30gZnJvbSAnLi4vdmFsaWRhdG9ycyc7XG5cbmV4cG9ydCBjb25zdCBmb3JtRGlyZWN0aXZlUHJvdmlkZXIgPVxuICAgIENPTlNUX0VYUFIobmV3IFByb3ZpZGVyKENvbnRyb2xDb250YWluZXIsIHt1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBOZ0Zvcm1Nb2RlbCl9KSk7XG5cbi8qKlxuICogQmluZHMgYW4gZXhpc3RpbmcgY29udHJvbCBncm91cCB0byBhIERPTSBlbGVtZW50LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9qcXJWaXJ1ZFk4YW5KeFRNVWpUUD9wPXByZXZpZXcpKVxuICpcbiAqIEluIHRoaXMgZXhhbXBsZSwgd2UgYmluZCB0aGUgY29udHJvbCBncm91cCB0byB0aGUgZm9ybSBlbGVtZW50LCBhbmQgd2UgYmluZCB0aGUgbG9naW4gYW5kXG4gKiBwYXNzd29yZCBjb250cm9scyB0byB0aGUgbG9naW4gYW5kIHBhc3N3b3JkIGVsZW1lbnRzLlxuICpcbiAqICBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1hcHAnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxkaXY+XG4gKiAgICAgICA8aDI+TmdGb3JtTW9kZWwgRXhhbXBsZTwvaDI+XG4gKiAgICAgICA8Zm9ybSBbbmdGb3JtTW9kZWxdPVwibG9naW5Gb3JtXCI+XG4gKiAgICAgICAgIDxwPkxvZ2luOiA8aW5wdXQgdHlwZT1cInRleHRcIiBuZ0NvbnRyb2w9XCJsb2dpblwiPjwvcD5cbiAqICAgICAgICAgPHA+UGFzc3dvcmQ6IDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBuZ0NvbnRyb2w9XCJwYXNzd29yZFwiPjwvcD5cbiAqICAgICAgIDwvZm9ybT5cbiAqICAgICAgIDxwPlZhbHVlOjwvcD5cbiAqICAgICAgIDxwcmU+e3t2YWx1ZX19PC9wcmU+XG4gKiAgICAgPC9kaXY+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtGT1JNX0RJUkVDVElWRVNdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIEFwcCB7XG4gKiAgIGxvZ2luRm9ybTogQ29udHJvbEdyb3VwO1xuICpcbiAqICAgY29uc3RydWN0b3IoKSB7XG4gKiAgICAgdGhpcy5sb2dpbkZvcm0gPSBuZXcgQ29udHJvbEdyb3VwKHtcbiAqICAgICAgIGxvZ2luOiBuZXcgQ29udHJvbChcIlwiKSxcbiAqICAgICAgIHBhc3N3b3JkOiBuZXcgQ29udHJvbChcIlwiKVxuICogICAgIH0pO1xuICogICB9XG4gKlxuICogICBnZXQgdmFsdWUoKTogc3RyaW5nIHtcbiAqICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5sb2dpbkZvcm0udmFsdWUsIG51bGwsIDIpO1xuICogICB9XG4gKiB9XG4gKiAgYGBgXG4gKlxuICogV2UgY2FuIGFsc28gdXNlIG5nTW9kZWwgdG8gYmluZCBhIGRvbWFpbiBtb2RlbCB0byB0aGUgZm9ybS5cbiAqXG4gKiAgYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgICAgIHNlbGVjdG9yOiBcImxvZ2luLWNvbXBcIixcbiAqICAgICAgZGlyZWN0aXZlczogW0ZPUk1fRElSRUNUSVZFU10sXG4gKiAgICAgIHRlbXBsYXRlOiBgXG4gKiAgICAgICAgPGZvcm0gW25nRm9ybU1vZGVsXT0nbG9naW5Gb3JtJz5cbiAqICAgICAgICAgIExvZ2luIDxpbnB1dCB0eXBlPSd0ZXh0JyBuZ0NvbnRyb2w9J2xvZ2luJyBbKG5nTW9kZWwpXT0nY3JlZGVudGlhbHMubG9naW4nPlxuICogICAgICAgICAgUGFzc3dvcmQgPGlucHV0IHR5cGU9J3Bhc3N3b3JkJyBuZ0NvbnRyb2w9J3Bhc3N3b3JkJ1xuICogICAgICAgICAgICAgICAgICAgICAgICAgIFsobmdNb2RlbCldPSdjcmVkZW50aWFscy5wYXNzd29yZCc+XG4gKiAgICAgICAgICA8YnV0dG9uIChjbGljayk9XCJvbkxvZ2luKClcIj5Mb2dpbjwvYnV0dG9uPlxuICogICAgICAgIDwvZm9ybT5gXG4gKiAgICAgIH0pXG4gKiBjbGFzcyBMb2dpbkNvbXAge1xuICogIGNyZWRlbnRpYWxzOiB7bG9naW46IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZ307XG4gKiAgbG9naW5Gb3JtOiBDb250cm9sR3JvdXA7XG4gKlxuICogIGNvbnN0cnVjdG9yKCkge1xuICogICAgdGhpcy5sb2dpbkZvcm0gPSBuZXcgQ29udHJvbEdyb3VwKHtcbiAqICAgICAgbG9naW46IG5ldyBDb250cm9sKFwiXCIpLFxuICogICAgICBwYXNzd29yZDogbmV3IENvbnRyb2woXCJcIilcbiAqICAgIH0pO1xuICogIH1cbiAqXG4gKiAgb25Mb2dpbigpOiB2b2lkIHtcbiAqICAgIC8vIHRoaXMuY3JlZGVudGlhbHMubG9naW4gPT09ICdzb21lIGxvZ2luJ1xuICogICAgLy8gdGhpcy5jcmVkZW50aWFscy5wYXNzd29yZCA9PT0gJ3NvbWUgcGFzc3dvcmQnXG4gKiAgfVxuICogfVxuICogIGBgYFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmdGb3JtTW9kZWxdJyxcbiAgYmluZGluZ3M6IFtmb3JtRGlyZWN0aXZlUHJvdmlkZXJdLFxuICBpbnB1dHM6IFsnZm9ybTogbmdGb3JtTW9kZWwnXSxcbiAgaG9zdDogeycoc3VibWl0KSc6ICdvblN1Ym1pdCgpJ30sXG4gIG91dHB1dHM6IFsnbmdTdWJtaXQnXSxcbiAgZXhwb3J0QXM6ICduZ0Zvcm0nXG59KVxuZXhwb3J0IGNsYXNzIE5nRm9ybU1vZGVsIGV4dGVuZHMgQ29udHJvbENvbnRhaW5lciBpbXBsZW1lbnRzIEZvcm0sXG4gICAgT25DaGFuZ2VzIHtcbiAgZm9ybTogQ29udHJvbEdyb3VwID0gbnVsbDtcbiAgZGlyZWN0aXZlczogTmdDb250cm9sW10gPSBbXTtcbiAgbmdTdWJtaXQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX1ZBTElEQVRPUlMpIHByaXZhdGUgX3ZhbGlkYXRvcnM6IGFueVtdLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfQVNZTkNfVkFMSURBVE9SUykgcHJpdmF0ZSBfYXN5bmNWYWxpZGF0b3JzOiBhbnlbXSkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiB7W2tleTogc3RyaW5nXTogU2ltcGxlQ2hhbmdlfSk6IHZvaWQge1xuICAgIHRoaXMuX2NoZWNrRm9ybVByZXNlbnQoKTtcbiAgICBpZiAoU3RyaW5nTWFwV3JhcHBlci5jb250YWlucyhjaGFuZ2VzLCBcImZvcm1cIikpIHtcbiAgICAgIHZhciBzeW5jID0gY29tcG9zZVZhbGlkYXRvcnModGhpcy5fdmFsaWRhdG9ycyk7XG4gICAgICB0aGlzLmZvcm0udmFsaWRhdG9yID0gVmFsaWRhdG9ycy5jb21wb3NlKFt0aGlzLmZvcm0udmFsaWRhdG9yLCBzeW5jXSk7XG5cbiAgICAgIHZhciBhc3luYyA9IGNvbXBvc2VBc3luY1ZhbGlkYXRvcnModGhpcy5fYXN5bmNWYWxpZGF0b3JzKTtcbiAgICAgIHRoaXMuZm9ybS5hc3luY1ZhbGlkYXRvciA9IFZhbGlkYXRvcnMuY29tcG9zZUFzeW5jKFt0aGlzLmZvcm0uYXN5bmNWYWxpZGF0b3IsIGFzeW5jXSk7XG5cbiAgICAgIHRoaXMuZm9ybS51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtvbmx5U2VsZjogdHJ1ZSwgZW1pdEV2ZW50OiBmYWxzZX0pO1xuICAgIH1cblxuICAgIHRoaXMuX3VwZGF0ZURvbVZhbHVlKCk7XG4gIH1cblxuICBnZXQgZm9ybURpcmVjdGl2ZSgpOiBGb3JtIHsgcmV0dXJuIHRoaXM7IH1cblxuICBnZXQgY29udHJvbCgpOiBDb250cm9sR3JvdXAgeyByZXR1cm4gdGhpcy5mb3JtOyB9XG5cbiAgZ2V0IHBhdGgoKTogc3RyaW5nW10geyByZXR1cm4gW107IH1cblxuICBhZGRDb250cm9sKGRpcjogTmdDb250cm9sKTogdm9pZCB7XG4gICAgdmFyIGN0cmw6IGFueSA9IHRoaXMuZm9ybS5maW5kKGRpci5wYXRoKTtcbiAgICBzZXRVcENvbnRyb2woY3RybCwgZGlyKTtcbiAgICBjdHJsLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe2VtaXRFdmVudDogZmFsc2V9KTtcbiAgICB0aGlzLmRpcmVjdGl2ZXMucHVzaChkaXIpO1xuICB9XG5cbiAgZ2V0Q29udHJvbChkaXI6IE5nQ29udHJvbCk6IENvbnRyb2wgeyByZXR1cm4gPENvbnRyb2w+dGhpcy5mb3JtLmZpbmQoZGlyLnBhdGgpOyB9XG5cbiAgcmVtb3ZlQ29udHJvbChkaXI6IE5nQ29udHJvbCk6IHZvaWQgeyBMaXN0V3JhcHBlci5yZW1vdmUodGhpcy5kaXJlY3RpdmVzLCBkaXIpOyB9XG5cbiAgYWRkQ29udHJvbEdyb3VwKGRpcjogTmdDb250cm9sR3JvdXApIHtcbiAgICB2YXIgY3RybDogYW55ID0gdGhpcy5mb3JtLmZpbmQoZGlyLnBhdGgpO1xuICAgIHNldFVwQ29udHJvbEdyb3VwKGN0cmwsIGRpcik7XG4gICAgY3RybC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gIH1cblxuICByZW1vdmVDb250cm9sR3JvdXAoZGlyOiBOZ0NvbnRyb2xHcm91cCkge31cblxuICBnZXRDb250cm9sR3JvdXAoZGlyOiBOZ0NvbnRyb2xHcm91cCk6IENvbnRyb2xHcm91cCB7XG4gICAgcmV0dXJuIDxDb250cm9sR3JvdXA+dGhpcy5mb3JtLmZpbmQoZGlyLnBhdGgpO1xuICB9XG5cbiAgdXBkYXRlTW9kZWwoZGlyOiBOZ0NvbnRyb2wsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB2YXIgY3RybMKgID0gPENvbnRyb2w+dGhpcy5mb3JtLmZpbmQoZGlyLnBhdGgpO1xuICAgIGN0cmwudXBkYXRlVmFsdWUodmFsdWUpO1xuICB9XG5cbiAgb25TdWJtaXQoKTogYm9vbGVhbiB7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQodGhpcy5uZ1N1Ym1pdCwgbnVsbCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdXBkYXRlRG9tVmFsdWUoKSB7XG4gICAgdGhpcy5kaXJlY3RpdmVzLmZvckVhY2goZGlyID0+IHtcbiAgICAgIHZhciBjdHJsOiBhbnkgPSB0aGlzLmZvcm0uZmluZChkaXIucGF0aCk7XG4gICAgICBkaXIudmFsdWVBY2Nlc3Nvci53cml0ZVZhbHVlKGN0cmwudmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2hlY2tGb3JtUHJlc2VudCgpIHtcbiAgICBpZiAoaXNCbGFuayh0aGlzLmZvcm0pKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICBgbmdGb3JtTW9kZWwgZXhwZWN0cyBhIGZvcm0uIFBsZWFzZSBwYXNzIG9uZSBpbi4gRXhhbXBsZTogPGZvcm0gW25nRm9ybU1vZGVsXT1cIm15Q29vbEZvcm1cIj5gKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==