const { existsSync, mkdirSync } = require('node:fs')
const { readFile, writeFile } = require('node:fs/promises')
const { resolve } = require('node:path')

/**
 * @type {import('hardhat-deploy/types').DeployFunction}
 */
const func = async (hre) => {
  const { getNamedAccounts } = hre
  const { deployer } = await getNamedAccounts()

  let contractJson

  const jsonPath = resolve(__dirname, '../cache/multicall.json')

  if (!existsSync(resolve(jsonPath, '../'))) mkdirSync(resolve(jsonPath, '../'))

  if (existsSync(jsonPath)) {
    console.log('Multicall JSON file found, using it...')
    contractJson = JSON.parse(await readFile(jsonPath, { encoding: 'utf8' }))
  } else {
    console.log('Downloading Multicall JSON file...')
    contractJson = await fetch(
      'https://github.com/mds1/multicall/releases/latest/download/Multicall3.json',
    ).then((res) => res.json())
    await writeFile(jsonPath, JSON.stringify(contractJson))
    console.log('Wrote Multicall JSON file to', jsonPath)
  }

  await hre.deployments.deploy('Multicall', {
    from: deployer,
    contract: contractJson,
  })
}

func.id = 'multicall'

module.exports = func
