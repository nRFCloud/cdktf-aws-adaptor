import { Route53Record } from "@cdktf/provider-aws/lib/route53-record/index.js";
import { CfnRecordSet } from "aws-cdk-lib/aws-route53";
import { itShouldMapCfnElementToTerraformResource } from "../helpers.js";

describe("Route53 mappings", () => {
  itShouldMapCfnElementToTerraformResource(
    CfnRecordSet,
    {
      name: "test-record-set",
      hostedZoneId: "test-hosted-zone-id",
      type: "test-type",
      ttl: "60",
      resourceRecords: ["test-resource-record"],
      aliasTarget: {
        dnsName: "test-dns-name",
        hostedZoneId: "test-hosted-zone-id",
        evaluateTargetHealth: true,
      },
      failover: "test-failover",
      geoLocation: {
        continentCode: "test-continent-code",
        countryCode: "test-country",
        subdivisionCode: "test-subdivision-code",
      },
      healthCheckId: "test-health-check-id",
      multiValueAnswer: true,
      region: "test-region",
      setIdentifier: "test-set-identifier",
      weight: 60,
      cidrRoutingConfig: {
        collectionId: "test-collection-id",
        locationName: "test-location-name",
      },
      // FIXME: These are not supported by the provider yet
      // comment: "test-comment",
      // hostedZoneName: "test-hosted-zone-name",
    },
    Route53Record,
    {
      name: "test-record-set",
      zoneId: "test-hosted-zone-id",
      type: "test-type",
      ttl: 60,
      records: ["test-resource-record"],
      alias: {
        name: "test-dns-name",
        zoneId: "test-hosted-zone-id",
        evaluateTargetHealth: true,
      },
      healthCheckId: "test-health-check-id",
      multivalueAnswerRoutingPolicy: true,
      setIdentifier: "test-set-identifier",
      latencyRoutingPolicy: {
        region: "test-region",
      },
      cidrRoutingPolicy: {
        collectionId: "test-collection-id",
        locationName: "test-location-name",
      },
      failoverRoutingPolicy: {
        type: "test-failover",
      },
      geolocationRoutingPolicy: {
        country: "test-country",
        continent: "test-continent-code",
        subdivision: "test-subdivision-code",
      },
      weightedRoutingPolicy: {
        weight: 60,
      },
    },
  );
});
