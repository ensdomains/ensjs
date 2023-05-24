import { getChainContractAddress } from '../contracts'
import { publicClient } from '../tests/addTestContracts'
import { namehash } from './normalise'
import { ownerFromContract } from './ownerFromContract'

const baseParams = {
  client: publicClient,
  namehash: namehash('test.eth'),
}

it('uses nameWrapper contract when contract is nameWrapper', () => {
  expect(ownerFromContract({ ...baseParams, contract: 'nameWrapper' }))
    .toMatchInlineSnapshot(`
    {
      "data": "0x6352211eeb4f647bea6caa36333c816d7b46fdcb05f9466ecacc140ea8c66faf15b3d9f1",
      "to": "${getChainContractAddress({
        client: publicClient,
        contract: 'ensNameWrapper',
      })}",
    }
  `)
})
it('uses registry contract when contract is registry', () => {
  expect(ownerFromContract({ ...baseParams, contract: 'registry' }))
    .toMatchInlineSnapshot(`
    {
      "data": "0x02571be3eb4f647bea6caa36333c816d7b46fdcb05f9466ecacc140ea8c66faf15b3d9f1",
      "to": "${getChainContractAddress({
        client: publicClient,
        contract: 'ensRegistry',
      })}",
    }
  `)
})
it('uses registrar contract when contract is registrar', () => {
  expect(
    ownerFromContract({
      ...baseParams,
      contract: 'registrar',
      labels: ['test'],
    }),
  ).toMatchInlineSnapshot(`
    {
      "data": "0x6352211e9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658",
      "to": "${getChainContractAddress({
        client: publicClient,
        contract: 'ensBaseRegistrarImplementation',
      })}",
    }
  `)
})
it('throws when contract is not nameWrapper, registry, or registrar', () => {
  expect(() => ownerFromContract({ ...baseParams, contract: 'invalid' as any }))
    .toThrowErrorMatchingInlineSnapshot(`
    "Invalid contract type: invalid

    - Supported contract types: nameWrapper, registry, registrar

    Version: @ensdomains/ensjs@3.0.0-alpha.62"
  `)
})
