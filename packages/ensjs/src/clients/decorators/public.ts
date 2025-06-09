import type { Account, Chain } from 'viem'
import {
  type GetAbiRecordParameters,
  type GetAbiRecordReturnType,
  getAbiRecord,
} from '../../actions/public/getAbiRecord.js'
import {
  type GetAddressRecordParameters,
  type GetAddressRecordReturnType,
  getAddressRecord,
} from '../../actions/public/getAddressRecord.js'
import {
  type GetAvailableParameters,
  type GetAvailableReturnType,
  getAvailable,
} from '../../actions/public/getAvailable.js'
import {
  type GetContentHashRecordParameters,
  type GetContentHashRecordReturnType,
  getContentHashRecord,
} from '../../actions/public/getContentHashRecord.js'
import {
  type GetCredentialsParameters,
  type GetCredentialsReturnType,
  getCredentials,
} from '../../actions/public/getCredentials.js'
import {
  type GetExpiryParameters,
  type GetExpiryReturnType,
  getExpiry,
} from '../../actions/public/getExpiry.js'
import {
  type GetNameParameters,
  type GetNameReturnType,
  getName,
} from '../../actions/public/getName.js'
import {
  type GetOwnerParameters,
  type GetOwnerReturnType,
  getOwner,
} from '../../actions/public/getOwner.js'
import {
  type GetPriceParameters,
  type GetPriceReturnType,
  getPrice,
} from '../../actions/public/getPrice.js'
import {
  type GetRecordsParameters,
  type GetRecordsReturnType,
  getRecords,
} from '../../actions/public/getRecords.js'
import {
  type GetResolverParameters,
  type GetResolverReturnType,
  getResolver,
} from '../../actions/public/getResolver.js'
import {
  type GetTextRecordParameters,
  type GetTextRecordReturnType,
  getTextRecord,
} from '../../actions/public/getTextRecord.js'
import {
  type GetWrapperDataParameters,
  type GetWrapperDataReturnType,
  getWrapperData,
} from '../../actions/public/getWrapperData.js'
import {
  type GetWrapperNameParameters,
  type GetWrapperNameReturnType,
  getWrapperName,
} from '../../actions/public/getWrapperName.js'
import type { ExcludeTE } from '../../types/internal.js'
import type { RequireClientContracts, SupportedContract } from '../chain.js'

