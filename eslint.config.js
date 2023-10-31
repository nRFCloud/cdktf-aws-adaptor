import tsParser from "@typescript-eslint/parser";
import js from "@eslint/js"
import ts from "@typescript-eslint/eslint-plugin"

/**
 * @type {import('eslint').Linter.FlatConfig}
 */
export default [
    {
        plugins: {
            ts
        }
    },
    ts.configs["recommended"],
    js.configs.recommended,
    {
        files: ["src/**/*.ts"],
        parser: tsParser,
    },
];
