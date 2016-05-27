import 'offline_compiler_compa.css.shim.dart' as import0;
import 'package:angular2/src/core/linker/debug_context.dart' as import1;
import 'package:angular2/src/core/render/api.dart' as import2;
import 'package:angular2/src/core/linker/view.dart' as import3;
import 'offline_compiler_util.dart' as import4;
import 'package:angular2/src/core/linker/view_manager.dart' as import5;
import 'package:angular2/src/core/di/injector.dart' as import6;
import 'package:angular2/src/core/linker/element.dart' as import7;
import 'package:angular2/src/core/linker/view_type.dart' as import8;
import 'package:angular2/src/core/change_detection/change_detection.dart'
    as import9;
import 'package:angular2/src/core/linker/view_utils.dart' as import10;
import 'package:angular2/src/core/metadata/view.dart' as import11;

const List<dynamic> styles_CompA = const [
  '.redStyle[_ngcontent-%COMP%] { color: red; }',
  import0.styles
];
const List<import1.StaticNodeDebugInfo> nodeDebugInfos_CompA0 = const [
  const import1.StaticNodeDebugInfo(const [], null, const <String, dynamic>{})
];
import2.RenderComponentType renderType_CompA = null;

class _View_CompA0 extends import3.DebugAppView<import4.CompA> {
  var _text_0;
  var _expr_0;
  _View_CompA0(import5.AppViewManager_ viewManager,
      import6.Injector parentInjector, import7.AppElement declarationEl)
      : super(
            _View_CompA0,
            renderType_CompA,
            import8.ViewType.COMPONENT,
            {},
            viewManager,
            parentInjector,
            declarationEl,
            import9.ChangeDetectionStrategy.CheckAlways,
            0,
            0,
            nodeDebugInfos_CompA0) {}
  void createInternal(String rootSelector) {
    final parentRenderNode =
        this.renderer.createViewRoot(this.declarationAppElement.nativeElement);
    this._text_0 =
        this.renderer.createText(parentRenderNode, '', this.debug(0, 0, 0));
    this._expr_0 = import9.uninitialized;
    this.init([], [this._text_0], {}, [], []);
  }

  void detectChangesInternal(bool throwOnChange) {
    this.detectContentChildrenChanges(throwOnChange);
    this.debug(0, 0, 0);
    final currVal_0 =
        import10.interpolate(1, 'Hello World ', this.context.user, '!');
    if (import10.checkBinding(throwOnChange, this._expr_0, currVal_0)) {
      this.renderer.setText(this._text_0, currVal_0);
      this._expr_0 = currVal_0;
    }
    this.detectViewChildrenChanges(throwOnChange);
  }
}

import3.AppView<import4.CompA> viewFactory_CompA0(
    import5.AppViewManager_ viewManager,
    import6.Injector parentInjector,
    import7.AppElement declarationEl) {
  if (identical(renderType_CompA, null)) {
    (renderType_CompA = viewManager.createRenderComponentType(
        'asset:angular2/test/compiler/offline_compiler_compa.html',
        0,
        import11.ViewEncapsulation.Emulated,
        styles_CompA));
  }
  return new _View_CompA0(viewManager, parentInjector, declarationEl);
}

const List<dynamic> styles_CompA_Host = const [];
const List<import1.StaticNodeDebugInfo> nodeDebugInfos_CompA_Host0 = const [
  const import1.StaticNodeDebugInfo(const [import4.CompA], import4.CompA,
      const <String, dynamic>{'\$hostViewEl': null})
];
import2.RenderComponentType renderType_CompA_Host = null;

class _View_CompA_Host0 extends import3.DebugAppView<dynamic> {
  var _el_0;
  import6.Injector _inj_0;
  import7.AppElement _appEl_0;
  import4.CompA _CompA_0_0;
  _View_CompA_Host0(import5.AppViewManager_ viewManager,
      import6.Injector parentInjector, import7.AppElement declarationEl)
      : super(
            _View_CompA_Host0,
            renderType_CompA_Host,
            import8.ViewType.HOST,
            {},
            viewManager,
            parentInjector,
            declarationEl,
            import9.ChangeDetectionStrategy.CheckAlways,
            0,
            0,
            nodeDebugInfos_CompA_Host0) {}
  void createInternal(String rootSelector) {
    this._el_0 = (identical(rootSelector, null)
        ? this.renderer.createElement(null, 'comp-a', this.debug(0, 0, 0))
        : this.renderer.selectRootElement(rootSelector, this.debug(0, 0, 0)));
    this._inj_0 = this.injector(0);
    this._appEl_0 = new import7.AppElement(0, null, this, this._el_0);
    var compView_0 =
        viewFactory_CompA0(this.viewManager, this._inj_0, this._appEl_0);
    this._CompA_0_0 = new import4.CompA();
    this._appEl_0.initComponent(this._CompA_0_0, [], compView_0);
    compView_0.create(this.projectableNodes, null);
    this.init([]..addAll([this._appEl_0]), [this._el_0],
        {'\$hostViewEl': this._appEl_0}, [], []);
  }

  dynamic injectorGetInternal(
      dynamic token, num requestNodeIndex, dynamic notFoundResult) {
    if ((identical(token, import4.CompA) && identical(0, requestNodeIndex))) {
      return this._CompA_0_0;
    }
    return notFoundResult;
  }
}

import3.AppView<dynamic> viewFactory_CompA_Host0(
    import5.AppViewManager_ viewManager,
    import6.Injector parentInjector,
    import7.AppElement declarationEl) {
  if (identical(renderType_CompA_Host, null)) {
    (renderType_CompA_Host = viewManager.createRenderComponentType(
        '', 0, import11.ViewEncapsulation.Emulated, styles_CompA_Host));
  }
  return new _View_CompA_Host0(viewManager, parentInjector, declarationEl);
}

const import3.HostViewFactory hostViewFactory_CompA =
    const import3.HostViewFactory('comp-a', viewFactory_CompA_Host0);
