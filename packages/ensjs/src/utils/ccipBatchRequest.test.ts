import type { RequestListener } from 'node:http'
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

  const result = await ccipBatchRequest(items)

  expect(result).toEqual([
    [true],
    [
      '0xca7a4e7500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000001f400000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000036556e657870656374656420746f6b656e202769272c2022696e76616c6964206a736f6e22206973206e6f742076616c6964204a534f4e00000000000000000000',
    ],
  ])
})
