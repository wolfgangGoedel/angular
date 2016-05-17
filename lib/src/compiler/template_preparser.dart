library angular2.src.compiler.template_preparser;

import "html_ast.dart" show HtmlElementAst;
import "package:angular2/src/facade/lang.dart" show isBlank, isPresent;
import "html_tags.dart" show splitNsName;

final NG_CONTENT_SELECT_ATTR = "select";
final NG_CONTENT_ELEMENT = "ng-content";
final LINK_ELEMENT = "link";
final LINK_STYLE_REL_ATTR = "rel";
final LINK_STYLE_HREF_ATTR = "href";
final LINK_STYLE_REL_VALUE = "stylesheet";
final STYLE_ELEMENT = "style";
final SCRIPT_ELEMENT = "script";
final NG_NON_BINDABLE_ATTR = "ngNonBindable";
final NG_PROJECT_AS = "ngProjectAs";
PreparsedElement preparseElement(HtmlElementAst ast) {
  var selectAttr = null;
  var hrefAttr = null;
  var relAttr = null;
  var nonBindable = false;
  String projectAs = null;
  ast.attrs.forEach((attr) {
    var lcAttrName = attr.name.toLowerCase();
    if (lcAttrName == NG_CONTENT_SELECT_ATTR) {
      selectAttr = attr.value;
    } else if (lcAttrName == LINK_STYLE_HREF_ATTR) {
      hrefAttr = attr.value;
    } else if (lcAttrName == LINK_STYLE_REL_ATTR) {
      relAttr = attr.value;
    } else if (attr.name == NG_NON_BINDABLE_ATTR) {
      nonBindable = true;
    } else if (attr.name == NG_PROJECT_AS) {
      if (attr.value.length > 0) {
        projectAs = attr.value;
      }
    }
  });
  selectAttr = normalizeNgContentSelect(selectAttr);
  var nodeName = ast.name.toLowerCase();
  var type = PreparsedElementType.OTHER;
  if (splitNsName(nodeName)[1] == NG_CONTENT_ELEMENT) {
    type = PreparsedElementType.NG_CONTENT;
  } else if (nodeName == STYLE_ELEMENT) {
    type = PreparsedElementType.STYLE;
  } else if (nodeName == SCRIPT_ELEMENT) {
    type = PreparsedElementType.SCRIPT;
  } else if (nodeName == LINK_ELEMENT && relAttr == LINK_STYLE_REL_VALUE) {
    type = PreparsedElementType.STYLESHEET;
  }
  return new PreparsedElement(
      type, selectAttr, hrefAttr, nonBindable, projectAs);
}

enum PreparsedElementType { NG_CONTENT, STYLE, STYLESHEET, SCRIPT, OTHER }

class PreparsedElement {
  PreparsedElementType type;
  String selectAttr;
  String hrefAttr;
  bool nonBindable;
  String projectAs;
  PreparsedElement(this.type, this.selectAttr, this.hrefAttr, this.nonBindable,
      this.projectAs) {}
}

String normalizeNgContentSelect(String selectAttr) {
  if (isBlank(selectAttr) || identical(selectAttr.length, 0)) {
    return "*";
  }
  return selectAttr;
}
