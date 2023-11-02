/* eslint-disable @typescript-eslint/no-explicit-any */

import { DataAwsAvailabilityZones } from "@cdktf/provider-aws/lib/data-aws-availability-zones/index.js";
import { DataAwsCallerIdentity } from "@cdktf/provider-aws/lib/data-aws-caller-identity/index.js";
import { DataAwsPartition } from "@cdktf/provider-aws/lib/data-aws-partition/index.js";
import { DataAwsRegion } from "@cdktf/provider-aws/lib/data-aws-region/index.js";
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
  Aspects,
  dependable,
  Fn,
  Lazy,
  Op,
  TerraformElement,
  TerraformLocal,
  TerraformOutput,
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
import { findMapping, Mapping } from "../../mappings/utils.js";
import { CloudFormationOutput, CloudFormationResource, CloudFormationTemplate } from "./cfn.js";
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

function isConstruct(x: object): x is Construct {
  return x != undefined && Object.hasOwn(x, "_children") && Object.hasOwn(x, "_metadata");
}

function toTerraformIdentifier(identifier: string) {
  return toSnakeCase(identifier).replaceAll("-", "_");
}

function getConditionConstructId(conditionId: string) {
  return `condition_${conditionId}`;
}

export abstract class AwsTerraformAdaptorStack extends TerraformStack {
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

  constructor(scope: Construct, id: string, region: string) {
    const awsStage = new AWSStage(scope, `${id}-aws-stage`);
    const awsSynthesizer = new TerraformSynthesizer();
    const awsCdkStack = new AWSStack(awsStage, `${id}-aws-stack`, {
      synthesizer: awsSynthesizer,
      env: {
        region,
      },
    });

    super(awsCdkStack, id);
    this.getRegionalAwsProvider(region);

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
              dependency =
                AwsTerraformAdaptorStack.mappingForLogicalId[AWSStack.of(dependency).getLogicalId(dependency)].resource
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

  prepareStack() {
    cdkTokenResolutionCompat.disableUnresolvedTfTokens();
    this.convert();
    cdkTokenResolutionCompat.enableUnresolvedTfTokens();
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

    this.processCfnOutputs(cfn);
    this.processCfnMappings(cfn);
    this.processCfnConditions(cfn);
    this.processCfnResources(element, cfn);
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

      if (typeof value === "function" || isConstruct(value) || value == null) continue;
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
    const m = findMapping(resource.Type);
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

    const res = m.resource(newScope, currentElement.node.id, props);
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

    const keys = Object.keys(props).filter((k) => props[k] !== undefined);
    if (keys.length > 0) {
      throw new Error(
        `cannot map some properties of ${resource.Type}: ${
          JSON.stringify(
            props,
          )
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

      case "AWS::URLSuffix": {
        return this.awsPartition.dnsSuffix;
      }

      default: {
        throw new Error(`unable to resolve pseudo reference ${ref}`);
      }
    }
  }

  private resolveRef(ref: string) {
    if (ref?.startsWith("AWS::")) {
      return this.resolvePseudo(ref);
    }

    return this.resolveAtt(ref, "Ref");
  }

  private resolveIntrinsic(fn: string, params: any) {
    switch (fn) {
      case "Fn::GetAtt": {
        return this.resolveAtt(params[0], params[1]);
      }

      case "Fn::Join": {
        const [delim, strings] = params;
        return Fn.join(
          this.processIntrinsics(delim),
          this.processIntrinsics(strings),
        );
      }

      case "Fn::Select": {
        const [index, list] = params;
        const i = this.processIntrinsics(index);
        const ll = this.processIntrinsics(list);
        return Fn.element(ll, i);
      }

      case "Fn::GetAZs": {
        let [region]: [string | undefined | "AWS::Region"] = params;

        // AWS::Region or undefined fall back to default region for the stack
        if (region === "AWS::Region") {
          region = undefined;
        }
        return this.getAvailabilityZones(region).names;
      }

      case "Fn::Base64": {
        const [input] = params;
        return Fn.base64encode(this.processIntrinsics(input));
      }

      case "Fn::Cidr": {
        // https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-cidr.html
        // https://www.terraform.io/docs/language/functions/cidrsubnets.html
        const [ipBlock, count, cidrBits]: [any, number | string, any] = this.processIntrinsics(params);
        const prefix = ipBlock;
        // given count=4 bits=8 this will be [8, 8, 8, 8] to match the Fn.cidrsubnets interface
        const newBits = Array.from({ length: Number(count) }).fill(cidrBits, 0) as number[];
        return Fn.cidrsubnets(prefix, newBits);
      }

      case "Fn::FindInMap": {
        const [rawMap, ...rawParams] = params;
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
        const [separator, string] = params;
        return Fn.split(
          this.processIntrinsics(separator),
          this.processIntrinsics(string),
        );
      }

      case "Fn::Sub": {
        const [rawString, replacementMap]: [string, object] = params;

        let resultString: string = this.processIntrinsics(rawString);

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
        const [left, right] = this.processIntrinsics(params);
        return Op.eq(left, right);
      }

      case "Fn::And": {
        const [first, ...additional]: [any, any[]] = this.processConditions(
          this.processIntrinsics(params),
        );
        // Fn:And supports 2-10 parameters to chain
        return additional.reduce(
          (current, expression) => Op.and(current, expression),
          first,
        );
      }

      case "Fn::Or": {
        const [first, ...additional]: [any, any[]] = this.processConditions(
          this.processIntrinsics(params),
        );
        // Fn:Or supports 2-10 parameters to chain
        return additional.reduce(
          (current, expression) => Op.or(current, expression),
          first,
        );
      }

      case "Fn::If": {
        const [conditionId, trueExpression, falseExpression] = this.processIntrinsics(params);
        return conditional(
          this.getConditionTerraformLocal(conditionId),
          trueExpression,
          falseExpression,
        );
      }

      case "Fn::Not": {
        let [condition] = this.processIntrinsics(params);
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
        // This is related to the Export Name from outputs https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/outputs-section-structure.html
        // We might revisit this once the CDKTF supports cross stack references
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
}

/* eslint-enable @typescript-eslint/no-explicit-any */
