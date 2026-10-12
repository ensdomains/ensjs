import { addEnsContracts } from '@ensdomains/ensjs'
import { getName, getRecords, resolveNameData } from '@ensdomains/ensjs/public'
import {
  decodeAddressResult,
  decodeTextResult,
  getAddressParameters,
  getTextParameters,
} from '@ensdomains/ensjs/utils'
import { createPublicClient, encodeFunctionData, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http('https://ethereum-rpc.publicnode.com'),
})

const name = 'ens.eth'

const recordData = await getRecords(client, {
  name,
  texts: ['com.twitter'],
  coins: ['ETH'],
  contentHash: true,
  abi: true,
})
console.log(recordData)

const batchData = await resolveNameData(client, {
  name,
  data: [
    encodeFunctionData(getTextParameters({ name, key: 'com.twitter' })),
    encodeFunctionData(getAddressParameters({ name, coin: 'ETH' })),
  ],
})
if (!batchData) throw new Error('No data returned')

console.log(
  'Text:',
  decodeTextResult(batchData.resolvedData[0].returnData, { strict: true }),
)
console.log(
  'Address:',
  decodeAddressResult(batchData.resolvedData[1].returnData, { strict: true }),
)

const address = decodeAddressResult(batchData.resolvedData[1].returnData, {
  coin: 'ETH',
  strict: true,
})
if (address?.value)
  console.log(
    'Primary name:',
    await getName(client, { address: address.value }),
  )
