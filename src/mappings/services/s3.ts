import { S3BucketAnalyticsConfiguration } from "@cdktf/provider-aws/lib/s3-bucket-analytics-configuration/index.js";
import { S3BucketCorsConfiguration } from "@cdktf/provider-aws/lib/s3-bucket-cors-configuration/index.js";
import {
    S3BucketIntelligentTieringConfiguration,
} from "@cdktf/provider-aws/lib/s3-bucket-intelligent-tiering-configuration/index.js";
import { S3BucketLifecycleConfiguration } from "@cdktf/provider-aws/lib/s3-bucket-lifecycle-configuration/index.js";
import { S3BucketLoggingA } from "@cdktf/provider-aws/lib/s3-bucket-logging/index.js";
import { S3BucketMetric } from "@cdktf/provider-aws/lib/s3-bucket-metric/index.js";
import { S3BucketNotification } from "@cdktf/provider-aws/lib/s3-bucket-notification/index.js";
import { S3BucketObjectLockConfigurationA } from "@cdktf/provider-aws/lib/s3-bucket-object-lock-configuration/index.js";
import { S3BucketOwnershipControls } from "@cdktf/provider-aws/lib/s3-bucket-ownership-controls/index.js";
import { S3BucketPolicy } from "@cdktf/provider-aws/lib/s3-bucket-policy/index.js";
import { S3BucketPublicAccessBlock } from "@cdktf/provider-aws/lib/s3-bucket-public-access-block/index.js";
import { S3BucketReplicationConfigurationA } from "@cdktf/provider-aws/lib/s3-bucket-replication-configuration/index.js";
import {
    S3BucketServerSideEncryptionConfigurationA,
} from "@cdktf/provider-aws/lib/s3-bucket-server-side-encryption-configuration/index.js";
import { S3BucketVersioningA } from "@cdktf/provider-aws/lib/s3-bucket-versioning/index.js";
import { S3BucketWebsiteConfiguration } from "@cdktf/provider-aws/lib/s3-bucket-website-configuration/index.js";
import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket/index.js";
import { Names } from "aws-cdk-lib";
import { CfnBucket, CfnBucketPolicy } from "aws-cdk-lib/aws-s3";
import { Fn } from "cdktf";
import { deleteUndefinedKeys, registerMappingTyped } from "../utils.js";

const BUCKET_WEB_SITE = Symbol("websiteEndpoint");

