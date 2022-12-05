import { useQuery } from 'wagmi'

import { useEns } from '../utils/EnsProvider'
import { checkCachedData } from '../utils/utils'

const usePrimary = (address: string, skip?: any) => {
  const { ready, getName } = useEns()

  const { data, ...query } = useQuery(
    ['getName', address],
    () => getName(address),
    {
      enabled: ready && !skip && address !== '',
      cacheTime: 60,
    },
  )

  return {
    ...query,
    name: data?.match ? data.name : null,
    isCachedData: checkCachedData(query),
  }
}

export default usePrimary
