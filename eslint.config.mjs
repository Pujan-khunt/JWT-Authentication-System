import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  {
    rules: {
      "no-extra-parens": "error",
      "no-extra-semi": "error",
      "no-unused-vars": "warn",
      "no-irregular-whitespace": "error",
      "no-console": "off",
      "eqeqeq": "error",
      "curly": "error",
      "semi": ["error", "always"],
      "dot-notation": "error",
      "no-alert": "warn",
    }
  }
];