import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig({
  files: ['**/*.{js,ts}'],
  extends: [js.configs.recommended, tseslint.configs.recommended],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { // esclude le variabili che iniziano con _ dalla regola no-unused-vars
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    '@typescript-eslint/no-empty-object-type': 'off', //Per escludere le interfacce vuote dalla regola no-empty-object-type
  },
});