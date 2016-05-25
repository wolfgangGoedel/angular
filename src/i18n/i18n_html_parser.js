'use strict';"use strict";
var html_parser_1 = require('angular2/src/compiler/html_parser');
var html_ast_1 = require('angular2/src/compiler/html_ast');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var message_1 = require('./message');
var expander_1 = require('./expander');
var shared_1 = require('./shared');
var _I18N_ATTR = "i18n";
var _PLACEHOLDER_ELEMENT = "ph";
var _NAME_ATTR = "name";
var _I18N_ATTR_PREFIX = "i18n-";
var _PLACEHOLDER_EXPANDED_REGEXP = lang_1.RegExpWrapper.create("\\<ph(\\s)+name=(\"(\\w)+\")\\>\\<\\/ph\\>");
/**
 * Creates an i18n-ed version of the parsed template.
 *
 * Algorithm:
 *
 * To understand the algorithm, you need to know how partitioning works.
 * Partitioning is required as we can use two i18n comments to group node siblings together.
 * That is why we cannot just use nodes.
 *
 * Partitioning transforms an array of HtmlAst into an array of Part.
 * A part can optionally contain a root element or a root text node. And it can also contain
 * children.
 * A part can contain i18n property, in which case it needs to be transalted.
 *
 * Example:
 *
 * The following array of nodes will be split into four parts:
 *
 * ```
 * <a>A</a>
 * <b i18n>B</b>
 * <!-- i18n -->
 * <c>C</c>
 * D
 * <!-- /i18n -->
 * E
 * ```
 *
 * Part 1 containing the a tag. It should not be translated.
 * Part 2 containing the b tag. It should be translated.
 * Part 3 containing the c tag and the D text node. It should be translated.
 * Part 4 containing the E text node. It should not be translated.
 *
 *
 * It is also important to understand how we stringify nodes to create a message.
 *
 * We walk the tree and replace every element node with a placeholder. We also replace
 * all expressions in interpolation with placeholders. We also insert a placeholder element
 * to wrap a text node containing interpolation.
 *
 * Example:
 *
 * The following tree:
 *
 * ```
 * <a>A{{I}}</a><b>B</b>
 * ```
 *
 * will be stringified into:
 * ```
 * <ph name="e0"><ph name="t1">A<ph name="0"/></ph></ph><ph name="e2">B</ph>
 * ```
 *
 * This is what the algorithm does:
 *
 * 1. Use the provided html parser to get the html AST of the template.
 * 2. Partition the root nodes, and process each part separately.
 * 3. If a part does not have the i18n attribute, recurse to process children and attributes.
 * 4. If a part has the i18n attribute, merge the translated i18n part with the original tree.
 *
 * This is how the merging works:
 *
 * 1. Use the stringify function to get the message id. Look up the message in the map.
 * 2. Get the translated message. At this point we have two trees: the original tree
 * and the translated tree, where all the elements are replaced with placeholders.
 * 3. Use the original tree to create a mapping Index:number -> HtmlAst.
 * 4. Walk the translated tree.
 * 5. If we encounter a placeholder element, get is name property.
 * 6. Get the type and the index of the node using the name property.
 * 7. If the type is 'e', which means element, then:
 *     - translate the attributes of the original element
 *     - recurse to merge the children
 *     - create a new element using the original element name, original position,
 *     and translated children and attributes
 * 8. If the type if 't', which means text, then:
 *     - get the list of expressions from the original node.
 *     - get the string version of the interpolation subtree
 *     - find all the placeholders in the translated message, and replace them with the
 *     corresponding original expressions
 */
