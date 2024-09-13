import {registerMappingTyped} from "../utils.js";

export function registerEcsMappings() {
    // registerMapping("Custom::AWSCDK-EKS-Cluster", {
    //     resource: (scope, id, props) => {
    //         if (props?.Config?.EncryptionConfig && props?.Config?.EncryptionConfig.length > 1) {
    //             throw new Error("Only one encryptionConfig is allowed")
    //         }
    //         delete props.AssumeRoleArn
    //         delete props.AttributesRevision;
    //         delete props.ServiceToken
    //         const [encryptionConfig] = props.Config.encryptionConfig as Array<CfnCluster.EncryptionConfigProperty>;
    //         const accessConfig = props.Config.accessConfig as CfnCluster.AccessConfigProperty;
    //         // encryptionConfig[0].provider.
    //
    //         const cluster = new EksCluster(scope, id, deleteUndefinedKeys({
    //             name: props.Config.name,
    //             roleArn: props.Config.roleArn,
    //             version: props.Config.version,
    //             vpcConfig: {
    //                 securityGroupIds: props.Config.resourcesVpcConfig.securityGroupIds,
    //                 subnetIds: props.Config.resourcesVpcConfig.subnetIds,
    //                 endpointPrivateAccess: props.Config.resourcesVpcConfig.endpointPrivateAccess,
    //                 endpointPublicAccess: props.Config.resourcesVpcConfig.endpointPublicAccess,
    //             },
    //             kubernetesNetworkConfig: {
    //                 ipFamily: props.Config.kubernetesNetworkConfig.ipFamily,
    //                 serviceIpv4Cidr: props.Config.kubernetesNetworkConfig.serviceIpv4Cidr,
    //             },
    //             accessConfig: {
    //                 authenticationMode: accessConfig?.authenticationMode,
    //                 bootstrapClusterCreatorAdminPermissions: accessConfig?.bootstrapClusterCreatorAdminPermissions,
    //             },
    //             encryptionConfig: {
    //                 provider: {
    //                     keyArn: (encryptionConfig?.provider as CfnCluster.ProviderProperty).keyArn!,
    //                 },
    //                 resources: encryptionConfig?.resources!,
    //             },
    //         }))
    //         delete props.Config
    //         return cluster;
    //         // console.log(props)
    //     },
    //     attributes: {
    //         Ref: (resource: EksCluster) => resource.id,
    //         Endpoint: (resource: EksCluster) => resource.endpoint,
    //         Arn: (resource: EksCluster) => resource.arn,
    //         // CertificateAuthorityData: (resource: EksCluster) => resource.certificateAuthority.,
    //         ClusterSecurityGroupId: (resource: EksCluster) => resource.vpcConfig.clusterSecurityGroupId,
    //         EncryptionConfigKeyArn: (resource: EksCluster) => resource.encryptionConfig.provider.keyArn,
    //         OpenIdConnectIssuerUrl: (resource: EksCluster) => resource.identity.get(0).oidc.get(0).issuer,
    //         OpenIdConnectIssuer: (resource: EksCluster) => resource.identity.get(0).oidc.get(0).issuer,
    //     }
    // })


}
