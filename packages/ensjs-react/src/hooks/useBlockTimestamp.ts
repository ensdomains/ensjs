import { useProvider, useQuery } from 'wagmi'
import { checkCachedData } from '../utils/utils'

const useBlockTimestamp = () => {
  const provider = useProvider()
  const { data: blockTimestamp, ...query } = useQuery(
    ['use-block-timestamp'],
    async () => {
      const block = await provider.getBlock('latest')
      return block.timestamp * 1000
    },
    {
      enabled: !!provider,
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  )
  return { ...query, blockTimestamp, isCachedData: checkCachedData(query) }
}

export default useBlockTimestamp
