import type { RequestListener } from 'node:http'
import {
  afterAll,
  beforeAll,
  beforeEach,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest'
import { createHttpServer } from '../../test/createHttpServer.js'
import { getDnsTxtRecords } from './getDnsTxtRecords.js'

const handler: MockedFunction<RequestListener> = vi.fn()
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

it('requests the expected name for a plain name', async () => {
  let receivedParams: URLSearchParams | null = null
  handler.mockImplementation((req, res) => {
    receivedParams = new URL(req.url!, `http://${req.headers.host!}`)
      .searchParams
    res.writeHead(200, { 'Content-Type': 'application/dns-json' })
    res.end(JSON.stringify({ Status: 0, AD: true, Answer: [] }))
    res.destroy()
  })

  await getDnsTxtRecords({ name: '_ens.example.com', endpoint: serverUrl })

  expect(receivedParams).not.toBeNull()
  expect(receivedParams!.get('name')).toBe('_ens.example.com.')
  expect(receivedParams!.get('type')).toBe('TXT')
  expect(receivedParams!.get('do')).toBe('1')
  // exactly the three intended params - nothing extra
  expect([...receivedParams!.keys()]).toEqual(['name', 'type', 'do'])
})

it('does not let an unescaped name inject extra query parameters', async () => {
  let receivedParams: URLSearchParams | null = null
  handler.mockImplementation((req, res) => {
    receivedParams = new URL(req.url!, `http://${req.headers.host!}`)
      .searchParams
    res.writeHead(200, { 'Content-Type': 'application/dns-json' })
    res.end(JSON.stringify({ Status: 0, AD: true, Answer: [] }))
    res.destroy()
  })

  // a name shaped to try to append cd/type params if interpolated unescaped
  const maliciousName = '_ens.example.com&type=A&cd=1'

  await getDnsTxtRecords({ name: maliciousName, endpoint: serverUrl })

  expect(receivedParams).not.toBeNull()
  // the whole string lands in `name`, not split into extra params
  expect([...receivedParams!.keys()]).toEqual(['name', 'type', 'do'])
  expect(receivedParams!.get('name')).toBe(`${maliciousName}.`)
  expect(receivedParams!.get('type')).toBe('TXT')
  expect(receivedParams!.get('do')).toBe('1')
})
