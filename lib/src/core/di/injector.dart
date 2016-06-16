library angular2.src.core.di.injector;

import "package:angular2/src/facade/lang.dart" show stringify, isBlank;
import "package:angular2/src/facade/exceptions.dart"
    show unimplemented, BaseException;

const _THROW_IF_NOT_FOUND = const Object();
const THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;

class _NullInjector implements Injector {
  dynamic get(dynamic token, [dynamic notFoundValue = _THROW_IF_NOT_FOUND]) {
    if (identical(notFoundValue, _THROW_IF_NOT_FOUND)) {
      throw new BaseException('''No provider for ${ stringify ( token )}!''');
    }
    return notFoundValue;
  }
}

/**
 * The Injector interface. This class can also be used
 * to get hold of an Injector.
 */
abstract class Injector {
  static var THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;
  static Injector NULL = new _NullInjector();
  /**
   * Retrieves an instance from the injector based on the provided token.
   * If not found:
   * - Throws [NoProviderError] if no `notFoundValue` that is not equal to
   * Injector.THROW_IF_NOT_FOUND is given
   * - Returns the `notFoundValue` otherwise
   *
   * ### Example ([live demo](http://plnkr.co/edit/HeXSHg?p=preview))
   *
   * ```typescript
   * var injector = ReflectiveInjector.resolveAndCreate([
   *   provide("validToken", {useValue: "Value"})
   * ]);
   * expect(injector.get("validToken")).toEqual("Value");
   * expect(() => injector.get("invalidToken")).toThrowError();
   * ```
   *
   * `Injector` returns itself when given `Injector` as a token.
   *
   * ```typescript
   * var injector = ReflectiveInjector.resolveAndCreate([]);
   * expect(injector.get(Injector)).toBe(injector);
   * ```
   */
  dynamic get(dynamic token, [dynamic notFoundValue]) {
    return unimplemented();
  }
}

/**
 * An simple injector based on a Map of values.
 */
class MapInjector implements Injector {
  Injector _parent;
  Map<dynamic, dynamic> _values;
  MapInjector(this._parent, this._values) {
    if (isBlank(this._parent)) {
      this._parent = Injector.NULL;
    }
  }
  dynamic get(dynamic token, [dynamic notFoundValue = _THROW_IF_NOT_FOUND]) {
    if (identical(token, Injector)) {
      return this;
    }
    return this._values.containsKey(token)
        ? this._values[token]
        : this._parent.get(token, notFoundValue);
  }
}
