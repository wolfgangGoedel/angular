'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var o = require('./output_ast');
var abstract_emitter_1 = require('./abstract_emitter');
var path_util_1 = require('./path_util');
var _debugModuleUrl = 'asset://debug/lib';
var _METADATA_MAP_VAR = "_METADATA";
function debugOutputAstAsDart(ast) {
    var converter = new _DartEmitterVisitor(_debugModuleUrl);
    var ctx = abstract_emitter_1.EmitterVisitorContext.createRoot([]);
    var asts;
    if (lang_1.isArray(ast)) {
        asts = ast;
    }
    else {
        asts = [ast];
    }
    asts.forEach(function (ast) {
        if (ast instanceof o.Statement) {
            ast.visitStatement(converter, ctx);
        }
        else if (ast instanceof o.Expression) {
            ast.visitExpression(converter, ctx);
        }
        else if (ast instanceof o.Type) {
            ast.visitType(converter, ctx);
        }
        else {
            throw new exceptions_1.BaseException("Don't know how to print debug info for " + ast);
        }
    });
    return ctx.toSource();
}
exports.debugOutputAstAsDart = debugOutputAstAsDart;
var DartEmitter = (function () {
    function DartEmitter() {
    }
    DartEmitter.prototype.emitStatements = function (moduleUrl, stmts, exportedVars) {
        var srcParts = [];
        // Note: We are not creating a library here as Dart does not need it.
        // Dart analzyer might complain about it though.
        var converter = new _DartEmitterVisitor(moduleUrl);
        var ctx = abstract_emitter_1.EmitterVisitorContext.createRoot(exportedVars);
        converter.visitAllStatements(stmts, ctx);
        converter.importsWithPrefixes.forEach(function (prefix, importedModuleUrl) {
            srcParts.push("import '" + path_util_1.getImportModulePath(moduleUrl, importedModuleUrl, path_util_1.ImportEnv.Dart) + "' as " + prefix + ";");
        });
        srcParts.push(ctx.toSource());
        return srcParts.join('\n');
    };
    return DartEmitter;
}());
exports.DartEmitter = DartEmitter;
var _DartEmitterVisitor = (function (_super) {
    __extends(_DartEmitterVisitor, _super);
    function _DartEmitterVisitor(_moduleUrl) {
        _super.call(this, true);
        this._moduleUrl = _moduleUrl;
        this.importsWithPrefixes = new Map();
    }
    _DartEmitterVisitor.prototype.visitExternalExpr = function (ast, ctx) {
        this._visitIdentifier(ast.value, ast.typeParams, ctx);
        return null;
    };
    _DartEmitterVisitor.prototype.visitDeclareVarStmt = function (stmt, ctx) {
        if (stmt.hasModifier(o.StmtModifier.Final)) {
            if (isConstType(stmt.type)) {
                ctx.print("const ");
            }
            else {
                ctx.print("final ");
            }
        }
        else if (lang_1.isBlank(stmt.type)) {
            ctx.print("var ");
        }
        if (lang_1.isPresent(stmt.type)) {
            stmt.type.visitType(this, ctx);
            ctx.print(" ");
        }
        ctx.print(stmt.name + " = ");
        stmt.value.visitExpression(this, ctx);
        ctx.println(";");
        return null;
    };
    _DartEmitterVisitor.prototype.visitCastExpr = function (ast, ctx) {
        ctx.print("(");
        ast.value.visitExpression(this, ctx);
        ctx.print(" as ");
        ast.type.visitType(this, ctx);
        ctx.print(")");
        return null;
    };
    _DartEmitterVisitor.prototype.visitDeclareClassStmt = function (stmt, ctx) {
        var _this = this;
        ctx.pushClass(stmt);
        ctx.print("class " + stmt.name);
        if (lang_1.isPresent(stmt.parent)) {
            ctx.print(" extends ");
            stmt.parent.visitExpression(this, ctx);
        }
        ctx.println(" {");
        ctx.incIndent();
        stmt.fields.forEach(function (field) { return _this._visitClassField(field, ctx); });
        if (lang_1.isPresent(stmt.constructorMethod)) {
            this._visitClassConstructor(stmt, ctx);
        }
        stmt.getters.forEach(function (getter) { return _this._visitClassGetter(getter, ctx); });
        stmt.methods.forEach(function (method) { return _this._visitClassMethod(method, ctx); });
        ctx.decIndent();
        ctx.println("}");
        ctx.popClass();
        return null;
    };
    _DartEmitterVisitor.prototype._visitClassField = function (field, ctx) {
        if (field.hasModifier(o.StmtModifier.Final)) {
            ctx.print("final ");
        }
        else if (lang_1.isBlank(field.type)) {
            ctx.print("var ");
        }
        if (lang_1.isPresent(field.type)) {
            field.type.visitType(this, ctx);
            ctx.print(" ");
        }
        ctx.println(field.name + ";");
    };
    _DartEmitterVisitor.prototype._visitClassGetter = function (getter, ctx) {
        if (lang_1.isPresent(getter.type)) {
            getter.type.visitType(this, ctx);
            ctx.print(" ");
        }
        ctx.println("get " + getter.name + " {");
        ctx.incIndent();
        this.visitAllStatements(getter.body, ctx);
        ctx.decIndent();
        ctx.println("}");
    };
    _DartEmitterVisitor.prototype._visitClassConstructor = function (stmt, ctx) {
        ctx.print(stmt.name + "(");
        this._visitParams(stmt.constructorMethod.params, ctx);
        ctx.print(")");
        var ctorStmts = stmt.constructorMethod.body;
        var superCtorExpr = ctorStmts.length > 0 ? getSuperConstructorCallExpr(ctorStmts[0]) : null;
        if (lang_1.isPresent(superCtorExpr)) {
            ctx.print(": ");
            superCtorExpr.visitExpression(this, ctx);
            ctorStmts = ctorStmts.slice(1);
        }
        ctx.println(" {");
        ctx.incIndent();
        this.visitAllStatements(ctorStmts, ctx);
        ctx.decIndent();
        ctx.println("}");
    };
    _DartEmitterVisitor.prototype._visitClassMethod = function (method, ctx) {
        if (lang_1.isPresent(method.type)) {
            method.type.visitType(this, ctx);
        }
        else {
            ctx.print("void");
        }
        ctx.print(" " + method.name + "(");
        this._visitParams(method.params, ctx);
        ctx.println(") {");
        ctx.incIndent();
        this.visitAllStatements(method.body, ctx);
        ctx.decIndent();
        ctx.println("}");
    };
    _DartEmitterVisitor.prototype.visitFunctionExpr = function (ast, ctx) {
        ctx.print("(");
        this._visitParams(ast.params, ctx);
        ctx.println(") {");
        ctx.incIndent();
        this.visitAllStatements(ast.statements, ctx);
        ctx.decIndent();
        ctx.print("}");
        return null;
    };
    _DartEmitterVisitor.prototype.visitDeclareFunctionStmt = function (stmt, ctx) {
        if (lang_1.isPresent(stmt.type)) {
            stmt.type.visitType(this, ctx);
        }
        else {
            ctx.print("void");
        }
        ctx.print(" " + stmt.name + "(");
        this._visitParams(stmt.params, ctx);
        ctx.println(") {");
        ctx.incIndent();
        this.visitAllStatements(stmt.statements, ctx);
        ctx.decIndent();
        ctx.println("}");
        return null;
    };
    _DartEmitterVisitor.prototype.getBuiltinMethodName = function (method) {
        var name;
        switch (method) {
            case o.BuiltinMethod.ConcatArray:
                name = '.addAll';
                break;
            case o.BuiltinMethod.SubscribeObservable:
                name = 'listen';
                break;
            default:
                throw new exceptions_1.BaseException("Unknown builtin method: " + method);
        }
        return name;
    };
    _DartEmitterVisitor.prototype.visitReadVarExpr = function (ast, ctx) {
        if (ast.builtin === o.BuiltinVar.MetadataMap) {
            ctx.print(_METADATA_MAP_VAR);
        }
        else {
            _super.prototype.visitReadVarExpr.call(this, ast, ctx);
        }
        return null;
    };
    _DartEmitterVisitor.prototype.visitTryCatchStmt = function (stmt, ctx) {
        ctx.println("try {");
        ctx.incIndent();
        this.visitAllStatements(stmt.bodyStmts, ctx);
        ctx.decIndent();
        ctx.println("} catch (" + abstract_emitter_1.CATCH_ERROR_VAR.name + ", " + abstract_emitter_1.CATCH_STACK_VAR.name + ") {");
        ctx.incIndent();
        this.visitAllStatements(stmt.catchStmts, ctx);
        ctx.decIndent();
        ctx.println("}");
        return null;
    };
    _DartEmitterVisitor.prototype.visitBinaryOperatorExpr = function (ast, ctx) {
        switch (ast.operator) {
            case o.BinaryOperator.Identical:
                ctx.print("identical(");
                ast.lhs.visitExpression(this, ctx);
                ctx.print(", ");
                ast.rhs.visitExpression(this, ctx);
                ctx.print(")");
                break;
            case o.BinaryOperator.NotIdentical:
                ctx.print("!identical(");
                ast.lhs.visitExpression(this, ctx);
                ctx.print(", ");
                ast.rhs.visitExpression(this, ctx);
                ctx.print(")");
                break;
            default:
                _super.prototype.visitBinaryOperatorExpr.call(this, ast, ctx);
        }
        return null;
    };
    _DartEmitterVisitor.prototype.visitLiteralArrayExpr = function (ast, ctx) {
        if (isConstType(ast.type)) {
            ctx.print("const ");
        }
        return _super.prototype.visitLiteralArrayExpr.call(this, ast, ctx);
    };
    _DartEmitterVisitor.prototype.visitLiteralMapExpr = function (ast, ctx) {
        if (isConstType(ast.type)) {
            ctx.print("const ");
        }
        if (lang_1.isPresent(ast.valueType)) {
            ctx.print("<String, ");
            ast.valueType.visitType(this, ctx);
            ctx.print(">");
        }
        return _super.prototype.visitLiteralMapExpr.call(this, ast, ctx);
    };
    _DartEmitterVisitor.prototype.visitInstantiateExpr = function (ast, ctx) {
        ctx.print(isConstType(ast.type) ? "const" : "new");
        ctx.print(' ');
        ast.classExpr.visitExpression(this, ctx);
        ctx.print("(");
        this.visitAllExpressions(ast.args, ctx, ",");
        ctx.print(")");
        return null;
    };
    _DartEmitterVisitor.prototype.visitBuiltintType = function (type, ctx) {
        var typeStr;
        switch (type.name) {
            case o.BuiltinTypeName.Bool:
                typeStr = 'bool';
                break;
            case o.BuiltinTypeName.Dynamic:
                typeStr = 'dynamic';
                break;
            case o.BuiltinTypeName.Function:
                typeStr = 'Function';
                break;
            case o.BuiltinTypeName.Number:
                typeStr = 'num';
                break;
            case o.BuiltinTypeName.Int:
                typeStr = 'int';
                break;
            case o.BuiltinTypeName.String:
                typeStr = 'String';
                break;
            default:
                throw new exceptions_1.BaseException("Unsupported builtin type " + type.name);
        }
        ctx.print(typeStr);
        return null;
    };
    _DartEmitterVisitor.prototype.visitExternalType = function (ast, ctx) {
        this._visitIdentifier(ast.value, ast.typeParams, ctx);
        return null;
    };
    _DartEmitterVisitor.prototype.visitArrayType = function (type, ctx) {
        ctx.print("List<");
        if (lang_1.isPresent(type.of)) {
            type.of.visitType(this, ctx);
        }
        else {
            ctx.print("dynamic");
        }
        ctx.print(">");
        return null;
    };
    _DartEmitterVisitor.prototype.visitMapType = function (type, ctx) {
        ctx.print("Map<String, ");
        if (lang_1.isPresent(type.valueType)) {
            type.valueType.visitType(this, ctx);
        }
        else {
            ctx.print("dynamic");
        }
        ctx.print(">");
        return null;
    };
    _DartEmitterVisitor.prototype._visitParams = function (params, ctx) {
        var _this = this;
        this.visitAllObjects(function (param) {
            if (lang_1.isPresent(param.type)) {
                param.type.visitType(_this, ctx);
                ctx.print(' ');
            }
            ctx.print(param.name);
        }, params, ctx, ',');
    };
    _DartEmitterVisitor.prototype._visitIdentifier = function (value, typeParams, ctx) {
        var _this = this;
        if (lang_1.isPresent(value.moduleUrl) && value.moduleUrl != this._moduleUrl) {
            var prefix = this.importsWithPrefixes.get(value.moduleUrl);
            if (lang_1.isBlank(prefix)) {
                prefix = "import" + this.importsWithPrefixes.size;
                this.importsWithPrefixes.set(value.moduleUrl, prefix);
            }
            ctx.print(prefix + ".");
        }
        ctx.print(value.name);
        if (lang_1.isPresent(typeParams) && typeParams.length > 0) {
            ctx.print("<");
            this.visitAllObjects(function (type) { return type.visitType(_this, ctx); }, typeParams, ctx, ',');
            ctx.print(">");
        }
    };
    return _DartEmitterVisitor;
}(abstract_emitter_1.AbstractEmitterVisitor));
function getSuperConstructorCallExpr(stmt) {
    if (stmt instanceof o.ExpressionStatement) {
        var expr = stmt.expr;
        if (expr instanceof o.InvokeFunctionExpr) {
            var fn = expr.fn;
            if (fn instanceof o.ReadVarExpr) {
                if (fn.builtin === o.BuiltinVar.Super) {
                    return expr;
                }
            }
        }
    }
    return null;
}
function isConstType(type) {
    return lang_1.isPresent(type) && type.hasModifier(o.TypeModifier.Const);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGFydF9lbWl0dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1BT2FjbVk4VC50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL291dHB1dC9kYXJ0X2VtaXR0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEscUJBUU8sMEJBQTBCLENBQUMsQ0FBQTtBQUVsQywyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUU3RCxJQUFZLENBQUMsV0FBTSxjQUFjLENBQUMsQ0FBQTtBQUNsQyxpQ0FPTyxvQkFBb0IsQ0FBQyxDQUFBO0FBQzVCLDBCQUE2QyxhQUFhLENBQUMsQ0FBQTtBQUUzRCxJQUFJLGVBQWUsR0FBRyxtQkFBbUIsQ0FBQztBQUMxQyxJQUFJLGlCQUFpQixHQUFHLFdBQVcsQ0FBQztBQUVwQyw4QkFBcUMsR0FBZ0Q7SUFDbkYsSUFBSSxTQUFTLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUN6RCxJQUFJLEdBQUcsR0FBRyx3Q0FBcUIsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDL0MsSUFBSSxJQUFXLENBQUM7SUFDaEIsRUFBRSxDQUFDLENBQUMsY0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQixJQUFJLEdBQVUsR0FBRyxDQUFDO0lBQ3BCLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2YsQ0FBQztJQUNELElBQUksQ0FBQyxPQUFPLENBQUMsVUFBQyxHQUFHO1FBQ2YsRUFBRSxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQy9CLEdBQUcsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLEdBQUcsQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLEdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sSUFBSSwwQkFBYSxDQUFDLDRDQUEwQyxHQUFLLENBQUMsQ0FBQztRQUMzRSxDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDSCxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3hCLENBQUM7QUFyQmUsNEJBQW9CLHVCQXFCbkMsQ0FBQTtBQUVEO0lBQ0U7SUFBZSxDQUFDO0lBQ2hCLG9DQUFjLEdBQWQsVUFBZSxTQUFpQixFQUFFLEtBQW9CLEVBQUUsWUFBc0I7UUFDNUUsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLHFFQUFxRTtRQUNyRSxnREFBZ0Q7UUFFaEQsSUFBSSxTQUFTLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuRCxJQUFJLEdBQUcsR0FBRyx3Q0FBcUIsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDekQsU0FBUyxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztRQUV6QyxTQUFTLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTSxFQUFFLGlCQUFpQjtZQUM5RCxRQUFRLENBQUMsSUFBSSxDQUNULGFBQVcsK0JBQW1CLENBQUMsU0FBUyxFQUFFLGlCQUFpQixFQUFFLHFCQUFTLENBQUMsSUFBSSxDQUFDLGFBQVEsTUFBTSxNQUFHLENBQUMsQ0FBQztRQUNyRyxDQUFDLENBQUMsQ0FBQztRQUNILFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDOUIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUNILGtCQUFDO0FBQUQsQ0FBQyxBQWxCRCxJQWtCQztBQWxCWSxtQkFBVyxjQWtCdkIsQ0FBQTtBQUVEO0lBQWtDLHVDQUFzQjtJQUd0RCw2QkFBb0IsVUFBa0I7UUFBSSxrQkFBTSxJQUFJLENBQUMsQ0FBQztRQUFsQyxlQUFVLEdBQVYsVUFBVSxDQUFRO1FBRnRDLHdCQUFtQixHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO0lBRU8sQ0FBQztJQUV4RCwrQ0FBaUIsR0FBakIsVUFBa0IsR0FBbUIsRUFBRSxHQUEwQjtRQUMvRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0QsaURBQW1CLEdBQW5CLFVBQW9CLElBQXNCLEVBQUUsR0FBMEI7UUFDcEUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0IsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN0QixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN0QixDQUFDO1FBQ0gsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxjQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BCLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxnQkFBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQy9CLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakIsQ0FBQztRQUNELEdBQUcsQ0FBQyxLQUFLLENBQUksSUFBSSxDQUFDLElBQUksUUFBSyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3RDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFDRCwyQ0FBYSxHQUFiLFVBQWMsR0FBZSxFQUFFLEdBQTBCO1FBQ3ZELEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDZixHQUFHLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDckMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsQixHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDOUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0QsbURBQXFCLEdBQXJCLFVBQXNCLElBQWlCLEVBQUUsR0FBMEI7UUFBbkUsaUJBbUJDO1FBbEJDLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEIsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFTLElBQUksQ0FBQyxJQUFNLENBQUMsQ0FBQztRQUNoQyxFQUFFLENBQUMsQ0FBQyxnQkFBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUNELEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEIsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsRUFBakMsQ0FBaUMsQ0FBQyxDQUFDO1FBQ2xFLEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUNELElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTSxJQUFLLE9BQUEsS0FBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsRUFBbkMsQ0FBbUMsQ0FBQyxDQUFDO1FBQ3RFLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTSxJQUFLLE9BQUEsS0FBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsRUFBbkMsQ0FBbUMsQ0FBQyxDQUFDO1FBQ3RFLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNoQixHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ08sOENBQWdCLEdBQXhCLFVBQXlCLEtBQW1CLEVBQUUsR0FBMEI7UUFDdEUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RCLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsY0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwQixDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNoQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLENBQUM7UUFDRCxHQUFHLENBQUMsT0FBTyxDQUFJLEtBQUssQ0FBQyxJQUFJLE1BQUcsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFDTywrQ0FBaUIsR0FBekIsVUFBMEIsTUFBcUIsRUFBRSxHQUEwQjtRQUN6RSxFQUFFLENBQUMsQ0FBQyxnQkFBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2pDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakIsQ0FBQztRQUNELEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBTyxNQUFNLENBQUMsSUFBSSxPQUFJLENBQUMsQ0FBQztRQUNwQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDMUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2hCLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkIsQ0FBQztJQUNPLG9EQUFzQixHQUE5QixVQUErQixJQUFpQixFQUFFLEdBQTBCO1FBQzFFLEdBQUcsQ0FBQyxLQUFLLENBQUksSUFBSSxDQUFDLElBQUksTUFBRyxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3RELEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFZixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDO1FBQzVDLElBQUksYUFBYSxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLDJCQUEyQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUM1RixFQUFFLENBQUMsQ0FBQyxnQkFBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hCLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3pDLFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFDRCxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xCLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3hDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNoQixHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLENBQUM7SUFDTywrQ0FBaUIsR0FBekIsVUFBMEIsTUFBcUIsRUFBRSxHQUEwQjtRQUN6RSxFQUFFLENBQUMsQ0FBQyxnQkFBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEIsQ0FBQztRQUNELEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBSSxNQUFNLENBQUMsSUFBSSxNQUFHLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdEMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQixHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDMUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2hCLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkIsQ0FBQztJQUVELCtDQUFpQixHQUFqQixVQUFrQixHQUFtQixFQUFFLEdBQTBCO1FBQy9ELEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbkMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQixHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDN0MsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2hCLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDZixNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNELHNEQUF3QixHQUF4QixVQUF5QixJQUEyQixFQUFFLEdBQTBCO1FBQzlFLEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwQixDQUFDO1FBQ0QsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFJLElBQUksQ0FBQyxJQUFJLE1BQUcsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNwQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25CLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM5QyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDaEIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELGtEQUFvQixHQUFwQixVQUFxQixNQUF1QjtRQUMxQyxJQUFJLElBQUksQ0FBQztRQUNULE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDZixLQUFLLENBQUMsQ0FBQyxhQUFhLENBQUMsV0FBVztnQkFDOUIsSUFBSSxHQUFHLFNBQVMsQ0FBQztnQkFDakIsS0FBSyxDQUFDO1lBQ1IsS0FBSyxDQUFDLENBQUMsYUFBYSxDQUFDLG1CQUFtQjtnQkFDdEMsSUFBSSxHQUFHLFFBQVEsQ0FBQztnQkFDaEIsS0FBSyxDQUFDO1lBQ1I7Z0JBQ0UsTUFBTSxJQUFJLDBCQUFhLENBQUMsNkJBQTJCLE1BQVEsQ0FBQyxDQUFDO1FBQ2pFLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNELDhDQUFnQixHQUFoQixVQUFpQixHQUFrQixFQUFFLEdBQTBCO1FBQzdELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEtBQUssQ0FBQyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQzdDLEdBQUcsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixnQkFBSyxDQUFDLGdCQUFnQixZQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFDRCwrQ0FBaUIsR0FBakIsVUFBa0IsSUFBb0IsRUFBRSxHQUEwQjtRQUNoRSxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM3QyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDaEIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxjQUFZLGtDQUFlLENBQUMsSUFBSSxVQUFLLGtDQUFlLENBQUMsSUFBSSxRQUFLLENBQUMsQ0FBQztRQUM1RSxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDOUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2hCLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFDRCxxREFBdUIsR0FBdkIsVUFBd0IsR0FBeUIsRUFBRSxHQUEwQjtRQUMzRSxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNyQixLQUFLLENBQUMsQ0FBQyxjQUFjLENBQUMsU0FBUztnQkFDN0IsR0FBRyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDeEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNoQixHQUFHLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ25DLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2YsS0FBSyxDQUFDO1lBQ1IsS0FBSyxDQUFDLENBQUMsY0FBYyxDQUFDLFlBQVk7Z0JBQ2hDLEdBQUcsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ3pCLEdBQUcsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDbkMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDaEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNmLEtBQUssQ0FBQztZQUNSO2dCQUNFLGdCQUFLLENBQUMsdUJBQXVCLFlBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNELG1EQUFxQixHQUFyQixVQUFzQixHQUF1QixFQUFFLEdBQTBCO1FBQ3ZFLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEIsQ0FBQztRQUNELE1BQU0sQ0FBQyxnQkFBSyxDQUFDLHFCQUFxQixZQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBQ0QsaURBQW1CLEdBQW5CLFVBQW9CLEdBQXFCLEVBQUUsR0FBMEI7UUFDbkUsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0QixDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdkIsR0FBRyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ25DLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakIsQ0FBQztRQUNELE1BQU0sQ0FBQyxnQkFBSyxDQUFDLG1CQUFtQixZQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBQ0Qsa0RBQW9CLEdBQXBCLFVBQXFCLEdBQXNCLEVBQUUsR0FBMEI7UUFDckUsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQztRQUNuRCxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsR0FBRyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3pDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDN0MsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0QsK0NBQWlCLEdBQWpCLFVBQWtCLElBQW1CLEVBQUUsR0FBMEI7UUFDL0QsSUFBSSxPQUFPLENBQUM7UUFDWixNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNsQixLQUFLLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSTtnQkFDekIsT0FBTyxHQUFHLE1BQU0sQ0FBQztnQkFDakIsS0FBSyxDQUFDO1lBQ1IsS0FBSyxDQUFDLENBQUMsZUFBZSxDQUFDLE9BQU87Z0JBQzVCLE9BQU8sR0FBRyxTQUFTLENBQUM7Z0JBQ3BCLEtBQUssQ0FBQztZQUNSLEtBQUssQ0FBQyxDQUFDLGVBQWUsQ0FBQyxRQUFRO2dCQUM3QixPQUFPLEdBQUcsVUFBVSxDQUFDO2dCQUNyQixLQUFLLENBQUM7WUFDUixLQUFLLENBQUMsQ0FBQyxlQUFlLENBQUMsTUFBTTtnQkFDM0IsT0FBTyxHQUFHLEtBQUssQ0FBQztnQkFDaEIsS0FBSyxDQUFDO1lBQ1IsS0FBSyxDQUFDLENBQUMsZUFBZSxDQUFDLEdBQUc7Z0JBQ3hCLE9BQU8sR0FBRyxLQUFLLENBQUM7Z0JBQ2hCLEtBQUssQ0FBQztZQUNSLEtBQUssQ0FBQyxDQUFDLGVBQWUsQ0FBQyxNQUFNO2dCQUMzQixPQUFPLEdBQUcsUUFBUSxDQUFDO2dCQUNuQixLQUFLLENBQUM7WUFDUjtnQkFDRSxNQUFNLElBQUksMEJBQWEsQ0FBQyw4QkFBNEIsSUFBSSxDQUFDLElBQU0sQ0FBQyxDQUFDO1FBQ3JFLENBQUM7UUFDRCxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25CLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0QsK0NBQWlCLEdBQWpCLFVBQWtCLEdBQW1CLEVBQUUsR0FBMEI7UUFDL0QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN0RCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNELDRDQUFjLEdBQWQsVUFBZSxJQUFpQixFQUFFLEdBQTBCO1FBQzFELEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkIsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZCLENBQUM7UUFDRCxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFDRCwwQ0FBWSxHQUFaLFVBQWEsSUFBZSxFQUFFLEdBQTBCO1FBQ3RELEdBQUcsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDMUIsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZCLENBQUM7UUFDRCxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFFTywwQ0FBWSxHQUFwQixVQUFxQixNQUFtQixFQUFFLEdBQTBCO1FBQXBFLGlCQVFDO1FBUEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFDLEtBQUs7WUFDekIsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ2hDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDakIsQ0FBQztZQUNELEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hCLENBQUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7SUFFTyw4Q0FBZ0IsR0FBeEIsVUFBeUIsS0FBZ0MsRUFBRSxVQUFvQixFQUN0RCxHQUEwQjtRQURuRCxpQkFnQkM7UUFkQyxFQUFFLENBQUMsQ0FBQyxnQkFBUyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxLQUFLLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3JFLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNELEVBQUUsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLE1BQU0sR0FBRyxXQUFTLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFNLENBQUM7Z0JBQ2xELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN4RCxDQUFDO1lBQ0QsR0FBRyxDQUFDLEtBQUssQ0FBSSxNQUFNLE1BQUcsQ0FBQyxDQUFDO1FBQzFCLENBQUM7UUFDRCxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QixFQUFFLENBQUMsQ0FBQyxnQkFBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRCxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2YsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFDLElBQUksSUFBSyxPQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSSxFQUFFLEdBQUcsQ0FBQyxFQUF6QixDQUF5QixFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDaEYsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQixDQUFDO0lBQ0gsQ0FBQztJQUNILDBCQUFDO0FBQUQsQ0FBQyxBQTFTRCxDQUFrQyx5Q0FBc0IsR0EwU3ZEO0FBRUQscUNBQXFDLElBQWlCO0lBQ3BELEVBQUUsQ0FBQyxDQUFDLElBQUksWUFBWSxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1FBQzFDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDckIsRUFBRSxDQUFDLENBQUMsSUFBSSxZQUFZLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDekMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNqQixFQUFFLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEtBQUssQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUNkLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELHFCQUFxQixJQUFZO0lBQy9CLE1BQU0sQ0FBQyxnQkFBUyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNuRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgU3RyaW5nV3JhcHBlcixcbiAgUmVnRXhwV3JhcHBlcixcbiAgaXNQcmVzZW50LFxuICBpc0JsYW5rLFxuICBNYXRoLFxuICBpc1N0cmluZyxcbiAgaXNBcnJheVxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7Q29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YX0gZnJvbSAnLi4vY29tcGlsZV9tZXRhZGF0YSc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4vb3V0cHV0X2FzdCc7XG5pbXBvcnQge1xuICBPdXRwdXRFbWl0dGVyLFxuICBFbWl0dGVyVmlzaXRvckNvbnRleHQsXG4gIEFic3RyYWN0RW1pdHRlclZpc2l0b3IsXG4gIENBVENIX0VSUk9SX1ZBUixcbiAgQ0FUQ0hfU1RBQ0tfVkFSLFxuICBlc2NhcGVTaW5nbGVRdW90ZVN0cmluZ1xufSBmcm9tICcuL2Fic3RyYWN0X2VtaXR0ZXInO1xuaW1wb3J0IHtnZXRJbXBvcnRNb2R1bGVQYXRoLCBJbXBvcnRFbnZ9IGZyb20gJy4vcGF0aF91dGlsJztcblxudmFyIF9kZWJ1Z01vZHVsZVVybCA9ICdhc3NldDovL2RlYnVnL2xpYic7XG52YXIgX01FVEFEQVRBX01BUF9WQVIgPSBgX01FVEFEQVRBYDtcblxuZXhwb3J0IGZ1bmN0aW9uIGRlYnVnT3V0cHV0QXN0QXNEYXJ0KGFzdDogby5TdGF0ZW1lbnQgfCBvLkV4cHJlc3Npb24gfCBvLlR5cGUgfCBhbnlbXSk6IHN0cmluZyB7XG4gIHZhciBjb252ZXJ0ZXIgPSBuZXcgX0RhcnRFbWl0dGVyVmlzaXRvcihfZGVidWdNb2R1bGVVcmwpO1xuICB2YXIgY3R4ID0gRW1pdHRlclZpc2l0b3JDb250ZXh0LmNyZWF0ZVJvb3QoW10pO1xuICB2YXIgYXN0czogYW55W107XG4gIGlmIChpc0FycmF5KGFzdCkpIHtcbiAgICBhc3RzID0gPGFueVtdPmFzdDtcbiAgfSBlbHNlIHtcbiAgICBhc3RzID0gW2FzdF07XG4gIH1cbiAgYXN0cy5mb3JFYWNoKChhc3QpID0+IHtcbiAgICBpZiAoYXN0IGluc3RhbmNlb2Ygby5TdGF0ZW1lbnQpIHtcbiAgICAgIGFzdC52aXNpdFN0YXRlbWVudChjb252ZXJ0ZXIsIGN0eCk7XG4gICAgfSBlbHNlIGlmIChhc3QgaW5zdGFuY2VvZiBvLkV4cHJlc3Npb24pIHtcbiAgICAgIGFzdC52aXNpdEV4cHJlc3Npb24oY29udmVydGVyLCBjdHgpO1xuICAgIH0gZWxzZSBpZiAoYXN0IGluc3RhbmNlb2Ygby5UeXBlKSB7XG4gICAgICBhc3QudmlzaXRUeXBlKGNvbnZlcnRlciwgY3R4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYERvbid0IGtub3cgaG93IHRvIHByaW50IGRlYnVnIGluZm8gZm9yICR7YXN0fWApO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBjdHgudG9Tb3VyY2UoKTtcbn1cblxuZXhwb3J0IGNsYXNzIERhcnRFbWl0dGVyIGltcGxlbWVudHMgT3V0cHV0RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yKCkge31cbiAgZW1pdFN0YXRlbWVudHMobW9kdWxlVXJsOiBzdHJpbmcsIHN0bXRzOiBvLlN0YXRlbWVudFtdLCBleHBvcnRlZFZhcnM6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgICB2YXIgc3JjUGFydHMgPSBbXTtcbiAgICAvLyBOb3RlOiBXZSBhcmUgbm90IGNyZWF0aW5nIGEgbGlicmFyeSBoZXJlIGFzIERhcnQgZG9lcyBub3QgbmVlZCBpdC5cbiAgICAvLyBEYXJ0IGFuYWx6eWVyIG1pZ2h0IGNvbXBsYWluIGFib3V0IGl0IHRob3VnaC5cblxuICAgIHZhciBjb252ZXJ0ZXIgPSBuZXcgX0RhcnRFbWl0dGVyVmlzaXRvcihtb2R1bGVVcmwpO1xuICAgIHZhciBjdHggPSBFbWl0dGVyVmlzaXRvckNvbnRleHQuY3JlYXRlUm9vdChleHBvcnRlZFZhcnMpO1xuICAgIGNvbnZlcnRlci52aXNpdEFsbFN0YXRlbWVudHMoc3RtdHMsIGN0eCk7XG5cbiAgICBjb252ZXJ0ZXIuaW1wb3J0c1dpdGhQcmVmaXhlcy5mb3JFYWNoKChwcmVmaXgsIGltcG9ydGVkTW9kdWxlVXJsKSA9PiB7XG4gICAgICBzcmNQYXJ0cy5wdXNoKFxuICAgICAgICAgIGBpbXBvcnQgJyR7Z2V0SW1wb3J0TW9kdWxlUGF0aChtb2R1bGVVcmwsIGltcG9ydGVkTW9kdWxlVXJsLCBJbXBvcnRFbnYuRGFydCl9JyBhcyAke3ByZWZpeH07YCk7XG4gICAgfSk7XG4gICAgc3JjUGFydHMucHVzaChjdHgudG9Tb3VyY2UoKSk7XG4gICAgcmV0dXJuIHNyY1BhcnRzLmpvaW4oJ1xcbicpO1xuICB9XG59XG5cbmNsYXNzIF9EYXJ0RW1pdHRlclZpc2l0b3IgZXh0ZW5kcyBBYnN0cmFjdEVtaXR0ZXJWaXNpdG9yIGltcGxlbWVudHMgby5UeXBlVmlzaXRvciB7XG4gIGltcG9ydHNXaXRoUHJlZml4ZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX21vZHVsZVVybDogc3RyaW5nKSB7IHN1cGVyKHRydWUpOyB9XG5cbiAgdmlzaXRFeHRlcm5hbEV4cHIoYXN0OiBvLkV4dGVybmFsRXhwciwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIHRoaXMuX3Zpc2l0SWRlbnRpZmllcihhc3QudmFsdWUsIGFzdC50eXBlUGFyYW1zLCBjdHgpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0RGVjbGFyZVZhclN0bXQoc3RtdDogby5EZWNsYXJlVmFyU3RtdCwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGlmIChzdG10Lmhhc01vZGlmaWVyKG8uU3RtdE1vZGlmaWVyLkZpbmFsKSkge1xuICAgICAgaWYgKGlzQ29uc3RUeXBlKHN0bXQudHlwZSkpIHtcbiAgICAgICAgY3R4LnByaW50KGBjb25zdCBgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN0eC5wcmludChgZmluYWwgYCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc0JsYW5rKHN0bXQudHlwZSkpIHtcbiAgICAgIGN0eC5wcmludChgdmFyIGApO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHN0bXQudHlwZSkpIHtcbiAgICAgIHN0bXQudHlwZS52aXNpdFR5cGUodGhpcywgY3R4KTtcbiAgICAgIGN0eC5wcmludChgIGApO1xuICAgIH1cbiAgICBjdHgucHJpbnQoYCR7c3RtdC5uYW1lfSA9IGApO1xuICAgIHN0bXQudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgY3R4LnByaW50bG4oYDtgKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdENhc3RFeHByKGFzdDogby5DYXN0RXhwciwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGN0eC5wcmludChgKGApO1xuICAgIGFzdC52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICBjdHgucHJpbnQoYCBhcyBgKTtcbiAgICBhc3QudHlwZS52aXNpdFR5cGUodGhpcywgY3R4KTtcbiAgICBjdHgucHJpbnQoYClgKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdERlY2xhcmVDbGFzc1N0bXQoc3RtdDogby5DbGFzc1N0bXQsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBjdHgucHVzaENsYXNzKHN0bXQpO1xuICAgIGN0eC5wcmludChgY2xhc3MgJHtzdG10Lm5hbWV9YCk7XG4gICAgaWYgKGlzUHJlc2VudChzdG10LnBhcmVudCkpIHtcbiAgICAgIGN0eC5wcmludChgIGV4dGVuZHMgYCk7XG4gICAgICBzdG10LnBhcmVudC52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICB9XG4gICAgY3R4LnByaW50bG4oYCB7YCk7XG4gICAgY3R4LmluY0luZGVudCgpO1xuICAgIHN0bXQuZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB0aGlzLl92aXNpdENsYXNzRmllbGQoZmllbGQsIGN0eCkpO1xuICAgIGlmIChpc1ByZXNlbnQoc3RtdC5jb25zdHJ1Y3Rvck1ldGhvZCkpIHtcbiAgICAgIHRoaXMuX3Zpc2l0Q2xhc3NDb25zdHJ1Y3RvcihzdG10LCBjdHgpO1xuICAgIH1cbiAgICBzdG10LmdldHRlcnMuZm9yRWFjaCgoZ2V0dGVyKSA9PiB0aGlzLl92aXNpdENsYXNzR2V0dGVyKGdldHRlciwgY3R4KSk7XG4gICAgc3RtdC5tZXRob2RzLmZvckVhY2goKG1ldGhvZCkgPT4gdGhpcy5fdmlzaXRDbGFzc01ldGhvZChtZXRob2QsIGN0eCkpO1xuICAgIGN0eC5kZWNJbmRlbnQoKTtcbiAgICBjdHgucHJpbnRsbihgfWApO1xuICAgIGN0eC5wb3BDbGFzcygpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHByaXZhdGUgX3Zpc2l0Q2xhc3NGaWVsZChmaWVsZDogby5DbGFzc0ZpZWxkLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCkge1xuICAgIGlmIChmaWVsZC5oYXNNb2RpZmllcihvLlN0bXRNb2RpZmllci5GaW5hbCkpIHtcbiAgICAgIGN0eC5wcmludChgZmluYWwgYCk7XG4gICAgfSBlbHNlIGlmIChpc0JsYW5rKGZpZWxkLnR5cGUpKSB7XG4gICAgICBjdHgucHJpbnQoYHZhciBgKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChmaWVsZC50eXBlKSkge1xuICAgICAgZmllbGQudHlwZS52aXNpdFR5cGUodGhpcywgY3R4KTtcbiAgICAgIGN0eC5wcmludChgIGApO1xuICAgIH1cbiAgICBjdHgucHJpbnRsbihgJHtmaWVsZC5uYW1lfTtgKTtcbiAgfVxuICBwcml2YXRlIF92aXNpdENsYXNzR2V0dGVyKGdldHRlcjogby5DbGFzc0dldHRlciwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpIHtcbiAgICBpZiAoaXNQcmVzZW50KGdldHRlci50eXBlKSkge1xuICAgICAgZ2V0dGVyLnR5cGUudmlzaXRUeXBlKHRoaXMsIGN0eCk7XG4gICAgICBjdHgucHJpbnQoYCBgKTtcbiAgICB9XG4gICAgY3R4LnByaW50bG4oYGdldCAke2dldHRlci5uYW1lfSB7YCk7XG4gICAgY3R4LmluY0luZGVudCgpO1xuICAgIHRoaXMudmlzaXRBbGxTdGF0ZW1lbnRzKGdldHRlci5ib2R5LCBjdHgpO1xuICAgIGN0eC5kZWNJbmRlbnQoKTtcbiAgICBjdHgucHJpbnRsbihgfWApO1xuICB9XG4gIHByaXZhdGUgX3Zpc2l0Q2xhc3NDb25zdHJ1Y3RvcihzdG10OiBvLkNsYXNzU3RtdCwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpIHtcbiAgICBjdHgucHJpbnQoYCR7c3RtdC5uYW1lfShgKTtcbiAgICB0aGlzLl92aXNpdFBhcmFtcyhzdG10LmNvbnN0cnVjdG9yTWV0aG9kLnBhcmFtcywgY3R4KTtcbiAgICBjdHgucHJpbnQoYClgKTtcblxuICAgIHZhciBjdG9yU3RtdHMgPSBzdG10LmNvbnN0cnVjdG9yTWV0aG9kLmJvZHk7XG4gICAgdmFyIHN1cGVyQ3RvckV4cHIgPSBjdG9yU3RtdHMubGVuZ3RoID4gMCA/IGdldFN1cGVyQ29uc3RydWN0b3JDYWxsRXhwcihjdG9yU3RtdHNbMF0pIDogbnVsbDtcbiAgICBpZiAoaXNQcmVzZW50KHN1cGVyQ3RvckV4cHIpKSB7XG4gICAgICBjdHgucHJpbnQoYDogYCk7XG4gICAgICBzdXBlckN0b3JFeHByLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgICAgY3RvclN0bXRzID0gY3RvclN0bXRzLnNsaWNlKDEpO1xuICAgIH1cbiAgICBjdHgucHJpbnRsbihgIHtgKTtcbiAgICBjdHguaW5jSW5kZW50KCk7XG4gICAgdGhpcy52aXNpdEFsbFN0YXRlbWVudHMoY3RvclN0bXRzLCBjdHgpO1xuICAgIGN0eC5kZWNJbmRlbnQoKTtcbiAgICBjdHgucHJpbnRsbihgfWApO1xuICB9XG4gIHByaXZhdGUgX3Zpc2l0Q2xhc3NNZXRob2QobWV0aG9kOiBvLkNsYXNzTWV0aG9kLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCkge1xuICAgIGlmIChpc1ByZXNlbnQobWV0aG9kLnR5cGUpKSB7XG4gICAgICBtZXRob2QudHlwZS52aXNpdFR5cGUodGhpcywgY3R4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LnByaW50KGB2b2lkYCk7XG4gICAgfVxuICAgIGN0eC5wcmludChgICR7bWV0aG9kLm5hbWV9KGApO1xuICAgIHRoaXMuX3Zpc2l0UGFyYW1zKG1ldGhvZC5wYXJhbXMsIGN0eCk7XG4gICAgY3R4LnByaW50bG4oYCkge2ApO1xuICAgIGN0eC5pbmNJbmRlbnQoKTtcbiAgICB0aGlzLnZpc2l0QWxsU3RhdGVtZW50cyhtZXRob2QuYm9keSwgY3R4KTtcbiAgICBjdHguZGVjSW5kZW50KCk7XG4gICAgY3R4LnByaW50bG4oYH1gKTtcbiAgfVxuXG4gIHZpc2l0RnVuY3Rpb25FeHByKGFzdDogby5GdW5jdGlvbkV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBjdHgucHJpbnQoYChgKTtcbiAgICB0aGlzLl92aXNpdFBhcmFtcyhhc3QucGFyYW1zLCBjdHgpO1xuICAgIGN0eC5wcmludGxuKGApIHtgKTtcbiAgICBjdHguaW5jSW5kZW50KCk7XG4gICAgdGhpcy52aXNpdEFsbFN0YXRlbWVudHMoYXN0LnN0YXRlbWVudHMsIGN0eCk7XG4gICAgY3R4LmRlY0luZGVudCgpO1xuICAgIGN0eC5wcmludChgfWApO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0RGVjbGFyZUZ1bmN0aW9uU3RtdChzdG10OiBvLkRlY2xhcmVGdW5jdGlvblN0bXQsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBpZiAoaXNQcmVzZW50KHN0bXQudHlwZSkpIHtcbiAgICAgIHN0bXQudHlwZS52aXNpdFR5cGUodGhpcywgY3R4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LnByaW50KGB2b2lkYCk7XG4gICAgfVxuICAgIGN0eC5wcmludChgICR7c3RtdC5uYW1lfShgKTtcbiAgICB0aGlzLl92aXNpdFBhcmFtcyhzdG10LnBhcmFtcywgY3R4KTtcbiAgICBjdHgucHJpbnRsbihgKSB7YCk7XG4gICAgY3R4LmluY0luZGVudCgpO1xuICAgIHRoaXMudmlzaXRBbGxTdGF0ZW1lbnRzKHN0bXQuc3RhdGVtZW50cywgY3R4KTtcbiAgICBjdHguZGVjSW5kZW50KCk7XG4gICAgY3R4LnByaW50bG4oYH1gKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGdldEJ1aWx0aW5NZXRob2ROYW1lKG1ldGhvZDogby5CdWlsdGluTWV0aG9kKTogc3RyaW5nIHtcbiAgICB2YXIgbmFtZTtcbiAgICBzd2l0Y2ggKG1ldGhvZCkge1xuICAgICAgY2FzZSBvLkJ1aWx0aW5NZXRob2QuQ29uY2F0QXJyYXk6XG4gICAgICAgIG5hbWUgPSAnLmFkZEFsbCc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBvLkJ1aWx0aW5NZXRob2QuU3Vic2NyaWJlT2JzZXJ2YWJsZTpcbiAgICAgICAgbmFtZSA9ICdsaXN0ZW4nO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBVbmtub3duIGJ1aWx0aW4gbWV0aG9kOiAke21ldGhvZH1gKTtcbiAgICB9XG4gICAgcmV0dXJuIG5hbWU7XG4gIH1cbiAgdmlzaXRSZWFkVmFyRXhwcihhc3Q6IG8uUmVhZFZhckV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBpZiAoYXN0LmJ1aWx0aW4gPT09IG8uQnVpbHRpblZhci5NZXRhZGF0YU1hcCkge1xuICAgICAgY3R4LnByaW50KF9NRVRBREFUQV9NQVBfVkFSKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3VwZXIudmlzaXRSZWFkVmFyRXhwcihhc3QsIGN0eCk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0VHJ5Q2F0Y2hTdG10KHN0bXQ6IG8uVHJ5Q2F0Y2hTdG10LCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgY3R4LnByaW50bG4oYHRyeSB7YCk7XG4gICAgY3R4LmluY0luZGVudCgpO1xuICAgIHRoaXMudmlzaXRBbGxTdGF0ZW1lbnRzKHN0bXQuYm9keVN0bXRzLCBjdHgpO1xuICAgIGN0eC5kZWNJbmRlbnQoKTtcbiAgICBjdHgucHJpbnRsbihgfSBjYXRjaCAoJHtDQVRDSF9FUlJPUl9WQVIubmFtZX0sICR7Q0FUQ0hfU1RBQ0tfVkFSLm5hbWV9KSB7YCk7XG4gICAgY3R4LmluY0luZGVudCgpO1xuICAgIHRoaXMudmlzaXRBbGxTdGF0ZW1lbnRzKHN0bXQuY2F0Y2hTdG10cywgY3R4KTtcbiAgICBjdHguZGVjSW5kZW50KCk7XG4gICAgY3R4LnByaW50bG4oYH1gKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdEJpbmFyeU9wZXJhdG9yRXhwcihhc3Q6IG8uQmluYXJ5T3BlcmF0b3JFeHByLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgc3dpdGNoIChhc3Qub3BlcmF0b3IpIHtcbiAgICAgIGNhc2Ugby5CaW5hcnlPcGVyYXRvci5JZGVudGljYWw6XG4gICAgICAgIGN0eC5wcmludChgaWRlbnRpY2FsKGApO1xuICAgICAgICBhc3QubGhzLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgICAgICBjdHgucHJpbnQoYCwgYCk7XG4gICAgICAgIGFzdC5yaHMudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgICAgIGN0eC5wcmludChgKWApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2Ugby5CaW5hcnlPcGVyYXRvci5Ob3RJZGVudGljYWw6XG4gICAgICAgIGN0eC5wcmludChgIWlkZW50aWNhbChgKTtcbiAgICAgICAgYXN0Lmxocy52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICAgICAgY3R4LnByaW50KGAsIGApO1xuICAgICAgICBhc3QucmhzLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgICAgICBjdHgucHJpbnQoYClgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBzdXBlci52aXNpdEJpbmFyeU9wZXJhdG9yRXhwcihhc3QsIGN0eCk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0TGl0ZXJhbEFycmF5RXhwcihhc3Q6IG8uTGl0ZXJhbEFycmF5RXhwciwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGlmIChpc0NvbnN0VHlwZShhc3QudHlwZSkpIHtcbiAgICAgIGN0eC5wcmludChgY29uc3QgYCk7XG4gICAgfVxuICAgIHJldHVybiBzdXBlci52aXNpdExpdGVyYWxBcnJheUV4cHIoYXN0LCBjdHgpO1xuICB9XG4gIHZpc2l0TGl0ZXJhbE1hcEV4cHIoYXN0OiBvLkxpdGVyYWxNYXBFeHByLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgaWYgKGlzQ29uc3RUeXBlKGFzdC50eXBlKSkge1xuICAgICAgY3R4LnByaW50KGBjb25zdCBgKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChhc3QudmFsdWVUeXBlKSkge1xuICAgICAgY3R4LnByaW50KGA8U3RyaW5nLCBgKTtcbiAgICAgIGFzdC52YWx1ZVR5cGUudmlzaXRUeXBlKHRoaXMsIGN0eCk7XG4gICAgICBjdHgucHJpbnQoYD5gKTtcbiAgICB9XG4gICAgcmV0dXJuIHN1cGVyLnZpc2l0TGl0ZXJhbE1hcEV4cHIoYXN0LCBjdHgpO1xuICB9XG4gIHZpc2l0SW5zdGFudGlhdGVFeHByKGFzdDogby5JbnN0YW50aWF0ZUV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBjdHgucHJpbnQoaXNDb25zdFR5cGUoYXN0LnR5cGUpID8gYGNvbnN0YCA6IGBuZXdgKTtcbiAgICBjdHgucHJpbnQoJyAnKTtcbiAgICBhc3QuY2xhc3NFeHByLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIGN0eC5wcmludChgKGApO1xuICAgIHRoaXMudmlzaXRBbGxFeHByZXNzaW9ucyhhc3QuYXJncywgY3R4LCBgLGApO1xuICAgIGN0eC5wcmludChgKWApO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0QnVpbHRpbnRUeXBlKHR5cGU6IG8uQnVpbHRpblR5cGUsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICB2YXIgdHlwZVN0cjtcbiAgICBzd2l0Y2ggKHR5cGUubmFtZSkge1xuICAgICAgY2FzZSBvLkJ1aWx0aW5UeXBlTmFtZS5Cb29sOlxuICAgICAgICB0eXBlU3RyID0gJ2Jvb2wnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2Ugby5CdWlsdGluVHlwZU5hbWUuRHluYW1pYzpcbiAgICAgICAgdHlwZVN0ciA9ICdkeW5hbWljJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIG8uQnVpbHRpblR5cGVOYW1lLkZ1bmN0aW9uOlxuICAgICAgICB0eXBlU3RyID0gJ0Z1bmN0aW9uJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIG8uQnVpbHRpblR5cGVOYW1lLk51bWJlcjpcbiAgICAgICAgdHlwZVN0ciA9ICdudW0nO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2Ugby5CdWlsdGluVHlwZU5hbWUuSW50OlxuICAgICAgICB0eXBlU3RyID0gJ2ludCc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBvLkJ1aWx0aW5UeXBlTmFtZS5TdHJpbmc6XG4gICAgICAgIHR5cGVTdHIgPSAnU3RyaW5nJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgVW5zdXBwb3J0ZWQgYnVpbHRpbiB0eXBlICR7dHlwZS5uYW1lfWApO1xuICAgIH1cbiAgICBjdHgucHJpbnQodHlwZVN0cik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRFeHRlcm5hbFR5cGUoYXN0OiBvLkV4dGVybmFsVHlwZSwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIHRoaXMuX3Zpc2l0SWRlbnRpZmllcihhc3QudmFsdWUsIGFzdC50eXBlUGFyYW1zLCBjdHgpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0QXJyYXlUeXBlKHR5cGU6IG8uQXJyYXlUeXBlLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgY3R4LnByaW50KGBMaXN0PGApO1xuICAgIGlmIChpc1ByZXNlbnQodHlwZS5vZikpIHtcbiAgICAgIHR5cGUub2YudmlzaXRUeXBlKHRoaXMsIGN0eCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eC5wcmludChgZHluYW1pY2ApO1xuICAgIH1cbiAgICBjdHgucHJpbnQoYD5gKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdE1hcFR5cGUodHlwZTogby5NYXBUeXBlLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgY3R4LnByaW50KGBNYXA8U3RyaW5nLCBgKTtcbiAgICBpZiAoaXNQcmVzZW50KHR5cGUudmFsdWVUeXBlKSkge1xuICAgICAgdHlwZS52YWx1ZVR5cGUudmlzaXRUeXBlKHRoaXMsIGN0eCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eC5wcmludChgZHluYW1pY2ApO1xuICAgIH1cbiAgICBjdHgucHJpbnQoYD5gKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0UGFyYW1zKHBhcmFtczogby5GblBhcmFtW10sIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogdm9pZCB7XG4gICAgdGhpcy52aXNpdEFsbE9iamVjdHMoKHBhcmFtKSA9PiB7XG4gICAgICBpZiAoaXNQcmVzZW50KHBhcmFtLnR5cGUpKSB7XG4gICAgICAgIHBhcmFtLnR5cGUudmlzaXRUeXBlKHRoaXMsIGN0eCk7XG4gICAgICAgIGN0eC5wcmludCgnICcpO1xuICAgICAgfVxuICAgICAgY3R4LnByaW50KHBhcmFtLm5hbWUpO1xuICAgIH0sIHBhcmFtcywgY3R4LCAnLCcpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRJZGVudGlmaWVyKHZhbHVlOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLCB0eXBlUGFyYW1zOiBvLlR5cGVbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudCh2YWx1ZS5tb2R1bGVVcmwpICYmIHZhbHVlLm1vZHVsZVVybCAhPSB0aGlzLl9tb2R1bGVVcmwpIHtcbiAgICAgIHZhciBwcmVmaXggPSB0aGlzLmltcG9ydHNXaXRoUHJlZml4ZXMuZ2V0KHZhbHVlLm1vZHVsZVVybCk7XG4gICAgICBpZiAoaXNCbGFuayhwcmVmaXgpKSB7XG4gICAgICAgIHByZWZpeCA9IGBpbXBvcnQke3RoaXMuaW1wb3J0c1dpdGhQcmVmaXhlcy5zaXplfWA7XG4gICAgICAgIHRoaXMuaW1wb3J0c1dpdGhQcmVmaXhlcy5zZXQodmFsdWUubW9kdWxlVXJsLCBwcmVmaXgpO1xuICAgICAgfVxuICAgICAgY3R4LnByaW50KGAke3ByZWZpeH0uYCk7XG4gICAgfVxuICAgIGN0eC5wcmludCh2YWx1ZS5uYW1lKTtcbiAgICBpZiAoaXNQcmVzZW50KHR5cGVQYXJhbXMpICYmIHR5cGVQYXJhbXMubGVuZ3RoID4gMCkge1xuICAgICAgY3R4LnByaW50KGA8YCk7XG4gICAgICB0aGlzLnZpc2l0QWxsT2JqZWN0cygodHlwZSkgPT4gdHlwZS52aXNpdFR5cGUodGhpcywgY3R4KSwgdHlwZVBhcmFtcywgY3R4LCAnLCcpO1xuICAgICAgY3R4LnByaW50KGA+YCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldFN1cGVyQ29uc3RydWN0b3JDYWxsRXhwcihzdG10OiBvLlN0YXRlbWVudCk6IG8uRXhwcmVzc2lvbiB7XG4gIGlmIChzdG10IGluc3RhbmNlb2Ygby5FeHByZXNzaW9uU3RhdGVtZW50KSB7XG4gICAgdmFyIGV4cHIgPSBzdG10LmV4cHI7XG4gICAgaWYgKGV4cHIgaW5zdGFuY2VvZiBvLkludm9rZUZ1bmN0aW9uRXhwcikge1xuICAgICAgdmFyIGZuID0gZXhwci5mbjtcbiAgICAgIGlmIChmbiBpbnN0YW5jZW9mIG8uUmVhZFZhckV4cHIpIHtcbiAgICAgICAgaWYgKGZuLmJ1aWx0aW4gPT09IG8uQnVpbHRpblZhci5TdXBlcikge1xuICAgICAgICAgIHJldHVybiBleHByO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBpc0NvbnN0VHlwZSh0eXBlOiBvLlR5cGUpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzUHJlc2VudCh0eXBlKSAmJiB0eXBlLmhhc01vZGlmaWVyKG8uVHlwZU1vZGlmaWVyLkNvbnN0KTtcbn0iXX0=