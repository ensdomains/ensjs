# Custom Subgraph URIs

It's recommended to set a custom subgraph URL in production to avoid rate limiting. You can do this by setting the `subgraphs` property of the output of `addEnsContracts()`.

For most use cases, you should sign up for a free account with [The Graph](https://thegraph.com/studio/apikeys/) and use the URL they provide. Watch a quick video walkthrough [here](https://x.com/gregskril/status/1800246499831676944).

```ts
import { http, createClient } from "viem";
import { mainnet } from "viem/chains";
import { addEnsContracts } from "@ensdomains/ensjs";
import { getSubgraphRecords } from "@ensdomains/ensjs/subgraph";

const mainnetWithEns = addEnsContracts(mainnet);

const chain = {
  ...mainnetWithEns,
  subgraphs: {
    ens: {
      // Replace [api-key] with your actual API key
      url: "https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH",
    },
  },
};

const client = createClient({
  chain,
  transport: http(),
});

const subgraphRecords = await getSubgraphRecords(client, { name: "ens.eth" });
```
