import { camelCase } from "camel-case";
import { TerraformResource } from "cdktf";
import { Construct } from "constructs";
import createDebug from "debug";

export const mapperDebug = createDebug("cdktf-aws-adaptor:mapper:debug");
export const mapperTrace = createDebug("cdktf-aws-adaptor:mapper:trace");
export const mapperWarn = createDebug("cdktf-aws-adaptor:mapper:warn");

const isObject = (x: unknown): x is object => x != null && typeof x === "object" && !Array.isArray(x);
const isArrayOfObjects = (x: unknown): x is object[] => Array.isArray(x) && x.length > 0 && isObject(x[0]);

const autoMapObjectPropertyKeys = (obj: object): object =>
    Object.fromEntries(
        Object.entries(obj).map(([cfnKey, nestedValue]) => {
            const res = createAutoPropertyMapping(cfnKey)(nestedValue);
            return [res.tfAttributeName, res.value];
        }),
    );

function createNamePropertyMapping(
    tfAttributeName: string,
): PropertyMappingFunc {
    return (value) => {
        if (isObject(value)) {
            value = autoMapObjectPropertyKeys(value);
        } else if (isArrayOfObjects(value)) {
            value = value.map((element) => autoMapObjectPropertyKeys(element));
        }

        return { tfAttributeName, value };
    };
}

function createAutoPropertyMapping(
    cfnPropertyName: string,
): PropertyMappingFunc {
    // convert name to CDKTF TypeScript name
    const tfAttributeName = camelCase(cfnPropertyName);
    // TODO: maybe this can become smarter in the future :)

    return createNamePropertyMapping(tfAttributeName);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Class<T> = new(...args: any[]) => T;
type PropertyMappingFunc = (value: unknown) => {
    tfAttributeName: string;
    value: unknown;
};
type PropertyMapping =
    | null // ignores the property, dropping it
    | string // just maps onto the attribute name passed as string without adjusting the value
    | PropertyMappingFunc; // dynamically maps to one (or more) attributes, can adjust the value
type PropertyMappings = { [cfnProperty: string]: PropertyMapping };

// TODO: detect if something has been mapped to a tfAttributeName that does not exist in the props of a resource
// -> needs validations in generated provider bindings!

export type ResourceMapper<T extends TerraformResource> = (
    scope: Construct,
    id: string,
    props: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
    },
) => T | void;

export function createGuessingResourceMapper<T extends TerraformResource>(
    resource: Class<T>,
    propMappings: PropertyMappings = {},
): ResourceMapper<T> {
    const mapper: ResourceMapper<T> = (
        scope: Construct,
        id: string,
        props: { [cfnPropertyName: string]: unknown },
    ) => {
        const mappedProps: { [tfAttributeName: string]: unknown } = {};

        // TODO: extract this prop mapping code to be able to reuse it when writing custom mappers?
        // loop over all CloudFormation properties and convert them one by one
        for (const [cfnPropertyName, cfnValue] of Object.entries(props)) {
            // Ignore this prop?
            if (propMappings[cfnPropertyName] === null) {
                // delete to mark this as done
                // (the adapter will cautiously error for values left in props after mapping)
                delete props[cfnPropertyName];
                continue;
            }

            // Determine how to map this prop?
            let mapping: PropertyMappingFunc;
            switch (typeof propMappings[cfnPropertyName]) {
                case "function": {
                    mapping = propMappings[cfnPropertyName] as PropertyMappingFunc;
                    mapperTrace(`using a custom mapping function for ${cfnPropertyName}`);
                    break;
                }
                case "string": {
                    mapping = createNamePropertyMapping(
                        propMappings[cfnPropertyName] as string,
                    );
                    mapperTrace(
                        `using a custom name for ${cfnPropertyName} (${propMappings[cfnPropertyName]})`,
                    );
                    break;
                }
                default: {
                    mapperTrace(`auto mapping ${cfnPropertyName}`);
                    mapping = createAutoPropertyMapping(cfnPropertyName);
                }
            }

            // map the value
            const { tfAttributeName, value } = mapping(cfnValue);
            if (Object.keys(mappedProps).includes(tfAttributeName)) {
                throw new Error(
                    `Conflict! ${cfnPropertyName} has been mapped to ${tfAttributeName} but there has already been a value set for that key.`,
                );
            }

            mappedProps[tfAttributeName] = value;

            // delete to mark this as done
            // (the adapter will cautiously error for values left in props after mapping)
            delete props[cfnPropertyName];
        }

        mapperDebug(
            `mapped props for Resource ${resource.name}: ${
                JSON.stringify(
                    mappedProps,
                )
            }`,
        );

        return new resource(scope, id, mappedProps);
    };
    return mapper;
}
