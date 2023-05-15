import { gql } from 'graphql-request'
import { Address, Hex, getAddress } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { DateWithValue } from '../../types'
import { GRACE_PERIOD_SECONDS } from '../../utils/consts'
import { truncateFormat } from '../../utils/format'
import { AllCurrentFuses, decodeFuses } from '../../utils/fuses'
import { decryptName } from '../../utils/labels'
import { createSubgraphClient } from './client'

type GetNamesForAddressOrderBy =
  | 'expiryDate'
  | 'name'
  | 'labelName'
  | 'createdAt'

type GetNamesForAddressRelation = {
  registrant?: boolean
  owner?: boolean
  wrappedOwner?: boolean
  resolvedAddress?: boolean
}

type GetNamesForAddressFilter = GetNamesForAddressRelation & {
  allowExpired?: boolean
  allowReverseRecord?: boolean
}

export type GetNamesForAddressParameters = {
  address: Address

  filter?: GetNamesForAddressFilter
  orderBy?: GetNamesForAddressOrderBy
  orderDirection?: 'asc' | 'desc'

  previousPage?: Name[]
  pageSize?: number
}

export type Name = {
  id: Hex
  name: string
  truncatedName?: string
  labelName: string | null
  labelhash: Hex
  isMigrated: boolean
  parentName: string | null
  createdAt: DateWithValue<number>
  registrationDate?: DateWithValue<number>
  expiryDate?: DateWithValue<number>
  fuses?: AllCurrentFuses
  owner: Address
  registrant?: Address
  wrappedOwner?: Address
  resolvedAddress?: Address
  relation: GetNamesForAddressRelation
}

const domainDetailsFragment = gql`
  fragment DomainDetails on Domain {
    id
    labelName
    labelhash
    name
    isMigrated
    parent {
      name
    }
    createdAt
    resolvedAddress {
      id
    }
    owner {
      id
    }
    registrant {
      id
    }
    wrappedOwner {
      id
    }
  }
`

type SubgraphDomainFragment = {
  id: Hex
  labelName: string | null
  labelhash: Hex
  name: string
  isMigrated: boolean
  parent?: {
    name: string
  }
  createdAt: string
  resolvedAddress?: {
    id: Address
  }
  owner: {
    id: Address
  }
  registrant?: {
    id: Address
  }
  wrappedOwner?: {
    id: Address
  }
}

const registrationDetailsFragment = gql`
  fragment RegistrationDetails on Registration {
    registrationDate
    expiryDate
  }
`

type SubgraphRegistrationFragment = {
  registrationDate: string
  expiryDate: string
}

const wrappedDomainDetailsFragment = gql`
  fragment WrappedDomainDetails on WrappedDomain {
    expiryDate
    fuses
  }
`

type SubgraphWrappedDomainFragment = {
  expiryDate: string
  fuses: string
}

type SubgraphDomain = SubgraphDomainFragment & {
  registration?: SubgraphRegistrationFragment
  wrappedDomain?: SubgraphWrappedDomainFragment
}

type SubgraphResult = {
  domains: SubgraphDomain[]
}

const getChecksumAddressOrNull = (
  address: string | undefined,
): Address | null => (address ? getAddress(address) : null)

