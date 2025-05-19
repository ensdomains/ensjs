// ================================
// Helper types for making custom typescript errors
// ================================

const _errorSymbol = Symbol();

export type TypeError<TMessage extends string> = TMessage & {
	_: typeof _errorSymbol;
};

// Helper type to remove TypeErrors from unions
/**
 * Remove TypeErrors from a union to allow the actual type to be used.
 */
export type ExcludeTE<T> = Exclude<T, TypeError<string>>;

/**
 * Type assertion helper that removes TypeErrors from a union type.
 * This is a no-op function that only exists to help TypeScript's type system.
 * Use this when ExcludeTE type helper alone isn't sufficient to narrow the type.
 */
export function UNWRAP_TYPE_ERROR<T>(_: T): asserts _ is ExcludeTE<T> {}

// ================================
// String type manipulation
// ================================

export declare type UnionToIntersection<U> = (
	U extends any
		? (k: U) => void
		: never
) extends (k: infer I) => void
	? I
	: never;

export type UnionToOvlds<U> = UnionToIntersection<
	U extends any ? (f: U) => void : never
>;
export type PopUnion<U> = UnionToOvlds<U> extends (a: infer A) => void
	? A
	: never;

export type StringConcatenationOrder<
	S extends string,
	SEPARATOR extends string,
> = PopUnion<S> extends infer SELF
	? //
		SELF extends string
		? Exclude<S, SELF> extends never
			? `${SELF}`
			: // This works because the values of S are always interpreted in ascending lexiographical order
				`${StringConcatenationOrder<Exclude<S, SELF>, SEPARATOR>}${SEPARATOR}${SELF}`
		: never
	: never;