export type EnsPublicActions = {
  /**
   * Gets the ABI record for a name
   * @param parameters - {@link GetAbiRecordParameters}
   * @returns ABI record for the name, or `null` if not found. {@link GetAbiRecordReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { addEnsContracts, ensPublicActions } from '@ensdomains/ensjs'
   *
   * const client = createPublicClient({
   *   chain: addEnsContracts(mainnet),
   *   transport: http(),
   * }).extend(ensPublicActions)
   * const result = await client.getAbiRecord({ name: 'ens.eth' })
   * // TODO: real example
   */
  getAbiRecord: ({
    name,
    gatewayUrls,
    strict,
    supportedContentTypes,
  }: GetAbiRecordParameters) => Promise<GetAbiRecordReturnType>
  /**
   * Gets an address record for a name and specified coin
   * @param parameters - {@link GetAddressRecordParameters}
   * @returns Coin value object, or `null` if not found. {@link GetAddressRecordReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { addEnsContracts, ensPublicActions } from '@ensdomains/ensjs'
   *
   * const client = createPublicClient({
   *   chain: addEnsContracts(mainnet),
   *   transport: http(),
   * }).extend(ensPublicActions)
   * const result = await client.getAddressRecord({ name: 'ens.eth', coin: 'ETH' })
   * // { id: 60, name: 'ETH , value: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7' }
   */
  getAddressRecord: ({
    name,
    coin,
    bypassFormat,
    gatewayUrls,
    strict,
  }: GetAddressRecordParameters) => Promise<GetAddressRecordReturnType>
  /**
   * Gets the availability of a name to register
   * @param parameters - {@link GetAvailableParameters}
   * @returns Availability as boolean. {@link GetAvailableReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { addEnsContracts, ensPublicActions } from '@ensdomains/ensjs'
   *
   * const client = createPublicClient({
   *   chain: addEnsContracts(mainnet),
   *   transport: http(),
   * }).extend(ensPublicActions)
   * const result = await client.getAvailable({ name: 'ens.eth' })
   * // false
   */
  getAvailable: ({
    name,
  }: GetAvailableParameters) => Promise<GetAvailableReturnType>
  /**
   * Gets the content hash record for a name
   * @param parameters - {@link GetContentHashRecordParameters}
   * @returns Content hash object, or `null` if not found. {@link GetContentHashRecordReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { addEnsContracts, ensPublicActions } from '@ensdomains/ensjs'
   *
   * const client = createPublicClient({
   *   chain: addEnsContracts(mainnet),
   *   transport: http(),
   * }).extend(ensPublicActions)
   * const result = await client.getContentHashRecord({ name: 'ens.eth' })
   * // { protocolType: 'ipfs', decoded: 'k51qzi5uqu5djdczd6zw0grmo23j2vkj9uzvujencg15s5rlkq0ss4ivll8wqw' }
   */
  getContentHashRecord: ({
    name,
    gatewayUrls,
    strict,
  }: GetContentHashRecordParameters) => Promise<GetContentHashRecordReturnType>
  /**
   * Gets the expiry for a name
   * @param parameters - {@link GetExpiryParameters}
   * @returns Expiry object, or `null` if no expiry. {@link GetExpiryReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { addEnsContracts, ensPublicActions } from '@ensdomains/ensjs'
   *
   * const client = createPublicClient({
   *   chain: addEnsContracts(mainnet),
   *   transport: http(),
   * }).extend(ensPublicActions)
   * const result = await client.getExpiry({ name: 'ens.eth' })
   * // { expiry: { date: Date, value: 1913933217n }, gracePeriod: 7776000, status: 'active' }
   */
  getCredentials: ({
    name,
    gatewayUrls,
    strict,
  }: GetCredentialsParameters) => Promise<GetCredentialsReturnType>
  /**
   * Gets credentials for a name.
   * @param parameters - {@link GetCredentialsParameters}
   * @returns Credentials, or null if none are found. {@link GetCredentialsReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { addEnsContracts, ensPublicActions } from '@ensdomains/ensjs'
   *
   * const client = createPublicClient({
   *   chain: addEnsContracts(mainnet),
   *   transport: http(),
   * }).extend(ensPublicActions)
   * const result = await client.getCredentials({ name: 'ens.eth' })
   * // [{ url: 'https://example.com' }]
   */
  getExpiry: ({
    name,
    contract,
  }: GetExpiryParameters) => Promise<GetExpiryReturnType>
  /**
   * Gets the primary name for an address
   * @param parameters - {@link GetNameParameters}
   * @returns Name data object, or `null` if no primary name is set. {@link GetNameReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { addEnsContracts, ensPublicActions } from '@ensdomains/ensjs'
   *
   * const client = createPublicClient({
   *   chain: addEnsContracts(mainnet),
   *   transport: http(),
   * }).extend(ensPublicActions)
   * const result = await client.getName({ address: '0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5' })
   * // { name: 'nick.eth', match: true, reverseResolverAddress: '0xa2c122be93b0074270ebee7f6b7292c7deb45047', resolverAddress: '0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41' }
   */
  getName: ({
    address,
    allowMismatch,
    allowUnnormalized,
    gatewayUrls,
    strict,
  }: GetNameParameters) => Promise<GetNameReturnType>
  /**
   * Gets the owner(s) of a name.
   * @param parameters - {@link GetOwnerParameters}
   * @returns Owner data object, or `null` if no owners exist. {@link GetOwnerReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { addEnsContracts, ensPublicActions } from '@ensdomains/ensjs'
   *
   * const client = createPublicClient({
   *   chain: addEnsContracts(mainnet),
   *   transport: http(),
   * }).extend(ensPublicActions)
   * const result = await client.getOwner({ name: 'ens.eth' })
   * // { owner: '0xb6E040C9ECAaE172a89bD561c5F73e1C48d28cd9', registrant: '0xb6E040C9ECAaE172a89bD561c5F73e1C48d28cd9', ownershipLevel: 'registrar }
   */
  getOwner: ({
    name,
    contract,
  }: GetOwnerParameters) => Promise<GetOwnerReturnType>
  /**
   * Gets the price of a name, or array of names, for a given duration.
   * @param parameters - {@link GetPriceParameters}
   * @returns Price data object. {@link GetPriceReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { addEnsContracts, ensPublicActions } from '@ensdomains/ensjs'
   *
   * const client = createPublicClient({
   *   chain: addEnsContracts(mainnet),
   *   transport: http(),
   * }).extend(ensPublicActions)
   * const result = await client.getPrice({ nameOrNames: 'ens.eth' })
   * // { base: 352828971668930335n, premium: 0n }
   */
  getPrice: ({
    nameOrNames,
    duration,
  }: GetPriceParameters) => Promise<GetPriceReturnType>
  /**
   * Gets arbitrary records for a name
   * @param parameters - {@link GetRecordsParameters}
   * @returns Records data object. {@link GetRecordsReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { addEnsContracts, ensPublicActions } from '@ensdomains/ensjs'
   *
   * const client = createPublicClient({
   *   chain: addEnsContracts(mainnet),
   *   transport: http(),
   * }).extend(ensPublicActions)
   * const result = await client.getRecords({
   *   name: 'ens.eth',
   *   texts: ['com.twitter', 'com.github'],
   *   coins: ['ETH'],
   *   contentHash: true,
   * })
   * // { texts: [{ key: 'com.twitter', value: 'ensdomains' }, { key: 'com.github', value: 'ensdomains' }], coins: [{ id: 60, name: 'ETH', value: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7' }], contentHash: { protocolType: 'ipns', decoded: 'k51qzi5uqu5djdczd6zw0grmo23j2vkj9uzvujencg15s5rlkq0ss4ivll8wqw' } }
   */
  getRecords: <
    const texts extends readonly string[] = readonly string[],
    const coins extends readonly (string | number)[] = readonly (
      | string
      | number
    )[],
    const contentHash extends boolean = true,
    const abi extends boolean = true,
  >({
    name,
    texts,
    coins,
    contentHash,
    abi,
    resolver,
    gatewayUrls,
  }: GetRecordsParameters<texts, coins, contentHash, abi>) => Promise<
    GetRecordsReturnType<texts, coins, contentHash, abi>
  >
  /**
   * Gets the resolver address for a name.
   * @param parameters - {@link GetResolverParameters}
   * @returns Resolver address, or null if none is found. {@link GetResolverReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { addEnsContracts, ensPublicActions } from '@ensdomains/ensjs'
   *
   * const client = createPublicClient({
   *   chain: addEnsContracts(mainnet),
   *   transport: http(),
   * }).extend(ensPublicActions)
   * const result = await client.getResolver({ name: 'ens.eth' })
   * // 0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41
   */
  getResolver: ({
    name,
  }: GetResolverParameters) => Promise<GetResolverReturnType>
  /**
   * Gets a text record for a name.
   * @param parameters - {@link GetTextRecordParameters}
   * @returns Text record string, or null if none is found. {@link GetTextRecordReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { addEnsContracts, ensPublicActions } from '@ensdomains/ensjs'
   *
   * const client = createPublicClient({
   *   chain: addEnsContracts(mainnet),
   *   transport: http(),
   * }).extend(ensPublicActions)
   * const result = await client.getTextRecord({ name: 'ens.eth', key: 'com.twitter' })
   * // ensdomains
   */
  getTextRecord: ({
    name,
    key,
    gatewayUrls,
    strict,
  }: GetTextRecordParameters) => Promise<GetTextRecordReturnType>
  /**
   * Gets the wrapper data for a name.
   * @param parameters - {@link GetWrapperDataParameters}
   * @returns Wrapper data object, or null if name is not wrapped. {@link GetWrapperDataReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { addEnsContracts, ensPublicActions } from '@ensdomains/ensjs'
   *
   * const client = createPublicClient({
   *   chain: addEnsContracts(mainnet),
   *   transport: http(),
   * }).extend(ensPublicActions)
   * const result = await client.getWrapperData({ name: 'ilikelasagna.eth' })
   */
  getWrapperData: ({
    name,
  }: GetWrapperDataParameters) => Promise<GetWrapperDataReturnType>
  /**
   * Gets the full name for a name with unknown labels from the NameWrapper.
   * @param parameters - {@link GetWrapperNameParameters}
   * @returns Full name, or null if name was not found. {@link GetWrapperNameReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { addEnsContracts, ensPublicActions } from '@ensdomains/ensjs'
   *
   * const client = createPublicClient({
   *   chain: addEnsContracts(mainnet),
   *   transport: http(),
   * }).extend(ensPublicActions)
   * const result = await client.getWrapperName({ name: '[4ca938ec1b323ca71c4fb47a712abb68cce1cabf39ea4d6789e42fbc1f95459b].eth' })
   * // wrapped.eth
   */
  getWrapperName: ({
    name,
  }: GetWrapperNameParameters) => Promise<GetWrapperNameReturnType>
}

