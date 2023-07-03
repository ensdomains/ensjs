import { createEnsPublicClient } from '@ensdomains/ensjs'
import { http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createEnsPublicClient({
  chain: mainnet,
  transport: http('https://web3.ens.domains/v1/mainnet'),
})

const main = async () => {
  const records = await client.getSubgraphRecords({ name: 'ens.eth' })
  const recordData = await client.getRecords({
    name: 'ens.eth',
    records: {
      abi: true,
      contentHash: true,
      ...(records || {}),
    },
  })
  console.log(recordData)
}

main()
