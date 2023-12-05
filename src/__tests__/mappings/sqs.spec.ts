import { SqsQueuePolicy } from "@cdktf/provider-aws/lib/sqs-queue-policy/index.js";
import { CfnQueuePolicy } from "aws-cdk-lib/aws-sqs";
import { setupJest } from "cdktf/lib/testing/adapters/jest.js";
import { synthesizeElementAndTestStability } from "../helpers.js";

setupJest();

describe("SQS mappings", () => {
  it("should translate", () => {
    const { synth } = synthesizeElementAndTestStability(
      CfnQueuePolicy,
      {
        policyDocument: { read: true },
        queues: [
          "https://sqs:us-east-2.amazonaws.com/444455556666/queue1",
          "https://sqs:us-east-2.amazonaws.com/444455556666/queue2",
        ],
      },
      SqsQueuePolicy,
      {
        policy: "${jsonencode({\"read\" = true})}",
        queueUrl: "https://sqs:us-east-2.amazonaws.com/444455556666/queue2",
      },
    );

    expect(synth).toHaveResourceWithProperties(SqsQueuePolicy, {
      policy: "${jsonencode({\"read\" = true})}",
      queue_url: "https://sqs:us-east-2.amazonaws.com/444455556666/queue1",
    });
  });
});
