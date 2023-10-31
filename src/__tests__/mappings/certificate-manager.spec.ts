import { AcmCertificateValidation } from "@cdktf/provider-aws/lib/acm-certificate-validation/index.js";
import { AcmCertificate } from "@cdktf/provider-aws/lib/acm-certificate/index.js";
import { Route53Record } from "@cdktf/provider-aws/lib/route53-record/index.js";
import { CfnCertificate } from "aws-cdk-lib/aws-certificatemanager";
import { setupJest } from "cdktf/lib/testing/adapters/jest.js";
import { synthesizeElementAndTestStability } from "../helpers.js";

setupJest();

describe("CertificateManager mappings", () => {
  it("should map AWS::CertificateManager::Certificate", () => {
    const { synth } = synthesizeElementAndTestStability(
      CfnCertificate,
      {
        domainName: "domain-name",
        tags: [
          {
            key: "key",
            value: "value",
          },
        ],
        certificateAuthorityArn: "certificate-authority-arn",
        certificateTransparencyLoggingPreference: "certificate-transparency-logging-preference",
        keyAlgorithm: "key-algorithm",
        validationMethod: "DNS",
        subjectAlternativeNames: [
          "subject-alternative-name",
        ],
        domainValidationOptions: [
          {
            domainName: "domain-name",
            validationDomain: "validation-domain",
            hostedZoneId: "hosted-zone-id",
          },
        ],
      },
      AcmCertificate,
      {
        domainName: "domain-name",
        tags: {
          key: "value",
        },
        keyAlgorithm: "key-algorithm",
        validationMethod: "DNS",
        subjectAlternativeNames: [
          "subject-alternative-name",
        ],
        certificateAuthorityArn: "certificate-authority-arn",
        validationOption: [
          {
            domainName: "domain-name",
            validationDomain: "validation-domain",
          },
        ],
        options: {
          certificateTransparencyLoggingPreference: "certificate-transparency-logging-preference",
        },
      },
    );

    expect(synth).toHaveResource(AcmCertificateValidation);
    expect(synth).toHaveResource(Route53Record);
    // expect(Testing.fullSynth(stack)).toPlanSuccessfully()
  });
});
