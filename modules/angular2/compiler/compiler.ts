/**
 * @module
 * @description
 * Starting point to import all compiler APIs.
 */
export {
  COMPILER_PROVIDERS,
  TEMPLATE_TRANSFORMS,
  CompilerConfig,
  RenderTypes,
  UrlResolver,
  DEFAULT_PACKAGE_URL_PROVIDER,
  createOfflineCompileUrlResolver,
  XHR,
  ViewResolver,
  DirectiveResolver,
  PipeResolver,
  SourceModule,
  NormalizedComponentWithViewDirectives,
  OfflineCompiler,
  CompileMetadataWithIdentifier,
  CompileMetadataWithType,
  CompileIdentifierMetadata,
  CompileDiDependencyMetadata,
  CompileProviderMetadata,
  CompileFactoryMetadata,
  CompileTokenMetadata,
  CompileTypeMetadata,
  CompileQueryMetadata,
  CompileTemplateMetadata,
  CompileDirectiveMetadata,
  CompilePipeMetadata
} from './src/compiler/compiler';

export * from './src/compiler/template_ast';
