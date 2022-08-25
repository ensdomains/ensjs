import { ENSArgs } from '..'
import { fuseEnum } from '../utils/fuses'
import { namehash } from '../utils/normalise'

type Fuse = keyof typeof fuseEnum

// We need this type so that the following type isn't infinite. This type limits the max length of the fuse array to 7.
type FuseArrayPossibilities =
  | [Fuse]
  | [Fuse, Fuse]
  | [Fuse, Fuse, Fuse]
  | [Fuse, Fuse, Fuse, Fuse]
  | [Fuse, Fuse, Fuse, Fuse, Fuse]
  | [Fuse, Fuse, Fuse, Fuse, Fuse, Fuse]
  | [Fuse, Fuse, Fuse, Fuse, Fuse, Fuse, Fuse]

/**
 * This type creates a type error if there are any duplicate fuses.
 * It effectively works like a reduce function, starting with 0 included types, adding a type each time, and then checking for duplicates.
 *
 * @template A The array to check for duplicates.
 * @template B The union of all checked existing types.
 */
// CLAUSE A: This extension unwraps the type as a fuse tuple.
type FusesWithoutDuplicates<A, B = never> = A extends FuseArrayPossibilities
  ? // CLAUSE A > TRUE: CLAUSE B: Pick out the first item in the current array, separating the current item from the rest.
    A extends [infer Head, ...infer Tail]
    ? // CLAUSE B > TRUE: CLAUSE C: Check if the current item is a duplicate based on the input union.
      Head extends B
      ? // CLAUSE C > TRUE: Duplicate found, return an empty array to throw a type error.
        []
      : // CLAUSE C > FALSE: Return a new array to continue the recursion, adds the current item type to the union.
        [Head, ...FusesWithoutDuplicates<Tail, Head | B>]
    : // CLAUSE B > FALSE: Return the input array as there is no more array elements to check.
      A
  : // CLAUSE A > FALSE: Return an empty array as it isn't a fuse tuple.
    []

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
        `Fuse number must be limited to uint32, ${props.fuseNumberToBurn} was too high.`,
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
