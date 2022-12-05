import { useNetwork } from 'wagmi'

const useChainName = () => {
  const { chain, chains } = useNetwork()
  let chainName =
    chain?.network.toLowerCase() || chains[0].network.toLowerCase()
  return chainName === 'homestead' ? 'mainnet' : chainName
}

export default useChainName
