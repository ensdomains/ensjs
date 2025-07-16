/** Combines members of an intersection into a readable type. */
// https://twitter.com/mattpocockuk/status/1622730173446557697?s=20&t=NdpAcmEFXY01xkqU3KO0Mg
export type Compute<type> = { [key in keyof type]: type[key] } & unknown

/**
 * Makes all properties of an object optional.
 *
 * Compatible with [`exactOptionalPropertyTypes`](https://www.typescriptlang.org/tsconfig#exactOptionalPropertyTypes).
 */
export type ExactPartial<type> = {
  [key in keyof type]?: type[key] | undefined
}

/** Checks if {@link type} can be narrowed further than {@link type2} */
export type IsNarrowable<type, type2> = IsUnknown<type> extends true
  ? false
  : undefined extends type
    ? false
    : IsNever<
          (type extends type2 ? true : false) &
            (type2 extends type ? false : true)
        > extends true
      ? false
      : true

/**
 * @internal
 * Checks if {@link type} is `never`
 */
export type IsNever<type> = [type] extends [never] ? true : false

/**
 * @internal
 * Checks if {@link type} is `unknown`
 */
export type IsUnknown<type> = unknown extends type ? true : false

/** Merges two object types into new type  */
export type Merge<obj1, obj2> = Compute<
  LooseOmit<obj1, keyof obj2 extends infer key extends string ? key : never> &
    obj2
>

/** Loose version of {@link StrictOmit} */
export type LooseOmit<type, keys extends string> = Pick<
  type,
  Exclude<keyof type, keys>
>
