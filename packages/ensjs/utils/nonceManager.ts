import type { HardhatRuntimeEnvironment } from 'hardhat/types/runtime.js'
import { hexToNumber } from 'viem/utils'

const makeNonceManager = async (href: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, network } = href
  const names = ['owner', 'owner2', 'owner3', 'owner4']
  const allNamedAccts = await getNamedAccounts()
  const startingNonces = await Promise.all(
    names.map((name) =>
      network.provider
        .send('eth_getTransactionCount', [allNamedAccts[name], 'latest'])
        .then(hexToNumber),
    ),
  )
  const nonceMap = Object.fromEntries(
    names.map((name, i) => [name, startingNonces[i]]),
  )

  console.log('Nonce manager initialized', nonceMap)

  return {
    getNonce: (name?: string) => {
      if (!name) return
      const nonce = nonceMap[name]
      nonceMap[name]++
      return nonce
    },
  }
}

export { makeNonceManager }
