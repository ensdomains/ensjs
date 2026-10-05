import {
  publicResolverAbiSnippet,
  publicResolverTextSnippet,
} from '@ensdomains/ensjs-abi/v1/publicResolver'
import { createPublicClient, encodeFunctionResult, http } from 'viem'
import { mainnet } from 'viem/chains'
import { getRecords } from '../actions/public/resolver/getRecords.js'
import { addEnsContracts } from '../index.js'
import {
  decodeAbiResult,
  decodeAbiResultFromPrimitiveTypes,
} from '../utils/resolver/getAbi.js'
import type { AbiDecodeInput } from './runAbiDecode.js'

const input = JSON.parse(process.argv[2]) as AbiDecodeInput
const decodedData = [BigInt(input.contentType), input.data] as const
const resolverAddress = '0x1234567890123456789012345678901234567890'

try {
  let result: unknown
  if (input.mode === 'primitive') {
    result = await decodeAbiResultFromPrimitiveTypes({ decodedData })
  } else if (input.mode === 'raw') {
    result = await decodeAbiResult(
      encodeFunctionResult({
        abi: publicResolverAbiSnippet,
        functionName: 'ABI',
        result: decodedData,
      }),
      { strict: input.strict },
    )
  } else {
    // Stub only the resolver transport. Record aggregation and decoding stay real.
    const client = Object.assign(
      createPublicClient({
        chain: addEnsContracts(mainnet),
        transport: http(),
      }),
      {
        multicall: async () => [
          { status: 'success', result: 'Avatar survives' },
          { status: 'success', result: decodedData },
        ],
        resolveNameData: async () => ({
          resolverAddress,
          resolvedData: [
            {
              success: true,
              returnData: encodeFunctionResult({
                abi: publicResolverTextSnippet,
                functionName: 'text',
                result: 'Avatar survives',
              }),
            },
            {
              success: true,
              returnData: encodeFunctionResult({
                abi: publicResolverAbiSnippet,
                functionName: 'ABI',
                result: decodedData,
              }),
            },
          ],
        }),
      },
    )
    result = await getRecords(client, {
      name: 'gift.eth',
      texts: ['avatar'],
      abi: true,
      ...(input.mode === 'records-primitive'
        ? { resolver: { address: resolverAddress } }
        : {}),
    })
  }
  console.log(JSON.stringify({ result }))
} catch (error) {
  console.log(JSON.stringify({ error: (error as Error).message }))
}
