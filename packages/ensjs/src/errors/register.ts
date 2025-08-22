import type { Address } from 'viem'
import { EMPTY_ADDRESS } from '../utils/consts.js'
import { BaseError } from './base.js'

export class LegacyRegistrationInvalidConfigError extends BaseError {
  override name = 'LegacyRegistrationInvalidConfigError'

  constructor({
    resolverAddress,
    address,
  }: {
    resolverAddress?: Address
    address?: Address
  }) {
    super('Resolver address is required when setting an address', {
      metaMessages: [
        `- resolverAddress: ${resolverAddress || EMPTY_ADDRESS}`,
        `- addr: ${address || EMPTY_ADDRESS}`,
      ],
    })
  }
}
