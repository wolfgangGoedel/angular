var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isPresent, isBlank } from 'angular2/src/facade/lang';
import { Injectable } from 'angular2/core';
import { CompileDiDependencyMetadata, CompileTokenMap } from '../compile_metadata';
import { Identifiers, identifierToken } from '../identifiers';
import * as o from '../output/output_ast';
import { ParseSourceSpan, ParseLocation, ParseSourceFile } from '../parse_util';
import { AppProviderParser } from '../provider_parser';
import { InjectMethodVars } from './constants';
import { createDiTokenExpression, convertValueToOutputAst } from './util';
var mainModuleProp = o.THIS_EXPR.prop('mainModule');
var parentInjectorProp = o.THIS_EXPR.prop('parent');
export class InjectorCompileResult {
    constructor(statements, injectorFactoryVar) {
        this.statements = statements;
        this.injectorFactoryVar = injectorFactoryVar;
    }
}
export let InjectorCompiler = class InjectorCompiler {
    compileInjector(injectorModuleMeta) {
        var builder = new _InjectorBuilder(injectorModuleMeta);
        var sourceFileName = isPresent(injectorModuleMeta.moduleUrl) ?
            `in InjectorModule ${injectorModuleMeta.name} in ${injectorModuleMeta.moduleUrl}` :
            `in InjectorModule ${injectorModuleMeta.name}`;
        var sourceFile = new ParseSourceFile('', sourceFileName);
        var providerParser = new AppProviderParser(new ParseSourceSpan(new ParseLocation(sourceFile, null, null, null), new ParseLocation(sourceFile, null, null, null)), injectorModuleMeta.providers);
        providerParser.parse().forEach((provider) => builder.addProvider(provider));
        var injectorClass = builder.build();
        var injectorFactoryVar = `${injectorClass.name}Factory`;
        var injectorFactoryFnVar = `${injectorClass.name}FactoryClosure`;
        var injectorFactoryFn = o.fn(injectorClass.constructorMethod.params, [
            new o.ReturnStatement(o.variable(injectorClass.name)
                .instantiate(injectorClass.constructorMethod.params.map((param) => o.variable(param.name))))
        ], o.importType(Identifiers.Injector))
            .toDeclStmt(injectorFactoryFnVar);
        var injectorFactoryStmt = o.variable(injectorFactoryVar)
            .set(o.importExpr(Identifiers.InjectorFactory, [o.importType(injectorModuleMeta)])
            .instantiate([o.variable(injectorFactoryFnVar)], o.importType(Identifiers.InjectorFactory, [o.importType(injectorModuleMeta)], [o.TypeModifier.Const])))
            .toDeclStmt(null, [o.StmtModifier.Final]);
        return new InjectorCompileResult([injectorClass, injectorFactoryFn, injectorFactoryStmt], injectorFactoryVar);
    }
};
InjectorCompiler = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], InjectorCompiler);
class _InjectorBuilder {
    constructor(_mainModuleType) {
        this._mainModuleType = _mainModuleType;
        this._instances = new CompileTokenMap();
        this._fields = [];
        this._ctorStmts = [];
        this._getters = [];
        this._needsMainModule = false;
        this._instances.add(identifierToken(Identifiers.Injector), o.THIS_EXPR);
    }
    addProvider(resolvedProvider) {
        var providerValueExpressions = resolvedProvider.providers.map((provider) => this._getProviderValue(provider));
        var propName = `_${resolvedProvider.token.name}_${this._instances.size}`;
        var instance = this._createProviderProperty(propName, resolvedProvider, providerValueExpressions, resolvedProvider.multiProvider, resolvedProvider.eager);
        this._instances.add(resolvedProvider.token, instance);
    }
    build() {
        this._ctorStmts.push(o.SUPER_EXPR.callFn([
            o.variable(parentInjectorProp.name),
            o.literal(this._needsMainModule),
            o.variable(mainModuleProp.name)
        ])
            .toStmt());
        let getMethodStmts = this._instances.keys().map((token) => {
            var providerExpr = this._instances.get(token);
            return new o.IfStmt(InjectMethodVars.token.identical(createDiTokenExpression(token)), [new o.ReturnStatement(providerExpr)]);
        });
        getMethodStmts.push(new o.IfStmt(InjectMethodVars.token.identical(createDiTokenExpression(identifierToken(this._mainModuleType)))
            .and(o.not(mainModuleProp.equals(o.NULL_EXPR))), [new o.ReturnStatement(mainModuleProp)]));
        var methods = [
            new o.ClassMethod('getInternal', [
                new o.FnParam(InjectMethodVars.token.name, o.DYNAMIC_TYPE),
                new o.FnParam(InjectMethodVars.notFoundResult.name, o.DYNAMIC_TYPE)
            ], getMethodStmts.concat([new o.ReturnStatement(InjectMethodVars.notFoundResult)]), o.DYNAMIC_TYPE)
        ];
        var ctor = new o.ClassMethod(null, [
            new o.FnParam(parentInjectorProp.name, o.importType(Identifiers.Injector)),
            new o.FnParam(mainModuleProp.name, o.importType(this._mainModuleType))
        ], this._ctorStmts);
        var injClassName = `${this._mainModuleType.name}Injector`;
        return new o.ClassStmt(injClassName, o.importExpr(Identifiers.CodegenInjector, [o.importType(this._mainModuleType)]), this._fields, this._getters, ctor, methods);
    }
    _getProviderValue(provider) {
        var result;
        if (isPresent(provider.useExisting)) {
            result = this._getDependency(new CompileDiDependencyMetadata({ token: provider.useExisting }));
        }
        else if (isPresent(provider.useFactory)) {
            var deps = isPresent(provider.deps) ? provider.deps : provider.useFactory.diDeps;
            var depsExpr = deps.map((dep) => this._getDependency(dep));
            result = o.importExpr(provider.useFactory).callFn(depsExpr);
        }
        else if (isPresent(provider.useClass)) {
            var deps = isPresent(provider.deps) ? provider.deps : provider.useClass.diDeps;
            var depsExpr = deps.map((dep) => this._getDependency(dep));
            result =
                o.importExpr(provider.useClass).instantiate(depsExpr, o.importType(provider.useClass));
        }
        else {
            result = convertValueToOutputAst(provider.useValue);
        }
        if (isPresent(provider.useProperty)) {
            result = result.prop(provider.useProperty);
        }
        return result;
    }
    _createProviderProperty(propName, provider, providerValueExpressions, isMulti, isEager) {
        var resolvedProviderValueExpr;
        var type;
        if (isMulti) {
            resolvedProviderValueExpr = o.literalArr(providerValueExpressions);
            type = new o.ArrayType(o.DYNAMIC_TYPE);
        }
        else {
            resolvedProviderValueExpr = providerValueExpressions[0];
            type = providerValueExpressions[0].type;
        }
        if (isBlank(type)) {
            type = o.DYNAMIC_TYPE;
        }
        if (isEager) {
            this._fields.push(new o.ClassField(propName, type));
            this._ctorStmts.push(o.THIS_EXPR.prop(propName).set(resolvedProviderValueExpr).toStmt());
        }
        else {
            var internalField = `_${propName}`;
            this._fields.push(new o.ClassField(internalField, type));
            // Note: Equals is important for JS so that it also checks the undefined case!
            var getterStmts = [
                new o.IfStmt(o.THIS_EXPR.prop(internalField).isBlank(), [o.THIS_EXPR.prop(internalField).set(resolvedProviderValueExpr).toStmt()]),
                new o.ReturnStatement(o.THIS_EXPR.prop(internalField))
            ];
            this._getters.push(new o.ClassGetter(propName, getterStmts, type));
        }
        return o.THIS_EXPR.prop(propName);
    }
    _getDependency(dep) {
        var result = null;
        if (dep.isValue) {
            result = o.literal(dep.value);
        }
        if (!dep.isSkipSelf) {
            if (isBlank(result)) {
                result = this._instances.get(dep.token);
            }
            if (isBlank(result) && dep.token.equalsTo(identifierToken(this._mainModuleType))) {
                this._needsMainModule = true;
                result = mainModuleProp;
            }
        }
        if (isBlank(result)) {
            var args = [createDiTokenExpression(dep.token)];
            if (dep.isOptional) {
                args.push(o.NULL_EXPR);
            }
            result = parentInjectorProp.callMethod('get', args);
        }
        return result;
    }
}
