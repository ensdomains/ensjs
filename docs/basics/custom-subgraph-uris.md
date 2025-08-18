# Custom Subgraph URIs

If you want to use a custom subgraph endpoint for the chain you are using, such as a local hosted graph-node, you can easily do so by editing the output of `addEnsContracts()`.
Keep in mind though that you can only use custom URIs if not using the default exported ENS clients.

```ts
import { http, createClient } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getSubgraphRecords } from '@ensdomains/ensjs/subgraph'

const mainnetWithEns = addEnsContracts(mainnet)

const chain = {
  ...mainnetWithEns,
  subgraphs: {
    ens: {
      url: 'http://localhost:8000/subgraphs/name/ensdomains/ens',
    },
  },
}

const client = createClient({
  chain,
  transport: http(),
})

const subgraphRecords = await getSubgraphRecords(client, { name: 'ens.eth' })
```
