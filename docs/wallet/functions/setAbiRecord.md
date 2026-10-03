[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [wallet](../api.md) / setAbiRecord

# Function: setAbiRecord()

> **setAbiRecord**\<`encodeAs`, `chain`, `account`, `chainOverride`\>(`client`, `options`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/resolver/setAbiRecord.ts:149

Sets the ABI for a name on a resolver.

## Type Parameters

### encodeAs

`encodeAs` *extends* `AbiEncodeAs`

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

`SetAbiRecordParameters`\<`encodeAs`, `chain`, `account`, `chainOverride`\>

SetAbiRecordParameters

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. SetAbiRecordReturnType

## Example

```ts
import { createWalletClient, custom, erc20Abi } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { setAbiRecord } from '@ensdomains/ensjs/wallet'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: addEnsL1Contracts(mainnet),
  transport: custom(window.ethereum),
})
const hash = await setAbiRecord(wallet, {
  name: 'ens.eth',
  encodeAs: 'json',
  data: erc20Abi,
  resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
})
// 0x...
```
