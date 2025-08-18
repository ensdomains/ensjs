/* eslint-disable import/no-extraneous-dependencies */
const { writeFile } = require('fs/promises')
const { resolve } = require('path')

/**
 * @type {import('hardhat-deploy/types').DeployFunction}
 */
const func = async function (hre) {
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

module.exports = func
