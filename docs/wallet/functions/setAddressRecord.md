[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [wallet](../api.md) / setAddressRecord

# Function: setAddressRecord()

> **setAddressRecord**\<`chain`, `account`, `chainOverride`\>(`client`, `options`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/resolver/setAddressRecord.ts:147

Sets an address record for a name on a resolver.

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

SetAddressRecordParameters

#### coin

`string` \| `number`

Coin ticker or ID to set

#### name

`string`

Name to set address record for

#### resolverAddress

`` `0x${string}` ``

Resolver address to set address record on

#### value

`string` \| `null`

Value to set, null if deleting

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. SetAddressRecordReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { setAddressRecord } from '@ensdomains/ensjs/wallet'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: addEnsL1Contracts(mainnet),
  transport: custom(window.ethereum),
})
const hash = await setAddressRecord(wallet, {
  name: 'ens.eth',
  coin: 'ETH',
  value: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
  resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
})
// 0x...
```
