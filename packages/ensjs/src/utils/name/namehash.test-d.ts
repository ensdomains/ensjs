import { expectTypeOf, test } from 'vitest'

import {
  type NamehashParameters,
  type NamehashReturnType,
  namehash,
} from './namehash.js'

test('namehash types properly configured', () => {
  expectTypeOf(namehash).toBeFunction()
  expectTypeOf(namehash).parameter(0).toMatchTypeOf<NamehashParameters>()
  expectTypeOf(namehash).returns.toMatchTypeOf<NamehashReturnType>()

  // // @ts-expect-error name is a string
  // assertType(namehash({ name: 'ens.eth' }))
})
