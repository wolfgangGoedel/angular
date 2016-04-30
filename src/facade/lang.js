'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var globalScope;
if (typeof window === 'undefined') {
    if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
        // TODO: Replace any with WorkerGlobalScope from lib.webworker.d.ts #3492
        globalScope = self;
    }
    else {
        globalScope = global;
    }
}
else {
    globalScope = window;
}
function scheduleMicroTask(fn) {
    Zone.current.scheduleMicroTask('scheduleMicrotask', fn);
}
exports.scheduleMicroTask = scheduleMicroTask;
exports.IS_DART = false;
// Need to declare a new variable for global here since TypeScript
// exports the original value of the symbol.
var _global = globalScope;
exports.global = _global;
exports.Type = Function;
function getTypeNameForDebugging(type) {
    if (type['name']) {
        return type['name'];
    }
    return typeof type;
}
exports.getTypeNameForDebugging = getTypeNameForDebugging;
exports.Math = _global.Math;
exports.Date = _global.Date;
var _devMode = true;
var _modeLocked = false;
function lockMode() {
    _modeLocked = true;
}
exports.lockMode = lockMode;
/**
 * Disable Angular's development mode, which turns off assertions and other
 * checks within the framework.
 *
 * One important assertion this disables verifies that a change detection pass
 * does not result in additional changes to any bindings (also known as
 * unidirectional data flow).
 */
