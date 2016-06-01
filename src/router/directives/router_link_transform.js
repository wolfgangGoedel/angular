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
var compiler_1 = require('angular2/compiler');
var ast_1 = require('angular2/src/compiler/expression_parser/ast');
var exceptions_1 = require('angular2/src/facade/exceptions');
var core_1 = require('angular2/core');
var parser_1 = require('angular2/src/compiler/expression_parser/parser');
/**
 * e.g., './User', 'Modal' in ./User[Modal(param: value)]
 */
var FixedPart = (function () {
    function FixedPart(value) {
        this.value = value;
    }
    return FixedPart;
}());
/**
 * The square bracket
 */
var AuxiliaryStart = (function () {
    function AuxiliaryStart() {
    }
    return AuxiliaryStart;
}());
/**
 * The square bracket
 */
var AuxiliaryEnd = (function () {
    function AuxiliaryEnd() {
    }
    return AuxiliaryEnd;
}());
/**
 * e.g., param:value in ./User[Modal(param: value)]
 */
var Params = (function () {
    function Params(ast) {
        this.ast = ast;
    }
    return Params;
}());
var RouterLinkLexer = (function () {
    function RouterLinkLexer(parser, exp) {
        this.parser = parser;
        this.exp = exp;
        this.index = 0;
    }
    RouterLinkLexer.prototype.tokenize = function () {
        var tokens = [];
        while (this.index < this.exp.length) {
            tokens.push(this._parseToken());
        }
        return tokens;
    };
    RouterLinkLexer.prototype._parseToken = function () {
        var c = this.exp[this.index];
        if (c == '[') {
            this.index++;
            return new AuxiliaryStart();
        }
        else if (c == ']') {
            this.index++;
            return new AuxiliaryEnd();
        }
        else if (c == '(') {
            return this._parseParams();
        }
        else if (c == '/' && this.index !== 0) {
            this.index++;
            return this._parseFixedPart();
        }
        else {
            return this._parseFixedPart();
        }
    };
    RouterLinkLexer.prototype._parseParams = function () {
        var start = this.index;
        for (; this.index < this.exp.length; ++this.index) {
            var c = this.exp[this.index];
            if (c == ')') {
                var paramsContent = this.exp.substring(start + 1, this.index);
                this.index++;
                return new Params(this.parser.parseBinding("{" + paramsContent + "}", null).ast);
            }
        }
        throw new exceptions_1.BaseException("Cannot find ')'");
    };
    RouterLinkLexer.prototype._parseFixedPart = function () {
        var start = this.index;
        var sawNonSlash = false;
        for (; this.index < this.exp.length; ++this.index) {
            var c = this.exp[this.index];
            if (c == '(' || c == '[' || c == ']' || (c == '/' && sawNonSlash)) {
                break;
            }
            if (c != '.' && c != '/') {
                sawNonSlash = true;
            }
        }
        var fixed = this.exp.substring(start, this.index);
        if (start === this.index || !sawNonSlash || fixed.startsWith('//')) {
            throw new exceptions_1.BaseException("Invalid router link");
        }
        return new FixedPart(fixed);
    };
    return RouterLinkLexer;
}());
var RouterLinkAstGenerator = (function () {
    function RouterLinkAstGenerator(tokens) {
        this.tokens = tokens;
        this.index = 0;
    }
    RouterLinkAstGenerator.prototype.generate = function () { return this._genAuxiliary(); };
    RouterLinkAstGenerator.prototype._genAuxiliary = function () {
        var arr = [];
        for (; this.index < this.tokens.length; this.index++) {
            var r = this.tokens[this.index];
            if (r instanceof FixedPart) {
                arr.push(new ast_1.LiteralPrimitive(r.value));
            }
            else if (r instanceof Params) {
                arr.push(r.ast);
            }
            else if (r instanceof AuxiliaryEnd) {
                break;
            }
            else if (r instanceof AuxiliaryStart) {
                this.index++;
                arr.push(this._genAuxiliary());
            }
        }
        return new ast_1.LiteralArray(arr);
    };
    return RouterLinkAstGenerator;
}());
var RouterLinkAstTransformer = (function (_super) {
    __extends(RouterLinkAstTransformer, _super);
    function RouterLinkAstTransformer(parser) {
        _super.call(this);
        this.parser = parser;
    }
    RouterLinkAstTransformer.prototype.visitQuote = function (ast, context) {
        if (ast.prefix == "route") {
            return parseRouterLinkExpression(this.parser, ast.uninterpretedExpression);
        }
        else {
            return _super.prototype.visitQuote.call(this, ast, context);
        }
    };
    return RouterLinkAstTransformer;
}(ast_1.AstTransformer));
function parseRouterLinkExpression(parser, exp) {
    var tokens = new RouterLinkLexer(parser, exp.trim()).tokenize();
    return new RouterLinkAstGenerator(tokens).generate();
}
exports.parseRouterLinkExpression = parseRouterLinkExpression;
/**
 * A compiler plugin that implements the router link DSL.
 */
