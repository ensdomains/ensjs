const { ethers } = require('hardhat')
const { labelhash, namehash } = require('viem/ens')

const ZERO_HASH =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

const names = ['legacy']

/**
 * @type {import('hardhat-deploy/types').DeployFunction}
 */
const func = async (hre) => {
  const { getNamedAccounts } = hre
  const { owner } = await getNamedAccounts()

  const registry = await ethers.getContract('LegacyENSRegistry', owner)

  const tldTx = await registry.setSubnodeOwner(
    ZERO_HASH,
    labelhash('test'),
    owner,
  )
  console.log(`Creating .test TLD (tx: ${tldTx.hash})...`)
  await tldTx.wait()

  await Promise.all(
    names.map(async (name) => {
      const nameTx = await registry.setSubnodeOwner(
        namehash('test'),
        labelhash(name),
        owner,
      )
      console.log(`Creating ${name}.test (tx: ${nameTx.hash})...`)
      await nameTx.wait()
    }),
  )

  return true
}

func.id = 'legacy-registry-names'
func.tags = ['legacy-registry-names']
func.dependencies = ['ENSRegistry']
func.skip = async (hre) => {
  const { getNamedAccounts } = hre
  const { owner } = await getNamedAccounts()

  const registry = await ethers.getContract('LegacyENSRegistry')

  const ownerOfTestTld = await registry.owner(namehash('test'))
  if (ownerOfTestTld !== owner) {
    return false
  }
  return true
}
func.runAtTheEnd = true

module.exports = func
