[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [wallet/v2](../api.md) / setResolver

# Function: setResolver()

> **setResolver**\<`chain`, `account`, `chainOverride`\>(`client`, `parameters`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/v2/registry/setResolver.ts:112

Sets a resolver for a v2 name.

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

SetResolverParameters

#### label

`string`

Label to set resolver for

#### registryAddress

`` `0x${string}` ``

The v2 registry address

#### resolverAddress

`` `0x${string}` ``

Resolver address to set

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. SetResolverReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { setResolver } from '@ensdomains/ensjs/wallet/v2'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: mainnet,
  transport: custom(window.ethereum),
})
const hash = await setResolver(wallet, {
  label: 'myname',
  registryAddress: '0x1234...', // v2 registry address
  resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
})
// 0x...
```
