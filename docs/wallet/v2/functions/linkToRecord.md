[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [wallet/v2](../api.md) / linkToRecord

# Function: linkToRecord()

> **linkToRecord**\<`chain`, `account`, `chainOverride`\>(`client`, `parameters`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/v2/resolver/linkToRecord.ts:122

Links a name to a record by id on a PermissionedResolver (V2), or unlinks it
when `recordId` is omitted or `0`. An unlinked name reads the resolver's
default record; the previous record stays on the resolver and can be linked
back later. This replaces `clearRecords`.

Requires `ROLE_LINK` on the resolver's root resource.

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

LinkToRecordParameters

#### recordId?

`bigint`

The record id to use, at most `getRecordCount()`. Defaults to
[UNLINKED\_RECORD\_ID](../variables/UNLINKED_RECORD_ID.md), which unlinks the name.

#### resolverAddress

`` `0x${string}` ``

The resolver address

#### sourceName

`string`

The name to re-point

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. LinkToRecordReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { linkToRecord } from '@ensdomains/ensjs/wallet/v2'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: mainnet,
  transport: custom(window.ethereum),
})
// Unlink: the name falls back to the default record
const hash = await linkToRecord(wallet, {
  sourceName: 'alias.eth',
  resolverAddress: '0x...',
})
// 0x...
```
