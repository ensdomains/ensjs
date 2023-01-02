import { toUtf8Bytes } from 'ethers/lib/utils.js'
import { useQuery } from 'wagmi'

export const yearsToSeconds = (years: number) => years * 60 * 60 * 24 * 365

export const isLabelTooLong = (label: string) => {
  const bytes = toUtf8Bytes(label)
  return bytes.byteLength > 255
}

export const checkETHName = (labels: string[]) =>
  labels[labels.length - 1] === 'eth'

export const checkETH2LDName = (
  isDotETH: boolean,
  labels: string[],
  canBeShort?: boolean,
) => isDotETH && labels.length === 2 && (canBeShort || labels[0].length >= 3)

export const checkCachedData = ({
  status,
  isFetched,
  isFetchedAfterMount,
}: Omit<ReturnType<typeof useQuery<any>>, 'data'>) =>
  status === 'success' && isFetched && !isFetchedAfterMount
