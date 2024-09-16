import { registerApiGatewayMappings } from "./services/apigateway.js";
import { registerAppSyncMappings } from "./services/appsync.js";
import { registerCertificateManagerMappings } from "./services/certificate-manager.js";
import { registerCloudfrontMappings } from "./services/cloudfront.js";
import { registerCognitoMappings } from "./services/cognito.js";
import { registerDynamoDBMappings } from "./services/dynamodb.js";
import { registerEC2VPCMappings } from "./services/ec2-vpc.js";
import { registerEcsMappings } from "./services/eks.js";
import { registerEventsMappings } from "./services/events.js";
import { registerIamMappings } from "./services/iam.js";
import { registerLambdaMappings } from "./services/lambda.js";
import { registerLogMappings } from "./services/logs.js";
import { registerRoute53Mappings } from "./services/route53.js";
import { registerS3Mappings } from "./services/s3.js";
import { registerSnsMappings } from "./services/sns.js";
import { registerSqsMappings } from "./services/sqs.js";
import { registerStepFunctinMappings } from "./services/stepfunctions.js";
import { registerMapping } from "./utils.js";

export function registerMappings() {
    registerMapping("AWS::CloudFormation::CustomResource", {
        resource: (scope, id) => {
            throw new Error(`Custom resource was attached to ${id}. Custom resources are not supported`);
        },
        attributes: {},
    });

    registerCognitoMappings();
    registerDynamoDBMappings();
    registerLambdaMappings();
    registerS3Mappings();
    registerCertificateManagerMappings();
    registerRoute53Mappings();
    registerAppSyncMappings();
    registerEC2VPCMappings();
    registerEventsMappings();
    registerIamMappings();
    registerApiGatewayMappings();
    registerLogMappings();
    registerCloudfrontMappings();
    registerSqsMappings();
    registerSnsMappings();
    registerStepFunctinMappings();
    registerEcsMappings();
}

registerMappings();
