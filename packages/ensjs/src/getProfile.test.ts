import { ethers } from 'ethers'
import { ENS } from '.'

const start = async () => {
  const provider = new ethers.providers.JsonRpcProvider(
    'http://localhost:8545',
    'ropsten',
  )

  const accounts = await provider.listAccounts()

  const ENSInstance = new ENS({
    graphURI: 'http://localhost:8000/subgraphs/name/graphprotocol/ens',
  })
  await ENSInstance.setProvider(provider)

  const profile = await ENSInstance.getProfile('jefflau.eth')
  const profileFromAddr = await ENSInstance.getProfile(
    '0x866B3c4994e1416B7C738B9818b31dC246b95eEE',
  )
  console.log(profile)
  console.log(profileFromAddr)
}

start()
