import { file as tf_file } from "@cdktf/provider-archive";
import { LambdaEventSourceMapping } from "@cdktf/provider-aws/lib/lambda-event-source-mapping/index.js";
import { LambdaFunction, LambdaFunctionConfig } from "@cdktf/provider-aws/lib/lambda-function/index.js";
import { LambdaLayerVersionPermission } from "@cdktf/provider-aws/lib/lambda-layer-version-permission/index.js";
import { LambdaLayerVersion } from "@cdktf/provider-aws/lib/lambda-layer-version/index.js";
import { LambdaPermission } from "@cdktf/provider-aws/lib/lambda-permission/index.js";
import { S3Object } from "@cdktf/provider-aws/lib/s3-object/index.js";
import { IResolvable, Names, Stack as AWSStack } from "aws-cdk-lib";
import {
    CfnEventSourceMapping,
    CfnFunction,
    CfnLayerVersion,
    CfnLayerVersionPermission,
    CfnPermission,
} from "aws-cdk-lib/aws-lambda";
import { Fn, TerraformLocal } from "cdktf";
import { join } from "node:path";
import { tmpdir } from "os";
import { TerraformSynthesizer } from "../../lib/core/terraform-synthesizer.js";
import { getSingletonArchiveProvider } from "../../lib/stack-provider-singletons.js";
import { deleteUndefinedKeys, registerMappingTyped } from "../utils.js";

