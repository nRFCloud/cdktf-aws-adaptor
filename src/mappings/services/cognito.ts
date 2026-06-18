import {
    CognitoIdentityPoolRolesAttachment,
    CognitoIdentityPoolRolesAttachmentConfig,
} from "@cdktf/provider-aws/lib/cognito-identity-pool-roles-attachment/index.js";
import { CognitoIdentityPool, CognitoIdentityPoolConfig } from "@cdktf/provider-aws/lib/cognito-identity-pool/index.js";
import {
    CognitoUserPoolClient,
    CognitoUserPoolClientConfig,
} from "@cdktf/provider-aws/lib/cognito-user-pool-client/index.js";
import {
    CognitoUserPoolDomain,
    CognitoUserPoolDomainConfig,
} from "@cdktf/provider-aws/lib/cognito-user-pool-domain/index.js";
import { CognitoUserPool, CognitoUserPoolConfig } from "@cdktf/provider-aws/lib/cognito-user-pool/index.js";
import { Names } from "aws-cdk-lib";
import {
    CfnIdentityPool,
    CfnIdentityPoolRoleAttachment,
    CfnUserPool,
    CfnUserPoolClient,
    CfnUserPoolDomain,
} from "aws-cdk-lib/aws-cognito";
import { deleteUndefinedKeys, registerMappingTyped } from "../utils.js";

