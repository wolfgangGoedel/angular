library angular2.src.compiler.static_reflector;

import "package:angular2/src/facade/collection.dart"
    show StringMapWrapper, ListWrapper;
import "package:angular2/src/facade/lang.dart"
    show isArray, isPresent, isBlank, isPrimitive, isStringMap, FunctionWrapper;
import "package:angular2/src/core/metadata.dart"
    show
        AttributeMetadata,
        DirectiveMetadata,
        ComponentMetadata,
        ContentChildrenMetadata,
        ContentChildMetadata,
        InputMetadata,
        HostBindingMetadata,
        HostListenerMetadata,
        OutputMetadata,
        PipeMetadata,
        ViewChildMetadata,
        ViewChildrenMetadata,
        ViewQueryMetadata,
        QueryMetadata;
import "package:angular2/src/core/reflection/reflector_reader.dart"
    show ReflectorReader;
import "package:angular2/src/core/reflection/reflection.dart" show reflector;
import "package:angular2/src/core/di/provider.dart" show Provider;
import "package:angular2/src/core/di/metadata.dart"
    show
        HostMetadata,
        OptionalMetadata,
        InjectableMetadata,
        SelfMetadata,
        SkipSelfMetadata,
        InjectMetadata;

/**
 * The host of the static resolver is expected to be able to provide module metadata in the form of
 * ModuleMetadata. Angular 2 CLI will produce this metadata for a module whenever a .d.ts files is
 * produced and the module has exported variables or classes with decorators. Module metadata can
 * also be produced directly from TypeScript sources by using MetadataCollector in tools/metadata.
 */
abstract class StaticReflectorHost {
  /**
   *  Return a ModuleMetadata for the given module.
   *
   * 
   * 
   */
  Map<String, dynamic> getMetadataFor(String modulePath);
  /**
   * Resolve a symbol from an import statement form, to the file where it is declared.
   * 
   * 
   */
  StaticSymbol findDeclaration(String modulePath, String symbolName,
      [String containingFile]);
  StaticSymbol getStaticSymbol(
      String moduleId, String declarationFile, String name);
}

/**
 * A token representing the a reference to a static type.
 *
 * This token is unique for a moduleId and name and can be used as a hash table key.
 */
class StaticSymbol {
  String moduleId;
  String filePath;
  String name;
  StaticSymbol(this.moduleId, this.filePath, this.name) {}
}

/**
 * A static reflector implements enough of the Reflector API that is necessary to compile
 * templates statically.
 */
class StaticReflector implements ReflectorReader {
  StaticReflectorHost host;
  var annotationCache = new Map<StaticSymbol, List<dynamic>>();
  var propertyCache = new Map<StaticSymbol, Map<String, dynamic>>();
  var parameterCache = new Map<StaticSymbol, List<dynamic>>();
  var metadataCache = new Map<String, Map<String, dynamic>>();
  var conversionMap = new Map<StaticSymbol,
      dynamic /* (context: StaticSymbol, args: any[]) => any */ >();
  StaticReflector(this.host) {
    this.initializeConversionMap();
  }
  String importUri(dynamic typeOrFunc) {
    return ((typeOrFunc as StaticSymbol)).filePath;
  }

  List<dynamic> annotations(StaticSymbol type) {
    var annotations = this.annotationCache[type];
    if (!isPresent(annotations)) {
      var classMetadata = this.getTypeMetadata(type);
      if (isPresent(classMetadata["decorators"])) {
        annotations = this.simplify(type, classMetadata["decorators"]);
      } else {
        annotations = [];
      }
      this.annotationCache[type] =
          annotations.where((ann) => isPresent(ann)).toList();
    }
    return annotations;
  }

  Map<String, dynamic> propMetadata(StaticSymbol type) {
    var propMetadata = this.propertyCache[type];
    if (!isPresent(propMetadata)) {
      var classMetadata = this.getTypeMetadata(type);
      var members = isPresent(classMetadata) ? classMetadata["members"] : {};
      propMetadata = mapStringMap(members, (propData, propName) {
        var prop = ((propData as List<dynamic>)).firstWhere(
            (a) => a["___symbolic"] == "property",
            orElse: () => null);
        if (isPresent(prop) && isPresent(prop["decorators"])) {
          return this.simplify(type, prop["decorators"]);
        } else {
          return [];
        }
      });
      this.propertyCache[type] = propMetadata;
    }
    return propMetadata;
  }