export function registerLambdaMappings() {
    registerMappingTyped(CfnPermission, LambdaPermission, {
        resource: (scope, id, props) => {
            return new LambdaPermission(
                scope,
                id,
                deleteUndefinedKeys({
                    eventSourceToken: props.EventSourceToken,
                    functionName: props.FunctionName,
                    principal: props.Principal,
                    sourceAccount: props.SourceAccount,
                    sourceArn: props.SourceArn,
                    action: props.Action,
                    functionUrlAuthType: props.FunctionUrlAuthType,
                    principalOrgId: props.PrincipalOrgID,
                }),
            );
        },
        attributes: {
            Ref: (permission: LambdaPermission) => permission.id,
            Id: (permission: LambdaPermission) => permission.id,
        },
    });

    registerMappingTyped(CfnLayerVersion, LambdaLayerVersion, {
        resource: (scope, id, props) => {
            const layerVersion = new LambdaLayerVersion(
                scope,
                id,
                deleteUndefinedKeys({
                    compatibleArchitectures: props.CompatibleArchitectures,
                    compatibleRuntimes: props.CompatibleRuntimes,
                    layerName: props.LayerName!,
                    description: props.Description,
                    licenseInfo: props.LicenseInfo,
                    s3Bucket: props.Content.S3Bucket,
                    s3Key: props.Content.S3Key,
                    s3ObjectVersion: props.Content.S3ObjectVersion,
                }),
            );

            layerVersion.layerName = props.LayerName || Names.uniqueResourceName(layerVersion, { maxLength: 32 });

            return layerVersion;
        },
        attributes: {
            Ref: (layerVersion: LambdaLayerVersion) => layerVersion.id,
            LayerVersionArn: (layerVersion: LambdaLayerVersion) => layerVersion.arn,
        },
    });

    registerMappingTyped(CfnLayerVersionPermission, LambdaLayerVersionPermission, {
        resource: (scope, id, props) => {
            const parsedArn = Fn.split(":", props.LayerVersionArn);
            const layerVersion = Fn.tonumber(Fn.element(parsedArn, 7));
            // const layerVersion = Fn.tonumber(parsedArn.at(7))

            const versionPermission = new LambdaLayerVersionPermission(
                scope,
                id,
                deleteUndefinedKeys({
                    action: props.Action,
                    principal: props.Principal,
                    layerName: props.LayerVersionArn,
                    organizationId: props.OrganizationId,
                    statementId: "",
                    versionNumber: layerVersion,
                }),
            );
            versionPermission.statementId = Names.uniqueResourceName(versionPermission, { maxLength: 32 });
            return versionPermission;
        },
        attributes: {
            Ref: (versionPermission: LambdaLayerVersionPermission) => versionPermission.id,
            Id: resource => resource.id,
        },
    });

    // registerMapping("AWS::Lambda::Permission", {
    //   resource: createGuessingResourceMapper(LambdaPermission),
    //   attributes: {
    //     Ref: (permission: LambdaPermission) => permission.id,
    //   },
    // });
    //
    registerMappingTyped(CfnFunction, LambdaFunction, {
        resource(scope, id, lambdaProps, proxy): LambdaFunction {
            proxy.touchPath("Environment.Variables");
            proxy.touchPath("VpcConfig.SecurityGroupIds");
            proxy.touchPath("VpcConfig.SubnetIds");
            proxy.touchPath("Layers");
            proxy.touchPath("Architectures");
            proxy.touchPath("ImageConfig.Command");
            proxy.touchPath("ImageConfig.EntryPoint");

            let codeConfig: {
                s3Bucket?: string;
                s3Key?: string;
                s3ObjectVersion?: string;
                filename?: string;
            } = {};

            if (lambdaProps.Code.ZipFile) {
                // Use the archive provider to create a zip file from the inline source
                const archiveProvider = getSingletonArchiveProvider(scope);
                const tempPath = join(tmpdir(), `${scope.node.addr}.zip`);
                const archive = new tf_file.File(scope, `inline-zip-archive`, {
                    type: "zip",
                    outputPath: tempPath,
                    provider: archiveProvider,
                    source: [{
                        content: lambdaProps.Code.ZipFile,
                        filename: "index.js",
                    }],
                });

                // Use the stack synthesizer to create a file asset
                const synthesizer = AWSStack.of(scope).synthesizer as TerraformSynthesizer;
                const s3Object = new S3Object(scope, `inline-zip-object`, {
                    bucket: synthesizer.getAssetBucket().bucket,
                    key: `${scope.node.addr}-inline-zip-object`,
                    source: archive.outputPath,
                });

                codeConfig = {
                    s3Bucket: s3Object.bucket,
                    s3Key: s3Object.key,
                    s3ObjectVersion: s3Object.versionId,
                };
            } else {
                codeConfig = {
                    s3Bucket: lambdaProps.Code.S3Bucket,
                    s3Key: lambdaProps.Code.S3Key,
                    s3ObjectVersion: lambdaProps.Code.S3ObjectVersion,
                };
            }

            const mapped: LambdaFunctionConfig = {
                ephemeralStorage: {
                    size: lambdaProps.EphemeralStorage?.Size as number,
                },
                loggingConfig: {
                    logFormat: lambdaProps.LoggingConfig?.LogFormat as string,
                    logGroup: lambdaProps.LoggingConfig?.LogGroup as string,
                    applicationLogLevel: lambdaProps.LoggingConfig?.ApplicationLogLevel as string,
                    systemLogLevel: lambdaProps.LoggingConfig?.SystemLogLevel as string,
                },
                description: lambdaProps.Description,
                tags: Object.fromEntries(
                    lambdaProps.Tags?.map(({
                        Key,
                        Value,
                    }) => [Key, Value]) || [],
                ),
                codeSigningConfigArn: lambdaProps.CodeSigningConfigArn,
                functionName: lambdaProps.FunctionName!,
                deadLetterConfig: {
                    targetArn: lambdaProps.DeadLetterConfig?.TargetArn as string,
                },
                architectures: lambdaProps.Architectures,
                s3Bucket: codeConfig.s3Bucket,
                s3Key: codeConfig.s3Key,
                s3ObjectVersion: codeConfig.s3ObjectVersion,
                fileSystemConfig: {
                    arn: lambdaProps.FileSystemConfigs?.[0].Arn as string,
                    localMountPath: lambdaProps.FileSystemConfigs?.[0].LocalMountPath as string,
                },
                environment: {
                    variables: lambdaProps.Environment?.Variables,
                },
                imageConfig: {
                    command: lambdaProps.ImageConfig?.Command,
                    entryPoint: lambdaProps.ImageConfig?.EntryPoint,
                    workingDirectory: lambdaProps.ImageConfig?.WorkingDirectory,
                },
                handler: lambdaProps.Handler,
                role: lambdaProps.Role,
                imageUri: lambdaProps.Code.ImageUri,
                kmsKeyArn: lambdaProps.KmsKeyArn,
                layers: lambdaProps.Layers,
                packageType: lambdaProps.PackageType,
                memorySize: lambdaProps.MemorySize,
                reservedConcurrentExecutions: lambdaProps.ReservedConcurrentExecutions,
                runtime: lambdaProps.Runtime,
                vpcConfig: {
                    ipv6AllowedForDualStack: lambdaProps.VpcConfig?.Ipv6AllowedForDualStack as boolean,
                    subnetIds: lambdaProps.VpcConfig?.SubnetIds as string[],
                    securityGroupIds: lambdaProps.VpcConfig?.SecurityGroupIds as string[],
                },
                publish: true,
                tracingConfig: {
                    mode: lambdaProps.TracingConfig?.Mode as string,
                },
                timeout: lambdaProps.Timeout,
                snapStart: {
                    applyOn: lambdaProps.SnapStart?.ApplyOn as string,
                },
            };

            const lambda = new LambdaFunction(scope, id, mapped);

            lambda.functionName = mapped.functionName || Names.uniqueResourceName(lambda, { maxLength: 64 });

            return lambda;
        },
        unsupportedProps: ["RuntimeManagementConfig", "Code.SourceKMSKeyArn", "RecursiveLoop"],
        attributes: {
            Arn: resource => resource.arn,
            SnapStartResponseApplyOn: resource => resource.snapStart.applyOn,
            SnapStartResponseOptimizationStatus: resource => resource.snapStart.optimizationStatus,
            Ref: resource => resource.id,
            SnapStartResponse: resource => ({
                ApplyOn: resource.snapStart.applyOn,
                OptimizationStatus: resource.snapStart.optimizationStatus,
            } as unknown as IResolvable),
        },
    });

    registerMappingTyped(CfnEventSourceMapping, LambdaEventSourceMapping, {
        resource(scope, id, props) {
            let selfManagedEventSourceLocal: TerraformLocal | undefined = undefined;
            if (props.SelfManagedEventSource?.Endpoints?.KafkaBootstrapServers != null) {
                selfManagedEventSourceLocal = new TerraformLocal(
                    scope,
                    "selfmanaged-kafka-bootstrap-servers",
                    Fn.jsonencode({
                        KAFKA_BOOTSTRAP_SERVERS: (props.SelfManagedEventSource?.Endpoints?.KafkaBootstrapServers != null
                            ? Fn.join(",", props.SelfManagedEventSource?.Endpoints?.KafkaBootstrapServers)
                            : undefined) as string,
                    }),
                );
            }

            return new LambdaEventSourceMapping(
                scope,
                id,
                deleteUndefinedKeys({
                    metricsConfig: {
                        metrics: props?.MetricsConfig?.Metrics as string[],
                    },
                    provisionedPollerConfig: {
                        maximumPollers: props.ProvisionedPollerConfig?.MaximumPollers,
                        minimumPollers: props.ProvisionedPollerConfig?.MinimumPollers,
                    },
                    tags: Object.fromEntries(
                        props.Tags?.map(({
                            Key,
                            Value,
                        }) => [Key, Value]) || [],
                    ),
                    functionName: props.FunctionName as string,
                    maximumRecordAgeInSeconds: props.MaximumRecordAgeInSeconds,
                    eventSourceArn: props.EventSourceArn,
                    batchSize: props.BatchSize,
                    bisectBatchOnFunctionError: props.BisectBatchOnFunctionError,
                    kmsKeyArn: props.KmsKeyArn,
                    destinationConfig: {
                        onFailure: {
                            destinationArn: props.DestinationConfig?.OnFailure?.Destination as string,
                        },
                    },
                    amazonManagedKafkaEventSourceConfig: {
                        consumerGroupId: props.AmazonManagedKafkaEventSourceConfig?.ConsumerGroupId,
                    },
                    documentDbEventSourceConfig: {
                        databaseName: props.DocumentDBEventSourceConfig?.DatabaseName as string,
                        fullDocument: props.DocumentDBEventSourceConfig?.FullDocument,
                        collectionName: props.DocumentDBEventSourceConfig?.CollectionName as string,
                    },
                    filterCriteria: {
                        filter: props.FilterCriteria?.Filters?.map(filter => ({
                            pattern: filter.Pattern,
                        })),
                    },
                    functionResponseTypes: props.FunctionResponseTypes,
                    maximumRetryAttempts: props.MaximumRetryAttempts,
                    parallelizationFactor: props.ParallelizationFactor,
                    startingPosition: props.StartingPosition,
                    startingPositionTimestamp: props.StartingPositionTimestamp != null
                        ? Fn.formatdate("YYYY-MM-DD'T'hh:mm:ssZ", props.StartingPositionTimestamp.toString())
                        : undefined,
                    maximumBatchingWindowInSeconds: props.MaximumBatchingWindowInSeconds,
                    enabled: props.Enabled,
                    selfManagedEventSource: selfManagedEventSourceLocal != null
                        ? {
                            endpoints: Fn.jsondecode(selfManagedEventSourceLocal.asString),
                        }
                        : undefined,
                    queues: props.Queues,
                    sourceAccessConfiguration: props?.SourceAccessConfigurations?.map(config => ({
                        uri: config.URI as string,
                        type: config.Type as string,
                    })),
                    topics: props.Topics,
                    tumblingWindowInSeconds: props.TumblingWindowInSeconds,
                    selfManagedKafkaEventSourceConfig: {
                        consumerGroupId: props.SelfManagedKafkaEventSourceConfig?.ConsumerGroupId,
                    },
                    scalingConfig: {
                        maximumConcurrency: props.ScalingConfig?.MaximumConcurrency,
                    },
                }),
            );
        },
        attributes: {
            Ref: (resource: LambdaEventSourceMapping) => resource.id,
            Id: (resource: LambdaEventSourceMapping) => resource.id,
            EventSourceMappingArn: (resource: LambdaEventSourceMapping) => resource.arn,
        },
    });
}
