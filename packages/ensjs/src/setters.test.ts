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

  // const tx = await ENSInstance.setResolver(
  //   'parthtejpal.eth',
  //   'nameWrapper',
  //   undefined,
  //   { addressOrIndex: accounts[0] },
  // )
  // console.log(tx)
  // await tx.wait()
  // console.log(tx)

  // console.log(
  //   (
  //     await ENSInstance.contracts?.getNameWrapper()!
  //   ).interface.decodeErrorResult(
  //     'IncorrectTokenType()',
  //     '0xa2a720137268fa64a1432185cfde9882a74f1645584ffa2251b1873d6235f039228bdfc9',
  //   ),
  // )

  const tx2 = await ENSInstance.transfer(
    'parthtejpal.eth',
    accounts[1],
    'nameWrapper',
  )
  console.log(tx2)
  await tx2.wait()
  console.log(tx2)
}

start()
