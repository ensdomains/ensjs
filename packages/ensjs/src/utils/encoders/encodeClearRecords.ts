import { type Hex, encodeFunctionData } from 'viem'
import { publicResolverClearRecordsSnippet } from '../../contracts/publicResolver.js'

export const encodeClearRecords = (namehash: Hex) =>
  encodeFunctionData({
    abi: publicResolverClearRecordsSnippet,
    functionName: 'clearRecords',
    args: [namehash],
  })
