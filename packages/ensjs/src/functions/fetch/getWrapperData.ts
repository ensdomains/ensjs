import { Address, Hex, decodeFunctionResult, encodeFunctionData } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { getDataSnippet } from '../../contracts/nameWrapper'
import { DateWithValue, Prettify, SimpleTransactionRequest } from '../../types'
import { EMPTY_ADDRESS } from '../../utils/consts'
import { decodeFuses } from '../../utils/fuses'
import { generateFunction } from '../../utils/generateFunction'
import { makeSafeSecondsDate } from '../../utils/makeSafeSecondsDate'
import { namehash } from '../../utils/normalise'

export type GetWrapperDataParameters = {
  name: string
}

export type GetWrapperDataReturnType = Prettify<{
  fuses: ReturnType<typeof decodeFuses> & {
    value: number
  }
  expiry: DateWithValue<bigint> | null
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
  client: ClientWithEns,
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

const getWrapperData = generateFunction({ encode, decode })

export default getWrapperData
