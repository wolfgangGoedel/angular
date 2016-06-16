library angular2.test.core.linker.app_injector_integration_spec;

import "package:angular2/testing_internal.dart"
    show
        beforeEach,
        ddescribe,
        xdescribe,
        describe,
        expect,
        iit,
        inject,
        beforeEachProviders,
        it,
        xit;
import "package:angular2/src/facade/lang.dart" show IS_DART, stringify, Type;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/core.dart"
    show
        Injector,
        provide,
        Injectable,
        Provider,
        OpaqueToken,
        Inject,
        Host,
        SkipSelf,
        SkipSelfMetadata,
        SelfMetadata,
        Optional,
        InjectorModule,
        ComponentResolver,
        Provides;
import "package:angular2/compiler.dart" show CompilerConfig;

class Engine {}

class BrokenEngine {
  BrokenEngine() {
    throw new BaseException("Broken Engine");
  }
}

class DashboardSoftware {}

@Injectable()
class Dashboard {
  Dashboard(DashboardSoftware software) {}
}

class TurboEngine extends Engine {}

@Injectable()
class Car {
  Engine engine;
  Car(Engine engine) {
    this.engine = engine;
  }
}

@Injectable()
class CarWithOptionalEngine {
  var engine;
  CarWithOptionalEngine(@Optional() Engine engine) {
    this.engine = engine;
  }
}

@Injectable()
class CarWithDashboard {
  Engine engine;
  Dashboard dashboard;
  CarWithDashboard(Engine engine, Dashboard dashboard) {
    this.engine = engine;
    this.dashboard = dashboard;
  }
}

@Injectable()
class SportsCar extends Car {
  Engine engine;
  SportsCar(Engine engine) : super(engine) {
    /* super call moved to initializer */;
  }
}

@Injectable()
class CarWithInject {
  Engine engine;
  CarWithInject(@Inject(TurboEngine) Engine engine) {
    this.engine = engine;
  }
}

@Injectable()
class CyclicEngine {
  CyclicEngine(Car car) {}
}

class NoAnnotations {
  NoAnnotations(secretDependency) {}
}

factoryFn(a) {}

@Injectable()
class SomeService {}

@InjectorModule()
class SomeModule {}

@InjectorModule(providers: const [SomeService])
class SomeModuleWithProviders {}

@InjectorModule()
class SomeModuleWithProp {
  @Provides(Engine)
  String a = "aValue";
  @Provides("multiProp", multi: true)
  var multiProp = "aMultiValue";
}

@InjectorModule(providers: const [Car])
class SomeChildModuleWithProvider {
  SomeChildModuleWithProvider() {}
}

@InjectorModule()
class SomeChildModuleWithDeps {
  SomeService someService;
  SomeChildModuleWithDeps(this.someService) {}
}

@InjectorModule()
class SomeChildModuleWithProp {
  @Provides(Engine)
  String a = "aChildValue";
}

@InjectorModule()
class SomeModuleWithUnknownArgs {
  SomeModuleWithUnknownArgs(a, b, c) {}
}

main() {
  if (IS_DART) {
    declareTests(false);
  } else {
    describe("jit", () {
      beforeEachProviders(() => [
            provide(CompilerConfig,
                useValue: new CompilerConfig(true, false, true))
          ]);
      declareTests(true);
    });
    describe("no jit", () {
      beforeEachProviders(() => [
            provide(CompilerConfig,
                useValue: new CompilerConfig(true, false, false))
          ]);
      declareTests(false);
    });
  }
}

