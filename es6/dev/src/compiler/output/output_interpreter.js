import { isPresent, IS_DART, FunctionWrapper } from 'angular2/src/facade/lang';
import { ObservableWrapper } from 'angular2/src/facade/async';
import * as o from './output_ast';
import { reflector } from 'angular2/src/core/reflection/reflection';
import { BaseException, unimplemented } from 'angular2/src/facade/exceptions';
import { ListWrapper } from 'angular2/src/facade/collection';
import { debugOutputAstAsDart } from './dart_emitter';
import { debugOutputAstAsTypeScript } from './ts_emitter';
export function interpretStatements(statements, resultVar, instanceFactory) {
    var stmtsWithReturn = statements.concat([new o.ReturnStatement(o.variable(resultVar))]);
    var ctx = new _ExecutionContext(null, null, null, null, new Map(), new Map(), new Map(), new Map(), instanceFactory);
    var visitor = new StatementInterpreter();
    var result = visitor.visitAllStatements(stmtsWithReturn, ctx);
    return isPresent(result) ? result.value : null;
}
export class DynamicInstance {
    get props() { return unimplemented(); }
    get getters() { return unimplemented(); }
    get methods() { return unimplemented(); }
    get clazz() { return unimplemented(); }
}
function isDynamicInstance(instance) {
    if (IS_DART) {
        return instance instanceof DynamicInstance;
    }
    else {
        return isPresent(instance) && isPresent(instance.props) && isPresent(instance.getters) &&
            isPresent(instance.methods);
    }
}
function _executeFunctionStatements(varNames, varValues, statements, ctx, visitor) {
    var childCtx = ctx.createChildWihtLocalVars();
    for (var i = 0; i < varNames.length; i++) {
        childCtx.vars.set(varNames[i], varValues[i]);
    }
    var result = visitor.visitAllStatements(statements, childCtx);
    return isPresent(result) ? result.value : null;
}
class _ExecutionContext {
    constructor(parent, superClass, superInstance, className, vars, props, getters, methods, instanceFactory) {
        this.parent = parent;
        this.superClass = superClass;
        this.superInstance = superInstance;
        this.className = className;
        this.vars = vars;
        this.props = props;
        this.getters = getters;
        this.methods = methods;
        this.instanceFactory = instanceFactory;
    }
    createChildWihtLocalVars() {
        return new _ExecutionContext(this, this.superClass, this.superInstance, this.className, new Map(), this.props, this.getters, this.methods, this.instanceFactory);
    }
}
class ReturnValue {
    constructor(value) {
        this.value = value;
    }
}
class _DynamicClass {
    constructor(_classStmt, _ctx, _visitor) {
        this._classStmt = _classStmt;
        this._ctx = _ctx;
        this._visitor = _visitor;
    }
    instantiate(args) {
        var props = new Map();
        var getters = new Map();
        var methods = new Map();
        var superClass = this._classStmt.parent.visitExpression(this._visitor, this._ctx);
        var instanceCtx = new _ExecutionContext(this._ctx, superClass, null, this._classStmt.name, this._ctx.vars, props, getters, methods, this._ctx.instanceFactory);
        this._classStmt.fields.forEach((field) => { props.set(field.name, null); });
        this._classStmt.getters.forEach((getter) => {
            getters.set(getter.name, () => _executeFunctionStatements([], [], getter.body, instanceCtx, this._visitor));
        });
        this._classStmt.methods.forEach((method) => {
            var paramNames = method.params.map(param => param.name);
            methods.set(method.name, _declareFn(paramNames, method.body, instanceCtx, this._visitor));
        });
        var ctorParamNames = this._classStmt.constructorMethod.params.map(param => param.name);
        _executeFunctionStatements(ctorParamNames, args, this._classStmt.constructorMethod.body, instanceCtx, this._visitor);
        return instanceCtx.superInstance;
    }
    debugAst() { return this._visitor.debugAst(this._classStmt); }
}
class StatementInterpreter {
    debugAst(ast) {
        return IS_DART ? debugOutputAstAsDart(ast) : debugOutputAstAsTypeScript(ast);
    }
    visitDeclareVarStmt(stmt, ctx) {
        ctx.vars.set(stmt.name, stmt.value.visitExpression(this, ctx));
        return null;
    }
    visitWriteVarExpr(expr, ctx) {
        var value = expr.value.visitExpression(this, ctx);
        var currCtx = ctx;
        while (currCtx != null) {
            if (currCtx.vars.has(expr.name)) {
                currCtx.vars.set(expr.name, value);
                return value;
            }
            currCtx = currCtx.parent;
        }
        throw new BaseException(`Not declared variable ${expr.name}`);
    }
    visitReadVarExpr(ast, ctx) {
        var varName = ast.name;
        if (isPresent(ast.builtin)) {
            switch (ast.builtin) {
                case o.BuiltinVar.Super:
                case o.BuiltinVar.This:
                    return ctx.superInstance;
                case o.BuiltinVar.CatchError:
                    varName = CATCH_ERROR_VAR;
                    break;
                case o.BuiltinVar.CatchStack:
                    varName = CATCH_STACK_VAR;
                    break;
                case o.BuiltinVar.MetadataMap:
                    return null;
                default:
                    throw new BaseException(`Unknown builtin variable ${ast.builtin}`);
            }
        }
        var currCtx = ctx;
        while (currCtx != null) {
            if (currCtx.vars.has(varName)) {
                return currCtx.vars.get(varName);
            }
            currCtx = currCtx.parent;
        }
        throw new BaseException(`Not declared variable ${varName}`);
    }
    visitWriteKeyExpr(expr, ctx) {
        var receiver = expr.receiver.visitExpression(this, ctx);
        var index = expr.index.visitExpression(this, ctx);
        var value = expr.value.visitExpression(this, ctx);
        receiver[index] = value;
        return value;
    }
    visitWritePropExpr(expr, ctx) {
        var receiver = expr.receiver.visitExpression(this, ctx);
        var value = expr.value.visitExpression(this, ctx);
        if (isDynamicInstance(receiver)) {
            var di = receiver;
            if (di.props.has(expr.name)) {
                di.props.set(expr.name, value);
            }
            else {
                reflector.setter(expr.name)(receiver, value);
            }
        }
        else {
            reflector.setter(expr.name)(receiver, value);
        }
        return value;
    }
    visitInvokeMethodExpr(expr, ctx) {
        var receiver = expr.receiver.visitExpression(this, ctx);
        var args = this.visitAllExpressions(expr.args, ctx);
        var result;
        if (isPresent(expr.builtin)) {
            switch (expr.builtin) {
                case o.BuiltinMethod.ConcatArray:
                    result = ListWrapper.concat(receiver, args[0]);
                    break;
                case o.BuiltinMethod.SubscribeObservable:
                    result = ObservableWrapper.subscribe(receiver, args[0]);
                    break;
                case o.BuiltinMethod.bind:
                    if (IS_DART) {
                        result = receiver;
                    }
                    else {
                        result = receiver.bind(args[0]);
                    }
                    break;
                default:
                    throw new BaseException(`Unknown builtin method ${expr.builtin}`);
            }
        }
        else if (isDynamicInstance(receiver)) {
            var di = receiver;
            if (di.methods.has(expr.name)) {
                result = FunctionWrapper.apply(di.methods.get(expr.name), args);
            }
            else {
                result = reflector.method(expr.name)(receiver, args);
            }
        }
        else {
            result = reflector.method(expr.name)(receiver, args);
        }
        return result;
    }
    visitInvokeFunctionExpr(stmt, ctx) {
        var args = this.visitAllExpressions(stmt.args, ctx);
        var fnExpr = stmt.fn;
        if (fnExpr instanceof o.ReadVarExpr && fnExpr.builtin === o.BuiltinVar.Super) {
            ctx.superInstance = ctx.instanceFactory.createInstance(ctx.superClass, ctx.className, args, ctx.props, ctx.getters, ctx.methods);
            ctx.parent.superInstance = ctx.superInstance;
            return null;
        }
        else {
            var fn = stmt.fn.visitExpression(this, ctx);
            return FunctionWrapper.apply(fn, args);
        }
    }
    visitReturnStmt(stmt, ctx) {
        return new ReturnValue(stmt.value.visitExpression(this, ctx));
    }
    visitDeclareClassStmt(stmt, ctx) {
        var clazz = new _DynamicClass(stmt, ctx, this);
        ctx.vars.set(stmt.name, clazz);
        return null;
    }
    visitExpressionStmt(stmt, ctx) {
        return stmt.expr.visitExpression(this, ctx);
    }
    visitIfStmt(stmt, ctx) {
        var condition = stmt.condition.visitExpression(this, ctx);
        if (condition) {
            return this.visitAllStatements(stmt.trueCase, ctx);
        }
        else if (isPresent(stmt.falseCase)) {
            return this.visitAllStatements(stmt.falseCase, ctx);
        }
        return null;
    }
    visitTryCatchStmt(stmt, ctx) {
        try {
            return this.visitAllStatements(stmt.bodyStmts, ctx);
        }
        catch (e) {
            var childCtx = ctx.createChildWihtLocalVars();
            childCtx.vars.set(CATCH_ERROR_VAR, e);
            childCtx.vars.set(CATCH_STACK_VAR, e.stack);
            return this.visitAllStatements(stmt.catchStmts, childCtx);
        }
    }
    visitThrowStmt(stmt, ctx) {
        throw stmt.error.visitExpression(this, ctx);
    }
    visitCommentStmt(stmt, context) { return null; }
    visitInstantiateExpr(ast, ctx) {
        var args = this.visitAllExpressions(ast.args, ctx);
        var clazz = ast.classExpr.visitExpression(this, ctx);
        if (clazz instanceof _DynamicClass) {
            return clazz.instantiate(args);
        }
        else {
            return FunctionWrapper.apply(reflector.factory(clazz), args);
        }
    }
    visitLiteralExpr(ast, ctx) { return ast.value; }
    visitExternalExpr(ast, ctx) { return ast.value.runtime; }
    visitConditionalExpr(ast, ctx) {
        if (ast.condition.visitExpression(this, ctx)) {
            return ast.trueCase.visitExpression(this, ctx);
        }
        else if (isPresent(ast.falseCase)) {
            return ast.falseCase.visitExpression(this, ctx);
        }
        return null;
    }
    visitNotExpr(ast, ctx) {
        return !ast.condition.visitExpression(this, ctx);
    }
    visitCastExpr(ast, ctx) {
        return ast.value.visitExpression(this, ctx);
    }
    visitFunctionExpr(ast, ctx) {
        var paramNames = ast.params.map((param) => param.name);
        return _declareFn(paramNames, ast.statements, ctx, this);
    }
    visitDeclareFunctionStmt(stmt, ctx) {
        var paramNames = stmt.params.map((param) => param.name);
        ctx.vars.set(stmt.name, _declareFn(paramNames, stmt.statements, ctx, this));
        return null;
    }
    visitBinaryOperatorExpr(ast, ctx) {
        var lhs = () => ast.lhs.visitExpression(this, ctx);
        var rhs = () => ast.rhs.visitExpression(this, ctx);
        switch (ast.operator) {
            case o.BinaryOperator.Equals:
                return lhs() == rhs();
            case o.BinaryOperator.Identical:
                return lhs() === rhs();
            case o.BinaryOperator.NotEquals:
                return lhs() != rhs();
            case o.BinaryOperator.NotIdentical:
                return lhs() !== rhs();
            case o.BinaryOperator.And:
                return lhs() && rhs();
            case o.BinaryOperator.Or:
                return lhs() || rhs();
            case o.BinaryOperator.Plus:
                return lhs() + rhs();
            case o.BinaryOperator.Minus:
                return lhs() - rhs();
            case o.BinaryOperator.Divide:
                return lhs() / rhs();
            case o.BinaryOperator.Multiply:
                return lhs() * rhs();
            case o.BinaryOperator.Modulo:
                return lhs() % rhs();
            case o.BinaryOperator.Lower:
                return lhs() < rhs();
            case o.BinaryOperator.LowerEquals:
                return lhs() <= rhs();
            case o.BinaryOperator.Bigger:
                return lhs() > rhs();
            case o.BinaryOperator.BiggerEquals:
                return lhs() >= rhs();
            default:
                throw new BaseException(`Unknown operator ${ast.operator}`);
        }
    }
    visitReadPropExpr(ast, ctx) {
        var result;
        var receiver = ast.receiver.visitExpression(this, ctx);
        if (isDynamicInstance(receiver)) {
            var di = receiver;
            if (di.props.has(ast.name)) {
                result = di.props.get(ast.name);
            }
            else if (di.getters.has(ast.name)) {
                result = di.getters.get(ast.name)();
            }
            else if (di.methods.has(ast.name)) {
                result = di.methods.get(ast.name);
            }
            else {
                result = reflector.getter(ast.name)(receiver);
            }
        }
        else {
            result = reflector.getter(ast.name)(receiver);
        }
        return result;
    }
    visitReadKeyExpr(ast, ctx) {
        var receiver = ast.receiver.visitExpression(this, ctx);
        var prop = ast.index.visitExpression(this, ctx);
        return receiver[prop];
    }
    visitLiteralArrayExpr(ast, ctx) {
        return this.visitAllExpressions(ast.entries, ctx);
    }
    visitLiteralMapExpr(ast, ctx) {
        var result = {};
        ast.entries.forEach((entry) => result[entry[0]] =
            entry[1].visitExpression(this, ctx));
        return result;
    }
    visitAllExpressions(expressions, ctx) {
        return expressions.map((expr) => expr.visitExpression(this, ctx));
    }
    visitAllStatements(statements, ctx) {
        for (var i = 0; i < statements.length; i++) {
            var stmt = statements[i];
            var val = stmt.visitStatement(this, ctx);
            if (val instanceof ReturnValue) {
                return val;
            }
        }
        return null;
    }
}
function _declareFn(varNames, statements, ctx, visitor) {
    switch (varNames.length) {
        case 0:
            return () => _executeFunctionStatements(varNames, [], statements, ctx, visitor);
        case 1:
            return (d0) => _executeFunctionStatements(varNames, [d0], statements, ctx, visitor);
        case 2:
            return (d0, d1) => _executeFunctionStatements(varNames, [d0, d1], statements, ctx, visitor);
        case 3:
            return (d0, d1, d2) => _executeFunctionStatements(varNames, [d0, d1, d2], statements, ctx, visitor);
        case 4:
            return (d0, d1, d2, d3) => _executeFunctionStatements(varNames, [d0, d1, d2, d3], statements, ctx, visitor);
        case 5:
            return (d0, d1, d2, d3, d4) => _executeFunctionStatements(varNames, [d0, d1, d2, d3, d4], statements, ctx, visitor);
        case 6:
            return (d0, d1, d2, d3, d4, d5) => _executeFunctionStatements(varNames, [d0, d1, d2, d3, d4, d5], statements, ctx, visitor);
        case 7:
            return (d0, d1, d2, d3, d4, d5, d6) => _executeFunctionStatements(varNames, [d0, d1, d2, d3, d4, d5, d6], statements, ctx, visitor);
        case 8:
            return (d0, d1, d2, d3, d4, d5, d6, d7) => _executeFunctionStatements(varNames, [d0, d1, d2, d3, d4, d5, d6, d7], statements, ctx, visitor);
        case 9:
            return (d0, d1, d2, d3, d4, d5, d6, d7, d8) => _executeFunctionStatements(varNames, [d0, d1, d2, d3, d4, d5, d6, d7, d8], statements, ctx, visitor);
        case 10:
            return (d0, d1, d2, d3, d4, d5, d6, d7, d8, d9) => _executeFunctionStatements(varNames, [d0, d1, d2, d3, d4, d5, d6, d7, d8, d9], statements, ctx, visitor);
        default:
            throw new BaseException('Declaring functions with more than 10 arguments is not supported right now');
    }
}
var CATCH_ERROR_VAR = 'error';
var CATCH_STACK_VAR = 'stack';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0X2ludGVycHJldGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1YNWhldlBwNC50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL291dHB1dC9vdXRwdXRfaW50ZXJwcmV0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ik9BQU8sRUFDTCxTQUFTLEVBSVQsT0FBTyxFQUNQLGVBQWUsRUFDaEIsTUFBTSwwQkFBMEI7T0FDMUIsRUFBQyxpQkFBaUIsRUFBQyxNQUFNLDJCQUEyQjtPQUNwRCxLQUFLLENBQUMsTUFBTSxjQUFjO09BQzFCLEVBQUMsU0FBUyxFQUFDLE1BQU0seUNBQXlDO09BQzFELEVBQUMsYUFBYSxFQUFFLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNwRSxFQUFhLFdBQVcsRUFBQyxNQUFNLGdDQUFnQztPQUMvRCxFQUFDLG9CQUFvQixFQUFDLE1BQU0sZ0JBQWdCO09BQzVDLEVBQUMsMEJBQTBCLEVBQUMsTUFBTSxjQUFjO0FBRXZELG9DQUFvQyxVQUF5QixFQUFFLFNBQWlCLEVBQzVDLGVBQWdDO0lBQ2xFLElBQUksZUFBZSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4RixJQUFJLEdBQUcsR0FBRyxJQUFJLGlCQUFpQixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEdBQUcsRUFBZSxFQUM5QyxJQUFJLEdBQUcsRUFBZSxFQUFFLElBQUksR0FBRyxFQUFvQixFQUNuRCxJQUFJLEdBQUcsRUFBb0IsRUFBRSxlQUFlLENBQUMsQ0FBQztJQUM5RSxJQUFJLE9BQU8sR0FBRyxJQUFJLG9CQUFvQixFQUFFLENBQUM7SUFDekMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFD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QUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssMEJBQTBCLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUM5QixVQUFVLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RGLEtBQUssQ0FBQztZQUNKLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLDBCQUEwQixDQUNsRCxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDM0UsS0FBSyxDQUFDO1lBQ0osTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLDBCQUEwQixDQUN0RCxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQy9FLEtBQUssQ0FBQztZQUNKLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssMEJBQTBCLENBQzFELFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ25GLEtBQUssQ0FBQztZQUNKLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLDBCQUEwQixDQUM5RCxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdkYsS0FBSyxFQUFFO1lBQ0wsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLDBCQUEwQixDQUNsRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNGO1lBQ0UsTUFBTSxJQUFJLGFBQWEsQ0FDbkIsNEVBQTRFLENBQUMsQ0FBQztJQUN0RixDQUFDO0FBQ0gsQ0FBQztBQUVELElBQUksZUFBZSxHQUFHLE9BQU8sQ0FBQztBQUM5QixJQUFJLGVBQWUsR0FBRyxPQUFPLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBpc1ByZXNlbnQsXG4gIGlzQmxhbmssXG4gIGlzU3RyaW5nLFxuICBldmFsRXhwcmVzc2lvbixcbiAgSVNfREFSVCxcbiAgRnVuY3Rpb25XcmFwcGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge09ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi9vdXRwdXRfYXN0JztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCB1bmltcGxlbWVudGVkfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7ZGVidWdPdXRwdXRBc3RBc0RhcnR9IGZyb20gJy4vZGFydF9lbWl0dGVyJztcbmltcG9ydCB7ZGVidWdPdXRwdXRBc3RBc1R5cGVTY3JpcHR9IGZyb20gJy4vdHNfZW1pdHRlcic7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnRlcnByZXRTdGF0ZW1lbnRzKHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10sIHJlc3VsdFZhcjogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VGYWN0b3J5OiBJbnN0YW5jZUZhY3RvcnkpOiBhbnkge1xuICB2YXIgc3RtdHNXaXRoUmV0dXJuID0gc3RhdGVtZW50cy5jb25jYXQoW25ldyBvLlJldHVyblN0YXRlbWVudChvLnZhcmlhYmxlKHJlc3VsdFZhcikpXSk7XG4gIHZhciBjdHggPSBuZXcgX0V4ZWN1dGlvbkNvbnRleHQobnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbmV3IE1hcDxzdHJpbmcsIGFueT4oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgTWFwPHN0cmluZywgYW55PigpLCBuZXcgTWFwPHN0cmluZywgRnVuY3Rpb24+KCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IE1hcDxzdHJpbmcsIEZ1bmN0aW9uPigpLCBpbnN0YW5jZUZhY3RvcnkpO1xuICB2YXIgdmlzaXRvciA9IG5ldyBTdGF0ZW1lbnRJbnRlcnByZXRlcigpO1xuICB2YXIgcmVzdWx0ID0gdmlzaXRvci52aXNpdEFsbFN0YXRlbWVudHMoc3RtdHNXaXRoUmV0dXJuLCBjdHgpO1xuICByZXR1cm4gaXNQcmVzZW50KHJlc3VsdCkgPyByZXN1bHQudmFsdWUgOiBudWxsO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEluc3RhbmNlRmFjdG9yeSB7XG4gIGNyZWF0ZUluc3RhbmNlKHN1cGVyQ2xhc3M6IGFueSwgY2xheno6IGFueSwgY29uc3RydWN0b3JBcmdzOiBhbnlbXSwgcHJvcHM6IE1hcDxzdHJpbmcsIGFueT4sXG4gICAgICAgICAgICAgICAgIGdldHRlcnM6IE1hcDxzdHJpbmcsIEZ1bmN0aW9uPiwgbWV0aG9kczogTWFwPHN0cmluZywgRnVuY3Rpb24+KTogRHluYW1pY0luc3RhbmNlO1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRHluYW1pY0luc3RhbmNlIHtcbiAgZ2V0IHByb3BzKCk6IE1hcDxzdHJpbmcsIGFueT4geyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9XG4gIGdldCBnZXR0ZXJzKCk6IE1hcDxzdHJpbmcsIEZ1bmN0aW9uPiB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cbiAgZ2V0IG1ldGhvZHMoKTogTWFwPHN0cmluZywgYW55PiB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cbiAgZ2V0IGNsYXp6KCk6IGFueSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cbn1cblxuZnVuY3Rpb24gaXNEeW5hbWljSW5zdGFuY2UoaW5zdGFuY2U6IGFueSk6IGFueSB7XG4gIGlmIChJU19EQVJUKSB7XG4gICAgcmV0dXJuIGluc3RhbmNlIGluc3RhbmNlb2YgRHluYW1pY0luc3RhbmNlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBpc1ByZXNlbnQoaW5zdGFuY2UpICYmIGlzUHJlc2VudChpbnN0YW5jZS5wcm9wcykgJiYgaXNQcmVzZW50KGluc3RhbmNlLmdldHRlcnMpICYmXG4gICAgICAgICAgIGlzUHJlc2VudChpbnN0YW5jZS5tZXRob2RzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfZXhlY3V0ZUZ1bmN0aW9uU3RhdGVtZW50cyh2YXJOYW1lczogc3RyaW5nW10sIHZhclZhbHVlczogYW55W10sIHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHg6IF9FeGVjdXRpb25Db250ZXh0LCB2aXNpdG9yOiBTdGF0ZW1lbnRJbnRlcnByZXRlcik6IGFueSB7XG4gIHZhciBjaGlsZEN0eCA9IGN0eC5jcmVhdGVDaGlsZFdpaHRMb2NhbFZhcnMoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YXJOYW1lcy5sZW5ndGg7IGkrKykge1xuICAgIGNoaWxkQ3R4LnZhcnMuc2V0KHZhck5hbWVzW2ldLCB2YXJWYWx1ZXNbaV0pO1xuICB9XG4gIHZhciByZXN1bHQgPSB2aXNpdG9yLnZpc2l0QWxsU3RhdGVtZW50cyhzdGF0ZW1lbnRzLCBjaGlsZEN0eCk7XG4gIHJldHVybiBpc1ByZXNlbnQocmVzdWx0KSA/IHJlc3VsdC52YWx1ZSA6IG51bGw7XG59XG5cbmNsYXNzIF9FeGVjdXRpb25Db250ZXh0IHtcbiAgY29uc3RydWN0b3IocHVibGljIHBhcmVudDogX0V4ZWN1dGlvbkNvbnRleHQsIHB1YmxpYyBzdXBlckNsYXNzOiBhbnksIHB1YmxpYyBzdXBlckluc3RhbmNlOiBhbnksXG4gICAgICAgICAgICAgIHB1YmxpYyBjbGFzc05hbWU6IHN0cmluZywgcHVibGljIHZhcnM6IE1hcDxzdHJpbmcsIGFueT4sXG4gICAgICAgICAgICAgIHB1YmxpYyBwcm9wczogTWFwPHN0cmluZywgYW55PiwgcHVibGljIGdldHRlcnM6IE1hcDxzdHJpbmcsIEZ1bmN0aW9uPixcbiAgICAgICAgICAgICAgcHVibGljIG1ldGhvZHM6IE1hcDxzdHJpbmcsIEZ1bmN0aW9uPiwgcHVibGljIGluc3RhbmNlRmFjdG9yeTogSW5zdGFuY2VGYWN0b3J5KSB7fVxuXG4gIGNyZWF0ZUNoaWxkV2lodExvY2FsVmFycygpOiBfRXhlY3V0aW9uQ29udGV4dCB7XG4gICAgcmV0dXJuIG5ldyBfRXhlY3V0aW9uQ29udGV4dCh0aGlzLCB0aGlzLnN1cGVyQ2xhc3MsIHRoaXMuc3VwZXJJbnN0YW5jZSwgdGhpcy5jbGFzc05hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgTWFwPHN0cmluZywgYW55PigpLCB0aGlzLnByb3BzLCB0aGlzLmdldHRlcnMsIHRoaXMubWV0aG9kcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VGYWN0b3J5KTtcbiAgfVxufVxuXG5jbGFzcyBSZXR1cm5WYWx1ZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2YWx1ZTogYW55KSB7fVxufVxuXG5jbGFzcyBfRHluYW1pY0NsYXNzIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfY2xhc3NTdG10OiBvLkNsYXNzU3RtdCwgcHJpdmF0ZSBfY3R4OiBfRXhlY3V0aW9uQ29udGV4dCxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfdmlzaXRvcjogU3RhdGVtZW50SW50ZXJwcmV0ZXIpIHt9XG5cbiAgaW5zdGFudGlhdGUoYXJnczogYW55W10pOiBEeW5hbWljSW5zdGFuY2Uge1xuICAgIHZhciBwcm9wcyA9IG5ldyBNYXA8c3RyaW5nLCBhbnk+KCk7XG4gICAgdmFyIGdldHRlcnMgPSBuZXcgTWFwPHN0cmluZywgRnVuY3Rpb24+KCk7XG4gICAgdmFyIG1ldGhvZHMgPSBuZXcgTWFwPHN0cmluZywgRnVuY3Rpb24+KCk7XG4gICAgdmFyIHN1cGVyQ2xhc3MgPSB0aGlzLl9jbGFzc1N0bXQucGFyZW50LnZpc2l0RXhwcmVzc2lvbih0aGlzLl92aXNpdG9yLCB0aGlzLl9jdHgpO1xuICAgIHZhciBpbnN0YW5jZUN0eCA9XG4gICAgICAgIG5ldyBfRXhlY3V0aW9uQ29udGV4dCh0aGlzLl9jdHgsIHN1cGVyQ2xhc3MsIG51bGwsIHRoaXMuX2NsYXNzU3RtdC5uYW1lLCB0aGlzLl9jdHgudmFycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLCBnZXR0ZXJzLCBtZXRob2RzLCB0aGlzLl9jdHguaW5zdGFuY2VGYWN0b3J5KTtcblxuICAgIHRoaXMuX2NsYXNzU3RtdC5maWVsZHMuZm9yRWFjaCgoZmllbGQ6IG8uQ2xhc3NGaWVsZCkgPT4geyBwcm9wcy5zZXQoZmllbGQubmFtZSwgbnVsbCk7IH0pO1xuICAgIHRoaXMuX2NsYXNzU3RtdC5nZXR0ZXJzLmZvckVhY2goKGdldHRlcjogby5DbGFzc0dldHRlcikgPT4ge1xuICAgICAgZ2V0dGVycy5zZXQoZ2V0dGVyLm5hbWUsICgpID0+IF9leGVjdXRlRnVuY3Rpb25TdGF0ZW1lbnRzKFtdLCBbXSwgZ2V0dGVyLmJvZHksIGluc3RhbmNlQ3R4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Zpc2l0b3IpKTtcbiAgICB9KTtcbiAgICB0aGlzLl9jbGFzc1N0bXQubWV0aG9kcy5mb3JFYWNoKChtZXRob2Q6IG8uQ2xhc3NNZXRob2QpID0+IHtcbiAgICAgIHZhciBwYXJhbU5hbWVzID0gbWV0aG9kLnBhcmFtcy5tYXAocGFyYW0gPT4gcGFyYW0ubmFtZSk7XG4gICAgICBtZXRob2RzLnNldChtZXRob2QubmFtZSwgX2RlY2xhcmVGbihwYXJhbU5hbWVzLCBtZXRob2QuYm9keSwgaW5zdGFuY2VDdHgsIHRoaXMuX3Zpc2l0b3IpKTtcbiAgICB9KTtcblxuICAgIHZhciBjdG9yUGFyYW1OYW1lcyA9IHRoaXMuX2NsYXNzU3RtdC5jb25zdHJ1Y3Rvck1ldGhvZC5wYXJhbXMubWFwKHBhcmFtID0+IHBhcmFtLm5hbWUpO1xuICAgIF9leGVjdXRlRnVuY3Rpb25TdGF0ZW1lbnRzKGN0b3JQYXJhbU5hbWVzLCBhcmdzLCB0aGlzLl9jbGFzc1N0bXQuY29uc3RydWN0b3JNZXRob2QuYm9keSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUN0eCwgdGhpcy5fdmlzaXRvcik7XG4gICAgcmV0dXJuIGluc3RhbmNlQ3R4LnN1cGVySW5zdGFuY2U7XG4gIH1cblxuICBkZWJ1Z0FzdCgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fdmlzaXRvci5kZWJ1Z0FzdCh0aGlzLl9jbGFzc1N0bXQpOyB9XG59XG5cbmNsYXNzIFN0YXRlbWVudEludGVycHJldGVyIGltcGxlbWVudHMgby5TdGF0ZW1lbnRWaXNpdG9yLCBvLkV4cHJlc3Npb25WaXNpdG9yIHtcbiAgZGVidWdBc3QoYXN0OiBvLkV4cHJlc3Npb24gfCBvLlN0YXRlbWVudCB8IG8uVHlwZSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIElTX0RBUlQgPyBkZWJ1Z091dHB1dEFzdEFzRGFydChhc3QpIDogZGVidWdPdXRwdXRBc3RBc1R5cGVTY3JpcHQoYXN0KTtcbiAgfVxuXG4gIHZpc2l0RGVjbGFyZVZhclN0bXQoc3RtdDogby5EZWNsYXJlVmFyU3RtdCwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IGFueSB7XG4gICAgY3R4LnZhcnMuc2V0KHN0bXQubmFtZSwgc3RtdC52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRXcml0ZVZhckV4cHIoZXhwcjogby5Xcml0ZVZhckV4cHIsIGN0eDogX0V4ZWN1dGlvbkNvbnRleHQpOiBhbnkge1xuICAgIHZhciB2YWx1ZSA9IGV4cHIudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgdmFyIGN1cnJDdHggPSBjdHg7XG4gICAgd2hpbGUgKGN1cnJDdHggIT0gbnVsbCkge1xuICAgICAgaWYgKGN1cnJDdHgudmFycy5oYXMoZXhwci5uYW1lKSkge1xuICAgICAgICBjdXJyQ3R4LnZhcnMuc2V0KGV4cHIubmFtZSwgdmFsdWUpO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG4gICAgICBjdXJyQ3R4ID0gY3VyckN0eC5wYXJlbnQ7XG4gICAgfVxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBOb3QgZGVjbGFyZWQgdmFyaWFibGUgJHtleHByLm5hbWV9YCk7XG4gIH1cbiAgdmlzaXRSZWFkVmFyRXhwcihhc3Q6IG8uUmVhZFZhckV4cHIsIGN0eDogX0V4ZWN1dGlvbkNvbnRleHQpOiBhbnkge1xuICAgIHZhciB2YXJOYW1lID0gYXN0Lm5hbWU7XG4gICAgaWYgKGlzUHJlc2VudChhc3QuYnVpbHRpbikpIHtcbiAgICAgIHN3aXRjaCAoYXN0LmJ1aWx0aW4pIHtcbiAgICAgICAgY2FzZSBvLkJ1aWx0aW5WYXIuU3VwZXI6XG4gICAgICAgIGNhc2Ugby5CdWlsdGluVmFyLlRoaXM6XG4gICAgICAgICAgcmV0dXJuIGN0eC5zdXBlckluc3RhbmNlO1xuICAgICAgICBjYXNlIG8uQnVpbHRpblZhci5DYXRjaEVycm9yOlxuICAgICAgICAgIHZhck5hbWUgPSBDQVRDSF9FUlJPUl9WQVI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2Ugby5CdWlsdGluVmFyLkNhdGNoU3RhY2s6XG4gICAgICAgICAgdmFyTmFtZSA9IENBVENIX1NUQUNLX1ZBUjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBvLkJ1aWx0aW5WYXIuTWV0YWRhdGFNYXA6XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYFVua25vd24gYnVpbHRpbiB2YXJpYWJsZSAke2FzdC5idWlsdGlufWApO1xuICAgICAgfVxuICAgIH1cbiAgICB2YXIgY3VyckN0eCA9IGN0eDtcbiAgICB3aGlsZSAoY3VyckN0eCAhPSBudWxsKSB7XG4gICAgICBpZiAoY3VyckN0eC52YXJzLmhhcyh2YXJOYW1lKSkge1xuICAgICAgICByZXR1cm4gY3VyckN0eC52YXJzLmdldCh2YXJOYW1lKTtcbiAgICAgIH1cbiAgICAgIGN1cnJDdHggPSBjdXJyQ3R4LnBhcmVudDtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYE5vdCBkZWNsYXJlZCB2YXJpYWJsZSAke3Zhck5hbWV9YCk7XG4gIH1cbiAgdmlzaXRXcml0ZUtleUV4cHIoZXhwcjogby5Xcml0ZUtleUV4cHIsIGN0eDogX0V4ZWN1dGlvbkNvbnRleHQpOiBhbnkge1xuICAgIHZhciByZWNlaXZlciA9IGV4cHIucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgdmFyIGluZGV4ID0gZXhwci5pbmRleC52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICB2YXIgdmFsdWUgPSBleHByLnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIHJlY2VpdmVyW2luZGV4XSA9IHZhbHVlO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICB2aXNpdFdyaXRlUHJvcEV4cHIoZXhwcjogby5Xcml0ZVByb3BFeHByLCBjdHg6IF9FeGVjdXRpb25Db250ZXh0KTogYW55IHtcbiAgICB2YXIgcmVjZWl2ZXIgPSBleHByLnJlY2VpdmVyLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIHZhciB2YWx1ZSA9IGV4cHIudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgaWYgKGlzRHluYW1pY0luc3RhbmNlKHJlY2VpdmVyKSkge1xuICAgICAgdmFyIGRpID0gPER5bmFtaWNJbnN0YW5jZT5yZWNlaXZlcjtcbiAgICAgIGlmIChkaS5wcm9wcy5oYXMoZXhwci5uYW1lKSkge1xuICAgICAgICBkaS5wcm9wcy5zZXQoZXhwci5uYW1lLCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWZsZWN0b3Iuc2V0dGVyKGV4cHIubmFtZSkocmVjZWl2ZXIsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmVmbGVjdG9yLnNldHRlcihleHByLm5hbWUpKHJlY2VpdmVyLCB2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIHZpc2l0SW52b2tlTWV0aG9kRXhwcihleHByOiBvLkludm9rZU1ldGhvZEV4cHIsIGN0eDogX0V4ZWN1dGlvbkNvbnRleHQpOiBhbnkge1xuICAgIHZhciByZWNlaXZlciA9IGV4cHIucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgdmFyIGFyZ3MgPSB0aGlzLnZpc2l0QWxsRXhwcmVzc2lvbnMoZXhwci5hcmdzLCBjdHgpO1xuICAgIHZhciByZXN1bHQ7XG4gICAgaWYgKGlzUHJlc2VudChleHByLmJ1aWx0aW4pKSB7XG4gICAgICBzd2l0Y2ggKGV4cHIuYnVpbHRpbikge1xuICAgICAgICBjYXNlIG8uQnVpbHRpbk1ldGhvZC5Db25jYXRBcnJheTpcbiAgICAgICAgICByZXN1bHQgPSBMaXN0V3JhcHBlci5jb25jYXQocmVjZWl2ZXIsIGFyZ3NbMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIG8uQnVpbHRpbk1ldGhvZC5TdWJzY3JpYmVPYnNlcnZhYmxlOlxuICAgICAgICAgIHJlc3VsdCA9IE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZShyZWNlaXZlciwgYXJnc1swXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2Ugby5CdWlsdGluTWV0aG9kLmJpbmQ6XG4gICAgICAgICAgaWYgKElTX0RBUlQpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlY2VpdmVyO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZWNlaXZlci5iaW5kKGFyZ3NbMF0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgVW5rbm93biBidWlsdGluIG1ldGhvZCAke2V4cHIuYnVpbHRpbn1gKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzRHluYW1pY0luc3RhbmNlKHJlY2VpdmVyKSkge1xuICAgICAgdmFyIGRpID0gPER5bmFtaWNJbnN0YW5jZT5yZWNlaXZlcjtcbiAgICAgIGlmIChkaS5tZXRob2RzLmhhcyhleHByLm5hbWUpKSB7XG4gICAgICAgIHJlc3VsdCA9IEZ1bmN0aW9uV3JhcHBlci5hcHBseShkaS5tZXRob2RzLmdldChleHByLm5hbWUpLCBhcmdzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IHJlZmxlY3Rvci5tZXRob2QoZXhwci5uYW1lKShyZWNlaXZlciwgYXJncyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IHJlZmxlY3Rvci5tZXRob2QoZXhwci5uYW1lKShyZWNlaXZlciwgYXJncyk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgdmlzaXRJbnZva2VGdW5jdGlvbkV4cHIoc3RtdDogby5JbnZva2VGdW5jdGlvbkV4cHIsIGN0eDogX0V4ZWN1dGlvbkNvbnRleHQpOiBhbnkge1xuICAgIHZhciBhcmdzID0gdGhpcy52aXNpdEFsbEV4cHJlc3Npb25zKHN0bXQuYXJncywgY3R4KTtcbiAgICB2YXIgZm5FeHByID0gc3RtdC5mbjtcbiAgICBpZiAoZm5FeHByIGluc3RhbmNlb2Ygby5SZWFkVmFyRXhwciAmJiBmbkV4cHIuYnVpbHRpbiA9PT0gby5CdWlsdGluVmFyLlN1cGVyKSB7XG4gICAgICBjdHguc3VwZXJJbnN0YW5jZSA9IGN0eC5pbnN0YW5jZUZhY3RvcnkuY3JlYXRlSW5zdGFuY2UoY3R4LnN1cGVyQ2xhc3MsIGN0eC5jbGFzc05hbWUsIGFyZ3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3R4LnByb3BzLCBjdHguZ2V0dGVycywgY3R4Lm1ldGhvZHMpO1xuICAgICAgY3R4LnBhcmVudC5zdXBlckluc3RhbmNlID0gY3R4LnN1cGVySW5zdGFuY2U7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGZuID0gc3RtdC5mbi52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICAgIHJldHVybiBGdW5jdGlvbldyYXBwZXIuYXBwbHkoZm4sIGFyZ3MpO1xuICAgIH1cbiAgfVxuICB2aXNpdFJldHVyblN0bXQoc3RtdDogby5SZXR1cm5TdGF0ZW1lbnQsIGN0eDogX0V4ZWN1dGlvbkNvbnRleHQpOiBhbnkge1xuICAgIHJldHVybiBuZXcgUmV0dXJuVmFsdWUoc3RtdC52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KSk7XG4gIH1cbiAgdmlzaXREZWNsYXJlQ2xhc3NTdG10KHN0bXQ6IG8uQ2xhc3NTdG10LCBjdHg6IF9FeGVjdXRpb25Db250ZXh0KTogYW55IHtcbiAgICB2YXIgY2xhenogPSBuZXcgX0R5bmFtaWNDbGFzcyhzdG10LCBjdHgsIHRoaXMpO1xuICAgIGN0eC52YXJzLnNldChzdG10Lm5hbWUsIGNsYXp6KTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdEV4cHJlc3Npb25TdG10KHN0bXQ6IG8uRXhwcmVzc2lvblN0YXRlbWVudCwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IGFueSB7XG4gICAgcmV0dXJuIHN0bXQuZXhwci52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgfVxuICB2aXNpdElmU3RtdChzdG10OiBvLklmU3RtdCwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IGFueSB7XG4gICAgdmFyIGNvbmRpdGlvbiA9IHN0bXQuY29uZGl0aW9uLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIGlmIChjb25kaXRpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0QWxsU3RhdGVtZW50cyhzdG10LnRydWVDYXNlLCBjdHgpO1xuICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KHN0bXQuZmFsc2VDYXNlKSkge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaXRBbGxTdGF0ZW1lbnRzKHN0bXQuZmFsc2VDYXNlLCBjdHgpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdFRyeUNhdGNoU3RtdChzdG10OiBvLlRyeUNhdGNoU3RtdCwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IGFueSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0QWxsU3RhdGVtZW50cyhzdG10LmJvZHlTdG10cywgY3R4KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB2YXIgY2hpbGRDdHggPSBjdHguY3JlYXRlQ2hpbGRXaWh0TG9jYWxWYXJzKCk7XG4gICAgICBjaGlsZEN0eC52YXJzLnNldChDQVRDSF9FUlJPUl9WQVIsIGUpO1xuICAgICAgY2hpbGRDdHgudmFycy5zZXQoQ0FUQ0hfU1RBQ0tfVkFSLCBlLnN0YWNrKTtcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0QWxsU3RhdGVtZW50cyhzdG10LmNhdGNoU3RtdHMsIGNoaWxkQ3R4KTtcbiAgICB9XG4gIH1cbiAgdmlzaXRUaHJvd1N0bXQoc3RtdDogby5UaHJvd1N0bXQsIGN0eDogX0V4ZWN1dGlvbkNvbnRleHQpOiBhbnkge1xuICAgIHRocm93IHN0bXQuZXJyb3IudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gIH1cbiAgdmlzaXRDb21tZW50U3RtdChzdG10OiBvLkNvbW1lbnRTdG10LCBjb250ZXh0PzogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgdmlzaXRJbnN0YW50aWF0ZUV4cHIoYXN0OiBvLkluc3RhbnRpYXRlRXhwciwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IGFueSB7XG4gICAgdmFyIGFyZ3MgPSB0aGlzLnZpc2l0QWxsRXhwcmVzc2lvbnMoYXN0LmFyZ3MsIGN0eCk7XG4gICAgdmFyIGNsYXp6ID0gYXN0LmNsYXNzRXhwci52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICBpZiAoY2xhenogaW5zdGFuY2VvZiBfRHluYW1pY0NsYXNzKSB7XG4gICAgICByZXR1cm4gY2xhenouaW5zdGFudGlhdGUoYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBGdW5jdGlvbldyYXBwZXIuYXBwbHkocmVmbGVjdG9yLmZhY3RvcnkoY2xhenopLCBhcmdzKTtcbiAgICB9XG4gIH1cbiAgdmlzaXRMaXRlcmFsRXhwcihhc3Q6IG8uTGl0ZXJhbEV4cHIsIGN0eDogX0V4ZWN1dGlvbkNvbnRleHQpOiBhbnkgeyByZXR1cm4gYXN0LnZhbHVlOyB9XG4gIHZpc2l0RXh0ZXJuYWxFeHByKGFzdDogby5FeHRlcm5hbEV4cHIsIGN0eDogX0V4ZWN1dGlvbkNvbnRleHQpOiBhbnkgeyByZXR1cm4gYXN0LnZhbHVlLnJ1bnRpbWU7IH1cbiAgdmlzaXRDb25kaXRpb25hbEV4cHIoYXN0OiBvLkNvbmRpdGlvbmFsRXhwciwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IGFueSB7XG4gICAgaWYgKGFzdC5jb25kaXRpb24udmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCkpIHtcbiAgICAgIHJldHVybiBhc3QudHJ1ZUNhc2UudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgfSBlbHNlIGlmIChpc1ByZXNlbnQoYXN0LmZhbHNlQ2FzZSkpIHtcbiAgICAgIHJldHVybiBhc3QuZmFsc2VDYXNlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdE5vdEV4cHIoYXN0OiBvLk5vdEV4cHIsIGN0eDogX0V4ZWN1dGlvbkNvbnRleHQpOiBhbnkge1xuICAgIHJldHVybiAhYXN0LmNvbmRpdGlvbi52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgfVxuICB2aXNpdENhc3RFeHByKGFzdDogby5DYXN0RXhwciwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IGFueSB7XG4gICAgcmV0dXJuIGFzdC52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgfVxuICB2aXNpdEZ1bmN0aW9uRXhwcihhc3Q6IG8uRnVuY3Rpb25FeHByLCBjdHg6IF9FeGVjdXRpb25Db250ZXh0KTogYW55IHtcbiAgICB2YXIgcGFyYW1OYW1lcyA9IGFzdC5wYXJhbXMubWFwKChwYXJhbSkgPT4gcGFyYW0ubmFtZSk7XG4gICAgcmV0dXJuIF9kZWNsYXJlRm4ocGFyYW1OYW1lcywgYXN0LnN0YXRlbWVudHMsIGN0eCwgdGhpcyk7XG4gIH1cbiAgdmlzaXREZWNsYXJlRnVuY3Rpb25TdG10KHN0bXQ6IG8uRGVjbGFyZUZ1bmN0aW9uU3RtdCwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IGFueSB7XG4gICAgdmFyIHBhcmFtTmFtZXMgPSBzdG10LnBhcmFtcy5tYXAoKHBhcmFtKSA9PiBwYXJhbS5uYW1lKTtcbiAgICBjdHgudmFycy5zZXQoc3RtdC5uYW1lLCBfZGVjbGFyZUZuKHBhcmFtTmFtZXMsIHN0bXQuc3RhdGVtZW50cywgY3R4LCB0aGlzKSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRCaW5hcnlPcGVyYXRvckV4cHIoYXN0OiBvLkJpbmFyeU9wZXJhdG9yRXhwciwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IGFueSB7XG4gICAgdmFyIGxocyA9ICgpID0+IGFzdC5saHMudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgdmFyIHJocyA9ICgpID0+IGFzdC5yaHMudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG5cbiAgICBzd2l0Y2ggKGFzdC5vcGVyYXRvcikge1xuICAgICAgY2FzZSBvLkJpbmFyeU9wZXJhdG9yLkVxdWFsczpcbiAgICAgICAgcmV0dXJuIGxocygpID09IHJocygpO1xuICAgICAgY2FzZSBvLkJpbmFyeU9wZXJhdG9yLklkZW50aWNhbDpcbiAgICAgICAgcmV0dXJuIGxocygpID09PSByaHMoKTtcbiAgICAgIGNhc2Ugby5CaW5hcnlPcGVyYXRvci5Ob3RFcXVhbHM6XG4gICAgICAgIHJldHVybiBsaHMoKSAhPSByaHMoKTtcbiAgICAgIGNhc2Ugby5CaW5hcnlPcGVyYXRvci5Ob3RJZGVudGljYWw6XG4gICAgICAgIHJldHVybiBsaHMoKSAhPT0gcmhzKCk7XG4gICAgICBjYXNlIG8uQmluYXJ5T3BlcmF0b3IuQW5kOlxuICAgICAgICByZXR1cm4gbGhzKCkgJiYgcmhzKCk7XG4gICAgICBjYXNlIG8uQmluYXJ5T3BlcmF0b3IuT3I6XG4gICAgICAgIHJldHVybiBsaHMoKSB8fCByaHMoKTtcbiAgICAgIGNhc2Ugby5CaW5hcnlPcGVyYXRvci5QbHVzOlxuICAgICAgICByZXR1cm4gbGhzKCkgKyByaHMoKTtcbiAgICAgIGNhc2Ugby5CaW5hcnlPcGVyYXRvci5NaW51czpcbiAgICAgICAgcmV0dXJuIGxocygpIC0gcmhzKCk7XG4gICAgICBjYXNlIG8uQmluYXJ5T3BlcmF0b3IuRGl2aWRlOlxuICAgICAgICByZXR1cm4gbGhzKCkgLyByaHMoKTtcbiAgICAgIGNhc2Ugby5CaW5hcnlPcGVyYXRvci5NdWx0aXBseTpcbiAgICAgICAgcmV0dXJuIGxocygpICogcmhzKCk7XG4gICAgICBjYXNlIG8uQmluYXJ5T3BlcmF0b3IuTW9kdWxvOlxuICAgICAgICByZXR1cm4gbGhzKCkgJSByaHMoKTtcbiAgICAgIGNhc2Ugby5CaW5hcnlPcGVyYXRvci5Mb3dlcjpcbiAgICAgICAgcmV0dXJuIGxocygpIDwgcmhzKCk7XG4gICAgICBjYXNlIG8uQmluYXJ5T3BlcmF0b3IuTG93ZXJFcXVhbHM6XG4gICAgICAgIHJldHVybiBsaHMoKSA8PSByaHMoKTtcbiAgICAgIGNhc2Ugby5CaW5hcnlPcGVyYXRvci5CaWdnZXI6XG4gICAgICAgIHJldHVybiBsaHMoKSA+IHJocygpO1xuICAgICAgY2FzZSBvLkJpbmFyeU9wZXJhdG9yLkJpZ2dlckVxdWFsczpcbiAgICAgICAgcmV0dXJuIGxocygpID49IHJocygpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYFVua25vd24gb3BlcmF0b3IgJHthc3Qub3BlcmF0b3J9YCk7XG4gICAgfVxuICB9XG4gIHZpc2l0UmVhZFByb3BFeHByKGFzdDogby5SZWFkUHJvcEV4cHIsIGN0eDogX0V4ZWN1dGlvbkNvbnRleHQpOiBhbnkge1xuICAgIHZhciByZXN1bHQ7XG4gICAgdmFyIHJlY2VpdmVyID0gYXN0LnJlY2VpdmVyLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIGlmIChpc0R5bmFtaWNJbnN0YW5jZShyZWNlaXZlcikpIHtcbiAgICAgIHZhciBkaSA9IDxEeW5hbWljSW5zdGFuY2U+cmVjZWl2ZXI7XG4gICAgICBpZiAoZGkucHJvcHMuaGFzKGFzdC5uYW1lKSkge1xuICAgICAgICByZXN1bHQgPSBkaS5wcm9wcy5nZXQoYXN0Lm5hbWUpO1xuICAgICAgfSBlbHNlIGlmIChkaS5nZXR0ZXJzLmhhcyhhc3QubmFtZSkpIHtcbiAgICAgICAgcmVzdWx0ID0gZGkuZ2V0dGVycy5nZXQoYXN0Lm5hbWUpKCk7XG4gICAgICB9IGVsc2UgaWYgKGRpLm1ldGhvZHMuaGFzKGFzdC5uYW1lKSkge1xuICAgICAgICByZXN1bHQgPSBkaS5tZXRob2RzLmdldChhc3QubmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgPSByZWZsZWN0b3IuZ2V0dGVyKGFzdC5uYW1lKShyZWNlaXZlcik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IHJlZmxlY3Rvci5nZXR0ZXIoYXN0Lm5hbWUpKHJlY2VpdmVyKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICB2aXNpdFJlYWRLZXlFeHByKGFzdDogby5SZWFkS2V5RXhwciwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IGFueSB7XG4gICAgdmFyIHJlY2VpdmVyID0gYXN0LnJlY2VpdmVyLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIHZhciBwcm9wID0gYXN0LmluZGV4LnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIHJldHVybiByZWNlaXZlcltwcm9wXTtcbiAgfVxuICB2aXNpdExpdGVyYWxBcnJheUV4cHIoYXN0OiBvLkxpdGVyYWxBcnJheUV4cHIsIGN0eDogX0V4ZWN1dGlvbkNvbnRleHQpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLnZpc2l0QWxsRXhwcmVzc2lvbnMoYXN0LmVudHJpZXMsIGN0eCk7XG4gIH1cbiAgdmlzaXRMaXRlcmFsTWFwRXhwcihhc3Q6IG8uTGl0ZXJhbE1hcEV4cHIsIGN0eDogX0V4ZWN1dGlvbkNvbnRleHQpOiBhbnkge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBhc3QuZW50cmllcy5mb3JFYWNoKChlbnRyeSkgPT4gcmVzdWx0WzxzdHJpbmc+ZW50cnlbMF1dID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoPG8uRXhwcmVzc2lvbj5lbnRyeVsxXSkudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCkpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICB2aXNpdEFsbEV4cHJlc3Npb25zKGV4cHJlc3Npb25zOiBvLkV4cHJlc3Npb25bXSwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IGFueSB7XG4gICAgcmV0dXJuIGV4cHJlc3Npb25zLm1hcCgoZXhwcikgPT4gZXhwci52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KSk7XG4gIH1cblxuICB2aXNpdEFsbFN0YXRlbWVudHMoc3RhdGVtZW50czogby5TdGF0ZW1lbnRbXSwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IFJldHVyblZhbHVlIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0YXRlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzdG10ID0gc3RhdGVtZW50c1tpXTtcbiAgICAgIHZhciB2YWwgPSBzdG10LnZpc2l0U3RhdGVtZW50KHRoaXMsIGN0eCk7XG4gICAgICBpZiAodmFsIGluc3RhbmNlb2YgUmV0dXJuVmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2RlY2xhcmVGbih2YXJOYW1lczogc3RyaW5nW10sIHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10sIGN0eDogX0V4ZWN1dGlvbkNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgIHZpc2l0b3I6IFN0YXRlbWVudEludGVycHJldGVyKTogRnVuY3Rpb24ge1xuICBzd2l0Y2ggKHZhck5hbWVzLmxlbmd0aCkge1xuICAgIGNhc2UgMDpcbiAgICAgIHJldHVybiAoKSA9PiBfZXhlY3V0ZUZ1bmN0aW9uU3RhdGVtZW50cyh2YXJOYW1lcywgW10sIHN0YXRlbWVudHMsIGN0eCwgdmlzaXRvcik7XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIChkMCkgPT4gX2V4ZWN1dGVGdW5jdGlvblN0YXRlbWVudHModmFyTmFtZXMsIFtkMF0sIHN0YXRlbWVudHMsIGN0eCwgdmlzaXRvcik7XG4gICAgY2FzZSAyOlxuICAgICAgcmV0dXJuIChkMCwgZDEpID0+IF9leGVjdXRlRnVuY3Rpb25TdGF0ZW1lbnRzKHZhck5hbWVzLCBbZDAsIGQxXSwgc3RhdGVtZW50cywgY3R4LCB2aXNpdG9yKTtcbiAgICBjYXNlIDM6XG4gICAgICByZXR1cm4gKGQwLCBkMSwgZDIpID0+XG4gICAgICAgICAgICAgICAgIF9leGVjdXRlRnVuY3Rpb25TdGF0ZW1lbnRzKHZhck5hbWVzLCBbZDAsIGQxLCBkMl0sIHN0YXRlbWVudHMsIGN0eCwgdmlzaXRvcik7XG4gICAgY2FzZSA0OlxuICAgICAgcmV0dXJuIChkMCwgZDEsIGQyLCBkMykgPT5cbiAgICAgICAgICAgICAgICAgX2V4ZWN1dGVGdW5jdGlvblN0YXRlbWVudHModmFyTmFtZXMsIFtkMCwgZDEsIGQyLCBkM10sIHN0YXRlbWVudHMsIGN0eCwgdmlzaXRvcik7XG4gICAgY2FzZSA1OlxuICAgICAgcmV0dXJuIChkMCwgZDEsIGQyLCBkMywgZDQpID0+IF9leGVjdXRlRnVuY3Rpb25TdGF0ZW1lbnRzKHZhck5hbWVzLCBbZDAsIGQxLCBkMiwgZDMsIGQ0XSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZW1lbnRzLCBjdHgsIHZpc2l0b3IpO1xuICAgIGNhc2UgNjpcbiAgICAgIHJldHVybiAoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSkgPT4gX2V4ZWN1dGVGdW5jdGlvblN0YXRlbWVudHMoXG4gICAgICAgICAgICAgICAgIHZhck5hbWVzLCBbZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNV0sIHN0YXRlbWVudHMsIGN0eCwgdmlzaXRvcik7XG4gICAgY2FzZSA3OlxuICAgICAgcmV0dXJuIChkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNikgPT4gX2V4ZWN1dGVGdW5jdGlvblN0YXRlbWVudHMoXG4gICAgICAgICAgICAgICAgIHZhck5hbWVzLCBbZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDZdLCBzdGF0ZW1lbnRzLCBjdHgsIHZpc2l0b3IpO1xuICAgIGNhc2UgODpcbiAgICAgIHJldHVybiAoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3KSA9PiBfZXhlY3V0ZUZ1bmN0aW9uU3RhdGVtZW50cyhcbiAgICAgICAgICAgICAgICAgdmFyTmFtZXMsIFtkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDddLCBzdGF0ZW1lbnRzLCBjdHgsIHZpc2l0b3IpO1xuICAgIGNhc2UgOTpcbiAgICAgIHJldHVybiAoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOCkgPT4gX2V4ZWN1dGVGdW5jdGlvblN0YXRlbWVudHMoXG4gICAgICAgICAgICAgICAgIHZhck5hbWVzLCBbZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOF0sIHN0YXRlbWVudHMsIGN0eCwgdmlzaXRvcik7XG4gICAgY2FzZSAxMDpcbiAgICAgIHJldHVybiAoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOCwgZDkpID0+IF9leGVjdXRlRnVuY3Rpb25TdGF0ZW1lbnRzKFxuICAgICAgICAgICAgICAgICB2YXJOYW1lcywgW2QwLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkNywgZDgsIGQ5XSwgc3RhdGVtZW50cywgY3R4LCB2aXNpdG9yKTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgJ0RlY2xhcmluZyBmdW5jdGlvbnMgd2l0aCBtb3JlIHRoYW4gMTAgYXJndW1lbnRzIGlzIG5vdCBzdXBwb3J0ZWQgcmlnaHQgbm93Jyk7XG4gIH1cbn1cblxudmFyIENBVENIX0VSUk9SX1ZBUiA9ICdlcnJvcic7XG52YXIgQ0FUQ0hfU1RBQ0tfVkFSID0gJ3N0YWNrJzsiXX0=