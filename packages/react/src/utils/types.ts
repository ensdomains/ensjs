export type Compute<Type> = { [key in keyof Type]: Type[key] } & unknown
