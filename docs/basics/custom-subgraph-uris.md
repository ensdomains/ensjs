# Custom Subgraph URIs

It's recommended to use an [API key from TheGraph](https://thegraph.com/studio/apikeys/) in production to avoid rate limiting. You can do this by setting the `subgraphApiKey` option of the `addEnsContracts()` function.


```ts
import { http, createClient } from "viem";
import { mainnet } from "viem/chains";
import { addEnsContracts } from "@ensdomains/ensjs";
import { getSubgraphRecords } from "@ensdomains/ensjs/subgraph";

const mainnetWithEns = addEnsContracts(mainnet, {
  subgraphApiKey: "[api-key]",
});

const client = createClient({
  chain: mainnetWithEns,
  transport: http(),
});

const subgraphRecords = await getSubgraphRecords(client, { name: "ens.eth" });
```

If you want to use a self-hosted subgraph, you can enter the full URL like so:

```ts
const mainnetWithEns = addEnsContracts(mainnet);

const chain = {
  ...mainnetWithEns,
  subgraphs: {
    ens: {
      url: "http://localhost:42069/subgraph",
    },
  },
}

const client = createClient({
  chain: mainnetWithEns,
  transport: http(),
});
```