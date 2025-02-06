import { LambdaEventSourceMapping } from "@cdktf/provider-aws/lib/lambda-event-source-mapping/index.js";
import { LambdaFunction } from "@cdktf/provider-aws/lib/lambda-function/index.js";
import { LambdaLayerVersionPermission } from "@cdktf/provider-aws/lib/lambda-layer-version-permission/index.js";
import { LambdaLayerVersion } from "@cdktf/provider-aws/lib/lambda-layer-version/index.js";
import { LambdaPermission } from "@cdktf/provider-aws/lib/lambda-permission/index.js";
import {
    CfnEventSourceMapping,
    CfnFunction,
    CfnLayerVersion,
    CfnLayerVersionPermission,
    CfnPermission,
} from "aws-cdk-lib/aws-lambda";
import { describe } from "vitest";
import { itShouldMapCfnElementToTerraformResource, synthesizeElementAndTestStability } from "../helpers.js";

describe("Lambda mappings", () => {
    itShouldMapCfnElementToTerraformResource(
        CfnPermission,
        {
            action: "lambda:InvokeFunction",
            functionName: "my-function",
            principal: "sns.amazonaws.com",
            sourceArn: "arn:aws:sns:us-east-1:123456789012:my-topic-1a2b3c4d",
            eventSourceToken: "token",
            functionUrlAuthType: "IAM",
            principalOrgId: "123456789012",
            sourceAccount: "123456789012",
        },
        LambdaPermission,
        {
            action: "lambda:InvokeFunction",
            functionName: "my-function",
            principal: "sns.amazonaws.com",
            sourceArn: "arn:aws:sns:us-east-1:123456789012:my-topic-1a2b3c4d",
            eventSourceToken: "token",
            functionUrlAuthType: "IAM",
            principalOrgId: "123456789012",
            sourceAccount: "123456789012",
            statementId: undefined,
            statementIdPrefix: undefined,
            qualifier: undefined,
        },
    );

    itShouldMapCfnElementToTerraformResource(
        CfnLayerVersion,
        {
            compatibleArchitectures: ["x86_64"],
            compatibleRuntimes: ["nodejs12.x"],
            content: {
                s3Bucket: "my-bucket",
                s3Key: "my-key",
                s3ObjectVersion: "my-version",
            },
            description: "my description",
            layerName: "my-layer",
            licenseInfo: "my-license",
        },
        LambdaLayerVersion,
        {
            s3Bucket: "my-bucket",
            s3Key: "my-key",
            s3ObjectVersion: "my-version",
            compatibleArchitectures: ["x86_64"],
            compatibleRuntimes: ["nodejs12.x"],
            description: "my description",
            layerName: "my-layer",
            licenseInfo: "my-license",
            filename: undefined,
            skipDestroy: undefined,
            sourceCodeHash: undefined,
        },
    );

    itShouldMapCfnElementToTerraformResource(
        CfnLayerVersionPermission,
        {
            action: "lambda:GetLayerVersion",
            principal: "123456789012",
            organizationId: "o-123456",
            layerVersionArn: "arn:aws:lambda:us-east-1:123456789012:layer:my-layer:1",
        },
        LambdaLayerVersionPermission,
        {
            skipDestroy: undefined,
            action: "lambda:GetLayerVersion",
            principal: "123456789012",
            organizationId: "o-123456",
            layerName: "arn:aws:lambda:us-east-1:123456789012:layer:my-layer:1",
            versionNumber:
                `$\{tonumber(element(split(\":\", \"arn:aws:lambda:us-east-1:123456789012:layer:my-layer:1\"), 7))}` as unknown as number,
            statementId: "teststackawstackresourceC278F851",
        },
    );

    it("should map CfnFunction to LambdaFunction", () => {
        synthesizeElementAndTestStability(
            CfnFunction,
            {
                loggingConfig: {
                    logFormat: "logFormat",
                    logGroup: "logGroup",
                    applicationLogLevel: "applicationLogLevel",
                    systemLogLevel: "systemLogLevel",
                },
                recursiveLoop: "recursiveLoop",
                runtimeManagementConfig: {
                    updateRuntimeOn: "2021-01-01",
                    runtimeVersionArn: "runtimeVersionArn",
                },
                architectures: ["x86_64"],
                code: {
                    imageUri: "imageUri",
                    s3Bucket: "s3Bucket",
                    s3Key: "s3Key",
                    s3ObjectVersion: "s3ObjectVersion",
                    sourceKmsKeyArn: "sourceKmsKeyArn",
                } as Required<CfnFunction.CodeProperty>,
                deadLetterConfig: {
                    targetArn: "targetArn",
                },
                description: "description",
                environment: {
                    variables: {
                        key: "value",
                    },
                },
                fileSystemConfigs: [
                    {
                        arn: "arn",
                        localMountPath: "localMountPath",
                    },
                ],
                functionName: "functionName",
                handler: "handler",
                imageConfig: {
                    command: ["command"],
                    entryPoint: ["entryPoint"],
                    workingDirectory: "workingDirectory",
                },
                kmsKeyArn: "kmsKeyArn",
                layers: ["layers"],
                memorySize: 1,
                packageType: "packageType",
                reservedConcurrentExecutions: 1,
                role: "role",
                codeSigningConfigArn: "codeSigningConfigArn",
                ephemeralStorage: {
                    size: 1,
                },
                runtime: "runtime",
                timeout: 1,
                tracingConfig: {
                    mode: "Active",
                },
                vpcConfig: {
                    securityGroupIds: ["securityGroupIds"],
                    subnetIds: ["subnetIds"],
                    ipv6AllowedForDualStack: true,
                },
                snapStart: {
                    applyOn: "1",
                },
                tags: [{
                    key: "key",
                    value: "value",
                }],
            },
            LambdaFunction,
            {
                s3Bucket: "s3Bucket",
                memorySize: 1,
                reservedConcurrentExecutions: 1,
                runtime: "runtime",
                timeout: 1,
                functionName: "functionName",
                handler: "handler",
                role: "role",
                codeSigningConfigArn: "codeSigningConfigArn",
                imageUri: "imageUri",
                architectures: ["x86_64"],
                deadLetterConfig: {
                    targetArn: "targetArn",
                },
                description: "description",
                environment: {
                    variables: {
                        key: "value",
                    },
                },
                filename: undefined,
                skipDestroy: undefined,
                sourceCodeHash: undefined,
                timeouts: undefined,
                loggingConfig: {
                    logFormat: "logFormat",
                    logGroup: "logGroup",
                    applicationLogLevel: "applicationLogLevel",
                    systemLogLevel: "systemLogLevel",
                },
                replacementSecurityGroupIds: undefined,
                replaceSecurityGroupsOnDestroy: undefined,
                ephemeralStorage: {
                    size: 1,
                },
                fileSystemConfig: {
                    arn: "arn",
                    localMountPath: "localMountPath",
                },
                imageConfig: {
                    command: ["command"],
                    entryPoint: ["entryPoint"],
                    workingDirectory: "workingDirectory",
                },
                kmsKeyArn: "kmsKeyArn",
                layers: ["layers"],
                packageType: "packageType",
                vpcConfig: {
                    securityGroupIds: ["securityGroupIds"],
                    subnetIds: ["subnetIds"],
                    ipv6AllowedForDualStack: true,
                },
                publish: true,
                tracingConfig: {
                    mode: "Active",
                },
                snapStart: {
                    applyOn: "1",
                },
                s3Key: "s3Key",
                s3ObjectVersion: "s3ObjectVersion",
                tags: {
                    key: "value",
                },
            },
            ["runtimeManagementConfig", "recursiveLoop", "code.sourceKmsKeyArn"],
        );
    });

    it("should map CfnFunction with inline zip file to LambdaFunction", () => {
        synthesizeElementAndTestStability(
            CfnFunction,
            {
                loggingConfig: {
                    logFormat: "logFormat",
                    logGroup: "logGroup",
                    applicationLogLevel: "applicationLogLevel",
                    systemLogLevel: "systemLogLevel",
                },
                recursiveLoop: "recursiveLoop",
                runtimeManagementConfig: {
                    updateRuntimeOn: "2021-01-01",
                    runtimeVersionArn: "runtimeVersionArn",
                },
                architectures: ["x86_64"],
                code: {
                    imageUri: "imageUri",
                    sourceKmsKeyArn: "sourceKmsKeyArn",
                    zipFile: "zipFile",
                } as Required<CfnFunction.CodeProperty>,
                deadLetterConfig: {
                    targetArn: "targetArn",
                },
                description: "description",
                environment: {
                    variables: {
                        key: "value",
                    },
                },
                fileSystemConfigs: [
                    {
                        arn: "arn",
                        localMountPath: "localMountPath",
                    },
                ],
                functionName: "functionName",
                handler: "handler",
                imageConfig: {
                    command: ["command"],
                    entryPoint: ["entryPoint"],
                    workingDirectory: "workingDirectory",
                },
                kmsKeyArn: "kmsKeyArn",
                layers: ["layers"],
                memorySize: 1,
                packageType: "packageType",
                reservedConcurrentExecutions: 1,
                role: "role",
                codeSigningConfigArn: "codeSigningConfigArn",
                ephemeralStorage: {
                    size: 1,
                },
                runtime: "runtime",
                timeout: 1,
                tracingConfig: {
                    mode: "Active",
                },
                vpcConfig: {
                    securityGroupIds: ["securityGroupIds"],
                    subnetIds: ["subnetIds"],
                    ipv6AllowedForDualStack: true,
                },
                snapStart: {
                    applyOn: "1",
                },
                tags: [{
                    key: "key",
                    value: "value",
                }],
            },
            LambdaFunction,
            {
                s3Bucket: "${aws_s3_object.resource_inline-zip-object_57BC8C94.bucket}",
                s3Key: "${aws_s3_object.resource_inline-zip-object_57BC8C94.key}",
                s3ObjectVersion: "${aws_s3_object.resource_inline-zip-object_57BC8C94.version_id}",
                memorySize: 1,
                reservedConcurrentExecutions: 1,
                runtime: "runtime",
                timeout: 1,
                functionName: "functionName",
                handler: "handler",
                role: "role",
                codeSigningConfigArn: "codeSigningConfigArn",
                imageUri: "imageUri",
                architectures: ["x86_64"],
                deadLetterConfig: {
                    targetArn: "targetArn",
                },
                description: "description",
                environment: {
                    variables: {
                        key: "value",
                    },
                },
                filename: undefined,
                skipDestroy: undefined,
                sourceCodeHash: undefined,
                timeouts: undefined,
                loggingConfig: {
                    logFormat: "logFormat",
                    logGroup: "logGroup",
                    applicationLogLevel: "applicationLogLevel",
                    systemLogLevel: "systemLogLevel",
                },
                replacementSecurityGroupIds: undefined,
                replaceSecurityGroupsOnDestroy: undefined,
                ephemeralStorage: {
                    size: 1,
                },
                fileSystemConfig: {
                    arn: "arn",
                    localMountPath: "localMountPath",
                },
                imageConfig: {
                    command: ["command"],
                    entryPoint: ["entryPoint"],
                    workingDirectory: "workingDirectory",
                },
                kmsKeyArn: "kmsKeyArn",
                layers: ["layers"],
                packageType: "packageType",
                vpcConfig: {
                    securityGroupIds: ["securityGroupIds"],
                    subnetIds: ["subnetIds"],
                    ipv6AllowedForDualStack: true,
                },
                publish: true,
                tracingConfig: {
                    mode: "Active",
                },
                snapStart: {
                    applyOn: "1",
                },
                tags: {
                    key: "value",
                },
            },
            ["runtimeManagementConfig", "recursiveLoop", "code.sourceKmsKeyArn"],
            true,
        );
    });

    itShouldMapCfnElementToTerraformResource(
        CfnEventSourceMapping,
        {
            metricsConfig: {
                metrics: ["metrics"],
            },
            provisionedPollerConfig: {
                maximumPollers: 1,
                minimumPollers: 1,
            },
            tags: [{
                key: "key",
                value: "value",
            }],
            batchSize: 1,
            bisectBatchOnFunctionError: true,
            destinationConfig: {
                onFailure: {
                    destination: "destination",
                },
            },
            kmsKeyArn: "kmsKeyArn",
            enabled: true,
            eventSourceArn: "eventSourceArn",
            functionName: "functionName",
            maximumBatchingWindowInSeconds: 1,
            maximumRecordAgeInSeconds: 1,
            maximumRetryAttempts: 1,
            parallelizationFactor: 1,
            startingPosition: "LATEST",
            startingPositionTimestamp: 100000,
            topics: ["topics"],
            queues: ["queues"],
            sourceAccessConfigurations: [
                {
                    type: "type",
                    uri: "uri",
                },
            ],
            amazonManagedKafkaEventSourceConfig: {
                consumerGroupId: "consumerGroupId",
            },
            filterCriteria: {
                filters: [{
                    pattern: "pattern",
                }],
            },
            documentDbEventSourceConfig: {
                databaseName: "databaseName",
                fullDocument: "update",
                collectionName: "collectionName",
            },
            scalingConfig: {
                maximumConcurrency: 1,
            },
            functionResponseTypes: ["functionResponseTypes"],
            selfManagedEventSource: {
                endpoints: {
                    kafkaBootstrapServers: ["kafkaBootstrapServers"],
                },
            },
            selfManagedKafkaEventSourceConfig: {
                consumerGroupId: "consumerGroupId",
            },
            tumblingWindowInSeconds: 1,
        },
        LambdaEventSourceMapping,
        {
            metricsConfig: {
                metrics: ["metrics"],
            },
            provisionedPollerConfig: {
                maximumPollers: 1,
                minimumPollers: 1,
            },
            tags: {
                key: "value",
            },
            kmsKeyArn: "kmsKeyArn",
            scalingConfig: {
                maximumConcurrency: 1,
            },
            batchSize: 1,
            bisectBatchOnFunctionError: true,
            destinationConfig: {
                onFailure: {
                    destinationArn: "destination",
                },
            },
            enabled: true,
            eventSourceArn: "eventSourceArn",
            functionName: "functionName",
            maximumBatchingWindowInSeconds: 1,
            maximumRecordAgeInSeconds: 1,
            maximumRetryAttempts: 1,
            parallelizationFactor: 1,
            startingPosition: "LATEST",
            startingPositionTimestamp: `\${formatdate("YYYY-MM-DD'T'hh:mm:ssZ", "100000")}`,
            topics: ["topics"],
            queues: ["queues"],
            selfManagedKafkaEventSourceConfig: {
                consumerGroupId: "consumerGroupId",
            },
            tumblingWindowInSeconds: 1,
            functionResponseTypes: ["functionResponseTypes"],
            filterCriteria: {
                filter: [{
                    pattern: "pattern",
                }],
            },
            documentDbEventSourceConfig: {
                databaseName: "databaseName",
                fullDocument: "update",
                collectionName: "collectionName",
            },
            amazonManagedKafkaEventSourceConfig: {
                consumerGroupId: "consumerGroupId",
            },
            selfManagedEventSource: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                endpoints: "${jsondecode(local.resource_selfmanaged-kafka-bootstrap-servers_C65ED52F)}" as any,
            },
            sourceAccessConfiguration: [{
                type: "type",
                uri: "uri",
            }],
        },
    );
});
