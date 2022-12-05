import { useQuery } from 'wagmi'

import { useEns } from '../utils/EnsProvider'
import { checkCachedData } from '../utils/utils'

const useHistory = (name: string, skip?: any) => {
  const { ready, getHistory } = useEns()

  const { data: history, ...query } = useQuery(
    ['graph', 'getHistory', name],
    () => getHistory(name),
    {
      enabled: ready && !skip && name !== '',
    },
  )

  return {
    ...query,
    history,
    isCachedData: checkCachedData(query),
  }
}

export default useHistory
