/**
 * ABI snippets for `UniversalHelper`.
 *
 * Standalone contract holding the registry-walking views that used to live on
 * the UniversalResolver. The UR kept `findResolver` (resolution) and lost the
 * rest, so these read from `ensUniversalHelper`, not `ensUniversalResolver`.
 *
 * Note the owner lookup is split in two: `findExactOwner` answers for exactly
 * the name given (zero when it is unowned), while `findNearestOwner` walks up
 * to the closest owned ancestor. The former replaces the UR's old `findOwner`.
 */

export const universalHelperErrors = [
  {
    inputs: [{ name: 'dns', type: 'bytes' }],
    name: 'DNSDecodingFailed',
    type: 'error',
  },
] as const

export const universalHelperFindExactOwnerSnippet = [
  ...universalHelperErrors,
  {
    inputs: [{ name: 'name', type: 'bytes' }],
    name: 'findExactOwner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const universalHelperFindNearestOwnerSnippet = [
  ...universalHelperErrors,
  {
    inputs: [{ name: 'name', type: 'bytes' }],
    name: 'findNearestOwner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const universalHelperFindRegistriesSnippet = [
  ...universalHelperErrors,
  {
    inputs: [{ name: 'name', type: 'bytes' }],
    name: 'findRegistries',
    outputs: [
      { internalType: 'contract IRegistry[]', name: '', type: 'address[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const universalHelperFindParentRegistrySnippet = [
  ...universalHelperErrors,
  {
    inputs: [{ name: 'name', type: 'bytes' }],
    name: 'findParentRegistry',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
