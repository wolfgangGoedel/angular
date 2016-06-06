library angular2.test.core.linker.reflector_component_resolver_spec;

import "package:angular2/testing_internal.dart"
    show
        ddescribe,
        describe,
        xdescribe,
        it,
        iit,
        xit,
        expect,
        beforeEach,
        afterEach,
        AsyncTestCompleter,
        inject,
        beforeEachProviders;
import "package:angular2/core.dart" show provide;
import "package:angular2/src/core/linker/component_resolver.dart"
    show ComponentResolver, ReflectorComponentResolver;
import "package:angular2/src/core/reflection/reflection.dart"
    show reflector, ReflectionInfo;
import "package:angular2/src/core/linker/component_factory.dart"
    show ComponentFactory;

main() {
  describe("Compiler", () {
    var someCompFactory;
    beforeEachProviders(() =>
        [provide(ComponentResolver, useClass: ReflectorComponentResolver)]);
    beforeEach(inject([ComponentResolver], (_compiler) {
      someCompFactory = new ComponentFactory(null, null, null);
      reflector.registerType(
          SomeComponent, new ReflectionInfo([someCompFactory]));
    }));
    it(
        "should read the template from an annotation",
        inject([AsyncTestCompleter, ComponentResolver],
            (async, ComponentResolver compiler) {
          compiler
              .resolveComponent(SomeComponent)
              .then((ComponentFactory compFactory) {
            expect(compFactory).toBe(someCompFactory);
            async.done();
            return null;
          });
        }));
  });
}

class SomeComponent {}
