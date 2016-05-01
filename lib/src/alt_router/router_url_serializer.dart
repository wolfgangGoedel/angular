library angular2.src.alt_router.router_url_serializer;

import "segments.dart" show UrlSegment, Tree, TreeNode, rootNode, UrlTree;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/facade/lang.dart"
    show isBlank, isPresent, RegExpWrapper;
import "package:angular2/src/facade/collection.dart" show ListWrapper;

abstract class RouterUrlSerializer {
  UrlTree parse(String url);
  String serialize(UrlTree tree);
}

class DefaultRouterUrlSerializer extends RouterUrlSerializer {
  UrlTree parse(String url) {
    var root = new _UrlParser().parse(url);
    return new UrlTree(root);
  }

  String serialize(UrlTree tree) {
    return _serializeUrlTreeNode(rootNode(tree));
  }
}

String _serializeUrlTreeNode(TreeNode<UrlSegment> node) {
  return '''${ node . value}${ _serializeChildren ( node )}''';
}

String _serializeUrlTreeNodes(List<TreeNode<UrlSegment>> nodes) {
  var main = nodes[0].value.toString();
  var auxNodes = ListWrapper.slice(nodes, 1);
  var aux = auxNodes.length > 0
      ? '''(${ auxNodes . map ( _serializeUrlTreeNode ) . toList ( ) . join ( "//" )})'''
      : "";
  var children = _serializeChildren(nodes[0]);
  return '''${ main}${ aux}${ children}''';
}

String _serializeChildren(TreeNode<UrlSegment> node) {
  if (node.children.length > 0) {
    var slash = isBlank(node.children[0].value.segment) ? "" : "/";
    return '''${ slash}${ _serializeUrlTreeNodes ( node . children )}''';
  } else {
    return "";
  }
}

var SEGMENT_RE = RegExpWrapper.create("^[^\\/\\(\\)\\?;=&#]+");
String matchUrlSegment(String str) {
  var match = RegExpWrapper.firstMatch(SEGMENT_RE, str);
  return isPresent(match) ? match[0] : "";
}

var QUERY_PARAM_VALUE_RE = RegExpWrapper.create("^[^\\(\\)\\?;&#]+");
String matchUrlQueryParamValue(String str) {
  var match = RegExpWrapper.firstMatch(QUERY_PARAM_VALUE_RE, str);
  return isPresent(match) ? match[0] : "";
}

class _UrlParser {
  String _remaining;
  bool peekStartsWith(String str) {
    return this._remaining.startsWith(str);
  }

  void capture(String str) {
    if (!this._remaining.startsWith(str)) {
      throw new BaseException('''Expected "${ str}".''');
    }
    this._remaining = this._remaining.substring(str.length);
  }

  TreeNode<UrlSegment> parse(String url) {
    this._remaining = url;
    if (url == "" || url == "/") {
      return new TreeNode<UrlSegment>(new UrlSegment("", null, null), []);
    } else {
      return this.parseRoot();
    }
  }

  TreeNode<UrlSegment> parseRoot() {
    var segments = this.parseSegments();
    var queryParams = this.peekStartsWith("?") ? this.parseQueryParams() : null;
    return new TreeNode<UrlSegment>(
        new UrlSegment("", queryParams, null), segments);
  }

  List<TreeNode<UrlSegment>> parseSegments([String outletName = null]) {
    if (this._remaining.length == 0) {
      return [];
    }
    if (this.peekStartsWith("/")) {
      this.capture("/");
    }
    var path = matchUrlSegment(this._remaining);
    this.capture(path);
    if (path.indexOf(":") > -1) {
      var parts = path.split(":");
      outletName = parts[0];
      path = parts[1];
    }
    Map<String, dynamic> matrixParams = null;
    if (this.peekStartsWith(";")) {
      matrixParams = this.parseMatrixParams();
    }
    var aux = [];
    if (this.peekStartsWith("(")) {
      aux = this.parseAuxiliaryRoutes();
    }
    List<TreeNode<UrlSegment>> children = [];
    if (this.peekStartsWith("/") && !this.peekStartsWith("//")) {
      this.capture("/");
      children = this.parseSegments();
    }
    if (isPresent(matrixParams)) {
      var matrixParamsSegment = new UrlSegment(null, matrixParams, null);
      var matrixParamsNode =
          new TreeNode<UrlSegment>(matrixParamsSegment, children);
      var segment = new UrlSegment(path, null, outletName);
      return [
        new TreeNode<UrlSegment>(
            segment, (new List.from([matrixParamsNode])..addAll(aux)))
      ];
    } else {
      var segment = new UrlSegment(path, null, outletName);
      var node = new TreeNode<UrlSegment>(segment, children);
      return (new List.from([node])..addAll(aux));
    }
  }

  Map<String, dynamic> parseQueryParams() {
    Map<String, dynamic> params = {};
    this.capture("?");
    this.parseQueryParam(params);
    while (this._remaining.length > 0 && this.peekStartsWith("&")) {
      this.capture("&");
      this.parseQueryParam(params);
    }
    return params;
  }

  Map<String, dynamic> parseMatrixParams() {
    Map<String, dynamic> params = {};
    while (this._remaining.length > 0 && this.peekStartsWith(";")) {
      this.capture(";");
      this.parseParam(params);
    }
    return params;
  }

  void parseParam(Map<String, dynamic> params) {
    var key = matchUrlSegment(this._remaining);
    if (isBlank(key)) {
      return;
    }
    this.capture(key);
    dynamic value = "true";
    if (this.peekStartsWith("=")) {
      this.capture("=");
      var valueMatch = matchUrlSegment(this._remaining);
      if (isPresent(valueMatch)) {
        value = valueMatch;
        this.capture(value);
      }
    }
    params[key] = value;
  }

  void parseQueryParam(Map<String, dynamic> params) {
    var key = matchUrlSegment(this._remaining);
    if (isBlank(key)) {
      return;
    }
    this.capture(key);
    dynamic value = "true";
    if (this.peekStartsWith("=")) {
      this.capture("=");
      var valueMatch = matchUrlQueryParamValue(this._remaining);
      if (isPresent(valueMatch)) {
        value = valueMatch;
        this.capture(value);
      }
    }
    params[key] = value;
  }

  List<TreeNode<UrlSegment>> parseAuxiliaryRoutes() {
    var segments = [];
    this.capture("(");
    while (!this.peekStartsWith(")") && this._remaining.length > 0) {
      segments = (new List.from(segments)..addAll(this.parseSegments("aux")));
      if (this.peekStartsWith("//")) {
        this.capture("//");
      }
    }
    this.capture(")");
    return segments;
  }
}
