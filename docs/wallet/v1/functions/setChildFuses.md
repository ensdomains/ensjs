[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [wallet/v1](../api.md) / setChildFuses

# Function: setChildFuses()

> **setChildFuses**\<`chain`, `account`, `chainOverride`\>(`client`, `options`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/v1/nameWrapper/setChildFuses.ts:131

Sets the fuses for a name as the parent.

## Type Parameters

### chain

`chain` *extends* `Chain`

### account

`account` *extends* `Account`

### chainOverride

`chainOverride` *extends* `Chain` \| `undefined`

## Parameters

### client

[`RequireClientContracts`](../../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensNameWrapper"`, `account`\>

Client

### options

SetChildFusesOptions

#### expiry?

`number` \| `bigint`

Expiry to set for fuses

#### fuses

`EncodeFusesInputObject`

Fuse object or number value to set to

#### name

`string`

Name to set child fuses for

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. SetChildFusesReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { setChildFuses } from '@ensdomains/ensjs/wallet/v1'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: addEnsL1Contracts(mainnet),
  transport: custom(window.ethereum),
})
const hash = await setChildFuses(wallet, {
  name: 'sub.ens.eth',
  fuses: {
    parent: {
      named: ['PARENT_CANNOT_CONTROL'],
    },
  },
})
// 0x...
```
