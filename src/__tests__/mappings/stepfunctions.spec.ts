import { SfnStateMachine } from "@cdktf/provider-aws/lib/sfn-state-machine";
import { CfnStateMachine } from "aws-cdk-lib/aws-stepfunctions";
import { setupJest } from "cdktf/lib/testing/adapters/jest.js";
import { describe } from "vitest";
import { synthesizeElementAndTestStability } from "../helpers.js";

setupJest();

describe("Step Functions mappings", () => {
    describe("AWS:StepFunctions:StateMachine", () => {
        it("Should translate with String definition", () => {
            synthesizeElementAndTestStability(
                CfnStateMachine,
                {
                    definitionString: "{\"StartAt\": \"HelloWorld\", \"States\": {}}",
                    stateMachineName: "name",
                    tags: [{
                        key: "key",
                        value: "value",
                    }],
                    stateMachineType: "STANDARD",
                    roleArn: "roleArn",
                    loggingConfiguration: {
                        level: "ALL",
                        destinations: [{
                            cloudWatchLogsLogGroup: {
                                logGroupArn: "logGroupArn",
                            },
                        }],
                        includeExecutionData: true,
                    },
                    tracingConfiguration: {
                        enabled: true,
                    },
                    definition: undefined,
                    definitionSubstitutions: {
                        MyFunction: "arn:aws:lambda:us-east-1:123456789012:function:my-function:1",
                        Task: "TaskType",
                    },
                    definitionS3Location: undefined as never,
                    encryptionConfiguration: {
                        kmsKeyId: "kmsKeyId",
                        kmsDataKeyReusePeriodSeconds: 123,
                        type: "KMS",
                    },
                },
                SfnStateMachine,
                {
                    timeouts: undefined,
                    name: "name",
                    definition:
                        `\${replace(replace(join("", ["{\\"StartAt\\": \\"HelloWorld\\", \\"States\\": {}}"]), "$\${MyFunction}", "arn:aws:lambda:us-east-1:123456789012:function:my-function:1"), "$\${Task}", "TaskType")}`,
                    roleArn: "roleArn",
                    loggingConfiguration: {
                        level: "ALL",
                        logDestination: "logGroupArn:*",
                        includeExecutionData: true,
                    },
                    encryptionConfiguration: {
                        type: "KMS",
                        kmsKeyId: "kmsKeyId",
                        kmsDataKeyReusePeriodSeconds: 123,
                    },
                    publish: undefined,
                    namePrefix: undefined,
                    type: "STANDARD",
                    tags: {
                        key: "value",
                    },
                    tracingConfiguration: {
                        enabled: true,
                    },
                },
            );
        });

        it("Should translate with S3 definition", () => {
            synthesizeElementAndTestStability(
                CfnStateMachine,
                {
                    definitionS3Location: {
                        bucket: "bucket",
                        key: "key",
                        version: "version",
                    },
                    encryptionConfiguration: {
                        kmsKeyId: "kmsKeyId",
                        kmsDataKeyReusePeriodSeconds: 123,
                        type: "KMS",
                    },
                    definitionSubstitutions: {
                        "MyFunction": "arn:aws:lambda:us-east-1:123456789012:function:my-function:1",
                        "Task": "TaskType",
                    },
                    definition: undefined,
                    definitionString: undefined as unknown as string,
                    stateMachineName: "name",
                    tags: [{
                        key: "key",
                        value: "value",
                    }],
                    stateMachineType: "STANDARD",
                    roleArn: "roleArn",
                    loggingConfiguration: {
                        level: "ALL",
                        destinations: [{
                            cloudWatchLogsLogGroup: {
                                logGroupArn: "logGroupArn",
                            },
                        }],
                        includeExecutionData: true,
                    },
                    tracingConfiguration: {
                        enabled: true,
                    },
                },
                SfnStateMachine,
                {
                    name: "name",
                    definition:
                        `\${replace(replace(data.aws_s3_bucket_object.resource_resource-definition_AA6652B4.body, "$\${MyFunction}", "arn:aws:lambda:us-east-1:123456789012:function:my-function:1"), "$\${Task}", "TaskType")}`,
                    roleArn: "roleArn",
                    loggingConfiguration: {
                        level: "ALL",
                        logDestination: "logGroupArn:*",
                        includeExecutionData: true,
                    },
                    type: "STANDARD",
                    tags: {
                        key: "value",
                    },
                    tracingConfiguration: {
                        enabled: true,
                    },
                    timeouts: undefined,
                    publish: undefined,
                    namePrefix: undefined,
                    encryptionConfiguration: {
                        type: "KMS",
                        kmsKeyId: "kmsKeyId",
                        kmsDataKeyReusePeriodSeconds: 123,
                    },
                },
            );
        });

        it("Should translate with Object definition", () => {
            synthesizeElementAndTestStability(
                CfnStateMachine,
                {
                    definitionS3Location: undefined as unknown as Required<CfnStateMachine.S3LocationProperty>,
                    definitionString: undefined as unknown as string,
                    encryptionConfiguration: {
                        kmsKeyId: "kmsKeyId",
                        kmsDataKeyReusePeriodSeconds: 123,
                        type: "KMS",
                    },
                    definitionSubstitutions: {
                        "MyFunction": "arn:aws:lambda:us-east-1:123456789012:function:my-function:1",
                        "Task": "TaskType",
                    },
                    definition: {
                        StartAt: "HelloWorld",
                        States: {},
                    },
                    stateMachineName: "name",
                    tags: [{
                        key: "key",
                        value: "value",
                    }],
                    stateMachineType: "STANDARD",
                    roleArn: "roleArn",
                    loggingConfiguration: {
                        level: "ALL",
                        destinations: [{
                            cloudWatchLogsLogGroup: {
                                logGroupArn: "logGroupArn",
                            },
                        }],
                        includeExecutionData: true,
                    },
                    tracingConfiguration: {
                        enabled: true,
                    },
                },
                SfnStateMachine,
                {
                    name: "name",
                    definition:
                        `\${replace(replace(jsonencode({"StartAt" = "HelloWorld"}), "$\${MyFunction}", "arn:aws:lambda:us-east-1:123456789012:function:my-function:1"), "$\${Task}", "TaskType")}`,
                    roleArn: "roleArn",
                    loggingConfiguration: {
                        level: "ALL",
                        logDestination: "logGroupArn:*",
                        includeExecutionData: true,
                    },
                    type: "STANDARD",
                    tags: {
                        key: "value",
                    },
                    tracingConfiguration: {
                        enabled: true,
                    },
                    timeouts: undefined,
                    publish: undefined,
                    namePrefix: undefined,
                    encryptionConfiguration: {
                        type: "KMS",
                        kmsKeyId: "kmsKeyId",
                        kmsDataKeyReusePeriodSeconds: 123,
                    },
                },
            );
        });

        it("Should translate with definition substitutions", () => {
            synthesizeElementAndTestStability(
                CfnStateMachine,
                {
                    definitionS3Location: undefined as unknown as Required<CfnStateMachine.S3LocationProperty>,
                    definition: {
                        StartAt: "HelloWorld",
                        States: {},
                    },
                    definitionSubstitutions: {
                        "MyFunction": "arn:aws:lambda:us-east-1:123456789012:function:my-function:1",
                        "Task": "TaskType",
                    },
                    stateMachineName: "name",
                    tags: [{
                        key: "key",
                        value: "value",
                    }],
                    stateMachineType: "STANDARD",
                    roleArn: "roleArn",
                    loggingConfiguration: {
                        level: "ALL",
                        destinations: [{
                            cloudWatchLogsLogGroup: {
                                logGroupArn: "logGroupArn",
                            },
                        }],
                        includeExecutionData: true,
                    },
                    tracingConfiguration: {
                        enabled: true,
                    },
                    encryptionConfiguration: {
                        kmsKeyId: "kmsKeyId",
                        kmsDataKeyReusePeriodSeconds: 123,
                        type: "KMS",
                    },
                    definitionString: undefined as unknown as string,
                },
                SfnStateMachine,
                {
                    name: "name",
                    definition:
                        `\${replace(replace(jsonencode({"StartAt" = "HelloWorld"}), "$\${MyFunction}", "arn:aws:lambda:us-east-1:123456789012:function:my-function:1"), "$\${Task}", "TaskType")}`,
                    roleArn: "roleArn",
                    loggingConfiguration: {
                        level: "ALL",
                        logDestination: "logGroupArn:*",
                        includeExecutionData: true,
                    },
                    type: "STANDARD",
                    tags: {
                        key: "value",
                    },
                    tracingConfiguration: {
                        enabled: true,
                    },
                    timeouts: undefined,
                    publish: undefined,
                    namePrefix: undefined,
                    encryptionConfiguration: {
                        type: "KMS",
                        kmsKeyId: "kmsKeyId",
                        kmsDataKeyReusePeriodSeconds: 123,
                    },
                },
            );
        });
    });
});
