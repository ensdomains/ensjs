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

  const tx2 = await ENSInstance.transferName(
    'parthtejpal.eth',
    accounts[1],
    'nameWrapper',
  )
  console.log(tx2)
  await tx2.wait()
  console.log(tx2)
}

start()