var RouterLinkTransform = (function () {
    function RouterLinkTransform(parser) {
        this.astTransformer = new RouterLinkAstTransformer(parser);
    }
    RouterLinkTransform.prototype.visitNgContent = function (ast, context) { return ast; };
    RouterLinkTransform.prototype.visitEmbeddedTemplate = function (ast, context) { return ast; };
    RouterLinkTransform.prototype.visitElement = function (ast, context) {
        var _this = this;
        var updatedChildren = ast.children.map(function (c) { return c.visit(_this, context); });
        var updatedInputs = ast.inputs.map(function (c) { return c.visit(_this, context); });
        var updatedDirectives = ast.directives.map(function (c) { return c.visit(_this, context); });
        return new compiler_1.ElementAst(ast.name, ast.attrs, updatedInputs, ast.outputs, ast.exportAsVars, updatedDirectives, ast.providers, updatedChildren, ast.ngContentIndex, ast.sourceSpan);
    };
    RouterLinkTransform.prototype.visitVariable = function (ast, context) { return ast; };
    RouterLinkTransform.prototype.visitEvent = function (ast, context) { return ast; };
    RouterLinkTransform.prototype.visitElementProperty = function (ast, context) { return ast; };
    RouterLinkTransform.prototype.visitAttr = function (ast, context) { return ast; };
    RouterLinkTransform.prototype.visitBoundText = function (ast, context) { return ast; };
    RouterLinkTransform.prototype.visitText = function (ast, context) { return ast; };
    RouterLinkTransform.prototype.visitDirective = function (ast, context) {
        var _this = this;
        var updatedInputs = ast.inputs.map(function (c) { return c.visit(_this, context); });
        return new compiler_1.DirectiveAst(ast.directive, updatedInputs, ast.hostProperties, ast.hostEvents, ast.exportAsVars, ast.sourceSpan);
    };
    RouterLinkTransform.prototype.visitDirectiveProperty = function (ast, context) {
        var transformedValue = ast.value.visit(this.astTransformer);
        return new compiler_1.BoundDirectivePropertyAst(ast.directiveName, ast.templateName, transformedValue, ast.sourceSpan);
    };
    RouterLinkTransform = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [parser_1.Parser])
    ], RouterLinkTransform);
    return RouterLinkTransform;
}());
exports.RouterLinkTransform = RouterLinkTransform;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmtfdHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC0xRWJyU080Qi50bXAvYW5ndWxhcjIvc3JjL3JvdXRlci9kaXJlY3RpdmVzL3JvdXRlcl9saW5rX3RyYW5zZm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5QkFNTyxtQkFBbUIsQ0FBQyxDQUFBO0FBQzNCLG9CQVFPLDZDQUE2QyxDQUFDLENBQUE7QUFDckQsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFDN0QscUJBQXlCLGVBQWUsQ0FBQyxDQUFBO0FBQ3pDLHVCQUFxQixnREFBZ0QsQ0FBQyxDQUFBO0FBRXRFOztHQUVHO0FBQ0g7SUFDRSxtQkFBbUIsS0FBYTtRQUFiLFVBQUssR0FBTCxLQUFLLENBQVE7SUFBRyxDQUFDO0lBQ3RDLGdCQUFDO0FBQUQsQ0FBQyxBQUZELElBRUM7QUFFRDs7R0FFRztBQUNIO0lBQ0U7SUFBZSxDQUFDO0lBQ2xCLHFCQUFDO0FBQUQsQ0FBQyxBQUZELElBRUM7QUFFRDs7R0FFRztBQUNIO0lBQ0U7SUFBZSxDQUFDO0lBQ2xCLG1CQUFDO0FBQUQsQ0FBQyxBQUZELElBRUM7QUFFRDs7R0FFRztBQUNIO0lBQ0UsZ0JBQW1CLEdBQVE7UUFBUixRQUFHLEdBQUgsR0FBRyxDQUFLO0lBQUcsQ0FBQztJQUNqQyxhQUFDO0FBQUQsQ0FBQyxBQUZELElBRUM7QUFFRDtJQUdFLHlCQUFvQixNQUFjLEVBQVUsR0FBVztRQUFuQyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQVUsUUFBRyxHQUFILEdBQUcsQ0FBUTtRQUZ2RCxVQUFLLEdBQVcsQ0FBQyxDQUFDO0lBRXdDLENBQUM7SUFFM0Qsa0NBQVEsR0FBUjtRQUNFLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNoQixPQUFPLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdB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SyxDQUFDLEtBQUksRUFBRSxPQUFPLENBQUMsRUFBdEIsQ0FBc0IsQ0FBQyxDQUFDO1FBQ2hFLE1BQU0sQ0FBQyxJQUFJLHVCQUFZLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsR0FBRyxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsVUFBVSxFQUNoRSxHQUFHLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQsb0RBQXNCLEdBQXRCLFVBQXVCLEdBQThCLEVBQUUsT0FBWTtRQUNqRSxJQUFJLGdCQUFnQixHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM1RCxNQUFNLENBQUMsSUFBSSxvQ0FBeUIsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLEVBQ3JELEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBekNIO1FBQUMsaUJBQVUsRUFBRTs7MkJBQUE7SUEwQ2IsMEJBQUM7QUFBRCxDQUFDLEFBekNELElBeUNDO0FBekNZLDJCQUFtQixzQkF5Qy9CLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBUZW1wbGF0ZUFzdFZpc2l0b3IsXG4gIEVsZW1lbnRBc3QsXG4gIEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QsXG4gIERpcmVjdGl2ZUFzdCxcbiAgQm91bmRFbGVtZW50UHJvcGVydHlBc3Rcbn0gZnJvbSAnYW5ndWxhcjIvY29tcGlsZXInO1xuaW1wb3J0IHtcbiAgQXN0VHJhbnNmb3JtZXIsXG4gIFF1b3RlLFxuICBBU1QsXG4gIEVtcHR5RXhwcixcbiAgTGl0ZXJhbEFycmF5LFxuICBMaXRlcmFsUHJpbWl0aXZlLFxuICBBU1RXaXRoU291cmNlXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9leHByZXNzaW9uX3BhcnNlci9hc3QnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7UGFyc2VyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvZXhwcmVzc2lvbl9wYXJzZXIvcGFyc2VyJztcblxuLyoqXG4gKiBlLmcuLCAnLi9Vc2VyJywgJ01vZGFsJyBpbiAuL1VzZXJbTW9kYWwocGFyYW06IHZhbHVlKV1cbiAqL1xuY2xhc3MgRml4ZWRQYXJ0IHtcbiAgY29uc3RydWN0b3IocHVibGljIHZhbHVlOiBzdHJpbmcpIHt9XG59XG5cbi8qKlxuICogVGhlIHNxdWFyZSBicmFja2V0XG4gKi9cbmNsYXNzIEF1eGlsaWFyeVN0YXJ0IHtcbiAgY29uc3RydWN0b3IoKSB7fVxufVxuXG4vKipcbiAqIFRoZSBzcXVhcmUgYnJhY2tldFxuICovXG5jbGFzcyBBdXhpbGlhcnlFbmQge1xuICBjb25zdHJ1Y3RvcigpIHt9XG59XG5cbi8qKlxuICogZS5nLiwgcGFyYW06dmFsdWUgaW4gLi9Vc2VyW01vZGFsKHBhcmFtOiB2YWx1ZSldXG4gKi9cbmNsYXNzIFBhcmFtcyB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBhc3Q6IEFTVCkge31cbn1cblxuY2xhc3MgUm91dGVyTGlua0xleGVyIHtcbiAgaW5kZXg6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBwYXJzZXI6IFBhcnNlciwgcHJpdmF0ZSBleHA6IHN0cmluZykge31cblxuICB0b2tlbml6ZSgpOiBBcnJheTxGaXhlZFBhcnQgfCBBdXhpbGlhcnlTdGFydCB8IEF1eGlsaWFyeUVuZCB8IFBhcmFtcz4ge1xuICAgIGxldCB0b2tlbnMgPSBbXTtcbiAgICB3aGlsZSAodGhpcy5pbmRleCA8IHRoaXMuZXhwLmxlbmd0aCkge1xuICAgICAgdG9rZW5zLnB1c2godGhpcy5fcGFyc2VUb2tlbigpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRva2VucztcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlVG9rZW4oKSB7XG4gICAgbGV0IGMgPSB0aGlzLmV4cFt0aGlzLmluZGV4XTtcbiAgICBpZiAoYyA9PSAnWycpIHtcbiAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgIHJldHVybiBuZXcgQXV4aWxpYXJ5U3RhcnQoKTtcblxuICAgIH0gZWxzZSBpZiAoYyA9PSAnXScpIHtcbiAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgIHJldHVybiBuZXcgQXV4aWxpYXJ5RW5kKCk7XG5cbiAgICB9IGVsc2UgaWYgKGMgPT0gJygnKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcGFyc2VQYXJhbXMoKTtcblxuICAgIH0gZWxzZSBpZiAoYyA9PSAnLycgJiYgdGhpcy5pbmRleCAhPT0gMCkge1xuICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgcmV0dXJuIHRoaXMuX3BhcnNlRml4ZWRQYXJ0KCk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX3BhcnNlRml4ZWRQYXJ0KCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VQYXJhbXMoKSB7XG4gICAgbGV0IHN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICBmb3IgKDsgdGhpcy5pbmRleCA8IHRoaXMuZXhwLmxlbmd0aDsgKyt0aGlzLmluZGV4KSB7XG4gICAgICBsZXQgYyA9IHRoaXMuZXhwW3RoaXMuaW5kZXhdO1xuICAgICAgaWYgKGMgPT0gJyknKSB7XG4gICAgICAgIGxldCBwYXJhbXNDb250ZW50ID0gdGhpcy5leHAuc3Vic3RyaW5nKHN0YXJ0ICsgMSwgdGhpcy5pbmRleCk7XG4gICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgICAgcmV0dXJuIG5ldyBQYXJhbXModGhpcy5wYXJzZXIucGFyc2VCaW5kaW5nKGB7JHtwYXJhbXNDb250ZW50fX1gLCBudWxsKS5hc3QpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcIkNhbm5vdCBmaW5kICcpJ1wiKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlRml4ZWRQYXJ0KCkge1xuICAgIGxldCBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgbGV0IHNhd05vblNsYXNoID0gZmFsc2U7XG5cblxuICAgIGZvciAoOyB0aGlzLmluZGV4IDwgdGhpcy5leHAubGVuZ3RoOyArK3RoaXMuaW5kZXgpIHtcbiAgICAgIGxldCBjID0gdGhpcy5leHBbdGhpcy5pbmRleF07XG5cbiAgICAgIGlmIChjID09ICcoJyB8fCBjID09ICdbJyB8fCBjID09ICddJyB8fCAoYyA9PSAnLycgJiYgc2F3Tm9uU2xhc2gpKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBpZiAoYyAhPSAnLicgJiYgYyAhPSAnLycpIHtcbiAgICAgICAgc2F3Tm9uU2xhc2ggPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBmaXhlZCA9IHRoaXMuZXhwLnN1YnN0cmluZyhzdGFydCwgdGhpcy5pbmRleCk7XG5cbiAgICBpZiAoc3RhcnQgPT09IHRoaXMuaW5kZXggfHwgIXNhd05vblNsYXNoIHx8IGZpeGVkLnN0YXJ0c1dpdGgoJy8vJykpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFwiSW52YWxpZCByb3V0ZXIgbGlua1wiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IEZpeGVkUGFydChmaXhlZCk7XG4gIH1cbn1cblxuY2xhc3MgUm91dGVyTGlua0FzdEdlbmVyYXRvciB7XG4gIGluZGV4OiBudW1iZXIgPSAwO1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHRva2VuczogYW55W10pIHt9XG5cbiAgZ2VuZXJhdGUoKTogQVNUIHsgcmV0dXJuIHRoaXMuX2dlbkF1eGlsaWFyeSgpOyB9XG5cbiAgcHJpdmF0ZSBfZ2VuQXV4aWxpYXJ5KCk6IEFTVCB7XG4gICAgbGV0IGFyciA9IFtdO1xuICAgIGZvciAoOyB0aGlzLmluZGV4IDwgdGhpcy50b2tlbnMubGVuZ3RoOyB0aGlzLmluZGV4KyspIHtcbiAgICAgIGxldCByID0gdGhpcy50b2tlbnNbdGhpcy5pbmRleF07XG5cbiAgICAgIGlmIChyIGluc3RhbmNlb2YgRml4ZWRQYXJ0KSB7XG4gICAgICAgIGFyci5wdXNoKG5ldyBMaXRlcmFsUHJpbWl0aXZlKHIudmFsdWUpKTtcblxuICAgICAgfSBlbHNlIGlmIChyIGluc3RhbmNlb2YgUGFyYW1zKSB7XG4gICAgICAgIGFyci5wdXNoKHIuYXN0KTtcblxuICAgICAgfSBlbHNlIGlmIChyIGluc3RhbmNlb2YgQXV4aWxpYXJ5RW5kKSB7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICB9IGVsc2UgaWYgKHIgaW5zdGFuY2VvZiBBdXhpbGlhcnlTdGFydCkge1xuICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgICAgIGFyci5wdXNoKHRoaXMuX2dlbkF1eGlsaWFyeSgpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IExpdGVyYWxBcnJheShhcnIpO1xuICB9XG59XG5cbmNsYXNzIFJvdXRlckxpbmtBc3RUcmFuc2Zvcm1lciBleHRlbmRzIEFzdFRyYW5zZm9ybWVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBwYXJzZXI6IFBhcnNlcikgeyBzdXBlcigpOyB9XG5cbiAgdmlzaXRRdW90ZShhc3Q6IFF1b3RlLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIGlmIChhc3QucHJlZml4ID09IFwicm91dGVcIikge1xuICAgICAgcmV0dXJuIHBhcnNlUm91dGVyTGlua0V4cHJlc3Npb24odGhpcy5wYXJzZXIsIGFzdC51bmludGVycHJldGVkRXhwcmVzc2lvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzdXBlci52aXNpdFF1b3RlKGFzdCwgY29udGV4dCk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVJvdXRlckxpbmtFeHByZXNzaW9uKHBhcnNlcjogUGFyc2VyLCBleHA6IHN0cmluZyk6IEFTVCB7XG4gIGxldCB0b2tlbnMgPSBuZXcgUm91dGVyTGlua0xleGVyKHBhcnNlciwgZXhwLnRyaW0oKSkudG9rZW5pemUoKTtcbiAgcmV0dXJuIG5ldyBSb3V0ZXJMaW5rQXN0R2VuZXJhdG9yKHRva2VucykuZ2VuZXJhdGUoKTtcbn1cblxuLyoqXG4gKiBBIGNvbXBpbGVyIHBsdWdpbiB0aGF0IGltcGxlbWVudHMgdGhlIHJvdXRlciBsaW5rIERTTC5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJvdXRlckxpbmtUcmFuc2Zvcm0gaW1wbGVtZW50cyBUZW1wbGF0ZUFzdFZpc2l0b3Ige1xuICBwcml2YXRlIGFzdFRyYW5zZm9ybWVyO1xuXG4gIGNvbnN0cnVjdG9yKHBhcnNlcjogUGFyc2VyKSB7IHRoaXMuYXN0VHJhbnNmb3JtZXIgPSBuZXcgUm91dGVyTGlua0FzdFRyYW5zZm9ybWVyKHBhcnNlcik7IH1cblxuICB2aXNpdE5nQ29udGVudChhc3Q6IGFueSwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIGFzdDsgfVxuXG4gIHZpc2l0RW1iZWRkZWRUZW1wbGF0ZShhc3Q6IGFueSwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIGFzdDsgfVxuXG4gIHZpc2l0RWxlbWVudChhc3Q6IEVsZW1lbnRBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgbGV0IHVwZGF0ZWRDaGlsZHJlbiA9IGFzdC5jaGlsZHJlbi5tYXAoYyA9PiBjLnZpc2l0KHRoaXMsIGNvbnRleHQpKTtcbiAgICBsZXQgdXBkYXRlZElucHV0cyA9IGFzdC5pbnB1dHMubWFwKGMgPT4gYy52aXNpdCh0aGlzLCBjb250ZXh0KSk7XG4gICAgbGV0IHVwZGF0ZWREaXJlY3RpdmVzID0gYXN0LmRpcmVjdGl2ZXMubWFwKGMgPT4gYy52aXNpdCh0aGlzLCBjb250ZXh0KSk7XG4gICAgcmV0dXJuIG5ldyBFbGVtZW50QXN0KGFzdC5uYW1lLCBhc3QuYXR0cnMsIHVwZGF0ZWRJbnB1dHMsIGFzdC5vdXRwdXRzLCBhc3QuZXhwb3J0QXNWYXJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkRGlyZWN0aXZlcywgYXN0LnByb3ZpZGVycywgdXBkYXRlZENoaWxkcmVuLCBhc3QubmdDb250ZW50SW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFzdC5zb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHZpc2l0VmFyaWFibGUoYXN0OiBhbnksIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBhc3Q7IH1cblxuICB2aXNpdEV2ZW50KGFzdDogYW55LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gYXN0OyB9XG5cbiAgdmlzaXRFbGVtZW50UHJvcGVydHkoYXN0OiBhbnksIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBhc3Q7IH1cblxuICB2aXNpdEF0dHIoYXN0OiBhbnksIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBhc3Q7IH1cblxuICB2aXNpdEJvdW5kVGV4dChhc3Q6IGFueSwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIGFzdDsgfVxuXG4gIHZpc2l0VGV4dChhc3Q6IGFueSwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIGFzdDsgfVxuXG4gIHZpc2l0RGlyZWN0aXZlKGFzdDogRGlyZWN0aXZlQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGxldCB1cGRhdGVkSW5wdXRzID0gYXN0LmlucHV0cy5tYXAoYyA9PiBjLnZpc2l0KHRoaXMsIGNvbnRleHQpKTtcbiAgICByZXR1cm4gbmV3IERpcmVjdGl2ZUFzdChhc3QuZGlyZWN0aXZlLCB1cGRhdGVkSW5wdXRzLCBhc3QuaG9zdFByb3BlcnRpZXMsIGFzdC5ob3N0RXZlbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzdC5leHBvcnRBc1ZhcnMsIGFzdC5zb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHZpc2l0RGlyZWN0aXZlUHJvcGVydHkoYXN0OiBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGxldCB0cmFuc2Zvcm1lZFZhbHVlID0gYXN0LnZhbHVlLnZpc2l0KHRoaXMuYXN0VHJhbnNmb3JtZXIpO1xuICAgIHJldHVybiBuZXcgQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdChhc3QuZGlyZWN0aXZlTmFtZSwgYXN0LnRlbXBsYXRlTmFtZSwgdHJhbnNmb3JtZWRWYWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN0LnNvdXJjZVNwYW4pO1xuICB9XG59Il19