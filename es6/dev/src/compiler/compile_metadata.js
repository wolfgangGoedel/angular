import { isPresent, isBlank, isNumber, isBoolean, normalizeBool, normalizeBlank, serializeEnum, isString, RegExpWrapper, isArray } from 'angular2/src/facade/lang';
import { unimplemented, BaseException } from 'angular2/src/facade/exceptions';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { ChangeDetectionStrategy, CHANGE_DETECTION_STRATEGY_VALUES } from 'angular2/src/core/change_detection/change_detection';
import { ViewEncapsulation, VIEW_ENCAPSULATION_VALUES } from 'angular2/src/core/metadata/view';
import { CssSelector } from 'angular2/src/compiler/selector';
import { splitAtColon, sanitizeIdentifier } from './util';
import { LIFECYCLE_HOOKS_VALUES } from 'angular2/src/core/metadata/lifecycle_hooks';
import { getUrlScheme } from './url_resolver';
// group 1: "property" from "[property]"
// group 2: "event" from "(event)"
var HOST_REG_EXP = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\)))$/g;
export class CompileMetadataWithIdentifier {
    get identifier() { return unimplemented(); }
}
export class CompileMetadataWithType extends CompileMetadataWithIdentifier {
    get type() { return unimplemented(); }
    get identifier() { return unimplemented(); }
}
export function metadataFromJson(data) {
    return _COMPILE_METADATA_FROM_JSON[data['class']](data);
}
export class CompileIdentifierMetadata {
    constructor({ runtime, name, moduleUrl, prefix, value } = {}) {
        this.runtime = runtime;
        this.name = name;
        this.prefix = prefix;
        this.moduleUrl = moduleUrl;
        this.value = value;
    }
    static fromJson(data) {
        let value = isArray(data['value']) ? _arrayFromJson(data['value'], metadataFromJson) :
            _objFromJson(data['value'], metadataFromJson);
        return new CompileIdentifierMetadata({ name: data['name'], prefix: data['prefix'], moduleUrl: data['moduleUrl'], value: value });
    }
    toJson() {
        let value = isArray(this.value) ? _arrayToJson(this.value) : _objToJson(this.value);
        return {
            // Note: Runtime type can't be serialized...
            'class': 'Identifier',
            'name': this.name,
            'moduleUrl': this.moduleUrl,
            'prefix': this.prefix,
            'value': value
        };
    }
    get identifier() { return this; }
}
export class CompileDiDependencyMetadata {
    constructor({ isAttribute, isSelf, isHost, isSkipSelf, isOptional, isValue, query, viewQuery, token, value } = {}) {
        this.isAttribute = normalizeBool(isAttribute);
        this.isSelf = normalizeBool(isSelf);
        this.isHost = normalizeBool(isHost);
        this.isSkipSelf = normalizeBool(isSkipSelf);
        this.isOptional = normalizeBool(isOptional);
        this.isValue = normalizeBool(isValue);
        this.query = query;
        this.viewQuery = viewQuery;
        this.token = token;
        this.value = value;
    }
    static fromJson(data) {
        return new CompileDiDependencyMetadata({
            token: _objFromJson(data['token'], CompileTokenMetadata.fromJson),
            query: _objFromJson(data['query'], CompileQueryMetadata.fromJson),
            viewQuery: _objFromJson(data['viewQuery'], CompileQueryMetadata.fromJson),
            value: data['value'],
            isAttribute: data['isAttribute'],
            isSelf: data['isSelf'],
            isHost: data['isHost'],
            isSkipSelf: data['isSkipSelf'],
            isOptional: data['isOptional'],
            isValue: data['isValue']
        });
    }
    toJson() {
        return {
            'token': _objToJson(this.token),
            'query': _objToJson(this.query),
            'viewQuery': _objToJson(this.viewQuery),
            'value': this.value,
            'isAttribute': this.isAttribute,
            'isSelf': this.isSelf,
            'isHost': this.isHost,
            'isSkipSelf': this.isSkipSelf,
            'isOptional': this.isOptional,
            'isValue': this.isValue
        };
    }
}
export class CompileProviderMetadata {
    constructor({ token, useClass, useValue, useExisting, useFactory, deps, multi }) {
        this.token = token;
        this.useClass = useClass;
        this.useValue = useValue;
        this.useExisting = useExisting;
        this.useFactory = useFactory;
        this.deps = normalizeBlank(deps);
        this.multi = normalizeBool(multi);
    }
    static fromJson(data) {
        return new CompileProviderMetadata({
            token: _objFromJson(data['token'], CompileTokenMetadata.fromJson),
            useClass: _objFromJson(data['useClass'], CompileTypeMetadata.fromJson),
            useExisting: _objFromJson(data['useExisting'], CompileTokenMetadata.fromJson),
            useValue: _objFromJson(data['useValue'], CompileIdentifierMetadata.fromJson),
            useFactory: _objFromJson(data['useFactory'], CompileFactoryMetadata.fromJson),
            multi: data['multi'],
            deps: _arrayFromJson(data['deps'], CompileDiDependencyMetadata.fromJson)
        });
    }
    toJson() {
        return {
            // Note: Runtime type can't be serialized...
            'class': 'Provider',
            'token': _objToJson(this.token),
            'useClass': _objToJson(this.useClass),
            'useExisting': _objToJson(this.useExisting),
            'useValue': _objToJson(this.useValue),
            'useFactory': _objToJson(this.useFactory),
            'multi': this.multi,
            'deps': _arrayToJson(this.deps)
        };
    }
}
export class CompileFactoryMetadata {
    constructor({ runtime, name, moduleUrl, prefix, diDeps, value }) {
        this.runtime = runtime;
        this.name = name;
        this.prefix = prefix;
        this.moduleUrl = moduleUrl;
        this.diDeps = _normalizeArray(diDeps);
        this.value = value;
    }
    get identifier() { return this; }
    static fromJson(data) {
        return new CompileFactoryMetadata({
            name: data['name'],
            prefix: data['prefix'],
            moduleUrl: data['moduleUrl'],
            value: data['value'],
            diDeps: _arrayFromJson(data['diDeps'], CompileDiDependencyMetadata.fromJson)
        });
    }
    toJson() {
        return {
            'class': 'Factory',
            'name': this.name,
            'prefix': this.prefix,
            'moduleUrl': this.moduleUrl,
            'value': this.value,
            'diDeps': _arrayToJson(this.diDeps)
        };
    }
}
export class CompileTokenMetadata {
    constructor({ value, identifier, identifierIsInstance }) {
        this.value = value;
        this.identifier = identifier;
        this.identifierIsInstance = normalizeBool(identifierIsInstance);
    }
    static fromJson(data) {
        return new CompileTokenMetadata({
            value: data['value'],
            identifier: _objFromJson(data['identifier'], CompileIdentifierMetadata.fromJson),
            identifierIsInstance: data['identifierIsInstance']
        });
    }
    toJson() {
        return {
            'value': this.value,
            'identifier': _objToJson(this.identifier),
            'identifierIsInstance': this.identifierIsInstance
        };
    }
    get runtimeCacheKey() {
        if (isPresent(this.identifier)) {
            return this.identifier.runtime;
        }
        else {
            return this.value;
        }
    }
    get assetCacheKey() {
        if (isPresent(this.identifier)) {
            return isPresent(this.identifier.moduleUrl) &&
                isPresent(getUrlScheme(this.identifier.moduleUrl)) ?
                `${this.identifier.name}|${this.identifier.moduleUrl}|${this.identifierIsInstance}` :
                null;
        }
        else {
            return this.value;
        }
    }
    equalsTo(token2) {
        var rk = this.runtimeCacheKey;
        var ak = this.assetCacheKey;
        return (isPresent(rk) && rk == token2.runtimeCacheKey) ||
            (isPresent(ak) && ak == token2.assetCacheKey);
    }
    get name() {
        return isPresent(this.value) ? sanitizeIdentifier(this.value) : this.identifier.name;
    }
}
export class CompileTokenMap {
    constructor() {
        this._valueMap = new Map();
        this._values = [];
    }
    add(token, value) {
        var existing = this.get(token);
        if (isPresent(existing)) {
            throw new BaseException(`Can only add to a TokenMap! Token: ${token.name}`);
        }
        this._values.push(value);
        var rk = token.runtimeCacheKey;
        if (isPresent(rk)) {
            this._valueMap.set(rk, value);
        }
        var ak = token.assetCacheKey;
        if (isPresent(ak)) {
            this._valueMap.set(ak, value);
        }
    }
    get(token) {
        var rk = token.runtimeCacheKey;
        var ak = token.assetCacheKey;
        var result;
        if (isPresent(rk)) {
            result = this._valueMap.get(rk);
        }
        if (isBlank(result) && isPresent(ak)) {
            result = this._valueMap.get(ak);
        }
        return result;
    }
    values() { return this._values; }
    get size() { return this._values.length; }
}
/**
 * Metadata regarding compilation of a type.
 */
export class CompileTypeMetadata {
    constructor({ runtime, name, moduleUrl, prefix, isHost, value, diDeps } = {}) {
        this.runtime = runtime;
        this.name = name;
        this.moduleUrl = moduleUrl;
        this.prefix = prefix;
        this.isHost = normalizeBool(isHost);
        this.value = value;
        this.diDeps = _normalizeArray(diDeps);
    }
    static fromJson(data) {
        return new CompileTypeMetadata({
            name: data['name'],
            moduleUrl: data['moduleUrl'],
            prefix: data['prefix'],
            isHost: data['isHost'],
            value: data['value'],
            diDeps: _arrayFromJson(data['diDeps'], CompileDiDependencyMetadata.fromJson)
        });
    }
    get identifier() { return this; }
    get type() { return this; }
    toJson() {
        return {
            // Note: Runtime type can't be serialized...
            'class': 'Type',
            'name': this.name,
            'moduleUrl': this.moduleUrl,
            'prefix': this.prefix,
            'isHost': this.isHost,
            'value': this.value,
            'diDeps': _arrayToJson(this.diDeps)
        };
    }
}
export class CompileQueryMetadata {
    constructor({ selectors, descendants, first, propertyName } = {}) {
        this.selectors = selectors;
        this.descendants = normalizeBool(descendants);
        this.first = normalizeBool(first);
        this.propertyName = propertyName;
    }
    static fromJson(data) {
        return new CompileQueryMetadata({
            selectors: _arrayFromJson(data['selectors'], CompileTokenMetadata.fromJson),
            descendants: data['descendants'],
            first: data['first'],
            propertyName: data['propertyName']
        });
    }
    toJson() {
        return {
            'selectors': _arrayToJson(this.selectors),
            'descendants': this.descendants,
            'first': this.first,
            'propertyName': this.propertyName
        };
    }
}
/**
 * Metadata regarding compilation of a template.
 */
