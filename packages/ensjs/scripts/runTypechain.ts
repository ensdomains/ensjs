import nModule from 'module'
import { glob, runTypeChain } from 'typechain'

const pnp = (nModule as any).findPnpApi('./')
const contracts = pnp.resolveToUnqualified('@ensdomains/ens-contracts', './')

async function main() {
  const cwd = process.cwd()
  const importABIs = glob(cwd, [
    `${contracts}/deployments/mainnet/**/+([a-zA-Z0-9_]).json`,
  ])
  const customABIs = glob(cwd, ['./src/ABIs/**/*.json'])

  await runTypeChain({
    cwd,
    filesToProcess: importABIs,
    allFiles: importABIs,
    outDir: './src/generated',
    target: 'ethers-v5',
  })
  await runTypeChain({
    cwd,
    filesToProcess: customABIs,
    allFiles: customABIs,
    outDir: './src/generated',
    target: 'ethers-v5',
  })
}

main().catch(console.error)
