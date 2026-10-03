[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [wallet/v1](../api.md) / setResolver

# Function: setResolver()

> **setResolver**\<`chain`, `account`, `chainOverride`\>(`client`, `options`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/v1/registry/setResolver.ts:146

Sets a resolver for a name.

## Type Parameters

### chain

`chain` *extends* `Chain`

### account

`account` *extends* `Account`

### chainOverride

`chainOverride` *extends* [`ChainWithContracts`](../../../chain/type-aliases/ChainWithContracts.md)\<`"ensNameWrapper"` \| `"ensRegistry"`\>

## Parameters

### client

[`RequireClientContracts`](../../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensNameWrapper"` \| `"ensRegistry"`, `account`\>

Client

### options

SetResolverOptions

#### contract

`"nameWrapper"` \| `"registry"`

Contract to set resolver on

#### name

`string`

Name to set resolver for

#### resolverAddress

`` `0x${string}` ``

Resolver address to set

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. SetResolverReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { setResolver } from '@ensdomains/ensjs/wallet/v1'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: addEnsContracts(mainnet),
  transport: custom(window.ethereum),
})
const hash = await setResolver(wallet, {
  name: 'ens.eth',
  contract: 'registry',
  resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
})
// 0x...
```
