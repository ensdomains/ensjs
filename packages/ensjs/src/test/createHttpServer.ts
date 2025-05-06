import { type RequestListener, createServer } from 'node:http'
import type { AddressInfo } from 'node:net'

export function createHttpServer(handler: RequestListener): Promise<{
  close: () => Promise<unknown>
  url: `http://localhost:${number}`
}> {
  const server = createServer(handler)

  const closeServer = () => {
    return new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  }

  return new Promise((resolve) => {
    server.listen(() => {
      const { port } = server.address() as AddressInfo
      resolve({
        close: closeServer,
        url: `http://localhost:${port}`,
      })
    })
  })
}
