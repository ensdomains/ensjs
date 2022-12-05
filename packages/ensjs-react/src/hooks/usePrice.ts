import { useQuery } from 'wagmi'

import { useEns } from '../utils/EnsProvider'
import { checkCachedData, yearsToSeconds } from '../utils/utils'

const usePrice = (nameOrNames: string | string[], legacy?: boolean) => {
  const { ready, getPrice } = useEns()
  const names = Array.isArray(nameOrNames) ? nameOrNames : [nameOrNames]
  const type = legacy ? 'legacy' : 'new'
  const { data, ...query } = useQuery(
    ['usePrice', type, ...names],
    async () => getPrice(nameOrNames, yearsToSeconds(1), legacy),
    {
      enabled: !!(ready && nameOrNames && nameOrNames.length > 0),
    },
  )

  const base = data?.base
  const premium = data?.premium
  const hasPremium = data?.premium.gt(0)

  return {
    ...query,
    base,
    premium,
    hasPremium,
    isCachedData: checkCachedData(query),
  }
}

export default usePrice
