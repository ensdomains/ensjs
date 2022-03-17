#!/usr/bin/env node
import fs from 'fs/promises'
import ganache from 'ganache'
import path from 'path'

export const main = async (deployContracts, config) => {
  const writeToStdout = process.stdout.write.bind(process.stdout)

  const outputsToIgnore = [
    'eth_getBlockByNumber',
    'eth_getBlockByHash',
    'eth_getTransactionReceipt',
  ]

  process.stdout.write = (chunk, ...args) => {
    if (
      typeof chunk === 'string' &&
      outputsToIgnore.reduce(
        (prev, curr) => prev || chunk.includes(curr),
        false,
      )
    ) {
      return
    }
    return writeToStdout(chunk, ...args)
  }

  const runDeployScripts = async (server) => {
    try {
      const deployments = await fs.readdir(
        path.resolve(process.env.PROJECT_CWD, './deployments'),
      )
      return Promise.all(
        deployments.map((deployment) =>
          import(
            path.resolve(process.env.PROJECT_CWD, './deployments/', deployment)
          ).then((module) => module.default(server)),
        ),
      )
    } catch {
      console.log('No deployments found, skipping...')
      return
    }
  }

  const server = ganache.server({
    chain: {
      chainId: config.ganache.networkId,
    },
    fork: {
      url: config.ganache.rpcUrl,
      blockNumber: config.ganache.block,
    },
    wallet: {
      mnemonic: config.ganache.mnemonic,
    },
  })

  server.listen(config.ganache.port, config.ganache.host, (err) => {
    if (err) throw new Error(err.message)

    console.log('Ganache listening on port 8545')
    if (deployContracts) {
      console.log('Running deployment scripts...')
      runDeployScripts(server)
    }
  })
}
