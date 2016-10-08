/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {NextObserver} from 'rxjs/Observer';

export {Observable} from 'rxjs/Observable';
export {Subject} from 'rxjs/Subject';

/**
 * Use by directives and components to emit custom Events.
 *
 * ### Examples
 *
 * In the following example, `Zippy` alternatively emits `open` and `close` events when its
 * title gets clicked:
 *
 * ```
 * @Component({
 *   selector: 'zippy',
 *   template: `
 *   <div class="zippy">
 *     <div (click)="toggle()">Toggle</div>
 *     <div [hidden]="!visible">
 *       <ng-content></ng-content>
 *     </div>
 *  </div>`})
 * export class Zippy {
 *   visible: boolean = true;
 *   @Output() open: EventEmitter<any> = new EventEmitter();
 *   @Output() close: EventEmitter<any> = new EventEmitter();
 *
 *   toggle() {
 *     this.visible = !this.visible;
 *     if (this.visible) {
 *       this.open.emit(null);
 *     } else {
 *       this.close.emit(null);
 *     }
 *   }
 * }
 * ```
 *
 * The events payload can be accessed by the parameter `$event` on the components output event
 * handler:
 *
 * ```
 * <zippy (open)="onOpen($event)" (close)="onClose($event)"></zippy>
 * ```
 *
 * Uses Rx.Observable but provides an adapter to make it work as specified here:
 * https://github.com/jhusain/observable-spec
 *
 * Once a reference implementation of the spec is available, switch to it.
 * @stable
 */
export class EventEmitter<T> extends Subject<T> {
  // TODO: mark this as internal once all the facades are gone
  // we can't mark it as internal now because EventEmitter exported via @angular/core would not
  // contain this property making it incompatible with all the code that uses EventEmitter via
  // facades, which are local to the code and do not have this property stripped.
  // tslint:disable-next-line
  __isAsync: boolean;

  /**
   * Creates an instance of [EventEmitter], which depending on [isAsync],
   * delivers events synchronously or asynchronously.
   */
  constructor(isAsync: boolean = false) {
    super();
    this.__isAsync = isAsync;
  }

  emit(value?: T) { super.next(value); }

  subscribe(generatorOrNext?: NextObserver<T> | ((value: T) => void), error?: (error: any) => void, complete?: () => void): Subscription {
    let schedulerFn: (value: T) => void;
    let errorFn: (err: any) => void;
    let completeFn: () => void;

    if (generatorOrNext && typeof generatorOrNext === 'object') {
      const generator = <NextObserver<T>>generatorOrNext;
      schedulerFn = this.__isAsync ? (value: T) => {
        setTimeout(() => generator.next(value));
      } : (value: T) => { generator.next(value); };

      if (generator.error) {
        errorFn = this.__isAsync ? (err) => { setTimeout(() => generator.error(err)); } :
                                   (err) => { generator.error(err); };
      }

      if (generator.complete) {
        completeFn = this.__isAsync ? () => { setTimeout(() => generator.complete()); } :
                                      () => { generator.complete(); };
      }
    } else {
      if (generatorOrNext) {
        const next = <(value: T) => void>generatorOrNext;
        schedulerFn =
            this.__isAsync ? (value: T) => { setTimeout(() => next(value)); } : next ;
      }

      if (error) {
        errorFn =
            this.__isAsync ? (err) => { setTimeout(() => error(err)); } : error;
      }

      if (complete) {
        completeFn =
            this.__isAsync ? () => { setTimeout(() => complete()); } : complete;
      }
    }

    return super.subscribe(schedulerFn, errorFn, completeFn);
  }
}
