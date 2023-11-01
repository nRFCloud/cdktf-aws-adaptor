import { ApiGatewayAccount } from "@cdktf/provider-aws/lib/api-gateway-account/index.js";
import { ApiGatewayBasePathMapping } from "@cdktf/provider-aws/lib/api-gateway-base-path-mapping/index.js";
import {
  Apigatewayv2DomainName,
  Apigatewayv2DomainNameConfig,
} from "@cdktf/provider-aws/lib/apigatewayv2-domain-name/index.js";
import { Apigatewayv2Stage, Apigatewayv2StageConfig } from "@cdktf/provider-aws/lib/apigatewayv2-stage/index.js";
import { CloudcontrolapiResource } from "@cdktf/provider-aws/lib/cloudcontrolapi-resource/index.js";
import { CfnAccount, CfnBasePathMapping, CfnDeployment, CfnStage } from "aws-cdk-lib/aws-apigateway";
import { CfnDomainName as CfnDomainNameV2, CfnStage as CfnStageV2 } from "aws-cdk-lib/aws-apigatewayv2";
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

  registerMappingTyped(CfnStageV2, Apigatewayv2Stage, {
    resource(scope, id, props) {
      const config: Apigatewayv2StageConfig = {
        apiId: props.ApiId,
        name: props.StageName,
        autoDeploy: props.AutoDeploy,
        accessLogSettings: {
          destinationArn: props.AccessLogSettings?.DestinationArn as string,
          format: props.AccessLogSettings?.Format as string,
        },
        clientCertificateId: props.ClientCertificateId,
        defaultRouteSettings: {
          dataTraceEnabled: props.DefaultRouteSettings?.DataTraceEnabled,
          detailedMetricsEnabled: props.DefaultRouteSettings?.DetailedMetricsEnabled,
          loggingLevel: props.DefaultRouteSettings?.LoggingLevel,
          throttlingBurstLimit: props.DefaultRouteSettings?.ThrottlingBurstLimit,
          throttlingRateLimit: props.DefaultRouteSettings?.ThrottlingRateLimit,
        },
        stageVariables: props.StageVariables,
        deploymentId: props.DeploymentId,
        description: props.Description,
        tags: props.Tags,
        routeSettings: [{
          routeKey: props.RouteSettings?.RouteKey as string,
          dataTraceEnabled: props.RouteSettings?.DataTraceEnabled,
          detailedMetricsEnabled: props.RouteSettings?.DetailedMetricsEnabled,
          loggingLevel: props.RouteSettings?.LoggingLevel,
          throttlingBurstLimit: props.RouteSettings?.ThrottlingBurstLimit,
          throttlingRateLimit: props.RouteSettings?.ThrottlingRateLimit,
        }],
      };
      return new Apigatewayv2Stage(scope, id, deleteUndefinedKeys(config));
    },
    unsupportedProps: ["AccessPolicyId"],
    attributes: {
      Ref: (stage: Apigatewayv2Stage) => stage.id,
      Id: (stage: Apigatewayv2Stage) => stage.id,
    },
  });

  registerMappingTyped(CfnDomainNameV2, Apigatewayv2DomainName, {
    resource(scope, id, props) {
      if ((props.DomainNameConfigurations?.length || 0) > 1) {
        throw new Error("Only one domain name configuration is supported");
      }

      const config: Apigatewayv2DomainNameConfig = {
        domainNameConfiguration: {
          ownershipVerificationCertificateArn: props.DomainNameConfigurations?.[0]?.OwnershipVerificationCertificateArn,
          endpointType: props.DomainNameConfigurations?.[0]?.EndpointType as string,
          certificateArn: props.DomainNameConfigurations?.[0]?.CertificateArn as string,
          securityPolicy: props.DomainNameConfigurations?.[0]?.SecurityPolicy as string,
        },
        mutualTlsAuthentication: {
          truststoreVersion: props.MutualTlsAuthentication?.TruststoreVersion as string,
          truststoreUri: props.MutualTlsAuthentication?.TruststoreUri as string,
        },
        domainName: props.DomainName,
        tags: props.Tags,
      };

      return new Apigatewayv2DomainName(scope, id, deleteUndefinedKeys(config));
    },
    attributes: {
      Ref: res => res.id,
      RegionalHostedZoneId: res => res.domainNameConfiguration?.hostedZoneId,
      RegionalDomainName: res => res.domainNameConfiguration?.targetDomainName,
    },
  });
}
