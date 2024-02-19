import { CfnElement, Fn } from "aws-cdk-lib";
import { LocalBackend, TerraformElement, TerraformStack, TerraformVariable, Testing } from "cdktf";
import { resolve } from "cdktf/lib/_tokens.js";
import { Construct } from "constructs";
import { Class } from "type-fest";
import { AwsTerraformAdaptorStack } from "../index.js";

export function synthesizeConstructAndTestStability<T extends Construct, C extends Class<T>>(
  constructClass: C,
  props: ConstructorParameters<C>[2],
) {
  class TestClass extends AwsTerraformAdaptorStack {
    public readonly resource: T = new constructClass(this, "resource", props);
    public readonly backend = new LocalBackend(this, {
      path: `/terraform.${this.node.id}.tfstate`,
    });
  }

  const app = Testing.app();
  const testStack = new TestClass(app, "test-stack", {
    region: "us-east-1",
    useCloudControlFallback: false,
  });
  testStack.prepareStack();
  const synthStack = Testing.synth(testStack);
  expect(synthStack).toMatchSnapshot();

  return {
    resource: testStack.resource,
    app,
    synth: synthStack,
    props,
    stack: testStack as AwsTerraformAdaptorStack,
  };
}

export function synthesizeElementAndTestStability<
  C extends CfnElement,
  CC extends Class<C>,
  T extends TerraformElement,
  TC extends Class<T>,
>(
  constructClass: CC,
  props: ConstructorParameters<CC>[2],
  terraformClass: TC,
  terraformProps: ConstructorParameters<TC>[2],
) {
  class ConstructWrapper extends Construct {
    public readonly resource: C;

    constructor(scope: Construct, id: string, props: ConstructorParameters<CC>[2]) {
      super(scope, id);
      this.resource = new constructClass(this, "resource", props);

      new TerraformVariable(this, "refs", {
        type: "string",
        default: Object.keys(this.resource)
          .filter(key => key.startsWith("attr"))
          .map(key => this.resource[key as keyof C])
          .map(value => Array.isArray(value) ? Fn.join(",", value) : value)
          .join(","),
      });
    }
  }

  const output = synthesizeConstructAndTestStability(ConstructWrapper, props);
  const transformedResource = output.resource.node.tryFindChild("resource") as T;
  expectResourcePropertiesMatch(transformedResource, terraformClass, terraformProps);
  return {
    ...output,
    resource: transformedResource as InstanceType<TC>,
  };
}

export function expectResourcePropertiesMatch<T extends TerraformElement, TC extends Class<T>>(
  node: Construct,
  tfClass: TC,
  props: ConstructorParameters<TC>[2],
) {
  expect(node).toBeInstanceOf(tfClass);
  const transformedTerraformProps = Object.fromEntries(
    Object.entries(props)
      .map(([key, value]) => [key + "Input", value]),
  );
  const transformedResourceProps = Object.fromEntries(
    Object.keys(transformedTerraformProps)
      .map(key => [key, resolve(TerraformStack.of(node), node[key as keyof typeof node])]),
  );

  expect(transformedResourceProps).toMatchObject(transformedTerraformProps);
}

export function itShouldMapCfnElementToTerraformResource<
  C extends CfnElement,
  CC extends Class<C>,
  T extends TerraformElement,
  TC extends Class<T>,
>(
  constructClass: CC,
  props: ConstructorParameters<CC>[2],
  terraformClass: TC,
  terraformProps: ConstructorParameters<TC>[2],
) {
  it(`Should map ${(constructClass as unknown as { CFN_RESOURCE_TYPE_NAME: string }).CFN_RESOURCE_TYPE_NAME}`, () => {
    synthesizeElementAndTestStability(constructClass, props, terraformClass, terraformProps);
  });
}
