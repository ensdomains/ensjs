[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [wallet](../api.md) / setContentHashRecord

# Function: setContentHashRecord()

> **setContentHashRecord**\<`chain`, `account`, `chainOverride`\>(`client`, `options`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/resolver/setContentHashRecord.ts:113

Sets the content hash record for a name on a resolver.

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

SetContentHashRecordOptions

#### contentHash

`string` \| `null`

Content hash value

#### name

`string`

Name to set content hash for

#### resolverAddress

`` `0x${string}` ``

The resolver address to use

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. SetContentHashRecordReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { setContentHashRecord } from '@ensdomains/ensjs/wallet'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: addEnsContracts(mainnet),
  transport: custom(window.ethereum),
})
const hash = await setContentHashRecord(wallet, {
  name: 'ens.eth',
  contentHash: 'ipns://k51qzi5uqu5djdczd6zw0grmo23j2vkj9uzvujencg15s5rlkq0ss4ivll8wqw',
  resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
})
// 0x...
```
