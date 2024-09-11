/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-await-in-loop */
// eslint-disable-next-line @typescript-eslint/naming-convention
const { BigNumber } = require('ethers')
const { ethers } = require('hardhat')
const {
  makeNameGenerator: makeWrappedNameGenerator,
} = require('../utils/wrappedNameGenerator.cjs')
const {
  makeNameGenerator: makeLegacyNameGenerator,
} = require('../utils/legacyNameGenerator.cjs')
const { makeNonceManager } = require('../utils/nonceManager.cjs')

/**
 * @type {{
 *  label: string
 *  namedOwner: string
 *  namedAddr?: string
 *  type: 'wrapped' | 'legacy'
 *  data?: any[]
 *  reverseRecord?: boolean
 *  fuses?: number
 *  subnames?: {
 *    label: string
 *    namedOwner: string
 *    fuses?: number
 *    expiry?: number
 *  }[]
 *  duration?: number | BigNumber
 * }[]}
 */

const names = [
  {
    label: 'concurrent-legacy-name',
    type: 'legacy',
    namedOwner: 'owner4',
    reverseRecord: true,
  },
  {
    label: 'concurrent-wrapped-name',
    type: 'wrapped',
    namedOwner: 'owner4',
    reverseRecord: true,
    subnames: [
      { label: 'test', namedOwner: 'owner4' },
      { label: 'legacy', namedOwner: 'owner4' },
      { label: 'xyz', namedOwner: 'owner4' },
      { label: 'addr', namedOwner: 'owner4' },
    ],
  },
]

/**
 * @type {import('hardhat-deploy/types').DeployFunction}
 */
const func = async function (hre) {
  const { network } = hre

  const nonceManager = await makeNonceManager(hre)
  const wrappedNameGenerator = await makeWrappedNameGenerator(hre, nonceManager)
  const legacyNameGenerator = await makeLegacyNameGenerator(hre, nonceManager)

  await network.provider.send('evm_setAutomine', [false])

  // Commit
  const commitTxs = await Promise.all(
    names.map(
      ({
        label,
        type,
        namedOwner,
        namedAddr = namedOwner,
        data = [],
        reverseRecord = false,
        fuses = 0,
        subnames,
        duration = 31536000,
      }) => {
        console.log(`Committing commitment for ${label}.eth...`)
        // console.log(
        //   `Committing commitment for ${label}.eth (tx: ${commitTx.hash})...`,
        // )
        let commitTx
        if (type === 'legacy')
          return legacyNameGenerator.commit({
            label,
            namedOwner,
            namedAddr,
          })
        else
          return wrappedNameGenerator.commit({
            label,
            namedOwner,
            data,
            reverseRecord,
            fuses,
            duration,
          })
      },
    ),
    await network.provider.send('evm_mine')
  )

  network.provider.send('evm_mine')
  console.log('committing...')
  await Promise.all(
    commitTxs.map(async (tx) => {
      return tx.wait()
    }),
  )

  console.log('committed')
  const oldTimestamp = (await ethers.provider.getBlock('latest')).timestamp
  await network.provider.send('evm_setNextBlockTimestamp', [oldTimestamp + 60])
  await network.provider.send('evm_increaseTime', [300])
  await network.provider.send('evm_mine')

  // Register
  const registerTxs = await Promise.all(
    names.map(
      ({
        label,
        type,
        namedOwner,
        namedAddr = namedOwner,
        data = [],
        reverseRecord = false,
        fuses = 0,
        subnames,
        duration = 31536000,
      }) => {
        let registerTx
        if (type === 'legacy')
          return legacyNameGenerator.register({
            label,
            namedOwner,
            namedAddr,
          })
        else
          return wrappedNameGenerator.register({
            label,
            namedOwner,
            data,
            reverseRecord,
            fuses,
            duration,
          })
      },
    ),
  )

  await network.provider.send('evm_mine')
  await Promise.all(
    registerTxs.map(async (tx) => {
      return tx.wait()
    }),
  )

  await network.provider.send('evm_setAutomine', [true])

  // Create subnames
  for (const {
    label,
    namedOwner,
    type,
    data = [],
    reverseRecord = false,
    fuses = 0,
    subnames,
    duration = 31536000,
  } of names) {
    if (!subnames) continue
    console.log(`Setting subnames for ${label}.eth...`)
    for (const {
      label: subnameLabel,
      namedOwner: namedSubnameOwner,
      fuses: subnameFuses = 0,
      expiry: subnameExpiry = BigNumber.from(2).pow(64).sub(1),
    } of subnames) {
      let setSubnameTx
      if (type === 'legacy')
        setSubnameTx = await legacyNameGenerator.subname({
          label,
          namedOwner,
          subnameLabel,
          namedSubnameOwner,
        })
      else
        setSubnameTx = await wrappedNameGenerator.subname({
          label,
          namedOwner,
          subnameLabel,
          namedSubnameOwner,
          subnameFuses,
          subnameExpiry,
        })
      console.log(` - ${subnameLabel} (tx: ${setSubnameTx.hash})...`)
      await setSubnameTx.wait()
    }
  }

  console.log(
    'status after registration',
    await network.provider.send('txpool_content'),
  )
  await network.provider.send('evm_mine')
  console.log(
    'status after registration',
    await network.provider.send('txpool_content'),
  )
  
  return true
}

func.id = 'register-concurrent-names'
func.tags = ['register-concurrent-names']
func.dependencies = ['ETHRegistrarController', 'register-wrapped-names']
func.runAtTheEnd = true

module.exports = func
