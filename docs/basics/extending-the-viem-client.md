# Extending the Viem Client

If you want to customise the set of methods that are added to the Viem client instead of using an ENS client, you can extend the Viem client with the provided actions functions.

## Available Actions Functions

- `ensPublicActions`
- `ensWalletActions`
- `ensSubgraphActions`

## Example: Subgraph Only Client

```ts
import { http, createClient } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts, ensSubgraphActions } from '@ensdomains/ensjs'

const client = createClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
}).extend(ensSubgraphActions)

const subgraphRecords = await client.getSubgraphRecords({ name: 'ens.eth' })
```