export function registerCognitoMappings() {
    registerMappingTyped(CfnUserPoolClient, CognitoUserPoolClient, {
        resource(scope, id, userPoolClient) {
            const mapped: CognitoUserPoolClientConfig = {
                name: userPoolClient.ClientName!,
                userPoolId: userPoolClient.UserPoolId,
                allowedOauthFlowsUserPoolClient: userPoolClient.AllowedOAuthFlowsUserPoolClient,
                analyticsConfiguration: [{
                    externalId: userPoolClient.AnalyticsConfiguration?.ExternalId,
                    applicationId: userPoolClient.AnalyticsConfiguration?.ApplicationId,
                    roleArn: userPoolClient.AnalyticsConfiguration?.RoleArn,
                    userDataShared: userPoolClient.AnalyticsConfiguration?.UserDataShared,
                    applicationArn: userPoolClient.AnalyticsConfiguration?.ApplicationArn,
                }],
                callbackUrls: userPoolClient.CallbackURLs,
                generateSecret: userPoolClient.GenerateSecret,
                logoutUrls: userPoolClient.LogoutURLs,
                preventUserExistenceErrors: userPoolClient.PreventUserExistenceErrors,
                readAttributes: userPoolClient.ReadAttributes,
                refreshTokenValidity: userPoolClient.RefreshTokenValidity,
                supportedIdentityProviders: userPoolClient.SupportedIdentityProviders,
                writeAttributes: userPoolClient.WriteAttributes,
                explicitAuthFlows: userPoolClient.ExplicitAuthFlows,
                tokenValidityUnits: [{
                    idToken: userPoolClient.TokenValidityUnits?.IdToken,
                    accessToken: userPoolClient.TokenValidityUnits?.AccessToken,
                    refreshToken: userPoolClient.TokenValidityUnits?.RefreshToken,
                }],
                allowedOauthFlows: userPoolClient.AllowedOAuthFlows,
                allowedOauthScopes: userPoolClient.AllowedOAuthScopes,
                idTokenValidity: userPoolClient.IdTokenValidity,
                enableTokenRevocation: userPoolClient.EnableTokenRevocation,
                defaultRedirectUri: userPoolClient.DefaultRedirectURI,
                accessTokenValidity: userPoolClient.AccessTokenValidity,
                enablePropagateAdditionalUserContextData: userPoolClient.EnablePropagateAdditionalUserContextData,
                authSessionValidity: userPoolClient.AuthSessionValidity,
            };
            const client = new CognitoUserPoolClient(scope, id, deleteUndefinedKeys(mapped));
            client.name = mapped.name || Names.uniqueResourceName(client, { maxLength: 64 });
            return client;
        },
        attributes: {
            Name: resource => resource.name,
            ClientSecret: resource => resource.clientSecret,
            Ref: resource => resource.id,
            ClientId: resource => resource.id,
        },
    });

    registerMappingTyped(
        CfnIdentityPoolRoleAttachment,
        CognitoIdentityPoolRolesAttachment,
        {
            resource(scope, id, identityPoolRoleAttachment) {
                const mapped: CognitoIdentityPoolRolesAttachmentConfig = {
                    roleMapping: Object.entries(identityPoolRoleAttachment.RoleMappings || {}).map(([, value]) => ({
                        type: value.Type!,
                        ambiguousRoleResolution: value.AmbiguousRoleResolution,
                        identityProvider: value.IdentityProvider!,
                        mappingRule: value.RulesConfiguration?.Rules.map(rule => ({
                            claim: rule.Claim!,
                            value: rule.Value,
                            matchType: rule.MatchType!,
                            roleArn: rule.RoleARN!,
                        })),
                    })),
                    identityPoolId: identityPoolRoleAttachment.IdentityPoolId!,
                    roles: identityPoolRoleAttachment.Roles ?? {},
                };

                return new CognitoIdentityPoolRolesAttachment(
                    scope,
                    id,
                    deleteUndefinedKeys(mapped),
                );
            },
            attributes: {
                Ref: resource => resource.id,
                Id: resource => resource.id,
            },
        },
    );

    registerMappingTyped(CfnIdentityPool, CognitoIdentityPool, {
        resource(scope, id, identityPool) {
            const mapped: CognitoIdentityPoolConfig = {
                identityPoolName: identityPool.IdentityPoolName!,
                cognitoIdentityProviders: identityPool.CognitoIdentityProviders?.map(provider => ({
                    clientId: provider.ClientId!,
                    providerName: provider.ProviderName!,
                    serverSideTokenCheck: provider.ServerSideTokenCheck,
                })),
                tags: Object.fromEntries(
                    identityPool?.IdentityPoolTags?.map(({
                        Key: key,
                        Value: value,
                    }) => [key, value]) || [],
                ),
                allowUnauthenticatedIdentities: identityPool.AllowUnauthenticatedIdentities,
                developerProviderName: identityPool.DeveloperProviderName,
                allowClassicFlow: identityPool.AllowClassicFlow,
                openidConnectProviderArns: identityPool.OpenIdConnectProviderARNs,
                samlProviderArns: identityPool.SamlProviderARNs,
                supportedLoginProviders: identityPool.SupportedLoginProviders,
            };

            const pool = new CognitoIdentityPool(
                scope,
                id,
                deleteUndefinedKeys(mapped),
            );

            pool.identityPoolName = mapped.identityPoolName || Names.uniqueResourceName(pool, { maxLength: 64 });
            return pool;
        },
        unsupportedProps: ["CognitoStreams", "CognitoEvents", "PushSync"],
        attributes: {
            Ref: resource => resource.id,
            Name: resource => resource.identityPoolName,
            Id: resource => resource.id,
        },
    });

    registerMappingTyped(CfnUserPool, CognitoUserPool, {
        resource(scope, id, userPool) {
            userPool?.EmailVerificationSubject;
            userPool?.EmailVerificationMessage;
            userPool?.SmsVerificationMessage;

            const mapped: CognitoUserPoolConfig = {
                emailMfaConfiguration: {
                    message: userPool?.EmailAuthenticationMessage,
                    subject: userPool?.EmailAuthenticationSubject,
                },
                deletionProtection: userPool?.DeletionProtection,
                userAttributeUpdateSettings: {
                    attributesRequireVerificationBeforeUpdate: userPool?.UserAttributeUpdateSettings
                        ?.AttributesRequireVerificationBeforeUpdate as string[],
                },
                tags: userPool?.UserPoolTags,
                name: userPool?.UserPoolName as string,
                adminCreateUserConfig: {
                    allowAdminCreateUserOnly: userPool?.AdminCreateUserConfig?.AllowAdminCreateUserOnly,
                    inviteMessageTemplate: {
                        emailMessage: userPool?.AdminCreateUserConfig?.InviteMessageTemplate?.EmailMessage,
                        emailSubject: userPool?.AdminCreateUserConfig?.InviteMessageTemplate?.EmailSubject,
                        smsMessage: userPool?.AdminCreateUserConfig?.InviteMessageTemplate?.SMSMessage,
                    },
                },
                aliasAttributes: userPool?.AliasAttributes,
                autoVerifiedAttributes: userPool?.AutoVerifiedAttributes,
                deviceConfiguration: {
                    challengeRequiredOnNewDevice: userPool?.DeviceConfiguration?.ChallengeRequiredOnNewDevice,
                    deviceOnlyRememberedOnUserPrompt: userPool?.DeviceConfiguration?.DeviceOnlyRememberedOnUserPrompt,
                },
                emailConfiguration: {
                    replyToEmailAddress: userPool?.EmailConfiguration?.ReplyToEmailAddress,
                    sourceArn: userPool?.EmailConfiguration?.SourceArn,
                    fromEmailAddress: userPool?.EmailConfiguration?.From,
                    configurationSet: userPool?.EmailConfiguration?.ConfigurationSet,
                    emailSendingAccount: userPool?.EmailConfiguration?.EmailSendingAccount,
                },
                lambdaConfig: {
                    createAuthChallenge: userPool?.LambdaConfig?.CreateAuthChallenge,
                    customMessage: userPool?.LambdaConfig?.CustomMessage,
                    defineAuthChallenge: userPool?.LambdaConfig?.DefineAuthChallenge,
                    postAuthentication: userPool?.LambdaConfig?.PostAuthentication,
                    postConfirmation: userPool?.LambdaConfig?.PostConfirmation,
                    preAuthentication: userPool?.LambdaConfig?.PreAuthentication,
                    preSignUp: userPool?.LambdaConfig?.PreSignUp,
                    preTokenGeneration: userPool?.LambdaConfig?.PreTokenGeneration,
                    userMigration: userPool?.LambdaConfig?.UserMigration,
                    verifyAuthChallengeResponse: userPool?.LambdaConfig?.VerifyAuthChallengeResponse,
                    kmsKeyId: userPool?.LambdaConfig?.KMSKeyID,
                    customEmailSender: {
                        lambdaArn: userPool?.LambdaConfig?.CustomEmailSender?.LambdaArn as string,
                        lambdaVersion: userPool?.LambdaConfig?.CustomEmailSender?.LambdaVersion as string,
                    },
                    customSmsSender: {
                        lambdaArn: userPool?.LambdaConfig?.CustomSMSSender?.LambdaArn as string,
                        lambdaVersion: userPool?.LambdaConfig?.CustomSMSSender?.LambdaVersion as string,
                    },
                    preTokenGenerationConfig: {
                        lambdaArn: userPool?.LambdaConfig?.PreTokenGenerationConfig?.LambdaArn as string,
                        lambdaVersion: userPool?.LambdaConfig?.PreTokenGenerationConfig?.LambdaVersion as string,
                    },
                },
                mfaConfiguration: userPool?.MfaConfiguration,
                schema: userPool?.Schema?.map(schema => ({
                    name: schema.Name!,
                    attributeDataType: schema.AttributeDataType || "String",
                    developerOnlyAttribute: schema.DeveloperOnlyAttribute || false,
                    mutable: schema.Mutable,
                    numberAttributeConstraints: {
                        maxValue: schema.NumberAttributeConstraints?.MaxValue,
                        minValue: schema.NumberAttributeConstraints?.MinValue,
                    },
                    required: schema.Required,
                    stringAttributeConstraints: {
                        maxLength: schema.StringAttributeConstraints?.MaxLength || "2048",
                        minLength: schema.StringAttributeConstraints?.MinLength || "0",
                    },
                })),
                smsAuthenticationMessage: userPool?.SmsAuthenticationMessage,
                smsConfiguration: {
                    externalId: userPool?.SmsConfiguration?.ExternalId as string,
                    snsCallerArn: userPool?.SmsConfiguration?.SnsCallerArn as string,
                    snsRegion: userPool?.SmsConfiguration?.SnsRegion as string,
                },
                // smsVerificationMessage: userPool?.SmsVerificationMessage,
                userPoolAddOns: {
                    advancedSecurityMode: userPool?.UserPoolAddOns?.AdvancedSecurityMode as string,
                },
                passwordPolicy: {
                    temporaryPasswordValidityDays: userPool?.Policies?.PasswordPolicy?.TemporaryPasswordValidityDays,
                    requireLowercase: userPool?.Policies?.PasswordPolicy?.RequireLowercase,
                    requireNumbers: userPool?.Policies?.PasswordPolicy?.RequireNumbers,
                    requireSymbols: userPool?.Policies?.PasswordPolicy?.RequireSymbols,
                    requireUppercase: userPool?.Policies?.PasswordPolicy?.RequireUppercase,
                    minimumLength: userPool?.Policies?.PasswordPolicy?.MinimumLength,
                    passwordHistorySize: userPool?.Policies?.PasswordPolicy?.PasswordHistorySize,
                },
                userPoolTier: userPool?.UserPoolTier,
                webAuthnConfiguration: {
                    userVerification: userPool?.WebAuthnUserVerification,
                    relyingPartyId: userPool?.WebAuthnRelyingPartyID,
                },
                signInPolicy: {
                    allowedFirstAuthFactors: userPool?.Policies?.SignInPolicy?.AllowedFirstAuthFactors,
                },
                emailVerificationMessage: userPool?.EmailVerificationMessage,
                emailVerificationSubject: userPool?.EmailVerificationSubject,

                usernameAttributes: userPool?.UsernameAttributes,
                usernameConfiguration: {
                    caseSensitive: userPool?.UsernameConfiguration?.CaseSensitive as boolean,
                },
                accountRecoverySetting: {
                    recoveryMechanism: userPool?.AccountRecoverySetting?.RecoveryMechanisms?.map(recoveryMechanism => ({
                        name: recoveryMechanism.Name!,
                        priority: recoveryMechanism.Priority!,
                    })) || [],
                },
                softwareTokenMfaConfiguration: {
                    enabled: userPool?.EnabledMfas?.includes("SOFTWARE_TOKEN_MFA") as boolean,
                },
                verificationMessageTemplate: {
                    defaultEmailOption: userPool?.VerificationMessageTemplate?.DefaultEmailOption,
                    smsMessage: userPool?.VerificationMessageTemplate?.SmsMessage || userPool?.SmsVerificationMessage,
                    emailSubject: userPool?.VerificationMessageTemplate?.EmailSubject
                        || userPool?.EmailVerificationSubject,
                    emailMessage: userPool?.VerificationMessageTemplate?.EmailMessage
                        || userPool?.EmailVerificationMessage,
                    emailMessageByLink: userPool?.VerificationMessageTemplate?.EmailMessageByLink,
                    emailSubjectByLink: userPool?.VerificationMessageTemplate?.EmailSubjectByLink,
                },
            };

            const pool = new CognitoUserPool(scope, id, deleteUndefinedKeys(mapped));

            pool.name = mapped.name || Names.uniqueResourceName(pool, { maxLength: 64 });
            return pool;
        },
        unsupportedProps: [
            "AdminCreateUserConfig.UnusedAccountValidityDays",
            "UserPoolAddOns.AdvancedSecurityAdditionalFlows",
        ],
        attributes: {
            Ref: resource => resource.id,
            UserPoolId: resource => resource.id,
            Arn: resource => resource.arn,
            ProviderName: resource => resource.endpoint,
            ProviderURL: resource => `https://${resource.endpoint}`,
        },
    });

    registerMappingTyped(CfnUserPoolDomain, CognitoUserPoolDomain, {
        resource(scope, id, userPoolDomain) {
            const mapped: CognitoUserPoolDomainConfig = {
                domain: userPoolDomain.Domain,
                userPoolId: userPoolDomain.UserPoolId,
                certificateArn: userPoolDomain.CustomDomainConfig?.CertificateArn,
            };

            return new CognitoUserPoolDomain(scope, id, deleteUndefinedKeys(mapped));
        },
        unsupportedProps: ["ManagedLoginVersion"],
        attributes: {
            Ref: resource => resource.id,
            Id: resource => resource.id,
            CloudFrontDistribution: resource => resource.cloudfrontDistribution,
        },
    });
}
