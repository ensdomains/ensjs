import { ethers } from 'ethers'
import { ENS } from '.'
import fuses from './utils/fuses'

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

  const NameWrapper = await ENSInstance.contracts?.getNameWrapper()
  const BaseRegistrar = (
    await ENSInstance.contracts?.getBaseRegistrar()!
  ).connect(provider.getSigner())
  const PublicResolver = await ENSInstance.contracts?.getPublicResolver()

  const label = 'parthtejpal'
  const labelhash = ethers.utils.solidityKeccak256(['string'], [label])

  console.log(accounts[0])
  const data = ethers.utils.defaultAbiCoder.encode(
    ['string', 'address', 'uint96', 'address'],
    [label, accounts[0], fuses.CANNOT_UNWRAP, PublicResolver?.address],
  )

  const tx = await BaseRegistrar[
    'safeTransferFrom(address,address,uint256,bytes)'
  ](accounts[0], NameWrapper?.address, labelhash, data)
  console.log(tx)
  await tx.wait()
  console.log(tx)
}

start()
