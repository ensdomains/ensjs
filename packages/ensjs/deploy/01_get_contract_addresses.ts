import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { DeployFunction } from 'hardhat-deploy/types.js'

const func: DeployFunction = async (hre) => {
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

  await (await hre.viem.getTestClient()).request({
    method: 'evm_snapshot',
  })
}

func.runAtTheEnd = true
func.dependencies = ['set-legacy-resolver']

export default func
