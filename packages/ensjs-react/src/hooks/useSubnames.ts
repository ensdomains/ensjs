import { PublicENS, QueryConfig } from '../types'
import { useEns } from '../utils/EnsProvider'

import { useCachedQuery } from './useCachedQuery'

type Args = Parameters<PublicENS['getSubnames']>[0] &
  QueryConfig<ReturnType<PublicENS['getSubnames']>, Error>

const useSubnames = ({
  onError,
  onSettled,
  onSuccess,
  enabled = true,
  ...arg0
}: Args) => {
  const { ready, getSubnames } = useEns()
  return useCachedQuery(['getSubnames', arg0], () => getSubnames(arg0), {
    enabled: Boolean(enabled && ready && arg0.name),
    onError,
    onSettled,
    onSuccess,
  })
}

export default useSubnames
