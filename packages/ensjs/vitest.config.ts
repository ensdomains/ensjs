import { defineConfig } from 'vitest/config'

// Shared excludes for all projects.
const baseExclude = ['data/**/*', 'src/actions/subgraph/**/*.test.ts']

// Pure-logic tests: encoders/coders, name utils, fuses/roles, content hash,
// formatting, CCIP helpers, and a couple of actions that only exercise encoding
// against a mocked client. None of these touch the devnet (no publicClient /
// testClient / RPC), so they are completely safe to run in parallel and do not
// depend on chain state or ordering.
//
// Everything NOT matched here touches the shared devnet (reads and/or
// evm_snapshot/evm_revert mutations). Those tests are order- and state-coupled
// to a single serial baseline, so they keep running exactly as before:
// sequentially, in one project (fileParallelism: false).
const pureLogicTests = [
  'src/utils/**/*.test.ts',
  'src/actions/dns/getDnsOwner.test.ts',
  'src/actions/public/getNames.test.ts',
  'src/actions/public/resolveNameData.test.ts',
]

export default defineConfig({
  test: {
    // Root-only options (run once / aggregated across all projects).
    coverage: {
      enabled: true,
      include: ['src/**/*'],
      exclude: ['data/**/*', 'src/test/seedTestNames.ts'],
    },
    globalSetup: ['./src/test/globalSetup.ts'],

    projects: [
      {
        // Pure logic — no devnet, safe to run files in parallel.
        test: {
          name: 'parallel',
          environment: 'node',
          setupFiles: ['./src/test/setup.ts'],
          include: pureLogicTests,
          exclude: baseExclude,
          fileParallelism: true,
        },
      },
      {
        // Everything that touches the shared devnet — reads and snapshot/revert
        // mutators. These are coupled to a single serial baseline, so they run
        // sequentially, exactly as the original single-project config did.
        test: {
          name: 'chain',
          environment: 'node',
          setupFiles: ['./src/test/setup.ts'],
          include: ['src/**/*.test.ts'],
          exclude: [...baseExclude, ...pureLogicTests],
          fileParallelism: false,
          // `fileParallelism: false` does not, by itself, prevent the forks pool
          // from spawning multiple workers in v3 — which breaks global
          // evm_snapshot/evm_revert IDs across files. Pin a single fork so these
          // run strictly one-at-a-time against the shared devnet.
          pool: 'forks',
          poolOptions: { forks: { singleFork: true } },
        },
      },
    ],
  },
})
