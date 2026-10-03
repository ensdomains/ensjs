[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [wallet](../api.md) / registerName

# Function: registerName()

> **registerName**\<`chain`, `account`, `chainOverride`\>(`client`, `options`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/registrar/registerName.ts:181

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
import { createPublicClient, createWalletClient, erc20Abi, http, custom } from 'viem'
import { sepolia } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getChainContractAddress } from '@ensdomains/ensjs/chain'
import { getRegisterPrice } from '@ensdomains/ensjs/public'
import { randomSecret } from '@ensdomains/ensjs/utils'
import { commitName, registerName } from '@ensdomains/ensjs/wallet'

const sepoliaWithEns = addEnsContracts(sepolia)
const publicClient = createPublicClient({
  chain: sepoliaWithEns,
  transport: http(),
})
const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: sepoliaWithEns,
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

// Registration is paid in an ERC-20 token (USDC by default), so approve
// the registrar to spend the price first
const usdc = getChainContractAddress({ chain: sepoliaWithEns, contract: 'usdc' })
const registrar = getChainContractAddress({ chain: sepoliaWithEns, contract: 'ensEthRegistrar' })
const { base, premium } = await getRegisterPrice(publicClient, {
  label: params.label,
  duration: BigInt(params.duration),
  paymentToken: usdc,
})
const approveHash = await wallet.writeContract({
  address: usdc,
  abi: erc20Abi,
  functionName: 'approve',
  args: [registrar, base + premium],
})
await publicClient.waitForTransactionReceipt({ hash: approveHash })

const hash = await registerName(wallet, params)
// 0x...
```
