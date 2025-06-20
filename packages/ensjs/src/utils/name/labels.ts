import { type Hex, type LabelhashErrorType, labelhash } from 'viem'
import {
  InvalidEncodedLabelError,
  InvalidLabelhashError,
} from '../../errors/utils.js'

const hasLocalStorage = typeof localStorage !== 'undefined'

// ================================
// Decode Labelhash
// ================================

export type DecodeLabelhashErrorType = InvalidEncodedLabelError

/**
 * Decodes an encoded labelhash
 *
 * @throws {DecodeLabelhashErrorType}
 * @param hash - Labelhash to decode
 * @returns {Hex}
 */
export function decodeLabelhash(hash: string): Hex {
  if (!(hash.startsWith('[') && hash.endsWith(']')))
    throw new InvalidEncodedLabelError({
      label: hash,
      details:
        'Expected encoded labelhash to start and end with square brackets',
    })

  if (hash.length !== 66)
    throw new InvalidEncodedLabelError({
      label: hash,
      details: 'Expected encoded labelhash to have a length of 66',
    })

  return `0x${hash.slice(1, -1)}`
}

// ================================
// Encode Labelhash
// ================================

export type EncodeLabelhashErrorType = InvalidLabelhashError

/**
 * Encodes a labelhash
 *
 * @throws {EncodeLabelhashErrorType}
 * @param hash - Labelhash to encode
 * @throws {EncodeLabelhashErrorType}
 */
export function encodeLabelhash(hash: string) {
  if (!hash.startsWith('0x'))
    throw new InvalidLabelhashError({
      labelhash: hash,
      details: 'Expected labelhash to start with 0x',
    })

  if (hash.length !== 66)
    throw new InvalidLabelhashError({
      labelhash: hash,
      details: 'Expected labelhash to have a length of 66',
    })

  return `[${hash.slice(2)}]`
}

export function isEncodedLabelhash(hash: string) {
  return hash.startsWith('[') && hash.endsWith(']') && hash.length === 66
}

// ================================
// Save Label
// ================================

function _saveLabel(hash: string, label: any) {
  if (!hasLocalStorage) return hash
  const labels = getLabels()
  localStorage.setItem(
    'ensjs:labels',
    JSON.stringify({
      ...labels,
      [hash]: label,
    }),
  )
  return hash
}

export type SaveLabelErrorType = LabelhashErrorType

/**
 * Saves a label to local storage (if available)
 *
 * @throws {SaveLabelErrorType}
 * @param label - Label to save
 */
export function saveLabel(label: string) {
  const hash = `${labelhash(label.toLowerCase())}`
  return _saveLabel(hash, label)
}

// ================================
// Save Name
// ================================

export type SaveNameErrorType = SaveLabelErrorType

/**
 * Saves a name to local storage (if available)
 *
 * @throws {SaveNameErrorType}
 * @param name - Name to save
 */
export function saveName(name: string) {
  const nameArray = name.split('.')
  for (const label of nameArray) {
    if (!isEncodedLabelhash(label)) {
      saveLabel(label)
    }
  }
}

// ================================
// Check Label
// ================================

export type CheckLabelErrorType = DecodeLabelhashErrorType

/**
 * Checks a label
 *
 * @throws {CheckLabelErrorType}
 * @param hash - Label to check
 */
export function checkLabel(hash: string): string {
  const labels = getLabels()
  if (isEncodedLabelhash(hash)) {
    return labels[decodeLabelhash(hash)] || hash
  }
  return hash
}

// ================================
// Check Is Decrypted
// ================================

export function checkIsDecrypted(string: string | string[]) {
  return !string?.includes('[')
}

// ================================
// Decrypt Name
// ================================

export type DecryptNameErrorType = CheckLabelErrorType

/**
 * Decrypts a name
 *
 * @throws {DecryptNameErrorType}
 * @param name - Name to decrypt
 */
export function decryptName(name: string) {
  return name
    .split('.')
    .map((label: any) => checkLabel(label))
    .join('.')
}

// ================================
// Internal Utils
// ================================

function getLabels() {
  return hasLocalStorage
    ? JSON.parse(localStorage.getItem('ensjs:labels') as string) || {}
    : {}
}
