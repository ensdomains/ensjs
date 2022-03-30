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

  const [resolver1, resolver2, name] = await ENSInstance.batch([
    [ENSInstance.getResolver, 'jefflau.eth'],
    [ENSInstance.getResolver, 'parthtejpal.eth'],
    [ENSInstance.getName, '0x866B3c4994e1416B7C738B9818b31dC246b95eEE'],
  ])
  const singleResolver = await ENSInstance.getResolver('jefflau.eth')
  console.log(singleResolver)
  console.log(resolver1)
  console.log(resolver2)
  console.log(name)
}

start()
