import type { RequestListener } from 'node:http'
import { encodeErrorResult } from 'viem'
import { expect, it, vi } from 'vitest'
import { createHttpServer } from '../test/createHttpServer.js'
import { ccipBatchRequest } from './ccipBatchRequest.js'

it('returns array of responses', async () => {
  const handler = vi
    .fn<Parameters<RequestListener>, ReturnType<RequestListener>>()
    .mockImplementation((_, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ data: '0xdeadbeef' }))
    })
  const { url } = await createHttpServer(handler)
  const items = [
    ['0x8464135c8F25Da09e49BC8782676a84730C318bC', [url], '0xdeadbeef01'],
    ['0x8464135c8F25Da09e49BC8782676a84730C318bC', [url], '0xdeadbeef02'],
    ['0x8464135c8F25Da09e49BC8782676a84730C318bC', [url], '0xdeadbeef03'],
  ] as const
  const result = await ccipBatchRequest(items)
  expect(handler).toHaveBeenCalledTimes(3)
  expect(result).toMatchInlineSnapshot(`
    [
      [
        false,
        false,
        false,
      ],
      [
        "0xdeadbeef",
        "0xdeadbeef",
        "0xdeadbeef",
      ],
    ]
  `)
  // await close()
})
it('removes duplicate requests', async () => {
  const handler = vi
    .fn<Parameters<RequestListener>, ReturnType<RequestListener>>()
    .mockImplementation((_, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ data: '0xdeadbeef' }))
    })
  const { url } = await createHttpServer(handler)
  const items = [
    ['0x8464135c8F25Da09e49BC8782676a84730C318bC', [url], '0xdeadbeef'],
    ['0x8464135c8F25Da09e49BC8782676a84730C318bC', [url], '0xdeadbeef'],
    ['0x8464135c8F25Da09e49BC8782676a84730C318bC', [url], '0xdeadbeef'],
  ] as const
  const result = await ccipBatchRequest(items)
  expect(handler).toHaveBeenCalledTimes(1)
  expect(result).toMatchInlineSnapshot(`
    [
      [
        false,
        false,
        false,
      ],
      [
        "0xdeadbeef",
        "0xdeadbeef",
        "0xdeadbeef",
      ],
    ]
  `)
  // await close()
})
it('handles and correctly returns HttpRequestError', async () => {
  const handler = vi
    .fn<Parameters<RequestListener>, ReturnType<RequestListener>>()
    .mockImplementation((_, res) => {
      res.writeHead(404)
      res.end()
    })
  const { url } = await createHttpServer(handler)
  const items = [
    ['0x8464135c8F25Da09e49BC8782676a84730C318bC', [url], '0xdeadbeef'],
  ] as const
  const result = await ccipBatchRequest(items)
  expect(result).toMatchInlineSnapshot(`
    [
      [
        true,
      ],
      [
        "0xca7a4e750000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000194000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000094e6f7420466f756e640000000000000000000000000000000000000000000000",
      ],
    ]
  `)
  // await close()
})
it('handles and correctly returns misc. error', async () => {
  const handler = vi
    .fn<Parameters<RequestListener>, ReturnType<RequestListener>>()
    .mockImplementation((_, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end('invalid json')
    })

  const { url } = await createHttpServer(handler)

  const items = [
    ['0x8464135c8F25Da09e49BC8782676a84730C318bC', [url], '0xdeadbeef'],
  ] as const

  // Construct the expected error result dynamically
  const errorResult = encodeErrorResult({
    abi: [
      {
        type: 'error',
        name: 'OffchainLookup',
        inputs: [{ name: 'message', type: 'string' }],
      },
    ],
    errorName: 'OffchainLookup',
    args: [
      `Uncaught SyntaxError: Unexpected token 'i', "invalid json" is not valid JSON`,
    ],
  })

  const result = await ccipBatchRequest(items)

  expect(result).toEqual([[[true], [errorResult]]])
})