export class CompileTemplateMetadata {
    constructor({ encapsulation, template, templateUrl, styles, styleUrls, ngContentSelectors } = {}) {
        this.encapsulation = isPresent(encapsulation) ? encapsulation : ViewEncapsulation.Emulated;
        this.template = template;
        this.templateUrl = templateUrl;
        this.styles = isPresent(styles) ? styles : [];
        this.styleUrls = isPresent(styleUrls) ? styleUrls : [];
        this.ngContentSelectors = isPresent(ngContentSelectors) ? ngContentSelectors : [];
    }
    static fromJson(data) {
        return new CompileTemplateMetadata({
            encapsulation: isPresent(data['encapsulation']) ?
                VIEW_ENCAPSULATION_VALUES[data['encapsulation']] :
                data['encapsulation'],
            template: data['template'],
            templateUrl: data['templateUrl'],
            styles: data['styles'],
            styleUrls: data['styleUrls'],
            ngContentSelectors: data['ngContentSelectors']
        });
    }
    toJson() {
        return {
            'encapsulation': isPresent(this.encapsulation) ? serializeEnum(this.encapsulation) : this.encapsulation,
            'template': this.template,
            'templateUrl': this.templateUrl,
            'styles': this.styles,
            'styleUrls': this.styleUrls,
            'ngContentSelectors': this.ngContentSelectors
        };
    }
}
/**
 * Metadata regarding compilation of a directive.
 */
export class CompileDirectiveMetadata {
    constructor({ type, isComponent, selector, exportAs, changeDetection, inputs, outputs, hostListeners, hostProperties, hostAttributes, lifecycleHooks, providers, viewProviders, queries, viewQueries, template } = {}) {
        this.type = type;
        this.isComponent = isComponent;
        this.selector = selector;
        this.exportAs = exportAs;
        this.changeDetection = changeDetection;
        this.inputs = inputs;
        this.outputs = outputs;
        this.hostListeners = hostListeners;
        this.hostProperties = hostProperties;
        this.hostAttributes = hostAttributes;
        this.lifecycleHooks = _normalizeArray(lifecycleHooks);
        this.providers = _normalizeArray(providers);
        this.viewProviders = _normalizeArray(viewProviders);
        this.queries = _normalizeArray(queries);
        this.viewQueries = _normalizeArray(viewQueries);
        this.template = template;
    }
    static create({ type, isComponent, selector, exportAs, changeDetection, inputs, outputs, host, lifecycleHooks, providers, viewProviders, queries, viewQueries, template } = {}) {
        var hostListeners = {};
        var hostProperties = {};
        var hostAttributes = {};
        if (isPresent(host)) {
            StringMapWrapper.forEach(host, (value, key) => {
                var matches = RegExpWrapper.firstMatch(HOST_REG_EXP, key);
                if (isBlank(matches)) {
                    hostAttributes[key] = value;
                }
                else if (isPresent(matches[1])) {
                    hostProperties[matches[1]] = value;
                }
                else if (isPresent(matches[2])) {
                    hostListeners[matches[2]] = value;
                }
            });
        }
        var inputsMap = {};
        if (isPresent(inputs)) {
            inputs.forEach((bindConfig) => {
                // canonical syntax: `dirProp: elProp`
                // if there is no `:`, use dirProp = elProp
                var parts = splitAtColon(bindConfig, [bindConfig, bindConfig]);
                inputsMap[parts[0]] = parts[1];
            });
        }
        var outputsMap = {};
        if (isPresent(outputs)) {
            outputs.forEach((bindConfig) => {
                // canonical syntax: `dirProp: elProp`
                // if there is no `:`, use dirProp = elProp
                var parts = splitAtColon(bindConfig, [bindConfig, bindConfig]);
                outputsMap[parts[0]] = parts[1];
            });
        }
        return new CompileDirectiveMetadata({
            type: type,
            isComponent: normalizeBool(isComponent),
            selector: selector,
            exportAs: exportAs,
            changeDetection: changeDetection,
            inputs: inputsMap,
            outputs: outputsMap,
            hostListeners: hostListeners,
            hostProperties: hostProperties,
            hostAttributes: hostAttributes,
            lifecycleHooks: isPresent(lifecycleHooks) ? lifecycleHooks : [],
            providers: providers,
            viewProviders: viewProviders,
            queries: queries,
            viewQueries: viewQueries,
            template: template
        });
    }
    get identifier() { return this.type; }
    static fromJson(data) {
        return new CompileDirectiveMetadata({
            isComponent: data['isComponent'],
            selector: data['selector'],
            exportAs: data['exportAs'],
            type: isPresent(data['type']) ? CompileTypeMetadata.fromJson(data['type']) : data['type'],
            changeDetection: isPresent(data['changeDetection']) ?
                CHANGE_DETECTION_STRATEGY_VALUES[data['changeDetection']] :
                data['changeDetection'],
            inputs: data['inputs'],
            outputs: data['outputs'],
            hostListeners: data['hostListeners'],
            hostProperties: data['hostProperties'],
            hostAttributes: data['hostAttributes'],
            lifecycleHooks: data['lifecycleHooks'].map(hookValue => LIFECYCLE_HOOKS_VALUES[hookValue]),
            template: isPresent(data['template']) ? CompileTemplateMetadata.fromJson(data['template']) :
                data['template'],
            providers: _arrayFromJson(data['providers'], metadataFromJson),
            viewProviders: _arrayFromJson(data['viewProviders'], metadataFromJson),
            queries: _arrayFromJson(data['queries'], CompileQueryMetadata.fromJson),
            viewQueries: _arrayFromJson(data['viewQueries'], CompileQueryMetadata.fromJson)
        });
    }
    toJson() {
        return {
            'class': 'Directive',
            'isComponent': this.isComponent,
            'selector': this.selector,
            'exportAs': this.exportAs,
            'type': isPresent(this.type) ? this.type.toJson() : this.type,
            'changeDetection': isPresent(this.changeDetection) ? serializeEnum(this.changeDetection) :
                this.changeDetection,
            'inputs': this.inputs,
            'outputs': this.outputs,
            'hostListeners': this.hostListeners,
            'hostProperties': this.hostProperties,
            'hostAttributes': this.hostAttributes,
            'lifecycleHooks': this.lifecycleHooks.map(hook => serializeEnum(hook)),
            'template': isPresent(this.template) ? this.template.toJson() : this.template,
            'providers': _arrayToJson(this.providers),
            'viewProviders': _arrayToJson(this.viewProviders),
            'queries': _arrayToJson(this.queries),
            'viewQueries': _arrayToJson(this.viewQueries)
        };
    }
}
/**
 * Construct {@link CompileDirectiveMetadata} from {@link ComponentTypeMetadata} and a selector.
 */
