import { LambdaFunction, LambdaFunctionConfig } from "@cdktf/provider-aws/lib/lambda-function/index.js";
import { LambdaLayerVersionPermission } from "@cdktf/provider-aws/lib/lambda-layer-version-permission/index.js";
import { LambdaLayerVersion } from "@cdktf/provider-aws/lib/lambda-layer-version/index.js";
import { LambdaPermission } from "@cdktf/provider-aws/lib/lambda-permission/index.js";
import { IResolvable, Names } from "aws-cdk-lib";
import { CfnFunction, CfnLayerVersion, CfnLayerVersionPermission, CfnPermission } from "aws-cdk-lib/aws-lambda";
import { AssetType, Fn, TerraformAsset } from "cdktf";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { deleteUndefinedKeys, registerMappingTyped } from "../utils.js";

export function registerLambdaMappings() {
  registerMappingTyped(CfnPermission, LambdaPermission, {
    resource: (scope, id, props) => {
      return new LambdaPermission(
        scope,
        id,
        deleteUndefinedKeys({
          eventSourceToken: props.EventSourceToken,
          functionName: props.FunctionName,
          principal: props.Principal,
          sourceAccount: props.SourceAccount,
          sourceArn: props.SourceArn,
          action: props.Action,
          functionUrlAuthType: props.FunctionUrlAuthType,
          principalOrgId: props.PrincipalOrgID,
        }),
      );
    },
    attributes: {
      Ref: (permission: LambdaPermission) => permission.id,
      Id: (permission: LambdaPermission) => permission.id,
    },
  });

  registerMappingTyped(CfnLayerVersion, LambdaLayerVersion, {
    resource: (scope, id, props) => {
      const layerVersion = new LambdaLayerVersion(
        scope,
        id,
        deleteUndefinedKeys({
          compatibleArchitectures: props.CompatibleArchitectures,
          compatibleRuntimes: props.CompatibleRuntimes,
          layerName: props.LayerName!,
          description: props.Description,
          licenseInfo: props.LicenseInfo,
          s3Bucket: props.Content.S3Bucket,
          s3Key: props.Content.S3Key,
          s3ObjectVersion: props.Content.S3ObjectVersion,
          skipDestroy: true,
        }),
      );

      layerVersion.layerName = props.LayerName || Names.uniqueResourceName(layerVersion, { maxLength: 32 });

      return layerVersion;
    },
    attributes: {
      Ref: (layerVersion: LambdaLayerVersion) => layerVersion.id,
      LayerVersionArn: (layerVersion: LambdaLayerVersion) => layerVersion.arn,
    },
  });

  registerMappingTyped(CfnLayerVersionPermission, LambdaLayerVersionPermission, {
    resource: (scope, id, props) => {
      const parsedArn = Fn.split(":", props.LayerVersionArn);
      const layerVersion = Fn.tonumber(Fn.element(parsedArn, 7));
      // const layerVersion = Fn.tonumber(parsedArn.at(7))

      const versionPermission = new LambdaLayerVersionPermission(
        scope,
        id,
        deleteUndefinedKeys({
          action: props.Action,
          principal: props.Principal,
          skipDestroy: true,
          layerName: props.LayerVersionArn,
          organizationId: props.OrganizationId,
          statementId: "",
          versionNumber: layerVersion,
        }),
      );
      versionPermission.statementId = Names.uniqueResourceName(versionPermission, { maxLength: 32 });
      return versionPermission;
    },
    attributes: {
      Ref: (versionPermission: LambdaLayerVersionPermission) => versionPermission.id,
      Id: resource => resource.id,
    },
  });

  // registerMapping("AWS::Lambda::Permission", {
  //   resource: createGuessingResourceMapper(LambdaPermission),
  //   attributes: {
  //     Ref: (permission: LambdaPermission) => permission.id,
  //   },
  // });
  //
  registerMappingTyped(CfnFunction, LambdaFunction, {
    resource(scope, id, lambdaProps): LambdaFunction {
      let codeAsset: TerraformAsset | undefined;
      if (lambdaProps.Code?.ZipFile) {
        const tmpFilePath = mkdtempSync(tmpdir() + "/");
        writeFileSync(tmpFilePath + "/index.js", lambdaProps.Code.ZipFile);
        codeAsset = new TerraformAsset(scope, "Code", {
          type: AssetType.DIRECTORY,
          path: tmpFilePath,
        });
      }

      const mapped: LambdaFunctionConfig = {
        ephemeralStorage: {
          size: lambdaProps.EphemeralStorage?.Size as number,
        },
        filename: codeAsset?.path,
        description: lambdaProps.Description,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        tags: Object.fromEntries(lambdaProps.Tags?.map(({ Key, Value }) => [Key, Value]) || []),
        codeSigningConfigArn: lambdaProps.CodeSigningConfigArn,
        s3Bucket: lambdaProps.Code.S3Bucket,
        functionName: lambdaProps.FunctionName!,
        deadLetterConfig: {
          targetArn: lambdaProps.DeadLetterConfig?.TargetArn as string,
        },
        architectures: lambdaProps.Architectures,
        s3Key: lambdaProps.Code.S3Key,
        s3ObjectVersion: lambdaProps.Code.S3ObjectVersion,
        fileSystemConfig: {
          arn: lambdaProps.FileSystemConfigs?.[0].Arn as string,
          localMountPath: lambdaProps.FileSystemConfigs?.[0].LocalMountPath as string,
        },
        environment: {
          variables: lambdaProps.Environment?.Variables,
        },
        imageConfig: {
          command: lambdaProps.ImageConfig?.Command,
          entryPoint: lambdaProps.ImageConfig?.EntryPoint,
          workingDirectory: lambdaProps.ImageConfig?.WorkingDirectory,
        },
        handler: lambdaProps.Handler,
        role: lambdaProps.Role,
        imageUri: lambdaProps.Code.ImageUri,
        kmsKeyArn: lambdaProps.KmsKeyArn,
        layers: lambdaProps.Layers,
        packageType: lambdaProps.PackageType,
        memorySize: lambdaProps.MemorySize,
        reservedConcurrentExecutions: lambdaProps.ReservedConcurrentExecutions,
        runtime: lambdaProps.Runtime,
        vpcConfig: {
          subnetIds: lambdaProps.VpcConfig?.SubnetIds as string[],
          securityGroupIds: lambdaProps.VpcConfig?.SecurityGroupIds as string[],
        },
        publish: true,
        tracingConfig: {
          mode: lambdaProps.TracingConfig?.Mode as string,
        },
        timeout: lambdaProps.Timeout,
        snapStart: {
          applyOn: lambdaProps.SnapStart?.ApplyOn as string,
        },
      };

      const lambda = new LambdaFunction(scope, id, mapped);

      lambda.functionName = mapped.functionName || Names.uniqueResourceName(lambda, { maxLength: 64 });
      return lambda;
    },
    unsupportedProps: ["RuntimeManagementConfig", "Policy"],
    attributes: {
      Arn: resource => resource.arn,
      SnapStartResponseApplyOn: resource => resource.snapStart.applyOn,
      SnapStartResponseOptimizationStatus: resource => resource.snapStart.optimizationStatus,
      Ref: resource => resource.id,
      SnapStartResponse: resource => ({
        ApplyOn: resource.snapStart.applyOn,
        OptimizationStatus: resource.snapStart.optimizationStatus,
      } as unknown as IResolvable),
    },
  });
}
