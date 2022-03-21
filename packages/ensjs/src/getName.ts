import { ethers } from 'ethers'
import { hexEncodeName } from './utils/hexEncodedName'

export default async (
  {
    provider,
    contracts,
  }: { provider: ethers.providers.Provider; contracts: any },
  address: string,
) => {
  const universalResolver: ethers.Contract =
    await contracts.getUniversalResolver()

  const publicResolver: ethers.Contract = await contracts.getPublicResolver()

  const registry: ethers.Contract = await contracts.getRegistry()

  const reverseNode = address.toLowerCase().substring(2) + '.addr.reverse'

  const reverseResolver = await registry.resolver(
    ethers.utils.namehash(reverseNode),
  )

  const rawcall = publicResolver.interface.encodeFunctionData('name', [
    ethers.utils.namehash(reverseNode),
  ])

  const callToContract = await provider.call({
    to: reverseResolver,
    data: rawcall,
  })

  const [reversedName] = publicResolver.interface.decodeFunctionResult(
    'name',
    callToContract,
  )

  const addrCall = publicResolver.interface.encodeFunctionData(
    'addr(bytes32)',
    [ethers.utils.namehash(reversedName)],
  )

  const universalCall = await universalResolver.resolve(
    hexEncodeName(reversedName),
    addrCall,
  )

  const [addr] = publicResolver.interface.decodeFunctionResult(
    'addr(bytes32)',
    universalCall,
  )

  const result = {
    name: reversedName,
    match: addr.toLowerCase() === address.toLowerCase(),
  }

  return result
}
