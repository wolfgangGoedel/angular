var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Type, isBlank, isPresent, CONST, CONST_EXPR, stringify, isArray, isType, isFunction, normalizeBool } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { MapWrapper, ListWrapper } from 'angular2/src/facade/collection';
import { reflector } from 'angular2/src/core/reflection/reflection';
import { Key } from './key';
import { InjectMetadata, OptionalMetadata, SelfMetadata, HostMetadata, SkipSelfMetadata, DependencyMetadata } from './metadata';
import { NoAnnotationError, MixingMultiProvidersWithRegularProvidersError, InvalidProviderError } from './exceptions';
import { resolveForwardRef } from './forward_ref';
/**
 * `Dependency` is used by the framework to extend DI.
 * This is internal to Angular and should not be used directly.
 */
export class Dependency {
    constructor(key, optional, lowerBoundVisibility, upperBoundVisibility, properties) {
        this.key = key;
        this.optional = optional;
        this.lowerBoundVisibility = lowerBoundVisibility;
        this.upperBoundVisibility = upperBoundVisibility;
        this.properties = properties;
    }
    static fromKey(key) { return new Dependency(key, false, null, null, []); }
}
const _EMPTY_LIST = CONST_EXPR([]);
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
export let Provider = class Provider {
    constructor(token, { useClass, useValue, useExisting, useFactory, deps, multi }) {
        this.token = token;
        this.useClass = useClass;
        this.useValue = useValue;
        this.useExisting = useExisting;
        this.useFactory = useFactory;
        this.dependencies = deps;
        this._multi = multi;
    }
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
    get multi() { return normalizeBool(this._multi); }
};
Provider = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object, Object])
], Provider);
/**
 * See {@link Provider} instead.
 *
 * @deprecated
 */
export let Binding = class Binding extends Provider {
    constructor(token, { toClass, toValue, toAlias, toFactory, deps, multi }) {
        super(token, {
            useClass: toClass,
            useValue: toValue,
            useExisting: toAlias,
            useFactory: toFactory,
            deps: deps,
            multi: multi
        });
    }
    /**
     * @deprecated
     */
    get toClass() { return this.useClass; }
    /**
     * @deprecated
     */
    get toAlias() { return this.useExisting; }
    /**
     * @deprecated
     */
    get toFactory() { return this.useFactory; }
    /**
     * @deprecated
     */
    get toValue() { return this.useValue; }
};
Binding = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object, Object])
], Binding);
export class ResolvedProvider_ {
    constructor(key, resolvedFactories, multiProvider) {
        this.key = key;
        this.resolvedFactories = resolvedFactories;
        this.multiProvider = multiProvider;
    }
    get resolvedFactory() { return this.resolvedFactories[0]; }
}
/**
 * An internal resolved representation of a factory function created by resolving {@link Provider}.
 */
