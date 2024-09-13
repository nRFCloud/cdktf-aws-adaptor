// import {registerMappingTyped} from "../utils.js";
// import {CfnDBCluster} from "aws-cdk-lib/aws-rds"
// import tf_aws from "@cdktf/provider-aws"
// import {IResolvable, Fn} from "cdktf";
//
// export function registerMappingsRds() {
//     registerMappingTyped(CfnDBCluster, tf_aws.rdsCluster.RdsCluster, {
//         resource(scope, id, props) {
//             const config: tf_aws.rdsCluster.RdsClusterConfig = {
//                 allocatedStorage: props?.AllocatedStorage,
//                 dbClusterInstanceClass: props?.DbClusterInstanceClass,
//                 snapshotIdentifier: props?.SnapshotIdentifier,
//                 engine: props!.Engine!,
//                 engineVersion: props?.EngineVersion,
//                 backtrackWindow: props?.BacktrackWindow,
//                 backupRetentionPeriod: props?.BackupRetentionPeriod,
//                 availabilityZones: props?.AvailabilityZones,
//                 clusterIdentifier: props?.DbClusterIdentifier,
//                 domain: props?.Domain,
//                 databaseName: props?.DatabaseName,
//                 dbClusterParameterGroupName: props?.DbClusterParameterGroupName,
//                 dbSubnetGroupName: props?.DbSubnetGroupName,
//                 vpcSecurityGroupIds: props?.VpcSecurityGroupIds,
//                 domainIamRoleName: props?.DomainIamRoleName,
//                 iamDatabaseAuthenticationEnabled: props?.EnableIamDatabaseAuthentication,
//                 masterPassword: props?.MasterUserPassword,
//                 masterUsername: props?.MasterUsername,
//                 storageEncrypted: props?.StorageEncrypted,
//                 storageType: props?.StorageType,
//                 engineMode: props?.EngineMode,
//                 enabledCloudwatchLogsExports: props?.EnableCloudwatchLogsExports,
//                 deletionProtection: props?.DeletionProtection,
//                 globalClusterIdentifier: props?.GlobalClusterIdentifier,
//                 preferredBackupWindow: props?.PreferredBackupWindow,
//                 preferredMaintenanceWindow: props?.PreferredMaintenanceWindow,
//                 sourceRegion: props?.SourceRegion,
//                 enableGlobalWriteForwarding: props?.EnableGlobalWriteForwarding,
//                 port: props?.Port,
//                 manageMasterUserPassword: props?.ManageMasterUserPassword,
//                 restoreToPointInTime: {
//                     restoreToTime: props?.RestoreToTime,
//                     useLatestRestorableTime: props?.UseLatestRestorableTime,
//                     sourceClusterIdentifier: props?.SourceDbClusterIdentifier,
//                     restoreType: props?.RestoreType,
//                 },
//                 dbInstanceParameterGroupName: props?.DbInstanceParameterGroupName,
//                 enableHttpEndpoint: props?.EnableHttpEndpoint,
//                 replicationSourceIdentifier: props?.ReplicationSourceIdentifier,
//                 networkType: props?.NetworkType,
//                 enableLocalWriteForwarding: props?.EnableLocalWriteForwarding,
//                 engineLifecycleSupport: props?.EngineLifecycleSupport,
//                 performanceInsightsEnabled: props?.PerformanceInsightsEnabled,
//                 performanceInsightsKmsKeyId: props?.PerformanceInsightsKmsKeyId,
//                 performanceInsightsRetentionPeriod: props?.PerformanceInsightsRetentionPeriod,
//                 masterUserSecretKmsKeyId: props?.MasterUserSecret?.KmsKeyId,
//                 kmsKeyId: props?.KmsKeyId,
//                 iops: props?.Iops,
//                 dbSystemId: props?.DbSystemId,
//                 iamRoles: props?.AssociatedRoles?.map(role => role.RoleArn),
//                 serverlessv2ScalingConfiguration: {
//                     maxCapacity: props!.ServerlessV2ScalingConfiguration!.MaxCapacity!,
//                     minCapacity: props!.ServerlessV2ScalingConfiguration!.MinCapacity!,
//                 },
//             }
//
//             return new tf_aws.rdsCluster.RdsCluster(scope, id, config);
//         },
//         attributes: {
//             Ref: (resource: tf_aws.rdsCluster.RdsCluster) => resource.id,
//             DbClusterArn: (resource: tf_aws.rdsCluster.RdsCluster) => resource.arn,
//             DbClusterResourceId: (resource: tf_aws.rdsCluster.RdsCluster) => resource.clusterResourceId,
//            EndpointPort: (resource: tf_aws.rdsCluster.RdsCluster) => Fn.tostring(resource.port),
//             EndpointAddress: (resource: tf_aws.rdsCluster.RdsCluster) => resource.endpoint,
//             ReadEndpointAddress: (resource: tf_aws.rdsCluster.RdsCluster) => resource.readerEndpoint,
//             StorageThroughput: (resource: tf_aws.rdsCluster.RdsCluster) => resource.iops,
//             MasterUserSecretSecretArn: (resource: tf_aws.rdsCluster.RdsCluster) => resource.masterUserSecret.get(0).secretArn,
//             ReadEndpoint: (resource: tf_aws.rdsCluster.RdsCluster) => resource.readerEndpoint as unknown as IResolvable,
//             Endpoint: (resource: tf_aws.rdsCluster.RdsCluster) => resource.endpoint as unknown as IResolvable,
//         },
//         unsupportedProps: []
//     })
// }
