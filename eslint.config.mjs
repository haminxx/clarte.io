import coreWebVitals from "eslint-config-next/core-web-vitals"

/** Pragmatic overrides: Next/React Compiler rules are strict; codebase predates them. */
const relaxedRules = {
  "react-hooks/set-state-in-effect": "warn",
  "react-hooks/refs": "warn",
  "react-hooks/purity": "warn",
  "react-hooks/rules-of-hooks": "warn",
  "@next/next/no-img-element": "warn",
  "import/no-anonymous-default-export": "warn",
  "react-hooks/exhaustive-deps": "warn",
}

const eslintConfig = [
  {
    ignores: [".next/**", "out/**", "node_modules/**", "apps/**"],
  },
  ...coreWebVitals,
  {
    rules: relaxedRules,
  },
]

export default eslintConfig
