import { ENSArgs } from '..'
import { fuseEnum } from '../utils/fuses'
import { namehash } from '../utils/normalise'

type Fuse = keyof typeof fuseEnum
type FuseArrayPossibilities =
  | [Fuse]
  | [Fuse, Fuse]
  | [Fuse, Fuse, Fuse]
  | [Fuse, Fuse, Fuse, Fuse]
  | [Fuse, Fuse, Fuse, Fuse, Fuse]
  | [Fuse, Fuse, Fuse, Fuse, Fuse, Fuse]
  | [Fuse, Fuse, Fuse, Fuse, Fuse, Fuse, Fuse]

type FusesWithoutDuplicates<A, B = never> = A extends FuseArrayPossibilities
  ? A extends [infer Head, ...infer Tail]
    ? Head extends B
      ? []
      : [Head, ...FusesWithoutDuplicates<Tail, Head | B>]
    : A
  : []

type FusePropsArray<A extends FuseArrayPossibilities> = {
  fuseArrayToBurn: FusesWithoutDuplicates<A>
}

type FusePropsNumber = {
  fuseNumberToBurn: number
}

type FuseProps<A extends FuseArrayPossibilities> =
  | FusePropsArray<A>
  | FusePropsNumber

export default async function <A extends FuseArrayPossibilities>(
  { contracts, signer }: ENSArgs<'contracts' | 'signer'>,
  name: string,
  props: FuseProps<A>,
) {
  const isArray = 'fuseArrayToBurn' in props
  if (!isArray) {
    if (props.fuseNumberToBurn > 2 ** 32) {
      throw new Error(
        `Fuse number must be limited to Uin32, ${props.fuseNumberToBurn} was too high.`,
      )
    }
  } else {
    for (const fuse of props.fuseArrayToBurn) {
      if (!(fuse in fuseEnum)) {
        throw new Error(`${fuse} is not a valid fuse`)
      }
    }
  }

  const nameWrapper = (await contracts?.getNameWrapper()!).connect(signer)
  const hash = namehash(name)

  const encodedFuses = isArray
    ? Array.from(props.fuseArrayToBurn).reduce(
        (previousValue: number, currentValue): number => {
          return previousValue + fuseEnum[currentValue as Fuse]
        },
        0,
      )
    : props.fuseNumberToBurn

  return nameWrapper.populateTransaction.setFuses(hash, encodedFuses)
}
