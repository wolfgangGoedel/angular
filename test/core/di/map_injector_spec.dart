library angular2.test.core.di.map_injector_spec;

import "package:angular2/testing_internal.dart"
    show describe, ddescribe, it, iit, expect, beforeEach;
import "package:angular2/core.dart" show Injector, MapInjectorFactory;
import "package:angular2/src/facade/collection.dart" show MapWrapper;

main() {
  describe("MapInjector", () {
    it("should throw if not found", () {
      expect(() => new MapInjectorFactory().create().get("someToken"))
          .toThrowError("No provider for someToken!");
    });
    it("should return the default value", () {
      expect(new MapInjectorFactory().create().get("someToken", "notFound"))
          .toEqual("notFound");
    });
    it("should return a value from the map", () {
      expect(new MapInjectorFactory(MapWrapper.createFromPairs([
        ["someToken", "someValue"]
      ])).create().get("someToken"))
          .toEqual("someValue");
    });
    it("should return the injector", () {
      var injector = new MapInjectorFactory().create();
      expect(injector.get(Injector)).toBe(injector);
    });
    it("should delegate to the parent", () {
      var parent = new MapInjectorFactory(MapWrapper.createFromPairs([
        ["someToken", "someValue"]
      ])).create();
      expect(new MapInjectorFactory().create(parent).get("someToken"))
          .toEqual("someValue");
    });
  });
}
