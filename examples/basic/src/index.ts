import { addEnsContracts } from '@ensdomains/ensjs'
import { getRecords, resolveNameData } from '@ensdomains/ensjs/public'
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

const main = async () => {
  const recordData = await getRecords(client, {
    name: 'ens.eth',
    abi: true,
    contentHash: true,
  })

  console.log(recordData)

  const batchData = await resolveNameData(client, {
    name: 'ens.eth',
    data: [
      encodeFunctionData(
        getTextParameters({ name: 'ens.eth', key: 'com.twitter' }),
      ),
      encodeFunctionData(
        getAddressParameters({ name: 'ens.eth', coin: 'ETH' }),
      ),
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
}

main()
