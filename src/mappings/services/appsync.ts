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
} from "aws-cdk-lib/aws-appsync";
import { Fn, TerraformStack } from "cdktf";
import { resolve } from "cdktf/lib/_tokens.js";
import { Construct } from "constructs";
import { AwsTerraformAdaptorStack } from "../../lib/core/cdk-adaptor-stack.js";
import { deleteUndefinedKeys, registerMapping, registerMappingTyped } from "../utils.js";

const appsyncApiMapping = new Map<string, AppsyncGraphqlApi>();

function setAppsyncMapping(api: AppsyncGraphqlApi) {
    const key = resolve(TerraformStack.of(api), api.id);
    appsyncApiMapping.set(key, api);
}

function getAppsyncMapping(scope: Construct, apiId: string) {
    const key = resolve(TerraformStack.of(scope), apiId);
    return appsyncApiMapping.get(key);
}

export function registerAppSyncMappings() {
    registerMappingTyped(CfnGraphQLApi, AppsyncGraphqlApi, {
        resource(scope, id, props) {
            const api = new AppsyncGraphqlApi(
                scope,
                id,
                {
                    apiType: props.ApiType,
                    mergedApiExecutionRoleArn: props.MergedApiExecutionRoleArn,
                    introspectionConfig: props.IntrospectionConfig,
                    resolverCountLimit: props.ResolverCountLimit,
                    queryDepthLimit: props.QueryDepthLimit,
                    name: props.Name,
                    visibility: props.Visibility,
                    authenticationType: props.AuthenticationType,
                    additionalAuthenticationProvider: props.AdditionalAuthenticationProviders?.map(provider => ({
                        authenticationType: provider.AuthenticationType,
                        lambdaAuthorizerConfig: {
                            authorizerResultTtlInSeconds: provider.LambdaAuthorizerConfig?.AuthorizerResultTtlInSeconds,
                            identityValidationExpression: provider.LambdaAuthorizerConfig?.IdentityValidationExpression,
                            authorizerUri: provider.LambdaAuthorizerConfig?.AuthorizerUri as string,
                        },
                        openidConnectConfig: {
                            authTtl: provider.OpenIDConnectConfig?.AuthTTL,
                            clientId: provider.OpenIDConnectConfig?.ClientId,
                            iatTtl: provider.OpenIDConnectConfig?.IatTTL,
                            issuer: provider.OpenIDConnectConfig?.Issuer as string,
                        },
                        userPoolConfig: {
                            userPoolId: provider.UserPoolConfig?.UserPoolId as string,
                            appIdClientRegex: provider.UserPoolConfig?.AppIdClientRegex,
                            awsRegion: provider.UserPoolConfig?.AwsRegion,
                        },
                    })),
                    lambdaAuthorizerConfig: {
                        authorizerResultTtlInSeconds: props.LambdaAuthorizerConfig?.AuthorizerResultTtlInSeconds,
                        identityValidationExpression: props.LambdaAuthorizerConfig?.IdentityValidationExpression,
                        authorizerUri: props.LambdaAuthorizerConfig?.AuthorizerUri as string,
                    },
                    logConfig: {
                        fieldLogLevel: props.LogConfig?.FieldLogLevel as string,
                        cloudwatchLogsRoleArn: props.LogConfig?.CloudWatchLogsRoleArn as string,
                        excludeVerboseContent: props.LogConfig?.ExcludeVerboseContent as boolean,
                    },
                    xrayEnabled: props.XrayEnabled,
                    userPoolConfig: {
                        userPoolId: props.UserPoolConfig?.UserPoolId as string,
                        appIdClientRegex: props.UserPoolConfig?.AppIdClientRegex,
                        awsRegion: props.UserPoolConfig?.AwsRegion,
                        defaultAction: props.UserPoolConfig?.DefaultAction as string,
                    },
                    openidConnectConfig: {
                        authTtl: props.OpenIDConnectConfig?.AuthTTL,
                        clientId: props.OpenIDConnectConfig?.ClientId,
                        iatTtl: props.OpenIDConnectConfig?.IatTTL,
                        issuer: props.OpenIDConnectConfig?.Issuer as string,
                    },
                    enhancedMetricsConfig: {
                        operationLevelMetricsConfig: props.EnhancedMetricsConfig?.OperationLevelMetricsConfig as string,
                        resolverLevelMetricsBehavior: props.EnhancedMetricsConfig
                            ?.ResolverLevelMetricsBehavior as string,
                        dataSourceLevelMetricsBehavior: props.EnhancedMetricsConfig
                            ?.DataSourceLevelMetricsBehavior as string,
                    },
                    tags: Object.fromEntries(
                        props.Tags?.map(({
                            Key: key,
                            Value: value,
                        }) => [key, value]) || [],
                    ),
                },
            );
            setAppsyncMapping(api);

            return api;
        },
        unsupportedProps: [
            "OwnerContact",
            "EnvironmentVariables",
        ],
        attributes: {
            Ref: (resource) => resource.id,
            Id: (resource) => resource.id,
            Arn: (resource) => resource.arn,
            ApiId: (resource) => resource.id,
            GraphQLEndpointArn: () => "",
            GraphQLUrl: resource => resource.uris.lookup("GRAPHQL"),
            RealtimeUrl: resource => resource.uris.lookup("REALTIME"),
            GraphQLDns: resource =>
                Fn.replace(Fn.replace(resource.uris.lookup("GRAPHQL"), "https://", ""), "/graphql", ""),
            RealtimeDns: resource =>
                Fn.replace(Fn.replace(resource.uris.lookup("REALTIME"), "wss://", ""), "/graphql", ""),
        },
    });

    registerMappingTyped(CfnApiKey, AppsyncApiKey, {
        resource(scope, id, props) {
            return new AppsyncApiKey(
                scope,
                id,
                deleteUndefinedKeys({
                    apiId: props.ApiId,
                    description: props.Description,
                    expires: props.Expires ? new Date(props.Expires).toISOString() : undefined,
                }),
            );
        },
        attributes: {
            Ref: (resource) => resource.id,
            Arn: (resource) => {
                // arn:aws:appsync:us-east-1:123456789012:apis/graphqlapiid/apikey/apikeya1bzhi
                const stack = AwsTerraformAdaptorStack.of(resource);
                const [, keyId] = Fn.split(":", resource.id);
                return `arn:${stack.awsPartition.partition}:appsync:${stack.awsRegion.name}:${stack.awsCallerIdentity.accountId}:apis/${resource.apiId}/apikeys/${keyId}`;
            },
            ApiKeyId: (resource) => resource.id,
            ApiKey: (resource) => resource.key,
        },
    });

    /**
     * This is a hack to get around GraphQLSchema not being supported as a discrete resource in Terraform
     * Essentially, use a lookup table with the resolved api id to retrieve the api object and set the schema
     */
    registerMapping("AWS::AppSync::GraphQLSchema", {
        resource(scope, id, props) {
            const api = getAppsyncMapping(scope, props.ApiId);
            if (!api) {
                throw new Error("Unable to find GraphQLApi for GraphQLSchema.");
            }

            if (props.Definition) {
                api.schema = props.Definition;
            }
        },
        attributes: {},
    });

    registerMappingTyped(CfnDataSource, AppsyncDatasource, {
        resource(scope, id, props) {
            return new AppsyncDatasource(
                scope,
                id,
                deleteUndefinedKeys({
                    name: props.Name,
                    apiId: props.ApiId,
                    type: props.Type,
                    description: props.Description,
                    dynamodbConfig: {
                        region: props.DynamoDBConfig?.AwsRegion,
                        tableName: props.DynamoDBConfig?.TableName as string,
                        deltaSyncConfig: {
                            deltaSyncTableName: props.DynamoDBConfig?.DeltaSyncConfig?.DeltaSyncTableName as string,
                            deltaSyncTableTtl: props.DynamoDBConfig?.DeltaSyncConfig?.DeltaSyncTableTTL
                                ? +props.DynamoDBConfig?.DeltaSyncConfig?.DeltaSyncTableTTL
                                : undefined,
                            baseTableTtl: props.DynamoDBConfig?.DeltaSyncConfig?.BaseTableTTL
                                ? +props.DynamoDBConfig?.DeltaSyncConfig?.BaseTableTTL
                                : undefined,
                        },
                        versioned: props.DynamoDBConfig?.Versioned as boolean,
                        useCallerCredentials: props.DynamoDBConfig?.UseCallerCredentials as boolean,
                    },
                    elasticsearchConfig: {
                        endpoint: props.ElasticsearchConfig?.Endpoint as string,
                        region: props.ElasticsearchConfig?.AwsRegion,
                    },
                    eventBridgeConfig: {
                        eventBusArn: props.EventBridgeConfig?.EventBusArn as string,
                    },
                    httpConfig: {
                        endpoint: props.HttpConfig?.Endpoint as string,
                        authorizationConfig: {
                            authorizationType: props.HttpConfig?.AuthorizationConfig?.AuthorizationType as string,
                            awsIamConfig: {
                                signingRegion: props.HttpConfig?.AuthorizationConfig?.AwsIamConfig
                                    ?.SigningRegion as string,
                                signingServiceName: props.HttpConfig?.AuthorizationConfig?.AwsIamConfig
                                    ?.SigningServiceName as string,
                            },
                        },
                    },
                    lambdaConfig: {
                        functionArn: props.LambdaConfig?.LambdaFunctionArn as string,
                    },
                    opensearchserviceConfig: {
                        endpoint: props.OpenSearchServiceConfig?.Endpoint as string,
                        region: props.OpenSearchServiceConfig?.AwsRegion,
                    },
                    relationalDatabaseConfig: {
                        httpEndpointConfig: {
                            region: props.RelationalDatabaseConfig?.RdsHttpEndpointConfig?.AwsRegion,
                            databaseName: props.RelationalDatabaseConfig?.RdsHttpEndpointConfig?.DatabaseName as string,
                            schema: props.RelationalDatabaseConfig?.RdsHttpEndpointConfig?.Schema as string,
                            awsSecretStoreArn: props.RelationalDatabaseConfig?.RdsHttpEndpointConfig
                                ?.AwsSecretStoreArn as string,
                            dbClusterIdentifier: props.RelationalDatabaseConfig?.RdsHttpEndpointConfig
                                ?.DbClusterIdentifier as string,
                        },
                        sourceType: props.RelationalDatabaseConfig?.RelationalDatabaseSourceType as string,
                    },
                    serviceRoleArn: props.ServiceRoleArn,
                }),
            );
        },
        unsupportedProps: ["MetricsConfig"],
        attributes: {
            Ref: (resource) => resource.id,
            Name: (resource) => resource.name,
            DataSourceArn: (resource) => resource.arn,
        },
    });

    registerMappingTyped(CfnResolver, AppsyncResolver, {
        // FIXME: Does not support S3 locations
        // Relatively simple to do, but requires an example use case to test
        resource(scope, id, props) {
            return new AppsyncResolver(
                scope,
                id,
                deleteUndefinedKeys({
                    code: props.Code,
                    apiId: props.ApiId,
                    dataSource: props.DataSourceName,
                    field: props.FieldName,
                    type: props.TypeName,
                    maxBatchSize: props.MaxBatchSize,
                    cachingConfig: {
                        ttl: props.CachingConfig?.Ttl,
                        cachingKeys: props.CachingConfig?.CachingKeys,
                    },
                    kind: props.Kind,
                    runtime: {
                        name: props.Runtime?.Name as string,
                        runtimeVersion: props.Runtime?.RuntimeVersion as string,
                    },
                    syncConfig: {
                        conflictHandler: props.SyncConfig?.ConflictHandler as string,
                        lambdaConflictHandlerConfig: {
                            lambdaConflictHandlerArn: props.SyncConfig?.LambdaConflictHandlerConfig
                                ?.LambdaConflictHandlerArn as string,
                        },
                        conflictDetection: props.SyncConfig?.ConflictDetection as string,
                    },
                    pipelineConfig: {
                        functions: props.PipelineConfig?.Functions as string[],
                    },
                    requestTemplate: props.RequestMappingTemplate,
                    responseTemplate: props.ResponseMappingTemplate,
                }),
            );
        },
        unsupportedProps: [
            "RequestMappingTemplateS3Location",
            "ResponseMappingTemplateS3Location",
            "CodeS3Location",
            "MetricsConfig",
        ],
        attributes: {
            Ref: (resource) => resource.id,
            FieldName: (resource) => resource.field,
            TypeName: (resource) => resource.type,
            ResolverArn: (resource) => resource.arn,
        },
    });

    registerMappingTyped(CfnFunctionConfiguration, AppsyncFunction, {
        // FIXME: Does not support S3 locations
        // Relatively simple to do, but requires an example use case to test
        resource(scope, id, props) {
            return new AppsyncFunction(
                scope,
                id,
                deleteUndefinedKeys({
                    name: props.Name,
                    apiId: props.ApiId,
                    dataSource: props.DataSourceName,
                    description: props.Description,
                    functionVersion: props.FunctionVersion,
                    requestMappingTemplate: props.RequestMappingTemplate,
                    responseMappingTemplate: props.ResponseMappingTemplate,
                    syncConfig: {
                        conflictHandler: props.SyncConfig?.ConflictHandler as string,
                        conflictDetection: props.SyncConfig?.ConflictDetection as string,
                        lambdaConflictHandlerConfig: {
                            lambdaConflictHandlerArn: props.SyncConfig?.LambdaConflictHandlerConfig
                                ?.LambdaConflictHandlerArn as string,
                        },
                    },
                    runtime: {
                        runtimeVersion: props.Runtime?.RuntimeVersion as string,
                        name: props.Runtime?.Name as string,
                    },
                    code: props.Code,
                    maxBatchSize: props.MaxBatchSize,
                }),
            );
        },
        unsupportedProps: ["CodeS3Location", "RequestMappingTemplateS3Location", "ResponseMappingTemplateS3Location"],
        attributes: {
            Ref: (resource) => resource.id,
            FunctionId: (resource) => resource.functionId,
            FunctionArn: (resource) => resource.arn,
            Name: (resource) => resource.name,
            DataSourceName: (resource) => resource.dataSource,
        },
    });

    registerMappingTyped(
        CfnDomainNameApiAssociation,
        AppsyncDomainNameApiAssociation,
        {
            resource(scope, id, props) {
                return new AppsyncDomainNameApiAssociation(
                    scope,
                    id,
                    deleteUndefinedKeys({
                        domainName: props.DomainName,
                        apiId: props.ApiId,
                    }),
                );
            },
            attributes: {
                ApiAssociationIdentifier: (resource) => resource.id,
                Ref: (resource) => resource.id,
            },
        },
    );
}
