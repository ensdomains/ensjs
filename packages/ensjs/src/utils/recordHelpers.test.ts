import { PublicResolver__factory } from '../generated'
import { namehash } from './normalise'
import { generateSetAddr } from './recordHelpers'

describe('generateSetAddr()', () => {
  it('should allow empty string as address', () => {
    expect(() =>
      generateSetAddr(
        namehash('test'),
        'BNB',
        '',
        PublicResolver__factory.connect(
          '0x0000000000000000000000000000000000000000',
          undefined as any,
        ),
      ),
    ).not.toThrowError()
  })
})
