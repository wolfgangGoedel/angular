library angular2.test.compiler.static_reflector_spec;

import "package:angular2/testing_internal.dart"
    show describe, it, iit, expect, ddescribe, beforeEach;
import "package:angular2/src/facade/lang.dart" show IS_DART, isBlank;
import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "package:angular2/src/compiler/static_reflector.dart"
    show StaticReflector, StaticReflectorHost, StaticSymbol;

main() {
  // Static reflector is not supported in Dart

  // as we use reflection to create objects.
  if (IS_DART) return;
  var noContext = new StaticSymbol("", "", "");
  describe("StaticReflector", () {
    StaticReflectorHost host;
    StaticReflector reflector;
    beforeEach(() {
      host = new MockReflectorHost();
      reflector = new StaticReflector(host);
    });
    simplify(StaticSymbol context, dynamic value) {
      return reflector.simplify(context, value);
    }
    it("should get annotations for NgFor", () {
      var NgFor = host.findDeclaration(
          "angular2/src/common/directives/ng_for", "NgFor");
      var annotations = reflector.annotations(NgFor);
      expect(annotations.length).toEqual(1);
      var annotation = annotations[0];
      expect(annotation.selector).toEqual("[ngFor][ngForOf]");
      expect(annotation.inputs)
          .toEqual(["ngForTrackBy", "ngForOf", "ngForTemplate"]);
    });
    it("should get constructor for NgFor", () {
      var NgFor = host.findDeclaration(
          "angular2/src/common/directives/ng_for", "NgFor");
      var ViewContainerRef = host.findDeclaration(
          "angular2/src/core/linker/view_container_ref", "ViewContainerRef");
      var TemplateRef = host.findDeclaration(
          "angular2/src/core/linker/template_ref", "TemplateRef");
      var IterableDiffers = host.findDeclaration(
          "angular2/src/core/change_detection/differs/iterable_differs",
          "IterableDiffers");
      var ChangeDetectorRef = host.findDeclaration(
          "angular2/src/core/change_detection/change_detector_ref",
          "ChangeDetectorRef");
      var parameters = reflector.parameters(NgFor);
      expect(parameters).toEqual([
        [ViewContainerRef],
        [TemplateRef],
        [IterableDiffers],
        [ChangeDetectorRef]
      ]);
    });
    it("should get annotations for HeroDetailComponent", () {
      var HeroDetailComponent = host.findDeclaration(
          "src/app/hero-detail.component", "HeroDetailComponent");
      var annotations = reflector.annotations(HeroDetailComponent);
      expect(annotations.length).toEqual(1);
      var annotation = annotations[0];
      expect(annotation.selector).toEqual("my-hero-detail");
      expect(annotation.directives).toEqual([
        [host.findDeclaration("angular2/src/common/directives/ng_for", "NgFor")]
      ]);
    });
    it("should get and empty annotation list for an unknown class", () {
      var UnknownClass =
          host.findDeclaration("src/app/app.component", "UnknownClass");
      var annotations = reflector.annotations(UnknownClass);
      expect(annotations).toEqual([]);
    });
    it("should get propMetadata for HeroDetailComponent", () {
      var HeroDetailComponent = host.findDeclaration(
          "src/app/hero-detail.component", "HeroDetailComponent");
      var props = reflector.propMetadata(HeroDetailComponent);
      expect(props["hero"]).toBeTruthy();
    });
    it("should get an empty object from propMetadata for an unknown class", () {
      var UnknownClass =
          host.findDeclaration("src/app/app.component", "UnknownClass");
      var properties = reflector.propMetadata(UnknownClass);
      expect(properties).toEqual({});
    });
    it("should get empty parameters list for an unknown class ", () {
      var UnknownClass =
          host.findDeclaration("src/app/app.component", "UnknownClass");
      var parameters = reflector.parameters(UnknownClass);
      expect(parameters).toEqual([]);
    });
    it("should simplify primitive into itself", () {
      expect(simplify(noContext, 1)).toBe(1);
      expect(simplify(noContext, true)).toBe(true);
      expect(simplify(noContext, "some value")).toBe("some value");
    });
    it("should simplify an array into a copy of the array", () {
      expect(simplify(noContext, [1, 2, 3])).toEqual([1, 2, 3]);
    });
    it("should simplify an object to a copy of the object", () {
      var expr = {"a": 1, "b": 2, "c": 3};
      expect(simplify(noContext, expr)).toEqual(expr);
    });
    it("should simplify &&", () {
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "&&",
                "left": true,
                "right": true
              })))
          .toBe(true);
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "&&",
                "left": true,
                "right": false
              })))
          .toBe(false);
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "&&",
                "left": false,
                "right": true
              })))
          .toBe(false);
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "&&",
                "left": false,
                "right": false
              })))
          .toBe(false);
    });
    it("should simplify ||", () {
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "||",
                "left": true,
                "right": true
              })))
          .toBe(true);
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "||",
                "left": true,
                "right": false
              })))
          .toBe(true);
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "||",
                "left": false,
                "right": true
              })))
          .toBe(true);
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "||",
                "left": false,
                "right": false
              })))
          .toBe(false);
    });
    it("should simplify &", () {
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "&",
                "left": 0x22,
                "right": 0x0F
              })))
          .toBe(0x22 & 0x0F);
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "&",
                "left": 0x22,
                "right": 0xF0
              })))
          .toBe(0x22 & 0xF0);
    });
    it("should simplify |", () {
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "|",
                "left": 0x22,
                "right": 0x0F
              })))
          .toBe(0x22 | 0x0F);
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "|",
                "left": 0x22,
                "right": 0xF0
              })))
          .toBe(0x22 | 0xF0);
    });
    it("should simplify ^", () {
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "|",
                "left": 0x22,
                "right": 0x0F
              })))
          .toBe(0x22 | 0x0F);
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "|",
                "left": 0x22,
                "right": 0xF0
              })))
          .toBe(0x22 | 0xF0);
    });
    it("should simplify ==", () {
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "==",
                "left": 0x22,
                "right": 0x22
              })))
          .toBe(0x22 == 0x22);
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "==",
                "left": 0x22,
                "right": 0xF0
              })))
          .toBe(0x22 == 0xF0);
    });
    it("should simplify !=", () {
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "!=",
                "left": 0x22,
                "right": 0x22
              })))
          .toBe(0x22 != 0x22);
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "!=",
                "left": 0x22,
                "right": 0xF0
              })))
          .toBe(0x22 != 0xF0);
    });
    it("should simplify ===", () {
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "===",
                "left": 0x22,
                "right": 0x22
              })))
          .toBe(identical(0x22, 0x22));
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "===",
                "left": 0x22,
                "right": 0xF0
              })))
          .toBe(identical(0x22, 0xF0));
    });
    it("should simplify !==", () {
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "!==",
                "left": 0x22,
                "right": 0x22
              })))
          .toBe(!identical(0x22, 0x22));
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "!==",
                "left": 0x22,
                "right": 0xF0
              })))
          .toBe(!identical(0x22, 0xF0));
    });
    it("should simplify >", () {
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": ">",
                "left": 1,
                "right": 1
              })))
          .toBe(1 > 1);
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": ">",
                "left": 1,
                "right": 0
              })))
          .toBe(1 > 0);
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": ">",
                "left": 0,
                "right": 1
              })))
          .toBe(0 > 1);
    });
    it("should simplify >=", () {
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": ">=",
                "left": 1,
                "right": 1
              })))
          .toBe(1 >= 1);
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": ">=",
                "left": 1,
                "right": 0
              })))
          .toBe(1 >= 0);
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": ">=",
                "left": 0,
                "right": 1
              })))
          .toBe(0 >= 1);
    });
    it("should simplify <=", () {
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "<=",
                "left": 1,
                "right": 1
              })))
          .toBe(1 <= 1);
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "<=",
                "left": 1,
                "right": 0
              })))
          .toBe(1 <= 0);
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "<=",
                "left": 0,
                "right": 1
              })))
          .toBe(0 <= 1);
    });
    it("should simplify <", () {
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "<",
                "left": 1,
                "right": 1
              })))
          .toBe(1 < 1);
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "<",
                "left": 1,
                "right": 0
              })))
          .toBe(1 < 0);
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "<",
                "left": 0,
                "right": 1
              })))
          .toBe(0 < 1);
    });
    it("should simplify <<", () {
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "<<",
                "left": 0x55,
                "right": 2
              })))
          .toBe(0x55 << 2);
    });
    it("should simplify >>", () {
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": ">>",
                "left": 0x55,
                "right": 2
              })))
          .toBe(0x55 >> 2);
    });
    it("should simplify +", () {
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "+",
                "left": 0x55,
                "right": 2
              })))
          .toBe(0x55 + 2);
    });
    it("should simplify -", () {
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "-",
                "left": 0x55,
                "right": 2
              })))
          .toBe(0x55 - 2);
    });
    it("should simplify *", () {
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "*",
                "left": 0x55,
                "right": 2
              })))
          .toBe(0x55 * 2);
    });
    it("should simplify /", () {
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "/",
                "left": 0x55,
                "right": 2
              })))
          .toBe(0x55 / 2);
    });
    it("should simplify %", () {
      expect(simplify(
              noContext,
              ({
                "___symbolic": "binop",
                "operator": "%",
                "left": 0x55,
                "right": 2
              })))
          .toBe(0x55 % 2);
    });
    it("should simplify prefix -", () {
      expect(simplify(noContext,
              ({"___symbolic": "pre", "operator": "-", "operand": 2})))
          .toBe(-2);
    });
    it("should simplify prefix ~", () {
      expect(simplify(noContext,
              ({"___symbolic": "pre", "operator": "~", "operand": 2})))
          .toBe(~2);
    });
    it("should simplify prefix !", () {
      expect(simplify(noContext,
              ({"___symbolic": "pre", "operator": "!", "operand": true})))
          .toBe(!true);
      expect(simplify(noContext,
              ({"___symbolic": "pre", "operator": "!", "operand": false})))
          .toBe(!false);
    });
    it("should simplify an array index", () {
      expect(simplify(
              noContext,
              ({
                "___symbolic": "index",
                "expression": [1, 2, 3],
                "index": 2
              })))
          .toBe(3);
    });
    it("should simplify an object index", () {
      var expr = {
        "___symbolic": "select",
        "expression": {"a": 1, "b": 2, "c": 3},
        "member": "b"
      };
      expect(simplify(noContext, expr)).toBe(2);
    });
    it("should simplify a module reference", () {
      expect(simplify(
              new StaticSymbol("", "/src/cases", ""),
              ({
                "___symbolic": "reference",
                "module": "./extern",
                "name": "s"
              })))
          .toEqual("s");
    });
    it("should simplify a non existing reference as a static symbol", () {
      expect(simplify(
              new StaticSymbol("", "/src/cases", ""),
              ({
                "___symbolic": "reference",
                "module": "./extern",
                "name": "nonExisting"
              })))
          .toEqual(host.getStaticSymbol("", "/src/extern.d.ts", "nonExisting"));
    });
  });
}

