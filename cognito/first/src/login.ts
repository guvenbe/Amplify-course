import { Amplify } from "aws-amplify";
import config from '../config.json'
import { signIn, fetchAuthSession } from '@aws-amplify/auth'

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: config.amplify.userPoolId,
            userPoolClientId: config.amplify.userPoolClientId
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
}

export async function test(element: HTMLButtonElement){
    element.addEventListener('click', () => main())
}