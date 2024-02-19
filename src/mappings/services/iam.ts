import { IamGroupPolicyAttachment } from "@cdktf/provider-aws/lib/iam-group-policy-attachment/index.js";
import { IamPolicy } from "@cdktf/provider-aws/lib/iam-policy/index.js";
import { IamRolePolicyAttachment } from "@cdktf/provider-aws/lib/iam-role-policy-attachment/index.js";
import { IamUserPolicyAttachment } from "@cdktf/provider-aws/lib/iam-user-policy-attachment/index.js";
import { CfnPolicy } from "aws-cdk-lib/aws-iam";
import { Fn } from "cdktf";
import { createGenericCCApiMapping, deleteUndefinedKeys, registerMapping, registerMappingTyped } from "../utils.js";

// const LAST_MANAGED_POLICY_DATA_SYMBOL = Symbol("lastManagedPolicy");

export function registerIamMappings() {
  registerMapping("AWS::IAM::Role", createGenericCCApiMapping("AWS::IAM::Role"));
  // registerMappingTyped(CfnRole, IamRole, {
  //     resource(scope, id, props) {
  //         const roleProps = {
  //             name: props.RoleName,
  //             assumeRolePolicy: Fn.jsonencode(props.AssumeRolePolicyDocument),
  //             description: props.Description,
  //             inlinePolicy: props.Policies?.map(policy => ({
  //                 name: policy.PolicyName,
  //                 policy: Fn.jsonencode(policy.PolicyDocument),
  //             })),
  //             maxSessionDuration: props.MaxSessionDuration,
  //             path: props.Path,
  //             permissionsBoundary: props.PermissionsBoundary,
  //             tags: Object.fromEntries(props.Tags?.map(({Key: key, Value: value}) => [key, value]) || []),
  //         }
  //
  //         const role = new IamRole(
  //             scope,
  //             id,
  //             deleteUndefinedKeys(roleProps),
  //         );
  //
  //         const managedPolicies = props.ManagedPolicyArns?.map((managedPolicy, index) => {
  //             return new IamRolePolicyAttachment(
  //                 scope,
  //                 `${id}-managed-policy-${index}`,
  //                 deleteUndefinedKeys({
  //                     policyArn: managedPolicy,
  //                     role: role.name,
  //                 }),
  //             );
  //         });
  //         if (managedPolicies?.length) {
  //             const dataSource = new DataAwsIamRole(scope, `${id}-data`, {
  //                 name: role.name,
  //                 dependsOn: managedPolicies,
  //             });
  //             // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //             (role as any)[LAST_MANAGED_POLICY_DATA_SYMBOL] = dataSource;
  //         }
  //
  //         Aspects.of(scope).add(new EventualConsistencyWorkaroundAspect(role))
  //         return role;
  //     },
  //     attributes: {
  //         // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //         Arn: (role: IamRole) => ((role as any)[LAST_MANAGED_POLICY_DATA_SYMBOL]?.arn || role.arn),
  //         Ref: (role: IamRole) => role.id,
  //         RoleId: (role: IamRole) => role.id,
  //     },
  // });

  registerMappingTyped(CfnPolicy, IamPolicy, {
    resource(scope, id, props) {
      const roleAttachments = props.Roles || [];
      const userAttachments = props.Users || [];
      const groupAttachments = props.Groups || [];

      const policy = new IamPolicy(
        scope,
        id,
        deleteUndefinedKeys({
          name: props.PolicyName,
          policy: Fn.jsonencode(props.PolicyDocument),
        }),
      );

      for (const [idx, roleArn] of roleAttachments.entries()) {
        new IamRolePolicyAttachment(
          policy,
          `${id}_role${idx}`,
          deleteUndefinedKeys({
            policyArn: policy!.arn,
            role: roleArn,
          }),
        );
      }

      for (const [idx, userArn] of userAttachments.entries()) {
        new IamUserPolicyAttachment(
          policy,
          `${id}_user${idx}`,
          deleteUndefinedKeys({
            policyArn: policy!.arn,
            user: userArn,
          }),
        );
      }

      for (const [idx, groupArn] of groupAttachments.entries()) {
        new IamGroupPolicyAttachment(
          policy,
          `${id}_group${idx}`,
          deleteUndefinedKeys({
            policyArn: policy!.arn,
            group: groupArn,
          }),
        );
      }

      return policy;
    },
    attributes: {
      Ref: (policy: IamPolicy) => policy.id,
      Id: (policy: IamPolicy) => policy.id,
    },
  });
}
