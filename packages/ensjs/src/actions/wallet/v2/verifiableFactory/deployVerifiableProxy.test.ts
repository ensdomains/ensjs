import { proxyInitializeSnippet } from '@ensdomains/ensjs-abi/v2/verifiableFactory'
import { decodeFunctionData, type Hex } from 'viem'
import { expect, it, vi } from 'vitest'
import {
  deployVerifiableProxy,
  deployVerifiableProxyWriteParameters,
} from './deployVerifiableProxy.js'

const decodedRoleBitmap = (callData: Hex): bigint => {
  const { args } = decodeFunctionData({
    abi: proxyInitializeSnippet,
    data: callData,
  })
  return args[1]
}

const fakeClient = {
  chain: { id: 1 },
  account: { address: '0x000000000000000000000000000000000000dEaD' },
} as any

it('generates a fresh default salt on every call, not a value fixed at module load', () => {
  const p1 = deployVerifiableProxyWriteParameters(fakeClient, {
    factoryAddress: '0x24e32c34effb021cc360b6a4e1de2850dcc59956',
    implAddress: '0xc3ae19b222d527d3cdda617953ab878a35527e54',
  })
  const p2 = deployVerifiableProxyWriteParameters(fakeClient, {
    factoryAddress: '0x24e32c34effb021cc360b6a4e1de2850dcc59956',
    implAddress: '0xc3ae19b222d527d3cdda617953ab878a35527e54',
  })
  // See deploySubregistry.test.ts for why this matters: reusing the default
  // salt across calls makes every deploy after the first one revert on-chain.
  expect(p1.args[1]).not.toEqual(p2.args[1])
})

it('still honors an explicitly provided salt', () => {
  const explicitSalt = 123n
  const p = deployVerifiableProxyWriteParameters(fakeClient, {
    factoryAddress: '0x24e32c34effb021cc360b6a4e1de2850dcc59956',
    implAddress: '0xc3ae19b222d527d3cdda617953ab878a35527e54',
    salt: explicitSalt,
  })
  expect(p.args[1]).toEqual(explicitSalt)
})

it('writeParameters layer honors a custom roleBitmap', () => {
  const customBitmap = 0x1n
  const customBitmapParams = deployVerifiableProxyWriteParameters(fakeClient, {
    factoryAddress: '0x24e32c34effb021cc360b6a4e1de2850dcc59956',
    implAddress: '0xc3ae19b222d527d3cdda617953ab878a35527e54',
    roleBitmap: customBitmap,
  })
  expect(decodedRoleBitmap(customBitmapParams.args[2] as Hex)).toEqual(
    customBitmap,
  )
})

it('forwards a custom roleBitmap from the action through to the transaction (regression: it was previously dropped, silently granting full permissions instead)', async () => {
  const customBitmap = 0x1n
  const writeContractSpy = vi.fn().mockResolvedValue('0xhash')
  const spyClient = { ...fakeClient, writeContract: writeContractSpy }

  await deployVerifiableProxy(spyClient, {
    factoryAddress: '0x24e32c34effb021cc360b6a4e1de2850dcc59956',
    implAddress: '0xc3ae19b222d527d3cdda617953ab878a35527e54',
    roleBitmap: customBitmap,
  } as any)

  const sentCallData = writeContractSpy.mock.calls[0][0].args[2] as Hex

  // Decode the actual on-chain calldata and assert the roleBitmap that was
  // requested is the one that lands in the transaction - not merely "some
  // value different from the default", which would also pass for an
  // incorrectly-encoded bitmap.
  expect(decodedRoleBitmap(sentCallData)).toEqual(customBitmap)
})
