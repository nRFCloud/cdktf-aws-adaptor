import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket/index.js";
import { S3Object } from "@cdktf/provider-aws/lib/s3-object/index.js";
import { DefaultStackSynthesizer, FileAssetLocation, FileAssetSource, Stage } from "aws-cdk-lib";
import { AssetType, TerraformAsset, TerraformStack } from "cdktf";
import { join } from "node:path";

export class TerraformSynthesizer extends DefaultStackSynthesizer {
    private readonly assetCacheMap = new Map<string, FileAssetLocation>();
    private _terraformStack?: TerraformStack;

    public set terraformStack(stack: TerraformStack) {
        this._terraformStack = stack;
    }

    public get terraformStack(): TerraformStack {
        if (!this._terraformStack) {
            throw new Error("Terraform stack not set");
        }
        return this._terraformStack;
    }

    addFileAsset(asset: FileAssetSource): FileAssetLocation {
        const assetOutDir = Stage.of(this.boundStack)?.assetOutdir;
        if (asset.executable) {
            throw new Error("Cannot deploy executable file assets");
        }
        if (!assetOutDir || !asset.fileName) {
            throw new Error("Cannot determine output directory for file asset");
        }

        if (this.assetCacheMap.has(asset.sourceHash)) {
            return this.assetCacheMap.get(asset.sourceHash)!;
        }

        const terraformAsset = new TerraformAsset(this.terraformStack, `asset-${asset.sourceHash}`, {
            assetHash: asset.sourceHash,
            type: asset.packaging === "zip" ? AssetType.ARCHIVE : AssetType.FILE,
            path: join(assetOutDir, asset.fileName),
        });

        const object = new S3Object(this.terraformStack, `asset-${asset.fileName}-object`, {
            sourceHash: terraformAsset.assetHash,
            source: terraformAsset.path,
            bucket: this.getAssetBucket().bucket,
            key: terraformAsset.assetHash,
        });

        const location = {
            httpUrl: `https://s3.${this.boundStack.region}.amazonaws.com/${this.getAssetBucket().bucket}/${object.key}`,
            bucketName: this.getAssetBucket().bucket,
            objectKey: object.key,
            kmsKeyArn: undefined,
            s3ObjectUrl: `s3://${this.getAssetBucket().bucket}/${object.key}`,
        };

        this.assetCacheMap.set(asset.sourceHash, location);
        return location;
    }

    synthesize() {
        throw new Error("Cannot sythesize CDK stack from terraform synthesizer");
    }

    private getAssetBucket(): S3Bucket {
        let assetBucket = this.terraformStack.node.tryFindChild("AssetBucket") as S3Bucket;
        if (!assetBucket) {
            assetBucket = new S3Bucket(this.terraformStack, "AssetBucket");
        }
        return assetBucket;
    }
}
