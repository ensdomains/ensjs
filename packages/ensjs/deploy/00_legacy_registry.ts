import type { DeployFunction } from 'hardhat-deploy/dist/types.js'
import { labelhash, namehash } from 'viem/ens'

const ZERO_HASH =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

const names = ['legacy']

const func: DeployFunction = async (hre) => {
  const { viem } = hre
  const { owner } = await viem.getNamedClients()

  const registry = await viem.getContract('LegacyENSRegistry', owner)

  const tldTx = await registry.write.setSubnodeOwner(
    [ZERO_HASH, labelhash('test'), owner.address],
    owner,
  )
  console.log(`Creating .test TLD (tx: ${tldTx.hash})...`)

  await viem.waitForTransactionSuccess(tldTx)

  await Promise.all(
    names.map(async (name) => {
      const nameTx = await registry.write.setSubnodeOwner(
        [namehash('test'), labelhash(name), owner.address],
        owner,
      )
      console.log(`Creating ${name}.test (tx: ${nameTx.hash})...`)
      await viem.waitForTransactionSuccess(nameTx)
    }),
  )

  return true
}

func.id = 'legacy-registry-names'
func.tags = ['legacy-registry-names']
func.dependencies = ['ENSRegistry']
func.skip = async (hre) => {
  const { getNamedAccounts, viem } = hre
  const { owner } = await getNamedAccounts()

  const registry = await viem.getContract('LegacyENSRegistry')

  const ownerOfTestTld = await registry.read.owner([namehash('test')])
  if (ownerOfTestTld !== owner) {
    return false
  }
  return true
}
func.runAtTheEnd = true

export default func
