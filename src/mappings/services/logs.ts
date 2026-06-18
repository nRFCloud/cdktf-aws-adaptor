import { cloudwatchLogIndexPolicy } from "@cdktf/provider-aws";
import { CloudwatchLogGroup, CloudwatchLogGroupConfig } from "@cdktf/provider-aws/lib/cloudwatch-log-group/index.js";
import {
    CloudwatchLogResourcePolicy,
    CloudwatchLogResourcePolicyConfig,
} from "@cdktf/provider-aws/lib/cloudwatch-log-resource-policy/index.js";
import { CfnLogGroup, CfnResourcePolicy } from "aws-cdk-lib/aws-logs";
import { Fn, type TerraformResource, TerraformStack } from "cdktf";
import { ImplicitDependencyAspect } from "../implicit-dependency-aspect.js";
import { deleteUndefinedKeys, registerMapping, registerMappingTyped } from "../utils.js";

interface LogRetentionProps {
    ServiceToken: string;
    LogGroupName: string;
    LogGroupRegion?: string;
    RetentionInDays?: string;
    SdkRetry?: {
        maxRetries?: string;
    };
    RemovalPolicy?: string;
}

export function registerLogMappings() {
    registerMapping("Custom::LogRetention", {
        resource: (scope, id, props) => {
            const {
                LogGroupName,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                LogGroupRegion,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                RemovalPolicy,
                RetentionInDays,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ServiceToken,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                SdkRetry,
            } = props as LogRetentionProps;

            // There is no such thing as a "LogRetention" resource and there never was
            // Instead, we try to create it before whatever it is that wants it

            // Destroy existing policy and function
            TerraformStack.of(scope).node.tryRemoveChild("LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a");

            return new CloudwatchLogGroup(scope, id, {
                name: LogGroupName,
                retentionInDays: RetentionInDays ? Number.parseInt(RetentionInDays) : undefined,
                skipDestroy: true,
            });
        },
        attributes: {
            Arn: resource => resource.arn,
            Name: resource => resource.name,
            Id: resource => resource.id,
        },
    });

    registerMappingTyped(CfnLogGroup, CloudwatchLogGroup, {
        resource: (scope, id, props, proxy) => {
            const config: CloudwatchLogGroupConfig = {
                name: props?.LogGroupName,
                logGroupClass: props?.LogGroupClass,
                kmsKeyId: props?.KmsKeyId,
                retentionInDays: props?.RetentionInDays,
                tags: Object.fromEntries(props?.Tags?.map(tag => [tag.Key, tag.Value]) ?? []),
            };

            const implicitDependencies: TerraformResource[] = [];

            const logGroup = new CloudwatchLogGroup(scope, id, deleteUndefinedKeys(config));

            if (props?.FieldIndexPolicies) {
                proxy.touchPath("FieldIndexPolicies");
                for (const [idx, policy] of props.FieldIndexPolicies.entries()) {
                    implicitDependencies.push(
                        new cloudwatchLogIndexPolicy.CloudwatchLogIndexPolicy(logGroup, `index-policy-${idx}`, {
                            logGroupName: logGroup.name,
                            policyDocument: Fn.jsonencode(policy),
                        }),
                    );
                }
            }

            ImplicitDependencyAspect.of(logGroup, implicitDependencies);

            return logGroup;
        },
        unsupportedProps: ["DataProtectionPolicy"],
        attributes: {
            Ref: resource => resource.id,
            Arn: resource => resource.arn,
        },
    });

    registerMappingTyped(CfnResourcePolicy, CloudwatchLogResourcePolicy, {
        resource: (scope, id, props) => {
            const config: CloudwatchLogResourcePolicyConfig = {
                policyDocument: props.PolicyDocument,
                policyName: props.PolicyName,
            };

            return new CloudwatchLogResourcePolicy(scope, id, deleteUndefinedKeys(config));
        },
        attributes: {
            Ref: resource => resource.id,
        },
    });
}
