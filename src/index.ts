import { registerMappings } from "./mappings/index.js";

export { AwsTerraformAdaptorStack } from "./lib/core/cdk-adaptor-stack.js";
export { registerMapping, registerMappingTyped } from "./mappings/utils.js";
registerMappings();
