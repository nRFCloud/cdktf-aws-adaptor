import { ApiGatewayAccount } from "@cdktf/provider-aws/lib/api-gateway-account/index.js";
import { ApiGatewayBasePathMapping } from "@cdktf/provider-aws/lib/api-gateway-base-path-mapping/index.js";
import { CloudcontrolapiResource } from "@cdktf/provider-aws/lib/cloudcontrolapi-resource/index.js";
import { CfnAccount, CfnBasePathMapping, CfnDeployment, CfnStage } from "aws-cdk-lib/aws-apigateway";
import { Fn } from "cdktf";
import { propertyAccess } from "cdktf/lib/tfExpression.js";
import { deleteUndefinedKeys, registerMappingTyped } from "../utils.js";

export function registerApiGatewayMappings() {
  registerMappingTyped(CfnAccount, ApiGatewayAccount, {
    resource(scope, id, props) {
      return new ApiGatewayAccount(
        scope,
        id,
        deleteUndefinedKeys({
          cloudwatchRoleArn: props?.CloudWatchRoleArn,
        }),
      );
    },
    attributes: {
      Id: (account: ApiGatewayAccount) => account.id,
      Ref: (account: ApiGatewayAccount) => account.id,
    },
  });

  registerMappingTyped(CfnDeployment, CloudcontrolapiResource, {
    resource(scope, id, props) {
      const desiredState = JSON.stringify({ ...props });
      props.Description;
      props.RestApiId;
      props.StageDescription;
      props.DeploymentCanarySettings;
      props.StageName;
      return new CloudcontrolapiResource(scope, id, {
        desiredState,
        typeName: "AWS::ApiGateway::Deployment",
      });
    },
    attributes: {
      DeploymentId: (deployment: CloudcontrolapiResource) =>
        propertyAccess(Fn.jsondecode(deployment.properties), ["DeploymentId"]).toString(),
      Ref: (deployment: CloudcontrolapiResource) =>
        propertyAccess(Fn.jsondecode(deployment.properties), ["DeploymentId"]).toString(),
    },
  });

  registerMappingTyped(CfnStage, CloudcontrolapiResource, {
    resource(scope, id, props) {
      const desiredState = JSON.stringify({ ...props });
      props.DeploymentId;
      props.Description;
      props.RestApiId;
      props.StageName;
      props.AccessLogSetting;
      props.CanarySetting;
      props.CacheClusterEnabled;
      props.CacheClusterSize;
      props.ClientCertificateId;
      props.DocumentationVersion;
      props.MethodSettings;
      props.Tags;
      props.TracingEnabled;
      props.Variables;
      return new CloudcontrolapiResource(scope, id, {
        desiredState,
        typeName: "AWS::ApiGateway::Stage",
      });
    },
    attributes: {
      Ref: (stage: CloudcontrolapiResource) =>
        propertyAccess(Fn.jsondecode(stage.properties), ["StageName"]).toString(),
    },
  });

  registerMappingTyped(CfnBasePathMapping, ApiGatewayBasePathMapping, {
    resource(scope, id, props) {
      return new ApiGatewayBasePathMapping(
        scope,
        id,
        deleteUndefinedKeys({
          apiId: props.RestApiId as string,
          basePath: props.BasePath,
          domainName: props.DomainName,
          stageName: props.Stage,
          id: props.Id,
        }),
      );
    },
    attributes: {
      Ref: (basePathMapping: ApiGatewayBasePathMapping) => basePathMapping.id,
    },
  });
}
