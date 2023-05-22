import { Address, Hex, parseEther } from 'viem'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import {
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../tests/addTestContracts'
import getOwner from '../read/getOwner'
import getResolver from '../read/getResolver'
import importDnsName from './importDnsName'
import prepareDnsImport from './prepareDnsImport'

const name = 'taytems.xyz'
const address = '0x8e8Db5CcEF88cca9d624701Db544989C996E3216'

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

it('should import a DNS name with no address', async () => {
  const tx = await importDnsName(walletClient, {
    name,
    preparedData: await prepareDnsImport(publicClient, { name }),
    account: accounts[0],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const owner = await getOwner(publicClient, { name })
  expect(owner!.owner).toBe(address)
})
it('should import a DNS name with an address, using default resolver', async () => {
  await testClient.impersonateAccount({ address })
  await testClient.setBalance({
    address,
    value: parseEther('1'),
  })

  const tx = await importDnsName(walletClient, {
    name,
    address,
    preparedData: await prepareDnsImport(publicClient, { name }),
    account: address,
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const owner = await getOwner(publicClient, { name })
  expect(owner!.owner).toBe(address)
  const resolver = await getResolver(publicClient, { name })
  expect(resolver).toBe(
    getChainContractAddress({
      client: publicClient,
      contract: 'ensPublicResolver',
    }),
  )
})
it('should import a DNS name with an address, using a custom resolver', async () => {
  await testClient.impersonateAccount({ address })
  await testClient.setBalance({
    address,
    value: parseEther('1'),
  })

  const legacyResolverAddress = JSON.parse(
    process.env.DEPLOYMENT_ADDRESSES!,
  ).LegacyPublicResolver

  const tx = await importDnsName(walletClient, {
    name,
    address,
    preparedData: await prepareDnsImport(publicClient, { name }),
    account: address,
    resolverAddress: legacyResolverAddress,
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const owner = await getOwner(publicClient, { name })
  expect(owner!.owner).toBe(address)
  const resolver = await getResolver(publicClient, { name })
  expect(resolver).toBe(legacyResolverAddress)
})
it('should throw error if resolver is specified when claiming without an address', async () => {
  await expect(
    importDnsName(walletClient, {
      name,
      resolverAddress: address,
      preparedData: await prepareDnsImport(publicClient, { name }),
      account: accounts[0],
    } as any),
  ).rejects.toThrow(
    'resolverAddress cannot be specified when claiming without an address',
  )
})
