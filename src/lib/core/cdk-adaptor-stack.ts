/* eslint-disable @typescript-eslint/no-explicit-any */

import { DataAwsAvailabilityZones } from "@cdktf/provider-aws/lib/data-aws-availability-zones/index.js";
import { DataAwsCallerIdentity } from "@cdktf/provider-aws/lib/data-aws-caller-identity/index.js";
import { DataAwsPartition } from "@cdktf/provider-aws/lib/data-aws-partition/index.js";
import { DataAwsRegion } from "@cdktf/provider-aws/lib/data-aws-region/index.js";
import { DataAwsSsmParameter } from "@cdktf/provider-aws/lib/data-aws-ssm-parameter/index.js";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider/index.js";
import {
    CfnElement,
    CfnResource,
    IResolvable,
    Stack as AWSStack,
    Stage as AWSStage,
    Token as AWSToken,
} from "aws-cdk-lib";
import {
    App,
    Aspects,
    dependable,
    Fn,
    Lazy,
    Op,
    TerraformElement,
    TerraformLocal,
    TerraformOutput,
    TerraformProvider,
    TerraformResource,
    TerraformStack,
    TerraformVariable,
    Token,
    Tokenization,
} from "cdktf";
import { addCustomSynthesis } from "cdktf/lib/synthesize/synthesizer.js";
import { conditional, propertyAccess } from "cdktf/lib/tfExpression.js";
import { TokenMap } from "cdktf/lib/tokens/private/token-map.js";
import { toSnakeCase } from "codemaker";
import { Construct, ConstructOrder, IConstruct } from "constructs";
import { AccessTracker } from "../../mappings/access-tracker.js";
import { findMapping, Mapping } from "../../mappings/utils.js";
import {
    CloudFormationOutput,
    CloudFormationParameter,
    CloudFormationResource,
    CloudFormationTemplate,
} from "./cfn.js";
import { reparentConstruct } from "./construct-helpers.js";
import { TerraformSynthesizer } from "./terraform-synthesizer.js";

function getAwsCDKTokenResolutionCompat() {
    const originalUnresolved = AWSToken.isUnresolved;
    return {
        enableUnresolvedTfTokens() {
            AWSToken.isUnresolved = (x) => {
                return Token.isUnresolved(x) || originalUnresolved(x);
            };
        },
        disableUnresolvedTfTokens() {
            AWSToken.isUnresolved = originalUnresolved;
        },
    };
}

const cdkTokenResolutionCompat = getAwsCDKTokenResolutionCompat();

cdkTokenResolutionCompat.enableUnresolvedTfTokens();

function isConstruct(x: unknown): x is Construct {
    return x != undefined && Object.hasOwn(x, "_children") && Object.hasOwn(x, "_metadata");
}

function toTerraformIdentifier(identifier: string) {
    return toSnakeCase(identifier).replaceAll("-", "_");
}

function getConditionConstructId(conditionId: string) {
    return `condition_${conditionId}`;
}

const IS_APP_CONVERTED = Symbol("IS_APP_SYNTH_HOOKED");

export abstract class AwsTerraformAdaptorStack extends TerraformStack {
    public readonly useCloudControlFallback: boolean;
    private isConverted = false;
    private readonly awsStage: AWSStage;
    private readonly host: AWSStack;
    private _awsPartition?: DataAwsPartition;
    private _awsRegion?: DataAwsRegion;
    private _awsCallerIdentity?: DataAwsCallerIdentity;
    private awsAvailabilityZones: {
        [region: string]: DataAwsAvailabilityZones;
    } = {};
    private regionalAwsProviders: {
        [region: string]: AwsProvider;
    } = {};
    private variableMap: {
        [name: string]: TerraformVariable;
    } = {};
    private parameterMap: {
        [logicalId: string]: TerraformVariable | DataAwsSsmParameter;
    } = {};

    public get partition(): string {
        return this.awsPartition.partition;
    }

    public get awsPartition(): DataAwsPartition {
        return this._awsPartition ?? (this._awsPartition = new DataAwsPartition(this, "aws-partition"));
    }

    public get region(): string {
        return this.awsRegion.name;
    }

    public get awsRegion(): DataAwsRegion {
        return this._awsRegion ?? (this._awsRegion = new DataAwsRegion(this, "aws-region"));
    }