var I18nHtmlParser = (function () {
    function I18nHtmlParser(_htmlParser, _parser, _messagesContent, _messages) {
        this._htmlParser = _htmlParser;
        this._parser = _parser;
        this._messagesContent = _messagesContent;
        this._messages = _messages;
    }
    I18nHtmlParser.prototype.parse = function (sourceContent, sourceUrl, parseExpansionForms) {
        if (parseExpansionForms === void 0) { parseExpansionForms = false; }
        this.errors = [];
        var res = this._htmlParser.parse(sourceContent, sourceUrl, true);
        if (res.errors.length > 0) {
            return res;
        }
        else {
            var nodes = this._recurse(expander_1.expandNodes(res.rootNodes).nodes);
            return this.errors.length > 0 ? new html_parser_1.HtmlParseTreeResult([], this.errors) :
                new html_parser_1.HtmlParseTreeResult(nodes, []);
        }
    };
    I18nHtmlParser.prototype._processI18nPart = function (p) {
        try {
            return p.hasI18n ? this._mergeI18Part(p) : this._recurseIntoI18nPart(p);
        }
        catch (e) {
            if (e instanceof shared_1.I18nError) {
                this.errors.push(e);
                return [];
            }
            else {
                throw e;
            }
        }
    };
    I18nHtmlParser.prototype._mergeI18Part = function (p) {
        var message = p.createMessage(this._parser);
        var messageId = message_1.id(message);
        if (!collection_1.StringMapWrapper.contains(this._messages, messageId)) {
            throw new shared_1.I18nError(p.sourceSpan, "Cannot find message for id '" + messageId + "', content '" + message.content + "'.");
        }
        var parsedMessage = this._messages[messageId];
        return this._mergeTrees(p, parsedMessage, p.children);
    };
    I18nHtmlParser.prototype._recurseIntoI18nPart = function (p) {
        // we found an element without an i18n attribute
        // we need to recurse in cause its children may have i18n set
        // we also need to translate its attributes
        if (lang_1.isPresent(p.rootElement)) {
            var root = p.rootElement;
            var children = this._recurse(p.children);
            var attrs = this._i18nAttributes(root);
            return [
                new html_ast_1.HtmlElementAst(root.name, attrs, children, root.sourceSpan, root.startSourceSpan, root.endSourceSpan)
            ];
        }
        else if (lang_1.isPresent(p.rootTextNode)) {
            return [p.rootTextNode];
        }
        else {
            return this._recurse(p.children);
        }
    };
    I18nHtmlParser.prototype._recurse = function (nodes) {
        var _this = this;
        var ps = shared_1.partition(nodes, this.errors);
        return collection_1.ListWrapper.flatten(ps.map(function (p) { return _this._processI18nPart(p); }));
    };
    I18nHtmlParser.prototype._mergeTrees = function (p, translated, original) {
        var l = new _CreateNodeMapping();
        html_ast_1.htmlVisitAll(l, original);
        // merge the translated tree with the original tree.
        // we do it by preserving the source code position of the original tree
        var merged = this._mergeTreesHelper(translated, l.mapping);
        // if the root element is present, we need to create a new root element with its attributes
        // translated
        if (lang_1.isPresent(p.rootElement)) {
            var root = p.rootElement;
            var attrs = this._i18nAttributes(root);
            return [
                new html_ast_1.HtmlElementAst(root.name, attrs, merged, root.sourceSpan, root.startSourceSpan, root.endSourceSpan)
            ];
        }
        else if (lang_1.isPresent(p.rootTextNode)) {
            throw new exceptions_1.BaseException("should not be reached");
        }
        else {
            return merged;
        }
    };
    I18nHtmlParser.prototype._mergeTreesHelper = function (translated, mapping) {
        var _this = this;
        return translated.map(function (t) {
            if (t instanceof html_ast_1.HtmlElementAst) {
                return _this._mergeElementOrInterpolation(t, translated, mapping);
            }
            else if (t instanceof html_ast_1.HtmlTextAst) {
                return t;
            }
            else {
                throw new exceptions_1.BaseException("should not be reached");
            }
        });
    };
    I18nHtmlParser.prototype._mergeElementOrInterpolation = function (t, translated, mapping) {
        var name = this._getName(t);
        var type = name[0];
        var index = lang_1.NumberWrapper.parseInt(name.substring(1), 10);
        var originalNode = mapping[index];
        if (type == "t") {
            return this._mergeTextInterpolation(t, originalNode);
        }
        else if (type == "e") {
            return this._mergeElement(t, originalNode, mapping);
        }
        else {
            throw new exceptions_1.BaseException("should not be reached");
        }
    };
    I18nHtmlParser.prototype._getName = function (t) {
        if (t.name != _PLACEHOLDER_ELEMENT) {
            throw new shared_1.I18nError(t.sourceSpan, "Unexpected tag \"" + t.name + "\". Only \"" + _PLACEHOLDER_ELEMENT + "\" tags are allowed.");
        }
        var names = t.attrs.filter(function (a) { return a.name == _NAME_ATTR; });
        if (names.length == 0) {
            throw new shared_1.I18nError(t.sourceSpan, "Missing \"" + _NAME_ATTR + "\" attribute.");
        }
        return names[0].value;
    };
    I18nHtmlParser.prototype._mergeTextInterpolation = function (t, originalNode) {
        var split = this._parser.splitInterpolation(originalNode.value, originalNode.sourceSpan.toString());
        var exps = lang_1.isPresent(split) ? split.expressions : [];
        var messageSubstring = this._messagesContent.substring(t.startSourceSpan.end.offset, t.endSourceSpan.start.offset);
        var translated = this._replacePlaceholdersWithExpressions(messageSubstring, exps, originalNode.sourceSpan);
        return new html_ast_1.HtmlTextAst(translated, originalNode.sourceSpan);
    };
    I18nHtmlParser.prototype._mergeElement = function (t, originalNode, mapping) {
        var children = this._mergeTreesHelper(t.children, mapping);
        return new html_ast_1.HtmlElementAst(originalNode.name, this._i18nAttributes(originalNode), children, originalNode.sourceSpan, originalNode.startSourceSpan, originalNode.endSourceSpan);
    };
    I18nHtmlParser.prototype._i18nAttributes = function (el) {
        var _this = this;
        var res = [];
        el.attrs.forEach(function (attr) {
            if (attr.name.startsWith(shared_1.I18N_ATTR_PREFIX) || attr.name == shared_1.I18N_ATTR)
                return;
            var i18ns = el.attrs.filter(function (a) { return a.name == "i18n-" + attr.name; });
            if (i18ns.length == 0) {
                res.push(attr);
                return;
            }
            var i18n = i18ns[0];
            var message = shared_1.messageFromAttribute(_this._parser, el, i18n);
            var messageId = message_1.id(message);
            if (collection_1.StringMapWrapper.contains(_this._messages, messageId)) {
                var updatedMessage = _this._replaceInterpolationInAttr(attr, _this._messages[messageId]);
                res.push(new html_ast_1.HtmlAttrAst(attr.name, updatedMessage, attr.sourceSpan));
            }
            else {
                throw new shared_1.I18nError(attr.sourceSpan, "Cannot find message for id '" + messageId + "', content '" + message.content + "'.");
            }
        });
        return res;
    };
    I18nHtmlParser.prototype._replaceInterpolationInAttr = function (attr, msg) {
        var split = this._parser.splitInterpolation(attr.value, attr.sourceSpan.toString());
        var exps = lang_1.isPresent(split) ? split.expressions : [];
        var first = msg[0];
        var last = msg[msg.length - 1];
        var start = first.sourceSpan.start.offset;
        var end = last instanceof html_ast_1.HtmlElementAst ? last.endSourceSpan.end.offset : last.sourceSpan.end.offset;
        var messageSubstring = this._messagesContent.substring(start, end);
        return this._replacePlaceholdersWithExpressions(messageSubstring, exps, attr.sourceSpan);
    };
    ;
    I18nHtmlParser.prototype._replacePlaceholdersWithExpressions = function (message, exps, sourceSpan) {
        var _this = this;
        var expMap = this._buildExprMap(exps);
        return lang_1.RegExpWrapper.replaceAll(_PLACEHOLDER_EXPANDED_REGEXP, message, function (match) {
            var nameWithQuotes = match[2];
            var name = nameWithQuotes.substring(1, nameWithQuotes.length - 1);
            return _this._convertIntoExpression(name, expMap, sourceSpan);
        });
    };
    I18nHtmlParser.prototype._buildExprMap = function (exps) {
        var expMap = new Map();
        var usedNames = new Map();
        for (var i = 0; i < exps.length; i++) {
            var phName = shared_1.getPhNameFromBinding(exps[i], i);
            expMap.set(shared_1.dedupePhName(usedNames, phName), exps[i]);
        }
        return expMap;
    };
    I18nHtmlParser.prototype._convertIntoExpression = function (name, expMap, sourceSpan) {
        if (expMap.has(name)) {
            return "{{" + expMap.get(name) + "}}";
        }
        else {
            throw new shared_1.I18nError(sourceSpan, "Invalid interpolation name '" + name + "'");
        }
    };
    return I18nHtmlParser;
}());
exports.I18nHtmlParser = I18nHtmlParser;
var _CreateNodeMapping = (function () {
    function _CreateNodeMapping() {
        this.mapping = [];
    }
    _CreateNodeMapping.prototype.visitElement = function (ast, context) {
        this.mapping.push(ast);
        html_ast_1.htmlVisitAll(this, ast.children);
        return null;
    };
    _CreateNodeMapping.prototype.visitAttr = function (ast, context) { return null; };
    _CreateNodeMapping.prototype.visitText = function (ast, context) {
        this.mapping.push(ast);
        return null;
    };
    _CreateNodeMapping.prototype.visitExpansion = function (ast, context) { return null; };
    _CreateNodeMapping.prototype.visitExpansionCase = function (ast, context) { return null; };
    _CreateNodeMapping.prototype.visitComment = function (ast, context) { return ""; };
    return _CreateNodeMapping;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9odG1sX3BhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtaUZDaW9tTlAudG1wL2FuZ3VsYXIyL3NyYy9pMThuL2kxOG5faHRtbF9wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDRCQUE4QyxtQ0FBbUMsQ0FBQyxDQUFBO0FBRWxGLHlCQVVPLGdDQUFnQyxDQUFDLENBQUE7QUFDeEMsMkJBQTRDLGdDQUFnQyxDQUFDLENBQUE7QUFDN0UscUJBQXNELDBCQUEwQixDQUFDLENBQUE7QUFDakYsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFFN0Qsd0JBQTBCLFdBQVcsQ0FBQyxDQUFBO0FBQ3RDLHlCQUEwQixZQUFZLENBQUMsQ0FBQTtBQUN2Qyx1QkFXTyxVQUFVLENBQUMsQ0FBQTtBQUVsQixJQUFNLFVBQVUsR0FBRyxNQUFNLENBQUM7QUFDMUIsSUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUM7QUFDbEMsSUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDO0FBQzFCLElBQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDO0FBQ2xDLElBQUksNEJBQTRCLEdBQUcsb0JBQWEsQ0FBQyxNQUFNLENBQUMsNENBQTBDLENBQUMsQ0FBQztBQUVwRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQStFRztBQUNIO0lBR0Usd0JBQW9CLFdBQXVCLEVBQVUsT0FBZSxFQUNoRCxnQkFBd0IsRUFBVSxTQUFxQztRQUR2RSxnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQUFVLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDaEQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFRO1FBQVUsY0FBUyxHQUFULFNBQVMsQ0FBNEI7SUFBRyxDQUFDO0lBRS9GLDhCQUFLLEdBQUwsVUFBTSxhQUFxQixFQUFF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Z0IsRUFBRSxPQUFZO1FBQ3RDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsMkNBQWMsR0FBZCxVQUFlLEdBQXFCLEVBQUUsT0FBWSxJQUFTLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBRXpFLCtDQUFrQixHQUFsQixVQUFtQixHQUF5QixFQUFFLE9BQVksSUFBUyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUVqRix5Q0FBWSxHQUFaLFVBQWEsR0FBbUIsRUFBRSxPQUFZLElBQVMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDckUseUJBQUM7QUFBRCxDQUFDLEFBckJELElBcUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtIdG1sUGFyc2VyLCBIdG1sUGFyc2VUcmVlUmVzdWx0fSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvaHRtbF9wYXJzZXInO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW4sIFBhcnNlRXJyb3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9wYXJzZV91dGlsJztcbmltcG9ydCB7XG4gIEh0bWxBc3QsXG4gIEh0bWxBc3RWaXNpdG9yLFxuICBIdG1sRWxlbWVudEFzdCxcbiAgSHRtbEF0dHJBc3QsXG4gIEh0bWxUZXh0QXN0LFxuICBIdG1sQ29tbWVudEFzdCxcbiAgSHRtbEV4cGFuc2lvbkFzdCxcbiAgSHRtbEV4cGFuc2lvbkNhc2VBc3QsXG4gIGh0bWxWaXNpdEFsbFxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvaHRtbF9hc3QnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7UmVnRXhwV3JhcHBlciwgTnVtYmVyV3JhcHBlciwgaXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtQYXJzZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vcGFyc2VyL3BhcnNlcic7XG5pbXBvcnQge01lc3NhZ2UsIGlkfSBmcm9tICcuL21lc3NhZ2UnO1xuaW1wb3J0IHtleHBhbmROb2Rlc30gZnJvbSAnLi9leHBhbmRlcic7XG5pbXBvcnQge1xuICBtZXNzYWdlRnJvbUF0dHJpYnV0ZSxcbiAgSTE4bkVycm9yLFxuICBJMThOX0FUVFJfUFJFRklYLFxuICBJMThOX0FUVFIsXG4gIHBhcnRpdGlvbixcbiAgUGFydCxcbiAgc3RyaW5naWZ5Tm9kZXMsXG4gIG1lYW5pbmcsXG4gIGdldFBoTmFtZUZyb21CaW5kaW5nLFxuICBkZWR1cGVQaE5hbWVcbn0gZnJvbSAnLi9zaGFyZWQnO1xuXG5jb25zdCBfSTE4Tl9BVFRSID0gXCJpMThuXCI7XG5jb25zdCBfUExBQ0VIT0xERVJfRUxFTUVOVCA9IFwicGhcIjtcbmNvbnN0IF9OQU1FX0FUVFIgPSBcIm5hbWVcIjtcbmNvbnN0IF9JMThOX0FUVFJfUFJFRklYID0gXCJpMThuLVwiO1xubGV0IF9QTEFDRUhPTERFUl9FWFBBTkRFRF9SRUdFWFAgPSBSZWdFeHBXcmFwcGVyLmNyZWF0ZShgXFxcXDxwaChcXFxccykrbmFtZT0oXCIoXFxcXHcpK1wiKVxcXFw+XFxcXDxcXFxcL3BoXFxcXD5gKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGkxOG4tZWQgdmVyc2lvbiBvZiB0aGUgcGFyc2VkIHRlbXBsYXRlLlxuICpcbiAqIEFsZ29yaXRobTpcbiAqXG4gKiBUbyB1bmRlcnN0YW5kIHRoZSBhbGdvcml0aG0sIHlvdSBuZWVkIHRvIGtub3cgaG93IHBhcnRpdGlvbmluZyB3b3Jrcy5cbiAqIFBhcnRpdGlvbmluZyBpcyByZXF1aXJlZCBhcyB3ZSBjYW4gdXNlIHR3byBpMThuIGNvbW1lbnRzIHRvIGdyb3VwIG5vZGUgc2libGluZ3MgdG9nZXRoZXIuXG4gKiBUaGF0IGlzIHdoeSB3ZSBjYW5ub3QganVzdCB1c2Ugbm9kZXMuXG4gKlxuICogUGFydGl0aW9uaW5nIHRyYW5zZm9ybXMgYW4gYXJyYXkgb2YgSHRtbEFzdCBpbnRvIGFuIGFycmF5IG9mIFBhcnQuXG4gKiBBIHBhcnQgY2FuIG9wdGlvbmFsbHkgY29udGFpbiBhIHJvb3QgZWxlbWVudCBvciBhIHJvb3QgdGV4dCBub2RlLiBBbmQgaXQgY2FuIGFsc28gY29udGFpblxuICogY2hpbGRyZW4uXG4gKiBBIHBhcnQgY2FuIGNvbnRhaW4gaTE4biBwcm9wZXJ0eSwgaW4gd2hpY2ggY2FzZSBpdCBuZWVkcyB0byBiZSB0cmFuc2FsdGVkLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogVGhlIGZvbGxvd2luZyBhcnJheSBvZiBub2RlcyB3aWxsIGJlIHNwbGl0IGludG8gZm91ciBwYXJ0czpcbiAqXG4gKiBgYGBcbiAqIDxhPkE8L2E+XG4gKiA8YiBpMThuPkI8L2I+XG4gKiA8IS0tIGkxOG4gLS0+XG4gKiA8Yz5DPC9jPlxuICogRFxuICogPCEtLSAvaTE4biAtLT5cbiAqIEVcbiAqIGBgYFxuICpcbiAqIFBhcnQgMSBjb250YWluaW5nIHRoZSBhIHRhZy4gSXQgc2hvdWxkIG5vdCBiZSB0cmFuc2xhdGVkLlxuICogUGFydCAyIGNvbnRhaW5pbmcgdGhlIGIgdGFnLiBJdCBzaG91bGQgYmUgdHJhbnNsYXRlZC5cbiAqIFBhcnQgMyBjb250YWluaW5nIHRoZSBjIHRhZyBhbmQgdGhlIEQgdGV4dCBub2RlLiBJdCBzaG91bGQgYmUgdHJhbnNsYXRlZC5cbiAqIFBhcnQgNCBjb250YWluaW5nIHRoZSBFIHRleHQgbm9kZS4gSXQgc2hvdWxkIG5vdCBiZSB0cmFuc2xhdGVkLlxuICpcbiAqXG4gKiBJdCBpcyBhbHNvIGltcG9ydGFudCB0byB1bmRlcnN0YW5kIGhvdyB3ZSBzdHJpbmdpZnkgbm9kZXMgdG8gY3JlYXRlIGEgbWVzc2FnZS5cbiAqXG4gKiBXZSB3YWxrIHRoZSB0cmVlIGFuZCByZXBsYWNlIGV2ZXJ5IGVsZW1lbnQgbm9kZSB3aXRoIGEgcGxhY2Vob2xkZXIuIFdlIGFsc28gcmVwbGFjZVxuICogYWxsIGV4cHJlc3Npb25zIGluIGludGVycG9sYXRpb24gd2l0aCBwbGFjZWhvbGRlcnMuIFdlIGFsc28gaW5zZXJ0IGEgcGxhY2Vob2xkZXIgZWxlbWVudFxuICogdG8gd3JhcCBhIHRleHQgbm9kZSBjb250YWluaW5nIGludGVycG9sYXRpb24uXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBUaGUgZm9sbG93aW5nIHRyZWU6XG4gKlxuICogYGBgXG4gKiA8YT5Be3tJfX08L2E+PGI+QjwvYj5cbiAqIGBgYFxuICpcbiAqIHdpbGwgYmUgc3RyaW5naWZpZWQgaW50bzpcbiAqIGBgYFxuICogPHBoIG5hbWU9XCJlMFwiPjxwaCBuYW1lPVwidDFcIj5BPHBoIG5hbWU9XCIwXCIvPjwvcGg+PC9waD48cGggbmFtZT1cImUyXCI+QjwvcGg+XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGlzIHdoYXQgdGhlIGFsZ29yaXRobSBkb2VzOlxuICpcbiAqIDEuIFVzZSB0aGUgcHJvdmlkZWQgaHRtbCBwYXJzZXIgdG8gZ2V0IHRoZSBodG1sIEFTVCBvZiB0aGUgdGVtcGxhdGUuXG4gKiAyLiBQYXJ0aXRpb24gdGhlIHJvb3Qgbm9kZXMsIGFuZCBwcm9jZXNzIGVhY2ggcGFydCBzZXBhcmF0ZWx5LlxuICogMy4gSWYgYSBwYXJ0IGRvZXMgbm90IGhhdmUgdGhlIGkxOG4gYXR0cmlidXRlLCByZWN1cnNlIHRvIHByb2Nlc3MgY2hpbGRyZW4gYW5kIGF0dHJpYnV0ZXMuXG4gKiA0LiBJZiBhIHBhcnQgaGFzIHRoZSBpMThuIGF0dHJpYnV0ZSwgbWVyZ2UgdGhlIHRyYW5zbGF0ZWQgaTE4biBwYXJ0IHdpdGggdGhlIG9yaWdpbmFsIHRyZWUuXG4gKlxuICogVGhpcyBpcyBob3cgdGhlIG1lcmdpbmcgd29ya3M6XG4gKlxuICogMS4gVXNlIHRoZSBzdHJpbmdpZnkgZnVuY3Rpb24gdG8gZ2V0IHRoZSBtZXNzYWdlIGlkLiBMb29rIHVwIHRoZSBtZXNzYWdlIGluIHRoZSBtYXAuXG4gKiAyLiBHZXQgdGhlIHRyYW5zbGF0ZWQgbWVzc2FnZS4gQXQgdGhpcyBwb2ludCB3ZSBoYXZlIHR3byB0cmVlczogdGhlIG9yaWdpbmFsIHRyZWVcbiAqIGFuZCB0aGUgdHJhbnNsYXRlZCB0cmVlLCB3aGVyZSBhbGwgdGhlIGVsZW1lbnRzIGFyZSByZXBsYWNlZCB3aXRoIHBsYWNlaG9sZGVycy5cbiAqIDMuIFVzZSB0aGUgb3JpZ2luYWwgdHJlZSB0byBjcmVhdGUgYSBtYXBwaW5nIEluZGV4Om51bWJlciAtPiBIdG1sQXN0LlxuICogNC4gV2FsayB0aGUgdHJhbnNsYXRlZCB0cmVlLlxuICogNS4gSWYgd2UgZW5jb3VudGVyIGEgcGxhY2Vob2xkZXIgZWxlbWVudCwgZ2V0IGlzIG5hbWUgcHJvcGVydHkuXG4gKiA2LiBHZXQgdGhlIHR5cGUgYW5kIHRoZSBpbmRleCBvZiB0aGUgbm9kZSB1c2luZyB0aGUgbmFtZSBwcm9wZXJ0eS5cbiAqIDcuIElmIHRoZSB0eXBlIGlzICdlJywgd2hpY2ggbWVhbnMgZWxlbWVudCwgdGhlbjpcbiAqICAgICAtIHRyYW5zbGF0ZSB0aGUgYXR0cmlidXRlcyBvZiB0aGUgb3JpZ2luYWwgZWxlbWVudFxuICogICAgIC0gcmVjdXJzZSB0byBtZXJnZSB0aGUgY2hpbGRyZW5cbiAqICAgICAtIGNyZWF0ZSBhIG5ldyBlbGVtZW50IHVzaW5nIHRoZSBvcmlnaW5hbCBlbGVtZW50IG5hbWUsIG9yaWdpbmFsIHBvc2l0aW9uLFxuICogICAgIGFuZCB0cmFuc2xhdGVkIGNoaWxkcmVuIGFuZCBhdHRyaWJ1dGVzXG4gKiA4LiBJZiB0aGUgdHlwZSBpZiAndCcsIHdoaWNoIG1lYW5zIHRleHQsIHRoZW46XG4gKiAgICAgLSBnZXQgdGhlIGxpc3Qgb2YgZXhwcmVzc2lvbnMgZnJvbSB0aGUgb3JpZ2luYWwgbm9kZS5cbiAqICAgICAtIGdldCB0aGUgc3RyaW5nIHZlcnNpb24gb2YgdGhlIGludGVycG9sYXRpb24gc3VidHJlZVxuICogICAgIC0gZmluZCBhbGwgdGhlIHBsYWNlaG9sZGVycyBpbiB0aGUgdHJhbnNsYXRlZCBtZXNzYWdlLCBhbmQgcmVwbGFjZSB0aGVtIHdpdGggdGhlXG4gKiAgICAgY29ycmVzcG9uZGluZyBvcmlnaW5hbCBleHByZXNzaW9uc1xuICovXG5leHBvcnQgY2xhc3MgSTE4bkh0bWxQYXJzZXIgaW1wbGVtZW50cyBIdG1sUGFyc2VyIHtcbiAgZXJyb3JzOiBQYXJzZUVycm9yW107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfaHRtbFBhcnNlcjogSHRtbFBhcnNlciwgcHJpdmF0ZSBfcGFyc2VyOiBQYXJzZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgX21lc3NhZ2VzQ29udGVudDogc3RyaW5nLCBwcml2YXRlIF9tZXNzYWdlczoge1trZXk6IHN0cmluZ106IEh0bWxBc3RbXX0pIHt9XG5cbiAgcGFyc2Uoc291cmNlQ29udGVudDogc3RyaW5nLCBzb3VyY2VVcmw6IHN0cmluZyxcbiAgICAgICAgcGFyc2VFeHBhbnNpb25Gb3JtczogYm9vbGVhbiA9IGZhbHNlKTogSHRtbFBhcnNlVHJlZVJlc3VsdCB7XG4gICAgdGhpcy5lcnJvcnMgPSBbXTtcblxuICAgIGxldCByZXMgPSB0aGlzLl9odG1sUGFyc2VyLnBhcnNlKHNvdXJjZUNvbnRlbnQsIHNvdXJjZVVybCwgdHJ1ZSk7XG4gICAgaWYgKHJlcy5lcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IG5vZGVzID0gdGhpcy5fcmVjdXJzZShleHBhbmROb2RlcyhyZXMucm9vdE5vZGVzKS5ub2Rlcyk7XG4gICAgICByZXR1cm4gdGhpcy5lcnJvcnMubGVuZ3RoID4gMCA/IG5ldyBIdG1sUGFyc2VUcmVlUmVzdWx0KFtdLCB0aGlzLmVycm9ycykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgSHRtbFBhcnNlVHJlZVJlc3VsdChub2RlcywgW10pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3Byb2Nlc3NJMThuUGFydChwOiBQYXJ0KTogSHRtbEFzdFtdIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHAuaGFzSTE4biA/IHRoaXMuX21lcmdlSTE4UGFydChwKSA6IHRoaXMuX3JlY3Vyc2VJbnRvSTE4blBhcnQocCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBJMThuRXJyb3IpIHtcbiAgICAgICAgdGhpcy5lcnJvcnMucHVzaChlKTtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9tZXJnZUkxOFBhcnQocDogUGFydCk6IEh0bWxBc3RbXSB7XG4gICAgbGV0IG1lc3NhZ2UgPSBwLmNyZWF0ZU1lc3NhZ2UodGhpcy5fcGFyc2VyKTtcbiAgICBsZXQgbWVzc2FnZUlkID0gaWQobWVzc2FnZSk7XG4gICAgaWYgKCFTdHJpbmdNYXBXcmFwcGVyLmNvbnRhaW5zKHRoaXMuX21lc3NhZ2VzLCBtZXNzYWdlSWQpKSB7XG4gICAgICB0aHJvdyBuZXcgSTE4bkVycm9yKFxuICAgICAgICAgIHAuc291cmNlU3BhbiwgYENhbm5vdCBmaW5kIG1lc3NhZ2UgZm9yIGlkICcke21lc3NhZ2VJZH0nLCBjb250ZW50ICcke21lc3NhZ2UuY29udGVudH0nLmApO1xuICAgIH1cblxuICAgIGxldCBwYXJzZWRNZXNzYWdlID0gdGhpcy5fbWVzc2FnZXNbbWVzc2FnZUlkXTtcbiAgICByZXR1cm4gdGhpcy5fbWVyZ2VUcmVlcyhwLCBwYXJzZWRNZXNzYWdlLCBwLmNoaWxkcmVuKTtcbiAgfVxuXG4gIHByaXZhdGUgX3JlY3Vyc2VJbnRvSTE4blBhcnQocDogUGFydCk6IEh0bWxBc3RbXSB7XG4gICAgLy8gd2UgZm91bmQgYW4gZWxlbWVudCB3aXRob3V0IGFuIGkxOG4gYXR0cmlidXRlXG4gICAgLy8gd2UgbmVlZCB0byByZWN1cnNlIGluIGNhdXNlIGl0cyBjaGlsZHJlbiBtYXkgaGF2ZSBpMThuIHNldFxuICAgIC8vIHdlIGFsc28gbmVlZCB0byB0cmFuc2xhdGUgaXRzIGF0dHJpYnV0ZXNcbiAgICBpZiAoaXNQcmVzZW50KHAucm9vdEVsZW1lbnQpKSB7XG4gICAgICBsZXQgcm9vdCA9IHAucm9vdEVsZW1lbnQ7XG4gICAgICBsZXQgY2hpbGRyZW4gPSB0aGlzLl9yZWN1cnNlKHAuY2hpbGRyZW4pO1xuICAgICAgbGV0IGF0dHJzID0gdGhpcy5faTE4bkF0dHJpYnV0ZXMocm9vdCk7XG4gICAgICByZXR1cm4gW1xuICAgICAgICBuZXcgSHRtbEVsZW1lbnRBc3Qocm9vdC5uYW1lLCBhdHRycywgY2hpbGRyZW4sIHJvb3Quc291cmNlU3Bhbiwgcm9vdC5zdGFydFNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICByb290LmVuZFNvdXJjZVNwYW4pXG4gICAgICBdO1xuXG4gICAgICAvLyBhIHRleHQgbm9kZSB3aXRob3V0IGkxOG4gb3IgaW50ZXJwb2xhdGlvbiwgbm90aGluZyB0byBkb1xuICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KHAucm9vdFRleHROb2RlKSkge1xuICAgICAgcmV0dXJuIFtwLnJvb3RUZXh0Tm9kZV07XG5cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlY3Vyc2UocC5jaGlsZHJlbik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcmVjdXJzZShub2RlczogSHRtbEFzdFtdKTogSHRtbEFzdFtdIHtcbiAgICBsZXQgcHMgPSBwYXJ0aXRpb24obm9kZXMsIHRoaXMuZXJyb3JzKTtcbiAgICByZXR1cm4gTGlzdFdyYXBwZXIuZmxhdHRlbihwcy5tYXAocCA9PiB0aGlzLl9wcm9jZXNzSTE4blBhcnQocCkpKTtcbiAgfVxuXG4gIHByaXZhdGUgX21lcmdlVHJlZXMocDogUGFydCwgdHJhbnNsYXRlZDogSHRtbEFzdFtdLCBvcmlnaW5hbDogSHRtbEFzdFtdKTogSHRtbEFzdFtdIHtcbiAgICBsZXQgbCA9IG5ldyBfQ3JlYXRlTm9kZU1hcHBpbmcoKTtcbiAgICBodG1sVmlzaXRBbGwobCwgb3JpZ2luYWwpO1xuXG4gICAgLy8gbWVyZ2UgdGhlIHRyYW5zbGF0ZWQgdHJlZSB3aXRoIHRoZSBvcmlnaW5hbCB0cmVlLlxuICAgIC8vIHdlIGRvIGl0IGJ5IHByZXNlcnZpbmcgdGhlIHNvdXJjZSBjb2RlIHBvc2l0aW9uIG9mIHRoZSBvcmlnaW5hbCB0cmVlXG4gICAgbGV0IG1lcmdlZCA9IHRoaXMuX21lcmdlVHJlZXNIZWxwZXIodHJhbnNsYXRlZCwgbC5tYXBwaW5nKTtcblxuICAgIC8vIGlmIHRoZSByb290IGVsZW1lbnQgaXMgcHJlc2VudCwgd2UgbmVlZCB0byBjcmVhdGUgYSBuZXcgcm9vdCBlbGVtZW50IHdpdGggaXRzIGF0dHJpYnV0ZXNcbiAgICAvLyB0cmFuc2xhdGVkXG4gICAgaWYgKGlzUHJlc2VudChwLnJvb3RFbGVtZW50KSkge1xuICAgICAgbGV0IHJvb3QgPSBwLnJvb3RFbGVtZW50O1xuICAgICAgbGV0IGF0dHJzID0gdGhpcy5faTE4bkF0dHJpYnV0ZXMocm9vdCk7XG4gICAgICByZXR1cm4gW1xuICAgICAgICBuZXcgSHRtbEVsZW1lbnRBc3Qocm9vdC5uYW1lLCBhdHRycywgbWVyZ2VkLCByb290LnNvdXJjZVNwYW4sIHJvb3Quc3RhcnRTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdC5lbmRTb3VyY2VTcGFuKVxuICAgICAgXTtcblxuICAgICAgLy8gdGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuIHdpdGggYSBwYXJ0LiBQYXJ0cyB0aGF0IGhhdmUgcm9vdCB0ZXh0IG5vZGUgc2hvdWxkIG5vdCBiZSBtZXJnZWQuXG4gICAgfSBlbHNlIGlmIChpc1ByZXNlbnQocC5yb290VGV4dE5vZGUpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcInNob3VsZCBub3QgYmUgcmVhY2hlZFwiKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbWVyZ2VkO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX21lcmdlVHJlZXNIZWxwZXIodHJhbnNsYXRlZDogSHRtbEFzdFtdLCBtYXBwaW5nOiBIdG1sQXN0W10pOiBIdG1sQXN0W10ge1xuICAgIHJldHVybiB0cmFuc2xhdGVkLm1hcCh0ID0+IHtcbiAgICAgIGlmICh0IGluc3RhbmNlb2YgSHRtbEVsZW1lbnRBc3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21lcmdlRWxlbWVudE9ySW50ZXJwb2xhdGlvbih0LCB0cmFuc2xhdGVkLCBtYXBwaW5nKTtcblxuICAgICAgfSBlbHNlIGlmICh0IGluc3RhbmNlb2YgSHRtbFRleHRBc3QpIHtcbiAgICAgICAgcmV0dXJuIHQ7XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFwic2hvdWxkIG5vdCBiZSByZWFjaGVkXCIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfbWVyZ2VFbGVtZW50T3JJbnRlcnBvbGF0aW9uKHQ6IEh0bWxFbGVtZW50QXN0LCB0cmFuc2xhdGVkOiBIdG1sQXN0W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXBwaW5nOiBIdG1sQXN0W10pOiBIdG1sQXN0IHtcbiAgICBsZXQgbmFtZSA9IHRoaXMuX2dldE5hbWUodCk7XG4gICAgbGV0IHR5cGUgPSBuYW1lWzBdO1xuICAgIGxldCBpbmRleCA9IE51bWJlcldyYXBwZXIucGFyc2VJbnQobmFtZS5zdWJzdHJpbmcoMSksIDEwKTtcbiAgICBsZXQgb3JpZ2luYWxOb2RlID0gbWFwcGluZ1tpbmRleF07XG5cbiAgICBpZiAodHlwZSA9PSBcInRcIikge1xuICAgICAgcmV0dXJuIHRoaXMuX21lcmdlVGV4dEludGVycG9sYXRpb24odCwgPEh0bWxUZXh0QXN0Pm9yaWdpbmFsTm9kZSk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwiZVwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbWVyZ2VFbGVtZW50KHQsIDxIdG1sRWxlbWVudEFzdD5vcmlnaW5hbE5vZGUsIG1hcHBpbmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcInNob3VsZCBub3QgYmUgcmVhY2hlZFwiKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9nZXROYW1lKHQ6IEh0bWxFbGVtZW50QXN0KTogc3RyaW5nIHtcbiAgICBpZiAodC5uYW1lICE9IF9QTEFDRUhPTERFUl9FTEVNRU5UKSB7XG4gICAgICB0aHJvdyBuZXcgSTE4bkVycm9yKFxuICAgICAgICAgIHQuc291cmNlU3BhbixcbiAgICAgICAgICBgVW5leHBlY3RlZCB0YWcgXCIke3QubmFtZX1cIi4gT25seSBcIiR7X1BMQUNFSE9MREVSX0VMRU1FTlR9XCIgdGFncyBhcmUgYWxsb3dlZC5gKTtcbiAgICB9XG4gICAgbGV0IG5hbWVzID0gdC5hdHRycy5maWx0ZXIoYSA9PiBhLm5hbWUgPT0gX05BTUVfQVRUUik7XG4gICAgaWYgKG5hbWVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgSTE4bkVycm9yKHQuc291cmNlU3BhbiwgYE1pc3NpbmcgXCIke19OQU1FX0FUVFJ9XCIgYXR0cmlidXRlLmApO1xuICAgIH1cbiAgICByZXR1cm4gbmFtZXNbMF0udmFsdWU7XG4gIH1cblxuICBwcml2YXRlIF9tZXJnZVRleHRJbnRlcnBvbGF0aW9uKHQ6IEh0bWxFbGVtZW50QXN0LCBvcmlnaW5hbE5vZGU6IEh0bWxUZXh0QXN0KTogSHRtbFRleHRBc3Qge1xuICAgIGxldCBzcGxpdCA9XG4gICAgICAgIHRoaXMuX3BhcnNlci5zcGxpdEludGVycG9sYXRpb24ob3JpZ2luYWxOb2RlLnZhbHVlLCBvcmlnaW5hbE5vZGUuc291cmNlU3Bhbi50b1N0cmluZygpKTtcbiAgICBsZXQgZXhwcyA9IGlzUHJlc2VudChzcGxpdCkgPyBzcGxpdC5leHByZXNzaW9ucyA6IFtdO1xuXG4gICAgbGV0IG1lc3NhZ2VTdWJzdHJpbmcgPVxuICAgICAgICB0aGlzLl9tZXNzYWdlc0NvbnRlbnQuc3Vic3RyaW5nKHQuc3RhcnRTb3VyY2VTcGFuLmVuZC5vZmZzZXQsIHQuZW5kU291cmNlU3Bhbi5zdGFydC5vZmZzZXQpO1xuICAgIGxldCB0cmFuc2xhdGVkID1cbiAgICAgICAgdGhpcy5fcmVwbGFjZVBsYWNlaG9sZGVyc1dpdGhFeHByZXNzaW9ucyhtZXNzYWdlU3Vic3RyaW5nLCBleHBzLCBvcmlnaW5hbE5vZGUuc291cmNlU3Bhbik7XG5cbiAgICByZXR1cm4gbmV3IEh0bWxUZXh0QXN0KHRyYW5zbGF0ZWQsIG9yaWdpbmFsTm9kZS5zb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHByaXZhdGUgX21lcmdlRWxlbWVudCh0OiBIdG1sRWxlbWVudEFzdCwgb3JpZ2luYWxOb2RlOiBIdG1sRWxlbWVudEFzdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcHBpbmc6IEh0bWxBc3RbXSk6IEh0bWxFbGVtZW50QXN0IHtcbiAgICBsZXQgY2hpbGRyZW4gPSB0aGlzLl9tZXJnZVRyZWVzSGVscGVyKHQuY2hpbGRyZW4sIG1hcHBpbmcpO1xuICAgIHJldHVybiBuZXcgSHRtbEVsZW1lbnRBc3Qob3JpZ2luYWxOb2RlLm5hbWUsIHRoaXMuX2kxOG5BdHRyaWJ1dGVzKG9yaWdpbmFsTm9kZSksIGNoaWxkcmVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxOb2RlLnNvdXJjZVNwYW4sIG9yaWdpbmFsTm9kZS5zdGFydFNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbE5vZGUuZW5kU291cmNlU3Bhbik7XG4gIH1cblxuICBwcml2YXRlIF9pMThuQXR0cmlidXRlcyhlbDogSHRtbEVsZW1lbnRBc3QpOiBIdG1sQXR0ckFzdFtdIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgZWwuYXR0cnMuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgIGlmIChhdHRyLm5hbWUuc3RhcnRzV2l0aChJMThOX0FUVFJfUFJFRklYKSB8fCBhdHRyLm5hbWUgPT0gSTE4Tl9BVFRSKSByZXR1cm47XG5cbiAgICAgIGxldCBpMThucyA9IGVsLmF0dHJzLmZpbHRlcihhID0+IGEubmFtZSA9PSBgaTE4bi0ke2F0dHIubmFtZX1gKTtcbiAgICAgIGlmIChpMThucy5sZW5ndGggPT0gMCkge1xuICAgICAgICByZXMucHVzaChhdHRyKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsZXQgaTE4biA9IGkxOG5zWzBdO1xuICAgICAgbGV0IG1lc3NhZ2UgPSBtZXNzYWdlRnJvbUF0dHJpYnV0ZSh0aGlzLl9wYXJzZXIsIGVsLCBpMThuKTtcbiAgICAgIGxldCBtZXNzYWdlSWQgPSBpZChtZXNzYWdlKTtcblxuICAgICAgaWYgKFN0cmluZ01hcFdyYXBwZXIuY29udGFpbnModGhpcy5fbWVzc2FnZXMsIG1lc3NhZ2VJZCkpIHtcbiAgICAgICAgbGV0IHVwZGF0ZWRNZXNzYWdlID0gdGhpcy5fcmVwbGFjZUludGVycG9sYXRpb25JbkF0dHIoYXR0ciwgdGhpcy5fbWVzc2FnZXNbbWVzc2FnZUlkXSk7XG4gICAgICAgIHJlcy5wdXNoKG5ldyBIdG1sQXR0ckFzdChhdHRyLm5hbWUsIHVwZGF0ZWRNZXNzYWdlLCBhdHRyLnNvdXJjZVNwYW4pKTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEkxOG5FcnJvcihcbiAgICAgICAgICAgIGF0dHIuc291cmNlU3BhbixcbiAgICAgICAgICAgIGBDYW5ub3QgZmluZCBtZXNzYWdlIGZvciBpZCAnJHttZXNzYWdlSWR9JywgY29udGVudCAnJHttZXNzYWdlLmNvbnRlbnR9Jy5gKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVwbGFjZUludGVycG9sYXRpb25JbkF0dHIoYXR0cjogSHRtbEF0dHJBc3QsIG1zZzogSHRtbEFzdFtdKTogc3RyaW5nIHtcbiAgICBsZXQgc3BsaXQgPSB0aGlzLl9wYXJzZXIuc3BsaXRJbnRlcnBvbGF0aW9uKGF0dHIudmFsdWUsIGF0dHIuc291cmNlU3Bhbi50b1N0cmluZygpKTtcbiAgICBsZXQgZXhwcyA9IGlzUHJlc2VudChzcGxpdCkgPyBzcGxpdC5leHByZXNzaW9ucyA6IFtdO1xuXG4gICAgbGV0IGZpcnN0ID0gbXNnWzBdO1xuICAgIGxldCBsYXN0ID0gbXNnW21zZy5sZW5ndGggLSAxXTtcblxuICAgIGxldCBzdGFydCA9IGZpcnN0LnNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0O1xuICAgIGxldCBlbmQgPVxuICAgICAgICBsYXN0IGluc3RhbmNlb2YgSHRtbEVsZW1lbnRBc3QgPyBsYXN0LmVuZFNvdXJjZVNwYW4uZW5kLm9mZnNldCA6IGxhc3Quc291cmNlU3Bhbi5lbmQub2Zmc2V0O1xuICAgIGxldCBtZXNzYWdlU3Vic3RyaW5nID0gdGhpcy5fbWVzc2FnZXNDb250ZW50LnN1YnN0cmluZyhzdGFydCwgZW5kKTtcblxuICAgIHJldHVybiB0aGlzLl9yZXBsYWNlUGxhY2Vob2xkZXJzV2l0aEV4cHJlc3Npb25zKG1lc3NhZ2VTdWJzdHJpbmcsIGV4cHMsIGF0dHIuc291cmNlU3Bhbik7XG4gIH07XG5cbiAgcHJpdmF0ZSBfcmVwbGFjZVBsYWNlaG9sZGVyc1dpdGhFeHByZXNzaW9ucyhtZXNzYWdlOiBzdHJpbmcsIGV4cHM6IHN0cmluZ1tdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbik6IHN0cmluZyB7XG4gICAgbGV0IGV4cE1hcCA9IHRoaXMuX2J1aWxkRXhwck1hcChleHBzKTtcbiAgICByZXR1cm4gUmVnRXhwV3JhcHBlci5yZXBsYWNlQWxsKF9QTEFDRUhPTERFUl9FWFBBTkRFRF9SRUdFWFAsIG1lc3NhZ2UsIChtYXRjaCkgPT4ge1xuICAgICAgbGV0IG5hbWVXaXRoUXVvdGVzID0gbWF0Y2hbMl07XG4gICAgICBsZXQgbmFtZSA9IG5hbWVXaXRoUXVvdGVzLnN1YnN0cmluZygxLCBuYW1lV2l0aFF1b3Rlcy5sZW5ndGggLSAxKTtcbiAgICAgIHJldHVybiB0aGlzLl9jb252ZXJ0SW50b0V4cHJlc3Npb24obmFtZSwgZXhwTWFwLCBzb3VyY2VTcGFuKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkRXhwck1hcChleHBzOiBzdHJpbmdbXSk6IE1hcDxzdHJpbmcsIHN0cmluZz4ge1xuICAgIGxldCBleHBNYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICAgIGxldCB1c2VkTmFtZXMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBleHBzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgcGhOYW1lID0gZ2V0UGhOYW1lRnJvbUJpbmRpbmcoZXhwc1tpXSwgaSk7XG4gICAgICBleHBNYXAuc2V0KGRlZHVwZVBoTmFtZSh1c2VkTmFtZXMsIHBoTmFtZSksIGV4cHNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gZXhwTWFwO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29udmVydEludG9FeHByZXNzaW9uKG5hbWU6IHN0cmluZywgZXhwTWFwOiBNYXA8c3RyaW5nLCBzdHJpbmc+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7XG4gICAgaWYgKGV4cE1hcC5oYXMobmFtZSkpIHtcbiAgICAgIHJldHVybiBge3ske2V4cE1hcC5nZXQobmFtZSl9fX1gO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgSTE4bkVycm9yKHNvdXJjZVNwYW4sIGBJbnZhbGlkIGludGVycG9sYXRpb24gbmFtZSAnJHtuYW1lfSdgKTtcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgX0NyZWF0ZU5vZGVNYXBwaW5nIGltcGxlbWVudHMgSHRtbEFzdFZpc2l0b3Ige1xuICBtYXBwaW5nOiBIdG1sQXN0W10gPSBbXTtcblxuICB2aXNpdEVsZW1lbnQoYXN0OiBIdG1sRWxlbWVudEFzdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLm1hcHBpbmcucHVzaChhc3QpO1xuICAgIGh0bWxWaXNpdEFsbCh0aGlzLCBhc3QuY2hpbGRyZW4pO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRBdHRyKGFzdDogSHRtbEF0dHJBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG5cbiAgdmlzaXRUZXh0KGFzdDogSHRtbFRleHRBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy5tYXBwaW5nLnB1c2goYXN0KTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0RXhwYW5zaW9uKGFzdDogSHRtbEV4cGFuc2lvbkFzdCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cblxuICB2aXNpdEV4cGFuc2lvbkNhc2UoYXN0OiBIdG1sRXhwYW5zaW9uQ2FzZUFzdCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cblxuICB2aXNpdENvbW1lbnQoYXN0OiBIdG1sQ29tbWVudEFzdCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIFwiXCI7IH1cbn1cbiJdfQ==