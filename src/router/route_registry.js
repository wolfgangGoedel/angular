'use strict';"use strict";
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
var collection_1 = require('angular2/src/facade/collection');
var async_1 = require('angular2/src/facade/async');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var core_1 = require('angular2/core');
var route_config_impl_1 = require('./route_config/route_config_impl');
var rules_1 = require('./rules/rules');
var rule_set_1 = require('./rules/rule_set');
var instruction_1 = require('./instruction');
var route_config_normalizer_1 = require('./route_config/route_config_normalizer');
var url_parser_1 = require('./url_parser');
var utils_1 = require('./utils');
var _resolveToNull = async_1.PromiseWrapper.resolve(null);
// A LinkItemArray is an array, which describes a set of routes
// The items in the array are found in groups:
// - the first item is the name of the route
// - the next items are:
//   - an object containing parameters
//   - or an array describing an aux route
// export type LinkRouteItem = string | Object;
// export type LinkItem = LinkRouteItem | Array<LinkRouteItem>;
// export type LinkItemArray = Array<LinkItem>;
/**
 * Token used to bind the component with the top-level {@link RouteConfig}s for the
 * application.
 *
 * ### Example ([live demo](http://plnkr.co/edit/iRUP8B5OUbxCWQ3AcIDm))
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {
 *   ROUTER_DIRECTIVES,
 *   ROUTER_PROVIDERS,
 *   RouteConfig
 * } from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   // ...
 * }
 *
 * bootstrap(AppCmp, [ROUTER_PROVIDERS]);
 * ```
 */
exports.ROUTER_PRIMARY_COMPONENT = lang_1.CONST_EXPR(new core_1.OpaqueToken('RouterPrimaryComponent'));
/**
 * The RouteRegistry holds route configurations for each component in an Angular app.
 * It is responsible for creating Instructions from URLs, and generating URLs based on route and
 * parameters.
 */
