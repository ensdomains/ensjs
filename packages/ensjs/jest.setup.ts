import crypto from 'crypto'
import 'jest-localstorage-mock'

Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: any) => crypto.randomBytes(arr.length),
  },
})
