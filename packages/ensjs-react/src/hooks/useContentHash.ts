import { PublicENS, QueryConfig } from '../types'
import { useEns } from '../utils/EnsProvider'

import { useCachedQuery } from './useCachedQuery'

type Args = {
  name: string | null | undefined
} & QueryConfig<ReturnType<PublicENS['getContentHash']>, Error>

const useContentHash = ({
  name,
  onError,
  onSettled,
  onSuccess,
  enabled = true,
}: Args) => {
  const { ready, getContentHash } = useEns()
  return useCachedQuery(['getContentHash', name], () => getContentHash(name!), {
    enabled: Boolean(enabled && ready && name),
    onError,
    onSettled,
    onSuccess,
  })
}

export default useContentHash
