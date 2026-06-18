import { AppsyncApiKey } from "@cdktf/provider-aws/lib/appsync-api-key/index.js";
import { AppsyncDatasource } from "@cdktf/provider-aws/lib/appsync-datasource/index.js";
import { AppsyncDomainNameApiAssociation } from "@cdktf/provider-aws/lib/appsync-domain-name-api-association/index.js";
import { AppsyncFunction } from "@cdktf/provider-aws/lib/appsync-function/index.js";
import { AppsyncGraphqlApi } from "@cdktf/provider-aws/lib/appsync-graphql-api/index.js";
import { AppsyncResolver } from "@cdktf/provider-aws/lib/appsync-resolver/index.js";
import {
    CfnApiKey,
    CfnDataSource,
    CfnDomainNameApiAssociation,
    CfnFunctionConfiguration,
    CfnGraphQLApi,
    CfnResolver,
    Definition,
    FieldLogLevel,
    GraphqlApi,
    Visibility,
} from "aws-cdk-lib/aws-appsync";
import { LocalBackend, Testing } from "cdktf";
import { setupJest } from "cdktf/lib/testing/adapters/jest.js";
import { readFileSync } from "node:fs";
import url from "node:url";
import { AwsTerraformAdaptorStack } from "../../index.js";
import { synthesizeElementAndTestStability } from "../helpers.js";

setupJest();

const dirname = url.fileURLToPath(new URL(".", import.meta.url));

