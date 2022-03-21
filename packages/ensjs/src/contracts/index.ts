import { ethers } from 'ethers'

export default class ContractManager {
  private provider: ethers.providers.Provider

  constructor(provider: ethers.providers.Provider) {
    this.provider = provider
  }

  private generateContractGetter = (path: string) => {
    let imported: any
    let contract: any
    return async (passedProvider: any) => {
      if (!imported) {
        imported = (await import(path)).default
      }
      if (passedProvider) {
        return imported(passedProvider)
      }
      if (!contract) {
        contract = imported(this.provider)
      }
      return contract
    }
  }

  public getPublicResolver = this.generateContractGetter('./publicResolver')
  public getUniversalResolver = this.generateContractGetter(
    './universalResolver',
  )
}
