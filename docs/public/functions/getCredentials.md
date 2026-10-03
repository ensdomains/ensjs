[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [public](../api.md) / getCredentials

# Function: getCredentials()

> **getCredentials**\<`chain`\>(`client`, `parameters`): `Promise`\<`GetCredentialsReturnType`\>

Defined in: packages/ensjs/src/actions/public/resolver/getCredentials.ts:51

Gets credentials for a name.

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensUniversalResolver"`\>

Client

### parameters

GetCredentialsParameters

#### gatewayUrls?

`string`[]

Batch gateway URLs to use for resolving CCIP-read requests.

#### name

`string`

Name to get text record for

#### strict?

`boolean`

## Returns

`Promise`\<`GetCredentialsReturnType`\>

Credentials, or null if none are found. GetCredentialsReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { getCredentials } from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsL1Contracts(mainnet),
  transport: http(),
})
const result = await getCredentials(client, { name: 'ens.eth' })
// [{ url: 'https://example.com' }]
```
