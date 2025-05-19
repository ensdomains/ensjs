import {
  type DisallowedToken,
  type EmojiToken,
  ens_beautify,
  ens_emoji,
  ens_normalize,
  ens_normalize_fragment,
  ens_split,
  ens_tokenize,
  type IgnoredToken,
  is_combining_mark,
  type Label,
  type MappedToken,
  type NFCToken,
  type StopToken,
  should_escape,
  type TextToken,
  type Token,
  type ValidToken,
} from '@adraffy/ens-normalize'
import type { ErrorType } from '../../errors/utils.js'

const zeros = new Uint8Array(32)
zeros.fill(0)

// ================================
// Normalize
// ================================

export type NormalizeErrorType = ErrorType

/**
 * Normalizes a name
 *
 * @throws {NormalizeErrorType}
 * @param name - Name to normalize
 */
export const normalize = (name: string) => (name ? ens_normalize(name) : name)

/** @deprecated use `normalize` instead */
export const normalise = normalize

// ================================
// Extra Exports
// ================================

export const beautify = ens_beautify
export const emoji = ens_emoji
export const normalizeFragment = ens_normalize_fragment
/** @deprecated use `normalizeFragment` instead */
export const normaliseFragment = ens_normalize_fragment
export const split = ens_split
export const tokenize = ens_tokenize
/** @deprecated use `tokenize` instead */
export const tokenise = tokenize
export const isCombiningMark = is_combining_mark
export const shouldEscape = should_escape

export type {
  DisallowedToken,
  EmojiToken,
  IgnoredToken,
  Label,
  MappedToken,
  NFCToken,
  StopToken,
  TextToken,
  Token,
  ValidToken,
}
