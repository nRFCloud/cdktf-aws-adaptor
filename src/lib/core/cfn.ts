export interface CloudFormationResource {
    readonly Type: string;
    readonly Properties: { [key: string]: unknown };
    readonly Condition?: string;
}

export interface CloudFormationTemplate {
    Resources?: { [id: string]: CloudFormationResource };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Conditions?: { [id: string]: any };
    Outputs?: { [id: string]: CloudFormationOutput };
    Mappings?: { [id: string]: { [key: string]: unknown } };
}

export interface CloudFormationOutput {
    readonly Description?: string;
    readonly Value: unknown;
}
