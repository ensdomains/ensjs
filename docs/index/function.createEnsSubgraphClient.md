[**@ensdomains/ensjs**](../README.md)

---

> [index](README.md) > createEnsSubgraphClient

# Function: createEnsSubgraphClient()

> **createEnsSubgraphClient**\<`TTransport`, `TChain`\>(`config`): `object`

Creates a ENS Subgraph Client with a given [Transport](https://viem.sh/docs/clients/intro.html) configured for a [Chain](https://viem.sh/docs/clients/chains.html).

## Example

```ts
import { http } from 'viem'
import { mainnet } from 'viem/chains'
import { createEnsSubgraphClient } from '@ensdomains/ensjs'

const client = createEnsSubgraphClient({
  chain: mainnet,
  transport: http(),
})
```

## Type parameters

| Parameter                          |
| :--------------------------------- |
| `TTransport` _extends_ `Transport` |
| `TChain` _extends_ `Chain`         |

## Parameters

| Parameter | Type                                                  | Description             |
| :-------- | :---------------------------------------------------- | :---------------------- |
| `config`  | `EnsSubgraphClientConfig`\< `TTransport`, `TChain` \> | EnsSubgraphClientConfig |

## Returns

An ENS Subgraph Client. EnsSubgraphClient

### getDecodedName

**getDecodedName**: (`parameters`) => `Promise`\< `GetDecodedNameReturnType` \>

Gets the full name for a name with unknown labels from the subgraph.

#### Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts, ensSubgraphActions } from '@ensdomains/ensjs'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
}).extend(ensSubgraphActions)
const result = await client.getDecodedName({
  name: '[5cee339e13375638553bdf5a6e36ba80fb9f6a4f0783680884d92b558aa471da].eth',
})
// ens.eth
```

#### Parameters

| Parameter    | Type                       | Description              |
| :----------- | :------------------------- | :----------------------- |
| `parameters` | `GetDecodedNameParameters` | GetDecodedNameParameters |

#### Returns

`Promise`\< `GetDecodedNameReturnType` \>

Full name, or null if name was not found. GetDecodedNameReturnType

### getNameHistory

**getNameHistory**: (`parameters`) => `Promise`\< `GetNameHistoryReturnType` \>

Gets the history of a name from the subgraph.

#### Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts, ensSubgraphActions } from '@ensdomains/ensjs'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
}).extend(ensSubgraphActions)
const result = await client.getNameHistory({ name: 'ens.eth' })
```

#### Parameters

| Parameter    | Type                       | Description              |
| :----------- | :------------------------- | :----------------------- |
| `parameters` | `GetNameHistoryParameters` | GetNameHistoryParameters |

#### Returns

`Promise`\< `GetNameHistoryReturnType` \>

History object, or null if name could not be found. GetNameHistoryReturnType

### getNamesForAddress

**getNamesForAddress**: (`parameters`) => `Promise`\< `GetNamesForAddressReturnType` \>

Gets the names for an address from the subgraph.

#### Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts, ensSubgraphActions } from '@ensdomains/ensjs'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
}).extend(ensSubgraphActions)
const result = await client.getNamesForAddress({
  address: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
})
```

#### Parameters

| Parameter    | Type                           | Description                  |
| :----------- | :----------------------------- | :--------------------------- |
| `parameters` | `GetNamesForAddressParameters` | GetNamesForAddressParameters |

#### Returns

`Promise`\< `GetNamesForAddressReturnType` \>

Name array. GetNamesForAddressReturnType

### getSubgraphRecords

**getSubgraphRecords**: (`parameters`) => `Promise`\< `GetSubgraphRecordsReturnType` \>

Gets the records for a name from the subgraph

#### Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts, ensSubgraphActions } from '@ensdomains/ensjs'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
}).extend(ensSubgraphActions)
const result = await client.getSubgraphRecords({ name: 'ens.eth' })
// {
//   isMigrated: true,
//   createdAt: { date: 2019-08-26T05:09:01.000Z, value: 1566796141000 },
//   texts: [ 'snapshot', 'url', 'avatar', 'com.twitter', 'com.github' ],
//   coins: [ '60' ]
// }
```

#### Parameters

| Parameter    | Type                           | Description                  |
| :----------- | :----------------------------- | :--------------------------- |
| `parameters` | `GetSubgraphRecordsParameters` | GetSubgraphRecordsParameters |

#### Returns

`Promise`\< `GetSubgraphRecordsReturnType` \>

Record object, or null if name was not found. GetSubgraphRecordsReturnType

### getSubgraphRegistrant

**getSubgraphRegistrant**: (`parameters`) => `Promise`\< `GetSubgraphRegistrantReturnType` \>

Gets the name registrant from the subgraph.

#### Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts, ensSubgraphActions } from '@ensdomains/ensjs'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
}).extend(ensSubgraphActions)
const result = await client.getSubgraphRegistrant({ name: 'ens.eth' })
// 0xb6E040C9ECAaE172a89bD561c5F73e1C48d28cd9
```

#### Parameters

| Parameter    | Type                              | Description                     |
| :----------- | :-------------------------------- | :------------------------------ |
| `parameters` | `GetSubgraphRegistrantParameters` | GetSubgraphRegistrantParameters |

#### Returns

`Promise`\< `GetSubgraphRegistrantReturnType` \>

Registrant address, or null if name was not found. GetSubgraphRegistrantReturnType

### getSubnames

**getSubnames**: (`parameters`) => `Promise`\< `GetSubnamesReturnType` \>

Gets the subnames for a name from the subgraph.

#### Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts, ensSubgraphActions } from '@ensdomains/ensjs'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
}).extend(ensSubgraphActions)
const result = await client.getSubnames({ name: 'ens.eth' })
```

#### Parameters

| Parameter    | Type                    | Description           |
| :----------- | :---------------------- | :-------------------- |
| `parameters` | `GetSubnamesParameters` | GetSubnamesParameters |

#### Returns

`Promise`\< `GetSubnamesReturnType` \>

Subname array. GetSubnamesReturnType

## Source

[packages/ensjs/src/clients/subgraph.ts:49](https://github.com/ensdomains/ensjs-v3/blob/1b90b888/packages/ensjs/src/clients/subgraph.ts#L49)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
