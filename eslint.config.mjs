import path from "node:path";
import { fileURLToPath } from "node:url";

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  globalIgnores([
    "**/node_modules/**",
    "**/dist/**",
    "apps/frontend/dist",
    "apps/backend/src/generated/**",
    "apps/backend/eslint.config.ts",
    "apps/frontend/eslint.config.js",
  ]),
  {
    files: ["apps/backend/**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended", ...tseslint.configs.recommended],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: path.join(rootDir, "apps/backend"),
      },
    },
  },
  {
    files: ["apps/frontend/**/*.{js,mjs,cjs,ts,mts,cts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: path.join(rootDir, "apps/frontend"),
      },
    },
  },
  {
    files: ["apps/frontend/src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["packages/api/**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended", ...tseslint.configs.recommended],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: path.join(rootDir, "packages/api"),
      },
    },
  },
]);
