import { gql } from 'graphql-request'
import { Address, getAddress, labelhash } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { UnsupportedNameTypeError } from '../../errors/general'
import { getNameType } from '../../utils/getNameType'
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
  const nameType = getNameType(name)
  if (nameType !== 'eth-2ld')
    throw new UnsupportedNameTypeError({
      nameType,
      supportedNameTypes: ['eth-2ld'],
      details: 'Registrant can only be fetched for eth-2ld names',
    })

  const subgraphClient = createSubgraphClient({ client })

  const result = await subgraphClient.request<SubgraphResult>(query, {
    id: labelhash(labels[0]),
  })

  if (result?.registration?.registrant?.id)
    return getAddress(result.registration.registrant.id)
  return null
}

export default getSubgraphRegistrant
