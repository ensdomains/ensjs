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
    const setPrimaryTx = await reverseRegistrar.setName(primaryName)
    console.log(
      `Setting primary name for ${owner.address} to ${primaryName} (tx: ${setPrimaryTx.hash})...`,
    )
    await setPrimaryTx.wait()
  }

  return true
}

func.id = 'set-primary'
func.tags = ['set-primary']
func.runAtTheEnd = true

export default func
