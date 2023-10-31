import { IamGroupPolicyAttachment } from "@cdktf/provider-aws/lib/iam-group-policy-attachment/index.js";
import { IamPolicy } from "@cdktf/provider-aws/lib/iam-policy/index.js";
import { IamRolePolicyAttachment } from "@cdktf/provider-aws/lib/iam-role-policy-attachment/index.js";
import { IamUserPolicyAttachment } from "@cdktf/provider-aws/lib/iam-user-policy-attachment/index.js";
import { CfnPolicy } from "aws-cdk-lib/aws-iam";
import { resolve } from "cdktf/lib/_tokens.js";
import { setupJest } from "cdktf/lib/testing/adapters/jest.js";
import { synthesizeElementAndTestStability } from "../helpers.js";

setupJest();
describe("IAM Mappings", () => {
  // Replaced by CC resource
  // it("should map AWS::IAM::Role", () => {
  //   const { synth, resource, stack } = synthesizeElementAndTestStability(
  //     CfnRole,
  //     {
  //       path: "packages/cdktf-adaptor/src/mappings/services/iam.ts",
  //       description: "IamRole",
  //       tags: [
  //         {
  //           key: "Name",
  //           value: "test-role",
  //         },
  //       ],
  //       managedPolicyArns: [
  //         "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role",
  //       ],
  //       maxSessionDuration: 3600,
  //       roleName: "test-role",
  //       assumeRolePolicyDocument: {
  //         Version: "2012-10-17",
  //         Statement: [
  //           {
  //             Effect: "Allow",
  //             Principal: {
  //               Service: "ec2.amazonaws.com",
  //             },
  //           },
  //         ],
  //       },
  //       policies: [
  //         {
  //           policyName: "test-policy",
  //           policyDocument: {
  //             Version: "2012-10-17",
  //             Statement: [
  //               {
  //                 Effect: "Allow",
  //               },
  //             ],
  //           },
  //         },
  //       ],
  //       permissionsBoundary: "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role",
  //     },
  //     IamRole,
  //     {
  //       path: "packages/cdktf-adaptor/src/mappings/services/iam.ts",
  //       name: "test-role",
  //       assumeRolePolicy:
  //         "$\{jsonencode(\{\"Version\" = \"2012-10-17\", \"Statement\" = [{\"Effect\" = \"Allow\", \"Principal\" = {\"Service\" = \"ec2.amazonaws.com\"}}]})\}",
  //       description: "IamRole",
  //       inlinePolicy: [
  //         {
  //           name: "test-policy",
  //           policy: "$\{jsonencode(\{\"Version\" = \"2012-10-17\", \"Statement\" = [{\"Effect\" = \"Allow\"}]})\}",
  //         },
  //       ],
  //       permissionsBoundary: "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role",
  //       tags: {
  //         Name: "test-role",
  //       },
  //       maxSessionDuration: 3600,
  //     },
  //   );
  //
  //   expect(synth).toHaveResourceWithProperties(IamRolePolicyAttachment, {
  //     policy_arn: "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role",
  //     role: resolve(stack, resource.name),
  //   });
  // });

  it("should map AWS::IAM::Policy", () => {
    const { synth, stack, resource } = synthesizeElementAndTestStability(
      CfnPolicy,
      {
        policyName: "test-policy",
        policyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
            },
          ],
        },
        groups: ["test-group"],
        roles: ["test-role"],
        users: ["test-user"],
      },
      IamPolicy,
      {
        name: "test-policy",
        policy: "$\{jsonencode(\{\"Version\" = \"2012-10-17\", \"Statement\" = [{\"Effect\" = \"Allow\"}]})\}",
      },
    );

    expect(synth).toHaveResourceWithProperties(IamRolePolicyAttachment, {
      policy_arn: resolve(stack, resource.arn),
      role: "test-role",
    });

    expect(synth).toHaveResourceWithProperties(IamGroupPolicyAttachment, {
      policy_arn: resolve(stack, resource.arn),
      group: "test-group",
    });

    expect(synth).toHaveResourceWithProperties(IamUserPolicyAttachment, {
      policy_arn: resolve(stack, resource.arn),
      user: "test-user",
    });
  });
});
