import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import type { Hex } from 'viem'

export type AbiDecodeInput = {
  mode: 'primitive' | 'raw' | 'records-primitive' | 'records-raw'
  contentType: string
  data: Hex
  strict?: boolean
}

// A timer in the decoding process cannot interrupt a synchronous infinite loop.
// Keep malicious-input regressions in a child that the parent can terminate.
export function runAbiDecode(input: AbiDecodeInput) {
  const child = spawnSync(
    process.execPath,
    [
      '--import',
      createRequire(import.meta.url).resolve('tsx'),
      fileURLToPath(new URL('./decodeAbiWorker.ts', import.meta.url)),
      JSON.stringify(input),
    ],
    { encoding: 'utf8', timeout: 5000 },
  )
  if (child.error) throw child.error
  if (child.status !== 0) throw new Error(child.stderr)
  return JSON.parse(child.stdout) as { result?: unknown; error?: string }
}
