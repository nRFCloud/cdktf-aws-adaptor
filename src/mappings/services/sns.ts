import { SnsTopicSubscription } from "@cdktf/provider-aws/lib/sns-topic-subscription/index.js";
import { CfnSubscription } from "aws-cdk-lib/aws-sns";
import { Fn } from "cdktf";
import { createGenericCCApiMapping, deleteUndefinedKeys, registerMapping, registerMappingTyped } from "../utils.js";

export function registerSnsMappings() {
  registerMappingTyped(CfnSubscription, SnsTopicSubscription, {
    resource(scope, id, props) {
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
      Id: (resource) => resource.id,
      Ref: (resource) => resource.id,
    },
  });

  registerMapping("AWS::SNS::Topic", createGenericCCApiMapping("AWS::SNS::Topic"));
}
