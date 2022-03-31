import { ethers } from 'ethers'
import type { batch, _batch } from './batch'
import type {
  resolverMulticallWrapper,
  universalWrapper,
} from './batchWrappers'
import type burnFuses from './burnFuses'
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
import type {
  getAddr,
  getContentHash,
  getText,
  _getAddr,
  _getContentHash,
  _getText,
} from './getSpecificRecord'
import GqlManager from './GqlManager'
import type setName from './setName'
import type setRecords from './setRecords'
import type setResolver from './setResolver'
import type transferName from './transferName'
import singleCall from './utils/singleCall'
import type wrapName from './wrapName'

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

type OmitFirstTwoArgs<F> = F extends (
  x: any,
  y: any,
  ...args: infer P
) => infer R
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

export type RawFunction = {
  raw: (...args: any[]) => Promise<{ to: string; data: string }>
  decode: (...args: any[]) => Promise<any>
}

interface GeneratedRawFunction<F extends RawFunction>
  extends Function,
    RawFunction {
  (...args: Parameters<OmitFirstArg<F['raw']>>): ReturnType<
    OmitFirstTwoArgs<F['decode']>
  >
}

export interface GenericGeneratedRawFunction extends Function, RawFunction {}

export class ENS {
  [x: string]: any
  protected options?: ENSOptions
  protected provider?: ethers.providers.JsonRpcProvider
  protected graphURI?: string | null
  contracts?: ContractManager
  gqlInstance = new GqlManager()

  constructor(options?: ENSOptions) {
    this.options = options
  }

  private forwardDependenciesFromArray = <F>(dependencies: FunctionDeps<F>) =>
    Object.fromEntries(
      dependencies.map((dep) => [dep, this[dep as keyof InternalENS]]),
    )

  private importGenerator =
    <F>(
      path: string,
      dependencies: FunctionDeps<F>,
      exportName = 'default',
      subFunc?: 'raw' | 'decode',
    ) =>
    (...args: any[]) =>
      import(path).then((mod) =>
        (subFunc ? mod[exportName][subFunc] : mod[exportName])(
          this.forwardDependenciesFromArray<F>(dependencies),
          ...args,
        ),
      )

  private generateFunction = <F>(
    path: string,
    dependencies: FunctionDeps<F>,
    exportName = 'default',
  ): OmitFirstArg<F> =>
    this.importGenerator<F>(path, dependencies, exportName) as OmitFirstArg<F>

  private generateRawFunction = <F extends RawFunction>(
    path: string,
    dependencies: FunctionDeps<F['raw']> | FunctionDeps<F['decode']>,
    exportName = 'default',
  ): GeneratedRawFunction<F> => {
    const thisRef = this
    const mainFunc = async function (...args: any[]) {
      const mod = await import(path)
      return await singleCall(
        thisRef.provider!,
        thisRef.forwardDependenciesFromArray<
          FunctionDeps<F['raw']> | FunctionDeps<F['decode']>
        >(dependencies),
        mod[exportName],
        ...args,
      )
    }
    mainFunc.raw = this.importGenerator<F['raw']>(
      path,
      dependencies,
      exportName,
      'raw',
    )
    mainFunc.decode = this.importGenerator<F['decode']>(
      path,
      dependencies,
      exportName,
      'decode',
    ) as (data: any, ...args: any[]) => Promise<any>
    return mainFunc as unknown as GeneratedRawFunction<F>
  }

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

  public batch = this.generateFunction<typeof batch>(
    './batch',
    ['contracts'],
    'batch',
  )
  public _batch = this.generateFunction<typeof _batch>(
    './batch',
    ['contracts'],
    '_batch',
  )

  public getProfile = this.generateFunction<typeof getProfile>('./getProfile', [
    'contracts',
    'gqlInstance',
    'getName',
    'resolverMulticallWrapper',
    '_getAddr',
    '_getContentHash',
    '_getText',
  ])

  public getName = this.generateRawFunction<typeof getName>('./getName', [
    'contracts',
  ])

  public getResolver = this.generateRawFunction<typeof getResolver>(
    './getResolver',
    ['contracts'],
  )

  public getFuses = this.generateRawFunction<typeof getFuses>('./getFuses', [
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

  public getContentHash = this.generateRawFunction<typeof getContentHash>(
    './getSpecificRecord',
    ['contracts', 'universalWrapper'],
    'getContentHash',
  )

  public _getContentHash = this.generateRawFunction<typeof _getContentHash>(
    './getSpecificRecord',
    ['contracts'],
    '_getContentHash',
  )

  public getAddr = this.generateRawFunction<typeof getAddr>(
    './getSpecificRecord',
    ['contracts', 'universalWrapper'],
    'getAddr',
  )

  public _getAddr = this.generateRawFunction<typeof _getAddr>(
    './getSpecificRecord',
    ['contracts'],
    '_getAddr',
  )

  public getText = this.generateRawFunction<typeof getText>(
    './getSpecificRecord',
    ['contracts', 'universalWrapper'],
    'getText',
  )

  public _getText = this.generateRawFunction<typeof _getText>(
    './getSpecificRecord',
    ['contracts'],
    '_getText',
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

  public universalWrapper = this.generateRawFunction<typeof universalWrapper>(
    './batchWrappers',
    ['contracts'],
    'universalWrapper',
  )

  public resolverMulticallWrapper = this.generateRawFunction<
    typeof resolverMulticallWrapper
  >('./batchWrappers', ['contracts'], 'resolverMulticallWrapper')

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
    './setResolver',
    ['contracts', 'provider'],
  )

  public transferName = this.generateFunction<typeof transferName>(
    './transferName',
    ['contracts', 'provider'],
  )

  public wrapName = this.generateFunction<typeof wrapName>('./wrapName', [
    'contracts',
    'provider',
  ])

  public burnFuses = this.generateFunction<typeof burnFuses>('./burnFuses', [
    'contracts',
  ])
}
