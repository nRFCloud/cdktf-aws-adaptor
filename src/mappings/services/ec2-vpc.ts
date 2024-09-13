import { InternetGateway } from "@cdktf/provider-aws/lib/internet-gateway/index.js";
import { RouteTableAssociation } from "@cdktf/provider-aws/lib/route-table-association/index.js";
import { Route } from "@cdktf/provider-aws/lib/route/index.js";
import { SecurityGroup, SecurityGroupConfig } from "@cdktf/provider-aws/lib/security-group/index.js";
import { VpcSecurityGroupEgressRule } from "@cdktf/provider-aws/lib/vpc-security-group-egress-rule/index.js";
import { VpcSecurityGroupIngressRule } from "@cdktf/provider-aws/lib/vpc-security-group-ingress-rule/index.js";
import { Vpc } from "@cdktf/provider-aws/lib/vpc/index.js";
import {
    CfnInternetGateway,
    CfnRoute,
    CfnSecurityGroup,
    CfnSecurityGroupEgress,
    CfnSecurityGroupIngress,
    CfnSubnetRouteTableAssociation,
    CfnVPC,
} from "aws-cdk-lib/aws-ec2";
import { Aspects } from "cdktf";
import { createGenericCCApiMapping, deleteUndefinedKeys, registerMapping, registerMappingTyped } from "../utils.js";

