import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addContracts } from '../../contracts/addContracts'
import batch from './batch'
import getAddr from './getAddr'
import getName from './getName'

const transport = http('https://web3.ens.domains/v1/mainnet')

const chainsWithEns = addContracts([mainnet])

const publicClient = createPublicClient({
  chain: chainsWithEns[0],
  transport,
})

const main = async () => {
  const result = await batch(
    publicClient,
    getName.batch({ address: '0x8e8Db5CcEF88cca9d624701Db544989C996E3216' }),
    getAddr.batch({ name: 'taytems.eth' }),
    getAddr.batch({ name: 'taytems.eth', coin: '60' }),
  )
  console.log(result)
}

main()
