import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      // Règles expérimentales de eslint-plugin-react-hooks v7 : rejetent des patterns
      // très courants (garde d’hydratation, modales shadcn, thème, etc.).
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "react-hooks/purity": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  globalIgnores([
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "public/**",
    "*.config.js",
    "*.config.mjs",
    "walkthrough.md",
  ]),
])
