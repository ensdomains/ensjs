import { Address, Hex, decodeFunctionResult, encodeFunctionData } from 'viem'
import { ClientWithEns } from '../../contracts/consts'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { getDataSnippet } from '../../contracts/nameWrapper'
import { DateWithValue, Prettify, SimpleTransactionRequest } from '../../types'
import { EMPTY_ADDRESS } from '../../utils/consts'
import { decodeFuses } from '../../utils/fuses'
import {
  GeneratedFunction,
  generateFunction,
} from '../../utils/generateFunction'
import { makeSafeSecondsDate } from '../../utils/makeSafeSecondsDate'
import { namehash } from '../../utils/normalise'

export type GetWrapperDataParameters = {
  /** Name to get wrapper data for */
  name: string
}

export type GetWrapperDataReturnType = Prettify<{
  /** Fuse object */
  fuses: ReturnType<typeof decodeFuses> & {
    value: number
  }
  /** Expiry of the name */
  expiry: DateWithValue<bigint> | null
  /** Owner of the name */
  owner: Address
} | null>

const encode = (
  client: ClientWithEns,
  { name }: GetWrapperDataParameters,
): SimpleTransactionRequest => {
  return {
    to: getChainContractAddress({ client, contract: 'ensNameWrapper' }),
    data: encodeFunctionData({
      abi: getDataSnippet,
      functionName: 'getData',
      args: [BigInt(namehash(name))],
    }),
  }
}

const decode = async (
  _client: ClientWithEns,
  data: Hex,
): Promise<GetWrapperDataReturnType> => {
  const [owner, fuses, expiry] = decodeFunctionResult({
    abi: getDataSnippet,
    functionName: 'getData',
    data,
  })

  if (owner === EMPTY_ADDRESS) {
    return null
  }

  const fuseObj = decodeFuses(fuses)
  const expiryDate = expiry > 0 ? makeSafeSecondsDate(expiry) : null

  return {
    fuses: {
      ...fuseObj,
      value: fuses,
    },
    expiry: expiryDate
      ? {
          date: expiryDate,
          value: expiry,
        }
      : null,
    owner,
  }
}

type BatchableFunctionObject = GeneratedFunction<typeof encode, typeof decode>

/**
 * Gets the wrapper data for a name.
 * @param client - {@link ClientWithEns}
 * @param parameters - {@link GetWrapperDataParameters}
 * @returns Wrapper data object, or null if name is not wrapped. {@link GetWrapperDataReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts, getWrapperData } from '@ensdomains/ensjs'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getWrapperData(client, { name: 'ilikelasagna.eth' })
 */
const getWrapperData = generateFunction({ encode, decode }) as ((
  client: ClientWithEns,
  { name }: GetWrapperDataParameters,
) => Promise<GetWrapperDataReturnType>) &
  BatchableFunctionObject

export default getWrapperData
