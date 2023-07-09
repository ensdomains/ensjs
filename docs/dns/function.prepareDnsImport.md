[**@ensdomains/ensjs**](../README.md)

---

> [dns](README.md) > prepareDnsImport

# Function: prepareDnsImport()

> **prepareDnsImport**(`client`, `parameters`): `Promise`\< `PrepareDnsImportReturnType` \>

Creates prepared data for `importDnsName()`

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addContracts, prepareDnsImport } from '@ensdomains/ensjs'

const mainnetWithEns = addContracts([mainnet])
const client = createPublicClient({
  chain: mainnetWithEns,
  transport: http(),
})
const preparedData = await prepareDnsImport(client, {
  name: 'example.eth',
})
```

## Parameters

| Parameter    | Type                         | Description                |
| :----------- | :--------------------------- | :------------------------- |
| `client`     | `Object`                     | ClientWithEns              |
| `parameters` | `PrepareDnsImportParameters` | PrepareDnsImportParameters |

## Returns

`Promise`\< `PrepareDnsImportReturnType` \>

Prepared data object

## Source

[packages/ensjs/src/functions/dns/prepareDnsImport.ts:65](https://github.com/ensdomains/ensjs-v3/blob/278f5349/packages/ensjs/src/functions/dns/prepareDnsImport.ts#L65)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