/**
 * Extends the viem client with ENS public actions
 * @param client - The viem {@link Client} object to add the ENS public actions to
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts, ensPublicActions } from '@ensdomains/ensjs'
 *
 * const clientWithEns = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * }).extend(ensPublicActions)
 */
export const ensPublicActions = <
  chain extends Chain = Chain,
  account extends Account | undefined = Account | undefined,
>(
  client: RequireClientContracts<
    chain,
    SupportedContract | 'multicall3',
    account
  >,
): EnsPublicActions => {
  const client_ = client as ExcludeTE<typeof client> & {}

  return {
    getAbiRecord: (parameters) => getAbiRecord(client_, parameters),
    getAddressRecord: (parameters) => getAddressRecord(client_, parameters),
    getAvailable: (parameters) => getAvailable(client_, parameters),
    getContentHashRecord: (parameters) =>
      getContentHashRecord(client_, parameters),
    getCredentials: (parameters) => getCredentials(client_, parameters),
    getExpiry: (parameters) => getExpiry(client_, parameters),
    getName: (parameters) => getName(client_, parameters),
    getOwner: (parameters) => getOwner(client_, parameters),
    getPrice: (parameters) => getPrice(client_, parameters),
    getRecords: (parameters) => getRecords(client_, parameters),
    getResolver: (parameters) => getResolver(client_, parameters),
    getTextRecord: (parameters) => getTextRecord(client_, parameters),
    getWrapperData: (parameters) => getWrapperData(client_, parameters),
    getWrapperName: (parameters) => getWrapperName(client_, parameters),
  }
}
