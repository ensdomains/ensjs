import { returnOrThrow, ENSJSError } from './errors'

const provider = {
  getBlock: () => Promise.resolve({ timestamp: 1671169189 } as any),
}

const makeMeta = (hasIndexingErrors = true) => ({
  hasIndexingErrors,
  block: {
    number: 217,
  },
})

describe('errors.ts', () => {
  beforeAll(() => {})

  describe('environment variables', () => {
    afterAll(() => {
      process.env.NODE_ENV = ''
      process.env.NEXT_PUBLIC_ENSJS_DEBUG = ''
      localStorage.removeItem('ensjs-debug')
    })

    it('should throw error if NODE_ENV is development', async () => {
      process.env.NODE_ENV = 'development'
      localStorage.setItem('ensjs-debug', 'ENSJSSubgraphIndexingError')
      await expect(
        returnOrThrow({}, makeMeta(false), provider),
      ).rejects.toThrow(ENSJSError)
    })

    it('should not throw error if NODE_ENV is production', async () => {
      process.env.NODE_ENV = 'production'
      localStorage.setItem('ensjs-debug', 'ENSJSSubgraphIndexingError')
      await expect(
        returnOrThrow({}, makeMeta(false), provider),
      ).resolves.toEqual({})
    })

    it('should throw error if NEXT_PUBLIC_ENSJS_DEBUG has value', async () => {
      process.env.NEXT_PUBLIC_ENSJS_DEBUG = 'true'
      localStorage.setItem('ensjs-debug', 'ENSJSSubgraphIndexingError')
      await expect(
        returnOrThrow({}, makeMeta(false), provider),
      ).rejects.toThrow(ENSJSError)
    })

    it('should not throw error if NEXT_PUBLIC_ENSJS_DEBUG is empty string', async () => {
      process.env.NEXT_PUBLIC_ENSJS_DEBUG = ''
      localStorage.setItem('ensjs-debug', 'ENSJSSubgraphIndexingError')
      await expect(
        returnOrThrow({}, makeMeta(false), provider),
      ).resolves.toEqual({})
    })
  })

  describe('indexing error', () => {
    it('should throw if meta has indexing errors', async () => {
      await expect(returnOrThrow({}, makeMeta(true), provider)).rejects.toThrow(
        ENSJSError,
      )
    })
  })
})
