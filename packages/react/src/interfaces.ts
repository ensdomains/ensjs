export const resolverInterfaces = {
  /**
   * Addr addr(bytes32 node, uint256 coinType)
   * Legacy please use addrMulticoin
   */
  addr: '0x3b3b57de',
  /**
   * Addr Multicoin addr(bytes32 node, uint256 coinType)
   */
  addrMulticoin: '0xf1cb7e06',
  /**
   * Content Hash contenthash(bytes32 node)
   */
  contentHash: '0xbc1c58d1',
  /**
   * Text text(bytes32 node, string key)
   */
  text: '0x59d1d43c',
  /**
   * ABI abi(bytes32 node, uint256 contentType)
   */
  abi: '0x2203ab56',
  /**
   * Public Key pubkey(bytes32 node)
   */
  pubkey: '0xc8690233',
  /**
   * Reverse Name name(bytes32 node)
   */
  name: '0x691f3431',
  /**
   * Wildcard
   */
  wildcard: '0x9061b923',
} as const
