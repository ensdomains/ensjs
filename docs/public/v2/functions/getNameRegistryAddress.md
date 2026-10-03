[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [public/v2](../api.md) / getNameRegistryAddress

# Function: getNameRegistryAddress()

> **getNameRegistryAddress**(`client`, `parameters`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/public/v2/registry/getNameRegistryAddress.ts:55

Gets the subregistry (registry for a label) from a parent registry.

This calls `getSubregistry(label)` on the given `registryAddress`.
If no registry is set for the label, this typically returns the zero address.

## Parameters

### client

`Client`

Client

### parameters

`GetNameRegistryAddressParameters`

GetNameRegistryAddressParameters

## Returns

`Promise`\<`` `0x${string}` ``\>

Address of the subregistry, or the zero address if none is set. GetNameRegistryAddressReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { getNameRegistryAddress } from '@ensdomains/ensjs/public/v2'

const client = createPublicClient({
  chain: addEnsL1Contracts(mainnet),
  transport: http(),
})

// Example for label "flo" under the .eth registry
const registryAddress = '0xEthRegistryAddress' as const
const result = await getNameRegistryAddress(client, {
  registryAddress,
  label: 'flo',
})
// result: Address of flo.eth's registry, or 0x000... if none set.
```
