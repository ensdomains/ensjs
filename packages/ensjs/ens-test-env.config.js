require('dotenv').config({ path: process.env.INIT_CWD + '/.env.local' })
require('dotenv').config({
  path: process.env.INIT_CWD + '/.env',
  override: true,
})

process.env.ADDRESS_ETH_REGISTRAR = '0xc5a5C42992dECbae36851359345FE25997F5C42d'
process.env.ADDRESS_NAME_WRAPPER = '0x9E545E3C0baAB3E08CdfD552C960A1050f373042'

/**
 * @type {import('@ensdomains/ens-test-env').ENSTestEnvConfig}
 **/
module.exports = {
  deployCommand: 'yarn hardhat deploy',
  archive: {
    localSubgraphId: 'QmSUnR4AUTQ8CuGH2fK7tFTSSfYGe8BUz6EeBRNavXbE1H',
    subgraphId: 'QmXxAE7Urtv6TPa8o8XmPwLVQNbH6r35hRKHP63udTxTNa',
    epochTime: 1660127653,
    blockNumber: 12066620,
    baseUrl: 'https://storage.googleapis.com/ens-manager-build-data',
    network: 'mainnet',
  },
  ethereum: {
    chain: {
      chainId: 1337,
      time: 1659500634000,
    },
    fork: {
      url: process.env.FORK_RPC_URL,
    },
    wallet: {
      mnemonic: 'test test test test test test test test test test test junk',
    },
  },
  paths: {
    archives: './archives',
    data: './data',
  },
}
