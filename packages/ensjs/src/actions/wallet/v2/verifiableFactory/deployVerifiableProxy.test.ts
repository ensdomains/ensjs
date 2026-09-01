import { expect, it, vi } from 'vitest'
import {
  deployVerifiableProxy,
  deployVerifiableProxyWriteParameters,
} from './deployVerifiableProxy.js'

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
  const defaultBitmapParams = deployVerifiableProxyWriteParameters(fakeClient, {
    factoryAddress: '0x24e32c34effb021cc360b6a4e1de2850dcc59956',
    implAddress: '0xc3ae19b222d527d3cdda617953ab878a35527e54',
  })
  const customBitmapParams = deployVerifiableProxyWriteParameters(fakeClient, {
    factoryAddress: '0x24e32c34effb021cc360b6a4e1de2850dcc59956',
    implAddress: '0xc3ae19b222d527d3cdda617953ab878a35527e54',
    roleBitmap: customBitmap,
  })
  expect(customBitmapParams.args[2]).not.toEqual(defaultBitmapParams.args[2])
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

  const sentCallData = writeContractSpy.mock.calls[0][0].args[2]
  const expectedWithDefaultBitmap = deployVerifiableProxyWriteParameters(
    fakeClient,
    {
      factoryAddress: '0x24e32c34effb021cc360b6a4e1de2850dcc59956',
      implAddress: '0xc3ae19b222d527d3cdda617953ab878a35527e54',
    },
  ).args[2]
  const expectedWithCustomBitmap = deployVerifiableProxyWriteParameters(
    fakeClient,
    {
      factoryAddress: '0x24e32c34effb021cc360b6a4e1de2850dcc59956',
      implAddress: '0xc3ae19b222d527d3cdda617953ab878a35527e54',
      roleBitmap: customBitmap,
    },
  ).args[2]

  expect(sentCallData).toEqual(expectedWithCustomBitmap)
  expect(sentCallData).not.toEqual(expectedWithDefaultBitmap)
})
