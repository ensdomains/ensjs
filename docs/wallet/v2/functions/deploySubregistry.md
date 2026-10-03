[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [wallet/v2](../api.md) / deploySubregistry

# Function: deploySubregistry()

> **deploySubregistry**\<`chain`, `account`, `chainOverride`\>(`client`, `options`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/v2/verifiableFactory/deploySubregistry.ts:150

Deploys a subregistry contract via a verifiable proxy factory.

## Type Parameters

### chain

`chain` *extends* `Chain`

### account

`account` *extends* `Account`

### chainOverride

`chainOverride` *extends* `Chain` \| `undefined`

## Parameters

### client

`Client`\<`Transport`, `chain`, `account`\>

Client

### options

DeploySubregistryParameters

#### adminAddress?

`` `0x${string}` ``

The admin address for the subregistry (defaults to client.account.address)

#### factoryAddress

`` `0x${string}` ``

The factory contract address

#### implAddress

`` `0x${string}` ``

The subregistry implementation contract address

#### roleBitmap?

`bigint`

The role bitmap for the admin (defaults to full permissions)

#### salt?

`bigint`

The salt for proxy deployment.
If omitted, a random 256-bit salt is drawn on every call, so each call
encodes a different deploy. Pass one when the same deploy has to be built
more than once (e.g. for a gas estimate and then the send).

The factory derives the proxy address from `(msg.sender, salt)`, so an
account reusing a salt targets an address it already occupies and the
deploy reverts.

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. DeploySubregistryReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { deploySubregistry } from '@ensdomains/ensjs/wallet/v2'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: addEnsContracts(mainnet),
  transport: custom(window.ethereum),
})
const hash = await deploySubregistry(wallet, {
  factoryAddress: '0x24e32c34effb021cc360b6a4e1de2850dcc59956',
  implAddress: '0xc3ae19b222d527d3cdda617953ab878a35527e54',
})
// 0x...
```
