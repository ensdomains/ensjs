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

  const tx = await ENSInstance.wrapName('parthtejpal.eth', accounts[0], {
    cannotUnwrap: true,
    cannotBurnFuses: true,
  })
  console.log(tx)
  await tx.wait()
  console.log(tx)
}

start()
