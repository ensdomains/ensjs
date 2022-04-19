import 'dotenv/config'
import 'hardhat-deploy'
import { HardhatUserConfig } from 'hardhat/config'

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
    localhost: {
      saveDeployments: false,
      url: 'http://localhost:8545',
      chainId: 3,
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk',
      },
    },
  },
  namedAccounts: {
    deployer: 0,
  },
}

export default config
