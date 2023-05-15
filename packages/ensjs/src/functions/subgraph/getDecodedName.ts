import { gql } from 'graphql-request'
import { ClientWithEns } from '../../contracts/addContracts'
import {
  checkIsDecrypted,
  decodeLabelhash,
  isEncodedLabelhash,
} from '../../utils/labels'
import { namehash } from '../../utils/normalise'
import { createSubgraphClient } from './client'

export type GetDecodedNameParameters = {
  name: string
  allowIncomplete?: boolean
}

export type GetDecodedNameReturnType = string | null

type SubgraphResult = {
  namehashLookup?: { name: string }
} & {
  [key: `labels${number}`]: [{ labelName: string }] | []
}

const getDecodedName = async (
  client: ClientWithEns,
  { name, allowIncomplete }: GetDecodedNameParameters,
): Promise<GetDecodedNameReturnType> => {
  if (checkIsDecrypted(name)) return name
  // try to fetch the name from an existing Domain entity
  // also try to fetch the label names from any Domain entities that have a corresponding labelhash
  const labels = name.split('.')

  const subgraphClient = createSubgraphClient({ client })

  let labelsQuery = ''
  for (let i = 0; i < labels.length; i += 1) {
    const label = labels[i]
    if (isEncodedLabelhash(label)) {
      labelsQuery += gql`
        labels${i}: domains(first: 1, where: { labelhash: "${decodeLabelhash(
        label,
      ).toLowerCase()}", labelName_not: null }) {
          labelName
        }
      `
    }
  }

  const decodedNameQuery = gql`
    query decodedName($id: String!) {
      namehashLookup: domain(id: $id) {
        name
      }
      ${labelsQuery}
    }
  `

  const decodedNameResult = await subgraphClient.request<SubgraphResult>(
    decodedNameQuery,
    {
      id: namehash(name),
    },
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
        attemptedDecodedLabels[parseInt(key.replace('labels', ''))] =
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
