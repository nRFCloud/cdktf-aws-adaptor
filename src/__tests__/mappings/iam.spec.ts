import { IamAccessKey } from "@cdktf/provider-aws/lib/iam-access-key/index.js";
import { IamGroupPolicyAttachment } from "@cdktf/provider-aws/lib/iam-group-policy-attachment/index.js";
import { IamPolicy } from "@cdktf/provider-aws/lib/iam-policy/index.js";
import { IamRolePolicyAttachment } from "@cdktf/provider-aws/lib/iam-role-policy-attachment/index.js";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role/index.js";
import { IamUserPolicyAttachment } from "@cdktf/provider-aws/lib/iam-user-policy-attachment/index.js";
import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket/index.js";
import { CfnAccessKey, CfnPolicy, CfnRole } from "aws-cdk-lib/aws-iam";
import { Testing } from "cdktf";
import { resolve } from "cdktf/lib/_tokens.js";
import { setupJest } from "cdktf/lib/testing/adapters/jest.js";
import { itShouldMapCfnElementToTerraformResource, synthesizeElementAndTestStability } from "../helpers.js";
import { describe, it } from "vitest";

setupJest();
describe("IAM Mappings", () => {
    it("should map AWS::IAM::Role", () => {
        const {
            stack: testStack,
            resource: iamRole,
        } = synthesizeElementAndTestStability(
            CfnRole,
            {
                path: "packages/cdktf-adaptor/src/mappings/services/iam.ts",
                description: "IamRole",
                tags: [
                    {
                        key: "Name",
                        value: "test-role",
                    },
                ],
                managedPolicyArns: [
                    "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role",
                ],
                maxSessionDuration: 3600,
                roleName: "test-role",
                assumeRolePolicyDocument: {
                    Version: "2012-10-17",
                    Statement: [
                        {
                            Effect: "Allow",
                            Principal: {
                                Service: "ec2.amazonaws.com",
                            },
                        },
                    ],
                },
                policies: [
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
                    },
                ],
                permissionsBoundary: "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role",
            },
            IamRole,
            {
                path: "packages/cdktf-adaptor/src/mappings/services/iam.ts",
                name: "test-role",
                assumeRolePolicy:
                    "$\{jsonencode(\{\"Version\" = \"2012-10-17\", \"Statement\" = [{\"Effect\" = \"Allow\", \"Principal\" = {\"Service\" = \"ec2.amazonaws.com\"}}]})\}",
                description: "IamRole",
                inlinePolicy: [
                    {
                        name: "test-policy",
                        policy:
                            "$\{jsonencode(\{\"Version\" = \"2012-10-17\", \"Statement\" = [{\"Effect\" = \"Allow\"}]})\}",
                    },
                ],
                permissionsBoundary: "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role",
                tags: {
                    Name: "test-role",
                },
                maxSessionDuration: 3600,
            },
        );

        new S3Bucket(testStack, "test-bucket", {
            bucket: iamRole.arn,
        });

        const synth = Testing.synth(testStack);

        expect(synth).toHaveResourceWithProperties(S3Bucket, {
            depends_on: [
                "time_sleep.resource_resource-wait_D049D385",
                "aws_iam_role_policy_attachment.resource_resource-managed-policy-0_D5E0A017",
            ],
        });
    });

    it("should map AWS::IAM::Policy", () => {
        const {
            synth,
            stack,
            resource,
        } = synthesizeElementAndTestStability(
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

    itShouldMapCfnElementToTerraformResource(
        CfnAccessKey,
        {
            status: "Active",
            userName: "test-user",
        },
        IamAccessKey,
        {
            status: "Active",
            user: "test-user",
        },
    );
});
