import { CloudwatchEventRule, CloudwatchEventRuleConfig } from "@cdktf/provider-aws/lib/cloudwatch-event-rule/index.js";
import {
  CloudwatchEventTarget,
  CloudwatchEventTargetConfig,
} from "@cdktf/provider-aws/lib/cloudwatch-event-target/index.js";
import { CfnRule } from "aws-cdk-lib/aws-events";
import { deleteUndefinedKeys, registerMappingTyped } from "../utils.js";

export function registerEventsMappings() {
  registerMappingTyped(CfnRule, CloudwatchEventRule, {
    resource: (scope, id, cfnProps) => {
      const props: CloudwatchEventRuleConfig = {
        name: cfnProps?.Name,
        roleArn: cfnProps?.RoleArn,
        scheduleExpression: cfnProps?.ScheduleExpression,
        eventPattern: JSON.stringify(cfnProps?.EventPattern),
        description: cfnProps?.Description,
        eventBusName: cfnProps?.EventBusName,
        isEnabled: cfnProps?.State === "ENABLED",
      };

      const rule = new CloudwatchEventRule(scope, id, props);

      (cfnProps?.Targets || []).map((target, idx: number) => {
        const targetProps: CloudwatchEventTargetConfig = {
          arn: target.Arn,
          input: target.Input,
          inputPath: target.InputPath,
          inputTransformer: {
            inputTemplate: target.InputTransformer?.InputTemplate as string,
            inputPaths: target.InputTransformer?.InputPathsMap,
          },
          rule: rule.id,
          roleArn: target.RoleArn,
          targetId: target.Id,
          eventBusName: props.eventBusName,
          batchTarget: {
            arraySize: target.BatchParameters?.ArrayProperties?.Size,
            jobAttempts: target.BatchParameters?.RetryStrategy?.Attempts,
            jobName: target.BatchParameters?.JobName as string,
            jobDefinition: target.BatchParameters?.JobDefinition as string,
          },
          httpTarget: {
            headerParameters: target.HttpParameters?.HeaderParameters,
            pathParameterValues: target.HttpParameters?.PathParameterValues,
            queryStringParameters: target.HttpParameters?.QueryStringParameters,
          },
          ecsTarget: {
            enableEcsManagedTags: target.EcsParameters?.EnableECSManagedTags,
            group: target.EcsParameters?.Group,
            launchType: target.EcsParameters?.LaunchType,
            networkConfiguration: {
              // if "ENABLED" then true, if "DISABLED" then false, else undefined
              assignPublicIp: target.EcsParameters?.NetworkConfiguration?.AwsVpcConfiguration?.AssignPublicIp
                  === "ENABLED"
                ? true
                : (target.EcsParameters?.NetworkConfiguration?.AwsVpcConfiguration?.AssignPublicIp === "DISABLED"
                  ? false
                  : undefined),
              subnets: target.EcsParameters?.NetworkConfiguration?.AwsVpcConfiguration?.Subnets as string[],
              securityGroups: target.EcsParameters?.NetworkConfiguration?.AwsVpcConfiguration?.SecurityGroups,
            },
            enableExecuteCommand: target.EcsParameters?.EnableExecuteCommand,
            orderedPlacementStrategy: target.EcsParameters?.PlacementStrategies?.map((strategy) => ({
              field: strategy.Field,
              type: strategy.Type as string,
            })),
            placementConstraint: target.EcsParameters?.PlacementConstraints?.map((constraint) => ({
              type: constraint.Type as string,
              expression: constraint.Expression,
            })),
            platformVersion: target.EcsParameters?.PlatformVersion,
            taskCount: target.EcsParameters?.TaskCount,
            taskDefinitionArn: target.EcsParameters?.TaskDefinitionArn as string,
            propagateTags: target.EcsParameters?.PropagateTags,
            tags: Object.fromEntries(
              target.EcsParameters?.TagList?.map(({ Key: key, Value: value }) => [key, value]) || [],
            ),
            capacityProviderStrategy: target.EcsParameters?.CapacityProviderStrategy?.map((strategy) => ({
              capacityProvider: strategy.CapacityProvider,
              base: strategy.Base,
              weight: strategy.Weight,
            })),
          },
          sqsTarget: {
            messageGroupId: target.SqsParameters?.MessageGroupId,
          },
          retryPolicy: {
            maximumRetryAttempts: target.RetryPolicy?.MaximumRetryAttempts,
            maximumEventAgeInSeconds: target.RetryPolicy?.MaximumEventAgeInSeconds,
          },
          kinesisTarget: {
            partitionKeyPath: target.KinesisParameters?.PartitionKeyPath,
          },
          redshiftTarget: {
            sql: target.RedshiftDataParameters?.Sql,
            database: target.RedshiftDataParameters?.Database as string,
            dbUser: target.RedshiftDataParameters?.DbUser,
            secretsManagerArn: target.RedshiftDataParameters?.SecretManagerArn,
            statementName: target.RedshiftDataParameters?.StatementName,
            withEvent: target.RedshiftDataParameters?.WithEvent,
          },
          deadLetterConfig: {
            arn: target.DeadLetterConfig?.Arn,
          },
          runCommandTargets: target.RunCommandParameters?.RunCommandTargets?.map((runCommandTarget) => ({
            key: runCommandTarget.Key,
            values: runCommandTarget.Values,
          })),
          sagemakerPipelineTarget: {
            pipelineParameterList: target.SageMakerPipelineParameters?.PipelineParameterList?.map((
              pipelineParameter,
            ) => ({
              name: pipelineParameter.Name,
              value: pipelineParameter.Value,
            })),
          },
        };

        return new CloudwatchEventTarget(rule, `target${idx}`, deleteUndefinedKeys(targetProps));
      });

      return rule;
    },
    attributes: {
      Ref: (rule: CloudwatchEventRule) => rule.id,
      Arn: (rule: CloudwatchEventRule) => rule.arn,
    },
  });
}
