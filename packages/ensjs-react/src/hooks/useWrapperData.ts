import { PublicENS, QueryConfig } from '../types'
import { useEns } from '../utils/EnsProvider'

import { useCachedQuery } from './useCachedQuery'

type Args = {
  name: string | null | undefined
} & QueryConfig<ReturnType<PublicENS['getWrapperData']>, Error>

const useWrapperData = ({
  name,
  onError,
  onSettled,
  onSuccess,
  enabled = true,
}: Args) => {
  const { ready, getWrapperData } = useEns()
  return useCachedQuery(['getWrapperData', name], () => getWrapperData(name!), {
    enabled: Boolean(enabled && ready && name),
    onError,
    onSettled,
    onSuccess,
  })
}

export default useWrapperData
