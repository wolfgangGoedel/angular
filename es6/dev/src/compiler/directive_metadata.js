import { isPresent, isBlank, isNumber, isBoolean, normalizeBool, normalizeBlank, serializeEnum, isString, RegExpWrapper, isArray } from 'angular2/src/facade/lang';
import { unimplemented, BaseException } from 'angular2/src/facade/exceptions';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { ChangeDetectionStrategy, CHANGE_DETECTION_STRATEGY_VALUES } from 'angular2/src/core/change_detection/change_detection';
import { ViewEncapsulation, VIEW_ENCAPSULATION_VALUES } from 'angular2/src/core/metadata/view';
import { CssSelector } from 'angular2/src/compiler/selector';
import { splitAtColon } from './util';
import { LIFECYCLE_HOOKS_VALUES } from 'angular2/src/core/linker/interfaces';
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
    get name() { return isPresent(this.value) ? this.value : this.identifier.name; }
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
    constructor({ type, isComponent, dynamicLoadable, selector, exportAs, changeDetection, inputs, outputs, hostListeners, hostProperties, hostAttributes, lifecycleHooks, providers, viewProviders, queries, viewQueries, template } = {}) {
        this.type = type;
        this.isComponent = isComponent;
        this.dynamicLoadable = dynamicLoadable;
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
    static create({ type, isComponent, dynamicLoadable, selector, exportAs, changeDetection, inputs, outputs, host, lifecycleHooks, providers, viewProviders, queries, viewQueries, template } = {}) {
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
            dynamicLoadable: normalizeBool(dynamicLoadable),
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
            dynamicLoadable: data['dynamicLoadable'],
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
            'dynamicLoadable': this.dynamicLoadable,
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
        dynamicLoadable: false,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlX21ldGFkYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1FaVlLZTFNeS50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2RpcmVjdGl2ZV9tZXRhZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTyxFQUNMLFNBQVMsRUFDVCxPQUFPLEVBQ1AsUUFBUSxFQUNSLFNBQVMsRUFDVCxhQUFhLEVBQ2IsY0FBYyxFQUNkLGFBQWEsRUFFYixRQUFRLEVBQ1IsYUFBYSxFQUViLE9BQU8sRUFDUixNQUFNLDBCQUEwQjtPQUMxQixFQUFDLGFBQWEsRUFBRSxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDcEUsRUFBQyxnQkFBZ0IsRUFBeUIsTUFBTSxnQ0FBZ0M7T0FDaEYsRUFDTCx1QkFBdUIsRUFDdkIsZ0NBQWdDLEVBQ2pDLE1BQU0scURBQXFEO09BQ3JELEVBQUMsaUJBQWlCLEVBQUUseUJBQXlCLEVBQUMsTUFBTSxpQ0FBaUM7T0FDckYsRUFBQyxXQUFXLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDbkQsRUFBQyxZQUFZLEVBQUMsTUFBTSxRQUFRO09BQzVCLEVBQWlCLHNCQUFzQixFQUFDLE1BQU0scUNBQXFDO09BQ25GLEVBQUMsWUFBWSxFQUFDLE1BQU0sZ0JBQWdCO0FBRTNDLHdDQUF3QztBQUN4QyxrQ0FBa0M7QUFDbEMsSUFBSSxZQUFZLEdBQUcsMENBQTBDLENBQUM7QUFFOUQ7SUFHRSxJQUFJLFVBQVUsS0FBZ0MsTUFBTSxDQUE0QixhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDcEcsQ0FBQztBQUVELDZDQUFzRCw2QkFBNkI7SUFHakYsSUFBSSxJQUFJLEtBQTBCLE1BQU0sQ0FBc0IsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRWhGLElBQUksVUFBVSxLQUFnQyxNQUFNLENBQTRCLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNwRyxDQUFDO0FB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LENBQUMsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNuRCxDQUFDO0FBRUQsc0JBQXNCLEdBQVEsRUFBRSxFQUFvQztJQUNsRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNqRCxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2pGLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDakIsQ0FBQztBQUVELG9CQUFvQixHQUFRO0lBQzFCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0MsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNqRixNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3RCLENBQUM7QUFFRCx5QkFBeUIsR0FBVTtJQUNqQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDbkMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGlzUHJlc2VudCxcbiAgaXNCbGFuayxcbiAgaXNOdW1iZXIsXG4gIGlzQm9vbGVhbixcbiAgbm9ybWFsaXplQm9vbCxcbiAgbm9ybWFsaXplQmxhbmssXG4gIHNlcmlhbGl6ZUVudW0sXG4gIFR5cGUsXG4gIGlzU3RyaW5nLFxuICBSZWdFeHBXcmFwcGVyLFxuICBTdHJpbmdXcmFwcGVyLFxuICBpc0FycmF5XG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge3VuaW1wbGVtZW50ZWQsIEJhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXIsIE1hcFdyYXBwZXIsIFNldFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ0hBTkdFX0RFVEVDVElPTl9TVFJBVEVHWV9WQUxVRVNcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcbmltcG9ydCB7Vmlld0VuY2Fwc3VsYXRpb24sIFZJRVdfRU5DQVBTVUxBVElPTl9WQUxVRVN9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL3ZpZXcnO1xuaW1wb3J0IHtDc3NTZWxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NlbGVjdG9yJztcbmltcG9ydCB7c3BsaXRBdENvbG9ufSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtMaWZlY3ljbGVIb29rcywgTElGRUNZQ0xFX0hPT0tTX1ZBTFVFU30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtnZXRVcmxTY2hlbWV9IGZyb20gJy4vdXJsX3Jlc29sdmVyJztcblxuLy8gZ3JvdXAgMTogXCJwcm9wZXJ0eVwiIGZyb20gXCJbcHJvcGVydHldXCJcbi8vIGdyb3VwIDI6IFwiZXZlbnRcIiBmcm9tIFwiKGV2ZW50KVwiXG52YXIgSE9TVF9SRUdfRVhQID0gL14oPzooPzpcXFsoW15cXF1dKylcXF0pfCg/OlxcKChbXlxcKV0rKVxcKSkpJC9nO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcGlsZU1ldGFkYXRhV2l0aElkZW50aWZpZXIge1xuICBhYnN0cmFjdCB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX07XG5cbiAgZ2V0IGlkZW50aWZpZXIoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiA8Q29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YT51bmltcGxlbWVudGVkKCk7IH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbXBpbGVNZXRhZGF0YVdpdGhUeXBlIGV4dGVuZHMgQ29tcGlsZU1ldGFkYXRhV2l0aElkZW50aWZpZXIge1xuICBhYnN0cmFjdCB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX07XG5cbiAgZ2V0IHR5cGUoKTogQ29tcGlsZVR5cGVNZXRhZGF0YSB7IHJldHVybiA8Q29tcGlsZVR5cGVNZXRhZGF0YT51bmltcGxlbWVudGVkKCk7IH1cblxuICBnZXQgaWRlbnRpZmllcigpOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHsgcmV0dXJuIDxDb21waWxlSWRlbnRpZmllck1ldGFkYXRhPnVuaW1wbGVtZW50ZWQoKTsgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWV0YWRhdGFGcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IGFueSB7XG4gIHJldHVybiBfQ09NUElMRV9NRVRBREFUQV9GUk9NX0pTT05bZGF0YVsnY2xhc3MnXV0oZGF0YSk7XG59XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIGltcGxlbWVudHMgQ29tcGlsZU1ldGFkYXRhV2l0aElkZW50aWZpZXIge1xuICBydW50aW1lOiBhbnk7XG4gIG5hbWU6IHN0cmluZztcbiAgcHJlZml4OiBzdHJpbmc7XG4gIG1vZHVsZVVybDogc3RyaW5nO1xuICB2YWx1ZTogYW55O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAge3J1bnRpbWUsIG5hbWUsIG1vZHVsZVVybCwgcHJlZml4LCB2YWx1ZX06XG4gICAgICAgICAge3J1bnRpbWU/OiBhbnksIG5hbWU/OiBzdHJpbmcsIG1vZHVsZVVybD86IHN0cmluZywgcHJlZml4Pzogc3RyaW5nLCB2YWx1ZT86IGFueX0gPSB7fSkge1xuICAgIHRoaXMucnVudGltZSA9IHJ1bnRpbWU7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnByZWZpeCA9IHByZWZpeDtcbiAgICB0aGlzLm1vZHVsZVVybCA9IG1vZHVsZVVybDtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHtcbiAgICBsZXQgdmFsdWUgPSBpc0FycmF5KGRhdGFbJ3ZhbHVlJ10pID8gX2FycmF5RnJvbUpzb24oZGF0YVsndmFsdWUnXSwgbWV0YWRhdGFGcm9tSnNvbikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfb2JqRnJvbUpzb24oZGF0YVsndmFsdWUnXSwgbWV0YWRhdGFGcm9tSnNvbik7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKFxuICAgICAgICB7bmFtZTogZGF0YVsnbmFtZSddLCBwcmVmaXg6IGRhdGFbJ3ByZWZpeCddLCBtb2R1bGVVcmw6IGRhdGFbJ21vZHVsZVVybCddLCB2YWx1ZTogdmFsdWV9KTtcbiAgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgbGV0IHZhbHVlID0gaXNBcnJheSh0aGlzLnZhbHVlKSA/IF9hcnJheVRvSnNvbih0aGlzLnZhbHVlKSA6IF9vYmpUb0pzb24odGhpcy52YWx1ZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIE5vdGU6IFJ1bnRpbWUgdHlwZSBjYW4ndCBiZSBzZXJpYWxpemVkLi4uXG4gICAgICAnY2xhc3MnOiAnSWRlbnRpZmllcicsXG4gICAgICAnbmFtZSc6IHRoaXMubmFtZSxcbiAgICAgICdtb2R1bGVVcmwnOiB0aGlzLm1vZHVsZVVybCxcbiAgICAgICdwcmVmaXgnOiB0aGlzLnByZWZpeCxcbiAgICAgICd2YWx1ZSc6IHZhbHVlXG4gICAgfTtcbiAgfVxuXG4gIGdldCBpZGVudGlmaWVyKCk6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgeyByZXR1cm4gdGhpczsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgaXNBdHRyaWJ1dGU6IGJvb2xlYW47XG4gIGlzU2VsZjogYm9vbGVhbjtcbiAgaXNIb3N0OiBib29sZWFuO1xuICBpc1NraXBTZWxmOiBib29sZWFuO1xuICBpc09wdGlvbmFsOiBib29sZWFuO1xuICBpc1ZhbHVlOiBib29sZWFuO1xuICBxdWVyeTogQ29tcGlsZVF1ZXJ5TWV0YWRhdGE7XG4gIHZpZXdRdWVyeTogQ29tcGlsZVF1ZXJ5TWV0YWRhdGE7XG4gIHRva2VuOiBDb21waWxlVG9rZW5NZXRhZGF0YTtcbiAgdmFsdWU6IGFueTtcblxuICBjb25zdHJ1Y3Rvcih7aXNBdHRyaWJ1dGUsIGlzU2VsZiwgaXNIb3N0LCBpc1NraXBTZWxmLCBpc09wdGlvbmFsLCBpc1ZhbHVlLCBxdWVyeSwgdmlld1F1ZXJ5LFxuICAgICAgICAgICAgICAgdG9rZW4sIHZhbHVlfToge1xuICAgIGlzQXR0cmlidXRlPzogYm9vbGVhbixcbiAgICBpc1NlbGY/OiBib29sZWFuLFxuICAgIGlzSG9zdD86IGJvb2xlYW4sXG4gICAgaXNTa2lwU2VsZj86IGJvb2xlYW4sXG4gICAgaXNPcHRpb25hbD86IGJvb2xlYW4sXG4gICAgaXNWYWx1ZT86IGJvb2xlYW4sXG4gICAgcXVlcnk/OiBDb21waWxlUXVlcnlNZXRhZGF0YSxcbiAgICB2aWV3UXVlcnk/OiBDb21waWxlUXVlcnlNZXRhZGF0YSxcbiAgICB0b2tlbj86IENvbXBpbGVUb2tlbk1ldGFkYXRhLFxuICAgIHZhbHVlPzogYW55XG4gIH0gPSB7fSkge1xuICAgIHRoaXMuaXNBdHRyaWJ1dGUgPSBub3JtYWxpemVCb29sKGlzQXR0cmlidXRlKTtcbiAgICB0aGlzLmlzU2VsZiA9IG5vcm1hbGl6ZUJvb2woaXNTZWxmKTtcbiAgICB0aGlzLmlzSG9zdCA9IG5vcm1hbGl6ZUJvb2woaXNIb3N0KTtcbiAgICB0aGlzLmlzU2tpcFNlbGYgPSBub3JtYWxpemVCb29sKGlzU2tpcFNlbGYpO1xuICAgIHRoaXMuaXNPcHRpb25hbCA9IG5vcm1hbGl6ZUJvb2woaXNPcHRpb25hbCk7XG4gICAgdGhpcy5pc1ZhbHVlID0gbm9ybWFsaXplQm9vbChpc1ZhbHVlKTtcbiAgICB0aGlzLnF1ZXJ5ID0gcXVlcnk7XG4gICAgdGhpcy52aWV3UXVlcnkgPSB2aWV3UXVlcnk7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEoe1xuICAgICAgdG9rZW46IF9vYmpGcm9tSnNvbihkYXRhWyd0b2tlbiddLCBDb21waWxlVG9rZW5NZXRhZGF0YS5mcm9tSnNvbiksXG4gICAgICBxdWVyeTogX29iakZyb21Kc29uKGRhdGFbJ3F1ZXJ5J10sIENvbXBpbGVRdWVyeU1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIHZpZXdRdWVyeTogX29iakZyb21Kc29uKGRhdGFbJ3ZpZXdRdWVyeSddLCBDb21waWxlUXVlcnlNZXRhZGF0YS5mcm9tSnNvbiksXG4gICAgICB2YWx1ZTogZGF0YVsndmFsdWUnXSxcbiAgICAgIGlzQXR0cmlidXRlOiBkYXRhWydpc0F0dHJpYnV0ZSddLFxuICAgICAgaXNTZWxmOiBkYXRhWydpc1NlbGYnXSxcbiAgICAgIGlzSG9zdDogZGF0YVsnaXNIb3N0J10sXG4gICAgICBpc1NraXBTZWxmOiBkYXRhWydpc1NraXBTZWxmJ10sXG4gICAgICBpc09wdGlvbmFsOiBkYXRhWydpc09wdGlvbmFsJ10sXG4gICAgICBpc1ZhbHVlOiBkYXRhWydpc1ZhbHVlJ11cbiAgICB9KTtcbiAgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICd0b2tlbic6IF9vYmpUb0pzb24odGhpcy50b2tlbiksXG4gICAgICAncXVlcnknOiBfb2JqVG9Kc29uKHRoaXMucXVlcnkpLFxuICAgICAgJ3ZpZXdRdWVyeSc6IF9vYmpUb0pzb24odGhpcy52aWV3UXVlcnkpLFxuICAgICAgJ3ZhbHVlJzogdGhpcy52YWx1ZSxcbiAgICAgICdpc0F0dHJpYnV0ZSc6IHRoaXMuaXNBdHRyaWJ1dGUsXG4gICAgICAnaXNTZWxmJzogdGhpcy5pc1NlbGYsXG4gICAgICAnaXNIb3N0JzogdGhpcy5pc0hvc3QsXG4gICAgICAnaXNTa2lwU2VsZic6IHRoaXMuaXNTa2lwU2VsZixcbiAgICAgICdpc09wdGlvbmFsJzogdGhpcy5pc09wdGlvbmFsLFxuICAgICAgJ2lzVmFsdWUnOiB0aGlzLmlzVmFsdWVcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlUHJvdmlkZXJNZXRhZGF0YSB7XG4gIHRva2VuOiBDb21waWxlVG9rZW5NZXRhZGF0YTtcbiAgdXNlQ2xhc3M6IENvbXBpbGVUeXBlTWV0YWRhdGE7XG4gIHVzZVZhbHVlOiBhbnk7XG4gIHVzZUV4aXN0aW5nOiBDb21waWxlVG9rZW5NZXRhZGF0YTtcbiAgdXNlRmFjdG9yeTogQ29tcGlsZUZhY3RvcnlNZXRhZGF0YTtcbiAgZGVwczogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW107XG4gIG11bHRpOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHt0b2tlbiwgdXNlQ2xhc3MsIHVzZVZhbHVlLCB1c2VFeGlzdGluZywgdXNlRmFjdG9yeSwgZGVwcywgbXVsdGl9OiB7XG4gICAgdG9rZW4/OiBDb21waWxlVG9rZW5NZXRhZGF0YSxcbiAgICB1c2VDbGFzcz86IENvbXBpbGVUeXBlTWV0YWRhdGEsXG4gICAgdXNlVmFsdWU/OiBhbnksXG4gICAgdXNlRXhpc3Rpbmc/OiBDb21waWxlVG9rZW5NZXRhZGF0YSxcbiAgICB1c2VGYWN0b3J5PzogQ29tcGlsZUZhY3RvcnlNZXRhZGF0YSxcbiAgICBkZXBzPzogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW10sXG4gICAgbXVsdGk/OiBib29sZWFuXG4gIH0pIHtcbiAgICB0aGlzLnRva2VuID0gdG9rZW47XG4gICAgdGhpcy51c2VDbGFzcyA9IHVzZUNsYXNzO1xuICAgIHRoaXMudXNlVmFsdWUgPSB1c2VWYWx1ZTtcbiAgICB0aGlzLnVzZUV4aXN0aW5nID0gdXNlRXhpc3Rpbmc7XG4gICAgdGhpcy51c2VGYWN0b3J5ID0gdXNlRmFjdG9yeTtcbiAgICB0aGlzLmRlcHMgPSBub3JtYWxpemVCbGFuayhkZXBzKTtcbiAgICB0aGlzLm11bHRpID0gbm9ybWFsaXplQm9vbChtdWx0aSk7XG4gIH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlUHJvdmlkZXJNZXRhZGF0YSh7XG4gICAgICB0b2tlbjogX29iakZyb21Kc29uKGRhdGFbJ3Rva2VuJ10sIENvbXBpbGVUb2tlbk1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIHVzZUNsYXNzOiBfb2JqRnJvbUpzb24oZGF0YVsndXNlQ2xhc3MnXSwgQ29tcGlsZVR5cGVNZXRhZGF0YS5mcm9tSnNvbiksXG4gICAgICB1c2VFeGlzdGluZzogX29iakZyb21Kc29uKGRhdGFbJ3VzZUV4aXN0aW5nJ10sIENvbXBpbGVUb2tlbk1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIHVzZVZhbHVlOiBfb2JqRnJvbUpzb24oZGF0YVsndXNlVmFsdWUnXSwgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YS5mcm9tSnNvbiksXG4gICAgICB1c2VGYWN0b3J5OiBfb2JqRnJvbUpzb24oZGF0YVsndXNlRmFjdG9yeSddLCBDb21waWxlRmFjdG9yeU1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIG11bHRpOiBkYXRhWydtdWx0aSddLFxuICAgICAgZGVwczogX2FycmF5RnJvbUpzb24oZGF0YVsnZGVwcyddLCBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEuZnJvbUpzb24pXG4gICAgfSk7XG4gIH1cblxuICB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBOb3RlOiBSdW50aW1lIHR5cGUgY2FuJ3QgYmUgc2VyaWFsaXplZC4uLlxuICAgICAgJ2NsYXNzJzogJ1Byb3ZpZGVyJyxcbiAgICAgICd0b2tlbic6IF9vYmpUb0pzb24odGhpcy50b2tlbiksXG4gICAgICAndXNlQ2xhc3MnOiBfb2JqVG9Kc29uKHRoaXMudXNlQ2xhc3MpLFxuICAgICAgJ3VzZUV4aXN0aW5nJzogX29ialRvSnNvbih0aGlzLnVzZUV4aXN0aW5nKSxcbiAgICAgICd1c2VWYWx1ZSc6IF9vYmpUb0pzb24odGhpcy51c2VWYWx1ZSksXG4gICAgICAndXNlRmFjdG9yeSc6IF9vYmpUb0pzb24odGhpcy51c2VGYWN0b3J5KSxcbiAgICAgICdtdWx0aSc6IHRoaXMubXVsdGksXG4gICAgICAnZGVwcyc6IF9hcnJheVRvSnNvbih0aGlzLmRlcHMpXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZUZhY3RvcnlNZXRhZGF0YSBpbXBsZW1lbnRzIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEsXG4gICAgQ29tcGlsZU1ldGFkYXRhV2l0aElkZW50aWZpZXIge1xuICBydW50aW1lOiBGdW5jdGlvbjtcbiAgbmFtZTogc3RyaW5nO1xuICBwcmVmaXg6IHN0cmluZztcbiAgbW9kdWxlVXJsOiBzdHJpbmc7XG4gIHZhbHVlOiBhbnk7XG4gIGRpRGVwczogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW107XG5cbiAgY29uc3RydWN0b3Ioe3J1bnRpbWUsIG5hbWUsIG1vZHVsZVVybCwgcHJlZml4LCBkaURlcHMsIHZhbHVlfToge1xuICAgIHJ1bnRpbWU/OiBGdW5jdGlvbixcbiAgICBuYW1lPzogc3RyaW5nLFxuICAgIHByZWZpeD86IHN0cmluZyxcbiAgICBtb2R1bGVVcmw/OiBzdHJpbmcsXG4gICAgdmFsdWU/OiBib29sZWFuLFxuICAgIGRpRGVwcz86IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YVtdXG4gIH0pIHtcbiAgICB0aGlzLnJ1bnRpbWUgPSBydW50aW1lO1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5wcmVmaXggPSBwcmVmaXg7XG4gICAgdGhpcy5tb2R1bGVVcmwgPSBtb2R1bGVVcmw7XG4gICAgdGhpcy5kaURlcHMgPSBfbm9ybWFsaXplQXJyYXkoZGlEZXBzKTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBnZXQgaWRlbnRpZmllcigpOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHsgcmV0dXJuIHRoaXM7IH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlRmFjdG9yeU1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVGYWN0b3J5TWV0YWRhdGEoe1xuICAgICAgbmFtZTogZGF0YVsnbmFtZSddLFxuICAgICAgcHJlZml4OiBkYXRhWydwcmVmaXgnXSxcbiAgICAgIG1vZHVsZVVybDogZGF0YVsnbW9kdWxlVXJsJ10sXG4gICAgICB2YWx1ZTogZGF0YVsndmFsdWUnXSxcbiAgICAgIGRpRGVwczogX2FycmF5RnJvbUpzb24oZGF0YVsnZGlEZXBzJ10sIENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YS5mcm9tSnNvbilcbiAgICB9KTtcbiAgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICdjbGFzcyc6ICdGYWN0b3J5JyxcbiAgICAgICduYW1lJzogdGhpcy5uYW1lLFxuICAgICAgJ3ByZWZpeCc6IHRoaXMucHJlZml4LFxuICAgICAgJ21vZHVsZVVybCc6IHRoaXMubW9kdWxlVXJsLFxuICAgICAgJ3ZhbHVlJzogdGhpcy52YWx1ZSxcbiAgICAgICdkaURlcHMnOiBfYXJyYXlUb0pzb24odGhpcy5kaURlcHMpXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZVRva2VuTWV0YWRhdGEgaW1wbGVtZW50cyBDb21waWxlTWV0YWRhdGFXaXRoSWRlbnRpZmllciB7XG4gIHZhbHVlOiBhbnk7XG4gIGlkZW50aWZpZXI6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGE7XG4gIGlkZW50aWZpZXJJc0luc3RhbmNlOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHt2YWx1ZSwgaWRlbnRpZmllciwgaWRlbnRpZmllcklzSW5zdGFuY2V9OiB7XG4gICAgdmFsdWU/OiBhbnksXG4gICAgaWRlbnRpZmllcj86IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEsXG4gICAgaWRlbnRpZmllcklzSW5zdGFuY2U/OiBib29sZWFuXG4gIH0pIHtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5pZGVudGlmaWVyID0gaWRlbnRpZmllcjtcbiAgICB0aGlzLmlkZW50aWZpZXJJc0luc3RhbmNlID0gbm9ybWFsaXplQm9vbChpZGVudGlmaWVySXNJbnN0YW5jZSk7XG4gIH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlVG9rZW5NZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlVG9rZW5NZXRhZGF0YSh7XG4gICAgICB2YWx1ZTogZGF0YVsndmFsdWUnXSxcbiAgICAgIGlkZW50aWZpZXI6IF9vYmpGcm9tSnNvbihkYXRhWydpZGVudGlmaWVyJ10sIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgaWRlbnRpZmllcklzSW5zdGFuY2U6IGRhdGFbJ2lkZW50aWZpZXJJc0luc3RhbmNlJ11cbiAgICB9KTtcbiAgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICd2YWx1ZSc6IHRoaXMudmFsdWUsXG4gICAgICAnaWRlbnRpZmllcic6IF9vYmpUb0pzb24odGhpcy5pZGVudGlmaWVyKSxcbiAgICAgICdpZGVudGlmaWVySXNJbnN0YW5jZSc6IHRoaXMuaWRlbnRpZmllcklzSW5zdGFuY2VcbiAgICB9O1xuICB9XG5cbiAgZ2V0IHJ1bnRpbWVDYWNoZUtleSgpOiBhbnkge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5pZGVudGlmaWVyKSkge1xuICAgICAgcmV0dXJuIHRoaXMuaWRlbnRpZmllci5ydW50aW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICB9XG4gIH1cblxuICBnZXQgYXNzZXRDYWNoZUtleSgpOiBhbnkge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5pZGVudGlmaWVyKSkge1xuICAgICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLmlkZW50aWZpZXIubW9kdWxlVXJsKSAmJlxuICAgICAgICAgICAgICAgICAgICAgaXNQcmVzZW50KGdldFVybFNjaGVtZSh0aGlzLmlkZW50aWZpZXIubW9kdWxlVXJsKSkgP1xuICAgICAgICAgICAgICAgICBgJHt0aGlzLmlkZW50aWZpZXIubmFtZX18JHt0aGlzLmlkZW50aWZpZXIubW9kdWxlVXJsfXwke3RoaXMuaWRlbnRpZmllcklzSW5zdGFuY2V9YCA6XG4gICAgICAgICAgICAgICAgIG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIGVxdWFsc1RvKHRva2VuMjogQ29tcGlsZVRva2VuTWV0YWRhdGEpOiBib29sZWFuIHtcbiAgICB2YXIgcmsgPSB0aGlzLnJ1bnRpbWVDYWNoZUtleTtcbiAgICB2YXIgYWsgPSB0aGlzLmFzc2V0Q2FjaGVLZXk7XG4gICAgcmV0dXJuIChpc1ByZXNlbnQocmspICYmIHJrID09IHRva2VuMi5ydW50aW1lQ2FjaGVLZXkpIHx8XG4gICAgICAgICAgIChpc1ByZXNlbnQoYWspICYmIGFrID09IHRva2VuMi5hc3NldENhY2hlS2V5KTtcbiAgfVxuXG4gIGdldCBuYW1lKCk6IHN0cmluZyB7IHJldHVybiBpc1ByZXNlbnQodGhpcy52YWx1ZSkgPyB0aGlzLnZhbHVlIDogdGhpcy5pZGVudGlmaWVyLm5hbWU7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVUb2tlbk1hcDxWQUxVRT4ge1xuICBwcml2YXRlIF92YWx1ZU1hcCA9IG5ldyBNYXA8YW55LCBWQUxVRT4oKTtcbiAgcHJpdmF0ZSBfdmFsdWVzOiBWQUxVRVtdID0gW107XG5cbiAgYWRkKHRva2VuOiBDb21waWxlVG9rZW5NZXRhZGF0YSwgdmFsdWU6IFZBTFVFKSB7XG4gICAgdmFyIGV4aXN0aW5nID0gdGhpcy5nZXQodG9rZW4pO1xuICAgIGlmIChpc1ByZXNlbnQoZXhpc3RpbmcpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgQ2FuIG9ubHkgYWRkIHRvIGEgVG9rZW5NYXAhIFRva2VuOiAke3Rva2VuLm5hbWV9YCk7XG4gICAgfVxuICAgIHRoaXMuX3ZhbHVlcy5wdXNoKHZhbHVlKTtcbiAgICB2YXIgcmsgPSB0b2tlbi5ydW50aW1lQ2FjaGVLZXk7XG4gICAgaWYgKGlzUHJlc2VudChyaykpIHtcbiAgICAgIHRoaXMuX3ZhbHVlTWFwLnNldChyaywgdmFsdWUpO1xuICAgIH1cbiAgICB2YXIgYWsgPSB0b2tlbi5hc3NldENhY2hlS2V5O1xuICAgIGlmIChpc1ByZXNlbnQoYWspKSB7XG4gICAgICB0aGlzLl92YWx1ZU1hcC5zZXQoYWssIHZhbHVlKTtcbiAgICB9XG4gIH1cbiAgZ2V0KHRva2VuOiBDb21waWxlVG9rZW5NZXRhZGF0YSk6IFZBTFVFIHtcbiAgICB2YXIgcmsgPSB0b2tlbi5ydW50aW1lQ2FjaGVLZXk7XG4gICAgdmFyIGFrID0gdG9rZW4uYXNzZXRDYWNoZUtleTtcbiAgICB2YXIgcmVzdWx0O1xuICAgIGlmIChpc1ByZXNlbnQocmspKSB7XG4gICAgICByZXN1bHQgPSB0aGlzLl92YWx1ZU1hcC5nZXQocmspO1xuICAgIH1cbiAgICBpZiAoaXNCbGFuayhyZXN1bHQpICYmIGlzUHJlc2VudChhaykpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX3ZhbHVlTWFwLmdldChhayk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgdmFsdWVzKCk6IFZBTFVFW10geyByZXR1cm4gdGhpcy5fdmFsdWVzOyB9XG4gIGdldCBzaXplKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl92YWx1ZXMubGVuZ3RoOyB9XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVnYXJkaW5nIGNvbXBpbGF0aW9uIG9mIGEgdHlwZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBpbGVUeXBlTWV0YWRhdGEgaW1wbGVtZW50cyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLCBDb21waWxlTWV0YWRhdGFXaXRoVHlwZSB7XG4gIHJ1bnRpbWU6IFR5cGU7XG4gIG5hbWU6IHN0cmluZztcbiAgcHJlZml4OiBzdHJpbmc7XG4gIG1vZHVsZVVybDogc3RyaW5nO1xuICBpc0hvc3Q6IGJvb2xlYW47XG4gIHZhbHVlOiBhbnk7XG4gIGRpRGVwczogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW107XG5cbiAgY29uc3RydWN0b3Ioe3J1bnRpbWUsIG5hbWUsIG1vZHVsZVVybCwgcHJlZml4LCBpc0hvc3QsIHZhbHVlLCBkaURlcHN9OiB7XG4gICAgcnVudGltZT86IFR5cGUsXG4gICAgbmFtZT86IHN0cmluZyxcbiAgICBtb2R1bGVVcmw/OiBzdHJpbmcsXG4gICAgcHJlZml4Pzogc3RyaW5nLFxuICAgIGlzSG9zdD86IGJvb2xlYW4sXG4gICAgdmFsdWU/OiBhbnksXG4gICAgZGlEZXBzPzogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW11cbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5ydW50aW1lID0gcnVudGltZTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMubW9kdWxlVXJsID0gbW9kdWxlVXJsO1xuICAgIHRoaXMucHJlZml4ID0gcHJlZml4O1xuICAgIHRoaXMuaXNIb3N0ID0gbm9ybWFsaXplQm9vbChpc0hvc3QpO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmRpRGVwcyA9IF9ub3JtYWxpemVBcnJheShkaURlcHMpO1xuICB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZVR5cGVNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlVHlwZU1ldGFkYXRhKHtcbiAgICAgIG5hbWU6IGRhdGFbJ25hbWUnXSxcbiAgICAgIG1vZHVsZVVybDogZGF0YVsnbW9kdWxlVXJsJ10sXG4gICAgICBwcmVmaXg6IGRhdGFbJ3ByZWZpeCddLFxuICAgICAgaXNIb3N0OiBkYXRhWydpc0hvc3QnXSxcbiAgICAgIHZhbHVlOiBkYXRhWyd2YWx1ZSddLFxuICAgICAgZGlEZXBzOiBfYXJyYXlGcm9tSnNvbihkYXRhWydkaURlcHMnXSwgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhLmZyb21Kc29uKVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0IGlkZW50aWZpZXIoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiB0aGlzOyB9XG4gIGdldCB0eXBlKCk6IENvbXBpbGVUeXBlTWV0YWRhdGEgeyByZXR1cm4gdGhpczsgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIE5vdGU6IFJ1bnRpbWUgdHlwZSBjYW4ndCBiZSBzZXJpYWxpemVkLi4uXG4gICAgICAnY2xhc3MnOiAnVHlwZScsXG4gICAgICAnbmFtZSc6IHRoaXMubmFtZSxcbiAgICAgICdtb2R1bGVVcmwnOiB0aGlzLm1vZHVsZVVybCxcbiAgICAgICdwcmVmaXgnOiB0aGlzLnByZWZpeCxcbiAgICAgICdpc0hvc3QnOiB0aGlzLmlzSG9zdCxcbiAgICAgICd2YWx1ZSc6IHRoaXMudmFsdWUsXG4gICAgICAnZGlEZXBzJzogX2FycmF5VG9Kc29uKHRoaXMuZGlEZXBzKVxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVRdWVyeU1ldGFkYXRhIHtcbiAgc2VsZWN0b3JzOiBBcnJheTxDb21waWxlVG9rZW5NZXRhZGF0YT47XG4gIGRlc2NlbmRhbnRzOiBib29sZWFuO1xuICBmaXJzdDogYm9vbGVhbjtcbiAgcHJvcGVydHlOYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Ioe3NlbGVjdG9ycywgZGVzY2VuZGFudHMsIGZpcnN0LCBwcm9wZXJ0eU5hbWV9OiB7XG4gICAgc2VsZWN0b3JzPzogQXJyYXk8Q29tcGlsZVRva2VuTWV0YWRhdGE+LFxuICAgIGRlc2NlbmRhbnRzPzogYm9vbGVhbixcbiAgICBmaXJzdD86IGJvb2xlYW4sXG4gICAgcHJvcGVydHlOYW1lPzogc3RyaW5nXG4gIH0gPSB7fSkge1xuICAgIHRoaXMuc2VsZWN0b3JzID0gc2VsZWN0b3JzO1xuICAgIHRoaXMuZGVzY2VuZGFudHMgPSBub3JtYWxpemVCb29sKGRlc2NlbmRhbnRzKTtcbiAgICB0aGlzLmZpcnN0ID0gbm9ybWFsaXplQm9vbChmaXJzdCk7XG4gICAgdGhpcy5wcm9wZXJ0eU5hbWUgPSBwcm9wZXJ0eU5hbWU7XG4gIH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlUXVlcnlNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlUXVlcnlNZXRhZGF0YSh7XG4gICAgICBzZWxlY3RvcnM6IF9hcnJheUZyb21Kc29uKGRhdGFbJ3NlbGVjdG9ycyddLCBDb21waWxlVG9rZW5NZXRhZGF0YS5mcm9tSnNvbiksXG4gICAgICBkZXNjZW5kYW50czogZGF0YVsnZGVzY2VuZGFudHMnXSxcbiAgICAgIGZpcnN0OiBkYXRhWydmaXJzdCddLFxuICAgICAgcHJvcGVydHlOYW1lOiBkYXRhWydwcm9wZXJ0eU5hbWUnXVxuICAgIH0pO1xuICB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4ge1xuICAgICAgJ3NlbGVjdG9ycyc6IF9hcnJheVRvSnNvbih0aGlzLnNlbGVjdG9ycyksXG4gICAgICAnZGVzY2VuZGFudHMnOiB0aGlzLmRlc2NlbmRhbnRzLFxuICAgICAgJ2ZpcnN0JzogdGhpcy5maXJzdCxcbiAgICAgICdwcm9wZXJ0eU5hbWUnOiB0aGlzLnByb3BlcnR5TmFtZVxuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZWdhcmRpbmcgY29tcGlsYXRpb24gb2YgYSB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhIHtcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb247XG4gIHRlbXBsYXRlOiBzdHJpbmc7XG4gIHRlbXBsYXRlVXJsOiBzdHJpbmc7XG4gIHN0eWxlczogc3RyaW5nW107XG4gIHN0eWxlVXJsczogc3RyaW5nW107XG4gIG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW107XG4gIGNvbnN0cnVjdG9yKHtlbmNhcHN1bGF0aW9uLCB0ZW1wbGF0ZSwgdGVtcGxhdGVVcmwsIHN0eWxlcywgc3R5bGVVcmxzLCBuZ0NvbnRlbnRTZWxlY3RvcnN9OiB7XG4gICAgZW5jYXBzdWxhdGlvbj86IFZpZXdFbmNhcHN1bGF0aW9uLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHN0eWxlcz86IHN0cmluZ1tdLFxuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdLFxuICAgIG5nQ29udGVudFNlbGVjdG9ycz86IHN0cmluZ1tdXG4gIH0gPSB7fSkge1xuICAgIHRoaXMuZW5jYXBzdWxhdGlvbiA9IGlzUHJlc2VudChlbmNhcHN1bGF0aW9uKSA/IGVuY2Fwc3VsYXRpb24gOiBWaWV3RW5jYXBzdWxhdGlvbi5FbXVsYXRlZDtcbiAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgdGhpcy50ZW1wbGF0ZVVybCA9IHRlbXBsYXRlVXJsO1xuICAgIHRoaXMuc3R5bGVzID0gaXNQcmVzZW50KHN0eWxlcykgPyBzdHlsZXMgOiBbXTtcbiAgICB0aGlzLnN0eWxlVXJscyA9IGlzUHJlc2VudChzdHlsZVVybHMpID8gc3R5bGVVcmxzIDogW107XG4gICAgdGhpcy5uZ0NvbnRlbnRTZWxlY3RvcnMgPSBpc1ByZXNlbnQobmdDb250ZW50U2VsZWN0b3JzKSA/IG5nQ29udGVudFNlbGVjdG9ycyA6IFtdO1xuICB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEoe1xuICAgICAgZW5jYXBzdWxhdGlvbjogaXNQcmVzZW50KGRhdGFbJ2VuY2Fwc3VsYXRpb24nXSkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgIFZJRVdfRU5DQVBTVUxBVElPTl9WQUxVRVNbZGF0YVsnZW5jYXBzdWxhdGlvbiddXSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVsnZW5jYXBzdWxhdGlvbiddLFxuICAgICAgdGVtcGxhdGU6IGRhdGFbJ3RlbXBsYXRlJ10sXG4gICAgICB0ZW1wbGF0ZVVybDogZGF0YVsndGVtcGxhdGVVcmwnXSxcbiAgICAgIHN0eWxlczogZGF0YVsnc3R5bGVzJ10sXG4gICAgICBzdHlsZVVybHM6IGRhdGFbJ3N0eWxlVXJscyddLFxuICAgICAgbmdDb250ZW50U2VsZWN0b3JzOiBkYXRhWyduZ0NvbnRlbnRTZWxlY3RvcnMnXVxuICAgIH0pO1xuICB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4ge1xuICAgICAgJ2VuY2Fwc3VsYXRpb24nOlxuICAgICAgICAgIGlzUHJlc2VudCh0aGlzLmVuY2Fwc3VsYXRpb24pID8gc2VyaWFsaXplRW51bSh0aGlzLmVuY2Fwc3VsYXRpb24pIDogdGhpcy5lbmNhcHN1bGF0aW9uLFxuICAgICAgJ3RlbXBsYXRlJzogdGhpcy50ZW1wbGF0ZSxcbiAgICAgICd0ZW1wbGF0ZVVybCc6IHRoaXMudGVtcGxhdGVVcmwsXG4gICAgICAnc3R5bGVzJzogdGhpcy5zdHlsZXMsXG4gICAgICAnc3R5bGVVcmxzJzogdGhpcy5zdHlsZVVybHMsXG4gICAgICAnbmdDb250ZW50U2VsZWN0b3JzJzogdGhpcy5uZ0NvbnRlbnRTZWxlY3RvcnNcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVnYXJkaW5nIGNvbXBpbGF0aW9uIG9mIGEgZGlyZWN0aXZlLlxuICovXG5leHBvcnQgY2xhc3MgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhIGltcGxlbWVudHMgQ29tcGlsZU1ldGFkYXRhV2l0aFR5cGUge1xuICBzdGF0aWMgY3JlYXRlKHt0eXBlLCBpc0NvbXBvbmVudCwgZHluYW1pY0xvYWRhYmxlLCBzZWxlY3RvciwgZXhwb3J0QXMsIGNoYW5nZURldGVjdGlvbiwgaW5wdXRzLFxuICAgICAgICAgICAgICAgICBvdXRwdXRzLCBob3N0LCBsaWZlY3ljbGVIb29rcywgcHJvdmlkZXJzLCB2aWV3UHJvdmlkZXJzLCBxdWVyaWVzLCB2aWV3UXVlcmllcyxcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGV9OiB7XG4gICAgdHlwZT86IENvbXBpbGVUeXBlTWV0YWRhdGEsXG4gICAgaXNDb21wb25lbnQ/OiBib29sZWFuLFxuICAgIGR5bmFtaWNMb2FkYWJsZT86IGJvb2xlYW4sXG4gICAgc2VsZWN0b3I/OiBzdHJpbmcsXG4gICAgZXhwb3J0QXM/OiBzdHJpbmcsXG4gICAgY2hhbmdlRGV0ZWN0aW9uPzogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gICAgaW5wdXRzPzogc3RyaW5nW10sXG4gICAgb3V0cHV0cz86IHN0cmluZ1tdLFxuICAgIGhvc3Q/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBsaWZlY3ljbGVIb29rcz86IExpZmVjeWNsZUhvb2tzW10sXG4gICAgcHJvdmlkZXJzPzpcbiAgICAgICAgQXJyYXk8Q29tcGlsZVByb3ZpZGVyTWV0YWRhdGEgfCBDb21waWxlVHlwZU1ldGFkYXRhIHwgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB8IGFueVtdPixcbiAgICB2aWV3UHJvdmlkZXJzPzpcbiAgICAgICAgQXJyYXk8Q29tcGlsZVByb3ZpZGVyTWV0YWRhdGEgfCBDb21waWxlVHlwZU1ldGFkYXRhIHwgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB8IGFueVtdPixcbiAgICBxdWVyaWVzPzogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSxcbiAgICB2aWV3UXVlcmllcz86IENvbXBpbGVRdWVyeU1ldGFkYXRhW10sXG4gICAgdGVtcGxhdGU/OiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YVxuICB9ID0ge30pOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEge1xuICAgIHZhciBob3N0TGlzdGVuZXJzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIHZhciBob3N0UHJvcGVydGllczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICB2YXIgaG9zdEF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgaWYgKGlzUHJlc2VudChob3N0KSkge1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGhvc3QsICh2YWx1ZTogc3RyaW5nLCBrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICB2YXIgbWF0Y2hlcyA9IFJlZ0V4cFdyYXBwZXIuZmlyc3RNYXRjaChIT1NUX1JFR19FWFAsIGtleSk7XG4gICAgICAgIGlmIChpc0JsYW5rKG1hdGNoZXMpKSB7XG4gICAgICAgICAgaG9zdEF0dHJpYnV0ZXNba2V5XSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChtYXRjaGVzWzFdKSkge1xuICAgICAgICAgIGhvc3RQcm9wZXJ0aWVzW21hdGNoZXNbMV1dID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KG1hdGNoZXNbMl0pKSB7XG4gICAgICAgICAgaG9zdExpc3RlbmVyc1ttYXRjaGVzWzJdXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgdmFyIGlucHV0c01hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICBpZiAoaXNQcmVzZW50KGlucHV0cykpIHtcbiAgICAgIGlucHV0cy5mb3JFYWNoKChiaW5kQ29uZmlnOiBzdHJpbmcpID0+IHtcbiAgICAgICAgLy8gY2Fub25pY2FsIHN5bnRheDogYGRpclByb3A6IGVsUHJvcGBcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgbm8gYDpgLCB1c2UgZGlyUHJvcCA9IGVsUHJvcFxuICAgICAgICB2YXIgcGFydHMgPSBzcGxpdEF0Q29sb24oYmluZENvbmZpZywgW2JpbmRDb25maWcsIGJpbmRDb25maWddKTtcbiAgICAgICAgaW5wdXRzTWFwW3BhcnRzWzBdXSA9IHBhcnRzWzFdO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHZhciBvdXRwdXRzTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGlmIChpc1ByZXNlbnQob3V0cHV0cykpIHtcbiAgICAgIG91dHB1dHMuZm9yRWFjaCgoYmluZENvbmZpZzogc3RyaW5nKSA9PiB7XG4gICAgICAgIC8vIGNhbm9uaWNhbCBzeW50YXg6IGBkaXJQcm9wOiBlbFByb3BgXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIG5vIGA6YCwgdXNlIGRpclByb3AgPSBlbFByb3BcbiAgICAgICAgdmFyIHBhcnRzID0gc3BsaXRBdENvbG9uKGJpbmRDb25maWcsIFtiaW5kQ29uZmlnLCBiaW5kQ29uZmlnXSk7XG4gICAgICAgIG91dHB1dHNNYXBbcGFydHNbMF1dID0gcGFydHNbMV07XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSh7XG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgaXNDb21wb25lbnQ6IG5vcm1hbGl6ZUJvb2woaXNDb21wb25lbnQpLFxuICAgICAgZHluYW1pY0xvYWRhYmxlOiBub3JtYWxpemVCb29sKGR5bmFtaWNMb2FkYWJsZSksXG4gICAgICBzZWxlY3Rvcjogc2VsZWN0b3IsXG4gICAgICBleHBvcnRBczogZXhwb3J0QXMsXG4gICAgICBjaGFuZ2VEZXRlY3Rpb246IGNoYW5nZURldGVjdGlvbixcbiAgICAgIGlucHV0czogaW5wdXRzTWFwLFxuICAgICAgb3V0cHV0czogb3V0cHV0c01hcCxcbiAgICAgIGhvc3RMaXN0ZW5lcnM6IGhvc3RMaXN0ZW5lcnMsXG4gICAgICBob3N0UHJvcGVydGllczogaG9zdFByb3BlcnRpZXMsXG4gICAgICBob3N0QXR0cmlidXRlczogaG9zdEF0dHJpYnV0ZXMsXG4gICAgICBsaWZlY3ljbGVIb29rczogaXNQcmVzZW50KGxpZmVjeWNsZUhvb2tzKSA/IGxpZmVjeWNsZUhvb2tzIDogW10sXG4gICAgICBwcm92aWRlcnM6IHByb3ZpZGVycyxcbiAgICAgIHZpZXdQcm92aWRlcnM6IHZpZXdQcm92aWRlcnMsXG4gICAgICBxdWVyaWVzOiBxdWVyaWVzLFxuICAgICAgdmlld1F1ZXJpZXM6IHZpZXdRdWVyaWVzLFxuICAgICAgdGVtcGxhdGU6IHRlbXBsYXRlXG4gICAgfSk7XG4gIH1cbiAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YTtcbiAgaXNDb21wb25lbnQ6IGJvb2xlYW47XG4gIGR5bmFtaWNMb2FkYWJsZTogYm9vbGVhbjtcbiAgc2VsZWN0b3I6IHN0cmluZztcbiAgZXhwb3J0QXM6IHN0cmluZztcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneTtcbiAgaW5wdXRzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgb3V0cHV0czoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGhvc3RMaXN0ZW5lcnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBob3N0UHJvcGVydGllczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGhvc3RBdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgbGlmZWN5Y2xlSG9va3M6IExpZmVjeWNsZUhvb2tzW107XG4gIHByb3ZpZGVyczogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXTtcbiAgdmlld1Byb3ZpZGVyczogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXTtcbiAgcXVlcmllczogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXTtcbiAgdmlld1F1ZXJpZXM6IENvbXBpbGVRdWVyeU1ldGFkYXRhW107XG5cbiAgdGVtcGxhdGU6IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhO1xuICBjb25zdHJ1Y3Rvcih7dHlwZSwgaXNDb21wb25lbnQsIGR5bmFtaWNMb2FkYWJsZSwgc2VsZWN0b3IsIGV4cG9ydEFzLCBjaGFuZ2VEZXRlY3Rpb24sIGlucHV0cyxcbiAgICAgICAgICAgICAgIG91dHB1dHMsIGhvc3RMaXN0ZW5lcnMsIGhvc3RQcm9wZXJ0aWVzLCBob3N0QXR0cmlidXRlcywgbGlmZWN5Y2xlSG9va3MsIHByb3ZpZGVycyxcbiAgICAgICAgICAgICAgIHZpZXdQcm92aWRlcnMsIHF1ZXJpZXMsIHZpZXdRdWVyaWVzLCB0ZW1wbGF0ZX06IHtcbiAgICB0eXBlPzogQ29tcGlsZVR5cGVNZXRhZGF0YSxcbiAgICBpc0NvbXBvbmVudD86IGJvb2xlYW4sXG4gICAgZHluYW1pY0xvYWRhYmxlPzogYm9vbGVhbixcbiAgICBzZWxlY3Rvcj86IHN0cmluZyxcbiAgICBleHBvcnRBcz86IHN0cmluZyxcbiAgICBjaGFuZ2VEZXRlY3Rpb24/OiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgICBpbnB1dHM/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBvdXRwdXRzPzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgaG9zdExpc3RlbmVycz86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIGhvc3RQcm9wZXJ0aWVzPzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgaG9zdEF0dHJpYnV0ZXM/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBsaWZlY3ljbGVIb29rcz86IExpZmVjeWNsZUhvb2tzW10sXG4gICAgcHJvdmlkZXJzPzpcbiAgICAgICAgQXJyYXk8Q29tcGlsZVByb3ZpZGVyTWV0YWRhdGEgfCBDb21waWxlVHlwZU1ldGFkYXRhIHwgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB8IGFueVtdPixcbiAgICB2aWV3UHJvdmlkZXJzPzpcbiAgICAgICAgQXJyYXk8Q29tcGlsZVByb3ZpZGVyTWV0YWRhdGEgfCBDb21waWxlVHlwZU1ldGFkYXRhIHwgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB8IGFueVtdPixcbiAgICBxdWVyaWVzPzogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSxcbiAgICB2aWV3UXVlcmllcz86IENvbXBpbGVRdWVyeU1ldGFkYXRhW10sXG4gICAgdGVtcGxhdGU/OiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YVxuICB9ID0ge30pIHtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMuaXNDb21wb25lbnQgPSBpc0NvbXBvbmVudDtcbiAgICB0aGlzLmR5bmFtaWNMb2FkYWJsZSA9IGR5bmFtaWNMb2FkYWJsZTtcbiAgICB0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgdGhpcy5leHBvcnRBcyA9IGV4cG9ydEFzO1xuICAgIHRoaXMuY2hhbmdlRGV0ZWN0aW9uID0gY2hhbmdlRGV0ZWN0aW9uO1xuICAgIHRoaXMuaW5wdXRzID0gaW5wdXRzO1xuICAgIHRoaXMub3V0cHV0cyA9IG91dHB1dHM7XG4gICAgdGhpcy5ob3N0TGlzdGVuZXJzID0gaG9zdExpc3RlbmVycztcbiAgICB0aGlzLmhvc3RQcm9wZXJ0aWVzID0gaG9zdFByb3BlcnRpZXM7XG4gICAgdGhpcy5ob3N0QXR0cmlidXRlcyA9IGhvc3RBdHRyaWJ1dGVzO1xuICAgIHRoaXMubGlmZWN5Y2xlSG9va3MgPSBfbm9ybWFsaXplQXJyYXkobGlmZWN5Y2xlSG9va3MpO1xuICAgIHRoaXMucHJvdmlkZXJzID0gX25vcm1hbGl6ZUFycmF5KHByb3ZpZGVycyk7XG4gICAgdGhpcy52aWV3UHJvdmlkZXJzID0gX25vcm1hbGl6ZUFycmF5KHZpZXdQcm92aWRlcnMpO1xuICAgIHRoaXMucXVlcmllcyA9IF9ub3JtYWxpemVBcnJheShxdWVyaWVzKTtcbiAgICB0aGlzLnZpZXdRdWVyaWVzID0gX25vcm1hbGl6ZUFycmF5KHZpZXdRdWVyaWVzKTtcbiAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gIH1cblxuICBnZXQgaWRlbnRpZmllcigpOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHsgcmV0dXJuIHRoaXMudHlwZTsgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEoe1xuICAgICAgaXNDb21wb25lbnQ6IGRhdGFbJ2lzQ29tcG9uZW50J10sXG4gICAgICBkeW5hbWljTG9hZGFibGU6IGRhdGFbJ2R5bmFtaWNMb2FkYWJsZSddLFxuICAgICAgc2VsZWN0b3I6IGRhdGFbJ3NlbGVjdG9yJ10sXG4gICAgICBleHBvcnRBczogZGF0YVsnZXhwb3J0QXMnXSxcbiAgICAgIHR5cGU6IGlzUHJlc2VudChkYXRhWyd0eXBlJ10pID8gQ29tcGlsZVR5cGVNZXRhZGF0YS5mcm9tSnNvbihkYXRhWyd0eXBlJ10pIDogZGF0YVsndHlwZSddLFxuICAgICAgY2hhbmdlRGV0ZWN0aW9uOiBpc1ByZXNlbnQoZGF0YVsnY2hhbmdlRGV0ZWN0aW9uJ10pID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIENIQU5HRV9ERVRFQ1RJT05fU1RSQVRFR1lfVkFMVUVTW2RhdGFbJ2NoYW5nZURldGVjdGlvbiddXSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhWydjaGFuZ2VEZXRlY3Rpb24nXSxcbiAgICAgIGlucHV0czogZGF0YVsnaW5wdXRzJ10sXG4gICAgICBvdXRwdXRzOiBkYXRhWydvdXRwdXRzJ10sXG4gICAgICBob3N0TGlzdGVuZXJzOiBkYXRhWydob3N0TGlzdGVuZXJzJ10sXG4gICAgICBob3N0UHJvcGVydGllczogZGF0YVsnaG9zdFByb3BlcnRpZXMnXSxcbiAgICAgIGhvc3RBdHRyaWJ1dGVzOiBkYXRhWydob3N0QXR0cmlidXRlcyddLFxuICAgICAgbGlmZWN5Y2xlSG9va3M6XG4gICAgICAgICAgKDxhbnlbXT5kYXRhWydsaWZlY3ljbGVIb29rcyddKS5tYXAoaG9va1ZhbHVlID0+IExJRkVDWUNMRV9IT09LU19WQUxVRVNbaG9va1ZhbHVlXSksXG4gICAgICB0ZW1wbGF0ZTogaXNQcmVzZW50KGRhdGFbJ3RlbXBsYXRlJ10pID8gQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEuZnJvbUpzb24oZGF0YVsndGVtcGxhdGUnXSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbJ3RlbXBsYXRlJ10sXG4gICAgICBwcm92aWRlcnM6IF9hcnJheUZyb21Kc29uKGRhdGFbJ3Byb3ZpZGVycyddLCBtZXRhZGF0YUZyb21Kc29uKSxcbiAgICAgIHZpZXdQcm92aWRlcnM6IF9hcnJheUZyb21Kc29uKGRhdGFbJ3ZpZXdQcm92aWRlcnMnXSwgbWV0YWRhdGFGcm9tSnNvbiksXG4gICAgICBxdWVyaWVzOiBfYXJyYXlGcm9tSnNvbihkYXRhWydxdWVyaWVzJ10sIENvbXBpbGVRdWVyeU1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIHZpZXdRdWVyaWVzOiBfYXJyYXlGcm9tSnNvbihkYXRhWyd2aWV3UXVlcmllcyddLCBDb21waWxlUXVlcnlNZXRhZGF0YS5mcm9tSnNvbilcbiAgICB9KTtcbiAgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICdjbGFzcyc6ICdEaXJlY3RpdmUnLFxuICAgICAgJ2lzQ29tcG9uZW50JzogdGhpcy5pc0NvbXBvbmVudCxcbiAgICAgICdkeW5hbWljTG9hZGFibGUnOiB0aGlzLmR5bmFtaWNMb2FkYWJsZSxcbiAgICAgICdzZWxlY3Rvcic6IHRoaXMuc2VsZWN0b3IsXG4gICAgICAnZXhwb3J0QXMnOiB0aGlzLmV4cG9ydEFzLFxuICAgICAgJ3R5cGUnOiBpc1ByZXNlbnQodGhpcy50eXBlKSA/IHRoaXMudHlwZS50b0pzb24oKSA6IHRoaXMudHlwZSxcbiAgICAgICdjaGFuZ2VEZXRlY3Rpb24nOiBpc1ByZXNlbnQodGhpcy5jaGFuZ2VEZXRlY3Rpb24pID8gc2VyaWFsaXplRW51bSh0aGlzLmNoYW5nZURldGVjdGlvbikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZURldGVjdGlvbixcbiAgICAgICdpbnB1dHMnOiB0aGlzLmlucHV0cyxcbiAgICAgICdvdXRwdXRzJzogdGhpcy5vdXRwdXRzLFxuICAgICAgJ2hvc3RMaXN0ZW5lcnMnOiB0aGlzLmhvc3RMaXN0ZW5lcnMsXG4gICAgICAnaG9zdFByb3BlcnRpZXMnOiB0aGlzLmhvc3RQcm9wZXJ0aWVzLFxuICAgICAgJ2hvc3RBdHRyaWJ1dGVzJzogdGhpcy5ob3N0QXR0cmlidXRlcyxcbiAgICAgICdsaWZlY3ljbGVIb29rcyc6IHRoaXMubGlmZWN5Y2xlSG9va3MubWFwKGhvb2sgPT4gc2VyaWFsaXplRW51bShob29rKSksXG4gICAgICAndGVtcGxhdGUnOiBpc1ByZXNlbnQodGhpcy50ZW1wbGF0ZSkgPyB0aGlzLnRlbXBsYXRlLnRvSnNvbigpIDogdGhpcy50ZW1wbGF0ZSxcbiAgICAgICdwcm92aWRlcnMnOiBfYXJyYXlUb0pzb24odGhpcy5wcm92aWRlcnMpLFxuICAgICAgJ3ZpZXdQcm92aWRlcnMnOiBfYXJyYXlUb0pzb24odGhpcy52aWV3UHJvdmlkZXJzKSxcbiAgICAgICdxdWVyaWVzJzogX2FycmF5VG9Kc29uKHRoaXMucXVlcmllcyksXG4gICAgICAndmlld1F1ZXJpZXMnOiBfYXJyYXlUb0pzb24odGhpcy52aWV3UXVlcmllcylcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogQ29uc3RydWN0IHtAbGluayBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGF9IGZyb20ge0BsaW5rIENvbXBvbmVudFR5cGVNZXRhZGF0YX0gYW5kIGEgc2VsZWN0b3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVIb3N0Q29tcG9uZW50TWV0YShjb21wb25lbnRUeXBlOiBDb21waWxlVHlwZU1ldGFkYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFNlbGVjdG9yOiBzdHJpbmcpOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEge1xuICB2YXIgdGVtcGxhdGUgPSBDc3NTZWxlY3Rvci5wYXJzZShjb21wb25lbnRTZWxlY3RvcilbMF0uZ2V0TWF0Y2hpbmdFbGVtZW50VGVtcGxhdGUoKTtcbiAgcmV0dXJuIENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YS5jcmVhdGUoe1xuICAgIHR5cGU6IG5ldyBDb21waWxlVHlwZU1ldGFkYXRhKHtcbiAgICAgIHJ1bnRpbWU6IE9iamVjdCxcbiAgICAgIG5hbWU6IGAke2NvbXBvbmVudFR5cGUubmFtZX1fSG9zdGAsXG4gICAgICBtb2R1bGVVcmw6IGNvbXBvbmVudFR5cGUubW9kdWxlVXJsLFxuICAgICAgaXNIb3N0OiB0cnVlXG4gICAgfSksXG4gICAgdGVtcGxhdGU6IG5ldyBDb21waWxlVGVtcGxhdGVNZXRhZGF0YShcbiAgICAgICAge3RlbXBsYXRlOiB0ZW1wbGF0ZSwgdGVtcGxhdGVVcmw6ICcnLCBzdHlsZXM6IFtdLCBzdHlsZVVybHM6IFtdLCBuZ0NvbnRlbnRTZWxlY3RvcnM6IFtdfSksXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0LFxuICAgIGlucHV0czogW10sXG4gICAgb3V0cHV0czogW10sXG4gICAgaG9zdDoge30sXG4gICAgbGlmZWN5Y2xlSG9va3M6IFtdLFxuICAgIGlzQ29tcG9uZW50OiB0cnVlLFxuICAgIGR5bmFtaWNMb2FkYWJsZTogZmFsc2UsXG4gICAgc2VsZWN0b3I6ICcqJyxcbiAgICBwcm92aWRlcnM6IFtdLFxuICAgIHZpZXdQcm92aWRlcnM6IFtdLFxuICAgIHF1ZXJpZXM6IFtdLFxuICAgIHZpZXdRdWVyaWVzOiBbXVxuICB9KTtcbn1cblxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZVBpcGVNZXRhZGF0YSBpbXBsZW1lbnRzIENvbXBpbGVNZXRhZGF0YVdpdGhUeXBlIHtcbiAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YTtcbiAgbmFtZTogc3RyaW5nO1xuICBwdXJlOiBib29sZWFuO1xuICBsaWZlY3ljbGVIb29rczogTGlmZWN5Y2xlSG9va3NbXTtcblxuICBjb25zdHJ1Y3Rvcih7dHlwZSwgbmFtZSwgcHVyZSwgbGlmZWN5Y2xlSG9va3N9OiB7XG4gICAgdHlwZT86IENvbXBpbGVUeXBlTWV0YWRhdGEsXG4gICAgbmFtZT86IHN0cmluZyxcbiAgICBwdXJlPzogYm9vbGVhbixcbiAgICBsaWZlY3ljbGVIb29rcz86IExpZmVjeWNsZUhvb2tzW11cbiAgfSA9IHt9KSB7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMucHVyZSA9IG5vcm1hbGl6ZUJvb2wocHVyZSk7XG4gICAgdGhpcy5saWZlY3ljbGVIb29rcyA9IF9ub3JtYWxpemVBcnJheShsaWZlY3ljbGVIb29rcyk7XG4gIH1cbiAgZ2V0IGlkZW50aWZpZXIoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiB0aGlzLnR5cGU7IH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlUGlwZU1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVQaXBlTWV0YWRhdGEoe1xuICAgICAgdHlwZTogaXNQcmVzZW50KGRhdGFbJ3R5cGUnXSkgPyBDb21waWxlVHlwZU1ldGFkYXRhLmZyb21Kc29uKGRhdGFbJ3R5cGUnXSkgOiBkYXRhWyd0eXBlJ10sXG4gICAgICBuYW1lOiBkYXRhWyduYW1lJ10sXG4gICAgICBwdXJlOiBkYXRhWydwdXJlJ11cbiAgICB9KTtcbiAgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICdjbGFzcyc6ICdQaXBlJyxcbiAgICAgICd0eXBlJzogaXNQcmVzZW50KHRoaXMudHlwZSkgPyB0aGlzLnR5cGUudG9Kc29uKCkgOiBudWxsLFxuICAgICAgJ25hbWUnOiB0aGlzLm5hbWUsXG4gICAgICAncHVyZSc6IHRoaXMucHVyZVxuICAgIH07XG4gIH1cbn1cblxudmFyIF9DT01QSUxFX01FVEFEQVRBX0ZST01fSlNPTiA9IHtcbiAgJ0RpcmVjdGl2ZSc6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YS5mcm9tSnNvbixcbiAgJ1BpcGUnOiBDb21waWxlUGlwZU1ldGFkYXRhLmZyb21Kc29uLFxuICAnVHlwZSc6IENvbXBpbGVUeXBlTWV0YWRhdGEuZnJvbUpzb24sXG4gICdQcm92aWRlcic6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhLmZyb21Kc29uLFxuICAnSWRlbnRpZmllcic6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEuZnJvbUpzb24sXG4gICdGYWN0b3J5JzogQ29tcGlsZUZhY3RvcnlNZXRhZGF0YS5mcm9tSnNvblxufTtcblxuZnVuY3Rpb24gX2FycmF5RnJvbUpzb24ob2JqOiBhbnlbXSwgZm46IChhOiB7W2tleTogc3RyaW5nXTogYW55fSkgPT4gYW55KTogYW55IHtcbiAgcmV0dXJuIGlzQmxhbmsob2JqKSA/IG51bGwgOiBvYmoubWFwKG8gPT4gX29iakZyb21Kc29uKG8sIGZuKSk7XG59XG5cbmZ1bmN0aW9uIF9hcnJheVRvSnNvbihvYmo6IGFueVtdKTogc3RyaW5nIHwge1trZXk6IHN0cmluZ106IGFueX0ge1xuICByZXR1cm4gaXNCbGFuayhvYmopID8gbnVsbCA6IG9iai5tYXAoX29ialRvSnNvbik7XG59XG5cbmZ1bmN0aW9uIF9vYmpGcm9tSnNvbihvYmo6IGFueSwgZm46IChhOiB7W2tleTogc3RyaW5nXTogYW55fSkgPT4gYW55KTogYW55IHtcbiAgaWYgKGlzQXJyYXkob2JqKSkgcmV0dXJuIF9hcnJheUZyb21Kc29uKG9iaiwgZm4pO1xuICBpZiAoaXNTdHJpbmcob2JqKSB8fCBpc0JsYW5rKG9iaikgfHwgaXNCb29sZWFuKG9iaikgfHwgaXNOdW1iZXIob2JqKSkgcmV0dXJuIG9iajtcbiAgcmV0dXJuIGZuKG9iaik7XG59XG5cbmZ1bmN0aW9uIF9vYmpUb0pzb24ob2JqOiBhbnkpOiBzdHJpbmcgfCB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gIGlmIChpc0FycmF5KG9iaikpIHJldHVybiBfYXJyYXlUb0pzb24ob2JqKTtcbiAgaWYgKGlzU3RyaW5nKG9iaikgfHwgaXNCbGFuayhvYmopIHx8IGlzQm9vbGVhbihvYmopIHx8IGlzTnVtYmVyKG9iaikpIHJldHVybiBvYmo7XG4gIHJldHVybiBvYmoudG9Kc29uKCk7XG59XG5cbmZ1bmN0aW9uIF9ub3JtYWxpemVBcnJheShvYmo6IGFueVtdKTogYW55W10ge1xuICByZXR1cm4gaXNQcmVzZW50KG9iaikgPyBvYmogOiBbXTtcbn1cbiJdfQ==