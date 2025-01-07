import { Amplify } from "aws-amplify";
import config from '../config.json'
import { signIn, fetchAuthSession } from '@aws-amplify/auth'
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: config.amplify.userPoolId,
            userPoolClientId: config.amplify.userPoolClientId,
            identityPoolId: config.amplify.identityPoolId
        }
    }
})

async function logIn(userName: string, password: string){
    const signInResult = await signIn({
        username: userName,
        password: password
    })
    return signInResult;
}

async function generateTemporaryCredentials(idToken: string){
    const cognitoIdentityPool = `cognito-idp.${config.aws.region}.amazonaws.com/${config.amplify.userPoolId}`;
    const cognitoIdentity = new CognitoIdentityClient({
        credentials: fromCognitoIdentityPool({
            identityPoolId: config.amplify.identityPoolId,
            clientConfig: { region: config.aws.region },
            logins : {
                [cognitoIdentityPool]: idToken
            }
        })
    });
    const credentials = await cognitoIdentity.config.credentials();
    return credentials;
}

async function generateTemporaryGuestCredentials(){
    const cognitoIdentity = new CognitoIdentityClient({
        credentials: fromCognitoIdentityPool({
            identityPoolId: config.amplify.identityPoolId,
            clientConfig: { region: config.aws.region },
            logins : {}
        })
    });
    const credentials = await cognitoIdentity.config.credentials();
    return credentials;
}

async function main(){
    const result = await logIn(
        config.credentials.username,
        config.credentials.password
    )
    console.log('login result:')
    console.log(result)
    console.log('login session:')
    const session = await fetchAuthSession();
    console.log(session)
    const idToken = session.tokens?.idToken?.toString();
    console.log('id token: ')
    console.log(idToken)

    if (idToken) {
        console.log('Getting temporary credentials for authenticated user: ')
        const authCredentials = await generateTemporaryCredentials(idToken)
        const bucketFiles = await listBucketContents(authCredentials)
        console.log(bucketFiles)
    }
    console.log('Getting temporary credentials for guest user: ')
    const guestCredentials = await generateTemporaryGuestCredentials()
    try {
        await listBucketContents(guestCredentials)
    } catch (error: any) {
        console.log(error.message)
    }
}

export async function test(element: HTMLButtonElement){
    element.addEventListener('click', () => main())
}

async function listBucketContents(credentials: any){
    const client = new S3Client({
      credentials: credentials,
      region: config.aws.region
    })
    const bucketName = 'cool-photos13674';
    const result = await client.send(new ListObjectsV2Command({
      Bucket: bucketName
    }))
    return result;
  }