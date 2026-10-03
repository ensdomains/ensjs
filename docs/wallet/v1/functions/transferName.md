[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [wallet/v1](../api.md) / transferName

# Function: transferName()

> **transferName**\<`contract`, `chain`, `account`, `chainOverride`\>(`client`, `options`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/v1/registry/transferName.ts:279

Transfers a name to a new owner.

## Type Parameters

### contract

`contract` *extends* `TransferNameSupportedContract`

### chain

`chain` *extends* `Chain`

### account

`account` *extends* `Account`

### chainOverride

`chainOverride` *extends* [`ChainWithContracts`](../../../chain/type-aliases/ChainWithContracts.md)\<`"ensBaseRegistrarImplementation"` \| `"ensNameWrapper"` \| `"ensRegistry"`\>

## Parameters

### client

[`RequireClientContracts`](../../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensBaseRegistrarImplementation"` \| `"ensNameWrapper"` \| `"ensRegistry"`, `account`\>

Client

### options

TransferNameOptions

#### asParent?

`contract` *extends* `"registrar"` ? `never` : `boolean`

Transfer name as the parent owner

#### contract

`contract`

Contract to use for transfer

#### name

`string`

Name to transfer

#### newOwnerAddress

`` `0x${string}` ``

Transfer recipient

#### reclaim?

`contract` *extends* `"registrar"` ? `boolean` : `never`

Reclaim ownership as registrant (registrar only)

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. TransferNameReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { transferName } from '@ensdomains/ensjs/wallet/v1'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: addEnsContracts(mainnet),
  transport: custom(window.ethereum),
})
const hash = await transferName(wallet, {
  name: 'ens.eth',
  newOwnerAddress: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
  contract: 'registry',
})
// 0x...
```
