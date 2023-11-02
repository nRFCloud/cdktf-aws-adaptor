import { CloudfrontOriginAccessIdentity } from "@cdktf/provider-aws/lib/cloudfront-origin-access-identity/index.js";
import { CfnCloudFrontOriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";
import { registerMappingTyped } from "../utils.js";

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
}
