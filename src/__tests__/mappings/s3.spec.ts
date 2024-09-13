import { S3BucketPolicy } from "@cdktf/provider-aws/lib/s3-bucket-policy/index.js";
import { CfnBucketPolicy } from "aws-cdk-lib/aws-s3";
import { App, Fn } from "cdktf";
import { resolve } from "cdktf/lib/_tokens.js";
import { synthesizeElementAndTestStability } from "../helpers.js";
import { registerMappings } from "../../mappings/index.js";
import { setupJest } from "cdktf/lib/testing/adapters/jest.js";

registerMappings();
setupJest();

describe("S3 mappings", () => {
    it("Should map AWS::S3::BucketPolicy", () => {
        synthesizeElementAndTestStability(
            CfnBucketPolicy,
            {
                bucket: "test-bucket",
                policyDocument: {
                    Version: "2012-10-17",
                    Statement: [
                        {
                            Sid: "test-sid",
                            Effect: "Allow",
                            Principal: "*",
                            Action: ["s3:GetObject"],
                            Resource: ["arn:aws:s3:::test-bucket/*"],
                        },
                    ],
                },
            },
            S3BucketPolicy,
            {
                bucket: "test-bucket",
                policy: resolve(
                    new App(),
                    Fn.jsonencode({
                        Version: "2012-10-17",
                        Statement: [
                            {
                                Sid: "test-sid",
                                Effect: "Allow",
                                Principal: "*",
                                Action: ["s3:GetObject"],
                                Resource: ["arn:aws:s3:::test-bucket/*"],
                            },
                        ],
                    }),
                ),
            },
        );
    });
});
