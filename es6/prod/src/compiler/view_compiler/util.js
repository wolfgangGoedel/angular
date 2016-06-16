import { isPresent } from 'angular2/src/facade/lang';
import * as o from '../output/output_ast';
import { CompileIdentifierMetadata } from '../compile_metadata';
export function getPropertyInView(property, viewPath) {
    if (viewPath.length === 0) {
        return property;
    }
    else {
        var viewProp = o.THIS_EXPR;
        for (var i = 0; i < viewPath.length; i++) {
            viewProp = viewProp.prop('declarationAppElement').prop('parentView');
        }
        if (property instanceof o.ReadPropExpr) {
            var lastView = viewPath[viewPath.length - 1];
            let readPropExpr = property;
            // Note: Don't cast for members of the AppView base class...
            if (lastView.fields.some((field) => field.name == readPropExpr.name) ||
                lastView.getters.some((field) => field.name == readPropExpr.name)) {
                viewProp = viewProp.cast(lastView.classType);
            }
        }
        return o.replaceVarInExpression(o.THIS_EXPR.name, viewProp, property);
    }
}
export function injectFromViewParentInjector(token, optional) {
    var args = [createDiTokenExpression(token)];
    if (optional) {
        args.push(o.NULL_EXPR);
    }
    return o.THIS_EXPR.prop('parentInjector').callMethod('get', args);
}
export function getViewFactoryName(component, embeddedTemplateIndex) {
    return `viewFactory_${component.type.name}${embeddedTemplateIndex}`;
}
export function createDiTokenExpression(token) {
    if (isPresent(token.value)) {
        return o.literal(token.value);
    }
    else if (token.identifierIsInstance) {
        return o.importExpr(token.identifier)
            .instantiate([], o.importType(token.identifier, [], [o.TypeModifier.Const]));
    }
    else {
        return o.importExpr(token.identifier);
    }
}
export function createFlatArray(expressions) {
    var lastNonArrayExpressions = [];
    var result = o.literalArr([]);
    for (var i = 0; i < expressions.length; i++) {
        var expr = expressions[i];
        if (expr.type instanceof o.ArrayType) {
            if (lastNonArrayExpressions.length > 0) {
                result =
                    result.callMethod(o.BuiltinMethod.ConcatArray, [o.literalArr(lastNonArrayExpressions)]);
                lastNonArrayExpressions = [];
            }
            result = result.callMethod(o.BuiltinMethod.ConcatArray, [expr]);
        }
        else {
            lastNonArrayExpressions.push(expr);
        }
    }
    if (lastNonArrayExpressions.length > 0) {
        result =
            result.callMethod(o.BuiltinMethod.ConcatArray, [o.literalArr(lastNonArrayExpressions)]);
    }
    return result;
}
export function convertValueToOutputAst(value) {
    if (value instanceof CompileIdentifierMetadata) {
        return o.importExpr(value);
    }
    else if (value instanceof o.Expression) {
        return value;
    }
    else {
        return o.literal(value);
    }
}
