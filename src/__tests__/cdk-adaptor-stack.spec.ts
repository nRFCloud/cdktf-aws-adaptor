import { AppsyncGraphqlApi } from "@cdktf/provider-aws/lib/appsync-graphql-api/index.js";
import { CloudcontrolapiResource } from "@cdktf/provider-aws/lib/cloudcontrolapi-resource/index.js";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role/index.js";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider/index.js";
import { S3BucketPolicy } from "@cdktf/provider-aws/lib/s3-bucket-policy/index.js";
import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket/index.js";
import { S3Object } from "@cdktf/provider-aws/lib/s3-object/index.js";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Bucket, CfnBucketPolicy } from "aws-cdk-lib/aws-s3";
import { App, DataTerraformRemoteState, dependable, Fn, LocalBackend, TerraformElement, Testing } from "cdktf";
import { resolve } from "cdktf/lib/_tokens.js";
import { setupJest } from "cdktf/lib/testing/adapters/jest.js";
import { readFileSync, statSync } from "node:fs";
import * as path from "node:path";
import * as url from "node:url";
import { AwsTerraformAdaptorStack } from "../lib/core/cdk-adaptor-stack.js";
import { ImplicitDependencyAspect } from "../mappings/implicit-dependency-aspect.js";
import { registerMappings } from "../mappings/index.js";
import { resourceMappings } from "../mappings/utils.js";

setupJest();

const dirname = url.fileURLToPath(new URL(".", import.meta.url));
registerMappings();

class BucketTestStack extends AwsTerraformAdaptorStack {
    public readonly awsCdkbucket = new Bucket(this, "aws-cdk-test-bucket", {
        bucketName: "aws-cdk-test-bucket",
    });
    public readonly cdktfBucket = new S3Bucket(this, "cdktf-test-bucket", {
        bucket: "cdktf-test-bucket",
    });
}

class ReferencingStack extends AwsTerraformAdaptorStack {
    public readonly awsCdkbucket: Bucket;
    public readonly cdktfBucket: S3Bucket;

    public readonly backend = new LocalBackend(this, {
        path: `/terraform.${this.node.id}.tfstate`,
    });

    constructor(scope: App, id: string, awsCdkBucketName: string, cdktfBucketName: string) {
        super(scope, id, {
            region: "us-east-1",
            useCloudControlFallback: false,
        });
        this.awsCdkbucket = new Bucket(this, "aws-cdk-test-bucket", {
            bucketName: awsCdkBucketName,
        });
        this.cdktfBucket = new S3Bucket(this, "cdktf-test-bucket", {
            bucket: cdktfBucketName,
        });
    }
}

function ridiculouslyNestedFunction(username: string): string {
    const lowercase = Fn.lower("test" + username);
    // return AWFFn.sub(username, {
    //     "/": ".",
    //     "-": "_",
    //     "+": ".",
    //     "=": "_",
    //     ",": "_",
    //     "@": ".",
    // }).

    const replaceSlashes = Fn.replace(lowercase, "/", ".");
    const replaceDashes = Fn.replace(replaceSlashes, "-", "_");
    const replacePluses = Fn.replace(replaceDashes, "+", ".");
    const replaceEquals = Fn.replace(replacePluses, "=", "_");
    const replaceCommas = Fn.replace(replaceEquals, ",", "_");
    return Fn.replace(replaceCommas, "@", ".");
}

