[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [wallet/v1](../api.md) / unwrapName

# Function: unwrapName()

> **unwrapName**\<`name`, `chain`, `account`, `chainOverride`\>(`client`, `options`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/v1/nameWrapper/unwrapName.ts:167

Unwraps a name.

## Type Parameters

### name

`name` *extends* `string`

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

`UnwrapNameParameters`\<`name`, `chain`, `account`, `chainOverride`\>

UnwrapNameParameters

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. UnwrapNameReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { unwrapName } from '@ensdomains/ensjs/wallet/v1'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: addEnsContracts(mainnet),
  transport: custom(window.ethereum),
})
const hash = await unwrapName(wallet, {
  name: 'example.eth',
  newOwnerAddress: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
  newRegistrantAddress: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
})
// 0x...
```
