library angular2.src.compiler.util;

import "package:angular2/src/facade/lang.dart"
    show
        IS_DART,
        StringWrapper,
        Math,
        isBlank,
        isArray,
        isStrictStringMap,
        isPrimitive;
import "package:angular2/src/facade/collection.dart" show StringMapWrapper;

var MODULE_SUFFIX = IS_DART ? ".dart" : "";
var CAMEL_CASE_REGEXP = new RegExp(r'([A-Z])');
var DASH_CASE_REGEXP = new RegExp(r'-([a-z])');
String camelCaseToDashCase(String input) {
  return StringWrapper.replaceAllMapped(input, CAMEL_CASE_REGEXP, (m) {
    return "-" + m[1].toLowerCase();
  });
}

String dashCaseToCamelCase(String input) {
  return StringWrapper.replaceAllMapped(input, DASH_CASE_REGEXP, (m) {
    return m[1].toUpperCase();
  });
}

List<String> splitAtColon(String input, List<String> defaultValues) {
  var parts = StringWrapper.split(input.trim(), new RegExp(r'\s*:\s*'));
  if (parts.length > 1) {
    return parts;
  } else {
    return defaultValues;
  }
}

String sanitizeIdentifier(String name) {
  return StringWrapper.replaceAll(name, new RegExp(r'\W'), "_");
}

dynamic visitValue(dynamic value, ValueVisitor visitor, dynamic context) {
  if (isArray(value)) {
    return visitor.visitArray((value as List<dynamic>), context);
  } else if (isStrictStringMap(value)) {
    return visitor.visitStringMap((value as Map<String, dynamic>), context);
  } else if (isBlank(value) || isPrimitive(value)) {
    return visitor.visitPrimitive(value, context);
  } else {
    return visitor.visitOther(value, context);
  }
}

abstract class ValueVisitor {
  dynamic visitArray(List<dynamic> arr, dynamic context);
  dynamic visitStringMap(Map<String, dynamic> map, dynamic context);
  dynamic visitPrimitive(dynamic value, dynamic context);
  dynamic visitOther(dynamic value, dynamic context);
}

class ValueTransformer implements ValueVisitor {
  dynamic visitArray(List<dynamic> arr, dynamic context) {
    return arr.map((value) => visitValue(value, this, context)).toList();
  }

  dynamic visitStringMap(Map<String, dynamic> map, dynamic context) {
    var result = {};
    StringMapWrapper.forEach(map, (value, key) {
      result[key] = visitValue(value, this, context);
    });
    return result;
  }

  dynamic visitPrimitive(dynamic value, dynamic context) {
    return value;
  }

  dynamic visitOther(dynamic value, dynamic context) {
    return value;
  }
}
