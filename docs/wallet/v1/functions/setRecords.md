[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [wallet/v1](../api.md) / setRecords

# Function: setRecords()

> **setRecords**\<`chain`, `account`, `chainOverride`\>(`client`, `options`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/v1/resolver/setRecords.ts:143

Sets multiple records for a name on a resolver.

Individual calls include namehash, uses `multicall(calls)` for batching.

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

### options

SetRecordsParameters

#### abi?

`EncodeAbiParameters` \| `EncodeAbiParameters`[]

ABI value

#### clearRecords?

`boolean`

Clears all current records

#### coins?

`Omit`\<`SetAddrParametersParameters`, `"name"`\>[]

Array of coin records

#### contentHash?

`string` \| `null`

ContentHash value

#### name

`string`

The name to set records for

#### resolverAddress

`` `0x${string}` ``

The resolver address to set records on

#### texts?

`Omit`\<`SetTextParameters`, `"name"`\>[]

Array of text records

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. SetRecordsReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { setRecords } from '@ensdomains/ensjs/wallet/v1'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: addEnsL1Contracts(mainnet),
  transport: custom(window.ethereum),
})
const hash = await setRecords(wallet, {
  name: 'ens.eth',
  coins: [
    {
      coin: 'ETH',
      value: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
    },
  ],
  texts: [{ key: 'foo', value: 'bar' }],
  resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
})
// 0x...
```
