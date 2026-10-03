[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [public/v1](../api.md) / getOwner

# Function: getOwner()

> **getOwner**\<`chain`, `contract`\>(`client`, `parameters`): `Promise`\<`GetOwnerReturnType`\<`contract`\>\>

Defined in: packages/ensjs/src/actions/public/v1/registry/getOwner.ts:106

Gets the owner(s) of a name.

## Type Parameters

### chain

`chain` *extends* `Chain`

### contract

`contract` *extends* `OwnerContract` \| `undefined` = `undefined`

## Parameters

### client

[`RequireClientContracts`](../../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensBaseRegistrarImplementation"` \| `"ensNameWrapper"` \| `"ensLegacyRegistry"` \| `"multicall3"`\>

Client

### parameters

`GetOwnerParameters`\<`contract`\>

GetOwnerParameters

## Returns

`Promise`\<`GetOwnerReturnType`\<`contract`\>\>

Owner data object, or `null` if no owners exist. GetOwnerReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getOwner } from '@ensdomains/ensjs/public/v1'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getOwner(client, { name: 'ens.eth' })
// { owner: '0xb6E040C9ECAaE172a89bD561c5F73e1C48d28cd9', registrant: '0xb6E040C9ECAaE172a89bD561c5F73e1C48d28cd9', ownershipLevel: 'registrar }
```
