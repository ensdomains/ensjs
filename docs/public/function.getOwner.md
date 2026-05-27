[**@ensdomains/ensjs**](../README.md)

---

> [public](README.md) > getOwner

# Function: getOwner()

> **getOwner**(`client`, `parameters`): `Promise`\< `GetOwnerReturnType` \>

Gets the owner(s) of a name.

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getOwner } from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getOwner(client, { name: 'ens.eth' })
// { owner: '0xb6E040C9ECAaE172a89bD561c5F73e1C48d28cd9', registrant: '0xb6E040C9ECAaE172a89bD561c5F73e1C48d28cd9', ownershipLevel: 'registrar }
```

## Parameters

| Parameter    | Type                 | Description        |
| :----------- | :------------------- | :----------------- |
| `client`     | `ClientWithEns`      | ClientWithEns      |
| `parameters` | `GetOwnerParameters` | GetOwnerParameters |

## Returns

`Promise`\< `GetOwnerReturnType` \>

Owner data object, or `null` if no owners exist. GetOwnerReturnType

## Source

[packages/ensjs/src/functions/public/getOwner.ts:245](https://github.com/ensdomains/ensjs/blob/1b90b888/packages/ensjs/src/functions/public/getOwner.ts#L245)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
