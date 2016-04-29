'use strict';"use strict";
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var metadata_1 = require('angular2/src/core/metadata');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var provider_1 = require('angular2/src/core/di/provider');
var metadata_2 = require("angular2/src/core/di/metadata");
var ModuleContext = (function () {
    function ModuleContext(moduleId, filePath) {
        this.moduleId = moduleId;
        this.filePath = filePath;
    }
    return ModuleContext;
}());
exports.ModuleContext = ModuleContext;
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
                annotations = this.simplify(type, classMetadata['decorators'], false);
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
                    return _this.simplify(type, prop['decorators'], false);
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
        var parameters = this.parameterCache.get(type);
        if (!lang_1.isPresent(parameters)) {
            var classMetadata = this.getTypeMetadata(type);
            var members = lang_1.isPresent(classMetadata) ? classMetadata['members'] : null;
            var ctorData = lang_1.isPresent(members) ? members['__ctor__'] : null;
            if (lang_1.isPresent(ctorData)) {
                var ctor = ctorData.find(function (a) { return a['__symbolic'] == 'constructor'; });
                var parameterTypes = this.simplify(type, ctor['parameters'], false);
                var parameterDecorators_1 = this.simplify(type, ctor['parameterDecorators'], false);
                parameters = [];
                collection_1.ListWrapper.forEachWithIndex(parameterTypes, function (paramType, index) {
                    var nestedResult = [];
                    if (lang_1.isPresent(paramType)) {
                        nestedResult.push(paramType);
                    }
                    var decorators = lang_1.isPresent(parameterDecorators_1) ? parameterDecorators_1[index] : null;
                    if (lang_1.isPresent(decorators)) {
                        collection_1.ListWrapper.addAll(nestedResult, decorators);
                    }
                    parameters.push(nestedResult);
                });
            }
            if (!lang_1.isPresent(parameters)) {
                parameters = [];
            }
            this.parameterCache.set(type, parameters);
        }
        return parameters;
    };
    StaticReflector.prototype.registerDecoratorOrConstructor = function (type, ctor, crossModuleProps) {
        var _this = this;
        if (crossModuleProps === void 0) { crossModuleProps = lang_1.CONST_EXPR([]); }
        this.conversionMap.set(type, function (moduleContext, args) {
            var argValues = [];
            collection_1.ListWrapper.forEachWithIndex(args, function (arg, index) {
                var argValue;
                if (lang_1.isStringMap(arg) && lang_1.isBlank(arg['__symbolic'])) {
                    argValue =
                        mapStringMap(arg, function (value, key) { return _this.simplify(moduleContext, value, crossModuleProps.indexOf(key) !== -1); });
                }
                else {
                    argValue = _this.simplify(moduleContext, arg, crossModuleProps.indexOf(index) !== -1);
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
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Directive'), metadata_1.DirectiveMetadata, ['bindings', 'providers']);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Component'), metadata_1.ComponentMetadata, ['bindings', 'providers', 'directives', 'pipes']);
        // Note: Some metadata classes can be used directly with Provider.deps.
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'HostMetadata'), metadata_2.HostMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'SelfMetadata'), metadata_2.SelfMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'SkipSelfMetadata'), metadata_2.SkipSelfMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'OptionalMetadata'), metadata_2.OptionalMetadata);
    };
    /** @internal */
    StaticReflector.prototype.simplify = function (moduleContext, value, crossModules) {
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
                                staticSymbol = _this.host.findDeclaration(expression['module'], expression['name'], moduleContext.filePath);
                            }
                            else {
                                staticSymbol = _this.host.getStaticSymbol(moduleContext.moduleId, moduleContext.filePath, expression['name']);
                            }
                            var result = void 0;
                            if (crossModules || lang_1.isBlank(expression['module'])) {
                                var moduleMetadata = _this.getModuleMetadata(staticSymbol.filePath);
                                var declarationValue = moduleMetadata['metadata'][staticSymbol.name];
                                if (isClassMetadata(declarationValue)) {
                                    result = staticSymbol;
                                }
                                else {
                                    var newModuleContext = new ModuleContext(staticSymbol.moduleId, staticSymbol.filePath);
                                    result = _this.simplify(newModuleContext, declarationValue, crossModules);
                                }
                            }
                            else {
                                result = staticSymbol;
                            }
                            return result;
                        case "new":
                        case "call":
                            var target = expression['expression'];
                            staticSymbol = _this.host.findDeclaration(target['module'], target['name'], moduleContext.filePath);
                            var converter = _this.conversionMap.get(staticSymbol);
                            var args = expression['arguments'];
                            if (lang_1.isBlank(args)) {
                                args = [];
                            }
                            return lang_1.isPresent(converter) ? converter(moduleContext, args) : null;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljX3JlZmxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtVzVWZ0tuQkYudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9zdGF0aWNfcmVmbGVjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwyQkFBNEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RSxxQkFRTywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xDLHlCQWVPLDRCQUE0QixDQUFDLENBQUE7QUFFcEMsMkJBQXdCLHlDQUF5QyxDQUFDLENBQUE7QUFDbEUseUJBQXVCLCtCQUErQixDQUFDLENBQUE7QUFDdkQseUJBT08sK0JBQStCLENBQUMsQ0FBQTtBQUV2QztJQUNFLHVCQUFtQixRQUFnQixFQUFTLFFBQWdCO1FBQXpDLGFBQVEsR0FBUixRQUFRLENBQVE7UUFBUyxhQUFRLEdBQVIsUUFBUSxDQUFRO0lBQUcsQ0FBQztJQUNsRSxvQkFBQztBQUFELENBQUMsQUFGRCxJQUVDO0FBRlkscUJBQWEsZ0JBRXpCLENBQUE7QUEyQkQ7Ozs7R0FJRztBQUNIO0lBQ0Usc0JBQW1CLFFBQWdCLEVBQVMsUUFBZ0IsRUFBUyxJQUFZO1FBQTlELGFBQVEsR0FBUixRQUFRLENBQVE7UUFBUyxhQUFRLEdBQVIsUUFBUSxDQUFRO1FBQVMsU0FBSSxHQUFKLElBQUksQ0FBUTtJQUFHLENBQUM7SUFDdkYsbUJBQUM7QUFBRCxDQUFDLEFBRkQsSUFFQztBQUZZLG9CQUFZLGVBRXhCLENBQUE7QUFFRDs7O0dBR0c7QUFDSDtJQVFFLHlCQUFvQixJQUF5QjtRQUF6QixTQUFJLEdBQUosSUFBSSxDQUFxQjtRQVByQyxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUF1QixDQUFDO1FBQ2pELGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQXNDLENBQUM7UUFDOUQsbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBdUIsQ0FBQztRQUNoRCxrQkFBYSxH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QzlCLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNoQiw2QkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBRyxJQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0YsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7XG4gIGlzQXJyYXksXG4gIGlzUHJlc2VudCxcbiAgaXNCbGFuayxcbiAgaXNQcmltaXRpdmUsXG4gIGlzU3RyaW5nTWFwLFxuICBDT05TVF9FWFBSLFxuICBGdW5jdGlvbldyYXBwZXJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7XG4gIEF0dHJpYnV0ZU1ldGFkYXRhLFxuICBEaXJlY3RpdmVNZXRhZGF0YSxcbiAgQ29tcG9uZW50TWV0YWRhdGEsXG4gIENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhLFxuICBDb250ZW50Q2hpbGRNZXRhZGF0YSxcbiAgSW5wdXRNZXRhZGF0YSxcbiAgSG9zdEJpbmRpbmdNZXRhZGF0YSxcbiAgSG9zdExpc3RlbmVyTWV0YWRhdGEsXG4gIE91dHB1dE1ldGFkYXRhLFxuICBQaXBlTWV0YWRhdGEsXG4gIFZpZXdDaGlsZE1ldGFkYXRhLFxuICBWaWV3Q2hpbGRyZW5NZXRhZGF0YSxcbiAgVmlld1F1ZXJ5TWV0YWRhdGEsXG4gIFF1ZXJ5TWV0YWRhdGEsXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhJztcbmltcG9ydCB7UmVmbGVjdG9yUmVhZGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rvcl9yZWFkZXInO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5pbXBvcnQge1Byb3ZpZGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9wcm92aWRlcic7XG5pbXBvcnQge1xuICBIb3N0TWV0YWRhdGEsXG4gIE9wdGlvbmFsTWV0YWRhdGEsXG4gIEluamVjdGFibGVNZXRhZGF0YSxcbiAgU2VsZk1ldGFkYXRhLFxuICBTa2lwU2VsZk1ldGFkYXRhLFxuICBJbmplY3RNZXRhZGF0YVxufSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvcmUvZGkvbWV0YWRhdGFcIjtcblxuZXhwb3J0IGNsYXNzIE1vZHVsZUNvbnRleHQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbW9kdWxlSWQ6IHN0cmluZywgcHVibGljIGZpbGVQYXRoOiBzdHJpbmcpIHt9XG59XG5cbi8qKlxuICogVGhlIGhvc3Qgb2YgdGhlIHN0YXRpYyByZXNvbHZlciBpcyBleHBlY3RlZCB0byBiZSBhYmxlIHRvIHByb3ZpZGUgbW9kdWxlIG1ldGFkYXRhIGluIHRoZSBmb3JtIG9mXG4gKiBNb2R1bGVNZXRhZGF0YS4gQW5ndWxhciAyIENMSSB3aWxsIHByb2R1Y2UgdGhpcyBtZXRhZGF0YSBmb3IgYSBtb2R1bGUgd2hlbmV2ZXIgYSAuZC50cyBmaWxlcyBpc1xuICogcHJvZHVjZWQgYW5kIHRoZSBtb2R1bGUgaGFzIGV4cG9ydGVkIHZhcmlhYmxlcyBvciBjbGFzc2VzIHdpdGggZGVjb3JhdG9ycy4gTW9kdWxlIG1ldGFkYXRhIGNhblxuICogYWxzbyBiZSBwcm9kdWNlZCBkaXJlY3RseSBmcm9tIFR5cGVTY3JpcHQgc291cmNlcyBieSB1c2luZyBNZXRhZGF0YUNvbGxlY3RvciBpbiB0b29scy9tZXRhZGF0YS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdGF0aWNSZWZsZWN0b3JIb3N0IHtcbiAgLyoqXG4gICAqICBSZXR1cm4gYSBNb2R1bGVNZXRhZGF0YSBmb3IgdGhlIGdpdmVuIG1vZHVsZS5cbiAgICpcbiAgICogQHBhcmFtIG1vZHVsZUlkIGlzIGEgc3RyaW5nIGlkZW50aWZpZXIgZm9yIGEgbW9kdWxlIGFzIGFuIGFic29sdXRlIHBhdGguXG4gICAqIEByZXR1cm5zIHRoZSBtZXRhZGF0YSBmb3IgdGhlIGdpdmVuIG1vZHVsZS5cbiAgICovXG4gIGdldE1ldGFkYXRhRm9yKG1vZHVsZVBhdGg6IHN0cmluZyk6IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuXG4gIC8qKlxuICAgKiBSZXNvbHZlIGEgc3ltYm9sIGZyb20gYW4gaW1wb3J0IHN0YXRlbWVudCBmb3JtLCB0byB0aGUgZmlsZSB3aGVyZSBpdCBpcyBkZWNsYXJlZC5cbiAgICogQHBhcmFtIG1vZHVsZSB0aGUgbG9jYXRpb24gaW1wb3J0ZWQgZnJvbVxuICAgKiBAcGFyYW0gY29udGFpbmluZ0ZpbGUgZm9yIHJlbGF0aXZlIGltcG9ydHMsIHRoZSBwYXRoIG9mIHRoZSBmaWxlIGNvbnRhaW5pbmcgdGhlIGltcG9ydFxuICAgKi9cbiAgZmluZERlY2xhcmF0aW9uKG1vZHVsZVBhdGg6IHN0cmluZywgc3ltYm9sTmFtZTogc3RyaW5nLCBjb250YWluaW5nRmlsZT86IHN0cmluZyk6IFN0YXRpY1N5bWJvbDtcblxuICBnZXRTdGF0aWNTeW1ib2wobW9kdWxlSWQ6IHN0cmluZywgZGVjbGFyYXRpb25GaWxlOiBzdHJpbmcsIG5hbWU6IHN0cmluZyk6IFN0YXRpY1N5bWJvbDtcbn1cblxuLyoqXG4gKiBBIHRva2VuIHJlcHJlc2VudGluZyB0aGUgYSByZWZlcmVuY2UgdG8gYSBzdGF0aWMgdHlwZS5cbiAqXG4gKiBUaGlzIHRva2VuIGlzIHVuaXF1ZSBmb3IgYSBtb2R1bGVJZCBhbmQgbmFtZSBhbmQgY2FuIGJlIHVzZWQgYXMgYSBoYXNoIHRhYmxlIGtleS5cbiAqL1xuZXhwb3J0IGNsYXNzIFN0YXRpY1N5bWJvbCBpbXBsZW1lbnRzIE1vZHVsZUNvbnRleHQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbW9kdWxlSWQ6IHN0cmluZywgcHVibGljIGZpbGVQYXRoOiBzdHJpbmcsIHB1YmxpYyBuYW1lOiBzdHJpbmcpIHt9XG59XG5cbi8qKlxuICogQSBzdGF0aWMgcmVmbGVjdG9yIGltcGxlbWVudHMgZW5vdWdoIG9mIHRoZSBSZWZsZWN0b3IgQVBJIHRoYXQgaXMgbmVjZXNzYXJ5IHRvIGNvbXBpbGVcbiAqIHRlbXBsYXRlcyBzdGF0aWNhbGx5LlxuICovXG5leHBvcnQgY2xhc3MgU3RhdGljUmVmbGVjdG9yIGltcGxlbWVudHMgUmVmbGVjdG9yUmVhZGVyIHtcbiAgcHJpdmF0ZSBhbm5vdGF0aW9uQ2FjaGUgPSBuZXcgTWFwPFN0YXRpY1N5bWJvbCwgYW55W10+KCk7XG4gIHByaXZhdGUgcHJvcGVydHlDYWNoZSA9IG5ldyBNYXA8U3RhdGljU3ltYm9sLCB7W2tleTogc3RyaW5nXTogYW55fT4oKTtcbiAgcHJpdmF0ZSBwYXJhbWV0ZXJDYWNoZSA9IG5ldyBNYXA8U3RhdGljU3ltYm9sLCBhbnlbXT4oKTtcbiAgcHJpdmF0ZSBtZXRhZGF0YUNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIHtba2V5OiBzdHJpbmddOiBhbnl9PigpO1xuICBwcml2YXRlIGNvbnZlcnNpb25NYXAgPVxuICAgICAgbmV3IE1hcDxTdGF0aWNTeW1ib2wsIChtb2R1bGVDb250ZXh0OiBNb2R1bGVDb250ZXh0LCBhcmdzOiBhbnlbXSkgPT4gYW55PigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaG9zdDogU3RhdGljUmVmbGVjdG9ySG9zdCkgeyB0aGlzLmluaXRpYWxpemVDb252ZXJzaW9uTWFwKCk7IH1cblxuICBpbXBvcnRVcmkodHlwZU9yRnVuYzogYW55KTogc3RyaW5nIHsgcmV0dXJuICg8U3RhdGljU3ltYm9sPnR5cGVPckZ1bmMpLmZpbGVQYXRoOyB9XG5cbiAgcHVibGljIGFubm90YXRpb25zKHR5cGU6IFN0YXRpY1N5bWJvbCk6IGFueVtdIHtcbiAgICBsZXQgYW5ub3RhdGlvbnMgPSB0aGlzLmFubm90YXRpb25DYWNoZS5nZXQodHlwZSk7XG4gICAgaWYgKCFpc1ByZXNlbnQoYW5ub3RhdGlvbnMpKSB7XG4gICAgICBsZXQgY2xhc3NNZXRhZGF0YSA9IHRoaXMuZ2V0VHlwZU1ldGFkYXRhKHR5cGUpO1xuICAgICAgaWYgKGlzUHJlc2VudChjbGFzc01ldGFkYXRhWydkZWNvcmF0b3JzJ10pKSB7XG4gICAgICAgIGFubm90YXRpb25zID0gdGhpcy5zaW1wbGlmeSh0eXBlLCBjbGFzc01ldGFkYXRhWydkZWNvcmF0b3JzJ10sIGZhbHNlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFubm90YXRpb25zID0gW107XG4gICAgICB9XG4gICAgICB0aGlzLmFubm90YXRpb25DYWNoZS5zZXQodHlwZSwgYW5ub3RhdGlvbnMuZmlsdGVyKGFubiA9PiBpc1ByZXNlbnQoYW5uKSkpO1xuICAgIH1cbiAgICByZXR1cm4gYW5ub3RhdGlvbnM7XG4gIH1cblxuICBwdWJsaWMgcHJvcE1ldGFkYXRhKHR5cGU6IFN0YXRpY1N5bWJvbCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICBsZXQgcHJvcE1ldGFkYXRhID0gdGhpcy5wcm9wZXJ0eUNhY2hlLmdldCh0eXBlKTtcbiAgICBpZiAoIWlzUHJlc2VudChwcm9wTWV0YWRhdGEpKSB7XG4gICAgICBsZXQgY2xhc3NNZXRhZGF0YSA9IHRoaXMuZ2V0VHlwZU1ldGFkYXRhKHR5cGUpO1xuICAgICAgbGV0IG1lbWJlcnMgPSBpc1ByZXNlbnQoY2xhc3NNZXRhZGF0YSkgPyBjbGFzc01ldGFkYXRhWydtZW1iZXJzJ10gOiB7fTtcbiAgICAgIHByb3BNZXRhZGF0YSA9IG1hcFN0cmluZ01hcChtZW1iZXJzLCAocHJvcERhdGEsIHByb3BOYW1lKSA9PiB7XG4gICAgICAgIGxldCBwcm9wID0gKDxhbnlbXT5wcm9wRGF0YSkuZmluZChhID0+IGFbJ19fc3ltYm9saWMnXSA9PSAncHJvcGVydHknKTtcbiAgICAgICAgaWYgKGlzUHJlc2VudChwcm9wKSAmJiBpc1ByZXNlbnQocHJvcFsnZGVjb3JhdG9ycyddKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnNpbXBsaWZ5KHR5cGUsIHByb3BbJ2RlY29yYXRvcnMnXSwgZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLnByb3BlcnR5Q2FjaGUuc2V0KHR5cGUsIHByb3BNZXRhZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiBwcm9wTWV0YWRhdGE7XG4gIH1cblxuICBwdWJsaWMgcGFyYW1ldGVycyh0eXBlOiBTdGF0aWNTeW1ib2wpOiBhbnlbXSB7XG4gICAgbGV0IHBhcmFtZXRlcnMgPSB0aGlzLnBhcmFtZXRlckNhY2hlLmdldCh0eXBlKTtcbiAgICBpZiAoIWlzUHJlc2VudChwYXJhbWV0ZXJzKSkge1xuICAgICAgbGV0IGNsYXNzTWV0YWRhdGEgPSB0aGlzLmdldFR5cGVNZXRhZGF0YSh0eXBlKTtcbiAgICAgIGxldCBtZW1iZXJzID0gaXNQcmVzZW50KGNsYXNzTWV0YWRhdGEpID8gY2xhc3NNZXRhZGF0YVsnbWVtYmVycyddIDogbnVsbDtcbiAgICAgIGxldCBjdG9yRGF0YSA9IGlzUHJlc2VudChtZW1iZXJzKSA/IG1lbWJlcnNbJ19fY3Rvcl9fJ10gOiBudWxsO1xuICAgICAgaWYgKGlzUHJlc2VudChjdG9yRGF0YSkpIHtcbiAgICAgICAgbGV0IGN0b3IgPSAoPGFueVtdPmN0b3JEYXRhKS5maW5kKGEgPT4gYVsnX19zeW1ib2xpYyddID09ICdjb25zdHJ1Y3RvcicpO1xuICAgICAgICBsZXQgcGFyYW1ldGVyVHlwZXMgPSA8YW55W10+dGhpcy5zaW1wbGlmeSh0eXBlLCBjdG9yWydwYXJhbWV0ZXJzJ10sIGZhbHNlKTtcbiAgICAgICAgbGV0IHBhcmFtZXRlckRlY29yYXRvcnMgPSA8YW55W10+dGhpcy5zaW1wbGlmeSh0eXBlLCBjdG9yWydwYXJhbWV0ZXJEZWNvcmF0b3JzJ10sIGZhbHNlKTtcblxuICAgICAgICBwYXJhbWV0ZXJzID0gW107XG4gICAgICAgIExpc3RXcmFwcGVyLmZvckVhY2hXaXRoSW5kZXgocGFyYW1ldGVyVHlwZXMsIChwYXJhbVR5cGUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgbGV0IG5lc3RlZFJlc3VsdCA9IFtdO1xuICAgICAgICAgIGlmIChpc1ByZXNlbnQocGFyYW1UeXBlKSkge1xuICAgICAgICAgICAgbmVzdGVkUmVzdWx0LnB1c2gocGFyYW1UeXBlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IGRlY29yYXRvcnMgPSBpc1ByZXNlbnQocGFyYW1ldGVyRGVjb3JhdG9ycykgPyBwYXJhbWV0ZXJEZWNvcmF0b3JzW2luZGV4XSA6IG51bGw7XG4gICAgICAgICAgaWYgKGlzUHJlc2VudChkZWNvcmF0b3JzKSkge1xuICAgICAgICAgICAgTGlzdFdyYXBwZXIuYWRkQWxsKG5lc3RlZFJlc3VsdCwgZGVjb3JhdG9ycyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBhcmFtZXRlcnMucHVzaChuZXN0ZWRSZXN1bHQpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmICghaXNQcmVzZW50KHBhcmFtZXRlcnMpKSB7XG4gICAgICAgIHBhcmFtZXRlcnMgPSBbXTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGFyYW1ldGVyQ2FjaGUuc2V0KHR5cGUsIHBhcmFtZXRlcnMpO1xuICAgIH1cbiAgICByZXR1cm4gcGFyYW1ldGVycztcbiAgfVxuXG4gIHByaXZhdGUgcmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHR5cGU6IFN0YXRpY1N5bWJvbCwgY3RvcjogYW55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcm9zc01vZHVsZVByb3BzOiBhbnlbXSA9IENPTlNUX0VYUFIoW10pKTogdm9pZCB7XG4gICAgdGhpcy5jb252ZXJzaW9uTWFwLnNldCh0eXBlLCAobW9kdWxlQ29udGV4dDogTW9kdWxlQ29udGV4dCwgYXJnczogYW55W10pID0+IHtcbiAgICAgIGxldCBhcmdWYWx1ZXMgPSBbXTtcbiAgICAgIExpc3RXcmFwcGVyLmZvckVhY2hXaXRoSW5kZXgoYXJncywgKGFyZywgaW5kZXgpID0+IHtcbiAgICAgICAgbGV0IGFyZ1ZhbHVlO1xuICAgICAgICBpZiAoaXNTdHJpbmdNYXAoYXJnKSAmJiBpc0JsYW5rKGFyZ1snX19zeW1ib2xpYyddKSkge1xuICAgICAgICAgIGFyZ1ZhbHVlID1cbiAgICAgICAgICAgICAgbWFwU3RyaW5nTWFwKGFyZywgKHZhbHVlLCBrZXkpID0+IHRoaXMuc2ltcGxpZnkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVDb250ZXh0LCB2YWx1ZSwgY3Jvc3NNb2R1bGVQcm9wcy5pbmRleE9mKGtleSkgIT09IC0xKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXJnVmFsdWUgPSB0aGlzLnNpbXBsaWZ5KG1vZHVsZUNvbnRleHQsIGFyZywgY3Jvc3NNb2R1bGVQcm9wcy5pbmRleE9mKGluZGV4KSAhPT0gLTEpO1xuICAgICAgICB9XG4gICAgICAgIGFyZ1ZhbHVlcy5wdXNoKGFyZ1ZhbHVlKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIEZ1bmN0aW9uV3JhcHBlci5hcHBseShyZWZsZWN0b3IuZmFjdG9yeShjdG9yKSwgYXJnVmFsdWVzKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgaW5pdGlhbGl6ZUNvbnZlcnNpb25NYXAoKTogdm9pZCB7XG4gICAgbGV0IGNvcmVEZWNvcmF0b3JzID0gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhJztcbiAgICBsZXQgZGlEZWNvcmF0b3JzID0gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpL2RlY29yYXRvcnMnO1xuICAgIGxldCBkaU1ldGFkYXRhID0gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpL21ldGFkYXRhJztcbiAgICBsZXQgcHJvdmlkZXIgPSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvcHJvdmlkZXInO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24ocHJvdmlkZXIsICdQcm92aWRlcicpLCBQcm92aWRlcik7XG5cbiAgICB0aGlzLnJlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3Rvcih0aGlzLmhvc3QuZmluZERlY2xhcmF0aW9uKGRpRGVjb3JhdG9ycywgJ0hvc3QnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBIb3N0TWV0YWRhdGEpO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oZGlEZWNvcmF0b3JzLCAnSW5qZWN0YWJsZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEluamVjdGFibGVNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihkaURlY29yYXRvcnMsICdTZWxmJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2VsZk1ldGFkYXRhKTtcbiAgICB0aGlzLnJlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3Rvcih0aGlzLmhvc3QuZmluZERlY2xhcmF0aW9uKGRpRGVjb3JhdG9ycywgJ1NraXBTZWxmJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2tpcFNlbGZNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihkaURlY29yYXRvcnMsICdJbmplY3QnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJbmplY3RNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihkaURlY29yYXRvcnMsICdPcHRpb25hbCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9wdGlvbmFsTWV0YWRhdGEpO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oY29yZURlY29yYXRvcnMsICdBdHRyaWJ1dGUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBdHRyaWJ1dGVNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihjb3JlRGVjb3JhdG9ycywgJ1F1ZXJ5JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUXVlcnlNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihjb3JlRGVjb3JhdG9ycywgJ1ZpZXdRdWVyeScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZpZXdRdWVyeU1ldGFkYXRhKTtcbiAgICB0aGlzLnJlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3Rvcih0aGlzLmhvc3QuZmluZERlY2xhcmF0aW9uKGNvcmVEZWNvcmF0b3JzLCAnQ29udGVudENoaWxkJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ29udGVudENoaWxkTWV0YWRhdGEpO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKFxuICAgICAgICB0aGlzLmhvc3QuZmluZERlY2xhcmF0aW9uKGNvcmVEZWNvcmF0b3JzLCAnQ29udGVudENoaWxkcmVuJyksIENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhKTtcbiAgICB0aGlzLnJlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3Rvcih0aGlzLmhvc3QuZmluZERlY2xhcmF0aW9uKGNvcmVEZWNvcmF0b3JzLCAnVmlld0NoaWxkJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVmlld0NoaWxkTWV0YWRhdGEpO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oY29yZURlY29yYXRvcnMsICdWaWV3Q2hpbGRyZW4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBWaWV3Q2hpbGRyZW5NZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihjb3JlRGVjb3JhdG9ycywgJ0lucHV0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSW5wdXRNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihjb3JlRGVjb3JhdG9ycywgJ091dHB1dCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE91dHB1dE1ldGFkYXRhKTtcbiAgICB0aGlzLnJlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3Rvcih0aGlzLmhvc3QuZmluZERlY2xhcmF0aW9uKGNvcmVEZWNvcmF0b3JzLCAnUGlwZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFBpcGVNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihjb3JlRGVjb3JhdG9ycywgJ0hvc3RCaW5kaW5nJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSG9zdEJpbmRpbmdNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihjb3JlRGVjb3JhdG9ycywgJ0hvc3RMaXN0ZW5lcicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEhvc3RMaXN0ZW5lck1ldGFkYXRhKTtcbiAgICB0aGlzLnJlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3Rvcih0aGlzLmhvc3QuZmluZERlY2xhcmF0aW9uKGNvcmVEZWNvcmF0b3JzLCAnRGlyZWN0aXZlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRGlyZWN0aXZlTWV0YWRhdGEsIFsnYmluZGluZ3MnLCAncHJvdmlkZXJzJ10pO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oY29yZURlY29yYXRvcnMsICdDb21wb25lbnQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDb21wb25lbnRNZXRhZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbJ2JpbmRpbmdzJywgJ3Byb3ZpZGVycycsICdkaXJlY3RpdmVzJywgJ3BpcGVzJ10pO1xuXG4gICAgLy8gTm90ZTogU29tZSBtZXRhZGF0YSBjbGFzc2VzIGNhbiBiZSB1c2VkIGRpcmVjdGx5IHdpdGggUHJvdmlkZXIuZGVwcy5cbiAgICB0aGlzLnJlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3Rvcih0aGlzLmhvc3QuZmluZERlY2xhcmF0aW9uKGRpTWV0YWRhdGEsICdIb3N0TWV0YWRhdGEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBIb3N0TWV0YWRhdGEpO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oZGlNZXRhZGF0YSwgJ1NlbGZNZXRhZGF0YScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNlbGZNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihkaU1ldGFkYXRhLCAnU2tpcFNlbGZNZXRhZGF0YScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNraXBTZWxmTWV0YWRhdGEpO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oZGlNZXRhZGF0YSwgJ09wdGlvbmFsTWV0YWRhdGEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPcHRpb25hbE1ldGFkYXRhKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIHNpbXBsaWZ5KG1vZHVsZUNvbnRleHQ6IE1vZHVsZUNvbnRleHQsIHZhbHVlOiBhbnksIGNyb3NzTW9kdWxlczogYm9vbGVhbik6IGFueSB7XG4gICAgbGV0IF90aGlzID0gdGhpcztcblxuICAgIGZ1bmN0aW9uIHNpbXBsaWZ5KGV4cHJlc3Npb246IGFueSk6IGFueSB7XG4gICAgICBpZiAoaXNQcmltaXRpdmUoZXhwcmVzc2lvbikpIHtcbiAgICAgICAgcmV0dXJuIGV4cHJlc3Npb247XG4gICAgICB9XG4gICAgICBpZiAoaXNBcnJheShleHByZXNzaW9uKSkge1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IGl0ZW0gb2YoPGFueT5leHByZXNzaW9uKSkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHNpbXBsaWZ5KGl0ZW0pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudChleHByZXNzaW9uKSkge1xuICAgICAgICBpZiAoaXNQcmVzZW50KGV4cHJlc3Npb25bJ19fc3ltYm9saWMnXSkpIHtcbiAgICAgICAgICBsZXQgc3RhdGljU3ltYm9sO1xuICAgICAgICAgIHN3aXRjaCAoZXhwcmVzc2lvblsnX19zeW1ib2xpYyddKSB7XG4gICAgICAgICAgICBjYXNlIFwiYmlub3BcIjpcbiAgICAgICAgICAgICAgbGV0IGxlZnQgPSBzaW1wbGlmeShleHByZXNzaW9uWydsZWZ0J10pO1xuICAgICAgICAgICAgICBsZXQgcmlnaHQgPSBzaW1wbGlmeShleHByZXNzaW9uWydyaWdodCddKTtcbiAgICAgICAgICAgICAgc3dpdGNoIChleHByZXNzaW9uWydvcGVyYXRvciddKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnJiYnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgJiYgcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnfHwnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgfHwgcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnfCc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCB8IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJ14nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgXiByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICcmJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICYgcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPT0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPT0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnIT0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgIT0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPT09JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ID09PSByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICchPT0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgIT09IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJzwnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPCByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ID4gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPD0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPD0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPj0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPj0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPDwnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPDwgcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPj4nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPj4gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnKyc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCArIHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJy0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgLSByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICcqJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICogcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnLyc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAvIHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJyUnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgJSByaWdodDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNhc2UgXCJwcmVcIjpcbiAgICAgICAgICAgICAgbGV0IG9wZXJhbmQgPSBzaW1wbGlmeShleHByZXNzaW9uWydvcGVyYW5kJ10pO1xuICAgICAgICAgICAgICBzd2l0Y2ggKGV4cHJlc3Npb25bJ29wZXJhdG9yJ10pIHtcbiAgICAgICAgICAgICAgICBjYXNlICcrJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBvcGVyYW5kO1xuICAgICAgICAgICAgICAgIGNhc2UgJy0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIC1vcGVyYW5kO1xuICAgICAgICAgICAgICAgIGNhc2UgJyEnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuICFvcGVyYW5kO1xuICAgICAgICAgICAgICAgIGNhc2UgJ34nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIH5vcGVyYW5kO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY2FzZSBcImluZGV4XCI6XG4gICAgICAgICAgICAgIGxldCBpbmRleFRhcmdldCA9IHNpbXBsaWZ5KGV4cHJlc3Npb25bJ2V4cHJlc3Npb24nXSk7XG4gICAgICAgICAgICAgIGxldCBpbmRleCA9IHNpbXBsaWZ5KGV4cHJlc3Npb25bJ2luZGV4J10pO1xuICAgICAgICAgICAgICBpZiAoaXNQcmVzZW50KGluZGV4VGFyZ2V0KSAmJiBpc1ByaW1pdGl2ZShpbmRleCkpIHJldHVybiBpbmRleFRhcmdldFtpbmRleF07XG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY2FzZSBcInNlbGVjdFwiOlxuICAgICAgICAgICAgICBsZXQgc2VsZWN0VGFyZ2V0ID0gc2ltcGxpZnkoZXhwcmVzc2lvblsnZXhwcmVzc2lvbiddKTtcbiAgICAgICAgICAgICAgbGV0IG1lbWJlciA9IHNpbXBsaWZ5KGV4cHJlc3Npb25bJ21lbWJlciddKTtcbiAgICAgICAgICAgICAgaWYgKGlzUHJlc2VudChzZWxlY3RUYXJnZXQpICYmIGlzUHJpbWl0aXZlKG1lbWJlcikpIHJldHVybiBzZWxlY3RUYXJnZXRbbWVtYmVyXTtcbiAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjYXNlIFwicmVmZXJlbmNlXCI6XG4gICAgICAgICAgICAgIGlmIChpc1ByZXNlbnQoZXhwcmVzc2lvblsnbW9kdWxlJ10pKSB7XG4gICAgICAgICAgICAgICAgc3RhdGljU3ltYm9sID0gX3RoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oZXhwcmVzc2lvblsnbW9kdWxlJ10sIGV4cHJlc3Npb25bJ25hbWUnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVDb250ZXh0LmZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdGF0aWNTeW1ib2wgPSBfdGhpcy5ob3N0LmdldFN0YXRpY1N5bWJvbChcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlQ29udGV4dC5tb2R1bGVJZCwgbW9kdWxlQ29udGV4dC5maWxlUGF0aCwgZXhwcmVzc2lvblsnbmFtZSddKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBsZXQgcmVzdWx0O1xuICAgICAgICAgICAgICBpZiAoY3Jvc3NNb2R1bGVzIHx8IGlzQmxhbmsoZXhwcmVzc2lvblsnbW9kdWxlJ10pKSB7XG4gICAgICAgICAgICAgICAgbGV0IG1vZHVsZU1ldGFkYXRhID0gX3RoaXMuZ2V0TW9kdWxlTWV0YWRhdGEoc3RhdGljU3ltYm9sLmZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgICBsZXQgZGVjbGFyYXRpb25WYWx1ZSA9IG1vZHVsZU1ldGFkYXRhWydtZXRhZGF0YSddW3N0YXRpY1N5bWJvbC5uYW1lXTtcbiAgICAgICAgICAgICAgICBpZiAoaXNDbGFzc01ldGFkYXRhKGRlY2xhcmF0aW9uVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICByZXN1bHQgPSBzdGF0aWNTeW1ib2w7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGxldCBuZXdNb2R1bGVDb250ZXh0ID1cbiAgICAgICAgICAgICAgICAgICAgICBuZXcgTW9kdWxlQ29udGV4dChzdGF0aWNTeW1ib2wubW9kdWxlSWQsIHN0YXRpY1N5bWJvbC5maWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgICByZXN1bHQgPSBfdGhpcy5zaW1wbGlmeShuZXdNb2R1bGVDb250ZXh0LCBkZWNsYXJhdGlvblZhbHVlLCBjcm9zc01vZHVsZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBzdGF0aWNTeW1ib2w7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIGNhc2UgXCJuZXdcIjpcbiAgICAgICAgICAgIGNhc2UgXCJjYWxsXCI6XG4gICAgICAgICAgICAgIGxldCB0YXJnZXQgPSBleHByZXNzaW9uWydleHByZXNzaW9uJ107XG4gICAgICAgICAgICAgIHN0YXRpY1N5bWJvbCA9IF90aGlzLmhvc3QuZmluZERlY2xhcmF0aW9uKHRhcmdldFsnbW9kdWxlJ10sIHRhcmdldFsnbmFtZSddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVDb250ZXh0LmZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgbGV0IGNvbnZlcnRlciA9IF90aGlzLmNvbnZlcnNpb25NYXAuZ2V0KHN0YXRpY1N5bWJvbCk7XG4gICAgICAgICAgICAgIGxldCBhcmdzID0gZXhwcmVzc2lvblsnYXJndW1lbnRzJ107XG4gICAgICAgICAgICAgIGlmIChpc0JsYW5rKGFyZ3MpKSB7XG4gICAgICAgICAgICAgICAgYXJncyA9IFtdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBpc1ByZXNlbnQoY29udmVydGVyKSA/IGNvbnZlcnRlcihtb2R1bGVDb250ZXh0LCBhcmdzKSA6IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXBTdHJpbmdNYXAoZXhwcmVzc2lvbiwgKHZhbHVlLCBuYW1lKSA9PiBzaW1wbGlmeSh2YWx1ZSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNpbXBsaWZ5KHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gbW9kdWxlIGFuIGFic29sdXRlIHBhdGggdG8gYSBtb2R1bGUgZmlsZS5cbiAgICovXG4gIHB1YmxpYyBnZXRNb2R1bGVNZXRhZGF0YShtb2R1bGU6IHN0cmluZyk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICBsZXQgbW9kdWxlTWV0YWRhdGEgPSB0aGlzLm1ldGFkYXRhQ2FjaGUuZ2V0KG1vZHVsZSk7XG4gICAgaWYgKCFpc1ByZXNlbnQobW9kdWxlTWV0YWRhdGEpKSB7XG4gICAgICBtb2R1bGVNZXRhZGF0YSA9IHRoaXMuaG9zdC5nZXRNZXRhZGF0YUZvcihtb2R1bGUpO1xuICAgICAgaWYgKCFpc1ByZXNlbnQobW9kdWxlTWV0YWRhdGEpKSB7XG4gICAgICAgIG1vZHVsZU1ldGFkYXRhID0ge19fc3ltYm9saWM6IFwibW9kdWxlXCIsIG1vZHVsZTogbW9kdWxlLCBtZXRhZGF0YToge319O1xuICAgICAgfVxuICAgICAgdGhpcy5tZXRhZGF0YUNhY2hlLnNldChtb2R1bGUsIG1vZHVsZU1ldGFkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIG1vZHVsZU1ldGFkYXRhO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRUeXBlTWV0YWRhdGEodHlwZTogU3RhdGljU3ltYm9sKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIGxldCBtb2R1bGVNZXRhZGF0YSA9IHRoaXMuZ2V0TW9kdWxlTWV0YWRhdGEodHlwZS5maWxlUGF0aCk7XG4gICAgbGV0IHJlc3VsdCA9IG1vZHVsZU1ldGFkYXRhWydtZXRhZGF0YSddW3R5cGUubmFtZV07XG4gICAgaWYgKCFpc1ByZXNlbnQocmVzdWx0KSkge1xuICAgICAgcmVzdWx0ID0ge19fc3ltYm9saWM6IFwiY2xhc3NcIn07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNDbGFzc01ldGFkYXRhKGV4cHJlc3Npb246IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gIWlzUHJpbWl0aXZlKGV4cHJlc3Npb24pICYmICFpc0FycmF5KGV4cHJlc3Npb24pICYmIGV4cHJlc3Npb25bJ19fc3ltYm9saWMnXSA9PSAnY2xhc3MnO1xufVxuXG5mdW5jdGlvbiBtYXBTdHJpbmdNYXAoaW5wdXQ6IHtba2V5OiBzdHJpbmddOiBhbnl9LFxuICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogKHZhbHVlOiBhbnksIGtleTogc3RyaW5nKSA9PiBhbnkpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gIGlmIChpc0JsYW5rKGlucHV0KSkgcmV0dXJuIHt9O1xuICB2YXIgcmVzdWx0ID0ge307XG4gIFN0cmluZ01hcFdyYXBwZXIua2V5cyhpbnB1dCkuZm9yRWFjaCgoa2V5KSA9PiB7IHJlc3VsdFtrZXldID0gdHJhbnNmb3JtKGlucHV0W2tleV0sIGtleSk7IH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuIl19