import type { Address } from 'viem'
import { BaseError } from './base.js'

export class CoinFormatterNotFoundError extends BaseError {
  coinType: string | number

  override name = 'CoinFormatterNotFoundError'

  constructor({ coinType }: { coinType: string | number }) {
    super(`Coin formatter not found for ${coinType}`)
    this.coinType = coinType
  }
}

export class FunctionNotBatchableError extends BaseError {
  functionIndex: number

  override name = 'FunctionNotBatchableError'

  constructor({ functionIndex }: { functionIndex: number }) {
    super(`Function at index ${functionIndex} is not batchable`)
    this.functionIndex = functionIndex
  }
}

export class NoRecordsSpecifiedError extends BaseError {
  override name = 'NoRecordsSpecifiedError'

  constructor() {
    super('No records specified')
  }
}

export class NameNotNormalisedError extends BaseError {
  override name = 'NameNotNormalisedError'

  address: Address
  resolvedName: string
  coinType: number

  constructor({
    address,
    resolvedName,
    coinType,
  }: { address: Address; resolvedName: string; coinType: number }) {
    super(`Name ${resolvedName} resolved from address is not normalised`, {
      metaMessages: [
        `- Resolved from address: ${address}`,
        `Resolved for coinType: ${coinType}`,
      ],
    })
    this.address = address
    this.resolvedName = resolvedName
    this.coinType = coinType
  }
}
