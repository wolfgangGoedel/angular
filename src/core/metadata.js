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
exports.ProviderPropertyMetadata = di_1.ProviderPropertyMetadata;
exports.InjectorModuleMetadata = di_1.InjectorModuleMetadata;
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
exports.InjectorModule = decorators_1.makeDecorator(di_2.InjectorModuleMetadata);
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
exports.Provides = decorators_1.makePropDecorator(di_2.ProviderPropertyMetadata);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWVnOXFsVndYLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7O0FBRUgsbUJBVU8sZUFBZSxDQUFDO0FBVHJCLDJDQUFhO0FBQ2IsK0RBQXVCO0FBQ3ZCLHlEQUFvQjtBQUNwQix5REFBb0I7QUFDcEIsbURBQWlCO0FBQ2pCLG1EQUFpQjtBQUNqQixtREFBaUI7QUFDakIsaUVBQXdCO0FBQ3hCLDZEQUNxQjtBQUV2QiwyQkFRTyx1QkFBdUIsQ0FBQztBQVA3QiwyREFBaUI7QUFDakIsMkRBQWlCO0FBQ2pCLGlEQUFZO0FBQ1osbURBQWE7QUFDYixxREFBYztBQUNkLCtEQUFtQjtBQUNuQixpRUFDNkI7QUFFL0IscUJBQThDLGlCQUFpQixDQUFDO0FBQXhELDJDQUFZO0FBQUUscURBQTBDO0FBYWhFLG1CQVVPLGVBQWUsQ0FBQyxDQUFBO0FBRXZCLDJCQVFPLHVCQUF1QixDQUFDLENBQUE7QUFFL0IscUJBQThDLGlCQUFpQixDQUFDLENBQUE7QUFHaEUsMkJBTU8sbUJBQW1CLENBQUMsQ0FBQTtBQXlhM0IsNEZBQTRGO0FBQzVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0JHO0FBQ1EsaUJBQVMsR0FDVSwwQkFBYSxDQUFDLDhCQUFpQixFQUFFLFVBQUMsRUFBTyxJQUFLLE9BQUEsRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLEVBQWQsQ0FBYyxDQUFDLENBQUM7QUFFNUYsNEZBQTRGO0FBQzVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXlYRztBQUNRLGlCQUFTLEdBQ1UsMEJBQWEsQ0FBQyw4QkFBaUIsQ0FBQyxDQUFDO0FBRS9ELHVGQUF1RjtBQUN2Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTRCRztBQUNILElBQUksSUFBSSxHQUNpQiwwQkFBYSxDQUFDLG1CQUFZLEVBQUUsVUFBQyxFQUFPLElBQUssT0FBQSxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksRUFBZCxDQUFjLENBQUMsQ0FBQztBQUVsRjs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUNRLGlCQUFTLEdBQTZCLCtCQUFrQixDQUFDLHNCQUFpQixDQUFDLENBQUM7QUFFdkYsd0ZBQXdGO0FBQ3hGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMEdHO0FBQ1EsYUFBSyxHQUF5QiwrQkFBa0IsQ0FBQyxrQkFBYSxDQUFDLENBQUM7QUFFM0Usa0dBQWtHO0FBQ2xHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUJHO0FBQ1EsdUJBQWUsR0FDdEIsOEJBQWlCLENBQUMsNEJBQXVCLENBQUMsQ0FBQztBQUUvQywrRkFBK0Y7QUFDL0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFDUSxvQkFBWSxHQUFnQyw4QkFBaUIsQ0FBQyx5QkFBb0IsQ0FBQyxDQUFDO0FBRS9GLCtGQUErRjtBQUMvRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBOEVHO0FBQ1Esb0JBQVksR0FBZ0MsOEJBQWlCLENBQUMseUJBQW9CLENBQUMsQ0FBQztBQUUvRiw0RkFBNEY7QUFDNUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXFFRztBQUNRLGlCQUFTLEdBQTZCLDhCQUFpQixDQUFDLHNCQUFpQixDQUFDLENBQUM7QUFFdEYsNEZBQTRGO0FBQzVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0NHO0FBQ1EsaUJBQVMsR0FBeUIsK0JBQWtCLENBQUMsc0JBQWlCLENBQUMsQ0FBQztBQUVuRix1RkFBdUY7QUFDdkY7Ozs7OztHQU1HO0FBQ1EsWUFBSSxHQUE2QywwQkFBYSxDQUFDLHlCQUFZLENBQUMsQ0FBQztBQUV4Rix3RkFBd0Y7QUFDeEY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F3Q0c7QUFDUSxhQUFLLEdBQXlCLDhCQUFpQixDQUFDLDBCQUFhLENBQUMsQ0FBQztBQUUxRSx5RkFBeUY7QUFDekY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F3Q0c7QUFDUSxjQUFNLEdBQTBCLDhCQUFpQixDQUFDLDJCQUFjLENBQUMsQ0FBQztBQUU3RSw4RkFBOEY7QUFDOUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQ0c7QUFDUSxtQkFBVyxHQUErQiw4QkFBaUIsQ0FBQyxnQ0FBbUIsQ0FBQyxDQUFDO0FBRTVGLCtGQUErRjtBQUMvRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUNHO0FBQ1Esb0JBQVksR0FBZ0MsOEJBQWlCLENBQUMsaUNBQW9CLENBQUMsQ0FBQztBQVMvRjs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ1Esc0JBQWMsR0FDVSwwQkFBYSxDQUFDLDJCQUFzQixDQUFDLENBQUM7QUFhekU7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUNRLGdCQUFRLEdBQW9DLDhCQUFpQixDQUFDLDZCQUF3QixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoaXMgaW5kaXJlY3Rpb24gaXMgbmVlZGVkIHRvIGZyZWUgdXAgQ29tcG9uZW50LCBldGMgc3ltYm9scyBpbiB0aGUgcHVibGljIEFQSVxuICogdG8gYmUgdXNlZCBieSB0aGUgZGVjb3JhdG9yIHZlcnNpb25zIG9mIHRoZXNlIGFubm90YXRpb25zLlxuICovXG5cbmV4cG9ydCB7XG4gIFF1ZXJ5TWV0YWRhdGEsXG4gIENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhLFxuICBDb250ZW50Q2hpbGRNZXRhZGF0YSxcbiAgVmlld0NoaWxkcmVuTWV0YWRhdGEsXG4gIFZpZXdRdWVyeU1ldGFkYXRhLFxuICBWaWV3Q2hpbGRNZXRhZGF0YSxcbiAgQXR0cmlidXRlTWV0YWRhdGEsXG4gIFByb3ZpZGVyUHJvcGVydHlNZXRhZGF0YSxcbiAgSW5qZWN0b3JNb2R1bGVNZXRhZGF0YVxufSBmcm9tICcuL21ldGFkYXRhL2RpJztcblxuZXhwb3J0IHtcbiAgQ29tcG9uZW50TWV0YWRhdGEsXG4gIERpcmVjdGl2ZU1ldGFkYXRhLFxuICBQaXBlTWV0YWRhdGEsXG4gIElucHV0TWV0YWRhdGEsXG4gIE91dHB1dE1ldGFkYXRhLFxuICBIb3N0QmluZGluZ01ldGFkYXRhLFxuICBIb3N0TGlzdGVuZXJNZXRhZGF0YVxufSBmcm9tICcuL21ldGFkYXRhL2RpcmVjdGl2ZXMnO1xuXG5leHBvcnQge1ZpZXdNZXRhZGF0YSwgVmlld0VuY2Fwc3VsYXRpb259IGZyb20gJy4vbWV0YWRhdGEvdmlldyc7XG5cbmV4cG9ydCB7XG4gIEFmdGVyQ29udGVudEluaXQsXG4gIEFmdGVyQ29udGVudENoZWNrZWQsXG4gIEFmdGVyVmlld0luaXQsXG4gIEFmdGVyVmlld0NoZWNrZWQsXG4gIE9uQ2hhbmdlcyxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIERvQ2hlY2tcbn0gZnJvbSAnLi9tZXRhZGF0YS9saWZlY3ljbGVfaG9va3MnO1xuXG5pbXBvcnQge1xuICBRdWVyeU1ldGFkYXRhLFxuICBDb250ZW50Q2hpbGRyZW5NZXRhZGF0YSxcbiAgQ29udGVudENoaWxkTWV0YWRhdGEsXG4gIFZpZXdDaGlsZHJlbk1ldGFkYXRhLFxuICBWaWV3Q2hpbGRNZXRhZGF0YSxcbiAgVmlld1F1ZXJ5TWV0YWRhdGEsXG4gIEF0dHJpYnV0ZU1ldGFkYXRhLFxuICBJbmplY3Rvck1vZHVsZU1ldGFkYXRhLFxuICBQcm92aWRlclByb3BlcnR5TWV0YWRhdGFcbn0gZnJvbSAnLi9tZXRhZGF0YS9kaSc7XG5cbmltcG9ydCB7XG4gIENvbXBvbmVudE1ldGFkYXRhLFxuICBEaXJlY3RpdmVNZXRhZGF0YSxcbiAgUGlwZU1ldGFkYXRhLFxuICBJbnB1dE1ldGFkYXRhLFxuICBPdXRwdXRNZXRhZGF0YSxcbiAgSG9zdEJpbmRpbmdNZXRhZGF0YSxcbiAgSG9zdExpc3RlbmVyTWV0YWRhdGFcbn0gZnJvbSAnLi9tZXRhZGF0YS9kaXJlY3RpdmVzJztcblxuaW1wb3J0IHtWaWV3TWV0YWRhdGEsIFZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICcuL21ldGFkYXRhL3ZpZXcnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcblxuaW1wb3J0IHtcbiAgbWFrZURlY29yYXRvcixcbiAgbWFrZVBhcmFtRGVjb3JhdG9yLFxuICBtYWtlUHJvcERlY29yYXRvcixcbiAgVHlwZURlY29yYXRvcixcbiAgQ2xhc3Ncbn0gZnJvbSAnLi91dGlsL2RlY29yYXRvcnMnO1xuaW1wb3J0IHtUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIHtAbGluayBEaXJlY3RpdmVNZXRhZGF0YX0gZGVjb3JhdG9yIGZ1bmN0aW9uLlxuICpcbiAqIFNlZSB7QGxpbmsgRGlyZWN0aXZlRmFjdG9yeX0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGlyZWN0aXZlRGVjb3JhdG9yIGV4dGVuZHMgVHlwZURlY29yYXRvciB7fVxuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIHtAbGluayBDb21wb25lbnRNZXRhZGF0YX0gZGVjb3JhdG9yIGZ1bmN0aW9uLlxuICpcbiAqIFNlZSB7QGxpbmsgQ29tcG9uZW50RmFjdG9yeX0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50RGVjb3JhdG9yIGV4dGVuZHMgVHlwZURlY29yYXRvciB7XG4gIC8qKlxuICAgKiBDaGFpbiB7QGxpbmsgVmlld01ldGFkYXRhfSBhbm5vdGF0aW9uLlxuICAgKi9cbiAgVmlldyhvYmo6IHtcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZyxcbiAgICB0ZW1wbGF0ZT86IHN0cmluZyxcbiAgICBkaXJlY3RpdmVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBwaXBlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgcmVuZGVyZXI/OiBzdHJpbmcsXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gIH0pOiBWaWV3RGVjb3JhdG9yO1xufVxuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIHtAbGluayBWaWV3TWV0YWRhdGF9IGRlY29yYXRvciBmdW5jdGlvbi5cbiAqXG4gKiBTZWUge0BsaW5rIFZpZXdGYWN0b3J5fS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBWaWV3RGVjb3JhdG9yIGV4dGVuZHMgVHlwZURlY29yYXRvciB7XG4gIC8qKlxuICAgKiBDaGFpbiB7QGxpbmsgVmlld01ldGFkYXRhfSBhbm5vdGF0aW9uLlxuICAgKi9cbiAgVmlldyhvYmo6IHtcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZyxcbiAgICB0ZW1wbGF0ZT86IHN0cmluZyxcbiAgICBkaXJlY3RpdmVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBwaXBlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgcmVuZGVyZXI/OiBzdHJpbmcsXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gIH0pOiBWaWV3RGVjb3JhdG9yO1xufVxuXG4vKipcbiAqIHtAbGluayBEaXJlY3RpdmVNZXRhZGF0YX0gZmFjdG9yeSBmb3IgY3JlYXRpbmcgYW5ub3RhdGlvbnMsIGRlY29yYXRvcnMgb3IgRFNMLlxuICpcbiAqICMjIyBFeGFtcGxlIGFzIFR5cGVTY3JpcHQgRGVjb3JhdG9yXG4gKlxuICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbWV0YWRhdGEudHMgcmVnaW9uPSdkaXJlY3RpdmUnfVxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBEU0xcbiAqXG4gKiBgYGBcbiAqIHZhciBNeURpcmVjdGl2ZSA9IG5nXG4gKiAgIC5EaXJlY3RpdmUoey4uLn0pXG4gKiAgIC5DbGFzcyh7XG4gKiAgICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKCkge1xuICogICAgICAgLi4uXG4gKiAgICAgfVxuICogICB9KVxuICogYGBgXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IGFubm90YXRpb25cbiAqXG4gKiBgYGBcbiAqIHZhciBNeURpcmVjdGl2ZSA9IGZ1bmN0aW9uKCkge1xuICogICAuLi5cbiAqIH07XG4gKlxuICogTXlEaXJlY3RpdmUuYW5ub3RhdGlvbnMgPSBbXG4gKiAgIG5ldyBuZy5EaXJlY3RpdmUoey4uLn0pXG4gKiBdXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RpdmVNZXRhZGF0YUZhY3Rvcnkge1xuICAob2JqOiB7XG4gICAgc2VsZWN0b3I/OiBzdHJpbmcsXG4gICAgaW5wdXRzPzogc3RyaW5nW10sXG4gICAgb3V0cHV0cz86IHN0cmluZ1tdLFxuICAgIHByb3BlcnRpZXM/OiBzdHJpbmdbXSxcbiAgICBldmVudHM/OiBzdHJpbmdbXSxcbiAgICBob3N0Pzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgYmluZGluZ3M/OiBhbnlbXSxcbiAgICBwcm92aWRlcnM/OiBhbnlbXSxcbiAgICBleHBvcnRBcz86IHN0cmluZyxcbiAgICBxdWVyaWVzPzoge1trZXk6IHN0cmluZ106IGFueX1cbiAgfSk6IERpcmVjdGl2ZURlY29yYXRvcjtcbiAgbmV3IChvYmo6IHtcbiAgICBzZWxlY3Rvcj86IHN0cmluZyxcbiAgICBpbnB1dHM/OiBzdHJpbmdbXSxcbiAgICBvdXRwdXRzPzogc3RyaW5nW10sXG4gICAgcHJvcGVydGllcz86IHN0cmluZ1tdLFxuICAgIGV2ZW50cz86IHN0cmluZ1tdLFxuICAgIGhvc3Q/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBiaW5kaW5ncz86IGFueVtdLFxuICAgIHByb3ZpZGVycz86IGFueVtdLFxuICAgIGV4cG9ydEFzPzogc3RyaW5nLFxuICAgIHF1ZXJpZXM/OiB7W2tleTogc3RyaW5nXTogYW55fVxuICB9KTogRGlyZWN0aXZlTWV0YWRhdGE7XG59XG5cbi8qKlxuICoge0BsaW5rIENvbXBvbmVudE1ldGFkYXRhfSBmYWN0b3J5IGZvciBjcmVhdGluZyBhbm5vdGF0aW9ucywgZGVjb3JhdG9ycyBvciBEU0wuXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgVHlwZVNjcmlwdCBEZWNvcmF0b3JcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS90cy9tZXRhZGF0YS9tZXRhZGF0YS50cyByZWdpb249J2NvbXBvbmVudCd9XG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IERTTFxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gbmdcbiAqICAgLkNvbXBvbmVudCh7Li4ufSlcbiAqICAgLkNsYXNzKHtcbiAqICAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24oKSB7XG4gKiAgICAgICAuLi5cbiAqICAgICB9XG4gKiAgIH0pXG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgYW5ub3RhdGlvblxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gZnVuY3Rpb24oKSB7XG4gKiAgIC4uLlxuICogfTtcbiAqXG4gKiBNeUNvbXBvbmVudC5hbm5vdGF0aW9ucyA9IFtcbiAqICAgbmV3IG5nLkNvbXBvbmVudCh7Li4ufSlcbiAqIF1cbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudE1ldGFkYXRhRmFjdG9yeSB7XG4gIChvYmo6IHtcbiAgICBzZWxlY3Rvcj86IHN0cmluZyxcbiAgICBpbnB1dHM/OiBzdHJpbmdbXSxcbiAgICBvdXRwdXRzPzogc3RyaW5nW10sXG4gICAgcHJvcGVydGllcz86IHN0cmluZ1tdLFxuICAgIGV2ZW50cz86IHN0cmluZ1tdLFxuICAgIGhvc3Q/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICAvKiBAZGVwcmVjYXRlZCAqL1xuICAgIGJpbmRpbmdzPzogYW55W10sXG4gICAgcHJvdmlkZXJzPzogYW55W10sXG4gICAgZXhwb3J0QXM/OiBzdHJpbmcsXG4gICAgbW9kdWxlSWQ/OiBzdHJpbmcsXG4gICAgcXVlcmllcz86IHtba2V5OiBzdHJpbmddOiBhbnl9LFxuICAgIHZpZXdCaW5kaW5ncz86IGFueVtdLFxuICAgIHZpZXdQcm92aWRlcnM/OiBhbnlbXSxcbiAgICBjaGFuZ2VEZXRlY3Rpb24/OiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZyxcbiAgICB0ZW1wbGF0ZT86IHN0cmluZyxcbiAgICBzdHlsZVVybHM/OiBzdHJpbmdbXSxcbiAgICBzdHlsZXM/OiBzdHJpbmdbXSxcbiAgICBkaXJlY3RpdmVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBwaXBlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgZW5jYXBzdWxhdGlvbj86IFZpZXdFbmNhcHN1bGF0aW9uXG4gIH0pOiBDb21wb25lbnREZWNvcmF0b3I7XG4gIG5ldyAob2JqOiB7XG4gICAgc2VsZWN0b3I/OiBzdHJpbmcsXG4gICAgaW5wdXRzPzogc3RyaW5nW10sXG4gICAgb3V0cHV0cz86IHN0cmluZ1tdLFxuICAgIHByb3BlcnRpZXM/OiBzdHJpbmdbXSxcbiAgICBldmVudHM/OiBzdHJpbmdbXSxcbiAgICBob3N0Pzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgLyogQGRlcHJlY2F0ZWQgKi9cbiAgICBiaW5kaW5ncz86IGFueVtdLFxuICAgIHByb3ZpZGVycz86IGFueVtdLFxuICAgIGV4cG9ydEFzPzogc3RyaW5nLFxuICAgIG1vZHVsZUlkPzogc3RyaW5nLFxuICAgIHF1ZXJpZXM/OiB7W2tleTogc3RyaW5nXTogYW55fSxcbiAgICAvKiBAZGVwcmVjYXRlZCAqL1xuICAgIHZpZXdCaW5kaW5ncz86IGFueVtdLFxuICAgIHZpZXdQcm92aWRlcnM/OiBhbnlbXSxcbiAgICBjaGFuZ2VEZXRlY3Rpb24/OiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZyxcbiAgICB0ZW1wbGF0ZT86IHN0cmluZyxcbiAgICBzdHlsZVVybHM/OiBzdHJpbmdbXSxcbiAgICBzdHlsZXM/OiBzdHJpbmdbXSxcbiAgICBkaXJlY3RpdmVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBwaXBlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgZW5jYXBzdWxhdGlvbj86IFZpZXdFbmNhcHN1bGF0aW9uXG4gIH0pOiBDb21wb25lbnRNZXRhZGF0YTtcbn1cblxuLyoqXG4gKiB7QGxpbmsgVmlld01ldGFkYXRhfSBmYWN0b3J5IGZvciBjcmVhdGluZyBhbm5vdGF0aW9ucywgZGVjb3JhdG9ycyBvciBEU0wuXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgVHlwZVNjcmlwdCBEZWNvcmF0b3JcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50LCBWaWV3fSBmcm9tIFwiYW5ndWxhcjIvY29yZVwiO1xuICpcbiAqIEBDb21wb25lbnQoey4uLn0pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIGNvbnN0cnVjdG9yKCkge1xuICogICAgIC4uLlxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgRFNMXG4gKlxuICogYGBgXG4gKiB2YXIgTXlDb21wb25lbnQgPSBuZ1xuICogICAuQ29tcG9uZW50KHsuLi59KVxuICogICAuVmlldyh7Li4ufSlcbiAqICAgLkNsYXNzKHtcbiAqICAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24oKSB7XG4gKiAgICAgICAuLi5cbiAqICAgICB9XG4gKiAgIH0pXG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgYW5ub3RhdGlvblxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gZnVuY3Rpb24oKSB7XG4gKiAgIC4uLlxuICogfTtcbiAqXG4gKiBNeUNvbXBvbmVudC5hbm5vdGF0aW9ucyA9IFtcbiAqICAgbmV3IG5nLkNvbXBvbmVudCh7Li4ufSksXG4gKiAgIG5ldyBuZy5WaWV3KHsuLi59KVxuICogXVxuICogYGBgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVmlld01ldGFkYXRhRmFjdG9yeSB7XG4gIChvYmo6IHtcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZyxcbiAgICB0ZW1wbGF0ZT86IHN0cmluZyxcbiAgICBkaXJlY3RpdmVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBwaXBlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgZW5jYXBzdWxhdGlvbj86IFZpZXdFbmNhcHN1bGF0aW9uLFxuICAgIHN0eWxlcz86IHN0cmluZ1tdLFxuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdLFxuICB9KTogVmlld0RlY29yYXRvcjtcbiAgbmV3IChvYmo6IHtcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZyxcbiAgICB0ZW1wbGF0ZT86IHN0cmluZyxcbiAgICBkaXJlY3RpdmVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBwaXBlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgZW5jYXBzdWxhdGlvbj86IFZpZXdFbmNhcHN1bGF0aW9uLFxuICAgIHN0eWxlcz86IHN0cmluZ1tdLFxuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdLFxuICB9KTogVmlld01ldGFkYXRhO1xufVxuXG4vKipcbiAqIHtAbGluayBBdHRyaWJ1dGVNZXRhZGF0YX0gZmFjdG9yeSBmb3IgY3JlYXRpbmcgYW5ub3RhdGlvbnMsIGRlY29yYXRvcnMgb3IgRFNMLlxuICpcbiAqICMjIyBFeGFtcGxlIGFzIFR5cGVTY3JpcHQgRGVjb3JhdG9yXG4gKlxuICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbWV0YWRhdGEudHMgcmVnaW9uPSdhdHRyaWJ1dGVGYWN0b3J5J31cbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgRFNMXG4gKlxuICogYGBgXG4gKiB2YXIgTXlDb21wb25lbnQgPSBuZ1xuICogICAuQ29tcG9uZW50KHsuLi59KVxuICogICAuQ2xhc3Moe1xuICogICAgIGNvbnN0cnVjdG9yOiBbbmV3IG5nLkF0dHJpYnV0ZSgndGl0bGUnKSwgZnVuY3Rpb24odGl0bGUpIHtcbiAqICAgICAgIC4uLlxuICogICAgIH1dXG4gKiAgIH0pXG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgYW5ub3RhdGlvblxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gZnVuY3Rpb24odGl0bGUpIHtcbiAqICAgLi4uXG4gKiB9O1xuICpcbiAqIE15Q29tcG9uZW50LmFubm90YXRpb25zID0gW1xuICogICBuZXcgbmcuQ29tcG9uZW50KHsuLi59KVxuICogXVxuICogTXlDb21wb25lbnQucGFyYW1ldGVycyA9IFtcbiAqICAgW25ldyBuZy5BdHRyaWJ1dGUoJ3RpdGxlJyldXG4gKiBdXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBdHRyaWJ1dGVNZXRhZGF0YUZhY3Rvcnkge1xuICAobmFtZTogc3RyaW5nKTogVHlwZURlY29yYXRvcjtcbiAgbmV3IChuYW1lOiBzdHJpbmcpOiBBdHRyaWJ1dGVNZXRhZGF0YTtcbn1cblxuLyoqXG4gKiB7QGxpbmsgUXVlcnlNZXRhZGF0YX0gZmFjdG9yeSBmb3IgY3JlYXRpbmcgYW5ub3RhdGlvbnMsIGRlY29yYXRvcnMgb3IgRFNMLlxuICpcbiAqICMjIyBFeGFtcGxlIGFzIFR5cGVTY3JpcHQgRGVjb3JhdG9yXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge1F1ZXJ5LCBRdWVyeUxpc3QsIENvbXBvbmVudH0gZnJvbSBcImFuZ3VsYXIyL2NvcmVcIjtcbiAqXG4gKiBAQ29tcG9uZW50KHsuLi59KVxuICogY2xhc3MgTXlDb21wb25lbnQge1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoU29tZVR5cGUpIHF1ZXJ5TGlzdDogUXVlcnlMaXN0PFNvbWVUeXBlPikge1xuICogICAgIC4uLlxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgRFNMXG4gKlxuICogYGBgXG4gKiB2YXIgTXlDb21wb25lbnQgPSBuZ1xuICogICAuQ29tcG9uZW50KHsuLi59KVxuICogICAuQ2xhc3Moe1xuICogICAgIGNvbnN0cnVjdG9yOiBbbmV3IG5nLlF1ZXJ5KFNvbWVUeXBlKSwgZnVuY3Rpb24ocXVlcnlMaXN0KSB7XG4gKiAgICAgICAuLi5cbiAqICAgICB9XVxuICogICB9KVxuICogYGBgXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IGFubm90YXRpb25cbiAqXG4gKiBgYGBcbiAqIHZhciBNeUNvbXBvbmVudCA9IGZ1bmN0aW9uKHF1ZXJ5TGlzdCkge1xuICogICAuLi5cbiAqIH07XG4gKlxuICogTXlDb21wb25lbnQuYW5ub3RhdGlvbnMgPSBbXG4gKiAgIG5ldyBuZy5Db21wb25lbnQoey4uLn0pXG4gKiBdXG4gKiBNeUNvbXBvbmVudC5wYXJhbWV0ZXJzID0gW1xuICogICBbbmV3IG5nLlF1ZXJ5KFNvbWVUeXBlKV1cbiAqIF1cbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFF1ZXJ5TWV0YWRhdGFGYWN0b3J5IHtcbiAgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLFxuICAge2Rlc2NlbmRhbnRzLCByZWFkfT86IHtkZXNjZW5kYW50cz86IGJvb2xlYW4sIHJlYWQ/OiBhbnl9KTogUGFyYW1ldGVyRGVjb3JhdG9yO1xuICBuZXcgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLFxuICAgICAgIHtkZXNjZW5kYW50cywgcmVhZH0/OiB7ZGVzY2VuZGFudHM/OiBib29sZWFuLCByZWFkPzogYW55fSk6IFF1ZXJ5TWV0YWRhdGE7XG59XG5cbi8qKlxuICogRmFjdG9yeSBmb3Ige0BsaW5rIENvbnRlbnRDaGlsZHJlbn0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGVudENoaWxkcmVuTWV0YWRhdGFGYWN0b3J5IHtcbiAgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLCB7ZGVzY2VuZGFudHMsIHJlYWR9Pzoge2Rlc2NlbmRhbnRzPzogYm9vbGVhbiwgcmVhZD86IGFueX0pOiBhbnk7XG4gIG5ldyAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcsXG4gICAgICAge2Rlc2NlbmRhbnRzLCByZWFkfT86IHtkZXNjZW5kYW50cz86IGJvb2xlYW4sIHJlYWQ/OiBhbnl9KTogQ29udGVudENoaWxkcmVuTWV0YWRhdGE7XG59XG5cbi8qKlxuICogRmFjdG9yeSBmb3Ige0BsaW5rIENvbnRlbnRDaGlsZH0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGVudENoaWxkTWV0YWRhdGFGYWN0b3J5IHtcbiAgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLCB7cmVhZH0/OiB7cmVhZD86IGFueX0pOiBhbnk7XG4gIG5ldyAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcsIHtyZWFkfT86IHtyZWFkPzogYW55fSk6IENvbnRlbnRDaGlsZE1ldGFkYXRhRmFjdG9yeTtcbn1cblxuLyoqXG4gKiBGYWN0b3J5IGZvciB7QGxpbmsgVmlld0NoaWxkcmVufS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBWaWV3Q2hpbGRyZW5NZXRhZGF0YUZhY3Rvcnkge1xuICAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcsIHtyZWFkfT86IHtyZWFkPzogYW55fSk6IGFueTtcbiAgbmV3IChzZWxlY3RvcjogVHlwZSB8IHN0cmluZywge3JlYWR9Pzoge3JlYWQ/OiBhbnl9KTogVmlld0NoaWxkcmVuTWV0YWRhdGE7XG59XG5cbi8qKlxuICogRmFjdG9yeSBmb3Ige0BsaW5rIFZpZXdDaGlsZH0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVmlld0NoaWxkTWV0YWRhdGFGYWN0b3J5IHtcbiAgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLCB7cmVhZH0/OiB7cmVhZD86IGFueX0pOiBhbnk7XG4gIG5ldyAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcsIHtyZWFkfT86IHtyZWFkPzogYW55fSk6IFZpZXdDaGlsZE1ldGFkYXRhRmFjdG9yeTtcbn1cblxuXG4vKipcbiAqIHtAbGluayBQaXBlTWV0YWRhdGF9IGZhY3RvcnkgZm9yIGNyZWF0aW5nIGRlY29yYXRvcnMuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS90cy9tZXRhZGF0YS9tZXRhZGF0YS50cyByZWdpb249J3BpcGUnfVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFBpcGVNZXRhZGF0YUZhY3Rvcnkge1xuICAob2JqOiB7bmFtZTogc3RyaW5nLCBwdXJlPzogYm9vbGVhbn0pOiBhbnk7XG4gIG5ldyAob2JqOiB7bmFtZTogc3RyaW5nLCBwdXJlPzogYm9vbGVhbn0pOiBhbnk7XG59XG5cbi8qKlxuICoge0BsaW5rIElucHV0TWV0YWRhdGF9IGZhY3RvcnkgZm9yIGNyZWF0aW5nIGRlY29yYXRvcnMuXG4gKlxuICogU2VlIHtAbGluayBJbnB1dE1ldGFkYXRhfS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJbnB1dE1ldGFkYXRhRmFjdG9yeSB7XG4gIChiaW5kaW5nUHJvcGVydHlOYW1lPzogc3RyaW5nKTogYW55O1xuICBuZXcgKGJpbmRpbmdQcm9wZXJ0eU5hbWU/OiBzdHJpbmcpOiBhbnk7XG59XG5cbi8qKlxuICoge0BsaW5rIE91dHB1dE1ldGFkYXRhfSBmYWN0b3J5IGZvciBjcmVhdGluZyBkZWNvcmF0b3JzLlxuICpcbiAqIFNlZSB7QGxpbmsgT3V0cHV0TWV0YWRhdGF9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIE91dHB1dE1ldGFkYXRhRmFjdG9yeSB7XG4gIChiaW5kaW5nUHJvcGVydHlOYW1lPzogc3RyaW5nKTogYW55O1xuICBuZXcgKGJpbmRpbmdQcm9wZXJ0eU5hbWU/OiBzdHJpbmcpOiBhbnk7XG59XG5cbi8qKlxuICoge0BsaW5rIEhvc3RCaW5kaW5nTWV0YWRhdGF9IGZhY3RvcnkgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSG9zdEJpbmRpbmdNZXRhZGF0YUZhY3Rvcnkge1xuICAoaG9zdFByb3BlcnR5TmFtZT86IHN0cmluZyk6IGFueTtcbiAgbmV3IChob3N0UHJvcGVydHlOYW1lPzogc3RyaW5nKTogYW55O1xufVxuXG4vKipcbiAqIHtAbGluayBIb3N0TGlzdGVuZXJNZXRhZGF0YX0gZmFjdG9yeSBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIb3N0TGlzdGVuZXJNZXRhZGF0YUZhY3Rvcnkge1xuICAoZXZlbnROYW1lOiBzdHJpbmcsIGFyZ3M/OiBzdHJpbmdbXSk6IGFueTtcbiAgbmV3IChldmVudE5hbWU6IHN0cmluZywgYXJncz86IHN0cmluZ1tdKTogYW55O1xufVxuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIENvbXBvbmVudE1ldGFkYXRhLlxuLyoqXG4gKiBEZWNsYXJlIHJldXNhYmxlIFVJIGJ1aWxkaW5nIGJsb2NrcyBmb3IgYW4gYXBwbGljYXRpb24uXG4gKlxuICogRWFjaCBBbmd1bGFyIGNvbXBvbmVudCByZXF1aXJlcyBhIHNpbmdsZSBgQENvbXBvbmVudGAgYW5ub3RhdGlvbi4gVGhlIGBAQ29tcG9uZW50YFxuICogYW5ub3RhdGlvbiBzcGVjaWZpZXMgd2hlbiBhIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQsIGFuZCB3aGljaCBwcm9wZXJ0aWVzIGFuZCBob3N0TGlzdGVuZXJzIGl0XG4gKiBiaW5kcyB0by5cbiAqXG4gKiBXaGVuIGEgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCwgQW5ndWxhclxuICogLSBjcmVhdGVzIGEgc2hhZG93IERPTSBmb3IgdGhlIGNvbXBvbmVudC5cbiAqIC0gbG9hZHMgdGhlIHNlbGVjdGVkIHRlbXBsYXRlIGludG8gdGhlIHNoYWRvdyBET00uXG4gKiAtIGNyZWF0ZXMgYWxsIHRoZSBpbmplY3RhYmxlIG9iamVjdHMgY29uZmlndXJlZCB3aXRoIGBwcm92aWRlcnNgIGFuZCBgdmlld1Byb3ZpZGVyc2AuXG4gKlxuICogQWxsIHRlbXBsYXRlIGV4cHJlc3Npb25zIGFuZCBzdGF0ZW1lbnRzIGFyZSB0aGVuIGV2YWx1YXRlZCBhZ2FpbnN0IHRoZSBjb21wb25lbnQgaW5zdGFuY2UuXG4gKlxuICogIyMgTGlmZWN5Y2xlIGhvb2tzXG4gKlxuICogV2hlbiB0aGUgY29tcG9uZW50IGNsYXNzIGltcGxlbWVudHMgc29tZSB7QGxpbmsgLi4vLi4vZ3VpZGUvbGlmZWN5Y2xlLWhvb2tzLmh0bWx9IHRoZSBjYWxsYmFja3NcbiAqIGFyZSBjYWxsZWQgYnkgdGhlIGNoYW5nZSBkZXRlY3Rpb24gYXQgZGVmaW5lZCBwb2ludHMgaW4gdGltZSBkdXJpbmcgdGhlIGxpZmUgb2YgdGhlIGNvbXBvbmVudC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3RzL21ldGFkYXRhL21ldGFkYXRhLnRzIHJlZ2lvbj0nY29tcG9uZW50J31cbiAqL1xuZXhwb3J0IHZhciBDb21wb25lbnQ6IENvbXBvbmVudE1ldGFkYXRhRmFjdG9yeSA9XG4gICAgPENvbXBvbmVudE1ldGFkYXRhRmFjdG9yeT5tYWtlRGVjb3JhdG9yKENvbXBvbmVudE1ldGFkYXRhLCAoZm46IGFueSkgPT4gZm4uVmlldyA9IFZpZXcpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIERpcmVjdGl2ZU1ldGFkYXRhLlxuLyoqXG4gKiBEaXJlY3RpdmVzIGFsbG93IHlvdSB0byBhdHRhY2ggYmVoYXZpb3IgdG8gZWxlbWVudHMgaW4gdGhlIERPTS5cbiAqXG4gKiB7QGxpbmsgRGlyZWN0aXZlTWV0YWRhdGF9cyB3aXRoIGFuIGVtYmVkZGVkIHZpZXcgYXJlIGNhbGxlZCB7QGxpbmsgQ29tcG9uZW50TWV0YWRhdGF9cy5cbiAqXG4gKiBBIGRpcmVjdGl2ZSBjb25zaXN0cyBvZiBhIHNpbmdsZSBkaXJlY3RpdmUgYW5ub3RhdGlvbiBhbmQgYSBjb250cm9sbGVyIGNsYXNzLiBXaGVuIHRoZVxuICogZGlyZWN0aXZlJ3MgYHNlbGVjdG9yYCBtYXRjaGVzXG4gKiBlbGVtZW50cyBpbiB0aGUgRE9NLCB0aGUgZm9sbG93aW5nIHN0ZXBzIG9jY3VyOlxuICpcbiAqIDEuIEZvciBlYWNoIGRpcmVjdGl2ZSwgdGhlIGBFbGVtZW50SW5qZWN0b3JgIGF0dGVtcHRzIHRvIHJlc29sdmUgdGhlIGRpcmVjdGl2ZSdzIGNvbnN0cnVjdG9yXG4gKiBhcmd1bWVudHMuXG4gKiAyLiBBbmd1bGFyIGluc3RhbnRpYXRlcyBkaXJlY3RpdmVzIGZvciBlYWNoIG1hdGNoZWQgZWxlbWVudCB1c2luZyBgRWxlbWVudEluamVjdG9yYCBpbiBhXG4gKiBkZXB0aC1maXJzdCBvcmRlcixcbiAqICAgIGFzIGRlY2xhcmVkIGluIHRoZSBIVE1MLlxuICpcbiAqICMjIFVuZGVyc3RhbmRpbmcgSG93IEluamVjdGlvbiBXb3Jrc1xuICpcbiAqIFRoZXJlIGFyZSB0aHJlZSBzdGFnZXMgb2YgaW5qZWN0aW9uIHJlc29sdXRpb24uXG4gKiAtICpQcmUtZXhpc3RpbmcgSW5qZWN0b3JzKjpcbiAqICAgLSBUaGUgdGVybWluYWwge0BsaW5rIEluamVjdG9yfSBjYW5ub3QgcmVzb2x2ZSBkZXBlbmRlbmNpZXMuIEl0IGVpdGhlciB0aHJvd3MgYW4gZXJyb3Igb3IsIGlmXG4gKiB0aGUgZGVwZW5kZW5jeSB3YXNcbiAqICAgICBzcGVjaWZpZWQgYXMgYEBPcHRpb25hbGAsIHJldHVybnMgYG51bGxgLlxuICogICAtIFRoZSBwbGF0Zm9ybSBpbmplY3RvciByZXNvbHZlcyBicm93c2VyIHNpbmdsZXRvbiByZXNvdXJjZXMsIHN1Y2ggYXM6IGNvb2tpZXMsIHRpdGxlLFxuICogbG9jYXRpb24sIGFuZCBvdGhlcnMuXG4gKiAtICpDb21wb25lbnQgSW5qZWN0b3JzKjogRWFjaCBjb21wb25lbnQgaW5zdGFuY2UgaGFzIGl0cyBvd24ge0BsaW5rIEluamVjdG9yfSwgYW5kIHRoZXkgZm9sbG93XG4gKiB0aGUgc2FtZSBwYXJlbnQtY2hpbGQgaGllcmFyY2h5XG4gKiAgICAgYXMgdGhlIGNvbXBvbmVudCBpbnN0YW5jZXMgaW4gdGhlIERPTS5cbiAqIC0gKkVsZW1lbnQgSW5qZWN0b3JzKjogRWFjaCBjb21wb25lbnQgaW5zdGFuY2UgaGFzIGEgU2hhZG93IERPTS4gV2l0aGluIHRoZSBTaGFkb3cgRE9NIGVhY2hcbiAqIGVsZW1lbnQgaGFzIGFuIGBFbGVtZW50SW5qZWN0b3JgXG4gKiAgICAgd2hpY2ggZm9sbG93IHRoZSBzYW1lIHBhcmVudC1jaGlsZCBoaWVyYXJjaHkgYXMgdGhlIERPTSBlbGVtZW50cyB0aGVtc2VsdmVzLlxuICpcbiAqIFdoZW4gYSB0ZW1wbGF0ZSBpcyBpbnN0YW50aWF0ZWQsIGl0IGFsc28gbXVzdCBpbnN0YW50aWF0ZSB0aGUgY29ycmVzcG9uZGluZyBkaXJlY3RpdmVzIGluIGFcbiAqIGRlcHRoLWZpcnN0IG9yZGVyLiBUaGVcbiAqIGN1cnJlbnQgYEVsZW1lbnRJbmplY3RvcmAgcmVzb2x2ZXMgdGhlIGNvbnN0cnVjdG9yIGRlcGVuZGVuY2llcyBmb3IgZWFjaCBkaXJlY3RpdmUuXG4gKlxuICogQW5ndWxhciB0aGVuIHJlc29sdmVzIGRlcGVuZGVuY2llcyBhcyBmb2xsb3dzLCBhY2NvcmRpbmcgdG8gdGhlIG9yZGVyIGluIHdoaWNoIHRoZXkgYXBwZWFyIGluIHRoZVxuICoge0BsaW5rIFZpZXdNZXRhZGF0YX06XG4gKlxuICogMS4gRGVwZW5kZW5jaWVzIG9uIHRoZSBjdXJyZW50IGVsZW1lbnRcbiAqIDIuIERlcGVuZGVuY2llcyBvbiBlbGVtZW50IGluamVjdG9ycyBhbmQgdGhlaXIgcGFyZW50cyB1bnRpbCBpdCBlbmNvdW50ZXJzIGEgU2hhZG93IERPTSBib3VuZGFyeVxuICogMy4gRGVwZW5kZW5jaWVzIG9uIGNvbXBvbmVudCBpbmplY3RvcnMgYW5kIHRoZWlyIHBhcmVudHMgdW50aWwgaXQgZW5jb3VudGVycyB0aGUgcm9vdCBjb21wb25lbnRcbiAqIDQuIERlcGVuZGVuY2llcyBvbiBwcmUtZXhpc3RpbmcgaW5qZWN0b3JzXG4gKlxuICpcbiAqIFRoZSBgRWxlbWVudEluamVjdG9yYCBjYW4gaW5qZWN0IG90aGVyIGRpcmVjdGl2ZXMsIGVsZW1lbnQtc3BlY2lmaWMgc3BlY2lhbCBvYmplY3RzLCBvciBpdCBjYW5cbiAqIGRlbGVnYXRlIHRvIHRoZSBwYXJlbnRcbiAqIGluamVjdG9yLlxuICpcbiAqIFRvIGluamVjdCBvdGhlciBkaXJlY3RpdmVzLCBkZWNsYXJlIHRoZSBjb25zdHJ1Y3RvciBwYXJhbWV0ZXIgYXM6XG4gKiAtIGBkaXJlY3RpdmU6RGlyZWN0aXZlVHlwZWA6IGEgZGlyZWN0aXZlIG9uIHRoZSBjdXJyZW50IGVsZW1lbnQgb25seVxuICogLSBgQEhvc3QoKSBkaXJlY3RpdmU6RGlyZWN0aXZlVHlwZWA6IGFueSBkaXJlY3RpdmUgdGhhdCBtYXRjaGVzIHRoZSB0eXBlIGJldHdlZW4gdGhlIGN1cnJlbnRcbiAqIGVsZW1lbnQgYW5kIHRoZVxuICogICAgU2hhZG93IERPTSByb290LlxuICogLSBgQFF1ZXJ5KERpcmVjdGl2ZVR5cGUpIHF1ZXJ5OlF1ZXJ5TGlzdDxEaXJlY3RpdmVUeXBlPmA6IEEgbGl2ZSBjb2xsZWN0aW9uIG9mIGRpcmVjdCBjaGlsZFxuICogZGlyZWN0aXZlcy5cbiAqIC0gYEBRdWVyeURlc2NlbmRhbnRzKERpcmVjdGl2ZVR5cGUpIHF1ZXJ5OlF1ZXJ5TGlzdDxEaXJlY3RpdmVUeXBlPmA6IEEgbGl2ZSBjb2xsZWN0aW9uIG9mIGFueVxuICogY2hpbGQgZGlyZWN0aXZlcy5cbiAqXG4gKiBUbyBpbmplY3QgZWxlbWVudC1zcGVjaWZpYyBzcGVjaWFsIG9iamVjdHMsIGRlY2xhcmUgdGhlIGNvbnN0cnVjdG9yIHBhcmFtZXRlciBhczpcbiAqIC0gYGVsZW1lbnQ6IEVsZW1lbnRSZWZgIHRvIG9idGFpbiBhIHJlZmVyZW5jZSB0byBsb2dpY2FsIGVsZW1lbnQgaW4gdGhlIHZpZXcuXG4gKiAtIGB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmYCB0byBjb250cm9sIGNoaWxkIHRlbXBsYXRlIGluc3RhbnRpYXRpb24sIGZvclxuICoge0BsaW5rIERpcmVjdGl2ZU1ldGFkYXRhfSBkaXJlY3RpdmVzIG9ubHlcbiAqIC0gYGJpbmRpbmdQcm9wYWdhdGlvbjogQmluZGluZ1Byb3BhZ2F0aW9uYCB0byBjb250cm9sIGNoYW5nZSBkZXRlY3Rpb24gaW4gYSBtb3JlIGdyYW51bGFyIHdheS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBkZW1vbnN0cmF0ZXMgaG93IGRlcGVuZGVuY3kgaW5qZWN0aW9uIHJlc29sdmVzIGNvbnN0cnVjdG9yIGFyZ3VtZW50cyBpblxuICogcHJhY3RpY2UuXG4gKlxuICpcbiAqIEFzc3VtZSB0aGlzIEhUTUwgdGVtcGxhdGU6XG4gKlxuICogYGBgXG4gKiA8ZGl2IGRlcGVuZGVuY3k9XCIxXCI+XG4gKiAgIDxkaXYgZGVwZW5kZW5jeT1cIjJcIj5cbiAqICAgICA8ZGl2IGRlcGVuZGVuY3k9XCIzXCIgbXktZGlyZWN0aXZlPlxuICogICAgICAgPGRpdiBkZXBlbmRlbmN5PVwiNFwiPlxuICogICAgICAgICA8ZGl2IGRlcGVuZGVuY3k9XCI1XCI+PC9kaXY+XG4gKiAgICAgICA8L2Rpdj5cbiAqICAgICAgIDxkaXYgZGVwZW5kZW5jeT1cIjZcIj48L2Rpdj5cbiAqICAgICA8L2Rpdj5cbiAqICAgPC9kaXY+XG4gKiA8L2Rpdj5cbiAqIGBgYFxuICpcbiAqIFdpdGggdGhlIGZvbGxvd2luZyBgZGVwZW5kZW5jeWAgZGVjb3JhdG9yIGFuZCBgU29tZVNlcnZpY2VgIGluamVjdGFibGUgY2xhc3MuXG4gKlxuICogYGBgXG4gKiBASW5qZWN0YWJsZSgpXG4gKiBjbGFzcyBTb21lU2VydmljZSB7XG4gKiB9XG4gKlxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnW2RlcGVuZGVuY3ldJyxcbiAqICAgaW5wdXRzOiBbXG4gKiAgICAgJ2lkOiBkZXBlbmRlbmN5J1xuICogICBdXG4gKiB9KVxuICogY2xhc3MgRGVwZW5kZW5jeSB7XG4gKiAgIGlkOnN0cmluZztcbiAqIH1cbiAqIGBgYFxuICpcbiAqIExldCdzIHN0ZXAgdGhyb3VnaCB0aGUgZGlmZmVyZW50IHdheXMgaW4gd2hpY2ggYE15RGlyZWN0aXZlYCBjb3VsZCBiZSBkZWNsYXJlZC4uLlxuICpcbiAqXG4gKiAjIyMgTm8gaW5qZWN0aW9uXG4gKlxuICogSGVyZSB0aGUgY29uc3RydWN0b3IgaXMgZGVjbGFyZWQgd2l0aCBubyBhcmd1bWVudHMsIHRoZXJlZm9yZSBub3RoaW5nIGlzIGluamVjdGVkIGludG9cbiAqIGBNeURpcmVjdGl2ZWAuXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoKSB7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIHdvdWxkIGJlIGluc3RhbnRpYXRlZCB3aXRoIG5vIGRlcGVuZGVuY2llcy5cbiAqXG4gKlxuICogIyMjIENvbXBvbmVudC1sZXZlbCBpbmplY3Rpb25cbiAqXG4gKiBEaXJlY3RpdmVzIGNhbiBpbmplY3QgYW55IGluamVjdGFibGUgaW5zdGFuY2UgZnJvbSB0aGUgY2xvc2VzdCBjb21wb25lbnQgaW5qZWN0b3Igb3IgYW55IG9mIGl0c1xuICogcGFyZW50cy5cbiAqXG4gKiBIZXJlLCB0aGUgY29uc3RydWN0b3IgZGVjbGFyZXMgYSBwYXJhbWV0ZXIsIGBzb21lU2VydmljZWAsIGFuZCBpbmplY3RzIHRoZSBgU29tZVNlcnZpY2VgIHR5cGVcbiAqIGZyb20gdGhlIHBhcmVudFxuICogY29tcG9uZW50J3MgaW5qZWN0b3IuXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3Rvcihzb21lU2VydmljZTogU29tZVNlcnZpY2UpIHtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggYSBkZXBlbmRlbmN5IG9uIGBTb21lU2VydmljZWAuXG4gKlxuICpcbiAqICMjIyBJbmplY3RpbmcgYSBkaXJlY3RpdmUgZnJvbSB0aGUgY3VycmVudCBlbGVtZW50XG4gKlxuICogRGlyZWN0aXZlcyBjYW4gaW5qZWN0IG90aGVyIGRpcmVjdGl2ZXMgZGVjbGFyZWQgb24gdGhlIGN1cnJlbnQgZWxlbWVudC5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihkZXBlbmRlbmN5OiBEZXBlbmRlbmN5KSB7XG4gKiAgICAgZXhwZWN0KGRlcGVuZGVuY3kuaWQpLnRvRXF1YWwoMyk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggYERlcGVuZGVuY3lgIGRlY2xhcmVkIGF0IHRoZSBzYW1lIGVsZW1lbnQsIGluIHRoaXMgY2FzZVxuICogYGRlcGVuZGVuY3k9XCIzXCJgLlxuICpcbiAqICMjIyBJbmplY3RpbmcgYSBkaXJlY3RpdmUgZnJvbSBhbnkgYW5jZXN0b3IgZWxlbWVudHNcbiAqXG4gKiBEaXJlY3RpdmVzIGNhbiBpbmplY3Qgb3RoZXIgZGlyZWN0aXZlcyBkZWNsYXJlZCBvbiBhbnkgYW5jZXN0b3IgZWxlbWVudCAoaW4gdGhlIGN1cnJlbnQgU2hhZG93XG4gKiBET00pLCBpLmUuIG9uIHRoZSBjdXJyZW50IGVsZW1lbnQsIHRoZVxuICogcGFyZW50IGVsZW1lbnQsIG9yIGl0cyBwYXJlbnRzLlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoQEhvc3QoKSBkZXBlbmRlbmN5OiBEZXBlbmRlbmN5KSB7XG4gKiAgICAgZXhwZWN0KGRlcGVuZGVuY3kuaWQpLnRvRXF1YWwoMik7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIGBASG9zdGAgY2hlY2tzIHRoZSBjdXJyZW50IGVsZW1lbnQsIHRoZSBwYXJlbnQsIGFzIHdlbGwgYXMgaXRzIHBhcmVudHMgcmVjdXJzaXZlbHkuIElmXG4gKiBgZGVwZW5kZW5jeT1cIjJcImAgZGlkbid0XG4gKiBleGlzdCBvbiB0aGUgZGlyZWN0IHBhcmVudCwgdGhpcyBpbmplY3Rpb24gd291bGRcbiAqIGhhdmUgcmV0dXJuZWRcbiAqIGBkZXBlbmRlbmN5PVwiMVwiYC5cbiAqXG4gKlxuICogIyMjIEluamVjdGluZyBhIGxpdmUgY29sbGVjdGlvbiBvZiBkaXJlY3QgY2hpbGQgZGlyZWN0aXZlc1xuICpcbiAqXG4gKiBBIGRpcmVjdGl2ZSBjYW4gYWxzbyBxdWVyeSBmb3Igb3RoZXIgY2hpbGQgZGlyZWN0aXZlcy4gU2luY2UgcGFyZW50IGRpcmVjdGl2ZXMgYXJlIGluc3RhbnRpYXRlZFxuICogYmVmb3JlIGNoaWxkIGRpcmVjdGl2ZXMsIGEgZGlyZWN0aXZlIGNhbid0IHNpbXBseSBpbmplY3QgdGhlIGxpc3Qgb2YgY2hpbGQgZGlyZWN0aXZlcy4gSW5zdGVhZCxcbiAqIHRoZSBkaXJlY3RpdmUgaW5qZWN0cyBhIHtAbGluayBRdWVyeUxpc3R9LCB3aGljaCB1cGRhdGVzIGl0cyBjb250ZW50cyBhcyBjaGlsZHJlbiBhcmUgYWRkZWQsXG4gKiByZW1vdmVkLCBvciBtb3ZlZCBieSBhIGRpcmVjdGl2ZSB0aGF0IHVzZXMgYSB7QGxpbmsgVmlld0NvbnRhaW5lclJlZn0gc3VjaCBhcyBhIGBuZ0ZvcmAsIGFuXG4gKiBgbmdJZmAsIG9yIGFuIGBuZ1N3aXRjaGAuXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KERlcGVuZGVuY3kpIGRlcGVuZGVuY2llczpRdWVyeUxpc3Q8RGVwZW5kZW5jeT4pIHtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggYSB7QGxpbmsgUXVlcnlMaXN0fSB3aGljaCBjb250YWlucyBgRGVwZW5kZW5jeWAgNCBhbmRcbiAqIDYuIEhlcmUsIGBEZXBlbmRlbmN5YCA1IHdvdWxkIG5vdCBiZSBpbmNsdWRlZCwgYmVjYXVzZSBpdCBpcyBub3QgYSBkaXJlY3QgY2hpbGQuXG4gKlxuICogIyMjIEluamVjdGluZyBhIGxpdmUgY29sbGVjdGlvbiBvZiBkZXNjZW5kYW50IGRpcmVjdGl2ZXNcbiAqXG4gKiBCeSBwYXNzaW5nIHRoZSBkZXNjZW5kYW50IGZsYWcgdG8gYEBRdWVyeWAgYWJvdmUsIHdlIGNhbiBpbmNsdWRlIHRoZSBjaGlsZHJlbiBvZiB0aGUgY2hpbGRcbiAqIGVsZW1lbnRzLlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeShEZXBlbmRlbmN5LCB7ZGVzY2VuZGFudHM6IHRydWV9KSBkZXBlbmRlbmNpZXM6UXVlcnlMaXN0PERlcGVuZGVuY3k+KSB7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIHdvdWxkIGJlIGluc3RhbnRpYXRlZCB3aXRoIGEgUXVlcnkgd2hpY2ggd291bGQgY29udGFpbiBgRGVwZW5kZW5jeWAgNCwgNSBhbmQgNi5cbiAqXG4gKiAjIyMgT3B0aW9uYWwgaW5qZWN0aW9uXG4gKlxuICogVGhlIG5vcm1hbCBiZWhhdmlvciBvZiBkaXJlY3RpdmVzIGlzIHRvIHJldHVybiBhbiBlcnJvciB3aGVuIGEgc3BlY2lmaWVkIGRlcGVuZGVuY3kgY2Fubm90IGJlXG4gKiByZXNvbHZlZC4gSWYgeW91XG4gKiB3b3VsZCBsaWtlIHRvIGluamVjdCBgbnVsbGAgb24gdW5yZXNvbHZlZCBkZXBlbmRlbmN5IGluc3RlYWQsIHlvdSBjYW4gYW5ub3RhdGUgdGhhdCBkZXBlbmRlbmN5XG4gKiB3aXRoIGBAT3B0aW9uYWwoKWAuXG4gKiBUaGlzIGV4cGxpY2l0bHkgcGVybWl0cyB0aGUgYXV0aG9yIG9mIGEgdGVtcGxhdGUgdG8gdHJlYXQgc29tZSBvZiB0aGUgc3Vycm91bmRpbmcgZGlyZWN0aXZlcyBhc1xuICogb3B0aW9uYWwuXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgZGVwZW5kZW5jeTpEZXBlbmRlbmN5KSB7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIHdvdWxkIGJlIGluc3RhbnRpYXRlZCB3aXRoIGEgYERlcGVuZGVuY3lgIGRpcmVjdGl2ZSBmb3VuZCBvbiB0aGUgY3VycmVudCBlbGVtZW50LlxuICogSWYgbm9uZSBjYW4gYmVcbiAqIGZvdW5kLCB0aGUgaW5qZWN0b3Igc3VwcGxpZXMgYG51bGxgIGluc3RlYWQgb2YgdGhyb3dpbmcgYW4gZXJyb3IuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBIZXJlIHdlIHVzZSBhIGRlY29yYXRvciBkaXJlY3RpdmUgdG8gc2ltcGx5IGRlZmluZSBiYXNpYyB0b29sLXRpcCBiZWhhdmlvci5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ1t0b29sdGlwXScsXG4gKiAgIGlucHV0czogW1xuICogICAgICd0ZXh0OiB0b29sdGlwJ1xuICogICBdLFxuICogICBob3N0OiB7XG4gKiAgICAgJyhtb3VzZWVudGVyKSc6ICdvbk1vdXNlRW50ZXIoKScsXG4gKiAgICAgJyhtb3VzZWxlYXZlKSc6ICdvbk1vdXNlTGVhdmUoKSdcbiAqICAgfVxuICogfSlcbiAqIGNsYXNzIFRvb2x0aXB7XG4gKiAgIHRleHQ6c3RyaW5nO1xuICogICBvdmVybGF5Ok92ZXJsYXk7IC8vIE5PVCBZRVQgSU1QTEVNRU5URURcbiAqICAgb3ZlcmxheU1hbmFnZXI6T3ZlcmxheU1hbmFnZXI7IC8vIE5PVCBZRVQgSU1QTEVNRU5URURcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKG92ZXJsYXlNYW5hZ2VyOk92ZXJsYXlNYW5hZ2VyKSB7XG4gKiAgICAgdGhpcy5vdmVybGF5ID0gb3ZlcmxheTtcbiAqICAgfVxuICpcbiAqICAgb25Nb3VzZUVudGVyKCkge1xuICogICAgIC8vIGV4YWN0IHNpZ25hdHVyZSB0byBiZSBkZXRlcm1pbmVkXG4gKiAgICAgdGhpcy5vdmVybGF5ID0gdGhpcy5vdmVybGF5TWFuYWdlci5vcGVuKHRleHQsIC4uLik7XG4gKiAgIH1cbiAqXG4gKiAgIG9uTW91c2VMZWF2ZSgpIHtcbiAqICAgICB0aGlzLm92ZXJsYXkuY2xvc2UoKTtcbiAqICAgICB0aGlzLm92ZXJsYXkgPSBudWxsO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqIEluIG91ciBIVE1MIHRlbXBsYXRlLCB3ZSBjYW4gdGhlbiBhZGQgdGhpcyBiZWhhdmlvciB0byBhIGA8ZGl2PmAgb3IgYW55IG90aGVyIGVsZW1lbnQgd2l0aCB0aGVcbiAqIGB0b29sdGlwYCBzZWxlY3RvcixcbiAqIGxpa2Ugc286XG4gKlxuICogYGBgXG4gKiA8ZGl2IHRvb2x0aXA9XCJzb21lIHRleHQgaGVyZVwiPjwvZGl2PlxuICogYGBgXG4gKlxuICogRGlyZWN0aXZlcyBjYW4gYWxzbyBjb250cm9sIHRoZSBpbnN0YW50aWF0aW9uLCBkZXN0cnVjdGlvbiwgYW5kIHBvc2l0aW9uaW5nIG9mIGlubGluZSB0ZW1wbGF0ZVxuICogZWxlbWVudHM6XG4gKlxuICogQSBkaXJlY3RpdmUgdXNlcyBhIHtAbGluayBWaWV3Q29udGFpbmVyUmVmfSB0byBpbnN0YW50aWF0ZSwgaW5zZXJ0LCBtb3ZlLCBhbmQgZGVzdHJveSB2aWV3cyBhdFxuICogcnVudGltZS5cbiAqIFRoZSB7QGxpbmsgVmlld0NvbnRhaW5lclJlZn0gaXMgY3JlYXRlZCBhcyBhIHJlc3VsdCBvZiBgPHRlbXBsYXRlPmAgZWxlbWVudCwgYW5kIHJlcHJlc2VudHMgYVxuICogbG9jYXRpb24gaW4gdGhlIGN1cnJlbnQgdmlld1xuICogd2hlcmUgdGhlc2UgYWN0aW9ucyBhcmUgcGVyZm9ybWVkLlxuICpcbiAqIFZpZXdzIGFyZSBhbHdheXMgY3JlYXRlZCBhcyBjaGlsZHJlbiBvZiB0aGUgY3VycmVudCB7QGxpbmsgVmlld01ldGFkYXRhfSwgYW5kIGFzIHNpYmxpbmdzIG9mIHRoZVxuICogYDx0ZW1wbGF0ZT5gIGVsZW1lbnQuIFRodXMgYVxuICogZGlyZWN0aXZlIGluIGEgY2hpbGQgdmlldyBjYW5ub3QgaW5qZWN0IHRoZSBkaXJlY3RpdmUgdGhhdCBjcmVhdGVkIGl0LlxuICpcbiAqIFNpbmNlIGRpcmVjdGl2ZXMgdGhhdCBjcmVhdGUgdmlld3MgdmlhIFZpZXdDb250YWluZXJzIGFyZSBjb21tb24gaW4gQW5ndWxhciwgYW5kIHVzaW5nIHRoZSBmdWxsXG4gKiBgPHRlbXBsYXRlPmAgZWxlbWVudCBzeW50YXggaXMgd29yZHksIEFuZ3VsYXJcbiAqIGFsc28gc3VwcG9ydHMgYSBzaG9ydGhhbmQgbm90YXRpb246IGA8bGkgKmZvbz1cImJhclwiPmAgYW5kIGA8bGkgdGVtcGxhdGU9XCJmb286IGJhclwiPmAgYXJlXG4gKiBlcXVpdmFsZW50LlxuICpcbiAqIFRodXMsXG4gKlxuICogYGBgXG4gKiA8dWw+XG4gKiAgIDxsaSAqZm9vPVwiYmFyXCIgdGl0bGU9XCJ0ZXh0XCI+PC9saT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBFeHBhbmRzIGluIHVzZSB0bzpcbiAqXG4gKiBgYGBcbiAqIDx1bD5cbiAqICAgPHRlbXBsYXRlIFtmb29dPVwiYmFyXCI+XG4gKiAgICAgPGxpIHRpdGxlPVwidGV4dFwiPjwvbGk+XG4gKiAgIDwvdGVtcGxhdGU+XG4gKiA8L3VsPlxuICogYGBgXG4gKlxuICogTm90aWNlIHRoYXQgYWx0aG91Z2ggdGhlIHNob3J0aGFuZCBwbGFjZXMgYCpmb289XCJiYXJcImAgd2l0aGluIHRoZSBgPGxpPmAgZWxlbWVudCwgdGhlIGJpbmRpbmcgZm9yXG4gKiB0aGUgZGlyZWN0aXZlXG4gKiBjb250cm9sbGVyIGlzIGNvcnJlY3RseSBpbnN0YW50aWF0ZWQgb24gdGhlIGA8dGVtcGxhdGU+YCBlbGVtZW50IHJhdGhlciB0aGFuIHRoZSBgPGxpPmAgZWxlbWVudC5cbiAqXG4gKiAjIyBMaWZlY3ljbGUgaG9va3NcbiAqXG4gKiBXaGVuIHRoZSBkaXJlY3RpdmUgY2xhc3MgaW1wbGVtZW50cyBzb21lIHtAbGluayAuLi8uLi9ndWlkZS9saWZlY3ljbGUtaG9va3MuaHRtbH0gdGhlIGNhbGxiYWNrc1xuICogYXJlIGNhbGxlZCBieSB0aGUgY2hhbmdlIGRldGVjdGlvbiBhdCBkZWZpbmVkIHBvaW50cyBpbiB0aW1lIGR1cmluZyB0aGUgbGlmZSBvZiB0aGUgZGlyZWN0aXZlLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogTGV0J3Mgc3VwcG9zZSB3ZSB3YW50IHRvIGltcGxlbWVudCB0aGUgYHVubGVzc2AgYmVoYXZpb3IsIHRvIGNvbmRpdGlvbmFsbHkgaW5jbHVkZSBhIHRlbXBsYXRlLlxuICpcbiAqIEhlcmUgaXMgYSBzaW1wbGUgZGlyZWN0aXZlIHRoYXQgdHJpZ2dlcnMgb24gYW4gYHVubGVzc2Agc2VsZWN0b3I6XG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdbdW5sZXNzXScsXG4gKiAgIGlucHV0czogWyd1bmxlc3MnXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBVbmxlc3Mge1xuICogICB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmO1xuICogICB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY7XG4gKiAgIHByZXZDb25kaXRpb246IGJvb2xlYW47XG4gKlxuICogICBjb25zdHJ1Y3Rvcih2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWYpIHtcbiAqICAgICB0aGlzLnZpZXdDb250YWluZXIgPSB2aWV3Q29udGFpbmVyO1xuICogICAgIHRoaXMudGVtcGxhdGVSZWYgPSB0ZW1wbGF0ZVJlZjtcbiAqICAgICB0aGlzLnByZXZDb25kaXRpb24gPSBudWxsO1xuICogICB9XG4gKlxuICogICBzZXQgdW5sZXNzKG5ld0NvbmRpdGlvbikge1xuICogICAgIGlmIChuZXdDb25kaXRpb24gJiYgKGlzQmxhbmsodGhpcy5wcmV2Q29uZGl0aW9uKSB8fCAhdGhpcy5wcmV2Q29uZGl0aW9uKSkge1xuICogICAgICAgdGhpcy5wcmV2Q29uZGl0aW9uID0gdHJ1ZTtcbiAqICAgICAgIHRoaXMudmlld0NvbnRhaW5lci5jbGVhcigpO1xuICogICAgIH0gZWxzZSBpZiAoIW5ld0NvbmRpdGlvbiAmJiAoaXNCbGFuayh0aGlzLnByZXZDb25kaXRpb24pIHx8IHRoaXMucHJldkNvbmRpdGlvbikpIHtcbiAqICAgICAgIHRoaXMucHJldkNvbmRpdGlvbiA9IGZhbHNlO1xuICogICAgICAgdGhpcy52aWV3Q29udGFpbmVyLmNyZWF0ZSh0aGlzLnRlbXBsYXRlUmVmKTtcbiAqICAgICB9XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFdlIGNhbiB0aGVuIHVzZSB0aGlzIGB1bmxlc3NgIHNlbGVjdG9yIGluIGEgdGVtcGxhdGU6XG4gKiBgYGBcbiAqIDx1bD5cbiAqICAgPGxpICp1bmxlc3M9XCJleHByXCI+PC9saT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBPbmNlIHRoZSBkaXJlY3RpdmUgaW5zdGFudGlhdGVzIHRoZSBjaGlsZCB2aWV3LCB0aGUgc2hvcnRoYW5kIG5vdGF0aW9uIGZvciB0aGUgdGVtcGxhdGUgZXhwYW5kc1xuICogYW5kIHRoZSByZXN1bHQgaXM6XG4gKlxuICogYGBgXG4gKiA8dWw+XG4gKiAgIDx0ZW1wbGF0ZSBbdW5sZXNzXT1cImV4cFwiPlxuICogICAgIDxsaT48L2xpPlxuICogICA8L3RlbXBsYXRlPlxuICogICA8bGk+PC9saT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBOb3RlIGFsc28gdGhhdCBhbHRob3VnaCB0aGUgYDxsaT48L2xpPmAgdGVtcGxhdGUgc3RpbGwgZXhpc3RzIGluc2lkZSB0aGUgYDx0ZW1wbGF0ZT48L3RlbXBsYXRlPmAsXG4gKiB0aGUgaW5zdGFudGlhdGVkXG4gKiB2aWV3IG9jY3VycyBvbiB0aGUgc2Vjb25kIGA8bGk+PC9saT5gIHdoaWNoIGlzIGEgc2libGluZyB0byB0aGUgYDx0ZW1wbGF0ZT5gIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCB2YXIgRGlyZWN0aXZlOiBEaXJlY3RpdmVNZXRhZGF0YUZhY3RvcnkgPVxuICAgIDxEaXJlY3RpdmVNZXRhZGF0YUZhY3Rvcnk+bWFrZURlY29yYXRvcihEaXJlY3RpdmVNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gVmlld01ldGFkYXRhLlxuLyoqXG4gKiBNZXRhZGF0YSBwcm9wZXJ0aWVzIGF2YWlsYWJsZSBmb3IgY29uZmlndXJpbmcgVmlld3MuXG4gKlxuICogRWFjaCBBbmd1bGFyIGNvbXBvbmVudCByZXF1aXJlcyBhIHNpbmdsZSBgQENvbXBvbmVudGAgYW5kIGF0IGxlYXN0IG9uZSBgQFZpZXdgIGFubm90YXRpb24uIFRoZVxuICogYEBWaWV3YCBhbm5vdGF0aW9uIHNwZWNpZmllcyB0aGUgSFRNTCB0ZW1wbGF0ZSB0byB1c2UsIGFuZCBsaXN0cyB0aGUgZGlyZWN0aXZlcyB0aGF0IGFyZSBhY3RpdmVcbiAqIHdpdGhpbiB0aGUgdGVtcGxhdGUuXG4gKlxuICogV2hlbiBhIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQsIHRoZSB0ZW1wbGF0ZSBpcyBsb2FkZWQgaW50byB0aGUgY29tcG9uZW50J3Mgc2hhZG93IHJvb3QsIGFuZFxuICogdGhlIGV4cHJlc3Npb25zIGFuZCBzdGF0ZW1lbnRzIGluIHRoZSB0ZW1wbGF0ZSBhcmUgZXZhbHVhdGVkIGFnYWluc3QgdGhlIGNvbXBvbmVudC5cbiAqXG4gKiBGb3IgZGV0YWlscyBvbiB0aGUgYEBDb21wb25lbnRgIGFubm90YXRpb24sIHNlZSB7QGxpbmsgQ29tcG9uZW50TWV0YWRhdGF9LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdncmVldCcsXG4gKiAgIHRlbXBsYXRlOiAnSGVsbG8ge3tuYW1lfX0hJyxcbiAqICAgZGlyZWN0aXZlczogW0dyZWV0VXNlciwgQm9sZF1cbiAqIH0pXG4gKiBjbGFzcyBHcmVldCB7XG4gKiAgIG5hbWU6IHN0cmluZztcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKCkge1xuICogICAgIHRoaXMubmFtZSA9ICdXb3JsZCc7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG52YXIgVmlldzogVmlld01ldGFkYXRhRmFjdG9yeSA9XG4gICAgPFZpZXdNZXRhZGF0YUZhY3Rvcnk+bWFrZURlY29yYXRvcihWaWV3TWV0YWRhdGEsIChmbjogYW55KSA9PiBmbi5WaWV3ID0gVmlldyk7XG5cbi8qKlxuICogU3BlY2lmaWVzIHRoYXQgYSBjb25zdGFudCBhdHRyaWJ1dGUgdmFsdWUgc2hvdWxkIGJlIGluamVjdGVkLlxuICpcbiAqIFRoZSBkaXJlY3RpdmUgY2FuIGluamVjdCBjb25zdGFudCBzdHJpbmcgbGl0ZXJhbHMgb2YgaG9zdCBlbGVtZW50IGF0dHJpYnV0ZXMuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBTdXBwb3NlIHdlIGhhdmUgYW4gYDxpbnB1dD5gIGVsZW1lbnQgYW5kIHdhbnQgdG8ga25vdyBpdHMgYHR5cGVgLlxuICpcbiAqIGBgYGh0bWxcbiAqIDxpbnB1dCB0eXBlPVwidGV4dFwiPlxuICogYGBgXG4gKlxuICogQSBkZWNvcmF0b3IgY2FuIGluamVjdCBzdHJpbmcgbGl0ZXJhbCBgdGV4dGAgbGlrZSBzbzpcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS90cy9tZXRhZGF0YS9tZXRhZGF0YS50cyByZWdpb249J2F0dHJpYnV0ZU1ldGFkYXRhJ31cbiAqL1xuZXhwb3J0IHZhciBBdHRyaWJ1dGU6IEF0dHJpYnV0ZU1ldGFkYXRhRmFjdG9yeSA9IG1ha2VQYXJhbURlY29yYXRvcihBdHRyaWJ1dGVNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gUXVlcnlNZXRhZGF0YS5cbi8qKlxuICogRGVjbGFyZXMgYW4gaW5qZWN0YWJsZSBwYXJhbWV0ZXIgdG8gYmUgYSBsaXZlIGxpc3Qgb2YgZGlyZWN0aXZlcyBvciB2YXJpYWJsZVxuICogYmluZGluZ3MgZnJvbSB0aGUgY29udGVudCBjaGlsZHJlbiBvZiBhIGRpcmVjdGl2ZS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvbFk5bThITHk3ejA2dkRvVWFTTjI/cD1wcmV2aWV3KSlcbiAqXG4gKiBBc3N1bWUgdGhhdCBgPHRhYnM+YCBjb21wb25lbnQgd291bGQgbGlrZSB0byBnZXQgYSBsaXN0IGl0cyBjaGlsZHJlbiBgPHBhbmU+YFxuICogY29tcG9uZW50cyBhcyBzaG93biBpbiB0aGlzIGV4YW1wbGU6XG4gKlxuICogYGBgaHRtbFxuICogPHRhYnM+XG4gKiAgIDxwYW5lIHRpdGxlPVwiT3ZlcnZpZXdcIj4uLi48L3BhbmU+XG4gKiAgIDxwYW5lICpuZ0Zvcj1cIiNvIG9mIG9iamVjdHNcIiBbdGl0bGVdPVwiby50aXRsZVwiPnt7by50ZXh0fX08L3BhbmU+XG4gKiA8L3RhYnM+XG4gKiBgYGBcbiAqXG4gKiBUaGUgcHJlZmVycmVkIHNvbHV0aW9uIGlzIHRvIHF1ZXJ5IGZvciBgUGFuZWAgZGlyZWN0aXZlcyB1c2luZyB0aGlzIGRlY29yYXRvci5cbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdwYW5lJyxcbiAqICAgaW5wdXRzOiBbJ3RpdGxlJ11cbiAqIH0pXG4gKiBjbGFzcyBQYW5lIHtcbiAqICAgdGl0bGU6c3RyaW5nO1xuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogIHNlbGVjdG9yOiAndGFicycsXG4gKiAgdGVtcGxhdGU6IGBcbiAqICAgIDx1bD5cbiAqICAgICAgPGxpICpuZ0Zvcj1cIiNwYW5lIG9mIHBhbmVzXCI+e3twYW5lLnRpdGxlfX08L2xpPlxuICogICAgPC91bD5cbiAqICAgIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cbiAqICBgXG4gKiB9KVxuICogY2xhc3MgVGFicyB7XG4gKiAgIHBhbmVzOiBRdWVyeUxpc3Q8UGFuZT47XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeShQYW5lKSBwYW5lczpRdWVyeUxpc3Q8UGFuZT4pIHtcbiAqICAgICB0aGlzLnBhbmVzID0gcGFuZXM7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEEgcXVlcnkgY2FuIGxvb2sgZm9yIHZhcmlhYmxlIGJpbmRpbmdzIGJ5IHBhc3NpbmcgaW4gYSBzdHJpbmcgd2l0aCBkZXNpcmVkIGJpbmRpbmcgc3ltYm9sLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9zVDJqMjVjSDFkVVJBeUJSQ0t4MT9wPXByZXZpZXcpKVxuICogYGBgaHRtbFxuICogPHNlZWtlcj5cbiAqICAgPGRpdiAjZmluZG1lPi4uLjwvZGl2PlxuICogPC9zZWVrZXI+XG4gKlxuICogQENvbXBvbmVudCh7IHNlbGVjdG9yOiAnc2Vla2VyJyB9KVxuICogY2xhc3Mgc2Vla2VyIHtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KCdmaW5kbWUnKSBlbExpc3Q6IFF1ZXJ5TGlzdDxFbGVtZW50UmVmPikgey4uLn1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEluIHRoaXMgY2FzZSB0aGUgb2JqZWN0IHRoYXQgaXMgaW5qZWN0ZWQgZGVwZW5kIG9uIHRoZSB0eXBlIG9mIHRoZSB2YXJpYWJsZVxuICogYmluZGluZy4gSXQgY2FuIGJlIGFuIEVsZW1lbnRSZWYsIGEgZGlyZWN0aXZlIG9yIGEgY29tcG9uZW50LlxuICpcbiAqIFBhc3NpbmcgaW4gYSBjb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiB2YXJpYWJsZSBiaW5kaW5ncyB3aWxsIHF1ZXJ5IGZvciBhbGwgb2YgdGhlbS5cbiAqXG4gKiBgYGBodG1sXG4gKiA8c2Vla2VyPlxuICogICA8ZGl2ICNmaW5kTWU+Li4uPC9kaXY+XG4gKiAgIDxkaXYgI2ZpbmRNZVRvbz4uLi48L2Rpdj5cbiAqIDwvc2Vla2VyPlxuICpcbiAqICBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdzZWVrZXInXG4gKiB9KVxuICogY2xhc3MgU2Vla2VyIHtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KCdmaW5kTWUsIGZpbmRNZVRvbycpIGVsTGlzdDogUXVlcnlMaXN0PEVsZW1lbnRSZWY+KSB7Li4ufVxuICogfVxuICogYGBgXG4gKlxuICogQ29uZmlndXJlIHdoZXRoZXIgcXVlcnkgbG9va3MgZm9yIGRpcmVjdCBjaGlsZHJlbiBvciBhbGwgZGVzY2VuZGFudHNcbiAqIG9mIHRoZSBxdWVyeWluZyBlbGVtZW50LCBieSB1c2luZyB0aGUgYGRlc2NlbmRhbnRzYCBwYXJhbWV0ZXIuXG4gKiBJdCBpcyBzZXQgdG8gYGZhbHNlYCBieSBkZWZhdWx0LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC93dEdlQjk3N2J2N3F2QTVGVFlsOT9wPXByZXZpZXcpKVxuICogYGBgaHRtbFxuICogPGNvbnRhaW5lciAjZmlyc3Q+XG4gKiAgIDxpdGVtPmE8L2l0ZW0+XG4gKiAgIDxpdGVtPmI8L2l0ZW0+XG4gKiAgIDxjb250YWluZXIgI3NlY29uZD5cbiAqICAgICA8aXRlbT5jPC9pdGVtPlxuICogICA8L2NvbnRhaW5lcj5cbiAqIDwvY29udGFpbmVyPlxuICogYGBgXG4gKlxuICogV2hlbiBxdWVyeWluZyBmb3IgaXRlbXMsIHRoZSBmaXJzdCBjb250YWluZXIgd2lsbCBzZWUgb25seSBgYWAgYW5kIGBiYCBieSBkZWZhdWx0LFxuICogYnV0IHdpdGggYFF1ZXJ5KFRleHREaXJlY3RpdmUsIHtkZXNjZW5kYW50czogdHJ1ZX0pYCBpdCB3aWxsIHNlZSBgY2AgdG9vLlxuICpcbiAqIFRoZSBxdWVyaWVkIGRpcmVjdGl2ZXMgYXJlIGtlcHQgaW4gYSBkZXB0aC1maXJzdCBwcmUtb3JkZXIgd2l0aCByZXNwZWN0IHRvIHRoZWlyXG4gKiBwb3NpdGlvbnMgaW4gdGhlIERPTS5cbiAqXG4gKiBRdWVyeSBkb2VzIG5vdCBsb29rIGRlZXAgaW50byBhbnkgc3ViY29tcG9uZW50IHZpZXdzLlxuICpcbiAqIFF1ZXJ5IGlzIHVwZGF0ZWQgYXMgcGFydCBvZiB0aGUgY2hhbmdlLWRldGVjdGlvbiBjeWNsZS4gU2luY2UgY2hhbmdlIGRldGVjdGlvblxuICogaGFwcGVucyBhZnRlciBjb25zdHJ1Y3Rpb24gb2YgYSBkaXJlY3RpdmUsIFF1ZXJ5TGlzdCB3aWxsIGFsd2F5cyBiZSBlbXB0eSB3aGVuIG9ic2VydmVkIGluIHRoZVxuICogY29uc3RydWN0b3IuXG4gKlxuICogVGhlIGluamVjdGVkIG9iamVjdCBpcyBhbiB1bm1vZGlmaWFibGUgbGl2ZSBsaXN0LlxuICogU2VlIHtAbGluayBRdWVyeUxpc3R9IGZvciBtb3JlIGRldGFpbHMuXG4gKi9cbmV4cG9ydCB2YXIgUXVlcnk6IFF1ZXJ5TWV0YWRhdGFGYWN0b3J5ID0gbWFrZVBhcmFtRGVjb3JhdG9yKFF1ZXJ5TWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhLlxuLyoqXG4gKiBDb25maWd1cmVzIGEgY29udGVudCBxdWVyeS5cbiAqXG4gKiBDb250ZW50IHF1ZXJpZXMgYXJlIHNldCBiZWZvcmUgdGhlIGBuZ0FmdGVyQ29udGVudEluaXRgIGNhbGxiYWNrIGlzIGNhbGxlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnc29tZURpcidcbiAqIH0pXG4gKiBjbGFzcyBTb21lRGlyIHtcbiAqICAgQENvbnRlbnRDaGlsZHJlbihDaGlsZERpcmVjdGl2ZSkgY29udGVudENoaWxkcmVuOiBRdWVyeUxpc3Q8Q2hpbGREaXJlY3RpdmU+O1xuICpcbiAqICAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICogICAgIC8vIGNvbnRlbnRDaGlsZHJlbiBpcyBzZXRcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCB2YXIgQ29udGVudENoaWxkcmVuOiBDb250ZW50Q2hpbGRyZW5NZXRhZGF0YUZhY3RvcnkgPVxuICAgIG1ha2VQcm9wRGVjb3JhdG9yKENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBDb250ZW50Q2hpbGRNZXRhZGF0YS5cbi8qKlxuICogQ29uZmlndXJlcyBhIGNvbnRlbnQgcXVlcnkuXG4gKlxuICogQ29udGVudCBxdWVyaWVzIGFyZSBzZXQgYmVmb3JlIHRoZSBgbmdBZnRlckNvbnRlbnRJbml0YCBjYWxsYmFjayBpcyBjYWxsZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ3NvbWVEaXInXG4gKiB9KVxuICogY2xhc3MgU29tZURpciB7XG4gKiAgIEBDb250ZW50Q2hpbGQoQ2hpbGREaXJlY3RpdmUpIGNvbnRlbnRDaGlsZDtcbiAqXG4gKiAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAqICAgICAvLyBjb250ZW50Q2hpbGQgaXMgc2V0XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgdmFyIENvbnRlbnRDaGlsZDogQ29udGVudENoaWxkTWV0YWRhdGFGYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoQ29udGVudENoaWxkTWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIFZpZXdDaGlsZHJlbk1ldGFkYXRhLlxuLyoqXG4gKiBEZWNsYXJlcyBhIGxpc3Qgb2YgY2hpbGQgZWxlbWVudCByZWZlcmVuY2VzLlxuICpcbiAqIEFuZ3VsYXIgYXV0b21hdGljYWxseSB1cGRhdGVzIHRoZSBsaXN0IHdoZW4gdGhlIERPTSBpcyB1cGRhdGVkLlxuICpcbiAqIGBWaWV3Q2hpbGRyZW5gIHRha2VzIGEgYXJndW1lbnQgdG8gc2VsZWN0IGVsZW1lbnRzLlxuICpcbiAqIC0gSWYgdGhlIGFyZ3VtZW50IGlzIGEgdHlwZSwgZGlyZWN0aXZlcyBvciBjb21wb25lbnRzIHdpdGggdGhlIHR5cGUgd2lsbCBiZSBib3VuZC5cbiAqXG4gKiAtIElmIHRoZSBhcmd1bWVudCBpcyBhIHN0cmluZywgdGhlIHN0cmluZyBpcyBpbnRlcnByZXRlZCBhcyBhIGxpc3Qgb2YgY29tbWEtc2VwYXJhdGVkIHNlbGVjdG9ycy5cbiAqIEZvciBlYWNoIHNlbGVjdG9yLCBhbiBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIG1hdGNoaW5nIHRlbXBsYXRlIHZhcmlhYmxlIChlLmcuIGAjY2hpbGRgKSB3aWxsIGJlXG4gKiBib3VuZC5cbiAqXG4gKiBWaWV3IGNoaWxkcmVuIGFyZSBzZXQgYmVmb3JlIHRoZSBgbmdBZnRlclZpZXdJbml0YCBjYWxsYmFjayBpcyBjYWxsZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBXaXRoIHR5cGUgc2VsZWN0b3I6XG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdjaGlsZC1jbXAnLFxuICogICB0ZW1wbGF0ZTogJzxwPmNoaWxkPC9wPidcbiAqIH0pXG4gKiBjbGFzcyBDaGlsZENtcCB7XG4gKiAgIGRvU29tZXRoaW5nKCkge31cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdzb21lLWNtcCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGNoaWxkLWNtcD48L2NoaWxkLWNtcD5cbiAqICAgICA8Y2hpbGQtY21wPjwvY2hpbGQtY21wPlxuICogICAgIDxjaGlsZC1jbXA+PC9jaGlsZC1jbXA+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDaGlsZENtcF1cbiAqIH0pXG4gKiBjbGFzcyBTb21lQ21wIHtcbiAqICAgQFZpZXdDaGlsZHJlbihDaGlsZENtcCkgY2hpbGRyZW46UXVlcnlMaXN0PENoaWxkQ21wPjtcbiAqXG4gKiAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAqICAgICAvLyBjaGlsZHJlbiBhcmUgc2V0XG4gKiAgICAgdGhpcy5jaGlsZHJlbi50b0FycmF5KCkuZm9yRWFjaCgoY2hpbGQpPT5jaGlsZC5kb1NvbWV0aGluZygpKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogV2l0aCBzdHJpbmcgc2VsZWN0b3I6XG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdjaGlsZC1jbXAnLFxuICogICB0ZW1wbGF0ZTogJzxwPmNoaWxkPC9wPidcbiAqIH0pXG4gKiBjbGFzcyBDaGlsZENtcCB7XG4gKiAgIGRvU29tZXRoaW5nKCkge31cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdzb21lLWNtcCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGNoaWxkLWNtcCAjY2hpbGQxPjwvY2hpbGQtY21wPlxuICogICAgIDxjaGlsZC1jbXAgI2NoaWxkMj48L2NoaWxkLWNtcD5cbiAqICAgICA8Y2hpbGQtY21wICNjaGlsZDM+PC9jaGlsZC1jbXA+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDaGlsZENtcF1cbiAqIH0pXG4gKiBjbGFzcyBTb21lQ21wIHtcbiAqICAgQFZpZXdDaGlsZHJlbignY2hpbGQxLGNoaWxkMixjaGlsZDMnKSBjaGlsZHJlbjpRdWVyeUxpc3Q8Q2hpbGRDbXA+O1xuICpcbiAqICAgbmdBZnRlclZpZXdJbml0KCkge1xuICogICAgIC8vIGNoaWxkcmVuIGFyZSBzZXRcbiAqICAgICB0aGlzLmNoaWxkcmVuLnRvQXJyYXkoKS5mb3JFYWNoKChjaGlsZCk9PmNoaWxkLmRvU29tZXRoaW5nKCkpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBTZWUgYWxzbzogW1ZpZXdDaGlsZHJlbk1ldGFkYXRhXVxuICovXG5leHBvcnQgdmFyIFZpZXdDaGlsZHJlbjogVmlld0NoaWxkcmVuTWV0YWRhdGFGYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoVmlld0NoaWxkcmVuTWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIFZpZXdDaGlsZE1ldGFkYXRhLlxuLyoqXG4gKiBEZWNsYXJlcyBhIHJlZmVyZW5jZSB0byBhIGNoaWxkIGVsZW1lbnQuXG4gKlxuICogYFZpZXdDaGlsZHJlbmAgdGFrZXMgYSBhcmd1bWVudCB0byBzZWxlY3QgZWxlbWVudHMuXG4gKlxuICogLSBJZiB0aGUgYXJndW1lbnQgaXMgYSB0eXBlLCBhIGRpcmVjdGl2ZSBvciBhIGNvbXBvbmVudCB3aXRoIHRoZSB0eXBlIHdpbGwgYmUgYm91bmQuXG4gKlxuICogLSBJZiB0aGUgYXJndW1lbnQgaXMgYSBzdHJpbmcsIHRoZSBzdHJpbmcgaXMgaW50ZXJwcmV0ZWQgYXMgYSBzZWxlY3Rvci4gQW4gZWxlbWVudCBjb250YWluaW5nIHRoZVxuICogbWF0Y2hpbmcgdGVtcGxhdGUgdmFyaWFibGUgKGUuZy4gYCNjaGlsZGApIHdpbGwgYmUgYm91bmQuXG4gKlxuICogSW4gZWl0aGVyIGNhc2UsIGBAVmlld0NoaWxkKClgIGFzc2lnbnMgdGhlIGZpcnN0IChsb29raW5nIGZyb20gYWJvdmUpIGVsZW1lbnQgaWYgdGhlcmUgYXJlXG4gKiBtdWx0aXBsZSBtYXRjaGVzLlxuICpcbiAqIFZpZXcgY2hpbGQgaXMgc2V0IGJlZm9yZSB0aGUgYG5nQWZ0ZXJWaWV3SW5pdGAgY2FsbGJhY2sgaXMgY2FsbGVkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogV2l0aCB0eXBlIHNlbGVjdG9yOlxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnY2hpbGQtY21wJyxcbiAqICAgdGVtcGxhdGU6ICc8cD5jaGlsZDwvcD4nXG4gKiB9KVxuICogY2xhc3MgQ2hpbGRDbXAge1xuICogICBkb1NvbWV0aGluZygpIHt9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnc29tZS1jbXAnLFxuICogICB0ZW1wbGF0ZTogJzxjaGlsZC1jbXA+PC9jaGlsZC1jbXA+JyxcbiAqICAgZGlyZWN0aXZlczogW0NoaWxkQ21wXVxuICogfSlcbiAqIGNsYXNzIFNvbWVDbXAge1xuICogICBAVmlld0NoaWxkKENoaWxkQ21wKSBjaGlsZDpDaGlsZENtcDtcbiAqXG4gKiAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAqICAgICAvLyBjaGlsZCBpcyBzZXRcbiAqICAgICB0aGlzLmNoaWxkLmRvU29tZXRoaW5nKCk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFdpdGggc3RyaW5nIHNlbGVjdG9yOlxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnY2hpbGQtY21wJyxcbiAqICAgdGVtcGxhdGU6ICc8cD5jaGlsZDwvcD4nXG4gKiB9KVxuICogY2xhc3MgQ2hpbGRDbXAge1xuICogICBkb1NvbWV0aGluZygpIHt9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnc29tZS1jbXAnLFxuICogICB0ZW1wbGF0ZTogJzxjaGlsZC1jbXAgI2NoaWxkPjwvY2hpbGQtY21wPicsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDaGlsZENtcF1cbiAqIH0pXG4gKiBjbGFzcyBTb21lQ21wIHtcbiAqICAgQFZpZXdDaGlsZCgnY2hpbGQnKSBjaGlsZDpDaGlsZENtcDtcbiAqXG4gKiAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAqICAgICAvLyBjaGlsZCBpcyBzZXRcbiAqICAgICB0aGlzLmNoaWxkLmRvU29tZXRoaW5nKCk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICogU2VlIGFsc286IFtWaWV3Q2hpbGRNZXRhZGF0YV1cbiAqL1xuZXhwb3J0IHZhciBWaWV3Q2hpbGQ6IFZpZXdDaGlsZE1ldGFkYXRhRmFjdG9yeSA9IG1ha2VQcm9wRGVjb3JhdG9yKFZpZXdDaGlsZE1ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBWaWV3UXVlcnlNZXRhZGF0YS5cbi8qKlxuICogU2ltaWxhciB0byB7QGxpbmsgUXVlcnlNZXRhZGF0YX0sIGJ1dCBxdWVyeWluZyB0aGUgY29tcG9uZW50IHZpZXcsIGluc3RlYWQgb2ZcbiAqIHRoZSBjb250ZW50IGNoaWxkcmVuLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9lTnNGSERmN1lqeU02SXpLeE0xaj9wPXByZXZpZXcpKVxuICpcbiAqIGBgYGphdmFzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICAuLi4sXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGl0ZW0+IGEgPC9pdGVtPlxuICogICAgIDxpdGVtPiBiIDwvaXRlbT5cbiAqICAgICA8aXRlbT4gYyA8L2l0ZW0+XG4gKiAgIGBcbiAqIH0pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIHNob3duOiBib29sZWFuO1xuICpcbiAqICAgY29uc3RydWN0b3IocHJpdmF0ZSBAUXVlcnkoSXRlbSkgaXRlbXM6UXVlcnlMaXN0PEl0ZW0+KSB7XG4gKiAgICAgaXRlbXMuY2hhbmdlcy5zdWJzY3JpYmUoKCkgPT4gY29uc29sZS5sb2coaXRlbXMubGVuZ3RoKSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFN1cHBvcnRzIHRoZSBzYW1lIHF1ZXJ5aW5nIHBhcmFtZXRlcnMgYXMge0BsaW5rIFF1ZXJ5TWV0YWRhdGF9LCBleGNlcHRcbiAqIGBkZXNjZW5kYW50c2AuIFRoaXMgYWx3YXlzIHF1ZXJpZXMgdGhlIHdob2xlIHZpZXcuXG4gKlxuICogQXMgYHNob3duYCBpcyBmbGlwcGVkIGJldHdlZW4gdHJ1ZSBhbmQgZmFsc2UsIGl0ZW1zIHdpbGwgY29udGFpbiB6ZXJvIG9mIG9uZVxuICogaXRlbXMuXG4gKlxuICogU3BlY2lmaWVzIHRoYXQgYSB7QGxpbmsgUXVlcnlMaXN0fSBzaG91bGQgYmUgaW5qZWN0ZWQuXG4gKlxuICogVGhlIGluamVjdGVkIG9iamVjdCBpcyBhbiBpdGVyYWJsZSBhbmQgb2JzZXJ2YWJsZSBsaXZlIGxpc3QuXG4gKiBTZWUge0BsaW5rIFF1ZXJ5TGlzdH0gZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuZXhwb3J0IHZhciBWaWV3UXVlcnk6IFF1ZXJ5TWV0YWRhdGFGYWN0b3J5ID0gbWFrZVBhcmFtRGVjb3JhdG9yKFZpZXdRdWVyeU1ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBQaXBlTWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmUgcmV1c2FibGUgcGlwZSBmdW5jdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3RzL21ldGFkYXRhL21ldGFkYXRhLnRzIHJlZ2lvbj0ncGlwZSd9XG4gKi9cbmV4cG9ydCB2YXIgUGlwZTogUGlwZU1ldGFkYXRhRmFjdG9yeSA9IDxQaXBlTWV0YWRhdGFGYWN0b3J5Pm1ha2VEZWNvcmF0b3IoUGlwZU1ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBJbnB1dE1ldGFkYXRhLlxuLyoqXG4gKiBEZWNsYXJlcyBhIGRhdGEtYm91bmQgaW5wdXQgcHJvcGVydHkuXG4gKlxuICogQW5ndWxhciBhdXRvbWF0aWNhbGx5IHVwZGF0ZXMgZGF0YS1ib3VuZCBwcm9wZXJ0aWVzIGR1cmluZyBjaGFuZ2UgZGV0ZWN0aW9uLlxuICpcbiAqIGBJbnB1dE1ldGFkYXRhYCB0YWtlcyBhbiBvcHRpb25hbCBwYXJhbWV0ZXIgdGhhdCBzcGVjaWZpZXMgdGhlIG5hbWVcbiAqIHVzZWQgd2hlbiBpbnN0YW50aWF0aW5nIGEgY29tcG9uZW50IGluIHRoZSB0ZW1wbGF0ZS4gV2hlbiBub3QgcHJvdmlkZWQsXG4gKiB0aGUgbmFtZSBvZiB0aGUgZGVjb3JhdGVkIHByb3BlcnR5IGlzIHVzZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgY3JlYXRlcyBhIGNvbXBvbmVudCB3aXRoIHR3byBpbnB1dCBwcm9wZXJ0aWVzLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2JhbmstYWNjb3VudCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgQmFuayBOYW1lOiB7e2JhbmtOYW1lfX1cbiAqICAgICBBY2NvdW50IElkOiB7e2lkfX1cbiAqICAgYFxuICogfSlcbiAqIGNsYXNzIEJhbmtBY2NvdW50IHtcbiAqICAgQElucHV0KCkgYmFua05hbWU6IHN0cmluZztcbiAqICAgQElucHV0KCdhY2NvdW50LWlkJykgaWQ6IHN0cmluZztcbiAqXG4gKiAgIC8vIHRoaXMgcHJvcGVydHkgaXMgbm90IGJvdW5kLCBhbmQgd29uJ3QgYmUgYXV0b21hdGljYWxseSB1cGRhdGVkIGJ5IEFuZ3VsYXJcbiAqICAgbm9ybWFsaXplZEJhbmtOYW1lOiBzdHJpbmc7XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8YmFuay1hY2NvdW50IGJhbmstbmFtZT1cIlJCQ1wiIGFjY291bnQtaWQ9XCI0NzQ3XCI+PC9iYW5rLWFjY291bnQ+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtCYW5rQWNjb3VudF1cbiAqIH0pXG4gKiBjbGFzcyBBcHAge31cbiAqXG4gKiBib290c3RyYXAoQXBwKTtcbiAqIGBgYFxuICovXG5leHBvcnQgdmFyIElucHV0OiBJbnB1dE1ldGFkYXRhRmFjdG9yeSA9IG1ha2VQcm9wRGVjb3JhdG9yKElucHV0TWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIE91dHB1dE1ldGFkYXRhLlxuLyoqXG4gKiBEZWNsYXJlcyBhbiBldmVudC1ib3VuZCBvdXRwdXQgcHJvcGVydHkuXG4gKlxuICogV2hlbiBhbiBvdXRwdXQgcHJvcGVydHkgZW1pdHMgYW4gZXZlbnQsIGFuIGV2ZW50IGhhbmRsZXIgYXR0YWNoZWQgdG8gdGhhdCBldmVudFxuICogdGhlIHRlbXBsYXRlIGlzIGludm9rZWQuXG4gKlxuICogYE91dHB1dE1ldGFkYXRhYCB0YWtlcyBhbiBvcHRpb25hbCBwYXJhbWV0ZXIgdGhhdCBzcGVjaWZpZXMgdGhlIG5hbWVcbiAqIHVzZWQgd2hlbiBpbnN0YW50aWF0aW5nIGEgY29tcG9uZW50IGluIHRoZSB0ZW1wbGF0ZS4gV2hlbiBub3QgcHJvdmlkZWQsXG4gKiB0aGUgbmFtZSBvZiB0aGUgZGVjb3JhdGVkIHByb3BlcnR5IGlzIHVzZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdpbnRlcnZhbC1kaXInLFxuICogfSlcbiAqIGNsYXNzIEludGVydmFsRGlyIHtcbiAqICAgQE91dHB1dCgpIGV2ZXJ5U2Vjb25kID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICogICBAT3V0cHV0KCdldmVyeUZpdmVTZWNvbmRzJykgZml2ZTVTZWNzID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICpcbiAqICAgY29uc3RydWN0b3IoKSB7XG4gKiAgICAgc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5ldmVyeVNlY29uZC5lbWl0KFwiZXZlbnRcIiksIDEwMDApO1xuICogICAgIHNldEludGVydmFsKCgpID0+IHRoaXMuZml2ZTVTZWNzLmVtaXQoXCJldmVudFwiKSwgNTAwMCk7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxpbnRlcnZhbC1kaXIgKGV2ZXJ5U2Vjb25kKT1cImV2ZXJ5U2Vjb25kKClcIiAoZXZlcnlGaXZlU2Vjb25kcyk9XCJldmVyeUZpdmVTZWNvbmRzKClcIj5cbiAqICAgICA8L2ludGVydmFsLWRpcj5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW0ludGVydmFsRGlyXVxuICogfSlcbiAqIGNsYXNzIEFwcCB7XG4gKiAgIGV2ZXJ5U2Vjb25kKCkgeyBjb25zb2xlLmxvZygnc2Vjb25kJyk7IH1cbiAqICAgZXZlcnlGaXZlU2Vjb25kcygpIHsgY29uc29sZS5sb2coJ2ZpdmUgc2Vjb25kcycpOyB9XG4gKiB9XG4gKiBib290c3RyYXAoQXBwKTtcbiAqIGBgYFxuICovXG5leHBvcnQgdmFyIE91dHB1dDogT3V0cHV0TWV0YWRhdGFGYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoT3V0cHV0TWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIEhvc3RCaW5kaW5nTWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmVzIGEgaG9zdCBwcm9wZXJ0eSBiaW5kaW5nLlxuICpcbiAqIEFuZ3VsYXIgYXV0b21hdGljYWxseSBjaGVja3MgaG9zdCBwcm9wZXJ0eSBiaW5kaW5ncyBkdXJpbmcgY2hhbmdlIGRldGVjdGlvbi5cbiAqIElmIGEgYmluZGluZyBjaGFuZ2VzLCBpdCB3aWxsIHVwZGF0ZSB0aGUgaG9zdCBlbGVtZW50IG9mIHRoZSBkaXJlY3RpdmUuXG4gKlxuICogYEhvc3RCaW5kaW5nTWV0YWRhdGFgIHRha2VzIGFuIG9wdGlvbmFsIHBhcmFtZXRlciB0aGF0IHNwZWNpZmllcyB0aGUgcHJvcGVydHlcbiAqIG5hbWUgb2YgdGhlIGhvc3QgZWxlbWVudCB0aGF0IHdpbGwgYmUgdXBkYXRlZC4gV2hlbiBub3QgcHJvdmlkZWQsXG4gKiB0aGUgY2xhc3MgcHJvcGVydHkgbmFtZSBpcyB1c2VkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGNyZWF0ZXMgYSBkaXJlY3RpdmUgdGhhdCBzZXRzIHRoZSBgdmFsaWRgIGFuZCBgaW52YWxpZGAgY2xhc3Nlc1xuICogb24gdGhlIERPTSBlbGVtZW50IHRoYXQgaGFzIG5nTW9kZWwgZGlyZWN0aXZlIG9uIGl0LlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nTW9kZWxdJ30pXG4gKiBjbGFzcyBOZ01vZGVsU3RhdHVzIHtcbiAqICAgY29uc3RydWN0b3IocHVibGljIGNvbnRyb2w6TmdNb2RlbCkge31cbiAqICAgQEhvc3RCaW5kaW5nKCdbY2xhc3MudmFsaWRdJykgZ2V0IHZhbGlkIHsgcmV0dXJuIHRoaXMuY29udHJvbC52YWxpZDsgfVxuICogICBASG9zdEJpbmRpbmcoJ1tjbGFzcy5pbnZhbGlkXScpIGdldCBpbnZhbGlkIHsgcmV0dXJuIHRoaXMuY29udHJvbC5pbnZhbGlkOyB9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgdGVtcGxhdGU6IGA8aW5wdXQgWyhuZ01vZGVsKV09XCJwcm9wXCI+YCxcbiAqICAgZGlyZWN0aXZlczogW0ZPUk1fRElSRUNUSVZFUywgTmdNb2RlbFN0YXR1c11cbiAqIH0pXG4gKiBjbGFzcyBBcHAge1xuICogICBwcm9wO1xuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHApO1xuICogYGBgXG4gKi9cbmV4cG9ydCB2YXIgSG9zdEJpbmRpbmc6IEhvc3RCaW5kaW5nTWV0YWRhdGFGYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoSG9zdEJpbmRpbmdNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gSG9zdExpc3RlbmVyTWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmVzIGEgaG9zdCBsaXN0ZW5lci5cbiAqXG4gKiBBbmd1bGFyIHdpbGwgaW52b2tlIHRoZSBkZWNvcmF0ZWQgbWV0aG9kIHdoZW4gdGhlIGhvc3QgZWxlbWVudCBlbWl0cyB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICpcbiAqIElmIHRoZSBkZWNvcmF0ZWQgbWV0aG9kIHJldHVybnMgYGZhbHNlYCwgdGhlbiBgcHJldmVudERlZmF1bHRgIGlzIGFwcGxpZWQgb24gdGhlIERPTVxuICogZXZlbnQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgZGVjbGFyZXMgYSBkaXJlY3RpdmUgdGhhdCBhdHRhY2hlcyBhIGNsaWNrIGxpc3RlbmVyIHRvIHRoZSBidXR0b24gYW5kXG4gKiBjb3VudHMgY2xpY2tzLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnYnV0dG9uW2NvdW50aW5nXSd9KVxuICogY2xhc3MgQ291bnRDbGlja3Mge1xuICogICBudW1iZXJPZkNsaWNrcyA9IDA7XG4gKlxuICogICBASG9zdExpc3RlbmVyKCdjbGljaycsIFsnJGV2ZW50LnRhcmdldCddKVxuICogICBvbkNsaWNrKGJ0bikge1xuICogICAgIGNvbnNvbGUubG9nKFwiYnV0dG9uXCIsIGJ0biwgXCJudW1iZXIgb2YgY2xpY2tzOlwiLCB0aGlzLm51bWJlck9mQ2xpY2tzKyspO1xuICogICB9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgdGVtcGxhdGU6IGA8YnV0dG9uIGNvdW50aW5nPkluY3JlbWVudDwvYnV0dG9uPmAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDb3VudENsaWNrc11cbiAqIH0pXG4gKiBjbGFzcyBBcHAge31cbiAqXG4gKiBib290c3RyYXAoQXBwKTtcbiAqIGBgYFxuICovXG5leHBvcnQgdmFyIEhvc3RMaXN0ZW5lcjogSG9zdExpc3RlbmVyTWV0YWRhdGFGYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoSG9zdExpc3RlbmVyTWV0YWRhdGEpO1xuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIHtAbGluayBJbmplY3Rvck1vZHVsZU1ldGFkYXRhfSBkZWNvcmF0b3IgZnVuY3Rpb24uXG4gKlxuICogU2VlIHtAbGluayBJbmplY3Rvck1vZHVsZX0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW5qZWN0b3JNb2R1bGVEZWNvcmF0b3IgZXh0ZW5kcyBUeXBlRGVjb3JhdG9yIHt9XG5cbi8qKlxuICogRGVmaW5lcyBhbiBpbmplY3RvciBtb2R1bGUgZnJvbSB3aGljaCBhbiBpbmplY3RvciBjYW4gYmUgZ2VuZXJhdGVkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBASW5qZWN0b3JNb2R1bGUoe1xuICogICBwcm92aWRlcnM6IFtTb21lU2VydmljZV1cbiAqIH0pXG4gKiBjbGFzcyBNeU1vZHVsZSB7fVxuICpcbiAqIGBgYFxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgdmFyIEluamVjdG9yTW9kdWxlOiBJbmplY3Rvck1vZHVsZU1ldGFkYXRhRmFjdG9yeSA9XG4gICAgPEluamVjdG9yTW9kdWxlTWV0YWRhdGFGYWN0b3J5Pm1ha2VEZWNvcmF0b3IoSW5qZWN0b3JNb2R1bGVNZXRhZGF0YSk7XG5cbi8qKlxuICoge0BsaW5rIEluamVjdG9yTW9kdWxlTWV0YWRhdGF9IGZhY3RvcnkgZm9yIGNyZWF0aW5nIGRlY29yYXRvcnMuXG4gKlxuICogU2VlIHtAbGluayBJbmplY3Rvck1vZHVsZU1ldGFkYXRhfS5cbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJbmplY3Rvck1vZHVsZU1ldGFkYXRhRmFjdG9yeSB7XG4gIChvYmo/OiB7cHJvdmlkZXJzPzogYW55W119KTogSW5qZWN0b3JNb2R1bGVEZWNvcmF0b3I7XG4gIG5ldyAob2JqOiB7cHJvcGVydGllcz86IHN0cmluZ1tdfSk6IEluamVjdG9yTW9kdWxlTWV0YWRhdGE7XG59XG5cbi8qKlxuICogRGVmaW5lcyBhbiBpbmplY3RhYmxlIHdob3NlIHZhbHVlIGlzIGdpdmVuIGJ5IGEgcHJvcGVydHkgb24gYW4gSW5qZWN0b3JNb2R1bGUgY2xhc3MuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBJbmplY3Rvck1vZHVsZSgpXG4gKiBjbGFzcyBNeU1vZHVsZSB7XG4gKiAgIEBQcm92aWRlcyhTb21lVG9rZW4pXG4gKiAgIHNvbWVQcm9wOiBzdHJpbmcgPSAnSGVsbG8gd29ybGQnO1xuICogfVxuICogYGBgXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCB2YXIgUHJvdmlkZXM6IFByb3ZpZGVyUHJvcGVydHlNZXRhZGF0YUZhY3RvcnkgPSBtYWtlUHJvcERlY29yYXRvcihQcm92aWRlclByb3BlcnR5TWV0YWRhdGEpO1xuXG4vKipcbiAqIHtAbGluayBDb25maWdQcm92aWRlclByb3BlcnR5TWV0YWRhdGF9IGZhY3RvcnkgZm9yIGNyZWF0aW5nIGRlY29yYXRvcnMuXG4gKlxuICogU2VlIHtAbGluayBDb25maWdQcm92aWRlclByb3BlcnR5TWV0YWRhdGF9LlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFByb3ZpZGVyUHJvcGVydHlNZXRhZGF0YUZhY3Rvcnkge1xuICAodG9rZW46IGFueSwgb2JqPzoge211bHRpPzogYm9vbGVhbn0pOiBhbnk7XG4gIG5ldyAodG9rZW46IGFueSwgb2JqPzoge211bHRpPzogYm9vbGVhbn0pOiBhbnk7XG59XG4iXX0=