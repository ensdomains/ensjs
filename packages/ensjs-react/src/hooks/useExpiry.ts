import { useQuery } from 'wagmi'

import { useEns } from '../utils/EnsProvider'
import { checkCachedData } from '../utils/utils'

const useExpiry = (name: string, skip?: boolean) => {
  const { ready, getExpiry } = useEns()

  const { data, ...query } = useQuery(
    ['useExpiry', name],
    async () => {
      const results = await getExpiry(name)
      return {
        expiry: results?.expiry?.valueOf(),
        gracePeriod: results?.gracePeriod,
      }
    },
    {
      enabled: !skip && ready,
    },
  )

  return {
    ...query,
    expiry: {
      expiry: data?.expiry ? new Date(data.expiry) : undefined,
      gracePeriod: data?.gracePeriod,
    },
    isCachedData: checkCachedData(query),
  }
}

export default useExpiry
