import { ContractName } from '@ensdomains/ensjs/contracts/types'

import { useEns } from '../utils/EnsProvider'

import useChainId from './useChainId'

const useContractAddress = (contractName: ContractName) => {
  const chainId = useChainId()
  const { getContractAddress } = useEns()
  return getContractAddress(chainId as any)(contractName)
}

export default useContractAddress
