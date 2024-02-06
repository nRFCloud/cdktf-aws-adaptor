import { S3BucketPolicy } from "@cdktf/provider-aws/lib/s3-bucket-policy/index.js";
import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket/index.js";
import { CfnBucket, CfnBucketPolicy } from "aws-cdk-lib/aws-s3";
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

  registerMappingTyped(CfnBucket, S3Bucket, {
    resource(scope, id, props) {
      return new S3Bucket(
        scope,
        id,
        deleteUndefinedKeys({
          accelerationStatus: props?.AccelerateConfiguration?.AccelerationStatus,
          acl: props?.AccessControl,
          bucket: props?.BucketName,
          bucketPrefix: id,
        }),
      );
    },

    attributes: {
      Ref: (resource) => resource.id,
      Arn: (resource) => resource.arn,
      DomainName: (resource) => resource.bucketDomainName,
      RegionalDomainName: (resource) => resource.bucketRegionalDomainName,
      WebsiteUrl: (resource) => resource.websiteDomain,
      DualStackDomainName: (resource) =>
        `${resource.bucket}.s3.dualstack.${resource.region.toLocaleLowerCase()}.amazonaws.com`,
    },
  });
}