var RouteRegistry = (function () {
    function RouteRegistry(_rootComponent) {
        this._rootComponent = _rootComponent;
        this._rules = new collection_1.Map();
    }
    /**
     * Given a component and a configuration object, add the route to this registry
     */
    RouteRegistry.prototype.config = function (parentComponent, config) {
        config = route_config_normalizer_1.normalizeRouteConfig(config, this);
        // this is here because Dart type guard reasons
        if (config instanceof route_config_impl_1.Route) {
            route_config_normalizer_1.assertComponentExists(config.component, config.path);
        }
        else if (config instanceof route_config_impl_1.AuxRoute) {
            route_config_normalizer_1.assertComponentExists(config.component, config.path);
        }
        var rules = this._rules.get(parentComponent);
        if (lang_1.isBlank(rules)) {
            rules = new rule_set_1.RuleSet();
            this._rules.set(parentComponent, rules);
        }
        var terminal = rules.config(config);
        if (config instanceof route_config_impl_1.Route) {
            if (terminal) {
                assertTerminalComponent(config.component, config.path);
            }
            else {
                this.configFromComponent(config.component);
            }
        }
    };
    /**
     * Reads the annotations of a component and configures the registry based on them
     */
    RouteRegistry.prototype.configFromComponent = function (component) {
        var _this = this;
        if (!lang_1.isType(component) && !(component instanceof core_1.ComponentFactory)) {
            return;
        }
        // Don't read the annotations from a type more than once –
        // this prevents an infinite loop if a component routes recursively.
        if (this._rules.has(component)) {
            return;
        }
        var annotations = utils_1.getComponentAnnotations(component);
        if (lang_1.isPresent(annotations)) {
            for (var i = 0; i < annotations.length; i++) {
                var annotation = annotations[i];
                if (annotation instanceof route_config_impl_1.RouteConfig) {
                    var routeCfgs = annotation.configs;
                    routeCfgs.forEach(function (config) { return _this.config(component, config); });
                }
            }
        }
    };
    /**
     * Given a URL and a parent component, return the most specific instruction for navigating
     * the application into the state specified by the url
     */
    RouteRegistry.prototype.recognize = function (url, ancestorInstructions) {
        var parsedUrl = url_parser_1.parser.parse(url);
        return this._recognize(parsedUrl, []);
    };
    /**
     * Recognizes all parent-child routes, but creates unresolved auxiliary routes
     */
    RouteRegistry.prototype._recognize = function (parsedUrl, ancestorInstructions, _aux) {
        var _this = this;
        if (_aux === void 0) { _aux = false; }
        var parentInstruction = collection_1.ListWrapper.last(ancestorInstructions);
        var parentComponent = lang_1.isPresent(parentInstruction) ? parentInstruction.component.componentType :
            this._rootComponent;
        var rules = this._rules.get(parentComponent);
        if (lang_1.isBlank(rules)) {
            return _resolveToNull;
        }
        // Matches some beginning part of the given URL
        var possibleMatches = _aux ? rules.recognizeAuxiliary(parsedUrl) : rules.recognize(parsedUrl);
        var matchPromises = possibleMatches.map(function (candidate) { return candidate.then(function (candidate) {
            if (candidate instanceof rules_1.PathMatch) {
                var auxParentInstructions = ancestorInstructions.length > 0 ? [collection_1.ListWrapper.last(ancestorInstructions)] : [];
                var auxInstructions = _this._auxRoutesToUnresolved(candidate.remainingAux, auxParentInstructions);
                var instruction = new instruction_1.ResolvedInstruction(candidate.instruction, null, auxInstructions);
                if (lang_1.isBlank(candidate.instruction) || candidate.instruction.terminal) {
                    return instruction;
                }
                var newAncestorInstructions = ancestorInstructions.concat([instruction]);
                return _this._recognize(candidate.remaining, newAncestorInstructions)
                    .then(function (childInstruction) {
                    if (lang_1.isBlank(childInstruction)) {
                        return null;
                    }
                    // redirect instructions are already absolute
                    if (childInstruction instanceof instruction_1.RedirectInstruction) {
                        return childInstruction;
                    }
                    instruction.child = childInstruction;
                    return instruction;
                });
            }
            if (candidate instanceof rules_1.RedirectMatch) {
                var instruction = _this.generate(candidate.redirectTo, ancestorInstructions.concat([null]));
                return new instruction_1.RedirectInstruction(instruction.component, instruction.child, instruction.auxInstruction, candidate.specificity);
            }
        }); });
        if ((lang_1.isBlank(parsedUrl) || parsedUrl.path == '') && possibleMatches.length == 0) {
            return async_1.PromiseWrapper.resolve(this.generateDefault(parentComponent));
        }
        return async_1.PromiseWrapper.all(matchPromises).then(mostSpecific);
    };
    RouteRegistry.prototype._auxRoutesToUnresolved = function (auxRoutes, parentInstructions) {
        var _this = this;
        var unresolvedAuxInstructions = {};
        auxRoutes.forEach(function (auxUrl) {
            unresolvedAuxInstructions[auxUrl.path] = new instruction_1.UnresolvedInstruction(function () { return _this._recognize(auxUrl, parentInstructions, true); });
        });
        return unresolvedAuxInstructions;
    };
    /**
     * Given a normalized list with component names and params like: `['user', {id: 3 }]`
     * generates a url with a leading slash relative to the provided `parentComponent`.
     *
     * If the optional param `_aux` is `true`, then we generate starting at an auxiliary
     * route boundary.
     */
    RouteRegistry.prototype.generate = function (linkParams, ancestorInstructions, _aux) {
        if (_aux === void 0) { _aux = false; }
        var params = splitAndFlattenLinkParams(linkParams);
        var prevInstruction;
        // The first segment should be either '.' (generate from parent) or '' (generate from root).
        // When we normalize above, we strip all the slashes, './' becomes '.' and '/' becomes ''.
        if (collection_1.ListWrapper.first(params) == '') {
            params.shift();
            prevInstruction = collection_1.ListWrapper.first(ancestorInstructions);
            ancestorInstructions = [];
        }
        else {
            prevInstruction = ancestorInstructions.length > 0 ? ancestorInstructions.pop() : null;
            if (collection_1.ListWrapper.first(params) == '.') {
                params.shift();
            }
            else if (collection_1.ListWrapper.first(params) == '..') {
                while (collection_1.ListWrapper.first(params) == '..') {
                    if (ancestorInstructions.length <= 0) {
                        throw new exceptions_1.BaseException("Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" has too many \"../\" segments.");
                    }
                    prevInstruction = ancestorInstructions.pop();
                    params = collection_1.ListWrapper.slice(params, 1);
                }
            }
            else {
                // we must only peak at the link param, and not consume it
                var routeName = collection_1.ListWrapper.first(params);
                var parentComponentType = this._rootComponent;
                var grandparentComponentType = null;
                if (ancestorInstructions.length > 1) {
                    var parentComponentInstruction = ancestorInstructions[ancestorInstructions.length - 1];
                    var grandComponentInstruction = ancestorInstructions[ancestorInstructions.length - 2];
                    parentComponentType = parentComponentInstruction.component.componentType;
                    grandparentComponentType = grandComponentInstruction.component.componentType;
                }
                else if (ancestorInstructions.length == 1) {
                    parentComponentType = ancestorInstructions[0].component.componentType;
                    grandparentComponentType = this._rootComponent;
                }
                // For a link with no leading `./`, `/`, or `../`, we look for a sibling and child.
                // If both exist, we throw. Otherwise, we prefer whichever exists.
                var childRouteExists = this.hasRoute(routeName, parentComponentType);
                var parentRouteExists = lang_1.isPresent(grandparentComponentType) &&
                    this.hasRoute(routeName, grandparentComponentType);
                if (parentRouteExists && childRouteExists) {
                    var msg = "Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" is ambiguous, use \"./\" or \"../\" to disambiguate.";
                    throw new exceptions_1.BaseException(msg);
                }
                if (parentRouteExists) {
                    prevInstruction = ancestorInstructions.pop();
                }
            }
        }
        if (params[params.length - 1] == '') {
            params.pop();
        }
        if (params.length > 0 && params[0] == '') {
            params.shift();
        }
        if (params.length < 1) {
            var msg = "Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" must include a route name.";
            throw new exceptions_1.BaseException(msg);
        }
        var generatedInstruction = this._generate(params, ancestorInstructions, prevInstruction, _aux, linkParams);
        // we don't clone the first (root) element
        for (var i = ancestorInstructions.length - 1; i >= 0; i--) {
            var ancestorInstruction = ancestorInstructions[i];
            if (lang_1.isBlank(ancestorInstruction)) {
                break;
            }
            generatedInstruction = ancestorInstruction.replaceChild(generatedInstruction);
        }
        return generatedInstruction;
    };
    /*
     * Internal helper that does not make any assertions about the beginning of the link DSL.
     * `ancestorInstructions` are parents that will be cloned.
     * `prevInstruction` is the existing instruction that would be replaced, but which might have
     * aux routes that need to be cloned.
     */
    RouteRegistry.prototype._generate = function (linkParams, ancestorInstructions, prevInstruction, _aux, _originalLink) {
        var _this = this;
        if (_aux === void 0) { _aux = false; }
        var parentComponentType = this._rootComponent;
        var componentInstruction = null;
        var auxInstructions = {};
        var parentInstruction = collection_1.ListWrapper.last(ancestorInstructions);
        if (lang_1.isPresent(parentInstruction) && lang_1.isPresent(parentInstruction.component)) {
            parentComponentType = parentInstruction.component.componentType;
        }
        if (linkParams.length == 0) {
            var defaultInstruction = this.generateDefault(parentComponentType);
            if (lang_1.isBlank(defaultInstruction)) {
                throw new exceptions_1.BaseException("Link \"" + collection_1.ListWrapper.toJSON(_originalLink) + "\" does not resolve to a terminal instruction.");
            }
            return defaultInstruction;
        }
        // for non-aux routes, we want to reuse the predecessor's existing primary and aux routes
        // and only override routes for which the given link DSL provides
        if (lang_1.isPresent(prevInstruction) && !_aux) {
            auxInstructions = collection_1.StringMapWrapper.merge(prevInstruction.auxInstruction, auxInstructions);
            componentInstruction = prevInstruction.component;
        }
        var rules = this._rules.get(parentComponentType);
        if (lang_1.isBlank(rules)) {
            throw new exceptions_1.BaseException("Component \"" + lang_1.getTypeNameForDebugging(utils_1.getComponentType(parentComponentType)) + "\" has no route config.");
        }
        var linkParamIndex = 0;
        var routeParams = {};
        // first, recognize the primary route if one is provided
        if (linkParamIndex < linkParams.length && lang_1.isString(linkParams[linkParamIndex])) {
            var routeName = linkParams[linkParamIndex];
            if (routeName == '' || routeName == '.' || routeName == '..') {
                throw new exceptions_1.BaseException("\"" + routeName + "/\" is only allowed at the beginning of a link DSL.");
            }
            linkParamIndex += 1;
            if (linkParamIndex < linkParams.length) {
                var linkParam = linkParams[linkParamIndex];
                if (lang_1.isStringMap(linkParam) && !lang_1.isArray(linkParam)) {
                    routeParams = linkParam;
                    linkParamIndex += 1;
                }
            }
            var routeRecognizer = (_aux ? rules.auxRulesByName : rules.rulesByName).get(routeName);
            if (lang_1.isBlank(routeRecognizer)) {
                throw new exceptions_1.BaseException("Component \"" + lang_1.getTypeNameForDebugging(utils_1.getComponentType(parentComponentType)) + "\" has no route named \"" + routeName + "\".");
            }
            // Create an "unresolved instruction" for async routes
            // we'll figure out the rest of the route when we resolve the instruction and
            // perform a navigation
            if (lang_1.isBlank(routeRecognizer.handler.componentType)) {
                var generatedUrl = routeRecognizer.generateComponentPathValues(routeParams);
                return new instruction_1.UnresolvedInstruction(function () {
                    return routeRecognizer.handler.resolveComponentType().then(function (_) {
                        return _this._generate(linkParams, ancestorInstructions, prevInstruction, _aux, _originalLink);
                    });
                }, generatedUrl.urlPath, url_parser_1.convertUrlParamsToArray(generatedUrl.urlParams));
            }
            componentInstruction = _aux ? rules.generateAuxiliary(routeName, routeParams) :
                rules.generate(routeName, routeParams);
        }
        // Next, recognize auxiliary instructions.
        // If we have an ancestor instruction, we preserve whatever aux routes are active from it.
        while (linkParamIndex < linkParams.length && lang_1.isArray(linkParams[linkParamIndex])) {
            var auxParentInstruction = [parentInstruction];
            var auxInstruction = this._generate(linkParams[linkParamIndex], auxParentInstruction, null, true, _originalLink);
            // TODO: this will not work for aux routes with parameters or multiple segments
            auxInstructions[auxInstruction.component.urlPath] = auxInstruction;
            linkParamIndex += 1;
        }
        var instruction = new instruction_1.ResolvedInstruction(componentInstruction, null, auxInstructions);
        // If the component is sync, we can generate resolved child route instructions
        // If not, we'll resolve the instructions at navigation time
        if (lang_1.isPresent(componentInstruction) && lang_1.isPresent(componentInstruction.componentType)) {
            var childInstruction = null;
            if (componentInstruction.terminal) {
                if (linkParamIndex >= linkParams.length) {
                }
            }
            else {
                var childAncestorComponents = ancestorInstructions.concat([instruction]);
                var remainingLinkParams = linkParams.slice(linkParamIndex);
                childInstruction = this._generate(remainingLinkParams, childAncestorComponents, null, false, _originalLink);
            }
            instruction.child = childInstruction;
        }
        return instruction;
    };
    RouteRegistry.prototype.hasRoute = function (name, parentComponent) {
        var rules = this._rules.get(parentComponent);
        if (lang_1.isBlank(rules)) {
            return false;
        }
        return rules.hasRoute(name);
    };
    RouteRegistry.prototype.generateDefault = function (componentCursor) {
        var _this = this;
        if (lang_1.isBlank(componentCursor)) {
            return null;
        }
        var rules = this._rules.get(componentCursor);
        if (lang_1.isBlank(rules) || lang_1.isBlank(rules.defaultRule)) {
            return null;
        }
        var defaultChild = null;
        if (lang_1.isPresent(rules.defaultRule.handler.componentType)) {
            var componentInstruction = rules.defaultRule.generate({});
            if (!rules.defaultRule.terminal) {
                defaultChild = this.generateDefault(rules.defaultRule.handler.componentType);
            }
            return new instruction_1.DefaultInstruction(componentInstruction, defaultChild);
        }
        return new instruction_1.UnresolvedInstruction(function () {
            return rules.defaultRule.handler.resolveComponentType().then(function (_) { return _this.generateDefault(componentCursor); });
        });
    };
    RouteRegistry = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject(exports.ROUTER_PRIMARY_COMPONENT)), 
        __metadata('design:paramtypes', [Object])
    ], RouteRegistry);
    return RouteRegistry;
}());
exports.RouteRegistry = RouteRegistry;
/*
 * Given: ['/a/b', {c: 2}]
 * Returns: ['', 'a', 'b', {c: 2}]
 */
function splitAndFlattenLinkParams(linkParams) {
    var accumulation = [];
    linkParams.forEach(function (item) {
        if (lang_1.isString(item)) {
            var strItem = item;
            accumulation = accumulation.concat(strItem.split('/'));
        }
        else {
            accumulation.push(item);
        }
    });
    return accumulation;
}
/*
 * Given a list of instructions, returns the most specific instruction
 */
function mostSpecific(instructions) {
    instructions = instructions.filter(function (instruction) { return lang_1.isPresent(instruction); });
    if (instructions.length == 0) {
        return null;
    }
    if (instructions.length == 1) {
        return instructions[0];
    }
    var first = instructions[0];
    var rest = instructions.slice(1);
    return rest.reduce(function (instruction, contender) {
        if (compareSpecificityStrings(contender.specificity, instruction.specificity) == -1) {
            return contender;
        }
        return instruction;
    }, first);
}
/*
 * Expects strings to be in the form of "[0-2]+"
 * Returns -1 if string A should be sorted above string B, 1 if it should be sorted after,
 * or 0 if they are the same.
 */
