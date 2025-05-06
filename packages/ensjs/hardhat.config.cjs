require('dotenv/config')
require('@nomiclabs/hardhat-ethers')
require('hardhat-deploy')
const { resolve } = require('path')

const { execSync } = require('child_process')
const { existsSync } = require('fs')

process.env.BATCH_GATEWAY_URLS = JSON.stringify([
  'https://universal-offchain-unwrapper.ens-cf.workers.dev/',
])

const ensContractsPath = './node_modules/@ensdomains/ens-contracts'

// check if built package exists
// this is required to use ensjs functions in the deploy scripts (which are written in cjs)
const builtCjsExists = existsSync('./dist/cjs/utils/index.js')
if (!builtCjsExists) execSync('pnpm build', { stdio: 'inherit' })

/**
 * @type {import('hardhat/config').HardhatUserConfig}
 */
const config = {
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
      live: false,
      tags: ['test', 'legacy', 'use_root'],
    },
    localhost: {
      saveDeployments: false,
      url: 'http://localhost:8545',
      chainId: 1337,
      live: false,
      tags: ['test', 'legacy', 'use_root'],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    owner: {
      default: 1,
    },
    owner2: 2,
    owner3: 3,
    owner4: 4,
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
}

module.exports = config
