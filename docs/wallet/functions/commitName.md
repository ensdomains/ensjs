[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [wallet](../api.md) / commitName

# Function: commitName()

> **commitName**\<`chain`, `account`, `chainOverride`\>(`client`, `options`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/registrar/commitName.ts:133

Commits a name to be registered

## Type Parameters

### chain

`chain` *extends* `Chain`

### account

`account` *extends* `Account`

### chainOverride

`chainOverride` *extends* [`ChainWithContracts`](../../chain/type-aliases/ChainWithContracts.md)\<`"ethRegistrar"`\> \| `undefined`

## Parameters

### client

[`RequireClientContracts`](../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ethRegistrar"`, `account`\>

Client

### options

CommitNameOptions

#### duration

`number`

Duration of registration

#### label

`string`

Name's label (the thing before .eth) to register

#### owner

`` `0x${string}` ``

Address to set owner to

#### paymentToken?

`` `0x${string}` ``

Payment token. USDC is used by default

#### referrer?

`` `0x${string}` ``

Referrer address. Optional

#### resolverAddress?

`` `0x${string}` ``

Custom resolver address, defaults to current public resolver deployment

#### secret

`` `0x${string}` ``

Random 32 bytes to use for registration

#### subregistryAddress?

`` `0x${string}` ``

Subregistry address to use for registration

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. CommitNameReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { sepolia } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { commitName } from '@ensdomains/ensjs/wallet'
import { randomSecret } from '@ensdomains/ensjs/utils'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: addEnsContracts(sepolia),
  transport: custom(window.ethereum),
})
const secret = randomSecret()
const hash = await commitName(wallet, {
  label: 'example',
  owner: account,
  duration: 31536000, // 1 year
  secret,
})
// 0x...
```
