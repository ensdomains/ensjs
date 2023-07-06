import {
  decodeFunctionResult,
  encodeFunctionData,
  type Address,
  type Hex,
} from 'viem'
import type { ClientWithEns } from '../../contracts/consts.js'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import { nameWrapperGetDataSnippet } from '../../contracts/nameWrapper.js'
import type {
  DateWithValue,
  Prettify,
  SimpleTransactionRequest,
} from '../../types.js'
import { EMPTY_ADDRESS } from '../../utils/consts.js'
import { decodeFuses } from '../../utils/fuses.js'
import {
  generateFunction,
  type GeneratedFunction,
} from '../../utils/generateFunction.js'
import { makeSafeSecondsDate } from '../../utils/makeSafeSecondsDate.js'
import { namehash } from '../../utils/normalise.js'

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
      abi: nameWrapperGetDataSnippet,
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
    abi: nameWrapperGetDataSnippet,
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
