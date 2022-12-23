<h1 align="center">
  🤖 Bot Net
</h1>

This folder contains a group of scripts to help with creating and deploying algorithms to manage all available RAM on a group of servers.

## 📥 [Simple Batching Algorithm](./algorithms/BatchingAlgorithm.ts)

This is a simple batching algorithm tries to optimize the usage of the network's threads by grouping the requests into batches.

[Source](https://bitburner.readthedocs.io/en/latest/advancedgameplay/hackingalgorithms.html#batch-algorithms-hgw-hwgw-or-cycles)

## 🗳 Batching Algorithm v2

A work in progress re-write of the [Batching Algorithm](./algorithms/BatchingAlgorithm.ts) that uses a more efficient method to determine a target server.

[Source](https://bitburner.readthedocs.io/en/latest/advancedgameplay/hackingalgorithms.html#batch-algorithms-hgw-hwgw-or-cycles)

## 💾 [Hacking Manager](./algorithms/BasicAlgorithm.ts)

The Hacking Manager is an inefficent algorithm that re-uses threads while trying to repeat, grow, weaken hack.

[Source](https://bitburner.readthedocs.io/en/latest/advancedgameplay/hackingalgorithms.html#loop-algorithms)
