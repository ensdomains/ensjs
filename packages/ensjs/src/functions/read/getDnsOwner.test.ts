/* eslint-disable @typescript-eslint/naming-convention */
import type { RequestListener } from 'http'
import { createHttpServer } from '../../tests/createHttpServer'
import getDnsOwner from './getDnsOwner'

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
  expect(result).toEqual({
    address: '0x8e8Db5CcEF88cca9d624701Db544989C996E3216',
  })
})

it('throws error if .eth', async () => {
  await expect(getDnsOwner({ name: 'example.eth' })).rejects.toThrow(
    'Only DNS domains are supported',
  )
})
it('throws error if >2ld', async () => {
  await expect(getDnsOwner({ name: 'subdomain.example.com' })).rejects.toThrow(
    'Only TLDs and 2LDs are supported',
  )
})
it('returns error if DnsResponseStatus is not NOERROR', async () => {
  handler.mockImplementation((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/dns-json' })
    res.end(
      JSON.stringify({
        Status: 3, // NXDOMAIN
        AD: true,
      }),
    )
    res.destroy()
  })

  const result = await getDnsOwner({ name: 'example.com', endpoint: serverUrl })
  expect(handler).toHaveBeenCalled()
  expect(result).toEqual({
    data: null,
    error: `Error occurred: NXDOMAIN`,
  })
})
it('returns error if AD is false', async () => {
  handler.mockImplementation((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/dns-json' })
    res.end(
      JSON.stringify({
        Status: 0,
        AD: false,
      }),
    )
    res.destroy()
  })

  const result = await getDnsOwner({ name: 'example.com', endpoint: serverUrl })
  expect(handler).toHaveBeenCalled()
  expect(result).toEqual({
    data: null,
    error: 'DNSSEC verification failed',
  })
})
it('returns error if no TXT record', async () => {
  handler.mockImplementation((req, res) => {
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

  const result = await getDnsOwner({ name: 'example.com', endpoint: serverUrl })
  expect(handler).toHaveBeenCalled()
  expect(result).toEqual({
    data: null,
    error: 'No TXT record found',
  })
})
it('returns error if TXT record is not formatted correctly', async () => {
  handler.mockImplementation((req, res) => {
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

  const result = await getDnsOwner({ name: 'example.com', endpoint: serverUrl })
  expect(handler).toHaveBeenCalled()
  expect(result).toEqual({
    data: '0x8e8Db5CcEF88cca9d624701Db544989C996E3216',
    error: 'Invalid TXT record',
  })
})
it('returns error if address is not checksummed', async () => {
  handler.mockImplementation((req, res) => {
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

  const result = await getDnsOwner({ name: 'example.com', endpoint: serverUrl })
  expect(handler).toHaveBeenCalled()
  expect(result).toEqual({
    data: '0x8e8db5CcEF88cca9d624701Db544989C996E3216',
    error: 'Invalid checksum',
  })
})
it('real test', async () => {
  const result = await getDnsOwner({
    name: 'taytems.xyz',
  })
  expect(result).toEqual({
    address: '0x8e8Db5CcEF88cca9d624701Db544989C996E3216',
  })
})
