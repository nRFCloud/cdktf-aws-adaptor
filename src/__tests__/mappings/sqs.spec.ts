import { SqsQueuePolicy } from "@cdktf/provider-aws/lib/sqs-queue-policy/index.js";
import { CfnQueuePolicy } from "aws-cdk-lib/aws-sqs";
import { setupJest } from "cdktf/lib/testing/adapters/jest.js";
import { synthesizeElementAndTestStability } from "../helpers.js";

setupJest();

describe("SQS mappings", () => {
  describe("AWS:SQS:QueuePolicy", () => {
    const queueUrl1 = "https://sqs:us-east-2.amazonaws.com/444455556666/queue1";
    const queueUrl2 = "https://sqs:us-east-2.amazonaws.com/444455556666/queue2";
    it("should translate to single SqsQueuePolicy", () => {
      const { synth } = synthesizeElementAndTestStability(
        CfnQueuePolicy,
        {
          policyDocument: { read: true },
          queues: [queueUrl1],
        },
        SqsQueuePolicy,
        {
          policy: "${jsonencode({\"read\" = true})}",
          queueUrl: queueUrl1,
        },
      );

      expect(synth).toHaveResourceWithProperties(SqsQueuePolicy, {
        policy: "${jsonencode({\"read\" = true})}",
        queue_url: queueUrl1,
      });
    });

    it("should translate to multiple SqsQueuePolicy", () => {
      const { synth } = synthesizeElementAndTestStability(
        CfnQueuePolicy,
        {
          policyDocument: { read: true },
          queues: [queueUrl1, queueUrl2],
        },
        SqsQueuePolicy,
        {
          policy: "${jsonencode({\"read\" = true})}",
          queueUrl: queueUrl2,
        },
      );

      expect(synth).toHaveResourceWithProperties(SqsQueuePolicy, {
        policy: "${jsonencode({\"read\" = true})}",
        queue_url: queueUrl1,
      });
    });
  });
});
