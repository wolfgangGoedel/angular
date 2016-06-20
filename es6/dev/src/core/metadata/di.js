var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { CONST, CONST_EXPR, stringify, isString } from 'angular2/src/facade/lang';
import { resolveForwardRef } from 'angular2/src/core/di/forward_ref';
import { DependencyMetadata } from 'angular2/src/core/di/metadata';
/**
 * Specifies that a constant attribute value should be injected.
 *
 * The directive can inject constant string literals of host element attributes.
 *
 * ### Example
 *
 * Suppose we have an `<input>` element and want to know its `type`.
 *
 * ```html
 * <input type="text">
 * ```
 *
 * A decorator can inject string literal `text` like so:
 *
 * {@example core/ts/metadata/metadata.ts region='attributeMetadata'}
 */
export let AttributeMetadata = class AttributeMetadata extends DependencyMetadata {
    constructor(attributeName) {
        super();
        this.attributeName = attributeName;
    }
    get token() {
        // Normally one would default a token to a type of an injected value but here
        // the type of a variable is "string" and we can't use primitive type as a return value
        // so we use instance of Attribute instead. This doesn't matter much in practice as arguments
        // with @Attribute annotation are injected by ElementInjector that doesn't take tokens into
        // account.
        return this;
    }
    toString() { return `@Attribute(${stringify(this.attributeName)})`; }
};
AttributeMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [String])
], AttributeMetadata);
/**
 * Declares an injectable parameter to be a live list of directives or variable
 * bindings from the content children of a directive.
 *
 * ### Example ([live demo](http://plnkr.co/edit/lY9m8HLy7z06vDoUaSN2?p=preview))
 *
 * Assume that `<tabs>` component would like to get a list its children `<pane>`
 * components as shown in this example:
 *
 * ```html
 * <tabs>
 *   <pane title="Overview">...</pane>
 *   <pane *ngFor="#o of objects" [title]="o.title">{{o.text}}</pane>
 * </tabs>
 * ```
 *
 * The preferred solution is to query for `Pane` directives using this decorator.
 *
 * ```javascript
 * @Component({
 *   selector: 'pane',
 *   inputs: ['title']
 * })
 * class Pane {
 *   title:string;
 * }
 *
 * @Component({
 *  selector: 'tabs',
 *  template: `
 *    <ul>
 *      <li *ngFor="#pane of panes">{{pane.title}}</li>
 *    </ul>
 *    <ng-content></ng-content>
 *  `
 * })
 * class Tabs {
 *   panes: QueryList<Pane>;
 *   constructor(@Query(Pane) panes:QueryList<Pane>) {
  *    this.panes = panes;
  *  }
 * }
 * ```
 *
 * A query can look for variable bindings by passing in a string with desired binding symbol.
 *
 * ### Example ([live demo](http://plnkr.co/edit/sT2j25cH1dURAyBRCKx1?p=preview))
 * ```html
 * <seeker>
 *   <div #findme>...</div>
 * </seeker>
 *
 * @Component({ selector: 'seeker' })
 * class Seeker {
 *   constructor(@Query('findme') elList: QueryList<ElementRef>) {...}
 * }
 * ```
 *
 * In this case the object that is injected depend on the type of the variable
 * binding. It can be an ElementRef, a directive or a component.
 *
 * Passing in a comma separated list of variable bindings will query for all of them.
 *
 * ```html
 * <seeker>
 *   <div #find-me>...</div>
 *   <div #find-me-too>...</div>
 * </seeker>
 *
 *  @Component({
 *   selector: 'seeker'
 * })
 * class Seeker {
 *   constructor(@Query('findMe, findMeToo') elList: QueryList<ElementRef>) {...}
 * }
 * ```
 *
 * Configure whether query looks for direct children or all descendants
 * of the querying element, by using the `descendants` parameter.
 * It is set to `false` by default.
 *
 * ### Example ([live demo](http://plnkr.co/edit/wtGeB977bv7qvA5FTYl9?p=preview))
 * ```html
 * <container #first>
 *   <item>a</item>
 *   <item>b</item>
 *   <container #second>
 *     <item>c</item>
 *   </container>
 * </container>
 * ```
 *
 * When querying for items, the first container will see only `a` and `b` by default,
 * but with `Query(TextDirective, {descendants: true})` it will see `c` too.
 *
 * The queried directives are kept in a depth-first pre-order with respect to their
 * positions in the DOM.
 *
 * Query does not look deep into any subcomponent views.
 *
 * Query is updated as part of the change-detection cycle. Since change detection
 * happens after construction of a directive, QueryList will always be empty when observed in the
 * constructor.
 *
 * The injected object is an unmodifiable live list.
 * See {@link QueryList} for more details.
 */
export let QueryMetadata = class QueryMetadata extends DependencyMetadata {
    constructor(_selector, { descendants = false, first = false, read = null } = {}) {
        super();
        this._selector = _selector;
        this.descendants = descendants;
        this.first = first;
        this.read = read;
    }
    /**
     * always `false` to differentiate it with {@link ViewQueryMetadata}.
     */
    get isViewQuery() { return false; }
    /**
     * what this is querying for.
     */
    get selector() { return resolveForwardRef(this._selector); }
    /**
     * whether this is querying for a variable binding or a directive.
     */
    get isVarBindingQuery() { return isString(this.selector); }
    /**
     * returns a list of variable bindings this is querying for.
     * Only applicable if this is a variable bindings query.
     */
    get varBindings() { return this.selector.split(','); }
    toString() { return `@Query(${stringify(this.selector)})`; }
};
QueryMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object, Object])
], QueryMetadata);
// TODO: add an example after ContentChildren and ViewChildren are in master
/**
 * Configures a content query.
 *
 * Content queries are set before the `ngAfterContentInit` callback is called.
 *
 * ### Example
 *
 * ```
 * @Directive({
 *   selector: 'someDir'
 * })
 * class SomeDir {
 *   @ContentChildren(ChildDirective) contentChildren: QueryList<ChildDirective>;
 *
 *   ngAfterContentInit() {
 *     // contentChildren is set
 *   }
 * }
 * ```
 */
