import { ethers } from 'ethers'
import fs from 'fs'
import fsP from 'fs/promises'
import nModule from 'module'
import path from 'path'
import solc from 'solc'

const pnp = nModule.findPnpApi('./')
const contracts = pnp.resolveToUnqualified(
  'ens-contracts-namewrapper/contracts',
  './',
)

const findImports = (ogPath) => (filePath) => {
  let newPath = path.resolve(contracts, ogPath, './' + filePath)
  if (!fs.existsSync(newPath)) {
    newPath = path.resolve(contracts, ogPath, '../' + filePath)
  }
  if (!fs.existsSync(newPath)) {
    newPath = pnp.resolveToUnqualified(filePath, './')
  }
  return {
    contents: fs.readFileSync(newPath, 'utf8'),
  }
}

async function compile(name, inputPath) {
  const input = JSON.stringify({
    language: 'Solidity',
    sources: {
      [name]: {
        content: fs.readFileSync(
          path.resolve(contracts, inputPath + name + '.sol'),
          'utf8',
        ),
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  })
  const compiled = solc.compile(input, { import: findImports(inputPath) })
  const parsed = JSON.parse(compiled)
  return parsed.contracts[name][name]
}

const deployContract = async (InputContract, args) => {
  const deployment = await InputContract.deploy(...args, {
    gasLimit: 30000000,
  })
  await deployment.deployTransaction.wait()
  return deployment.address
}

export default async (server) => {
  let metadataAddress,
    wrapperAddress,
    resolverAddress,
    metadataHost,
    wrapperArguments,
    resolverArguments,
    metadataArguments
  ;({
    METADATA_ADDRESS: metadataAddress,
    WRAPPER_ADDRESS: wrapperAddress,
    RESOLVER_ADDRESS: resolverAddress,
    METADATA_HOST: metadataHost,
  } = process.env)

  const registryAddress = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
  const registrarAddress = '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85'
  const controllerAddress = '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5'
  const reverseRegisrarAddress = '0x084b1c3C81545d370f3634392De611CaaBFf8148'
  const metadataUrl = `${metadataHost}/name/0x{id}`

  const address = server.provider.getInitialAccounts()
  const provider = new ethers.providers.Web3Provider(server.provider)
  const deployer = provider.getSigner(Object.keys(address)[0])

  console.log('Deploying wrapper with account:', deployer._address)

  const CompiledNameWrapper = await compile('NameWrapper', 'wrapper/')
  const CompiledStaticMetadataService = await compile(
    'StaticMetadataService',
    'wrapper/',
  )
  const CompiledPublicResolver = await compile('PublicResolver', 'resolvers/')

  const NameWrapper = ethers.ContractFactory.fromSolidity(
    CompiledNameWrapper,
    deployer,
  )
  console.log(process.cwd())
  await fsP.writeFile(
    process.cwd() + '/src/ABIs/NameWrapper.json',
    NameWrapper.interface.format(ethers.utils.FormatTypes.json),
  )
  const StaticMetadataService = ethers.ContractFactory.fromSolidity(
    CompiledStaticMetadataService,
    deployer,
  )
  await fsP.writeFile(
    process.cwd() + '/src/ABIs/StaticMetadataService.json',
    StaticMetadataService.interface.format(ethers.utils.FormatTypes.json),
  )
  const PublicResolver = ethers.ContractFactory.fromSolidity(
    CompiledPublicResolver,
    deployer,
  )
  await fsP.writeFile(
    process.cwd() + '/src/ABIs/PublicResolver.json',
    PublicResolver.interface.format(ethers.utils.FormatTypes.json),
  )

  console.log('Setting metadata service URL to:', metadataUrl)
  console.log('Deploying StaticMetadataService...')
  metadataAddress = await deployContract(StaticMetadataService, [metadataUrl])
  console.log('StaticMetadataService Address:', metadataAddress)

  console.log('Deploying NameWrapper...')
  wrapperAddress = await deployContract(NameWrapper, [
    registryAddress,
    registrarAddress,
    metadataAddress,
  ])
  console.log('NameWrapper Address:', wrapperAddress)

  console.log('Deploying Resolver...')
  resolverAddress = await deployContract(PublicResolver, [
    registryAddress,
    wrapperAddress,
    controllerAddress,
    reverseRegisrarAddress,
  ])
  console.log('Resolver Address:', resolverAddress)
  return
}
