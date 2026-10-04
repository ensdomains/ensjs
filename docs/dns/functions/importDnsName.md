[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [dns](../api.md) / importDnsName

# Function: importDnsName()

> **importDnsName**\<`TChain`, `TAccount`, `TChainOverride`\>(`wallet`, `parameters`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/dns/importDnsName.ts:153

Creates a transaction to import a DNS name to ENS.

## Type Parameters

### TChain

`TChain` *extends* `Chain`

### TAccount

`TAccount` *extends* `Account` \| `undefined`

### TChainOverride

`TChainOverride` *extends* [`ChainWithContracts`](../../chain/type-aliases/ChainWithContracts.md)\<`ImportDnsNameContracts`\>

## Parameters

### wallet

[`RequireClientContracts`](../../chain/type-aliases/RequireClientContracts.md)\<`TChain`, `ImportDnsNameContracts`, `TAccount`\>

ClientWithAccount

### parameters

`ImportDnsNameParameters`\<`TChain`, `TAccount`, `TChainOverride`\>

ImportDnsNameParameters

## Returns

`Promise`\<`` `0x${string}` ``\>

A transaction hash. ImportDnsNameReturnType

## Example

```ts
import { createPublicClient, createWalletClient, http, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getDnsImportData, importDnsName } from '@ensdomains/ensjs/dns'

const mainnetWithEns = addEnsContracts(mainnet)
const client = createPublicClient({
  chain: mainnetWithEns,
  transport: http(),
})
const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: mainnetWithEns,
  transport: custom(window.ethereum),
})
const dnsImportData = await getDnsImportData(client, {
  name: 'example.com',
})
const hash = await importDnsName(wallet, {
  name: 'example.com',
  dnsImportData,
})
```
