export const normaliseCoinId = (coinId: string | number) => {
  const isString = typeof coinId === 'string'

  if (isString && Number.isNaN(parseInt(coinId))) {
    return { type: 'name', value: coinId.toUpperCase() } as const
  }
  return {
    type: 'id',
    value: isString ? parseInt(coinId as string) : (coinId as number),
  } as const
}
