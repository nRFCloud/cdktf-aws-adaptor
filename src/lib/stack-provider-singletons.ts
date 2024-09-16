import { ArchiveProvider } from "@cdktf/provider-archive/lib/provider/index.js";
import { TerraformProvider, TerraformStack } from "cdktf";
import { Construct } from "constructs";
import { TimeProvider } from "./core/time/provider/index.js";

function createStackProviderSingleton<
    Provider extends { new(scope: Construct, id: string, config: never): TerraformProvider },
>(providerClass: Provider, config: ConstructorParameters<Provider>[2]) {
    const providerId = `cdktf-aws-adaptor-provider-singleton-${providerClass.prototype.name}`;
    return (scope: Construct) => {
        const stack = TerraformStack.of(scope);
        const existingProvider = stack.node.tryFindChild(providerId) as TerraformProvider;

        if (existingProvider == null || !(existingProvider instanceof providerClass)) {
            return new providerClass(stack, providerId, config);
        }

        return existingProvider;
    };
}

export const getSingletonTimeProvider = createStackProviderSingleton(TimeProvider, {});

export const getSingletonArchiveProvider = createStackProviderSingleton(ArchiveProvider, {});