  List<dynamic> parameters(StaticSymbol type) {
    try {
      var parameters = this.parameterCache[type];
      if (!isPresent(parameters)) {
        var classMetadata = this.getTypeMetadata(type);
        var members =
            isPresent(classMetadata) ? classMetadata["members"] : null;
        var ctorData = isPresent(members) ? members["___ctor__"] : null;
        if (isPresent(ctorData)) {
          var ctor = ((ctorData as List<dynamic>)).firstWhere(
              (a) => a["___symbolic"] == "constructor",
              orElse: () => null);
          var parameterTypes =
              (this.simplify(type, ctor["parameters"]) as List<dynamic>);
          var parameterDecorators = (this
              .simplify(type, ctor["parameterDecorators"]) as List<dynamic>);
          parameters = [];
          ListWrapper.forEachWithIndex(parameterTypes, (paramType, index) {
            var nestedResult = [];
            if (isPresent(paramType)) {
              nestedResult.add(paramType);
            }
            var decorators = isPresent(parameterDecorators)
                ? parameterDecorators[index]
                : null;
            if (isPresent(decorators)) {
              ListWrapper.addAll(nestedResult, decorators);
            }
            parameters.add(nestedResult);
          });
        }
        if (!isPresent(parameters)) {
          parameters = [];
        }
        this.parameterCache[type] = parameters;
      }
      return parameters;
    } catch (e, e_stack) {
      print('''Failed on type ${ type} with error ${ e}''');
      rethrow;
    }
  }

  void registerDecoratorOrConstructor(StaticSymbol type, dynamic ctor) {
    this.conversionMap[type] = (StaticSymbol context, List<dynamic> args) {
      var argValues = [];
      ListWrapper.forEachWithIndex(args, (arg, index) {
        var argValue;
        if (isStringMap(arg) && isBlank(arg["___symbolic"])) {
          argValue =
              mapStringMap(arg, (value, key) => this.simplify(context, value));
        } else {
          argValue = this.simplify(context, arg);
        }
        argValues.add(argValue);
      });
      return FunctionWrapper.apply(reflector.factory(ctor), argValues);
    };
  }

