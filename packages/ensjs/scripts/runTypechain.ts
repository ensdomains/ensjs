import fs from 'fs'
import fsp from 'fs/promises'
import nModule from 'module'
import { glob, runTypeChain } from 'typechain'

const pnp = (nModule as any).findPnpApi('./')
const contracts = pnp.resolveToUnqualified('@ensdomains/ens-contracts', './')
const overrides = [
  'ETHRegistrarController',
  'NameWrapper',
  'PublicResolver',
  'ReverseRegistrar',
  'StaticMetadataService',
  'UniversalResolver',
]

async function main() {
  const cwd = process.cwd()

  if (!fs.existsSync('./cache/json-abis'))
    await fsp.mkdir('./cache/json-abis', { recursive: true })

  if (fs.existsSync('./src/generated'))
    await fsp.rm('./src/generated', { recursive: true, force: true })
  await fsp.mkdir('./src/generated')

  const overrideABIs = glob(cwd, [
    `${contracts}/artifacts/contracts/**/!(*.dbg).json`,
  ])

  const importABIs = glob(cwd, [
    `${contracts}/deployments/mainnet/**/+([a-zA-Z0-9_]).json`,
    './src/ABIs/Multicall.json',
  ])

  for (const name of overrides) {
    const find = (f: string) => f.endsWith(`/${name}.json`)
    const i = importABIs.findIndex(find)
    if (i !== -1) importABIs[i] = overrideABIs.find(find)
    else importABIs.push(overrideABIs.find(find))
  }

  const copiedABIs: string[] = []

  for (const file of importABIs) {
    const dest = `${cwd}/cache/json-abis/${file.split('/').pop()}`

    const content = await fsp.readFile(file, 'utf8')
    const obj = JSON.parse(content) as Record<string, any>
    obj.bytecode = '0x'
    obj.deployedBytecode = '0x'
    await fsp.writeFile(dest, JSON.stringify(obj))

    copiedABIs.push(dest)
  }

  await runTypeChain({
    cwd,
    filesToProcess: copiedABIs,
    allFiles: copiedABIs,
    outDir: './src/generated',
    target: 'ethers-v5',
  })
}

main()
  .catch(console.error)
  .finally(async () => {
    if (fs.existsSync('./cache/json-abis'))
      await fsp.rm('./cache/json-abis', { recursive: true, force: true })
  })
