import { PublicENS, QueryConfig } from '../types'
import { useEns } from '../utils/EnsProvider'

import { useCachedQuery } from './useCachedQuery'

type Args = {
  nameOrAddress: Parameters<PublicENS['getProfile']>[0]
} & Parameters<PublicENS['getProfile']>[1] &
  QueryConfig<ReturnType<PublicENS['getProfile']>, Error>

const useProfile = ({
  nameOrAddress,
  onError,
  onSettled,
  onSuccess,
  enabled = true,
  ...arg1
}: Args) => {
  const { ready, getProfile } = useEns()
  return useCachedQuery(
    ['getProfile', { nameOrAddress, ...arg1 }],
    () => getProfile(nameOrAddress, arg1),
    {
      enabled: Boolean(enabled && ready && nameOrAddress),
      onError,
      onSettled,
      onSuccess,
    },
  )
}

export default useProfile
