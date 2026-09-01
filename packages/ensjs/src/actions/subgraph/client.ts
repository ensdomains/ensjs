import type { Kind, SelectionNode, SelectionSetNode } from 'graphql'
import { parse, print, visit } from 'graphql/language/index.js'
import { namehash } from 'viem/ens'
import type { ChainWithSubgraph } from '../../clients/l1.js'
import {
  type SubgraphGraphQLError,
  SubgraphRequestError,
} from '../../errors/subgraph.js'

export type SubgraphVariables = Record<string, unknown>

export type SubgraphClient = {
  /** Endpoint that queries are sent to */
  url: string
  /** Sends a query to the subgraph, returning the `data` payload */
  request: <TResult, TVariables extends SubgraphVariables = SubgraphVariables>(
    query: string,
    variables?: TVariables,
    requestHeaders?: HeadersInit,
  ) => Promise<TResult>
}

const generateSelection = (selection: string): SelectionNode => ({
  kind: 'Field' as Kind.FIELD,
  name: {
    kind: 'Name' as Kind.NAME,
    value: selection,
  },
  arguments: [],
  directives: [],
  alias: undefined,
  selectionSet: undefined,
})

const enter = (node: SelectionSetNode) => {
  let hasName = false
  let hasId = false

  for (const selection of node.selections) {
    if ('name' in selection) {
      if (selection.name.value === 'name') hasName = true
      else if (selection.name.value === 'id') hasId = true
    }
  }

  if (hasName && !hasId) {
    // eslint-disable-next-line no-param-reassign
    node.selections = [...node.selections, generateSelection('id')]
    return node
  }

  return undefined
}

/**
 * Adds `id` to any selection set that asks for `name` without it, so that
 * {@link hashInvalidNames} can check each returned name against its namehash.
 */
export const injectIdSelections = (query: string): string =>
  print(
    visit(parse(query), {
      SelectionSet: {
        enter,
      },
    }),
  )

/**
 * Replaces any `name` that doesn't hash to its own `id` with the namehash of
 * that name, flagging it as `invalidName`. Mutates the data in place.
 */
export const hashInvalidNames = (data: unknown) => {
  const traverse = (obj: Record<string, any>) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (Object.hasOwn(obj, key)) {
          const value = obj[key]

          if (value && typeof value === 'object') {
            traverse(value)
          }

          if (
            value instanceof Object &&
            'name' in value &&
            value.name &&
            typeof value.name === 'string'
          ) {
            // Name already in hashed form
            if (value.name.includes('[')) {
              // eslint-disable-next-line no-continue
              continue
            }

            let hashedName = '[Invalid ENS Name]'
            try {
              hashedName = namehash(value.name)
            } catch (_e) {
              obj[key] = { ...value, name: hashedName, invalidName: true }
            }

            if ('id' in value && value.id !== hashedName) {
              obj[key] = { ...value, name: hashedName, invalidName: true }
            }
          }
        }
      }
    }
  }

  traverse(data as Record<string, any>)
}

type SubgraphResponseBody<TResult> = {
  data?: TResult
  errors?: SubgraphGraphQLError[]
}

const executeRequest = async <
  TResult,
  TVariables extends SubgraphVariables = SubgraphVariables,
>(
  url: string,
  query: string,
  variables?: TVariables,
  requestHeaders?: HeadersInit,
): Promise<TResult> => {
  const headers = new Headers(requestHeaders)
  headers.set('Content-Type', 'application/json')
  headers.set('Accept', 'application/json')

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: injectIdSelections(query), variables }),
  })

  const text = await response.text()

  let body: SubgraphResponseBody<TResult>
  try {
    body = JSON.parse(text)
  } catch (_e) {
    throw new SubgraphRequestError({
      status: response.status,
      details: `Response was not valid JSON: ${text.slice(0, 512)}`,
    })
  }

  if (!response.ok || body.errors?.length)
    throw new SubgraphRequestError({
      status: response.status,
      errors: body.errors ?? [],
    })

  hashInvalidNames(body.data)

  return body.data as TResult
}

export const createSubgraphClient = <_chain extends ChainWithSubgraph>(client: {
  chain: _chain
}): SubgraphClient => {
  const { url } = client.chain.subgraphs.ens

  return {
    url,
    request: <
      TResult,
      TVariables extends SubgraphVariables = SubgraphVariables,
    >(
      query: string,
      variables?: TVariables,
      requestHeaders?: HeadersInit,
    ) =>
      executeRequest<TResult, TVariables>(
        url,
        query,
        variables,
        requestHeaders,
      ),
  }
}
