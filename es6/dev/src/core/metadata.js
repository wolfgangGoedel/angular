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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXNtNDZsRTR0LnRtcC9hbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxTQUNFLGFBQWEsRUFDYix1QkFBdUIsRUFDdkIsb0JBQW9CLEVBQ3BCLG9CQUFvQixFQUNwQixpQkFBaUIsRUFDakIsaUJBQWlCLEVBQ2pCLGlCQUFpQixRQUNaLGVBQWUsQ0FBQztBQUV2QixTQUNFLGlCQUFpQixFQUNqQixpQkFBaUIsRUFDakIsWUFBWSxFQUNaLGFBQWEsRUFDYixjQUFjLEVBQ2QsbUJBQW1CLEVBQ25CLG9CQUFvQixRQUNmLHVCQUF1QixDQUFDO0FBRS9CLFNBQVEsWUFBWSxFQUFFLGlCQUFpQixRQUFPLGlCQUFpQixDQUFDO0FBVzVCLE9BRTdCLEVBQ0wsYUFBYSxFQUNiLHVCQUF1QixFQUN2QixvQkFBb0IsRUFDcEIsb0JBQW9CLEVBQ3BCLGlCQUFpQixFQUNqQixpQkFBaUIsRUFDakIsaUJBQWlCLEVBQ2xCLE1BQU0sZUFBZTtPQUVmLEVBQ0wsaUJBQWlCLEVBQ2pCLGlCQUFpQixFQUNqQixZQUFZLEVBQ1osYUFBYSxFQUNiLGNBQWMsRUFDZCxtQkFBbUIsRUFDbkIsb0JBQW9CLEVBQ3JCLE1BQU0sdUJBQXVCO09BRXZCLEVBQUMsWUFBWSxFQUFvQixNQUFNLGlCQUFpQjtPQUd4RCxFQUNMLGFBQWEsRUFDYixrQkFBa0IsRUFDbEIsaUJBQWlCLEVBR2xCLE1BQU0sbUJBQW1CO0FBc2ExQiw0RkFBNEY7QUFDNUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQkc7QUFDSCxPQUFPLElBQUksU0FBUyxHQUNFLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQU8sS0FBSyxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDO0FBRXBGLDRGQUE0RjtBQUM1Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F5WEc7QUFDSCxPQUFPLElBQUksU0FBUyxHQUF1QyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUU1Rix1RkFBdUY7QUFDdkY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E0Qkc7QUFDSCxJQUFJLElBQUksR0FBNkIsYUFBYSxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQU8sS0FBSyxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDO0FBRTlGOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JHO0FBQ0gsT0FBTyxJQUFJLFNBQVMsR0FBcUIsa0JBQWtCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUUvRSx3RkFBd0Y7QUFDeEY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EwR0c7QUFDSCxPQUFPLElBQUksS0FBSyxHQUFpQixrQkFBa0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUVuRSxrR0FBa0c7QUFDbEc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFDSCxPQUFPLElBQUksZUFBZSxHQUEyQixpQkFBaUIsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBRWhHLCtGQUErRjtBQUMvRjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1CRztBQUNILE9BQU8sSUFBSSxZQUFZLEdBQXdCLGlCQUFpQixDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFFdkYsK0ZBQStGO0FBQy9GOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4RUc7QUFDSCxPQUFPLElBQUksWUFBWSxHQUF3QixpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBRXZGLDRGQUE0RjtBQUM1Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUVHO0FBQ0gsT0FBTyxJQUFJLFNBQVMsR0FBcUIsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUU5RSw0RkFBNEY7QUFDNUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQ0c7QUFDSCxPQUFPLElBQUksU0FBUyxHQUFpQixrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBRTNFLHVGQUF1RjtBQUN2Rjs7Ozs7O0dBTUc7QUFDSCxPQUFPLElBQUksSUFBSSxHQUE2QixhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7QUFFeEUsd0ZBQXdGO0FBQ3hGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBd0NHO0FBQ0gsT0FBTyxJQUFJLEtBQUssR0FBaUIsaUJBQWlCLENBQUMsYUFBYSxDQUFDLENBQUM7QUFFbEUseUZBQXlGO0FBQ3pGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBd0NHO0FBQ0gsT0FBTyxJQUFJLE1BQU0sR0FBa0IsaUJBQWlCLENBQUMsY0FBYyxDQUFDLENBQUM7QUFFckUsOEZBQThGO0FBQzlGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0NHO0FBQ0gsT0FBTyxJQUFJLFdBQVcsR0FBdUIsaUJBQWlCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUVwRiwrRkFBK0Y7QUFDL0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWlDRztBQUNILE9BQU8sSUFBSSxZQUFZLEdBQXdCLGlCQUFpQixDQUFDLG9CQUFvQixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoaXMgaW5kaXJlY3Rpb24gaXMgbmVlZGVkIHRvIGZyZWUgdXAgQ29tcG9uZW50LCBldGMgc3ltYm9scyBpbiB0aGUgcHVibGljIEFQSVxuICogdG8gYmUgdXNlZCBieSB0aGUgZGVjb3JhdG9yIHZlcnNpb25zIG9mIHRoZXNlIGFubm90YXRpb25zLlxuICovXG5cbmV4cG9ydCB7XG4gIFF1ZXJ5TWV0YWRhdGEsXG4gIENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhLFxuICBDb250ZW50Q2hpbGRNZXRhZGF0YSxcbiAgVmlld0NoaWxkcmVuTWV0YWRhdGEsXG4gIFZpZXdRdWVyeU1ldGFkYXRhLFxuICBWaWV3Q2hpbGRNZXRhZGF0YSxcbiAgQXR0cmlidXRlTWV0YWRhdGFcbn0gZnJvbSAnLi9tZXRhZGF0YS9kaSc7XG5cbmV4cG9ydCB7XG4gIENvbXBvbmVudE1ldGFkYXRhLFxuICBEaXJlY3RpdmVNZXRhZGF0YSxcbiAgUGlwZU1ldGFkYXRhLFxuICBJbnB1dE1ldGFkYXRhLFxuICBPdXRwdXRNZXRhZGF0YSxcbiAgSG9zdEJpbmRpbmdNZXRhZGF0YSxcbiAgSG9zdExpc3RlbmVyTWV0YWRhdGFcbn0gZnJvbSAnLi9tZXRhZGF0YS9kaXJlY3RpdmVzJztcblxuZXhwb3J0IHtWaWV3TWV0YWRhdGEsIFZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICcuL21ldGFkYXRhL3ZpZXcnO1xuXG5leHBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBBZnRlckNvbnRlbnRDaGVja2VkLFxuICBBZnRlclZpZXdJbml0LFxuICBBZnRlclZpZXdDaGVja2VkLFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBEb0NoZWNrXG59IGZyb20gJy4vbWV0YWRhdGEvbGlmZWN5Y2xlX2hvb2tzJztcblxuaW1wb3J0IHtcbiAgUXVlcnlNZXRhZGF0YSxcbiAgQ29udGVudENoaWxkcmVuTWV0YWRhdGEsXG4gIENvbnRlbnRDaGlsZE1ldGFkYXRhLFxuICBWaWV3Q2hpbGRyZW5NZXRhZGF0YSxcbiAgVmlld0NoaWxkTWV0YWRhdGEsXG4gIFZpZXdRdWVyeU1ldGFkYXRhLFxuICBBdHRyaWJ1dGVNZXRhZGF0YVxufSBmcm9tICcuL21ldGFkYXRhL2RpJztcblxuaW1wb3J0IHtcbiAgQ29tcG9uZW50TWV0YWRhdGEsXG4gIERpcmVjdGl2ZU1ldGFkYXRhLFxuICBQaXBlTWV0YWRhdGEsXG4gIElucHV0TWV0YWRhdGEsXG4gIE91dHB1dE1ldGFkYXRhLFxuICBIb3N0QmluZGluZ01ldGFkYXRhLFxuICBIb3N0TGlzdGVuZXJNZXRhZGF0YVxufSBmcm9tICcuL21ldGFkYXRhL2RpcmVjdGl2ZXMnO1xuXG5pbXBvcnQge1ZpZXdNZXRhZGF0YSwgVmlld0VuY2Fwc3VsYXRpb259IGZyb20gJy4vbWV0YWRhdGEvdmlldyc7XG5pbXBvcnQge0NoYW5nZURldGVjdGlvblN0cmF0ZWd5fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rpb24nO1xuXG5pbXBvcnQge1xuICBtYWtlRGVjb3JhdG9yLFxuICBtYWtlUGFyYW1EZWNvcmF0b3IsXG4gIG1ha2VQcm9wRGVjb3JhdG9yLFxuICBUeXBlRGVjb3JhdG9yLFxuICBDbGFzc1xufSBmcm9tICcuL3V0aWwvZGVjb3JhdG9ycyc7XG5pbXBvcnQge1R5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUge0BsaW5rIERpcmVjdGl2ZU1ldGFkYXRhfSBkZWNvcmF0b3IgZnVuY3Rpb24uXG4gKlxuICogU2VlIHtAbGluayBEaXJlY3RpdmVGYWN0b3J5fS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RpdmVEZWNvcmF0b3IgZXh0ZW5kcyBUeXBlRGVjb3JhdG9yIHt9XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUge0BsaW5rIENvbXBvbmVudE1ldGFkYXRhfSBkZWNvcmF0b3IgZnVuY3Rpb24uXG4gKlxuICogU2VlIHtAbGluayBDb21wb25lbnRGYWN0b3J5fS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnREZWNvcmF0b3IgZXh0ZW5kcyBUeXBlRGVjb3JhdG9yIHtcbiAgLyoqXG4gICAqIENoYWluIHtAbGluayBWaWV3TWV0YWRhdGF9IGFubm90YXRpb24uXG4gICAqL1xuICBWaWV3KG9iajoge1xuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICByZW5kZXJlcj86IHN0cmluZyxcbiAgICBzdHlsZXM/OiBzdHJpbmdbXSxcbiAgICBzdHlsZVVybHM/OiBzdHJpbmdbXSxcbiAgfSk6IFZpZXdEZWNvcmF0b3I7XG59XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUge0BsaW5rIFZpZXdNZXRhZGF0YX0gZGVjb3JhdG9yIGZ1bmN0aW9uLlxuICpcbiAqIFNlZSB7QGxpbmsgVmlld0ZhY3Rvcnl9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFZpZXdEZWNvcmF0b3IgZXh0ZW5kcyBUeXBlRGVjb3JhdG9yIHtcbiAgLyoqXG4gICAqIENoYWluIHtAbGluayBWaWV3TWV0YWRhdGF9IGFubm90YXRpb24uXG4gICAqL1xuICBWaWV3KG9iajoge1xuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICByZW5kZXJlcj86IHN0cmluZyxcbiAgICBzdHlsZXM/OiBzdHJpbmdbXSxcbiAgICBzdHlsZVVybHM/OiBzdHJpbmdbXSxcbiAgfSk6IFZpZXdEZWNvcmF0b3I7XG59XG5cbi8qKlxuICoge0BsaW5rIERpcmVjdGl2ZU1ldGFkYXRhfSBmYWN0b3J5IGZvciBjcmVhdGluZyBhbm5vdGF0aW9ucywgZGVjb3JhdG9ycyBvciBEU0wuXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgVHlwZVNjcmlwdCBEZWNvcmF0b3JcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS90cy9tZXRhZGF0YS9tZXRhZGF0YS50cyByZWdpb249J2RpcmVjdGl2ZSd9XG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IERTTFxuICpcbiAqIGBgYFxuICogdmFyIE15RGlyZWN0aXZlID0gbmdcbiAqICAgLkRpcmVjdGl2ZSh7Li4ufSlcbiAqICAgLkNsYXNzKHtcbiAqICAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24oKSB7XG4gKiAgICAgICAuLi5cbiAqICAgICB9XG4gKiAgIH0pXG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgYW5ub3RhdGlvblxuICpcbiAqIGBgYFxuICogdmFyIE15RGlyZWN0aXZlID0gZnVuY3Rpb24oKSB7XG4gKiAgIC4uLlxuICogfTtcbiAqXG4gKiBNeURpcmVjdGl2ZS5hbm5vdGF0aW9ucyA9IFtcbiAqICAgbmV3IG5nLkRpcmVjdGl2ZSh7Li4ufSlcbiAqIF1cbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIERpcmVjdGl2ZUZhY3Rvcnkge1xuICAob2JqOiB7XG4gICAgc2VsZWN0b3I/OiBzdHJpbmcsXG4gICAgaW5wdXRzPzogc3RyaW5nW10sXG4gICAgb3V0cHV0cz86IHN0cmluZ1tdLFxuICAgIHByb3BlcnRpZXM/OiBzdHJpbmdbXSxcbiAgICBldmVudHM/OiBzdHJpbmdbXSxcbiAgICBob3N0Pzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgYmluZGluZ3M/OiBhbnlbXSxcbiAgICBwcm92aWRlcnM/OiBhbnlbXSxcbiAgICBleHBvcnRBcz86IHN0cmluZyxcbiAgICBxdWVyaWVzPzoge1trZXk6IHN0cmluZ106IGFueX1cbiAgfSk6IERpcmVjdGl2ZURlY29yYXRvcjtcbiAgbmV3IChvYmo6IHtcbiAgICBzZWxlY3Rvcj86IHN0cmluZyxcbiAgICBpbnB1dHM/OiBzdHJpbmdbXSxcbiAgICBvdXRwdXRzPzogc3RyaW5nW10sXG4gICAgcHJvcGVydGllcz86IHN0cmluZ1tdLFxuICAgIGV2ZW50cz86IHN0cmluZ1tdLFxuICAgIGhvc3Q/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBiaW5kaW5ncz86IGFueVtdLFxuICAgIHByb3ZpZGVycz86IGFueVtdLFxuICAgIGV4cG9ydEFzPzogc3RyaW5nLFxuICAgIHF1ZXJpZXM/OiB7W2tleTogc3RyaW5nXTogYW55fVxuICB9KTogRGlyZWN0aXZlTWV0YWRhdGE7XG59XG5cbi8qKlxuICoge0BsaW5rIENvbXBvbmVudE1ldGFkYXRhfSBmYWN0b3J5IGZvciBjcmVhdGluZyBhbm5vdGF0aW9ucywgZGVjb3JhdG9ycyBvciBEU0wuXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgVHlwZVNjcmlwdCBEZWNvcmF0b3JcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS90cy9tZXRhZGF0YS9tZXRhZGF0YS50cyByZWdpb249J2NvbXBvbmVudCd9XG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IERTTFxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gbmdcbiAqICAgLkNvbXBvbmVudCh7Li4ufSlcbiAqICAgLkNsYXNzKHtcbiAqICAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24oKSB7XG4gKiAgICAgICAuLi5cbiAqICAgICB9XG4gKiAgIH0pXG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgYW5ub3RhdGlvblxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gZnVuY3Rpb24oKSB7XG4gKiAgIC4uLlxuICogfTtcbiAqXG4gKiBNeUNvbXBvbmVudC5hbm5vdGF0aW9ucyA9IFtcbiAqICAgbmV3IG5nLkNvbXBvbmVudCh7Li4ufSlcbiAqIF1cbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudEZhY3Rvcnkge1xuICAob2JqOiB7XG4gICAgc2VsZWN0b3I/OiBzdHJpbmcsXG4gICAgaW5wdXRzPzogc3RyaW5nW10sXG4gICAgb3V0cHV0cz86IHN0cmluZ1tdLFxuICAgIHByb3BlcnRpZXM/OiBzdHJpbmdbXSxcbiAgICBldmVudHM/OiBzdHJpbmdbXSxcbiAgICBob3N0Pzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgLyogQGRlcHJlY2F0ZWQgKi9cbiAgICBiaW5kaW5ncz86IGFueVtdLFxuICAgIHByb3ZpZGVycz86IGFueVtdLFxuICAgIGV4cG9ydEFzPzogc3RyaW5nLFxuICAgIG1vZHVsZUlkPzogc3RyaW5nLFxuICAgIHF1ZXJpZXM/OiB7W2tleTogc3RyaW5nXTogYW55fSxcbiAgICB2aWV3QmluZGluZ3M/OiBhbnlbXSxcbiAgICB2aWV3UHJvdmlkZXJzPzogYW55W10sXG4gICAgY2hhbmdlRGV0ZWN0aW9uPzogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gICAgdGVtcGxhdGVVcmw/OiBzdHJpbmcsXG4gICAgdGVtcGxhdGU/OiBzdHJpbmcsXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgZGlyZWN0aXZlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgcGlwZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIGVuY2Fwc3VsYXRpb24/OiBWaWV3RW5jYXBzdWxhdGlvblxuICB9KTogQ29tcG9uZW50RGVjb3JhdG9yO1xuICBuZXcgKG9iajoge1xuICAgIHNlbGVjdG9yPzogc3RyaW5nLFxuICAgIGlucHV0cz86IHN0cmluZ1tdLFxuICAgIG91dHB1dHM/OiBzdHJpbmdbXSxcbiAgICBwcm9wZXJ0aWVzPzogc3RyaW5nW10sXG4gICAgZXZlbnRzPzogc3RyaW5nW10sXG4gICAgaG9zdD86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIC8qIEBkZXByZWNhdGVkICovXG4gICAgYmluZGluZ3M/OiBhbnlbXSxcbiAgICBwcm92aWRlcnM/OiBhbnlbXSxcbiAgICBleHBvcnRBcz86IHN0cmluZyxcbiAgICBtb2R1bGVJZD86IHN0cmluZyxcbiAgICBxdWVyaWVzPzoge1trZXk6IHN0cmluZ106IGFueX0sXG4gICAgLyogQGRlcHJlY2F0ZWQgKi9cbiAgICB2aWV3QmluZGluZ3M/OiBhbnlbXSxcbiAgICB2aWV3UHJvdmlkZXJzPzogYW55W10sXG4gICAgY2hhbmdlRGV0ZWN0aW9uPzogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gICAgdGVtcGxhdGVVcmw/OiBzdHJpbmcsXG4gICAgdGVtcGxhdGU/OiBzdHJpbmcsXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgZGlyZWN0aXZlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgcGlwZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIGVuY2Fwc3VsYXRpb24/OiBWaWV3RW5jYXBzdWxhdGlvblxuICB9KTogQ29tcG9uZW50TWV0YWRhdGE7XG59XG5cbi8qKlxuICoge0BsaW5rIFZpZXdNZXRhZGF0YX0gZmFjdG9yeSBmb3IgY3JlYXRpbmcgYW5ub3RhdGlvbnMsIGRlY29yYXRvcnMgb3IgRFNMLlxuICpcbiAqICMjIyBFeGFtcGxlIGFzIFR5cGVTY3JpcHQgRGVjb3JhdG9yXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudCwgVmlld30gZnJvbSBcImFuZ3VsYXIyL2NvcmVcIjtcbiAqXG4gKiBAQ29tcG9uZW50KHsuLi59KVxuICogY2xhc3MgTXlDb21wb25lbnQge1xuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgICAuLi5cbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IERTTFxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gbmdcbiAqICAgLkNvbXBvbmVudCh7Li4ufSlcbiAqICAgLlZpZXcoey4uLn0pXG4gKiAgIC5DbGFzcyh7XG4gKiAgICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKCkge1xuICogICAgICAgLi4uXG4gKiAgICAgfVxuICogICB9KVxuICogYGBgXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IGFubm90YXRpb25cbiAqXG4gKiBgYGBcbiAqIHZhciBNeUNvbXBvbmVudCA9IGZ1bmN0aW9uKCkge1xuICogICAuLi5cbiAqIH07XG4gKlxuICogTXlDb21wb25lbnQuYW5ub3RhdGlvbnMgPSBbXG4gKiAgIG5ldyBuZy5Db21wb25lbnQoey4uLn0pLFxuICogICBuZXcgbmcuVmlldyh7Li4ufSlcbiAqIF1cbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFZpZXdGYWN0b3J5IHtcbiAgKG9iajoge1xuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBlbmNhcHN1bGF0aW9uPzogVmlld0VuY2Fwc3VsYXRpb24sXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gIH0pOiBWaWV3RGVjb3JhdG9yO1xuICBuZXcgKG9iajoge1xuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBlbmNhcHN1bGF0aW9uPzogVmlld0VuY2Fwc3VsYXRpb24sXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gIH0pOiBWaWV3TWV0YWRhdGE7XG59XG5cbi8qKlxuICoge0BsaW5rIEF0dHJpYnV0ZU1ldGFkYXRhfSBmYWN0b3J5IGZvciBjcmVhdGluZyBhbm5vdGF0aW9ucywgZGVjb3JhdG9ycyBvciBEU0wuXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgVHlwZVNjcmlwdCBEZWNvcmF0b3JcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS90cy9tZXRhZGF0YS9tZXRhZGF0YS50cyByZWdpb249J2F0dHJpYnV0ZUZhY3RvcnknfVxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBEU0xcbiAqXG4gKiBgYGBcbiAqIHZhciBNeUNvbXBvbmVudCA9IG5nXG4gKiAgIC5Db21wb25lbnQoey4uLn0pXG4gKiAgIC5DbGFzcyh7XG4gKiAgICAgY29uc3RydWN0b3I6IFtuZXcgbmcuQXR0cmlidXRlKCd0aXRsZScpLCBmdW5jdGlvbih0aXRsZSkge1xuICogICAgICAgLi4uXG4gKiAgICAgfV1cbiAqICAgfSlcbiAqIGBgYFxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBhbm5vdGF0aW9uXG4gKlxuICogYGBgXG4gKiB2YXIgTXlDb21wb25lbnQgPSBmdW5jdGlvbih0aXRsZSkge1xuICogICAuLi5cbiAqIH07XG4gKlxuICogTXlDb21wb25lbnQuYW5ub3RhdGlvbnMgPSBbXG4gKiAgIG5ldyBuZy5Db21wb25lbnQoey4uLn0pXG4gKiBdXG4gKiBNeUNvbXBvbmVudC5wYXJhbWV0ZXJzID0gW1xuICogICBbbmV3IG5nLkF0dHJpYnV0ZSgndGl0bGUnKV1cbiAqIF1cbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEF0dHJpYnV0ZUZhY3Rvcnkge1xuICAobmFtZTogc3RyaW5nKTogVHlwZURlY29yYXRvcjtcbiAgbmV3IChuYW1lOiBzdHJpbmcpOiBBdHRyaWJ1dGVNZXRhZGF0YTtcbn1cblxuLyoqXG4gKiB7QGxpbmsgUXVlcnlNZXRhZGF0YX0gZmFjdG9yeSBmb3IgY3JlYXRpbmcgYW5ub3RhdGlvbnMsIGRlY29yYXRvcnMgb3IgRFNMLlxuICpcbiAqICMjIyBFeGFtcGxlIGFzIFR5cGVTY3JpcHQgRGVjb3JhdG9yXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge1F1ZXJ5LCBRdWVyeUxpc3QsIENvbXBvbmVudH0gZnJvbSBcImFuZ3VsYXIyL2NvcmVcIjtcbiAqXG4gKiBAQ29tcG9uZW50KHsuLi59KVxuICogY2xhc3MgTXlDb21wb25lbnQge1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoU29tZVR5cGUpIHF1ZXJ5TGlzdDogUXVlcnlMaXN0PFNvbWVUeXBlPikge1xuICogICAgIC4uLlxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgRFNMXG4gKlxuICogYGBgXG4gKiB2YXIgTXlDb21wb25lbnQgPSBuZ1xuICogICAuQ29tcG9uZW50KHsuLi59KVxuICogICAuQ2xhc3Moe1xuICogICAgIGNvbnN0cnVjdG9yOiBbbmV3IG5nLlF1ZXJ5KFNvbWVUeXBlKSwgZnVuY3Rpb24ocXVlcnlMaXN0KSB7XG4gKiAgICAgICAuLi5cbiAqICAgICB9XVxuICogICB9KVxuICogYGBgXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IGFubm90YXRpb25cbiAqXG4gKiBgYGBcbiAqIHZhciBNeUNvbXBvbmVudCA9IGZ1bmN0aW9uKHF1ZXJ5TGlzdCkge1xuICogICAuLi5cbiAqIH07XG4gKlxuICogTXlDb21wb25lbnQuYW5ub3RhdGlvbnMgPSBbXG4gKiAgIG5ldyBuZy5Db21wb25lbnQoey4uLn0pXG4gKiBdXG4gKiBNeUNvbXBvbmVudC5wYXJhbWV0ZXJzID0gW1xuICogICBbbmV3IG5nLlF1ZXJ5KFNvbWVUeXBlKV1cbiAqIF1cbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFF1ZXJ5RmFjdG9yeSB7XG4gIChzZWxlY3RvcjogVHlwZSB8IHN0cmluZywge2Rlc2NlbmRhbnRzfT86IHtkZXNjZW5kYW50cz86IGJvb2xlYW59KTogUGFyYW1ldGVyRGVjb3JhdG9yO1xuICBuZXcgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLCB7ZGVzY2VuZGFudHN9Pzoge2Rlc2NlbmRhbnRzPzogYm9vbGVhbn0pOiBRdWVyeU1ldGFkYXRhO1xufVxuXG4vKipcbiAqIEZhY3RvcnkgZm9yIHtAbGluayBDb250ZW50Q2hpbGRyZW59LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbnRlbnRDaGlsZHJlbkZhY3Rvcnkge1xuICAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcsIHtkZXNjZW5kYW50c30/OiB7ZGVzY2VuZGFudHM/OiBib29sZWFufSk6IGFueTtcbiAgbmV3IChzZWxlY3RvcjogVHlwZSB8IHN0cmluZywge2Rlc2NlbmRhbnRzfT86IHtkZXNjZW5kYW50cz86IGJvb2xlYW59KTogQ29udGVudENoaWxkcmVuTWV0YWRhdGE7XG59XG5cbi8qKlxuICogRmFjdG9yeSBmb3Ige0BsaW5rIENvbnRlbnRDaGlsZH0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGVudENoaWxkRmFjdG9yeSB7XG4gIChzZWxlY3RvcjogVHlwZSB8IHN0cmluZyk6IGFueTtcbiAgbmV3IChzZWxlY3RvcjogVHlwZSB8IHN0cmluZyk6IENvbnRlbnRDaGlsZEZhY3Rvcnk7XG59XG5cbi8qKlxuICogRmFjdG9yeSBmb3Ige0BsaW5rIFZpZXdDaGlsZHJlbn0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVmlld0NoaWxkcmVuRmFjdG9yeSB7XG4gIChzZWxlY3RvcjogVHlwZSB8IHN0cmluZyk6IGFueTtcbiAgbmV3IChzZWxlY3RvcjogVHlwZSB8IHN0cmluZyk6IFZpZXdDaGlsZHJlbk1ldGFkYXRhO1xufVxuXG4vKipcbiAqIEZhY3RvcnkgZm9yIHtAbGluayBWaWV3Q2hpbGR9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFZpZXdDaGlsZEZhY3Rvcnkge1xuICAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcpOiBhbnk7XG4gIG5ldyAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcpOiBWaWV3Q2hpbGRGYWN0b3J5O1xufVxuXG5cbi8qKlxuICoge0BsaW5rIFBpcGVNZXRhZGF0YX0gZmFjdG9yeSBmb3IgY3JlYXRpbmcgZGVjb3JhdG9ycy5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3RzL21ldGFkYXRhL21ldGFkYXRhLnRzIHJlZ2lvbj0ncGlwZSd9XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGlwZUZhY3Rvcnkge1xuICAob2JqOiB7bmFtZTogc3RyaW5nLCBwdXJlPzogYm9vbGVhbn0pOiBhbnk7XG4gIG5ldyAob2JqOiB7bmFtZTogc3RyaW5nLCBwdXJlPzogYm9vbGVhbn0pOiBhbnk7XG59XG5cbi8qKlxuICoge0BsaW5rIElucHV0TWV0YWRhdGF9IGZhY3RvcnkgZm9yIGNyZWF0aW5nIGRlY29yYXRvcnMuXG4gKlxuICogU2VlIHtAbGluayBJbnB1dE1ldGFkYXRhfS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJbnB1dEZhY3Rvcnkge1xuICAoYmluZGluZ1Byb3BlcnR5TmFtZT86IHN0cmluZyk6IGFueTtcbiAgbmV3IChiaW5kaW5nUHJvcGVydHlOYW1lPzogc3RyaW5nKTogYW55O1xufVxuXG4vKipcbiAqIHtAbGluayBPdXRwdXRNZXRhZGF0YX0gZmFjdG9yeSBmb3IgY3JlYXRpbmcgZGVjb3JhdG9ycy5cbiAqXG4gKiBTZWUge0BsaW5rIE91dHB1dE1ldGFkYXRhfS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBPdXRwdXRGYWN0b3J5IHtcbiAgKGJpbmRpbmdQcm9wZXJ0eU5hbWU/OiBzdHJpbmcpOiBhbnk7XG4gIG5ldyAoYmluZGluZ1Byb3BlcnR5TmFtZT86IHN0cmluZyk6IGFueTtcbn1cblxuLyoqXG4gKiB7QGxpbmsgSG9zdEJpbmRpbmdNZXRhZGF0YX0gZmFjdG9yeSBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIb3N0QmluZGluZ0ZhY3Rvcnkge1xuICAoaG9zdFByb3BlcnR5TmFtZT86IHN0cmluZyk6IGFueTtcbiAgbmV3IChob3N0UHJvcGVydHlOYW1lPzogc3RyaW5nKTogYW55O1xufVxuXG4vKipcbiAqIHtAbGluayBIb3N0TGlzdGVuZXJNZXRhZGF0YX0gZmFjdG9yeSBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIb3N0TGlzdGVuZXJGYWN0b3J5IHtcbiAgKGV2ZW50TmFtZTogc3RyaW5nLCBhcmdzPzogc3RyaW5nW10pOiBhbnk7XG4gIG5ldyAoZXZlbnROYW1lOiBzdHJpbmcsIGFyZ3M/OiBzdHJpbmdbXSk6IGFueTtcbn1cblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBDb21wb25lbnRNZXRhZGF0YS5cbi8qKlxuICogRGVjbGFyZSByZXVzYWJsZSBVSSBidWlsZGluZyBibG9ja3MgZm9yIGFuIGFwcGxpY2F0aW9uLlxuICpcbiAqIEVhY2ggQW5ndWxhciBjb21wb25lbnQgcmVxdWlyZXMgYSBzaW5nbGUgYEBDb21wb25lbnRgIGFubm90YXRpb24uIFRoZSBgQENvbXBvbmVudGBcbiAqIGFubm90YXRpb24gc3BlY2lmaWVzIHdoZW4gYSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkLCBhbmQgd2hpY2ggcHJvcGVydGllcyBhbmQgaG9zdExpc3RlbmVycyBpdFxuICogYmluZHMgdG8uXG4gKlxuICogV2hlbiBhIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQsIEFuZ3VsYXJcbiAqIC0gY3JlYXRlcyBhIHNoYWRvdyBET00gZm9yIHRoZSBjb21wb25lbnQuXG4gKiAtIGxvYWRzIHRoZSBzZWxlY3RlZCB0ZW1wbGF0ZSBpbnRvIHRoZSBzaGFkb3cgRE9NLlxuICogLSBjcmVhdGVzIGFsbCB0aGUgaW5qZWN0YWJsZSBvYmplY3RzIGNvbmZpZ3VyZWQgd2l0aCBgcHJvdmlkZXJzYCBhbmQgYHZpZXdQcm92aWRlcnNgLlxuICpcbiAqIEFsbCB0ZW1wbGF0ZSBleHByZXNzaW9ucyBhbmQgc3RhdGVtZW50cyBhcmUgdGhlbiBldmFsdWF0ZWQgYWdhaW5zdCB0aGUgY29tcG9uZW50IGluc3RhbmNlLlxuICpcbiAqICMjIExpZmVjeWNsZSBob29rc1xuICpcbiAqIFdoZW4gdGhlIGNvbXBvbmVudCBjbGFzcyBpbXBsZW1lbnRzIHNvbWUge0BsaW5rIC4uLy4uL2d1aWRlL2xpZmVjeWNsZS1ob29rcy5odG1sfSB0aGUgY2FsbGJhY2tzXG4gKiBhcmUgY2FsbGVkIGJ5IHRoZSBjaGFuZ2UgZGV0ZWN0aW9uIGF0IGRlZmluZWQgcG9pbnRzIGluIHRpbWUgZHVyaW5nIHRoZSBsaWZlIG9mIHRoZSBjb21wb25lbnQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS90cy9tZXRhZGF0YS9tZXRhZGF0YS50cyByZWdpb249J2NvbXBvbmVudCd9XG4gKi9cbmV4cG9ydCB2YXIgQ29tcG9uZW50OiBDb21wb25lbnRGYWN0b3J5ID1cbiAgICA8Q29tcG9uZW50RmFjdG9yeT5tYWtlRGVjb3JhdG9yKENvbXBvbmVudE1ldGFkYXRhLCAoZm46IGFueSkgPT4gZm4uVmlldyA9IFZpZXcpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIERpcmVjdGl2ZU1ldGFkYXRhLlxuLyoqXG4gKiBEaXJlY3RpdmVzIGFsbG93IHlvdSB0byBhdHRhY2ggYmVoYXZpb3IgdG8gZWxlbWVudHMgaW4gdGhlIERPTS5cbiAqXG4gKiB7QGxpbmsgRGlyZWN0aXZlTWV0YWRhdGF9cyB3aXRoIGFuIGVtYmVkZGVkIHZpZXcgYXJlIGNhbGxlZCB7QGxpbmsgQ29tcG9uZW50TWV0YWRhdGF9cy5cbiAqXG4gKiBBIGRpcmVjdGl2ZSBjb25zaXN0cyBvZiBhIHNpbmdsZSBkaXJlY3RpdmUgYW5ub3RhdGlvbiBhbmQgYSBjb250cm9sbGVyIGNsYXNzLiBXaGVuIHRoZVxuICogZGlyZWN0aXZlJ3MgYHNlbGVjdG9yYCBtYXRjaGVzXG4gKiBlbGVtZW50cyBpbiB0aGUgRE9NLCB0aGUgZm9sbG93aW5nIHN0ZXBzIG9jY3VyOlxuICpcbiAqIDEuIEZvciBlYWNoIGRpcmVjdGl2ZSwgdGhlIGBFbGVtZW50SW5qZWN0b3JgIGF0dGVtcHRzIHRvIHJlc29sdmUgdGhlIGRpcmVjdGl2ZSdzIGNvbnN0cnVjdG9yXG4gKiBhcmd1bWVudHMuXG4gKiAyLiBBbmd1bGFyIGluc3RhbnRpYXRlcyBkaXJlY3RpdmVzIGZvciBlYWNoIG1hdGNoZWQgZWxlbWVudCB1c2luZyBgRWxlbWVudEluamVjdG9yYCBpbiBhXG4gKiBkZXB0aC1maXJzdCBvcmRlcixcbiAqICAgIGFzIGRlY2xhcmVkIGluIHRoZSBIVE1MLlxuICpcbiAqICMjIFVuZGVyc3RhbmRpbmcgSG93IEluamVjdGlvbiBXb3Jrc1xuICpcbiAqIFRoZXJlIGFyZSB0aHJlZSBzdGFnZXMgb2YgaW5qZWN0aW9uIHJlc29sdXRpb24uXG4gKiAtICpQcmUtZXhpc3RpbmcgSW5qZWN0b3JzKjpcbiAqICAgLSBUaGUgdGVybWluYWwge0BsaW5rIEluamVjdG9yfSBjYW5ub3QgcmVzb2x2ZSBkZXBlbmRlbmNpZXMuIEl0IGVpdGhlciB0aHJvd3MgYW4gZXJyb3Igb3IsIGlmXG4gKiB0aGUgZGVwZW5kZW5jeSB3YXNcbiAqICAgICBzcGVjaWZpZWQgYXMgYEBPcHRpb25hbGAsIHJldHVybnMgYG51bGxgLlxuICogICAtIFRoZSBwbGF0Zm9ybSBpbmplY3RvciByZXNvbHZlcyBicm93c2VyIHNpbmdsZXRvbiByZXNvdXJjZXMsIHN1Y2ggYXM6IGNvb2tpZXMsIHRpdGxlLFxuICogbG9jYXRpb24sIGFuZCBvdGhlcnMuXG4gKiAtICpDb21wb25lbnQgSW5qZWN0b3JzKjogRWFjaCBjb21wb25lbnQgaW5zdGFuY2UgaGFzIGl0cyBvd24ge0BsaW5rIEluamVjdG9yfSwgYW5kIHRoZXkgZm9sbG93XG4gKiB0aGUgc2FtZSBwYXJlbnQtY2hpbGQgaGllcmFyY2h5XG4gKiAgICAgYXMgdGhlIGNvbXBvbmVudCBpbnN0YW5jZXMgaW4gdGhlIERPTS5cbiAqIC0gKkVsZW1lbnQgSW5qZWN0b3JzKjogRWFjaCBjb21wb25lbnQgaW5zdGFuY2UgaGFzIGEgU2hhZG93IERPTS4gV2l0aGluIHRoZSBTaGFkb3cgRE9NIGVhY2hcbiAqIGVsZW1lbnQgaGFzIGFuIGBFbGVtZW50SW5qZWN0b3JgXG4gKiAgICAgd2hpY2ggZm9sbG93IHRoZSBzYW1lIHBhcmVudC1jaGlsZCBoaWVyYXJjaHkgYXMgdGhlIERPTSBlbGVtZW50cyB0aGVtc2VsdmVzLlxuICpcbiAqIFdoZW4gYSB0ZW1wbGF0ZSBpcyBpbnN0YW50aWF0ZWQsIGl0IGFsc28gbXVzdCBpbnN0YW50aWF0ZSB0aGUgY29ycmVzcG9uZGluZyBkaXJlY3RpdmVzIGluIGFcbiAqIGRlcHRoLWZpcnN0IG9yZGVyLiBUaGVcbiAqIGN1cnJlbnQgYEVsZW1lbnRJbmplY3RvcmAgcmVzb2x2ZXMgdGhlIGNvbnN0cnVjdG9yIGRlcGVuZGVuY2llcyBmb3IgZWFjaCBkaXJlY3RpdmUuXG4gKlxuICogQW5ndWxhciB0aGVuIHJlc29sdmVzIGRlcGVuZGVuY2llcyBhcyBmb2xsb3dzLCBhY2NvcmRpbmcgdG8gdGhlIG9yZGVyIGluIHdoaWNoIHRoZXkgYXBwZWFyIGluIHRoZVxuICoge0BsaW5rIFZpZXdNZXRhZGF0YX06XG4gKlxuICogMS4gRGVwZW5kZW5jaWVzIG9uIHRoZSBjdXJyZW50IGVsZW1lbnRcbiAqIDIuIERlcGVuZGVuY2llcyBvbiBlbGVtZW50IGluamVjdG9ycyBhbmQgdGhlaXIgcGFyZW50cyB1bnRpbCBpdCBlbmNvdW50ZXJzIGEgU2hhZG93IERPTSBib3VuZGFyeVxuICogMy4gRGVwZW5kZW5jaWVzIG9uIGNvbXBvbmVudCBpbmplY3RvcnMgYW5kIHRoZWlyIHBhcmVudHMgdW50aWwgaXQgZW5jb3VudGVycyB0aGUgcm9vdCBjb21wb25lbnRcbiAqIDQuIERlcGVuZGVuY2llcyBvbiBwcmUtZXhpc3RpbmcgaW5qZWN0b3JzXG4gKlxuICpcbiAqIFRoZSBgRWxlbWVudEluamVjdG9yYCBjYW4gaW5qZWN0IG90aGVyIGRpcmVjdGl2ZXMsIGVsZW1lbnQtc3BlY2lmaWMgc3BlY2lhbCBvYmplY3RzLCBvciBpdCBjYW5cbiAqIGRlbGVnYXRlIHRvIHRoZSBwYXJlbnRcbiAqIGluamVjdG9yLlxuICpcbiAqIFRvIGluamVjdCBvdGhlciBkaXJlY3RpdmVzLCBkZWNsYXJlIHRoZSBjb25zdHJ1Y3RvciBwYXJhbWV0ZXIgYXM6XG4gKiAtIGBkaXJlY3RpdmU6RGlyZWN0aXZlVHlwZWA6IGEgZGlyZWN0aXZlIG9uIHRoZSBjdXJyZW50IGVsZW1lbnQgb25seVxuICogLSBgQEhvc3QoKSBkaXJlY3RpdmU6RGlyZWN0aXZlVHlwZWA6IGFueSBkaXJlY3RpdmUgdGhhdCBtYXRjaGVzIHRoZSB0eXBlIGJldHdlZW4gdGhlIGN1cnJlbnRcbiAqIGVsZW1lbnQgYW5kIHRoZVxuICogICAgU2hhZG93IERPTSByb290LlxuICogLSBgQFF1ZXJ5KERpcmVjdGl2ZVR5cGUpIHF1ZXJ5OlF1ZXJ5TGlzdDxEaXJlY3RpdmVUeXBlPmA6IEEgbGl2ZSBjb2xsZWN0aW9uIG9mIGRpcmVjdCBjaGlsZFxuICogZGlyZWN0aXZlcy5cbiAqIC0gYEBRdWVyeURlc2NlbmRhbnRzKERpcmVjdGl2ZVR5cGUpIHF1ZXJ5OlF1ZXJ5TGlzdDxEaXJlY3RpdmVUeXBlPmA6IEEgbGl2ZSBjb2xsZWN0aW9uIG9mIGFueVxuICogY2hpbGQgZGlyZWN0aXZlcy5cbiAqXG4gKiBUbyBpbmplY3QgZWxlbWVudC1zcGVjaWZpYyBzcGVjaWFsIG9iamVjdHMsIGRlY2xhcmUgdGhlIGNvbnN0cnVjdG9yIHBhcmFtZXRlciBhczpcbiAqIC0gYGVsZW1lbnQ6IEVsZW1lbnRSZWZgIHRvIG9idGFpbiBhIHJlZmVyZW5jZSB0byBsb2dpY2FsIGVsZW1lbnQgaW4gdGhlIHZpZXcuXG4gKiAtIGB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmYCB0byBjb250cm9sIGNoaWxkIHRlbXBsYXRlIGluc3RhbnRpYXRpb24sIGZvclxuICoge0BsaW5rIERpcmVjdGl2ZU1ldGFkYXRhfSBkaXJlY3RpdmVzIG9ubHlcbiAqIC0gYGJpbmRpbmdQcm9wYWdhdGlvbjogQmluZGluZ1Byb3BhZ2F0aW9uYCB0byBjb250cm9sIGNoYW5nZSBkZXRlY3Rpb24gaW4gYSBtb3JlIGdyYW51bGFyIHdheS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBkZW1vbnN0cmF0ZXMgaG93IGRlcGVuZGVuY3kgaW5qZWN0aW9uIHJlc29sdmVzIGNvbnN0cnVjdG9yIGFyZ3VtZW50cyBpblxuICogcHJhY3RpY2UuXG4gKlxuICpcbiAqIEFzc3VtZSB0aGlzIEhUTUwgdGVtcGxhdGU6XG4gKlxuICogYGBgXG4gKiA8ZGl2IGRlcGVuZGVuY3k9XCIxXCI+XG4gKiAgIDxkaXYgZGVwZW5kZW5jeT1cIjJcIj5cbiAqICAgICA8ZGl2IGRlcGVuZGVuY3k9XCIzXCIgbXktZGlyZWN0aXZlPlxuICogICAgICAgPGRpdiBkZXBlbmRlbmN5PVwiNFwiPlxuICogICAgICAgICA8ZGl2IGRlcGVuZGVuY3k9XCI1XCI+PC9kaXY+XG4gKiAgICAgICA8L2Rpdj5cbiAqICAgICAgIDxkaXYgZGVwZW5kZW5jeT1cIjZcIj48L2Rpdj5cbiAqICAgICA8L2Rpdj5cbiAqICAgPC9kaXY+XG4gKiA8L2Rpdj5cbiAqIGBgYFxuICpcbiAqIFdpdGggdGhlIGZvbGxvd2luZyBgZGVwZW5kZW5jeWAgZGVjb3JhdG9yIGFuZCBgU29tZVNlcnZpY2VgIGluamVjdGFibGUgY2xhc3MuXG4gKlxuICogYGBgXG4gKiBASW5qZWN0YWJsZSgpXG4gKiBjbGFzcyBTb21lU2VydmljZSB7XG4gKiB9XG4gKlxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnW2RlcGVuZGVuY3ldJyxcbiAqICAgaW5wdXRzOiBbXG4gKiAgICAgJ2lkOiBkZXBlbmRlbmN5J1xuICogICBdXG4gKiB9KVxuICogY2xhc3MgRGVwZW5kZW5jeSB7XG4gKiAgIGlkOnN0cmluZztcbiAqIH1cbiAqIGBgYFxuICpcbiAqIExldCdzIHN0ZXAgdGhyb3VnaCB0aGUgZGlmZmVyZW50IHdheXMgaW4gd2hpY2ggYE15RGlyZWN0aXZlYCBjb3VsZCBiZSBkZWNsYXJlZC4uLlxuICpcbiAqXG4gKiAjIyMgTm8gaW5qZWN0aW9uXG4gKlxuICogSGVyZSB0aGUgY29uc3RydWN0b3IgaXMgZGVjbGFyZWQgd2l0aCBubyBhcmd1bWVudHMsIHRoZXJlZm9yZSBub3RoaW5nIGlzIGluamVjdGVkIGludG9cbiAqIGBNeURpcmVjdGl2ZWAuXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoKSB7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIHdvdWxkIGJlIGluc3RhbnRpYXRlZCB3aXRoIG5vIGRlcGVuZGVuY2llcy5cbiAqXG4gKlxuICogIyMjIENvbXBvbmVudC1sZXZlbCBpbmplY3Rpb25cbiAqXG4gKiBEaXJlY3RpdmVzIGNhbiBpbmplY3QgYW55IGluamVjdGFibGUgaW5zdGFuY2UgZnJvbSB0aGUgY2xvc2VzdCBjb21wb25lbnQgaW5qZWN0b3Igb3IgYW55IG9mIGl0c1xuICogcGFyZW50cy5cbiAqXG4gKiBIZXJlLCB0aGUgY29uc3RydWN0b3IgZGVjbGFyZXMgYSBwYXJhbWV0ZXIsIGBzb21lU2VydmljZWAsIGFuZCBpbmplY3RzIHRoZSBgU29tZVNlcnZpY2VgIHR5cGVcbiAqIGZyb20gdGhlIHBhcmVudFxuICogY29tcG9uZW50J3MgaW5qZWN0b3IuXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3Rvcihzb21lU2VydmljZTogU29tZVNlcnZpY2UpIHtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggYSBkZXBlbmRlbmN5IG9uIGBTb21lU2VydmljZWAuXG4gKlxuICpcbiAqICMjIyBJbmplY3RpbmcgYSBkaXJlY3RpdmUgZnJvbSB0aGUgY3VycmVudCBlbGVtZW50XG4gKlxuICogRGlyZWN0aXZlcyBjYW4gaW5qZWN0IG90aGVyIGRpcmVjdGl2ZXMgZGVjbGFyZWQgb24gdGhlIGN1cnJlbnQgZWxlbWVudC5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihkZXBlbmRlbmN5OiBEZXBlbmRlbmN5KSB7XG4gKiAgICAgZXhwZWN0KGRlcGVuZGVuY3kuaWQpLnRvRXF1YWwoMyk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggYERlcGVuZGVuY3lgIGRlY2xhcmVkIGF0IHRoZSBzYW1lIGVsZW1lbnQsIGluIHRoaXMgY2FzZVxuICogYGRlcGVuZGVuY3k9XCIzXCJgLlxuICpcbiAqICMjIyBJbmplY3RpbmcgYSBkaXJlY3RpdmUgZnJvbSBhbnkgYW5jZXN0b3IgZWxlbWVudHNcbiAqXG4gKiBEaXJlY3RpdmVzIGNhbiBpbmplY3Qgb3RoZXIgZGlyZWN0aXZlcyBkZWNsYXJlZCBvbiBhbnkgYW5jZXN0b3IgZWxlbWVudCAoaW4gdGhlIGN1cnJlbnQgU2hhZG93XG4gKiBET00pLCBpLmUuIG9uIHRoZSBjdXJyZW50IGVsZW1lbnQsIHRoZVxuICogcGFyZW50IGVsZW1lbnQsIG9yIGl0cyBwYXJlbnRzLlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoQEhvc3QoKSBkZXBlbmRlbmN5OiBEZXBlbmRlbmN5KSB7XG4gKiAgICAgZXhwZWN0KGRlcGVuZGVuY3kuaWQpLnRvRXF1YWwoMik7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIGBASG9zdGAgY2hlY2tzIHRoZSBjdXJyZW50IGVsZW1lbnQsIHRoZSBwYXJlbnQsIGFzIHdlbGwgYXMgaXRzIHBhcmVudHMgcmVjdXJzaXZlbHkuIElmXG4gKiBgZGVwZW5kZW5jeT1cIjJcImAgZGlkbid0XG4gKiBleGlzdCBvbiB0aGUgZGlyZWN0IHBhcmVudCwgdGhpcyBpbmplY3Rpb24gd291bGRcbiAqIGhhdmUgcmV0dXJuZWRcbiAqIGBkZXBlbmRlbmN5PVwiMVwiYC5cbiAqXG4gKlxuICogIyMjIEluamVjdGluZyBhIGxpdmUgY29sbGVjdGlvbiBvZiBkaXJlY3QgY2hpbGQgZGlyZWN0aXZlc1xuICpcbiAqXG4gKiBBIGRpcmVjdGl2ZSBjYW4gYWxzbyBxdWVyeSBmb3Igb3RoZXIgY2hpbGQgZGlyZWN0aXZlcy4gU2luY2UgcGFyZW50IGRpcmVjdGl2ZXMgYXJlIGluc3RhbnRpYXRlZFxuICogYmVmb3JlIGNoaWxkIGRpcmVjdGl2ZXMsIGEgZGlyZWN0aXZlIGNhbid0IHNpbXBseSBpbmplY3QgdGhlIGxpc3Qgb2YgY2hpbGQgZGlyZWN0aXZlcy4gSW5zdGVhZCxcbiAqIHRoZSBkaXJlY3RpdmUgaW5qZWN0cyBhIHtAbGluayBRdWVyeUxpc3R9LCB3aGljaCB1cGRhdGVzIGl0cyBjb250ZW50cyBhcyBjaGlsZHJlbiBhcmUgYWRkZWQsXG4gKiByZW1vdmVkLCBvciBtb3ZlZCBieSBhIGRpcmVjdGl2ZSB0aGF0IHVzZXMgYSB7QGxpbmsgVmlld0NvbnRhaW5lclJlZn0gc3VjaCBhcyBhIGBuZ0ZvcmAsIGFuXG4gKiBgbmdJZmAsIG9yIGFuIGBuZ1N3aXRjaGAuXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KERlcGVuZGVuY3kpIGRlcGVuZGVuY2llczpRdWVyeUxpc3Q8RGVwZW5kZW5jeT4pIHtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggYSB7QGxpbmsgUXVlcnlMaXN0fSB3aGljaCBjb250YWlucyBgRGVwZW5kZW5jeWAgNCBhbmRcbiAqIDYuIEhlcmUsIGBEZXBlbmRlbmN5YCA1IHdvdWxkIG5vdCBiZSBpbmNsdWRlZCwgYmVjYXVzZSBpdCBpcyBub3QgYSBkaXJlY3QgY2hpbGQuXG4gKlxuICogIyMjIEluamVjdGluZyBhIGxpdmUgY29sbGVjdGlvbiBvZiBkZXNjZW5kYW50IGRpcmVjdGl2ZXNcbiAqXG4gKiBCeSBwYXNzaW5nIHRoZSBkZXNjZW5kYW50IGZsYWcgdG8gYEBRdWVyeWAgYWJvdmUsIHdlIGNhbiBpbmNsdWRlIHRoZSBjaGlsZHJlbiBvZiB0aGUgY2hpbGRcbiAqIGVsZW1lbnRzLlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeShEZXBlbmRlbmN5LCB7ZGVzY2VuZGFudHM6IHRydWV9KSBkZXBlbmRlbmNpZXM6UXVlcnlMaXN0PERlcGVuZGVuY3k+KSB7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIHdvdWxkIGJlIGluc3RhbnRpYXRlZCB3aXRoIGEgUXVlcnkgd2hpY2ggd291bGQgY29udGFpbiBgRGVwZW5kZW5jeWAgNCwgNSBhbmQgNi5cbiAqXG4gKiAjIyMgT3B0aW9uYWwgaW5qZWN0aW9uXG4gKlxuICogVGhlIG5vcm1hbCBiZWhhdmlvciBvZiBkaXJlY3RpdmVzIGlzIHRvIHJldHVybiBhbiBlcnJvciB3aGVuIGEgc3BlY2lmaWVkIGRlcGVuZGVuY3kgY2Fubm90IGJlXG4gKiByZXNvbHZlZC4gSWYgeW91XG4gKiB3b3VsZCBsaWtlIHRvIGluamVjdCBgbnVsbGAgb24gdW5yZXNvbHZlZCBkZXBlbmRlbmN5IGluc3RlYWQsIHlvdSBjYW4gYW5ub3RhdGUgdGhhdCBkZXBlbmRlbmN5XG4gKiB3aXRoIGBAT3B0aW9uYWwoKWAuXG4gKiBUaGlzIGV4cGxpY2l0bHkgcGVybWl0cyB0aGUgYXV0aG9yIG9mIGEgdGVtcGxhdGUgdG8gdHJlYXQgc29tZSBvZiB0aGUgc3Vycm91bmRpbmcgZGlyZWN0aXZlcyBhc1xuICogb3B0aW9uYWwuXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgZGVwZW5kZW5jeTpEZXBlbmRlbmN5KSB7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIHdvdWxkIGJlIGluc3RhbnRpYXRlZCB3aXRoIGEgYERlcGVuZGVuY3lgIGRpcmVjdGl2ZSBmb3VuZCBvbiB0aGUgY3VycmVudCBlbGVtZW50LlxuICogSWYgbm9uZSBjYW4gYmVcbiAqIGZvdW5kLCB0aGUgaW5qZWN0b3Igc3VwcGxpZXMgYG51bGxgIGluc3RlYWQgb2YgdGhyb3dpbmcgYW4gZXJyb3IuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBIZXJlIHdlIHVzZSBhIGRlY29yYXRvciBkaXJlY3RpdmUgdG8gc2ltcGx5IGRlZmluZSBiYXNpYyB0b29sLXRpcCBiZWhhdmlvci5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ1t0b29sdGlwXScsXG4gKiAgIGlucHV0czogW1xuICogICAgICd0ZXh0OiB0b29sdGlwJ1xuICogICBdLFxuICogICBob3N0OiB7XG4gKiAgICAgJyhtb3VzZWVudGVyKSc6ICdvbk1vdXNlRW50ZXIoKScsXG4gKiAgICAgJyhtb3VzZWxlYXZlKSc6ICdvbk1vdXNlTGVhdmUoKSdcbiAqICAgfVxuICogfSlcbiAqIGNsYXNzIFRvb2x0aXB7XG4gKiAgIHRleHQ6c3RyaW5nO1xuICogICBvdmVybGF5Ok92ZXJsYXk7IC8vIE5PVCBZRVQgSU1QTEVNRU5URURcbiAqICAgb3ZlcmxheU1hbmFnZXI6T3ZlcmxheU1hbmFnZXI7IC8vIE5PVCBZRVQgSU1QTEVNRU5URURcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKG92ZXJsYXlNYW5hZ2VyOk92ZXJsYXlNYW5hZ2VyKSB7XG4gKiAgICAgdGhpcy5vdmVybGF5ID0gb3ZlcmxheTtcbiAqICAgfVxuICpcbiAqICAgb25Nb3VzZUVudGVyKCkge1xuICogICAgIC8vIGV4YWN0IHNpZ25hdHVyZSB0byBiZSBkZXRlcm1pbmVkXG4gKiAgICAgdGhpcy5vdmVybGF5ID0gdGhpcy5vdmVybGF5TWFuYWdlci5vcGVuKHRleHQsIC4uLik7XG4gKiAgIH1cbiAqXG4gKiAgIG9uTW91c2VMZWF2ZSgpIHtcbiAqICAgICB0aGlzLm92ZXJsYXkuY2xvc2UoKTtcbiAqICAgICB0aGlzLm92ZXJsYXkgPSBudWxsO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqIEluIG91ciBIVE1MIHRlbXBsYXRlLCB3ZSBjYW4gdGhlbiBhZGQgdGhpcyBiZWhhdmlvciB0byBhIGA8ZGl2PmAgb3IgYW55IG90aGVyIGVsZW1lbnQgd2l0aCB0aGVcbiAqIGB0b29sdGlwYCBzZWxlY3RvcixcbiAqIGxpa2Ugc286XG4gKlxuICogYGBgXG4gKiA8ZGl2IHRvb2x0aXA9XCJzb21lIHRleHQgaGVyZVwiPjwvZGl2PlxuICogYGBgXG4gKlxuICogRGlyZWN0aXZlcyBjYW4gYWxzbyBjb250cm9sIHRoZSBpbnN0YW50aWF0aW9uLCBkZXN0cnVjdGlvbiwgYW5kIHBvc2l0aW9uaW5nIG9mIGlubGluZSB0ZW1wbGF0ZVxuICogZWxlbWVudHM6XG4gKlxuICogQSBkaXJlY3RpdmUgdXNlcyBhIHtAbGluayBWaWV3Q29udGFpbmVyUmVmfSB0byBpbnN0YW50aWF0ZSwgaW5zZXJ0LCBtb3ZlLCBhbmQgZGVzdHJveSB2aWV3cyBhdFxuICogcnVudGltZS5cbiAqIFRoZSB7QGxpbmsgVmlld0NvbnRhaW5lclJlZn0gaXMgY3JlYXRlZCBhcyBhIHJlc3VsdCBvZiBgPHRlbXBsYXRlPmAgZWxlbWVudCwgYW5kIHJlcHJlc2VudHMgYVxuICogbG9jYXRpb24gaW4gdGhlIGN1cnJlbnQgdmlld1xuICogd2hlcmUgdGhlc2UgYWN0aW9ucyBhcmUgcGVyZm9ybWVkLlxuICpcbiAqIFZpZXdzIGFyZSBhbHdheXMgY3JlYXRlZCBhcyBjaGlsZHJlbiBvZiB0aGUgY3VycmVudCB7QGxpbmsgVmlld01ldGFkYXRhfSwgYW5kIGFzIHNpYmxpbmdzIG9mIHRoZVxuICogYDx0ZW1wbGF0ZT5gIGVsZW1lbnQuIFRodXMgYVxuICogZGlyZWN0aXZlIGluIGEgY2hpbGQgdmlldyBjYW5ub3QgaW5qZWN0IHRoZSBkaXJlY3RpdmUgdGhhdCBjcmVhdGVkIGl0LlxuICpcbiAqIFNpbmNlIGRpcmVjdGl2ZXMgdGhhdCBjcmVhdGUgdmlld3MgdmlhIFZpZXdDb250YWluZXJzIGFyZSBjb21tb24gaW4gQW5ndWxhciwgYW5kIHVzaW5nIHRoZSBmdWxsXG4gKiBgPHRlbXBsYXRlPmAgZWxlbWVudCBzeW50YXggaXMgd29yZHksIEFuZ3VsYXJcbiAqIGFsc28gc3VwcG9ydHMgYSBzaG9ydGhhbmQgbm90YXRpb246IGA8bGkgKmZvbz1cImJhclwiPmAgYW5kIGA8bGkgdGVtcGxhdGU9XCJmb286IGJhclwiPmAgYXJlXG4gKiBlcXVpdmFsZW50LlxuICpcbiAqIFRodXMsXG4gKlxuICogYGBgXG4gKiA8dWw+XG4gKiAgIDxsaSAqZm9vPVwiYmFyXCIgdGl0bGU9XCJ0ZXh0XCI+PC9saT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBFeHBhbmRzIGluIHVzZSB0bzpcbiAqXG4gKiBgYGBcbiAqIDx1bD5cbiAqICAgPHRlbXBsYXRlIFtmb29dPVwiYmFyXCI+XG4gKiAgICAgPGxpIHRpdGxlPVwidGV4dFwiPjwvbGk+XG4gKiAgIDwvdGVtcGxhdGU+XG4gKiA8L3VsPlxuICogYGBgXG4gKlxuICogTm90aWNlIHRoYXQgYWx0aG91Z2ggdGhlIHNob3J0aGFuZCBwbGFjZXMgYCpmb289XCJiYXJcImAgd2l0aGluIHRoZSBgPGxpPmAgZWxlbWVudCwgdGhlIGJpbmRpbmcgZm9yXG4gKiB0aGUgZGlyZWN0aXZlXG4gKiBjb250cm9sbGVyIGlzIGNvcnJlY3RseSBpbnN0YW50aWF0ZWQgb24gdGhlIGA8dGVtcGxhdGU+YCBlbGVtZW50IHJhdGhlciB0aGFuIHRoZSBgPGxpPmAgZWxlbWVudC5cbiAqXG4gKiAjIyBMaWZlY3ljbGUgaG9va3NcbiAqXG4gKiBXaGVuIHRoZSBkaXJlY3RpdmUgY2xhc3MgaW1wbGVtZW50cyBzb21lIHtAbGluayAuLi8uLi9ndWlkZS9saWZlY3ljbGUtaG9va3MuaHRtbH0gdGhlIGNhbGxiYWNrc1xuICogYXJlIGNhbGxlZCBieSB0aGUgY2hhbmdlIGRldGVjdGlvbiBhdCBkZWZpbmVkIHBvaW50cyBpbiB0aW1lIGR1cmluZyB0aGUgbGlmZSBvZiB0aGUgZGlyZWN0aXZlLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogTGV0J3Mgc3VwcG9zZSB3ZSB3YW50IHRvIGltcGxlbWVudCB0aGUgYHVubGVzc2AgYmVoYXZpb3IsIHRvIGNvbmRpdGlvbmFsbHkgaW5jbHVkZSBhIHRlbXBsYXRlLlxuICpcbiAqIEhlcmUgaXMgYSBzaW1wbGUgZGlyZWN0aXZlIHRoYXQgdHJpZ2dlcnMgb24gYW4gYHVubGVzc2Agc2VsZWN0b3I6XG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdbdW5sZXNzXScsXG4gKiAgIGlucHV0czogWyd1bmxlc3MnXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBVbmxlc3Mge1xuICogICB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmO1xuICogICB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY7XG4gKiAgIHByZXZDb25kaXRpb246IGJvb2xlYW47XG4gKlxuICogICBjb25zdHJ1Y3Rvcih2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWYpIHtcbiAqICAgICB0aGlzLnZpZXdDb250YWluZXIgPSB2aWV3Q29udGFpbmVyO1xuICogICAgIHRoaXMudGVtcGxhdGVSZWYgPSB0ZW1wbGF0ZVJlZjtcbiAqICAgICB0aGlzLnByZXZDb25kaXRpb24gPSBudWxsO1xuICogICB9XG4gKlxuICogICBzZXQgdW5sZXNzKG5ld0NvbmRpdGlvbikge1xuICogICAgIGlmIChuZXdDb25kaXRpb24gJiYgKGlzQmxhbmsodGhpcy5wcmV2Q29uZGl0aW9uKSB8fCAhdGhpcy5wcmV2Q29uZGl0aW9uKSkge1xuICogICAgICAgdGhpcy5wcmV2Q29uZGl0aW9uID0gdHJ1ZTtcbiAqICAgICAgIHRoaXMudmlld0NvbnRhaW5lci5jbGVhcigpO1xuICogICAgIH0gZWxzZSBpZiAoIW5ld0NvbmRpdGlvbiAmJiAoaXNCbGFuayh0aGlzLnByZXZDb25kaXRpb24pIHx8IHRoaXMucHJldkNvbmRpdGlvbikpIHtcbiAqICAgICAgIHRoaXMucHJldkNvbmRpdGlvbiA9IGZhbHNlO1xuICogICAgICAgdGhpcy52aWV3Q29udGFpbmVyLmNyZWF0ZSh0aGlzLnRlbXBsYXRlUmVmKTtcbiAqICAgICB9XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFdlIGNhbiB0aGVuIHVzZSB0aGlzIGB1bmxlc3NgIHNlbGVjdG9yIGluIGEgdGVtcGxhdGU6XG4gKiBgYGBcbiAqIDx1bD5cbiAqICAgPGxpICp1bmxlc3M9XCJleHByXCI+PC9saT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBPbmNlIHRoZSBkaXJlY3RpdmUgaW5zdGFudGlhdGVzIHRoZSBjaGlsZCB2aWV3LCB0aGUgc2hvcnRoYW5kIG5vdGF0aW9uIGZvciB0aGUgdGVtcGxhdGUgZXhwYW5kc1xuICogYW5kIHRoZSByZXN1bHQgaXM6XG4gKlxuICogYGBgXG4gKiA8dWw+XG4gKiAgIDx0ZW1wbGF0ZSBbdW5sZXNzXT1cImV4cFwiPlxuICogICAgIDxsaT48L2xpPlxuICogICA8L3RlbXBsYXRlPlxuICogICA8bGk+PC9saT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBOb3RlIGFsc28gdGhhdCBhbHRob3VnaCB0aGUgYDxsaT48L2xpPmAgdGVtcGxhdGUgc3RpbGwgZXhpc3RzIGluc2lkZSB0aGUgYDx0ZW1wbGF0ZT48L3RlbXBsYXRlPmAsXG4gKiB0aGUgaW5zdGFudGlhdGVkXG4gKiB2aWV3IG9jY3VycyBvbiB0aGUgc2Vjb25kIGA8bGk+PC9saT5gIHdoaWNoIGlzIGEgc2libGluZyB0byB0aGUgYDx0ZW1wbGF0ZT5gIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCB2YXIgRGlyZWN0aXZlOiBEaXJlY3RpdmVGYWN0b3J5ID0gPERpcmVjdGl2ZUZhY3Rvcnk+bWFrZURlY29yYXRvcihEaXJlY3RpdmVNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gVmlld01ldGFkYXRhLlxuLyoqXG4gKiBNZXRhZGF0YSBwcm9wZXJ0aWVzIGF2YWlsYWJsZSBmb3IgY29uZmlndXJpbmcgVmlld3MuXG4gKlxuICogRWFjaCBBbmd1bGFyIGNvbXBvbmVudCByZXF1aXJlcyBhIHNpbmdsZSBgQENvbXBvbmVudGAgYW5kIGF0IGxlYXN0IG9uZSBgQFZpZXdgIGFubm90YXRpb24uIFRoZVxuICogYEBWaWV3YCBhbm5vdGF0aW9uIHNwZWNpZmllcyB0aGUgSFRNTCB0ZW1wbGF0ZSB0byB1c2UsIGFuZCBsaXN0cyB0aGUgZGlyZWN0aXZlcyB0aGF0IGFyZSBhY3RpdmVcbiAqIHdpdGhpbiB0aGUgdGVtcGxhdGUuXG4gKlxuICogV2hlbiBhIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQsIHRoZSB0ZW1wbGF0ZSBpcyBsb2FkZWQgaW50byB0aGUgY29tcG9uZW50J3Mgc2hhZG93IHJvb3QsIGFuZFxuICogdGhlIGV4cHJlc3Npb25zIGFuZCBzdGF0ZW1lbnRzIGluIHRoZSB0ZW1wbGF0ZSBhcmUgZXZhbHVhdGVkIGFnYWluc3QgdGhlIGNvbXBvbmVudC5cbiAqXG4gKiBGb3IgZGV0YWlscyBvbiB0aGUgYEBDb21wb25lbnRgIGFubm90YXRpb24sIHNlZSB7QGxpbmsgQ29tcG9uZW50TWV0YWRhdGF9LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdncmVldCcsXG4gKiAgIHRlbXBsYXRlOiAnSGVsbG8ge3tuYW1lfX0hJyxcbiAqICAgZGlyZWN0aXZlczogW0dyZWV0VXNlciwgQm9sZF1cbiAqIH0pXG4gKiBjbGFzcyBHcmVldCB7XG4gKiAgIG5hbWU6IHN0cmluZztcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKCkge1xuICogICAgIHRoaXMubmFtZSA9ICdXb3JsZCc7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG52YXIgVmlldzogVmlld0ZhY3RvcnkgPSA8Vmlld0ZhY3Rvcnk+bWFrZURlY29yYXRvcihWaWV3TWV0YWRhdGEsIChmbjogYW55KSA9PiBmbi5WaWV3ID0gVmlldyk7XG5cbi8qKlxuICogU3BlY2lmaWVzIHRoYXQgYSBjb25zdGFudCBhdHRyaWJ1dGUgdmFsdWUgc2hvdWxkIGJlIGluamVjdGVkLlxuICpcbiAqIFRoZSBkaXJlY3RpdmUgY2FuIGluamVjdCBjb25zdGFudCBzdHJpbmcgbGl0ZXJhbHMgb2YgaG9zdCBlbGVtZW50IGF0dHJpYnV0ZXMuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBTdXBwb3NlIHdlIGhhdmUgYW4gYDxpbnB1dD5gIGVsZW1lbnQgYW5kIHdhbnQgdG8ga25vdyBpdHMgYHR5cGVgLlxuICpcbiAqIGBgYGh0bWxcbiAqIDxpbnB1dCB0eXBlPVwidGV4dFwiPlxuICogYGBgXG4gKlxuICogQSBkZWNvcmF0b3IgY2FuIGluamVjdCBzdHJpbmcgbGl0ZXJhbCBgdGV4dGAgbGlrZSBzbzpcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS90cy9tZXRhZGF0YS9tZXRhZGF0YS50cyByZWdpb249J2F0dHJpYnV0ZU1ldGFkYXRhJ31cbiAqL1xuZXhwb3J0IHZhciBBdHRyaWJ1dGU6IEF0dHJpYnV0ZUZhY3RvcnkgPSBtYWtlUGFyYW1EZWNvcmF0b3IoQXR0cmlidXRlTWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIFF1ZXJ5TWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmVzIGFuIGluamVjdGFibGUgcGFyYW1ldGVyIHRvIGJlIGEgbGl2ZSBsaXN0IG9mIGRpcmVjdGl2ZXMgb3IgdmFyaWFibGVcbiAqIGJpbmRpbmdzIGZyb20gdGhlIGNvbnRlbnQgY2hpbGRyZW4gb2YgYSBkaXJlY3RpdmUuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2xZOW04SEx5N3owNnZEb1VhU04yP3A9cHJldmlldykpXG4gKlxuICogQXNzdW1lIHRoYXQgYDx0YWJzPmAgY29tcG9uZW50IHdvdWxkIGxpa2UgdG8gZ2V0IGEgbGlzdCBpdHMgY2hpbGRyZW4gYDxwYW5lPmBcbiAqIGNvbXBvbmVudHMgYXMgc2hvd24gaW4gdGhpcyBleGFtcGxlOlxuICpcbiAqIGBgYGh0bWxcbiAqIDx0YWJzPlxuICogICA8cGFuZSB0aXRsZT1cIk92ZXJ2aWV3XCI+Li4uPC9wYW5lPlxuICogICA8cGFuZSAqbmdGb3I9XCIjbyBvZiBvYmplY3RzXCIgW3RpdGxlXT1cIm8udGl0bGVcIj57e28udGV4dH19PC9wYW5lPlxuICogPC90YWJzPlxuICogYGBgXG4gKlxuICogVGhlIHByZWZlcnJlZCBzb2x1dGlvbiBpcyB0byBxdWVyeSBmb3IgYFBhbmVgIGRpcmVjdGl2ZXMgdXNpbmcgdGhpcyBkZWNvcmF0b3IuXG4gKlxuICogYGBgamF2YXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAncGFuZScsXG4gKiAgIGlucHV0czogWyd0aXRsZSddXG4gKiB9KVxuICogY2xhc3MgUGFuZSB7XG4gKiAgIHRpdGxlOnN0cmluZztcbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICBzZWxlY3RvcjogJ3RhYnMnLFxuICogIHRlbXBsYXRlOiBgXG4gKiAgICA8dWw+XG4gKiAgICAgIDxsaSAqbmdGb3I9XCIjcGFuZSBvZiBwYW5lc1wiPnt7cGFuZS50aXRsZX19PC9saT5cbiAqICAgIDwvdWw+XG4gKiAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4gKiAgYFxuICogfSlcbiAqIGNsYXNzIFRhYnMge1xuICogICBwYW5lczogUXVlcnlMaXN0PFBhbmU+O1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoUGFuZSkgcGFuZXM6UXVlcnlMaXN0PFBhbmU+KSB7XG4gKiAgICAgdGhpcy5wYW5lcyA9IHBhbmVzO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBBIHF1ZXJ5IGNhbiBsb29rIGZvciB2YXJpYWJsZSBiaW5kaW5ncyBieSBwYXNzaW5nIGluIGEgc3RyaW5nIHdpdGggZGVzaXJlZCBiaW5kaW5nIHN5bWJvbC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvc1QyajI1Y0gxZFVSQXlCUkNLeDE/cD1wcmV2aWV3KSlcbiAqIGBgYGh0bWxcbiAqIDxzZWVrZXI+XG4gKiAgIDxkaXYgI2ZpbmRtZT4uLi48L2Rpdj5cbiAqIDwvc2Vla2VyPlxuICpcbiAqIEBDb21wb25lbnQoeyBzZWxlY3RvcjogJ3NlZWtlcicgfSlcbiAqIGNsYXNzIHNlZWtlciB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeSgnZmluZG1lJykgZWxMaXN0OiBRdWVyeUxpc3Q8RWxlbWVudFJlZj4pIHsuLi59XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBJbiB0aGlzIGNhc2UgdGhlIG9iamVjdCB0aGF0IGlzIGluamVjdGVkIGRlcGVuZCBvbiB0aGUgdHlwZSBvZiB0aGUgdmFyaWFibGVcbiAqIGJpbmRpbmcuIEl0IGNhbiBiZSBhbiBFbGVtZW50UmVmLCBhIGRpcmVjdGl2ZSBvciBhIGNvbXBvbmVudC5cbiAqXG4gKiBQYXNzaW5nIGluIGEgY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgdmFyaWFibGUgYmluZGluZ3Mgd2lsbCBxdWVyeSBmb3IgYWxsIG9mIHRoZW0uXG4gKlxuICogYGBgaHRtbFxuICogPHNlZWtlcj5cbiAqICAgPGRpdiAjZmluZE1lPi4uLjwvZGl2PlxuICogICA8ZGl2ICNmaW5kTWVUb28+Li4uPC9kaXY+XG4gKiA8L3NlZWtlcj5cbiAqXG4gKiAgQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnc2Vla2VyJ1xuICogfSlcbiAqIGNsYXNzIFNlZWtlciB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeSgnZmluZE1lLCBmaW5kTWVUb28nKSBlbExpc3Q6IFF1ZXJ5TGlzdDxFbGVtZW50UmVmPikgey4uLn1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIENvbmZpZ3VyZSB3aGV0aGVyIHF1ZXJ5IGxvb2tzIGZvciBkaXJlY3QgY2hpbGRyZW4gb3IgYWxsIGRlc2NlbmRhbnRzXG4gKiBvZiB0aGUgcXVlcnlpbmcgZWxlbWVudCwgYnkgdXNpbmcgdGhlIGBkZXNjZW5kYW50c2AgcGFyYW1ldGVyLlxuICogSXQgaXMgc2V0IHRvIGBmYWxzZWAgYnkgZGVmYXVsdC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvd3RHZUI5NzdidjdxdkE1RlRZbDk/cD1wcmV2aWV3KSlcbiAqIGBgYGh0bWxcbiAqIDxjb250YWluZXIgI2ZpcnN0PlxuICogICA8aXRlbT5hPC9pdGVtPlxuICogICA8aXRlbT5iPC9pdGVtPlxuICogICA8Y29udGFpbmVyICNzZWNvbmQ+XG4gKiAgICAgPGl0ZW0+YzwvaXRlbT5cbiAqICAgPC9jb250YWluZXI+XG4gKiA8L2NvbnRhaW5lcj5cbiAqIGBgYFxuICpcbiAqIFdoZW4gcXVlcnlpbmcgZm9yIGl0ZW1zLCB0aGUgZmlyc3QgY29udGFpbmVyIHdpbGwgc2VlIG9ubHkgYGFgIGFuZCBgYmAgYnkgZGVmYXVsdCxcbiAqIGJ1dCB3aXRoIGBRdWVyeShUZXh0RGlyZWN0aXZlLCB7ZGVzY2VuZGFudHM6IHRydWV9KWAgaXQgd2lsbCBzZWUgYGNgIHRvby5cbiAqXG4gKiBUaGUgcXVlcmllZCBkaXJlY3RpdmVzIGFyZSBrZXB0IGluIGEgZGVwdGgtZmlyc3QgcHJlLW9yZGVyIHdpdGggcmVzcGVjdCB0byB0aGVpclxuICogcG9zaXRpb25zIGluIHRoZSBET00uXG4gKlxuICogUXVlcnkgZG9lcyBub3QgbG9vayBkZWVwIGludG8gYW55IHN1YmNvbXBvbmVudCB2aWV3cy5cbiAqXG4gKiBRdWVyeSBpcyB1cGRhdGVkIGFzIHBhcnQgb2YgdGhlIGNoYW5nZS1kZXRlY3Rpb24gY3ljbGUuIFNpbmNlIGNoYW5nZSBkZXRlY3Rpb25cbiAqIGhhcHBlbnMgYWZ0ZXIgY29uc3RydWN0aW9uIG9mIGEgZGlyZWN0aXZlLCBRdWVyeUxpc3Qgd2lsbCBhbHdheXMgYmUgZW1wdHkgd2hlbiBvYnNlcnZlZCBpbiB0aGVcbiAqIGNvbnN0cnVjdG9yLlxuICpcbiAqIFRoZSBpbmplY3RlZCBvYmplY3QgaXMgYW4gdW5tb2RpZmlhYmxlIGxpdmUgbGlzdC5cbiAqIFNlZSB7QGxpbmsgUXVlcnlMaXN0fSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5leHBvcnQgdmFyIFF1ZXJ5OiBRdWVyeUZhY3RvcnkgPSBtYWtlUGFyYW1EZWNvcmF0b3IoUXVlcnlNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gQ29udGVudENoaWxkcmVuTWV0YWRhdGEuXG4vKipcbiAqIENvbmZpZ3VyZXMgYSBjb250ZW50IHF1ZXJ5LlxuICpcbiAqIENvbnRlbnQgcXVlcmllcyBhcmUgc2V0IGJlZm9yZSB0aGUgYG5nQWZ0ZXJDb250ZW50SW5pdGAgY2FsbGJhY2sgaXMgY2FsbGVkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdzb21lRGlyJ1xuICogfSlcbiAqIGNsYXNzIFNvbWVEaXIge1xuICogICBAQ29udGVudENoaWxkcmVuKENoaWxkRGlyZWN0aXZlKSBjb250ZW50Q2hpbGRyZW46IFF1ZXJ5TGlzdDxDaGlsZERpcmVjdGl2ZT47XG4gKlxuICogICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gKiAgICAgLy8gY29udGVudENoaWxkcmVuIGlzIHNldFxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHZhciBDb250ZW50Q2hpbGRyZW46IENvbnRlbnRDaGlsZHJlbkZhY3RvcnkgPSBtYWtlUHJvcERlY29yYXRvcihDb250ZW50Q2hpbGRyZW5NZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gQ29udGVudENoaWxkTWV0YWRhdGEuXG4vKipcbiAqIENvbmZpZ3VyZXMgYSBjb250ZW50IHF1ZXJ5LlxuICpcbiAqIENvbnRlbnQgcXVlcmllcyBhcmUgc2V0IGJlZm9yZSB0aGUgYG5nQWZ0ZXJDb250ZW50SW5pdGAgY2FsbGJhY2sgaXMgY2FsbGVkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdzb21lRGlyJ1xuICogfSlcbiAqIGNsYXNzIFNvbWVEaXIge1xuICogICBAQ29udGVudENoaWxkKENoaWxkRGlyZWN0aXZlKSBjb250ZW50Q2hpbGQ7XG4gKlxuICogICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gKiAgICAgLy8gY29udGVudENoaWxkIGlzIHNldFxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHZhciBDb250ZW50Q2hpbGQ6IENvbnRlbnRDaGlsZEZhY3RvcnkgPSBtYWtlUHJvcERlY29yYXRvcihDb250ZW50Q2hpbGRNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gVmlld0NoaWxkcmVuTWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmVzIGEgbGlzdCBvZiBjaGlsZCBlbGVtZW50IHJlZmVyZW5jZXMuXG4gKlxuICogQW5ndWxhciBhdXRvbWF0aWNhbGx5IHVwZGF0ZXMgdGhlIGxpc3Qgd2hlbiB0aGUgRE9NIGlzIHVwZGF0ZWQuXG4gKlxuICogYFZpZXdDaGlsZHJlbmAgdGFrZXMgYSBhcmd1bWVudCB0byBzZWxlY3QgZWxlbWVudHMuXG4gKlxuICogLSBJZiB0aGUgYXJndW1lbnQgaXMgYSB0eXBlLCBkaXJlY3RpdmVzIG9yIGNvbXBvbmVudHMgd2l0aCB0aGUgdHlwZSB3aWxsIGJlIGJvdW5kLlxuICpcbiAqIC0gSWYgdGhlIGFyZ3VtZW50IGlzIGEgc3RyaW5nLCB0aGUgc3RyaW5nIGlzIGludGVycHJldGVkIGFzIGEgbGlzdCBvZiBjb21tYS1zZXBhcmF0ZWQgc2VsZWN0b3JzLlxuICogRm9yIGVhY2ggc2VsZWN0b3IsIGFuIGVsZW1lbnQgY29udGFpbmluZyB0aGUgbWF0Y2hpbmcgdGVtcGxhdGUgdmFyaWFibGUgKGUuZy4gYCNjaGlsZGApIHdpbGwgYmVcbiAqIGJvdW5kLlxuICpcbiAqIFZpZXcgY2hpbGRyZW4gYXJlIHNldCBiZWZvcmUgdGhlIGBuZ0FmdGVyVmlld0luaXRgIGNhbGxiYWNrIGlzIGNhbGxlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFdpdGggdHlwZSBzZWxlY3RvcjpcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2NoaWxkLWNtcCcsXG4gKiAgIHRlbXBsYXRlOiAnPHA+Y2hpbGQ8L3A+J1xuICogfSlcbiAqIGNsYXNzIENoaWxkQ21wIHtcbiAqICAgZG9Tb21ldGhpbmcoKSB7fVxuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3NvbWUtY21wJyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8Y2hpbGQtY21wPjwvY2hpbGQtY21wPlxuICogICAgIDxjaGlsZC1jbXA+PC9jaGlsZC1jbXA+XG4gKiAgICAgPGNoaWxkLWNtcD48L2NoaWxkLWNtcD5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW0NoaWxkQ21wXVxuICogfSlcbiAqIGNsYXNzIFNvbWVDbXAge1xuICogICBAVmlld0NoaWxkcmVuKENoaWxkQ21wKSBjaGlsZHJlbjpRdWVyeUxpc3Q8Q2hpbGRDbXA+O1xuICpcbiAqICAgbmdBZnRlclZpZXdJbml0KCkge1xuICogICAgIC8vIGNoaWxkcmVuIGFyZSBzZXRcbiAqICAgICB0aGlzLmNoaWxkcmVuLnRvQXJyYXkoKS5mb3JFYWNoKChjaGlsZCk9PmNoaWxkLmRvU29tZXRoaW5nKCkpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBXaXRoIHN0cmluZyBzZWxlY3RvcjpcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2NoaWxkLWNtcCcsXG4gKiAgIHRlbXBsYXRlOiAnPHA+Y2hpbGQ8L3A+J1xuICogfSlcbiAqIGNsYXNzIENoaWxkQ21wIHtcbiAqICAgZG9Tb21ldGhpbmcoKSB7fVxuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3NvbWUtY21wJyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8Y2hpbGQtY21wICNjaGlsZDE+PC9jaGlsZC1jbXA+XG4gKiAgICAgPGNoaWxkLWNtcCAjY2hpbGQyPjwvY2hpbGQtY21wPlxuICogICAgIDxjaGlsZC1jbXAgI2NoaWxkMz48L2NoaWxkLWNtcD5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW0NoaWxkQ21wXVxuICogfSlcbiAqIGNsYXNzIFNvbWVDbXAge1xuICogICBAVmlld0NoaWxkcmVuKCdjaGlsZDEsY2hpbGQyLGNoaWxkMycpIGNoaWxkcmVuOlF1ZXJ5TGlzdDxDaGlsZENtcD47XG4gKlxuICogICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gKiAgICAgLy8gY2hpbGRyZW4gYXJlIHNldFxuICogICAgIHRoaXMuY2hpbGRyZW4udG9BcnJheSgpLmZvckVhY2goKGNoaWxkKT0+Y2hpbGQuZG9Tb21ldGhpbmcoKSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFNlZSBhbHNvOiBbVmlld0NoaWxkcmVuTWV0YWRhdGFdXG4gKi9cbmV4cG9ydCB2YXIgVmlld0NoaWxkcmVuOiBWaWV3Q2hpbGRyZW5GYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoVmlld0NoaWxkcmVuTWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIFZpZXdDaGlsZE1ldGFkYXRhLlxuLyoqXG4gKiBEZWNsYXJlcyBhIHJlZmVyZW5jZSB0byBhIGNoaWxkIGVsZW1lbnQuXG4gKlxuICogYFZpZXdDaGlsZHJlbmAgdGFrZXMgYSBhcmd1bWVudCB0byBzZWxlY3QgZWxlbWVudHMuXG4gKlxuICogLSBJZiB0aGUgYXJndW1lbnQgaXMgYSB0eXBlLCBhIGRpcmVjdGl2ZSBvciBhIGNvbXBvbmVudCB3aXRoIHRoZSB0eXBlIHdpbGwgYmUgYm91bmQuXG4gKlxuICogLSBJZiB0aGUgYXJndW1lbnQgaXMgYSBzdHJpbmcsIHRoZSBzdHJpbmcgaXMgaW50ZXJwcmV0ZWQgYXMgYSBzZWxlY3Rvci4gQW4gZWxlbWVudCBjb250YWluaW5nIHRoZVxuICogbWF0Y2hpbmcgdGVtcGxhdGUgdmFyaWFibGUgKGUuZy4gYCNjaGlsZGApIHdpbGwgYmUgYm91bmQuXG4gKlxuICogSW4gZWl0aGVyIGNhc2UsIGBAVmlld0NoaWxkKClgIGFzc2lnbnMgdGhlIGZpcnN0IChsb29raW5nIGZyb20gYWJvdmUpIGVsZW1lbnQgaWYgdGhlcmUgYXJlXG4gKiBtdWx0aXBsZSBtYXRjaGVzLlxuICpcbiAqIFZpZXcgY2hpbGQgaXMgc2V0IGJlZm9yZSB0aGUgYG5nQWZ0ZXJWaWV3SW5pdGAgY2FsbGJhY2sgaXMgY2FsbGVkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogV2l0aCB0eXBlIHNlbGVjdG9yOlxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnY2hpbGQtY21wJyxcbiAqICAgdGVtcGxhdGU6ICc8cD5jaGlsZDwvcD4nXG4gKiB9KVxuICogY2xhc3MgQ2hpbGRDbXAge1xuICogICBkb1NvbWV0aGluZygpIHt9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnc29tZS1jbXAnLFxuICogICB0ZW1wbGF0ZTogJzxjaGlsZC1jbXA+PC9jaGlsZC1jbXA+JyxcbiAqICAgZGlyZWN0aXZlczogW0NoaWxkQ21wXVxuICogfSlcbiAqIGNsYXNzIFNvbWVDbXAge1xuICogICBAVmlld0NoaWxkKENoaWxkQ21wKSBjaGlsZDpDaGlsZENtcDtcbiAqXG4gKiAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAqICAgICAvLyBjaGlsZCBpcyBzZXRcbiAqICAgICB0aGlzLmNoaWxkLmRvU29tZXRoaW5nKCk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFdpdGggc3RyaW5nIHNlbGVjdG9yOlxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnY2hpbGQtY21wJyxcbiAqICAgdGVtcGxhdGU6ICc8cD5jaGlsZDwvcD4nXG4gKiB9KVxuICogY2xhc3MgQ2hpbGRDbXAge1xuICogICBkb1NvbWV0aGluZygpIHt9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnc29tZS1jbXAnLFxuICogICB0ZW1wbGF0ZTogJzxjaGlsZC1jbXAgI2NoaWxkPjwvY2hpbGQtY21wPicsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDaGlsZENtcF1cbiAqIH0pXG4gKiBjbGFzcyBTb21lQ21wIHtcbiAqICAgQFZpZXdDaGlsZCgnY2hpbGQnKSBjaGlsZDpDaGlsZENtcDtcbiAqXG4gKiAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAqICAgICAvLyBjaGlsZCBpcyBzZXRcbiAqICAgICB0aGlzLmNoaWxkLmRvU29tZXRoaW5nKCk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICogU2VlIGFsc286IFtWaWV3Q2hpbGRNZXRhZGF0YV1cbiAqL1xuZXhwb3J0IHZhciBWaWV3Q2hpbGQ6IFZpZXdDaGlsZEZhY3RvcnkgPSBtYWtlUHJvcERlY29yYXRvcihWaWV3Q2hpbGRNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gVmlld1F1ZXJ5TWV0YWRhdGEuXG4vKipcbiAqIFNpbWlsYXIgdG8ge0BsaW5rIFF1ZXJ5TWV0YWRhdGF9LCBidXQgcXVlcnlpbmcgdGhlIGNvbXBvbmVudCB2aWV3LCBpbnN0ZWFkIG9mXG4gKiB0aGUgY29udGVudCBjaGlsZHJlbi5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvZU5zRkhEZjdZanlNNkl6S3hNMWo/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgLi4uLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxpdGVtPiBhIDwvaXRlbT5cbiAqICAgICA8aXRlbT4gYiA8L2l0ZW0+XG4gKiAgICAgPGl0ZW0+IGMgPC9pdGVtPlxuICogICBgXG4gKiB9KVxuICogY2xhc3MgTXlDb21wb25lbnQge1xuICogICBzaG93bjogYm9vbGVhbjtcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKHByaXZhdGUgQFF1ZXJ5KEl0ZW0pIGl0ZW1zOlF1ZXJ5TGlzdDxJdGVtPikge1xuICogICAgIGl0ZW1zLmNoYW5nZXMuc3Vic2NyaWJlKCgpID0+IGNvbnNvbGUubG9nKGl0ZW1zLmxlbmd0aCkpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBTdXBwb3J0cyB0aGUgc2FtZSBxdWVyeWluZyBwYXJhbWV0ZXJzIGFzIHtAbGluayBRdWVyeU1ldGFkYXRhfSwgZXhjZXB0XG4gKiBgZGVzY2VuZGFudHNgLiBUaGlzIGFsd2F5cyBxdWVyaWVzIHRoZSB3aG9sZSB2aWV3LlxuICpcbiAqIEFzIGBzaG93bmAgaXMgZmxpcHBlZCBiZXR3ZWVuIHRydWUgYW5kIGZhbHNlLCBpdGVtcyB3aWxsIGNvbnRhaW4gemVybyBvZiBvbmVcbiAqIGl0ZW1zLlxuICpcbiAqIFNwZWNpZmllcyB0aGF0IGEge0BsaW5rIFF1ZXJ5TGlzdH0gc2hvdWxkIGJlIGluamVjdGVkLlxuICpcbiAqIFRoZSBpbmplY3RlZCBvYmplY3QgaXMgYW4gaXRlcmFibGUgYW5kIG9ic2VydmFibGUgbGl2ZSBsaXN0LlxuICogU2VlIHtAbGluayBRdWVyeUxpc3R9IGZvciBtb3JlIGRldGFpbHMuXG4gKi9cbmV4cG9ydCB2YXIgVmlld1F1ZXJ5OiBRdWVyeUZhY3RvcnkgPSBtYWtlUGFyYW1EZWNvcmF0b3IoVmlld1F1ZXJ5TWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIFBpcGVNZXRhZGF0YS5cbi8qKlxuICogRGVjbGFyZSByZXVzYWJsZSBwaXBlIGZ1bmN0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbWV0YWRhdGEudHMgcmVnaW9uPSdwaXBlJ31cbiAqL1xuZXhwb3J0IHZhciBQaXBlOiBQaXBlRmFjdG9yeSA9IDxQaXBlRmFjdG9yeT5tYWtlRGVjb3JhdG9yKFBpcGVNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gSW5wdXRNZXRhZGF0YS5cbi8qKlxuICogRGVjbGFyZXMgYSBkYXRhLWJvdW5kIGlucHV0IHByb3BlcnR5LlxuICpcbiAqIEFuZ3VsYXIgYXV0b21hdGljYWxseSB1cGRhdGVzIGRhdGEtYm91bmQgcHJvcGVydGllcyBkdXJpbmcgY2hhbmdlIGRldGVjdGlvbi5cbiAqXG4gKiBgSW5wdXRNZXRhZGF0YWAgdGFrZXMgYW4gb3B0aW9uYWwgcGFyYW1ldGVyIHRoYXQgc3BlY2lmaWVzIHRoZSBuYW1lXG4gKiB1c2VkIHdoZW4gaW5zdGFudGlhdGluZyBhIGNvbXBvbmVudCBpbiB0aGUgdGVtcGxhdGUuIFdoZW4gbm90IHByb3ZpZGVkLFxuICogdGhlIG5hbWUgb2YgdGhlIGRlY29yYXRlZCBwcm9wZXJ0eSBpcyB1c2VkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGNyZWF0ZXMgYSBjb21wb25lbnQgd2l0aCB0d28gaW5wdXQgcHJvcGVydGllcy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdiYW5rLWFjY291bnQnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIEJhbmsgTmFtZToge3tiYW5rTmFtZX19XG4gKiAgICAgQWNjb3VudCBJZDoge3tpZH19XG4gKiAgIGBcbiAqIH0pXG4gKiBjbGFzcyBCYW5rQWNjb3VudCB7XG4gKiAgIEBJbnB1dCgpIGJhbmtOYW1lOiBzdHJpbmc7XG4gKiAgIEBJbnB1dCgnYWNjb3VudC1pZCcpIGlkOiBzdHJpbmc7XG4gKlxuICogICAvLyB0aGlzIHByb3BlcnR5IGlzIG5vdCBib3VuZCwgYW5kIHdvbid0IGJlIGF1dG9tYXRpY2FsbHkgdXBkYXRlZCBieSBBbmd1bGFyXG4gKiAgIG5vcm1hbGl6ZWRCYW5rTmFtZTogc3RyaW5nO1xuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGJhbmstYWNjb3VudCBiYW5rLW5hbWU9XCJSQkNcIiBhY2NvdW50LWlkPVwiNDc0N1wiPjwvYmFuay1hY2NvdW50PlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbQmFua0FjY291bnRdXG4gKiB9KVxuICogY2xhc3MgQXBwIHt9XG4gKlxuICogYm9vdHN0cmFwKEFwcCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHZhciBJbnB1dDogSW5wdXRGYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoSW5wdXRNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gT3V0cHV0TWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmVzIGFuIGV2ZW50LWJvdW5kIG91dHB1dCBwcm9wZXJ0eS5cbiAqXG4gKiBXaGVuIGFuIG91dHB1dCBwcm9wZXJ0eSBlbWl0cyBhbiBldmVudCwgYW4gZXZlbnQgaGFuZGxlciBhdHRhY2hlZCB0byB0aGF0IGV2ZW50XG4gKiB0aGUgdGVtcGxhdGUgaXMgaW52b2tlZC5cbiAqXG4gKiBgT3V0cHV0TWV0YWRhdGFgIHRha2VzIGFuIG9wdGlvbmFsIHBhcmFtZXRlciB0aGF0IHNwZWNpZmllcyB0aGUgbmFtZVxuICogdXNlZCB3aGVuIGluc3RhbnRpYXRpbmcgYSBjb21wb25lbnQgaW4gdGhlIHRlbXBsYXRlLiBXaGVuIG5vdCBwcm92aWRlZCxcbiAqIHRoZSBuYW1lIG9mIHRoZSBkZWNvcmF0ZWQgcHJvcGVydHkgaXMgdXNlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ2ludGVydmFsLWRpcicsXG4gKiB9KVxuICogY2xhc3MgSW50ZXJ2YWxEaXIge1xuICogICBAT3V0cHV0KCkgZXZlcnlTZWNvbmQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gKiAgIEBPdXRwdXQoJ2V2ZXJ5Rml2ZVNlY29uZHMnKSBmaXZlNVNlY3MgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gKlxuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgICBzZXRJbnRlcnZhbCgoKSA9PiB0aGlzLmV2ZXJ5U2Vjb25kLmVtaXQoXCJldmVudFwiKSwgMTAwMCk7XG4gKiAgICAgc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5maXZlNVNlY3MuZW1pdChcImV2ZW50XCIpLCA1MDAwKTtcbiAqICAgfVxuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGludGVydmFsLWRpciAoZXZlcnlTZWNvbmQpPVwiZXZlcnlTZWNvbmQoKVwiIChldmVyeUZpdmVTZWNvbmRzKT1cImV2ZXJ5Rml2ZVNlY29uZHMoKVwiPlxuICogICAgIDwvaW50ZXJ2YWwtZGlyPlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbSW50ZXJ2YWxEaXJdXG4gKiB9KVxuICogY2xhc3MgQXBwIHtcbiAqICAgZXZlcnlTZWNvbmQoKSB7IGNvbnNvbGUubG9nKCdzZWNvbmQnKTsgfVxuICogICBldmVyeUZpdmVTZWNvbmRzKCkgeyBjb25zb2xlLmxvZygnZml2ZSBzZWNvbmRzJyk7IH1cbiAqIH1cbiAqIGJvb3RzdHJhcChBcHApO1xuICogYGBgXG4gKi9cbmV4cG9ydCB2YXIgT3V0cHV0OiBPdXRwdXRGYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoT3V0cHV0TWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIEhvc3RCaW5kaW5nTWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmVzIGEgaG9zdCBwcm9wZXJ0eSBiaW5kaW5nLlxuICpcbiAqIEFuZ3VsYXIgYXV0b21hdGljYWxseSBjaGVja3MgaG9zdCBwcm9wZXJ0eSBiaW5kaW5ncyBkdXJpbmcgY2hhbmdlIGRldGVjdGlvbi5cbiAqIElmIGEgYmluZGluZyBjaGFuZ2VzLCBpdCB3aWxsIHVwZGF0ZSB0aGUgaG9zdCBlbGVtZW50IG9mIHRoZSBkaXJlY3RpdmUuXG4gKlxuICogYEhvc3RCaW5kaW5nTWV0YWRhdGFgIHRha2VzIGFuIG9wdGlvbmFsIHBhcmFtZXRlciB0aGF0IHNwZWNpZmllcyB0aGUgcHJvcGVydHlcbiAqIG5hbWUgb2YgdGhlIGhvc3QgZWxlbWVudCB0aGF0IHdpbGwgYmUgdXBkYXRlZC4gV2hlbiBub3QgcHJvdmlkZWQsXG4gKiB0aGUgY2xhc3MgcHJvcGVydHkgbmFtZSBpcyB1c2VkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGNyZWF0ZXMgYSBkaXJlY3RpdmUgdGhhdCBzZXRzIHRoZSBgdmFsaWRgIGFuZCBgaW52YWxpZGAgY2xhc3Nlc1xuICogb24gdGhlIERPTSBlbGVtZW50IHRoYXQgaGFzIG5nTW9kZWwgZGlyZWN0aXZlIG9uIGl0LlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nTW9kZWxdJ30pXG4gKiBjbGFzcyBOZ01vZGVsU3RhdHVzIHtcbiAqICAgY29uc3RydWN0b3IocHVibGljIGNvbnRyb2w6TmdNb2RlbCkge31cbiAqICAgQEhvc3RCaW5kaW5nKCdbY2xhc3MudmFsaWRdJykgZ2V0IHZhbGlkIHsgcmV0dXJuIHRoaXMuY29udHJvbC52YWxpZDsgfVxuICogICBASG9zdEJpbmRpbmcoJ1tjbGFzcy5pbnZhbGlkXScpIGdldCBpbnZhbGlkIHsgcmV0dXJuIHRoaXMuY29udHJvbC5pbnZhbGlkOyB9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgdGVtcGxhdGU6IGA8aW5wdXQgWyhuZ01vZGVsKV09XCJwcm9wXCI+YCxcbiAqICAgZGlyZWN0aXZlczogW0ZPUk1fRElSRUNUSVZFUywgTmdNb2RlbFN0YXR1c11cbiAqIH0pXG4gKiBjbGFzcyBBcHAge1xuICogICBwcm9wO1xuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHApO1xuICogYGBgXG4gKi9cbmV4cG9ydCB2YXIgSG9zdEJpbmRpbmc6IEhvc3RCaW5kaW5nRmFjdG9yeSA9IG1ha2VQcm9wRGVjb3JhdG9yKEhvc3RCaW5kaW5nTWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIEhvc3RMaXN0ZW5lck1ldGFkYXRhLlxuLyoqXG4gKiBEZWNsYXJlcyBhIGhvc3QgbGlzdGVuZXIuXG4gKlxuICogQW5ndWxhciB3aWxsIGludm9rZSB0aGUgZGVjb3JhdGVkIG1ldGhvZCB3aGVuIHRoZSBob3N0IGVsZW1lbnQgZW1pdHMgdGhlIHNwZWNpZmllZCBldmVudC5cbiAqXG4gKiBJZiB0aGUgZGVjb3JhdGVkIG1ldGhvZCByZXR1cm5zIGBmYWxzZWAsIHRoZW4gYHByZXZlbnREZWZhdWx0YCBpcyBhcHBsaWVkIG9uIHRoZSBET01cbiAqIGV2ZW50LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGRlY2xhcmVzIGEgZGlyZWN0aXZlIHRoYXQgYXR0YWNoZXMgYSBjbGljayBsaXN0ZW5lciB0byB0aGUgYnV0dG9uIGFuZFxuICogY291bnRzIGNsaWNrcy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBARGlyZWN0aXZlKHtzZWxlY3RvcjogJ2J1dHRvbltjb3VudGluZ10nfSlcbiAqIGNsYXNzIENvdW50Q2xpY2tzIHtcbiAqICAgbnVtYmVyT2ZDbGlja3MgPSAwO1xuICpcbiAqICAgQEhvc3RMaXN0ZW5lcignY2xpY2snLCBbJyRldmVudC50YXJnZXQnXSlcbiAqICAgb25DbGljayhidG4pIHtcbiAqICAgICBjb25zb2xlLmxvZyhcImJ1dHRvblwiLCBidG4sIFwibnVtYmVyIG9mIGNsaWNrczpcIiwgdGhpcy5udW1iZXJPZkNsaWNrcysrKTtcbiAqICAgfVxuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgIHRlbXBsYXRlOiBgPGJ1dHRvbiBjb3VudGluZz5JbmNyZW1lbnQ8L2J1dHRvbj5gLFxuICogICBkaXJlY3RpdmVzOiBbQ291bnRDbGlja3NdXG4gKiB9KVxuICogY2xhc3MgQXBwIHt9XG4gKlxuICogYm9vdHN0cmFwKEFwcCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHZhciBIb3N0TGlzdGVuZXI6IEhvc3RMaXN0ZW5lckZhY3RvcnkgPSBtYWtlUHJvcERlY29yYXRvcihIb3N0TGlzdGVuZXJNZXRhZGF0YSk7XG4iXX0=