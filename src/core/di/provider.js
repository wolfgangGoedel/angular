'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var key_1 = require('./key');
var metadata_1 = require('./metadata');
var exceptions_2 = require('./exceptions');
var forward_ref_1 = require('./forward_ref');
/**
 * `Dependency` is used by the framework to extend DI.
 * This is internal to Angular and should not be used directly.
 */
var Dependency = (function () {
    function Dependency(key, optional, lowerBoundVisibility, upperBoundVisibility, properties) {
        this.key = key;
        this.optional = optional;
        this.lowerBoundVisibility = lowerBoundVisibility;
        this.upperBoundVisibility = upperBoundVisibility;
        this.properties = properties;
    }
    Dependency.fromKey = function (key) { return new Dependency(key, false, null, null, []); };
    return Dependency;
}());
exports.Dependency = Dependency;
var _EMPTY_LIST = lang_1.CONST_EXPR([]);
/**
 * Describes how the {@link Injector} should instantiate a given token.
 *
 * See {@link provide}.
 *
 * ### Example ([live demo](http://plnkr.co/edit/GNAyj6K6PfYg2NBzgwZ5?p%3Dpreview&p=preview))
 *
 * ```javascript
 * var injector = Injector.resolveAndCreate([
 *   new Provider("message", { useValue: 'Hello' })
 * ]);
 *
 * expect(injector.get("message")).toEqual('Hello');
 * ```
 */
var Provider = (function () {
    function Provider(token, _a) {
        var useClass = _a.useClass, useValue = _a.useValue, useExisting = _a.useExisting, useFactory = _a.useFactory, deps = _a.deps, multi = _a.multi;
        this.token = token;
        this.useClass = useClass;
        this.useValue = useValue;
        this.useExisting = useExisting;
        this.useFactory = useFactory;
        this.dependencies = deps;
        this._multi = multi;
    }
    Object.defineProperty(Provider.prototype, "multi", {
        // TODO: Provide a full working example after alpha38 is released.
        /**
         * Creates multiple providers matching the same token (a multi-provider).
         *
         * Multi-providers are used for creating pluggable service, where the system comes
         * with some default providers, and the user can register additional providers.
         * The combination of the default providers and the additional providers will be
         * used to drive the behavior of the system.
         *
         * ### Example
         *
         * ```typescript
         * var injector = Injector.resolveAndCreate([
         *   new Provider("Strings", { useValue: "String1", multi: true}),
         *   new Provider("Strings", { useValue: "String2", multi: true})
         * ]);
         *
         * expect(injector.get("Strings")).toEqual(["String1", "String2"]);
         * ```
         *
         * Multi-providers and regular providers cannot be mixed. The following
         * will throw an exception:
         *
         * ```typescript
         * var injector = Injector.resolveAndCreate([
         *   new Provider("Strings", { useValue: "String1", multi: true }),
         *   new Provider("Strings", { useValue: "String2"})
         * ]);
         * ```
         */
        get: function () { return lang_1.normalizeBool(this._multi); },
        enumerable: true,
        configurable: true
    });
    Provider = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object, Object])
    ], Provider);
    return Provider;
}());
exports.Provider = Provider;
/**
 * See {@link Provider} instead.
 *
 * @deprecated
 */
