/* eslint-disable import/no-extraneous-dependencies */

import type { DeployFunction } from 'hardhat-deploy/dist/types.js'

const names = [
  {
    namedOwner: 'owner2',
    primaryName: 'with-profile.eth',
  },
]

const func: DeployFunction = async (hre) => {
  const { viem } = hre

  for (const { namedOwner, primaryName } of names) {
    const owner = (await viem.getNamedClients())[namedOwner]
    const reverseRegistrar = await viem.getContract('ReverseRegistrar', owner)
    const setPrimaryTx = await reverseRegistrar.write.setName([primaryName])
    console.log(
      `Setting primary name for ${owner.address} to ${primaryName} (tx: ${setPrimaryTx})...`,
    )
    await viem.waitForTransactionSuccess(setPrimaryTx)
  }

  return true
}

func.id = 'set-primary'
func.tags = ['set-primary']
func.runAtTheEnd = true

export default func