export function registerEC2VPCMappings() {
    registerMappingTyped(CfnInternetGateway, InternetGateway, {
        resource: (scope, id) => {
            return new InternetGateway(scope, id);
        },
        attributes: {
            InternetGatewayId: (igw: InternetGateway) => igw.id,
            Ref: (igw: InternetGateway) => igw.id,
        },
    });

    registerMapping("AWS::EC2::Subnet", createGenericCCApiMapping("AWS::EC2::Subnet"));

    registerMapping("AWS::EC2::RouteTable", createGenericCCApiMapping("AWS::EC2::RouteTable"));

    registerMappingTyped(CfnSubnetRouteTableAssociation, RouteTableAssociation, {
        resource: (scope, id, props) => {
            return new RouteTableAssociation(
                scope,
                id,
                deleteUndefinedKeys({
                    subnetId: props.SubnetId,
                    routeTableId: props.RouteTableId,
                }),
            );
        },
        attributes: {
            Ref: (rta: RouteTableAssociation) => rta.id,
            Id: (rta: RouteTableAssociation) => rta.id,
        },
    });

    registerMappingTyped(CfnRoute, Route, {
        resource: (scope, id, props) => {
            return new Route(
                scope,
                id,
                deleteUndefinedKeys({
                    destinationCidrBlock: props.DestinationCidrBlock,
                    destinationIpv6CidrBlock: props.DestinationIpv6CidrBlock,
                    destinationPrefixListId: props.DestinationPrefixListId,
                    egressOnlyGatewayId: props.EgressOnlyInternetGatewayId,
                    gatewayId: props.GatewayId,
                    routeTableId: props.RouteTableId,
                    instanceId: props.InstanceId,
                    carrierGatewayId: props.CarrierGatewayId,
                    natGatewayId: props.NatGatewayId,
                    networkInterfaceId: props.NetworkInterfaceId,
                    transitGatewayId: props.TransitGatewayId,
                    vpcPeeringConnectionId: props.VpcPeeringConnectionId,
                    coreNetworkArn: props.CoreNetworkArn,
                    localGatewayId: props.LocalGatewayId,
                    vpcEndpointId: props.VpcEndpointId,
                }),
            );
        },
        attributes: {
            CidrBlock: (route: Route) => route.destinationCidrBlock,
            Ref: (route: Route) => route.id,
        },
    });

    registerMapping("AWS::EC2::EIP", createGenericCCApiMapping("AWS::EC2::EIP"));

    registerMapping("AWS::EC2::NatGateway", createGenericCCApiMapping("AWS::EC2::NatGateway"));
    registerMappingTyped(CfnVPC, Vpc, {
        resource: (scope, id, props) => {
            return new Vpc(
                scope,
                id,
                deleteUndefinedKeys({
                    cidrBlock: props?.CidrBlock,
                    enableDnsHostnames: props?.EnableDnsHostnames,
                    enableDnsSupport: props?.EnableDnsSupport,
                    instanceTenancy: props?.InstanceTenancy,
                    ipv4NetmaskLength: props?.Ipv4NetmaskLength,
                    ipv4IpamPoolId: props?.Ipv4IpamPoolId,
                    tags: Object.fromEntries(
                        props?.Tags?.map(({
                            Key: key,
                            Value: value,
                        }) => [key, value]) || [],
                    ),
                }),
            );
        },
        attributes: {
            VpcId: (vpc: Vpc) => vpc.id,
            Ref: (vpc: Vpc) => vpc.id,
            CidrBlock: (vpc: Vpc) => vpc.cidrBlock,
            DefaultNetworkAcl: (vpc: Vpc) => vpc.defaultNetworkAclId,
            DefaultSecurityGroup: (vpc: Vpc) => vpc.defaultSecurityGroupId,
            Ipv6CidrBlocks: (vpc: Vpc) => [vpc.ipv6CidrBlock],
            CidrBlockAssociations: (vpc: Vpc) => [vpc.ipv6AssociationId],
        },
    });

    registerMapping("AWS::EC2::VPCGatewayAttachment", {
        resource: (scope, _id, props) => {
            // This has no resource representation in TF, see also: https://github.com/hashicorp/terraform-provider-aws/issues/5465#issuecomment-415575387
            // so we add an aspect to simulate the behaviour it has
            const vpcId = props.VpcId;
            props.VpcId;
            props.InternetGatewayId;

            Aspects.of(scope).add({
                visit: (node) => {
                    // FIXME: move this into some creation function or similar
                    // TODO: this has the shortcoming of changing all internet gateways
                    if (node instanceof InternetGateway) {
                        // TODO: check the node.id and try to resolve that token somehow to find out the targetted internet gateway (note.id will be a Lazy that resolves to some TF resource)
                        node.vpcId = vpcId;
                    }
                },
            });
        },
        attributes: {
            // FIXME: when is this used? resolve to the related InternetGateway or VpnGateway instead
            Arn: () => {
                throw new Error(
                    "AWS::EC2::VPCGatewayAttachment has no represenation in Terraform and therefore cannot be accessed",
                );
            },
            Ref: () => {
                throw new Error(
                    "AWS::EC2::VPCGatewayAttachment has no represenation in Terraform and therefore cannot be accessed",
                );
            },
        },
    });

    registerMappingTyped(CfnSubnetRouteTableAssociation, RouteTableAssociation, {
        resource: (scope, id, props) => {
            return new RouteTableAssociation(
                scope,
                id,
                deleteUndefinedKeys({
                    subnetId: props.SubnetId,
                    routeTableId: props.RouteTableId,
                }),
            );
        },
        attributes: {
            Ref: (rta: RouteTableAssociation) => rta.id,
            Id: (rta: RouteTableAssociation) => rta.id,
        },
    });

    registerMappingTyped(CfnSecurityGroup, SecurityGroup, {
        resource: (scope, id, cfnProps, proxy) => {
            const props: SecurityGroupConfig = {
                name: cfnProps.GroupName,
                vpcId: cfnProps.VpcId,
                description: cfnProps.GroupDescription,
                tags: Object.fromEntries(
                    cfnProps.Tags?.map(({
                        Key: key,
                        Value: value,
                    }) => [key, value]) || [],
                ),
            };

            const securityGroup = new SecurityGroup(scope, id, deleteUndefinedKeys(props));

            cfnProps.SecurityGroupIngress?.forEach((ingress, idx) => {

                new VpcSecurityGroupIngressRule(
                    securityGroup,
                    `${idx}-ingress`,
                    deleteUndefinedKeys({
                        fromPort: ingress.FromPort,
                        toPort: ingress.ToPort,
                        ipProtocol: ingress.IpProtocol,
                        cidrIpv4: ingress.CidrIp,
                        cidrIpv6: ingress.CidrIpv6,
                        prefixListId: ingress.SourcePrefixListId,
                        securityGroupId: securityGroup.id,
                        description: ingress.Description,
                        referencedSecurityGroupId: ingress.SourceSecurityGroupId!,
                    }),
                );
            });

            cfnProps.SecurityGroupEgress?.forEach((egress, idx) => {
                new VpcSecurityGroupEgressRule(
                    securityGroup,
                    `${idx}-egress`,
                    deleteUndefinedKeys({
                        fromPort: egress.FromPort,
                        toPort: egress.ToPort,
                        ipProtocol: egress.IpProtocol,
                        cidrIpv4: egress.CidrIp,
                        cidrIpv6: egress.CidrIpv6,
                        prefixListId: egress.DestinationPrefixListId,
                        securityGroupId: securityGroup.id,
                        referencedSecurityGroupId: egress.DestinationSecurityGroupId,
                        description: egress.Description,
                    }),
                );
            });

            return securityGroup;
        },
        attributes: {
            VpcId: (sg: SecurityGroup) => sg.vpcId,
            Ref: (sg: SecurityGroup) => sg.id,
            GroupId: (sg: SecurityGroup) => sg.id,
            Id: (sg: SecurityGroup) => sg.id,
        },
    });

    registerMappingTyped(CfnSecurityGroupEgress, VpcSecurityGroupEgressRule, {
        resource: (scope, id, props) => {
            return new VpcSecurityGroupEgressRule(
                scope,
                id,
                deleteUndefinedKeys({
                    fromPort: props.FromPort,
                    toPort: props.ToPort,
                    ipProtocol: props.IpProtocol,
                    cidrIpv4: props.CidrIp,
                    cidrIpv6: props.CidrIpv6,
                    prefixListId: props.DestinationPrefixListId,
                    securityGroupId: props.GroupId,
                    referencedSecurityGroupId: props.DestinationSecurityGroupId,
                    description: props.Description,
                }),
            );
        },
        attributes: {
            Ref: (rule: VpcSecurityGroupEgressRule) => rule.id,
            Id: (rule: VpcSecurityGroupEgressRule) => rule.id,
        },
    });

    registerMappingTyped(CfnSecurityGroupIngress, VpcSecurityGroupIngressRule, {
        resource: (scope, id, props) => {
            return new VpcSecurityGroupIngressRule(
                scope,
                id,
                deleteUndefinedKeys({
                    fromPort: props.FromPort,
                    toPort: props.ToPort,
                    ipProtocol: props.IpProtocol,
                    cidrIpv4: props.CidrIp,
                    cidrIpv6: props.CidrIpv6,
                    prefixListId: props.SourcePrefixListId,
                    securityGroupId: props.GroupId!,
                    referencedSecurityGroupId: props.SourceSecurityGroupId!,
                    description: props.Description,
                }),
            );
        },
        unsupportedProps: ["GroupName", "SourceSecurityGroupName", "SourceSecurityGroupOwnerId"],
        attributes: {
            Ref: (rule: VpcSecurityGroupIngressRule) => rule.id,
            Id: (rule: VpcSecurityGroupIngressRule) => rule.id,
        },
    });
}
