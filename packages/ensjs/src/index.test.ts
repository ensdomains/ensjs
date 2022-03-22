import { ethers } from 'ethers'
import { ENS } from '.'

const start = async () => {
  const provider = new ethers.providers.JsonRpcProvider(
    'http://localhost:8545',
    'ropsten',
  )

  const ENSInstance = new ENS({
    graphURI: 'http://localhost:8000/subgraphs/name/graphprotocol/ens',
  })
  await ENSInstance.setProvider(provider)

  const response = await ENSInstance.getProfile('jefflau.eth')

  console.log(response, response.records.texts, response.records.coinTypes)

  const nameResponse = await ENSInstance.getName(
    '0x866B3c4994e1416B7C738B9818b31dC246b95eEE',
  )

  console.log(nameResponse)

  const getProfileAddress = await ENSInstance.getProfile(
    '0x866B3c4994e1416B7C738B9818b31dC246b95eEE',
  )
  console.log(
    getProfileAddress,
    getProfileAddress.records.texts,
    getProfileAddress.records.coinTypes,
  )
}

start()
