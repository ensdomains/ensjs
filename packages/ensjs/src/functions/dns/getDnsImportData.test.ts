import { SignedSet } from '@ensdomains/dnsprovejs'
import type { Address, Hex } from 'viem'
import {
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../test/addTestContracts.js'
import getDnsImportData, { type RrSetWithSig } from './getDnsImportData.js'
import importDnsName from './importDnsName.js'

let snapshot: Hex
let accounts: Address[]

beforeAll(async () => {
  accounts = await walletClient.getAddresses()
})

beforeEach(async () => {
  snapshot = await testClient.snapshot()
})

afterEach(async () => {
  await testClient.revert({ id: snapshot })
})

const decodeProofs = (proofs: RrSetWithSig[]) =>
  proofs.map((proof) =>
    SignedSet.fromWire(proof.rrset as Buffer, proof.sig as Buffer),
  )

jest.setTimeout(10000)
jest.retryTimes(2)

const wait = async (ms: number) =>
  // eslint-disable-next-line no-promise-executor-return
  new Promise((resolve) => setTimeout(resolve, ms))

it('returns all rrsets when no proofs are known', async () => {
  const result = await getDnsImportData(publicClient, {
    name: 'taytems.xyz',
  })
  expect(result.rrsets.length).toBeGreaterThan(0)
  expect(result.proof).toBeInstanceOf(Uint8Array)
  const decodedProofs = decodeProofs(result.rrsets)
  const rootProofs = decodedProofs.filter((x) => x.signature.name === '.')
  const tldProofs = decodedProofs.filter((x) => x.signature.name === 'xyz')
  const twoLDProofs = decodedProofs.filter(
    (x) => x.signature.name === 'taytems.xyz',
  )
  const threeLDProofs = decodedProofs.filter(
    (x) => x.signature.name === '_ens.taytems.xyz',
  )
  expect(rootProofs.length).toBeGreaterThan(0)
  expect(tldProofs.length).toBeGreaterThan(0)
  expect(twoLDProofs.length).toBeGreaterThan(0)
  expect(threeLDProofs.length).toBeGreaterThan(0)
})
it('returns rrsets up to the first unknown proof', async () => {
  const tx = await importDnsName(walletClient, {
    name: 'taytems.xyz',
    account: accounts[0],
    dnsImportData: await getDnsImportData(publicClient, {
      name: 'taytems.xyz',
    }),
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  await wait(5000)

  const result = await getDnsImportData(publicClient, {
    name: 'lenster.xyz',
  })
  const decodedProofs = decodeProofs(result.rrsets)
  const rootProofs = decodedProofs.filter((x) => x.signature.name === '.')
  const tldProofs = decodedProofs.filter((x) => x.signature.name === 'xyz')
  const twoLDProofs = decodedProofs.filter(
    (x) => x.signature.name === 'lenster.xyz',
  )
  const threeLDProofs = decodedProofs.filter(
    (x) => x.signature.name === '_ens.lenster.xyz',
  )
  expect(rootProofs).toHaveLength(0)
  expect(tldProofs).toHaveLength(0)
  expect(twoLDProofs.length).toBeGreaterThan(0)
  expect(threeLDProofs.length).toBeGreaterThan(0)
})
it('returns empty rrsets for all known proofs when the last proof is known', async () => {
  const tx = await importDnsName(walletClient, {
    name: 'taytems.xyz',
    account: accounts[0],
    dnsImportData: await getDnsImportData(publicClient, {
      name: 'taytems.xyz',
    }),
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  await wait(5000)

  const result = await getDnsImportData(publicClient, {
    name: 'taytems.xyz',
  })
  const decodedProofs = decodeProofs(result.rrsets)
  const rootProofs = decodedProofs.filter((x) => x.signature.name === '.')
  const tldProofs = decodedProofs.filter((x) => x.signature.name === 'xyz')
  const twoLDProofs = decodedProofs.filter(
    (x) => x.signature.name === 'taytems.xyz',
  )
  const threeLDProofs = decodedProofs.filter(
    (x) => x.signature.name === '_ens.taytems.xyz',
  )
  expect(rootProofs).toHaveLength(0)
  expect(tldProofs).toHaveLength(0)
  expect(twoLDProofs).toHaveLength(0)
  expect(threeLDProofs).toHaveLength(0)
})
