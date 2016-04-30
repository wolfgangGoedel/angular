library angular2.src.platform.worker_app_common;

import "package:angular2/core.dart" show Provider;
import "package:angular2/src/compiler/xhr.dart" show XHR;
import "package:angular2/src/web_workers/worker/xhr_impl.dart"
    show WebWorkerXHRImpl;
import "package:angular2/src/web_workers/worker/renderer.dart"
    show WebWorkerRootRenderer;
import "package:angular2/src/facade/lang.dart" show print;
import "package:angular2/src/core/render/api.dart" show RootRenderer;
import "package:angular2/core.dart"
    show
        PLATFORM_DIRECTIVES,
        PLATFORM_PIPES,
        ExceptionHandler,
        APPLICATION_COMMON_PROVIDERS,
        PLATFORM_COMMON_PROVIDERS,
        OpaqueToken;
import "package:angular2/common.dart"
    show COMMON_DIRECTIVES, COMMON_PIPES, FORM_PROVIDERS;
import "package:angular2/src/web_workers/shared/client_message_broker.dart"
    show ClientMessageBrokerFactory, ClientMessageBrokerFactory_;
import "package:angular2/src/web_workers/shared/service_message_broker.dart"
    show ServiceMessageBrokerFactory, ServiceMessageBrokerFactory_;
import "package:angular2/src/web_workers/shared/serializer.dart"
    show Serializer;
import "package:angular2/src/web_workers/shared/api.dart" show ON_WEB_WORKER;
import "package:angular2/src/web_workers/shared/render_store.dart"
    show RenderStore;

class PrintLogger {
  var log = print;
  var logError = print;
  var logGroup = print;
  logGroupEnd() {}
}

const WORKER_APP_PLATFORM_MARKER =
    /*@ts2dart_const*/ const OpaqueToken("WorkerAppPlatformMarker");
const List<dynamic> WORKER_APP_PLATFORM =
    /*@ts2dart_const*/ const [
  PLATFORM_COMMON_PROVIDERS,
  /*@ts2dart_const*/ (
      /* @ts2dart_Provider */ const Provider(WORKER_APP_PLATFORM_MARKER,
          useValue: true))
];
const List<dynamic> WORKER_APP_APPLICATION_COMMON =
    /*@ts2dart_const*/ const [
  APPLICATION_COMMON_PROVIDERS,
  FORM_PROVIDERS,
  Serializer,
  /* @ts2dart_Provider */ const Provider(PLATFORM_PIPES,
      useValue: COMMON_PIPES, multi: true),
  /* @ts2dart_Provider */ const Provider(PLATFORM_DIRECTIVES,
      useValue: COMMON_DIRECTIVES, multi: true),
  /* @ts2dart_Provider */ const Provider(ClientMessageBrokerFactory,
      useClass: ClientMessageBrokerFactory_),
  /* @ts2dart_Provider */ const Provider(ServiceMessageBrokerFactory,
      useClass: ServiceMessageBrokerFactory_),
  WebWorkerRootRenderer,
  /* @ts2dart_Provider */ const Provider(RootRenderer,
      useExisting: WebWorkerRootRenderer),
  /* @ts2dart_Provider */ const Provider(ON_WEB_WORKER, useValue: true),
  RenderStore,
  /* @ts2dart_Provider */ const Provider(ExceptionHandler,
      useFactory: _exceptionHandler, deps: const []),
  WebWorkerXHRImpl,
  /* @ts2dart_Provider */ const Provider(XHR, useExisting: WebWorkerXHRImpl)
];
ExceptionHandler _exceptionHandler() {
  return new ExceptionHandler(new PrintLogger());
}