declareTests(bool isJit) {
  describe("generated injector integration tests", () {
    ComponentResolver compiler;
    beforeEach(inject([ComponentResolver], (_compiler) {
      compiler = _compiler;
    }));
    Injector createInjector(List<dynamic> providers, [Injector parent = null]) {
      return compiler
          .createInjectorFactory(SomeModule, providers)
          .create(parent);
    }
    it("should instantiate a class without dependencies", () {
      var injector = createInjector([Engine]);
      var engine = injector.get(Engine);
      expect(engine).toBeAnInstanceOf(Engine);
    });
    it("should resolve dependencies based on type information", () {
      var injector = createInjector([Engine, Car]);
      var car = injector.get(Car);
      expect(car).toBeAnInstanceOf(Car);
      expect(car.engine).toBeAnInstanceOf(Engine);
    });
    it("should resolve dependencies based on @Inject annotation", () {
      var injector = createInjector([TurboEngine, Engine, CarWithInject]);
      var car = injector.get(CarWithInject);
      expect(car).toBeAnInstanceOf(CarWithInject);
      expect(car.engine).toBeAnInstanceOf(TurboEngine);
    });
    it("should throw when no type and not @Inject (class case)", () {
      expect(() => createInjector([NoAnnotations])).toThrowError(
          "Cannot resolve all parameters for 'NoAnnotations'(?). " +
              "Make sure that all the parameters are decorated with Inject or have valid type annotations " +
              "and that 'NoAnnotations' is decorated with Injectable.");
    });
    it("should throw when no type and not @Inject (factory case)", () {
      expect(() =>
              createInjector([provide("someToken", useFactory: factoryFn)]))
          .toThrowError("Cannot resolve all parameters for 'factoryFn'(?). " +
              "Make sure that all the parameters are decorated with Inject or have valid type annotations " +
              "and that 'factoryFn' is decorated with Injectable.");
    });
    it("should cache instances", () {
      var injector = createInjector([Engine]);
      var e1 = injector.get(Engine);
      var e2 = injector.get(Engine);
      expect(e1).toBe(e2);
    });
    it("should provide to a value", () {
      var injector = createInjector([provide(Engine, useValue: "fake engine")]);
      var engine = injector.get(Engine);
      expect(engine).toEqual("fake engine");
    });
    it("should provide to a factory", () {
      sportsCarFactory(e) {
        return new SportsCar(e);
      }
      var injector = createInjector([
        Engine,
        provide(Car, useFactory: sportsCarFactory, deps: [Engine])
      ]);
      var car = injector.get(Car);
      expect(car).toBeAnInstanceOf(SportsCar);
      expect(car.engine).toBeAnInstanceOf(Engine);
    });
    it("should supporting provider to null", () {
      var injector = createInjector([provide(Engine, useValue: null)]);
      var engine = injector.get(Engine);
      expect(engine).toBeNull();
    });
    it("should provide to an alias", () {
      var injector = createInjector([
        Engine,
        provide(SportsCar, useClass: SportsCar),
        provide(Car, useExisting: SportsCar)
      ]);
      var car = injector.get(Car);
      var sportsCar = injector.get(SportsCar);
      expect(car).toBeAnInstanceOf(SportsCar);
      expect(car).toBe(sportsCar);
    });
    it("should support multiProviders", () {
      var injector = createInjector([
        Engine,
        provide(Car, useClass: SportsCar, multi: true),
        provide(Car, useClass: CarWithOptionalEngine, multi: true)
      ]);
      var cars = injector.get(Car);
      expect(cars.length).toEqual(2);
      expect(cars[0]).toBeAnInstanceOf(SportsCar);
      expect(cars[1]).toBeAnInstanceOf(CarWithOptionalEngine);
    });
    it("should support multiProviders that are created using useExisting", () {
      var injector = createInjector([
        Engine,
        SportsCar,
        provide(Car, useExisting: SportsCar, multi: true)
      ]);
      var cars = injector.get(Car);
      expect(cars.length).toEqual(1);
      expect(cars[0]).toBe(injector.get(SportsCar));
    });
    it("should throw when the aliased provider does not exist", () {
      var injector = createInjector([provide("car", useExisting: SportsCar)]);
      var e = '''No provider for ${ stringify ( SportsCar )}!''';
      expect(() => injector.get("car")).toThrowError(e);
    });
    it("should handle forwardRef in useExisting", () {
      var injector = createInjector([
        provide("originalEngine", useClass: Engine),
        provide("aliasedEngine", useExisting: ("originalEngine" as dynamic))
      ]);
      expect(injector.get("aliasedEngine")).toBeAnInstanceOf(Engine);
    });
    it("should support overriding factory dependencies", () {
      var injector = createInjector([
        Engine,
        provide(Car, useFactory: (e) => new SportsCar(e), deps: [Engine])
      ]);
      var car = injector.get(Car);
      expect(car).toBeAnInstanceOf(SportsCar);
      expect(car.engine).toBeAnInstanceOf(Engine);
    });
    it("should support optional dependencies", () {
      var injector = createInjector([CarWithOptionalEngine]);
      var car = injector.get(CarWithOptionalEngine);
      expect(car.engine).toEqual(null);
    });
    it("should flatten passed-in providers", () {
      var injector = createInjector([
        [
          [Engine, Car]
        ]
      ]);
      var car = injector.get(Car);
      expect(car).toBeAnInstanceOf(Car);
    });
    it("should use the last provider when there are multiple providers for same token",
        () {
      var injector = createInjector([
        provide(Engine, useClass: Engine),
        provide(Engine, useClass: TurboEngine)
      ]);
      expect(injector.get(Engine)).toBeAnInstanceOf(TurboEngine);
    });
    it("should use non-type tokens", () {
      var injector = createInjector([provide("token", useValue: "value")]);
      expect(injector.get("token")).toEqual("value");
    });
    it("should throw when given invalid providers", () {
      expect(() => createInjector((["blah"] as dynamic))).toThrowError(
          "Invalid provider - only instances of Provider and Type are allowed, got: blah");
    });
    it("should provide itself", () {
      var parent = createInjector([]);
      var child = createInjector([], parent);
      expect(child.get(Injector)).toBe(child);
    });
    it("should throw when no provider defined", () {
      var injector = createInjector([]);
      expect(() => injector.get("NonExisting"))
          .toThrowError("No provider for NonExisting!");
    });
    it("should throw when trying to instantiate a cyclic dependency", () {
      expect(() =>
              createInjector([Car, provide(Engine, useClass: CyclicEngine)]))
          .toThrowError(
              new RegExp(r'Cannot instantiate cyclic dependency! Car'));
    });
    it("should support null values", () {
      var injector = createInjector([provide("null", useValue: null)]);
      expect(injector.get("null")).toBe(null);
    });
    describe("child", () {
      it("should load instances from parent injector", () {
        var parent = createInjector([Engine]);
        var child = createInjector([], parent);
        var engineFromParent = parent.get(Engine);
        var engineFromChild = child.get(Engine);
        expect(engineFromChild).toBe(engineFromParent);
      });
      it("should not use the child providers when resolving the dependencies of a parent provider",
          () {
        var parent = createInjector([Car, Engine]);
        var child =
            createInjector([provide(Engine, useClass: TurboEngine)], parent);
        var carFromChild = child.get(Car);
        expect(carFromChild.engine).toBeAnInstanceOf(Engine);
      });
      it("should create new instance in a child injector", () {
        var parent = createInjector([Engine]);
        var child =
            createInjector([provide(Engine, useClass: TurboEngine)], parent);
        var engineFromParent = parent.get(Engine);
        var engineFromChild = child.get(Engine);
        expect(engineFromParent).not.toBe(engineFromChild);
        expect(engineFromChild).toBeAnInstanceOf(TurboEngine);
      });
    });
    describe("depedency resolution", () {
      describe("@Self()", () {
        it("should return a dependency from self", () {
          var inj = createInjector([
            Engine,
            provide(Car, useFactory: (e) => new Car(e), deps: [
              [Engine, new SelfMetadata()]
            ])
          ]);
          expect(inj.get(Car)).toBeAnInstanceOf(Car);
        });
        it("should throw when not requested provider on self", () {
          expect(() => createInjector([
                provide(Car, useFactory: (e) => new Car(e), deps: [
                  [Engine, new SelfMetadata()]
                ])
              ])).toThrowError(new RegExp(r'No provider for Engine'));
        });
      });
      describe("default", () {
        it("should not skip self", () {
          var parent = createInjector([Engine]);
          var child = createInjector([
            provide(Engine, useClass: TurboEngine),
            provide(Car, useFactory: (e) => new Car(e), deps: [Engine])
          ], parent);
          expect(child.get(Car).engine).toBeAnInstanceOf(TurboEngine);
        });
      });
    });
    describe("modules", () {
      it("should use the providers of the module", () {
        var factory = compiler.createInjectorFactory(SomeModuleWithProviders);
        var injector = factory.create();
        expect(injector.get(SomeService)).toBeAnInstanceOf(SomeService);
      });
      it("should provide the main module", () {
        var factory = compiler.createInjectorFactory(SomeModule);
        var someModule = new SomeModule();
        var injector = factory.create(null, someModule);
        expect(injector.get(SomeModule)).toBe(someModule);
      });
      it("should throw when asking for the main module and it was not given",
          () {
        var factory = compiler.createInjectorFactory(SomeModule);
        var injector = factory.create();
        expect(() => injector.get(SomeModule))
            .toThrowError('''No provider for ${ stringify ( SomeModule )}!''');
      });
      it("should use the providers of child modules (types)", () {
        var injector = createInjector([SomeChildModuleWithProvider, Engine]);
        expect(injector.get(SomeChildModuleWithProvider))
            .toBeAnInstanceOf(SomeChildModuleWithProvider);
        expect(injector.get(Car)).toBeAnInstanceOf(Car);
      });
      it("should use the providers of child modules (providers)", () {
        var injector = createInjector([
          provide(SomeChildModuleWithProvider,
              useClass: SomeChildModuleWithProvider),
          Engine
        ]);
        expect(injector.get(SomeChildModuleWithProvider))
            .toBeAnInstanceOf(SomeChildModuleWithProvider);
        expect(injector.get(Car)).toBeAnInstanceOf(Car);
      });
      it("should inject deps into child modules", () {
        var injector = createInjector([SomeChildModuleWithDeps, SomeService]);
        expect(injector.get(SomeChildModuleWithDeps).someService)
            .toBeAnInstanceOf(SomeService);
      });
      it("should support modules whose constructor arguments cannot be injected",
          () {
        var factory = compiler.createInjectorFactory(SomeModuleWithUnknownArgs);
        expect(factory.create().get(Injector)).toBeTruthy();
        factory = compiler.createInjectorFactory(SomeModule, [
          new Provider(SomeModuleWithUnknownArgs,
              useValue: new SomeModuleWithUnknownArgs(1, 2, 3))
        ]);
        expect(factory.create().get(Injector)).toBeTruthy();
      });
    });
    describe("provider properties", () {
      Injector createInjector(Type mainModuleType, List<dynamic> providers,
          [mainModule = null]) {
        return compiler
            .createInjectorFactory(mainModuleType, providers)
            .create(null, mainModule);
      }
      it("should support multi providers", () {
        var inj = createInjector(
            SomeModuleWithProp,
            [new Provider("multiProp", useValue: "bMultiValue", multi: true)],
            new SomeModuleWithProp());
        expect(inj.get("multiProp")).toEqual(["aMultiValue", "bMultiValue"]);
      });
      describe("properties on initial module", () {
        it("should support provider properties", () {
          var inj =
              createInjector(SomeModuleWithProp, [], new SomeModuleWithProp());
          expect(inj.get(Engine)).toBe("aValue");
        });
        it("should throw if the module is missing when the injector is created",
            () {
          expect(() => createInjector(SomeModuleWithProp, []))
              .toThrowError("This injector needs a main module instance!");
        });
      });
      describe("properties on child modules", () {
        it("should support provider properties", () {
          var inj = createInjector(SomeModule, [SomeChildModuleWithProp]);
          expect(inj.get(Engine)).toBe("aChildValue");
        });
        it("should throw if the module is missing when the value is read", () {
          var inj = createInjector(SomeModule, [
            new Provider(Engine,
                useProperty: "a", useExisting: SomeChildModuleWithProp)
          ]);
          expect(() => inj.get(Engine)).toThrowError(
              '''No provider for ${ stringify ( SomeChildModuleWithProp )}!''');
        });
      });
    });
  });
}
