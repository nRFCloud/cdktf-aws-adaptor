import { Construct, Node } from "constructs";

export function reparentConstruct(construct: Construct, newParent: Construct) {
    const oldParent = construct.node.scope;
    if (oldParent === newParent) {
        return;
    }
    if (oldParent != null) {
        oldParent.node.tryRemoveChild(construct.node.id);
    }

    const unlockedNode = construct.node as { -readonly [key in keyof Node]: Node[key] };
    unlockedNode.scope = newParent;
    const reparentableNode = newParent.node as unknown as {
        addChild(child: Construct, id: string): void;
    };
    reparentableNode.addChild(construct, construct.node.id);
}
