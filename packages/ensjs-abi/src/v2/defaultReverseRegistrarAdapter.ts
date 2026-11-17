/**
 * ABI snippets for `DefaultReverseRegistrarAdapter`.
 *
 * Forwards `default.reverse` name updates to the v1 default reverse
 * registrar. An account names itself through `setName`; its HCA names the
 * owner through `setNameWithHCA`.
 */

import { reverseRegistrarAdapterErrors } from './reverseRegistrarAdapter.js'

export const defaultReverseRegistrarAdapterErrors =
  reverseRegistrarAdapterErrors

export const defaultReverseRegistrarAdapterSetNameSnippet = [
  ...defaultReverseRegistrarAdapterErrors,
  {
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'name', type: 'string' },
    ],
    name: 'setName',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const defaultReverseRegistrarAdapterSetNameWithHcaSnippet = [
  ...defaultReverseRegistrarAdapterErrors,
  {
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'name', type: 'string' },
    ],
    name: 'setNameWithHCA',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