export let ContentChildrenMetadata = class ContentChildrenMetadata extends QueryMetadata {
    constructor(_selector, { descendants = false, read = null } = {}) {
        super(_selector, { descendants: descendants, read: read });
    }
};
ContentChildrenMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object, Object])
], ContentChildrenMetadata);
// TODO: add an example after ContentChild and ViewChild are in master
/**
 * Configures a content query.
 *
 * Content queries are set before the `ngAfterContentInit` callback is called.
 *
 * ### Example
 *
 * ```
 * @Directive({
 *   selector: 'someDir'
 * })
 * class SomeDir {
 *   @ContentChild(ChildDirective) contentChild;
 *
 *   ngAfterContentInit() {
 *     // contentChild is set
 *   }
 * }
 * ```
 */
export let ContentChildMetadata = class ContentChildMetadata extends QueryMetadata {
    constructor(_selector, { read = null } = {}) {
        super(_selector, { descendants: true, first: true, read: read });
    }
};
ContentChildMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object, Object])
], ContentChildMetadata);
/**
 * Similar to {@link QueryMetadata}, but querying the component view, instead of
 * the content children.
 *
 * ### Example ([live demo](http://plnkr.co/edit/eNsFHDf7YjyM6IzKxM1j?p=preview))
 *
 * ```javascript
 * @Component({
 *   ...,
 *   template: `
 *     <item> a </item>
 *     <item> b </item>
 *     <item> c </item>
 *   `
 * })
 * class MyComponent {
 *   shown: boolean;
 *
 *   constructor(private @ViewQuery(Item) items:QueryList<Item>) {
 *     items.changes.subscribe(() => console.log(items.length));
 *   }
 * }
 * ```
 *
 * Supports the same querying parameters as {@link QueryMetadata}, except
 * `descendants`. This always queries the whole view.
 *
 * As `shown` is flipped between true and false, items will contain zero of one
 * items.
 *
 * Specifies that a {@link QueryList} should be injected.
 *
 * The injected object is an iterable and observable live list.
 * See {@link QueryList} for more details.
 */
export let ViewQueryMetadata = class ViewQueryMetadata extends QueryMetadata {
    constructor(_selector, { descendants = false, first = false, read = null } = {}) {
        super(_selector, { descendants: descendants, first: first, read: read });
    }
    /**
     * always `true` to differentiate it with {@link QueryMetadata}.
     */
    get isViewQuery() { return true; }
    toString() { return `@ViewQuery(${stringify(this.selector)})`; }
};
ViewQueryMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object, Object])
], ViewQueryMetadata);
/**
 * Declares a list of child element references.
 *
 * Angular automatically updates the list when the DOM is updated.
 *
 * `ViewChildren` takes an argument to select elements.
 *
 * - If the argument is a type, directives or components with the type will be bound.
 *
 * - If the argument is a string, the string is interpreted as a list of comma-separated selectors.
 * For each selector, an element containing the matching template variable (e.g. `#child`) will be
 * bound.
 *
 * View children are set before the `ngAfterViewInit` callback is called.
 *
 * ### Example
 *
 * With type selector:
 *
 * ```
 * @Component({
 *   selector: 'child-cmp',
 *   template: '<p>child</p>'
 * })
 * class ChildCmp {
 *   doSomething() {}
 * }
 *
 * @Component({
 *   selector: 'some-cmp',
 *   template: `
 *     <child-cmp></child-cmp>
 *     <child-cmp></child-cmp>
 *     <child-cmp></child-cmp>
 *   `,
 *   directives: [ChildCmp]
 * })
 * class SomeCmp {
 *   @ViewChildren(ChildCmp) children:QueryList<ChildCmp>;
 *
 *   ngAfterViewInit() {
 *     // children are set
 *     this.children.toArray().forEach((child)=>child.doSomething());
 *   }
 * }
 * ```
 *
 * With string selector:
 *
 * ```
 * @Component({
 *   selector: 'child-cmp',
 *   template: '<p>child</p>'
 * })
 * class ChildCmp {
 *   doSomething() {}
 * }
 *
 * @Component({
 *   selector: 'some-cmp',
 *   template: `
 *     <child-cmp #child1></child-cmp>
 *     <child-cmp #child2></child-cmp>
 *     <child-cmp #child3></child-cmp>
 *   `,
 *   directives: [ChildCmp]
 * })
 * class SomeCmp {
 *   @ViewChildren('child1,child2,child3') children:QueryList<ChildCmp>;
 *
 *   ngAfterViewInit() {
 *     // children are set
 *     this.children.toArray().forEach((child)=>child.doSomething());
 *   }
 * }
 * ```
 */
export let ViewChildrenMetadata = class ViewChildrenMetadata extends ViewQueryMetadata {
    constructor(_selector, { read = null } = {}) {
        super(_selector, { descendants: true, read: read });
    }
};
ViewChildrenMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object, Object])
], ViewChildrenMetadata);
/**
 *
 * Declares a reference of child element.
 *
 * `ViewChildren` takes an argument to select elements.
 *
 * - If the argument is a type, a directive or a component with the type will be bound.
 *
 If the argument is a string, the string is interpreted as a selector. An element containing the
 matching template variable (e.g. `#child`) will be bound.
 *
 * In either case, `@ViewChild()` assigns the first (looking from above) element if there are
 multiple matches.
 *
 * View child is set before the `ngAfterViewInit` callback is called.
 *
 * ### Example
 *
 * With type selector:
 *
 * ```
 * @Component({
 *   selector: 'child-cmp',
 *   template: '<p>child</p>'
 * })
 * class ChildCmp {
 *   doSomething() {}
 * }
 *
 * @Component({
 *   selector: 'some-cmp',
 *   template: '<child-cmp></child-cmp>',
 *   directives: [ChildCmp]
 * })
 * class SomeCmp {
 *   @ViewChild(ChildCmp) child:ChildCmp;
 *
 *   ngAfterViewInit() {
 *     // child is set
 *     this.child.doSomething();
 *   }
 * }
 * ```
 *
 * With string selector:
 *
 * ```
 * @Component({
 *   selector: 'child-cmp',
 *   template: '<p>child</p>'
 * })
 * class ChildCmp {
 *   doSomething() {}
 * }
 *
 * @Component({
 *   selector: 'some-cmp',
 *   template: '<child-cmp #child></child-cmp>',
 *   directives: [ChildCmp]
 * })
 * class SomeCmp {
 *   @ViewChild('child') child:ChildCmp;
 *
 *   ngAfterViewInit() {
 *     // child is set
 *     this.child.doSomething();
 *   }
 * }
 * ```
 */
