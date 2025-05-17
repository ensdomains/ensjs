import type { Client, Transport } from 'viem'
import type { ChainWithContract } from '../../contracts/consts.js'
import type { Prettify } from '../../types.js'
import {
  getTextRecord,
  type GetTextRecordErrorType,
  type GetTextRecordParameters,
} from './getTextRecord.js'

export type GetCredentialsParameters = Prettify<
  Omit<GetTextRecordParameters, 'key'>
>

export type GetCredentialsReturnType = ExternalCredential[] | null

export type GetCredentialsErrorType = GetTextRecordErrorType

export type ExternalCredential = {
  url: string
}

const parseCredentials = (credentials: string[]) => {
  const externalCredentials: ExternalCredential[] = []
  for (const credential of credentials) {
    if (URL.canParse(credential)) externalCredentials.push({ url: credential })
  }

  return externalCredentials
}

/**
 * Gets credentials for a name.
 * @param client - {@link Client}
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
export async function getCredentials<
  chain extends ChainWithContract<'ensUniversalResolver'>,
>(
  client: Client<Transport, chain>,
  { gatewayUrls, strict, name }: GetCredentialsParameters,
): Promise<GetCredentialsReturnType> {
  const result = await getTextRecord(client, {
    name,
    key: 'verifications',
    gatewayUrls,
    strict,
  })
  if (!result) return null

  const credential = JSON.parse(result) as string[]
  return parseCredentials(credential)
}
