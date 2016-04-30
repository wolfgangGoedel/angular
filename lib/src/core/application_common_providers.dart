library angular2.src.core.application_common_providers;

import "package:angular2/core.dart" show Provider;
import "package:angular2/src/facade/lang.dart" show Type;
import "application_tokens.dart" show APP_ID_RANDOM_PROVIDER;
import "application_ref.dart" show APPLICATION_CORE_PROVIDERS;
import "change_detection/change_detection.dart"
    show
        IterableDiffers,
        defaultIterableDiffers,
        KeyValueDiffers,
        defaultKeyValueDiffers;
import "linker/view_utils.dart" show ViewUtils;
import "linker/component_resolver.dart"
    show ComponentResolver, ReflectorComponentResolver;
import "linker/dynamic_component_loader.dart"
    show DynamicComponentLoader, DynamicComponentLoader_;

Type ___unused;
/**
 * A default set of providers which should be included in any Angular
 * application, regardless of the platform it runs onto.
 */
const List<dynamic /* Type | Map < String , dynamic > | List < dynamic > */ >
    APPLICATION_COMMON_PROVIDERS =
    /*@ts2dart_const*/ const [
  APPLICATION_CORE_PROVIDERS,
  /* @ts2dart_Provider */ const Provider(ComponentResolver,
      useClass: ReflectorComponentResolver),
  APP_ID_RANDOM_PROVIDER,
  ViewUtils,
  /* @ts2dart_Provider */ const Provider(IterableDiffers,
      useValue: defaultIterableDiffers),
  /* @ts2dart_Provider */ const Provider(KeyValueDiffers,
      useValue: defaultKeyValueDiffers),
  /* @ts2dart_Provider */ const Provider(DynamicComponentLoader,
      useClass: DynamicComponentLoader_)
];
