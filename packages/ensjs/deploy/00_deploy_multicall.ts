import { existsSync, mkdirSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { ArtifactData, DeployFunction } from 'hardhat-deploy/dist/types.js'

const func: DeployFunction = async (hre) => {
  const { getNamedAccounts } = hre
  const { deployer } = await getNamedAccounts()

  let contractJson: ArtifactData

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

export default func
