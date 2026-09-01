import { BaseError } from './base.js'

export class InvalidFilterKeyError extends BaseError {
  filterKey: string

  supportedFilterKeys: readonly string[]

  override name = 'InvalidFilterKeyError'

  constructor({
    filterKey,
    supportedFilterKeys,
  }: {
    filterKey: string
    supportedFilterKeys: readonly string[]
  }) {
    super(`Invalid filter key: ${filterKey}`, {
      metaMessages: [
        `- Supported filter keys: ${supportedFilterKeys.join(', ')}`,
      ],
    })
    this.filterKey = filterKey
    this.supportedFilterKeys = supportedFilterKeys
  }
}

export class FilterKeyRequiredError extends BaseError {
  supportedFilterKeys: readonly string[]

  override name = 'FilterKeyRequiredError'

  constructor({
    supportedFilterKeys,
    details,
  }: {
    supportedFilterKeys: readonly string[]
    details?: string
  }) {
    super('At least one filter key is required', {
      metaMessages: [
        `- Supported filter keys: ${supportedFilterKeys.join(', ')}`,
      ],
      details,
    })
    this.supportedFilterKeys = supportedFilterKeys
  }
}

export class InvalidOrderByError extends BaseError {
  orderBy: string

  supportedOrderBys: string[]

  override name = 'InvalidOrderByError'

  constructor({
    orderBy,
    supportedOrderBys,
  }: {
    orderBy: string
    supportedOrderBys: string[]
  }) {
    super(`Invalid orderBy: ${orderBy}`, {
      metaMessages: [
        `- Supported orderBy keys: ${supportedOrderBys.join(', ')}`,
      ],
    })
    this.orderBy = orderBy
    this.supportedOrderBys = supportedOrderBys
  }
}

export type SubgraphGraphQLError = {
  message: string
  locations?: { line: number; column: number }[]
  path?: (string | number)[]
  extensions?: Record<string, unknown>
}

export class SubgraphRequestError extends BaseError {
  status: number

  errors: SubgraphGraphQLError[]

  override name = 'SubgraphRequestError'

  constructor({
    status,
    errors = [],
    details,
  }: {
    status: number
    errors?: SubgraphGraphQLError[]
    details?: string
  }) {
    super(
      errors.length
        ? 'Subgraph query returned errors'
        : `Subgraph request failed with status ${status}`,
      {
        metaMessages: errors.length
          ? errors.map(({ message, path }) =>
              path?.length ? `- ${path.join('.')}: ${message}` : `- ${message}`,
            )
          : undefined,
        details,
      },
    )
    this.status = status
    this.errors = errors
  }
}
