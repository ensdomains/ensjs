import { beforeAll, vi } from 'vitest'

// Mock localStorage for Node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

// @ts-ignore
global.localStorage = localStorageMock

beforeAll(() => {
  vi.mock('../errors/error-utils.ts', () => ({
    getVersion: vi.fn().mockReturnValue('@ensdomains/ensjs@1.0.0-mock.0'),
  }))
})
