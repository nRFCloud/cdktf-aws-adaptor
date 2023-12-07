import { SqsQueuePolicy, SqsQueuePolicyConfig } from "@cdktf/provider-aws/lib/sqs-queue-policy/index.js";
import { CfnQueuePolicy } from "aws-cdk-lib/aws-sqs";
import { Fn } from "cdktf";
import { registerMappingTyped } from "../utils.js";

export function registerSqsMappings() {
  registerMappingTyped(CfnQueuePolicy, SqsQueuePolicy, {
    resource(scope, id, props) {
      console.log(id);
      console.log(props);
      const policiesEncoded = Fn.jsonencode(props.PolicyDocument);
      const sqsQueuePolicies = props.Queues.map((queue): SqsQueuePolicyConfig => ({
        policy: policiesEncoded,
        queueUrl: queue,
      })).map((queuePolicyConfig, index) =>
        new SqsQueuePolicy(scope, index === props.Queues.length - 1 ? id : id + index, queuePolicyConfig)
      );

      for (const [index, sqsQueuePolicy] of sqsQueuePolicies.entries()) {
        const prevConfig = sqsQueuePolicies[index - 1];
        if (prevConfig) {
          sqsQueuePolicy.node.addDependency(prevConfig);
        }
      }
      console.log(sqsQueuePolicies);
      return sqsQueuePolicies.at(-1)!;
    },
    attributes: {
      Id: (resource) => resource.id,
      Ref: (resource) => resource.id,
    },
  });
}
