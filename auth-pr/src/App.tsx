import './App.css'
import { Auth } from './Auth1'

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
