import { type Address, encodeFunctionData, isAddressEqual } from 'viem'
import { beforeAll, expect, it } from 'vitest'
import {
  deploymentAddresses,
  walletClient,
} from '../../../test/addTestContracts.js'
import { clientWithOverrides } from '../../../utils/clientWithOverrides.js'
import { transferNameWriteParameters } from './transferName.js'

const registryAddress = deploymentAddresses.ETHRegistry as Address

let accounts: Address[]

beforeAll(async () => {
  accounts = await walletClient.getAddresses()
})

it('transferNameWriteParameters targets the registry safeTransferFrom', () => {
  const writeParameters = transferNameWriteParameters(
    clientWithOverrides(walletClient, { account: accounts[0] }),
    {
      registryAddress,
      tokenId: 123n,
      newOwnerAddress: accounts[1],
    },
  )

  expect(writeParameters.address).toBe(registryAddress)
  expect(writeParameters.functionName).toBe('safeTransferFrom')

  // ERC-1155 transfer args: [from, to, id, value=1, data='0x']
  const [from, to, id, value, data] = writeParameters.args
  expect(isAddressEqual(from, accounts[0])).toBe(true)
  expect(isAddressEqual(to, accounts[1])).toBe(true)
  expect(id).toBe(123n)
  expect(value).toBe(1n)
  expect(data).toBe('0x')
})

it('transferNameWriteParameters encodes valid safeTransferFrom calldata', () => {
  const writeParameters = transferNameWriteParameters(
    clientWithOverrides(walletClient, { account: accounts[0] }),
    {
      registryAddress,
      tokenId: 123n,
      newOwnerAddress: accounts[1],
    },
  )
  const data = encodeFunctionData({
    abi: writeParameters.abi,
    functionName: writeParameters.functionName,
    args: writeParameters.args,
  })

  expect(data).toMatch(/^0x[0-9a-f]+$/i)
  expect(data.length).toBeGreaterThan(10)
})
