import { SnsTopicSubscription } from "@cdktf/provider-aws/lib/sns-topic-subscription/index.js";
import { CfnSubscription } from "aws-cdk-lib/aws-sns";
import { Fn } from "cdktf";
import { deleteUndefinedKeys, registerMappingTyped } from "../utils.js";

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
          deliveryPolicy: Fn.jsonencode(props.DeliveryPolicy),
          filterPolicy: Fn.jsonencode(props.FilterPolicy),
          filterPolicyScope: props.FilterPolicyScope,
          rawMessageDelivery: props.RawMessageDelivery,
          redrivePolicy: Fn.jsonencode(props.RedrivePolicy),
          subscriptionRoleArn: props.SubscriptionRoleArn,
        }),
      );
    },
    unsupportedProps: ["Region"],
    attributes: {
      Id: (resource) => resource.id,
      Ref: (resource) => resource.id,
    },
  });
}
