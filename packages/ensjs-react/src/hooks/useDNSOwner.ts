import { useQuery } from 'wagmi'

import { useEns } from '../utils/EnsProvider'
import { checkCachedData } from '../utils/utils'

const useDNSOwner = (name: string, valid: boolean | undefined) => {
  const { ready, getDNSOwner } = useEns()

  const { data: dnsOwner, ...query } = useQuery(
    ['getDNSOwner', name],
    () => getDNSOwner(name),
    {
      enabled: ready && valid && !name?.endsWith('.eth'),
    },
  )

  return {
    ...query,
    dnsOwner,
    isCachedData: checkCachedData(query),
  }
}

export default useDNSOwner
