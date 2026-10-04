[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [public](../api.md) / getSupportedInterfaces

# Function: getSupportedInterfaces()

> **getSupportedInterfaces**\<`chain`, `interfaces`\>(`client`, `parameters`): `Promise`\<`GetSupportedInterfacesReturnType`\<`interfaces`\>\>

Defined in: packages/ensjs/src/actions/public/erc165/getSupportedInterfaces.ts:45

Gets the supported interfaces for any contract address.

## Type Parameters

### chain

`chain` *extends* `Chain`

### interfaces

`interfaces` *extends* readonly `` `0x${string}` ``[]

## Parameters

### client

[`RequireClientContracts`](../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"multicall3"`\>

Client

### parameters

`GetSupportedInterfacesParameters`\<`interfaces`\>

GetSupportedInterfacesParameters

## Returns

`Promise`\<`GetSupportedInterfacesReturnType`\<`interfaces`\>\>

Array of booleans matching the input array GetSupportedInterfacesReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getSupportedInterfaces } from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getSupportedInterfaces(client, {
  address: '0x58774Bb8acD458A640aF0B88238369A167546ef2',
  interfaces: ['0x2f435428', '0x23b872dd'],
})
// [true, false]
```
