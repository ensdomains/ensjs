import { labelhash, parseAbi, parseEther, type Address, type Hex } from 'viem'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import { getVersion } from '../../errors/error-utils.js'
import {
  deploymentAddresses,
  publicClient,
  publicClientWithLegacyDns,
  testClient,
  waitForTransaction,
  walletClient,
  walletClientWithLegacyDns,
} from '../../test/addTestContracts.js'
import getOwner from '../public/getOwner.js'
import getResolver from '../public/getResolver.js'
import getDnsImportData, {
  type GetDnsImportDataReturnType,
} from './getDnsImportData.js'
import importDnsName from './importDnsName.js'

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

jest.setTimeout(10000)
jest.retryTimes(2)

describe('legacy', () => {
  let dnsImportData: GetDnsImportDataReturnType
  beforeAll(async () => {
    dnsImportData = await getDnsImportData(publicClientWithLegacyDns, { name })
  })
  it('should import a DNS name with no address', async () => {
    const tx = await importDnsName(walletClientWithLegacyDns, {
      name,
      dnsImportData,
      account: accounts[0],
    })
    expect(tx).toBeTruthy()
    const receipt = await waitForTransaction(tx)
    expect(receipt.status).toBe('success')

    const owner = await getOwner(publicClientWithLegacyDns, { name })
    expect(owner!.owner).toBe(address)
  })
  it('should import a DNS name with an address, using default resolver', async () => {
    await testClient.impersonateAccount({ address })
    await testClient.setBalance({
      address,
      value: parseEther('1'),
    })

    const tx = await importDnsName(walletClientWithLegacyDns, {
      name,
      address,
      dnsImportData,
      account: address,
    })
    expect(tx).toBeTruthy()
    const receipt = await waitForTransaction(tx)
    expect(receipt.status).toBe('success')

    const owner = await getOwner(publicClientWithLegacyDns, { name })
    expect(owner!.owner).toBe(address)
    const resolver = await getResolver(publicClientWithLegacyDns, { name })
    expect(resolver).toBe(
      getChainContractAddress({
        client: publicClientWithLegacyDns,
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

    const tx = await importDnsName(walletClientWithLegacyDns, {
      name,
      address,
      dnsImportData,
      account: address,
      resolverAddress: legacyResolverAddress,
    })
    expect(tx).toBeTruthy()
    const receipt = await waitForTransaction(tx)
    expect(receipt.status).toBe('success')

    const owner = await getOwner(publicClientWithLegacyDns, { name })
    expect(owner!.owner).toBe(address)
    const resolver = await getResolver(publicClientWithLegacyDns, { name })
    expect(resolver).toBe(legacyResolverAddress)
  })
})

describe('new', () => {
  let dnsImportData: GetDnsImportDataReturnType
  beforeAll(async () => {
    dnsImportData = await getDnsImportData(publicClient, { name })
  })
  beforeEach(async () => {
    const tx = await walletClient.writeContract({
      account: accounts[1],
      address: deploymentAddresses.Root,
      abi: parseAbi([
        'function setSubnodeOwner(bytes32 label, address owner) external',
      ] as const),
      functionName: 'setSubnodeOwner',
      args: [labelhash('xyz'), deploymentAddresses.DNSRegistrar],
    })
    await waitForTransaction(tx)

    await testClient.impersonateAccount({ address })
    await testClient.setBalance({
      address,
      value: parseEther('1'),
    })
    const approveTx = await walletClient.writeContract({
      account: address,
      address: deploymentAddresses.PublicResolver,
      abi: parseAbi([
        'function setApprovalForAll(address operator, bool approved) external',
      ] as const),
      functionName: 'setApprovalForAll',
      args: [deploymentAddresses.DNSRegistrar, true],
    })
    await waitForTransaction(approveTx)
    await testClient.stopImpersonatingAccount({ address })
  })

  it('should import a DNS name with no address', async () => {
    const tx = await importDnsName(walletClient, {
      name,
      dnsImportData,
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
      dnsImportData,
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

    const resolverAddress = deploymentAddresses.PublicResolver

    const approveTx = await walletClient.writeContract({
      account: address,
      address: resolverAddress,
      abi: parseAbi([
        'function setApprovalForAll(address operator, bool approved) external',
      ] as const),
      functionName: 'setApprovalForAll',
      args: [deploymentAddresses.DNSRegistrar, true],
    })
    const approveReceipt = await waitForTransaction(approveTx)
    expect(approveReceipt.status).toBe('success')

    const tx = await importDnsName(walletClient, {
      name,
      address,
      dnsImportData,
      account: address,
      resolverAddress,
    })
    expect(tx).toBeTruthy()
    const receipt = await waitForTransaction(tx)
    expect(receipt.status).toBe('success')

    const owner = await getOwner(publicClient, { name })
    expect(owner!.owner).toBe(address)
    const resolver = await getResolver(publicClient, { name })
    expect(resolver).toBe(resolverAddress)
  })
})

it('should throw error if resolver is specified when claiming without an address', async () => {
  await expect(
    importDnsName(walletClient, {
      name,
      resolverAddress: address,
      dnsImportData: await getDnsImportData(publicClient, { name }),
      account: accounts[0],
    } as any),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "Additional parameter specified: resolverAddress

    - Allowed parameters: name, dnsImportData

    Details: resolverAddress cannot be specified when claiming without an address

    Version: ${getVersion()}"
  `)
})
