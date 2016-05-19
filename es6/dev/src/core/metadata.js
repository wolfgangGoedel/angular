/**
 * This indirection is needed to free up Component, etc symbols in the public API
 * to be used by the decorator versions of these annotations.
 */
export { QueryMetadata, ContentChildrenMetadata, ContentChildMetadata, ViewChildrenMetadata, ViewQueryMetadata, ViewChildMetadata, AttributeMetadata } from './metadata/di';
export { ComponentMetadata, DirectiveMetadata, PipeMetadata, InputMetadata, OutputMetadata, HostBindingMetadata, HostListenerMetadata } from './metadata/directives';
export { ViewMetadata, ViewEncapsulation } from './metadata/view';
import { QueryMetadata, ContentChildrenMetadata, ContentChildMetadata, ViewChildrenMetadata, ViewChildMetadata, ViewQueryMetadata, AttributeMetadata } from './metadata/di';
import { ComponentMetadata, DirectiveMetadata, PipeMetadata, InputMetadata, OutputMetadata, HostBindingMetadata, HostListenerMetadata } from './metadata/directives';
import { ViewMetadata } from './metadata/view';
import { makeDecorator, makeParamDecorator, makePropDecorator } from './util/decorators';
// TODO(alexeagle): remove the duplication of this doc. It is copied from ComponentMetadata.
/**
 * Declare reusable UI building blocks for an application.
 *
 * Each Angular component requires a single `@Component` annotation. The `@Component`
 * annotation specifies when a component is instantiated, and which properties and hostListeners it
 * binds to.
 *
 * When a component is instantiated, Angular
 * - creates a shadow DOM for the component.
 * - loads the selected template into the shadow DOM.
 * - creates all the injectable objects configured with `providers` and `viewProviders`.
 *
 * All template expressions and statements are then evaluated against the component instance.
 *
 * ## Lifecycle hooks
 *
 * When the component class implements some {@link ../../guide/lifecycle-hooks.html} the callbacks
 * are called by the change detection at defined points in time during the life of the component.
 *
 * ### Example
 *
 * {@example core/ts/metadata/metadata.ts region='component'}
 */
export var Component = makeDecorator(ComponentMetadata, (fn) => fn.View = View);
// TODO(alexeagle): remove the duplication of this doc. It is copied from DirectiveMetadata.
/**
 * Directives allow you to attach behavior to elements in the DOM.
 *
 * {@link DirectiveMetadata}s with an embedded view are called {@link ComponentMetadata}s.
 *
 * A directive consists of a single directive annotation and a controller class. When the
 * directive's `selector` matches
 * elements in the DOM, the following steps occur:
 *
 * 1. For each directive, the `ElementInjector` attempts to resolve the directive's constructor
 * arguments.
 * 2. Angular instantiates directives for each matched element using `ElementInjector` in a
 * depth-first order,
 *    as declared in the HTML.
 *
 * ## Understanding How Injection Works
 *
 * There are three stages of injection resolution.
 * - *Pre-existing Injectors*:
 *   - The terminal {@link Injector} cannot resolve dependencies. It either throws an error or, if
 * the dependency was
 *     specified as `@Optional`, returns `null`.
 *   - The platform injector resolves browser singleton resources, such as: cookies, title,
 * location, and others.
 * - *Component Injectors*: Each component instance has its own {@link Injector}, and they follow
 * the same parent-child hierarchy
 *     as the component instances in the DOM.
 * - *Element Injectors*: Each component instance has a Shadow DOM. Within the Shadow DOM each
 * element has an `ElementInjector`
 *     which follow the same parent-child hierarchy as the DOM elements themselves.
 *
 * When a template is instantiated, it also must instantiate the corresponding directives in a
 * depth-first order. The
 * current `ElementInjector` resolves the constructor dependencies for each directive.
 *
 * Angular then resolves dependencies as follows, according to the order in which they appear in the
 * {@link ViewMetadata}:
 *
 * 1. Dependencies on the current element
 * 2. Dependencies on element injectors and their parents until it encounters a Shadow DOM boundary
 * 3. Dependencies on component injectors and their parents until it encounters the root component
 * 4. Dependencies on pre-existing injectors
 *
 *
 * The `ElementInjector` can inject other directives, element-specific special objects, or it can
 * delegate to the parent
 * injector.
 *
 * To inject other directives, declare the constructor parameter as:
 * - `directive:DirectiveType`: a directive on the current element only
 * - `@Host() directive:DirectiveType`: any directive that matches the type between the current
 * element and the
 *    Shadow DOM root.
 * - `@Query(DirectiveType) query:QueryList<DirectiveType>`: A live collection of direct child
 * directives.
 * - `@QueryDescendants(DirectiveType) query:QueryList<DirectiveType>`: A live collection of any
 * child directives.
 *
 * To inject element-specific special objects, declare the constructor parameter as:
 * - `element: ElementRef` to obtain a reference to logical element in the view.
 * - `viewContainer: ViewContainerRef` to control child template instantiation, for
 * {@link DirectiveMetadata} directives only
 * - `bindingPropagation: BindingPropagation` to control change detection in a more granular way.
 *
 * ### Example
 *
 * The following example demonstrates how dependency injection resolves constructor arguments in
 * practice.
 *
 *
 * Assume this HTML template:
 *
 * ```
 * <div dependency="1">
 *   <div dependency="2">
 *     <div dependency="3" my-directive>
 *       <div dependency="4">
 *         <div dependency="5"></div>
 *       </div>
 *       <div dependency="6"></div>
 *     </div>
 *   </div>
 * </div>
 * ```
 *
 * With the following `dependency` decorator and `SomeService` injectable class.
 *
 * ```
 * @Injectable()
 * class SomeService {
 * }
 *
 * @Directive({
 *   selector: '[dependency]',
 *   inputs: [
 *     'id: dependency'
 *   ]
 * })
 * class Dependency {
 *   id:string;
 * }
 * ```
 *
 * Let's step through the different ways in which `MyDirective` could be declared...
 *
 *
 * ### No injection
 *
 * Here the constructor is declared with no arguments, therefore nothing is injected into
 * `MyDirective`.
 *
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor() {
 *   }
 * }
 * ```
 *
 * This directive would be instantiated with no dependencies.
 *
 *
 * ### Component-level injection
 *
 * Directives can inject any injectable instance from the closest component injector or any of its
 * parents.
 *
 * Here, the constructor declares a parameter, `someService`, and injects the `SomeService` type
 * from the parent
 * component's injector.
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(someService: SomeService) {
 *   }
 * }
 * ```
 *
 * This directive would be instantiated with a dependency on `SomeService`.
 *
 *
 * ### Injecting a directive from the current element
 *
 * Directives can inject other directives declared on the current element.
 *
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(dependency: Dependency) {
 *     expect(dependency.id).toEqual(3);
 *   }
 * }
 * ```
 * This directive would be instantiated with `Dependency` declared at the same element, in this case
 * `dependency="3"`.
 *
 * ### Injecting a directive from any ancestor elements
 *
 * Directives can inject other directives declared on any ancestor element (in the current Shadow
 * DOM), i.e. on the current element, the
 * parent element, or its parents.
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(@Host() dependency: Dependency) {
 *     expect(dependency.id).toEqual(2);
 *   }
 * }
 * ```
 *
 * `@Host` checks the current element, the parent, as well as its parents recursively. If
 * `dependency="2"` didn't
 * exist on the direct parent, this injection would
 * have returned
 * `dependency="1"`.
 *
 *
 * ### Injecting a live collection of direct child directives
 *
 *
 * A directive can also query for other child directives. Since parent directives are instantiated
 * before child directives, a directive can't simply inject the list of child directives. Instead,
 * the directive injects a {@link QueryList}, which updates its contents as children are added,
 * removed, or moved by a directive that uses a {@link ViewContainerRef} such as a `ngFor`, an
 * `ngIf`, or an `ngSwitch`.
 *
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(@Query(Dependency) dependencies:QueryList<Dependency>) {
 *   }
 * }
 * ```
 *
 * This directive would be instantiated with a {@link QueryList} which contains `Dependency` 4 and
 * 6. Here, `Dependency` 5 would not be included, because it is not a direct child.
 *
 * ### Injecting a live collection of descendant directives
 *
 * By passing the descendant flag to `@Query` above, we can include the children of the child
 * elements.
 *
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(@Query(Dependency, {descendants: true}) dependencies:QueryList<Dependency>) {
 *   }
 * }
 * ```
 *
 * This directive would be instantiated with a Query which would contain `Dependency` 4, 5 and 6.
 *
 * ### Optional injection
 *
 * The normal behavior of directives is to return an error when a specified dependency cannot be
 * resolved. If you
 * would like to inject `null` on unresolved dependency instead, you can annotate that dependency
 * with `@Optional()`.
 * This explicitly permits the author of a template to treat some of the surrounding directives as
 * optional.
 *
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(@Optional() dependency:Dependency) {
 *   }
 * }
 * ```
 *
 * This directive would be instantiated with a `Dependency` directive found on the current element.
 * If none can be
 * found, the injector supplies `null` instead of throwing an error.
 *
 * ### Example
 *
 * Here we use a decorator directive to simply define basic tool-tip behavior.
 *
 * ```
 * @Directive({
 *   selector: '[tooltip]',
 *   inputs: [
 *     'text: tooltip'
 *   ],
 *   host: {
 *     '(mouseenter)': 'onMouseEnter()',
 *     '(mouseleave)': 'onMouseLeave()'
 *   }
 * })
 * class Tooltip{
 *   text:string;
 *   overlay:Overlay; // NOT YET IMPLEMENTED
 *   overlayManager:OverlayManager; // NOT YET IMPLEMENTED
 *
 *   constructor(overlayManager:OverlayManager) {
 *     this.overlay = overlay;
 *   }
 *
 *   onMouseEnter() {
 *     // exact signature to be determined
 *     this.overlay = this.overlayManager.open(text, ...);
 *   }
 *
 *   onMouseLeave() {
 *     this.overlay.close();
 *     this.overlay = null;
 *   }
 * }
 * ```
 * In our HTML template, we can then add this behavior to a `<div>` or any other element with the
 * `tooltip` selector,
 * like so:
 *
 * ```
 * <div tooltip="some text here"></div>
 * ```
 *
 * Directives can also control the instantiation, destruction, and positioning of inline template
 * elements:
 *
 * A directive uses a {@link ViewContainerRef} to instantiate, insert, move, and destroy views at
 * runtime.
 * The {@link ViewContainerRef} is created as a result of `<template>` element, and represents a
 * location in the current view
 * where these actions are performed.
 *
 * Views are always created as children of the current {@link ViewMetadata}, and as siblings of the
 * `<template>` element. Thus a
 * directive in a child view cannot inject the directive that created it.
 *
 * Since directives that create views via ViewContainers are common in Angular, and using the full
 * `<template>` element syntax is wordy, Angular
 * also supports a shorthand notation: `<li *foo="bar">` and `<li template="foo: bar">` are
 * equivalent.
 *
 * Thus,
 *
 * ```
 * <ul>
 *   <li *foo="bar" title="text"></li>
 * </ul>
 * ```
 *
 * Expands in use to:
 *
 * ```
 * <ul>
 *   <template [foo]="bar">
 *     <li title="text"></li>
 *   </template>
 * </ul>
 * ```
 *
 * Notice that although the shorthand places `*foo="bar"` within the `<li>` element, the binding for
 * the directive
 * controller is correctly instantiated on the `<template>` element rather than the `<li>` element.
 *
 * ## Lifecycle hooks
 *
 * When the directive class implements some {@link ../../guide/lifecycle-hooks.html} the callbacks
 * are called by the change detection at defined points in time during the life of the directive.
 *
 * ### Example
 *
 * Let's suppose we want to implement the `unless` behavior, to conditionally include a template.
 *
 * Here is a simple directive that triggers on an `unless` selector:
 *
 * ```
 * @Directive({
 *   selector: '[unless]',
 *   inputs: ['unless']
 * })
 * export class Unless {
 *   viewContainer: ViewContainerRef;
 *   templateRef: TemplateRef;
 *   prevCondition: boolean;
 *
 *   constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef) {
 *     this.viewContainer = viewContainer;
 *     this.templateRef = templateRef;
 *     this.prevCondition = null;
 *   }
 *
 *   set unless(newCondition) {
 *     if (newCondition && (isBlank(this.prevCondition) || !this.prevCondition)) {
 *       this.prevCondition = true;
 *       this.viewContainer.clear();
 *     } else if (!newCondition && (isBlank(this.prevCondition) || this.prevCondition)) {
 *       this.prevCondition = false;
 *       this.viewContainer.create(this.templateRef);
 *     }
 *   }
 * }
 * ```
 *
 * We can then use this `unless` selector in a template:
 * ```
 * <ul>
 *   <li *unless="expr"></li>
 * </ul>
 * ```
 *
 * Once the directive instantiates the child view, the shorthand notation for the template expands
 * and the result is:
 *
 * ```
 * <ul>
 *   <template [unless]="exp">
 *     <li></li>
 *   </template>
 *   <li></li>
 * </ul>
 * ```
 *
 * Note also that although the `<li></li>` template still exists inside the `<template></template>`,
 * the instantiated
 * view occurs on the second `<li></li>` which is a sibling to the `<template>` element.
 */
