import type { ChainWithEns } from '@ensdomains/ensjs/chain'
import {
  type SetRecordsErrorType as ensjs_WriteEnsRecordsErrorType,
  type SetRecordsParameters as ensjs_WriteEnsRecordsParameters,
  type SetRecordsReturnType as ensjs_WriteEnsRecordsReturnType,
  setRecordsWriteParameters,
} from '@ensdomains/ensjs/wallet/v1'
import type { MutateOptions, MutationOptions } from '@tanstack/react-query'
import type { Abi, Account, Chain, Client, Transport } from 'viem'
import { type WriteContractParameters, writeContract } from 'wagmi/actions'
import type { ConfigWithEns } from '../types/config.js'
import type {
  ChainIdParameter,
  ConnectorParameter,
} from '../types/properties.js'
import type { Compute } from '../types/utils.js'

export type WriteEnsRecordsParameters<
  config extends ConfigWithEns = ConfigWithEns,
  chains extends readonly ChainWithEns[] = config['chains'],
> = ensjs_WriteEnsRecordsParameters<chains[number], Account, chains[number]> &
  ConnectorParameter &
  ChainIdParameter<config>

export type WriteEnsRecordsReturnType = ensjs_WriteEnsRecordsReturnType

export type WriteEnsRecordsErrorType = ensjs_WriteEnsRecordsErrorType

export const writeEnsRecords = async <
  config extends ConfigWithEns,
  chains extends readonly ChainWithEns[] = config['chains'],
>(
  config: config,
  {
    name,
    resolverAddress,
    clearRecords,
    contentHash,
    texts,
    coins,
    abi,
    ...transactionParameters
  }: WriteEnsRecordsParameters<config, chains>,
): Promise<WriteEnsRecordsReturnType> => {
  const client = config.getClient({ chainId: transactionParameters.chainId })
  const writeParameters = await setRecordsWriteParameters(
    client as Client<Transport, Chain, Account>,
    {
      name,
      resolverAddress,
      clearRecords,
      contentHash,
      texts,
      coins,
      abi,
    },
  )

  const parameters = {
    ...writeParameters,
    ...transactionParameters,
  } as unknown as WriteContractParameters<
    Abi,
    string,
    readonly unknown[],
    config
  >

  return writeContract(config, parameters)
}

export type WriteEnsRecordsData = Compute<WriteEnsRecordsReturnType>

export type WriteEnsRecordsVariables<config extends ConfigWithEns> =
  WriteEnsRecordsParameters<config>

export type WriteEnsRecordsMutate<
  config extends ConfigWithEns,
  context = unknown,
> = (
  variables: WriteEnsRecordsVariables<config>,
  options?:
    | Compute<
        MutateOptions<
          WriteEnsRecordsData,
          WriteEnsRecordsErrorType,
          Compute<WriteEnsRecordsVariables<config>>,
          context
        >
      >
    | undefined,
) => WriteEnsRecordsData

export type WriteEnsRecordsMutateAsync<
  config extends ConfigWithEns,
  context = unknown,
> = (
  variables: WriteEnsRecordsVariables<config>,
  options?:
    | Compute<
        MutateOptions<
          WriteEnsRecordsData,
          WriteEnsRecordsErrorType,
          Compute<WriteEnsRecordsVariables<config>>,
          context
        >
      >
    | undefined,
) => Promise<WriteEnsRecordsData>

export const writeEnsRecordsMutationOptions = <config extends ConfigWithEns>(
  config: config,
) => {
  return {
    mutationFn(variables) {
      return writeEnsRecords(config, variables)
    },
    mutationKey: ['writeEnsRecords'],
  } as const satisfies MutationOptions<
    WriteEnsRecordsData,
    WriteEnsRecordsErrorType,
    WriteEnsRecordsVariables<config>
  >
}
