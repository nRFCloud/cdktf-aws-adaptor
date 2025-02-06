import { ApiGatewayAccount } from "@cdktf/provider-aws/lib/api-gateway-account/index.js";
import { ApiGatewayBasePathMapping } from "@cdktf/provider-aws/lib/api-gateway-base-path-mapping/index.js";
import { Apigatewayv2Authorizer } from "@cdktf/provider-aws/lib/apigatewayv2-authorizer/index.js";
import { Apigatewayv2DomainName } from "@cdktf/provider-aws/lib/apigatewayv2-domain-name/index.js";
import { Apigatewayv2Integration } from "@cdktf/provider-aws/lib/apigatewayv2-integration/index.js";
import { Apigatewayv2Route } from "@cdktf/provider-aws/lib/apigatewayv2-route/index.js";
import { Apigatewayv2Stage } from "@cdktf/provider-aws/lib/apigatewayv2-stage/index.js";
import { CloudcontrolapiResource } from "@cdktf/provider-aws/lib/cloudcontrolapi-resource/index.js";
import { CfnAccount, CfnBasePathMapping, CfnDeployment, CfnStage } from "aws-cdk-lib/aws-apigateway";
import {
    CfnAuthorizer as CfnAuthorizerV2,
    CfnDomainName as CfnDomainNameV2,
    CfnIntegration as CfnIntegrationV2,
    CfnRoute as CfnRouteV2,
    CfnStage as CfnStageV2,
} from "aws-cdk-lib/aws-apigatewayv2";
import { setupJest } from "cdktf/lib/testing/adapters/jest.js";
import { registerMappings } from "../../mappings/index.js";
import { itShouldMapCfnElementToTerraformResource, synthesizeElementAndTestStability } from "../helpers.js";

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
                    description: "description",
                    variables: {
                        "stage-variable": "stage-variable-value",
                    },
                    tags: [
                        {
                            key: "tag",
                            value: "tag-value",
                        },
                    ],
                    creationStack: ["stack"],
                    cacheClusterEnabled: true,
                    cacheClusterSize: "cache-cluster-size",
                    canarySetting: {
                        percentTraffic: 50,
                        stageVariableOverrides: {
                            "stage-variable": "stage-variable-value",
                        },
                        useStageCache: true,
                    },
                    accessLogSetting: {
                        destinationArn: "destination-arn",
                        format: "format",
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
                roleArn: undefined,
                typeVersionId: undefined,
                schema: undefined,
                timeouts: undefined,
            },
        );
    });

    it("should map AWS::ApiGateway::Stage", () => {
        synthesizeElementAndTestStability(
            CfnStage,
            {
                accessLogSetting: {
                    destinationArn: "destination-arn",
                    format: "format",
                },
                cacheClusterEnabled: true,
                cacheClusterSize: "cache-cluster-size",
                canarySetting: {
                    percentTraffic: 50,
                    stageVariableOverrides: {
                        "stage-variable": "stage-variable-value",
                    },
                    deploymentId: "deployment-id",
                    useStageCache: true,
                },
                clientCertificateId: "client-certificate-id",
                stageName: "stage-name",
                description: "description",
                documentationVersion: "documentation-version",
                tracingEnabled: true,
                methodSettings: [],
                restApiId: "rest-api-id",
                deploymentId: "deployment-id",
                tags: [
                    {
                        key: "tag",
                        value: "tag-value",
                    },
                ],
                variables: {
                    "stage-variable": "stage-variable-value",
                },
            },
            CloudcontrolapiResource,
            {
                typeName: "AWS::ApiGateway::Stage",
                desiredState: expect.stringContaining(""),
                roleArn: undefined,
                schema: undefined,
                timeouts: undefined,
                typeVersionId: undefined,
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
                domainNameId: undefined,
            },
        );
    });

    itShouldMapCfnElementToTerraformResource(
        CfnStageV2,
        {
            accessLogSettings: {
                destinationArn: "destination-arn",
                format: "format",
            },
            apiId: "api-id",
            autoDeploy: true,
            clientCertificateId: "client-certificate-id",
            defaultRouteSettings: {
                dataTraceEnabled: true,
                detailedMetricsEnabled: true,
                loggingLevel: "logging-level",
                throttlingBurstLimit: 60,
                throttlingRateLimit: 60,
            },
            deploymentId: "deployment-id",
            description: "description",
            stageVariables: {
                "stage-variable": "stage-variable-value",
            },
            stageName: "stage-name",
            routeSettings: {
                DataTraceEnabled: true,
                RouteKey: "route-key",
                DetailedMetricsEnabled: true,
                LoggingLevel: "logging-level",
                ThrottlingBurstLimit: 60,
                ThrottlingRateLimit: 60,
            },
            tags: {
                "tag": "tag-value",
            },
            accessPolicyId: "access-policy-id",
        },
        Apigatewayv2Stage,
        {
            routeSettings: [{
                dataTraceEnabled: true,
                routeKey: "route-key",
                detailedMetricsEnabled: true,
                loggingLevel: "logging-level",
                throttlingBurstLimit: 60,
                throttlingRateLimit: 60,
            }],
            tags: {
                "tag": "tag-value",
            },
            accessLogSettings: {
                destinationArn: "destination-arn",
                format: "format",
            },
            apiId: "api-id",
            autoDeploy: true,
            description: "description",
            name: "stage-name",
            stageVariables: {
                "stage-variable": "stage-variable-value",
            },
            deploymentId: "deployment-id",
            clientCertificateId: "client-certificate-id",
            defaultRouteSettings: {
                dataTraceEnabled: true,
                detailedMetricsEnabled: true,
                loggingLevel: "logging-level",
                throttlingBurstLimit: 60,
                throttlingRateLimit: 60,
            },
        },
        ["accessPolicyId"],
    );

    itShouldMapCfnElementToTerraformResource(
        CfnDomainNameV2,
        {
            domainName: "domain-name",
            domainNameConfigurations: [{
                certificateArn: "certificate-arn",
                endpointType: "REGIONAL",
                securityPolicy: "TLS_1_2",
                certificateName: "certificate-name",
                ownershipVerificationCertificateArn: "ownership-verification-certificate-arn",
            }],
            mutualTlsAuthentication: {
                truststoreUri: "truststore-uri",
                truststoreVersion: "truststore-version",
            },
            tags: {
                "tag": "tag-value",
            },
        },
        Apigatewayv2DomainName,
        {
            tags: {
                "tag": "tag-value",
            },
            domainName: "domain-name",
            mutualTlsAuthentication: {
                truststoreUri: "truststore-uri",
                truststoreVersion: "truststore-version",
            },
            domainNameConfiguration: {
                certificateArn: "certificate-arn",
                endpointType: "REGIONAL",
                securityPolicy: "TLS_1_2",
                ownershipVerificationCertificateArn: "ownership-verification-certificate-arn",
            },
            timeouts: undefined,
        },
        ["domainNameConfigurations.*.certificateName"],
    );

    itShouldMapCfnElementToTerraformResource(
        CfnIntegrationV2,
        {
            apiId: "api-id",
            connectionId: "connection-id",
            connectionType: "connection-type",
            contentHandlingStrategy: "content-handling-strategy",
            credentialsArn: "credentials-arn",
            description: "description",
            integrationMethod: "integration-method",
            integrationSubtype: "integration-subtype",
            integrationType: "integration-type",
            integrationUri: "integration-uri",
            passthroughBehavior: "passthrough-behavior",
            payloadFormatVersion: "payload-format-version",
            templateSelectionExpression: "template-selection-expression",
            timeoutInMillis: 60,
            requestParameters: {
                "request-parameter": "request-parameter-value",
            },
            requestTemplates: {
                "request-template": "request-template-value",
            },
            responseParameters: {
                "200": {
                    ResponseParameters: [
                        {
                            Source: "source",
                            Destination: "destination",
                        },
                    ],
                },
            },
            tlsConfig: {
                serverNameToVerify: "server-name-to-verify",
            },
        },
        Apigatewayv2Integration,
        {
            apiId: "api-id",
            connectionId: "connection-id",
            connectionType: "connection-type",
            contentHandlingStrategy: "content-handling-strategy",
            credentialsArn: "credentials-arn",
            description: "description",
            integrationMethod: "integration-method",
            integrationSubtype: "integration-subtype",
            integrationType: "integration-type",
            integrationUri: "integration-uri",
            passthroughBehavior: "passthrough-behavior",
            payloadFormatVersion: "payload-format-version",
            templateSelectionExpression: "template-selection-expression",
            timeoutMilliseconds: 60,
            requestParameters: {
                "request-parameter": "request-parameter-value",
            },
            responseParameters: [
                {
                    statusCode: "200",
                    mappings: { source: "destination" },
                },
            ],
            requestTemplates: {
                "request-template": "request-template-value",
            },
            tlsConfig: {
                serverNameToVerify: "server-name-to-verify",
            },
        },
    );

    itShouldMapCfnElementToTerraformResource(
        CfnAuthorizerV2,
        {
            identityValidationExpression: "identity-validation-expression",
            apiId: "api-id",
            authorizerCredentialsArn: "authorizer-credentials-arn",
            authorizerPayloadFormatVersion: "authorizer-payload-format-version",
            authorizerResultTtlInSeconds: 60,
            authorizerType: "authorizer-type",
            authorizerUri: "authorizer-uri",
            enableSimpleResponses: true,
            identitySource: ["identity-source"],
            name: "name",
            jwtConfiguration: {
                audience: ["audience"],
                issuer: "issuer",
            },
        },
        Apigatewayv2Authorizer,
        {
            apiId: "api-id",
            name: "name",
            jwtConfiguration: {
                audience: ["audience"],
                issuer: "issuer",
            },
            enableSimpleResponses: true,
            identitySources: ["identity-source"],
            authorizerCredentialsArn: "authorizer-credentials-arn",
            authorizerPayloadFormatVersion: "authorizer-payload-format-version",
            authorizerResultTtlInSeconds: 60,
            authorizerType: "authorizer-type",
            authorizerUri: "authorizer-uri",
            timeouts: undefined,
        },
        ["identityValidationExpression"],
    );

    itShouldMapCfnElementToTerraformResource(
        CfnRouteV2,
        {
            apiId: "api-id",
            apiKeyRequired: true,
            authorizationScopes: ["authorization-scope"],
            authorizationType: "authorization-type",
            requestParameters: {
                "request-parameter": "request-parameter-value",
            },
            routeKey: "route-key",
            routeResponseSelectionExpression: "route-response-selection-expression",
            target: "target",
            operationName: "operation-name",
            requestModels: {
                "request-model": "request-model-value",
            },
            modelSelectionExpression: "model-selection-expression",
            authorizerId: "authorizer-id",
        },
        Apigatewayv2Route,
        {
            apiId: "api-id",
            apiKeyRequired: true,
            authorizationScopes: ["authorization-scope"],
            authorizationType: "authorization-type",
            requestParameter: [{
                required: false,
                requestParameterKey: "request-parameter",
            }],
            routeKey: "route-key",
            routeResponseSelectionExpression: "route-response-selection-expression",
            target: "target",
            operationName: "operation-name",
            requestModels: {
                "request-model": "request-model-value",
            },
            authorizerId: "authorizer-id",
            modelSelectionExpression: "model-selection-expression",
        },
    );
});
