library angular2.src.mock.mock_application_ref;

import "dart:async";
import "package:angular2/src/core/application_ref.dart" show ApplicationRef;
import "package:angular2/src/core/di.dart" show Injectable, Injector;
import "package:angular2/src/facade/lang.dart" show Type;
import "package:angular2/src/core/linker/component_factory.dart"
    show ComponentRef, ComponentFactory;
import "package:angular2/src/core/zone/ng_zone.dart" show NgZone;

/**
 * A no-op implementation of [ApplicationRef], useful for testing.
 */
@Injectable()
class MockApplicationRef extends ApplicationRef {
  void registerBootstrapListener(void listener(ComponentRef<dynamic> ref)) {}
  void registerDisposeListener(void dispose()) {}
  ComponentRef<dynamic/*= C */ > bootstrap/*< C >*/(
      ComponentFactory<dynamic/*= C */ > componentFactory) {
    return null;
  }

  Injector get injector {
    return null;
  }

  NgZone get zone {
    return null;
  }

  dynamic run(Function callback) {
    return null;
  }

  Future<dynamic> waitForAsyncInitializers() {
    return null;
  }

  void dispose() {}
  void tick() {}
  List<Type> get componentTypes {
    return null;
  }
}
