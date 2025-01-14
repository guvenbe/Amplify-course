import './App.css'
import { Auth } from './Auth2'

import { Amplify } from 'aws-amplify';
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);

function App() {

  return (
    <>
      <Auth></Auth>
    </>
  )
}

export default App
