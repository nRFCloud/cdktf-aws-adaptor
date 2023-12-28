import {
  CodedeployDeploymentGroup,
  CodedeployDeploymentGroupConfig,
} from "@cdktf/provider-aws/lib/codedeploy-deployment-group/index.js";
import { Names } from "aws-cdk-lib";
import { CfnDeploymentGroup } from "aws-cdk-lib/aws-codedeploy";
import { registerMappingTyped } from "../utils.js";

export function registerCodedeployMappings() {
  registerMappingTyped(CfnDeploymentGroup, CodedeployDeploymentGroup, {
    resource: (scope, id, props): CodedeployDeploymentGroup => {
      const mapped: CodedeployDeploymentGroupConfig = {
        alarmConfiguration: {
          alarms: props.AlarmConfiguration?.Alarms?.reduce((acc: string[], alarm) => {
            if (alarm.Name !== undefined) {
              acc.push(alarm.Name);
            }
            return acc;
          }, []),
          enabled: props.AlarmConfiguration?.Enabled,
          ignorePollAlarmFailure: props.AlarmConfiguration?.IgnorePollAlarmFailure,
        },
        appName: props.ApplicationName,
        autoRollbackConfiguration: {
          enabled: props.AutoRollbackConfiguration?.Enabled,
          events: props.AutoRollbackConfiguration?.Events,
        },
        autoscalingGroups: props.AutoScalingGroups,
        blueGreenDeploymentConfig: {
          deploymentReadyOption: {
            actionOnTimeout: props.BlueGreenDeploymentConfiguration?.DeploymentReadyOption?.ActionOnTimeout,
            waitTimeInMinutes: props.BlueGreenDeploymentConfiguration?.DeploymentReadyOption?.WaitTimeInMinutes,
          },
          greenFleetProvisioningOption: {
            action: props.BlueGreenDeploymentConfiguration?.GreenFleetProvisioningOption?.Action,
          },
          terminateBlueInstancesOnDeploymentSuccess: {
            action: props.BlueGreenDeploymentConfiguration?.TerminateBlueInstancesOnDeploymentSuccess?.Action,
            terminationWaitTimeInMinutes: props.BlueGreenDeploymentConfiguration
              ?.TerminateBlueInstancesOnDeploymentSuccess?.TerminationWaitTimeInMinutes,
          },
        },
        deploymentGroupName: props.DeploymentGroupName || Names.uniqueResourceName(scope, { maxLength: 32 }),
        deploymentConfigName: props.DeploymentConfigName,
        deploymentStyle: {
          deploymentOption: props.DeploymentStyle?.DeploymentOption,
          deploymentType: props.DeploymentStyle?.DeploymentType,
        },
        ec2TagFilter: props.Ec2TagFilters?.map(({ Key, Type, Value }) => ({
          key: Key,
          type: Type,
          value: Value,
        })),
        ec2TagSet: props.Ec2TagSet?.Ec2TagSetList?.map(({ Ec2TagGroup }) => ({
          ec2TagFilter: Ec2TagGroup?.map(({ Key, Type, Value }) => ({
            key: Key,
            type: Type,
            value: Value,
          })),
        })),
        ecsService: props.ECSServices
          ? {
            clusterName: props.ECSServices?.[0].ClusterName,
            serviceName: props.ECSServices?.[0].ServiceName,
          }
          : undefined, // TODO: support multiple ECS services? why does CDKTF only support one?
        loadBalancerInfo: props.LoadBalancerInfo
          ? {
            elbInfo: props.LoadBalancerInfo?.ElbInfoList?.map(({ Name }) => ({
              name: Name,
            })),
          }
          : undefined,
        onPremisesInstanceTagFilter: props.OnPremisesInstanceTagFilters?.map(({ Key, Type, Value }) => ({
          key: Key,
          type: Type,
          value: Value,
        })),
        outdatedInstancesStrategy: props.OutdatedInstancesStrategy,
        serviceRoleArn: props.ServiceRoleArn,
        tags: Object.fromEntries(props.Tags?.map(({ Key, Value }) => [Key, Value]) || []),
        triggerConfiguration: props.TriggerConfigurations?.map(({ TriggerEvents, TriggerName, TriggerTargetArn }) => ({
          triggerEvents: TriggerEvents as string[],
          triggerName: TriggerName as string,
          triggerTargetArn: TriggerTargetArn as string,
        })),
      };
      return new CodedeployDeploymentGroup(
        scope,
        id,
        mapped,
      );
    },
    unsupportedProps: [
      "Deployment",
      "OnPremisesTagSet",
    ],
    attributes: {
      Id: (deploymentGroup: CodedeployDeploymentGroup) => deploymentGroup.id,
      Ref: (deploymentGroup: CodedeployDeploymentGroup) => deploymentGroup.id,
    },
  });
}
