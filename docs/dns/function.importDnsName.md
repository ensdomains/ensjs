[**@ensdomains/ensjs**](../README.md)

---

> [dns](README.md) > importDnsName

# Function: importDnsName()

> **importDnsName**\<`TChain`, `TAccount`, `TChainOverride`\>(`wallet`, `parameters`): `Promise`\< `ImportDnsNameReturnType` \>

Creates a transaction to import a DNS name to ENS.

## Example

```ts
import { createPublicClient, createWalletClient, http, custom } from 'viem'
import { mainnet } from 'viem/chains'
import {
  addContracts,
  prepareDnsImport,
  importDnsName,
} from '@ensdomains/ensjs'

const [mainnetWithEns] = addContracts([mainnet])
const client = createPublicClient({
  chain: mainnetWithEns,
  transport: http(),
})
const wallet = createWalletClient({
  chain: mainnetWithEns,
  transport: custom(window.ethereum),
})
const preparedData = await prepareDnsImport(client, {
  name: 'example.com',
})
const hash = await importDnsName(client, {
  name: 'example.com',
  preparedData,
})
```

## Type parameters

| Parameter                                                | Default        |
| :------------------------------------------------------- | :------------- |
| `TChain` _extends_ `ChainWithEns`                        | -              |
| `TAccount` _extends_ `undefined` \| `Account`            | -              |
| `TChainOverride` _extends_ `undefined` \| `ChainWithEns` | `ChainWithEns` |

## Parameters

| Parameter    | Type                                                                  | Description             |
| :----------- | :-------------------------------------------------------------------- | :---------------------- |
| `wallet`     | `object`                                                              | WalletWithEns           |
| `parameters` | `ImportDnsNameParameters`\< `TChain`, `TAccount`, `TChainOverride` \> | ImportDnsNameParameters |

## Returns

`Promise`\< `ImportDnsNameReturnType` \>

A transaction hash. ImportDnsNameReturnType

## Source

[packages/ensjs/src/functions/dns/importDnsName.ts:146](https://github.com/ensdomains/ensjs-v3/blob/278f5349/packages/ensjs/src/functions/dns/importDnsName.ts#L146)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
