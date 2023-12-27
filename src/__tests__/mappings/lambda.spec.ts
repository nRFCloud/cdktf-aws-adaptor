import { LambdaAlias } from "@cdktf/provider-aws/lib/lambda-alias/index.js";
import { LambdaFunction } from "@cdktf/provider-aws/lib/lambda-function/index.js";
import { LambdaLayerVersionPermission } from "@cdktf/provider-aws/lib/lambda-layer-version-permission/index.js";
import { LambdaLayerVersion } from "@cdktf/provider-aws/lib/lambda-layer-version/index.js";
import { LambdaPermission } from "@cdktf/provider-aws/lib/lambda-permission/index.js";
import {
  CfnAlias,
  CfnFunction,
  CfnLayerVersion,
  CfnLayerVersionPermission,
  CfnPermission,
} from "aws-cdk-lib/aws-lambda";
import { describe } from "vitest";
import { itShouldMapCfnElementToTerraformResource, synthesizeElementAndTestStability } from "../helpers.js";

describe("Lambda mappings", () => {
  itShouldMapCfnElementToTerraformResource(
    CfnPermission,
    {
      action: "lambda:InvokeFunction",
      functionName: "my-function",
      principal: "sns.amazonaws.com",
      sourceArn: "arn:aws:sns:us-east-1:123456789012:my-topic-1a2b3c4d",
      eventSourceToken: "token",
      functionUrlAuthType: "IAM",
      principalOrgId: "123456789012",
      sourceAccount: "123456789012",
    },
    LambdaPermission,
    {
      action: "lambda:InvokeFunction",
      functionName: "my-function",
      principal: "sns.amazonaws.com",
      sourceArn: "arn:aws:sns:us-east-1:123456789012:my-topic-1a2b3c4d",
      eventSourceToken: "token",
      functionUrlAuthType: "IAM",
      principalOrgId: "123456789012",
      sourceAccount: "123456789012",
    },
  );

  itShouldMapCfnElementToTerraformResource(
    CfnLayerVersion,
    {
      compatibleArchitectures: ["x86_64"],
      compatibleRuntimes: ["nodejs12.x"],
      content: {
        s3Bucket: "my-bucket",
        s3Key: "my-key",
        s3ObjectVersion: "my-version",
      },
      description: "my description",
      layerName: "my-layer",
      licenseInfo: "my-license",
    },
    LambdaLayerVersion,
    {
      s3Bucket: "my-bucket",
      s3Key: "my-key",
      s3ObjectVersion: "my-version",
      compatibleArchitectures: ["x86_64"],
      compatibleRuntimes: ["nodejs12.x"],
      description: "my description",
      layerName: "my-layer",
      licenseInfo: "my-license",
    },
  );

  itShouldMapCfnElementToTerraformResource(
    CfnLayerVersionPermission,
    {
      action: "lambda:GetLayerVersion",
      principal: "123456789012",
      organizationId: "o-123456",
      layerVersionArn: "arn:aws:lambda:us-east-1:123456789012:layer:my-layer:1",
    },
    LambdaLayerVersionPermission,
    {
      action: "lambda:GetLayerVersion",
      principal: "123456789012",
      organizationId: "o-123456",
      layerName: "arn:aws:lambda:us-east-1:123456789012:layer:my-layer:1",
      versionNumber:
        `$\{tonumber(element(split(\":\", \"arn:aws:lambda:us-east-1:123456789012:layer:my-layer:1\"), 7))}` as unknown as number,
      statementId: "teststackawstackresourceC278F851",
    },
  );

  it.only("should map CfnAlias to LambdaAlias", () => {
    synthesizeElementAndTestStability(
      CfnAlias,
      {
        description: "description",
        functionName: "functionName",
        functionVersion: "functionVersion",
        name: "name",
        routingConfig: {
          additionalVersionWeights: [
            {
              functionVersion: "1",
              functionWeight: 2,
            },
            {
              functionVersion: "2",
              functionWeight: 1,
            },
          ],
        },
      },
      LambdaAlias,
      {
        description: "description",
        functionName: "functionName",
        functionVersion: "functionVersion",
        name: "name",
        routingConfig: {
          additionalVersionWeights: {
            "1": 2,
            "2": 1,
          },
        },
      },
    );
  });

  it("should map CfnFunction to LambdaFunction", () => {
    synthesizeElementAndTestStability(
      CfnFunction,
      {
        architectures: ["x86_64"],
        code: {
          imageUri: "imageUri",
          s3Bucket: "s3Bucket",
          s3Key: "s3Key",
          s3ObjectVersion: "s3ObjectVersion",
          zipFile: "zipFile",
        },
        deadLetterConfig: {
          targetArn: "targetArn",
        },
        description: "description",
        environment: {
          variables: {
            key: "value",
          },
        },
        fileSystemConfigs: [
          {
            arn: "arn",
            localMountPath: "localMountPath",
          },
        ],
        functionName: "functionName",
        handler: "handler",
        imageConfig: {
          command: ["command"],
          entryPoint: ["entryPoint"],
          workingDirectory: "workingDirectory",
        },
        kmsKeyArn: "kmsKeyArn",
        layers: ["layers"],
        memorySize: 1,
        packageType: "packageType",
        reservedConcurrentExecutions: 1,
        role: "role",
        codeSigningConfigArn: "codeSigningConfigArn",
        ephemeralStorage: {
          size: 1,
        },
        runtime: "runtime",
        timeout: 1,
        tracingConfig: {
          mode: "Active",
        },
        vpcConfig: {
          securityGroupIds: ["securityGroupIds"],
          subnetIds: ["subnetIds"],
        },
        snapStart: {
          applyOn: "1",
        },
        tags: [{
          key: "key",
          value: "value",
        }],
      },
      LambdaFunction,
      {
        s3Bucket: "s3Bucket",
        memorySize: 1,
        reservedConcurrentExecutions: 1,
        runtime: "runtime",
        timeout: 1,
        functionName: "functionName",
        handler: "handler",
        role: "role",
        codeSigningConfigArn: "codeSigningConfigArn",
        imageUri: "imageUri",
        architectures: ["x86_64"],
        deadLetterConfig: {
          targetArn: "targetArn",
        },
        description: "description",
        environment: {
          variables: {
            key: "value",
          },
        },
        ephemeralStorage: {
          size: 1,
        },
        fileSystemConfig: {
          arn: "arn",
          localMountPath: "localMountPath",
        },
        imageConfig: {
          command: ["command"],
          entryPoint: ["entryPoint"],
          workingDirectory: "workingDirectory",
        },
        kmsKeyArn: "kmsKeyArn",
        layers: ["layers"],
        packageType: "packageType",
        vpcConfig: {
          securityGroupIds: ["securityGroupIds"],
          subnetIds: ["subnetIds"],
        },
        publish: true,
        tracingConfig: {
          mode: "Active",
        },
        snapStart: {
          applyOn: "1",
        },
        s3Key: "s3Key",
        s3ObjectVersion: "s3ObjectVersion",
        tags: {
          key: "value",
        },
      },
    );
  });
});
