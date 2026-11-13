# Custom Subgraph URIs

Subgraph actions read the endpoint from `chain.subgraphs.ens.url`. To use a different endpoint, such as a
self-hosted ENSNode instance, override it on the chain you pass to the client.

The default mainnet endpoint is The Graph's shared ENS endpoint, which is rate-limited and can return HTTP 429 under
load. For production, use your own endpoint, for example The Graph gateway with your own API key
(`https://gateway.thegraph.com/api/<API_KEY>/subgraphs/id/5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH`).

```ts
import { http, createPublicClient } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getSubgraphRecords } from '@ensdomains/ensjs/subgraph'

const chain = {
  ...addEnsContracts(mainnet),
  subgraphs: {
    ens: {
      url: 'http://localhost:42069/subgraph',
    },
  },
}

const client = createPublicClient({
  chain,
  transport: http(),
})

const subgraphRecords = await getSubgraphRecords(client, { name: 'ens.eth' })
```