class MockReflectorHost implements StaticReflectorHost {
  var staticTypeCache = new Map<String, StaticSymbol>();
  StaticSymbol getStaticSymbol(
      String moduleId, String declarationFile, String name) {
    var cacheKey = '''${ declarationFile}:${ name}''';
    var result = this.staticTypeCache[cacheKey];
    if (isBlank(result)) {
      result = new StaticSymbol(moduleId, declarationFile, name);
      this.staticTypeCache[cacheKey] = result;
    }
    return result;
  }

  // In tests, assume that symbols are not re-exported
  StaticSymbol findDeclaration(String modulePath, String symbolName,
      [String containingFile]) {
    List<String> splitPath(String path) {
      return path.split(new RegExp(r'\/|\\'));
    }
    String resolvePath(List<String> pathParts) {
      var result = [];
      ListWrapper.forEachWithIndex(pathParts, (part, index) {
        switch (part) {
          case "":
          case ".":
            if (index > 0) return;
            break;
          case "..":
            if (index > 0 && result.length != 0) result.removeLast();
            return;
        }
        result.add(part);
      });
      return result.join("/");
    }
    String pathTo(String from, String to) {
      var result = to;
      if (to.startsWith(".")) {
        var fromParts = splitPath(from);
        fromParts.removeLast();
        var toParts = splitPath(to);
        result = resolvePath((new List.from(fromParts)..addAll(toParts)));
      }
      return result;
    }
    if (identical(modulePath.indexOf("."), 0)) {
      return this.getStaticSymbol('''mod/${ symbolName}''',
          pathTo(containingFile, modulePath) + ".d.ts", symbolName);
    }
    return this.getStaticSymbol(
        '''mod/${ symbolName}''', "/tmp/" + modulePath + ".d.ts", symbolName);
  }

