import type { Address } from 'viem'
import { describe, expect, it } from 'vitest'
import { deploySubregistryWriteParameters } from './deploySubregistry.js'
import { deployVerifiableProxyWriteParameters } from './deployVerifiableProxy.js'

const factoryAddress = '0x1111111111111111111111111111111111111111' as Address
const implAddress = '0x3333333333333333333333333333333333333333' as Address
const client = {
  account: { address: '0x2222222222222222222222222222222222222222' },
  chain: { id: 1 },
} as unknown as Parameters<typeof deploySubregistryWriteParameters>[0]

// VerifiableFactory derives the proxy address from (msg.sender, salt), so a
// salt shared between two deploys by one account makes the second one revert.
describe.each([
  ['deploySubregistryWriteParameters', deploySubregistryWriteParameters],
  [
    'deployVerifiableProxyWriteParameters',
    deployVerifiableProxyWriteParameters,
  ],
] as const)('%s', (_, writeParameters) => {
  const saltOf = (params: ReturnType<typeof writeParameters>) => params.args[1]

  it('draws a new salt on every call when none is given', () => {
    const first = saltOf(
      writeParameters(client, { factoryAddress, implAddress }),
    )
    const second = saltOf(
      writeParameters(client, { factoryAddress, implAddress }),
    )

    expect(second).not.toBe(first)
  })

  it('uses the given salt as is', () => {
    const params = writeParameters(client, {
      factoryAddress,
      implAddress,
      salt: 42n,
    })

    expect(params.functionName).toBe('deployProxy')
    expect(params.args[0]).toBe(implAddress)
    expect(saltOf(params)).toBe(42n)
  })
})
