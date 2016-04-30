import { StringMapWrapper, ListWrapper } from 'angular2/src/facade/collection';
import { isArray, isPresent, isBlank, isPrimitive, isStringMap, FunctionWrapper } from 'angular2/src/facade/lang';
import { AttributeMetadata, DirectiveMetadata, ComponentMetadata, ContentChildrenMetadata, ContentChildMetadata, InputMetadata, HostBindingMetadata, HostListenerMetadata, OutputMetadata, PipeMetadata, ViewChildMetadata, ViewChildrenMetadata, ViewQueryMetadata, QueryMetadata } from 'angular2/src/core/metadata';
import { reflector } from 'angular2/src/core/reflection/reflection';
import { Provider } from 'angular2/src/core/di/provider';
import { HostMetadata, OptionalMetadata, InjectableMetadata, SelfMetadata, SkipSelfMetadata, InjectMetadata } from "angular2/src/core/di/metadata";
/**
 * A token representing the a reference to a static type.
 *
 * This token is unique for a moduleId and name and can be used as a hash table key.
 */
export class StaticSymbol {
    constructor(moduleId, filePath, name) {
        this.moduleId = moduleId;
        this.filePath = filePath;
        this.name = name;
    }
}
/**
 * A static reflector implements enough of the Reflector API that is necessary to compile
 * templates statically.
 */
