import { AcmCertificateValidation } from "@cdktf/provider-aws/lib/acm-certificate-validation/index.js";
import { AcmCertificate } from "@cdktf/provider-aws/lib/acm-certificate/index.js";
import { DataAwsRoute53Zone } from "@cdktf/provider-aws/lib/data-aws-route53-zone/index.js";
import { Route53Record } from "@cdktf/provider-aws/lib/route53-record/index.js";
import { CfnCertificate } from "aws-cdk-lib/aws-certificatemanager";
import { deleteUndefinedKeys, registerMappingTyped } from "../utils.js";

export function registerCertificateManagerMappings() {
  registerMappingTyped(CfnCertificate, AcmCertificate, {
    resource(scope, id, props) {
      const cert = new AcmCertificate(
        scope,
        id,
        deleteUndefinedKeys({
          domainName: props.DomainName,
          keyAlgorithm: props.KeyAlgorithm,
          subjectAlternativeNames: props.SubjectAlternativeNames,
          validationMethod: props.ValidationMethod,
          certificateAuthorityArn: props.CertificateAuthorityArn,
          options: {
            certificateTransparencyLoggingPreference: props.CertificateTransparencyLoggingPreference,
          },
          validationOption: props.DomainValidationOptions?.map(option => ({
            domainName: option.DomainName,
            validationDomain: option.ValidationDomain || option.DomainName,
          })),
          tags: Object.fromEntries(props.Tags?.map(({ Key: key, Value: value }) => [key, value]) || []),
        }),
      );

      if (props.ValidationMethod === "DNS") {
        const hostedZoneId = props.DomainValidationOptions?.[0].HostedZoneId
          ?? new DataAwsRoute53Zone(scope, `${id}-zone-data`, {
            name: props.DomainName,
          }).zoneId;
        const records = new Route53Record(scope, `${id}-validation-record`, {
          name: "${each.value.name}",
          type: "${each.value.type}",
          records: [
            "${each.value.record}",
          ],
          zoneId: hostedZoneId,
          ttl: 60,
          allowOverwrite: true,
        });

        records.addOverride(
          "for_each",
          `\${{
    for dvo in ${cert.fqn}.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }
}`,
        );

        const certValidation = new AcmCertificateValidation(scope, `${id}-certvalidation`, {
          certificateArn: cert.arn,
        });
        certValidation.addOverride(
          "validation_record_fqdns",
          `\${[for record in aws_route53_record.${records.friendlyUniqueId} : record.fqdn]}`,
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (cert as any)[VALIDATED_ARN_SYMBOL] = certValidation.certificateArn;
      }

      return cert;
    },
    attributes: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Ref: (resource) => (resource as any)[VALIDATED_ARN_SYMBOL] || resource.arn,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Id: (resource) => (resource as any)[VALIDATED_ARN_SYMBOL] || resource.arn,
    },
  });
}

const VALIDATED_ARN_SYMBOL = Symbol("validatedArn");
