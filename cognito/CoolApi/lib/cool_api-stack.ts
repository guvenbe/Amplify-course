import * as cdk from 'aws-cdk-lib';
import { CognitoUserPoolsAuthorizer, LambdaIntegration, RestApi, MethodOptions, AuthorizationType } from 'aws-cdk-lib/aws-apigateway';
import { UserPool, CfnUserPoolGroup } from 'aws-cdk-lib/aws-cognito';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';


export class CoolApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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

    const authorizer = new CognitoUserPoolsAuthorizer(this, 'CoolAuthorizer', {
      cognitoUserPools: [userPool],
      identitySource: 'method.request.header.Authorization'
    });


    const adminsGroup = new CfnUserPoolGroup(this, 'Admins', {
      userPoolId: userPool.userPoolId,
      groupName: 'Admins',
    })

    // Lambda api handlers:
    const publicLambda = new NodejsFunction(this, 'PublicLambda', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'handler',
      entry: (join(__dirname, '..', 'services', 'PublicLambda.ts')),
      timeout: cdk.Duration.minutes(1)
    })
    const publicLambdaIntegration = new LambdaIntegration(publicLambda)

    const adminLambda = new NodejsFunction(this, 'AdminLambda', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'handler',
      entry: (join(__dirname, '..', 'services', 'AdminLambda.ts')),
      timeout: cdk.Duration.minutes(1)
    })
    const adminLambdaIntegration = new LambdaIntegration(adminLambda)

    // api components
    const api = new RestApi(this, 'CoolApi');

    const optionsWithAuthorizer: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: authorizer
    }

    api.root.addResource('public').addMethod('GET', publicLambdaIntegration)
    api.root.addResource('private').addMethod('GET', publicLambdaIntegration, optionsWithAuthorizer)
    api.root.addResource('admin').addMethod('GET', adminLambdaIntegration, optionsWithAuthorizer)


    // outputs:
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId
    });
    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId
    });
    new cdk.CfnOutput(this, 'CoolApiUrl', {
      value: api.url
    });
  }
}
