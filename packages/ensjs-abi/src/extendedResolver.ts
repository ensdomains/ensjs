/** ENSIP-10 `IExtendedResolver`: wildcard resolution of any resolver call. */
export const extendedResolverResolveSnippet = [
  {
    inputs: [
      {
        name: 'name',
        type: 'bytes',
      },
      {
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'resolve',
    outputs: [
      {
        name: '',
        type: 'bytes',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const
