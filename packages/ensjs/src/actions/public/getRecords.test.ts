import { createPublicClient, http, RawContractError } from 'viem'
import { mainnet } from 'viem/chains'
import { describe, expect, it } from 'vitest'
import { addEnsL1Contracts } from '../../index.js'
import { publicClient } from '../../test/addTestContracts.js'
import { getRecords } from './getRecords.js'

const mainnetPublicClient = createPublicClient({
  chain: addEnsL1Contracts(mainnet),
  transport: http('https://mainnet.gateway.tenderly.co/4imxc4hQfRjxrVB2kWKvTo'),
})

describe('getRecords()', () => {
  it('works', async () => {
    const result = await getRecords(publicClient, {
      name: 'with-profile.eth',
      texts: ['description', 'url'],
      coins: ['60', 'etcLegacy', '0'],
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "coins": [
          {
            "coinType": 60,
            "symbol": "eth",
            "value": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          },
          {
            "coinType": 61,
            "symbol": "etcLegacy",
            "value": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          },
        ],
        "resolverAddress": "0x86A2EE8FAf9A840F7a2c64CA3d51209F9A02081D",
        "texts": [
          {
            "key": "description",
            "value": "Hello2",
          },
        ],
      }
    `)
  })
  it('works with oldest resolver', async () => {
    const result = await getRecords(publicClient, {
      name: 'with-oldest-resolver.eth',
      texts: ['description', 'url'],
      coins: ['60', 'etcLegacy', '0'],
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "coins": [],
        "resolverAddress": "0x0000000000000000000000000000000000000000",
        "texts": [],
      }
    `)
  })
  it('works with oldest resolver - jessesum.eth', async () => {
    const result = await getRecords(mainnetPublicClient, {
      name: 'jessesum.eth',
      texts: ['description', 'url'],
      coins: ['60', 'etcLegacy', '0'],
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "coins": [
          {
            "coinType": 60,
            "symbol": "eth",
            "value": "0x8c4Eb6988A199DAbcae0Ce31052b3f3aC591787e",
          },
        ],
        "resolverAddress": "0x1da022710dF5002339274AaDEe8D58218e9D6AB5",
        "texts": [],
      }
    `)
  })

  it('returns null results when known resolver error', async () => {
    const result = await getRecords(publicClient, {
      name: 'thisnamedoesnotexist.eth',
      coins: [60],
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "coins": [],
        "resolverAddress": "0x0000000000000000000000000000000000000000",
      }
    `)
  })

  it.skip('throws when unknown resolver error', async () => {
    await expect(
      getRecords.decode(
        publicClient,
        new RawContractError({
          data: '0x4ced43fb', // SwagError()
        }),
        {
          calls: [
            { type: 'coin', key: 60, call: { to: '0x1234', data: '0x5678' } },
          ],
          address: '0x1234',
          args: ['0x04746573740365746800', ['0x5678']],
        },
        { name: 'test.eth', coins: [60] },
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "resolve" reverted with the following signature:
      0x4ced43fb

      Unable to decode signature "0x4ced43fb" as it was not found on the provided ABI.
      Make sure you are using the correct ABI and that the error exists on it.
      You can look up the decoded signature here: https://openchain.xyz/signatures?query=0x4ced43fb.

      Contract Call:
        address:   0x1234
        function:  resolve(bytes name, bytes[] data)
        args:             (0x04746573740365746800, ["0x5678"])

      Docs: https://viem.sh/docs/contract/decodeErrorResult
      Version: viem@2.38.3]
    `)
  })
})
