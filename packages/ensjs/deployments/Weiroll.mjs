import { ethers } from 'ethers'
import fs from 'fs'
import path from 'path'
import solc from 'solc'

const contracts = './contracts'

const findImports = (ogPath) => (filePath) => {
  let newPath = path.resolve(contracts, ogPath, './' + filePath)
  console.log(newPath)
  if (!fs.existsSync(newPath)) {
    newPath = path.resolve(contracts, ogPath, '../' + filePath)
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
  const address = server.provider.getInitialAccounts()
  const provider = new ethers.providers.Web3Provider(server.provider)
  const deployer = provider.getSigner(Object.keys(address)[0])

  console.log('Deploying Weiroll with account:', deployer._address)

  const CompiledVM = await compile('TestableVM', './')

  const VM = ethers.ContractFactory.fromSolidity(CompiledVM, deployer)

  console.log(VM.interface.format())

  const VMAddress = await deployContract(VM, [])
  console.log('VM Address:', VMAddress)
  return
}
