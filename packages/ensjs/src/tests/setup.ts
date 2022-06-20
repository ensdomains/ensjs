import { ethers } from 'ethers'
import { ENS } from '../'
import { ContractName, SupportedNetworkId } from '../contracts/types'

const addresses = {
  BaseRegistrarImplementation: '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85',
  Multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',
  NameWrapper: '0xD7D9C568Bc4C2343ab286096e1F851D33eEf49Af',
  PublicResolver: '0x3bAa5F3ea7bFCC8948c4140f233d72c11eBF0bdB',
  ENSRegistryWithFallback: '0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e',
  ReverseRegistrar: '0x4696E2f7D9f4CA187155ff50D93C00172181ddd5',
  UniversalResolver: '0xAbCd01ddDa102B0C32e8C5a371D7480dFA559DC3',
}

const createENS = (graphURI: string) =>
  new ENS({
    graphURI,
    getContractAddress:
      (_: SupportedNetworkId) => (contractName: ContractName) =>
        addresses[contractName],
  })

export default async (useReal?: boolean) => {
  const graphURI = useReal
    ? 'https://api.thegraph.com/subgraphs/name/ensdomains/ensropsten'
    : 'http://localhost:8000/subgraphs/name/graphprotocol/ens'

  const provider = new ethers.providers.JsonRpcProvider(
    'http://localhost:8545',
    'ropsten',
  )

  let ENSInstance = createENS(graphURI)
  await ENSInstance.setProvider(provider)

  let snapshot = await provider.send('evm_snapshot', [])

  const revert = async (customSnapshot?: any) => {
    const snapshotToUse = customSnapshot || snapshot
    await provider.send('evm_revert', [snapshotToUse])
    if (parseInt(snapshot, 16) >= parseInt(snapshotToUse, 16)) {
      snapshot = await provider.send('evm_snapshot', [])
    }

    ENSInstance = createENS(graphURI)
    await ENSInstance.setProvider(provider)
    return
  }

  const createSnapshot = async () => await provider.send('evm_snapshot', [])

  return { ENSInstance, revert, createSnapshot, provider }
}
