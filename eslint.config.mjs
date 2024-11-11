import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint"
import eslintPluginElectron from "eslint-plugin-electron";
import eslintPluginPrettier from 'eslint-config-prettier';


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {ignores: [".git/, node_modules/**", "dist/**", "app/scripts/libs/**", "app/vendor/**"]},
  {languageOptions: { globals: globals.browser, ecmaVersion: 'latest', sourceType: 'module' }},
  {
    plugins: {
      prettier: eslintPluginPrettier,
      electron: eslintPluginElectron,
    },
  },
  {rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
  }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginElectron.configs.recommended,
  eslintPluginPrettier,
];
