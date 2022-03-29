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

  const contentHash = await ENSInstance.getContentHash('matoken.eth')
  console.log(contentHash)

  const text = await ENSInstance.getText('jefflau.eth', 'description')
  console.log(text)

  const addrETC = await ENSInstance.getAddr('jefflau.eth', 'ETC')
  console.log(addrETC)

  const addrETH = await ENSInstance.getAddr('jefflau.eth')
  console.log(addrETH)
}

start()
