import { ApiGatewayAccount } from "@cdktf/provider-aws/lib/api-gateway-account/index.js";
import { ApiGatewayBasePathMapping } from "@cdktf/provider-aws/lib/api-gateway-base-path-mapping/index.js";
import { CloudcontrolapiResource } from "@cdktf/provider-aws/lib/cloudcontrolapi-resource/index.js";
import { CfnAccount, CfnBasePathMapping, CfnDeployment, CfnStage } from "aws-cdk-lib/aws-apigateway";
import { setupJest } from "cdktf/lib/testing/adapters/jest.js";
import { registerMappings } from "../../mappings/index.js";
import { synthesizeElementAndTestStability } from "../helpers.js";

setupJest();
registerMappings();

describe("Apigateway mappings", () => {
  it("should map AWS::ApiGateway::Account", () => {
    synthesizeElementAndTestStability(
      CfnAccount,
      {
        cloudWatchRoleArn: "cw-role-arn",
      },
      ApiGatewayAccount,
      {
        cloudwatchRoleArn: "cw-role-arn",
      },
    );
  });

  it("should map AWS::ApiGateway::Deployment", () => {
    synthesizeElementAndTestStability(
      CfnDeployment,
      {
        restApiId: "rest-api-id",
        stageName: "stage-name",
        description: "description",
        stageDescription: {
          creationStack: ["stack"],
          cacheClusterEnabled: true,
          cacheClusterSize: "cache-cluster-size",
          canarySetting: {
            percentTraffic: 50,
            stageVariableOverrides: {
              "stage-variable": "stage-variable-value",
            },
          },
          accessLogSetting: {
            destinationArn: "destination-arn",
          },
          cacheDataEncrypted: true,
          cacheTtlInSeconds: 60,
          cachingEnabled: true,
          clientCertificateId: "client-certificate-id",
          dataTraceEnabled: true,
          loggingLevel: "logging-level",
          metricsEnabled: true,
          documentationVersion: "documentation-version",
          tracingEnabled: true,
          methodSettings: [
            {
              dataTraceEnabled: true,
              httpMethod: "http-method",
              loggingLevel: "logging-level",
              metricsEnabled: true,
              resourcePath: "resource-path",
              throttlingBurstLimit: 60,
              throttlingRateLimit: 60,
              cachingEnabled: true,
              cacheDataEncrypted: true,
              cacheTtlInSeconds: 60,
            },
          ],
          throttlingBurstLimit: 60,
          throttlingRateLimit: 60,
        },
        deploymentCanarySettings: {
          percentTraffic: 50,
          stageVariableOverrides: {
            "stage-variable": "stage-variable-value",
          },
          creationStack: ["stack"],
          useStageCache: true,
        },
      },
      CloudcontrolapiResource,
      {
        typeName: "AWS::ApiGateway::Deployment",
        desiredState: expect.stringContaining(""),
      },
    );
  });

  it("should map AWS::ApiGateway::Stage", () => {
    synthesizeElementAndTestStability(
      CfnStage,
      {
        accessLogSetting: {
          destinationArn: "destination-arn",
        },
        cacheClusterEnabled: true,
        cacheClusterSize: "cache-cluster-size",
        canarySetting: {
          percentTraffic: 50,
          stageVariableOverrides: {
            "stage-variable": "stage-variable-value",
          },
        },
        clientCertificateId: "client-certificate-id",
        stageName: "stage-name",
        description: "description",
        documentationVersion: "documentation-version",
        tracingEnabled: true,
        methodSettings: [],
        restApiId: "rest-api-id",
        deploymentId: "deployment-id",
      },
      CloudcontrolapiResource,
      {
        typeName: "AWS::ApiGateway::Stage",
        desiredState: expect.stringContaining(""),
      },
    );
  });

  it("should map AWS::ApiGateway::BasePathMapping", () => {
    synthesizeElementAndTestStability(
      CfnBasePathMapping,
      {
        restApiId: "rest-api-id",
        basePath: "base-path",
        domainName: "domain-name",
        stage: "stage",
        id: "id",
      },
      ApiGatewayBasePathMapping,
      {
        apiId: "rest-api-id",
        basePath: "base-path",
        domainName: "domain-name",
        stageName: "stage",
        id: "id",
      },
    );
  });
});
