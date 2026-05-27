/**
 * ABI snippets for `UnlockedMigrationController`.
 *
 * Receives ERC721/ERC1155 transfers of unwrapped or unlocked v1 names during
 * migration. The manager does not call this contract directly; these snippets
 * exist so its custom errors can be decoded when raised through
 * `MigrationHelper`.
 */

export const unlockedMigrationControllerErrors = [
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'NameIsLocked',
    type: 'error',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'NameDataMismatch',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidData',
    type: 'error',
  },
] as const
