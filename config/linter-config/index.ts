import eslint from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export const baseConfig: ReturnType<typeof defineConfig> = defineConfig(
  eslint.configs.recommended,
  tseslint.configs.stylisticTypeChecked,
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    settings: {
      react: {
        version: '19',
      },
    },
  },
  {
    ignores: ['**/node_modules/', '**/coverage/', '**/dist/', '**/.next/'],
  },
  {
    rules: {
      // We should always use `import type` for type-only imports
      '@typescript-eslint/consistent-type-imports': 'error',
      // A good rule, but we sometimes want to include redundant types for documentation purposes
      '@typescript-eslint/no-redundant-type-constituents': 'warn',
      // Allow the `T[]` syntax for simple types, but require `Array<T>` for more complex types
      // See https://typescript-eslint.io/rules/array-type#array-simple
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'array-simple',
        },
      ],
      // It might have downsides, but I tend to just wrap numbers in template literals in `String()`, so no difference.
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      // For the rule details, see https://typescript-eslint.io/rules/no-unused-vars/
      // For the configuration, see https://eslint.org/docs/latest/rules/no-unused-vars
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      // Used to allow `this: void` in methods, so that @typescript-eslint/unbound-method can be silenced properly
      // note that often, it should be preferable to disable the unbound-method rule instead
      // see https://bsky.app/profile/janis.me/post/3lrgjseighs2s
      '@typescript-eslint/no-invalid-void-type': [
        'error',
        {
          allowAsThisParameter: true,
        },
      ],
    },
  },
);

export const reactConfig: ReturnType<typeof defineConfig> = defineConfig(
  baseConfig,
  // @ts-expect-error https://github.com/jsx-eslint/eslint-plugin-react/issues/3878
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs['recommended-latest'],
);

// Utility exports for easier consumption in other configs
export { eslint, tseslint, defineConfig, globalIgnores };
export type Config = ReturnType<typeof defineConfig>;
