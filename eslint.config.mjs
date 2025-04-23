import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import { defineConfig, globalIgnores } from 'eslint/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react-native/all',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
  ),
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        createDefaultProgram: true,
      },
    },

    rules: {
      'brace-style': 'error',
      'no-console': 'warn', // Warn on console logs
      'no-debugger': 'error', // Prevent debugger statements
      'consistent-return': 'error', // Ensure functions return consistently
      'arrow-body-style': ['error', 'as-needed'], // Prefer concise arrow functions when possible

      // TypeScript-specific rules
      '@typescript-eslint/no-explicit-any': 'warn', // Warn on `any` usage
      '@typescript-eslint/no-non-null-assertion': 'warn', // Avoid `!` non-null assertions

      // React & Hooks rules
      'react/react-in-jsx-scope': 'off', // Not needed in Next.js
      'react/prop-types': 'off', // Not needed for TypeScript
      'react-hooks/rules-of-hooks': 'error', // Enforce React Hooks rules
      'react-hooks/exhaustive-deps': 'warn', // Warn on missing dependencies in useEffect

      // Import rules
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal'],
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/prefer-default-export': 'off', // Allow named exports
      'import/extensions': ['error', 'never'], // No file extensions in imports

      'react/jsx-filename-extension': [
        1,
        {
          extensions: ['.tsx'],
        },
      ],
      quotes: [
        'error',
        'single',
        { avoidEscape: true, allowTemplateLiterals: true },
      ],

      'comma-dangle': ['error', 'always-multiline'],

      'object-curly-spacing': ['error', 'always'],

      'linebreak-style': ['error', 'unix'],

      'no-console': ['warn', { allow: ['warn', 'error'] }],

      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_|^React$' },
      ], // Ignore unused variables starting with _
      'react-native/no-inline-styles': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'react-native/no-color-literals': 'off',

      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { accessibility: 'explicit' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',

      '@typescript-eslint/no-misused-promises': 'off',

      'no-else-return': ['error', { allowElseIf: false }],

      'default-case': 'error',

      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true },
      ],

      'no-param-reassign': ['error', { props: true }],

      'react/function-component-definition': [
        'error',
        { namedComponents: 'arrow-function' },
      ],

      'import/namespace': 'off',
      'react-native/no-raw-text': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {},
      },
    },
  },
  globalIgnores([
    'node_modules/*',
    'assets/*',
    '.vscode/*',
    'android/*',
    'ios/*',
    '.prettierrc.js',
    '.prettierignore',
    '.git',
    'package.json',
    'tsconfig.json',
    '.lintstagedrc',
    '.gitignore',
    'assets',
    'app.json',
    'eas.json',
    '*.config.js',
  ]),
]);
