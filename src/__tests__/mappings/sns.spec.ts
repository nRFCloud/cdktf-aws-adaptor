import { SnsTopicDataProtectionPolicy } from "@cdktf/provider-aws/lib/sns-topic-data-protection-policy/index.js";
import { SnsTopicSubscription } from "@cdktf/provider-aws/lib/sns-topic-subscription/index.js";
import { SnsTopic } from "@cdktf/provider-aws/lib/sns-topic/index.js";
import { CfnSubscription, CfnTopic } from "aws-cdk-lib/aws-sns";
import { setupJest } from "cdktf/lib/testing/adapters/jest.js";
import { synthesizeElementAndTestStability } from "../helpers.js";

setupJest();

describe("SNS mappings", () => {
    describe("AWS:SNS:Subscription", () => {
        it("should translate", () => {
            synthesizeElementAndTestStability(
                CfnSubscription,
                {
                    endpoint: "example-endpoint.example",
                    protocol: "https",
                    topicArn: "ExampleArn",
                    deliveryPolicy: { deliveryPolicy: true },
                    filterPolicy: { filterPolicy: false },
                    filterPolicyScope: "FilterPolicyScope",
                    rawMessageDelivery: true,
                    redrivePolicy: { redrivePolicy: true },
                    replayPolicy: { replayPolicy: true },
                    subscriptionRoleArn: "SubscriptionRoleArn",
                    region: "us-east-1",
                },
                SnsTopicSubscription,
                {
                    endpoint: "example-endpoint.example",
                    protocol: "https",
                    topicArn: "ExampleArn",
                    deliveryPolicy: "${jsonencode({\"deliveryPolicy\" = true})}",
                    filterPolicy: "${jsonencode({\"filterPolicy\" = false})}",
                    filterPolicyScope: "FilterPolicyScope",
                    rawMessageDelivery: true,
                    redrivePolicy: "${jsonencode({\"redrivePolicy\" = true})}",
                    subscriptionRoleArn: "SubscriptionRoleArn",
                    replayPolicy: "${jsonencode({\"replayPolicy\" = true})}",
                    confirmationTimeoutInMinutes: undefined,
                    endpointAutoConfirms: undefined,
                },
                ["region"],
            );
        });
    });

    describe("AWS:SNS:Topic", () => {
        it("Should translate", () => {
            const { synth } = synthesizeElementAndTestStability(
                CfnTopic,
                {
                    fifoThroughputScope: "fifo-throughput-scope",
                    topicName: "ExampleTopic",
                    archivePolicy: { archivePolicy: true },
                    dataProtectionPolicy: { dataProtectionPolicy: true },
                    deliveryStatusLogging: [{
                        protocol: "https",
                        failureFeedbackRoleArn: "FailureFeedbackRoleArnHttps",
                        successFeedbackRoleArn: "SuccessFeedbackRoleArnHttps",
                        successFeedbackSampleRate: "1",
                    }, {
                        protocol: "sqs",
                        failureFeedbackRoleArn: "FailureFeedbackRoleArnsqs",
                        successFeedbackRoleArn: "SuccessFeedbackRoleArnsqs",
                        successFeedbackSampleRate: "2",
                    }, {
                        protocol: "lambda",
                        failureFeedbackRoleArn: "FailureFeedbackRoleArnlambda",
                        successFeedbackRoleArn: "SuccessFeedbackRoleArnlambda",
                        successFeedbackSampleRate: "3",
                    }, {
                        protocol: "application",
                        failureFeedbackRoleArn: "FailureFeedbackRoleArnapplication",
                        successFeedbackRoleArn: "SuccessFeedbackRoleArnapplication",
                        successFeedbackSampleRate: "4",
                    }, {
                        protocol: "firehose",
                        failureFeedbackRoleArn: "FailureFeedbackRoleArnfirehose",
                        successFeedbackRoleArn: "SuccessFeedbackRoleArnfirehose",
                        successFeedbackSampleRate: "5",
                    }],
                    displayName: "ExampleDisplayName",
                    fifoTopic: true,
                    tags: [{
                        key: "ExampleKey",
                        value: "ExampleValue",
                    }],
                    subscription: [{
                        protocol: "https",
                        endpoint: "example-endpoint.example",
                    }],
                    kmsMasterKeyId: "ExampleKmsMasterKeyId",
                    signatureVersion: "1",
                    tracingConfig: "PASSTHROUGH",
                    contentBasedDeduplication: true,
                },
                SnsTopic,
                {
                    name: "ExampleTopic",
                    archivePolicy: "${jsonencode({\"archivePolicy\" = true})}",
                    applicationFailureFeedbackRoleArn: "FailureFeedbackRoleArnapplication",
                    applicationSuccessFeedbackRoleArn: "SuccessFeedbackRoleArnapplication",
                    applicationSuccessFeedbackSampleRate: 4,
                    firehoseFailureFeedbackRoleArn: "FailureFeedbackRoleArnfirehose",
                    firehoseSuccessFeedbackRoleArn: "SuccessFeedbackRoleArnfirehose",
                    firehoseSuccessFeedbackSampleRate: 5,
                    httpSuccessFeedbackSampleRate: 1,
                    httpFailureFeedbackRoleArn: "FailureFeedbackRoleArnHttps",
                    httpSuccessFeedbackRoleArn: "SuccessFeedbackRoleArnHttps",
                    lambdaSuccessFeedbackSampleRate: 3,
                    lambdaFailureFeedbackRoleArn: "FailureFeedbackRoleArnlambda",
                    lambdaSuccessFeedbackRoleArn: "SuccessFeedbackRoleArnlambda",
                    sqsSuccessFeedbackSampleRate: 2,
                    sqsFailureFeedbackRoleArn: "FailureFeedbackRoleArnsqs",
                    sqsSuccessFeedbackRoleArn: "SuccessFeedbackRoleArnsqs",
                    displayName: "ExampleDisplayName",
                    fifoTopic: true,
                    tags: { ExampleKey: "ExampleValue" },
                    kmsMasterKeyId: "ExampleKmsMasterKeyId",
                    signatureVersion: 1,
                    tracingConfig: "PASSTHROUGH",
                    contentBasedDeduplication: true,
                },
                ["fifoThroughputScope"],
            );

            expect(synth).toHaveResourceWithProperties(SnsTopicDataProtectionPolicy, {
                "arn": "${aws_sns_topic.resource_22C949BF.arn}",
                "policy": "${jsonencode({\"dataProtectionPolicy\" = true})}",
            });

            expect(synth).toHaveResourceWithProperties(SnsTopicSubscription, {
                "endpoint": "example-endpoint.example",
                "protocol": "https",
                "topic_arn": "${aws_sns_topic.resource_22C949BF.arn}",
            });
        });
    });
});
