'use strict';"use strict";
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var metadata_1 = require('angular2/src/core/metadata');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var provider_1 = require('angular2/src/core/di/provider');
var metadata_2 = require("angular2/src/core/di/metadata");
/**
 * A token representing the a reference to a static type.
 *
 * This token is unique for a moduleId and name and can be used as a hash table key.
 */
var StaticSymbol = (function () {
    function StaticSymbol(moduleId, filePath, name) {
        this.moduleId = moduleId;
        this.filePath = filePath;
        this.name = name;
    }
    return StaticSymbol;
}());
exports.StaticSymbol = StaticSymbol;
/**
 * A static reflector implements enough of the Reflector API that is necessary to compile
 * templates statically.
 */
var StaticReflector = (function () {
    function StaticReflector(host) {
        this.host = host;
        this.annotationCache = new Map();
        this.propertyCache = new Map();
        this.parameterCache = new Map();
        this.metadataCache = new Map();
        this.conversionMap = new Map();
        this.initializeConversionMap();
    }
    StaticReflector.prototype.importUri = function (typeOrFunc) { return typeOrFunc.filePath; };
    StaticReflector.prototype.annotations = function (type) {
        var annotations = this.annotationCache.get(type);
        if (!lang_1.isPresent(annotations)) {
            var classMetadata = this.getTypeMetadata(type);
            if (lang_1.isPresent(classMetadata['decorators'])) {
                annotations = this.simplify(type, classMetadata['decorators']);
            }
            else {
                annotations = [];
            }
            this.annotationCache.set(type, annotations.filter(function (ann) { return lang_1.isPresent(ann); }));
        }
        return annotations;
    };
    StaticReflector.prototype.propMetadata = function (type) {
        var _this = this;
        var propMetadata = this.propertyCache.get(type);
        if (!lang_1.isPresent(propMetadata)) {
            var classMetadata = this.getTypeMetadata(type);
            var members = lang_1.isPresent(classMetadata) ? classMetadata['members'] : {};
            propMetadata = mapStringMap(members, function (propData, propName) {
                var prop = propData.find(function (a) { return a['__symbolic'] == 'property'; });
                if (lang_1.isPresent(prop) && lang_1.isPresent(prop['decorators'])) {
                    return _this.simplify(type, prop['decorators']);
                }
                else {
                    return [];
                }
            });
            this.propertyCache.set(type, propMetadata);
        }
        return propMetadata;
    };
    StaticReflector.prototype.parameters = function (type) {
        try {
            var parameters_1 = this.parameterCache.get(type);
            if (!lang_1.isPresent(parameters_1)) {
                var classMetadata = this.getTypeMetadata(type);
                var members = lang_1.isPresent(classMetadata) ? classMetadata['members'] : null;
                var ctorData = lang_1.isPresent(members) ? members['__ctor__'] : null;
                if (lang_1.isPresent(ctorData)) {
                    var ctor = ctorData.find(function (a) { return a['__symbolic'] == 'constructor'; });
                    var parameterTypes = this.simplify(type, ctor['parameters']);
                    var parameterDecorators_1 = this.simplify(type, ctor['parameterDecorators']);
                    parameters_1 = [];
                    collection_1.ListWrapper.forEachWithIndex(parameterTypes, function (paramType, index) {
                        var nestedResult = [];
                        if (lang_1.isPresent(paramType)) {
                            nestedResult.push(paramType);
                        }
                        var decorators = lang_1.isPresent(parameterDecorators_1) ? parameterDecorators_1[index] : null;
                        if (lang_1.isPresent(decorators)) {
                            collection_1.ListWrapper.addAll(nestedResult, decorators);
                        }
                        parameters_1.push(nestedResult);
                    });
                }
                if (!lang_1.isPresent(parameters_1)) {
                    parameters_1 = [];
                }
                this.parameterCache.set(type, parameters_1);
            }
            return parameters_1;
        }
        catch (e) {
            console.log("Failed on type " + type + " with error " + e);
            throw e;
        }
    };
    StaticReflector.prototype.registerDecoratorOrConstructor = function (type, ctor) {
        var _this = this;
        this.conversionMap.set(type, function (context, args) {
            var argValues = [];
            collection_1.ListWrapper.forEachWithIndex(args, function (arg, index) {
                var argValue;
                if (lang_1.isStringMap(arg) && lang_1.isBlank(arg['__symbolic'])) {
                    argValue = mapStringMap(arg, function (value, key) { return _this.simplify(context, value); });
                }
                else {
                    argValue = _this.simplify(context, arg);
                }
                argValues.push(argValue);
            });
            return lang_1.FunctionWrapper.apply(reflection_1.reflector.factory(ctor), argValues);
        });
    };
    StaticReflector.prototype.initializeConversionMap = function () {
        var coreDecorators = 'angular2/src/core/metadata';
        var diDecorators = 'angular2/src/core/di/decorators';
        var diMetadata = 'angular2/src/core/di/metadata';
        var provider = 'angular2/src/core/di/provider';
        this.registerDecoratorOrConstructor(this.host.findDeclaration(provider, 'Provider'), provider_1.Provider);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'Host'), metadata_2.HostMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'Injectable'), metadata_2.InjectableMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'Self'), metadata_2.SelfMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'SkipSelf'), metadata_2.SkipSelfMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'Inject'), metadata_2.InjectMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'Optional'), metadata_2.OptionalMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Attribute'), metadata_1.AttributeMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Query'), metadata_1.QueryMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'ViewQuery'), metadata_1.ViewQueryMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'ContentChild'), metadata_1.ContentChildMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'ContentChildren'), metadata_1.ContentChildrenMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'ViewChild'), metadata_1.ViewChildMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'ViewChildren'), metadata_1.ViewChildrenMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Input'), metadata_1.InputMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Output'), metadata_1.OutputMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Pipe'), metadata_1.PipeMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'HostBinding'), metadata_1.HostBindingMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'HostListener'), metadata_1.HostListenerMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Directive'), metadata_1.DirectiveMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Component'), metadata_1.ComponentMetadata);
        // Note: Some metadata classes can be used directly with Provider.deps.
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'HostMetadata'), metadata_2.HostMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'SelfMetadata'), metadata_2.SelfMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'SkipSelfMetadata'), metadata_2.SkipSelfMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'OptionalMetadata'), metadata_2.OptionalMetadata);
    };
    /** @internal */
    StaticReflector.prototype.simplify = function (context, value) {
        var _this = this;
        function simplify(expression) {
            if (lang_1.isPrimitive(expression)) {
                return expression;
            }
            if (lang_1.isArray(expression)) {
                var result = [];
                for (var _i = 0, _a = expression; _i < _a.length; _i++) {
                    var item = _a[_i];
                    result.push(simplify(item));
                }
                return result;
            }
            if (lang_1.isPresent(expression)) {
                if (lang_1.isPresent(expression['__symbolic'])) {
                    var staticSymbol = void 0;
                    switch (expression['__symbolic']) {
                        case "binop":
                            var left = simplify(expression['left']);
                            var right = simplify(expression['right']);
                            switch (expression['operator']) {
                                case '&&':
                                    return left && right;
                                case '||':
                                    return left || right;
                                case '|':
                                    return left | right;
                                case '^':
                                    return left ^ right;
                                case '&':
                                    return left & right;
                                case '==':
                                    return left == right;
                                case '!=':
                                    return left != right;
                                case '===':
                                    return left === right;
                                case '!==':
                                    return left !== right;
                                case '<':
                                    return left < right;
                                case '>':
                                    return left > right;
                                case '<=':
                                    return left <= right;
                                case '>=':
                                    return left >= right;
                                case '<<':
                                    return left << right;
                                case '>>':
                                    return left >> right;
                                case '+':
                                    return left + right;
                                case '-':
                                    return left - right;
                                case '*':
                                    return left * right;
                                case '/':
                                    return left / right;
                                case '%':
                                    return left % right;
                            }
                            return null;
                        case "pre":
                            var operand = simplify(expression['operand']);
                            switch (expression['operator']) {
                                case '+':
                                    return operand;
                                case '-':
                                    return -operand;
                                case '!':
                                    return !operand;
                                case '~':
                                    return ~operand;
                            }
                            return null;
                        case "index":
                            var indexTarget = simplify(expression['expression']);
                            var index = simplify(expression['index']);
                            if (lang_1.isPresent(indexTarget) && lang_1.isPrimitive(index))
                                return indexTarget[index];
                            return null;
                        case "select":
                            var selectTarget = simplify(expression['expression']);
                            var member = simplify(expression['member']);
                            if (lang_1.isPresent(selectTarget) && lang_1.isPrimitive(member))
                                return selectTarget[member];
                            return null;
                        case "reference":
                            if (lang_1.isPresent(expression['module'])) {
                                staticSymbol = _this.host.findDeclaration(expression['module'], expression['name'], context.filePath);
                            }
                            else {
                                staticSymbol = _this.host.getStaticSymbol(context.moduleId, context.filePath, expression['name']);
                            }
                            var result = staticSymbol;
                            var moduleMetadata = _this.getModuleMetadata(staticSymbol.filePath);
                            var declarationValue = lang_1.isPresent(moduleMetadata) ? moduleMetadata['metadata'][staticSymbol.name] : null;
                            if (lang_1.isPresent(declarationValue)) {
                                if (isClassMetadata(declarationValue)) {
                                    result = staticSymbol;
                                }
                                else {
                                    result = _this.simplify(staticSymbol, declarationValue);
                                }
                            }
                            return result;
                        case "class":
                            return context;
                        case "new":
                        case "call":
                            var target = expression['expression'];
                            staticSymbol =
                                _this.host.findDeclaration(target['module'], target['name'], context.filePath);
                            var converter = _this.conversionMap.get(staticSymbol);
                            if (lang_1.isPresent(converter)) {
                                var args = expression['arguments'];
                                if (lang_1.isBlank(args)) {
                                    args = [];
                                }
                                return converter(context, args);
                            }
                            else {
                                return context;
                            }
                    }
                    return null;
                }
                return mapStringMap(expression, function (value, name) { return simplify(value); });
            }
            return null;
        }
        return simplify(value);
    };
    /**
     * @param module an absolute path to a module file.
     */
    StaticReflector.prototype.getModuleMetadata = function (module) {
        var moduleMetadata = this.metadataCache.get(module);
        if (!lang_1.isPresent(moduleMetadata)) {
            moduleMetadata = this.host.getMetadataFor(module);
            if (!lang_1.isPresent(moduleMetadata)) {
                moduleMetadata = { __symbolic: "module", module: module, metadata: {} };
            }
            this.metadataCache.set(module, moduleMetadata);
        }
        return moduleMetadata;
    };
    StaticReflector.prototype.getTypeMetadata = function (type) {
        var moduleMetadata = this.getModuleMetadata(type.filePath);
        var result = moduleMetadata['metadata'][type.name];
        if (!lang_1.isPresent(result)) {
            result = { __symbolic: "class" };
        }
        return result;
    };
    return StaticReflector;
}());
exports.StaticReflector = StaticReflector;
function isClassMetadata(expression) {
    return !lang_1.isPrimitive(expression) && !lang_1.isArray(expression) && expression['__symbolic'] == 'class';
}
function mapStringMap(input, transform) {
    if (lang_1.isBlank(input))
        return {};
    var result = {};
    collection_1.StringMapWrapper.keys(input).forEach(function (key) { result[key] = transform(input[key], key); });
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljX3JlZmxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtUlB5bjFZVVcudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9zdGF0aWNfcmVmbGVjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwyQkFBNEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RSxxQkFPTywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xDLHlCQWVPLDRCQUE0QixDQUFDLENBQUE7QUFFcEMsMkJBQXdCLHlDQUF5QyxDQUFDLENBQUE7QUFDbEUseUJBQXVCLCtCQUErQixDQUFDLENBQUE7QUFDdkQseUJBT08sK0JBQStCLENBQUMsQ0FBQTtBQTJCdkM7Ozs7R0FJRztBQUNIO0lBQ0Usc0JBQW1CLFFBQWdCLEVBQVMsUUFBZ0IsRUFBUyxJQUFZO1FBQTlELGFBQVEsR0FBUixRQUFRLENBQVE7UUFBUyxhQUFRLEdBQVIsUUFBUSxDQUFRO1FBQVMsU0FBSSxHQUFKLElBQUksQ0FBUTtJQUFHLENBQUM7SUFDdkYsbUJBQUM7QUFBRCxDQUFDLEFBRkQsSUFFQztBQUZZLG9CQUFZLGVBRXhCLENBQUE7QUFFRDs7O0dBR0c7QUFDSDtJQU9FLHlCQUFvQixJQUF5QjtRQUF6QixTQUFJLEdBQUosSUFBSSxDQUFxQjtRQU5yQyxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUF1QixDQUFDO1FBQ2pELGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQXNDLENBQUM7UUFDOUQsbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBdUIsQ0FBQztRQUNoRCxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUFnQyxDQUFDO1FBQ3hELGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQTZELENBQUM7UUFFNUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7SUFBQyxDQUFDO0lBRWxGLG1DQUFTLEdBQVQsVUFBVSxVQUFlLElBQVksTUFBTSxDQUFnQixV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b20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1xuICBpc0FycmF5LFxuICBpc1ByZXNlbnQsXG4gIGlzQmxhbmssXG4gIGlzUHJpbWl0aXZlLFxuICBpc1N0cmluZ01hcCxcbiAgRnVuY3Rpb25XcmFwcGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1xuICBBdHRyaWJ1dGVNZXRhZGF0YSxcbiAgRGlyZWN0aXZlTWV0YWRhdGEsXG4gIENvbXBvbmVudE1ldGFkYXRhLFxuICBDb250ZW50Q2hpbGRyZW5NZXRhZGF0YSxcbiAgQ29udGVudENoaWxkTWV0YWRhdGEsXG4gIElucHV0TWV0YWRhdGEsXG4gIEhvc3RCaW5kaW5nTWV0YWRhdGEsXG4gIEhvc3RMaXN0ZW5lck1ldGFkYXRhLFxuICBPdXRwdXRNZXRhZGF0YSxcbiAgUGlwZU1ldGFkYXRhLFxuICBWaWV3Q2hpbGRNZXRhZGF0YSxcbiAgVmlld0NoaWxkcmVuTWV0YWRhdGEsXG4gIFZpZXdRdWVyeU1ldGFkYXRhLFxuICBRdWVyeU1ldGFkYXRhLFxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YSc7XG5pbXBvcnQge1JlZmxlY3RvclJlYWRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi9yZWZsZWN0b3JfcmVhZGVyJztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtQcm92aWRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvcHJvdmlkZXInO1xuaW1wb3J0IHtcbiAgSG9zdE1ldGFkYXRhLFxuICBPcHRpb25hbE1ldGFkYXRhLFxuICBJbmplY3RhYmxlTWV0YWRhdGEsXG4gIFNlbGZNZXRhZGF0YSxcbiAgU2tpcFNlbGZNZXRhZGF0YSxcbiAgSW5qZWN0TWV0YWRhdGEsXG59IGZyb20gXCJhbmd1bGFyMi9zcmMvY29yZS9kaS9tZXRhZGF0YVwiO1xuXG4vKipcbiAqIFRoZSBob3N0IG9mIHRoZSBzdGF0aWMgcmVzb2x2ZXIgaXMgZXhwZWN0ZWQgdG8gYmUgYWJsZSB0byBwcm92aWRlIG1vZHVsZSBtZXRhZGF0YSBpbiB0aGUgZm9ybSBvZlxuICogTW9kdWxlTWV0YWRhdGEuIEFuZ3VsYXIgMiBDTEkgd2lsbCBwcm9kdWNlIHRoaXMgbWV0YWRhdGEgZm9yIGEgbW9kdWxlIHdoZW5ldmVyIGEgLmQudHMgZmlsZXMgaXNcbiAqIHByb2R1Y2VkIGFuZCB0aGUgbW9kdWxlIGhhcyBleHBvcnRlZCB2YXJpYWJsZXMgb3IgY2xhc3NlcyB3aXRoIGRlY29yYXRvcnMuIE1vZHVsZSBtZXRhZGF0YSBjYW5cbiAqIGFsc28gYmUgcHJvZHVjZWQgZGlyZWN0bHkgZnJvbSBUeXBlU2NyaXB0IHNvdXJjZXMgYnkgdXNpbmcgTWV0YWRhdGFDb2xsZWN0b3IgaW4gdG9vbHMvbWV0YWRhdGEuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3RhdGljUmVmbGVjdG9ySG9zdCB7XG4gIC8qKlxuICAgKiAgUmV0dXJuIGEgTW9kdWxlTWV0YWRhdGEgZm9yIHRoZSBnaXZlbiBtb2R1bGUuXG4gICAqXG4gICAqIEBwYXJhbSBtb2R1bGVJZCBpcyBhIHN0cmluZyBpZGVudGlmaWVyIGZvciBhIG1vZHVsZSBhcyBhbiBhYnNvbHV0ZSBwYXRoLlxuICAgKiBAcmV0dXJucyB0aGUgbWV0YWRhdGEgZm9yIHRoZSBnaXZlbiBtb2R1bGUuXG4gICAqL1xuICBnZXRNZXRhZGF0YUZvcihtb2R1bGVQYXRoOiBzdHJpbmcpOiB7W2tleTogc3RyaW5nXTogYW55fTtcblxuICAvKipcbiAgICogUmVzb2x2ZSBhIHN5bWJvbCBmcm9tIGFuIGltcG9ydCBzdGF0ZW1lbnQgZm9ybSwgdG8gdGhlIGZpbGUgd2hlcmUgaXQgaXMgZGVjbGFyZWQuXG4gICAqIEBwYXJhbSBtb2R1bGUgdGhlIGxvY2F0aW9uIGltcG9ydGVkIGZyb21cbiAgICogQHBhcmFtIGNvbnRhaW5pbmdGaWxlIGZvciByZWxhdGl2ZSBpbXBvcnRzLCB0aGUgcGF0aCBvZiB0aGUgZmlsZSBjb250YWluaW5nIHRoZSBpbXBvcnRcbiAgICovXG4gIGZpbmREZWNsYXJhdGlvbihtb2R1bGVQYXRoOiBzdHJpbmcsIHN5bWJvbE5hbWU6IHN0cmluZywgY29udGFpbmluZ0ZpbGU/OiBzdHJpbmcpOiBTdGF0aWNTeW1ib2w7XG5cbiAgZ2V0U3RhdGljU3ltYm9sKG1vZHVsZUlkOiBzdHJpbmcsIGRlY2xhcmF0aW9uRmlsZTogc3RyaW5nLCBuYW1lOiBzdHJpbmcpOiBTdGF0aWNTeW1ib2w7XG59XG5cbi8qKlxuICogQSB0b2tlbiByZXByZXNlbnRpbmcgdGhlIGEgcmVmZXJlbmNlIHRvIGEgc3RhdGljIHR5cGUuXG4gKlxuICogVGhpcyB0b2tlbiBpcyB1bmlxdWUgZm9yIGEgbW9kdWxlSWQgYW5kIG5hbWUgYW5kIGNhbiBiZSB1c2VkIGFzIGEgaGFzaCB0YWJsZSBrZXkuXG4gKi9cbmV4cG9ydCBjbGFzcyBTdGF0aWNTeW1ib2wge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbW9kdWxlSWQ6IHN0cmluZywgcHVibGljIGZpbGVQYXRoOiBzdHJpbmcsIHB1YmxpYyBuYW1lOiBzdHJpbmcpIHt9XG59XG5cbi8qKlxuICogQSBzdGF0aWMgcmVmbGVjdG9yIGltcGxlbWVudHMgZW5vdWdoIG9mIHRoZSBSZWZsZWN0b3IgQVBJIHRoYXQgaXMgbmVjZXNzYXJ5IHRvIGNvbXBpbGVcbiAqIHRlbXBsYXRlcyBzdGF0aWNhbGx5LlxuICovXG5leHBvcnQgY2xhc3MgU3RhdGljUmVmbGVjdG9yIGltcGxlbWVudHMgUmVmbGVjdG9yUmVhZGVyIHtcbiAgcHJpdmF0ZSBhbm5vdGF0aW9uQ2FjaGUgPSBuZXcgTWFwPFN0YXRpY1N5bWJvbCwgYW55W10+KCk7XG4gIHByaXZhdGUgcHJvcGVydHlDYWNoZSA9IG5ldyBNYXA8U3RhdGljU3ltYm9sLCB7W2tleTogc3RyaW5nXTogYW55fT4oKTtcbiAgcHJpdmF0ZSBwYXJhbWV0ZXJDYWNoZSA9IG5ldyBNYXA8U3RhdGljU3ltYm9sLCBhbnlbXT4oKTtcbiAgcHJpdmF0ZSBtZXRhZGF0YUNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIHtba2V5OiBzdHJpbmddOiBhbnl9PigpO1xuICBwcml2YXRlIGNvbnZlcnNpb25NYXAgPSBuZXcgTWFwPFN0YXRpY1N5bWJvbCwgKGNvbnRleHQ6IFN0YXRpY1N5bWJvbCwgYXJnczogYW55W10pID0+IGFueT4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGhvc3Q6IFN0YXRpY1JlZmxlY3Rvckhvc3QpIHsgdGhpcy5pbml0aWFsaXplQ29udmVyc2lvbk1hcCgpOyB9XG5cbiAgaW1wb3J0VXJpKHR5cGVPckZ1bmM6IGFueSk6IHN0cmluZyB7IHJldHVybiAoPFN0YXRpY1N5bWJvbD50eXBlT3JGdW5jKS5maWxlUGF0aDsgfVxuXG4gIHB1YmxpYyBhbm5vdGF0aW9ucyh0eXBlOiBTdGF0aWNTeW1ib2wpOiBhbnlbXSB7XG4gICAgbGV0IGFubm90YXRpb25zID0gdGhpcy5hbm5vdGF0aW9uQ2FjaGUuZ2V0KHR5cGUpO1xuICAgIGlmICghaXNQcmVzZW50KGFubm90YXRpb25zKSkge1xuICAgICAgbGV0IGNsYXNzTWV0YWRhdGEgPSB0aGlzLmdldFR5cGVNZXRhZGF0YSh0eXBlKTtcbiAgICAgIGlmIChpc1ByZXNlbnQoY2xhc3NNZXRhZGF0YVsnZGVjb3JhdG9ycyddKSkge1xuICAgICAgICBhbm5vdGF0aW9ucyA9IHRoaXMuc2ltcGxpZnkodHlwZSwgY2xhc3NNZXRhZGF0YVsnZGVjb3JhdG9ycyddKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFubm90YXRpb25zID0gW107XG4gICAgICB9XG4gICAgICB0aGlzLmFubm90YXRpb25DYWNoZS5zZXQodHlwZSwgYW5ub3RhdGlvbnMuZmlsdGVyKGFubiA9PiBpc1ByZXNlbnQoYW5uKSkpO1xuICAgIH1cbiAgICByZXR1cm4gYW5ub3RhdGlvbnM7XG4gIH1cblxuICBwdWJsaWMgcHJvcE1ldGFkYXRhKHR5cGU6IFN0YXRpY1N5bWJvbCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICBsZXQgcHJvcE1ldGFkYXRhID0gdGhpcy5wcm9wZXJ0eUNhY2hlLmdldCh0eXBlKTtcbiAgICBpZiAoIWlzUHJlc2VudChwcm9wTWV0YWRhdGEpKSB7XG4gICAgICBsZXQgY2xhc3NNZXRhZGF0YSA9IHRoaXMuZ2V0VHlwZU1ldGFkYXRhKHR5cGUpO1xuICAgICAgbGV0IG1lbWJlcnMgPSBpc1ByZXNlbnQoY2xhc3NNZXRhZGF0YSkgPyBjbGFzc01ldGFkYXRhWydtZW1iZXJzJ10gOiB7fTtcbiAgICAgIHByb3BNZXRhZGF0YSA9IG1hcFN0cmluZ01hcChtZW1iZXJzLCAocHJvcERhdGEsIHByb3BOYW1lKSA9PiB7XG4gICAgICAgIGxldCBwcm9wID0gKDxhbnlbXT5wcm9wRGF0YSkuZmluZChhID0+IGFbJ19fc3ltYm9saWMnXSA9PSAncHJvcGVydHknKTtcbiAgICAgICAgaWYgKGlzUHJlc2VudChwcm9wKSAmJiBpc1ByZXNlbnQocHJvcFsnZGVjb3JhdG9ycyddKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnNpbXBsaWZ5KHR5cGUsIHByb3BbJ2RlY29yYXRvcnMnXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMucHJvcGVydHlDYWNoZS5zZXQodHlwZSwgcHJvcE1ldGFkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIHByb3BNZXRhZGF0YTtcbiAgfVxuXG4gIHB1YmxpYyBwYXJhbWV0ZXJzKHR5cGU6IFN0YXRpY1N5bWJvbCk6IGFueVtdIHtcbiAgICB0cnkge1xuICAgICAgbGV0IHBhcmFtZXRlcnMgPSB0aGlzLnBhcmFtZXRlckNhY2hlLmdldCh0eXBlKTtcbiAgICAgIGlmICghaXNQcmVzZW50KHBhcmFtZXRlcnMpKSB7XG4gICAgICAgIGxldCBjbGFzc01ldGFkYXRhID0gdGhpcy5nZXRUeXBlTWV0YWRhdGEodHlwZSk7XG4gICAgICAgIGxldCBtZW1iZXJzID0gaXNQcmVzZW50KGNsYXNzTWV0YWRhdGEpID8gY2xhc3NNZXRhZGF0YVsnbWVtYmVycyddIDogbnVsbDtcbiAgICAgICAgbGV0IGN0b3JEYXRhID0gaXNQcmVzZW50KG1lbWJlcnMpID8gbWVtYmVyc1snX19jdG9yX18nXSA6IG51bGw7XG4gICAgICAgIGlmIChpc1ByZXNlbnQoY3RvckRhdGEpKSB7XG4gICAgICAgICAgbGV0IGN0b3IgPSAoPGFueVtdPmN0b3JEYXRhKS5maW5kKGEgPT4gYVsnX19zeW1ib2xpYyddID09ICdjb25zdHJ1Y3RvcicpO1xuICAgICAgICAgIGxldCBwYXJhbWV0ZXJUeXBlcyA9IDxhbnlbXT50aGlzLnNpbXBsaWZ5KHR5cGUsIGN0b3JbJ3BhcmFtZXRlcnMnXSk7XG4gICAgICAgICAgbGV0IHBhcmFtZXRlckRlY29yYXRvcnMgPSA8YW55W10+dGhpcy5zaW1wbGlmeSh0eXBlLCBjdG9yWydwYXJhbWV0ZXJEZWNvcmF0b3JzJ10pO1xuXG4gICAgICAgICAgcGFyYW1ldGVycyA9IFtdO1xuICAgICAgICAgIExpc3RXcmFwcGVyLmZvckVhY2hXaXRoSW5kZXgocGFyYW1ldGVyVHlwZXMsIChwYXJhbVR5cGUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBsZXQgbmVzdGVkUmVzdWx0ID0gW107XG4gICAgICAgICAgICBpZiAoaXNQcmVzZW50KHBhcmFtVHlwZSkpIHtcbiAgICAgICAgICAgICAgbmVzdGVkUmVzdWx0LnB1c2gocGFyYW1UeXBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBkZWNvcmF0b3JzID0gaXNQcmVzZW50KHBhcmFtZXRlckRlY29yYXRvcnMpID8gcGFyYW1ldGVyRGVjb3JhdG9yc1tpbmRleF0gOiBudWxsO1xuICAgICAgICAgICAgaWYgKGlzUHJlc2VudChkZWNvcmF0b3JzKSkge1xuICAgICAgICAgICAgICBMaXN0V3JhcHBlci5hZGRBbGwobmVzdGVkUmVzdWx0LCBkZWNvcmF0b3JzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcmFtZXRlcnMucHVzaChuZXN0ZWRSZXN1bHQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaXNQcmVzZW50KHBhcmFtZXRlcnMpKSB7XG4gICAgICAgICAgcGFyYW1ldGVycyA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucGFyYW1ldGVyQ2FjaGUuc2V0KHR5cGUsIHBhcmFtZXRlcnMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBhcmFtZXRlcnM7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5sb2coYEZhaWxlZCBvbiB0eXBlICR7dHlwZX0gd2l0aCBlcnJvciAke2V9YCk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHR5cGU6IFN0YXRpY1N5bWJvbCwgY3RvcjogYW55KTogdm9pZCB7XG4gICAgdGhpcy5jb252ZXJzaW9uTWFwLnNldCh0eXBlLCAoY29udGV4dDogU3RhdGljU3ltYm9sLCBhcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgbGV0IGFyZ1ZhbHVlcyA9IFtdO1xuICAgICAgTGlzdFdyYXBwZXIuZm9yRWFjaFdpdGhJbmRleChhcmdzLCAoYXJnLCBpbmRleCkgPT4ge1xuICAgICAgICBsZXQgYXJnVmFsdWU7XG4gICAgICAgIGlmIChpc1N0cmluZ01hcChhcmcpICYmIGlzQmxhbmsoYXJnWydfX3N5bWJvbGljJ10pKSB7XG4gICAgICAgICAgYXJnVmFsdWUgPSBtYXBTdHJpbmdNYXAoYXJnLCAodmFsdWUsIGtleSkgPT4gdGhpcy5zaW1wbGlmeShjb250ZXh0LCB2YWx1ZSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFyZ1ZhbHVlID0gdGhpcy5zaW1wbGlmeShjb250ZXh0LCBhcmcpO1xuICAgICAgICB9XG4gICAgICAgIGFyZ1ZhbHVlcy5wdXNoKGFyZ1ZhbHVlKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIEZ1bmN0aW9uV3JhcHBlci5hcHBseShyZWZsZWN0b3IuZmFjdG9yeShjdG9yKSwgYXJnVmFsdWVzKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgaW5pdGlhbGl6ZUNvbnZlcnNpb25NYXAoKTogdm9pZCB7XG4gICAgbGV0IGNvcmVEZWNvcmF0b3JzID0gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhJztcbiAgICBsZXQgZGlEZWNvcmF0b3JzID0gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpL2RlY29yYXRvcnMnO1xuICAgIGxldCBkaU1ldGFkYXRhID0gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpL21ldGFkYXRhJztcbiAgICBsZXQgcHJvdmlkZXIgPSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvcHJvdmlkZXInO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24ocHJvdmlkZXIsICdQcm92aWRlcicpLCBQcm92aWRlcik7XG5cbiAgICB0aGlzLnJlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3Rvcih0aGlzLmhvc3QuZmluZERlY2xhcmF0aW9uKGRpRGVjb3JhdG9ycywgJ0hvc3QnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBIb3N0TWV0YWRhdGEpO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oZGlEZWNvcmF0b3JzLCAnSW5qZWN0YWJsZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEluamVjdGFibGVNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihkaURlY29yYXRvcnMsICdTZWxmJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2VsZk1ldGFkYXRhKTtcbiAgICB0aGlzLnJlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3Rvcih0aGlzLmhvc3QuZmluZERlY2xhcmF0aW9uKGRpRGVjb3JhdG9ycywgJ1NraXBTZWxmJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2tpcFNlbGZNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihkaURlY29yYXRvcnMsICdJbmplY3QnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJbmplY3RNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihkaURlY29yYXRvcnMsICdPcHRpb25hbCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9wdGlvbmFsTWV0YWRhdGEpO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oY29yZURlY29yYXRvcnMsICdBdHRyaWJ1dGUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBdHRyaWJ1dGVNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihjb3JlRGVjb3JhdG9ycywgJ1F1ZXJ5JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUXVlcnlNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihjb3JlRGVjb3JhdG9ycywgJ1ZpZXdRdWVyeScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZpZXdRdWVyeU1ldGFkYXRhKTtcbiAgICB0aGlzLnJlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3Rvcih0aGlzLmhvc3QuZmluZERlY2xhcmF0aW9uKGNvcmVEZWNvcmF0b3JzLCAnQ29udGVudENoaWxkJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ29udGVudENoaWxkTWV0YWRhdGEpO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKFxuICAgICAgICB0aGlzLmhvc3QuZmluZERlY2xhcmF0aW9uKGNvcmVEZWNvcmF0b3JzLCAnQ29udGVudENoaWxkcmVuJyksIENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhKTtcbiAgICB0aGlzLnJlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3Rvcih0aGlzLmhvc3QuZmluZERlY2xhcmF0aW9uKGNvcmVEZWNvcmF0b3JzLCAnVmlld0NoaWxkJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVmlld0NoaWxkTWV0YWRhdGEpO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oY29yZURlY29yYXRvcnMsICdWaWV3Q2hpbGRyZW4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBWaWV3Q2hpbGRyZW5NZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihjb3JlRGVjb3JhdG9ycywgJ0lucHV0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSW5wdXRNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihjb3JlRGVjb3JhdG9ycywgJ091dHB1dCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE91dHB1dE1ldGFkYXRhKTtcbiAgICB0aGlzLnJlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3Rvcih0aGlzLmhvc3QuZmluZERlY2xhcmF0aW9uKGNvcmVEZWNvcmF0b3JzLCAnUGlwZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFBpcGVNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihjb3JlRGVjb3JhdG9ycywgJ0hvc3RCaW5kaW5nJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSG9zdEJpbmRpbmdNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihjb3JlRGVjb3JhdG9ycywgJ0hvc3RMaXN0ZW5lcicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEhvc3RMaXN0ZW5lck1ldGFkYXRhKTtcbiAgICB0aGlzLnJlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3Rvcih0aGlzLmhvc3QuZmluZERlY2xhcmF0aW9uKGNvcmVEZWNvcmF0b3JzLCAnRGlyZWN0aXZlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRGlyZWN0aXZlTWV0YWRhdGEpO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oY29yZURlY29yYXRvcnMsICdDb21wb25lbnQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDb21wb25lbnRNZXRhZGF0YSk7XG5cbiAgICAvLyBOb3RlOiBTb21lIG1ldGFkYXRhIGNsYXNzZXMgY2FuIGJlIHVzZWQgZGlyZWN0bHkgd2l0aCBQcm92aWRlci5kZXBzLlxuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oZGlNZXRhZGF0YSwgJ0hvc3RNZXRhZGF0YScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEhvc3RNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihkaU1ldGFkYXRhLCAnU2VsZk1ldGFkYXRhJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2VsZk1ldGFkYXRhKTtcbiAgICB0aGlzLnJlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3Rvcih0aGlzLmhvc3QuZmluZERlY2xhcmF0aW9uKGRpTWV0YWRhdGEsICdTa2lwU2VsZk1ldGFkYXRhJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2tpcFNlbGZNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihkaU1ldGFkYXRhLCAnT3B0aW9uYWxNZXRhZGF0YScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9wdGlvbmFsTWV0YWRhdGEpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwdWJsaWMgc2ltcGxpZnkoY29udGV4dDogU3RhdGljU3ltYm9sLCB2YWx1ZTogYW55KTogYW55IHtcbiAgICBsZXQgX3RoaXMgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gc2ltcGxpZnkoZXhwcmVzc2lvbjogYW55KTogYW55IHtcbiAgICAgIGlmIChpc1ByaW1pdGl2ZShleHByZXNzaW9uKSkge1xuICAgICAgICByZXR1cm4gZXhwcmVzc2lvbjtcbiAgICAgIH1cbiAgICAgIGlmIChpc0FycmF5KGV4cHJlc3Npb24pKSB7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaXRlbSBvZig8YW55PmV4cHJlc3Npb24pKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2goc2ltcGxpZnkoaXRlbSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KGV4cHJlc3Npb24pKSB7XG4gICAgICAgIGlmIChpc1ByZXNlbnQoZXhwcmVzc2lvblsnX19zeW1ib2xpYyddKSkge1xuICAgICAgICAgIGxldCBzdGF0aWNTeW1ib2w7XG4gICAgICAgICAgc3dpdGNoIChleHByZXNzaW9uWydfX3N5bWJvbGljJ10pIHtcbiAgICAgICAgICAgIGNhc2UgXCJiaW5vcFwiOlxuICAgICAgICAgICAgICBsZXQgbGVmdCA9IHNpbXBsaWZ5KGV4cHJlc3Npb25bJ2xlZnQnXSk7XG4gICAgICAgICAgICAgIGxldCByaWdodCA9IHNpbXBsaWZ5KGV4cHJlc3Npb25bJ3JpZ2h0J10pO1xuICAgICAgICAgICAgICBzd2l0Y2ggKGV4cHJlc3Npb25bJ29wZXJhdG9yJ10pIHtcbiAgICAgICAgICAgICAgICBjYXNlICcmJic6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAmJiByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICd8fCc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCB8fCByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICd8JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IHwgcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnXic6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCBeIHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJyYnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgJiByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICc9PSc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA9PSByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICchPSc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAhPSByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICc9PT0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPT09IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJyE9PSc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAhPT0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA8IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJz4nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPiByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICc8PSc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA8PSByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICc+PSc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA+PSByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICc8PCc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA8PCByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICc+Pic6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA+PiByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICcrJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICsgcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnLSc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAtIHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJyonOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgKiByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICcvJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IC8gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnJSc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAlIHJpZ2h0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY2FzZSBcInByZVwiOlxuICAgICAgICAgICAgICBsZXQgb3BlcmFuZCA9IHNpbXBsaWZ5KGV4cHJlc3Npb25bJ29wZXJhbmQnXSk7XG4gICAgICAgICAgICAgIHN3aXRjaCAoZXhwcmVzc2lvblsnb3BlcmF0b3InXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJysnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIG9wZXJhbmQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnLSc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gLW9wZXJhbmQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnISc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gIW9wZXJhbmQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnfic6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gfm9wZXJhbmQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjYXNlIFwiaW5kZXhcIjpcbiAgICAgICAgICAgICAgbGV0IGluZGV4VGFyZ2V0ID0gc2ltcGxpZnkoZXhwcmVzc2lvblsnZXhwcmVzc2lvbiddKTtcbiAgICAgICAgICAgICAgbGV0IGluZGV4ID0gc2ltcGxpZnkoZXhwcmVzc2lvblsnaW5kZXgnXSk7XG4gICAgICAgICAgICAgIGlmIChpc1ByZXNlbnQoaW5kZXhUYXJnZXQpICYmIGlzUHJpbWl0aXZlKGluZGV4KSkgcmV0dXJuIGluZGV4VGFyZ2V0W2luZGV4XTtcbiAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjYXNlIFwic2VsZWN0XCI6XG4gICAgICAgICAgICAgIGxldCBzZWxlY3RUYXJnZXQgPSBzaW1wbGlmeShleHByZXNzaW9uWydleHByZXNzaW9uJ10pO1xuICAgICAgICAgICAgICBsZXQgbWVtYmVyID0gc2ltcGxpZnkoZXhwcmVzc2lvblsnbWVtYmVyJ10pO1xuICAgICAgICAgICAgICBpZiAoaXNQcmVzZW50KHNlbGVjdFRhcmdldCkgJiYgaXNQcmltaXRpdmUobWVtYmVyKSkgcmV0dXJuIHNlbGVjdFRhcmdldFttZW1iZXJdO1xuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNhc2UgXCJyZWZlcmVuY2VcIjpcbiAgICAgICAgICAgICAgaWYgKGlzUHJlc2VudChleHByZXNzaW9uWydtb2R1bGUnXSkpIHtcbiAgICAgICAgICAgICAgICBzdGF0aWNTeW1ib2wgPSBfdGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihleHByZXNzaW9uWydtb2R1bGUnXSwgZXhwcmVzc2lvblsnbmFtZSddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsZVBhdGgpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0YXRpY1N5bWJvbCA9IF90aGlzLmhvc3QuZ2V0U3RhdGljU3ltYm9sKGNvbnRleHQubW9kdWxlSWQsIGNvbnRleHQuZmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvblsnbmFtZSddKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0gc3RhdGljU3ltYm9sO1xuICAgICAgICAgICAgICBsZXQgbW9kdWxlTWV0YWRhdGEgPSBfdGhpcy5nZXRNb2R1bGVNZXRhZGF0YShzdGF0aWNTeW1ib2wuZmlsZVBhdGgpO1xuICAgICAgICAgICAgICBsZXQgZGVjbGFyYXRpb25WYWx1ZSA9XG4gICAgICAgICAgICAgICAgICBpc1ByZXNlbnQobW9kdWxlTWV0YWRhdGEpID8gbW9kdWxlTWV0YWRhdGFbJ21ldGFkYXRhJ11bc3RhdGljU3ltYm9sLm5hbWVdIDogbnVsbDtcbiAgICAgICAgICAgICAgaWYgKGlzUHJlc2VudChkZWNsYXJhdGlvblZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGlmIChpc0NsYXNzTWV0YWRhdGEoZGVjbGFyYXRpb25WYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHN0YXRpY1N5bWJvbDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gX3RoaXMuc2ltcGxpZnkoc3RhdGljU3ltYm9sLCBkZWNsYXJhdGlvblZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIGNhc2UgXCJjbGFzc1wiOlxuICAgICAgICAgICAgICByZXR1cm4gY29udGV4dDtcbiAgICAgICAgICAgIGNhc2UgXCJuZXdcIjpcbiAgICAgICAgICAgIGNhc2UgXCJjYWxsXCI6XG4gICAgICAgICAgICAgIGxldCB0YXJnZXQgPSBleHByZXNzaW9uWydleHByZXNzaW9uJ107XG4gICAgICAgICAgICAgIHN0YXRpY1N5bWJvbCA9XG4gICAgICAgICAgICAgICAgICBfdGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbih0YXJnZXRbJ21vZHVsZSddLCB0YXJnZXRbJ25hbWUnXSwgY29udGV4dC5maWxlUGF0aCk7XG4gICAgICAgICAgICAgIGxldCBjb252ZXJ0ZXIgPSBfdGhpcy5jb252ZXJzaW9uTWFwLmdldChzdGF0aWNTeW1ib2wpO1xuICAgICAgICAgICAgICBpZiAoaXNQcmVzZW50KGNvbnZlcnRlcikpIHtcbiAgICAgICAgICAgICAgICBsZXQgYXJncyA9IGV4cHJlc3Npb25bJ2FyZ3VtZW50cyddO1xuICAgICAgICAgICAgICAgIGlmIChpc0JsYW5rKGFyZ3MpKSB7XG4gICAgICAgICAgICAgICAgICBhcmdzID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBjb252ZXJ0ZXIoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hcFN0cmluZ01hcChleHByZXNzaW9uLCAodmFsdWUsIG5hbWUpID0+IHNpbXBsaWZ5KHZhbHVlKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gc2ltcGxpZnkodmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBtb2R1bGUgYW4gYWJzb2x1dGUgcGF0aCB0byBhIG1vZHVsZSBmaWxlLlxuICAgKi9cbiAgcHVibGljIGdldE1vZHVsZU1ldGFkYXRhKG1vZHVsZTogc3RyaW5nKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIGxldCBtb2R1bGVNZXRhZGF0YSA9IHRoaXMubWV0YWRhdGFDYWNoZS5nZXQobW9kdWxlKTtcbiAgICBpZiAoIWlzUHJlc2VudChtb2R1bGVNZXRhZGF0YSkpIHtcbiAgICAgIG1vZHVsZU1ldGFkYXRhID0gdGhpcy5ob3N0LmdldE1ldGFkYXRhRm9yKG1vZHVsZSk7XG4gICAgICBpZiAoIWlzUHJlc2VudChtb2R1bGVNZXRhZGF0YSkpIHtcbiAgICAgICAgbW9kdWxlTWV0YWRhdGEgPSB7X19zeW1ib2xpYzogXCJtb2R1bGVcIiwgbW9kdWxlOiBtb2R1bGUsIG1ldGFkYXRhOiB7fX07XG4gICAgICB9XG4gICAgICB0aGlzLm1ldGFkYXRhQ2FjaGUuc2V0KG1vZHVsZSwgbW9kdWxlTWV0YWRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gbW9kdWxlTWV0YWRhdGE7XG4gIH1cblxuICBwcml2YXRlIGdldFR5cGVNZXRhZGF0YSh0eXBlOiBTdGF0aWNTeW1ib2wpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgbGV0IG1vZHVsZU1ldGFkYXRhID0gdGhpcy5nZXRNb2R1bGVNZXRhZGF0YSh0eXBlLmZpbGVQYXRoKTtcbiAgICBsZXQgcmVzdWx0ID0gbW9kdWxlTWV0YWRhdGFbJ21ldGFkYXRhJ11bdHlwZS5uYW1lXTtcbiAgICBpZiAoIWlzUHJlc2VudChyZXN1bHQpKSB7XG4gICAgICByZXN1bHQgPSB7X19zeW1ib2xpYzogXCJjbGFzc1wifTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc0NsYXNzTWV0YWRhdGEoZXhwcmVzc2lvbjogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiAhaXNQcmltaXRpdmUoZXhwcmVzc2lvbikgJiYgIWlzQXJyYXkoZXhwcmVzc2lvbikgJiYgZXhwcmVzc2lvblsnX19zeW1ib2xpYyddID09ICdjbGFzcyc7XG59XG5cbmZ1bmN0aW9uIG1hcFN0cmluZ01hcChpbnB1dDoge1trZXk6IHN0cmluZ106IGFueX0sXG4gICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAodmFsdWU6IGFueSwga2V5OiBzdHJpbmcpID0+IGFueSk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgaWYgKGlzQmxhbmsoaW5wdXQpKSByZXR1cm4ge307XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgU3RyaW5nTWFwV3JhcHBlci5rZXlzKGlucHV0KS5mb3JFYWNoKChrZXkpID0+IHsgcmVzdWx0W2tleV0gPSB0cmFuc2Zvcm0oaW5wdXRba2V5XSwga2V5KTsgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG4iXX0=