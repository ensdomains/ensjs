import '@ensdomains/hardhat-toolbox-viem-extended'
import '@nomicfoundation/hardhat-viem'
import 'dotenv/config'
import 'hardhat-deploy'

import { resolve } from 'node:path'

import type { HardhatUserConfig } from 'hardhat/config.js'

const ensContractsPath = './node_modules/@ensdomains/ens-contracts'

process.env.BATCH_GATEWAY_URLS = JSON.stringify([
  'https://universal-offchain-unwrapper.ens-cf.workers.dev/',
])

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.13',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  defaultNetwork: 'localhost',
  networks: {
    hardhat: {
      saveDeployments: false,
      chainId: 1337,
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk',
      },
      live: false,
      tags: ['test', 'legacy', 'use_root'],
    },
    localhost: {
      saveDeployments: false,
      url: 'http://localhost:8545',
      chainId: 1337,
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk',
      },
      live: false,
      tags: ['test', 'legacy', 'use_root'],
    },
  },
  // namedAccounts: {
  //   deployer: {
  //     default: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  //   },
  // },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    owner: {
      default: 1,
    },
    owner2: {
      default: 2,
    },
    owner3: {
      default: 3,
    },
    owner4: {
      default: 4,
    },
  },
  external: {
    contracts: [
      {
        artifacts: [
          resolve(ensContractsPath, 'artifacts'),
          resolve(ensContractsPath, './deployments/archive'),
        ],
        deploy: resolve(ensContractsPath, './build/deploy'),
      },
    ],
  },
  paths: {
    artifacts: resolve(ensContractsPath, 'artifacts'),
  },
}

declare module '@nomicfoundation/hardhat-viem/types.js' {
  interface Register {
    config: typeof config
  }
}

export default config
