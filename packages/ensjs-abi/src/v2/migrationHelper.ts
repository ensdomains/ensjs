/**
 * ABI snippets for `MigrationHelper`.
 *
 * Helper contract that batches v1 -> v2 ENS name migrations. Callers send the
 * unwrapped/unlocked/locked groups in a single `migrate` call; the helper
 * forwards each token to the appropriate `*MigrationController`.
 */

export const migrationHelperErrors = [
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'WrappedOwnerMismatch',
    type: 'error',
  },
  {
    inputs: [{ name: 'name', type: 'bytes' }],
    name: 'ParentNotMigrated',
    type: 'error',
  },
  {
    inputs: [
      { name: 'nft', type: 'address' },
      { name: 'owner', type: 'address' },
    ],
    name: 'NotApprovedOperator',
    type: 'error',
  },
] as const

const migrationDataComponents = [
  { name: 'label', type: 'string' },
  { name: 'owner', type: 'address' },
  { name: 'subregistry', type: 'address' },
  { name: 'resolver', type: 'address' },
] as const

export const migrationHelperMigrateSnippet = [
  ...migrationHelperErrors,
  {
    type: 'function',
    name: 'migrate',
    inputs: [
      {
        name: 'unwrapped',
        type: 'tuple[]',
        components: migrationDataComponents,
      },
      {
        name: 'unlockedGroups',
        type: 'tuple[][]',
        components: migrationDataComponents,
      },
      {
        name: 'lockedGroups',
        type: 'tuple[][]',
        components: migrationDataComponents,
      },
      {
        name: 'lockedChildrenGroups',
        type: 'tuple[]',
        components: [
          { name: 'parentName', type: 'bytes' },
          {
            name: 'groups',
            type: 'tuple[][]',
            components: migrationDataComponents,
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const
