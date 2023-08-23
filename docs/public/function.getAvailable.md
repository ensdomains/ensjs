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
import { addEnsContracts } from '@ensdomains/ensjs'
import { getAvailable } from '@ensdomains/ensjs/public'

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
| `client`     | `ClientWithEns`          | ClientWithEns          |
| `parameters` | `GetAvailableParameters` | GetAvailableParameters |

## Returns

`Promise`\< `boolean` \>

Availability as boolean. GetAvailableReturnType

## Source

[packages/ensjs/src/functions/public/getAvailable.ts:86](https://github.com/ensdomains/ensjs-v3/blob/62fd2c82/packages/ensjs/src/functions/public/getAvailable.ts#L86)

> **getAvailable**(`client`, ...`args`): `Promise`\< `null` \| `boolean` \>

Gets the availability of a name to register

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getAvailable } from '@ensdomains/ensjs/public'

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
| `client`  | `ClientWithEns`            | ClientWithEns |
| ...`args` | [`GetAvailableParameters`] | -             |

## Returns

`Promise`\< `null` \| `boolean` \>

Availability as boolean. GetAvailableReturnType

## Source

[packages/ensjs/src/utils/generateFunction.ts:41](https://github.com/ensdomains/ensjs-v3/blob/62fd2c82/packages/ensjs/src/utils/generateFunction.ts#L41)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
