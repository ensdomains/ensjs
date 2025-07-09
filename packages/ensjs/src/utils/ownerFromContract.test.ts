import {
  type Abi,
  type Address,
  encodeFunctionData,
  type Hex,
  namehash,
  type ReadContractParameters,
} from 'viem'
import { expect, it } from 'vitest'
import { deploymentAddresses, publicClient } from '../test/addTestContracts.js'
import { getContractSpecificOwnerParameters } from './ownerFromContract.js'

const baseParams = {
  node: namehash('test.eth'),
}

const toSnapshot = <abi extends Abi>({
  abi,
  functionName,
  args,
  address,
}: ReadContractParameters<abi>): { data: Hex; to?: Address } => {
  // @ts-expect-error requires viem ABI TS magic
  const data = encodeFunctionData({ abi, functionName, args })

  return {
    data,
    to: address,
  }
}

it('uses nameWrapper contract when contract is nameWrapper', () => {
  expect(
    toSnapshot(
      getContractSpecificOwnerParameters(publicClient.chain, {
        ...baseParams,
        contract: 'nameWrapper',
      }),
    ),
  ).toMatchInlineSnapshot(`
    {
      "data": "0x6352211eeb4f647bea6caa36333c816d7b46fdcb05f9466ecacc140ea8c66faf15b3d9f1",
      "to": "${deploymentAddresses.NameWrapper}",
    }
  `)
})
it('uses registry contract when contract is registry', () => {
  expect(
    toSnapshot(
      getContractSpecificOwnerParameters(publicClient.chain, {
        ...baseParams,
        contract: 'registry',
      }),
    ),
  ).toMatchInlineSnapshot(`
    {
      "data": "0x02571be3eb4f647bea6caa36333c816d7b46fdcb05f9466ecacc140ea8c66faf15b3d9f1",
      "to": "${deploymentAddresses.ENSRegistry}",
    }
  `)
})
it('uses registrar contract when contract is registrar', () => {
  expect(
    toSnapshot(
      getContractSpecificOwnerParameters(publicClient.chain, {
        ...baseParams,
        contract: 'registrar',
        labels: ['test'],
      }),
    ),
  ).toMatchInlineSnapshot(`
    {
      "data": "0x6352211e9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658",
      "to": "${deploymentAddresses.BaseRegistrarImplementation}",
    }
  `)
})
it('throws when contract is not nameWrapper, registry, or registrar', () => {
  expect(() =>
    getContractSpecificOwnerParameters(publicClient.chain, {
      ...baseParams,
      // biome-ignore lint/suspicious/noExplicitAny: Intentionally invalid contract type
      contract: 'invalid' as any,
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidContractTypeError: Invalid contract type: invalid

      - Supported contract types: nameWrapper, registry, registrar

      Version: @ensdomains/ensjs@1.0.0-mock.0]
    `)
})
