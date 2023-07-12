import { encodeSetAbi, EncodeSetAbiParameters } from './encodeSetAbi'

describe('encodeSetAbi', () => {
  const namehash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  const contentType = 0
  const encodedData = null

  const parameters: EncodeSetAbiParameters = {
    namehash,
    contentType,
    encodedData,
  }

  it('encodes the setABI function data correctly', () => {
    const expected = '0x623195b01234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000'
    const result = encodeSetAbi(parameters)
    expect(result).toEqual(expected)
  })

  it('encodes the setABI function data correctly with encodedData', () => {
    const encodedData = '0xabcdef123456'
    const parametersWithEncodedData: EncodeSetAbiParameters = {
      namehash,
      contentType,
      encodedData,
    }
    const expected = '0x623195b01234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000006abcdef1234560000000000000000000000000000000000000000000000000000'
    const result = encodeSetAbi(parametersWithEncodedData)
    expect(result).toEqual(expected)
  })
})