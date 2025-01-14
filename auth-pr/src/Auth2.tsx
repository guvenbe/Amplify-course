import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { useEffect, useState } from 'react';

export function Auth(){
    return <div>
        <Authenticator signUpAttributes={[
          'nickname'
        ]}>
        {({ signOut }) => (
        <main>
          <UserDetails/>
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
        </Authenticator>
    </div>
}

function UserDetails(){
  const [nickName, setNickName] = useState<string>();

  useEffect(()=>{
    async function getUserData(){
      const userData = await fetchUserAttributes()
      setNickName(userData.nickname)
    }
    getUserData()
  }, [])
  

  return   <div>
    <h1> Hello {nickName}</h1>

  </div>
}


