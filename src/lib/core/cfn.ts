export interface CloudFormationResource {
    readonly Type: string;
    readonly Properties: { [key: string]: unknown };
    readonly Condition?: string;
}

export interface CloudFormationOutput {
    readonly Description?: string;
    readonly Value: unknown;
}

export interface CloudFormationParameter {
    Type: string;
    Description?: string;
    Default?: unknown;
    AllowedPattern?: string;
    AllowedValues?: unknown[];
    MinValue?: number;
    MaxValue?: number;
    MinLength?: number;
    MaxLength?: number;
}

export interface CloudFormationTemplate {
    Parameters?: { [key: string]: CloudFormationParameter };
    Outputs?: { [key: string]: CloudFormationOutput };
    Mappings?: { [key: string]: unknown };
    Conditions?: { [key: string]: unknown };
    Resources?: { [key: string]: CloudFormationResource };
}
