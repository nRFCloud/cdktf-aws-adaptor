import { SnsTopicSubscription } from "@cdktf/provider-aws/lib/sns-topic-subscription/index.js";
import { CfnSubscription } from "aws-cdk-lib/aws-sns";
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
        },
      );
    });
  });
});
