/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-await-in-loop */
const { ethers } = require('hardhat')

const names = [
  {
    namedOwner: 'owner2',
    primaryName: 'with-profile.eth',
  },
]

/**
 * @type {import('hardhat-deploy/types').DeployFunction}
 */
const func = async (hre) => {
  const { getNamedAccounts } = hre
  const allNamedAccts = await getNamedAccounts()

  for (const { namedOwner, primaryName } of names) {
    const addr = allNamedAccts[namedOwner]
    const reverseRegistrar = await ethers.getContract(
      'ReverseRegistrar',
      await ethers.getSigner(addr),
    )
    const setPrimaryTx = await reverseRegistrar.setName(primaryName)
    console.log(
      `Setting primary name for ${addr} to ${primaryName} (tx: ${setPrimaryTx.hash})...`,
    )
    await setPrimaryTx.wait()
  }

  return true
}

func.id = 'set-primary'
func.tags = ['set-primary']
func.runAtTheEnd = true

module.exports = func
