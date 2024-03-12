import {
    CognitoIdentityPoolRolesAttachment,
} from "@cdktf/provider-aws/lib/cognito-identity-pool-roles-attachment/index.js";
import { CognitoIdentityPool } from "@cdktf/provider-aws/lib/cognito-identity-pool/index.js";
import { CognitoUserPoolClient } from "@cdktf/provider-aws/lib/cognito-user-pool-client/index.js";
import { CognitoUserPool } from "@cdktf/provider-aws/lib/cognito-user-pool/index.js";
import {
    CfnIdentityPool,
    CfnIdentityPoolRoleAttachment,
    CfnUserPool,
    CfnUserPoolClient,
} from "aws-cdk-lib/aws-cognito";
import { synthesizeElementAndTestStability } from "../helpers.js";

describe("Cognito mappings", () => {
    it("Should map AWS::Cognito::UserPoolClient", () => {
        synthesizeElementAndTestStability(
            CfnUserPoolClient,
            {
                enablePropagateAdditionalUserContextData: true,
                accessTokenValidity: 60,
                allowedOAuthFlows: ["code"],
                allowedOAuthFlowsUserPoolClient: true,
                analyticsConfiguration: {
                    externalId: "external-id",
                    applicationId: "application-id",
                    roleArn: "role-arn",
                    userDataShared: true,
                    applicationArn: "application-arn",
                },
                authSessionValidity: 60,
                callbackUrLs: ["callback-url"],
                clientName: "client-name",
                defaultRedirectUri: "default-redirect-uri",
                explicitAuthFlows: ["USER_PASSWORD_AUTH"],
                generateSecret: true,
                idTokenValidity: 60,
                logoutUrLs: ["logout-url"],
                preventUserExistenceErrors: "ENABLED",
                readAttributes: ["email"],
                refreshTokenValidity: 60,
                enableTokenRevocation: true,
                supportedIdentityProviders: ["COGNITO"],
                userPoolId: "user-pool-id",
                writeAttributes: ["email"],
                tokenValidityUnits: {
                    accessToken: "seconds",
                    idToken: "seconds",
                    refreshToken: "seconds",
                },
                allowedOAuthScopes: ["email"],
            },
            CognitoUserPoolClient,
            {
                name: "client-name",
                defaultRedirectUri: "default-redirect-uri",
                explicitAuthFlows: ["USER_PASSWORD_AUTH"],
                generateSecret: true,
                readAttributes: ["email"],
                supportedIdentityProviders: ["COGNITO"],
                userPoolId: "user-pool-id",
                writeAttributes: ["email"],
                allowedOauthFlows: ["code"],
                allowedOauthFlowsUserPoolClient: true,
                allowedOauthScopes: ["email"],
                analyticsConfiguration: [
                    {
                        externalId: "external-id",
                        applicationId: "application-id",
                        roleArn: "role-arn",
                        userDataShared: true,
                        applicationArn: "application-arn",
                    },
                ],
                callbackUrls: ["callback-url"],
                logoutUrls: ["logout-url"],
                preventUserExistenceErrors: "ENABLED",
                authSessionValidity: 60,
                idTokenValidity: 60,
                tokenValidityUnits: [
                    {
                        idToken: "seconds",
                        refreshToken: "seconds",
                        accessToken: "seconds",
                    },
                ],
                enableTokenRevocation: true,
                refreshTokenValidity: 60,
                accessTokenValidity: 60,
                enablePropagateAdditionalUserContextData: true,
            },
        );
    });

    it("Should map AWS::Cognito::IdentityPoolRoleAttachment", () => {
        synthesizeElementAndTestStability(
            CfnIdentityPoolRoleAttachment,
            {
                roles: {
                    authenticated: "authenticated-role",
                    unauthenticated: "unauthenticated-role",
                },
                roleMappings: {
                    "role-mapping": {
                        type: "Token",
                        ambiguousRoleResolution: "AuthenticatedRole",
                        identityProvider: "cognito-idp",
                        rulesConfiguration: {
                            rules: [{
                                claim: "claim",
                                matchType: "Equals",
                                roleArn: "role-arn",
                                value: "value",
                            }],
                        },
                    },
                },
                identityPoolId: "identity-pool-id",
            },
            CognitoIdentityPoolRolesAttachment,
            {
                roles: {
                    authenticated: "authenticated-role",
                    unauthenticated: "unauthenticated-role",
                },
                identityPoolId: "identity-pool-id",
                roleMapping: [
                    {
                        type: "Token",
                        ambiguousRoleResolution: "AuthenticatedRole",
                        identityProvider: "cognito-idp",
                        mappingRule: [
                            {
                                value: "value",
                                claim: "claim",
                                matchType: "Equals",
                                roleArn: "role-arn",
                            },
                        ],
                    },
                ],
            },
        );
    });

    it("Should map AWS::Cognito::IdentityPool", () => {
        synthesizeElementAndTestStability(
            CfnIdentityPool,
            {
                allowClassicFlow: true,
                allowUnauthenticatedIdentities: true,
                cognitoIdentityProviders: [
                    {
                        providerName: "provider-name",
                        serverSideTokenCheck: true,
                        clientId: "client-id",
                    },
                ],
                developerProviderName: "developer-provider-name",
                identityPoolName: "identity-pool-name",
                samlProviderArns: ["saml-provider-arn"],
                supportedLoginProviders: {
                    "login-provider": "login-provider",
                },
                openIdConnectProviderArns: ["open-id-connect-provider-arn"],
                // FIXME: this is not supported by the provider yet
                // cognitoEvents: {
                //     "event": "event",
                // },
                // pushSync: {
                //     roleArn: "role-arn",
                //     applicationArns: ["application-arn"],
                // },
                // cognitoStreams: {
                //     roleArn: "role-arn",
                //     streamName: "stream-name",
                //     streamingStatus: "ENABLED",
                // },
            },
            CognitoIdentityPool,
            {
                allowClassicFlow: true,
                allowUnauthenticatedIdentities: true,
                cognitoIdentityProviders: [
                    {
                        providerName: "provider-name",
                        serverSideTokenCheck: true,
                        clientId: "client-id",
                    },
                ],
                developerProviderName: "developer-provider-name",
                identityPoolName: "identity-pool-name",
                samlProviderArns: ["saml-provider-arn"],
                supportedLoginProviders: {
                    "login-provider": "login-provider",
                },
            },
        );
    });

    it("Should map AWS::Cognito::UserPool", () => {
        synthesizeElementAndTestStability(
            CfnUserPool,
            {
                schema: [
                    {
                        name: "name",
                        mutable: true,
                        required: true,
                        attributeDataType: "String",
                        numberAttributeConstraints: {
                            maxValue: "max-value",
                            minValue: "min-value",
                        },
                        stringAttributeConstraints: {
                            maxLength: "max-length",
                            minLength: "min-length",
                        },
                    },
                ],
                enabledMfas: ["SMS"],
                adminCreateUserConfig: {
                    allowAdminCreateUserOnly: true,
                    inviteMessageTemplate: {
                        emailMessage: "email-message",
                        emailSubject: "email-subject",
                        smsMessage: "sms-message",
                    },
                    unusedAccountValidityDays: 60,
                },
                mfaConfiguration: "ON",
                userPoolAddOns: {
                    advancedSecurityMode: "OFF",
                },
                accountRecoverySetting: {
                    recoveryMechanisms: [
                        {
                            name: "name",
                            priority: 60,
                        },
                    ],
                },
                aliasAttributes: ["email"],
                autoVerifiedAttributes: ["email"],
                deviceConfiguration: {
                    challengeRequiredOnNewDevice: true,
                    deviceOnlyRememberedOnUserPrompt: true,
                },
                emailConfiguration: {
                    emailSendingAccount: "COGNITO_DEFAULT",
                    from: "from",
                    replyToEmailAddress: "reply-to-email-address",
                    configurationSet: "configuration-set",
                    sourceArn: "source-arn",
                },
                emailVerificationMessage: "email-verification-message",
                emailVerificationSubject: "email-verification-subject",
                lambdaConfig: {
                    createAuthChallenge: "create-auth-challenge",
                    customMessage: "custom-message",
                    defineAuthChallenge: "define-auth-challenge",
                    postAuthentication: "post-authentication",
                    postConfirmation: "post-confirmation",
                    preAuthentication: "pre-authentication",
                    preSignUp: "pre-sign-up",
                    kmsKeyId: "kms-key-id",
                    customSmsSender: {
                        lambdaArn: "lambda-arn",
                        lambdaVersion: "lambda-version",
                    },
                    customEmailSender: {
                        lambdaArn: "lambda-arn",
                        lambdaVersion: "lambda-version",
                    },
                    preTokenGeneration: "pre-token-generation",
                    userMigration: "user-migration",
                    verifyAuthChallengeResponse: "verify-auth-challenge-response",
                },
                usernameAttributes: ["email"],
                smsAuthenticationMessage: "sms-authentication-message",
                smsConfiguration: {
                    externalId: "external-id",
                    snsCallerArn: "sns-caller-arn",
                    snsRegion: "sns-region",
                },
                smsVerificationMessage: "sms-verification-message",
                policies: {
                    passwordPolicy: {
                        temporaryPasswordValidityDays: 60,
                        requireLowercase: true,
                        requireNumbers: true,
                        requireSymbols: true,
                        requireUppercase: true,
                        minimumLength: 60,
                    },
                },
                verificationMessageTemplate: {
                    defaultEmailOption: "CONFIRM_WITH_CODE",
                    smsMessage: "sms-message",
                    emailMessageByLink: "email-message-by-link",
                    emailSubjectByLink: "email-subject-by-link",
                    emailSubject: "email-subject",
                    emailMessage: "email-message",
                },
                userAttributeUpdateSettings: {
                    attributesRequireVerificationBeforeUpdate: ["email"],
                },
                deletionProtection: "true",
                usernameConfiguration: {
                    caseSensitive: true,
                },
                userPoolTags: {
                    "user-pool-tag": "user-pool-tag",
                },
                userPoolName: "user-pool-name",
            },
            CognitoUserPool,
            {
                name: "user-pool-name",
                usernameAttributes: ["email"],
                autoVerifiedAttributes: ["email"],
                aliasAttributes: ["email"],
                mfaConfiguration: "ON",
                smsAuthenticationMessage: "sms-authentication-message",
                smsConfiguration: {
                    externalId: "external-id",
                    snsCallerArn: "sns-caller-arn",
                    snsRegion: "sns-region",
                },
                softwareTokenMfaConfiguration: {
                    enabled: false,
                },
                emailVerificationMessage: undefined,
                emailVerificationSubject: undefined,
                emailConfiguration: {
                    emailSendingAccount: "COGNITO_DEFAULT",
                    configurationSet: "configuration-set",
                    replyToEmailAddress: "reply-to-email-address",
                    sourceArn: "source-arn",
                    fromEmailAddress: "from",
                },
                tags: {
                    "user-pool-tag": "user-pool-tag",
                },
                deletionProtection: "true",
                usernameConfiguration: {
                    caseSensitive: true,
                },
                userAttributeUpdateSettings: {
                    attributesRequireVerificationBeforeUpdate: ["email"],
                },
                passwordPolicy: {
                    minimumLength: 60,
                    requireLowercase: true,
                    requireNumbers: true,
                    requireSymbols: true,
                    requireUppercase: true,
                    temporaryPasswordValidityDays: 60,
                },
                smsVerificationMessage: undefined,
                verificationMessageTemplate: {
                    defaultEmailOption: "CONFIRM_WITH_CODE",
                    emailMessage: "email-message",
                    emailMessageByLink: "email-message-by-link",
                    emailSubject: "email-subject",
                    emailSubjectByLink: "email-subject-by-link",
                    smsMessage: "sms-message",
                },
                adminCreateUserConfig: {
                    allowAdminCreateUserOnly: true,
                    inviteMessageTemplate: {
                        emailMessage: "email-message",
                        emailSubject: "email-subject",
                        smsMessage: "sms-message",
                    },
                },
                accountRecoverySetting: {
                    recoveryMechanism: [
                        {
                            name: "name",
                            priority: 60,
                        },
                    ],
                },
                schema: [
                    {
                        name: "name",
                        mutable: true,
                        required: true,
                        attributeDataType: "String",
                        stringAttributeConstraints: {
                            maxLength: "max-length",
                            minLength: "min-length",
                        },
                        developerOnlyAttribute: false,
                        numberAttributeConstraints: {
                            maxValue: "max-value",
                            minValue: "min-value",
                        },
                    },
                ],
                deviceConfiguration: {
                    challengeRequiredOnNewDevice: true,
                    deviceOnlyRememberedOnUserPrompt: true,
                },
                lambdaConfig: {
                    createAuthChallenge: "create-auth-challenge",
                    customMessage: "custom-message",
                    defineAuthChallenge: "define-auth-challenge",
                    postAuthentication: "post-authentication",
                    postConfirmation: "post-confirmation",
                    preAuthentication: "pre-authentication",
                    preSignUp: "pre-sign-up",
                    kmsKeyId: "kms-key-id",
                    customSmsSender: {
                        lambdaArn: "lambda-arn",
                        lambdaVersion: "lambda-version",
                    },
                    preTokenGeneration: "pre-token-generation",
                    userMigration: "user-migration",
                    verifyAuthChallengeResponse: "verify-auth-challenge-response",
                    customEmailSender: {
                        lambdaArn: "lambda-arn",
                        lambdaVersion: "lambda-version",
                    },
                },
                userPoolAddOns: {
                    advancedSecurityMode: "OFF",
                },
            },
        );
    });
});
