import { ethers, utils } from 'ethers'
import { ENS } from '..'
import { hexEncodeName } from '../utils/hexEncodedName'
import setup from './setup'

let ENSInstance: ENS
let revert: Awaited<ReturnType<typeof setup>>['revert']
let createSnapshot: Awaited<ReturnType<typeof setup>>['createSnapshot']
let provider: ethers.providers.JsonRpcProvider

beforeAll(async () => {
  ;({ ENSInstance, revert, createSnapshot, provider } = await setup())
})

afterAll(async () => {
  await revert()
})

describe('setRecords', () => {
  it('should return a transaction to the resolver and set successfully', async () => {
    const tx = await ENSInstance.setRecords('parthtejpal.eth', {
      coinTypes: [
        { key: 'ETC', value: '0x42D63ae25990889E35F215bC95884039Ba354115' },
      ],
      texts: [{ key: 'foo', value: 'bar' }],
    })
    expect(tx).toBeTruthy()
    await tx.wait()

    const universalResolver =
      await ENSInstance.contracts!.getUniversalResolver()!
    const publicResolver = await ENSInstance.contracts!.getPublicResolver()!
    const result = await ENSInstance.batch(
      [ENSInstance.getText, 'parthtejpal.eth', 'foo'],
      [ENSInstance.getAddr, 'parthtejpal.eth', 'ETC'],
    )
    const encodedText = await universalResolver.resolve(
      hexEncodeName('parthtejpal.eth'),
      publicResolver.interface.encodeFunctionData('text(bytes32,string)', [
        utils.namehash('parthtejpal.eth'),
        'foo',
      ]),
    )
    const encodedAddr = await universalResolver.resolve(
      hexEncodeName('parthtejpal.eth'),
      publicResolver.interface.encodeFunctionData('addr(bytes32,uint256)', [
        utils.namehash('parthtejpal.eth'),
        '61',
      ]),
    )
    const [resultText] = publicResolver.interface.decodeFunctionResult(
      'text(bytes32,string)',
      encodedText[0],
    )
    const [resultAddr] = publicResolver.interface.decodeFunctionResult(
      'addr(bytes32,uint256)',
      encodedAddr[0],
    )
    expect(resultText).toBe('bar')
    expect(resultAddr).toBe(
      '0x42D63ae25990889E35F215bC95884039Ba354115'.toLowerCase(),
    )
  })
})
