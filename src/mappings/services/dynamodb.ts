export function registerDynamoDBMappings() {
  // Use CC native resource
  //
  // registerMappingTyped( CfnTable, DynamodbTable, {
  //   resource(scope, id, tableProps) {
  //     const mapped: DynamodbTableConfig = {
  //       name: tableProps.TableName!,
  //       // eslint-disable-next-line @typescript-eslint/naming-convention
  //       tags: Object.fromEntries(tableProps.Tags?.map(({ Key, Value }) => [Key, Value]) || []),
  //       deletionProtectionEnabled: tableProps.DeletionProtectionEnabled,
  //       ttl: {
  //         enabled: tableProps.TimeToLiveSpecification?.Enabled,
  //         attributeName: tableProps.TimeToLiveSpecification?.AttributeName as string,
  //       },
  //       tableClass: tableProps.TableClass,
  //       globalSecondaryIndex: tableProps.GlobalSecondaryIndexes?.map(index => ({
  //         name: index.IndexName,
  //         hashKey: index.KeySchema.find(key => key.KeyType === "HASH")?.AttributeName as string,
  //         rangeKey: index.KeySchema.find(key => key.KeyType === "RANGE")?.AttributeName as string,
  //         projectionType: index.Projection.ProjectionType || "ALL",
  //         nonKeyAttributes: index.Projection.NonKeyAttributes,
  //         readCapacity: index.ProvisionedThroughput?.ReadCapacityUnits,
  //         writeCapacity: index.ProvisionedThroughput?.WriteCapacityUnits,
  //       })),
  //       hashKey: tableProps.KeySchema.find(key => key.KeyType === "HASH")?.AttributeName as string,
  //       rangeKey: tableProps.KeySchema.find(key => key.KeyType === "RANGE")?.AttributeName as string,
  //       readCapacity: tableProps.ProvisionedThroughput?.ReadCapacityUnits,
  //       writeCapacity: tableProps.ProvisionedThroughput?.WriteCapacityUnits,
  //       streamViewType: tableProps.StreamSpecification?.StreamViewType,
  //       streamEnabled: tableProps.StreamSpecification?.StreamViewType != undefined,
  //       attribute: tableProps.AttributeDefinitions?.map(attr => ({
  //         name: attr.AttributeName,
  //         type: attr.AttributeType,
  //       })),
  //       localSecondaryIndex: tableProps.LocalSecondaryIndexes?.map(index => ({
  //         name: index.IndexName,
  //         hashKey: index.KeySchema.find(key => key.KeyType === "HASH")?.AttributeName as string,
  //         rangeKey: index.KeySchema.find(key => key.KeyType === "RANGE")?.AttributeName as string,
  //         projectionType: index.Projection.ProjectionType || "ALL",
  //         nonKeyAttributes: index.Projection.NonKeyAttributes,
  //       })),
  //       pointInTimeRecovery: {
  //         enabled: tableProps.PointInTimeRecoverySpecification?.PointInTimeRecoveryEnabled || false,
  //       },
  //       billingMode: tableProps.BillingMode,
  //       serverSideEncryption: {
  //         enabled: tableProps.SSESpecification?.SSEEnabled || false,
  //         kmsKeyArn: tableProps.SSESpecification?.KmsMasterKeyId,
  //       },
  //     };
  //
  //     const table = new DynamodbTable(scope, id, deleteUndefinedKeys(mapped));
  //     table.name = mapped.name || Names.uniqueResourceName(table, {
  //       maxLength: 64,
  //     });
  //     return table;
  //   },
  //   unsupportedProps: ["KinesisStreamSpecification", "ContributorInsightsSpecification", "ImportSourceSpecification"],
  //   attributes: {
  //     Arn: resource => resource.arn,
  //     StreamArn: resource => resource.streamArn,
  //     Ref: resource => resource.id,
  //   },
  // });
}
