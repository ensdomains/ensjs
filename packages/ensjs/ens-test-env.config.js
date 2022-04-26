require('dotenv').config({ path: process.env.INIT_CWD + '/.env' })

module.exports = {
  docker: {
    chainId: 3,
    network: 'ropsten',
    forkRpcUrl: process.env.FORK_RPC_URL,
    secretWords: 'test test test test test test test test test test test junk',
    unlockedAccounts: ['0xa303ddC620aa7d1390BACcc8A495508B183fab59'],
  },
  archive: {
    subgraphId: 'QmXxAE7Urtv6TPa8o8XmPwLVQNbH6r35hRKHP63udTxTNa',
    epochTime: 1646894980,
    block: 12066620,
    baseUrl: 'https://storage.googleapis.com/ens-manager-build-data',
  },
  deployCommand: 'yarn hardhat deploy',
  scripts: [],
}
