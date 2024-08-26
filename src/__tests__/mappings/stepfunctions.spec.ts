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
                },
                SfnStateMachine,
                {
                    name: "name",
                    definition: "\${join(\"\", [\"{\\\"StartAt\\\": \\\"HelloWorld\\\", \\\"States\\\": {}}\"])}",
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
                        kmsDataKeyReusePeriodSeconds: 600,
                        kmsKeyId: "123",
                        type: "Test",
                    },
                },
                SfnStateMachine,
                {
                    name: "name",
                    definition: "${data.aws_s3_bucket_object.resource_resource-definition_AA6652B4.body}",
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
                    encryptionConfiguration: {
                        kmsDataKeyReusePeriodSeconds: 600,
                        kmsKeyId: "123",
                        type: "Test",
                    },
                },
            );
        });

        it("Should translate with Object definition", () => {
            synthesizeElementAndTestStability(
                CfnStateMachine,
                {
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
                    definition: "\${jsonencode({\"StartAt\" = \"HelloWorld\", \"States\" = {}})}",
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
                },
            );
        });

        it("Should translate with definition substitutions", () => {
            synthesizeElementAndTestStability(
                CfnStateMachine,
                {
                    definitionS3Location: {
                        bucket: "bucket",
                        key: "key",
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
                },
                SfnStateMachine,
                {
                    name: "name",
                    definition:
                        "${replace(replace(data.aws_s3_bucket_object.resource_resource-definition_AA6652B4.body, \"$${MyFunction}\", \"arn:aws:lambda:us-east-1:123456789012:function:my-function:1\"), \"$${Task}\", \"TaskType\")}",
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
                },
            );
        });
    });
});
