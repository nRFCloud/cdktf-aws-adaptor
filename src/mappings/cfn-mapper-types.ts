import { CfnResource, IResolvable } from "aws-cdk-lib";
import { CfnDistribution } from "aws-cdk-lib/aws-cloudfront";
import { CfnIdentityPoolRoleAttachment, CfnUserPool, type CfnUserPoolProps } from "aws-cdk-lib/aws-cognito";
import { CfnTable } from "aws-cdk-lib/aws-dynamodb";
import { CfnRule } from "aws-cdk-lib/aws-events";
import { CfnEventSourceMapping, CfnEventSourceMappingProps, CfnPermissionProps } from "aws-cdk-lib/aws-lambda";
import { CfnRecordSet } from "aws-cdk-lib/aws-route53";
import { PascalCase } from "type-fest";
import { Exact, NotAny } from "../lib/core/type-utils.js";

export type CfnAttributes<T extends CfnResource> = {
    [K in keyof T as ConvertScriptKey<IsCfnAttr<K>>]: T[K];
};

type IsCfnAttr<T> = T extends `attribute${string}` ? never
    : T extends `attr${infer U}` ? U
    : T extends "ref" ? "ref"
    : never;

export type AdaptCfnProps<T> =
    // Ignore IResolvable since it's just a pointer
    T extends IResolvable ? never
        // Exclude any from mapping because any has no information to map
        : NotAny<T> extends never ? T
        : HandleSpecialObjectCases<T> extends never ? AutomaticPropsAdapt<T>
        : HandleSpecialObjectCases<T>;

type AutomaticPropsAdapt<T> = T extends Array<infer U> ? Array<AdaptCfnProps<U>>
    : T extends Date ? string
    : T extends object ? {
            [K in keyof T as ConvertScriptKey<K>]: AdaptCfnProps<T[K]>;
        }
    : T;

/**
 * Cases where Cloudformation is internally inconsistent with its naming
 */
type HandleSpecialObjectCases<T> = T extends Exact<CfnIdentityPoolRoleAttachment.MappingRuleProperty, T>
    ? ManualPropertyRemap<CfnIdentityPoolRoleAttachment.MappingRuleProperty, { "roleArn": "RoleARN" }>
    : T extends Exact<CfnUserPool.InviteMessageTemplateProperty, T>
        ? ManualPropertyRemap<CfnUserPool.InviteMessageTemplateProperty, {
            "smsMessage": "SMSMessage";
        }>
    : T extends Exact<CfnUserPool.LambdaConfigProperty, T> ? ManualPropertyRemap<CfnUserPool.LambdaConfigProperty, {
            "customSmsSender": "CustomSMSSender";
            "kmsKeyId": "KMSKeyID";
        }>
    : T extends Exact<CfnRule.EcsParametersProperty, T> ? ManualPropertyRemap<CfnRule.EcsParametersProperty, {
            "enableEcsManagedTags": "EnableECSManagedTags";
        }>
    : T extends Exact<CfnPermissionProps, T> ? ManualPropertyRemap<CfnPermissionProps, {
            "principalOrgId": "PrincipalOrgID";
        }>
    : T extends Exact<CfnDistribution.DistributionConfigProperty, T>
        ? ManualPropertyRemap<CfnDistribution.DistributionConfigProperty, {
            "cnamEs": "CNAMEs";
            "ipv6Enabled": "IPV6Enabled";
            "webAclId": "WebACLId";
        }>
    : T extends Exact<CfnDistribution.FunctionAssociationProperty, T>
        ? ManualPropertyRemap<CfnDistribution.FunctionAssociationProperty, {
            "functionArn": "FunctionARN";
        }>
    : T extends Exact<CfnDistribution.LambdaFunctionAssociationProperty, T>
        ? ManualPropertyRemap<CfnDistribution.LambdaFunctionAssociationProperty, {
            "lambdaFunctionArn": "LambdaFunctionARN";
        }>
    : T extends Exact<CfnDistribution.CustomOriginConfigProperty, T>
        ? ManualPropertyRemap<CfnDistribution.CustomOriginConfigProperty, {
            "httpPort": "HTTPPort";
            "httpsPort": "HTTPSPort";
            originSslProtocols: "OriginSSLProtocols";
        }>
    : T extends Exact<CfnTable.SSESpecificationProperty, T> ? ManualPropertyRemap<CfnTable.SSESpecificationProperty, {
            "kmsMasterKeyId": "KMSMasterKeyId";
        }>
    : T extends Exact<CfnRecordSet.GeoProximityLocationProperty, T>
        ? ManualPropertyRemap<CfnRecordSet.GeoProximityLocationProperty, {
            "awsRegion": "AWSRegion";
        }>
    : T extends Exact<CfnEventSourceMappingProps, T> ? ManualPropertyRemap<CfnEventSourceMappingProps, {
            documentDbEventSourceConfig: "DocumentDBEventSourceConfig";
        }>
    : T extends Exact<CfnEventSourceMapping.SourceAccessConfigurationProperty, T>
        ? ManualPropertyRemap<CfnEventSourceMapping.SourceAccessConfigurationProperty, {
            uri: "URI";
        }>
    : T extends Exact<CfnUserPoolProps, T> ? ManualPropertyRemap<CfnUserPoolProps, {
            "webAuthnRelyingPartyId": "WebAuthnRelyingPartyID";
        }>
    : never;

type ManualPropertyRemap<T, KeyMap extends Partial<{ [K in keyof T]: string }>> =
    & { [K in keyof T as Exclude<KeyMap[K], undefined>]: AdaptCfnProps<T[K]> }
    & AutomaticPropsAdapt<Omit<T, keyof KeyMap>>;

type PascalizeScriptKey<T extends string> = PascalCase<
    T extends "vpcs" ? "VPCs"
        : T extends "objectAccess" ? "GetObject"
        : T extends "equalTo" ? "Equals"
        : T
>;

type ConvertScriptKeySuffix<T extends string> = T extends `${infer U}Arns` ? `${U}ARNs`
    : T extends `${infer U}MBs` ? `${U}MBs`
    : T extends `${infer U}AZs` ? `${U}AZs`
    : T extends `Sse${infer U}` ? `SSE${U}`
    : T extends `${infer U}UrLs` ? `${U}URLs`
    : T extends `Dns${infer U}` ? `DNS${U}`
    : T extends "Ttl" ? "Ttl"
    : T extends `${infer U}Ttl` ? `${U}TTL`
    : T extends `OpenId${infer U}` ? `OpenID${U}`
    : T extends `DynamoDb${infer U}` ? `DynamoDB${U}`
    : T extends `GraphQl${infer U}` ? `GraphQL${U}`
    : T;

type ConvertAnnoyingSpecialCases<T extends string> = T extends "DefaultRedirectUri" ? "DefaultRedirectURI"
    : T extends "ManagedPolicyARNs" ? "ManagedPolicyArns"
    : T extends "ProviderUrl" ? "ProviderURL"
    : T extends "WebsiteUrl" ? "WebsiteURL"
    : T extends "" ? never
    : T;

type ConvertScriptKey<T> = T extends string ? ConvertAnnoyingSpecialCases<ConvertScriptKeySuffix<PascalizeScriptKey<T>>>
    : T;
