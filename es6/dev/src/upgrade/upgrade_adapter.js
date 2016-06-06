import { provide, platform, ComponentResolver, NgZone, Testability } from 'angular2/core';
import { global } from 'angular2/src/facade/lang';
import { ObservableWrapper } from 'angular2/src/facade/async';
import { BROWSER_PROVIDERS, BROWSER_APP_PROVIDERS } from 'angular2/platform/browser';
import { getComponentInfo } from './metadata';
import { onError, controllerKey } from './util';
import { NG1_COMPILE, NG1_INJECTOR, NG1_PARSE, NG1_ROOT_SCOPE, NG1_TESTABILITY, NG2_COMPILER, NG2_INJECTOR, NG2_COMPONENT_FACTORY_REF_MAP, NG2_ZONE, REQUIRE_INJECTOR } from './constants';
import { DowngradeNg2ComponentAdapter } from './downgrade_ng2_adapter';
import { UpgradeNg1ComponentAdapterBuilder } from './upgrade_ng1_adapter';
import * as angular from './angular_js';
var upgradeCount = 0;
/**
 * Use `UpgradeAdapter` to allow AngularJS v1 and Angular v2 to coexist in a single application.
 *
 * The `UpgradeAdapter` allows:
 * 1. creation of Angular v2 component from AngularJS v1 component directive
 *    (See [UpgradeAdapter#upgradeNg1Component()])
 * 2. creation of AngularJS v1 directive from Angular v2 component.
 *    (See [UpgradeAdapter#downgradeNg2Component()])
 * 3. Bootstrapping of a hybrid Angular application which contains both of the frameworks
 *    coexisting in a single application.
 *
 * ## Mental Model
 *
 * When reasoning about how a hybrid application works it is useful to have a mental model which
 * describes what is happening and explains what is happening at the lowest level.
 *
 * 1. There are two independent frameworks running in a single application, each framework treats
 *    the other as a black box.
 * 2. Each DOM element on the page is owned exactly by one framework. Whichever framework
 *    instantiated the element is the owner. Each framework only updates/interacts with its own
 *    DOM elements and ignores others.
 * 3. AngularJS v1 directives always execute inside AngularJS v1 framework codebase regardless of
 *    where they are instantiated.
 * 4. Angular v2 components always execute inside Angular v2 framework codebase regardless of
 *    where they are instantiated.
 * 5. An AngularJS v1 component can be upgraded to an Angular v2 component. This creates an
 *    Angular v2 directive, which bootstraps the AngularJS v1 component directive in that location.
 * 6. An Angular v2 component can be downgraded to an AngularJS v1 component directive. This creates
 *    an AngularJS v1 directive, which bootstraps the Angular v2 component in that location.
 * 7. Whenever an adapter component is instantiated the host element is owned by the framework
 *    doing the instantiation. The other framework then instantiates and owns the view for that
 *    component. This implies that component bindings will always follow the semantics of the
 *    instantiation framework. The syntax is always that of Angular v2 syntax.
 * 8. AngularJS v1 is always bootstrapped first and owns the bottom most view.
 * 9. The new application is running in Angular v2 zone, and therefore it no longer needs calls to
 *    `$apply()`.
 *
 * ### Example
 *
 * ```
 * var adapter = new UpgradeAdapter();
 * var module = angular.module('myExample', []);
 * module.directive('ng2', adapter.downgradeNg2Component(Ng2));
 *
 * module.directive('ng1', function() {
 *   return {
 *      scope: { title: '=' },
 *      template: 'ng1[Hello {{title}}!](<span ng-transclude></span>)'
 *   };
 * });
 *
 *
 * @Component({
 *   selector: 'ng2',
 *   inputs: ['name'],
 *   template: 'ng2[<ng1 [title]="name">transclude</ng1>](<ng-content></ng-content>)',
 *   directives: [adapter.upgradeNg1Component('ng1')]
 * })
 * class Ng2 {
 * }
 *
 * document.body.innerHTML = '<ng2 name="World">project</ng2>';
 *
 * adapter.bootstrap(document.body, ['myExample']).ready(function() {
 *   expect(document.body.textContent).toEqual(
 *       "ng2[ng1[Hello World!](transclude)](project)");
 * });
 * ```
 */
