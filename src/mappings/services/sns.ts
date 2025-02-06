import { SnsTopicDataProtectionPolicy } from "@cdktf/provider-aws/lib/sns-topic-data-protection-policy/index.js";
import { SnsTopicSubscription } from "@cdktf/provider-aws/lib/sns-topic-subscription/index.js";
import { SnsTopic, SnsTopicConfig } from "@cdktf/provider-aws/lib/sns-topic/index.js";
import { CfnSubscription, CfnTopic } from "aws-cdk-lib/aws-sns";
import { Fn } from "cdktf";
import { deleteUndefinedKeys, registerMappingTyped } from "../utils.js";

export function registerSnsMappings() {
    registerMappingTyped(CfnSubscription, SnsTopicSubscription, {
        resource(scope, id, props, proxy) {
            proxy.touchPath("DeliveryPolicy");
            proxy.touchPath("FilterPolicy");
            proxy.touchPath("RedrivePolicy");
            proxy.touchPath("ReplayPolicy");
            return new SnsTopicSubscription(
                scope,
                id,
                deleteUndefinedKeys({
                    endpoint: props.Endpoint!,
                    protocol: props.Protocol,
                    topicArn: props.TopicArn,
                    deliveryPolicy: props.DeliveryPolicy && Fn.jsonencode(props.DeliveryPolicy),
                    filterPolicy: props.FilterPolicy && Fn.jsonencode(props.FilterPolicy),
                    filterPolicyScope: props.FilterPolicyScope,
                    rawMessageDelivery: props.RawMessageDelivery,
                    redrivePolicy: props.RedrivePolicy && Fn.jsonencode(props.RedrivePolicy),
                    subscriptionRoleArn: props.SubscriptionRoleArn,
                    replayPolicy: props.ReplayPolicy && Fn.jsonencode(props.ReplayPolicy),
                }),
            );
        },
        unsupportedProps: ["Region"],
        attributes: {
            Arn: (resource) => resource.arn,
            Ref: (resource) => resource.id,
        },
    });

    registerMappingTyped(CfnTopic, SnsTopic, {
        resource(scope, id, props, proxy) {
            proxy.touchPath("ArchivePolicy");
            proxy.touchPath("DataProtectionPolicy");

            let topicConfig: SnsTopicConfig = {
                name: props?.TopicName,

                displayName: props?.DisplayName,
                kmsMasterKeyId: props?.KmsMasterKeyId,
                archivePolicy: props?.ArchivePolicy && Fn.jsonencode(props.ArchivePolicy),
                fifoTopic: props?.FifoTopic,
                contentBasedDeduplication: props?.ContentBasedDeduplication,
                tracingConfig: props?.TracingConfig,
                tags: Object.fromEntries(
                    props?.Tags?.map(({
                        Key,
                        Value,
                    }) => [Key, Value]) || [],
                ),
                signatureVersion: props?.SignatureVersion ? +props.SignatureVersion : undefined,
            };

            const httpDeliveryLogging = props?.DeliveryStatusLogging?.find(item =>
                item.Protocol === "https" || item.Protocol === "http"
            );
            if (httpDeliveryLogging) {
                topicConfig = {
                    ...topicConfig,
                    httpFailureFeedbackRoleArn: httpDeliveryLogging.FailureFeedbackRoleArn,
                    httpSuccessFeedbackRoleArn: httpDeliveryLogging.SuccessFeedbackRoleArn,
                    httpSuccessFeedbackSampleRate: httpDeliveryLogging.SuccessFeedbackSampleRate
                        ? +httpDeliveryLogging.SuccessFeedbackSampleRate
                        : undefined,
                };
            }

            const sqsDeliveryLogging = props?.DeliveryStatusLogging?.find(item => item.Protocol === "sqs");
            if (sqsDeliveryLogging) {
                topicConfig = {
                    ...topicConfig,
                    sqsFailureFeedbackRoleArn: sqsDeliveryLogging.FailureFeedbackRoleArn,
                    sqsSuccessFeedbackRoleArn: sqsDeliveryLogging.SuccessFeedbackRoleArn,
                    sqsSuccessFeedbackSampleRate: sqsDeliveryLogging.SuccessFeedbackSampleRate
                        ? +sqsDeliveryLogging.SuccessFeedbackSampleRate
                        : undefined,
                };
            }

            const lambdaDeliveryLogging = props?.DeliveryStatusLogging?.find(item => item.Protocol === "lambda");
            if (lambdaDeliveryLogging) {
                topicConfig = {
                    ...topicConfig,
                    lambdaFailureFeedbackRoleArn: lambdaDeliveryLogging.FailureFeedbackRoleArn,
                    lambdaSuccessFeedbackRoleArn: lambdaDeliveryLogging.SuccessFeedbackRoleArn,
                    lambdaSuccessFeedbackSampleRate: lambdaDeliveryLogging.SuccessFeedbackSampleRate
                        ? +lambdaDeliveryLogging.SuccessFeedbackSampleRate
                        : undefined,
                };
            }

            const applicationDeliveryLogging = props?.DeliveryStatusLogging?.find(item =>
                item.Protocol === "application"
            );
            if (applicationDeliveryLogging) {
                topicConfig = {
                    ...topicConfig,
                    applicationFailureFeedbackRoleArn: applicationDeliveryLogging.FailureFeedbackRoleArn,
                    applicationSuccessFeedbackRoleArn: applicationDeliveryLogging.SuccessFeedbackRoleArn,
                    applicationSuccessFeedbackSampleRate: applicationDeliveryLogging.SuccessFeedbackSampleRate
                        ? +applicationDeliveryLogging.SuccessFeedbackSampleRate
                        : undefined,
                };
            }

            const firehoseDeliveryLogging = props?.DeliveryStatusLogging?.find(item => item.Protocol === "firehose");
            if (firehoseDeliveryLogging) {
                topicConfig = {
                    ...topicConfig,
                    firehoseFailureFeedbackRoleArn: firehoseDeliveryLogging.FailureFeedbackRoleArn,
                    firehoseSuccessFeedbackRoleArn: firehoseDeliveryLogging.SuccessFeedbackRoleArn,
                    firehoseSuccessFeedbackSampleRate: firehoseDeliveryLogging.SuccessFeedbackSampleRate
                        ? +firehoseDeliveryLogging.SuccessFeedbackSampleRate
                        : undefined,
                };
            }

            // if (props?.DeliveryStatusLogging?.find(item => item.Protocol === "https" || item.Protocol === "http")) {
            //     topicConfig.httpFailureFeedbackRoleArn
            // }
            const topic = new SnsTopic(
                scope,
                id,
                deleteUndefinedKeys(topicConfig),
            );

            if (props?.DataProtectionPolicy) {
                new SnsTopicDataProtectionPolicy(scope, `${id}-data-protection-policy`, {
                    arn: topic.arn,
                    policy: Fn.jsonencode(props.DataProtectionPolicy),
                });
            }

            for (const subscription of props?.Subscription || []) {
                new SnsTopicSubscription(
                    topic,
                    `subscription-${subscription.Protocol}-${subscription.Endpoint}`,
                    deleteUndefinedKeys({
                        endpoint: subscription.Endpoint!,
                        protocol: subscription.Protocol,
                        topicArn: topic.arn,
                    }),
                );
            }

            return topic;
        },
        unsupportedProps: ["FifoThroughputScope"],
        attributes: {
            TopicName: (resource) => resource.name,
            TopicArn: (resource) => resource.arn,
            Ref: resource => resource.id,
        },
    });
}
