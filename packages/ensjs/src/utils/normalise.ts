import { toUnicode } from 'idna-uts46-hx'

export const normalise = (name: string) =>
  name ? toUnicode(name, { useStd3ASCII: true }) : name
