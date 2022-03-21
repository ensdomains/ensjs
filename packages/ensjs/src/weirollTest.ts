import { Contract, Planner } from '@weiroll/weiroll.js'
import { ethers } from 'ethers'

export default async (
  {
    provider,
    contracts,
  }: {
    provider: ethers.providers.BaseProvider
    contracts: any
  },
  address: string,
) => {
  const reverseNode = address.toLowerCase().substring(2) + '.addr.reverse'
  console.log(ethers.utils.namehash(reverseNode))

  const VM = new ethers.Contract(
    '0xf178d75267cd7EA9DfB6F82Bb1f6e7B8edb43E43',
    [
      'function execute(bytes32[] commands, bytes[] state) public view returns (bytes[])',
    ],
    provider,
  )

  const planner = new Planner()

  const _universalResolver: ethers.Contract =
    await contracts.getUniversalResolver()

  const _publicResolver: ethers.Contract = await contracts.getPublicResolver()

  const universalResolver = Contract.createContract(_universalResolver, 0)
  const publicResolver = Contract.createLibrary(_publicResolver)

  planner.add(universalResolver.registry())
  planner.add(publicResolver.text(ethers.utils.namehash('jefflau.eth'), 'url'))

  const { commands, state } = planner.plan()

  const ret = await VM.execute(commands, state)

  console.log('RETURNED', ret)
  console.log(commands, state)

  return
}
