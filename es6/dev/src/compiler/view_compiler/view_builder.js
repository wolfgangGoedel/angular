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
        if (node instanceof CompileElement && node.hasEmbeddedView) {
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
        var component = directives.find(directive => directive.isComponent);
        var htmlAttrs = _readHtmlAttrs(ast.attrs);
        var attrNameAndValues = _mergeHtmlAndDirectiveAttrs(htmlAttrs, directives);
        for (var i = 0; i < attrNameAndValues.length; i++) {
            var attrName = attrNameAndValues[i][0];
            var attrValue = attrNameAndValues[i][1];
            this.view.createMethod.addStmt(ViewProperties.renderer.callMethod('setElementAttribute', [renderNode, o.literal(attrName), o.literal(attrValue)])
                .toStmt());
        }
        var compileElement = new CompileElement(parent, this.view, nodeIndex, renderNode, ast, component, directives, ast.providers, ast.hasViewContainer, false, ast.references);
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
            this.view.createMethod.addStmt(compViewExpr.callMethod('create', [compileElement.getComponent(), codeGenContentNodes, o.NULL_EXPR])
                .toStmt());
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
        var templateVariableBindings = ast.variables.map(varAst => [varAst.value.length > 0 ? varAst.value : IMPLICIT_TEMPLATE_VAR, varAst.name]);
        var directives = ast.directives.map(directiveAst => directiveAst.directive);
        var compileElement = new CompileElement(parent, this.view, nodeIndex, renderNode, ast, null, directives, ast.providers, ast.hasViewContainer, true, ast.references);
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
    visitReference(ast, ctx) { return null; }
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
        StringMapWrapper.forEach(compileElement.referenceTokens, (token, varName) => {
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
    var viewConstructorArgs = [
        new o.FnParam(ViewConstructorVars.viewUtils.name, o.importType(Identifiers.ViewUtils)),
        new o.FnParam(ViewConstructorVars.parentInjector.name, o.importType(Identifiers.Injector)),
        new o.FnParam(ViewConstructorVars.declarationEl.name, o.importType(Identifiers.AppElement))
    ];
    var superConstructorArgs = [
        o.variable(view.className),
        renderCompTypeVar,
        ViewTypeEnum.fromValue(view.viewType),
        ViewConstructorVars.viewUtils,
        ViewConstructorVars.parentInjector,
        ViewConstructorVars.declarationEl,
        ChangeDetectionStrategyEnum.fromValue(getChangeDetectionMode(view))
    ];
    if (view.genConfig.genDebugInfo) {
        superConstructorArgs.push(nodeDebugInfosVar);
    }
    var viewConstructor = new o.ClassMethod(null, viewConstructorArgs, [o.SUPER_EXPR.callFn(superConstructorArgs).toStmt()]);
    var viewMethods = [
        new o.ClassMethod('createInternal', [new o.FnParam(rootSelectorVar.name, o.STRING_TYPE)], generateCreateMethod(view), o.importType(Identifiers.AppElement)),
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
    if (view.viewType === ViewType.COMPONENT) {
        return o.importType(view.component.type);
    }
    return o.DYNAMIC_TYPE;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19idWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1TRmdlS2NMTS50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3ZpZXdfY29tcGlsZXIvdmlld19idWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEVBQUMsU0FBUyxFQUFXLGFBQWEsRUFBQyxNQUFNLDBCQUEwQjtPQUNuRSxFQUFDLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUMsTUFBTSxnQ0FBZ0M7T0FFakYsS0FBSyxDQUFDLE1BQU0sc0JBQXNCO09BQ2xDLEVBQUMsV0FBVyxFQUFFLGVBQWUsRUFBQyxNQUFNLGdCQUFnQjtPQUNwRCxFQUNMLG1CQUFtQixFQUNuQixnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLFlBQVksRUFDWixxQkFBcUIsRUFDckIsMkJBQTJCLEVBQzNCLGNBQWMsRUFDZixNQUFNLGFBQWE7T0FDYixFQUNMLHVCQUF1QixFQUN2QixnQ0FBZ0MsRUFDakMsTUFBTSxxREFBcUQ7T0FFckQsRUFBQyxXQUFXLEVBQUMsTUFBTSxnQkFBZ0I7T0FDbkMsRUFBQyxjQUFjLEVBQUUsV0FBVyxFQUFDLE1BQU0sbUJBQW1CO09BRXRELEVBZUwsZ0JBQWdCLEVBR2pCLE1BQU0saUJBQWlCO09BRWpCLEVBQUMsa0JBQWtCLEVBQUUsZUFBZSxFQUFFLHVCQUF1QixFQUFDLE1BQU0sUUFBUTtPQUU1RSxFQUFDLFFBQVEsRUFBQyxNQUFNLG9DQUFvQztPQUNwRCxFQUFDLGlCQUFpQixFQUFDLE1BQU0saUNBQWlDO09BRTFELEVBQ0wseUJBQXlCLEVBRzFCLE1BQU0scUJBQXFCO0FBRTVCLE1BQU0scUJBQXFCLEdBQUcsWUFBWSxDQUFDO0FBQzNDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQztBQUMzQixNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUM7QUFFM0IsSUFBSSxtQkFBbUIsR0FB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LENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQztZQUM1RCx1QkFBdUIsQ0FBQyxXQUFXO1lBQ25DLHVCQUF1QixDQUFDLFNBQVMsQ0FBQztJQUMvQyxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixJQUFJLEdBQUcsdUJBQXVCLENBQUMsV0FBVyxDQUFDO0lBQzdDLENBQUM7SUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBTdHJpbmdXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlciwgU2V0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuaW1wb3J0ICogYXMgbyBmcm9tICcuLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge0lkZW50aWZpZXJzLCBpZGVudGlmaWVyVG9rZW59IGZyb20gJy4uL2lkZW50aWZpZXJzJztcbmltcG9ydCB7XG4gIFZpZXdDb25zdHJ1Y3RvclZhcnMsXG4gIEluamVjdE1ldGhvZFZhcnMsXG4gIERldGVjdENoYW5nZXNWYXJzLFxuICBWaWV3VHlwZUVudW0sXG4gIFZpZXdFbmNhcHN1bGF0aW9uRW51bSxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3lFbnVtLFxuICBWaWV3UHJvcGVydGllc1xufSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3lcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcblxuaW1wb3J0IHtDb21waWxlVmlld30gZnJvbSAnLi9jb21waWxlX3ZpZXcnO1xuaW1wb3J0IHtDb21waWxlRWxlbWVudCwgQ29tcGlsZU5vZGV9IGZyb20gJy4vY29tcGlsZV9lbGVtZW50JztcblxuaW1wb3J0IHtcbiAgVGVtcGxhdGVBc3QsXG4gIFRlbXBsYXRlQXN0VmlzaXRvcixcbiAgTmdDb250ZW50QXN0LFxuICBFbWJlZGRlZFRlbXBsYXRlQXN0LFxuICBFbGVtZW50QXN0LFxuICBSZWZlcmVuY2VBc3QsXG4gIFZhcmlhYmxlQXN0LFxuICBCb3VuZEV2ZW50QXN0LFxuICBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCxcbiAgQXR0ckFzdCxcbiAgQm91bmRUZXh0QXN0LFxuICBUZXh0QXN0LFxuICBEaXJlY3RpdmVBc3QsXG4gIEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QsXG4gIHRlbXBsYXRlVmlzaXRBbGwsXG4gIFByb3BlcnR5QmluZGluZ1R5cGUsXG4gIFByb3ZpZGVyQXN0XG59IGZyb20gJy4uL3RlbXBsYXRlX2FzdCc7XG5cbmltcG9ydCB7Z2V0Vmlld0ZhY3RvcnlOYW1lLCBjcmVhdGVGbGF0QXJyYXksIGNyZWF0ZURpVG9rZW5FeHByZXNzaW9ufSBmcm9tICcuL3V0aWwnO1xuXG5pbXBvcnQge1ZpZXdUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld190eXBlJztcbmltcG9ydCB7Vmlld0VuY2Fwc3VsYXRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL3ZpZXcnO1xuXG5pbXBvcnQge1xuICBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLFxuICBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsXG4gIENvbXBpbGVUb2tlbk1ldGFkYXRhXG59IGZyb20gJy4uL2NvbXBpbGVfbWV0YWRhdGEnO1xuXG5jb25zdCBJTVBMSUNJVF9URU1QTEFURV9WQVIgPSAnXFwkaW1wbGljaXQnO1xuY29uc3QgQ0xBU1NfQVRUUiA9ICdjbGFzcyc7XG5jb25zdCBTVFlMRV9BVFRSID0gJ3N0eWxlJztcblxudmFyIHBhcmVudFJlbmRlck5vZGVWYXIgPSBvLnZhcmlhYmxlKCdwYXJlbnRSZW5kZXJOb2RlJyk7XG52YXIgcm9vdFNlbGVjdG9yVmFyID0gby52YXJpYWJsZSgncm9vdFNlbGVjdG9yJyk7XG5cbmV4cG9ydCBjbGFzcyBWaWV3Q29tcGlsZURlcGVuZGVuY3kge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgY29tcDogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICAgICAgICAgICAgICBwdWJsaWMgZmFjdG9yeVBsYWNlaG9sZGVyOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKSB7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRWaWV3KHZpZXc6IENvbXBpbGVWaWV3LCB0ZW1wbGF0ZTogVGVtcGxhdGVBc3RbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0RGVwZW5kZW5jaWVzOiBWaWV3Q29tcGlsZURlcGVuZGVuY3lbXSk6IG51bWJlciB7XG4gIHZhciBidWlsZGVyVmlzaXRvciA9IG5ldyBWaWV3QnVpbGRlclZpc2l0b3IodmlldywgdGFyZ2V0RGVwZW5kZW5jaWVzKTtcbiAgdGVtcGxhdGVWaXNpdEFsbChidWlsZGVyVmlzaXRvciwgdGVtcGxhdGUsIHZpZXcuZGVjbGFyYXRpb25FbGVtZW50LmlzTnVsbCgpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3LmRlY2xhcmF0aW9uRWxlbWVudCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5kZWNsYXJhdGlvbkVsZW1lbnQucGFyZW50KTtcbiAgcmV0dXJuIGJ1aWxkZXJWaXNpdG9yLm5lc3RlZFZpZXdDb3VudDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmlzaFZpZXcodmlldzogQ29tcGlsZVZpZXcsIHRhcmdldFN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10pIHtcbiAgdmlldy5hZnRlck5vZGVzKCk7XG4gIGNyZWF0ZVZpZXdUb3BMZXZlbFN0bXRzKHZpZXcsIHRhcmdldFN0YXRlbWVudHMpO1xuICB2aWV3Lm5vZGVzLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICBpZiAobm9kZSBpbnN0YW5jZW9mIENvbXBpbGVFbGVtZW50ICYmIG5vZGUuaGFzRW1iZWRkZWRWaWV3KSB7XG4gICAgICBmaW5pc2hWaWV3KG5vZGUuZW1iZWRkZWRWaWV3LCB0YXJnZXRTdGF0ZW1lbnRzKTtcbiAgICB9XG4gIH0pO1xufVxuXG5jbGFzcyBWaWV3QnVpbGRlclZpc2l0b3IgaW1wbGVtZW50cyBUZW1wbGF0ZUFzdFZpc2l0b3Ige1xuICBuZXN0ZWRWaWV3Q291bnQ6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IocHVibGljIHZpZXc6IENvbXBpbGVWaWV3LCBwdWJsaWMgdGFyZ2V0RGVwZW5kZW5jaWVzOiBWaWV3Q29tcGlsZURlcGVuZGVuY3lbXSkge31cblxuICBwcml2YXRlIF9pc1Jvb3ROb2RlKHBhcmVudDogQ29tcGlsZUVsZW1lbnQpOiBib29sZWFuIHsgcmV0dXJuIHBhcmVudC52aWV3ICE9PSB0aGlzLnZpZXc7IH1cblxuICBwcml2YXRlIF9hZGRSb290Tm9kZUFuZFByb2plY3Qobm9kZTogQ29tcGlsZU5vZGUsIG5nQ29udGVudEluZGV4OiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IENvbXBpbGVFbGVtZW50KSB7XG4gICAgdmFyIHZjQXBwRWwgPVxuICAgICAgICAobm9kZSBpbnN0YW5jZW9mIENvbXBpbGVFbGVtZW50ICYmIG5vZGUuaGFzVmlld0NvbnRhaW5lcikgPyBub2RlLmFwcEVsZW1lbnQgOiBudWxsO1xuICAgIGlmICh0aGlzLl9pc1Jvb3ROb2RlKHBhcmVudCkpIHtcbiAgICAgIC8vIHN0b3JlIGFwcEVsZW1lbnQgYXMgcm9vdCBub2RlIG9ubHkgZm9yIFZpZXdDb250YWluZXJzXG4gICAgICBpZiAodGhpcy52aWV3LnZpZXdUeXBlICE9PSBWaWV3VHlwZS5DT01QT05FTlQpIHtcbiAgICAgICAgdGhpcy52aWV3LnJvb3ROb2Rlc09yQXBwRWxlbWVudHMucHVzaChpc1ByZXNlbnQodmNBcHBFbCkgPyB2Y0FwcEVsIDogbm9kZS5yZW5kZXJOb2RlKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChwYXJlbnQuY29tcG9uZW50KSAmJiBpc1ByZXNlbnQobmdDb250ZW50SW5kZXgpKSB7XG4gICAgICBwYXJlbnQuYWRkQ29udGVudE5vZGUobmdDb250ZW50SW5kZXgsIGlzUHJlc2VudCh2Y0FwcEVsKSA/IHZjQXBwRWwgOiBub2RlLnJlbmRlck5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2dldFBhcmVudFJlbmRlck5vZGUocGFyZW50OiBDb21waWxlRWxlbWVudCk6IG8uRXhwcmVzc2lvbiB7XG4gICAgaWYgKHRoaXMuX2lzUm9vdE5vZGUocGFyZW50KSkge1xuICAgICAgaWYgKHRoaXMudmlldy52aWV3VHlwZSA9PT0gVmlld1R5cGUuQ09NUE9ORU5UKSB7XG4gICAgICAgIHJldHVybiBwYXJlbnRSZW5kZXJOb2RlVmFyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcm9vdCBub2RlIG9mIGFuIGVtYmVkZGVkL2hvc3Qgdmlld1xuICAgICAgICByZXR1cm4gby5OVUxMX0VYUFI7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBpc1ByZXNlbnQocGFyZW50LmNvbXBvbmVudCkgJiZcbiAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5jb21wb25lbnQudGVtcGxhdGUuZW5jYXBzdWxhdGlvbiAhPT0gVmlld0VuY2Fwc3VsYXRpb24uTmF0aXZlID9cbiAgICAgICAgICAgICAgICAgby5OVUxMX0VYUFIgOlxuICAgICAgICAgICAgICAgICBwYXJlbnQucmVuZGVyTm9kZTtcbiAgICB9XG4gIH1cblxuICB2aXNpdEJvdW5kVGV4dChhc3Q6IEJvdW5kVGV4dEFzdCwgcGFyZW50OiBDb21waWxlRWxlbWVudCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX3Zpc2l0VGV4dChhc3QsICcnLCBhc3QubmdDb250ZW50SW5kZXgsIHBhcmVudCk7XG4gIH1cbiAgdmlzaXRUZXh0KGFzdDogVGV4dEFzdCwgcGFyZW50OiBDb21waWxlRWxlbWVudCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX3Zpc2l0VGV4dChhc3QsIGFzdC52YWx1ZSwgYXN0Lm5nQ29udGVudEluZGV4LCBwYXJlbnQpO1xuICB9XG4gIHByaXZhdGUgX3Zpc2l0VGV4dChhc3Q6IFRlbXBsYXRlQXN0LCB2YWx1ZTogc3RyaW5nLCBuZ0NvbnRlbnRJbmRleDogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBDb21waWxlRWxlbWVudCk6IG8uRXhwcmVzc2lvbiB7XG4gICAgdmFyIGZpZWxkTmFtZSA9IGBfdGV4dF8ke3RoaXMudmlldy5ub2Rlcy5sZW5ndGh9YDtcbiAgICB0aGlzLnZpZXcuZmllbGRzLnB1c2gobmV3IG8uQ2xhc3NGaWVsZChmaWVsZE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5pbXBvcnRUeXBlKHRoaXMudmlldy5nZW5Db25maWcucmVuZGVyVHlwZXMucmVuZGVyVGV4dCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW28uU3RtdE1vZGlmaWVyLlByaXZhdGVdKSk7XG4gICAgdmFyIHJlbmRlck5vZGUgPSBvLlRISVNfRVhQUi5wcm9wKGZpZWxkTmFtZSk7XG4gICAgdmFyIGNvbXBpbGVOb2RlID0gbmV3IENvbXBpbGVOb2RlKHBhcmVudCwgdGhpcy52aWV3LCB0aGlzLnZpZXcubm9kZXMubGVuZ3RoLCByZW5kZXJOb2RlLCBhc3QpO1xuICAgIHZhciBjcmVhdGVSZW5kZXJOb2RlID1cbiAgICAgICAgby5USElTX0VYUFIucHJvcChmaWVsZE5hbWUpXG4gICAgICAgICAgICAuc2V0KFZpZXdQcm9wZXJ0aWVzLnJlbmRlcmVyLmNhbGxNZXRob2QoXG4gICAgICAgICAgICAgICAgJ2NyZWF0ZVRleHQnLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgIHRoaXMuX2dldFBhcmVudFJlbmRlck5vZGUocGFyZW50KSxcbiAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbCh2YWx1ZSksXG4gICAgICAgICAgICAgICAgICB0aGlzLnZpZXcuY3JlYXRlTWV0aG9kLnJlc2V0RGVidWdJbmZvRXhwcih0aGlzLnZpZXcubm9kZXMubGVuZ3RoLCBhc3QpXG4gICAgICAgICAgICAgICAgXSkpXG4gICAgICAgICAgICAudG9TdG10KCk7XG4gICAgdGhpcy52aWV3Lm5vZGVzLnB1c2goY29tcGlsZU5vZGUpO1xuICAgIHRoaXMudmlldy5jcmVhdGVNZXRob2QuYWRkU3RtdChjcmVhdGVSZW5kZXJOb2RlKTtcbiAgICB0aGlzLl9hZGRSb290Tm9kZUFuZFByb2plY3QoY29tcGlsZU5vZGUsIG5nQ29udGVudEluZGV4LCBwYXJlbnQpO1xuICAgIHJldHVybiByZW5kZXJOb2RlO1xuICB9XG5cbiAgdmlzaXROZ0NvbnRlbnQoYXN0OiBOZ0NvbnRlbnRBc3QsIHBhcmVudDogQ29tcGlsZUVsZW1lbnQpOiBhbnkge1xuICAgIC8vIHRoZSBwcm9qZWN0ZWQgbm9kZXMgb3JpZ2luYXRlIGZyb20gYSBkaWZmZXJlbnQgdmlldywgc28gd2UgZG9uJ3RcbiAgICAvLyBoYXZlIGRlYnVnIGluZm9ybWF0aW9uIGZvciB0aGVtLi4uXG4gICAgdGhpcy52aWV3LmNyZWF0ZU1ldGhvZC5yZXNldERlYnVnSW5mbyhudWxsLCBhc3QpO1xuICAgIHZhciBwYXJlbnRSZW5kZXJOb2RlID0gdGhpcy5fZ2V0UGFyZW50UmVuZGVyTm9kZShwYXJlbnQpO1xuICAgIHZhciBub2Rlc0V4cHJlc3Npb24gPSBWaWV3UHJvcGVydGllcy5wcm9qZWN0YWJsZU5vZGVzLmtleShcbiAgICAgICAgby5saXRlcmFsKGFzdC5pbmRleCksXG4gICAgICAgIG5ldyBvLkFycmF5VHlwZShvLmltcG9ydFR5cGUodGhpcy52aWV3LmdlbkNvbmZpZy5yZW5kZXJUeXBlcy5yZW5kZXJOb2RlKSkpO1xuICAgIGlmIChwYXJlbnRSZW5kZXJOb2RlICE9PSBvLk5VTExfRVhQUikge1xuICAgICAgdGhpcy52aWV3LmNyZWF0ZU1ldGhvZC5hZGRTdG10KFxuICAgICAgICAgIFZpZXdQcm9wZXJ0aWVzLnJlbmRlcmVyLmNhbGxNZXRob2QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3Byb2plY3ROb2RlcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50UmVuZGVyTm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5mbGF0dGVuTmVzdGVkVmlld1JlbmRlck5vZGVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYWxsRm4oW25vZGVzRXhwcmVzc2lvbl0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgLnRvU3RtdCgpKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2lzUm9vdE5vZGUocGFyZW50KSkge1xuICAgICAgaWYgKHRoaXMudmlldy52aWV3VHlwZSAhPT0gVmlld1R5cGUuQ09NUE9ORU5UKSB7XG4gICAgICAgIC8vIHN0b3JlIHJvb3Qgbm9kZXMgb25seSBmb3IgZW1iZWRkZWQvaG9zdCB2aWV3c1xuICAgICAgICB0aGlzLnZpZXcucm9vdE5vZGVzT3JBcHBFbGVtZW50cy5wdXNoKG5vZGVzRXhwcmVzc2lvbik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpc1ByZXNlbnQocGFyZW50LmNvbXBvbmVudCkgJiYgaXNQcmVzZW50KGFzdC5uZ0NvbnRlbnRJbmRleCkpIHtcbiAgICAgICAgcGFyZW50LmFkZENvbnRlbnROb2RlKGFzdC5uZ0NvbnRlbnRJbmRleCwgbm9kZXNFeHByZXNzaW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdEVsZW1lbnQoYXN0OiBFbGVtZW50QXN0LCBwYXJlbnQ6IENvbXBpbGVFbGVtZW50KTogYW55IHtcbiAgICB2YXIgbm9kZUluZGV4ID0gdGhpcy52aWV3Lm5vZGVzLmxlbmd0aDtcbiAgICB2YXIgY3JlYXRlUmVuZGVyTm9kZUV4cHI7XG4gICAgdmFyIGRlYnVnQ29udGV4dEV4cHIgPSB0aGlzLnZpZXcuY3JlYXRlTWV0aG9kLnJlc2V0RGVidWdJbmZvRXhwcihub2RlSW5kZXgsIGFzdCk7XG4gICAgaWYgKG5vZGVJbmRleCA9PT0gMCAmJiB0aGlzLnZpZXcudmlld1R5cGUgPT09IFZpZXdUeXBlLkhPU1QpIHtcbiAgICAgIGNyZWF0ZVJlbmRlck5vZGVFeHByID0gby5USElTX0VYUFIuY2FsbE1ldGhvZChcbiAgICAgICAgICAnc2VsZWN0T3JDcmVhdGVIb3N0RWxlbWVudCcsIFtvLmxpdGVyYWwoYXN0Lm5hbWUpLCByb290U2VsZWN0b3JWYXIsIGRlYnVnQ29udGV4dEV4cHJdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3JlYXRlUmVuZGVyTm9kZUV4cHIgPSBWaWV3UHJvcGVydGllcy5yZW5kZXJlci5jYWxsTWV0aG9kKFxuICAgICAgICAgICdjcmVhdGVFbGVtZW50JyxcbiAgICAgICAgICBbdGhpcy5fZ2V0UGFyZW50UmVuZGVyTm9kZShwYXJlbnQpLCBvLmxpdGVyYWwoYXN0Lm5hbWUpLCBkZWJ1Z0NvbnRleHRFeHByXSk7XG4gICAgfVxuICAgIHZhciBmaWVsZE5hbWUgPSBgX2VsXyR7bm9kZUluZGV4fWA7XG4gICAgdGhpcy52aWV3LmZpZWxkcy5wdXNoKFxuICAgICAgICBuZXcgby5DbGFzc0ZpZWxkKGZpZWxkTmFtZSwgby5pbXBvcnRUeXBlKHRoaXMudmlldy5nZW5Db25maWcucmVuZGVyVHlwZXMucmVuZGVyRWxlbWVudCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgW28uU3RtdE1vZGlmaWVyLlByaXZhdGVdKSk7XG4gICAgdGhpcy52aWV3LmNyZWF0ZU1ldGhvZC5hZGRTdG10KG8uVEhJU19FWFBSLnByb3AoZmllbGROYW1lKS5zZXQoY3JlYXRlUmVuZGVyTm9kZUV4cHIpLnRvU3RtdCgpKTtcblxuICAgIHZhciByZW5kZXJOb2RlID0gby5USElTX0VYUFIucHJvcChmaWVsZE5hbWUpO1xuXG4gICAgdmFyIGRpcmVjdGl2ZXMgPSBhc3QuZGlyZWN0aXZlcy5tYXAoZGlyZWN0aXZlQXN0ID0+IGRpcmVjdGl2ZUFzdC5kaXJlY3RpdmUpO1xuICAgIHZhciBjb21wb25lbnQgPSBkaXJlY3RpdmVzLmZpbmQoZGlyZWN0aXZlID0+IGRpcmVjdGl2ZS5pc0NvbXBvbmVudCk7XG4gICAgdmFyIGh0bWxBdHRycyA9IF9yZWFkSHRtbEF0dHJzKGFzdC5hdHRycyk7XG4gICAgdmFyIGF0dHJOYW1lQW5kVmFsdWVzID0gX21lcmdlSHRtbEFuZERpcmVjdGl2ZUF0dHJzKGh0bWxBdHRycywgZGlyZWN0aXZlcyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhdHRyTmFtZUFuZFZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGF0dHJOYW1lID0gYXR0ck5hbWVBbmRWYWx1ZXNbaV1bMF07XG4gICAgICB2YXIgYXR0clZhbHVlID0gYXR0ck5hbWVBbmRWYWx1ZXNbaV1bMV07XG4gICAgICB0aGlzLnZpZXcuY3JlYXRlTWV0aG9kLmFkZFN0bXQoXG4gICAgICAgICAgVmlld1Byb3BlcnRpZXMucmVuZGVyZXIuY2FsbE1ldGhvZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc2V0RWxlbWVudEF0dHJpYnV0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW3JlbmRlck5vZGUsIG8ubGl0ZXJhbChhdHRyTmFtZSksIG8ubGl0ZXJhbChhdHRyVmFsdWUpXSlcbiAgICAgICAgICAgICAgLnRvU3RtdCgpKTtcbiAgICB9XG4gICAgdmFyIGNvbXBpbGVFbGVtZW50ID1cbiAgICAgICAgbmV3IENvbXBpbGVFbGVtZW50KHBhcmVudCwgdGhpcy52aWV3LCBub2RlSW5kZXgsIHJlbmRlck5vZGUsIGFzdCwgY29tcG9uZW50LCBkaXJlY3RpdmVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN0LnByb3ZpZGVycywgYXN0Lmhhc1ZpZXdDb250YWluZXIsIGZhbHNlLCBhc3QucmVmZXJlbmNlcyk7XG4gICAgdGhpcy52aWV3Lm5vZGVzLnB1c2goY29tcGlsZUVsZW1lbnQpO1xuICAgIHZhciBjb21wVmlld0V4cHI6IG8uUmVhZFZhckV4cHIgPSBudWxsO1xuICAgIGlmIChpc1ByZXNlbnQoY29tcG9uZW50KSkge1xuICAgICAgdmFyIG5lc3RlZENvbXBvbmVudElkZW50aWZpZXIgPVxuICAgICAgICAgIG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKHtuYW1lOiBnZXRWaWV3RmFjdG9yeU5hbWUoY29tcG9uZW50LCAwKX0pO1xuICAgICAgdGhpcy50YXJnZXREZXBlbmRlbmNpZXMucHVzaChuZXcgVmlld0NvbXBpbGVEZXBlbmRlbmN5KGNvbXBvbmVudCwgbmVzdGVkQ29tcG9uZW50SWRlbnRpZmllcikpO1xuICAgICAgY29tcFZpZXdFeHByID0gby52YXJpYWJsZShgY29tcFZpZXdfJHtub2RlSW5kZXh9YCk7XG4gICAgICBjb21waWxlRWxlbWVudC5zZXRDb21wb25lbnRWaWV3KGNvbXBWaWV3RXhwcik7XG4gICAgICB0aGlzLnZpZXcuY3JlYXRlTWV0aG9kLmFkZFN0bXQoY29tcFZpZXdFeHByLnNldChvLmltcG9ydEV4cHIobmVzdGVkQ29tcG9uZW50SWRlbnRpZmllcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2FsbEZuKFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZpZXdQcm9wZXJ0aWVzLnZpZXdVdGlscyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVFbGVtZW50LmluamVjdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZUVsZW1lbnQuYXBwRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudG9EZWNsU3RtdCgpKTtcbiAgICB9XG4gICAgY29tcGlsZUVsZW1lbnQuYmVmb3JlQ2hpbGRyZW4oKTtcbiAgICB0aGlzLl9hZGRSb290Tm9kZUFuZFByb2plY3QoY29tcGlsZUVsZW1lbnQsIGFzdC5uZ0NvbnRlbnRJbmRleCwgcGFyZW50KTtcbiAgICB0ZW1wbGF0ZVZpc2l0QWxsKHRoaXMsIGFzdC5jaGlsZHJlbiwgY29tcGlsZUVsZW1lbnQpO1xuICAgIGNvbXBpbGVFbGVtZW50LmFmdGVyQ2hpbGRyZW4odGhpcy52aWV3Lm5vZGVzLmxlbmd0aCAtIG5vZGVJbmRleCAtIDEpO1xuXG4gICAgaWYgKGlzUHJlc2VudChjb21wVmlld0V4cHIpKSB7XG4gICAgICB2YXIgY29kZUdlbkNvbnRlbnROb2RlcztcbiAgICAgIGlmICh0aGlzLnZpZXcuY29tcG9uZW50LnR5cGUuaXNIb3N0KSB7XG4gICAgICAgIGNvZGVHZW5Db250ZW50Tm9kZXMgPSBWaWV3UHJvcGVydGllcy5wcm9qZWN0YWJsZU5vZGVzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29kZUdlbkNvbnRlbnROb2RlcyA9IG8ubGl0ZXJhbEFycihcbiAgICAgICAgICAgIGNvbXBpbGVFbGVtZW50LmNvbnRlbnROb2Rlc0J5TmdDb250ZW50SW5kZXgubWFwKG5vZGVzID0+IGNyZWF0ZUZsYXRBcnJheShub2RlcykpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMudmlldy5jcmVhdGVNZXRob2QuYWRkU3RtdChcbiAgICAgICAgICBjb21wVmlld0V4cHIuY2FsbE1ldGhvZCgnY3JlYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbY29tcGlsZUVsZW1lbnQuZ2V0Q29tcG9uZW50KCksIGNvZGVHZW5Db250ZW50Tm9kZXMsIG8uTlVMTF9FWFBSXSlcbiAgICAgICAgICAgICAgLnRvU3RtdCgpKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdEVtYmVkZGVkVGVtcGxhdGUoYXN0OiBFbWJlZGRlZFRlbXBsYXRlQXN0LCBwYXJlbnQ6IENvbXBpbGVFbGVtZW50KTogYW55IHtcbiAgICB2YXIgbm9kZUluZGV4ID0gdGhpcy52aWV3Lm5vZGVzLmxlbmd0aDtcbiAgICB2YXIgZmllbGROYW1lID0gYF9hbmNob3JfJHtub2RlSW5kZXh9YDtcbiAgICB0aGlzLnZpZXcuZmllbGRzLnB1c2goXG4gICAgICAgIG5ldyBvLkNsYXNzRmllbGQoZmllbGROYW1lLCBvLmltcG9ydFR5cGUodGhpcy52aWV3LmdlbkNvbmZpZy5yZW5kZXJUeXBlcy5yZW5kZXJDb21tZW50KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICBbby5TdG10TW9kaWZpZXIuUHJpdmF0ZV0pKTtcbiAgICB0aGlzLnZpZXcuY3JlYXRlTWV0aG9kLmFkZFN0bXQoXG4gICAgICAgIG8uVEhJU19FWFBSLnByb3AoZmllbGROYW1lKVxuICAgICAgICAgICAgLnNldChWaWV3UHJvcGVydGllcy5yZW5kZXJlci5jYWxsTWV0aG9kKFxuICAgICAgICAgICAgICAgICdjcmVhdGVUZW1wbGF0ZUFuY2hvcicsXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgdGhpcy5fZ2V0UGFyZW50UmVuZGVyTm9kZShwYXJlbnQpLFxuICAgICAgICAgICAgICAgICAgdGhpcy52aWV3LmNyZWF0ZU1ldGhvZC5yZXNldERlYnVnSW5mb0V4cHIobm9kZUluZGV4LCBhc3QpXG4gICAgICAgICAgICAgICAgXSkpXG4gICAgICAgICAgICAudG9TdG10KCkpO1xuICAgIHZhciByZW5kZXJOb2RlID0gby5USElTX0VYUFIucHJvcChmaWVsZE5hbWUpO1xuXG4gICAgdmFyIHRlbXBsYXRlVmFyaWFibGVCaW5kaW5ncyA9IGFzdC52YXJpYWJsZXMubWFwKFxuICAgICAgICB2YXJBc3QgPT4gW3ZhckFzdC52YWx1ZS5sZW5ndGggPiAwID8gdmFyQXN0LnZhbHVlIDogSU1QTElDSVRfVEVNUExBVEVfVkFSLCB2YXJBc3QubmFtZV0pO1xuXG4gICAgdmFyIGRpcmVjdGl2ZXMgPSBhc3QuZGlyZWN0aXZlcy5tYXAoZGlyZWN0aXZlQXN0ID0+IGRpcmVjdGl2ZUFzdC5kaXJlY3RpdmUpO1xuICAgIHZhciBjb21waWxlRWxlbWVudCA9XG4gICAgICAgIG5ldyBDb21waWxlRWxlbWVudChwYXJlbnQsIHRoaXMudmlldywgbm9kZUluZGV4LCByZW5kZXJOb2RlLCBhc3QsIG51bGwsIGRpcmVjdGl2ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBhc3QucHJvdmlkZXJzLCBhc3QuaGFzVmlld0NvbnRhaW5lciwgdHJ1ZSwgYXN0LnJlZmVyZW5jZXMpO1xuICAgIHRoaXMudmlldy5ub2Rlcy5wdXNoKGNvbXBpbGVFbGVtZW50KTtcblxuICAgIHRoaXMubmVzdGVkVmlld0NvdW50Kys7XG4gICAgdmFyIGVtYmVkZGVkVmlldyA9IG5ldyBDb21waWxlVmlldyhcbiAgICAgICAgdGhpcy52aWV3LmNvbXBvbmVudCwgdGhpcy52aWV3LmdlbkNvbmZpZywgdGhpcy52aWV3LnBpcGVNZXRhcywgby5OVUxMX0VYUFIsXG4gICAgICAgIHRoaXMudmlldy52aWV3SW5kZXggKyB0aGlzLm5lc3RlZFZpZXdDb3VudCwgY29tcGlsZUVsZW1lbnQsIHRlbXBsYXRlVmFyaWFibGVCaW5kaW5ncyk7XG4gICAgdGhpcy5uZXN0ZWRWaWV3Q291bnQgKz0gYnVpbGRWaWV3KGVtYmVkZGVkVmlldywgYXN0LmNoaWxkcmVuLCB0aGlzLnRhcmdldERlcGVuZGVuY2llcyk7XG5cbiAgICBjb21waWxlRWxlbWVudC5iZWZvcmVDaGlsZHJlbigpO1xuICAgIHRoaXMuX2FkZFJvb3ROb2RlQW5kUHJvamVjdChjb21waWxlRWxlbWVudCwgYXN0Lm5nQ29udGVudEluZGV4LCBwYXJlbnQpO1xuICAgIGNvbXBpbGVFbGVtZW50LmFmdGVyQ2hpbGRyZW4oMCk7XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0QXR0cihhc3Q6IEF0dHJBc3QsIGN0eDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgdmlzaXREaXJlY3RpdmUoYXN0OiBEaXJlY3RpdmVBc3QsIGN0eDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgdmlzaXRFdmVudChhc3Q6IEJvdW5kRXZlbnRBc3QsIGV2ZW50VGFyZ2V0QW5kTmFtZXM6IE1hcDxzdHJpbmcsIEJvdW5kRXZlbnRBc3Q+KTogYW55IHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0UmVmZXJlbmNlKGFzdDogUmVmZXJlbmNlQXN0LCBjdHg6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIHZpc2l0VmFyaWFibGUoYXN0OiBWYXJpYWJsZUFzdCwgY3R4OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuICB2aXNpdERpcmVjdGl2ZVByb3BlcnR5KGFzdDogQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgdmlzaXRFbGVtZW50UHJvcGVydHkoYXN0OiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbn1cblxuZnVuY3Rpb24gX21lcmdlSHRtbEFuZERpcmVjdGl2ZUF0dHJzKGRlY2xhcmVkSHRtbEF0dHJzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSk6IHN0cmluZ1tdW10ge1xuICB2YXIgcmVzdWx0OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goZGVjbGFyZWRIdG1sQXR0cnMsICh2YWx1ZSwga2V5KSA9PiB7IHJlc3VsdFtrZXldID0gdmFsdWU7IH0pO1xuICBkaXJlY3RpdmVzLmZvckVhY2goZGlyZWN0aXZlTWV0YSA9PiB7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGRpcmVjdGl2ZU1ldGEuaG9zdEF0dHJpYnV0ZXMsICh2YWx1ZSwgbmFtZSkgPT4ge1xuICAgICAgdmFyIHByZXZWYWx1ZSA9IHJlc3VsdFtuYW1lXTtcbiAgICAgIHJlc3VsdFtuYW1lXSA9IGlzUHJlc2VudChwcmV2VmFsdWUpID8gbWVyZ2VBdHRyaWJ1dGVWYWx1ZShuYW1lLCBwcmV2VmFsdWUsIHZhbHVlKSA6IHZhbHVlO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIG1hcFRvS2V5VmFsdWVBcnJheShyZXN1bHQpO1xufVxuXG5mdW5jdGlvbiBfcmVhZEh0bWxBdHRycyhhdHRyczogQXR0ckFzdFtdKToge1trZXk6IHN0cmluZ106IHN0cmluZ30ge1xuICB2YXIgaHRtbEF0dHJzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICBhdHRycy5mb3JFYWNoKChhc3QpID0+IHsgaHRtbEF0dHJzW2FzdC5uYW1lXSA9IGFzdC52YWx1ZTsgfSk7XG4gIHJldHVybiBodG1sQXR0cnM7XG59XG5cbmZ1bmN0aW9uIG1lcmdlQXR0cmlidXRlVmFsdWUoYXR0ck5hbWU6IHN0cmluZywgYXR0clZhbHVlMTogc3RyaW5nLCBhdHRyVmFsdWUyOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoYXR0ck5hbWUgPT0gQ0xBU1NfQVRUUiB8fCBhdHRyTmFtZSA9PSBTVFlMRV9BVFRSKSB7XG4gICAgcmV0dXJuIGAke2F0dHJWYWx1ZTF9ICR7YXR0clZhbHVlMn1gO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBhdHRyVmFsdWUyO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1hcFRvS2V5VmFsdWVBcnJheShkYXRhOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSk6IHN0cmluZ1tdW10ge1xuICB2YXIgZW50cnlBcnJheSA9IFtdO1xuICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goZGF0YSwgKHZhbHVlLCBuYW1lKSA9PiB7IGVudHJ5QXJyYXkucHVzaChbbmFtZSwgdmFsdWVdKTsgfSk7XG4gIC8vIFdlIG5lZWQgdG8gc29ydCB0byBnZXQgYSBkZWZpbmVkIG91dHB1dCBvcmRlclxuICAvLyBmb3IgdGVzdHMgYW5kIGZvciBjYWNoaW5nIGdlbmVyYXRlZCBhcnRpZmFjdHMuLi5cbiAgTGlzdFdyYXBwZXIuc29ydChlbnRyeUFycmF5LCAoZW50cnkxLCBlbnRyeTIpID0+IFN0cmluZ1dyYXBwZXIuY29tcGFyZShlbnRyeTFbMF0sIGVudHJ5MlswXSkpO1xuICB2YXIga2V5VmFsdWVBcnJheSA9IFtdO1xuICBlbnRyeUFycmF5LmZvckVhY2goKGVudHJ5KSA9PiB7IGtleVZhbHVlQXJyYXkucHVzaChbZW50cnlbMF0sIGVudHJ5WzFdXSk7IH0pO1xuICByZXR1cm4ga2V5VmFsdWVBcnJheTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlVmlld1RvcExldmVsU3RtdHModmlldzogQ29tcGlsZVZpZXcsIHRhcmdldFN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10pIHtcbiAgdmFyIG5vZGVEZWJ1Z0luZm9zVmFyOiBvLkV4cHJlc3Npb24gPSBvLk5VTExfRVhQUjtcbiAgaWYgKHZpZXcuZ2VuQ29uZmlnLmdlbkRlYnVnSW5mbykge1xuICAgIG5vZGVEZWJ1Z0luZm9zVmFyID0gby52YXJpYWJsZShgbm9kZURlYnVnSW5mb3NfJHt2aWV3LmNvbXBvbmVudC50eXBlLm5hbWV9JHt2aWV3LnZpZXdJbmRleH1gKTtcbiAgICB0YXJnZXRTdGF0ZW1lbnRzLnB1c2goXG4gICAgICAgICg8by5SZWFkVmFyRXhwcj5ub2RlRGVidWdJbmZvc1ZhcilcbiAgICAgICAgICAgIC5zZXQoby5saXRlcmFsQXJyKHZpZXcubm9kZXMubWFwKGNyZWF0ZVN0YXRpY05vZGVEZWJ1Z0luZm8pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IG8uQXJyYXlUeXBlKG5ldyBvLkV4dGVybmFsVHlwZShJZGVudGlmaWVycy5TdGF0aWNOb2RlRGVidWdJbmZvKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbby5UeXBlTW9kaWZpZXIuQ29uc3RdKSkpXG4gICAgICAgICAgICAudG9EZWNsU3RtdChudWxsLCBbby5TdG10TW9kaWZpZXIuRmluYWxdKSk7XG4gIH1cblxuXG4gIHZhciByZW5kZXJDb21wVHlwZVZhcjogby5SZWFkVmFyRXhwciA9IG8udmFyaWFibGUoYHJlbmRlclR5cGVfJHt2aWV3LmNvbXBvbmVudC50eXBlLm5hbWV9YCk7XG4gIGlmICh2aWV3LnZpZXdJbmRleCA9PT0gMCkge1xuICAgIHRhcmdldFN0YXRlbWVudHMucHVzaChyZW5kZXJDb21wVHlwZVZhci5zZXQoby5OVUxMX0VYUFIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudG9EZWNsU3RtdChvLmltcG9ydFR5cGUoSWRlbnRpZmllcnMuUmVuZGVyQ29tcG9uZW50VHlwZSkpKTtcbiAgfVxuXG4gIHZhciB2aWV3Q2xhc3MgPSBjcmVhdGVWaWV3Q2xhc3ModmlldywgcmVuZGVyQ29tcFR5cGVWYXIsIG5vZGVEZWJ1Z0luZm9zVmFyKTtcbiAgdGFyZ2V0U3RhdGVtZW50cy5wdXNoKHZpZXdDbGFzcyk7XG4gIHRhcmdldFN0YXRlbWVudHMucHVzaChjcmVhdGVWaWV3RmFjdG9yeSh2aWV3LCB2aWV3Q2xhc3MsIHJlbmRlckNvbXBUeXBlVmFyKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN0YXRpY05vZGVEZWJ1Z0luZm8obm9kZTogQ29tcGlsZU5vZGUpOiBvLkV4cHJlc3Npb24ge1xuICB2YXIgY29tcGlsZUVsZW1lbnQgPSBub2RlIGluc3RhbmNlb2YgQ29tcGlsZUVsZW1lbnQgPyBub2RlIDogbnVsbDtcbiAgdmFyIHByb3ZpZGVyVG9rZW5zOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuICB2YXIgY29tcG9uZW50VG9rZW46IG8uRXhwcmVzc2lvbiA9IG8uTlVMTF9FWFBSO1xuICB2YXIgdmFyVG9rZW5FbnRyaWVzID0gW107XG4gIGlmIChpc1ByZXNlbnQoY29tcGlsZUVsZW1lbnQpKSB7XG4gICAgcHJvdmlkZXJUb2tlbnMgPSBjb21waWxlRWxlbWVudC5nZXRQcm92aWRlclRva2VucygpO1xuICAgIGlmIChpc1ByZXNlbnQoY29tcGlsZUVsZW1lbnQuY29tcG9uZW50KSkge1xuICAgICAgY29tcG9uZW50VG9rZW4gPSBjcmVhdGVEaVRva2VuRXhwcmVzc2lvbihpZGVudGlmaWVyVG9rZW4oY29tcGlsZUVsZW1lbnQuY29tcG9uZW50LnR5cGUpKTtcbiAgICB9XG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGNvbXBpbGVFbGVtZW50LnJlZmVyZW5jZVRva2VucywgKHRva2VuLCB2YXJOYW1lKSA9PiB7XG4gICAgICB2YXJUb2tlbkVudHJpZXMucHVzaChcbiAgICAgICAgICBbdmFyTmFtZSwgaXNQcmVzZW50KHRva2VuKSA/IGNyZWF0ZURpVG9rZW5FeHByZXNzaW9uKHRva2VuKSA6IG8uTlVMTF9FWFBSXSk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5TdGF0aWNOb2RlRGVidWdJbmZvKVxuICAgICAgLmluc3RhbnRpYXRlKFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIG8ubGl0ZXJhbEFycihwcm92aWRlclRva2VucywgbmV3IG8uQXJyYXlUeXBlKG8uRFlOQU1JQ19UWVBFLCBbby5UeXBlTW9kaWZpZXIuQ29uc3RdKSksXG4gICAgICAgICAgICBjb21wb25lbnRUb2tlbixcbiAgICAgICAgICAgIG8ubGl0ZXJhbE1hcCh2YXJUb2tlbkVudHJpZXMsIG5ldyBvLk1hcFR5cGUoby5EWU5BTUlDX1RZUEUsIFtvLlR5cGVNb2RpZmllci5Db25zdF0pKVxuICAgICAgICAgIF0sXG4gICAgICAgICAgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLlN0YXRpY05vZGVEZWJ1Z0luZm8sIG51bGwsIFtvLlR5cGVNb2RpZmllci5Db25zdF0pKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlVmlld0NsYXNzKHZpZXc6IENvbXBpbGVWaWV3LCByZW5kZXJDb21wVHlwZVZhcjogby5SZWFkVmFyRXhwcixcbiAgICAgICAgICAgICAgICAgICAgICAgICBub2RlRGVidWdJbmZvc1Zhcjogby5FeHByZXNzaW9uKTogby5DbGFzc1N0bXQge1xuICB2YXIgdmlld0NvbnN0cnVjdG9yQXJncyA9IFtcbiAgICBuZXcgby5GblBhcmFtKFZpZXdDb25zdHJ1Y3RvclZhcnMudmlld1V0aWxzLm5hbWUsIG8uaW1wb3J0VHlwZShJZGVudGlmaWVycy5WaWV3VXRpbHMpKSxcbiAgICBuZXcgby5GblBhcmFtKFZpZXdDb25zdHJ1Y3RvclZhcnMucGFyZW50SW5qZWN0b3IubmFtZSwgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLkluamVjdG9yKSksXG4gICAgbmV3IG8uRm5QYXJhbShWaWV3Q29uc3RydWN0b3JWYXJzLmRlY2xhcmF0aW9uRWwubmFtZSwgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLkFwcEVsZW1lbnQpKVxuICBdO1xuICB2YXIgc3VwZXJDb25zdHJ1Y3RvckFyZ3MgPSBbXG4gICAgby52YXJpYWJsZSh2aWV3LmNsYXNzTmFtZSksXG4gICAgcmVuZGVyQ29tcFR5cGVWYXIsXG4gICAgVmlld1R5cGVFbnVtLmZyb21WYWx1ZSh2aWV3LnZpZXdUeXBlKSxcbiAgICBWaWV3Q29uc3RydWN0b3JWYXJzLnZpZXdVdGlscyxcbiAgICBWaWV3Q29uc3RydWN0b3JWYXJzLnBhcmVudEluamVjdG9yLFxuICAgIFZpZXdDb25zdHJ1Y3RvclZhcnMuZGVjbGFyYXRpb25FbCxcbiAgICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneUVudW0uZnJvbVZhbHVlKGdldENoYW5nZURldGVjdGlvbk1vZGUodmlldykpXG4gIF07XG4gIGlmICh2aWV3LmdlbkNvbmZpZy5nZW5EZWJ1Z0luZm8pIHtcbiAgICBzdXBlckNvbnN0cnVjdG9yQXJncy5wdXNoKG5vZGVEZWJ1Z0luZm9zVmFyKTtcbiAgfVxuICB2YXIgdmlld0NvbnN0cnVjdG9yID0gbmV3IG8uQ2xhc3NNZXRob2QobnVsbCwgdmlld0NvbnN0cnVjdG9yQXJncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtvLlNVUEVSX0VYUFIuY2FsbEZuKHN1cGVyQ29uc3RydWN0b3JBcmdzKS50b1N0bXQoKV0pO1xuXG4gIHZhciB2aWV3TWV0aG9kcyA9IFtcbiAgICBuZXcgby5DbGFzc01ldGhvZCgnY3JlYXRlSW50ZXJuYWwnLCBbbmV3IG8uRm5QYXJhbShyb290U2VsZWN0b3JWYXIubmFtZSwgby5TVFJJTkdfVFlQRSldLFxuICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlQ3JlYXRlTWV0aG9kKHZpZXcpLCBvLmltcG9ydFR5cGUoSWRlbnRpZmllcnMuQXBwRWxlbWVudCkpLFxuICAgIG5ldyBvLkNsYXNzTWV0aG9kKFxuICAgICAgICAnaW5qZWN0b3JHZXRJbnRlcm5hbCcsXG4gICAgICAgIFtcbiAgICAgICAgICBuZXcgby5GblBhcmFtKEluamVjdE1ldGhvZFZhcnMudG9rZW4ubmFtZSwgby5EWU5BTUlDX1RZUEUpLFxuICAgICAgICAgIC8vIE5vdGU6IENhbid0IHVzZSBvLklOVF9UWVBFIGhlcmUgYXMgdGhlIG1ldGhvZCBpbiBBcHBWaWV3IHVzZXMgbnVtYmVyXG4gICAgICAgICAgbmV3IG8uRm5QYXJhbShJbmplY3RNZXRob2RWYXJzLnJlcXVlc3ROb2RlSW5kZXgubmFtZSwgby5OVU1CRVJfVFlQRSksXG4gICAgICAgICAgbmV3IG8uRm5QYXJhbShJbmplY3RNZXRob2RWYXJzLm5vdEZvdW5kUmVzdWx0Lm5hbWUsIG8uRFlOQU1JQ19UWVBFKVxuICAgICAgICBdLFxuICAgICAgICBhZGRSZXR1cm5WYWx1ZWZOb3RFbXB0eSh2aWV3LmluamVjdG9yR2V0TWV0aG9kLmZpbmlzaCgpLCBJbmplY3RNZXRob2RWYXJzLm5vdEZvdW5kUmVzdWx0KSxcbiAgICAgICAgby5EWU5BTUlDX1RZUEUpLFxuICAgIG5ldyBvLkNsYXNzTWV0aG9kKCdkZXRlY3RDaGFuZ2VzSW50ZXJuYWwnLFxuICAgICAgICAgICAgICAgICAgICAgIFtuZXcgby5GblBhcmFtKERldGVjdENoYW5nZXNWYXJzLnRocm93T25DaGFuZ2UubmFtZSwgby5CT09MX1RZUEUpXSxcbiAgICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZURldGVjdENoYW5nZXNNZXRob2QodmlldykpLFxuICAgIG5ldyBvLkNsYXNzTWV0aG9kKCdkaXJ0eVBhcmVudFF1ZXJpZXNJbnRlcm5hbCcsIFtdLCB2aWV3LmRpcnR5UGFyZW50UXVlcmllc01ldGhvZC5maW5pc2goKSksXG4gICAgbmV3IG8uQ2xhc3NNZXRob2QoJ2Rlc3Ryb3lJbnRlcm5hbCcsIFtdLCB2aWV3LmRlc3Ryb3lNZXRob2QuZmluaXNoKCkpXG4gIF0uY29uY2F0KHZpZXcuZXZlbnRIYW5kbGVyTWV0aG9kcyk7XG4gIHZhciBzdXBlckNsYXNzID0gdmlldy5nZW5Db25maWcuZ2VuRGVidWdJbmZvID8gSWRlbnRpZmllcnMuRGVidWdBcHBWaWV3IDogSWRlbnRpZmllcnMuQXBwVmlldztcbiAgdmFyIHZpZXdDbGFzcyA9IG5ldyBvLkNsYXNzU3RtdCh2aWV3LmNsYXNzTmFtZSwgby5pbXBvcnRFeHByKHN1cGVyQ2xhc3MsIFtnZXRDb250ZXh0VHlwZSh2aWV3KV0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcuZmllbGRzLCB2aWV3LmdldHRlcnMsIHZpZXdDb25zdHJ1Y3RvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3TWV0aG9kcy5maWx0ZXIoKG1ldGhvZCkgPT4gbWV0aG9kLmJvZHkubGVuZ3RoID4gMCkpO1xuICByZXR1cm4gdmlld0NsYXNzO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVWaWV3RmFjdG9yeSh2aWV3OiBDb21waWxlVmlldywgdmlld0NsYXNzOiBvLkNsYXNzU3RtdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckNvbXBUeXBlVmFyOiBvLlJlYWRWYXJFeHByKTogby5TdGF0ZW1lbnQge1xuICB2YXIgdmlld0ZhY3RvcnlBcmdzID0gW1xuICAgIG5ldyBvLkZuUGFyYW0oVmlld0NvbnN0cnVjdG9yVmFycy52aWV3VXRpbHMubmFtZSwgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLlZpZXdVdGlscykpLFxuICAgIG5ldyBvLkZuUGFyYW0oVmlld0NvbnN0cnVjdG9yVmFycy5wYXJlbnRJbmplY3Rvci5uYW1lLCBvLmltcG9ydFR5cGUoSWRlbnRpZmllcnMuSW5qZWN0b3IpKSxcbiAgICBuZXcgby5GblBhcmFtKFZpZXdDb25zdHJ1Y3RvclZhcnMuZGVjbGFyYXRpb25FbC5uYW1lLCBvLmltcG9ydFR5cGUoSWRlbnRpZmllcnMuQXBwRWxlbWVudCkpXG4gIF07XG4gIHZhciBpbml0UmVuZGVyQ29tcFR5cGVTdG10cyA9IFtdO1xuICB2YXIgdGVtcGxhdGVVcmxJbmZvO1xuICBpZiAodmlldy5jb21wb25lbnQudGVtcGxhdGUudGVtcGxhdGVVcmwgPT0gdmlldy5jb21wb25lbnQudHlwZS5tb2R1bGVVcmwpIHtcbiAgICB0ZW1wbGF0ZVVybEluZm8gPVxuICAgICAgICBgJHt2aWV3LmNvbXBvbmVudC50eXBlLm1vZHVsZVVybH0gY2xhc3MgJHt2aWV3LmNvbXBvbmVudC50eXBlLm5hbWV9IC0gaW5saW5lIHRlbXBsYXRlYDtcbiAgfSBlbHNlIHtcbiAgICB0ZW1wbGF0ZVVybEluZm8gPSB2aWV3LmNvbXBvbmVudC50ZW1wbGF0ZS50ZW1wbGF0ZVVybDtcbiAgfVxuICBpZiAodmlldy52aWV3SW5kZXggPT09IDApIHtcbiAgICBpbml0UmVuZGVyQ29tcFR5cGVTdG10cyA9IFtcbiAgICAgIG5ldyBvLklmU3RtdChyZW5kZXJDb21wVHlwZVZhci5pZGVudGljYWwoby5OVUxMX0VYUFIpLFxuICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgIHJlbmRlckNvbXBUeXBlVmFyLnNldChWaWV3Q29uc3RydWN0b3JWYXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC52aWV3VXRpbHMuY2FsbE1ldGhvZCgnY3JlYXRlUmVuZGVyQ29tcG9uZW50VHlwZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbCh0ZW1wbGF0ZVVybEluZm8pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWwodmlldy5jb21wb25lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGVtcGxhdGUubmdDb250ZW50U2VsZWN0b3JzLmxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZpZXdFbmNhcHN1bGF0aW9uRW51bVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZyb21WYWx1ZSh2aWV3LmNvbXBvbmVudC50ZW1wbGF0ZS5lbmNhcHN1bGF0aW9uKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5zdHlsZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC50b1N0bXQoKVxuICAgICAgICAgICAgICAgICAgIF0pXG4gICAgXTtcbiAgfVxuICByZXR1cm4gby5mbih2aWV3RmFjdG9yeUFyZ3MsIGluaXRSZW5kZXJDb21wVHlwZVN0bXRzLmNvbmNhdChbXG4gICAgICAgICAgICBuZXcgby5SZXR1cm5TdGF0ZW1lbnQoby52YXJpYWJsZSh2aWV3Q2xhc3MubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmluc3RhbnRpYXRlKHZpZXdDbGFzcy5jb25zdHJ1Y3Rvck1ldGhvZC5wYXJhbXMubWFwKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHBhcmFtKSA9PiBvLnZhcmlhYmxlKHBhcmFtLm5hbWUpKSkpXG4gICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG8uaW1wb3J0VHlwZShJZGVudGlmaWVycy5BcHBWaWV3LCBbZ2V0Q29udGV4dFR5cGUodmlldyldKSlcbiAgICAgIC50b0RlY2xTdG10KHZpZXcudmlld0ZhY3RvcnkubmFtZSwgW28uU3RtdE1vZGlmaWVyLkZpbmFsXSk7XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlQ3JlYXRlTWV0aG9kKHZpZXc6IENvbXBpbGVWaWV3KTogby5TdGF0ZW1lbnRbXSB7XG4gIHZhciBwYXJlbnRSZW5kZXJOb2RlRXhwcjogby5FeHByZXNzaW9uID0gby5OVUxMX0VYUFI7XG4gIHZhciBwYXJlbnRSZW5kZXJOb2RlU3RtdHMgPSBbXTtcbiAgaWYgKHZpZXcudmlld1R5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCkge1xuICAgIHBhcmVudFJlbmRlck5vZGVFeHByID0gVmlld1Byb3BlcnRpZXMucmVuZGVyZXIuY2FsbE1ldGhvZChcbiAgICAgICAgJ2NyZWF0ZVZpZXdSb290JywgW28uVEhJU19FWFBSLnByb3AoJ2RlY2xhcmF0aW9uQXBwRWxlbWVudCcpLnByb3AoJ25hdGl2ZUVsZW1lbnQnKV0pO1xuICAgIHBhcmVudFJlbmRlck5vZGVTdG10cyA9IFtcbiAgICAgIHBhcmVudFJlbmRlck5vZGVWYXIuc2V0KHBhcmVudFJlbmRlck5vZGVFeHByKVxuICAgICAgICAgIC50b0RlY2xTdG10KG8uaW1wb3J0VHlwZSh2aWV3LmdlbkNvbmZpZy5yZW5kZXJUeXBlcy5yZW5kZXJOb2RlKSwgW28uU3RtdE1vZGlmaWVyLkZpbmFsXSlcbiAgICBdO1xuICB9XG4gIHZhciByZXN1bHRFeHByOiBvLkV4cHJlc3Npb247XG4gIGlmICh2aWV3LnZpZXdUeXBlID09PSBWaWV3VHlwZS5IT1NUKSB7XG4gICAgcmVzdWx0RXhwciA9ICg8Q29tcGlsZUVsZW1lbnQ+dmlldy5ub2Rlc1swXSkuYXBwRWxlbWVudDtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHRFeHByID0gby5OVUxMX0VYUFI7XG4gIH1cbiAgcmV0dXJuIHBhcmVudFJlbmRlck5vZGVTdG10cy5jb25jYXQodmlldy5jcmVhdGVNZXRob2QuZmluaXNoKCkpXG4gICAgICAuY29uY2F0KFtcbiAgICAgICAgby5USElTX0VYUFIuY2FsbE1ldGhvZCgnaW5pdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlRmxhdEFycmF5KHZpZXcucm9vdE5vZGVzT3JBcHBFbGVtZW50cyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWxBcnIodmlldy5ub2Rlcy5tYXAobm9kZSA9PiBub2RlLnJlbmRlck5vZGUpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbEFycih2aWV3LmRpc3Bvc2FibGVzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbEFycih2aWV3LnN1YnNjcmlwdGlvbnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIC50b1N0bXQoKSxcbiAgICAgICAgbmV3IG8uUmV0dXJuU3RhdGVtZW50KHJlc3VsdEV4cHIpXG4gICAgICBdKTtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVEZXRlY3RDaGFuZ2VzTWV0aG9kKHZpZXc6IENvbXBpbGVWaWV3KTogby5TdGF0ZW1lbnRbXSB7XG4gIHZhciBzdG10cyA9IFtdO1xuICBpZiAodmlldy5kZXRlY3RDaGFuZ2VzSW5JbnB1dHNNZXRob2QuaXNFbXB0eSgpICYmIHZpZXcudXBkYXRlQ29udGVudFF1ZXJpZXNNZXRob2QuaXNFbXB0eSgpICYmXG4gICAgICB2aWV3LmFmdGVyQ29udGVudExpZmVjeWNsZUNhbGxiYWNrc01ldGhvZC5pc0VtcHR5KCkgJiZcbiAgICAgIHZpZXcuZGV0ZWN0Q2hhbmdlc1JlbmRlclByb3BlcnRpZXNNZXRob2QuaXNFbXB0eSgpICYmXG4gICAgICB2aWV3LnVwZGF0ZVZpZXdRdWVyaWVzTWV0aG9kLmlzRW1wdHkoKSAmJiB2aWV3LmFmdGVyVmlld0xpZmVjeWNsZUNhbGxiYWNrc01ldGhvZC5pc0VtcHR5KCkpIHtcbiAgICByZXR1cm4gc3RtdHM7XG4gIH1cbiAgTGlzdFdyYXBwZXIuYWRkQWxsKHN0bXRzLCB2aWV3LmRldGVjdENoYW5nZXNJbklucHV0c01ldGhvZC5maW5pc2goKSk7XG4gIHN0bXRzLnB1c2goXG4gICAgICBvLlRISVNfRVhQUi5jYWxsTWV0aG9kKCdkZXRlY3RDb250ZW50Q2hpbGRyZW5DaGFuZ2VzJywgW0RldGVjdENoYW5nZXNWYXJzLnRocm93T25DaGFuZ2VdKVxuICAgICAgICAgIC50b1N0bXQoKSk7XG4gIHZhciBhZnRlckNvbnRlbnRTdG10cyA9IHZpZXcudXBkYXRlQ29udGVudFF1ZXJpZXNNZXRob2QuZmluaXNoKCkuY29uY2F0KFxuICAgICAgdmlldy5hZnRlckNvbnRlbnRMaWZlY3ljbGVDYWxsYmFja3NNZXRob2QuZmluaXNoKCkpO1xuICBpZiAoYWZ0ZXJDb250ZW50U3RtdHMubGVuZ3RoID4gMCkge1xuICAgIHN0bXRzLnB1c2gobmV3IG8uSWZTdG10KG8ubm90KERldGVjdENoYW5nZXNWYXJzLnRocm93T25DaGFuZ2UpLCBhZnRlckNvbnRlbnRTdG10cykpO1xuICB9XG4gIExpc3RXcmFwcGVyLmFkZEFsbChzdG10cywgdmlldy5kZXRlY3RDaGFuZ2VzUmVuZGVyUHJvcGVydGllc01ldGhvZC5maW5pc2goKSk7XG4gIHN0bXRzLnB1c2goby5USElTX0VYUFIuY2FsbE1ldGhvZCgnZGV0ZWN0Vmlld0NoaWxkcmVuQ2hhbmdlcycsIFtEZXRlY3RDaGFuZ2VzVmFycy50aHJvd09uQ2hhbmdlXSlcbiAgICAgICAgICAgICAgICAgLnRvU3RtdCgpKTtcbiAgdmFyIGFmdGVyVmlld1N0bXRzID1cbiAgICAgIHZpZXcudXBkYXRlVmlld1F1ZXJpZXNNZXRob2QuZmluaXNoKCkuY29uY2F0KHZpZXcuYWZ0ZXJWaWV3TGlmZWN5Y2xlQ2FsbGJhY2tzTWV0aG9kLmZpbmlzaCgpKTtcbiAgaWYgKGFmdGVyVmlld1N0bXRzLmxlbmd0aCA+IDApIHtcbiAgICBzdG10cy5wdXNoKG5ldyBvLklmU3RtdChvLm5vdChEZXRlY3RDaGFuZ2VzVmFycy50aHJvd09uQ2hhbmdlKSwgYWZ0ZXJWaWV3U3RtdHMpKTtcbiAgfVxuXG4gIHZhciB2YXJTdG10cyA9IFtdO1xuICB2YXIgcmVhZFZhcnMgPSBvLmZpbmRSZWFkVmFyTmFtZXMoc3RtdHMpO1xuICBpZiAoU2V0V3JhcHBlci5oYXMocmVhZFZhcnMsIERldGVjdENoYW5nZXNWYXJzLmNoYW5nZWQubmFtZSkpIHtcbiAgICB2YXJTdG10cy5wdXNoKERldGVjdENoYW5nZXNWYXJzLmNoYW5nZWQuc2V0KG8ubGl0ZXJhbCh0cnVlKSkudG9EZWNsU3RtdChvLkJPT0xfVFlQRSkpO1xuICB9XG4gIGlmIChTZXRXcmFwcGVyLmhhcyhyZWFkVmFycywgRGV0ZWN0Q2hhbmdlc1ZhcnMuY2hhbmdlcy5uYW1lKSkge1xuICAgIHZhclN0bXRzLnB1c2goRGV0ZWN0Q2hhbmdlc1ZhcnMuY2hhbmdlcy5zZXQoby5OVUxMX0VYUFIpXG4gICAgICAgICAgICAgICAgICAgICAgLnRvRGVjbFN0bXQobmV3IG8uTWFwVHlwZShvLmltcG9ydFR5cGUoSWRlbnRpZmllcnMuU2ltcGxlQ2hhbmdlKSkpKTtcbiAgfVxuICBpZiAoU2V0V3JhcHBlci5oYXMocmVhZFZhcnMsIERldGVjdENoYW5nZXNWYXJzLnZhbFVud3JhcHBlci5uYW1lKSkge1xuICAgIHZhclN0bXRzLnB1c2goXG4gICAgICAgIERldGVjdENoYW5nZXNWYXJzLnZhbFVud3JhcHBlci5zZXQoby5pbXBvcnRFeHByKElkZW50aWZpZXJzLlZhbHVlVW53cmFwcGVyKS5pbnN0YW50aWF0ZShbXSkpXG4gICAgICAgICAgICAudG9EZWNsU3RtdChudWxsLCBbby5TdG10TW9kaWZpZXIuRmluYWxdKSk7XG4gIH1cbiAgcmV0dXJuIHZhclN0bXRzLmNvbmNhdChzdG10cyk7XG59XG5cbmZ1bmN0aW9uIGFkZFJldHVyblZhbHVlZk5vdEVtcHR5KHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10sIHZhbHVlOiBvLkV4cHJlc3Npb24pOiBvLlN0YXRlbWVudFtdIHtcbiAgaWYgKHN0YXRlbWVudHMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBzdGF0ZW1lbnRzLmNvbmNhdChbbmV3IG8uUmV0dXJuU3RhdGVtZW50KHZhbHVlKV0pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdGF0ZW1lbnRzO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldENvbnRleHRUeXBlKHZpZXc6IENvbXBpbGVWaWV3KTogby5UeXBlIHtcbiAgaWYgKHZpZXcudmlld1R5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCkge1xuICAgIHJldHVybiBvLmltcG9ydFR5cGUodmlldy5jb21wb25lbnQudHlwZSk7XG4gIH1cbiAgcmV0dXJuIG8uRFlOQU1JQ19UWVBFO1xufVxuXG5mdW5jdGlvbiBnZXRDaGFuZ2VEZXRlY3Rpb25Nb2RlKHZpZXc6IENvbXBpbGVWaWV3KTogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kge1xuICB2YXIgbW9kZTogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3k7XG4gIGlmICh2aWV3LnZpZXdUeXBlID09PSBWaWV3VHlwZS5DT01QT05FTlQpIHtcbiAgICBtb2RlID0gaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kodmlldy5jb21wb25lbnQuY2hhbmdlRGV0ZWN0aW9uKSA/XG4gICAgICAgICAgICAgICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja0Fsd2F5cyA6XG4gICAgICAgICAgICAgICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja09uY2U7XG4gIH0gZWxzZSB7XG4gICAgbW9kZSA9IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrQWx3YXlzO1xuICB9XG4gIHJldHVybiBtb2RlO1xufVxuIl19