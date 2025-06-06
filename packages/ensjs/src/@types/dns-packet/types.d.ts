declare module 'dns-packet/types.js' {
  function toType(type: string): number
  // biome-ignore lint/suspicious/noShadowRestrictedNames: type defs
  function toString(type: number): string
}
