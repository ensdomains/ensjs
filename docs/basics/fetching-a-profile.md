# Fetching a Profile

An ENS profile, meaning all associated records for an ENS name, can be fetched by combining subgraph data from
`getSubgraphRecords()` with `getRecords()`. The subgraph tells you which record keys are set; `getRecords()` reads
their values from the resolver.

The subgraph doesn't index wildcard/CCIP names (or anything else resolved offchain), so it's recommended to always
include a set of fallback keys.

```ts
import { http, createPublicClient } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getRecords } from '@ensdomains/ensjs/public'
import { getSubgraphRecords } from '@ensdomains/ensjs/subgraph'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})

const subgraphRecords = await getSubgraphRecords(client, { name: 'ens.eth' })

const records = await getRecords(client, {
  name: 'ens.eth',
  coins: [...(subgraphRecords?.coins || []), 'BTC', 'ETH', 'ETC', 'SOL'],
  texts: [
    ...(subgraphRecords?.texts || []),
    'avatar',
    'email',
    'description',
  ],
  contentHash: true,
  abi: true,
})
```
