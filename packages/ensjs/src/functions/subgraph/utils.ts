import { Address, Hex, getAddress } from 'viem'
import { DateWithValue } from '../../types'
import { truncateFormat } from '../../utils/format'
import { AllCurrentFuses, decodeFuses } from '../../utils/fuses'
import { decryptName } from '../../utils/labels'
import { SubgraphDomain } from './fragments'

export type Name = {
  id: Hex
  name: string | null
  truncatedName: string | null
  labelName: string | null
  labelhash: Hex
  isMigrated: boolean
  parentName: string | null
  createdAt: DateWithValue<number>
  registrationDate: DateWithValue<number> | null
  expiryDate: DateWithValue<number> | null
  fuses: AllCurrentFuses | null
  owner: Address
  registrant: Address | null
  wrappedOwner: Address | null
  resolvedAddress: Address | null
}

export const getChecksumAddressOrNull = (
  address: string | undefined,
): Address | null => (address ? getAddress(address) : null)

export const makeNameObject = (domain: SubgraphDomain): Name => {
  const decrypted = domain.name ? decryptName(domain.name) : null
  const createdAt = parseInt(domain.createdAt) * 1000
  const registrationDate = domain.registration?.registrationDate
    ? parseInt(domain.registration?.registrationDate) * 1000
    : null
  const fuses = domain.wrappedDomain?.fuses
    ? decodeFuses(parseInt(domain.wrappedDomain.fuses))
    : null
  const expiryDateRef =
    domain.registration?.expiryDate ||
    (fuses?.parent.PARENT_CANNOT_CONTROL && domain.wrappedDomain?.expiryDate)
  const expiryDate = expiryDateRef ? parseInt(expiryDateRef) * 1000 : null
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
  }
}