export class UpgradeAdapter {
    constructor() {
        /* @internal */
        this.idPrefix = `NG2_UPGRADE_${upgradeCount++}_`;
        /* @internal */
        this.upgradedComponents = [];
        /* @internal */
        this.downgradedComponents = {};
        /* @internal */
        this.providers = [];
    }
    /**
     * Allows Angular v2 Component to be used from AngularJS v1.
     *
     * Use `downgradeNg2Component` to create an AngularJS v1 Directive Definition Factory from
     * Angular v2 Component. The adapter will bootstrap Angular v2 component from within the
     * AngularJS v1 template.
     *
     * ## Mental Model
     *
     * 1. The component is instantiated by being listed in AngularJS v1 template. This means that the
     *    host element is controlled by AngularJS v1, but the component's view will be controlled by
     *    Angular v2.
     * 2. Even thought the component is instantiated in AngularJS v1, it will be using Angular v2
     *    syntax. This has to be done, this way because we must follow Angular v2 components do not
     *    declare how the attributes should be interpreted.
     *
     * ## Supported Features
     *
     * - Bindings:
     *   - Attribute: `<comp name="World">`
     *   - Interpolation:  `<comp greeting="Hello {{name}}!">`
     *   - Expression:  `<comp [name]="username">`
     *   - Event:  `<comp (close)="doSomething()">`
     * - Content projection: yes
     *
     * ### Example
     *
     * ```
     * var adapter = new UpgradeAdapter();
     * var module = angular.module('myExample', []);
     * module.directive('greet', adapter.downgradeNg2Component(Greeter));
     *
     * @Component({
     *   selector: 'greet',
     *   template: '{{salutation}} {{name}}! - <ng-content></ng-content>'
     * })
     * class Greeter {
     *   @Input() salutation: string;
     *   @Input() name: string;
     * }
     *
     * document.body.innerHTML =
     *   'ng1 template: <greet salutation="Hello" [name]="world">text</greet>';
     *
     * adapter.bootstrap(document.body, ['myExample']).ready(function() {
     *   expect(document.body.textContent).toEqual("ng1 template: Hello world! - text");
     * });
     * ```
     */
    downgradeNg2Component(type) {
        this.upgradedComponents.push(type);
        var info = getComponentInfo(type);
        return ng1ComponentDirective(info, `${this.idPrefix}${info.selector}_c`);
    }
    /**
     * Allows AngularJS v1 Component to be used from Angular v2.
     *
     * Use `upgradeNg1Component` to create an Angular v2 component from AngularJS v1 Component
     * directive. The adapter will bootstrap AngularJS v1 component from within the Angular v2
     * template.
     *
     * ## Mental Model
     *
     * 1. The component is instantiated by being listed in Angular v2 template. This means that the
     *    host element is controlled by Angular v2, but the component's view will be controlled by
     *    AngularJS v1.
     *
     * ## Supported Features
     *
     * - Bindings:
     *   - Attribute: `<comp name="World">`
     *   - Interpolation:  `<comp greeting="Hello {{name}}!">`
     *   - Expression:  `<comp [name]="username">`
     *   - Event:  `<comp (close)="doSomething()">`
     * - Transclusion: yes
     * - Only some of the features of
     *   [Directive Definition Object](https://docs.angularjs.org/api/ng/service/$compile) are
     *   supported:
     *   - `compile`: not supported because the host element is owned by Angular v2, which does
     *     not allow modifying DOM structure during compilation.
     *   - `controller`: supported. (NOTE: injection of `$attrs` and `$transclude` is not supported.)
     *   - `controllerAs': supported.
     *   - `bindToController': supported.
     *   - `link': supported. (NOTE: only pre-link function is supported.)
     *   - `name': supported.
     *   - `priority': ignored.
     *   - `replace': not supported.
     *   - `require`: supported.
     *   - `restrict`: must be set to 'E'.
     *   - `scope`: supported.
     *   - `template`: supported.
     *   - `templateUrl`: supported.
     *   - `terminal`: ignored.
     *   - `transclude`: supported.
     *
     *
     * ### Example
     *
     * ```
     * var adapter = new UpgradeAdapter();
     * var module = angular.module('myExample', []);
     *
     * module.directive('greet', function() {
     *   return {
     *     scope: {salutation: '=', name: '=' },
     *     template: '{{salutation}} {{name}}! - <span ng-transclude></span>'
     *   };
     * });
     *
     * module.directive('ng2', adapter.downgradeNg2Component(Ng2));
     *
     * @Component({
     *   selector: 'ng2',
     *   template: 'ng2 template: <greet salutation="Hello" [name]="world">text</greet>'
     *   directives: [adapter.upgradeNg1Component('greet')]
     * })
     * class Ng2 {
     * }
     *
     * document.body.innerHTML = '<ng2></ng2>';
     *
     * adapter.bootstrap(document.body, ['myExample']).ready(function() {
     *   expect(document.body.textContent).toEqual("ng2 template: Hello world! - text");
     * });
     * ```
     */
    upgradeNg1Component(name) {
        if (this.downgradedComponents.hasOwnProperty(name)) {
            return this.downgradedComponents[name].type;
        }
        else {
            return (this.downgradedComponents[name] = new UpgradeNg1ComponentAdapterBuilder(name)).type;
        }
    }
    /**
     * Bootstrap a hybrid AngularJS v1 / Angular v2 application.
     *
     * This `bootstrap` method is a direct replacement (takes same arguments) for AngularJS v1
     * [`bootstrap`](https://docs.angularjs.org/api/ng/function/angular.bootstrap) method. Unlike
     * AngularJS v1, this bootstrap is asynchronous.
     *
     * ### Example
     *
     * ```
     * var adapter = new UpgradeAdapter();
     * var module = angular.module('myExample', []);
     * module.directive('ng2', adapter.downgradeNg2Component(Ng2));
     *
     * module.directive('ng1', function() {
     *   return {
     *      scope: { title: '=' },
     *      template: 'ng1[Hello {{title}}!](<span ng-transclude></span>)'
     *   };
     * });
     *
     *
     * @Component({
     *   selector: 'ng2',
     *   inputs: ['name'],
     *   template: 'ng2[<ng1 [title]="name">transclude</ng1>](<ng-content></ng-content>)',
     *   directives: [adapter.upgradeNg1Component('ng1')]
     * })
     * class Ng2 {
     * }
     *
     * document.body.innerHTML = '<ng2 name="World">project</ng2>';
     *
     * adapter.bootstrap(document.body, ['myExample']).ready(function() {
     *   expect(document.body.textContent).toEqual(
     *       "ng2[ng1[Hello World!](transclude)](project)");
     * });
     * ```
     */
    bootstrap(element, modules, config) {
        var upgrade = new UpgradeAdapterRef();
        var ng1Injector = null;
        var platformRef = platform(BROWSER_PROVIDERS);
        var applicationRef = platformRef.application([
            BROWSER_APP_PROVIDERS,
            provide(NG1_INJECTOR, { useFactory: () => ng1Injector }),
            provide(NG1_COMPILE, { useFactory: () => ng1Injector.get(NG1_COMPILE) }),
            this.providers
        ]);
        var injector = applicationRef.injector;
        var ngZone = injector.get(NgZone);
        var compiler = injector.get(ComponentResolver);
        var delayApplyExps = [];
        var original$applyFn;
        var rootScopePrototype;
        var rootScope;
        var componentFactoryRefMap = {};
        var ng1Module = angular.module(this.idPrefix, modules);
        var ng1BootstrapPromise = null;
        var ng1compilePromise = null;
        ng1Module.value(NG2_INJECTOR, injector)
            .value(NG2_ZONE, ngZone)
            .value(NG2_COMPILER, compiler)
            .value(NG2_COMPONENT_FACTORY_REF_MAP, componentFactoryRefMap)
            .config([
            '$provide',
                (provide) => {
                provide.decorator(NG1_ROOT_SCOPE, [
                    '$delegate',
                    function (rootScopeDelegate) {
                        rootScopePrototype = rootScopeDelegate.constructor.prototype;
                        if (rootScopePrototype.hasOwnProperty('$apply')) {
                            original$applyFn = rootScopePrototype.$apply;
                            rootScopePrototype.$apply = (exp) => delayApplyExps.push(exp);
                        }
                        else {
                            throw new Error("Failed to find '$apply' on '$rootScope'!");
                        }
                        return rootScope = rootScopeDelegate;
                    }
                ]);
                provide.decorator(NG1_TESTABILITY, [
                    '$delegate',
                    function (testabilityDelegate) {
                        var ng2Testability = injector.get(Testability);
                        var origonalWhenStable = testabilityDelegate.whenStable;
                        var newWhenStable = (callback) => {
                            var whenStableContext = this;
                            origonalWhenStable.call(this, function () {
                                if (ng2Testability.isStable()) {
                                    callback.apply(this, arguments);
                                }
                                else {
                                    ng2Testability.whenStable(newWhenStable.bind(whenStableContext, callback));
                                }
                            });
                        };
                        testabilityDelegate.whenStable = newWhenStable;
                        return testabilityDelegate;
                    }
                ]);
            }
        ]);
        ng1compilePromise = new Promise((resolve, reject) => {
            ng1Module.run([
                '$injector',
                '$rootScope',
                    (injector, rootScope) => {
                    ng1Injector = injector;
                    ObservableWrapper.subscribe(ngZone.onMicrotaskEmpty, (_) => ngZone.runOutsideAngular(() => rootScope.$apply()));
                    UpgradeNg1ComponentAdapterBuilder.resolve(this.downgradedComponents, injector)
                        .then(resolve, reject);
                }
            ]);
        });
        // Make sure resumeBootstrap() only exists if the current bootstrap is deferred
        var windowAngular = global.angular;
        windowAngular.resumeBootstrap = undefined;
        angular.element(element).data(controllerKey(NG2_INJECTOR), injector);
        ngZone.run(() => { angular.bootstrap(element, [this.idPrefix], config); });
        ng1BootstrapPromise = new Promise((resolve, reject) => {
            if (windowAngular.resumeBootstrap) {
                var originalResumeBootstrap = windowAngular.resumeBootstrap;
                windowAngular.resumeBootstrap = function () {
                    windowAngular.resumeBootstrap = originalResumeBootstrap;
                    windowAngular.resumeBootstrap.apply(this, arguments);
                    resolve();
                };
            }
            else {
                resolve();
            }
        });
        Promise.all([
            this.compileNg2Components(compiler, componentFactoryRefMap),
            ng1BootstrapPromise,
            ng1compilePromise
        ])
            .then(() => {
            ngZone.run(() => {
                if (rootScopePrototype) {
                    rootScopePrototype.$apply = original$applyFn; // restore original $apply
                    while (delayApplyExps.length) {
                        rootScope.$apply(delayApplyExps.shift());
                    }
                    upgrade._bootstrapDone(applicationRef, ng1Injector);
                    rootScopePrototype = null;
                }
            });
        }, onError);
        return upgrade;
    }
    /**
     * Adds a provider to the top level environment of a hybrid AngularJS v1 / Angular v2 application.
     *
     * In hybrid AngularJS v1 / Angular v2 application, there is no one root Angular v2 component,
     * for this reason we provide an application global way of registering providers which is
     * consistent with single global injection in AngularJS v1.
     *
     * ### Example
     *
     * ```
     * class Greeter {
     *   greet(name) {
     *     alert('Hello ' + name + '!');
     *   }
     * }
     *
     * @Component({
     *   selector: 'app',
     *   template: ''
     * })
     * class App {
     *   constructor(greeter: Greeter) {
     *     this.greeter('World');
     *   }
     * }
     *
     * var adapter = new UpgradeAdapter();
     * adapter.addProvider(Greeter);
     *
     * var module = angular.module('myExample', []);
     * module.directive('app', adapter.downgradeNg2Component(App));
     *
     * document.body.innerHTML = '<app></app>'
     * adapter.bootstrap(document.body, ['myExample']);
     *```
     */
    addProvider(provider) { this.providers.push(provider); }
    /**
     * Allows AngularJS v1 service to be accessible from Angular v2.
     *
     *
     * ### Example
     *
     * ```
     * class Login { ... }
     * class Server { ... }
     *
     * @Injectable()
     * class Example {
     *   constructor(@Inject('server') server, login: Login) {
     *     ...
     *   }
     * }
     *
     * var module = angular.module('myExample', []);
     * module.service('server', Server);
     * module.service('login', Login);
     *
     * var adapter = new UpgradeAdapter();
     * adapter.upgradeNg1Provider('server');
     * adapter.upgradeNg1Provider('login', {asToken: Login});
     * adapter.addProvider(Example);
     *
     * adapter.bootstrap(document.body, ['myExample']).ready((ref) => {
     *   var example: Example = ref.ng2Injector.get(Example);
     * });
     *
     * ```
     */
    upgradeNg1Provider(name, options) {
        var token = options && options.asToken || name;
        this.providers.push(provide(token, {
            useFactory: (ng1Injector) => ng1Injector.get(name),
            deps: [NG1_INJECTOR]
        }));
    }
    /**
     * Allows Angular v2 service to be accessible from AngularJS v1.
     *
     *
     * ### Example
     *
     * ```
     * class Example {
     * }
     *
     * var adapter = new UpgradeAdapter();
     * adapter.addProvider(Example);
     *
     * var module = angular.module('myExample', []);
     * module.factory('example', adapter.downgradeNg2Provider(Example));
     *
     * adapter.bootstrap(document.body, ['myExample']).ready((ref) => {
     *   var example: Example = ref.ng1Injector.get('example');
     * });
     *
     * ```
     */
    downgradeNg2Provider(token) {
        var factory = function (injector) { return injector.get(token); };
        factory.$inject = [NG2_INJECTOR];
        return factory;
    }
    /* @internal */
    compileNg2Components(compiler, componentFactoryRefMap) {
        var promises = [];
        var types = this.upgradedComponents;
        for (var i = 0; i < types.length; i++) {
            promises.push(compiler.resolveComponent(types[i]));
        }
        return Promise.all(promises).then((componentFactories) => {
            var types = this.upgradedComponents;
            for (var i = 0; i < componentFactories.length; i++) {
                componentFactoryRefMap[getComponentInfo(types[i]).selector] = componentFactories[i];
            }
            return componentFactoryRefMap;
        }, onError);
    }
}
function ng1ComponentDirective(info, idPrefix) {
    directiveFactory.$inject = [NG2_COMPONENT_FACTORY_REF_MAP, NG1_PARSE];
    function directiveFactory(componentFactoryRefMap, parse) {
        var componentFactory = componentFactoryRefMap[info.selector];
        if (!componentFactory)
            throw new Error('Expecting ComponentFactory for: ' + info.selector);
        var idCount = 0;
        return {
            restrict: 'E',
            require: REQUIRE_INJECTOR,
            link: {
                post: (scope, element, attrs, parentInjector, transclude) => {
                    var domElement = element[0];
                    var facade = new DowngradeNg2ComponentAdapter(idPrefix + (idCount++), info, element, attrs, scope, parentInjector, parse, componentFactory);
                    facade.setupInputs();
                    facade.bootstrapNg2();
                    facade.projectContent();
                    facade.setupOutputs();
                    facade.registerCleanup();
                }
            }
        };
    }
    return directiveFactory;
}
/**
 * Use `UgradeAdapterRef` to control a hybrid AngularJS v1 / Angular v2 application.
 */
