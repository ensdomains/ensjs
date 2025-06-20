import { type LabelhashErrorType, labelhash } from 'viem'
import { type NamehashErrorType, namehash } from './namehash.js'

export type MakeLabelNodeAndParentErrorType =
  | NamehashErrorType
  | LabelhashErrorType

/**
 * Makes a label node and parent
 *
 * @throws {MakeLabelNodeAndParentErrorType}
 * @param name - Name to make label node and parent
 */
export const makeLabelNodeAndParent = (name: string) => {
  const labels = name.split('.')
  const label = labels.shift() as string
  const parentNode = namehash(labels.join('.'))
  return {
    label,
    labelhash: labelhash(label),
    parentNode,
  }
}
