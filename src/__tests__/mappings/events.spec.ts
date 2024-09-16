import { CloudwatchEventRule } from "@cdktf/provider-aws/lib/cloudwatch-event-rule/index.js";
import { CloudwatchEventTarget } from "@cdktf/provider-aws/lib/cloudwatch-event-target/index.js";
import { CfnRule } from "aws-cdk-lib/aws-events";
import { resolve } from "cdktf/lib/_tokens.js";
import { expectResourcePropertiesMatch, synthesizeElementAndTestStability } from "../helpers.js";

describe("Events mappings", () => {
    it("Should map AWS::Events::Rule", () => {
        const { stack, resource } = synthesizeElementAndTestStability(
            CfnRule,
            {
                name: "test-rule",
                description: "test-rule-description",
                eventBusName: "test-event-bus-name",
                eventPattern: {
                    source: ["test-source"],
                    detail: {
                        foo: ["bar"],
                    },
                },
                roleArn: "test-role-arn",
                scheduleExpression: "test-schedule-expression",
                state: "ENABLED",
                targets: [
                    {
                        id: "test-target-id",
                        roleArn: "test-target-role-arn",
                        deadLetterConfig: {
                            arn: "test-target-dead-letter-config-arn",
                        },
                        ecsParameters: {
                            enableEcsManagedTags: true,
                            taskCount: 1,
                            taskDefinitionArn: "test-target-ecs-task-definition-arn",
                            tagList: [
                                {
                                    value: "test-target-ecs-tag-value",
                                    key: "test-target-ecs-tag-key",
                                },
                            ],
                            capacityProviderStrategy: [
                                {
                                    capacityProvider: "test-target-ecs-capacity-provider",
                                    base: 1,
                                    weight: 1,
                                },
                            ],
                            enableExecuteCommand: true,
                            launchType: "test-target-ecs-launch-type",
                            placementConstraints: [
                                {
                                    expression: "test-target-ecs-placement-constraint-expression",
                                    type: "test-target-ecs-placement-constraint-type",
                                },
                            ],
                            placementStrategies: [
                                {
                                    type: "test-target-ecs-placement-strategy-type",
                                    field: "test-target-ecs-placement-strategy-field",
                                },
                            ],
                            platformVersion: "test-target-ecs-platform-version",
                            propagateTags: "TASK_DEFINITION",
                            // TODO: Uncomment when referenceId is implemented
                            referenceId: "test-target-ecs-reference-id",
                            group: "test-target-ecs-group",
                            networkConfiguration: {
                                awsVpcConfiguration: {
                                    securityGroups: ["test-target-ecs-security-group"],
                                    subnets: ["test-target-ecs-subnet"],
                                    assignPublicIp: "ENABLED",
                                },
                            },
                        },
                        arn: "test-target-arn",
                        batchParameters: {
                            arrayProperties: {
                                size: 1,
                            },
                            jobDefinition: "test-job-definition",
                            jobName: "test-job-name",
                            retryStrategy: {
                                attempts: 1,
                            },
                        },
                        httpParameters: {
                            headerParameters: {
                                "test-header-parameter-key": "test-header-parameter-value",
                            },
                            pathParameterValues: ["test-path-parameter-value"],
                            queryStringParameters: {
                                "test-query-string-parameter-key": "test-query-string-parameter-value",
                            },
                        },
                        inputPath: "test-input-path",
                        input: "test-input",
                        inputTransformer: {
                            inputTemplate: "test-input-template",
                            inputPathsMap: {
                                "test-input-paths-map-key": "test-input-paths-map-value",
                            },
                        },
                        kinesisParameters: {
                            partitionKeyPath: "test-partition-key-path",
                        },
                        retryPolicy: {
                            maximumRetryAttempts: 1,
                            maximumEventAgeInSeconds: 1,
                        },
                        redshiftDataParameters: {
                            sqls: ["test-sql"],
                            sql: "test-sql",
                            database: "test-database",
                            dbUser: "test-db-user",
                            statementName: "test-statement-name",
                            withEvent: true,
                            secretManagerArn: "test-secret-manager-arn",
                        },
                        runCommandParameters: {
                            runCommandTargets: [
                                {
                                    key: "test-run-command-target-key",
                                    values: ["test-run-command-target-value"],
                                },
                            ],
                        },
                        sqsParameters: {
                            messageGroupId: "test-message-group-id",
                        },
                        sageMakerPipelineParameters: {
                            pipelineParameterList: [
                                {
                                    name: "test-pipeline-parameter-name",
                                    value: "test-pipeline-parameter-value",
                                },
                            ],
                        },
                        appSyncParameters: {
                            graphQlOperation: "test-graph-ql-operation",
                        },
                    },
                ],
            },
            CloudwatchEventRule,
            {
                name: "test-rule",
                description: "test-rule-description",
                eventBusName: "test-event-bus-name",
                eventPattern: JSON.stringify({
                    source: ["test-source"],
                    detail: {
                        foo: ["bar"],
                    },
                }),
                isEnabled: true,
                roleArn: "test-role-arn",
                scheduleExpression: "test-schedule-expression",
            },
            [
                "targets.*.ecsParameters.referenceId",
                "targets.*.appSyncParameters",
                "targets.*.redshiftDataParameters.sqls",
            ],
        );

        const target = resource.node.tryFindChild("target0") as CloudwatchEventTarget;
        expectResourcePropertiesMatch(target, CloudwatchEventTarget, {
            roleArn: "test-target-role-arn",
            eventBusName: "test-event-bus-name",
            targetId: "test-target-id",
            deadLetterConfig: {
                arn: "test-target-dead-letter-config-arn",
            },
            ecsTarget: {
                enableEcsManagedTags: true,
                taskCount: 1,
                taskDefinitionArn: "test-target-ecs-task-definition-arn",
                tags: {
                    "test-target-ecs-tag-key": "test-target-ecs-tag-value",
                },
                capacityProviderStrategy: [
                    {
                        capacityProvider: "test-target-ecs-capacity-provider",
                        base: 1,
                        weight: 1,
                    },
                ],
                enableExecuteCommand: true,
                launchType: "test-target-ecs-launch-type",
                placementConstraint: [
                    {
                        expression: "test-target-ecs-placement-constraint-expression",
                        type: "test-target-ecs-placement-constraint-type",
                    },
                ],
                orderedPlacementStrategy: [
                    {
                        type: "test-target-ecs-placement-strategy-type",
                        field: "test-target-ecs-placement-strategy-field",
                    },
                ],
                platformVersion: "test-target-ecs-platform-version",
                propagateTags: "TASK_DEFINITION",
                group: "test-target-ecs-group",
                networkConfiguration: {
                    securityGroups: ["test-target-ecs-security-group"],
                    subnets: ["test-target-ecs-subnet"],
                    assignPublicIp: true,
                },
            },
            arn: "test-target-arn",
            batchTarget: {
                arraySize: 1,
                jobDefinition: "test-job-definition",
                jobName: "test-job-name",
                jobAttempts: 1,
            },
            httpTarget: {
                headerParameters: {
                    "test-header-parameter-key": "test-header-parameter-value",
                },
                pathParameterValues: ["test-path-parameter-value"],
                queryStringParameters: {
                    "test-query-string-parameter-key": "test-query-string-parameter-value",
                },
            },
            inputPath: "test-input-path",
            input: "test-input",
            inputTransformer: {
                inputTemplate: "test-input-template",
                inputPaths: {
                    "test-input-paths-map-key": "test-input-paths-map-value",
                },
            },
            rule: resolve(stack, resource.id),
            kinesisTarget: {
                partitionKeyPath: "test-partition-key-path",
            },
            retryPolicy: {
                maximumRetryAttempts: 1,
                maximumEventAgeInSeconds: 1,
            },
            redshiftTarget: {
                sql: "test-sql",
                database: "test-database",
                dbUser: "test-db-user",
                statementName: "test-statement-name",
                withEvent: true,
                secretsManagerArn: "test-secret-manager-arn",
            },
            runCommandTargets: [
                {
                    key: "test-run-command-target-key",
                    values: ["test-run-command-target-value"],
                },
            ],
            sqsTarget: {
                messageGroupId: "test-message-group-id",
            },
            sagemakerPipelineTarget: {
                pipelineParameterList: [
                    {
                        name: "test-pipeline-parameter-name",
                        value: "test-pipeline-parameter-value",
                    },
                ],
            },
        });
    });
});
