import { PublicENS, QueryConfig } from '../types'
import { useEns } from '../utils/EnsProvider'

import { useCachedQuery } from './useCachedQuery'

type Args = {
  name: string | null | undefined
  contract: Parameters<PublicENS['getOwner']>['1']
} & QueryConfig<ReturnType<PublicENS['getOwner']>, Error>

const useOwner = ({
  name,
  contract,
  onError,
  onSettled,
  onSuccess,
  enabled = true,
}: Args) => {
  const { ready, getOwner } = useEns()
  return useCachedQuery(['getOwner', name], () => getOwner(name!, contract), {
    enabled: Boolean(enabled && ready && name),
    onError,
    onSettled,
    onSuccess,
  })
}

export default useOwner
