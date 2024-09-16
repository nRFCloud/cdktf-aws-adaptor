import { Cluster, KubernetesVersion } from "aws-cdk-lib/aws-eks";
import { Key } from "aws-cdk-lib/aws-kms";
import { LocalBackend, Testing } from "cdktf";
import { setupJest } from "cdktf/lib/testing/adapters/jest.js";
import { AwsTerraformAdaptorStack } from "../../lib/core/cdk-adaptor-stack.js";
import { registerMappings } from "../../mappings/index.js";

setupJest();
registerMappings();

describe.skip("ECS mappings", () => {
    describe("Custom::AWSCDK-ECS-Cluster", () => {
        it("should translate", () => {
            class TestClass extends AwsTerraformAdaptorStack {
                public readonly backend = new LocalBackend(this, {
                    path: `/terraform.${this.node.id}.tfstate`,
                });

                public readonly cluster = new Cluster(this, "cluster", {
                    version: KubernetesVersion.V1_30,
                    secretsEncryptionKey: Key.fromKeyArn(
                        this,
                        "key",
                        "arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012",
                    ),
                });
            }

            const app = Testing.app();
            const testStack = new TestClass(app, "test-stack", {
                region: "us-east-1",
            });

            testStack.prepareStack();
            const synthStack = Testing.synth(testStack);
            expect(synthStack).toMatchSnapshot();
        });
    });
});