export class ResolvedFactory {
    constructor(
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
}
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
export function bind(token) {
    return new ProviderBuilder(token);
}
/**
 * Creates a {@link Provider}.
 *
 * See {@link Provider} for more details.
 *
 * <!-- TODO: improve the docs -->
 */
export function provide(token, { useClass, useValue, useExisting, useFactory, deps, multi }) {
    return new Provider(token, {
        useClass: useClass,
        useValue: useValue,
        useExisting: useExisting,
        useFactory: useFactory,
        deps: deps,
        multi: multi
    });
}
/**
 * Helper class for the {@link bind} function.
 */
export class ProviderBuilder {
    constructor(token) {
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
    toClass(type) {
        if (!isType(type)) {
            throw new BaseException(`Trying to create a class provider but "${stringify(type)}" is not a class!`);
        }
        return new Provider(this.token, { useClass: type });
    }
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
    toValue(value) { return new Provider(this.token, { useValue: value }); }
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
    toAlias(aliasToken) {
        if (isBlank(aliasToken)) {
            throw new BaseException(`Can not alias ${stringify(this.token)} to a blank value!`);
        }
        return new Provider(this.token, { useExisting: aliasToken });
    }
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
    toFactory(factory, dependencies) {
        if (!isFunction(factory)) {
            throw new BaseException(`Trying to create a factory provider but "${stringify(factory)}" is not a function!`);
        }
        return new Provider(this.token, { useFactory: factory, deps: dependencies });
    }
}
/**
 * Resolve a single provider.
 */
export function resolveFactory(provider) {
    var factoryFn;
    var resolvedDeps;
    if (isPresent(provider.useClass)) {
        var useClass = resolveForwardRef(provider.useClass);
        factoryFn = reflector.factory(useClass);
        resolvedDeps = _dependenciesFor(useClass);
    }
    else if (isPresent(provider.useExisting)) {
        factoryFn = (aliasInstance) => aliasInstance;
        resolvedDeps = [Dependency.fromKey(Key.get(provider.useExisting))];
    }
    else if (isPresent(provider.useFactory)) {
        factoryFn = provider.useFactory;
        resolvedDeps = constructDependencies(provider.useFactory, provider.dependencies);
    }
    else {
        factoryFn = () => provider.useValue;
        resolvedDeps = _EMPTY_LIST;
    }
    return new ResolvedFactory(factoryFn, resolvedDeps);
}
/**
 * Converts the {@link Provider} into {@link ResolvedProvider}.
 *
 * {@link Injector} internally only uses {@link ResolvedProvider}, {@link Provider} contains
 * convenience provider syntax.
 */
export function resolveProvider(provider) {
    return new ResolvedProvider_(Key.get(provider.token), [resolveFactory(provider)], provider.multi);
}
/**
 * Resolve a list of Providers.
 */
export function resolveProviders(providers) {
    var normalized = _normalizeProviders(providers, []);
    var resolved = normalized.map(resolveProvider);
    return MapWrapper.values(mergeResolvedProviders(resolved, new Map()));
}
/**
 * Merges a list of ResolvedProviders into a list where
 * each key is contained exactly once and multi providers
 * have been merged.
 */
export function mergeResolvedProviders(providers, normalizedProvidersMap) {
    for (var i = 0; i < providers.length; i++) {
        var provider = providers[i];
        var existing = normalizedProvidersMap.get(provider.key.id);
        if (isPresent(existing)) {
            if (provider.multiProvider !== existing.multiProvider) {
                throw new MixingMultiProvidersWithRegularProvidersError(existing, provider);
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
                resolvedProvider = new ResolvedProvider_(provider.key, ListWrapper.clone(provider.resolvedFactories), provider.multiProvider);
            }
            else {
                resolvedProvider = provider;
            }
            normalizedProvidersMap.set(provider.key.id, resolvedProvider);
        }
    }
    return normalizedProvidersMap;
}
function _normalizeProviders(providers, res) {
    providers.forEach(b => {
        if (b instanceof Type) {
            res.push(provide(b, { useClass: b }));
        }
        else if (b instanceof Provider) {
            res.push(b);
        }
        else if (b instanceof Array) {
            _normalizeProviders(b, res);
        }
        else if (b instanceof ProviderBuilder) {
            throw new InvalidProviderError(b.token);
        }
        else {
            throw new InvalidProviderError(b);
        }
    });
    return res;
}
export function constructDependencies(typeOrFunc, dependencies) {
    if (isBlank(dependencies)) {
        return _dependenciesFor(typeOrFunc);
    }
    else {
        var params = dependencies.map(t => [t]);
        return dependencies.map(t => _extractToken(typeOrFunc, t, params));
    }
}
function _dependenciesFor(typeOrFunc) {
    var params = reflector.parameters(typeOrFunc);
    if (isBlank(params))
        return [];
    if (params.some(isBlank)) {
        throw new NoAnnotationError(typeOrFunc, params);
    }
    return params.map((p) => _extractToken(typeOrFunc, p, params));
}
function _extractToken(typeOrFunc, metadata /*any[] | any*/, params) {
    var depProps = [];
    var token = null;
    var optional = false;
    if (!isArray(metadata)) {
        if (metadata instanceof InjectMetadata) {
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
        if (paramMetadata instanceof Type) {
            token = paramMetadata;
        }
        else if (paramMetadata instanceof InjectMetadata) {
            token = paramMetadata.token;
        }
        else if (paramMetadata instanceof OptionalMetadata) {
            optional = true;
        }
        else if (paramMetadata instanceof SelfMetadata) {
            upperBoundVisibility = paramMetadata;
        }
        else if (paramMetadata instanceof HostMetadata) {
            upperBoundVisibility = paramMetadata;
        }
        else if (paramMetadata instanceof SkipSelfMetadata) {
            lowerBoundVisibility = paramMetadata;
        }
        else if (paramMetadata instanceof DependencyMetadata) {
            if (isPresent(paramMetadata.token)) {
                token = paramMetadata.token;
            }
            depProps.push(paramMetadata);
        }
    }
    token = resolveForwardRef(token);
    if (isPresent(token)) {
        return _createDependency(token, optional, lowerBoundVisibility, upperBoundVisibility, depProps);
    }
    else {
        throw new NoAnnotationError(typeOrFunc, params);
    }
}
function _createDependency(token, optional, lowerBoundVisibility, upperBoundVisibility, depProps) {
    return new Dependency(Key.get(token), optional, lowerBoundVisibility, upperBoundVisibility, depProps);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWZYeWVXTW5wLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9kaS9wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUNMLElBQUksRUFDSixPQUFPLEVBQ1AsU0FBUyxFQUNULEtBQUssRUFDTCxVQUFVLEVBQ1YsU0FBUyxFQUNULE9BQU8sRUFDUCxNQUFNLEVBQ04sVUFBVSxFQUNWLGFBQWEsRUFDZCxNQUFNLDBCQUEwQjtPQUMxQixFQUFDLGFBQWEsRUFBbUIsTUFBTSxnQ0FBZ0M7T0FDdkUsRUFBQyxVQUFVLEVBQUUsV0FBVyxFQUFDLE1BQU0sZ0NBQWdDO09BQy9ELEVBQUMsU0FBUyxFQUFDLE1BQU0seUNBQXlDO09BQzFELEVBQUMsR0FBRyxFQUFDLE1BQU0sT0FBTztPQUNsQixFQUNMLGNBQWMsRUFFZCxnQkFBZ0IsRUFDaEIsWUFBWSxFQUNaLFlBQVksRUFDWixnQkFBZ0IsRUFDaEIsa0JBQWtCLEVBQ25CLE1BQU0sWUFBWTtPQUNaLEVBQ0wsaUJBQWlCLEVBQ2pCLDZDQUE2QyxFQUM3QyxvQkFBb0IsRUFDckIsTUFBTSxjQUFjO09BQ2QsRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGVBQWU7QUFFL0M7OztHQUdHO0FBQ0g7SUFDRSxZQUFtQixHQUFRLEVBQVMsUUFBaUIsRUFBUyxvQkFBeUIsRUFDcEUsb0JBQXlCLEVBQVMsVUFBaUI7UUFEbkQsUUFBRyxHQUFILEdBQUcsQ0FBSztRQUFTLGFBQVEsR0FBUixRQUFRLENBQVM7UUFBUyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQUs7UUFDcEUseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFLO1FBQVMsZUFBVSxHQUFWLFVBQVUsQ0FBTztJQUFHLENBQUM7SUFFMUUsT0FBTyxPQUFPLENBQUMsR0FBUSxJQUFnQixNQUFNLENBQUMsSUFBSSxVQUFV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b0JBQW9CLEVBQzNELFFBQVE7SUFDakMsTUFBTSxDQUFDLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsUUFBUSxFQUFFLG9CQUFvQixFQUFFLG9CQUFvQixFQUNwRSxRQUFRLENBQUMsQ0FBQztBQUNsQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgVHlwZSxcbiAgaXNCbGFuayxcbiAgaXNQcmVzZW50LFxuICBDT05TVCxcbiAgQ09OU1RfRVhQUixcbiAgc3RyaW5naWZ5LFxuICBpc0FycmF5LFxuICBpc1R5cGUsXG4gIGlzRnVuY3Rpb24sXG4gIG5vcm1hbGl6ZUJvb2xcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7TWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge3JlZmxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi9yZWZsZWN0aW9uJztcbmltcG9ydCB7S2V5fSBmcm9tICcuL2tleSc7XG5pbXBvcnQge1xuICBJbmplY3RNZXRhZGF0YSxcbiAgSW5qZWN0YWJsZU1ldGFkYXRhLFxuICBPcHRpb25hbE1ldGFkYXRhLFxuICBTZWxmTWV0YWRhdGEsXG4gIEhvc3RNZXRhZGF0YSxcbiAgU2tpcFNlbGZNZXRhZGF0YSxcbiAgRGVwZW5kZW5jeU1ldGFkYXRhXG59IGZyb20gJy4vbWV0YWRhdGEnO1xuaW1wb3J0IHtcbiAgTm9Bbm5vdGF0aW9uRXJyb3IsXG4gIE1peGluZ011bHRpUHJvdmlkZXJzV2l0aFJlZ3VsYXJQcm92aWRlcnNFcnJvcixcbiAgSW52YWxpZFByb3ZpZGVyRXJyb3Jcbn0gZnJvbSAnLi9leGNlcHRpb25zJztcbmltcG9ydCB7cmVzb2x2ZUZvcndhcmRSZWZ9IGZyb20gJy4vZm9yd2FyZF9yZWYnO1xuXG4vKipcbiAqIGBEZXBlbmRlbmN5YCBpcyB1c2VkIGJ5IHRoZSBmcmFtZXdvcmsgdG8gZXh0ZW5kIERJLlxuICogVGhpcyBpcyBpbnRlcm5hbCB0byBBbmd1bGFyIGFuZCBzaG91bGQgbm90IGJlIHVzZWQgZGlyZWN0bHkuXG4gKi9cbmV4cG9ydCBjbGFzcyBEZXBlbmRlbmN5IHtcbiAgY29uc3RydWN0b3IocHVibGljIGtleTogS2V5LCBwdWJsaWMgb3B0aW9uYWw6IGJvb2xlYW4sIHB1YmxpYyBsb3dlckJvdW5kVmlzaWJpbGl0eTogYW55LFxuICAgICAgICAgICAgICBwdWJsaWMgdXBwZXJCb3VuZFZpc2liaWxpdHk6IGFueSwgcHVibGljIHByb3BlcnRpZXM6IGFueVtdKSB7fVxuXG4gIHN0YXRpYyBmcm9tS2V5KGtleTogS2V5KTogRGVwZW5kZW5jeSB7IHJldHVybiBuZXcgRGVwZW5kZW5jeShrZXksIGZhbHNlLCBudWxsLCBudWxsLCBbXSk7IH1cbn1cblxuY29uc3QgX0VNUFRZX0xJU1QgPSBDT05TVF9FWFBSKFtdKTtcblxuLyoqXG4gKiBEZXNjcmliZXMgaG93IHRoZSB7QGxpbmsgSW5qZWN0b3J9IHNob3VsZCBpbnN0YW50aWF0ZSBhIGdpdmVuIHRva2VuLlxuICpcbiAqIFNlZSB7QGxpbmsgcHJvdmlkZX0uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0dOQXlqNks2UGZZZzJOQnpnd1o1P3AlM0RwcmV2aWV3JnA9cHJldmlldykpXG4gKlxuICogYGBgamF2YXNjcmlwdFxuICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gKiAgIG5ldyBQcm92aWRlcihcIm1lc3NhZ2VcIiwgeyB1c2VWYWx1ZTogJ0hlbGxvJyB9KVxuICogXSk7XG4gKlxuICogZXhwZWN0KGluamVjdG9yLmdldChcIm1lc3NhZ2VcIikpLnRvRXF1YWwoJ0hlbGxvJyk7XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBQcm92aWRlciB7XG4gIC8qKlxuICAgKiBUb2tlbiB1c2VkIHdoZW4gcmV0cmlldmluZyB0aGlzIHByb3ZpZGVyLiBVc3VhbGx5LCBpdCBpcyBhIHR5cGUge0BsaW5rIFR5cGV9LlxuICAgKi9cbiAgdG9rZW47XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYW4gaW1wbGVtZW50YXRpb24gY2xhc3MuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9SU1RHODZxZ21veEN5ajlTV1B3WT9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBCZWNhdXNlIGB1c2VFeGlzdGluZ2AgYW5kIGB1c2VDbGFzc2AgYXJlIG9mdGVuIGNvbmZ1c2VkLCB0aGUgZXhhbXBsZSBjb250YWluc1xuICAgKiBib3RoIHVzZSBjYXNlcyBmb3IgZWFzeSBjb21wYXJpc29uLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNsYXNzIFZlaGljbGUge31cbiAgICpcbiAgICogY2xhc3MgQ2FyIGV4dGVuZHMgVmVoaWNsZSB7fVxuICAgKlxuICAgKiB2YXIgaW5qZWN0b3JDbGFzcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBuZXcgUHJvdmlkZXIoVmVoaWNsZSwgeyB1c2VDbGFzczogQ2FyIH0pXG4gICAqIF0pO1xuICAgKiB2YXIgaW5qZWN0b3JBbGlhcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBuZXcgUHJvdmlkZXIoVmVoaWNsZSwgeyB1c2VFeGlzdGluZzogQ2FyIH0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JDbGFzcy5nZXQoVmVoaWNsZSkpLm5vdC50b0JlKGluamVjdG9yQ2xhc3MuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JDbGFzcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSkudG9CZShpbmplY3RvckFsaWFzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKiBgYGBcbiAgICovXG4gIHVzZUNsYXNzOiBUeXBlO1xuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGEgdmFsdWUuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9VRlZzTVZRSURlN2w0d2FXemlFUz9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGBqYXZhc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIG5ldyBQcm92aWRlcihcIm1lc3NhZ2VcIiwgeyB1c2VWYWx1ZTogJ0hlbGxvJyB9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChcIm1lc3NhZ2VcIikpLnRvRXF1YWwoJ0hlbGxvJyk7XG4gICAqIGBgYFxuICAgKi9cbiAgdXNlVmFsdWU7XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYW4gZXhpc3RpbmcgdG9rZW4uXG4gICAqXG4gICAqIHtAbGluayBJbmplY3Rvcn0gcmV0dXJucyB0aGUgc2FtZSBpbnN0YW5jZSBhcyBpZiB0aGUgcHJvdmlkZWQgdG9rZW4gd2FzIHVzZWQuXG4gICAqIFRoaXMgaXMgaW4gY29udHJhc3QgdG8gYHVzZUNsYXNzYCB3aGVyZSBhIHNlcGFyYXRlIGluc3RhbmNlIG9mIGB1c2VDbGFzc2AgaXMgcmV0dXJuZWQuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9Rc2F0c09KSjZQOFQyZk1lOWdyOD9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBCZWNhdXNlIGB1c2VFeGlzdGluZ2AgYW5kIGB1c2VDbGFzc2AgYXJlIG9mdGVuIGNvbmZ1c2VkIHRoZSBleGFtcGxlIGNvbnRhaW5zXG4gICAqIGJvdGggdXNlIGNhc2VzIGZvciBlYXN5IGNvbXBhcmlzb24uXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY2xhc3MgVmVoaWNsZSB7fVxuICAgKlxuICAgKiBjbGFzcyBDYXIgZXh0ZW5kcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIHZhciBpbmplY3RvckFsaWFzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIG5ldyBQcm92aWRlcihWZWhpY2xlLCB7IHVzZUV4aXN0aW5nOiBDYXIgfSlcbiAgICogXSk7XG4gICAqIHZhciBpbmplY3RvckNsYXNzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIG5ldyBQcm92aWRlcihWZWhpY2xlLCB7IHVzZUNsYXNzOiBDYXIgfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSkudG9CZShpbmplY3RvckFsaWFzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JDbGFzcy5nZXQoVmVoaWNsZSkpLm5vdC50b0JlKGluamVjdG9yQ2xhc3MuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JDbGFzcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqIGBgYFxuICAgKi9cbiAgdXNlRXhpc3Rpbmc7XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYSBmdW5jdGlvbiB3aGljaCBjb21wdXRlcyB0aGUgdmFsdWUuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9TY294eTBwSk5xS0dBUFpZMVZWQz9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIG5ldyBQcm92aWRlcihOdW1iZXIsIHsgdXNlRmFjdG9yeTogKCkgPT4geyByZXR1cm4gMSsyOyB9fSksXG4gICAqICAgbmV3IFByb3ZpZGVyKFN0cmluZywgeyB1c2VGYWN0b3J5OiAodmFsdWUpID0+IHsgcmV0dXJuIFwiVmFsdWU6IFwiICsgdmFsdWU7IH0sXG4gICAqICAgICAgICAgICAgICAgICAgICAgICBkZXBzOiBbTnVtYmVyXSB9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChOdW1iZXIpKS50b0VxdWFsKDMpO1xuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KFN0cmluZykpLnRvRXF1YWwoJ1ZhbHVlOiAzJyk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBVc2VkIGluIGNvbmp1bmN0aW9uIHdpdGggZGVwZW5kZW5jaWVzLlxuICAgKi9cbiAgdXNlRmFjdG9yeTogRnVuY3Rpb247XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllcyBhIHNldCBvZiBkZXBlbmRlbmNpZXNcbiAgICogKGFzIGB0b2tlbmBzKSB3aGljaCBzaG91bGQgYmUgaW5qZWN0ZWQgaW50byB0aGUgZmFjdG9yeSBmdW5jdGlvbi5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1Njb3h5MHBKTnFLR0FQWlkxVlZDP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgbmV3IFByb3ZpZGVyKE51bWJlciwgeyB1c2VGYWN0b3J5OiAoKSA9PiB7IHJldHVybiAxKzI7IH19KSxcbiAgICogICBuZXcgUHJvdmlkZXIoU3RyaW5nLCB7IHVzZUZhY3Rvcnk6ICh2YWx1ZSkgPT4geyByZXR1cm4gXCJWYWx1ZTogXCIgKyB2YWx1ZTsgfSxcbiAgICogICAgICAgICAgICAgICAgICAgICAgIGRlcHM6IFtOdW1iZXJdIH0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KE51bWJlcikpLnRvRXF1YWwoMyk7XG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoU3RyaW5nKSkudG9FcXVhbCgnVmFsdWU6IDMnKTtcbiAgICogYGBgXG4gICAqXG4gICAqIFVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBgdXNlRmFjdG9yeWAuXG4gICAqL1xuICBkZXBlbmRlbmNpZXM6IE9iamVjdFtdO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX211bHRpOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHRva2VuLCB7dXNlQ2xhc3MsIHVzZVZhbHVlLCB1c2VFeGlzdGluZywgdXNlRmFjdG9yeSwgZGVwcywgbXVsdGl9OiB7XG4gICAgdXNlQ2xhc3M/OiBUeXBlLFxuICAgIHVzZVZhbHVlPzogYW55LFxuICAgIHVzZUV4aXN0aW5nPzogYW55LFxuICAgIHVzZUZhY3Rvcnk/OiBGdW5jdGlvbixcbiAgICBkZXBzPzogT2JqZWN0W10sXG4gICAgbXVsdGk/OiBib29sZWFuXG4gIH0pIHtcbiAgICB0aGlzLnRva2VuID0gdG9rZW47XG4gICAgdGhpcy51c2VDbGFzcyA9IHVzZUNsYXNzO1xuICAgIHRoaXMudXNlVmFsdWUgPSB1c2VWYWx1ZTtcbiAgICB0aGlzLnVzZUV4aXN0aW5nID0gdXNlRXhpc3Rpbmc7XG4gICAgdGhpcy51c2VGYWN0b3J5ID0gdXNlRmFjdG9yeTtcbiAgICB0aGlzLmRlcGVuZGVuY2llcyA9IGRlcHM7XG4gICAgdGhpcy5fbXVsdGkgPSBtdWx0aTtcbiAgfVxuXG4gIC8vIFRPRE86IFByb3ZpZGUgYSBmdWxsIHdvcmtpbmcgZXhhbXBsZSBhZnRlciBhbHBoYTM4IGlzIHJlbGVhc2VkLlxuICAvKipcbiAgICogQ3JlYXRlcyBtdWx0aXBsZSBwcm92aWRlcnMgbWF0Y2hpbmcgdGhlIHNhbWUgdG9rZW4gKGEgbXVsdGktcHJvdmlkZXIpLlxuICAgKlxuICAgKiBNdWx0aS1wcm92aWRlcnMgYXJlIHVzZWQgZm9yIGNyZWF0aW5nIHBsdWdnYWJsZSBzZXJ2aWNlLCB3aGVyZSB0aGUgc3lzdGVtIGNvbWVzXG4gICAqIHdpdGggc29tZSBkZWZhdWx0IHByb3ZpZGVycywgYW5kIHRoZSB1c2VyIGNhbiByZWdpc3RlciBhZGRpdGlvbmFsIHByb3ZpZGVycy5cbiAgICogVGhlIGNvbWJpbmF0aW9uIG9mIHRoZSBkZWZhdWx0IHByb3ZpZGVycyBhbmQgdGhlIGFkZGl0aW9uYWwgcHJvdmlkZXJzIHdpbGwgYmVcbiAgICogdXNlZCB0byBkcml2ZSB0aGUgYmVoYXZpb3Igb2YgdGhlIHN5c3RlbS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBuZXcgUHJvdmlkZXIoXCJTdHJpbmdzXCIsIHsgdXNlVmFsdWU6IFwiU3RyaW5nMVwiLCBtdWx0aTogdHJ1ZX0pLFxuICAgKiAgIG5ldyBQcm92aWRlcihcIlN0cmluZ3NcIiwgeyB1c2VWYWx1ZTogXCJTdHJpbmcyXCIsIG11bHRpOiB0cnVlfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoXCJTdHJpbmdzXCIpKS50b0VxdWFsKFtcIlN0cmluZzFcIiwgXCJTdHJpbmcyXCJdKTtcbiAgICogYGBgXG4gICAqXG4gICAqIE11bHRpLXByb3ZpZGVycyBhbmQgcmVndWxhciBwcm92aWRlcnMgY2Fubm90IGJlIG1peGVkLiBUaGUgZm9sbG93aW5nXG4gICAqIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uOlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIG5ldyBQcm92aWRlcihcIlN0cmluZ3NcIiwgeyB1c2VWYWx1ZTogXCJTdHJpbmcxXCIsIG11bHRpOiB0cnVlIH0pLFxuICAgKiAgIG5ldyBQcm92aWRlcihcIlN0cmluZ3NcIiwgeyB1c2VWYWx1ZTogXCJTdHJpbmcyXCJ9KVxuICAgKiBdKTtcbiAgICogYGBgXG4gICAqL1xuICBnZXQgbXVsdGkoKTogYm9vbGVhbiB7IHJldHVybiBub3JtYWxpemVCb29sKHRoaXMuX211bHRpKTsgfVxufVxuXG4vKipcbiAqIFNlZSB7QGxpbmsgUHJvdmlkZXJ9IGluc3RlYWQuXG4gKlxuICogQGRlcHJlY2F0ZWRcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBCaW5kaW5nIGV4dGVuZHMgUHJvdmlkZXIge1xuICBjb25zdHJ1Y3Rvcih0b2tlbiwge3RvQ2xhc3MsIHRvVmFsdWUsIHRvQWxpYXMsIHRvRmFjdG9yeSwgZGVwcywgbXVsdGl9OiB7XG4gICAgdG9DbGFzcz86IFR5cGUsXG4gICAgdG9WYWx1ZT86IGFueSxcbiAgICB0b0FsaWFzPzogYW55LFxuICAgIHRvRmFjdG9yeTogRnVuY3Rpb24sIGRlcHM/OiBPYmplY3RbXSwgbXVsdGk/OiBib29sZWFuXG4gIH0pIHtcbiAgICBzdXBlcih0b2tlbiwge1xuICAgICAgdXNlQ2xhc3M6IHRvQ2xhc3MsXG4gICAgICB1c2VWYWx1ZTogdG9WYWx1ZSxcbiAgICAgIHVzZUV4aXN0aW5nOiB0b0FsaWFzLFxuICAgICAgdXNlRmFjdG9yeTogdG9GYWN0b3J5LFxuICAgICAgZGVwczogZGVwcyxcbiAgICAgIG11bHRpOiBtdWx0aVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBnZXQgdG9DbGFzcygpIHsgcmV0dXJuIHRoaXMudXNlQ2xhc3M7IH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIGdldCB0b0FsaWFzKCkgeyByZXR1cm4gdGhpcy51c2VFeGlzdGluZzsgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgZ2V0IHRvRmFjdG9yeSgpIHsgcmV0dXJuIHRoaXMudXNlRmFjdG9yeTsgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgZ2V0IHRvVmFsdWUoKSB7IHJldHVybiB0aGlzLnVzZVZhbHVlOyB9XG59XG5cbi8qKlxuICogQW4gaW50ZXJuYWwgcmVzb2x2ZWQgcmVwcmVzZW50YXRpb24gb2YgYSB7QGxpbmsgUHJvdmlkZXJ9IHVzZWQgYnkgdGhlIHtAbGluayBJbmplY3Rvcn0uXG4gKlxuICogSXQgaXMgdXN1YWxseSBjcmVhdGVkIGF1dG9tYXRpY2FsbHkgYnkgYEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGVgLlxuICpcbiAqIEl0IGNhbiBiZSBjcmVhdGVkIG1hbnVhbGx5LCBhcyBmb2xsb3dzOlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9SZkVuaGg4a1VFSTBHM3FzbkllVD9wJTNEcHJldmlldyZwPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHZhciByZXNvbHZlZFByb3ZpZGVycyA9IEluamVjdG9yLnJlc29sdmUoW25ldyBQcm92aWRlcignbWVzc2FnZScsIHt1c2VWYWx1ZTogJ0hlbGxvJ30pXSk7XG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5mcm9tUmVzb2x2ZWRQcm92aWRlcnMocmVzb2x2ZWRQcm92aWRlcnMpO1xuICpcbiAqIGV4cGVjdChpbmplY3Rvci5nZXQoJ21lc3NhZ2UnKSkudG9FcXVhbCgnSGVsbG8nKTtcbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlc29sdmVkUHJvdmlkZXIge1xuICAvKipcbiAgICogQSBrZXksIHVzdWFsbHkgYSBgVHlwZWAuXG4gICAqL1xuICBrZXk6IEtleTtcblxuICAvKipcbiAgICogRmFjdG9yeSBmdW5jdGlvbiB3aGljaCBjYW4gcmV0dXJuIGFuIGluc3RhbmNlIG9mIGFuIG9iamVjdCByZXByZXNlbnRlZCBieSBhIGtleS5cbiAgICovXG4gIHJlc29sdmVkRmFjdG9yaWVzOiBSZXNvbHZlZEZhY3RvcnlbXTtcblxuICAvKipcbiAgICogSW5kaWNhdGVzIGlmIHRoZSBwcm92aWRlciBpcyBhIG11bHRpLXByb3ZpZGVyIG9yIGEgcmVndWxhciBwcm92aWRlci5cbiAgICovXG4gIG11bHRpUHJvdmlkZXI6IGJvb2xlYW47XG59XG5cbi8qKlxuICogU2VlIHtAbGluayBSZXNvbHZlZFByb3ZpZGVyfSBpbnN0ZWFkLlxuICpcbiAqIEBkZXByZWNhdGVkXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVzb2x2ZWRCaW5kaW5nIGV4dGVuZHMgUmVzb2x2ZWRQcm92aWRlciB7fVxuXG5leHBvcnQgY2xhc3MgUmVzb2x2ZWRQcm92aWRlcl8gaW1wbGVtZW50cyBSZXNvbHZlZEJpbmRpbmcge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMga2V5OiBLZXksIHB1YmxpYyByZXNvbHZlZEZhY3RvcmllczogUmVzb2x2ZWRGYWN0b3J5W10sXG4gICAgICAgICAgICAgIHB1YmxpYyBtdWx0aVByb3ZpZGVyOiBib29sZWFuKSB7fVxuXG4gIGdldCByZXNvbHZlZEZhY3RvcnkoKTogUmVzb2x2ZWRGYWN0b3J5IHsgcmV0dXJuIHRoaXMucmVzb2x2ZWRGYWN0b3JpZXNbMF07IH1cbn1cblxuLyoqXG4gKiBBbiBpbnRlcm5hbCByZXNvbHZlZCByZXByZXNlbnRhdGlvbiBvZiBhIGZhY3RvcnkgZnVuY3Rpb24gY3JlYXRlZCBieSByZXNvbHZpbmcge0BsaW5rIFByb3ZpZGVyfS5cbiAqL1xuZXhwb3J0IGNsYXNzIFJlc29sdmVkRmFjdG9yeSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgLyoqXG4gICAgICAgKiBGYWN0b3J5IGZ1bmN0aW9uIHdoaWNoIGNhbiByZXR1cm4gYW4gaW5zdGFuY2Ugb2YgYW4gb2JqZWN0IHJlcHJlc2VudGVkIGJ5IGEga2V5LlxuICAgICAgICovXG4gICAgICBwdWJsaWMgZmFjdG9yeTogRnVuY3Rpb24sXG5cbiAgICAgIC8qKlxuICAgICAgICogQXJndW1lbnRzIChkZXBlbmRlbmNpZXMpIHRvIHRoZSBgZmFjdG9yeWAgZnVuY3Rpb24uXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBkZXBlbmRlbmNpZXM6IERlcGVuZGVuY3lbXSkge31cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEge0BsaW5rIFByb3ZpZGVyfS5cbiAqXG4gKiBUbyBjb25zdHJ1Y3QgYSB7QGxpbmsgUHJvdmlkZXJ9LCBiaW5kIGEgYHRva2VuYCB0byBlaXRoZXIgYSBjbGFzcywgYSB2YWx1ZSwgYSBmYWN0b3J5IGZ1bmN0aW9uLFxuICogb3JcbiAqIHRvIGFuIGV4aXN0aW5nIGB0b2tlbmAuXG4gKiBTZWUge0BsaW5rIFByb3ZpZGVyQnVpbGRlcn0gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBUaGUgYHRva2VuYCBpcyBtb3N0IGNvbW1vbmx5IGEgY2xhc3Mgb3Ige0BsaW5rIE9wYXF1ZVRva2VuLWNsYXNzLmh0bWx9LlxuICpcbiAqIEBkZXByZWNhdGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5kKHRva2VuKTogUHJvdmlkZXJCdWlsZGVyIHtcbiAgcmV0dXJuIG5ldyBQcm92aWRlckJ1aWxkZXIodG9rZW4pO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgUHJvdmlkZXJ9LlxuICpcbiAqIFNlZSB7QGxpbmsgUHJvdmlkZXJ9IGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogPCEtLSBUT0RPOiBpbXByb3ZlIHRoZSBkb2NzIC0tPlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZSh0b2tlbiwge3VzZUNsYXNzLCB1c2VWYWx1ZSwgdXNlRXhpc3RpbmcsIHVzZUZhY3RvcnksIGRlcHMsIG11bHRpfToge1xuICB1c2VDbGFzcz86IFR5cGUsXG4gIHVzZVZhbHVlPzogYW55LFxuICB1c2VFeGlzdGluZz86IGFueSxcbiAgdXNlRmFjdG9yeT86IEZ1bmN0aW9uLFxuICBkZXBzPzogT2JqZWN0W10sXG4gIG11bHRpPzogYm9vbGVhblxufSk6IFByb3ZpZGVyIHtcbiAgcmV0dXJuIG5ldyBQcm92aWRlcih0b2tlbiwge1xuICAgIHVzZUNsYXNzOiB1c2VDbGFzcyxcbiAgICB1c2VWYWx1ZTogdXNlVmFsdWUsXG4gICAgdXNlRXhpc3Rpbmc6IHVzZUV4aXN0aW5nLFxuICAgIHVzZUZhY3Rvcnk6IHVzZUZhY3RvcnksXG4gICAgZGVwczogZGVwcyxcbiAgICBtdWx0aTogbXVsdGlcbiAgfSk7XG59XG5cbi8qKlxuICogSGVscGVyIGNsYXNzIGZvciB0aGUge0BsaW5rIGJpbmR9IGZ1bmN0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgUHJvdmlkZXJCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IocHVibGljIHRva2VuKSB7fVxuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGEgY2xhc3MuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9acEJDU1lxdjZlMnVkNUtYTGR4UT9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBCZWNhdXNlIGB0b0FsaWFzYCBhbmQgYHRvQ2xhc3NgIGFyZSBvZnRlbiBjb25mdXNlZCwgdGhlIGV4YW1wbGUgY29udGFpbnNcbiAgICogYm90aCB1c2UgY2FzZXMgZm9yIGVhc3kgY29tcGFyaXNvbi5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjbGFzcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIGNsYXNzIENhciBleHRlbmRzIFZlaGljbGUge31cbiAgICpcbiAgICogdmFyIGluamVjdG9yQ2xhc3MgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgcHJvdmlkZShWZWhpY2xlLCB7dXNlQ2xhc3M6IENhcn0pXG4gICAqIF0pO1xuICAgKiB2YXIgaW5qZWN0b3JBbGlhcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBwcm92aWRlKFZlaGljbGUsIHt1c2VFeGlzdGluZzogQ2FyfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSkubm90LnRvQmUoaW5qZWN0b3JDbGFzcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpKS50b0JlKGluamVjdG9yQWxpYXMuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqIGBgYFxuICAgKi9cbiAgdG9DbGFzcyh0eXBlOiBUeXBlKTogUHJvdmlkZXIge1xuICAgIGlmICghaXNUeXBlKHR5cGUpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICBgVHJ5aW5nIHRvIGNyZWF0ZSBhIGNsYXNzIHByb3ZpZGVyIGJ1dCBcIiR7c3RyaW5naWZ5KHR5cGUpfVwiIGlzIG5vdCBhIGNsYXNzIWApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb3ZpZGVyKHRoaXMudG9rZW4sIHt1c2VDbGFzczogdHlwZX0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYSB2YWx1ZS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0cwMjRQRkhtREwwY0pGZ2ZaSzhPP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgcHJvdmlkZSgnbWVzc2FnZScsIHt1c2VWYWx1ZTogJ0hlbGxvJ30pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KCdtZXNzYWdlJykpLnRvRXF1YWwoJ0hlbGxvJyk7XG4gICAqIGBgYFxuICAgKi9cbiAgdG9WYWx1ZSh2YWx1ZTogYW55KTogUHJvdmlkZXIgeyByZXR1cm4gbmV3IFByb3ZpZGVyKHRoaXMudG9rZW4sIHt1c2VWYWx1ZTogdmFsdWV9KTsgfVxuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGFuIGV4aXN0aW5nIHRva2VuLlxuICAgKlxuICAgKiBBbmd1bGFyIHdpbGwgcmV0dXJuIHRoZSBzYW1lIGluc3RhbmNlIGFzIGlmIHRoZSBwcm92aWRlZCB0b2tlbiB3YXMgdXNlZC4gKFRoaXMgaXNcbiAgICogaW4gY29udHJhc3QgdG8gYHVzZUNsYXNzYCB3aGVyZSBhIHNlcGFyYXRlIGluc3RhbmNlIG9mIGB1c2VDbGFzc2Agd2lsbCBiZSByZXR1cm5lZC4pXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC91QmFvRjJwTjVjZmM1QWZaYXBOdz9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBCZWNhdXNlIGB0b0FsaWFzYCBhbmQgYHRvQ2xhc3NgIGFyZSBvZnRlbiBjb25mdXNlZCwgdGhlIGV4YW1wbGUgY29udGFpbnNcbiAgICogYm90aCB1c2UgY2FzZXMgZm9yIGVhc3kgY29tcGFyaXNvbi5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjbGFzcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIGNsYXNzIENhciBleHRlbmRzIFZlaGljbGUge31cbiAgICpcbiAgICogdmFyIGluamVjdG9yQWxpYXMgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgcHJvdmlkZShWZWhpY2xlLCB7dXNlRXhpc3Rpbmc6IENhcn0pXG4gICAqIF0pO1xuICAgKiB2YXIgaW5qZWN0b3JDbGFzcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBwcm92aWRlKFZlaGljbGUsIHt1c2VDbGFzczogQ2FyfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSkudG9CZShpbmplY3RvckFsaWFzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JDbGFzcy5nZXQoVmVoaWNsZSkpLm5vdC50b0JlKGluamVjdG9yQ2xhc3MuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JDbGFzcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqIGBgYFxuICAgKi9cbiAgdG9BbGlhcyhhbGlhc1Rva2VuOiAvKlR5cGUqLyBhbnkpOiBQcm92aWRlciB7XG4gICAgaWYgKGlzQmxhbmsoYWxpYXNUb2tlbikpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDYW4gbm90IGFsaWFzICR7c3RyaW5naWZ5KHRoaXMudG9rZW4pfSB0byBhIGJsYW5rIHZhbHVlIWApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb3ZpZGVyKHRoaXMudG9rZW4sIHt1c2VFeGlzdGluZzogYWxpYXNUb2tlbn0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYSBmdW5jdGlvbiB3aGljaCBjb21wdXRlcyB0aGUgdmFsdWUuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9PZWpOSWZUVDN6YjFpQnhhSVlPYj9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIHByb3ZpZGUoTnVtYmVyLCB7dXNlRmFjdG9yeTogKCkgPT4geyByZXR1cm4gMSsyOyB9fSksXG4gICAqICAgcHJvdmlkZShTdHJpbmcsIHt1c2VGYWN0b3J5OiAodikgPT4geyByZXR1cm4gXCJWYWx1ZTogXCIgKyB2OyB9LCBkZXBzOiBbTnVtYmVyXX0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KE51bWJlcikpLnRvRXF1YWwoMyk7XG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoU3RyaW5nKSkudG9FcXVhbCgnVmFsdWU6IDMnKTtcbiAgICogYGBgXG4gICAqL1xuICB0b0ZhY3RvcnkoZmFjdG9yeTogRnVuY3Rpb24sIGRlcGVuZGVuY2llcz86IGFueVtdKTogUHJvdmlkZXIge1xuICAgIGlmICghaXNGdW5jdGlvbihmYWN0b3J5KSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgYFRyeWluZyB0byBjcmVhdGUgYSBmYWN0b3J5IHByb3ZpZGVyIGJ1dCBcIiR7c3RyaW5naWZ5KGZhY3RvcnkpfVwiIGlzIG5vdCBhIGZ1bmN0aW9uIWApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb3ZpZGVyKHRoaXMudG9rZW4sIHt1c2VGYWN0b3J5OiBmYWN0b3J5LCBkZXBzOiBkZXBlbmRlbmNpZXN9KTtcbiAgfVxufVxuXG4vKipcbiAqIFJlc29sdmUgYSBzaW5nbGUgcHJvdmlkZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlRmFjdG9yeShwcm92aWRlcjogUHJvdmlkZXIpOiBSZXNvbHZlZEZhY3Rvcnkge1xuICB2YXIgZmFjdG9yeUZuOiBGdW5jdGlvbjtcbiAgdmFyIHJlc29sdmVkRGVwcztcbiAgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VDbGFzcykpIHtcbiAgICB2YXIgdXNlQ2xhc3MgPSByZXNvbHZlRm9yd2FyZFJlZihwcm92aWRlci51c2VDbGFzcyk7XG4gICAgZmFjdG9yeUZuID0gcmVmbGVjdG9yLmZhY3RvcnkodXNlQ2xhc3MpO1xuICAgIHJlc29sdmVkRGVwcyA9IF9kZXBlbmRlbmNpZXNGb3IodXNlQ2xhc3MpO1xuICB9IGVsc2UgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VFeGlzdGluZykpIHtcbiAgICBmYWN0b3J5Rm4gPSAoYWxpYXNJbnN0YW5jZSkgPT4gYWxpYXNJbnN0YW5jZTtcbiAgICByZXNvbHZlZERlcHMgPSBbRGVwZW5kZW5jeS5mcm9tS2V5KEtleS5nZXQocHJvdmlkZXIudXNlRXhpc3RpbmcpKV07XG4gIH0gZWxzZSBpZiAoaXNQcmVzZW50KHByb3ZpZGVyLnVzZUZhY3RvcnkpKSB7XG4gICAgZmFjdG9yeUZuID0gcHJvdmlkZXIudXNlRmFjdG9yeTtcbiAgICByZXNvbHZlZERlcHMgPSBjb25zdHJ1Y3REZXBlbmRlbmNpZXMocHJvdmlkZXIudXNlRmFjdG9yeSwgcHJvdmlkZXIuZGVwZW5kZW5jaWVzKTtcbiAgfSBlbHNlIHtcbiAgICBmYWN0b3J5Rm4gPSAoKSA9PiBwcm92aWRlci51c2VWYWx1ZTtcbiAgICByZXNvbHZlZERlcHMgPSBfRU1QVFlfTElTVDtcbiAgfVxuICByZXR1cm4gbmV3IFJlc29sdmVkRmFjdG9yeShmYWN0b3J5Rm4sIHJlc29sdmVkRGVwcyk7XG59XG5cbi8qKlxuICogQ29udmVydHMgdGhlIHtAbGluayBQcm92aWRlcn0gaW50byB7QGxpbmsgUmVzb2x2ZWRQcm92aWRlcn0uXG4gKlxuICoge0BsaW5rIEluamVjdG9yfSBpbnRlcm5hbGx5IG9ubHkgdXNlcyB7QGxpbmsgUmVzb2x2ZWRQcm92aWRlcn0sIHtAbGluayBQcm92aWRlcn0gY29udGFpbnNcbiAqIGNvbnZlbmllbmNlIHByb3ZpZGVyIHN5bnRheC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVQcm92aWRlcihwcm92aWRlcjogUHJvdmlkZXIpOiBSZXNvbHZlZFByb3ZpZGVyIHtcbiAgcmV0dXJuIG5ldyBSZXNvbHZlZFByb3ZpZGVyXyhLZXkuZ2V0KHByb3ZpZGVyLnRva2VuKSwgW3Jlc29sdmVGYWN0b3J5KHByb3ZpZGVyKV0sIHByb3ZpZGVyLm11bHRpKTtcbn1cblxuLyoqXG4gKiBSZXNvbHZlIGEgbGlzdCBvZiBQcm92aWRlcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlUHJvdmlkZXJzKHByb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogUmVzb2x2ZWRQcm92aWRlcltdIHtcbiAgdmFyIG5vcm1hbGl6ZWQgPSBfbm9ybWFsaXplUHJvdmlkZXJzKHByb3ZpZGVycywgW10pO1xuICB2YXIgcmVzb2x2ZWQgPSBub3JtYWxpemVkLm1hcChyZXNvbHZlUHJvdmlkZXIpO1xuICByZXR1cm4gTWFwV3JhcHBlci52YWx1ZXMobWVyZ2VSZXNvbHZlZFByb3ZpZGVycyhyZXNvbHZlZCwgbmV3IE1hcDxudW1iZXIsIFJlc29sdmVkUHJvdmlkZXI+KCkpKTtcbn1cblxuLyoqXG4gKiBNZXJnZXMgYSBsaXN0IG9mIFJlc29sdmVkUHJvdmlkZXJzIGludG8gYSBsaXN0IHdoZXJlXG4gKiBlYWNoIGtleSBpcyBjb250YWluZWQgZXhhY3RseSBvbmNlIGFuZCBtdWx0aSBwcm92aWRlcnNcbiAqIGhhdmUgYmVlbiBtZXJnZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVJlc29sdmVkUHJvdmlkZXJzKFxuICAgIHByb3ZpZGVyczogUmVzb2x2ZWRQcm92aWRlcltdLFxuICAgIG5vcm1hbGl6ZWRQcm92aWRlcnNNYXA6IE1hcDxudW1iZXIsIFJlc29sdmVkUHJvdmlkZXI+KTogTWFwPG51bWJlciwgUmVzb2x2ZWRQcm92aWRlcj4ge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3ZpZGVycy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBwcm92aWRlciA9IHByb3ZpZGVyc1tpXTtcbiAgICB2YXIgZXhpc3RpbmcgPSBub3JtYWxpemVkUHJvdmlkZXJzTWFwLmdldChwcm92aWRlci5rZXkuaWQpO1xuICAgIGlmIChpc1ByZXNlbnQoZXhpc3RpbmcpKSB7XG4gICAgICBpZiAocHJvdmlkZXIubXVsdGlQcm92aWRlciAhPT0gZXhpc3RpbmcubXVsdGlQcm92aWRlcikge1xuICAgICAgICB0aHJvdyBuZXcgTWl4aW5nTXVsdGlQcm92aWRlcnNXaXRoUmVndWxhclByb3ZpZGVyc0Vycm9yKGV4aXN0aW5nLCBwcm92aWRlcik7XG4gICAgICB9XG4gICAgICBpZiAocHJvdmlkZXIubXVsdGlQcm92aWRlcikge1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHByb3ZpZGVyLnJlc29sdmVkRmFjdG9yaWVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgZXhpc3RpbmcucmVzb2x2ZWRGYWN0b3JpZXMucHVzaChwcm92aWRlci5yZXNvbHZlZEZhY3Rvcmllc1tqXSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vcm1hbGl6ZWRQcm92aWRlcnNNYXAuc2V0KHByb3ZpZGVyLmtleS5pZCwgcHJvdmlkZXIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcmVzb2x2ZWRQcm92aWRlcjtcbiAgICAgIGlmIChwcm92aWRlci5tdWx0aVByb3ZpZGVyKSB7XG4gICAgICAgIHJlc29sdmVkUHJvdmlkZXIgPSBuZXcgUmVzb2x2ZWRQcm92aWRlcl8oXG4gICAgICAgICAgICBwcm92aWRlci5rZXksIExpc3RXcmFwcGVyLmNsb25lKHByb3ZpZGVyLnJlc29sdmVkRmFjdG9yaWVzKSwgcHJvdmlkZXIubXVsdGlQcm92aWRlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlZFByb3ZpZGVyID0gcHJvdmlkZXI7XG4gICAgICB9XG4gICAgICBub3JtYWxpemVkUHJvdmlkZXJzTWFwLnNldChwcm92aWRlci5rZXkuaWQsIHJlc29sdmVkUHJvdmlkZXIpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbm9ybWFsaXplZFByb3ZpZGVyc01hcDtcbn1cblxuZnVuY3Rpb24gX25vcm1hbGl6ZVByb3ZpZGVycyhwcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IFByb3ZpZGVyQnVpbGRlciB8IGFueVtdPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzOiBQcm92aWRlcltdKTogUHJvdmlkZXJbXSB7XG4gIHByb3ZpZGVycy5mb3JFYWNoKGIgPT4ge1xuICAgIGlmIChiIGluc3RhbmNlb2YgVHlwZSkge1xuICAgICAgcmVzLnB1c2gocHJvdmlkZShiLCB7dXNlQ2xhc3M6IGJ9KSk7XG5cbiAgICB9IGVsc2UgaWYgKGIgaW5zdGFuY2VvZiBQcm92aWRlcikge1xuICAgICAgcmVzLnB1c2goYik7XG5cbiAgICB9IGVsc2UgaWYgKGIgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgX25vcm1hbGl6ZVByb3ZpZGVycyhiLCByZXMpO1xuXG4gICAgfSBlbHNlIGlmIChiIGluc3RhbmNlb2YgUHJvdmlkZXJCdWlsZGVyKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFByb3ZpZGVyRXJyb3IoYi50b2tlbik7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQcm92aWRlckVycm9yKGIpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHJlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN0cnVjdERlcGVuZGVuY2llcyh0eXBlT3JGdW5jOiBhbnksIGRlcGVuZGVuY2llczogYW55W10pOiBEZXBlbmRlbmN5W10ge1xuICBpZiAoaXNCbGFuayhkZXBlbmRlbmNpZXMpKSB7XG4gICAgcmV0dXJuIF9kZXBlbmRlbmNpZXNGb3IodHlwZU9yRnVuYyk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHBhcmFtczogYW55W11bXSA9IGRlcGVuZGVuY2llcy5tYXAodCA9PiBbdF0pO1xuICAgIHJldHVybiBkZXBlbmRlbmNpZXMubWFwKHQgPT4gX2V4dHJhY3RUb2tlbih0eXBlT3JGdW5jLCB0LCBwYXJhbXMpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfZGVwZW5kZW5jaWVzRm9yKHR5cGVPckZ1bmM6IGFueSk6IERlcGVuZGVuY3lbXSB7XG4gIHZhciBwYXJhbXMgPSByZWZsZWN0b3IucGFyYW1ldGVycyh0eXBlT3JGdW5jKTtcbiAgaWYgKGlzQmxhbmsocGFyYW1zKSkgcmV0dXJuIFtdO1xuICBpZiAocGFyYW1zLnNvbWUoaXNCbGFuaykpIHtcbiAgICB0aHJvdyBuZXcgTm9Bbm5vdGF0aW9uRXJyb3IodHlwZU9yRnVuYywgcGFyYW1zKTtcbiAgfVxuICByZXR1cm4gcGFyYW1zLm1hcCgocDogYW55W10pID0+IF9leHRyYWN0VG9rZW4odHlwZU9yRnVuYywgcCwgcGFyYW1zKSk7XG59XG5cbmZ1bmN0aW9uIF9leHRyYWN0VG9rZW4odHlwZU9yRnVuYywgbWV0YWRhdGEgLyphbnlbXSB8IGFueSovLCBwYXJhbXM6IGFueVtdW10pOiBEZXBlbmRlbmN5IHtcbiAgdmFyIGRlcFByb3BzID0gW107XG4gIHZhciB0b2tlbiA9IG51bGw7XG4gIHZhciBvcHRpb25hbCA9IGZhbHNlO1xuXG4gIGlmICghaXNBcnJheShtZXRhZGF0YSkpIHtcbiAgICBpZiAobWV0YWRhdGEgaW5zdGFuY2VvZiBJbmplY3RNZXRhZGF0YSkge1xuICAgICAgcmV0dXJuIF9jcmVhdGVEZXBlbmRlbmN5KG1ldGFkYXRhLnRva2VuLCBvcHRpb25hbCwgbnVsbCwgbnVsbCwgZGVwUHJvcHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gX2NyZWF0ZURlcGVuZGVuY3kobWV0YWRhdGEsIG9wdGlvbmFsLCBudWxsLCBudWxsLCBkZXBQcm9wcyk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGxvd2VyQm91bmRWaXNpYmlsaXR5ID0gbnVsbDtcbiAgdmFyIHVwcGVyQm91bmRWaXNpYmlsaXR5ID0gbnVsbDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG1ldGFkYXRhLmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIHBhcmFtTWV0YWRhdGEgPSBtZXRhZGF0YVtpXTtcblxuICAgIGlmIChwYXJhbU1ldGFkYXRhIGluc3RhbmNlb2YgVHlwZSkge1xuICAgICAgdG9rZW4gPSBwYXJhbU1ldGFkYXRhO1xuXG4gICAgfSBlbHNlIGlmIChwYXJhbU1ldGFkYXRhIGluc3RhbmNlb2YgSW5qZWN0TWV0YWRhdGEpIHtcbiAgICAgIHRva2VuID0gcGFyYW1NZXRhZGF0YS50b2tlbjtcblxuICAgIH0gZWxzZSBpZiAocGFyYW1NZXRhZGF0YSBpbnN0YW5jZW9mIE9wdGlvbmFsTWV0YWRhdGEpIHtcbiAgICAgIG9wdGlvbmFsID0gdHJ1ZTtcblxuICAgIH0gZWxzZSBpZiAocGFyYW1NZXRhZGF0YSBpbnN0YW5jZW9mIFNlbGZNZXRhZGF0YSkge1xuICAgICAgdXBwZXJCb3VuZFZpc2liaWxpdHkgPSBwYXJhbU1ldGFkYXRhO1xuXG4gICAgfSBlbHNlIGlmIChwYXJhbU1ldGFkYXRhIGluc3RhbmNlb2YgSG9zdE1ldGFkYXRhKSB7XG4gICAgICB1cHBlckJvdW5kVmlzaWJpbGl0eSA9IHBhcmFtTWV0YWRhdGE7XG5cbiAgICB9IGVsc2UgaWYgKHBhcmFtTWV0YWRhdGEgaW5zdGFuY2VvZiBTa2lwU2VsZk1ldGFkYXRhKSB7XG4gICAgICBsb3dlckJvdW5kVmlzaWJpbGl0eSA9IHBhcmFtTWV0YWRhdGE7XG5cbiAgICB9IGVsc2UgaWYgKHBhcmFtTWV0YWRhdGEgaW5zdGFuY2VvZiBEZXBlbmRlbmN5TWV0YWRhdGEpIHtcbiAgICAgIGlmIChpc1ByZXNlbnQocGFyYW1NZXRhZGF0YS50b2tlbikpIHtcbiAgICAgICAgdG9rZW4gPSBwYXJhbU1ldGFkYXRhLnRva2VuO1xuICAgICAgfVxuICAgICAgZGVwUHJvcHMucHVzaChwYXJhbU1ldGFkYXRhKTtcbiAgICB9XG4gIH1cblxuICB0b2tlbiA9IHJlc29sdmVGb3J3YXJkUmVmKHRva2VuKTtcblxuICBpZiAoaXNQcmVzZW50KHRva2VuKSkge1xuICAgIHJldHVybiBfY3JlYXRlRGVwZW5kZW5jeSh0b2tlbiwgb3B0aW9uYWwsIGxvd2VyQm91bmRWaXNpYmlsaXR5LCB1cHBlckJvdW5kVmlzaWJpbGl0eSwgZGVwUHJvcHMpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBOb0Fubm90YXRpb25FcnJvcih0eXBlT3JGdW5jLCBwYXJhbXMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVEZXBlbmRlbmN5KHRva2VuLCBvcHRpb25hbCwgbG93ZXJCb3VuZFZpc2liaWxpdHksIHVwcGVyQm91bmRWaXNpYmlsaXR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwUHJvcHMpOiBEZXBlbmRlbmN5IHtcbiAgcmV0dXJuIG5ldyBEZXBlbmRlbmN5KEtleS5nZXQodG9rZW4pLCBvcHRpb25hbCwgbG93ZXJCb3VuZFZpc2liaWxpdHksIHVwcGVyQm91bmRWaXNpYmlsaXR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwUHJvcHMpO1xufVxuIl19