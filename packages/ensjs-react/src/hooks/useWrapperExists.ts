import { emptyAddress } from '../utils/constants'
import { useEns } from '../utils/EnsProvider'

import useChainId from './useChainId'

const useWrapperExists = (): boolean => {
  const { ready, getContractAddress } = useEns()
  const chainId = useChainId()
  const nameWrapperAddress = getContractAddress(String(chainId) as any)(
    'NameWrapper',
  )
  return !!(ready && nameWrapperAddress && nameWrapperAddress !== emptyAddress)
}

export default useWrapperExists