export class UpgradeAdapterRef {
    constructor() {
        /* @internal */
        this._readyFn = null;
        this.ng1RootScope = null;
        this.ng1Injector = null;
        this.ng2ApplicationRef = null;
        this.ng2Injector = null;
    }
    /* @internal */
    _bootstrapDone(applicationRef, ng1Injector) {
        this.ng2ApplicationRef = applicationRef;
        this.ng2Injector = applicationRef.injector;
        this.ng1Injector = ng1Injector;
        this.ng1RootScope = ng1Injector.get(NG1_ROOT_SCOPE);
        this._readyFn && this._readyFn(this);
    }
    /**
     * Register a callback function which is notified upon successful hybrid AngularJS v1 / Angular v2
     * application has been bootstrapped.
     *
     * The `ready` callback function is invoked inside the Angular v2 zone, therefore it does not
     * require a call to `$apply()`.
     */
    ready(fn) { this._readyFn = fn; }
    /**
     * Dispose of running hybrid AngularJS v1 / Angular v2 application.
     */
    dispose() {
        this.ng1Injector.get(NG1_ROOT_SCOPE).$destroy();
        this.ng2ApplicationRef.dispose();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1mWHllV01ucC50bXAvYW5ndWxhcjIvc3JjL3VwZ3JhZGUvdXBncmFkZV9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEVBQ0wsT0FBTyxFQUNQLFFBQVEsRUFFUixpQkFBaUIsRUFFakIsTUFBTSxFQUtOLFdBQVcsRUFFWixNQUFNLGVBQWU7T0FDZixFQUFDLE1BQU0sRUFBQyxNQUFNLDBCQUEwQjtPQUN4QyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sMkJBQTJCO09BQ3BELEVBQUMsaUJBQWlCLEVBQUUscUJBQXFCLEVBQUMsTUFBTSwyQkFBMkI7T0FFM0UsRUFBQyxnQkFBZ0IsRUFBZ0IsTUFBTSxZQUFZO09BQ25ELEVBQUMsT0FBTyxFQUFFLGFBQWEsRUFBQyxNQUFNLFFBQVE7T0FDdEMsRUFDTCxXQUFXLEVBQ1gsWUFBWSxFQUNaLFNBQVMsRUFDVCxjQUFjLEVBRWQsZUFBZSxFQUNmLFlBQVksRUFDWixZQUFZLEVBQ1osNkJBQTZCLEVBQzdCLFFBQVEsRUFDUixnQkFBZ0IsRUFDakIsTUFBTSxhQUFhO09BQ2IsRUFBQyw0QkFBNEIsRUFBQyxNQUFNLHlCQUF5QjtPQUM3RCxFQUFDLGlDQUFpQyxFQUFDLE1BQU0sdUJBQXVCO09BQ2hFLEtBQUssT0FBTyxNQUFNLGNBQWM7QUFFdkMsSUFBSSxZQUFZLEdBQVcsQ0FBQyxDQUFDO0FBRTdCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9FRztBQUNIO0lBQUE7UUFDRSxlQUFlO1FBQ1AsYUFBUSxHQUFXLGVBQWUsWUFBWSxFQUFFLEdBQUcsQ0FBQztRQUM1RCxlQUFlO1FBQ1AsdUJBQWtCLEdBQVcsRUFBRSxDQUFDO1FBQ3hDLGVBQWU7UUFDUCx5QkFBb0IsR0FB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YyxDQUFDLFFBQVEsQ0FBQztRQUMzQyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUMvQixJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxLQUFLLENBQUMsRUFBbUQsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFekY7O09BRUc7SUFDSSxPQUFPO1FBQ1osSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDaEQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ25DLENBQUM7QUFDSCxDQUFDO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBwcm92aWRlLFxuICBwbGF0Zm9ybSxcbiAgQXBwbGljYXRpb25SZWYsXG4gIENvbXBvbmVudFJlc29sdmVyLFxuICBJbmplY3RvcixcbiAgTmdab25lLFxuICBQbGF0Zm9ybVJlZixcbiAgQ29tcG9uZW50RmFjdG9yeSxcbiAgUHJvdmlkZXIsXG4gIFR5cGUsXG4gIFRlc3RhYmlsaXR5LFxuICBBUFBMSUNBVElPTl9DT01NT05fUFJPVklERVJTXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtnbG9iYWx9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge09ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7QlJPV1NFUl9QUk9WSURFUlMsIEJST1dTRVJfQVBQX1BST1ZJREVSU30gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG5cbmltcG9ydCB7Z2V0Q29tcG9uZW50SW5mbywgQ29tcG9uZW50SW5mb30gZnJvbSAnLi9tZXRhZGF0YSc7XG5pbXBvcnQge29uRXJyb3IsIGNvbnRyb2xsZXJLZXl9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQge1xuICBORzFfQ09NUElMRSxcbiAgTkcxX0lOSkVDVE9SLFxuICBORzFfUEFSU0UsXG4gIE5HMV9ST09UX1NDT1BFLFxuICBORzFfU0NPUEUsXG4gIE5HMV9URVNUQUJJTElUWSxcbiAgTkcyX0NPTVBJTEVSLFxuICBORzJfSU5KRUNUT1IsXG4gIE5HMl9DT01QT05FTlRfRkFDVE9SWV9SRUZfTUFQLFxuICBORzJfWk9ORSxcbiAgUkVRVUlSRV9JTkpFQ1RPUlxufSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge0Rvd25ncmFkZU5nMkNvbXBvbmVudEFkYXB0ZXJ9IGZyb20gJy4vZG93bmdyYWRlX25nMl9hZGFwdGVyJztcbmltcG9ydCB7VXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyfSBmcm9tICcuL3VwZ3JhZGVfbmcxX2FkYXB0ZXInO1xuaW1wb3J0ICogYXMgYW5ndWxhciBmcm9tICcuL2FuZ3VsYXJfanMnO1xuXG52YXIgdXBncmFkZUNvdW50OiBudW1iZXIgPSAwO1xuXG4vKipcbiAqIFVzZSBgVXBncmFkZUFkYXB0ZXJgIHRvIGFsbG93IEFuZ3VsYXJKUyB2MSBhbmQgQW5ndWxhciB2MiB0byBjb2V4aXN0IGluIGEgc2luZ2xlIGFwcGxpY2F0aW9uLlxuICpcbiAqIFRoZSBgVXBncmFkZUFkYXB0ZXJgIGFsbG93czpcbiAqIDEuIGNyZWF0aW9uIG9mIEFuZ3VsYXIgdjIgY29tcG9uZW50IGZyb20gQW5ndWxhckpTIHYxIGNvbXBvbmVudCBkaXJlY3RpdmVcbiAqICAgIChTZWUgW1VwZ3JhZGVBZGFwdGVyI3VwZ3JhZGVOZzFDb21wb25lbnQoKV0pXG4gKiAyLiBjcmVhdGlvbiBvZiBBbmd1bGFySlMgdjEgZGlyZWN0aXZlIGZyb20gQW5ndWxhciB2MiBjb21wb25lbnQuXG4gKiAgICAoU2VlIFtVcGdyYWRlQWRhcHRlciNkb3duZ3JhZGVOZzJDb21wb25lbnQoKV0pXG4gKiAzLiBCb290c3RyYXBwaW5nIG9mIGEgaHlicmlkIEFuZ3VsYXIgYXBwbGljYXRpb24gd2hpY2ggY29udGFpbnMgYm90aCBvZiB0aGUgZnJhbWV3b3Jrc1xuICogICAgY29leGlzdGluZyBpbiBhIHNpbmdsZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiAjIyBNZW50YWwgTW9kZWxcbiAqXG4gKiBXaGVuIHJlYXNvbmluZyBhYm91dCBob3cgYSBoeWJyaWQgYXBwbGljYXRpb24gd29ya3MgaXQgaXMgdXNlZnVsIHRvIGhhdmUgYSBtZW50YWwgbW9kZWwgd2hpY2hcbiAqIGRlc2NyaWJlcyB3aGF0IGlzIGhhcHBlbmluZyBhbmQgZXhwbGFpbnMgd2hhdCBpcyBoYXBwZW5pbmcgYXQgdGhlIGxvd2VzdCBsZXZlbC5cbiAqXG4gKiAxLiBUaGVyZSBhcmUgdHdvIGluZGVwZW5kZW50IGZyYW1ld29ya3MgcnVubmluZyBpbiBhIHNpbmdsZSBhcHBsaWNhdGlvbiwgZWFjaCBmcmFtZXdvcmsgdHJlYXRzXG4gKiAgICB0aGUgb3RoZXIgYXMgYSBibGFjayBib3guXG4gKiAyLiBFYWNoIERPTSBlbGVtZW50IG9uIHRoZSBwYWdlIGlzIG93bmVkIGV4YWN0bHkgYnkgb25lIGZyYW1ld29yay4gV2hpY2hldmVyIGZyYW1ld29ya1xuICogICAgaW5zdGFudGlhdGVkIHRoZSBlbGVtZW50IGlzIHRoZSBvd25lci4gRWFjaCBmcmFtZXdvcmsgb25seSB1cGRhdGVzL2ludGVyYWN0cyB3aXRoIGl0cyBvd25cbiAqICAgIERPTSBlbGVtZW50cyBhbmQgaWdub3JlcyBvdGhlcnMuXG4gKiAzLiBBbmd1bGFySlMgdjEgZGlyZWN0aXZlcyBhbHdheXMgZXhlY3V0ZSBpbnNpZGUgQW5ndWxhckpTIHYxIGZyYW1ld29yayBjb2RlYmFzZSByZWdhcmRsZXNzIG9mXG4gKiAgICB3aGVyZSB0aGV5IGFyZSBpbnN0YW50aWF0ZWQuXG4gKiA0LiBBbmd1bGFyIHYyIGNvbXBvbmVudHMgYWx3YXlzIGV4ZWN1dGUgaW5zaWRlIEFuZ3VsYXIgdjIgZnJhbWV3b3JrIGNvZGViYXNlIHJlZ2FyZGxlc3Mgb2ZcbiAqICAgIHdoZXJlIHRoZXkgYXJlIGluc3RhbnRpYXRlZC5cbiAqIDUuIEFuIEFuZ3VsYXJKUyB2MSBjb21wb25lbnQgY2FuIGJlIHVwZ3JhZGVkIHRvIGFuIEFuZ3VsYXIgdjIgY29tcG9uZW50LiBUaGlzIGNyZWF0ZXMgYW5cbiAqICAgIEFuZ3VsYXIgdjIgZGlyZWN0aXZlLCB3aGljaCBib290c3RyYXBzIHRoZSBBbmd1bGFySlMgdjEgY29tcG9uZW50IGRpcmVjdGl2ZSBpbiB0aGF0IGxvY2F0aW9uLlxuICogNi4gQW4gQW5ndWxhciB2MiBjb21wb25lbnQgY2FuIGJlIGRvd25ncmFkZWQgdG8gYW4gQW5ndWxhckpTIHYxIGNvbXBvbmVudCBkaXJlY3RpdmUuIFRoaXMgY3JlYXRlc1xuICogICAgYW4gQW5ndWxhckpTIHYxIGRpcmVjdGl2ZSwgd2hpY2ggYm9vdHN0cmFwcyB0aGUgQW5ndWxhciB2MiBjb21wb25lbnQgaW4gdGhhdCBsb2NhdGlvbi5cbiAqIDcuIFdoZW5ldmVyIGFuIGFkYXB0ZXIgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCB0aGUgaG9zdCBlbGVtZW50IGlzIG93bmVkIGJ5IHRoZSBmcmFtZXdvcmtcbiAqICAgIGRvaW5nIHRoZSBpbnN0YW50aWF0aW9uLiBUaGUgb3RoZXIgZnJhbWV3b3JrIHRoZW4gaW5zdGFudGlhdGVzIGFuZCBvd25zIHRoZSB2aWV3IGZvciB0aGF0XG4gKiAgICBjb21wb25lbnQuIFRoaXMgaW1wbGllcyB0aGF0IGNvbXBvbmVudCBiaW5kaW5ncyB3aWxsIGFsd2F5cyBmb2xsb3cgdGhlIHNlbWFudGljcyBvZiB0aGVcbiAqICAgIGluc3RhbnRpYXRpb24gZnJhbWV3b3JrLiBUaGUgc3ludGF4IGlzIGFsd2F5cyB0aGF0IG9mIEFuZ3VsYXIgdjIgc3ludGF4LlxuICogOC4gQW5ndWxhckpTIHYxIGlzIGFsd2F5cyBib290c3RyYXBwZWQgZmlyc3QgYW5kIG93bnMgdGhlIGJvdHRvbSBtb3N0IHZpZXcuXG4gKiA5LiBUaGUgbmV3IGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaW4gQW5ndWxhciB2MiB6b25lLCBhbmQgdGhlcmVmb3JlIGl0IG5vIGxvbmdlciBuZWVkcyBjYWxscyB0b1xuICogICAgYCRhcHBseSgpYC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogdmFyIGFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoKTtcbiAqIHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICogbW9kdWxlLmRpcmVjdGl2ZSgnbmcyJywgYWRhcHRlci5kb3duZ3JhZGVOZzJDb21wb25lbnQoTmcyKSk7XG4gKlxuICogbW9kdWxlLmRpcmVjdGl2ZSgnbmcxJywgZnVuY3Rpb24oKSB7XG4gKiAgIHJldHVybiB7XG4gKiAgICAgIHNjb3BlOiB7IHRpdGxlOiAnPScgfSxcbiAqICAgICAgdGVtcGxhdGU6ICduZzFbSGVsbG8ge3t0aXRsZX19IV0oPHNwYW4gbmctdHJhbnNjbHVkZT48L3NwYW4+KSdcbiAqICAgfTtcbiAqIH0pO1xuICpcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICduZzInLFxuICogICBpbnB1dHM6IFsnbmFtZSddLFxuICogICB0ZW1wbGF0ZTogJ25nMls8bmcxIFt0aXRsZV09XCJuYW1lXCI+dHJhbnNjbHVkZTwvbmcxPl0oPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PiknLFxuICogICBkaXJlY3RpdmVzOiBbYWRhcHRlci51cGdyYWRlTmcxQ29tcG9uZW50KCduZzEnKV1cbiAqIH0pXG4gKiBjbGFzcyBOZzIge1xuICogfVxuICpcbiAqIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gJzxuZzIgbmFtZT1cIldvcmxkXCI+cHJvamVjdDwvbmcyPic7XG4gKlxuICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoZnVuY3Rpb24oKSB7XG4gKiAgIGV4cGVjdChkb2N1bWVudC5ib2R5LnRleHRDb250ZW50KS50b0VxdWFsKFxuICogICAgICAgXCJuZzJbbmcxW0hlbGxvIFdvcmxkIV0odHJhbnNjbHVkZSldKHByb2plY3QpXCIpO1xuICogfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFVwZ3JhZGVBZGFwdGVyIHtcbiAgLyogQGludGVybmFsICovXG4gIHByaXZhdGUgaWRQcmVmaXg6IHN0cmluZyA9IGBORzJfVVBHUkFERV8ke3VwZ3JhZGVDb3VudCsrfV9gO1xuICAvKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSB1cGdyYWRlZENvbXBvbmVudHM6IFR5cGVbXSA9IFtdO1xuICAvKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBkb3duZ3JhZGVkQ29tcG9uZW50czoge1tuYW1lOiBzdHJpbmddOiBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXJ9ID0ge307XG4gIC8qIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIHByb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+ID0gW107XG5cbiAgLyoqXG4gICAqIEFsbG93cyBBbmd1bGFyIHYyIENvbXBvbmVudCB0byBiZSB1c2VkIGZyb20gQW5ndWxhckpTIHYxLlxuICAgKlxuICAgKiBVc2UgYGRvd25ncmFkZU5nMkNvbXBvbmVudGAgdG8gY3JlYXRlIGFuIEFuZ3VsYXJKUyB2MSBEaXJlY3RpdmUgRGVmaW5pdGlvbiBGYWN0b3J5IGZyb21cbiAgICogQW5ndWxhciB2MiBDb21wb25lbnQuIFRoZSBhZGFwdGVyIHdpbGwgYm9vdHN0cmFwIEFuZ3VsYXIgdjIgY29tcG9uZW50IGZyb20gd2l0aGluIHRoZVxuICAgKiBBbmd1bGFySlMgdjEgdGVtcGxhdGUuXG4gICAqXG4gICAqICMjIE1lbnRhbCBNb2RlbFxuICAgKlxuICAgKiAxLiBUaGUgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCBieSBiZWluZyBsaXN0ZWQgaW4gQW5ndWxhckpTIHYxIHRlbXBsYXRlLiBUaGlzIG1lYW5zIHRoYXQgdGhlXG4gICAqICAgIGhvc3QgZWxlbWVudCBpcyBjb250cm9sbGVkIGJ5IEFuZ3VsYXJKUyB2MSwgYnV0IHRoZSBjb21wb25lbnQncyB2aWV3IHdpbGwgYmUgY29udHJvbGxlZCBieVxuICAgKiAgICBBbmd1bGFyIHYyLlxuICAgKiAyLiBFdmVuIHRob3VnaHQgdGhlIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQgaW4gQW5ndWxhckpTIHYxLCBpdCB3aWxsIGJlIHVzaW5nIEFuZ3VsYXIgdjJcbiAgICogICAgc3ludGF4LiBUaGlzIGhhcyB0byBiZSBkb25lLCB0aGlzIHdheSBiZWNhdXNlIHdlIG11c3QgZm9sbG93IEFuZ3VsYXIgdjIgY29tcG9uZW50cyBkbyBub3RcbiAgICogICAgZGVjbGFyZSBob3cgdGhlIGF0dHJpYnV0ZXMgc2hvdWxkIGJlIGludGVycHJldGVkLlxuICAgKlxuICAgKiAjIyBTdXBwb3J0ZWQgRmVhdHVyZXNcbiAgICpcbiAgICogLSBCaW5kaW5nczpcbiAgICogICAtIEF0dHJpYnV0ZTogYDxjb21wIG5hbWU9XCJXb3JsZFwiPmBcbiAgICogICAtIEludGVycG9sYXRpb246ICBgPGNvbXAgZ3JlZXRpbmc9XCJIZWxsbyB7e25hbWV9fSFcIj5gXG4gICAqICAgLSBFeHByZXNzaW9uOiAgYDxjb21wIFtuYW1lXT1cInVzZXJuYW1lXCI+YFxuICAgKiAgIC0gRXZlbnQ6ICBgPGNvbXAgKGNsb3NlKT1cImRvU29tZXRoaW5nKClcIj5gXG4gICAqIC0gQ29udGVudCBwcm9qZWN0aW9uOiB5ZXNcbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIHZhciBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKCk7XG4gICAqIHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKiBtb2R1bGUuZGlyZWN0aXZlKCdncmVldCcsIGFkYXB0ZXIuZG93bmdyYWRlTmcyQ29tcG9uZW50KEdyZWV0ZXIpKTtcbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdncmVldCcsXG4gICAqICAgdGVtcGxhdGU6ICd7e3NhbHV0YXRpb259fSB7e25hbWV9fSEgLSA8bmctY29udGVudD48L25nLWNvbnRlbnQ+J1xuICAgKiB9KVxuICAgKiBjbGFzcyBHcmVldGVyIHtcbiAgICogICBASW5wdXQoKSBzYWx1dGF0aW9uOiBzdHJpbmc7XG4gICAqICAgQElucHV0KCkgbmFtZTogc3RyaW5nO1xuICAgKiB9XG4gICAqXG4gICAqIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID1cbiAgICogICAnbmcxIHRlbXBsYXRlOiA8Z3JlZXQgc2FsdXRhdGlvbj1cIkhlbGxvXCIgW25hbWVdPVwid29ybGRcIj50ZXh0PC9ncmVldD4nO1xuICAgKlxuICAgKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICogICBleHBlY3QoZG9jdW1lbnQuYm9keS50ZXh0Q29udGVudCkudG9FcXVhbChcIm5nMSB0ZW1wbGF0ZTogSGVsbG8gd29ybGQhIC0gdGV4dFwiKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgZG93bmdyYWRlTmcyQ29tcG9uZW50KHR5cGU6IFR5cGUpOiBGdW5jdGlvbiB7XG4gICAgdGhpcy51cGdyYWRlZENvbXBvbmVudHMucHVzaCh0eXBlKTtcbiAgICB2YXIgaW5mbzogQ29tcG9uZW50SW5mbyA9IGdldENvbXBvbmVudEluZm8odHlwZSk7XG4gICAgcmV0dXJuIG5nMUNvbXBvbmVudERpcmVjdGl2ZShpbmZvLCBgJHt0aGlzLmlkUHJlZml4fSR7aW5mby5zZWxlY3Rvcn1fY2ApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93cyBBbmd1bGFySlMgdjEgQ29tcG9uZW50IHRvIGJlIHVzZWQgZnJvbSBBbmd1bGFyIHYyLlxuICAgKlxuICAgKiBVc2UgYHVwZ3JhZGVOZzFDb21wb25lbnRgIHRvIGNyZWF0ZSBhbiBBbmd1bGFyIHYyIGNvbXBvbmVudCBmcm9tIEFuZ3VsYXJKUyB2MSBDb21wb25lbnRcbiAgICogZGlyZWN0aXZlLiBUaGUgYWRhcHRlciB3aWxsIGJvb3RzdHJhcCBBbmd1bGFySlMgdjEgY29tcG9uZW50IGZyb20gd2l0aGluIHRoZSBBbmd1bGFyIHYyXG4gICAqIHRlbXBsYXRlLlxuICAgKlxuICAgKiAjIyBNZW50YWwgTW9kZWxcbiAgICpcbiAgICogMS4gVGhlIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQgYnkgYmVpbmcgbGlzdGVkIGluIEFuZ3VsYXIgdjIgdGVtcGxhdGUuIFRoaXMgbWVhbnMgdGhhdCB0aGVcbiAgICogICAgaG9zdCBlbGVtZW50IGlzIGNvbnRyb2xsZWQgYnkgQW5ndWxhciB2MiwgYnV0IHRoZSBjb21wb25lbnQncyB2aWV3IHdpbGwgYmUgY29udHJvbGxlZCBieVxuICAgKiAgICBBbmd1bGFySlMgdjEuXG4gICAqXG4gICAqICMjIFN1cHBvcnRlZCBGZWF0dXJlc1xuICAgKlxuICAgKiAtIEJpbmRpbmdzOlxuICAgKiAgIC0gQXR0cmlidXRlOiBgPGNvbXAgbmFtZT1cIldvcmxkXCI+YFxuICAgKiAgIC0gSW50ZXJwb2xhdGlvbjogIGA8Y29tcCBncmVldGluZz1cIkhlbGxvIHt7bmFtZX19IVwiPmBcbiAgICogICAtIEV4cHJlc3Npb246ICBgPGNvbXAgW25hbWVdPVwidXNlcm5hbWVcIj5gXG4gICAqICAgLSBFdmVudDogIGA8Y29tcCAoY2xvc2UpPVwiZG9Tb21ldGhpbmcoKVwiPmBcbiAgICogLSBUcmFuc2NsdXNpb246IHllc1xuICAgKiAtIE9ubHkgc29tZSBvZiB0aGUgZmVhdHVyZXMgb2ZcbiAgICogICBbRGlyZWN0aXZlIERlZmluaXRpb24gT2JqZWN0XShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvc2VydmljZS8kY29tcGlsZSkgYXJlXG4gICAqICAgc3VwcG9ydGVkOlxuICAgKiAgIC0gYGNvbXBpbGVgOiBub3Qgc3VwcG9ydGVkIGJlY2F1c2UgdGhlIGhvc3QgZWxlbWVudCBpcyBvd25lZCBieSBBbmd1bGFyIHYyLCB3aGljaCBkb2VzXG4gICAqICAgICBub3QgYWxsb3cgbW9kaWZ5aW5nIERPTSBzdHJ1Y3R1cmUgZHVyaW5nIGNvbXBpbGF0aW9uLlxuICAgKiAgIC0gYGNvbnRyb2xsZXJgOiBzdXBwb3J0ZWQuIChOT1RFOiBpbmplY3Rpb24gb2YgYCRhdHRyc2AgYW5kIGAkdHJhbnNjbHVkZWAgaXMgbm90IHN1cHBvcnRlZC4pXG4gICAqICAgLSBgY29udHJvbGxlckFzJzogc3VwcG9ydGVkLlxuICAgKiAgIC0gYGJpbmRUb0NvbnRyb2xsZXInOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgbGluayc6IHN1cHBvcnRlZC4gKE5PVEU6IG9ubHkgcHJlLWxpbmsgZnVuY3Rpb24gaXMgc3VwcG9ydGVkLilcbiAgICogICAtIGBuYW1lJzogc3VwcG9ydGVkLlxuICAgKiAgIC0gYHByaW9yaXR5JzogaWdub3JlZC5cbiAgICogICAtIGByZXBsYWNlJzogbm90IHN1cHBvcnRlZC5cbiAgICogICAtIGByZXF1aXJlYDogc3VwcG9ydGVkLlxuICAgKiAgIC0gYHJlc3RyaWN0YDogbXVzdCBiZSBzZXQgdG8gJ0UnLlxuICAgKiAgIC0gYHNjb3BlYDogc3VwcG9ydGVkLlxuICAgKiAgIC0gYHRlbXBsYXRlYDogc3VwcG9ydGVkLlxuICAgKiAgIC0gYHRlbXBsYXRlVXJsYDogc3VwcG9ydGVkLlxuICAgKiAgIC0gYHRlcm1pbmFsYDogaWdub3JlZC5cbiAgICogICAtIGB0cmFuc2NsdWRlYDogc3VwcG9ydGVkLlxuICAgKlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogdmFyIGFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoKTtcbiAgICogdmFyIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdteUV4YW1wbGUnLCBbXSk7XG4gICAqXG4gICAqIG1vZHVsZS5kaXJlY3RpdmUoJ2dyZWV0JywgZnVuY3Rpb24oKSB7XG4gICAqICAgcmV0dXJuIHtcbiAgICogICAgIHNjb3BlOiB7c2FsdXRhdGlvbjogJz0nLCBuYW1lOiAnPScgfSxcbiAgICogICAgIHRlbXBsYXRlOiAne3tzYWx1dGF0aW9ufX0ge3tuYW1lfX0hIC0gPHNwYW4gbmctdHJhbnNjbHVkZT48L3NwYW4+J1xuICAgKiAgIH07XG4gICAqIH0pO1xuICAgKlxuICAgKiBtb2R1bGUuZGlyZWN0aXZlKCduZzInLCBhZGFwdGVyLmRvd25ncmFkZU5nMkNvbXBvbmVudChOZzIpKTtcbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICduZzInLFxuICAgKiAgIHRlbXBsYXRlOiAnbmcyIHRlbXBsYXRlOiA8Z3JlZXQgc2FsdXRhdGlvbj1cIkhlbGxvXCIgW25hbWVdPVwid29ybGRcIj50ZXh0PC9ncmVldD4nXG4gICAqICAgZGlyZWN0aXZlczogW2FkYXB0ZXIudXBncmFkZU5nMUNvbXBvbmVudCgnZ3JlZXQnKV1cbiAgICogfSlcbiAgICogY2xhc3MgTmcyIHtcbiAgICogfVxuICAgKlxuICAgKiBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9ICc8bmcyPjwvbmcyPic7XG4gICAqXG4gICAqIGFkYXB0ZXIuYm9vdHN0cmFwKGRvY3VtZW50LmJvZHksIFsnbXlFeGFtcGxlJ10pLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgKiAgIGV4cGVjdChkb2N1bWVudC5ib2R5LnRleHRDb250ZW50KS50b0VxdWFsKFwibmcyIHRlbXBsYXRlOiBIZWxsbyB3b3JsZCEgLSB0ZXh0XCIpO1xuICAgKiB9KTtcbiAgICogYGBgXG4gICAqL1xuICB1cGdyYWRlTmcxQ29tcG9uZW50KG5hbWU6IHN0cmluZyk6IFR5cGUge1xuICAgIGlmICgoPGFueT50aGlzLmRvd25ncmFkZWRDb21wb25lbnRzKS5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZG93bmdyYWRlZENvbXBvbmVudHNbbmFtZV0udHlwZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICh0aGlzLmRvd25ncmFkZWRDb21wb25lbnRzW25hbWVdID0gbmV3IFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcihuYW1lKSkudHlwZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQm9vdHN0cmFwIGEgaHlicmlkIEFuZ3VsYXJKUyB2MSAvIEFuZ3VsYXIgdjIgYXBwbGljYXRpb24uXG4gICAqXG4gICAqIFRoaXMgYGJvb3RzdHJhcGAgbWV0aG9kIGlzIGEgZGlyZWN0IHJlcGxhY2VtZW50ICh0YWtlcyBzYW1lIGFyZ3VtZW50cykgZm9yIEFuZ3VsYXJKUyB2MVxuICAgKiBbYGJvb3RzdHJhcGBdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZy9mdW5jdGlvbi9hbmd1bGFyLmJvb3RzdHJhcCkgbWV0aG9kLiBVbmxpa2VcbiAgICogQW5ndWxhckpTIHYxLCB0aGlzIGJvb3RzdHJhcCBpcyBhc3luY2hyb25vdXMuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiB2YXIgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcigpO1xuICAgKiB2YXIgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnbmcyJywgYWRhcHRlci5kb3duZ3JhZGVOZzJDb21wb25lbnQoTmcyKSk7XG4gICAqXG4gICAqIG1vZHVsZS5kaXJlY3RpdmUoJ25nMScsIGZ1bmN0aW9uKCkge1xuICAgKiAgIHJldHVybiB7XG4gICAqICAgICAgc2NvcGU6IHsgdGl0bGU6ICc9JyB9LFxuICAgKiAgICAgIHRlbXBsYXRlOiAnbmcxW0hlbGxvIHt7dGl0bGV9fSFdKDxzcGFuIG5nLXRyYW5zY2x1ZGU+PC9zcGFuPiknXG4gICAqICAgfTtcbiAgICogfSk7XG4gICAqXG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnbmcyJyxcbiAgICogICBpbnB1dHM6IFsnbmFtZSddLFxuICAgKiAgIHRlbXBsYXRlOiAnbmcyWzxuZzEgW3RpdGxlXT1cIm5hbWVcIj50cmFuc2NsdWRlPC9uZzE+XSg8bmctY29udGVudD48L25nLWNvbnRlbnQ+KScsXG4gICAqICAgZGlyZWN0aXZlczogW2FkYXB0ZXIudXBncmFkZU5nMUNvbXBvbmVudCgnbmcxJyldXG4gICAqIH0pXG4gICAqIGNsYXNzIE5nMiB7XG4gICAqIH1cbiAgICpcbiAgICogZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSAnPG5nMiBuYW1lPVwiV29ybGRcIj5wcm9qZWN0PC9uZzI+JztcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAqICAgZXhwZWN0KGRvY3VtZW50LmJvZHkudGV4dENvbnRlbnQpLnRvRXF1YWwoXG4gICAqICAgICAgIFwibmcyW25nMVtIZWxsbyBXb3JsZCFdKHRyYW5zY2x1ZGUpXShwcm9qZWN0KVwiKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgYm9vdHN0cmFwKGVsZW1lbnQ6IEVsZW1lbnQsIG1vZHVsZXM/OiBhbnlbXSxcbiAgICAgICAgICAgIGNvbmZpZz86IGFuZ3VsYXIuSUFuZ3VsYXJCb290c3RyYXBDb25maWcpOiBVcGdyYWRlQWRhcHRlclJlZiB7XG4gICAgdmFyIHVwZ3JhZGUgPSBuZXcgVXBncmFkZUFkYXB0ZXJSZWYoKTtcbiAgICB2YXIgbmcxSW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSA9IG51bGw7XG4gICAgdmFyIHBsYXRmb3JtUmVmOiBQbGF0Zm9ybVJlZiA9IHBsYXRmb3JtKEJST1dTRVJfUFJPVklERVJTKTtcbiAgICB2YXIgYXBwbGljYXRpb25SZWY6IEFwcGxpY2F0aW9uUmVmID0gcGxhdGZvcm1SZWYuYXBwbGljYXRpb24oW1xuICAgICAgQlJPV1NFUl9BUFBfUFJPVklERVJTLFxuICAgICAgcHJvdmlkZShORzFfSU5KRUNUT1IsIHt1c2VGYWN0b3J5OiAoKSA9PiBuZzFJbmplY3Rvcn0pLFxuICAgICAgcHJvdmlkZShORzFfQ09NUElMRSwge3VzZUZhY3Rvcnk6ICgpID0+IG5nMUluamVjdG9yLmdldChORzFfQ09NUElMRSl9KSxcbiAgICAgIHRoaXMucHJvdmlkZXJzXG4gICAgXSk7XG4gICAgdmFyIGluamVjdG9yOiBJbmplY3RvciA9IGFwcGxpY2F0aW9uUmVmLmluamVjdG9yO1xuICAgIHZhciBuZ1pvbmU6IE5nWm9uZSA9IGluamVjdG9yLmdldChOZ1pvbmUpO1xuICAgIHZhciBjb21waWxlcjogQ29tcG9uZW50UmVzb2x2ZXIgPSBpbmplY3Rvci5nZXQoQ29tcG9uZW50UmVzb2x2ZXIpO1xuICAgIHZhciBkZWxheUFwcGx5RXhwczogRnVuY3Rpb25bXSA9IFtdO1xuICAgIHZhciBvcmlnaW5hbCRhcHBseUZuOiBGdW5jdGlvbjtcbiAgICB2YXIgcm9vdFNjb3BlUHJvdG90eXBlOiBhbnk7XG4gICAgdmFyIHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZTtcbiAgICB2YXIgY29tcG9uZW50RmFjdG9yeVJlZk1hcDogQ29tcG9uZW50RmFjdG9yeVJlZk1hcCA9IHt9O1xuICAgIHZhciBuZzFNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSh0aGlzLmlkUHJlZml4LCBtb2R1bGVzKTtcbiAgICB2YXIgbmcxQm9vdHN0cmFwUHJvbWlzZTogUHJvbWlzZTxhbnk+ID0gbnVsbDtcbiAgICB2YXIgbmcxY29tcGlsZVByb21pc2U6IFByb21pc2U8YW55PiA9IG51bGw7XG4gICAgbmcxTW9kdWxlLnZhbHVlKE5HMl9JTkpFQ1RPUiwgaW5qZWN0b3IpXG4gICAgICAgIC52YWx1ZShORzJfWk9ORSwgbmdab25lKVxuICAgICAgICAudmFsdWUoTkcyX0NPTVBJTEVSLCBjb21waWxlcilcbiAgICAgICAgLnZhbHVlKE5HMl9DT01QT05FTlRfRkFDVE9SWV9SRUZfTUFQLCBjb21wb25lbnRGYWN0b3J5UmVmTWFwKVxuICAgICAgICAuY29uZmlnKFtcbiAgICAgICAgICAnJHByb3ZpZGUnLFxuICAgICAgICAgIChwcm92aWRlKSA9PiB7XG4gICAgICAgICAgICBwcm92aWRlLmRlY29yYXRvcihORzFfUk9PVF9TQ09QRSwgW1xuICAgICAgICAgICAgICAnJGRlbGVnYXRlJyxcbiAgICAgICAgICAgICAgZnVuY3Rpb24ocm9vdFNjb3BlRGVsZWdhdGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UpIHtcbiAgICAgICAgICAgICAgICByb290U2NvcGVQcm90b3R5cGUgPSByb290U2NvcGVEZWxlZ2F0ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGU7XG4gICAgICAgICAgICAgICAgaWYgKHJvb3RTY29wZVByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSgnJGFwcGx5JykpIHtcbiAgICAgICAgICAgICAgICAgIG9yaWdpbmFsJGFwcGx5Rm4gPSByb290U2NvcGVQcm90b3R5cGUuJGFwcGx5O1xuICAgICAgICAgICAgICAgICAgcm9vdFNjb3BlUHJvdG90eXBlLiRhcHBseSA9IChleHApID0+IGRlbGF5QXBwbHlFeHBzLnB1c2goZXhwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGZpbmQgJyRhcHBseScgb24gJyRyb290U2NvcGUnIVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvb3RTY29wZSA9IHJvb3RTY29wZURlbGVnYXRlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIHByb3ZpZGUuZGVjb3JhdG9yKE5HMV9URVNUQUJJTElUWSwgW1xuICAgICAgICAgICAgICAnJGRlbGVnYXRlJyxcbiAgICAgICAgICAgICAgZnVuY3Rpb24odGVzdGFiaWxpdHlEZWxlZ2F0ZTogYW5ndWxhci5JVGVzdGFiaWxpdHlTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5nMlRlc3RhYmlsaXR5OiBUZXN0YWJpbGl0eSA9IGluamVjdG9yLmdldChUZXN0YWJpbGl0eSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgb3JpZ29uYWxXaGVuU3RhYmxlOiBGdW5jdGlvbiA9IHRlc3RhYmlsaXR5RGVsZWdhdGUud2hlblN0YWJsZTtcbiAgICAgICAgICAgICAgICB2YXIgbmV3V2hlblN0YWJsZSA9IChjYWxsYmFjazogRnVuY3Rpb24pOiB2b2lkID0+IHtcbiAgICAgICAgICAgICAgICAgIHZhciB3aGVuU3RhYmxlQ29udGV4dDogYW55ID0gdGhpcztcbiAgICAgICAgICAgICAgICAgIG9yaWdvbmFsV2hlblN0YWJsZS5jYWxsKHRoaXMsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobmcyVGVzdGFiaWxpdHkuaXNTdGFibGUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgbmcyVGVzdGFiaWxpdHkud2hlblN0YWJsZShuZXdXaGVuU3RhYmxlLmJpbmQod2hlblN0YWJsZUNvbnRleHQsIGNhbGxiYWNrKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB0ZXN0YWJpbGl0eURlbGVnYXRlLndoZW5TdGFibGUgPSBuZXdXaGVuU3RhYmxlO1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZXN0YWJpbGl0eURlbGVnYXRlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICB9XG4gICAgICAgIF0pO1xuXG4gICAgbmcxY29tcGlsZVByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBuZzFNb2R1bGUucnVuKFtcbiAgICAgICAgJyRpbmplY3RvcicsXG4gICAgICAgICckcm9vdFNjb3BlJyxcbiAgICAgICAgKGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UsIHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZSkgPT4ge1xuICAgICAgICAgIG5nMUluamVjdG9yID0gaW5qZWN0b3I7XG4gICAgICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKG5nWm9uZS5vbk1pY3JvdGFza0VtcHR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoXykgPT4gbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHJvb3RTY29wZS4kYXBwbHkoKSkpO1xuICAgICAgICAgIFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlci5yZXNvbHZlKHRoaXMuZG93bmdyYWRlZENvbXBvbmVudHMsIGluamVjdG9yKVxuICAgICAgICAgICAgICAudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9XG4gICAgICBdKTtcbiAgICB9KTtcblxuICAgIC8vIE1ha2Ugc3VyZSByZXN1bWVCb290c3RyYXAoKSBvbmx5IGV4aXN0cyBpZiB0aGUgY3VycmVudCBib290c3RyYXAgaXMgZGVmZXJyZWRcbiAgICB2YXIgd2luZG93QW5ndWxhciA9ICg8YW55Pmdsb2JhbCkuYW5ndWxhcjtcbiAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IHVuZGVmaW5lZDtcblxuICAgIGFuZ3VsYXIuZWxlbWVudChlbGVtZW50KS5kYXRhKGNvbnRyb2xsZXJLZXkoTkcyX0lOSkVDVE9SKSwgaW5qZWN0b3IpO1xuICAgIG5nWm9uZS5ydW4oKCkgPT4geyBhbmd1bGFyLmJvb3RzdHJhcChlbGVtZW50LCBbdGhpcy5pZFByZWZpeF0sIGNvbmZpZyk7IH0pO1xuICAgIG5nMUJvb3RzdHJhcFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBpZiAod2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXApIHtcbiAgICAgICAgdmFyIG9yaWdpbmFsUmVzdW1lQm9vdHN0cmFwOiAoKSA9PiB2b2lkID0gd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXA7XG4gICAgICAgIHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAgPSBvcmlnaW5hbFJlc3VtZUJvb3RzdHJhcDtcbiAgICAgICAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgICB0aGlzLmNvbXBpbGVOZzJDb21wb25lbnRzKGNvbXBpbGVyLCBjb21wb25lbnRGYWN0b3J5UmVmTWFwKSxcbiAgICAgICAgICAgICBuZzFCb290c3RyYXBQcm9taXNlLFxuICAgICAgICAgICAgIG5nMWNvbXBpbGVQcm9taXNlXG4gICAgICAgICAgIF0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICBuZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgIGlmIChyb290U2NvcGVQcm90b3R5cGUpIHtcbiAgICAgICAgICAgICAgcm9vdFNjb3BlUHJvdG90eXBlLiRhcHBseSA9IG9yaWdpbmFsJGFwcGx5Rm47ICAvLyByZXN0b3JlIG9yaWdpbmFsICRhcHBseVxuICAgICAgICAgICAgICB3aGlsZSAoZGVsYXlBcHBseUV4cHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcm9vdFNjb3BlLiRhcHBseShkZWxheUFwcGx5RXhwcy5zaGlmdCgpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAoPGFueT51cGdyYWRlKS5fYm9vdHN0cmFwRG9uZShhcHBsaWNhdGlvblJlZiwgbmcxSW5qZWN0b3IpO1xuICAgICAgICAgICAgICByb290U2NvcGVQcm90b3R5cGUgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBvbkVycm9yKTtcbiAgICByZXR1cm4gdXBncmFkZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgcHJvdmlkZXIgdG8gdGhlIHRvcCBsZXZlbCBlbnZpcm9ubWVudCBvZiBhIGh5YnJpZCBBbmd1bGFySlMgdjEgLyBBbmd1bGFyIHYyIGFwcGxpY2F0aW9uLlxuICAgKlxuICAgKiBJbiBoeWJyaWQgQW5ndWxhckpTIHYxIC8gQW5ndWxhciB2MiBhcHBsaWNhdGlvbiwgdGhlcmUgaXMgbm8gb25lIHJvb3QgQW5ndWxhciB2MiBjb21wb25lbnQsXG4gICAqIGZvciB0aGlzIHJlYXNvbiB3ZSBwcm92aWRlIGFuIGFwcGxpY2F0aW9uIGdsb2JhbCB3YXkgb2YgcmVnaXN0ZXJpbmcgcHJvdmlkZXJzIHdoaWNoIGlzXG4gICAqIGNvbnNpc3RlbnQgd2l0aCBzaW5nbGUgZ2xvYmFsIGluamVjdGlvbiBpbiBBbmd1bGFySlMgdjEuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjbGFzcyBHcmVldGVyIHtcbiAgICogICBncmVldChuYW1lKSB7XG4gICAqICAgICBhbGVydCgnSGVsbG8gJyArIG5hbWUgKyAnIScpO1xuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ2FwcCcsXG4gICAqICAgdGVtcGxhdGU6ICcnXG4gICAqIH0pXG4gICAqIGNsYXNzIEFwcCB7XG4gICAqICAgY29uc3RydWN0b3IoZ3JlZXRlcjogR3JlZXRlcikge1xuICAgKiAgICAgdGhpcy5ncmVldGVyKCdXb3JsZCcpO1xuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiB2YXIgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcigpO1xuICAgKiBhZGFwdGVyLmFkZFByb3ZpZGVyKEdyZWV0ZXIpO1xuICAgKlxuICAgKiB2YXIgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnYXBwJywgYWRhcHRlci5kb3duZ3JhZGVOZzJDb21wb25lbnQoQXBwKSk7XG4gICAqXG4gICAqIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gJzxhcHA+PC9hcHA+J1xuICAgKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKTtcbiAgICpgYGBcbiAgICovXG4gIHB1YmxpYyBhZGRQcm92aWRlcihwcm92aWRlcjogVHlwZSB8IFByb3ZpZGVyIHwgYW55W10pOiB2b2lkIHsgdGhpcy5wcm92aWRlcnMucHVzaChwcm92aWRlcik7IH1cblxuICAvKipcbiAgICogQWxsb3dzIEFuZ3VsYXJKUyB2MSBzZXJ2aWNlIHRvIGJlIGFjY2Vzc2libGUgZnJvbSBBbmd1bGFyIHYyLlxuICAgKlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogY2xhc3MgTG9naW4geyAuLi4gfVxuICAgKiBjbGFzcyBTZXJ2ZXIgeyAuLi4gfVxuICAgKlxuICAgKiBASW5qZWN0YWJsZSgpXG4gICAqIGNsYXNzIEV4YW1wbGUge1xuICAgKiAgIGNvbnN0cnVjdG9yKEBJbmplY3QoJ3NlcnZlcicpIHNlcnZlciwgbG9naW46IExvZ2luKSB7XG4gICAqICAgICAuLi5cbiAgICogICB9XG4gICAqIH1cbiAgICpcbiAgICogdmFyIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdteUV4YW1wbGUnLCBbXSk7XG4gICAqIG1vZHVsZS5zZXJ2aWNlKCdzZXJ2ZXInLCBTZXJ2ZXIpO1xuICAgKiBtb2R1bGUuc2VydmljZSgnbG9naW4nLCBMb2dpbik7XG4gICAqXG4gICAqIHZhciBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKCk7XG4gICAqIGFkYXB0ZXIudXBncmFkZU5nMVByb3ZpZGVyKCdzZXJ2ZXInKTtcbiAgICogYWRhcHRlci51cGdyYWRlTmcxUHJvdmlkZXIoJ2xvZ2luJywge2FzVG9rZW46IExvZ2lufSk7XG4gICAqIGFkYXB0ZXIuYWRkUHJvdmlkZXIoRXhhbXBsZSk7XG4gICAqXG4gICAqIGFkYXB0ZXIuYm9vdHN0cmFwKGRvY3VtZW50LmJvZHksIFsnbXlFeGFtcGxlJ10pLnJlYWR5KChyZWYpID0+IHtcbiAgICogICB2YXIgZXhhbXBsZTogRXhhbXBsZSA9IHJlZi5uZzJJbmplY3Rvci5nZXQoRXhhbXBsZSk7XG4gICAqIH0pO1xuICAgKlxuICAgKiBgYGBcbiAgICovXG4gIHB1YmxpYyB1cGdyYWRlTmcxUHJvdmlkZXIobmFtZTogc3RyaW5nLCBvcHRpb25zPzoge2FzVG9rZW46IGFueX0pIHtcbiAgICB2YXIgdG9rZW4gPSBvcHRpb25zICYmIG9wdGlvbnMuYXNUb2tlbiB8fCBuYW1lO1xuICAgIHRoaXMucHJvdmlkZXJzLnB1c2gocHJvdmlkZSh0b2tlbiwge1xuICAgICAgdXNlRmFjdG9yeTogKG5nMUluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpID0+IG5nMUluamVjdG9yLmdldChuYW1lKSxcbiAgICAgIGRlcHM6IFtORzFfSU5KRUNUT1JdXG4gICAgfSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93cyBBbmd1bGFyIHYyIHNlcnZpY2UgdG8gYmUgYWNjZXNzaWJsZSBmcm9tIEFuZ3VsYXJKUyB2MS5cbiAgICpcbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNsYXNzIEV4YW1wbGUge1xuICAgKiB9XG4gICAqXG4gICAqIHZhciBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKCk7XG4gICAqIGFkYXB0ZXIuYWRkUHJvdmlkZXIoRXhhbXBsZSk7XG4gICAqXG4gICAqIHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKiBtb2R1bGUuZmFjdG9yeSgnZXhhbXBsZScsIGFkYXB0ZXIuZG93bmdyYWRlTmcyUHJvdmlkZXIoRXhhbXBsZSkpO1xuICAgKlxuICAgKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeSgocmVmKSA9PiB7XG4gICAqICAgdmFyIGV4YW1wbGU6IEV4YW1wbGUgPSByZWYubmcxSW5qZWN0b3IuZ2V0KCdleGFtcGxlJyk7XG4gICAqIH0pO1xuICAgKlxuICAgKiBgYGBcbiAgICovXG4gIHB1YmxpYyBkb3duZ3JhZGVOZzJQcm92aWRlcih0b2tlbjogYW55KTogRnVuY3Rpb24ge1xuICAgIHZhciBmYWN0b3J5ID0gZnVuY3Rpb24oaW5qZWN0b3I6IEluamVjdG9yKSB7IHJldHVybiBpbmplY3Rvci5nZXQodG9rZW4pOyB9O1xuICAgICg8YW55PmZhY3RvcnkpLiRpbmplY3QgPSBbTkcyX0lOSkVDVE9SXTtcbiAgICByZXR1cm4gZmFjdG9yeTtcbiAgfVxuXG4gIC8qIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIGNvbXBpbGVOZzJDb21wb25lbnRzKGNvbXBpbGVyOiBDb21wb25lbnRSZXNvbHZlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5UmVmTWFwOiBDb21wb25lbnRGYWN0b3J5UmVmTWFwKTpcbiAgICAgIFByb21pc2U8Q29tcG9uZW50RmFjdG9yeVJlZk1hcD4ge1xuICAgIHZhciBwcm9taXNlczogQXJyYXk8UHJvbWlzZTxDb21wb25lbnRGYWN0b3J5Pj4gPSBbXTtcbiAgICB2YXIgdHlwZXMgPSB0aGlzLnVwZ3JhZGVkQ29tcG9uZW50cztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHR5cGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBwcm9taXNlcy5wdXNoKGNvbXBpbGVyLnJlc29sdmVDb21wb25lbnQodHlwZXNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKChjb21wb25lbnRGYWN0b3JpZXM6IEFycmF5PENvbXBvbmVudEZhY3Rvcnk+KSA9PiB7XG4gICAgICB2YXIgdHlwZXMgPSB0aGlzLnVwZ3JhZGVkQ29tcG9uZW50cztcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29tcG9uZW50RmFjdG9yaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbXBvbmVudEZhY3RvcnlSZWZNYXBbZ2V0Q29tcG9uZW50SW5mbyh0eXBlc1tpXSkuc2VsZWN0b3JdID0gY29tcG9uZW50RmFjdG9yaWVzW2ldO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbXBvbmVudEZhY3RvcnlSZWZNYXA7XG4gICAgfSwgb25FcnJvcik7XG4gIH1cbn1cblxuaW50ZXJmYWNlIENvbXBvbmVudEZhY3RvcnlSZWZNYXAge1xuICBbc2VsZWN0b3I6IHN0cmluZ106IENvbXBvbmVudEZhY3Rvcnk7XG59XG5cbmZ1bmN0aW9uIG5nMUNvbXBvbmVudERpcmVjdGl2ZShpbmZvOiBDb21wb25lbnRJbmZvLCBpZFByZWZpeDogc3RyaW5nKTogRnVuY3Rpb24ge1xuICAoPGFueT5kaXJlY3RpdmVGYWN0b3J5KS4kaW5qZWN0ID0gW05HMl9DT01QT05FTlRfRkFDVE9SWV9SRUZfTUFQLCBORzFfUEFSU0VdO1xuICBmdW5jdGlvbiBkaXJlY3RpdmVGYWN0b3J5KGNvbXBvbmVudEZhY3RvcnlSZWZNYXA6IENvbXBvbmVudEZhY3RvcnlSZWZNYXAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2U6IGFuZ3VsYXIuSVBhcnNlU2VydmljZSk6IGFuZ3VsYXIuSURpcmVjdGl2ZSB7XG4gICAgdmFyIGNvbXBvbmVudEZhY3Rvcnk6IENvbXBvbmVudEZhY3RvcnkgPSBjb21wb25lbnRGYWN0b3J5UmVmTWFwW2luZm8uc2VsZWN0b3JdO1xuICAgIGlmICghY29tcG9uZW50RmFjdG9yeSkgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RpbmcgQ29tcG9uZW50RmFjdG9yeSBmb3I6ICcgKyBpbmZvLnNlbGVjdG9yKTtcbiAgICB2YXIgaWRDb3VudCA9IDA7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICByZXF1aXJlOiBSRVFVSVJFX0lOSkVDVE9SLFxuICAgICAgbGluazoge1xuICAgICAgICBwb3N0OiAoc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLFxuICAgICAgICAgICAgICAgcGFyZW50SW5qZWN0b3I6IGFueSwgdHJhbnNjbHVkZTogYW5ndWxhci5JVHJhbnNjbHVkZUZ1bmN0aW9uKTogdm9pZCA9PiB7XG4gICAgICAgICAgdmFyIGRvbUVsZW1lbnQgPSA8YW55PmVsZW1lbnRbMF07XG4gICAgICAgICAgdmFyIGZhY2FkZSA9XG4gICAgICAgICAgICAgIG5ldyBEb3duZ3JhZGVOZzJDb21wb25lbnRBZGFwdGVyKGlkUHJlZml4ICsgKGlkQ291bnQrKyksIGluZm8sIGVsZW1lbnQsIGF0dHJzLCBzY29wZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEluamVjdG9yPnBhcmVudEluamVjdG9yLCBwYXJzZSwgY29tcG9uZW50RmFjdG9yeSk7XG4gICAgICAgICAgZmFjYWRlLnNldHVwSW5wdXRzKCk7XG4gICAgICAgICAgZmFjYWRlLmJvb3RzdHJhcE5nMigpO1xuICAgICAgICAgIGZhY2FkZS5wcm9qZWN0Q29udGVudCgpO1xuICAgICAgICAgIGZhY2FkZS5zZXR1cE91dHB1dHMoKTtcbiAgICAgICAgICBmYWNhZGUucmVnaXN0ZXJDbGVhbnVwKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHJldHVybiBkaXJlY3RpdmVGYWN0b3J5O1xufVxuXG4vKipcbiAqIFVzZSBgVWdyYWRlQWRhcHRlclJlZmAgdG8gY29udHJvbCBhIGh5YnJpZCBBbmd1bGFySlMgdjEgLyBBbmd1bGFyIHYyIGFwcGxpY2F0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgVXBncmFkZUFkYXB0ZXJSZWYge1xuICAvKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfcmVhZHlGbjogKHVwZ3JhZGVBZGFwdGVyUmVmPzogVXBncmFkZUFkYXB0ZXJSZWYpID0+IHZvaWQgPSBudWxsO1xuXG4gIHB1YmxpYyBuZzFSb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UgPSBudWxsO1xuICBwdWJsaWMgbmcxSW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSA9IG51bGw7XG4gIHB1YmxpYyBuZzJBcHBsaWNhdGlvblJlZjogQXBwbGljYXRpb25SZWYgPSBudWxsO1xuICBwdWJsaWMgbmcySW5qZWN0b3I6IEluamVjdG9yID0gbnVsbDtcblxuICAvKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfYm9vdHN0cmFwRG9uZShhcHBsaWNhdGlvblJlZjogQXBwbGljYXRpb25SZWYsIG5nMUluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpIHtcbiAgICB0aGlzLm5nMkFwcGxpY2F0aW9uUmVmID0gYXBwbGljYXRpb25SZWY7XG4gICAgdGhpcy5uZzJJbmplY3RvciA9IGFwcGxpY2F0aW9uUmVmLmluamVjdG9yO1xuICAgIHRoaXMubmcxSW5qZWN0b3IgPSBuZzFJbmplY3RvcjtcbiAgICB0aGlzLm5nMVJvb3RTY29wZSA9IG5nMUluamVjdG9yLmdldChORzFfUk9PVF9TQ09QRSk7XG4gICAgdGhpcy5fcmVhZHlGbiAmJiB0aGlzLl9yZWFkeUZuKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgY2FsbGJhY2sgZnVuY3Rpb24gd2hpY2ggaXMgbm90aWZpZWQgdXBvbiBzdWNjZXNzZnVsIGh5YnJpZCBBbmd1bGFySlMgdjEgLyBBbmd1bGFyIHYyXG4gICAqIGFwcGxpY2F0aW9uIGhhcyBiZWVuIGJvb3RzdHJhcHBlZC5cbiAgICpcbiAgICogVGhlIGByZWFkeWAgY2FsbGJhY2sgZnVuY3Rpb24gaXMgaW52b2tlZCBpbnNpZGUgdGhlIEFuZ3VsYXIgdjIgem9uZSwgdGhlcmVmb3JlIGl0IGRvZXMgbm90XG4gICAqIHJlcXVpcmUgYSBjYWxsIHRvIGAkYXBwbHkoKWAuXG4gICAqL1xuICBwdWJsaWMgcmVhZHkoZm46ICh1cGdyYWRlQWRhcHRlclJlZj86IFVwZ3JhZGVBZGFwdGVyUmVmKSA9PiB2b2lkKSB7IHRoaXMuX3JlYWR5Rm4gPSBmbjsgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlIG9mIHJ1bm5pbmcgaHlicmlkIEFuZ3VsYXJKUyB2MSAvIEFuZ3VsYXIgdjIgYXBwbGljYXRpb24uXG4gICAqL1xuICBwdWJsaWMgZGlzcG9zZSgpIHtcbiAgICB0aGlzLm5nMUluamVjdG9yLmdldChORzFfUk9PVF9TQ09QRSkuJGRlc3Ryb3koKTtcbiAgICB0aGlzLm5nMkFwcGxpY2F0aW9uUmVmLmRpc3Bvc2UoKTtcbiAgfVxufVxuIl19