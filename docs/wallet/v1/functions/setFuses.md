[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [wallet/v1](../api.md) / setFuses

# Function: setFuses()

> **setFuses**\<`chain`, `account`, `chainOverride`\>(`client`, `options`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/v1/nameWrapper/setFuses.ts:112

Sets the fuses for a name.

## Type Parameters

### chain

`chain` *extends* `Chain`

### account

`account` *extends* `Account`

### chainOverride

`chainOverride` *extends* [`ChainWithContracts`](../../../chain/type-aliases/ChainWithContracts.md)\<`"ensNameWrapper"`\>

## Parameters

### client

[`RequireClientContracts`](../../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensNameWrapper"`, `account`\>

Client

### options

SetFusesParameters

#### fuses

`EncodeChildFusesInputObject`

Fuse object to set to

#### name

`string`

Name to set fuses for

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. SetFusesReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { setFuses } from '@ensdomains/ensjs/wallet/v1'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: addEnsContracts(mainnet),
  transport: custom(window.ethereum),
})
const hash = await setFuses(wallet, {
  name: 'sub.ens.eth',
  fuses: {
    named: ['CANNOT_TRANSFER'],
  },
})
// 0x...
```
