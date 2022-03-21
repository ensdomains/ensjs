import { ethers } from 'ethers'
import { ENS } from '.'

const start = async () => {
  const provider = new ethers.providers.JsonRpcProvider(
    'http://localhost:8545',
    'ropsten',
  )

  const ENSInstance = await ENS(provider)

  const response = await ENSInstance.getProfile('jefflau.eth')

  console.log(response)
}

start()
