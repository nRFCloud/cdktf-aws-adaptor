import { Aspects, dependable, IAspect, TerraformResource, TerraformStack, Token } from "cdktf";
import { resolve } from "cdktf/lib/_tokens.js";
import { findTokens } from "cdktf/lib/tokens/private/resolve.js";
import { IConstruct } from "constructs";

export class ImplicitDependencyAspect implements IAspect {
    public readonly dependables: string[];

    constructor(
        public readonly target: TerraformResource,
        public readonly implicitDependencies: TerraformResource[],
    ) {
        this.dependables = this.implicitDependencies.map(dependable);
    }

    public visit(node: IConstruct) {
        if (
            node instanceof TerraformResource
            && dependsOn(node, this.target)
            && !this.implicitDependencies.includes(node)
        ) {
            if (!node.dependsOn) {
                node.dependsOn = [];
            }
            node.dependsOn.push(...this.dependables);
        }
    }

    public static of(target: TerraformResource, implicitDependencies: TerraformResource[]): ImplicitDependencyAspect {
        const stack = TerraformStack.of(target);
        const aspect = new ImplicitDependencyAspect(target, implicitDependencies);
        Aspects.of(stack).add(aspect);
        return aspect;
    }
}

/**
 * returns true if source contains a property that depends on target
 */
function dependsOn(
    source: TerraformResource,
    target: TerraformResource,
): boolean {
    const tokens = findTokens(TerraformStack.of(source), () => source.toTerraform());

    // Checks if there's at least one token that resolves to an Terraform reference
    // which references the target
    // e.g. resolved could be "${aws_iam_role.typescriptcronlambda_adapter_lambdaServiceRole494E4CA6_233C76C0.arn}"
    // which includes the target "aws_iam_role.typescriptcronlambda_adapter_lambdaServiceRole494E4CA6_233C76C0"
    return tokens.some((token) => {
        const resolved = resolve(TerraformStack.of(source), token) as string | Token; // still wrapped in "${}"
        const resolvedFqn = resolve(TerraformStack.of(source), target.fqn) as string | Token; // still wrapped in "${}"
        const resolvedFqnRaw = typeof resolvedFqn === "string"
            ? resolvedFqn.replace(/^\${/, "").replace(/}$/, "")
            : resolvedFqn;
        return typeof resolved === "string" && resolved.includes(resolvedFqnRaw.toString());
    });
}
