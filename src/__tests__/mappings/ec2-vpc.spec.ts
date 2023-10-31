import { InternetGateway } from "@cdktf/provider-aws/lib/internet-gateway/index.js";
import { RouteTableAssociation } from "@cdktf/provider-aws/lib/route-table-association/index.js";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group/index.js";
import { VpcSecurityGroupEgressRule } from "@cdktf/provider-aws/lib/vpc-security-group-egress-rule/index.js";
import { VpcSecurityGroupIngressRule } from "@cdktf/provider-aws/lib/vpc-security-group-ingress-rule/index.js";
import {
  CfnInternetGateway,
  CfnSecurityGroup,
  CfnSecurityGroupEgress,
  CfnSecurityGroupIngress,
  CfnSubnetRouteTableAssociation,
  Vpc,
} from "aws-cdk-lib/aws-ec2";
import { resolve } from "cdktf/lib/_tokens.js";
import { setupJest } from "cdktf/lib/testing/adapters/jest.js";
import {
  itShouldMapCfnElementToTerraformResource,
  synthesizeConstructAndTestStability,
  synthesizeElementAndTestStability,
} from "../helpers.js";

setupJest();

describe("EC2 VPC mappings", () => {
  it("Should provision all the components of a VPC", () => {
    synthesizeConstructAndTestStability(Vpc, {
      enableDnsHostnames: true,
      enableDnsSupport: true,
      vpcName: "test-vpc",
      natGateways: 1,
      createInternetGateway: true,
      availabilityZones: ["us-east-1a", "us-east-1b"],
    });
  });

  itShouldMapCfnElementToTerraformResource(CfnInternetGateway, {}, InternetGateway, {});

  itShouldMapCfnElementToTerraformResource(
    CfnSubnetRouteTableAssociation,
    {
      subnetId: "subnet-id",
      routeTableId: "route-table-id",
    },
    RouteTableAssociation,
    {
      subnetId: "subnet-id",
      routeTableId: "route-table-id",
    },
  );

  it("Should map AWS::EC2::SecurityGroup", () => {
    const { synth, resource, stack } = synthesizeElementAndTestStability(
      CfnSecurityGroup,
      {
        groupName: "test-security-group",
        groupDescription: "test-security-group-description",
        vpcId: "test-vpc-id",
        securityGroupEgress: [
          {
            destinationSecurityGroupId: "destination-security-group-id",
            description: "test-security-group-egress-description",
            fromPort: 0,
            ipProtocol: "-1",
            toPort: 0,
            cidrIp: "10.0.0.0/16",
            cidrIpv6: "2001:db8:1234:1a00::/64",
            destinationPrefixListId: "destination-prefix-list-id",
          },
        ],
        securityGroupIngress: [
          {
            description: "test-security-group-ingress-description",
            fromPort: 0,
            ipProtocol: "-1",
            toPort: 0,
            cidrIp: "10.0.0.0/16",
            cidrIpv6: "2001:db8:1234:1a00::/64",
            sourceSecurityGroupId: "source-security-group-id",
            sourceSecurityGroupName: "source-security-group-name",
            sourceSecurityGroupOwnerId: "source-security-group-owner-id",
            sourcePrefixListId: "source-prefix-list-id",
          },
        ],
      },
      SecurityGroup,
      {
        name: "test-security-group",
        description: "test-security-group-description",
        vpcId: "test-vpc-id",
      },
    );

    expect(synth).toHaveResourceWithProperties(VpcSecurityGroupEgressRule, {
      from_port: 0,
      to_port: 0,
      ip_protocol: "-1",
      cidr_ipv4: "10.0.0.0/16",
      cidr_ipv6: "2001:db8:1234:1a00::/64",
      prefix_list_id: "destination-prefix-list-id",
      security_group_id: resolve(stack, resource.id),
      referenced_security_group_id: "destination-security-group-id",
      description: "test-security-group-egress-description",
    });

    expect(synth).toHaveResourceWithProperties(VpcSecurityGroupIngressRule, {
      from_port: 0,
      to_port: 0,
      ip_protocol: "-1",
      cidr_ipv4: "10.0.0.0/16",
      cidr_ipv6: "2001:db8:1234:1a00::/64",
      prefix_list_id: "source-prefix-list-id",
      security_group_id: resolve(stack, resource.id),
      description: "test-security-group-ingress-description",
      referenced_security_group_id: "source-security-group-id",
    });
  });

  itShouldMapCfnElementToTerraformResource(
    CfnSecurityGroupEgress,
    {
      destinationSecurityGroupId: "destination-security-group-id",
      description: "test-security-group-egress-description",
      fromPort: 0,
      ipProtocol: "-1",
      toPort: 0,
      cidrIp: "10.0.0.0/16",
      cidrIpv6: "2001:db8:1234:1a00::/64",
      destinationPrefixListId: "destination-prefix-list-id",
      groupId: "group-id",
    },
    VpcSecurityGroupEgressRule,
    {
      fromPort: 0,
      toPort: 0,
      ipProtocol: "-1",
      cidrIpv4: "10.0.0.0/16",
      cidrIpv6: "2001:db8:1234:1a00::/64",
      prefixListId: "destination-prefix-list-id",
      securityGroupId: "group-id",
      referencedSecurityGroupId: "destination-security-group-id",
      description: "test-security-group-egress-description",
    },
  );

  itShouldMapCfnElementToTerraformResource(
    CfnSecurityGroupIngress,
    {
      cidrIp: "10.0.0.0/16",
      cidrIpv6: "2001:db8:1234:1a00::/64",
      description: "test-security-group-ingress-description",
      fromPort: 0,
      ipProtocol: "-1",
      toPort: 0,
      sourceSecurityGroupId: "source-security-group-id",
      sourcePrefixListId: "source-prefix-list-id",
      groupId: "group-id",
    },
    VpcSecurityGroupIngressRule,
    {
      referencedSecurityGroupId: "source-security-group-id",
      fromPort: 0,
      toPort: 0,
      ipProtocol: "-1",
      cidrIpv4: "10.0.0.0/16",
      cidrIpv6: "2001:db8:1234:1a00::/64",
      prefixListId: "source-prefix-list-id",
      securityGroupId: "group-id",
      description: "test-security-group-ingress-description",
    },
  );
});
