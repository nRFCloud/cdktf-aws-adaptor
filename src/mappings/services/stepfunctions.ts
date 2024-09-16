import { DataAwsS3BucketObject } from "@cdktf/provider-aws/lib/data-aws-s3-bucket-object/index.js";
import { SfnStateMachine, SfnStateMachineConfig } from "@cdktf/provider-aws/lib/sfn-state-machine/index.js";
import { CfnStateMachine } from "aws-cdk-lib/aws-stepfunctions";
import { Fn } from "cdktf";
import { deleteUndefinedKeys, registerMappingTyped } from "../utils.js";

export function registerStepFunctinMappings() {
    registerMappingTyped(CfnStateMachine, SfnStateMachine, {
        resource(scope, id, props, proxy) {
            let definitionString: string | undefined = undefined;
            if (props?.DefinitionString) {
                definitionString = props.DefinitionString;
            } else if (props?.DefinitionS3Location) {
                const s3Obj = new DataAwsS3BucketObject(scope, `${id}-definition`, {
                    bucket: props.DefinitionS3Location.Bucket as string,
                    key: props.DefinitionS3Location.Key as string,
                    versionId: props.DefinitionS3Location.Version as string,
                });
                definitionString = s3Obj.body as string;
            } else if (props?.Definition) {
                proxy.touchPath("Definition");
                definitionString = Fn.jsonencode(props.Definition);
            }
            if (!definitionString) {
                throw new Error("No definition provided to StateMachine");
            }

            props.DefinitionString;
            props.DefinitionS3Location;
            props.Definition;

            if (props?.DefinitionSubstitutions) {
                for (const [key, value] of Object.entries(props.DefinitionSubstitutions)) {
                    definitionString = Fn.replace(definitionString, `\$\{${key}\}`, value);
                }
            }

            let logDestination: string | undefined = props?.LoggingConfiguration?.Destinations?.[0]
                ?.CloudWatchLogsLogGroup
                ?.LogGroupArn;
            if (logDestination) {
                logDestination += ":*";
            }

            const config: SfnStateMachineConfig = {
                name: props?.StateMachineName,
                definition: definitionString,
                roleArn: props?.RoleArn,
                loggingConfiguration: {
                    level: props?.LoggingConfiguration?.Level,
                    logDestination,
                    includeExecutionData: props?.LoggingConfiguration?.IncludeExecutionData,
                },
                type: props?.StateMachineType,
                tags: props?.Tags && Object.fromEntries(props.Tags.map(({ Key, Value }) => [Key, Value])),
                tracingConfiguration: {
                    enabled: props?.TracingConfiguration?.Enabled,
                },
                encryptionConfiguration: {
                    kmsKeyId: props?.EncryptionConfiguration?.KmsKeyId,
                    type: props?.EncryptionConfiguration?.Type,
                    kmsDataKeyReusePeriodSeconds: props?.EncryptionConfiguration?.KmsDataKeyReusePeriodSeconds,
                },
            };

            return new SfnStateMachine(scope, id, deleteUndefinedKeys(config));
        },
        attributes: {
            Arn: (resource) => resource.arn,
            Ref: (resource) => resource.id,
            Name: (resource) => resource.name,
            StateMachineRevisionId: (resource) => resource.revisionId,
        },
    });
}
