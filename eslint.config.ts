import js from '@eslint/js';
import globals from 'globals';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import vitest from '@vitest/eslint-plugin';

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'node_modules']),

  // Base JS config
  js.configs.recommended,

  // TypeScript config
  ...tseslint.configs.recommended,

  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactRefresh.configs.vite.rules,
    },
  },

  // Node config files
  {
    files: ['*.config.ts', 'eslint.config.ts'],
    languageOptions: {
      parser: tseslint.parser,
      globals: globals.node,
    },
  },

  // Vitest config
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    plugins: {
      vitest,
    },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
      },
    },
    rules: {
      ...vitest.configs.recommended.rules,
    },
  },

  // Cypress config
  {
    files: ['cypress/**/*.{ts,js}'],
    languageOptions: {
      parser: tseslint.parser,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-namespace': 'off',
    },
  },

  // Disable formatting rules that conflict with Prettier
  eslintConfigPrettier,
]);
