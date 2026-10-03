[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [public/v1](../api.md) / getExpiry

# Function: getExpiry()

> **getExpiry**\<`chain`\>(`client`, `parameters`): `Promise`\<`GetExpiryReturnType`\>

Defined in: packages/ensjs/src/actions/public/v1/registrar/getExpiry.ts:71

Gets the expiry for a name

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensBaseRegistrarImplementation"` \| `"ensNameWrapper"` \| `"ensRegistry"` \| `"multicall3"`\>

Client

### parameters

GetExpiryParameters

#### contract?

`ContractOption`

Optional specific contract to use to get expiry

#### name

`string`

Name to get expiry for

## Returns

`Promise`\<`GetExpiryReturnType`\>

Expiry object, or `null` if no expiry. GetExpiryReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { getExpiry } from '@ensdomains/ensjs/public/v1'

const client = createPublicClient({
  chain: addEnsL1Contracts(mainnet),
  transport: http(),
})
const result = await getExpiry(client, { name: 'ens.eth' })
// { expiry: { date: Date, value: 1913933217n }, gracePeriod: 7776000, status: 'active' }
```
