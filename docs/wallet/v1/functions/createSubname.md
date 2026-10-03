[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [wallet/v1](../api.md) / createSubname

# Function: createSubname()

> **createSubname**\<`chain`, `account`, `chainOverride`\>(`wallet`, `parameters`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/v1/registry/createSubname.ts:311

Creates a subname

## Type Parameters

### chain

`chain` *extends* `Chain`

### account

`account` *extends* `Account` \| `undefined`

### chainOverride

`chainOverride` *extends* [`ChainWithContracts`](../../../chain/type-aliases/ChainWithContracts.md)\<`"ensNameWrapper"` \| `"ensPublicResolver"`\> \| `undefined` = [`ChainWithContracts`](../../../chain/type-aliases/ChainWithContracts.md)\<`"ensNameWrapper"` \| `"ensPublicResolver"`\>

## Parameters

### wallet

[`RequireClientContracts`](../../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensNameWrapper"` \| `"ensPublicResolver"`, `account`\>

ClientWithAccount

### parameters

`CreateSubnameParameters`\<`chain`, `account`, `chainOverride`\>

CreateSubnameParameters

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. CreateSubnameReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { createSubname } from '@ensdomains/ensjs/wallet/v1'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: addEnsContracts(mainnet),
  transport: custom(window.ethereum),
})
const hash = await createSubname(wallet, {
  name: 'sub.ens.eth',
  owner: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
  contract: 'registry',
})
// 0x...
```
