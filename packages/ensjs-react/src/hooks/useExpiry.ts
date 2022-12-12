import { PublicENS, QueryConfig } from '../types'
import { useEns } from '../utils/EnsProvider'

import { useCachedQuery } from './useCachedQuery'

type Args = {
  name: string | null | undefined
  contract: Parameters<PublicENS['getExpiry']>['1']
} & QueryConfig<ReturnType<PublicENS['getExpiry']>, Error>

const useExpiry = ({
  name,
  contract,
  onError,
  onSettled,
  onSuccess,
  enabled = true,
}: Args) => {
  const { ready, getExpiry } = useEns()
  return useCachedQuery(['getExpiry', name], () => getExpiry(name!, contract), {
    enabled: Boolean(enabled && ready && name),
    onError,
    onSettled,
    onSuccess,
  })
}

export default useExpiry