    public get awsCallerIdentity(): DataAwsCallerIdentity {
        return this._awsCallerIdentity
            ?? (this._awsCallerIdentity = new DataAwsCallerIdentity(this, "aws-caller-identity"));
    }

    public get account(): string {
        return this.awsCallerIdentity.accountId;
    }

    // TODO: expose this via some method?
    private static readonly mappingForLogicalId: {
        [logicalId: string]: {
            resourceType: string;
            mapping: Mapping<TerraformResource>;
            resource?: TerraformResource;
        };
    } = {};

    public static of(construct: IConstruct): AwsTerraformAdaptorStack {
        const stack = super.of(construct);
        if (stack instanceof AwsTerraformAdaptorStack) {
            return stack;
        } else {
            throw new TypeError("Containing terraform stack is not an AwsTerraformAdaptorStack");
        }
    }

    constructor(scope: Construct, id: string, region: string);
    constructor(scope: Construct, id: string, props: { region?: string; useCloudControlFallback?: boolean });
    constructor(
        scope: Construct,
        id: string,
        options: string | { region?: string; useCloudControlFallback?: boolean } = "us-east-1",
    ) {
        const awsStage = new AWSStage(scope, `${id}-aws-stage`);
        const props = typeof options === "string" ? { region: options, useCloudControlFallback: true } : {
            region: "us-east-1",
            useCloudControlFallback: true,
            ...options,
        };
        const awsSynthesizer = new TerraformSynthesizer();
        const awsCdkStack = new AWSStack(awsStage, `${id}-aws-stack`, {
            synthesizer: awsSynthesizer,
            env: {
                region: props.region,
            },
        });

        super(awsCdkStack, id);
        this.getRegionalAwsProvider(props.region);
        this.useCloudControlFallback = props.useCloudControlFallback;

        awsSynthesizer.terraformStack = this;
        this.awsStage = awsStage;
        this.host = awsCdkStack;

        addCustomSynthesis(this, {
            onSynthesize: (session) => {
                const manifest = session.manifest.forStack(this);
                (manifest as {
                    dependencies: string[];
                }).dependencies = manifest.dependencies.map(dep => dep.split("/").at(-1)) as string[];
            },
        });

        // Reconstruct dependency tree
        Aspects.of(this).add({
            visit: (res: IConstruct) => {
                if (res.node.dependencies.length > 0) {
                    const targets = res.node.findAll().filter(r =>
                        TerraformResource.isTerraformResource(r)
                    ) as TerraformResource[];
                    for (let dependency of res.node.dependencies) {
                        if (dependency instanceof CfnElement) {
                            dependency = AwsTerraformAdaptorStack
                                .mappingForLogicalId[AWSStack.of(dependency).getLogicalId(dependency)].resource
                                || dependency;
                        }
                        const resources = dependency?.node.findAll().filter(r =>
                            TerraformResource.isTerraformResource(r)
                        ) as TerraformResource[] || [];
                        for (const target of targets) {
                            for (const resource of resources) {
                                target.dependsOn = target.dependsOn || [];
                                target.dependsOn?.push(dependable(resource));
                            }
                        }
                    }
                }
            },
        });
    }

    /**
     * Resolve all cloudformation references within all CDKTF tokens
     * Most of the time references are resolved within individual constructs but this is not the case for deeply nested tokens
     * This method will resolve all references within all tokens
     */
    private resolveCfnInTokenMap() {
        cdkTokenResolutionCompat.disableUnresolvedTfTokens();
        const tokenMapInstance = TokenMap.instance();
        const stringTokenMap = (tokenMapInstance as any).stringTokenMap as Map<string, IResolvable>;

        const deeplyResolveSafely = (value: unknown): unknown => {
            if (typeof value === "string") {
                return AWSToken.isUnresolved(value) ? this.processIntrinsics(this.host.resolve(value)) : value;
            } else if (Array.isArray(value)) {
                return value.map((element) => deeplyResolveSafely(element));
            } else if (
                value instanceof TerraformElement
                || value instanceof TerraformStack
                || typeof value === "function"
            ) {
                return value;
            } else if (typeof value === "object" && value != null) {
                const result: any = {};
                for (const [k, v] of Object.entries(value)) {
                    result[k] = deeplyResolveSafely(v);
                }
                return result;
            } else {
                return value;
            }
        };

        const tokens = [...stringTokenMap.values()];
        for (const resolvable of tokens) {
            for (const k in resolvable) {
                if (resolvable.hasOwnProperty(k)) {
                    (resolvable as any)[k] = deeplyResolveSafely((resolvable as any)[k]);
                }
            }
        }
        cdkTokenResolutionCompat.enableUnresolvedTfTokens();
    }

