// Plain .mjs on purpose: tsconfig.json has rootDir ./src and no "include", so any
// .ts/.mts file outside src/ (this config, the tests) would break `tsc` builds.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.mjs'],
    globalSetup: ['./tests/global-setup.mjs'],
    setupFiles: ['./tests/setup.mjs'],
    // first run downloads a mongod binary
    hookTimeout: 120_000,
    testTimeout: 30_000,
  },
});
