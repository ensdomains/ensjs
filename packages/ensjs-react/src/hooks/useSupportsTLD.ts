import { useQuery } from 'wagmi'

import { useEns } from '../utils/EnsProvider'
import { checkCachedData } from '../utils/utils'

const useSupportsTLD = (name = '') => {
  const { ready, supportsTLD } = useEns()
  const labels = name?.split('.') || []
  const tld = labels[labels.length - 1]

  const { data: supported, ...query } = useQuery(
    ['supportedTLD', tld],
    () => supportsTLD(tld),
    {
      enabled: ready && !!tld,
    },
  )

  return { ...query, supported, isCachedData: checkCachedData(query) }
}

export default useSupportsTLD