    private convertOnce() {
        if (!this.isConverted) {
            cdkTokenResolutionCompat.disableUnresolvedTfTokens();
            this.convert();
            cdkTokenResolutionCompat.enableUnresolvedTfTokens();
            this.isConverted = true;
        }
    }

    private convertAllSiblingStacks() {
        const app = App.of(this);
        if ((app as any)[IS_APP_CONVERTED] !== true) {
            const stacks = app.node.findAll().filter((child) =>
                child instanceof AwsTerraformAdaptorStack
            ) as AwsTerraformAdaptorStack[];
            for (const stack of stacks) {
                stack.convertOnce();
            }
            (app as any)[IS_APP_CONVERTED] = true;
        }
    }

    prepareStack() {
        this.convertAllSiblingStacks();
        super.prepareStack();
        this.resolveCfnInTokenMap();
    }

    convert() {
        this.reparentRootConstructsOfHost();
        for (const r of this.host.node.findAll(ConstructOrder.PREORDER)) {
            if (r instanceof CfnElement) {
                r.node.scope?.node.tryRemoveChild(r.node.id);
                this.processCfnElement(r);
            }

            if (TerraformElement.isTerraformElement(r)) {
                this.resolveTerraformElement(r);
            }
        }
    }

    private processCfnElement(element: CfnElement) {
        const cfn = this.host.resolve(
            element._toCloudFormation(),
        ) as CloudFormationTemplate;

        this.processCfnParameters(element, cfn);
        this.processCfnOutputs(cfn);
        this.processCfnMappings(cfn);
        this.processCfnConditions(cfn);
        this.processCfnResources(element, cfn);
    }

    private processCfnParameters(element: CfnElement, cfn: CloudFormationTemplate) {
        for (const [logicalId, parameter] of Object.entries(cfn.Parameters || {})) {
            // Create a TerraformVariable for every parameter
            const terraformType = this.mapCfnTypeToTerraformType(parameter.Type);
            let defaultValue = parameter.Default;

            // Handle SSM parameter types
            if (this.isSSMParameterType(parameter.Type)) {
                // Create the SSM parameter data source
                const ssmParam = new DataAwsSsmParameter(this, `ssm_${logicalId}`, {
                    name: parameter.Default as string,
                    withDecryption: this.shouldDecryptSSMParameter(parameter.Type),
                });

                // Map SSM value to the appropriate type
                defaultValue = this.mapSSMValueToType(ssmParam.value, parameter.Type);

                // Store SSM parameter for reference resolution
                this.parameterMap[`ssm_${logicalId}`] = ssmParam;
            } else if (parameter.Type === "AWS::SSM::Parameter::Name") {
                // For AWS::SSM::Parameter::Name, we only validate existence
                // Create a DataAwsSsmParameter to verify the parameter exists
                const ssmParam = new DataAwsSsmParameter(this, `ssm_${logicalId}`, {
                    name: parameter.Default as string,
                });

                // The variable will store the parameter name, not its value
                defaultValue = parameter.Default;

                // Add a dependency on the SSM parameter to ensure it exists
                element.node.addDependency(ssmParam);
            }

            // Create a TerraformVariable for the parameter
            const variable = new TerraformVariable(this, element.node.id, {
                type: terraformType,
                description: parameter.Description,
                default: defaultValue,
                nullable: !parameter.Default,
                validation: this.createParameterValidation(parameter),
            });

            // Store the variable for reference resolution
            this.parameterMap[logicalId] = variable;
        }
    }

    private isSSMParameterType(type: string): boolean {
        // AWS::SSM::Parameter::Name is not a Value<Type> parameter
        return type.startsWith("AWS::SSM::Parameter::Value<") && type.endsWith(">");
    }

    private shouldDecryptSSMParameter(type: string): boolean {
        // SecureString parameters should be decrypted
        return type === "AWS::SSM::Parameter::Value<SecureString>";
    }

