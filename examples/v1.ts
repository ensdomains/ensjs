import { addEnsContracts } from '@ensdomains/ensjs'
import {
  getExpiry,
  getOwner,
  getWrapperData,
} from '@ensdomains/ensjs/public/v1'
import { decodeFuses, encodeFuses } from '@ensdomains/ensjs/utils'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http('https://ethereum-rpc.publicnode.com'),
})

const name = 'sassal.eth'

const ownership = await getOwner(client, { name })
console.log('Owner:', ownership)

const wrapperData = await getWrapperData(client, { name })
console.log('Wrapper data:', wrapperData)

if (wrapperData) {
  const decoded = decodeFuses(wrapperData.fuses.value)
  console.log('Decoded fuses:', decoded)
  console.log(
    'Re-encoded CANNOT_UNWRAP:',
    encodeFuses({
      restriction: 'child',
      input: { named: ['CANNOT_UNWRAP'] },
    }),
  )
}

const expiry = await getExpiry(client, { name })
console.log('Expiry:', expiry)
