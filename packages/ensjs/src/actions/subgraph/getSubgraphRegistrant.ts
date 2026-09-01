import { type Address, getAddress, namehash } from 'viem'
import type { ChainWithSubgraph } from '../../clients/l1.js'
import { UnsupportedNameTypeError } from '../../errors/general.js'
import { getNameType } from '../../utils/name/getNameType.js'
import { createSubgraphClient } from './client.js'
import { gql } from './gql.js'

export type GetSubgraphRegistrantParameters = {
  /** Name to get registrant for */
  name: string
}

export type GetSubgraphRegistrantReturnType = Address | null

export type GetSubgraphRegistrantErrorType = UnsupportedNameTypeError | Error

const query = gql`
  query getSubgraphRegistrant($id: String!) {
    domain(id: $id) {
      registration {
        registrant {
          id
        }
      }
    }
  }
`

type SubgraphResult = {
  domain?: {
    registration?: {
      registrant: {
        id: Address
      }
    }
  }
}

/**
 * Gets the name registrant from the subgraph.
 * @param client - {@link ClientWithEns}
 * @param parameters - {@link GetSubgraphRegistrantParameters}
 * @returns Registrant address, or null if name was not found. {@link GetSubgraphRegistrantReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getSubgraphRegistrant } from '@ensdomains/ensjs/subgraph'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getSubgraphRegistrant(client, { name: 'ens.eth' })
 * // 0xb6E040C9ECAaE172a89bD561c5F73e1C48d28cd9
 */
const getSubgraphRegistrant = async <_chain extends ChainWithSubgraph>(
  client: { chain: _chain },
  { name }: GetSubgraphRegistrantParameters,
): Promise<GetSubgraphRegistrantReturnType> => {
  const nameType = getNameType(name)
  if (nameType !== 'eth-2ld')
    throw new UnsupportedNameTypeError({
      nameType,
      supportedNameTypes: ['eth-2ld'],
      details: 'Registrant can only be fetched for eth-2ld names',
    })

  const subgraphClient = createSubgraphClient(client)

  const result = await subgraphClient.request<SubgraphResult>(query, {
    id: namehash(name),
  })

  if (result?.domain?.registration?.registrant?.id)
    return getAddress(result.domain.registration.registrant.id)
  return null
}

export default getSubgraphRegistrant