    private mapSSMValueToType(value: string, type: string): unknown {
        // Extract the inner type from AWS::SSM::Parameter::Value<Type>
        const innerType = type.match(/AWS::SSM::Parameter::Value<(.+)>/)?.[1];

        switch (innerType) {
            case "String":
                return value;
            case "StringList":
                return Fn.split(",", value);
            case "SecureString":
                return value;
            case "List<String>":
                return Fn.split(",", value);
            case "List<Number>":
                return Fn.split(",", value).map(v => Number(v));
            case "Number":
                return Number(value);
            default:
                return value;
        }
    }

    private mapCfnTypeToTerraformType(cfnType: string): string {
        // First handle SSM parameter types
        if (this.isSSMParameterType(cfnType)) {
            const innerType = cfnType.match(/AWS::SSM::Parameter::Value<(.+)>/)?.[1];
            switch (innerType) {
                case "String":
                case "SecureString":
                    return "string";
                case "StringList":
                case "List<String>":
                    return "list(string)";
                case "List<Number>":
                    return "list(number)";
                case "Number":
                    return "number";
                default:
                    return "string";
            }
        }

        // Then handle standard CloudFormation types
        switch (cfnType) {
            case "String":
            case "AWS::EC2::AvailabilityZone::Name":
            case "AWS::EC2::Image::Id":
            case "AWS::EC2::Instance::Id":
            case "AWS::EC2::SecurityGroup::Id":
            case "AWS::EC2::SecurityGroup::GroupName":
            case "AWS::EC2::Subnet::Id":
            case "AWS::EC2::Volume::Id":
            case "AWS::EC2::VPC::Id":
            case "AWS::Route53::HostedZone::Id":
            case "AWS::SSM::Parameter::Name": // SSM Parameter Name is just a string
                return "string";
            case "Number":
                return "number";
            case "List<Number>":
                return "list(number)";
            case "List<String>":
            case "CommaDelimitedList":
                return "list(string)";
            default:
                return "string";
        }
    }

    private processCfnOutputs(cfn: CloudFormationTemplate) {
        for (const [outputId, args] of Object.entries(cfn.Outputs || {})) {
            this.newTerraformOutput(this, outputId, args);
        }
    }

    private processCfnMappings(cfn: CloudFormationTemplate) {
        for (const [mappingId, mapping] of Object.entries(cfn.Mappings || {})) {
            this.newTerraformVariableFromMapping(this, mappingId, mapping);
        }
    }

    private processCfnConditions(cfn: CloudFormationTemplate) {
        for (
            const [conditionId, condition] of Object.entries(
                cfn.Conditions || {},
            )
        ) {
            this.newTerraformLocalFromCondition(this, conditionId, condition);
        }
    }

    private reparentRootConstructsOfHost() {
        const directChildren = this.host.node.children.filter(child => child != this);
        for (const child of directChildren) {
            reparentConstruct(child, this);
        }
    }

    private processCfnResources(element: CfnElement, cfn: CloudFormationTemplate) {
        const resources = Object.entries(cfn.Resources || {});
        if (resources.length > 1) {
            console.log(resources);
            throw new Error(
                `expected only one resource in template, got ${resources.length}`,
            );
        }
        for (const [logicalId, resource] of resources) {
            this.newTerraformResource(element, logicalId, resource);
        }
    }

    private resolveTerraformElement(element: TerraformElement) {
        for (const [key, value] of Object.entries(element)) {
            const tKey = key as keyof TerraformElement;
            if (
                tKey === "cdktfStack"
                || tKey === "node"
                || tKey === "fqn"
                || tKey === "friendlyUniqueId"
            ) continue;

            if (
                typeof value === "function" || isConstruct(value) || value == null
                || value.crossStackIdentifier != null
                || TerraformResource.isTerraformResource(value)
                || TerraformProvider.isTerraformProvider(value)
            ) continue;
            if (value["internalValue"] == null) {
                const resolvedValue = this.host.resolve(value);
                const intrinsicsProcessedValue = this.processIntrinsics(resolvedValue);
                element[tKey] = intrinsicsProcessedValue;
            } else {
                const resolvedValue = this.host.resolve(value.internalValue);
                const intrinsicsProcessedValue = this.processIntrinsics(resolvedValue);
                value.internalValue = intrinsicsProcessedValue;
                element[tKey] = value;
            }
        }
    }

    private newTerraformVariableFromMapping(scope: IConstruct, mappingId: string, mapping: any) {
        const variable = new TerraformVariable(this, mappingId, {
            type: "map",
            default: Token.asAny(mapping),
        });
        this.variableMap[mappingId] = variable;
    }

