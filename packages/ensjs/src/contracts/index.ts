const generateContractGetter = (
  path: string,
  contractStore: any,
  provider: any,
) => {
  return async (passedProvider: any) => {
    const importedContract = (await import(path)).default
    if (contractStore && !passedProvider) {
      return importedContract
    }
    if (passedProvider) {
      return importedContract(passedProvider)
    }
    contractStore = importedContract(provider)
    return contractStore
  }
}

export default (provider: any) => {
  let publicResolver: any
  let universalResolver: any

  return {
    getPublicResolver: generateContractGetter(
      './publicResolver',
      publicResolver,
      provider,
    ),
    getUniversalResolver: generateContractGetter(
      './universalResolver',
      universalResolver,
      provider,
    ),
  }
}
