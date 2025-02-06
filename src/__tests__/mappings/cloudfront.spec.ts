import {
    CloudfrontDistribution,
    type CloudfrontDistributionOrigin,
} from "@cdktf/provider-aws/lib/cloudfront-distribution/index.js";
import { CloudfrontOriginAccessIdentity } from "@cdktf/provider-aws/lib/cloudfront-origin-access-identity/index.js";
import { CfnCloudFrontOriginAccessIdentity, CfnDistribution } from "aws-cdk-lib/aws-cloudfront";
import { type DeepRequiredProperties, itShouldMapCfnElementToTerraformResource } from "../helpers.js";
import {} from "../helpers.js";
describe("CloudFront", () => {
    itShouldMapCfnElementToTerraformResource(
        CfnCloudFrontOriginAccessIdentity,
        {
            cloudFrontOriginAccessIdentityConfig: {
                comment: "test",
            },
        },
        CloudfrontOriginAccessIdentity,
        {
            comment: "test",
        },
    );

    itShouldMapCfnElementToTerraformResource(
        CfnDistribution,
        {
            tags: [{
                key: "Name",
                value: "my-distribution",
            }],
            distributionConfig: {
                anycastIpListId: "anycast-ip-list-id",
                s3Origin: {
                    originAccessIdentity: "origin-access-identity/cloudfront/E127EXAMPLE51Z",
                    dnsName: "example.com",
                },
                customOrigin: {
                    httpPort: 80,
                    httpsPort: 443,
                    originProtocolPolicy: "https-only",
                    originSslProtocols: ["TLSv1.2"],
                    dnsName: "example.com",
                },
                defaultCacheBehavior: {
                    grpcConfig: {
                        enabled: true,
                    },
                    allowedMethods: ["GET", "HEAD"],
                    cachedMethods: ["GET", "HEAD"],
                    compress: true,
                    defaultTtl: 3600,
                    forwardedValues: {
                        cookies: {
                            forward: "none",
                            whitelistedNames: ["*"],
                        },
                        queryString: false,
                        headers: ["*"],
                        queryStringCacheKeys: ["*"],
                    },
                    cachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                    lambdaFunctionAssociations: [
                        {
                            eventType: "origin-request",
                            lambdaFunctionArn: "arn:aws:lambda:us-east-1:111111111111:function:my-function",
                            includeBody: true,
                        },
                    ],
                    fieldLevelEncryptionId: "1234567890abcdef1234567890abcdef",
                    maxTtl: 86400,
                    minTtl: 0,
                    originRequestPolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                    realtimeLogConfigArn: "arn:aws:logs:us-east-1:111111111111:realtime-log-config/my-distribution",
                    responseHeadersPolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                    smoothStreaming: true,
                    targetOriginId: "my-target-origin",
                    trustedKeyGroups: ["1234567890abcdef1234567890abcdef"],
                    functionAssociations: [
                        {
                            eventType: "viewer-request",
                            functionArn: "arn:aws:lambda:us-east-1:111111111111:function:my-function",
                        },
                    ],
                    trustedSigners: ["1234567890abcdef1234567890abcdef"],
                    viewerProtocolPolicy: "redirect-to-https",
                },
                aliases: ["example.com"],
                comment: "My CloudFront distribution",
                customErrorResponses: [
                    {
                        errorCode: 404,
                        responseCode: 200,
                        responsePagePath: "/index.html",
                        errorCachingMinTtl: 300,
                    },
                ],
                defaultRootObject: "index.html",
                enabled: true,
                httpVersion: "http2",
                ipv6Enabled: true,
                priceClass: "PriceClass_100",
                restrictions: {
                    geoRestriction: {
                        restrictionType: "whitelist",
                        locations: ["US", "CA", "GB"],
                    },
                },
                viewerCertificate: {
                    iamCertificateId: "1234567890abcdef1234567890abcdef1234567890abcdef",
                    cloudFrontDefaultCertificate: true,
                    acmCertificateArn:
                        "arn:aws:acm:us-east-1:111111111111:certificate/12345678-1234-1234-1234-123456789012",
                    minimumProtocolVersion: "TLSv1.2_2019",
                    sslSupportMethod: "sni-only",
                },
                cacheBehaviors: [
                    {
                        grpcConfig: {
                            enabled: true,
                        },
                        allowedMethods: ["GET", "HEAD"],
                        cachedMethods: ["GET", "HEAD"],
                        compress: true,
                        defaultTtl: 3600,
                        forwardedValues: {
                            cookies: {
                                forward: "none",
                                whitelistedNames: ["*"],
                            },
                            queryString: false,
                            headers: ["*"],
                            queryStringCacheKeys: ["*"],
                        },
                        cachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                        lambdaFunctionAssociations: [
                            {
                                eventType: "origin-request",
                                includeBody: true,
                                lambdaFunctionArn: "arn:aws:lambda:us-east-1:111111111111:function:my-function",
                            },
                        ],
                        fieldLevelEncryptionId: "1234567890abcdef1234567890abcdef",
                        maxTtl: 86400,
                        minTtl: 0,
                        originRequestPolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                        pathPattern: "/images/*",
                        realtimeLogConfigArn: "arn:aws:logs:us-east-1:111111111111:realtime-log-config/my-distribution",
                        responseHeadersPolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                        smoothStreaming: true,
                        targetOriginId: "my-target-origin",
                        viewerProtocolPolicy: "redirect-to-https",
                        trustedKeyGroups: ["1234567890abcdef1234567890abcdef"],
                        trustedSigners: ["1234567890abcdef1234567890abcdef"],
                        functionAssociations: [
                            {
                                eventType: "viewer-request",
                                functionArn: "arn:aws:lambda:us-east-1:111111111111:function:my-function",
                            },
                        ],
                    },
                ],
                cnamEs: ["cnames.com"],
                continuousDeploymentPolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                logging: {
                    bucket: "my-logs.s3.amazonaws.com",
                    includeCookies: true,
                    prefix: "myprefix",
                },
                originGroups: {
                    items: [
                        {
                            selectionCriteria: "selection-criteria",
                            members: {
                                items: [
                                    {
                                        originId: "my-origin",
                                    },
                                ],
                                quantity: 1,
                            },
                            id: "my-origin-group",
                            failoverCriteria: {
                                statusCodes: {
                                    items: [500, 502],
                                    quantity: 2,
                                },
                            },
                        },
                    ],
                    quantity: 1,
                },
                webAclId: "arn:aws:wafv2:us-east-1:111111111111:regional/webacl/my-web-acl",
                origins: [{
                    domainName: "origins.com",
                    id: "my-origin",
                    connectionAttempts: 3,
                    connectionTimeout: 10,
                    customOriginConfig: {
                        httpPort: 80,
                        httpsPort: 443,
                        originKeepaliveTimeout: 5,
                        originProtocolPolicy: "https-only",
                        originReadTimeout: 30,
                        originSslProtocols: ["TLSv1.2"],
                    },
                    originAccessControlId: "1234567890abcdef1234567890abcdef",
                    originPath: "/mypath",
                    originShield: {
                        originShieldRegion: "us-east-1",
                        enabled: true,
                    },
                    originCustomHeaders: [{
                        headerName: "MyCustomHeader",
                        headerValue: "MyCustomValue",
                    }],
                    s3OriginConfig: {
                        originAccessIdentity: "origin-access-identity/cloudfront/E127EXAMPLE51Z",
                    },
                }],
                staging: true,
            },
        },
        CloudfrontDistribution,
        {
            retainOnDelete: undefined,
            waitForDeployment: undefined,
            tags: {
                Name: "my-distribution",
            },
            defaultCacheBehavior: {
                grpcConfig: {
                    enabled: true,
                },
                allowedMethods: ["GET", "HEAD"],
                cachedMethods: ["GET", "HEAD"],
                compress: true,
                defaultTtl: 3600,
                forwardedValues: {
                    cookies: {
                        whitelistedNames: ["*"],
                        forward: "none",
                    },
                    queryString: false,
                    headers: ["*"],
                    queryStringCacheKeys: ["*"],
                },
                cachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                lambdaFunctionAssociation: [
                    {
                        eventType: "origin-request",
                        lambdaArn: "arn:aws:lambda:us-east-1:111111111111:function:my-function",
                        includeBody: true,
                    },
                ],
                fieldLevelEncryptionId: "1234567890abcdef1234567890abcdef",
                maxTtl: 86400,
                minTtl: 0,
                originRequestPolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                realtimeLogConfigArn: "arn:aws:logs:us-east-1:111111111111:realtime-log-config/my-distribution",
                responseHeadersPolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                smoothStreaming: true,
                targetOriginId: "my-target-origin",
                trustedKeyGroups: ["1234567890abcdef1234567890abcdef"],
                functionAssociation: [
                    {
                        eventType: "viewer-request",
                        functionArn: "arn:aws:lambda:us-east-1:111111111111:function:my-function",
                    },
                ],
                trustedSigners: ["1234567890abcdef1234567890abcdef"],
                viewerProtocolPolicy: "redirect-to-https",
            },
            aliases: ["example.com", "cnames.com"],
            comment: "My CloudFront distribution",
            customErrorResponse: [
                {
                    errorCode: 404,
                    responseCode: 200,
                    responsePagePath: "/index.html",
                    errorCachingMinTtl: 300,
                },
            ],
            defaultRootObject: "index.html",
            enabled: true,
            httpVersion: "http2",
            isIpv6Enabled: true,
            priceClass: "PriceClass_100",
            restrictions: {
                geoRestriction: {
                    restrictionType: "whitelist",
                    locations: ["US", "CA", "GB"],
                },
            },
            viewerCertificate: {
                acmCertificateArn:
                    "arn:aws:acm:us-east-1:111111111111:certificate/12345678-1234-1234-1234-123456789012",
                minimumProtocolVersion: "TLSv1.2_2019",
                sslSupportMethod: "sni-only",
                iamCertificateId: "1234567890abcdef1234567890abcdef1234567890abcdef",
                cloudfrontDefaultCertificate: true,
            },
            orderedCacheBehavior: [
                {
                    grpcConfig: {
                        enabled: true,
                    },
                    allowedMethods: ["GET", "HEAD"],
                    cachedMethods: ["GET", "HEAD"],
                    compress: true,
                    defaultTtl: 3600,
                    forwardedValues: {
                        cookies: {
                            forward: "none",
                            whitelistedNames: ["*"],
                        },
                        queryString: false,
                        headers: ["*"],
                        queryStringCacheKeys: ["*"],
                    },
                    cachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                    lambdaFunctionAssociation: [
                        {
                            eventType: "origin-request",
                            includeBody: true,
                            lambdaArn: "arn:aws:lambda:us-east-1:111111111111:function:my-function",
                        },
                    ],
                    fieldLevelEncryptionId: "1234567890abcdef1234567890abcdef",
                    maxTtl: 86400,
                    minTtl: 0,
                    originRequestPolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                    pathPattern: "/images/*",
                    realtimeLogConfigArn: "arn:aws:logs:us-east-1:111111111111:realtime-log-config/my-distribution",
                    responseHeadersPolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                    smoothStreaming: true,
                    targetOriginId: "my-target-origin",
                    viewerProtocolPolicy: "redirect-to-https",
                    trustedKeyGroups: ["1234567890abcdef1234567890abcdef"],
                    trustedSigners: ["1234567890abcdef1234567890abcdef"],
                    functionAssociation: [
                        {
                            eventType: "viewer-request",
                            functionArn: "arn:aws:lambda:us-east-1:111111111111:function:my-function",
                        },
                    ],
                },
            ],
            continuousDeploymentPolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
            loggingConfig: {
                bucket: "my-logs.s3.amazonaws.com",
                includeCookies: true,
                prefix: "myprefix",
            },
            originGroup: [
                {
                    failoverCriteria: {
                        statusCodes: [500, 502],
                    },
                    member: [{
                        originId: "my-origin",
                    }],
                    originId: "my-origin-group",
                },
            ],
            webAclId: "arn:aws:wafv2:us-east-1:111111111111:regional/webacl/my-web-acl",
            origin: [
                {
                    connectionAttempts: 3,
                    connectionTimeout: 10,
                    customHeader: [
                        {
                            name: "MyCustomHeader",
                            value: "MyCustomValue",
                        },
                    ],
                    customOriginConfig: {
                        httpPort: 80,
                        httpsPort: 443,
                        originKeepaliveTimeout: 5,
                        originProtocolPolicy: "https-only",
                        originReadTimeout: 30,
                        originSslProtocols: ["TLSv1.2"],
                    },
                    domainName: "origins.com",
                    originAccessControlId: "1234567890abcdef1234567890abcdef",
                    originId: "my-origin",
                    originPath: "/mypath",
                    originShield: {
                        originShieldRegion: "us-east-1",
                        enabled: true,
                    },
                    s3OriginConfig: {
                        originAccessIdentity: "origin-access-identity/cloudfront/E127EXAMPLE51Z",
                    },
                } as DeepRequiredProperties<CloudfrontDistributionOrigin>,
            ],
            staging: true,
        },
        [
            "distributionConfig.s3Origin",
            "distributionConfig.customOrigin",
            "distributionConfig.originGroups.items.*.selectionCriteria",
            "distributionConfig.anycastIpListId",
        ],
    );

    itShouldMapCfnElementToTerraformResource(
        CfnDistribution,
        {
            tags: [{
                key: "Name",
                value: "my-distribution",
            }],
            distributionConfig: {
                anycastIpListId: "anycast-ip-list-id",
                s3Origin: {
                    originAccessIdentity: "origin-access-identity/cloudfront/E127EXAMPLE51Z",
                    dnsName: "example.com",
                },
                customOrigin: {
                    httpPort: 80,
                    httpsPort: 443,
                    originProtocolPolicy: "https-only",
                    originSslProtocols: ["TLSv1.2"],
                    dnsName: "example.com",
                },
                comment: "My CloudFront distribution",
                customErrorResponses: [{
                    errorCode: 404,
                    responseCode: 200,
                    responsePagePath: "/index.html",
                    errorCachingMinTtl: 300,
                }],
                defaultRootObject: "index.html",
                httpVersion: "http2",
                ipv6Enabled: true,
                priceClass: "PriceClass_100",
                aliases: ["aliases.com"],
                continuousDeploymentPolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                logging: {
                    bucket: "my-logs.s3.amazonaws.com",
                    includeCookies: true,
                    prefix: "myprefix",
                },
                webAclId: "arn:aws:wafv2:us-east-1:111111111111:regional/webacl/my-web-acl",
                staging: true,
                originGroups: {
                    items: [
                        {
                            id: "my-origin-group",
                            selectionCriteria: "selection-criteria",
                            failoverCriteria: {
                                statusCodes: {
                                    items: [500, 502],
                                    quantity: 2,
                                },
                            },
                            members: {
                                items: [
                                    {
                                        originId: "my-origin",
                                    },
                                ],
                                quantity: 1,
                            },
                        },
                    ],
                    quantity: 1,
                },
                cnamEs: ["example.com"],
                cacheBehaviors: [
                    {
                        grpcConfig: {
                            enabled: true,
                        },
                        allowedMethods: ["GET", "HEAD"],
                        cachedMethods: ["GET", "HEAD"],
                        compress: true,
                        defaultTtl: 3600,
                        forwardedValues: {
                            cookies: {
                                forward: "none",
                                whitelistedNames: ["*"],
                            },
                            queryString: false,
                            headers: ["*"],
                            queryStringCacheKeys: ["*"],
                        },
                        cachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                        lambdaFunctionAssociations: [
                            {
                                eventType: "origin-request",
                                lambdaFunctionArn: "arn:aws:lambda:us-east-1:111111111111:function:my-function",
                                includeBody: true,
                            },
                        ],
                        fieldLevelEncryptionId: "1234567890abcdef1234567890abcdef",
                        maxTtl: 86400,
                        minTtl: 0,
                        originRequestPolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                        pathPattern: "/images/*",
                        realtimeLogConfigArn: "arn:aws:logs:us-east-1:111111111111:realtime-log-config/my-distribution",
                        responseHeadersPolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                        smoothStreaming: true,
                        targetOriginId: "my-target-origin",
                        trustedKeyGroups: ["1234567890abcdef1234567890abcdef"],
                        functionAssociations: [
                            {
                                eventType: "viewer-request",
                                functionArn: "arn:aws:lambda:us-east-1:111111111111:function:my-function",
                            },
                        ],
                        trustedSigners: ["123"],
                        viewerProtocolPolicy: "redirect-to-https",
                    },
                ],
                defaultCacheBehavior: {
                    grpcConfig: {
                        enabled: true,
                    },
                    allowedMethods: ["GET", "HEAD"],
                    cachedMethods: ["GET", "HEAD"],
                    compress: true,
                    defaultTtl: 3600,
                    forwardedValues: {
                        cookies: {
                            whitelistedNames: ["*"],
                            forward: "none",
                        },
                        queryString: false,
                        headers: ["*"],
                        queryStringCacheKeys: ["*"],
                    },
                    cachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                    lambdaFunctionAssociations: [
                        {
                            eventType: "origin-request",
                            lambdaFunctionArn: "arn:aws:lambda:us-east-1:111111111111:function:my-function",
                            includeBody: true,
                        },
                    ],
                    fieldLevelEncryptionId: "1234567890abcdef1234567890abcdef",
                    maxTtl: 86400,
                    minTtl: 0,
                    originRequestPolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                    realtimeLogConfigArn: "arn:aws:logs:us-east-1:111111111111:realtime-log-config/my-distribution",
                    responseHeadersPolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                    smoothStreaming: true,
                    targetOriginId: "my-target-origin",
                    trustedKeyGroups: ["1234567890abcdef1234567890abcdef"],
                    functionAssociations: [
                        {
                            eventType: "viewer-request",
                            functionArn: "arn:aws:lambda:us-east-1:111111111111:function:my-function",
                        },
                    ],
                    trustedSigners: ["1234567890abcdef1234567890abcdef"],
                    viewerProtocolPolicy: "redirect-to-https",
                },
                enabled: true,
                restrictions: {
                    geoRestriction: {
                        restrictionType: "whitelist",
                        locations: ["US", "CA", "GB"],
                    },
                },
                viewerCertificate: {
                    acmCertificateArn:
                        "arn:aws:acm:us-east-1:111111111111:certificate/12345678-1234-1234-1234-123456789012",
                    minimumProtocolVersion: "TLSv1.2_2019",
                    sslSupportMethod: "sni-only",
                    iamCertificateId: "1234567890abcdef1234567890abcdef1234567890abcdef",
                    cloudFrontDefaultCertificate: true,
                },
                origins: [{
                    customOriginConfig: {
                        httpPort: 80,
                        httpsPort: 443,
                        originKeepaliveTimeout: 5,
                        originProtocolPolicy: "https-only",
                        originReadTimeout: 30,
                        originSslProtocols: ["TLSv1.2"],
                    },
                    domainName: "example.com",
                    id: "my-origin",
                    connectionAttempts: 3,
                    connectionTimeout: 10,
                    originAccessControlId: "1234567890abcdef1234567890abcdef",
                    originPath: "/mypath",
                    originShield: {
                        originShieldRegion: "us-east-1",
                        enabled: true,
                    },
                    originCustomHeaders: [{
                        headerName: "MyCustomHeader",
                        headerValue: "MyCustomValue",
                    }],
                    s3OriginConfig: {
                        originAccessIdentity: "origin-access-identity/cloudfront/E127EXAMPLE51Z",
                    },
                }],
            },
        },
        CloudfrontDistribution,
        {
            tags: {
                Name: "my-distribution",
            },
            aliases: ["aliases.com", "example.com"],
            comment: "My CloudFront distribution",
            customErrorResponse: [
                {
                    errorCode: 404,
                    responseCode: 200,
                    responsePagePath: "/index.html",
                    errorCachingMinTtl: 300,
                },
            ],
            defaultRootObject: "index.html",
            httpVersion: "http2",
            isIpv6Enabled: true,
            priceClass: "PriceClass_100",
            continuousDeploymentPolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
            loggingConfig: {
                bucket: "my-logs.s3.amazonaws.com",
                includeCookies: true,
                prefix: "myprefix",
            },
            webAclId: "arn:aws:wafv2:us-east-1:111111111111:regional/webacl/my-web-acl",
            staging: true,
            waitForDeployment: undefined,
            retainOnDelete: undefined,
            originGroup: [
                {
                    failoverCriteria: {
                        statusCodes: [500, 502],
                    },
                    member: [
                        {
                            originId: "my-origin",
                        },
                    ],
                    originId: "my-origin-group",
                },
            ],
            orderedCacheBehavior: [
                {
                    grpcConfig: {
                        enabled: true,
                    },
                    allowedMethods: ["GET", "HEAD"],
                    cachedMethods: ["GET", "HEAD"],
                    compress: true,
                    defaultTtl: 3600,
                    forwardedValues: {
                        cookies: {
                            forward: "none",
                            whitelistedNames: ["*"],
                        },
                        queryString: false,
                        headers: ["*"],
                        queryStringCacheKeys: ["*"],
                    },
                    cachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                    lambdaFunctionAssociation: [
                        {
                            eventType: "origin-request",
                            lambdaArn: "arn:aws:lambda:us-east-1:111111111111:function:my-function",
                            includeBody: true,
                        },
                    ],
                    fieldLevelEncryptionId: "1234567890abcdef1234567890abcdef",
                    maxTtl: 86400,
                    minTtl: 0,
                    originRequestPolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                    pathPattern: "/images/*",
                    realtimeLogConfigArn: "arn:aws:logs:us-east-1:111111111111:realtime-log-config/my-distribution",
                    responseHeadersPolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                    smoothStreaming: true,
                    targetOriginId: "my-target-origin",
                    viewerProtocolPolicy: "redirect-to-https",
                    trustedKeyGroups: ["1234567890abcdef1234567890abcdef"],
                    trustedSigners: ["123"],
                    functionAssociation: [
                        {
                            eventType: "viewer-request",
                            functionArn: "arn:aws:lambda:us-east-1:111111111111:function:my-function",
                        },
                    ],
                },
            ],
            defaultCacheBehavior: {
                grpcConfig: {
                    enabled: true,
                },
                allowedMethods: ["GET", "HEAD"],
                cachedMethods: ["GET", "HEAD"],
                compress: true,
                defaultTtl: 3600,
                forwardedValues: {
                    cookies: {
                        forward: "none",
                        whitelistedNames: ["*"],
                    },
                    queryString: false,
                    headers: ["*"],
                    queryStringCacheKeys: ["*"],
                },
                cachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                lambdaFunctionAssociation: [
                    {
                        eventType: "origin-request",
                        lambdaArn: "arn:aws:lambda:us-east-1:111111111111:function:my-function",
                        includeBody: true,
                    },
                ],
                fieldLevelEncryptionId: "1234567890abcdef1234567890abcdef",
                maxTtl: 86400,
                minTtl: 0,
                originRequestPolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                realtimeLogConfigArn: "arn:aws:logs:us-east-1:111111111111:realtime-log-config/my-distribution",
                responseHeadersPolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
                smoothStreaming: true,
                targetOriginId: "my-target-origin",
                trustedKeyGroups: ["1234567890abcdef1234567890abcdef"],
                functionAssociation: [
                    {
                        eventType: "viewer-request",
                        functionArn: "arn:aws:lambda:us-east-1:111111111111:function:my-function",
                    },
                ],
                trustedSigners: ["1234567890abcdef1234567890abcdef"],
                viewerProtocolPolicy: "redirect-to-https",
            },
            enabled: true,
            restrictions: {
                geoRestriction: {
                    restrictionType: "whitelist",
                    locations: ["US", "CA", "GB"],
                },
            },
            viewerCertificate: {
                iamCertificateId: "1234567890abcdef1234567890abcdef1234567890abcdef",
                cloudfrontDefaultCertificate: true,
                acmCertificateArn:
                    "arn:aws:acm:us-east-1:111111111111:certificate/12345678-1234-1234-1234-123456789012",
                minimumProtocolVersion: "TLSv1.2_2019",
                sslSupportMethod: "sni-only",
            },
            origin: [
                {
                    connectionAttempts: 3,
                    connectionTimeout: 10,
                    customHeader: [
                        {
                            name: "MyCustomHeader",
                            value: "MyCustomValue",
                        },
                    ],
                    domainName: "example.com",
                    originAccessControlId: "1234567890abcdef1234567890abcdef",
                    originId: "my-origin",
                    originPath: "/mypath",
                    originShield: {
                        originShieldRegion: "us-east-1",
                        enabled: true,
                    },
                    s3OriginConfig: {
                        originAccessIdentity: "origin-access-identity/cloudfront/E127EXAMPLE51Z",
                    },
                    customOriginConfig: {
                        httpPort: 80,
                        httpsPort: 443,
                        originKeepaliveTimeout: 5,
                        originProtocolPolicy: "https-only",
                        originReadTimeout: 30,
                        originSslProtocols: ["TLSv1.2"],
                    },
                } as DeepRequiredProperties<CloudfrontDistributionOrigin>,
            ],
        },
        [
            "distributionConfig.s3Origin",
            "distributionConfig.customOrigin",
            "distributionConfig.originGroups.items.*.selectionCriteria",
            "distributionConfig.anycastIpListId",
        ],
    );
});
