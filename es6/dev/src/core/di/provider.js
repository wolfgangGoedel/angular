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
        resolvedDeps = _constructDependencies(provider.useFactory, provider.dependencies);
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
function _constructDependencies(factoryFunction, dependencies) {
    if (isBlank(dependencies)) {
        return _dependenciesFor(factoryFunction);
    }
    else {
        var params = dependencies.map(t => [t]);
        return dependencies.map(t => _extractToken(factoryFunction, t, params));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLUVpWUtlMU15LnRtcC9hbmd1bGFyMi9zcmMvY29yZS9kaS9wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUNMLElBQUksRUFDSixPQUFPLEVBQ1AsU0FBUyxFQUNULEtBQUssRUFDTCxVQUFVLEVBQ1YsU0FBUyxFQUNULE9BQU8sRUFDUCxNQUFNLEVBQ04sVUFBVSxFQUNWLGFBQWEsRUFDZCxNQUFNLDBCQUEwQjtPQUMxQixFQUFDLGFBQWEsRUFBbUIsTUFBTSxnQ0FBZ0M7T0FDdkUsRUFBQyxVQUFVLEVBQUUsV0FBVyxFQUFDLE1BQU0sZ0NBQWdDO09BQy9ELEVBQUMsU0FBUyxFQUFDLE1BQU0seUNBQXlDO09BQzFELEVBQUMsR0FBRyxFQUFDLE1BQU0sT0FBTztPQUNsQixFQUNMLGNBQWMsRUFFZCxnQkFBZ0IsRUFDaEIsWUFBWSxFQUNaLFlBQVksRUFDWixnQkFBZ0IsRUFDaEIsa0JBQWtCLEVBQ25CLE1BQU0sWUFBWTtPQUNaLEVBQ0wsaUJBQWlCLEVBQ2pCLDZDQUE2QyxFQUM3QyxvQkFBb0IsRUFDckIsTUFBTSxjQUFjO09BQ2QsRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGVBQWU7QUFFL0M7OztHQUdHO0FBQ0g7SUFDRSxZQUFtQixHQUFRLEVBQVMsUUFBaUIsRUFBUyxvQkFBeUIsRUFDcEUsb0JBQXlCLEVBQVMsVUFBaUI7UUFEbkQsUUFBRyxHQUFILEdBQUcsQ0FBSztRQUFTLGFBQVEsR0FBUixRQUFRLENBQVM7UUFBUyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQUs7UUFDcEUseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFLO1FBQVMsZUFBVSxHQUFWLFVBQVUsQ0FBTztJQUFHLENBQUM7SUFFMUUsT0FBTyxPQUFPLENBQUMsR0FBUSxJQUFnQixNQUFNLENBQUMsSUFBSSxVQUFV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RSxvQkFBb0IsRUFDM0QsUUFBUTtJQUNqQyxNQUFNLENBQUMsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxRQUFRLEVBQUUsb0JBQW9CLEVBQUUsb0JBQW9CLEVBQ3BFLFFBQVEsQ0FBQyxDQUFDO0FBQ2xDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBUeXBlLFxuICBpc0JsYW5rLFxuICBpc1ByZXNlbnQsXG4gIENPTlNULFxuICBDT05TVF9FWFBSLFxuICBzdHJpbmdpZnksXG4gIGlzQXJyYXksXG4gIGlzVHlwZSxcbiAgaXNGdW5jdGlvbixcbiAgbm9ybWFsaXplQm9vbFxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtLZXl9IGZyb20gJy4va2V5JztcbmltcG9ydCB7XG4gIEluamVjdE1ldGFkYXRhLFxuICBJbmplY3RhYmxlTWV0YWRhdGEsXG4gIE9wdGlvbmFsTWV0YWRhdGEsXG4gIFNlbGZNZXRhZGF0YSxcbiAgSG9zdE1ldGFkYXRhLFxuICBTa2lwU2VsZk1ldGFkYXRhLFxuICBEZXBlbmRlbmN5TWV0YWRhdGFcbn0gZnJvbSAnLi9tZXRhZGF0YSc7XG5pbXBvcnQge1xuICBOb0Fubm90YXRpb25FcnJvcixcbiAgTWl4aW5nTXVsdGlQcm92aWRlcnNXaXRoUmVndWxhclByb3ZpZGVyc0Vycm9yLFxuICBJbnZhbGlkUHJvdmlkZXJFcnJvclxufSBmcm9tICcuL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtyZXNvbHZlRm9yd2FyZFJlZn0gZnJvbSAnLi9mb3J3YXJkX3JlZic7XG5cbi8qKlxuICogYERlcGVuZGVuY3lgIGlzIHVzZWQgYnkgdGhlIGZyYW1ld29yayB0byBleHRlbmQgREkuXG4gKiBUaGlzIGlzIGludGVybmFsIHRvIEFuZ3VsYXIgYW5kIHNob3VsZCBub3QgYmUgdXNlZCBkaXJlY3RseS5cbiAqL1xuZXhwb3J0IGNsYXNzIERlcGVuZGVuY3kge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMga2V5OiBLZXksIHB1YmxpYyBvcHRpb25hbDogYm9vbGVhbiwgcHVibGljIGxvd2VyQm91bmRWaXNpYmlsaXR5OiBhbnksXG4gICAgICAgICAgICAgIHB1YmxpYyB1cHBlckJvdW5kVmlzaWJpbGl0eTogYW55LCBwdWJsaWMgcHJvcGVydGllczogYW55W10pIHt9XG5cbiAgc3RhdGljIGZyb21LZXkoa2V5OiBLZXkpOiBEZXBlbmRlbmN5IHsgcmV0dXJuIG5ldyBEZXBlbmRlbmN5KGtleSwgZmFsc2UsIG51bGwsIG51bGwsIFtdKTsgfVxufVxuXG5jb25zdCBfRU1QVFlfTElTVCA9IENPTlNUX0VYUFIoW10pO1xuXG4vKipcbiAqIERlc2NyaWJlcyBob3cgdGhlIHtAbGluayBJbmplY3Rvcn0gc2hvdWxkIGluc3RhbnRpYXRlIGEgZ2l2ZW4gdG9rZW4uXG4gKlxuICogU2VlIHtAbGluayBwcm92aWRlfS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvR05BeWo2SzZQZllnMk5Cemd3WjU/cCUzRHByZXZpZXcmcD1wcmV2aWV3KSlcbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAqICAgbmV3IFByb3ZpZGVyKFwibWVzc2FnZVwiLCB7IHVzZVZhbHVlOiAnSGVsbG8nIH0pXG4gKiBdKTtcbiAqXG4gKiBleHBlY3QoaW5qZWN0b3IuZ2V0KFwibWVzc2FnZVwiKSkudG9FcXVhbCgnSGVsbG8nKTtcbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIFByb3ZpZGVyIHtcbiAgLyoqXG4gICAqIFRva2VuIHVzZWQgd2hlbiByZXRyaWV2aW5nIHRoaXMgcHJvdmlkZXIuIFVzdWFsbHksIGl0IGlzIGEgdHlwZSB7QGxpbmsgVHlwZX0uXG4gICAqL1xuICB0b2tlbjtcblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhbiBpbXBsZW1lbnRhdGlvbiBjbGFzcy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1JTVEc4NnFnbW94Q3lqOVNXUHdZP3A9cHJldmlldykpXG4gICAqXG4gICAqIEJlY2F1c2UgYHVzZUV4aXN0aW5nYCBhbmQgYHVzZUNsYXNzYCBhcmUgb2Z0ZW4gY29uZnVzZWQsIHRoZSBleGFtcGxlIGNvbnRhaW5zXG4gICAqIGJvdGggdXNlIGNhc2VzIGZvciBlYXN5IGNvbXBhcmlzb24uXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY2xhc3MgVmVoaWNsZSB7fVxuICAgKlxuICAgKiBjbGFzcyBDYXIgZXh0ZW5kcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIHZhciBpbmplY3RvckNsYXNzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIG5ldyBQcm92aWRlcihWZWhpY2xlLCB7IHVzZUNsYXNzOiBDYXIgfSlcbiAgICogXSk7XG4gICAqIHZhciBpbmplY3RvckFsaWFzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIG5ldyBQcm92aWRlcihWZWhpY2xlLCB7IHVzZUV4aXN0aW5nOiBDYXIgfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSkubm90LnRvQmUoaW5qZWN0b3JDbGFzcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpKS50b0JlKGluamVjdG9yQWxpYXMuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqIGBgYFxuICAgKi9cbiAgdXNlQ2xhc3M6IFR5cGU7XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYSB2YWx1ZS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1VGVnNNVlFJRGU3bDR3YVd6aUVTP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYGphdmFzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgbmV3IFByb3ZpZGVyKFwibWVzc2FnZVwiLCB7IHVzZVZhbHVlOiAnSGVsbG8nIH0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KFwibWVzc2FnZVwiKSkudG9FcXVhbCgnSGVsbG8nKTtcbiAgICogYGBgXG4gICAqL1xuICB1c2VWYWx1ZTtcblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhbiBleGlzdGluZyB0b2tlbi5cbiAgICpcbiAgICoge0BsaW5rIEluamVjdG9yfSByZXR1cm5zIHRoZSBzYW1lIGluc3RhbmNlIGFzIGlmIHRoZSBwcm92aWRlZCB0b2tlbiB3YXMgdXNlZC5cbiAgICogVGhpcyBpcyBpbiBjb250cmFzdCB0byBgdXNlQ2xhc3NgIHdoZXJlIGEgc2VwYXJhdGUgaW5zdGFuY2Ugb2YgYHVzZUNsYXNzYCBpcyByZXR1cm5lZC5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1FzYXRzT0pKNlA4VDJmTWU5Z3I4P3A9cHJldmlldykpXG4gICAqXG4gICAqIEJlY2F1c2UgYHVzZUV4aXN0aW5nYCBhbmQgYHVzZUNsYXNzYCBhcmUgb2Z0ZW4gY29uZnVzZWQgdGhlIGV4YW1wbGUgY29udGFpbnNcbiAgICogYm90aCB1c2UgY2FzZXMgZm9yIGVhc3kgY29tcGFyaXNvbi5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjbGFzcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIGNsYXNzIENhciBleHRlbmRzIFZlaGljbGUge31cbiAgICpcbiAgICogdmFyIGluamVjdG9yQWxpYXMgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgbmV3IFByb3ZpZGVyKFZlaGljbGUsIHsgdXNlRXhpc3Rpbmc6IENhciB9KVxuICAgKiBdKTtcbiAgICogdmFyIGluamVjdG9yQ2xhc3MgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgbmV3IFByb3ZpZGVyKFZlaGljbGUsIHsgdXNlQ2xhc3M6IENhciB9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpKS50b0JlKGluamVjdG9yQWxpYXMuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSkubm90LnRvQmUoaW5qZWN0b3JDbGFzcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICogYGBgXG4gICAqL1xuICB1c2VFeGlzdGluZztcblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhIGZ1bmN0aW9uIHdoaWNoIGNvbXB1dGVzIHRoZSB2YWx1ZS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1Njb3h5MHBKTnFLR0FQWlkxVlZDP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgbmV3IFByb3ZpZGVyKE51bWJlciwgeyB1c2VGYWN0b3J5OiAoKSA9PiB7IHJldHVybiAxKzI7IH19KSxcbiAgICogICBuZXcgUHJvdmlkZXIoU3RyaW5nLCB7IHVzZUZhY3Rvcnk6ICh2YWx1ZSkgPT4geyByZXR1cm4gXCJWYWx1ZTogXCIgKyB2YWx1ZTsgfSxcbiAgICogICAgICAgICAgICAgICAgICAgICAgIGRlcHM6IFtOdW1iZXJdIH0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KE51bWJlcikpLnRvRXF1YWwoMyk7XG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoU3RyaW5nKSkudG9FcXVhbCgnVmFsdWU6IDMnKTtcbiAgICogYGBgXG4gICAqXG4gICAqIFVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBkZXBlbmRlbmNpZXMuXG4gICAqL1xuICB1c2VGYWN0b3J5OiBGdW5jdGlvbjtcblxuICAvKipcbiAgICogU3BlY2lmaWVzIGEgc2V0IG9mIGRlcGVuZGVuY2llc1xuICAgKiAoYXMgYHRva2VuYHMpIHdoaWNoIHNob3VsZCBiZSBpbmplY3RlZCBpbnRvIHRoZSBmYWN0b3J5IGZ1bmN0aW9uLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvU2NveHkwcEpOcUtHQVBaWTFWVkM/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBuZXcgUHJvdmlkZXIoTnVtYmVyLCB7IHVzZUZhY3Rvcnk6ICgpID0+IHsgcmV0dXJuIDErMjsgfX0pLFxuICAgKiAgIG5ldyBQcm92aWRlcihTdHJpbmcsIHsgdXNlRmFjdG9yeTogKHZhbHVlKSA9PiB7IHJldHVybiBcIlZhbHVlOiBcIiArIHZhbHVlOyB9LFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgZGVwczogW051bWJlcl0gfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoTnVtYmVyKSkudG9FcXVhbCgzKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChTdHJpbmcpKS50b0VxdWFsKCdWYWx1ZTogMycpO1xuICAgKiBgYGBcbiAgICpcbiAgICogVXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIGB1c2VGYWN0b3J5YC5cbiAgICovXG4gIGRlcGVuZGVuY2llczogT2JqZWN0W107XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbXVsdGk6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IodG9rZW4sIHt1c2VDbGFzcywgdXNlVmFsdWUsIHVzZUV4aXN0aW5nLCB1c2VGYWN0b3J5LCBkZXBzLCBtdWx0aX06IHtcbiAgICB1c2VDbGFzcz86IFR5cGUsXG4gICAgdXNlVmFsdWU/OiBhbnksXG4gICAgdXNlRXhpc3Rpbmc/OiBhbnksXG4gICAgdXNlRmFjdG9yeT86IEZ1bmN0aW9uLFxuICAgIGRlcHM/OiBPYmplY3RbXSxcbiAgICBtdWx0aT86IGJvb2xlYW5cbiAgfSkge1xuICAgIHRoaXMudG9rZW4gPSB0b2tlbjtcbiAgICB0aGlzLnVzZUNsYXNzID0gdXNlQ2xhc3M7XG4gICAgdGhpcy51c2VWYWx1ZSA9IHVzZVZhbHVlO1xuICAgIHRoaXMudXNlRXhpc3RpbmcgPSB1c2VFeGlzdGluZztcbiAgICB0aGlzLnVzZUZhY3RvcnkgPSB1c2VGYWN0b3J5O1xuICAgIHRoaXMuZGVwZW5kZW5jaWVzID0gZGVwcztcbiAgICB0aGlzLl9tdWx0aSA9IG11bHRpO1xuICB9XG5cbiAgLy8gVE9ETzogUHJvdmlkZSBhIGZ1bGwgd29ya2luZyBleGFtcGxlIGFmdGVyIGFscGhhMzggaXMgcmVsZWFzZWQuXG4gIC8qKlxuICAgKiBDcmVhdGVzIG11bHRpcGxlIHByb3ZpZGVycyBtYXRjaGluZyB0aGUgc2FtZSB0b2tlbiAoYSBtdWx0aS1wcm92aWRlcikuXG4gICAqXG4gICAqIE11bHRpLXByb3ZpZGVycyBhcmUgdXNlZCBmb3IgY3JlYXRpbmcgcGx1Z2dhYmxlIHNlcnZpY2UsIHdoZXJlIHRoZSBzeXN0ZW0gY29tZXNcbiAgICogd2l0aCBzb21lIGRlZmF1bHQgcHJvdmlkZXJzLCBhbmQgdGhlIHVzZXIgY2FuIHJlZ2lzdGVyIGFkZGl0aW9uYWwgcHJvdmlkZXJzLlxuICAgKiBUaGUgY29tYmluYXRpb24gb2YgdGhlIGRlZmF1bHQgcHJvdmlkZXJzIGFuZCB0aGUgYWRkaXRpb25hbCBwcm92aWRlcnMgd2lsbCBiZVxuICAgKiB1c2VkIHRvIGRyaXZlIHRoZSBiZWhhdmlvciBvZiB0aGUgc3lzdGVtLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIG5ldyBQcm92aWRlcihcIlN0cmluZ3NcIiwgeyB1c2VWYWx1ZTogXCJTdHJpbmcxXCIsIG11bHRpOiB0cnVlfSksXG4gICAqICAgbmV3IFByb3ZpZGVyKFwiU3RyaW5nc1wiLCB7IHVzZVZhbHVlOiBcIlN0cmluZzJcIiwgbXVsdGk6IHRydWV9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChcIlN0cmluZ3NcIikpLnRvRXF1YWwoW1wiU3RyaW5nMVwiLCBcIlN0cmluZzJcIl0pO1xuICAgKiBgYGBcbiAgICpcbiAgICogTXVsdGktcHJvdmlkZXJzIGFuZCByZWd1bGFyIHByb3ZpZGVycyBjYW5ub3QgYmUgbWl4ZWQuIFRoZSBmb2xsb3dpbmdcbiAgICogd2lsbCB0aHJvdyBhbiBleGNlcHRpb246XG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgbmV3IFByb3ZpZGVyKFwiU3RyaW5nc1wiLCB7IHVzZVZhbHVlOiBcIlN0cmluZzFcIiwgbXVsdGk6IHRydWUgfSksXG4gICAqICAgbmV3IFByb3ZpZGVyKFwiU3RyaW5nc1wiLCB7IHVzZVZhbHVlOiBcIlN0cmluZzJcIn0pXG4gICAqIF0pO1xuICAgKiBgYGBcbiAgICovXG4gIGdldCBtdWx0aSgpOiBib29sZWFuIHsgcmV0dXJuIG5vcm1hbGl6ZUJvb2wodGhpcy5fbXVsdGkpOyB9XG59XG5cbi8qKlxuICogU2VlIHtAbGluayBQcm92aWRlcn0gaW5zdGVhZC5cbiAqXG4gKiBAZGVwcmVjYXRlZFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEJpbmRpbmcgZXh0ZW5kcyBQcm92aWRlciB7XG4gIGNvbnN0cnVjdG9yKHRva2VuLCB7dG9DbGFzcywgdG9WYWx1ZSwgdG9BbGlhcywgdG9GYWN0b3J5LCBkZXBzLCBtdWx0aX06IHtcbiAgICB0b0NsYXNzPzogVHlwZSxcbiAgICB0b1ZhbHVlPzogYW55LFxuICAgIHRvQWxpYXM/OiBhbnksXG4gICAgdG9GYWN0b3J5OiBGdW5jdGlvbiwgZGVwcz86IE9iamVjdFtdLCBtdWx0aT86IGJvb2xlYW5cbiAgfSkge1xuICAgIHN1cGVyKHRva2VuLCB7XG4gICAgICB1c2VDbGFzczogdG9DbGFzcyxcbiAgICAgIHVzZVZhbHVlOiB0b1ZhbHVlLFxuICAgICAgdXNlRXhpc3Rpbmc6IHRvQWxpYXMsXG4gICAgICB1c2VGYWN0b3J5OiB0b0ZhY3RvcnksXG4gICAgICBkZXBzOiBkZXBzLFxuICAgICAgbXVsdGk6IG11bHRpXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIGdldCB0b0NsYXNzKCkgeyByZXR1cm4gdGhpcy51c2VDbGFzczsgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgZ2V0IHRvQWxpYXMoKSB7IHJldHVybiB0aGlzLnVzZUV4aXN0aW5nOyB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBnZXQgdG9GYWN0b3J5KCkgeyByZXR1cm4gdGhpcy51c2VGYWN0b3J5OyB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBnZXQgdG9WYWx1ZSgpIHsgcmV0dXJuIHRoaXMudXNlVmFsdWU7IH1cbn1cblxuLyoqXG4gKiBBbiBpbnRlcm5hbCByZXNvbHZlZCByZXByZXNlbnRhdGlvbiBvZiBhIHtAbGluayBQcm92aWRlcn0gdXNlZCBieSB0aGUge0BsaW5rIEluamVjdG9yfS5cbiAqXG4gKiBJdCBpcyB1c3VhbGx5IGNyZWF0ZWQgYXV0b21hdGljYWxseSBieSBgSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZWAuXG4gKlxuICogSXQgY2FuIGJlIGNyZWF0ZWQgbWFudWFsbHksIGFzIGZvbGxvd3M6XG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1JmRW5oaDhrVUVJMEczcXNuSWVUP3AlM0RwcmV2aWV3JnA9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogdmFyIHJlc29sdmVkUHJvdmlkZXJzID0gSW5qZWN0b3IucmVzb2x2ZShbbmV3IFByb3ZpZGVyKCdtZXNzYWdlJywge3VzZVZhbHVlOiAnSGVsbG8nfSldKTtcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLmZyb21SZXNvbHZlZFByb3ZpZGVycyhyZXNvbHZlZFByb3ZpZGVycyk7XG4gKlxuICogZXhwZWN0KGluamVjdG9yLmdldCgnbWVzc2FnZScpKS50b0VxdWFsKCdIZWxsbycpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVzb2x2ZWRQcm92aWRlciB7XG4gIC8qKlxuICAgKiBBIGtleSwgdXN1YWxseSBhIGBUeXBlYC5cbiAgICovXG4gIGtleTogS2V5O1xuXG4gIC8qKlxuICAgKiBGYWN0b3J5IGZ1bmN0aW9uIHdoaWNoIGNhbiByZXR1cm4gYW4gaW5zdGFuY2Ugb2YgYW4gb2JqZWN0IHJlcHJlc2VudGVkIGJ5IGEga2V5LlxuICAgKi9cbiAgcmVzb2x2ZWRGYWN0b3JpZXM6IFJlc29sdmVkRmFjdG9yeVtdO1xuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgaWYgdGhlIHByb3ZpZGVyIGlzIGEgbXVsdGktcHJvdmlkZXIgb3IgYSByZWd1bGFyIHByb3ZpZGVyLlxuICAgKi9cbiAgbXVsdGlQcm92aWRlcjogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBTZWUge0BsaW5rIFJlc29sdmVkUHJvdmlkZXJ9IGluc3RlYWQuXG4gKlxuICogQGRlcHJlY2F0ZWRcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZXNvbHZlZEJpbmRpbmcgZXh0ZW5kcyBSZXNvbHZlZFByb3ZpZGVyIHt9XG5cbmV4cG9ydCBjbGFzcyBSZXNvbHZlZFByb3ZpZGVyXyBpbXBsZW1lbnRzIFJlc29sdmVkQmluZGluZyB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBrZXk6IEtleSwgcHVibGljIHJlc29sdmVkRmFjdG9yaWVzOiBSZXNvbHZlZEZhY3RvcnlbXSxcbiAgICAgICAgICAgICAgcHVibGljIG11bHRpUHJvdmlkZXI6IGJvb2xlYW4pIHt9XG5cbiAgZ2V0IHJlc29sdmVkRmFjdG9yeSgpOiBSZXNvbHZlZEZhY3RvcnkgeyByZXR1cm4gdGhpcy5yZXNvbHZlZEZhY3Rvcmllc1swXTsgfVxufVxuXG4vKipcbiAqIEFuIGludGVybmFsIHJlc29sdmVkIHJlcHJlc2VudGF0aW9uIG9mIGEgZmFjdG9yeSBmdW5jdGlvbiBjcmVhdGVkIGJ5IHJlc29sdmluZyB7QGxpbmsgUHJvdmlkZXJ9LlxuICovXG5leHBvcnQgY2xhc3MgUmVzb2x2ZWRGYWN0b3J5IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICAvKipcbiAgICAgICAqIEZhY3RvcnkgZnVuY3Rpb24gd2hpY2ggY2FuIHJldHVybiBhbiBpbnN0YW5jZSBvZiBhbiBvYmplY3QgcmVwcmVzZW50ZWQgYnkgYSBrZXkuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBmYWN0b3J5OiBGdW5jdGlvbixcblxuICAgICAgLyoqXG4gICAgICAgKiBBcmd1bWVudHMgKGRlcGVuZGVuY2llcykgdG8gdGhlIGBmYWN0b3J5YCBmdW5jdGlvbi5cbiAgICAgICAqL1xuICAgICAgcHVibGljIGRlcGVuZGVuY2llczogRGVwZW5kZW5jeVtdKSB7fVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgUHJvdmlkZXJ9LlxuICpcbiAqIFRvIGNvbnN0cnVjdCBhIHtAbGluayBQcm92aWRlcn0sIGJpbmQgYSBgdG9rZW5gIHRvIGVpdGhlciBhIGNsYXNzLCBhIHZhbHVlLCBhIGZhY3RvcnkgZnVuY3Rpb24sXG4gKiBvclxuICogdG8gYW4gZXhpc3RpbmcgYHRva2VuYC5cbiAqIFNlZSB7QGxpbmsgUHJvdmlkZXJCdWlsZGVyfSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFRoZSBgdG9rZW5gIGlzIG1vc3QgY29tbW9ubHkgYSBjbGFzcyBvciB7QGxpbmsgT3BhcXVlVG9rZW4tY2xhc3MuaHRtbH0uXG4gKlxuICogQGRlcHJlY2F0ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmQodG9rZW4pOiBQcm92aWRlckJ1aWxkZXIge1xuICByZXR1cm4gbmV3IFByb3ZpZGVyQnVpbGRlcih0b2tlbik7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHtAbGluayBQcm92aWRlcn0uXG4gKlxuICogU2VlIHtAbGluayBQcm92aWRlcn0gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiA8IS0tIFRPRE86IGltcHJvdmUgdGhlIGRvY3MgLS0+XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlKHRva2VuLCB7dXNlQ2xhc3MsIHVzZVZhbHVlLCB1c2VFeGlzdGluZywgdXNlRmFjdG9yeSwgZGVwcywgbXVsdGl9OiB7XG4gIHVzZUNsYXNzPzogVHlwZSxcbiAgdXNlVmFsdWU/OiBhbnksXG4gIHVzZUV4aXN0aW5nPzogYW55LFxuICB1c2VGYWN0b3J5PzogRnVuY3Rpb24sXG4gIGRlcHM/OiBPYmplY3RbXSxcbiAgbXVsdGk/OiBib29sZWFuXG59KTogUHJvdmlkZXIge1xuICByZXR1cm4gbmV3IFByb3ZpZGVyKHRva2VuLCB7XG4gICAgdXNlQ2xhc3M6IHVzZUNsYXNzLFxuICAgIHVzZVZhbHVlOiB1c2VWYWx1ZSxcbiAgICB1c2VFeGlzdGluZzogdXNlRXhpc3RpbmcsXG4gICAgdXNlRmFjdG9yeTogdXNlRmFjdG9yeSxcbiAgICBkZXBzOiBkZXBzLFxuICAgIG11bHRpOiBtdWx0aVxuICB9KTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgY2xhc3MgZm9yIHRoZSB7QGxpbmsgYmluZH0gZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBQcm92aWRlckJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdG9rZW4pIHt9XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYSBjbGFzcy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1pwQkNTWXF2NmUydWQ1S1hMZHhRP3A9cHJldmlldykpXG4gICAqXG4gICAqIEJlY2F1c2UgYHRvQWxpYXNgIGFuZCBgdG9DbGFzc2AgYXJlIG9mdGVuIGNvbmZ1c2VkLCB0aGUgZXhhbXBsZSBjb250YWluc1xuICAgKiBib3RoIHVzZSBjYXNlcyBmb3IgZWFzeSBjb21wYXJpc29uLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNsYXNzIFZlaGljbGUge31cbiAgICpcbiAgICogY2xhc3MgQ2FyIGV4dGVuZHMgVmVoaWNsZSB7fVxuICAgKlxuICAgKiB2YXIgaW5qZWN0b3JDbGFzcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBwcm92aWRlKFZlaGljbGUsIHt1c2VDbGFzczogQ2FyfSlcbiAgICogXSk7XG4gICAqIHZhciBpbmplY3RvckFsaWFzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIHByb3ZpZGUoVmVoaWNsZSwge3VzZUV4aXN0aW5nOiBDYXJ9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpKS5ub3QudG9CZShpbmplY3RvckNsYXNzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkpLnRvQmUoaW5qZWN0b3JBbGlhcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICogYGBgXG4gICAqL1xuICB0b0NsYXNzKHR5cGU6IFR5cGUpOiBQcm92aWRlciB7XG4gICAgaWYgKCFpc1R5cGUodHlwZSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgIGBUcnlpbmcgdG8gY3JlYXRlIGEgY2xhc3MgcHJvdmlkZXIgYnV0IFwiJHtzdHJpbmdpZnkodHlwZSl9XCIgaXMgbm90IGEgY2xhc3MhYCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvdmlkZXIodGhpcy50b2tlbiwge3VzZUNsYXNzOiB0eXBlfSk7XG4gIH1cblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhIHZhbHVlLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvRzAyNFBGSG1ETDBjSkZnZlpLOE8/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBwcm92aWRlKCdtZXNzYWdlJywge3VzZVZhbHVlOiAnSGVsbG8nfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoJ21lc3NhZ2UnKSkudG9FcXVhbCgnSGVsbG8nKTtcbiAgICogYGBgXG4gICAqL1xuICB0b1ZhbHVlKHZhbHVlOiBhbnkpOiBQcm92aWRlciB7IHJldHVybiBuZXcgUHJvdmlkZXIodGhpcy50b2tlbiwge3VzZVZhbHVlOiB2YWx1ZX0pOyB9XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYW4gZXhpc3RpbmcgdG9rZW4uXG4gICAqXG4gICAqIEFuZ3VsYXIgd2lsbCByZXR1cm4gdGhlIHNhbWUgaW5zdGFuY2UgYXMgaWYgdGhlIHByb3ZpZGVkIHRva2VuIHdhcyB1c2VkLiAoVGhpcyBpc1xuICAgKiBpbiBjb250cmFzdCB0byBgdXNlQ2xhc3NgIHdoZXJlIGEgc2VwYXJhdGUgaW5zdGFuY2Ugb2YgYHVzZUNsYXNzYCB3aWxsIGJlIHJldHVybmVkLilcbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L3VCYW9GMnBONWNmYzVBZlphcE53P3A9cHJldmlldykpXG4gICAqXG4gICAqIEJlY2F1c2UgYHRvQWxpYXNgIGFuZCBgdG9DbGFzc2AgYXJlIG9mdGVuIGNvbmZ1c2VkLCB0aGUgZXhhbXBsZSBjb250YWluc1xuICAgKiBib3RoIHVzZSBjYXNlcyBmb3IgZWFzeSBjb21wYXJpc29uLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNsYXNzIFZlaGljbGUge31cbiAgICpcbiAgICogY2xhc3MgQ2FyIGV4dGVuZHMgVmVoaWNsZSB7fVxuICAgKlxuICAgKiB2YXIgaW5qZWN0b3JBbGlhcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBwcm92aWRlKFZlaGljbGUsIHt1c2VFeGlzdGluZzogQ2FyfSlcbiAgICogXSk7XG4gICAqIHZhciBpbmplY3RvckNsYXNzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIHByb3ZpZGUoVmVoaWNsZSwge3VzZUNsYXNzOiBDYXJ9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpKS50b0JlKGluamVjdG9yQWxpYXMuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSkubm90LnRvQmUoaW5qZWN0b3JDbGFzcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICogYGBgXG4gICAqL1xuICB0b0FsaWFzKGFsaWFzVG9rZW46IC8qVHlwZSovIGFueSk6IFByb3ZpZGVyIHtcbiAgICBpZiAoaXNCbGFuayhhbGlhc1Rva2VuKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENhbiBub3QgYWxpYXMgJHtzdHJpbmdpZnkodGhpcy50b2tlbil9IHRvIGEgYmxhbmsgdmFsdWUhYCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvdmlkZXIodGhpcy50b2tlbiwge3VzZUV4aXN0aW5nOiBhbGlhc1Rva2VufSk7XG4gIH1cblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhIGZ1bmN0aW9uIHdoaWNoIGNvbXB1dGVzIHRoZSB2YWx1ZS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L09lak5JZlRUM3piMWlCeGFJWU9iP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgcHJvdmlkZShOdW1iZXIsIHt1c2VGYWN0b3J5OiAoKSA9PiB7IHJldHVybiAxKzI7IH19KSxcbiAgICogICBwcm92aWRlKFN0cmluZywge3VzZUZhY3Rvcnk6ICh2KSA9PiB7IHJldHVybiBcIlZhbHVlOiBcIiArIHY7IH0sIGRlcHM6IFtOdW1iZXJdfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoTnVtYmVyKSkudG9FcXVhbCgzKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChTdHJpbmcpKS50b0VxdWFsKCdWYWx1ZTogMycpO1xuICAgKiBgYGBcbiAgICovXG4gIHRvRmFjdG9yeShmYWN0b3J5OiBGdW5jdGlvbiwgZGVwZW5kZW5jaWVzPzogYW55W10pOiBQcm92aWRlciB7XG4gICAgaWYgKCFpc0Z1bmN0aW9uKGZhY3RvcnkpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICBgVHJ5aW5nIHRvIGNyZWF0ZSBhIGZhY3RvcnkgcHJvdmlkZXIgYnV0IFwiJHtzdHJpbmdpZnkoZmFjdG9yeSl9XCIgaXMgbm90IGEgZnVuY3Rpb24hYCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvdmlkZXIodGhpcy50b2tlbiwge3VzZUZhY3Rvcnk6IGZhY3RvcnksIGRlcHM6IGRlcGVuZGVuY2llc30pO1xuICB9XG59XG5cbi8qKlxuICogUmVzb2x2ZSBhIHNpbmdsZSBwcm92aWRlci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVGYWN0b3J5KHByb3ZpZGVyOiBQcm92aWRlcik6IFJlc29sdmVkRmFjdG9yeSB7XG4gIHZhciBmYWN0b3J5Rm46IEZ1bmN0aW9uO1xuICB2YXIgcmVzb2x2ZWREZXBzOiBEZXBlbmRlbmN5W107XG4gIGlmIChpc1ByZXNlbnQocHJvdmlkZXIudXNlQ2xhc3MpKSB7XG4gICAgdmFyIHVzZUNsYXNzID0gcmVzb2x2ZUZvcndhcmRSZWYocHJvdmlkZXIudXNlQ2xhc3MpO1xuICAgIGZhY3RvcnlGbiA9IHJlZmxlY3Rvci5mYWN0b3J5KHVzZUNsYXNzKTtcbiAgICByZXNvbHZlZERlcHMgPSBfZGVwZW5kZW5jaWVzRm9yKHVzZUNsYXNzKTtcbiAgfSBlbHNlIGlmIChpc1ByZXNlbnQocHJvdmlkZXIudXNlRXhpc3RpbmcpKSB7XG4gICAgZmFjdG9yeUZuID0gKGFsaWFzSW5zdGFuY2UpID0+IGFsaWFzSW5zdGFuY2U7XG4gICAgcmVzb2x2ZWREZXBzID0gW0RlcGVuZGVuY3kuZnJvbUtleShLZXkuZ2V0KHByb3ZpZGVyLnVzZUV4aXN0aW5nKSldO1xuICB9IGVsc2UgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VGYWN0b3J5KSkge1xuICAgIGZhY3RvcnlGbiA9IHByb3ZpZGVyLnVzZUZhY3Rvcnk7XG4gICAgcmVzb2x2ZWREZXBzID0gX2NvbnN0cnVjdERlcGVuZGVuY2llcyhwcm92aWRlci51c2VGYWN0b3J5LCBwcm92aWRlci5kZXBlbmRlbmNpZXMpO1xuICB9IGVsc2Uge1xuICAgIGZhY3RvcnlGbiA9ICgpID0+IHByb3ZpZGVyLnVzZVZhbHVlO1xuICAgIHJlc29sdmVkRGVwcyA9IF9FTVBUWV9MSVNUO1xuICB9XG4gIHJldHVybiBuZXcgUmVzb2x2ZWRGYWN0b3J5KGZhY3RvcnlGbiwgcmVzb2x2ZWREZXBzKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyB0aGUge0BsaW5rIFByb3ZpZGVyfSBpbnRvIHtAbGluayBSZXNvbHZlZFByb3ZpZGVyfS5cbiAqXG4gKiB7QGxpbmsgSW5qZWN0b3J9IGludGVybmFsbHkgb25seSB1c2VzIHtAbGluayBSZXNvbHZlZFByb3ZpZGVyfSwge0BsaW5rIFByb3ZpZGVyfSBjb250YWluc1xuICogY29udmVuaWVuY2UgcHJvdmlkZXIgc3ludGF4LlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVByb3ZpZGVyKHByb3ZpZGVyOiBQcm92aWRlcik6IFJlc29sdmVkUHJvdmlkZXIge1xuICByZXR1cm4gbmV3IFJlc29sdmVkUHJvdmlkZXJfKEtleS5nZXQocHJvdmlkZXIudG9rZW4pLCBbcmVzb2x2ZUZhY3RvcnkocHJvdmlkZXIpXSwgcHJvdmlkZXIubXVsdGkpO1xufVxuXG4vKipcbiAqIFJlc29sdmUgYSBsaXN0IG9mIFByb3ZpZGVycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVQcm92aWRlcnMocHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBSZXNvbHZlZFByb3ZpZGVyW10ge1xuICB2YXIgbm9ybWFsaXplZCA9IF9ub3JtYWxpemVQcm92aWRlcnMocHJvdmlkZXJzLCBbXSk7XG4gIHZhciByZXNvbHZlZCA9IG5vcm1hbGl6ZWQubWFwKHJlc29sdmVQcm92aWRlcik7XG4gIHJldHVybiBNYXBXcmFwcGVyLnZhbHVlcyhtZXJnZVJlc29sdmVkUHJvdmlkZXJzKHJlc29sdmVkLCBuZXcgTWFwPG51bWJlciwgUmVzb2x2ZWRQcm92aWRlcj4oKSkpO1xufVxuXG4vKipcbiAqIE1lcmdlcyBhIGxpc3Qgb2YgUmVzb2x2ZWRQcm92aWRlcnMgaW50byBhIGxpc3Qgd2hlcmVcbiAqIGVhY2gga2V5IGlzIGNvbnRhaW5lZCBleGFjdGx5IG9uY2UgYW5kIG11bHRpIHByb3ZpZGVyc1xuICogaGF2ZSBiZWVuIG1lcmdlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlUmVzb2x2ZWRQcm92aWRlcnMoXG4gICAgcHJvdmlkZXJzOiBSZXNvbHZlZFByb3ZpZGVyW10sXG4gICAgbm9ybWFsaXplZFByb3ZpZGVyc01hcDogTWFwPG51bWJlciwgUmVzb2x2ZWRQcm92aWRlcj4pOiBNYXA8bnVtYmVyLCBSZXNvbHZlZFByb3ZpZGVyPiB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvdmlkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHByb3ZpZGVyID0gcHJvdmlkZXJzW2ldO1xuICAgIHZhciBleGlzdGluZyA9IG5vcm1hbGl6ZWRQcm92aWRlcnNNYXAuZ2V0KHByb3ZpZGVyLmtleS5pZCk7XG4gICAgaWYgKGlzUHJlc2VudChleGlzdGluZykpIHtcbiAgICAgIGlmIChwcm92aWRlci5tdWx0aVByb3ZpZGVyICE9PSBleGlzdGluZy5tdWx0aVByb3ZpZGVyKSB7XG4gICAgICAgIHRocm93IG5ldyBNaXhpbmdNdWx0aVByb3ZpZGVyc1dpdGhSZWd1bGFyUHJvdmlkZXJzRXJyb3IoZXhpc3RpbmcsIHByb3ZpZGVyKTtcbiAgICAgIH1cbiAgICAgIGlmIChwcm92aWRlci5tdWx0aVByb3ZpZGVyKSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcHJvdmlkZXIucmVzb2x2ZWRGYWN0b3JpZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBleGlzdGluZy5yZXNvbHZlZEZhY3Rvcmllcy5wdXNoKHByb3ZpZGVyLnJlc29sdmVkRmFjdG9yaWVzW2pdKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9ybWFsaXplZFByb3ZpZGVyc01hcC5zZXQocHJvdmlkZXIua2V5LmlkLCBwcm92aWRlcik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciByZXNvbHZlZFByb3ZpZGVyO1xuICAgICAgaWYgKHByb3ZpZGVyLm11bHRpUHJvdmlkZXIpIHtcbiAgICAgICAgcmVzb2x2ZWRQcm92aWRlciA9IG5ldyBSZXNvbHZlZFByb3ZpZGVyXyhcbiAgICAgICAgICAgIHByb3ZpZGVyLmtleSwgTGlzdFdyYXBwZXIuY2xvbmUocHJvdmlkZXIucmVzb2x2ZWRGYWN0b3JpZXMpLCBwcm92aWRlci5tdWx0aVByb3ZpZGVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmVkUHJvdmlkZXIgPSBwcm92aWRlcjtcbiAgICAgIH1cbiAgICAgIG5vcm1hbGl6ZWRQcm92aWRlcnNNYXAuc2V0KHByb3ZpZGVyLmtleS5pZCwgcmVzb2x2ZWRQcm92aWRlcik7XG4gICAgfVxuICB9XG4gIHJldHVybiBub3JtYWxpemVkUHJvdmlkZXJzTWFwO1xufVxuXG5mdW5jdGlvbiBfbm9ybWFsaXplUHJvdmlkZXJzKHByb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgUHJvdmlkZXJCdWlsZGVyIHwgYW55W10+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXM6IFByb3ZpZGVyW10pOiBQcm92aWRlcltdIHtcbiAgcHJvdmlkZXJzLmZvckVhY2goYiA9PiB7XG4gICAgaWYgKGIgaW5zdGFuY2VvZiBUeXBlKSB7XG4gICAgICByZXMucHVzaChwcm92aWRlKGIsIHt1c2VDbGFzczogYn0pKTtcblxuICAgIH0gZWxzZSBpZiAoYiBpbnN0YW5jZW9mIFByb3ZpZGVyKSB7XG4gICAgICByZXMucHVzaChiKTtcblxuICAgIH0gZWxzZSBpZiAoYiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBfbm9ybWFsaXplUHJvdmlkZXJzKGIsIHJlcyk7XG5cbiAgICB9IGVsc2UgaWYgKGIgaW5zdGFuY2VvZiBQcm92aWRlckJ1aWxkZXIpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUHJvdmlkZXJFcnJvcihiLnRva2VuKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFByb3ZpZGVyRXJyb3IoYik7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBfY29uc3RydWN0RGVwZW5kZW5jaWVzKGZhY3RvcnlGdW5jdGlvbjogRnVuY3Rpb24sIGRlcGVuZGVuY2llczogYW55W10pOiBEZXBlbmRlbmN5W10ge1xuICBpZiAoaXNCbGFuayhkZXBlbmRlbmNpZXMpKSB7XG4gICAgcmV0dXJuIF9kZXBlbmRlbmNpZXNGb3IoZmFjdG9yeUZ1bmN0aW9uKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcGFyYW1zOiBhbnlbXVtdID0gZGVwZW5kZW5jaWVzLm1hcCh0ID0+IFt0XSk7XG4gICAgcmV0dXJuIGRlcGVuZGVuY2llcy5tYXAodCA9PiBfZXh0cmFjdFRva2VuKGZhY3RvcnlGdW5jdGlvbiwgdCwgcGFyYW1zKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2RlcGVuZGVuY2llc0Zvcih0eXBlT3JGdW5jKTogRGVwZW5kZW5jeVtdIHtcbiAgdmFyIHBhcmFtczogYW55W11bXSA9IHJlZmxlY3Rvci5wYXJhbWV0ZXJzKHR5cGVPckZ1bmMpO1xuICBpZiAoaXNCbGFuayhwYXJhbXMpKSByZXR1cm4gW107XG4gIGlmIChwYXJhbXMuc29tZShpc0JsYW5rKSkge1xuICAgIHRocm93IG5ldyBOb0Fubm90YXRpb25FcnJvcih0eXBlT3JGdW5jLCBwYXJhbXMpO1xuICB9XG4gIHJldHVybiBwYXJhbXMubWFwKChwOiBhbnlbXSkgPT4gX2V4dHJhY3RUb2tlbih0eXBlT3JGdW5jLCBwLCBwYXJhbXMpKTtcbn1cblxuZnVuY3Rpb24gX2V4dHJhY3RUb2tlbih0eXBlT3JGdW5jLCBtZXRhZGF0YSAvKmFueVtdIHwgYW55Ki8sIHBhcmFtczogYW55W11bXSk6IERlcGVuZGVuY3kge1xuICB2YXIgZGVwUHJvcHMgPSBbXTtcbiAgdmFyIHRva2VuID0gbnVsbDtcbiAgdmFyIG9wdGlvbmFsID0gZmFsc2U7XG5cbiAgaWYgKCFpc0FycmF5KG1ldGFkYXRhKSkge1xuICAgIGlmIChtZXRhZGF0YSBpbnN0YW5jZW9mIEluamVjdE1ldGFkYXRhKSB7XG4gICAgICByZXR1cm4gX2NyZWF0ZURlcGVuZGVuY3kobWV0YWRhdGEudG9rZW4sIG9wdGlvbmFsLCBudWxsLCBudWxsLCBkZXBQcm9wcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBfY3JlYXRlRGVwZW5kZW5jeShtZXRhZGF0YSwgb3B0aW9uYWwsIG51bGwsIG51bGwsIGRlcFByb3BzKTtcbiAgICB9XG4gIH1cblxuICB2YXIgbG93ZXJCb3VuZFZpc2liaWxpdHkgPSBudWxsO1xuICB2YXIgdXBwZXJCb3VuZFZpc2liaWxpdHkgPSBudWxsO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbWV0YWRhdGEubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgcGFyYW1NZXRhZGF0YSA9IG1ldGFkYXRhW2ldO1xuXG4gICAgaWYgKHBhcmFtTWV0YWRhdGEgaW5zdGFuY2VvZiBUeXBlKSB7XG4gICAgICB0b2tlbiA9IHBhcmFtTWV0YWRhdGE7XG5cbiAgICB9IGVsc2UgaWYgKHBhcmFtTWV0YWRhdGEgaW5zdGFuY2VvZiBJbmplY3RNZXRhZGF0YSkge1xuICAgICAgdG9rZW4gPSBwYXJhbU1ldGFkYXRhLnRva2VuO1xuXG4gICAgfSBlbHNlIGlmIChwYXJhbU1ldGFkYXRhIGluc3RhbmNlb2YgT3B0aW9uYWxNZXRhZGF0YSkge1xuICAgICAgb3B0aW9uYWwgPSB0cnVlO1xuXG4gICAgfSBlbHNlIGlmIChwYXJhbU1ldGFkYXRhIGluc3RhbmNlb2YgU2VsZk1ldGFkYXRhKSB7XG4gICAgICB1cHBlckJvdW5kVmlzaWJpbGl0eSA9IHBhcmFtTWV0YWRhdGE7XG5cbiAgICB9IGVsc2UgaWYgKHBhcmFtTWV0YWRhdGEgaW5zdGFuY2VvZiBIb3N0TWV0YWRhdGEpIHtcbiAgICAgIHVwcGVyQm91bmRWaXNpYmlsaXR5ID0gcGFyYW1NZXRhZGF0YTtcblxuICAgIH0gZWxzZSBpZiAocGFyYW1NZXRhZGF0YSBpbnN0YW5jZW9mIFNraXBTZWxmTWV0YWRhdGEpIHtcbiAgICAgIGxvd2VyQm91bmRWaXNpYmlsaXR5ID0gcGFyYW1NZXRhZGF0YTtcblxuICAgIH0gZWxzZSBpZiAocGFyYW1NZXRhZGF0YSBpbnN0YW5jZW9mIERlcGVuZGVuY3lNZXRhZGF0YSkge1xuICAgICAgaWYgKGlzUHJlc2VudChwYXJhbU1ldGFkYXRhLnRva2VuKSkge1xuICAgICAgICB0b2tlbiA9IHBhcmFtTWV0YWRhdGEudG9rZW47XG4gICAgICB9XG4gICAgICBkZXBQcm9wcy5wdXNoKHBhcmFtTWV0YWRhdGEpO1xuICAgIH1cbiAgfVxuXG4gIHRva2VuID0gcmVzb2x2ZUZvcndhcmRSZWYodG9rZW4pO1xuXG4gIGlmIChpc1ByZXNlbnQodG9rZW4pKSB7XG4gICAgcmV0dXJuIF9jcmVhdGVEZXBlbmRlbmN5KHRva2VuLCBvcHRpb25hbCwgbG93ZXJCb3VuZFZpc2liaWxpdHksIHVwcGVyQm91bmRWaXNpYmlsaXR5LCBkZXBQcm9wcyk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IE5vQW5ub3RhdGlvbkVycm9yKHR5cGVPckZ1bmMsIHBhcmFtcyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2NyZWF0ZURlcGVuZGVuY3kodG9rZW4sIG9wdGlvbmFsLCBsb3dlckJvdW5kVmlzaWJpbGl0eSwgdXBwZXJCb3VuZFZpc2liaWxpdHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBQcm9wcyk6IERlcGVuZGVuY3kge1xuICByZXR1cm4gbmV3IERlcGVuZGVuY3koS2V5LmdldCh0b2tlbiksIG9wdGlvbmFsLCBsb3dlckJvdW5kVmlzaWJpbGl0eSwgdXBwZXJCb3VuZFZpc2liaWxpdHksXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBQcm9wcyk7XG59XG4iXX0=