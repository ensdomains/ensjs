import {
  NameWithEmptyLabelsError,
  RootNameIncludesOtherLabelsError,
} from '../../errors/utils.js'
import { MINIMUM_DOT_ETH_CHARS } from '../consts.js'
import {
  type CheckLabelErrorType,
  checkLabel,
  isEncodedLabelhash,
  type SaveNameErrorType,
  saveName,
} from './labels.js'
import {
  type Label,
  type NormalizeErrorType,
  normalize,
  split,
} from './normalize.js'

// ================================
// Validate Name
// ================================

export type ValidateNameErrorType =
  | NameWithEmptyLabelsError
  | RootNameIncludesOtherLabelsError
  | CheckLabelErrorType
  | NormalizeErrorType
  | SaveNameErrorType

export const validateName = (name: string) => {
  const nameArray = name.split('.')
  const normalizedArray = nameArray.map((label) => {
    if (label.length === 0) throw new NameWithEmptyLabelsError({ name })
    if (label === '[root]') {
      if (name !== label) throw new RootNameIncludesOtherLabelsError({ name })
      return label
    }
    return isEncodedLabelhash(label)
      ? // may throw CheckLabelErrorType
        checkLabel(label) || label
      : // may throw NormalizeErrorType
        normalize(label)
  })

  const normalizedName = normalizedArray.join('.')

  // may throw SaveNameErrorType
  saveName(normalizedName)

  return normalizedName
}

// ================================
// Parse Input
// ================================

export type ParsedInputResult = {
  type: 'name' | 'label'
  normalized: string | undefined
  isValid: boolean
  isShort: boolean
  is2LD: boolean
  isETH: boolean
  labelDataArray: Label[]
}

export const parseInput = (input: string): ParsedInputResult => {
  let nameReference = input
  let isValid = false

  // TODO: Should this only be catching the explicitly thrown errors or should it be catching all errors?
  try {
    nameReference = validateName(input)
    isValid = true
  } catch {}

  const normalizedName = isValid ? nameReference : undefined

  const labels = nameReference.split('.')
  const tld = labels[labels.length - 1]
  const isETH = tld === 'eth'
  const labelDataArray = split(nameReference)
  const isShort =
    (labelDataArray[0].output?.length || 0) < MINIMUM_DOT_ETH_CHARS

  if (labels.length === 1) {
    return {
      type: 'label',
      normalized: normalizedName,
      isShort,
      isValid,
      is2LD: false,
      isETH,
      labelDataArray,
    }
  }

  const is2LD = labels.length === 2
  return {
    type: 'name',
    normalized: normalizedName,
    isShort: isETH && is2LD ? isShort : false,
    isValid,
    is2LD,
    isETH,
    labelDataArray,
  }
}

// ================================
// Check Is Dot Eth
// ================================

/**
 * Checks if a label is a 2LD and is the .eth TLD
 */
export const checkIsDotEth = (labels: string[]) =>
  labels.length === 2 && labels[1] === 'eth'