describe("Appsync mappings", () => {
    describe("AWS::AppSync::GraphQLApi", () => {
        it("Should translate API without schema", () => {
            synthesizeElementAndTestStability(
                CfnGraphQLApi,
                {
                    name: "api-name",
                    visibility: "PUBLIC",
                    authenticationType: "API_KEY",
                    additionalAuthenticationProviders: [
                        {
                            authenticationType: "API_KEY",
                            lambdaAuthorizerConfig: {
                                authorizerUri: "authorizer-uri",
                                authorizerResultTtlInSeconds: 60,
                                identityValidationExpression: "identity-validation-expression",
                            },
                            userPoolConfig: {
                                userPoolId: "user-pool-id",
                                awsRegion: "aws-region",
                                appIdClientRegex: "app-id-client-regex",
                            },
                            openIdConnectConfig: {
                                authTtl: 60,
                                clientId: "client-id",
                                iatTtl: 60,
                                issuer: "issuer",
                            },
                        },
                    ],
                    lambdaAuthorizerConfig: {
                        authorizerUri: "authorizer-uri",
                        authorizerResultTtlInSeconds: 60,
                        identityValidationExpression: "identity-validation-expression",
                    },
                    openIdConnectConfig: {
                        authTtl: 60,
                        clientId: "client-id",
                        iatTtl: 60,
                        issuer: "issuer",
                    },
                    userPoolConfig: {
                        userPoolId: "user-pool-id",
                        awsRegion: "aws-region",
                        appIdClientRegex: "app-id-client-regex",
                        defaultAction: "ALLOW",
                    },
                    tags: [
                        {
                            value: "tag-value",
                            key: "tag-key",
                        },
                    ],
                    logConfig: {
                        cloudWatchLogsRoleArn: "cloud-watch-logs-role-arn",
                        excludeVerboseContent: true,
                        fieldLogLevel: "field-log-level",
                    },
                    xrayEnabled: true,
                    ownerContact: "owner-contact",
                    mergedApiExecutionRoleArn: "merged-api-execution-role-arn",
                    apiType: "GRAPHQL",
                    enhancedMetricsConfig: {
                        operationLevelMetricsConfig: "test-operation-level-metrics-config",
                        dataSourceLevelMetricsBehavior: "test-data-source-level-metrics-behavior",
                        resolverLevelMetricsBehavior: "test-resolver-level-metrics-behavior",
                    },
                    environmentVariables: {
                        test: "test",
                    },
                    introspectionConfig: "test-introspection-config",
                    queryDepthLimit: 60,
                    resolverCountLimit: 68,
                },
                AppsyncGraphqlApi,
                {
                    mergedApiExecutionRoleArn: "merged-api-execution-role-arn",
                    apiType: "GRAPHQL",
                    schema: undefined,
                    introspectionConfig: "test-introspection-config",
                    queryDepthLimit: 60,
                    resolverCountLimit: 68,
                    enhancedMetricsConfig: {
                        operationLevelMetricsConfig: "test-operation-level-metrics-config",
                        dataSourceLevelMetricsBehavior: "test-data-source-level-metrics-behavior",
                        resolverLevelMetricsBehavior: "test-resolver-level-metrics-behavior",
                    },
                    name: "api-name",
                    visibility: "PUBLIC",
                    authenticationType: "API_KEY",
                    lambdaAuthorizerConfig: {
                        authorizerResultTtlInSeconds: 60,
                        identityValidationExpression: "identity-validation-expression",
                        authorizerUri: "authorizer-uri",
                    },
                    logConfig: {
                        fieldLogLevel: "field-log-level",
                        excludeVerboseContent: true,
                        cloudwatchLogsRoleArn: "cloud-watch-logs-role-arn",
                    },
                    xrayEnabled: true,
                    userPoolConfig: {
                        userPoolId: "user-pool-id",
                        awsRegion: "aws-region",
                        appIdClientRegex: "app-id-client-regex",
                        defaultAction: "ALLOW",
                    },
                    openidConnectConfig: {
                        authTtl: 60,
                        clientId: "client-id",
                        iatTtl: 60,
                        issuer: "issuer",
                    },
                    additionalAuthenticationProvider: [
                        {
                            authenticationType: "API_KEY",
                            lambdaAuthorizerConfig: {
                                authorizerUri: "authorizer-uri",
                                authorizerResultTtlInSeconds: 60,
                                identityValidationExpression: "identity-validation-expression",
                            },
                            userPoolConfig: {
                                userPoolId: "user-pool-id",
                                awsRegion: "aws-region",
                                appIdClientRegex: "app-id-client-regex",
                            },
                            openidConnectConfig: {
                                authTtl: 60,
                                clientId: "client-id",
                                iatTtl: 60,
                                issuer: "issuer",
                            },
                        },
                    ],
                    tags: {
                        "tag-key": "tag-value",
                    },
                },
                ["ownerContact", "environmentVariables"],
            );
        });

        it("Should translate API with schema", () => {
            const app = Testing.app();

            class Stack extends AwsTerraformAdaptorStack {
                public readonly api = new GraphqlApi(this, "api", {
                    name: "api-name",
                    visibility: Visibility.PRIVATE,
                    logConfig: {
                        fieldLogLevel: FieldLogLevel.ALL,
                        excludeVerboseContent: false,
                    },
                    xrayEnabled: true,
                    definition: Definition.fromFile(`${dirname}/../../../test-data/schema.graphql`),
                });
                public readonly backend = new LocalBackend(this, {
                    path: `/terraform.${this.node.id}.tfstate`,
                });
            }

            const stack = new Stack(app, "stack", {
                region: "us-east-1",
                useCloudControlFallback: false,
            });
            stack.prepareStack();
            const synthed = Testing.synth(stack);
            const schemaFile = readFileSync(`${dirname}/../../../test-data/schema.graphql`, "utf8");
            const escaped = schemaFile.replaceAll("\n", "\\n").replaceAll("\"", "\\\"");
            const wrapped = `$\{join(\"\", [\"${escaped}"])}`;

            expect(synthed).toMatchSnapshot();
            expect(synthed).toHaveResourceWithProperties(AppsyncGraphqlApi, {
                schema: wrapped,
            });
        });
    });

    it("Should translate AWS::AppSync::ApiKey", () => {
        synthesizeElementAndTestStability(
            CfnApiKey,
            {
                apiId: "api-id",
                description: "description",
                expires: 1000000000000,
            },
            AppsyncApiKey,
            {
                apiId: "api-id",
                description: "description",
                expires: "2001-09-09T01:46:40.000Z",
            },
        );
    });

    it("Should translate AWS::AppSync::DataSource", () => {
        synthesizeElementAndTestStability(
            CfnDataSource,
            {
                metricsConfig: "metrics-config",
                name: "name",
                apiId: "api-id",
                description: "description",
                type: "type",
                elasticsearchConfig: {
                    endpoint: "endpoint",
                    awsRegion: "aws-region",
                },
                httpConfig: {
                    endpoint: "endpoint",
                    authorizationConfig: {
                        authorizationType: "authorization-type",
                        awsIamConfig: {
                            signingRegion: "signing-region",
                            signingServiceName: "signing-service-name",
                        },
                    },
                },
                eventBridgeConfig: {
                    eventBusArn: "event-bus-arn",
                },
                lambdaConfig: {
                    lambdaFunctionArn: "lambda-function-arn",
                },
                serviceRoleArn: "service-role-arn",
                relationalDatabaseConfig: {
                    relationalDatabaseSourceType: "relational-database-source-type",
                    rdsHttpEndpointConfig: {
                        schema: "schema",
                        awsRegion: "aws-region",
                        databaseName: "database-name",
                        awsSecretStoreArn: "aws-secret-store-arn",
                        dbClusterIdentifier: "db-cluster-identifier",
                    },
                },
                dynamoDbConfig: {
                    awsRegion: "aws-region",
                    tableName: "table-name",
                    deltaSyncConfig: {
                        deltaSyncTableName: "delta-sync-table-name",
                        deltaSyncTableTtl: "60",
                        baseTableTtl: "60",
                    },
                    versioned: true,
                    useCallerCredentials: true,
                },
                openSearchServiceConfig: {
                    endpoint: "endpoint",
                    awsRegion: "aws-region",
                },
            },
            AppsyncDatasource,
            {
                apiId: "api-id",
                description: "description",
                name: "name",
                type: "type",
                elasticsearchConfig: {
                    endpoint: "endpoint",
                    region: "aws-region",
                },
                httpConfig: {
                    endpoint: "endpoint",
                    authorizationConfig: {
                        authorizationType: "authorization-type",
                        awsIamConfig: {
                            signingRegion: "signing-region",
                            signingServiceName: "signing-service-name",
                        },
                    },
                },
                eventBridgeConfig: {
                    eventBusArn: "event-bus-arn",
                },
                lambdaConfig: {
                    functionArn: "lambda-function-arn",
                },
                serviceRoleArn: "service-role-arn",
                relationalDatabaseConfig: {
                    httpEndpointConfig: {
                        region: "aws-region",
                        schema: "schema",
                        databaseName: "database-name",
                        awsSecretStoreArn: "aws-secret-store-arn",
                        dbClusterIdentifier: "db-cluster-identifier",
                    },
                    sourceType: "relational-database-source-type",
                },
                dynamodbConfig: {
                    region: "aws-region",
                    tableName: "table-name",
                    deltaSyncConfig: {
                        deltaSyncTableName: "delta-sync-table-name",
                        deltaSyncTableTtl: 60,
                        baseTableTtl: 60,
                    },
                    versioned: true,
                    useCallerCredentials: true,
                },
                opensearchserviceConfig: {
                    endpoint: "endpoint",
                    region: "aws-region",
                },
            },
            ["metricsConfig"],
        );
    });

    it("Should translate AWS::AppSync::Resolver", () => {
        synthesizeElementAndTestStability(
            CfnResolver,
            {
                metricsConfig: "metrics-config",
                apiId: "api-id",
                dataSourceName: "data-source-name",
                code: "code",
                kind: "kind",
                cachingConfig: {
                    ttl: 60,
                    cachingKeys: ["stuff"],
                },
                fieldName: "field-name",
                maxBatchSize: 60,
                pipelineConfig: {
                    functions: ["function"],
                },
                runtime: {
                    runtimeVersion: "runtime-version",
                    name: "name",
                },
                syncConfig: {
                    conflictHandler: "conflict-handler",
                    conflictDetection: "conflict-detection",
                    lambdaConflictHandlerConfig: {
                        lambdaConflictHandlerArn: "lambda-conflict-handler-arn",
                    },
                },
                requestMappingTemplate: "request-mapping-template",
                typeName: "type-name",
                responseMappingTemplate: "response-mapping-template",
                // FIXME: uncomment when supported by the mapper
                codeS3Location: "code-s3-location",
                requestMappingTemplateS3Location: "request-mapping-template-s3-location",
                responseMappingTemplateS3Location: "response-mapping-template-s3-location",
            },
            AppsyncResolver,
            {
                type: "type-name",
                kind: "kind",
                cachingConfig: {
                    ttl: 60,
                    cachingKeys: ["stuff"],
                },
                code: "code",
                runtime: {
                    name: "name",
                    runtimeVersion: "runtime-version",
                },
                syncConfig: {
                    conflictHandler: "conflict-handler",
                    lambdaConflictHandlerConfig: {
                        lambdaConflictHandlerArn: "lambda-conflict-handler-arn",
                    },
                    conflictDetection: "conflict-detection",
                },
                pipelineConfig: {
                    functions: ["function"],
                },
                apiId: "api-id",
                maxBatchSize: 60,
                field: "field-name",
                dataSource: "data-source-name",
                requestTemplate: "request-mapping-template",
                responseTemplate: "response-mapping-template",
            },
            [
                "requestMappingTemplateS3Location",
                "responseMappingTemplateS3Location",
                "codeS3Location",
                "metricsConfig",
            ],
        );
    });

    it("Should translate AWS::AppSync:FunctionConfiguration", () => {
        synthesizeElementAndTestStability(
            CfnFunctionConfiguration,
            {
                name: "name",
                apiId: "api-id",
                description: "description",
                code: "code",
                runtime: {
                    name: "name",
                    runtimeVersion: "runtime-version",
                },
                syncConfig: {
                    conflictHandler: "conflict-handler",
                    lambdaConflictHandlerConfig: {
                        lambdaConflictHandlerArn: "lambda-conflict-handler-arn",
                    },
                    conflictDetection: "conflict-detection",
                },
                dataSourceName: "data-source-name",
                maxBatchSize: 60,
                requestMappingTemplate: "request-mapping-template",
                responseMappingTemplate: "response-mapping-template",
                functionVersion: "function-version",
                codeS3Location: "code-s3-location",
                requestMappingTemplateS3Location: "request-mapping-template-s3-location",
                responseMappingTemplateS3Location: "response-mapping-template-s3-location",
            },
            AppsyncFunction,
            {
                name: "name",
                apiId: "api-id",
                description: "description",
                dataSource: "data-source-name",
                maxBatchSize: 60,
                requestMappingTemplate: "request-mapping-template",
                responseMappingTemplate: "response-mapping-template",
                functionVersion: "function-version",
                runtime: {
                    name: "name",
                    runtimeVersion: "runtime-version",
                },
                code: "code",
                syncConfig: {
                    conflictHandler: "conflict-handler",
                    lambdaConflictHandlerConfig: {
                        lambdaConflictHandlerArn: "lambda-conflict-handler-arn",
                    },
                    conflictDetection: "conflict-detection",
                },
            },
            ["codeS3Location", "requestMappingTemplateS3Location", "responseMappingTemplateS3Location"],
        );
    });

    it("Should translate AWS::AppSync::DomainNameApiAssociation", () => {
        synthesizeElementAndTestStability(
            CfnDomainNameApiAssociation,
            {
                apiId: "api-id",
                domainName: "domain-name",
            },
            AppsyncDomainNameApiAssociation,
            {
                apiId: "api-id",
                domainName: "domain-name",
            },
        );
    });
});
