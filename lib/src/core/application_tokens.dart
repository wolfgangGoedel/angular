library angular2.src.core.application_tokens;

import "package:angular2/core.dart" show Provider;
import "package:angular2/src/core/di.dart" show OpaqueToken, Provider;
import "package:angular2/src/facade/lang.dart" show Math, StringWrapper;

/**
 * A DI Token representing a unique string id assigned to the application by Angular and used
 * primarily for prefixing application attributes and CSS styles when
 * [ViewEncapsulation#Emulated] is being used.
 *
 * If you need to avoid randomly generated value to be used as an application id, you can provide
 * a custom value via a DI provider <!-- TODO: provider --> configuring the root [Injector]
 * using this token.
 */
const dynamic APP_ID = const OpaqueToken("AppId");
_appIdRandomProviderFactory() {
  return '''${ _randomChar ( )}${ _randomChar ( )}${ _randomChar ( )}''';
}

/**
 * Providers that will generate a random APP_ID_TOKEN.
 */
const APP_ID_RANDOM_PROVIDER =
    /*@ts2dart_const*/
    /* @ts2dart_Provider */ const Provider(APP_ID,
        useFactory: _appIdRandomProviderFactory, deps: const []);
String _randomChar() {
  return StringWrapper.fromCharCode(97 + Math.floor(Math.random() * 25));
}

/**
 * A function that will be executed when a platform is initialized.
 */
const dynamic PLATFORM_INITIALIZER =
    /*@ts2dart_const*/ const OpaqueToken("Platform Initializer");
/**
 * A function that will be executed when an application is initialized.
 */
const dynamic APP_INITIALIZER =
    /*@ts2dart_const*/ const OpaqueToken("Application Initializer");
/**
 * A token which indicates the root directory of the application
 */
const dynamic PACKAGE_ROOT_URL =
    /*@ts2dart_const*/ const OpaqueToken("Application Packages Root URL");
