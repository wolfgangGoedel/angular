'use strict';"use strict";
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var metadata_1 = require('angular2/src/core/metadata');
/**
 * A token representing the a reference to a static type.
 *
 * This token is unique for a moduleId and name and can be used as a hash table key.
 */
var StaticType = (function () {
    function StaticType(moduleId, name) {
        this.moduleId = moduleId;
        this.name = name;
    }
    return StaticType;
}());
exports.StaticType = StaticType;
/**
 * A static reflector implements enough of the Reflector API that is necessary to compile
 * templates statically.
 */
var StaticReflector = (function () {
    function StaticReflector(host) {
        this.host = host;
        this.typeCache = new Map();
        this.annotationCache = new Map();
        this.propertyCache = new Map();
        this.parameterCache = new Map();
        this.metadataCache = new Map();
        this.conversionMap = new Map();
        this.initializeConversionMap();
    }
    /**
     * getStatictype produces a Type whose metadata is known but whose implementation is not loaded.
     * All types passed to the StaticResolver should be pseudo-types returned by this method.
     *
     * @param moduleId the module identifier as would be passed to an import statement.
     * @param name the name of the type.
     */
    StaticReflector.prototype.getStaticType = function (moduleId, name) {
        var key = "\"" + moduleId + "\"." + name;
        var result = this.typeCache.get(key);
        if (!lang_1.isPresent(result)) {
            result = new StaticType(moduleId, name);
            this.typeCache.set(key, result);
        }
        return result;
    };
    StaticReflector.prototype.annotations = function (type) {
        var _this = this;
        var annotations = this.annotationCache.get(type);
        if (!lang_1.isPresent(annotations)) {
            var classMetadata = this.getTypeMetadata(type);
            if (lang_1.isPresent(classMetadata['decorators'])) {
                annotations = classMetadata['decorators']
                    .map(function (decorator) { return _this.convertKnownDecorator(type.moduleId, decorator); })
                    .filter(function (decorator) { return lang_1.isPresent(decorator); });
            }
            else {
                annotations = [];
            }
            this.annotationCache.set(type, annotations);
        }
        return annotations;
    };
    StaticReflector.prototype.propMetadata = function (type) {
        var propMetadata = this.propertyCache.get(type);
        if (!lang_1.isPresent(propMetadata)) {
            var classMetadata = this.getTypeMetadata(type);
            propMetadata = this.getPropertyMetadata(type.moduleId, classMetadata['members']);
            if (!lang_1.isPresent(propMetadata)) {
                propMetadata = {};
            }
            this.propertyCache.set(type, propMetadata);
        }
        return propMetadata;
    };
    StaticReflector.prototype.parameters = function (type) {
        var parameters = this.parameterCache.get(type);
        if (!lang_1.isPresent(parameters)) {
            var classMetadata = this.getTypeMetadata(type);
            if (lang_1.isPresent(classMetadata)) {
                var members = classMetadata['members'];
                if (lang_1.isPresent(members)) {
                    var ctorData = members['__ctor__'];
                    if (lang_1.isPresent(ctorData)) {
                        var ctor = ctorData.find(function (a) { return a['__symbolic'] === 'constructor'; });
                        parameters = this.simplify(type.moduleId, ctor['parameters']);
                    }
                }
            }
            if (!lang_1.isPresent(parameters)) {
                parameters = [];
            }
            this.parameterCache.set(type, parameters);
        }
        return parameters;
    };
    StaticReflector.prototype.initializeConversionMap = function () {
        var _this = this;
        var core_metadata = 'angular2/src/core/metadata';
        var conversionMap = this.conversionMap;
        conversionMap.set(this.getStaticType(core_metadata, 'Directive'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            if (!lang_1.isPresent(p0)) {
                p0 = {};
            }
            return new metadata_1.DirectiveMetadata({
                selector: p0['selector'],
                inputs: p0['inputs'],
                outputs: p0['outputs'],
                events: p0['events'],
                host: p0['host'],
                bindings: p0['bindings'],
                providers: p0['providers'],
                exportAs: p0['exportAs'],
                queries: p0['queries'],
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'Component'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            if (!lang_1.isPresent(p0)) {
                p0 = {};
            }
            return new metadata_1.ComponentMetadata({
                selector: p0['selector'],
                inputs: p0['inputs'],
                outputs: p0['outputs'],
                properties: p0['properties'],
                events: p0['events'],
                host: p0['host'],
                exportAs: p0['exportAs'],
                moduleId: p0['moduleId'],
                bindings: p0['bindings'],
                providers: p0['providers'],
                viewBindings: p0['viewBindings'],
                viewProviders: p0['viewProviders'],
                changeDetection: p0['changeDetection'],
                queries: p0['queries'],
                templateUrl: p0['templateUrl'],
                template: p0['template'],
                styleUrls: p0['styleUrls'],
                styles: p0['styles'],
                directives: p0['directives'],
                pipes: p0['pipes'],
                encapsulation: p0['encapsulation']
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'Input'), function (moduleContext, expression) { return new metadata_1.InputMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'Output'), function (moduleContext, expression) { return new metadata_1.OutputMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'View'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            if (!lang_1.isPresent(p0)) {
                p0 = {};
            }
            return new metadata_1.ViewMetadata({
                templateUrl: p0['templateUrl'],
                template: p0['template'],
                directives: p0['directives'],
                pipes: p0['pipes'],
                encapsulation: p0['encapsulation'],
                styles: p0['styles'],
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'Attribute'), function (moduleContext, expression) { return new metadata_1.AttributeMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'Query'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            var p1 = _this.getDecoratorParameter(moduleContext, expression, 1);
            if (!lang_1.isPresent(p1)) {
                p1 = {};
            }
            return new metadata_1.QueryMetadata(p0, { descendants: p1.descendants, first: p1.first });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'ContentChildren'), function (moduleContext, expression) { return new metadata_1.ContentChildrenMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'ContentChild'), function (moduleContext, expression) { return new metadata_1.ContentChildMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'ViewChildren'), function (moduleContext, expression) { return new metadata_1.ViewChildrenMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'ViewChild'), function (moduleContext, expression) { return new metadata_1.ViewChildMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'ViewQuery'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            var p1 = _this.getDecoratorParameter(moduleContext, expression, 1);
            if (!lang_1.isPresent(p1)) {
                p1 = {};
            }
            return new metadata_1.ViewQueryMetadata(p0, {
                descendants: p1['descendants'],
                first: p1['first'],
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'Pipe'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            if (!lang_1.isPresent(p0)) {
                p0 = {};
            }
            return new metadata_1.PipeMetadata({
                name: p0['name'],
                pure: p0['pure'],
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'HostBinding'), function (moduleContext, expression) { return new metadata_1.HostBindingMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'HostListener'), function (moduleContext, expression) { return new metadata_1.HostListenerMetadata(_this.getDecoratorParameter(moduleContext, expression, 0), _this.getDecoratorParameter(moduleContext, expression, 1)); });
        return null;
    };
    StaticReflector.prototype.convertKnownDecorator = function (moduleContext, expression) {
        var converter = this.conversionMap.get(this.getDecoratorType(moduleContext, expression));
        if (lang_1.isPresent(converter))
            return converter(moduleContext, expression);
        return null;
    };
    StaticReflector.prototype.getDecoratorType = function (moduleContext, expression) {
        if (isMetadataSymbolicCallExpression(expression)) {
            var target = expression['expression'];
            if (isMetadataSymbolicReferenceExpression(target)) {
                var moduleId = this.normalizeModuleName(moduleContext, target['module']);
                return this.getStaticType(moduleId, target['name']);
            }
        }
        return null;
    };
    StaticReflector.prototype.getDecoratorParameter = function (moduleContext, expression, index) {
        if (isMetadataSymbolicCallExpression(expression) && lang_1.isPresent(expression['arguments']) &&
            expression['arguments'].length <= index + 1) {
            return this.simplify(moduleContext, expression['arguments'][index]);
        }
        return null;
    };
    StaticReflector.prototype.getPropertyMetadata = function (moduleContext, value) {
        var _this = this;
        if (lang_1.isPresent(value)) {
            var result_1 = {};
            collection_1.StringMapWrapper.forEach(value, function (value, name) {
                var data = _this.getMemberData(moduleContext, value);
                if (lang_1.isPresent(data)) {
                    var propertyData = data.filter(function (d) { return d['kind'] == "property"; })
                        .map(function (d) { return d['directives']; })
                        .reduce(function (p, c) { return p.concat(c); }, []);
                    if (propertyData.length != 0) {
                        collection_1.StringMapWrapper.set(result_1, name, propertyData);
                    }
                }
            });
            return result_1;
        }
        return {};
    };
    // clang-format off
    StaticReflector.prototype.getMemberData = function (moduleContext, member) {
        var _this = this;
        // clang-format on
        var result = [];
        if (lang_1.isPresent(member)) {
            for (var _i = 0, member_1 = member; _i < member_1.length; _i++) {
                var item = member_1[_i];
                result.push({
                    kind: item['__symbolic'],
                    directives: lang_1.isPresent(item['decorators']) ?
                        item['decorators']
                            .map(function (decorator) { return _this.convertKnownDecorator(moduleContext, decorator); })
                            .filter(function (d) { return lang_1.isPresent(d); }) :
                        null
                });
            }
        }
        return result;
    };
    /** @internal */
    StaticReflector.prototype.simplify = function (moduleContext, value) {
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
                            var referenceModuleName = _this.normalizeModuleName(moduleContext, expression['module']);
                            var referenceModule = _this.getModuleMetadata(referenceModuleName);
                            var referenceValue = referenceModule['metadata'][expression['name']];
                            if (isClassMetadata(referenceValue)) {
                                // Convert to a pseudo type
                                return _this.getStaticType(referenceModuleName, expression['name']);
                            }
                            return _this.simplify(referenceModuleName, referenceValue);
                        case "call":
                            return null;
                    }
                    return null;
                }
                var result_2 = {};
                collection_1.StringMapWrapper.forEach(expression, function (value, name) { result_2[name] = simplify(value); });
                return result_2;
            }
            return null;
        }
        return simplify(value);
    };
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
        var moduleMetadata = this.getModuleMetadata(type.moduleId);
        var result = moduleMetadata['metadata'][type.name];
        if (!lang_1.isPresent(result)) {
            result = { __symbolic: "class" };
        }
        return result;
    };
    StaticReflector.prototype.normalizeModuleName = function (from, to) {
        if (to.startsWith('.')) {
            return pathTo(from, to);
        }
        return to;
    };
    return StaticReflector;
}());
exports.StaticReflector = StaticReflector;
function isMetadataSymbolicCallExpression(expression) {
    return !lang_1.isPrimitive(expression) && !lang_1.isArray(expression) && expression['__symbolic'] == 'call';
}
function isMetadataSymbolicReferenceExpression(expression) {
    return !lang_1.isPrimitive(expression) && !lang_1.isArray(expression) &&
        expression['__symbolic'] == 'reference';
}
function isClassMetadata(expression) {
    return !lang_1.isPrimitive(expression) && !lang_1.isArray(expression) && expression['__symbolic'] == 'class';
}
function splitPath(path) {
    return path.split(/\/|\\/g);
}
function resolvePath(pathParts) {
    var result = [];
    collection_1.ListWrapper.forEachWithIndex(pathParts, function (part, index) {
        switch (part) {
            case '':
            case '.':
                if (index > 0)
                    return;
                break;
            case '..':
                if (index > 0 && result.length != 0)
                    result.pop();
                return;
        }
        result.push(part);
    });
    return result.join('/');
}
function pathTo(from, to) {
    var result = to;
    if (to.startsWith('.')) {
        var fromParts = splitPath(from);
        fromParts.pop(); // remove the file name.
        var toParts = splitPath(to);
        result = resolvePath(fromParts.concat(toParts));
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljX3JlZmxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtUlpQVDNvekwudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9zdGF0aWNfcmVmbGVjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwyQkFBNEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RSxxQkFRTywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xDLHlCQWdCTyw0QkFBNEIsQ0FBQyxDQUFBO0FBbUJwQzs7OztHQUlHO0FBQ0g7SUFDRSxvQkFBbUIsUUFBZ0IsRUFBUyxJQUFZO1FBQXJDLGFBQVEsR0FBUixRQUFRLENBQVE7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFRO0lBQUcsQ0FBQztJQUM5RCxpQkFBQztBQUFELENBQUMsQUFGRCxJQUVDO0FBRlksa0JBQVUsYUFFdEIsQ0FBQTtBQUVEOzs7R0FHRztBQUNIO0lBT0UseUJBQW9CLElBQXlCO1FBQXpCLFNBQUksR0FBSixJQUFJLENBQXFCO1FBTnJDLGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBc0IsQ0FBQztRQUMxQyxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUFxQixDQUFDO1FBQy9DLGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQW9DLENBQUM7UUFDNUQsbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztRQUM5QyxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUFnQyxDQUFDO1FBd0V4RCxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUErRCxDQUFDO1FBdEU5QyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztJQUFDLENBQUM7SUFFbEY7Ozs7OztPQU1HO0lBQ0ksdUNBQWEsR0FBcEIsVUFBcUIsUUFBZ0IsRUFBRSxJQUFZO1FBQ2pELElBQUksR0FBRyxHQUFHLE9BQUksUUFBUSxXQUFLLElBQU0sQ0FBQztRQUNsQyxJQUFJLE1BQU0sR0FBRyxJQUFJLENB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QUFLLElBQUk7Z0JBQ1AsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztvQkFBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ2xELE1BQU0sQ0FBQztRQUNYLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3BCLENBQUMsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQUVELGdCQUFnQixJQUFZLEVBQUUsRUFBVTtJQUN0QyxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDaEIsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsSUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFFLHdCQUF3QjtRQUMxQyxJQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDNUIsTUFBTSxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDaEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1xuICBpc0FycmF5LFxuICBpc0JsYW5rLFxuICBpc051bWJlcixcbiAgaXNQcmVzZW50LFxuICBpc1ByaW1pdGl2ZSxcbiAgaXNTdHJpbmcsXG4gIFR5cGVcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7XG4gIEF0dHJpYnV0ZU1ldGFkYXRhLFxuICBEaXJlY3RpdmVNZXRhZGF0YSxcbiAgQ29tcG9uZW50TWV0YWRhdGEsXG4gIENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhLFxuICBDb250ZW50Q2hpbGRNZXRhZGF0YSxcbiAgSW5wdXRNZXRhZGF0YSxcbiAgSG9zdEJpbmRpbmdNZXRhZGF0YSxcbiAgSG9zdExpc3RlbmVyTWV0YWRhdGEsXG4gIE91dHB1dE1ldGFkYXRhLFxuICBQaXBlTWV0YWRhdGEsXG4gIFZpZXdNZXRhZGF0YSxcbiAgVmlld0NoaWxkTWV0YWRhdGEsXG4gIFZpZXdDaGlsZHJlbk1ldGFkYXRhLFxuICBWaWV3UXVlcnlNZXRhZGF0YSxcbiAgUXVlcnlNZXRhZGF0YSxcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEnO1xuXG4vKipcbiAqIFRoZSBob3N0IG9mIHRoZSBzdGF0aWMgcmVzb2x2ZXIgaXMgZXhwZWN0ZWQgdG8gYmUgYWJsZSB0byBwcm92aWRlIG1vZHVsZSBtZXRhZGF0YSBpbiB0aGUgZm9ybSBvZlxuICogTW9kdWxlTWV0YWRhdGEuIEFuZ3VsYXIgMiBDTEkgd2lsbCBwcm9kdWNlIHRoaXMgbWV0YWRhdGEgZm9yIGEgbW9kdWxlIHdoZW5ldmVyIGEgLmQudHMgZmlsZXMgaXNcbiAqIHByb2R1Y2VkIGFuZCB0aGUgbW9kdWxlIGhhcyBleHBvcnRlZCB2YXJpYWJsZXMgb3IgY2xhc3NlcyB3aXRoIGRlY29yYXRvcnMuIE1vZHVsZSBtZXRhZGF0YSBjYW5cbiAqIGFsc28gYmUgcHJvZHVjZWQgZGlyZWN0bHkgZnJvbSBUeXBlU2NyaXB0IHNvdXJjZXMgYnkgdXNpbmcgTWV0YWRhdGFDb2xsZWN0b3IgaW4gdG9vbHMvbWV0YWRhdGEuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3RhdGljUmVmbGVjdG9ySG9zdCB7XG4gIC8qKlxuICAgKiAgUmV0dXJuIGEgTW9kdWxlTWV0YWRhdGEgZm9yIHRoZSBnaXZlIG1vZHVsZS5cbiAgICpcbiAgICogQHBhcmFtIG1vZHVsZUlkIGlzIGEgc3RyaW5nIGlkZW50aWZpZXIgZm9yIGEgbW9kdWxlIGluIHRoZSBmb3JtIHRoYXQgd291bGQgZXhwZWN0ZWQgaW4gYVxuICAgKiAgICAgICAgICAgICAgICAgbW9kdWxlIGltcG9ydCBvZiBhbiBpbXBvcnQgc3RhdGVtZW50LlxuICAgKiBAcmV0dXJucyB0aGUgbWV0YWRhdGEgZm9yIHRoZSBnaXZlbiBtb2R1bGUuXG4gICAqL1xuICBnZXRNZXRhZGF0YUZvcihtb2R1bGVJZDogc3RyaW5nKToge1trZXk6IHN0cmluZ106IGFueX07XG59XG5cbi8qKlxuICogQSB0b2tlbiByZXByZXNlbnRpbmcgdGhlIGEgcmVmZXJlbmNlIHRvIGEgc3RhdGljIHR5cGUuXG4gKlxuICogVGhpcyB0b2tlbiBpcyB1bmlxdWUgZm9yIGEgbW9kdWxlSWQgYW5kIG5hbWUgYW5kIGNhbiBiZSB1c2VkIGFzIGEgaGFzaCB0YWJsZSBrZXkuXG4gKi9cbmV4cG9ydCBjbGFzcyBTdGF0aWNUeXBlIHtcbiAgY29uc3RydWN0b3IocHVibGljIG1vZHVsZUlkOiBzdHJpbmcsIHB1YmxpYyBuYW1lOiBzdHJpbmcpIHt9XG59XG5cbi8qKlxuICogQSBzdGF0aWMgcmVmbGVjdG9yIGltcGxlbWVudHMgZW5vdWdoIG9mIHRoZSBSZWZsZWN0b3IgQVBJIHRoYXQgaXMgbmVjZXNzYXJ5IHRvIGNvbXBpbGVcbiAqIHRlbXBsYXRlcyBzdGF0aWNhbGx5LlxuICovXG5leHBvcnQgY2xhc3MgU3RhdGljUmVmbGVjdG9yIHtcbiAgcHJpdmF0ZSB0eXBlQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgU3RhdGljVHlwZT4oKTtcbiAgcHJpdmF0ZSBhbm5vdGF0aW9uQ2FjaGUgPSBuZXcgTWFwPFN0YXRpY1R5cGUsIGFueVtdPigpO1xuICBwcml2YXRlIHByb3BlcnR5Q2FjaGUgPSBuZXcgTWFwPFN0YXRpY1R5cGUsIHtba2V5OiBzdHJpbmddOiBhbnl9PigpO1xuICBwcml2YXRlIHBhcmFtZXRlckNhY2hlID0gbmV3IE1hcDxTdGF0aWNUeXBlLCBhbnlbXT4oKTtcbiAgcHJpdmF0ZSBtZXRhZGF0YUNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIHtba2V5OiBzdHJpbmddOiBhbnl9PigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaG9zdDogU3RhdGljUmVmbGVjdG9ySG9zdCkgeyB0aGlzLmluaXRpYWxpemVDb252ZXJzaW9uTWFwKCk7IH1cblxuICAvKipcbiAgICogZ2V0U3RhdGljdHlwZSBwcm9kdWNlcyBhIFR5cGUgd2hvc2UgbWV0YWRhdGEgaXMga25vd24gYnV0IHdob3NlIGltcGxlbWVudGF0aW9uIGlzIG5vdCBsb2FkZWQuXG4gICAqIEFsbCB0eXBlcyBwYXNzZWQgdG8gdGhlIFN0YXRpY1Jlc29sdmVyIHNob3VsZCBiZSBwc2V1ZG8tdHlwZXMgcmV0dXJuZWQgYnkgdGhpcyBtZXRob2QuXG4gICAqXG4gICAqIEBwYXJhbSBtb2R1bGVJZCB0aGUgbW9kdWxlIGlkZW50aWZpZXIgYXMgd291bGQgYmUgcGFzc2VkIHRvIGFuIGltcG9ydCBzdGF0ZW1lbnQuXG4gICAqIEBwYXJhbSBuYW1lIHRoZSBuYW1lIG9mIHRoZSB0eXBlLlxuICAgKi9cbiAgcHVibGljIGdldFN0YXRpY1R5cGUobW9kdWxlSWQ6IHN0cmluZywgbmFtZTogc3RyaW5nKTogU3RhdGljVHlwZSB7XG4gICAgbGV0IGtleSA9IGBcIiR7bW9kdWxlSWR9XCIuJHtuYW1lfWA7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMudHlwZUNhY2hlLmdldChrZXkpO1xuICAgIGlmICghaXNQcmVzZW50KHJlc3VsdCkpIHtcbiAgICAgIHJlc3VsdCA9IG5ldyBTdGF0aWNUeXBlKG1vZHVsZUlkLCBuYW1lKTtcbiAgICAgIHRoaXMudHlwZUNhY2hlLnNldChrZXksIHJlc3VsdCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwdWJsaWMgYW5ub3RhdGlvbnModHlwZTogU3RhdGljVHlwZSk6IGFueVtdIHtcbiAgICBsZXQgYW5ub3RhdGlvbnMgPSB0aGlzLmFubm90YXRpb25DYWNoZS5nZXQodHlwZSk7XG4gICAgaWYgKCFpc1ByZXNlbnQoYW5ub3RhdGlvbnMpKSB7XG4gICAgICBsZXQgY2xhc3NNZXRhZGF0YSA9IHRoaXMuZ2V0VHlwZU1ldGFkYXRhKHR5cGUpO1xuICAgICAgaWYgKGlzUHJlc2VudChjbGFzc01ldGFkYXRhWydkZWNvcmF0b3JzJ10pKSB7XG4gICAgICAgIGFubm90YXRpb25zID0gKDxhbnlbXT5jbGFzc01ldGFkYXRhWydkZWNvcmF0b3JzJ10pXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoZGVjb3JhdG9yID0+IHRoaXMuY29udmVydEtub3duRGVjb3JhdG9yKHR5cGUubW9kdWxlSWQsIGRlY29yYXRvcikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoZGVjb3JhdG9yID0+IGlzUHJlc2VudChkZWNvcmF0b3IpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFubm90YXRpb25zID0gW107XG4gICAgICB9XG4gICAgICB0aGlzLmFubm90YXRpb25DYWNoZS5zZXQodHlwZSwgYW5ub3RhdGlvbnMpO1xuICAgIH1cbiAgICByZXR1cm4gYW5ub3RhdGlvbnM7XG4gIH1cblxuICBwdWJsaWMgcHJvcE1ldGFkYXRhKHR5cGU6IFN0YXRpY1R5cGUpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgbGV0IHByb3BNZXRhZGF0YSA9IHRoaXMucHJvcGVydHlDYWNoZS5nZXQodHlwZSk7XG4gICAgaWYgKCFpc1ByZXNlbnQocHJvcE1ldGFkYXRhKSkge1xuICAgICAgbGV0IGNsYXNzTWV0YWRhdGEgPSB0aGlzLmdldFR5cGVNZXRhZGF0YSh0eXBlKTtcbiAgICAgIHByb3BNZXRhZGF0YSA9IHRoaXMuZ2V0UHJvcGVydHlNZXRhZGF0YSh0eXBlLm1vZHVsZUlkLCBjbGFzc01ldGFkYXRhWydtZW1iZXJzJ10pO1xuICAgICAgaWYgKCFpc1ByZXNlbnQocHJvcE1ldGFkYXRhKSkge1xuICAgICAgICBwcm9wTWV0YWRhdGEgPSB7fTtcbiAgICAgIH1cbiAgICAgIHRoaXMucHJvcGVydHlDYWNoZS5zZXQodHlwZSwgcHJvcE1ldGFkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIHByb3BNZXRhZGF0YTtcbiAgfVxuXG4gIHB1YmxpYyBwYXJhbWV0ZXJzKHR5cGU6IFN0YXRpY1R5cGUpOiBhbnlbXSB7XG4gICAgbGV0IHBhcmFtZXRlcnMgPSB0aGlzLnBhcmFtZXRlckNhY2hlLmdldCh0eXBlKTtcbiAgICBpZiAoIWlzUHJlc2VudChwYXJhbWV0ZXJzKSkge1xuICAgICAgbGV0IGNsYXNzTWV0YWRhdGEgPSB0aGlzLmdldFR5cGVNZXRhZGF0YSh0eXBlKTtcbiAgICAgIGlmIChpc1ByZXNlbnQoY2xhc3NNZXRhZGF0YSkpIHtcbiAgICAgICAgbGV0IG1lbWJlcnMgPSBjbGFzc01ldGFkYXRhWydtZW1iZXJzJ107XG4gICAgICAgIGlmIChpc1ByZXNlbnQobWVtYmVycykpIHtcbiAgICAgICAgICBsZXQgY3RvckRhdGEgPSBtZW1iZXJzWydfX2N0b3JfXyddO1xuICAgICAgICAgIGlmIChpc1ByZXNlbnQoY3RvckRhdGEpKSB7XG4gICAgICAgICAgICBsZXQgY3RvciA9ICg8YW55W10+Y3RvckRhdGEpLmZpbmQoYSA9PiBhWydfX3N5bWJvbGljJ10gPT09ICdjb25zdHJ1Y3RvcicpO1xuICAgICAgICAgICAgcGFyYW1ldGVycyA9IHRoaXMuc2ltcGxpZnkodHlwZS5tb2R1bGVJZCwgY3RvclsncGFyYW1ldGVycyddKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghaXNQcmVzZW50KHBhcmFtZXRlcnMpKSB7XG4gICAgICAgIHBhcmFtZXRlcnMgPSBbXTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGFyYW1ldGVyQ2FjaGUuc2V0KHR5cGUsIHBhcmFtZXRlcnMpO1xuICAgIH1cbiAgICByZXR1cm4gcGFyYW1ldGVycztcbiAgfVxuXG4gIHByaXZhdGUgY29udmVyc2lvbk1hcCA9IG5ldyBNYXA8U3RhdGljVHlwZSwgKG1vZHVsZUNvbnRleHQ6IHN0cmluZywgZXhwcmVzc2lvbjogYW55KSA9PiBhbnk+KCk7XG4gIHByaXZhdGUgaW5pdGlhbGl6ZUNvbnZlcnNpb25NYXAoKTogYW55IHtcbiAgICBsZXQgY29yZV9tZXRhZGF0YSA9ICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YSc7XG4gICAgbGV0IGNvbnZlcnNpb25NYXAgPSB0aGlzLmNvbnZlcnNpb25NYXA7XG4gICAgY29udmVyc2lvbk1hcC5zZXQodGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdEaXJlY3RpdmUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHAwID0gdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzUHJlc2VudChwMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcDAgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRGlyZWN0aXZlTWV0YWRhdGEoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogcDBbJ3NlbGVjdG9yJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czogcDBbJ2lucHV0cyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRzOiBwMFsnb3V0cHV0cyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudHM6IHAwWydldmVudHMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaG9zdDogcDBbJ2hvc3QnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYmluZGluZ3M6IHAwWydiaW5kaW5ncyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM6IHAwWydwcm92aWRlcnMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3J0QXM6IHAwWydleHBvcnRBcyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVyaWVzOiBwMFsncXVlcmllcyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQodGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdDb21wb25lbnQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHAwID0gdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzUHJlc2VudChwMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcDAgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQ29tcG9uZW50TWV0YWRhdGEoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogcDBbJ3NlbGVjdG9yJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czogcDBbJ2lucHV0cyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRzOiBwMFsnb3V0cHV0cyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBwMFsncHJvcGVydGllcyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudHM6IHAwWydldmVudHMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaG9zdDogcDBbJ2hvc3QnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3J0QXM6IHAwWydleHBvcnRBcyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJZDogcDBbJ21vZHVsZUlkJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRpbmdzOiBwMFsnYmluZGluZ3MnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJzOiBwMFsncHJvdmlkZXJzJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdCaW5kaW5nczogcDBbJ3ZpZXdCaW5kaW5ncyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3UHJvdmlkZXJzOiBwMFsndmlld1Byb3ZpZGVycyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2VEZXRlY3Rpb246IHAwWydjaGFuZ2VEZXRlY3Rpb24nXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlcmllczogcDBbJ3F1ZXJpZXMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IHAwWyd0ZW1wbGF0ZVVybCddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcDBbJ3RlbXBsYXRlJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlVXJsczogcDBbJ3N0eWxlVXJscyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZXM6IHAwWydzdHlsZXMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlczogcDBbJ2RpcmVjdGl2ZXMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcGlwZXM6IHAwWydwaXBlcyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBlbmNhcHN1bGF0aW9uOiBwMFsnZW5jYXBzdWxhdGlvbiddXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICBjb252ZXJzaW9uTWFwLnNldCh0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ0lucHV0JyksXG4gICAgICAgICAgICAgICAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IG5ldyBJbnB1dE1ldGFkYXRhKFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKSkpO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnT3V0cHV0JyksXG4gICAgICAgICAgICAgICAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IG5ldyBPdXRwdXRNZXRhZGF0YShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCkpKTtcbiAgICBjb252ZXJzaW9uTWFwLnNldCh0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ1ZpZXcnKSwgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IHtcbiAgICAgIGxldCBwMCA9IHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApO1xuICAgICAgaWYgKCFpc1ByZXNlbnQocDApKSB7XG4gICAgICAgIHAwID0ge307XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFZpZXdNZXRhZGF0YSh7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBwMFsndGVtcGxhdGVVcmwnXSxcbiAgICAgICAgdGVtcGxhdGU6IHAwWyd0ZW1wbGF0ZSddLFxuICAgICAgICBkaXJlY3RpdmVzOiBwMFsnZGlyZWN0aXZlcyddLFxuICAgICAgICBwaXBlczogcDBbJ3BpcGVzJ10sXG4gICAgICAgIGVuY2Fwc3VsYXRpb246IHAwWydlbmNhcHN1bGF0aW9uJ10sXG4gICAgICAgIHN0eWxlczogcDBbJ3N0eWxlcyddLFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQodGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdBdHRyaWJ1dGUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT4gbmV3IEF0dHJpYnV0ZU1ldGFkYXRhKFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKSkpO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnUXVlcnknKSwgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IHtcbiAgICAgIGxldCBwMCA9IHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApO1xuICAgICAgbGV0IHAxID0gdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMSk7XG4gICAgICBpZiAoIWlzUHJlc2VudChwMSkpIHtcbiAgICAgICAgcDEgPSB7fTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgUXVlcnlNZXRhZGF0YShwMCwge2Rlc2NlbmRhbnRzOiBwMS5kZXNjZW5kYW50cywgZmlyc3Q6IHAxLmZpcnN0fSk7XG4gICAgfSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQodGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdDb250ZW50Q2hpbGRyZW4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT4gbmV3IENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhKFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKSkpO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnQ29udGVudENoaWxkJyksXG4gICAgICAgICAgICAgICAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IG5ldyBDb250ZW50Q2hpbGRNZXRhZGF0YShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCkpKTtcbiAgICBjb252ZXJzaW9uTWFwLnNldCh0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ1ZpZXdDaGlsZHJlbicpLFxuICAgICAgICAgICAgICAgICAgICAgIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PiBuZXcgVmlld0NoaWxkcmVuTWV0YWRhdGEoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApKSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQodGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdWaWV3Q2hpbGQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT4gbmV3IFZpZXdDaGlsZE1ldGFkYXRhKFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKSkpO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnVmlld1F1ZXJ5JyksXG4gICAgICAgICAgICAgICAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwMCA9IHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHAxID0gdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzUHJlc2VudChwMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcDEgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVmlld1F1ZXJ5TWV0YWRhdGEocDAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY2VuZGFudHM6IHAxWydkZXNjZW5kYW50cyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdDogcDFbJ2ZpcnN0J10sXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICBjb252ZXJzaW9uTWFwLnNldCh0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ1BpcGUnKSwgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IHtcbiAgICAgIGxldCBwMCA9IHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApO1xuICAgICAgaWYgKCFpc1ByZXNlbnQocDApKSB7XG4gICAgICAgIHAwID0ge307XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFBpcGVNZXRhZGF0YSh7XG4gICAgICAgIG5hbWU6IHAwWyduYW1lJ10sXG4gICAgICAgIHB1cmU6IHAwWydwdXJlJ10sXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBjb252ZXJzaW9uTWFwLnNldCh0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ0hvc3RCaW5kaW5nJyksXG4gICAgICAgICAgICAgICAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IG5ldyBIb3N0QmluZGluZ01ldGFkYXRhKFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKSkpO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnSG9zdExpc3RlbmVyJyksXG4gICAgICAgICAgICAgICAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IG5ldyBIb3N0TGlzdGVuZXJNZXRhZGF0YShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDEpKSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIGNvbnZlcnRLbm93bkRlY29yYXRvcihtb2R1bGVDb250ZXh0OiBzdHJpbmcsIGV4cHJlc3Npb246IHtba2V5OiBzdHJpbmddOiBhbnl9KTogYW55IHtcbiAgICBsZXQgY29udmVydGVyID0gdGhpcy5jb252ZXJzaW9uTWFwLmdldCh0aGlzLmdldERlY29yYXRvclR5cGUobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikpO1xuICAgIGlmIChpc1ByZXNlbnQoY29udmVydGVyKSkgcmV0dXJuIGNvbnZlcnRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0RGVjb3JhdG9yVHlwZShtb2R1bGVDb250ZXh0OiBzdHJpbmcsIGV4cHJlc3Npb246IHtba2V5OiBzdHJpbmddOiBhbnl9KTogU3RhdGljVHlwZSB7XG4gICAgaWYgKGlzTWV0YWRhdGFTeW1ib2xpY0NhbGxFeHByZXNzaW9uKGV4cHJlc3Npb24pKSB7XG4gICAgICBsZXQgdGFyZ2V0ID0gZXhwcmVzc2lvblsnZXhwcmVzc2lvbiddO1xuICAgICAgaWYgKGlzTWV0YWRhdGFTeW1ib2xpY1JlZmVyZW5jZUV4cHJlc3Npb24odGFyZ2V0KSkge1xuICAgICAgICBsZXQgbW9kdWxlSWQgPSB0aGlzLm5vcm1hbGl6ZU1vZHVsZU5hbWUobW9kdWxlQ29udGV4dCwgdGFyZ2V0Wydtb2R1bGUnXSk7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN0YXRpY1R5cGUobW9kdWxlSWQsIHRhcmdldFsnbmFtZSddKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIGdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0OiBzdHJpbmcsIGV4cHJlc3Npb246IHtba2V5OiBzdHJpbmddOiBhbnl9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogbnVtYmVyKTogYW55IHtcbiAgICBpZiAoaXNNZXRhZGF0YVN5bWJvbGljQ2FsbEV4cHJlc3Npb24oZXhwcmVzc2lvbikgJiYgaXNQcmVzZW50KGV4cHJlc3Npb25bJ2FyZ3VtZW50cyddKSAmJlxuICAgICAgICAoPGFueVtdPmV4cHJlc3Npb25bJ2FyZ3VtZW50cyddKS5sZW5ndGggPD0gaW5kZXggKyAxKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaW1wbGlmeShtb2R1bGVDb250ZXh0LCAoPGFueVtdPmV4cHJlc3Npb25bJ2FyZ3VtZW50cyddKVtpbmRleF0pO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UHJvcGVydHlNZXRhZGF0YShtb2R1bGVDb250ZXh0OiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge1trZXk6IHN0cmluZ106IGFueX0pOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgaWYgKGlzUHJlc2VudCh2YWx1ZSkpIHtcbiAgICAgIGxldCByZXN1bHQgPSB7fTtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaCh2YWx1ZSwgKHZhbHVlLCBuYW1lKSA9PiB7XG4gICAgICAgIGxldCBkYXRhID0gdGhpcy5nZXRNZW1iZXJEYXRhKG1vZHVsZUNvbnRleHQsIHZhbHVlKTtcbiAgICAgICAgaWYgKGlzUHJlc2VudChkYXRhKSkge1xuICAgICAgICAgIGxldCBwcm9wZXJ0eURhdGEgPSBkYXRhLmZpbHRlcihkID0+IGRbJ2tpbmQnXSA9PSBcInByb3BlcnR5XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKGQgPT4gZFsnZGlyZWN0aXZlcyddKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlZHVjZSgocCwgYykgPT4gKDxhbnlbXT5wKS5jb25jYXQoPGFueVtdPmMpLCBbXSk7XG4gICAgICAgICAgaWYgKHByb3BlcnR5RGF0YS5sZW5ndGggIT0gMCkge1xuICAgICAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocmVzdWx0LCBuYW1lLCBwcm9wZXJ0eURhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICByZXR1cm4ge307XG4gIH1cblxuICAvLyBjbGFuZy1mb3JtYXQgb2ZmXG4gIHByaXZhdGUgZ2V0TWVtYmVyRGF0YShtb2R1bGVDb250ZXh0OiBzdHJpbmcsIG1lbWJlcjogeyBba2V5OiBzdHJpbmddOiBhbnkgfVtdKTogeyBba2V5OiBzdHJpbmddOiBhbnkgfVtdIHtcbiAgICAvLyBjbGFuZy1mb3JtYXQgb25cbiAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgaWYgKGlzUHJlc2VudChtZW1iZXIpKSB7XG4gICAgICBmb3IgKGxldCBpdGVtIG9mIG1lbWJlcikge1xuICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAga2luZDogaXRlbVsnX19zeW1ib2xpYyddLFxuICAgICAgICAgIGRpcmVjdGl2ZXM6XG4gICAgICAgICAgICAgIGlzUHJlc2VudChpdGVtWydkZWNvcmF0b3JzJ10pID9cbiAgICAgICAgICAgICAgICAgICg8YW55W10+aXRlbVsnZGVjb3JhdG9ycyddKVxuICAgICAgICAgICAgICAgICAgICAgIC5tYXAoZGVjb3JhdG9yID0+IHRoaXMuY29udmVydEtub3duRGVjb3JhdG9yKG1vZHVsZUNvbnRleHQsIGRlY29yYXRvcikpXG4gICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihkID0+IGlzUHJlc2VudChkKSkgOlxuICAgICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIHNpbXBsaWZ5KG1vZHVsZUNvbnRleHQ6IHN0cmluZywgdmFsdWU6IGFueSk6IGFueSB7XG4gICAgbGV0IF90aGlzID0gdGhpcztcblxuICAgIGZ1bmN0aW9uIHNpbXBsaWZ5KGV4cHJlc3Npb246IGFueSk6IGFueSB7XG4gICAgICBpZiAoaXNQcmltaXRpdmUoZXhwcmVzc2lvbikpIHtcbiAgICAgICAgcmV0dXJuIGV4cHJlc3Npb247XG4gICAgICB9XG4gICAgICBpZiAoaXNBcnJheShleHByZXNzaW9uKSkge1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IGl0ZW0gb2YoPGFueT5leHByZXNzaW9uKSkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHNpbXBsaWZ5KGl0ZW0pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudChleHByZXNzaW9uKSkge1xuICAgICAgICBpZiAoaXNQcmVzZW50KGV4cHJlc3Npb25bJ19fc3ltYm9saWMnXSkpIHtcbiAgICAgICAgICBzd2l0Y2ggKGV4cHJlc3Npb25bJ19fc3ltYm9saWMnXSkge1xuICAgICAgICAgICAgY2FzZSBcImJpbm9wXCI6XG4gICAgICAgICAgICAgIGxldCBsZWZ0ID0gc2ltcGxpZnkoZXhwcmVzc2lvblsnbGVmdCddKTtcbiAgICAgICAgICAgICAgbGV0IHJpZ2h0ID0gc2ltcGxpZnkoZXhwcmVzc2lvblsncmlnaHQnXSk7XG4gICAgICAgICAgICAgIHN3aXRjaCAoZXhwcmVzc2lvblsnb3BlcmF0b3InXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJyYmJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICYmIHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJ3x8JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IHx8IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJ3wnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgfCByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICdeJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IF4gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnJic6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAmIHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJz09JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ID09IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJyE9JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICE9IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJz09PSc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA9PT0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnIT09JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICE9PSByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IDwgcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA+IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJzw9JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IDw9IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJz49JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ID49IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJzw8JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IDw8IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJz4+JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ID4+IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJysnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgKyByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICctJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IC0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnKic6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAqIHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJy8nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgLyByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICclJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICUgcmlnaHQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjYXNlIFwicHJlXCI6XG4gICAgICAgICAgICAgIGxldCBvcGVyYW5kID0gc2ltcGxpZnkoZXhwcmVzc2lvblsnb3BlcmFuZCddKTtcbiAgICAgICAgICAgICAgc3dpdGNoIChleHByZXNzaW9uWydvcGVyYXRvciddKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnKyc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gb3BlcmFuZDtcbiAgICAgICAgICAgICAgICBjYXNlICctJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiAtb3BlcmFuZDtcbiAgICAgICAgICAgICAgICBjYXNlICchJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiAhb3BlcmFuZDtcbiAgICAgICAgICAgICAgICBjYXNlICd+JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiB+b3BlcmFuZDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNhc2UgXCJpbmRleFwiOlxuICAgICAgICAgICAgICBsZXQgaW5kZXhUYXJnZXQgPSBzaW1wbGlmeShleHByZXNzaW9uWydleHByZXNzaW9uJ10pO1xuICAgICAgICAgICAgICBsZXQgaW5kZXggPSBzaW1wbGlmeShleHByZXNzaW9uWydpbmRleCddKTtcbiAgICAgICAgICAgICAgaWYgKGlzUHJlc2VudChpbmRleFRhcmdldCkgJiYgaXNQcmltaXRpdmUoaW5kZXgpKSByZXR1cm4gaW5kZXhUYXJnZXRbaW5kZXhdO1xuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNhc2UgXCJzZWxlY3RcIjpcbiAgICAgICAgICAgICAgbGV0IHNlbGVjdFRhcmdldCA9IHNpbXBsaWZ5KGV4cHJlc3Npb25bJ2V4cHJlc3Npb24nXSk7XG4gICAgICAgICAgICAgIGxldCBtZW1iZXIgPSBzaW1wbGlmeShleHByZXNzaW9uWydtZW1iZXInXSk7XG4gICAgICAgICAgICAgIGlmIChpc1ByZXNlbnQoc2VsZWN0VGFyZ2V0KSAmJiBpc1ByaW1pdGl2ZShtZW1iZXIpKSByZXR1cm4gc2VsZWN0VGFyZ2V0W21lbWJlcl07XG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY2FzZSBcInJlZmVyZW5jZVwiOlxuICAgICAgICAgICAgICBsZXQgcmVmZXJlbmNlTW9kdWxlTmFtZSA9XG4gICAgICAgICAgICAgICAgICBfdGhpcy5ub3JtYWxpemVNb2R1bGVOYW1lKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb25bJ21vZHVsZSddKTtcbiAgICAgICAgICAgICAgbGV0IHJlZmVyZW5jZU1vZHVsZSA9IF90aGlzLmdldE1vZHVsZU1ldGFkYXRhKHJlZmVyZW5jZU1vZHVsZU5hbWUpO1xuICAgICAgICAgICAgICBsZXQgcmVmZXJlbmNlVmFsdWUgPSByZWZlcmVuY2VNb2R1bGVbJ21ldGFkYXRhJ11bZXhwcmVzc2lvblsnbmFtZSddXTtcbiAgICAgICAgICAgICAgaWYgKGlzQ2xhc3NNZXRhZGF0YShyZWZlcmVuY2VWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IHRvIGEgcHNldWRvIHR5cGVcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuZ2V0U3RhdGljVHlwZShyZWZlcmVuY2VNb2R1bGVOYW1lLCBleHByZXNzaW9uWyduYW1lJ10pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBfdGhpcy5zaW1wbGlmeShyZWZlcmVuY2VNb2R1bGVOYW1lLCByZWZlcmVuY2VWYWx1ZSk7XG4gICAgICAgICAgICBjYXNlIFwiY2FsbFwiOlxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJlc3VsdCA9IHt9O1xuICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goZXhwcmVzc2lvbiwgKHZhbHVlLCBuYW1lKSA9PiB7IHJlc3VsdFtuYW1lXSA9IHNpbXBsaWZ5KHZhbHVlKTsgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gc2ltcGxpZnkodmFsdWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRNb2R1bGVNZXRhZGF0YShtb2R1bGU6IHN0cmluZyk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICBsZXQgbW9kdWxlTWV0YWRhdGEgPSB0aGlzLm1ldGFkYXRhQ2FjaGUuZ2V0KG1vZHVsZSk7XG4gICAgaWYgKCFpc1ByZXNlbnQobW9kdWxlTWV0YWRhdGEpKSB7XG4gICAgICBtb2R1bGVNZXRhZGF0YSA9IHRoaXMuaG9zdC5nZXRNZXRhZGF0YUZvcihtb2R1bGUpO1xuICAgICAgaWYgKCFpc1ByZXNlbnQobW9kdWxlTWV0YWRhdGEpKSB7XG4gICAgICAgIG1vZHVsZU1ldGFkYXRhID0ge19fc3ltYm9saWM6IFwibW9kdWxlXCIsIG1vZHVsZTogbW9kdWxlLCBtZXRhZGF0YToge319O1xuICAgICAgfVxuICAgICAgdGhpcy5tZXRhZGF0YUNhY2hlLnNldChtb2R1bGUsIG1vZHVsZU1ldGFkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIG1vZHVsZU1ldGFkYXRhO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRUeXBlTWV0YWRhdGEodHlwZTogU3RhdGljVHlwZSk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICBsZXQgbW9kdWxlTWV0YWRhdGEgPSB0aGlzLmdldE1vZHVsZU1ldGFkYXRhKHR5cGUubW9kdWxlSWQpO1xuICAgIGxldCByZXN1bHQgPSBtb2R1bGVNZXRhZGF0YVsnbWV0YWRhdGEnXVt0eXBlLm5hbWVdO1xuICAgIGlmICghaXNQcmVzZW50KHJlc3VsdCkpIHtcbiAgICAgIHJlc3VsdCA9IHtfX3N5bWJvbGljOiBcImNsYXNzXCJ9O1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBub3JtYWxpemVNb2R1bGVOYW1lKGZyb206IHN0cmluZywgdG86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHRvLnN0YXJ0c1dpdGgoJy4nKSkge1xuICAgICAgcmV0dXJuIHBhdGhUbyhmcm9tLCB0byk7XG4gICAgfVxuICAgIHJldHVybiB0bztcbiAgfVxufVxuXG5mdW5jdGlvbiBpc01ldGFkYXRhU3ltYm9saWNDYWxsRXhwcmVzc2lvbihleHByZXNzaW9uOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuICFpc1ByaW1pdGl2ZShleHByZXNzaW9uKSAmJiAhaXNBcnJheShleHByZXNzaW9uKSAmJiBleHByZXNzaW9uWydfX3N5bWJvbGljJ10gPT0gJ2NhbGwnO1xufVxuXG5mdW5jdGlvbiBpc01ldGFkYXRhU3ltYm9saWNSZWZlcmVuY2VFeHByZXNzaW9uKGV4cHJlc3Npb246IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gIWlzUHJpbWl0aXZlKGV4cHJlc3Npb24pICYmICFpc0FycmF5KGV4cHJlc3Npb24pICYmXG4gICAgICAgICBleHByZXNzaW9uWydfX3N5bWJvbGljJ10gPT0gJ3JlZmVyZW5jZSc7XG59XG5cbmZ1bmN0aW9uIGlzQ2xhc3NNZXRhZGF0YShleHByZXNzaW9uOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuICFpc1ByaW1pdGl2ZShleHByZXNzaW9uKSAmJiAhaXNBcnJheShleHByZXNzaW9uKSAmJiBleHByZXNzaW9uWydfX3N5bWJvbGljJ10gPT0gJ2NsYXNzJztcbn1cblxuZnVuY3Rpb24gc3BsaXRQYXRoKHBhdGg6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIHBhdGguc3BsaXQoL1xcL3xcXFxcL2cpO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlUGF0aChwYXRoUGFydHM6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgbGV0IHJlc3VsdCA9IFtdO1xuICBMaXN0V3JhcHBlci5mb3JFYWNoV2l0aEluZGV4KHBhdGhQYXJ0cywgKHBhcnQsIGluZGV4KSA9PiB7XG4gICAgc3dpdGNoIChwYXJ0KSB7XG4gICAgICBjYXNlICcnOlxuICAgICAgY2FzZSAnLic6XG4gICAgICAgIGlmIChpbmRleCA+IDApIHJldHVybjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICcuLic6XG4gICAgICAgIGlmIChpbmRleCA+IDAgJiYgcmVzdWx0Lmxlbmd0aCAhPSAwKSByZXN1bHQucG9wKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmVzdWx0LnB1c2gocGFydCk7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0LmpvaW4oJy8nKTtcbn1cblxuZnVuY3Rpb24gcGF0aFRvKGZyb206IHN0cmluZywgdG86IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCByZXN1bHQgPSB0bztcbiAgaWYgKHRvLnN0YXJ0c1dpdGgoJy4nKSkge1xuICAgIGxldCBmcm9tUGFydHMgPSBzcGxpdFBhdGgoZnJvbSk7XG4gICAgZnJvbVBhcnRzLnBvcCgpOyAgLy8gcmVtb3ZlIHRoZSBmaWxlIG5hbWUuXG4gICAgbGV0IHRvUGFydHMgPSBzcGxpdFBhdGgodG8pO1xuICAgIHJlc3VsdCA9IHJlc29sdmVQYXRoKGZyb21QYXJ0cy5jb25jYXQodG9QYXJ0cykpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG4iXX0=