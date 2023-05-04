import { publicClient } from '../../tests/addTestContracts'
import getName from './getName'

describe('getName', () => {
  it('should get a primary name from an address', async () => {
    const result = await getName(publicClient, {
      address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "match": true,
        "name": "with-profile.eth",
        "resolverAddress": "0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB",
        "reverseResolverAddress": "0x70e0bA845a1A0F2DA3359C97E0285013525FFC49",
      }
    `)
    // expect(result).toBeTruthy()
    // if (result) {
    //   expect(result.name).toBe('with-profile.eth')
    //   expect(result.match).toBeTruthy()
    // }
  })
  it.todo(
    'should return null for an address with no primary name',
    // async () => {
    //   const result = await getName(testClient, {
    //     address: '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0',
    //   })
    //   expect(result).toMatchInlineSnapshot(``)
    // },
  )
  it.todo(
    'should return with a false match for a name with no forward resolution',
    // async () => {
    //   const tx = await ensInstance.setName('with-profile.eth')
    //   await tx?.wait()

    //   const result = await ensInstance.getName(accounts[0])
    //   expect(result).toBeTruthy()
    //   if (result) {
    //     expect(result.name).toBe('with-profile.eth')
    //     expect(result.match).toBeFalsy()
    //   }
    // },
  )
})
