[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [wallet/v1](../api.md) / clearRecords

# Function: clearRecords()

> **clearRecords**\<`chain`, `account`, `chainOverride`\>(`client`, `options`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/v1/resolver/clearRecords.ts:107

Clears the records for a name on a resolver.

## Type Parameters

### chain

`chain` *extends* `Chain` \| `undefined`

### account

`account` *extends* `Account` \| `undefined`

### chainOverride

`chainOverride` *extends* `Chain` \| `undefined`

## Parameters

### client

`Client`\<`Transport`, `chain`, `account`\>

Client

### options

ClearRecordsParameters

#### name

`string`

The name to clear records for

#### resolverAddress

`` `0x${string}` ``

The resolver address to use

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. ClearRecordsReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { clearRecords } from '@ensdomains/ensjs/wallet/v1'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: addEnsContracts(mainnet),
  transport: custom(window.ethereum),
})
const hash = await clearRecords(wallet, {
  name: 'ens.eth',
  resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
})
// 0x...
```