export var Directive = makeDecorator(DirectiveMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ViewMetadata.
/**
 * Metadata properties available for configuring Views.
 *
 * Each Angular component requires a single `@Component` and at least one `@View` annotation. The
 * `@View` annotation specifies the HTML template to use, and lists the directives that are active
 * within the template.
 *
 * When a component is instantiated, the template is loaded into the component's shadow root, and
 * the expressions and statements in the template are evaluated against the component.
 *
 * For details on the `@Component` annotation, see {@link ComponentMetadata}.
 *
 * ### Example
 *
 * ```
 * @Component({
 *   selector: 'greet',
 *   template: 'Hello {{name}}!',
 *   directives: [GreetUser, Bold]
 * })
 * class Greet {
 *   name: string;
 *
 *   constructor() {
 *     this.name = 'World';
 *   }
 * }
 * ```
 */
var View = makeDecorator(ViewMetadata, (fn) => fn.View = View);
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
export var Attribute = makeParamDecorator(AttributeMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from QueryMetadata.
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
 *     this.panes = panes;
 *   }
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
 * class seeker {
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
 *   <div #findMe>...</div>
 *   <div #findMeToo>...</div>
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
export var Query = makeParamDecorator(QueryMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ContentChildrenMetadata.
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
export var ContentChildren = makePropDecorator(ContentChildrenMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ContentChildMetadata.
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
export var ContentChild = makePropDecorator(ContentChildMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ViewChildrenMetadata.
/**
 * Declares a list of child element references.
 *
 * Angular automatically updates the list when the DOM is updated.
 *
 * `ViewChildren` takes a argument to select elements.
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
 *
 * See also: [ViewChildrenMetadata]
 */
export var ViewChildren = makePropDecorator(ViewChildrenMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ViewChildMetadata.
/**
 * Declares a reference to a child element.
 *
 * `ViewChildren` takes a argument to select elements.
 *
 * - If the argument is a type, a directive or a component with the type will be bound.
 *
 * - If the argument is a string, the string is interpreted as a selector. An element containing the
 * matching template variable (e.g. `#child`) will be bound.
 *
 * In either case, `@ViewChild()` assigns the first (looking from above) element if there are
 * multiple matches.
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
 * See also: [ViewChildMetadata]
 */
export var ViewChild = makePropDecorator(ViewChildMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ViewQueryMetadata.
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
 *   constructor(private @Query(Item) items:QueryList<Item>) {
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
export var ViewQuery = makeParamDecorator(ViewQueryMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from PipeMetadata.
/**
 * Declare reusable pipe function.
 *
 * ### Example
 *
 * {@example core/ts/metadata/metadata.ts region='pipe'}
 */
export var Pipe = makeDecorator(PipeMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from InputMetadata.
/**
 * Declares a data-bound input property.
 *
 * Angular automatically updates data-bound properties during change detection.
 *
 * `InputMetadata` takes an optional parameter that specifies the name
 * used when instantiating a component in the template. When not provided,
 * the name of the decorated property is used.
 *
 * ### Example
 *
 * The following example creates a component with two input properties.
 *
 * ```typescript
 * @Component({
 *   selector: 'bank-account',
 *   template: `
 *     Bank Name: {{bankName}}
 *     Account Id: {{id}}
 *   `
 * })
 * class BankAccount {
 *   @Input() bankName: string;
 *   @Input('account-id') id: string;
 *
 *   // this property is not bound, and won't be automatically updated by Angular
 *   normalizedBankName: string;
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `
 *     <bank-account bank-name="RBC" account-id="4747"></bank-account>
 *   `,
 *   directives: [BankAccount]
 * })
 * class App {}
 *
 * bootstrap(App);
 * ```
 */
export var Input = makePropDecorator(InputMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from OutputMetadata.
/**
 * Declares an event-bound output property.
 *
 * When an output property emits an event, an event handler attached to that event
 * the template is invoked.
 *
 * `OutputMetadata` takes an optional parameter that specifies the name
 * used when instantiating a component in the template. When not provided,
 * the name of the decorated property is used.
 *
 * ### Example
 *
 * ```typescript
 * @Directive({
 *   selector: 'interval-dir',
 * })
 * class IntervalDir {
 *   @Output() everySecond = new EventEmitter();
 *   @Output('everyFiveSeconds') five5Secs = new EventEmitter();
 *
 *   constructor() {
 *     setInterval(() => this.everySecond.emit("event"), 1000);
 *     setInterval(() => this.five5Secs.emit("event"), 5000);
 *   }
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `
 *     <interval-dir (everySecond)="everySecond()" (everyFiveSeconds)="everyFiveSeconds()">
 *     </interval-dir>
 *   `,
 *   directives: [IntervalDir]
 * })
 * class App {
 *   everySecond() { console.log('second'); }
 *   everyFiveSeconds() { console.log('five seconds'); }
 * }
 * bootstrap(App);
 * ```
 */
export var Output = makePropDecorator(OutputMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from HostBindingMetadata.
/**
 * Declares a host property binding.
 *
 * Angular automatically checks host property bindings during change detection.
 * If a binding changes, it will update the host element of the directive.
 *
 * `HostBindingMetadata` takes an optional parameter that specifies the property
 * name of the host element that will be updated. When not provided,
 * the class property name is used.
 *
 * ### Example
 *
 * The following example creates a directive that sets the `valid` and `invalid` classes
 * on the DOM element that has ngModel directive on it.
 *
 * ```typescript
 * @Directive({selector: '[ngModel]'})
 * class NgModelStatus {
 *   constructor(public control:NgModel) {}
 *   @HostBinding('[class.valid]') get valid { return this.control.valid; }
 *   @HostBinding('[class.invalid]') get invalid { return this.control.invalid; }
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `<input [(ngModel)]="prop">`,
 *   directives: [FORM_DIRECTIVES, NgModelStatus]
 * })
 * class App {
 *   prop;
 * }
 *
 * bootstrap(App);
 * ```
 */
export var HostBinding = makePropDecorator(HostBindingMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from HostListenerMetadata.
/**
 * Declares a host listener.
 *
 * Angular will invoke the decorated method when the host element emits the specified event.
 *
 * If the decorated method returns `false`, then `preventDefault` is applied on the DOM
 * event.
 *
 * ### Example
 *
 * The following example declares a directive that attaches a click listener to the button and
 * counts clicks.
 *
 * ```typescript
 * @Directive({selector: 'button[counting]'})
 * class CountClicks {
 *   numberOfClicks = 0;
 *
 *   @HostListener('click', ['$event.target'])
 *   onClick(btn) {
 *     console.log("button", btn, "number of clicks:", this.numberOfClicks++);
 *   }
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `<button counting>Increment</button>`,
 *   directives: [CountClicks]
 * })
 * class App {}
 *
 * bootstrap(App);
 * ```
 */
export var HostListener = makePropDecorator(HostListenerMetadata);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVRjVWhrS2tYLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxTQUNFLGFBQWEsRUFDYix1QkFBdUIsRUFDdkIsb0JBQW9CLEVBQ3BCLG9CQUFvQixFQUNwQixpQkFBaUIsRUFDakIsaUJBQWlCLEVBQ2pCLGlCQUFpQixRQUNaLGVBQWUsQ0FBQztBQUV2QixTQUNFLGlCQUFpQixFQUNqQixpQkFBaUIsRUFDakIsWUFBWSxFQUNaLGFBQWEsRUFDYixjQUFjLEVBQ2QsbUJBQW1CLEVBQ25CLG9CQUFvQixRQUNmLHVCQUF1QixDQUFDO0FBRS9CLFNBQVEsWUFBWSxFQUFFLGlCQUFpQixRQUFPLGlCQUFpQixDQUFDO09BRXpELEVBQ0wsYUFBYSxFQUNiLHVCQUF1QixFQUN2QixvQkFBb0IsRUFDcEIsb0JBQW9CLEVBQ3BCLGlCQUFpQixFQUNqQixpQkFBaUIsRUFDakIsaUJBQWlCLEVBQ2xCLE1BQU0sZUFBZTtPQUVmLEVBQ0wsaUJBQWlCLEVBQ2pCLGlCQUFpQixFQUNqQixZQUFZLEVBQ1osYUFBYSxFQUNiLGNBQWMsRUFDZCxtQkFBbUIsRUFDbkIsb0JBQW9CLEVBQ3JCLE1BQU0sdUJBQXVCO09BRXZCLEVBQUMsWUFBWSxFQUFvQixNQUFNLGlCQUFpQjtPQUd4RCxFQUNMLGFBQWEsRUFDYixrQkFBa0IsRUFDbEIsaUJBQWlCLEVBR2xCLE1BQU0sbUJBQW1CO0FBc2ExQiw0RkFBNEY7QUFDNUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQkc7QUFDSCxPQUFPLElBQUksU0FBUyxHQUNFLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQU8sS0FBSyxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDO0FBRXBGLDRGQUE0RjtBQUM1Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F5WEc7QUFDSCxPQUFPLElBQUksU0FBUyxHQUF1QyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUU1Rix1RkFBdUY7QUFDdkY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E0Qkc7QUFDSCxJQUFJLElBQUksR0FBNkIsYUFBYSxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQU8sS0FBSyxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDO0FBRTlGOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JHO0FBQ0gsT0FBTyxJQUFJLFNBQVMsR0FBcUIsa0JBQWtCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUUvRSx3RkFBd0Y7QUFDeEY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EwR0c7QUFDSCxPQUFPLElBQUksS0FBSyxHQUFpQixrQkFBa0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUVuRSxrR0FBa0c7QUFDbEc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFDSCxPQUFPLElBQUksZUFBZSxHQUEyQixpQkFBaUIsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBRWhHLCtGQUErRjtBQUMvRjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1CRztBQUNILE9BQU8sSUFBSSxZQUFZLEdBQXdCLGlCQUFpQixDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFFdkYsK0ZBQStGO0FBQy9GOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4RUc7QUFDSCxPQUFPLElBQUksWUFBWSxHQUF3QixpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBRXZGLDRGQUE0RjtBQUM1Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUVHO0FBQ0gsT0FBTyxJQUFJLFNBQVMsR0FBcUIsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUU5RSw0RkFBNEY7QUFDNUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQ0c7QUFDSCxPQUFPLElBQUksU0FBUyxHQUFpQixrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBRTNFLHVGQUF1RjtBQUN2Rjs7Ozs7O0dBTUc7QUFDSCxPQUFPLElBQUksSUFBSSxHQUE2QixhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7QUFFeEUsd0ZBQXdGO0FBQ3hGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBd0NHO0FBQ0gsT0FBTyxJQUFJLEtBQUssR0FBaUIsaUJBQWlCLENBQUMsYUFBYSxDQUFDLENBQUM7QUFFbEUseUZBQXlGO0FBQ3pGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBd0NHO0FBQ0gsT0FBTyxJQUFJLE1BQU0sR0FBa0IsaUJBQWlCLENBQUMsY0FBYyxDQUFDLENBQUM7QUFFckUsOEZBQThGO0FBQzlGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0NHO0FBQ0gsT0FBTyxJQUFJLFdBQVcsR0FBdUIsaUJBQWlCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUVwRiwrRkFBK0Y7QUFDL0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWlDRztBQUNILE9BQU8sSUFBSSxZQUFZLEdBQXdCLGlCQUFpQixDQUFDLG9CQUFvQixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoaXMgaW5kaXJlY3Rpb24gaXMgbmVlZGVkIHRvIGZyZWUgdXAgQ29tcG9uZW50LCBldGMgc3ltYm9scyBpbiB0aGUgcHVibGljIEFQSVxuICogdG8gYmUgdXNlZCBieSB0aGUgZGVjb3JhdG9yIHZlcnNpb25zIG9mIHRoZXNlIGFubm90YXRpb25zLlxuICovXG5cbmV4cG9ydCB7XG4gIFF1ZXJ5TWV0YWRhdGEsXG4gIENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhLFxuICBDb250ZW50Q2hpbGRNZXRhZGF0YSxcbiAgVmlld0NoaWxkcmVuTWV0YWRhdGEsXG4gIFZpZXdRdWVyeU1ldGFkYXRhLFxuICBWaWV3Q2hpbGRNZXRhZGF0YSxcbiAgQXR0cmlidXRlTWV0YWRhdGFcbn0gZnJvbSAnLi9tZXRhZGF0YS9kaSc7XG5cbmV4cG9ydCB7XG4gIENvbXBvbmVudE1ldGFkYXRhLFxuICBEaXJlY3RpdmVNZXRhZGF0YSxcbiAgUGlwZU1ldGFkYXRhLFxuICBJbnB1dE1ldGFkYXRhLFxuICBPdXRwdXRNZXRhZGF0YSxcbiAgSG9zdEJpbmRpbmdNZXRhZGF0YSxcbiAgSG9zdExpc3RlbmVyTWV0YWRhdGFcbn0gZnJvbSAnLi9tZXRhZGF0YS9kaXJlY3RpdmVzJztcblxuZXhwb3J0IHtWaWV3TWV0YWRhdGEsIFZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICcuL21ldGFkYXRhL3ZpZXcnO1xuXG5pbXBvcnQge1xuICBRdWVyeU1ldGFkYXRhLFxuICBDb250ZW50Q2hpbGRyZW5NZXRhZGF0YSxcbiAgQ29udGVudENoaWxkTWV0YWRhdGEsXG4gIFZpZXdDaGlsZHJlbk1ldGFkYXRhLFxuICBWaWV3Q2hpbGRNZXRhZGF0YSxcbiAgVmlld1F1ZXJ5TWV0YWRhdGEsXG4gIEF0dHJpYnV0ZU1ldGFkYXRhXG59IGZyb20gJy4vbWV0YWRhdGEvZGknO1xuXG5pbXBvcnQge1xuICBDb21wb25lbnRNZXRhZGF0YSxcbiAgRGlyZWN0aXZlTWV0YWRhdGEsXG4gIFBpcGVNZXRhZGF0YSxcbiAgSW5wdXRNZXRhZGF0YSxcbiAgT3V0cHV0TWV0YWRhdGEsXG4gIEhvc3RCaW5kaW5nTWV0YWRhdGEsXG4gIEhvc3RMaXN0ZW5lck1ldGFkYXRhXG59IGZyb20gJy4vbWV0YWRhdGEvZGlyZWN0aXZlcyc7XG5cbmltcG9ydCB7Vmlld01ldGFkYXRhLCBWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnLi9tZXRhZGF0YS92aWV3JztcbmltcG9ydCB7Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3l9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbic7XG5cbmltcG9ydCB7XG4gIG1ha2VEZWNvcmF0b3IsXG4gIG1ha2VQYXJhbURlY29yYXRvcixcbiAgbWFrZVByb3BEZWNvcmF0b3IsXG4gIFR5cGVEZWNvcmF0b3IsXG4gIENsYXNzXG59IGZyb20gJy4vdXRpbC9kZWNvcmF0b3JzJztcbmltcG9ydCB7VHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBJbnRlcmZhY2UgZm9yIHRoZSB7QGxpbmsgRGlyZWN0aXZlTWV0YWRhdGF9IGRlY29yYXRvciBmdW5jdGlvbi5cbiAqXG4gKiBTZWUge0BsaW5rIERpcmVjdGl2ZUZhY3Rvcnl9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIERpcmVjdGl2ZURlY29yYXRvciBleHRlbmRzIFR5cGVEZWNvcmF0b3Ige31cblxuLyoqXG4gKiBJbnRlcmZhY2UgZm9yIHRoZSB7QGxpbmsgQ29tcG9uZW50TWV0YWRhdGF9IGRlY29yYXRvciBmdW5jdGlvbi5cbiAqXG4gKiBTZWUge0BsaW5rIENvbXBvbmVudEZhY3Rvcnl9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudERlY29yYXRvciBleHRlbmRzIFR5cGVEZWNvcmF0b3Ige1xuICAvKipcbiAgICogQ2hhaW4ge0BsaW5rIFZpZXdNZXRhZGF0YX0gYW5ub3RhdGlvbi5cbiAgICovXG4gIFZpZXcob2JqOiB7XG4gICAgdGVtcGxhdGVVcmw/OiBzdHJpbmcsXG4gICAgdGVtcGxhdGU/OiBzdHJpbmcsXG4gICAgZGlyZWN0aXZlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgcGlwZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHJlbmRlcmVyPzogc3RyaW5nLFxuICAgIHN0eWxlcz86IHN0cmluZ1tdLFxuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdLFxuICB9KTogVmlld0RlY29yYXRvcjtcbn1cblxuLyoqXG4gKiBJbnRlcmZhY2UgZm9yIHRoZSB7QGxpbmsgVmlld01ldGFkYXRhfSBkZWNvcmF0b3IgZnVuY3Rpb24uXG4gKlxuICogU2VlIHtAbGluayBWaWV3RmFjdG9yeX0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVmlld0RlY29yYXRvciBleHRlbmRzIFR5cGVEZWNvcmF0b3Ige1xuICAvKipcbiAgICogQ2hhaW4ge0BsaW5rIFZpZXdNZXRhZGF0YX0gYW5ub3RhdGlvbi5cbiAgICovXG4gIFZpZXcob2JqOiB7XG4gICAgdGVtcGxhdGVVcmw/OiBzdHJpbmcsXG4gICAgdGVtcGxhdGU/OiBzdHJpbmcsXG4gICAgZGlyZWN0aXZlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgcGlwZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHJlbmRlcmVyPzogc3RyaW5nLFxuICAgIHN0eWxlcz86IHN0cmluZ1tdLFxuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdLFxuICB9KTogVmlld0RlY29yYXRvcjtcbn1cblxuLyoqXG4gKiB7QGxpbmsgRGlyZWN0aXZlTWV0YWRhdGF9IGZhY3RvcnkgZm9yIGNyZWF0aW5nIGFubm90YXRpb25zLCBkZWNvcmF0b3JzIG9yIERTTC5cbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBUeXBlU2NyaXB0IERlY29yYXRvclxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3RzL21ldGFkYXRhL21ldGFkYXRhLnRzIHJlZ2lvbj0nZGlyZWN0aXZlJ31cbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgRFNMXG4gKlxuICogYGBgXG4gKiB2YXIgTXlEaXJlY3RpdmUgPSBuZ1xuICogICAuRGlyZWN0aXZlKHsuLi59KVxuICogICAuQ2xhc3Moe1xuICogICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbigpIHtcbiAqICAgICAgIC4uLlxuICogICAgIH1cbiAqICAgfSlcbiAqIGBgYFxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBhbm5vdGF0aW9uXG4gKlxuICogYGBgXG4gKiB2YXIgTXlEaXJlY3RpdmUgPSBmdW5jdGlvbigpIHtcbiAqICAgLi4uXG4gKiB9O1xuICpcbiAqIE15RGlyZWN0aXZlLmFubm90YXRpb25zID0gW1xuICogICBuZXcgbmcuRGlyZWN0aXZlKHsuLi59KVxuICogXVxuICogYGBgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGlyZWN0aXZlRmFjdG9yeSB7XG4gIChvYmo6IHtcbiAgICBzZWxlY3Rvcj86IHN0cmluZyxcbiAgICBpbnB1dHM/OiBzdHJpbmdbXSxcbiAgICBvdXRwdXRzPzogc3RyaW5nW10sXG4gICAgcHJvcGVydGllcz86IHN0cmluZ1tdLFxuICAgIGV2ZW50cz86IHN0cmluZ1tdLFxuICAgIGhvc3Q/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBiaW5kaW5ncz86IGFueVtdLFxuICAgIHByb3ZpZGVycz86IGFueVtdLFxuICAgIGV4cG9ydEFzPzogc3RyaW5nLFxuICAgIHF1ZXJpZXM/OiB7W2tleTogc3RyaW5nXTogYW55fVxuICB9KTogRGlyZWN0aXZlRGVjb3JhdG9yO1xuICBuZXcgKG9iajoge1xuICAgIHNlbGVjdG9yPzogc3RyaW5nLFxuICAgIGlucHV0cz86IHN0cmluZ1tdLFxuICAgIG91dHB1dHM/OiBzdHJpbmdbXSxcbiAgICBwcm9wZXJ0aWVzPzogc3RyaW5nW10sXG4gICAgZXZlbnRzPzogc3RyaW5nW10sXG4gICAgaG9zdD86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIGJpbmRpbmdzPzogYW55W10sXG4gICAgcHJvdmlkZXJzPzogYW55W10sXG4gICAgZXhwb3J0QXM/OiBzdHJpbmcsXG4gICAgcXVlcmllcz86IHtba2V5OiBzdHJpbmddOiBhbnl9XG4gIH0pOiBEaXJlY3RpdmVNZXRhZGF0YTtcbn1cblxuLyoqXG4gKiB7QGxpbmsgQ29tcG9uZW50TWV0YWRhdGF9IGZhY3RvcnkgZm9yIGNyZWF0aW5nIGFubm90YXRpb25zLCBkZWNvcmF0b3JzIG9yIERTTC5cbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBUeXBlU2NyaXB0IERlY29yYXRvclxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3RzL21ldGFkYXRhL21ldGFkYXRhLnRzIHJlZ2lvbj0nY29tcG9uZW50J31cbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgRFNMXG4gKlxuICogYGBgXG4gKiB2YXIgTXlDb21wb25lbnQgPSBuZ1xuICogICAuQ29tcG9uZW50KHsuLi59KVxuICogICAuQ2xhc3Moe1xuICogICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbigpIHtcbiAqICAgICAgIC4uLlxuICogICAgIH1cbiAqICAgfSlcbiAqIGBgYFxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBhbm5vdGF0aW9uXG4gKlxuICogYGBgXG4gKiB2YXIgTXlDb21wb25lbnQgPSBmdW5jdGlvbigpIHtcbiAqICAgLi4uXG4gKiB9O1xuICpcbiAqIE15Q29tcG9uZW50LmFubm90YXRpb25zID0gW1xuICogICBuZXcgbmcuQ29tcG9uZW50KHsuLi59KVxuICogXVxuICogYGBgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50RmFjdG9yeSB7XG4gIChvYmo6IHtcbiAgICBzZWxlY3Rvcj86IHN0cmluZyxcbiAgICBpbnB1dHM/OiBzdHJpbmdbXSxcbiAgICBvdXRwdXRzPzogc3RyaW5nW10sXG4gICAgcHJvcGVydGllcz86IHN0cmluZ1tdLFxuICAgIGV2ZW50cz86IHN0cmluZ1tdLFxuICAgIGhvc3Q/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICAvKiBAZGVwcmVjYXRlZCAqL1xuICAgIGJpbmRpbmdzPzogYW55W10sXG4gICAgcHJvdmlkZXJzPzogYW55W10sXG4gICAgZXhwb3J0QXM/OiBzdHJpbmcsXG4gICAgbW9kdWxlSWQ/OiBzdHJpbmcsXG4gICAgcXVlcmllcz86IHtba2V5OiBzdHJpbmddOiBhbnl9LFxuICAgIHZpZXdCaW5kaW5ncz86IGFueVtdLFxuICAgIHZpZXdQcm92aWRlcnM/OiBhbnlbXSxcbiAgICBjaGFuZ2VEZXRlY3Rpb24/OiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZyxcbiAgICB0ZW1wbGF0ZT86IHN0cmluZyxcbiAgICBzdHlsZVVybHM/OiBzdHJpbmdbXSxcbiAgICBzdHlsZXM/OiBzdHJpbmdbXSxcbiAgICBkaXJlY3RpdmVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBwaXBlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgZW5jYXBzdWxhdGlvbj86IFZpZXdFbmNhcHN1bGF0aW9uXG4gIH0pOiBDb21wb25lbnREZWNvcmF0b3I7XG4gIG5ldyAob2JqOiB7XG4gICAgc2VsZWN0b3I/OiBzdHJpbmcsXG4gICAgaW5wdXRzPzogc3RyaW5nW10sXG4gICAgb3V0cHV0cz86IHN0cmluZ1tdLFxuICAgIHByb3BlcnRpZXM/OiBzdHJpbmdbXSxcbiAgICBldmVudHM/OiBzdHJpbmdbXSxcbiAgICBob3N0Pzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgLyogQGRlcHJlY2F0ZWQgKi9cbiAgICBiaW5kaW5ncz86IGFueVtdLFxuICAgIHByb3ZpZGVycz86IGFueVtdLFxuICAgIGV4cG9ydEFzPzogc3RyaW5nLFxuICAgIG1vZHVsZUlkPzogc3RyaW5nLFxuICAgIHF1ZXJpZXM/OiB7W2tleTogc3RyaW5nXTogYW55fSxcbiAgICAvKiBAZGVwcmVjYXRlZCAqL1xuICAgIHZpZXdCaW5kaW5ncz86IGFueVtdLFxuICAgIHZpZXdQcm92aWRlcnM/OiBhbnlbXSxcbiAgICBjaGFuZ2VEZXRlY3Rpb24/OiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZyxcbiAgICB0ZW1wbGF0ZT86IHN0cmluZyxcbiAgICBzdHlsZVVybHM/OiBzdHJpbmdbXSxcbiAgICBzdHlsZXM/OiBzdHJpbmdbXSxcbiAgICBkaXJlY3RpdmVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBwaXBlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgZW5jYXBzdWxhdGlvbj86IFZpZXdFbmNhcHN1bGF0aW9uXG4gIH0pOiBDb21wb25lbnRNZXRhZGF0YTtcbn1cblxuLyoqXG4gKiB7QGxpbmsgVmlld01ldGFkYXRhfSBmYWN0b3J5IGZvciBjcmVhdGluZyBhbm5vdGF0aW9ucywgZGVjb3JhdG9ycyBvciBEU0wuXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgVHlwZVNjcmlwdCBEZWNvcmF0b3JcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50LCBWaWV3fSBmcm9tIFwiYW5ndWxhcjIvY29yZVwiO1xuICpcbiAqIEBDb21wb25lbnQoey4uLn0pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIGNvbnN0cnVjdG9yKCkge1xuICogICAgIC4uLlxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgRFNMXG4gKlxuICogYGBgXG4gKiB2YXIgTXlDb21wb25lbnQgPSBuZ1xuICogICAuQ29tcG9uZW50KHsuLi59KVxuICogICAuVmlldyh7Li4ufSlcbiAqICAgLkNsYXNzKHtcbiAqICAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24oKSB7XG4gKiAgICAgICAuLi5cbiAqICAgICB9XG4gKiAgIH0pXG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgYW5ub3RhdGlvblxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gZnVuY3Rpb24oKSB7XG4gKiAgIC4uLlxuICogfTtcbiAqXG4gKiBNeUNvbXBvbmVudC5hbm5vdGF0aW9ucyA9IFtcbiAqICAgbmV3IG5nLkNvbXBvbmVudCh7Li4ufSksXG4gKiAgIG5ldyBuZy5WaWV3KHsuLi59KVxuICogXVxuICogYGBgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVmlld0ZhY3Rvcnkge1xuICAob2JqOiB7XG4gICAgdGVtcGxhdGVVcmw/OiBzdHJpbmcsXG4gICAgdGVtcGxhdGU/OiBzdHJpbmcsXG4gICAgZGlyZWN0aXZlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgcGlwZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIGVuY2Fwc3VsYXRpb24/OiBWaWV3RW5jYXBzdWxhdGlvbixcbiAgICBzdHlsZXM/OiBzdHJpbmdbXSxcbiAgICBzdHlsZVVybHM/OiBzdHJpbmdbXSxcbiAgfSk6IFZpZXdEZWNvcmF0b3I7XG4gIG5ldyAob2JqOiB7XG4gICAgdGVtcGxhdGVVcmw/OiBzdHJpbmcsXG4gICAgdGVtcGxhdGU/OiBzdHJpbmcsXG4gICAgZGlyZWN0aXZlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgcGlwZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIGVuY2Fwc3VsYXRpb24/OiBWaWV3RW5jYXBzdWxhdGlvbixcbiAgICBzdHlsZXM/OiBzdHJpbmdbXSxcbiAgICBzdHlsZVVybHM/OiBzdHJpbmdbXSxcbiAgfSk6IFZpZXdNZXRhZGF0YTtcbn1cblxuLyoqXG4gKiB7QGxpbmsgQXR0cmlidXRlTWV0YWRhdGF9IGZhY3RvcnkgZm9yIGNyZWF0aW5nIGFubm90YXRpb25zLCBkZWNvcmF0b3JzIG9yIERTTC5cbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBUeXBlU2NyaXB0IERlY29yYXRvclxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3RzL21ldGFkYXRhL21ldGFkYXRhLnRzIHJlZ2lvbj0nYXR0cmlidXRlRmFjdG9yeSd9XG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IERTTFxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gbmdcbiAqICAgLkNvbXBvbmVudCh7Li4ufSlcbiAqICAgLkNsYXNzKHtcbiAqICAgICBjb25zdHJ1Y3RvcjogW25ldyBuZy5BdHRyaWJ1dGUoJ3RpdGxlJyksIGZ1bmN0aW9uKHRpdGxlKSB7XG4gKiAgICAgICAuLi5cbiAqICAgICB9XVxuICogICB9KVxuICogYGBgXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IGFubm90YXRpb25cbiAqXG4gKiBgYGBcbiAqIHZhciBNeUNvbXBvbmVudCA9IGZ1bmN0aW9uKHRpdGxlKSB7XG4gKiAgIC4uLlxuICogfTtcbiAqXG4gKiBNeUNvbXBvbmVudC5hbm5vdGF0aW9ucyA9IFtcbiAqICAgbmV3IG5nLkNvbXBvbmVudCh7Li4ufSlcbiAqIF1cbiAqIE15Q29tcG9uZW50LnBhcmFtZXRlcnMgPSBbXG4gKiAgIFtuZXcgbmcuQXR0cmlidXRlKCd0aXRsZScpXVxuICogXVxuICogYGBgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQXR0cmlidXRlRmFjdG9yeSB7XG4gIChuYW1lOiBzdHJpbmcpOiBUeXBlRGVjb3JhdG9yO1xuICBuZXcgKG5hbWU6IHN0cmluZyk6IEF0dHJpYnV0ZU1ldGFkYXRhO1xufVxuXG4vKipcbiAqIHtAbGluayBRdWVyeU1ldGFkYXRhfSBmYWN0b3J5IGZvciBjcmVhdGluZyBhbm5vdGF0aW9ucywgZGVjb3JhdG9ycyBvciBEU0wuXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgVHlwZVNjcmlwdCBEZWNvcmF0b3JcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7UXVlcnksIFF1ZXJ5TGlzdCwgQ29tcG9uZW50fSBmcm9tIFwiYW5ndWxhcjIvY29yZVwiO1xuICpcbiAqIEBDb21wb25lbnQoey4uLn0pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeShTb21lVHlwZSkgcXVlcnlMaXN0OiBRdWVyeUxpc3Q8U29tZVR5cGU+KSB7XG4gKiAgICAgLi4uXG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBEU0xcbiAqXG4gKiBgYGBcbiAqIHZhciBNeUNvbXBvbmVudCA9IG5nXG4gKiAgIC5Db21wb25lbnQoey4uLn0pXG4gKiAgIC5DbGFzcyh7XG4gKiAgICAgY29uc3RydWN0b3I6IFtuZXcgbmcuUXVlcnkoU29tZVR5cGUpLCBmdW5jdGlvbihxdWVyeUxpc3QpIHtcbiAqICAgICAgIC4uLlxuICogICAgIH1dXG4gKiAgIH0pXG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgYW5ub3RhdGlvblxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gZnVuY3Rpb24ocXVlcnlMaXN0KSB7XG4gKiAgIC4uLlxuICogfTtcbiAqXG4gKiBNeUNvbXBvbmVudC5hbm5vdGF0aW9ucyA9IFtcbiAqICAgbmV3IG5nLkNvbXBvbmVudCh7Li4ufSlcbiAqIF1cbiAqIE15Q29tcG9uZW50LnBhcmFtZXRlcnMgPSBbXG4gKiAgIFtuZXcgbmcuUXVlcnkoU29tZVR5cGUpXVxuICogXVxuICogYGBgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUXVlcnlGYWN0b3J5IHtcbiAgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLCB7ZGVzY2VuZGFudHN9Pzoge2Rlc2NlbmRhbnRzPzogYm9vbGVhbn0pOiBQYXJhbWV0ZXJEZWNvcmF0b3I7XG4gIG5ldyAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcsIHtkZXNjZW5kYW50c30/OiB7ZGVzY2VuZGFudHM/OiBib29sZWFufSk6IFF1ZXJ5TWV0YWRhdGE7XG59XG5cbi8qKlxuICogRmFjdG9yeSBmb3Ige0BsaW5rIENvbnRlbnRDaGlsZHJlbn0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGVudENoaWxkcmVuRmFjdG9yeSB7XG4gIChzZWxlY3RvcjogVHlwZSB8IHN0cmluZywge2Rlc2NlbmRhbnRzfT86IHtkZXNjZW5kYW50cz86IGJvb2xlYW59KTogYW55O1xuICBuZXcgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLCB7ZGVzY2VuZGFudHN9Pzoge2Rlc2NlbmRhbnRzPzogYm9vbGVhbn0pOiBDb250ZW50Q2hpbGRyZW5NZXRhZGF0YTtcbn1cblxuLyoqXG4gKiBGYWN0b3J5IGZvciB7QGxpbmsgQ29udGVudENoaWxkfS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb250ZW50Q2hpbGRGYWN0b3J5IHtcbiAgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nKTogYW55O1xuICBuZXcgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nKTogQ29udGVudENoaWxkRmFjdG9yeTtcbn1cblxuLyoqXG4gKiBGYWN0b3J5IGZvciB7QGxpbmsgVmlld0NoaWxkcmVufS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBWaWV3Q2hpbGRyZW5GYWN0b3J5IHtcbiAgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nKTogYW55O1xuICBuZXcgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nKTogVmlld0NoaWxkcmVuTWV0YWRhdGE7XG59XG5cbi8qKlxuICogRmFjdG9yeSBmb3Ige0BsaW5rIFZpZXdDaGlsZH0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVmlld0NoaWxkRmFjdG9yeSB7XG4gIChzZWxlY3RvcjogVHlwZSB8IHN0cmluZyk6IGFueTtcbiAgbmV3IChzZWxlY3RvcjogVHlwZSB8IHN0cmluZyk6IFZpZXdDaGlsZEZhY3Rvcnk7XG59XG5cblxuLyoqXG4gKiB7QGxpbmsgUGlwZU1ldGFkYXRhfSBmYWN0b3J5IGZvciBjcmVhdGluZyBkZWNvcmF0b3JzLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbWV0YWRhdGEudHMgcmVnaW9uPSdwaXBlJ31cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQaXBlRmFjdG9yeSB7XG4gIChvYmo6IHtuYW1lOiBzdHJpbmcsIHB1cmU/OiBib29sZWFufSk6IGFueTtcbiAgbmV3IChvYmo6IHtuYW1lOiBzdHJpbmcsIHB1cmU/OiBib29sZWFufSk6IGFueTtcbn1cblxuLyoqXG4gKiB7QGxpbmsgSW5wdXRNZXRhZGF0YX0gZmFjdG9yeSBmb3IgY3JlYXRpbmcgZGVjb3JhdG9ycy5cbiAqXG4gKiBTZWUge0BsaW5rIElucHV0TWV0YWRhdGF9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIElucHV0RmFjdG9yeSB7XG4gIChiaW5kaW5nUHJvcGVydHlOYW1lPzogc3RyaW5nKTogYW55O1xuICBuZXcgKGJpbmRpbmdQcm9wZXJ0eU5hbWU/OiBzdHJpbmcpOiBhbnk7XG59XG5cbi8qKlxuICoge0BsaW5rIE91dHB1dE1ldGFkYXRhfSBmYWN0b3J5IGZvciBjcmVhdGluZyBkZWNvcmF0b3JzLlxuICpcbiAqIFNlZSB7QGxpbmsgT3V0cHV0TWV0YWRhdGF9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIE91dHB1dEZhY3Rvcnkge1xuICAoYmluZGluZ1Byb3BlcnR5TmFtZT86IHN0cmluZyk6IGFueTtcbiAgbmV3IChiaW5kaW5nUHJvcGVydHlOYW1lPzogc3RyaW5nKTogYW55O1xufVxuXG4vKipcbiAqIHtAbGluayBIb3N0QmluZGluZ01ldGFkYXRhfSBmYWN0b3J5IGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEhvc3RCaW5kaW5nRmFjdG9yeSB7XG4gIChob3N0UHJvcGVydHlOYW1lPzogc3RyaW5nKTogYW55O1xuICBuZXcgKGhvc3RQcm9wZXJ0eU5hbWU/OiBzdHJpbmcpOiBhbnk7XG59XG5cbi8qKlxuICoge0BsaW5rIEhvc3RMaXN0ZW5lck1ldGFkYXRhfSBmYWN0b3J5IGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEhvc3RMaXN0ZW5lckZhY3Rvcnkge1xuICAoZXZlbnROYW1lOiBzdHJpbmcsIGFyZ3M/OiBzdHJpbmdbXSk6IGFueTtcbiAgbmV3IChldmVudE5hbWU6IHN0cmluZywgYXJncz86IHN0cmluZ1tdKTogYW55O1xufVxuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIENvbXBvbmVudE1ldGFkYXRhLlxuLyoqXG4gKiBEZWNsYXJlIHJldXNhYmxlIFVJIGJ1aWxkaW5nIGJsb2NrcyBmb3IgYW4gYXBwbGljYXRpb24uXG4gKlxuICogRWFjaCBBbmd1bGFyIGNvbXBvbmVudCByZXF1aXJlcyBhIHNpbmdsZSBgQENvbXBvbmVudGAgYW5ub3RhdGlvbi4gVGhlIGBAQ29tcG9uZW50YFxuICogYW5ub3RhdGlvbiBzcGVjaWZpZXMgd2hlbiBhIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQsIGFuZCB3aGljaCBwcm9wZXJ0aWVzIGFuZCBob3N0TGlzdGVuZXJzIGl0XG4gKiBiaW5kcyB0by5cbiAqXG4gKiBXaGVuIGEgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCwgQW5ndWxhclxuICogLSBjcmVhdGVzIGEgc2hhZG93IERPTSBmb3IgdGhlIGNvbXBvbmVudC5cbiAqIC0gbG9hZHMgdGhlIHNlbGVjdGVkIHRlbXBsYXRlIGludG8gdGhlIHNoYWRvdyBET00uXG4gKiAtIGNyZWF0ZXMgYWxsIHRoZSBpbmplY3RhYmxlIG9iamVjdHMgY29uZmlndXJlZCB3aXRoIGBwcm92aWRlcnNgIGFuZCBgdmlld1Byb3ZpZGVyc2AuXG4gKlxuICogQWxsIHRlbXBsYXRlIGV4cHJlc3Npb25zIGFuZCBzdGF0ZW1lbnRzIGFyZSB0aGVuIGV2YWx1YXRlZCBhZ2FpbnN0IHRoZSBjb21wb25lbnQgaW5zdGFuY2UuXG4gKlxuICogIyMgTGlmZWN5Y2xlIGhvb2tzXG4gKlxuICogV2hlbiB0aGUgY29tcG9uZW50IGNsYXNzIGltcGxlbWVudHMgc29tZSB7QGxpbmsgLi4vLi4vZ3VpZGUvbGlmZWN5Y2xlLWhvb2tzLmh0bWx9IHRoZSBjYWxsYmFja3NcbiAqIGFyZSBjYWxsZWQgYnkgdGhlIGNoYW5nZSBkZXRlY3Rpb24gYXQgZGVmaW5lZCBwb2ludHMgaW4gdGltZSBkdXJpbmcgdGhlIGxpZmUgb2YgdGhlIGNvbXBvbmVudC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3RzL21ldGFkYXRhL21ldGFkYXRhLnRzIHJlZ2lvbj0nY29tcG9uZW50J31cbiAqL1xuZXhwb3J0IHZhciBDb21wb25lbnQ6IENvbXBvbmVudEZhY3RvcnkgPVxuICAgIDxDb21wb25lbnRGYWN0b3J5Pm1ha2VEZWNvcmF0b3IoQ29tcG9uZW50TWV0YWRhdGEsIChmbjogYW55KSA9PiBmbi5WaWV3ID0gVmlldyk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gRGlyZWN0aXZlTWV0YWRhdGEuXG4vKipcbiAqIERpcmVjdGl2ZXMgYWxsb3cgeW91IHRvIGF0dGFjaCBiZWhhdmlvciB0byBlbGVtZW50cyBpbiB0aGUgRE9NLlxuICpcbiAqIHtAbGluayBEaXJlY3RpdmVNZXRhZGF0YX1zIHdpdGggYW4gZW1iZWRkZWQgdmlldyBhcmUgY2FsbGVkIHtAbGluayBDb21wb25lbnRNZXRhZGF0YX1zLlxuICpcbiAqIEEgZGlyZWN0aXZlIGNvbnNpc3RzIG9mIGEgc2luZ2xlIGRpcmVjdGl2ZSBhbm5vdGF0aW9uIGFuZCBhIGNvbnRyb2xsZXIgY2xhc3MuIFdoZW4gdGhlXG4gKiBkaXJlY3RpdmUncyBgc2VsZWN0b3JgIG1hdGNoZXNcbiAqIGVsZW1lbnRzIGluIHRoZSBET00sIHRoZSBmb2xsb3dpbmcgc3RlcHMgb2NjdXI6XG4gKlxuICogMS4gRm9yIGVhY2ggZGlyZWN0aXZlLCB0aGUgYEVsZW1lbnRJbmplY3RvcmAgYXR0ZW1wdHMgdG8gcmVzb2x2ZSB0aGUgZGlyZWN0aXZlJ3MgY29uc3RydWN0b3JcbiAqIGFyZ3VtZW50cy5cbiAqIDIuIEFuZ3VsYXIgaW5zdGFudGlhdGVzIGRpcmVjdGl2ZXMgZm9yIGVhY2ggbWF0Y2hlZCBlbGVtZW50IHVzaW5nIGBFbGVtZW50SW5qZWN0b3JgIGluIGFcbiAqIGRlcHRoLWZpcnN0IG9yZGVyLFxuICogICAgYXMgZGVjbGFyZWQgaW4gdGhlIEhUTUwuXG4gKlxuICogIyMgVW5kZXJzdGFuZGluZyBIb3cgSW5qZWN0aW9uIFdvcmtzXG4gKlxuICogVGhlcmUgYXJlIHRocmVlIHN0YWdlcyBvZiBpbmplY3Rpb24gcmVzb2x1dGlvbi5cbiAqIC0gKlByZS1leGlzdGluZyBJbmplY3RvcnMqOlxuICogICAtIFRoZSB0ZXJtaW5hbCB7QGxpbmsgSW5qZWN0b3J9IGNhbm5vdCByZXNvbHZlIGRlcGVuZGVuY2llcy4gSXQgZWl0aGVyIHRocm93cyBhbiBlcnJvciBvciwgaWZcbiAqIHRoZSBkZXBlbmRlbmN5IHdhc1xuICogICAgIHNwZWNpZmllZCBhcyBgQE9wdGlvbmFsYCwgcmV0dXJucyBgbnVsbGAuXG4gKiAgIC0gVGhlIHBsYXRmb3JtIGluamVjdG9yIHJlc29sdmVzIGJyb3dzZXIgc2luZ2xldG9uIHJlc291cmNlcywgc3VjaCBhczogY29va2llcywgdGl0bGUsXG4gKiBsb2NhdGlvbiwgYW5kIG90aGVycy5cbiAqIC0gKkNvbXBvbmVudCBJbmplY3RvcnMqOiBFYWNoIGNvbXBvbmVudCBpbnN0YW5jZSBoYXMgaXRzIG93biB7QGxpbmsgSW5qZWN0b3J9LCBhbmQgdGhleSBmb2xsb3dcbiAqIHRoZSBzYW1lIHBhcmVudC1jaGlsZCBoaWVyYXJjaHlcbiAqICAgICBhcyB0aGUgY29tcG9uZW50IGluc3RhbmNlcyBpbiB0aGUgRE9NLlxuICogLSAqRWxlbWVudCBJbmplY3RvcnMqOiBFYWNoIGNvbXBvbmVudCBpbnN0YW5jZSBoYXMgYSBTaGFkb3cgRE9NLiBXaXRoaW4gdGhlIFNoYWRvdyBET00gZWFjaFxuICogZWxlbWVudCBoYXMgYW4gYEVsZW1lbnRJbmplY3RvcmBcbiAqICAgICB3aGljaCBmb2xsb3cgdGhlIHNhbWUgcGFyZW50LWNoaWxkIGhpZXJhcmNoeSBhcyB0aGUgRE9NIGVsZW1lbnRzIHRoZW1zZWx2ZXMuXG4gKlxuICogV2hlbiBhIHRlbXBsYXRlIGlzIGluc3RhbnRpYXRlZCwgaXQgYWxzbyBtdXN0IGluc3RhbnRpYXRlIHRoZSBjb3JyZXNwb25kaW5nIGRpcmVjdGl2ZXMgaW4gYVxuICogZGVwdGgtZmlyc3Qgb3JkZXIuIFRoZVxuICogY3VycmVudCBgRWxlbWVudEluamVjdG9yYCByZXNvbHZlcyB0aGUgY29uc3RydWN0b3IgZGVwZW5kZW5jaWVzIGZvciBlYWNoIGRpcmVjdGl2ZS5cbiAqXG4gKiBBbmd1bGFyIHRoZW4gcmVzb2x2ZXMgZGVwZW5kZW5jaWVzIGFzIGZvbGxvd3MsIGFjY29yZGluZyB0byB0aGUgb3JkZXIgaW4gd2hpY2ggdGhleSBhcHBlYXIgaW4gdGhlXG4gKiB7QGxpbmsgVmlld01ldGFkYXRhfTpcbiAqXG4gKiAxLiBEZXBlbmRlbmNpZXMgb24gdGhlIGN1cnJlbnQgZWxlbWVudFxuICogMi4gRGVwZW5kZW5jaWVzIG9uIGVsZW1lbnQgaW5qZWN0b3JzIGFuZCB0aGVpciBwYXJlbnRzIHVudGlsIGl0IGVuY291bnRlcnMgYSBTaGFkb3cgRE9NIGJvdW5kYXJ5XG4gKiAzLiBEZXBlbmRlbmNpZXMgb24gY29tcG9uZW50IGluamVjdG9ycyBhbmQgdGhlaXIgcGFyZW50cyB1bnRpbCBpdCBlbmNvdW50ZXJzIHRoZSByb290IGNvbXBvbmVudFxuICogNC4gRGVwZW5kZW5jaWVzIG9uIHByZS1leGlzdGluZyBpbmplY3RvcnNcbiAqXG4gKlxuICogVGhlIGBFbGVtZW50SW5qZWN0b3JgIGNhbiBpbmplY3Qgb3RoZXIgZGlyZWN0aXZlcywgZWxlbWVudC1zcGVjaWZpYyBzcGVjaWFsIG9iamVjdHMsIG9yIGl0IGNhblxuICogZGVsZWdhdGUgdG8gdGhlIHBhcmVudFxuICogaW5qZWN0b3IuXG4gKlxuICogVG8gaW5qZWN0IG90aGVyIGRpcmVjdGl2ZXMsIGRlY2xhcmUgdGhlIGNvbnN0cnVjdG9yIHBhcmFtZXRlciBhczpcbiAqIC0gYGRpcmVjdGl2ZTpEaXJlY3RpdmVUeXBlYDogYSBkaXJlY3RpdmUgb24gdGhlIGN1cnJlbnQgZWxlbWVudCBvbmx5XG4gKiAtIGBASG9zdCgpIGRpcmVjdGl2ZTpEaXJlY3RpdmVUeXBlYDogYW55IGRpcmVjdGl2ZSB0aGF0IG1hdGNoZXMgdGhlIHR5cGUgYmV0d2VlbiB0aGUgY3VycmVudFxuICogZWxlbWVudCBhbmQgdGhlXG4gKiAgICBTaGFkb3cgRE9NIHJvb3QuXG4gKiAtIGBAUXVlcnkoRGlyZWN0aXZlVHlwZSkgcXVlcnk6UXVlcnlMaXN0PERpcmVjdGl2ZVR5cGU+YDogQSBsaXZlIGNvbGxlY3Rpb24gb2YgZGlyZWN0IGNoaWxkXG4gKiBkaXJlY3RpdmVzLlxuICogLSBgQFF1ZXJ5RGVzY2VuZGFudHMoRGlyZWN0aXZlVHlwZSkgcXVlcnk6UXVlcnlMaXN0PERpcmVjdGl2ZVR5cGU+YDogQSBsaXZlIGNvbGxlY3Rpb24gb2YgYW55XG4gKiBjaGlsZCBkaXJlY3RpdmVzLlxuICpcbiAqIFRvIGluamVjdCBlbGVtZW50LXNwZWNpZmljIHNwZWNpYWwgb2JqZWN0cywgZGVjbGFyZSB0aGUgY29uc3RydWN0b3IgcGFyYW1ldGVyIGFzOlxuICogLSBgZWxlbWVudDogRWxlbWVudFJlZmAgdG8gb2J0YWluIGEgcmVmZXJlbmNlIHRvIGxvZ2ljYWwgZWxlbWVudCBpbiB0aGUgdmlldy5cbiAqIC0gYHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWZgIHRvIGNvbnRyb2wgY2hpbGQgdGVtcGxhdGUgaW5zdGFudGlhdGlvbiwgZm9yXG4gKiB7QGxpbmsgRGlyZWN0aXZlTWV0YWRhdGF9IGRpcmVjdGl2ZXMgb25seVxuICogLSBgYmluZGluZ1Byb3BhZ2F0aW9uOiBCaW5kaW5nUHJvcGFnYXRpb25gIHRvIGNvbnRyb2wgY2hhbmdlIGRldGVjdGlvbiBpbiBhIG1vcmUgZ3JhbnVsYXIgd2F5LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGRlbW9uc3RyYXRlcyBob3cgZGVwZW5kZW5jeSBpbmplY3Rpb24gcmVzb2x2ZXMgY29uc3RydWN0b3IgYXJndW1lbnRzIGluXG4gKiBwcmFjdGljZS5cbiAqXG4gKlxuICogQXNzdW1lIHRoaXMgSFRNTCB0ZW1wbGF0ZTpcbiAqXG4gKiBgYGBcbiAqIDxkaXYgZGVwZW5kZW5jeT1cIjFcIj5cbiAqICAgPGRpdiBkZXBlbmRlbmN5PVwiMlwiPlxuICogICAgIDxkaXYgZGVwZW5kZW5jeT1cIjNcIiBteS1kaXJlY3RpdmU+XG4gKiAgICAgICA8ZGl2IGRlcGVuZGVuY3k9XCI0XCI+XG4gKiAgICAgICAgIDxkaXYgZGVwZW5kZW5jeT1cIjVcIj48L2Rpdj5cbiAqICAgICAgIDwvZGl2PlxuICogICAgICAgPGRpdiBkZXBlbmRlbmN5PVwiNlwiPjwvZGl2PlxuICogICAgIDwvZGl2PlxuICogICA8L2Rpdj5cbiAqIDwvZGl2PlxuICogYGBgXG4gKlxuICogV2l0aCB0aGUgZm9sbG93aW5nIGBkZXBlbmRlbmN5YCBkZWNvcmF0b3IgYW5kIGBTb21lU2VydmljZWAgaW5qZWN0YWJsZSBjbGFzcy5cbiAqXG4gKiBgYGBcbiAqIEBJbmplY3RhYmxlKClcbiAqIGNsYXNzIFNvbWVTZXJ2aWNlIHtcbiAqIH1cbiAqXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdbZGVwZW5kZW5jeV0nLFxuICogICBpbnB1dHM6IFtcbiAqICAgICAnaWQ6IGRlcGVuZGVuY3knXG4gKiAgIF1cbiAqIH0pXG4gKiBjbGFzcyBEZXBlbmRlbmN5IHtcbiAqICAgaWQ6c3RyaW5nO1xuICogfVxuICogYGBgXG4gKlxuICogTGV0J3Mgc3RlcCB0aHJvdWdoIHRoZSBkaWZmZXJlbnQgd2F5cyBpbiB3aGljaCBgTXlEaXJlY3RpdmVgIGNvdWxkIGJlIGRlY2xhcmVkLi4uXG4gKlxuICpcbiAqICMjIyBObyBpbmplY3Rpb25cbiAqXG4gKiBIZXJlIHRoZSBjb25zdHJ1Y3RvciBpcyBkZWNsYXJlZCB3aXRoIG5vIGFyZ3VtZW50cywgdGhlcmVmb3JlIG5vdGhpbmcgaXMgaW5qZWN0ZWQgaW50b1xuICogYE15RGlyZWN0aXZlYC5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggbm8gZGVwZW5kZW5jaWVzLlxuICpcbiAqXG4gKiAjIyMgQ29tcG9uZW50LWxldmVsIGluamVjdGlvblxuICpcbiAqIERpcmVjdGl2ZXMgY2FuIGluamVjdCBhbnkgaW5qZWN0YWJsZSBpbnN0YW5jZSBmcm9tIHRoZSBjbG9zZXN0IGNvbXBvbmVudCBpbmplY3RvciBvciBhbnkgb2YgaXRzXG4gKiBwYXJlbnRzLlxuICpcbiAqIEhlcmUsIHRoZSBjb25zdHJ1Y3RvciBkZWNsYXJlcyBhIHBhcmFtZXRlciwgYHNvbWVTZXJ2aWNlYCwgYW5kIGluamVjdHMgdGhlIGBTb21lU2VydmljZWAgdHlwZVxuICogZnJvbSB0aGUgcGFyZW50XG4gKiBjb21wb25lbnQncyBpbmplY3Rvci5cbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKHNvbWVTZXJ2aWNlOiBTb21lU2VydmljZSkge1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBhIGRlcGVuZGVuY3kgb24gYFNvbWVTZXJ2aWNlYC5cbiAqXG4gKlxuICogIyMjIEluamVjdGluZyBhIGRpcmVjdGl2ZSBmcm9tIHRoZSBjdXJyZW50IGVsZW1lbnRcbiAqXG4gKiBEaXJlY3RpdmVzIGNhbiBpbmplY3Qgb3RoZXIgZGlyZWN0aXZlcyBkZWNsYXJlZCBvbiB0aGUgY3VycmVudCBlbGVtZW50LlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKGRlcGVuZGVuY3k6IERlcGVuZGVuY3kpIHtcbiAqICAgICBleHBlY3QoZGVwZW5kZW5jeS5pZCkudG9FcXVhbCgzKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBgRGVwZW5kZW5jeWAgZGVjbGFyZWQgYXQgdGhlIHNhbWUgZWxlbWVudCwgaW4gdGhpcyBjYXNlXG4gKiBgZGVwZW5kZW5jeT1cIjNcImAuXG4gKlxuICogIyMjIEluamVjdGluZyBhIGRpcmVjdGl2ZSBmcm9tIGFueSBhbmNlc3RvciBlbGVtZW50c1xuICpcbiAqIERpcmVjdGl2ZXMgY2FuIGluamVjdCBvdGhlciBkaXJlY3RpdmVzIGRlY2xhcmVkIG9uIGFueSBhbmNlc3RvciBlbGVtZW50IChpbiB0aGUgY3VycmVudCBTaGFkb3dcbiAqIERPTSksIGkuZS4gb24gdGhlIGN1cnJlbnQgZWxlbWVudCwgdGhlXG4gKiBwYXJlbnQgZWxlbWVudCwgb3IgaXRzIHBhcmVudHMuXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihASG9zdCgpIGRlcGVuZGVuY3k6IERlcGVuZGVuY3kpIHtcbiAqICAgICBleHBlY3QoZGVwZW5kZW5jeS5pZCkudG9FcXVhbCgyKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogYEBIb3N0YCBjaGVja3MgdGhlIGN1cnJlbnQgZWxlbWVudCwgdGhlIHBhcmVudCwgYXMgd2VsbCBhcyBpdHMgcGFyZW50cyByZWN1cnNpdmVseS4gSWZcbiAqIGBkZXBlbmRlbmN5PVwiMlwiYCBkaWRuJ3RcbiAqIGV4aXN0IG9uIHRoZSBkaXJlY3QgcGFyZW50LCB0aGlzIGluamVjdGlvbiB3b3VsZFxuICogaGF2ZSByZXR1cm5lZFxuICogYGRlcGVuZGVuY3k9XCIxXCJgLlxuICpcbiAqXG4gKiAjIyMgSW5qZWN0aW5nIGEgbGl2ZSBjb2xsZWN0aW9uIG9mIGRpcmVjdCBjaGlsZCBkaXJlY3RpdmVzXG4gKlxuICpcbiAqIEEgZGlyZWN0aXZlIGNhbiBhbHNvIHF1ZXJ5IGZvciBvdGhlciBjaGlsZCBkaXJlY3RpdmVzLiBTaW5jZSBwYXJlbnQgZGlyZWN0aXZlcyBhcmUgaW5zdGFudGlhdGVkXG4gKiBiZWZvcmUgY2hpbGQgZGlyZWN0aXZlcywgYSBkaXJlY3RpdmUgY2FuJ3Qgc2ltcGx5IGluamVjdCB0aGUgbGlzdCBvZiBjaGlsZCBkaXJlY3RpdmVzLiBJbnN0ZWFkLFxuICogdGhlIGRpcmVjdGl2ZSBpbmplY3RzIGEge0BsaW5rIFF1ZXJ5TGlzdH0sIHdoaWNoIHVwZGF0ZXMgaXRzIGNvbnRlbnRzIGFzIGNoaWxkcmVuIGFyZSBhZGRlZCxcbiAqIHJlbW92ZWQsIG9yIG1vdmVkIGJ5IGEgZGlyZWN0aXZlIHRoYXQgdXNlcyBhIHtAbGluayBWaWV3Q29udGFpbmVyUmVmfSBzdWNoIGFzIGEgYG5nRm9yYCwgYW5cbiAqIGBuZ0lmYCwgb3IgYW4gYG5nU3dpdGNoYC5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoRGVwZW5kZW5jeSkgZGVwZW5kZW5jaWVzOlF1ZXJ5TGlzdDxEZXBlbmRlbmN5Pikge1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBhIHtAbGluayBRdWVyeUxpc3R9IHdoaWNoIGNvbnRhaW5zIGBEZXBlbmRlbmN5YCA0IGFuZFxuICogNi4gSGVyZSwgYERlcGVuZGVuY3lgIDUgd291bGQgbm90IGJlIGluY2x1ZGVkLCBiZWNhdXNlIGl0IGlzIG5vdCBhIGRpcmVjdCBjaGlsZC5cbiAqXG4gKiAjIyMgSW5qZWN0aW5nIGEgbGl2ZSBjb2xsZWN0aW9uIG9mIGRlc2NlbmRhbnQgZGlyZWN0aXZlc1xuICpcbiAqIEJ5IHBhc3NpbmcgdGhlIGRlc2NlbmRhbnQgZmxhZyB0byBgQFF1ZXJ5YCBhYm92ZSwgd2UgY2FuIGluY2x1ZGUgdGhlIGNoaWxkcmVuIG9mIHRoZSBjaGlsZFxuICogZWxlbWVudHMuXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KERlcGVuZGVuY3ksIHtkZXNjZW5kYW50czogdHJ1ZX0pIGRlcGVuZGVuY2llczpRdWVyeUxpc3Q8RGVwZW5kZW5jeT4pIHtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggYSBRdWVyeSB3aGljaCB3b3VsZCBjb250YWluIGBEZXBlbmRlbmN5YCA0LCA1IGFuZCA2LlxuICpcbiAqICMjIyBPcHRpb25hbCBpbmplY3Rpb25cbiAqXG4gKiBUaGUgbm9ybWFsIGJlaGF2aW9yIG9mIGRpcmVjdGl2ZXMgaXMgdG8gcmV0dXJuIGFuIGVycm9yIHdoZW4gYSBzcGVjaWZpZWQgZGVwZW5kZW5jeSBjYW5ub3QgYmVcbiAqIHJlc29sdmVkLiBJZiB5b3VcbiAqIHdvdWxkIGxpa2UgdG8gaW5qZWN0IGBudWxsYCBvbiB1bnJlc29sdmVkIGRlcGVuZGVuY3kgaW5zdGVhZCwgeW91IGNhbiBhbm5vdGF0ZSB0aGF0IGRlcGVuZGVuY3lcbiAqIHdpdGggYEBPcHRpb25hbCgpYC5cbiAqIFRoaXMgZXhwbGljaXRseSBwZXJtaXRzIHRoZSBhdXRob3Igb2YgYSB0ZW1wbGF0ZSB0byB0cmVhdCBzb21lIG9mIHRoZSBzdXJyb3VuZGluZyBkaXJlY3RpdmVzIGFzXG4gKiBvcHRpb25hbC5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihAT3B0aW9uYWwoKSBkZXBlbmRlbmN5OkRlcGVuZGVuY3kpIHtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggYSBgRGVwZW5kZW5jeWAgZGlyZWN0aXZlIGZvdW5kIG9uIHRoZSBjdXJyZW50IGVsZW1lbnQuXG4gKiBJZiBub25lIGNhbiBiZVxuICogZm91bmQsIHRoZSBpbmplY3RvciBzdXBwbGllcyBgbnVsbGAgaW5zdGVhZCBvZiB0aHJvd2luZyBhbiBlcnJvci5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIEhlcmUgd2UgdXNlIGEgZGVjb3JhdG9yIGRpcmVjdGl2ZSB0byBzaW1wbHkgZGVmaW5lIGJhc2ljIHRvb2wtdGlwIGJlaGF2aW9yLlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnW3Rvb2x0aXBdJyxcbiAqICAgaW5wdXRzOiBbXG4gKiAgICAgJ3RleHQ6IHRvb2x0aXAnXG4gKiAgIF0sXG4gKiAgIGhvc3Q6IHtcbiAqICAgICAnKG1vdXNlZW50ZXIpJzogJ29uTW91c2VFbnRlcigpJyxcbiAqICAgICAnKG1vdXNlbGVhdmUpJzogJ29uTW91c2VMZWF2ZSgpJ1xuICogICB9XG4gKiB9KVxuICogY2xhc3MgVG9vbHRpcHtcbiAqICAgdGV4dDpzdHJpbmc7XG4gKiAgIG92ZXJsYXk6T3ZlcmxheTsgLy8gTk9UIFlFVCBJTVBMRU1FTlRFRFxuICogICBvdmVybGF5TWFuYWdlcjpPdmVybGF5TWFuYWdlcjsgLy8gTk9UIFlFVCBJTVBMRU1FTlRFRFxuICpcbiAqICAgY29uc3RydWN0b3Iob3ZlcmxheU1hbmFnZXI6T3ZlcmxheU1hbmFnZXIpIHtcbiAqICAgICB0aGlzLm92ZXJsYXkgPSBvdmVybGF5O1xuICogICB9XG4gKlxuICogICBvbk1vdXNlRW50ZXIoKSB7XG4gKiAgICAgLy8gZXhhY3Qgc2lnbmF0dXJlIHRvIGJlIGRldGVybWluZWRcbiAqICAgICB0aGlzLm92ZXJsYXkgPSB0aGlzLm92ZXJsYXlNYW5hZ2VyLm9wZW4odGV4dCwgLi4uKTtcbiAqICAgfVxuICpcbiAqICAgb25Nb3VzZUxlYXZlKCkge1xuICogICAgIHRoaXMub3ZlcmxheS5jbG9zZSgpO1xuICogICAgIHRoaXMub3ZlcmxheSA9IG51bGw7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICogSW4gb3VyIEhUTUwgdGVtcGxhdGUsIHdlIGNhbiB0aGVuIGFkZCB0aGlzIGJlaGF2aW9yIHRvIGEgYDxkaXY+YCBvciBhbnkgb3RoZXIgZWxlbWVudCB3aXRoIHRoZVxuICogYHRvb2x0aXBgIHNlbGVjdG9yLFxuICogbGlrZSBzbzpcbiAqXG4gKiBgYGBcbiAqIDxkaXYgdG9vbHRpcD1cInNvbWUgdGV4dCBoZXJlXCI+PC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBEaXJlY3RpdmVzIGNhbiBhbHNvIGNvbnRyb2wgdGhlIGluc3RhbnRpYXRpb24sIGRlc3RydWN0aW9uLCBhbmQgcG9zaXRpb25pbmcgb2YgaW5saW5lIHRlbXBsYXRlXG4gKiBlbGVtZW50czpcbiAqXG4gKiBBIGRpcmVjdGl2ZSB1c2VzIGEge0BsaW5rIFZpZXdDb250YWluZXJSZWZ9IHRvIGluc3RhbnRpYXRlLCBpbnNlcnQsIG1vdmUsIGFuZCBkZXN0cm95IHZpZXdzIGF0XG4gKiBydW50aW1lLlxuICogVGhlIHtAbGluayBWaWV3Q29udGFpbmVyUmVmfSBpcyBjcmVhdGVkIGFzIGEgcmVzdWx0IG9mIGA8dGVtcGxhdGU+YCBlbGVtZW50LCBhbmQgcmVwcmVzZW50cyBhXG4gKiBsb2NhdGlvbiBpbiB0aGUgY3VycmVudCB2aWV3XG4gKiB3aGVyZSB0aGVzZSBhY3Rpb25zIGFyZSBwZXJmb3JtZWQuXG4gKlxuICogVmlld3MgYXJlIGFsd2F5cyBjcmVhdGVkIGFzIGNoaWxkcmVuIG9mIHRoZSBjdXJyZW50IHtAbGluayBWaWV3TWV0YWRhdGF9LCBhbmQgYXMgc2libGluZ3Mgb2YgdGhlXG4gKiBgPHRlbXBsYXRlPmAgZWxlbWVudC4gVGh1cyBhXG4gKiBkaXJlY3RpdmUgaW4gYSBjaGlsZCB2aWV3IGNhbm5vdCBpbmplY3QgdGhlIGRpcmVjdGl2ZSB0aGF0IGNyZWF0ZWQgaXQuXG4gKlxuICogU2luY2UgZGlyZWN0aXZlcyB0aGF0IGNyZWF0ZSB2aWV3cyB2aWEgVmlld0NvbnRhaW5lcnMgYXJlIGNvbW1vbiBpbiBBbmd1bGFyLCBhbmQgdXNpbmcgdGhlIGZ1bGxcbiAqIGA8dGVtcGxhdGU+YCBlbGVtZW50IHN5bnRheCBpcyB3b3JkeSwgQW5ndWxhclxuICogYWxzbyBzdXBwb3J0cyBhIHNob3J0aGFuZCBub3RhdGlvbjogYDxsaSAqZm9vPVwiYmFyXCI+YCBhbmQgYDxsaSB0ZW1wbGF0ZT1cImZvbzogYmFyXCI+YCBhcmVcbiAqIGVxdWl2YWxlbnQuXG4gKlxuICogVGh1cyxcbiAqXG4gKiBgYGBcbiAqIDx1bD5cbiAqICAgPGxpICpmb289XCJiYXJcIiB0aXRsZT1cInRleHRcIj48L2xpPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIEV4cGFuZHMgaW4gdXNlIHRvOlxuICpcbiAqIGBgYFxuICogPHVsPlxuICogICA8dGVtcGxhdGUgW2Zvb109XCJiYXJcIj5cbiAqICAgICA8bGkgdGl0bGU9XCJ0ZXh0XCI+PC9saT5cbiAqICAgPC90ZW1wbGF0ZT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBOb3RpY2UgdGhhdCBhbHRob3VnaCB0aGUgc2hvcnRoYW5kIHBsYWNlcyBgKmZvbz1cImJhclwiYCB3aXRoaW4gdGhlIGA8bGk+YCBlbGVtZW50LCB0aGUgYmluZGluZyBmb3JcbiAqIHRoZSBkaXJlY3RpdmVcbiAqIGNvbnRyb2xsZXIgaXMgY29ycmVjdGx5IGluc3RhbnRpYXRlZCBvbiB0aGUgYDx0ZW1wbGF0ZT5gIGVsZW1lbnQgcmF0aGVyIHRoYW4gdGhlIGA8bGk+YCBlbGVtZW50LlxuICpcbiAqICMjIExpZmVjeWNsZSBob29rc1xuICpcbiAqIFdoZW4gdGhlIGRpcmVjdGl2ZSBjbGFzcyBpbXBsZW1lbnRzIHNvbWUge0BsaW5rIC4uLy4uL2d1aWRlL2xpZmVjeWNsZS1ob29rcy5odG1sfSB0aGUgY2FsbGJhY2tzXG4gKiBhcmUgY2FsbGVkIGJ5IHRoZSBjaGFuZ2UgZGV0ZWN0aW9uIGF0IGRlZmluZWQgcG9pbnRzIGluIHRpbWUgZHVyaW5nIHRoZSBsaWZlIG9mIHRoZSBkaXJlY3RpdmUuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBMZXQncyBzdXBwb3NlIHdlIHdhbnQgdG8gaW1wbGVtZW50IHRoZSBgdW5sZXNzYCBiZWhhdmlvciwgdG8gY29uZGl0aW9uYWxseSBpbmNsdWRlIGEgdGVtcGxhdGUuXG4gKlxuICogSGVyZSBpcyBhIHNpbXBsZSBkaXJlY3RpdmUgdGhhdCB0cmlnZ2VycyBvbiBhbiBgdW5sZXNzYCBzZWxlY3RvcjpcbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ1t1bmxlc3NdJyxcbiAqICAgaW5wdXRzOiBbJ3VubGVzcyddXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIFVubGVzcyB7XG4gKiAgIHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWY7XG4gKiAgIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjtcbiAqICAgcHJldkNvbmRpdGlvbjogYm9vbGVhbjtcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZikge1xuICogICAgIHRoaXMudmlld0NvbnRhaW5lciA9IHZpZXdDb250YWluZXI7XG4gKiAgICAgdGhpcy50ZW1wbGF0ZVJlZiA9IHRlbXBsYXRlUmVmO1xuICogICAgIHRoaXMucHJldkNvbmRpdGlvbiA9IG51bGw7XG4gKiAgIH1cbiAqXG4gKiAgIHNldCB1bmxlc3MobmV3Q29uZGl0aW9uKSB7XG4gKiAgICAgaWYgKG5ld0NvbmRpdGlvbiAmJiAoaXNCbGFuayh0aGlzLnByZXZDb25kaXRpb24pIHx8ICF0aGlzLnByZXZDb25kaXRpb24pKSB7XG4gKiAgICAgICB0aGlzLnByZXZDb25kaXRpb24gPSB0cnVlO1xuICogICAgICAgdGhpcy52aWV3Q29udGFpbmVyLmNsZWFyKCk7XG4gKiAgICAgfSBlbHNlIGlmICghbmV3Q29uZGl0aW9uICYmIChpc0JsYW5rKHRoaXMucHJldkNvbmRpdGlvbikgfHwgdGhpcy5wcmV2Q29uZGl0aW9uKSkge1xuICogICAgICAgdGhpcy5wcmV2Q29uZGl0aW9uID0gZmFsc2U7XG4gKiAgICAgICB0aGlzLnZpZXdDb250YWluZXIuY3JlYXRlKHRoaXMudGVtcGxhdGVSZWYpO1xuICogICAgIH1cbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogV2UgY2FuIHRoZW4gdXNlIHRoaXMgYHVubGVzc2Agc2VsZWN0b3IgaW4gYSB0ZW1wbGF0ZTpcbiAqIGBgYFxuICogPHVsPlxuICogICA8bGkgKnVubGVzcz1cImV4cHJcIj48L2xpPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIE9uY2UgdGhlIGRpcmVjdGl2ZSBpbnN0YW50aWF0ZXMgdGhlIGNoaWxkIHZpZXcsIHRoZSBzaG9ydGhhbmQgbm90YXRpb24gZm9yIHRoZSB0ZW1wbGF0ZSBleHBhbmRzXG4gKiBhbmQgdGhlIHJlc3VsdCBpczpcbiAqXG4gKiBgYGBcbiAqIDx1bD5cbiAqICAgPHRlbXBsYXRlIFt1bmxlc3NdPVwiZXhwXCI+XG4gKiAgICAgPGxpPjwvbGk+XG4gKiAgIDwvdGVtcGxhdGU+XG4gKiAgIDxsaT48L2xpPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIE5vdGUgYWxzbyB0aGF0IGFsdGhvdWdoIHRoZSBgPGxpPjwvbGk+YCB0ZW1wbGF0ZSBzdGlsbCBleGlzdHMgaW5zaWRlIHRoZSBgPHRlbXBsYXRlPjwvdGVtcGxhdGU+YCxcbiAqIHRoZSBpbnN0YW50aWF0ZWRcbiAqIHZpZXcgb2NjdXJzIG9uIHRoZSBzZWNvbmQgYDxsaT48L2xpPmAgd2hpY2ggaXMgYSBzaWJsaW5nIHRvIHRoZSBgPHRlbXBsYXRlPmAgZWxlbWVudC5cbiAqL1xuZXhwb3J0IHZhciBEaXJlY3RpdmU6IERpcmVjdGl2ZUZhY3RvcnkgPSA8RGlyZWN0aXZlRmFjdG9yeT5tYWtlRGVjb3JhdG9yKERpcmVjdGl2ZU1ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBWaWV3TWV0YWRhdGEuXG4vKipcbiAqIE1ldGFkYXRhIHByb3BlcnRpZXMgYXZhaWxhYmxlIGZvciBjb25maWd1cmluZyBWaWV3cy5cbiAqXG4gKiBFYWNoIEFuZ3VsYXIgY29tcG9uZW50IHJlcXVpcmVzIGEgc2luZ2xlIGBAQ29tcG9uZW50YCBhbmQgYXQgbGVhc3Qgb25lIGBAVmlld2AgYW5ub3RhdGlvbi4gVGhlXG4gKiBgQFZpZXdgIGFubm90YXRpb24gc3BlY2lmaWVzIHRoZSBIVE1MIHRlbXBsYXRlIHRvIHVzZSwgYW5kIGxpc3RzIHRoZSBkaXJlY3RpdmVzIHRoYXQgYXJlIGFjdGl2ZVxuICogd2l0aGluIHRoZSB0ZW1wbGF0ZS5cbiAqXG4gKiBXaGVuIGEgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCwgdGhlIHRlbXBsYXRlIGlzIGxvYWRlZCBpbnRvIHRoZSBjb21wb25lbnQncyBzaGFkb3cgcm9vdCwgYW5kXG4gKiB0aGUgZXhwcmVzc2lvbnMgYW5kIHN0YXRlbWVudHMgaW4gdGhlIHRlbXBsYXRlIGFyZSBldmFsdWF0ZWQgYWdhaW5zdCB0aGUgY29tcG9uZW50LlxuICpcbiAqIEZvciBkZXRhaWxzIG9uIHRoZSBgQENvbXBvbmVudGAgYW5ub3RhdGlvbiwgc2VlIHtAbGluayBDb21wb25lbnRNZXRhZGF0YX0uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2dyZWV0JyxcbiAqICAgdGVtcGxhdGU6ICdIZWxsbyB7e25hbWV9fSEnLFxuICogICBkaXJlY3RpdmVzOiBbR3JlZXRVc2VyLCBCb2xkXVxuICogfSlcbiAqIGNsYXNzIEdyZWV0IHtcbiAqICAgbmFtZTogc3RyaW5nO1xuICpcbiAqICAgY29uc3RydWN0b3IoKSB7XG4gKiAgICAgdGhpcy5uYW1lID0gJ1dvcmxkJztcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbnZhciBWaWV3OiBWaWV3RmFjdG9yeSA9IDxWaWV3RmFjdG9yeT5tYWtlRGVjb3JhdG9yKFZpZXdNZXRhZGF0YSwgKGZuOiBhbnkpID0+IGZuLlZpZXcgPSBWaWV3KTtcblxuLyoqXG4gKiBTcGVjaWZpZXMgdGhhdCBhIGNvbnN0YW50IGF0dHJpYnV0ZSB2YWx1ZSBzaG91bGQgYmUgaW5qZWN0ZWQuXG4gKlxuICogVGhlIGRpcmVjdGl2ZSBjYW4gaW5qZWN0IGNvbnN0YW50IHN0cmluZyBsaXRlcmFscyBvZiBob3N0IGVsZW1lbnQgYXR0cmlidXRlcy5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFN1cHBvc2Ugd2UgaGF2ZSBhbiBgPGlucHV0PmAgZWxlbWVudCBhbmQgd2FudCB0byBrbm93IGl0cyBgdHlwZWAuXG4gKlxuICogYGBgaHRtbFxuICogPGlucHV0IHR5cGU9XCJ0ZXh0XCI+XG4gKiBgYGBcbiAqXG4gKiBBIGRlY29yYXRvciBjYW4gaW5qZWN0IHN0cmluZyBsaXRlcmFsIGB0ZXh0YCBsaWtlIHNvOlxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3RzL21ldGFkYXRhL21ldGFkYXRhLnRzIHJlZ2lvbj0nYXR0cmlidXRlTWV0YWRhdGEnfVxuICovXG5leHBvcnQgdmFyIEF0dHJpYnV0ZTogQXR0cmlidXRlRmFjdG9yeSA9IG1ha2VQYXJhbURlY29yYXRvcihBdHRyaWJ1dGVNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gUXVlcnlNZXRhZGF0YS5cbi8qKlxuICogRGVjbGFyZXMgYW4gaW5qZWN0YWJsZSBwYXJhbWV0ZXIgdG8gYmUgYSBsaXZlIGxpc3Qgb2YgZGlyZWN0aXZlcyBvciB2YXJpYWJsZVxuICogYmluZGluZ3MgZnJvbSB0aGUgY29udGVudCBjaGlsZHJlbiBvZiBhIGRpcmVjdGl2ZS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvbFk5bThITHk3ejA2dkRvVWFTTjI/cD1wcmV2aWV3KSlcbiAqXG4gKiBBc3N1bWUgdGhhdCBgPHRhYnM+YCBjb21wb25lbnQgd291bGQgbGlrZSB0byBnZXQgYSBsaXN0IGl0cyBjaGlsZHJlbiBgPHBhbmU+YFxuICogY29tcG9uZW50cyBhcyBzaG93biBpbiB0aGlzIGV4YW1wbGU6XG4gKlxuICogYGBgaHRtbFxuICogPHRhYnM+XG4gKiAgIDxwYW5lIHRpdGxlPVwiT3ZlcnZpZXdcIj4uLi48L3BhbmU+XG4gKiAgIDxwYW5lICpuZ0Zvcj1cIiNvIG9mIG9iamVjdHNcIiBbdGl0bGVdPVwiby50aXRsZVwiPnt7by50ZXh0fX08L3BhbmU+XG4gKiA8L3RhYnM+XG4gKiBgYGBcbiAqXG4gKiBUaGUgcHJlZmVycmVkIHNvbHV0aW9uIGlzIHRvIHF1ZXJ5IGZvciBgUGFuZWAgZGlyZWN0aXZlcyB1c2luZyB0aGlzIGRlY29yYXRvci5cbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdwYW5lJyxcbiAqICAgaW5wdXRzOiBbJ3RpdGxlJ11cbiAqIH0pXG4gKiBjbGFzcyBQYW5lIHtcbiAqICAgdGl0bGU6c3RyaW5nO1xuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogIHNlbGVjdG9yOiAndGFicycsXG4gKiAgdGVtcGxhdGU6IGBcbiAqICAgIDx1bD5cbiAqICAgICAgPGxpICpuZ0Zvcj1cIiNwYW5lIG9mIHBhbmVzXCI+e3twYW5lLnRpdGxlfX08L2xpPlxuICogICAgPC91bD5cbiAqICAgIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cbiAqICBgXG4gKiB9KVxuICogY2xhc3MgVGFicyB7XG4gKiAgIHBhbmVzOiBRdWVyeUxpc3Q8UGFuZT47XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeShQYW5lKSBwYW5lczpRdWVyeUxpc3Q8UGFuZT4pIHtcbiAqICAgICB0aGlzLnBhbmVzID0gcGFuZXM7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEEgcXVlcnkgY2FuIGxvb2sgZm9yIHZhcmlhYmxlIGJpbmRpbmdzIGJ5IHBhc3NpbmcgaW4gYSBzdHJpbmcgd2l0aCBkZXNpcmVkIGJpbmRpbmcgc3ltYm9sLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9zVDJqMjVjSDFkVVJBeUJSQ0t4MT9wPXByZXZpZXcpKVxuICogYGBgaHRtbFxuICogPHNlZWtlcj5cbiAqICAgPGRpdiAjZmluZG1lPi4uLjwvZGl2PlxuICogPC9zZWVrZXI+XG4gKlxuICogQENvbXBvbmVudCh7IHNlbGVjdG9yOiAnc2Vla2VyJyB9KVxuICogY2xhc3Mgc2Vla2VyIHtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KCdmaW5kbWUnKSBlbExpc3Q6IFF1ZXJ5TGlzdDxFbGVtZW50UmVmPikgey4uLn1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEluIHRoaXMgY2FzZSB0aGUgb2JqZWN0IHRoYXQgaXMgaW5qZWN0ZWQgZGVwZW5kIG9uIHRoZSB0eXBlIG9mIHRoZSB2YXJpYWJsZVxuICogYmluZGluZy4gSXQgY2FuIGJlIGFuIEVsZW1lbnRSZWYsIGEgZGlyZWN0aXZlIG9yIGEgY29tcG9uZW50LlxuICpcbiAqIFBhc3NpbmcgaW4gYSBjb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiB2YXJpYWJsZSBiaW5kaW5ncyB3aWxsIHF1ZXJ5IGZvciBhbGwgb2YgdGhlbS5cbiAqXG4gKiBgYGBodG1sXG4gKiA8c2Vla2VyPlxuICogICA8ZGl2ICNmaW5kTWU+Li4uPC9kaXY+XG4gKiAgIDxkaXYgI2ZpbmRNZVRvbz4uLi48L2Rpdj5cbiAqIDwvc2Vla2VyPlxuICpcbiAqICBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdzZWVrZXInXG4gKiB9KVxuICogY2xhc3MgU2Vla2VyIHtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KCdmaW5kTWUsIGZpbmRNZVRvbycpIGVsTGlzdDogUXVlcnlMaXN0PEVsZW1lbnRSZWY+KSB7Li4ufVxuICogfVxuICogYGBgXG4gKlxuICogQ29uZmlndXJlIHdoZXRoZXIgcXVlcnkgbG9va3MgZm9yIGRpcmVjdCBjaGlsZHJlbiBvciBhbGwgZGVzY2VuZGFudHNcbiAqIG9mIHRoZSBxdWVyeWluZyBlbGVtZW50LCBieSB1c2luZyB0aGUgYGRlc2NlbmRhbnRzYCBwYXJhbWV0ZXIuXG4gKiBJdCBpcyBzZXQgdG8gYGZhbHNlYCBieSBkZWZhdWx0LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC93dEdlQjk3N2J2N3F2QTVGVFlsOT9wPXByZXZpZXcpKVxuICogYGBgaHRtbFxuICogPGNvbnRhaW5lciAjZmlyc3Q+XG4gKiAgIDxpdGVtPmE8L2l0ZW0+XG4gKiAgIDxpdGVtPmI8L2l0ZW0+XG4gKiAgIDxjb250YWluZXIgI3NlY29uZD5cbiAqICAgICA8aXRlbT5jPC9pdGVtPlxuICogICA8L2NvbnRhaW5lcj5cbiAqIDwvY29udGFpbmVyPlxuICogYGBgXG4gKlxuICogV2hlbiBxdWVyeWluZyBmb3IgaXRlbXMsIHRoZSBmaXJzdCBjb250YWluZXIgd2lsbCBzZWUgb25seSBgYWAgYW5kIGBiYCBieSBkZWZhdWx0LFxuICogYnV0IHdpdGggYFF1ZXJ5KFRleHREaXJlY3RpdmUsIHtkZXNjZW5kYW50czogdHJ1ZX0pYCBpdCB3aWxsIHNlZSBgY2AgdG9vLlxuICpcbiAqIFRoZSBxdWVyaWVkIGRpcmVjdGl2ZXMgYXJlIGtlcHQgaW4gYSBkZXB0aC1maXJzdCBwcmUtb3JkZXIgd2l0aCByZXNwZWN0IHRvIHRoZWlyXG4gKiBwb3NpdGlvbnMgaW4gdGhlIERPTS5cbiAqXG4gKiBRdWVyeSBkb2VzIG5vdCBsb29rIGRlZXAgaW50byBhbnkgc3ViY29tcG9uZW50IHZpZXdzLlxuICpcbiAqIFF1ZXJ5IGlzIHVwZGF0ZWQgYXMgcGFydCBvZiB0aGUgY2hhbmdlLWRldGVjdGlvbiBjeWNsZS4gU2luY2UgY2hhbmdlIGRldGVjdGlvblxuICogaGFwcGVucyBhZnRlciBjb25zdHJ1Y3Rpb24gb2YgYSBkaXJlY3RpdmUsIFF1ZXJ5TGlzdCB3aWxsIGFsd2F5cyBiZSBlbXB0eSB3aGVuIG9ic2VydmVkIGluIHRoZVxuICogY29uc3RydWN0b3IuXG4gKlxuICogVGhlIGluamVjdGVkIG9iamVjdCBpcyBhbiB1bm1vZGlmaWFibGUgbGl2ZSBsaXN0LlxuICogU2VlIHtAbGluayBRdWVyeUxpc3R9IGZvciBtb3JlIGRldGFpbHMuXG4gKi9cbmV4cG9ydCB2YXIgUXVlcnk6IFF1ZXJ5RmFjdG9yeSA9IG1ha2VQYXJhbURlY29yYXRvcihRdWVyeU1ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBDb250ZW50Q2hpbGRyZW5NZXRhZGF0YS5cbi8qKlxuICogQ29uZmlndXJlcyBhIGNvbnRlbnQgcXVlcnkuXG4gKlxuICogQ29udGVudCBxdWVyaWVzIGFyZSBzZXQgYmVmb3JlIHRoZSBgbmdBZnRlckNvbnRlbnRJbml0YCBjYWxsYmFjayBpcyBjYWxsZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ3NvbWVEaXInXG4gKiB9KVxuICogY2xhc3MgU29tZURpciB7XG4gKiAgIEBDb250ZW50Q2hpbGRyZW4oQ2hpbGREaXJlY3RpdmUpIGNvbnRlbnRDaGlsZHJlbjogUXVlcnlMaXN0PENoaWxkRGlyZWN0aXZlPjtcbiAqXG4gKiAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAqICAgICAvLyBjb250ZW50Q2hpbGRyZW4gaXMgc2V0XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgdmFyIENvbnRlbnRDaGlsZHJlbjogQ29udGVudENoaWxkcmVuRmFjdG9yeSA9IG1ha2VQcm9wRGVjb3JhdG9yKENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBDb250ZW50Q2hpbGRNZXRhZGF0YS5cbi8qKlxuICogQ29uZmlndXJlcyBhIGNvbnRlbnQgcXVlcnkuXG4gKlxuICogQ29udGVudCBxdWVyaWVzIGFyZSBzZXQgYmVmb3JlIHRoZSBgbmdBZnRlckNvbnRlbnRJbml0YCBjYWxsYmFjayBpcyBjYWxsZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ3NvbWVEaXInXG4gKiB9KVxuICogY2xhc3MgU29tZURpciB7XG4gKiAgIEBDb250ZW50Q2hpbGQoQ2hpbGREaXJlY3RpdmUpIGNvbnRlbnRDaGlsZDtcbiAqXG4gKiAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAqICAgICAvLyBjb250ZW50Q2hpbGQgaXMgc2V0XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgdmFyIENvbnRlbnRDaGlsZDogQ29udGVudENoaWxkRmFjdG9yeSA9IG1ha2VQcm9wRGVjb3JhdG9yKENvbnRlbnRDaGlsZE1ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBWaWV3Q2hpbGRyZW5NZXRhZGF0YS5cbi8qKlxuICogRGVjbGFyZXMgYSBsaXN0IG9mIGNoaWxkIGVsZW1lbnQgcmVmZXJlbmNlcy5cbiAqXG4gKiBBbmd1bGFyIGF1dG9tYXRpY2FsbHkgdXBkYXRlcyB0aGUgbGlzdCB3aGVuIHRoZSBET00gaXMgdXBkYXRlZC5cbiAqXG4gKiBgVmlld0NoaWxkcmVuYCB0YWtlcyBhIGFyZ3VtZW50IHRvIHNlbGVjdCBlbGVtZW50cy5cbiAqXG4gKiAtIElmIHRoZSBhcmd1bWVudCBpcyBhIHR5cGUsIGRpcmVjdGl2ZXMgb3IgY29tcG9uZW50cyB3aXRoIHRoZSB0eXBlIHdpbGwgYmUgYm91bmQuXG4gKlxuICogLSBJZiB0aGUgYXJndW1lbnQgaXMgYSBzdHJpbmcsIHRoZSBzdHJpbmcgaXMgaW50ZXJwcmV0ZWQgYXMgYSBsaXN0IG9mIGNvbW1hLXNlcGFyYXRlZCBzZWxlY3RvcnMuXG4gKiBGb3IgZWFjaCBzZWxlY3RvciwgYW4gZWxlbWVudCBjb250YWluaW5nIHRoZSBtYXRjaGluZyB0ZW1wbGF0ZSB2YXJpYWJsZSAoZS5nLiBgI2NoaWxkYCkgd2lsbCBiZVxuICogYm91bmQuXG4gKlxuICogVmlldyBjaGlsZHJlbiBhcmUgc2V0IGJlZm9yZSB0aGUgYG5nQWZ0ZXJWaWV3SW5pdGAgY2FsbGJhY2sgaXMgY2FsbGVkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogV2l0aCB0eXBlIHNlbGVjdG9yOlxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnY2hpbGQtY21wJyxcbiAqICAgdGVtcGxhdGU6ICc8cD5jaGlsZDwvcD4nXG4gKiB9KVxuICogY2xhc3MgQ2hpbGRDbXAge1xuICogICBkb1NvbWV0aGluZygpIHt9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnc29tZS1jbXAnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxjaGlsZC1jbXA+PC9jaGlsZC1jbXA+XG4gKiAgICAgPGNoaWxkLWNtcD48L2NoaWxkLWNtcD5cbiAqICAgICA8Y2hpbGQtY21wPjwvY2hpbGQtY21wPlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbQ2hpbGRDbXBdXG4gKiB9KVxuICogY2xhc3MgU29tZUNtcCB7XG4gKiAgIEBWaWV3Q2hpbGRyZW4oQ2hpbGRDbXApIGNoaWxkcmVuOlF1ZXJ5TGlzdDxDaGlsZENtcD47XG4gKlxuICogICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gKiAgICAgLy8gY2hpbGRyZW4gYXJlIHNldFxuICogICAgIHRoaXMuY2hpbGRyZW4udG9BcnJheSgpLmZvckVhY2goKGNoaWxkKT0+Y2hpbGQuZG9Tb21ldGhpbmcoKSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFdpdGggc3RyaW5nIHNlbGVjdG9yOlxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnY2hpbGQtY21wJyxcbiAqICAgdGVtcGxhdGU6ICc8cD5jaGlsZDwvcD4nXG4gKiB9KVxuICogY2xhc3MgQ2hpbGRDbXAge1xuICogICBkb1NvbWV0aGluZygpIHt9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnc29tZS1jbXAnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxjaGlsZC1jbXAgI2NoaWxkMT48L2NoaWxkLWNtcD5cbiAqICAgICA8Y2hpbGQtY21wICNjaGlsZDI+PC9jaGlsZC1jbXA+XG4gKiAgICAgPGNoaWxkLWNtcCAjY2hpbGQzPjwvY2hpbGQtY21wPlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbQ2hpbGRDbXBdXG4gKiB9KVxuICogY2xhc3MgU29tZUNtcCB7XG4gKiAgIEBWaWV3Q2hpbGRyZW4oJ2NoaWxkMSxjaGlsZDIsY2hpbGQzJykgY2hpbGRyZW46UXVlcnlMaXN0PENoaWxkQ21wPjtcbiAqXG4gKiAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAqICAgICAvLyBjaGlsZHJlbiBhcmUgc2V0XG4gKiAgICAgdGhpcy5jaGlsZHJlbi50b0FycmF5KCkuZm9yRWFjaCgoY2hpbGQpPT5jaGlsZC5kb1NvbWV0aGluZygpKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogU2VlIGFsc286IFtWaWV3Q2hpbGRyZW5NZXRhZGF0YV1cbiAqL1xuZXhwb3J0IHZhciBWaWV3Q2hpbGRyZW46IFZpZXdDaGlsZHJlbkZhY3RvcnkgPSBtYWtlUHJvcERlY29yYXRvcihWaWV3Q2hpbGRyZW5NZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gVmlld0NoaWxkTWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmVzIGEgcmVmZXJlbmNlIHRvIGEgY2hpbGQgZWxlbWVudC5cbiAqXG4gKiBgVmlld0NoaWxkcmVuYCB0YWtlcyBhIGFyZ3VtZW50IHRvIHNlbGVjdCBlbGVtZW50cy5cbiAqXG4gKiAtIElmIHRoZSBhcmd1bWVudCBpcyBhIHR5cGUsIGEgZGlyZWN0aXZlIG9yIGEgY29tcG9uZW50IHdpdGggdGhlIHR5cGUgd2lsbCBiZSBib3VuZC5cbiAqXG4gKiAtIElmIHRoZSBhcmd1bWVudCBpcyBhIHN0cmluZywgdGhlIHN0cmluZyBpcyBpbnRlcnByZXRlZCBhcyBhIHNlbGVjdG9yLiBBbiBlbGVtZW50IGNvbnRhaW5pbmcgdGhlXG4gKiBtYXRjaGluZyB0ZW1wbGF0ZSB2YXJpYWJsZSAoZS5nLiBgI2NoaWxkYCkgd2lsbCBiZSBib3VuZC5cbiAqXG4gKiBJbiBlaXRoZXIgY2FzZSwgYEBWaWV3Q2hpbGQoKWAgYXNzaWducyB0aGUgZmlyc3QgKGxvb2tpbmcgZnJvbSBhYm92ZSkgZWxlbWVudCBpZiB0aGVyZSBhcmVcbiAqIG11bHRpcGxlIG1hdGNoZXMuXG4gKlxuICogVmlldyBjaGlsZCBpcyBzZXQgYmVmb3JlIHRoZSBgbmdBZnRlclZpZXdJbml0YCBjYWxsYmFjayBpcyBjYWxsZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBXaXRoIHR5cGUgc2VsZWN0b3I6XG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdjaGlsZC1jbXAnLFxuICogICB0ZW1wbGF0ZTogJzxwPmNoaWxkPC9wPidcbiAqIH0pXG4gKiBjbGFzcyBDaGlsZENtcCB7XG4gKiAgIGRvU29tZXRoaW5nKCkge31cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdzb21lLWNtcCcsXG4gKiAgIHRlbXBsYXRlOiAnPGNoaWxkLWNtcD48L2NoaWxkLWNtcD4nLFxuICogICBkaXJlY3RpdmVzOiBbQ2hpbGRDbXBdXG4gKiB9KVxuICogY2xhc3MgU29tZUNtcCB7XG4gKiAgIEBWaWV3Q2hpbGQoQ2hpbGRDbXApIGNoaWxkOkNoaWxkQ21wO1xuICpcbiAqICAgbmdBZnRlclZpZXdJbml0KCkge1xuICogICAgIC8vIGNoaWxkIGlzIHNldFxuICogICAgIHRoaXMuY2hpbGQuZG9Tb21ldGhpbmcoKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogV2l0aCBzdHJpbmcgc2VsZWN0b3I6XG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdjaGlsZC1jbXAnLFxuICogICB0ZW1wbGF0ZTogJzxwPmNoaWxkPC9wPidcbiAqIH0pXG4gKiBjbGFzcyBDaGlsZENtcCB7XG4gKiAgIGRvU29tZXRoaW5nKCkge31cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdzb21lLWNtcCcsXG4gKiAgIHRlbXBsYXRlOiAnPGNoaWxkLWNtcCAjY2hpbGQ+PC9jaGlsZC1jbXA+JyxcbiAqICAgZGlyZWN0aXZlczogW0NoaWxkQ21wXVxuICogfSlcbiAqIGNsYXNzIFNvbWVDbXAge1xuICogICBAVmlld0NoaWxkKCdjaGlsZCcpIGNoaWxkOkNoaWxkQ21wO1xuICpcbiAqICAgbmdBZnRlclZpZXdJbml0KCkge1xuICogICAgIC8vIGNoaWxkIGlzIHNldFxuICogICAgIHRoaXMuY2hpbGQuZG9Tb21ldGhpbmcoKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKiBTZWUgYWxzbzogW1ZpZXdDaGlsZE1ldGFkYXRhXVxuICovXG5leHBvcnQgdmFyIFZpZXdDaGlsZDogVmlld0NoaWxkRmFjdG9yeSA9IG1ha2VQcm9wRGVjb3JhdG9yKFZpZXdDaGlsZE1ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBWaWV3UXVlcnlNZXRhZGF0YS5cbi8qKlxuICogU2ltaWxhciB0byB7QGxpbmsgUXVlcnlNZXRhZGF0YX0sIGJ1dCBxdWVyeWluZyB0aGUgY29tcG9uZW50IHZpZXcsIGluc3RlYWQgb2ZcbiAqIHRoZSBjb250ZW50IGNoaWxkcmVuLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9lTnNGSERmN1lqeU02SXpLeE0xaj9wPXByZXZpZXcpKVxuICpcbiAqIGBgYGphdmFzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICAuLi4sXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGl0ZW0+IGEgPC9pdGVtPlxuICogICAgIDxpdGVtPiBiIDwvaXRlbT5cbiAqICAgICA8aXRlbT4gYyA8L2l0ZW0+XG4gKiAgIGBcbiAqIH0pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIHNob3duOiBib29sZWFuO1xuICpcbiAqICAgY29uc3RydWN0b3IocHJpdmF0ZSBAUXVlcnkoSXRlbSkgaXRlbXM6UXVlcnlMaXN0PEl0ZW0+KSB7XG4gKiAgICAgaXRlbXMuY2hhbmdlcy5zdWJzY3JpYmUoKCkgPT4gY29uc29sZS5sb2coaXRlbXMubGVuZ3RoKSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFN1cHBvcnRzIHRoZSBzYW1lIHF1ZXJ5aW5nIHBhcmFtZXRlcnMgYXMge0BsaW5rIFF1ZXJ5TWV0YWRhdGF9LCBleGNlcHRcbiAqIGBkZXNjZW5kYW50c2AuIFRoaXMgYWx3YXlzIHF1ZXJpZXMgdGhlIHdob2xlIHZpZXcuXG4gKlxuICogQXMgYHNob3duYCBpcyBmbGlwcGVkIGJldHdlZW4gdHJ1ZSBhbmQgZmFsc2UsIGl0ZW1zIHdpbGwgY29udGFpbiB6ZXJvIG9mIG9uZVxuICogaXRlbXMuXG4gKlxuICogU3BlY2lmaWVzIHRoYXQgYSB7QGxpbmsgUXVlcnlMaXN0fSBzaG91bGQgYmUgaW5qZWN0ZWQuXG4gKlxuICogVGhlIGluamVjdGVkIG9iamVjdCBpcyBhbiBpdGVyYWJsZSBhbmQgb2JzZXJ2YWJsZSBsaXZlIGxpc3QuXG4gKiBTZWUge0BsaW5rIFF1ZXJ5TGlzdH0gZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuZXhwb3J0IHZhciBWaWV3UXVlcnk6IFF1ZXJ5RmFjdG9yeSA9IG1ha2VQYXJhbURlY29yYXRvcihWaWV3UXVlcnlNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gUGlwZU1ldGFkYXRhLlxuLyoqXG4gKiBEZWNsYXJlIHJldXNhYmxlIHBpcGUgZnVuY3Rpb24uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS90cy9tZXRhZGF0YS9tZXRhZGF0YS50cyByZWdpb249J3BpcGUnfVxuICovXG5leHBvcnQgdmFyIFBpcGU6IFBpcGVGYWN0b3J5ID0gPFBpcGVGYWN0b3J5Pm1ha2VEZWNvcmF0b3IoUGlwZU1ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBJbnB1dE1ldGFkYXRhLlxuLyoqXG4gKiBEZWNsYXJlcyBhIGRhdGEtYm91bmQgaW5wdXQgcHJvcGVydHkuXG4gKlxuICogQW5ndWxhciBhdXRvbWF0aWNhbGx5IHVwZGF0ZXMgZGF0YS1ib3VuZCBwcm9wZXJ0aWVzIGR1cmluZyBjaGFuZ2UgZGV0ZWN0aW9uLlxuICpcbiAqIGBJbnB1dE1ldGFkYXRhYCB0YWtlcyBhbiBvcHRpb25hbCBwYXJhbWV0ZXIgdGhhdCBzcGVjaWZpZXMgdGhlIG5hbWVcbiAqIHVzZWQgd2hlbiBpbnN0YW50aWF0aW5nIGEgY29tcG9uZW50IGluIHRoZSB0ZW1wbGF0ZS4gV2hlbiBub3QgcHJvdmlkZWQsXG4gKiB0aGUgbmFtZSBvZiB0aGUgZGVjb3JhdGVkIHByb3BlcnR5IGlzIHVzZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgY3JlYXRlcyBhIGNvbXBvbmVudCB3aXRoIHR3byBpbnB1dCBwcm9wZXJ0aWVzLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2JhbmstYWNjb3VudCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgQmFuayBOYW1lOiB7e2JhbmtOYW1lfX1cbiAqICAgICBBY2NvdW50IElkOiB7e2lkfX1cbiAqICAgYFxuICogfSlcbiAqIGNsYXNzIEJhbmtBY2NvdW50IHtcbiAqICAgQElucHV0KCkgYmFua05hbWU6IHN0cmluZztcbiAqICAgQElucHV0KCdhY2NvdW50LWlkJykgaWQ6IHN0cmluZztcbiAqXG4gKiAgIC8vIHRoaXMgcHJvcGVydHkgaXMgbm90IGJvdW5kLCBhbmQgd29uJ3QgYmUgYXV0b21hdGljYWxseSB1cGRhdGVkIGJ5IEFuZ3VsYXJcbiAqICAgbm9ybWFsaXplZEJhbmtOYW1lOiBzdHJpbmc7XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8YmFuay1hY2NvdW50IGJhbmstbmFtZT1cIlJCQ1wiIGFjY291bnQtaWQ9XCI0NzQ3XCI+PC9iYW5rLWFjY291bnQ+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtCYW5rQWNjb3VudF1cbiAqIH0pXG4gKiBjbGFzcyBBcHAge31cbiAqXG4gKiBib290c3RyYXAoQXBwKTtcbiAqIGBgYFxuICovXG5leHBvcnQgdmFyIElucHV0OiBJbnB1dEZhY3RvcnkgPSBtYWtlUHJvcERlY29yYXRvcihJbnB1dE1ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBPdXRwdXRNZXRhZGF0YS5cbi8qKlxuICogRGVjbGFyZXMgYW4gZXZlbnQtYm91bmQgb3V0cHV0IHByb3BlcnR5LlxuICpcbiAqIFdoZW4gYW4gb3V0cHV0IHByb3BlcnR5IGVtaXRzIGFuIGV2ZW50LCBhbiBldmVudCBoYW5kbGVyIGF0dGFjaGVkIHRvIHRoYXQgZXZlbnRcbiAqIHRoZSB0ZW1wbGF0ZSBpcyBpbnZva2VkLlxuICpcbiAqIGBPdXRwdXRNZXRhZGF0YWAgdGFrZXMgYW4gb3B0aW9uYWwgcGFyYW1ldGVyIHRoYXQgc3BlY2lmaWVzIHRoZSBuYW1lXG4gKiB1c2VkIHdoZW4gaW5zdGFudGlhdGluZyBhIGNvbXBvbmVudCBpbiB0aGUgdGVtcGxhdGUuIFdoZW4gbm90IHByb3ZpZGVkLFxuICogdGhlIG5hbWUgb2YgdGhlIGRlY29yYXRlZCBwcm9wZXJ0eSBpcyB1c2VkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnaW50ZXJ2YWwtZGlyJyxcbiAqIH0pXG4gKiBjbGFzcyBJbnRlcnZhbERpciB7XG4gKiAgIEBPdXRwdXQoKSBldmVyeVNlY29uZCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAqICAgQE91dHB1dCgnZXZlcnlGaXZlU2Vjb25kcycpIGZpdmU1U2VjcyA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKCkge1xuICogICAgIHNldEludGVydmFsKCgpID0+IHRoaXMuZXZlcnlTZWNvbmQuZW1pdChcImV2ZW50XCIpLCAxMDAwKTtcbiAqICAgICBzZXRJbnRlcnZhbCgoKSA9PiB0aGlzLmZpdmU1U2Vjcy5lbWl0KFwiZXZlbnRcIiksIDUwMDApO1xuICogICB9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8aW50ZXJ2YWwtZGlyIChldmVyeVNlY29uZCk9XCJldmVyeVNlY29uZCgpXCIgKGV2ZXJ5Rml2ZVNlY29uZHMpPVwiZXZlcnlGaXZlU2Vjb25kcygpXCI+XG4gKiAgICAgPC9pbnRlcnZhbC1kaXI+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtJbnRlcnZhbERpcl1cbiAqIH0pXG4gKiBjbGFzcyBBcHAge1xuICogICBldmVyeVNlY29uZCgpIHsgY29uc29sZS5sb2coJ3NlY29uZCcpOyB9XG4gKiAgIGV2ZXJ5Rml2ZVNlY29uZHMoKSB7IGNvbnNvbGUubG9nKCdmaXZlIHNlY29uZHMnKTsgfVxuICogfVxuICogYm9vdHN0cmFwKEFwcCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHZhciBPdXRwdXQ6IE91dHB1dEZhY3RvcnkgPSBtYWtlUHJvcERlY29yYXRvcihPdXRwdXRNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gSG9zdEJpbmRpbmdNZXRhZGF0YS5cbi8qKlxuICogRGVjbGFyZXMgYSBob3N0IHByb3BlcnR5IGJpbmRpbmcuXG4gKlxuICogQW5ndWxhciBhdXRvbWF0aWNhbGx5IGNoZWNrcyBob3N0IHByb3BlcnR5IGJpbmRpbmdzIGR1cmluZyBjaGFuZ2UgZGV0ZWN0aW9uLlxuICogSWYgYSBiaW5kaW5nIGNoYW5nZXMsIGl0IHdpbGwgdXBkYXRlIHRoZSBob3N0IGVsZW1lbnQgb2YgdGhlIGRpcmVjdGl2ZS5cbiAqXG4gKiBgSG9zdEJpbmRpbmdNZXRhZGF0YWAgdGFrZXMgYW4gb3B0aW9uYWwgcGFyYW1ldGVyIHRoYXQgc3BlY2lmaWVzIHRoZSBwcm9wZXJ0eVxuICogbmFtZSBvZiB0aGUgaG9zdCBlbGVtZW50IHRoYXQgd2lsbCBiZSB1cGRhdGVkLiBXaGVuIG5vdCBwcm92aWRlZCxcbiAqIHRoZSBjbGFzcyBwcm9wZXJ0eSBuYW1lIGlzIHVzZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgY3JlYXRlcyBhIGRpcmVjdGl2ZSB0aGF0IHNldHMgdGhlIGB2YWxpZGAgYW5kIGBpbnZhbGlkYCBjbGFzc2VzXG4gKiBvbiB0aGUgRE9NIGVsZW1lbnQgdGhhdCBoYXMgbmdNb2RlbCBkaXJlY3RpdmUgb24gaXQuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdNb2RlbF0nfSlcbiAqIGNsYXNzIE5nTW9kZWxTdGF0dXMge1xuICogICBjb25zdHJ1Y3RvcihwdWJsaWMgY29udHJvbDpOZ01vZGVsKSB7fVxuICogICBASG9zdEJpbmRpbmcoJ1tjbGFzcy52YWxpZF0nKSBnZXQgdmFsaWQgeyByZXR1cm4gdGhpcy5jb250cm9sLnZhbGlkOyB9XG4gKiAgIEBIb3N0QmluZGluZygnW2NsYXNzLmludmFsaWRdJykgZ2V0IGludmFsaWQgeyByZXR1cm4gdGhpcy5jb250cm9sLmludmFsaWQ7IH1cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICogICB0ZW1wbGF0ZTogYDxpbnB1dCBbKG5nTW9kZWwpXT1cInByb3BcIj5gLFxuICogICBkaXJlY3RpdmVzOiBbRk9STV9ESVJFQ1RJVkVTLCBOZ01vZGVsU3RhdHVzXVxuICogfSlcbiAqIGNsYXNzIEFwcCB7XG4gKiAgIHByb3A7XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHZhciBIb3N0QmluZGluZzogSG9zdEJpbmRpbmdGYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoSG9zdEJpbmRpbmdNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gSG9zdExpc3RlbmVyTWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmVzIGEgaG9zdCBsaXN0ZW5lci5cbiAqXG4gKiBBbmd1bGFyIHdpbGwgaW52b2tlIHRoZSBkZWNvcmF0ZWQgbWV0aG9kIHdoZW4gdGhlIGhvc3QgZWxlbWVudCBlbWl0cyB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICpcbiAqIElmIHRoZSBkZWNvcmF0ZWQgbWV0aG9kIHJldHVybnMgYGZhbHNlYCwgdGhlbiBgcHJldmVudERlZmF1bHRgIGlzIGFwcGxpZWQgb24gdGhlIERPTVxuICogZXZlbnQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgZGVjbGFyZXMgYSBkaXJlY3RpdmUgdGhhdCBhdHRhY2hlcyBhIGNsaWNrIGxpc3RlbmVyIHRvIHRoZSBidXR0b24gYW5kXG4gKiBjb3VudHMgY2xpY2tzLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnYnV0dG9uW2NvdW50aW5nXSd9KVxuICogY2xhc3MgQ291bnRDbGlja3Mge1xuICogICBudW1iZXJPZkNsaWNrcyA9IDA7XG4gKlxuICogICBASG9zdExpc3RlbmVyKCdjbGljaycsIFsnJGV2ZW50LnRhcmdldCddKVxuICogICBvbkNsaWNrKGJ0bikge1xuICogICAgIGNvbnNvbGUubG9nKFwiYnV0dG9uXCIsIGJ0biwgXCJudW1iZXIgb2YgY2xpY2tzOlwiLCB0aGlzLm51bWJlck9mQ2xpY2tzKyspO1xuICogICB9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgdGVtcGxhdGU6IGA8YnV0dG9uIGNvdW50aW5nPkluY3JlbWVudDwvYnV0dG9uPmAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDb3VudENsaWNrc11cbiAqIH0pXG4gKiBjbGFzcyBBcHAge31cbiAqXG4gKiBib290c3RyYXAoQXBwKTtcbiAqIGBgYFxuICovXG5leHBvcnQgdmFyIEhvc3RMaXN0ZW5lcjogSG9zdExpc3RlbmVyRmFjdG9yeSA9IG1ha2VQcm9wRGVjb3JhdG9yKEhvc3RMaXN0ZW5lck1ldGFkYXRhKTtcbiJdfQ==