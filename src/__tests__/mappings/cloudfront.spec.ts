import { CloudfrontOriginAccessIdentity } from "@cdktf/provider-aws/lib/cloudfront-origin-access-identity/index.js";
import { CfnCloudFrontOriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";
import { itShouldMapCfnElementToTerraformResource } from "../helpers.js";

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
});