export function createHostComponentMeta(componentType, componentSelector) {
    var template = CssSelector.parse(componentSelector)[0].getMatchingElementTemplate();
    return CompileDirectiveMetadata.create({
        type: new CompileTypeMetadata({
            runtime: Object,
            name: `${componentType.name}_Host`,
            moduleUrl: componentType.moduleUrl,
            isHost: true
        }),
        template: new CompileTemplateMetadata({ template: template, templateUrl: '', styles: [], styleUrls: [], ngContentSelectors: [] }),
        changeDetection: ChangeDetectionStrategy.Default,
        inputs: [],
        outputs: [],
        host: {},
        lifecycleHooks: [],
        isComponent: true,
        selector: '*',
        providers: [],
        viewProviders: [],
        queries: [],
        viewQueries: []
    });
}
export class CompilePipeMetadata {
    constructor({ type, name, pure, lifecycleHooks } = {}) {
        this.type = type;
        this.name = name;
        this.pure = normalizeBool(pure);
        this.lifecycleHooks = _normalizeArray(lifecycleHooks);
    }
    get identifier() { return this.type; }
    static fromJson(data) {
        return new CompilePipeMetadata({
            type: isPresent(data['type']) ? CompileTypeMetadata.fromJson(data['type']) : data['type'],
            name: data['name'],
            pure: data['pure']
        });
    }
    toJson() {
        return {
            'class': 'Pipe',
            'type': isPresent(this.type) ? this.type.toJson() : null,
            'name': this.name,
            'pure': this.pure
        };
    }
}
var _COMPILE_METADATA_FROM_JSON = {
    'Directive': CompileDirectiveMetadata.fromJson,
    'Pipe': CompilePipeMetadata.fromJson,
    'Type': CompileTypeMetadata.fromJson,
    'Provider': CompileProviderMetadata.fromJson,
    'Identifier': CompileIdentifierMetadata.fromJson,
    'Factory': CompileFactoryMetadata.fromJson
};
function _arrayFromJson(obj, fn) {
    return isBlank(obj) ? null : obj.map(o => _objFromJson(o, fn));
}
function _arrayToJson(obj) {
    return isBlank(obj) ? null : obj.map(_objToJson);
}
function _objFromJson(obj, fn) {
    if (isArray(obj))
        return _arrayFromJson(obj, fn);
    if (isString(obj) || isBlank(obj) || isBoolean(obj) || isNumber(obj))
        return obj;
    return fn(obj);
}
function _objToJson(obj) {
    if (isArray(obj))
        return _arrayToJson(obj);
    if (isString(obj) || isBlank(obj) || isBoolean(obj) || isNumber(obj))
        return obj;
    return obj.toJson();
}
function _normalizeArray(obj) {
    return isPresent(obj) ? obj : [];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZV9tZXRhZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtNkFoWGUyNkcudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9jb21waWxlX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEVBQ0wsU0FBUyxFQUNULE9BQU8sRUFDUCxRQUFRLEVBQ1IsU0FBUyxFQUNULGFBQWEsRUFDYixjQUFjLEVBQ2QsYUFBYSxFQUViLFFBQVEsRUFDUixhQUFhLEVBRWIsT0FBTyxFQUNSLE1BQU0sMEJBQTBCO09BQzFCLEVBQUMsYUFBYSxFQUFFLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNwRSxFQUFDLGdCQUFnQixFQUF5QixNQUFNLGdDQUFnQztPQUNoRixFQUNMLHVCQUF1QixFQUN2QixnQ0FBZ0MsRUFDakMsTUFBTSxxREFBcUQ7T0FDckQsRUFBQyxpQkFBaUIsRUFBRSx5QkFBeUIsRUFBQyxNQUFNLGlDQUFpQztPQUNyRixFQUFDLFdBQVcsRUFBQyxNQUFNLGdDQUFnQztPQUNuRCxFQUFDLFlBQVksRUFBRSxrQkFBa0IsRUFBQyxNQUFNLFFBQVE7T0FDaEQsRUFBaUIsc0JBQXNCLEVBQUMsTUFBTSw0Q0FBNEM7T0FDMUYsRUFBQyxZQUFZLEVBQUMsTUFBTSxnQkFBZ0I7QUFFM0Msd0NBQXdDO0FBQ3hDLGtDQUFrQztBQUNsQyxJQUFJLFlBQVksR0FBRywwQ0FBMEMsQ0FBQztBQUU5RDtJQUdFLElBQUksVUFBVSxLQUFnQyxNQUFNLENBQTRCLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNwRyxDQUFDO0FBRUQsNkNBQXNELDZCQUE2QjtJQUdqRixJQUFJLElBQUksS0FBMEIsTUFBTSxDQUFzQixhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFaEYsSUFBSSxVQUFVLEtBQWdDLE1BQU0sQ0FBNEIsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3BH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LENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ2pELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDakYsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNqQixDQUFDO0FBRUQsb0JBQW9CLEdBQVE7SUFDMUIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMzQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2pGLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDdEIsQ0FBQztBQUVELHlCQUF5QixHQUFVO0lBQ2pDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNuQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgaXNQcmVzZW50LFxuICBpc0JsYW5rLFxuICBpc051bWJlcixcbiAgaXNCb29sZWFuLFxuICBub3JtYWxpemVCb29sLFxuICBub3JtYWxpemVCbGFuayxcbiAgc2VyaWFsaXplRW51bSxcbiAgVHlwZSxcbiAgaXNTdHJpbmcsXG4gIFJlZ0V4cFdyYXBwZXIsXG4gIFN0cmluZ1dyYXBwZXIsXG4gIGlzQXJyYXlcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7dW5pbXBsZW1lbnRlZCwgQmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlciwgTWFwV3JhcHBlciwgU2V0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDSEFOR0VfREVURUNUSU9OX1NUUkFURUdZX1ZBTFVFU1xufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rpb24nO1xuaW1wb3J0IHtWaWV3RW5jYXBzdWxhdGlvbiwgVklFV19FTkNBUFNVTEFUSU9OX1ZBTFVFU30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvdmlldyc7XG5pbXBvcnQge0Nzc1NlbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvc2VsZWN0b3InO1xuaW1wb3J0IHtzcGxpdEF0Q29sb24sIHNhbml0aXplSWRlbnRpZmllcn0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7TGlmZWN5Y2xlSG9va3MsIExJRkVDWUNMRV9IT09LU19WQUxVRVN9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL2xpZmVjeWNsZV9ob29rcyc7XG5pbXBvcnQge2dldFVybFNjaGVtZX0gZnJvbSAnLi91cmxfcmVzb2x2ZXInO1xuXG4vLyBncm91cCAxOiBcInByb3BlcnR5XCIgZnJvbSBcIltwcm9wZXJ0eV1cIlxuLy8gZ3JvdXAgMjogXCJldmVudFwiIGZyb20gXCIoZXZlbnQpXCJcbnZhciBIT1NUX1JFR19FWFAgPSAvXig/Oig/OlxcWyhbXlxcXV0rKVxcXSl8KD86XFwoKFteXFwpXSspXFwpKSkkL2c7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21waWxlTWV0YWRhdGFXaXRoSWRlbnRpZmllciB7XG4gIGFic3RyYWN0IHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fTtcblxuICBnZXQgaWRlbnRpZmllcigpOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHsgcmV0dXJuIDxDb21waWxlSWRlbnRpZmllck1ldGFkYXRhPnVuaW1wbGVtZW50ZWQoKTsgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcGlsZU1ldGFkYXRhV2l0aFR5cGUgZXh0ZW5kcyBDb21waWxlTWV0YWRhdGFXaXRoSWRlbnRpZmllciB7XG4gIGFic3RyYWN0IHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fTtcblxuICBnZXQgdHlwZSgpOiBDb21waWxlVHlwZU1ldGFkYXRhIHsgcmV0dXJuIDxDb21waWxlVHlwZU1ldGFkYXRhPnVuaW1wbGVtZW50ZWQoKTsgfVxuXG4gIGdldCBpZGVudGlmaWVyKCk6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgeyByZXR1cm4gPENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGE+dW5pbXBsZW1lbnRlZCgpOyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXRhZGF0YUZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogYW55IHtcbiAgcmV0dXJuIF9DT01QSUxFX01FVEFEQVRBX0ZST01fSlNPTltkYXRhWydjbGFzcyddXShkYXRhKTtcbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgaW1wbGVtZW50cyBDb21waWxlTWV0YWRhdGFXaXRoSWRlbnRpZmllciB7XG4gIHJ1bnRpbWU6IGFueTtcbiAgbmFtZTogc3RyaW5nO1xuICBwcmVmaXg6IHN0cmluZztcbiAgbW9kdWxlVXJsOiBzdHJpbmc7XG4gIHZhbHVlOiBhbnk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICB7cnVudGltZSwgbmFtZSwgbW9kdWxlVXJsLCBwcmVmaXgsIHZhbHVlfTpcbiAgICAgICAgICB7cnVudGltZT86IGFueSwgbmFtZT86IHN0cmluZywgbW9kdWxlVXJsPzogc3RyaW5nLCBwcmVmaXg/OiBzdHJpbmcsIHZhbHVlPzogYW55fSA9IHt9KSB7XG4gICAgdGhpcy5ydW50aW1lID0gcnVudGltZTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMucHJlZml4ID0gcHJlZml4O1xuICAgIHRoaXMubW9kdWxlVXJsID0gbW9kdWxlVXJsO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEge1xuICAgIGxldCB2YWx1ZSA9IGlzQXJyYXkoZGF0YVsndmFsdWUnXSkgPyBfYXJyYXlGcm9tSnNvbihkYXRhWyd2YWx1ZSddLCBtZXRhZGF0YUZyb21Kc29uKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9vYmpGcm9tSnNvbihkYXRhWyd2YWx1ZSddLCBtZXRhZGF0YUZyb21Kc29uKTtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoXG4gICAgICAgIHtuYW1lOiBkYXRhWyduYW1lJ10sIHByZWZpeDogZGF0YVsncHJlZml4J10sIG1vZHVsZVVybDogZGF0YVsnbW9kdWxlVXJsJ10sIHZhbHVlOiB2YWx1ZX0pO1xuICB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICBsZXQgdmFsdWUgPSBpc0FycmF5KHRoaXMudmFsdWUpID8gX2FycmF5VG9Kc29uKHRoaXMudmFsdWUpIDogX29ialRvSnNvbih0aGlzLnZhbHVlKTtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gTm90ZTogUnVudGltZSB0eXBlIGNhbid0IGJlIHNlcmlhbGl6ZWQuLi5cbiAgICAgICdjbGFzcyc6ICdJZGVudGlmaWVyJyxcbiAgICAgICduYW1lJzogdGhpcy5uYW1lLFxuICAgICAgJ21vZHVsZVVybCc6IHRoaXMubW9kdWxlVXJsLFxuICAgICAgJ3ByZWZpeCc6IHRoaXMucHJlZml4LFxuICAgICAgJ3ZhbHVlJzogdmFsdWVcbiAgICB9O1xuICB9XG5cbiAgZ2V0IGlkZW50aWZpZXIoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiB0aGlzOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEge1xuICBpc0F0dHJpYnV0ZTogYm9vbGVhbjtcbiAgaXNTZWxmOiBib29sZWFuO1xuICBpc0hvc3Q6IGJvb2xlYW47XG4gIGlzU2tpcFNlbGY6IGJvb2xlYW47XG4gIGlzT3B0aW9uYWw6IGJvb2xlYW47XG4gIGlzVmFsdWU6IGJvb2xlYW47XG4gIHF1ZXJ5OiBDb21waWxlUXVlcnlNZXRhZGF0YTtcbiAgdmlld1F1ZXJ5OiBDb21waWxlUXVlcnlNZXRhZGF0YTtcbiAgdG9rZW46IENvbXBpbGVUb2tlbk1ldGFkYXRhO1xuICB2YWx1ZTogYW55O1xuXG4gIGNvbnN0cnVjdG9yKHtpc0F0dHJpYnV0ZSwgaXNTZWxmLCBpc0hvc3QsIGlzU2tpcFNlbGYsIGlzT3B0aW9uYWwsIGlzVmFsdWUsIHF1ZXJ5LCB2aWV3UXVlcnksXG4gICAgICAgICAgICAgICB0b2tlbiwgdmFsdWV9OiB7XG4gICAgaXNBdHRyaWJ1dGU/OiBib29sZWFuLFxuICAgIGlzU2VsZj86IGJvb2xlYW4sXG4gICAgaXNIb3N0PzogYm9vbGVhbixcbiAgICBpc1NraXBTZWxmPzogYm9vbGVhbixcbiAgICBpc09wdGlvbmFsPzogYm9vbGVhbixcbiAgICBpc1ZhbHVlPzogYm9vbGVhbixcbiAgICBxdWVyeT86IENvbXBpbGVRdWVyeU1ldGFkYXRhLFxuICAgIHZpZXdRdWVyeT86IENvbXBpbGVRdWVyeU1ldGFkYXRhLFxuICAgIHRva2VuPzogQ29tcGlsZVRva2VuTWV0YWRhdGEsXG4gICAgdmFsdWU/OiBhbnlcbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5pc0F0dHJpYnV0ZSA9IG5vcm1hbGl6ZUJvb2woaXNBdHRyaWJ1dGUpO1xuICAgIHRoaXMuaXNTZWxmID0gbm9ybWFsaXplQm9vbChpc1NlbGYpO1xuICAgIHRoaXMuaXNIb3N0ID0gbm9ybWFsaXplQm9vbChpc0hvc3QpO1xuICAgIHRoaXMuaXNTa2lwU2VsZiA9IG5vcm1hbGl6ZUJvb2woaXNTa2lwU2VsZik7XG4gICAgdGhpcy5pc09wdGlvbmFsID0gbm9ybWFsaXplQm9vbChpc09wdGlvbmFsKTtcbiAgICB0aGlzLmlzVmFsdWUgPSBub3JtYWxpemVCb29sKGlzVmFsdWUpO1xuICAgIHRoaXMucXVlcnkgPSBxdWVyeTtcbiAgICB0aGlzLnZpZXdRdWVyeSA9IHZpZXdRdWVyeTtcbiAgICB0aGlzLnRva2VuID0gdG9rZW47XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSh7XG4gICAgICB0b2tlbjogX29iakZyb21Kc29uKGRhdGFbJ3Rva2VuJ10sIENvbXBpbGVUb2tlbk1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIHF1ZXJ5OiBfb2JqRnJvbUpzb24oZGF0YVsncXVlcnknXSwgQ29tcGlsZVF1ZXJ5TWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgdmlld1F1ZXJ5OiBfb2JqRnJvbUpzb24oZGF0YVsndmlld1F1ZXJ5J10sIENvbXBpbGVRdWVyeU1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIHZhbHVlOiBkYXRhWyd2YWx1ZSddLFxuICAgICAgaXNBdHRyaWJ1dGU6IGRhdGFbJ2lzQXR0cmlidXRlJ10sXG4gICAgICBpc1NlbGY6IGRhdGFbJ2lzU2VsZiddLFxuICAgICAgaXNIb3N0OiBkYXRhWydpc0hvc3QnXSxcbiAgICAgIGlzU2tpcFNlbGY6IGRhdGFbJ2lzU2tpcFNlbGYnXSxcbiAgICAgIGlzT3B0aW9uYWw6IGRhdGFbJ2lzT3B0aW9uYWwnXSxcbiAgICAgIGlzVmFsdWU6IGRhdGFbJ2lzVmFsdWUnXVxuICAgIH0pO1xuICB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4ge1xuICAgICAgJ3Rva2VuJzogX29ialRvSnNvbih0aGlzLnRva2VuKSxcbiAgICAgICdxdWVyeSc6IF9vYmpUb0pzb24odGhpcy5xdWVyeSksXG4gICAgICAndmlld1F1ZXJ5JzogX29ialRvSnNvbih0aGlzLnZpZXdRdWVyeSksXG4gICAgICAndmFsdWUnOiB0aGlzLnZhbHVlLFxuICAgICAgJ2lzQXR0cmlidXRlJzogdGhpcy5pc0F0dHJpYnV0ZSxcbiAgICAgICdpc1NlbGYnOiB0aGlzLmlzU2VsZixcbiAgICAgICdpc0hvc3QnOiB0aGlzLmlzSG9zdCxcbiAgICAgICdpc1NraXBTZWxmJzogdGhpcy5pc1NraXBTZWxmLFxuICAgICAgJ2lzT3B0aW9uYWwnOiB0aGlzLmlzT3B0aW9uYWwsXG4gICAgICAnaXNWYWx1ZSc6IHRoaXMuaXNWYWx1ZVxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVQcm92aWRlck1ldGFkYXRhIHtcbiAgdG9rZW46IENvbXBpbGVUb2tlbk1ldGFkYXRhO1xuICB1c2VDbGFzczogQ29tcGlsZVR5cGVNZXRhZGF0YTtcbiAgdXNlVmFsdWU6IGFueTtcbiAgdXNlRXhpc3Rpbmc6IENvbXBpbGVUb2tlbk1ldGFkYXRhO1xuICB1c2VGYWN0b3J5OiBDb21waWxlRmFjdG9yeU1ldGFkYXRhO1xuICBkZXBzOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXTtcbiAgbXVsdGk6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3Ioe3Rva2VuLCB1c2VDbGFzcywgdXNlVmFsdWUsIHVzZUV4aXN0aW5nLCB1c2VGYWN0b3J5LCBkZXBzLCBtdWx0aX06IHtcbiAgICB0b2tlbj86IENvbXBpbGVUb2tlbk1ldGFkYXRhLFxuICAgIHVzZUNsYXNzPzogQ29tcGlsZVR5cGVNZXRhZGF0YSxcbiAgICB1c2VWYWx1ZT86IGFueSxcbiAgICB1c2VFeGlzdGluZz86IENvbXBpbGVUb2tlbk1ldGFkYXRhLFxuICAgIHVzZUZhY3Rvcnk/OiBDb21waWxlRmFjdG9yeU1ldGFkYXRhLFxuICAgIGRlcHM/OiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXSxcbiAgICBtdWx0aT86IGJvb2xlYW5cbiAgfSkge1xuICAgIHRoaXMudG9rZW4gPSB0b2tlbjtcbiAgICB0aGlzLnVzZUNsYXNzID0gdXNlQ2xhc3M7XG4gICAgdGhpcy51c2VWYWx1ZSA9IHVzZVZhbHVlO1xuICAgIHRoaXMudXNlRXhpc3RpbmcgPSB1c2VFeGlzdGluZztcbiAgICB0aGlzLnVzZUZhY3RvcnkgPSB1c2VGYWN0b3J5O1xuICAgIHRoaXMuZGVwcyA9IG5vcm1hbGl6ZUJsYW5rKGRlcHMpO1xuICAgIHRoaXMubXVsdGkgPSBub3JtYWxpemVCb29sKG11bHRpKTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVQcm92aWRlck1ldGFkYXRhKHtcbiAgICAgIHRva2VuOiBfb2JqRnJvbUpzb24oZGF0YVsndG9rZW4nXSwgQ29tcGlsZVRva2VuTWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgdXNlQ2xhc3M6IF9vYmpGcm9tSnNvbihkYXRhWyd1c2VDbGFzcyddLCBDb21waWxlVHlwZU1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIHVzZUV4aXN0aW5nOiBfb2JqRnJvbUpzb24oZGF0YVsndXNlRXhpc3RpbmcnXSwgQ29tcGlsZVRva2VuTWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgdXNlVmFsdWU6IF9vYmpGcm9tSnNvbihkYXRhWyd1c2VWYWx1ZSddLCBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIHVzZUZhY3Rvcnk6IF9vYmpGcm9tSnNvbihkYXRhWyd1c2VGYWN0b3J5J10sIENvbXBpbGVGYWN0b3J5TWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgbXVsdGk6IGRhdGFbJ211bHRpJ10sXG4gICAgICBkZXBzOiBfYXJyYXlGcm9tSnNvbihkYXRhWydkZXBzJ10sIENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YS5mcm9tSnNvbilcbiAgICB9KTtcbiAgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIE5vdGU6IFJ1bnRpbWUgdHlwZSBjYW4ndCBiZSBzZXJpYWxpemVkLi4uXG4gICAgICAnY2xhc3MnOiAnUHJvdmlkZXInLFxuICAgICAgJ3Rva2VuJzogX29ialRvSnNvbih0aGlzLnRva2VuKSxcbiAgICAgICd1c2VDbGFzcyc6IF9vYmpUb0pzb24odGhpcy51c2VDbGFzcyksXG4gICAgICAndXNlRXhpc3RpbmcnOiBfb2JqVG9Kc29uKHRoaXMudXNlRXhpc3RpbmcpLFxuICAgICAgJ3VzZVZhbHVlJzogX29ialRvSnNvbih0aGlzLnVzZVZhbHVlKSxcbiAgICAgICd1c2VGYWN0b3J5JzogX29ialRvSnNvbih0aGlzLnVzZUZhY3RvcnkpLFxuICAgICAgJ211bHRpJzogdGhpcy5tdWx0aSxcbiAgICAgICdkZXBzJzogX2FycmF5VG9Kc29uKHRoaXMuZGVwcylcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlRmFjdG9yeU1ldGFkYXRhIGltcGxlbWVudHMgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSxcbiAgICBDb21waWxlTWV0YWRhdGFXaXRoSWRlbnRpZmllciB7XG4gIHJ1bnRpbWU6IEZ1bmN0aW9uO1xuICBuYW1lOiBzdHJpbmc7XG4gIHByZWZpeDogc3RyaW5nO1xuICBtb2R1bGVVcmw6IHN0cmluZztcbiAgdmFsdWU6IGFueTtcbiAgZGlEZXBzOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXTtcblxuICBjb25zdHJ1Y3Rvcih7cnVudGltZSwgbmFtZSwgbW9kdWxlVXJsLCBwcmVmaXgsIGRpRGVwcywgdmFsdWV9OiB7XG4gICAgcnVudGltZT86IEZ1bmN0aW9uLFxuICAgIG5hbWU/OiBzdHJpbmcsXG4gICAgcHJlZml4Pzogc3RyaW5nLFxuICAgIG1vZHVsZVVybD86IHN0cmluZyxcbiAgICB2YWx1ZT86IGJvb2xlYW4sXG4gICAgZGlEZXBzPzogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW11cbiAgfSkge1xuICAgIHRoaXMucnVudGltZSA9IHJ1bnRpbWU7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnByZWZpeCA9IHByZWZpeDtcbiAgICB0aGlzLm1vZHVsZVVybCA9IG1vZHVsZVVybDtcbiAgICB0aGlzLmRpRGVwcyA9IF9ub3JtYWxpemVBcnJheShkaURlcHMpO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIGdldCBpZGVudGlmaWVyKCk6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgeyByZXR1cm4gdGhpczsgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVGYWN0b3J5TWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgQ29tcGlsZUZhY3RvcnlNZXRhZGF0YSh7XG4gICAgICBuYW1lOiBkYXRhWyduYW1lJ10sXG4gICAgICBwcmVmaXg6IGRhdGFbJ3ByZWZpeCddLFxuICAgICAgbW9kdWxlVXJsOiBkYXRhWydtb2R1bGVVcmwnXSxcbiAgICAgIHZhbHVlOiBkYXRhWyd2YWx1ZSddLFxuICAgICAgZGlEZXBzOiBfYXJyYXlGcm9tSnNvbihkYXRhWydkaURlcHMnXSwgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhLmZyb21Kc29uKVxuICAgIH0pO1xuICB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4ge1xuICAgICAgJ2NsYXNzJzogJ0ZhY3RvcnknLFxuICAgICAgJ25hbWUnOiB0aGlzLm5hbWUsXG4gICAgICAncHJlZml4JzogdGhpcy5wcmVmaXgsXG4gICAgICAnbW9kdWxlVXJsJzogdGhpcy5tb2R1bGVVcmwsXG4gICAgICAndmFsdWUnOiB0aGlzLnZhbHVlLFxuICAgICAgJ2RpRGVwcyc6IF9hcnJheVRvSnNvbih0aGlzLmRpRGVwcylcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlVG9rZW5NZXRhZGF0YSBpbXBsZW1lbnRzIENvbXBpbGVNZXRhZGF0YVdpdGhJZGVudGlmaWVyIHtcbiAgdmFsdWU6IGFueTtcbiAgaWRlbnRpZmllcjogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YTtcbiAgaWRlbnRpZmllcklzSW5zdGFuY2U6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3Ioe3ZhbHVlLCBpZGVudGlmaWVyLCBpZGVudGlmaWVySXNJbnN0YW5jZX06IHtcbiAgICB2YWx1ZT86IGFueSxcbiAgICBpZGVudGlmaWVyPzogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSxcbiAgICBpZGVudGlmaWVySXNJbnN0YW5jZT86IGJvb2xlYW5cbiAgfSkge1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmlkZW50aWZpZXIgPSBpZGVudGlmaWVyO1xuICAgIHRoaXMuaWRlbnRpZmllcklzSW5zdGFuY2UgPSBub3JtYWxpemVCb29sKGlkZW50aWZpZXJJc0luc3RhbmNlKTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVUb2tlbk1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVUb2tlbk1ldGFkYXRhKHtcbiAgICAgIHZhbHVlOiBkYXRhWyd2YWx1ZSddLFxuICAgICAgaWRlbnRpZmllcjogX29iakZyb21Kc29uKGRhdGFbJ2lkZW50aWZpZXInXSwgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YS5mcm9tSnNvbiksXG4gICAgICBpZGVudGlmaWVySXNJbnN0YW5jZTogZGF0YVsnaWRlbnRpZmllcklzSW5zdGFuY2UnXVxuICAgIH0pO1xuICB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4ge1xuICAgICAgJ3ZhbHVlJzogdGhpcy52YWx1ZSxcbiAgICAgICdpZGVudGlmaWVyJzogX29ialRvSnNvbih0aGlzLmlkZW50aWZpZXIpLFxuICAgICAgJ2lkZW50aWZpZXJJc0luc3RhbmNlJzogdGhpcy5pZGVudGlmaWVySXNJbnN0YW5jZVxuICAgIH07XG4gIH1cblxuICBnZXQgcnVudGltZUNhY2hlS2V5KCk6IGFueSB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmlkZW50aWZpZXIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5pZGVudGlmaWVyLnJ1bnRpbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIGdldCBhc3NldENhY2hlS2V5KCk6IGFueSB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmlkZW50aWZpZXIpKSB7XG4gICAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuaWRlbnRpZmllci5tb2R1bGVVcmwpICYmXG4gICAgICAgICAgICAgICAgICAgICBpc1ByZXNlbnQoZ2V0VXJsU2NoZW1lKHRoaXMuaWRlbnRpZmllci5tb2R1bGVVcmwpKSA/XG4gICAgICAgICAgICAgICAgIGAke3RoaXMuaWRlbnRpZmllci5uYW1lfXwke3RoaXMuaWRlbnRpZmllci5tb2R1bGVVcmx9fCR7dGhpcy5pZGVudGlmaWVySXNJbnN0YW5jZX1gIDpcbiAgICAgICAgICAgICAgICAgbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfVxuICB9XG5cbiAgZXF1YWxzVG8odG9rZW4yOiBDb21waWxlVG9rZW5NZXRhZGF0YSk6IGJvb2xlYW4ge1xuICAgIHZhciByayA9IHRoaXMucnVudGltZUNhY2hlS2V5O1xuICAgIHZhciBhayA9IHRoaXMuYXNzZXRDYWNoZUtleTtcbiAgICByZXR1cm4gKGlzUHJlc2VudChyaykgJiYgcmsgPT0gdG9rZW4yLnJ1bnRpbWVDYWNoZUtleSkgfHxcbiAgICAgICAgICAgKGlzUHJlc2VudChhaykgJiYgYWsgPT0gdG9rZW4yLmFzc2V0Q2FjaGVLZXkpO1xuICB9XG5cbiAgZ2V0IG5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMudmFsdWUpID8gc2FuaXRpemVJZGVudGlmaWVyKHRoaXMudmFsdWUpIDogdGhpcy5pZGVudGlmaWVyLm5hbWU7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVUb2tlbk1hcDxWQUxVRT4ge1xuICBwcml2YXRlIF92YWx1ZU1hcCA9IG5ldyBNYXA8YW55LCBWQUxVRT4oKTtcbiAgcHJpdmF0ZSBfdmFsdWVzOiBWQUxVRVtdID0gW107XG5cbiAgYWRkKHRva2VuOiBDb21waWxlVG9rZW5NZXRhZGF0YSwgdmFsdWU6IFZBTFVFKSB7XG4gICAgdmFyIGV4aXN0aW5nID0gdGhpcy5nZXQodG9rZW4pO1xuICAgIGlmIChpc1ByZXNlbnQoZXhpc3RpbmcpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgQ2FuIG9ubHkgYWRkIHRvIGEgVG9rZW5NYXAhIFRva2VuOiAke3Rva2VuLm5hbWV9YCk7XG4gICAgfVxuICAgIHRoaXMuX3ZhbHVlcy5wdXNoKHZhbHVlKTtcbiAgICB2YXIgcmsgPSB0b2tlbi5ydW50aW1lQ2FjaGVLZXk7XG4gICAgaWYgKGlzUHJlc2VudChyaykpIHtcbiAgICAgIHRoaXMuX3ZhbHVlTWFwLnNldChyaywgdmFsdWUpO1xuICAgIH1cbiAgICB2YXIgYWsgPSB0b2tlbi5hc3NldENhY2hlS2V5O1xuICAgIGlmIChpc1ByZXNlbnQoYWspKSB7XG4gICAgICB0aGlzLl92YWx1ZU1hcC5zZXQoYWssIHZhbHVlKTtcbiAgICB9XG4gIH1cbiAgZ2V0KHRva2VuOiBDb21waWxlVG9rZW5NZXRhZGF0YSk6IFZBTFVFIHtcbiAgICB2YXIgcmsgPSB0b2tlbi5ydW50aW1lQ2FjaGVLZXk7XG4gICAgdmFyIGFrID0gdG9rZW4uYXNzZXRDYWNoZUtleTtcbiAgICB2YXIgcmVzdWx0O1xuICAgIGlmIChpc1ByZXNlbnQocmspKSB7XG4gICAgICByZXN1bHQgPSB0aGlzLl92YWx1ZU1hcC5nZXQocmspO1xuICAgIH1cbiAgICBpZiAoaXNCbGFuayhyZXN1bHQpICYmIGlzUHJlc2VudChhaykpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX3ZhbHVlTWFwLmdldChhayk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgdmFsdWVzKCk6IFZBTFVFW10geyByZXR1cm4gdGhpcy5fdmFsdWVzOyB9XG4gIGdldCBzaXplKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl92YWx1ZXMubGVuZ3RoOyB9XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVnYXJkaW5nIGNvbXBpbGF0aW9uIG9mIGEgdHlwZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBpbGVUeXBlTWV0YWRhdGEgaW1wbGVtZW50cyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLCBDb21waWxlTWV0YWRhdGFXaXRoVHlwZSB7XG4gIHJ1bnRpbWU6IFR5cGU7XG4gIG5hbWU6IHN0cmluZztcbiAgcHJlZml4OiBzdHJpbmc7XG4gIG1vZHVsZVVybDogc3RyaW5nO1xuICBpc0hvc3Q6IGJvb2xlYW47XG4gIHZhbHVlOiBhbnk7XG4gIGRpRGVwczogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW107XG5cbiAgY29uc3RydWN0b3Ioe3J1bnRpbWUsIG5hbWUsIG1vZHVsZVVybCwgcHJlZml4LCBpc0hvc3QsIHZhbHVlLCBkaURlcHN9OiB7XG4gICAgcnVudGltZT86IFR5cGUsXG4gICAgbmFtZT86IHN0cmluZyxcbiAgICBtb2R1bGVVcmw/OiBzdHJpbmcsXG4gICAgcHJlZml4Pzogc3RyaW5nLFxuICAgIGlzSG9zdD86IGJvb2xlYW4sXG4gICAgdmFsdWU/OiBhbnksXG4gICAgZGlEZXBzPzogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW11cbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5ydW50aW1lID0gcnVudGltZTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMubW9kdWxlVXJsID0gbW9kdWxlVXJsO1xuICAgIHRoaXMucHJlZml4ID0gcHJlZml4O1xuICAgIHRoaXMuaXNIb3N0ID0gbm9ybWFsaXplQm9vbChpc0hvc3QpO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmRpRGVwcyA9IF9ub3JtYWxpemVBcnJheShkaURlcHMpO1xuICB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZVR5cGVNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlVHlwZU1ldGFkYXRhKHtcbiAgICAgIG5hbWU6IGRhdGFbJ25hbWUnXSxcbiAgICAgIG1vZHVsZVVybDogZGF0YVsnbW9kdWxlVXJsJ10sXG4gICAgICBwcmVmaXg6IGRhdGFbJ3ByZWZpeCddLFxuICAgICAgaXNIb3N0OiBkYXRhWydpc0hvc3QnXSxcbiAgICAgIHZhbHVlOiBkYXRhWyd2YWx1ZSddLFxuICAgICAgZGlEZXBzOiBfYXJyYXlGcm9tSnNvbihkYXRhWydkaURlcHMnXSwgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhLmZyb21Kc29uKVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0IGlkZW50aWZpZXIoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiB0aGlzOyB9XG4gIGdldCB0eXBlKCk6IENvbXBpbGVUeXBlTWV0YWRhdGEgeyByZXR1cm4gdGhpczsgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIE5vdGU6IFJ1bnRpbWUgdHlwZSBjYW4ndCBiZSBzZXJpYWxpemVkLi4uXG4gICAgICAnY2xhc3MnOiAnVHlwZScsXG4gICAgICAnbmFtZSc6IHRoaXMubmFtZSxcbiAgICAgICdtb2R1bGVVcmwnOiB0aGlzLm1vZHVsZVVybCxcbiAgICAgICdwcmVmaXgnOiB0aGlzLnByZWZpeCxcbiAgICAgICdpc0hvc3QnOiB0aGlzLmlzSG9zdCxcbiAgICAgICd2YWx1ZSc6IHRoaXMudmFsdWUsXG4gICAgICAnZGlEZXBzJzogX2FycmF5VG9Kc29uKHRoaXMuZGlEZXBzKVxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVRdWVyeU1ldGFkYXRhIHtcbiAgc2VsZWN0b3JzOiBBcnJheTxDb21waWxlVG9rZW5NZXRhZGF0YT47XG4gIGRlc2NlbmRhbnRzOiBib29sZWFuO1xuICBmaXJzdDogYm9vbGVhbjtcbiAgcHJvcGVydHlOYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Ioe3NlbGVjdG9ycywgZGVzY2VuZGFudHMsIGZpcnN0LCBwcm9wZXJ0eU5hbWV9OiB7XG4gICAgc2VsZWN0b3JzPzogQXJyYXk8Q29tcGlsZVRva2VuTWV0YWRhdGE+LFxuICAgIGRlc2NlbmRhbnRzPzogYm9vbGVhbixcbiAgICBmaXJzdD86IGJvb2xlYW4sXG4gICAgcHJvcGVydHlOYW1lPzogc3RyaW5nXG4gIH0gPSB7fSkge1xuICAgIHRoaXMuc2VsZWN0b3JzID0gc2VsZWN0b3JzO1xuICAgIHRoaXMuZGVzY2VuZGFudHMgPSBub3JtYWxpemVCb29sKGRlc2NlbmRhbnRzKTtcbiAgICB0aGlzLmZpcnN0ID0gbm9ybWFsaXplQm9vbChmaXJzdCk7XG4gICAgdGhpcy5wcm9wZXJ0eU5hbWUgPSBwcm9wZXJ0eU5hbWU7XG4gIH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlUXVlcnlNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlUXVlcnlNZXRhZGF0YSh7XG4gICAgICBzZWxlY3RvcnM6IF9hcnJheUZyb21Kc29uKGRhdGFbJ3NlbGVjdG9ycyddLCBDb21waWxlVG9rZW5NZXRhZGF0YS5mcm9tSnNvbiksXG4gICAgICBkZXNjZW5kYW50czogZGF0YVsnZGVzY2VuZGFudHMnXSxcbiAgICAgIGZpcnN0OiBkYXRhWydmaXJzdCddLFxuICAgICAgcHJvcGVydHlOYW1lOiBkYXRhWydwcm9wZXJ0eU5hbWUnXVxuICAgIH0pO1xuICB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4ge1xuICAgICAgJ3NlbGVjdG9ycyc6IF9hcnJheVRvSnNvbih0aGlzLnNlbGVjdG9ycyksXG4gICAgICAnZGVzY2VuZGFudHMnOiB0aGlzLmRlc2NlbmRhbnRzLFxuICAgICAgJ2ZpcnN0JzogdGhpcy5maXJzdCxcbiAgICAgICdwcm9wZXJ0eU5hbWUnOiB0aGlzLnByb3BlcnR5TmFtZVxuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZWdhcmRpbmcgY29tcGlsYXRpb24gb2YgYSB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhIHtcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb247XG4gIHRlbXBsYXRlOiBzdHJpbmc7XG4gIHRlbXBsYXRlVXJsOiBzdHJpbmc7XG4gIHN0eWxlczogc3RyaW5nW107XG4gIHN0eWxlVXJsczogc3RyaW5nW107XG4gIG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW107XG4gIGNvbnN0cnVjdG9yKHtlbmNhcHN1bGF0aW9uLCB0ZW1wbGF0ZSwgdGVtcGxhdGVVcmwsIHN0eWxlcywgc3R5bGVVcmxzLCBuZ0NvbnRlbnRTZWxlY3RvcnN9OiB7XG4gICAgZW5jYXBzdWxhdGlvbj86IFZpZXdFbmNhcHN1bGF0aW9uLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHN0eWxlcz86IHN0cmluZ1tdLFxuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdLFxuICAgIG5nQ29udGVudFNlbGVjdG9ycz86IHN0cmluZ1tdXG4gIH0gPSB7fSkge1xuICAgIHRoaXMuZW5jYXBzdWxhdGlvbiA9IGlzUHJlc2VudChlbmNhcHN1bGF0aW9uKSA/IGVuY2Fwc3VsYXRpb24gOiBWaWV3RW5jYXBzdWxhdGlvbi5FbXVsYXRlZDtcbiAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgdGhpcy50ZW1wbGF0ZVVybCA9IHRlbXBsYXRlVXJsO1xuICAgIHRoaXMuc3R5bGVzID0gaXNQcmVzZW50KHN0eWxlcykgPyBzdHlsZXMgOiBbXTtcbiAgICB0aGlzLnN0eWxlVXJscyA9IGlzUHJlc2VudChzdHlsZVVybHMpID8gc3R5bGVVcmxzIDogW107XG4gICAgdGhpcy5uZ0NvbnRlbnRTZWxlY3RvcnMgPSBpc1ByZXNlbnQobmdDb250ZW50U2VsZWN0b3JzKSA/IG5nQ29udGVudFNlbGVjdG9ycyA6IFtdO1xuICB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEoe1xuICAgICAgZW5jYXBzdWxhdGlvbjogaXNQcmVzZW50KGRhdGFbJ2VuY2Fwc3VsYXRpb24nXSkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgIFZJRVdfRU5DQVBTVUxBVElPTl9WQUxVRVNbZGF0YVsnZW5jYXBzdWxhdGlvbiddXSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVsnZW5jYXBzdWxhdGlvbiddLFxuICAgICAgdGVtcGxhdGU6IGRhdGFbJ3RlbXBsYXRlJ10sXG4gICAgICB0ZW1wbGF0ZVVybDogZGF0YVsndGVtcGxhdGVVcmwnXSxcbiAgICAgIHN0eWxlczogZGF0YVsnc3R5bGVzJ10sXG4gICAgICBzdHlsZVVybHM6IGRhdGFbJ3N0eWxlVXJscyddLFxuICAgICAgbmdDb250ZW50U2VsZWN0b3JzOiBkYXRhWyduZ0NvbnRlbnRTZWxlY3RvcnMnXVxuICAgIH0pO1xuICB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4ge1xuICAgICAgJ2VuY2Fwc3VsYXRpb24nOlxuICAgICAgICAgIGlzUHJlc2VudCh0aGlzLmVuY2Fwc3VsYXRpb24pID8gc2VyaWFsaXplRW51bSh0aGlzLmVuY2Fwc3VsYXRpb24pIDogdGhpcy5lbmNhcHN1bGF0aW9uLFxuICAgICAgJ3RlbXBsYXRlJzogdGhpcy50ZW1wbGF0ZSxcbiAgICAgICd0ZW1wbGF0ZVVybCc6IHRoaXMudGVtcGxhdGVVcmwsXG4gICAgICAnc3R5bGVzJzogdGhpcy5zdHlsZXMsXG4gICAgICAnc3R5bGVVcmxzJzogdGhpcy5zdHlsZVVybHMsXG4gICAgICAnbmdDb250ZW50U2VsZWN0b3JzJzogdGhpcy5uZ0NvbnRlbnRTZWxlY3RvcnNcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVnYXJkaW5nIGNvbXBpbGF0aW9uIG9mIGEgZGlyZWN0aXZlLlxuICovXG5leHBvcnQgY2xhc3MgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhIGltcGxlbWVudHMgQ29tcGlsZU1ldGFkYXRhV2l0aFR5cGUge1xuICBzdGF0aWMgY3JlYXRlKHt0eXBlLCBpc0NvbXBvbmVudCwgc2VsZWN0b3IsIGV4cG9ydEFzLCBjaGFuZ2VEZXRlY3Rpb24sIGlucHV0cywgb3V0cHV0cywgaG9zdCxcbiAgICAgICAgICAgICAgICAgbGlmZWN5Y2xlSG9va3MsIHByb3ZpZGVycywgdmlld1Byb3ZpZGVycywgcXVlcmllcywgdmlld1F1ZXJpZXMsIHRlbXBsYXRlfToge1xuICAgIHR5cGU/OiBDb21waWxlVHlwZU1ldGFkYXRhLFxuICAgIGlzQ29tcG9uZW50PzogYm9vbGVhbixcbiAgICBzZWxlY3Rvcj86IHN0cmluZyxcbiAgICBleHBvcnRBcz86IHN0cmluZyxcbiAgICBjaGFuZ2VEZXRlY3Rpb24/OiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgICBpbnB1dHM/OiBzdHJpbmdbXSxcbiAgICBvdXRwdXRzPzogc3RyaW5nW10sXG4gICAgaG9zdD86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIGxpZmVjeWNsZUhvb2tzPzogTGlmZWN5Y2xlSG9va3NbXSxcbiAgICBwcm92aWRlcnM/OlxuICAgICAgICBBcnJheTxDb21waWxlUHJvdmlkZXJNZXRhZGF0YSB8IENvbXBpbGVUeXBlTWV0YWRhdGEgfCBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHwgYW55W10+LFxuICAgIHZpZXdQcm92aWRlcnM/OlxuICAgICAgICBBcnJheTxDb21waWxlUHJvdmlkZXJNZXRhZGF0YSB8IENvbXBpbGVUeXBlTWV0YWRhdGEgfCBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHwgYW55W10+LFxuICAgIHF1ZXJpZXM/OiBDb21waWxlUXVlcnlNZXRhZGF0YVtdLFxuICAgIHZpZXdRdWVyaWVzPzogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSxcbiAgICB0ZW1wbGF0ZT86IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhXG4gIH0gPSB7fSk6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSB7XG4gICAgdmFyIGhvc3RMaXN0ZW5lcnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgdmFyIGhvc3RQcm9wZXJ0aWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIHZhciBob3N0QXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICBpZiAoaXNQcmVzZW50KGhvc3QpKSB7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goaG9zdCwgKHZhbHVlOiBzdHJpbmcsIGtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgIHZhciBtYXRjaGVzID0gUmVnRXhwV3JhcHBlci5maXJzdE1hdGNoKEhPU1RfUkVHX0VYUCwga2V5KTtcbiAgICAgICAgaWYgKGlzQmxhbmsobWF0Y2hlcykpIHtcbiAgICAgICAgICBob3N0QXR0cmlidXRlc1trZXldID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KG1hdGNoZXNbMV0pKSB7XG4gICAgICAgICAgaG9zdFByb3BlcnRpZXNbbWF0Y2hlc1sxXV0gPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQobWF0Y2hlc1syXSkpIHtcbiAgICAgICAgICBob3N0TGlzdGVuZXJzW21hdGNoZXNbMl1dID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICB2YXIgaW5wdXRzTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGlmIChpc1ByZXNlbnQoaW5wdXRzKSkge1xuICAgICAgaW5wdXRzLmZvckVhY2goKGJpbmRDb25maWc6IHN0cmluZykgPT4ge1xuICAgICAgICAvLyBjYW5vbmljYWwgc3ludGF4OiBgZGlyUHJvcDogZWxQcm9wYFxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBubyBgOmAsIHVzZSBkaXJQcm9wID0gZWxQcm9wXG4gICAgICAgIHZhciBwYXJ0cyA9IHNwbGl0QXRDb2xvbihiaW5kQ29uZmlnLCBbYmluZENvbmZpZywgYmluZENvbmZpZ10pO1xuICAgICAgICBpbnB1dHNNYXBbcGFydHNbMF1dID0gcGFydHNbMV07XG4gICAgICB9KTtcbiAgICB9XG4gICAgdmFyIG91dHB1dHNNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgaWYgKGlzUHJlc2VudChvdXRwdXRzKSkge1xuICAgICAgb3V0cHV0cy5mb3JFYWNoKChiaW5kQ29uZmlnOiBzdHJpbmcpID0+IHtcbiAgICAgICAgLy8gY2Fub25pY2FsIHN5bnRheDogYGRpclByb3A6IGVsUHJvcGBcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgbm8gYDpgLCB1c2UgZGlyUHJvcCA9IGVsUHJvcFxuICAgICAgICB2YXIgcGFydHMgPSBzcGxpdEF0Q29sb24oYmluZENvbmZpZywgW2JpbmRDb25maWcsIGJpbmRDb25maWddKTtcbiAgICAgICAgb3V0cHV0c01hcFtwYXJ0c1swXV0gPSBwYXJ0c1sxXTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhKHtcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICBpc0NvbXBvbmVudDogbm9ybWFsaXplQm9vbChpc0NvbXBvbmVudCksXG4gICAgICBzZWxlY3Rvcjogc2VsZWN0b3IsXG4gICAgICBleHBvcnRBczogZXhwb3J0QXMsXG4gICAgICBjaGFuZ2VEZXRlY3Rpb246IGNoYW5nZURldGVjdGlvbixcbiAgICAgIGlucHV0czogaW5wdXRzTWFwLFxuICAgICAgb3V0cHV0czogb3V0cHV0c01hcCxcbiAgICAgIGhvc3RMaXN0ZW5lcnM6IGhvc3RMaXN0ZW5lcnMsXG4gICAgICBob3N0UHJvcGVydGllczogaG9zdFByb3BlcnRpZXMsXG4gICAgICBob3N0QXR0cmlidXRlczogaG9zdEF0dHJpYnV0ZXMsXG4gICAgICBsaWZlY3ljbGVIb29rczogaXNQcmVzZW50KGxpZmVjeWNsZUhvb2tzKSA/IGxpZmVjeWNsZUhvb2tzIDogW10sXG4gICAgICBwcm92aWRlcnM6IHByb3ZpZGVycyxcbiAgICAgIHZpZXdQcm92aWRlcnM6IHZpZXdQcm92aWRlcnMsXG4gICAgICBxdWVyaWVzOiBxdWVyaWVzLFxuICAgICAgdmlld1F1ZXJpZXM6IHZpZXdRdWVyaWVzLFxuICAgICAgdGVtcGxhdGU6IHRlbXBsYXRlXG4gICAgfSk7XG4gIH1cbiAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YTtcbiAgaXNDb21wb25lbnQ6IGJvb2xlYW47XG4gIHNlbGVjdG9yOiBzdHJpbmc7XG4gIGV4cG9ydEFzOiBzdHJpbmc7XG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3k7XG4gIGlucHV0czoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIG91dHB1dHM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBob3N0TGlzdGVuZXJzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgaG9zdFByb3BlcnRpZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBob3N0QXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGxpZmVjeWNsZUhvb2tzOiBMaWZlY3ljbGVIb29rc1tdO1xuICBwcm92aWRlcnM6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhW107XG4gIHZpZXdQcm92aWRlcnM6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhW107XG4gIHF1ZXJpZXM6IENvbXBpbGVRdWVyeU1ldGFkYXRhW107XG4gIHZpZXdRdWVyaWVzOiBDb21waWxlUXVlcnlNZXRhZGF0YVtdO1xuXG4gIHRlbXBsYXRlOiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YTtcbiAgY29uc3RydWN0b3Ioe3R5cGUsIGlzQ29tcG9uZW50LCBzZWxlY3RvciwgZXhwb3J0QXMsIGNoYW5nZURldGVjdGlvbiwgaW5wdXRzLCBvdXRwdXRzLFxuICAgICAgICAgICAgICAgaG9zdExpc3RlbmVycywgaG9zdFByb3BlcnRpZXMsIGhvc3RBdHRyaWJ1dGVzLCBsaWZlY3ljbGVIb29rcywgcHJvdmlkZXJzLFxuICAgICAgICAgICAgICAgdmlld1Byb3ZpZGVycywgcXVlcmllcywgdmlld1F1ZXJpZXMsIHRlbXBsYXRlfToge1xuICAgIHR5cGU/OiBDb21waWxlVHlwZU1ldGFkYXRhLFxuICAgIGlzQ29tcG9uZW50PzogYm9vbGVhbixcbiAgICBzZWxlY3Rvcj86IHN0cmluZyxcbiAgICBleHBvcnRBcz86IHN0cmluZyxcbiAgICBjaGFuZ2VEZXRlY3Rpb24/OiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgICBpbnB1dHM/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBvdXRwdXRzPzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgaG9zdExpc3RlbmVycz86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIGhvc3RQcm9wZXJ0aWVzPzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgaG9zdEF0dHJpYnV0ZXM/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBsaWZlY3ljbGVIb29rcz86IExpZmVjeWNsZUhvb2tzW10sXG4gICAgcHJvdmlkZXJzPzpcbiAgICAgICAgQXJyYXk8Q29tcGlsZVByb3ZpZGVyTWV0YWRhdGEgfCBDb21waWxlVHlwZU1ldGFkYXRhIHwgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB8IGFueVtdPixcbiAgICB2aWV3UHJvdmlkZXJzPzpcbiAgICAgICAgQXJyYXk8Q29tcGlsZVByb3ZpZGVyTWV0YWRhdGEgfCBDb21waWxlVHlwZU1ldGFkYXRhIHwgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB8IGFueVtdPixcbiAgICBxdWVyaWVzPzogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSxcbiAgICB2aWV3UXVlcmllcz86IENvbXBpbGVRdWVyeU1ldGFkYXRhW10sXG4gICAgdGVtcGxhdGU/OiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YVxuICB9ID0ge30pIHtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMuaXNDb21wb25lbnQgPSBpc0NvbXBvbmVudDtcbiAgICB0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgdGhpcy5leHBvcnRBcyA9IGV4cG9ydEFzO1xuICAgIHRoaXMuY2hhbmdlRGV0ZWN0aW9uID0gY2hhbmdlRGV0ZWN0aW9uO1xuICAgIHRoaXMuaW5wdXRzID0gaW5wdXRzO1xuICAgIHRoaXMub3V0cHV0cyA9IG91dHB1dHM7XG4gICAgdGhpcy5ob3N0TGlzdGVuZXJzID0gaG9zdExpc3RlbmVycztcbiAgICB0aGlzLmhvc3RQcm9wZXJ0aWVzID0gaG9zdFByb3BlcnRpZXM7XG4gICAgdGhpcy5ob3N0QXR0cmlidXRlcyA9IGhvc3RBdHRyaWJ1dGVzO1xuICAgIHRoaXMubGlmZWN5Y2xlSG9va3MgPSBfbm9ybWFsaXplQXJyYXkobGlmZWN5Y2xlSG9va3MpO1xuICAgIHRoaXMucHJvdmlkZXJzID0gX25vcm1hbGl6ZUFycmF5KHByb3ZpZGVycyk7XG4gICAgdGhpcy52aWV3UHJvdmlkZXJzID0gX25vcm1hbGl6ZUFycmF5KHZpZXdQcm92aWRlcnMpO1xuICAgIHRoaXMucXVlcmllcyA9IF9ub3JtYWxpemVBcnJheShxdWVyaWVzKTtcbiAgICB0aGlzLnZpZXdRdWVyaWVzID0gX25vcm1hbGl6ZUFycmF5KHZpZXdRdWVyaWVzKTtcbiAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gIH1cblxuICBnZXQgaWRlbnRpZmllcigpOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHsgcmV0dXJuIHRoaXMudHlwZTsgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEoe1xuICAgICAgaXNDb21wb25lbnQ6IGRhdGFbJ2lzQ29tcG9uZW50J10sXG4gICAgICBzZWxlY3RvcjogZGF0YVsnc2VsZWN0b3InXSxcbiAgICAgIGV4cG9ydEFzOiBkYXRhWydleHBvcnRBcyddLFxuICAgICAgdHlwZTogaXNQcmVzZW50KGRhdGFbJ3R5cGUnXSkgPyBDb21waWxlVHlwZU1ldGFkYXRhLmZyb21Kc29uKGRhdGFbJ3R5cGUnXSkgOiBkYXRhWyd0eXBlJ10sXG4gICAgICBjaGFuZ2VEZXRlY3Rpb246IGlzUHJlc2VudChkYXRhWydjaGFuZ2VEZXRlY3Rpb24nXSkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgQ0hBTkdFX0RFVEVDVElPTl9TVFJBVEVHWV9WQUxVRVNbZGF0YVsnY2hhbmdlRGV0ZWN0aW9uJ11dIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbJ2NoYW5nZURldGVjdGlvbiddLFxuICAgICAgaW5wdXRzOiBkYXRhWydpbnB1dHMnXSxcbiAgICAgIG91dHB1dHM6IGRhdGFbJ291dHB1dHMnXSxcbiAgICAgIGhvc3RMaXN0ZW5lcnM6IGRhdGFbJ2hvc3RMaXN0ZW5lcnMnXSxcbiAgICAgIGhvc3RQcm9wZXJ0aWVzOiBkYXRhWydob3N0UHJvcGVydGllcyddLFxuICAgICAgaG9zdEF0dHJpYnV0ZXM6IGRhdGFbJ2hvc3RBdHRyaWJ1dGVzJ10sXG4gICAgICBsaWZlY3ljbGVIb29rczpcbiAgICAgICAgICAoPGFueVtdPmRhdGFbJ2xpZmVjeWNsZUhvb2tzJ10pLm1hcChob29rVmFsdWUgPT4gTElGRUNZQ0xFX0hPT0tTX1ZBTFVFU1tob29rVmFsdWVdKSxcbiAgICAgIHRlbXBsYXRlOiBpc1ByZXNlbnQoZGF0YVsndGVtcGxhdGUnXSkgPyBDb21waWxlVGVtcGxhdGVNZXRhZGF0YS5mcm9tSnNvbihkYXRhWyd0ZW1wbGF0ZSddKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVsndGVtcGxhdGUnXSxcbiAgICAgIHByb3ZpZGVyczogX2FycmF5RnJvbUpzb24oZGF0YVsncHJvdmlkZXJzJ10sIG1ldGFkYXRhRnJvbUpzb24pLFxuICAgICAgdmlld1Byb3ZpZGVyczogX2FycmF5RnJvbUpzb24oZGF0YVsndmlld1Byb3ZpZGVycyddLCBtZXRhZGF0YUZyb21Kc29uKSxcbiAgICAgIHF1ZXJpZXM6IF9hcnJheUZyb21Kc29uKGRhdGFbJ3F1ZXJpZXMnXSwgQ29tcGlsZVF1ZXJ5TWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgdmlld1F1ZXJpZXM6IF9hcnJheUZyb21Kc29uKGRhdGFbJ3ZpZXdRdWVyaWVzJ10sIENvbXBpbGVRdWVyeU1ldGFkYXRhLmZyb21Kc29uKVxuICAgIH0pO1xuICB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4ge1xuICAgICAgJ2NsYXNzJzogJ0RpcmVjdGl2ZScsXG4gICAgICAnaXNDb21wb25lbnQnOiB0aGlzLmlzQ29tcG9uZW50LFxuICAgICAgJ3NlbGVjdG9yJzogdGhpcy5zZWxlY3RvcixcbiAgICAgICdleHBvcnRBcyc6IHRoaXMuZXhwb3J0QXMsXG4gICAgICAndHlwZSc6IGlzUHJlc2VudCh0aGlzLnR5cGUpID8gdGhpcy50eXBlLnRvSnNvbigpIDogdGhpcy50eXBlLFxuICAgICAgJ2NoYW5nZURldGVjdGlvbic6IGlzUHJlc2VudCh0aGlzLmNoYW5nZURldGVjdGlvbikgPyBzZXJpYWxpemVFbnVtKHRoaXMuY2hhbmdlRGV0ZWN0aW9uKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlRGV0ZWN0aW9uLFxuICAgICAgJ2lucHV0cyc6IHRoaXMuaW5wdXRzLFxuICAgICAgJ291dHB1dHMnOiB0aGlzLm91dHB1dHMsXG4gICAgICAnaG9zdExpc3RlbmVycyc6IHRoaXMuaG9zdExpc3RlbmVycyxcbiAgICAgICdob3N0UHJvcGVydGllcyc6IHRoaXMuaG9zdFByb3BlcnRpZXMsXG4gICAgICAnaG9zdEF0dHJpYnV0ZXMnOiB0aGlzLmhvc3RBdHRyaWJ1dGVzLFxuICAgICAgJ2xpZmVjeWNsZUhvb2tzJzogdGhpcy5saWZlY3ljbGVIb29rcy5tYXAoaG9vayA9PiBzZXJpYWxpemVFbnVtKGhvb2spKSxcbiAgICAgICd0ZW1wbGF0ZSc6IGlzUHJlc2VudCh0aGlzLnRlbXBsYXRlKSA/IHRoaXMudGVtcGxhdGUudG9Kc29uKCkgOiB0aGlzLnRlbXBsYXRlLFxuICAgICAgJ3Byb3ZpZGVycyc6IF9hcnJheVRvSnNvbih0aGlzLnByb3ZpZGVycyksXG4gICAgICAndmlld1Byb3ZpZGVycyc6IF9hcnJheVRvSnNvbih0aGlzLnZpZXdQcm92aWRlcnMpLFxuICAgICAgJ3F1ZXJpZXMnOiBfYXJyYXlUb0pzb24odGhpcy5xdWVyaWVzKSxcbiAgICAgICd2aWV3UXVlcmllcyc6IF9hcnJheVRvSnNvbih0aGlzLnZpZXdRdWVyaWVzKVxuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3Qge0BsaW5rIENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YX0gZnJvbSB7QGxpbmsgQ29tcG9uZW50VHlwZU1ldGFkYXRhfSBhbmQgYSBzZWxlY3Rvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUhvc3RDb21wb25lbnRNZXRhKGNvbXBvbmVudFR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50U2VsZWN0b3I6IHN0cmluZyk6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSB7XG4gIHZhciB0ZW1wbGF0ZSA9IENzc1NlbGVjdG9yLnBhcnNlKGNvbXBvbmVudFNlbGVjdG9yKVswXS5nZXRNYXRjaGluZ0VsZW1lbnRUZW1wbGF0ZSgpO1xuICByZXR1cm4gQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLmNyZWF0ZSh7XG4gICAgdHlwZTogbmV3IENvbXBpbGVUeXBlTWV0YWRhdGEoe1xuICAgICAgcnVudGltZTogT2JqZWN0LFxuICAgICAgbmFtZTogYCR7Y29tcG9uZW50VHlwZS5uYW1lfV9Ib3N0YCxcbiAgICAgIG1vZHVsZVVybDogY29tcG9uZW50VHlwZS5tb2R1bGVVcmwsXG4gICAgICBpc0hvc3Q6IHRydWVcbiAgICB9KSxcbiAgICB0ZW1wbGF0ZTogbmV3IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhKFxuICAgICAgICB7dGVtcGxhdGU6IHRlbXBsYXRlLCB0ZW1wbGF0ZVVybDogJycsIHN0eWxlczogW10sIHN0eWxlVXJsczogW10sIG5nQ29udGVudFNlbGVjdG9yczogW119KSxcbiAgICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQsXG4gICAgaW5wdXRzOiBbXSxcbiAgICBvdXRwdXRzOiBbXSxcbiAgICBob3N0OiB7fSxcbiAgICBsaWZlY3ljbGVIb29rczogW10sXG4gICAgaXNDb21wb25lbnQ6IHRydWUsXG4gICAgc2VsZWN0b3I6ICcqJyxcbiAgICBwcm92aWRlcnM6IFtdLFxuICAgIHZpZXdQcm92aWRlcnM6IFtdLFxuICAgIHF1ZXJpZXM6IFtdLFxuICAgIHZpZXdRdWVyaWVzOiBbXVxuICB9KTtcbn1cblxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZVBpcGVNZXRhZGF0YSBpbXBsZW1lbnRzIENvbXBpbGVNZXRhZGF0YVdpdGhUeXBlIHtcbiAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YTtcbiAgbmFtZTogc3RyaW5nO1xuICBwdXJlOiBib29sZWFuO1xuICBsaWZlY3ljbGVIb29rczogTGlmZWN5Y2xlSG9va3NbXTtcblxuICBjb25zdHJ1Y3Rvcih7dHlwZSwgbmFtZSwgcHVyZSwgbGlmZWN5Y2xlSG9va3N9OiB7XG4gICAgdHlwZT86IENvbXBpbGVUeXBlTWV0YWRhdGEsXG4gICAgbmFtZT86IHN0cmluZyxcbiAgICBwdXJlPzogYm9vbGVhbixcbiAgICBsaWZlY3ljbGVIb29rcz86IExpZmVjeWNsZUhvb2tzW11cbiAgfSA9IHt9KSB7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMucHVyZSA9IG5vcm1hbGl6ZUJvb2wocHVyZSk7XG4gICAgdGhpcy5saWZlY3ljbGVIb29rcyA9IF9ub3JtYWxpemVBcnJheShsaWZlY3ljbGVIb29rcyk7XG4gIH1cbiAgZ2V0IGlkZW50aWZpZXIoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiB0aGlzLnR5cGU7IH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlUGlwZU1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVQaXBlTWV0YWRhdGEoe1xuICAgICAgdHlwZTogaXNQcmVzZW50KGRhdGFbJ3R5cGUnXSkgPyBDb21waWxlVHlwZU1ldGFkYXRhLmZyb21Kc29uKGRhdGFbJ3R5cGUnXSkgOiBkYXRhWyd0eXBlJ10sXG4gICAgICBuYW1lOiBkYXRhWyduYW1lJ10sXG4gICAgICBwdXJlOiBkYXRhWydwdXJlJ11cbiAgICB9KTtcbiAgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICdjbGFzcyc6ICdQaXBlJyxcbiAgICAgICd0eXBlJzogaXNQcmVzZW50KHRoaXMudHlwZSkgPyB0aGlzLnR5cGUudG9Kc29uKCkgOiBudWxsLFxuICAgICAgJ25hbWUnOiB0aGlzLm5hbWUsXG4gICAgICAncHVyZSc6IHRoaXMucHVyZVxuICAgIH07XG4gIH1cbn1cblxudmFyIF9DT01QSUxFX01FVEFEQVRBX0ZST01fSlNPTiA9IHtcbiAgJ0RpcmVjdGl2ZSc6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YS5mcm9tSnNvbixcbiAgJ1BpcGUnOiBDb21waWxlUGlwZU1ldGFkYXRhLmZyb21Kc29uLFxuICAnVHlwZSc6IENvbXBpbGVUeXBlTWV0YWRhdGEuZnJvbUpzb24sXG4gICdQcm92aWRlcic6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhLmZyb21Kc29uLFxuICAnSWRlbnRpZmllcic6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEuZnJvbUpzb24sXG4gICdGYWN0b3J5JzogQ29tcGlsZUZhY3RvcnlNZXRhZGF0YS5mcm9tSnNvblxufTtcblxuZnVuY3Rpb24gX2FycmF5RnJvbUpzb24ob2JqOiBhbnlbXSwgZm46IChhOiB7W2tleTogc3RyaW5nXTogYW55fSkgPT4gYW55KTogYW55IHtcbiAgcmV0dXJuIGlzQmxhbmsob2JqKSA/IG51bGwgOiBvYmoubWFwKG8gPT4gX29iakZyb21Kc29uKG8sIGZuKSk7XG59XG5cbmZ1bmN0aW9uIF9hcnJheVRvSnNvbihvYmo6IGFueVtdKTogc3RyaW5nIHwge1trZXk6IHN0cmluZ106IGFueX0ge1xuICByZXR1cm4gaXNCbGFuayhvYmopID8gbnVsbCA6IG9iai5tYXAoX29ialRvSnNvbik7XG59XG5cbmZ1bmN0aW9uIF9vYmpGcm9tSnNvbihvYmo6IGFueSwgZm46IChhOiB7W2tleTogc3RyaW5nXTogYW55fSkgPT4gYW55KTogYW55IHtcbiAgaWYgKGlzQXJyYXkob2JqKSkgcmV0dXJuIF9hcnJheUZyb21Kc29uKG9iaiwgZm4pO1xuICBpZiAoaXNTdHJpbmcob2JqKSB8fCBpc0JsYW5rKG9iaikgfHwgaXNCb29sZWFuKG9iaikgfHwgaXNOdW1iZXIob2JqKSkgcmV0dXJuIG9iajtcbiAgcmV0dXJuIGZuKG9iaik7XG59XG5cbmZ1bmN0aW9uIF9vYmpUb0pzb24ob2JqOiBhbnkpOiBzdHJpbmcgfCB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gIGlmIChpc0FycmF5KG9iaikpIHJldHVybiBfYXJyYXlUb0pzb24ob2JqKTtcbiAgaWYgKGlzU3RyaW5nKG9iaikgfHwgaXNCbGFuayhvYmopIHx8IGlzQm9vbGVhbihvYmopIHx8IGlzTnVtYmVyKG9iaikpIHJldHVybiBvYmo7XG4gIHJldHVybiBvYmoudG9Kc29uKCk7XG59XG5cbmZ1bmN0aW9uIF9ub3JtYWxpemVBcnJheShvYmo6IGFueVtdKTogYW55W10ge1xuICByZXR1cm4gaXNQcmVzZW50KG9iaikgPyBvYmogOiBbXTtcbn1cbiJdfQ==