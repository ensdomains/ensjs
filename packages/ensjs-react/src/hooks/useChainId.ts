import { useNetwork } from 'wagmi'

const useChainId = (): number => {
  const { chain, chains } = useNetwork()
  if (chain) {
    return chain.id ?? null
  }
  return chains[0].id
}

export default useChainId
