import { ENS } from '@ensdomains/ensjs'

type PublicInterface<Type> = { [Key in keyof Type]: Type[Key] }

export type PublicENS = PublicInterface<ENS>

export type ReturnedENS = {
  [key in keyof PublicENS]: Awaited<ReturnType<PublicENS[key]>>
}
