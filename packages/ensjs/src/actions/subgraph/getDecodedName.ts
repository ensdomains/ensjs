import { namehash } from 'viem/ens'
import type { ChainWithSubgraph } from '../../clients/l1.js'
import {
  checkIsDecrypted,
  decodeLabelhash,
  isEncodedLabelhash,
} from '../../utils/name/labels.js'
import { createSubgraphClient } from './client.js'
import { gql } from './gql.js'

export type GetDecodedNameParameters = {
  /** Name with unknown labels */
  name: string
  /** Allow a name with unknown labels to be returned */
  allowIncomplete?: boolean
}

export type GetDecodedNameReturnType = string | null

export type GetDecodedNameErrorType = Error

type SubgraphResult = {
  namehashLookup?: { name: string }
} & {
  [key: `labels${number}`]: [{ labelName: string }] | []
}

/**
 * Gets the full name for a name with unknown labels from the subgraph.
 * @param client - {@link ClientWithEns}
 * @param parameters - {@link GetDecodedNameParameters}
 * @returns Full name, or null if name was could not be filled. {@link GetDecodedNameReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getDecodedName } from '@ensdomains/ensjs/subgraph'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getDecodedName(client, { name: '[5cee339e13375638553bdf5a6e36ba80fb9f6a4f0783680884d92b558aa471da].eth' })
 * // ens.eth
 */
const getDecodedName = async (
  client: { chain: ChainWithSubgraph },
  { name, allowIncomplete }: GetDecodedNameParameters,
): Promise<GetDecodedNameReturnType> => {
  if (checkIsDecrypted(name)) return name
  // try to fetch the name from an existing Domain entity
  // also try to fetch the label names from any Domain entities that have a corresponding labelhash
  const labels = name.split('.')

  const subgraphClient = createSubgraphClient(client)

  // labelhash values are passed as GraphQL variables, never interpolated
  // into the query string, so a crafted label can't inject additional
  // query syntax
  const variables: Record<string, unknown> = { id: namehash(name) }
  let labelsQuery = ''
  let labelsQueryVariables = ''
  for (let i = 0; i < labels.length; i += 1) {
    const label = labels[i]
    if (isEncodedLabelhash(label)) {
      const variableName = `labelhash${i}`
      variables[variableName] = decodeLabelhash(label).toLowerCase()
      labelsQueryVariables += `, $${variableName}: Bytes`
      labelsQuery += gql`
        labels${i}: domains(first: 1, where: { labelhash: $${variableName}, labelName_not: null }) {
          labelName
        }
      `
    }
  }

  const decodedNameQuery = gql`
    query decodedName($id: String!${labelsQueryVariables}) {
      namehashLookup: domain(id: $id) {
        name
      }
      ${labelsQuery}
    }
  `

  const decodedNameResult = await subgraphClient.request<SubgraphResult>(
    decodedNameQuery,
    variables,
  )
  if (!decodedNameResult) return null

  const attemptedDecodedLabels = [...labels]

  const {
    namehashLookup: { name: namehashLookupResult } = { name: undefined },
    ...labelResults
  } = decodedNameResult
  if (namehashLookupResult) {
    const namehashLookupLabels = namehashLookupResult.split('.')
    for (let i = 0; i < namehashLookupLabels.length; i += 1) {
      const label = namehashLookupLabels[i]
      if (!isEncodedLabelhash(label)) {
        attemptedDecodedLabels[i] = label
      }
    }
    const joinedResult = attemptedDecodedLabels.join('.')
    if (checkIsDecrypted(joinedResult)) return joinedResult
  }

  if (Object.keys(labelResults).length !== 0) {
    for (const [key, value] of Object.entries(labelResults)) {
      if (value.length && value[0].labelName) {
        attemptedDecodedLabels[Number.parseInt(key.replace('labels', ''))] =
          value[0].labelName
      }
    }
  }

  const joinedResult = attemptedDecodedLabels.join('.')
  if (checkIsDecrypted(joinedResult) || allowIncomplete) return joinedResult

  // name is not decrypted
  return null
}

export default getDecodedName
