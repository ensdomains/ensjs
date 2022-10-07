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

const createENS = (graphURI: string, useReal?: boolean) =>
  new ENS({
    graphURI,
    getContractAddress: useReal
      ? undefined
      : () => (contractName) =>
          deploymentAddresses[
            contractName === 'ENSRegistryWithFallback'
              ? 'ENSRegistry'
              : contractName
          ],
  })

export default async (useReal?: boolean) => {
  const { graphURI, providerURI, chainId } = useReal
    ? {
        graphURI:
          'https://api.thegraph.com/subgraphs/name/ensdomains/ensgoerli',
        providerURI: 'https://web3.ens.domains/v1/goerli',
        chainId: 5,
      }
    : {
        graphURI: 'http://localhost:8000/subgraphs/name/graphprotocol/ens',
        providerURI: 'http://localhost:8545',
        chainId: 1337,
      }
  const provider = new ethers.providers.StaticJsonRpcProvider(
    providerURI,
    chainId,
  )

  let ensInstance = createENS(graphURI, useReal)
  await ensInstance.setProvider(provider)

  if (useReal) {
    return { ensInstance, revert: () => {}, createSnapshot: () => {}, provider }
  }

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