    private getRegionalAwsProvider(region: string): AwsProvider {
        if (!this.regionalAwsProviders[region]) {
            this.regionalAwsProviders[region] = new AwsProvider(
                this,
                `aws_${toTerraformIdentifier(region)}`,
                {
                    region,
                    alias: toTerraformIdentifier(region),
                },
            );
        }
        return this.regionalAwsProviders[region];
    }

    private getAvailabilityZones(
        region?: string,
    ): DataAwsAvailabilityZones {
        const DEFAULT_REGION_KEY = "default_region";
        if (!region) {
            region = DEFAULT_REGION_KEY;
        }

        if (!this.awsAvailabilityZones[region]) {
            this.awsAvailabilityZones[region] = new DataAwsAvailabilityZones(
                this,
                `aws_azs_${toTerraformIdentifier(region)}`,
                {
                    provider: region === DEFAULT_REGION_KEY
                        ? undefined
                        : this.getRegionalAwsProvider(region),
                },
            );
        }
        return this.awsAvailabilityZones[region];
    }

    private newTerraformResource(
        currentElement: CfnElement,
        logicalId: string,
        resource: CloudFormationResource,
    ): TerraformResource | void {
        // TODO: add debug log console.log(JSON.stringify(resource, null, 2));
        const m = findMapping(resource.Type, this.useCloudControlFallback);
        if (!m) {
            throw new Error(`no mapping for ${resource.Type}`);
        }

        const props = this.processIntrinsics(resource.Properties ?? {});
        const conditionId = resource.Condition;
        let terraformStack: TerraformStack | undefined;
        try {
            terraformStack = TerraformStack.of(currentElement);
        } catch {}

        const newScope = (terraformStack == undefined ? this : currentElement.node.scope) as Construct;

        const proxy = new AccessTracker(props);

        if (m.unsupportedProps != null) {
            const specifiedUnsupportedProps = m.unsupportedProps.map(proxy.matchingProperties.bind(proxy)).flat();
            if (specifiedUnsupportedProps.length > 0) {
                throw new UnsupportedPropertiesSpecifiedError(resource.Type, specifiedUnsupportedProps);
            }
        }

        const res = m.resource(newScope, currentElement.node.id, proxy.proxy, proxy);
        if (currentElement instanceof CfnResource && res) {
            res.node.addDependency(...currentElement.obtainDependencies());
            res.node.addDependency(...currentElement.node.dependencies);
        }

        AwsTerraformAdaptorStack.mappingForLogicalId[logicalId] = {
            resourceType: resource.Type,
            mapping: m,
            resource: res as TerraformResource,
        };

        if (conditionId) {
            if (!res) {
                throw new Error(
                    `Condition has been found on resource that has no representation in Terraform: ${resource.Type}. Mapper function returned null`,
                );
            }

            res.count = Token.asNumber(
                conditional(this.getConditionTerraformLocal(conditionId), 1, 0),
            );
        }

        if (!proxy.isAllPropertiesAccessed()) {
            throw new Error(
                `The following props were not mapped for ${resource.Type}: ${
                    proxy.getUnaccessedProperties().join(", ")
                }`,
            );
        }

        return res;
    }

    private newTerraformOutput(scope: Construct, outputId: string, args: CloudFormationOutput) {
        return new TerraformOutput(scope, outputId, {
            value: this.processIntrinsics(args.Value),
            description: args.Description || undefined,
        });
    }

    private newTerraformLocalFromCondition(
        scope: Construct,
        conditionId: string,
        condition: any,
    ) {
        return new TerraformLocal(
            scope,
            getConditionConstructId(conditionId),
            this.processIntrinsics(condition),
        );
    }

    private getConditionTerraformLocal(conditionId: string): IResolvable {
        return Lazy.anyValue({
            produce: () => {
                const local = this.node.tryFindChild(
                    getConditionConstructId(conditionId),
                ) as TerraformLocal;
                if (!local) {
                    throw new Error(
                        `Could not find TerraformLocal for condition with id=${conditionId}`,
                    );
                }
                return local.expression;
            },
        });
    }

    /**
     * will replace { Condition: 'MyCondition' } with Terraform Local for "MyCondition"
     */
    private processConditions(
        obj: string | number | string[] | {
            Condition: string;
        },
    ): any {
        if (typeof obj !== "object") {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map((x) => this.processConditions(x));
        }

        if (Object.keys(obj).length === 1 && typeof obj.Condition === "string") {
            return this.getConditionTerraformLocal(obj.Condition);
        }

        return obj;
    }