const getNamesForAddress = async (
  client: ClientWithEns,
  {
    address,
    filter = {
      owner: true,
      registrant: true,
      resolvedAddress: true,
      wrappedOwner: true,
      allowExpired: false,
      allowReverseRecord: false,
    },
    orderBy = 'name',
    orderDirection = 'asc',
    pageSize = 100,
    previousPage,
  }: GetNamesForAddressParameters,
): Promise<Name[]> => {
  const subgraphClient = createSubgraphClient({ client })

  let ownerWhereFilter = `
    or: [
  `
  let hasFilterApplied = false
  const { allowExpired, allowReverseRecord, ...filters } = filter
  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      hasFilterApplied = true
      switch (key) {
        case 'owner': {
          ownerWhereFilter += `
            { owner: $address }
          `
          break
        }
        case 'registrant': {
          ownerWhereFilter += `
            { registrant: $address }
          `
          break
        }
        case 'wrappedOwner': {
          ownerWhereFilter += `
            { wrappedOwner: $address }
          `
          break
        }
        case 'resolvedAddress': {
          ownerWhereFilter += `
            { resolvedAddress: $address }
          `
          break
        }
        default:
          throw new Error(`Invalid filter key: ${key}`)
      }
    }
  }

  if (!hasFilterApplied)
    throw new Error('At least one ownership filter must be enabled')

  ownerWhereFilter += `
    ]
  `

  const whereFilters = [ownerWhereFilter]

  let orderByFilter = ''
  let orderByStringVar = ''

  if (previousPage && previousPage.length > 0) {
    const lastDomain = previousPage[previousPage.length - 1]
    const operator = orderDirection === 'asc' ? 'gt' : 'lt'
    switch (orderBy) {
      case 'expiryDate': {
        let lastExpiryDate = lastDomain.expiryDate?.value
          ? lastDomain.expiryDate.value / 1000
          : 0
        if (lastDomain.parentName === 'eth') {
          lastExpiryDate += GRACE_PERIOD_SECONDS
        }
        if (orderDirection === 'asc' && lastExpiryDate === 0) {
          orderByFilter = `
              {
                and: [
                  { expiryDate: null }
                  { id_${operator}: "${lastDomain.id}" }
                ]
              }
            `
        } else if (orderDirection === 'desc' && lastExpiryDate !== 0) {
          orderByFilter = `
            {
              expiryDate_${operator}: ${lastExpiryDate}
            }
          `
        } else {
          orderByFilter = `
            {
              or: [
                {
                  expiryDate_${operator}: ${lastExpiryDate}
                }
                { expiryDate: null }
              ]
            }
          `
        }
        break
      }
      case 'name': {
        orderByFilter = `
          {
            name_${operator}: $orderByStringVar
          }
        `
        orderByStringVar = lastDomain.name
        break
      }
      case 'labelName': {
        orderByFilter = `
          {
            labelName_${operator}: $orderByStringVar
          }
        `
        orderByStringVar = lastDomain.labelName ?? ''
        break
      }
      case 'createdAt': {
        orderByFilter = `
          {
            createdAt_${operator}: ${lastDomain.createdAt.value / 1000}
          }
        `
        break
      }
      default:
        throw new Error(`Invalid orderBy: ${orderBy}`)
    }
    whereFilters.push(orderByFilter)
  }

  if (!allowReverseRecord) {
    // Exclude domains with parent addr.reverse
    // namehash of addr.reverse = 0x91d1777781884d03a6757a803996e38de2a42967fb37eeaca72729271025a9e2
    whereFilters.push(`
      {
        parent_not: "0x91d1777781884d03a6757a803996e38de2a42967fb37eeaca72729271025a9e2"
      }
    `)
  }

  if (!allowExpired) {
    // Exclude domains that are expired
    // if expiryDate is null, there is no expiry on the domain (registration or wrapped)
    whereFilters.push(`
      {
        or: [
          { expiryDate_gt: $expiryDate }
          { expiryDate: null }
        ]
      }
    `)
  }

  const whereFilter =
    whereFilters.length > 1
      ? `
    and: [
      {
        ${whereFilters.shift()}
      }
      ${whereFilters.join('\n')}
    ]
  `
      : whereFilters[0]

  const query = gql`
      query getNamesForAddress(
        $address: String!
        $orderBy: Domain_orderBy
        $orderDirection: OrderDirection
        $first: Int
        $expiryDate: Int
        $orderByStringVar: String
      ) {
        domains(
          orderBy: $orderBy
          orderDirection: $orderDirection
          first: $first
          where: {
            ${whereFilter}
          }
        ) {
          ...DomainDetails
          registration {
            ...RegistrationDetails
          }
          wrappedDomain {
            ...WrappedDomainDetails
          }
        }
      }
      ${domainDetailsFragment}
      ${registrationDetailsFragment}
      ${wrappedDomainDetailsFragment}
    `

  const result = await subgraphClient.request<
    SubgraphResult,
    {
      address: string
      orderBy: string
      orderDirection: string
      first: number
      expiryDate: number
      orderByStringVar: string
    }
  >(query, {
    address: address.toLowerCase(),
    orderBy,
    orderDirection,
    first: pageSize,
    expiryDate: Math.floor(Date.now() / 1000),
    orderByStringVar,
  })

  if (!result) return []

  const names = result.domains.map((domain) => {
    const decrypted = domain.name ? decryptName(domain.name) : null
    const createdAt = parseInt(domain.createdAt) * 1000
    const registrationDate = domain.registration?.registrationDate
      ? parseInt(domain.registration?.registrationDate) * 1000
      : null
    const expiryDateRef =
      domain.registration?.expiryDate || domain.wrappedDomain?.expiryDate
    const expiryDate = expiryDateRef ? parseInt(expiryDateRef) * 1000 : null

    const relation: GetNamesForAddressRelation = {}

    if (domain.owner) {
      relation.owner = domain.owner.id === address.toLowerCase()
    }
    if (domain.registrant) {
      relation.registrant = domain.registrant.id === address.toLowerCase()
    }
    if (domain.wrappedOwner) {
      relation.wrappedOwner = domain.wrappedOwner.id === address.toLowerCase()
    }
    if (domain.resolvedAddress) {
      relation.resolvedAddress =
        domain.resolvedAddress.id === address.toLowerCase()
    }

    return {
      id: domain.id,
      name: decrypted,
      truncatedName: decrypted ? truncateFormat(decrypted) : null,
      labelName: domain.labelName,
      labelhash: domain.labelhash,
      isMigrated: domain.isMigrated,
      parentName: domain.parent?.name ?? null,
      createdAt: {
        date: new Date(createdAt),
        value: createdAt,
      },
      registrationDate: registrationDate
        ? {
            date: new Date(registrationDate),
            value: registrationDate,
          }
        : null,
      expiryDate: expiryDate
        ? {
            date: new Date(expiryDate),
            value: expiryDate,
          }
        : null,
      fuses: domain.wrappedDomain?.fuses
        ? decodeFuses(parseInt(domain.wrappedDomain.fuses))
        : null,
      owner: getAddress(domain.owner.id),
      registrant: getChecksumAddressOrNull(domain.registrant?.id),
      wrappedOwner: getChecksumAddressOrNull(domain.wrappedOwner?.id),
      resolvedAddress: getChecksumAddressOrNull(domain.resolvedAddress?.id),
      relation,
    } as Name
  })

  return names
}

export default getNamesForAddress
