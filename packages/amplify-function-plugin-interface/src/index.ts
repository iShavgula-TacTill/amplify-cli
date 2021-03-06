/*
  Function Runtime Contributor Types
*/

// All Function Runtime Contributor plugins must export a function of this type named 'functionRuntimeContributorFactory'
export type FunctionRuntimeContributorFactory = (context: any) => Contributor<FunctionRuntimeParameters> & FunctionRuntimeLifecycleManager

// Subset of FunctionParameters that defines the function runtime
export type FunctionRuntimeParameters = Pick<FunctionParameters, 'runtime'>

/*
  Function Template Contributor Types
*/

// All Function Template Contributor plugins must export a function of this type named 'functionTemplateContributorFactory'
export type FunctionTemplateContributorFactory = ContributorFactory<FunctionTemplateParameters>

// Subset of FunctionParameters that defines the function template
export type FunctionTemplateParameters = Pick<FunctionParameters, 'dependsOn' | 'functionTemplate' | 'triggerEventSourceMappings'>

// Generic interfaces / types for all contributors
// context is the Amplify core context object (unfourtunately no type for this)
export type ContributorFactory<T extends Partial<FunctionParameters>> = (context: any) => Contributor<T>

export interface Contributor<T extends Partial<FunctionParameters>> {
  contribute(selection: string): Promise<T>
}

export interface FunctionRuntimeLifecycleManager {
  package(request: PackageRequest): Promise<void>
  build(request: BuildRequest): Promise<void>
  invoke(request: InvocationRequest): Promise<any>
}

export type InvocationRequest = {
  srcRoot: string
  handler: string
  event: any
  context: any
  env: {[key: string]: string}
}

export type BuildRequest = {
  env: string
  srcRoot: string
}

export type PackageRequest = {
  env: string
  srcRoot: string
  dstFilename: string
}

/**
 * Data structure that represents a Function.
 */
export type FunctionParameters = {
  providerContext: ProviderContext   // higher level context around the function
  cloudResourceTemplatePath: string  // absolute path to the cloud resource template (for now this is always a CFN template)
  resourceName: string               // name of this resource
  functionName: string               // name of this function
  runtime: FunctionRuntime           // runtime metadata for the function
  roleName: string                   // IAM role that this function will assume
  dependsOn?: FunctionDependency[]    // resources this function depends on
  functionTemplate?: FunctionTemplate // fully describes the template that will be used
  categoryPolicies?: object[]         // IAM policies that should be applied to this lambda
  skipEdit?: boolean                  // Whether or not to prompt to edit the function after creation
  parametersFileObj?: object          // Contains the object that is written to function-parameters.json. Kindof a hold-over from older code
  resourceProperties?: object[]       // Existing function environment variable map. Should refactor to use dependsOn directly
  triggerEventSourceMappings?: any    // Used for dynamo / kinesis function triggers. May want to refactor
  topLevelComment?: string            // LEGACY Used to write available environment variables at top of template files
  runtimePlugin: string
}

/**
 * Deprecated
 *
 * This is the old parameters object that was used to define trigger templates.
 * New changes should use the above FunctionParameters (with modifications if necessary)
 */
export interface FunctionTriggerParameters {
  trigger: boolean // discriminant to determine if parameters are trigger params
  key: string // name of the trigger template
  modules: any[]
  parentResource: string
  functionName: string
  resourceName: string
  parentStack: string
  triggerEnvs: any
  triggerIndexPath: string
  triggerPackagePath: string
  triggerDir: string
  roleName: string
  triggerTemplate: string
  triggerEventPath: string
  skipEdit: boolean
  functionTemplate?: FunctionTemplate
  cloudResourceTemplatePath?: string
}

export interface ProviderContext {
  provider: string
  service: string
  projectName: string
}

export interface FunctionRuntime {
  name: string // Name presented to users in the CLI
  value: string // value used internally to identify this runtime
  cloudTemplateValue: string // value set in the CFN file
  defaultHandler: string // default handler to set in the CFN file
}

export interface FunctionTemplate {
  handler?: string // lambda handler entry point in the template
  parameters?: any // map of parameters to populate the template files
  sourceRoot: string // absolute path to the root of the template source files
  sourceFiles: string[] // relative paths from sourceRoot to the template files
  destMap?: { [name: string]: string } // optional map of sourceFiles to destination paths
  defaultEditorFile?: string // file opened by default when editing this template. If not specified, the first file in sourceFiles is used
}

/**
 * Designed to be backwards compatible with the old way of representing dependencies as
 * {
 *    category: string
 *    resourceName: string
 *    attributes: string[]
 * }
 * and auto-generating environemnt variable names based on this info
 * When attributeEnvMap is specified, it can specify a custom environment variable name for a dependency attribute
 * If no mapping is found for an attribute in the map, then it falls back to the autogenerated value
 */
export interface FunctionDependency {
  category: string // resource category of the dependency
  resourceName: string // name of the dependency
  attributes: string[] // attributes that this function depends on (must be outputs of the dependencies CFN template)
  attributeEnvMap?: { [name: string]: string} // optional attributes to environment variable names map that will be exposed to the function
}

interface FunctionContributorCondition {
  provider?: string
  service?: string
  runtime?: string
}

export type FunctionTemplateCondition = FunctionContributorCondition
export type FunctionRuntimeCondition = Pick<FunctionContributorCondition, 'provider' | 'service'>

export interface FunctionBreadcrumbs {
  pluginId: string
  functionRuntime: string
  useLegacyBuild: boolean
  scripts?: Record<'build' & 'package', FunctionScript>
}

export interface FunctionScript {
  type: 'file' | 'inline'
  value: string
}
