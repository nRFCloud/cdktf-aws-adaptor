import { SqsQueuePolicy, SqsQueuePolicyConfig } from "@cdktf/provider-aws/lib/sqs-queue-policy";
import { CfnQueuePolicy } from "aws-cdk-lib/aws-sqs";
import { Fn } from "cdktf";
import { registerMappingTyped } from "../utils.js";

export function registerSqsMappings() {
  registerMappingTyped(CfnQueuePolicy, SqsQueuePolicy, {
    resource(scope, id, config) {
      const configEncoded = Fn.jsonencode(config.PolicyDocument);
      const configs = config.Queues.map((queue): SqsQueuePolicyConfig => ({
        policy: configEncoded,
        queueUrl: queue,
      })).map((queuePolicyConfig, index, configs) =>
        new SqsQueuePolicy(scope, index === configs.length - 1 ? id : id + index, queuePolicyConfig)
      );
      configs.forEach((config, index) => {
        const prevConfig = configs[index - 1];
        if (prevConfig) {
          config.node.addDependency(prevConfig);
        }
      });

      return configs.at(-1)!;
    },
    attributes: {
      Id: (resource) => resource.id,
      Ref: (ref) => ref.id,
    },
  });
}
