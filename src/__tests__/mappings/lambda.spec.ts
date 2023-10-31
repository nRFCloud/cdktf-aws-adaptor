import { LambdaLayerVersionPermission } from "@cdktf/provider-aws/lib/lambda-layer-version-permission/index.js";
import { LambdaLayerVersion } from "@cdktf/provider-aws/lib/lambda-layer-version/index.js";
import { LambdaPermission } from "@cdktf/provider-aws/lib/lambda-permission/index.js";
import { CfnLayerVersion, CfnLayerVersionPermission, CfnPermission } from "aws-cdk-lib/aws-lambda";
import { describe } from "vitest";
import { itShouldMapCfnElementToTerraformResource } from "../helpers.js";

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
});
