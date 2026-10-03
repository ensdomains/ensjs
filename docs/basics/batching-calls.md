# Batching Calls

ENSjs read actions go through viem's `readContract` and `multicall` actions, so they use whatever batching is
configured on the client. Enable viem's multicall batching and concurrent reads are aggregated into a single
`eth_call`:

```ts
import { http, createPublicClient } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { getAddressRecord, getTextRecord } from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsL1Contracts(mainnet),
  transport: http(),
  batch: { multicall: true },
})

const [ethAddress, twitterUsername] = await Promise.all([
  getAddressRecord(client, { name: 'ens.eth' }),
  getTextRecord(client, { name: 'ens.eth', key: 'com.twitter' }),
])
```

If you need several records for the same name, `getRecords()` fetches them in a single call regardless of the
client's batching configuration.
