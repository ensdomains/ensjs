[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [wallet](../api.md) / setTextRecord

# Function: setTextRecord()

> **setTextRecord**\<`chain`, `account`, `chainOverride`\>(`client`, `options`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/resolver/setTextRecord.ts:114

Sets a text record for a name on a resolver.

## Type Parameters

### chain

`chain` *extends* `Chain`

### account

`account` *extends* `Account`

### chainOverride

`chainOverride` *extends* `Chain`

## Parameters

### client

`Client`\<`Transport`, `chain`, `account`\>

Client

### options

SetTextRecordOptions

#### key

`string`

The text record key to set

#### name

`string`

The name to set a text record for

#### resolverAddress

`` `0x${string}` ``

The resolver address to use

#### value

`string` \| `null`

The text record value to set

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. SetTextRecordReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { setTextRecord } from '@ensdomains/ensjs/wallet'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: addEnsContracts(mainnet),
  transport: custom(window.ethereum),
})
const hash = await setTextRecord(wallet, {
  name: 'ens.eth',
  key: 'foo',
  value: 'bar',
  resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
})
// 0x...
```
