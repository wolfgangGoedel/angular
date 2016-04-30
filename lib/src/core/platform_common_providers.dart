library angular2.src.core.platform_common_providers;

import "package:angular2/core.dart" show Provider;
import "package:angular2/src/facade/lang.dart" show Type;
import "package:angular2/src/core/di.dart" show Provider;
import "package:angular2/src/core/console.dart" show Console;
import "reflection/reflection.dart" show Reflector, reflector;
import "reflection/reflector_reader.dart" show ReflectorReader;
import "package:angular2/src/core/testability/testability.dart"
    show TestabilityRegistry;
import "application_ref.dart" show PLATFORM_CORE_PROVIDERS;

Reflector _reflector() {
  return reflector;
}

Type ___unused;
/**
 * A default set of providers which should be included in any Angular platform.
 */
const List<dynamic /* dynamic | Type | Provider | List < dynamic > */ >
    PLATFORM_COMMON_PROVIDERS = const [
  PLATFORM_CORE_PROVIDERS,
  /*@ts2dart_Provider*/ const Provider(Reflector,
      useFactory: _reflector, deps: const []),
  /*@ts2dart_Provider*/ const Provider(ReflectorReader, useExisting: Reflector),
  TestabilityRegistry,
  Console
];