export let ViewChildMetadata = class ViewChildMetadata extends ViewQueryMetadata {
    constructor(_selector, { read = null } = {}) {
        super(_selector, { descendants: true, first: true, read: read });
    }
};
ViewChildMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object, Object])
], ViewChildMetadata);
/**
 * Defines an injectable whose value is given by a property on an InjectorModule class.
 *
 * ### Example
 *
 * ```
 * @InjectorModule()
 * class MyModule {
 *   @Provides(SomeToken)
 *   someProp: string = 'Hello world';
 * }
 * ```
 * @experimental
 */
export let ProviderPropertyMetadata = class ProviderPropertyMetadata {
    constructor(token, { multi = false } = {}) {
        this.token = token;
        this._multi = multi;
    }
    get multi() { return this._multi; }
};
ProviderPropertyMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object, Object])
], ProviderPropertyMetadata);
/**
 * Defines an injector module from which an injector can be generated.
 *
 * ### Example
 *
 * ```
 * @InjectorModule({
 *   providers: [SomeService]
 * })
 * class MyModule {}
 *
 * ```
 * @experimental
 */
export let InjectorModuleMetadata = class InjectorModuleMetadata {
    constructor({ providers = CONST_EXPR([]) } = {}) {
        this._providers = providers;
    }
    get providers() { return this._providers; }
};
InjectorModuleMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object])
], InjectorModuleMetadata);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVk4N1czNFR0LnRtcC9hbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS9kaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLEtBQUssRUFBRSxVQUFVLEVBQVEsU0FBUyxFQUFhLFFBQVEsRUFBQyxNQUFNLDBCQUEwQjtPQUN6RixFQUFDLGlCQUFpQixFQUFDLE1BQU0sa0NBQWtDO09BQzNELEVBQUMsa0JBQWtCLEVBQUMsTUFBTSwrQkFBK0I7QUFFaEU7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7QUFFSCwrREFBdUMsa0JBQWtCO0lBQ3ZELFlBQW1CLGFBQXFCO1FBQUksT0FBTyxDQUFDO1FBQWpDLGtCQUFhLEdBQWIsYUFBYSxDQUFRO0lBQWEsQ0FBQztJQUV0RCxJQUFJLEtBQUs7UUFDUCw2RUFBNkU7UUFDN0UsdUZBQXVGO1FBQ3ZGLDZGQUE2RjtRQUM3RiwyRkFBMkY7UUFDM0YsV0FBVztRQUNYLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0QsUUFBUSxLQUFhLE1BQU0sQ0FBQyxjQUFjLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDL0UsQ0FBQztBQWJEO0lBQUMsS0FBSyxFQUFFOztxQkFBQTtBQWVSOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMEdHO0FBRUgsdURBQW1DLGtCQUFrQjtJQVluRCxZQUFvQixTQUF3QixFQUNoQyxFQUFDLFdBQVcsR0FBRyxLQUFLLEVBQUUsS0FBSyxHQUFHLEtBQUssRUFDbEMsSUFBSSxHQUFHLElBQUksRUFBQyxHQUF5RCxFQUFFO1FBQ2xGLE9BQU8sQ0FB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LCBUeXBlLCBzdHJpbmdpZnksIGlzUHJlc2VudCwgaXNTdHJpbmd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge3Jlc29sdmVGb3J3YXJkUmVmfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9mb3J3YXJkX3JlZic7XG5pbXBvcnQge0RlcGVuZGVuY3lNZXRhZGF0YX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvbWV0YWRhdGEnO1xuXG4vKipcbiAqIFNwZWNpZmllcyB0aGF0IGEgY29uc3RhbnQgYXR0cmlidXRlIHZhbHVlIHNob3VsZCBiZSBpbmplY3RlZC5cbiAqXG4gKiBUaGUgZGlyZWN0aXZlIGNhbiBpbmplY3QgY29uc3RhbnQgc3RyaW5nIGxpdGVyYWxzIG9mIGhvc3QgZWxlbWVudCBhdHRyaWJ1dGVzLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogU3VwcG9zZSB3ZSBoYXZlIGFuIGA8aW5wdXQ+YCBlbGVtZW50IGFuZCB3YW50IHRvIGtub3cgaXRzIGB0eXBlYC5cbiAqXG4gKiBgYGBodG1sXG4gKiA8aW5wdXQgdHlwZT1cInRleHRcIj5cbiAqIGBgYFxuICpcbiAqIEEgZGVjb3JhdG9yIGNhbiBpbmplY3Qgc3RyaW5nIGxpdGVyYWwgYHRleHRgIGxpa2Ugc286XG4gKlxuICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbWV0YWRhdGEudHMgcmVnaW9uPSdhdHRyaWJ1dGVNZXRhZGF0YSd9XG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQXR0cmlidXRlTWV0YWRhdGEgZXh0ZW5kcyBEZXBlbmRlbmN5TWV0YWRhdGEge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgYXR0cmlidXRlTmFtZTogc3RyaW5nKSB7IHN1cGVyKCk7IH1cblxuICBnZXQgdG9rZW4oKTogQXR0cmlidXRlTWV0YWRhdGEge1xuICAgIC8vIE5vcm1hbGx5IG9uZSB3b3VsZCBkZWZhdWx0IGEgdG9rZW4gdG8gYSB0eXBlIG9mIGFuIGluamVjdGVkIHZhbHVlIGJ1dCBoZXJlXG4gICAgLy8gdGhlIHR5cGUgb2YgYSB2YXJpYWJsZSBpcyBcInN0cmluZ1wiIGFuZCB3ZSBjYW4ndCB1c2UgcHJpbWl0aXZlIHR5cGUgYXMgYSByZXR1cm4gdmFsdWVcbiAgICAvLyBzbyB3ZSB1c2UgaW5zdGFuY2Ugb2YgQXR0cmlidXRlIGluc3RlYWQuIFRoaXMgZG9lc24ndCBtYXR0ZXIgbXVjaCBpbiBwcmFjdGljZSBhcyBhcmd1bWVudHNcbiAgICAvLyB3aXRoIEBBdHRyaWJ1dGUgYW5ub3RhdGlvbiBhcmUgaW5qZWN0ZWQgYnkgRWxlbWVudEluamVjdG9yIHRoYXQgZG9lc24ndCB0YWtlIHRva2VucyBpbnRvXG4gICAgLy8gYWNjb3VudC5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gYEBBdHRyaWJ1dGUoJHtzdHJpbmdpZnkodGhpcy5hdHRyaWJ1dGVOYW1lKX0pYDsgfVxufVxuXG4vKipcbiAqIERlY2xhcmVzIGFuIGluamVjdGFibGUgcGFyYW1ldGVyIHRvIGJlIGEgbGl2ZSBsaXN0IG9mIGRpcmVjdGl2ZXMgb3IgdmFyaWFibGVcbiAqIGJpbmRpbmdzIGZyb20gdGhlIGNvbnRlbnQgY2hpbGRyZW4gb2YgYSBkaXJlY3RpdmUuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2xZOW04SEx5N3owNnZEb1VhU04yP3A9cHJldmlldykpXG4gKlxuICogQXNzdW1lIHRoYXQgYDx0YWJzPmAgY29tcG9uZW50IHdvdWxkIGxpa2UgdG8gZ2V0IGEgbGlzdCBpdHMgY2hpbGRyZW4gYDxwYW5lPmBcbiAqIGNvbXBvbmVudHMgYXMgc2hvd24gaW4gdGhpcyBleGFtcGxlOlxuICpcbiAqIGBgYGh0bWxcbiAqIDx0YWJzPlxuICogICA8cGFuZSB0aXRsZT1cIk92ZXJ2aWV3XCI+Li4uPC9wYW5lPlxuICogICA8cGFuZSAqbmdGb3I9XCIjbyBvZiBvYmplY3RzXCIgW3RpdGxlXT1cIm8udGl0bGVcIj57e28udGV4dH19PC9wYW5lPlxuICogPC90YWJzPlxuICogYGBgXG4gKlxuICogVGhlIHByZWZlcnJlZCBzb2x1dGlvbiBpcyB0byBxdWVyeSBmb3IgYFBhbmVgIGRpcmVjdGl2ZXMgdXNpbmcgdGhpcyBkZWNvcmF0b3IuXG4gKlxuICogYGBgamF2YXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAncGFuZScsXG4gKiAgIGlucHV0czogWyd0aXRsZSddXG4gKiB9KVxuICogY2xhc3MgUGFuZSB7XG4gKiAgIHRpdGxlOnN0cmluZztcbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICBzZWxlY3RvcjogJ3RhYnMnLFxuICogIHRlbXBsYXRlOiBgXG4gKiAgICA8dWw+XG4gKiAgICAgIDxsaSAqbmdGb3I9XCIjcGFuZSBvZiBwYW5lc1wiPnt7cGFuZS50aXRsZX19PC9saT5cbiAqICAgIDwvdWw+XG4gKiAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4gKiAgYFxuICogfSlcbiAqIGNsYXNzIFRhYnMge1xuICogICBwYW5lczogUXVlcnlMaXN0PFBhbmU+O1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoUGFuZSkgcGFuZXM6UXVlcnlMaXN0PFBhbmU+KSB7XG4gICogICAgdGhpcy5wYW5lcyA9IHBhbmVzO1xuICAqICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBBIHF1ZXJ5IGNhbiBsb29rIGZvciB2YXJpYWJsZSBiaW5kaW5ncyBieSBwYXNzaW5nIGluIGEgc3RyaW5nIHdpdGggZGVzaXJlZCBiaW5kaW5nIHN5bWJvbC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvc1QyajI1Y0gxZFVSQXlCUkNLeDE/cD1wcmV2aWV3KSlcbiAqIGBgYGh0bWxcbiAqIDxzZWVrZXI+XG4gKiAgIDxkaXYgI2ZpbmRtZT4uLi48L2Rpdj5cbiAqIDwvc2Vla2VyPlxuICpcbiAqIEBDb21wb25lbnQoeyBzZWxlY3RvcjogJ3NlZWtlcicgfSlcbiAqIGNsYXNzIFNlZWtlciB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeSgnZmluZG1lJykgZWxMaXN0OiBRdWVyeUxpc3Q8RWxlbWVudFJlZj4pIHsuLi59XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBJbiB0aGlzIGNhc2UgdGhlIG9iamVjdCB0aGF0IGlzIGluamVjdGVkIGRlcGVuZCBvbiB0aGUgdHlwZSBvZiB0aGUgdmFyaWFibGVcbiAqIGJpbmRpbmcuIEl0IGNhbiBiZSBhbiBFbGVtZW50UmVmLCBhIGRpcmVjdGl2ZSBvciBhIGNvbXBvbmVudC5cbiAqXG4gKiBQYXNzaW5nIGluIGEgY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgdmFyaWFibGUgYmluZGluZ3Mgd2lsbCBxdWVyeSBmb3IgYWxsIG9mIHRoZW0uXG4gKlxuICogYGBgaHRtbFxuICogPHNlZWtlcj5cbiAqICAgPGRpdiAjZmluZC1tZT4uLi48L2Rpdj5cbiAqICAgPGRpdiAjZmluZC1tZS10b28+Li4uPC9kaXY+XG4gKiA8L3NlZWtlcj5cbiAqXG4gKiAgQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnc2Vla2VyJ1xuICogfSlcbiAqIGNsYXNzIFNlZWtlciB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeSgnZmluZE1lLCBmaW5kTWVUb28nKSBlbExpc3Q6IFF1ZXJ5TGlzdDxFbGVtZW50UmVmPikgey4uLn1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIENvbmZpZ3VyZSB3aGV0aGVyIHF1ZXJ5IGxvb2tzIGZvciBkaXJlY3QgY2hpbGRyZW4gb3IgYWxsIGRlc2NlbmRhbnRzXG4gKiBvZiB0aGUgcXVlcnlpbmcgZWxlbWVudCwgYnkgdXNpbmcgdGhlIGBkZXNjZW5kYW50c2AgcGFyYW1ldGVyLlxuICogSXQgaXMgc2V0IHRvIGBmYWxzZWAgYnkgZGVmYXVsdC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvd3RHZUI5NzdidjdxdkE1RlRZbDk/cD1wcmV2aWV3KSlcbiAqIGBgYGh0bWxcbiAqIDxjb250YWluZXIgI2ZpcnN0PlxuICogICA8aXRlbT5hPC9pdGVtPlxuICogICA8aXRlbT5iPC9pdGVtPlxuICogICA8Y29udGFpbmVyICNzZWNvbmQ+XG4gKiAgICAgPGl0ZW0+YzwvaXRlbT5cbiAqICAgPC9jb250YWluZXI+XG4gKiA8L2NvbnRhaW5lcj5cbiAqIGBgYFxuICpcbiAqIFdoZW4gcXVlcnlpbmcgZm9yIGl0ZW1zLCB0aGUgZmlyc3QgY29udGFpbmVyIHdpbGwgc2VlIG9ubHkgYGFgIGFuZCBgYmAgYnkgZGVmYXVsdCxcbiAqIGJ1dCB3aXRoIGBRdWVyeShUZXh0RGlyZWN0aXZlLCB7ZGVzY2VuZGFudHM6IHRydWV9KWAgaXQgd2lsbCBzZWUgYGNgIHRvby5cbiAqXG4gKiBUaGUgcXVlcmllZCBkaXJlY3RpdmVzIGFyZSBrZXB0IGluIGEgZGVwdGgtZmlyc3QgcHJlLW9yZGVyIHdpdGggcmVzcGVjdCB0byB0aGVpclxuICogcG9zaXRpb25zIGluIHRoZSBET00uXG4gKlxuICogUXVlcnkgZG9lcyBub3QgbG9vayBkZWVwIGludG8gYW55IHN1YmNvbXBvbmVudCB2aWV3cy5cbiAqXG4gKiBRdWVyeSBpcyB1cGRhdGVkIGFzIHBhcnQgb2YgdGhlIGNoYW5nZS1kZXRlY3Rpb24gY3ljbGUuIFNpbmNlIGNoYW5nZSBkZXRlY3Rpb25cbiAqIGhhcHBlbnMgYWZ0ZXIgY29uc3RydWN0aW9uIG9mIGEgZGlyZWN0aXZlLCBRdWVyeUxpc3Qgd2lsbCBhbHdheXMgYmUgZW1wdHkgd2hlbiBvYnNlcnZlZCBpbiB0aGVcbiAqIGNvbnN0cnVjdG9yLlxuICpcbiAqIFRoZSBpbmplY3RlZCBvYmplY3QgaXMgYW4gdW5tb2RpZmlhYmxlIGxpdmUgbGlzdC5cbiAqIFNlZSB7QGxpbmsgUXVlcnlMaXN0fSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIFF1ZXJ5TWV0YWRhdGEgZXh0ZW5kcyBEZXBlbmRlbmN5TWV0YWRhdGEge1xuICAvKipcbiAgICogd2hldGhlciB3ZSB3YW50IHRvIHF1ZXJ5IG9ubHkgZGlyZWN0IGNoaWxkcmVuIChmYWxzZSkgb3IgYWxsXG4gICAqIGNoaWxkcmVuICh0cnVlKS5cbiAgICovXG4gIGRlc2NlbmRhbnRzOiBib29sZWFuO1xuICBmaXJzdDogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFRoZSBESSB0b2tlbiB0byByZWFkIGZyb20gYW4gZWxlbWVudCB0aGF0IG1hdGNoZXMgdGhlIHNlbGVjdG9yLlxuICAgKi9cbiAgcmVhZDogYW55O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3NlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLFxuICAgICAgICAgICAgICB7ZGVzY2VuZGFudHMgPSBmYWxzZSwgZmlyc3QgPSBmYWxzZSxcbiAgICAgICAgICAgICAgIHJlYWQgPSBudWxsfToge2Rlc2NlbmRhbnRzPzogYm9vbGVhbiwgZmlyc3Q/OiBib29sZWFuLCByZWFkPzogYW55fSA9IHt9KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmRlc2NlbmRhbnRzID0gZGVzY2VuZGFudHM7XG4gICAgdGhpcy5maXJzdCA9IGZpcnN0O1xuICAgIHRoaXMucmVhZCA9IHJlYWQ7XG4gIH1cblxuICAvKipcbiAgICogYWx3YXlzIGBmYWxzZWAgdG8gZGlmZmVyZW50aWF0ZSBpdCB3aXRoIHtAbGluayBWaWV3UXVlcnlNZXRhZGF0YX0uXG4gICAqL1xuICBnZXQgaXNWaWV3UXVlcnkoKTogYm9vbGVhbiB7IHJldHVybiBmYWxzZTsgfVxuXG4gIC8qKlxuICAgKiB3aGF0IHRoaXMgaXMgcXVlcnlpbmcgZm9yLlxuICAgKi9cbiAgZ2V0IHNlbGVjdG9yKCkgeyByZXR1cm4gcmVzb2x2ZUZvcndhcmRSZWYodGhpcy5fc2VsZWN0b3IpOyB9XG5cbiAgLyoqXG4gICAqIHdoZXRoZXIgdGhpcyBpcyBxdWVyeWluZyBmb3IgYSB2YXJpYWJsZSBiaW5kaW5nIG9yIGEgZGlyZWN0aXZlLlxuICAgKi9cbiAgZ2V0IGlzVmFyQmluZGluZ1F1ZXJ5KCk6IGJvb2xlYW4geyByZXR1cm4gaXNTdHJpbmcodGhpcy5zZWxlY3Rvcik7IH1cblxuICAvKipcbiAgICogcmV0dXJucyBhIGxpc3Qgb2YgdmFyaWFibGUgYmluZGluZ3MgdGhpcyBpcyBxdWVyeWluZyBmb3IuXG4gICAqIE9ubHkgYXBwbGljYWJsZSBpZiB0aGlzIGlzIGEgdmFyaWFibGUgYmluZGluZ3MgcXVlcnkuXG4gICAqL1xuICBnZXQgdmFyQmluZGluZ3MoKTogc3RyaW5nW10geyByZXR1cm4gdGhpcy5zZWxlY3Rvci5zcGxpdCgnLCcpOyB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIGBAUXVlcnkoJHtzdHJpbmdpZnkodGhpcy5zZWxlY3Rvcil9KWA7IH1cbn1cblxuLy8gVE9ETzogYWRkIGFuIGV4YW1wbGUgYWZ0ZXIgQ29udGVudENoaWxkcmVuIGFuZCBWaWV3Q2hpbGRyZW4gYXJlIGluIG1hc3RlclxuLyoqXG4gKiBDb25maWd1cmVzIGEgY29udGVudCBxdWVyeS5cbiAqXG4gKiBDb250ZW50IHF1ZXJpZXMgYXJlIHNldCBiZWZvcmUgdGhlIGBuZ0FmdGVyQ29udGVudEluaXRgIGNhbGxiYWNrIGlzIGNhbGxlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnc29tZURpcidcbiAqIH0pXG4gKiBjbGFzcyBTb21lRGlyIHtcbiAqICAgQENvbnRlbnRDaGlsZHJlbihDaGlsZERpcmVjdGl2ZSkgY29udGVudENoaWxkcmVuOiBRdWVyeUxpc3Q8Q2hpbGREaXJlY3RpdmU+O1xuICpcbiAqICAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICogICAgIC8vIGNvbnRlbnRDaGlsZHJlbiBpcyBzZXRcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQ29udGVudENoaWxkcmVuTWV0YWRhdGEgZXh0ZW5kcyBRdWVyeU1ldGFkYXRhIHtcbiAgY29uc3RydWN0b3IoX3NlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLFxuICAgICAgICAgICAgICB7ZGVzY2VuZGFudHMgPSBmYWxzZSwgcmVhZCA9IG51bGx9OiB7ZGVzY2VuZGFudHM/OiBib29sZWFuLCByZWFkPzogYW55fSA9IHt9KSB7XG4gICAgc3VwZXIoX3NlbGVjdG9yLCB7ZGVzY2VuZGFudHM6IGRlc2NlbmRhbnRzLCByZWFkOiByZWFkfSk7XG4gIH1cbn1cblxuLy8gVE9ETzogYWRkIGFuIGV4YW1wbGUgYWZ0ZXIgQ29udGVudENoaWxkIGFuZCBWaWV3Q2hpbGQgYXJlIGluIG1hc3RlclxuLyoqXG4gKiBDb25maWd1cmVzIGEgY29udGVudCBxdWVyeS5cbiAqXG4gKiBDb250ZW50IHF1ZXJpZXMgYXJlIHNldCBiZWZvcmUgdGhlIGBuZ0FmdGVyQ29udGVudEluaXRgIGNhbGxiYWNrIGlzIGNhbGxlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnc29tZURpcidcbiAqIH0pXG4gKiBjbGFzcyBTb21lRGlyIHtcbiAqICAgQENvbnRlbnRDaGlsZChDaGlsZERpcmVjdGl2ZSkgY29udGVudENoaWxkO1xuICpcbiAqICAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICogICAgIC8vIGNvbnRlbnRDaGlsZCBpcyBzZXRcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQ29udGVudENoaWxkTWV0YWRhdGEgZXh0ZW5kcyBRdWVyeU1ldGFkYXRhIHtcbiAgY29uc3RydWN0b3IoX3NlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLCB7cmVhZCA9IG51bGx9OiB7cmVhZD86IGFueX0gPSB7fSkge1xuICAgIHN1cGVyKF9zZWxlY3Rvciwge2Rlc2NlbmRhbnRzOiB0cnVlLCBmaXJzdDogdHJ1ZSwgcmVhZDogcmVhZH0pO1xuICB9XG59XG5cbi8qKlxuICogU2ltaWxhciB0byB7QGxpbmsgUXVlcnlNZXRhZGF0YX0sIGJ1dCBxdWVyeWluZyB0aGUgY29tcG9uZW50IHZpZXcsIGluc3RlYWQgb2ZcbiAqIHRoZSBjb250ZW50IGNoaWxkcmVuLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9lTnNGSERmN1lqeU02SXpLeE0xaj9wPXByZXZpZXcpKVxuICpcbiAqIGBgYGphdmFzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICAuLi4sXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGl0ZW0+IGEgPC9pdGVtPlxuICogICAgIDxpdGVtPiBiIDwvaXRlbT5cbiAqICAgICA8aXRlbT4gYyA8L2l0ZW0+XG4gKiAgIGBcbiAqIH0pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIHNob3duOiBib29sZWFuO1xuICpcbiAqICAgY29uc3RydWN0b3IocHJpdmF0ZSBAVmlld1F1ZXJ5KEl0ZW0pIGl0ZW1zOlF1ZXJ5TGlzdDxJdGVtPikge1xuICogICAgIGl0ZW1zLmNoYW5nZXMuc3Vic2NyaWJlKCgpID0+IGNvbnNvbGUubG9nKGl0ZW1zLmxlbmd0aCkpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBTdXBwb3J0cyB0aGUgc2FtZSBxdWVyeWluZyBwYXJhbWV0ZXJzIGFzIHtAbGluayBRdWVyeU1ldGFkYXRhfSwgZXhjZXB0XG4gKiBgZGVzY2VuZGFudHNgLiBUaGlzIGFsd2F5cyBxdWVyaWVzIHRoZSB3aG9sZSB2aWV3LlxuICpcbiAqIEFzIGBzaG93bmAgaXMgZmxpcHBlZCBiZXR3ZWVuIHRydWUgYW5kIGZhbHNlLCBpdGVtcyB3aWxsIGNvbnRhaW4gemVybyBvZiBvbmVcbiAqIGl0ZW1zLlxuICpcbiAqIFNwZWNpZmllcyB0aGF0IGEge0BsaW5rIFF1ZXJ5TGlzdH0gc2hvdWxkIGJlIGluamVjdGVkLlxuICpcbiAqIFRoZSBpbmplY3RlZCBvYmplY3QgaXMgYW4gaXRlcmFibGUgYW5kIG9ic2VydmFibGUgbGl2ZSBsaXN0LlxuICogU2VlIHtAbGluayBRdWVyeUxpc3R9IGZvciBtb3JlIGRldGFpbHMuXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgVmlld1F1ZXJ5TWV0YWRhdGEgZXh0ZW5kcyBRdWVyeU1ldGFkYXRhIHtcbiAgY29uc3RydWN0b3IoX3NlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLFxuICAgICAgICAgICAgICB7ZGVzY2VuZGFudHMgPSBmYWxzZSwgZmlyc3QgPSBmYWxzZSxcbiAgICAgICAgICAgICAgIHJlYWQgPSBudWxsfToge2Rlc2NlbmRhbnRzPzogYm9vbGVhbiwgZmlyc3Q/OiBib29sZWFuLCByZWFkPzogYW55fSA9IHt9KSB7XG4gICAgc3VwZXIoX3NlbGVjdG9yLCB7ZGVzY2VuZGFudHM6IGRlc2NlbmRhbnRzLCBmaXJzdDogZmlyc3QsIHJlYWQ6IHJlYWR9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBhbHdheXMgYHRydWVgIHRvIGRpZmZlcmVudGlhdGUgaXQgd2l0aCB7QGxpbmsgUXVlcnlNZXRhZGF0YX0uXG4gICAqL1xuICBnZXQgaXNWaWV3UXVlcnkoKSB7IHJldHVybiB0cnVlOyB9XG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiBgQFZpZXdRdWVyeSgke3N0cmluZ2lmeSh0aGlzLnNlbGVjdG9yKX0pYDsgfVxufVxuXG4vKipcbiAqIERlY2xhcmVzIGEgbGlzdCBvZiBjaGlsZCBlbGVtZW50IHJlZmVyZW5jZXMuXG4gKlxuICogQW5ndWxhciBhdXRvbWF0aWNhbGx5IHVwZGF0ZXMgdGhlIGxpc3Qgd2hlbiB0aGUgRE9NIGlzIHVwZGF0ZWQuXG4gKlxuICogYFZpZXdDaGlsZHJlbmAgdGFrZXMgYW4gYXJndW1lbnQgdG8gc2VsZWN0IGVsZW1lbnRzLlxuICpcbiAqIC0gSWYgdGhlIGFyZ3VtZW50IGlzIGEgdHlwZSwgZGlyZWN0aXZlcyBvciBjb21wb25lbnRzIHdpdGggdGhlIHR5cGUgd2lsbCBiZSBib3VuZC5cbiAqXG4gKiAtIElmIHRoZSBhcmd1bWVudCBpcyBhIHN0cmluZywgdGhlIHN0cmluZyBpcyBpbnRlcnByZXRlZCBhcyBhIGxpc3Qgb2YgY29tbWEtc2VwYXJhdGVkIHNlbGVjdG9ycy5cbiAqIEZvciBlYWNoIHNlbGVjdG9yLCBhbiBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIG1hdGNoaW5nIHRlbXBsYXRlIHZhcmlhYmxlIChlLmcuIGAjY2hpbGRgKSB3aWxsIGJlXG4gKiBib3VuZC5cbiAqXG4gKiBWaWV3IGNoaWxkcmVuIGFyZSBzZXQgYmVmb3JlIHRoZSBgbmdBZnRlclZpZXdJbml0YCBjYWxsYmFjayBpcyBjYWxsZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBXaXRoIHR5cGUgc2VsZWN0b3I6XG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdjaGlsZC1jbXAnLFxuICogICB0ZW1wbGF0ZTogJzxwPmNoaWxkPC9wPidcbiAqIH0pXG4gKiBjbGFzcyBDaGlsZENtcCB7XG4gKiAgIGRvU29tZXRoaW5nKCkge31cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdzb21lLWNtcCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGNoaWxkLWNtcD48L2NoaWxkLWNtcD5cbiAqICAgICA8Y2hpbGQtY21wPjwvY2hpbGQtY21wPlxuICogICAgIDxjaGlsZC1jbXA+PC9jaGlsZC1jbXA+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDaGlsZENtcF1cbiAqIH0pXG4gKiBjbGFzcyBTb21lQ21wIHtcbiAqICAgQFZpZXdDaGlsZHJlbihDaGlsZENtcCkgY2hpbGRyZW46UXVlcnlMaXN0PENoaWxkQ21wPjtcbiAqXG4gKiAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAqICAgICAvLyBjaGlsZHJlbiBhcmUgc2V0XG4gKiAgICAgdGhpcy5jaGlsZHJlbi50b0FycmF5KCkuZm9yRWFjaCgoY2hpbGQpPT5jaGlsZC5kb1NvbWV0aGluZygpKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogV2l0aCBzdHJpbmcgc2VsZWN0b3I6XG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdjaGlsZC1jbXAnLFxuICogICB0ZW1wbGF0ZTogJzxwPmNoaWxkPC9wPidcbiAqIH0pXG4gKiBjbGFzcyBDaGlsZENtcCB7XG4gKiAgIGRvU29tZXRoaW5nKCkge31cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdzb21lLWNtcCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGNoaWxkLWNtcCAjY2hpbGQxPjwvY2hpbGQtY21wPlxuICogICAgIDxjaGlsZC1jbXAgI2NoaWxkMj48L2NoaWxkLWNtcD5cbiAqICAgICA8Y2hpbGQtY21wICNjaGlsZDM+PC9jaGlsZC1jbXA+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDaGlsZENtcF1cbiAqIH0pXG4gKiBjbGFzcyBTb21lQ21wIHtcbiAqICAgQFZpZXdDaGlsZHJlbignY2hpbGQxLGNoaWxkMixjaGlsZDMnKSBjaGlsZHJlbjpRdWVyeUxpc3Q8Q2hpbGRDbXA+O1xuICpcbiAqICAgbmdBZnRlclZpZXdJbml0KCkge1xuICogICAgIC8vIGNoaWxkcmVuIGFyZSBzZXRcbiAqICAgICB0aGlzLmNoaWxkcmVuLnRvQXJyYXkoKS5mb3JFYWNoKChjaGlsZCk9PmNoaWxkLmRvU29tZXRoaW5nKCkpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBWaWV3Q2hpbGRyZW5NZXRhZGF0YSBleHRlbmRzIFZpZXdRdWVyeU1ldGFkYXRhIHtcbiAgY29uc3RydWN0b3IoX3NlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLCB7cmVhZCA9IG51bGx9OiB7cmVhZD86IGFueX0gPSB7fSkge1xuICAgIHN1cGVyKF9zZWxlY3Rvciwge2Rlc2NlbmRhbnRzOiB0cnVlLCByZWFkOiByZWFkfSk7XG4gIH1cbn1cblxuLyoqXG4gKlxuICogRGVjbGFyZXMgYSByZWZlcmVuY2Ugb2YgY2hpbGQgZWxlbWVudC5cbiAqXG4gKiBgVmlld0NoaWxkcmVuYCB0YWtlcyBhbiBhcmd1bWVudCB0byBzZWxlY3QgZWxlbWVudHMuXG4gKlxuICogLSBJZiB0aGUgYXJndW1lbnQgaXMgYSB0eXBlLCBhIGRpcmVjdGl2ZSBvciBhIGNvbXBvbmVudCB3aXRoIHRoZSB0eXBlIHdpbGwgYmUgYm91bmQuXG4gKlxuIElmIHRoZSBhcmd1bWVudCBpcyBhIHN0cmluZywgdGhlIHN0cmluZyBpcyBpbnRlcnByZXRlZCBhcyBhIHNlbGVjdG9yLiBBbiBlbGVtZW50IGNvbnRhaW5pbmcgdGhlXG4gbWF0Y2hpbmcgdGVtcGxhdGUgdmFyaWFibGUgKGUuZy4gYCNjaGlsZGApIHdpbGwgYmUgYm91bmQuXG4gKlxuICogSW4gZWl0aGVyIGNhc2UsIGBAVmlld0NoaWxkKClgIGFzc2lnbnMgdGhlIGZpcnN0IChsb29raW5nIGZyb20gYWJvdmUpIGVsZW1lbnQgaWYgdGhlcmUgYXJlXG4gbXVsdGlwbGUgbWF0Y2hlcy5cbiAqXG4gKiBWaWV3IGNoaWxkIGlzIHNldCBiZWZvcmUgdGhlIGBuZ0FmdGVyVmlld0luaXRgIGNhbGxiYWNrIGlzIGNhbGxlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFdpdGggdHlwZSBzZWxlY3RvcjpcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2NoaWxkLWNtcCcsXG4gKiAgIHRlbXBsYXRlOiAnPHA+Y2hpbGQ8L3A+J1xuICogfSlcbiAqIGNsYXNzIENoaWxkQ21wIHtcbiAqICAgZG9Tb21ldGhpbmcoKSB7fVxuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3NvbWUtY21wJyxcbiAqICAgdGVtcGxhdGU6ICc8Y2hpbGQtY21wPjwvY2hpbGQtY21wPicsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDaGlsZENtcF1cbiAqIH0pXG4gKiBjbGFzcyBTb21lQ21wIHtcbiAqICAgQFZpZXdDaGlsZChDaGlsZENtcCkgY2hpbGQ6Q2hpbGRDbXA7XG4gKlxuICogICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gKiAgICAgLy8gY2hpbGQgaXMgc2V0XG4gKiAgICAgdGhpcy5jaGlsZC5kb1NvbWV0aGluZygpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBXaXRoIHN0cmluZyBzZWxlY3RvcjpcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2NoaWxkLWNtcCcsXG4gKiAgIHRlbXBsYXRlOiAnPHA+Y2hpbGQ8L3A+J1xuICogfSlcbiAqIGNsYXNzIENoaWxkQ21wIHtcbiAqICAgZG9Tb21ldGhpbmcoKSB7fVxuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3NvbWUtY21wJyxcbiAqICAgdGVtcGxhdGU6ICc8Y2hpbGQtY21wICNjaGlsZD48L2NoaWxkLWNtcD4nLFxuICogICBkaXJlY3RpdmVzOiBbQ2hpbGRDbXBdXG4gKiB9KVxuICogY2xhc3MgU29tZUNtcCB7XG4gKiAgIEBWaWV3Q2hpbGQoJ2NoaWxkJykgY2hpbGQ6Q2hpbGRDbXA7XG4gKlxuICogICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gKiAgICAgLy8gY2hpbGQgaXMgc2V0XG4gKiAgICAgdGhpcy5jaGlsZC5kb1NvbWV0aGluZygpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBWaWV3Q2hpbGRNZXRhZGF0YSBleHRlbmRzIFZpZXdRdWVyeU1ldGFkYXRhIHtcbiAgY29uc3RydWN0b3IoX3NlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLCB7cmVhZCA9IG51bGx9OiB7cmVhZD86IGFueX0gPSB7fSkge1xuICAgIHN1cGVyKF9zZWxlY3Rvciwge2Rlc2NlbmRhbnRzOiB0cnVlLCBmaXJzdDogdHJ1ZSwgcmVhZDogcmVhZH0pO1xuICB9XG59XG5cbi8qKlxuICogRGVmaW5lcyBhbiBpbmplY3RhYmxlIHdob3NlIHZhbHVlIGlzIGdpdmVuIGJ5IGEgcHJvcGVydHkgb24gYW4gSW5qZWN0b3JNb2R1bGUgY2xhc3MuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBJbmplY3Rvck1vZHVsZSgpXG4gKiBjbGFzcyBNeU1vZHVsZSB7XG4gKiAgIEBQcm92aWRlcyhTb21lVG9rZW4pXG4gKiAgIHNvbWVQcm9wOiBzdHJpbmcgPSAnSGVsbG8gd29ybGQnO1xuICogfVxuICogYGBgXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgUHJvdmlkZXJQcm9wZXJ0eU1ldGFkYXRhIHtcbiAgcHJpdmF0ZSBfbXVsdGk6IGJvb2xlYW47XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0b2tlbjogYW55LCB7bXVsdGkgPSBmYWxzZX06IHttdWx0aT86IGJvb2xlYW59ID0ge30pIHsgdGhpcy5fbXVsdGkgPSBtdWx0aTsgfVxuXG4gIGdldCBtdWx0aSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX211bHRpOyB9XG59XG5cbi8qKlxuICogRGVmaW5lcyBhbiBpbmplY3RvciBtb2R1bGUgZnJvbSB3aGljaCBhbiBpbmplY3RvciBjYW4gYmUgZ2VuZXJhdGVkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBASW5qZWN0b3JNb2R1bGUoe1xuICogICBwcm92aWRlcnM6IFtTb21lU2VydmljZV1cbiAqIH0pXG4gKiBjbGFzcyBNeU1vZHVsZSB7fVxuICpcbiAqIGBgYFxuICogQGV4cGVyaW1lbnRhbFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEluamVjdG9yTW9kdWxlTWV0YWRhdGEge1xuICBwcml2YXRlIF9wcm92aWRlcnM6IGFueVtdO1xuXG4gIGNvbnN0cnVjdG9yKHtwcm92aWRlcnMgPSBDT05TVF9FWFBSKFtdKX06IHtwcm92aWRlcnM/OiBhbnlbXX0gPSB7fSkge1xuICAgIHRoaXMuX3Byb3ZpZGVycyA9IHByb3ZpZGVycztcbiAgfVxuXG4gIGdldCBwcm92aWRlcnMoKTogYW55W10geyByZXR1cm4gdGhpcy5fcHJvdmlkZXJzOyB9XG59XG4iXX0=