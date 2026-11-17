/**
 * ABI snippets for `ReverseRegistrarAdapter`.
 *
 * Forwards `addr.reverse` claims to the v1 reverse registrar. An account
 * claims for itself through `claim`; its HCA claims on the owner's behalf
 * through `claimWithHCA`.
 */

/** Shared by both reverse registrar adapters. */
export const reverseRegistrarAdapterErrors = [
  {
    inputs: [{ name: 'hca', type: 'address' }],
    name: 'HCADeploymentNotTrusted',
    type: 'error',
  },
  {
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'hcaOwner', type: 'address' },
    ],
    name: 'HCAOwnerMismatch',
    type: 'error',
  },
  {
    inputs: [{ name: 'namer', type: 'address' }],
    name: 'UnauthorizedNamer',
    type: 'error',
  },
] as const

export const reverseRegistrarAdapterClaimSnippet = [
  ...reverseRegistrarAdapterErrors,
  {
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'resolver', type: 'address' },
    ],
    name: 'claim',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const reverseRegistrarAdapterClaimWithHcaSnippet = [
  ...reverseRegistrarAdapterErrors,
  {
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'resolver', type: 'address' },
    ],
    name: 'claimWithHCA',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