    private processStringIntrinsic(input: string) {
        const escapeString = (str: string) => {
            // we wrap strings if they contain stringified json (e.g. for step functions)
            // (which contains quotes (") which need to be escaped)
            // or if they contain `${` which needs to be escaped for Terraform strings as well
            if (
                !Token.isUnresolved(str) // only if there is no token in them
                && (str.includes("\"") || str.includes("${"))
            ) {
                // We don't want to escape everything, we just want it to not be interpolated
                return Fn.join("", [Fn.rawString(str)]);
            } else {
                return str; // e.g. a single Token in a string will be returned as is
            }
        };

        // find tokens in string
        const tokenizedFragments = Tokenization.reverseString(input);

        // zero or one fragments won't enter the join() function below
        // so we directly escape the whole string
        if (tokenizedFragments.length < 2) {
            return escapeString(input);
        }

        // if there are more parts, join them into an array
        const parts = tokenizedFragments.join({
            join: (left, right): string[] => {
                const acc: string[] = Array.isArray(left) ? [...left] : [];

                // on the initial invocation left is still a single string and not an array
                if (!Array.isArray(left)) {
                    acc.push(escapeString(left));
                }
                acc.push(escapeString(right));

                return acc;
            },
        });

        return Fn.join("", parts); // we return a TF function to be able to combine rawStrings and unescaped tokens
    }

    private processIntrinsics(obj: any): any {
        if (typeof obj === "string") {
            return this.processStringIntrinsic(obj);
        }

        if (typeof obj !== "object") {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map((x) => this.processIntrinsics(x));
        }

        const ref = obj.Ref;
        if (ref) {
            return this.resolveRef(ref);
        }

        const intrinsic = Object.keys(obj)[0];
        if (intrinsic?.startsWith("Fn::") && Object.keys(obj).length === 1) {
            return this.resolveIntrinsic(intrinsic, obj[intrinsic]);
        } else if (intrinsic?.startsWith("Fn:") && !intrinsic?.startsWith("Fn::")) {
            console.warn(
                "Found possible intrinsic function starting with \"Fn:\" instead of \"Fn::\". Typo?",
            );
        }

        const result: any = {};
        for (const [k, v] of Object.entries(obj)) {
            result[k] = this.processIntrinsics(v);
        }

        return result;
    }

    private resolveAtt(logicalId: string, attribute: string, isLazy: boolean = false): string {
        const mapping = AwsTerraformAdaptorStack.mappingForLogicalId[logicalId];
        if (!mapping) {
            // Don't be infinitely lazy
            if (isLazy) {
                // if the reference can't be resolved at this point, it almost certainly a reference to a resource in another stack that hasn't been converted yet
                //

                throw new Error(
                    `unable to resolve a "Ref" to a resource with the logical ID ${logicalId}`,
                );
            }
            return Lazy.stringValue({
                produce: () => this.resolveAtt(logicalId, attribute, true),
            });
        }

        const child = mapping.resource;
        if (!child) {
            throw new Error(
                `unable to resolve a "Ref" to a resource with the logical ID ${logicalId}`,
            );
        }

        const att = typeof mapping.mapping.attributes === "function"
            ? mapping.mapping.attributes.bind(undefined, attribute)
            : mapping.mapping.attributes[attribute.replace(".", "")];
        if (!att) {
            throw new Error(
                `no "${attribute}" attribute mapping for resource of type ${mapping.resourceType}`,
            );
        }

        return att(child) + "";
    }

    private resolvePseudo(ref: string) {
        switch (ref) {
            case "AWS::Partition": {
                return this.awsPartition.partition;
            }

            case "AWS::Region": {
                return this.awsRegion.name;
            }

            case "AWS::AccountId": {
                return this.awsCallerIdentity.accountId;
            }

            case "AWS::NoValue": {
                return;
            }

            case "AWS::StackName": {
                return this.node.id;
            }

            case "AWS::URLSuffix": {
                return this.awsPartition.dnsSuffix;
            }

            default: {
                throw new Error(`unable to resolve pseudo reference ${ref}`);
            }
        }
    }

