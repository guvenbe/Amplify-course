import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { CfnIdentityPool, CfnIdentityPoolRoleAttachment, UserPool } from 'aws-cdk-lib/aws-cognito';
import { Effect, FederatedPrincipal, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';
import { Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class IdentityStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Cognito components:
    const userPool = new UserPool(this, 'CoolPool', {
      signInAliases: {
        email: true,
        username: true
      },
    })

    const userPoolClient = userPool.addClient('CoolClient', {
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        userSrp: true
      }
    })

    const identityPool = new CfnIdentityPool(this, 'CoolIdentityPool', {
      allowUnauthenticatedIdentities: true,
      cognitoIdentityProviders: [
        {
          clientId: userPoolClient.userPoolClientId,
          providerName: userPool.userPoolProviderName,
        },
      ],
    });

    const authenticatedRole = new Role(this, 'CoolAuthRole', {
      assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
        StringEquals: {
          'cognito-identity.amazonaws.com:aud': identityPool.ref
        },
        'ForAnyValue:StringLike': {
          'cognito-identity.amazonaws.com:amr': 'authenticated'
        }
      },
        'sts:AssumeRoleWithWebIdentity'
      )
    });

    const guestRole = new Role(this, 'CoolGuestRole', {
      assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
        StringEquals: {
          'cognito-identity.amazonaws.com:aud': identityPool.ref
        },
        'ForAnyValue:StringLike': {
          'cognito-identity.amazonaws.com:amr': 'unauthenticated'
        }
      },
        'sts:AssumeRoleWithWebIdentity'
      )
    });

    new CfnIdentityPoolRoleAttachment(this, 'RolesAttachment', {
      identityPoolId: identityPool.ref,
      roles: {
        'authenticated': authenticatedRole.roleArn,
        'unauthenticated': guestRole.roleArn
      },
      roleMappings: {
        adminsMapping: {
          type: 'Token',
          ambiguousRoleResolution: 'AuthenticatedRole',
          identityProvider: `${userPool.userPoolProviderName}:${userPoolClient.userPoolClientId}`
        }
      }
    })

    // s3 bucket:
    const photosBucket = new Bucket(this, 'PhotosBucket', {
      cors: [{
        allowedMethods: [
          HttpMethods.HEAD,
          HttpMethods.GET,
          HttpMethods.PUT
        ],
        allowedOrigins: ['*'],
        allowedHeaders: ['*']
      }],
    })

    // authenticated role should read the bucket:
    authenticatedRole.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        "s3:Get*",
        "s3:List*",
        "s3:Describe*",
      ],
      resources: [
        photosBucket.bucketArn,
        `${photosBucket.bucketArn}/*`
      ]
    }))

    // outputs:
    new CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId
    });
    new CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId
    });
    new CfnOutput(this, 'IdentityPoolId', {
      value: identityPool.ref
    });

  }
}
