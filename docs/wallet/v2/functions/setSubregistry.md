[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [wallet/v2](../api.md) / setSubregistry

# Function: setSubregistry()

> **setSubregistry**\<`chain`, `account`, `chainOverride`\>(`client`, `parameters`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/v2/registry/setSubregistry.ts:112

Sets the subregistry for a name in the parent registry.

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

SetSubregistryParameters

#### label

`string`

The label to set the subregistry for

#### registryAddress

`` `0x${string}` ``

The parent registry address

#### subregistryAddress

`` `0x${string}` ``

The subregistry address to assign

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. SetSubregistryReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { setSubregistry } from '@ensdomains/ensjs/wallet/v2'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: mainnet,
  transport: custom(window.ethereum),
})
const hash = await setSubregistry(wallet, {
  registryAddress: '0x...', // parent registry
  label: 'myname',
  subregistryAddress: '0x...', // deployed subregistry
})
// 0x...
```
