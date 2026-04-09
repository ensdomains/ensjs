import type {
  Account,
  Address,
  Chain,
  Client,
  Hash,
  Transport,
  WriteContractErrorType,
  WriteContractParameters,
} from 'viem'
import { type NamehashErrorType, namehash } from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { permissionedResolverClearRecordsSnippet } from '@ensdomains/ensjs-abi/v2/permissionedResolver'
import type {
  Prettify,
  WriteTransactionParameters,
} from '../../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import {
  type ClientWithOverridesErrorType,
  clientWithOverrides,
} from '../../../utils/clientWithOverrides.js'

export type ClearRecordsWriteParametersParameters = {
  name: string
  resolverAddress: Address
}

export type ClearRecordsWriteParametersReturnType = ReturnType<
  typeof clearRecordsWriteParameters
>

export const clearRecordsWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  { name, resolverAddress }: ClearRecordsWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  return {
    address: resolverAddress,
    abi: permissionedResolverClearRecordsSnippet,
    functionName: 'clearRecords',
    args: [namehash(name)],
    chain: client.chain,
    account: client.account,
  } as const
}

export type ClearRecordsParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
> = Prettify<
  ClearRecordsWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type ClearRecordsReturnType = Hash

export type ClearRecordsErrorType =
  | ClientWithOverridesErrorType
  | WriteContractErrorType
  | NamehashErrorType

export async function clearRecords<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  {
    name,
    resolverAddress,
    ...txArgs
  }: ClearRecordsParameters<chain, account, chainOverride>,
): Promise<ClearRecordsReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = clearRecordsWriteParameters(
    clientWithOverrides(client, txArgs),
    {
      name,
      resolverAddress,
    },
  )

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
