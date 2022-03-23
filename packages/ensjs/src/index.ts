import { ethers } from 'ethers'
import ContractManager from './contracts'
import type getName from './getName'
import type getProfile from './getProfile'
import type getResolver from './getResolver'
import GqlManager from './GqlManager'
import type setName from './setName'

type ENSOptions = {
  graphURI?: string | null
}

export type InternalENS = {
  options?: ENSOptions
  provider?: ethers.providers.Provider
  graphURI?: string | null
} & ENS

type BoundFn<F> = F extends (this: InternalENS, ...args: infer P) => infer R
  ? (...args: P) => R
  : never

const graphURIEndpoints: Record<string, string> = {
  1: 'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
  3: 'https://api.thegraph.com/subgraphs/name/ensdomains/ensropsten',
  4: 'https://api.thegraph.com/subgraphs/name/ensdomains/ensrinkeby',
  5: 'https://api.thegraph.com/subgraphs/name/ensdomains/ensgoerli',
}

export class ENS {
  protected options?: ENSOptions
  protected provider?: ethers.providers.JsonRpcProvider
  protected graphURI?: string | null
  contracts?: ContractManager
  gqlInstance = new GqlManager()

  constructor(options?: ENSOptions) {
    this.options = options
  }

  private generateFunction =
    (path: string, exportName = 'default') =>
    async (...args: any[]) =>
      (await import(path))[exportName].bind(this)(...args)

  public setProvider = async (provider: ethers.providers.JsonRpcProvider) => {
    this.provider = provider
    if (this.options && this.options.graphURI) {
      this.graphURI = this.options.graphURI
    } else {
      this.graphURI =
        graphURIEndpoints[(await this.provider.getNetwork()).chainId]
    }
    await this.gqlInstance.setUrl(this.graphURI)
    this.contracts = new ContractManager(this.provider)
    return
  }

  public getProfile: BoundFn<typeof getProfile> =
    this.generateFunction('./getProfile')
  public getName: BoundFn<typeof getName> = this.generateFunction('./getName')
  public getResolver: BoundFn<typeof getResolver> =
    this.generateFunction('./getResolver')
  public setName: BoundFn<typeof setName> = this.generateFunction('./setName')
}
