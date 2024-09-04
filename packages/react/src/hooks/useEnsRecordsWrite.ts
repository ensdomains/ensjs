import { useAccount } from 'wagmi'
import type { ParamWithClients } from '../client.js'

export type UseEnsRecordsWriteParams = ParamWithClients<{}>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
