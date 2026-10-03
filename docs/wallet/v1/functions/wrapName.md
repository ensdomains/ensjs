[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [wallet/v1](../api.md) / wrapName

# Function: wrapName()

> **wrapName**\<`name`, `chain`, `account`, `chainOverride`\>(`client`, `options`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/v1/nameWrapper/wrapName.ts:199

Wraps a name.

## Type Parameters

### name

`name` *extends* `string`

### chain

`chain` *extends* `Chain`

### account

`account` *extends* `Account`

### chainOverride

`chainOverride` *extends* [`ChainWithContracts`](../../../chain/type-aliases/ChainWithContracts.md)\<`"ensBaseRegistrarImplementation"` \| `"ensNameWrapper"` \| `"ensPublicResolver"`\>

## Parameters

### client

[`RequireClientContracts`](../../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensBaseRegistrarImplementation"` \| `"ensNameWrapper"` \| `"ensPublicResolver"`, `account`\>

Client

### options

`WrapNameParameters`\<`name`, `chain`, `account`, `chainOverride`\>

WrapNameParameters

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. WrapNameReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { wrapName } from '@ensdomains/ensjs/wallet/v1'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: addEnsL1Contracts(mainnet),
  transport: custom(window.ethereum),
})
const hash = await wrapName(wallet, {
  name: 'ens.eth',
  newOwnerAddress: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
})
// 0x...
```
