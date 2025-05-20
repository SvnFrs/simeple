import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import json from "@eslint/json";
// import { FlatCompat } from "@eslint/eslintrc";
// import path from "path";
// import { fileURLToPath } from "url";

// // Get directory name in ESM
// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const compat = new FlatCompat({
//   baseDirectory: __dirname,
//   recommendedConfig: js.configs.recommended,
// });

export default [
  // Base JS configuration
  js.configs.recommended,

  // Set global environments
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },

  // TypeScript configuration
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      // TypeScript-specific rules
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "no-console": ["warn", { allow: ["warn", "error", "info"] }]
    },
  },

  // JSON configuration
  {
    files: ["**/*.json"],
    plugins: { json },
    languageOptions: { parser: json.parser },
    rules: {
      ...json.configs.recommended.rules,
    },
  },

  // Config directory specific rules
  {
    files: ["config/**/*.ts"],
    rules: {
      // Less strict rules for config files
      "no-console": "off",
    },
  },
];
