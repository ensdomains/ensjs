import { useQuery } from 'wagmi'

import { useEns } from '../utils/EnsProvider'
import { checkCachedData } from '../utils/utils'

const useWrapperData = (name: string, skip?: any) => {
  const { ready, getWrapperData } = useEns()

  const { data: wrapperData, ...query } = useQuery(
    ['getWrapperData', name],
    () => getWrapperData(name),
    {
      enabled: ready && !skip && name !== '',
    },
  )

  return {
    ...query,
    wrapperData,
    isCachedData: checkCachedData(query),
  }
}

export default useWrapperData