var Binding = (function (_super) {
    __extends(Binding, _super);
    function Binding(token, _a) {
        var toClass = _a.toClass, toValue = _a.toValue, toAlias = _a.toAlias, toFactory = _a.toFactory, deps = _a.deps, multi = _a.multi;
        _super.call(this, token, {
            useClass: toClass,
            useValue: toValue,
            useExisting: toAlias,
            useFactory: toFactory,
            deps: deps,
            multi: multi
        });
    }
    Object.defineProperty(Binding.prototype, "toClass", {
        /**
         * @deprecated
         */
        get: function () { return this.useClass; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Binding.prototype, "toAlias", {
        /**
         * @deprecated
         */
        get: function () { return this.useExisting; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Binding.prototype, "toFactory", {
        /**
         * @deprecated
         */
        get: function () { return this.useFactory; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Binding.prototype, "toValue", {
        /**
         * @deprecated
         */
        get: function () { return this.useValue; },
        enumerable: true,
        configurable: true
    });
    Binding = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object, Object])
    ], Binding);
    return Binding;
}(Provider));
exports.Binding = Binding;
var ResolvedProvider_ = (function () {
    function ResolvedProvider_(key, resolvedFactories, multiProvider) {
        this.key = key;
        this.resolvedFactories = resolvedFactories;
        this.multiProvider = multiProvider;
    }
    Object.defineProperty(ResolvedProvider_.prototype, "resolvedFactory", {
        get: function () { return this.resolvedFactories[0]; },
        enumerable: true,
        configurable: true
    });
    return ResolvedProvider_;
}());
exports.ResolvedProvider_ = ResolvedProvider_;
/**
 * An internal resolved representation of a factory function created by resolving {@link Provider}.
 */
var ResolvedFactory = (function () {
    function ResolvedFactory(
        /**
         * Factory function which can return an instance of an object represented by a key.
         */
        factory, 
        /**
         * Arguments (dependencies) to the `factory` function.
         */
        dependencies) {
        this.factory = factory;
        this.dependencies = dependencies;
    }
    return ResolvedFactory;
}());
exports.ResolvedFactory = ResolvedFactory;
/**
 * Creates a {@link Provider}.
 *
 * To construct a {@link Provider}, bind a `token` to either a class, a value, a factory function,
 * or
 * to an existing `token`.
 * See {@link ProviderBuilder} for more details.
 *
 * The `token` is most commonly a class or {@link OpaqueToken-class.html}.
 *
 * @deprecated
 */
function bind(token) {
    return new ProviderBuilder(token);
}
exports.bind = bind;
/**
 * Creates a {@link Provider}.
 *
 * See {@link Provider} for more details.
 *
 * <!-- TODO: improve the docs -->
 */
function provide(token, _a) {
    var useClass = _a.useClass, useValue = _a.useValue, useExisting = _a.useExisting, useFactory = _a.useFactory, deps = _a.deps, multi = _a.multi;
    return new Provider(token, {
        useClass: useClass,
        useValue: useValue,
        useExisting: useExisting,
        useFactory: useFactory,
        deps: deps,
        multi: multi
    });
}
exports.provide = provide;
/**
 * Helper class for the {@link bind} function.
 */
var ProviderBuilder = (function () {
    function ProviderBuilder(token) {
        this.token = token;
    }
    /**
     * Binds a DI token to a class.
     *
     * ### Example ([live demo](http://plnkr.co/edit/ZpBCSYqv6e2ud5KXLdxQ?p=preview))
     *
     * Because `toAlias` and `toClass` are often confused, the example contains
     * both use cases for easy comparison.
     *
     * ```typescript
     * class Vehicle {}
     *
     * class Car extends Vehicle {}
     *
     * var injectorClass = Injector.resolveAndCreate([
     *   Car,
     *   provide(Vehicle, {useClass: Car})
     * ]);
     * var injectorAlias = Injector.resolveAndCreate([
     *   Car,
     *   provide(Vehicle, {useExisting: Car})
     * ]);
     *
     * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
     * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
     *
     * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
     * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
     * ```
     */
    ProviderBuilder.prototype.toClass = function (type) {
        if (!lang_1.isType(type)) {
            throw new exceptions_1.BaseException("Trying to create a class provider but \"" + lang_1.stringify(type) + "\" is not a class!");
        }
        return new Provider(this.token, { useClass: type });
    };
    /**
     * Binds a DI token to a value.
     *
     * ### Example ([live demo](http://plnkr.co/edit/G024PFHmDL0cJFgfZK8O?p=preview))
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   provide('message', {useValue: 'Hello'})
     * ]);
     *
     * expect(injector.get('message')).toEqual('Hello');
     * ```
     */
    ProviderBuilder.prototype.toValue = function (value) { return new Provider(this.token, { useValue: value }); };
    /**
     * Binds a DI token to an existing token.
     *
     * Angular will return the same instance as if the provided token was used. (This is
     * in contrast to `useClass` where a separate instance of `useClass` will be returned.)
     *
     * ### Example ([live demo](http://plnkr.co/edit/uBaoF2pN5cfc5AfZapNw?p=preview))
     *
     * Because `toAlias` and `toClass` are often confused, the example contains
     * both use cases for easy comparison.
     *
     * ```typescript
     * class Vehicle {}
     *
     * class Car extends Vehicle {}
     *
     * var injectorAlias = Injector.resolveAndCreate([
     *   Car,
     *   provide(Vehicle, {useExisting: Car})
     * ]);
     * var injectorClass = Injector.resolveAndCreate([
     *   Car,
     *   provide(Vehicle, {useClass: Car})
     * ]);
     *
     * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
     * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
     *
     * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
     * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
     * ```
     */
    ProviderBuilder.prototype.toAlias = function (aliasToken) {
        if (lang_1.isBlank(aliasToken)) {
            throw new exceptions_1.BaseException("Can not alias " + lang_1.stringify(this.token) + " to a blank value!");
        }
        return new Provider(this.token, { useExisting: aliasToken });
    };
    /**
     * Binds a DI token to a function which computes the value.
     *
     * ### Example ([live demo](http://plnkr.co/edit/OejNIfTT3zb1iBxaIYOb?p=preview))
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   provide(Number, {useFactory: () => { return 1+2; }}),
     *   provide(String, {useFactory: (v) => { return "Value: " + v; }, deps: [Number]})
     * ]);
     *
     * expect(injector.get(Number)).toEqual(3);
     * expect(injector.get(String)).toEqual('Value: 3');
     * ```
     */
    ProviderBuilder.prototype.toFactory = function (factory, dependencies) {
        if (!lang_1.isFunction(factory)) {
            throw new exceptions_1.BaseException("Trying to create a factory provider but \"" + lang_1.stringify(factory) + "\" is not a function!");
        }
        return new Provider(this.token, { useFactory: factory, deps: dependencies });
    };
    return ProviderBuilder;
}());
exports.ProviderBuilder = ProviderBuilder;
/**
 * Resolve a single provider.
 */
function resolveFactory(provider) {
    var factoryFn;
    var resolvedDeps;
    if (lang_1.isPresent(provider.useClass)) {
        var useClass = forward_ref_1.resolveForwardRef(provider.useClass);
        factoryFn = reflection_1.reflector.factory(useClass);
        resolvedDeps = _dependenciesFor(useClass);
    }
    else if (lang_1.isPresent(provider.useExisting)) {
        factoryFn = function (aliasInstance) { return aliasInstance; };
        resolvedDeps = [Dependency.fromKey(key_1.Key.get(provider.useExisting))];
    }
    else if (lang_1.isPresent(provider.useFactory)) {
        factoryFn = provider.useFactory;
        resolvedDeps = _constructDependencies(provider.useFactory, provider.dependencies);
    }
    else {
        factoryFn = function () { return provider.useValue; };
        resolvedDeps = _EMPTY_LIST;
    }
    return new ResolvedFactory(factoryFn, resolvedDeps);
}
exports.resolveFactory = resolveFactory;
/**
 * Converts the {@link Provider} into {@link ResolvedProvider}.
 *
 * {@link Injector} internally only uses {@link ResolvedProvider}, {@link Provider} contains
 * convenience provider syntax.
 */
function resolveProvider(provider) {
    return new ResolvedProvider_(key_1.Key.get(provider.token), [resolveFactory(provider)], provider.multi);
}
exports.resolveProvider = resolveProvider;
/**
 * Resolve a list of Providers.
 */
function resolveProviders(providers) {
    var normalized = _normalizeProviders(providers, []);
    var resolved = normalized.map(resolveProvider);
    return collection_1.MapWrapper.values(mergeResolvedProviders(resolved, new Map()));
}
exports.resolveProviders = resolveProviders;
/**
 * Merges a list of ResolvedProviders into a list where
 * each key is contained exactly once and multi providers
 * have been merged.
 */
function mergeResolvedProviders(providers, normalizedProvidersMap) {
    for (var i = 0; i < providers.length; i++) {
        var provider = providers[i];
        var existing = normalizedProvidersMap.get(provider.key.id);
        if (lang_1.isPresent(existing)) {
            if (provider.multiProvider !== existing.multiProvider) {
                throw new exceptions_2.MixingMultiProvidersWithRegularProvidersError(existing, provider);
            }
            if (provider.multiProvider) {
                for (var j = 0; j < provider.resolvedFactories.length; j++) {
                    existing.resolvedFactories.push(provider.resolvedFactories[j]);
                }
            }
            else {
                normalizedProvidersMap.set(provider.key.id, provider);
            }
        }
        else {
            var resolvedProvider;
            if (provider.multiProvider) {
                resolvedProvider = new ResolvedProvider_(provider.key, collection_1.ListWrapper.clone(provider.resolvedFactories), provider.multiProvider);
            }
            else {
                resolvedProvider = provider;
            }
            normalizedProvidersMap.set(provider.key.id, resolvedProvider);
        }
    }
    return normalizedProvidersMap;
}
exports.mergeResolvedProviders = mergeResolvedProviders;
function _normalizeProviders(providers, res) {
    providers.forEach(function (b) {
        if (b instanceof lang_1.Type) {
            res.push(provide(b, { useClass: b }));
        }
        else if (b instanceof Provider) {
            res.push(b);
        }
        else if (b instanceof Array) {
            _normalizeProviders(b, res);
        }
        else if (b instanceof ProviderBuilder) {
            throw new exceptions_2.InvalidProviderError(b.token);
        }
        else {
            throw new exceptions_2.InvalidProviderError(b);
        }
    });
    return res;
}
function _constructDependencies(factoryFunction, dependencies) {
    if (lang_1.isBlank(dependencies)) {
        return _dependenciesFor(factoryFunction);
    }
    else {
        var params = dependencies.map(function (t) { return [t]; });
        return dependencies.map(function (t) { return _extractToken(factoryFunction, t, params); });
    }
}
function _dependenciesFor(typeOrFunc) {
    var params = reflection_1.reflector.parameters(typeOrFunc);
    if (lang_1.isBlank(params))
        return [];
    if (params.some(lang_1.isBlank)) {
        throw new exceptions_2.NoAnnotationError(typeOrFunc, params);
    }
    return params.map(function (p) { return _extractToken(typeOrFunc, p, params); });
}
function _extractToken(typeOrFunc, metadata /*any[] | any*/, params) {
    var depProps = [];
    var token = null;
    var optional = false;
    if (!lang_1.isArray(metadata)) {
        if (metadata instanceof metadata_1.InjectMetadata) {
            return _createDependency(metadata.token, optional, null, null, depProps);
        }
        else {
            return _createDependency(metadata, optional, null, null, depProps);
        }
    }
    var lowerBoundVisibility = null;
    var upperBoundVisibility = null;
    for (var i = 0; i < metadata.length; ++i) {
        var paramMetadata = metadata[i];
        if (paramMetadata instanceof lang_1.Type) {
            token = paramMetadata;
        }
        else if (paramMetadata instanceof metadata_1.InjectMetadata) {
            token = paramMetadata.token;
        }
        else if (paramMetadata instanceof metadata_1.OptionalMetadata) {
            optional = true;
        }
        else if (paramMetadata instanceof metadata_1.SelfMetadata) {
            upperBoundVisibility = paramMetadata;
        }
        else if (paramMetadata instanceof metadata_1.HostMetadata) {
            upperBoundVisibility = paramMetadata;
        }
        else if (paramMetadata instanceof metadata_1.SkipSelfMetadata) {
            lowerBoundVisibility = paramMetadata;
        }
        else if (paramMetadata instanceof metadata_1.DependencyMetadata) {
            if (lang_1.isPresent(paramMetadata.token)) {
                token = paramMetadata.token;
            }
            depProps.push(paramMetadata);
        }
    }
    token = forward_ref_1.resolveForwardRef(token);
    if (lang_1.isPresent(token)) {
        return _createDependency(token, optional, lowerBoundVisibility, upperBoundVisibility, depProps);
    }
    else {
        throw new exceptions_2.NoAnnotationError(typeOrFunc, params);
    }
}
function _createDependency(token, optional, lowerBoundVisibility, upperBoundVisibility, depProps) {
    return new Dependency(key_1.Key.get(token), optional, lowerBoundVisibility, upperBoundVisibility, depProps);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLTlkSGFKZ0s5LnRtcC9hbmd1bGFyMi9zcmMvY29yZS9kaS9wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQkFXTywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xDLDJCQUE4QyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQy9FLDJCQUFzQyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ3ZFLDJCQUF3Qix5Q0FBeUMsQ0FBQyxDQUFBO0FBQ2xFLG9CQUFrQixPQUFPLENBQUMsQ0FBQTtBQUMxQix5QkFRTyxZQUFZLENBQUMsQ0FBQTtBQUNwQiwyQkFJTyxjQUFjLENBQUMsQ0FBQTtBQUN0Qiw0QkFBZ0MsZUFBZSxDQUFDLENBQUE7QUFFaEQ7OztHQUdHO0FBQ0g7SUFDRSxvQkFBbUIsR0FBUSxFQUFTLFFBQWlCLEVBQVMsb0JBQXlCLEVBQ3BFLG9CQUF5QixFQUFTLFVBQWlCO1FBRG5ELFFBQUcsR0FBSCxHQUFHLENBQUs7UUFBUyxhQUFRLEdBQVIsUUFBUSxDQUFTO1FBQVMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFLO1FBQ3BFLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBSztRQUFTLGVBQVUsR0FBVixVQUFVLENBQU87SUFBRyxDQUFDO0lBRW5FLGtCQUFPLEdBQWQsVUFBZSxHQUFRLElBQWdCLE1BQU0sQ0FBQyxJQUFJLFVBQVUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdGLGlCQUFDO0FBQUQsQ0FBQyxBQUxELElBS0M7QUFMWSxrQkFBVSxhQUt0QixDQUFBO0FBRUQsSUFBTSxXQUFXLEdBQUcsaUJBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUVuQzs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQUVIO0lBa0lFLGtCQUFZLEtBQUssRUFBRSxFQU9sQjtZQVBtQixzQkFBUSxFQUFFLHNCQUFRLEVBQUUsNEJBQVcsRUFBRSwwQkFBVSxFQUFFLGNBQUksRUFBRSxnQkFBSztRQVExRSxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUMvQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUN6QixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUN0QixDQUFDO0lBZ0NELHNCQUFJLDJCQUFLO1FBOUJULGtFQUFrRTtRQUNsRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztXQTRCRzthQUNILGNBQXVCLE1BQU0sQ0FBQyxvQkFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBbEw3RDtRQUFDLFlBQUssRUFBRTs7Z0JBQUE7SUFtTFIsZUFBQztBQUFELENBQUMsQUFsTEQsSUFrTEM7QUFsTFksZ0JBQVEsV0FrTHBCLENBQUE7QUFFRDs7OztHQUlHO0FBRUg7SUFBNkIsMkJBQVE7SUFDbkMsaUJBQVksS0FBSyxFQUFFLEVBS2xCO1lBTG1CLG9CQUFPLEVBQUUsb0JBQU8sRUFBRSxvQkFBTyxFQUFFLHdCQUFTLEVBQUUsY0FBSSxFQUFFLGdCQUFLO1FBTW5FLGtCQUFNLEtBQUssRUFBRTtZQUNYLFFBQVEsRUFBRSxPQUFPO1lBQ2pCLFFBQVEsRUFBRSxPQUFPO1lBQ2pCLFdBQVcsRUFBRSxPQUFPO1lBQ3BCLFVBQVUsRUFBRSxTQUFTO1lBQ3JCLElBQUksRUFBRSxJQUFJO1lBQ1YsS0FBSyxFQUFFLEtBQUs7U0FDYixDQUFDLENBQUM7SUFDTCxDQUFDO0lBS0Qsc0JBQUksNEJBQU87UUFIWDs7V0FFRzthQUNILGNBQWdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFLdkMsc0JBQUksNEJBQU87UUFIWDs7V0FFRzthQUNILGNBQWdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFLMUMsc0JBQUksOEJBQVM7UUFIYjs7V0FFRzthQUNILGNBQWtCLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFLM0Msc0JBQUksNEJBQU87UUFIWDs7V0FFRzthQUNILGNBQWdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFwQ3pDO1FBQUMsWUFBSyxFQUFFOztlQUFBO0lBcUNSLGNBQUM7QUFBRCxDQUFDLEFBcENELENBQTZCLFFBQVEsR0FvQ3BDO0FBcENZLGVBQU8sVUFvQ25CLENBQUE7QUEwQ0Q7SUFDRSwyQkFBbUIsR0FBUSxFQUFTLGlCQUFvQyxFQUNyRCxhQUFzQjtRQUR0QixRQUFHLEdBQUgsR0FBRyxDQUFLO1FBQVMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtRQUNyRCxrQkFBYSxHQUFiLGFBQWEsQ0FBUztJQUFHLENBQUM7SUFFN0Msc0JBQUksOENBQWU7YUFBbkIsY0FBeUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBQzlFLHdCQUFDO0FBQUQsQ0FBQyxBQUxELElBS0M7QUFMWSx5QkFBaUIsb0JBSzdCLENBQUE7QUFFRDs7R0FFRztBQUNIO0lBQ0U7UUFDSTs7V0FFRztRQUNJLE9BQWlCO1FBRXhCOztXQUVHO1FBQ0ksWUFBMEI7UUFMMUIsWUFBTyxHQUFQLE9BQU8sQ0FBVTtRQUtqQixpQkFBWSxHQUFaLFlBQVksQ0FBYztJQUFHLENBQUM7SUFDM0Msc0JBQUM7QUFBRCxDQUFDLEFBWEQsSUFXQztBQVhZLHVCQUFlLGtCQVczQixDQUFBO0FBRUQ7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxjQUFxQixLQUFLO0lBQ3hCLE1BQU0sQ0FBQyxJQUFJLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBRmUsWUFBSSxPQUVuQixDQUFBO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsaUJBQXdCLEtBQUssRUFBRSxFQU85QjtRQVArQixzQkFBUSxFQUFFLHNCQUFRLEVBQUUsNEJBQVcsRUFBRSwwQkFBVSxFQUFFLGNBQUksRUFBRSxnQkFBSztJQVF0RixNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsS0FBSyxFQUFFO1FBQ3pCLFFBQVEsRUFBRSxRQUFRO1FBQ2xCLFFBQVEsRUFBRSxRQUFRO1FBQ2xCLFdBQVcsRUFBRSxXQUFXO1FBQ3hCLFVBQVUsRUFBRSxVQUFVO1FBQ3RCLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLEtBQUs7S0FDYixDQUFDLENBQUM7QUFDTCxDQUFDO0FBaEJlLGVBQU8sVUFnQnRCLENBQUE7QUFFRDs7R0FFRztBQUNIO0lBQ0UseUJBQW1CLEtBQUs7UUFBTCxVQUFLLEdBQUwsS0FBSyxDQUFBO0lBQUcsQ0FBQztJQUU1Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQTRCRztJQUNILGlDQUFPLEdBQVAsVUFBUSxJQUFVO1FBQ2hCLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQixNQUFNLElBQUksMEJBQWEsQ0FDbkIsNkNBQTBDLGdCQUFTLENBQUMsSUFBSSxDQUFDLHVCQUFtQixDQUFDLENBQUM7UUFDcEYsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7T0FZRztJQUNILGlDQUFPLEdBQVAsVUFBUSxLQUFVLElBQWMsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBQyxRQUFRLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFckY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0ErQkc7SUFDSCxpQ0FBTyxHQUFQLFVBQVEsVUFBd0I7UUFDOUIsRUFBRSxDQUFDLENBQUMsY0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QixNQUFNLElBQUksMEJBQWEsQ0FBQyxtQkFBaUIsZ0JBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLHVCQUFvQixDQUFDLENBQUM7UUFDdEYsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUMsV0FBVyxFQUFFLFVBQVUsRUFBQyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7OztPQWNHO0lBQ0gsbUNBQVMsR0FBVCxVQUFVLE9BQWlCLEVBQUUsWUFBb0I7UUFDL0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxpQkFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QixNQUFNLElBQUksMEJBQWEsQ0FDbkIsK0NBQTRDLGdCQUFTLENBQUMsT0FBTyxDQUFDLDBCQUFzQixDQUFDLENBQUM7UUFDNUYsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFDLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBQ0gsc0JBQUM7QUFBRCxDQUFDLEFBcEhELElBb0hDO0FBcEhZLHVCQUFlLGtCQW9IM0IsQ0FBQTtBQUVEOztHQUVHO0FBQ0gsd0JBQStCLFFBQWtCO0lBQy9DLElBQUksU0FBbUIsQ0FBQztJQUN4QixJQUFJLFlBQTBCLENBQUM7SUFDL0IsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLElBQUksUUFBUSxHQUFHLCtCQUFpQixDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNwRCxTQUFTLEdBQUcsc0JBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEMsWUFBWSxHQUFHLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNDLFNBQVMsR0FBRyxVQUFDLGFBQWEsSUFBSyxPQUFBLGFBQWEsRUFBYixDQUFhLENBQUM7UUFDN0MsWUFBWSxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxTQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckUsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxnQkFBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUM7UUFDaEMsWUFBWSxHQUFHLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3BGLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLFNBQVMsR0FBRyxjQUFNLE9BQUEsUUFBUSxDQUFDLFFBQVEsRUFBakIsQ0FBaUIsQ0FBQztRQUNwQyxZQUFZLEdBQUcsV0FBVyxDQUFDO0lBQzdCLENBQUM7SUFDRCxNQUFNLENBQUMsSUFBSSxlQUFlLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3RELENBQUM7QUFsQmUsc0JBQWMsaUJBa0I3QixDQUFBO0FBRUQ7Ozs7O0dBS0c7QUFDSCx5QkFBZ0MsUUFBa0I7SUFDaEQsTUFBTSxDQUFDLElBQUksaUJBQWlCLENBQUMsU0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDcEcsQ0FBQztBQUZlLHVCQUFlLGtCQUU5QixDQUFBO0FBRUQ7O0dBRUc7QUFDSCwwQkFBaUMsU0FBeUM7SUFDeEUsSUFBSSxVQUFVLEdBQUcsbUJBQW1CLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3BELElBQUksUUFBUSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDL0MsTUFBTSxDQUFDLHVCQUFVLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxJQUFJLEdBQUcsRUFBNEIsQ0FBQyxDQUFDLENBQUM7QUFDbEcsQ0FBQztBQUplLHdCQUFnQixtQkFJL0IsQ0FBQTtBQUVEOzs7O0dBSUc7QUFDSCxnQ0FDSSxTQUE2QixFQUM3QixzQkFBcUQ7SUFDdkQsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDMUMsSUFBSSxRQUFRLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksUUFBUSxHQUFHLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzNELEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLEtBQUssUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RELE1BQU0sSUFBSSwwREFBNkMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDOUUsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDM0QsUUFBUSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakUsQ0FBQztZQUNILENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixzQkFBc0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDeEQsQ0FBQztRQUNILENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLElBQUksZ0JBQWdCLENBQUM7WUFDckIsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLGdCQUFnQixHQUFHLElBQUksaUJBQWlCLENBQ3BDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsd0JBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzNGLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixnQkFBZ0IsR0FBRyxRQUFRLENBQUM7WUFDOUIsQ0FBQztZQUNELHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7SUFDSCxDQUFDO0lBQ0QsTUFBTSxDQUFDLHNCQUFzQixDQUFDO0FBQ2hDLENBQUM7QUE3QmUsOEJBQXNCLHlCQTZCckMsQ0FBQTtBQUVELDZCQUE2QixTQUEyRCxFQUMzRCxHQUFlO0lBQzFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDO1FBQ2pCLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxXQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7UUFFdEMsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNqQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWQsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQztZQUM5QixtQkFBbUIsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFOUIsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksZUFBZSxDQUFDLENBQUMsQ0FBQztZQUN4QyxNQUFNLElBQUksaUNBQW9CLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTFDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sSUFBSSxpQ0FBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQyxDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLENBQUMsR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUVELGdDQUFnQyxlQUF5QixFQUFFLFlBQW1CO0lBQzVFLEVBQUUsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLElBQUksTUFBTSxHQUFZLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsQ0FBQyxFQUFILENBQUcsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsYUFBYSxDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLEVBQXpDLENBQXlDLENBQUMsQ0FBQztJQUMxRSxDQUFDO0FBQ0gsQ0FBQztBQUVELDBCQUEwQixVQUFVO0lBQ2xDLElBQUksTUFBTSxHQUFZLHNCQUFTLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3ZELEVBQUUsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7SUFDL0IsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekIsTUFBTSxJQUFJLDhCQUFpQixDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQyxDQUFRLElBQUssT0FBQSxhQUFhLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBcEMsQ0FBb0MsQ0FBQyxDQUFDO0FBQ3hFLENBQUM7QUFFRCx1QkFBdUIsVUFBVSxFQUFFLFFBQVEsQ0FBQyxlQUFlLEVBQUUsTUFBZTtJQUMxRSxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7SUFDbEIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ2pCLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztJQUVyQixFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsRUFBRSxDQUFDLENBQUMsUUFBUSxZQUFZLHlCQUFjLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzNFLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDckUsQ0FBQztJQUNILENBQUM7SUFFRCxJQUFJLG9CQUFvQixHQUFHLElBQUksQ0FBQztJQUNoQyxJQUFJLG9CQUFvQixHQUFHLElBQUksQ0FBQztJQUVoQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN6QyxJQUFJLGFBQWEsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFaEMsRUFBRSxDQUFDLENBQUMsYUFBYSxZQUFZLFdBQUksQ0FBQyxDQUFDLENBQUM7WUFDbEMsS0FBSyxHQUFHLGFBQWEsQ0FBQztRQUV4QixDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGFBQWEsWUFBWSx5QkFBYyxDQUFDLENBQUMsQ0FBQztZQUNuRCxLQUFLLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQztRQUU5QixDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGFBQWEsWUFBWSwyQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDckQsUUFBUSxHQUFHLElBQUksQ0FBQztRQUVsQixDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGFBQWEsWUFBWSx1QkFBWSxDQUFDLENBQUMsQ0FBQztZQUNqRCxvQkFBb0IsR0FBRyxhQUFhLENBQUM7UUFFdkMsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxhQUFhLFlBQVksdUJBQVksQ0FBQyxDQUFDLENBQUM7WUFDakQsb0JBQW9CLEdBQUcsYUFBYSxDQUFDO1FBRXZDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsYUFBYSxZQUFZLDJCQUFnQixDQUFDLENBQUMsQ0FBQztZQUNyRCxvQkFBb0IsR0FBRyxhQUFhLENBQUM7UUFFdkMsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxhQUFhLFlBQVksNkJBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkMsS0FBSyxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUM7WUFDOUIsQ0FBQztZQUNELFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDL0IsQ0FBQztJQUNILENBQUM7SUFFRCxLQUFLLEdBQUcsK0JBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFakMsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsb0JBQW9CLEVBQUUsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDbEcsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ04sTUFBTSxJQUFJLDhCQUFpQixDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNsRCxDQUFDO0FBQ0gsQ0FBQztBQUVELDJCQUEyQixLQUFLLEVBQUUsUUFBUSxFQUFFLG9CQUFvQixFQUFFLG9CQUFvQixFQUMzRCxRQUFRO0lBQ2pDLE1BQU0sQ0FBQyxJQUFJLFVBQVUsQ0FBQyxTQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBRSxvQkFBb0IsRUFDcEUsUUFBUSxDQUFDLENBQUM7QUFDbEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIFR5cGUsXG4gIGlzQmxhbmssXG4gIGlzUHJlc2VudCxcbiAgQ09OU1QsXG4gIENPTlNUX0VYUFIsXG4gIHN0cmluZ2lmeSxcbiAgaXNBcnJheSxcbiAgaXNUeXBlLFxuICBpc0Z1bmN0aW9uLFxuICBub3JtYWxpemVCb29sXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge01hcFdyYXBwZXIsIExpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5pbXBvcnQge0tleX0gZnJvbSAnLi9rZXknO1xuaW1wb3J0IHtcbiAgSW5qZWN0TWV0YWRhdGEsXG4gIEluamVjdGFibGVNZXRhZGF0YSxcbiAgT3B0aW9uYWxNZXRhZGF0YSxcbiAgU2VsZk1ldGFkYXRhLFxuICBIb3N0TWV0YWRhdGEsXG4gIFNraXBTZWxmTWV0YWRhdGEsXG4gIERlcGVuZGVuY3lNZXRhZGF0YVxufSBmcm9tICcuL21ldGFkYXRhJztcbmltcG9ydCB7XG4gIE5vQW5ub3RhdGlvbkVycm9yLFxuICBNaXhpbmdNdWx0aVByb3ZpZGVyc1dpdGhSZWd1bGFyUHJvdmlkZXJzRXJyb3IsXG4gIEludmFsaWRQcm92aWRlckVycm9yXG59IGZyb20gJy4vZXhjZXB0aW9ucyc7XG5pbXBvcnQge3Jlc29sdmVGb3J3YXJkUmVmfSBmcm9tICcuL2ZvcndhcmRfcmVmJztcblxuLyoqXG4gKiBgRGVwZW5kZW5jeWAgaXMgdXNlZCBieSB0aGUgZnJhbWV3b3JrIHRvIGV4dGVuZCBESS5cbiAqIFRoaXMgaXMgaW50ZXJuYWwgdG8gQW5ndWxhciBhbmQgc2hvdWxkIG5vdCBiZSB1c2VkIGRpcmVjdGx5LlxuICovXG5leHBvcnQgY2xhc3MgRGVwZW5kZW5jeSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBrZXk6IEtleSwgcHVibGljIG9wdGlvbmFsOiBib29sZWFuLCBwdWJsaWMgbG93ZXJCb3VuZFZpc2liaWxpdHk6IGFueSxcbiAgICAgICAgICAgICAgcHVibGljIHVwcGVyQm91bmRWaXNpYmlsaXR5OiBhbnksIHB1YmxpYyBwcm9wZXJ0aWVzOiBhbnlbXSkge31cblxuICBzdGF0aWMgZnJvbUtleShrZXk6IEtleSk6IERlcGVuZGVuY3kgeyByZXR1cm4gbmV3IERlcGVuZGVuY3koa2V5LCBmYWxzZSwgbnVsbCwgbnVsbCwgW10pOyB9XG59XG5cbmNvbnN0IF9FTVBUWV9MSVNUID0gQ09OU1RfRVhQUihbXSk7XG5cbi8qKlxuICogRGVzY3JpYmVzIGhvdyB0aGUge0BsaW5rIEluamVjdG9yfSBzaG91bGQgaW5zdGFudGlhdGUgYSBnaXZlbiB0b2tlbi5cbiAqXG4gKiBTZWUge0BsaW5rIHByb3ZpZGV9LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9HTkF5ajZLNlBmWWcyTkJ6Z3daNT9wJTNEcHJldmlldyZwPXByZXZpZXcpKVxuICpcbiAqIGBgYGphdmFzY3JpcHRcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICogICBuZXcgUHJvdmlkZXIoXCJtZXNzYWdlXCIsIHsgdXNlVmFsdWU6ICdIZWxsbycgfSlcbiAqIF0pO1xuICpcbiAqIGV4cGVjdChpbmplY3Rvci5nZXQoXCJtZXNzYWdlXCIpKS50b0VxdWFsKCdIZWxsbycpO1xuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgUHJvdmlkZXIge1xuICAvKipcbiAgICogVG9rZW4gdXNlZCB3aGVuIHJldHJpZXZpbmcgdGhpcyBwcm92aWRlci4gVXN1YWxseSwgaXQgaXMgYSB0eXBlIHtAbGluayBUeXBlfS5cbiAgICovXG4gIHRva2VuO1xuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGFuIGltcGxlbWVudGF0aW9uIGNsYXNzLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvUlNURzg2cWdtb3hDeWo5U1dQd1k/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogQmVjYXVzZSBgdXNlRXhpc3RpbmdgIGFuZCBgdXNlQ2xhc3NgIGFyZSBvZnRlbiBjb25mdXNlZCwgdGhlIGV4YW1wbGUgY29udGFpbnNcbiAgICogYm90aCB1c2UgY2FzZXMgZm9yIGVhc3kgY29tcGFyaXNvbi5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjbGFzcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIGNsYXNzIENhciBleHRlbmRzIFZlaGljbGUge31cbiAgICpcbiAgICogdmFyIGluamVjdG9yQ2xhc3MgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgbmV3IFByb3ZpZGVyKFZlaGljbGUsIHsgdXNlQ2xhc3M6IENhciB9KVxuICAgKiBdKTtcbiAgICogdmFyIGluamVjdG9yQWxpYXMgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgbmV3IFByb3ZpZGVyKFZlaGljbGUsIHsgdXNlRXhpc3Rpbmc6IENhciB9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpKS5ub3QudG9CZShpbmplY3RvckNsYXNzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkpLnRvQmUoaW5qZWN0b3JBbGlhcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICogYGBgXG4gICAqL1xuICB1c2VDbGFzczogVHlwZTtcblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhIHZhbHVlLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvVUZWc01WUUlEZTdsNHdhV3ppRVM/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgamF2YXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBuZXcgUHJvdmlkZXIoXCJtZXNzYWdlXCIsIHsgdXNlVmFsdWU6ICdIZWxsbycgfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoXCJtZXNzYWdlXCIpKS50b0VxdWFsKCdIZWxsbycpO1xuICAgKiBgYGBcbiAgICovXG4gIHVzZVZhbHVlO1xuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGFuIGV4aXN0aW5nIHRva2VuLlxuICAgKlxuICAgKiB7QGxpbmsgSW5qZWN0b3J9IHJldHVybnMgdGhlIHNhbWUgaW5zdGFuY2UgYXMgaWYgdGhlIHByb3ZpZGVkIHRva2VuIHdhcyB1c2VkLlxuICAgKiBUaGlzIGlzIGluIGNvbnRyYXN0IHRvIGB1c2VDbGFzc2Agd2hlcmUgYSBzZXBhcmF0ZSBpbnN0YW5jZSBvZiBgdXNlQ2xhc3NgIGlzIHJldHVybmVkLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvUXNhdHNPSko2UDhUMmZNZTlncjg/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogQmVjYXVzZSBgdXNlRXhpc3RpbmdgIGFuZCBgdXNlQ2xhc3NgIGFyZSBvZnRlbiBjb25mdXNlZCB0aGUgZXhhbXBsZSBjb250YWluc1xuICAgKiBib3RoIHVzZSBjYXNlcyBmb3IgZWFzeSBjb21wYXJpc29uLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNsYXNzIFZlaGljbGUge31cbiAgICpcbiAgICogY2xhc3MgQ2FyIGV4dGVuZHMgVmVoaWNsZSB7fVxuICAgKlxuICAgKiB2YXIgaW5qZWN0b3JBbGlhcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBuZXcgUHJvdmlkZXIoVmVoaWNsZSwgeyB1c2VFeGlzdGluZzogQ2FyIH0pXG4gICAqIF0pO1xuICAgKiB2YXIgaW5qZWN0b3JDbGFzcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBuZXcgUHJvdmlkZXIoVmVoaWNsZSwgeyB1c2VDbGFzczogQ2FyIH0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkpLnRvQmUoaW5qZWN0b3JBbGlhcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpKS5ub3QudG9CZShpbmplY3RvckNsYXNzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKiBgYGBcbiAgICovXG4gIHVzZUV4aXN0aW5nO1xuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGEgZnVuY3Rpb24gd2hpY2ggY29tcHV0ZXMgdGhlIHZhbHVlLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvU2NveHkwcEpOcUtHQVBaWTFWVkM/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBuZXcgUHJvdmlkZXIoTnVtYmVyLCB7IHVzZUZhY3Rvcnk6ICgpID0+IHsgcmV0dXJuIDErMjsgfX0pLFxuICAgKiAgIG5ldyBQcm92aWRlcihTdHJpbmcsIHsgdXNlRmFjdG9yeTogKHZhbHVlKSA9PiB7IHJldHVybiBcIlZhbHVlOiBcIiArIHZhbHVlOyB9LFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgZGVwczogW051bWJlcl0gfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoTnVtYmVyKSkudG9FcXVhbCgzKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChTdHJpbmcpKS50b0VxdWFsKCdWYWx1ZTogMycpO1xuICAgKiBgYGBcbiAgICpcbiAgICogVXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIGRlcGVuZGVuY2llcy5cbiAgICovXG4gIHVzZUZhY3Rvcnk6IEZ1bmN0aW9uO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgYSBzZXQgb2YgZGVwZW5kZW5jaWVzXG4gICAqIChhcyBgdG9rZW5gcykgd2hpY2ggc2hvdWxkIGJlIGluamVjdGVkIGludG8gdGhlIGZhY3RvcnkgZnVuY3Rpb24uXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9TY294eTBwSk5xS0dBUFpZMVZWQz9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIG5ldyBQcm92aWRlcihOdW1iZXIsIHsgdXNlRmFjdG9yeTogKCkgPT4geyByZXR1cm4gMSsyOyB9fSksXG4gICAqICAgbmV3IFByb3ZpZGVyKFN0cmluZywgeyB1c2VGYWN0b3J5OiAodmFsdWUpID0+IHsgcmV0dXJuIFwiVmFsdWU6IFwiICsgdmFsdWU7IH0sXG4gICAqICAgICAgICAgICAgICAgICAgICAgICBkZXBzOiBbTnVtYmVyXSB9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChOdW1iZXIpKS50b0VxdWFsKDMpO1xuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KFN0cmluZykpLnRvRXF1YWwoJ1ZhbHVlOiAzJyk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBVc2VkIGluIGNvbmp1bmN0aW9uIHdpdGggYHVzZUZhY3RvcnlgLlxuICAgKi9cbiAgZGVwZW5kZW5jaWVzOiBPYmplY3RbXTtcblxuICAvKiogQGludGVybmFsICovXG4gIF9tdWx0aTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcih0b2tlbiwge3VzZUNsYXNzLCB1c2VWYWx1ZSwgdXNlRXhpc3RpbmcsIHVzZUZhY3RvcnksIGRlcHMsIG11bHRpfToge1xuICAgIHVzZUNsYXNzPzogVHlwZSxcbiAgICB1c2VWYWx1ZT86IGFueSxcbiAgICB1c2VFeGlzdGluZz86IGFueSxcbiAgICB1c2VGYWN0b3J5PzogRnVuY3Rpb24sXG4gICAgZGVwcz86IE9iamVjdFtdLFxuICAgIG11bHRpPzogYm9vbGVhblxuICB9KSB7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuO1xuICAgIHRoaXMudXNlQ2xhc3MgPSB1c2VDbGFzcztcbiAgICB0aGlzLnVzZVZhbHVlID0gdXNlVmFsdWU7XG4gICAgdGhpcy51c2VFeGlzdGluZyA9IHVzZUV4aXN0aW5nO1xuICAgIHRoaXMudXNlRmFjdG9yeSA9IHVzZUZhY3Rvcnk7XG4gICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBkZXBzO1xuICAgIHRoaXMuX211bHRpID0gbXVsdGk7XG4gIH1cblxuICAvLyBUT0RPOiBQcm92aWRlIGEgZnVsbCB3b3JraW5nIGV4YW1wbGUgYWZ0ZXIgYWxwaGEzOCBpcyByZWxlYXNlZC5cbiAgLyoqXG4gICAqIENyZWF0ZXMgbXVsdGlwbGUgcHJvdmlkZXJzIG1hdGNoaW5nIHRoZSBzYW1lIHRva2VuIChhIG11bHRpLXByb3ZpZGVyKS5cbiAgICpcbiAgICogTXVsdGktcHJvdmlkZXJzIGFyZSB1c2VkIGZvciBjcmVhdGluZyBwbHVnZ2FibGUgc2VydmljZSwgd2hlcmUgdGhlIHN5c3RlbSBjb21lc1xuICAgKiB3aXRoIHNvbWUgZGVmYXVsdCBwcm92aWRlcnMsIGFuZCB0aGUgdXNlciBjYW4gcmVnaXN0ZXIgYWRkaXRpb25hbCBwcm92aWRlcnMuXG4gICAqIFRoZSBjb21iaW5hdGlvbiBvZiB0aGUgZGVmYXVsdCBwcm92aWRlcnMgYW5kIHRoZSBhZGRpdGlvbmFsIHByb3ZpZGVycyB3aWxsIGJlXG4gICAqIHVzZWQgdG8gZHJpdmUgdGhlIGJlaGF2aW9yIG9mIHRoZSBzeXN0ZW0uXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgbmV3IFByb3ZpZGVyKFwiU3RyaW5nc1wiLCB7IHVzZVZhbHVlOiBcIlN0cmluZzFcIiwgbXVsdGk6IHRydWV9KSxcbiAgICogICBuZXcgUHJvdmlkZXIoXCJTdHJpbmdzXCIsIHsgdXNlVmFsdWU6IFwiU3RyaW5nMlwiLCBtdWx0aTogdHJ1ZX0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KFwiU3RyaW5nc1wiKSkudG9FcXVhbChbXCJTdHJpbmcxXCIsIFwiU3RyaW5nMlwiXSk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBNdWx0aS1wcm92aWRlcnMgYW5kIHJlZ3VsYXIgcHJvdmlkZXJzIGNhbm5vdCBiZSBtaXhlZC4gVGhlIGZvbGxvd2luZ1xuICAgKiB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbjpcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBuZXcgUHJvdmlkZXIoXCJTdHJpbmdzXCIsIHsgdXNlVmFsdWU6IFwiU3RyaW5nMVwiLCBtdWx0aTogdHJ1ZSB9KSxcbiAgICogICBuZXcgUHJvdmlkZXIoXCJTdHJpbmdzXCIsIHsgdXNlVmFsdWU6IFwiU3RyaW5nMlwifSlcbiAgICogXSk7XG4gICAqIGBgYFxuICAgKi9cbiAgZ2V0IG11bHRpKCk6IGJvb2xlYW4geyByZXR1cm4gbm9ybWFsaXplQm9vbCh0aGlzLl9tdWx0aSk7IH1cbn1cblxuLyoqXG4gKiBTZWUge0BsaW5rIFByb3ZpZGVyfSBpbnN0ZWFkLlxuICpcbiAqIEBkZXByZWNhdGVkXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQmluZGluZyBleHRlbmRzIFByb3ZpZGVyIHtcbiAgY29uc3RydWN0b3IodG9rZW4sIHt0b0NsYXNzLCB0b1ZhbHVlLCB0b0FsaWFzLCB0b0ZhY3RvcnksIGRlcHMsIG11bHRpfToge1xuICAgIHRvQ2xhc3M/OiBUeXBlLFxuICAgIHRvVmFsdWU/OiBhbnksXG4gICAgdG9BbGlhcz86IGFueSxcbiAgICB0b0ZhY3Rvcnk6IEZ1bmN0aW9uLCBkZXBzPzogT2JqZWN0W10sIG11bHRpPzogYm9vbGVhblxuICB9KSB7XG4gICAgc3VwZXIodG9rZW4sIHtcbiAgICAgIHVzZUNsYXNzOiB0b0NsYXNzLFxuICAgICAgdXNlVmFsdWU6IHRvVmFsdWUsXG4gICAgICB1c2VFeGlzdGluZzogdG9BbGlhcyxcbiAgICAgIHVzZUZhY3Rvcnk6IHRvRmFjdG9yeSxcbiAgICAgIGRlcHM6IGRlcHMsXG4gICAgICBtdWx0aTogbXVsdGlcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgZ2V0IHRvQ2xhc3MoKSB7IHJldHVybiB0aGlzLnVzZUNsYXNzOyB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBnZXQgdG9BbGlhcygpIHsgcmV0dXJuIHRoaXMudXNlRXhpc3Rpbmc7IH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIGdldCB0b0ZhY3RvcnkoKSB7IHJldHVybiB0aGlzLnVzZUZhY3Rvcnk7IH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIGdldCB0b1ZhbHVlKCkgeyByZXR1cm4gdGhpcy51c2VWYWx1ZTsgfVxufVxuXG4vKipcbiAqIEFuIGludGVybmFsIHJlc29sdmVkIHJlcHJlc2VudGF0aW9uIG9mIGEge0BsaW5rIFByb3ZpZGVyfSB1c2VkIGJ5IHRoZSB7QGxpbmsgSW5qZWN0b3J9LlxuICpcbiAqIEl0IGlzIHVzdWFsbHkgY3JlYXRlZCBhdXRvbWF0aWNhbGx5IGJ5IGBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlYC5cbiAqXG4gKiBJdCBjYW4gYmUgY3JlYXRlZCBtYW51YWxseSwgYXMgZm9sbG93czpcbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvUmZFbmhoOGtVRUkwRzNxc25JZVQ/cCUzRHByZXZpZXcmcD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiB2YXIgcmVzb2x2ZWRQcm92aWRlcnMgPSBJbmplY3Rvci5yZXNvbHZlKFtuZXcgUHJvdmlkZXIoJ21lc3NhZ2UnLCB7dXNlVmFsdWU6ICdIZWxsbyd9KV0pO1xuICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IuZnJvbVJlc29sdmVkUHJvdmlkZXJzKHJlc29sdmVkUHJvdmlkZXJzKTtcbiAqXG4gKiBleHBlY3QoaW5qZWN0b3IuZ2V0KCdtZXNzYWdlJykpLnRvRXF1YWwoJ0hlbGxvJyk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZXNvbHZlZFByb3ZpZGVyIHtcbiAgLyoqXG4gICAqIEEga2V5LCB1c3VhbGx5IGEgYFR5cGVgLlxuICAgKi9cbiAga2V5OiBLZXk7XG5cbiAgLyoqXG4gICAqIEZhY3RvcnkgZnVuY3Rpb24gd2hpY2ggY2FuIHJldHVybiBhbiBpbnN0YW5jZSBvZiBhbiBvYmplY3QgcmVwcmVzZW50ZWQgYnkgYSBrZXkuXG4gICAqL1xuICByZXNvbHZlZEZhY3RvcmllczogUmVzb2x2ZWRGYWN0b3J5W107XG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyBpZiB0aGUgcHJvdmlkZXIgaXMgYSBtdWx0aS1wcm92aWRlciBvciBhIHJlZ3VsYXIgcHJvdmlkZXIuXG4gICAqL1xuICBtdWx0aVByb3ZpZGVyOiBib29sZWFuO1xufVxuXG4vKipcbiAqIFNlZSB7QGxpbmsgUmVzb2x2ZWRQcm92aWRlcn0gaW5zdGVhZC5cbiAqXG4gKiBAZGVwcmVjYXRlZFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlc29sdmVkQmluZGluZyBleHRlbmRzIFJlc29sdmVkUHJvdmlkZXIge31cblxuZXhwb3J0IGNsYXNzIFJlc29sdmVkUHJvdmlkZXJfIGltcGxlbWVudHMgUmVzb2x2ZWRCaW5kaW5nIHtcbiAgY29uc3RydWN0b3IocHVibGljIGtleTogS2V5LCBwdWJsaWMgcmVzb2x2ZWRGYWN0b3JpZXM6IFJlc29sdmVkRmFjdG9yeVtdLFxuICAgICAgICAgICAgICBwdWJsaWMgbXVsdGlQcm92aWRlcjogYm9vbGVhbikge31cblxuICBnZXQgcmVzb2x2ZWRGYWN0b3J5KCk6IFJlc29sdmVkRmFjdG9yeSB7IHJldHVybiB0aGlzLnJlc29sdmVkRmFjdG9yaWVzWzBdOyB9XG59XG5cbi8qKlxuICogQW4gaW50ZXJuYWwgcmVzb2x2ZWQgcmVwcmVzZW50YXRpb24gb2YgYSBmYWN0b3J5IGZ1bmN0aW9uIGNyZWF0ZWQgYnkgcmVzb2x2aW5nIHtAbGluayBQcm92aWRlcn0uXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXNvbHZlZEZhY3Rvcnkge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKlxuICAgICAgICogRmFjdG9yeSBmdW5jdGlvbiB3aGljaCBjYW4gcmV0dXJuIGFuIGluc3RhbmNlIG9mIGFuIG9iamVjdCByZXByZXNlbnRlZCBieSBhIGtleS5cbiAgICAgICAqL1xuICAgICAgcHVibGljIGZhY3Rvcnk6IEZ1bmN0aW9uLFxuXG4gICAgICAvKipcbiAgICAgICAqIEFyZ3VtZW50cyAoZGVwZW5kZW5jaWVzKSB0byB0aGUgYGZhY3RvcnlgIGZ1bmN0aW9uLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgZGVwZW5kZW5jaWVzOiBEZXBlbmRlbmN5W10pIHt9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHtAbGluayBQcm92aWRlcn0uXG4gKlxuICogVG8gY29uc3RydWN0IGEge0BsaW5rIFByb3ZpZGVyfSwgYmluZCBhIGB0b2tlbmAgdG8gZWl0aGVyIGEgY2xhc3MsIGEgdmFsdWUsIGEgZmFjdG9yeSBmdW5jdGlvbixcbiAqIG9yXG4gKiB0byBhbiBleGlzdGluZyBgdG9rZW5gLlxuICogU2VlIHtAbGluayBQcm92aWRlckJ1aWxkZXJ9IGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogVGhlIGB0b2tlbmAgaXMgbW9zdCBjb21tb25seSBhIGNsYXNzIG9yIHtAbGluayBPcGFxdWVUb2tlbi1jbGFzcy5odG1sfS5cbiAqXG4gKiBAZGVwcmVjYXRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmluZCh0b2tlbik6IFByb3ZpZGVyQnVpbGRlciB7XG4gIHJldHVybiBuZXcgUHJvdmlkZXJCdWlsZGVyKHRva2VuKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEge0BsaW5rIFByb3ZpZGVyfS5cbiAqXG4gKiBTZWUge0BsaW5rIFByb3ZpZGVyfSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIDwhLS0gVE9ETzogaW1wcm92ZSB0aGUgZG9jcyAtLT5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGUodG9rZW4sIHt1c2VDbGFzcywgdXNlVmFsdWUsIHVzZUV4aXN0aW5nLCB1c2VGYWN0b3J5LCBkZXBzLCBtdWx0aX06IHtcbiAgdXNlQ2xhc3M/OiBUeXBlLFxuICB1c2VWYWx1ZT86IGFueSxcbiAgdXNlRXhpc3Rpbmc/OiBhbnksXG4gIHVzZUZhY3Rvcnk/OiBGdW5jdGlvbixcbiAgZGVwcz86IE9iamVjdFtdLFxuICBtdWx0aT86IGJvb2xlYW5cbn0pOiBQcm92aWRlciB7XG4gIHJldHVybiBuZXcgUHJvdmlkZXIodG9rZW4sIHtcbiAgICB1c2VDbGFzczogdXNlQ2xhc3MsXG4gICAgdXNlVmFsdWU6IHVzZVZhbHVlLFxuICAgIHVzZUV4aXN0aW5nOiB1c2VFeGlzdGluZyxcbiAgICB1c2VGYWN0b3J5OiB1c2VGYWN0b3J5LFxuICAgIGRlcHM6IGRlcHMsXG4gICAgbXVsdGk6IG11bHRpXG4gIH0pO1xufVxuXG4vKipcbiAqIEhlbHBlciBjbGFzcyBmb3IgdGhlIHtAbGluayBiaW5kfSBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFByb3ZpZGVyQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0b2tlbikge31cblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhIGNsYXNzLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvWnBCQ1NZcXY2ZTJ1ZDVLWExkeFE/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogQmVjYXVzZSBgdG9BbGlhc2AgYW5kIGB0b0NsYXNzYCBhcmUgb2Z0ZW4gY29uZnVzZWQsIHRoZSBleGFtcGxlIGNvbnRhaW5zXG4gICAqIGJvdGggdXNlIGNhc2VzIGZvciBlYXN5IGNvbXBhcmlzb24uXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY2xhc3MgVmVoaWNsZSB7fVxuICAgKlxuICAgKiBjbGFzcyBDYXIgZXh0ZW5kcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIHZhciBpbmplY3RvckNsYXNzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIHByb3ZpZGUoVmVoaWNsZSwge3VzZUNsYXNzOiBDYXJ9KVxuICAgKiBdKTtcbiAgICogdmFyIGluamVjdG9yQWxpYXMgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgcHJvdmlkZShWZWhpY2xlLCB7dXNlRXhpc3Rpbmc6IENhcn0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JDbGFzcy5nZXQoVmVoaWNsZSkpLm5vdC50b0JlKGluamVjdG9yQ2xhc3MuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JDbGFzcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSkudG9CZShpbmplY3RvckFsaWFzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKiBgYGBcbiAgICovXG4gIHRvQ2xhc3ModHlwZTogVHlwZSk6IFByb3ZpZGVyIHtcbiAgICBpZiAoIWlzVHlwZSh0eXBlKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgYFRyeWluZyB0byBjcmVhdGUgYSBjbGFzcyBwcm92aWRlciBidXQgXCIke3N0cmluZ2lmeSh0eXBlKX1cIiBpcyBub3QgYSBjbGFzcyFgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm92aWRlcih0aGlzLnRva2VuLCB7dXNlQ2xhc3M6IHR5cGV9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGEgdmFsdWUuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9HMDI0UEZIbURMMGNKRmdmWks4Tz9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIHByb3ZpZGUoJ21lc3NhZ2UnLCB7dXNlVmFsdWU6ICdIZWxsbyd9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yLmdldCgnbWVzc2FnZScpKS50b0VxdWFsKCdIZWxsbycpO1xuICAgKiBgYGBcbiAgICovXG4gIHRvVmFsdWUodmFsdWU6IGFueSk6IFByb3ZpZGVyIHsgcmV0dXJuIG5ldyBQcm92aWRlcih0aGlzLnRva2VuLCB7dXNlVmFsdWU6IHZhbHVlfSk7IH1cblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhbiBleGlzdGluZyB0b2tlbi5cbiAgICpcbiAgICogQW5ndWxhciB3aWxsIHJldHVybiB0aGUgc2FtZSBpbnN0YW5jZSBhcyBpZiB0aGUgcHJvdmlkZWQgdG9rZW4gd2FzIHVzZWQuIChUaGlzIGlzXG4gICAqIGluIGNvbnRyYXN0IHRvIGB1c2VDbGFzc2Agd2hlcmUgYSBzZXBhcmF0ZSBpbnN0YW5jZSBvZiBgdXNlQ2xhc3NgIHdpbGwgYmUgcmV0dXJuZWQuKVxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvdUJhb0YycE41Y2ZjNUFmWmFwTnc/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogQmVjYXVzZSBgdG9BbGlhc2AgYW5kIGB0b0NsYXNzYCBhcmUgb2Z0ZW4gY29uZnVzZWQsIHRoZSBleGFtcGxlIGNvbnRhaW5zXG4gICAqIGJvdGggdXNlIGNhc2VzIGZvciBlYXN5IGNvbXBhcmlzb24uXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY2xhc3MgVmVoaWNsZSB7fVxuICAgKlxuICAgKiBjbGFzcyBDYXIgZXh0ZW5kcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIHZhciBpbmplY3RvckFsaWFzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIHByb3ZpZGUoVmVoaWNsZSwge3VzZUV4aXN0aW5nOiBDYXJ9KVxuICAgKiBdKTtcbiAgICogdmFyIGluamVjdG9yQ2xhc3MgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgcHJvdmlkZShWZWhpY2xlLCB7dXNlQ2xhc3M6IENhcn0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkpLnRvQmUoaW5qZWN0b3JBbGlhcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpKS5ub3QudG9CZShpbmplY3RvckNsYXNzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKiBgYGBcbiAgICovXG4gIHRvQWxpYXMoYWxpYXNUb2tlbjogLypUeXBlKi8gYW55KTogUHJvdmlkZXIge1xuICAgIGlmIChpc0JsYW5rKGFsaWFzVG9rZW4pKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgQ2FuIG5vdCBhbGlhcyAke3N0cmluZ2lmeSh0aGlzLnRva2VuKX0gdG8gYSBibGFuayB2YWx1ZSFgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm92aWRlcih0aGlzLnRva2VuLCB7dXNlRXhpc3Rpbmc6IGFsaWFzVG9rZW59KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGEgZnVuY3Rpb24gd2hpY2ggY29tcHV0ZXMgdGhlIHZhbHVlLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvT2VqTklmVFQzemIxaUJ4YUlZT2I/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBwcm92aWRlKE51bWJlciwge3VzZUZhY3Rvcnk6ICgpID0+IHsgcmV0dXJuIDErMjsgfX0pLFxuICAgKiAgIHByb3ZpZGUoU3RyaW5nLCB7dXNlRmFjdG9yeTogKHYpID0+IHsgcmV0dXJuIFwiVmFsdWU6IFwiICsgdjsgfSwgZGVwczogW051bWJlcl19KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChOdW1iZXIpKS50b0VxdWFsKDMpO1xuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KFN0cmluZykpLnRvRXF1YWwoJ1ZhbHVlOiAzJyk7XG4gICAqIGBgYFxuICAgKi9cbiAgdG9GYWN0b3J5KGZhY3Rvcnk6IEZ1bmN0aW9uLCBkZXBlbmRlbmNpZXM/OiBhbnlbXSk6IFByb3ZpZGVyIHtcbiAgICBpZiAoIWlzRnVuY3Rpb24oZmFjdG9yeSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgIGBUcnlpbmcgdG8gY3JlYXRlIGEgZmFjdG9yeSBwcm92aWRlciBidXQgXCIke3N0cmluZ2lmeShmYWN0b3J5KX1cIiBpcyBub3QgYSBmdW5jdGlvbiFgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm92aWRlcih0aGlzLnRva2VuLCB7dXNlRmFjdG9yeTogZmFjdG9yeSwgZGVwczogZGVwZW5kZW5jaWVzfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXNvbHZlIGEgc2luZ2xlIHByb3ZpZGVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUZhY3RvcnkocHJvdmlkZXI6IFByb3ZpZGVyKTogUmVzb2x2ZWRGYWN0b3J5IHtcbiAgdmFyIGZhY3RvcnlGbjogRnVuY3Rpb247XG4gIHZhciByZXNvbHZlZERlcHM6IERlcGVuZGVuY3lbXTtcbiAgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VDbGFzcykpIHtcbiAgICB2YXIgdXNlQ2xhc3MgPSByZXNvbHZlRm9yd2FyZFJlZihwcm92aWRlci51c2VDbGFzcyk7XG4gICAgZmFjdG9yeUZuID0gcmVmbGVjdG9yLmZhY3RvcnkodXNlQ2xhc3MpO1xuICAgIHJlc29sdmVkRGVwcyA9IF9kZXBlbmRlbmNpZXNGb3IodXNlQ2xhc3MpO1xuICB9IGVsc2UgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VFeGlzdGluZykpIHtcbiAgICBmYWN0b3J5Rm4gPSAoYWxpYXNJbnN0YW5jZSkgPT4gYWxpYXNJbnN0YW5jZTtcbiAgICByZXNvbHZlZERlcHMgPSBbRGVwZW5kZW5jeS5mcm9tS2V5KEtleS5nZXQocHJvdmlkZXIudXNlRXhpc3RpbmcpKV07XG4gIH0gZWxzZSBpZiAoaXNQcmVzZW50KHByb3ZpZGVyLnVzZUZhY3RvcnkpKSB7XG4gICAgZmFjdG9yeUZuID0gcHJvdmlkZXIudXNlRmFjdG9yeTtcbiAgICByZXNvbHZlZERlcHMgPSBfY29uc3RydWN0RGVwZW5kZW5jaWVzKHByb3ZpZGVyLnVzZUZhY3RvcnksIHByb3ZpZGVyLmRlcGVuZGVuY2llcyk7XG4gIH0gZWxzZSB7XG4gICAgZmFjdG9yeUZuID0gKCkgPT4gcHJvdmlkZXIudXNlVmFsdWU7XG4gICAgcmVzb2x2ZWREZXBzID0gX0VNUFRZX0xJU1Q7XG4gIH1cbiAgcmV0dXJuIG5ldyBSZXNvbHZlZEZhY3RvcnkoZmFjdG9yeUZuLCByZXNvbHZlZERlcHMpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIHRoZSB7QGxpbmsgUHJvdmlkZXJ9IGludG8ge0BsaW5rIFJlc29sdmVkUHJvdmlkZXJ9LlxuICpcbiAqIHtAbGluayBJbmplY3Rvcn0gaW50ZXJuYWxseSBvbmx5IHVzZXMge0BsaW5rIFJlc29sdmVkUHJvdmlkZXJ9LCB7QGxpbmsgUHJvdmlkZXJ9IGNvbnRhaW5zXG4gKiBjb252ZW5pZW5jZSBwcm92aWRlciBzeW50YXguXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlUHJvdmlkZXIocHJvdmlkZXI6IFByb3ZpZGVyKTogUmVzb2x2ZWRQcm92aWRlciB7XG4gIHJldHVybiBuZXcgUmVzb2x2ZWRQcm92aWRlcl8oS2V5LmdldChwcm92aWRlci50b2tlbiksIFtyZXNvbHZlRmFjdG9yeShwcm92aWRlcildLCBwcm92aWRlci5tdWx0aSk7XG59XG5cbi8qKlxuICogUmVzb2x2ZSBhIGxpc3Qgb2YgUHJvdmlkZXJzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVByb3ZpZGVycyhwcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPik6IFJlc29sdmVkUHJvdmlkZXJbXSB7XG4gIHZhciBub3JtYWxpemVkID0gX25vcm1hbGl6ZVByb3ZpZGVycyhwcm92aWRlcnMsIFtdKTtcbiAgdmFyIHJlc29sdmVkID0gbm9ybWFsaXplZC5tYXAocmVzb2x2ZVByb3ZpZGVyKTtcbiAgcmV0dXJuIE1hcFdyYXBwZXIudmFsdWVzKG1lcmdlUmVzb2x2ZWRQcm92aWRlcnMocmVzb2x2ZWQsIG5ldyBNYXA8bnVtYmVyLCBSZXNvbHZlZFByb3ZpZGVyPigpKSk7XG59XG5cbi8qKlxuICogTWVyZ2VzIGEgbGlzdCBvZiBSZXNvbHZlZFByb3ZpZGVycyBpbnRvIGEgbGlzdCB3aGVyZVxuICogZWFjaCBrZXkgaXMgY29udGFpbmVkIGV4YWN0bHkgb25jZSBhbmQgbXVsdGkgcHJvdmlkZXJzXG4gKiBoYXZlIGJlZW4gbWVyZ2VkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VSZXNvbHZlZFByb3ZpZGVycyhcbiAgICBwcm92aWRlcnM6IFJlc29sdmVkUHJvdmlkZXJbXSxcbiAgICBub3JtYWxpemVkUHJvdmlkZXJzTWFwOiBNYXA8bnVtYmVyLCBSZXNvbHZlZFByb3ZpZGVyPik6IE1hcDxudW1iZXIsIFJlc29sdmVkUHJvdmlkZXI+IHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm92aWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcHJvdmlkZXIgPSBwcm92aWRlcnNbaV07XG4gICAgdmFyIGV4aXN0aW5nID0gbm9ybWFsaXplZFByb3ZpZGVyc01hcC5nZXQocHJvdmlkZXIua2V5LmlkKTtcbiAgICBpZiAoaXNQcmVzZW50KGV4aXN0aW5nKSkge1xuICAgICAgaWYgKHByb3ZpZGVyLm11bHRpUHJvdmlkZXIgIT09IGV4aXN0aW5nLm11bHRpUHJvdmlkZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IE1peGluZ011bHRpUHJvdmlkZXJzV2l0aFJlZ3VsYXJQcm92aWRlcnNFcnJvcihleGlzdGluZywgcHJvdmlkZXIpO1xuICAgICAgfVxuICAgICAgaWYgKHByb3ZpZGVyLm11bHRpUHJvdmlkZXIpIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBwcm92aWRlci5yZXNvbHZlZEZhY3Rvcmllcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGV4aXN0aW5nLnJlc29sdmVkRmFjdG9yaWVzLnB1c2gocHJvdmlkZXIucmVzb2x2ZWRGYWN0b3JpZXNbal0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub3JtYWxpemVkUHJvdmlkZXJzTWFwLnNldChwcm92aWRlci5rZXkuaWQsIHByb3ZpZGVyKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHJlc29sdmVkUHJvdmlkZXI7XG4gICAgICBpZiAocHJvdmlkZXIubXVsdGlQcm92aWRlcikge1xuICAgICAgICByZXNvbHZlZFByb3ZpZGVyID0gbmV3IFJlc29sdmVkUHJvdmlkZXJfKFxuICAgICAgICAgICAgcHJvdmlkZXIua2V5LCBMaXN0V3JhcHBlci5jbG9uZShwcm92aWRlci5yZXNvbHZlZEZhY3RvcmllcyksIHByb3ZpZGVyLm11bHRpUHJvdmlkZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZWRQcm92aWRlciA9IHByb3ZpZGVyO1xuICAgICAgfVxuICAgICAgbm9ybWFsaXplZFByb3ZpZGVyc01hcC5zZXQocHJvdmlkZXIua2V5LmlkLCByZXNvbHZlZFByb3ZpZGVyKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5vcm1hbGl6ZWRQcm92aWRlcnNNYXA7XG59XG5cbmZ1bmN0aW9uIF9ub3JtYWxpemVQcm92aWRlcnMocHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBQcm92aWRlckJ1aWxkZXIgfCBhbnlbXT4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlczogUHJvdmlkZXJbXSk6IFByb3ZpZGVyW10ge1xuICBwcm92aWRlcnMuZm9yRWFjaChiID0+IHtcbiAgICBpZiAoYiBpbnN0YW5jZW9mIFR5cGUpIHtcbiAgICAgIHJlcy5wdXNoKHByb3ZpZGUoYiwge3VzZUNsYXNzOiBifSkpO1xuXG4gICAgfSBlbHNlIGlmIChiIGluc3RhbmNlb2YgUHJvdmlkZXIpIHtcbiAgICAgIHJlcy5wdXNoKGIpO1xuXG4gICAgfSBlbHNlIGlmIChiIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIF9ub3JtYWxpemVQcm92aWRlcnMoYiwgcmVzKTtcblxuICAgIH0gZWxzZSBpZiAoYiBpbnN0YW5jZW9mIFByb3ZpZGVyQnVpbGRlcikge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQcm92aWRlckVycm9yKGIudG9rZW4pO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUHJvdmlkZXJFcnJvcihiKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIF9jb25zdHJ1Y3REZXBlbmRlbmNpZXMoZmFjdG9yeUZ1bmN0aW9uOiBGdW5jdGlvbiwgZGVwZW5kZW5jaWVzOiBhbnlbXSk6IERlcGVuZGVuY3lbXSB7XG4gIGlmIChpc0JsYW5rKGRlcGVuZGVuY2llcykpIHtcbiAgICByZXR1cm4gX2RlcGVuZGVuY2llc0ZvcihmYWN0b3J5RnVuY3Rpb24pO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJhbXM6IGFueVtdW10gPSBkZXBlbmRlbmNpZXMubWFwKHQgPT4gW3RdKTtcbiAgICByZXR1cm4gZGVwZW5kZW5jaWVzLm1hcCh0ID0+IF9leHRyYWN0VG9rZW4oZmFjdG9yeUZ1bmN0aW9uLCB0LCBwYXJhbXMpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfZGVwZW5kZW5jaWVzRm9yKHR5cGVPckZ1bmMpOiBEZXBlbmRlbmN5W10ge1xuICB2YXIgcGFyYW1zOiBhbnlbXVtdID0gcmVmbGVjdG9yLnBhcmFtZXRlcnModHlwZU9yRnVuYyk7XG4gIGlmIChpc0JsYW5rKHBhcmFtcykpIHJldHVybiBbXTtcbiAgaWYgKHBhcmFtcy5zb21lKGlzQmxhbmspKSB7XG4gICAgdGhyb3cgbmV3IE5vQW5ub3RhdGlvbkVycm9yKHR5cGVPckZ1bmMsIHBhcmFtcyk7XG4gIH1cbiAgcmV0dXJuIHBhcmFtcy5tYXAoKHA6IGFueVtdKSA9PiBfZXh0cmFjdFRva2VuKHR5cGVPckZ1bmMsIHAsIHBhcmFtcykpO1xufVxuXG5mdW5jdGlvbiBfZXh0cmFjdFRva2VuKHR5cGVPckZ1bmMsIG1ldGFkYXRhIC8qYW55W10gfCBhbnkqLywgcGFyYW1zOiBhbnlbXVtdKTogRGVwZW5kZW5jeSB7XG4gIHZhciBkZXBQcm9wcyA9IFtdO1xuICB2YXIgdG9rZW4gPSBudWxsO1xuICB2YXIgb3B0aW9uYWwgPSBmYWxzZTtcblxuICBpZiAoIWlzQXJyYXkobWV0YWRhdGEpKSB7XG4gICAgaWYgKG1ldGFkYXRhIGluc3RhbmNlb2YgSW5qZWN0TWV0YWRhdGEpIHtcbiAgICAgIHJldHVybiBfY3JlYXRlRGVwZW5kZW5jeShtZXRhZGF0YS50b2tlbiwgb3B0aW9uYWwsIG51bGwsIG51bGwsIGRlcFByb3BzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIF9jcmVhdGVEZXBlbmRlbmN5KG1ldGFkYXRhLCBvcHRpb25hbCwgbnVsbCwgbnVsbCwgZGVwUHJvcHMpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBsb3dlckJvdW5kVmlzaWJpbGl0eSA9IG51bGw7XG4gIHZhciB1cHBlckJvdW5kVmlzaWJpbGl0eSA9IG51bGw7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtZXRhZGF0YS5sZW5ndGg7ICsraSkge1xuICAgIHZhciBwYXJhbU1ldGFkYXRhID0gbWV0YWRhdGFbaV07XG5cbiAgICBpZiAocGFyYW1NZXRhZGF0YSBpbnN0YW5jZW9mIFR5cGUpIHtcbiAgICAgIHRva2VuID0gcGFyYW1NZXRhZGF0YTtcblxuICAgIH0gZWxzZSBpZiAocGFyYW1NZXRhZGF0YSBpbnN0YW5jZW9mIEluamVjdE1ldGFkYXRhKSB7XG4gICAgICB0b2tlbiA9IHBhcmFtTWV0YWRhdGEudG9rZW47XG5cbiAgICB9IGVsc2UgaWYgKHBhcmFtTWV0YWRhdGEgaW5zdGFuY2VvZiBPcHRpb25hbE1ldGFkYXRhKSB7XG4gICAgICBvcHRpb25hbCA9IHRydWU7XG5cbiAgICB9IGVsc2UgaWYgKHBhcmFtTWV0YWRhdGEgaW5zdGFuY2VvZiBTZWxmTWV0YWRhdGEpIHtcbiAgICAgIHVwcGVyQm91bmRWaXNpYmlsaXR5ID0gcGFyYW1NZXRhZGF0YTtcblxuICAgIH0gZWxzZSBpZiAocGFyYW1NZXRhZGF0YSBpbnN0YW5jZW9mIEhvc3RNZXRhZGF0YSkge1xuICAgICAgdXBwZXJCb3VuZFZpc2liaWxpdHkgPSBwYXJhbU1ldGFkYXRhO1xuXG4gICAgfSBlbHNlIGlmIChwYXJhbU1ldGFkYXRhIGluc3RhbmNlb2YgU2tpcFNlbGZNZXRhZGF0YSkge1xuICAgICAgbG93ZXJCb3VuZFZpc2liaWxpdHkgPSBwYXJhbU1ldGFkYXRhO1xuXG4gICAgfSBlbHNlIGlmIChwYXJhbU1ldGFkYXRhIGluc3RhbmNlb2YgRGVwZW5kZW5jeU1ldGFkYXRhKSB7XG4gICAgICBpZiAoaXNQcmVzZW50KHBhcmFtTWV0YWRhdGEudG9rZW4pKSB7XG4gICAgICAgIHRva2VuID0gcGFyYW1NZXRhZGF0YS50b2tlbjtcbiAgICAgIH1cbiAgICAgIGRlcFByb3BzLnB1c2gocGFyYW1NZXRhZGF0YSk7XG4gICAgfVxuICB9XG5cbiAgdG9rZW4gPSByZXNvbHZlRm9yd2FyZFJlZih0b2tlbik7XG5cbiAgaWYgKGlzUHJlc2VudCh0b2tlbikpIHtcbiAgICByZXR1cm4gX2NyZWF0ZURlcGVuZGVuY3kodG9rZW4sIG9wdGlvbmFsLCBsb3dlckJvdW5kVmlzaWJpbGl0eSwgdXBwZXJCb3VuZFZpc2liaWxpdHksIGRlcFByb3BzKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgTm9Bbm5vdGF0aW9uRXJyb3IodHlwZU9yRnVuYywgcGFyYW1zKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfY3JlYXRlRGVwZW5kZW5jeSh0b2tlbiwgb3B0aW9uYWwsIGxvd2VyQm91bmRWaXNpYmlsaXR5LCB1cHBlckJvdW5kVmlzaWJpbGl0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcFByb3BzKTogRGVwZW5kZW5jeSB7XG4gIHJldHVybiBuZXcgRGVwZW5kZW5jeShLZXkuZ2V0KHRva2VuKSwgb3B0aW9uYWwsIGxvd2VyQm91bmRWaXNpYmlsaXR5LCB1cHBlckJvdW5kVmlzaWJpbGl0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcFByb3BzKTtcbn1cbiJdfQ==