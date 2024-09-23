import { useAccount } from 'wagmi'
import type { ParamWithClients } from '../client.js'

export type UseEnsRecordsWriteParams = ParamWithClients<{}>

/**
 * Allows you to write records to a name, provided the name supports it and the signed in user has the required permissions
 *
 * You can use the {@link resolverInterfaces} shorthand, or manually specify a Hex value
 *
 * @param params - {@link UseEnsResolverInterfacesParams}
 * @returns - {@link boolean[]}
 *
 * @alpha
 */
export const useEnsRecordsWrite = (
  _params: UseEnsRecordsWriteParams,
  config?: any,
) => {
  const { address } = useAccount({ config })
  //   const client = useWalletClient()

  console.log('Hello ', address)

  return { data: undefined }
  //   return setRecords(client as any, params)
}
