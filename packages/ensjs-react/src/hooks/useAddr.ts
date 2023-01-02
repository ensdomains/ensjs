import { PublicENS, QueryConfig } from '../types'
import { useEns } from '../utils/EnsProvider'

import { useCachedQuery } from './useCachedQuery'

type Args = {
  name: string | null | undefined
  coinType: Parameters<PublicENS['getAddr']>[1]
} & QueryConfig<ReturnType<PublicENS['getAddr']>, Error>

const useAddr = ({
  name,
  coinType,
  onError,
  onSettled,
  onSuccess,
  enabled = true,
}: Args) => {
  const { ready, getAddr } = useEns()
  return useCachedQuery(
    ['getAddr', { name, coinType }],
    () => getAddr(name!, coinType),
    {
      enabled: Boolean(enabled && ready && coinType && name),
      onError,
      onSettled,
      onSuccess,
    },
  )
}

export default useAddr
