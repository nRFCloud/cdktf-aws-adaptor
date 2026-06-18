# @nrfcloud/cdktf-aws-adaptor

## 0.11.0

### Minor Changes

- dd7136f: update cdk versions

### Patch Changes

- 50e4242: update cc supported resources

## 0.10.2

### Patch Changes

- 90e4e7c: Added mapping for CognitoUserPoolDomain

## 0.10.1

### Patch Changes

- 56375fe: hotfix cloudcontrol resources

## 0.10.0

### Minor Changes

- a23ee43: construct stability fixes

## 0.9.0

### Minor Changes

- 5e77ecc: Update AWS CDK lib to ^2.153.0 and update mappings

## 0.8.1

### Patch Changes

- 3358b0b: fix bad import

## 0.8.0

### Minor Changes

- d197c26: add support for dynamodb resource policies

## 0.7.3

### Patch Changes

- 9ab664a: Fix default property for Cloudfront distribution always setting custom origin config

## 0.7.2

### Patch Changes

- 2aaa19b: Fix case inconsistency for S3 Bucket `WebsiteUrl` param, add defaults for some CloudFront Distribution params
- e845d06: fix for trying to resolve provider field

## 0.7.1

### Patch Changes

- 8a6b195: fix issue with inverted dependency synthesis

## 0.7.0

### Minor Changes

- 5bd0311: Add support for Iam AccessKey resource mapping
- a2381fa: Fix for iam policy eventual consistency

## 0.6.2

### Patch Changes

- 146f3cd: workaround event source provider issue

## 0.6.1

### Patch Changes

- f9530e9: Map managed policy ARNs to policy attachments for roles

## 0.6.0

### Minor Changes

- 70e507a: explicit mapping for iam role
- 5d4f3a9: deprecate default on auto mappings
- 95447f0: stepfunction mapping
- 6e8992b: added lambda event source mapping
- 0bf9118: update aws cdk and provider as well as associated constructs

## 0.5.0

### Minor Changes

- 5172166: Add mapping for AWS:SQS:QueuePolicy
- a2560eb: Add mapping for AWS:SNS:Subscription
- a3df412: Add parameter mapping for ApiGatewayV2Route.

## 0.4.0

### Minor Changes

- 822b071: add log group mapping
- 822b071: add mapping for cloudfront distro
- 822b071: update cc mappings
- 822b071: add mapping for lambda functions

## 0.3.0

### Minor Changes

- 0571184: additional apigateway v2 mappings
- 8d31cfa: add apigateway v2 integration

## 0.1.0

### Minor Changes

- 387244b: Initial public release
