import { ethers } from 'ethers'
import ContractManager from './contracts'
import type getFuses from './getFuses'
import type {
  getHistory,
  getHistoryDetailForTransactionHash,
  getHistoryWithDetail,
} from './getHistory'
import type getName from './getName'
import type { getOwner } from './getOwner'
import type getProfile from './getProfile'
import type getResolver from './getResolver'
import type { getAddr, getContentHash, getText } from './getSpecificRecord'
import GqlManager from './GqlManager'
import type setName from './setName'
import type setRecords from './setRecords'
import type { setResolver, transfer } from './setters'

type ENSOptions = {
  graphURI?: string | null
}

export type InternalENS = {
  options?: ENSOptions
  provider?: ethers.providers.Provider
  graphURI?: string | null
} & ENS

export type ENSArgs<K extends keyof InternalENS> = {
  [P in K]: InternalENS[P]
}

type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R
  ? (...args: P) => R
  : never

type FirstArg<F> = F extends (x: infer A, ...args: any[]) => any ? A : never

type FunctionDeps<F> = Extract<keyof FirstArg<F>, string>[]

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

  private generateFunction = <F>(
    path: string,
    dependencies: FunctionDeps<F>,
    exportName = 'default',
  ): OmitFirstArg<F> =>
    ((...args: any[]) =>
      import(path).then((mod) =>
        mod[exportName](
          Object.fromEntries(
            dependencies.map((dep) => [dep, this[dep as keyof InternalENS]]),
          ),
          ...args,
        ),
      )) as OmitFirstArg<F>

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

  public getProfile = this.generateFunction<typeof getProfile>('./getProfile', [
    'contracts',
    'gqlInstance',
    'getName',
  ])

  public getName = this.generateFunction<typeof getName>('./getName', [
    'contracts',
  ])

  public getResolver = this.generateFunction<typeof getResolver>(
    './getResolver',
    ['contracts'],
  )

  public getFuses = this.generateFunction<typeof getFuses>('./getFuses', [
    'contracts',
  ])

  public getHistory = this.generateFunction<typeof getHistory>(
    './getHistory',
    ['gqlInstance'],
    'getHistory',
  )

  public getHistoryWithDetail = this.generateFunction<
    typeof getHistoryWithDetail
  >(
    './getHistory',
    ['contracts', 'gqlInstance', 'provider'],
    'getHistoryWithDetail',
  )

  public getHistoryDetailForTransactionHash = this.generateFunction<
    typeof getHistoryDetailForTransactionHash
  >(
    './getHistory',
    ['contracts', 'provider'],
    'getHistoryDetailForTransactionHash',
  )

  public getContentHash = this.generateFunction<typeof getContentHash>(
    './getSpecificRecord',
    ['contracts'],
    'getContentHash',
  )

  public getAddr = this.generateFunction<typeof getAddr>(
    './getSpecificRecord',
    ['contracts'],
    'getAddr',
  )

  public getText = this.generateFunction<typeof getText>(
    './getSpecificRecord',
    ['contracts'],
    'getText',
  )

  public _getOwner = this.generateFunction<typeof getOwner>(
    './getOwner',
    ['contracts'],
    '_getOwner',
  )

  public getOwner = this.generateFunction<typeof getOwner>(
    './getOwner',
    ['contracts'],
    'getOwner',
  )

  public setName = this.generateFunction<typeof setName>('./setName', [
    'contracts',
    'provider',
  ])

  public setRecords = this.generateFunction<typeof setRecords>('./setRecords', [
    'contracts',
    'provider',
    'getResolver',
  ])

  public setResolver = this.generateFunction<typeof setResolver>(
    './setters',
    ['contracts', 'provider'],
    'setResolver',
  )

  public transfer = this.generateFunction<typeof transfer>(
    './setters',
    ['contracts', 'provider'],
    'transfer',
  )
}
