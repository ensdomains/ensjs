[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [public/v1](../api.md) / getWrapperData

# Function: getWrapperData()

> **getWrapperData**\<`chain`\>(`client`, `parameters`): `Promise`\<`GetWrapperDataReturnType`\>

Defined in: packages/ensjs/src/actions/public/v1/nameWrapper/getWrapperData.ts:61

Gets the wrapper data for a name.

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensNameWrapper"`\>

Client

### parameters

`GetWrapperDataParameters`

GetWrapperDataParameters

## Returns

`Promise`\<`GetWrapperDataReturnType`\>

Wrapper data object, or null if name is not wrapped. GetWrapperDataReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getWrapperData } from '@ensdomains/ensjs/public/v1'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getWrapperData(client, { name: 'ilikelasagna.eth' })
```
