import { Route53Record } from "@cdktf/provider-aws/lib/route53-record/index.js";
import { CfnRecordSet } from "aws-cdk-lib/aws-route53";
import { deleteUndefinedKeys, registerMappingTyped } from "../utils.js";

export function registerRoute53Mappings() {
  registerMappingTyped(CfnRecordSet, Route53Record, {
    resource(scope, id, props) {
      const mappedProps: Omit<typeof props, "Ttl"> & { TTL: (typeof props)["Ttl"] } = props as never;
      return new Route53Record(
        scope,
        id,
        deleteUndefinedKeys({
          alias: {
            name: mappedProps.AliasTarget?.DNSName as string,
            zoneId: mappedProps.AliasTarget?.HostedZoneId as string,
            evaluateTargetHealth:
              (mappedProps.AliasTarget ? mappedProps.AliasTarget.EvaluateTargetHealth || false : undefined) as boolean,
          },
          cidrRoutingPolicy: {
            collectionId: mappedProps.CidrRoutingConfig?.CollectionId as string,
            locationName: mappedProps.CidrRoutingConfig?.LocationName as string,
          },
          failoverRoutingPolicy: {
            type: mappedProps.Failover as string,
          },
          zoneId: mappedProps.HostedZoneId as string,
          geolocationRoutingPolicy: {
            country: mappedProps.GeoLocation?.CountryCode,
            continent: mappedProps.GeoLocation?.ContinentCode,
            subdivision: mappedProps.GeoLocation?.SubdivisionCode,
          },
          type: mappedProps.Type as string,
          name: mappedProps.Name,
          healthCheckId: mappedProps.HealthCheckId,
          ttl: mappedProps.TTL ? +mappedProps.TTL : undefined,
          setIdentifier: mappedProps.SetIdentifier,
          multivalueAnswerRoutingPolicy: mappedProps.MultiValueAnswer,
          records: mappedProps.ResourceRecords,
          weightedRoutingPolicy: {
            weight: mappedProps.Weight as number,
          },
          latencyRoutingPolicy: {
            region: mappedProps.Region as string,
          },
        }),
      );
    },
    unsupportedProps: ["Comment", "HostedZoneName"],
    attributes: {
      Ref: (resource) => resource.id,
      Id: (resource) => resource.id,
    },
  });
}
