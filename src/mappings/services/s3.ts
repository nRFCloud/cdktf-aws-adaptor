import { S3BucketPolicy } from "@cdktf/provider-aws/lib/s3-bucket-policy/index.js";
import { CfnBucketPolicy } from "aws-cdk-lib/aws-s3";
import { Fn } from "cdktf";
import { deleteUndefinedKeys, registerMappingTyped } from "../utils.js";

export function registerS3Mappings() {
  registerMappingTyped(CfnBucketPolicy, S3BucketPolicy, {
    resource(scope, id, props) {
      return new S3BucketPolicy(
        scope,
        id,
        deleteUndefinedKeys({
          policy: Fn.jsonencode(props.PolicyDocument),
          bucket: props.Bucket,
        }),
      );
    },
    attributes: {
      Ref: (resource) => resource.id,
    },
  });
}
