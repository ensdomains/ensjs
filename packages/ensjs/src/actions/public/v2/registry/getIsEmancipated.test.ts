import type { Address } from 'viem'
import { beforeAll, describe, expect, it } from 'vitest'
import {
  publicClient as client,
  deploymentAddresses,
  getDeployedProxyAddress,
  waitForTransaction,
  walletClient,
} from '../../../../test/addTestContracts.js'
import { deploySubregistry } from '../../../wallet/v2/verifiableFactory/deploySubregistry.js'
import { getIsEmancipated } from './getIsEmancipated.js'

let subregistryAddress: Address

beforeAll(async () => {
  const [admin] = await walletClient.getAddresses()
  const hash = await deploySubregistry(walletClient, {
    factoryAddress: deploymentAddresses.VerifiableFactory,
    implAddress: deploymentAddresses.UserRegistryImpl,
    adminAddress: admin,
    account: admin,
  })
  subregistryAddress = getDeployedProxyAddress(await waitForTransaction(hash))
})

describe('getIsEmancipated', () => {
  it('returns true for a registry with no root role holders', async () => {
    const result = await getIsEmancipated(client, {
      registryAddress: deploymentAddresses.ETHRegistry,
    })

    expect(result).toBe(true)
  })

  it('returns false for a subregistry whose admin holds root roles', async () => {
    const result = await getIsEmancipated(client, {
      registryAddress: subregistryAddress,
    })

    expect(result).toBe(false)
  })
})
