[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [public/v2](../api.md) / getRoleCounts

# Function: getRoleCounts()

> **getRoleCounts**(`client`, `parameters`): `Promise`\<`GetRoleCountsReturnType`\>

Defined in: packages/ensjs/src/actions/public/v2/registry/getRoleCounts.ts:43

Gets the registry's role counts for a name's label.

## Parameters

### client

`Client`

Client

### parameters

`GetRoleCountsParameters`

GetRoleCountsParameters

## Returns

`Promise`\<`GetRoleCountsReturnType`\>

Decoded and raw role counts. GetRoleCountsReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { getRoleCounts } from '@ensdomains/ensjs/public/v2'

const client = createPublicClient({
  chain: addEnsL1Contracts(mainnet),
  transport: http(),
})
const result = await getRoleCounts(client, { registryAddress: '0x0f3eb298470639a96bd548cea4a648bc80b2cee2', label: 'raffy' })
```
