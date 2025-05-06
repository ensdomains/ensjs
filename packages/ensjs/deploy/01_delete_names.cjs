/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-await-in-loop */
const { ethers } = require('hardhat')
const { namehash, toHex, labelhash } = require('viem')
const { EMPTY_ADDRESS } = require('../dist/cjs/utils/consts')
const { packetToBytes } = require('../dist/cjs/utils/hexEncodedName')

/**
 * @type {import('hardhat-deploy/types').DeployFunction}
 */
const func = async (hre) => {
  const { getNamedAccounts } = hre
  const allNamedAccts = await getNamedAccounts()

  const nameWrapper = await ethers.getContract(
    'NameWrapper',
    await ethers.getSigner(allNamedAccts.owner),
  )
  const registry = await ethers.getContract(
    'ENSRegistry',
    await ethers.getSigner(allNamedAccts.owner),
  )

  /**
   * @param {string} name
   */
  const deleteName = async (name) => {
    const labels = name.split('.')
    const label = labelhash(labels.shift())
    const node = namehash(labels.join('.'))

    const tx = await registry.setSubnodeRecord(
      node,
      label,
      EMPTY_ADDRESS,
      EMPTY_ADDRESS,
      0,
    )
    await tx.wait()
  }

  const name1 = 'wrapped-deleted.deletable.eth'
  const name2 = 'unwrapped-deleted.deletable.eth'

  // wrap wrapped-deleted.deletable.eth
  const approveTx = await registry.setApprovalForAll(nameWrapper.address, true)
  await approveTx.wait()
  const wrapTx = await nameWrapper.wrap(
    toHex(packetToBytes(name1)),
    allNamedAccts.owner,
    EMPTY_ADDRESS,
  )
  await wrapTx.wait()

  await deleteName(name1)
  await deleteName(name2)

  for (const name of [name1, name2]) {
    const owner = await registry.owner(namehash(name))
    if (owner !== EMPTY_ADDRESS) {
      throw new Error(`Failed to delete name ${name}`)
    }
  }

  return true
}

func.id = 'delete-names'
func.tags = ['delete-names']
func.dependencies = ['register-unwrapped-names']
func.runAtTheEnd = true

module.exports = func