export class StaticReflector {
    constructor(host) {
        this.host = host;
        this.annotationCache = new Map();
        this.propertyCache = new Map();
        this.parameterCache = new Map();
        this.metadataCache = new Map();
        this.conversionMap = new Map();
        this.initializeConversionMap();
    }
    importUri(typeOrFunc) { return typeOrFunc.filePath; }
    annotations(type) {
        let annotations = this.annotationCache.get(type);
        if (!isPresent(annotations)) {
            let classMetadata = this.getTypeMetadata(type);
            if (isPresent(classMetadata['decorators'])) {
                annotations = this.simplify(type, classMetadata['decorators']);
            }
            else {
                annotations = [];
            }
            this.annotationCache.set(type, annotations.filter(ann => isPresent(ann)));
        }
        return annotations;
    }
    propMetadata(type) {
        let propMetadata = this.propertyCache.get(type);
        if (!isPresent(propMetadata)) {
            let classMetadata = this.getTypeMetadata(type);
            let members = isPresent(classMetadata) ? classMetadata['members'] : {};
            propMetadata = mapStringMap(members, (propData, propName) => {
                let prop = propData.find(a => a['__symbolic'] == 'property');
                if (isPresent(prop) && isPresent(prop['decorators'])) {
                    return this.simplify(type, prop['decorators']);
                }
                else {
                    return [];
                }
            });
            this.propertyCache.set(type, propMetadata);
        }
        return propMetadata;
    }
    parameters(type) {
        try {
            let parameters = this.parameterCache.get(type);
            if (!isPresent(parameters)) {
                let classMetadata = this.getTypeMetadata(type);
                let members = isPresent(classMetadata) ? classMetadata['members'] : null;
                let ctorData = isPresent(members) ? members['__ctor__'] : null;
                if (isPresent(ctorData)) {
                    let ctor = ctorData.find(a => a['__symbolic'] == 'constructor');
                    let parameterTypes = this.simplify(type, ctor['parameters']);
                    let parameterDecorators = this.simplify(type, ctor['parameterDecorators']);
                    parameters = [];
                    ListWrapper.forEachWithIndex(parameterTypes, (paramType, index) => {
                        let nestedResult = [];
                        if (isPresent(paramType)) {
                            nestedResult.push(paramType);
                        }
                        let decorators = isPresent(parameterDecorators) ? parameterDecorators[index] : null;
                        if (isPresent(decorators)) {
                            ListWrapper.addAll(nestedResult, decorators);
                        }
                        parameters.push(nestedResult);
                    });
                }
                if (!isPresent(parameters)) {
                    parameters = [];
                }
                this.parameterCache.set(type, parameters);
            }
            return parameters;
        }
        catch (e) {
            console.log(`Failed on type ${type} with error ${e}`);
            throw e;
        }
    }
    registerDecoratorOrConstructor(type, ctor) {
        this.conversionMap.set(type, (context, args) => {
            let argValues = [];
            ListWrapper.forEachWithIndex(args, (arg, index) => {
                let argValue;
                if (isStringMap(arg) && isBlank(arg['__symbolic'])) {
                    argValue = mapStringMap(arg, (value, key) => this.simplify(context, value));
                }
                else {
                    argValue = this.simplify(context, arg);
                }
                argValues.push(argValue);
            });
            return FunctionWrapper.apply(reflector.factory(ctor), argValues);
        });
    }
    initializeConversionMap() {
        let coreDecorators = 'angular2/src/core/metadata';
        let diDecorators = 'angular2/src/core/di/decorators';
        let diMetadata = 'angular2/src/core/di/metadata';
        let provider = 'angular2/src/core/di/provider';
        this.registerDecoratorOrConstructor(this.host.findDeclaration(provider, 'Provider'), Provider);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'Host'), HostMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'Injectable'), InjectableMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'Self'), SelfMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'SkipSelf'), SkipSelfMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'Inject'), InjectMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'Optional'), OptionalMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Attribute'), AttributeMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Query'), QueryMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'ViewQuery'), ViewQueryMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'ContentChild'), ContentChildMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'ContentChildren'), ContentChildrenMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'ViewChild'), ViewChildMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'ViewChildren'), ViewChildrenMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Input'), InputMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Output'), OutputMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Pipe'), PipeMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'HostBinding'), HostBindingMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'HostListener'), HostListenerMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Directive'), DirectiveMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Component'), ComponentMetadata);
        // Note: Some metadata classes can be used directly with Provider.deps.
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'HostMetadata'), HostMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'SelfMetadata'), SelfMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'SkipSelfMetadata'), SkipSelfMetadata);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'OptionalMetadata'), OptionalMetadata);
    }
    /** @internal */
    simplify(context, value) {
        let _this = this;
        function simplify(expression) {
            if (isPrimitive(expression)) {
                return expression;
            }
            if (isArray(expression)) {
                let result = [];
                for (let item of expression) {
                    result.push(simplify(item));
                }
                return result;
            }
            if (isPresent(expression)) {
                if (isPresent(expression['__symbolic'])) {
                    let staticSymbol;
                    switch (expression['__symbolic']) {
                        case "binop":
                            let left = simplify(expression['left']);
                            let right = simplify(expression['right']);
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
                            let operand = simplify(expression['operand']);
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
                            let indexTarget = simplify(expression['expression']);
                            let index = simplify(expression['index']);
                            if (isPresent(indexTarget) && isPrimitive(index))
                                return indexTarget[index];
                            return null;
                        case "select":
                            let selectTarget = simplify(expression['expression']);
                            let member = simplify(expression['member']);
                            if (isPresent(selectTarget) && isPrimitive(member))
                                return selectTarget[member];
                            return null;
                        case "reference":
                            if (isPresent(expression['module'])) {
                                staticSymbol = _this.host.findDeclaration(expression['module'], expression['name'], context.filePath);
                            }
                            else {
                                staticSymbol = _this.host.getStaticSymbol(context.moduleId, context.filePath, expression['name']);
                            }
                            let result = staticSymbol;
                            let moduleMetadata = _this.getModuleMetadata(staticSymbol.filePath);
                            let declarationValue = isPresent(moduleMetadata) ? moduleMetadata['metadata'][staticSymbol.name] : null;
                            if (isPresent(declarationValue)) {
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
                            let target = expression['expression'];
                            staticSymbol =
                                _this.host.findDeclaration(target['module'], target['name'], context.filePath);
                            let converter = _this.conversionMap.get(staticSymbol);
                            if (isPresent(converter)) {
                                let args = expression['arguments'];
                                if (isBlank(args)) {
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
                return mapStringMap(expression, (value, name) => simplify(value));
            }
            return null;
        }
        return simplify(value);
    }
    /**
     * @param module an absolute path to a module file.
     */
    getModuleMetadata(module) {
        let moduleMetadata = this.metadataCache.get(module);
        if (!isPresent(moduleMetadata)) {
            moduleMetadata = this.host.getMetadataFor(module);
            if (!isPresent(moduleMetadata)) {
                moduleMetadata = { __symbolic: "module", module: module, metadata: {} };
            }
            this.metadataCache.set(module, moduleMetadata);
        }
        return moduleMetadata;
    }
    getTypeMetadata(type) {
        let moduleMetadata = this.getModuleMetadata(type.filePath);
        let result = moduleMetadata['metadata'][type.name];
        if (!isPresent(result)) {
            result = { __symbolic: "class" };
        }
        return result;
    }
}
function isClassMetadata(expression) {
    return !isPrimitive(expression) && !isArray(expression) && expression['__symbolic'] == 'class';
}
function mapStringMap(input, transform) {
    if (isBlank(input))
        return {};
    var result = {};
    StringMapWrapper.keys(input).forEach((key) => { result[key] = transform(input[key], key); });
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljX3JlZmxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtdmhTaW9sUkcudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9zdGF0aWNfcmVmbGVjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsV0FBVyxFQUFDLE1BQU0sZ0NBQWdDO09BQ3JFLEVBQ0wsT0FBTyxFQUNQLFNBQVMsRUFDVCxPQUFPLEVBQ1AsV0FBVyxFQUNYLFdBQVcsRUFDWCxlQUFlLEVBQ2hCLE1BQU0sMEJBQTBCO09BQzFCLEVBQ0wsaUJBQWlCLEVBQ2pCLGlCQUFpQixFQUNqQixpQkFBaUIsRUFDakIsdUJBQXVCLEVBQ3ZCLG9CQUFvQixFQUNwQixhQUFhLEVBQ2IsbUJBQW1CLEVBQ25CLG9CQUFvQixFQUNwQixjQUFjLEVBQ2QsWUFBWSxFQUNaLGlCQUFpQixFQUNqQixvQkFBb0IsRUFDcEIsaUJBQWlCLEVBQ2pCLGFBQWEsRUFDZCxNQUFNLDRCQUE0QjtPQUU1QixFQUFDLFNBQVMsRUFBQyxNQUFNLHlDQUF5QztPQUMxRCxFQUFDLFFBQVEsRUFBQyxNQUFNLCtCQUErQjtPQUMvQyxFQUNMLFlBQVksRUFDWixnQkFBZ0IsRUFDaEIsa0JBQWtCLEVBQ2xCLFlBQVksRUFDWixnQkFBZ0IsRUFDaEIsY0FBYyxFQUNmLE1BQU0sK0JBQStCO0FBMkJ0Qzs7OztHQUlHO0FBQ0g7SUFDRSxZQUFtQixRQUFnQixFQUFTLFFBQWdCLEVBQVMsSUFBWTtRQUE5RCxhQUFRLEdBQVIsUUFBUSxDQUFRO1FBQVMsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUFTLFNBQUksR0FBSixJQUFJLENBQVE7SUFBRyxDQUFDO0FBQ3ZGLENBQUM7QUFFRDs7O0dBR0c7QUFDSDtJQU9FLFlBQW9CLElBQXlCO1FBQXpCLFNBQUksR0FBSixJQUFJLENBQXFCO1FBTnJDLG9CQUFlLEdBQUcsSUFB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LENBQUMsSUFBa0I7UUFDeEMsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzRCxJQUFJLE1BQU0sR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25ELEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QixNQUFNLEdBQUcsRUFBQyxVQUFVLEVBQUUsT0FBTyxFQUFDLENBQUM7UUFDakMsQ0FBQztRQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDaEIsQ0FBQztBQUNILENBQUM7QUFFRCx5QkFBeUIsVUFBZTtJQUN0QyxNQUFNLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksVUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLE9BQU8sQ0FBQztBQUNqRyxDQUFDO0FBRUQsc0JBQXNCLEtBQTJCLEVBQzNCLFNBQTJDO0lBQy9ELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7SUFDOUIsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ2hCLGdCQUFnQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM3RixNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1N0cmluZ01hcFdyYXBwZXIsIExpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtcbiAgaXNBcnJheSxcbiAgaXNQcmVzZW50LFxuICBpc0JsYW5rLFxuICBpc1ByaW1pdGl2ZSxcbiAgaXNTdHJpbmdNYXAsXG4gIEZ1bmN0aW9uV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtcbiAgQXR0cmlidXRlTWV0YWRhdGEsXG4gIERpcmVjdGl2ZU1ldGFkYXRhLFxuICBDb21wb25lbnRNZXRhZGF0YSxcbiAgQ29udGVudENoaWxkcmVuTWV0YWRhdGEsXG4gIENvbnRlbnRDaGlsZE1ldGFkYXRhLFxuICBJbnB1dE1ldGFkYXRhLFxuICBIb3N0QmluZGluZ01ldGFkYXRhLFxuICBIb3N0TGlzdGVuZXJNZXRhZGF0YSxcbiAgT3V0cHV0TWV0YWRhdGEsXG4gIFBpcGVNZXRhZGF0YSxcbiAgVmlld0NoaWxkTWV0YWRhdGEsXG4gIFZpZXdDaGlsZHJlbk1ldGFkYXRhLFxuICBWaWV3UXVlcnlNZXRhZGF0YSxcbiAgUXVlcnlNZXRhZGF0YSxcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEnO1xuaW1wb3J0IHtSZWZsZWN0b3JSZWFkZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdG9yX3JlYWRlcic7XG5pbXBvcnQge3JlZmxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi9yZWZsZWN0aW9uJztcbmltcG9ydCB7UHJvdmlkZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpL3Byb3ZpZGVyJztcbmltcG9ydCB7XG4gIEhvc3RNZXRhZGF0YSxcbiAgT3B0aW9uYWxNZXRhZGF0YSxcbiAgSW5qZWN0YWJsZU1ldGFkYXRhLFxuICBTZWxmTWV0YWRhdGEsXG4gIFNraXBTZWxmTWV0YWRhdGEsXG4gIEluamVjdE1ldGFkYXRhLFxufSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvcmUvZGkvbWV0YWRhdGFcIjtcblxuLyoqXG4gKiBUaGUgaG9zdCBvZiB0aGUgc3RhdGljIHJlc29sdmVyIGlzIGV4cGVjdGVkIHRvIGJlIGFibGUgdG8gcHJvdmlkZSBtb2R1bGUgbWV0YWRhdGEgaW4gdGhlIGZvcm0gb2ZcbiAqIE1vZHVsZU1ldGFkYXRhLiBBbmd1bGFyIDIgQ0xJIHdpbGwgcHJvZHVjZSB0aGlzIG1ldGFkYXRhIGZvciBhIG1vZHVsZSB3aGVuZXZlciBhIC5kLnRzIGZpbGVzIGlzXG4gKiBwcm9kdWNlZCBhbmQgdGhlIG1vZHVsZSBoYXMgZXhwb3J0ZWQgdmFyaWFibGVzIG9yIGNsYXNzZXMgd2l0aCBkZWNvcmF0b3JzLiBNb2R1bGUgbWV0YWRhdGEgY2FuXG4gKiBhbHNvIGJlIHByb2R1Y2VkIGRpcmVjdGx5IGZyb20gVHlwZVNjcmlwdCBzb3VyY2VzIGJ5IHVzaW5nIE1ldGFkYXRhQ29sbGVjdG9yIGluIHRvb2xzL21ldGFkYXRhLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFN0YXRpY1JlZmxlY3Rvckhvc3Qge1xuICAvKipcbiAgICogIFJldHVybiBhIE1vZHVsZU1ldGFkYXRhIGZvciB0aGUgZ2l2ZW4gbW9kdWxlLlxuICAgKlxuICAgKiBAcGFyYW0gbW9kdWxlSWQgaXMgYSBzdHJpbmcgaWRlbnRpZmllciBmb3IgYSBtb2R1bGUgYXMgYW4gYWJzb2x1dGUgcGF0aC5cbiAgICogQHJldHVybnMgdGhlIG1ldGFkYXRhIGZvciB0aGUgZ2l2ZW4gbW9kdWxlLlxuICAgKi9cbiAgZ2V0TWV0YWRhdGFGb3IobW9kdWxlUGF0aDogc3RyaW5nKToge1trZXk6IHN0cmluZ106IGFueX07XG5cbiAgLyoqXG4gICAqIFJlc29sdmUgYSBzeW1ib2wgZnJvbSBhbiBpbXBvcnQgc3RhdGVtZW50IGZvcm0sIHRvIHRoZSBmaWxlIHdoZXJlIGl0IGlzIGRlY2xhcmVkLlxuICAgKiBAcGFyYW0gbW9kdWxlIHRoZSBsb2NhdGlvbiBpbXBvcnRlZCBmcm9tXG4gICAqIEBwYXJhbSBjb250YWluaW5nRmlsZSBmb3IgcmVsYXRpdmUgaW1wb3J0cywgdGhlIHBhdGggb2YgdGhlIGZpbGUgY29udGFpbmluZyB0aGUgaW1wb3J0XG4gICAqL1xuICBmaW5kRGVjbGFyYXRpb24obW9kdWxlUGF0aDogc3RyaW5nLCBzeW1ib2xOYW1lOiBzdHJpbmcsIGNvbnRhaW5pbmdGaWxlPzogc3RyaW5nKTogU3RhdGljU3ltYm9sO1xuXG4gIGdldFN0YXRpY1N5bWJvbChtb2R1bGVJZDogc3RyaW5nLCBkZWNsYXJhdGlvbkZpbGU6IHN0cmluZywgbmFtZTogc3RyaW5nKTogU3RhdGljU3ltYm9sO1xufVxuXG4vKipcbiAqIEEgdG9rZW4gcmVwcmVzZW50aW5nIHRoZSBhIHJlZmVyZW5jZSB0byBhIHN0YXRpYyB0eXBlLlxuICpcbiAqIFRoaXMgdG9rZW4gaXMgdW5pcXVlIGZvciBhIG1vZHVsZUlkIGFuZCBuYW1lIGFuZCBjYW4gYmUgdXNlZCBhcyBhIGhhc2ggdGFibGUga2V5LlxuICovXG5leHBvcnQgY2xhc3MgU3RhdGljU3ltYm9sIHtcbiAgY29uc3RydWN0b3IocHVibGljIG1vZHVsZUlkOiBzdHJpbmcsIHB1YmxpYyBmaWxlUGF0aDogc3RyaW5nLCBwdWJsaWMgbmFtZTogc3RyaW5nKSB7fVxufVxuXG4vKipcbiAqIEEgc3RhdGljIHJlZmxlY3RvciBpbXBsZW1lbnRzIGVub3VnaCBvZiB0aGUgUmVmbGVjdG9yIEFQSSB0aGF0IGlzIG5lY2Vzc2FyeSB0byBjb21waWxlXG4gKiB0ZW1wbGF0ZXMgc3RhdGljYWxseS5cbiAqL1xuZXhwb3J0IGNsYXNzIFN0YXRpY1JlZmxlY3RvciBpbXBsZW1lbnRzIFJlZmxlY3RvclJlYWRlciB7XG4gIHByaXZhdGUgYW5ub3RhdGlvbkNhY2hlID0gbmV3IE1hcDxTdGF0aWNTeW1ib2wsIGFueVtdPigpO1xuICBwcml2YXRlIHByb3BlcnR5Q2FjaGUgPSBuZXcgTWFwPFN0YXRpY1N5bWJvbCwge1trZXk6IHN0cmluZ106IGFueX0+KCk7XG4gIHByaXZhdGUgcGFyYW1ldGVyQ2FjaGUgPSBuZXcgTWFwPFN0YXRpY1N5bWJvbCwgYW55W10+KCk7XG4gIHByaXZhdGUgbWV0YWRhdGFDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCB7W2tleTogc3RyaW5nXTogYW55fT4oKTtcbiAgcHJpdmF0ZSBjb252ZXJzaW9uTWFwID0gbmV3IE1hcDxTdGF0aWNTeW1ib2wsIChjb250ZXh0OiBTdGF0aWNTeW1ib2wsIGFyZ3M6IGFueVtdKSA9PiBhbnk+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBob3N0OiBTdGF0aWNSZWZsZWN0b3JIb3N0KSB7IHRoaXMuaW5pdGlhbGl6ZUNvbnZlcnNpb25NYXAoKTsgfVxuXG4gIGltcG9ydFVyaSh0eXBlT3JGdW5jOiBhbnkpOiBzdHJpbmcgeyByZXR1cm4gKDxTdGF0aWNTeW1ib2w+dHlwZU9yRnVuYykuZmlsZVBhdGg7IH1cblxuICBwdWJsaWMgYW5ub3RhdGlvbnModHlwZTogU3RhdGljU3ltYm9sKTogYW55W10ge1xuICAgIGxldCBhbm5vdGF0aW9ucyA9IHRoaXMuYW5ub3RhdGlvbkNhY2hlLmdldCh0eXBlKTtcbiAgICBpZiAoIWlzUHJlc2VudChhbm5vdGF0aW9ucykpIHtcbiAgICAgIGxldCBjbGFzc01ldGFkYXRhID0gdGhpcy5nZXRUeXBlTWV0YWRhdGEodHlwZSk7XG4gICAgICBpZiAoaXNQcmVzZW50KGNsYXNzTWV0YWRhdGFbJ2RlY29yYXRvcnMnXSkpIHtcbiAgICAgICAgYW5ub3RhdGlvbnMgPSB0aGlzLnNpbXBsaWZ5KHR5cGUsIGNsYXNzTWV0YWRhdGFbJ2RlY29yYXRvcnMnXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhbm5vdGF0aW9ucyA9IFtdO1xuICAgICAgfVxuICAgICAgdGhpcy5hbm5vdGF0aW9uQ2FjaGUuc2V0KHR5cGUsIGFubm90YXRpb25zLmZpbHRlcihhbm4gPT4gaXNQcmVzZW50KGFubikpKTtcbiAgICB9XG4gICAgcmV0dXJuIGFubm90YXRpb25zO1xuICB9XG5cbiAgcHVibGljIHByb3BNZXRhZGF0YSh0eXBlOiBTdGF0aWNTeW1ib2wpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgbGV0IHByb3BNZXRhZGF0YSA9IHRoaXMucHJvcGVydHlDYWNoZS5nZXQodHlwZSk7XG4gICAgaWYgKCFpc1ByZXNlbnQocHJvcE1ldGFkYXRhKSkge1xuICAgICAgbGV0IGNsYXNzTWV0YWRhdGEgPSB0aGlzLmdldFR5cGVNZXRhZGF0YSh0eXBlKTtcbiAgICAgIGxldCBtZW1iZXJzID0gaXNQcmVzZW50KGNsYXNzTWV0YWRhdGEpID8gY2xhc3NNZXRhZGF0YVsnbWVtYmVycyddIDoge307XG4gICAgICBwcm9wTWV0YWRhdGEgPSBtYXBTdHJpbmdNYXAobWVtYmVycywgKHByb3BEYXRhLCBwcm9wTmFtZSkgPT4ge1xuICAgICAgICBsZXQgcHJvcCA9ICg8YW55W10+cHJvcERhdGEpLmZpbmQoYSA9PiBhWydfX3N5bWJvbGljJ10gPT0gJ3Byb3BlcnR5Jyk7XG4gICAgICAgIGlmIChpc1ByZXNlbnQocHJvcCkgJiYgaXNQcmVzZW50KHByb3BbJ2RlY29yYXRvcnMnXSkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zaW1wbGlmeSh0eXBlLCBwcm9wWydkZWNvcmF0b3JzJ10pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLnByb3BlcnR5Q2FjaGUuc2V0KHR5cGUsIHByb3BNZXRhZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiBwcm9wTWV0YWRhdGE7XG4gIH1cblxuICBwdWJsaWMgcGFyYW1ldGVycyh0eXBlOiBTdGF0aWNTeW1ib2wpOiBhbnlbXSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBwYXJhbWV0ZXJzID0gdGhpcy5wYXJhbWV0ZXJDYWNoZS5nZXQodHlwZSk7XG4gICAgICBpZiAoIWlzUHJlc2VudChwYXJhbWV0ZXJzKSkge1xuICAgICAgICBsZXQgY2xhc3NNZXRhZGF0YSA9IHRoaXMuZ2V0VHlwZU1ldGFkYXRhKHR5cGUpO1xuICAgICAgICBsZXQgbWVtYmVycyA9IGlzUHJlc2VudChjbGFzc01ldGFkYXRhKSA/IGNsYXNzTWV0YWRhdGFbJ21lbWJlcnMnXSA6IG51bGw7XG4gICAgICAgIGxldCBjdG9yRGF0YSA9IGlzUHJlc2VudChtZW1iZXJzKSA/IG1lbWJlcnNbJ19fY3Rvcl9fJ10gOiBudWxsO1xuICAgICAgICBpZiAoaXNQcmVzZW50KGN0b3JEYXRhKSkge1xuICAgICAgICAgIGxldCBjdG9yID0gKDxhbnlbXT5jdG9yRGF0YSkuZmluZChhID0+IGFbJ19fc3ltYm9saWMnXSA9PSAnY29uc3RydWN0b3InKTtcbiAgICAgICAgICBsZXQgcGFyYW1ldGVyVHlwZXMgPSA8YW55W10+dGhpcy5zaW1wbGlmeSh0eXBlLCBjdG9yWydwYXJhbWV0ZXJzJ10pO1xuICAgICAgICAgIGxldCBwYXJhbWV0ZXJEZWNvcmF0b3JzID0gPGFueVtdPnRoaXMuc2ltcGxpZnkodHlwZSwgY3RvclsncGFyYW1ldGVyRGVjb3JhdG9ycyddKTtcblxuICAgICAgICAgIHBhcmFtZXRlcnMgPSBbXTtcbiAgICAgICAgICBMaXN0V3JhcHBlci5mb3JFYWNoV2l0aEluZGV4KHBhcmFtZXRlclR5cGVzLCAocGFyYW1UeXBlLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgbGV0IG5lc3RlZFJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgaWYgKGlzUHJlc2VudChwYXJhbVR5cGUpKSB7XG4gICAgICAgICAgICAgIG5lc3RlZFJlc3VsdC5wdXNoKHBhcmFtVHlwZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgZGVjb3JhdG9ycyA9IGlzUHJlc2VudChwYXJhbWV0ZXJEZWNvcmF0b3JzKSA/IHBhcmFtZXRlckRlY29yYXRvcnNbaW5kZXhdIDogbnVsbDtcbiAgICAgICAgICAgIGlmIChpc1ByZXNlbnQoZGVjb3JhdG9ycykpIHtcbiAgICAgICAgICAgICAgTGlzdFdyYXBwZXIuYWRkQWxsKG5lc3RlZFJlc3VsdCwgZGVjb3JhdG9ycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJhbWV0ZXJzLnB1c2gobmVzdGVkUmVzdWx0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzUHJlc2VudChwYXJhbWV0ZXJzKSkge1xuICAgICAgICAgIHBhcmFtZXRlcnMgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBhcmFtZXRlckNhY2hlLnNldCh0eXBlLCBwYXJhbWV0ZXJzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwYXJhbWV0ZXJzO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKGBGYWlsZWQgb24gdHlwZSAke3R5cGV9IHdpdGggZXJyb3IgJHtlfWApO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3Rvcih0eXBlOiBTdGF0aWNTeW1ib2wsIGN0b3I6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuY29udmVyc2lvbk1hcC5zZXQodHlwZSwgKGNvbnRleHQ6IFN0YXRpY1N5bWJvbCwgYXJnczogYW55W10pID0+IHtcbiAgICAgIGxldCBhcmdWYWx1ZXMgPSBbXTtcbiAgICAgIExpc3RXcmFwcGVyLmZvckVhY2hXaXRoSW5kZXgoYXJncywgKGFyZywgaW5kZXgpID0+IHtcbiAgICAgICAgbGV0IGFyZ1ZhbHVlO1xuICAgICAgICBpZiAoaXNTdHJpbmdNYXAoYXJnKSAmJiBpc0JsYW5rKGFyZ1snX19zeW1ib2xpYyddKSkge1xuICAgICAgICAgIGFyZ1ZhbHVlID0gbWFwU3RyaW5nTWFwKGFyZywgKHZhbHVlLCBrZXkpID0+IHRoaXMuc2ltcGxpZnkoY29udGV4dCwgdmFsdWUpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhcmdWYWx1ZSA9IHRoaXMuc2ltcGxpZnkoY29udGV4dCwgYXJnKTtcbiAgICAgICAgfVxuICAgICAgICBhcmdWYWx1ZXMucHVzaChhcmdWYWx1ZSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBGdW5jdGlvbldyYXBwZXIuYXBwbHkocmVmbGVjdG9yLmZhY3RvcnkoY3RvciksIGFyZ1ZhbHVlcyk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGluaXRpYWxpemVDb252ZXJzaW9uTWFwKCk6IHZvaWQge1xuICAgIGxldCBjb3JlRGVjb3JhdG9ycyA9ICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YSc7XG4gICAgbGV0IGRpRGVjb3JhdG9ycyA9ICdhbmd1bGFyMi9zcmMvY29yZS9kaS9kZWNvcmF0b3JzJztcbiAgICBsZXQgZGlNZXRhZGF0YSA9ICdhbmd1bGFyMi9zcmMvY29yZS9kaS9tZXRhZGF0YSc7XG4gICAgbGV0IHByb3ZpZGVyID0gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpL3Byb3ZpZGVyJztcbiAgICB0aGlzLnJlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3Rvcih0aGlzLmhvc3QuZmluZERlY2xhcmF0aW9uKHByb3ZpZGVyLCAnUHJvdmlkZXInKSwgUHJvdmlkZXIpO1xuXG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihkaURlY29yYXRvcnMsICdIb3N0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSG9zdE1ldGFkYXRhKTtcbiAgICB0aGlzLnJlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3Rvcih0aGlzLmhvc3QuZmluZERlY2xhcmF0aW9uKGRpRGVjb3JhdG9ycywgJ0luamVjdGFibGUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJbmplY3RhYmxlTWV0YWRhdGEpO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oZGlEZWNvcmF0b3JzLCAnU2VsZicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNlbGZNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihkaURlY29yYXRvcnMsICdTa2lwU2VsZicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNraXBTZWxmTWV0YWRhdGEpO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oZGlEZWNvcmF0b3JzLCAnSW5qZWN0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSW5qZWN0TWV0YWRhdGEpO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oZGlEZWNvcmF0b3JzLCAnT3B0aW9uYWwnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPcHRpb25hbE1ldGFkYXRhKTtcbiAgICB0aGlzLnJlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3Rvcih0aGlzLmhvc3QuZmluZERlY2xhcmF0aW9uKGNvcmVEZWNvcmF0b3JzLCAnQXR0cmlidXRlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQXR0cmlidXRlTWV0YWRhdGEpO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oY29yZURlY29yYXRvcnMsICdRdWVyeScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFF1ZXJ5TWV0YWRhdGEpO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oY29yZURlY29yYXRvcnMsICdWaWV3UXVlcnknKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBWaWV3UXVlcnlNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihjb3JlRGVjb3JhdG9ycywgJ0NvbnRlbnRDaGlsZCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvbnRlbnRDaGlsZE1ldGFkYXRhKTtcbiAgICB0aGlzLnJlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3RvcihcbiAgICAgICAgdGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihjb3JlRGVjb3JhdG9ycywgJ0NvbnRlbnRDaGlsZHJlbicpLCBDb250ZW50Q2hpbGRyZW5NZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihjb3JlRGVjb3JhdG9ycywgJ1ZpZXdDaGlsZCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZpZXdDaGlsZE1ldGFkYXRhKTtcbiAgICB0aGlzLnJlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3Rvcih0aGlzLmhvc3QuZmluZERlY2xhcmF0aW9uKGNvcmVEZWNvcmF0b3JzLCAnVmlld0NoaWxkcmVuJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVmlld0NoaWxkcmVuTWV0YWRhdGEpO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oY29yZURlY29yYXRvcnMsICdJbnB1dCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIElucHV0TWV0YWRhdGEpO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oY29yZURlY29yYXRvcnMsICdPdXRwdXQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPdXRwdXRNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihjb3JlRGVjb3JhdG9ycywgJ1BpcGUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBQaXBlTWV0YWRhdGEpO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oY29yZURlY29yYXRvcnMsICdIb3N0QmluZGluZycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEhvc3RCaW5kaW5nTWV0YWRhdGEpO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oY29yZURlY29yYXRvcnMsICdIb3N0TGlzdGVuZXInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBIb3N0TGlzdGVuZXJNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihjb3JlRGVjb3JhdG9ycywgJ0RpcmVjdGl2ZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIERpcmVjdGl2ZU1ldGFkYXRhKTtcbiAgICB0aGlzLnJlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3Rvcih0aGlzLmhvc3QuZmluZERlY2xhcmF0aW9uKGNvcmVEZWNvcmF0b3JzLCAnQ29tcG9uZW50JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ29tcG9uZW50TWV0YWRhdGEpO1xuXG4gICAgLy8gTm90ZTogU29tZSBtZXRhZGF0YSBjbGFzc2VzIGNhbiBiZSB1c2VkIGRpcmVjdGx5IHdpdGggUHJvdmlkZXIuZGVwcy5cbiAgICB0aGlzLnJlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3Rvcih0aGlzLmhvc3QuZmluZERlY2xhcmF0aW9uKGRpTWV0YWRhdGEsICdIb3N0TWV0YWRhdGEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBIb3N0TWV0YWRhdGEpO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oZGlNZXRhZGF0YSwgJ1NlbGZNZXRhZGF0YScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNlbGZNZXRhZGF0YSk7XG4gICAgdGhpcy5yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5ob3N0LmZpbmREZWNsYXJhdGlvbihkaU1ldGFkYXRhLCAnU2tpcFNlbGZNZXRhZGF0YScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNraXBTZWxmTWV0YWRhdGEpO1xuICAgIHRoaXMucmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oZGlNZXRhZGF0YSwgJ09wdGlvbmFsTWV0YWRhdGEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPcHRpb25hbE1ldGFkYXRhKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIHNpbXBsaWZ5KGNvbnRleHQ6IFN0YXRpY1N5bWJvbCwgdmFsdWU6IGFueSk6IGFueSB7XG4gICAgbGV0IF90aGlzID0gdGhpcztcblxuICAgIGZ1bmN0aW9uIHNpbXBsaWZ5KGV4cHJlc3Npb246IGFueSk6IGFueSB7XG4gICAgICBpZiAoaXNQcmltaXRpdmUoZXhwcmVzc2lvbikpIHtcbiAgICAgICAgcmV0dXJuIGV4cHJlc3Npb247XG4gICAgICB9XG4gICAgICBpZiAoaXNBcnJheShleHByZXNzaW9uKSkge1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IGl0ZW0gb2YoPGFueT5leHByZXNzaW9uKSkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHNpbXBsaWZ5KGl0ZW0pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudChleHByZXNzaW9uKSkge1xuICAgICAgICBpZiAoaXNQcmVzZW50KGV4cHJlc3Npb25bJ19fc3ltYm9saWMnXSkpIHtcbiAgICAgICAgICBsZXQgc3RhdGljU3ltYm9sO1xuICAgICAgICAgIHN3aXRjaCAoZXhwcmVzc2lvblsnX19zeW1ib2xpYyddKSB7XG4gICAgICAgICAgICBjYXNlIFwiYmlub3BcIjpcbiAgICAgICAgICAgICAgbGV0IGxlZnQgPSBzaW1wbGlmeShleHByZXNzaW9uWydsZWZ0J10pO1xuICAgICAgICAgICAgICBsZXQgcmlnaHQgPSBzaW1wbGlmeShleHByZXNzaW9uWydyaWdodCddKTtcbiAgICAgICAgICAgICAgc3dpdGNoIChleHByZXNzaW9uWydvcGVyYXRvciddKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnJiYnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgJiYgcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnfHwnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgfHwgcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnfCc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCB8IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJ14nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgXiByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICcmJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICYgcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPT0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPT0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnIT0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgIT0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPT09JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ID09PSByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICchPT0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgIT09IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJzwnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPCByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ID4gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPD0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPD0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPj0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPj0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPDwnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPDwgcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPj4nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPj4gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnKyc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCArIHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJy0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgLSByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICcqJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICogcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnLyc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAvIHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJyUnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgJSByaWdodDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNhc2UgXCJwcmVcIjpcbiAgICAgICAgICAgICAgbGV0IG9wZXJhbmQgPSBzaW1wbGlmeShleHByZXNzaW9uWydvcGVyYW5kJ10pO1xuICAgICAgICAgICAgICBzd2l0Y2ggKGV4cHJlc3Npb25bJ29wZXJhdG9yJ10pIHtcbiAgICAgICAgICAgICAgICBjYXNlICcrJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBvcGVyYW5kO1xuICAgICAgICAgICAgICAgIGNhc2UgJy0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIC1vcGVyYW5kO1xuICAgICAgICAgICAgICAgIGNhc2UgJyEnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuICFvcGVyYW5kO1xuICAgICAgICAgICAgICAgIGNhc2UgJ34nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIH5vcGVyYW5kO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY2FzZSBcImluZGV4XCI6XG4gICAgICAgICAgICAgIGxldCBpbmRleFRhcmdldCA9IHNpbXBsaWZ5KGV4cHJlc3Npb25bJ2V4cHJlc3Npb24nXSk7XG4gICAgICAgICAgICAgIGxldCBpbmRleCA9IHNpbXBsaWZ5KGV4cHJlc3Npb25bJ2luZGV4J10pO1xuICAgICAgICAgICAgICBpZiAoaXNQcmVzZW50KGluZGV4VGFyZ2V0KSAmJiBpc1ByaW1pdGl2ZShpbmRleCkpIHJldHVybiBpbmRleFRhcmdldFtpbmRleF07XG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY2FzZSBcInNlbGVjdFwiOlxuICAgICAgICAgICAgICBsZXQgc2VsZWN0VGFyZ2V0ID0gc2ltcGxpZnkoZXhwcmVzc2lvblsnZXhwcmVzc2lvbiddKTtcbiAgICAgICAgICAgICAgbGV0IG1lbWJlciA9IHNpbXBsaWZ5KGV4cHJlc3Npb25bJ21lbWJlciddKTtcbiAgICAgICAgICAgICAgaWYgKGlzUHJlc2VudChzZWxlY3RUYXJnZXQpICYmIGlzUHJpbWl0aXZlKG1lbWJlcikpIHJldHVybiBzZWxlY3RUYXJnZXRbbWVtYmVyXTtcbiAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjYXNlIFwicmVmZXJlbmNlXCI6XG4gICAgICAgICAgICAgIGlmIChpc1ByZXNlbnQoZXhwcmVzc2lvblsnbW9kdWxlJ10pKSB7XG4gICAgICAgICAgICAgICAgc3RhdGljU3ltYm9sID0gX3RoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24oZXhwcmVzc2lvblsnbW9kdWxlJ10sIGV4cHJlc3Npb25bJ25hbWUnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdGF0aWNTeW1ib2wgPSBfdGhpcy5ob3N0LmdldFN0YXRpY1N5bWJvbChjb250ZXh0Lm1vZHVsZUlkLCBjb250ZXh0LmZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb25bJ25hbWUnXSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHN0YXRpY1N5bWJvbDtcbiAgICAgICAgICAgICAgbGV0IG1vZHVsZU1ldGFkYXRhID0gX3RoaXMuZ2V0TW9kdWxlTWV0YWRhdGEoc3RhdGljU3ltYm9sLmZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgbGV0IGRlY2xhcmF0aW9uVmFsdWUgPVxuICAgICAgICAgICAgICAgICAgaXNQcmVzZW50KG1vZHVsZU1ldGFkYXRhKSA/IG1vZHVsZU1ldGFkYXRhWydtZXRhZGF0YSddW3N0YXRpY1N5bWJvbC5uYW1lXSA6IG51bGw7XG4gICAgICAgICAgICAgIGlmIChpc1ByZXNlbnQoZGVjbGFyYXRpb25WYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNDbGFzc01ldGFkYXRhKGRlY2xhcmF0aW9uVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICByZXN1bHQgPSBzdGF0aWNTeW1ib2w7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IF90aGlzLnNpbXBsaWZ5KHN0YXRpY1N5bWJvbCwgZGVjbGFyYXRpb25WYWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICBjYXNlIFwiY2xhc3NcIjpcbiAgICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQ7XG4gICAgICAgICAgICBjYXNlIFwibmV3XCI6XG4gICAgICAgICAgICBjYXNlIFwiY2FsbFwiOlxuICAgICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXhwcmVzc2lvblsnZXhwcmVzc2lvbiddO1xuICAgICAgICAgICAgICBzdGF0aWNTeW1ib2wgPVxuICAgICAgICAgICAgICAgICAgX3RoaXMuaG9zdC5maW5kRGVjbGFyYXRpb24odGFyZ2V0Wydtb2R1bGUnXSwgdGFyZ2V0WyduYW1lJ10sIGNvbnRleHQuZmlsZVBhdGgpO1xuICAgICAgICAgICAgICBsZXQgY29udmVydGVyID0gX3RoaXMuY29udmVyc2lvbk1hcC5nZXQoc3RhdGljU3ltYm9sKTtcbiAgICAgICAgICAgICAgaWYgKGlzUHJlc2VudChjb252ZXJ0ZXIpKSB7XG4gICAgICAgICAgICAgICAgbGV0IGFyZ3MgPSBleHByZXNzaW9uWydhcmd1bWVudHMnXTtcbiAgICAgICAgICAgICAgICBpZiAoaXNCbGFuayhhcmdzKSkge1xuICAgICAgICAgICAgICAgICAgYXJncyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gY29udmVydGVyKGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb250ZXh0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXBTdHJpbmdNYXAoZXhwcmVzc2lvbiwgKHZhbHVlLCBuYW1lKSA9PiBzaW1wbGlmeSh2YWx1ZSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNpbXBsaWZ5KHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gbW9kdWxlIGFuIGFic29sdXRlIHBhdGggdG8gYSBtb2R1bGUgZmlsZS5cbiAgICovXG4gIHB1YmxpYyBnZXRNb2R1bGVNZXRhZGF0YShtb2R1bGU6IHN0cmluZyk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICBsZXQgbW9kdWxlTWV0YWRhdGEgPSB0aGlzLm1ldGFkYXRhQ2FjaGUuZ2V0KG1vZHVsZSk7XG4gICAgaWYgKCFpc1ByZXNlbnQobW9kdWxlTWV0YWRhdGEpKSB7XG4gICAgICBtb2R1bGVNZXRhZGF0YSA9IHRoaXMuaG9zdC5nZXRNZXRhZGF0YUZvcihtb2R1bGUpO1xuICAgICAgaWYgKCFpc1ByZXNlbnQobW9kdWxlTWV0YWRhdGEpKSB7XG4gICAgICAgIG1vZHVsZU1ldGFkYXRhID0ge19fc3ltYm9saWM6IFwibW9kdWxlXCIsIG1vZHVsZTogbW9kdWxlLCBtZXRhZGF0YToge319O1xuICAgICAgfVxuICAgICAgdGhpcy5tZXRhZGF0YUNhY2hlLnNldChtb2R1bGUsIG1vZHVsZU1ldGFkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIG1vZHVsZU1ldGFkYXRhO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRUeXBlTWV0YWRhdGEodHlwZTogU3RhdGljU3ltYm9sKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIGxldCBtb2R1bGVNZXRhZGF0YSA9IHRoaXMuZ2V0TW9kdWxlTWV0YWRhdGEodHlwZS5maWxlUGF0aCk7XG4gICAgbGV0IHJlc3VsdCA9IG1vZHVsZU1ldGFkYXRhWydtZXRhZGF0YSddW3R5cGUubmFtZV07XG4gICAgaWYgKCFpc1ByZXNlbnQocmVzdWx0KSkge1xuICAgICAgcmVzdWx0ID0ge19fc3ltYm9saWM6IFwiY2xhc3NcIn07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNDbGFzc01ldGFkYXRhKGV4cHJlc3Npb246IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gIWlzUHJpbWl0aXZlKGV4cHJlc3Npb24pICYmICFpc0FycmF5KGV4cHJlc3Npb24pICYmIGV4cHJlc3Npb25bJ19fc3ltYm9saWMnXSA9PSAnY2xhc3MnO1xufVxuXG5mdW5jdGlvbiBtYXBTdHJpbmdNYXAoaW5wdXQ6IHtba2V5OiBzdHJpbmddOiBhbnl9LFxuICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogKHZhbHVlOiBhbnksIGtleTogc3RyaW5nKSA9PiBhbnkpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gIGlmIChpc0JsYW5rKGlucHV0KSkgcmV0dXJuIHt9O1xuICB2YXIgcmVzdWx0ID0ge307XG4gIFN0cmluZ01hcFdyYXBwZXIua2V5cyhpbnB1dCkuZm9yRWFjaCgoa2V5KSA9PiB7IHJlc3VsdFtrZXldID0gdHJhbnNmb3JtKGlucHV0W2tleV0sIGtleSk7IH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuIl19