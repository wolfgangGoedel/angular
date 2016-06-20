library angular2.src.core.di.map_injector;

import "package:angular2/src/facade/lang.dart" show isBlank;
import "injector.dart" show Injector, InjectorFactory, THROW_IF_NOT_FOUND;

/**
 * An simple injector based on a Map of values.
 */
class MapInjector implements Injector {
  Injector _parent;
  static InjectorFactory<dynamic> createFactory(
      [Map<dynamic, dynamic> values,
      Map<dynamic, dynamic /* (injector: Injector) => any */ > factories]) {
    return new MapInjectorFactory(values, factories);
  }

  Map<dynamic, dynamic> _instances = new Map<dynamic, dynamic>();
  Map<dynamic, dynamic /* (injector: Injector) => any */ > _factories;
  Map<dynamic, dynamic> _values;
  MapInjector(
      [this._parent = null,
      Map<dynamic, dynamic> values = null,
      Map<dynamic, dynamic /* (injector: Injector) => any */ > factories =
          null]) {
    if (isBlank(values)) {
      values = new Map<dynamic, dynamic>();
    }
    this._values = values;
    if (isBlank(factories)) {
      factories = new Map<dynamic, dynamic>();
    }
    this._factories = factories;
    if (isBlank(this._parent)) {
      this._parent = Injector.NULL;
    }
  }
  dynamic get(dynamic token, [dynamic notFoundValue = THROW_IF_NOT_FOUND]) {
    if (identical(token, Injector)) {
      return this;
    }
    if (this._values.containsKey(token)) {
      return this._values[token];
    }
    if (this._instances.containsKey(token)) {
      return this._instances[token];
    }
    if (this._factories.containsKey(token)) {
      var instance = this._factories[token](this);
      this._instances[token] = instance;
      return instance;
    }
    return this._parent.get(token, notFoundValue);
  }
}

/**
 * InjectorFactory for MapInjector.
 */
class MapInjectorFactory implements InjectorFactory<dynamic> {
  Map<dynamic, dynamic> _values;
  Map<dynamic, dynamic /* (injector: Injector) => any */ > _factories;
  MapInjectorFactory([this._values = null, this._factories = null]) {}
  Injector create([Injector parent = null, dynamic context = null]) {
    return new MapInjector(parent, this._values, this._factories);
  }
}
