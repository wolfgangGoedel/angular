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
import { PromiseWrapper, EventEmitter, ObservableWrapper } from 'angular2/src/facade/async';
import { Map, StringMapWrapper } from 'angular2/src/facade/collection';
import { isBlank, isPresent, Type } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { Location } from 'angular2/platform/common';
import { Inject, Injectable } from 'angular2/core';
import { RouteRegistry, ROUTER_PRIMARY_COMPONENT } from './route_registry';
import { getCanActivateHook } from './lifecycle/route_lifecycle_reflector';
let _resolveToTrue = PromiseWrapper.resolve(true);
let _resolveToFalse = PromiseWrapper.resolve(false);
/**
 * The `Router` is responsible for mapping URLs to components.
 *
 * You can see the state of the router by inspecting the read-only field `router.navigating`.
 * This may be useful for showing a spinner, for instance.
 *
 * ## Concepts
 *
 * Routers and component instances have a 1:1 correspondence.
 *
 * The router holds reference to a number of {@link RouterOutlet}.
 * An outlet is a placeholder that the router dynamically fills in depending on the current URL.
 *
 * When the router navigates from a URL, it must first recognize it and serialize it into an
 * `Instruction`.
 * The router uses the `RouteRegistry` to get an `Instruction`.
 */
export let Router = class Router {
    constructor(registry, parent, hostComponent, root) {
        this.registry = registry;
        this.parent = parent;
        this.hostComponent = hostComponent;
        this.root = root;
        this.navigating = false;
        /**
         * The current `Instruction` for the router
         */
        this.currentInstruction = null;
        this._currentNavigation = _resolveToTrue;
        this._outlet = null;
        this._auxRouters = new Map();
        this._subject = new EventEmitter();
    }
    /**
     * Constructs a child router. You probably don't need to use this unless you're writing a reusable
     * component.
     */
    childRouter(hostComponent) {
        return this._childRouter = new ChildRouter(this, hostComponent);
    }
    /**
     * Constructs a child router. You probably don't need to use this unless you're writing a reusable
     * component.
     */
    auxRouter(hostComponent) { return new ChildRouter(this, hostComponent); }
    /**
     * Register an outlet to be notified of primary route changes.
     *
     * You probably don't need to use this unless you're writing a reusable component.
     */
    registerPrimaryOutlet(outlet) {
        if (isPresent(outlet.name)) {
            throw new BaseException(`registerPrimaryOutlet expects to be called with an unnamed outlet.`);
        }
        if (isPresent(this._outlet)) {
            throw new BaseException(`Primary outlet is already registered.`);
        }
        this._outlet = outlet;
        if (isPresent(this.currentInstruction)) {
            return this.commit(this.currentInstruction, false);
        }
        return _resolveToTrue;
    }
    /**
     * Unregister an outlet (because it was destroyed, etc).
     *
     * You probably don't need to use this unless you're writing a custom outlet implementation.
     */
    unregisterPrimaryOutlet(outlet) {
        if (isPresent(outlet.name)) {
            throw new BaseException(`registerPrimaryOutlet expects to be called with an unnamed outlet.`);
        }
        this._outlet = null;
    }
    /**
     * Register an outlet to notified of auxiliary route changes.
     *
     * You probably don't need to use this unless you're writing a reusable component.
     */
    registerAuxOutlet(outlet) {
        var outletName = outlet.name;
        if (isBlank(outletName)) {
            throw new BaseException(`registerAuxOutlet expects to be called with an outlet with a name.`);
        }
        var router = this.auxRouter(this.hostComponent);
        this._auxRouters.set(outletName, router);
        router._outlet = outlet;
        var auxInstruction;
        if (isPresent(this.currentInstruction) &&
            isPresent(auxInstruction = this.currentInstruction.auxInstruction[outletName])) {
            return router.commit(auxInstruction);
        }
        return _resolveToTrue;
    }
    /**
     * Given an instruction, returns `true` if the instruction is currently active,
     * otherwise `false`.
     */
    isRouteActive(instruction) {
        var router = this;
        if (isBlank(this.currentInstruction)) {
            return false;
        }
        // `instruction` corresponds to the root router
        while (isPresent(router.parent) && isPresent(instruction.child)) {
            router = router.parent;
            instruction = instruction.child;
        }
        if (isBlank(instruction.component) || isBlank(this.currentInstruction.component) ||
            this.currentInstruction.component.routeName != instruction.component.routeName) {
            return false;
        }
        let paramEquals = true;
        if (isPresent(this.currentInstruction.component.params)) {
            StringMapWrapper.forEach(instruction.component.params, (value, key) => {
                if (this.currentInstruction.component.params[key] !== value) {
                    paramEquals = false;
                }
            });
        }
        return paramEquals;
    }
    /**
     * Dynamically update the routing configuration and trigger a navigation.
     *
     * ### Usage
     *
     * ```
     * router.config([
     *   { 'path': '/', 'component': IndexComp },
     *   { 'path': '/user/:id', 'component': UserComp },
     * ]);
     * ```
     */
    config(definitions) {
        definitions.forEach((routeDefinition) => { this.registry.config(this.hostComponent, routeDefinition); });
        return this.renavigate();
    }
    /**
     * Navigate based on the provided Route Link DSL. It's preferred to navigate with this method
     * over `navigateByUrl`.
     *
     * ### Usage
     *
     * This method takes an array representing the Route Link DSL:
     * ```
     * ['./MyCmp', {param: 3}]
     * ```
     * See the {@link RouterLink} directive for more.
     */
    navigate(linkParams) {
        var instruction = this.generate(linkParams);
        return this.navigateByInstruction(instruction, false);
    }
    /**
     * Navigate to a URL. Returns a promise that resolves when navigation is complete.
     * It's preferred to navigate with `navigate` instead of this method, since URLs are more brittle.
     *
     * If the given URL begins with a `/`, router will navigate absolutely.
     * If the given URL does not begin with `/`, the router will navigate relative to this component.
     */
    navigateByUrl(url, _skipLocationChange = false) {
        return this._currentNavigation = this._currentNavigation.then((_) => {
            this.lastNavigationAttempt = url;
            this._startNavigating();
            return this._afterPromiseFinishNavigating(this.recognize(url).then((instruction) => {
                if (isBlank(instruction)) {
                    return false;
                }
                return this._navigate(instruction, _skipLocationChange);
            }));
        });
    }
    /**
     * Navigate via the provided instruction. Returns a promise that resolves when navigation is
     * complete.
     */
    navigateByInstruction(instruction, _skipLocationChange = false) {
        if (isBlank(instruction)) {
            return _resolveToFalse;
        }
        return this._currentNavigation = this._currentNavigation.then((_) => {
            this._startNavigating();
            return this._afterPromiseFinishNavigating(this._navigate(instruction, _skipLocationChange));
        });
    }
    /** @internal */
    _settleInstruction(instruction) {
        return instruction.resolveComponent().then((_) => {
            var unsettledInstructions = [];
            if (isPresent(instruction.component)) {
                instruction.component.reuse = false;
            }
            if (isPresent(instruction.child)) {
                unsettledInstructions.push(this._settleInstruction(instruction.child));
            }
            StringMapWrapper.forEach(instruction.auxInstruction, (instruction, _) => {
                unsettledInstructions.push(this._settleInstruction(instruction));
            });
            return PromiseWrapper.all(unsettledInstructions);
        });
    }
    /** @internal */
    _navigate(instruction, _skipLocationChange) {
        return this._settleInstruction(instruction)
            .then((_) => this._routerCanReuse(instruction))
            .then((_) => this._canActivate(instruction))
            .then((result) => {
            if (!result) {
                return false;
            }
            return this._routerCanDeactivate(instruction)
                .then((result) => {
                if (result) {
                    return this.commit(instruction, _skipLocationChange)
                        .then((_) => {
                        this._emitNavigationFinish(instruction.toRootUrl());
                        return true;
                    });
                }
            });
        });
    }
    _emitNavigationFinish(url) { ObservableWrapper.callEmit(this._subject, url); }
    /** @internal */
    _emitNavigationFail(url) { ObservableWrapper.callError(this._subject, url); }
    _afterPromiseFinishNavigating(promise) {
        return PromiseWrapper.catchError(promise.then((_) => this._finishNavigating()), (err) => {
            this._finishNavigating();
            throw err;
        });
    }
    /*
     * Recursively set reuse flags
     */
    /** @internal */
    _routerCanReuse(instruction) {
        if (isBlank(this._outlet)) {
            return _resolveToFalse;
        }
        if (isBlank(instruction.component)) {
            return _resolveToTrue;
        }
        return this._outlet.routerCanReuse(instruction.component)
            .then((result) => {
            instruction.component.reuse = result;
            if (result && isPresent(this._childRouter) && isPresent(instruction.child)) {
                return this._childRouter._routerCanReuse(instruction.child);
            }
        });
    }
    _canActivate(nextInstruction) {
        return canActivateOne(nextInstruction, this.currentInstruction);
    }
    _routerCanDeactivate(instruction) {
        if (isBlank(this._outlet)) {
            return _resolveToTrue;
        }
        var next;
        var childInstruction = null;
        var reuse = false;
        var componentInstruction = null;
        if (isPresent(instruction)) {
            childInstruction = instruction.child;
            componentInstruction = instruction.component;
            reuse = isBlank(instruction.component) || instruction.component.reuse;
        }
        if (reuse) {
            next = _resolveToTrue;
        }
        else {
            next = this._outlet.routerCanDeactivate(componentInstruction);
        }
        // TODO: aux route lifecycle hooks
        return next.then((result) => {
            if (result == false) {
                return false;
            }
            if (isPresent(this._childRouter)) {
                // TODO: ideally, this closure would map to async-await in Dart.
                // For now, casting to any to suppress an error.
                return this._childRouter._routerCanDeactivate(childInstruction);
            }
            return true;
        });
    }
    /**
     * Updates this router and all descendant routers according to the given instruction
     */
    commit(instruction, _skipLocationChange = false) {
        this.currentInstruction = instruction;
        var next = _resolveToTrue;
        if (isPresent(this._outlet) && isPresent(instruction.component)) {
            var componentInstruction = instruction.component;
            if (componentInstruction.reuse) {
                next = this._outlet.reuse(componentInstruction);
            }
            else {
                let outlet = this._outlet;
                next = this.deactivate(instruction).then((_) => outlet.activate(componentInstruction));
            }
            if (isPresent(instruction.child)) {
                next = next.then((_) => {
                    if (isPresent(this._childRouter)) {
                        return this._childRouter.commit(instruction.child);
                    }
                });
            }
        }
        var promises = [];
        this._auxRouters.forEach((router, name) => {
            if (isPresent(instruction.auxInstruction[name])) {
                promises.push(router.commit(instruction.auxInstruction[name]));
            }
        });
        return next.then((_) => PromiseWrapper.all(promises));
    }
    /** @internal */
    _startNavigating() { this.navigating = true; }
    /** @internal */
    _finishNavigating() { this.navigating = false; }
    /**
     * Subscribe to URL updates from the router
     */
    subscribe(onNext, onError) {
        return ObservableWrapper.subscribe(this._subject, onNext, onError);
    }
    /**
     * Removes the contents of this router's outlet and all descendant outlets
     */
    deactivate(instruction) {
        var childInstruction = null;
        var componentInstruction = null;
        if (isPresent(instruction)) {
            childInstruction = instruction.child;
            componentInstruction = instruction.component;
        }
        var next = _resolveToTrue;
        if (isPresent(this._childRouter)) {
            next = this._childRouter.deactivate(childInstruction);
        }
        if (isPresent(this._outlet)) {
            let outlet = this._outlet;
            next = next.then((_) => outlet.deactivate(componentInstruction));
        }
        // TODO: handle aux routes
        return next;
    }
    /**
     * Given a URL, returns an instruction representing the component graph
     */
    recognize(url) {
        var ancestorComponents = this._getAncestorInstructions();
        return this.registry.recognize(url, ancestorComponents);
    }
    _getAncestorInstructions() {
        var ancestorInstructions = [this.currentInstruction];
        var ancestorRouter = this;
        while (isPresent(ancestorRouter = ancestorRouter.parent)) {
            ancestorInstructions.unshift(ancestorRouter.currentInstruction);
        }
        return ancestorInstructions;
    }
    /**
     * Navigates to either the last URL successfully navigated to, or the last URL requested if the
     * router has yet to successfully navigate.
     */
    renavigate() {
        if (isBlank(this.lastNavigationAttempt)) {
            return this._currentNavigation;
        }
        return this.navigateByUrl(this.lastNavigationAttempt);
    }
    /**
     * Generate an `Instruction` based on the provided Route Link DSL.
     */
    generate(linkParams) {
        var ancestorInstructions = this._getAncestorInstructions();
        return this.registry.generate(linkParams, ancestorInstructions);
    }
};
Router = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [RouteRegistry, Router, Object, Router])
], Router);
export let RootRouter = class RootRouter extends Router {
    constructor(registry, location, primaryComponent) {
        super(registry, null, primaryComponent);
        this.root = this;
        this._location = location;
        this._locationSub = this._location.subscribe((change) => {
            // we call recognize ourselves
            this.recognize(change['url'])
                .then((instruction) => {
                if (isPresent(instruction)) {
                    this.navigateByInstruction(instruction, isPresent(change['pop']))
                        .then((_) => {
                        // this is a popstate event; no need to change the URL
                        if (isPresent(change['pop']) && change['type'] != 'hashchange') {
                            return;
                        }
                        var emitPath = instruction.toUrlPath();
                        var emitQuery = instruction.toUrlQuery();
                        if (emitPath.length > 0 && emitPath[0] != '/') {
                            emitPath = '/' + emitPath;
                        }
                        // We've opted to use pushstate and popState APIs regardless of whether you
                        // an app uses HashLocationStrategy or PathLocationStrategy.
                        // However, apps that are migrating might have hash links that operate outside
                        // angular to which routing must respond.
                        // Therefore we know that all hashchange events occur outside Angular.
                        // To support these cases where we respond to hashchanges and redirect as a
                        // result, we need to replace the top item on the stack.
                        if (change['type'] == 'hashchange') {
                            if (instruction.toRootUrl() != this._location.path()) {
                                this._location.replaceState(emitPath, emitQuery);
                            }
                        }
                        else {
                            this._location.go(emitPath, emitQuery);
                        }
                    });
                }
                else {
                    this._emitNavigationFail(change['url']);
                }
            });
        });
        this.registry.configFromComponent(primaryComponent);
        this.navigateByUrl(location.path());
    }
    commit(instruction, _skipLocationChange = false) {
        var emitPath = instruction.toUrlPath();
        var emitQuery = instruction.toUrlQuery();
        if (emitPath.length > 0 && emitPath[0] != '/') {
            emitPath = '/' + emitPath;
        }
        var promise = super.commit(instruction);
        if (!_skipLocationChange) {
            promise = promise.then((_) => { this._location.go(emitPath, emitQuery); });
        }
        return promise;
    }
    dispose() {
        if (isPresent(this._locationSub)) {
            ObservableWrapper.dispose(this._locationSub);
            this._locationSub = null;
        }
    }
};
RootRouter = __decorate([
    Injectable(),
    __param(2, Inject(ROUTER_PRIMARY_COMPONENT)), 
    __metadata('design:paramtypes', [RouteRegistry, Location, Type])
], RootRouter);
class ChildRouter extends Router {
    constructor(parent, hostComponent) {
        super(parent.registry, parent, hostComponent, parent.root);
        this.parent = parent;
    }
    navigateByUrl(url, _skipLocationChange = false) {
        // Delegate navigation to the root router
        return this.parent.navigateByUrl(url, _skipLocationChange);
    }
    navigateByInstruction(instruction, _skipLocationChange = false) {
        // Delegate navigation to the root router
        return this.parent.navigateByInstruction(instruction, _skipLocationChange);
    }
}
function canActivateOne(nextInstruction, prevInstruction) {
    var next = _resolveToTrue;
    if (isBlank(nextInstruction.component)) {
        return next;
    }
    if (isPresent(nextInstruction.child)) {
        next = canActivateOne(nextInstruction.child, isPresent(prevInstruction) ? prevInstruction.child : null);
    }
    return next.then((result) => {
        if (result == false) {
            return false;
        }
        if (nextInstruction.component.reuse) {
            return true;
        }
        var hook = getCanActivateHook(nextInstruction.component.componentType);
        if (isPresent(hook)) {
            return hook(nextInstruction.component, isPresent(prevInstruction) ? prevInstruction.component : null);
        }
        return true;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1WZlFRV0NJay50bXAvYW5ndWxhcjIvc3JjL3JvdXRlci9yb3V0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxjQUFjLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFDLE1BQU0sMkJBQTJCO09BQ2xGLEVBQUMsR0FBRyxFQUFFLGdCQUFnQixFQUEwQixNQUFNLGdDQUFnQztPQUN0RixFQUFDLE9BQU8sRUFBWSxTQUFTLEVBQUUsSUFBSSxFQUFVLE1BQU0sMEJBQTBCO09BQzdFLEVBQUMsYUFBYSxFQUFtQixNQUFNLGdDQUFnQztPQUN2RSxFQUFDLFFBQVEsRUFBQyxNQUFNLDBCQUEwQjtPQUMxQyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUMsTUFBTSxlQUFlO09BRXpDLEVBQUMsYUFBYSxFQUFFLHdCQUF3QixFQUFDLE1BQU0sa0JBQWtCO09BTWpFLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSx1Q0FBdUM7QUFHeEUsSUFBSSxjQUFjLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsRCxJQUFJLGVBQWUsR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBRXBEOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JHO0FBRUg7SUFpQkUsWUFBbUIsUUFBdUIsRUFBUyxNQUFjLEVBQVMsYUFBa0IsRUFDekUsSUFBYTtRQURiLGFBQVEsR0FBUixRQUFRLENBQWU7UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQVMsa0JBQWEsR0FBYixhQUFhLENBQUs7UUFDekUsU0FBSSxHQUFKLElBQUksQ0FBUztRQWpCaEMsZUFBVSxHQUFZLEtBQUssQ0FBQztRQUU1Qjs7V0FFRztRQUNJLHVCQUFrQixHQUFnQixJQUFJLENBQUM7UUFFdEMsdUJBQWtCLEdBQWlCLGNB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SSxDQUFDO0lBQ2QsQ0FBQztJQUNELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLElBQUksR0FBRyxjQUFjLENBQUMsZUFBZSxDQUFDLEtBQUssRUFDckIsU0FBUyxDQUFDLGVBQWUsQ0FBQyxHQUFHLGVBQWUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFVLENBQUMsTUFBZTtRQUN4QyxFQUFFLENBQUMsQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNwQixNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELElBQUksSUFBSSxHQUFHLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDdkUsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQ3pCLFNBQVMsQ0FBQyxlQUFlLENBQUMsR0FBRyxlQUFlLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQzdFLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQcm9taXNlV3JhcHBlciwgRXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge01hcCwgU3RyaW5nTWFwV3JhcHBlciwgTWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2lzQmxhbmssIGlzU3RyaW5nLCBpc1ByZXNlbnQsIFR5cGUsIGlzQXJyYXl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0xvY2F0aW9ufSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9jb21tb24nO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5pbXBvcnQge1JvdXRlUmVnaXN0cnksIFJPVVRFUl9QUklNQVJZX0NPTVBPTkVOVH0gZnJvbSAnLi9yb3V0ZV9yZWdpc3RyeSc7XG5pbXBvcnQge1xuICBDb21wb25lbnRJbnN0cnVjdGlvbixcbiAgSW5zdHJ1Y3Rpb24sXG59IGZyb20gJy4vaW5zdHJ1Y3Rpb24nO1xuaW1wb3J0IHtSb3V0ZXJPdXRsZXR9IGZyb20gJy4vZGlyZWN0aXZlcy9yb3V0ZXJfb3V0bGV0JztcbmltcG9ydCB7Z2V0Q2FuQWN0aXZhdGVIb29rfSBmcm9tICcuL2xpZmVjeWNsZS9yb3V0ZV9saWZlY3ljbGVfcmVmbGVjdG9yJztcbmltcG9ydCB7Um91dGVEZWZpbml0aW9ufSBmcm9tICcuL3JvdXRlX2NvbmZpZy9yb3V0ZV9jb25maWdfaW1wbCc7XG5cbmxldCBfcmVzb2x2ZVRvVHJ1ZSA9IFByb21pc2VXcmFwcGVyLnJlc29sdmUodHJ1ZSk7XG5sZXQgX3Jlc29sdmVUb0ZhbHNlID0gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZShmYWxzZSk7XG5cbi8qKlxuICogVGhlIGBSb3V0ZXJgIGlzIHJlc3BvbnNpYmxlIGZvciBtYXBwaW5nIFVSTHMgdG8gY29tcG9uZW50cy5cbiAqXG4gKiBZb3UgY2FuIHNlZSB0aGUgc3RhdGUgb2YgdGhlIHJvdXRlciBieSBpbnNwZWN0aW5nIHRoZSByZWFkLW9ubHkgZmllbGQgYHJvdXRlci5uYXZpZ2F0aW5nYC5cbiAqIFRoaXMgbWF5IGJlIHVzZWZ1bCBmb3Igc2hvd2luZyBhIHNwaW5uZXIsIGZvciBpbnN0YW5jZS5cbiAqXG4gKiAjIyBDb25jZXB0c1xuICpcbiAqIFJvdXRlcnMgYW5kIGNvbXBvbmVudCBpbnN0YW5jZXMgaGF2ZSBhIDE6MSBjb3JyZXNwb25kZW5jZS5cbiAqXG4gKiBUaGUgcm91dGVyIGhvbGRzIHJlZmVyZW5jZSB0byBhIG51bWJlciBvZiB7QGxpbmsgUm91dGVyT3V0bGV0fS5cbiAqIEFuIG91dGxldCBpcyBhIHBsYWNlaG9sZGVyIHRoYXQgdGhlIHJvdXRlciBkeW5hbWljYWxseSBmaWxscyBpbiBkZXBlbmRpbmcgb24gdGhlIGN1cnJlbnQgVVJMLlxuICpcbiAqIFdoZW4gdGhlIHJvdXRlciBuYXZpZ2F0ZXMgZnJvbSBhIFVSTCwgaXQgbXVzdCBmaXJzdCByZWNvZ25pemUgaXQgYW5kIHNlcmlhbGl6ZSBpdCBpbnRvIGFuXG4gKiBgSW5zdHJ1Y3Rpb25gLlxuICogVGhlIHJvdXRlciB1c2VzIHRoZSBgUm91dGVSZWdpc3RyeWAgdG8gZ2V0IGFuIGBJbnN0cnVjdGlvbmAuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSb3V0ZXIge1xuICBuYXZpZ2F0aW5nOiBib29sZWFuID0gZmFsc2U7XG4gIGxhc3ROYXZpZ2F0aW9uQXR0ZW1wdDogc3RyaW5nO1xuICAvKipcbiAgICogVGhlIGN1cnJlbnQgYEluc3RydWN0aW9uYCBmb3IgdGhlIHJvdXRlclxuICAgKi9cbiAgcHVibGljIGN1cnJlbnRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24gPSBudWxsO1xuXG4gIHByaXZhdGUgX2N1cnJlbnROYXZpZ2F0aW9uOiBQcm9taXNlPGFueT4gPSBfcmVzb2x2ZVRvVHJ1ZTtcbiAgcHJpdmF0ZSBfb3V0bGV0OiBSb3V0ZXJPdXRsZXQgPSBudWxsO1xuXG4gIHByaXZhdGUgX2F1eFJvdXRlcnMgPSBuZXcgTWFwPHN0cmluZywgUm91dGVyPigpO1xuICBwcml2YXRlIF9jaGlsZFJvdXRlcjogUm91dGVyO1xuXG4gIHByaXZhdGUgX3N1YmplY3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG5cbiAgY29uc3RydWN0b3IocHVibGljIHJlZ2lzdHJ5OiBSb3V0ZVJlZ2lzdHJ5LCBwdWJsaWMgcGFyZW50OiBSb3V0ZXIsIHB1YmxpYyBob3N0Q29tcG9uZW50OiBhbnksXG4gICAgICAgICAgICAgIHB1YmxpYyByb290PzogUm91dGVyKSB7fVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RzIGEgY2hpbGQgcm91dGVyLiBZb3UgcHJvYmFibHkgZG9uJ3QgbmVlZCB0byB1c2UgdGhpcyB1bmxlc3MgeW91J3JlIHdyaXRpbmcgYSByZXVzYWJsZVxuICAgKiBjb21wb25lbnQuXG4gICAqL1xuICBjaGlsZFJvdXRlcihob3N0Q29tcG9uZW50OiBhbnkpOiBSb3V0ZXIge1xuICAgIHJldHVybiB0aGlzLl9jaGlsZFJvdXRlciA9IG5ldyBDaGlsZFJvdXRlcih0aGlzLCBob3N0Q29tcG9uZW50KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSBjaGlsZCByb3V0ZXIuIFlvdSBwcm9iYWJseSBkb24ndCBuZWVkIHRvIHVzZSB0aGlzIHVubGVzcyB5b3UncmUgd3JpdGluZyBhIHJldXNhYmxlXG4gICAqIGNvbXBvbmVudC5cbiAgICovXG4gIGF1eFJvdXRlcihob3N0Q29tcG9uZW50OiBhbnkpOiBSb3V0ZXIgeyByZXR1cm4gbmV3IENoaWxkUm91dGVyKHRoaXMsIGhvc3RDb21wb25lbnQpOyB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGFuIG91dGxldCB0byBiZSBub3RpZmllZCBvZiBwcmltYXJ5IHJvdXRlIGNoYW5nZXMuXG4gICAqXG4gICAqIFlvdSBwcm9iYWJseSBkb24ndCBuZWVkIHRvIHVzZSB0aGlzIHVubGVzcyB5b3UncmUgd3JpdGluZyBhIHJldXNhYmxlIGNvbXBvbmVudC5cbiAgICovXG4gIHJlZ2lzdGVyUHJpbWFyeU91dGxldChvdXRsZXQ6IFJvdXRlck91dGxldCk6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKGlzUHJlc2VudChvdXRsZXQubmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGByZWdpc3RlclByaW1hcnlPdXRsZXQgZXhwZWN0cyB0byBiZSBjYWxsZWQgd2l0aCBhbiB1bm5hbWVkIG91dGxldC5gKTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX291dGxldCkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBQcmltYXJ5IG91dGxldCBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQuYCk7XG4gICAgfVxuXG4gICAgdGhpcy5fb3V0bGV0ID0gb3V0bGV0O1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb24pKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb21taXQodGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb24sIGZhbHNlKTtcbiAgICB9XG4gICAgcmV0dXJuIF9yZXNvbHZlVG9UcnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFVucmVnaXN0ZXIgYW4gb3V0bGV0IChiZWNhdXNlIGl0IHdhcyBkZXN0cm95ZWQsIGV0YykuXG4gICAqXG4gICAqIFlvdSBwcm9iYWJseSBkb24ndCBuZWVkIHRvIHVzZSB0aGlzIHVubGVzcyB5b3UncmUgd3JpdGluZyBhIGN1c3RvbSBvdXRsZXQgaW1wbGVtZW50YXRpb24uXG4gICAqL1xuICB1bnJlZ2lzdGVyUHJpbWFyeU91dGxldChvdXRsZXQ6IFJvdXRlck91dGxldCk6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQob3V0bGV0Lm5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgcmVnaXN0ZXJQcmltYXJ5T3V0bGV0IGV4cGVjdHMgdG8gYmUgY2FsbGVkIHdpdGggYW4gdW5uYW1lZCBvdXRsZXQuYCk7XG4gICAgfVxuICAgIHRoaXMuX291dGxldCA9IG51bGw7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhbiBvdXRsZXQgdG8gbm90aWZpZWQgb2YgYXV4aWxpYXJ5IHJvdXRlIGNoYW5nZXMuXG4gICAqXG4gICAqIFlvdSBwcm9iYWJseSBkb24ndCBuZWVkIHRvIHVzZSB0aGlzIHVubGVzcyB5b3UncmUgd3JpdGluZyBhIHJldXNhYmxlIGNvbXBvbmVudC5cbiAgICovXG4gIHJlZ2lzdGVyQXV4T3V0bGV0KG91dGxldDogUm91dGVyT3V0bGV0KTogUHJvbWlzZTxhbnk+IHtcbiAgICB2YXIgb3V0bGV0TmFtZSA9IG91dGxldC5uYW1lO1xuICAgIGlmIChpc0JsYW5rKG91dGxldE5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgcmVnaXN0ZXJBdXhPdXRsZXQgZXhwZWN0cyB0byBiZSBjYWxsZWQgd2l0aCBhbiBvdXRsZXQgd2l0aCBhIG5hbWUuYCk7XG4gICAgfVxuXG4gICAgdmFyIHJvdXRlciA9IHRoaXMuYXV4Um91dGVyKHRoaXMuaG9zdENvbXBvbmVudCk7XG5cbiAgICB0aGlzLl9hdXhSb3V0ZXJzLnNldChvdXRsZXROYW1lLCByb3V0ZXIpO1xuICAgIHJvdXRlci5fb3V0bGV0ID0gb3V0bGV0O1xuXG4gICAgdmFyIGF1eEluc3RydWN0aW9uO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb24pICYmXG4gICAgICAgIGlzUHJlc2VudChhdXhJbnN0cnVjdGlvbiA9IHRoaXMuY3VycmVudEluc3RydWN0aW9uLmF1eEluc3RydWN0aW9uW291dGxldE5hbWVdKSkge1xuICAgICAgcmV0dXJuIHJvdXRlci5jb21taXQoYXV4SW5zdHJ1Y3Rpb24pO1xuICAgIH1cbiAgICByZXR1cm4gX3Jlc29sdmVUb1RydWU7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHaXZlbiBhbiBpbnN0cnVjdGlvbiwgcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGluc3RydWN0aW9uIGlzIGN1cnJlbnRseSBhY3RpdmUsXG4gICAqIG90aGVyd2lzZSBgZmFsc2VgLlxuICAgKi9cbiAgaXNSb3V0ZUFjdGl2ZShpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBib29sZWFuIHtcbiAgICB2YXIgcm91dGVyOiBSb3V0ZXIgPSB0aGlzO1xuXG4gICAgaWYgKGlzQmxhbmsodGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb24pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gYGluc3RydWN0aW9uYCBjb3JyZXNwb25kcyB0byB0aGUgcm9vdCByb3V0ZXJcbiAgICB3aGlsZSAoaXNQcmVzZW50KHJvdXRlci5wYXJlbnQpICYmIGlzUHJlc2VudChpbnN0cnVjdGlvbi5jaGlsZCkpIHtcbiAgICAgIHJvdXRlciA9IHJvdXRlci5wYXJlbnQ7XG4gICAgICBpbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uLmNoaWxkO1xuICAgIH1cblxuICAgIGlmIChpc0JsYW5rKGluc3RydWN0aW9uLmNvbXBvbmVudCkgfHwgaXNCbGFuayh0aGlzLmN1cnJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnQpIHx8XG4gICAgICAgIHRoaXMuY3VycmVudEluc3RydWN0aW9uLmNvbXBvbmVudC5yb3V0ZU5hbWUgIT0gaW5zdHJ1Y3Rpb24uY29tcG9uZW50LnJvdXRlTmFtZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxldCBwYXJhbUVxdWFscyA9IHRydWU7XG5cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuY3VycmVudEluc3RydWN0aW9uLmNvbXBvbmVudC5wYXJhbXMpKSB7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goaW5zdHJ1Y3Rpb24uY29tcG9uZW50LnBhcmFtcywgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEluc3RydWN0aW9uLmNvbXBvbmVudC5wYXJhbXNba2V5XSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICBwYXJhbUVxdWFscyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyYW1FcXVhbHM7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBEeW5hbWljYWxseSB1cGRhdGUgdGhlIHJvdXRpbmcgY29uZmlndXJhdGlvbiBhbmQgdHJpZ2dlciBhIG5hdmlnYXRpb24uXG4gICAqXG4gICAqICMjIyBVc2FnZVxuICAgKlxuICAgKiBgYGBcbiAgICogcm91dGVyLmNvbmZpZyhbXG4gICAqICAgeyAncGF0aCc6ICcvJywgJ2NvbXBvbmVudCc6IEluZGV4Q29tcCB9LFxuICAgKiAgIHsgJ3BhdGgnOiAnL3VzZXIvOmlkJywgJ2NvbXBvbmVudCc6IFVzZXJDb21wIH0sXG4gICAqIF0pO1xuICAgKiBgYGBcbiAgICovXG4gIGNvbmZpZyhkZWZpbml0aW9uczogUm91dGVEZWZpbml0aW9uW10pOiBQcm9taXNlPGFueT4ge1xuICAgIGRlZmluaXRpb25zLmZvckVhY2goXG4gICAgICAgIChyb3V0ZURlZmluaXRpb24pID0+IHsgdGhpcy5yZWdpc3RyeS5jb25maWcodGhpcy5ob3N0Q29tcG9uZW50LCByb3V0ZURlZmluaXRpb24pOyB9KTtcbiAgICByZXR1cm4gdGhpcy5yZW5hdmlnYXRlKCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZSBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgUm91dGUgTGluayBEU0wuIEl0J3MgcHJlZmVycmVkIHRvIG5hdmlnYXRlIHdpdGggdGhpcyBtZXRob2RcbiAgICogb3ZlciBgbmF2aWdhdGVCeVVybGAuXG4gICAqXG4gICAqICMjIyBVc2FnZVxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCB0YWtlcyBhbiBhcnJheSByZXByZXNlbnRpbmcgdGhlIFJvdXRlIExpbmsgRFNMOlxuICAgKiBgYGBcbiAgICogWycuL015Q21wJywge3BhcmFtOiAzfV1cbiAgICogYGBgXG4gICAqIFNlZSB0aGUge0BsaW5rIFJvdXRlckxpbmt9IGRpcmVjdGl2ZSBmb3IgbW9yZS5cbiAgICovXG4gIG5hdmlnYXRlKGxpbmtQYXJhbXM6IGFueVtdKTogUHJvbWlzZTxhbnk+IHtcbiAgICB2YXIgaW5zdHJ1Y3Rpb24gPSB0aGlzLmdlbmVyYXRlKGxpbmtQYXJhbXMpO1xuICAgIHJldHVybiB0aGlzLm5hdmlnYXRlQnlJbnN0cnVjdGlvbihpbnN0cnVjdGlvbiwgZmFsc2UpO1xuICB9XG5cblxuICAvKipcbiAgICogTmF2aWdhdGUgdG8gYSBVUkwuIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBuYXZpZ2F0aW9uIGlzIGNvbXBsZXRlLlxuICAgKiBJdCdzIHByZWZlcnJlZCB0byBuYXZpZ2F0ZSB3aXRoIGBuYXZpZ2F0ZWAgaW5zdGVhZCBvZiB0aGlzIG1ldGhvZCwgc2luY2UgVVJMcyBhcmUgbW9yZSBicml0dGxlLlxuICAgKlxuICAgKiBJZiB0aGUgZ2l2ZW4gVVJMIGJlZ2lucyB3aXRoIGEgYC9gLCByb3V0ZXIgd2lsbCBuYXZpZ2F0ZSBhYnNvbHV0ZWx5LlxuICAgKiBJZiB0aGUgZ2l2ZW4gVVJMIGRvZXMgbm90IGJlZ2luIHdpdGggYC9gLCB0aGUgcm91dGVyIHdpbGwgbmF2aWdhdGUgcmVsYXRpdmUgdG8gdGhpcyBjb21wb25lbnQuXG4gICAqL1xuICBuYXZpZ2F0ZUJ5VXJsKHVybDogc3RyaW5nLCBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50TmF2aWdhdGlvbiA9IHRoaXMuX2N1cnJlbnROYXZpZ2F0aW9uLnRoZW4oKF8pID0+IHtcbiAgICAgIHRoaXMubGFzdE5hdmlnYXRpb25BdHRlbXB0ID0gdXJsO1xuICAgICAgdGhpcy5fc3RhcnROYXZpZ2F0aW5nKCk7XG4gICAgICByZXR1cm4gdGhpcy5fYWZ0ZXJQcm9taXNlRmluaXNoTmF2aWdhdGluZyh0aGlzLnJlY29nbml6ZSh1cmwpLnRoZW4oKGluc3RydWN0aW9uKSA9PiB7XG4gICAgICAgIGlmIChpc0JsYW5rKGluc3RydWN0aW9uKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fbmF2aWdhdGUoaW5zdHJ1Y3Rpb24sIF9za2lwTG9jYXRpb25DaGFuZ2UpO1xuICAgICAgfSkpO1xuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogTmF2aWdhdGUgdmlhIHRoZSBwcm92aWRlZCBpbnN0cnVjdGlvbi4gUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIG5hdmlnYXRpb24gaXNcbiAgICogY29tcGxldGUuXG4gICAqL1xuICBuYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3NraXBMb2NhdGlvbkNoYW5nZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZiAoaXNCbGFuayhpbnN0cnVjdGlvbikpIHtcbiAgICAgIHJldHVybiBfcmVzb2x2ZVRvRmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jdXJyZW50TmF2aWdhdGlvbiA9IHRoaXMuX2N1cnJlbnROYXZpZ2F0aW9uLnRoZW4oKF8pID0+IHtcbiAgICAgIHRoaXMuX3N0YXJ0TmF2aWdhdGluZygpO1xuICAgICAgcmV0dXJuIHRoaXMuX2FmdGVyUHJvbWlzZUZpbmlzaE5hdmlnYXRpbmcodGhpcy5fbmF2aWdhdGUoaW5zdHJ1Y3Rpb24sIF9za2lwTG9jYXRpb25DaGFuZ2UpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3NldHRsZUluc3RydWN0aW9uKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIGluc3RydWN0aW9uLnJlc29sdmVDb21wb25lbnQoKS50aGVuKChfKSA9PiB7XG4gICAgICB2YXIgdW5zZXR0bGVkSW5zdHJ1Y3Rpb25zOiBBcnJheTxQcm9taXNlPGFueT4+ID0gW107XG5cbiAgICAgIGlmIChpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24uY29tcG9uZW50KSkge1xuICAgICAgICBpbnN0cnVjdGlvbi5jb21wb25lbnQucmV1c2UgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzUHJlc2VudChpbnN0cnVjdGlvbi5jaGlsZCkpIHtcbiAgICAgICAgdW5zZXR0bGVkSW5zdHJ1Y3Rpb25zLnB1c2godGhpcy5fc2V0dGxlSW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24uY2hpbGQpKTtcbiAgICAgIH1cblxuICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGluc3RydWN0aW9uLmF1eEluc3RydWN0aW9uLCAoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLCBfKSA9PiB7XG4gICAgICAgIHVuc2V0dGxlZEluc3RydWN0aW9ucy5wdXNoKHRoaXMuX3NldHRsZUluc3RydWN0aW9uKGluc3RydWN0aW9uKSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5hbGwodW5zZXR0bGVkSW5zdHJ1Y3Rpb25zKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25hdmlnYXRlKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiwgX3NraXBMb2NhdGlvbkNoYW5nZTogYm9vbGVhbik6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuX3NldHRsZUluc3RydWN0aW9uKGluc3RydWN0aW9uKVxuICAgICAgICAudGhlbigoXykgPT4gdGhpcy5fcm91dGVyQ2FuUmV1c2UoaW5zdHJ1Y3Rpb24pKVxuICAgICAgICAudGhlbigoXykgPT4gdGhpcy5fY2FuQWN0aXZhdGUoaW5zdHJ1Y3Rpb24pKVxuICAgICAgICAudGhlbigocmVzdWx0OiBib29sZWFuKSA9PiB7XG4gICAgICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX3JvdXRlckNhbkRlYWN0aXZhdGUoaW5zdHJ1Y3Rpb24pXG4gICAgICAgICAgICAgIC50aGVuKChyZXN1bHQ6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb21taXQoaW5zdHJ1Y3Rpb24sIF9za2lwTG9jYXRpb25DaGFuZ2UpXG4gICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKF8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2VtaXROYXZpZ2F0aW9uRmluaXNoKGluc3RydWN0aW9uLnRvUm9vdFVybCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZW1pdE5hdmlnYXRpb25GaW5pc2godXJsKTogdm9pZCB7IE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMuX3N1YmplY3QsIHVybCk7IH1cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZW1pdE5hdmlnYXRpb25GYWlsKHVybCk6IHZvaWQgeyBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRXJyb3IodGhpcy5fc3ViamVjdCwgdXJsKTsgfVxuXG4gIHByaXZhdGUgX2FmdGVyUHJvbWlzZUZpbmlzaE5hdmlnYXRpbmcocHJvbWlzZTogUHJvbWlzZTxhbnk+KTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIuY2F0Y2hFcnJvcihwcm9taXNlLnRoZW4oKF8pID0+IHRoaXMuX2ZpbmlzaE5hdmlnYXRpbmcoKSksIChlcnIpID0+IHtcbiAgICAgIHRoaXMuX2ZpbmlzaE5hdmlnYXRpbmcoKTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9KTtcbiAgfVxuXG4gIC8qXG4gICAqIFJlY3Vyc2l2ZWx5IHNldCByZXVzZSBmbGFnc1xuICAgKi9cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcm91dGVyQ2FuUmV1c2UoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZiAoaXNCbGFuayh0aGlzLl9vdXRsZXQpKSB7XG4gICAgICByZXR1cm4gX3Jlc29sdmVUb0ZhbHNlO1xuICAgIH1cbiAgICBpZiAoaXNCbGFuayhpbnN0cnVjdGlvbi5jb21wb25lbnQpKSB7XG4gICAgICByZXR1cm4gX3Jlc29sdmVUb1RydWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9vdXRsZXQucm91dGVyQ2FuUmV1c2UoaW5zdHJ1Y3Rpb24uY29tcG9uZW50KVxuICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgaW5zdHJ1Y3Rpb24uY29tcG9uZW50LnJldXNlID0gcmVzdWx0O1xuICAgICAgICAgIGlmIChyZXN1bHQgJiYgaXNQcmVzZW50KHRoaXMuX2NoaWxkUm91dGVyKSAmJiBpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24uY2hpbGQpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2hpbGRSb3V0ZXIuX3JvdXRlckNhblJldXNlKGluc3RydWN0aW9uLmNoaWxkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2FuQWN0aXZhdGUobmV4dEluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBjYW5BY3RpdmF0ZU9uZShuZXh0SW5zdHJ1Y3Rpb24sIHRoaXMuY3VycmVudEluc3RydWN0aW9uKTtcbiAgfVxuXG4gIHByaXZhdGUgX3JvdXRlckNhbkRlYWN0aXZhdGUoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5fb3V0bGV0KSkge1xuICAgICAgcmV0dXJuIF9yZXNvbHZlVG9UcnVlO1xuICAgIH1cbiAgICB2YXIgbmV4dDogUHJvbWlzZTxib29sZWFuPjtcbiAgICB2YXIgY2hpbGRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24gPSBudWxsO1xuICAgIHZhciByZXVzZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHZhciBjb21wb25lbnRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBudWxsO1xuICAgIGlmIChpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24pKSB7XG4gICAgICBjaGlsZEluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb24uY2hpbGQ7XG4gICAgICBjb21wb25lbnRJbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uLmNvbXBvbmVudDtcbiAgICAgIHJldXNlID0gaXNCbGFuayhpbnN0cnVjdGlvbi5jb21wb25lbnQpIHx8IGluc3RydWN0aW9uLmNvbXBvbmVudC5yZXVzZTtcbiAgICB9XG4gICAgaWYgKHJldXNlKSB7XG4gICAgICBuZXh0ID0gX3Jlc29sdmVUb1RydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5leHQgPSB0aGlzLl9vdXRsZXQucm91dGVyQ2FuRGVhY3RpdmF0ZShjb21wb25lbnRJbnN0cnVjdGlvbik7XG4gICAgfVxuICAgIC8vIFRPRE86IGF1eCByb3V0ZSBsaWZlY3ljbGUgaG9va3NcbiAgICByZXR1cm4gbmV4dC50aGVuPGJvb2xlYW4+KChyZXN1bHQpOiBib29sZWFuIHwgUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICBpZiAocmVzdWx0ID09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1ByZXNlbnQodGhpcy5fY2hpbGRSb3V0ZXIpKSB7XG4gICAgICAgIC8vIFRPRE86IGlkZWFsbHksIHRoaXMgY2xvc3VyZSB3b3VsZCBtYXAgdG8gYXN5bmMtYXdhaXQgaW4gRGFydC5cbiAgICAgICAgLy8gRm9yIG5vdywgY2FzdGluZyB0byBhbnkgdG8gc3VwcHJlc3MgYW4gZXJyb3IuXG4gICAgICAgIHJldHVybiA8YW55PnRoaXMuX2NoaWxkUm91dGVyLl9yb3V0ZXJDYW5EZWFjdGl2YXRlKGNoaWxkSW5zdHJ1Y3Rpb24pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGlzIHJvdXRlciBhbmQgYWxsIGRlc2NlbmRhbnQgcm91dGVycyBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIGluc3RydWN0aW9uXG4gICAqL1xuICBjb21taXQoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIHRoaXMuY3VycmVudEluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb247XG5cbiAgICB2YXIgbmV4dDogUHJvbWlzZTxhbnk+ID0gX3Jlc29sdmVUb1RydWU7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9vdXRsZXQpICYmIGlzUHJlc2VudChpbnN0cnVjdGlvbi5jb21wb25lbnQpKSB7XG4gICAgICB2YXIgY29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbi5jb21wb25lbnQ7XG4gICAgICBpZiAoY29tcG9uZW50SW5zdHJ1Y3Rpb24ucmV1c2UpIHtcbiAgICAgICAgbmV4dCA9IHRoaXMuX291dGxldC5yZXVzZShjb21wb25lbnRJbnN0cnVjdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgb3V0bGV0ID0gdGhpcy5fb3V0bGV0O1xuICAgICAgICBuZXh0ID0gdGhpcy5kZWFjdGl2YXRlKGluc3RydWN0aW9uKS50aGVuKChfKSA9PiBvdXRsZXQuYWN0aXZhdGUoY29tcG9uZW50SW5zdHJ1Y3Rpb24pKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24uY2hpbGQpKSB7XG4gICAgICAgIG5leHQgPSBuZXh0LnRoZW4oKF8pID0+IHtcbiAgICAgICAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2NoaWxkUm91dGVyKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NoaWxkUm91dGVyLmNvbW1pdChpbnN0cnVjdGlvbi5jaGlsZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcHJvbWlzZXM6IFByb21pc2U8YW55PltdID0gW107XG4gICAgdGhpcy5fYXV4Um91dGVycy5mb3JFYWNoKChyb3V0ZXIsIG5hbWUpID0+IHtcbiAgICAgIGlmIChpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24uYXV4SW5zdHJ1Y3Rpb25bbmFtZV0pKSB7XG4gICAgICAgIHByb21pc2VzLnB1c2gocm91dGVyLmNvbW1pdChpbnN0cnVjdGlvbi5hdXhJbnN0cnVjdGlvbltuYW1lXSkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG5leHQudGhlbigoXykgPT4gUHJvbWlzZVdyYXBwZXIuYWxsKHByb21pc2VzKSk7XG4gIH1cblxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N0YXJ0TmF2aWdhdGluZygpOiB2b2lkIHsgdGhpcy5uYXZpZ2F0aW5nID0gdHJ1ZTsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2ZpbmlzaE5hdmlnYXRpbmcoKTogdm9pZCB7IHRoaXMubmF2aWdhdGluZyA9IGZhbHNlOyB9XG5cblxuICAvKipcbiAgICogU3Vic2NyaWJlIHRvIFVSTCB1cGRhdGVzIGZyb20gdGhlIHJvdXRlclxuICAgKi9cbiAgc3Vic2NyaWJlKG9uTmV4dDogKHZhbHVlOiBhbnkpID0+IHZvaWQsIG9uRXJyb3I/OiAodmFsdWU6IGFueSkgPT4gdm9pZCk6IE9iamVjdCB7XG4gICAgcmV0dXJuIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZSh0aGlzLl9zdWJqZWN0LCBvbk5leHQsIG9uRXJyb3IpO1xuICB9XG5cblxuICAvKipcbiAgICogUmVtb3ZlcyB0aGUgY29udGVudHMgb2YgdGhpcyByb3V0ZXIncyBvdXRsZXQgYW5kIGFsbCBkZXNjZW5kYW50IG91dGxldHNcbiAgICovXG4gIGRlYWN0aXZhdGUoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICB2YXIgY2hpbGRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24gPSBudWxsO1xuICAgIHZhciBjb21wb25lbnRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBudWxsO1xuICAgIGlmIChpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24pKSB7XG4gICAgICBjaGlsZEluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb24uY2hpbGQ7XG4gICAgICBjb21wb25lbnRJbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uLmNvbXBvbmVudDtcbiAgICB9XG4gICAgdmFyIG5leHQ6IFByb21pc2U8YW55PiA9IF9yZXNvbHZlVG9UcnVlO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fY2hpbGRSb3V0ZXIpKSB7XG4gICAgICBuZXh0ID0gdGhpcy5fY2hpbGRSb3V0ZXIuZGVhY3RpdmF0ZShjaGlsZEluc3RydWN0aW9uKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9vdXRsZXQpKSB7XG4gICAgICBsZXQgb3V0bGV0ID0gdGhpcy5fb3V0bGV0O1xuICAgICAgbmV4dCA9IG5leHQudGhlbigoXykgPT4gb3V0bGV0LmRlYWN0aXZhdGUoY29tcG9uZW50SW5zdHJ1Y3Rpb24pKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBoYW5kbGUgYXV4IHJvdXRlc1xuXG4gICAgcmV0dXJuIG5leHQ7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIFVSTCwgcmV0dXJucyBhbiBpbnN0cnVjdGlvbiByZXByZXNlbnRpbmcgdGhlIGNvbXBvbmVudCBncmFwaFxuICAgKi9cbiAgcmVjb2duaXplKHVybDogc3RyaW5nKTogUHJvbWlzZTxJbnN0cnVjdGlvbj4ge1xuICAgIHZhciBhbmNlc3RvckNvbXBvbmVudHMgPSB0aGlzLl9nZXRBbmNlc3Rvckluc3RydWN0aW9ucygpO1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5LnJlY29nbml6ZSh1cmwsIGFuY2VzdG9yQ29tcG9uZW50cyk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRBbmNlc3Rvckluc3RydWN0aW9ucygpOiBJbnN0cnVjdGlvbltdIHtcbiAgICB2YXIgYW5jZXN0b3JJbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10gPSBbdGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb25dO1xuICAgIHZhciBhbmNlc3RvclJvdXRlcjogUm91dGVyID0gdGhpcztcbiAgICB3aGlsZSAoaXNQcmVzZW50KGFuY2VzdG9yUm91dGVyID0gYW5jZXN0b3JSb3V0ZXIucGFyZW50KSkge1xuICAgICAgYW5jZXN0b3JJbnN0cnVjdGlvbnMudW5zaGlmdChhbmNlc3RvclJvdXRlci5jdXJyZW50SW5zdHJ1Y3Rpb24pO1xuICAgIH1cbiAgICByZXR1cm4gYW5jZXN0b3JJbnN0cnVjdGlvbnM7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZXMgdG8gZWl0aGVyIHRoZSBsYXN0IFVSTCBzdWNjZXNzZnVsbHkgbmF2aWdhdGVkIHRvLCBvciB0aGUgbGFzdCBVUkwgcmVxdWVzdGVkIGlmIHRoZVxuICAgKiByb3V0ZXIgaGFzIHlldCB0byBzdWNjZXNzZnVsbHkgbmF2aWdhdGUuXG4gICAqL1xuICByZW5hdmlnYXRlKCk6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5sYXN0TmF2aWdhdGlvbkF0dGVtcHQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY3VycmVudE5hdmlnYXRpb247XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm5hdmlnYXRlQnlVcmwodGhpcy5sYXN0TmF2aWdhdGlvbkF0dGVtcHQpO1xuICB9XG5cblxuICAvKipcbiAgICogR2VuZXJhdGUgYW4gYEluc3RydWN0aW9uYCBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgUm91dGUgTGluayBEU0wuXG4gICAqL1xuICBnZW5lcmF0ZShsaW5rUGFyYW1zOiBhbnlbXSk6IEluc3RydWN0aW9uIHtcbiAgICB2YXIgYW5jZXN0b3JJbnN0cnVjdGlvbnMgPSB0aGlzLl9nZXRBbmNlc3Rvckluc3RydWN0aW9ucygpO1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5LmdlbmVyYXRlKGxpbmtQYXJhbXMsIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zKTtcbiAgfVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUm9vdFJvdXRlciBleHRlbmRzIFJvdXRlciB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2xvY2F0aW9uOiBMb2NhdGlvbjtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbG9jYXRpb25TdWI6IE9iamVjdDtcblxuICBjb25zdHJ1Y3RvcihyZWdpc3RyeTogUm91dGVSZWdpc3RyeSwgbG9jYXRpb246IExvY2F0aW9uLFxuICAgICAgICAgICAgICBASW5qZWN0KFJPVVRFUl9QUklNQVJZX0NPTVBPTkVOVCkgcHJpbWFyeUNvbXBvbmVudDogVHlwZSkge1xuICAgIHN1cGVyKHJlZ2lzdHJ5LCBudWxsLCBwcmltYXJ5Q29tcG9uZW50KTtcbiAgICB0aGlzLnJvb3QgPSB0aGlzO1xuICAgIHRoaXMuX2xvY2F0aW9uID0gbG9jYXRpb247XG4gICAgdGhpcy5fbG9jYXRpb25TdWIgPSB0aGlzLl9sb2NhdGlvbi5zdWJzY3JpYmUoKGNoYW5nZSkgPT4ge1xuICAgICAgLy8gd2UgY2FsbCByZWNvZ25pemUgb3Vyc2VsdmVzXG4gICAgICB0aGlzLnJlY29nbml6ZShjaGFuZ2VbJ3VybCddKVxuICAgICAgICAgIC50aGVuKChpbnN0cnVjdGlvbikgPT4ge1xuICAgICAgICAgICAgaWYgKGlzUHJlc2VudChpbnN0cnVjdGlvbikpIHtcbiAgICAgICAgICAgICAgdGhpcy5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24sIGlzUHJlc2VudChjaGFuZ2VbJ3BvcCddKSlcbiAgICAgICAgICAgICAgICAgIC50aGVuKChfKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgYSBwb3BzdGF0ZSBldmVudDsgbm8gbmVlZCB0byBjaGFuZ2UgdGhlIFVSTFxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNQcmVzZW50KGNoYW5nZVsncG9wJ10pICYmIGNoYW5nZVsndHlwZSddICE9ICdoYXNoY2hhbmdlJykge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgZW1pdFBhdGggPSBpbnN0cnVjdGlvbi50b1VybFBhdGgoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVtaXRRdWVyeSA9IGluc3RydWN0aW9uLnRvVXJsUXVlcnkoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVtaXRQYXRoLmxlbmd0aCA+IDAgJiYgZW1pdFBhdGhbMF0gIT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgZW1pdFBhdGggPSAnLycgKyBlbWl0UGF0aDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFdlJ3ZlIG9wdGVkIHRvIHVzZSBwdXNoc3RhdGUgYW5kIHBvcFN0YXRlIEFQSXMgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHlvdVxuICAgICAgICAgICAgICAgICAgICAvLyBhbiBhcHAgdXNlcyBIYXNoTG9jYXRpb25TdHJhdGVneSBvciBQYXRoTG9jYXRpb25TdHJhdGVneS5cbiAgICAgICAgICAgICAgICAgICAgLy8gSG93ZXZlciwgYXBwcyB0aGF0IGFyZSBtaWdyYXRpbmcgbWlnaHQgaGF2ZSBoYXNoIGxpbmtzIHRoYXQgb3BlcmF0ZSBvdXRzaWRlXG4gICAgICAgICAgICAgICAgICAgIC8vIGFuZ3VsYXIgdG8gd2hpY2ggcm91dGluZyBtdXN0IHJlc3BvbmQuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZXJlZm9yZSB3ZSBrbm93IHRoYXQgYWxsIGhhc2hjaGFuZ2UgZXZlbnRzIG9jY3VyIG91dHNpZGUgQW5ndWxhci5cbiAgICAgICAgICAgICAgICAgICAgLy8gVG8gc3VwcG9ydCB0aGVzZSBjYXNlcyB3aGVyZSB3ZSByZXNwb25kIHRvIGhhc2hjaGFuZ2VzIGFuZCByZWRpcmVjdCBhcyBhXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlc3VsdCwgd2UgbmVlZCB0byByZXBsYWNlIHRoZSB0b3AgaXRlbSBvbiB0aGUgc3RhY2suXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGFuZ2VbJ3R5cGUnXSA9PSAnaGFzaGNoYW5nZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5zdHJ1Y3Rpb24udG9Sb290VXJsKCkgIT0gdGhpcy5fbG9jYXRpb24ucGF0aCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb2NhdGlvbi5yZXBsYWNlU3RhdGUoZW1pdFBhdGgsIGVtaXRRdWVyeSk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvY2F0aW9uLmdvKGVtaXRQYXRoLCBlbWl0UXVlcnkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuX2VtaXROYXZpZ2F0aW9uRmFpbChjaGFuZ2VbJ3VybCddKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMucmVnaXN0cnkuY29uZmlnRnJvbUNvbXBvbmVudChwcmltYXJ5Q29tcG9uZW50KTtcbiAgICB0aGlzLm5hdmlnYXRlQnlVcmwobG9jYXRpb24ucGF0aCgpKTtcbiAgfVxuXG4gIGNvbW1pdChpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sIF9za2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8YW55PiB7XG4gICAgdmFyIGVtaXRQYXRoID0gaW5zdHJ1Y3Rpb24udG9VcmxQYXRoKCk7XG4gICAgdmFyIGVtaXRRdWVyeSA9IGluc3RydWN0aW9uLnRvVXJsUXVlcnkoKTtcbiAgICBpZiAoZW1pdFBhdGgubGVuZ3RoID4gMCAmJiBlbWl0UGF0aFswXSAhPSAnLycpIHtcbiAgICAgIGVtaXRQYXRoID0gJy8nICsgZW1pdFBhdGg7XG4gICAgfVxuICAgIHZhciBwcm9taXNlID0gc3VwZXIuY29tbWl0KGluc3RydWN0aW9uKTtcbiAgICBpZiAoIV9za2lwTG9jYXRpb25DaGFuZ2UpIHtcbiAgICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oKF8pID0+IHsgdGhpcy5fbG9jYXRpb24uZ28oZW1pdFBhdGgsIGVtaXRRdWVyeSk7IH0pO1xuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9sb2NhdGlvblN1YikpIHtcbiAgICAgIE9ic2VydmFibGVXcmFwcGVyLmRpc3Bvc2UodGhpcy5fbG9jYXRpb25TdWIpO1xuICAgICAgdGhpcy5fbG9jYXRpb25TdWIgPSBudWxsO1xuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBDaGlsZFJvdXRlciBleHRlbmRzIFJvdXRlciB7XG4gIGNvbnN0cnVjdG9yKHBhcmVudDogUm91dGVyLCBob3N0Q29tcG9uZW50KSB7XG4gICAgc3VwZXIocGFyZW50LnJlZ2lzdHJ5LCBwYXJlbnQsIGhvc3RDb21wb25lbnQsIHBhcmVudC5yb290KTtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgfVxuXG5cbiAgbmF2aWdhdGVCeVVybCh1cmw6IHN0cmluZywgX3NraXBMb2NhdGlvbkNoYW5nZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxhbnk+IHtcbiAgICAvLyBEZWxlZ2F0ZSBuYXZpZ2F0aW9uIHRvIHRoZSByb290IHJvdXRlclxuICAgIHJldHVybiB0aGlzLnBhcmVudC5uYXZpZ2F0ZUJ5VXJsKHVybCwgX3NraXBMb2NhdGlvbkNoYW5nZSk7XG4gIH1cblxuICBuYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3NraXBMb2NhdGlvbkNoYW5nZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxhbnk+IHtcbiAgICAvLyBEZWxlZ2F0ZSBuYXZpZ2F0aW9uIHRvIHRoZSByb290IHJvdXRlclxuICAgIHJldHVybiB0aGlzLnBhcmVudC5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24sIF9za2lwTG9jYXRpb25DaGFuZ2UpO1xuICB9XG59XG5cblxuZnVuY3Rpb24gY2FuQWN0aXZhdGVPbmUobmV4dEluc3RydWN0aW9uOiBJbnN0cnVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgdmFyIG5leHQgPSBfcmVzb2x2ZVRvVHJ1ZTtcbiAgaWYgKGlzQmxhbmsobmV4dEluc3RydWN0aW9uLmNvbXBvbmVudCkpIHtcbiAgICByZXR1cm4gbmV4dDtcbiAgfVxuICBpZiAoaXNQcmVzZW50KG5leHRJbnN0cnVjdGlvbi5jaGlsZCkpIHtcbiAgICBuZXh0ID0gY2FuQWN0aXZhdGVPbmUobmV4dEluc3RydWN0aW9uLmNoaWxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBpc1ByZXNlbnQocHJldkluc3RydWN0aW9uKSA/IHByZXZJbnN0cnVjdGlvbi5jaGlsZCA6IG51bGwpO1xuICB9XG4gIHJldHVybiBuZXh0LnRoZW48Ym9vbGVhbj4oKHJlc3VsdDogYm9vbGVhbik6IGJvb2xlYW4gPT4ge1xuICAgIGlmIChyZXN1bHQgPT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKG5leHRJbnN0cnVjdGlvbi5jb21wb25lbnQucmV1c2UpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICB2YXIgaG9vayA9IGdldENhbkFjdGl2YXRlSG9vayhuZXh0SW5zdHJ1Y3Rpb24uY29tcG9uZW50LmNvbXBvbmVudFR5cGUpO1xuICAgIGlmIChpc1ByZXNlbnQoaG9vaykpIHtcbiAgICAgIHJldHVybiBob29rKG5leHRJbnN0cnVjdGlvbi5jb21wb25lbnQsXG4gICAgICAgICAgICAgICAgICBpc1ByZXNlbnQocHJldkluc3RydWN0aW9uKSA/IHByZXZJbnN0cnVjdGlvbi5jb21wb25lbnQgOiBudWxsKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0pO1xufVxuIl19