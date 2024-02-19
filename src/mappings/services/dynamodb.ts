import { DynamodbContributorInsights } from "@cdktf/provider-aws/lib/dynamodb-contributor-insights/index.js";
import { DynamodbKinesisStreamingDestination } from "@cdktf/provider-aws/lib/dynamodb-kinesis-streaming-destination/index.js";
import { DynamodbTable, DynamodbTableConfig } from "@cdktf/provider-aws/lib/dynamodb-table/index.js";
import { Names } from "aws-cdk-lib";
import { CfnTable } from "aws-cdk-lib/aws-dynamodb";
import { deleteUndefinedKeys, registerMappingTyped } from "../utils.js";

export function registerDynamoDBMappings() {
  registerMappingTyped(CfnTable, DynamodbTable, {
    resource(scope, id, tableProps) {
      const globalIndexInsights: string[] = [];
      const mapped: DynamodbTableConfig = {
        name: tableProps.TableName!,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        tags: Object.fromEntries(tableProps.Tags?.map(({ Key, Value }) => [Key, Value]) || []),
        deletionProtectionEnabled: tableProps.DeletionProtectionEnabled,
        ttl: {
          enabled: tableProps.TimeToLiveSpecification?.Enabled,
          attributeName: tableProps.TimeToLiveSpecification?.AttributeName as string,
        },
        tableClass: tableProps.TableClass,
        globalSecondaryIndex: tableProps.GlobalSecondaryIndexes?.map(index => {
          if (index.ContributorInsightsSpecification?.Enabled) {
            globalIndexInsights.push(index.IndexName as string);
          }
          return {
            name: index.IndexName,
            hashKey: index.KeySchema.find(key => key.KeyType === "HASH")?.AttributeName as string,
            rangeKey: index.KeySchema.find(key => key.KeyType === "RANGE")?.AttributeName as string,
            projectionType: index.Projection.ProjectionType || "ALL",
            nonKeyAttributes: index.Projection.NonKeyAttributes,
            readCapacity: index.ProvisionedThroughput?.ReadCapacityUnits,
            writeCapacity: index.ProvisionedThroughput?.WriteCapacityUnits,
          };
        }),
        hashKey: tableProps.KeySchema.find(key => key.KeyType === "HASH")?.AttributeName as string,
        rangeKey: tableProps.KeySchema.find(key => key.KeyType === "RANGE")?.AttributeName as string,
        readCapacity: tableProps.ProvisionedThroughput?.ReadCapacityUnits,
        writeCapacity: tableProps.ProvisionedThroughput?.WriteCapacityUnits,
        streamViewType: tableProps.StreamSpecification?.StreamViewType,
        streamEnabled: tableProps.StreamSpecification?.StreamViewType != undefined,
        attribute: tableProps.AttributeDefinitions?.map(attr => ({
          name: attr.AttributeName,
          type: attr.AttributeType,
        })),

        localSecondaryIndex: tableProps.LocalSecondaryIndexes?.map(index => ({
          name: index.IndexName,
          rangeKey: index.KeySchema.find(key => key.KeyType === "RANGE")?.AttributeName as string,
          projectionType: index.Projection.ProjectionType || "ALL",
          nonKeyAttributes: index.Projection.NonKeyAttributes,
        })),
        pointInTimeRecovery: {
          enabled: tableProps.PointInTimeRecoverySpecification?.PointInTimeRecoveryEnabled || false,
        },
        billingMode: tableProps.BillingMode,
        serverSideEncryption: {
          enabled: tableProps.SSESpecification?.SSEEnabled || false,
          kmsKeyArn: tableProps.SSESpecification?.KMSMasterKeyId,
        },
        importTable: {
          s3BucketSource: {
            bucket: tableProps.ImportSourceSpecification?.S3BucketSource?.S3Bucket as string,
            bucketOwner: tableProps.ImportSourceSpecification?.S3BucketSource?.S3BucketOwner,
            keyPrefix: tableProps.ImportSourceSpecification?.S3BucketSource?.S3KeyPrefix,
          },
          inputCompressionType: tableProps.ImportSourceSpecification?.InputCompressionType,
          inputFormat: tableProps.ImportSourceSpecification?.InputFormat as string,
          inputFormatOptions: {
            csv: {
              delimiter: tableProps.ImportSourceSpecification?.InputFormatOptions?.Csv?.Delimiter,
              headerList: tableProps.ImportSourceSpecification?.InputFormatOptions?.Csv?.HeaderList,
            },
          },
        },
      };

      const table = new DynamodbTable(scope, id, deleteUndefinedKeys(mapped));
      table.name = mapped.name || Names.uniqueResourceName(table, {
        maxLength: 64,
      });

      if (tableProps.KinesisStreamSpecification) {
        new DynamodbKinesisStreamingDestination(scope, `${id}-kinesis-streaming-destination`, {
          streamArn: tableProps.KinesisStreamSpecification.StreamArn as string,
          tableName: mapped.name,
        });
      }

      for (const index of globalIndexInsights) {
        new DynamodbContributorInsights(scope, `${id}-${index}-contributor-insights`, {
          tableName: mapped.name,
          indexName: index,
        });
      }

      if (tableProps.ContributorInsightsSpecification) {
        new DynamodbContributorInsights(scope, `${id}-contributor-insights`, {
          tableName: mapped.name,
        });
      }

      return table;
    },
    unsupportedProps: [],
    attributes: {
      Arn: resource => resource.arn,
      StreamArn: resource => resource.streamArn,
      Ref: resource => resource.id,
    },
  });
}
