library angular2.src.compiler.view_compiler.compile_pipe;

import "package:angular2/src/facade/lang.dart" show isBlank, isPresent;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "../output/output_ast.dart" as o;
import "compile_view.dart" show CompileView;
import "../compile_metadata.dart" show CompilePipeMetadata;
import "../identifiers.dart" show Identifiers, identifierToken;
import "util.dart"
    show injectFromViewParentInjector, createPureProxy, getPropertyInView;

class _PurePipeProxy {
  o.ReadPropExpr instance;
  num argCount;
  _PurePipeProxy(this.instance, this.argCount) {}
}

class CompilePipe {
  CompileView view;
  CompilePipeMetadata meta;
  o.ReadPropExpr instance;
  List<_PurePipeProxy> _purePipeProxies = [];
  CompilePipe(this.view, String name) {
    this.meta = _findPipeMeta(view, name);
    this.instance =
        o.THIS_EXPR.prop('''_pipe_${ name}_${ view . pipeCount ++}''');
  }
  bool get pure {
    return this.meta.pure;
  }

  void create() {
    var deps = this.meta.type.diDeps.map((diDep) {
      if (diDep.token
          .equalsTo(identifierToken(Identifiers.ChangeDetectorRef))) {
        return getPropertyInView(
            o.THIS_EXPR.prop("ref"), this.view, this.view.componentView);
      }
      return injectFromViewParentInjector(diDep.token, false);
    }).toList();
    this.view.fields.add(new o.ClassField(this.instance.name,
        o.importType(this.meta.type), [o.StmtModifier.Private]));
    this.view.createMethod.resetDebugInfo(null, null);
    this.view.createMethod.addStmt(o.THIS_EXPR
        .prop(this.instance.name)
        .set(o.importExpr(this.meta.type).instantiate(deps))
        .toStmt());
    this._purePipeProxies.forEach((purePipeProxy) {
      createPureProxy(
          this
              .instance
              .prop("transform")
              .callMethod(o.BuiltinMethod.bind, [this.instance]),
          purePipeProxy.argCount,
          purePipeProxy.instance,
          this.view);
    });
  }

  o.Expression call(CompileView callingView, List<o.Expression> args) {
    if (this.meta.pure) {
      var purePipeProxy = new _PurePipeProxy(
          o.THIS_EXPR.prop(
              '''${ this . instance . name}_${ this . _purePipeProxies . length}'''),
          args.length);
      this._purePipeProxies.add(purePipeProxy);
      return getPropertyInView(
              o.importExpr(Identifiers.castByValue).callFn(
                  [purePipeProxy.instance, this.instance.prop("transform")]),
              callingView,
              this.view)
          .callFn(args);
    } else {
      return getPropertyInView(this.instance, callingView, this.view)
          .callMethod("transform", args);
    }
  }
}

CompilePipeMetadata _findPipeMeta(CompileView view, String name) {
  CompilePipeMetadata pipeMeta = null;
  for (var i = view.pipeMetas.length - 1; i >= 0; i--) {
    var localPipeMeta = view.pipeMetas[i];
    if (localPipeMeta.name == name) {
      pipeMeta = localPipeMeta;
      break;
    }
  }
  if (isBlank(pipeMeta)) {
    throw new BaseException(
        '''Illegal state: Could not find pipe ${ name} although the parser should have detected this error!''');
  }
  return pipeMeta;
}
