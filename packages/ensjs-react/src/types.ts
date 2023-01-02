import { ENS } from '@ensdomains/ensjs'
import { UseQueryOptions } from '@tanstack/react-query'

type PublicInterface<Type> = { [Key in keyof Type]: Type[Key] }

export type PublicENS = PublicInterface<ENS>

export type ReturnedENS = {
  [key in keyof PublicENS]: Awaited<ReturnType<PublicENS[key]>>
}

export type QueryConfig<Data, Error, Variables = void> = {
  enabled?: UseQueryOptions<Data, Error, Variables>['enabled']
  /** Function fires if mutation encounters error */
  onError?: UseQueryOptions<Data, Error, Variables>['onError']
  /** Function fires when mutation is either successfully fetched or encounters error */
  onSettled?: UseQueryOptions<Data, Error, Variables>['onSettled']
  /** Function fires when mutation is successful and will be passed the mutation's result */
  onSuccess?: UseQueryOptions<Data, Error, Variables>['onSuccess']
}
