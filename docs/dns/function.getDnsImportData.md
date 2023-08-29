[**@ensdomains/ensjs**](../README.md)

---

> [dns](README.md) > getDnsImportData

# Function: getDnsImportData()

> **getDnsImportData**(`client`, `parameters`): `Promise`\< `GetDnsImportDataReturnType` \>

Gets DNS import data, used for `importDnsName()`

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getDnsImportData } from '@ensdomains/ensjs/dns'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const data = await getDnsImportData(client, {
  name: 'example.eth',
})
```

## Parameters

| Parameter    | Type                         | Description                |
| :----------- | :--------------------------- | :------------------------- |
| `client`     | `ClientWithEns`              | ClientWithEns              |
| `parameters` | `GetDnsImportDataParameters` | GetDnsImportDataParameters |

## Returns

`Promise`\< `GetDnsImportDataReturnType` \>

DNS import data object, used for proving the value of the `_ens` TXT record

## Source

[packages/ensjs/src/functions/dns/getDnsImportData.ts:65](https://github.com/ensdomains/ensjs-v3/blob/1b90b888/packages/ensjs/src/functions/dns/getDnsImportData.ts#L65)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
