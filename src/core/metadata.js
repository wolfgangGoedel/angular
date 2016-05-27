'use strict';/**
 * This indirection is needed to free up Component, etc symbols in the public API
 * to be used by the decorator versions of these annotations.
 */
"use strict";
var di_1 = require('./metadata/di');
exports.QueryMetadata = di_1.QueryMetadata;
exports.ContentChildrenMetadata = di_1.ContentChildrenMetadata;
exports.ContentChildMetadata = di_1.ContentChildMetadata;
exports.ViewChildrenMetadata = di_1.ViewChildrenMetadata;
exports.ViewQueryMetadata = di_1.ViewQueryMetadata;
exports.ViewChildMetadata = di_1.ViewChildMetadata;
exports.AttributeMetadata = di_1.AttributeMetadata;
var directives_1 = require('./metadata/directives');
exports.ComponentMetadata = directives_1.ComponentMetadata;
exports.DirectiveMetadata = directives_1.DirectiveMetadata;
exports.PipeMetadata = directives_1.PipeMetadata;
exports.InputMetadata = directives_1.InputMetadata;
exports.OutputMetadata = directives_1.OutputMetadata;
exports.HostBindingMetadata = directives_1.HostBindingMetadata;
exports.HostListenerMetadata = directives_1.HostListenerMetadata;
var view_1 = require('./metadata/view');
exports.ViewMetadata = view_1.ViewMetadata;
exports.ViewEncapsulation = view_1.ViewEncapsulation;
var di_2 = require('./metadata/di');
var directives_2 = require('./metadata/directives');
var view_2 = require('./metadata/view');
var decorators_1 = require('./util/decorators');
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
exports.Component = decorators_1.makeDecorator(directives_2.ComponentMetadata, function (fn) { return fn.View = View; });
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
exports.Directive = decorators_1.makeDecorator(directives_2.DirectiveMetadata);
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
var View = decorators_1.makeDecorator(view_2.ViewMetadata, function (fn) { return fn.View = View; });
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
exports.Attribute = decorators_1.makeParamDecorator(di_2.AttributeMetadata);
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
exports.Query = decorators_1.makeParamDecorator(di_2.QueryMetadata);
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
exports.ContentChildren = decorators_1.makePropDecorator(di_2.ContentChildrenMetadata);
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
exports.ContentChild = decorators_1.makePropDecorator(di_2.ContentChildMetadata);
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
exports.ViewChildren = decorators_1.makePropDecorator(di_2.ViewChildrenMetadata);
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
exports.ViewChild = decorators_1.makePropDecorator(di_2.ViewChildMetadata);
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
exports.ViewQuery = decorators_1.makeParamDecorator(di_2.ViewQueryMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from PipeMetadata.
/**
 * Declare reusable pipe function.
 *
 * ### Example
 *
 * {@example core/ts/metadata/metadata.ts region='pipe'}
 */
exports.Pipe = decorators_1.makeDecorator(directives_2.PipeMetadata);
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
exports.Input = decorators_1.makePropDecorator(directives_2.InputMetadata);
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
exports.Output = decorators_1.makePropDecorator(directives_2.OutputMetadata);
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
exports.HostBinding = decorators_1.makePropDecorator(directives_2.HostBindingMetadata);
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
exports.HostListener = decorators_1.makePropDecorator(directives_2.HostListenerMetadata);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXR1VlQzeWdjLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7O0FBRUgsbUJBUU8sZUFBZSxDQUFDO0FBUHJCLDJDQUFhO0FBQ2IsK0RBQXVCO0FBQ3ZCLHlEQUFvQjtBQUNwQix5REFBb0I7QUFDcEIsbURBQWlCO0FBQ2pCLG1EQUFpQjtBQUNqQixtREFDcUI7QUFFdkIsMkJBUU8sdUJBQXVCLENBQUM7QUFQN0IsMkRBQWlCO0FBQ2pCLDJEQUFpQjtBQUNqQixpREFBWTtBQUNaLG1EQUFhO0FBQ2IscURBQWM7QUFDZCwrREFBbUI7QUFDbkIsaUVBQzZCO0FBRS9CLHFCQUE4QyxpQkFBaUIsQ0FBQztBQUF4RCwyQ0FBWTtBQUFFLHFEQUEwQztBQWFoRSxtQkFRTyxlQUFlLENBQUMsQ0FBQTtBQUV2QiwyQkFRTyx1QkFBdUIsQ0FBQyxDQUFBO0FBRS9CLHFCQUE4QyxpQkFBaUIsQ0FBQyxDQUFBO0FBR2hFLDJCQU1PLG1CQUFtQixDQUFDLENBQUE7QUFzYTNCLDRGQUE0RjtBQUM1Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNCRztBQUNRLGlCQUFTLEdBQ0UsMEJBQWEsQ0FBQyw4QkFBaUIsRUFBRSxVQUFDLEVBQU8sSUFBSyxPQUFBLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxFQUFkLENBQWMsQ0FBQyxDQUFDO0FBRXBGLDRGQUE0RjtBQUM1Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F5WEc7QUFDUSxpQkFBUyxHQUF1QywwQkFBYSxDQUFDLDhCQUFpQixDQUFDLENBQUM7QUFFNUYsdUZBQXVGO0FBQ3ZGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNEJHO0FBQ0gsSUFBSSxJQUFJLEdBQTZCLDBCQUFhLENBQUMsbUJBQVksRUFBRSxVQUFDLEVBQU8sSUFBSyxPQUFBLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxFQUFkLENBQWMsQ0FBQyxDQUFDO0FBRTlGOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JHO0FBQ1EsaUJBQVMsR0FBcUIsK0JBQWtCLENBQUMsc0JBQWlCLENBQUMsQ0FBQztBQUUvRSx3RkFBd0Y7QUFDeEY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EwR0c7QUFDUSxhQUFLLEdBQWlCLCtCQUFrQixDQUFDLGtCQUFhLENBQUMsQ0FBQztBQUVuRSxrR0FBa0c7QUFDbEc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFDUSx1QkFBZSxHQUEyQiw4QkFBaUIsQ0FBQyw0QkFBdUIsQ0FBQyxDQUFDO0FBRWhHLCtGQUErRjtBQUMvRjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1CRztBQUNRLG9CQUFZLEdBQXdCLDhCQUFpQixDQUFDLHlCQUFvQixDQUFDLENBQUM7QUFFdkYsK0ZBQStGO0FBQy9GOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4RUc7QUFDUSxvQkFBWSxHQUF3Qiw4QkFBaUIsQ0FBQyx5QkFBb0IsQ0FBQyxDQUFDO0FBRXZGLDRGQUE0RjtBQUM1Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUVHO0FBQ1EsaUJBQVMsR0FBcUIsOEJBQWlCLENBQUMsc0JBQWlCLENBQUMsQ0FBQztBQUU5RSw0RkFBNEY7QUFDNUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQ0c7QUFDUSxpQkFBUyxHQUFpQiwrQkFBa0IsQ0FBQyxzQkFBaUIsQ0FBQyxDQUFDO0FBRTNFLHVGQUF1RjtBQUN2Rjs7Ozs7O0dBTUc7QUFDUSxZQUFJLEdBQTZCLDBCQUFhLENBQUMseUJBQVksQ0FBQyxDQUFDO0FBRXhFLHdGQUF3RjtBQUN4Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdDRztBQUNRLGFBQUssR0FBaUIsOEJBQWlCLENBQUMsMEJBQWEsQ0FBQyxDQUFDO0FBRWxFLHlGQUF5RjtBQUN6Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdDRztBQUNRLGNBQU0sR0FBa0IsOEJBQWlCLENBQUMsMkJBQWMsQ0FBQyxDQUFDO0FBRXJFLDhGQUE4RjtBQUM5Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtDRztBQUNRLG1CQUFXLEdBQXVCLDhCQUFpQixDQUFDLGdDQUFtQixDQUFDLENBQUM7QUFFcEYsK0ZBQStGO0FBQy9GOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpQ0c7QUFDUSxvQkFBWSxHQUF3Qiw4QkFBaUIsQ0FBQyxpQ0FBb0IsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUaGlzIGluZGlyZWN0aW9uIGlzIG5lZWRlZCB0byBmcmVlIHVwIENvbXBvbmVudCwgZXRjIHN5bWJvbHMgaW4gdGhlIHB1YmxpYyBBUElcbiAqIHRvIGJlIHVzZWQgYnkgdGhlIGRlY29yYXRvciB2ZXJzaW9ucyBvZiB0aGVzZSBhbm5vdGF0aW9ucy5cbiAqL1xuXG5leHBvcnQge1xuICBRdWVyeU1ldGFkYXRhLFxuICBDb250ZW50Q2hpbGRyZW5NZXRhZGF0YSxcbiAgQ29udGVudENoaWxkTWV0YWRhdGEsXG4gIFZpZXdDaGlsZHJlbk1ldGFkYXRhLFxuICBWaWV3UXVlcnlNZXRhZGF0YSxcbiAgVmlld0NoaWxkTWV0YWRhdGEsXG4gIEF0dHJpYnV0ZU1ldGFkYXRhXG59IGZyb20gJy4vbWV0YWRhdGEvZGknO1xuXG5leHBvcnQge1xuICBDb21wb25lbnRNZXRhZGF0YSxcbiAgRGlyZWN0aXZlTWV0YWRhdGEsXG4gIFBpcGVNZXRhZGF0YSxcbiAgSW5wdXRNZXRhZGF0YSxcbiAgT3V0cHV0TWV0YWRhdGEsXG4gIEhvc3RCaW5kaW5nTWV0YWRhdGEsXG4gIEhvc3RMaXN0ZW5lck1ldGFkYXRhXG59IGZyb20gJy4vbWV0YWRhdGEvZGlyZWN0aXZlcyc7XG5cbmV4cG9ydCB7Vmlld01ldGFkYXRhLCBWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnLi9tZXRhZGF0YS92aWV3JztcblxuZXhwb3J0IHtcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQWZ0ZXJDb250ZW50Q2hlY2tlZCxcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgQWZ0ZXJWaWV3Q2hlY2tlZCxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgRG9DaGVja1xufSBmcm9tICcuL21ldGFkYXRhL2xpZmVjeWNsZV9ob29rcyc7XG5cbmltcG9ydCB7XG4gIFF1ZXJ5TWV0YWRhdGEsXG4gIENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhLFxuICBDb250ZW50Q2hpbGRNZXRhZGF0YSxcbiAgVmlld0NoaWxkcmVuTWV0YWRhdGEsXG4gIFZpZXdDaGlsZE1ldGFkYXRhLFxuICBWaWV3UXVlcnlNZXRhZGF0YSxcbiAgQXR0cmlidXRlTWV0YWRhdGFcbn0gZnJvbSAnLi9tZXRhZGF0YS9kaSc7XG5cbmltcG9ydCB7XG4gIENvbXBvbmVudE1ldGFkYXRhLFxuICBEaXJlY3RpdmVNZXRhZGF0YSxcbiAgUGlwZU1ldGFkYXRhLFxuICBJbnB1dE1ldGFkYXRhLFxuICBPdXRwdXRNZXRhZGF0YSxcbiAgSG9zdEJpbmRpbmdNZXRhZGF0YSxcbiAgSG9zdExpc3RlbmVyTWV0YWRhdGFcbn0gZnJvbSAnLi9tZXRhZGF0YS9kaXJlY3RpdmVzJztcblxuaW1wb3J0IHtWaWV3TWV0YWRhdGEsIFZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICcuL21ldGFkYXRhL3ZpZXcnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcblxuaW1wb3J0IHtcbiAgbWFrZURlY29yYXRvcixcbiAgbWFrZVBhcmFtRGVjb3JhdG9yLFxuICBtYWtlUHJvcERlY29yYXRvcixcbiAgVHlwZURlY29yYXRvcixcbiAgQ2xhc3Ncbn0gZnJvbSAnLi91dGlsL2RlY29yYXRvcnMnO1xuaW1wb3J0IHtUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIHtAbGluayBEaXJlY3RpdmVNZXRhZGF0YX0gZGVjb3JhdG9yIGZ1bmN0aW9uLlxuICpcbiAqIFNlZSB7QGxpbmsgRGlyZWN0aXZlRmFjdG9yeX0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGlyZWN0aXZlRGVjb3JhdG9yIGV4dGVuZHMgVHlwZURlY29yYXRvciB7fVxuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIHtAbGluayBDb21wb25lbnRNZXRhZGF0YX0gZGVjb3JhdG9yIGZ1bmN0aW9uLlxuICpcbiAqIFNlZSB7QGxpbmsgQ29tcG9uZW50RmFjdG9yeX0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50RGVjb3JhdG9yIGV4dGVuZHMgVHlwZURlY29yYXRvciB7XG4gIC8qKlxuICAgKiBDaGFpbiB7QGxpbmsgVmlld01ldGFkYXRhfSBhbm5vdGF0aW9uLlxuICAgKi9cbiAgVmlldyhvYmo6IHtcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZyxcbiAgICB0ZW1wbGF0ZT86IHN0cmluZyxcbiAgICBkaXJlY3RpdmVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBwaXBlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgcmVuZGVyZXI/OiBzdHJpbmcsXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gIH0pOiBWaWV3RGVjb3JhdG9yO1xufVxuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIHtAbGluayBWaWV3TWV0YWRhdGF9IGRlY29yYXRvciBmdW5jdGlvbi5cbiAqXG4gKiBTZWUge0BsaW5rIFZpZXdGYWN0b3J5fS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBWaWV3RGVjb3JhdG9yIGV4dGVuZHMgVHlwZURlY29yYXRvciB7XG4gIC8qKlxuICAgKiBDaGFpbiB7QGxpbmsgVmlld01ldGFkYXRhfSBhbm5vdGF0aW9uLlxuICAgKi9cbiAgVmlldyhvYmo6IHtcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZyxcbiAgICB0ZW1wbGF0ZT86IHN0cmluZyxcbiAgICBkaXJlY3RpdmVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBwaXBlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgcmVuZGVyZXI/OiBzdHJpbmcsXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gIH0pOiBWaWV3RGVjb3JhdG9yO1xufVxuXG4vKipcbiAqIHtAbGluayBEaXJlY3RpdmVNZXRhZGF0YX0gZmFjdG9yeSBmb3IgY3JlYXRpbmcgYW5ub3RhdGlvbnMsIGRlY29yYXRvcnMgb3IgRFNMLlxuICpcbiAqICMjIyBFeGFtcGxlIGFzIFR5cGVTY3JpcHQgRGVjb3JhdG9yXG4gKlxuICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbWV0YWRhdGEudHMgcmVnaW9uPSdkaXJlY3RpdmUnfVxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBEU0xcbiAqXG4gKiBgYGBcbiAqIHZhciBNeURpcmVjdGl2ZSA9IG5nXG4gKiAgIC5EaXJlY3RpdmUoey4uLn0pXG4gKiAgIC5DbGFzcyh7XG4gKiAgICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKCkge1xuICogICAgICAgLi4uXG4gKiAgICAgfVxuICogICB9KVxuICogYGBgXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IGFubm90YXRpb25cbiAqXG4gKiBgYGBcbiAqIHZhciBNeURpcmVjdGl2ZSA9IGZ1bmN0aW9uKCkge1xuICogICAuLi5cbiAqIH07XG4gKlxuICogTXlEaXJlY3RpdmUuYW5ub3RhdGlvbnMgPSBbXG4gKiAgIG5ldyBuZy5EaXJlY3RpdmUoey4uLn0pXG4gKiBdXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RpdmVGYWN0b3J5IHtcbiAgKG9iajoge1xuICAgIHNlbGVjdG9yPzogc3RyaW5nLFxuICAgIGlucHV0cz86IHN0cmluZ1tdLFxuICAgIG91dHB1dHM/OiBzdHJpbmdbXSxcbiAgICBwcm9wZXJ0aWVzPzogc3RyaW5nW10sXG4gICAgZXZlbnRzPzogc3RyaW5nW10sXG4gICAgaG9zdD86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIGJpbmRpbmdzPzogYW55W10sXG4gICAgcHJvdmlkZXJzPzogYW55W10sXG4gICAgZXhwb3J0QXM/OiBzdHJpbmcsXG4gICAgcXVlcmllcz86IHtba2V5OiBzdHJpbmddOiBhbnl9XG4gIH0pOiBEaXJlY3RpdmVEZWNvcmF0b3I7XG4gIG5ldyAob2JqOiB7XG4gICAgc2VsZWN0b3I/OiBzdHJpbmcsXG4gICAgaW5wdXRzPzogc3RyaW5nW10sXG4gICAgb3V0cHV0cz86IHN0cmluZ1tdLFxuICAgIHByb3BlcnRpZXM/OiBzdHJpbmdbXSxcbiAgICBldmVudHM/OiBzdHJpbmdbXSxcbiAgICBob3N0Pzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgYmluZGluZ3M/OiBhbnlbXSxcbiAgICBwcm92aWRlcnM/OiBhbnlbXSxcbiAgICBleHBvcnRBcz86IHN0cmluZyxcbiAgICBxdWVyaWVzPzoge1trZXk6IHN0cmluZ106IGFueX1cbiAgfSk6IERpcmVjdGl2ZU1ldGFkYXRhO1xufVxuXG4vKipcbiAqIHtAbGluayBDb21wb25lbnRNZXRhZGF0YX0gZmFjdG9yeSBmb3IgY3JlYXRpbmcgYW5ub3RhdGlvbnMsIGRlY29yYXRvcnMgb3IgRFNMLlxuICpcbiAqICMjIyBFeGFtcGxlIGFzIFR5cGVTY3JpcHQgRGVjb3JhdG9yXG4gKlxuICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbWV0YWRhdGEudHMgcmVnaW9uPSdjb21wb25lbnQnfVxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBEU0xcbiAqXG4gKiBgYGBcbiAqIHZhciBNeUNvbXBvbmVudCA9IG5nXG4gKiAgIC5Db21wb25lbnQoey4uLn0pXG4gKiAgIC5DbGFzcyh7XG4gKiAgICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKCkge1xuICogICAgICAgLi4uXG4gKiAgICAgfVxuICogICB9KVxuICogYGBgXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IGFubm90YXRpb25cbiAqXG4gKiBgYGBcbiAqIHZhciBNeUNvbXBvbmVudCA9IGZ1bmN0aW9uKCkge1xuICogICAuLi5cbiAqIH07XG4gKlxuICogTXlDb21wb25lbnQuYW5ub3RhdGlvbnMgPSBbXG4gKiAgIG5ldyBuZy5Db21wb25lbnQoey4uLn0pXG4gKiBdXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnRGYWN0b3J5IHtcbiAgKG9iajoge1xuICAgIHNlbGVjdG9yPzogc3RyaW5nLFxuICAgIGlucHV0cz86IHN0cmluZ1tdLFxuICAgIG91dHB1dHM/OiBzdHJpbmdbXSxcbiAgICBwcm9wZXJ0aWVzPzogc3RyaW5nW10sXG4gICAgZXZlbnRzPzogc3RyaW5nW10sXG4gICAgaG9zdD86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIC8qIEBkZXByZWNhdGVkICovXG4gICAgYmluZGluZ3M/OiBhbnlbXSxcbiAgICBwcm92aWRlcnM/OiBhbnlbXSxcbiAgICBleHBvcnRBcz86IHN0cmluZyxcbiAgICBtb2R1bGVJZD86IHN0cmluZyxcbiAgICBxdWVyaWVzPzoge1trZXk6IHN0cmluZ106IGFueX0sXG4gICAgdmlld0JpbmRpbmdzPzogYW55W10sXG4gICAgdmlld1Byb3ZpZGVycz86IGFueVtdLFxuICAgIGNoYW5nZURldGVjdGlvbj86IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdLFxuICAgIHN0eWxlcz86IHN0cmluZ1tdLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBlbmNhcHN1bGF0aW9uPzogVmlld0VuY2Fwc3VsYXRpb25cbiAgfSk6IENvbXBvbmVudERlY29yYXRvcjtcbiAgbmV3IChvYmo6IHtcbiAgICBzZWxlY3Rvcj86IHN0cmluZyxcbiAgICBpbnB1dHM/OiBzdHJpbmdbXSxcbiAgICBvdXRwdXRzPzogc3RyaW5nW10sXG4gICAgcHJvcGVydGllcz86IHN0cmluZ1tdLFxuICAgIGV2ZW50cz86IHN0cmluZ1tdLFxuICAgIGhvc3Q/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICAvKiBAZGVwcmVjYXRlZCAqL1xuICAgIGJpbmRpbmdzPzogYW55W10sXG4gICAgcHJvdmlkZXJzPzogYW55W10sXG4gICAgZXhwb3J0QXM/OiBzdHJpbmcsXG4gICAgbW9kdWxlSWQ/OiBzdHJpbmcsXG4gICAgcXVlcmllcz86IHtba2V5OiBzdHJpbmddOiBhbnl9LFxuICAgIC8qIEBkZXByZWNhdGVkICovXG4gICAgdmlld0JpbmRpbmdzPzogYW55W10sXG4gICAgdmlld1Byb3ZpZGVycz86IGFueVtdLFxuICAgIGNoYW5nZURldGVjdGlvbj86IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdLFxuICAgIHN0eWxlcz86IHN0cmluZ1tdLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBlbmNhcHN1bGF0aW9uPzogVmlld0VuY2Fwc3VsYXRpb25cbiAgfSk6IENvbXBvbmVudE1ldGFkYXRhO1xufVxuXG4vKipcbiAqIHtAbGluayBWaWV3TWV0YWRhdGF9IGZhY3RvcnkgZm9yIGNyZWF0aW5nIGFubm90YXRpb25zLCBkZWNvcmF0b3JzIG9yIERTTC5cbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBUeXBlU2NyaXB0IERlY29yYXRvclxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnQsIFZpZXd9IGZyb20gXCJhbmd1bGFyMi9jb3JlXCI7XG4gKlxuICogQENvbXBvbmVudCh7Li4ufSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgY29uc3RydWN0b3IoKSB7XG4gKiAgICAgLi4uXG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBEU0xcbiAqXG4gKiBgYGBcbiAqIHZhciBNeUNvbXBvbmVudCA9IG5nXG4gKiAgIC5Db21wb25lbnQoey4uLn0pXG4gKiAgIC5WaWV3KHsuLi59KVxuICogICAuQ2xhc3Moe1xuICogICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbigpIHtcbiAqICAgICAgIC4uLlxuICogICAgIH1cbiAqICAgfSlcbiAqIGBgYFxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBhbm5vdGF0aW9uXG4gKlxuICogYGBgXG4gKiB2YXIgTXlDb21wb25lbnQgPSBmdW5jdGlvbigpIHtcbiAqICAgLi4uXG4gKiB9O1xuICpcbiAqIE15Q29tcG9uZW50LmFubm90YXRpb25zID0gW1xuICogICBuZXcgbmcuQ29tcG9uZW50KHsuLi59KSxcbiAqICAgbmV3IG5nLlZpZXcoey4uLn0pXG4gKiBdXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBWaWV3RmFjdG9yeSB7XG4gIChvYmo6IHtcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZyxcbiAgICB0ZW1wbGF0ZT86IHN0cmluZyxcbiAgICBkaXJlY3RpdmVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBwaXBlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgZW5jYXBzdWxhdGlvbj86IFZpZXdFbmNhcHN1bGF0aW9uLFxuICAgIHN0eWxlcz86IHN0cmluZ1tdLFxuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdLFxuICB9KTogVmlld0RlY29yYXRvcjtcbiAgbmV3IChvYmo6IHtcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZyxcbiAgICB0ZW1wbGF0ZT86IHN0cmluZyxcbiAgICBkaXJlY3RpdmVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBwaXBlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgZW5jYXBzdWxhdGlvbj86IFZpZXdFbmNhcHN1bGF0aW9uLFxuICAgIHN0eWxlcz86IHN0cmluZ1tdLFxuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdLFxuICB9KTogVmlld01ldGFkYXRhO1xufVxuXG4vKipcbiAqIHtAbGluayBBdHRyaWJ1dGVNZXRhZGF0YX0gZmFjdG9yeSBmb3IgY3JlYXRpbmcgYW5ub3RhdGlvbnMsIGRlY29yYXRvcnMgb3IgRFNMLlxuICpcbiAqICMjIyBFeGFtcGxlIGFzIFR5cGVTY3JpcHQgRGVjb3JhdG9yXG4gKlxuICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbWV0YWRhdGEudHMgcmVnaW9uPSdhdHRyaWJ1dGVGYWN0b3J5J31cbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgRFNMXG4gKlxuICogYGBgXG4gKiB2YXIgTXlDb21wb25lbnQgPSBuZ1xuICogICAuQ29tcG9uZW50KHsuLi59KVxuICogICAuQ2xhc3Moe1xuICogICAgIGNvbnN0cnVjdG9yOiBbbmV3IG5nLkF0dHJpYnV0ZSgndGl0bGUnKSwgZnVuY3Rpb24odGl0bGUpIHtcbiAqICAgICAgIC4uLlxuICogICAgIH1dXG4gKiAgIH0pXG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgYW5ub3RhdGlvblxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gZnVuY3Rpb24odGl0bGUpIHtcbiAqICAgLi4uXG4gKiB9O1xuICpcbiAqIE15Q29tcG9uZW50LmFubm90YXRpb25zID0gW1xuICogICBuZXcgbmcuQ29tcG9uZW50KHsuLi59KVxuICogXVxuICogTXlDb21wb25lbnQucGFyYW1ldGVycyA9IFtcbiAqICAgW25ldyBuZy5BdHRyaWJ1dGUoJ3RpdGxlJyldXG4gKiBdXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBdHRyaWJ1dGVGYWN0b3J5IHtcbiAgKG5hbWU6IHN0cmluZyk6IFR5cGVEZWNvcmF0b3I7XG4gIG5ldyAobmFtZTogc3RyaW5nKTogQXR0cmlidXRlTWV0YWRhdGE7XG59XG5cbi8qKlxuICoge0BsaW5rIFF1ZXJ5TWV0YWRhdGF9IGZhY3RvcnkgZm9yIGNyZWF0aW5nIGFubm90YXRpb25zLCBkZWNvcmF0b3JzIG9yIERTTC5cbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBUeXBlU2NyaXB0IERlY29yYXRvclxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtRdWVyeSwgUXVlcnlMaXN0LCBDb21wb25lbnR9IGZyb20gXCJhbmd1bGFyMi9jb3JlXCI7XG4gKlxuICogQENvbXBvbmVudCh7Li4ufSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KFNvbWVUeXBlKSBxdWVyeUxpc3Q6IFF1ZXJ5TGlzdDxTb21lVHlwZT4pIHtcbiAqICAgICAuLi5cbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IERTTFxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gbmdcbiAqICAgLkNvbXBvbmVudCh7Li4ufSlcbiAqICAgLkNsYXNzKHtcbiAqICAgICBjb25zdHJ1Y3RvcjogW25ldyBuZy5RdWVyeShTb21lVHlwZSksIGZ1bmN0aW9uKHF1ZXJ5TGlzdCkge1xuICogICAgICAgLi4uXG4gKiAgICAgfV1cbiAqICAgfSlcbiAqIGBgYFxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBhbm5vdGF0aW9uXG4gKlxuICogYGBgXG4gKiB2YXIgTXlDb21wb25lbnQgPSBmdW5jdGlvbihxdWVyeUxpc3QpIHtcbiAqICAgLi4uXG4gKiB9O1xuICpcbiAqIE15Q29tcG9uZW50LmFubm90YXRpb25zID0gW1xuICogICBuZXcgbmcuQ29tcG9uZW50KHsuLi59KVxuICogXVxuICogTXlDb21wb25lbnQucGFyYW1ldGVycyA9IFtcbiAqICAgW25ldyBuZy5RdWVyeShTb21lVHlwZSldXG4gKiBdXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBRdWVyeUZhY3Rvcnkge1xuICAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcsIHtkZXNjZW5kYW50c30/OiB7ZGVzY2VuZGFudHM/OiBib29sZWFufSk6IFBhcmFtZXRlckRlY29yYXRvcjtcbiAgbmV3IChzZWxlY3RvcjogVHlwZSB8IHN0cmluZywge2Rlc2NlbmRhbnRzfT86IHtkZXNjZW5kYW50cz86IGJvb2xlYW59KTogUXVlcnlNZXRhZGF0YTtcbn1cblxuLyoqXG4gKiBGYWN0b3J5IGZvciB7QGxpbmsgQ29udGVudENoaWxkcmVufS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb250ZW50Q2hpbGRyZW5GYWN0b3J5IHtcbiAgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLCB7ZGVzY2VuZGFudHN9Pzoge2Rlc2NlbmRhbnRzPzogYm9vbGVhbn0pOiBhbnk7XG4gIG5ldyAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcsIHtkZXNjZW5kYW50c30/OiB7ZGVzY2VuZGFudHM/OiBib29sZWFufSk6IENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhO1xufVxuXG4vKipcbiAqIEZhY3RvcnkgZm9yIHtAbGluayBDb250ZW50Q2hpbGR9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbnRlbnRDaGlsZEZhY3Rvcnkge1xuICAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcpOiBhbnk7XG4gIG5ldyAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcpOiBDb250ZW50Q2hpbGRGYWN0b3J5O1xufVxuXG4vKipcbiAqIEZhY3RvcnkgZm9yIHtAbGluayBWaWV3Q2hpbGRyZW59LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFZpZXdDaGlsZHJlbkZhY3Rvcnkge1xuICAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcpOiBhbnk7XG4gIG5ldyAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcpOiBWaWV3Q2hpbGRyZW5NZXRhZGF0YTtcbn1cblxuLyoqXG4gKiBGYWN0b3J5IGZvciB7QGxpbmsgVmlld0NoaWxkfS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBWaWV3Q2hpbGRGYWN0b3J5IHtcbiAgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nKTogYW55O1xuICBuZXcgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nKTogVmlld0NoaWxkRmFjdG9yeTtcbn1cblxuXG4vKipcbiAqIHtAbGluayBQaXBlTWV0YWRhdGF9IGZhY3RvcnkgZm9yIGNyZWF0aW5nIGRlY29yYXRvcnMuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS90cy9tZXRhZGF0YS9tZXRhZGF0YS50cyByZWdpb249J3BpcGUnfVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFBpcGVGYWN0b3J5IHtcbiAgKG9iajoge25hbWU6IHN0cmluZywgcHVyZT86IGJvb2xlYW59KTogYW55O1xuICBuZXcgKG9iajoge25hbWU6IHN0cmluZywgcHVyZT86IGJvb2xlYW59KTogYW55O1xufVxuXG4vKipcbiAqIHtAbGluayBJbnB1dE1ldGFkYXRhfSBmYWN0b3J5IGZvciBjcmVhdGluZyBkZWNvcmF0b3JzLlxuICpcbiAqIFNlZSB7QGxpbmsgSW5wdXRNZXRhZGF0YX0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW5wdXRGYWN0b3J5IHtcbiAgKGJpbmRpbmdQcm9wZXJ0eU5hbWU/OiBzdHJpbmcpOiBhbnk7XG4gIG5ldyAoYmluZGluZ1Byb3BlcnR5TmFtZT86IHN0cmluZyk6IGFueTtcbn1cblxuLyoqXG4gKiB7QGxpbmsgT3V0cHV0TWV0YWRhdGF9IGZhY3RvcnkgZm9yIGNyZWF0aW5nIGRlY29yYXRvcnMuXG4gKlxuICogU2VlIHtAbGluayBPdXRwdXRNZXRhZGF0YX0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgT3V0cHV0RmFjdG9yeSB7XG4gIChiaW5kaW5nUHJvcGVydHlOYW1lPzogc3RyaW5nKTogYW55O1xuICBuZXcgKGJpbmRpbmdQcm9wZXJ0eU5hbWU/OiBzdHJpbmcpOiBhbnk7XG59XG5cbi8qKlxuICoge0BsaW5rIEhvc3RCaW5kaW5nTWV0YWRhdGF9IGZhY3RvcnkgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSG9zdEJpbmRpbmdGYWN0b3J5IHtcbiAgKGhvc3RQcm9wZXJ0eU5hbWU/OiBzdHJpbmcpOiBhbnk7XG4gIG5ldyAoaG9zdFByb3BlcnR5TmFtZT86IHN0cmluZyk6IGFueTtcbn1cblxuLyoqXG4gKiB7QGxpbmsgSG9zdExpc3RlbmVyTWV0YWRhdGF9IGZhY3RvcnkgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSG9zdExpc3RlbmVyRmFjdG9yeSB7XG4gIChldmVudE5hbWU6IHN0cmluZywgYXJncz86IHN0cmluZ1tdKTogYW55O1xuICBuZXcgKGV2ZW50TmFtZTogc3RyaW5nLCBhcmdzPzogc3RyaW5nW10pOiBhbnk7XG59XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gQ29tcG9uZW50TWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmUgcmV1c2FibGUgVUkgYnVpbGRpbmcgYmxvY2tzIGZvciBhbiBhcHBsaWNhdGlvbi5cbiAqXG4gKiBFYWNoIEFuZ3VsYXIgY29tcG9uZW50IHJlcXVpcmVzIGEgc2luZ2xlIGBAQ29tcG9uZW50YCBhbm5vdGF0aW9uLiBUaGUgYEBDb21wb25lbnRgXG4gKiBhbm5vdGF0aW9uIHNwZWNpZmllcyB3aGVuIGEgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCwgYW5kIHdoaWNoIHByb3BlcnRpZXMgYW5kIGhvc3RMaXN0ZW5lcnMgaXRcbiAqIGJpbmRzIHRvLlxuICpcbiAqIFdoZW4gYSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkLCBBbmd1bGFyXG4gKiAtIGNyZWF0ZXMgYSBzaGFkb3cgRE9NIGZvciB0aGUgY29tcG9uZW50LlxuICogLSBsb2FkcyB0aGUgc2VsZWN0ZWQgdGVtcGxhdGUgaW50byB0aGUgc2hhZG93IERPTS5cbiAqIC0gY3JlYXRlcyBhbGwgdGhlIGluamVjdGFibGUgb2JqZWN0cyBjb25maWd1cmVkIHdpdGggYHByb3ZpZGVyc2AgYW5kIGB2aWV3UHJvdmlkZXJzYC5cbiAqXG4gKiBBbGwgdGVtcGxhdGUgZXhwcmVzc2lvbnMgYW5kIHN0YXRlbWVudHMgYXJlIHRoZW4gZXZhbHVhdGVkIGFnYWluc3QgdGhlIGNvbXBvbmVudCBpbnN0YW5jZS5cbiAqXG4gKiAjIyBMaWZlY3ljbGUgaG9va3NcbiAqXG4gKiBXaGVuIHRoZSBjb21wb25lbnQgY2xhc3MgaW1wbGVtZW50cyBzb21lIHtAbGluayAuLi8uLi9ndWlkZS9saWZlY3ljbGUtaG9va3MuaHRtbH0gdGhlIGNhbGxiYWNrc1xuICogYXJlIGNhbGxlZCBieSB0aGUgY2hhbmdlIGRldGVjdGlvbiBhdCBkZWZpbmVkIHBvaW50cyBpbiB0aW1lIGR1cmluZyB0aGUgbGlmZSBvZiB0aGUgY29tcG9uZW50LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbWV0YWRhdGEudHMgcmVnaW9uPSdjb21wb25lbnQnfVxuICovXG5leHBvcnQgdmFyIENvbXBvbmVudDogQ29tcG9uZW50RmFjdG9yeSA9XG4gICAgPENvbXBvbmVudEZhY3Rvcnk+bWFrZURlY29yYXRvcihDb21wb25lbnRNZXRhZGF0YSwgKGZuOiBhbnkpID0+IGZuLlZpZXcgPSBWaWV3KTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBEaXJlY3RpdmVNZXRhZGF0YS5cbi8qKlxuICogRGlyZWN0aXZlcyBhbGxvdyB5b3UgdG8gYXR0YWNoIGJlaGF2aW9yIHRvIGVsZW1lbnRzIGluIHRoZSBET00uXG4gKlxuICoge0BsaW5rIERpcmVjdGl2ZU1ldGFkYXRhfXMgd2l0aCBhbiBlbWJlZGRlZCB2aWV3IGFyZSBjYWxsZWQge0BsaW5rIENvbXBvbmVudE1ldGFkYXRhfXMuXG4gKlxuICogQSBkaXJlY3RpdmUgY29uc2lzdHMgb2YgYSBzaW5nbGUgZGlyZWN0aXZlIGFubm90YXRpb24gYW5kIGEgY29udHJvbGxlciBjbGFzcy4gV2hlbiB0aGVcbiAqIGRpcmVjdGl2ZSdzIGBzZWxlY3RvcmAgbWF0Y2hlc1xuICogZWxlbWVudHMgaW4gdGhlIERPTSwgdGhlIGZvbGxvd2luZyBzdGVwcyBvY2N1cjpcbiAqXG4gKiAxLiBGb3IgZWFjaCBkaXJlY3RpdmUsIHRoZSBgRWxlbWVudEluamVjdG9yYCBhdHRlbXB0cyB0byByZXNvbHZlIHRoZSBkaXJlY3RpdmUncyBjb25zdHJ1Y3RvclxuICogYXJndW1lbnRzLlxuICogMi4gQW5ndWxhciBpbnN0YW50aWF0ZXMgZGlyZWN0aXZlcyBmb3IgZWFjaCBtYXRjaGVkIGVsZW1lbnQgdXNpbmcgYEVsZW1lbnRJbmplY3RvcmAgaW4gYVxuICogZGVwdGgtZmlyc3Qgb3JkZXIsXG4gKiAgICBhcyBkZWNsYXJlZCBpbiB0aGUgSFRNTC5cbiAqXG4gKiAjIyBVbmRlcnN0YW5kaW5nIEhvdyBJbmplY3Rpb24gV29ya3NcbiAqXG4gKiBUaGVyZSBhcmUgdGhyZWUgc3RhZ2VzIG9mIGluamVjdGlvbiByZXNvbHV0aW9uLlxuICogLSAqUHJlLWV4aXN0aW5nIEluamVjdG9ycyo6XG4gKiAgIC0gVGhlIHRlcm1pbmFsIHtAbGluayBJbmplY3Rvcn0gY2Fubm90IHJlc29sdmUgZGVwZW5kZW5jaWVzLiBJdCBlaXRoZXIgdGhyb3dzIGFuIGVycm9yIG9yLCBpZlxuICogdGhlIGRlcGVuZGVuY3kgd2FzXG4gKiAgICAgc3BlY2lmaWVkIGFzIGBAT3B0aW9uYWxgLCByZXR1cm5zIGBudWxsYC5cbiAqICAgLSBUaGUgcGxhdGZvcm0gaW5qZWN0b3IgcmVzb2x2ZXMgYnJvd3NlciBzaW5nbGV0b24gcmVzb3VyY2VzLCBzdWNoIGFzOiBjb29raWVzLCB0aXRsZSxcbiAqIGxvY2F0aW9uLCBhbmQgb3RoZXJzLlxuICogLSAqQ29tcG9uZW50IEluamVjdG9ycyo6IEVhY2ggY29tcG9uZW50IGluc3RhbmNlIGhhcyBpdHMgb3duIHtAbGluayBJbmplY3Rvcn0sIGFuZCB0aGV5IGZvbGxvd1xuICogdGhlIHNhbWUgcGFyZW50LWNoaWxkIGhpZXJhcmNoeVxuICogICAgIGFzIHRoZSBjb21wb25lbnQgaW5zdGFuY2VzIGluIHRoZSBET00uXG4gKiAtICpFbGVtZW50IEluamVjdG9ycyo6IEVhY2ggY29tcG9uZW50IGluc3RhbmNlIGhhcyBhIFNoYWRvdyBET00uIFdpdGhpbiB0aGUgU2hhZG93IERPTSBlYWNoXG4gKiBlbGVtZW50IGhhcyBhbiBgRWxlbWVudEluamVjdG9yYFxuICogICAgIHdoaWNoIGZvbGxvdyB0aGUgc2FtZSBwYXJlbnQtY2hpbGQgaGllcmFyY2h5IGFzIHRoZSBET00gZWxlbWVudHMgdGhlbXNlbHZlcy5cbiAqXG4gKiBXaGVuIGEgdGVtcGxhdGUgaXMgaW5zdGFudGlhdGVkLCBpdCBhbHNvIG11c3QgaW5zdGFudGlhdGUgdGhlIGNvcnJlc3BvbmRpbmcgZGlyZWN0aXZlcyBpbiBhXG4gKiBkZXB0aC1maXJzdCBvcmRlci4gVGhlXG4gKiBjdXJyZW50IGBFbGVtZW50SW5qZWN0b3JgIHJlc29sdmVzIHRoZSBjb25zdHJ1Y3RvciBkZXBlbmRlbmNpZXMgZm9yIGVhY2ggZGlyZWN0aXZlLlxuICpcbiAqIEFuZ3VsYXIgdGhlbiByZXNvbHZlcyBkZXBlbmRlbmNpZXMgYXMgZm9sbG93cywgYWNjb3JkaW5nIHRvIHRoZSBvcmRlciBpbiB3aGljaCB0aGV5IGFwcGVhciBpbiB0aGVcbiAqIHtAbGluayBWaWV3TWV0YWRhdGF9OlxuICpcbiAqIDEuIERlcGVuZGVuY2llcyBvbiB0aGUgY3VycmVudCBlbGVtZW50XG4gKiAyLiBEZXBlbmRlbmNpZXMgb24gZWxlbWVudCBpbmplY3RvcnMgYW5kIHRoZWlyIHBhcmVudHMgdW50aWwgaXQgZW5jb3VudGVycyBhIFNoYWRvdyBET00gYm91bmRhcnlcbiAqIDMuIERlcGVuZGVuY2llcyBvbiBjb21wb25lbnQgaW5qZWN0b3JzIGFuZCB0aGVpciBwYXJlbnRzIHVudGlsIGl0IGVuY291bnRlcnMgdGhlIHJvb3QgY29tcG9uZW50XG4gKiA0LiBEZXBlbmRlbmNpZXMgb24gcHJlLWV4aXN0aW5nIGluamVjdG9yc1xuICpcbiAqXG4gKiBUaGUgYEVsZW1lbnRJbmplY3RvcmAgY2FuIGluamVjdCBvdGhlciBkaXJlY3RpdmVzLCBlbGVtZW50LXNwZWNpZmljIHNwZWNpYWwgb2JqZWN0cywgb3IgaXQgY2FuXG4gKiBkZWxlZ2F0ZSB0byB0aGUgcGFyZW50XG4gKiBpbmplY3Rvci5cbiAqXG4gKiBUbyBpbmplY3Qgb3RoZXIgZGlyZWN0aXZlcywgZGVjbGFyZSB0aGUgY29uc3RydWN0b3IgcGFyYW1ldGVyIGFzOlxuICogLSBgZGlyZWN0aXZlOkRpcmVjdGl2ZVR5cGVgOiBhIGRpcmVjdGl2ZSBvbiB0aGUgY3VycmVudCBlbGVtZW50IG9ubHlcbiAqIC0gYEBIb3N0KCkgZGlyZWN0aXZlOkRpcmVjdGl2ZVR5cGVgOiBhbnkgZGlyZWN0aXZlIHRoYXQgbWF0Y2hlcyB0aGUgdHlwZSBiZXR3ZWVuIHRoZSBjdXJyZW50XG4gKiBlbGVtZW50IGFuZCB0aGVcbiAqICAgIFNoYWRvdyBET00gcm9vdC5cbiAqIC0gYEBRdWVyeShEaXJlY3RpdmVUeXBlKSBxdWVyeTpRdWVyeUxpc3Q8RGlyZWN0aXZlVHlwZT5gOiBBIGxpdmUgY29sbGVjdGlvbiBvZiBkaXJlY3QgY2hpbGRcbiAqIGRpcmVjdGl2ZXMuXG4gKiAtIGBAUXVlcnlEZXNjZW5kYW50cyhEaXJlY3RpdmVUeXBlKSBxdWVyeTpRdWVyeUxpc3Q8RGlyZWN0aXZlVHlwZT5gOiBBIGxpdmUgY29sbGVjdGlvbiBvZiBhbnlcbiAqIGNoaWxkIGRpcmVjdGl2ZXMuXG4gKlxuICogVG8gaW5qZWN0IGVsZW1lbnQtc3BlY2lmaWMgc3BlY2lhbCBvYmplY3RzLCBkZWNsYXJlIHRoZSBjb25zdHJ1Y3RvciBwYXJhbWV0ZXIgYXM6XG4gKiAtIGBlbGVtZW50OiBFbGVtZW50UmVmYCB0byBvYnRhaW4gYSByZWZlcmVuY2UgdG8gbG9naWNhbCBlbGVtZW50IGluIHRoZSB2aWV3LlxuICogLSBgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZmAgdG8gY29udHJvbCBjaGlsZCB0ZW1wbGF0ZSBpbnN0YW50aWF0aW9uLCBmb3JcbiAqIHtAbGluayBEaXJlY3RpdmVNZXRhZGF0YX0gZGlyZWN0aXZlcyBvbmx5XG4gKiAtIGBiaW5kaW5nUHJvcGFnYXRpb246IEJpbmRpbmdQcm9wYWdhdGlvbmAgdG8gY29udHJvbCBjaGFuZ2UgZGV0ZWN0aW9uIGluIGEgbW9yZSBncmFudWxhciB3YXkuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgZGVtb25zdHJhdGVzIGhvdyBkZXBlbmRlbmN5IGluamVjdGlvbiByZXNvbHZlcyBjb25zdHJ1Y3RvciBhcmd1bWVudHMgaW5cbiAqIHByYWN0aWNlLlxuICpcbiAqXG4gKiBBc3N1bWUgdGhpcyBIVE1MIHRlbXBsYXRlOlxuICpcbiAqIGBgYFxuICogPGRpdiBkZXBlbmRlbmN5PVwiMVwiPlxuICogICA8ZGl2IGRlcGVuZGVuY3k9XCIyXCI+XG4gKiAgICAgPGRpdiBkZXBlbmRlbmN5PVwiM1wiIG15LWRpcmVjdGl2ZT5cbiAqICAgICAgIDxkaXYgZGVwZW5kZW5jeT1cIjRcIj5cbiAqICAgICAgICAgPGRpdiBkZXBlbmRlbmN5PVwiNVwiPjwvZGl2PlxuICogICAgICAgPC9kaXY+XG4gKiAgICAgICA8ZGl2IGRlcGVuZGVuY3k9XCI2XCI+PC9kaXY+XG4gKiAgICAgPC9kaXY+XG4gKiAgIDwvZGl2PlxuICogPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBXaXRoIHRoZSBmb2xsb3dpbmcgYGRlcGVuZGVuY3lgIGRlY29yYXRvciBhbmQgYFNvbWVTZXJ2aWNlYCBpbmplY3RhYmxlIGNsYXNzLlxuICpcbiAqIGBgYFxuICogQEluamVjdGFibGUoKVxuICogY2xhc3MgU29tZVNlcnZpY2Uge1xuICogfVxuICpcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ1tkZXBlbmRlbmN5XScsXG4gKiAgIGlucHV0czogW1xuICogICAgICdpZDogZGVwZW5kZW5jeSdcbiAqICAgXVxuICogfSlcbiAqIGNsYXNzIERlcGVuZGVuY3kge1xuICogICBpZDpzdHJpbmc7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBMZXQncyBzdGVwIHRocm91Z2ggdGhlIGRpZmZlcmVudCB3YXlzIGluIHdoaWNoIGBNeURpcmVjdGl2ZWAgY291bGQgYmUgZGVjbGFyZWQuLi5cbiAqXG4gKlxuICogIyMjIE5vIGluamVjdGlvblxuICpcbiAqIEhlcmUgdGhlIGNvbnN0cnVjdG9yIGlzIGRlY2xhcmVkIHdpdGggbm8gYXJndW1lbnRzLCB0aGVyZWZvcmUgbm90aGluZyBpcyBpbmplY3RlZCBpbnRvXG4gKiBgTXlEaXJlY3RpdmVgLlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKCkge1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBubyBkZXBlbmRlbmNpZXMuXG4gKlxuICpcbiAqICMjIyBDb21wb25lbnQtbGV2ZWwgaW5qZWN0aW9uXG4gKlxuICogRGlyZWN0aXZlcyBjYW4gaW5qZWN0IGFueSBpbmplY3RhYmxlIGluc3RhbmNlIGZyb20gdGhlIGNsb3Nlc3QgY29tcG9uZW50IGluamVjdG9yIG9yIGFueSBvZiBpdHNcbiAqIHBhcmVudHMuXG4gKlxuICogSGVyZSwgdGhlIGNvbnN0cnVjdG9yIGRlY2xhcmVzIGEgcGFyYW1ldGVyLCBgc29tZVNlcnZpY2VgLCBhbmQgaW5qZWN0cyB0aGUgYFNvbWVTZXJ2aWNlYCB0eXBlXG4gKiBmcm9tIHRoZSBwYXJlbnRcbiAqIGNvbXBvbmVudCdzIGluamVjdG9yLlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3Ioc29tZVNlcnZpY2U6IFNvbWVTZXJ2aWNlKSB7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIHdvdWxkIGJlIGluc3RhbnRpYXRlZCB3aXRoIGEgZGVwZW5kZW5jeSBvbiBgU29tZVNlcnZpY2VgLlxuICpcbiAqXG4gKiAjIyMgSW5qZWN0aW5nIGEgZGlyZWN0aXZlIGZyb20gdGhlIGN1cnJlbnQgZWxlbWVudFxuICpcbiAqIERpcmVjdGl2ZXMgY2FuIGluamVjdCBvdGhlciBkaXJlY3RpdmVzIGRlY2xhcmVkIG9uIHRoZSBjdXJyZW50IGVsZW1lbnQuXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoZGVwZW5kZW5jeTogRGVwZW5kZW5jeSkge1xuICogICAgIGV4cGVjdChkZXBlbmRlbmN5LmlkKS50b0VxdWFsKDMpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqIFRoaXMgZGlyZWN0aXZlIHdvdWxkIGJlIGluc3RhbnRpYXRlZCB3aXRoIGBEZXBlbmRlbmN5YCBkZWNsYXJlZCBhdCB0aGUgc2FtZSBlbGVtZW50LCBpbiB0aGlzIGNhc2VcbiAqIGBkZXBlbmRlbmN5PVwiM1wiYC5cbiAqXG4gKiAjIyMgSW5qZWN0aW5nIGEgZGlyZWN0aXZlIGZyb20gYW55IGFuY2VzdG9yIGVsZW1lbnRzXG4gKlxuICogRGlyZWN0aXZlcyBjYW4gaW5qZWN0IG90aGVyIGRpcmVjdGl2ZXMgZGVjbGFyZWQgb24gYW55IGFuY2VzdG9yIGVsZW1lbnQgKGluIHRoZSBjdXJyZW50IFNoYWRvd1xuICogRE9NKSwgaS5lLiBvbiB0aGUgY3VycmVudCBlbGVtZW50LCB0aGVcbiAqIHBhcmVudCBlbGVtZW50LCBvciBpdHMgcGFyZW50cy5cbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKEBIb3N0KCkgZGVwZW5kZW5jeTogRGVwZW5kZW5jeSkge1xuICogICAgIGV4cGVjdChkZXBlbmRlbmN5LmlkKS50b0VxdWFsKDIpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBgQEhvc3RgIGNoZWNrcyB0aGUgY3VycmVudCBlbGVtZW50LCB0aGUgcGFyZW50LCBhcyB3ZWxsIGFzIGl0cyBwYXJlbnRzIHJlY3Vyc2l2ZWx5LiBJZlxuICogYGRlcGVuZGVuY3k9XCIyXCJgIGRpZG4ndFxuICogZXhpc3Qgb24gdGhlIGRpcmVjdCBwYXJlbnQsIHRoaXMgaW5qZWN0aW9uIHdvdWxkXG4gKiBoYXZlIHJldHVybmVkXG4gKiBgZGVwZW5kZW5jeT1cIjFcImAuXG4gKlxuICpcbiAqICMjIyBJbmplY3RpbmcgYSBsaXZlIGNvbGxlY3Rpb24gb2YgZGlyZWN0IGNoaWxkIGRpcmVjdGl2ZXNcbiAqXG4gKlxuICogQSBkaXJlY3RpdmUgY2FuIGFsc28gcXVlcnkgZm9yIG90aGVyIGNoaWxkIGRpcmVjdGl2ZXMuIFNpbmNlIHBhcmVudCBkaXJlY3RpdmVzIGFyZSBpbnN0YW50aWF0ZWRcbiAqIGJlZm9yZSBjaGlsZCBkaXJlY3RpdmVzLCBhIGRpcmVjdGl2ZSBjYW4ndCBzaW1wbHkgaW5qZWN0IHRoZSBsaXN0IG9mIGNoaWxkIGRpcmVjdGl2ZXMuIEluc3RlYWQsXG4gKiB0aGUgZGlyZWN0aXZlIGluamVjdHMgYSB7QGxpbmsgUXVlcnlMaXN0fSwgd2hpY2ggdXBkYXRlcyBpdHMgY29udGVudHMgYXMgY2hpbGRyZW4gYXJlIGFkZGVkLFxuICogcmVtb3ZlZCwgb3IgbW92ZWQgYnkgYSBkaXJlY3RpdmUgdGhhdCB1c2VzIGEge0BsaW5rIFZpZXdDb250YWluZXJSZWZ9IHN1Y2ggYXMgYSBgbmdGb3JgLCBhblxuICogYG5nSWZgLCBvciBhbiBgbmdTd2l0Y2hgLlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeShEZXBlbmRlbmN5KSBkZXBlbmRlbmNpZXM6UXVlcnlMaXN0PERlcGVuZGVuY3k+KSB7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIHdvdWxkIGJlIGluc3RhbnRpYXRlZCB3aXRoIGEge0BsaW5rIFF1ZXJ5TGlzdH0gd2hpY2ggY29udGFpbnMgYERlcGVuZGVuY3lgIDQgYW5kXG4gKiA2LiBIZXJlLCBgRGVwZW5kZW5jeWAgNSB3b3VsZCBub3QgYmUgaW5jbHVkZWQsIGJlY2F1c2UgaXQgaXMgbm90IGEgZGlyZWN0IGNoaWxkLlxuICpcbiAqICMjIyBJbmplY3RpbmcgYSBsaXZlIGNvbGxlY3Rpb24gb2YgZGVzY2VuZGFudCBkaXJlY3RpdmVzXG4gKlxuICogQnkgcGFzc2luZyB0aGUgZGVzY2VuZGFudCBmbGFnIHRvIGBAUXVlcnlgIGFib3ZlLCB3ZSBjYW4gaW5jbHVkZSB0aGUgY2hpbGRyZW4gb2YgdGhlIGNoaWxkXG4gKiBlbGVtZW50cy5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoRGVwZW5kZW5jeSwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgZGVwZW5kZW5jaWVzOlF1ZXJ5TGlzdDxEZXBlbmRlbmN5Pikge1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBhIFF1ZXJ5IHdoaWNoIHdvdWxkIGNvbnRhaW4gYERlcGVuZGVuY3lgIDQsIDUgYW5kIDYuXG4gKlxuICogIyMjIE9wdGlvbmFsIGluamVjdGlvblxuICpcbiAqIFRoZSBub3JtYWwgYmVoYXZpb3Igb2YgZGlyZWN0aXZlcyBpcyB0byByZXR1cm4gYW4gZXJyb3Igd2hlbiBhIHNwZWNpZmllZCBkZXBlbmRlbmN5IGNhbm5vdCBiZVxuICogcmVzb2x2ZWQuIElmIHlvdVxuICogd291bGQgbGlrZSB0byBpbmplY3QgYG51bGxgIG9uIHVucmVzb2x2ZWQgZGVwZW5kZW5jeSBpbnN0ZWFkLCB5b3UgY2FuIGFubm90YXRlIHRoYXQgZGVwZW5kZW5jeVxuICogd2l0aCBgQE9wdGlvbmFsKClgLlxuICogVGhpcyBleHBsaWNpdGx5IHBlcm1pdHMgdGhlIGF1dGhvciBvZiBhIHRlbXBsYXRlIHRvIHRyZWF0IHNvbWUgb2YgdGhlIHN1cnJvdW5kaW5nIGRpcmVjdGl2ZXMgYXNcbiAqIG9wdGlvbmFsLlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIGRlcGVuZGVuY3k6RGVwZW5kZW5jeSkge1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBhIGBEZXBlbmRlbmN5YCBkaXJlY3RpdmUgZm91bmQgb24gdGhlIGN1cnJlbnQgZWxlbWVudC5cbiAqIElmIG5vbmUgY2FuIGJlXG4gKiBmb3VuZCwgdGhlIGluamVjdG9yIHN1cHBsaWVzIGBudWxsYCBpbnN0ZWFkIG9mIHRocm93aW5nIGFuIGVycm9yLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogSGVyZSB3ZSB1c2UgYSBkZWNvcmF0b3IgZGlyZWN0aXZlIHRvIHNpbXBseSBkZWZpbmUgYmFzaWMgdG9vbC10aXAgYmVoYXZpb3IuXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdbdG9vbHRpcF0nLFxuICogICBpbnB1dHM6IFtcbiAqICAgICAndGV4dDogdG9vbHRpcCdcbiAqICAgXSxcbiAqICAgaG9zdDoge1xuICogICAgICcobW91c2VlbnRlciknOiAnb25Nb3VzZUVudGVyKCknLFxuICogICAgICcobW91c2VsZWF2ZSknOiAnb25Nb3VzZUxlYXZlKCknXG4gKiAgIH1cbiAqIH0pXG4gKiBjbGFzcyBUb29sdGlwe1xuICogICB0ZXh0OnN0cmluZztcbiAqICAgb3ZlcmxheTpPdmVybGF5OyAvLyBOT1QgWUVUIElNUExFTUVOVEVEXG4gKiAgIG92ZXJsYXlNYW5hZ2VyOk92ZXJsYXlNYW5hZ2VyOyAvLyBOT1QgWUVUIElNUExFTUVOVEVEXG4gKlxuICogICBjb25zdHJ1Y3RvcihvdmVybGF5TWFuYWdlcjpPdmVybGF5TWFuYWdlcikge1xuICogICAgIHRoaXMub3ZlcmxheSA9IG92ZXJsYXk7XG4gKiAgIH1cbiAqXG4gKiAgIG9uTW91c2VFbnRlcigpIHtcbiAqICAgICAvLyBleGFjdCBzaWduYXR1cmUgdG8gYmUgZGV0ZXJtaW5lZFxuICogICAgIHRoaXMub3ZlcmxheSA9IHRoaXMub3ZlcmxheU1hbmFnZXIub3Blbih0ZXh0LCAuLi4pO1xuICogICB9XG4gKlxuICogICBvbk1vdXNlTGVhdmUoKSB7XG4gKiAgICAgdGhpcy5vdmVybGF5LmNsb3NlKCk7XG4gKiAgICAgdGhpcy5vdmVybGF5ID0gbnVsbDtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKiBJbiBvdXIgSFRNTCB0ZW1wbGF0ZSwgd2UgY2FuIHRoZW4gYWRkIHRoaXMgYmVoYXZpb3IgdG8gYSBgPGRpdj5gIG9yIGFueSBvdGhlciBlbGVtZW50IHdpdGggdGhlXG4gKiBgdG9vbHRpcGAgc2VsZWN0b3IsXG4gKiBsaWtlIHNvOlxuICpcbiAqIGBgYFxuICogPGRpdiB0b29sdGlwPVwic29tZSB0ZXh0IGhlcmVcIj48L2Rpdj5cbiAqIGBgYFxuICpcbiAqIERpcmVjdGl2ZXMgY2FuIGFsc28gY29udHJvbCB0aGUgaW5zdGFudGlhdGlvbiwgZGVzdHJ1Y3Rpb24sIGFuZCBwb3NpdGlvbmluZyBvZiBpbmxpbmUgdGVtcGxhdGVcbiAqIGVsZW1lbnRzOlxuICpcbiAqIEEgZGlyZWN0aXZlIHVzZXMgYSB7QGxpbmsgVmlld0NvbnRhaW5lclJlZn0gdG8gaW5zdGFudGlhdGUsIGluc2VydCwgbW92ZSwgYW5kIGRlc3Ryb3kgdmlld3MgYXRcbiAqIHJ1bnRpbWUuXG4gKiBUaGUge0BsaW5rIFZpZXdDb250YWluZXJSZWZ9IGlzIGNyZWF0ZWQgYXMgYSByZXN1bHQgb2YgYDx0ZW1wbGF0ZT5gIGVsZW1lbnQsIGFuZCByZXByZXNlbnRzIGFcbiAqIGxvY2F0aW9uIGluIHRoZSBjdXJyZW50IHZpZXdcbiAqIHdoZXJlIHRoZXNlIGFjdGlvbnMgYXJlIHBlcmZvcm1lZC5cbiAqXG4gKiBWaWV3cyBhcmUgYWx3YXlzIGNyZWF0ZWQgYXMgY2hpbGRyZW4gb2YgdGhlIGN1cnJlbnQge0BsaW5rIFZpZXdNZXRhZGF0YX0sIGFuZCBhcyBzaWJsaW5ncyBvZiB0aGVcbiAqIGA8dGVtcGxhdGU+YCBlbGVtZW50LiBUaHVzIGFcbiAqIGRpcmVjdGl2ZSBpbiBhIGNoaWxkIHZpZXcgY2Fubm90IGluamVjdCB0aGUgZGlyZWN0aXZlIHRoYXQgY3JlYXRlZCBpdC5cbiAqXG4gKiBTaW5jZSBkaXJlY3RpdmVzIHRoYXQgY3JlYXRlIHZpZXdzIHZpYSBWaWV3Q29udGFpbmVycyBhcmUgY29tbW9uIGluIEFuZ3VsYXIsIGFuZCB1c2luZyB0aGUgZnVsbFxuICogYDx0ZW1wbGF0ZT5gIGVsZW1lbnQgc3ludGF4IGlzIHdvcmR5LCBBbmd1bGFyXG4gKiBhbHNvIHN1cHBvcnRzIGEgc2hvcnRoYW5kIG5vdGF0aW9uOiBgPGxpICpmb289XCJiYXJcIj5gIGFuZCBgPGxpIHRlbXBsYXRlPVwiZm9vOiBiYXJcIj5gIGFyZVxuICogZXF1aXZhbGVudC5cbiAqXG4gKiBUaHVzLFxuICpcbiAqIGBgYFxuICogPHVsPlxuICogICA8bGkgKmZvbz1cImJhclwiIHRpdGxlPVwidGV4dFwiPjwvbGk+XG4gKiA8L3VsPlxuICogYGBgXG4gKlxuICogRXhwYW5kcyBpbiB1c2UgdG86XG4gKlxuICogYGBgXG4gKiA8dWw+XG4gKiAgIDx0ZW1wbGF0ZSBbZm9vXT1cImJhclwiPlxuICogICAgIDxsaSB0aXRsZT1cInRleHRcIj48L2xpPlxuICogICA8L3RlbXBsYXRlPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIE5vdGljZSB0aGF0IGFsdGhvdWdoIHRoZSBzaG9ydGhhbmQgcGxhY2VzIGAqZm9vPVwiYmFyXCJgIHdpdGhpbiB0aGUgYDxsaT5gIGVsZW1lbnQsIHRoZSBiaW5kaW5nIGZvclxuICogdGhlIGRpcmVjdGl2ZVxuICogY29udHJvbGxlciBpcyBjb3JyZWN0bHkgaW5zdGFudGlhdGVkIG9uIHRoZSBgPHRlbXBsYXRlPmAgZWxlbWVudCByYXRoZXIgdGhhbiB0aGUgYDxsaT5gIGVsZW1lbnQuXG4gKlxuICogIyMgTGlmZWN5Y2xlIGhvb2tzXG4gKlxuICogV2hlbiB0aGUgZGlyZWN0aXZlIGNsYXNzIGltcGxlbWVudHMgc29tZSB7QGxpbmsgLi4vLi4vZ3VpZGUvbGlmZWN5Y2xlLWhvb2tzLmh0bWx9IHRoZSBjYWxsYmFja3NcbiAqIGFyZSBjYWxsZWQgYnkgdGhlIGNoYW5nZSBkZXRlY3Rpb24gYXQgZGVmaW5lZCBwb2ludHMgaW4gdGltZSBkdXJpbmcgdGhlIGxpZmUgb2YgdGhlIGRpcmVjdGl2ZS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIExldCdzIHN1cHBvc2Ugd2Ugd2FudCB0byBpbXBsZW1lbnQgdGhlIGB1bmxlc3NgIGJlaGF2aW9yLCB0byBjb25kaXRpb25hbGx5IGluY2x1ZGUgYSB0ZW1wbGF0ZS5cbiAqXG4gKiBIZXJlIGlzIGEgc2ltcGxlIGRpcmVjdGl2ZSB0aGF0IHRyaWdnZXJzIG9uIGFuIGB1bmxlc3NgIHNlbGVjdG9yOlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnW3VubGVzc10nLFxuICogICBpbnB1dHM6IFsndW5sZXNzJ11cbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgVW5sZXNzIHtcbiAqICAgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZjtcbiAqICAgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmO1xuICogICBwcmV2Q29uZGl0aW9uOiBib29sZWFuO1xuICpcbiAqICAgY29uc3RydWN0b3Iodmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiwgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmKSB7XG4gKiAgICAgdGhpcy52aWV3Q29udGFpbmVyID0gdmlld0NvbnRhaW5lcjtcbiAqICAgICB0aGlzLnRlbXBsYXRlUmVmID0gdGVtcGxhdGVSZWY7XG4gKiAgICAgdGhpcy5wcmV2Q29uZGl0aW9uID0gbnVsbDtcbiAqICAgfVxuICpcbiAqICAgc2V0IHVubGVzcyhuZXdDb25kaXRpb24pIHtcbiAqICAgICBpZiAobmV3Q29uZGl0aW9uICYmIChpc0JsYW5rKHRoaXMucHJldkNvbmRpdGlvbikgfHwgIXRoaXMucHJldkNvbmRpdGlvbikpIHtcbiAqICAgICAgIHRoaXMucHJldkNvbmRpdGlvbiA9IHRydWU7XG4gKiAgICAgICB0aGlzLnZpZXdDb250YWluZXIuY2xlYXIoKTtcbiAqICAgICB9IGVsc2UgaWYgKCFuZXdDb25kaXRpb24gJiYgKGlzQmxhbmsodGhpcy5wcmV2Q29uZGl0aW9uKSB8fCB0aGlzLnByZXZDb25kaXRpb24pKSB7XG4gKiAgICAgICB0aGlzLnByZXZDb25kaXRpb24gPSBmYWxzZTtcbiAqICAgICAgIHRoaXMudmlld0NvbnRhaW5lci5jcmVhdGUodGhpcy50ZW1wbGF0ZVJlZik7XG4gKiAgICAgfVxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBXZSBjYW4gdGhlbiB1c2UgdGhpcyBgdW5sZXNzYCBzZWxlY3RvciBpbiBhIHRlbXBsYXRlOlxuICogYGBgXG4gKiA8dWw+XG4gKiAgIDxsaSAqdW5sZXNzPVwiZXhwclwiPjwvbGk+XG4gKiA8L3VsPlxuICogYGBgXG4gKlxuICogT25jZSB0aGUgZGlyZWN0aXZlIGluc3RhbnRpYXRlcyB0aGUgY2hpbGQgdmlldywgdGhlIHNob3J0aGFuZCBub3RhdGlvbiBmb3IgdGhlIHRlbXBsYXRlIGV4cGFuZHNcbiAqIGFuZCB0aGUgcmVzdWx0IGlzOlxuICpcbiAqIGBgYFxuICogPHVsPlxuICogICA8dGVtcGxhdGUgW3VubGVzc109XCJleHBcIj5cbiAqICAgICA8bGk+PC9saT5cbiAqICAgPC90ZW1wbGF0ZT5cbiAqICAgPGxpPjwvbGk+XG4gKiA8L3VsPlxuICogYGBgXG4gKlxuICogTm90ZSBhbHNvIHRoYXQgYWx0aG91Z2ggdGhlIGA8bGk+PC9saT5gIHRlbXBsYXRlIHN0aWxsIGV4aXN0cyBpbnNpZGUgdGhlIGA8dGVtcGxhdGU+PC90ZW1wbGF0ZT5gLFxuICogdGhlIGluc3RhbnRpYXRlZFxuICogdmlldyBvY2N1cnMgb24gdGhlIHNlY29uZCBgPGxpPjwvbGk+YCB3aGljaCBpcyBhIHNpYmxpbmcgdG8gdGhlIGA8dGVtcGxhdGU+YCBlbGVtZW50LlxuICovXG5leHBvcnQgdmFyIERpcmVjdGl2ZTogRGlyZWN0aXZlRmFjdG9yeSA9IDxEaXJlY3RpdmVGYWN0b3J5Pm1ha2VEZWNvcmF0b3IoRGlyZWN0aXZlTWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIFZpZXdNZXRhZGF0YS5cbi8qKlxuICogTWV0YWRhdGEgcHJvcGVydGllcyBhdmFpbGFibGUgZm9yIGNvbmZpZ3VyaW5nIFZpZXdzLlxuICpcbiAqIEVhY2ggQW5ndWxhciBjb21wb25lbnQgcmVxdWlyZXMgYSBzaW5nbGUgYEBDb21wb25lbnRgIGFuZCBhdCBsZWFzdCBvbmUgYEBWaWV3YCBhbm5vdGF0aW9uLiBUaGVcbiAqIGBAVmlld2AgYW5ub3RhdGlvbiBzcGVjaWZpZXMgdGhlIEhUTUwgdGVtcGxhdGUgdG8gdXNlLCBhbmQgbGlzdHMgdGhlIGRpcmVjdGl2ZXMgdGhhdCBhcmUgYWN0aXZlXG4gKiB3aXRoaW4gdGhlIHRlbXBsYXRlLlxuICpcbiAqIFdoZW4gYSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkLCB0aGUgdGVtcGxhdGUgaXMgbG9hZGVkIGludG8gdGhlIGNvbXBvbmVudCdzIHNoYWRvdyByb290LCBhbmRcbiAqIHRoZSBleHByZXNzaW9ucyBhbmQgc3RhdGVtZW50cyBpbiB0aGUgdGVtcGxhdGUgYXJlIGV2YWx1YXRlZCBhZ2FpbnN0IHRoZSBjb21wb25lbnQuXG4gKlxuICogRm9yIGRldGFpbHMgb24gdGhlIGBAQ29tcG9uZW50YCBhbm5vdGF0aW9uLCBzZWUge0BsaW5rIENvbXBvbmVudE1ldGFkYXRhfS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnZ3JlZXQnLFxuICogICB0ZW1wbGF0ZTogJ0hlbGxvIHt7bmFtZX19IScsXG4gKiAgIGRpcmVjdGl2ZXM6IFtHcmVldFVzZXIsIEJvbGRdXG4gKiB9KVxuICogY2xhc3MgR3JlZXQge1xuICogICBuYW1lOiBzdHJpbmc7XG4gKlxuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgICB0aGlzLm5hbWUgPSAnV29ybGQnO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xudmFyIFZpZXc6IFZpZXdGYWN0b3J5ID0gPFZpZXdGYWN0b3J5Pm1ha2VEZWNvcmF0b3IoVmlld01ldGFkYXRhLCAoZm46IGFueSkgPT4gZm4uVmlldyA9IFZpZXcpO1xuXG4vKipcbiAqIFNwZWNpZmllcyB0aGF0IGEgY29uc3RhbnQgYXR0cmlidXRlIHZhbHVlIHNob3VsZCBiZSBpbmplY3RlZC5cbiAqXG4gKiBUaGUgZGlyZWN0aXZlIGNhbiBpbmplY3QgY29uc3RhbnQgc3RyaW5nIGxpdGVyYWxzIG9mIGhvc3QgZWxlbWVudCBhdHRyaWJ1dGVzLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogU3VwcG9zZSB3ZSBoYXZlIGFuIGA8aW5wdXQ+YCBlbGVtZW50IGFuZCB3YW50IHRvIGtub3cgaXRzIGB0eXBlYC5cbiAqXG4gKiBgYGBodG1sXG4gKiA8aW5wdXQgdHlwZT1cInRleHRcIj5cbiAqIGBgYFxuICpcbiAqIEEgZGVjb3JhdG9yIGNhbiBpbmplY3Qgc3RyaW5nIGxpdGVyYWwgYHRleHRgIGxpa2Ugc286XG4gKlxuICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbWV0YWRhdGEudHMgcmVnaW9uPSdhdHRyaWJ1dGVNZXRhZGF0YSd9XG4gKi9cbmV4cG9ydCB2YXIgQXR0cmlidXRlOiBBdHRyaWJ1dGVGYWN0b3J5ID0gbWFrZVBhcmFtRGVjb3JhdG9yKEF0dHJpYnV0ZU1ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBRdWVyeU1ldGFkYXRhLlxuLyoqXG4gKiBEZWNsYXJlcyBhbiBpbmplY3RhYmxlIHBhcmFtZXRlciB0byBiZSBhIGxpdmUgbGlzdCBvZiBkaXJlY3RpdmVzIG9yIHZhcmlhYmxlXG4gKiBiaW5kaW5ncyBmcm9tIHRoZSBjb250ZW50IGNoaWxkcmVuIG9mIGEgZGlyZWN0aXZlLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9sWTltOEhMeTd6MDZ2RG9VYVNOMj9wPXByZXZpZXcpKVxuICpcbiAqIEFzc3VtZSB0aGF0IGA8dGFicz5gIGNvbXBvbmVudCB3b3VsZCBsaWtlIHRvIGdldCBhIGxpc3QgaXRzIGNoaWxkcmVuIGA8cGFuZT5gXG4gKiBjb21wb25lbnRzIGFzIHNob3duIGluIHRoaXMgZXhhbXBsZTpcbiAqXG4gKiBgYGBodG1sXG4gKiA8dGFicz5cbiAqICAgPHBhbmUgdGl0bGU9XCJPdmVydmlld1wiPi4uLjwvcGFuZT5cbiAqICAgPHBhbmUgKm5nRm9yPVwiI28gb2Ygb2JqZWN0c1wiIFt0aXRsZV09XCJvLnRpdGxlXCI+e3tvLnRleHR9fTwvcGFuZT5cbiAqIDwvdGFicz5cbiAqIGBgYFxuICpcbiAqIFRoZSBwcmVmZXJyZWQgc29sdXRpb24gaXMgdG8gcXVlcnkgZm9yIGBQYW5lYCBkaXJlY3RpdmVzIHVzaW5nIHRoaXMgZGVjb3JhdG9yLlxuICpcbiAqIGBgYGphdmFzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3BhbmUnLFxuICogICBpbnB1dHM6IFsndGl0bGUnXVxuICogfSlcbiAqIGNsYXNzIFBhbmUge1xuICogICB0aXRsZTpzdHJpbmc7XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgc2VsZWN0b3I6ICd0YWJzJyxcbiAqICB0ZW1wbGF0ZTogYFxuICogICAgPHVsPlxuICogICAgICA8bGkgKm5nRm9yPVwiI3BhbmUgb2YgcGFuZXNcIj57e3BhbmUudGl0bGV9fTwvbGk+XG4gKiAgICA8L3VsPlxuICogICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuICogIGBcbiAqIH0pXG4gKiBjbGFzcyBUYWJzIHtcbiAqICAgcGFuZXM6IFF1ZXJ5TGlzdDxQYW5lPjtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KFBhbmUpIHBhbmVzOlF1ZXJ5TGlzdDxQYW5lPikge1xuICogICAgIHRoaXMucGFuZXMgPSBwYW5lcztcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogQSBxdWVyeSBjYW4gbG9vayBmb3IgdmFyaWFibGUgYmluZGluZ3MgYnkgcGFzc2luZyBpbiBhIHN0cmluZyB3aXRoIGRlc2lyZWQgYmluZGluZyBzeW1ib2wuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L3NUMmoyNWNIMWRVUkF5QlJDS3gxP3A9cHJldmlldykpXG4gKiBgYGBodG1sXG4gKiA8c2Vla2VyPlxuICogICA8ZGl2ICNmaW5kbWU+Li4uPC9kaXY+XG4gKiA8L3NlZWtlcj5cbiAqXG4gKiBAQ29tcG9uZW50KHsgc2VsZWN0b3I6ICdzZWVrZXInIH0pXG4gKiBjbGFzcyBzZWVrZXIge1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoJ2ZpbmRtZScpIGVsTGlzdDogUXVlcnlMaXN0PEVsZW1lbnRSZWY+KSB7Li4ufVxuICogfVxuICogYGBgXG4gKlxuICogSW4gdGhpcyBjYXNlIHRoZSBvYmplY3QgdGhhdCBpcyBpbmplY3RlZCBkZXBlbmQgb24gdGhlIHR5cGUgb2YgdGhlIHZhcmlhYmxlXG4gKiBiaW5kaW5nLiBJdCBjYW4gYmUgYW4gRWxlbWVudFJlZiwgYSBkaXJlY3RpdmUgb3IgYSBjb21wb25lbnQuXG4gKlxuICogUGFzc2luZyBpbiBhIGNvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIHZhcmlhYmxlIGJpbmRpbmdzIHdpbGwgcXVlcnkgZm9yIGFsbCBvZiB0aGVtLlxuICpcbiAqIGBgYGh0bWxcbiAqIDxzZWVrZXI+XG4gKiAgIDxkaXYgI2ZpbmRNZT4uLi48L2Rpdj5cbiAqICAgPGRpdiAjZmluZE1lVG9vPi4uLjwvZGl2PlxuICogPC9zZWVrZXI+XG4gKlxuICogIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3NlZWtlcidcbiAqIH0pXG4gKiBjbGFzcyBTZWVrZXIge1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoJ2ZpbmRNZSwgZmluZE1lVG9vJykgZWxMaXN0OiBRdWVyeUxpc3Q8RWxlbWVudFJlZj4pIHsuLi59XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBDb25maWd1cmUgd2hldGhlciBxdWVyeSBsb29rcyBmb3IgZGlyZWN0IGNoaWxkcmVuIG9yIGFsbCBkZXNjZW5kYW50c1xuICogb2YgdGhlIHF1ZXJ5aW5nIGVsZW1lbnQsIGJ5IHVzaW5nIHRoZSBgZGVzY2VuZGFudHNgIHBhcmFtZXRlci5cbiAqIEl0IGlzIHNldCB0byBgZmFsc2VgIGJ5IGRlZmF1bHQuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L3d0R2VCOTc3YnY3cXZBNUZUWWw5P3A9cHJldmlldykpXG4gKiBgYGBodG1sXG4gKiA8Y29udGFpbmVyICNmaXJzdD5cbiAqICAgPGl0ZW0+YTwvaXRlbT5cbiAqICAgPGl0ZW0+YjwvaXRlbT5cbiAqICAgPGNvbnRhaW5lciAjc2Vjb25kPlxuICogICAgIDxpdGVtPmM8L2l0ZW0+XG4gKiAgIDwvY29udGFpbmVyPlxuICogPC9jb250YWluZXI+XG4gKiBgYGBcbiAqXG4gKiBXaGVuIHF1ZXJ5aW5nIGZvciBpdGVtcywgdGhlIGZpcnN0IGNvbnRhaW5lciB3aWxsIHNlZSBvbmx5IGBhYCBhbmQgYGJgIGJ5IGRlZmF1bHQsXG4gKiBidXQgd2l0aCBgUXVlcnkoVGV4dERpcmVjdGl2ZSwge2Rlc2NlbmRhbnRzOiB0cnVlfSlgIGl0IHdpbGwgc2VlIGBjYCB0b28uXG4gKlxuICogVGhlIHF1ZXJpZWQgZGlyZWN0aXZlcyBhcmUga2VwdCBpbiBhIGRlcHRoLWZpcnN0IHByZS1vcmRlciB3aXRoIHJlc3BlY3QgdG8gdGhlaXJcbiAqIHBvc2l0aW9ucyBpbiB0aGUgRE9NLlxuICpcbiAqIFF1ZXJ5IGRvZXMgbm90IGxvb2sgZGVlcCBpbnRvIGFueSBzdWJjb21wb25lbnQgdmlld3MuXG4gKlxuICogUXVlcnkgaXMgdXBkYXRlZCBhcyBwYXJ0IG9mIHRoZSBjaGFuZ2UtZGV0ZWN0aW9uIGN5Y2xlLiBTaW5jZSBjaGFuZ2UgZGV0ZWN0aW9uXG4gKiBoYXBwZW5zIGFmdGVyIGNvbnN0cnVjdGlvbiBvZiBhIGRpcmVjdGl2ZSwgUXVlcnlMaXN0IHdpbGwgYWx3YXlzIGJlIGVtcHR5IHdoZW4gb2JzZXJ2ZWQgaW4gdGhlXG4gKiBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBUaGUgaW5qZWN0ZWQgb2JqZWN0IGlzIGFuIHVubW9kaWZpYWJsZSBsaXZlIGxpc3QuXG4gKiBTZWUge0BsaW5rIFF1ZXJ5TGlzdH0gZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuZXhwb3J0IHZhciBRdWVyeTogUXVlcnlGYWN0b3J5ID0gbWFrZVBhcmFtRGVjb3JhdG9yKFF1ZXJ5TWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhLlxuLyoqXG4gKiBDb25maWd1cmVzIGEgY29udGVudCBxdWVyeS5cbiAqXG4gKiBDb250ZW50IHF1ZXJpZXMgYXJlIHNldCBiZWZvcmUgdGhlIGBuZ0FmdGVyQ29udGVudEluaXRgIGNhbGxiYWNrIGlzIGNhbGxlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnc29tZURpcidcbiAqIH0pXG4gKiBjbGFzcyBTb21lRGlyIHtcbiAqICAgQENvbnRlbnRDaGlsZHJlbihDaGlsZERpcmVjdGl2ZSkgY29udGVudENoaWxkcmVuOiBRdWVyeUxpc3Q8Q2hpbGREaXJlY3RpdmU+O1xuICpcbiAqICAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICogICAgIC8vIGNvbnRlbnRDaGlsZHJlbiBpcyBzZXRcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCB2YXIgQ29udGVudENoaWxkcmVuOiBDb250ZW50Q2hpbGRyZW5GYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoQ29udGVudENoaWxkcmVuTWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIENvbnRlbnRDaGlsZE1ldGFkYXRhLlxuLyoqXG4gKiBDb25maWd1cmVzIGEgY29udGVudCBxdWVyeS5cbiAqXG4gKiBDb250ZW50IHF1ZXJpZXMgYXJlIHNldCBiZWZvcmUgdGhlIGBuZ0FmdGVyQ29udGVudEluaXRgIGNhbGxiYWNrIGlzIGNhbGxlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnc29tZURpcidcbiAqIH0pXG4gKiBjbGFzcyBTb21lRGlyIHtcbiAqICAgQENvbnRlbnRDaGlsZChDaGlsZERpcmVjdGl2ZSkgY29udGVudENoaWxkO1xuICpcbiAqICAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICogICAgIC8vIGNvbnRlbnRDaGlsZCBpcyBzZXRcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCB2YXIgQ29udGVudENoaWxkOiBDb250ZW50Q2hpbGRGYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoQ29udGVudENoaWxkTWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIFZpZXdDaGlsZHJlbk1ldGFkYXRhLlxuLyoqXG4gKiBEZWNsYXJlcyBhIGxpc3Qgb2YgY2hpbGQgZWxlbWVudCByZWZlcmVuY2VzLlxuICpcbiAqIEFuZ3VsYXIgYXV0b21hdGljYWxseSB1cGRhdGVzIHRoZSBsaXN0IHdoZW4gdGhlIERPTSBpcyB1cGRhdGVkLlxuICpcbiAqIGBWaWV3Q2hpbGRyZW5gIHRha2VzIGEgYXJndW1lbnQgdG8gc2VsZWN0IGVsZW1lbnRzLlxuICpcbiAqIC0gSWYgdGhlIGFyZ3VtZW50IGlzIGEgdHlwZSwgZGlyZWN0aXZlcyBvciBjb21wb25lbnRzIHdpdGggdGhlIHR5cGUgd2lsbCBiZSBib3VuZC5cbiAqXG4gKiAtIElmIHRoZSBhcmd1bWVudCBpcyBhIHN0cmluZywgdGhlIHN0cmluZyBpcyBpbnRlcnByZXRlZCBhcyBhIGxpc3Qgb2YgY29tbWEtc2VwYXJhdGVkIHNlbGVjdG9ycy5cbiAqIEZvciBlYWNoIHNlbGVjdG9yLCBhbiBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIG1hdGNoaW5nIHRlbXBsYXRlIHZhcmlhYmxlIChlLmcuIGAjY2hpbGRgKSB3aWxsIGJlXG4gKiBib3VuZC5cbiAqXG4gKiBWaWV3IGNoaWxkcmVuIGFyZSBzZXQgYmVmb3JlIHRoZSBgbmdBZnRlclZpZXdJbml0YCBjYWxsYmFjayBpcyBjYWxsZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBXaXRoIHR5cGUgc2VsZWN0b3I6XG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdjaGlsZC1jbXAnLFxuICogICB0ZW1wbGF0ZTogJzxwPmNoaWxkPC9wPidcbiAqIH0pXG4gKiBjbGFzcyBDaGlsZENtcCB7XG4gKiAgIGRvU29tZXRoaW5nKCkge31cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdzb21lLWNtcCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGNoaWxkLWNtcD48L2NoaWxkLWNtcD5cbiAqICAgICA8Y2hpbGQtY21wPjwvY2hpbGQtY21wPlxuICogICAgIDxjaGlsZC1jbXA+PC9jaGlsZC1jbXA+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDaGlsZENtcF1cbiAqIH0pXG4gKiBjbGFzcyBTb21lQ21wIHtcbiAqICAgQFZpZXdDaGlsZHJlbihDaGlsZENtcCkgY2hpbGRyZW46UXVlcnlMaXN0PENoaWxkQ21wPjtcbiAqXG4gKiAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAqICAgICAvLyBjaGlsZHJlbiBhcmUgc2V0XG4gKiAgICAgdGhpcy5jaGlsZHJlbi50b0FycmF5KCkuZm9yRWFjaCgoY2hpbGQpPT5jaGlsZC5kb1NvbWV0aGluZygpKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogV2l0aCBzdHJpbmcgc2VsZWN0b3I6XG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdjaGlsZC1jbXAnLFxuICogICB0ZW1wbGF0ZTogJzxwPmNoaWxkPC9wPidcbiAqIH0pXG4gKiBjbGFzcyBDaGlsZENtcCB7XG4gKiAgIGRvU29tZXRoaW5nKCkge31cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdzb21lLWNtcCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGNoaWxkLWNtcCAjY2hpbGQxPjwvY2hpbGQtY21wPlxuICogICAgIDxjaGlsZC1jbXAgI2NoaWxkMj48L2NoaWxkLWNtcD5cbiAqICAgICA8Y2hpbGQtY21wICNjaGlsZDM+PC9jaGlsZC1jbXA+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDaGlsZENtcF1cbiAqIH0pXG4gKiBjbGFzcyBTb21lQ21wIHtcbiAqICAgQFZpZXdDaGlsZHJlbignY2hpbGQxLGNoaWxkMixjaGlsZDMnKSBjaGlsZHJlbjpRdWVyeUxpc3Q8Q2hpbGRDbXA+O1xuICpcbiAqICAgbmdBZnRlclZpZXdJbml0KCkge1xuICogICAgIC8vIGNoaWxkcmVuIGFyZSBzZXRcbiAqICAgICB0aGlzLmNoaWxkcmVuLnRvQXJyYXkoKS5mb3JFYWNoKChjaGlsZCk9PmNoaWxkLmRvU29tZXRoaW5nKCkpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBTZWUgYWxzbzogW1ZpZXdDaGlsZHJlbk1ldGFkYXRhXVxuICovXG5leHBvcnQgdmFyIFZpZXdDaGlsZHJlbjogVmlld0NoaWxkcmVuRmFjdG9yeSA9IG1ha2VQcm9wRGVjb3JhdG9yKFZpZXdDaGlsZHJlbk1ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBWaWV3Q2hpbGRNZXRhZGF0YS5cbi8qKlxuICogRGVjbGFyZXMgYSByZWZlcmVuY2UgdG8gYSBjaGlsZCBlbGVtZW50LlxuICpcbiAqIGBWaWV3Q2hpbGRyZW5gIHRha2VzIGEgYXJndW1lbnQgdG8gc2VsZWN0IGVsZW1lbnRzLlxuICpcbiAqIC0gSWYgdGhlIGFyZ3VtZW50IGlzIGEgdHlwZSwgYSBkaXJlY3RpdmUgb3IgYSBjb21wb25lbnQgd2l0aCB0aGUgdHlwZSB3aWxsIGJlIGJvdW5kLlxuICpcbiAqIC0gSWYgdGhlIGFyZ3VtZW50IGlzIGEgc3RyaW5nLCB0aGUgc3RyaW5nIGlzIGludGVycHJldGVkIGFzIGEgc2VsZWN0b3IuIEFuIGVsZW1lbnQgY29udGFpbmluZyB0aGVcbiAqIG1hdGNoaW5nIHRlbXBsYXRlIHZhcmlhYmxlIChlLmcuIGAjY2hpbGRgKSB3aWxsIGJlIGJvdW5kLlxuICpcbiAqIEluIGVpdGhlciBjYXNlLCBgQFZpZXdDaGlsZCgpYCBhc3NpZ25zIHRoZSBmaXJzdCAobG9va2luZyBmcm9tIGFib3ZlKSBlbGVtZW50IGlmIHRoZXJlIGFyZVxuICogbXVsdGlwbGUgbWF0Y2hlcy5cbiAqXG4gKiBWaWV3IGNoaWxkIGlzIHNldCBiZWZvcmUgdGhlIGBuZ0FmdGVyVmlld0luaXRgIGNhbGxiYWNrIGlzIGNhbGxlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFdpdGggdHlwZSBzZWxlY3RvcjpcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2NoaWxkLWNtcCcsXG4gKiAgIHRlbXBsYXRlOiAnPHA+Y2hpbGQ8L3A+J1xuICogfSlcbiAqIGNsYXNzIENoaWxkQ21wIHtcbiAqICAgZG9Tb21ldGhpbmcoKSB7fVxuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3NvbWUtY21wJyxcbiAqICAgdGVtcGxhdGU6ICc8Y2hpbGQtY21wPjwvY2hpbGQtY21wPicsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDaGlsZENtcF1cbiAqIH0pXG4gKiBjbGFzcyBTb21lQ21wIHtcbiAqICAgQFZpZXdDaGlsZChDaGlsZENtcCkgY2hpbGQ6Q2hpbGRDbXA7XG4gKlxuICogICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gKiAgICAgLy8gY2hpbGQgaXMgc2V0XG4gKiAgICAgdGhpcy5jaGlsZC5kb1NvbWV0aGluZygpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBXaXRoIHN0cmluZyBzZWxlY3RvcjpcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2NoaWxkLWNtcCcsXG4gKiAgIHRlbXBsYXRlOiAnPHA+Y2hpbGQ8L3A+J1xuICogfSlcbiAqIGNsYXNzIENoaWxkQ21wIHtcbiAqICAgZG9Tb21ldGhpbmcoKSB7fVxuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3NvbWUtY21wJyxcbiAqICAgdGVtcGxhdGU6ICc8Y2hpbGQtY21wICNjaGlsZD48L2NoaWxkLWNtcD4nLFxuICogICBkaXJlY3RpdmVzOiBbQ2hpbGRDbXBdXG4gKiB9KVxuICogY2xhc3MgU29tZUNtcCB7XG4gKiAgIEBWaWV3Q2hpbGQoJ2NoaWxkJykgY2hpbGQ6Q2hpbGRDbXA7XG4gKlxuICogICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gKiAgICAgLy8gY2hpbGQgaXMgc2V0XG4gKiAgICAgdGhpcy5jaGlsZC5kb1NvbWV0aGluZygpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqIFNlZSBhbHNvOiBbVmlld0NoaWxkTWV0YWRhdGFdXG4gKi9cbmV4cG9ydCB2YXIgVmlld0NoaWxkOiBWaWV3Q2hpbGRGYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoVmlld0NoaWxkTWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIFZpZXdRdWVyeU1ldGFkYXRhLlxuLyoqXG4gKiBTaW1pbGFyIHRvIHtAbGluayBRdWVyeU1ldGFkYXRhfSwgYnV0IHF1ZXJ5aW5nIHRoZSBjb21wb25lbnQgdmlldywgaW5zdGVhZCBvZlxuICogdGhlIGNvbnRlbnQgY2hpbGRyZW4uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2VOc0ZIRGY3WWp5TTZJekt4TTFqP3A9cHJldmlldykpXG4gKlxuICogYGBgamF2YXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIC4uLixcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8aXRlbT4gYSA8L2l0ZW0+XG4gKiAgICAgPGl0ZW0+IGIgPC9pdGVtPlxuICogICAgIDxpdGVtPiBjIDwvaXRlbT5cbiAqICAgYFxuICogfSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgc2hvd246IGJvb2xlYW47XG4gKlxuICogICBjb25zdHJ1Y3Rvcihwcml2YXRlIEBRdWVyeShJdGVtKSBpdGVtczpRdWVyeUxpc3Q8SXRlbT4pIHtcbiAqICAgICBpdGVtcy5jaGFuZ2VzLnN1YnNjcmliZSgoKSA9PiBjb25zb2xlLmxvZyhpdGVtcy5sZW5ndGgpKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogU3VwcG9ydHMgdGhlIHNhbWUgcXVlcnlpbmcgcGFyYW1ldGVycyBhcyB7QGxpbmsgUXVlcnlNZXRhZGF0YX0sIGV4Y2VwdFxuICogYGRlc2NlbmRhbnRzYC4gVGhpcyBhbHdheXMgcXVlcmllcyB0aGUgd2hvbGUgdmlldy5cbiAqXG4gKiBBcyBgc2hvd25gIGlzIGZsaXBwZWQgYmV0d2VlbiB0cnVlIGFuZCBmYWxzZSwgaXRlbXMgd2lsbCBjb250YWluIHplcm8gb2Ygb25lXG4gKiBpdGVtcy5cbiAqXG4gKiBTcGVjaWZpZXMgdGhhdCBhIHtAbGluayBRdWVyeUxpc3R9IHNob3VsZCBiZSBpbmplY3RlZC5cbiAqXG4gKiBUaGUgaW5qZWN0ZWQgb2JqZWN0IGlzIGFuIGl0ZXJhYmxlIGFuZCBvYnNlcnZhYmxlIGxpdmUgbGlzdC5cbiAqIFNlZSB7QGxpbmsgUXVlcnlMaXN0fSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5leHBvcnQgdmFyIFZpZXdRdWVyeTogUXVlcnlGYWN0b3J5ID0gbWFrZVBhcmFtRGVjb3JhdG9yKFZpZXdRdWVyeU1ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBQaXBlTWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmUgcmV1c2FibGUgcGlwZSBmdW5jdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3RzL21ldGFkYXRhL21ldGFkYXRhLnRzIHJlZ2lvbj0ncGlwZSd9XG4gKi9cbmV4cG9ydCB2YXIgUGlwZTogUGlwZUZhY3RvcnkgPSA8UGlwZUZhY3Rvcnk+bWFrZURlY29yYXRvcihQaXBlTWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIElucHV0TWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmVzIGEgZGF0YS1ib3VuZCBpbnB1dCBwcm9wZXJ0eS5cbiAqXG4gKiBBbmd1bGFyIGF1dG9tYXRpY2FsbHkgdXBkYXRlcyBkYXRhLWJvdW5kIHByb3BlcnRpZXMgZHVyaW5nIGNoYW5nZSBkZXRlY3Rpb24uXG4gKlxuICogYElucHV0TWV0YWRhdGFgIHRha2VzIGFuIG9wdGlvbmFsIHBhcmFtZXRlciB0aGF0IHNwZWNpZmllcyB0aGUgbmFtZVxuICogdXNlZCB3aGVuIGluc3RhbnRpYXRpbmcgYSBjb21wb25lbnQgaW4gdGhlIHRlbXBsYXRlLiBXaGVuIG5vdCBwcm92aWRlZCxcbiAqIHRoZSBuYW1lIG9mIHRoZSBkZWNvcmF0ZWQgcHJvcGVydHkgaXMgdXNlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBjcmVhdGVzIGEgY29tcG9uZW50IHdpdGggdHdvIGlucHV0IHByb3BlcnRpZXMuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYmFuay1hY2NvdW50JyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICBCYW5rIE5hbWU6IHt7YmFua05hbWV9fVxuICogICAgIEFjY291bnQgSWQ6IHt7aWR9fVxuICogICBgXG4gKiB9KVxuICogY2xhc3MgQmFua0FjY291bnQge1xuICogICBASW5wdXQoKSBiYW5rTmFtZTogc3RyaW5nO1xuICogICBASW5wdXQoJ2FjY291bnQtaWQnKSBpZDogc3RyaW5nO1xuICpcbiAqICAgLy8gdGhpcyBwcm9wZXJ0eSBpcyBub3QgYm91bmQsIGFuZCB3b24ndCBiZSBhdXRvbWF0aWNhbGx5IHVwZGF0ZWQgYnkgQW5ndWxhclxuICogICBub3JtYWxpemVkQmFua05hbWU6IHN0cmluZztcbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxiYW5rLWFjY291bnQgYmFuay1uYW1lPVwiUkJDXCIgYWNjb3VudC1pZD1cIjQ3NDdcIj48L2JhbmstYWNjb3VudD5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW0JhbmtBY2NvdW50XVxuICogfSlcbiAqIGNsYXNzIEFwcCB7fVxuICpcbiAqIGJvb3RzdHJhcChBcHApO1xuICogYGBgXG4gKi9cbmV4cG9ydCB2YXIgSW5wdXQ6IElucHV0RmFjdG9yeSA9IG1ha2VQcm9wRGVjb3JhdG9yKElucHV0TWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIE91dHB1dE1ldGFkYXRhLlxuLyoqXG4gKiBEZWNsYXJlcyBhbiBldmVudC1ib3VuZCBvdXRwdXQgcHJvcGVydHkuXG4gKlxuICogV2hlbiBhbiBvdXRwdXQgcHJvcGVydHkgZW1pdHMgYW4gZXZlbnQsIGFuIGV2ZW50IGhhbmRsZXIgYXR0YWNoZWQgdG8gdGhhdCBldmVudFxuICogdGhlIHRlbXBsYXRlIGlzIGludm9rZWQuXG4gKlxuICogYE91dHB1dE1ldGFkYXRhYCB0YWtlcyBhbiBvcHRpb25hbCBwYXJhbWV0ZXIgdGhhdCBzcGVjaWZpZXMgdGhlIG5hbWVcbiAqIHVzZWQgd2hlbiBpbnN0YW50aWF0aW5nIGEgY29tcG9uZW50IGluIHRoZSB0ZW1wbGF0ZS4gV2hlbiBub3QgcHJvdmlkZWQsXG4gKiB0aGUgbmFtZSBvZiB0aGUgZGVjb3JhdGVkIHByb3BlcnR5IGlzIHVzZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdpbnRlcnZhbC1kaXInLFxuICogfSlcbiAqIGNsYXNzIEludGVydmFsRGlyIHtcbiAqICAgQE91dHB1dCgpIGV2ZXJ5U2Vjb25kID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICogICBAT3V0cHV0KCdldmVyeUZpdmVTZWNvbmRzJykgZml2ZTVTZWNzID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICpcbiAqICAgY29uc3RydWN0b3IoKSB7XG4gKiAgICAgc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5ldmVyeVNlY29uZC5lbWl0KFwiZXZlbnRcIiksIDEwMDApO1xuICogICAgIHNldEludGVydmFsKCgpID0+IHRoaXMuZml2ZTVTZWNzLmVtaXQoXCJldmVudFwiKSwgNTAwMCk7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxpbnRlcnZhbC1kaXIgKGV2ZXJ5U2Vjb25kKT1cImV2ZXJ5U2Vjb25kKClcIiAoZXZlcnlGaXZlU2Vjb25kcyk9XCJldmVyeUZpdmVTZWNvbmRzKClcIj5cbiAqICAgICA8L2ludGVydmFsLWRpcj5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW0ludGVydmFsRGlyXVxuICogfSlcbiAqIGNsYXNzIEFwcCB7XG4gKiAgIGV2ZXJ5U2Vjb25kKCkgeyBjb25zb2xlLmxvZygnc2Vjb25kJyk7IH1cbiAqICAgZXZlcnlGaXZlU2Vjb25kcygpIHsgY29uc29sZS5sb2coJ2ZpdmUgc2Vjb25kcycpOyB9XG4gKiB9XG4gKiBib290c3RyYXAoQXBwKTtcbiAqIGBgYFxuICovXG5leHBvcnQgdmFyIE91dHB1dDogT3V0cHV0RmFjdG9yeSA9IG1ha2VQcm9wRGVjb3JhdG9yKE91dHB1dE1ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBIb3N0QmluZGluZ01ldGFkYXRhLlxuLyoqXG4gKiBEZWNsYXJlcyBhIGhvc3QgcHJvcGVydHkgYmluZGluZy5cbiAqXG4gKiBBbmd1bGFyIGF1dG9tYXRpY2FsbHkgY2hlY2tzIGhvc3QgcHJvcGVydHkgYmluZGluZ3MgZHVyaW5nIGNoYW5nZSBkZXRlY3Rpb24uXG4gKiBJZiBhIGJpbmRpbmcgY2hhbmdlcywgaXQgd2lsbCB1cGRhdGUgdGhlIGhvc3QgZWxlbWVudCBvZiB0aGUgZGlyZWN0aXZlLlxuICpcbiAqIGBIb3N0QmluZGluZ01ldGFkYXRhYCB0YWtlcyBhbiBvcHRpb25hbCBwYXJhbWV0ZXIgdGhhdCBzcGVjaWZpZXMgdGhlIHByb3BlcnR5XG4gKiBuYW1lIG9mIHRoZSBob3N0IGVsZW1lbnQgdGhhdCB3aWxsIGJlIHVwZGF0ZWQuIFdoZW4gbm90IHByb3ZpZGVkLFxuICogdGhlIGNsYXNzIHByb3BlcnR5IG5hbWUgaXMgdXNlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBjcmVhdGVzIGEgZGlyZWN0aXZlIHRoYXQgc2V0cyB0aGUgYHZhbGlkYCBhbmQgYGludmFsaWRgIGNsYXNzZXNcbiAqIG9uIHRoZSBET00gZWxlbWVudCB0aGF0IGhhcyBuZ01vZGVsIGRpcmVjdGl2ZSBvbiBpdC5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ01vZGVsXSd9KVxuICogY2xhc3MgTmdNb2RlbFN0YXR1cyB7XG4gKiAgIGNvbnN0cnVjdG9yKHB1YmxpYyBjb250cm9sOk5nTW9kZWwpIHt9XG4gKiAgIEBIb3N0QmluZGluZygnW2NsYXNzLnZhbGlkXScpIGdldCB2YWxpZCB7IHJldHVybiB0aGlzLmNvbnRyb2wudmFsaWQ7IH1cbiAqICAgQEhvc3RCaW5kaW5nKCdbY2xhc3MuaW52YWxpZF0nKSBnZXQgaW52YWxpZCB7IHJldHVybiB0aGlzLmNvbnRyb2wuaW52YWxpZDsgfVxuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgIHRlbXBsYXRlOiBgPGlucHV0IFsobmdNb2RlbCldPVwicHJvcFwiPmAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtGT1JNX0RJUkVDVElWRVMsIE5nTW9kZWxTdGF0dXNdXG4gKiB9KVxuICogY2xhc3MgQXBwIHtcbiAqICAgcHJvcDtcbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwKTtcbiAqIGBgYFxuICovXG5leHBvcnQgdmFyIEhvc3RCaW5kaW5nOiBIb3N0QmluZGluZ0ZhY3RvcnkgPSBtYWtlUHJvcERlY29yYXRvcihIb3N0QmluZGluZ01ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBIb3N0TGlzdGVuZXJNZXRhZGF0YS5cbi8qKlxuICogRGVjbGFyZXMgYSBob3N0IGxpc3RlbmVyLlxuICpcbiAqIEFuZ3VsYXIgd2lsbCBpbnZva2UgdGhlIGRlY29yYXRlZCBtZXRob2Qgd2hlbiB0aGUgaG9zdCBlbGVtZW50IGVtaXRzIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gKlxuICogSWYgdGhlIGRlY29yYXRlZCBtZXRob2QgcmV0dXJucyBgZmFsc2VgLCB0aGVuIGBwcmV2ZW50RGVmYXVsdGAgaXMgYXBwbGllZCBvbiB0aGUgRE9NXG4gKiBldmVudC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBkZWNsYXJlcyBhIGRpcmVjdGl2ZSB0aGF0IGF0dGFjaGVzIGEgY2xpY2sgbGlzdGVuZXIgdG8gdGhlIGJ1dHRvbiBhbmRcbiAqIGNvdW50cyBjbGlja3MuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdidXR0b25bY291bnRpbmddJ30pXG4gKiBjbGFzcyBDb3VudENsaWNrcyB7XG4gKiAgIG51bWJlck9mQ2xpY2tzID0gMDtcbiAqXG4gKiAgIEBIb3N0TGlzdGVuZXIoJ2NsaWNrJywgWyckZXZlbnQudGFyZ2V0J10pXG4gKiAgIG9uQ2xpY2soYnRuKSB7XG4gKiAgICAgY29uc29sZS5sb2coXCJidXR0b25cIiwgYnRuLCBcIm51bWJlciBvZiBjbGlja3M6XCIsIHRoaXMubnVtYmVyT2ZDbGlja3MrKyk7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICogICB0ZW1wbGF0ZTogYDxidXR0b24gY291bnRpbmc+SW5jcmVtZW50PC9idXR0b24+YCxcbiAqICAgZGlyZWN0aXZlczogW0NvdW50Q2xpY2tzXVxuICogfSlcbiAqIGNsYXNzIEFwcCB7fVxuICpcbiAqIGJvb3RzdHJhcChBcHApO1xuICogYGBgXG4gKi9cbmV4cG9ydCB2YXIgSG9zdExpc3RlbmVyOiBIb3N0TGlzdGVuZXJGYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoSG9zdExpc3RlbmVyTWV0YWRhdGEpO1xuIl19