import { isPresent, isBlank } from 'angular2/src/facade/lang';
import { ListWrapper } from 'angular2/src/facade/collection';
import { BaseException } from 'angular2/src/facade/exceptions';
import * as o from '../output/output_ast';
import { Identifiers, identifierToken } from '../identifiers';
import { EventHandlerVars } from './constants';
import { CompileQuery, createQueryList, addQueryToTokenMap } from './compile_query';
import { CompileMethod } from './compile_method';
import { ViewType } from 'angular2/src/core/linker/view_type';
import { CompileIdentifierMetadata, CompileTokenMap } from '../compile_metadata';
import { getViewFactoryName, injectFromViewParentInjector, getPropertyInView } from './util';
import { bindPipeDestroyLifecycleCallbacks } from './lifecycle_binder';
export class CompilePipe {
    constructor() {
    }
}
export class CompileView {
    constructor(component, genConfig, pipeMetas, styles, viewIndex, declarationElement, templateVariableBindings) {
        this.component = component;
        this.genConfig = genConfig;
        this.pipeMetas = pipeMetas;
        this.styles = styles;
        this.viewIndex = viewIndex;
        this.declarationElement = declarationElement;
        this.templateVariableBindings = templateVariableBindings;
        this.namedAppElements = [];
        this.nodes = [];
        this.rootNodesOrAppElements = [];
        this.bindings = [];
        this.classStatements = [];
        this.eventHandlerMethods = [];
        this.fields = [];
        this.getters = [];
        this.disposables = [];
        this.subscriptions = [];
        this.pipes = new Map();
        this.variables = new Map();
        this.literalArrayCount = 0;
        this.literalMapCount = 0;
        this.createMethod = new CompileMethod(this);
        this.injectorGetMethod = new CompileMethod(this);
        this.updateContentQueriesMethod = new CompileMethod(this);
        this.dirtyParentQueriesMethod = new CompileMethod(this);
        this.updateViewQueriesMethod = new CompileMethod(this);
        this.detectChangesInInputsMethod = new CompileMethod(this);
        this.detectChangesRenderPropertiesMethod = new CompileMethod(this);
        this.afterContentLifecycleCallbacksMethod = new CompileMethod(this);
        this.afterViewLifecycleCallbacksMethod = new CompileMethod(this);
        this.destroyMethod = new CompileMethod(this);
        this.viewType = getViewType(component, viewIndex);
        this.className = `_View_${component.type.name}${viewIndex}`;
        this.classType = o.importType(new CompileIdentifierMetadata({ name: this.className }));
        this.viewFactory = o.variable(getViewFactoryName(component, viewIndex));
        if (this.viewType === ViewType.COMPONENT || this.viewType === ViewType.HOST) {
            this.componentView = this;
        }
        else {
            this.componentView = this.declarationElement.view.componentView;
        }
        var viewQueries = new CompileTokenMap();
        if (this.viewType === ViewType.COMPONENT) {
            var directiveInstance = o.THIS_EXPR.prop('context');
            ListWrapper.forEachWithIndex(this.component.viewQueries, (queryMeta, queryIndex) => {
                var propName = `_viewQuery_${queryMeta.selectors[0].name}_${queryIndex}`;
                var queryList = createQueryList(queryMeta, directiveInstance, propName, this);
                var query = new CompileQuery(queryMeta, queryList, directiveInstance, this);
                addQueryToTokenMap(viewQueries, query);
            });
            var constructorViewQueryCount = 0;
            this.component.type.diDeps.forEach((dep) => {
                if (isPresent(dep.viewQuery)) {
                    var queryList = o.THIS_EXPR.prop('declarationAppElement')
                        .prop('componentConstructorViewQueries')
                        .key(o.literal(constructorViewQueryCount++));
                    var query = new CompileQuery(dep.viewQuery, queryList, null, this);
                    addQueryToTokenMap(viewQueries, query);
                }
            });
        }
        this.viewQueries = viewQueries;
        templateVariableBindings.forEach((entry) => {
            this.variables.set(entry[1], o.THIS_EXPR.prop('locals').key(o.literal(entry[0])));
        });
        if (!this.declarationElement.isNull()) {
            this.declarationElement.setEmbeddedView(this);
        }
    }
    createPipe(name) {
        var pipeMeta = null;
        for (var i = this.pipeMetas.length - 1; i >= 0; i--) {
            var localPipeMeta = this.pipeMetas[i];
            if (localPipeMeta.name == name) {
                pipeMeta = localPipeMeta;
                break;
            }
        }
        if (isBlank(pipeMeta)) {
            throw new BaseException(`Illegal state: Could not find pipe ${name} although the parser should have detected this error!`);
        }
        var pipeFieldName = pipeMeta.pure ? `_pipe_${name}` : `_pipe_${name}_${this.pipes.size}`;
        var pipeExpr = this.pipes.get(pipeFieldName);
        if (isBlank(pipeExpr)) {
            var deps = pipeMeta.type.diDeps.map((diDep) => {
                if (diDep.token.equalsTo(identifierToken(Identifiers.ChangeDetectorRef))) {
                    return o.THIS_EXPR.prop('ref');
                }
                return injectFromViewParentInjector(diDep.token, false);
            });
            this.fields.push(new o.ClassField(pipeFieldName, o.importType(pipeMeta.type), [o.StmtModifier.Private]));
            this.createMethod.resetDebugInfo(null, null);
            this.createMethod.addStmt(o.THIS_EXPR.prop(pipeFieldName)
                .set(o.importExpr(pipeMeta.type).instantiate(deps))
                .toStmt());
            pipeExpr = o.THIS_EXPR.prop(pipeFieldName);
            this.pipes.set(pipeFieldName, pipeExpr);
            bindPipeDestroyLifecycleCallbacks(pipeMeta, pipeExpr, this);
        }
        return pipeExpr;
    }
    getVariable(name) {
        if (name == EventHandlerVars.event.name) {
            return EventHandlerVars.event;
        }
        var currView = this;
        var result = currView.variables.get(name);
        var viewPath = [];
        while (isBlank(result) && isPresent(currView.declarationElement.view)) {
            currView = currView.declarationElement.view;
            result = currView.variables.get(name);
            viewPath.push(currView);
        }
        if (isPresent(result)) {
            return getPropertyInView(result, viewPath);
        }
        else {
            return null;
        }
    }
    createLiteralArray(values) {
        return o.THIS_EXPR.callMethod('literalArray', [o.literal(this.literalArrayCount++), o.literalArr(values)]);
    }
    createLiteralMap(values) {
        return o.THIS_EXPR.callMethod('literalMap', [o.literal(this.literalMapCount++), o.literalMap(values)]);
    }
    afterNodes() {
        this.viewQueries.values().forEach((queries) => queries.forEach((query) => query.afterChildren(this.updateViewQueriesMethod)));
    }
}
function getViewType(component, embeddedTemplateIndex) {
    if (embeddedTemplateIndex > 0) {
        return ViewType.EMBEDDED;
    }
    else if (component.type.isHost) {
        return ViewType.HOST;
    }
    else {
        return ViewType.COMPONENT;
    }
}
