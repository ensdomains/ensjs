[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [dns](../api.md) / isDnsPublicSuffix

# Function: isDnsPublicSuffix()

> **isDnsPublicSuffix**\<`chain`\>(`client`, `parameters`): `Promise`\<`boolean`\>

Defined in: packages/ensjs/src/actions/dns/isDnsPublicSuffix.ts:50

Checks whether a name is accepted by the DNSRegistrar's onchain
`PublicSuffixList` — the claimability gate for `importDnsName()`: a claim
under a suffix outside the list reverts `InvalidPublicSuffix`.

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensLegacyDnsRegistrar"`\>

Client

### parameters

`IsDnsPublicSuffixParameters`

IsDnsPublicSuffixParameters

## Returns

`Promise`\<`boolean`\>

`true` if the suffix is claimable. IsDnsPublicSuffixReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { isDnsPublicSuffix } from '@ensdomains/ensjs/dns'

const client = createPublicClient({
  chain: addEnsL1Contracts(mainnet),
  transport: http(),
})
const claimable = await isDnsPublicSuffix(client, { name: 'xyz' })
```
