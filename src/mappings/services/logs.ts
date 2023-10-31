import { CloudwatchLogGroup } from "@cdktf/provider-aws/lib/cloudwatch-log-group/index.js";
import { TerraformStack } from "cdktf";
import { getDeletableObject, registerMapping } from "../utils.js";

interface LogRetentionProps {
  ServiceToken: string;
  LogGroupName: string;
  LogGroupRegion?: string;
  RetentionInDays?: string;
  SdkRetry?: {
    maxRetries?: string;
  };
  RemovalPolicy?: string;
}

export function registerLogMappings() {
  registerMapping("Custom::LogRetention", {
    resource: (scope, id, props) => {
      const {
        LogGroupName,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        LogGroupRegion,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        RemovalPolicy,
        RetentionInDays,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ServiceToken,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        SdkRetry,
      } = getDeletableObject(props) as LogRetentionProps;

      // There is no such thing as a "LogRetention" resource and there never was
      // Instead, we try to create it before whatever it is that wants it

      // Destroy existing policy and function
      TerraformStack.of(scope).node.tryRemoveChild("LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a");

      return new CloudwatchLogGroup(scope, id, {
        name: LogGroupName,
        retentionInDays: RetentionInDays ? Number.parseInt(RetentionInDays) : undefined,
      });
    },
    attributes: {
      Arn: resource => resource.arn,
      Name: resource => resource.name,
      Id: resource => resource.id,
    },
  });
}
