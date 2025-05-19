import js from '@eslint/js'
import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*']
  },
  js.configs.recommended,
  {
    files: ['src/**/*.ts', 'examples/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json'
      },
      globals: {
        Buffer: 'readonly',
        process: 'readonly',
        crypto: 'readonly',
        atob: 'readonly',
        fetch: 'readonly',
        console: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': ts,
      prettier
    },
    rules: {
      ...ts.configs.recommended.rules,
      'prettier/prettier': 'error'
    }
  }
]
