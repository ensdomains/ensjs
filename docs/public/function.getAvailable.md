[**@ensdomains/ensjs**](../README.md)

---

> [public](README.md) > getAvailable

# Function: getAvailable()

> **getAvailable**(`client`, `parameters`): `Promise`\< `boolean` \>

Gets the availability of a name to register

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts, getAvailable } from '@ensdomains/ensjs'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getAvailable(client, { name: 'ens.eth' })
// false
```

## Parameters

| Parameter    | Type                     | Description            |
| :----------- | :----------------------- | :--------------------- |
| `client`     | `Object`                 | ClientWithEns          |
| `parameters` | `GetAvailableParameters` | GetAvailableParameters |

## Returns

`Promise`\< `boolean` \>

Availability as boolean. GetAvailableReturnType

## Source

[packages/ensjs/src/functions/public/getAvailable.ts:83](https://github.com/ensdomains/ensjs-v3/blob/278f5349/packages/ensjs/src/functions/public/getAvailable.ts#L83)

> **getAvailable**(`client`, ...`args`): `Promise`\< `null` \| `boolean` \>

Gets the availability of a name to register

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts, getAvailable } from '@ensdomains/ensjs'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getAvailable(client, { name: 'ens.eth' })
// false
```

## Parameters

| Parameter | Type                       | Description   |
| :-------- | :------------------------- | :------------ |
| `client`  | `Object`                   | ClientWithEns |
| ...`args` | [`GetAvailableParameters`] | -             |

## Returns

`Promise`\< `null` \| `boolean` \>

Availability as boolean. GetAvailableReturnType

## Source

[packages/ensjs/src/utils/generateFunction.ts:40](https://github.com/ensdomains/ensjs-v3/blob/278f5349/packages/ensjs/src/utils/generateFunction.ts#L40)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
