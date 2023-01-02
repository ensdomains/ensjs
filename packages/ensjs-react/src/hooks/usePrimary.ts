import { PublicENS, QueryConfig } from '../types'
import { useEns } from '../utils/EnsProvider'

import { useCachedQuery } from './useCachedQuery'

type Args = {
  name: string | null | undefined
} & QueryConfig<ReturnType<PublicENS['getName']>, Error>

const usePrimary = ({
  name,
  onError,
  onSettled,
  onSuccess,
  enabled = true,
}: Args) => {
  const { ready, getName } = useEns()
  return useCachedQuery(['getName', name], () => getName(name!), {
    enabled: Boolean(enabled && ready && name),
    onError,
    onSettled,
    onSuccess,
  })
}

export default usePrimary
