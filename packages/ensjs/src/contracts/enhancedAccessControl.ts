export const eacRolesChangedEventSnippet = [
  {
    inputs: [
      {
        indexed: true,
        name: 'resource',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        indexed: true,
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
      {
        indexed: false,
        name: 'oldRoleBitmap',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        indexed: false,
        name: 'newRoleBitmap',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    name: 'EACRolesChanged',
    type: 'event',
    anonymous: false,
  },
] as const
