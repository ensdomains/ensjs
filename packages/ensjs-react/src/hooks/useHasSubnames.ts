import { useQuery } from 'wagmi'

import { useEns } from '../utils/EnsProvider'

import { emptyAddress } from '../utils/constants'
import { checkCachedData } from '../utils/utils'

const FETCH_PAGE_SIZE = 50

type Subnames = {
  id: string
  labelName: string | null
  truncatedName?: string | undefined
  labelhash: string
  isMigrated: boolean
  name: string
  owner: {
    id: string
  }
}[]

const useHasSubnames = (name: string) => {
  const { getSubnames, ready } = useEns()

  const isSubname = name && name.split('.').length > 2

  const { data: hasSubnames, ...query } = useQuery(
    ['getSubnames', name],
    async () => {
      let cursor: Subnames = []
      let done = false

      while (!done) {
        // eslint-disable-next-line no-await-in-loop
        const { subnames } = await getSubnames({
          name,
          lastSubnames: cursor,
          orderBy: 'labelName',
          orderDirection: 'desc',
          pageSize: FETCH_PAGE_SIZE,
        })
        const anyHasOwner = subnames.some(
          (subname) => subname.owner.id !== emptyAddress,
        )
        if (anyHasOwner) {
          return true
        }
        done = subnames.length !== FETCH_PAGE_SIZE
        cursor = subnames
      }

      return false
    },
    {
      enabled: !!(ready && name && isSubname),
    },
  )

  return {
    ...query,
    hasSubnames,
    isCachedData: checkCachedData(query),
  }
}

export default useHasSubnames
