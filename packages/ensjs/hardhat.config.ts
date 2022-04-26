import '@nomiclabs/hardhat-ethers'
import 'dotenv/config'
import 'hardhat-abi-exporter'
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
  abiExporter: {
    path: './src/ABIs',
    clear: true,
    flat: true,
    only: [
      'StaticMetadataService',
      'NameWrapper',
      'ReverseRegistrar',
      'PublicResolver',
      'UniversalResolver',
      'DoNotCallOnChainUniversalResolverProxy',
    ],
    except: ['INameWrapper', 'IReverseRegistrar', 'NameResolver'],
  },
}

export default config
