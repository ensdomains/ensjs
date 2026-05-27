/**
 * ABI snippets for `LockedMigrationController`.
 *
 * Receives ERC1155 transfers of locked v1 NameWrapper tokens during migration.
 * The manager does not call this contract directly; these snippets exist so
 * its custom errors can be decoded when raised through `MigrationHelper`.
 */

export const lockedMigrationControllerErrors = [
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'NameNotLocked',
    type: 'error',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'NameDataMismatch',
    type: 'error',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'FrozenTokenApproval',
    type: 'error',
  },
] as const
