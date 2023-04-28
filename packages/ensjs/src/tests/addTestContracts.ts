import { config } from 'dotenv'
import { resolve } from 'path'
import { Address, PublicClient, createPublicClient, http } from 'viem'
import { localhost as _localhost } from 'viem/chains'
import { ContractName } from '../contracts/types'

config({
  path: resolve(__dirname, '../../.env.local'),
  override: true,
})

export const deploymentAddresses = JSON.parse(
  process.env.DEPLOYMENT_ADDRESSES!,
) as Record<
  ContractName | 'ENSRegistry' | 'LegacyPublicResolver' | 'NoMulticallResolver',
  Address
>

export const localhost = {
  ..._localhost,
  contracts: {
    ensRegistry: {
      address: deploymentAddresses.ENSRegistry,
    },
    ensUniversalResolver: {
      address: deploymentAddresses.UniversalResolver,
    },
    multicall3: {
      address: deploymentAddresses.Multicall,
    },
    ensBaseRegistrarImplementation: {
      address: deploymentAddresses.BaseRegistrarImplementation,
    },
    ensDnsRegistrar: {
      address: deploymentAddresses.DNSRegistrar,
    },
    ensEthRegistrarController: {
      address: deploymentAddresses.ETHRegistrarController,
    },
    ensNameWrapper: {
      address: deploymentAddresses.NameWrapper,
    },
    ensPublicResolver: {
      address: deploymentAddresses.PublicResolver,
    },
    ensReverseRegistrar: {
      address: deploymentAddresses.ReverseRegistrar,
    },
    ensBulkRenewal: {
      address: deploymentAddresses.BulkRenewal,
    },
  },
} as const

const transport = http('http://localhost:8545')

export const testClient: PublicClient<
  typeof transport,
  typeof localhost,
  true
> = createPublicClient({
  chain: localhost,
  transport,
})