    private resolveRef(ref: string, isLazy: boolean = false): string | undefined {
        if (ref?.startsWith("AWS::")) {
            return this.resolvePseudo(ref);
        }

        if (this.parameterMap[ref] == null && AwsTerraformAdaptorStack.mappingForLogicalId[ref] == null) {
            if (!isLazy) {
                return Lazy.stringValue({
                    produce: () => this.resolveRef(ref, true),
                });
            }
            throw new Error(`unable to resolve a "Ref" to a resource with the logical ID ${ref}`);
        }

        // Check if this is a parameter reference
        if (this.parameterMap[ref]) {
            return this.resolveParameter(ref);
        }

        return this.resolveAtt(ref, "Ref");
    }

    private resolveIntrinsic(fn: string, params: unknown[]): unknown {
        switch (fn) {
            case "Fn::GetAtt": {
                return this.resolveAtt(params[0] as string, params[1] as string);
            }

            case "Fn::Join": {
                const [delim, strings] = params as [string, string[]];
                return Fn.join(
                    this.processIntrinsics(delim),
                    this.processIntrinsics(strings),
                );
            }

            case "Fn::Select": {
                const [index, list] = params as [number, unknown[]];
                const i = this.processIntrinsics(index);
                const ll = this.processIntrinsics(list);
                return Fn.element(ll, i);
            }

            case "Fn::GetAZs": {
                let [region]: [string | undefined | "AWS::Region"] = params as [string | undefined | "AWS::Region"];

                // AWS::Region or undefined fall back to default region for the stack
                if (region === "AWS::Region") {
                    region = undefined;
                }
                return this.getAvailabilityZones(region).names;
            }

            case "Fn::Base64": {
                const [input] = params as [string];
                return Fn.base64encode(this.processIntrinsics(input));
            }

            case "Fn::Cidr": {
                // https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-cidr.html
                // https://www.terraform.io/docs/language/functions/cidrsubnets.html
                const [ipBlock, count, cidrBits]: [string, number | string, number] = this.processIntrinsics(
                    params,
                ) as [string, number | string, number];
                const prefix = ipBlock;
                // given count=4 bits=8 this will be [8, 8, 8, 8] to match the Fn.cidrsubnets interface
                const newBits = Array.from({ length: Number(count) }).fill(cidrBits, 0) as number[];
                return Fn.cidrsubnets(prefix, newBits);
            }

            case "Fn::FindInMap": {
                const [rawMap, ...rawParams] = params as [string, ...unknown[]];
                const map = this.processIntrinsics(rawMap);
                const processedParams = this.processIntrinsics(rawParams);
                return Lazy.anyValue({
                    produce: () => {
                        if (this.variableMap[map]) {
                            return propertyAccess(this.variableMap[map].value, processedParams);
                        }
                        return propertyAccess(map, processedParams);
                    },
                }).toString();
            }

            case "Fn::Split": {
                const [separator, string] = params as [string, string];
                return Fn.split(
                    this.processIntrinsics(separator),
                    this.processIntrinsics(string),
                );
            }

            case "Fn::Sub": {
                const [rawString, replacementMap]: [string, { [key: string]: unknown }] = params as [
                    string,
                    { [key: string]: unknown },
                ];

                let resultString: string = this.processIntrinsics(rawString);

                // Handle SSM parameter references in the format ${ssm:/path/to/parameter}
                resultString = resultString.replace(/\$\{ssm:([^}]+)\}/g, (match, ssmPath) => {
                    const ssmParam = new DataAwsSsmParameter(this, `ssm_${ssmPath.replace(/[^a-zA-Z0-9]/g, "_")}`, {
                        name: ssmPath,
                    });
                    return ssmParam.value;
                });

                // replacementMap is an object
                Object.entries(replacementMap).map(([rawVarName, rawVarValue]) => {
                    if (typeof rawVarName !== "string") {
                        throw new TypeError(
                            `Only strings are supported as VarName in Sub function. Encountered ${
                                JSON.stringify(
                                    rawVarName,
                                )
                            } instead.`,
                        );
                    }
                    const varName = rawVarName; // we use this as object key
                    const varValue = this.processIntrinsics(rawVarValue);

                    resultString = Fn.replace(
                        Token.asString(resultString),
                        Fn.rawString("${" + varName + "}"),
                        varValue,
                    );
                });

                // replace ${!Literal} with ${Literal}
                // see: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-sub.html
                resultString = Fn.replace(
                    resultString,
                    Fn.rawString("/\\\\$\\\\{!(\\\\w+)\\\\}/"),
                    Fn.rawString("${$1}"),
                );
                // in HCL: replace(local.template, "/\\$\\{!(\\w+)\\}/", "$${$1}")

                return resultString;
            }

            case "Fn::Equals": {
                const [left, right] = this.processIntrinsics(params) as [unknown, unknown];
                return Op.eq(left, right);
            }

            case "Fn::And": {
                const [first, ...additional]: [unknown, unknown[]] = this.processConditions(
                    this.processIntrinsics(params),
                );
                // Fn:And supports 2-10 parameters to chain
                return additional.reduce(
                    (current, expression) => Op.and(current, expression),
                    first,
                );
            }

            case "Fn::Or": {
                const [first, ...additional]: [unknown, unknown[]] = this.processConditions(
                    this.processIntrinsics(params),
                );
                // Fn:Or supports 2-10 parameters to chain
                return additional.reduce(
                    (current, expression) => Op.or(current, expression),
                    first,
                );
            }

            case "Fn::If": {
                const [conditionId, trueExpression, falseExpression] = this.processIntrinsics(params) as [
                    string,
                    unknown,
                    unknown,
                ];
                return conditional(
                    this.getConditionTerraformLocal(conditionId),
                    trueExpression,
                    falseExpression,
                );
            }

            case "Fn::Not": {
                let [condition] = this.processIntrinsics(params) as [unknown];
                if (typeof condition === "string") {
                    condition = this.getConditionTerraformLocal(condition);
                }

                return Op.not(condition);
            }

            case "Fn::Transform": {
                // https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-macros.html
                throw new Error(
                    "Fn::Transform is not supported – Cfn Template Macros are not supported yet",
                );
            }

            case "Fn::ImportValue": {
                // TODO: support cross cfn stack references?
                throw new Error(`Fn::ImportValue is not yet supported.`);
            }

            default: {
                throw new Error(
                    `unsupported intrinsic function ${fn} (params: ${
                        JSON.stringify(
                            params,
                        )
                    })`,
                );
            }
        }
    }

    private resolveParameter(logicalId: string): string {
        const param = this.parameterMap[logicalId];
        if (!param) {
            throw new Error(`Unable to resolve parameter with logical ID ${logicalId}`);
        }

        if (param instanceof DataAwsSsmParameter) {
            return param.value;
        } else {
            return param.value;
        }
    }

    private createParameterValidation(param: CloudFormationParameter): { condition: string; errorMessage: string }[] {
        const validations: { condition: string; errorMessage: string }[] = [];

        if (param.AllowedPattern) {
            validations.push({
                condition: `can(regex("${param.AllowedPattern}", self))`,
                errorMessage: `Parameter must match pattern: ${param.AllowedPattern}`,
            });
        }

        if (param.AllowedValues) {
            const values = param.AllowedValues.map((v: unknown) => typeof v === "string" ? `"${v}"` : v);
            validations.push({
                condition: `contains([${values.join(", ")}], self)`,
                errorMessage: `Parameter must be one of: ${values.join(", ")}`,
            });
        }

        if (param.MinValue !== undefined) {
            validations.push({
                condition: `self >= ${param.MinValue}`,
                errorMessage: `Parameter must be >= ${param.MinValue}`,
            });
        }

        if (param.MaxValue !== undefined) {
            validations.push({
                condition: `self <= ${param.MaxValue}`,
                errorMessage: `Parameter must be <= ${param.MaxValue}`,
            });
        }

        if (param.MinLength !== undefined) {
            validations.push({
                condition: `length(self) >= ${param.MinLength}`,
                errorMessage: `Parameter length must be >= ${param.MinLength}`,
            });
        }

        if (param.MaxLength !== undefined) {
            validations.push({
                condition: `length(self) <= ${param.MaxLength}`,
                errorMessage: `Parameter length must be <= ${param.MaxLength}`,
            });
        }

        return validations;
    }
}

export class UnsupportedPropertiesSpecifiedError extends Error {
    constructor(public readonly resourceType: string, public readonly unsupportedProps: string[]) {
        const message = `The following unsupported props were specified for ${resourceType}: ${
            unsupportedProps.join(", ")
        }`;
        super(message);
        this.name = "UnsupportedPropertiesSpecifiedError";
    }
}
