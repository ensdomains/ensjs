const { readFile } = require('fs/promises')
const { resolve } = require('path')

const getArtifact = async () => {
  const artifact = JSON.parse(
    await readFile(resolve('./contracts/UniversalResolverv2.json'), 'utf8'),
  )
  return artifact
}

/**
 * @type {import('hardhat-deploy/types').DeployFunction}
 */
const func = async function (hre) {
  const { getNamedAccounts, deployments } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const registry = await hre.ethers.getContract('ENSRegistry')

  console.log('RUNNING TEMP UNIVERSALRESOLVER v2 DEPLOYMENT...')
  console.log('THIS SHOULD BE REMOVED BEFORE MERGE')

  await deploy('UniversalResolver', {
    from: deployer,
    args: [registry.address, ['http://0.0.0.0:8787']],
    log: true,
    contract: await getArtifact(),
  })
}

func.dependencies = ['registry', 'UniversalResolver']

module.exports = func
