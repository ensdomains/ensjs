import { gql } from 'graphql-request'
import { Address, getAddress, labelhash } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { checkIsDotEth } from '../../utils/validation'
import { createSubgraphClient } from './client'

export type GetSubgraphRegistrantParameters = {
  name: string
}

export type GetSubgraphRegistrantReturnType = Address | null

const query = gql`
  query getSubgraphRegistrant($id: String!) {
    registration(id: $id) {
      registrant {
        id
      }
    }
  }
`

type SubgraphResult = {
  registration?: {
    registrant: {
      id: Address
    }
  }
}

const getSubgraphRegistrant = async (
  client: ClientWithEns,
  { name }: GetSubgraphRegistrantParameters,
): Promise<GetSubgraphRegistrantReturnType> => {
  const labels = name.split('.')
  if (!checkIsDotEth(labels))
    throw new Error('Registrant can only be fetched for 2ld .eth names')

  const subgraphClient = createSubgraphClient({ client })

  const result = await subgraphClient.request<SubgraphResult>(query, {
    id: labelhash(labels[0]),
  })

  if (result?.registration?.registrant?.id)
    return getAddress(result.registration.registrant.id)
  return null
}

export default getSubgraphRegistrant
