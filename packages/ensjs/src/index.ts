import { ethers } from 'ethers'
import contractManager from './contracts'
import gqlManager from './gqlManager'

type ENSOptions = {
  graphURI?: string | null
}

const generateFunction = (
  provider: ethers.providers.Provider,
  client: any | null,
  contracts: any,
  path: string,
  exportName = 'default',
) => {
  let imported: any
  return async (...args: any[]) => {
    if (imported) {
      return imported(provider, client, contracts, ...args)
    } else {
      imported = (await import(path))[exportName]
      return imported(provider, client, contracts, ...args)
    }
  }
}

export const ENS = async (
  provider: ethers.providers.Provider,
  options?: ENSOptions,
) => {
  let _provider = provider
  const graphURI =
    options && options.graphURI
      ? options.graphURI
      : 'http://localhost:8000/subgraphs/name/graphprotocol/ens'
  const gqlInstance = await gqlManager(graphURI)
  let contracts = contractManager(_provider)

  return {
    getProfile: generateFunction(
      _provider,
      gqlInstance,
      contracts,
      './getProfile',
      'default',
    ),
    setProvider: (provider: ethers.providers.Provider) => {
      _provider = provider
      contracts = contractManager(_provider)
      return
    },
  }
}
