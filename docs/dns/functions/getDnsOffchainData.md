[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [dns](../api.md) / getDnsOffchainData

# Function: getDnsOffchainData()

> **getDnsOffchainData**\<`chain`\>(`client`, `parameters`): `Promise`\<`GetDnsOffchainDataReturnType`\>

Defined in: packages/ensjs/src/actions/dns/getDnsOffchainData.ts:108

Gets the DNS offchain data for a name, via DNS record lookup

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensUniversalResolver"`\>

Client

### parameters

`GetDnsOffchainDataParameters`

GetDnsOffchainDataParameters

## Returns

`Promise`\<`GetDnsOffchainDataReturnType`\>

Resolver address and extra data, or null. GetDnsOffchainDataReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { getDnsOffchainData } from '@ensdomains/ensjs/dns'

const client = createPublicClient({
  chain: addEnsL1Contracts(mainnet),
  transport: http(),
})
const data = await getDnsOffchainData(client, {
  name: 'ethleaderboard.xyz',
})
```
