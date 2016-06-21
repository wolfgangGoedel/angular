'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
//// Types
(function (TypeModifier) {
    TypeModifier[TypeModifier["Const"] = 0] = "Const";
})(exports.TypeModifier || (exports.TypeModifier = {}));
var TypeModifier = exports.TypeModifier;
var Type = (function () {
    function Type(modifiers) {
        if (modifiers === void 0) { modifiers = null; }
        this.modifiers = modifiers;
        if (lang_1.isBlank(modifiers)) {
            this.modifiers = [];
        }
    }
    Type.prototype.hasModifier = function (modifier) { return this.modifiers.indexOf(modifier) !== -1; };
    return Type;
}());
exports.Type = Type;
(function (BuiltinTypeName) {
    BuiltinTypeName[BuiltinTypeName["Dynamic"] = 0] = "Dynamic";
    BuiltinTypeName[BuiltinTypeName["Bool"] = 1] = "Bool";
    BuiltinTypeName[BuiltinTypeName["String"] = 2] = "String";
    BuiltinTypeName[BuiltinTypeName["Int"] = 3] = "Int";
    BuiltinTypeName[BuiltinTypeName["Number"] = 4] = "Number";
    BuiltinTypeName[BuiltinTypeName["Function"] = 5] = "Function";
})(exports.BuiltinTypeName || (exports.BuiltinTypeName = {}));
var BuiltinTypeName = exports.BuiltinTypeName;
var BuiltinType = (function (_super) {
    __extends(BuiltinType, _super);
    function BuiltinType(name, modifiers) {
        if (modifiers === void 0) { modifiers = null; }
        _super.call(this, modifiers);
        this.name = name;
    }
    BuiltinType.prototype.visitType = function (visitor, context) {
        return visitor.visitBuiltintType(this, context);
    };
    return BuiltinType;
}(Type));
exports.BuiltinType = BuiltinType;
var ExternalType = (function (_super) {
    __extends(ExternalType, _super);
    function ExternalType(value, typeParams, modifiers) {
        if (typeParams === void 0) { typeParams = null; }
        if (modifiers === void 0) { modifiers = null; }
        _super.call(this, modifiers);
        this.value = value;
        this.typeParams = typeParams;
    }
    ExternalType.prototype.visitType = function (visitor, context) {
        return visitor.visitExternalType(this, context);
    };
    return ExternalType;
}(Type));
exports.ExternalType = ExternalType;
var ArrayType = (function (_super) {
    __extends(ArrayType, _super);
    function ArrayType(of, modifiers) {
        if (modifiers === void 0) { modifiers = null; }
        _super.call(this, modifiers);
        this.of = of;
    }
    ArrayType.prototype.visitType = function (visitor, context) {
        return visitor.visitArrayType(this, context);
    };
    return ArrayType;
}(Type));
exports.ArrayType = ArrayType;
var MapType = (function (_super) {
    __extends(MapType, _super);
    function MapType(valueType, modifiers) {
        if (modifiers === void 0) { modifiers = null; }
        _super.call(this, modifiers);
        this.valueType = valueType;
    }
    MapType.prototype.visitType = function (visitor, context) { return visitor.visitMapType(this, context); };
    return MapType;
}(Type));
exports.MapType = MapType;
exports.DYNAMIC_TYPE = new BuiltinType(BuiltinTypeName.Dynamic);
exports.BOOL_TYPE = new BuiltinType(BuiltinTypeName.Bool);
exports.INT_TYPE = new BuiltinType(BuiltinTypeName.Int);
exports.NUMBER_TYPE = new BuiltinType(BuiltinTypeName.Number);
exports.STRING_TYPE = new BuiltinType(BuiltinTypeName.String);
exports.FUNCTION_TYPE = new BuiltinType(BuiltinTypeName.Function);
///// Expressions
(function (BinaryOperator) {
    BinaryOperator[BinaryOperator["Equals"] = 0] = "Equals";
    BinaryOperator[BinaryOperator["NotEquals"] = 1] = "NotEquals";
    BinaryOperator[BinaryOperator["Identical"] = 2] = "Identical";
    BinaryOperator[BinaryOperator["NotIdentical"] = 3] = "NotIdentical";
    BinaryOperator[BinaryOperator["Minus"] = 4] = "Minus";
    BinaryOperator[BinaryOperator["Plus"] = 5] = "Plus";
    BinaryOperator[BinaryOperator["Divide"] = 6] = "Divide";
    BinaryOperator[BinaryOperator["Multiply"] = 7] = "Multiply";
    BinaryOperator[BinaryOperator["Modulo"] = 8] = "Modulo";
    BinaryOperator[BinaryOperator["And"] = 9] = "And";
    BinaryOperator[BinaryOperator["Or"] = 10] = "Or";
    BinaryOperator[BinaryOperator["Lower"] = 11] = "Lower";
    BinaryOperator[BinaryOperator["LowerEquals"] = 12] = "LowerEquals";
    BinaryOperator[BinaryOperator["Bigger"] = 13] = "Bigger";
    BinaryOperator[BinaryOperator["BiggerEquals"] = 14] = "BiggerEquals";
})(exports.BinaryOperator || (exports.BinaryOperator = {}));
var BinaryOperator = exports.BinaryOperator;
var Expression = (function () {
    function Expression(type) {
        this.type = type;
    }
    Expression.prototype.prop = function (name) { return new ReadPropExpr(this, name); };
    Expression.prototype.key = function (index, type) {
        if (type === void 0) { type = null; }
        return new ReadKeyExpr(this, index, type);
    };
    Expression.prototype.callMethod = function (name, params) {
        return new InvokeMethodExpr(this, name, params);
    };
    Expression.prototype.callFn = function (params) { return new InvokeFunctionExpr(this, params); };
    Expression.prototype.instantiate = function (params, type) {
        if (type === void 0) { type = null; }
        return new InstantiateExpr(this, params, type);
    };
    Expression.prototype.conditional = function (trueCase, falseCase) {
        if (falseCase === void 0) { falseCase = null; }
        return new ConditionalExpr(this, trueCase, falseCase);
    };
    Expression.prototype.equals = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Equals, this, rhs);
    };
    Expression.prototype.notEquals = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.NotEquals, this, rhs);
    };
    Expression.prototype.identical = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Identical, this, rhs);
    };
    Expression.prototype.notIdentical = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.NotIdentical, this, rhs);
    };
    Expression.prototype.minus = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Minus, this, rhs);
    };
    Expression.prototype.plus = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Plus, this, rhs);
    };
    Expression.prototype.divide = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Divide, this, rhs);
    };
    Expression.prototype.multiply = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Multiply, this, rhs);
    };
    Expression.prototype.modulo = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Modulo, this, rhs);
    };
    Expression.prototype.and = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.And, this, rhs);
    };
    Expression.prototype.or = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Or, this, rhs);
    };
    Expression.prototype.lower = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Lower, this, rhs);
    };
    Expression.prototype.lowerEquals = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.LowerEquals, this, rhs);
    };
    Expression.prototype.bigger = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Bigger, this, rhs);
    };
    Expression.prototype.biggerEquals = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.BiggerEquals, this, rhs);
    };
    Expression.prototype.isBlank = function () {
        // Note: We use equals by purpose here to compare to null and undefined in JS.
        return this.equals(exports.NULL_EXPR);
    };
    Expression.prototype.cast = function (type) { return new CastExpr(this, type); };
    Expression.prototype.toStmt = function () { return new ExpressionStatement(this); };
    return Expression;
}());
exports.Expression = Expression;
(function (BuiltinVar) {
    BuiltinVar[BuiltinVar["This"] = 0] = "This";
    BuiltinVar[BuiltinVar["Super"] = 1] = "Super";
    BuiltinVar[BuiltinVar["CatchError"] = 2] = "CatchError";
    BuiltinVar[BuiltinVar["CatchStack"] = 3] = "CatchStack";
    BuiltinVar[BuiltinVar["MetadataMap"] = 4] = "MetadataMap";
})(exports.BuiltinVar || (exports.BuiltinVar = {}));
var BuiltinVar = exports.BuiltinVar;
var ReadVarExpr = (function (_super) {
    __extends(ReadVarExpr, _super);
    function ReadVarExpr(name, type) {
        if (type === void 0) { type = null; }
        _super.call(this, type);
        if (lang_1.isString(name)) {
            this.name = name;
            this.builtin = null;
        }
        else {
            this.name = null;
            this.builtin = name;
        }
    }
    ReadVarExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitReadVarExpr(this, context);
    };
    ReadVarExpr.prototype.set = function (value) { return new WriteVarExpr(this.name, value); };
    return ReadVarExpr;
}(Expression));
exports.ReadVarExpr = ReadVarExpr;
var WriteVarExpr = (function (_super) {
    __extends(WriteVarExpr, _super);
    function WriteVarExpr(name, value, type) {
        if (type === void 0) { type = null; }
        _super.call(this, lang_1.isPresent(type) ? type : value.type);
        this.name = name;
        this.value = value;
    }
    WriteVarExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitWriteVarExpr(this, context);
    };
    WriteVarExpr.prototype.toDeclStmt = function (type, modifiers) {
        if (type === void 0) { type = null; }
        if (modifiers === void 0) { modifiers = null; }
        return new DeclareVarStmt(this.name, this.value, type, modifiers);
    };
    return WriteVarExpr;
}(Expression));
exports.WriteVarExpr = WriteVarExpr;
var WriteKeyExpr = (function (_super) {
    __extends(WriteKeyExpr, _super);
    function WriteKeyExpr(receiver, index, value, type) {
        if (type === void 0) { type = null; }
        _super.call(this, lang_1.isPresent(type) ? type : value.type);
        this.receiver = receiver;
        this.index = index;
        this.value = value;
    }
    WriteKeyExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitWriteKeyExpr(this, context);
    };
    return WriteKeyExpr;
}(Expression));
exports.WriteKeyExpr = WriteKeyExpr;
var WritePropExpr = (function (_super) {
    __extends(WritePropExpr, _super);
    function WritePropExpr(receiver, name, value, type) {
        if (type === void 0) { type = null; }
        _super.call(this, lang_1.isPresent(type) ? type : value.type);
        this.receiver = receiver;
        this.name = name;
        this.value = value;
    }
    WritePropExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitWritePropExpr(this, context);
    };
    return WritePropExpr;
}(Expression));
exports.WritePropExpr = WritePropExpr;
(function (BuiltinMethod) {
    BuiltinMethod[BuiltinMethod["ConcatArray"] = 0] = "ConcatArray";
    BuiltinMethod[BuiltinMethod["SubscribeObservable"] = 1] = "SubscribeObservable";
})(exports.BuiltinMethod || (exports.BuiltinMethod = {}));
var BuiltinMethod = exports.BuiltinMethod;
var InvokeMethodExpr = (function (_super) {
    __extends(InvokeMethodExpr, _super);
    function InvokeMethodExpr(receiver, method, args, type) {
        if (type === void 0) { type = null; }
        _super.call(this, type);
        this.receiver = receiver;
        this.args = args;
        if (lang_1.isString(method)) {
            this.name = method;
            this.builtin = null;
        }
        else {
            this.name = null;
            this.builtin = method;
        }
    }
    InvokeMethodExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitInvokeMethodExpr(this, context);
    };
    return InvokeMethodExpr;
}(Expression));
exports.InvokeMethodExpr = InvokeMethodExpr;
var InvokeFunctionExpr = (function (_super) {
    __extends(InvokeFunctionExpr, _super);
    function InvokeFunctionExpr(fn, args, type) {
        if (type === void 0) { type = null; }
        _super.call(this, type);
        this.fn = fn;
        this.args = args;
    }
    InvokeFunctionExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitInvokeFunctionExpr(this, context);
    };
    return InvokeFunctionExpr;
}(Expression));
exports.InvokeFunctionExpr = InvokeFunctionExpr;
var InstantiateExpr = (function (_super) {
    __extends(InstantiateExpr, _super);
    function InstantiateExpr(classExpr, args, type) {
        _super.call(this, type);
        this.classExpr = classExpr;
        this.args = args;
    }
    InstantiateExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitInstantiateExpr(this, context);
    };
    return InstantiateExpr;
}(Expression));
exports.InstantiateExpr = InstantiateExpr;
var LiteralExpr = (function (_super) {
    __extends(LiteralExpr, _super);
    function LiteralExpr(value, type) {
        if (type === void 0) { type = null; }
        _super.call(this, type);
        this.value = value;
    }
    LiteralExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitLiteralExpr(this, context);
    };
    return LiteralExpr;
}(Expression));
exports.LiteralExpr = LiteralExpr;
var ExternalExpr = (function (_super) {
    __extends(ExternalExpr, _super);
    function ExternalExpr(value, type, typeParams) {
        if (type === void 0) { type = null; }
        if (typeParams === void 0) { typeParams = null; }
        _super.call(this, type);
        this.value = value;
        this.typeParams = typeParams;
    }
    ExternalExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitExternalExpr(this, context);
    };
    return ExternalExpr;
}(Expression));
exports.ExternalExpr = ExternalExpr;
var ConditionalExpr = (function (_super) {
    __extends(ConditionalExpr, _super);
    function ConditionalExpr(condition, trueCase, falseCase, type) {
        if (falseCase === void 0) { falseCase = null; }
        if (type === void 0) { type = null; }
        _super.call(this, lang_1.isPresent(type) ? type : trueCase.type);
        this.condition = condition;
        this.falseCase = falseCase;
        this.trueCase = trueCase;
    }
    ConditionalExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitConditionalExpr(this, context);
    };
    return ConditionalExpr;
}(Expression));
exports.ConditionalExpr = ConditionalExpr;
var NotExpr = (function (_super) {
    __extends(NotExpr, _super);
    function NotExpr(condition) {
        _super.call(this, exports.BOOL_TYPE);
        this.condition = condition;
    }
    NotExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitNotExpr(this, context);
    };
    return NotExpr;
}(Expression));
exports.NotExpr = NotExpr;
var CastExpr = (function (_super) {
    __extends(CastExpr, _super);
    function CastExpr(value, type) {
        _super.call(this, type);
        this.value = value;
    }
    CastExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitCastExpr(this, context);
    };
    return CastExpr;
}(Expression));
exports.CastExpr = CastExpr;
var FnParam = (function () {
    function FnParam(name, type) {
        if (type === void 0) { type = null; }
        this.name = name;
        this.type = type;
    }
    return FnParam;
}());
exports.FnParam = FnParam;
var FunctionExpr = (function (_super) {
    __extends(FunctionExpr, _super);
    function FunctionExpr(params, statements, type) {
        if (type === void 0) { type = null; }
        _super.call(this, type);
        this.params = params;
        this.statements = statements;
    }
    FunctionExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitFunctionExpr(this, context);
    };
    FunctionExpr.prototype.toDeclStmt = function (name, modifiers) {
        if (modifiers === void 0) { modifiers = null; }
        return new DeclareFunctionStmt(name, this.params, this.statements, this.type, modifiers);
    };
    return FunctionExpr;
}(Expression));
exports.FunctionExpr = FunctionExpr;
var BinaryOperatorExpr = (function (_super) {
    __extends(BinaryOperatorExpr, _super);
    function BinaryOperatorExpr(operator, lhs, rhs, type) {
        if (type === void 0) { type = null; }
        _super.call(this, lang_1.isPresent(type) ? type : lhs.type);
        this.operator = operator;
        this.rhs = rhs;
        this.lhs = lhs;
    }
    BinaryOperatorExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitBinaryOperatorExpr(this, context);
    };
    return BinaryOperatorExpr;
}(Expression));
exports.BinaryOperatorExpr = BinaryOperatorExpr;
var ReadPropExpr = (function (_super) {
    __extends(ReadPropExpr, _super);
    function ReadPropExpr(receiver, name, type) {
        if (type === void 0) { type = null; }
        _super.call(this, type);
        this.receiver = receiver;
        this.name = name;
    }
    ReadPropExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitReadPropExpr(this, context);
    };
    ReadPropExpr.prototype.set = function (value) {
        return new WritePropExpr(this.receiver, this.name, value);
    };
    return ReadPropExpr;
}(Expression));
exports.ReadPropExpr = ReadPropExpr;
var ReadKeyExpr = (function (_super) {
    __extends(ReadKeyExpr, _super);
    function ReadKeyExpr(receiver, index, type) {
        if (type === void 0) { type = null; }
        _super.call(this, type);
        this.receiver = receiver;
        this.index = index;
    }
    ReadKeyExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitReadKeyExpr(this, context);
    };
    ReadKeyExpr.prototype.set = function (value) {
        return new WriteKeyExpr(this.receiver, this.index, value);
    };
    return ReadKeyExpr;
}(Expression));
exports.ReadKeyExpr = ReadKeyExpr;
var LiteralArrayExpr = (function (_super) {
    __extends(LiteralArrayExpr, _super);
    function LiteralArrayExpr(entries, type) {
        if (type === void 0) { type = null; }
        _super.call(this, type);
        this.entries = entries;
    }
    LiteralArrayExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitLiteralArrayExpr(this, context);
    };
    return LiteralArrayExpr;
}(Expression));
exports.LiteralArrayExpr = LiteralArrayExpr;
var LiteralMapExpr = (function (_super) {
    __extends(LiteralMapExpr, _super);
    function LiteralMapExpr(entries, type) {
        if (type === void 0) { type = null; }
        _super.call(this, type);
        this.entries = entries;
        this.valueType = null;
        if (lang_1.isPresent(type)) {
            this.valueType = type.valueType;
        }
    }
    ;
    LiteralMapExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitLiteralMapExpr(this, context);
    };
    return LiteralMapExpr;
}(Expression));
exports.LiteralMapExpr = LiteralMapExpr;
exports.THIS_EXPR = new ReadVarExpr(BuiltinVar.This);
exports.SUPER_EXPR = new ReadVarExpr(BuiltinVar.Super);
exports.CATCH_ERROR_VAR = new ReadVarExpr(BuiltinVar.CatchError);
exports.CATCH_STACK_VAR = new ReadVarExpr(BuiltinVar.CatchStack);
exports.METADATA_MAP = new ReadVarExpr(BuiltinVar.MetadataMap);
exports.NULL_EXPR = new LiteralExpr(null, null);
//// Statements
(function (StmtModifier) {
    StmtModifier[StmtModifier["Final"] = 0] = "Final";
    StmtModifier[StmtModifier["Private"] = 1] = "Private";
})(exports.StmtModifier || (exports.StmtModifier = {}));
var StmtModifier = exports.StmtModifier;
var Statement = (function () {
    function Statement(modifiers) {
        if (modifiers === void 0) { modifiers = null; }
        this.modifiers = modifiers;
        if (lang_1.isBlank(modifiers)) {
            this.modifiers = [];
        }
    }
    Statement.prototype.hasModifier = function (modifier) { return this.modifiers.indexOf(modifier) !== -1; };
    return Statement;
}());
exports.Statement = Statement;
var DeclareVarStmt = (function (_super) {
    __extends(DeclareVarStmt, _super);
    function DeclareVarStmt(name, value, type, modifiers) {
        if (type === void 0) { type = null; }
        if (modifiers === void 0) { modifiers = null; }
        _super.call(this, modifiers);
        this.name = name;
        this.value = value;
        this.type = lang_1.isPresent(type) ? type : value.type;
    }
    DeclareVarStmt.prototype.visitStatement = function (visitor, context) {
        return visitor.visitDeclareVarStmt(this, context);
    };
    return DeclareVarStmt;
}(Statement));
exports.DeclareVarStmt = DeclareVarStmt;
var DeclareFunctionStmt = (function (_super) {
    __extends(DeclareFunctionStmt, _super);
    function DeclareFunctionStmt(name, params, statements, type, modifiers) {
        if (type === void 0) { type = null; }
        if (modifiers === void 0) { modifiers = null; }
        _super.call(this, modifiers);
        this.name = name;
        this.params = params;
        this.statements = statements;
        this.type = type;
    }
    DeclareFunctionStmt.prototype.visitStatement = function (visitor, context) {
        return visitor.visitDeclareFunctionStmt(this, context);
    };
    return DeclareFunctionStmt;
}(Statement));
exports.DeclareFunctionStmt = DeclareFunctionStmt;
var ExpressionStatement = (function (_super) {
    __extends(ExpressionStatement, _super);
    function ExpressionStatement(expr) {
        _super.call(this);
        this.expr = expr;
    }
    ExpressionStatement.prototype.visitStatement = function (visitor, context) {
        return visitor.visitExpressionStmt(this, context);
    };
    return ExpressionStatement;
}(Statement));
exports.ExpressionStatement = ExpressionStatement;
var ReturnStatement = (function (_super) {
    __extends(ReturnStatement, _super);
    function ReturnStatement(value) {
        _super.call(this);
        this.value = value;
    }
    ReturnStatement.prototype.visitStatement = function (visitor, context) {
        return visitor.visitReturnStmt(this, context);
    };
    return ReturnStatement;
}(Statement));
exports.ReturnStatement = ReturnStatement;
var AbstractClassPart = (function () {
    function AbstractClassPart(type, modifiers) {
        if (type === void 0) { type = null; }
        this.type = type;
        this.modifiers = modifiers;
        if (lang_1.isBlank(modifiers)) {
            this.modifiers = [];
        }
    }
    AbstractClassPart.prototype.hasModifier = function (modifier) { return this.modifiers.indexOf(modifier) !== -1; };
    return AbstractClassPart;
}());
exports.AbstractClassPart = AbstractClassPart;
var ClassField = (function (_super) {
    __extends(ClassField, _super);
    function ClassField(name, type, modifiers) {
        if (type === void 0) { type = null; }
        if (modifiers === void 0) { modifiers = null; }
        _super.call(this, type, modifiers);
        this.name = name;
    }
    return ClassField;
}(AbstractClassPart));
exports.ClassField = ClassField;
var ClassMethod = (function (_super) {
    __extends(ClassMethod, _super);
    function ClassMethod(name, params, body, type, modifiers) {
        if (type === void 0) { type = null; }
        if (modifiers === void 0) { modifiers = null; }
        _super.call(this, type, modifiers);
        this.name = name;
        this.params = params;
        this.body = body;
    }
    return ClassMethod;
}(AbstractClassPart));
exports.ClassMethod = ClassMethod;
var ClassGetter = (function (_super) {
    __extends(ClassGetter, _super);
    function ClassGetter(name, body, type, modifiers) {
        if (type === void 0) { type = null; }
        if (modifiers === void 0) { modifiers = null; }
        _super.call(this, type, modifiers);
        this.name = name;
        this.body = body;
    }
    return ClassGetter;
}(AbstractClassPart));
exports.ClassGetter = ClassGetter;
var ClassStmt = (function (_super) {
    __extends(ClassStmt, _super);
    function ClassStmt(name, parent, fields, getters, constructorMethod, methods, modifiers) {
        if (modifiers === void 0) { modifiers = null; }
        _super.call(this, modifiers);
        this.name = name;
        this.parent = parent;
        this.fields = fields;
        this.getters = getters;
        this.constructorMethod = constructorMethod;
        this.methods = methods;
    }
    ClassStmt.prototype.visitStatement = function (visitor, context) {
        return visitor.visitDeclareClassStmt(this, context);
    };
    return ClassStmt;
}(Statement));
exports.ClassStmt = ClassStmt;
var IfStmt = (function (_super) {
    __extends(IfStmt, _super);
    function IfStmt(condition, trueCase, falseCase) {
        if (falseCase === void 0) { falseCase = lang_1.CONST_EXPR([]); }
        _super.call(this);
        this.condition = condition;
        this.trueCase = trueCase;
        this.falseCase = falseCase;
    }
    IfStmt.prototype.visitStatement = function (visitor, context) {
        return visitor.visitIfStmt(this, context);
    };
    return IfStmt;
}(Statement));
exports.IfStmt = IfStmt;
var CommentStmt = (function (_super) {
    __extends(CommentStmt, _super);
    function CommentStmt(comment) {
        _super.call(this);
        this.comment = comment;
    }
    CommentStmt.prototype.visitStatement = function (visitor, context) {
        return visitor.visitCommentStmt(this, context);
    };
    return CommentStmt;
}(Statement));
exports.CommentStmt = CommentStmt;
var TryCatchStmt = (function (_super) {
    __extends(TryCatchStmt, _super);
    function TryCatchStmt(bodyStmts, catchStmts) {
        _super.call(this);
        this.bodyStmts = bodyStmts;
        this.catchStmts = catchStmts;
    }
    TryCatchStmt.prototype.visitStatement = function (visitor, context) {
        return visitor.visitTryCatchStmt(this, context);
    };
    return TryCatchStmt;
}(Statement));
exports.TryCatchStmt = TryCatchStmt;
var ThrowStmt = (function (_super) {
    __extends(ThrowStmt, _super);
    function ThrowStmt(error) {
        _super.call(this);
        this.error = error;
    }
    ThrowStmt.prototype.visitStatement = function (visitor, context) {
        return visitor.visitThrowStmt(this, context);
    };
    return ThrowStmt;
}(Statement));
exports.ThrowStmt = ThrowStmt;
var ExpressionTransformer = (function () {
    function ExpressionTransformer() {
    }
    ExpressionTransformer.prototype.visitReadVarExpr = function (ast, context) { return ast; };
    ExpressionTransformer.prototype.visitWriteVarExpr = function (expr, context) {
        return new WriteVarExpr(expr.name, expr.value.visitExpression(this, context));
    };
    ExpressionTransformer.prototype.visitWriteKeyExpr = function (expr, context) {
        return new WriteKeyExpr(expr.receiver.visitExpression(this, context), expr.index.visitExpression(this, context), expr.value.visitExpression(this, context));
    };
    ExpressionTransformer.prototype.visitWritePropExpr = function (expr, context) {
        return new WritePropExpr(expr.receiver.visitExpression(this, context), expr.name, expr.value.visitExpression(this, context));
    };
    ExpressionTransformer.prototype.visitInvokeMethodExpr = function (ast, context) {
        var method = lang_1.isPresent(ast.builtin) ? ast.builtin : ast.name;
        return new InvokeMethodExpr(ast.receiver.visitExpression(this, context), method, this.visitAllExpressions(ast.args, context), ast.type);
    };
    ExpressionTransformer.prototype.visitInvokeFunctionExpr = function (ast, context) {
        return new InvokeFunctionExpr(ast.fn.visitExpression(this, context), this.visitAllExpressions(ast.args, context), ast.type);
    };
    ExpressionTransformer.prototype.visitInstantiateExpr = function (ast, context) {
        return new InstantiateExpr(ast.classExpr.visitExpression(this, context), this.visitAllExpressions(ast.args, context), ast.type);
    };
    ExpressionTransformer.prototype.visitLiteralExpr = function (ast, context) { return ast; };
    ExpressionTransformer.prototype.visitExternalExpr = function (ast, context) { return ast; };
    ExpressionTransformer.prototype.visitConditionalExpr = function (ast, context) {
        return new ConditionalExpr(ast.condition.visitExpression(this, context), ast.trueCase.visitExpression(this, context), ast.falseCase.visitExpression(this, context));
    };
    ExpressionTransformer.prototype.visitNotExpr = function (ast, context) {
        return new NotExpr(ast.condition.visitExpression(this, context));
    };
    ExpressionTransformer.prototype.visitCastExpr = function (ast, context) {
        return new CastExpr(ast.value.visitExpression(this, context), context);
    };
    ExpressionTransformer.prototype.visitFunctionExpr = function (ast, context) {
        // Don't descend into nested functions
        return ast;
    };
    ExpressionTransformer.prototype.visitBinaryOperatorExpr = function (ast, context) {
        return new BinaryOperatorExpr(ast.operator, ast.lhs.visitExpression(this, context), ast.rhs.visitExpression(this, context), ast.type);
    };
    ExpressionTransformer.prototype.visitReadPropExpr = function (ast, context) {
        return new ReadPropExpr(ast.receiver.visitExpression(this, context), ast.name, ast.type);
    };
    ExpressionTransformer.prototype.visitReadKeyExpr = function (ast, context) {
        return new ReadKeyExpr(ast.receiver.visitExpression(this, context), ast.index.visitExpression(this, context), ast.type);
    };
    ExpressionTransformer.prototype.visitLiteralArrayExpr = function (ast, context) {
        return new LiteralArrayExpr(this.visitAllExpressions(ast.entries, context));
    };
    ExpressionTransformer.prototype.visitLiteralMapExpr = function (ast, context) {
        var _this = this;
        return new LiteralMapExpr(ast.entries.map(function (entry) { return [entry[0], entry[1].visitExpression(_this, context)]; }));
    };
    ExpressionTransformer.prototype.visitAllExpressions = function (exprs, context) {
        var _this = this;
        return exprs.map(function (expr) { return expr.visitExpression(_this, context); });
    };
    ExpressionTransformer.prototype.visitDeclareVarStmt = function (stmt, context) {
        return new DeclareVarStmt(stmt.name, stmt.value.visitExpression(this, context), stmt.type, stmt.modifiers);
    };
    ExpressionTransformer.prototype.visitDeclareFunctionStmt = function (stmt, context) {
        // Don't descend into nested functions
        return stmt;
    };
    ExpressionTransformer.prototype.visitExpressionStmt = function (stmt, context) {
        return new ExpressionStatement(stmt.expr.visitExpression(this, context));
    };
    ExpressionTransformer.prototype.visitReturnStmt = function (stmt, context) {
        return new ReturnStatement(stmt.value.visitExpression(this, context));
    };
    ExpressionTransformer.prototype.visitDeclareClassStmt = function (stmt, context) {
        // Don't descend into nested functions
        return stmt;
    };
    ExpressionTransformer.prototype.visitIfStmt = function (stmt, context) {
        return new IfStmt(stmt.condition.visitExpression(this, context), this.visitAllStatements(stmt.trueCase, context), this.visitAllStatements(stmt.falseCase, context));
    };
    ExpressionTransformer.prototype.visitTryCatchStmt = function (stmt, context) {
        return new TryCatchStmt(this.visitAllStatements(stmt.bodyStmts, context), this.visitAllStatements(stmt.catchStmts, context));
    };
    ExpressionTransformer.prototype.visitThrowStmt = function (stmt, context) {
        return new ThrowStmt(stmt.error.visitExpression(this, context));
    };
    ExpressionTransformer.prototype.visitCommentStmt = function (stmt, context) { return stmt; };
    ExpressionTransformer.prototype.visitAllStatements = function (stmts, context) {
        var _this = this;
        return stmts.map(function (stmt) { return stmt.visitStatement(_this, context); });
    };
    return ExpressionTransformer;
}());
exports.ExpressionTransformer = ExpressionTransformer;
var RecursiveExpressionVisitor = (function () {
    function RecursiveExpressionVisitor() {
    }
    RecursiveExpressionVisitor.prototype.visitReadVarExpr = function (ast, context) { return ast; };
    RecursiveExpressionVisitor.prototype.visitWriteVarExpr = function (expr, context) {
        expr.value.visitExpression(this, context);
        return expr;
    };
    RecursiveExpressionVisitor.prototype.visitWriteKeyExpr = function (expr, context) {
        expr.receiver.visitExpression(this, context);
        expr.index.visitExpression(this, context);
        expr.value.visitExpression(this, context);
        return expr;
    };
    RecursiveExpressionVisitor.prototype.visitWritePropExpr = function (expr, context) {
        expr.receiver.visitExpression(this, context);
        expr.value.visitExpression(this, context);
        return expr;
    };
    RecursiveExpressionVisitor.prototype.visitInvokeMethodExpr = function (ast, context) {
        ast.receiver.visitExpression(this, context);
        this.visitAllExpressions(ast.args, context);
        return ast;
    };
    RecursiveExpressionVisitor.prototype.visitInvokeFunctionExpr = function (ast, context) {
        ast.fn.visitExpression(this, context);
        this.visitAllExpressions(ast.args, context);
        return ast;
    };
    RecursiveExpressionVisitor.prototype.visitInstantiateExpr = function (ast, context) {
        ast.classExpr.visitExpression(this, context);
        this.visitAllExpressions(ast.args, context);
        return ast;
    };
    RecursiveExpressionVisitor.prototype.visitLiteralExpr = function (ast, context) { return ast; };
    RecursiveExpressionVisitor.prototype.visitExternalExpr = function (ast, context) { return ast; };
    RecursiveExpressionVisitor.prototype.visitConditionalExpr = function (ast, context) {
        ast.condition.visitExpression(this, context);
        ast.trueCase.visitExpression(this, context);
        ast.falseCase.visitExpression(this, context);
        return ast;
    };
    RecursiveExpressionVisitor.prototype.visitNotExpr = function (ast, context) {
        ast.condition.visitExpression(this, context);
        return ast;
    };
    RecursiveExpressionVisitor.prototype.visitCastExpr = function (ast, context) {
        ast.value.visitExpression(this, context);
        return ast;
    };
    RecursiveExpressionVisitor.prototype.visitFunctionExpr = function (ast, context) { return ast; };
    RecursiveExpressionVisitor.prototype.visitBinaryOperatorExpr = function (ast, context) {
        ast.lhs.visitExpression(this, context);
        ast.rhs.visitExpression(this, context);
        return ast;
    };
    RecursiveExpressionVisitor.prototype.visitReadPropExpr = function (ast, context) {
        ast.receiver.visitExpression(this, context);
        return ast;
    };
    RecursiveExpressionVisitor.prototype.visitReadKeyExpr = function (ast, context) {
        ast.receiver.visitExpression(this, context);
        ast.index.visitExpression(this, context);
        return ast;
    };
    RecursiveExpressionVisitor.prototype.visitLiteralArrayExpr = function (ast, context) {
        this.visitAllExpressions(ast.entries, context);
        return ast;
    };
    RecursiveExpressionVisitor.prototype.visitLiteralMapExpr = function (ast, context) {
        var _this = this;
        ast.entries.forEach(function (entry) { return entry[1].visitExpression(_this, context); });
        return ast;
    };
    RecursiveExpressionVisitor.prototype.visitAllExpressions = function (exprs, context) {
        var _this = this;
        exprs.forEach(function (expr) { return expr.visitExpression(_this, context); });
    };
    RecursiveExpressionVisitor.prototype.visitDeclareVarStmt = function (stmt, context) {
        stmt.value.visitExpression(this, context);
        return stmt;
    };
    RecursiveExpressionVisitor.prototype.visitDeclareFunctionStmt = function (stmt, context) {
        // Don't descend into nested functions
        return stmt;
    };
    RecursiveExpressionVisitor.prototype.visitExpressionStmt = function (stmt, context) {
        stmt.expr.visitExpression(this, context);
        return stmt;
    };
    RecursiveExpressionVisitor.prototype.visitReturnStmt = function (stmt, context) {
        stmt.value.visitExpression(this, context);
        return stmt;
    };
    RecursiveExpressionVisitor.prototype.visitDeclareClassStmt = function (stmt, context) {
        // Don't descend into nested functions
        return stmt;
    };
    RecursiveExpressionVisitor.prototype.visitIfStmt = function (stmt, context) {
        stmt.condition.visitExpression(this, context);
        this.visitAllStatements(stmt.trueCase, context);
        this.visitAllStatements(stmt.falseCase, context);
        return stmt;
    };
    RecursiveExpressionVisitor.prototype.visitTryCatchStmt = function (stmt, context) {
        this.visitAllStatements(stmt.bodyStmts, context);
        this.visitAllStatements(stmt.catchStmts, context);
        return stmt;
    };
    RecursiveExpressionVisitor.prototype.visitThrowStmt = function (stmt, context) {
        stmt.error.visitExpression(this, context);
        return stmt;
    };
    RecursiveExpressionVisitor.prototype.visitCommentStmt = function (stmt, context) { return stmt; };
    RecursiveExpressionVisitor.prototype.visitAllStatements = function (stmts, context) {
        var _this = this;
        stmts.forEach(function (stmt) { return stmt.visitStatement(_this, context); });
    };
    return RecursiveExpressionVisitor;
}());
exports.RecursiveExpressionVisitor = RecursiveExpressionVisitor;
function replaceVarInExpression(varName, newValue, expression) {
    var transformer = new _ReplaceVariableTransformer(varName, newValue);
    return expression.visitExpression(transformer, null);
}
exports.replaceVarInExpression = replaceVarInExpression;
var _ReplaceVariableTransformer = (function (_super) {
    __extends(_ReplaceVariableTransformer, _super);
    function _ReplaceVariableTransformer(_varName, _newValue) {
        _super.call(this);
        this._varName = _varName;
        this._newValue = _newValue;
    }
    _ReplaceVariableTransformer.prototype.visitReadVarExpr = function (ast, context) {
        return ast.name == this._varName ? this._newValue : ast;
    };
    return _ReplaceVariableTransformer;
}(ExpressionTransformer));
function findReadVarNames(stmts) {
    var finder = new _VariableFinder();
    finder.visitAllStatements(stmts, null);
    return finder.varNames;
}
exports.findReadVarNames = findReadVarNames;
var _VariableFinder = (function (_super) {
    __extends(_VariableFinder, _super);
    function _VariableFinder() {
        _super.apply(this, arguments);
        this.varNames = new Set();
    }
    _VariableFinder.prototype.visitReadVarExpr = function (ast, context) {
        this.varNames.add(ast.name);
        return null;
    };
    return _VariableFinder;
}(RecursiveExpressionVisitor));
function variable(name, type) {
    if (type === void 0) { type = null; }
    return new ReadVarExpr(name, type);
}
exports.variable = variable;
function importExpr(id, typeParams) {
    if (typeParams === void 0) { typeParams = null; }
    return new ExternalExpr(id, null, typeParams);
}
exports.importExpr = importExpr;
function importType(id, typeParams, typeModifiers) {
    if (typeParams === void 0) { typeParams = null; }
    if (typeModifiers === void 0) { typeModifiers = null; }
    return lang_1.isPresent(id) ? new ExternalType(id, typeParams, typeModifiers) : null;
}
exports.importType = importType;
function literal(value, type) {
    if (type === void 0) { type = null; }
    return new LiteralExpr(value, type);
}
exports.literal = literal;
function literalArr(values, type) {
    if (type === void 0) { type = null; }
    return new LiteralArrayExpr(values, type);
}
exports.literalArr = literalArr;
function literalMap(values, type) {
    if (type === void 0) { type = null; }
    return new LiteralMapExpr(values, type);
}
exports.literalMap = literalMap;
function not(expr) {
    return new NotExpr(expr);
}
exports.not = not;
function fn(params, body, type) {
    if (type === void 0) { type = null; }
    return new FunctionExpr(params, body, type);
}
exports.fn = fn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0X2FzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtbGI3ZmVCcnoudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9vdXRwdXQvb3V0cHV0X2FzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxxQkFBdUQsMEJBQTBCLENBQUMsQ0FBQTtBQUdsRixVQUFVO0FBQ1YsV0FBWSxZQUFZO0lBQ3RCLGlEQUFLLENBQUE7QUFDUCxDQUFDLEVBRlcsb0JBQVksS0FBWixvQkFBWSxRQUV2QjtBQUZELElBQVksWUFBWSxHQUFaLG9CQUVYLENBQUE7QUFFRDtJQUNFLGNBQW1CLFNBQWdDO1FBQXZDLHlCQUF1QyxHQUF2QyxnQkFBdUM7UUFBaEMsY0FBUyxHQUFULFNBQVMsQ0FBdUI7UUFDakQsRUFBRSxDQUFDLENBQUMsY0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUN0QixDQUFDO0lBQ0gsQ0FBQztJQUdELDBCQUFXLEdBQVgsVUFBWSxRQUFzQixJQUFhLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEcsV0FBQztBQUFELENBQUMsQUFURCxJQVNDO0FBVHFCLFlBQUksT0FTekIsQ0FBQTtBQUVELFdBQVksZUFBZTtJQUN6QiwyREFBTyxDQUFBO0lBQ1AscURBQUksQ0FBQTtJQUNKLHlEQUFNLENBQUE7SUFDTixtREFBRyxDQUFBO0lBQ0gseURBQU0sQ0FBQTtJQUNOLDZEQUFRLENBQUE7QUFDVixDQUFDLEVBUFcsdUJBQWUsS0FBZix1QkFBZSxRQU8xQjtBQVBELElBQVksZUFBZSxHQUFmLHVCQU9YLENBQUE7QUFFRDtJQUFpQywrQkFBSTtJQUNuQyxxQkFBbUIsSUFBcUIsRUFB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QUM7QUFGZSxrQkFBVSxhQUV6QixDQUFBO0FBRUQsb0JBQTJCLE1BQXlDLEVBQ3pDLElBQW9CO0lBQXBCLG9CQUFvQixHQUFwQixXQUFvQjtJQUM3QyxNQUFNLENBQUMsSUFBSSxjQUFjLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzFDLENBQUM7QUFIZSxrQkFBVSxhQUd6QixDQUFBO0FBRUQsYUFBb0IsSUFBZ0I7SUFDbEMsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNCLENBQUM7QUFGZSxXQUFHLE1BRWxCLENBQUE7QUFFRCxZQUFtQixNQUFpQixFQUFFLElBQWlCLEVBQUUsSUFBaUI7SUFBakIsb0JBQWlCLEdBQWpCLFdBQWlCO0lBQ3hFLE1BQU0sQ0FBQyxJQUFJLFlBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzlDLENBQUM7QUFGZSxVQUFFLEtBRWpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNUX0VYUFIsIGlzU3RyaW5nLCBpc1ByZXNlbnQsIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0NvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGF9IGZyb20gJy4uL2NvbXBpbGVfbWV0YWRhdGEnO1xuXG4vLy8vIFR5cGVzXG5leHBvcnQgZW51bSBUeXBlTW9kaWZpZXIge1xuICBDb25zdFxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVHlwZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBtb2RpZmllcnM6IFR5cGVNb2RpZmllcltdID0gbnVsbCkge1xuICAgIGlmIChpc0JsYW5rKG1vZGlmaWVycykpIHtcbiAgICAgIHRoaXMubW9kaWZpZXJzID0gW107XG4gICAgfVxuICB9XG4gIGFic3RyYWN0IHZpc2l0VHlwZSh2aXNpdG9yOiBUeXBlVmlzaXRvciwgY29udGV4dDogYW55KTogYW55O1xuXG4gIGhhc01vZGlmaWVyKG1vZGlmaWVyOiBUeXBlTW9kaWZpZXIpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMubW9kaWZpZXJzLmluZGV4T2YobW9kaWZpZXIpICE9PSAtMTsgfVxufVxuXG5leHBvcnQgZW51bSBCdWlsdGluVHlwZU5hbWUge1xuICBEeW5hbWljLFxuICBCb29sLFxuICBTdHJpbmcsXG4gIEludCxcbiAgTnVtYmVyLFxuICBGdW5jdGlvblxufVxuXG5leHBvcnQgY2xhc3MgQnVpbHRpblR5cGUgZXh0ZW5kcyBUeXBlIHtcbiAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IEJ1aWx0aW5UeXBlTmFtZSwgbW9kaWZpZXJzOiBUeXBlTW9kaWZpZXJbXSA9IG51bGwpIHsgc3VwZXIobW9kaWZpZXJzKTsgfVxuICB2aXNpdFR5cGUodmlzaXRvcjogVHlwZVZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRCdWlsdGludFR5cGUodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEV4dGVybmFsVHlwZSBleHRlbmRzIFR5cGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdmFsdWU6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEsIHB1YmxpYyB0eXBlUGFyYW1zOiBUeXBlW10gPSBudWxsLFxuICAgICAgICAgICAgICBtb2RpZmllcnM6IFR5cGVNb2RpZmllcltdID0gbnVsbCkge1xuICAgIHN1cGVyKG1vZGlmaWVycyk7XG4gIH1cbiAgdmlzaXRUeXBlKHZpc2l0b3I6IFR5cGVWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RXh0ZXJuYWxUeXBlKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIEFycmF5VHlwZSBleHRlbmRzIFR5cGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgb2Y6IFR5cGUsIG1vZGlmaWVyczogVHlwZU1vZGlmaWVyW10gPSBudWxsKSB7IHN1cGVyKG1vZGlmaWVycyk7IH1cbiAgdmlzaXRUeXBlKHZpc2l0b3I6IFR5cGVWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0QXJyYXlUeXBlKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIE1hcFR5cGUgZXh0ZW5kcyBUeXBlIHtcbiAgY29uc3RydWN0b3IocHVibGljIHZhbHVlVHlwZTogVHlwZSwgbW9kaWZpZXJzOiBUeXBlTW9kaWZpZXJbXSA9IG51bGwpIHsgc3VwZXIobW9kaWZpZXJzKTsgfVxuICB2aXNpdFR5cGUodmlzaXRvcjogVHlwZVZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0TWFwVHlwZSh0aGlzLCBjb250ZXh0KTsgfVxufVxuXG5leHBvcnQgdmFyIERZTkFNSUNfVFlQRSA9IG5ldyBCdWlsdGluVHlwZShCdWlsdGluVHlwZU5hbWUuRHluYW1pYyk7XG5leHBvcnQgdmFyIEJPT0xfVFlQRSA9IG5ldyBCdWlsdGluVHlwZShCdWlsdGluVHlwZU5hbWUuQm9vbCk7XG5leHBvcnQgdmFyIElOVF9UWVBFID0gbmV3IEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlTmFtZS5JbnQpO1xuZXhwb3J0IHZhciBOVU1CRVJfVFlQRSA9IG5ldyBCdWlsdGluVHlwZShCdWlsdGluVHlwZU5hbWUuTnVtYmVyKTtcbmV4cG9ydCB2YXIgU1RSSU5HX1RZUEUgPSBuZXcgQnVpbHRpblR5cGUoQnVpbHRpblR5cGVOYW1lLlN0cmluZyk7XG5leHBvcnQgdmFyIEZVTkNUSU9OX1RZUEUgPSBuZXcgQnVpbHRpblR5cGUoQnVpbHRpblR5cGVOYW1lLkZ1bmN0aW9uKTtcblxuXG5leHBvcnQgaW50ZXJmYWNlIFR5cGVWaXNpdG9yIHtcbiAgdmlzaXRCdWlsdGludFR5cGUodHlwZTogQnVpbHRpblR5cGUsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRFeHRlcm5hbFR5cGUodHlwZTogRXh0ZXJuYWxUeXBlLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0QXJyYXlUeXBlKHR5cGU6IEFycmF5VHlwZSwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdE1hcFR5cGUodHlwZTogTWFwVHlwZSwgY29udGV4dDogYW55KTogYW55O1xufVxuXG4vLy8vLyBFeHByZXNzaW9uc1xuXG5leHBvcnQgZW51bSBCaW5hcnlPcGVyYXRvciB7XG4gIEVxdWFscyxcbiAgTm90RXF1YWxzLFxuICBJZGVudGljYWwsXG4gIE5vdElkZW50aWNhbCxcbiAgTWludXMsXG4gIFBsdXMsXG4gIERpdmlkZSxcbiAgTXVsdGlwbHksXG4gIE1vZHVsbyxcbiAgQW5kLFxuICBPcixcbiAgTG93ZXIsXG4gIExvd2VyRXF1YWxzLFxuICBCaWdnZXIsXG4gIEJpZ2dlckVxdWFsc1xufVxuXG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBFeHByZXNzaW9uIHtcbiAgY29uc3RydWN0b3IocHVibGljIHR5cGU6IFR5cGUpIHt9XG5cbiAgYWJzdHJhY3QgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IEV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnk7XG5cbiAgcHJvcChuYW1lOiBzdHJpbmcpOiBSZWFkUHJvcEV4cHIgeyByZXR1cm4gbmV3IFJlYWRQcm9wRXhwcih0aGlzLCBuYW1lKTsgfVxuXG4gIGtleShpbmRleDogRXhwcmVzc2lvbiwgdHlwZTogVHlwZSA9IG51bGwpOiBSZWFkS2V5RXhwciB7XG4gICAgcmV0dXJuIG5ldyBSZWFkS2V5RXhwcih0aGlzLCBpbmRleCwgdHlwZSk7XG4gIH1cblxuICBjYWxsTWV0aG9kKG5hbWU6IHN0cmluZyB8IEJ1aWx0aW5NZXRob2QsIHBhcmFtczogRXhwcmVzc2lvbltdKTogSW52b2tlTWV0aG9kRXhwciB7XG4gICAgcmV0dXJuIG5ldyBJbnZva2VNZXRob2RFeHByKHRoaXMsIG5hbWUsIHBhcmFtcyk7XG4gIH1cblxuICBjYWxsRm4ocGFyYW1zOiBFeHByZXNzaW9uW10pOiBJbnZva2VGdW5jdGlvbkV4cHIgeyByZXR1cm4gbmV3IEludm9rZUZ1bmN0aW9uRXhwcih0aGlzLCBwYXJhbXMpOyB9XG5cbiAgaW5zdGFudGlhdGUocGFyYW1zOiBFeHByZXNzaW9uW10sIHR5cGU6IFR5cGUgPSBudWxsKTogSW5zdGFudGlhdGVFeHByIHtcbiAgICByZXR1cm4gbmV3IEluc3RhbnRpYXRlRXhwcih0aGlzLCBwYXJhbXMsIHR5cGUpO1xuICB9XG5cbiAgY29uZGl0aW9uYWwodHJ1ZUNhc2U6IEV4cHJlc3Npb24sIGZhbHNlQ2FzZTogRXhwcmVzc2lvbiA9IG51bGwpOiBDb25kaXRpb25hbEV4cHIge1xuICAgIHJldHVybiBuZXcgQ29uZGl0aW9uYWxFeHByKHRoaXMsIHRydWVDYXNlLCBmYWxzZUNhc2UpO1xuICB9XG5cbiAgZXF1YWxzKHJoczogRXhwcmVzc2lvbik6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuRXF1YWxzLCB0aGlzLCByaHMpO1xuICB9XG4gIG5vdEVxdWFscyhyaHM6IEV4cHJlc3Npb24pOiBCaW5hcnlPcGVyYXRvckV4cHIge1xuICAgIHJldHVybiBuZXcgQmluYXJ5T3BlcmF0b3JFeHByKEJpbmFyeU9wZXJhdG9yLk5vdEVxdWFscywgdGhpcywgcmhzKTtcbiAgfVxuICBpZGVudGljYWwocmhzOiBFeHByZXNzaW9uKTogQmluYXJ5T3BlcmF0b3JFeHByIHtcbiAgICByZXR1cm4gbmV3IEJpbmFyeU9wZXJhdG9yRXhwcihCaW5hcnlPcGVyYXRvci5JZGVudGljYWwsIHRoaXMsIHJocyk7XG4gIH1cbiAgbm90SWRlbnRpY2FsKHJoczogRXhwcmVzc2lvbik6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuTm90SWRlbnRpY2FsLCB0aGlzLCByaHMpO1xuICB9XG4gIG1pbnVzKHJoczogRXhwcmVzc2lvbik6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuTWludXMsIHRoaXMsIHJocyk7XG4gIH1cbiAgcGx1cyhyaHM6IEV4cHJlc3Npb24pOiBCaW5hcnlPcGVyYXRvckV4cHIge1xuICAgIHJldHVybiBuZXcgQmluYXJ5T3BlcmF0b3JFeHByKEJpbmFyeU9wZXJhdG9yLlBsdXMsIHRoaXMsIHJocyk7XG4gIH1cbiAgZGl2aWRlKHJoczogRXhwcmVzc2lvbik6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuRGl2aWRlLCB0aGlzLCByaHMpO1xuICB9XG4gIG11bHRpcGx5KHJoczogRXhwcmVzc2lvbik6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuTXVsdGlwbHksIHRoaXMsIHJocyk7XG4gIH1cbiAgbW9kdWxvKHJoczogRXhwcmVzc2lvbik6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuTW9kdWxvLCB0aGlzLCByaHMpO1xuICB9XG4gIGFuZChyaHM6IEV4cHJlc3Npb24pOiBCaW5hcnlPcGVyYXRvckV4cHIge1xuICAgIHJldHVybiBuZXcgQmluYXJ5T3BlcmF0b3JFeHByKEJpbmFyeU9wZXJhdG9yLkFuZCwgdGhpcywgcmhzKTtcbiAgfVxuICBvcihyaHM6IEV4cHJlc3Npb24pOiBCaW5hcnlPcGVyYXRvckV4cHIge1xuICAgIHJldHVybiBuZXcgQmluYXJ5T3BlcmF0b3JFeHByKEJpbmFyeU9wZXJhdG9yLk9yLCB0aGlzLCByaHMpO1xuICB9XG4gIGxvd2VyKHJoczogRXhwcmVzc2lvbik6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuTG93ZXIsIHRoaXMsIHJocyk7XG4gIH1cbiAgbG93ZXJFcXVhbHMocmhzOiBFeHByZXNzaW9uKTogQmluYXJ5T3BlcmF0b3JFeHByIHtcbiAgICByZXR1cm4gbmV3IEJpbmFyeU9wZXJhdG9yRXhwcihCaW5hcnlPcGVyYXRvci5Mb3dlckVxdWFscywgdGhpcywgcmhzKTtcbiAgfVxuICBiaWdnZXIocmhzOiBFeHByZXNzaW9uKTogQmluYXJ5T3BlcmF0b3JFeHByIHtcbiAgICByZXR1cm4gbmV3IEJpbmFyeU9wZXJhdG9yRXhwcihCaW5hcnlPcGVyYXRvci5CaWdnZXIsIHRoaXMsIHJocyk7XG4gIH1cbiAgYmlnZ2VyRXF1YWxzKHJoczogRXhwcmVzc2lvbik6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuQmlnZ2VyRXF1YWxzLCB0aGlzLCByaHMpO1xuICB9XG4gIGlzQmxhbmsoKTogRXhwcmVzc2lvbiB7XG4gICAgLy8gTm90ZTogV2UgdXNlIGVxdWFscyBieSBwdXJwb3NlIGhlcmUgdG8gY29tcGFyZSB0byBudWxsIGFuZCB1bmRlZmluZWQgaW4gSlMuXG4gICAgcmV0dXJuIHRoaXMuZXF1YWxzKE5VTExfRVhQUik7XG4gIH1cbiAgY2FzdCh0eXBlOiBUeXBlKTogRXhwcmVzc2lvbiB7IHJldHVybiBuZXcgQ2FzdEV4cHIodGhpcywgdHlwZSk7IH1cbiAgdG9TdG10KCk6IFN0YXRlbWVudCB7IHJldHVybiBuZXcgRXhwcmVzc2lvblN0YXRlbWVudCh0aGlzKTsgfVxufVxuXG5leHBvcnQgZW51bSBCdWlsdGluVmFyIHtcbiAgVGhpcyxcbiAgU3VwZXIsXG4gIENhdGNoRXJyb3IsXG4gIENhdGNoU3RhY2ssXG4gIE1ldGFkYXRhTWFwXG59XG5cbmV4cG9ydCBjbGFzcyBSZWFkVmFyRXhwciBleHRlbmRzIEV4cHJlc3Npb24ge1xuICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuICBwdWJsaWMgYnVpbHRpbjogQnVpbHRpblZhcjtcblxuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcgfCBCdWlsdGluVmFyLCB0eXBlOiBUeXBlID0gbnVsbCkge1xuICAgIHN1cGVyKHR5cGUpO1xuICAgIGlmIChpc1N0cmluZyhuYW1lKSkge1xuICAgICAgdGhpcy5uYW1lID0gPHN0cmluZz5uYW1lO1xuICAgICAgdGhpcy5idWlsdGluID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5uYW1lID0gbnVsbDtcbiAgICAgIHRoaXMuYnVpbHRpbiA9IDxCdWlsdGluVmFyPm5hbWU7XG4gICAgfVxuICB9XG4gIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBFeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFJlYWRWYXJFeHByKHRoaXMsIGNvbnRleHQpO1xuICB9XG5cbiAgc2V0KHZhbHVlOiBFeHByZXNzaW9uKTogV3JpdGVWYXJFeHByIHsgcmV0dXJuIG5ldyBXcml0ZVZhckV4cHIodGhpcy5uYW1lLCB2YWx1ZSk7IH1cbn1cblxuXG5leHBvcnQgY2xhc3MgV3JpdGVWYXJFeHByIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIHB1YmxpYyB2YWx1ZTogRXhwcmVzc2lvbjtcbiAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IHN0cmluZywgdmFsdWU6IEV4cHJlc3Npb24sIHR5cGU6IFR5cGUgPSBudWxsKSB7XG4gICAgc3VwZXIoaXNQcmVzZW50KHR5cGUpID8gdHlwZSA6IHZhbHVlLnR5cGUpO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBFeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFdyaXRlVmFyRXhwcih0aGlzLCBjb250ZXh0KTtcbiAgfVxuXG4gIHRvRGVjbFN0bXQodHlwZTogVHlwZSA9IG51bGwsIG1vZGlmaWVyczogU3RtdE1vZGlmaWVyW10gPSBudWxsKTogRGVjbGFyZVZhclN0bXQge1xuICAgIHJldHVybiBuZXcgRGVjbGFyZVZhclN0bXQodGhpcy5uYW1lLCB0aGlzLnZhbHVlLCB0eXBlLCBtb2RpZmllcnMpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIFdyaXRlS2V5RXhwciBleHRlbmRzIEV4cHJlc3Npb24ge1xuICBwdWJsaWMgdmFsdWU6IEV4cHJlc3Npb247XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWNlaXZlcjogRXhwcmVzc2lvbiwgcHVibGljIGluZGV4OiBFeHByZXNzaW9uLCB2YWx1ZTogRXhwcmVzc2lvbixcbiAgICAgICAgICAgICAgdHlwZTogVHlwZSA9IG51bGwpIHtcbiAgICBzdXBlcihpc1ByZXNlbnQodHlwZSkgPyB0eXBlIDogdmFsdWUudHlwZSk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICB9XG4gIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBFeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFdyaXRlS2V5RXhwcih0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBXcml0ZVByb3BFeHByIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIHB1YmxpYyB2YWx1ZTogRXhwcmVzc2lvbjtcbiAgY29uc3RydWN0b3IocHVibGljIHJlY2VpdmVyOiBFeHByZXNzaW9uLCBwdWJsaWMgbmFtZTogc3RyaW5nLCB2YWx1ZTogRXhwcmVzc2lvbixcbiAgICAgICAgICAgICAgdHlwZTogVHlwZSA9IG51bGwpIHtcbiAgICBzdXBlcihpc1ByZXNlbnQodHlwZSkgPyB0eXBlIDogdmFsdWUudHlwZSk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICB9XG4gIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBFeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFdyaXRlUHJvcEV4cHIodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGVudW0gQnVpbHRpbk1ldGhvZCB7XG4gIENvbmNhdEFycmF5LFxuICBTdWJzY3JpYmVPYnNlcnZhYmxlXG59XG5cbmV4cG9ydCBjbGFzcyBJbnZva2VNZXRob2RFeHByIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gIHB1YmxpYyBidWlsdGluOiBCdWlsdGluTWV0aG9kO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVjZWl2ZXI6IEV4cHJlc3Npb24sIG1ldGhvZDogc3RyaW5nIHwgQnVpbHRpbk1ldGhvZCxcbiAgICAgICAgICAgICAgcHVibGljIGFyZ3M6IEV4cHJlc3Npb25bXSwgdHlwZTogVHlwZSA9IG51bGwpIHtcbiAgICBzdXBlcih0eXBlKTtcbiAgICBpZiAoaXNTdHJpbmcobWV0aG9kKSkge1xuICAgICAgdGhpcy5uYW1lID0gPHN0cmluZz5tZXRob2Q7XG4gICAgICB0aGlzLmJ1aWx0aW4gPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm5hbWUgPSBudWxsO1xuICAgICAgdGhpcy5idWlsdGluID0gPEJ1aWx0aW5NZXRob2Q+bWV0aG9kO1xuICAgIH1cbiAgfVxuICB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRJbnZva2VNZXRob2RFeHByKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIEludm9rZUZ1bmN0aW9uRXhwciBleHRlbmRzIEV4cHJlc3Npb24ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZm46IEV4cHJlc3Npb24sIHB1YmxpYyBhcmdzOiBFeHByZXNzaW9uW10sIHR5cGU6IFR5cGUgPSBudWxsKSB7IHN1cGVyKHR5cGUpOyB9XG4gIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBFeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEludm9rZUZ1bmN0aW9uRXhwcih0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBJbnN0YW50aWF0ZUV4cHIgZXh0ZW5kcyBFeHByZXNzaW9uIHtcbiAgY29uc3RydWN0b3IocHVibGljIGNsYXNzRXhwcjogRXhwcmVzc2lvbiwgcHVibGljIGFyZ3M6IEV4cHJlc3Npb25bXSwgdHlwZT86IFR5cGUpIHsgc3VwZXIodHlwZSk7IH1cbiAgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IEV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0SW5zdGFudGlhdGVFeHByKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIExpdGVyYWxFeHByIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2YWx1ZTogYW55LCB0eXBlOiBUeXBlID0gbnVsbCkgeyBzdXBlcih0eXBlKTsgfVxuICB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRMaXRlcmFsRXhwcih0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBFeHRlcm5hbEV4cHIgZXh0ZW5kcyBFeHByZXNzaW9uIHtcbiAgY29uc3RydWN0b3IocHVibGljIHZhbHVlOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLCB0eXBlOiBUeXBlID0gbnVsbCxcbiAgICAgICAgICAgICAgcHVibGljIHR5cGVQYXJhbXM6IFR5cGVbXSA9IG51bGwpIHtcbiAgICBzdXBlcih0eXBlKTtcbiAgfVxuICB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRFeHRlcm5hbEV4cHIodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgQ29uZGl0aW9uYWxFeHByIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIHB1YmxpYyB0cnVlQ2FzZTogRXhwcmVzc2lvbjtcbiAgY29uc3RydWN0b3IocHVibGljIGNvbmRpdGlvbjogRXhwcmVzc2lvbiwgdHJ1ZUNhc2U6IEV4cHJlc3Npb24sXG4gICAgICAgICAgICAgIHB1YmxpYyBmYWxzZUNhc2U6IEV4cHJlc3Npb24gPSBudWxsLCB0eXBlOiBUeXBlID0gbnVsbCkge1xuICAgIHN1cGVyKGlzUHJlc2VudCh0eXBlKSA/IHR5cGUgOiB0cnVlQ2FzZS50eXBlKTtcbiAgICB0aGlzLnRydWVDYXNlID0gdHJ1ZUNhc2U7XG4gIH1cbiAgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IEV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0Q29uZGl0aW9uYWxFeHByKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIE5vdEV4cHIgZXh0ZW5kcyBFeHByZXNzaW9uIHtcbiAgY29uc3RydWN0b3IocHVibGljIGNvbmRpdGlvbjogRXhwcmVzc2lvbikgeyBzdXBlcihCT09MX1RZUEUpOyB9XG4gIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBFeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdE5vdEV4cHIodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENhc3RFeHByIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2YWx1ZTogRXhwcmVzc2lvbiwgdHlwZTogVHlwZSkgeyBzdXBlcih0eXBlKTsgfVxuICB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRDYXN0RXhwcih0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBGblBhcmFtIHtcbiAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIHR5cGU6IFR5cGUgPSBudWxsKSB7fVxufVxuXG5cbmV4cG9ydCBjbGFzcyBGdW5jdGlvbkV4cHIgZXh0ZW5kcyBFeHByZXNzaW9uIHtcbiAgY29uc3RydWN0b3IocHVibGljIHBhcmFtczogRm5QYXJhbVtdLCBwdWJsaWMgc3RhdGVtZW50czogU3RhdGVtZW50W10sIHR5cGU6IFR5cGUgPSBudWxsKSB7XG4gICAgc3VwZXIodHlwZSk7XG4gIH1cbiAgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IEV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RnVuY3Rpb25FeHByKHRoaXMsIGNvbnRleHQpO1xuICB9XG5cbiAgdG9EZWNsU3RtdChuYW1lOiBzdHJpbmcsIG1vZGlmaWVyczogU3RtdE1vZGlmaWVyW10gPSBudWxsKTogRGVjbGFyZUZ1bmN0aW9uU3RtdCB7XG4gICAgcmV0dXJuIG5ldyBEZWNsYXJlRnVuY3Rpb25TdG10KG5hbWUsIHRoaXMucGFyYW1zLCB0aGlzLnN0YXRlbWVudHMsIHRoaXMudHlwZSwgbW9kaWZpZXJzKTtcbiAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBCaW5hcnlPcGVyYXRvckV4cHIgZXh0ZW5kcyBFeHByZXNzaW9uIHtcbiAgcHVibGljIGxoczogRXhwcmVzc2lvbjtcbiAgY29uc3RydWN0b3IocHVibGljIG9wZXJhdG9yOiBCaW5hcnlPcGVyYXRvciwgbGhzOiBFeHByZXNzaW9uLCBwdWJsaWMgcmhzOiBFeHByZXNzaW9uLFxuICAgICAgICAgICAgICB0eXBlOiBUeXBlID0gbnVsbCkge1xuICAgIHN1cGVyKGlzUHJlc2VudCh0eXBlKSA/IHR5cGUgOiBsaHMudHlwZSk7XG4gICAgdGhpcy5saHMgPSBsaHM7XG4gIH1cbiAgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IEV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0QmluYXJ5T3BlcmF0b3JFeHByKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIFJlYWRQcm9wRXhwciBleHRlbmRzIEV4cHJlc3Npb24ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVjZWl2ZXI6IEV4cHJlc3Npb24sIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHR5cGU6IFR5cGUgPSBudWxsKSB7IHN1cGVyKHR5cGUpOyB9XG4gIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBFeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFJlYWRQcm9wRXhwcih0aGlzLCBjb250ZXh0KTtcbiAgfVxuICBzZXQodmFsdWU6IEV4cHJlc3Npb24pOiBXcml0ZVByb3BFeHByIHtcbiAgICByZXR1cm4gbmV3IFdyaXRlUHJvcEV4cHIodGhpcy5yZWNlaXZlciwgdGhpcy5uYW1lLCB2YWx1ZSk7XG4gIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgUmVhZEtleUV4cHIgZXh0ZW5kcyBFeHByZXNzaW9uIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJlY2VpdmVyOiBFeHByZXNzaW9uLCBwdWJsaWMgaW5kZXg6IEV4cHJlc3Npb24sIHR5cGU6IFR5cGUgPSBudWxsKSB7XG4gICAgc3VwZXIodHlwZSk7XG4gIH1cbiAgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IEV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0UmVhZEtleUV4cHIodGhpcywgY29udGV4dCk7XG4gIH1cbiAgc2V0KHZhbHVlOiBFeHByZXNzaW9uKTogV3JpdGVLZXlFeHByIHtcbiAgICByZXR1cm4gbmV3IFdyaXRlS2V5RXhwcih0aGlzLnJlY2VpdmVyLCB0aGlzLmluZGV4LCB2YWx1ZSk7XG4gIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgTGl0ZXJhbEFycmF5RXhwciBleHRlbmRzIEV4cHJlc3Npb24ge1xuICBwdWJsaWMgZW50cmllczogRXhwcmVzc2lvbltdO1xuICBjb25zdHJ1Y3RvcihlbnRyaWVzOiBFeHByZXNzaW9uW10sIHR5cGU6IFR5cGUgPSBudWxsKSB7XG4gICAgc3VwZXIodHlwZSk7XG4gICAgdGhpcy5lbnRyaWVzID0gZW50cmllcztcbiAgfVxuICB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRMaXRlcmFsQXJyYXlFeHByKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIExpdGVyYWxNYXBFeHByIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIHB1YmxpYyB2YWx1ZVR5cGU6IFR5cGUgPSBudWxsO1xuICA7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlbnRyaWVzOiBBcnJheTxBcnJheTxzdHJpbmcgfCBFeHByZXNzaW9uPj4sIHR5cGU6IE1hcFR5cGUgPSBudWxsKSB7XG4gICAgc3VwZXIodHlwZSk7XG4gICAgaWYgKGlzUHJlc2VudCh0eXBlKSkge1xuICAgICAgdGhpcy52YWx1ZVR5cGUgPSB0eXBlLnZhbHVlVHlwZTtcbiAgICB9XG4gIH1cbiAgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IEV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0TGl0ZXJhbE1hcEV4cHIodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBFeHByZXNzaW9uVmlzaXRvciB7XG4gIHZpc2l0UmVhZFZhckV4cHIoYXN0OiBSZWFkVmFyRXhwciwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdFdyaXRlVmFyRXhwcihleHByOiBXcml0ZVZhckV4cHIsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRXcml0ZUtleUV4cHIoZXhwcjogV3JpdGVLZXlFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0V3JpdGVQcm9wRXhwcihleHByOiBXcml0ZVByb3BFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0SW52b2tlTWV0aG9kRXhwcihhc3Q6IEludm9rZU1ldGhvZEV4cHIsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRJbnZva2VGdW5jdGlvbkV4cHIoYXN0OiBJbnZva2VGdW5jdGlvbkV4cHIsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRJbnN0YW50aWF0ZUV4cHIoYXN0OiBJbnN0YW50aWF0ZUV4cHIsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRMaXRlcmFsRXhwcihhc3Q6IExpdGVyYWxFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0RXh0ZXJuYWxFeHByKGFzdDogRXh0ZXJuYWxFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0Q29uZGl0aW9uYWxFeHByKGFzdDogQ29uZGl0aW9uYWxFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0Tm90RXhwcihhc3Q6IE5vdEV4cHIsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRDYXN0RXhwcihhc3Q6IENhc3RFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0RnVuY3Rpb25FeHByKGFzdDogRnVuY3Rpb25FeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0QmluYXJ5T3BlcmF0b3JFeHByKGFzdDogQmluYXJ5T3BlcmF0b3JFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0UmVhZFByb3BFeHByKGFzdDogUmVhZFByb3BFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0UmVhZEtleUV4cHIoYXN0OiBSZWFkS2V5RXhwciwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdExpdGVyYWxBcnJheUV4cHIoYXN0OiBMaXRlcmFsQXJyYXlFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0TGl0ZXJhbE1hcEV4cHIoYXN0OiBMaXRlcmFsTWFwRXhwciwgY29udGV4dDogYW55KTogYW55O1xufVxuXG5leHBvcnQgdmFyIFRISVNfRVhQUiA9IG5ldyBSZWFkVmFyRXhwcihCdWlsdGluVmFyLlRoaXMpO1xuZXhwb3J0IHZhciBTVVBFUl9FWFBSID0gbmV3IFJlYWRWYXJFeHByKEJ1aWx0aW5WYXIuU3VwZXIpO1xuZXhwb3J0IHZhciBDQVRDSF9FUlJPUl9WQVIgPSBuZXcgUmVhZFZhckV4cHIoQnVpbHRpblZhci5DYXRjaEVycm9yKTtcbmV4cG9ydCB2YXIgQ0FUQ0hfU1RBQ0tfVkFSID0gbmV3IFJlYWRWYXJFeHByKEJ1aWx0aW5WYXIuQ2F0Y2hTdGFjayk7XG5leHBvcnQgdmFyIE1FVEFEQVRBX01BUCA9IG5ldyBSZWFkVmFyRXhwcihCdWlsdGluVmFyLk1ldGFkYXRhTWFwKTtcbmV4cG9ydCB2YXIgTlVMTF9FWFBSID0gbmV3IExpdGVyYWxFeHByKG51bGwsIG51bGwpO1xuXG4vLy8vIFN0YXRlbWVudHNcbmV4cG9ydCBlbnVtIFN0bXRNb2RpZmllciB7XG4gIEZpbmFsLFxuICBQcml2YXRlXG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTdGF0ZW1lbnQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbW9kaWZpZXJzOiBTdG10TW9kaWZpZXJbXSA9IG51bGwpIHtcbiAgICBpZiAoaXNCbGFuayhtb2RpZmllcnMpKSB7XG4gICAgICB0aGlzLm1vZGlmaWVycyA9IFtdO1xuICAgIH1cbiAgfVxuXG4gIGFic3RyYWN0IHZpc2l0U3RhdGVtZW50KHZpc2l0b3I6IFN0YXRlbWVudFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueTtcblxuICBoYXNNb2RpZmllcihtb2RpZmllcjogU3RtdE1vZGlmaWVyKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLm1vZGlmaWVycy5pbmRleE9mKG1vZGlmaWVyKSAhPT0gLTE7IH1cbn1cblxuXG5leHBvcnQgY2xhc3MgRGVjbGFyZVZhclN0bXQgZXh0ZW5kcyBTdGF0ZW1lbnQge1xuICBwdWJsaWMgdHlwZTogVHlwZTtcbiAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIHZhbHVlOiBFeHByZXNzaW9uLCB0eXBlOiBUeXBlID0gbnVsbCxcbiAgICAgICAgICAgICAgbW9kaWZpZXJzOiBTdG10TW9kaWZpZXJbXSA9IG51bGwpIHtcbiAgICBzdXBlcihtb2RpZmllcnMpO1xuICAgIHRoaXMudHlwZSA9IGlzUHJlc2VudCh0eXBlKSA/IHR5cGUgOiB2YWx1ZS50eXBlO1xuICB9XG5cbiAgdmlzaXRTdGF0ZW1lbnQodmlzaXRvcjogU3RhdGVtZW50VmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdERlY2xhcmVWYXJTdG10KHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWNsYXJlRnVuY3Rpb25TdG10IGV4dGVuZHMgU3RhdGVtZW50IHtcbiAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIHBhcmFtczogRm5QYXJhbVtdLCBwdWJsaWMgc3RhdGVtZW50czogU3RhdGVtZW50W10sXG4gICAgICAgICAgICAgIHB1YmxpYyB0eXBlOiBUeXBlID0gbnVsbCwgbW9kaWZpZXJzOiBTdG10TW9kaWZpZXJbXSA9IG51bGwpIHtcbiAgICBzdXBlcihtb2RpZmllcnMpO1xuICB9XG5cbiAgdmlzaXRTdGF0ZW1lbnQodmlzaXRvcjogU3RhdGVtZW50VmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdERlY2xhcmVGdW5jdGlvblN0bXQodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEV4cHJlc3Npb25TdGF0ZW1lbnQgZXh0ZW5kcyBTdGF0ZW1lbnQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZXhwcjogRXhwcmVzc2lvbikgeyBzdXBlcigpOyB9XG5cbiAgdmlzaXRTdGF0ZW1lbnQodmlzaXRvcjogU3RhdGVtZW50VmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEV4cHJlc3Npb25TdG10KHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIFJldHVyblN0YXRlbWVudCBleHRlbmRzIFN0YXRlbWVudCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2YWx1ZTogRXhwcmVzc2lvbikgeyBzdXBlcigpOyB9XG4gIHZpc2l0U3RhdGVtZW50KHZpc2l0b3I6IFN0YXRlbWVudFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRSZXR1cm5TdG10KHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBYnN0cmFjdENsYXNzUGFydCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0eXBlOiBUeXBlID0gbnVsbCwgcHVibGljIG1vZGlmaWVyczogU3RtdE1vZGlmaWVyW10pIHtcbiAgICBpZiAoaXNCbGFuayhtb2RpZmllcnMpKSB7XG4gICAgICB0aGlzLm1vZGlmaWVycyA9IFtdO1xuICAgIH1cbiAgfVxuICBoYXNNb2RpZmllcihtb2RpZmllcjogU3RtdE1vZGlmaWVyKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLm1vZGlmaWVycy5pbmRleE9mKG1vZGlmaWVyKSAhPT0gLTE7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENsYXNzRmllbGQgZXh0ZW5kcyBBYnN0cmFjdENsYXNzUGFydCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcsIHR5cGU6IFR5cGUgPSBudWxsLCBtb2RpZmllcnM6IFN0bXRNb2RpZmllcltdID0gbnVsbCkge1xuICAgIHN1cGVyKHR5cGUsIG1vZGlmaWVycyk7XG4gIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgQ2xhc3NNZXRob2QgZXh0ZW5kcyBBYnN0cmFjdENsYXNzUGFydCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBwYXJhbXM6IEZuUGFyYW1bXSwgcHVibGljIGJvZHk6IFN0YXRlbWVudFtdLFxuICAgICAgICAgICAgICB0eXBlOiBUeXBlID0gbnVsbCwgbW9kaWZpZXJzOiBTdG10TW9kaWZpZXJbXSA9IG51bGwpIHtcbiAgICBzdXBlcih0eXBlLCBtb2RpZmllcnMpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIENsYXNzR2V0dGVyIGV4dGVuZHMgQWJzdHJhY3RDbGFzc1BhcnQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgYm9keTogU3RhdGVtZW50W10sIHR5cGU6IFR5cGUgPSBudWxsLFxuICAgICAgICAgICAgICBtb2RpZmllcnM6IFN0bXRNb2RpZmllcltdID0gbnVsbCkge1xuICAgIHN1cGVyKHR5cGUsIG1vZGlmaWVycyk7XG4gIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgQ2xhc3NTdG10IGV4dGVuZHMgU3RhdGVtZW50IHtcbiAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIHBhcmVudDogRXhwcmVzc2lvbiwgcHVibGljIGZpZWxkczogQ2xhc3NGaWVsZFtdLFxuICAgICAgICAgICAgICBwdWJsaWMgZ2V0dGVyczogQ2xhc3NHZXR0ZXJbXSwgcHVibGljIGNvbnN0cnVjdG9yTWV0aG9kOiBDbGFzc01ldGhvZCxcbiAgICAgICAgICAgICAgcHVibGljIG1ldGhvZHM6IENsYXNzTWV0aG9kW10sIG1vZGlmaWVyczogU3RtdE1vZGlmaWVyW10gPSBudWxsKSB7XG4gICAgc3VwZXIobW9kaWZpZXJzKTtcbiAgfVxuICB2aXNpdFN0YXRlbWVudCh2aXNpdG9yOiBTdGF0ZW1lbnRWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RGVjbGFyZUNsYXNzU3RtdCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBJZlN0bXQgZXh0ZW5kcyBTdGF0ZW1lbnQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgY29uZGl0aW9uOiBFeHByZXNzaW9uLCBwdWJsaWMgdHJ1ZUNhc2U6IFN0YXRlbWVudFtdLFxuICAgICAgICAgICAgICBwdWJsaWMgZmFsc2VDYXNlOiBTdGF0ZW1lbnRbXSA9IENPTlNUX0VYUFIoW10pKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuICB2aXNpdFN0YXRlbWVudCh2aXNpdG9yOiBTdGF0ZW1lbnRWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0SWZTdG10KHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIENvbW1lbnRTdG10IGV4dGVuZHMgU3RhdGVtZW50IHtcbiAgY29uc3RydWN0b3IocHVibGljIGNvbW1lbnQ6IHN0cmluZykgeyBzdXBlcigpOyB9XG4gIHZpc2l0U3RhdGVtZW50KHZpc2l0b3I6IFN0YXRlbWVudFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRDb21tZW50U3RtdCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBUcnlDYXRjaFN0bXQgZXh0ZW5kcyBTdGF0ZW1lbnQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgYm9keVN0bXRzOiBTdGF0ZW1lbnRbXSwgcHVibGljIGNhdGNoU3RtdHM6IFN0YXRlbWVudFtdKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXRTdGF0ZW1lbnQodmlzaXRvcjogU3RhdGVtZW50VmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFRyeUNhdGNoU3RtdCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBUaHJvd1N0bXQgZXh0ZW5kcyBTdGF0ZW1lbnQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZXJyb3I6IEV4cHJlc3Npb24pIHsgc3VwZXIoKTsgfVxuICB2aXNpdFN0YXRlbWVudCh2aXNpdG9yOiBTdGF0ZW1lbnRWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0VGhyb3dTdG10KHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RhdGVtZW50VmlzaXRvciB7XG4gIHZpc2l0RGVjbGFyZVZhclN0bXQoc3RtdDogRGVjbGFyZVZhclN0bXQsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXREZWNsYXJlRnVuY3Rpb25TdG10KHN0bXQ6IERlY2xhcmVGdW5jdGlvblN0bXQsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRFeHByZXNzaW9uU3RtdChzdG10OiBFeHByZXNzaW9uU3RhdGVtZW50LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0UmV0dXJuU3RtdChzdG10OiBSZXR1cm5TdGF0ZW1lbnQsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXREZWNsYXJlQ2xhc3NTdG10KHN0bXQ6IENsYXNzU3RtdCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdElmU3RtdChzdG10OiBJZlN0bXQsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRUcnlDYXRjaFN0bXQoc3RtdDogVHJ5Q2F0Y2hTdG10LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0VGhyb3dTdG10KHN0bXQ6IFRocm93U3RtdCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdENvbW1lbnRTdG10KHN0bXQ6IENvbW1lbnRTdG10LCBjb250ZXh0OiBhbnkpOiBhbnk7XG59XG5cbmV4cG9ydCBjbGFzcyBFeHByZXNzaW9uVHJhbnNmb3JtZXIgaW1wbGVtZW50cyBTdGF0ZW1lbnRWaXNpdG9yLCBFeHByZXNzaW9uVmlzaXRvciB7XG4gIHZpc2l0UmVhZFZhckV4cHIoYXN0OiBSZWFkVmFyRXhwciwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIGFzdDsgfVxuICB2aXNpdFdyaXRlVmFyRXhwcihleHByOiBXcml0ZVZhckV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIG5ldyBXcml0ZVZhckV4cHIoZXhwci5uYW1lLCBleHByLnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSk7XG4gIH1cbiAgdmlzaXRXcml0ZUtleUV4cHIoZXhwcjogV3JpdGVLZXlFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBuZXcgV3JpdGVLZXlFeHByKGV4cHIucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cHIuaW5kZXgudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cHIudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpKTtcbiAgfVxuICB2aXNpdFdyaXRlUHJvcEV4cHIoZXhwcjogV3JpdGVQcm9wRXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gbmV3IFdyaXRlUHJvcEV4cHIoZXhwci5yZWNlaXZlci52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCksIGV4cHIubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwci52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCkpO1xuICB9XG4gIHZpc2l0SW52b2tlTWV0aG9kRXhwcihhc3Q6IEludm9rZU1ldGhvZEV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdmFyIG1ldGhvZCA9IGlzUHJlc2VudChhc3QuYnVpbHRpbikgPyBhc3QuYnVpbHRpbiA6IGFzdC5uYW1lO1xuICAgIHJldHVybiBuZXcgSW52b2tlTWV0aG9kRXhwcihhc3QucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpLCBtZXRob2QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmlzaXRBbGxFeHByZXNzaW9ucyhhc3QuYXJncywgY29udGV4dCksIGFzdC50eXBlKTtcbiAgfVxuICB2aXNpdEludm9rZUZ1bmN0aW9uRXhwcihhc3Q6IEludm9rZUZ1bmN0aW9uRXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gbmV3IEludm9rZUZ1bmN0aW9uRXhwcihhc3QuZm4udmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmlzaXRBbGxFeHByZXNzaW9ucyhhc3QuYXJncywgY29udGV4dCksIGFzdC50eXBlKTtcbiAgfVxuICB2aXNpdEluc3RhbnRpYXRlRXhwcihhc3Q6IEluc3RhbnRpYXRlRXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gbmV3IEluc3RhbnRpYXRlRXhwcihhc3QuY2xhc3NFeHByLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZpc2l0QWxsRXhwcmVzc2lvbnMoYXN0LmFyZ3MsIGNvbnRleHQpLCBhc3QudHlwZSk7XG4gIH1cbiAgdmlzaXRMaXRlcmFsRXhwcihhc3Q6IExpdGVyYWxFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gYXN0OyB9XG4gIHZpc2l0RXh0ZXJuYWxFeHByKGFzdDogRXh0ZXJuYWxFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gYXN0OyB9XG4gIHZpc2l0Q29uZGl0aW9uYWxFeHByKGFzdDogQ29uZGl0aW9uYWxFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBuZXcgQ29uZGl0aW9uYWxFeHByKGFzdC5jb25kaXRpb24udmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzdC50cnVlQ2FzZS52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN0LmZhbHNlQ2FzZS52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCkpO1xuICB9XG4gIHZpc2l0Tm90RXhwcihhc3Q6IE5vdEV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIG5ldyBOb3RFeHByKGFzdC5jb25kaXRpb24udmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpKTtcbiAgfVxuICB2aXNpdENhc3RFeHByKGFzdDogQ2FzdEV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIG5ldyBDYXN0RXhwcihhc3QudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpLCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdEZ1bmN0aW9uRXhwcihhc3Q6IEZ1bmN0aW9uRXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICAvLyBEb24ndCBkZXNjZW5kIGludG8gbmVzdGVkIGZ1bmN0aW9uc1xuICAgIHJldHVybiBhc3Q7XG4gIH1cbiAgdmlzaXRCaW5hcnlPcGVyYXRvckV4cHIoYXN0OiBCaW5hcnlPcGVyYXRvckV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoYXN0Lm9wZXJhdG9yLCBhc3QubGhzLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3QucmhzLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSwgYXN0LnR5cGUpO1xuICB9XG4gIHZpc2l0UmVhZFByb3BFeHByKGFzdDogUmVhZFByb3BFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBuZXcgUmVhZFByb3BFeHByKGFzdC5yZWNlaXZlci52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCksIGFzdC5uYW1lLCBhc3QudHlwZSk7XG4gIH1cbiAgdmlzaXRSZWFkS2V5RXhwcihhc3Q6IFJlYWRLZXlFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBuZXcgUmVhZEtleUV4cHIoYXN0LnJlY2VpdmVyLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzdC5pbmRleC52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCksIGFzdC50eXBlKTtcbiAgfVxuICB2aXNpdExpdGVyYWxBcnJheUV4cHIoYXN0OiBMaXRlcmFsQXJyYXlFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBuZXcgTGl0ZXJhbEFycmF5RXhwcih0aGlzLnZpc2l0QWxsRXhwcmVzc2lvbnMoYXN0LmVudHJpZXMsIGNvbnRleHQpKTtcbiAgfVxuICB2aXNpdExpdGVyYWxNYXBFeHByKGFzdDogTGl0ZXJhbE1hcEV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIG5ldyBMaXRlcmFsTWFwRXhwcihhc3QuZW50cmllcy5tYXAoXG4gICAgICAgIChlbnRyeSkgPT4gW2VudHJ5WzBdLCAoPEV4cHJlc3Npb24+ZW50cnlbMV0pLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KV0pKTtcbiAgfVxuICB2aXNpdEFsbEV4cHJlc3Npb25zKGV4cHJzOiBFeHByZXNzaW9uW10sIGNvbnRleHQ6IGFueSk6IEV4cHJlc3Npb25bXSB7XG4gICAgcmV0dXJuIGV4cHJzLm1hcChleHByID0+IGV4cHIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpKTtcbiAgfVxuXG4gIHZpc2l0RGVjbGFyZVZhclN0bXQoc3RtdDogRGVjbGFyZVZhclN0bXQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIG5ldyBEZWNsYXJlVmFyU3RtdChzdG10Lm5hbWUsIHN0bXQudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpLCBzdG10LnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdG10Lm1vZGlmaWVycyk7XG4gIH1cbiAgdmlzaXREZWNsYXJlRnVuY3Rpb25TdG10KHN0bXQ6IERlY2xhcmVGdW5jdGlvblN0bXQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgLy8gRG9uJ3QgZGVzY2VuZCBpbnRvIG5lc3RlZCBmdW5jdGlvbnNcbiAgICByZXR1cm4gc3RtdDtcbiAgfVxuICB2aXNpdEV4cHJlc3Npb25TdG10KHN0bXQ6IEV4cHJlc3Npb25TdGF0ZW1lbnQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIG5ldyBFeHByZXNzaW9uU3RhdGVtZW50KHN0bXQuZXhwci52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCkpO1xuICB9XG4gIHZpc2l0UmV0dXJuU3RtdChzdG10OiBSZXR1cm5TdGF0ZW1lbnQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIG5ldyBSZXR1cm5TdGF0ZW1lbnQoc3RtdC52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCkpO1xuICB9XG4gIHZpc2l0RGVjbGFyZUNsYXNzU3RtdChzdG10OiBDbGFzc1N0bXQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgLy8gRG9uJ3QgZGVzY2VuZCBpbnRvIG5lc3RlZCBmdW5jdGlvbnNcbiAgICByZXR1cm4gc3RtdDtcbiAgfVxuICB2aXNpdElmU3RtdChzdG10OiBJZlN0bXQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIG5ldyBJZlN0bXQoc3RtdC5jb25kaXRpb24udmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpLFxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmlzaXRBbGxTdGF0ZW1lbnRzKHN0bXQudHJ1ZUNhc2UsIGNvbnRleHQpLFxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmlzaXRBbGxTdGF0ZW1lbnRzKHN0bXQuZmFsc2VDYXNlLCBjb250ZXh0KSk7XG4gIH1cbiAgdmlzaXRUcnlDYXRjaFN0bXQoc3RtdDogVHJ5Q2F0Y2hTdG10LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBuZXcgVHJ5Q2F0Y2hTdG10KHRoaXMudmlzaXRBbGxTdGF0ZW1lbnRzKHN0bXQuYm9keVN0bXRzLCBjb250ZXh0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZpc2l0QWxsU3RhdGVtZW50cyhzdG10LmNhdGNoU3RtdHMsIGNvbnRleHQpKTtcbiAgfVxuICB2aXNpdFRocm93U3RtdChzdG10OiBUaHJvd1N0bXQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIG5ldyBUaHJvd1N0bXQoc3RtdC5lcnJvci52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCkpO1xuICB9XG4gIHZpc2l0Q29tbWVudFN0bXQoc3RtdDogQ29tbWVudFN0bXQsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBzdG10OyB9XG4gIHZpc2l0QWxsU3RhdGVtZW50cyhzdG10czogU3RhdGVtZW50W10sIGNvbnRleHQ6IGFueSk6IFN0YXRlbWVudFtdIHtcbiAgICByZXR1cm4gc3RtdHMubWFwKHN0bXQgPT4gc3RtdC52aXNpdFN0YXRlbWVudCh0aGlzLCBjb250ZXh0KSk7XG4gIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgUmVjdXJzaXZlRXhwcmVzc2lvblZpc2l0b3IgaW1wbGVtZW50cyBTdGF0ZW1lbnRWaXNpdG9yLCBFeHByZXNzaW9uVmlzaXRvciB7XG4gIHZpc2l0UmVhZFZhckV4cHIoYXN0OiBSZWFkVmFyRXhwciwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIGFzdDsgfVxuICB2aXNpdFdyaXRlVmFyRXhwcihleHByOiBXcml0ZVZhckV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgZXhwci52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCk7XG4gICAgcmV0dXJuIGV4cHI7XG4gIH1cbiAgdmlzaXRXcml0ZUtleUV4cHIoZXhwcjogV3JpdGVLZXlFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGV4cHIucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICAgIGV4cHIuaW5kZXgudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICAgIGV4cHIudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICAgIHJldHVybiBleHByO1xuICB9XG4gIHZpc2l0V3JpdGVQcm9wRXhwcihleHByOiBXcml0ZVByb3BFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGV4cHIucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICAgIGV4cHIudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICAgIHJldHVybiBleHByO1xuICB9XG4gIHZpc2l0SW52b2tlTWV0aG9kRXhwcihhc3Q6IEludm9rZU1ldGhvZEV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgYXN0LnJlY2VpdmVyLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICB0aGlzLnZpc2l0QWxsRXhwcmVzc2lvbnMoYXN0LmFyZ3MsIGNvbnRleHQpO1xuICAgIHJldHVybiBhc3Q7XG4gIH1cbiAgdmlzaXRJbnZva2VGdW5jdGlvbkV4cHIoYXN0OiBJbnZva2VGdW5jdGlvbkV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgYXN0LmZuLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICB0aGlzLnZpc2l0QWxsRXhwcmVzc2lvbnMoYXN0LmFyZ3MsIGNvbnRleHQpO1xuICAgIHJldHVybiBhc3Q7XG4gIH1cbiAgdmlzaXRJbnN0YW50aWF0ZUV4cHIoYXN0OiBJbnN0YW50aWF0ZUV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgYXN0LmNsYXNzRXhwci52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCk7XG4gICAgdGhpcy52aXNpdEFsbEV4cHJlc3Npb25zKGFzdC5hcmdzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gYXN0O1xuICB9XG4gIHZpc2l0TGl0ZXJhbEV4cHIoYXN0OiBMaXRlcmFsRXhwciwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIGFzdDsgfVxuICB2aXNpdEV4dGVybmFsRXhwcihhc3Q6IEV4dGVybmFsRXhwciwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIGFzdDsgfVxuICB2aXNpdENvbmRpdGlvbmFsRXhwcihhc3Q6IENvbmRpdGlvbmFsRXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBhc3QuY29uZGl0aW9uLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICBhc3QudHJ1ZUNhc2UudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICAgIGFzdC5mYWxzZUNhc2UudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICAgIHJldHVybiBhc3Q7XG4gIH1cbiAgdmlzaXROb3RFeHByKGFzdDogTm90RXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBhc3QuY29uZGl0aW9uLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gYXN0O1xuICB9XG4gIHZpc2l0Q2FzdEV4cHIoYXN0OiBDYXN0RXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBhc3QudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICAgIHJldHVybiBhc3Q7XG4gIH1cbiAgdmlzaXRGdW5jdGlvbkV4cHIoYXN0OiBGdW5jdGlvbkV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBhc3Q7IH1cbiAgdmlzaXRCaW5hcnlPcGVyYXRvckV4cHIoYXN0OiBCaW5hcnlPcGVyYXRvckV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgYXN0Lmxocy52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCk7XG4gICAgYXN0LnJocy52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCk7XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuICB2aXNpdFJlYWRQcm9wRXhwcihhc3Q6IFJlYWRQcm9wRXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBhc3QucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICAgIHJldHVybiBhc3Q7XG4gIH1cbiAgdmlzaXRSZWFkS2V5RXhwcihhc3Q6IFJlYWRLZXlFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGFzdC5yZWNlaXZlci52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCk7XG4gICAgYXN0LmluZGV4LnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gYXN0O1xuICB9XG4gIHZpc2l0TGl0ZXJhbEFycmF5RXhwcihhc3Q6IExpdGVyYWxBcnJheUV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy52aXNpdEFsbEV4cHJlc3Npb25zKGFzdC5lbnRyaWVzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gYXN0O1xuICB9XG4gIHZpc2l0TGl0ZXJhbE1hcEV4cHIoYXN0OiBMaXRlcmFsTWFwRXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBhc3QuZW50cmllcy5mb3JFYWNoKChlbnRyeSkgPT4gKDxFeHByZXNzaW9uPmVudHJ5WzFdKS52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCkpO1xuICAgIHJldHVybiBhc3Q7XG4gIH1cbiAgdmlzaXRBbGxFeHByZXNzaW9ucyhleHByczogRXhwcmVzc2lvbltdLCBjb250ZXh0OiBhbnkpOiB2b2lkIHtcbiAgICBleHBycy5mb3JFYWNoKGV4cHIgPT4gZXhwci52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCkpO1xuICB9XG5cbiAgdmlzaXREZWNsYXJlVmFyU3RtdChzdG10OiBEZWNsYXJlVmFyU3RtdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBzdG10LnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gc3RtdDtcbiAgfVxuICB2aXNpdERlY2xhcmVGdW5jdGlvblN0bXQoc3RtdDogRGVjbGFyZUZ1bmN0aW9uU3RtdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICAvLyBEb24ndCBkZXNjZW5kIGludG8gbmVzdGVkIGZ1bmN0aW9uc1xuICAgIHJldHVybiBzdG10O1xuICB9XG4gIHZpc2l0RXhwcmVzc2lvblN0bXQoc3RtdDogRXhwcmVzc2lvblN0YXRlbWVudCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBzdG10LmV4cHIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICAgIHJldHVybiBzdG10O1xuICB9XG4gIHZpc2l0UmV0dXJuU3RtdChzdG10OiBSZXR1cm5TdGF0ZW1lbnQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgc3RtdC52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCk7XG4gICAgcmV0dXJuIHN0bXQ7XG4gIH1cbiAgdmlzaXREZWNsYXJlQ2xhc3NTdG10KHN0bXQ6IENsYXNzU3RtdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICAvLyBEb24ndCBkZXNjZW5kIGludG8gbmVzdGVkIGZ1bmN0aW9uc1xuICAgIHJldHVybiBzdG10O1xuICB9XG4gIHZpc2l0SWZTdG10KHN0bXQ6IElmU3RtdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBzdG10LmNvbmRpdGlvbi52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCk7XG4gICAgdGhpcy52aXNpdEFsbFN0YXRlbWVudHMoc3RtdC50cnVlQ2FzZSwgY29udGV4dCk7XG4gICAgdGhpcy52aXNpdEFsbFN0YXRlbWVudHMoc3RtdC5mYWxzZUNhc2UsIGNvbnRleHQpO1xuICAgIHJldHVybiBzdG10O1xuICB9XG4gIHZpc2l0VHJ5Q2F0Y2hTdG10KHN0bXQ6IFRyeUNhdGNoU3RtdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLnZpc2l0QWxsU3RhdGVtZW50cyhzdG10LmJvZHlTdG10cywgY29udGV4dCk7XG4gICAgdGhpcy52aXNpdEFsbFN0YXRlbWVudHMoc3RtdC5jYXRjaFN0bXRzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gc3RtdDtcbiAgfVxuICB2aXNpdFRocm93U3RtdChzdG10OiBUaHJvd1N0bXQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgc3RtdC5lcnJvci52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCk7XG4gICAgcmV0dXJuIHN0bXQ7XG4gIH1cbiAgdmlzaXRDb21tZW50U3RtdChzdG10OiBDb21tZW50U3RtdCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIHN0bXQ7IH1cbiAgdmlzaXRBbGxTdGF0ZW1lbnRzKHN0bXRzOiBTdGF0ZW1lbnRbXSwgY29udGV4dDogYW55KTogdm9pZCB7XG4gICAgc3RtdHMuZm9yRWFjaChzdG10ID0+IHN0bXQudmlzaXRTdGF0ZW1lbnQodGhpcywgY29udGV4dCkpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXBsYWNlVmFySW5FeHByZXNzaW9uKHZhck5hbWU6IHN0cmluZywgbmV3VmFsdWU6IEV4cHJlc3Npb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uOiBFeHByZXNzaW9uKTogRXhwcmVzc2lvbiB7XG4gIHZhciB0cmFuc2Zvcm1lciA9IG5ldyBfUmVwbGFjZVZhcmlhYmxlVHJhbnNmb3JtZXIodmFyTmFtZSwgbmV3VmFsdWUpO1xuICByZXR1cm4gZXhwcmVzc2lvbi52aXNpdEV4cHJlc3Npb24odHJhbnNmb3JtZXIsIG51bGwpO1xufVxuXG5jbGFzcyBfUmVwbGFjZVZhcmlhYmxlVHJhbnNmb3JtZXIgZXh0ZW5kcyBFeHByZXNzaW9uVHJhbnNmb3JtZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF92YXJOYW1lOiBzdHJpbmcsIHByaXZhdGUgX25ld1ZhbHVlOiBFeHByZXNzaW9uKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXRSZWFkVmFyRXhwcihhc3Q6IFJlYWRWYXJFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBhc3QubmFtZSA9PSB0aGlzLl92YXJOYW1lID8gdGhpcy5fbmV3VmFsdWUgOiBhc3Q7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRSZWFkVmFyTmFtZXMoc3RtdHM6IFN0YXRlbWVudFtdKTogU2V0PHN0cmluZz4ge1xuICB2YXIgZmluZGVyID0gbmV3IF9WYXJpYWJsZUZpbmRlcigpO1xuICBmaW5kZXIudmlzaXRBbGxTdGF0ZW1lbnRzKHN0bXRzLCBudWxsKTtcbiAgcmV0dXJuIGZpbmRlci52YXJOYW1lcztcbn1cblxuY2xhc3MgX1ZhcmlhYmxlRmluZGVyIGV4dGVuZHMgUmVjdXJzaXZlRXhwcmVzc2lvblZpc2l0b3Ige1xuICB2YXJOYW1lcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICB2aXNpdFJlYWRWYXJFeHByKGFzdDogUmVhZFZhckV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy52YXJOYW1lcy5hZGQoYXN0Lm5hbWUpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YXJpYWJsZShuYW1lOiBzdHJpbmcsIHR5cGU6IFR5cGUgPSBudWxsKTogUmVhZFZhckV4cHIge1xuICByZXR1cm4gbmV3IFJlYWRWYXJFeHByKG5hbWUsIHR5cGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW1wb3J0RXhwcihpZDogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSwgdHlwZVBhcmFtczogVHlwZVtdID0gbnVsbCk6IEV4dGVybmFsRXhwciB7XG4gIHJldHVybiBuZXcgRXh0ZXJuYWxFeHByKGlkLCBudWxsLCB0eXBlUGFyYW1zKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGltcG9ydFR5cGUoaWQ6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEsIHR5cGVQYXJhbXM6IFR5cGVbXSA9IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlTW9kaWZpZXJzOiBUeXBlTW9kaWZpZXJbXSA9IG51bGwpOiBFeHRlcm5hbFR5cGUge1xuICByZXR1cm4gaXNQcmVzZW50KGlkKSA/IG5ldyBFeHRlcm5hbFR5cGUoaWQsIHR5cGVQYXJhbXMsIHR5cGVNb2RpZmllcnMpIDogbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpdGVyYWwodmFsdWU6IGFueSwgdHlwZTogVHlwZSA9IG51bGwpOiBMaXRlcmFsRXhwciB7XG4gIHJldHVybiBuZXcgTGl0ZXJhbEV4cHIodmFsdWUsIHR5cGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGl0ZXJhbEFycih2YWx1ZXM6IEV4cHJlc3Npb25bXSwgdHlwZTogVHlwZSA9IG51bGwpOiBMaXRlcmFsQXJyYXlFeHByIHtcbiAgcmV0dXJuIG5ldyBMaXRlcmFsQXJyYXlFeHByKHZhbHVlcywgdHlwZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaXRlcmFsTWFwKHZhbHVlczogQXJyYXk8QXJyYXk8c3RyaW5nIHwgRXhwcmVzc2lvbj4+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogTWFwVHlwZSA9IG51bGwpOiBMaXRlcmFsTWFwRXhwciB7XG4gIHJldHVybiBuZXcgTGl0ZXJhbE1hcEV4cHIodmFsdWVzLCB0eXBlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vdChleHByOiBFeHByZXNzaW9uKTogTm90RXhwciB7XG4gIHJldHVybiBuZXcgTm90RXhwcihleHByKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZuKHBhcmFtczogRm5QYXJhbVtdLCBib2R5OiBTdGF0ZW1lbnRbXSwgdHlwZTogVHlwZSA9IG51bGwpOiBGdW5jdGlvbkV4cHIge1xuICByZXR1cm4gbmV3IEZ1bmN0aW9uRXhwcihwYXJhbXMsIGJvZHksIHR5cGUpO1xufVxuIl19