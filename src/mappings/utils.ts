// eslint-disable @typescript-eslint/no-explicit-any

import { CloudcontrolapiResource } from "@cdktf/provider-aws/lib/cloudcontrolapi-resource/index.js";
import { CfnResource, IResolvable } from "aws-cdk-lib";
import { Fn, TerraformResource } from "cdktf";
import { propertyAccess } from "cdktf/lib/tfExpression.js";
import { Construct } from "constructs";
import supportedAwsccResourceTypes from "../lib/core/awscc/supported-types.js";
import supportedTypes from "../lib/core/awscc/supported-types.js";
import { AccessTracker } from "./access-tracker.js";
import { AdaptCfnProps, CfnAttributes } from "./cfn-mapper-types.js";
import { mapperDebug, mapperWarn, ResourceMapper } from "./helper.js";

export function deleteUndefinedKeys<T>(obj: T): T {
    for (const key in obj) {
        if (obj[key] && typeof obj[key] === "object" && !(obj[key] instanceof TerraformResource)) {
            deleteUndefinedKeys(obj[key]);
            if (Object.keys(obj[key] as object).length === 0) {
                delete obj[key];
            }
        } else if (obj[key] === undefined) {
            delete obj[key];
        }
    }
    return obj;
}

type AttributeMapper<T extends TerraformResource> = (resource: T) => string | IResolvable;
type AnyAttributeMapper<T extends TerraformResource> = (attribute: string, resource: T) => string | IResolvable;

export type Mapping<T extends TerraformResource> = {
    resource: ResourceMapper<T>;
    unsupportedProps?: string[];
    attributes: {
        [name: string]: AttributeMapper<T>;
    } | AnyAttributeMapper<T>;
};

/**
 * @internal
 */
export const resourceMappings: { [type: string]: Mapping<TerraformResource> } = {};

export function createGenericCCApiMapping(
    resourceType: string,
): Mapping<CloudcontrolapiResource> {
    if (!supportedAwsccResourceTypes.has(resourceType)) {
        throw new Error(
            `Unsupported resource Type ${resourceType}. There is no custom mapping registered for ${resourceType} and the AWS CloudControl API does not seem to support it yet. You can register your own custom mapping or file an issue on github (or better yet, a PR)`,
        );
    }

    return {
        resource: (scope, id, props, proxy) => {
            proxy.touchPath("*");
            // clone object as we have to delete props from the original one
            const desiredState = Fn.jsonencode({ ...props });

            return new CloudcontrolapiResource(scope, id, {
                desiredState,
                typeName: resourceType,
            });
        },
        attributes: (attribute, resource) => {
            if (["Ref", "Id"].includes(attribute)) {
                return resource.id;
            }
            return propertyAccess(Fn.jsondecode(resource.properties), [attribute]);
        },
    };
}

export function findMapping(
    resourceType: string,
    useCloudControlFallback: boolean = false,
): Mapping<TerraformResource> {
    if (resourceMappings[resourceType]) {
        return resourceMappings[resourceType];
    }

    // no mapping found, trying to use generic aws_cloudcontrolapi_resource
    // this can lead to inconsistent behavior as cloud control constantly runs into issues updating resources
    if (process.env.CLOUDCONTROL_FALLBACK === "true" || useCloudControlFallback) {
        mapperWarn(
            `Attempting to fallback to AWS CloudControlApi resource for ${resourceType}. Cloud control mappings are actively discouraged as they are not stable and can lead to inconsistent behavior. This behaviour will be disabled by default in a future release`,
        );
        return createGenericCCApiMapping(resourceType) as unknown as Mapping<TerraformResource>; // TODO: fix type to allow this
    } else {
        throw new Error(
            `No mapping found for ${resourceType}. You can register your own custom mapping or file an issue on github (or better yet, a PR)`,
        );
    }
}

export function registerMapping<T extends TerraformResource>(
    resourceType: string,
    map: Mapping<T>,
) {
    if (supportedTypes.has(resourceType)) {
        mapperDebug(`Overriding CC resource with custom mapping for ${resourceType}`);
    }

    resourceMappings[resourceType] = map as unknown as Mapping<TerraformResource>;
}

export interface CfnMapper<
    CfClass extends {
        new(...args: never): CfnResource;
    },
    TfClass extends {
        new(...args: never): TerraformResource;
    },
> {
    resource(
        scope: Construct,
        id: string,
        props: CfnPropsForResourceClass<CfClass>,
        propProxy: AccessTracker<CfnPropsForResourceClass<CfClass>>,
    ): InstanceType<TfClass>;
    unsupportedProps?: string[];
    attributes: {
        [key in keyof CfnAttributes<InstanceType<CfClass>>]: (
            resource: InstanceType<TfClass>,
        ) => CfnAttributes<InstanceType<CfClass>>[key];
    };
}

type CfnPropsForResourceClass<
    CfClass extends {
        new(...args: never): CfnResource;
    },
> = AdaptCfnProps<ConstructorParameters<CfClass>[2]>;

export function registerMappingTyped<
    TfClass extends {
        new(...args: never): Tf;
    },
    CfClass extends {
        new(...args: never): CfnResource;
    },
    Tf extends TerraformResource,
>(cfClass: CfClass, tfClass: TfClass, mapper: CfnMapper<CfClass, TfClass>) {
    const resourceType = (cfClass as unknown as { CFN_RESOURCE_TYPE_NAME: string }).CFN_RESOURCE_TYPE_NAME;
    mapperDebug("registering mapping for", resourceType);
    registerMapping(resourceType, {
        resource: (scope, id, _, proxy) => {
            const tracker = proxy as AccessTracker<CfnPropsForResourceClass<CfClass>>;
            const tfResource = mapper.resource(scope, id, tracker.proxy, tracker);
            return tfResource as Tf;
        },
        unsupportedProps: mapper.unsupportedProps as string[],
        attributes: mapper.attributes as unknown as Mapping<TerraformResource>["attributes"],
    });
}
