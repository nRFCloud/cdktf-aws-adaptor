import { CfnElement, Fn } from "aws-cdk-lib";
import {
    LocalBackend,
    TerraformElement,
    TerraformMetaArguments,
    TerraformStack,
    TerraformVariable,
    Testing,
} from "cdktf";
import { resolve } from "cdktf/lib/_tokens.js";
import { Construct } from "constructs";
import { Class } from "type-fest";
import { AwsTerraformAdaptorStack } from "../index.js";
import { UnsupportedPropertiesSpecifiedError } from "../lib/core/cdk-adaptor-stack.js";
import { NotAny } from "../lib/core/type-utils.js";
import { AccessTracker } from "../mappings/access-tracker.js";

export function synthesizeConstructAndTestStability<T extends Construct, C extends Class<T>>(
    constructClass: C,
    props: ConstructorParameters<C>[2],
    disableSnapshot = false,
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
    if (!disableSnapshot) expect(synthStack).toMatchSnapshot();

    return {
        resource: testStack.resource,
        app,
        synth: synthStack,
        props,
        stack: testStack as AwsTerraformAdaptorStack,
    };
}

export type DeepRequiredProperties<T> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in keyof Required<T>]: NotAny<T[K]> extends never ? any : DeepRequiredProperties<T[K]>;
};

export type DeepRequired<T> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in keyof T]-?: NotAny<T[K]> extends never ? any : DeepRequired<T[K]>;
};

type BaseTfResourceProps = "id" | "tagsAll" | keyof TerraformMetaArguments;

export function synthesizeElementAndTestStability<
    C extends CfnElement,
    CC extends Class<C>,
    T extends TerraformElement,
    TC extends Class<T>,
>(
    constructClass: CC,
    props: DeepRequired<ConstructorParameters<CC>[2]>,
    terraformClass: TC,
    terraformProps: Omit<DeepRequiredProperties<ConstructorParameters<TC>[2]>, BaseTfResourceProps>,
    unsupportedCfPropPaths: string[] = [],
    disableSnapshot = false,
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

    if (unsupportedCfPropPaths.length > 0) {
        const propTracker = new AccessTracker(props);
        const unsupportedProps = unsupportedCfPropPaths.map(path => propTracker.matchingProperties(path)).flat()
            .map(prop => prop.toLowerCase());

        // Attempt to create a new instance of the construct with the unsupported properties
        // This should throw an error if the properties are not removed
        try {
            synthesizeConstructAndTestStability(ConstructWrapper, props, disableSnapshot);
            throw new Error(
                `Expected an error when creating an instance of ${constructClass.name} with unsupported properties: ${unsupportedProps}`,
            );
        } catch (e) {
            expect(e).toBeInstanceOf(UnsupportedPropertiesSpecifiedError);

            // Case insensitive comparison
            expect((e as UnsupportedPropertiesSpecifiedError).unsupportedProps.map(prop => prop.toLowerCase())).members(
                unsupportedProps,
            );
        }
    }

    const propProxy = new AccessTracker(props);
    unsupportedCfPropPaths.forEach(path => propProxy.removePropertiesUnderPath(path));

    const output = synthesizeConstructAndTestStability(ConstructWrapper, propProxy.clone(), disableSnapshot);
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
    props: DeepRequired<ConstructorParameters<CC>[2]>,
    terraformClass: TC,
    terraformProps: Omit<DeepRequiredProperties<ConstructorParameters<TC>[2]>, BaseTfResourceProps>,
    unsupportedCfPropPaths: string[] = [],
    disableSnapshot = false,
) {
    it(`Should map ${(constructClass as unknown as { CFN_RESOURCE_TYPE_NAME: string }).CFN_RESOURCE_TYPE_NAME}`, () => {
        synthesizeElementAndTestStability(
            constructClass,
            props,
            terraformClass,
            terraformProps,
            unsupportedCfPropPaths,
            disableSnapshot,
        );
    });
}
