library angular2.test.compiler.offline_compiler_spec;

import "package:angular2/testing_internal.dart"
    show
        ddescribe,
        describe,
        xdescribe,
        it,
        iit,
        xit,
        expect,
        beforeEach,
        afterEach,
        AsyncTestCompleter,
        inject,
        beforeEachProviders,
        el;
import "package:angular2/src/facade/lang.dart" show IS_DART;
import "package:angular2/core.dart" show Injector;
import "package:angular2/src/core/debug/debug_node.dart"
    show DebugNode, DebugElement, getDebugNode;
import "package:angular2/src/core/linker/view_ref.dart"
    show HostViewFactoryRef_;
import "package:angular2/src/core/linker/view.dart" show HostViewFactory;
import "offline_compiler_codegen_typed.dart" as typed;
import "offline_compiler_codegen_untyped.dart" as untyped;
import "package:angular2/src/core/linker/view_manager.dart" show AppViewManager;
import "package:angular2/src/platform/dom/dom_tokens.dart" show DOCUMENT;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
import "package:angular2/src/platform/dom/shared_styles_host.dart"
    show SharedStylesHost;
import "offline_compiler_util.dart" show CompA;

var _nextRootElementId = 0;
main() {
  var outputDefs = [];
  var typedHostViewFactory = typed.hostViewFactory_CompA;
  var untypedHostViewFactory = untyped.hostViewFactory_CompA;
  if (IS_DART || !DOM.supportsDOMEvents()) {
    // Our generator only works on node.js and Dart...
    outputDefs
        .add({"compAHostViewFactory": typedHostViewFactory, "name": "typed"});
  }
  if (!IS_DART) {
    // Our generator only works on node.js and Dart...
    if (!DOM.supportsDOMEvents()) {
      outputDefs.add(
          {"compAHostViewFactory": untypedHostViewFactory, "name": "untyped"});
    }
  }
  describe("OfflineCompiler", () {
    AppViewManager viewManager;
    Injector injector;
    SharedStylesHost sharedStylesHost;
    var rootEl;
    beforeEach(inject([AppViewManager, Injector, SharedStylesHost],
        (_viewManager, _injector, _sharedStylesHost) {
      viewManager = _viewManager;
      injector = _injector;
      sharedStylesHost = _sharedStylesHost;
    }));
    DebugElement createHostComp(HostViewFactory hvf) {
      var doc = injector.get(DOCUMENT);
      var oldRoots = DOM.querySelectorAll(doc, hvf.selector);
      for (var i = 0; i < oldRoots.length; i++) {
        DOM.remove(oldRoots[i]);
      }
      rootEl = el('''<${ hvf . selector}></${ hvf . selector}>''');
      DOM.appendChild(doc.body, rootEl);
      viewManager.createRootHostView(
          new HostViewFactoryRef_(hvf), hvf.selector, injector, []);
      return (getDebugNode(rootEl) as DebugElement);
    }
    outputDefs.forEach((outputDef) {
      describe('''${ outputDef [ "name" ]}''', () {
        it("should compile components", () {
          var hostEl = createHostComp(outputDef["compAHostViewFactory"]);
          expect(hostEl.componentInstance).toBeAnInstanceOf(CompA);
          var styles = sharedStylesHost.getAllStyles();
          expect(styles[0]).toContain(".redStyle[_ngcontent");
          expect(styles[1]).toContain(".greenStyle[_ngcontent");
        });
      });
    });
  });
}
