import type { Register } from 'wagmi'
import type { ConfigWithEns } from './config.js'

export type ResolvedRegister = {
  config: Register extends { config: infer config extends ConfigWithEns }
    ? config
    : ConfigWithEns
}
