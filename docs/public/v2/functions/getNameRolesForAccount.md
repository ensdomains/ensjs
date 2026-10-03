[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [public/v2](../api.md) / getNameRolesForAccount

# Function: getNameRolesForAccount()

> **getNameRolesForAccount**(`client`, `parameters`): `Promise`\<`GetNameRolesForAccountReturnType`\>

Defined in: packages/ensjs/src/actions/public/v2/registry/getNameRolesForAccount.ts:45

Gets the registry's roles for an account.

## Parameters

### client

`Client`

Client

### parameters

`GetNameRolesForAccountParameters`

GetRolesForAccountParameters

## Returns

`Promise`\<`GetNameRolesForAccountReturnType`\>

Decoded roles bitmap and raw value. GetRolesForAccountReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { getNameRolesForAccount } from '@ensdomains/ensjs/public/v2'

const client = createPublicClient({
  chain: addEnsL1Contracts(mainnet),
  transport: http(),
})

const result = await getNameRolesForAccount(client, {
  registryAddress: '0x0f3eb298470639a96bd548cea4a648bc80b2cee2',
  account: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
  label: 'raffy',
})
```
