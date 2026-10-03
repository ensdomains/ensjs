[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [wallet/v1](../api.md) / deleteSubname

# Function: deleteSubname()

> **deleteSubname**\<`chain`, `account`, `chainOverride`\>(`client`, `options`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/v1/registry/deleteSubname.ts:212

Deletes a subname

## Type Parameters

### chain

`chain` *extends* `Chain`

### account

`account` *extends* `Account`

### chainOverride

`chainOverride` *extends* [`ChainWithContracts`](../../../chain/type-aliases/ChainWithContracts.md)\<`"ensNameWrapper"` \| `"ensRegistry"`\> \| `undefined`

## Parameters

### client

[`RequireClientContracts`](../../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensNameWrapper"` \| `"ensRegistry"`, `account`\>

Client

### options

DeleteSubnameOptions

#### asOwner?

`boolean`

If true, deletes via owner methods, otherwise will delete via parent owner methods

#### contract

`"nameWrapper"` \| `"registry"`

Contract to delete subname on

#### name

`string`

Subname to delete

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. DeleteSubnameReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { deleteSubname } from '@ensdomains/ensjs/wallet/v1'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: addEnsL1Contracts(mainnet),
  transport: custom(window.ethereum),
})
const hash = await deleteSubname(wallet, {
  name: 'sub.ens.eth',
  contract: 'registry',
})
// 0x...
```
