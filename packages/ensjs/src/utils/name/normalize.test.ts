import { expect, it } from 'vitest'

it('exports functions from ens-normalize', async () => {
  const modules = await import('./normalize.js')
  expect(modules).toMatchInlineSnapshot(`
    {
      "beautify": [Function],
      "emoji": [Function],
      "isCombiningMark": [Function],
      "namehash": [Function],
      "normalise": [Function],
      "normaliseFragment": [Function],
      "shouldEscape": [Function],
      "split": [Function],
      "tokenise": [Function],
    }
  `)
})
