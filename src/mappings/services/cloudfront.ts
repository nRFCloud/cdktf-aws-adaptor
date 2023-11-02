import {
  CloudfrontDistribution,
  CloudfrontDistributionConfig,
} from "@cdktf/provider-aws/lib/cloudfront-distribution/index.js";
import { CloudfrontOriginAccessIdentity } from "@cdktf/provider-aws/lib/cloudfront-origin-access-identity/index.js";
import { CfnCloudFrontOriginAccessIdentity, CfnDistribution } from "aws-cdk-lib/aws-cloudfront";
import { deleteUndefinedKeys, registerMappingTyped } from "../utils.js";

export function registerCloudfrontMappings() {
  registerMappingTyped(CfnCloudFrontOriginAccessIdentity, CloudfrontOriginAccessIdentity, {
    resource: (scope, id, props) => {
      return new CloudfrontOriginAccessIdentity(scope, id, {
        comment: props?.CloudFrontOriginAccessIdentityConfig?.Comment,
      });
    },
    attributes: {
      Id: (resource) => resource.id,
      S3CanonicalUserId: (resource) => resource.s3CanonicalUserId,
      Ref: (resource) => resource.id,
    },
  });

  registerMappingTyped(CfnDistribution, CloudfrontDistribution, {
    resource: (scope, id, props) => {
      if (props.DistributionConfig.S3Origin != null) {
        throw new Error("Legacy S3Origin is not supported");
      }
      if (props.DistributionConfig.CustomOrigin != null) {
        throw new Error("Legacy CustomOrigin is not supported");
      }

      const mapCacheBehavior = (behavior: (typeof props)["DistributionConfig"]["DefaultCacheBehavior"]) => ({
        functionAssociation: behavior.FunctionAssociations?.map(association => ({
          eventType: association.EventType as string,
          functionArn: association.FunctionARN as string,
        })),
        cachePolicyId: behavior.CachePolicyId,
        lambdaFunctionAssociation: behavior.LambdaFunctionAssociations?.map(association => ({
          eventType: association.EventType!,
          lambdaArn: association.LambdaFunctionARN!,
          includeBody: association.IncludeBody,
        })),
        allowedMethods: behavior.AllowedMethods!,
        cachedMethods: behavior.CachedMethods!,
        compress: behavior.Compress,
        defaultTtl: behavior.DefaultTTL,
        fieldLevelEncryptionId: behavior.FieldLevelEncryptionId,
        forwardedValues: {
          cookies: {
            forward: behavior.ForwardedValues?.Cookies?.Forward as string,
            whitelistedNames: behavior.ForwardedValues?.Cookies?.WhitelistedNames,
          },
          headers: behavior.ForwardedValues?.Headers,
          queryString: behavior.ForwardedValues?.QueryString as boolean,
          queryStringCacheKeys: behavior.ForwardedValues?.QueryStringCacheKeys,
        },
        maxTtl: behavior.MaxTTL,
        minTtl: behavior.MinTTL,
        originRequestPolicyId: behavior.OriginRequestPolicyId,
        realtimeLogConfigArn: behavior.RealtimeLogConfigArn,
        responseHeadersPolicyId: behavior.ResponseHeadersPolicyId,
        smoothStreaming: behavior.SmoothStreaming,
        targetOriginId: behavior.TargetOriginId!,
        trustedKeyGroups: behavior.TrustedKeyGroups,
        trustedSigners: behavior.TrustedSigners,
        viewerProtocolPolicy: behavior.ViewerProtocolPolicy!,
      });
      const aliases = [...(props.DistributionConfig.Aliases || []), ...(props.DistributionConfig.CNAMEs || [])];
      const config: CloudfrontDistributionConfig = {
        aliases,
        tags: Object.fromEntries(
          props.Tags?.map(({
            Key: key,
            Value: value,
          }) => [key, value]) || [],
        ),
        enabled: props.DistributionConfig.Enabled,
        isIpv6Enabled: props.DistributionConfig.IPV6Enabled,
        comment: props.DistributionConfig.Comment,
        continuousDeploymentPolicyId: props.DistributionConfig.ContinuousDeploymentPolicyId,
        defaultCacheBehavior: mapCacheBehavior(props.DistributionConfig.DefaultCacheBehavior),
        customErrorResponse: props.DistributionConfig.CustomErrorResponses?.map(response => ({
          errorCachingMinTtl: response.ErrorCachingMinTTL,
          errorCode: response.ErrorCode as number,
          responseCode: response.ResponseCode,
          responsePagePath: response.ResponsePagePath,
        })),
        defaultRootObject: props.DistributionConfig.DefaultRootObject,
        httpVersion: props.DistributionConfig.HttpVersion,
        loggingConfig: {
          bucket: props.DistributionConfig.Logging?.Bucket as string,
          includeCookies: props.DistributionConfig.Logging?.IncludeCookies,
          prefix: props.DistributionConfig.Logging?.Prefix,
        },
        orderedCacheBehavior: props.DistributionConfig.CacheBehaviors?.map(behavior => ({
          ...mapCacheBehavior(behavior),
          pathPattern: behavior.PathPattern as string,
        })),
        origin: props.DistributionConfig.Origins?.map(origin => ({
          originId: origin.Id as string,
          domainName: origin.DomainName as string,
          customHeader: origin.OriginCustomHeaders?.map(header => ({
            name: header.HeaderName as string,
            value: header.HeaderValue as string,
          })),
          connectionAttempts: origin.ConnectionAttempts,
          connectionTimeout: origin.ConnectionTimeout,
          customOriginConfig: {
            httpPort: origin.CustomOriginConfig?.HTTPPort as number,
            httpsPort: origin.CustomOriginConfig?.HTTPSPort as number,
            originKeepaliveTimeout: origin.CustomOriginConfig?.OriginKeepaliveTimeout,
            originProtocolPolicy: origin.CustomOriginConfig?.OriginProtocolPolicy as string,
            originReadTimeout: origin.CustomOriginConfig?.OriginReadTimeout,
            originSslProtocols: origin.CustomOriginConfig?.OriginSSLProtocols as string[],
          },
          originPath: origin.OriginPath,
          originAccessControlId: origin.OriginAccessControlId,
          originShield: {
            enabled: origin.OriginShield?.Enabled as boolean,
            originShieldRegion: origin.OriginShield?.OriginShieldRegion,
          },
          s3OriginConfig: {
            originAccessIdentity: origin.S3OriginConfig?.OriginAccessIdentity as string,
          },
        })) || [],
        originGroup: props.DistributionConfig.OriginGroups?.Items?.map(group => ({
          failoverCriteria: {
            statusCodes: group.FailoverCriteria?.StatusCodes?.Items,
          },
          originId: group.Id as string,
          member: group.Members?.Items?.map(member => ({
            originId: member.OriginId as string,
          })),
        })) || [],
        priceClass: props.DistributionConfig.PriceClass,
        restrictions: {
          geoRestriction: {
            restrictionType: props.DistributionConfig.Restrictions?.GeoRestriction?.RestrictionType as string,
            locations: props.DistributionConfig.Restrictions?.GeoRestriction?.Locations,
          },
        },
        viewerCertificate: {
          acmCertificateArn: props.DistributionConfig.ViewerCertificate?.AcmCertificateArn,
          cloudfrontDefaultCertificate: props.DistributionConfig.ViewerCertificate?.CloudFrontDefaultCertificate,
          iamCertificateId: props.DistributionConfig.ViewerCertificate?.IamCertificateId,
          minimumProtocolVersion: props.DistributionConfig.ViewerCertificate?.MinimumProtocolVersion,
          sslSupportMethod: props.DistributionConfig.ViewerCertificate?.SslSupportMethod,
        },
        webAclId: props.DistributionConfig.WebACLId,
        staging: props.DistributionConfig.Staging,
      };

      return new CloudfrontDistribution(scope, id, deleteUndefinedKeys(config));
    },
    attributes: {
      Ref: (resource) => resource.id,
      Id: (resource) => resource.id,
      DomainName: (resource) => resource.domainName,
    },
  });
}
