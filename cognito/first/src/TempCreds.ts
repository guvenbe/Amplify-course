import { Amplify } from "aws-amplify";
import config from '../config.json'
import { signIn, fetchAuthSession } from '@aws-amplify/auth'
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

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
        console.log(authCredentials)
    }
    console.log('Getting temporary credentials for guest user: ')
    const guestCredentials = await generateTemporaryGuestCredentials()
    console.log(guestCredentials)
}

export async function test(element: HTMLButtonElement){
    element.addEventListener('click', () => main())
}