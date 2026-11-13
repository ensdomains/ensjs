---
"@ensdomains/ensjs": patch
---

Point the default mainnet subgraph at The Graph's shared ENS endpoint (`https://api.thegraph.com/subgraphs/name/ensdomains/ens`). The previous ENSNode host no longer resolves to a running instance. The shared endpoint is rate-limited, so production apps should set their own endpoint via `chain.subgraphs.ens.url`.
