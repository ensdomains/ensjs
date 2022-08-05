import { ENS } from '..'
import setup from '../tests/setup'
import { decodeContenthash } from '../utils/contentHash'
import { hexEncodeName } from '../utils/hexEncodedName'
import { namehash } from '../utils/normalise'

let ENSInstance: ENS
let revert: Awaited<ReturnType<typeof setup>>['revert']

beforeAll(async () => {
  ;({ ENSInstance, revert } = await setup())
})

afterAll(async () => {
  await revert()
})

describe('setRecord', () => {
  it('should allow a text record set', async () => {
    const tx = await ENSInstance.setRecord('parthtejpal.eth', {
      type: 'text',
      record: { key: 'foo', value: 'bar' },
    })
    expect(tx).toBeTruthy()
    await tx.wait()

    const universalResolver =
      await ENSInstance.contracts!.getUniversalResolver()!
    const publicResolver = await ENSInstance.contracts!.getPublicResolver()!
    const encodedText = await universalResolver.resolve(
      hexEncodeName('parthtejpal.eth'),
      publicResolver.interface.encodeFunctionData('text', [
        namehash('parthtejpal.eth'),
        'foo',
      ]),
    )
    const [resultText] = publicResolver.interface.decodeFunctionResult(
      'text',
      encodedText[0],
    )
    expect(resultText).toBe('bar')
  })
  it('should allow an address record set', async () => {
    const tx = await ENSInstance.setRecord('parthtejpal.eth', {
      type: 'addr',
      record: {
        key: 'ETC',
        value: '0x42D63ae25990889E35F215bC95884039Ba354115',
      },
    })
    expect(tx).toBeTruthy()
    await tx.wait()

    const universalResolver =
      await ENSInstance.contracts!.getUniversalResolver()!
    const publicResolver = await ENSInstance.contracts!.getPublicResolver()!
    const encodedAddr = await universalResolver.resolve(
      hexEncodeName('parthtejpal.eth'),
      publicResolver.interface.encodeFunctionData('addr(bytes32,uint256)', [
        namehash('parthtejpal.eth'),
        '61',
      ]),
    )
    const [resultAddr] = publicResolver.interface.decodeFunctionResult(
      'addr(bytes32,uint256)',
      encodedAddr[0],
    )
    expect(resultAddr).toBe(
      '0x42D63ae25990889E35F215bC95884039Ba354115'.toLowerCase(),
    )
  })
  it('should allow a contenthash record set', async () => {
    const tx = await ENSInstance.setRecord('parthtejpal.eth', {
      type: 'contentHash',
      record:
        'ipns://k51qzi5uqu5dgox2z23r6e99oqency055a6xt92xzmyvpz8mwz5ycjavm0u150',
    })
    expect(tx).toBeTruthy()
    await tx.wait()

    const universalResolver =
      await ENSInstance.contracts!.getUniversalResolver()!
    const publicResolver = await ENSInstance.contracts!.getPublicResolver()!
    const encodedContent = await universalResolver.resolve(
      hexEncodeName('parthtejpal.eth'),
      publicResolver.interface.encodeFunctionData('contenthash', [
        namehash('parthtejpal.eth'),
      ]),
    )
    const [resultContent] = publicResolver.interface.decodeFunctionResult(
      'contenthash',
      encodedContent[0],
    )
    const content = decodeContenthash(resultContent)
    expect(content.decoded).toBe(
      'k51qzi5uqu5dgox2z23r6e99oqency055a6xt92xzmyvpz8mwz5ycjavm0u150',
    )
    expect(content.protocolType).toBe('ipns')
  })
})
