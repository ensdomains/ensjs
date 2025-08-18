import type { DeployFunction } from 'hardhat-deploy/dist/types.js'
import { labelhash, namehash, packetToBytes } from 'viem/ens'
import { toHex } from 'viem/utils'
import { EMPTY_ADDRESS } from '../dist/utils/consts.js'

const func: DeployFunction = async (hre) => {
  const { getNamedAccounts, viem } = hre
  const allNamedAccts = await getNamedAccounts()
  const clients = await viem.getNamedClients()

  const nameWrapper = await viem.getContract('NameWrapper', clients.owner)
  const registry = await viem.getContract('ENSRegistry', clients.owner)

  const deleteName = async (name: string) => {
    const labels = name.split('.')
    const label = labelhash(labels.shift()!)
    const node = namehash(labels.join('.'))

    const tx = await registry.write.setSubnodeRecord([
      node,
      label,
      EMPTY_ADDRESS,
      EMPTY_ADDRESS,
      0,
    ])
    await viem.waitForTransactionSuccess(tx)
  }

  const name1 = 'wrapped-deleted.deletable.eth'
  const name2 = 'unwrapped-deleted.deletable.eth'

  // wrap wrapped-deleted.deletable.eth
  const approveTx = await registry.write.setApprovalForAll([
    nameWrapper.address,
    true,
  ])
  await viem.waitForTransactionSuccess(approveTx)
  const wrapTx = await nameWrapper.write.wrap([
    toHex(packetToBytes(name1)),
    allNamedAccts.owner,
    EMPTY_ADDRESS,
  ])
  await viem.waitForTransactionSuccess(wrapTx)

  await deleteName(name1)
  await deleteName(name2)

  for (const name of [name1, name2]) {
    const owner = await registry.read.owner([namehash(name)])
    if (owner !== EMPTY_ADDRESS) {
      throw new Error(`Failed to delete name ${name}`)
    }
  }

  return true
}

func.id = 'delete-names'
func.tags = ['delete-names']
func.dependencies = ['register-unwrapped-names']
func.runAtTheEnd = true

export default func
