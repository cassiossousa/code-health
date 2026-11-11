import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import { getViteBaseConfig } from './vite.base.config';

export default defineConfig(({ command }) =>
  mergeConfig(
    getViteBaseConfig(command),
    defineConfig({
      test: {
        // If you are testing components client-side, you need to set up a DOM environment.
        // If not all your files should have this environment, you can use a
        // `// @vitest-environment jsdom` comment at the top of the test files instead.
        environment: 'jsdom',
        setupFiles: ['./setupTests.ts'],
        globals: true,
        watch: false,
        coverage: {
          provider: 'v8',
          exclude: [...(configDefaults.coverage.exclude || [])],
        },
      },
    }),
  ),
);
