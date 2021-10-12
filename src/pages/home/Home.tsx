import React from 'react'
import { setupAndInitializeAgent } from '../../agent'

const Home: React.FC = () => (
  <div>
    <h1>Hello Aries!</h1>
    <br />
    <button onClick={testIndy}>test Indy!</button>
    <br />
    <button onClick={() => setupAndInitializeAgent()}>test Agent!</button>
  </div>
)

const testIndy = () => {
  window.indy
    .createWallet({ id: '1010' }, { key: '1010' })
    .then(() => console.log('success'))
    .catch((e) => console.error(e))
}

export default Home