describe("Stack synthesis", () => {
    it.skip("Should support basic stack synthesis with mixed resources", () => {
        const testApp = Testing.app({});
        const testStack = new BucketTestStack(testApp, "test-stack", {
            region: "us-east-1",
            useCloudControlFallback: false,
        });

        testStack.prepareStack();
        expect(Testing.fullSynth(testStack)).toBeValidTerraform();
    });

    describe("Should handle implicit dependencies", () => {
        it("Should add implicit dependencies to resources", () => {
            class TestStack extends AwsTerraformAdaptorStack {
                public readonly role = new IamRole(this, "role", {
                    assumeRolePolicy:
                        "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"lambda.amazonaws.com\"}}]}",
                });
                public readonly bucket = new S3Bucket(this, "bucket", {
                    bucket: "cool",
                });
                public readonly otherBucket = new S3Bucket(this, "other-bucket", {
                    bucket: this.bucket.bucket,
                });
                public readonly implicitDependency = ImplicitDependencyAspect.of(this.bucket, [this.role]);
            }

            const testApp = Testing.app();
            const testStack = new TestStack(testApp, "test-stack", {
                region: "us-east-1",
                useCloudControlFallback: false,
            });

            testStack.prepareStack();
            const synthed = Testing.synth(testStack);

            expect(synthed).toHaveResourceWithProperties(S3Bucket, {
                depends_on: ["aws_iam_role.role"],
            });

            expect(testStack.role).not.toHaveProperty("dependsOn");
            expect(testStack.role.node.dependencies).toHaveLength(0);

            expect(Testing.fullSynth(testStack)).toBeValidTerraform();
        });
    });

    describe("Should synthesize native terraform resources", () => {
        class ComplexNativeStack extends AwsTerraformAdaptorStack {
            public readonly api = new AppsyncGraphqlApi(this, "api", {
                lambdaAuthorizerConfig: {
                    authorizerResultTtlInSeconds: 300,
                    authorizerUri: "cool://uri",
                },
                userPoolConfig: {
                    defaultAction: "ALLOW",
                    userPoolId: "cool-pool-id",
                },
                additionalAuthenticationProvider: [
                    {
                        authenticationType: "API_KEY",
                        lambdaAuthorizerConfig: {
                            authorizerResultTtlInSeconds: 300,
                            authorizerUri: "cool://uri",
                        },
                    },
                ],
                authenticationType: "API_KEY",
                name: "cool-api",
            });
        }

        it("Should not perturb complex native resources", () => {
            const testApp = Testing.app();
            const stack = new ComplexNativeStack(testApp, "test-stack", {
                region: "us-east-1",
                useCloudControlFallback: false,
            });
            stack.prepareStack();
            const synthed = Testing.synth(stack);

            expect(synthed).toHaveResourceWithProperties(AppsyncGraphqlApi, {
                additional_authentication_provider: [
                    {
                        authentication_type: "API_KEY",
                        lambda_authorizer_config: {
                            authorizer_result_ttl_in_seconds: 300,
                            authorizer_uri: "cool://uri",
                        },
                    },
                ],
            });
        });

        it("Should resolve deeply nested tokens in cloudformation", () => {
            class NestedTokenStack extends AwsTerraformAdaptorStack {
                public readonly role = new Role(this, "role", {
                    assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
                });
                public readonly bucket = new Bucket(this, "bucket", {
                    bucketName: ridiculouslyNestedFunction(this.role.roleName),
                });
                public readonly s3Bucket = new S3Bucket(this, "s3-bucket", {
                    bucket: ridiculouslyNestedFunction(this.role.roleName),
                });
                public readonly bucketPolicy = new CfnBucketPolicy(this, "bucket-policy", {
                    bucket: ridiculouslyNestedFunction(this.role.roleName),
                    policyDocument: {},
                });
            }

            const testApp = Testing.app();
            const stack = new NestedTokenStack(testApp, "test-stack", {
                region: "us-east-1",
                useCloudControlFallback: false,
            });
            stack.prepareStack();
            const synthed = Testing.synth(stack);

            expect(synthed).toHaveResourceWithProperties(S3BucketPolicy, {
                bucket:
                    "${replace(replace(replace(replace(replace(replace(lower(join(\"\", [\"test\", aws_iam_role.role_C7B7E775.id])), \"/\", \".\"), \"-\", \"_\"), \"+\", \".\"), \"=\", \"_\"), \",\", \"_\"), \"@\", \".\")}",
            });

            expect(synthed).toHaveResourceWithProperties(S3Bucket, {
                bucket:
                    "${replace(replace(replace(replace(replace(replace(lower(join(\"\", [\"test\", aws_iam_role.role_C7B7E775.id])), \"/\", \".\"), \"-\", \"_\"), \"+\", \".\"), \"=\", \"_\"), \",\", \"_\"), \"@\", \".\")}",
            });
            // expect(synthed).toHaveResourceWithProperties(CloudcontrolapiResource, {
            //   desired_state:
            //     "${jsonencode({\"BucketName\" = replace(replace(replace(replace(replace(replace(lower(join(\"\", [\"test\", aws_cloudcontrolapi_resource.role_C7B7E775.id])), \"/\", \".\"), \"-\", \"_\"), \"+\", \".\"), \"=\", \"_\"), \",\", \"_\"), \"@\", \".\")})}",
            // });
        });
    });

    describe("Manage CloudContrlApi resources", () => {
        const original = resourceMappings["AWS::S3::Bucket"];

        beforeAll(() => {
            delete resourceMappings["AWS::S3::Bucket"];
        });
        afterAll(() => {
            resourceMappings["AWS::S3::Bucket"] = original;
        });

        it("Should not map using CloudControl when disabled", () => {
            class CloudControlDisabledStack extends AwsTerraformAdaptorStack {
                public readonly bucket = new Bucket(this, "bucket");
            }

            const testApp = Testing.app();
            const stack = new CloudControlDisabledStack(testApp, "test-stack", {
                useCloudControlFallback: false,
            });
            expect(() => stack.prepareStack()).toThrow("No mapping found");
        });
    });

    describe("Stack Resources", () => {
        const testApp = Testing.app();
        const testStack = new BucketTestStack(testApp, "test-stack-2", "us-east-1");
        testStack.prepareStack();
        const synthesized = Testing.synth(testStack);

        it("Should have converted the 'Resource' child of the construct", () => {
            expect(testStack.awsCdkbucket.node.tryFindChild("Resource")).toBeInstanceOf(TerraformElement);
        });

        it("Should have native s3 bucket", () => {
            expect(synthesized).toHaveResourceWithProperties(S3Bucket, {
                bucket: "cdktf-test-bucket",
            });
        });

        it("Should synthesize explicit provider specification", () => {
            const testApp = Testing.app();
            class TestStackWithCustomProvider extends AwsTerraformAdaptorStack {
                public readonly testProvider = new AwsProvider(this, "test-provider");
                public readonly bucket = new S3Bucket(this, "bucket", {
                    bucket: "cool-bucket",
                    provider: this.testProvider,
                });
            }
            const testStack = new TestStackWithCustomProvider(testApp, "test-stack-3", {});
            testStack.prepareStack();
            expect(Testing.synth.bind(Testing, testStack)).not.toThrow();
        });
    });

    describe("Dependency order preservation", () => {
        it("Should preserve dependencies on AWS CDK resources", () => {
            const testApp = Testing.app();
            const testStack = new BucketTestStack(testApp, "test-stack-3", "us-east-1");
            testStack.cdktfBucket.node.addDependency(testStack.awsCdkbucket);
            testStack.prepareStack();
            const synthesized = Testing.synth(testStack);

            const ref = resolve(
                testStack,
                dependable(testStack.awsCdkbucket.node.tryFindChild("Resource") as TerraformElement),
            );
            expect(synthesized).toHaveResourceWithProperties(S3Bucket, {
                depends_on: [ref],
            });
        });

        it("Should preserve dependencies on CDKTF resources", () => {
            const testApp = Testing.app();
            const testStack = new BucketTestStack(testApp, "test-stack-4", {
                region: "us-east-1",
                useCloudControlFallback: false,
            });
            testStack.awsCdkbucket.node.addDependency(testStack.cdktfBucket);
            testStack.prepareStack();
            const synthesized = Testing.synth(testStack);

            const ref = resolve(testStack, dependable(testStack.cdktfBucket));
            expect(synthesized).toHaveResourceWithProperties(S3Bucket, {
                depends_on: [ref],
            });
        });
    });

    describe("Token translation", () => {
        it("Should translate tokens pointing to AWS CDK resources in CDKTF resources", () => {
            class AwsCdkTokenRefStack extends AwsTerraformAdaptorStack {
                public readonly awsCdkbucket = new Bucket(this, "aws-cdk-test-bucket");
                public readonly cdktfBucket = new S3Bucket(this, "cdktf-test-bucket", {
                    bucket: this.awsCdkbucket.bucketName,
                });
            }

            const testApp = Testing.app();
            const testStack = new AwsCdkTokenRefStack(testApp, "test-stack-5", {
                region: "us-east-1",
                useCloudControlFallback: false,
            });
            testStack.prepareStack();
            const synthesized = Testing.synth(testStack);

            const ref = resolve(
                testStack,
                (testStack.awsCdkbucket.node.tryFindChild("Resource") as CloudcontrolapiResource).id,
            );

            expect(synthesized).toHaveResourceWithProperties(S3Bucket, {
                bucket: ref,
            });
        });

        it("Should translate tokens pointing to AWS CDK resources in other AWS CDK resources", () => {
            class AwsCdkTokenRefStack extends AwsTerraformAdaptorStack {
                public readonly awsCdkbucket = new Bucket(this, "aws-cdk-test-bucket");
                public readonly awsCdkBucket2 = new Bucket(this, "cdktf-test-bucket", {
                    bucketName: this.awsCdkbucket.bucketName,
                });
            }

            const testApp = Testing.app();
            const testStack = new AwsCdkTokenRefStack(testApp, "test-stack-6", {
                region: "us-east-1",
                useCloudControlFallback: false,
            });
            testStack.prepareStack();
            const synthesized = Testing.synth(testStack);
            const ref = resolve(
                testStack,
                (testStack.awsCdkbucket.node.tryFindChild("Resource") as CloudcontrolapiResource).id,
            ).slice(2, -1);

            expect(synthesized).toHaveResourceWithProperties(S3Bucket, {
                bucket: `$\{${ref}}`,
            });
        });

        it("Should translate token pointing to CDKTF resources within AWS CDK resources", () => {
            class AwsCdkTokenRefStack extends AwsTerraformAdaptorStack {
                public readonly cdktfBucket = new S3Bucket(this, "cdktf-test-bucket");
                public readonly awsCdkbucket = new Bucket(this, "aws-cdk-test-bucket", {
                    bucketName: this.cdktfBucket.bucket,
                });
            }

            const testApp = Testing.app();
            const testStack = new AwsCdkTokenRefStack(testApp, "test-stack-7", {
                region: "us-east-1",
                useCloudControlFallback: false,
            });
            testStack.prepareStack();
            const synthesized = Testing.synth(testStack);

            const ref = resolve(testStack, testStack.cdktfBucket.bucket).slice(2, -1);

            expect(synthesized).toHaveResourceWithProperties(S3Bucket, {
                bucket: `$\{${ref}}`,
            });
        });
    });

    describe("Inter-stack references", () => {
        it("Should support inter-stack references pointing from CDKTF to AWS CDK", () => {
            const testApp = Testing.app();
            const testStack1 = new ReferencingStack(
                testApp,
                "test-stack-8",
                "aws-cdk-test-bucket",
                "cdktf-test-bucket",
            );
            const testStack2 = new ReferencingStack(
                testApp,
                "test-stack-9",
                testStack1.awsCdkbucket.bucketName,
                testStack1.awsCdkbucket.bucketName,
            );
            testStack1.prepareStack();
            testStack2.prepareStack();
            const synthesized1 = Testing.synth(testStack1);
            const parsedSynth1 = JSON.parse(synthesized1);
            const synthesized2 = Testing.synth(testStack2);

            const bucketNameRef = resolve(
                testStack1,
                (testStack1.awsCdkbucket.node.tryFindChild("Resource") as S3Bucket).id,
            );
            const bucketNameOutputRef = bucketNameRef.slice(2, -1).replaceAll(".", "");

            expect(parsedSynth1.output).toMatchObject({
                [`cross-stack-output-${bucketNameOutputRef}`]: {
                    sensitive: true,
                    value: bucketNameRef,
                },
            });

            expect(synthesized2).toHaveDataSourceWithProperties(DataTerraformRemoteState, {
                backend: "local",
                config: {
                    path: "/terraform.test-stack-8.tfstate",
                },
            });

            expect(synthesized2).toHaveResourceWithProperties(S3Bucket, {
                bucket:
                    `$\{data.terraform_remote_state.cross-stack-reference-input-test-stack-8-aws-stage--test-stack-8-aws-stack--test-stack-8.outputs.cross-stack-output-${bucketNameOutputRef}}`,
            });
        });

        it("Should support inter-stack references pointing from AWS CDK to CDKTF", () => {
            const testApp = Testing.app();
            const testStack1 = new ReferencingStack(
                testApp,
                "test-stack-10",
                "aws-cdk-test-bucket",
                "cdktf-test-bucket",
            );
            const testStack2 = new ReferencingStack(
                testApp,
                "test-stack-11",
                testStack1.cdktfBucket.bucket,
                testStack1.cdktfBucket.bucket,
            );
            testStack1.prepareStack();
            testStack2.prepareStack();
            const synthesized1 = Testing.synth(testStack1);
            const parsedSynth1 = JSON.parse(synthesized1);
            const synthesized2 = Testing.synth(testStack2);

            const bucketNameRef = resolve(testStack1, testStack1.cdktfBucket.bucket);
            const bucketNameOutputRef = bucketNameRef.slice(2, -1).replaceAll(".", "");

            expect(parsedSynth1.output).toMatchObject({
                [`cross-stack-output-${bucketNameOutputRef}`]: {
                    sensitive: true,
                    value: bucketNameRef,
                },
            });

            expect(synthesized2).toHaveDataSourceWithProperties(DataTerraformRemoteState, {
                backend: "local",
                config: {
                    path: "/terraform.test-stack-10.tfstate",
                },
            });

            expect(synthesized2).toHaveResourceWithProperties(S3Bucket, {
                bucket:
                    `$\{data.terraform_remote_state.cross-stack-reference-input-test-stack-10-aws-stage--test-stack-10-aws-stack--test-stack-10.outputs.cross-stack-output-${bucketNameOutputRef}}`,
            });
        });

        it("Should support inter-stack references pointing from AWS CDK to AWS CDK", () => {
            const testApp = Testing.app({
                outdir: dirname,
            });
            const testStack1 = new ReferencingStack(
                testApp,
                "test-stack-12",
                "aws-cdk-test-bucket",
                "cdktf-test-bucket",
            );
            const testStack2 = new ReferencingStack(
                testApp,
                "test-stack-13",
                testStack1.awsCdkbucket.bucketName,
                testStack1.awsCdkbucket.bucketName,
            );
            testStack1.prepareStack();
            testStack2.prepareStack();

            const synthesized1 = Testing.synth(testStack1);
            const parsedSynth1 = JSON.parse(synthesized1);
            const synthesized2 = Testing.synth(testStack2);

            const bucketNameRef = resolve(
                testStack1,
                (testStack1.awsCdkbucket.node.tryFindChild("Resource") as S3Bucket).id,
            );
            const bucketNameOutputRef = bucketNameRef.slice(2, -1).replaceAll(".", "");

            expect(parsedSynth1.output).toMatchObject({
                [`cross-stack-output-${bucketNameOutputRef}`]: {
                    sensitive: true,
                    value: bucketNameRef,
                },
            });

            expect(synthesized2).toHaveDataSourceWithProperties(DataTerraformRemoteState, {
                backend: "local",
                config: {
                    path: "/terraform.test-stack-12.tfstate",
                },
            });

            expect(synthesized2).toHaveResourceWithProperties(S3Bucket, {
                bucket:
                    `$\{data.terraform_remote_state.cross-stack-reference-input-test-stack-12-aws-stage--test-stack-12-aws-stack--test-stack-12.outputs.cross-stack-output-${bucketNameOutputRef}}`,
            });
        });
    });

    describe("File assets", () => {
        it("Should support AWS CDK file assets", () => {
            class LambdaAssetStack extends AwsTerraformAdaptorStack {
                public readonly lambdaFunction = new Function(this, "lambda-function", {
                    code: Code.fromAsset(path.join(dirname, "..", "..", "test-data", "test-lambda-asset")),
                    handler: "index.handler",
                    runtime: Runtime.NODEJS_18_X,
                });
            }

            const testApp = Testing.app();
            const testStack = new LambdaAssetStack(testApp, "test-stack-14", {
                region: "us-east-1",
                useCloudControlFallback: false,
            });
            testStack.prepareStack();

            const outDir = Testing.fullSynth(testStack);
            const stackPath = path.join(outDir, "stacks", "test-stack-14");
            const tfJsonPath = path.join(stackPath, "cdk.tf.json");
            const tfJson = readFileSync(tfJsonPath, "utf8");
            const tfJsonParsed = JSON.parse(tfJson);
            const assetBucket = testStack.node.tryFindChild("AssetBucket") as S3Bucket;
            const bucketRef = resolve(testStack, assetBucket.bucket);
            const assetObject = testStack.node.findAll()
                .find(construct => construct instanceof S3Object) as S3Object;
            const assetPath = resolve(testStack, path.join(stackPath, assetObject.sourceInput!));

            expect(tfJsonParsed).toHaveProperty("resource.aws_s3_bucket.AssetBucket");

            expect(tfJson).toHaveResourceWithProperties(S3Object, {
                bucket: bucketRef,
            });

            const assetFileStat = statSync(assetPath);

            expect(assetFileStat.isFile()).toBe(true);
        });
    });
});
