// eslint-disable-next-line import/no-extraneous-dependencies
import { config } from 'dotenv'
import { ethers } from 'ethers'
import { resolve } from 'path'
import { ENS } from '..'
import { ContractName } from '../contracts/types'

config({
  path: resolve(__dirname, '../../.env.local'),
  override: true,
})

export const deploymentAddresses = JSON.parse(
  process.env.DEPLOYMENT_ADDRESSES!,
) as Record<
  ContractName | 'ENSRegistry' | 'LegacyPublicResolver' | 'NoMulticallResolver',
  string
>

const createENS = (graphURI: string) =>
  new ENS({
    graphURI,
    getContractAddress: () => (contractName) =>
      deploymentAddresses[
        contractName === 'ENSRegistryWithFallback'
          ? 'ENSRegistry'
          : contractName
      ],
  })

export default async (useReal?: boolean) => {
  const graphURI = useReal
    ? 'https://api.thegraph.com/subgraphs/name/ensdomains/ensropsten'
    : 'http://localhost:8000/subgraphs/name/graphprotocol/ens'

  const provider = new ethers.providers.JsonRpcProvider(
    'http://localhost:8545',
    1337,
  )

  let ensInstance = createENS(graphURI)
  await ensInstance.setProvider(provider)

  let snapshot = await provider.send('evm_snapshot', [])

  const revert = async (customSnapshot?: any) => {
    const snapshotToUse = customSnapshot || snapshot
    await provider.send('evm_revert', [snapshotToUse])
    if (parseInt(snapshot, 16) >= parseInt(snapshotToUse, 16)) {
      snapshot = await provider.send('evm_snapshot', [])
    }

    ensInstance = createENS(graphURI)
    await ensInstance.setProvider(provider)
    return
  }

  const createSnapshot = async () => provider.send('evm_snapshot', [])

  return { ensInstance, revert, createSnapshot, provider }
}
