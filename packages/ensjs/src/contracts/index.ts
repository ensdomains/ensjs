import { ethers } from 'ethers'

export default class ContractManager {
  private provider: ethers.providers.Provider

  constructor(provider: ethers.providers.Provider) {
    this.provider = provider
  }

  private generateContractGetter = (path: string) => {
    let imported: any
    let contract: ethers.Contract
    return async (passedProvider?: any): Promise<ethers.Contract> => {
      if (!imported) {
        imported = (await import(path)).default
      }
      if (passedProvider) {
        return imported(passedProvider) as ethers.Contract
      }
      if (!contract) {
        contract = imported(this.provider) as ethers.Contract
      }
      return contract as ethers.Contract
    }
  }

  public getPublicResolver = this.generateContractGetter('./publicResolver')
  public getUniversalResolver = this.generateContractGetter(
    './universalResolver',
  )
  public getRegistry = this.generateContractGetter('./registry')
}
