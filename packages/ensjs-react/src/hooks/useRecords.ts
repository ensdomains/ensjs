import { PublicENS, QueryConfig } from '../types'
import { useEns } from '../utils/EnsProvider'

import { useCachedQuery } from './useCachedQuery'

type Args = {
  name: Parameters<PublicENS['getRecords']>[0]
} & Parameters<PublicENS['getRecords']>[1] &
  QueryConfig<ReturnType<PublicENS['getRecords']>, Error>

const useRecords = ({
  name,
  onError,
  onSettled,
  onSuccess,
  enabled = true,
  ...arg1
}: Args) => {
  const { ready, getRecords } = useEns()
  return useCachedQuery(
    ['getRecords', { name, ...arg1 }],
    () => getRecords(name, arg1),
    {
      enabled: Boolean(enabled && ready && name),
      onError,
      onSettled,
      onSuccess,
    },
  )
}

export default useRecords
