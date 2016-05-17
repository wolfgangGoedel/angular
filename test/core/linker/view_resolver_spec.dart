library angular2.test.core.linker.view_resolver_spec;

import "package:angular2/testing_internal.dart"
    show ddescribe, describe, it, iit, expect, beforeEach;
import "package:angular2/src/core/linker/view_resolver.dart" show ViewResolver;
import "package:angular2/src/core/metadata.dart" show Component, ViewMetadata;

class SomeDir {}

class SomePipe {}

@Component(
    selector: "sample",
    template: "some template",
    directives: const [SomeDir],
    pipes: const [SomePipe],
    styles: const ["some styles"])
class ComponentWithView {}

@Component(
    selector: "sample",
    template: "some template",
    directives: const [SomeDir],
    pipes: const [SomePipe],
    styles: const ["some styles"])
class ComponentWithTemplate {}

@Component(selector: "sample", template: "some template")
class ComponentWithViewTemplate {}

@Component(
    selector: "sample",
    templateUrl: "some template url",
    template: "some template")
class ComponentWithViewTemplateUrl {}

@Component(selector: "sample")
class ComponentWithoutView {}

class SimpleClass {}

main() {
  describe("ViewResolver", () {
    ViewResolver resolver;
    beforeEach(() {
      resolver = new ViewResolver();
    });
    it("should read out the View metadata from the Component metadata", () {
      var viewMetadata = resolver.resolve(ComponentWithTemplate);
      expect(viewMetadata).toEqual(new ViewMetadata(
          template: "some template",
          directives: [SomeDir],
          pipes: [SomePipe],
          styles: ["some styles"]));
    });
    it("should throw when Component has no View decorator and no template is set",
        () {
      expect(() => resolver.resolve(ComponentWithoutView)).toThrowErrorWith(
          "Component 'ComponentWithoutView' must have either 'template' or 'templateUrl' set");
    });
    it("should throw when simple class has no View decorator and no template is set",
        () {
      expect(() => resolver.resolve(SimpleClass)).toThrowErrorWith(
          "Could not compile 'SimpleClass' because it is not a component.");
    });
  });
}
