import { CloudwatchLogGroup } from "@cdktf/provider-aws/lib/cloudwatch-log-group/index.js";
import { CloudwatchLogResourcePolicy } from "@cdktf/provider-aws/lib/cloudwatch-log-resource-policy/index.js";
import { CfnLogGroup, CfnResourcePolicy } from "aws-cdk-lib/aws-logs";
import { describe } from "vitest";
import { itShouldMapCfnElementToTerraformResource } from "../helpers.js";

describe("Logs mappings", () => {
    itShouldMapCfnElementToTerraformResource(
        CfnLogGroup,
        {
            fieldIndexPolicies: [
                {
                    fieldToMatch: "test-field-to-match",
                    sortingKeys: ["test-sorting-key"],
                },
            ],
            kmsKeyId: "test-kms-key-id",
            logGroupName: "test-log-group-name",
            retentionInDays: 1,
            tags: [{
                key: "test-tag-key",
                value: "test-tag-value",
            }],
            logGroupClass: "test-log-group-class",
            dataProtectionPolicy: {
                policyName: "test-policy-name",
                policyDocument: {
                    Version: "2012-10-17",
                    Statement: [
                        {
                            Sid: "test-sid",
                            Effect: "Allow",
                            Principal: {
                                AWS: "test-principal",
                            },
                            Action: "logs:PutLogEvents",
                            Resource: "test-resource",
                        },
                    ],
                },
            },
        },
        CloudwatchLogGroup,
        {
            tags: {
                "test-tag-key": "test-tag-value",
            },
            name: "test-log-group-name",
            retentionInDays: 1,
            kmsKeyId: "test-kms-key-id",
        },
        ["dataProtectionPolicy"],
    );

    itShouldMapCfnElementToTerraformResource(
        CfnResourcePolicy,
        {
            policyDocument:
                "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Sid\":\"test-sid\",\"Effect\":\"Allow\",\"Principal\":{\"AWS\":\"test-principal\"},\"Action\":\"logs:PutLogEvents\",\"Resource\":\"test-resource\"}]}",
            policyName: "test-policy-name",
        },
        CloudwatchLogResourcePolicy,
        {
            policyDocument:
                "${join(\"\", [\"{\\\"Version\\\":\\\"2012-10-17\\\",\\\"Statement\\\":[{\\\"Sid\\\":\\\"test-sid\\\",\\\"Effect\\\":\\\"Allow\\\",\\\"Principal\\\":{\\\"AWS\\\":\\\"test-principal\\\"},\\\"Action\\\":\\\"logs:PutLogEvents\\\",\\\"Resource\\\":\\\"test-resource\\\"}]}\"])}",
            policyName: "test-policy-name",
        },
    );
});