function compareSpecificityStrings(a, b) {
    var l = lang_1.Math.min(a.length, b.length);
    for (var i = 0; i < l; i += 1) {
        var ai = lang_1.StringWrapper.charCodeAt(a, i);
        var bi = lang_1.StringWrapper.charCodeAt(b, i);
        var difference = bi - ai;
        if (difference != 0) {
            return difference;
        }
    }
    return a.length - b.length;
}
function assertTerminalComponent(component, path) {
    if (!lang_1.isType(component) && !(component instanceof core_1.ComponentFactory)) {
        return;
    }
    var annotations = utils_1.getComponentAnnotations(component);
    if (lang_1.isPresent(annotations)) {
        for (var i = 0; i < annotations.length; i++) {
            var annotation = annotations[i];
            if (annotation instanceof route_config_impl_1.RouteConfig) {
                throw new exceptions_1.BaseException("Child routes are not allowed for \"" + path + "\". Use \"...\" on the parent's route path.");
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVfcmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLUJIc2JSSmQyLnRtcC9hbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlX3JlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSwyQkFBNkQsZ0NBQWdDLENBQUMsQ0FBQTtBQUM5RixzQkFBNkIsMkJBQTJCLENBQUMsQ0FBQTtBQUN6RCxxQkFZTywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xDLDJCQUE4QyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQy9FLHFCQUFnRSxlQUFlLENBQUMsQ0FBQTtBQUVoRixrQ0FPTyxrQ0FBa0MsQ0FBQyxDQUFBO0FBQzFDLHNCQUFtRCxlQUFlLENBQUMsQ0FBQTtBQUNuRSx5QkFBc0Isa0JBQWtCLENBQUMsQ0FBQTtBQUN6Qyw0QkFNTyxlQUFlLENBQUMsQ0FBQTtBQUV2Qix3Q0FBMEQsd0NBQXdDLENBQUMsQ0FBQTtBQUNuRywyQkFBc0UsY0FBYyxDQUFDLENBQUE7QUFFckYsc0JBQXdELFNBQVMsQ0FBQyxDQUFBO0FBRWxFLElBQUksY0FBYyxHQUFHLHNCQUFjLENBQUMsT0FBTyxDQUFjLElBQUksQ0FBQyxDQUFDO0FBRS9ELCtEQUErRDtBQUMvRCw4Q0FBOEM7QUFDOUMsNENBQTRDO0FBQzVDLHdCQUF3QjtBQUN4QixzQ0FBc0M7QUFDdEMsMENBQTBDO0FBQzFDLCtDQUErQztBQUMvQywrREFBK0Q7QUFDL0QsK0NBQStDO0FBRS9DOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F3Qkc7QUFDVSxnQ0FBd0IsR0FDakMsaUJBQVUsQ0FBQyxJQUFJLGtCQUFXLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO0FBRzFEOzs7O0dBSUc7QUFFSDtJQUdFLHVCQUFzRCxjQUF1QztRQUF2QyxtQkFBYyxHQUFkLGNBQWMsQ0FBeUI7UUFGckYsV0FBTSxHQUFHLElBQUks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TSxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUM3QixDQUFDO0FBRUQsaUNBQWlDLFNBQVMsRUFBRSxJQUFJO0lBQzlDLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLFlBQVksdUJBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkUsTUFBTSxDQUFDO0lBQ1QsQ0FBQztJQUVELElBQUksV0FBVyxHQUFHLCtCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3JELEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzVDLElBQUksVUFBVSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVoQyxFQUFFLENBQUMsQ0FBQyxVQUFVLFlBQVksK0JBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sSUFBSSwwQkFBYSxDQUNuQix3Q0FBcUMsSUFBSSxnREFBMEMsQ0FBQyxDQUFDO1lBQzNGLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3RXcmFwcGVyLCBNYXAsIE1hcFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1Byb21pc2VXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7XG4gIGlzUHJlc2VudCxcbiAgaXNBcnJheSxcbiAgaXNCbGFuayxcbiAgaXNUeXBlLFxuICBpc1N0cmluZyxcbiAgaXNTdHJpbmdNYXAsXG4gIFR5cGUsXG4gIFN0cmluZ1dyYXBwZXIsXG4gIE1hdGgsXG4gIGdldFR5cGVOYW1lRm9yRGVidWdnaW5nLFxuICBDT05TVF9FWFBSXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0luamVjdGFibGUsIEluamVjdCwgT3BhcXVlVG9rZW4sIENvbXBvbmVudEZhY3Rvcnl9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5pbXBvcnQge1xuICBSb3V0ZUNvbmZpZyxcbiAgQXN5bmNSb3V0ZSxcbiAgUm91dGUsXG4gIEF1eFJvdXRlLFxuICBSZWRpcmVjdCxcbiAgUm91dGVEZWZpbml0aW9uXG59IGZyb20gJy4vcm91dGVfY29uZmlnL3JvdXRlX2NvbmZpZ19pbXBsJztcbmltcG9ydCB7UGF0aE1hdGNoLCBSZWRpcmVjdE1hdGNoLCBSb3V0ZU1hdGNofSBmcm9tICcuL3J1bGVzL3J1bGVzJztcbmltcG9ydCB7UnVsZVNldH0gZnJvbSAnLi9ydWxlcy9ydWxlX3NldCc7XG5pbXBvcnQge1xuICBJbnN0cnVjdGlvbixcbiAgUmVzb2x2ZWRJbnN0cnVjdGlvbixcbiAgUmVkaXJlY3RJbnN0cnVjdGlvbixcbiAgVW5yZXNvbHZlZEluc3RydWN0aW9uLFxuICBEZWZhdWx0SW5zdHJ1Y3Rpb25cbn0gZnJvbSAnLi9pbnN0cnVjdGlvbic7XG5cbmltcG9ydCB7bm9ybWFsaXplUm91dGVDb25maWcsIGFzc2VydENvbXBvbmVudEV4aXN0c30gZnJvbSAnLi9yb3V0ZV9jb25maWcvcm91dGVfY29uZmlnX25vcm1hbGl6ZXInO1xuaW1wb3J0IHtwYXJzZXIsIFVybCwgY29udmVydFVybFBhcmFtc1RvQXJyYXksIHBhdGhTZWdtZW50c1RvVXJsfSBmcm9tICcuL3VybF9wYXJzZXInO1xuaW1wb3J0IHtHZW5lcmF0ZWRVcmx9IGZyb20gJy4vcnVsZXMvcm91dGVfcGF0aHMvcm91dGVfcGF0aCc7XG5pbXBvcnQge2dldENvbXBvbmVudEFubm90YXRpb25zLCBnZXRDb21wb25lbnRUeXBlfSBmcm9tICcuL3V0aWxzJztcblxudmFyIF9yZXNvbHZlVG9OdWxsID0gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZTxJbnN0cnVjdGlvbj4obnVsbCk7XG5cbi8vIEEgTGlua0l0ZW1BcnJheSBpcyBhbiBhcnJheSwgd2hpY2ggZGVzY3JpYmVzIGEgc2V0IG9mIHJvdXRlc1xuLy8gVGhlIGl0ZW1zIGluIHRoZSBhcnJheSBhcmUgZm91bmQgaW4gZ3JvdXBzOlxuLy8gLSB0aGUgZmlyc3QgaXRlbSBpcyB0aGUgbmFtZSBvZiB0aGUgcm91dGVcbi8vIC0gdGhlIG5leHQgaXRlbXMgYXJlOlxuLy8gICAtIGFuIG9iamVjdCBjb250YWluaW5nIHBhcmFtZXRlcnNcbi8vICAgLSBvciBhbiBhcnJheSBkZXNjcmliaW5nIGFuIGF1eCByb3V0ZVxuLy8gZXhwb3J0IHR5cGUgTGlua1JvdXRlSXRlbSA9IHN0cmluZyB8IE9iamVjdDtcbi8vIGV4cG9ydCB0eXBlIExpbmtJdGVtID0gTGlua1JvdXRlSXRlbSB8IEFycmF5PExpbmtSb3V0ZUl0ZW0+O1xuLy8gZXhwb3J0IHR5cGUgTGlua0l0ZW1BcnJheSA9IEFycmF5PExpbmtJdGVtPjtcblxuLyoqXG4gKiBUb2tlbiB1c2VkIHRvIGJpbmQgdGhlIGNvbXBvbmVudCB3aXRoIHRoZSB0b3AtbGV2ZWwge0BsaW5rIFJvdXRlQ29uZmlnfXMgZm9yIHRoZVxuICogYXBwbGljYXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2lSVVA4QjVPVWJ4Q1dRM0FjSURtKSlcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50fSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7XG4gKiAgIFJPVVRFUl9ESVJFQ1RJVkVTLFxuICogICBST1VURVJfUFJPVklERVJTLFxuICogICBSb3V0ZUNvbmZpZ1xuICogfSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBDb21wb25lbnQoe2RpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU119KVxuICogQFJvdXRlQ29uZmlnKFtcbiAqICB7Li4ufSxcbiAqIF0pXG4gKiBjbGFzcyBBcHBDbXAge1xuICogICAvLyAuLi5cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwQ21wLCBbUk9VVEVSX1BST1ZJREVSU10pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBST1VURVJfUFJJTUFSWV9DT01QT05FTlQ6IE9wYXF1ZVRva2VuID1cbiAgICBDT05TVF9FWFBSKG5ldyBPcGFxdWVUb2tlbignUm91dGVyUHJpbWFyeUNvbXBvbmVudCcpKTtcblxuXG4vKipcbiAqIFRoZSBSb3V0ZVJlZ2lzdHJ5IGhvbGRzIHJvdXRlIGNvbmZpZ3VyYXRpb25zIGZvciBlYWNoIGNvbXBvbmVudCBpbiBhbiBBbmd1bGFyIGFwcC5cbiAqIEl0IGlzIHJlc3BvbnNpYmxlIGZvciBjcmVhdGluZyBJbnN0cnVjdGlvbnMgZnJvbSBVUkxzLCBhbmQgZ2VuZXJhdGluZyBVUkxzIGJhc2VkIG9uIHJvdXRlIGFuZFxuICogcGFyYW1ldGVycy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJvdXRlUmVnaXN0cnkge1xuICBwcml2YXRlIF9ydWxlcyA9IG5ldyBNYXA8YW55LCBSdWxlU2V0PigpO1xuXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoUk9VVEVSX1BSSU1BUllfQ09NUE9ORU5UKSBwcml2YXRlIF9yb290Q29tcG9uZW50OiBUeXBlIHwgQ29tcG9uZW50RmFjdG9yeSkge31cblxuICAvKipcbiAgICogR2l2ZW4gYSBjb21wb25lbnQgYW5kIGEgY29uZmlndXJhdGlvbiBvYmplY3QsIGFkZCB0aGUgcm91dGUgdG8gdGhpcyByZWdpc3RyeVxuICAgKi9cbiAgY29uZmlnKHBhcmVudENvbXBvbmVudDogYW55LCBjb25maWc6IFJvdXRlRGVmaW5pdGlvbik6IHZvaWQge1xuICAgIGNvbmZpZyA9IG5vcm1hbGl6ZVJvdXRlQ29uZmlnKGNvbmZpZywgdGhpcyk7XG5cbiAgICAvLyB0aGlzIGlzIGhlcmUgYmVjYXVzZSBEYXJ0IHR5cGUgZ3VhcmQgcmVhc29uc1xuICAgIGlmIChjb25maWcgaW5zdGFuY2VvZiBSb3V0ZSkge1xuICAgICAgYXNzZXJ0Q29tcG9uZW50RXhpc3RzKGNvbmZpZy5jb21wb25lbnQsIGNvbmZpZy5wYXRoKTtcbiAgICB9IGVsc2UgaWYgKGNvbmZpZyBpbnN0YW5jZW9mIEF1eFJvdXRlKSB7XG4gICAgICBhc3NlcnRDb21wb25lbnRFeGlzdHMoY29uZmlnLmNvbXBvbmVudCwgY29uZmlnLnBhdGgpO1xuICAgIH1cblxuICAgIHZhciBydWxlcyA9IHRoaXMuX3J1bGVzLmdldChwYXJlbnRDb21wb25lbnQpO1xuXG4gICAgaWYgKGlzQmxhbmsocnVsZXMpKSB7XG4gICAgICBydWxlcyA9IG5ldyBSdWxlU2V0KCk7XG4gICAgICB0aGlzLl9ydWxlcy5zZXQocGFyZW50Q29tcG9uZW50LCBydWxlcyk7XG4gICAgfVxuXG4gICAgdmFyIHRlcm1pbmFsID0gcnVsZXMuY29uZmlnKGNvbmZpZyk7XG5cbiAgICBpZiAoY29uZmlnIGluc3RhbmNlb2YgUm91dGUpIHtcbiAgICAgIGlmICh0ZXJtaW5hbCkge1xuICAgICAgICBhc3NlcnRUZXJtaW5hbENvbXBvbmVudChjb25maWcuY29tcG9uZW50LCBjb25maWcucGF0aCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbmZpZ0Zyb21Db21wb25lbnQoY29uZmlnLmNvbXBvbmVudCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlYWRzIHRoZSBhbm5vdGF0aW9ucyBvZiBhIGNvbXBvbmVudCBhbmQgY29uZmlndXJlcyB0aGUgcmVnaXN0cnkgYmFzZWQgb24gdGhlbVxuICAgKi9cbiAgY29uZmlnRnJvbUNvbXBvbmVudChjb21wb25lbnQ6IGFueSk6IHZvaWQge1xuICAgIGlmICghaXNUeXBlKGNvbXBvbmVudCkgJiYgIShjb21wb25lbnQgaW5zdGFuY2VvZiBDb21wb25lbnRGYWN0b3J5KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIERvbid0IHJlYWQgdGhlIGFubm90YXRpb25zIGZyb20gYSB0eXBlIG1vcmUgdGhhbiBvbmNlIOKAk1xuICAgIC8vIHRoaXMgcHJldmVudHMgYW4gaW5maW5pdGUgbG9vcCBpZiBhIGNvbXBvbmVudCByb3V0ZXMgcmVjdXJzaXZlbHkuXG4gICAgaWYgKHRoaXMuX3J1bGVzLmhhcyhjb21wb25lbnQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBhbm5vdGF0aW9ucyA9IGdldENvbXBvbmVudEFubm90YXRpb25zKGNvbXBvbmVudCk7XG4gICAgaWYgKGlzUHJlc2VudChhbm5vdGF0aW9ucykpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYW5ub3RhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGFubm90YXRpb24gPSBhbm5vdGF0aW9uc1tpXTtcblxuICAgICAgICBpZiAoYW5ub3RhdGlvbiBpbnN0YW5jZW9mIFJvdXRlQ29uZmlnKSB7XG4gICAgICAgICAgbGV0IHJvdXRlQ2ZnczogUm91dGVEZWZpbml0aW9uW10gPSBhbm5vdGF0aW9uLmNvbmZpZ3M7XG4gICAgICAgICAgcm91dGVDZmdzLmZvckVhY2goY29uZmlnID0+IHRoaXMuY29uZmlnKGNvbXBvbmVudCwgY29uZmlnKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIFVSTCBhbmQgYSBwYXJlbnQgY29tcG9uZW50LCByZXR1cm4gdGhlIG1vc3Qgc3BlY2lmaWMgaW5zdHJ1Y3Rpb24gZm9yIG5hdmlnYXRpbmdcbiAgICogdGhlIGFwcGxpY2F0aW9uIGludG8gdGhlIHN0YXRlIHNwZWNpZmllZCBieSB0aGUgdXJsXG4gICAqL1xuICByZWNvZ25pemUodXJsOiBzdHJpbmcsIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zOiBJbnN0cnVjdGlvbltdKTogUHJvbWlzZTxJbnN0cnVjdGlvbj4ge1xuICAgIHZhciBwYXJzZWRVcmwgPSBwYXJzZXIucGFyc2UodXJsKTtcbiAgICByZXR1cm4gdGhpcy5fcmVjb2duaXplKHBhcnNlZFVybCwgW10pO1xuICB9XG5cblxuICAvKipcbiAgICogUmVjb2duaXplcyBhbGwgcGFyZW50LWNoaWxkIHJvdXRlcywgYnV0IGNyZWF0ZXMgdW5yZXNvbHZlZCBhdXhpbGlhcnkgcm91dGVzXG4gICAqL1xuICBwcml2YXRlIF9yZWNvZ25pemUocGFyc2VkVXJsOiBVcmwsIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zOiBJbnN0cnVjdGlvbltdLFxuICAgICAgICAgICAgICAgICAgICAgX2F1eCA9IGZhbHNlKTogUHJvbWlzZTxJbnN0cnVjdGlvbj4ge1xuICAgIHZhciBwYXJlbnRJbnN0cnVjdGlvbiA9IExpc3RXcmFwcGVyLmxhc3QoYW5jZXN0b3JJbnN0cnVjdGlvbnMpO1xuICAgIHZhciBwYXJlbnRDb21wb25lbnQgPSBpc1ByZXNlbnQocGFyZW50SW5zdHJ1Y3Rpb24pID8gcGFyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50LmNvbXBvbmVudFR5cGUgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcm9vdENvbXBvbmVudDtcblxuICAgIHZhciBydWxlcyA9IHRoaXMuX3J1bGVzLmdldChwYXJlbnRDb21wb25lbnQpO1xuICAgIGlmIChpc0JsYW5rKHJ1bGVzKSkge1xuICAgICAgcmV0dXJuIF9yZXNvbHZlVG9OdWxsO1xuICAgIH1cblxuICAgIC8vIE1hdGNoZXMgc29tZSBiZWdpbm5pbmcgcGFydCBvZiB0aGUgZ2l2ZW4gVVJMXG4gICAgdmFyIHBvc3NpYmxlTWF0Y2hlczogUHJvbWlzZTxSb3V0ZU1hdGNoPltdID1cbiAgICAgICAgX2F1eCA/IHJ1bGVzLnJlY29nbml6ZUF1eGlsaWFyeShwYXJzZWRVcmwpIDogcnVsZXMucmVjb2duaXplKHBhcnNlZFVybCk7XG5cbiAgICB2YXIgbWF0Y2hQcm9taXNlczogUHJvbWlzZTxJbnN0cnVjdGlvbj5bXSA9IHBvc3NpYmxlTWF0Y2hlcy5tYXAoXG4gICAgICAgIChjYW5kaWRhdGU6IFByb21pc2U8Um91dGVNYXRjaD4pID0+IGNhbmRpZGF0ZS50aGVuKChjYW5kaWRhdGU6IFJvdXRlTWF0Y2gpID0+IHtcblxuICAgICAgICAgIGlmIChjYW5kaWRhdGUgaW5zdGFuY2VvZiBQYXRoTWF0Y2gpIHtcbiAgICAgICAgICAgIHZhciBhdXhQYXJlbnRJbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10gPVxuICAgICAgICAgICAgICAgIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCA+IDAgPyBbTGlzdFdyYXBwZXIubGFzdChhbmNlc3Rvckluc3RydWN0aW9ucyldIDogW107XG4gICAgICAgICAgICB2YXIgYXV4SW5zdHJ1Y3Rpb25zID1cbiAgICAgICAgICAgICAgICB0aGlzLl9hdXhSb3V0ZXNUb1VucmVzb2x2ZWQoY2FuZGlkYXRlLnJlbWFpbmluZ0F1eCwgYXV4UGFyZW50SW5zdHJ1Y3Rpb25zKTtcblxuICAgICAgICAgICAgdmFyIGluc3RydWN0aW9uID0gbmV3IFJlc29sdmVkSW5zdHJ1Y3Rpb24oY2FuZGlkYXRlLmluc3RydWN0aW9uLCBudWxsLCBhdXhJbnN0cnVjdGlvbnMpO1xuXG4gICAgICAgICAgICBpZiAoaXNCbGFuayhjYW5kaWRhdGUuaW5zdHJ1Y3Rpb24pIHx8IGNhbmRpZGF0ZS5pbnN0cnVjdGlvbi50ZXJtaW5hbCkge1xuICAgICAgICAgICAgICByZXR1cm4gaW5zdHJ1Y3Rpb247XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBuZXdBbmNlc3Rvckluc3RydWN0aW9uczogSW5zdHJ1Y3Rpb25bXSA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmNvbmNhdChbaW5zdHJ1Y3Rpb25dKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3JlY29nbml6ZShjYW5kaWRhdGUucmVtYWluaW5nLCBuZXdBbmNlc3Rvckluc3RydWN0aW9ucylcbiAgICAgICAgICAgICAgICAudGhlbigoY2hpbGRJbnN0cnVjdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKGlzQmxhbmsoY2hpbGRJbnN0cnVjdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIC8vIHJlZGlyZWN0IGluc3RydWN0aW9ucyBhcmUgYWxyZWFkeSBhYnNvbHV0ZVxuICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkSW5zdHJ1Y3Rpb24gaW5zdGFuY2VvZiBSZWRpcmVjdEluc3RydWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjaGlsZEluc3RydWN0aW9uO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb24uY2hpbGQgPSBjaGlsZEluc3RydWN0aW9uO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RydWN0aW9uO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChjYW5kaWRhdGUgaW5zdGFuY2VvZiBSZWRpcmVjdE1hdGNoKSB7XG4gICAgICAgICAgICB2YXIgaW5zdHJ1Y3Rpb24gPVxuICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGUoY2FuZGlkYXRlLnJlZGlyZWN0VG8sIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmNvbmNhdChbbnVsbF0pKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVkaXJlY3RJbnN0cnVjdGlvbihpbnN0cnVjdGlvbi5jb21wb25lbnQsIGluc3RydWN0aW9uLmNoaWxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RydWN0aW9uLmF1eEluc3RydWN0aW9uLCBjYW5kaWRhdGUuc3BlY2lmaWNpdHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgaWYgKChpc0JsYW5rKHBhcnNlZFVybCkgfHwgcGFyc2VkVXJsLnBhdGggPT0gJycpICYmIHBvc3NpYmxlTWF0Y2hlcy5sZW5ndGggPT0gMCkge1xuICAgICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlc29sdmUodGhpcy5nZW5lcmF0ZURlZmF1bHQocGFyZW50Q29tcG9uZW50KSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLmFsbDxJbnN0cnVjdGlvbj4obWF0Y2hQcm9taXNlcykudGhlbihtb3N0U3BlY2lmaWMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXV4Um91dGVzVG9VbnJlc29sdmVkKGF1eFJvdXRlczogVXJsW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRJbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10pOiB7W2tleTogc3RyaW5nXTogSW5zdHJ1Y3Rpb259IHtcbiAgICB2YXIgdW5yZXNvbHZlZEF1eEluc3RydWN0aW9uczoge1trZXk6IHN0cmluZ106IEluc3RydWN0aW9ufSA9IHt9O1xuXG4gICAgYXV4Um91dGVzLmZvckVhY2goKGF1eFVybDogVXJsKSA9PiB7XG4gICAgICB1bnJlc29sdmVkQXV4SW5zdHJ1Y3Rpb25zW2F1eFVybC5wYXRoXSA9IG5ldyBVbnJlc29sdmVkSW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgKCkgPT4geyByZXR1cm4gdGhpcy5fcmVjb2duaXplKGF1eFVybCwgcGFyZW50SW5zdHJ1Y3Rpb25zLCB0cnVlKTsgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdW5yZXNvbHZlZEF1eEluc3RydWN0aW9ucztcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgbm9ybWFsaXplZCBsaXN0IHdpdGggY29tcG9uZW50IG5hbWVzIGFuZCBwYXJhbXMgbGlrZTogYFsndXNlcicsIHtpZDogMyB9XWBcbiAgICogZ2VuZXJhdGVzIGEgdXJsIHdpdGggYSBsZWFkaW5nIHNsYXNoIHJlbGF0aXZlIHRvIHRoZSBwcm92aWRlZCBgcGFyZW50Q29tcG9uZW50YC5cbiAgICpcbiAgICogSWYgdGhlIG9wdGlvbmFsIHBhcmFtIGBfYXV4YCBpcyBgdHJ1ZWAsIHRoZW4gd2UgZ2VuZXJhdGUgc3RhcnRpbmcgYXQgYW4gYXV4aWxpYXJ5XG4gICAqIHJvdXRlIGJvdW5kYXJ5LlxuICAgKi9cbiAgZ2VuZXJhdGUobGlua1BhcmFtczogYW55W10sIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zOiBJbnN0cnVjdGlvbltdLCBfYXV4ID0gZmFsc2UpOiBJbnN0cnVjdGlvbiB7XG4gICAgdmFyIHBhcmFtcyA9IHNwbGl0QW5kRmxhdHRlbkxpbmtQYXJhbXMobGlua1BhcmFtcyk7XG4gICAgdmFyIHByZXZJbnN0cnVjdGlvbjtcblxuICAgIC8vIFRoZSBmaXJzdCBzZWdtZW50IHNob3VsZCBiZSBlaXRoZXIgJy4nIChnZW5lcmF0ZSBmcm9tIHBhcmVudCkgb3IgJycgKGdlbmVyYXRlIGZyb20gcm9vdCkuXG4gICAgLy8gV2hlbiB3ZSBub3JtYWxpemUgYWJvdmUsIHdlIHN0cmlwIGFsbCB0aGUgc2xhc2hlcywgJy4vJyBiZWNvbWVzICcuJyBhbmQgJy8nIGJlY29tZXMgJycuXG4gICAgaWYgKExpc3RXcmFwcGVyLmZpcnN0KHBhcmFtcykgPT0gJycpIHtcbiAgICAgIHBhcmFtcy5zaGlmdCgpO1xuICAgICAgcHJldkluc3RydWN0aW9uID0gTGlzdFdyYXBwZXIuZmlyc3QoYW5jZXN0b3JJbnN0cnVjdGlvbnMpO1xuICAgICAgYW5jZXN0b3JJbnN0cnVjdGlvbnMgPSBbXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJldkluc3RydWN0aW9uID0gYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoID4gMCA/IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLnBvcCgpIDogbnVsbDtcblxuICAgICAgaWYgKExpc3RXcmFwcGVyLmZpcnN0KHBhcmFtcykgPT0gJy4nKSB7XG4gICAgICAgIHBhcmFtcy5zaGlmdCgpO1xuICAgICAgfSBlbHNlIGlmIChMaXN0V3JhcHBlci5maXJzdChwYXJhbXMpID09ICcuLicpIHtcbiAgICAgICAgd2hpbGUgKExpc3RXcmFwcGVyLmZpcnN0KHBhcmFtcykgPT0gJy4uJykge1xuICAgICAgICAgIGlmIChhbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggPD0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgICAgICAgYExpbmsgXCIke0xpc3RXcmFwcGVyLnRvSlNPTihsaW5rUGFyYW1zKX1cIiBoYXMgdG9vIG1hbnkgXCIuLi9cIiBzZWdtZW50cy5gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcHJldkluc3RydWN0aW9uID0gYW5jZXN0b3JJbnN0cnVjdGlvbnMucG9wKCk7XG4gICAgICAgICAgcGFyYW1zID0gTGlzdFdyYXBwZXIuc2xpY2UocGFyYW1zLCAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHdlJ3JlIG9uIHRvIGltcGxpY2l0IGNoaWxkL3NpYmxpbmcgcm91dGVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHdlIG11c3Qgb25seSBwZWFrIGF0IHRoZSBsaW5rIHBhcmFtLCBhbmQgbm90IGNvbnN1bWUgaXRcbiAgICAgICAgbGV0IHJvdXRlTmFtZSA9IExpc3RXcmFwcGVyLmZpcnN0KHBhcmFtcyk7XG4gICAgICAgIGxldCBwYXJlbnRDb21wb25lbnRUeXBlID0gdGhpcy5fcm9vdENvbXBvbmVudDtcbiAgICAgICAgbGV0IGdyYW5kcGFyZW50Q29tcG9uZW50VHlwZSA9IG51bGw7XG5cbiAgICAgICAgaWYgKGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICBsZXQgcGFyZW50Q29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBhbmNlc3Rvckluc3RydWN0aW9uc1thbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICBsZXQgZ3JhbmRDb21wb25lbnRJbnN0cnVjdGlvbiA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zW2FuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCAtIDJdO1xuXG4gICAgICAgICAgcGFyZW50Q29tcG9uZW50VHlwZSA9IHBhcmVudENvbXBvbmVudEluc3RydWN0aW9uLmNvbXBvbmVudC5jb21wb25lbnRUeXBlO1xuICAgICAgICAgIGdyYW5kcGFyZW50Q29tcG9uZW50VHlwZSA9IGdyYW5kQ29tcG9uZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50LmNvbXBvbmVudFR5cGU7XG4gICAgICAgIH0gZWxzZSBpZiAoYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICBwYXJlbnRDb21wb25lbnRUeXBlID0gYW5jZXN0b3JJbnN0cnVjdGlvbnNbMF0uY29tcG9uZW50LmNvbXBvbmVudFR5cGU7XG4gICAgICAgICAgZ3JhbmRwYXJlbnRDb21wb25lbnRUeXBlID0gdGhpcy5fcm9vdENvbXBvbmVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZvciBhIGxpbmsgd2l0aCBubyBsZWFkaW5nIGAuL2AsIGAvYCwgb3IgYC4uL2AsIHdlIGxvb2sgZm9yIGEgc2libGluZyBhbmQgY2hpbGQuXG4gICAgICAgIC8vIElmIGJvdGggZXhpc3QsIHdlIHRocm93LiBPdGhlcndpc2UsIHdlIHByZWZlciB3aGljaGV2ZXIgZXhpc3RzLlxuICAgICAgICB2YXIgY2hpbGRSb3V0ZUV4aXN0cyA9IHRoaXMuaGFzUm91dGUocm91dGVOYW1lLCBwYXJlbnRDb21wb25lbnRUeXBlKTtcbiAgICAgICAgdmFyIHBhcmVudFJvdXRlRXhpc3RzID0gaXNQcmVzZW50KGdyYW5kcGFyZW50Q29tcG9uZW50VHlwZSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oYXNSb3V0ZShyb3V0ZU5hbWUsIGdyYW5kcGFyZW50Q29tcG9uZW50VHlwZSk7XG5cbiAgICAgICAgaWYgKHBhcmVudFJvdXRlRXhpc3RzICYmIGNoaWxkUm91dGVFeGlzdHMpIHtcbiAgICAgICAgICBsZXQgbXNnID1cbiAgICAgICAgICAgICAgYExpbmsgXCIke0xpc3RXcmFwcGVyLnRvSlNPTihsaW5rUGFyYW1zKX1cIiBpcyBhbWJpZ3VvdXMsIHVzZSBcIi4vXCIgb3IgXCIuLi9cIiB0byBkaXNhbWJpZ3VhdGUuYDtcbiAgICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihtc2cpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmVudFJvdXRlRXhpc3RzKSB7XG4gICAgICAgICAgcHJldkluc3RydWN0aW9uID0gYW5jZXN0b3JJbnN0cnVjdGlvbnMucG9wKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocGFyYW1zW3BhcmFtcy5sZW5ndGggLSAxXSA9PSAnJykge1xuICAgICAgcGFyYW1zLnBvcCgpO1xuICAgIH1cblxuICAgIGlmIChwYXJhbXMubGVuZ3RoID4gMCAmJiBwYXJhbXNbMF0gPT0gJycpIHtcbiAgICAgIHBhcmFtcy5zaGlmdCgpO1xuICAgIH1cblxuICAgIGlmIChwYXJhbXMubGVuZ3RoIDwgMSkge1xuICAgICAgbGV0IG1zZyA9IGBMaW5rIFwiJHtMaXN0V3JhcHBlci50b0pTT04obGlua1BhcmFtcyl9XCIgbXVzdCBpbmNsdWRlIGEgcm91dGUgbmFtZS5gO1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24obXNnKTtcbiAgICB9XG5cbiAgICB2YXIgZ2VuZXJhdGVkSW5zdHJ1Y3Rpb24gPVxuICAgICAgICB0aGlzLl9nZW5lcmF0ZShwYXJhbXMsIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLCBwcmV2SW5zdHJ1Y3Rpb24sIF9hdXgsIGxpbmtQYXJhbXMpO1xuXG4gICAgLy8gd2UgZG9uJ3QgY2xvbmUgdGhlIGZpcnN0IChyb290KSBlbGVtZW50XG4gICAgZm9yICh2YXIgaSA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBsZXQgYW5jZXN0b3JJbnN0cnVjdGlvbiA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zW2ldO1xuICAgICAgaWYgKGlzQmxhbmsoYW5jZXN0b3JJbnN0cnVjdGlvbikpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBnZW5lcmF0ZWRJbnN0cnVjdGlvbiA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb24ucmVwbGFjZUNoaWxkKGdlbmVyYXRlZEluc3RydWN0aW9uKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2VuZXJhdGVkSW5zdHJ1Y3Rpb247XG4gIH1cblxuXG4gIC8qXG4gICAqIEludGVybmFsIGhlbHBlciB0aGF0IGRvZXMgbm90IG1ha2UgYW55IGFzc2VydGlvbnMgYWJvdXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluayBEU0wuXG4gICAqIGBhbmNlc3Rvckluc3RydWN0aW9uc2AgYXJlIHBhcmVudHMgdGhhdCB3aWxsIGJlIGNsb25lZC5cbiAgICogYHByZXZJbnN0cnVjdGlvbmAgaXMgdGhlIGV4aXN0aW5nIGluc3RydWN0aW9uIHRoYXQgd291bGQgYmUgcmVwbGFjZWQsIGJ1dCB3aGljaCBtaWdodCBoYXZlXG4gICAqIGF1eCByb3V0ZXMgdGhhdCBuZWVkIHRvIGJlIGNsb25lZC5cbiAgICovXG4gIHByaXZhdGUgX2dlbmVyYXRlKGxpbmtQYXJhbXM6IGFueVtdLCBhbmNlc3Rvckluc3RydWN0aW9uczogSW5zdHJ1Y3Rpb25bXSxcbiAgICAgICAgICAgICAgICAgICAgcHJldkluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiwgX2F1eCA9IGZhbHNlLCBfb3JpZ2luYWxMaW5rOiBhbnlbXSk6IEluc3RydWN0aW9uIHtcbiAgICBsZXQgcGFyZW50Q29tcG9uZW50VHlwZSA9IHRoaXMuX3Jvb3RDb21wb25lbnQ7XG4gICAgbGV0IGNvbXBvbmVudEluc3RydWN0aW9uID0gbnVsbDtcbiAgICBsZXQgYXV4SW5zdHJ1Y3Rpb25zOiB7W2tleTogc3RyaW5nXTogSW5zdHJ1Y3Rpb259ID0ge307XG5cbiAgICBsZXQgcGFyZW50SW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uID0gTGlzdFdyYXBwZXIubGFzdChhbmNlc3Rvckluc3RydWN0aW9ucyk7XG4gICAgaWYgKGlzUHJlc2VudChwYXJlbnRJbnN0cnVjdGlvbikgJiYgaXNQcmVzZW50KHBhcmVudEluc3RydWN0aW9uLmNvbXBvbmVudCkpIHtcbiAgICAgIHBhcmVudENvbXBvbmVudFR5cGUgPSBwYXJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnQuY29tcG9uZW50VHlwZTtcbiAgICB9XG5cbiAgICBpZiAobGlua1BhcmFtcy5sZW5ndGggPT0gMCkge1xuICAgICAgbGV0IGRlZmF1bHRJbnN0cnVjdGlvbiA9IHRoaXMuZ2VuZXJhdGVEZWZhdWx0KHBhcmVudENvbXBvbmVudFR5cGUpO1xuICAgICAgaWYgKGlzQmxhbmsoZGVmYXVsdEluc3RydWN0aW9uKSkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgIGBMaW5rIFwiJHtMaXN0V3JhcHBlci50b0pTT04oX29yaWdpbmFsTGluayl9XCIgZG9lcyBub3QgcmVzb2x2ZSB0byBhIHRlcm1pbmFsIGluc3RydWN0aW9uLmApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlZmF1bHRJbnN0cnVjdGlvbjtcbiAgICB9XG5cbiAgICAvLyBmb3Igbm9uLWF1eCByb3V0ZXMsIHdlIHdhbnQgdG8gcmV1c2UgdGhlIHByZWRlY2Vzc29yJ3MgZXhpc3RpbmcgcHJpbWFyeSBhbmQgYXV4IHJvdXRlc1xuICAgIC8vIGFuZCBvbmx5IG92ZXJyaWRlIHJvdXRlcyBmb3Igd2hpY2ggdGhlIGdpdmVuIGxpbmsgRFNMIHByb3ZpZGVzXG4gICAgaWYgKGlzUHJlc2VudChwcmV2SW5zdHJ1Y3Rpb24pICYmICFfYXV4KSB7XG4gICAgICBhdXhJbnN0cnVjdGlvbnMgPSBTdHJpbmdNYXBXcmFwcGVyLm1lcmdlKHByZXZJbnN0cnVjdGlvbi5hdXhJbnN0cnVjdGlvbiwgYXV4SW5zdHJ1Y3Rpb25zKTtcbiAgICAgIGNvbXBvbmVudEluc3RydWN0aW9uID0gcHJldkluc3RydWN0aW9uLmNvbXBvbmVudDtcbiAgICB9XG5cbiAgICB2YXIgcnVsZXMgPSB0aGlzLl9ydWxlcy5nZXQocGFyZW50Q29tcG9uZW50VHlwZSk7XG4gICAgaWYgKGlzQmxhbmsocnVsZXMpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICBgQ29tcG9uZW50IFwiJHtnZXRUeXBlTmFtZUZvckRlYnVnZ2luZyhnZXRDb21wb25lbnRUeXBlKHBhcmVudENvbXBvbmVudFR5cGUpKX1cIiBoYXMgbm8gcm91dGUgY29uZmlnLmApO1xuICAgIH1cblxuICAgIGxldCBsaW5rUGFyYW1JbmRleCA9IDA7XG4gICAgbGV0IHJvdXRlUGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuXG4gICAgLy8gZmlyc3QsIHJlY29nbml6ZSB0aGUgcHJpbWFyeSByb3V0ZSBpZiBvbmUgaXMgcHJvdmlkZWRcbiAgICBpZiAobGlua1BhcmFtSW5kZXggPCBsaW5rUGFyYW1zLmxlbmd0aCAmJiBpc1N0cmluZyhsaW5rUGFyYW1zW2xpbmtQYXJhbUluZGV4XSkpIHtcbiAgICAgIGxldCByb3V0ZU5hbWUgPSBsaW5rUGFyYW1zW2xpbmtQYXJhbUluZGV4XTtcbiAgICAgIGlmIChyb3V0ZU5hbWUgPT0gJycgfHwgcm91dGVOYW1lID09ICcuJyB8fCByb3V0ZU5hbWUgPT0gJy4uJykge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgXCIke3JvdXRlTmFtZX0vXCIgaXMgb25seSBhbGxvd2VkIGF0IHRoZSBiZWdpbm5pbmcgb2YgYSBsaW5rIERTTC5gKTtcbiAgICAgIH1cbiAgICAgIGxpbmtQYXJhbUluZGV4ICs9IDE7XG4gICAgICBpZiAobGlua1BhcmFtSW5kZXggPCBsaW5rUGFyYW1zLmxlbmd0aCkge1xuICAgICAgICBsZXQgbGlua1BhcmFtID0gbGlua1BhcmFtc1tsaW5rUGFyYW1JbmRleF07XG4gICAgICAgIGlmIChpc1N0cmluZ01hcChsaW5rUGFyYW0pICYmICFpc0FycmF5KGxpbmtQYXJhbSkpIHtcbiAgICAgICAgICByb3V0ZVBhcmFtcyA9IGxpbmtQYXJhbTtcbiAgICAgICAgICBsaW5rUGFyYW1JbmRleCArPSAxO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgcm91dGVSZWNvZ25pemVyID0gKF9hdXggPyBydWxlcy5hdXhSdWxlc0J5TmFtZSA6IHJ1bGVzLnJ1bGVzQnlOYW1lKS5nZXQocm91dGVOYW1lKTtcblxuICAgICAgaWYgKGlzQmxhbmsocm91dGVSZWNvZ25pemVyKSkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgIGBDb21wb25lbnQgXCIke2dldFR5cGVOYW1lRm9yRGVidWdnaW5nKGdldENvbXBvbmVudFR5cGUocGFyZW50Q29tcG9uZW50VHlwZSkpfVwiIGhhcyBubyByb3V0ZSBuYW1lZCBcIiR7cm91dGVOYW1lfVwiLmApO1xuICAgICAgfVxuXG4gICAgICAvLyBDcmVhdGUgYW4gXCJ1bnJlc29sdmVkIGluc3RydWN0aW9uXCIgZm9yIGFzeW5jIHJvdXRlc1xuICAgICAgLy8gd2UnbGwgZmlndXJlIG91dCB0aGUgcmVzdCBvZiB0aGUgcm91dGUgd2hlbiB3ZSByZXNvbHZlIHRoZSBpbnN0cnVjdGlvbiBhbmRcbiAgICAgIC8vIHBlcmZvcm0gYSBuYXZpZ2F0aW9uXG4gICAgICBpZiAoaXNCbGFuayhyb3V0ZVJlY29nbml6ZXIuaGFuZGxlci5jb21wb25lbnRUeXBlKSkge1xuICAgICAgICB2YXIgZ2VuZXJhdGVkVXJsOiBHZW5lcmF0ZWRVcmwgPSByb3V0ZVJlY29nbml6ZXIuZ2VuZXJhdGVDb21wb25lbnRQYXRoVmFsdWVzKHJvdXRlUGFyYW1zKTtcbiAgICAgICAgcmV0dXJuIG5ldyBVbnJlc29sdmVkSW5zdHJ1Y3Rpb24oKCkgPT4ge1xuICAgICAgICAgIHJldHVybiByb3V0ZVJlY29nbml6ZXIuaGFuZGxlci5yZXNvbHZlQ29tcG9uZW50VHlwZSgpLnRoZW4oKF8pID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZW5lcmF0ZShsaW5rUGFyYW1zLCBhbmNlc3Rvckluc3RydWN0aW9ucywgcHJldkluc3RydWN0aW9uLCBfYXV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9vcmlnaW5hbExpbmspO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBnZW5lcmF0ZWRVcmwudXJsUGF0aCwgY29udmVydFVybFBhcmFtc1RvQXJyYXkoZ2VuZXJhdGVkVXJsLnVybFBhcmFtcykpO1xuICAgICAgfVxuXG4gICAgICBjb21wb25lbnRJbnN0cnVjdGlvbiA9IF9hdXggPyBydWxlcy5nZW5lcmF0ZUF1eGlsaWFyeShyb3V0ZU5hbWUsIHJvdXRlUGFyYW1zKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlcy5nZW5lcmF0ZShyb3V0ZU5hbWUsIHJvdXRlUGFyYW1zKTtcbiAgICB9XG5cbiAgICAvLyBOZXh0LCByZWNvZ25pemUgYXV4aWxpYXJ5IGluc3RydWN0aW9ucy5cbiAgICAvLyBJZiB3ZSBoYXZlIGFuIGFuY2VzdG9yIGluc3RydWN0aW9uLCB3ZSBwcmVzZXJ2ZSB3aGF0ZXZlciBhdXggcm91dGVzIGFyZSBhY3RpdmUgZnJvbSBpdC5cbiAgICB3aGlsZSAobGlua1BhcmFtSW5kZXggPCBsaW5rUGFyYW1zLmxlbmd0aCAmJiBpc0FycmF5KGxpbmtQYXJhbXNbbGlua1BhcmFtSW5kZXhdKSkge1xuICAgICAgbGV0IGF1eFBhcmVudEluc3RydWN0aW9uOiBJbnN0cnVjdGlvbltdID0gW3BhcmVudEluc3RydWN0aW9uXTtcbiAgICAgIGxldCBhdXhJbnN0cnVjdGlvbiA9IHRoaXMuX2dlbmVyYXRlKGxpbmtQYXJhbXNbbGlua1BhcmFtSW5kZXhdLCBhdXhQYXJlbnRJbnN0cnVjdGlvbiwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRydWUsIF9vcmlnaW5hbExpbmspO1xuXG4gICAgICAvLyBUT0RPOiB0aGlzIHdpbGwgbm90IHdvcmsgZm9yIGF1eCByb3V0ZXMgd2l0aCBwYXJhbWV0ZXJzIG9yIG11bHRpcGxlIHNlZ21lbnRzXG4gICAgICBhdXhJbnN0cnVjdGlvbnNbYXV4SW5zdHJ1Y3Rpb24uY29tcG9uZW50LnVybFBhdGhdID0gYXV4SW5zdHJ1Y3Rpb247XG4gICAgICBsaW5rUGFyYW1JbmRleCArPSAxO1xuICAgIH1cblxuICAgIHZhciBpbnN0cnVjdGlvbiA9IG5ldyBSZXNvbHZlZEluc3RydWN0aW9uKGNvbXBvbmVudEluc3RydWN0aW9uLCBudWxsLCBhdXhJbnN0cnVjdGlvbnMpO1xuXG4gICAgLy8gSWYgdGhlIGNvbXBvbmVudCBpcyBzeW5jLCB3ZSBjYW4gZ2VuZXJhdGUgcmVzb2x2ZWQgY2hpbGQgcm91dGUgaW5zdHJ1Y3Rpb25zXG4gICAgLy8gSWYgbm90LCB3ZSdsbCByZXNvbHZlIHRoZSBpbnN0cnVjdGlvbnMgYXQgbmF2aWdhdGlvbiB0aW1lXG4gICAgaWYgKGlzUHJlc2VudChjb21wb25lbnRJbnN0cnVjdGlvbikgJiYgaXNQcmVzZW50KGNvbXBvbmVudEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGUpKSB7XG4gICAgICBsZXQgY2hpbGRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24gPSBudWxsO1xuICAgICAgaWYgKGNvbXBvbmVudEluc3RydWN0aW9uLnRlcm1pbmFsKSB7XG4gICAgICAgIGlmIChsaW5rUGFyYW1JbmRleCA+PSBsaW5rUGFyYW1zLmxlbmd0aCkge1xuICAgICAgICAgIC8vIFRPRE86IHRocm93IHRoYXQgdGhlcmUgYXJlIGV4dHJhIGxpbmsgcGFyYW1zIGJleW9uZCB0aGUgdGVybWluYWwgY29tcG9uZW50XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBjaGlsZEFuY2VzdG9yQ29tcG9uZW50czogSW5zdHJ1Y3Rpb25bXSA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmNvbmNhdChbaW5zdHJ1Y3Rpb25dKTtcbiAgICAgICAgbGV0IHJlbWFpbmluZ0xpbmtQYXJhbXMgPSBsaW5rUGFyYW1zLnNsaWNlKGxpbmtQYXJhbUluZGV4KTtcbiAgICAgICAgY2hpbGRJbnN0cnVjdGlvbiA9IHRoaXMuX2dlbmVyYXRlKHJlbWFpbmluZ0xpbmtQYXJhbXMsIGNoaWxkQW5jZXN0b3JDb21wb25lbnRzLCBudWxsLCBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9vcmlnaW5hbExpbmspO1xuICAgICAgfVxuICAgICAgaW5zdHJ1Y3Rpb24uY2hpbGQgPSBjaGlsZEluc3RydWN0aW9uO1xuICAgIH1cblxuICAgIHJldHVybiBpbnN0cnVjdGlvbjtcbiAgfVxuXG4gIHB1YmxpYyBoYXNSb3V0ZShuYW1lOiBzdHJpbmcsIHBhcmVudENvbXBvbmVudDogYW55KTogYm9vbGVhbiB7XG4gICAgdmFyIHJ1bGVzID0gdGhpcy5fcnVsZXMuZ2V0KHBhcmVudENvbXBvbmVudCk7XG4gICAgaWYgKGlzQmxhbmsocnVsZXMpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBydWxlcy5oYXNSb3V0ZShuYW1lKTtcbiAgfVxuXG4gIHB1YmxpYyBnZW5lcmF0ZURlZmF1bHQoY29tcG9uZW50Q3Vyc29yOiBUeXBlIHwgQ29tcG9uZW50RmFjdG9yeSk6IEluc3RydWN0aW9uIHtcbiAgICBpZiAoaXNCbGFuayhjb21wb25lbnRDdXJzb3IpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgcnVsZXMgPSB0aGlzLl9ydWxlcy5nZXQoY29tcG9uZW50Q3Vyc29yKTtcbiAgICBpZiAoaXNCbGFuayhydWxlcykgfHwgaXNCbGFuayhydWxlcy5kZWZhdWx0UnVsZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBkZWZhdWx0Q2hpbGQgPSBudWxsO1xuICAgIGlmIChpc1ByZXNlbnQocnVsZXMuZGVmYXVsdFJ1bGUuaGFuZGxlci5jb21wb25lbnRUeXBlKSkge1xuICAgICAgdmFyIGNvbXBvbmVudEluc3RydWN0aW9uID0gcnVsZXMuZGVmYXVsdFJ1bGUuZ2VuZXJhdGUoe30pO1xuICAgICAgaWYgKCFydWxlcy5kZWZhdWx0UnVsZS50ZXJtaW5hbCkge1xuICAgICAgICBkZWZhdWx0Q2hpbGQgPSB0aGlzLmdlbmVyYXRlRGVmYXVsdChydWxlcy5kZWZhdWx0UnVsZS5oYW5kbGVyLmNvbXBvbmVudFR5cGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBEZWZhdWx0SW5zdHJ1Y3Rpb24oY29tcG9uZW50SW5zdHJ1Y3Rpb24sIGRlZmF1bHRDaGlsZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBVbnJlc29sdmVkSW5zdHJ1Y3Rpb24oKCkgPT4ge1xuICAgICAgcmV0dXJuIHJ1bGVzLmRlZmF1bHRSdWxlLmhhbmRsZXIucmVzb2x2ZUNvbXBvbmVudFR5cGUoKS50aGVuKFxuICAgICAgICAgIChfKSA9PiB0aGlzLmdlbmVyYXRlRGVmYXVsdChjb21wb25lbnRDdXJzb3IpKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKlxuICogR2l2ZW46IFsnL2EvYicsIHtjOiAyfV1cbiAqIFJldHVybnM6IFsnJywgJ2EnLCAnYicsIHtjOiAyfV1cbiAqL1xuZnVuY3Rpb24gc3BsaXRBbmRGbGF0dGVuTGlua1BhcmFtcyhsaW5rUGFyYW1zOiBhbnlbXSk6IGFueVtdIHtcbiAgdmFyIGFjY3VtdWxhdGlvbiA9IFtdO1xuICBsaW5rUGFyYW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbTogYW55KSB7XG4gICAgaWYgKGlzU3RyaW5nKGl0ZW0pKSB7XG4gICAgICB2YXIgc3RySXRlbTogc3RyaW5nID0gPHN0cmluZz5pdGVtO1xuICAgICAgYWNjdW11bGF0aW9uID0gYWNjdW11bGF0aW9uLmNvbmNhdChzdHJJdGVtLnNwbGl0KCcvJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhY2N1bXVsYXRpb24ucHVzaChpdGVtKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYWNjdW11bGF0aW9uO1xufVxuXG5cbi8qXG4gKiBHaXZlbiBhIGxpc3Qgb2YgaW5zdHJ1Y3Rpb25zLCByZXR1cm5zIHRoZSBtb3N0IHNwZWNpZmljIGluc3RydWN0aW9uXG4gKi9cbmZ1bmN0aW9uIG1vc3RTcGVjaWZpYyhpbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10pOiBJbnN0cnVjdGlvbiB7XG4gIGluc3RydWN0aW9ucyA9IGluc3RydWN0aW9ucy5maWx0ZXIoKGluc3RydWN0aW9uKSA9PiBpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24pKTtcbiAgaWYgKGluc3RydWN0aW9ucy5sZW5ndGggPT0gMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmIChpbnN0cnVjdGlvbnMubGVuZ3RoID09IDEpIHtcbiAgICByZXR1cm4gaW5zdHJ1Y3Rpb25zWzBdO1xuICB9XG4gIHZhciBmaXJzdCA9IGluc3RydWN0aW9uc1swXTtcbiAgdmFyIHJlc3QgPSBpbnN0cnVjdGlvbnMuc2xpY2UoMSk7XG4gIHJldHVybiByZXN0LnJlZHVjZSgoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLCBjb250ZW5kZXI6IEluc3RydWN0aW9uKSA9PiB7XG4gICAgaWYgKGNvbXBhcmVTcGVjaWZpY2l0eVN0cmluZ3MoY29udGVuZGVyLnNwZWNpZmljaXR5LCBpbnN0cnVjdGlvbi5zcGVjaWZpY2l0eSkgPT0gLTEpIHtcbiAgICAgIHJldHVybiBjb250ZW5kZXI7XG4gICAgfVxuICAgIHJldHVybiBpbnN0cnVjdGlvbjtcbiAgfSwgZmlyc3QpO1xufVxuXG4vKlxuICogRXhwZWN0cyBzdHJpbmdzIHRvIGJlIGluIHRoZSBmb3JtIG9mIFwiWzAtMl0rXCJcbiAqIFJldHVybnMgLTEgaWYgc3RyaW5nIEEgc2hvdWxkIGJlIHNvcnRlZCBhYm92ZSBzdHJpbmcgQiwgMSBpZiBpdCBzaG91bGQgYmUgc29ydGVkIGFmdGVyLFxuICogb3IgMCBpZiB0aGV5IGFyZSB0aGUgc2FtZS5cbiAqL1xuZnVuY3Rpb24gY29tcGFyZVNwZWNpZmljaXR5U3RyaW5ncyhhOiBzdHJpbmcsIGI6IHN0cmluZyk6IG51bWJlciB7XG4gIHZhciBsID0gTWF0aC5taW4oYS5sZW5ndGgsIGIubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpICs9IDEpIHtcbiAgICB2YXIgYWkgPSBTdHJpbmdXcmFwcGVyLmNoYXJDb2RlQXQoYSwgaSk7XG4gICAgdmFyIGJpID0gU3RyaW5nV3JhcHBlci5jaGFyQ29kZUF0KGIsIGkpO1xuICAgIHZhciBkaWZmZXJlbmNlID0gYmkgLSBhaTtcbiAgICBpZiAoZGlmZmVyZW5jZSAhPSAwKSB7XG4gICAgICByZXR1cm4gZGlmZmVyZW5jZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGEubGVuZ3RoIC0gYi5sZW5ndGg7XG59XG5cbmZ1bmN0aW9uIGFzc2VydFRlcm1pbmFsQ29tcG9uZW50KGNvbXBvbmVudCwgcGF0aCkge1xuICBpZiAoIWlzVHlwZShjb21wb25lbnQpICYmICEoY29tcG9uZW50IGluc3RhbmNlb2YgQ29tcG9uZW50RmFjdG9yeSkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgYW5ub3RhdGlvbnMgPSBnZXRDb21wb25lbnRBbm5vdGF0aW9ucyhjb21wb25lbnQpO1xuICBpZiAoaXNQcmVzZW50KGFubm90YXRpb25zKSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYW5ub3RhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBhbm5vdGF0aW9uID0gYW5ub3RhdGlvbnNbaV07XG5cbiAgICAgIGlmIChhbm5vdGF0aW9uIGluc3RhbmNlb2YgUm91dGVDb25maWcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgICBgQ2hpbGQgcm91dGVzIGFyZSBub3QgYWxsb3dlZCBmb3IgXCIke3BhdGh9XCIuIFVzZSBcIi4uLlwiIG9uIHRoZSBwYXJlbnQncyByb3V0ZSBwYXRoLmApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19