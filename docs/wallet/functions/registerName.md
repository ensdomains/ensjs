[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [wallet](../api.md) / registerName

# Function: registerName()

> **registerName**\<`chain`, `account`, `chainOverride`\>(`client`, `options`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/registrar/registerName.ts:170

Registers a name on ENS

## Type Parameters

### chain

`chain` *extends* `Chain`

### account

`account` *extends* `Account`

### chainOverride

`chainOverride` *extends* [`ChainWithContracts`](../../chain/type-aliases/ChainWithContracts.md)\<`"usdc"` \| `"ethRegistrar"`\> \| `undefined`

## Parameters

### client

[`RequireClientContracts`](../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"usdc"` \| `"ethRegistrar"`, `account`\>

Client

### options

RegisterNameOptions

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

Transaction hash. RegisterNameReturnType

## Example

```ts
import { createPublicClient, createWalletClient, http, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { getRegisterPrice } from '@ensdomains/ensjs/public'
import { randomSecret } from '@ensdomains/ensjs/utils'
import { commitName, registerName } from '@ensdomains/ensjs/wallet'

const mainnetWithEns = addEnsL1Contracts(mainnet)
const publicClient = createPublicClient({
  chain: mainnetWithEns,
  transport: http(),
})
const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: mainnetWithEns,
  transport: custom(window.ethereum),
})
const secret = randomSecret()
const params = {
  label: 'example',
  owner: account,
  duration: 31536000, // 1 year
  secret,
}

const commitmentHash = await commitName(wallet, params)
await publicClient.waitForTransactionReceipt({ hash: commitmentHash }) // wait for commitment to finalise
await new Promise((resolve) => setTimeout(resolve, 60 * 1_000)) // wait for commitment to be valid

// Registration is paid in an ERC-20 token (USDC by default). Approve the
// registrar to spend `base + premium` before registering.
const { base, premium } = await getRegisterPrice(publicClient, {
  label: params.label,
  duration: BigInt(params.duration),
  paymentToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
})
const hash = await registerName(wallet, params)
// 0x...
```