export function registerS3Mappings() {
    registerMappingTyped(CfnBucketPolicy, S3BucketPolicy, {
        resource(scope, id, props) {
            return new S3BucketPolicy(
                scope,
                id,
                deleteUndefinedKeys({
                    policy: Fn.jsonencode(props.PolicyDocument),
                    bucket: props.Bucket,
                }),
            );
        },
        attributes: {
            Ref: (resource) => resource.id,
        },
    });

    registerMappingTyped(CfnBucket, S3Bucket, {
        resource(scope, id, props) {
            const bucket = new S3Bucket(
                scope,
                id,
                deleteUndefinedKeys({
                    bucket: props?.BucketName,
                    acl: props?.AccessControl,
                    accelerationStatus: props?.AccelerateConfiguration?.AccelerationStatus,
                    name: props?.BucketName,
                    objectLockEnabled: props?.ObjectLockEnabled,
                    tags: Object.fromEntries(
                        props?.Tags?.map(({
                            Key: key,
                            Value: value,
                        }) => [key, value]) || [],
                    ),
                }),
            );

            if (props?.VersioningConfiguration) {
                new S3BucketVersioningA(
                    scope,
                    `${id}-versioning`,
                    deleteUndefinedKeys({
                        bucket: bucket.bucket,
                        versioningConfiguration: {
                            status: props?.VersioningConfiguration?.Status,
                        },
                    }),
                );
            }

            if (props?.ObjectLockConfiguration) {
                new S3BucketObjectLockConfigurationA(
                    scope,
                    `${id}-object-lock`,
                    deleteUndefinedKeys({
                        bucket: bucket.bucket,
                        objectLockEnabled: props?.ObjectLockConfiguration?.ObjectLockEnabled,
                        rule: {
                            defaultRetention: {
                                mode: props?.ObjectLockConfiguration?.Rule?.DefaultRetention?.Mode as string,
                                days: props?.ObjectLockConfiguration?.Rule?.DefaultRetention?.Days as number,
                            },
                        },
                    }),
                );
            }

            if (props?.ReplicationConfiguration) {
                new S3BucketReplicationConfigurationA(
                    scope,
                    `${id}-replication`,
                    deleteUndefinedKeys({
                        bucket: bucket.bucket,
                        role: props?.ReplicationConfiguration?.Role,
                        rule: props?.ReplicationConfiguration?.Rules?.map(rule => ({
                            id: rule.Id,
                            prefix: rule.Prefix,
                            status: rule.Status,
                            destination: {
                                bucket: rule.Destination?.Bucket,
                                storageClass: rule.Destination?.StorageClass,
                            },
                        })) || [],
                    }),
                );
            }

            if (props?.CorsConfiguration) {
                new S3BucketCorsConfiguration(
                    scope,
                    `${id}-cors`,
                    deleteUndefinedKeys({
                        bucket: bucket.bucket,
                        corsRule: props?.CorsConfiguration?.CorsRules?.map(rule => ({
                            allowedHeaders: rule.AllowedHeaders,
                            allowedMethods: rule.AllowedMethods,
                            allowedOrigins: rule.AllowedOrigins,
                            exposeHeaders: rule.ExposedHeaders,
                            maxAgeSeconds: rule.MaxAge,
                        })) || [],
                    }),
                );
            }

            if (props?.PublicAccessBlockConfiguration) {
                new S3BucketPublicAccessBlock(
                    scope,
                    `${id}-public-access-block`,
                    deleteUndefinedKeys({
                        bucket: bucket.bucket,
                        blockPublicAcls: props?.PublicAccessBlockConfiguration?.BlockPublicAcls,
                        blockPublicPolicy: props?.PublicAccessBlockConfiguration?.BlockPublicPolicy,
                        ignorePublicAcls: props?.PublicAccessBlockConfiguration?.IgnorePublicAcls,
                        restrictPublicBuckets: props?.PublicAccessBlockConfiguration?.RestrictPublicBuckets,
                    }),
                );
            }

            if (props?.OwnershipControls) {
                new S3BucketOwnershipControls(
                    scope,
                    `${id}-ownership-controls`,
                    deleteUndefinedKeys({
                        bucket: bucket.bucket,
                        rule: {
                            objectOwnership: props?.OwnershipControls?.Rules?.[0]?.ObjectOwnership as string,
                        },
                    }),
                );
            }

            if (props?.WebsiteConfiguration) {
                const website = new S3BucketWebsiteConfiguration(
                    scope,
                    `${id}-website`,
                    deleteUndefinedKeys({
                        bucket: bucket.bucket,
                        indexDocument: {
                            suffix: props?.WebsiteConfiguration?.IndexDocument as string,
                        },
                        errorDocument: {
                            key: props?.WebsiteConfiguration?.ErrorDocument as string,
                        },
                        redirectAllRequestsTo: props?.WebsiteConfiguration?.RedirectAllRequestsTo
                            ? {
                                hostName: props?.WebsiteConfiguration?.RedirectAllRequestsTo?.HostName,
                                protocol: props?.WebsiteConfiguration?.RedirectAllRequestsTo?.Protocol,
                            }
                            : undefined,
                        routingRules: props?.WebsiteConfiguration?.RoutingRules
                            ? Fn.jsonencode(props?.WebsiteConfiguration?.RoutingRules)
                            : undefined,
                    }),
                );
                (bucket as unknown as { [BUCKET_WEB_SITE]: S3BucketWebsiteConfiguration })[BUCKET_WEB_SITE] = website;
            }

            if (props?.NotificationConfiguration) {
                new S3BucketNotification(
                    scope,
                    `${id}-notification`,
                    deleteUndefinedKeys({
                        bucket: bucket.bucket,
                        queue: props?.NotificationConfiguration?.QueueConfigurations?.map(queueConfig => ({
                            events: [queueConfig.Event],
                            queueArn: queueConfig.Queue,
                            filterPrefix: queueConfig?.Filter?.S3Key?.Rules?.find(rule => rule.Name === "prefix")
                                ?.Value as string,
                            filterSuffix: queueConfig?.Filter?.S3Key?.Rules?.find(rule => rule.Name === "suffix")
                                ?.Value as string,
                        })),
                        lambdaFunction: props?.NotificationConfiguration?.LambdaConfigurations?.map(lambdaConfig => ({
                            events: [lambdaConfig.Event],
                            filterPrefix: lambdaConfig?.Filter?.S3Key?.Rules?.find(rule => rule.Name === "prefix")
                                ?.Value as string,
                            filterSuffix: lambdaConfig?.Filter?.S3Key?.Rules?.find(rule => rule.Name === "suffix")
                                ?.Value as string,
                            lambdaFunctionArn: lambdaConfig.Function,
                        })) || [],
                        eventbridge: props?.NotificationConfiguration?.EventBridgeConfiguration?.EventBridgeEnabled,
                        topic: props?.NotificationConfiguration?.TopicConfigurations?.map(topicConfig => ({
                            events: [topicConfig.Event],
                            topicArn: topicConfig.Topic,
                            filterPrefix: topicConfig?.Filter?.S3Key?.Rules?.find(rule => rule.Name === "prefix")
                                ?.Value as string,
                            filterSuffix: topicConfig?.Filter?.S3Key?.Rules?.find(rule => rule.Name === "suffix")
                                ?.Value as string,
                        })),
                    }),
                );
            }

            if (props?.MetricsConfigurations) {
                for (const [index, metricsConfig] of props.MetricsConfigurations.entries()) {
                    new S3BucketMetric(
                        scope,
                        `${id}-metrics-${index}`,
                        deleteUndefinedKeys({
                            bucket: bucket.bucket,
                            name: Names.uniqueId(bucket) + `-metrics-${index}`,
                            id: metricsConfig?.Id,
                            filter: {
                                accessPoint: metricsConfig?.AccessPointArn,
                                prefix: metricsConfig?.Prefix as string,
                                tags: Object.fromEntries(
                                    metricsConfig?.TagFilters?.map(({
                                        Key: key,
                                        Value: value,
                                    }) => [key, value]) || [],
                                ),
                            },
                        }),
                    );
                }
            }

            if (props?.LoggingConfiguration) {
                new S3BucketLoggingA(
                    scope,
                    `${id}-logging`,
                    deleteUndefinedKeys({
                        bucket: bucket.bucket,
                        targetPrefix: props?.LoggingConfiguration?.LogFilePrefix as string,
                        targetBucket: props?.LoggingConfiguration?.DestinationBucketName as string,
                        targetObjectKeyFormat: {
                            simplePrefix: props?.LoggingConfiguration?.TargetObjectKeyFormat?.SimplePrefix as string,
                            partitionedPrefix: {
                                partitionDateSource: props?.LoggingConfiguration?.TargetObjectKeyFormat
                                    ?.PartitionedPrefix
                                    ?.PartitionDateSource as string,
                            },
                        },
                    }),
                );
            }

            if (props?.InventoryConfigurations) {
                for (const [index, inventoryConfig] of props.InventoryConfigurations.entries()) {
                    new S3BucketAnalyticsConfiguration(
                        bucket,
                        `${id}-inventory-${index}`,
                        deleteUndefinedKeys({
                            bucket: bucket.bucket,
                            name: Names.uniqueId(bucket) + `-inventory-${index}`,
                            destination: {
                                bucket: inventoryConfig?.Destination?.BucketAccountId,
                                format: inventoryConfig?.Destination?.Format,
                                prefix: inventoryConfig?.Destination?.Prefix,
                            },
                            enabled: inventoryConfig?.Enabled,
                            filter: {
                                prefix: inventoryConfig?.Prefix,
                            },
                            schedule: {
                                frequency: inventoryConfig?.ScheduleFrequency,
                            },
                        }),
                    );
                }
            }

            if (props?.IntelligentTieringConfigurations) {
                for (const [index, intelligentTieringConfig] of props.IntelligentTieringConfigurations.entries()) {
                    new S3BucketIntelligentTieringConfiguration(
                        bucket,
                        `${id}-intelligent-tiering-${index}`,
                        deleteUndefinedKeys({
                            bucket: bucket.bucket,
                            name: Names.uniqueId(bucket) + `-intelligent-tiering-${index}`,
                            status: intelligentTieringConfig.Status,
                            filter: {
                                prefix: intelligentTieringConfig?.Prefix as string,
                                tags: Object.fromEntries(
                                    intelligentTieringConfig?.TagFilters?.map(({
                                        Key: key,
                                        Value: value,
                                    }) => [key, value]) || [],
                                ),
                            },
                            tiering: intelligentTieringConfig?.Tierings?.map(tiering => ({
                                days: tiering.Days,
                                accessTier: tiering.AccessTier,
                            })) || [],
                        }),
                    );
                }
            }

            if (props?.AnalyticsConfigurations) {
                for (const [index, analyticsConfig] of props.AnalyticsConfigurations.entries()) {
                    new S3BucketAnalyticsConfiguration(
                        bucket,
                        `${id}-analytics-${index}`,
                        deleteUndefinedKeys({
                            bucket: bucket.bucket,
                            name: Names.uniqueId(bucket) + `-analytics-${index}`,
                            filter: {
                                prefix: analyticsConfig?.Prefix as string,
                                tags: Object.fromEntries(
                                    analyticsConfig?.TagFilters?.map(({
                                        Key: key,
                                        Value: value,
                                    }) => [key, value]) || [],
                                ),
                            },
                        }),
                    );
                }
            }

            if (props?.BucketEncryption?.ServerSideEncryptionConfiguration) {
                new S3BucketServerSideEncryptionConfigurationA(
                    scope,
                    `${id}-encryption`,
                    deleteUndefinedKeys({
                        bucket: bucket.bucket,
                        rule: props?.BucketEncryption?.ServerSideEncryptionConfiguration?.map(rule => ({
                            applyServerSideEncryptionByDefault: {
                                kmsMasterKeyId: rule?.ServerSideEncryptionByDefault?.KmsMasterKeyId as string,
                                sseAlgorithm: rule?.ServerSideEncryptionByDefault?.SSEAlgorithm as string,
                            },
                            bucketKeyEnabled: rule?.BucketKeyEnabled,
                        })),
                    }),
                );
            }

            if (props?.LifecycleConfiguration) {
                new S3BucketLifecycleConfiguration(
                    scope,
                    `${id}-lifecycle`,
                    deleteUndefinedKeys({
                        bucket: bucket.bucket,
                        rule: props?.LifecycleConfiguration?.Rules?.map(rule => ({
                            abortIncompleteMultipartUpload: {
                                daysAfterInitiation: rule?.AbortIncompleteMultipartUpload
                                    ?.DaysAfterInitiation as number,
                            },
                            expiration: {
                                days: rule?.ExpirationInDays as number,
                                date: rule?.ExpirationDate,
                                expiredObjectDeleteMarker: rule?.ExpiredObjectDeleteMarker,
                            },
                            id: rule?.Id as string,
                            status: rule?.Status,
                            prefix: rule?.Prefix,
                            noncurrentVersionExpiration: {
                                newerNoncurrentVersions: rule?.NoncurrentVersionExpiration?.NewerNoncurrentVersions
                                    ?.toString(),
                                noncurrentDays: rule?.NoncurrentVersionExpiration?.NoncurrentDays,
                            },
                            noncurrentVersionTransition: rule?.NoncurrentVersionTransition
                                ? [{
                                    storageClass: rule?.NoncurrentVersionTransition?.StorageClass,
                                    newerNoncurrentVersions: rule?.NoncurrentVersionTransition?.NewerNoncurrentVersions
                                        ?.toString(),
                                    noncurrentDays: rule?.NoncurrentVersionTransition?.TransitionInDays,
                                }]
                                : rule?.NoncurrentVersionTransitions?.map(transition => ({
                                    storageClass: transition.StorageClass,
                                    noncurrentDays: transition.TransitionInDays,
                                    newerNoncurrentVersions: transition.NewerNoncurrentVersions?.toString(),
                                })) || [],
                            transition: rule?.Transition
                                ? [{
                                    storageClass: rule?.Transition?.StorageClass,
                                    date: rule?.Transition?.TransitionDate,
                                    days: rule?.Transition?.TransitionInDays,
                                }]
                                : rule?.Transitions?.map(transition => ({
                                    storageClass: transition?.StorageClass,
                                    date: transition.TransitionDate,
                                    days: transition.TransitionInDays,
                                })) || [],
                            filter: {
                                prefix: rule?.Prefix,
                                and: {
                                    tags: Object.fromEntries(
                                        rule.TagFilters?.map(filter => [filter.Key, filter.Value]) || [],
                                    ),
                                },
                                objectSizeGreaterThan: rule?.ObjectSizeGreaterThan?.toString(),
                                objectSizeLessThan: rule?.ObjectSizeLessThan?.toString(),
                            },
                        })) || [],
                    }),
                );
            }

            return bucket;
        },
        attributes: {
            Ref: (bucket: S3Bucket) => bucket.id,
            Arn: (bucket: S3Bucket) => bucket.arn,
            DomainName: (bucket: S3Bucket) => bucket.bucketDomainName,
            DualStackDomainName: (bucket: S3Bucket) => {
                const region = bucket.region;
                return `${bucket.bucket}.s3.dualstack.${region}.amazonaws.com`;
            },
            WebsiteUrl: (bucket: S3Bucket) => {
                const website =
                    (bucket as unknown as { [BUCKET_WEB_SITE]: S3BucketWebsiteConfiguration })[BUCKET_WEB_SITE];
                return website ? website.websiteEndpoint : "";
            },
            RegionalDomainName: (bucket: S3Bucket) => bucket.bucketRegionalDomainName,
        },
    });
}
