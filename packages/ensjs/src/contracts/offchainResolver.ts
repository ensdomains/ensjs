// EIP-7884 Operation Router

export const operationRouterSnippet = [
  {
    type: 'error',
    name: 'FunctionNotSupported',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OperationHandledOnchain',
    inputs: [
      {
        name: 'chainId',
        type: 'uint256',
      },
      {
        name: 'contractAddress',
        type: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'OperationHandledOffchain',
    inputs: [
      {
        name: 'sender',
        type: 'tuple',
        components: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint64' },
          { name: 'verifyingContract', type: 'address' },
        ],
      },
      {
        name: 'url',
        type: 'string',
      },
      {
        name: 'data',
        type: 'tuple',
        components: [
          { name: 'data', type: 'bytes' },
          { name: 'sender', type: 'address' },
          { name: 'expirationTimestamp', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getOperationHandler',
    inputs: [
      {
        name: 'encodedFunction',
        type: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'view',
  },
] as const

// ENSIP-20 Wildcard Writing

export const offchainRegisterSnippet = [
  ...operationRouterSnippet,
  {
    components: [
      { name: 'name', type: 'bytes' },
      { name: 'owner', type: 'address' },
      { name: 'duration', type: 'uint256' },
      { name: 'secret', type: 'bytes32' },
      { name: 'resolver', type: 'address' },
      { name: 'extraData', type: 'bytes' },
    ],
    name: 'RegisterRequest',
    type: 'tuple',
  },
  {
    inputs: [
      { name: 'name', type: 'bytes' },
      { name: 'duration', type: 'uint256' },
    ],
    name: 'registerParams',
    outputs: [
      {
        components: [
          { name: 'price', type: 'uint256' },
          { name: 'available', type: 'bool' },
          { name: 'token', type: 'address' },
          { name: 'commitTime', type: 'uint256' },
          { name: 'extraData', type: 'bytes' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes', name: 'name', type: 'bytes' },
          { internalType: 'address', name: 'owner', type: 'address' },
          { internalType: 'uint256', name: 'duration', type: 'uint256' },
          { internalType: 'bytes32', name: 'secret', type: 'bytes32' },
          { internalType: 'address', name: 'resolver', type: 'address' },
          { internalType: 'bytes', name: 'extraData', type: 'bytes' },
        ],
        internalType: 'struct RegisterRequest',
        name: '',
        type: 'tuple',
      },
    ],
    name: 'register',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const

export const offchainCommitableSnippet = [
  ...operationRouterSnippet,
  {
    inputs: [
      {
        components: [
          { name: 'name', type: 'bytes' },
          { name: 'owner', type: 'address' },
          { name: 'duration', type: 'uint256' },
          { name: 'secret', type: 'bytes32' },
          { name: 'extraData', type: 'bytes' },
        ],
        name: 'request',
        type: 'tuple',
      },
    ],
    name: 'makeCommitment',
    outputs: [{ name: 'commitHash', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [{ name: 'commitment', type: 'bytes32' }],
    name: 'commit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const offchainTransferrableSnippet = [
  ...operationRouterSnippet,
  {
    inputs: [
      { name: 'name', type: 'bytes' },
      { name: 'owner', type: 'address' },
      { name: 'newOwner', type: 'address' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

/**
 * @notice Struct used to define the message context used to construct a typed data signature, defined in EIP-712,
 * to authorize and define the deferred mutation being performed.
 * @param callData The encoded function to be called
 * @param sender The address of the user performing the mutation (msg.sender).
 */
export type MessageData = {
  data: `0x${string}`
  sender: `0x${string}`
  expirationTimestamp: bigint
}
