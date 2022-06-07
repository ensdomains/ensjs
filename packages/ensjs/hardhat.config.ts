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
    deployer: {
      default: '0xa303ddC620aa7d1390BACcc8A495508B183fab59',
    },
    user: {
      default: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    },
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
      'ETHRegistrarController',
    ],
    except: [
      'INameWrapper',
      'IETHRegistrarController',
      'IReverseRegistrar',
      'NameResolver',
    ],
  },
}

export default config
