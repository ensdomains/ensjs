/* eslint-disable import/no-extraneous-dependencies */
import { writeFile } from 'fs/promises'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { resolve } from 'path'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const allDeployments = await hre.deployments.all()
  const deploymentAddressMap = Object.fromEntries(
    Object.keys(allDeployments).map((dkey) => [
      dkey,
      allDeployments[dkey].address,
    ]),
  )

  await writeFile(
    resolve(__dirname, '../.env.local'),
    `DEPLOYMENT_ADDRESSES='${JSON.stringify(deploymentAddressMap)}'`,
  )
  console.log('Wrote contract addresses to .env.local')

  await hre.ethers.provider.send('evm_snapshot', [])
}

func.runAtTheEnd = true
func.dependencies = ['set-legacy-resolver']

export default func
