[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [dns](../api.md) / getDnsImportData

# Function: getDnsImportData()

> **getDnsImportData**\<`_chain`\>(`client`, `parameters`): `Promise`\<`GetDnsImportDataReturnType`\>

Defined in: packages/ensjs/src/actions/dns/getDnsImportData.ts:60

Gets DNS import data, used for `importDnsName()`

## Type Parameters

### _chain

`_chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../chain/type-aliases/RequireClientContracts.md)\<`_chain`, `"ensLegacyDnssecImpl"`\>

Client

### parameters

`GetDnsImportDataParameters`

GetDnsImportDataParameters

## Returns

`Promise`\<`GetDnsImportDataReturnType`\>

DNS import data object, used for proving the value of the `_ens` TXT record

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { getDnsImportData } from '@ensdomains/ensjs/dns'

const client = createPublicClient({
  chain: addEnsL1Contracts(mainnet),
  transport: http(),
})
const data = await getDnsImportData(client, {
  name: 'example.eth',
})
```
