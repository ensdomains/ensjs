import { ENSArgs } from '..'
import { truncateFormat } from '../utils/format'
import { decryptName } from '../utils/labels'
import { namehash } from '../utils/normalise'

type Subname = {
  id: string
  labelName: string | null
  truncatedName?: string
  labelhash: string
  isMigrated: boolean
  name: string
  owner: {
    id: string
  }
}

type Params = {
  name: string
  page?: number
  pageSize?: number
  orderDirection?: 'asc' | 'desc'
  orderBy?: 'createdAt' | 'labelName'
  lastSubnames?: Array<any>
  isLargeQuery?: boolean
}

const largeQuery = async (
  { gqlInstance }: ENSArgs<'gqlInstance'>,
  { name, pageSize = 10, orderDirection, orderBy, lastSubnames = [] }: Params,
) => {
  const { client } = gqlInstance

  const finalQuery = gqlInstance.gql`
    query getSubnames(
      $id: ID! 
      $first: Int
      $lastCreatedAt: BigInt
      $orderBy: Domain_orderBy 
      $orderDirection: OrderDirection
    ) {
      domain(
        id: $id
      ) {
        subdomainCount
        subdomains(
          first: $first
          orderBy: $orderBy
          orderDirection: $orderDirection
          where: { createdAt_lt: $lastCreatedAt }
        ) {
          id
          labelName
          labelhash
          isMigrated
          name
          subdomainCount
          createdAt
          owner {
            id
          }
        }
      }
    }
  `
  const queryVars = {
    id: namehash(name),
    first: pageSize,
    lastCreatedAt: lastSubnames[lastSubnames.length - 1]?.createdAt,
    orderBy,
    orderDirection,
  }
  const { domain } = await client.request(finalQuery, queryVars)
  const subdomains = domain.subdomains.map((subname: any) => {
    const decrypted = decryptName(subname.name)
    console.log(subname, decrypted);
    

    return {
      ...subname,
      name: decrypted,
      truncatedName: truncateFormat(decrypted),
    }
  })

  return {
    subnames: subdomains,
    subnameCount: domain.subdomainCount,
  }
}

const getSubnames = (
  injected: ENSArgs<'gqlInstance'>,
  functionArgs: Params,
): Promise<{ subnames: Subname[]; subnameCount: number }> => {  
    return largeQuery(injected, functionArgs) 
}

export default getSubnames
