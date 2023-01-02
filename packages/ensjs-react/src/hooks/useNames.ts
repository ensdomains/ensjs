import { PublicENS, QueryConfig } from '../types'
import { useEns } from '../utils/EnsProvider'

import { useCachedQuery } from './useCachedQuery'

type Args = Parameters<PublicENS['getNames']>[0] &
  QueryConfig<ReturnType<PublicENS['getNames']>, Error>

const useNames = ({
  onError,
  onSettled,
  onSuccess,
  enabled = true,
  ...arg0
}: Args) => {
  const { ready, getNames } = useEns()
  return useCachedQuery(['getNames', arg0], () => getNames(arg0), {
    enabled: Boolean(enabled && ready && arg0.address),
    onError,
    onSettled,
    onSuccess,
  })
}

export default useNames
