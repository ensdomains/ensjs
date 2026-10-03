[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [chain](../api.md) / RequireClientContracts

# Type Alias: RequireClientContracts\<chain, contracts, account\>

> **RequireClientContracts**\<`chain`, `contracts`, `account`\> = `chain` *extends* `Omit`\<`Chain`, `"contracts"`\> & `object` ? `Client`\<`Transport`, `chain`, `account`\> : `TypeError`\<`` `Chain "${chain["name"]}" is missing required contracts: ${StringConcatenationOrder<contracts, ", ">}` ``\>

Defined in: packages/ensjs/src/clients/chain.ts:468

Type utility that enforces required contract dependencies on the client while providing clear error messages

## Type Parameters

### chain

`chain` *extends* `Chain`

### contracts

`contracts` *extends* `SuggestedContracts`

### account

`account` *extends* `Account` \| `undefined` = `Account` \| `undefined`

## Example

```ts
// Action definition
const myAction = async <chain extends Chain>(
  client: RequireClientContracts<chain, 'ensPublicResolver'>,
) => { ... }

// Example clients
const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const clientWithensL1Contracts = createPublicClient({
  // This adds the required contracts to the chain
  chain: extendChainWithEns(mainnet),
  transport: http(),
})

// This will error
myAction(client) // TypeError<'Chain "mainnet" is missing required contracts: ensPublicResolver'>

// This will not error
myAction(clientWithensL1Contracts)
```
