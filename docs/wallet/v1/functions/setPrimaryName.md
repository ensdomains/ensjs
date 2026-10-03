[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [wallet/v1](../api.md) / setPrimaryName

# Function: setPrimaryName()

> **setPrimaryName**\<`chain`, `account`, `chainOverride`\>(`client`, `options`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/v1/reverseRegistrar/setPrimaryName.ts:160

Sets a primary name for an address.

## Type Parameters

### chain

`chain` *extends* `Chain`

### account

`account` *extends* `Account`

### chainOverride

`chainOverride` *extends* [`ChainWithContracts`](../../../chain/type-aliases/ChainWithContracts.md)\<`"ensPublicResolver"` \| `"ensReverseRegistrar"`\>

## Parameters

### client

[`RequireClientContracts`](../../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensPublicResolver"` \| `"ensReverseRegistrar"`, `account`\>

Client

### options

`SetPrimaryNameParameters`\<`chain`, `account`, `chainOverride`\>

SetPrimaryNameOptions

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. SetPrimaryNameReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { setPrimaryName } from '@ensdomains/ensjs/wallet/v1'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: addEnsL1Contracts(mainnet),
  transport: custom(window.ethereum),
})
const hash = await setPrimaryName(wallet, {
  name: 'ens.eth',
})
// 0x...
```
