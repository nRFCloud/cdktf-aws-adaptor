import { IamAccessKey } from "@cdktf/provider-aws/lib/iam-access-key/index.js";
import { IamGroupPolicyAttachment } from "@cdktf/provider-aws/lib/iam-group-policy-attachment/index.js";
import { IamPolicy } from "@cdktf/provider-aws/lib/iam-policy/index.js";
import { IamRolePolicyAttachment } from "@cdktf/provider-aws/lib/iam-role-policy-attachment/index.js";
import { IamRole, IamRoleConfig } from "@cdktf/provider-aws/lib/iam-role/index.js";
import { IamUserPolicyAttachment } from "@cdktf/provider-aws/lib/iam-user-policy-attachment/index.js";
import { CfnAccessKey, CfnPolicy, CfnRole } from "aws-cdk-lib/aws-iam";
import { Fn, TerraformResource } from "cdktf";
import { Sleep } from "../../lib/core/time/sleep/index.js";
import { getSingletonTimeProvider } from "../../lib/stack-provider-singletons.js";
import { ImplicitDependencyAspect } from "../implicit-dependency-aspect.js";
import { deleteUndefinedKeys, registerMappingTyped } from "../utils.js";

export function registerIamMappings() {
    registerMappingTyped(CfnRole, IamRole, {
        resource(scope, id, props, proxy) {
            proxy.touchPath("AssumeRolePolicyDocument");
            proxy.touchPath("Policies.*.PolicyDocument");
            const roleProps: IamRoleConfig = {
                name: props.RoleName,
                assumeRolePolicy: Fn.jsonencode(props.AssumeRolePolicyDocument),
                description: props.Description,
                inlinePolicy: props.Policies?.map(policy => ({
                    name: policy.PolicyName,
                    policy: Fn.jsonencode(policy.PolicyDocument),
                })),
                maxSessionDuration: props.MaxSessionDuration,
                path: props.Path,
                permissionsBoundary: props.PermissionsBoundary,
                tags: Object.fromEntries(props.Tags?.map(({ Key: key, Value: value }) => [key, value]) || []),
            };

            const role = new IamRole(
                scope,
                id,
                deleteUndefinedKeys(roleProps),
            );

            const eventualConsistentWait = new Sleep(scope, `${id}-wait`, {
                createDuration: "15s",
                provider: getSingletonTimeProvider(scope),
                dependsOn: [role],
            });

            const managedPolicies = props.ManagedPolicyArns?.map((managedPolicy, index) => {
                return new IamRolePolicyAttachment(
                    scope,
                    `${id}-managed-policy-${index}`,
                    deleteUndefinedKeys({
                        policyArn: managedPolicy,
                        role: role.name,
                        dependsOn: [eventualConsistentWait],
                    }),
                );
            });

            ImplicitDependencyAspect.of(role, [eventualConsistentWait, ...managedPolicies || []]);

            return role;
        },
        attributes: {
            Arn: (role: IamRole) => role.arn,

            Ref: (role: IamRole) => role.id,

            RoleId: (role: IamRole) => role.id,
        },
    });

    registerMappingTyped(CfnPolicy, IamPolicy, {
        resource(scope, id, props, proxy) {
            const roleAttachments = props.Roles || [];
            const userAttachments = props.Users || [];
            const groupAttachments = props.Groups || [];

            proxy.touchPath("PolicyDocument");
            const policy = new IamPolicy(
                scope,
                id,
                deleteUndefinedKeys({
                    name: props.PolicyName,
                    policy: Fn.jsonencode(props.PolicyDocument),
                }),
            );

            const implicitDependencies: TerraformResource[] = [];

            for (const [idx, roleArn] of roleAttachments.entries()) {
                implicitDependencies.push(
                    new IamRolePolicyAttachment(
                        policy,
                        `${id}_role${idx}`,
                        deleteUndefinedKeys({
                            policyArn: policy!.arn,
                            role: roleArn,
                        }),
                    ),
                );
            }

            for (const [idx, userArn] of userAttachments.entries()) {
                implicitDependencies.push(
                    new IamUserPolicyAttachment(
                        policy,
                        `${id}_user${idx}`,
                        deleteUndefinedKeys({
                            policyArn: policy!.arn,
                            user: userArn,
                        }),
                    ),
                );
            }

            for (const [idx, groupArn] of groupAttachments.entries()) {
                implicitDependencies.push(
                    new IamGroupPolicyAttachment(
                        policy,
                        `${id}_group${idx}`,
                        deleteUndefinedKeys({
                            policyArn: policy!.arn,
                            group: groupArn,
                        }),
                    ),
                );
            }

            if (implicitDependencies.length > 0) {
                ImplicitDependencyAspect.of(policy, implicitDependencies);
            }

            return policy;
        },
        attributes: {
            Ref: (policy: IamPolicy) => policy.id,
            Id: (policy: IamPolicy) => policy.id,
        },
    });

    registerMappingTyped(CfnAccessKey, IamAccessKey, {
        resource(scope, id, props) {
            return new IamAccessKey(scope, id, {
                user: props.UserName,
                status: props.Status,
            });
        },
        unsupportedProps: ["Serial"],
        attributes: {
            Ref: (accessKey: IamAccessKey) => accessKey.id,
            Id: (accessKey: IamAccessKey) => accessKey.id,
            SecretAccessKey: (accessKey: IamAccessKey) => accessKey.secret,
        },
    });
}
