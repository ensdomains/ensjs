import { expect, it } from 'vitest'
import { deploySubregistryWriteParameters } from './deploySubregistry.js'

const fakeClient = {
  chain: { id: 1 },
  account: { address: '0x000000000000000000000000000000000000dEaD' },
} as any

it('generates a fresh default salt on every call, not a value fixed at module load', () => {
  const p1 = deploySubregistryWriteParameters(fakeClient, {
    factoryAddress: '0x24e32c34effb021cc360b6a4e1de2850dcc59956',
    implAddress: '0xc3ae19b222d527d3cdda617953ab878a35527e54',
  })
  const p2 = deploySubregistryWriteParameters(fakeClient, {
    factoryAddress: '0x24e32c34effb021cc360b6a4e1de2850dcc59956',
    implAddress: '0xc3ae19b222d527d3cdda617953ab878a35527e54',
  })
  // Reusing the default salt across two calls in the same process previously
  // reused the exact same value, so the second on-chain deploy always
  // reverted (VerifiableFactory.deployProxy reverts on a repeated
  // (msg.sender, salt) pair). A fresh salt per call is what makes two
  // sequential default-salt deploys both succeed.
  expect(p1.args[1]).not.toEqual(p2.args[1])
})

it('still honors an explicitly provided salt', () => {
  const explicitSalt = 123n
  const p = deploySubregistryWriteParameters(fakeClient, {
    factoryAddress: '0x24e32c34effb021cc360b6a4e1de2850dcc59956',
    implAddress: '0xc3ae19b222d527d3cdda617953ab878a35527e54',
    salt: explicitSalt,
  })
  expect(p.args[1]).toEqual(explicitSalt)
})
