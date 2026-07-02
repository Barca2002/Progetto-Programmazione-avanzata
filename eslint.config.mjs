import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig({
  files: ["**/*.{js,ts}"],

  extends: [
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
  ],

  languageOptions: {
    parserOptions: {
      project: true, // usa tsconfig.json automaticamente
    },
  },

  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-empty-object-type": "off", //Non segnalare le interfacce vuote
  },
});