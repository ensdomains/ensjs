[**@ensdomains/ensjs**](../README.md)

---

> [public](README.md) > getSupportedInterfaces

# Function: getSupportedInterfaces()

> **getSupportedInterfaces**\<`TInterfaces`\>(`client`, `parameters`): `Promise`\< `GetSupportedInterfacesReturnType`\< `TInterfaces` \> \>

Gets the supported interfaces for any contract address.

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getSupportedInterfaces } from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getSupportedInterfaces(client, {
  address: '0x58774Bb8acD458A640aF0B88238369A167546ef2',
  interfaces: ['0x2f435428', '0x23b872dd'],
})
// [true, false]
```

## Type parameters

| Parameter                                             |
| :---------------------------------------------------- |
| `TInterfaces` _extends_ _readonly_ \`0x$\{string}\`[] |

## Parameters

| Parameter    | Type                                                  | Description                      |
| :----------- | :---------------------------------------------------- | :------------------------------- |
| `client`     | `ClientWithEns`                                       | ClientWithEns                    |
| `parameters` | `GetSupportedInterfacesParameters`\< `TInterfaces` \> | GetSupportedInterfacesParameters |

## Returns

`Promise`\< `GetSupportedInterfacesReturnType`\< `TInterfaces` \> \>

Array of booleans matching the input array GetSupportedInterfacesReturnType

## Source

[packages/ensjs/src/functions/public/getSupportedInterfaces.ts:106](https://github.com/ensdomains/ensjs-v3/blob/1b90b888/packages/ensjs/src/functions/public/getSupportedInterfaces.ts#L106)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
