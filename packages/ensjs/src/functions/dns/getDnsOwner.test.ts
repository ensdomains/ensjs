/* eslint-disable @typescript-eslint/naming-convention */
import type { RequestListener } from 'http'
import { getVersion } from '../../errors/error-utils.js'
import { createHttpServer } from '../../tests/createHttpServer.js'
import getDnsOwner from './getDnsOwner.js'

const handler: jest.MockedFunction<RequestListener> = jest.fn()
let closeServer: () => Promise<unknown>
let serverUrl: `http://${string}` = 'http://'

beforeAll(async () => {
  const { close, url } = await createHttpServer(handler)
  closeServer = close
  serverUrl = url
})

afterAll(async () => {
  await closeServer()
})

beforeEach(() => {
  handler.mockReset()
})

it('returns valid address from valid domain and record', async () => {
  let name
  let type
  handler.mockImplementation((req, res) => {
    const url = new URL(req.url!, `http://${req.headers.host!}`)
    name = url.searchParams.get('name')
    type = url.searchParams.get('type')

    res.writeHead(200, { 'Content-Type': 'application/dns-json' })
    res.end(
      JSON.stringify({
        Status: 0,
        AD: true,
        Answer: [
          {
            name: '_ens.example.com',
            type: 16,
            TTL: 0,
            data: '"a=0x8e8Db5CcEF88cca9d624701Db544989C996E3216"',
          },
        ],
      }),
    )
    res.destroy()
  })

  const result = await getDnsOwner({ name: 'example.com', endpoint: serverUrl })
  expect(handler).toHaveBeenCalled()
  expect(name).toBe('_ens.example.com.')
  expect(type).toBe('TXT')
  expect(result).toEqual('0x8e8Db5CcEF88cca9d624701Db544989C996E3216')
})

it('throws error if .eth', async () => {
  await expect(getDnsOwner({ name: 'example.eth' })).rejects
    .toThrowErrorMatchingInlineSnapshot(`
    "Unsupported name type: eth-2ld

    - Supported name types: other-2ld

    Version: ${getVersion()}"
  `)
})
it('throws error if >2ld', async () => {
  await expect(getDnsOwner({ name: 'subdomain.example.com' })).rejects
    .toThrowErrorMatchingInlineSnapshot(`
    "Unsupported name type: other-subname

    - Supported name types: other-2ld

    Version: ${getVersion()}"
  `)
})
it('returns error if DnsResponseStatus is not NOERROR', async () => {
  handler.mockImplementation((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/dns-json' })
    res.end(
      JSON.stringify({
        Status: 3, // NXDOMAIN
        AD: true,
      }),
    )
    res.destroy()
  })

  await expect(getDnsOwner({ name: 'example.com', endpoint: serverUrl }))
    .rejects.toThrowErrorMatchingInlineSnapshot(`
    "DNS query failed with status: NXDOMAIN

    Version: ${getVersion()}"
  `)
})
it('returns error if AD is false', async () => {
  handler.mockImplementation((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/dns-json' })
    res.end(
      JSON.stringify({
        Status: 0,
        AD: false,
      }),
    )
    res.destroy()
  })

  await expect(getDnsOwner({ name: 'example.com', endpoint: serverUrl }))
    .rejects.toThrowErrorMatchingInlineSnapshot(`
    "DNSSEC verification failed

    Version: ${getVersion()}"
  `)
})
it('returns error if no TXT record', async () => {
  handler.mockImplementation((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/dns-json' })
    res.end(
      JSON.stringify({
        Status: 0,
        AD: true,
        Answer: [],
      }),
    )
    res.destroy()
  })

  await expect(getDnsOwner({ name: 'example.com', endpoint: serverUrl }))
    .rejects.toThrowErrorMatchingInlineSnapshot(`
    "No TXT record found

    Version: ${getVersion()}"
  `)
})
it('returns error if TXT record is not formatted correctly', async () => {
  handler.mockImplementation((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/dns-json' })
    res.end(
      JSON.stringify({
        Status: 0,
        AD: true,
        Answer: [
          {
            name: '_ens.example.com',
            type: 16,
            TTL: 0,
            data: '"0x8e8Db5CcEF88cca9d624701Db544989C996E3216"',
          },
        ],
      }),
    )
    res.destroy()
  })

  await expect(getDnsOwner({ name: 'example.com', endpoint: serverUrl }))
    .rejects.toThrowErrorMatchingInlineSnapshot(`
    "Invalid TXT record: 0x8e8Db5CcEF88cca9d624701Db544989C996E3216

    Version: ${getVersion()}"
  `)
})
it('returns error if address is not checksummed', async () => {
  handler.mockImplementation((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/dns-json' })
    res.end(
      JSON.stringify({
        Status: 0,
        AD: true,
        Answer: [
          {
            name: '_ens.example.com',
            type: 16,
            TTL: 0,
            data: '"a=0x8e8db5CcEF88cca9d624701Db544989C996E3216"',
          },
        ],
      }),
    )
    res.destroy()
  })

  await expect(getDnsOwner({ name: 'example.com', endpoint: serverUrl }))
    .rejects.toThrowErrorMatchingInlineSnapshot(`
    "Invalid address checksum: 0x8e8db5CcEF88cca9d624701Db544989C996E3216

    Version: ${getVersion()}"
  `)
})
it('real test', async () => {
  const result = await getDnsOwner({
    name: 'taytems.xyz',
  })
  expect(result).toEqual('0x8e8Db5CcEF88cca9d624701Db544989C996E3216')
})
