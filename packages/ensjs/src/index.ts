import { ethers } from 'ethers'
import ContractManager from './contracts'
import GqlManager from './GqlManager'

type ENSOptions = {
  graphURI?: string | null
}

const graphURIEndpoints: Record<string, string> = {
  1: 'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
  3: 'https://api.thegraph.com/subgraphs/name/ensdomains/ensropsten',
  4: 'https://api.thegraph.com/subgraphs/name/ensdomains/ensrinkeby',
  5: 'https://api.thegraph.com/subgraphs/name/ensdomains/ensgoerli',
}

export class ENS {
  private options?: ENSOptions
  private provider?: ethers.providers.Provider
  private graphURI?: string | null
  contracts?: any
  gqlInstance = new GqlManager()

  constructor(options?: ENSOptions) {
    this.options = options
  }

  private generateFunction = (path: string, exportName = 'default') => {
    let imported: any
    return async (...args: any[]) => {
      if (!imported) {
        imported = (await import(path))[exportName]
      }
      return imported(
        {
          provider: this.provider,
          gqlInstance: this.gqlInstance,
          contracts: this.contracts,
        },
        ...args,
      )
    }
  }

  public setProvider = async (provider: ethers.providers.Provider) => {
    this.provider = provider
    if (this.options && this.options.graphURI) {
      this.graphURI = this.options.graphURI
    } else {
      this.graphURI =
        graphURIEndpoints[(await this.provider.getNetwork()).chainId]
    }
    await this.gqlInstance.setUrl(this.graphURI)
    this.contracts = new ContractManager(this.provider)
    this.getProfile = this.generateFunction('./getProfile')
    return
  }

  public getProfile: any
}
