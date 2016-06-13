var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { ListWrapper, StringMapWrapper, SetWrapper } from 'angular2/src/facade/collection';
import { RegExpWrapper, isPresent, StringWrapper, isBlank } from 'angular2/src/facade/lang';
import { Injectable, Inject, OpaqueToken, Optional } from 'angular2/core';
import { CONST_EXPR } from 'angular2/src/facade/lang';
import { Console } from 'angular2/src/core/console';
import { BaseException } from 'angular2/src/facade/exceptions';
import { RecursiveAstVisitor } from './expression_parser/ast';
import { Parser } from './expression_parser/parser';
import { HtmlParser } from './html_parser';
import { splitNsName, mergeNsAndName } from './html_tags';
import { ParseError, ParseErrorLevel } from './parse_util';
import { MAX_INTERPOLATION_VALUES } from 'angular2/src/core/linker/view_utils';
import { ElementAst, BoundElementPropertyAst, BoundEventAst, ReferenceAst, templateVisitAll, TextAst, BoundTextAst, EmbeddedTemplateAst, AttrAst, NgContentAst, PropertyBindingType, DirectiveAst, BoundDirectivePropertyAst, VariableAst } from './template_ast';
import { CssSelector, SelectorMatcher } from 'angular2/src/compiler/selector';
import { ElementSchemaRegistry } from 'angular2/src/compiler/schema/element_schema_registry';
import { preparseElement, PreparsedElementType } from './template_preparser';
import { isStyleUrlResolvable } from './style_url_resolver';
import { htmlVisitAll } from './html_ast';
import { splitAtColon } from './util';
import { identifierToken, Identifiers } from './identifiers';
import { ProviderElementContext, ProviderViewContext } from './provider_parser';
// Group 1 = "bind-"
// Group 2 = "var-"
// Group 3 = "let-"
// Group 4 = "ref-/#"
// Group 5 = "on-"
// Group 6 = "bindon-"
// Group 7 = the identifier after "bind-", "var-/#", or "on-"
// Group 8 = identifier inside [()]
// Group 9 = identifier inside []
// Group 10 = identifier inside ()
var BIND_NAME_REGEXP = /^(?:(?:(?:(bind-)|(var-)|(let-)|(ref-|#)|(on-)|(bindon-))(.+))|\[\(([^\)]+)\)\]|\[([^\]]+)\]|\(([^\)]+)\))$/g;
const TEMPLATE_ELEMENT = 'template';
const TEMPLATE_ATTR = 'template';
const TEMPLATE_ATTR_PREFIX = '*';
const CLASS_ATTR = 'class';
var PROPERTY_PARTS_SEPARATOR = '.';
const ATTRIBUTE_PREFIX = 'attr';
const CLASS_PREFIX = 'class';
const STYLE_PREFIX = 'style';
var TEXT_CSS_SELECTOR = CssSelector.parse('*')[0];
/**
 * Provides an array of {@link TemplateAstVisitor}s which will be used to transform
 * parsed templates before compilation is invoked, allowing custom expression syntax
 * and other advanced transformations.
 *
 * This is currently an internal-only feature and not meant for general use.
 */
export const TEMPLATE_TRANSFORMS = CONST_EXPR(new OpaqueToken('TemplateTransforms'));
export class TemplateParseError extends ParseError {
    constructor(message, span, level) {
        super(span, message, level);
    }
}
export class TemplateParseResult {
    constructor(templateAst, errors) {
        this.templateAst = templateAst;
        this.errors = errors;
    }
}
export let TemplateParser = class TemplateParser {
    constructor(_exprParser, _schemaRegistry, _htmlParser, _console, transforms) {
        this._exprParser = _exprParser;
        this._schemaRegistry = _schemaRegistry;
        this._htmlParser = _htmlParser;
        this._console = _console;
        this.transforms = transforms;
    }
    parse(component, template, directives, pipes, templateUrl) {
        var result = this.tryParse(component, template, directives, pipes, templateUrl);
        var warnings = result.errors.filter(error => error.level === ParseErrorLevel.WARNING);
        var errors = result.errors.filter(error => error.level === ParseErrorLevel.FATAL);
        if (warnings.length > 0) {
            this._console.warn(`Template parse warnings:\n${warnings.join('\n')}`);
        }
        if (errors.length > 0) {
            var errorString = errors.join('\n');
            throw new BaseException(`Template parse errors:\n${errorString}`);
        }
        return result.templateAst;
    }
    tryParse(component, template, directives, pipes, templateUrl) {
        var htmlAstWithErrors = this._htmlParser.parse(template, templateUrl);
        var errors = htmlAstWithErrors.errors;
        var result;
        if (htmlAstWithErrors.rootNodes.length > 0) {
            var uniqDirectives = removeDuplicates(directives);
            var uniqPipes = removeDuplicates(pipes);
            var providerViewContext = new ProviderViewContext(component, htmlAstWithErrors.rootNodes[0].sourceSpan);
            var parseVisitor = new TemplateParseVisitor(providerViewContext, uniqDirectives, uniqPipes, this._exprParser, this._schemaRegistry);
            result = htmlVisitAll(parseVisitor, htmlAstWithErrors.rootNodes, EMPTY_ELEMENT_CONTEXT);
            errors = errors.concat(parseVisitor.errors).concat(providerViewContext.errors);
        }
        else {
            result = [];
        }
        if (errors.length > 0) {
            return new TemplateParseResult(result, errors);
        }
        if (isPresent(this.transforms)) {
            this.transforms.forEach((transform) => { result = templateVisitAll(transform, result); });
        }
        return new TemplateParseResult(result, errors);
    }
};
TemplateParser = __decorate([
    Injectable(),
    __param(4, Optional()),
    __param(4, Inject(TEMPLATE_TRANSFORMS)), 
    __metadata('design:paramtypes', [Parser, ElementSchemaRegistry, HtmlParser, Console, Array])
], TemplateParser);
class TemplateParseVisitor {
    constructor(providerViewContext, directives, pipes, _exprParser, _schemaRegistry) {
        this.providerViewContext = providerViewContext;
        this._exprParser = _exprParser;
        this._schemaRegistry = _schemaRegistry;
        this.errors = [];
        this.directivesIndex = new Map();
        this.ngContentCount = 0;
        this.selectorMatcher = new SelectorMatcher();
        ListWrapper.forEachWithIndex(directives, (directive, index) => {
            var selector = CssSelector.parse(directive.selector);
            this.selectorMatcher.addSelectables(selector, directive);
            this.directivesIndex.set(directive, index);
        });
        this.pipesByName = new Map();
        pipes.forEach(pipe => this.pipesByName.set(pipe.name, pipe));
    }
    _reportError(message, sourceSpan, level = ParseErrorLevel.FATAL) {
        this.errors.push(new TemplateParseError(message, sourceSpan, level));
    }
    _parseInterpolation(value, sourceSpan) {
        var sourceInfo = sourceSpan.start.toString();
        try {
            var ast = this._exprParser.parseInterpolation(value, sourceInfo);
            this._checkPipes(ast, sourceSpan);
            if (isPresent(ast) &&
                ast.ast.expressions.length > MAX_INTERPOLATION_VALUES) {
                throw new BaseException(`Only support at most ${MAX_INTERPOLATION_VALUES} interpolation values!`);
            }
            return ast;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    }
    _parseAction(value, sourceSpan) {
        var sourceInfo = sourceSpan.start.toString();
        try {
            var ast = this._exprParser.parseAction(value, sourceInfo);
            this._checkPipes(ast, sourceSpan);
            return ast;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    }
    _parseBinding(value, sourceSpan) {
        var sourceInfo = sourceSpan.start.toString();
        try {
            var ast = this._exprParser.parseBinding(value, sourceInfo);
            this._checkPipes(ast, sourceSpan);
            return ast;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    }
    _parseTemplateBindings(value, sourceSpan) {
        var sourceInfo = sourceSpan.start.toString();
        try {
            var bindingsResult = this._exprParser.parseTemplateBindings(value, sourceInfo);
            bindingsResult.templateBindings.forEach((binding) => {
                if (isPresent(binding.expression)) {
                    this._checkPipes(binding.expression, sourceSpan);
                }
            });
            bindingsResult.warnings.forEach((warning) => { this._reportError(warning, sourceSpan, ParseErrorLevel.WARNING); });
            return bindingsResult.templateBindings;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return [];
        }
    }
    _checkPipes(ast, sourceSpan) {
        if (isPresent(ast)) {
            var collector = new PipeCollector();
            ast.visit(collector);
            collector.pipes.forEach((pipeName) => {
                if (!this.pipesByName.has(pipeName)) {
                    this._reportError(`The pipe '${pipeName}' could not be found`, sourceSpan);
                }
            });
        }
    }
    visitExpansion(ast, context) { return null; }
    visitExpansionCase(ast, context) { return null; }
    visitText(ast, parent) {
        var ngContentIndex = parent.findNgContentIndex(TEXT_CSS_SELECTOR);
        var expr = this._parseInterpolation(ast.value, ast.sourceSpan);
        if (isPresent(expr)) {
            return new BoundTextAst(expr, ngContentIndex, ast.sourceSpan);
        }
        else {
            return new TextAst(ast.value, ngContentIndex, ast.sourceSpan);
        }
    }
    visitAttr(ast, contex) {
        return new AttrAst(ast.name, ast.value, ast.sourceSpan);
    }
    visitComment(ast, context) { return null; }
    visitElement(element, parent) {
        var nodeName = element.name;
        var preparsedElement = preparseElement(element);
        if (preparsedElement.type === PreparsedElementType.SCRIPT ||
            preparsedElement.type === PreparsedElementType.STYLE) {
            // Skipping <script> for security reasons
            // Skipping <style> as we already processed them
            // in the StyleCompiler
            return null;
        }
        if (preparsedElement.type === PreparsedElementType.STYLESHEET &&
            isStyleUrlResolvable(preparsedElement.hrefAttr)) {
            // Skipping stylesheets with either relative urls or package scheme as we already processed
            // them in the StyleCompiler
            return null;
        }
        var matchableAttrs = [];
        var elementOrDirectiveProps = [];
        var elementOrDirectiveRefs = [];
        var elementVars = [];
        var events = [];
        var templateElementOrDirectiveProps = [];
        var templateMatchableAttrs = [];
        var templateElementVars = [];
        var hasInlineTemplates = false;
        var attrs = [];
        var lcElName = splitNsName(nodeName.toLowerCase())[1];
        var isTemplateElement = lcElName == TEMPLATE_ELEMENT;
        element.attrs.forEach(attr => {
            var hasBinding = this._parseAttr(isTemplateElement, attr, matchableAttrs, elementOrDirectiveProps, events, elementOrDirectiveRefs, elementVars);
            var hasTemplateBinding = this._parseInlineTemplateBinding(attr, templateMatchableAttrs, templateElementOrDirectiveProps, templateElementVars);
            if (!hasBinding && !hasTemplateBinding) {
                // don't include the bindings as attributes as well in the AST
                attrs.push(this.visitAttr(attr, null));
                matchableAttrs.push([attr.name, attr.value]);
            }
            if (hasTemplateBinding) {
                hasInlineTemplates = true;
            }
        });
        var elementCssSelector = createElementCssSelector(nodeName, matchableAttrs);
        var directiveMetas = this._parseDirectives(this.selectorMatcher, elementCssSelector);
        var references = [];
        var directiveAsts = this._createDirectiveAsts(isTemplateElement, element.name, directiveMetas, elementOrDirectiveProps, elementOrDirectiveRefs, element.sourceSpan, references);
        var elementProps = this._createElementPropertyAsts(element.name, elementOrDirectiveProps, directiveAsts);
        var isViewRoot = parent.isTemplateElement || hasInlineTemplates;
        var providerContext = new ProviderElementContext(this.providerViewContext, parent.providerContext, isViewRoot, directiveAsts, attrs, references, element.sourceSpan);
        var children = htmlVisitAll(preparsedElement.nonBindable ? NON_BINDABLE_VISITOR : this, element.children, ElementContext.create(isTemplateElement, directiveAsts, isTemplateElement ? parent.providerContext : providerContext));
        providerContext.afterElement();
        // Override the actual selector when the `ngProjectAs` attribute is provided
        var projectionSelector = isPresent(preparsedElement.projectAs) ?
            CssSelector.parse(preparsedElement.projectAs)[0] :
            elementCssSelector;
        var ngContentIndex = parent.findNgContentIndex(projectionSelector);
        var parsedElement;
        if (preparsedElement.type === PreparsedElementType.NG_CONTENT) {
            if (isPresent(element.children) && element.children.length > 0) {
                this._reportError(`<ng-content> element cannot have content. <ng-content> must be immediately followed by </ng-content>`, element.sourceSpan);
            }
            parsedElement = new NgContentAst(this.ngContentCount++, hasInlineTemplates ? null : ngContentIndex, element.sourceSpan);
        }
        else if (isTemplateElement) {
            this._assertAllEventsPublishedByDirectives(directiveAsts, events);
            this._assertNoComponentsNorElementBindingsOnTemplate(directiveAsts, elementProps, element.sourceSpan);
            parsedElement = new EmbeddedTemplateAst(attrs, events, references, elementVars, providerContext.transformedDirectiveAsts, providerContext.transformProviders, providerContext.transformedHasViewContainer, children, hasInlineTemplates ? null : ngContentIndex, element.sourceSpan);
        }
        else {
            this._assertOnlyOneComponent(directiveAsts, element.sourceSpan);
            let ngContentIndex = hasInlineTemplates ? null : parent.findNgContentIndex(projectionSelector);
            parsedElement = new ElementAst(nodeName, attrs, elementProps, events, references, providerContext.transformedDirectiveAsts, providerContext.transformProviders, providerContext.transformedHasViewContainer, children, hasInlineTemplates ? null : ngContentIndex, element.sourceSpan);
        }
        if (hasInlineTemplates) {
            var templateCssSelector = createElementCssSelector(TEMPLATE_ELEMENT, templateMatchableAttrs);
            var templateDirectiveMetas = this._parseDirectives(this.selectorMatcher, templateCssSelector);
            var templateDirectiveAsts = this._createDirectiveAsts(true, element.name, templateDirectiveMetas, templateElementOrDirectiveProps, [], element.sourceSpan, []);
            var templateElementProps = this._createElementPropertyAsts(element.name, templateElementOrDirectiveProps, templateDirectiveAsts);
            this._assertNoComponentsNorElementBindingsOnTemplate(templateDirectiveAsts, templateElementProps, element.sourceSpan);
            var templateProviderContext = new ProviderElementContext(this.providerViewContext, parent.providerContext, parent.isTemplateElement, templateDirectiveAsts, [], [], element.sourceSpan);
            templateProviderContext.afterElement();
            parsedElement = new EmbeddedTemplateAst([], [], [], templateElementVars, templateProviderContext.transformedDirectiveAsts, templateProviderContext.transformProviders, templateProviderContext.transformedHasViewContainer, [parsedElement], ngContentIndex, element.sourceSpan);
        }
        return parsedElement;
    }
    _parseInlineTemplateBinding(attr, targetMatchableAttrs, targetProps, targetVars) {
        var templateBindingsSource = null;
        if (attr.name == TEMPLATE_ATTR) {
            templateBindingsSource = attr.value;
        }
        else if (attr.name.startsWith(TEMPLATE_ATTR_PREFIX)) {
            var key = attr.name.substring(TEMPLATE_ATTR_PREFIX.length); // remove the star
            templateBindingsSource = (attr.value.length == 0) ? key : key + ' ' + attr.value;
        }
        if (isPresent(templateBindingsSource)) {
            var bindings = this._parseTemplateBindings(templateBindingsSource, attr.sourceSpan);
            for (var i = 0; i < bindings.length; i++) {
                var binding = bindings[i];
                if (binding.keyIsVar) {
                    targetVars.push(new VariableAst(binding.key, binding.name, attr.sourceSpan));
                }
                else if (isPresent(binding.expression)) {
                    this._parsePropertyAst(binding.key, binding.expression, attr.sourceSpan, targetMatchableAttrs, targetProps);
                }
                else {
                    targetMatchableAttrs.push([binding.key, '']);
                    this._parseLiteralAttr(binding.key, null, attr.sourceSpan, targetProps);
                }
            }
            return true;
        }
        return false;
    }
    _parseAttr(isTemplateElement, attr, targetMatchableAttrs, targetProps, targetEvents, targetRefs, targetVars) {
        var attrName = this._normalizeAttributeName(attr.name);
        var attrValue = attr.value;
        var bindParts = RegExpWrapper.firstMatch(BIND_NAME_REGEXP, attrName);
        var hasBinding = false;
        if (isPresent(bindParts)) {
            hasBinding = true;
            if (isPresent(bindParts[1])) {
                this._parseProperty(bindParts[7], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
            }
            else if (isPresent(bindParts[2])) {
                var identifier = bindParts[7];
                if (isTemplateElement) {
                    this._reportError(`"var-" on <template> elements is deprecated. Use "let-" instead!`, attr.sourceSpan, ParseErrorLevel.WARNING);
                    this._parseVariable(identifier, attrValue, attr.sourceSpan, targetVars);
                }
                else {
                    this._reportError(`"var-" on non <template> elements is deprecated. Use "ref-" instead!`, attr.sourceSpan, ParseErrorLevel.WARNING);
                    this._parseReference(identifier, attrValue, attr.sourceSpan, targetRefs);
                }
            }
            else if (isPresent(bindParts[3])) {
                if (isTemplateElement) {
                    var identifier = bindParts[7];
                    this._parseVariable(identifier, attrValue, attr.sourceSpan, targetVars);
                }
                else {
                    this._reportError(`"let-" is only supported on template elements.`, attr.sourceSpan);
                }
            }
            else if (isPresent(bindParts[4])) {
                var identifier = bindParts[7];
                this._parseReference(identifier, attrValue, attr.sourceSpan, targetRefs);
            }
            else if (isPresent(bindParts[5])) {
                this._parseEvent(bindParts[7], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
            }
            else if (isPresent(bindParts[6])) {
                this._parseProperty(bindParts[7], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
                this._parseAssignmentEvent(bindParts[7], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
            }
            else if (isPresent(bindParts[8])) {
                this._parseProperty(bindParts[8], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
                this._parseAssignmentEvent(bindParts[8], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
            }
            else if (isPresent(bindParts[9])) {
                this._parseProperty(bindParts[9], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
            }
            else if (isPresent(bindParts[10])) {
                this._parseEvent(bindParts[10], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
            }
        }
        else {
            hasBinding = this._parsePropertyInterpolation(attrName, attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
        }
        if (!hasBinding) {
            this._parseLiteralAttr(attrName, attrValue, attr.sourceSpan, targetProps);
        }
        return hasBinding;
    }
    _normalizeAttributeName(attrName) {
        return attrName.toLowerCase().startsWith('data-') ? attrName.substring(5) : attrName;
    }
    _parseVariable(identifier, value, sourceSpan, targetVars) {
        if (identifier.indexOf('-') > -1) {
            this._reportError(`"-" is not allowed in variable names`, sourceSpan);
        }
        targetVars.push(new VariableAst(identifier, value, sourceSpan));
    }
    _parseReference(identifier, value, sourceSpan, targetRefs) {
        if (identifier.indexOf('-') > -1) {
            this._reportError(`"-" is not allowed in reference names`, sourceSpan);
        }
        targetRefs.push(new ElementOrDirectiveRef(identifier, value, sourceSpan));
    }
    _parseProperty(name, expression, sourceSpan, targetMatchableAttrs, targetProps) {
        this._parsePropertyAst(name, this._parseBinding(expression, sourceSpan), sourceSpan, targetMatchableAttrs, targetProps);
    }
    _parsePropertyInterpolation(name, value, sourceSpan, targetMatchableAttrs, targetProps) {
        var expr = this._parseInterpolation(value, sourceSpan);
        if (isPresent(expr)) {
            this._parsePropertyAst(name, expr, sourceSpan, targetMatchableAttrs, targetProps);
            return true;
        }
        return false;
    }
    _parsePropertyAst(name, ast, sourceSpan, targetMatchableAttrs, targetProps) {
        targetMatchableAttrs.push([name, ast.source]);
        targetProps.push(new BoundElementOrDirectiveProperty(name, ast, false, sourceSpan));
    }
    _parseAssignmentEvent(name, expression, sourceSpan, targetMatchableAttrs, targetEvents) {
        this._parseEvent(`${name}Change`, `${expression}=$event`, sourceSpan, targetMatchableAttrs, targetEvents);
    }
    _parseEvent(name, expression, sourceSpan, targetMatchableAttrs, targetEvents) {
        // long format: 'target: eventName'
        var parts = splitAtColon(name, [null, name]);
        var target = parts[0];
        var eventName = parts[1];
        var ast = this._parseAction(expression, sourceSpan);
        targetMatchableAttrs.push([name, ast.source]);
        targetEvents.push(new BoundEventAst(eventName, target, ast, sourceSpan));
        // Don't detect directives for event names for now,
        // so don't add the event name to the matchableAttrs
    }
    _parseLiteralAttr(name, value, sourceSpan, targetProps) {
        targetProps.push(new BoundElementOrDirectiveProperty(name, this._exprParser.wrapLiteralPrimitive(value, ''), true, sourceSpan));
    }
    _parseDirectives(selectorMatcher, elementCssSelector) {
        // Need to sort the directives so that we get consistent results throughout,
        // as selectorMatcher uses Maps inside.
        // Also dedupe directives as they might match more than one time!
        var directives = ListWrapper.createFixedSize(this.directivesIndex.size);
        selectorMatcher.match(elementCssSelector, (selector, directive) => {
            directives[this.directivesIndex.get(directive)] = directive;
        });
        return directives.filter(dir => isPresent(dir));
    }
    _createDirectiveAsts(isTemplateElement, elementName, directives, props, elementOrDirectiveRefs, sourceSpan, targetReferences) {
        var matchedReferences = new Set();
        var component = null;
        var directiveAsts = directives.map((directive) => {
            if (directive.isComponent) {
                component = directive;
            }
            var hostProperties = [];
            var hostEvents = [];
            var directiveProperties = [];
            this._createDirectiveHostPropertyAsts(elementName, directive.hostProperties, sourceSpan, hostProperties);
            this._createDirectiveHostEventAsts(directive.hostListeners, sourceSpan, hostEvents);
            this._createDirectivePropertyAsts(directive.inputs, props, directiveProperties);
            elementOrDirectiveRefs.forEach((elOrDirRef) => {
                if ((elOrDirRef.value.length === 0 && directive.isComponent) ||
                    (directive.exportAs == elOrDirRef.value)) {
                    targetReferences.push(new ReferenceAst(elOrDirRef.name, identifierToken(directive.type), elOrDirRef.sourceSpan));
                    matchedReferences.add(elOrDirRef.name);
                }
            });
            return new DirectiveAst(directive, directiveProperties, hostProperties, hostEvents, sourceSpan);
        });
        elementOrDirectiveRefs.forEach((elOrDirRef) => {
            if (elOrDirRef.value.length > 0) {
                if (!SetWrapper.has(matchedReferences, elOrDirRef.name)) {
                    this._reportError(`There is no directive with "exportAs" set to "${elOrDirRef.value}"`, elOrDirRef.sourceSpan);
                }
                ;
            }
            else if (isBlank(component)) {
                var refToken = null;
                if (isTemplateElement) {
                    refToken = identifierToken(Identifiers.TemplateRef);
                }
                targetReferences.push(new ReferenceAst(elOrDirRef.name, refToken, elOrDirRef.sourceSpan));
            }
        });
        return directiveAsts;
    }
    _createDirectiveHostPropertyAsts(elementName, hostProps, sourceSpan, targetPropertyAsts) {
        if (isPresent(hostProps)) {
            StringMapWrapper.forEach(hostProps, (expression, propName) => {
                var exprAst = this._parseBinding(expression, sourceSpan);
                targetPropertyAsts.push(this._createElementPropertyAst(elementName, propName, exprAst, sourceSpan));
            });
        }
    }
    _createDirectiveHostEventAsts(hostListeners, sourceSpan, targetEventAsts) {
        if (isPresent(hostListeners)) {
            StringMapWrapper.forEach(hostListeners, (expression, propName) => {
                this._parseEvent(propName, expression, sourceSpan, [], targetEventAsts);
            });
        }
    }
    _createDirectivePropertyAsts(directiveProperties, boundProps, targetBoundDirectiveProps) {
        if (isPresent(directiveProperties)) {
            var boundPropsByName = new Map();
            boundProps.forEach(boundProp => {
                var prevValue = boundPropsByName.get(boundProp.name);
                if (isBlank(prevValue) || prevValue.isLiteral) {
                    // give [a]="b" a higher precedence than a="b" on the same element
                    boundPropsByName.set(boundProp.name, boundProp);
                }
            });
            StringMapWrapper.forEach(directiveProperties, (elProp, dirProp) => {
                var boundProp = boundPropsByName.get(elProp);
                // Bindings are optional, so this binding only needs to be set up if an expression is given.
                if (isPresent(boundProp)) {
                    targetBoundDirectiveProps.push(new BoundDirectivePropertyAst(dirProp, boundProp.name, boundProp.expression, boundProp.sourceSpan));
                }
            });
        }
    }
    _createElementPropertyAsts(elementName, props, directives) {
        var boundElementProps = [];
        var boundDirectivePropsIndex = new Map();
        directives.forEach((directive) => {
            directive.inputs.forEach((prop) => {
                boundDirectivePropsIndex.set(prop.templateName, prop);
            });
        });
        props.forEach((prop) => {
            if (!prop.isLiteral && isBlank(boundDirectivePropsIndex.get(prop.name))) {
                boundElementProps.push(this._createElementPropertyAst(elementName, prop.name, prop.expression, prop.sourceSpan));
            }
        });
        return boundElementProps;
    }
    _createElementPropertyAst(elementName, name, ast, sourceSpan) {
        var unit = null;
        var bindingType;
        var boundPropertyName;
        var parts = name.split(PROPERTY_PARTS_SEPARATOR);
        if (parts.length === 1) {
            boundPropertyName = this._schemaRegistry.getMappedPropName(parts[0]);
            bindingType = PropertyBindingType.Property;
            if (!this._schemaRegistry.hasProperty(elementName, boundPropertyName)) {
                this._reportError(`Can't bind to '${boundPropertyName}' since it isn't a known native property`, sourceSpan);
            }
        }
        else {
            if (parts[0] == ATTRIBUTE_PREFIX) {
                boundPropertyName = parts[1];
                let nsSeparatorIdx = boundPropertyName.indexOf(':');
                if (nsSeparatorIdx > -1) {
                    let ns = boundPropertyName.substring(0, nsSeparatorIdx);
                    let name = boundPropertyName.substring(nsSeparatorIdx + 1);
                    boundPropertyName = mergeNsAndName(ns, name);
                }
                bindingType = PropertyBindingType.Attribute;
            }
            else if (parts[0] == CLASS_PREFIX) {
                boundPropertyName = parts[1];
                bindingType = PropertyBindingType.Class;
            }
            else if (parts[0] == STYLE_PREFIX) {
                unit = parts.length > 2 ? parts[2] : null;
                boundPropertyName = parts[1];
                bindingType = PropertyBindingType.Style;
            }
            else {
                this._reportError(`Invalid property name '${name}'`, sourceSpan);
                bindingType = null;
            }
        }
        return new BoundElementPropertyAst(boundPropertyName, bindingType, ast, unit, sourceSpan);
    }
    _findComponentDirectiveNames(directives) {
        var componentTypeNames = [];
        directives.forEach(directive => {
            var typeName = directive.directive.type.name;
            if (directive.directive.isComponent) {
                componentTypeNames.push(typeName);
            }
        });
        return componentTypeNames;
    }
    _assertOnlyOneComponent(directives, sourceSpan) {
        var componentTypeNames = this._findComponentDirectiveNames(directives);
        if (componentTypeNames.length > 1) {
            this._reportError(`More than one component: ${componentTypeNames.join(',')}`, sourceSpan);
        }
    }
    _assertNoComponentsNorElementBindingsOnTemplate(directives, elementProps, sourceSpan) {
        var componentTypeNames = this._findComponentDirectiveNames(directives);
        if (componentTypeNames.length > 0) {
            this._reportError(`Components on an embedded template: ${componentTypeNames.join(',')}`, sourceSpan);
        }
        elementProps.forEach(prop => {
            this._reportError(`Property binding ${prop.name} not used by any directive on an embedded template`, sourceSpan);
        });
    }
    _assertAllEventsPublishedByDirectives(directives, events) {
        var allDirectiveEvents = new Set();
        directives.forEach(directive => {
            StringMapWrapper.forEach(directive.directive.outputs, (eventName, _) => { allDirectiveEvents.add(eventName); });
        });
        events.forEach(event => {
            if (isPresent(event.target) || !SetWrapper.has(allDirectiveEvents, event.name)) {
                this._reportError(`Event binding ${event.fullName} not emitted by any directive on an embedded template`, event.sourceSpan);
            }
        });
    }
}
class NonBindableVisitor {
    visitElement(ast, parent) {
        var preparsedElement = preparseElement(ast);
        if (preparsedElement.type === PreparsedElementType.SCRIPT ||
            preparsedElement.type === PreparsedElementType.STYLE ||
            preparsedElement.type === PreparsedElementType.STYLESHEET) {
            // Skipping <script> for security reasons
            // Skipping <style> and stylesheets as we already processed them
            // in the StyleCompiler
            return null;
        }
        var attrNameAndValues = ast.attrs.map(attrAst => [attrAst.name, attrAst.value]);
        var selector = createElementCssSelector(ast.name, attrNameAndValues);
        var ngContentIndex = parent.findNgContentIndex(selector);
        var children = htmlVisitAll(this, ast.children, EMPTY_ELEMENT_CONTEXT);
        return new ElementAst(ast.name, htmlVisitAll(this, ast.attrs), [], [], [], [], [], false, children, ngContentIndex, ast.sourceSpan);
    }
    visitComment(ast, context) { return null; }
    visitAttr(ast, context) {
        return new AttrAst(ast.name, ast.value, ast.sourceSpan);
    }
    visitText(ast, parent) {
        var ngContentIndex = parent.findNgContentIndex(TEXT_CSS_SELECTOR);
        return new TextAst(ast.value, ngContentIndex, ast.sourceSpan);
    }
    visitExpansion(ast, context) { return ast; }
    visitExpansionCase(ast, context) { return ast; }
}
class BoundElementOrDirectiveProperty {
    constructor(name, expression, isLiteral, sourceSpan) {
        this.name = name;
        this.expression = expression;
        this.isLiteral = isLiteral;
        this.sourceSpan = sourceSpan;
    }
}
class ElementOrDirectiveRef {
    constructor(name, value, sourceSpan) {
        this.name = name;
        this.value = value;
        this.sourceSpan = sourceSpan;
    }
}
export function splitClasses(classAttrValue) {
    return StringWrapper.split(classAttrValue.trim(), /\s+/g);
}
class ElementContext {
    constructor(isTemplateElement, _ngContentIndexMatcher, _wildcardNgContentIndex, providerContext) {
        this.isTemplateElement = isTemplateElement;
        this._ngContentIndexMatcher = _ngContentIndexMatcher;
        this._wildcardNgContentIndex = _wildcardNgContentIndex;
        this.providerContext = providerContext;
    }
    static create(isTemplateElement, directives, providerContext) {
        var matcher = new SelectorMatcher();
        var wildcardNgContentIndex = null;
        var component = directives.find(directive => directive.directive.isComponent);
        if (isPresent(component)) {
            var ngContentSelectors = component.directive.template.ngContentSelectors;
            for (var i = 0; i < ngContentSelectors.length; i++) {
                var selector = ngContentSelectors[i];
                if (StringWrapper.equals(selector, '*')) {
                    wildcardNgContentIndex = i;
                }
                else {
                    matcher.addSelectables(CssSelector.parse(ngContentSelectors[i]), i);
                }
            }
        }
        return new ElementContext(isTemplateElement, matcher, wildcardNgContentIndex, providerContext);
    }
    findNgContentIndex(selector) {
        var ngContentIndices = [];
        this._ngContentIndexMatcher.match(selector, (selector, ngContentIndex) => { ngContentIndices.push(ngContentIndex); });
        ListWrapper.sort(ngContentIndices);
        if (isPresent(this._wildcardNgContentIndex)) {
            ngContentIndices.push(this._wildcardNgContentIndex);
        }
        return ngContentIndices.length > 0 ? ngContentIndices[0] : null;
    }
}
function createElementCssSelector(elementName, matchableAttrs) {
    var cssSelector = new CssSelector();
    let elNameNoNs = splitNsName(elementName)[1];
    cssSelector.setElement(elNameNoNs);
    for (var i = 0; i < matchableAttrs.length; i++) {
        let attrName = matchableAttrs[i][0];
        let attrNameNoNs = splitNsName(attrName)[1];
        let attrValue = matchableAttrs[i][1];
        cssSelector.addAttribute(attrNameNoNs, attrValue);
        if (attrName.toLowerCase() == CLASS_ATTR) {
            var classes = splitClasses(attrValue);
            classes.forEach(className => cssSelector.addClassName(className));
        }
    }
    return cssSelector;
}
var EMPTY_ELEMENT_CONTEXT = new ElementContext(true, new SelectorMatcher(), null, null);
var NON_BINDABLE_VISITOR = new NonBindableVisitor();
export class PipeCollector extends RecursiveAstVisitor {
    constructor(...args) {
        super(...args);
        this.pipes = new Set();
    }
    visitPipe(ast, context) {
        this.pipes.add(ast.name);
        ast.exp.visit(this);
        this.visitAll(ast.args, context);
        return null;
    }
}
function removeDuplicates(items) {
    let res = [];
    items.forEach(item => {
        let hasMatch = res.filter(r => r.type.name == item.type.name && r.type.moduleUrl == item.type.moduleUrl &&
            r.type.runtime == item.type.runtime)
            .length > 0;
        if (!hasMatch) {
            res.push(item);
        }
    });
    return res;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfcGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1WZlFRV0NJay50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3RlbXBsYXRlX3BhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7T0FBTyxFQUNMLFdBQVcsRUFDWCxnQkFBZ0IsRUFDaEIsVUFBVSxFQUVYLE1BQU0sZ0NBQWdDO09BQ2hDLEVBQUMsYUFBYSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFVLE1BQU0sMEJBQTBCO09BQzNGLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFDLE1BQU0sZUFBZTtPQUNoRSxFQUFDLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtPQUM1QyxFQUFDLE9BQU8sRUFBQyxNQUFNLDJCQUEyQjtPQUMxQyxFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNyRCxFQUtMLG1CQUFtQixFQUVwQixNQUFNLHlCQUF5QjtPQUN6QixFQUFDLE1BQU0sRUFBQyxNQUFNLDRCQUE0QjtPQVUxQyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWU7T0FDakMsRUFBQyxXQUFXLEVBQUUsY0FBYyxFQUFDLE1BQU0sYUFBYTtPQUNoRCxFQUFrQixVQUFVLEVBQWlCLGVBQWUsRUFBQyxNQUFNLGNBQWM7T0FDakYsRUFBQyx3QkFBd0IsRUFBQyxNQUFNLHFDQUFxQztPQUVyRSxFQUNMLFVBQVUsRUFDVix1QkFBdUIsRUFDdkIsYUFBYSxFQUNiLFlBQVksRUFHWixnQkFBZ0IsRUFDaEIsT0FBTyxFQUNQLFlBQVksRUFDWixtQkFBbUIsRUFDbkIsT0FBTyxFQUNQLFlBQVksRUFDWixtQkFBbUIsRUFDbkIsWUFBWSxFQUNaLHlCQUF5QixFQUd6QixXQUFXLEVBQ1osTUFBTSxnQkFBZ0I7T0FDaEIsRUFBQyxXQUFXLEVBQUUsZUFBZSxFQUFD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QUM7QUFHcEQsbUNBQW1DLG1CQUFtQjtJQUF0RDtRQUFtQyxlQUFtQjtRQUNwRCxVQUFLLEdBQWdCLElBQUksR0FBRyxFQUFVLENBQUM7SUFPekMsQ0FBQztJQU5DLFNBQVMsQ0FBQyxHQUFnQixFQUFFLE9BQVk7UUFDdEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pCLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNqQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztBQUNILENBQUM7QUFFRCwwQkFBMEIsS0FBZ0M7SUFDeEQsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBQ2IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJO1FBQ2hCLElBQUksUUFBUSxHQUNSLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUztZQUN4RSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzthQUMvQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNkLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakIsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLEdBQUcsQ0FBQztBQUNiLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBMaXN0V3JhcHBlcixcbiAgU3RyaW5nTWFwV3JhcHBlcixcbiAgU2V0V3JhcHBlcixcbiAgTWFwV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtSZWdFeHBXcmFwcGVyLCBpc1ByZXNlbnQsIFN0cmluZ1dyYXBwZXIsIGlzQmxhbmssIGlzQXJyYXl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0luamVjdGFibGUsIEluamVjdCwgT3BhcXVlVG9rZW4sIE9wdGlvbmFsfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7Q29uc29sZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY29uc29sZSc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1xuICBBU1QsXG4gIEludGVycG9sYXRpb24sXG4gIEFTVFdpdGhTb3VyY2UsXG4gIFRlbXBsYXRlQmluZGluZyxcbiAgUmVjdXJzaXZlQXN0VmlzaXRvcixcbiAgQmluZGluZ1BpcGVcbn0gZnJvbSAnLi9leHByZXNzaW9uX3BhcnNlci9hc3QnO1xuaW1wb3J0IHtQYXJzZXJ9IGZyb20gJy4vZXhwcmVzc2lvbl9wYXJzZXIvcGFyc2VyJztcbmltcG9ydCB7XG4gIENvbXBpbGVUb2tlbk1hcCxcbiAgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICBDb21waWxlUGlwZU1ldGFkYXRhLFxuICBDb21waWxlTWV0YWRhdGFXaXRoVHlwZSxcbiAgQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEsXG4gIENvbXBpbGVUb2tlbk1ldGFkYXRhLFxuICBDb21waWxlVHlwZU1ldGFkYXRhXG59IGZyb20gJy4vY29tcGlsZV9tZXRhZGF0YSc7XG5pbXBvcnQge0h0bWxQYXJzZXJ9IGZyb20gJy4vaHRtbF9wYXJzZXInO1xuaW1wb3J0IHtzcGxpdE5zTmFtZSwgbWVyZ2VOc0FuZE5hbWV9IGZyb20gJy4vaHRtbF90YWdzJztcbmltcG9ydCB7UGFyc2VTb3VyY2VTcGFuLCBQYXJzZUVycm9yLCBQYXJzZUxvY2F0aW9uLCBQYXJzZUVycm9yTGV2ZWx9IGZyb20gJy4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge01BWF9JTlRFUlBPTEFUSU9OX1ZBTFVFU30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfdXRpbHMnO1xuXG5pbXBvcnQge1xuICBFbGVtZW50QXN0LFxuICBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCxcbiAgQm91bmRFdmVudEFzdCxcbiAgUmVmZXJlbmNlQXN0LFxuICBUZW1wbGF0ZUFzdCxcbiAgVGVtcGxhdGVBc3RWaXNpdG9yLFxuICB0ZW1wbGF0ZVZpc2l0QWxsLFxuICBUZXh0QXN0LFxuICBCb3VuZFRleHRBc3QsXG4gIEVtYmVkZGVkVGVtcGxhdGVBc3QsXG4gIEF0dHJBc3QsXG4gIE5nQ29udGVudEFzdCxcbiAgUHJvcGVydHlCaW5kaW5nVHlwZSxcbiAgRGlyZWN0aXZlQXN0LFxuICBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0LFxuICBQcm92aWRlckFzdCxcbiAgUHJvdmlkZXJBc3RUeXBlLFxuICBWYXJpYWJsZUFzdFxufSBmcm9tICcuL3RlbXBsYXRlX2FzdCc7XG5pbXBvcnQge0Nzc1NlbGVjdG9yLCBTZWxlY3Rvck1hdGNoZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9zZWxlY3Rvcic7XG5cbmltcG9ydCB7RWxlbWVudFNjaGVtYVJlZ2lzdHJ5fSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvc2NoZW1hL2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5JztcbmltcG9ydCB7cHJlcGFyc2VFbGVtZW50LCBQcmVwYXJzZWRFbGVtZW50LCBQcmVwYXJzZWRFbGVtZW50VHlwZX0gZnJvbSAnLi90ZW1wbGF0ZV9wcmVwYXJzZXInO1xuXG5pbXBvcnQge2lzU3R5bGVVcmxSZXNvbHZhYmxlfSBmcm9tICcuL3N0eWxlX3VybF9yZXNvbHZlcic7XG5cbmltcG9ydCB7XG4gIEh0bWxBc3RWaXNpdG9yLFxuICBIdG1sQXN0LFxuICBIdG1sRWxlbWVudEFzdCxcbiAgSHRtbEF0dHJBc3QsXG4gIEh0bWxUZXh0QXN0LFxuICBIdG1sQ29tbWVudEFzdCxcbiAgSHRtbEV4cGFuc2lvbkFzdCxcbiAgSHRtbEV4cGFuc2lvbkNhc2VBc3QsXG4gIGh0bWxWaXNpdEFsbFxufSBmcm9tICcuL2h0bWxfYXN0JztcblxuaW1wb3J0IHtzcGxpdEF0Q29sb259IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQge2lkZW50aWZpZXJUb2tlbiwgSWRlbnRpZmllcnN9IGZyb20gJy4vaWRlbnRpZmllcnMnO1xuXG5pbXBvcnQge1Byb3ZpZGVyRWxlbWVudENvbnRleHQsIFByb3ZpZGVyVmlld0NvbnRleHR9IGZyb20gJy4vcHJvdmlkZXJfcGFyc2VyJztcblxuLy8gR3JvdXAgMSA9IFwiYmluZC1cIlxuLy8gR3JvdXAgMiA9IFwidmFyLVwiXG4vLyBHcm91cCAzID0gXCJsZXQtXCJcbi8vIEdyb3VwIDQgPSBcInJlZi0vI1wiXG4vLyBHcm91cCA1ID0gXCJvbi1cIlxuLy8gR3JvdXAgNiA9IFwiYmluZG9uLVwiXG4vLyBHcm91cCA3ID0gdGhlIGlkZW50aWZpZXIgYWZ0ZXIgXCJiaW5kLVwiLCBcInZhci0vI1wiLCBvciBcIm9uLVwiXG4vLyBHcm91cCA4ID0gaWRlbnRpZmllciBpbnNpZGUgWygpXVxuLy8gR3JvdXAgOSA9IGlkZW50aWZpZXIgaW5zaWRlIFtdXG4vLyBHcm91cCAxMCA9IGlkZW50aWZpZXIgaW5zaWRlICgpXG52YXIgQklORF9OQU1FX1JFR0VYUCA9XG4gICAgL14oPzooPzooPzooYmluZC0pfCh2YXItKXwobGV0LSl8KHJlZi18Iyl8KG9uLSl8KGJpbmRvbi0pKSguKykpfFxcW1xcKChbXlxcKV0rKVxcKVxcXXxcXFsoW15cXF1dKylcXF18XFwoKFteXFwpXSspXFwpKSQvZztcblxuY29uc3QgVEVNUExBVEVfRUxFTUVOVCA9ICd0ZW1wbGF0ZSc7XG5jb25zdCBURU1QTEFURV9BVFRSID0gJ3RlbXBsYXRlJztcbmNvbnN0IFRFTVBMQVRFX0FUVFJfUFJFRklYID0gJyonO1xuY29uc3QgQ0xBU1NfQVRUUiA9ICdjbGFzcyc7XG5cbnZhciBQUk9QRVJUWV9QQVJUU19TRVBBUkFUT1IgPSAnLic7XG5jb25zdCBBVFRSSUJVVEVfUFJFRklYID0gJ2F0dHInO1xuY29uc3QgQ0xBU1NfUFJFRklYID0gJ2NsYXNzJztcbmNvbnN0IFNUWUxFX1BSRUZJWCA9ICdzdHlsZSc7XG5cbnZhciBURVhUX0NTU19TRUxFQ1RPUiA9IENzc1NlbGVjdG9yLnBhcnNlKCcqJylbMF07XG5cbi8qKlxuICogUHJvdmlkZXMgYW4gYXJyYXkgb2Yge0BsaW5rIFRlbXBsYXRlQXN0VmlzaXRvcn1zIHdoaWNoIHdpbGwgYmUgdXNlZCB0byB0cmFuc2Zvcm1cbiAqIHBhcnNlZCB0ZW1wbGF0ZXMgYmVmb3JlIGNvbXBpbGF0aW9uIGlzIGludm9rZWQsIGFsbG93aW5nIGN1c3RvbSBleHByZXNzaW9uIHN5bnRheFxuICogYW5kIG90aGVyIGFkdmFuY2VkIHRyYW5zZm9ybWF0aW9ucy5cbiAqXG4gKiBUaGlzIGlzIGN1cnJlbnRseSBhbiBpbnRlcm5hbC1vbmx5IGZlYXR1cmUgYW5kIG5vdCBtZWFudCBmb3IgZ2VuZXJhbCB1c2UuXG4gKi9cbmV4cG9ydCBjb25zdCBURU1QTEFURV9UUkFOU0ZPUk1TID0gQ09OU1RfRVhQUihuZXcgT3BhcXVlVG9rZW4oJ1RlbXBsYXRlVHJhbnNmb3JtcycpKTtcblxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlUGFyc2VFcnJvciBleHRlbmRzIFBhcnNlRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIHNwYW46IFBhcnNlU291cmNlU3BhbiwgbGV2ZWw6IFBhcnNlRXJyb3JMZXZlbCkge1xuICAgIHN1cGVyKHNwYW4sIG1lc3NhZ2UsIGxldmVsKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVQYXJzZVJlc3VsdCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0ZW1wbGF0ZUFzdD86IFRlbXBsYXRlQXN0W10sIHB1YmxpYyBlcnJvcnM/OiBQYXJzZUVycm9yW10pIHt9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZVBhcnNlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2V4cHJQYXJzZXI6IFBhcnNlciwgcHJpdmF0ZSBfc2NoZW1hUmVnaXN0cnk6IEVsZW1lbnRTY2hlbWFSZWdpc3RyeSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfaHRtbFBhcnNlcjogSHRtbFBhcnNlciwgcHJpdmF0ZSBfY29uc29sZTogQ29uc29sZSxcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChURU1QTEFURV9UUkFOU0ZPUk1TKSBwdWJsaWMgdHJhbnNmb3JtczogVGVtcGxhdGVBc3RWaXNpdG9yW10pIHt9XG5cbiAgcGFyc2UoY29tcG9uZW50OiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsIHRlbXBsYXRlOiBzdHJpbmcsXG4gICAgICAgIGRpcmVjdGl2ZXM6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YVtdLCBwaXBlczogQ29tcGlsZVBpcGVNZXRhZGF0YVtdLFxuICAgICAgICB0ZW1wbGF0ZVVybDogc3RyaW5nKTogVGVtcGxhdGVBc3RbXSB7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMudHJ5UGFyc2UoY29tcG9uZW50LCB0ZW1wbGF0ZSwgZGlyZWN0aXZlcywgcGlwZXMsIHRlbXBsYXRlVXJsKTtcbiAgICB2YXIgd2FybmluZ3MgPSByZXN1bHQuZXJyb3JzLmZpbHRlcihlcnJvciA9PiBlcnJvci5sZXZlbCA9PT0gUGFyc2VFcnJvckxldmVsLldBUk5JTkcpO1xuICAgIHZhciBlcnJvcnMgPSByZXN1bHQuZXJyb3JzLmZpbHRlcihlcnJvciA9PiBlcnJvci5sZXZlbCA9PT0gUGFyc2VFcnJvckxldmVsLkZBVEFMKTtcbiAgICBpZiAod2FybmluZ3MubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5fY29uc29sZS53YXJuKGBUZW1wbGF0ZSBwYXJzZSB3YXJuaW5nczpcXG4ke3dhcm5pbmdzLmpvaW4oJ1xcbicpfWApO1xuICAgIH1cbiAgICBpZiAoZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBlcnJvclN0cmluZyA9IGVycm9ycy5qb2luKCdcXG4nKTtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBUZW1wbGF0ZSBwYXJzZSBlcnJvcnM6XFxuJHtlcnJvclN0cmluZ31gKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdC50ZW1wbGF0ZUFzdDtcbiAgfVxuXG4gIHRyeVBhcnNlKGNvbXBvbmVudDogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCB0ZW1wbGF0ZTogc3RyaW5nLFxuICAgICAgICAgICBkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSwgcGlwZXM6IENvbXBpbGVQaXBlTWV0YWRhdGFbXSxcbiAgICAgICAgICAgdGVtcGxhdGVVcmw6IHN0cmluZyk6IFRlbXBsYXRlUGFyc2VSZXN1bHQge1xuICAgIHZhciBodG1sQXN0V2l0aEVycm9ycyA9IHRoaXMuX2h0bWxQYXJzZXIucGFyc2UodGVtcGxhdGUsIHRlbXBsYXRlVXJsKTtcbiAgICB2YXIgZXJyb3JzOiBQYXJzZUVycm9yW10gPSBodG1sQXN0V2l0aEVycm9ycy5lcnJvcnM7XG4gICAgdmFyIHJlc3VsdDtcbiAgICBpZiAoaHRtbEFzdFdpdGhFcnJvcnMucm9vdE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciB1bmlxRGlyZWN0aXZlcyA9IDxDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXT5yZW1vdmVEdXBsaWNhdGVzKGRpcmVjdGl2ZXMpO1xuICAgICAgdmFyIHVuaXFQaXBlcyA9IDxDb21waWxlUGlwZU1ldGFkYXRhW10+cmVtb3ZlRHVwbGljYXRlcyhwaXBlcyk7XG4gICAgICB2YXIgcHJvdmlkZXJWaWV3Q29udGV4dCA9XG4gICAgICAgICAgbmV3IFByb3ZpZGVyVmlld0NvbnRleHQoY29tcG9uZW50LCBodG1sQXN0V2l0aEVycm9ycy5yb290Tm9kZXNbMF0uc291cmNlU3Bhbik7XG4gICAgICB2YXIgcGFyc2VWaXNpdG9yID0gbmV3IFRlbXBsYXRlUGFyc2VWaXNpdG9yKHByb3ZpZGVyVmlld0NvbnRleHQsIHVuaXFEaXJlY3RpdmVzLCB1bmlxUGlwZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2V4cHJQYXJzZXIsIHRoaXMuX3NjaGVtYVJlZ2lzdHJ5KTtcblxuICAgICAgcmVzdWx0ID0gaHRtbFZpc2l0QWxsKHBhcnNlVmlzaXRvciwgaHRtbEFzdFdpdGhFcnJvcnMucm9vdE5vZGVzLCBFTVBUWV9FTEVNRU5UX0NPTlRFWFQpO1xuICAgICAgZXJyb3JzID0gZXJyb3JzLmNvbmNhdChwYXJzZVZpc2l0b3IuZXJyb3JzKS5jb25jYXQocHJvdmlkZXJWaWV3Q29udGV4dC5lcnJvcnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgPSBbXTtcbiAgICB9XG4gICAgaWYgKGVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gbmV3IFRlbXBsYXRlUGFyc2VSZXN1bHQocmVzdWx0LCBlcnJvcnMpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMudHJhbnNmb3JtcykpIHtcbiAgICAgIHRoaXMudHJhbnNmb3Jtcy5mb3JFYWNoKFxuICAgICAgICAgICh0cmFuc2Zvcm06IFRlbXBsYXRlQXN0VmlzaXRvcikgPT4geyByZXN1bHQgPSB0ZW1wbGF0ZVZpc2l0QWxsKHRyYW5zZm9ybSwgcmVzdWx0KTsgfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVtcGxhdGVQYXJzZVJlc3VsdChyZXN1bHQsIGVycm9ycyk7XG4gIH1cbn1cblxuY2xhc3MgVGVtcGxhdGVQYXJzZVZpc2l0b3IgaW1wbGVtZW50cyBIdG1sQXN0VmlzaXRvciB7XG4gIHNlbGVjdG9yTWF0Y2hlcjogU2VsZWN0b3JNYXRjaGVyO1xuICBlcnJvcnM6IFRlbXBsYXRlUGFyc2VFcnJvcltdID0gW107XG4gIGRpcmVjdGl2ZXNJbmRleCA9IG5ldyBNYXA8Q29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCBudW1iZXI+KCk7XG4gIG5nQ29udGVudENvdW50OiBudW1iZXIgPSAwO1xuICBwaXBlc0J5TmFtZTogTWFwPHN0cmluZywgQ29tcGlsZVBpcGVNZXRhZGF0YT47XG5cbiAgY29uc3RydWN0b3IocHVibGljIHByb3ZpZGVyVmlld0NvbnRleHQ6IFByb3ZpZGVyVmlld0NvbnRleHQsXG4gICAgICAgICAgICAgIGRpcmVjdGl2ZXM6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YVtdLCBwaXBlczogQ29tcGlsZVBpcGVNZXRhZGF0YVtdLFxuICAgICAgICAgICAgICBwcml2YXRlIF9leHByUGFyc2VyOiBQYXJzZXIsIHByaXZhdGUgX3NjaGVtYVJlZ2lzdHJ5OiBFbGVtZW50U2NoZW1hUmVnaXN0cnkpIHtcbiAgICB0aGlzLnNlbGVjdG9yTWF0Y2hlciA9IG5ldyBTZWxlY3Rvck1hdGNoZXIoKTtcbiAgICBMaXN0V3JhcHBlci5mb3JFYWNoV2l0aEluZGV4KGRpcmVjdGl2ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZGlyZWN0aXZlOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdG9yID0gQ3NzU2VsZWN0b3IucGFyc2UoZGlyZWN0aXZlLnNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rvck1hdGNoZXIuYWRkU2VsZWN0YWJsZXMoc2VsZWN0b3IsIGRpcmVjdGl2ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlc0luZGV4LnNldChkaXJlY3RpdmUsIGluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgIHRoaXMucGlwZXNCeU5hbWUgPSBuZXcgTWFwPHN0cmluZywgQ29tcGlsZVBpcGVNZXRhZGF0YT4oKTtcbiAgICBwaXBlcy5mb3JFYWNoKHBpcGUgPT4gdGhpcy5waXBlc0J5TmFtZS5zZXQocGlwZS5uYW1lLCBwaXBlKSk7XG4gIH1cblxuICBwcml2YXRlIF9yZXBvcnRFcnJvcihtZXNzYWdlOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgbGV2ZWw6IFBhcnNlRXJyb3JMZXZlbCA9IFBhcnNlRXJyb3JMZXZlbC5GQVRBTCkge1xuICAgIHRoaXMuZXJyb3JzLnB1c2gobmV3IFRlbXBsYXRlUGFyc2VFcnJvcihtZXNzYWdlLCBzb3VyY2VTcGFuLCBsZXZlbCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VJbnRlcnBvbGF0aW9uKHZhbHVlOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbik6IEFTVFdpdGhTb3VyY2Uge1xuICAgIHZhciBzb3VyY2VJbmZvID0gc291cmNlU3Bhbi5zdGFydC50b1N0cmluZygpO1xuICAgIHRyeSB7XG4gICAgICB2YXIgYXN0ID0gdGhpcy5fZXhwclBhcnNlci5wYXJzZUludGVycG9sYXRpb24odmFsdWUsIHNvdXJjZUluZm8pO1xuICAgICAgdGhpcy5fY2hlY2tQaXBlcyhhc3QsIHNvdXJjZVNwYW4pO1xuICAgICAgaWYgKGlzUHJlc2VudChhc3QpICYmXG4gICAgICAgICAgKDxJbnRlcnBvbGF0aW9uPmFzdC5hc3QpLmV4cHJlc3Npb25zLmxlbmd0aCA+IE1BWF9JTlRFUlBPTEFUSU9OX1ZBTFVFUykge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgIGBPbmx5IHN1cHBvcnQgYXQgbW9zdCAke01BWF9JTlRFUlBPTEFUSU9OX1ZBTFVFU30gaW50ZXJwb2xhdGlvbiB2YWx1ZXMhYCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYXN0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGAke2V9YCwgc291cmNlU3Bhbik7XG4gICAgICByZXR1cm4gdGhpcy5fZXhwclBhcnNlci53cmFwTGl0ZXJhbFByaW1pdGl2ZSgnRVJST1InLCBzb3VyY2VJbmZvKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUFjdGlvbih2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOiBBU1RXaXRoU291cmNlIHtcbiAgICB2YXIgc291cmNlSW5mbyA9IHNvdXJjZVNwYW4uc3RhcnQudG9TdHJpbmcoKTtcbiAgICB0cnkge1xuICAgICAgdmFyIGFzdCA9IHRoaXMuX2V4cHJQYXJzZXIucGFyc2VBY3Rpb24odmFsdWUsIHNvdXJjZUluZm8pO1xuICAgICAgdGhpcy5fY2hlY2tQaXBlcyhhc3QsIHNvdXJjZVNwYW4pO1xuICAgICAgcmV0dXJuIGFzdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihgJHtlfWAsIHNvdXJjZVNwYW4pO1xuICAgICAgcmV0dXJuIHRoaXMuX2V4cHJQYXJzZXIud3JhcExpdGVyYWxQcmltaXRpdmUoJ0VSUk9SJywgc291cmNlSW5mbyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VCaW5kaW5nKHZhbHVlOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbik6IEFTVFdpdGhTb3VyY2Uge1xuICAgIHZhciBzb3VyY2VJbmZvID0gc291cmNlU3Bhbi5zdGFydC50b1N0cmluZygpO1xuICAgIHRyeSB7XG4gICAgICB2YXIgYXN0ID0gdGhpcy5fZXhwclBhcnNlci5wYXJzZUJpbmRpbmcodmFsdWUsIHNvdXJjZUluZm8pO1xuICAgICAgdGhpcy5fY2hlY2tQaXBlcyhhc3QsIHNvdXJjZVNwYW4pO1xuICAgICAgcmV0dXJuIGFzdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihgJHtlfWAsIHNvdXJjZVNwYW4pO1xuICAgICAgcmV0dXJuIHRoaXMuX2V4cHJQYXJzZXIud3JhcExpdGVyYWxQcmltaXRpdmUoJ0VSUk9SJywgc291cmNlSW5mbyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VUZW1wbGF0ZUJpbmRpbmdzKHZhbHVlOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbik6IFRlbXBsYXRlQmluZGluZ1tdIHtcbiAgICB2YXIgc291cmNlSW5mbyA9IHNvdXJjZVNwYW4uc3RhcnQudG9TdHJpbmcoKTtcbiAgICB0cnkge1xuICAgICAgdmFyIGJpbmRpbmdzUmVzdWx0ID0gdGhpcy5fZXhwclBhcnNlci5wYXJzZVRlbXBsYXRlQmluZGluZ3ModmFsdWUsIHNvdXJjZUluZm8pO1xuICAgICAgYmluZGluZ3NSZXN1bHQudGVtcGxhdGVCaW5kaW5ncy5mb3JFYWNoKChiaW5kaW5nKSA9PiB7XG4gICAgICAgIGlmIChpc1ByZXNlbnQoYmluZGluZy5leHByZXNzaW9uKSkge1xuICAgICAgICAgIHRoaXMuX2NoZWNrUGlwZXMoYmluZGluZy5leHByZXNzaW9uLCBzb3VyY2VTcGFuKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBiaW5kaW5nc1Jlc3VsdC53YXJuaW5ncy5mb3JFYWNoKFxuICAgICAgICAgICh3YXJuaW5nKSA9PiB7IHRoaXMuX3JlcG9ydEVycm9yKHdhcm5pbmcsIHNvdXJjZVNwYW4sIFBhcnNlRXJyb3JMZXZlbC5XQVJOSU5HKTsgfSk7XG4gICAgICByZXR1cm4gYmluZGluZ3NSZXN1bHQudGVtcGxhdGVCaW5kaW5ncztcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihgJHtlfWAsIHNvdXJjZVNwYW4pO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NoZWNrUGlwZXMoYXN0OiBBU1RXaXRoU291cmNlLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHtcbiAgICBpZiAoaXNQcmVzZW50KGFzdCkpIHtcbiAgICAgIHZhciBjb2xsZWN0b3IgPSBuZXcgUGlwZUNvbGxlY3RvcigpO1xuICAgICAgYXN0LnZpc2l0KGNvbGxlY3Rvcik7XG4gICAgICBjb2xsZWN0b3IucGlwZXMuZm9yRWFjaCgocGlwZU5hbWUpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnBpcGVzQnlOYW1lLmhhcyhwaXBlTmFtZSkpIHtcbiAgICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihgVGhlIHBpcGUgJyR7cGlwZU5hbWV9JyBjb3VsZCBub3QgYmUgZm91bmRgLCBzb3VyY2VTcGFuKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRFeHBhbnNpb24oYXN0OiBIdG1sRXhwYW5zaW9uQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuXG4gIHZpc2l0RXhwYW5zaW9uQ2FzZShhc3Q6IEh0bWxFeHBhbnNpb25DYXNlQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuXG4gIHZpc2l0VGV4dChhc3Q6IEh0bWxUZXh0QXN0LCBwYXJlbnQ6IEVsZW1lbnRDb250ZXh0KTogYW55IHtcbiAgICB2YXIgbmdDb250ZW50SW5kZXggPSBwYXJlbnQuZmluZE5nQ29udGVudEluZGV4KFRFWFRfQ1NTX1NFTEVDVE9SKTtcbiAgICB2YXIgZXhwciA9IHRoaXMuX3BhcnNlSW50ZXJwb2xhdGlvbihhc3QudmFsdWUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICBpZiAoaXNQcmVzZW50KGV4cHIpKSB7XG4gICAgICByZXR1cm4gbmV3IEJvdW5kVGV4dEFzdChleHByLCBuZ0NvbnRlbnRJbmRleCwgYXN0LnNvdXJjZVNwYW4pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFRleHRBc3QoYXN0LnZhbHVlLCBuZ0NvbnRlbnRJbmRleCwgYXN0LnNvdXJjZVNwYW4pO1xuICAgIH1cbiAgfVxuXG4gIHZpc2l0QXR0cihhc3Q6IEh0bWxBdHRyQXN0LCBjb250ZXg6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIG5ldyBBdHRyQXN0KGFzdC5uYW1lLCBhc3QudmFsdWUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHZpc2l0Q29tbWVudChhc3Q6IEh0bWxDb21tZW50QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuXG4gIHZpc2l0RWxlbWVudChlbGVtZW50OiBIdG1sRWxlbWVudEFzdCwgcGFyZW50OiBFbGVtZW50Q29udGV4dCk6IGFueSB7XG4gICAgdmFyIG5vZGVOYW1lID0gZWxlbWVudC5uYW1lO1xuICAgIHZhciBwcmVwYXJzZWRFbGVtZW50ID0gcHJlcGFyc2VFbGVtZW50KGVsZW1lbnQpO1xuICAgIGlmIChwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNDUklQVCB8fFxuICAgICAgICBwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNUWUxFKSB7XG4gICAgICAvLyBTa2lwcGluZyA8c2NyaXB0PiBmb3Igc2VjdXJpdHkgcmVhc29uc1xuICAgICAgLy8gU2tpcHBpbmcgPHN0eWxlPiBhcyB3ZSBhbHJlYWR5IHByb2Nlc3NlZCB0aGVtXG4gICAgICAvLyBpbiB0aGUgU3R5bGVDb21waWxlclxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNUWUxFU0hFRVQgJiZcbiAgICAgICAgaXNTdHlsZVVybFJlc29sdmFibGUocHJlcGFyc2VkRWxlbWVudC5ocmVmQXR0cikpIHtcbiAgICAgIC8vIFNraXBwaW5nIHN0eWxlc2hlZXRzIHdpdGggZWl0aGVyIHJlbGF0aXZlIHVybHMgb3IgcGFja2FnZSBzY2hlbWUgYXMgd2UgYWxyZWFkeSBwcm9jZXNzZWRcbiAgICAgIC8vIHRoZW0gaW4gdGhlIFN0eWxlQ29tcGlsZXJcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBtYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSA9IFtdO1xuICAgIHZhciBlbGVtZW50T3JEaXJlY3RpdmVQcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdID0gW107XG4gICAgdmFyIGVsZW1lbnRPckRpcmVjdGl2ZVJlZnM6IEVsZW1lbnRPckRpcmVjdGl2ZVJlZltdID0gW107XG4gICAgdmFyIGVsZW1lbnRWYXJzOiBWYXJpYWJsZUFzdFtdID0gW107XG4gICAgdmFyIGV2ZW50czogQm91bmRFdmVudEFzdFtdID0gW107XG5cbiAgICB2YXIgdGVtcGxhdGVFbGVtZW50T3JEaXJlY3RpdmVQcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdID0gW107XG4gICAgdmFyIHRlbXBsYXRlTWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10gPSBbXTtcbiAgICB2YXIgdGVtcGxhdGVFbGVtZW50VmFyczogVmFyaWFibGVBc3RbXSA9IFtdO1xuXG4gICAgdmFyIGhhc0lubGluZVRlbXBsYXRlcyA9IGZhbHNlO1xuICAgIHZhciBhdHRycyA9IFtdO1xuICAgIHZhciBsY0VsTmFtZSA9IHNwbGl0TnNOYW1lKG5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpWzFdO1xuICAgIHZhciBpc1RlbXBsYXRlRWxlbWVudCA9IGxjRWxOYW1lID09IFRFTVBMQVRFX0VMRU1FTlQ7XG5cbiAgICBlbGVtZW50LmF0dHJzLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICB2YXIgaGFzQmluZGluZyA9XG4gICAgICAgICAgdGhpcy5fcGFyc2VBdHRyKGlzVGVtcGxhdGVFbGVtZW50LCBhdHRyLCBtYXRjaGFibGVBdHRycywgZWxlbWVudE9yRGlyZWN0aXZlUHJvcHMsIGV2ZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudE9yRGlyZWN0aXZlUmVmcywgZWxlbWVudFZhcnMpO1xuICAgICAgdmFyIGhhc1RlbXBsYXRlQmluZGluZyA9IHRoaXMuX3BhcnNlSW5saW5lVGVtcGxhdGVCaW5kaW5nKFxuICAgICAgICAgIGF0dHIsIHRlbXBsYXRlTWF0Y2hhYmxlQXR0cnMsIHRlbXBsYXRlRWxlbWVudE9yRGlyZWN0aXZlUHJvcHMsIHRlbXBsYXRlRWxlbWVudFZhcnMpO1xuICAgICAgaWYgKCFoYXNCaW5kaW5nICYmICFoYXNUZW1wbGF0ZUJpbmRpbmcpIHtcbiAgICAgICAgLy8gZG9uJ3QgaW5jbHVkZSB0aGUgYmluZGluZ3MgYXMgYXR0cmlidXRlcyBhcyB3ZWxsIGluIHRoZSBBU1RcbiAgICAgICAgYXR0cnMucHVzaCh0aGlzLnZpc2l0QXR0cihhdHRyLCBudWxsKSk7XG4gICAgICAgIG1hdGNoYWJsZUF0dHJzLnB1c2goW2F0dHIubmFtZSwgYXR0ci52YWx1ZV0pO1xuICAgICAgfVxuICAgICAgaWYgKGhhc1RlbXBsYXRlQmluZGluZykge1xuICAgICAgICBoYXNJbmxpbmVUZW1wbGF0ZXMgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIGVsZW1lbnRDc3NTZWxlY3RvciA9IGNyZWF0ZUVsZW1lbnRDc3NTZWxlY3Rvcihub2RlTmFtZSwgbWF0Y2hhYmxlQXR0cnMpO1xuICAgIHZhciBkaXJlY3RpdmVNZXRhcyA9IHRoaXMuX3BhcnNlRGlyZWN0aXZlcyh0aGlzLnNlbGVjdG9yTWF0Y2hlciwgZWxlbWVudENzc1NlbGVjdG9yKTtcbiAgICB2YXIgcmVmZXJlbmNlczogUmVmZXJlbmNlQXN0W10gPSBbXTtcbiAgICB2YXIgZGlyZWN0aXZlQXN0cyA9IHRoaXMuX2NyZWF0ZURpcmVjdGl2ZUFzdHMoaXNUZW1wbGF0ZUVsZW1lbnQsIGVsZW1lbnQubmFtZSwgZGlyZWN0aXZlTWV0YXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRPckRpcmVjdGl2ZVByb3BzLCBlbGVtZW50T3JEaXJlY3RpdmVSZWZzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNvdXJjZVNwYW4sIHJlZmVyZW5jZXMpO1xuICAgIHZhciBlbGVtZW50UHJvcHM6IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0W10gPVxuICAgICAgICB0aGlzLl9jcmVhdGVFbGVtZW50UHJvcGVydHlBc3RzKGVsZW1lbnQubmFtZSwgZWxlbWVudE9yRGlyZWN0aXZlUHJvcHMsIGRpcmVjdGl2ZUFzdHMpO1xuICAgIHZhciBpc1ZpZXdSb290ID0gcGFyZW50LmlzVGVtcGxhdGVFbGVtZW50IHx8IGhhc0lubGluZVRlbXBsYXRlcztcbiAgICB2YXIgcHJvdmlkZXJDb250ZXh0ID1cbiAgICAgICAgbmV3IFByb3ZpZGVyRWxlbWVudENvbnRleHQodGhpcy5wcm92aWRlclZpZXdDb250ZXh0LCBwYXJlbnQucHJvdmlkZXJDb250ZXh0LCBpc1ZpZXdSb290LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmVBc3RzLCBhdHRycywgcmVmZXJlbmNlcywgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICB2YXIgY2hpbGRyZW4gPSBodG1sVmlzaXRBbGwoXG4gICAgICAgIHByZXBhcnNlZEVsZW1lbnQubm9uQmluZGFibGUgPyBOT05fQklOREFCTEVfVklTSVRPUiA6IHRoaXMsIGVsZW1lbnQuY2hpbGRyZW4sXG4gICAgICAgIEVsZW1lbnRDb250ZXh0LmNyZWF0ZShpc1RlbXBsYXRlRWxlbWVudCwgZGlyZWN0aXZlQXN0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzVGVtcGxhdGVFbGVtZW50ID8gcGFyZW50LnByb3ZpZGVyQ29udGV4dCA6IHByb3ZpZGVyQ29udGV4dCkpO1xuICAgIHByb3ZpZGVyQ29udGV4dC5hZnRlckVsZW1lbnQoKTtcbiAgICAvLyBPdmVycmlkZSB0aGUgYWN0dWFsIHNlbGVjdG9yIHdoZW4gdGhlIGBuZ1Byb2plY3RBc2AgYXR0cmlidXRlIGlzIHByb3ZpZGVkXG4gICAgdmFyIHByb2plY3Rpb25TZWxlY3RvciA9IGlzUHJlc2VudChwcmVwYXJzZWRFbGVtZW50LnByb2plY3RBcykgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ3NzU2VsZWN0b3IucGFyc2UocHJlcGFyc2VkRWxlbWVudC5wcm9qZWN0QXMpWzBdIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRDc3NTZWxlY3RvcjtcbiAgICB2YXIgbmdDb250ZW50SW5kZXggPSBwYXJlbnQuZmluZE5nQ29udGVudEluZGV4KHByb2plY3Rpb25TZWxlY3Rvcik7XG4gICAgdmFyIHBhcnNlZEVsZW1lbnQ7XG5cbiAgICBpZiAocHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5OR19DT05URU5UKSB7XG4gICAgICBpZiAoaXNQcmVzZW50KGVsZW1lbnQuY2hpbGRyZW4pICYmIGVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgIGA8bmctY29udGVudD4gZWxlbWVudCBjYW5ub3QgaGF2ZSBjb250ZW50LiA8bmctY29udGVudD4gbXVzdCBiZSBpbW1lZGlhdGVseSBmb2xsb3dlZCBieSA8L25nLWNvbnRlbnQ+YCxcbiAgICAgICAgICAgIGVsZW1lbnQuc291cmNlU3Bhbik7XG4gICAgICB9XG5cbiAgICAgIHBhcnNlZEVsZW1lbnQgPSBuZXcgTmdDb250ZW50QXN0KFxuICAgICAgICAgIHRoaXMubmdDb250ZW50Q291bnQrKywgaGFzSW5saW5lVGVtcGxhdGVzID8gbnVsbCA6IG5nQ29udGVudEluZGV4LCBlbGVtZW50LnNvdXJjZVNwYW4pO1xuICAgIH0gZWxzZSBpZiAoaXNUZW1wbGF0ZUVsZW1lbnQpIHtcbiAgICAgIHRoaXMuX2Fzc2VydEFsbEV2ZW50c1B1Ymxpc2hlZEJ5RGlyZWN0aXZlcyhkaXJlY3RpdmVBc3RzLCBldmVudHMpO1xuICAgICAgdGhpcy5fYXNzZXJ0Tm9Db21wb25lbnRzTm9yRWxlbWVudEJpbmRpbmdzT25UZW1wbGF0ZShkaXJlY3RpdmVBc3RzLCBlbGVtZW50UHJvcHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc291cmNlU3Bhbik7XG5cbiAgICAgIHBhcnNlZEVsZW1lbnQgPSBuZXcgRW1iZWRkZWRUZW1wbGF0ZUFzdChcbiAgICAgICAgICBhdHRycywgZXZlbnRzLCByZWZlcmVuY2VzLCBlbGVtZW50VmFycywgcHJvdmlkZXJDb250ZXh0LnRyYW5zZm9ybWVkRGlyZWN0aXZlQXN0cyxcbiAgICAgICAgICBwcm92aWRlckNvbnRleHQudHJhbnNmb3JtUHJvdmlkZXJzLCBwcm92aWRlckNvbnRleHQudHJhbnNmb3JtZWRIYXNWaWV3Q29udGFpbmVyLCBjaGlsZHJlbixcbiAgICAgICAgICBoYXNJbmxpbmVUZW1wbGF0ZXMgPyBudWxsIDogbmdDb250ZW50SW5kZXgsIGVsZW1lbnQuc291cmNlU3Bhbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2Fzc2VydE9ubHlPbmVDb21wb25lbnQoZGlyZWN0aXZlQXN0cywgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICAgIGxldCBuZ0NvbnRlbnRJbmRleCA9XG4gICAgICAgICAgaGFzSW5saW5lVGVtcGxhdGVzID8gbnVsbCA6IHBhcmVudC5maW5kTmdDb250ZW50SW5kZXgocHJvamVjdGlvblNlbGVjdG9yKTtcbiAgICAgIHBhcnNlZEVsZW1lbnQgPSBuZXcgRWxlbWVudEFzdChcbiAgICAgICAgICBub2RlTmFtZSwgYXR0cnMsIGVsZW1lbnRQcm9wcywgZXZlbnRzLCByZWZlcmVuY2VzLFxuICAgICAgICAgIHByb3ZpZGVyQ29udGV4dC50cmFuc2Zvcm1lZERpcmVjdGl2ZUFzdHMsIHByb3ZpZGVyQ29udGV4dC50cmFuc2Zvcm1Qcm92aWRlcnMsXG4gICAgICAgICAgcHJvdmlkZXJDb250ZXh0LnRyYW5zZm9ybWVkSGFzVmlld0NvbnRhaW5lciwgY2hpbGRyZW4sXG4gICAgICAgICAgaGFzSW5saW5lVGVtcGxhdGVzID8gbnVsbCA6IG5nQ29udGVudEluZGV4LCBlbGVtZW50LnNvdXJjZVNwYW4pO1xuICAgIH1cbiAgICBpZiAoaGFzSW5saW5lVGVtcGxhdGVzKSB7XG4gICAgICB2YXIgdGVtcGxhdGVDc3NTZWxlY3RvciA9IGNyZWF0ZUVsZW1lbnRDc3NTZWxlY3RvcihURU1QTEFURV9FTEVNRU5ULCB0ZW1wbGF0ZU1hdGNoYWJsZUF0dHJzKTtcbiAgICAgIHZhciB0ZW1wbGF0ZURpcmVjdGl2ZU1ldGFzID0gdGhpcy5fcGFyc2VEaXJlY3RpdmVzKHRoaXMuc2VsZWN0b3JNYXRjaGVyLCB0ZW1wbGF0ZUNzc1NlbGVjdG9yKTtcbiAgICAgIHZhciB0ZW1wbGF0ZURpcmVjdGl2ZUFzdHMgPVxuICAgICAgICAgIHRoaXMuX2NyZWF0ZURpcmVjdGl2ZUFzdHModHJ1ZSwgZWxlbWVudC5uYW1lLCB0ZW1wbGF0ZURpcmVjdGl2ZU1ldGFzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVFbGVtZW50T3JEaXJlY3RpdmVQcm9wcywgW10sIGVsZW1lbnQuc291cmNlU3BhbiwgW10pO1xuICAgICAgdmFyIHRlbXBsYXRlRWxlbWVudFByb3BzOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdID0gdGhpcy5fY3JlYXRlRWxlbWVudFByb3BlcnR5QXN0cyhcbiAgICAgICAgICBlbGVtZW50Lm5hbWUsIHRlbXBsYXRlRWxlbWVudE9yRGlyZWN0aXZlUHJvcHMsIHRlbXBsYXRlRGlyZWN0aXZlQXN0cyk7XG4gICAgICB0aGlzLl9hc3NlcnROb0NvbXBvbmVudHNOb3JFbGVtZW50QmluZGluZ3NPblRlbXBsYXRlKFxuICAgICAgICAgIHRlbXBsYXRlRGlyZWN0aXZlQXN0cywgdGVtcGxhdGVFbGVtZW50UHJvcHMsIGVsZW1lbnQuc291cmNlU3Bhbik7XG4gICAgICB2YXIgdGVtcGxhdGVQcm92aWRlckNvbnRleHQgPSBuZXcgUHJvdmlkZXJFbGVtZW50Q29udGV4dChcbiAgICAgICAgICB0aGlzLnByb3ZpZGVyVmlld0NvbnRleHQsIHBhcmVudC5wcm92aWRlckNvbnRleHQsIHBhcmVudC5pc1RlbXBsYXRlRWxlbWVudCxcbiAgICAgICAgICB0ZW1wbGF0ZURpcmVjdGl2ZUFzdHMsIFtdLCBbXSwgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICAgIHRlbXBsYXRlUHJvdmlkZXJDb250ZXh0LmFmdGVyRWxlbWVudCgpO1xuXG4gICAgICBwYXJzZWRFbGVtZW50ID0gbmV3IEVtYmVkZGVkVGVtcGxhdGVBc3QoW10sIFtdLCBbXSwgdGVtcGxhdGVFbGVtZW50VmFycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVByb3ZpZGVyQ29udGV4dC50cmFuc2Zvcm1lZERpcmVjdGl2ZUFzdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVQcm92aWRlckNvbnRleHQudHJhbnNmb3JtUHJvdmlkZXJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlUHJvdmlkZXJDb250ZXh0LnRyYW5zZm9ybWVkSGFzVmlld0NvbnRhaW5lcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbcGFyc2VkRWxlbWVudF0sIG5nQ29udGVudEluZGV4LCBlbGVtZW50LnNvdXJjZVNwYW4pO1xuICAgIH1cbiAgICByZXR1cm4gcGFyc2VkRWxlbWVudDtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlSW5saW5lVGVtcGxhdGVCaW5kaW5nKGF0dHI6IEh0bWxBdHRyQXN0LCB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvcHM6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHlbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0VmFyczogVmFyaWFibGVBc3RbXSk6IGJvb2xlYW4ge1xuICAgIHZhciB0ZW1wbGF0ZUJpbmRpbmdzU291cmNlID0gbnVsbDtcbiAgICBpZiAoYXR0ci5uYW1lID09IFRFTVBMQVRFX0FUVFIpIHtcbiAgICAgIHRlbXBsYXRlQmluZGluZ3NTb3VyY2UgPSBhdHRyLnZhbHVlO1xuICAgIH0gZWxzZSBpZiAoYXR0ci5uYW1lLnN0YXJ0c1dpdGgoVEVNUExBVEVfQVRUUl9QUkVGSVgpKSB7XG4gICAgICB2YXIga2V5ID0gYXR0ci5uYW1lLnN1YnN0cmluZyhURU1QTEFURV9BVFRSX1BSRUZJWC5sZW5ndGgpOyAgLy8gcmVtb3ZlIHRoZSBzdGFyXG4gICAgICB0ZW1wbGF0ZUJpbmRpbmdzU291cmNlID0gKGF0dHIudmFsdWUubGVuZ3RoID09IDApID8ga2V5IDoga2V5ICsgJyAnICsgYXR0ci52YWx1ZTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0ZW1wbGF0ZUJpbmRpbmdzU291cmNlKSkge1xuICAgICAgdmFyIGJpbmRpbmdzID0gdGhpcy5fcGFyc2VUZW1wbGF0ZUJpbmRpbmdzKHRlbXBsYXRlQmluZGluZ3NTb3VyY2UsIGF0dHIuc291cmNlU3Bhbik7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJpbmRpbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBiaW5kaW5nID0gYmluZGluZ3NbaV07XG4gICAgICAgIGlmIChiaW5kaW5nLmtleUlzVmFyKSB7XG4gICAgICAgICAgdGFyZ2V0VmFycy5wdXNoKG5ldyBWYXJpYWJsZUFzdChiaW5kaW5nLmtleSwgYmluZGluZy5uYW1lLCBhdHRyLnNvdXJjZVNwYW4pKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQoYmluZGluZy5leHByZXNzaW9uKSkge1xuICAgICAgICAgIHRoaXMuX3BhcnNlUHJvcGVydHlBc3QoYmluZGluZy5rZXksIGJpbmRpbmcuZXhwcmVzc2lvbiwgYXR0ci5zb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsIHRhcmdldFByb3BzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRycy5wdXNoKFtiaW5kaW5nLmtleSwgJyddKTtcbiAgICAgICAgICB0aGlzLl9wYXJzZUxpdGVyYWxBdHRyKGJpbmRpbmcua2V5LCBudWxsLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldFByb3BzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlQXR0cihpc1RlbXBsYXRlRWxlbWVudDogYm9vbGVhbiwgYXR0cjogSHRtbEF0dHJBc3QsXG4gICAgICAgICAgICAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSxcbiAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BzOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5W10sIHRhcmdldEV2ZW50czogQm91bmRFdmVudEFzdFtdLFxuICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UmVmczogRWxlbWVudE9yRGlyZWN0aXZlUmVmW10sIHRhcmdldFZhcnM6IFZhcmlhYmxlQXN0W10pOiBib29sZWFuIHtcbiAgICB2YXIgYXR0ck5hbWUgPSB0aGlzLl9ub3JtYWxpemVBdHRyaWJ1dGVOYW1lKGF0dHIubmFtZSk7XG4gICAgdmFyIGF0dHJWYWx1ZSA9IGF0dHIudmFsdWU7XG4gICAgdmFyIGJpbmRQYXJ0cyA9IFJlZ0V4cFdyYXBwZXIuZmlyc3RNYXRjaChCSU5EX05BTUVfUkVHRVhQLCBhdHRyTmFtZSk7XG4gICAgdmFyIGhhc0JpbmRpbmcgPSBmYWxzZTtcbiAgICBpZiAoaXNQcmVzZW50KGJpbmRQYXJ0cykpIHtcbiAgICAgIGhhc0JpbmRpbmcgPSB0cnVlO1xuICAgICAgaWYgKGlzUHJlc2VudChiaW5kUGFydHNbMV0pKSB7ICAvLyBtYXRjaDogYmluZC1wcm9wXG4gICAgICAgIHRoaXMuX3BhcnNlUHJvcGVydHkoYmluZFBhcnRzWzddLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvcHMpO1xuXG4gICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChiaW5kUGFydHNbMl0pKSB7ICAvLyBtYXRjaDogdmFyLW5hbWUgLyB2YXItbmFtZT1cImlkZW5cIlxuICAgICAgICB2YXIgaWRlbnRpZmllciA9IGJpbmRQYXJ0c1s3XTtcbiAgICAgICAgaWYgKGlzVGVtcGxhdGVFbGVtZW50KSB7XG4gICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYFwidmFyLVwiIG9uIDx0ZW1wbGF0ZT4gZWxlbWVudHMgaXMgZGVwcmVjYXRlZC4gVXNlIFwibGV0LVwiIGluc3RlYWQhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyLnNvdXJjZVNwYW4sIFBhcnNlRXJyb3JMZXZlbC5XQVJOSU5HKTtcbiAgICAgICAgICB0aGlzLl9wYXJzZVZhcmlhYmxlKGlkZW50aWZpZXIsIGF0dHJWYWx1ZSwgYXR0ci5zb3VyY2VTcGFuLCB0YXJnZXRWYXJzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihgXCJ2YXItXCIgb24gbm9uIDx0ZW1wbGF0ZT4gZWxlbWVudHMgaXMgZGVwcmVjYXRlZC4gVXNlIFwicmVmLVwiIGluc3RlYWQhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyLnNvdXJjZVNwYW4sIFBhcnNlRXJyb3JMZXZlbC5XQVJOSU5HKTtcbiAgICAgICAgICB0aGlzLl9wYXJzZVJlZmVyZW5jZShpZGVudGlmaWVyLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0UmVmcyk7XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQoYmluZFBhcnRzWzNdKSkgeyAgLy8gbWF0Y2g6IGxldC1uYW1lXG4gICAgICAgIGlmIChpc1RlbXBsYXRlRWxlbWVudCkge1xuICAgICAgICAgIHZhciBpZGVudGlmaWVyID0gYmluZFBhcnRzWzddO1xuICAgICAgICAgIHRoaXMuX3BhcnNlVmFyaWFibGUoaWRlbnRpZmllciwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldFZhcnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGBcImxldC1cIiBpcyBvbmx5IHN1cHBvcnRlZCBvbiB0ZW1wbGF0ZSBlbGVtZW50cy5gLCBhdHRyLnNvdXJjZVNwYW4pO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGJpbmRQYXJ0c1s0XSkpIHsgIC8vIG1hdGNoOiByZWYtIC8gI2lkZW5cbiAgICAgICAgdmFyIGlkZW50aWZpZXIgPSBiaW5kUGFydHNbN107XG4gICAgICAgIHRoaXMuX3BhcnNlUmVmZXJlbmNlKGlkZW50aWZpZXIsIGF0dHJWYWx1ZSwgYXR0ci5zb3VyY2VTcGFuLCB0YXJnZXRSZWZzKTtcblxuICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQoYmluZFBhcnRzWzVdKSkgeyAgLy8gbWF0Y2g6IG9uLWV2ZW50XG4gICAgICAgIHRoaXMuX3BhcnNlRXZlbnQoYmluZFBhcnRzWzddLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0RXZlbnRzKTtcblxuICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQoYmluZFBhcnRzWzZdKSkgeyAgLy8gbWF0Y2g6IGJpbmRvbi1wcm9wXG4gICAgICAgIHRoaXMuX3BhcnNlUHJvcGVydHkoYmluZFBhcnRzWzddLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvcHMpO1xuICAgICAgICB0aGlzLl9wYXJzZUFzc2lnbm1lbnRFdmVudChiaW5kUGFydHNbN10sIGF0dHJWYWx1ZSwgYXR0ci5zb3VyY2VTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0RXZlbnRzKTtcblxuICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQoYmluZFBhcnRzWzhdKSkgeyAgLy8gbWF0Y2g6IFsoZXhwcildXG4gICAgICAgIHRoaXMuX3BhcnNlUHJvcGVydHkoYmluZFBhcnRzWzhdLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvcHMpO1xuICAgICAgICB0aGlzLl9wYXJzZUFzc2lnbm1lbnRFdmVudChiaW5kUGFydHNbOF0sIGF0dHJWYWx1ZSwgYXR0ci5zb3VyY2VTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0RXZlbnRzKTtcblxuICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQoYmluZFBhcnRzWzldKSkgeyAgLy8gbWF0Y2g6IFtleHByXVxuICAgICAgICB0aGlzLl9wYXJzZVByb3BlcnR5KGJpbmRQYXJ0c1s5XSwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BzKTtcblxuICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQoYmluZFBhcnRzWzEwXSkpIHsgIC8vIG1hdGNoOiAoZXZlbnQpXG4gICAgICAgIHRoaXMuX3BhcnNlRXZlbnQoYmluZFBhcnRzWzEwXSwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEV2ZW50cyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGhhc0JpbmRpbmcgPSB0aGlzLl9wYXJzZVByb3BlcnR5SW50ZXJwb2xhdGlvbihhdHRyTmFtZSwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsIHRhcmdldFByb3BzKTtcbiAgICB9XG4gICAgaWYgKCFoYXNCaW5kaW5nKSB7XG4gICAgICB0aGlzLl9wYXJzZUxpdGVyYWxBdHRyKGF0dHJOYW1lLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0UHJvcHMpO1xuICAgIH1cbiAgICByZXR1cm4gaGFzQmluZGluZztcbiAgfVxuXG4gIHByaXZhdGUgX25vcm1hbGl6ZUF0dHJpYnV0ZU5hbWUoYXR0ck5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGF0dHJOYW1lLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aCgnZGF0YS0nKSA/IGF0dHJOYW1lLnN1YnN0cmluZyg1KSA6IGF0dHJOYW1lO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VWYXJpYWJsZShpZGVudGlmaWVyOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRWYXJzOiBWYXJpYWJsZUFzdFtdKSB7XG4gICAgaWYgKGlkZW50aWZpZXIuaW5kZXhPZignLScpID4gLTEpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGBcIi1cIiBpcyBub3QgYWxsb3dlZCBpbiB2YXJpYWJsZSBuYW1lc2AsIHNvdXJjZVNwYW4pO1xuICAgIH1cbiAgICB0YXJnZXRWYXJzLnB1c2gobmV3IFZhcmlhYmxlQXN0KGlkZW50aWZpZXIsIHZhbHVlLCBzb3VyY2VTcGFuKSk7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZVJlZmVyZW5jZShpZGVudGlmaWVyOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UmVmczogRWxlbWVudE9yRGlyZWN0aXZlUmVmW10pIHtcbiAgICBpZiAoaWRlbnRpZmllci5pbmRleE9mKCctJykgPiAtMSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYFwiLVwiIGlzIG5vdCBhbGxvd2VkIGluIHJlZmVyZW5jZSBuYW1lc2AsIHNvdXJjZVNwYW4pO1xuICAgIH1cbiAgICB0YXJnZXRSZWZzLnB1c2gobmV3IEVsZW1lbnRPckRpcmVjdGl2ZVJlZihpZGVudGlmaWVyLCB2YWx1ZSwgc291cmNlU3BhbikpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VQcm9wZXJ0eShuYW1lOiBzdHJpbmcsIGV4cHJlc3Npb246IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzOiBzdHJpbmdbXVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BzOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5W10pIHtcbiAgICB0aGlzLl9wYXJzZVByb3BlcnR5QXN0KG5hbWUsIHRoaXMuX3BhcnNlQmluZGluZyhleHByZXNzaW9uLCBzb3VyY2VTcGFuKSwgc291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLCB0YXJnZXRQcm9wcyk7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZVByb3BlcnR5SW50ZXJwb2xhdGlvbihuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BzOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5W10pOiBib29sZWFuIHtcbiAgICB2YXIgZXhwciA9IHRoaXMuX3BhcnNlSW50ZXJwb2xhdGlvbih2YWx1ZSwgc291cmNlU3Bhbik7XG4gICAgaWYgKGlzUHJlc2VudChleHByKSkge1xuICAgICAgdGhpcy5fcGFyc2VQcm9wZXJ0eUFzdChuYW1lLCBleHByLCBzb3VyY2VTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycywgdGFyZ2V0UHJvcHMpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlUHJvcGVydHlBc3QobmFtZTogc3RyaW5nLCBhc3Q6IEFTVFdpdGhTb3VyY2UsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdKSB7XG4gICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMucHVzaChbbmFtZSwgYXN0LnNvdXJjZV0pO1xuICAgIHRhcmdldFByb3BzLnB1c2gobmV3IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHkobmFtZSwgYXN0LCBmYWxzZSwgc291cmNlU3BhbikpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VBc3NpZ25tZW50RXZlbnQobmFtZTogc3RyaW5nLCBleHByZXNzaW9uOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sIHRhcmdldEV2ZW50czogQm91bmRFdmVudEFzdFtdKSB7XG4gICAgdGhpcy5fcGFyc2VFdmVudChgJHtuYW1lfUNoYW5nZWAsIGAke2V4cHJlc3Npb259PSRldmVudGAsIHNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0RXZlbnRzKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlRXZlbnQobmFtZTogc3RyaW5nLCBleHByZXNzaW9uOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSwgdGFyZ2V0RXZlbnRzOiBCb3VuZEV2ZW50QXN0W10pIHtcbiAgICAvLyBsb25nIGZvcm1hdDogJ3RhcmdldDogZXZlbnROYW1lJ1xuICAgIHZhciBwYXJ0cyA9IHNwbGl0QXRDb2xvbihuYW1lLCBbbnVsbCwgbmFtZV0pO1xuICAgIHZhciB0YXJnZXQgPSBwYXJ0c1swXTtcbiAgICB2YXIgZXZlbnROYW1lID0gcGFydHNbMV07XG4gICAgdmFyIGFzdCA9IHRoaXMuX3BhcnNlQWN0aW9uKGV4cHJlc3Npb24sIHNvdXJjZVNwYW4pO1xuICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLnB1c2goW25hbWUsIGFzdC5zb3VyY2VdKTtcbiAgICB0YXJnZXRFdmVudHMucHVzaChuZXcgQm91bmRFdmVudEFzdChldmVudE5hbWUsIHRhcmdldCwgYXN0LCBzb3VyY2VTcGFuKSk7XG4gICAgLy8gRG9uJ3QgZGV0ZWN0IGRpcmVjdGl2ZXMgZm9yIGV2ZW50IG5hbWVzIGZvciBub3csXG4gICAgLy8gc28gZG9uJ3QgYWRkIHRoZSBldmVudCBuYW1lIHRvIHRoZSBtYXRjaGFibGVBdHRyc1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VMaXRlcmFsQXR0cihuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdKSB7XG4gICAgdGFyZ2V0UHJvcHMucHVzaChuZXcgQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eShcbiAgICAgICAgbmFtZSwgdGhpcy5fZXhwclBhcnNlci53cmFwTGl0ZXJhbFByaW1pdGl2ZSh2YWx1ZSwgJycpLCB0cnVlLCBzb3VyY2VTcGFuKSk7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZURpcmVjdGl2ZXMoc2VsZWN0b3JNYXRjaGVyOiBTZWxlY3Rvck1hdGNoZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Q3NzU2VsZWN0b3I6IENzc1NlbGVjdG9yKTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10ge1xuICAgIC8vIE5lZWQgdG8gc29ydCB0aGUgZGlyZWN0aXZlcyBzbyB0aGF0IHdlIGdldCBjb25zaXN0ZW50IHJlc3VsdHMgdGhyb3VnaG91dCxcbiAgICAvLyBhcyBzZWxlY3Rvck1hdGNoZXIgdXNlcyBNYXBzIGluc2lkZS5cbiAgICAvLyBBbHNvIGRlZHVwZSBkaXJlY3RpdmVzIGFzIHRoZXkgbWlnaHQgbWF0Y2ggbW9yZSB0aGFuIG9uZSB0aW1lIVxuICAgIHZhciBkaXJlY3RpdmVzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKHRoaXMuZGlyZWN0aXZlc0luZGV4LnNpemUpO1xuICAgIHNlbGVjdG9yTWF0Y2hlci5tYXRjaChlbGVtZW50Q3NzU2VsZWN0b3IsIChzZWxlY3RvciwgZGlyZWN0aXZlKSA9PiB7XG4gICAgICBkaXJlY3RpdmVzW3RoaXMuZGlyZWN0aXZlc0luZGV4LmdldChkaXJlY3RpdmUpXSA9IGRpcmVjdGl2ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGlyZWN0aXZlcy5maWx0ZXIoZGlyID0+IGlzUHJlc2VudChkaXIpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZURpcmVjdGl2ZUFzdHMoaXNUZW1wbGF0ZUVsZW1lbnQ6IGJvb2xlYW4sIGVsZW1lbnROYW1lOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHM6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHlbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50T3JEaXJlY3RpdmVSZWZzOiBFbGVtZW50T3JEaXJlY3RpdmVSZWZbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UmVmZXJlbmNlczogUmVmZXJlbmNlQXN0W10pOiBEaXJlY3RpdmVBc3RbXSB7XG4gICAgdmFyIG1hdGNoZWRSZWZlcmVuY2VzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgdmFyIGNvbXBvbmVudDogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhID0gbnVsbDtcbiAgICB2YXIgZGlyZWN0aXZlQXN0cyA9IGRpcmVjdGl2ZXMubWFwKChkaXJlY3RpdmU6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSkgPT4ge1xuICAgICAgaWYgKGRpcmVjdGl2ZS5pc0NvbXBvbmVudCkge1xuICAgICAgICBjb21wb25lbnQgPSBkaXJlY3RpdmU7XG4gICAgICB9XG4gICAgICB2YXIgaG9zdFByb3BlcnRpZXM6IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0W10gPSBbXTtcbiAgICAgIHZhciBob3N0RXZlbnRzOiBCb3VuZEV2ZW50QXN0W10gPSBbXTtcbiAgICAgIHZhciBkaXJlY3RpdmVQcm9wZXJ0aWVzOiBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0W10gPSBbXTtcbiAgICAgIHRoaXMuX2NyZWF0ZURpcmVjdGl2ZUhvc3RQcm9wZXJ0eUFzdHMoZWxlbWVudE5hbWUsIGRpcmVjdGl2ZS5ob3N0UHJvcGVydGllcywgc291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9zdFByb3BlcnRpZXMpO1xuICAgICAgdGhpcy5fY3JlYXRlRGlyZWN0aXZlSG9zdEV2ZW50QXN0cyhkaXJlY3RpdmUuaG9zdExpc3RlbmVycywgc291cmNlU3BhbiwgaG9zdEV2ZW50cyk7XG4gICAgICB0aGlzLl9jcmVhdGVEaXJlY3RpdmVQcm9wZXJ0eUFzdHMoZGlyZWN0aXZlLmlucHV0cywgcHJvcHMsIGRpcmVjdGl2ZVByb3BlcnRpZXMpO1xuICAgICAgZWxlbWVudE9yRGlyZWN0aXZlUmVmcy5mb3JFYWNoKChlbE9yRGlyUmVmKSA9PiB7XG4gICAgICAgIGlmICgoZWxPckRpclJlZi52YWx1ZS5sZW5ndGggPT09IDAgJiYgZGlyZWN0aXZlLmlzQ29tcG9uZW50KSB8fFxuICAgICAgICAgICAgKGRpcmVjdGl2ZS5leHBvcnRBcyA9PSBlbE9yRGlyUmVmLnZhbHVlKSkge1xuICAgICAgICAgIHRhcmdldFJlZmVyZW5jZXMucHVzaChuZXcgUmVmZXJlbmNlQXN0KGVsT3JEaXJSZWYubmFtZSwgaWRlbnRpZmllclRva2VuKGRpcmVjdGl2ZS50eXBlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbE9yRGlyUmVmLnNvdXJjZVNwYW4pKTtcbiAgICAgICAgICBtYXRjaGVkUmVmZXJlbmNlcy5hZGQoZWxPckRpclJlZi5uYW1lKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gbmV3IERpcmVjdGl2ZUFzdChkaXJlY3RpdmUsIGRpcmVjdGl2ZVByb3BlcnRpZXMsIGhvc3RQcm9wZXJ0aWVzLCBob3N0RXZlbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlU3Bhbik7XG4gICAgfSk7XG4gICAgZWxlbWVudE9yRGlyZWN0aXZlUmVmcy5mb3JFYWNoKChlbE9yRGlyUmVmKSA9PiB7XG4gICAgICBpZiAoZWxPckRpclJlZi52YWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmICghU2V0V3JhcHBlci5oYXMobWF0Y2hlZFJlZmVyZW5jZXMsIGVsT3JEaXJSZWYubmFtZSkpIHtcbiAgICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihgVGhlcmUgaXMgbm8gZGlyZWN0aXZlIHdpdGggXCJleHBvcnRBc1wiIHNldCB0byBcIiR7ZWxPckRpclJlZi52YWx1ZX1cImAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxPckRpclJlZi5zb3VyY2VTcGFuKTtcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAoaXNCbGFuayhjb21wb25lbnQpKSB7XG4gICAgICAgIHZhciByZWZUb2tlbiA9IG51bGw7XG4gICAgICAgIGlmIChpc1RlbXBsYXRlRWxlbWVudCkge1xuICAgICAgICAgIHJlZlRva2VuID0gaWRlbnRpZmllclRva2VuKElkZW50aWZpZXJzLlRlbXBsYXRlUmVmKTtcbiAgICAgICAgfVxuICAgICAgICB0YXJnZXRSZWZlcmVuY2VzLnB1c2gobmV3IFJlZmVyZW5jZUFzdChlbE9yRGlyUmVmLm5hbWUsIHJlZlRva2VuLCBlbE9yRGlyUmVmLnNvdXJjZVNwYW4pKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZGlyZWN0aXZlQXN0cztcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZURpcmVjdGl2ZUhvc3RQcm9wZXJ0eUFzdHMoZWxlbWVudE5hbWU6IHN0cmluZywgaG9zdFByb3BzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvcGVydHlBc3RzOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdKSB7XG4gICAgaWYgKGlzUHJlc2VudChob3N0UHJvcHMpKSB7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goaG9zdFByb3BzLCAoZXhwcmVzc2lvbjogc3RyaW5nLCBwcm9wTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIHZhciBleHByQXN0ID0gdGhpcy5fcGFyc2VCaW5kaW5nKGV4cHJlc3Npb24sIHNvdXJjZVNwYW4pO1xuICAgICAgICB0YXJnZXRQcm9wZXJ0eUFzdHMucHVzaChcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUVsZW1lbnRQcm9wZXJ0eUFzdChlbGVtZW50TmFtZSwgcHJvcE5hbWUsIGV4cHJBc3QsIHNvdXJjZVNwYW4pKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZURpcmVjdGl2ZUhvc3RFdmVudEFzdHMoaG9zdExpc3RlbmVyczoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEV2ZW50QXN0czogQm91bmRFdmVudEFzdFtdKSB7XG4gICAgaWYgKGlzUHJlc2VudChob3N0TGlzdGVuZXJzKSkge1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGhvc3RMaXN0ZW5lcnMsIChleHByZXNzaW9uOiBzdHJpbmcsIHByb3BOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgICAgdGhpcy5fcGFyc2VFdmVudChwcm9wTmFtZSwgZXhwcmVzc2lvbiwgc291cmNlU3BhbiwgW10sIHRhcmdldEV2ZW50QXN0cyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVEaXJlY3RpdmVQcm9wZXJ0eUFzdHMoZGlyZWN0aXZlUHJvcGVydGllczoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3VuZFByb3BzOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRCb3VuZERpcmVjdGl2ZVByb3BzOiBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0W10pIHtcbiAgICBpZiAoaXNQcmVzZW50KGRpcmVjdGl2ZVByb3BlcnRpZXMpKSB7XG4gICAgICB2YXIgYm91bmRQcm9wc0J5TmFtZSA9IG5ldyBNYXA8c3RyaW5nLCBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5PigpO1xuICAgICAgYm91bmRQcm9wcy5mb3JFYWNoKGJvdW5kUHJvcCA9PiB7XG4gICAgICAgIHZhciBwcmV2VmFsdWUgPSBib3VuZFByb3BzQnlOYW1lLmdldChib3VuZFByb3AubmFtZSk7XG4gICAgICAgIGlmIChpc0JsYW5rKHByZXZWYWx1ZSkgfHwgcHJldlZhbHVlLmlzTGl0ZXJhbCkge1xuICAgICAgICAgIC8vIGdpdmUgW2FdPVwiYlwiIGEgaGlnaGVyIHByZWNlZGVuY2UgdGhhbiBhPVwiYlwiIG9uIHRoZSBzYW1lIGVsZW1lbnRcbiAgICAgICAgICBib3VuZFByb3BzQnlOYW1lLnNldChib3VuZFByb3AubmFtZSwgYm91bmRQcm9wKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChkaXJlY3RpdmVQcm9wZXJ0aWVzLCAoZWxQcm9wOiBzdHJpbmcsIGRpclByb3A6IHN0cmluZykgPT4ge1xuICAgICAgICB2YXIgYm91bmRQcm9wID0gYm91bmRQcm9wc0J5TmFtZS5nZXQoZWxQcm9wKTtcblxuICAgICAgICAvLyBCaW5kaW5ncyBhcmUgb3B0aW9uYWwsIHNvIHRoaXMgYmluZGluZyBvbmx5IG5lZWRzIHRvIGJlIHNldCB1cCBpZiBhbiBleHByZXNzaW9uIGlzIGdpdmVuLlxuICAgICAgICBpZiAoaXNQcmVzZW50KGJvdW5kUHJvcCkpIHtcbiAgICAgICAgICB0YXJnZXRCb3VuZERpcmVjdGl2ZVByb3BzLnB1c2gobmV3IEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QoXG4gICAgICAgICAgICAgIGRpclByb3AsIGJvdW5kUHJvcC5uYW1lLCBib3VuZFByb3AuZXhwcmVzc2lvbiwgYm91bmRQcm9wLnNvdXJjZVNwYW4pKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRWxlbWVudFByb3BlcnR5QXN0cyhlbGVtZW50TmFtZTogc3RyaW5nLCBwcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGl2ZXM6IERpcmVjdGl2ZUFzdFtdKTogQm91bmRFbGVtZW50UHJvcGVydHlBc3RbXSB7XG4gICAgdmFyIGJvdW5kRWxlbWVudFByb3BzOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdID0gW107XG4gICAgdmFyIGJvdW5kRGlyZWN0aXZlUHJvcHNJbmRleCA9IG5ldyBNYXA8c3RyaW5nLCBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0PigpO1xuICAgIGRpcmVjdGl2ZXMuZm9yRWFjaCgoZGlyZWN0aXZlOiBEaXJlY3RpdmVBc3QpID0+IHtcbiAgICAgIGRpcmVjdGl2ZS5pbnB1dHMuZm9yRWFjaCgocHJvcDogQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdCkgPT4ge1xuICAgICAgICBib3VuZERpcmVjdGl2ZVByb3BzSW5kZXguc2V0KHByb3AudGVtcGxhdGVOYW1lLCBwcm9wKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHByb3BzLmZvckVhY2goKHByb3A6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHkpID0+IHtcbiAgICAgIGlmICghcHJvcC5pc0xpdGVyYWwgJiYgaXNCbGFuayhib3VuZERpcmVjdGl2ZVByb3BzSW5kZXguZ2V0KHByb3AubmFtZSkpKSB7XG4gICAgICAgIGJvdW5kRWxlbWVudFByb3BzLnB1c2godGhpcy5fY3JlYXRlRWxlbWVudFByb3BlcnR5QXN0KGVsZW1lbnROYW1lLCBwcm9wLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3AuZXhwcmVzc2lvbiwgcHJvcC5zb3VyY2VTcGFuKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGJvdW5kRWxlbWVudFByb3BzO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRWxlbWVudFByb3BlcnR5QXN0KGVsZW1lbnROYW1lOiBzdHJpbmcsIG5hbWU6IHN0cmluZywgYXN0OiBBU1QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCB7XG4gICAgdmFyIHVuaXQgPSBudWxsO1xuICAgIHZhciBiaW5kaW5nVHlwZTtcbiAgICB2YXIgYm91bmRQcm9wZXJ0eU5hbWU7XG4gICAgdmFyIHBhcnRzID0gbmFtZS5zcGxpdChQUk9QRVJUWV9QQVJUU19TRVBBUkFUT1IpO1xuICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIGJvdW5kUHJvcGVydHlOYW1lID0gdGhpcy5fc2NoZW1hUmVnaXN0cnkuZ2V0TWFwcGVkUHJvcE5hbWUocGFydHNbMF0pO1xuICAgICAgYmluZGluZ1R5cGUgPSBQcm9wZXJ0eUJpbmRpbmdUeXBlLlByb3BlcnR5O1xuICAgICAgaWYgKCF0aGlzLl9zY2hlbWFSZWdpc3RyeS5oYXNQcm9wZXJ0eShlbGVtZW50TmFtZSwgYm91bmRQcm9wZXJ0eU5hbWUpKSB7XG4gICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgICAgYENhbid0IGJpbmQgdG8gJyR7Ym91bmRQcm9wZXJ0eU5hbWV9JyBzaW5jZSBpdCBpc24ndCBhIGtub3duIG5hdGl2ZSBwcm9wZXJ0eWAsXG4gICAgICAgICAgICBzb3VyY2VTcGFuKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHBhcnRzWzBdID09IEFUVFJJQlVURV9QUkVGSVgpIHtcbiAgICAgICAgYm91bmRQcm9wZXJ0eU5hbWUgPSBwYXJ0c1sxXTtcbiAgICAgICAgbGV0IG5zU2VwYXJhdG9ySWR4ID0gYm91bmRQcm9wZXJ0eU5hbWUuaW5kZXhPZignOicpO1xuICAgICAgICBpZiAobnNTZXBhcmF0b3JJZHggPiAtMSkge1xuICAgICAgICAgIGxldCBucyA9IGJvdW5kUHJvcGVydHlOYW1lLnN1YnN0cmluZygwLCBuc1NlcGFyYXRvcklkeCk7XG4gICAgICAgICAgbGV0IG5hbWUgPSBib3VuZFByb3BlcnR5TmFtZS5zdWJzdHJpbmcobnNTZXBhcmF0b3JJZHggKyAxKTtcbiAgICAgICAgICBib3VuZFByb3BlcnR5TmFtZSA9IG1lcmdlTnNBbmROYW1lKG5zLCBuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBiaW5kaW5nVHlwZSA9IFByb3BlcnR5QmluZGluZ1R5cGUuQXR0cmlidXRlO1xuICAgICAgfSBlbHNlIGlmIChwYXJ0c1swXSA9PSBDTEFTU19QUkVGSVgpIHtcbiAgICAgICAgYm91bmRQcm9wZXJ0eU5hbWUgPSBwYXJ0c1sxXTtcbiAgICAgICAgYmluZGluZ1R5cGUgPSBQcm9wZXJ0eUJpbmRpbmdUeXBlLkNsYXNzO1xuICAgICAgfSBlbHNlIGlmIChwYXJ0c1swXSA9PSBTVFlMRV9QUkVGSVgpIHtcbiAgICAgICAgdW5pdCA9IHBhcnRzLmxlbmd0aCA+IDIgPyBwYXJ0c1syXSA6IG51bGw7XG4gICAgICAgIGJvdW5kUHJvcGVydHlOYW1lID0gcGFydHNbMV07XG4gICAgICAgIGJpbmRpbmdUeXBlID0gUHJvcGVydHlCaW5kaW5nVHlwZS5TdHlsZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGBJbnZhbGlkIHByb3BlcnR5IG5hbWUgJyR7bmFtZX0nYCwgc291cmNlU3Bhbik7XG4gICAgICAgIGJpbmRpbmdUeXBlID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0KGJvdW5kUHJvcGVydHlOYW1lLCBiaW5kaW5nVHlwZSwgYXN0LCB1bml0LCBzb3VyY2VTcGFuKTtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfZmluZENvbXBvbmVudERpcmVjdGl2ZU5hbWVzKGRpcmVjdGl2ZXM6IERpcmVjdGl2ZUFzdFtdKTogc3RyaW5nW10ge1xuICAgIHZhciBjb21wb25lbnRUeXBlTmFtZXM6IHN0cmluZ1tdID0gW107XG4gICAgZGlyZWN0aXZlcy5mb3JFYWNoKGRpcmVjdGl2ZSA9PiB7XG4gICAgICB2YXIgdHlwZU5hbWUgPSBkaXJlY3RpdmUuZGlyZWN0aXZlLnR5cGUubmFtZTtcbiAgICAgIGlmIChkaXJlY3RpdmUuZGlyZWN0aXZlLmlzQ29tcG9uZW50KSB7XG4gICAgICAgIGNvbXBvbmVudFR5cGVOYW1lcy5wdXNoKHR5cGVOYW1lKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gY29tcG9uZW50VHlwZU5hbWVzO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXNzZXJ0T25seU9uZUNvbXBvbmVudChkaXJlY3RpdmVzOiBEaXJlY3RpdmVBc3RbXSwgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7XG4gICAgdmFyIGNvbXBvbmVudFR5cGVOYW1lcyA9IHRoaXMuX2ZpbmRDb21wb25lbnREaXJlY3RpdmVOYW1lcyhkaXJlY3RpdmVzKTtcbiAgICBpZiAoY29tcG9uZW50VHlwZU5hbWVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGBNb3JlIHRoYW4gb25lIGNvbXBvbmVudDogJHtjb21wb25lbnRUeXBlTmFtZXMuam9pbignLCcpfWAsIHNvdXJjZVNwYW4pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2Fzc2VydE5vQ29tcG9uZW50c05vckVsZW1lbnRCaW5kaW5nc09uVGVtcGxhdGUoZGlyZWN0aXZlczogRGlyZWN0aXZlQXN0W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudFByb3BzOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge1xuICAgIHZhciBjb21wb25lbnRUeXBlTmFtZXM6IHN0cmluZ1tdID0gdGhpcy5fZmluZENvbXBvbmVudERpcmVjdGl2ZU5hbWVzKGRpcmVjdGl2ZXMpO1xuICAgIGlmIChjb21wb25lbnRUeXBlTmFtZXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYENvbXBvbmVudHMgb24gYW4gZW1iZWRkZWQgdGVtcGxhdGU6ICR7Y29tcG9uZW50VHlwZU5hbWVzLmpvaW4oJywnKX1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlU3Bhbik7XG4gICAgfVxuICAgIGVsZW1lbnRQcm9wcy5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgYFByb3BlcnR5IGJpbmRpbmcgJHtwcm9wLm5hbWV9IG5vdCB1c2VkIGJ5IGFueSBkaXJlY3RpdmUgb24gYW4gZW1iZWRkZWQgdGVtcGxhdGVgLFxuICAgICAgICAgIHNvdXJjZVNwYW4pO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXNzZXJ0QWxsRXZlbnRzUHVibGlzaGVkQnlEaXJlY3RpdmVzKGRpcmVjdGl2ZXM6IERpcmVjdGl2ZUFzdFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzOiBCb3VuZEV2ZW50QXN0W10pIHtcbiAgICB2YXIgYWxsRGlyZWN0aXZlRXZlbnRzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgZGlyZWN0aXZlcy5mb3JFYWNoKGRpcmVjdGl2ZSA9PiB7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goZGlyZWN0aXZlLmRpcmVjdGl2ZS5vdXRwdXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChldmVudE5hbWU6IHN0cmluZywgXykgPT4geyBhbGxEaXJlY3RpdmVFdmVudHMuYWRkKGV2ZW50TmFtZSk7IH0pO1xuICAgIH0pO1xuICAgIGV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgIGlmIChpc1ByZXNlbnQoZXZlbnQudGFyZ2V0KSB8fCAhU2V0V3JhcHBlci5oYXMoYWxsRGlyZWN0aXZlRXZlbnRzLCBldmVudC5uYW1lKSkge1xuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgIGBFdmVudCBiaW5kaW5nICR7ZXZlbnQuZnVsbE5hbWV9IG5vdCBlbWl0dGVkIGJ5IGFueSBkaXJlY3RpdmUgb24gYW4gZW1iZWRkZWQgdGVtcGxhdGVgLFxuICAgICAgICAgICAgZXZlbnQuc291cmNlU3Bhbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuY2xhc3MgTm9uQmluZGFibGVWaXNpdG9yIGltcGxlbWVudHMgSHRtbEFzdFZpc2l0b3Ige1xuICB2aXNpdEVsZW1lbnQoYXN0OiBIdG1sRWxlbWVudEFzdCwgcGFyZW50OiBFbGVtZW50Q29udGV4dCk6IEVsZW1lbnRBc3Qge1xuICAgIHZhciBwcmVwYXJzZWRFbGVtZW50ID0gcHJlcGFyc2VFbGVtZW50KGFzdCk7XG4gICAgaWYgKHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU0NSSVBUIHx8XG4gICAgICAgIHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU1RZTEUgfHxcbiAgICAgICAgcHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TVFlMRVNIRUVUKSB7XG4gICAgICAvLyBTa2lwcGluZyA8c2NyaXB0PiBmb3Igc2VjdXJpdHkgcmVhc29uc1xuICAgICAgLy8gU2tpcHBpbmcgPHN0eWxlPiBhbmQgc3R5bGVzaGVldHMgYXMgd2UgYWxyZWFkeSBwcm9jZXNzZWQgdGhlbVxuICAgICAgLy8gaW4gdGhlIFN0eWxlQ29tcGlsZXJcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBhdHRyTmFtZUFuZFZhbHVlcyA9IGFzdC5hdHRycy5tYXAoYXR0ckFzdCA9PiBbYXR0ckFzdC5uYW1lLCBhdHRyQXN0LnZhbHVlXSk7XG4gICAgdmFyIHNlbGVjdG9yID0gY3JlYXRlRWxlbWVudENzc1NlbGVjdG9yKGFzdC5uYW1lLCBhdHRyTmFtZUFuZFZhbHVlcyk7XG4gICAgdmFyIG5nQ29udGVudEluZGV4ID0gcGFyZW50LmZpbmROZ0NvbnRlbnRJbmRleChzZWxlY3Rvcik7XG4gICAgdmFyIGNoaWxkcmVuID0gaHRtbFZpc2l0QWxsKHRoaXMsIGFzdC5jaGlsZHJlbiwgRU1QVFlfRUxFTUVOVF9DT05URVhUKTtcbiAgICByZXR1cm4gbmV3IEVsZW1lbnRBc3QoYXN0Lm5hbWUsIGh0bWxWaXNpdEFsbCh0aGlzLCBhc3QuYXR0cnMpLCBbXSwgW10sIFtdLCBbXSwgW10sIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbiwgbmdDb250ZW50SW5kZXgsIGFzdC5zb3VyY2VTcGFuKTtcbiAgfVxuICB2aXNpdENvbW1lbnQoYXN0OiBIdG1sQ29tbWVudEFzdCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgdmlzaXRBdHRyKGFzdDogSHRtbEF0dHJBc3QsIGNvbnRleHQ6IGFueSk6IEF0dHJBc3Qge1xuICAgIHJldHVybiBuZXcgQXR0ckFzdChhc3QubmFtZSwgYXN0LnZhbHVlLCBhc3Quc291cmNlU3Bhbik7XG4gIH1cbiAgdmlzaXRUZXh0KGFzdDogSHRtbFRleHRBc3QsIHBhcmVudDogRWxlbWVudENvbnRleHQpOiBUZXh0QXN0IHtcbiAgICB2YXIgbmdDb250ZW50SW5kZXggPSBwYXJlbnQuZmluZE5nQ29udGVudEluZGV4KFRFWFRfQ1NTX1NFTEVDVE9SKTtcbiAgICByZXR1cm4gbmV3IFRleHRBc3QoYXN0LnZhbHVlLCBuZ0NvbnRlbnRJbmRleCwgYXN0LnNvdXJjZVNwYW4pO1xuICB9XG4gIHZpc2l0RXhwYW5zaW9uKGFzdDogSHRtbEV4cGFuc2lvbkFzdCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIGFzdDsgfVxuICB2aXNpdEV4cGFuc2lvbkNhc2UoYXN0OiBIdG1sRXhwYW5zaW9uQ2FzZUFzdCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIGFzdDsgfVxufVxuXG5jbGFzcyBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5IHtcbiAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIGV4cHJlc3Npb246IEFTVCwgcHVibGljIGlzTGl0ZXJhbDogYm9vbGVhbixcbiAgICAgICAgICAgICAgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge31cbn1cblxuY2xhc3MgRWxlbWVudE9yRGlyZWN0aXZlUmVmIHtcbiAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIHZhbHVlOiBzdHJpbmcsIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzcGxpdENsYXNzZXMoY2xhc3NBdHRyVmFsdWU6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIFN0cmluZ1dyYXBwZXIuc3BsaXQoY2xhc3NBdHRyVmFsdWUudHJpbSgpLCAvXFxzKy9nKTtcbn1cblxuY2xhc3MgRWxlbWVudENvbnRleHQge1xuICBzdGF0aWMgY3JlYXRlKGlzVGVtcGxhdGVFbGVtZW50OiBib29sZWFuLCBkaXJlY3RpdmVzOiBEaXJlY3RpdmVBc3RbXSxcbiAgICAgICAgICAgICAgICBwcm92aWRlckNvbnRleHQ6IFByb3ZpZGVyRWxlbWVudENvbnRleHQpOiBFbGVtZW50Q29udGV4dCB7XG4gICAgdmFyIG1hdGNoZXIgPSBuZXcgU2VsZWN0b3JNYXRjaGVyKCk7XG4gICAgdmFyIHdpbGRjYXJkTmdDb250ZW50SW5kZXggPSBudWxsO1xuICAgIHZhciBjb21wb25lbnQgPSBkaXJlY3RpdmVzLmZpbmQoZGlyZWN0aXZlID0+IGRpcmVjdGl2ZS5kaXJlY3RpdmUuaXNDb21wb25lbnQpO1xuICAgIGlmIChpc1ByZXNlbnQoY29tcG9uZW50KSkge1xuICAgICAgdmFyIG5nQ29udGVudFNlbGVjdG9ycyA9IGNvbXBvbmVudC5kaXJlY3RpdmUudGVtcGxhdGUubmdDb250ZW50U2VsZWN0b3JzO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuZ0NvbnRlbnRTZWxlY3RvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHNlbGVjdG9yID0gbmdDb250ZW50U2VsZWN0b3JzW2ldO1xuICAgICAgICBpZiAoU3RyaW5nV3JhcHBlci5lcXVhbHMoc2VsZWN0b3IsICcqJykpIHtcbiAgICAgICAgICB3aWxkY2FyZE5nQ29udGVudEluZGV4ID0gaTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtYXRjaGVyLmFkZFNlbGVjdGFibGVzKENzc1NlbGVjdG9yLnBhcnNlKG5nQ29udGVudFNlbGVjdG9yc1tpXSksIGkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgRWxlbWVudENvbnRleHQoaXNUZW1wbGF0ZUVsZW1lbnQsIG1hdGNoZXIsIHdpbGRjYXJkTmdDb250ZW50SW5kZXgsIHByb3ZpZGVyQ29udGV4dCk7XG4gIH1cbiAgY29uc3RydWN0b3IocHVibGljIGlzVGVtcGxhdGVFbGVtZW50OiBib29sZWFuLCBwcml2YXRlIF9uZ0NvbnRlbnRJbmRleE1hdGNoZXI6IFNlbGVjdG9yTWF0Y2hlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfd2lsZGNhcmROZ0NvbnRlbnRJbmRleDogbnVtYmVyLFxuICAgICAgICAgICAgICBwdWJsaWMgcHJvdmlkZXJDb250ZXh0OiBQcm92aWRlckVsZW1lbnRDb250ZXh0KSB7fVxuXG4gIGZpbmROZ0NvbnRlbnRJbmRleChzZWxlY3RvcjogQ3NzU2VsZWN0b3IpOiBudW1iZXIge1xuICAgIHZhciBuZ0NvbnRlbnRJbmRpY2VzID0gW107XG4gICAgdGhpcy5fbmdDb250ZW50SW5kZXhNYXRjaGVyLm1hdGNoKFxuICAgICAgICBzZWxlY3RvciwgKHNlbGVjdG9yLCBuZ0NvbnRlbnRJbmRleCkgPT4geyBuZ0NvbnRlbnRJbmRpY2VzLnB1c2gobmdDb250ZW50SW5kZXgpOyB9KTtcbiAgICBMaXN0V3JhcHBlci5zb3J0KG5nQ29udGVudEluZGljZXMpO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fd2lsZGNhcmROZ0NvbnRlbnRJbmRleCkpIHtcbiAgICAgIG5nQ29udGVudEluZGljZXMucHVzaCh0aGlzLl93aWxkY2FyZE5nQ29udGVudEluZGV4KTtcbiAgICB9XG4gICAgcmV0dXJuIG5nQ29udGVudEluZGljZXMubGVuZ3RoID4gMCA/IG5nQ29udGVudEluZGljZXNbMF0gOiBudWxsO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRDc3NTZWxlY3RvcihlbGVtZW50TmFtZTogc3RyaW5nLCBtYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSk6IENzc1NlbGVjdG9yIHtcbiAgdmFyIGNzc1NlbGVjdG9yID0gbmV3IENzc1NlbGVjdG9yKCk7XG4gIGxldCBlbE5hbWVOb05zID0gc3BsaXROc05hbWUoZWxlbWVudE5hbWUpWzFdO1xuXG4gIGNzc1NlbGVjdG9yLnNldEVsZW1lbnQoZWxOYW1lTm9Ocyk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXRjaGFibGVBdHRycy5sZW5ndGg7IGkrKykge1xuICAgIGxldCBhdHRyTmFtZSA9IG1hdGNoYWJsZUF0dHJzW2ldWzBdO1xuICAgIGxldCBhdHRyTmFtZU5vTnMgPSBzcGxpdE5zTmFtZShhdHRyTmFtZSlbMV07XG4gICAgbGV0IGF0dHJWYWx1ZSA9IG1hdGNoYWJsZUF0dHJzW2ldWzFdO1xuXG4gICAgY3NzU2VsZWN0b3IuYWRkQXR0cmlidXRlKGF0dHJOYW1lTm9OcywgYXR0clZhbHVlKTtcbiAgICBpZiAoYXR0ck5hbWUudG9Mb3dlckNhc2UoKSA9PSBDTEFTU19BVFRSKSB7XG4gICAgICB2YXIgY2xhc3NlcyA9IHNwbGl0Q2xhc3NlcyhhdHRyVmFsdWUpO1xuICAgICAgY2xhc3Nlcy5mb3JFYWNoKGNsYXNzTmFtZSA9PiBjc3NTZWxlY3Rvci5hZGRDbGFzc05hbWUoY2xhc3NOYW1lKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBjc3NTZWxlY3Rvcjtcbn1cblxudmFyIEVNUFRZX0VMRU1FTlRfQ09OVEVYVCA9IG5ldyBFbGVtZW50Q29udGV4dCh0cnVlLCBuZXcgU2VsZWN0b3JNYXRjaGVyKCksIG51bGwsIG51bGwpO1xudmFyIE5PTl9CSU5EQUJMRV9WSVNJVE9SID0gbmV3IE5vbkJpbmRhYmxlVmlzaXRvcigpO1xuXG5cbmV4cG9ydCBjbGFzcyBQaXBlQ29sbGVjdG9yIGV4dGVuZHMgUmVjdXJzaXZlQXN0VmlzaXRvciB7XG4gIHBpcGVzOiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICB2aXNpdFBpcGUoYXN0OiBCaW5kaW5nUGlwZSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLnBpcGVzLmFkZChhc3QubmFtZSk7XG4gICAgYXN0LmV4cC52aXNpdCh0aGlzKTtcbiAgICB0aGlzLnZpc2l0QWxsKGFzdC5hcmdzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVEdXBsaWNhdGVzKGl0ZW1zOiBDb21waWxlTWV0YWRhdGFXaXRoVHlwZVtdKTogQ29tcGlsZU1ldGFkYXRhV2l0aFR5cGVbXSB7XG4gIGxldCByZXMgPSBbXTtcbiAgaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICBsZXQgaGFzTWF0Y2ggPVxuICAgICAgICByZXMuZmlsdGVyKHIgPT4gci50eXBlLm5hbWUgPT0gaXRlbS50eXBlLm5hbWUgJiYgci50eXBlLm1vZHVsZVVybCA9PSBpdGVtLnR5cGUubW9kdWxlVXJsICYmXG4gICAgICAgICAgICAgICAgICAgICAgICByLnR5cGUucnVudGltZSA9PSBpdGVtLnR5cGUucnVudGltZSlcbiAgICAgICAgICAgIC5sZW5ndGggPiAwO1xuICAgIGlmICghaGFzTWF0Y2gpIHtcbiAgICAgIHJlcy5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiByZXM7XG59XG4iXX0=