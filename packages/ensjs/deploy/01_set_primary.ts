/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-await-in-loop */
import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const names = [
  {
    namedOwner: 'owner2',
    primaryName: 'with-profile.eth',
  },
]

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
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

export default func
