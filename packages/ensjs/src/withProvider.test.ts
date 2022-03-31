import { ethers } from 'ethers'
import { ENS } from '.'

const start = async () => {
  const provider = new ethers.providers.JsonRpcProvider(
    'http://localhost:8545',
    'ropsten',
  )

  const providerFake = new ethers.providers.JsonRpcProvider(
    'http://localhost:34023',
    'ropsten',
  )

  const ENSInstance = new ENS({
    graphURI: 'http://localhost:8000/subgraphs/name/graphprotocol/ens',
  })
  await ENSInstance.setProvider(provider)

  const owner = await ENSInstance.getOwner('jefflau.eth')
  console.log(owner)

  try {
    const ownerShouldFail = await ENSInstance.withProvider(
      providerFake,
    ).getOwner('jefflau.eth')
    console.log(ownerShouldFail)
  } catch {
    console.log('fake provider successfully failed')
  }
}

start()
