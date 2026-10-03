[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [public](../api.md) / getAvailable

# Function: getAvailable()

> **getAvailable**\<`chain`\>(`client`, `parameters`): `Promise`\<`boolean`\>

Defined in: packages/ensjs/src/actions/public/registrar/getAvailable.ts:72

Gets the availability of a `.eth` name to register.

For `eth-2ld` names, availability is read from the `.eth` registrar via
`isAvailable`, which accounts for grace periods and premium decay.

For `eth-subname` names, the UniversalHelper's `findParentRegistry`
is used to traverse the registry tree and locate the parent registry, then
the leaf label's status is checked against it.

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensEthRegistrar"` \| `"ensUniversalHelper"`\>

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
import { sepolia } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getAvailable } from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsContracts(sepolia),
  transport: http(),
})

// eth-2ld via the .eth registrar
const a = await getAvailable(client, { name: 'ens.eth' })
// false

// eth-subname with auto-traversal via the UniversalHelper
const b = await getAvailable(client, { name: 'sub.ens.eth' })
```
