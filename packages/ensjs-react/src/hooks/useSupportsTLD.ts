import { PublicENS, QueryConfig } from '../types'
import { useEns } from '../utils/EnsProvider'

import { useCachedQuery } from './useCachedQuery'

type Args = {
  name: string | null | undefined
} & QueryConfig<ReturnType<PublicENS['supportsTLD']>, Error>

const useSupportsTLD = ({
  name,
  onError,
  onSettled,
  onSuccess,
  enabled = true,
}: Args) => {
  const { ready, supportsTLD } = useEns()
  return useCachedQuery(['supportsTLD', name], () => supportsTLD(name!), {
    enabled: Boolean(enabled && ready && name),
    onError,
    onSettled,
    onSuccess,
  })
}

export default useSupportsTLD
