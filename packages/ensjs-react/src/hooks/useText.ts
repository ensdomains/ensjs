import { PublicENS, QueryConfig } from '../types'
import { useEns } from '../utils/EnsProvider'

import { useCachedQuery } from './useCachedQuery'

type Args = {
  name: string | null | undefined
  key: string
} & QueryConfig<ReturnType<PublicENS['getText']>, Error>

const useText = ({
  name,
  key,
  onError,
  onSettled,
  onSuccess,
  enabled = true,
}: Args) => {
  const { ready, getText } = useEns()
  return useCachedQuery(['getText', { name, key }], () => getText(name!, key), {
    enabled: Boolean(enabled && ready && key && name),
    onError,
    onSettled,
    onSuccess,
  })
}

export default useText
