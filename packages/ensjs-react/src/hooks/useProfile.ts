import { useQuery } from 'wagmi'

import { useEns } from '../utils/EnsProvider'
import { checkCachedData } from '../utils/utils'

type Fallback = {
  contentHash?: boolean | undefined
  texts?: string[] | undefined
  coinTypes?: string[] | undefined
}

const useProfile = (name: string, fallback?: Fallback, skip?: any) => {
  const { ready, getProfile } = useEns()

  const { data: profile, ...query } = useQuery(
    ['graph', 'getProfile', name],
    () =>
      getProfile(name, {
        fallback,
      }),
    {
      enabled: ready && !skip && name !== '',
    },
  )

  return {
    ...query,
    profile,
    isCachedData: checkCachedData(query),
  }
}

export default useProfile
