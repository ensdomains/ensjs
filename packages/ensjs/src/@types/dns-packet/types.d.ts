declare module 'dns-packet/types' {
  function toType(type: string): number
  function toString(type: number): string
}
