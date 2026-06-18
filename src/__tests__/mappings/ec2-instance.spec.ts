import { Instance, type InstanceConfig } from "@cdktf/provider-aws/lib/instance/index.js";
import { CfnInstance } from "aws-cdk-lib/aws-ec2";
import { setupJest } from "cdktf/lib/testing/adapters/jest.js";
import { synthesizeElementAndTestStability } from "../helpers.js";

setupJest();

describe("EC2 Instance mappings", () => {
    it.skip("should map cfn instance to terraform instance", () => {
        synthesizeElementAndTestStability(
            CfnInstance,
            {
                imageId: "ami-12345678",
                instanceType: "t3.micro",
                availabilityZone: "us-east-1a",
                tags: [{
                    key: "Name",
                    value: "test-instance",
                }],
                blockDeviceMappings: [
                    {
                        deviceName: "/dev/xvda",
                        ebs: {
                            snapshotId: "snap-12345678",
                            deleteOnTermination: true,
                            encrypted: true,
                            iops: 3000,
                            volumeSize: 100,
                            volumeType: "gp3",
                            kmsKeyId: "arn:aws:kms:us-east-1:123456789012:key/test-key",
                        },
                        noDevice: {},
                        virtualName: "virtual-name",
                    },
                    {
                        deviceName: "/dev/sdf",
                        ebs: {
                            snapshotId: "snap-12345678",
                            deleteOnTermination: true,
                            encrypted: true,
                            volumeSize: 20,
                            volumeType: "gp2",
                            iops: 3000,
                            kmsKeyId: "arn:aws:kms:us-east-1:123456789012:key/test-key",
                        },
                        noDevice: {},
                        virtualName: "virtual-name-2",
                    },
                ],
                cpuOptions: {
                    coreCount: 2,
                    threadsPerCore: 2,
                },
                creditSpecification: {
                    cpuCredits: "unlimited",
                },
                disableApiTermination: true,
                ebsOptimized: true,
                hibernationOptions: {
                    configured: true,
                },
                iamInstanceProfile: "test-instance-profile",
                instanceInitiatedShutdownBehavior: "terminate",
                keyName: "test-key-pair",
                monitoring: true,
                networkInterfaces: [
                    {
                        associatePublicIpAddress: true,
                        deleteOnTermination: true,
                        deviceIndex: "0",
                        networkInterfaceId: "eni-12345678",
                        associateCarrierIpAddress: true,
                        description: "test-network-interface",
                        groupSet: ["sg-12345678"],
                        ipv6AddressCount: 1,
                        privateIpAddress: "10.0.0.10",
                        subnetId: "subnet-12345678",
                        ipv6Addresses: [
                            {
                                ipv6Address: "2001:db8:1234:5678:90ab:cdef:1234:5678",
                            },
                        ],
                        privateIpAddresses: [
                            {
                                privateIpAddress: "10.0.0.10",
                                primary: true,
                            },
                        ],
                        secondaryPrivateIpAddressCount: 1,
                    },
                ],
                additionalInfo: "additional-info",
                affinity: "affinity",
                elasticGpuSpecifications: [
                    {
                        type: "type",
                    },
                ],
                enclaveOptions: {
                    enabled: true,
                },
                hostId: "host-12345678",
                hostResourceGroupArn: "arn:aws:resource-groups:us-east-1:123456789012:group/test-resource-group",
                ipv6AddressCount: 1,
                elasticInferenceAccelerators: [
                    {
                        type: "type",
                        count: 1,
                    },
                ],
                licenseSpecifications: [
                    {
                        licenseConfigurationArn:
                            "arn:aws:license-manager:us-east-1:123456789012:license-configuration/test-license-configuration",
                    },
                ],
                ipv6Addresses: [
                    {
                        ipv6Address: "2001:db8:1234:5678:90ab:cdef:1234:5678",
                    },
                ],
                kernelId: "kernel-12345678",
                launchTemplate: {
                    launchTemplateId: "lt-12345678",
                    version: "1",
                    launchTemplateName: "test-launch-template",
                },
                privateDnsNameOptions: {
                    hostnameType: "ip-name",
                    enableResourceNameDnsARecord: true,
                    enableResourceNameDnsAaaaRecord: true,
                },
                propagateTagsToVolumeOnCreation: true,
                placementGroupName: "test-placement-group",
                privateIpAddress: "10.0.0.10",
                ramdiskId: "ramdisk-12345678",
                securityGroupIds: ["sg-12345678"],
                ssmAssociations: [
                    {
                        associationParameters: [
                            {
                                key: "key",
                                value: ["value"],
                            },
                        ],
                        documentName: "document-name",
                    },
                ],
                securityGroups: ["sg-12345678"],
                volumes: [
                    {
                        device: "/dev/xvda",
                        volumeId: "vol-12345678",
                    },
                ],
                sourceDestCheck: true,
                subnetId: "subnet-12345678",
                tenancy: "default",
                userData: "IyEvYmluL2Jhc2gKZWNobyAiaGVsbG8gd29ybGQi", // base64 encoded
            },
            Instance,
            {
                ami: "ami-12345678",
                instanceType: "t3.micro",
                availabilityZone: "us-east-1a",
                tags: {
                    Name: "test-instance",
                },
                rootBlockDevice: {
                    deleteOnTermination: true,
                    encrypted: true,
                    iops: 3000,
                    volumeSize: 100,
                    volumeType: "gp3",
                    kmsKeyId: "arn:aws:kms:us-east-1:123456789012:key/test-key",
                },
                ebsBlockDevice: [
                    {
                        deviceName: "/dev/sdf",
                        deleteOnTermination: true,
                        encrypted: true,
                        volumeSize: 20,
                        volumeType: "gp2",
                    },
                ],
                cpuCoreCount: 2,
                cpuThreadsPerCore: 2,
                creditSpecification: {
                    cpuCredits: "unlimited",
                },
                disableApiTermination: true,
                ebsOptimized: true,
                hibernation: true,
                iamInstanceProfile: "test-instance-profile",
                instanceInitiatedShutdownBehavior: "terminate",
                keyName: "test-key-pair",
                monitoring: true,
                networkInterface: [
                    {
                        deleteOnTermination: true,
                        deviceIndex: 0,
                        networkInterfaceId: "eni-12345678",
                        networkCardIndex: 0,
                    },
                ],
                placementGroup: "test-placement-group",
                privateIp: "10.0.0.10",
                vpcSecurityGroupIds: ["sg-12345678"],
                sourceDestCheck: true,
                subnetId: "subnet-12345678",
                capacityReservationSpecification: {
                    capacityReservationPreference: "open",
                },
                capacityReservationTarget: {
                    capacityReservationId: "cr-12345678",
                },
                tenancy: "default",
                userData: "#!/bin/bash\necho \"hello world\"",
                userDataReplaceOnChange: true,
                userDataBase64: "IyEvYmluL2Jhc2gKZWNobyAiaGVsbG8gd29ybGQi",
                userDataReplaceOnChanges: [
                    "userData",
                ],
                enablePrimaryIpv6: true,
                ipv6AddressCount: 1,
                ipv6Addresses: ["2001:db8:1234:5678:90ab:cdef:1234:5678"],
                cpuOptions: {
                    coreCount: 2,
                    threadsPerCore: 2,
                },
                ephemeralBlockDevice: [
                    {
                        deviceName: "/dev/sdf",
                        virtualName: "ephemeral0",
                    },
                ],
                hibernationOptions: {
                    configured: true,
                },
            } as InstanceConfig,
            [
                "additionalInfo",
                "affinity",
            ],
        );
    });
});
