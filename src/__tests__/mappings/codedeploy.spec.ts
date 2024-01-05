import { CodedeployDeploymentGroup } from "@cdktf/provider-aws/lib/codedeploy-deployment-group";
import { CfnDeploymentGroup } from "aws-cdk-lib/aws-codedeploy";
import { synthesizeElementAndTestStability } from "../helpers.js";

describe("CodeDeploy mappings", () => {
  it("should map CfnFunction to LambdaFunction", () => {
    synthesizeElementAndTestStability(
      CfnDeploymentGroup,
      {
        applicationName: "my-application",
        deploymentConfigName: "CodeDeployDefault.LambdaAllAtOnce",
        deploymentGroupName: "my-deployment-group",
        serviceRoleArn: "arn:aws:iam::123456789012:role/CodeDeployServiceRole",
        autoRollbackConfiguration: {
          enabled: true,
          events: ["DEPLOYMENT_FAILURE"],
        },
        deploymentStyle: {
          deploymentOption: "WITH_TRAFFIC_CONTROL",
          deploymentType: "BLUE_GREEN",
        },
        ec2TagFilters: [
          {
            key: "my-key",
            type: "KEY_AND_VALUE",
            value: "my-value",
          },
        ],
        ec2TagSet: {
          ec2TagSetList: [
            {
              ec2TagGroup: [
                {
                  key: "my-key",
                  type: "KEY_AND_VALUE",
                  value: "my-value",
                },
              ],
            },
          ],
        },
        ecsServices: [
          {
            clusterName: "my-cluster",
            serviceName: "my-service",
          },
        ],
        loadBalancerInfo: {
          elbInfoList: [
            {
              name: "my-elb",
            },
          ],
        },
        onPremisesInstanceTagFilters: [
          {
            key: "my-key",
            type: "KEY_AND_VALUE",
            value: "my-value",
          },
        ],
        triggerConfigurations: [
          {
            triggerEvents: ["DeploymentFailure"],
            triggerName: "my-trigger",
            triggerTargetArn: "arn:aws:sns:us-east-1:123456789012:my-topic",
          },
        ],
      },
      CodedeployDeploymentGroup,
      {
        appName: "my-application",
        deploymentConfigName: "CodeDeployDefault.LambdaAllAtOnce",
        deploymentGroupName: "my-deployment-group",
        serviceRoleArn: "arn:aws:iam::123456789012:role/CodeDeployServiceRole",
        autoRollbackConfiguration: {
          enabled: true,
          events: ["DEPLOYMENT_FAILURE"],
        },
        deploymentStyle: {
          deploymentOption: "WITH_TRAFFIC_CONTROL",
          deploymentType: "BLUE_GREEN",
        },
        ec2TagFilter: [
          {
            key: "my-key",
            type: "KEY_AND_VALUE",
            value: "my-value",
          },
        ],
        ec2TagSet: [{
          ec2TagFilter: [
            {
              key: "my-key",
              type: "KEY_AND_VALUE",
              value: "my-value",
            },
          ],
        }],
        ecsService: {
          clusterName: "my-cluster",
          serviceName: "my-service",
        },
        loadBalancerInfo: {
          elbInfo: [
            {
              name: "my-elb",
            },
          ],
        },
        onPremisesInstanceTagFilter: [
          {
            key: "my-key",
            type: "KEY_AND_VALUE",
            value: "my-value",
          },
        ],
        triggerConfiguration: [
          {
            triggerEvents: ["DeploymentFailure"],
            triggerName: "my-trigger",
            triggerTargetArn: "arn:aws:sns:us-east-1:123456789012:my-topic",
          },
        ],
      },
    );
  });
});
