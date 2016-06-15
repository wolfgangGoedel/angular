import { Type } from 'angular2/src/facade/lang';
import { ComponentFactory } from './component_factory';
import { InjectorFactory } from './injector_factory';
/**
 * Low-level service for loading {@link ComponentFactory}s, which
 * can later be used to create and render a Component instance.
 */
export declare abstract class ComponentResolver {
    abstract resolveComponent(componentType: Type): Promise<ComponentFactory>;
    abstract createInjectorFactory(injectorModule: Type, extraProviders?: any[]): InjectorFactory<any>;
    abstract clearCache(): any;
}
export declare class ReflectorComponentResolver extends ComponentResolver {
    resolveComponent(componentType: Type): Promise<ComponentFactory>;
    createInjectorFactory(injectorModule: Type, extraProviders?: any[]): InjectorFactory<any>;
    clearCache(): void;
}
