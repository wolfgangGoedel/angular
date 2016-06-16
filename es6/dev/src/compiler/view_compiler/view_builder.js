import { isPresent, StringWrapper } from 'angular2/src/facade/lang';
import { ListWrapper, StringMapWrapper, SetWrapper } from 'angular2/src/facade/collection';
import * as o from '../output/output_ast';
import { Identifiers, identifierToken } from '../identifiers';
import { ViewConstructorVars, InjectMethodVars, DetectChangesVars, ViewTypeEnum, ViewEncapsulationEnum, ChangeDetectionStrategyEnum, ViewProperties } from './constants';
import { ChangeDetectionStrategy, isDefaultChangeDetectionStrategy } from 'angular2/src/core/change_detection/change_detection';
import { CompileView } from './compile_view';
import { CompileElement, CompileNode } from './compile_element';
import { templateVisitAll } from '../template_ast';
import { getViewFactoryName, createFlatArray, createDiTokenExpression } from './util';
import { ViewType } from 'angular2/src/core/linker/view_type';
import { ViewEncapsulation } from 'angular2/src/core/metadata/view';
import { CompileIdentifierMetadata } from '../compile_metadata';
const IMPLICIT_TEMPLATE_VAR = '\$implicit';
const CLASS_ATTR = 'class';
const STYLE_ATTR = 'style';
var parentRenderNodeVar = o.variable('parentRenderNode');
var rootSelectorVar = o.variable('rootSelector');
export class ViewCompileDependency {
    constructor(comp, factoryPlaceholder) {
        this.comp = comp;
        this.factoryPlaceholder = factoryPlaceholder;
    }
}
export function buildView(view, template, targetDependencies) {
    var builderVisitor = new ViewBuilderVisitor(view, targetDependencies);
    templateVisitAll(builderVisitor, template, view.declarationElement.isNull() ?
        view.declarationElement :
        view.declarationElement.parent);
    return builderVisitor.nestedViewCount;
}
export function finishView(view, targetStatements) {
    view.afterNodes();
    createViewTopLevelStmts(view, targetStatements);
    view.nodes.forEach((node) => {
        if (node instanceof CompileElement && isPresent(node.embeddedView)) {
            finishView(node.embeddedView, targetStatements);
        }
    });
}
class ViewBuilderVisitor {
    constructor(view, targetDependencies) {
        this.view = view;
        this.targetDependencies = targetDependencies;
        this.nestedViewCount = 0;
    }
    _isRootNode(parent) { return parent.view !== this.view; }
    _addRootNodeAndProject(node, ngContentIndex, parent) {
        var vcAppEl = (node instanceof CompileElement && node.hasViewContainer) ? node.appElement : null;
        if (this._isRootNode(parent)) {
            // store appElement as root node only for ViewContainers
            if (this.view.viewType !== ViewType.COMPONENT) {
                this.view.rootNodesOrAppElements.push(isPresent(vcAppEl) ? vcAppEl : node.renderNode);
            }
        }
        else if (isPresent(parent.component) && isPresent(ngContentIndex)) {
            parent.addContentNode(ngContentIndex, isPresent(vcAppEl) ? vcAppEl : node.renderNode);
        }
    }
    _getParentRenderNode(parent) {
        if (this._isRootNode(parent)) {
            if (this.view.viewType === ViewType.COMPONENT) {
                return parentRenderNodeVar;
            }
            else {
                // root node of an embedded/host view
                return o.NULL_EXPR;
            }
        }
        else {
            return isPresent(parent.component) &&
                parent.component.template.encapsulation !== ViewEncapsulation.Native ?
                o.NULL_EXPR :
                parent.renderNode;
        }
    }
    visitBoundText(ast, parent) {
        return this._visitText(ast, '', ast.ngContentIndex, parent);
    }
    visitText(ast, parent) {
        return this._visitText(ast, ast.value, ast.ngContentIndex, parent);
    }
    _visitText(ast, value, ngContentIndex, parent) {
        var fieldName = `_text_${this.view.nodes.length}`;
        this.view.fields.push(new o.ClassField(fieldName, o.importType(this.view.genConfig.renderTypes.renderText), [o.StmtModifier.Private]));
        var renderNode = o.THIS_EXPR.prop(fieldName);
        var compileNode = new CompileNode(parent, this.view, this.view.nodes.length, renderNode, ast);
        var createRenderNode = o.THIS_EXPR.prop(fieldName)
            .set(ViewProperties.renderer.callMethod('createText', [
            this._getParentRenderNode(parent),
            o.literal(value),
            this.view.createMethod.resetDebugInfoExpr(this.view.nodes.length, ast)
        ]))
            .toStmt();
        this.view.nodes.push(compileNode);
        this.view.createMethod.addStmt(createRenderNode);
        this._addRootNodeAndProject(compileNode, ngContentIndex, parent);
        return renderNode;
    }
    visitNgContent(ast, parent) {
        // the projected nodes originate from a different view, so we don't
        // have debug information for them...
        this.view.createMethod.resetDebugInfo(null, ast);
        var parentRenderNode = this._getParentRenderNode(parent);
        var nodesExpression = ViewProperties.projectableNodes.key(o.literal(ast.index), new o.ArrayType(o.importType(this.view.genConfig.renderTypes.renderNode)));
        if (parentRenderNode !== o.NULL_EXPR) {
            this.view.createMethod.addStmt(ViewProperties.renderer.callMethod('projectNodes', [
                parentRenderNode,
                o.importExpr(Identifiers.flattenNestedViewRenderNodes)
                    .callFn([nodesExpression])
            ])
                .toStmt());
        }
        else if (this._isRootNode(parent)) {
            if (this.view.viewType !== ViewType.COMPONENT) {
                // store root nodes only for embedded/host views
                this.view.rootNodesOrAppElements.push(nodesExpression);
            }
        }
        else {
            if (isPresent(parent.component) && isPresent(ast.ngContentIndex)) {
                parent.addContentNode(ast.ngContentIndex, nodesExpression);
            }
        }
        return null;
    }
    visitElement(ast, parent) {
        var nodeIndex = this.view.nodes.length;
        var createRenderNodeExpr;
        var debugContextExpr = this.view.createMethod.resetDebugInfoExpr(nodeIndex, ast);
        if (nodeIndex === 0 && this.view.viewType === ViewType.HOST) {
            createRenderNodeExpr = o.THIS_EXPR.callMethod('selectOrCreateHostElement', [o.literal(ast.name), rootSelectorVar, debugContextExpr]);
        }
        else {
            createRenderNodeExpr = ViewProperties.renderer.callMethod('createElement', [this._getParentRenderNode(parent), o.literal(ast.name), debugContextExpr]);
        }
        var fieldName = `_el_${nodeIndex}`;
        this.view.fields.push(new o.ClassField(fieldName, o.importType(this.view.genConfig.renderTypes.renderElement), [o.StmtModifier.Private]));
        this.view.createMethod.addStmt(o.THIS_EXPR.prop(fieldName).set(createRenderNodeExpr).toStmt());
        var renderNode = o.THIS_EXPR.prop(fieldName);
        var directives = ast.directives.map(directiveAst => directiveAst.directive);
        var variables = _readHtmlAndDirectiveVariables(ast.exportAsVars, ast.directives, this.view.viewType);
        var component = directives.find(directive => directive.isComponent);
        var htmlAttrs = _readHtmlAttrs(ast.attrs);
        var attrNameAndValues = _mergeHtmlAndDirectiveAttrs(htmlAttrs, directives);
        for (var i = 0; i < attrNameAndValues.length; i++) {
            var attrName = attrNameAndValues[i][0];
            var attrValue = attrNameAndValues[i][1];
            this.view.createMethod.addStmt(ViewProperties.renderer.callMethod('setElementAttribute', [renderNode, o.literal(attrName), o.literal(attrValue)])
                .toStmt());
        }
        var compileElement = new CompileElement(parent, this.view, nodeIndex, renderNode, ast, component, directives, ast.providers, ast.hasViewContainer, false, variables);
        this.view.nodes.push(compileElement);
        var compViewExpr = null;
        if (isPresent(component)) {
            var nestedComponentIdentifier = new CompileIdentifierMetadata({ name: getViewFactoryName(component, 0) });
            this.targetDependencies.push(new ViewCompileDependency(component, nestedComponentIdentifier));
            compViewExpr = o.variable(`compView_${nodeIndex}`);
            compileElement.setComponentView(compViewExpr);
            this.view.createMethod.addStmt(compViewExpr.set(o.importExpr(nestedComponentIdentifier)
                .callFn([
                ViewProperties.viewUtils,
                compileElement.injector,
                compileElement.appElement
            ]))
                .toDeclStmt());
        }
        compileElement.beforeChildren();
        this._addRootNodeAndProject(compileElement, ast.ngContentIndex, parent);
        templateVisitAll(this, ast.children, compileElement);
        compileElement.afterChildren(this.view.nodes.length - nodeIndex - 1);
        if (isPresent(compViewExpr)) {
            var codeGenContentNodes;
            if (this.view.component.type.isHost) {
                codeGenContentNodes = ViewProperties.projectableNodes;
            }
            else {
                codeGenContentNodes = o.literalArr(compileElement.contentNodesByNgContentIndex.map(nodes => createFlatArray(nodes)));
            }
            this.view.createMethod.addStmt(compViewExpr.callMethod('create', [codeGenContentNodes, o.NULL_EXPR]).toStmt());
        }
        return null;
    }
    visitEmbeddedTemplate(ast, parent) {
        var nodeIndex = this.view.nodes.length;
        var fieldName = `_anchor_${nodeIndex}`;
        this.view.fields.push(new o.ClassField(fieldName, o.importType(this.view.genConfig.renderTypes.renderComment), [o.StmtModifier.Private]));
        this.view.createMethod.addStmt(o.THIS_EXPR.prop(fieldName)
            .set(ViewProperties.renderer.callMethod('createTemplateAnchor', [
            this._getParentRenderNode(parent),
            this.view.createMethod.resetDebugInfoExpr(nodeIndex, ast)
        ]))
            .toStmt());
        var renderNode = o.THIS_EXPR.prop(fieldName);
        var templateVariableBindings = ast.vars.map(varAst => [varAst.value.length > 0 ? varAst.value : IMPLICIT_TEMPLATE_VAR, varAst.name]);
        var directives = ast.directives.map(directiveAst => directiveAst.directive);
        var compileElement = new CompileElement(parent, this.view, nodeIndex, renderNode, ast, null, directives, ast.providers, ast.hasViewContainer, true, {});
        this.view.nodes.push(compileElement);
        this.nestedViewCount++;
        var embeddedView = new CompileView(this.view.component, this.view.genConfig, this.view.pipeMetas, o.NULL_EXPR, this.view.viewIndex + this.nestedViewCount, compileElement, templateVariableBindings);
        this.nestedViewCount += buildView(embeddedView, ast.children, this.targetDependencies);
        compileElement.beforeChildren();
        this._addRootNodeAndProject(compileElement, ast.ngContentIndex, parent);
        compileElement.afterChildren(0);
        return null;
    }
    visitAttr(ast, ctx) { return null; }
    visitDirective(ast, ctx) { return null; }
    visitEvent(ast, eventTargetAndNames) {
        return null;
    }
    visitVariable(ast, ctx) { return null; }
    visitDirectiveProperty(ast, context) { return null; }
    visitElementProperty(ast, context) { return null; }
}
function _mergeHtmlAndDirectiveAttrs(declaredHtmlAttrs, directives) {
    var result = {};
    StringMapWrapper.forEach(declaredHtmlAttrs, (value, key) => { result[key] = value; });
    directives.forEach(directiveMeta => {
        StringMapWrapper.forEach(directiveMeta.hostAttributes, (value, name) => {
            var prevValue = result[name];
            result[name] = isPresent(prevValue) ? mergeAttributeValue(name, prevValue, value) : value;
        });
    });
    return mapToKeyValueArray(result);
}
function _readHtmlAttrs(attrs) {
    var htmlAttrs = {};
    attrs.forEach((ast) => { htmlAttrs[ast.name] = ast.value; });
    return htmlAttrs;
}
function _readHtmlAndDirectiveVariables(elementExportAsVars, directives, viewType) {
    var variables = {};
    var component = null;
    directives.forEach((directive) => {
        if (directive.directive.isComponent) {
            component = directive.directive;
        }
        directive.exportAsVars.forEach(varAst => { variables[varAst.name] = identifierToken(directive.directive.type); });
    });
    elementExportAsVars.forEach((varAst) => {
        variables[varAst.name] = isPresent(component) ? identifierToken(component.type) : null;
    });
    return variables;
}
function mergeAttributeValue(attrName, attrValue1, attrValue2) {
    if (attrName == CLASS_ATTR || attrName == STYLE_ATTR) {
        return `${attrValue1} ${attrValue2}`;
    }
    else {
        return attrValue2;
    }
}
function mapToKeyValueArray(data) {
    var entryArray = [];
    StringMapWrapper.forEach(data, (value, name) => { entryArray.push([name, value]); });
    // We need to sort to get a defined output order
    // for tests and for caching generated artifacts...
    ListWrapper.sort(entryArray, (entry1, entry2) => StringWrapper.compare(entry1[0], entry2[0]));
    var keyValueArray = [];
    entryArray.forEach((entry) => { keyValueArray.push([entry[0], entry[1]]); });
    return keyValueArray;
}
function createViewTopLevelStmts(view, targetStatements) {
    var nodeDebugInfosVar = o.NULL_EXPR;
    if (view.genConfig.genDebugInfo) {
        nodeDebugInfosVar = o.variable(`nodeDebugInfos_${view.component.type.name}${view.viewIndex}`);
        targetStatements.push(nodeDebugInfosVar
            .set(o.literalArr(view.nodes.map(createStaticNodeDebugInfo), new o.ArrayType(new o.ExternalType(Identifiers.StaticNodeDebugInfo), [o.TypeModifier.Const])))
            .toDeclStmt(null, [o.StmtModifier.Final]));
    }
    var renderCompTypeVar = o.variable(`renderType_${view.component.type.name}`);
    if (view.viewIndex === 0) {
        targetStatements.push(renderCompTypeVar.set(o.NULL_EXPR)
            .toDeclStmt(o.importType(Identifiers.RenderComponentType)));
    }
    var viewClass = createViewClass(view, renderCompTypeVar, nodeDebugInfosVar);
    targetStatements.push(viewClass);
    targetStatements.push(createViewFactory(view, viewClass, renderCompTypeVar));
}
function createStaticNodeDebugInfo(node) {
    var compileElement = node instanceof CompileElement ? node : null;
    var providerTokens = [];
    var componentToken = o.NULL_EXPR;
    var varTokenEntries = [];
    if (isPresent(compileElement)) {
        providerTokens = compileElement.getProviderTokens();
        if (isPresent(compileElement.component)) {
            componentToken = createDiTokenExpression(identifierToken(compileElement.component.type));
        }
        StringMapWrapper.forEach(compileElement.variableTokens, (token, varName) => {
            varTokenEntries.push([varName, isPresent(token) ? createDiTokenExpression(token) : o.NULL_EXPR]);
        });
    }
    return o.importExpr(Identifiers.StaticNodeDebugInfo)
        .instantiate([
        o.literalArr(providerTokens, new o.ArrayType(o.DYNAMIC_TYPE, [o.TypeModifier.Const])),
        componentToken,
        o.literalMap(varTokenEntries, new o.MapType(o.DYNAMIC_TYPE, [o.TypeModifier.Const]))
    ], o.importType(Identifiers.StaticNodeDebugInfo, null, [o.TypeModifier.Const]));
}
function createViewClass(view, renderCompTypeVar, nodeDebugInfosVar) {
    var emptyTemplateVariableBindings = view.templateVariableBindings.map((entry) => [entry[0], o.NULL_EXPR]);
    var viewConstructorArgs = [
        new o.FnParam(ViewConstructorVars.viewUtils.name, o.importType(Identifiers.ViewUtils)),
        new o.FnParam(ViewConstructorVars.parentInjector.name, o.importType(Identifiers.Injector)),
        new o.FnParam(ViewConstructorVars.declarationEl.name, o.importType(Identifiers.AppElement))
    ];
    var superConstructorArgs = [
        o.variable(view.className),
        renderCompTypeVar,
        ViewTypeEnum.fromValue(view.viewType),
        o.literalMap(emptyTemplateVariableBindings),
        ViewConstructorVars.viewUtils,
        ViewConstructorVars.parentInjector,
        ViewConstructorVars.declarationEl,
        ChangeDetectionStrategyEnum.fromValue(getChangeDetectionMode(view)),
        o.literal(view.literalArrayCount),
        o.literal(view.literalMapCount),
    ];
    if (view.genConfig.genDebugInfo) {
        superConstructorArgs.push(nodeDebugInfosVar);
    }
    var viewConstructor = new o.ClassMethod(null, viewConstructorArgs, [o.SUPER_EXPR.callFn(superConstructorArgs).toStmt()]);
    var viewMethods = [
        new o.ClassMethod('createInternal', [new o.FnParam(rootSelectorVar.name, o.DYNAMIC_TYPE)], generateCreateMethod(view), o.importType(Identifiers.AppElement)),
        new o.ClassMethod('injectorGetInternal', [
            new o.FnParam(InjectMethodVars.token.name, o.DYNAMIC_TYPE),
            // Note: Can't use o.INT_TYPE here as the method in AppView uses number
            new o.FnParam(InjectMethodVars.requestNodeIndex.name, o.NUMBER_TYPE),
            new o.FnParam(InjectMethodVars.notFoundResult.name, o.DYNAMIC_TYPE)
        ], addReturnValuefNotEmpty(view.injectorGetMethod.finish(), InjectMethodVars.notFoundResult), o.DYNAMIC_TYPE),
        new o.ClassMethod('detectChangesInternal', [new o.FnParam(DetectChangesVars.throwOnChange.name, o.BOOL_TYPE)], generateDetectChangesMethod(view)),
        new o.ClassMethod('dirtyParentQueriesInternal', [], view.dirtyParentQueriesMethod.finish()),
        new o.ClassMethod('destroyInternal', [], view.destroyMethod.finish())
    ].concat(view.eventHandlerMethods);
    var superClass = view.genConfig.genDebugInfo ? Identifiers.DebugAppView : Identifiers.AppView;
    var viewClass = new o.ClassStmt(view.className, o.importExpr(superClass, [getContextType(view)]), view.fields, view.getters, viewConstructor, viewMethods.filter((method) => method.body.length > 0));
    return viewClass;
}
function createViewFactory(view, viewClass, renderCompTypeVar) {
    var viewFactoryArgs = [
        new o.FnParam(ViewConstructorVars.viewUtils.name, o.importType(Identifiers.ViewUtils)),
        new o.FnParam(ViewConstructorVars.parentInjector.name, o.importType(Identifiers.Injector)),
        new o.FnParam(ViewConstructorVars.declarationEl.name, o.importType(Identifiers.AppElement))
    ];
    var initRenderCompTypeStmts = [];
    var templateUrlInfo;
    if (view.component.template.templateUrl == view.component.type.moduleUrl) {
        templateUrlInfo =
            `${view.component.type.moduleUrl} class ${view.component.type.name} - inline template`;
    }
    else {
        templateUrlInfo = view.component.template.templateUrl;
    }
    if (view.viewIndex === 0) {
        initRenderCompTypeStmts = [
            new o.IfStmt(renderCompTypeVar.identical(o.NULL_EXPR), [
                renderCompTypeVar.set(ViewConstructorVars
                    .viewUtils.callMethod('createRenderComponentType', [
                    o.literal(templateUrlInfo),
                    o.literal(view.component
                        .template.ngContentSelectors.length),
                    ViewEncapsulationEnum
                        .fromValue(view.component.template.encapsulation),
                    view.styles
                ]))
                    .toStmt()
            ])
        ];
    }
    return o.fn(viewFactoryArgs, initRenderCompTypeStmts.concat([
        new o.ReturnStatement(o.variable(viewClass.name)
            .instantiate(viewClass.constructorMethod.params.map((param) => o.variable(param.name))))
    ]), o.importType(Identifiers.AppView, [getContextType(view)]))
        .toDeclStmt(view.viewFactory.name, [o.StmtModifier.Final]);
}
function generateCreateMethod(view) {
    var parentRenderNodeExpr = o.NULL_EXPR;
    var parentRenderNodeStmts = [];
    if (view.viewType === ViewType.COMPONENT) {
        parentRenderNodeExpr = ViewProperties.renderer.callMethod('createViewRoot', [o.THIS_EXPR.prop('declarationAppElement').prop('nativeElement')]);
        parentRenderNodeStmts = [
            parentRenderNodeVar.set(parentRenderNodeExpr)
                .toDeclStmt(o.importType(view.genConfig.renderTypes.renderNode), [o.StmtModifier.Final])
        ];
    }
    var resultExpr;
    if (view.viewType === ViewType.HOST) {
        resultExpr = view.nodes[0].appElement;
    }
    else {
        resultExpr = o.NULL_EXPR;
    }
    return parentRenderNodeStmts.concat(view.createMethod.finish())
        .concat([
        o.THIS_EXPR.callMethod('init', [
            createFlatArray(view.rootNodesOrAppElements),
            o.literalArr(view.nodes.map(node => node.renderNode)),
            o.literalArr(view.disposables),
            o.literalArr(view.subscriptions)
        ])
            .toStmt(),
        new o.ReturnStatement(resultExpr)
    ]);
}
function generateDetectChangesMethod(view) {
    var stmts = [];
    if (view.detectChangesInInputsMethod.isEmpty() && view.updateContentQueriesMethod.isEmpty() &&
        view.afterContentLifecycleCallbacksMethod.isEmpty() &&
        view.detectChangesRenderPropertiesMethod.isEmpty() &&
        view.updateViewQueriesMethod.isEmpty() && view.afterViewLifecycleCallbacksMethod.isEmpty()) {
        return stmts;
    }
    ListWrapper.addAll(stmts, view.detectChangesInInputsMethod.finish());
    stmts.push(o.THIS_EXPR.callMethod('detectContentChildrenChanges', [DetectChangesVars.throwOnChange])
        .toStmt());
    var afterContentStmts = view.updateContentQueriesMethod.finish().concat(view.afterContentLifecycleCallbacksMethod.finish());
    if (afterContentStmts.length > 0) {
        stmts.push(new o.IfStmt(o.not(DetectChangesVars.throwOnChange), afterContentStmts));
    }
    ListWrapper.addAll(stmts, view.detectChangesRenderPropertiesMethod.finish());
    stmts.push(o.THIS_EXPR.callMethod('detectViewChildrenChanges', [DetectChangesVars.throwOnChange])
        .toStmt());
    var afterViewStmts = view.updateViewQueriesMethod.finish().concat(view.afterViewLifecycleCallbacksMethod.finish());
    if (afterViewStmts.length > 0) {
        stmts.push(new o.IfStmt(o.not(DetectChangesVars.throwOnChange), afterViewStmts));
    }
    var varStmts = [];
    var readVars = o.findReadVarNames(stmts);
    if (SetWrapper.has(readVars, DetectChangesVars.changed.name)) {
        varStmts.push(DetectChangesVars.changed.set(o.literal(true)).toDeclStmt(o.BOOL_TYPE));
    }
    if (SetWrapper.has(readVars, DetectChangesVars.changes.name)) {
        varStmts.push(DetectChangesVars.changes.set(o.NULL_EXPR)
            .toDeclStmt(new o.MapType(o.importType(Identifiers.SimpleChange))));
    }
    if (SetWrapper.has(readVars, DetectChangesVars.valUnwrapper.name)) {
        varStmts.push(DetectChangesVars.valUnwrapper.set(o.importExpr(Identifiers.ValueUnwrapper).instantiate([]))
            .toDeclStmt(null, [o.StmtModifier.Final]));
    }
    return varStmts.concat(stmts);
}
function addReturnValuefNotEmpty(statements, value) {
    if (statements.length > 0) {
        return statements.concat([new o.ReturnStatement(value)]);
    }
    else {
        return statements;
    }
}
function getContextType(view) {
    var typeMeta = view.component.type;
    return typeMeta.isHost ? o.DYNAMIC_TYPE : o.importType(typeMeta);
}
function getChangeDetectionMode(view) {
    var mode;
    if (view.viewType === ViewType.COMPONENT) {
        mode = isDefaultChangeDetectionStrategy(view.component.changeDetection) ?
            ChangeDetectionStrategy.CheckAlways :
            ChangeDetectionStrategy.CheckOnce;
    }
    else {
        mode = ChangeDetectionStrategy.CheckAlways;
    }
    return mode;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19idWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1FSjZEcTMyeC50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3ZpZXdfY29tcGlsZXIvdmlld19idWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEVBQUMsU0FBUyxFQUFFLGFBQWEsRUFBQyxNQUFNLDBCQUEwQjtPQUMxRCxFQUFDLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUMsTUFBTSxnQ0FBZ0M7T0FFakYsS0FBSyxDQUFDLE1BQU0sc0JBQXNCO09BQ2xDLEVBQUMsV0FBVyxFQUFFLGVBQWUsRUFBQyxNQUFNLGdCQUFnQjtPQUNwRCxFQUNMLG1CQUFtQixFQUNuQixnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLFlBQVksRUFDWixxQkFBcUIsRUFDckIsMkJBQTJCLEVBQzNCLGNBQWMsRUFDZixNQUFNLGFBQWE7T0FDYixFQUNMLHVCQUF1QixFQUN2QixnQ0FBZ0MsRUFDakMsTUFBTSxxREFBcUQ7T0FFckQsRUFBQyxXQUFXLEVBQUMsTUFBTSxnQkFBZ0I7T0FDbkMsRUFBQyxjQUFjLEVBQUUsV0FBVyxFQUFDLE1BQU0sbUJBQW1CO09BRXRELEVBY0wsZ0JBQWdCLEVBR2pCLE1BQU0saUJBQWlCO09BRWpCLEVBQUMsa0JBQWtCLEVBQUUsZUFBZSxFQUFFLHVCQUF1QixFQUFDLE1BQU0sUUFBUTtPQUU1RSxFQUFDLFFBQVEsRUFBQyxNQUFNLG9DQUFvQztPQUNwRCxFQUFDLGlCQUFpQixFQUFDLE1BQU0saUNBQWlDO09BRTFELEVBQ0wseUJBQXlCLEVBRzFCLE1BQU0scUJBQXFCO0FBRTVCLE1BQU0scUJBQXFCLEdBQUcsWUFBWSxDQUFDO0FBQzNDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQztBQUMzQixNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUM7QUFFM0IsSUFBSSxtQkFBbUIsR0FB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Q25DLHVCQUF1QixDQUFDLFNBQVMsQ0FBQztJQUMvQyxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixJQUFJLEdBQUcsdUJBQXVCLENBQUMsV0FBVyxDQUFDO0lBQzdDLENBQUM7SUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNQcmVzZW50LCBTdHJpbmdXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlciwgU2V0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuaW1wb3J0ICogYXMgbyBmcm9tICcuLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge0lkZW50aWZpZXJzLCBpZGVudGlmaWVyVG9rZW59IGZyb20gJy4uL2lkZW50aWZpZXJzJztcbmltcG9ydCB7XG4gIFZpZXdDb25zdHJ1Y3RvclZhcnMsXG4gIEluamVjdE1ldGhvZFZhcnMsXG4gIERldGVjdENoYW5nZXNWYXJzLFxuICBWaWV3VHlwZUVudW0sXG4gIFZpZXdFbmNhcHN1bGF0aW9uRW51bSxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3lFbnVtLFxuICBWaWV3UHJvcGVydGllc1xufSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3lcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcblxuaW1wb3J0IHtDb21waWxlVmlld30gZnJvbSAnLi9jb21waWxlX3ZpZXcnO1xuaW1wb3J0IHtDb21waWxlRWxlbWVudCwgQ29tcGlsZU5vZGV9IGZyb20gJy4vY29tcGlsZV9lbGVtZW50JztcblxuaW1wb3J0IHtcbiAgVGVtcGxhdGVBc3QsXG4gIFRlbXBsYXRlQXN0VmlzaXRvcixcbiAgTmdDb250ZW50QXN0LFxuICBFbWJlZGRlZFRlbXBsYXRlQXN0LFxuICBFbGVtZW50QXN0LFxuICBWYXJpYWJsZUFzdCxcbiAgQm91bmRFdmVudEFzdCxcbiAgQm91bmRFbGVtZW50UHJvcGVydHlBc3QsXG4gIEF0dHJBc3QsXG4gIEJvdW5kVGV4dEFzdCxcbiAgVGV4dEFzdCxcbiAgRGlyZWN0aXZlQXN0LFxuICBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0LFxuICB0ZW1wbGF0ZVZpc2l0QWxsLFxuICBQcm9wZXJ0eUJpbmRpbmdUeXBlLFxuICBQcm92aWRlckFzdFxufSBmcm9tICcuLi90ZW1wbGF0ZV9hc3QnO1xuXG5pbXBvcnQge2dldFZpZXdGYWN0b3J5TmFtZSwgY3JlYXRlRmxhdEFycmF5LCBjcmVhdGVEaVRva2VuRXhwcmVzc2lvbn0gZnJvbSAnLi91dGlsJztcblxuaW1wb3J0IHtWaWV3VHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfdHlwZSc7XG5pbXBvcnQge1ZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS92aWV3JztcblxuaW1wb3J0IHtcbiAgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSxcbiAgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICBDb21waWxlVG9rZW5NZXRhZGF0YVxufSBmcm9tICcuLi9jb21waWxlX21ldGFkYXRhJztcblxuY29uc3QgSU1QTElDSVRfVEVNUExBVEVfVkFSID0gJ1xcJGltcGxpY2l0JztcbmNvbnN0IENMQVNTX0FUVFIgPSAnY2xhc3MnO1xuY29uc3QgU1RZTEVfQVRUUiA9ICdzdHlsZSc7XG5cbnZhciBwYXJlbnRSZW5kZXJOb2RlVmFyID0gby52YXJpYWJsZSgncGFyZW50UmVuZGVyTm9kZScpO1xudmFyIHJvb3RTZWxlY3RvclZhciA9IG8udmFyaWFibGUoJ3Jvb3RTZWxlY3RvcicpO1xuXG5leHBvcnQgY2xhc3MgVmlld0NvbXBpbGVEZXBlbmRlbmN5IHtcbiAgY29uc3RydWN0b3IocHVibGljIGNvbXA6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSxcbiAgICAgICAgICAgICAgcHVibGljIGZhY3RvcnlQbGFjZWhvbGRlcjogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSkge31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkVmlldyh2aWV3OiBDb21waWxlVmlldywgdGVtcGxhdGU6IFRlbXBsYXRlQXN0W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldERlcGVuZGVuY2llczogVmlld0NvbXBpbGVEZXBlbmRlbmN5W10pOiBudW1iZXIge1xuICB2YXIgYnVpbGRlclZpc2l0b3IgPSBuZXcgVmlld0J1aWxkZXJWaXNpdG9yKHZpZXcsIHRhcmdldERlcGVuZGVuY2llcyk7XG4gIHRlbXBsYXRlVmlzaXRBbGwoYnVpbGRlclZpc2l0b3IsIHRlbXBsYXRlLCB2aWV3LmRlY2xhcmF0aW9uRWxlbWVudC5pc051bGwoKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5kZWNsYXJhdGlvbkVsZW1lbnQgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcuZGVjbGFyYXRpb25FbGVtZW50LnBhcmVudCk7XG4gIHJldHVybiBidWlsZGVyVmlzaXRvci5uZXN0ZWRWaWV3Q291bnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5pc2hWaWV3KHZpZXc6IENvbXBpbGVWaWV3LCB0YXJnZXRTdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdKSB7XG4gIHZpZXcuYWZ0ZXJOb2RlcygpO1xuICBjcmVhdGVWaWV3VG9wTGV2ZWxTdG10cyh2aWV3LCB0YXJnZXRTdGF0ZW1lbnRzKTtcbiAgdmlldy5ub2Rlcy5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBDb21waWxlRWxlbWVudCAmJiBpc1ByZXNlbnQobm9kZS5lbWJlZGRlZFZpZXcpKSB7XG4gICAgICBmaW5pc2hWaWV3KG5vZGUuZW1iZWRkZWRWaWV3LCB0YXJnZXRTdGF0ZW1lbnRzKTtcbiAgICB9XG4gIH0pO1xufVxuXG5jbGFzcyBWaWV3QnVpbGRlclZpc2l0b3IgaW1wbGVtZW50cyBUZW1wbGF0ZUFzdFZpc2l0b3Ige1xuICBuZXN0ZWRWaWV3Q291bnQ6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IocHVibGljIHZpZXc6IENvbXBpbGVWaWV3LCBwdWJsaWMgdGFyZ2V0RGVwZW5kZW5jaWVzOiBWaWV3Q29tcGlsZURlcGVuZGVuY3lbXSkge31cblxuICBwcml2YXRlIF9pc1Jvb3ROb2RlKHBhcmVudDogQ29tcGlsZUVsZW1lbnQpOiBib29sZWFuIHsgcmV0dXJuIHBhcmVudC52aWV3ICE9PSB0aGlzLnZpZXc7IH1cblxuICBwcml2YXRlIF9hZGRSb290Tm9kZUFuZFByb2plY3Qobm9kZTogQ29tcGlsZU5vZGUsIG5nQ29udGVudEluZGV4OiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IENvbXBpbGVFbGVtZW50KSB7XG4gICAgdmFyIHZjQXBwRWwgPVxuICAgICAgICAobm9kZSBpbnN0YW5jZW9mIENvbXBpbGVFbGVtZW50ICYmIG5vZGUuaGFzVmlld0NvbnRhaW5lcikgPyBub2RlLmFwcEVsZW1lbnQgOiBudWxsO1xuICAgIGlmICh0aGlzLl9pc1Jvb3ROb2RlKHBhcmVudCkpIHtcbiAgICAgIC8vIHN0b3JlIGFwcEVsZW1lbnQgYXMgcm9vdCBub2RlIG9ubHkgZm9yIFZpZXdDb250YWluZXJzXG4gICAgICBpZiAodGhpcy52aWV3LnZpZXdUeXBlICE9PSBWaWV3VHlwZS5DT01QT05FTlQpIHtcbiAgICAgICAgdGhpcy52aWV3LnJvb3ROb2Rlc09yQXBwRWxlbWVudHMucHVzaChpc1ByZXNlbnQodmNBcHBFbCkgPyB2Y0FwcEVsIDogbm9kZS5yZW5kZXJOb2RlKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChwYXJlbnQuY29tcG9uZW50KSAmJiBpc1ByZXNlbnQobmdDb250ZW50SW5kZXgpKSB7XG4gICAgICBwYXJlbnQuYWRkQ29udGVudE5vZGUobmdDb250ZW50SW5kZXgsIGlzUHJlc2VudCh2Y0FwcEVsKSA/IHZjQXBwRWwgOiBub2RlLnJlbmRlck5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2dldFBhcmVudFJlbmRlck5vZGUocGFyZW50OiBDb21waWxlRWxlbWVudCk6IG8uRXhwcmVzc2lvbiB7XG4gICAgaWYgKHRoaXMuX2lzUm9vdE5vZGUocGFyZW50KSkge1xuICAgICAgaWYgKHRoaXMudmlldy52aWV3VHlwZSA9PT0gVmlld1R5cGUuQ09NUE9ORU5UKSB7XG4gICAgICAgIHJldHVybiBwYXJlbnRSZW5kZXJOb2RlVmFyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcm9vdCBub2RlIG9mIGFuIGVtYmVkZGVkL2hvc3Qgdmlld1xuICAgICAgICByZXR1cm4gby5OVUxMX0VYUFI7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBpc1ByZXNlbnQocGFyZW50LmNvbXBvbmVudCkgJiZcbiAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5jb21wb25lbnQudGVtcGxhdGUuZW5jYXBzdWxhdGlvbiAhPT0gVmlld0VuY2Fwc3VsYXRpb24uTmF0aXZlID9cbiAgICAgICAgICAgICAgICAgby5OVUxMX0VYUFIgOlxuICAgICAgICAgICAgICAgICBwYXJlbnQucmVuZGVyTm9kZTtcbiAgICB9XG4gIH1cblxuICB2aXNpdEJvdW5kVGV4dChhc3Q6IEJvdW5kVGV4dEFzdCwgcGFyZW50OiBDb21waWxlRWxlbWVudCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX3Zpc2l0VGV4dChhc3QsICcnLCBhc3QubmdDb250ZW50SW5kZXgsIHBhcmVudCk7XG4gIH1cbiAgdmlzaXRUZXh0KGFzdDogVGV4dEFzdCwgcGFyZW50OiBDb21waWxlRWxlbWVudCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX3Zpc2l0VGV4dChhc3QsIGFzdC52YWx1ZSwgYXN0Lm5nQ29udGVudEluZGV4LCBwYXJlbnQpO1xuICB9XG4gIHByaXZhdGUgX3Zpc2l0VGV4dChhc3Q6IFRlbXBsYXRlQXN0LCB2YWx1ZTogc3RyaW5nLCBuZ0NvbnRlbnRJbmRleDogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBDb21waWxlRWxlbWVudCk6IG8uRXhwcmVzc2lvbiB7XG4gICAgdmFyIGZpZWxkTmFtZSA9IGBfdGV4dF8ke3RoaXMudmlldy5ub2Rlcy5sZW5ndGh9YDtcbiAgICB0aGlzLnZpZXcuZmllbGRzLnB1c2gobmV3IG8uQ2xhc3NGaWVsZChmaWVsZE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5pbXBvcnRUeXBlKHRoaXMudmlldy5nZW5Db25maWcucmVuZGVyVHlwZXMucmVuZGVyVGV4dCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW28uU3RtdE1vZGlmaWVyLlByaXZhdGVdKSk7XG4gICAgdmFyIHJlbmRlck5vZGUgPSBvLlRISVNfRVhQUi5wcm9wKGZpZWxkTmFtZSk7XG4gICAgdmFyIGNvbXBpbGVOb2RlID0gbmV3IENvbXBpbGVOb2RlKHBhcmVudCwgdGhpcy52aWV3LCB0aGlzLnZpZXcubm9kZXMubGVuZ3RoLCByZW5kZXJOb2RlLCBhc3QpO1xuICAgIHZhciBjcmVhdGVSZW5kZXJOb2RlID1cbiAgICAgICAgby5USElTX0VYUFIucHJvcChmaWVsZE5hbWUpXG4gICAgICAgICAgICAuc2V0KFZpZXdQcm9wZXJ0aWVzLnJlbmRlcmVyLmNhbGxNZXRob2QoXG4gICAgICAgICAgICAgICAgJ2NyZWF0ZVRleHQnLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgIHRoaXMuX2dldFBhcmVudFJlbmRlck5vZGUocGFyZW50KSxcbiAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbCh2YWx1ZSksXG4gICAgICAgICAgICAgICAgICB0aGlzLnZpZXcuY3JlYXRlTWV0aG9kLnJlc2V0RGVidWdJbmZvRXhwcih0aGlzLnZpZXcubm9kZXMubGVuZ3RoLCBhc3QpXG4gICAgICAgICAgICAgICAgXSkpXG4gICAgICAgICAgICAudG9TdG10KCk7XG4gICAgdGhpcy52aWV3Lm5vZGVzLnB1c2goY29tcGlsZU5vZGUpO1xuICAgIHRoaXMudmlldy5jcmVhdGVNZXRob2QuYWRkU3RtdChjcmVhdGVSZW5kZXJOb2RlKTtcbiAgICB0aGlzLl9hZGRSb290Tm9kZUFuZFByb2plY3QoY29tcGlsZU5vZGUsIG5nQ29udGVudEluZGV4LCBwYXJlbnQpO1xuICAgIHJldHVybiByZW5kZXJOb2RlO1xuICB9XG5cbiAgdmlzaXROZ0NvbnRlbnQoYXN0OiBOZ0NvbnRlbnRBc3QsIHBhcmVudDogQ29tcGlsZUVsZW1lbnQpOiBhbnkge1xuICAgIC8vIHRoZSBwcm9qZWN0ZWQgbm9kZXMgb3JpZ2luYXRlIGZyb20gYSBkaWZmZXJlbnQgdmlldywgc28gd2UgZG9uJ3RcbiAgICAvLyBoYXZlIGRlYnVnIGluZm9ybWF0aW9uIGZvciB0aGVtLi4uXG4gICAgdGhpcy52aWV3LmNyZWF0ZU1ldGhvZC5yZXNldERlYnVnSW5mbyhudWxsLCBhc3QpO1xuICAgIHZhciBwYXJlbnRSZW5kZXJOb2RlID0gdGhpcy5fZ2V0UGFyZW50UmVuZGVyTm9kZShwYXJlbnQpO1xuICAgIHZhciBub2Rlc0V4cHJlc3Npb24gPSBWaWV3UHJvcGVydGllcy5wcm9qZWN0YWJsZU5vZGVzLmtleShcbiAgICAgICAgby5saXRlcmFsKGFzdC5pbmRleCksXG4gICAgICAgIG5ldyBvLkFycmF5VHlwZShvLmltcG9ydFR5cGUodGhpcy52aWV3LmdlbkNvbmZpZy5yZW5kZXJUeXBlcy5yZW5kZXJOb2RlKSkpO1xuICAgIGlmIChwYXJlbnRSZW5kZXJOb2RlICE9PSBvLk5VTExfRVhQUikge1xuICAgICAgdGhpcy52aWV3LmNyZWF0ZU1ldGhvZC5hZGRTdG10KFxuICAgICAgICAgIFZpZXdQcm9wZXJ0aWVzLnJlbmRlcmVyLmNhbGxNZXRob2QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3Byb2plY3ROb2RlcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50UmVuZGVyTm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5mbGF0dGVuTmVzdGVkVmlld1JlbmRlck5vZGVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYWxsRm4oW25vZGVzRXhwcmVzc2lvbl0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgLnRvU3RtdCgpKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2lzUm9vdE5vZGUocGFyZW50KSkge1xuICAgICAgaWYgKHRoaXMudmlldy52aWV3VHlwZSAhPT0gVmlld1R5cGUuQ09NUE9ORU5UKSB7XG4gICAgICAgIC8vIHN0b3JlIHJvb3Qgbm9kZXMgb25seSBmb3IgZW1iZWRkZWQvaG9zdCB2aWV3c1xuICAgICAgICB0aGlzLnZpZXcucm9vdE5vZGVzT3JBcHBFbGVtZW50cy5wdXNoKG5vZGVzRXhwcmVzc2lvbik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpc1ByZXNlbnQocGFyZW50LmNvbXBvbmVudCkgJiYgaXNQcmVzZW50KGFzdC5uZ0NvbnRlbnRJbmRleCkpIHtcbiAgICAgICAgcGFyZW50LmFkZENvbnRlbnROb2RlKGFzdC5uZ0NvbnRlbnRJbmRleCwgbm9kZXNFeHByZXNzaW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdEVsZW1lbnQoYXN0OiBFbGVtZW50QXN0LCBwYXJlbnQ6IENvbXBpbGVFbGVtZW50KTogYW55IHtcbiAgICB2YXIgbm9kZUluZGV4ID0gdGhpcy52aWV3Lm5vZGVzLmxlbmd0aDtcbiAgICB2YXIgY3JlYXRlUmVuZGVyTm9kZUV4cHI7XG4gICAgdmFyIGRlYnVnQ29udGV4dEV4cHIgPSB0aGlzLnZpZXcuY3JlYXRlTWV0aG9kLnJlc2V0RGVidWdJbmZvRXhwcihub2RlSW5kZXgsIGFzdCk7XG4gICAgaWYgKG5vZGVJbmRleCA9PT0gMCAmJiB0aGlzLnZpZXcudmlld1R5cGUgPT09IFZpZXdUeXBlLkhPU1QpIHtcbiAgICAgIGNyZWF0ZVJlbmRlck5vZGVFeHByID0gby5USElTX0VYUFIuY2FsbE1ldGhvZChcbiAgICAgICAgICAnc2VsZWN0T3JDcmVhdGVIb3N0RWxlbWVudCcsIFtvLmxpdGVyYWwoYXN0Lm5hbWUpLCByb290U2VsZWN0b3JWYXIsIGRlYnVnQ29udGV4dEV4cHJdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3JlYXRlUmVuZGVyTm9kZUV4cHIgPSBWaWV3UHJvcGVydGllcy5yZW5kZXJlci5jYWxsTWV0aG9kKFxuICAgICAgICAgICdjcmVhdGVFbGVtZW50JyxcbiAgICAgICAgICBbdGhpcy5fZ2V0UGFyZW50UmVuZGVyTm9kZShwYXJlbnQpLCBvLmxpdGVyYWwoYXN0Lm5hbWUpLCBkZWJ1Z0NvbnRleHRFeHByXSk7XG4gICAgfVxuICAgIHZhciBmaWVsZE5hbWUgPSBgX2VsXyR7bm9kZUluZGV4fWA7XG4gICAgdGhpcy52aWV3LmZpZWxkcy5wdXNoKFxuICAgICAgICBuZXcgby5DbGFzc0ZpZWxkKGZpZWxkTmFtZSwgby5pbXBvcnRUeXBlKHRoaXMudmlldy5nZW5Db25maWcucmVuZGVyVHlwZXMucmVuZGVyRWxlbWVudCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgW28uU3RtdE1vZGlmaWVyLlByaXZhdGVdKSk7XG4gICAgdGhpcy52aWV3LmNyZWF0ZU1ldGhvZC5hZGRTdG10KG8uVEhJU19FWFBSLnByb3AoZmllbGROYW1lKS5zZXQoY3JlYXRlUmVuZGVyTm9kZUV4cHIpLnRvU3RtdCgpKTtcblxuICAgIHZhciByZW5kZXJOb2RlID0gby5USElTX0VYUFIucHJvcChmaWVsZE5hbWUpO1xuXG4gICAgdmFyIGRpcmVjdGl2ZXMgPSBhc3QuZGlyZWN0aXZlcy5tYXAoZGlyZWN0aXZlQXN0ID0+IGRpcmVjdGl2ZUFzdC5kaXJlY3RpdmUpO1xuICAgIHZhciB2YXJpYWJsZXMgPVxuICAgICAgICBfcmVhZEh0bWxBbmREaXJlY3RpdmVWYXJpYWJsZXMoYXN0LmV4cG9ydEFzVmFycywgYXN0LmRpcmVjdGl2ZXMsIHRoaXMudmlldy52aWV3VHlwZSk7XG4gICAgdmFyIGNvbXBvbmVudCA9IGRpcmVjdGl2ZXMuZmluZChkaXJlY3RpdmUgPT4gZGlyZWN0aXZlLmlzQ29tcG9uZW50KTtcbiAgICB2YXIgaHRtbEF0dHJzID0gX3JlYWRIdG1sQXR0cnMoYXN0LmF0dHJzKTtcbiAgICB2YXIgYXR0ck5hbWVBbmRWYWx1ZXMgPSBfbWVyZ2VIdG1sQW5kRGlyZWN0aXZlQXR0cnMoaHRtbEF0dHJzLCBkaXJlY3RpdmVzKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGF0dHJOYW1lQW5kVmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgYXR0ck5hbWUgPSBhdHRyTmFtZUFuZFZhbHVlc1tpXVswXTtcbiAgICAgIHZhciBhdHRyVmFsdWUgPSBhdHRyTmFtZUFuZFZhbHVlc1tpXVsxXTtcbiAgICAgIHRoaXMudmlldy5jcmVhdGVNZXRob2QuYWRkU3RtdChcbiAgICAgICAgICBWaWV3UHJvcGVydGllcy5yZW5kZXJlci5jYWxsTWV0aG9kKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzZXRFbGVtZW50QXR0cmlidXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbcmVuZGVyTm9kZSwgby5saXRlcmFsKGF0dHJOYW1lKSwgby5saXRlcmFsKGF0dHJWYWx1ZSldKVxuICAgICAgICAgICAgICAudG9TdG10KCkpO1xuICAgIH1cbiAgICB2YXIgY29tcGlsZUVsZW1lbnQgPVxuICAgICAgICBuZXcgQ29tcGlsZUVsZW1lbnQocGFyZW50LCB0aGlzLnZpZXcsIG5vZGVJbmRleCwgcmVuZGVyTm9kZSwgYXN0LCBjb21wb25lbnQsIGRpcmVjdGl2ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBhc3QucHJvdmlkZXJzLCBhc3QuaGFzVmlld0NvbnRhaW5lciwgZmFsc2UsIHZhcmlhYmxlcyk7XG4gICAgdGhpcy52aWV3Lm5vZGVzLnB1c2goY29tcGlsZUVsZW1lbnQpO1xuICAgIHZhciBjb21wVmlld0V4cHI6IG8uUmVhZFZhckV4cHIgPSBudWxsO1xuICAgIGlmIChpc1ByZXNlbnQoY29tcG9uZW50KSkge1xuICAgICAgdmFyIG5lc3RlZENvbXBvbmVudElkZW50aWZpZXIgPVxuICAgICAgICAgIG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKHtuYW1lOiBnZXRWaWV3RmFjdG9yeU5hbWUoY29tcG9uZW50LCAwKX0pO1xuICAgICAgdGhpcy50YXJnZXREZXBlbmRlbmNpZXMucHVzaChuZXcgVmlld0NvbXBpbGVEZXBlbmRlbmN5KGNvbXBvbmVudCwgbmVzdGVkQ29tcG9uZW50SWRlbnRpZmllcikpO1xuICAgICAgY29tcFZpZXdFeHByID0gby52YXJpYWJsZShgY29tcFZpZXdfJHtub2RlSW5kZXh9YCk7XG4gICAgICBjb21waWxlRWxlbWVudC5zZXRDb21wb25lbnRWaWV3KGNvbXBWaWV3RXhwcik7XG4gICAgICB0aGlzLnZpZXcuY3JlYXRlTWV0aG9kLmFkZFN0bXQoY29tcFZpZXdFeHByLnNldChvLmltcG9ydEV4cHIobmVzdGVkQ29tcG9uZW50SWRlbnRpZmllcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2FsbEZuKFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZpZXdQcm9wZXJ0aWVzLnZpZXdVdGlscyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVFbGVtZW50LmluamVjdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZUVsZW1lbnQuYXBwRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudG9EZWNsU3RtdCgpKTtcbiAgICB9XG4gICAgY29tcGlsZUVsZW1lbnQuYmVmb3JlQ2hpbGRyZW4oKTtcbiAgICB0aGlzLl9hZGRSb290Tm9kZUFuZFByb2plY3QoY29tcGlsZUVsZW1lbnQsIGFzdC5uZ0NvbnRlbnRJbmRleCwgcGFyZW50KTtcbiAgICB0ZW1wbGF0ZVZpc2l0QWxsKHRoaXMsIGFzdC5jaGlsZHJlbiwgY29tcGlsZUVsZW1lbnQpO1xuICAgIGNvbXBpbGVFbGVtZW50LmFmdGVyQ2hpbGRyZW4odGhpcy52aWV3Lm5vZGVzLmxlbmd0aCAtIG5vZGVJbmRleCAtIDEpO1xuXG4gICAgaWYgKGlzUHJlc2VudChjb21wVmlld0V4cHIpKSB7XG4gICAgICB2YXIgY29kZUdlbkNvbnRlbnROb2RlcztcbiAgICAgIGlmICh0aGlzLnZpZXcuY29tcG9uZW50LnR5cGUuaXNIb3N0KSB7XG4gICAgICAgIGNvZGVHZW5Db250ZW50Tm9kZXMgPSBWaWV3UHJvcGVydGllcy5wcm9qZWN0YWJsZU5vZGVzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29kZUdlbkNvbnRlbnROb2RlcyA9IG8ubGl0ZXJhbEFycihcbiAgICAgICAgICAgIGNvbXBpbGVFbGVtZW50LmNvbnRlbnROb2Rlc0J5TmdDb250ZW50SW5kZXgubWFwKG5vZGVzID0+IGNyZWF0ZUZsYXRBcnJheShub2RlcykpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMudmlldy5jcmVhdGVNZXRob2QuYWRkU3RtdChcbiAgICAgICAgICBjb21wVmlld0V4cHIuY2FsbE1ldGhvZCgnY3JlYXRlJywgW2NvZGVHZW5Db250ZW50Tm9kZXMsIG8uTlVMTF9FWFBSXSkudG9TdG10KCkpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0RW1iZWRkZWRUZW1wbGF0ZShhc3Q6IEVtYmVkZGVkVGVtcGxhdGVBc3QsIHBhcmVudDogQ29tcGlsZUVsZW1lbnQpOiBhbnkge1xuICAgIHZhciBub2RlSW5kZXggPSB0aGlzLnZpZXcubm9kZXMubGVuZ3RoO1xuICAgIHZhciBmaWVsZE5hbWUgPSBgX2FuY2hvcl8ke25vZGVJbmRleH1gO1xuICAgIHRoaXMudmlldy5maWVsZHMucHVzaChcbiAgICAgICAgbmV3IG8uQ2xhc3NGaWVsZChmaWVsZE5hbWUsIG8uaW1wb3J0VHlwZSh0aGlzLnZpZXcuZ2VuQ29uZmlnLnJlbmRlclR5cGVzLnJlbmRlckNvbW1lbnQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgIFtvLlN0bXRNb2RpZmllci5Qcml2YXRlXSkpO1xuICAgIHRoaXMudmlldy5jcmVhdGVNZXRob2QuYWRkU3RtdChcbiAgICAgICAgby5USElTX0VYUFIucHJvcChmaWVsZE5hbWUpXG4gICAgICAgICAgICAuc2V0KFZpZXdQcm9wZXJ0aWVzLnJlbmRlcmVyLmNhbGxNZXRob2QoXG4gICAgICAgICAgICAgICAgJ2NyZWF0ZVRlbXBsYXRlQW5jaG9yJyxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICB0aGlzLl9nZXRQYXJlbnRSZW5kZXJOb2RlKHBhcmVudCksXG4gICAgICAgICAgICAgICAgICB0aGlzLnZpZXcuY3JlYXRlTWV0aG9kLnJlc2V0RGVidWdJbmZvRXhwcihub2RlSW5kZXgsIGFzdClcbiAgICAgICAgICAgICAgICBdKSlcbiAgICAgICAgICAgIC50b1N0bXQoKSk7XG4gICAgdmFyIHJlbmRlck5vZGUgPSBvLlRISVNfRVhQUi5wcm9wKGZpZWxkTmFtZSk7XG5cbiAgICB2YXIgdGVtcGxhdGVWYXJpYWJsZUJpbmRpbmdzID0gYXN0LnZhcnMubWFwKFxuICAgICAgICB2YXJBc3QgPT4gW3ZhckFzdC52YWx1ZS5sZW5ndGggPiAwID8gdmFyQXN0LnZhbHVlIDogSU1QTElDSVRfVEVNUExBVEVfVkFSLCB2YXJBc3QubmFtZV0pO1xuXG4gICAgdmFyIGRpcmVjdGl2ZXMgPSBhc3QuZGlyZWN0aXZlcy5tYXAoZGlyZWN0aXZlQXN0ID0+IGRpcmVjdGl2ZUFzdC5kaXJlY3RpdmUpO1xuICAgIHZhciBjb21waWxlRWxlbWVudCA9XG4gICAgICAgIG5ldyBDb21waWxlRWxlbWVudChwYXJlbnQsIHRoaXMudmlldywgbm9kZUluZGV4LCByZW5kZXJOb2RlLCBhc3QsIG51bGwsIGRpcmVjdGl2ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBhc3QucHJvdmlkZXJzLCBhc3QuaGFzVmlld0NvbnRhaW5lciwgdHJ1ZSwge30pO1xuICAgIHRoaXMudmlldy5ub2Rlcy5wdXNoKGNvbXBpbGVFbGVtZW50KTtcblxuICAgIHRoaXMubmVzdGVkVmlld0NvdW50Kys7XG4gICAgdmFyIGVtYmVkZGVkVmlldyA9IG5ldyBDb21waWxlVmlldyhcbiAgICAgICAgdGhpcy52aWV3LmNvbXBvbmVudCwgdGhpcy52aWV3LmdlbkNvbmZpZywgdGhpcy52aWV3LnBpcGVNZXRhcywgby5OVUxMX0VYUFIsXG4gICAgICAgIHRoaXMudmlldy52aWV3SW5kZXggKyB0aGlzLm5lc3RlZFZpZXdDb3VudCwgY29tcGlsZUVsZW1lbnQsIHRlbXBsYXRlVmFyaWFibGVCaW5kaW5ncyk7XG4gICAgdGhpcy5uZXN0ZWRWaWV3Q291bnQgKz0gYnVpbGRWaWV3KGVtYmVkZGVkVmlldywgYXN0LmNoaWxkcmVuLCB0aGlzLnRhcmdldERlcGVuZGVuY2llcyk7XG5cbiAgICBjb21waWxlRWxlbWVudC5iZWZvcmVDaGlsZHJlbigpO1xuICAgIHRoaXMuX2FkZFJvb3ROb2RlQW5kUHJvamVjdChjb21waWxlRWxlbWVudCwgYXN0Lm5nQ29udGVudEluZGV4LCBwYXJlbnQpO1xuICAgIGNvbXBpbGVFbGVtZW50LmFmdGVyQ2hpbGRyZW4oMCk7XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0QXR0cihhc3Q6IEF0dHJBc3QsIGN0eDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgdmlzaXREaXJlY3RpdmUoYXN0OiBEaXJlY3RpdmVBc3QsIGN0eDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgdmlzaXRFdmVudChhc3Q6IEJvdW5kRXZlbnRBc3QsIGV2ZW50VGFyZ2V0QW5kTmFtZXM6IE1hcDxzdHJpbmcsIEJvdW5kRXZlbnRBc3Q+KTogYW55IHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0VmFyaWFibGUoYXN0OiBWYXJpYWJsZUFzdCwgY3R4OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuICB2aXNpdERpcmVjdGl2ZVByb3BlcnR5KGFzdDogQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgdmlzaXRFbGVtZW50UHJvcGVydHkoYXN0OiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbn1cblxuZnVuY3Rpb24gX21lcmdlSHRtbEFuZERpcmVjdGl2ZUF0dHJzKGRlY2xhcmVkSHRtbEF0dHJzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSk6IHN0cmluZ1tdW10ge1xuICB2YXIgcmVzdWx0OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goZGVjbGFyZWRIdG1sQXR0cnMsICh2YWx1ZSwga2V5KSA9PiB7IHJlc3VsdFtrZXldID0gdmFsdWU7IH0pO1xuICBkaXJlY3RpdmVzLmZvckVhY2goZGlyZWN0aXZlTWV0YSA9PiB7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGRpcmVjdGl2ZU1ldGEuaG9zdEF0dHJpYnV0ZXMsICh2YWx1ZSwgbmFtZSkgPT4ge1xuICAgICAgdmFyIHByZXZWYWx1ZSA9IHJlc3VsdFtuYW1lXTtcbiAgICAgIHJlc3VsdFtuYW1lXSA9IGlzUHJlc2VudChwcmV2VmFsdWUpID8gbWVyZ2VBdHRyaWJ1dGVWYWx1ZShuYW1lLCBwcmV2VmFsdWUsIHZhbHVlKSA6IHZhbHVlO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIG1hcFRvS2V5VmFsdWVBcnJheShyZXN1bHQpO1xufVxuXG5mdW5jdGlvbiBfcmVhZEh0bWxBdHRycyhhdHRyczogQXR0ckFzdFtdKToge1trZXk6IHN0cmluZ106IHN0cmluZ30ge1xuICB2YXIgaHRtbEF0dHJzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICBhdHRycy5mb3JFYWNoKChhc3QpID0+IHsgaHRtbEF0dHJzW2FzdC5uYW1lXSA9IGFzdC52YWx1ZTsgfSk7XG4gIHJldHVybiBodG1sQXR0cnM7XG59XG5cbmZ1bmN0aW9uIF9yZWFkSHRtbEFuZERpcmVjdGl2ZVZhcmlhYmxlcyhlbGVtZW50RXhwb3J0QXNWYXJzOiBWYXJpYWJsZUFzdFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGl2ZXM6IERpcmVjdGl2ZUFzdFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdUeXBlOiBWaWV3VHlwZSk6IHtba2V5OiBzdHJpbmddOiBDb21waWxlVG9rZW5NZXRhZGF0YX0ge1xuICB2YXIgdmFyaWFibGVzOiB7W2tleTogc3RyaW5nXTogQ29tcGlsZVRva2VuTWV0YWRhdGF9ID0ge307XG4gIHZhciBjb21wb25lbnQ6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSA9IG51bGw7XG4gIGRpcmVjdGl2ZXMuZm9yRWFjaCgoZGlyZWN0aXZlKSA9PiB7XG4gICAgaWYgKGRpcmVjdGl2ZS5kaXJlY3RpdmUuaXNDb21wb25lbnQpIHtcbiAgICAgIGNvbXBvbmVudCA9IGRpcmVjdGl2ZS5kaXJlY3RpdmU7XG4gICAgfVxuICAgIGRpcmVjdGl2ZS5leHBvcnRBc1ZhcnMuZm9yRWFjaChcbiAgICAgICAgdmFyQXN0ID0+IHsgdmFyaWFibGVzW3ZhckFzdC5uYW1lXSA9IGlkZW50aWZpZXJUb2tlbihkaXJlY3RpdmUuZGlyZWN0aXZlLnR5cGUpOyB9KTtcbiAgfSk7XG4gIGVsZW1lbnRFeHBvcnRBc1ZhcnMuZm9yRWFjaCgodmFyQXN0KSA9PiB7XG4gICAgdmFyaWFibGVzW3ZhckFzdC5uYW1lXSA9IGlzUHJlc2VudChjb21wb25lbnQpID8gaWRlbnRpZmllclRva2VuKGNvbXBvbmVudC50eXBlKSA6IG51bGw7XG4gIH0pO1xuICByZXR1cm4gdmFyaWFibGVzO1xufVxuXG5mdW5jdGlvbiBtZXJnZUF0dHJpYnV0ZVZhbHVlKGF0dHJOYW1lOiBzdHJpbmcsIGF0dHJWYWx1ZTE6IHN0cmluZywgYXR0clZhbHVlMjogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKGF0dHJOYW1lID09IENMQVNTX0FUVFIgfHwgYXR0ck5hbWUgPT0gU1RZTEVfQVRUUikge1xuICAgIHJldHVybiBgJHthdHRyVmFsdWUxfSAke2F0dHJWYWx1ZTJ9YDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYXR0clZhbHVlMjtcbiAgfVxufVxuXG5mdW5jdGlvbiBtYXBUb0tleVZhbHVlQXJyYXkoZGF0YToge1trZXk6IHN0cmluZ106IHN0cmluZ30pOiBzdHJpbmdbXVtdIHtcbiAgdmFyIGVudHJ5QXJyYXkgPSBbXTtcbiAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGRhdGEsICh2YWx1ZSwgbmFtZSkgPT4geyBlbnRyeUFycmF5LnB1c2goW25hbWUsIHZhbHVlXSk7IH0pO1xuICAvLyBXZSBuZWVkIHRvIHNvcnQgdG8gZ2V0IGEgZGVmaW5lZCBvdXRwdXQgb3JkZXJcbiAgLy8gZm9yIHRlc3RzIGFuZCBmb3IgY2FjaGluZyBnZW5lcmF0ZWQgYXJ0aWZhY3RzLi4uXG4gIExpc3RXcmFwcGVyLnNvcnQoZW50cnlBcnJheSwgKGVudHJ5MSwgZW50cnkyKSA9PiBTdHJpbmdXcmFwcGVyLmNvbXBhcmUoZW50cnkxWzBdLCBlbnRyeTJbMF0pKTtcbiAgdmFyIGtleVZhbHVlQXJyYXkgPSBbXTtcbiAgZW50cnlBcnJheS5mb3JFYWNoKChlbnRyeSkgPT4geyBrZXlWYWx1ZUFycmF5LnB1c2goW2VudHJ5WzBdLCBlbnRyeVsxXV0pOyB9KTtcbiAgcmV0dXJuIGtleVZhbHVlQXJyYXk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVZpZXdUb3BMZXZlbFN0bXRzKHZpZXc6IENvbXBpbGVWaWV3LCB0YXJnZXRTdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdKSB7XG4gIHZhciBub2RlRGVidWdJbmZvc1Zhcjogby5FeHByZXNzaW9uID0gby5OVUxMX0VYUFI7XG4gIGlmICh2aWV3LmdlbkNvbmZpZy5nZW5EZWJ1Z0luZm8pIHtcbiAgICBub2RlRGVidWdJbmZvc1ZhciA9IG8udmFyaWFibGUoYG5vZGVEZWJ1Z0luZm9zXyR7dmlldy5jb21wb25lbnQudHlwZS5uYW1lfSR7dmlldy52aWV3SW5kZXh9YCk7XG4gICAgdGFyZ2V0U3RhdGVtZW50cy5wdXNoKFxuICAgICAgICAoPG8uUmVhZFZhckV4cHI+bm9kZURlYnVnSW5mb3NWYXIpXG4gICAgICAgICAgICAuc2V0KG8ubGl0ZXJhbEFycih2aWV3Lm5vZGVzLm1hcChjcmVhdGVTdGF0aWNOb2RlRGVidWdJbmZvKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBvLkFycmF5VHlwZShuZXcgby5FeHRlcm5hbFR5cGUoSWRlbnRpZmllcnMuU3RhdGljTm9kZURlYnVnSW5mbyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW28uVHlwZU1vZGlmaWVyLkNvbnN0XSkpKVxuICAgICAgICAgICAgLnRvRGVjbFN0bXQobnVsbCwgW28uU3RtdE1vZGlmaWVyLkZpbmFsXSkpO1xuICB9XG5cblxuICB2YXIgcmVuZGVyQ29tcFR5cGVWYXI6IG8uUmVhZFZhckV4cHIgPSBvLnZhcmlhYmxlKGByZW5kZXJUeXBlXyR7dmlldy5jb21wb25lbnQudHlwZS5uYW1lfWApO1xuICBpZiAodmlldy52aWV3SW5kZXggPT09IDApIHtcbiAgICB0YXJnZXRTdGF0ZW1lbnRzLnB1c2gocmVuZGVyQ29tcFR5cGVWYXIuc2V0KG8uTlVMTF9FWFBSKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRvRGVjbFN0bXQoby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLlJlbmRlckNvbXBvbmVudFR5cGUpKSk7XG4gIH1cblxuICB2YXIgdmlld0NsYXNzID0gY3JlYXRlVmlld0NsYXNzKHZpZXcsIHJlbmRlckNvbXBUeXBlVmFyLCBub2RlRGVidWdJbmZvc1Zhcik7XG4gIHRhcmdldFN0YXRlbWVudHMucHVzaCh2aWV3Q2xhc3MpO1xuICB0YXJnZXRTdGF0ZW1lbnRzLnB1c2goY3JlYXRlVmlld0ZhY3Rvcnkodmlldywgdmlld0NsYXNzLCByZW5kZXJDb21wVHlwZVZhcikpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTdGF0aWNOb2RlRGVidWdJbmZvKG5vZGU6IENvbXBpbGVOb2RlKTogby5FeHByZXNzaW9uIHtcbiAgdmFyIGNvbXBpbGVFbGVtZW50ID0gbm9kZSBpbnN0YW5jZW9mIENvbXBpbGVFbGVtZW50ID8gbm9kZSA6IG51bGw7XG4gIHZhciBwcm92aWRlclRva2Vuczogby5FeHByZXNzaW9uW10gPSBbXTtcbiAgdmFyIGNvbXBvbmVudFRva2VuOiBvLkV4cHJlc3Npb24gPSBvLk5VTExfRVhQUjtcbiAgdmFyIHZhclRva2VuRW50cmllcyA9IFtdO1xuICBpZiAoaXNQcmVzZW50KGNvbXBpbGVFbGVtZW50KSkge1xuICAgIHByb3ZpZGVyVG9rZW5zID0gY29tcGlsZUVsZW1lbnQuZ2V0UHJvdmlkZXJUb2tlbnMoKTtcbiAgICBpZiAoaXNQcmVzZW50KGNvbXBpbGVFbGVtZW50LmNvbXBvbmVudCkpIHtcbiAgICAgIGNvbXBvbmVudFRva2VuID0gY3JlYXRlRGlUb2tlbkV4cHJlc3Npb24oaWRlbnRpZmllclRva2VuKGNvbXBpbGVFbGVtZW50LmNvbXBvbmVudC50eXBlKSk7XG4gICAgfVxuICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChjb21waWxlRWxlbWVudC52YXJpYWJsZVRva2VucywgKHRva2VuLCB2YXJOYW1lKSA9PiB7XG4gICAgICB2YXJUb2tlbkVudHJpZXMucHVzaChcbiAgICAgICAgICBbdmFyTmFtZSwgaXNQcmVzZW50KHRva2VuKSA/IGNyZWF0ZURpVG9rZW5FeHByZXNzaW9uKHRva2VuKSA6IG8uTlVMTF9FWFBSXSk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5TdGF0aWNOb2RlRGVidWdJbmZvKVxuICAgICAgLmluc3RhbnRpYXRlKFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIG8ubGl0ZXJhbEFycihwcm92aWRlclRva2VucywgbmV3IG8uQXJyYXlUeXBlKG8uRFlOQU1JQ19UWVBFLCBbby5UeXBlTW9kaWZpZXIuQ29uc3RdKSksXG4gICAgICAgICAgICBjb21wb25lbnRUb2tlbixcbiAgICAgICAgICAgIG8ubGl0ZXJhbE1hcCh2YXJUb2tlbkVudHJpZXMsIG5ldyBvLk1hcFR5cGUoby5EWU5BTUlDX1RZUEUsIFtvLlR5cGVNb2RpZmllci5Db25zdF0pKVxuICAgICAgICAgIF0sXG4gICAgICAgICAgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLlN0YXRpY05vZGVEZWJ1Z0luZm8sIG51bGwsIFtvLlR5cGVNb2RpZmllci5Db25zdF0pKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlVmlld0NsYXNzKHZpZXc6IENvbXBpbGVWaWV3LCByZW5kZXJDb21wVHlwZVZhcjogby5SZWFkVmFyRXhwcixcbiAgICAgICAgICAgICAgICAgICAgICAgICBub2RlRGVidWdJbmZvc1Zhcjogby5FeHByZXNzaW9uKTogby5DbGFzc1N0bXQge1xuICB2YXIgZW1wdHlUZW1wbGF0ZVZhcmlhYmxlQmluZGluZ3MgPVxuICAgICAgdmlldy50ZW1wbGF0ZVZhcmlhYmxlQmluZGluZ3MubWFwKChlbnRyeSkgPT4gW2VudHJ5WzBdLCBvLk5VTExfRVhQUl0pO1xuICB2YXIgdmlld0NvbnN0cnVjdG9yQXJncyA9IFtcbiAgICBuZXcgby5GblBhcmFtKFZpZXdDb25zdHJ1Y3RvclZhcnMudmlld1V0aWxzLm5hbWUsIG8uaW1wb3J0VHlwZShJZGVudGlmaWVycy5WaWV3VXRpbHMpKSxcbiAgICBuZXcgby5GblBhcmFtKFZpZXdDb25zdHJ1Y3RvclZhcnMucGFyZW50SW5qZWN0b3IubmFtZSwgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLkluamVjdG9yKSksXG4gICAgbmV3IG8uRm5QYXJhbShWaWV3Q29uc3RydWN0b3JWYXJzLmRlY2xhcmF0aW9uRWwubmFtZSwgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLkFwcEVsZW1lbnQpKVxuICBdO1xuICB2YXIgc3VwZXJDb25zdHJ1Y3RvckFyZ3MgPSBbXG4gICAgby52YXJpYWJsZSh2aWV3LmNsYXNzTmFtZSksXG4gICAgcmVuZGVyQ29tcFR5cGVWYXIsXG4gICAgVmlld1R5cGVFbnVtLmZyb21WYWx1ZSh2aWV3LnZpZXdUeXBlKSxcbiAgICBvLmxpdGVyYWxNYXAoZW1wdHlUZW1wbGF0ZVZhcmlhYmxlQmluZGluZ3MpLFxuICAgIFZpZXdDb25zdHJ1Y3RvclZhcnMudmlld1V0aWxzLFxuICAgIFZpZXdDb25zdHJ1Y3RvclZhcnMucGFyZW50SW5qZWN0b3IsXG4gICAgVmlld0NvbnN0cnVjdG9yVmFycy5kZWNsYXJhdGlvbkVsLFxuICAgIENoYW5nZURldGVjdGlvblN0cmF0ZWd5RW51bS5mcm9tVmFsdWUoZ2V0Q2hhbmdlRGV0ZWN0aW9uTW9kZSh2aWV3KSksXG4gICAgby5saXRlcmFsKHZpZXcubGl0ZXJhbEFycmF5Q291bnQpLFxuICAgIG8ubGl0ZXJhbCh2aWV3LmxpdGVyYWxNYXBDb3VudCksXG4gIF07XG4gIGlmICh2aWV3LmdlbkNvbmZpZy5nZW5EZWJ1Z0luZm8pIHtcbiAgICBzdXBlckNvbnN0cnVjdG9yQXJncy5wdXNoKG5vZGVEZWJ1Z0luZm9zVmFyKTtcbiAgfVxuICB2YXIgdmlld0NvbnN0cnVjdG9yID0gbmV3IG8uQ2xhc3NNZXRob2QobnVsbCwgdmlld0NvbnN0cnVjdG9yQXJncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtvLlNVUEVSX0VYUFIuY2FsbEZuKHN1cGVyQ29uc3RydWN0b3JBcmdzKS50b1N0bXQoKV0pO1xuXG4gIHZhciB2aWV3TWV0aG9kcyA9IFtcbiAgICBuZXcgby5DbGFzc01ldGhvZCgnY3JlYXRlSW50ZXJuYWwnLCBbbmV3IG8uRm5QYXJhbShyb290U2VsZWN0b3JWYXIubmFtZSwgby5EWU5BTUlDX1RZUEUpXSxcbiAgICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZUNyZWF0ZU1ldGhvZCh2aWV3KSwgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLkFwcEVsZW1lbnQpKSxcbiAgICBuZXcgby5DbGFzc01ldGhvZChcbiAgICAgICAgJ2luamVjdG9yR2V0SW50ZXJuYWwnLFxuICAgICAgICBbXG4gICAgICAgICAgbmV3IG8uRm5QYXJhbShJbmplY3RNZXRob2RWYXJzLnRva2VuLm5hbWUsIG8uRFlOQU1JQ19UWVBFKSxcbiAgICAgICAgICAvLyBOb3RlOiBDYW4ndCB1c2Ugby5JTlRfVFlQRSBoZXJlIGFzIHRoZSBtZXRob2QgaW4gQXBwVmlldyB1c2VzIG51bWJlclxuICAgICAgICAgIG5ldyBvLkZuUGFyYW0oSW5qZWN0TWV0aG9kVmFycy5yZXF1ZXN0Tm9kZUluZGV4Lm5hbWUsIG8uTlVNQkVSX1RZUEUpLFxuICAgICAgICAgIG5ldyBvLkZuUGFyYW0oSW5qZWN0TWV0aG9kVmFycy5ub3RGb3VuZFJlc3VsdC5uYW1lLCBvLkRZTkFNSUNfVFlQRSlcbiAgICAgICAgXSxcbiAgICAgICAgYWRkUmV0dXJuVmFsdWVmTm90RW1wdHkodmlldy5pbmplY3RvckdldE1ldGhvZC5maW5pc2goKSwgSW5qZWN0TWV0aG9kVmFycy5ub3RGb3VuZFJlc3VsdCksXG4gICAgICAgIG8uRFlOQU1JQ19UWVBFKSxcbiAgICBuZXcgby5DbGFzc01ldGhvZCgnZGV0ZWN0Q2hhbmdlc0ludGVybmFsJyxcbiAgICAgICAgICAgICAgICAgICAgICBbbmV3IG8uRm5QYXJhbShEZXRlY3RDaGFuZ2VzVmFycy50aHJvd09uQ2hhbmdlLm5hbWUsIG8uQk9PTF9UWVBFKV0sXG4gICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVEZXRlY3RDaGFuZ2VzTWV0aG9kKHZpZXcpKSxcbiAgICBuZXcgby5DbGFzc01ldGhvZCgnZGlydHlQYXJlbnRRdWVyaWVzSW50ZXJuYWwnLCBbXSwgdmlldy5kaXJ0eVBhcmVudFF1ZXJpZXNNZXRob2QuZmluaXNoKCkpLFxuICAgIG5ldyBvLkNsYXNzTWV0aG9kKCdkZXN0cm95SW50ZXJuYWwnLCBbXSwgdmlldy5kZXN0cm95TWV0aG9kLmZpbmlzaCgpKVxuICBdLmNvbmNhdCh2aWV3LmV2ZW50SGFuZGxlck1ldGhvZHMpO1xuICB2YXIgc3VwZXJDbGFzcyA9IHZpZXcuZ2VuQ29uZmlnLmdlbkRlYnVnSW5mbyA/IElkZW50aWZpZXJzLkRlYnVnQXBwVmlldyA6IElkZW50aWZpZXJzLkFwcFZpZXc7XG4gIHZhciB2aWV3Q2xhc3MgPSBuZXcgby5DbGFzc1N0bXQodmlldy5jbGFzc05hbWUsIG8uaW1wb3J0RXhwcihzdXBlckNsYXNzLCBbZ2V0Q29udGV4dFR5cGUodmlldyldKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3LmZpZWxkcywgdmlldy5nZXR0ZXJzLCB2aWV3Q29uc3RydWN0b3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlld01ldGhvZHMuZmlsdGVyKChtZXRob2QpID0+IG1ldGhvZC5ib2R5Lmxlbmd0aCA+IDApKTtcbiAgcmV0dXJuIHZpZXdDbGFzcztcbn1cblxuZnVuY3Rpb24gY3JlYXRlVmlld0ZhY3RvcnkodmlldzogQ29tcGlsZVZpZXcsIHZpZXdDbGFzczogby5DbGFzc1N0bXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJDb21wVHlwZVZhcjogby5SZWFkVmFyRXhwcik6IG8uU3RhdGVtZW50IHtcbiAgdmFyIHZpZXdGYWN0b3J5QXJncyA9IFtcbiAgICBuZXcgby5GblBhcmFtKFZpZXdDb25zdHJ1Y3RvclZhcnMudmlld1V0aWxzLm5hbWUsIG8uaW1wb3J0VHlwZShJZGVudGlmaWVycy5WaWV3VXRpbHMpKSxcbiAgICBuZXcgby5GblBhcmFtKFZpZXdDb25zdHJ1Y3RvclZhcnMucGFyZW50SW5qZWN0b3IubmFtZSwgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLkluamVjdG9yKSksXG4gICAgbmV3IG8uRm5QYXJhbShWaWV3Q29uc3RydWN0b3JWYXJzLmRlY2xhcmF0aW9uRWwubmFtZSwgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLkFwcEVsZW1lbnQpKVxuICBdO1xuICB2YXIgaW5pdFJlbmRlckNvbXBUeXBlU3RtdHMgPSBbXTtcbiAgdmFyIHRlbXBsYXRlVXJsSW5mbztcbiAgaWYgKHZpZXcuY29tcG9uZW50LnRlbXBsYXRlLnRlbXBsYXRlVXJsID09IHZpZXcuY29tcG9uZW50LnR5cGUubW9kdWxlVXJsKSB7XG4gICAgdGVtcGxhdGVVcmxJbmZvID1cbiAgICAgICAgYCR7dmlldy5jb21wb25lbnQudHlwZS5tb2R1bGVVcmx9IGNsYXNzICR7dmlldy5jb21wb25lbnQudHlwZS5uYW1lfSAtIGlubGluZSB0ZW1wbGF0ZWA7XG4gIH0gZWxzZSB7XG4gICAgdGVtcGxhdGVVcmxJbmZvID0gdmlldy5jb21wb25lbnQudGVtcGxhdGUudGVtcGxhdGVVcmw7XG4gIH1cbiAgaWYgKHZpZXcudmlld0luZGV4ID09PSAwKSB7XG4gICAgaW5pdFJlbmRlckNvbXBUeXBlU3RtdHMgPSBbXG4gICAgICBuZXcgby5JZlN0bXQocmVuZGVyQ29tcFR5cGVWYXIuaWRlbnRpY2FsKG8uTlVMTF9FWFBSKSxcbiAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICByZW5kZXJDb21wVHlwZVZhci5zZXQoVmlld0NvbnN0cnVjdG9yVmFyc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudmlld1V0aWxzLmNhbGxNZXRob2QoJ2NyZWF0ZVJlbmRlckNvbXBvbmVudFR5cGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWwodGVtcGxhdGVVcmxJbmZvKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5saXRlcmFsKHZpZXcuY29tcG9uZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRlbXBsYXRlLm5nQ29udGVudFNlbGVjdG9ycy5sZW5ndGgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBWaWV3RW5jYXBzdWxhdGlvbkVudW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5mcm9tVmFsdWUodmlldy5jb21wb25lbnQudGVtcGxhdGUuZW5jYXBzdWxhdGlvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcuc3R5bGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAudG9TdG10KClcbiAgICAgICAgICAgICAgICAgICBdKVxuICAgIF07XG4gIH1cbiAgcmV0dXJuIG8uZm4odmlld0ZhY3RvcnlBcmdzLCBpbml0UmVuZGVyQ29tcFR5cGVTdG10cy5jb25jYXQoW1xuICAgICAgICAgICAgbmV3IG8uUmV0dXJuU3RhdGVtZW50KG8udmFyaWFibGUodmlld0NsYXNzLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5pbnN0YW50aWF0ZSh2aWV3Q2xhc3MuY29uc3RydWN0b3JNZXRob2QucGFyYW1zLm1hcChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwYXJhbSkgPT4gby52YXJpYWJsZShwYXJhbS5uYW1lKSkpKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBvLmltcG9ydFR5cGUoSWRlbnRpZmllcnMuQXBwVmlldywgW2dldENvbnRleHRUeXBlKHZpZXcpXSkpXG4gICAgICAudG9EZWNsU3RtdCh2aWV3LnZpZXdGYWN0b3J5Lm5hbWUsIFtvLlN0bXRNb2RpZmllci5GaW5hbF0pO1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUNyZWF0ZU1ldGhvZCh2aWV3OiBDb21waWxlVmlldyk6IG8uU3RhdGVtZW50W10ge1xuICB2YXIgcGFyZW50UmVuZGVyTm9kZUV4cHI6IG8uRXhwcmVzc2lvbiA9IG8uTlVMTF9FWFBSO1xuICB2YXIgcGFyZW50UmVuZGVyTm9kZVN0bXRzID0gW107XG4gIGlmICh2aWV3LnZpZXdUeXBlID09PSBWaWV3VHlwZS5DT01QT05FTlQpIHtcbiAgICBwYXJlbnRSZW5kZXJOb2RlRXhwciA9IFZpZXdQcm9wZXJ0aWVzLnJlbmRlcmVyLmNhbGxNZXRob2QoXG4gICAgICAgICdjcmVhdGVWaWV3Um9vdCcsIFtvLlRISVNfRVhQUi5wcm9wKCdkZWNsYXJhdGlvbkFwcEVsZW1lbnQnKS5wcm9wKCduYXRpdmVFbGVtZW50JyldKTtcbiAgICBwYXJlbnRSZW5kZXJOb2RlU3RtdHMgPSBbXG4gICAgICBwYXJlbnRSZW5kZXJOb2RlVmFyLnNldChwYXJlbnRSZW5kZXJOb2RlRXhwcilcbiAgICAgICAgICAudG9EZWNsU3RtdChvLmltcG9ydFR5cGUodmlldy5nZW5Db25maWcucmVuZGVyVHlwZXMucmVuZGVyTm9kZSksIFtvLlN0bXRNb2RpZmllci5GaW5hbF0pXG4gICAgXTtcbiAgfVxuICB2YXIgcmVzdWx0RXhwcjogby5FeHByZXNzaW9uO1xuICBpZiAodmlldy52aWV3VHlwZSA9PT0gVmlld1R5cGUuSE9TVCkge1xuICAgIHJlc3VsdEV4cHIgPSAoPENvbXBpbGVFbGVtZW50PnZpZXcubm9kZXNbMF0pLmFwcEVsZW1lbnQ7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0RXhwciA9IG8uTlVMTF9FWFBSO1xuICB9XG4gIHJldHVybiBwYXJlbnRSZW5kZXJOb2RlU3RtdHMuY29uY2F0KHZpZXcuY3JlYXRlTWV0aG9kLmZpbmlzaCgpKVxuICAgICAgLmNvbmNhdChbXG4gICAgICAgIG8uVEhJU19FWFBSLmNhbGxNZXRob2QoJ2luaXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUZsYXRBcnJheSh2aWV3LnJvb3ROb2Rlc09yQXBwRWxlbWVudHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5saXRlcmFsQXJyKHZpZXcubm9kZXMubWFwKG5vZGUgPT4gbm9kZS5yZW5kZXJOb2RlKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWxBcnIodmlldy5kaXNwb3NhYmxlcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWxBcnIodmlldy5zdWJzY3JpcHRpb25zKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAudG9TdG10KCksXG4gICAgICAgIG5ldyBvLlJldHVyblN0YXRlbWVudChyZXN1bHRFeHByKVxuICAgICAgXSk7XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlRGV0ZWN0Q2hhbmdlc01ldGhvZCh2aWV3OiBDb21waWxlVmlldyk6IG8uU3RhdGVtZW50W10ge1xuICB2YXIgc3RtdHMgPSBbXTtcbiAgaWYgKHZpZXcuZGV0ZWN0Q2hhbmdlc0luSW5wdXRzTWV0aG9kLmlzRW1wdHkoKSAmJiB2aWV3LnVwZGF0ZUNvbnRlbnRRdWVyaWVzTWV0aG9kLmlzRW1wdHkoKSAmJlxuICAgICAgdmlldy5hZnRlckNvbnRlbnRMaWZlY3ljbGVDYWxsYmFja3NNZXRob2QuaXNFbXB0eSgpICYmXG4gICAgICB2aWV3LmRldGVjdENoYW5nZXNSZW5kZXJQcm9wZXJ0aWVzTWV0aG9kLmlzRW1wdHkoKSAmJlxuICAgICAgdmlldy51cGRhdGVWaWV3UXVlcmllc01ldGhvZC5pc0VtcHR5KCkgJiYgdmlldy5hZnRlclZpZXdMaWZlY3ljbGVDYWxsYmFja3NNZXRob2QuaXNFbXB0eSgpKSB7XG4gICAgcmV0dXJuIHN0bXRzO1xuICB9XG4gIExpc3RXcmFwcGVyLmFkZEFsbChzdG10cywgdmlldy5kZXRlY3RDaGFuZ2VzSW5JbnB1dHNNZXRob2QuZmluaXNoKCkpO1xuICBzdG10cy5wdXNoKFxuICAgICAgby5USElTX0VYUFIuY2FsbE1ldGhvZCgnZGV0ZWN0Q29udGVudENoaWxkcmVuQ2hhbmdlcycsIFtEZXRlY3RDaGFuZ2VzVmFycy50aHJvd09uQ2hhbmdlXSlcbiAgICAgICAgICAudG9TdG10KCkpO1xuICB2YXIgYWZ0ZXJDb250ZW50U3RtdHMgPSB2aWV3LnVwZGF0ZUNvbnRlbnRRdWVyaWVzTWV0aG9kLmZpbmlzaCgpLmNvbmNhdChcbiAgICAgIHZpZXcuYWZ0ZXJDb250ZW50TGlmZWN5Y2xlQ2FsbGJhY2tzTWV0aG9kLmZpbmlzaCgpKTtcbiAgaWYgKGFmdGVyQ29udGVudFN0bXRzLmxlbmd0aCA+IDApIHtcbiAgICBzdG10cy5wdXNoKG5ldyBvLklmU3RtdChvLm5vdChEZXRlY3RDaGFuZ2VzVmFycy50aHJvd09uQ2hhbmdlKSwgYWZ0ZXJDb250ZW50U3RtdHMpKTtcbiAgfVxuICBMaXN0V3JhcHBlci5hZGRBbGwoc3RtdHMsIHZpZXcuZGV0ZWN0Q2hhbmdlc1JlbmRlclByb3BlcnRpZXNNZXRob2QuZmluaXNoKCkpO1xuICBzdG10cy5wdXNoKG8uVEhJU19FWFBSLmNhbGxNZXRob2QoJ2RldGVjdFZpZXdDaGlsZHJlbkNoYW5nZXMnLCBbRGV0ZWN0Q2hhbmdlc1ZhcnMudGhyb3dPbkNoYW5nZV0pXG4gICAgICAgICAgICAgICAgIC50b1N0bXQoKSk7XG4gIHZhciBhZnRlclZpZXdTdG10cyA9XG4gICAgICB2aWV3LnVwZGF0ZVZpZXdRdWVyaWVzTWV0aG9kLmZpbmlzaCgpLmNvbmNhdCh2aWV3LmFmdGVyVmlld0xpZmVjeWNsZUNhbGxiYWNrc01ldGhvZC5maW5pc2goKSk7XG4gIGlmIChhZnRlclZpZXdTdG10cy5sZW5ndGggPiAwKSB7XG4gICAgc3RtdHMucHVzaChuZXcgby5JZlN0bXQoby5ub3QoRGV0ZWN0Q2hhbmdlc1ZhcnMudGhyb3dPbkNoYW5nZSksIGFmdGVyVmlld1N0bXRzKSk7XG4gIH1cblxuICB2YXIgdmFyU3RtdHMgPSBbXTtcbiAgdmFyIHJlYWRWYXJzID0gby5maW5kUmVhZFZhck5hbWVzKHN0bXRzKTtcbiAgaWYgKFNldFdyYXBwZXIuaGFzKHJlYWRWYXJzLCBEZXRlY3RDaGFuZ2VzVmFycy5jaGFuZ2VkLm5hbWUpKSB7XG4gICAgdmFyU3RtdHMucHVzaChEZXRlY3RDaGFuZ2VzVmFycy5jaGFuZ2VkLnNldChvLmxpdGVyYWwodHJ1ZSkpLnRvRGVjbFN0bXQoby5CT09MX1RZUEUpKTtcbiAgfVxuICBpZiAoU2V0V3JhcHBlci5oYXMocmVhZFZhcnMsIERldGVjdENoYW5nZXNWYXJzLmNoYW5nZXMubmFtZSkpIHtcbiAgICB2YXJTdG10cy5wdXNoKERldGVjdENoYW5nZXNWYXJzLmNoYW5nZXMuc2V0KG8uTlVMTF9FWFBSKVxuICAgICAgICAgICAgICAgICAgICAgIC50b0RlY2xTdG10KG5ldyBvLk1hcFR5cGUoby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLlNpbXBsZUNoYW5nZSkpKSk7XG4gIH1cbiAgaWYgKFNldFdyYXBwZXIuaGFzKHJlYWRWYXJzLCBEZXRlY3RDaGFuZ2VzVmFycy52YWxVbndyYXBwZXIubmFtZSkpIHtcbiAgICB2YXJTdG10cy5wdXNoKFxuICAgICAgICBEZXRlY3RDaGFuZ2VzVmFycy52YWxVbndyYXBwZXIuc2V0KG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5WYWx1ZVVud3JhcHBlcikuaW5zdGFudGlhdGUoW10pKVxuICAgICAgICAgICAgLnRvRGVjbFN0bXQobnVsbCwgW28uU3RtdE1vZGlmaWVyLkZpbmFsXSkpO1xuICB9XG4gIHJldHVybiB2YXJTdG10cy5jb25jYXQoc3RtdHMpO1xufVxuXG5mdW5jdGlvbiBhZGRSZXR1cm5WYWx1ZWZOb3RFbXB0eShzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdLCB2YWx1ZTogby5FeHByZXNzaW9uKTogby5TdGF0ZW1lbnRbXSB7XG4gIGlmIChzdGF0ZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gc3RhdGVtZW50cy5jb25jYXQoW25ldyBvLlJldHVyblN0YXRlbWVudCh2YWx1ZSldKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RhdGVtZW50cztcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRDb250ZXh0VHlwZSh2aWV3OiBDb21waWxlVmlldyk6IG8uVHlwZSB7XG4gIHZhciB0eXBlTWV0YSA9IHZpZXcuY29tcG9uZW50LnR5cGU7XG4gIHJldHVybiB0eXBlTWV0YS5pc0hvc3QgPyBvLkRZTkFNSUNfVFlQRSA6IG8uaW1wb3J0VHlwZSh0eXBlTWV0YSk7XG59XG5cbmZ1bmN0aW9uIGdldENoYW5nZURldGVjdGlvbk1vZGUodmlldzogQ29tcGlsZVZpZXcpOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSB7XG4gIHZhciBtb2RlOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneTtcbiAgaWYgKHZpZXcudmlld1R5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCkge1xuICAgIG1vZGUgPSBpc0RlZmF1bHRDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSh2aWV3LmNvbXBvbmVudC5jaGFuZ2VEZXRlY3Rpb24pID9cbiAgICAgICAgICAgICAgIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrQWx3YXlzIDpcbiAgICAgICAgICAgICAgIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrT25jZTtcbiAgfSBlbHNlIHtcbiAgICBtb2RlID0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tBbHdheXM7XG4gIH1cbiAgcmV0dXJuIG1vZGU7XG59Il19