  void initializeConversionMap() {
    var coreDecorators = "angular2/src/core/metadata";
    var diDecorators = "angular2/src/core/di/decorators";
    var diMetadata = "angular2/src/core/di/metadata";
    var provider = "angular2/src/core/di/provider";
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(provider, "Provider"), Provider);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(diDecorators, "Host"), HostMetadata);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(diDecorators, "Injectable"),
        InjectableMetadata);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(diDecorators, "Self"), SelfMetadata);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(diDecorators, "SkipSelf"), SkipSelfMetadata);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(diDecorators, "Inject"), InjectMetadata);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(diDecorators, "Optional"), OptionalMetadata);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(coreDecorators, "Attribute"),
        AttributeMetadata);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(coreDecorators, "Query"), QueryMetadata);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(coreDecorators, "ViewQuery"),
        ViewQueryMetadata);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(coreDecorators, "ContentChild"),
        ContentChildMetadata);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(coreDecorators, "ContentChildren"),
        ContentChildrenMetadata);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(coreDecorators, "ViewChild"),
        ViewChildMetadata);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(coreDecorators, "ViewChildren"),
        ViewChildrenMetadata);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(coreDecorators, "Input"), InputMetadata);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(coreDecorators, "Output"), OutputMetadata);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(coreDecorators, "Pipe"), PipeMetadata);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(coreDecorators, "HostBinding"),
        HostBindingMetadata);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(coreDecorators, "HostListener"),
        HostListenerMetadata);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(coreDecorators, "Directive"),
        DirectiveMetadata);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(coreDecorators, "Component"),
        ComponentMetadata);
    // Note: Some metadata classes can be used directly with Provider.deps.
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(diMetadata, "HostMetadata"), HostMetadata);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(diMetadata, "SelfMetadata"), SelfMetadata);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(diMetadata, "SkipSelfMetadata"),
        SkipSelfMetadata);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(diMetadata, "OptionalMetadata"),
        OptionalMetadata);
  }

  /** @internal */
  dynamic simplify(StaticSymbol context, dynamic value) {
    var _this = this;
    dynamic simplify(dynamic expression) {
      if (isPrimitive(expression)) {
        return expression;
      }
      if (isArray(expression)) {
        var result = [];
        for (var item in ((expression as dynamic))) {
          result.add(simplify(item));
        }
        return result;
      }
      if (isPresent(expression)) {
        if (isPresent(expression["___symbolic"])) {
          var staticSymbol;
          switch (expression["___symbolic"]) {
            case "binop":
              var left = simplify(expression["left"]);
              var right = simplify(expression["right"]);
              switch (expression["operator"]) {
                case "&&":
                  return left && right;
                case "||":
                  return left || right;
                case "|":
                  return (left as int) | (right as int);
                case "^":
                  return (left as int) ^ (right as int);
                case "&":
                  return (left as int) & (right as int);
                case "==":
                  return left == right;
                case "!=":
                  return left != right;
                case "===":
                  return identical(left, right);
                case "!==":
                  return !identical(left, right);
                case "<":
                  return left < right;
                case ">":
                  return left > right;
                case "<=":
                  return left <= right;
                case ">=":
                  return left >= right;
                case "<<":
                  return (left as int) << (right as int);
                case ">>":
                  return (left as int) >> (right as int);
                case "+":
                  return left + right;
                case "-":
                  return left - right;
                case "*":
                  return left * right;
                case "/":
                  return left / right;
                case "%":
                  return left % right;
              }
              return null;
            case "pre":
              var operand = simplify(expression["operand"]);
              switch (expression["operator"]) {
                case "+":
                  return operand;
                case "-":
                  return -operand;
                case "!":
                  return !operand;
                case "~":
                  return ~(operand as int);
              }
              return null;
            case "index":
              var indexTarget = simplify(expression["expression"]);
              var index = simplify(expression["index"]);
              if (isPresent(indexTarget) && isPrimitive(index))
                return indexTarget[index];
              return null;
            case "select":
              var selectTarget = simplify(expression["expression"]);
              var member = simplify(expression["member"]);
              if (isPresent(selectTarget) && isPrimitive(member))
                return selectTarget[member];
              return null;
            case "reference":
              if (isPresent(expression["module"])) {
                staticSymbol = _this.host.findDeclaration(
                    expression["module"], expression["name"], context.filePath);
              } else {
                staticSymbol = _this.host.getStaticSymbol(
                    context.moduleId, context.filePath, expression["name"]);
              }
              var result = staticSymbol;
              var moduleMetadata =
                  _this.getModuleMetadata(staticSymbol.filePath);
              var declarationValue = isPresent(moduleMetadata)
                  ? moduleMetadata["metadata"][staticSymbol.name]
                  : null;
              if (isPresent(declarationValue)) {
                if (isClassMetadata(declarationValue)) {
                  result = staticSymbol;
                } else {
                  result = _this.simplify(staticSymbol, declarationValue);
                }
              }
              return result;
            case "class":
              return context;
            case "new":
            case "call":
              var target = expression["expression"];
              staticSymbol = _this.host.findDeclaration(
                  target["module"], target["name"], context.filePath);
              var converter = _this.conversionMap[staticSymbol];
              if (isPresent(converter)) {
                var args = expression["arguments"];
                if (isBlank(args)) {
                  args = [];
                }
                return converter(context, args);
              } else {
                return context;
              }
          }
          return null;
        }
        return mapStringMap(expression, (value, name) => simplify(value));
      }
      return null;
    }
    return simplify(value);
  }

  /**
   * 
   */
  Map<String, dynamic> getModuleMetadata(String module) {
    var moduleMetadata = this.metadataCache[module];
    if (!isPresent(moduleMetadata)) {
      moduleMetadata = this.host.getMetadataFor(module);
      if (!isPresent(moduleMetadata)) {
        moduleMetadata = {
          "___symbolic": "module",
          "module": module,
          "metadata": {}
        };
      }
      this.metadataCache[module] = moduleMetadata;
    }
    return moduleMetadata;
  }

  Map<String, dynamic> getTypeMetadata(StaticSymbol type) {
    var moduleMetadata = this.getModuleMetadata(type.filePath);
    var result = moduleMetadata["metadata"][type.name];
    if (!isPresent(result)) {
      result = {"___symbolic": "class"};
    }
    return result;
  }
}

bool isClassMetadata(dynamic expression) {
  return !isPrimitive(expression) &&
      !isArray(expression) &&
      expression["___symbolic"] == "class";
}

Map<String, dynamic> mapStringMap(
    Map<String, dynamic> input, dynamic transform(dynamic value, String key)) {
  if (isBlank(input)) return {};
  var result = {};
  StringMapWrapper.keys(input).forEach((key) {
    result[key] = transform(input[key], key);
  });
  return result;
}
