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

  // console.time('history')
  // const history = await ENSInstance.getHistoryWithDetail('jefflau.eth')
  // console.timeEnd('history')
  const historyItem = await ENSInstance.getHistoryDetailForTransactionHash(
    '0xb595c0e9921f1bab42819a61628cd4f9a27bcd7db92c6a691656434968a91f61',
    0,
  )
  console.log(historyItem)
}

start()
