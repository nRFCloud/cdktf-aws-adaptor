import { MskCluster } from "@cdktf/provider-aws/lib/msk-cluster/index.js";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { Key } from "aws-cdk-lib/aws-kms";
import { Testing } from "cdktf";
import { setupJest } from "cdktf/lib/testing/adapters/jest.js";
import { Cluster, KafkaVersion, PublicAccessType } from "../../../constructs/services/msk/index.js";
import { AwsTerraformAdaptorStack } from "../../../lib/core/cdk-adaptor-stack.js";
import { registerMappings } from "../../../mappings/index.js";

setupJest();
registerMappings();

describe.skip("MSK Constructs", () => {
    it("Should provision an MSK Cluster", () => {
        class Stack extends AwsTerraformAdaptorStack {
            public readonly vpc = new Vpc(this, "vpc", {});
            public readonly key = new Key(this, "key", {
                enabled: true,
            });
            public readonly mskCluster = new Cluster(this, "msk-cluster", {
                clusterName: "test-msk-cluster",
                vpc: this.vpc,
                kafkaVersion: KafkaVersion.V3_6_0,
                clientAuthentication: {
                    saslProps: {
                        iam: true,
                        key: this.key,
                    },
                },
                encryptionInTransit: {
                    enableInCluster: true,
                },
                publicAccess: PublicAccessType.SERVICE_PROVIDED_EIPS,
            });
        }
        const app = Testing.app();

        const stack = new Stack(app, "test-stack", "us-east-1");
        stack.prepareStack();
        const synth = Testing.synth(stack);

        expect(synth).toHaveResourceWithProperties(MskCluster, {
            cluster_name: "test-msk-cluster",
            kafka_version: "3.6.0",
        });
    });
});
