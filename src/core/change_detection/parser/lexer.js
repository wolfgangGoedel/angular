'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var decorators_1 = require('angular2/src/core/di/decorators');
var collection_1 = require("angular2/src/facade/collection");
var lang_1 = require("angular2/src/facade/lang");
var exceptions_1 = require('angular2/src/facade/exceptions');
(function (TokenType) {
    TokenType[TokenType["Character"] = 0] = "Character";
    TokenType[TokenType["Identifier"] = 1] = "Identifier";
    TokenType[TokenType["Keyword"] = 2] = "Keyword";
    TokenType[TokenType["String"] = 3] = "String";
    TokenType[TokenType["Operator"] = 4] = "Operator";
    TokenType[TokenType["Number"] = 5] = "Number";
})(exports.TokenType || (exports.TokenType = {}));
var TokenType = exports.TokenType;
var Lexer = (function () {
    function Lexer() {
    }
    Lexer.prototype.tokenize = function (text) {
        var scanner = new _Scanner(text);
        var tokens = [];
        var token = scanner.scanToken();
        while (token != null) {
            tokens.push(token);
            token = scanner.scanToken();
        }
        return tokens;
    };
    Lexer = __decorate([
        decorators_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], Lexer);
    return Lexer;
}());
exports.Lexer = Lexer;
var Token = (function () {
    function Token(index, type, numValue, strValue) {
        this.index = index;
        this.type = type;
        this.numValue = numValue;
        this.strValue = strValue;
    }
    Token.prototype.isCharacter = function (code) {
        return (this.type == TokenType.Character && this.numValue == code);
    };
    Token.prototype.isNumber = function () { return (this.type == TokenType.Number); };
    Token.prototype.isString = function () { return (this.type == TokenType.String); };
    Token.prototype.isOperator = function (operater) {
        return (this.type == TokenType.Operator && this.strValue == operater);
    };
    Token.prototype.isIdentifier = function () { return (this.type == TokenType.Identifier); };
    Token.prototype.isKeyword = function () { return (this.type == TokenType.Keyword); };
    Token.prototype.isKeywordVar = function () { return (this.type == TokenType.Keyword && this.strValue == "var"); };
    Token.prototype.isKeywordNull = function () { return (this.type == TokenType.Keyword && this.strValue == "null"); };
    Token.prototype.isKeywordUndefined = function () {
        return (this.type == TokenType.Keyword && this.strValue == "undefined");
    };
    Token.prototype.isKeywordTrue = function () { return (this.type == TokenType.Keyword && this.strValue == "true"); };
    Token.prototype.isKeywordFalse = function () { return (this.type == TokenType.Keyword && this.strValue == "false"); };
    Token.prototype.toNumber = function () {
        // -1 instead of NULL ok?
        return (this.type == TokenType.Number) ? this.numValue : -1;
    };
    Token.prototype.toString = function () {
        switch (this.type) {
            case TokenType.Character:
            case TokenType.Identifier:
            case TokenType.Keyword:
            case TokenType.Operator:
            case TokenType.String:
                return this.strValue;
            case TokenType.Number:
                return this.numValue.toString();
            default:
                return null;
        }
    };
    return Token;
}());
exports.Token = Token;
function newCharacterToken(index, code) {
    return new Token(index, TokenType.Character, code, lang_1.StringWrapper.fromCharCode(code));
}
function newIdentifierToken(index, text) {
    return new Token(index, TokenType.Identifier, 0, text);
}
function newKeywordToken(index, text) {
    return new Token(index, TokenType.Keyword, 0, text);
}
function newOperatorToken(index, text) {
    return new Token(index, TokenType.Operator, 0, text);
}
function newStringToken(index, text) {
    return new Token(index, TokenType.String, 0, text);
}
function newNumberToken(index, n) {
    return new Token(index, TokenType.Number, n, "");
}
exports.EOF = new Token(-1, TokenType.Character, 0, "");
exports.$EOF = lang_1.CONST_EXPR(lang_1.CONST_EXPR(0));
exports.$TAB = lang_1.CONST_EXPR(9);
exports.$LF = lang_1.CONST_EXPR(10);
exports.$VTAB = lang_1.CONST_EXPR(11);
exports.$FF = lang_1.CONST_EXPR(12);
exports.$CR = lang_1.CONST_EXPR(13);
exports.$SPACE = lang_1.CONST_EXPR(32);
exports.$BANG = lang_1.CONST_EXPR(33);
exports.$DQ = lang_1.CONST_EXPR(34);
exports.$HASH = lang_1.CONST_EXPR(35);
exports.$$ = lang_1.CONST_EXPR(36);
exports.$PERCENT = lang_1.CONST_EXPR(37);
exports.$AMPERSAND = lang_1.CONST_EXPR(38);
exports.$SQ = lang_1.CONST_EXPR(39);
exports.$LPAREN = lang_1.CONST_EXPR(40);
exports.$RPAREN = lang_1.CONST_EXPR(41);
exports.$STAR = lang_1.CONST_EXPR(42);
exports.$PLUS = lang_1.CONST_EXPR(43);
exports.$COMMA = lang_1.CONST_EXPR(44);
exports.$MINUS = lang_1.CONST_EXPR(45);
exports.$PERIOD = lang_1.CONST_EXPR(46);
exports.$SLASH = lang_1.CONST_EXPR(47);
exports.$COLON = lang_1.CONST_EXPR(58);
exports.$SEMICOLON = lang_1.CONST_EXPR(59);
exports.$LT = lang_1.CONST_EXPR(60);
exports.$EQ = lang_1.CONST_EXPR(61);
exports.$GT = lang_1.CONST_EXPR(62);
exports.$QUESTION = lang_1.CONST_EXPR(63);
var $0 = lang_1.CONST_EXPR(48);
var $9 = lang_1.CONST_EXPR(57);
var $A = lang_1.CONST_EXPR(65), $E = lang_1.CONST_EXPR(69), $Z = lang_1.CONST_EXPR(90);
exports.$LBRACKET = lang_1.CONST_EXPR(91);
exports.$BACKSLASH = lang_1.CONST_EXPR(92);
exports.$RBRACKET = lang_1.CONST_EXPR(93);
var $CARET = lang_1.CONST_EXPR(94);
var $_ = lang_1.CONST_EXPR(95);
exports.$BT = lang_1.CONST_EXPR(96);
var $a = lang_1.CONST_EXPR(97), $e = lang_1.CONST_EXPR(101), $f = lang_1.CONST_EXPR(102), $n = lang_1.CONST_EXPR(110), $r = lang_1.CONST_EXPR(114), $t = lang_1.CONST_EXPR(116), $u = lang_1.CONST_EXPR(117), $v = lang_1.CONST_EXPR(118), $z = lang_1.CONST_EXPR(122);
exports.$LBRACE = lang_1.CONST_EXPR(123);
exports.$BAR = lang_1.CONST_EXPR(124);
exports.$RBRACE = lang_1.CONST_EXPR(125);
var $NBSP = lang_1.CONST_EXPR(160);
var ScannerError = (function (_super) {
    __extends(ScannerError, _super);
    function ScannerError(message) {
        _super.call(this);
        this.message = message;
    }
    ScannerError.prototype.toString = function () { return this.message; };
    return ScannerError;
}(exceptions_1.BaseException));
exports.ScannerError = ScannerError;
var _Scanner = (function () {
    function _Scanner(input) {
        this.input = input;
        this.peek = 0;
        this.index = -1;
        this.length = input.length;
        this.advance();
    }
    _Scanner.prototype.advance = function () {
        this.peek =
            ++this.index >= this.length ? exports.$EOF : lang_1.StringWrapper.charCodeAt(this.input, this.index);
    };
    _Scanner.prototype.scanToken = function () {
        var input = this.input, length = this.length, peek = this.peek, index = this.index;
        // Skip whitespace.
        while (peek <= exports.$SPACE) {
            if (++index >= length) {
                peek = exports.$EOF;
                break;
            }
            else {
                peek = lang_1.StringWrapper.charCodeAt(input, index);
            }
        }
        this.peek = peek;
        this.index = index;
        if (index >= length) {
            return null;
        }
        // Handle identifiers and numbers.
        if (isIdentifierStart(peek))
            return this.scanIdentifier();
        if (isDigit(peek))
            return this.scanNumber(index);
        var start = index;
        switch (peek) {
            case exports.$PERIOD:
                this.advance();
                return isDigit(this.peek) ? this.scanNumber(start) : newCharacterToken(start, exports.$PERIOD);
            case exports.$LPAREN:
            case exports.$RPAREN:
            case exports.$LBRACE:
            case exports.$RBRACE:
            case exports.$LBRACKET:
            case exports.$RBRACKET:
            case exports.$COMMA:
            case exports.$COLON:
            case exports.$SEMICOLON:
                return this.scanCharacter(start, peek);
            case exports.$SQ:
            case exports.$DQ:
                return this.scanString();
            case exports.$HASH:
            case exports.$PLUS:
            case exports.$MINUS:
            case exports.$STAR:
            case exports.$SLASH:
            case exports.$PERCENT:
            case $CARET:
                return this.scanOperator(start, lang_1.StringWrapper.fromCharCode(peek));
            case exports.$QUESTION:
                return this.scanComplexOperator(start, '?', exports.$PERIOD, '.');
            case exports.$LT:
            case exports.$GT:
                return this.scanComplexOperator(start, lang_1.StringWrapper.fromCharCode(peek), exports.$EQ, '=');
            case exports.$BANG:
            case exports.$EQ:
                return this.scanComplexOperator(start, lang_1.StringWrapper.fromCharCode(peek), exports.$EQ, '=', exports.$EQ, '=');
            case exports.$AMPERSAND:
                return this.scanComplexOperator(start, '&', exports.$AMPERSAND, '&');
            case exports.$BAR:
                return this.scanComplexOperator(start, '|', exports.$BAR, '|');
            case $NBSP:
                while (isWhitespace(this.peek))
                    this.advance();
                return this.scanToken();
        }
        this.error("Unexpected character [" + lang_1.StringWrapper.fromCharCode(peek) + "]", 0);
        return null;
    };
    _Scanner.prototype.scanCharacter = function (start, code) {
        this.advance();
        return newCharacterToken(start, code);
    };
    _Scanner.prototype.scanOperator = function (start, str) {
        this.advance();
        return newOperatorToken(start, str);
    };
    /**
     * Tokenize a 2/3 char long operator
     *
     * @param start start index in the expression
     * @param one first symbol (always part of the operator)
     * @param twoCode code point for the second symbol
     * @param two second symbol (part of the operator when the second code point matches)
     * @param threeCode code point for the third symbol
     * @param three third symbol (part of the operator when provided and matches source expression)
     * @returns {Token}
     */
    _Scanner.prototype.scanComplexOperator = function (start, one, twoCode, two, threeCode, three) {
        this.advance();
        var str = one;
        if (this.peek == twoCode) {
            this.advance();
            str += two;
        }
        if (lang_1.isPresent(threeCode) && this.peek == threeCode) {
            this.advance();
            str += three;
        }
        return newOperatorToken(start, str);
    };
    _Scanner.prototype.scanIdentifier = function () {
        var start = this.index;
        this.advance();
        while (isIdentifierPart(this.peek))
            this.advance();
        var str = this.input.substring(start, this.index);
        if (collection_1.SetWrapper.has(KEYWORDS, str)) {
            return newKeywordToken(start, str);
        }
        else {
            return newIdentifierToken(start, str);
        }
    };
    _Scanner.prototype.scanNumber = function (start) {
        var simple = (this.index === start);
        this.advance(); // Skip initial digit.
        while (true) {
            if (isDigit(this.peek)) {
            }
            else if (this.peek == exports.$PERIOD) {
                simple = false;
            }
            else if (isExponentStart(this.peek)) {
                this.advance();
                if (isExponentSign(this.peek))
                    this.advance();
                if (!isDigit(this.peek))
                    this.error('Invalid exponent', -1);
                simple = false;
            }
            else {
                break;
            }
            this.advance();
        }
        var str = this.input.substring(start, this.index);
        // TODO
        var value = simple ? lang_1.NumberWrapper.parseIntAutoRadix(str) : lang_1.NumberWrapper.parseFloat(str);
        return newNumberToken(start, value);
    };
    _Scanner.prototype.scanString = function () {
        var start = this.index;
        var quote = this.peek;
        this.advance(); // Skip initial quote.
        var buffer;
        var marker = this.index;
        var input = this.input;
        while (this.peek != quote) {
            if (this.peek == exports.$BACKSLASH) {
                if (buffer == null)
                    buffer = new lang_1.StringJoiner();
                buffer.add(input.substring(marker, this.index));
                this.advance();
                var unescapedCode;
                if (this.peek == $u) {
                    // 4 character hex code for unicode character.
                    var hex = input.substring(this.index + 1, this.index + 5);
                    try {
                        unescapedCode = lang_1.NumberWrapper.parseInt(hex, 16);
                    }
                    catch (e) {
                        this.error("Invalid unicode escape [\\u" + hex + "]", 0);
                    }
                    for (var i = 0; i < 5; i++) {
                        this.advance();
                    }
                }
                else {
                    unescapedCode = unescape(this.peek);
                    this.advance();
                }
                buffer.add(lang_1.StringWrapper.fromCharCode(unescapedCode));
                marker = this.index;
            }
            else if (this.peek == exports.$EOF) {
                this.error('Unterminated quote', 0);
            }
            else {
                this.advance();
            }
        }
        var last = input.substring(marker, this.index);
        this.advance(); // Skip terminating quote.
        // Compute the unescaped string value.
        var unescaped = last;
        if (buffer != null) {
            buffer.add(last);
            unescaped = buffer.toString();
        }
        return newStringToken(start, unescaped);
    };
    _Scanner.prototype.error = function (message, offset) {
        var position = this.index + offset;
        throw new ScannerError("Lexer Error: " + message + " at column " + position + " in expression [" + this.input + "]");
    };
    return _Scanner;
}());
function isWhitespace(code) {
    return (code >= exports.$TAB && code <= exports.$SPACE) || (code == $NBSP);
}
function isIdentifierStart(code) {
    return ($a <= code && code <= $z) || ($A <= code && code <= $Z) || (code == $_) || (code == exports.$$);
}
function isIdentifier(input) {
    if (input.length == 0)
        return false;
    var scanner = new _Scanner(input);
    if (!isIdentifierStart(scanner.peek))
        return false;
    scanner.advance();
    while (scanner.peek !== exports.$EOF) {
        if (!isIdentifierPart(scanner.peek))
            return false;
        scanner.advance();
    }
    return true;
}
exports.isIdentifier = isIdentifier;
function isIdentifierPart(code) {
    return ($a <= code && code <= $z) || ($A <= code && code <= $Z) || ($0 <= code && code <= $9) ||
        (code == $_) || (code == exports.$$);
}
function isDigit(code) {
    return $0 <= code && code <= $9;
}
function isExponentStart(code) {
    return code == $e || code == $E;
}
function isExponentSign(code) {
    return code == exports.$MINUS || code == exports.$PLUS;
}
function isQuote(code) {
    return code === exports.$SQ || code === exports.$DQ || code === exports.$BT;
}
exports.isQuote = isQuote;
function unescape(code) {
    switch (code) {
        case $n:
            return exports.$LF;
        case $f:
            return exports.$FF;
        case $r:
            return exports.$CR;
        case $t:
            return exports.$TAB;
        case $v:
            return exports.$VTAB;
        default:
            return code;
    }
}
var OPERATORS = collection_1.SetWrapper.createFromList([
    '+',
    '-',
    '*',
    '/',
    '%',
    '^',
    '=',
    '==',
    '!=',
    '===',
    '!==',
    '<',
    '>',
    '<=',
    '>=',
    '&&',
    '||',
    '&',
    '|',
    '!',
    '?',
    '#',
    '?.'
]);
var KEYWORDS = collection_1.SetWrapper.createFromList(['var', 'null', 'undefined', 'true', 'false', 'if', 'else']);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV4ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLThERFlwejRqLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL3BhcnNlci9sZXhlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSwyQkFBeUIsaUNBQWlDLENBQUMsQ0FBQTtBQUMzRCwyQkFBc0MsZ0NBQWdDLENBQUMsQ0FBQTtBQUN2RSxxQkFNTywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xDLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRTdELFdBQVksU0FBUztJQUNuQixtREFBUyxDQUFBO0lBQ1QscURBQVUsQ0FBQTtJQUNWLCtDQUFPLENBQUE7SUFDUCw2Q0FBTSxDQUFBO0lBQ04saURBQVEsQ0FBQTtJQUNSLDZDQUFNLENBQUE7QUFDUixDQUFDLEVBUFcsaUJBQVMsS0FBVCxpQkFBUyxRQU9wQjtBQVBELElBQVksU0FBUyxHQUFULGlCQU9YLENBQUE7QUFHRDtJQUFBO0lBV0EsQ0FBQztJQVZDLHdCQUFRLEdBQVIsVUFBUyxJQUFZO1FBQ25CLElBQUksT0FBTyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNoQixJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDaEMsT0FBTyxLQUFLLElBQUksSUFBSSxFQUFFLENBQUM7WUFDckIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNuQixLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQzlCLENBQUM7UUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFYSDtRQUFDLHVCQUFVLEVBQUU7O2FBQUE7SUFZYixZQUFDO0FBQUQsQ0FBQyxBQVhELElBV0M7QUFYWSxh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QUc7SUFDSCxJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osR0FBRztJQUNILEdBQUc7SUFDSCxHQUFHO0lBQ0gsR0FBRztJQUNILEdBQUc7SUFDSCxJQUFJO0NBQ0wsQ0FBQyxDQUFDO0FBR0gsSUFBSSxRQUFRLEdBQ1IsdUJBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9kZWNvcmF0b3JzJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIFNldFdyYXBwZXJ9IGZyb20gXCJhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb25cIjtcbmltcG9ydCB7XG4gIE51bWJlcldyYXBwZXIsXG4gIFN0cmluZ0pvaW5lcixcbiAgU3RyaW5nV3JhcHBlcixcbiAgaXNQcmVzZW50LFxuICBDT05TVF9FWFBSXG59IGZyb20gXCJhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmdcIjtcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcblxuZXhwb3J0IGVudW0gVG9rZW5UeXBlIHtcbiAgQ2hhcmFjdGVyLFxuICBJZGVudGlmaWVyLFxuICBLZXl3b3JkLFxuICBTdHJpbmcsXG4gIE9wZXJhdG9yLFxuICBOdW1iZXJcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIExleGVyIHtcbiAgdG9rZW5pemUodGV4dDogc3RyaW5nKTogYW55W10ge1xuICAgIHZhciBzY2FubmVyID0gbmV3IF9TY2FubmVyKHRleHQpO1xuICAgIHZhciB0b2tlbnMgPSBbXTtcbiAgICB2YXIgdG9rZW4gPSBzY2FubmVyLnNjYW5Ub2tlbigpO1xuICAgIHdoaWxlICh0b2tlbiAhPSBudWxsKSB7XG4gICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICB0b2tlbiA9IHNjYW5uZXIuc2NhblRva2VuKCk7XG4gICAgfVxuICAgIHJldHVybiB0b2tlbnM7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRva2VuIHtcbiAgY29uc3RydWN0b3IocHVibGljIGluZGV4OiBudW1iZXIsIHB1YmxpYyB0eXBlOiBUb2tlblR5cGUsIHB1YmxpYyBudW1WYWx1ZTogbnVtYmVyLFxuICAgICAgICAgICAgICBwdWJsaWMgc3RyVmFsdWU6IHN0cmluZykge31cblxuICBpc0NoYXJhY3Rlcihjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKHRoaXMudHlwZSA9PSBUb2tlblR5cGUuQ2hhcmFjdGVyICYmIHRoaXMubnVtVmFsdWUgPT0gY29kZSk7XG4gIH1cblxuICBpc051bWJlcigpOiBib29sZWFuIHsgcmV0dXJuICh0aGlzLnR5cGUgPT0gVG9rZW5UeXBlLk51bWJlcik7IH1cblxuICBpc1N0cmluZygpOiBib29sZWFuIHsgcmV0dXJuICh0aGlzLnR5cGUgPT0gVG9rZW5UeXBlLlN0cmluZyk7IH1cblxuICBpc09wZXJhdG9yKG9wZXJhdGVyOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKHRoaXMudHlwZSA9PSBUb2tlblR5cGUuT3BlcmF0b3IgJiYgdGhpcy5zdHJWYWx1ZSA9PSBvcGVyYXRlcik7XG4gIH1cblxuICBpc0lkZW50aWZpZXIoKTogYm9vbGVhbiB7IHJldHVybiAodGhpcy50eXBlID09IFRva2VuVHlwZS5JZGVudGlmaWVyKTsgfVxuXG4gIGlzS2V5d29yZCgpOiBib29sZWFuIHsgcmV0dXJuICh0aGlzLnR5cGUgPT0gVG9rZW5UeXBlLktleXdvcmQpOyB9XG5cbiAgaXNLZXl3b3JkVmFyKCk6IGJvb2xlYW4geyByZXR1cm4gKHRoaXMudHlwZSA9PSBUb2tlblR5cGUuS2V5d29yZCAmJiB0aGlzLnN0clZhbHVlID09IFwidmFyXCIpOyB9XG5cbiAgaXNLZXl3b3JkTnVsbCgpOiBib29sZWFuIHsgcmV0dXJuICh0aGlzLnR5cGUgPT0gVG9rZW5UeXBlLktleXdvcmQgJiYgdGhpcy5zdHJWYWx1ZSA9PSBcIm51bGxcIik7IH1cblxuICBpc0tleXdvcmRVbmRlZmluZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICh0aGlzLnR5cGUgPT0gVG9rZW5UeXBlLktleXdvcmQgJiYgdGhpcy5zdHJWYWx1ZSA9PSBcInVuZGVmaW5lZFwiKTtcbiAgfVxuXG4gIGlzS2V5d29yZFRydWUoKTogYm9vbGVhbiB7IHJldHVybiAodGhpcy50eXBlID09IFRva2VuVHlwZS5LZXl3b3JkICYmIHRoaXMuc3RyVmFsdWUgPT0gXCJ0cnVlXCIpOyB9XG5cbiAgaXNLZXl3b3JkRmFsc2UoKTogYm9vbGVhbiB7IHJldHVybiAodGhpcy50eXBlID09IFRva2VuVHlwZS5LZXl3b3JkICYmIHRoaXMuc3RyVmFsdWUgPT0gXCJmYWxzZVwiKTsgfVxuXG4gIHRvTnVtYmVyKCk6IG51bWJlciB7XG4gICAgLy8gLTEgaW5zdGVhZCBvZiBOVUxMIG9rP1xuICAgIHJldHVybiAodGhpcy50eXBlID09IFRva2VuVHlwZS5OdW1iZXIpID8gdGhpcy5udW1WYWx1ZSA6IC0xO1xuICB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgY2FzZSBUb2tlblR5cGUuQ2hhcmFjdGVyOlxuICAgICAgY2FzZSBUb2tlblR5cGUuSWRlbnRpZmllcjpcbiAgICAgIGNhc2UgVG9rZW5UeXBlLktleXdvcmQ6XG4gICAgICBjYXNlIFRva2VuVHlwZS5PcGVyYXRvcjpcbiAgICAgIGNhc2UgVG9rZW5UeXBlLlN0cmluZzpcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RyVmFsdWU7XG4gICAgICBjYXNlIFRva2VuVHlwZS5OdW1iZXI6XG4gICAgICAgIHJldHVybiB0aGlzLm51bVZhbHVlLnRvU3RyaW5nKCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbmV3Q2hhcmFjdGVyVG9rZW4oaW5kZXg6IG51bWJlciwgY29kZTogbnVtYmVyKTogVG9rZW4ge1xuICByZXR1cm4gbmV3IFRva2VuKGluZGV4LCBUb2tlblR5cGUuQ2hhcmFjdGVyLCBjb2RlLCBTdHJpbmdXcmFwcGVyLmZyb21DaGFyQ29kZShjb2RlKSk7XG59XG5cbmZ1bmN0aW9uIG5ld0lkZW50aWZpZXJUb2tlbihpbmRleDogbnVtYmVyLCB0ZXh0OiBzdHJpbmcpOiBUb2tlbiB7XG4gIHJldHVybiBuZXcgVG9rZW4oaW5kZXgsIFRva2VuVHlwZS5JZGVudGlmaWVyLCAwLCB0ZXh0KTtcbn1cblxuZnVuY3Rpb24gbmV3S2V5d29yZFRva2VuKGluZGV4OiBudW1iZXIsIHRleHQ6IHN0cmluZyk6IFRva2VuIHtcbiAgcmV0dXJuIG5ldyBUb2tlbihpbmRleCwgVG9rZW5UeXBlLktleXdvcmQsIDAsIHRleHQpO1xufVxuXG5mdW5jdGlvbiBuZXdPcGVyYXRvclRva2VuKGluZGV4OiBudW1iZXIsIHRleHQ6IHN0cmluZyk6IFRva2VuIHtcbiAgcmV0dXJuIG5ldyBUb2tlbihpbmRleCwgVG9rZW5UeXBlLk9wZXJhdG9yLCAwLCB0ZXh0KTtcbn1cblxuZnVuY3Rpb24gbmV3U3RyaW5nVG9rZW4oaW5kZXg6IG51bWJlciwgdGV4dDogc3RyaW5nKTogVG9rZW4ge1xuICByZXR1cm4gbmV3IFRva2VuKGluZGV4LCBUb2tlblR5cGUuU3RyaW5nLCAwLCB0ZXh0KTtcbn1cblxuZnVuY3Rpb24gbmV3TnVtYmVyVG9rZW4oaW5kZXg6IG51bWJlciwgbjogbnVtYmVyKTogVG9rZW4ge1xuICByZXR1cm4gbmV3IFRva2VuKGluZGV4LCBUb2tlblR5cGUuTnVtYmVyLCBuLCBcIlwiKTtcbn1cblxuXG5leHBvcnQgdmFyIEVPRjogVG9rZW4gPSBuZXcgVG9rZW4oLTEsIFRva2VuVHlwZS5DaGFyYWN0ZXIsIDAsIFwiXCIpO1xuXG5leHBvcnQgY29uc3QgJEVPRiA9IENPTlNUX0VYUFIoQ09OU1RfRVhQUigwKSk7XG5leHBvcnQgY29uc3QgJFRBQiA9IENPTlNUX0VYUFIoOSk7XG5leHBvcnQgY29uc3QgJExGID0gQ09OU1RfRVhQUigxMCk7XG5leHBvcnQgY29uc3QgJFZUQUIgPSBDT05TVF9FWFBSKDExKTtcbmV4cG9ydCBjb25zdCAkRkYgPSBDT05TVF9FWFBSKDEyKTtcbmV4cG9ydCBjb25zdCAkQ1IgPSBDT05TVF9FWFBSKDEzKTtcbmV4cG9ydCBjb25zdCAkU1BBQ0UgPSBDT05TVF9FWFBSKDMyKTtcbmV4cG9ydCBjb25zdCAkQkFORyA9IENPTlNUX0VYUFIoMzMpO1xuZXhwb3J0IGNvbnN0ICREUSA9IENPTlNUX0VYUFIoMzQpO1xuZXhwb3J0IGNvbnN0ICRIQVNIID0gQ09OU1RfRVhQUigzNSk7XG5leHBvcnQgY29uc3QgJCQgPSBDT05TVF9FWFBSKDM2KTtcbmV4cG9ydCBjb25zdCAkUEVSQ0VOVCA9IENPTlNUX0VYUFIoMzcpO1xuZXhwb3J0IGNvbnN0ICRBTVBFUlNBTkQgPSBDT05TVF9FWFBSKDM4KTtcbmV4cG9ydCBjb25zdCAkU1EgPSBDT05TVF9FWFBSKDM5KTtcbmV4cG9ydCBjb25zdCAkTFBBUkVOID0gQ09OU1RfRVhQUig0MCk7XG5leHBvcnQgY29uc3QgJFJQQVJFTiA9IENPTlNUX0VYUFIoNDEpO1xuZXhwb3J0IGNvbnN0ICRTVEFSID0gQ09OU1RfRVhQUig0Mik7XG5leHBvcnQgY29uc3QgJFBMVVMgPSBDT05TVF9FWFBSKDQzKTtcbmV4cG9ydCBjb25zdCAkQ09NTUEgPSBDT05TVF9FWFBSKDQ0KTtcbmV4cG9ydCBjb25zdCAkTUlOVVMgPSBDT05TVF9FWFBSKDQ1KTtcbmV4cG9ydCBjb25zdCAkUEVSSU9EID0gQ09OU1RfRVhQUig0Nik7XG5leHBvcnQgY29uc3QgJFNMQVNIID0gQ09OU1RfRVhQUig0Nyk7XG5leHBvcnQgY29uc3QgJENPTE9OID0gQ09OU1RfRVhQUig1OCk7XG5leHBvcnQgY29uc3QgJFNFTUlDT0xPTiA9IENPTlNUX0VYUFIoNTkpO1xuZXhwb3J0IGNvbnN0ICRMVCA9IENPTlNUX0VYUFIoNjApO1xuZXhwb3J0IGNvbnN0ICRFUSA9IENPTlNUX0VYUFIoNjEpO1xuZXhwb3J0IGNvbnN0ICRHVCA9IENPTlNUX0VYUFIoNjIpO1xuZXhwb3J0IGNvbnN0ICRRVUVTVElPTiA9IENPTlNUX0VYUFIoNjMpO1xuXG5jb25zdCAkMCA9IENPTlNUX0VYUFIoNDgpO1xuY29uc3QgJDkgPSBDT05TVF9FWFBSKDU3KTtcblxuY29uc3QgJEEgPSBDT05TVF9FWFBSKDY1KSwgJEUgPSBDT05TVF9FWFBSKDY5KSwgJFogPSBDT05TVF9FWFBSKDkwKTtcblxuZXhwb3J0IGNvbnN0ICRMQlJBQ0tFVCA9IENPTlNUX0VYUFIoOTEpO1xuZXhwb3J0IGNvbnN0ICRCQUNLU0xBU0ggPSBDT05TVF9FWFBSKDkyKTtcbmV4cG9ydCBjb25zdCAkUkJSQUNLRVQgPSBDT05TVF9FWFBSKDkzKTtcbmNvbnN0ICRDQVJFVCA9IENPTlNUX0VYUFIoOTQpO1xuY29uc3QgJF8gPSBDT05TVF9FWFBSKDk1KTtcbmV4cG9ydCBjb25zdCAkQlQgPSBDT05TVF9FWFBSKDk2KTtcbmNvbnN0ICRhID0gQ09OU1RfRVhQUig5NyksICRlID0gQ09OU1RfRVhQUigxMDEpLCAkZiA9IENPTlNUX0VYUFIoMTAyKSwgJG4gPSBDT05TVF9FWFBSKDExMCksXG4gICAgICAkciA9IENPTlNUX0VYUFIoMTE0KSwgJHQgPSBDT05TVF9FWFBSKDExNiksICR1ID0gQ09OU1RfRVhQUigxMTcpLCAkdiA9IENPTlNUX0VYUFIoMTE4KSxcbiAgICAgICR6ID0gQ09OU1RfRVhQUigxMjIpO1xuXG5leHBvcnQgY29uc3QgJExCUkFDRSA9IENPTlNUX0VYUFIoMTIzKTtcbmV4cG9ydCBjb25zdCAkQkFSID0gQ09OU1RfRVhQUigxMjQpO1xuZXhwb3J0IGNvbnN0ICRSQlJBQ0UgPSBDT05TVF9FWFBSKDEyNSk7XG5jb25zdCAkTkJTUCA9IENPTlNUX0VYUFIoMTYwKTtcblxuZXhwb3J0IGNsYXNzIFNjYW5uZXJFcnJvciBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbWVzc2FnZSkgeyBzdXBlcigpOyB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMubWVzc2FnZTsgfVxufVxuXG5jbGFzcyBfU2Nhbm5lciB7XG4gIGxlbmd0aDogbnVtYmVyO1xuICBwZWVrOiBudW1iZXIgPSAwO1xuICBpbmRleDogbnVtYmVyID0gLTE7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGlucHV0OiBzdHJpbmcpIHtcbiAgICB0aGlzLmxlbmd0aCA9IGlucHV0Lmxlbmd0aDtcbiAgICB0aGlzLmFkdmFuY2UoKTtcbiAgfVxuXG4gIGFkdmFuY2UoKSB7XG4gICAgdGhpcy5wZWVrID1cbiAgICAgICAgKyt0aGlzLmluZGV4ID49IHRoaXMubGVuZ3RoID8gJEVPRiA6IFN0cmluZ1dyYXBwZXIuY2hhckNvZGVBdCh0aGlzLmlucHV0LCB0aGlzLmluZGV4KTtcbiAgfVxuXG4gIHNjYW5Ub2tlbigpOiBUb2tlbiB7XG4gICAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dCwgbGVuZ3RoID0gdGhpcy5sZW5ndGgsIHBlZWsgPSB0aGlzLnBlZWssIGluZGV4ID0gdGhpcy5pbmRleDtcblxuICAgIC8vIFNraXAgd2hpdGVzcGFjZS5cbiAgICB3aGlsZSAocGVlayA8PSAkU1BBQ0UpIHtcbiAgICAgIGlmICgrK2luZGV4ID49IGxlbmd0aCkge1xuICAgICAgICBwZWVrID0gJEVPRjtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwZWVrID0gU3RyaW5nV3JhcHBlci5jaGFyQ29kZUF0KGlucHV0LCBpbmRleCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5wZWVrID0gcGVlaztcbiAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG5cbiAgICBpZiAoaW5kZXggPj0gbGVuZ3RoKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgaWRlbnRpZmllcnMgYW5kIG51bWJlcnMuXG4gICAgaWYgKGlzSWRlbnRpZmllclN0YXJ0KHBlZWspKSByZXR1cm4gdGhpcy5zY2FuSWRlbnRpZmllcigpO1xuICAgIGlmIChpc0RpZ2l0KHBlZWspKSByZXR1cm4gdGhpcy5zY2FuTnVtYmVyKGluZGV4KTtcblxuICAgIHZhciBzdGFydDogbnVtYmVyID0gaW5kZXg7XG4gICAgc3dpdGNoIChwZWVrKSB7XG4gICAgICBjYXNlICRQRVJJT0Q6XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICByZXR1cm4gaXNEaWdpdCh0aGlzLnBlZWspID8gdGhpcy5zY2FuTnVtYmVyKHN0YXJ0KSA6IG5ld0NoYXJhY3RlclRva2VuKHN0YXJ0LCAkUEVSSU9EKTtcbiAgICAgIGNhc2UgJExQQVJFTjpcbiAgICAgIGNhc2UgJFJQQVJFTjpcbiAgICAgIGNhc2UgJExCUkFDRTpcbiAgICAgIGNhc2UgJFJCUkFDRTpcbiAgICAgIGNhc2UgJExCUkFDS0VUOlxuICAgICAgY2FzZSAkUkJSQUNLRVQ6XG4gICAgICBjYXNlICRDT01NQTpcbiAgICAgIGNhc2UgJENPTE9OOlxuICAgICAgY2FzZSAkU0VNSUNPTE9OOlxuICAgICAgICByZXR1cm4gdGhpcy5zY2FuQ2hhcmFjdGVyKHN0YXJ0LCBwZWVrKTtcbiAgICAgIGNhc2UgJFNROlxuICAgICAgY2FzZSAkRFE6XG4gICAgICAgIHJldHVybiB0aGlzLnNjYW5TdHJpbmcoKTtcbiAgICAgIGNhc2UgJEhBU0g6XG4gICAgICBjYXNlICRQTFVTOlxuICAgICAgY2FzZSAkTUlOVVM6XG4gICAgICBjYXNlICRTVEFSOlxuICAgICAgY2FzZSAkU0xBU0g6XG4gICAgICBjYXNlICRQRVJDRU5UOlxuICAgICAgY2FzZSAkQ0FSRVQ6XG4gICAgICAgIHJldHVybiB0aGlzLnNjYW5PcGVyYXRvcihzdGFydCwgU3RyaW5nV3JhcHBlci5mcm9tQ2hhckNvZGUocGVlaykpO1xuICAgICAgY2FzZSAkUVVFU1RJT046XG4gICAgICAgIHJldHVybiB0aGlzLnNjYW5Db21wbGV4T3BlcmF0b3Ioc3RhcnQsICc/JywgJFBFUklPRCwgJy4nKTtcbiAgICAgIGNhc2UgJExUOlxuICAgICAgY2FzZSAkR1Q6XG4gICAgICAgIHJldHVybiB0aGlzLnNjYW5Db21wbGV4T3BlcmF0b3Ioc3RhcnQsIFN0cmluZ1dyYXBwZXIuZnJvbUNoYXJDb2RlKHBlZWspLCAkRVEsICc9Jyk7XG4gICAgICBjYXNlICRCQU5HOlxuICAgICAgY2FzZSAkRVE6XG4gICAgICAgIHJldHVybiB0aGlzLnNjYW5Db21wbGV4T3BlcmF0b3Ioc3RhcnQsIFN0cmluZ1dyYXBwZXIuZnJvbUNoYXJDb2RlKHBlZWspLCAkRVEsICc9JywgJEVRLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc9Jyk7XG4gICAgICBjYXNlICRBTVBFUlNBTkQ6XG4gICAgICAgIHJldHVybiB0aGlzLnNjYW5Db21wbGV4T3BlcmF0b3Ioc3RhcnQsICcmJywgJEFNUEVSU0FORCwgJyYnKTtcbiAgICAgIGNhc2UgJEJBUjpcbiAgICAgICAgcmV0dXJuIHRoaXMuc2NhbkNvbXBsZXhPcGVyYXRvcihzdGFydCwgJ3wnLCAkQkFSLCAnfCcpO1xuICAgICAgY2FzZSAkTkJTUDpcbiAgICAgICAgd2hpbGUgKGlzV2hpdGVzcGFjZSh0aGlzLnBlZWspKSB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2NhblRva2VuKCk7XG4gICAgfVxuXG4gICAgdGhpcy5lcnJvcihgVW5leHBlY3RlZCBjaGFyYWN0ZXIgWyR7U3RyaW5nV3JhcHBlci5mcm9tQ2hhckNvZGUocGVlayl9XWAsIDApO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgc2NhbkNoYXJhY3RlcihzdGFydDogbnVtYmVyLCBjb2RlOiBudW1iZXIpOiBUb2tlbiB7XG4gICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgcmV0dXJuIG5ld0NoYXJhY3RlclRva2VuKHN0YXJ0LCBjb2RlKTtcbiAgfVxuXG5cbiAgc2Nhbk9wZXJhdG9yKHN0YXJ0OiBudW1iZXIsIHN0cjogc3RyaW5nKTogVG9rZW4ge1xuICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIHJldHVybiBuZXdPcGVyYXRvclRva2VuKHN0YXJ0LCBzdHIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRva2VuaXplIGEgMi8zIGNoYXIgbG9uZyBvcGVyYXRvclxuICAgKlxuICAgKiBAcGFyYW0gc3RhcnQgc3RhcnQgaW5kZXggaW4gdGhlIGV4cHJlc3Npb25cbiAgICogQHBhcmFtIG9uZSBmaXJzdCBzeW1ib2wgKGFsd2F5cyBwYXJ0IG9mIHRoZSBvcGVyYXRvcilcbiAgICogQHBhcmFtIHR3b0NvZGUgY29kZSBwb2ludCBmb3IgdGhlIHNlY29uZCBzeW1ib2xcbiAgICogQHBhcmFtIHR3byBzZWNvbmQgc3ltYm9sIChwYXJ0IG9mIHRoZSBvcGVyYXRvciB3aGVuIHRoZSBzZWNvbmQgY29kZSBwb2ludCBtYXRjaGVzKVxuICAgKiBAcGFyYW0gdGhyZWVDb2RlIGNvZGUgcG9pbnQgZm9yIHRoZSB0aGlyZCBzeW1ib2xcbiAgICogQHBhcmFtIHRocmVlIHRoaXJkIHN5bWJvbCAocGFydCBvZiB0aGUgb3BlcmF0b3Igd2hlbiBwcm92aWRlZCBhbmQgbWF0Y2hlcyBzb3VyY2UgZXhwcmVzc2lvbilcbiAgICogQHJldHVybnMge1Rva2VufVxuICAgKi9cbiAgc2NhbkNvbXBsZXhPcGVyYXRvcihzdGFydDogbnVtYmVyLCBvbmU6IHN0cmluZywgdHdvQ29kZTogbnVtYmVyLCB0d286IHN0cmluZywgdGhyZWVDb2RlPzogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgIHRocmVlPzogc3RyaW5nKTogVG9rZW4ge1xuICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIHZhciBzdHI6IHN0cmluZyA9IG9uZTtcbiAgICBpZiAodGhpcy5wZWVrID09IHR3b0NvZGUpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgc3RyICs9IHR3bztcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aHJlZUNvZGUpICYmIHRoaXMucGVlayA9PSB0aHJlZUNvZGUpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgc3RyICs9IHRocmVlO1xuICAgIH1cbiAgICByZXR1cm4gbmV3T3BlcmF0b3JUb2tlbihzdGFydCwgc3RyKTtcbiAgfVxuXG4gIHNjYW5JZGVudGlmaWVyKCk6IFRva2VuIHtcbiAgICB2YXIgc3RhcnQ6IG51bWJlciA9IHRoaXMuaW5kZXg7XG4gICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgd2hpbGUgKGlzSWRlbnRpZmllclBhcnQodGhpcy5wZWVrKSkgdGhpcy5hZHZhbmNlKCk7XG4gICAgdmFyIHN0cjogc3RyaW5nID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcoc3RhcnQsIHRoaXMuaW5kZXgpO1xuICAgIGlmIChTZXRXcmFwcGVyLmhhcyhLRVlXT1JEUywgc3RyKSkge1xuICAgICAgcmV0dXJuIG5ld0tleXdvcmRUb2tlbihzdGFydCwgc3RyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ld0lkZW50aWZpZXJUb2tlbihzdGFydCwgc3RyKTtcbiAgICB9XG4gIH1cblxuICBzY2FuTnVtYmVyKHN0YXJ0OiBudW1iZXIpOiBUb2tlbiB7XG4gICAgdmFyIHNpbXBsZTogYm9vbGVhbiA9ICh0aGlzLmluZGV4ID09PSBzdGFydCk7XG4gICAgdGhpcy5hZHZhbmNlKCk7ICAvLyBTa2lwIGluaXRpYWwgZGlnaXQuXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmIChpc0RpZ2l0KHRoaXMucGVlaykpIHtcbiAgICAgICAgLy8gRG8gbm90aGluZy5cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5wZWVrID09ICRQRVJJT0QpIHtcbiAgICAgICAgc2ltcGxlID0gZmFsc2U7XG4gICAgICB9IGVsc2UgaWYgKGlzRXhwb25lbnRTdGFydCh0aGlzLnBlZWspKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICBpZiAoaXNFeHBvbmVudFNpZ24odGhpcy5wZWVrKSkgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIGlmICghaXNEaWdpdCh0aGlzLnBlZWspKSB0aGlzLmVycm9yKCdJbnZhbGlkIGV4cG9uZW50JywgLTEpO1xuICAgICAgICBzaW1wbGUgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHZhciBzdHI6IHN0cmluZyA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0LCB0aGlzLmluZGV4KTtcbiAgICAvLyBUT0RPXG4gICAgdmFyIHZhbHVlOiBudW1iZXIgPVxuICAgICAgICBzaW1wbGUgPyBOdW1iZXJXcmFwcGVyLnBhcnNlSW50QXV0b1JhZGl4KHN0cikgOiBOdW1iZXJXcmFwcGVyLnBhcnNlRmxvYXQoc3RyKTtcbiAgICByZXR1cm4gbmV3TnVtYmVyVG9rZW4oc3RhcnQsIHZhbHVlKTtcbiAgfVxuXG4gIHNjYW5TdHJpbmcoKTogVG9rZW4ge1xuICAgIHZhciBzdGFydDogbnVtYmVyID0gdGhpcy5pbmRleDtcbiAgICB2YXIgcXVvdGU6IG51bWJlciA9IHRoaXMucGVlaztcbiAgICB0aGlzLmFkdmFuY2UoKTsgIC8vIFNraXAgaW5pdGlhbCBxdW90ZS5cblxuICAgIHZhciBidWZmZXI6IFN0cmluZ0pvaW5lcjtcbiAgICB2YXIgbWFya2VyOiBudW1iZXIgPSB0aGlzLmluZGV4O1xuICAgIHZhciBpbnB1dDogc3RyaW5nID0gdGhpcy5pbnB1dDtcblxuICAgIHdoaWxlICh0aGlzLnBlZWsgIT0gcXVvdGUpIHtcbiAgICAgIGlmICh0aGlzLnBlZWsgPT0gJEJBQ0tTTEFTSCkge1xuICAgICAgICBpZiAoYnVmZmVyID09IG51bGwpIGJ1ZmZlciA9IG5ldyBTdHJpbmdKb2luZXIoKTtcbiAgICAgICAgYnVmZmVyLmFkZChpbnB1dC5zdWJzdHJpbmcobWFya2VyLCB0aGlzLmluZGV4KSk7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICB2YXIgdW5lc2NhcGVkQ29kZTogbnVtYmVyO1xuICAgICAgICBpZiAodGhpcy5wZWVrID09ICR1KSB7XG4gICAgICAgICAgLy8gNCBjaGFyYWN0ZXIgaGV4IGNvZGUgZm9yIHVuaWNvZGUgY2hhcmFjdGVyLlxuICAgICAgICAgIHZhciBoZXg6IHN0cmluZyA9IGlucHV0LnN1YnN0cmluZyh0aGlzLmluZGV4ICsgMSwgdGhpcy5pbmRleCArIDUpO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICB1bmVzY2FwZWRDb2RlID0gTnVtYmVyV3JhcHBlci5wYXJzZUludChoZXgsIDE2KTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9yKGBJbnZhbGlkIHVuaWNvZGUgZXNjYXBlIFtcXFxcdSR7aGV4fV1gLCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZm9yICh2YXIgaTogbnVtYmVyID0gMDsgaSA8IDU7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHVuZXNjYXBlZENvZGUgPSB1bmVzY2FwZSh0aGlzLnBlZWspO1xuICAgICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICB9XG4gICAgICAgIGJ1ZmZlci5hZGQoU3RyaW5nV3JhcHBlci5mcm9tQ2hhckNvZGUodW5lc2NhcGVkQ29kZSkpO1xuICAgICAgICBtYXJrZXIgPSB0aGlzLmluZGV4O1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnBlZWsgPT0gJEVPRikge1xuICAgICAgICB0aGlzLmVycm9yKCdVbnRlcm1pbmF0ZWQgcXVvdGUnLCAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBsYXN0OiBzdHJpbmcgPSBpbnB1dC5zdWJzdHJpbmcobWFya2VyLCB0aGlzLmluZGV4KTtcbiAgICB0aGlzLmFkdmFuY2UoKTsgIC8vIFNraXAgdGVybWluYXRpbmcgcXVvdGUuXG5cbiAgICAvLyBDb21wdXRlIHRoZSB1bmVzY2FwZWQgc3RyaW5nIHZhbHVlLlxuICAgIHZhciB1bmVzY2FwZWQ6IHN0cmluZyA9IGxhc3Q7XG4gICAgaWYgKGJ1ZmZlciAhPSBudWxsKSB7XG4gICAgICBidWZmZXIuYWRkKGxhc3QpO1xuICAgICAgdW5lc2NhcGVkID0gYnVmZmVyLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXdTdHJpbmdUb2tlbihzdGFydCwgdW5lc2NhcGVkKTtcbiAgfVxuXG4gIGVycm9yKG1lc3NhZ2U6IHN0cmluZywgb2Zmc2V0OiBudW1iZXIpIHtcbiAgICB2YXIgcG9zaXRpb246IG51bWJlciA9IHRoaXMuaW5kZXggKyBvZmZzZXQ7XG4gICAgdGhyb3cgbmV3IFNjYW5uZXJFcnJvcihcbiAgICAgICAgYExleGVyIEVycm9yOiAke21lc3NhZ2V9IGF0IGNvbHVtbiAke3Bvc2l0aW9ufSBpbiBleHByZXNzaW9uIFske3RoaXMuaW5wdXR9XWApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzV2hpdGVzcGFjZShjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIChjb2RlID49ICRUQUIgJiYgY29kZSA8PSAkU1BBQ0UpIHx8IChjb2RlID09ICROQlNQKTtcbn1cblxuZnVuY3Rpb24gaXNJZGVudGlmaWVyU3RhcnQoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiAoJGEgPD0gY29kZSAmJiBjb2RlIDw9ICR6KSB8fCAoJEEgPD0gY29kZSAmJiBjb2RlIDw9ICRaKSB8fCAoY29kZSA9PSAkXykgfHwgKGNvZGUgPT0gJCQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNJZGVudGlmaWVyKGlucHV0OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKGlucHV0Lmxlbmd0aCA9PSAwKSByZXR1cm4gZmFsc2U7XG4gIHZhciBzY2FubmVyID0gbmV3IF9TY2FubmVyKGlucHV0KTtcbiAgaWYgKCFpc0lkZW50aWZpZXJTdGFydChzY2FubmVyLnBlZWspKSByZXR1cm4gZmFsc2U7XG4gIHNjYW5uZXIuYWR2YW5jZSgpO1xuICB3aGlsZSAoc2Nhbm5lci5wZWVrICE9PSAkRU9GKSB7XG4gICAgaWYgKCFpc0lkZW50aWZpZXJQYXJ0KHNjYW5uZXIucGVlaykpIHJldHVybiBmYWxzZTtcbiAgICBzY2FubmVyLmFkdmFuY2UoKTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gaXNJZGVudGlmaWVyUGFydChjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuICgkYSA8PSBjb2RlICYmIGNvZGUgPD0gJHopIHx8ICgkQSA8PSBjb2RlICYmIGNvZGUgPD0gJFopIHx8ICgkMCA8PSBjb2RlICYmIGNvZGUgPD0gJDkpIHx8XG4gICAgICAgICAoY29kZSA9PSAkXykgfHwgKGNvZGUgPT0gJCQpO1xufVxuXG5mdW5jdGlvbiBpc0RpZ2l0KGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gJDAgPD0gY29kZSAmJiBjb2RlIDw9ICQ5O1xufVxuXG5mdW5jdGlvbiBpc0V4cG9uZW50U3RhcnQoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBjb2RlID09ICRlIHx8IGNvZGUgPT0gJEU7XG59XG5cbmZ1bmN0aW9uIGlzRXhwb25lbnRTaWduKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gY29kZSA9PSAkTUlOVVMgfHwgY29kZSA9PSAkUExVUztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUXVvdGUoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBjb2RlID09PSAkU1EgfHwgY29kZSA9PT0gJERRIHx8IGNvZGUgPT09ICRCVDtcbn1cblxuZnVuY3Rpb24gdW5lc2NhcGUoY29kZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgc3dpdGNoIChjb2RlKSB7XG4gICAgY2FzZSAkbjpcbiAgICAgIHJldHVybiAkTEY7XG4gICAgY2FzZSAkZjpcbiAgICAgIHJldHVybiAkRkY7XG4gICAgY2FzZSAkcjpcbiAgICAgIHJldHVybiAkQ1I7XG4gICAgY2FzZSAkdDpcbiAgICAgIHJldHVybiAkVEFCO1xuICAgIGNhc2UgJHY6XG4gICAgICByZXR1cm4gJFZUQUI7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBjb2RlO1xuICB9XG59XG5cbnZhciBPUEVSQVRPUlMgPSBTZXRXcmFwcGVyLmNyZWF0ZUZyb21MaXN0KFtcbiAgJysnLFxuICAnLScsXG4gICcqJyxcbiAgJy8nLFxuICAnJScsXG4gICdeJyxcbiAgJz0nLFxuICAnPT0nLFxuICAnIT0nLFxuICAnPT09JyxcbiAgJyE9PScsXG4gICc8JyxcbiAgJz4nLFxuICAnPD0nLFxuICAnPj0nLFxuICAnJiYnLFxuICAnfHwnLFxuICAnJicsXG4gICd8JyxcbiAgJyEnLFxuICAnPycsXG4gICcjJyxcbiAgJz8uJ1xuXSk7XG5cblxudmFyIEtFWVdPUkRTID1cbiAgICBTZXRXcmFwcGVyLmNyZWF0ZUZyb21MaXN0KFsndmFyJywgJ251bGwnLCAndW5kZWZpbmVkJywgJ3RydWUnLCAnZmFsc2UnLCAnaWYnLCAnZWxzZSddKTtcbiJdfQ==