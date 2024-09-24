import type { BaseError, Hex } from 'viem'
import type { ClientWithEns } from '../../contracts/consts.js'
import type {
  GenericPassthrough,
  Prettify,
  SimpleTransactionRequest,
} from '../../types.js'
import {
  generateFunction,
  type GeneratedFunction,
} from '../../utils/generateFunction.js'
import type {
  GetTextRecordErrorType,
  GetTextRecordParameters,
} from './getTextRecord.js'
import getTextRecord from './getTextRecord.js'

export type GetCredentialsParameters = Prettify<
  Omit<GetTextRecordParameters, 'key'>
>

export type GetCredentialsReturnType = ExternalCredential[] | null

export type GetCredentialsErrorType = GetTextRecordErrorType

export type ExternalCredential = {
  url: string
}

const encode = (
  client: ClientWithEns,
  { name, gatewayUrls }: Omit<GetCredentialsParameters, 'strict'>,
): SimpleTransactionRequest => {
  return getTextRecord.encode(client, {
    name,
    key: 'verifications',
    gatewayUrls,
  })
}

const parseCredentials = (credentials: string[]) => {
  const externalCredentials: ExternalCredential[] = []
  for (const credential of credentials) {
    if (URL.canParse(credential)) externalCredentials.push({ url: credential })
  }

  return externalCredentials
}

const decode = async (
  client: ClientWithEns,
  data: Hex | BaseError,
  passthrough: GenericPassthrough,
  {
    strict,
    gatewayUrls,
  }: Pick<GetCredentialsParameters, 'strict' | 'gatewayUrls'>,
): Promise<GetCredentialsReturnType> => {
  const result = await getTextRecord.decode(client, data, passthrough, {
    strict,
    gatewayUrls,
  })
  if (!result) return null

  const credentials = JSON.parse(result) as string[]
  return parseCredentials(credentials)
}

type BatchableFunctionObject = GeneratedFunction<typeof encode, typeof decode>

/**
 * Gets credentials for a name.
 * @param client - {@link ClientWithEns}
 * @param parameters - {@link GetCredentialsParameters}
 * @returns Credentials, or null if none are found. {@link GetCredentialsReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getCredentials } from '@ensdomains/ensjs/public'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getCredentials(client, { name: 'ens.eth' })
 * // [{ url: 'https://example.com' }]
 */
const getCredentials = generateFunction({ encode, decode }) as ((
  client: ClientWithEns,
  { name, strict, gatewayUrls }: GetCredentialsParameters,
) => Promise<GetCredentialsReturnType>) &
  BatchableFunctionObject

export default getCredentials
