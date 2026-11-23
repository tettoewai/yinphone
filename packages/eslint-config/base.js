import babelParser from "@babel/eslint-parser"
import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import onlyWarn from "eslint-plugin-only-warn"
import turboPlugin from "eslint-plugin-turbo"

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  {
    // Flat config only lints files matched by a `files` pattern. Without this
    // the TypeScript sources are skipped, and ESLint reports
    // "File ignored because no matching configuration was supplied."
    files: ["**/*.{ts,tsx}"],
    // The core rules can't see through type annotations (`no-undef` flags every
    // interface, `no-unused-vars` every type-only import), so they are left to
    // `tsc --noEmit`, which already covers both.
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
    },
  },
  {
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          // Babel 8's TS preset no longer enables JSX for .tsx on its own, so
          // the parser plugins are requested explicitly.
          parserOpts: { plugins: ["typescript", "jsx"] },
        },
      },
    },
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ["dist/**"],
  },
]
