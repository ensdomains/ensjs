[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [wallet/v2](../api.md) / createSubname

# Function: createSubname()

> **createSubname**\<`chain`, `account`, `chainOverride`\>(`client`, `parameters`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/v2/registry/createSubname.ts:135

Creates a subname in a UserRegistry using the register function (V2).

## Type Parameters

### chain

`chain` *extends* `Chain`

### account

`account` *extends* `Account`

### chainOverride

`chainOverride` *extends* `Chain` \| `undefined`

## Parameters

### client

`Client`\<`Transport`, `chain`, `account`\>

Client

### parameters

CreateSubnameParameters

#### expires?

`bigint`

The expiration timestamp in seconds (defaults to one year from now)

#### label

`string`

The label of the subname to create

#### owner

`` `0x${string}` ``

The owner address of the new subname

#### registryAddress

`` `0x${string}` ``

The parent registry address

#### resolverAddress

`` `0x${string}` ``

The resolver address for the new subname

#### roleBitmap

`bigint`

The role bitmap to grant to the owner

#### subregistryAddress

`` `0x${string}` ``

The subregistry address for the new subname (use address(0) for no subregistry)

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. CreateSubnameReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { createSubname } from '@ensdomains/ensjs/wallet/v2'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: mainnet,
  transport: custom(window.ethereum),
})
const hash = await createSubname(wallet, {
  registryAddress: '0x...', // parent registry
  label: 'mysubname',
  owner: '0x...',
  subregistryAddress: '0x0000000000000000000000000000000000000000',
  resolverAddress: '0x...',
  roleBitmap: 0n, // or encoded role bitmap
  // expires: optional, defaults to one year from now
})
// 0x...
```
