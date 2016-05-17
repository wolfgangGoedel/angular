'use strict';"use strict";
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var _EMPTY_ATTR_VALUE = lang_1.CONST_EXPR('');
// TODO: Can't use `const` here as
// in Dart this is not transpiled into `final` yet...
var _SELECTOR_REGEXP = lang_1.RegExpWrapper.create('(\\:not\\()|' +
    '([-\\w]+)|' +
    '(?:\\.([-\\w]+))|' +
    '(?:\\[([-\\w*]+)(?:=([^\\]]*))?\\])|' +
    '(\\))|' +
    '(\\s*,\\s*)'); // ","
/**
 * A css selector contains an element name,
 * css classes and attribute/value pairs with the purpose
 * of selecting subsets out of them.
 */
var CssSelector = (function () {
    function CssSelector() {
        this.element = null;
        this.classNames = [];
        this.attrs = [];
        this.notSelectors = [];
    }
    CssSelector.parse = function (selector) {
        var results = [];
        var _addResult = function (res, cssSel) {
            if (cssSel.notSelectors.length > 0 && lang_1.isBlank(cssSel.element) &&
                collection_1.ListWrapper.isEmpty(cssSel.classNames) && collection_1.ListWrapper.isEmpty(cssSel.attrs)) {
                cssSel.element = "*";
            }
            res.push(cssSel);
        };
        var cssSelector = new CssSelector();
        var matcher = lang_1.RegExpWrapper.matcher(_SELECTOR_REGEXP, selector);
        var match;
        var current = cssSelector;
        var inNot = false;
        while (lang_1.isPresent(match = lang_1.RegExpMatcherWrapper.next(matcher))) {
            if (lang_1.isPresent(match[1])) {
                if (inNot) {
                    throw new exceptions_1.BaseException('Nesting :not is not allowed in a selector');
                }
                inNot = true;
                current = new CssSelector();
                cssSelector.notSelectors.push(current);
            }
            if (lang_1.isPresent(match[2])) {
                current.setElement(match[2]);
            }
            if (lang_1.isPresent(match[3])) {
                current.addClassName(match[3]);
            }
            if (lang_1.isPresent(match[4])) {
                current.addAttribute(match[4], match[5]);
            }
            if (lang_1.isPresent(match[6])) {
                inNot = false;
                current = cssSelector;
            }
            if (lang_1.isPresent(match[7])) {
                if (inNot) {
                    throw new exceptions_1.BaseException('Multiple selectors in :not are not supported');
                }
                _addResult(results, cssSelector);
                cssSelector = current = new CssSelector();
            }
        }
        _addResult(results, cssSelector);
        return results;
    };
    CssSelector.prototype.isElementSelector = function () {
        return lang_1.isPresent(this.element) && collection_1.ListWrapper.isEmpty(this.classNames) &&
            collection_1.ListWrapper.isEmpty(this.attrs) && this.notSelectors.length === 0;
    };
    CssSelector.prototype.setElement = function (element) {
        if (element === void 0) { element = null; }
        this.element = element;
    };
    /** Gets a template string for an element that matches the selector. */
    CssSelector.prototype.getMatchingElementTemplate = function () {
        var tagName = lang_1.isPresent(this.element) ? this.element : 'div';
        var classAttr = this.classNames.length > 0 ? " class=\"" + this.classNames.join(' ') + "\"" : '';
        var attrs = '';
        for (var i = 0; i < this.attrs.length; i += 2) {
            var attrName = this.attrs[i];
            var attrValue = this.attrs[i + 1] !== '' ? "=\"" + this.attrs[i + 1] + "\"" : '';
            attrs += " " + attrName + attrValue;
        }
        return "<" + tagName + classAttr + attrs + "></" + tagName + ">";
    };
    CssSelector.prototype.addAttribute = function (name, value) {
        if (value === void 0) { value = _EMPTY_ATTR_VALUE; }
        this.attrs.push(name);
        if (lang_1.isPresent(value)) {
            value = value.toLowerCase();
        }
        else {
            value = _EMPTY_ATTR_VALUE;
        }
        this.attrs.push(value);
    };
    CssSelector.prototype.addClassName = function (name) { this.classNames.push(name.toLowerCase()); };
    CssSelector.prototype.toString = function () {
        var res = '';
        if (lang_1.isPresent(this.element)) {
            res += this.element;
        }
        if (lang_1.isPresent(this.classNames)) {
            for (var i = 0; i < this.classNames.length; i++) {
                res += '.' + this.classNames[i];
            }
        }
        if (lang_1.isPresent(this.attrs)) {
            for (var i = 0; i < this.attrs.length;) {
                var attrName = this.attrs[i++];
                var attrValue = this.attrs[i++];
                res += '[' + attrName;
                if (attrValue.length > 0) {
                    res += '=' + attrValue;
                }
                res += ']';
            }
        }
        this.notSelectors.forEach(function (notSelector) { return res += ":not(" + notSelector + ")"; });
        return res;
    };
    return CssSelector;
}());
exports.CssSelector = CssSelector;
/**
 * Reads a list of CssSelectors and allows to calculate which ones
 * are contained in a given CssSelector.
 */
