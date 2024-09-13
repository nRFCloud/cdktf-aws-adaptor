import {setupJest} from "cdktf/lib/testing/adapters/jest.js";
import {AwsTerraformAdaptorStack} from "../../lib/core/cdk-adaptor-stack.js";
import {LocalBackend, Testing} from "cdktf";
import {Cluster, KubernetesVersion} from "aws-cdk-lib/aws-eks"
import {registerMappings} from "../../mappings/index.js";
import {Key} from "aws-cdk-lib/aws-kms"
import {itShouldMapCfnElementToTerraformResource} from "../helpers.js";
import {CfnDBCluster} from "aws-cdk-lib/aws-rds";
import tf_aws from "@cdktf/provider-aws";

setupJest();
registerMappings();

describe("RDS mappings", () => {
    describe("AWS::RDS::DBCluster", () => {
        itShouldMapCfnElementToTerraformResource(CfnDBCluster, {
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
                }
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
                }
            ],
        
        }, tf_aws.rdsCluster.RdsCluster, {
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
            port: 3306,
            
        })
    })
});
