// import { Instance, InstanceConfig } from "@cdktf/provider-aws/lib/instance/index.js";
// import { CfnInstance } from "aws-cdk-lib/aws-ec2";
// import { Fn, type IResolvable } from "cdktf";
// import { deleteUndefinedKeys, registerMappingTyped } from "../utils.js";
// import { DataAwsSecurityGroup } from "@cdktf/provider-aws/lib/data-aws-security-group/index.js";

// const VPC_INFO_SYMBOL = Symbol("vpcInfo");

export function registerEC2InstanceMappings() {
    // registerMappingTyped(CfnInstance, Instance, {
    //     resource(scope, id, props, proxy) {
    //         const rootBlockDevice = props?.BlockDeviceMappings?.find(bdm => bdm.DeviceName === "/dev/xvda" || bdm.DeviceName === "/dev/sda1");
    //         const ebsBlockDevices = props?.BlockDeviceMappings?.filter(bdm => bdm.DeviceName !== "/dev/xvda" && bdm.DeviceName !== "/dev/sda1" && bdm.Ebs);
    //         const ephemeralBlockDevices = props?.BlockDeviceMappings?.filter(bdm => bdm.DeviceName !== "/dev/xvda" && bdm.DeviceName !== "/dev/sda1" && (bdm.VirtualName || bdm.NoDevice));

    //         proxy.touchPath("BlockDeviceMappings");
    //         const config: InstanceConfig = {
    //             // Required properties
    //             instanceType: props?.InstanceType,
    //             ami: props?.ImageId,

    //             // Optional properties with direct mapping

    //             availabilityZone: props?.AvailabilityZone,
    //             cpuCoreCount: props?.CpuOptions?.CoreCount,
    //             cpuThreadsPerCore: props?.CpuOptions?.ThreadsPerCore,
    //             disableApiTermination: props?.DisableApiTermination,
    //             ebsOptimized: props?.EbsOptimized,
    //             hibernation: props?.HibernationOptions?.Configured,
    //             hostId: props?.HostId,
    //             iamInstanceProfile: props?.IamInstanceProfile,
    //             instanceInitiatedShutdownBehavior: props?.InstanceInitiatedShutdownBehavior,
    //             ipv6AddressCount: props?.Ipv6AddressCount,
    //             keyName: props?.KeyName,
    //             monitoring: props?.Monitoring,
    //             placementGroup: props?.PlacementGroupName,
    //             privateIp: props?.PrivateIpAddress,
    //             sourceDestCheck: props?.SourceDestCheck,
    //             subnetId: props?.SubnetId,
    //             tenancy: props?.Tenancy,
    //             userData: props?.UserData && Fn.base64decode(props?.UserData),
    //             userDataReplaceOnChange: true,

    //             rootBlockDevice: rootBlockDevice ? {
    //                 deleteOnTermination: rootBlockDevice.Ebs?.DeleteOnTermination,
    //                 encrypted: rootBlockDevice.Ebs?.Encrypted,
    //                 iops: rootBlockDevice.Ebs?.Iops,
    //                 kmsKeyId: rootBlockDevice.Ebs?.KmsKeyId,
    //                 volumeSize: rootBlockDevice.Ebs?.VolumeSize,
    //                 volumeType: rootBlockDevice.Ebs?.VolumeType,
    //             } : undefined,

    //             ebsBlockDevice: ebsBlockDevices?.map(bdm => ({
    //                 deviceName: bdm.DeviceName,
    //                 deleteOnTermination: bdm.Ebs?.DeleteOnTermination,
    //                 encrypted: bdm.Ebs?.Encrypted,
    //                 iops: bdm.Ebs?.Iops,
    //                 kmsKeyId: bdm.Ebs?.KmsKeyId,
    //                 snapshotId: bdm.Ebs?.SnapshotId,
    //                 volumeSize: bdm.Ebs?.VolumeSize,
    //                 volumeType: bdm.Ebs?.VolumeType,
    //             })),

    //             ephemeralBlockDevice: ephemeralBlockDevices?.map(bdm => ({
    //                 deviceName: bdm.DeviceName,
    //                 virtualName: bdm.VirtualName,
    //                 noDevice: bdm.NoDevice ? true : undefined,
    //             })),

    //             // Network interfaces
    //             networkInterface: props?.NetworkInterfaces?.map(ni => ({
    //                 deviceIndex: Fn.tonumber(ni.DeviceIndex),
    //                 networkInterfaceId: ni.NetworkInterfaceId as string,
    //                 deleteOnTermination: ni.DeleteOnTermination,
    //                 associatePublicIpAddress: ni.AssociatePublicIpAddress,
    //             })),

    //             // Credit specification for T2/T3 instances
    //             creditSpecification: props?.CreditSpecification && {
    //                 cpuCredits: props?.CreditSpecification.CpuCredits,
    //             },

    //             securityGroups: props?.SecurityGroups,

    //             // Tags
    //             tags: Object.fromEntries(
    //                 props?.Tags?.map(({ Key, Value }) => [Key, Value]) || []
    //             ),

    //             // VPC Security Groups
    //             vpcSecurityGroupIds: props?.SecurityGroupIds,
    //         };

    //         const instance = new Instance(scope, id, deleteUndefinedKeys(config));

    //         if (props?.SecurityGroupIds && props?.SecurityGroupIds.length > 0) {
    //             const securityGroupData = new DataAwsSecurityGroup(scope, "securityGroup", {
    //                 id: props?.SecurityGroupIds[0],
    //             });
    //             (instance as any)[VPC_INFO_SYMBOL] = securityGroupData;
    //         }

    //         return instance;
    //     },
    //     unsupportedProps: [
    //         "AdditionalInfo",
    //         "Affinity",
    //     ],
    //     attributes: {
    //         AvailabilityZone: (instance) => instance.availabilityZone,
    //         PrivateDnsName: (instance) => instance.privateDns,
    //         PrivateIp: (instance) => instance.privateIp,
    //         PublicDnsName: (instance) => instance.publicDns,
    //         PublicIp: (instance) => instance.publicIp,
    //         InstanceId: (instance) => instance.id,
    //         Ref: (instance) => instance.id,
    //         State: (instance) => instance.instanceState as unknown as IResolvable,
    //         VpcId: (instance) => (instance as any)[VPC_INFO_SYMBOL].vpcId,
    //     },
    // });
}
