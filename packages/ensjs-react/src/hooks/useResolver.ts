import { PublicENS, QueryConfig } from '../types'
import { useEns } from '../utils/EnsProvider'

import { useCachedQuery } from './useCachedQuery'

type Args = {
  name: string | null | undefined
} & QueryConfig<ReturnType<PublicENS['getResolver']>, Error>

const useResolver = ({
  name,
  onError,
  onSettled,
  onSuccess,
  enabled = true,
}: Args) => {
  const { ready, getResolver } = useEns()
  return useCachedQuery(['getResolver', name], () => getResolver(name!), {
    enabled: Boolean(enabled && ready && name),
    onError,
    onSettled,
    onSuccess,
  })
}

export default useResolver
