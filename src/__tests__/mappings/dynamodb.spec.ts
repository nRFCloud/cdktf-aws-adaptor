import { DynamodbTable } from "@cdktf/provider-aws/lib/dynamodb-table/index.js";
import { CfnTable } from "aws-cdk-lib/aws-dynamodb";
import { setupJest } from "cdktf/lib/testing/adapters/jest.js";
import { itShouldMapCfnElementToTerraformResource } from "../helpers.js";

setupJest();

describe("DynamoDB mappings", () => {
    itShouldMapCfnElementToTerraformResource(
        CfnTable,
        {
            tags: [
                {
                    key: "Name",
                    value: "test-table",
                },
            ],
            tableName: "test-table",
            timeToLiveSpecification: {
                attributeName: "test-attribute-name",
                enabled: true,
            },
            tableClass: "test-table-class",
            globalSecondaryIndexes: [
                {
                    warmThroughput: {
                        readUnitsPerSecond: 1,
                        writeUnitsPerSecond: 1,
                    },
                    indexName: "test-index",
                    contributorInsightsSpecification: {
                        enabled: true,
                    },
                    keySchema: [
                        {
                            attributeName: "test-attribute-name",
                            keyType: "HASH",
                        },
                        {
                            attributeName: "test-attribute-name-range",
                            keyType: "RANGE",
                        },
                    ],
                    projection: {
                        projectionType: "ALL",
                        nonKeyAttributes: ["test"],
                    },
                    provisionedThroughput: {
                        readCapacityUnits: 1,
                        writeCapacityUnits: 1,
                    },
                    onDemandThroughput: {
                        maxReadRequestUnits: 1,
                        maxWriteRequestUnits: 1,
                    },
                },
            ],
            resourcePolicy: {
                policyDocument: {
                    Version: "2012-10-17",
                    Statement: [
                        {
                            Effect: "Allow",
                            Principal: {
                                Service: "dynamodb.amazonaws.com",
                            },
                            Action: "dynamodb:DescribeTable",
                            Resource: "*",
                        },
                    ],
                },
            },
            keySchema: [
                {
                    attributeName: "test-attribute-name",
                    keyType: "HASH",
                },
                {
                    attributeName: "test-attribute-name-range",
                    keyType: "RANGE",
                },
            ],
            provisionedThroughput: {
                readCapacityUnits: 1,
                writeCapacityUnits: 1,
            },
            streamSpecification: {
                streamViewType: "NEW_IMAGE",
                resourcePolicy: {
                    policyDocument: {
                        Version: "2012-10-17",
                        Statement: [
                            {
                                Effect: "Allow",
                                Principal: {
                                    Service: "dynamodb.amazonaws.com",
                                },
                                Action: "dynamodb:DescribeTable",
                                Resource: "*",
                            },
                        ],
                    },
                },
            },
            attributeDefinitions: [
                {
                    attributeName: "test-attribute-name",
                    attributeType: "S",
                },
            ],
            localSecondaryIndexes: [
                {
                    indexName: "test-index",
                    keySchema: [
                        {
                            attributeName: "test-attribute-name",
                            keyType: "HASH",
                        },
                        {
                            attributeName: "test-attribute-name-range",
                            keyType: "RANGE",
                        },
                    ],
                    projection: {
                        projectionType: "ALL",
                        nonKeyAttributes: ["test"],
                    },
                },
            ],
            warmThroughput: {
                readUnitsPerSecond: 1,
                writeUnitsPerSecond: 1,
            },
            pointInTimeRecoverySpecification: {
                recoveryPeriodInDays: 1,
                pointInTimeRecoveryEnabled: true,
            },
            billingMode: "PROVISIONED",
            sseSpecification: {
                sseEnabled: true,
                kmsMasterKeyId: "test-kms-master-key-id",
                sseType: "KMS",
            },
            contributorInsightsSpecification: {
                enabled: true,
            },
            deletionProtectionEnabled: true,
            kinesisStreamSpecification: {
                approximateCreationDateTimePrecision: "MILLISECONDS",
                streamArn: "test-stream-arn",
            },
            importSourceSpecification: {
                s3BucketSource: {
                    s3Bucket: "test-s3-bucket",
                    s3BucketOwner: "test-s3-bucket-owner",
                    s3KeyPrefix: "test-s3",
                },
                inputCompressionType: "NONE",
                inputFormat: "JSON",
                inputFormatOptions: {
                    csv: {
                        delimiter: "test-delimiter",
                        headerList: ["test-header-list"],
                    },
                },
            },
            onDemandThroughput: {
                maxReadRequestUnits: 1,
                maxWriteRequestUnits: 1,
            },
        },
        DynamodbTable,
        {
            replica: undefined,
            restoreDateTime: undefined,
            timeouts: undefined,
            restoreSourceName: undefined,
            restoreSourceTableArn: undefined,
            restoreToLatestTime: undefined,
            tags: {
                Name: "test-table",
            },
            name: "test-table",
            deletionProtectionEnabled: true,
            ttl: {
                attributeName: "test-attribute-name",
                enabled: true,
            },
            tableClass: "test-table-class",
            onDemandThroughput: {
                maxReadRequestUnits: 1,
                maxWriteRequestUnits: 1,
            },
            globalSecondaryIndex: [
                {
                    onDemandThroughput: {
                        maxReadRequestUnits: 1,
                        maxWriteRequestUnits: 1,
                    },
                    name: "test-index",
                    hashKey: "test-attribute-name",
                    projectionType: "ALL",
                    readCapacity: 1,
                    rangeKey: "test-attribute-name-range",
                    writeCapacity: 1,
                    nonKeyAttributes: ["test"],
                },
            ],
            hashKey: "test-attribute-name",
            rangeKey: "test-attribute-name-range",
            billingMode: "PROVISIONED",
            streamViewType: "NEW_IMAGE",
            attribute: [
                {
                    name: "test-attribute-name",
                    type: "S",
                },
            ],
            localSecondaryIndex: [
                {
                    name: "test-index",
                    projectionType: "ALL",
                    rangeKey: "test-attribute-name-range",
                    nonKeyAttributes: ["test"],
                },
            ],
            writeCapacity: 1,
            readCapacity: 1,
            pointInTimeRecovery: {
                enabled: true,
            },
            serverSideEncryption: {
                enabled: true,
                kmsKeyArn: "test-kms-master-key-id",
            },
            importTable: {
                s3BucketSource: {
                    bucket: "test-s3-bucket",
                    keyPrefix: "test-s3",
                    bucketOwner: "test-s3-bucket-owner",
                },
                inputCompressionType: "NONE",
                inputFormat: "JSON",
                inputFormatOptions: {
                    csv: {
                        delimiter: "test-delimiter",
                        headerList: ["test-header-list"],
                    },
                },
            },
            streamEnabled: true,
        },
        [
            "pointInTimeRecoverySpecification.recoveryPeriodInDays",
            "warmThroughput",
            "globalSecondaryIndexes.*.warmThroughput",
            "sseSpecification.sseType",
            "kinesisStreamSpecification.approximateCreationDateTimePrecision",
        ],
    );
});
