import tf_aws from "@cdktf/provider-aws";
import { CfnDBCluster } from "aws-cdk-lib/aws-rds";
import { setupJest } from "cdktf/lib/testing/adapters/jest.js";
import { registerMappings } from "../../mappings/index.js";
import { itShouldMapCfnElementToTerraformResource } from "../helpers.js";

setupJest();
registerMappings();

describe.skip("RDS mappings", () => {
    describe("AWS::RDS::DBCluster", () => {
        itShouldMapCfnElementToTerraformResource(
            CfnDBCluster,
            {
                domain: "example.com",
                domainIamRoleName: "role",
                enableIamDatabaseAuthentication: true,
                masterUserPassword: "password",
                masterUsername: "user",
                storageEncrypted: true,
                storageType: "gp2",
                engine: "aurora-postgresql",
                engineMode: "provisioned",
                globalClusterIdentifier: "global",
                preferredBackupWindow: "window",
                preferredMaintenanceWindow: "window",
                sourceRegion: "region",
                port: 3306,
                manageMasterUserPassword: true,
                enableHttpEndpoint: true,
                networkType: "vpc",
                engineLifecycleSupport: "beta",
                performanceInsightsEnabled: true,
                performanceInsightsKmsKeyId: "key",
                performanceInsightsRetentionPeriod: 7,
                masterUserSecret: {
                    kmsKeyId: "key",
                    secretArn: "arn",
                },
                kmsKeyId: "key",
                iops: 1000,
                dbSystemId: "system",
                associatedRoles: [
                    {
                        roleArn: "role",
                        featureName: "name",
                    },
                ],
                serverlessV2ScalingConfiguration: {
                    maxCapacity: 2,
                    minCapacity: 1,
                },
                autoMinorVersionUpgrade: true,
                backupRetentionPeriod: 7,
                backtrackWindow: 7,
                deletionProtection: true,
                enableCloudwatchLogsExports: ["log"],
                enableGlobalWriteForwarding: true,
                enableLocalWriteForwarding: true,
                allocatedStorage: 100,
                dbClusterInstanceClass: "db.t2.micro",
                snapshotIdentifier: "snapshot",
                engineVersion: "10.4",
                availabilityZones: ["zone"],
                dbClusterIdentifier: "cluster",
                databaseName: "database",
                dbClusterParameterGroupName: "group",
                dbSubnetGroupName: "subnet",
                vpcSecurityGroupIds: ["group"],
                restoreToTime: "time",
                useLatestRestorableTime: true,
                sourceDbClusterIdentifier: "cluster",
                restoreType: "type",
                dbInstanceParameterGroupName: "group",
                replicationSourceIdentifier: "source",
                copyTagsToSnapshot: true,
                publiclyAccessible: true,
                monitoringInterval: 60,
                monitoringRoleArn: "role",
                scalingConfiguration: {
                    minCapacity: 1,
                    maxCapacity: 2,
                    autoPause: true,
                    secondsUntilAutoPause: 300,
                    secondsBeforeTimeout: 300,
                    timeoutAction: "ForceApplyCapacityChange",
                },
                tags: [
                    {
                        key: "key",
                        value: "value",
                    },
                ],
            },
            tf_aws.rdsCluster.RdsCluster,
            {
                domain: "example.com",
                domainIamRoleName: "role",
                masterPassword: "password",
                masterUsername: "user",
                storageEncrypted: true,
                storageType: "gp2",
                engine: "aurora-postgresql",
                engineMode: "provisioned",
                globalClusterIdentifier: "global",
                preferredBackupWindow: "window",
                preferredMaintenanceWindow: "window",
                sourceRegion: "region",
                port: 3306,
                manageMasterUserPassword: true,
                enableHttpEndpoint: true,
                networkType: "vpc",
                allocatedStorage: 100,
                dbClusterInstanceClass: "db.t2.micro",
                snapshotIdentifier: "snapshot",
                engineVersion: "10.4",
                availabilityZones: ["zone"],
                clusterIdentifier: "cluster",
                databaseName: "database",
                dbClusterParameterGroupName: "group",
                dbSubnetGroupName: "subnet",
                allowMajorVersionUpgrade: true,
                backupRetentionPeriod: 7,
                backtrackWindow: 7,
                deletionProtection: true,
                enableGlobalWriteForwarding: true,
                enableLocalWriteForwarding: true,
                iops: 1000,
                performanceInsightsEnabled: true,
                performanceInsightsRetentionPeriod: 7,
                performanceInsightsKmsKeyId: "key",
                tags: {
                    key: "value",
                },
                kmsKeyId: "key",
                scalingConfiguration: {
                    minCapacity: 1,
                    maxCapacity: 2,
                    autoPause: true,
                    secondsUntilAutoPause: 300,
                    secondsBeforeTimeout: 300,
                    timeoutAction: "ForceApplyCapacityChange",
                },
                dbSystemId: "system",
                copyTagsToSnapshot: true,
                dbInstanceParameterGroupName: "group",
                replicationSourceIdentifier: "source",
                vpcSecurityGroupIds: ["group"],
                engineLifecycleSupport: "beta",
                applyImmediately: true,
                caCertificateIdentifier: "arn",
                clusterIdentifierPrefix: "prefix",
                clusterMembers: ["member"],
                deleteAutomatedBackups: true,
                enabledCloudwatchLogsExports: ["log"],
                iamRoles: [
                    "role",
                ],
                iamDatabaseAuthenticationEnabled: true,
                masterUserSecretKmsKeyId: "key",
                s3Import: {
                    bucketPrefix: "prefix",
                    ingestionRole: "role",
                    sourceEngine: "engine",
                    sourceEngineVersion: "version",
                    bucketName: "bucket",
                },
                finalSnapshotIdentifier: "snapshot",
                serverlessv2ScalingConfiguration: {
                    maxCapacity: 2,
                    minCapacity: 1,
                },
                timeouts: undefined,
                skipFinalSnapshot: true,
                restoreToPointInTime: {
                    restoreToTime: "time",
                    useLatestRestorableTime: true,
                    sourceClusterIdentifier: "cluster",
                    restoreType: "type",
                    sourceClusterResourceId: "resource",
                },
            },
        );
    });
});
