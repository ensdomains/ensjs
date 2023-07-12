export {
  encodeAbi,
  type EncodeAbiParameters,
  type EncodeAbiReturnType,
  type EncodedAbi,
} from './encoders/encodeAbi.js'
export {
  encodeSetAbi,
  type EncodeSetAbiParameters,
  type EncodeSetAbiReturnType,
} from './encoders/encodeSetAbi.js'
export {
  encodeSetAddr,
  type EncodeSetAddrParameters,
  type EncodeSetAddrReturnType,
} from './encoders/encodeSetAddr.js'
export {
  encodeSetContentHash,
  type EncodeSetContentHashParameters,
  type EncodeSetContentHashReturnType,
} from './encoders/encodeSetContentHash.js'
export {
  encodeSetText,
  type EncodeSetTextParameters,
  type EncodeSetTextReturnType,
} from './encoders/encodeSetText.js'

export {
  EMPTY_ADDRESS,
  GRACE_PERIOD_SECONDS,
  MAX_DATE_INT,
  MAX_INT_64,
  MINIMUM_DOT_ETH_CHARS,
} from './consts.js'

export {
  decodeContenthash,
  encodeContenthash,
  getProtocolType,
  isValidContenthash,
  validateContent,
  type DecodedContentHash,
  type ProtocolType,
} from './contentHash.js'
export { truncateFormat } from './format.js'
export {
  generateRecordCallArray,
  type RecordOptions,
} from './generateRecordCallArray.js'
export { bytesToPacket, packetToBytes } from './hexEncodedName.js'
export {
  checkIsDecrypted,
  checkLabel,
  decodeLabelhash,
  decryptName,
  encodeLabelhash,
  isEncodedLabelhash,
  saveLabel,
  saveName,
} from './labels.js'
export { makeSafeSecondsDate } from './makeSafeSecondsDate.js'
export {
  beautify,
  emoji,
  isCombiningMark,
  namehash,
  normalise,
  normaliseFragment,
  shouldEscape,
  split,
  tokenise,
  type DisallowedToken,
  type EmojiToken,
  type IgnoredToken,
  type Label,
  type MappedToken,
  type NFCToken,
  type StopToken,
  type TextToken,
  type Token,
  type ValidToken,
} from './normalise.js'
export {
  makeCommitment,
  makeCommitmentFromTuple,
  makeCommitmentTuple,
  makeRegistrationTuple,
  randomSecret,
  type CommitmentTuple,
  type RegistrationParameters,
  type RegistrationTuple,
} from './registerHelpers.js'
export {
  checkIsDotEth,
  parseInput,
  validateName,
  type ParsedInputResult,
} from './validation.js'
export {
  MAX_EXPIRY,
  expiryToBigInt,
  wrappedLabelLengthCheck,
} from './wrapper.js'
