import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        process: "readonly",
        module: "readonly",
        exports: "readonly"
      },
      ecmaVersion: "latest",
      sourceType: "module"
    },

    ...pluginJs.configs.recommended,
    
    rules: {
      "no-extra-parens": "error",
      "no-extra-semi": "error",
      "no-irregular-whitespace": "error",
      "no-console": "off",
      "eqeqeq": "error",
      "curly": "error",
      "semi": ["error", "always"],
      "dot-notation": "error",
      "no-alert": "warn",
      "quotes": ["error", "double"]
    }
  }
];