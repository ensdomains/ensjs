[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [public/v1](../api.md) / getWrapperName

# Function: getWrapperName()

> **getWrapperName**\<`chain`\>(`client`, `parameters`): `Promise`\<`GetWrapperNameReturnType`\>

Defined in: packages/ensjs/src/actions/public/v1/nameWrapper/getWrapperName.ts:56

Gets the full name for a name with unknown labels from the NameWrapper.

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensNameWrapper"`\>

Client

### parameters

`GetWrapperNameParameters`

GetWrapperNameParameters

## Returns

`Promise`\<`GetWrapperNameReturnType`\>

Full name, or null if name was not found. GetWrapperNameReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { getWrapperName } from '@ensdomains/ensjs/public/v1'

const client = createPublicClient({
  chain: addEnsL1Contracts(mainnet),
  transport: http(),
})
const result = await getWrapperName(client, { name: '[4ca938ec1b323ca71c4fb47a712abb68cce1cabf39ea4d6789e42fbc1f95459b].eth' })
// wrapped.eth
```