var SelectorMatcher = (function () {
    function SelectorMatcher() {
        this._elementMap = new collection_1.Map();
        this._elementPartialMap = new collection_1.Map();
        this._classMap = new collection_1.Map();
        this._classPartialMap = new collection_1.Map();
        this._attrValueMap = new collection_1.Map();
        this._attrValuePartialMap = new collection_1.Map();
        this._listContexts = [];
    }
    SelectorMatcher.createNotMatcher = function (notSelectors) {
        var notMatcher = new SelectorMatcher();
        notMatcher.addSelectables(notSelectors, null);
        return notMatcher;
    };
    SelectorMatcher.prototype.addSelectables = function (cssSelectors, callbackCtxt) {
        var listContext = null;
        if (cssSelectors.length > 1) {
            listContext = new SelectorListContext(cssSelectors);
            this._listContexts.push(listContext);
        }
        for (var i = 0; i < cssSelectors.length; i++) {
            this._addSelectable(cssSelectors[i], callbackCtxt, listContext);
        }
    };
    /**
     * Add an object that can be found later on by calling `match`.
     * @param cssSelector A css selector
     * @param callbackCtxt An opaque object that will be given to the callback of the `match` function
     */
    SelectorMatcher.prototype._addSelectable = function (cssSelector, callbackCtxt, listContext) {
        var matcher = this;
        var element = cssSelector.element;
        var classNames = cssSelector.classNames;
        var attrs = cssSelector.attrs;
        var selectable = new SelectorContext(cssSelector, callbackCtxt, listContext);
        if (lang_1.isPresent(element)) {
            var isTerminal = attrs.length === 0 && classNames.length === 0;
            if (isTerminal) {
                this._addTerminal(matcher._elementMap, element, selectable);
            }
            else {
                matcher = this._addPartial(matcher._elementPartialMap, element);
            }
        }
        if (lang_1.isPresent(classNames)) {
            for (var index = 0; index < classNames.length; index++) {
                var isTerminal = attrs.length === 0 && index === classNames.length - 1;
                var className = classNames[index];
                if (isTerminal) {
                    this._addTerminal(matcher._classMap, className, selectable);
                }
                else {
                    matcher = this._addPartial(matcher._classPartialMap, className);
                }
            }
        }
        if (lang_1.isPresent(attrs)) {
            for (var index = 0; index < attrs.length;) {
                var isTerminal = index === attrs.length - 2;
                var attrName = attrs[index++];
                var attrValue = attrs[index++];
                if (isTerminal) {
                    var terminalMap = matcher._attrValueMap;
                    var terminalValuesMap = terminalMap.get(attrName);
                    if (lang_1.isBlank(terminalValuesMap)) {
                        terminalValuesMap = new collection_1.Map();
                        terminalMap.set(attrName, terminalValuesMap);
                    }
                    this._addTerminal(terminalValuesMap, attrValue, selectable);
                }
                else {
                    var parttialMap = matcher._attrValuePartialMap;
                    var partialValuesMap = parttialMap.get(attrName);
                    if (lang_1.isBlank(partialValuesMap)) {
                        partialValuesMap = new collection_1.Map();
                        parttialMap.set(attrName, partialValuesMap);
                    }
                    matcher = this._addPartial(partialValuesMap, attrValue);
                }
            }
        }
    };
    SelectorMatcher.prototype._addTerminal = function (map, name, selectable) {
        var terminalList = map.get(name);
        if (lang_1.isBlank(terminalList)) {
            terminalList = [];
            map.set(name, terminalList);
        }
        terminalList.push(selectable);
    };
    SelectorMatcher.prototype._addPartial = function (map, name) {
        var matcher = map.get(name);
        if (lang_1.isBlank(matcher)) {
            matcher = new SelectorMatcher();
            map.set(name, matcher);
        }
        return matcher;
    };
    /**
     * Find the objects that have been added via `addSelectable`
     * whose css selector is contained in the given css selector.
     * @param cssSelector A css selector
     * @param matchedCallback This callback will be called with the object handed into `addSelectable`
     * @return boolean true if a match was found
    */
    SelectorMatcher.prototype.match = function (cssSelector, matchedCallback) {
        var result = false;
        var element = cssSelector.element;
        var classNames = cssSelector.classNames;
        var attrs = cssSelector.attrs;
        for (var i = 0; i < this._listContexts.length; i++) {
            this._listContexts[i].alreadyMatched = false;
        }
        result = this._matchTerminal(this._elementMap, element, cssSelector, matchedCallback) || result;
        result = this._matchPartial(this._elementPartialMap, element, cssSelector, matchedCallback) ||
            result;
        if (lang_1.isPresent(classNames)) {
            for (var index = 0; index < classNames.length; index++) {
                var className = classNames[index];
                result =
                    this._matchTerminal(this._classMap, className, cssSelector, matchedCallback) || result;
                result =
                    this._matchPartial(this._classPartialMap, className, cssSelector, matchedCallback) ||
                        result;
            }
        }
        if (lang_1.isPresent(attrs)) {
            for (var index = 0; index < attrs.length;) {
                var attrName = attrs[index++];
                var attrValue = attrs[index++];
                var terminalValuesMap = this._attrValueMap.get(attrName);
                if (!lang_1.StringWrapper.equals(attrValue, _EMPTY_ATTR_VALUE)) {
                    result = this._matchTerminal(terminalValuesMap, _EMPTY_ATTR_VALUE, cssSelector, matchedCallback) ||
                        result;
                }
                result = this._matchTerminal(terminalValuesMap, attrValue, cssSelector, matchedCallback) ||
                    result;
                var partialValuesMap = this._attrValuePartialMap.get(attrName);
                if (!lang_1.StringWrapper.equals(attrValue, _EMPTY_ATTR_VALUE)) {
                    result = this._matchPartial(partialValuesMap, _EMPTY_ATTR_VALUE, cssSelector, matchedCallback) ||
                        result;
                }
                result =
                    this._matchPartial(partialValuesMap, attrValue, cssSelector, matchedCallback) || result;
            }
        }
        return result;
    };
    /** @internal */
    SelectorMatcher.prototype._matchTerminal = function (map, name, cssSelector, matchedCallback) {
        if (lang_1.isBlank(map) || lang_1.isBlank(name)) {
            return false;
        }
        var selectables = map.get(name);
        var starSelectables = map.get("*");
        if (lang_1.isPresent(starSelectables)) {
            selectables = selectables.concat(starSelectables);
        }
        if (lang_1.isBlank(selectables)) {
            return false;
        }
        var selectable;
        var result = false;
        for (var index = 0; index < selectables.length; index++) {
            selectable = selectables[index];
            result = selectable.finalize(cssSelector, matchedCallback) || result;
        }
        return result;
    };
    /** @internal */
    SelectorMatcher.prototype._matchPartial = function (map, name, cssSelector, matchedCallback /*: (c: CssSelector, a: any) => void*/) {
        if (lang_1.isBlank(map) || lang_1.isBlank(name)) {
            return false;
        }
        var nestedSelector = map.get(name);
        if (lang_1.isBlank(nestedSelector)) {
            return false;
        }
        // TODO(perf): get rid of recursion and measure again
        // TODO(perf): don't pass the whole selector into the recursion,
        // but only the not processed parts
        return nestedSelector.match(cssSelector, matchedCallback);
    };
    return SelectorMatcher;
}());
exports.SelectorMatcher = SelectorMatcher;
var SelectorListContext = (function () {
    function SelectorListContext(selectors) {
        this.selectors = selectors;
        this.alreadyMatched = false;
    }
    return SelectorListContext;
}());
exports.SelectorListContext = SelectorListContext;
// Store context to pass back selector and context when a selector is matched
var SelectorContext = (function () {
    function SelectorContext(selector, cbContext, listContext) {
        this.selector = selector;
        this.cbContext = cbContext;
        this.listContext = listContext;
        this.notSelectors = selector.notSelectors;
    }
    SelectorContext.prototype.finalize = function (cssSelector, callback) {
        var result = true;
        if (this.notSelectors.length > 0 &&
            (lang_1.isBlank(this.listContext) || !this.listContext.alreadyMatched)) {
            var notMatcher = SelectorMatcher.createNotMatcher(this.notSelectors);
            result = !notMatcher.match(cssSelector, null);
        }
        if (result && lang_1.isPresent(callback) &&
            (lang_1.isBlank(this.listContext) || !this.listContext.alreadyMatched)) {
            if (lang_1.isPresent(this.listContext)) {
                this.listContext.alreadyMatched = true;
            }
            callback(this.selector, this.cbContext);
        }
        return result;
    };
    return SelectorContext;
}());
exports.SelectorContext = SelectorContext;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLThERFlwejRqLnRtcC9hbmd1bGFyMi9zcmMvY29tcGlsZXIvc2VsZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDJCQUEyQyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzVFLHFCQU9PLDBCQUEwQixDQUFDLENBQUE7QUFDbEMsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFFL0UsSUFBTSxpQkFBaUIsR0FBRyxpQkFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRXpDLGtDQUFrQztBQUNsQyxxREFBcUQ7QUFDckQsSUFBSSxnQkFBZ0IsR0FBRyxvQkFBYSxDQUFDLE1BQU0sQ0FDdkMsY0FBYztJQUNkLFlBQVk7SUFDWixtQkFBbUI7SUFDbkIsc0NBQXNDO0lBQ3RDLFFBQVE7SUFDUixhQUFhLENBQUMsQ0FBQyxDQUEyQixNQUFNO0FBRXBEOzs7O0dBSUc7QUFDSDtJQUFBO1FBQ0UsWUFBTyxHQUFXLElBQUksQ0FBQztRQUN2QixlQUFVLEdBQWEsRUFBRSxDQUFDO1FBQzFCLFVBQUssR0FBYSxFQUFFLENBQUM7UUFDckIsaUJBQVksR0FBa0IsRUFBRSxDQUFDO0lBNEduQyxDQUFDO0lBMUdRLGlCQUFLLEdBQVosVUFBYSxRQUFnQjtRQUMzQixJQUFJLE9BQU8sR0FBa0IsRUFBRSxDQUFDO1FBQ2hDLElBQUksVUFBVSxHQUFHLFVBQUMsR0FBa0IsRUFBRSxNQUFNO1lBQzFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxjQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztnQkFDekQsd0JBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLHdCQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENB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RSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUM1QixDQUFDLGNBQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRSxJQUFJLFVBQVUsR0FBRyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sR0FBRyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxNQUFNLElBQUksZ0JBQVMsQ0FBQyxRQUFRLENBQUM7WUFDN0IsQ0FBQyxjQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEUsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7WUFDekMsQ0FBQztZQUNELFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBQ0gsc0JBQUM7QUFBRCxDQUFDLEFBeEJELElBd0JDO0FBeEJZLHVCQUFlLGtCQXdCM0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TWFwLCBMaXN0V3JhcHBlciwgTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7XG4gIGlzUHJlc2VudCxcbiAgaXNCbGFuayxcbiAgUmVnRXhwV3JhcHBlcixcbiAgUmVnRXhwTWF0Y2hlcldyYXBwZXIsXG4gIFN0cmluZ1dyYXBwZXIsXG4gIENPTlNUX0VYUFJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcblxuY29uc3QgX0VNUFRZX0FUVFJfVkFMVUUgPSBDT05TVF9FWFBSKCcnKTtcblxuLy8gVE9ETzogQ2FuJ3QgdXNlIGBjb25zdGAgaGVyZSBhc1xuLy8gaW4gRGFydCB0aGlzIGlzIG5vdCB0cmFuc3BpbGVkIGludG8gYGZpbmFsYCB5ZXQuLi5cbnZhciBfU0VMRUNUT1JfUkVHRVhQID0gUmVnRXhwV3JhcHBlci5jcmVhdGUoXG4gICAgJyhcXFxcOm5vdFxcXFwoKXwnICsgICAgICAgICAgICAgICAgICAgICAgICAgIC8vXCI6bm90KFwiXG4gICAgJyhbLVxcXFx3XSspfCcgKyAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBcInRhZ1wiXG4gICAgJyg/OlxcXFwuKFstXFxcXHddKykpfCcgKyAgICAgICAgICAgICAgICAgICAgIC8vIFwiLmNsYXNzXCJcbiAgICAnKD86XFxcXFsoWy1cXFxcdypdKykoPzo9KFteXFxcXF1dKikpP1xcXFxdKXwnICsgIC8vIFwiW25hbWVdXCIsIFwiW25hbWU9dmFsdWVdXCIgb3IgXCJbbmFtZSo9dmFsdWVdXCJcbiAgICAnKFxcXFwpKXwnICsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFwiKVwiXG4gICAgJyhcXFxccyosXFxcXHMqKScpOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFwiLFwiXG5cbi8qKlxuICogQSBjc3Mgc2VsZWN0b3IgY29udGFpbnMgYW4gZWxlbWVudCBuYW1lLFxuICogY3NzIGNsYXNzZXMgYW5kIGF0dHJpYnV0ZS92YWx1ZSBwYWlycyB3aXRoIHRoZSBwdXJwb3NlXG4gKiBvZiBzZWxlY3Rpbmcgc3Vic2V0cyBvdXQgb2YgdGhlbS5cbiAqL1xuZXhwb3J0IGNsYXNzIENzc1NlbGVjdG9yIHtcbiAgZWxlbWVudDogc3RyaW5nID0gbnVsbDtcbiAgY2xhc3NOYW1lczogc3RyaW5nW10gPSBbXTtcbiAgYXR0cnM6IHN0cmluZ1tdID0gW107XG4gIG5vdFNlbGVjdG9yczogQ3NzU2VsZWN0b3JbXSA9IFtdO1xuXG4gIHN0YXRpYyBwYXJzZShzZWxlY3Rvcjogc3RyaW5nKTogQ3NzU2VsZWN0b3JbXSB7XG4gICAgdmFyIHJlc3VsdHM6IENzc1NlbGVjdG9yW10gPSBbXTtcbiAgICB2YXIgX2FkZFJlc3VsdCA9IChyZXM6IENzc1NlbGVjdG9yW10sIGNzc1NlbCkgPT4ge1xuICAgICAgaWYgKGNzc1NlbC5ub3RTZWxlY3RvcnMubGVuZ3RoID4gMCAmJiBpc0JsYW5rKGNzc1NlbC5lbGVtZW50KSAmJlxuICAgICAgICAgIExpc3RXcmFwcGVyLmlzRW1wdHkoY3NzU2VsLmNsYXNzTmFtZXMpICYmIExpc3RXcmFwcGVyLmlzRW1wdHkoY3NzU2VsLmF0dHJzKSkge1xuICAgICAgICBjc3NTZWwuZWxlbWVudCA9IFwiKlwiO1xuICAgICAgfVxuICAgICAgcmVzLnB1c2goY3NzU2VsKTtcbiAgICB9O1xuICAgIHZhciBjc3NTZWxlY3RvciA9IG5ldyBDc3NTZWxlY3RvcigpO1xuICAgIHZhciBtYXRjaGVyID0gUmVnRXhwV3JhcHBlci5tYXRjaGVyKF9TRUxFQ1RPUl9SRUdFWFAsIHNlbGVjdG9yKTtcbiAgICB2YXIgbWF0Y2g7XG4gICAgdmFyIGN1cnJlbnQgPSBjc3NTZWxlY3RvcjtcbiAgICB2YXIgaW5Ob3QgPSBmYWxzZTtcbiAgICB3aGlsZSAoaXNQcmVzZW50KG1hdGNoID0gUmVnRXhwTWF0Y2hlcldyYXBwZXIubmV4dChtYXRjaGVyKSkpIHtcbiAgICAgIGlmIChpc1ByZXNlbnQobWF0Y2hbMV0pKSB7XG4gICAgICAgIGlmIChpbk5vdCkge1xuICAgICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdOZXN0aW5nIDpub3QgaXMgbm90IGFsbG93ZWQgaW4gYSBzZWxlY3RvcicpO1xuICAgICAgICB9XG4gICAgICAgIGluTm90ID0gdHJ1ZTtcbiAgICAgICAgY3VycmVudCA9IG5ldyBDc3NTZWxlY3RvcigpO1xuICAgICAgICBjc3NTZWxlY3Rvci5ub3RTZWxlY3RvcnMucHVzaChjdXJyZW50KTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1ByZXNlbnQobWF0Y2hbMl0pKSB7XG4gICAgICAgIGN1cnJlbnQuc2V0RWxlbWVudChtYXRjaFsyXSk7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KG1hdGNoWzNdKSkge1xuICAgICAgICBjdXJyZW50LmFkZENsYXNzTmFtZShtYXRjaFszXSk7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KG1hdGNoWzRdKSkge1xuICAgICAgICBjdXJyZW50LmFkZEF0dHJpYnV0ZShtYXRjaFs0XSwgbWF0Y2hbNV0pO1xuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudChtYXRjaFs2XSkpIHtcbiAgICAgICAgaW5Ob3QgPSBmYWxzZTtcbiAgICAgICAgY3VycmVudCA9IGNzc1NlbGVjdG9yO1xuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudChtYXRjaFs3XSkpIHtcbiAgICAgICAgaWYgKGluTm90KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ011bHRpcGxlIHNlbGVjdG9ycyBpbiA6bm90IGFyZSBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgX2FkZFJlc3VsdChyZXN1bHRzLCBjc3NTZWxlY3Rvcik7XG4gICAgICAgIGNzc1NlbGVjdG9yID0gY3VycmVudCA9IG5ldyBDc3NTZWxlY3RvcigpO1xuICAgICAgfVxuICAgIH1cbiAgICBfYWRkUmVzdWx0KHJlc3VsdHMsIGNzc1NlbGVjdG9yKTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG4gIGlzRWxlbWVudFNlbGVjdG9yKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5lbGVtZW50KSAmJiBMaXN0V3JhcHBlci5pc0VtcHR5KHRoaXMuY2xhc3NOYW1lcykgJiZcbiAgICAgICAgICAgTGlzdFdyYXBwZXIuaXNFbXB0eSh0aGlzLmF0dHJzKSAmJiB0aGlzLm5vdFNlbGVjdG9ycy5sZW5ndGggPT09IDA7XG4gIH1cblxuICBzZXRFbGVtZW50KGVsZW1lbnQ6IHN0cmluZyA9IG51bGwpIHsgdGhpcy5lbGVtZW50ID0gZWxlbWVudDsgfVxuXG4gIC8qKiBHZXRzIGEgdGVtcGxhdGUgc3RyaW5nIGZvciBhbiBlbGVtZW50IHRoYXQgbWF0Y2hlcyB0aGUgc2VsZWN0b3IuICovXG4gIGdldE1hdGNoaW5nRWxlbWVudFRlbXBsYXRlKCk6IHN0cmluZyB7XG4gICAgbGV0IHRhZ05hbWUgPSBpc1ByZXNlbnQodGhpcy5lbGVtZW50KSA/IHRoaXMuZWxlbWVudCA6ICdkaXYnO1xuICAgIGxldCBjbGFzc0F0dHIgPSB0aGlzLmNsYXNzTmFtZXMubGVuZ3RoID4gMCA/IGAgY2xhc3M9XCIke3RoaXMuY2xhc3NOYW1lcy5qb2luKCcgJyl9XCJgIDogJyc7XG5cbiAgICBsZXQgYXR0cnMgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYXR0cnMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgIGxldCBhdHRyTmFtZSA9IHRoaXMuYXR0cnNbaV07XG4gICAgICBsZXQgYXR0clZhbHVlID0gdGhpcy5hdHRyc1tpICsgMV0gIT09ICcnID8gYD1cIiR7dGhpcy5hdHRyc1tpICsgMV19XCJgIDogJyc7XG4gICAgICBhdHRycyArPSBgICR7YXR0ck5hbWV9JHthdHRyVmFsdWV9YDtcbiAgICB9XG5cbiAgICByZXR1cm4gYDwke3RhZ05hbWV9JHtjbGFzc0F0dHJ9JHthdHRyc30+PC8ke3RhZ05hbWV9PmA7XG4gIH1cblxuICBhZGRBdHRyaWJ1dGUobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nID0gX0VNUFRZX0FUVFJfVkFMVUUpIHtcbiAgICB0aGlzLmF0dHJzLnB1c2gobmFtZSk7XG4gICAgaWYgKGlzUHJlc2VudCh2YWx1ZSkpIHtcbiAgICAgIHZhbHVlID0gdmFsdWUudG9Mb3dlckNhc2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgPSBfRU1QVFlfQVRUUl9WQUxVRTtcbiAgICB9XG4gICAgdGhpcy5hdHRycy5wdXNoKHZhbHVlKTtcbiAgfVxuXG4gIGFkZENsYXNzTmFtZShuYW1lOiBzdHJpbmcpIHsgdGhpcy5jbGFzc05hbWVzLnB1c2gobmFtZS50b0xvd2VyQ2FzZSgpKTsgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgdmFyIHJlcyA9ICcnO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5lbGVtZW50KSkge1xuICAgICAgcmVzICs9IHRoaXMuZWxlbWVudDtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmNsYXNzTmFtZXMpKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2xhc3NOYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICByZXMgKz0gJy4nICsgdGhpcy5jbGFzc05hbWVzW2ldO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuYXR0cnMpKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYXR0cnMubGVuZ3RoOykge1xuICAgICAgICB2YXIgYXR0ck5hbWUgPSB0aGlzLmF0dHJzW2krK107XG4gICAgICAgIHZhciBhdHRyVmFsdWUgPSB0aGlzLmF0dHJzW2krK107XG4gICAgICAgIHJlcyArPSAnWycgKyBhdHRyTmFtZTtcbiAgICAgICAgaWYgKGF0dHJWYWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgcmVzICs9ICc9JyArIGF0dHJWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXMgKz0gJ10nO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLm5vdFNlbGVjdG9ycy5mb3JFYWNoKG5vdFNlbGVjdG9yID0+IHJlcyArPSBgOm5vdCgke25vdFNlbGVjdG9yfSlgKTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG59XG5cbi8qKlxuICogUmVhZHMgYSBsaXN0IG9mIENzc1NlbGVjdG9ycyBhbmQgYWxsb3dzIHRvIGNhbGN1bGF0ZSB3aGljaCBvbmVzXG4gKiBhcmUgY29udGFpbmVkIGluIGEgZ2l2ZW4gQ3NzU2VsZWN0b3IuXG4gKi9cbmV4cG9ydCBjbGFzcyBTZWxlY3Rvck1hdGNoZXIge1xuICBzdGF0aWMgY3JlYXRlTm90TWF0Y2hlcihub3RTZWxlY3RvcnM6IENzc1NlbGVjdG9yW10pOiBTZWxlY3Rvck1hdGNoZXIge1xuICAgIHZhciBub3RNYXRjaGVyID0gbmV3IFNlbGVjdG9yTWF0Y2hlcigpO1xuICAgIG5vdE1hdGNoZXIuYWRkU2VsZWN0YWJsZXMobm90U2VsZWN0b3JzLCBudWxsKTtcbiAgICByZXR1cm4gbm90TWF0Y2hlcjtcbiAgfVxuXG4gIHByaXZhdGUgX2VsZW1lbnRNYXAgPSBuZXcgTWFwPHN0cmluZywgU2VsZWN0b3JDb250ZXh0W10+KCk7XG4gIHByaXZhdGUgX2VsZW1lbnRQYXJ0aWFsTWFwID0gbmV3IE1hcDxzdHJpbmcsIFNlbGVjdG9yTWF0Y2hlcj4oKTtcbiAgcHJpdmF0ZSBfY2xhc3NNYXAgPSBuZXcgTWFwPHN0cmluZywgU2VsZWN0b3JDb250ZXh0W10+KCk7XG4gIHByaXZhdGUgX2NsYXNzUGFydGlhbE1hcCA9IG5ldyBNYXA8c3RyaW5nLCBTZWxlY3Rvck1hdGNoZXI+KCk7XG4gIHByaXZhdGUgX2F0dHJWYWx1ZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBNYXA8c3RyaW5nLCBTZWxlY3RvckNvbnRleHRbXT4+KCk7XG4gIHByaXZhdGUgX2F0dHJWYWx1ZVBhcnRpYWxNYXAgPSBuZXcgTWFwPHN0cmluZywgTWFwPHN0cmluZywgU2VsZWN0b3JNYXRjaGVyPj4oKTtcbiAgcHJpdmF0ZSBfbGlzdENvbnRleHRzOiBTZWxlY3Rvckxpc3RDb250ZXh0W10gPSBbXTtcblxuICBhZGRTZWxlY3RhYmxlcyhjc3NTZWxlY3RvcnM6IENzc1NlbGVjdG9yW10sIGNhbGxiYWNrQ3R4dD86IGFueSkge1xuICAgIHZhciBsaXN0Q29udGV4dCA9IG51bGw7XG4gICAgaWYgKGNzc1NlbGVjdG9ycy5sZW5ndGggPiAxKSB7XG4gICAgICBsaXN0Q29udGV4dCA9IG5ldyBTZWxlY3Rvckxpc3RDb250ZXh0KGNzc1NlbGVjdG9ycyk7XG4gICAgICB0aGlzLl9saXN0Q29udGV4dHMucHVzaChsaXN0Q29udGV4dCk7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY3NzU2VsZWN0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLl9hZGRTZWxlY3RhYmxlKGNzc1NlbGVjdG9yc1tpXSwgY2FsbGJhY2tDdHh0LCBsaXN0Q29udGV4dCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhbiBvYmplY3QgdGhhdCBjYW4gYmUgZm91bmQgbGF0ZXIgb24gYnkgY2FsbGluZyBgbWF0Y2hgLlxuICAgKiBAcGFyYW0gY3NzU2VsZWN0b3IgQSBjc3Mgc2VsZWN0b3JcbiAgICogQHBhcmFtIGNhbGxiYWNrQ3R4dCBBbiBvcGFxdWUgb2JqZWN0IHRoYXQgd2lsbCBiZSBnaXZlbiB0byB0aGUgY2FsbGJhY2sgb2YgdGhlIGBtYXRjaGAgZnVuY3Rpb25cbiAgICovXG4gIHByaXZhdGUgX2FkZFNlbGVjdGFibGUoY3NzU2VsZWN0b3I6IENzc1NlbGVjdG9yLCBjYWxsYmFja0N0eHQ6IGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0Q29udGV4dDogU2VsZWN0b3JMaXN0Q29udGV4dCkge1xuICAgIHZhciBtYXRjaGVyOiBTZWxlY3Rvck1hdGNoZXIgPSB0aGlzO1xuICAgIHZhciBlbGVtZW50ID0gY3NzU2VsZWN0b3IuZWxlbWVudDtcbiAgICB2YXIgY2xhc3NOYW1lcyA9IGNzc1NlbGVjdG9yLmNsYXNzTmFtZXM7XG4gICAgdmFyIGF0dHJzID0gY3NzU2VsZWN0b3IuYXR0cnM7XG4gICAgdmFyIHNlbGVjdGFibGUgPSBuZXcgU2VsZWN0b3JDb250ZXh0KGNzc1NlbGVjdG9yLCBjYWxsYmFja0N0eHQsIGxpc3RDb250ZXh0KTtcblxuICAgIGlmIChpc1ByZXNlbnQoZWxlbWVudCkpIHtcbiAgICAgIHZhciBpc1Rlcm1pbmFsID0gYXR0cnMubGVuZ3RoID09PSAwICYmIGNsYXNzTmFtZXMubGVuZ3RoID09PSAwO1xuICAgICAgaWYgKGlzVGVybWluYWwpIHtcbiAgICAgICAgdGhpcy5fYWRkVGVybWluYWwobWF0Y2hlci5fZWxlbWVudE1hcCwgZWxlbWVudCwgc2VsZWN0YWJsZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXRjaGVyID0gdGhpcy5fYWRkUGFydGlhbChtYXRjaGVyLl9lbGVtZW50UGFydGlhbE1hcCwgZWxlbWVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGlzUHJlc2VudChjbGFzc05hbWVzKSkge1xuICAgICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGNsYXNzTmFtZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIHZhciBpc1Rlcm1pbmFsID0gYXR0cnMubGVuZ3RoID09PSAwICYmIGluZGV4ID09PSBjbGFzc05hbWVzLmxlbmd0aCAtIDE7XG4gICAgICAgIHZhciBjbGFzc05hbWUgPSBjbGFzc05hbWVzW2luZGV4XTtcbiAgICAgICAgaWYgKGlzVGVybWluYWwpIHtcbiAgICAgICAgICB0aGlzLl9hZGRUZXJtaW5hbChtYXRjaGVyLl9jbGFzc01hcCwgY2xhc3NOYW1lLCBzZWxlY3RhYmxlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtYXRjaGVyID0gdGhpcy5fYWRkUGFydGlhbChtYXRjaGVyLl9jbGFzc1BhcnRpYWxNYXAsIGNsYXNzTmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaXNQcmVzZW50KGF0dHJzKSkge1xuICAgICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGF0dHJzLmxlbmd0aDspIHtcbiAgICAgICAgdmFyIGlzVGVybWluYWwgPSBpbmRleCA9PT0gYXR0cnMubGVuZ3RoIC0gMjtcbiAgICAgICAgdmFyIGF0dHJOYW1lID0gYXR0cnNbaW5kZXgrK107XG4gICAgICAgIHZhciBhdHRyVmFsdWUgPSBhdHRyc1tpbmRleCsrXTtcbiAgICAgICAgaWYgKGlzVGVybWluYWwpIHtcbiAgICAgICAgICB2YXIgdGVybWluYWxNYXAgPSBtYXRjaGVyLl9hdHRyVmFsdWVNYXA7XG4gICAgICAgICAgdmFyIHRlcm1pbmFsVmFsdWVzTWFwID0gdGVybWluYWxNYXAuZ2V0KGF0dHJOYW1lKTtcbiAgICAgICAgICBpZiAoaXNCbGFuayh0ZXJtaW5hbFZhbHVlc01hcCkpIHtcbiAgICAgICAgICAgIHRlcm1pbmFsVmFsdWVzTWFwID0gbmV3IE1hcDxzdHJpbmcsIFNlbGVjdG9yQ29udGV4dFtdPigpO1xuICAgICAgICAgICAgdGVybWluYWxNYXAuc2V0KGF0dHJOYW1lLCB0ZXJtaW5hbFZhbHVlc01hcCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuX2FkZFRlcm1pbmFsKHRlcm1pbmFsVmFsdWVzTWFwLCBhdHRyVmFsdWUsIHNlbGVjdGFibGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBwYXJ0dGlhbE1hcCA9IG1hdGNoZXIuX2F0dHJWYWx1ZVBhcnRpYWxNYXA7XG4gICAgICAgICAgdmFyIHBhcnRpYWxWYWx1ZXNNYXAgPSBwYXJ0dGlhbE1hcC5nZXQoYXR0ck5hbWUpO1xuICAgICAgICAgIGlmIChpc0JsYW5rKHBhcnRpYWxWYWx1ZXNNYXApKSB7XG4gICAgICAgICAgICBwYXJ0aWFsVmFsdWVzTWFwID0gbmV3IE1hcDxzdHJpbmcsIFNlbGVjdG9yTWF0Y2hlcj4oKTtcbiAgICAgICAgICAgIHBhcnR0aWFsTWFwLnNldChhdHRyTmFtZSwgcGFydGlhbFZhbHVlc01hcCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG1hdGNoZXIgPSB0aGlzLl9hZGRQYXJ0aWFsKHBhcnRpYWxWYWx1ZXNNYXAsIGF0dHJWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hZGRUZXJtaW5hbChtYXA6IE1hcDxzdHJpbmcsIFNlbGVjdG9yQ29udGV4dFtdPiwgbmFtZTogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RhYmxlOiBTZWxlY3RvckNvbnRleHQpIHtcbiAgICB2YXIgdGVybWluYWxMaXN0ID0gbWFwLmdldChuYW1lKTtcbiAgICBpZiAoaXNCbGFuayh0ZXJtaW5hbExpc3QpKSB7XG4gICAgICB0ZXJtaW5hbExpc3QgPSBbXTtcbiAgICAgIG1hcC5zZXQobmFtZSwgdGVybWluYWxMaXN0KTtcbiAgICB9XG4gICAgdGVybWluYWxMaXN0LnB1c2goc2VsZWN0YWJsZSk7XG4gIH1cblxuICBwcml2YXRlIF9hZGRQYXJ0aWFsKG1hcDogTWFwPHN0cmluZywgU2VsZWN0b3JNYXRjaGVyPiwgbmFtZTogc3RyaW5nKTogU2VsZWN0b3JNYXRjaGVyIHtcbiAgICB2YXIgbWF0Y2hlciA9IG1hcC5nZXQobmFtZSk7XG4gICAgaWYgKGlzQmxhbmsobWF0Y2hlcikpIHtcbiAgICAgIG1hdGNoZXIgPSBuZXcgU2VsZWN0b3JNYXRjaGVyKCk7XG4gICAgICBtYXAuc2V0KG5hbWUsIG1hdGNoZXIpO1xuICAgIH1cbiAgICByZXR1cm4gbWF0Y2hlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIHRoZSBvYmplY3RzIHRoYXQgaGF2ZSBiZWVuIGFkZGVkIHZpYSBgYWRkU2VsZWN0YWJsZWBcbiAgICogd2hvc2UgY3NzIHNlbGVjdG9yIGlzIGNvbnRhaW5lZCBpbiB0aGUgZ2l2ZW4gY3NzIHNlbGVjdG9yLlxuICAgKiBAcGFyYW0gY3NzU2VsZWN0b3IgQSBjc3Mgc2VsZWN0b3JcbiAgICogQHBhcmFtIG1hdGNoZWRDYWxsYmFjayBUaGlzIGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHdpdGggdGhlIG9iamVjdCBoYW5kZWQgaW50byBgYWRkU2VsZWN0YWJsZWBcbiAgICogQHJldHVybiBib29sZWFuIHRydWUgaWYgYSBtYXRjaCB3YXMgZm91bmRcbiAgKi9cbiAgbWF0Y2goY3NzU2VsZWN0b3I6IENzc1NlbGVjdG9yLCBtYXRjaGVkQ2FsbGJhY2s6IChjOiBDc3NTZWxlY3RvciwgYTogYW55KSA9PiB2b2lkKTogYm9vbGVhbiB7XG4gICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICAgIHZhciBlbGVtZW50ID0gY3NzU2VsZWN0b3IuZWxlbWVudDtcbiAgICB2YXIgY2xhc3NOYW1lcyA9IGNzc1NlbGVjdG9yLmNsYXNzTmFtZXM7XG4gICAgdmFyIGF0dHJzID0gY3NzU2VsZWN0b3IuYXR0cnM7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2xpc3RDb250ZXh0cy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5fbGlzdENvbnRleHRzW2ldLmFscmVhZHlNYXRjaGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcmVzdWx0ID0gdGhpcy5fbWF0Y2hUZXJtaW5hbCh0aGlzLl9lbGVtZW50TWFwLCBlbGVtZW50LCBjc3NTZWxlY3RvciwgbWF0Y2hlZENhbGxiYWNrKSB8fCByZXN1bHQ7XG4gICAgcmVzdWx0ID0gdGhpcy5fbWF0Y2hQYXJ0aWFsKHRoaXMuX2VsZW1lbnRQYXJ0aWFsTWFwLCBlbGVtZW50LCBjc3NTZWxlY3RvciwgbWF0Y2hlZENhbGxiYWNrKSB8fFxuICAgICAgICAgICAgIHJlc3VsdDtcblxuICAgIGlmIChpc1ByZXNlbnQoY2xhc3NOYW1lcykpIHtcbiAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBjbGFzc05hbWVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICB2YXIgY2xhc3NOYW1lID0gY2xhc3NOYW1lc1tpbmRleF07XG4gICAgICAgIHJlc3VsdCA9XG4gICAgICAgICAgICB0aGlzLl9tYXRjaFRlcm1pbmFsKHRoaXMuX2NsYXNzTWFwLCBjbGFzc05hbWUsIGNzc1NlbGVjdG9yLCBtYXRjaGVkQ2FsbGJhY2spIHx8IHJlc3VsdDtcbiAgICAgICAgcmVzdWx0ID1cbiAgICAgICAgICAgIHRoaXMuX21hdGNoUGFydGlhbCh0aGlzLl9jbGFzc1BhcnRpYWxNYXAsIGNsYXNzTmFtZSwgY3NzU2VsZWN0b3IsIG1hdGNoZWRDYWxsYmFjaykgfHxcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaXNQcmVzZW50KGF0dHJzKSkge1xuICAgICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGF0dHJzLmxlbmd0aDspIHtcbiAgICAgICAgdmFyIGF0dHJOYW1lID0gYXR0cnNbaW5kZXgrK107XG4gICAgICAgIHZhciBhdHRyVmFsdWUgPSBhdHRyc1tpbmRleCsrXTtcblxuICAgICAgICB2YXIgdGVybWluYWxWYWx1ZXNNYXAgPSB0aGlzLl9hdHRyVmFsdWVNYXAuZ2V0KGF0dHJOYW1lKTtcbiAgICAgICAgaWYgKCFTdHJpbmdXcmFwcGVyLmVxdWFscyhhdHRyVmFsdWUsIF9FTVBUWV9BVFRSX1ZBTFVFKSkge1xuICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX21hdGNoVGVybWluYWwodGVybWluYWxWYWx1ZXNNYXAsIF9FTVBUWV9BVFRSX1ZBTFVFLCBjc3NTZWxlY3RvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoZWRDYWxsYmFjaykgfHxcbiAgICAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gdGhpcy5fbWF0Y2hUZXJtaW5hbCh0ZXJtaW5hbFZhbHVlc01hcCwgYXR0clZhbHVlLCBjc3NTZWxlY3RvciwgbWF0Y2hlZENhbGxiYWNrKSB8fFxuICAgICAgICAgICAgICAgICByZXN1bHQ7XG5cbiAgICAgICAgdmFyIHBhcnRpYWxWYWx1ZXNNYXAgPSB0aGlzLl9hdHRyVmFsdWVQYXJ0aWFsTWFwLmdldChhdHRyTmFtZSk7XG4gICAgICAgIGlmICghU3RyaW5nV3JhcHBlci5lcXVhbHMoYXR0clZhbHVlLCBfRU1QVFlfQVRUUl9WQUxVRSkpIHtcbiAgICAgICAgICByZXN1bHQgPSB0aGlzLl9tYXRjaFBhcnRpYWwocGFydGlhbFZhbHVlc01hcCwgX0VNUFRZX0FUVFJfVkFMVUUsIGNzc1NlbGVjdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaGVkQ2FsbGJhY2spIHx8XG4gICAgICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9XG4gICAgICAgICAgICB0aGlzLl9tYXRjaFBhcnRpYWwocGFydGlhbFZhbHVlc01hcCwgYXR0clZhbHVlLCBjc3NTZWxlY3RvciwgbWF0Y2hlZENhbGxiYWNrKSB8fCByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9tYXRjaFRlcm1pbmFsKG1hcDogTWFwPHN0cmluZywgU2VsZWN0b3JDb250ZXh0W10+LCBuYW1lLCBjc3NTZWxlY3RvcjogQ3NzU2VsZWN0b3IsXG4gICAgICAgICAgICAgICAgIG1hdGNoZWRDYWxsYmFjazogKGM6IENzc1NlbGVjdG9yLCBhOiBhbnkpID0+IHZvaWQpOiBib29sZWFuIHtcbiAgICBpZiAoaXNCbGFuayhtYXApIHx8IGlzQmxhbmsobmFtZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgc2VsZWN0YWJsZXMgPSBtYXAuZ2V0KG5hbWUpO1xuICAgIHZhciBzdGFyU2VsZWN0YWJsZXMgPSBtYXAuZ2V0KFwiKlwiKTtcbiAgICBpZiAoaXNQcmVzZW50KHN0YXJTZWxlY3RhYmxlcykpIHtcbiAgICAgIHNlbGVjdGFibGVzID0gc2VsZWN0YWJsZXMuY29uY2F0KHN0YXJTZWxlY3RhYmxlcyk7XG4gICAgfVxuICAgIGlmIChpc0JsYW5rKHNlbGVjdGFibGVzKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgc2VsZWN0YWJsZTtcbiAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IHNlbGVjdGFibGVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgc2VsZWN0YWJsZSA9IHNlbGVjdGFibGVzW2luZGV4XTtcbiAgICAgIHJlc3VsdCA9IHNlbGVjdGFibGUuZmluYWxpemUoY3NzU2VsZWN0b3IsIG1hdGNoZWRDYWxsYmFjaykgfHwgcmVzdWx0O1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbWF0Y2hQYXJ0aWFsKG1hcDogTWFwPHN0cmluZywgU2VsZWN0b3JNYXRjaGVyPiwgbmFtZSwgY3NzU2VsZWN0b3I6IENzc1NlbGVjdG9yLFxuICAgICAgICAgICAgICAgIG1hdGNoZWRDYWxsYmFjayAvKjogKGM6IENzc1NlbGVjdG9yLCBhOiBhbnkpID0+IHZvaWQqLyk6IGJvb2xlYW4ge1xuICAgIGlmIChpc0JsYW5rKG1hcCkgfHwgaXNCbGFuayhuYW1lKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgbmVzdGVkU2VsZWN0b3IgPSBtYXAuZ2V0KG5hbWUpO1xuICAgIGlmIChpc0JsYW5rKG5lc3RlZFNlbGVjdG9yKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBUT0RPKHBlcmYpOiBnZXQgcmlkIG9mIHJlY3Vyc2lvbiBhbmQgbWVhc3VyZSBhZ2FpblxuICAgIC8vIFRPRE8ocGVyZik6IGRvbid0IHBhc3MgdGhlIHdob2xlIHNlbGVjdG9yIGludG8gdGhlIHJlY3Vyc2lvbixcbiAgICAvLyBidXQgb25seSB0aGUgbm90IHByb2Nlc3NlZCBwYXJ0c1xuICAgIHJldHVybiBuZXN0ZWRTZWxlY3Rvci5tYXRjaChjc3NTZWxlY3RvciwgbWF0Y2hlZENhbGxiYWNrKTtcbiAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBTZWxlY3Rvckxpc3RDb250ZXh0IHtcbiAgYWxyZWFkeU1hdGNoZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgc2VsZWN0b3JzOiBDc3NTZWxlY3RvcltdKSB7fVxufVxuXG4vLyBTdG9yZSBjb250ZXh0IHRvIHBhc3MgYmFjayBzZWxlY3RvciBhbmQgY29udGV4dCB3aGVuIGEgc2VsZWN0b3IgaXMgbWF0Y2hlZFxuZXhwb3J0IGNsYXNzIFNlbGVjdG9yQ29udGV4dCB7XG4gIG5vdFNlbGVjdG9yczogQ3NzU2VsZWN0b3JbXTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgc2VsZWN0b3I6IENzc1NlbGVjdG9yLCBwdWJsaWMgY2JDb250ZXh0OiBhbnksXG4gICAgICAgICAgICAgIHB1YmxpYyBsaXN0Q29udGV4dDogU2VsZWN0b3JMaXN0Q29udGV4dCkge1xuICAgIHRoaXMubm90U2VsZWN0b3JzID0gc2VsZWN0b3Iubm90U2VsZWN0b3JzO1xuICB9XG5cbiAgZmluYWxpemUoY3NzU2VsZWN0b3I6IENzc1NlbGVjdG9yLCBjYWxsYmFjazogKGM6IENzc1NlbGVjdG9yLCBhOiBhbnkpID0+IHZvaWQpOiBib29sZWFuIHtcbiAgICB2YXIgcmVzdWx0ID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5ub3RTZWxlY3RvcnMubGVuZ3RoID4gMCAmJlxuICAgICAgICAoaXNCbGFuayh0aGlzLmxpc3RDb250ZXh0KSB8fCAhdGhpcy5saXN0Q29udGV4dC5hbHJlYWR5TWF0Y2hlZCkpIHtcbiAgICAgIHZhciBub3RNYXRjaGVyID0gU2VsZWN0b3JNYXRjaGVyLmNyZWF0ZU5vdE1hdGNoZXIodGhpcy5ub3RTZWxlY3RvcnMpO1xuICAgICAgcmVzdWx0ID0gIW5vdE1hdGNoZXIubWF0Y2goY3NzU2VsZWN0b3IsIG51bGwpO1xuICAgIH1cbiAgICBpZiAocmVzdWx0ICYmIGlzUHJlc2VudChjYWxsYmFjaykgJiZcbiAgICAgICAgKGlzQmxhbmsodGhpcy5saXN0Q29udGV4dCkgfHwgIXRoaXMubGlzdENvbnRleHQuYWxyZWFkeU1hdGNoZWQpKSB7XG4gICAgICBpZiAoaXNQcmVzZW50KHRoaXMubGlzdENvbnRleHQpKSB7XG4gICAgICAgIHRoaXMubGlzdENvbnRleHQuYWxyZWFkeU1hdGNoZWQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgY2FsbGJhY2sodGhpcy5zZWxlY3RvciwgdGhpcy5jYkNvbnRleHQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59XG4iXX0=