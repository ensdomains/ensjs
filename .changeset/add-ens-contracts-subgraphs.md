---
"@ensdomains/ensjs": patch
---

Fix `addEnsContracts` setting `chain.subgraphs` to the contract map instead of the ENS subgraph URL, which made subgraph actions fail with chains built by it.
