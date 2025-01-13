import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { generateClient } from "aws-amplify/api"
import { Schema } from "../amplify/data/resource"

const client = generateClient<Schema>()

async function sayHello() {
  const result = await client.queries.sayHello({
      name: 'Barosanu'
  })
  console.log(result)
}

function App() {


  return (
    <>
      <button onClick={sayHello}>Click me</button>
    </>
  )
}

export default App
