library angular2.test.core.di.injector_spec;

import "package:angular2/testing_internal.dart"
    show describe, ddescribe, it, iit, expect, beforeEach;
import "package:angular2/core.dart" show Injector, InjectorFactory;

main() {
  describe("Injector.NULL", () {
    it("should throw if no arg is given", () {
      expect(() => Injector.NULL.get("someToken"))
          .toThrowError("No provider for someToken!");
    });
    it("should throw if THROW_IF_NOT_FOUND is given", () {
      expect(() => Injector.NULL.get("someToken", Injector.THROW_IF_NOT_FOUND))
          .toThrowError("No provider for someToken!");
    });
    it("should return the default value", () {
      expect(Injector.NULL.get("someToken", "notFound")).toEqual("notFound");
    });
  });
  describe("InjectorFactory.EMPTY", () {
    it("should return Injector.NULL if no parent is given", () {
      expect(InjectorFactory.EMPTY.create()).toBe(Injector.NULL);
    });
  });
}
