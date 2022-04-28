require('dotenv').config({ path: process.env.INIT_CWD + '/.env' })

/**
 * @type {import('@ensdomains/ens-test-env').ENSTestEnvConfig}
 **/
module.exports = {
  deployCommand: 'yarn hardhat deploy',
  archive: {
    subgraphId: 'QmXxAE7Urtv6TPa8o8XmPwLVQNbH6r35hRKHP63udTxTNa',
    epochTime: 1646894980,
    blockNumber: 12066620,
    baseUrl: 'https://storage.googleapis.com/ens-manager-build-data',
    network: 'ropsten',
  },
  ethereum: {
    chain: {
      chainId: 3,
    },
    fork: {
      url: process.env.FORK_RPC_URL,
    },
    wallet: {
      mnemonic: 'test test test test test test test test test test test junk',
      unlockedAccounts: ['0xa303ddC620aa7d1390BACcc8A495508B183fab59'],
    },
  },
  scripts: [],
}
