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

  const batch = await ENSInstance.resolverMulticallWrapper.raw([
    await ENSInstance._getText.raw('jefflau.eth', 'description'),
    await ENSInstance._getText.raw('jefflau.eth', 'url'),
    await ENSInstance._getAddr.raw('jefflau.eth'),
  ])
  const universalResponse = await ENSInstance.universalWrapper(
    'jefflau.eth',
    batch.data,
  )
  const [batchDecoded] = await ENSInstance.resolverMulticallWrapper.decode(
    universalResponse?.data,
  )
  const decoded1 = await ENSInstance._getText.decode(batchDecoded[0])
  const decoded2 = await ENSInstance._getText.decode(batchDecoded[1])
  const decoded3 = await ENSInstance._getAddr.decode(batchDecoded[2])
  console.log(decoded1, decoded2, decoded3)
}

start()
