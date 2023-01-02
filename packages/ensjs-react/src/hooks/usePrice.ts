import { PublicENS, QueryConfig } from '../types'
import { useEns } from '../utils/EnsProvider'

import { useCachedQuery } from './useCachedQuery'

type Args = {
  nameOrNames: Parameters<PublicENS['getPrice']>['0']
  duration: Parameters<PublicENS['getPrice']>['1']
  legacy?: Parameters<PublicENS['getPrice']>['2']
} & QueryConfig<ReturnType<PublicENS['getPrice']>, Error>

const usePrice = ({
  nameOrNames,
  duration,
  legacy,
  onError,
  onSettled,
  onSuccess,
  enabled = true,
}: Args) => {
  const { ready, getPrice } = useEns()
  return useCachedQuery(
    ['getPrice', { nameOrNames, duration, legacy }],
    () => getPrice(nameOrNames, duration, legacy),
    {
      enabled: Boolean(enabled && ready && nameOrNames),
      onError,
      onSettled,
      onSuccess,
    },
  )
}

export default usePrice