  dynamic getMetadataFor(String moduleId) {
    return {
      "/tmp/angular2/src/common/forms/directives.d.ts": {
        "___symbolic": "module",
        "metadata": {
          "FORM_DIRECTIVES": [
            {
              "___symbolic": "reference",
              "name": "NgFor",
              "module": "angular2/src/common/directives/ng_for"
            }
          ]
        }
      },
      "/tmp/angular2/src/common/directives/ng_for.d.ts": {
        "___symbolic": "module",
        "metadata": {
          "NgFor": {
            "___symbolic": "class",
            "decorators": [
              {
                "___symbolic": "call",
                "expression": {
                  "___symbolic": "reference",
                  "name": "Directive",
                  "module": "../../core/metadata"
                },
                "arguments": [
                  {
                    "selector": "[ngFor][ngForOf]",
                    "inputs": ["ngForTrackBy", "ngForOf", "ngForTemplate"]
                  }
                ]
              }
            ],
            "members": {
              "___ctor__": [
                {
                  "___symbolic": "constructor",
                  "parameters": [
                    {
                      "___symbolic": "reference",
                      "module": "../../core/linker/view_container_ref",
                      "name": "ViewContainerRef"
                    },
                    {
                      "___symbolic": "reference",
                      "module": "../../core/linker/template_ref",
                      "name": "TemplateRef"
                    },
                    {
                      "___symbolic": "reference",
                      "module":
                          "../../core/change_detection/differs/iterable_differs",
                      "name": "IterableDiffers"
                    },
                    {
                      "___symbolic": "reference",
                      "module":
                          "../../core/change_detection/change_detector_ref",
                      "name": "ChangeDetectorRef"
                    }
                  ]
                }
              ]
            }
          }
        }
      },
      "/tmp/angular2/src/core/linker/view_container_ref.d.ts": {
        "metadata": {
          "ViewContainerRef": {"___symbolic": "class"}
        }
      },
      "/tmp/angular2/src/core/linker/template_ref.d.ts": {
        "module": "./template_ref",
        "metadata": {
          "TemplateRef": {"___symbolic": "class"}
        }
      },
      "/tmp/angular2/src/core/change_detection/differs/iterable_differs.d.ts": {
        "metadata": {
          "IterableDiffers": {"___symbolic": "class"}
        }
      },
      "/tmp/angular2/src/core/change_detection/change_detector_ref.d.ts": {
        "metadata": {
          "ChangeDetectorRef": {"___symbolic": "class"}
        }
      },
      "/tmp/src/app/hero-detail.component.d.ts": {
        "___symbolic": "module",
        "metadata": {
          "HeroDetailComponent": {
            "___symbolic": "class",
            "decorators": [
              {
                "___symbolic": "call",
                "expression": {
                  "___symbolic": "reference",
                  "name": "Component",
                  "module": "angular2/src/core/metadata"
                },
                "arguments": [
                  {
                    "selector": "my-hero-detail",
                    "template":
                        "\n  <div *ngIf=\"hero\">\n    <h2>{{hero.name}} details!</h2>\n    <div><label>id: </label>{{hero.id}}</div>\n    <div>\n      <label>name: </label>\n      <input [(ngModel)]=\"hero.name\" placeholder=\"name\"/>\n    </div>\n  </div>\n",
                    "directives": [
                      {
                        "___symbolic": "reference",
                        "name": "FORM_DIRECTIVES",
                        "module": "angular2/src/common/forms/directives"
                      }
                    ]
                  }
                ]
              }
            ],
            "members": {
              "hero": [
                {
                  "___symbolic": "property",
                  "decorators": [
                    {
                      "___symbolic": "call",
                      "expression": {
                        "___symbolic": "reference",
                        "name": "Input",
                        "module": "angular2/src/core/metadata"
                      }
                    }
                  ]
                }
              ]
            }
          }
        }
      },
      "/src/extern.d.ts": {
        "___symbolic": "module",
        "metadata": {"s": "s"}
      }
    }[moduleId];
  }
}
