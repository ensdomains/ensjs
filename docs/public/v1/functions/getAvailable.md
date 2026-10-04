[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [public/v1](../api.md) / getAvailable

# Function: getAvailable()

> **getAvailable**\<`chain`\>(`client`, `parameters`): `Promise`\<`boolean`\>

Defined in: packages/ensjs/src/actions/public/v1/registrar/getAvailable.ts:54

Gets the availability of a name to register on the legacy v1 BaseRegistrar.

Calls `BaseRegistrarImplementation.available(uint256 id)` where `id` is the
labelhash of the 2LD label as a `uint256`. Use this for the legacy v1
deployment; for v2, use `getAvailable` from `@ensdomains/ensjs/public/v2`.

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensBaseRegistrarImplementation"`\>

Client

### parameters

`GetAvailableParameters`

GetAvailableParameters

## Returns

`Promise`\<`boolean`\>

Availability as boolean. GetAvailableReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getAvailable } from '@ensdomains/ensjs/public/v1'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getAvailable(client, { name: 'ens.eth' })
// false
```