function enableProdMode() {
    if (_modeLocked) {
        // Cannot use BaseException as that ends up importing from facade/lang.
        throw 'Cannot enable prod mode after platform setup.';
    }
    _devMode = false;
}
exports.enableProdMode = enableProdMode;
function assertionsEnabled() {
    return _devMode;
}
exports.assertionsEnabled = assertionsEnabled;
// TODO: remove calls to assert in production environment
// Note: Can't just export this and import in in other files
// as `assert` is a reserved keyword in Dart
_global.assert = function assert(condition) {
    // TODO: to be fixed properly via #2830, noop for now
};
function isPresent(obj) {
    return obj !== undefined && obj !== null;
}
exports.isPresent = isPresent;
function isBlank(obj) {
    return obj === undefined || obj === null;
}
exports.isBlank = isBlank;
function isBoolean(obj) {
    return typeof obj === "boolean";
}
exports.isBoolean = isBoolean;
function isNumber(obj) {
    return typeof obj === "number";
}
exports.isNumber = isNumber;
function isString(obj) {
    return typeof obj === "string";
}
exports.isString = isString;
function isFunction(obj) {
    return typeof obj === "function";
}
exports.isFunction = isFunction;
function isType(obj) {
    return isFunction(obj);
}
exports.isType = isType;
function isStringMap(obj) {
    return typeof obj === 'object' && obj !== null;
}
exports.isStringMap = isStringMap;
function isPromise(obj) {
    return obj instanceof _global.Promise;
}
exports.isPromise = isPromise;
function isArray(obj) {
    return Array.isArray(obj);
}
exports.isArray = isArray;
function isDate(obj) {
    return obj instanceof exports.Date && !isNaN(obj.valueOf());
}
exports.isDate = isDate;
function noop() { }
exports.noop = noop;
function stringify(token) {
    if (typeof token === 'string') {
        return token;
    }
    if (token === undefined || token === null) {
        return '' + token;
    }
    if (token.name) {
        return token.name;
    }
    if (token.overriddenName) {
        return token.overriddenName;
    }
    var res = token.toString();
    var newLineIndex = res.indexOf("\n");
    return (newLineIndex === -1) ? res : res.substring(0, newLineIndex);
}
exports.stringify = stringify;
// serialize / deserialize enum exist only for consistency with dart API
// enums in typescript don't need to be serialized
function serializeEnum(val) {
    return val;
}
exports.serializeEnum = serializeEnum;
function deserializeEnum(val, values) {
    return val;
}
exports.deserializeEnum = deserializeEnum;
function resolveEnumToken(enumValue, val) {
    return enumValue[val];
}
exports.resolveEnumToken = resolveEnumToken;
var StringWrapper = (function () {
    function StringWrapper() {
    }
    StringWrapper.fromCharCode = function (code) { return String.fromCharCode(code); };
    StringWrapper.charCodeAt = function (s, index) { return s.charCodeAt(index); };
    StringWrapper.split = function (s, regExp) { return s.split(regExp); };
    StringWrapper.equals = function (s, s2) { return s === s2; };
    StringWrapper.stripLeft = function (s, charVal) {
        if (s && s.length) {
            var pos = 0;
            for (var i = 0; i < s.length; i++) {
                if (s[i] != charVal)
                    break;
                pos++;
            }
            s = s.substring(pos);
        }
        return s;
    };
    StringWrapper.stripRight = function (s, charVal) {
        if (s && s.length) {
            var pos = s.length;
            for (var i = s.length - 1; i >= 0; i--) {
                if (s[i] != charVal)
                    break;
                pos--;
            }
            s = s.substring(0, pos);
        }
        return s;
    };
    StringWrapper.replace = function (s, from, replace) {
        return s.replace(from, replace);
    };
    StringWrapper.replaceAll = function (s, from, replace) {
        return s.replace(from, replace);
    };
    StringWrapper.slice = function (s, from, to) {
        if (from === void 0) { from = 0; }
        if (to === void 0) { to = null; }
        return s.slice(from, to === null ? undefined : to);
    };
    StringWrapper.replaceAllMapped = function (s, from, cb) {
        return s.replace(from, function () {
            var matches = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                matches[_i - 0] = arguments[_i];
            }
            // Remove offset & string from the result array
            matches.splice(-2, 2);
            // The callback receives match, p1, ..., pn
            return cb(matches);
        });
    };
    StringWrapper.contains = function (s, substr) { return s.indexOf(substr) != -1; };
    StringWrapper.compare = function (a, b) {
        if (a < b) {
            return -1;
        }
        else if (a > b) {
            return 1;
        }
        else {
            return 0;
        }
    };
    return StringWrapper;
}());
exports.StringWrapper = StringWrapper;
var StringJoiner = (function () {
    function StringJoiner(parts) {
        if (parts === void 0) { parts = []; }
        this.parts = parts;
    }
    StringJoiner.prototype.add = function (part) { this.parts.push(part); };
    StringJoiner.prototype.toString = function () { return this.parts.join(""); };
    return StringJoiner;
}());
exports.StringJoiner = StringJoiner;
var NumberParseError = (function (_super) {
    __extends(NumberParseError, _super);
    function NumberParseError(message) {
        _super.call(this);
        this.message = message;
    }
    NumberParseError.prototype.toString = function () { return this.message; };
    return NumberParseError;
}(Error));
exports.NumberParseError = NumberParseError;
var NumberWrapper = (function () {
    function NumberWrapper() {
    }
    NumberWrapper.toFixed = function (n, fractionDigits) { return n.toFixed(fractionDigits); };
    NumberWrapper.equal = function (a, b) { return a === b; };
    NumberWrapper.parseIntAutoRadix = function (text) {
        var result = parseInt(text);
        if (isNaN(result)) {
            throw new NumberParseError("Invalid integer literal when parsing " + text);
        }
        return result;
    };
    NumberWrapper.parseInt = function (text, radix) {
        if (radix == 10) {
            if (/^(\-|\+)?[0-9]+$/.test(text)) {
                return parseInt(text, radix);
            }
        }
        else if (radix == 16) {
            if (/^(\-|\+)?[0-9ABCDEFabcdef]+$/.test(text)) {
                return parseInt(text, radix);
            }
        }
        else {
            var result = parseInt(text, radix);
            if (!isNaN(result)) {
                return result;
            }
        }
        throw new NumberParseError("Invalid integer literal when parsing " + text + " in base " +
            radix);
    };
    // TODO: NaN is a valid literal but is returned by parseFloat to indicate an error.
    NumberWrapper.parseFloat = function (text) { return parseFloat(text); };
    Object.defineProperty(NumberWrapper, "NaN", {
        get: function () { return NaN; },
        enumerable: true,
        configurable: true
    });
    NumberWrapper.isNaN = function (value) { return isNaN(value); };
    NumberWrapper.isInteger = function (value) { return Number.isInteger(value); };
    return NumberWrapper;
}());
exports.NumberWrapper = NumberWrapper;
exports.RegExp = _global.RegExp;
var RegExpWrapper = (function () {
    function RegExpWrapper() {
    }
    RegExpWrapper.create = function (regExpStr, flags) {
        if (flags === void 0) { flags = ''; }
        flags = flags.replace(/g/g, '');
        return new _global.RegExp(regExpStr, flags + 'g');
    };
    RegExpWrapper.firstMatch = function (regExp, input) {
        // Reset multimatch regex state
        regExp.lastIndex = 0;
        return regExp.exec(input);
    };
    RegExpWrapper.test = function (regExp, input) {
        regExp.lastIndex = 0;
        return regExp.test(input);
    };
    RegExpWrapper.matcher = function (regExp, input) {
        // Reset regex state for the case
        // someone did not loop over all matches
        // last time.
        regExp.lastIndex = 0;
        return { re: regExp, input: input };
    };
    RegExpWrapper.replaceAll = function (regExp, input, replace) {
        var c = regExp.exec(input);
        var res = '';
        regExp.lastIndex = 0;
        var prev = 0;
        while (c) {
            res += input.substring(prev, c.index);
            res += replace(c);
            prev = c.index + c[0].length;
            regExp.lastIndex = prev;
            c = regExp.exec(input);
        }
        res += input.substring(prev);
        return res;
    };
    return RegExpWrapper;
}());
exports.RegExpWrapper = RegExpWrapper;
var RegExpMatcherWrapper = (function () {
    function RegExpMatcherWrapper() {
    }
    RegExpMatcherWrapper.next = function (matcher) {
        return matcher.re.exec(matcher.input);
    };
    return RegExpMatcherWrapper;
}());
exports.RegExpMatcherWrapper = RegExpMatcherWrapper;
var FunctionWrapper = (function () {
    function FunctionWrapper() {
    }
    FunctionWrapper.apply = function (fn, posArgs) { return fn.apply(null, posArgs); };
    return FunctionWrapper;
}());
exports.FunctionWrapper = FunctionWrapper;
// JS has NaN !== NaN
function looseIdentical(a, b) {
    return a === b || typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b);
}
exports.looseIdentical = looseIdentical;
// JS considers NaN is the same as NaN for map Key (while NaN !== NaN otherwise)
// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
function getMapKey(value) {
    return value;
}
exports.getMapKey = getMapKey;
function normalizeBlank(obj) {
    return isBlank(obj) ? null : obj;
}
exports.normalizeBlank = normalizeBlank;
function normalizeBool(obj) {
    return isBlank(obj) ? false : obj;
}
exports.normalizeBool = normalizeBool;
function isJsObject(o) {
    return o !== null && (typeof o === "function" || typeof o === "object");
}
exports.isJsObject = isJsObject;
function print(obj) {
    console.log(obj);
}
exports.print = print;
function warn(obj) {
    console.warn(obj);
}
exports.warn = warn;
// Can't be all uppercase as our transpiler would think it is a special directive...
var Json = (function () {
    function Json() {
    }
    Json.parse = function (s) { return _global.JSON.parse(s); };
    Json.stringify = function (data) {
        // Dart doesn't take 3 arguments
        return _global.JSON.stringify(data, null, 2);
    };
    return Json;
}());
exports.Json = Json;
var DateWrapper = (function () {
    function DateWrapper() {
    }
    DateWrapper.create = function (year, month, day, hour, minutes, seconds, milliseconds) {
        if (month === void 0) { month = 1; }
        if (day === void 0) { day = 1; }
        if (hour === void 0) { hour = 0; }
        if (minutes === void 0) { minutes = 0; }
        if (seconds === void 0) { seconds = 0; }
        if (milliseconds === void 0) { milliseconds = 0; }
        return new exports.Date(year, month - 1, day, hour, minutes, seconds, milliseconds);
    };
    DateWrapper.fromISOString = function (str) { return new exports.Date(str); };
    DateWrapper.fromMillis = function (ms) { return new exports.Date(ms); };
    DateWrapper.toMillis = function (date) { return date.getTime(); };
    DateWrapper.now = function () { return new exports.Date(); };
    DateWrapper.toJson = function (date) { return date.toJSON(); };
    return DateWrapper;
}());
exports.DateWrapper = DateWrapper;
function setValueOnPath(global, path, value) {
    var parts = path.split('.');
    var obj = global;
    while (parts.length > 1) {
        var name = parts.shift();
        if (obj.hasOwnProperty(name) && isPresent(obj[name])) {
            obj = obj[name];
        }
        else {
            obj = obj[name] = {};
        }
    }
    if (obj === undefined || obj === null) {
        obj = {};
    }
    obj[parts.shift()] = value;
}
exports.setValueOnPath = setValueOnPath;
var _symbolIterator = null;
function getSymbolIterator() {
    if (isBlank(_symbolIterator)) {
        if (isPresent(globalScope.Symbol) && isPresent(Symbol.iterator)) {
            _symbolIterator = Symbol.iterator;
        }
        else {
            // es6-shim specific logic
            var keys = Object.getOwnPropertyNames(Map.prototype);
            for (var i = 0; i < keys.length; ++i) {
                var key = keys[i];
                if (key !== 'entries' && key !== 'size' &&
                    Map.prototype[key] === Map.prototype['entries']) {
                    _symbolIterator = key;
                }
            }
        }
    }
    return _symbolIterator;
}
exports.getSymbolIterator = getSymbolIterator;
function evalExpression(sourceUrl, expr, declarations, vars) {
    var fnBody = declarations + "\nreturn " + expr + "\n//# sourceURL=" + sourceUrl;
    var fnArgNames = [];
    var fnArgValues = [];
    for (var argName in vars) {
        fnArgNames.push(argName);
        fnArgValues.push(vars[argName]);
    }
    return new (Function.bind.apply(Function, [void 0].concat(fnArgNames.concat(fnBody))))().apply(void 0, fnArgValues);
}
exports.evalExpression = evalExpression;
function isPrimitive(obj) {
    return !isJsObject(obj);
}
exports.isPrimitive = isPrimitive;
function hasConstructor(value, type) {
    return value.constructor === type;
}
exports.hasConstructor = hasConstructor;
function bitWiseOr(values) {
    return values.reduce(function (a, b) { return a | b; });
}
exports.bitWiseOr = bitWiseOr;
function bitWiseAnd(values) {
    return values.reduce(function (a, b) { return a & b; });
}
exports.bitWiseAnd = bitWiseAnd;
function escape(s) {
    return _global.encodeURI(s);
}
exports.escape = escape;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtdWtXeHJnZXoudG1wL2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUF3QkEsSUFBSSxXQUE4QixDQUFDO0FBQ25DLEVBQUUsQ0FBQyxDQUFDLE9BQU8sTUFBTSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFDbEMsRUFBRSxDQUFDLENBQUMsT0FBTyxpQkFBaUIsS0FBSyxXQUFXLElBQUksSUFBSSxZQUFZLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQUNsRix5RUFBeUU7UUFDekUsV0FBVyxHQUFRLElBQUksQ0FBQztJQUMxQixDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixXQUFXLEdBQVEsTUFBTSxDQUFDO0lBQzVCLENBQUM7QUFDSCxDQUFDO0FBQUMsSUFBSSxDQUFDLENBQUM7SUFDTixXQUFXLEdBQVEsTUFBTSxDQUFDO0FBQzVCLENBQUM7QUFFRCwyQkFBa0MsRUFBWTtJQUM1QyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzFELENBQUM7QUFGZSx5QkFBaUIsb0JBRWhDLENBQUE7QUFFWSxlQUFPLEdBQUcsS0FBSyxDQUFDO0FBRTdCLGtFQUFrRTtBQUNsRSw0Q0FBNEM7QUFDNUMsSUFBSSxPQUFPLEdBQXNCLFdBQVc7QUFFekIsY0FBTSxXQUZvQjtBQUlsQyxZQUFJLEdBQUcsUUFBUSxDQUFDO0FBZTNCLGlDQUF3QyxJQUFVO0lBQ2hELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN0QixDQUFDO0lBQ0QsTUFBTSxDQUFDLE9BQU8sSUFBSSxDQUFDO0FBQ3JCLENBQUM7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Q3pCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUNELE1BQU0sQ0FBQyxLQUFJLFFBQVEsWUFBUixRQUFRLGtCQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUMsZUFBSSxXQUFXLENBQUMsQ0FBQztBQUNwRSxDQUFDO0FBVmUsc0JBQWMsaUJBVTdCLENBQUE7QUFFRCxxQkFBNEIsR0FBUTtJQUNsQyxNQUFNLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQUZlLG1CQUFXLGNBRTFCLENBQUE7QUFFRCx3QkFBK0IsS0FBYSxFQUFFLElBQVU7SUFDdEQsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLEtBQUssSUFBSSxDQUFDO0FBQ3BDLENBQUM7QUFGZSxzQkFBYyxpQkFFN0IsQ0FBQTtBQUVELG1CQUEwQixNQUFnQjtJQUN4QyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQU8sTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwRCxDQUFDO0FBRmUsaUJBQVMsWUFFeEIsQ0FBQTtBQUVELG9CQUEyQixNQUFnQjtJQUN6QyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQU8sTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwRCxDQUFDO0FBRmUsa0JBQVUsYUFFekIsQ0FBQTtBQUVELGdCQUF1QixDQUFTO0lBQzlCLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlCLENBQUM7QUFGZSxjQUFNLFNBRXJCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgaW50ZXJmYWNlIEJyb3dzZXJOb2RlR2xvYmFsIHtcbiAgT2JqZWN0OiB0eXBlb2YgT2JqZWN0O1xuICBBcnJheTogdHlwZW9mIEFycmF5O1xuICBNYXA6IHR5cGVvZiBNYXA7XG4gIFNldDogdHlwZW9mIFNldDtcbiAgRGF0ZTogRGF0ZUNvbnN0cnVjdG9yO1xuICBSZWdFeHA6IFJlZ0V4cENvbnN0cnVjdG9yO1xuICBKU09OOiB0eXBlb2YgSlNPTjtcbiAgTWF0aDogYW55OyAgLy8gdHlwZW9mIE1hdGg7XG4gIGFzc2VydChjb25kaXRpb246IGFueSk6IHZvaWQ7XG4gIFJlZmxlY3Q6IGFueTtcbiAgZ2V0QW5ndWxhclRlc3RhYmlsaXR5OiBGdW5jdGlvbjtcbiAgZ2V0QWxsQW5ndWxhclRlc3RhYmlsaXRpZXM6IEZ1bmN0aW9uO1xuICBnZXRBbGxBbmd1bGFyUm9vdEVsZW1lbnRzOiBGdW5jdGlvbjtcbiAgZnJhbWV3b3JrU3RhYmlsaXplcnM6IEFycmF5PEZ1bmN0aW9uPjtcbiAgc2V0VGltZW91dDogRnVuY3Rpb247XG4gIGNsZWFyVGltZW91dDogRnVuY3Rpb247XG4gIHNldEludGVydmFsOiBGdW5jdGlvbjtcbiAgY2xlYXJJbnRlcnZhbDogRnVuY3Rpb247XG4gIGVuY29kZVVSSTogRnVuY3Rpb247XG59XG5cbi8vIFRPRE8oanRlcGxpdHo2MDIpOiBMb2FkIFdvcmtlckdsb2JhbFNjb3BlIGZyb20gbGliLndlYndvcmtlci5kLnRzIGZpbGUgIzM0OTJcbmRlY2xhcmUgdmFyIFdvcmtlckdsb2JhbFNjb3BlO1xudmFyIGdsb2JhbFNjb3BlOiBCcm93c2VyTm9kZUdsb2JhbDtcbmlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICBpZiAodHlwZW9mIFdvcmtlckdsb2JhbFNjb3BlICE9PSAndW5kZWZpbmVkJyAmJiBzZWxmIGluc3RhbmNlb2YgV29ya2VyR2xvYmFsU2NvcGUpIHtcbiAgICAvLyBUT0RPOiBSZXBsYWNlIGFueSB3aXRoIFdvcmtlckdsb2JhbFNjb3BlIGZyb20gbGliLndlYndvcmtlci5kLnRzICMzNDkyXG4gICAgZ2xvYmFsU2NvcGUgPSA8YW55PnNlbGY7XG4gIH0gZWxzZSB7XG4gICAgZ2xvYmFsU2NvcGUgPSA8YW55Pmdsb2JhbDtcbiAgfVxufSBlbHNlIHtcbiAgZ2xvYmFsU2NvcGUgPSA8YW55PndpbmRvdztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNjaGVkdWxlTWljcm9UYXNrKGZuOiBGdW5jdGlvbikge1xuICBab25lLmN1cnJlbnQuc2NoZWR1bGVNaWNyb1Rhc2soJ3NjaGVkdWxlTWljcm90YXNrJywgZm4pO1xufVxuXG5leHBvcnQgY29uc3QgSVNfREFSVCA9IGZhbHNlO1xuXG4vLyBOZWVkIHRvIGRlY2xhcmUgYSBuZXcgdmFyaWFibGUgZm9yIGdsb2JhbCBoZXJlIHNpbmNlIFR5cGVTY3JpcHRcbi8vIGV4cG9ydHMgdGhlIG9yaWdpbmFsIHZhbHVlIG9mIHRoZSBzeW1ib2wuXG52YXIgX2dsb2JhbDogQnJvd3Nlck5vZGVHbG9iYWwgPSBnbG9iYWxTY29wZTtcblxuZXhwb3J0IHtfZ2xvYmFsIGFzIGdsb2JhbH07XG5cbmV4cG9ydCB2YXIgVHlwZSA9IEZ1bmN0aW9uO1xuXG4vKipcbiAqIFJ1bnRpbWUgcmVwcmVzZW50YXRpb24gYSB0eXBlIHRoYXQgYSBDb21wb25lbnQgb3Igb3RoZXIgb2JqZWN0IGlzIGluc3RhbmNlcyBvZi5cbiAqXG4gKiBBbiBleGFtcGxlIG9mIGEgYFR5cGVgIGlzIGBNeUN1c3RvbUNvbXBvbmVudGAgY2xhc3MsIHdoaWNoIGluIEphdmFTY3JpcHQgaXMgYmUgcmVwcmVzZW50ZWQgYnlcbiAqIHRoZSBgTXlDdXN0b21Db21wb25lbnRgIGNvbnN0cnVjdG9yIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFR5cGUgZXh0ZW5kcyBGdW5jdGlvbiB7fVxuXG4vKipcbiAqIFJ1bnRpbWUgcmVwcmVzZW50YXRpb24gb2YgYSB0eXBlIHRoYXQgaXMgY29uc3RydWN0YWJsZSAobm9uLWFic3RyYWN0KS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb25jcmV0ZVR5cGUgZXh0ZW5kcyBUeXBlIHsgbmV3ICguLi5hcmdzKTogYW55OyB9XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUeXBlTmFtZUZvckRlYnVnZ2luZyh0eXBlOiBUeXBlKTogc3RyaW5nIHtcbiAgaWYgKHR5cGVbJ25hbWUnXSkge1xuICAgIHJldHVybiB0eXBlWyduYW1lJ107XG4gIH1cbiAgcmV0dXJuIHR5cGVvZiB0eXBlO1xufVxuXG5cbmV4cG9ydCB2YXIgTWF0aCA9IF9nbG9iYWwuTWF0aDtcbmV4cG9ydCB2YXIgRGF0ZSA9IF9nbG9iYWwuRGF0ZTtcblxudmFyIF9kZXZNb2RlOiBib29sZWFuID0gdHJ1ZTtcbnZhciBfbW9kZUxvY2tlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG5leHBvcnQgZnVuY3Rpb24gbG9ja01vZGUoKSB7XG4gIF9tb2RlTG9ja2VkID0gdHJ1ZTtcbn1cblxuLyoqXG4gKiBEaXNhYmxlIEFuZ3VsYXIncyBkZXZlbG9wbWVudCBtb2RlLCB3aGljaCB0dXJucyBvZmYgYXNzZXJ0aW9ucyBhbmQgb3RoZXJcbiAqIGNoZWNrcyB3aXRoaW4gdGhlIGZyYW1ld29yay5cbiAqXG4gKiBPbmUgaW1wb3J0YW50IGFzc2VydGlvbiB0aGlzIGRpc2FibGVzIHZlcmlmaWVzIHRoYXQgYSBjaGFuZ2UgZGV0ZWN0aW9uIHBhc3NcbiAqIGRvZXMgbm90IHJlc3VsdCBpbiBhZGRpdGlvbmFsIGNoYW5nZXMgdG8gYW55IGJpbmRpbmdzIChhbHNvIGtub3duIGFzXG4gKiB1bmlkaXJlY3Rpb25hbCBkYXRhIGZsb3cpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5hYmxlUHJvZE1vZGUoKSB7XG4gIGlmIChfbW9kZUxvY2tlZCkge1xuICAgIC8vIENhbm5vdCB1c2UgQmFzZUV4Y2VwdGlvbiBhcyB0aGF0IGVuZHMgdXAgaW1wb3J0aW5nIGZyb20gZmFjYWRlL2xhbmcuXG4gICAgdGhyb3cgJ0Nhbm5vdCBlbmFibGUgcHJvZCBtb2RlIGFmdGVyIHBsYXRmb3JtIHNldHVwLic7XG4gIH1cbiAgX2Rldk1vZGUgPSBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydGlvbnNFbmFibGVkKCk6IGJvb2xlYW4ge1xuICByZXR1cm4gX2Rldk1vZGU7XG59XG5cbi8vIFRPRE86IHJlbW92ZSBjYWxscyB0byBhc3NlcnQgaW4gcHJvZHVjdGlvbiBlbnZpcm9ubWVudFxuLy8gTm90ZTogQ2FuJ3QganVzdCBleHBvcnQgdGhpcyBhbmQgaW1wb3J0IGluIGluIG90aGVyIGZpbGVzXG4vLyBhcyBgYXNzZXJ0YCBpcyBhIHJlc2VydmVkIGtleXdvcmQgaW4gRGFydFxuX2dsb2JhbC5hc3NlcnQgPSBmdW5jdGlvbiBhc3NlcnQoY29uZGl0aW9uKSB7XG4gIC8vIFRPRE86IHRvIGJlIGZpeGVkIHByb3Blcmx5IHZpYSAjMjgzMCwgbm9vcCBmb3Igbm93XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gaXNQcmVzZW50KG9iajogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBvYmogIT09IHVuZGVmaW5lZCAmJiBvYmogIT09IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0JsYW5rKG9iajogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBvYmogPT09IHVuZGVmaW5lZCB8fCBvYmogPT09IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Jvb2xlYW4ob2JqOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmogPT09IFwiYm9vbGVhblwiO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOdW1iZXIob2JqOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmogPT09IFwibnVtYmVyXCI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1N0cmluZyhvYmo6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gXCJzdHJpbmdcIjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb24ob2JqOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmogPT09IFwiZnVuY3Rpb25cIjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVHlwZShvYmo6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNGdW5jdGlvbihvYmopO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTdHJpbmdNYXAob2JqOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIG9iaiAhPT0gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvbWlzZShvYmo6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gb2JqIGluc3RhbmNlb2YgKDxhbnk+X2dsb2JhbCkuUHJvbWlzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQXJyYXkob2JqOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkob2JqKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGF0ZShvYmopOiBib29sZWFuIHtcbiAgcmV0dXJuIG9iaiBpbnN0YW5jZW9mIERhdGUgJiYgIWlzTmFOKG9iai52YWx1ZU9mKCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9vcCgpIHt9XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdpZnkodG9rZW4pOiBzdHJpbmcge1xuICBpZiAodHlwZW9mIHRva2VuID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB0b2tlbjtcbiAgfVxuXG4gIGlmICh0b2tlbiA9PT0gdW5kZWZpbmVkIHx8IHRva2VuID09PSBudWxsKSB7XG4gICAgcmV0dXJuICcnICsgdG9rZW47XG4gIH1cblxuICBpZiAodG9rZW4ubmFtZSkge1xuICAgIHJldHVybiB0b2tlbi5uYW1lO1xuICB9XG4gIGlmICh0b2tlbi5vdmVycmlkZGVuTmFtZSkge1xuICAgIHJldHVybiB0b2tlbi5vdmVycmlkZGVuTmFtZTtcbiAgfVxuXG4gIHZhciByZXMgPSB0b2tlbi50b1N0cmluZygpO1xuICB2YXIgbmV3TGluZUluZGV4ID0gcmVzLmluZGV4T2YoXCJcXG5cIik7XG4gIHJldHVybiAobmV3TGluZUluZGV4ID09PSAtMSkgPyByZXMgOiByZXMuc3Vic3RyaW5nKDAsIG5ld0xpbmVJbmRleCk7XG59XG5cbi8vIHNlcmlhbGl6ZSAvIGRlc2VyaWFsaXplIGVudW0gZXhpc3Qgb25seSBmb3IgY29uc2lzdGVuY3kgd2l0aCBkYXJ0IEFQSVxuLy8gZW51bXMgaW4gdHlwZXNjcmlwdCBkb24ndCBuZWVkIHRvIGJlIHNlcmlhbGl6ZWRcblxuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZUVudW0odmFsKTogbnVtYmVyIHtcbiAgcmV0dXJuIHZhbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlc2VyaWFsaXplRW51bSh2YWwsIHZhbHVlczogTWFwPG51bWJlciwgYW55Pik6IGFueSB7XG4gIHJldHVybiB2YWw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlRW51bVRva2VuKGVudW1WYWx1ZSwgdmFsKTogc3RyaW5nIHtcbiAgcmV0dXJuIGVudW1WYWx1ZVt2YWxdO1xufVxuXG5leHBvcnQgY2xhc3MgU3RyaW5nV3JhcHBlciB7XG4gIHN0YXRpYyBmcm9tQ2hhckNvZGUoY29kZTogbnVtYmVyKTogc3RyaW5nIHsgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZSk7IH1cblxuICBzdGF0aWMgY2hhckNvZGVBdChzOiBzdHJpbmcsIGluZGV4OiBudW1iZXIpOiBudW1iZXIgeyByZXR1cm4gcy5jaGFyQ29kZUF0KGluZGV4KTsgfVxuXG4gIHN0YXRpYyBzcGxpdChzOiBzdHJpbmcsIHJlZ0V4cDogUmVnRXhwKTogc3RyaW5nW10geyByZXR1cm4gcy5zcGxpdChyZWdFeHApOyB9XG5cbiAgc3RhdGljIGVxdWFscyhzOiBzdHJpbmcsIHMyOiBzdHJpbmcpOiBib29sZWFuIHsgcmV0dXJuIHMgPT09IHMyOyB9XG5cbiAgc3RhdGljIHN0cmlwTGVmdChzOiBzdHJpbmcsIGNoYXJWYWw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHMgJiYgcy5sZW5ndGgpIHtcbiAgICAgIHZhciBwb3MgPSAwO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzW2ldICE9IGNoYXJWYWwpIGJyZWFrO1xuICAgICAgICBwb3MrKztcbiAgICAgIH1cbiAgICAgIHMgPSBzLnN1YnN0cmluZyhwb3MpO1xuICAgIH1cbiAgICByZXR1cm4gcztcbiAgfVxuXG4gIHN0YXRpYyBzdHJpcFJpZ2h0KHM6IHN0cmluZywgY2hhclZhbDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAocyAmJiBzLmxlbmd0aCkge1xuICAgICAgdmFyIHBvcyA9IHMubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaSA9IHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgaWYgKHNbaV0gIT0gY2hhclZhbCkgYnJlYWs7XG4gICAgICAgIHBvcy0tO1xuICAgICAgfVxuICAgICAgcyA9IHMuc3Vic3RyaW5nKDAsIHBvcyk7XG4gICAgfVxuICAgIHJldHVybiBzO1xuICB9XG5cbiAgc3RhdGljIHJlcGxhY2Uoczogc3RyaW5nLCBmcm9tOiBzdHJpbmcsIHJlcGxhY2U6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHMucmVwbGFjZShmcm9tLCByZXBsYWNlKTtcbiAgfVxuXG4gIHN0YXRpYyByZXBsYWNlQWxsKHM6IHN0cmluZywgZnJvbTogUmVnRXhwLCByZXBsYWNlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBzLnJlcGxhY2UoZnJvbSwgcmVwbGFjZSk7XG4gIH1cblxuICBzdGF0aWMgc2xpY2U8VD4oczogc3RyaW5nLCBmcm9tOiBudW1iZXIgPSAwLCB0bzogbnVtYmVyID0gbnVsbCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHMuc2xpY2UoZnJvbSwgdG8gPT09IG51bGwgPyB1bmRlZmluZWQgOiB0byk7XG4gIH1cblxuICBzdGF0aWMgcmVwbGFjZUFsbE1hcHBlZChzOiBzdHJpbmcsIGZyb206IFJlZ0V4cCwgY2I6IEZ1bmN0aW9uKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcy5yZXBsYWNlKGZyb20sIGZ1bmN0aW9uKC4uLm1hdGNoZXMpIHtcbiAgICAgIC8vIFJlbW92ZSBvZmZzZXQgJiBzdHJpbmcgZnJvbSB0aGUgcmVzdWx0IGFycmF5XG4gICAgICBtYXRjaGVzLnNwbGljZSgtMiwgMik7XG4gICAgICAvLyBUaGUgY2FsbGJhY2sgcmVjZWl2ZXMgbWF0Y2gsIHAxLCAuLi4sIHBuXG4gICAgICByZXR1cm4gY2IobWF0Y2hlcyk7XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgY29udGFpbnMoczogc3RyaW5nLCBzdWJzdHI6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gcy5pbmRleE9mKHN1YnN0cikgIT0gLTE7IH1cblxuICBzdGF0aWMgY29tcGFyZShhOiBzdHJpbmcsIGI6IHN0cmluZyk6IG51bWJlciB7XG4gICAgaWYgKGEgPCBiKSB7XG4gICAgICByZXR1cm4gLTE7XG4gICAgfSBlbHNlIGlmIChhID4gYikge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU3RyaW5nSm9pbmVyIHtcbiAgY29uc3RydWN0b3IocHVibGljIHBhcnRzID0gW10pIHt9XG5cbiAgYWRkKHBhcnQ6IHN0cmluZyk6IHZvaWQgeyB0aGlzLnBhcnRzLnB1c2gocGFydCk7IH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5wYXJ0cy5qb2luKFwiXCIpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBOdW1iZXJQYXJzZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBuYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHVibGljIG1lc3NhZ2U6IHN0cmluZykgeyBzdXBlcigpOyB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMubWVzc2FnZTsgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBOdW1iZXJXcmFwcGVyIHtcbiAgc3RhdGljIHRvRml4ZWQobjogbnVtYmVyLCBmcmFjdGlvbkRpZ2l0czogbnVtYmVyKTogc3RyaW5nIHsgcmV0dXJuIG4udG9GaXhlZChmcmFjdGlvbkRpZ2l0cyk7IH1cblxuICBzdGF0aWMgZXF1YWwoYTogbnVtYmVyLCBiOiBudW1iZXIpOiBib29sZWFuIHsgcmV0dXJuIGEgPT09IGI7IH1cblxuICBzdGF0aWMgcGFyc2VJbnRBdXRvUmFkaXgodGV4dDogc3RyaW5nKTogbnVtYmVyIHtcbiAgICB2YXIgcmVzdWx0OiBudW1iZXIgPSBwYXJzZUludCh0ZXh0KTtcbiAgICBpZiAoaXNOYU4ocmVzdWx0KSkge1xuICAgICAgdGhyb3cgbmV3IE51bWJlclBhcnNlRXJyb3IoXCJJbnZhbGlkIGludGVnZXIgbGl0ZXJhbCB3aGVuIHBhcnNpbmcgXCIgKyB0ZXh0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHN0YXRpYyBwYXJzZUludCh0ZXh0OiBzdHJpbmcsIHJhZGl4OiBudW1iZXIpOiBudW1iZXIge1xuICAgIGlmIChyYWRpeCA9PSAxMCkge1xuICAgICAgaWYgKC9eKFxcLXxcXCspP1swLTldKyQvLnRlc3QodGV4dCkpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRleHQsIHJhZGl4KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHJhZGl4ID09IDE2KSB7XG4gICAgICBpZiAoL14oXFwtfFxcKyk/WzAtOUFCQ0RFRmFiY2RlZl0rJC8udGVzdCh0ZXh0KSkge1xuICAgICAgICByZXR1cm4gcGFyc2VJbnQodGV4dCwgcmFkaXgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcmVzdWx0OiBudW1iZXIgPSBwYXJzZUludCh0ZXh0LCByYWRpeCk7XG4gICAgICBpZiAoIWlzTmFOKHJlc3VsdCkpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhyb3cgbmV3IE51bWJlclBhcnNlRXJyb3IoXCJJbnZhbGlkIGludGVnZXIgbGl0ZXJhbCB3aGVuIHBhcnNpbmcgXCIgKyB0ZXh0ICsgXCIgaW4gYmFzZSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmFkaXgpO1xuICB9XG5cbiAgLy8gVE9ETzogTmFOIGlzIGEgdmFsaWQgbGl0ZXJhbCBidXQgaXMgcmV0dXJuZWQgYnkgcGFyc2VGbG9hdCB0byBpbmRpY2F0ZSBhbiBlcnJvci5cbiAgc3RhdGljIHBhcnNlRmxvYXQodGV4dDogc3RyaW5nKTogbnVtYmVyIHsgcmV0dXJuIHBhcnNlRmxvYXQodGV4dCk7IH1cblxuICBzdGF0aWMgZ2V0IE5hTigpOiBudW1iZXIgeyByZXR1cm4gTmFOOyB9XG5cbiAgc3RhdGljIGlzTmFOKHZhbHVlOiBhbnkpOiBib29sZWFuIHsgcmV0dXJuIGlzTmFOKHZhbHVlKTsgfVxuXG4gIHN0YXRpYyBpc0ludGVnZXIodmFsdWU6IGFueSk6IGJvb2xlYW4geyByZXR1cm4gTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSk7IH1cbn1cblxuZXhwb3J0IHZhciBSZWdFeHAgPSBfZ2xvYmFsLlJlZ0V4cDtcblxuZXhwb3J0IGNsYXNzIFJlZ0V4cFdyYXBwZXIge1xuICBzdGF0aWMgY3JlYXRlKHJlZ0V4cFN0cjogc3RyaW5nLCBmbGFnczogc3RyaW5nID0gJycpOiBSZWdFeHAge1xuICAgIGZsYWdzID0gZmxhZ3MucmVwbGFjZSgvZy9nLCAnJyk7XG4gICAgcmV0dXJuIG5ldyBfZ2xvYmFsLlJlZ0V4cChyZWdFeHBTdHIsIGZsYWdzICsgJ2cnKTtcbiAgfVxuICBzdGF0aWMgZmlyc3RNYXRjaChyZWdFeHA6IFJlZ0V4cCwgaW5wdXQ6IHN0cmluZyk6IFJlZ0V4cEV4ZWNBcnJheSB7XG4gICAgLy8gUmVzZXQgbXVsdGltYXRjaCByZWdleCBzdGF0ZVxuICAgIHJlZ0V4cC5sYXN0SW5kZXggPSAwO1xuICAgIHJldHVybiByZWdFeHAuZXhlYyhpbnB1dCk7XG4gIH1cbiAgc3RhdGljIHRlc3QocmVnRXhwOiBSZWdFeHAsIGlucHV0OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZWdFeHAubGFzdEluZGV4ID0gMDtcbiAgICByZXR1cm4gcmVnRXhwLnRlc3QoaW5wdXQpO1xuICB9XG4gIHN0YXRpYyBtYXRjaGVyKHJlZ0V4cDogUmVnRXhwLCBpbnB1dDogc3RyaW5nKToge1xuICAgIHJlOiBSZWdFeHA7XG4gICAgaW5wdXQ6IHN0cmluZ1xuICB9XG4gIHtcbiAgICAvLyBSZXNldCByZWdleCBzdGF0ZSBmb3IgdGhlIGNhc2VcbiAgICAvLyBzb21lb25lIGRpZCBub3QgbG9vcCBvdmVyIGFsbCBtYXRjaGVzXG4gICAgLy8gbGFzdCB0aW1lLlxuICAgIHJlZ0V4cC5sYXN0SW5kZXggPSAwO1xuICAgIHJldHVybiB7cmU6IHJlZ0V4cCwgaW5wdXQ6IGlucHV0fTtcbiAgfVxuICBzdGF0aWMgcmVwbGFjZUFsbChyZWdFeHA6IFJlZ0V4cCwgaW5wdXQ6IHN0cmluZywgcmVwbGFjZTogRnVuY3Rpb24pOiBzdHJpbmcge1xuICAgIGxldCBjID0gcmVnRXhwLmV4ZWMoaW5wdXQpO1xuICAgIGxldCByZXMgPSAnJztcbiAgICByZWdFeHAubGFzdEluZGV4ID0gMDtcbiAgICBsZXQgcHJldiA9IDA7XG4gICAgd2hpbGUgKGMpIHtcbiAgICAgIHJlcyArPSBpbnB1dC5zdWJzdHJpbmcocHJldiwgYy5pbmRleCk7XG4gICAgICByZXMgKz0gcmVwbGFjZShjKTtcbiAgICAgIHByZXYgPSBjLmluZGV4ICsgY1swXS5sZW5ndGg7XG4gICAgICByZWdFeHAubGFzdEluZGV4ID0gcHJldjtcbiAgICAgIGMgPSByZWdFeHAuZXhlYyhpbnB1dCk7XG4gICAgfVxuICAgIHJlcyArPSBpbnB1dC5zdWJzdHJpbmcocHJldik7XG4gICAgcmV0dXJuIHJlcztcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVnRXhwTWF0Y2hlcldyYXBwZXIge1xuICBzdGF0aWMgbmV4dChtYXRjaGVyOiB7XG4gICAgcmU6IFJlZ0V4cDtcbiAgICBpbnB1dDogc3RyaW5nXG4gIH0pOiBSZWdFeHBFeGVjQXJyYXkge1xuICAgIHJldHVybiBtYXRjaGVyLnJlLmV4ZWMobWF0Y2hlci5pbnB1dCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEZ1bmN0aW9uV3JhcHBlciB7XG4gIHN0YXRpYyBhcHBseShmbjogRnVuY3Rpb24sIHBvc0FyZ3M6IGFueSk6IGFueSB7IHJldHVybiBmbi5hcHBseShudWxsLCBwb3NBcmdzKTsgfVxufVxuXG4vLyBKUyBoYXMgTmFOICE9PSBOYU5cbmV4cG9ydCBmdW5jdGlvbiBsb29zZUlkZW50aWNhbChhLCBiKTogYm9vbGVhbiB7XG4gIHJldHVybiBhID09PSBiIHx8IHR5cGVvZiBhID09PSBcIm51bWJlclwiICYmIHR5cGVvZiBiID09PSBcIm51bWJlclwiICYmIGlzTmFOKGEpICYmIGlzTmFOKGIpO1xufVxuXG4vLyBKUyBjb25zaWRlcnMgTmFOIGlzIHRoZSBzYW1lIGFzIE5hTiBmb3IgbWFwIEtleSAod2hpbGUgTmFOICE9PSBOYU4gb3RoZXJ3aXNlKVxuLy8gc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL01hcFxuZXhwb3J0IGZ1bmN0aW9uIGdldE1hcEtleTxUPih2YWx1ZTogVCk6IFQge1xuICByZXR1cm4gdmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVCbGFuayhvYmo6IE9iamVjdCk6IGFueSB7XG4gIHJldHVybiBpc0JsYW5rKG9iaikgPyBudWxsIDogb2JqO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplQm9vbChvYmo6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzQmxhbmsob2JqKSA/IGZhbHNlIDogb2JqO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNKc09iamVjdChvOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIG8gIT09IG51bGwgJiYgKHR5cGVvZiBvID09PSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIG8gPT09IFwib2JqZWN0XCIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJpbnQob2JqOiBFcnJvciB8IE9iamVjdCkge1xuICBjb25zb2xlLmxvZyhvYmopO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd2FybihvYmo6IEVycm9yIHwgT2JqZWN0KSB7XG4gIGNvbnNvbGUud2FybihvYmopO1xufVxuXG4vLyBDYW4ndCBiZSBhbGwgdXBwZXJjYXNlIGFzIG91ciB0cmFuc3BpbGVyIHdvdWxkIHRoaW5rIGl0IGlzIGEgc3BlY2lhbCBkaXJlY3RpdmUuLi5cbmV4cG9ydCBjbGFzcyBKc29uIHtcbiAgc3RhdGljIHBhcnNlKHM6IHN0cmluZyk6IE9iamVjdCB7IHJldHVybiBfZ2xvYmFsLkpTT04ucGFyc2Uocyk7IH1cbiAgc3RhdGljIHN0cmluZ2lmeShkYXRhOiBPYmplY3QpOiBzdHJpbmcge1xuICAgIC8vIERhcnQgZG9lc24ndCB0YWtlIDMgYXJndW1lbnRzXG4gICAgcmV0dXJuIF9nbG9iYWwuSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERhdGVXcmFwcGVyIHtcbiAgc3RhdGljIGNyZWF0ZSh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIgPSAxLCBkYXk6IG51bWJlciA9IDEsIGhvdXI6IG51bWJlciA9IDAsXG4gICAgICAgICAgICAgICAgbWludXRlczogbnVtYmVyID0gMCwgc2Vjb25kczogbnVtYmVyID0gMCwgbWlsbGlzZWNvbmRzOiBudW1iZXIgPSAwKTogRGF0ZSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHllYXIsIG1vbnRoIC0gMSwgZGF5LCBob3VyLCBtaW51dGVzLCBzZWNvbmRzLCBtaWxsaXNlY29uZHMpO1xuICB9XG4gIHN0YXRpYyBmcm9tSVNPU3RyaW5nKHN0cjogc3RyaW5nKTogRGF0ZSB7IHJldHVybiBuZXcgRGF0ZShzdHIpOyB9XG4gIHN0YXRpYyBmcm9tTWlsbGlzKG1zOiBudW1iZXIpOiBEYXRlIHsgcmV0dXJuIG5ldyBEYXRlKG1zKTsgfVxuICBzdGF0aWMgdG9NaWxsaXMoZGF0ZTogRGF0ZSk6IG51bWJlciB7IHJldHVybiBkYXRlLmdldFRpbWUoKTsgfVxuICBzdGF0aWMgbm93KCk6IERhdGUgeyByZXR1cm4gbmV3IERhdGUoKTsgfVxuICBzdGF0aWMgdG9Kc29uKGRhdGU6IERhdGUpOiBzdHJpbmcgeyByZXR1cm4gZGF0ZS50b0pTT04oKTsgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0VmFsdWVPblBhdGgoZ2xvYmFsOiBhbnksIHBhdGg6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICB2YXIgcGFydHMgPSBwYXRoLnNwbGl0KCcuJyk7XG4gIHZhciBvYmo6IGFueSA9IGdsb2JhbDtcbiAgd2hpbGUgKHBhcnRzLmxlbmd0aCA+IDEpIHtcbiAgICB2YXIgbmFtZSA9IHBhcnRzLnNoaWZ0KCk7XG4gICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShuYW1lKSAmJiBpc1ByZXNlbnQob2JqW25hbWVdKSkge1xuICAgICAgb2JqID0gb2JqW25hbWVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBvYmogPSBvYmpbbmFtZV0gPSB7fTtcbiAgICB9XG4gIH1cbiAgaWYgKG9iaiA9PT0gdW5kZWZpbmVkIHx8IG9iaiA9PT0gbnVsbCkge1xuICAgIG9iaiA9IHt9O1xuICB9XG4gIG9ialtwYXJ0cy5zaGlmdCgpXSA9IHZhbHVlO1xufVxuXG4vLyBXaGVuIFN5bWJvbC5pdGVyYXRvciBkb2Vzbid0IGV4aXN0LCByZXRyaWV2ZXMgdGhlIGtleSB1c2VkIGluIGVzNi1zaGltXG5kZWNsYXJlIHZhciBTeW1ib2w7XG52YXIgX3N5bWJvbEl0ZXJhdG9yID0gbnVsbDtcbmV4cG9ydCBmdW5jdGlvbiBnZXRTeW1ib2xJdGVyYXRvcigpOiBzdHJpbmcgfCBzeW1ib2wge1xuICBpZiAoaXNCbGFuayhfc3ltYm9sSXRlcmF0b3IpKSB7XG4gICAgaWYgKGlzUHJlc2VudCgoPGFueT5nbG9iYWxTY29wZSkuU3ltYm9sKSAmJiBpc1ByZXNlbnQoU3ltYm9sLml0ZXJhdG9yKSkge1xuICAgICAgX3N5bWJvbEl0ZXJhdG9yID0gU3ltYm9sLml0ZXJhdG9yO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBlczYtc2hpbSBzcGVjaWZpYyBsb2dpY1xuICAgICAgdmFyIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhNYXAucHJvdG90eXBlKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgaWYgKGtleSAhPT0gJ2VudHJpZXMnICYmIGtleSAhPT0gJ3NpemUnICYmXG4gICAgICAgICAgICBNYXAucHJvdG90eXBlW2tleV0gPT09IE1hcC5wcm90b3R5cGVbJ2VudHJpZXMnXSkge1xuICAgICAgICAgIF9zeW1ib2xJdGVyYXRvciA9IGtleTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gX3N5bWJvbEl0ZXJhdG9yO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXZhbEV4cHJlc3Npb24oc291cmNlVXJsOiBzdHJpbmcsIGV4cHI6IHN0cmluZywgZGVjbGFyYXRpb25zOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyczoge1trZXk6IHN0cmluZ106IGFueX0pOiBhbnkge1xuICB2YXIgZm5Cb2R5ID0gYCR7ZGVjbGFyYXRpb25zfVxcbnJldHVybiAke2V4cHJ9XFxuLy8jIHNvdXJjZVVSTD0ke3NvdXJjZVVybH1gO1xuICB2YXIgZm5BcmdOYW1lcyA9IFtdO1xuICB2YXIgZm5BcmdWYWx1ZXMgPSBbXTtcbiAgZm9yICh2YXIgYXJnTmFtZSBpbiB2YXJzKSB7XG4gICAgZm5BcmdOYW1lcy5wdXNoKGFyZ05hbWUpO1xuICAgIGZuQXJnVmFsdWVzLnB1c2godmFyc1thcmdOYW1lXSk7XG4gIH1cbiAgcmV0dXJuIG5ldyBGdW5jdGlvbiguLi5mbkFyZ05hbWVzLmNvbmNhdChmbkJvZHkpKSguLi5mbkFyZ1ZhbHVlcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1ByaW1pdGl2ZShvYmo6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gIWlzSnNPYmplY3Qob2JqKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc0NvbnN0cnVjdG9yKHZhbHVlOiBPYmplY3QsIHR5cGU6IFR5cGUpOiBib29sZWFuIHtcbiAgcmV0dXJuIHZhbHVlLmNvbnN0cnVjdG9yID09PSB0eXBlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYml0V2lzZU9yKHZhbHVlczogbnVtYmVyW10pOiBudW1iZXIge1xuICByZXR1cm4gdmFsdWVzLnJlZHVjZSgoYSwgYikgPT4geyByZXR1cm4gYSB8IGI7IH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYml0V2lzZUFuZCh2YWx1ZXM6IG51bWJlcltdKTogbnVtYmVyIHtcbiAgcmV0dXJuIHZhbHVlcy5yZWR1Y2UoKGEsIGIpID0+IHsgcmV0dXJuIGEgJiBiOyB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVzY2FwZShzOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gX2dsb2JhbC5lbmNvZGVVUkkocyk7XG59XG4iXX0=