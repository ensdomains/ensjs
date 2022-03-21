import { ENSRegistry } from '@ensdomains/ens-contracts'
import { ethers } from 'ethers'

const registryAddress = '0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e'

export default (provider: any) =>
  new ethers.Contract(registryAddress, ENSRegistry, provider)
