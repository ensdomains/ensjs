import { labelhash, toBytes } from 'viem'
import { encodeLabelhash } from '../labels.js'

/**
 * Ensures a name has labels with a max length of 255 bytes (the max length of labels supported by the universal resolver).
 */
export function getNameWithSizedLabels(name: string) {
  return name
    .split('.')
    .map((label) => {
      const labelLength = toBytes(label).byteLength
      if (labelLength > 255) {
        return encodeLabelhash(labelhash(label))
      }
      return label
    })
    .join('.')
}
